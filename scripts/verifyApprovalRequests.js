/**
 * Exercises the approval engine against a REAL database — the transitions,
 * the permission checks and the transaction all run for real, because the
 * things most likely to be wrong here (a step advancing twice, a rejection not
 * ending the request, someone signing a rung that is not theirs) are exactly
 * what a stubbed model would not catch.
 *
 *   DB_HOST=127.0.0.1 DB_PORT=3399 DB_USER=root DB_PASS= DB_NAME=iam_test \
 *     node scripts/verifyApprovalRequests.js
 *
 * It creates its own chain/roles/assignments in whatever database it is pointed
 * at and deletes them again, so never point it at production.
 */
const {
  db, Role, RoleAssignment, ApprovalChain, ApprovalStep, ApprovalRequest, ApprovalDecision,
} = require('../src/models');
const svc = require('../src/services/approvalRequestService');

let failures = 0;
const check = (label, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
};
// CustomError carries `errorCode`, not `code` — reading the wrong one makes
// every correctly-thrown error look like a failure.
const expectThrow = async (label, fn, codeOrText) => {
  try { await fn(); check(label, false, 'did not throw'); } catch (e) {
    const msg = `${e.errorCode || ''} ${e.message || ''}`;
    check(label, !codeOrText || msg.includes(codeOrText), msg.trim());
  }
};

const RT = 'test.twoStep';
const SUBJ = 'testEmployee';

(async () => {
  await db.sync();

  // Clean slate for this fixture only.
  const wipe = async () => {
    const reqs = await ApprovalRequest.findAll({ where: { requestType: RT } });
    await ApprovalDecision.destroy({ where: { requestId: reqs.map((r) => r.id) } });
    await ApprovalRequest.destroy({ where: { requestType: RT } });
    const chs = await ApprovalChain.findAll({ where: { requestType: RT } });
    await ApprovalStep.destroy({ where: { chainId: chs.map((c) => c.id) } });
    await ApprovalChain.destroy({ where: { requestType: RT } });
    const roles = await Role.findAll({ where: { key: ['test-mgr', 'test-admin', 'test-super', 'test-none'] } });
    await RoleAssignment.destroy({ where: { roleId: roles.map((r) => r.id) } });
    await Role.destroy({ where: { key: ['test-mgr', 'test-admin', 'test-super', 'test-none'] } });
  };
  await wipe();

  const mgrRole = await Role.create({ key: 'test-mgr', name: 'Test manager' });
  const admRole = await Role.create({ key: 'test-admin', name: 'Test admin' });
  const supRole = await Role.create({ key: 'test-super', name: 'Test super', isSuperAdmin: true });

  const MGR = 'p-manager'; const ADM = 'p-admin'; const SUP = 'p-super';
  const OUTSIDER = 'p-outsider'; const REQUESTER = 'p-hr';
  await RoleAssignment.create({ principalId: MGR, roleId: mgrRole.id });
  await RoleAssignment.create({ principalId: ADM, roleId: admRole.id });
  await RoleAssignment.create({ principalId: SUP, roleId: supRole.id });

  const chain = await ApprovalChain.create({ key: 'test.chain', name: 'Test chain', requestType: RT });
  await ApprovalStep.bulkCreate([
    { chainId: chain.id, stepOrder: 1, name: 'Manager', approverRoleId: mgrRole.id },
    { chainId: chain.id, stepOrder: 2, name: 'Administrator', approverRoleId: admRole.id },
  ]);

  // ── opening ──────────────────────────────────────────────────────────────
  let req = await svc.open({
    requestType: RT, subjectType: SUBJ, subjectId: 'e1', requestedByPrincipalId: REQUESTER,
  });
  check('opens on the governing chain at step 1',
    req.status === 'pending' && req.currentStepOrder === 1, `${req.status}/${req.currentStepOrder}`);

  await expectThrow('a second request for the same subject is refused',
    () => svc.open({ requestType: RT, subjectType: SUBJ, subjectId: 'e1' }), 'CONFLICT');

  await expectThrow('an unconfigured requestType refuses rather than auto-approving',
    () => svc.open({ requestType: 'test.noChain', subjectType: SUBJ, subjectId: 'e9' }),
    'NO_APPROVAL_CHAIN');

  // ── who may sign ─────────────────────────────────────────────────────────
  await expectThrow('someone with no role cannot decide',
    () => svc.decide(req.id, { decision: 'approved' }, OUTSIDER), 'FORBIDDEN');

  await expectThrow('the step-2 approver cannot sign step 1 out of order',
    () => svc.decide(req.id, { decision: 'approved' }, ADM), 'FORBIDDEN');

  // ── walking the chain ────────────────────────────────────────────────────
  req = await svc.decide(req.id, { decision: 'approved', note: 'ok by me' }, MGR);
  check('step 1 approval advances to step 2, still pending',
    req.status === 'pending' && req.currentStepOrder === 2, `${req.status}/${req.currentStepOrder}`);

  await expectThrow('the step-1 approver cannot then sign step 2',
    () => svc.decide(req.id, { decision: 'approved' }, MGR), 'FORBIDDEN');

  req = await svc.decide(req.id, { decision: 'approved' }, ADM);
  check('the final step approves the whole request',
    req.status === 'approved' && req.currentStepOrder === null && req.decidedAt,
    `${req.status}/${req.currentStepOrder}`);
  check('both signatures are recorded in order',
    req.decisions.length === 2 && req.decisions[0].stepOrder === 1 && req.decisions[1].stepOrder === 2);
  check('the note is kept', req.decisions[0].note === 'ok by me');

  await expectThrow('a finished request cannot be decided again',
    () => svc.decide(req.id, { decision: 'approved' }, ADM), 'CONFLICT');

  // ── rejection ends it ────────────────────────────────────────────────────
  let rej = await svc.open({ requestType: RT, subjectType: SUBJ, subjectId: 'e2', requestedByPrincipalId: REQUESTER });
  rej = await svc.decide(rej.id, { decision: 'rejected', note: 'missing paperwork' }, MGR);
  check('ONE rejection ends the request immediately',
    rej.status === 'rejected' && rej.currentStepOrder === null, `${rej.status}/${rej.currentStepOrder}`);
  check('it does not continue to step 2', rej.decisions.length === 1);

  // ── super-admin fallback ─────────────────────────────────────────────────
  let sup = await svc.open({ requestType: RT, subjectType: SUBJ, subjectId: 'e3' });
  sup = await svc.decide(sup.id, { decision: 'approved' }, SUP);
  sup = await svc.decide(sup.id, { decision: 'approved' }, SUP);
  check('a super-admin can clear a chain whose approver roles have no holder',
    sup.status === 'approved', sup.status);

  // ── requiredApprovals ────────────────────────────────────────────────────
  await ApprovalStep.update({ requiredApprovals: 2 }, { where: { chainId: chain.id, stepOrder: 1 } });
  let two = await svc.open({ requestType: RT, subjectType: SUBJ, subjectId: 'e4' });
  two = await svc.decide(two.id, { decision: 'approved' }, MGR);
  check('a step needing 2 signatures does not advance on 1',
    two.currentStepOrder === 1, `at step ${two.currentStepOrder}`);
  await expectThrow('the same person cannot sign the same step twice',
    () => svc.decide(two.id, { decision: 'approved' }, MGR), 'CONFLICT');
  two = await svc.decide(two.id, { decision: 'approved' }, SUP);
  check('a second distinct signature advances it', two.currentStepOrder === 2, `at step ${two.currentStepOrder}`);
  await ApprovalStep.update({ requiredApprovals: 1 }, { where: { chainId: chain.id, stepOrder: 1 } });

  // ── the inbox ────────────────────────────────────────────────────────────
  const mgrInbox = await svc.listPendingFor(MGR);
  const admInbox = await svc.listPendingFor(ADM);
  const outInbox = await svc.listPendingFor(OUTSIDER);
  check('the inbox shows only what THIS principal may sign now',
    mgrInbox.data.every((r) => r.currentStepOrder === 1)
    && admInbox.data.every((r) => r.currentStepOrder === 2),
    `mgr=${mgrInbox.totalCount} adm=${admInbox.totalCount}`);
  check('someone with no role has an empty inbox', outInbox.totalCount === 0);

  // ── the question a consuming service asks ────────────────────────────────
  const st = await svc.statusForSubject(SUBJ, 'e1', RT);
  check('statusForSubject reports approved for the finished one', st.status === 'approved', st.status);
  const none = await svc.statusForSubject(SUBJ, 'nobody', RT);
  check('and "none" when nothing was ever opened', none.status === 'none', none.status);

  // ── cancel ───────────────────────────────────────────────────────────────
  let can = await svc.open({ requestType: RT, subjectType: SUBJ, subjectId: 'e5', requestedByPrincipalId: REQUESTER });
  await expectThrow('a stranger cannot cancel someone else\'s request',
    () => svc.cancel(can.id, OUTSIDER), 'FORBIDDEN');
  can = await svc.cancel(can.id, REQUESTER, 'withdrawn');
  check('the requester can cancel their own', can.status === 'cancelled', can.status);

  await wipe();
  await db.close();
  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('HARNESS ERROR:', e); process.exit(1); });

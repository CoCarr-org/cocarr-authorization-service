const { Op } = require('sequelize');
const { CustomError } = require('../middlewares/error');
const {
  ApprovalRequest, ApprovalDecision, ApprovalChain, ApprovalStep, Role, db,
} = require('../models');
const chains = require('./approvalChainService');
const resolution = require('./resolutionService');
const audit = require('./auditService');

// THE APPROVAL ENGINE. Chains described a process; this runs one.
//
// A request opens on the chain that governs its requestType, sits at step 1, and
// advances one rung per satisfied step until the last one clears. Only then is
// it `approved` — which is the signal a consuming service waits for before doing
// the irreversible thing. For workspace onboarding that thing is minting the
// employee code and creating the Firebase staff login.
//
// WHAT THIS DELIBERATELY DOES NOT DO: perform the side effect itself. IAM knows
// who may sign and whether they have; it does not know how to create an
// employee. The consuming service asks "is there an approved request for this
// subject?" and acts on the answer. That keeps the irreversible step in the
// service that owns the data, and means a lost HTTP response cannot leave IAM
// saying approved while no employee exists.

const OPEN_STATUS = 'pending';

const withDetail = {
  include: [
    { model: ApprovalDecision, as: 'decisions' },
    {
      model: ApprovalChain,
      include: [{
        model: ApprovalStep,
        as: 'steps',
        include: [{ model: Role, as: 'approverRole', attributes: ['id', 'key', 'name'] }],
      }],
    },
  ],
  // Ordered by STEP first, timestamp only to break ties within a step.
  //
  // createdAt alone is not enough: the column is a plain MySQL DATETIME with no
  // fractional seconds, so two decisions taken in the same second compare equal
  // and come back in whatever order the engine feels like. That made the trail
  // read out of sequence — and `decisions[0]` is what a UI shows as "first
  // approver". Step order is the meaningful sequence anyway.
  order: [
    [{ model: ApprovalDecision, as: 'decisions' }, 'stepOrder', 'ASC'],
    [{ model: ApprovalDecision, as: 'decisions' }, 'createdAt', 'ASC'],
  ],
};

async function getById(id) {
  const req = await ApprovalRequest.findByPk(id, withDetail);
  if (!req) throw new CustomError('Approval request not found', 404, 'NOT_FOUND');
  return req;
}

function stepsOf(request) {
  const list = request.approvalChain?.steps || [];
  return [...list].sort((a, b) => a.stepOrder - b.stepOrder);
}

function currentStep(request) {
  if (request.status !== OPEN_STATUS) return null;
  return stepsOf(request).find((s) => s.stepOrder === request.currentStepOrder) || null;
}

// May this principal sign the rung the request is sitting on?
//
// A super-admin may. That is not a courtesy: without it, a chain whose approver
// role has no holder is a request nobody on earth can move, and the only way out
// would be editing the database.
async function canDecide(request, principalId) {
  const step = currentStep(request);
  if (!step) return { allowed: false, reason: 'This request is not waiting on a decision' };
  if (step.approverPrincipalId && step.approverPrincipalId === principalId) {
    return { allowed: true, step, reason: 'named approver' };
  }
  const eff = await resolution.effective(principalId);
  if (eff.superAdmin) return { allowed: true, step, reason: 'super-admin' };
  if (step.approverRoleId && eff.roles.some((r) => r.id === step.approverRoleId)) {
    return { allowed: true, step, reason: 'holds the approver role' };
  }
  return { allowed: false, step, reason: `Step "${step.name}" is not yours to decide` };
}

// Open a request against the chain governing this requestType.
//
// A MISSING CHAIN IS A REFUSAL, not an auto-approval. Approval is a control, and
// "nobody configured a chain" is the one circumstance where waving something
// through is most likely to be wrong — it is the same fail-open shape this
// service closed in authentication. The error names the requestType so whoever
// hits it knows exactly which chain to seed.
async function open({
  requestType, subjectType, subjectId, organizationId = null,
  requestedByPrincipalId = null, summary = null, metadata = null,
}) {
  if (!requestType || !subjectType || !subjectId) {
    throw new CustomError('requestType, subjectType and subjectId are required', 400, 'VALIDATION_ERROR');
  }

  const existing = await ApprovalRequest.findOne({
    where: { subjectType, subjectId, requestType, status: OPEN_STATUS },
  });
  if (existing) {
    throw new CustomError('This subject already has an approval request in flight', 409, 'CONFLICT');
  }

  const chain = await chains.forRequestType(requestType, organizationId);
  if (!chain) {
    throw new CustomError(
      `No active approval chain is configured for "${requestType}"`, 409, 'NO_APPROVAL_CHAIN',
    );
  }
  const steps = [...(chain.steps || [])].sort((a, b) => a.stepOrder - b.stepOrder);
  if (steps.length === 0) {
    throw new CustomError(
      `Approval chain "${chain.key}" has no steps, so nothing could ever approve this`,
      409, 'EMPTY_APPROVAL_CHAIN',
    );
  }

  const request = await ApprovalRequest.create({
    chainId: chain.id,
    requestType,
    subjectType,
    subjectId,
    organizationId,
    requestedByPrincipalId,
    summary,
    metadata,
    status: OPEN_STATUS,
    currentStepOrder: steps[0].stepOrder,
  });

  await audit.log({
    actorUid: requestedByPrincipalId,
    action: 'approvalRequest.open',
    targetType: 'approvalRequest',
    targetId: request.id,
    changes: { requestType, subjectType, subjectId, chainKey: chain.key, steps: steps.length },
  });

  return getById(request.id);
}

// Record one signature and move the request, or finish it.
//
// The whole transition runs in ONE transaction with the decision row, so a
// request can never show a recorded approval while still sitting on the step it
// approved — which is what would let a second approver sign the same rung.
async function decide(id, { decision, note = null }, principalId) {
  if (!['approved', 'rejected'].includes(decision)) {
    throw new CustomError('decision must be "approved" or "rejected"', 400, 'VALIDATION_ERROR');
  }
  if (!principalId) throw new CustomError('No acting principal', 401, 'UNAUTHENTICATED');

  const request = await getById(id);
  if (request.status !== OPEN_STATUS) {
    throw new CustomError(`This request is already ${request.status}`, 409, 'CONFLICT');
  }

  const verdict = await canDecide(request, principalId);
  if (!verdict.allowed) throw new CustomError(verdict.reason, 403, 'FORBIDDEN');
  const step = verdict.step;

  const steps = stepsOf(request);
  const already = (request.decisions || []).filter(
    (d) => d.stepOrder === step.stepOrder && d.decision === 'approved',
  );
  if (already.some((d) => d.decidedByPrincipalId === principalId)) {
    throw new CustomError('You have already decided this step', 409, 'CONFLICT');
  }

  await db.transaction(async (tx) => {
    await ApprovalDecision.create({
      requestId: request.id,
      stepId: step.id,
      stepOrder: step.stepOrder,
      stepName: step.name,
      decision,
      decidedByPrincipalId: principalId,
      note,
    }, { transaction: tx });

    // ONE REJECTION ENDS IT. A rejected step is a refusal of the request, not a
    // vote to be outweighed — carrying on to later approvers would ask them to
    // overrule a decision they cannot see.
    if (decision === 'rejected') {
      await request.update(
        { status: 'rejected', currentStepOrder: null, decidedAt: new Date() },
        { transaction: tx },
      );
      return;
    }

    // `requiredApprovals` lets a step need more than one signature; only when it
    // is satisfied does the request move on.
    const approvalsNow = already.length + 1;
    if (approvalsNow < (step.requiredApprovals || 1)) return;

    const next = steps.find((s) => s.stepOrder > step.stepOrder);
    if (next) {
      await request.update({ currentStepOrder: next.stepOrder }, { transaction: tx });
    } else {
      await request.update(
        { status: 'approved', currentStepOrder: null, decidedAt: new Date() },
        { transaction: tx },
      );
    }
  });

  const fresh = await getById(id);
  await audit.log({
    actorUid: principalId,
    action: `approvalRequest.${decision}`,
    targetType: 'approvalRequest',
    targetId: id,
    changes: {
      stepOrder: step.stepOrder, stepName: step.name, note, outcome: fresh.status,
    },
  });
  return fresh;
}

async function cancel(id, principalId, note = null) {
  const request = await getById(id);
  if (request.status !== OPEN_STATUS) {
    throw new CustomError(`This request is already ${request.status}`, 409, 'CONFLICT');
  }
  // The requester may withdraw their own; a super-admin may withdraw any.
  const eff = await resolution.effective(principalId);
  if (request.requestedByPrincipalId !== principalId && !eff.superAdmin) {
    throw new CustomError('Only the requester can cancel this request', 403, 'FORBIDDEN');
  }
  await request.update({ status: 'cancelled', currentStepOrder: null, decidedAt: new Date() });
  await audit.log({
    actorUid: principalId,
    action: 'approvalRequest.cancel',
    targetType: 'approvalRequest',
    targetId: id,
    changes: { note },
  });
  return getById(id);
}

async function list({
  status, requestType, subjectType, subjectId, offset = 0, limit = 25,
} = {}) {
  const where = {};
  if (status) where.status = status;
  if (requestType) where.requestType = requestType;
  if (subjectType) where.subjectType = subjectType;
  if (subjectId) where.subjectId = subjectId;
  const data = await ApprovalRequest.findAll({
    where, ...withDetail, order: [['createdAt', 'DESC']],
    offset: parseInt(offset, 10) || 0, limit: parseInt(limit, 10) || 25,
  });
  return { data, totalCount: await ApprovalRequest.count({ where }) };
}

// Everything waiting on THIS principal — the approver's inbox.
//
// Resolved by asking each pending request whether this principal may decide it,
// rather than by querying roles into SQL: `canDecide` already encodes named
// approvers, role holders and the super-admin fallback, and a second copy of
// that rule in a WHERE clause is how an inbox comes to disagree with the button
// it is offering.
async function listPendingFor(principalId, { limit = 100 } = {}) {
  const open = await ApprovalRequest.findAll({
    where: { status: OPEN_STATUS }, ...withDetail, order: [['createdAt', 'ASC']], limit,
  });
  const out = [];
  for (const r of open) {
    // eslint-disable-next-line no-await-in-loop
    const verdict = await canDecide(r, principalId);
    if (verdict.allowed) out.push(r);
  }
  return { data: out, totalCount: out.length };
}

// The question a consuming service asks before doing the irreversible thing.
async function statusForSubject(subjectType, subjectId, requestType = null) {
  const where = { subjectType, subjectId };
  if (requestType) where.requestType = requestType;
  const latest = await ApprovalRequest.findOne({ where, ...withDetail, order: [['createdAt', 'DESC']] });
  return {
    subjectType,
    subjectId,
    status: latest ? latest.status : 'none',
    requestId: latest ? latest.id : null,
    request: latest,
  };
}

module.exports = {
  open, decide, cancel, list, listPendingFor, getById, statusForSubject, canDecide,
};

// Exercises bootstrapOwnerService against stubbed models — no MySQL needed.
// The behaviours that matter: it grants the owner super-admin, it does not
// grant anyone else, it does not duplicate, it RESTORES a revoked or expired
// assignment (the lockout guarantee), and it never throws.
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SVC = path.join(ROOT, 'src/services/bootstrapOwnerService.js');

let rows = [];
let roleRow = { id: 'role-super', key: 'super-admin' };
let logs = [];

function stub(id, exports) {
  const full = require.resolve(id, { paths: [path.join(ROOT, 'src/services')] });
  require.cache[full] = { id: full, filename: full, loaded: true, exports };
}

function matchesActive(r, where) {
  if (r.principalId !== where.principalId || r.roleId !== where.roleId) return false;
  if (r.revokedAt !== null) return false;
  return r.expiresAt === null || r.expiresAt > new Date();
}

function install() {
  stub('../models', {
    Role: { findOne: async ({ where }) => (roleRow && roleRow.key === where.key ? roleRow : null) },
    RoleAssignment: {
      findOne: async ({ where }) => rows.find((r) => matchesActive(r, where)) || null,
      // `revokedAt` is allowNull with no default on the model, so a create that
      // omits it stores NULL. The stub has to do the same or an inserted row
      // looks revoked.
      create: async (v) => { const r = { revokedAt: null, ...v, id: `a${rows.length}` }; rows.push(r); return r; },
    },
  });
  stub('./auditService', { log: async () => {} });
  stub('../helper/logger', { info: (m) => logs.push(m), error: (m) => logs.push(m) });
}

function freshService() {
  delete require.cache[SVC];
  install();
  return require(SVC);
}

let failures = 0;
const check = (label, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
};

const OWNER = 'cocarrluxury23@gmail.com';

(async () => {
  // 1 — a non-owner never gets an assignment
  rows = []; let svc = freshService();
  await svc.ensure({ uid: 'u1', email: 'someone@else.com', identityId: 'id-1' });
  check('a non-owner email writes nothing', rows.length === 0);

  // 2 — the owner gets a never-expiring super-admin assignment
  rows = []; svc = freshService();
  await svc.ensure({ uid: 'u2', email: OWNER, identityId: 'id-owner' });
  check('the owner is granted super-admin', rows.length === 1 && rows[0].roleId === 'role-super', JSON.stringify(rows[0]));
  check('the grant never expires', rows[0] && rows[0].expiresAt === null);
  check('it is attributed to the system, not a user', rows[0] && rows[0].grantedByUid === 'system:bootstrap-owner');
  check('it is keyed on the identity id, not the firebase uid', rows[0] && rows[0].principalId === 'id-owner');

  // 3 — repeat requests do not duplicate it
  await svc.ensure({ uid: 'u2', email: OWNER, identityId: 'id-owner' });
  await svc.ensure({ uid: 'u2', email: OWNER, identityId: 'id-owner' });
  check('repeat logins create no duplicate', rows.length === 1, `${rows.length} rows`);

  // 4 — THE LOCKOUT GUARANTEE: revoke it, and a fresh process restores it
  rows[0].revokedAt = new Date();
  svc = freshService(); // new process => the write-avoidance cache is empty
  await svc.ensure({ uid: 'u2', email: OWNER, identityId: 'id-owner' });
  const live = rows.filter((r) => r.revokedAt === null);
  check('a REVOKED owner assignment is restored on next login', live.length === 1, `${rows.length} total, ${live.length} active`);

  // 5 — an EXPIRED one is likewise restored
  rows = [{ id: 'old', principalId: 'id-owner', roleId: 'role-super', revokedAt: null, expiresAt: new Date(Date.now() - 60000) }];
  svc = freshService();
  await svc.ensure({ uid: 'u2', email: OWNER, identityId: 'id-owner' });
  check('an EXPIRED owner assignment is restored', rows.length === 2 && rows[1].expiresAt === null);

  // 6 — falls back to the firebase uid before the identity row exists
  rows = []; svc = freshService();
  await svc.ensure({ uid: 'fb-uid', email: OWNER, identityId: null });
  check('falls back to the firebase uid when identityId is absent', rows.length === 1 && rows[0].principalId === 'fb-uid');

  // 7 — case and whitespace in the email do not defeat it
  rows = []; svc = freshService();
  await svc.ensure({ uid: 'u3', email: '  CoCarrLuxury23@GMail.com ', identityId: 'id-owner' });
  check('the email compare is case- and whitespace-insensitive', rows.length === 1);

  // 8 — no super-admin role seeded: logs and does not throw
  rows = []; roleRow = null; logs = []; svc = freshService();
  const r8 = await svc.ensure({ uid: 'u4', email: OWNER, identityId: 'id-owner' });
  check('a missing super-admin role does not throw', r8 === false && rows.length === 0);
  check('and it names the seed script to run', logs.some((m) => m.includes('seedTaxonomy.js')), logs.join(' | '));
  roleRow = { id: 'role-super', key: 'super-admin' };

  // 9 — a database error is swallowed, never a 500 on the request
  rows = []; svc = freshService();
  require.cache[require.resolve(path.join(ROOT, 'src/models'))].exports.Role.findOne = async () => { throw new Error('ECONNREFUSED'); };
  const r9 = await svc.ensure({ uid: 'u5', email: OWNER, identityId: 'id-owner' });
  check('a DB failure is swallowed (auth must not 500)', r9 === false);

  // 10 — a missing/!nullish actor is safe
  svc = freshService();
  check('null actor is safe', (await svc.ensure(null)) === false);
  check('actor with no email is safe', (await svc.ensure({ uid: 'x' })) === false);

  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();

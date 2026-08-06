const { Op } = require('sequelize');
const { RoleAssignment, Role } = require('../models');
const audit = require('./auditService');
const Logger = require('../helper/logger');

// BOOTSTRAP OWNER — the account that can never lock itself out.
//
// This IAM has no other way in. Every permission comes from a role assignment,
// and assignments are created through authenticated endpoints that themselves
// require a permission — so a freshly seeded database, where nobody holds a
// role, is administrable by nobody. That is the state this platform was
// actually in: 171 permissions and 8 roles seeded, zero assignments.
//
// The fix is the same shape as cocarr-core-api's `ensureBootstrapSuperAdmin`: a
// single configured email that is guaranteed to hold super-admin. The
// difference is WHEN it runs. core-api can do it at boot because it owns the
// admins table and can look an email up. This service deliberately holds no
// identity data — `principalId` is an opaque string from the Identity service,
// with no cross-service FK and no email column anywhere — so there is nothing
// to resolve an email against at boot.
//
// So it runs at AUTHENTICATION time instead, where the email arrives on the
// request (minted by the gateway, or read off the verified Firebase token) next
// to the principal id it belongs to. The first time the owner authenticates,
// their super-admin assignment is created; every subsequent request re-checks
// it. That re-check is the point — a revoked or expired assignment is restored
// on the owner's next request, so an editing mistake in the IAM UI cannot
// permanently lock the platform's owner out of it.
//
// It creates a REAL roleAssignment rather than special-casing resolution. A
// hidden rule that grants access without a row would be invisible in the
// assignments list and in `/principals/:id/navigation` — the two places someone
// looks to answer "why does this person have this?" — and would make the owner
// the one principal whose access could not be explained by the data.

const OWNER_EMAIL = String(process.env.BOOTSTRAP_OWNER_EMAIL || 'cocarrluxury23@gmail.com').trim().toLowerCase();
const SUPER_ADMIN_ROLE_KEY = 'super-admin';

// Principals already confirmed this process. Purely a write-avoidance cache:
// without it every request from the owner costs two queries. It is never
// consulted to GRANT anything — resolution always reads the real assignment —
// so a stale entry can only cost a skipped re-check until the next restart.
const ensured = new Set();

function isOwnerEmail(email) {
  return Boolean(email) && String(email).trim().toLowerCase() === OWNER_EMAIL;
}

// Ensures the owner holds an active, non-expiring super-admin assignment.
// NEVER throws: this runs inside authentication, and a failure here must not
// turn into a 500 on a request that was otherwise perfectly valid.
async function ensure(actor) {
  try {
    if (!actor || !isOwnerEmail(actor.email)) return false;

    // `identityId` is absent until POST /v1/auth/verify has created the identity
    // row, so the uid is the principal until then — the same fallback
    // navigationController uses. Both get an assignment if the owner signs in
    // before and after that point; resolution reads whichever is in force.
    const principalId = actor.identityId || actor.uid;
    if (!principalId) return false;
    if (ensured.has(principalId)) return false;

    const role = await Role.findOne({ where: { key: SUPER_ADMIN_ROLE_KEY } });
    if (!role) {
      Logger.error(
        `[bootstrap-owner] The '${SUPER_ADMIN_ROLE_KEY}' role does not exist, so ${OWNER_EMAIL} cannot be`
        + ' granted anything. Run: node scripts/seedTaxonomy.js --confirm',
      );
      return false;
    }

    const existing = await RoleAssignment.findOne({
      where: {
        principalId,
        roleId: role.id,
        revokedAt: null,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
      },
    });
    if (existing) { ensured.add(principalId); return false; }

    await RoleAssignment.create({
      principalId,
      roleId: role.id,
      scope: null,
      organizationId: null,
      expiresAt: null, // never expires — this is the account that must not lock out
      reason: `bootstrap owner (${OWNER_EMAIL})`,
      grantedByUid: 'system:bootstrap-owner',
    });
    ensured.add(principalId);

    await audit.log({
      actorUid: 'system:bootstrap-owner',
      action: 'assignment.bootstrap',
      targetType: 'principal',
      targetId: principalId,
      changes: { roleId: role.id, roleKey: SUPER_ADMIN_ROLE_KEY, email: OWNER_EMAIL },
    });
    Logger.info(`[bootstrap-owner] Granted ${SUPER_ADMIN_ROLE_KEY} to ${OWNER_EMAIL} (principal ${principalId}).`);
    return true;
  } catch (err) {
    Logger.error(`[bootstrap-owner] Could not ensure the owner assignment: ${err.message}`);
    return false;
  }
}

module.exports = {
  ensure, isOwnerEmail, OWNER_EMAIL, SUPER_ADMIN_ROLE_KEY,
};

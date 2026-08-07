const { Op } = require('sequelize');
const { CustomError } = require('../middlewares/error');
const { RoleAssignment, Role } = require('../models');
const audit = require('./auditService');
const bootstrapOwner = require('./bootstrapOwnerService');

// Assign a role to a principal. `expiresAt` (optional) makes it TEMPORARY ACCESS.
async function assign({
  principalId, roleId, scope, organizationId, expiresAt, reason,
}, actorUid) {
  if (!principalId || !roleId) throw new CustomError('principalId and roleId are required', 400, 'VALIDATION_ERROR');
  const role = await Role.findByPk(roleId);
  if (!role) throw new CustomError('Role not found', 404, 'NOT_FOUND');
  const assignment = await RoleAssignment.create({
    principalId,
    roleId,
    scope: scope || null,
    organizationId: organizationId || null,
    expiresAt: expiresAt || null, reason: reason || null, grantedByUid: actorUid || null,
  });
  await audit.log({ actorUid, action: 'assignment.create', targetType: 'principal', targetId: principalId, changes: { roleId, organizationId: organizationId || null, expiresAt: expiresAt || null } });
  return assignment;
}

async function revoke(id, actorUid) {
  const a = await RoleAssignment.findByPk(id);
  if (!a) throw new CustomError('Assignment not found', 404, 'NOT_FOUND');

  // THE OWNER'S SUPER-ADMIN GRANT CANNOT BE REVOKED HERE.
  //
  // bootstrapOwnerService would restore it on their very next request anyway, so
  // allowing the revoke would show a confirmation, appear to work, and silently
  // undo itself — the worst of both, because someone would believe they had
  // narrowed the owner's access. Refusing says the true thing instead.
  //
  // Enforced on the server, not just hidden in the UI: a control that only
  // exists in a screen is not a control.
  if (bootstrapOwner.isOwnerAssignment(a)) {
    throw new CustomError(
      `${bootstrapOwner.OWNER_EMAIL} is the platform owner and always holds ${bootstrapOwner.SUPER_ADMIN_ROLE_KEY}. `
      + 'This grant cannot be revoked — it is restored automatically on their next request. '
      + 'Change BOOTSTRAP_OWNER_EMAIL to move ownership.',
      409, 'OWNER_PROTECTED',
    );
  }

  await a.update({ revokedAt: new Date() });
  await audit.log({ actorUid, action: 'assignment.revoke', targetType: 'principal', targetId: a.principalId, changes: { assignmentId: id } });
  return { success: true };
}

async function listForPrincipal(principalId, { activeOnly } = {}) {
  const where = { principalId };
  if (activeOnly) { where.revokedAt = null; where[Op.or] = [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]; }
  return RoleAssignment.findAll({ where, include: [{ model: Role }], order: [['createdAt', 'DESC']] });
}

module.exports = { assign, revoke, listForPrincipal };

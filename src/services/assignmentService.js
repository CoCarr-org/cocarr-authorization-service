const { Op } = require('sequelize');
const { CustomError } = require('../middlewares/error');
const { RoleAssignment, Role } = require('../models');
const audit = require('./auditService');

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

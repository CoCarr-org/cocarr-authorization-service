const { CustomError } = require('../middlewares/error');
const { Delegation, Role } = require('../models');
const audit = require('./auditService');

async function create({ fromPrincipalId, toPrincipalId, roleId, startsAt, expiresAt, reason }, actorUid) {
  if (!fromPrincipalId || !toPrincipalId || !roleId) throw new CustomError('fromPrincipalId, toPrincipalId and roleId are required', 400, 'VALIDATION_ERROR');
  const role = await Role.findByPk(roleId);
  if (!role) throw new CustomError('Role not found', 404, 'NOT_FOUND');
  const d = await Delegation.create({ fromPrincipalId, toPrincipalId, roleId, startsAt: startsAt || new Date(), expiresAt: expiresAt || null, reason: reason || null });
  await audit.log({ actorUid, action: 'delegation.create', targetType: 'principal', targetId: toPrincipalId, changes: { fromPrincipalId, roleId, expiresAt: expiresAt || null } });
  return d;
}
async function revoke(id, actorUid) {
  const d = await Delegation.findByPk(id);
  if (!d) throw new CustomError('Delegation not found', 404, 'NOT_FOUND');
  await d.update({ revokedAt: new Date() });
  await audit.log({ actorUid, action: 'delegation.revoke', targetType: 'principal', targetId: d.toPrincipalId, changes: { delegationId: id } });
  return { success: true };
}
async function list({ toPrincipalId, fromPrincipalId } = {}) {
  const where = {};
  if (toPrincipalId) where.toPrincipalId = toPrincipalId;
  if (fromPrincipalId) where.fromPrincipalId = fromPrincipalId;
  const data = await Delegation.findAll({ where, order: [['createdAt', 'DESC']] });
  return { data, totalCount: data.length };
}
module.exports = { create, revoke, list };

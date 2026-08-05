const { Op } = require('sequelize');
const { RoleAssignment, Delegation, Role, Permission, Policy } = require('../models');

// PERMISSION RESOLUTION — the one answer to "what may this principal do?".
// Steps: active role assignments + active delegations -> roles -> permissions,
// then apply policies (allow adds, DENY WINS). A super-admin role short-circuits
// to "all". Temporary access and delegations are honoured via their time windows.
async function effective(principalId) {
  const now = new Date();
  const notExpired = { [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now } }] };

  const assignments = await RoleAssignment.findAll({ where: { principalId, revokedAt: null, ...notExpired } });
  const delegations = await Delegation.findAll({
    where: { toPrincipalId: principalId, revokedAt: null, startsAt: { [Op.lte]: now }, ...notExpired },
  });

  const roleIds = [...new Set([...assignments.map((a) => a.roleId), ...delegations.map((d) => d.roleId)])];
  if (roleIds.length === 0) return { principalId, superAdmin: false, roles: [], permissions: [] };

  const roles = await Role.findAll({ where: { id: roleIds }, include: [{ model: Permission, through: { attributes: [] } }] });
  const superAdmin = roles.some((r) => r.isSuperAdmin);

  const perms = new Set();
  roles.forEach((r) => (r.permissions || []).forEach((p) => perms.add(p.key)));

  // Policies matching this principal or any of its roles. Ordered by priority.
  const policies = await Policy.findAll({
    where: { isActive: true, [Op.or]: [{ principalId }, { roleId: { [Op.in]: roleIds } }] },
    order: [['priority', 'ASC']],
  });
  policies.filter((p) => p.effect === 'allow').forEach((p) => perms.add(p.permissionKey));
  policies.filter((p) => p.effect === 'deny').forEach((p) => perms.delete(p.permissionKey));

  return {
    principalId,
    superAdmin,
    roles: roles.map((r) => ({ id: r.id, key: r.key, isSuperAdmin: r.isSuperAdmin })),
    permissions: [...perms].sort(),
  };
}

// Decision point. Super-admin allows all; otherwise exact permission-key match.
async function authorize(principalId, permission) {
  if (!principalId || !permission) return { allow: false, reason: 'principalId and permission are required' };
  const eff = await effective(principalId);
  if (eff.superAdmin) return { allow: true, reason: 'super-admin' };
  const allow = eff.permissions.includes(permission);
  return { allow, reason: allow ? 'granted by role/policy' : 'no matching permission' };
}

module.exports = { effective, authorize };

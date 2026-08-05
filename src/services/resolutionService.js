const { Op } = require('sequelize');
const {
  RoleAssignment, Delegation, Role, Permission, PermissionSet, Policy,
} = require('../models');

// PERMISSION RESOLUTION — the one answer to "what may this principal do?".
//
// Steps: active role assignments + active delegations -> roles -> permissions
// (direct AND via permission sets), then apply policies (allow adds, DENY WINS).
// A super-admin role short-circuits to "all". Temporary access and delegations
// are honoured purely by their time windows — resolution filters on `now` every
// call, so nothing needs a cron to expire.
//
// PERMISSION SETS fold in HERE, and that is the whole reason the join exists: a
// set nothing consults is worse than no set at all, because it reads as a grant
// that holds. A role's permissions are the UNION of its direct permissions and
// the permissions of every ACTIVE set it holds.
//
// SCOPE: assignments may carry an `organizationId`. It is REPORTED (see
// `scopes`) but does NOT yet narrow the permission list — enforcing it means
// every call site passing the organization it is acting in, which is a
// deliberate later step. Do not describe scoped assignments as enforced.
async function effective(principalId) {
  const now = new Date();
  const notExpired = { [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now } }] };

  const assignments = await RoleAssignment.findAll({ where: { principalId, revokedAt: null, ...notExpired } });
  const delegations = await Delegation.findAll({
    where: { toPrincipalId: principalId, revokedAt: null, startsAt: { [Op.lte]: now }, ...notExpired },
  });

  const roleIds = [...new Set([...assignments.map((a) => a.roleId), ...delegations.map((d) => d.roleId)])];
  if (roleIds.length === 0) {
    return {
      principalId, superAdmin: false, roles: [], permissionSets: [], permissions: [], scopes: [],
    };
  }

  const roles = await Role.findAll({
    where: { id: roleIds },
    include: [
      { model: Permission, through: { attributes: [] } },
      {
        model: PermissionSet,
        through: { attributes: [] },
        required: false,
        include: [{ model: Permission, through: { attributes: [] } }],
      },
    ],
  });
  const superAdmin = roles.some((r) => r.isSuperAdmin);

  const perms = new Set();
  const setsHeld = new Map();
  roles.forEach((r) => {
    (r.permissions || []).forEach((p) => perms.add(p.key));
    (r.permissionSets || []).forEach((s) => {
      // An inactive set grants nothing — deactivating one must actually remove
      // access, not merely hide it from the editor.
      if (!s.isActive) return;
      setsHeld.set(s.id, { id: s.id, key: s.key, name: s.name });
      (s.permissions || []).forEach((p) => perms.add(p.key));
    });
  });

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
    permissionSets: [...setsHeld.values()],
    permissions: [...perms].sort(),
    // Reported, not enforced — see the note above.
    scopes: [...new Set(assignments.map((a) => a.organizationId).filter(Boolean))],
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

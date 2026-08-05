const { createCrudService } = require('./crudFactory');
const { CustomError } = require('../middlewares/error');
const { Role, Permission, RolePermission } = require('../models');
const audit = require('./auditService');

const crud = createCrudService({
  model: Role, entityType: 'Role', searchable: ['key', 'name'],
  allowed: ['key', 'name', 'description', 'isSuperAdmin', 'isSystem'],
});

async function getWithPermissions(id) {
  const role = await Role.findByPk(id, { include: [{ model: Permission, through: { attributes: [] } }] });
  if (!role) throw new CustomError('Role not found', 404, 'NOT_FOUND');
  return role;
}

// Replace the role's permission set with the given permission ids.
async function setPermissions(id, permissionIds, actorUid) {
  const role = await crud.getById(id);
  const ids = Array.isArray(permissionIds) ? permissionIds : [];
  await RolePermission.destroy({ where: { roleId: id } });
  await RolePermission.bulkCreate(ids.map((permissionId) => ({ roleId: id, permissionId })));
  await audit.log({ actorUid, action: 'role.setPermissions', targetType: 'role', targetId: id, changes: { permissionIds: ids } });
  return getWithPermissions(id);
}

module.exports = { ...crud, getById: getWithPermissions, setPermissions };

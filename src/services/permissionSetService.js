const { createCrudService } = require('./crudFactory');
const { CustomError } = require('../middlewares/error');
const { PermissionSet, Permission, PermissionSetPermission } = require('../models');
const audit = require('./auditService');

const crud = createCrudService({
  model: PermissionSet,
  entityType: 'PermissionSet',
  searchable: ['key', 'name'],
  allowed: ['key', 'name', 'description', 'isSystem', 'isActive'],
});

async function getWithPermissions(id) {
  const set = await PermissionSet.findByPk(id, { include: [{ model: Permission, through: { attributes: [] } }] });
  if (!set) throw new CustomError('PermissionSet not found', 404, 'NOT_FOUND');
  return set;
}

// Replace the set's contents. Every role holding this set gains or loses the
// difference immediately — resolution reads sets live, so there is no fan-out
// step to forget. That is the point of a set, and also the thing to be careful
// about: editing one is editing every role that holds it.
async function setPermissions(id, permissionIds, actorUid) {
  await crud.getById(id);
  const ids = Array.isArray(permissionIds) ? permissionIds : [];
  await PermissionSetPermission.destroy({ where: { permissionSetId: id } });
  await PermissionSetPermission.bulkCreate(ids.map((permissionId) => ({ permissionSetId: id, permissionId })));
  await audit.log({
    actorUid, action: 'permissionSet.setPermissions', targetType: 'permissionSet', targetId: id, changes: { permissionIds: ids },
  });
  return getWithPermissions(id);
}

module.exports = { ...crud, getById: getWithPermissions, setPermissions };

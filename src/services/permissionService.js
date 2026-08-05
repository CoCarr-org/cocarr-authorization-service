const { createCrudService } = require('./crudFactory');
const { Permission } = require('../models');
module.exports = createCrudService({
  model: Permission, entityType: 'Permission', searchable: ['key', 'action'],
  allowed: ['key', 'moduleId', 'subModuleId', 'action', 'description'],
});

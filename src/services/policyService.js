const { createCrudService } = require('./crudFactory');
const { Policy } = require('../models');
module.exports = createCrudService({
  model: Policy, entityType: 'Policy', searchable: ['key', 'permissionKey'], defaultSort: 'priority',
  allowed: ['key', 'effect', 'permissionKey', 'principalId', 'roleId', 'resource', 'condition', 'priority', 'isActive'],
});

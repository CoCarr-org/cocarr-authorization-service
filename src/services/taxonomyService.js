const { createCrudService } = require('./crudFactory');
const { Product, Portal, Module } = require('../models');
module.exports = {
  products: createCrudService({ model: Product, entityType: 'Product', searchable: ['key', 'name'], allowed: ['key', 'name', 'description', 'isActive'] }),
  portals: createCrudService({ model: Portal, entityType: 'Portal', searchable: ['key', 'name'], allowed: ['productId', 'key', 'name', 'description', 'isActive'] }),
  modules: createCrudService({ model: Module, entityType: 'Module', searchable: ['key', 'name'], allowed: ['portalId', 'key', 'name', 'description', 'isActive'] }),
};

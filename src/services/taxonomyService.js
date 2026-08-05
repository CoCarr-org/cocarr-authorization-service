const { createCrudService } = require('./crudFactory');
const {
  Product, Portal, Module, SubModule,
} = require('../models');

// Product > Portal > Module > SubModule. `route`/`icon`/`sortOrder` are nav
// metadata: the dynamic UI renders its sidebar from these, so they are IAM data
// edited at runtime rather than a hardcoded list in the client.
module.exports = {
  products: createCrudService({
    model: Product,
    entityType: 'Product',
    searchable: ['key', 'name'],
    allowed: ['key', 'name', 'description', 'icon', 'sortOrder', 'isActive'],
  }),
  portals: createCrudService({
    model: Portal,
    entityType: 'Portal',
    searchable: ['key', 'name'],
    allowed: ['productId', 'key', 'name', 'description', 'icon', 'sortOrder', 'isActive'],
  }),
  modules: createCrudService({
    model: Module,
    entityType: 'Module',
    searchable: ['key', 'name'],
    allowed: ['portalId', 'key', 'name', 'description', 'route', 'icon', 'sortOrder', 'isActive'],
  }),
  subModules: createCrudService({
    model: SubModule,
    entityType: 'SubModule',
    searchable: ['key', 'name', 'route'],
    allowed: ['moduleId', 'key', 'name', 'description', 'route', 'icon', 'sortOrder', 'isActive'],
  }),
};

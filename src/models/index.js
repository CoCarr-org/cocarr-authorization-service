// Register models + associations before db.sync.
const db = require('../configs/db');
const Product = require('./product');
const Portal = require('./portal');
const Module = require('./module');
const Permission = require('./permission');
const Role = require('./role');
const RolePermission = require('./rolePermission');
const RoleAssignment = require('./roleAssignment');
const Policy = require('./policy');
const Delegation = require('./delegation');
const AuditLog = require('./auditLog');

// Taxonomy
Product.hasMany(Portal, { foreignKey: 'productId' });
Portal.belongsTo(Product, { foreignKey: 'productId' });
Portal.hasMany(Module, { foreignKey: 'portalId' });
Module.belongsTo(Portal, { foreignKey: 'portalId' });
Module.hasMany(Permission, { foreignKey: 'moduleId' });
Permission.belongsTo(Module, { foreignKey: 'moduleId' });

// Role <-> Permission (many-to-many)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });

// Assignments / delegations reference roles
RoleAssignment.belongsTo(Role, { foreignKey: 'roleId' });
Delegation.belongsTo(Role, { foreignKey: 'roleId' });

module.exports = {
  db, Product, Portal, Module, Permission, Role, RolePermission, RoleAssignment, Policy, Delegation, AuditLog,
};

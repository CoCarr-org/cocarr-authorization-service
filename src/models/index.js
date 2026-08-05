// Register models + associations before db.sync.
//
// EVERY model is required HERE, explicitly, rather than being pulled in by
// whichever service happens to reference it first. cocarr-core-api lost a table
// exactly that way: a model reachable only through a chain of service requires
// was not registered when db.sync ran, so it silently never got created.
const db = require('../configs/db');
const Product = require('./product');
const Portal = require('./portal');
const Module = require('./module');
const SubModule = require('./subModule');
const Permission = require('./permission');
const PermissionSet = require('./permissionSet');
const PermissionSetPermission = require('./permissionSetPermission');
const Role = require('./role');
const RolePermission = require('./rolePermission');
const RolePermissionSet = require('./rolePermissionSet');
const RoleAssignment = require('./roleAssignment');
const Policy = require('./policy');
const Delegation = require('./delegation');
const Organization = require('./organization');
const ApprovalChain = require('./approvalChain');
const ApprovalStep = require('./approvalStep');
const FeatureFlag = require('./featureFlag');
const GlobalSetting = require('./globalSetting');
const AuditLog = require('./auditLog');

// Taxonomy: Product > Portal > Module > SubModule > Permission(action)
Product.hasMany(Portal, { foreignKey: 'productId' });
Portal.belongsTo(Product, { foreignKey: 'productId' });
Portal.hasMany(Module, { foreignKey: 'portalId' });
Module.belongsTo(Portal, { foreignKey: 'portalId' });
Module.hasMany(SubModule, { foreignKey: 'moduleId' });
SubModule.belongsTo(Module, { foreignKey: 'moduleId' });
Module.hasMany(Permission, { foreignKey: 'moduleId' });
Permission.belongsTo(Module, { foreignKey: 'moduleId' });
// A permission may hang off a sub-module (one screen) rather than the module.
SubModule.hasMany(Permission, { foreignKey: 'subModuleId' });
Permission.belongsTo(SubModule, { foreignKey: 'subModuleId' });

// Role <-> Permission (many-to-many)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });

// PermissionSet <-> Permission, and Role <-> PermissionSet. A role's effective
// permissions are the union of its direct permissions and every set it holds.
PermissionSet.belongsToMany(Permission, {
  through: PermissionSetPermission, foreignKey: 'permissionSetId', otherKey: 'permissionId',
});
Permission.belongsToMany(PermissionSet, {
  through: PermissionSetPermission, foreignKey: 'permissionId', otherKey: 'permissionSetId',
});
Role.belongsToMany(PermissionSet, {
  through: RolePermissionSet, foreignKey: 'roleId', otherKey: 'permissionSetId',
});
PermissionSet.belongsToMany(Role, {
  through: RolePermissionSet, foreignKey: 'permissionSetId', otherKey: 'roleId',
});

// Assignments / delegations reference roles
RoleAssignment.belongsTo(Role, { foreignKey: 'roleId' });
Delegation.belongsTo(Role, { foreignKey: 'roleId' });

// Organization tree (self-referencing) + optional assignment scope.
Organization.hasMany(Organization, { as: 'children', foreignKey: 'parentId' });
Organization.belongsTo(Organization, { as: 'parent', foreignKey: 'parentId' });
RoleAssignment.belongsTo(Organization, { foreignKey: 'organizationId' });

// Approval chains
ApprovalChain.hasMany(ApprovalStep, { as: 'steps', foreignKey: 'chainId' });
ApprovalStep.belongsTo(ApprovalChain, { foreignKey: 'chainId' });
ApprovalStep.belongsTo(Role, { as: 'approverRole', foreignKey: 'approverRoleId' });

module.exports = {
  db,
  Product, Portal, Module, SubModule, Permission,
  PermissionSet, PermissionSetPermission, RolePermissionSet,
  Role, RolePermission, RoleAssignment, Policy, Delegation,
  Organization, ApprovalChain, ApprovalStep, FeatureFlag, GlobalSetting, AuditLog,
};

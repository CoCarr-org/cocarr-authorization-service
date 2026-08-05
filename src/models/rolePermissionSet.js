const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// Role <-> PermissionSet. Without this join a permission set is a table nothing
// consults — which is worse than not having it, because it looks like a grant
// that holds.
const RolePermissionSet = db.define('rolePermissionSet', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  roleId: { type: DataTypes.STRING, allowNull: false },
  permissionSetId: { type: DataTypes.STRING, allowNull: false },
}, { indexes: [{ unique: true, fields: ['roleId', 'permissionSetId'] }] });
module.exports = RolePermissionSet;

const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
const RolePermission = db.define('rolePermission', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  roleId: { type: DataTypes.STRING, allowNull: false },
  permissionId: { type: DataTypes.STRING, allowNull: false },
}, { indexes: [{ unique: true, fields: ['roleId', 'permissionId'] }] });
module.exports = RolePermission;

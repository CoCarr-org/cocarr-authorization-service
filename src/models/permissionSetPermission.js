const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
const PermissionSetPermission = db.define('permissionSetPermission', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  permissionSetId: { type: DataTypes.STRING, allowNull: false },
  permissionId: { type: DataTypes.STRING, allowNull: false },
}, { indexes: [{ unique: true, fields: ['permissionSetId', 'permissionId'] }] });
module.exports = PermissionSetPermission;

const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
const Role = db.define('role', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  // A super-admin role resolves to "all permissions" without listing them —
  // same idea as core-api's team.key === 'super-admin' short-circuit.
  isSuperAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false },
});
module.exports = Role;

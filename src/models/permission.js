const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// A single grantable action. `key` is the canonical string the rest of the
// platform checks against, e.g. 'workspace.employees.read'. moduleId/action are
// structured mirrors for the admin UI.
const Permission = db.define('permission', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  moduleId: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: true }, // create|read|update|delete|...
  description: { type: DataTypes.TEXT, allowNull: true },
}, { indexes: [{ fields: ['moduleId'] }, { fields: ['key'] }] });
module.exports = Permission;

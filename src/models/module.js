const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// `route`/`icon`/`sortOrder` are NAV METADATA: the dynamic UI renders its
// sidebar straight from the navigation payload, so where a module appears and
// what it links to is IAM data edited at runtime, not a hardcoded client list.
const Module = db.define('module', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  portalId: { type: DataTypes.STRING, allowNull: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  route: { type: DataTypes.STRING, allowNull: true },
  icon: { type: DataTypes.STRING, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ fields: ['portalId'] }] });
module.exports = Module;

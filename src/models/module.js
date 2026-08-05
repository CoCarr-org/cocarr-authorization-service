const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
const Module = db.define('module', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  portalId: { type: DataTypes.STRING, allowNull: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ fields: ['portalId'] }] });
module.exports = Module;

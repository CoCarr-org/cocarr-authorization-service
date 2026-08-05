const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
const Portal = db.define('portal', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  productId: { type: DataTypes.STRING, allowNull: false },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ fields: ['productId'] }] });
module.exports = Portal;

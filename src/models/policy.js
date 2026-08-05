const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// Policy-Based Access Control on top of roles. A policy grants (allow) or
// removes (deny) a permission key for a principal or a role. DENY WINS in
// resolution — the same discipline as a firewall.
const Policy = db.define('policy', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  effect: { type: DataTypes.ENUM('allow', 'deny'), allowNull: false, defaultValue: 'allow' },
  permissionKey: { type: DataTypes.STRING, allowNull: false },
  principalId: { type: DataTypes.STRING, allowNull: true },
  roleId: { type: DataTypes.STRING, allowNull: true },
  resource: { type: DataTypes.STRING, allowNull: true },
  condition: { type: DataTypes.JSON, allowNull: true },
  priority: { type: DataTypes.INTEGER, defaultValue: 100 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ fields: ['principalId'] }, { fields: ['roleId'] }] });
module.exports = Policy;

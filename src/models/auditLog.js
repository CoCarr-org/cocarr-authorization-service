const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// Every access-affecting change (grant/revoke/policy/delegation) is recorded.
const AuditLog = db.define('auditLog', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  actorUid: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false },
  targetType: { type: DataTypes.STRING, allowNull: true },
  targetId: { type: DataTypes.STRING, allowNull: true },
  changes: { type: DataTypes.JSON, allowNull: true },
}, { indexes: [{ fields: ['targetType', 'targetId'] }] });
module.exports = AuditLog;

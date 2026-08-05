const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// One principal temporarily lends a role to another (cover during leave, etc.).
// Active only within [startsAt, expiresAt) and while not revoked. Resolution
// folds an active delegation's role into the delegatee's effective roles.
const Delegation = db.define('delegation', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  fromPrincipalId: { type: DataTypes.STRING, allowNull: false },
  toPrincipalId: { type: DataTypes.STRING, allowNull: false },
  roleId: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: true },
  startsAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
}, { indexes: [{ fields: ['toPrincipalId'] }, { fields: ['fromPrincipalId'] }] });
module.exports = Delegation;

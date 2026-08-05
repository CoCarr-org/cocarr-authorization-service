const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// Assign a role to a PRINCIPAL (a platform identity id from the Identity
// service, or any subject id). `expiresAt` is how TEMPORARY ACCESS is modelled:
// an assignment past its expiry is ignored by resolution.
const RoleAssignment = db.define('roleAssignment', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  principalId: { type: DataTypes.STRING, allowNull: false },
  roleId: { type: DataTypes.STRING, allowNull: false },
  scope: { type: DataTypes.STRING, allowNull: true }, // free-text scope label (legacy)
  // Structured org scope. NULL = platform-wide, which is what every existing
  // assignment is, so adding this changed no existing grant. Resolution reports
  // the scope but does not yet narrow permissions by it — see resolutionService.
  organizationId: { type: DataTypes.STRING, allowNull: true },
  grantedByUid: { type: DataTypes.STRING, allowNull: true },
  reason: { type: DataTypes.STRING, allowNull: true },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
}, { indexes: [{ fields: ['principalId'] }, { fields: ['roleId'] }] });
module.exports = RoleAssignment;

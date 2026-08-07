const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// ONE SIGNATURE on one step of one request. Append-only: a decision is a record
// of what somebody did, so a later change of mind is a NEW row on a NEW request
// rather than an edit that erases the first answer.
//
// `stepOrder` is denormalised alongside `stepId` on purpose. Steps can be
// replaced wholesale (approvalChainService.setSteps destroys and recreates
// them), so a decision whose stepId no longer resolves would otherwise lose the
// one thing that makes the trail readable — where in the sequence it happened.
const ApprovalDecision = db.define('approvalDecision', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  requestId: { type: DataTypes.STRING, allowNull: false },
  stepId: { type: DataTypes.STRING, allowNull: true },
  stepOrder: { type: DataTypes.INTEGER, allowNull: false },
  stepName: { type: DataTypes.STRING, allowNull: true },
  decision: { type: DataTypes.ENUM('approved', 'rejected'), allowNull: false },
  decidedByPrincipalId: { type: DataTypes.STRING, allowNull: false },
  note: { type: DataTypes.STRING, allowNull: true },
}, {
  indexes: [{ fields: ['requestId'] }, { fields: ['decidedByPrincipalId'] }],
});

module.exports = ApprovalDecision;

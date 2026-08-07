const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// ONE THING WAITING FOR APPROVAL, walking one approvalChain.
//
// The chains have existed since IAM was built; this is the half that was
// missing, so a chain described a process nobody could actually run. Workspace
// onboarding is the first consumer: HR submits, this records who must sign and
// in what order, and only when the last step clears may the employee code and
// staff login be issued.
//
// `subjectType` + `subjectId` point at whatever is being approved — an employee
// id today, an access request tomorrow. Deliberately NOT a foreign key: the
// subject lives in another service (workspace-api owns employees), and IAM holds
// no cross-service FKs anywhere else either.
//
// `chainId` is captured at open time rather than resolved on each read. A chain
// edited mid-flight must not silently change what a pending request requires —
// the request keeps the process it started under, which is also what makes the
// decision trail mean anything afterwards.
const ApprovalRequest = db.define('approvalRequest', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  chainId: { type: DataTypes.STRING, allowNull: false },
  requestType: { type: DataTypes.STRING, allowNull: false },
  subjectType: { type: DataTypes.STRING, allowNull: false },
  subjectId: { type: DataTypes.STRING, allowNull: false },
  organizationId: { type: DataTypes.STRING, allowNull: true },
  requestedByPrincipalId: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  // Which rung it is waiting on. Null once the request is finished.
  currentStepOrder: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
  // Free-form context from the requester, and anything the consuming service
  // wants to show an approver without a second call.
  summary: { type: DataTypes.STRING, allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
  decidedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  indexes: [
    { fields: ['requestType'] },
    { fields: ['status'] },
    // "is this subject already waiting on something?" — the question both the
    // opener and every consuming UI asks.
    { fields: ['subjectType', 'subjectId'] },
  ],
});

module.exports = ApprovalRequest;

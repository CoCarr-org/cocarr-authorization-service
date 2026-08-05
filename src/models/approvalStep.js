const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// One rung of an approval chain. An approver is a ROLE by default, because a
// chain naming a person breaks the day that person leaves; approverPrincipalId
// exists for the genuine "this specific person signs off" case.
//
// (chainId, stepOrder) is UNIQUE — two steps claiming the same position is an
// ambiguous chain, and the failure would surface as a request stuck at a rung
// nobody can identify.
const ApprovalStep = db.define('approvalStep', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  chainId: { type: DataTypes.STRING, allowNull: false },
  stepOrder: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  approverRoleId: { type: DataTypes.STRING, allowNull: true },
  approverPrincipalId: { type: DataTypes.STRING, allowNull: true },
  // How many distinct approvers at this rung must say yes.
  requiredApprovals: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  slaHours: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ unique: true, fields: ['chainId', 'stepOrder'] }, { fields: ['approverRoleId'] }] });
module.exports = ApprovalStep;

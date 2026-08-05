const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// An ordered sequence of approvals a request must clear. IAM owns the SHAPE of
// the chain (who approves, in what order); the requesting product owns the
// request itself — Workspace's accessRequest rows point at a chain here rather
// than each product inventing its own workflow table.
//
// `requestType` is what binds them: 'workspace.accessRequest',
// 'workspace.onboarding.approval'. Resolution of a chain for a request is
// therefore a lookup, not a hardcoded branch per product.
const ApprovalChain = db.define('approvalChain', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  requestType: { type: DataTypes.STRING, allowNull: false },
  organizationId: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ fields: ['requestType'] }, { fields: ['organizationId'] }] });
module.exports = ApprovalChain;

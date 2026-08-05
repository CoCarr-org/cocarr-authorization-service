const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// The tenant/org tree access can be SCOPED to. A role assignment carrying an
// organizationId grants its permissions only within that organization (and,
// once scoped resolution is wired, its descendants).
//
// Distinct from Workspace's departments/teams, which describe who REPORTS to
// whom. This is who a grant APPLIES to. Keeping them apart is deliberate: an
// org chart changes for HR reasons, and access must not silently follow it.
const Organization = db.define('organization', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM('company', 'business_unit', 'division', 'branch'),
    allowNull: false,
    defaultValue: 'company',
  },
  parentId: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ fields: ['parentId'] }, { fields: ['key'] }] });
module.exports = Organization;

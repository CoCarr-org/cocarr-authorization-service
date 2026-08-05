const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// Platform feature flags, scoped. `global` applies everywhere; the other scopes
// narrow a flag to one product, portal or organization via scopeId.
//
// NOTHING CONSUMES THESE YET. They are surfaced on the navigation payload so a
// client can read them, but no server-side branch is gated on one. cocarr-core-api
// has the same table in the same state and its lesson is worth repeating here:
// a flag nobody reads looks exactly like a switch that works, so check for a
// consumer before telling anyone a toggle does something.
const FeatureFlag = db.define('featureFlag', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  isEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  scopeType: {
    type: DataTypes.ENUM('global', 'product', 'portal', 'organization'),
    allowNull: false,
    defaultValue: 'global',
  },
  scopeId: { type: DataTypes.STRING, allowNull: true },
}, { indexes: [{ fields: ['key'] }, { fields: ['scopeType', 'scopeId'] }] });
module.exports = FeatureFlag;

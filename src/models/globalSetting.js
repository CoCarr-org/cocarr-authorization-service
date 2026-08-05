const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// Platform-wide configuration editable at runtime by a super admin.
//
// `isSecret` rows are stored but NEVER returned in full by the API — the value
// is masked on read (see settingsService). A secret that round-trips through a
// browser ends up in logs, screenshots and support tickets; if something needs
// a real secret it belongs in the environment, not here.
const GlobalSetting = db.define('globalSetting', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  value: { type: DataTypes.TEXT, allowNull: true },
  valueType: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    allowNull: false,
    defaultValue: 'string',
  },
  category: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isSecret: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { indexes: [{ fields: ['key'] }, { fields: ['category'] }] });
module.exports = GlobalSetting;

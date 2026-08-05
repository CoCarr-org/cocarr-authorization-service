const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// A NAMED BUNDLE of permissions ("Finance read-only", "Booking operations").
// Roles grant sets as well as individual permissions, so a capability that
// spans modules is edited in one place instead of being re-listed on every role
// that needs it — and a new permission added to a set reaches every role
// holding it without anyone remembering to fan the change out.
const PermissionSet = db.define('permissionSet', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});
module.exports = PermissionSet;

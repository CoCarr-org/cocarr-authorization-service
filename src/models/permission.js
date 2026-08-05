const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// A single grantable action. `key` is the canonical string the rest of the
// platform checks against, e.g. 'workspace.employees.read'. moduleId/subModuleId
// /action are structured mirrors for the admin UI and the navigation payload.
//
// KEY SHAPE: `<product>.<module>.<action>`, or `<product>.<module>.<submodule>.<action>`
// when the permission gates one screen rather than the whole module. The key —
// not the foreign keys — stays the thing authorization compares, so a permission
// re-parented in the taxonomy does not silently become a different grant.
//
// `subModuleId` is NULLABLE and every existing permission has it null, meaning
// module-level. Adding the level took no migration and changed no resolution
// result for anything already granted.
const Permission = db.define('permission', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  moduleId: { type: DataTypes.STRING, allowNull: true },
  subModuleId: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: true }, // create|read|update|delete|...
  description: { type: DataTypes.TEXT, allowNull: true },
}, { indexes: [{ fields: ['moduleId'] }, { fields: ['subModuleId'] }, { fields: ['key'] }] });
module.exports = Permission;

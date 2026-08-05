const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');

// The fourth level of the taxonomy: Product > Portal > Module > SUBMODULE > Action.
// A sub-module is ONE SCREEN inside a module — the granularity at which access is
// actually argued about ("they may see Bookings, but not Bookings > Damages").
//
// `route` is the nav path (`/dashboard/bookings/damages`). It is deliberately the
// same vocabulary the frontend already navigates by — cocarr-core-api learned
// this the hard way with its sub-module permissions: a parallel slug vocabulary
// is two lists to keep in step, and they drift. It is what the navigation
// payload keys on, so the UI needs no mapping table.
//
// A module with NO sub-modules is normal and complete; the level is optional,
// not a required rung.
const SubModule = db.define('subModule', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  moduleId: { type: DataTypes.STRING, allowNull: false },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  route: { type: DataTypes.STRING, allowNull: true },
  icon: { type: DataTypes.STRING, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { indexes: [{ fields: ['moduleId'] }, { fields: ['key'] }] });
module.exports = SubModule;

const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
const Role = db.define('role', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  // A super-admin role resolves to "all permissions" without listing them —
  // same idea as core-api's team.key === 'super-admin' short-circuit.
  isSuperAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false },
  // WHICH PART OF THE BUSINESS THIS ROLE BELONGS TO — a label, never a foreign
  // key. Departments live in cocarr-workspace-api and IAM holds no cross-service
  // FKs anywhere else either; this exists so the permission matrix can be
  // grouped the way an administrator actually thinks ("what may Operations
  // do?") without inventing a second axis of access control.
  //
  // ACCESS IS STILL THE ROLE ALONE. A role already encodes team AND level —
  // operations-manager IS "Operations, at manager level" — so scoping grants by
  // department as well would re-split what the model deliberately joined, and
  // give two places to define one thing.
  department: { type: DataTypes.STRING, allowNull: true },
});
module.exports = Role;

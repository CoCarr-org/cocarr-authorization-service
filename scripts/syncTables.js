#!/usr/bin/env node
// Creates any MISSING IAM tables without touching existing ones.
//
//   railway run node scripts/syncTables.js --dry-run
//   railway run node scripts/syncTables.js
//
// WHY THIS EXISTS
//
// index.js runs db.sync({alter:true}), which rewrites every table on every
// boot — and then swallows the outcome: the catch logs one line and `.finally`
// starts the server regardless. When that sync throws PARTWAY, every model
// after the failure point silently never gets created, and the service boots
// looking perfectly healthy until something queries the missing table. That is
// how `Table 'cocarr_iam.roleAssignments' doesn't exist` appears on a service
// whose logs said nothing louder than one error line at startup.
//
// It bites harder here than elsewhere. `bootstrapOwnerService.ensure()` runs at
// AUTHENTICATION time and writes a real roleAssignment row, so a missing
// roleAssignments table 500s EVERY authenticated request — including
// /me/navigation, which the panels render their entire sidebar from. One
// missing table reads as "the whole admin panel is down".
//
// This uses plain model.sync() per model, which is CREATE TABLE IF NOT EXISTS.
// It will not alter, drop or reindex anything that already exists, so it is
// safe to run against a live database, and safe to re-run.
//
// The usual causes of the underlying alter-sync failure, in order:
//   1. A foreign-key type mismatch — MySQL rejects the FK and aborts the whole
//      pass. Every key in this service is a STRING/uuid, so a model declaring
//      INTEGER or UUID against one of them is the thing to look for.
//   2. MySQL's 64-keys-per-table limit — repeated alter:true runs accumulate
//      duplicate indexes until a table trips it.
// Neither is fixed by this script; it gets the service working again so the
// real cause can be found from a healthy system rather than a broken one.
const db = require('../src/configs/db');

// Required for its side effect: registering every model and its associations
// before anything reads getTableName(). Same reason index.js does it.
require('../src/models');

// Every model in the service. Ordered parents-first, so a table carrying a
// foreign key is created after the one it points at — creating a child first
// is its own avoidable failure.
const MODELS = [
  // Taxonomy
  'product', 'portal', 'module', 'subModule', 'permission',
  // Roles and grants
  'role', 'permissionSet', 'permissionSetPermission',
  'rolePermission', 'rolePermissionSet',
  'organization', 'roleAssignment', 'delegation', 'policy',
  // Approvals
  'approvalChain', 'approvalStep', 'approvalRequest', 'approvalDecision',
  // Platform
  'featureFlag', 'globalSetting', 'auditLog',
];

const dryRun = process.argv.includes('--dry-run');

(async () => {
  try {
    await db.authenticate();
    console.log(`Connected to ${db.config.database}.\n`);

    const [existing] = await db.query('SHOW TABLES');
    const have = new Set(existing.map((r) => Object.values(r)[0]));

    let created = 0;
    let failed = 0;
    let present = 0;

    for (const name of MODELS) {
      let model;
      try {
        model = require(`../src/models/${name}`);
      } catch (error) {
        console.log(`  SKIP    ${name.padEnd(26)} (model file not found)`);
        continue;
      }

      const table = model.getTableName();
      if (have.has(table)) {
        console.log(`  ok      ${String(table).padEnd(26)} already exists`);
        present += 1;
        continue;
      }

      if (dryRun) {
        console.log(`  WOULD   ${String(table).padEnd(26)} create`);
        created += 1;
        continue;
      }

      try {
        await model.sync(); // CREATE TABLE IF NOT EXISTS — never alters
        console.log(`  CREATED ${String(table).padEnd(26)}`);
        created += 1;
      } catch (error) {
        // Keep going. One failure must not hide the state of the rest — that
        // is the behaviour that made the original problem hard to see.
        console.error(`  FAILED  ${String(table).padEnd(26)} ${error?.parent?.sqlMessage || error.message}`);
        failed += 1;
      }
    }

    console.log(
      `\n${present} already present, ${created} ${dryRun ? 'would be created' : 'created'}, ${failed} failed.`,
    );
    if (!dryRun && created > 0) {
      console.log(
        'Tables were missing, so the seed may not have run against them. Next:\n'
        + '  node scripts/seedTaxonomy.js --dry-run\n'
        + '  node scripts/seedTaxonomy.js --confirm',
      );
    }
    process.exit(failed ? 1 : 0);
  } catch (error) {
    console.error(`\nCould not sync: ${error?.parent?.sqlMessage || error.message}`);
    process.exit(1);
  }
})();

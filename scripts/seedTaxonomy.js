#!/usr/bin/env node
/**
 * Seed the IAM taxonomy, system roles, permission sets and approval chains.
 *
 *   node scripts/seedTaxonomy.js --dry-run     # report, touch nothing
 *   node scripts/seedTaxonomy.js --confirm     # write
 *
 * IDEMPOTENT and ADDITIVE. Every write is a findOrCreate keyed on the natural
 * key, and an existing row only has its nav metadata (name/route/icon/order)
 * refreshed. It NEVER deletes a product, module, permission or role, and never
 * touches a role's granted permissions once that role exists.
 *
 * That last rule is the important one: re-running this must not undo an
 * administrator's edits. Somebody narrowing a seeded role in the admin UI has
 * made a deliberate decision, and a seed that quietly restored the defaults on
 * the next deploy would revert it with no trace. New roles get their seeded
 * grants; existing roles are left exactly as configured. Use --regrant-roles to
 * force a re-grant when that really is what you want.
 *
 * Requires a reachable database. Safe on production: additive only.
 */
require('dotenv').config();
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// eslint-disable-next-line import/no-dynamic-require
const models = require(path.join(ROOT, 'src/models'));
// eslint-disable-next-line import/no-dynamic-require
const { PRODUCTS } = require(path.join(ROOT, 'src/seeds/taxonomy'));
// eslint-disable-next-line import/no-dynamic-require
const { ROLES, PERMISSION_SETS, APPROVAL_CHAINS } = require(path.join(ROOT, 'src/seeds/roles'));

const {
  db, Product, Portal, Module, SubModule, Permission,
  PermissionSet, PermissionSetPermission, Role, RolePermission, RolePermissionSet,
  ApprovalChain, ApprovalStep,
} = models;

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run') || !args.includes('--confirm');
const REGRANT = args.includes('--regrant-roles');

const stats = {
  products: 0, portals: 0, modules: 0, subModules: 0, permissions: 0, sets: 0, roles: 0, chains: 0, skipped: 0,
};
const log = (...a) => console.log(...a);

// A seed-time glob. `*` matches ANYTHING INCLUDING DOTS, so 'workspace.*.read'
// covers both module reads ('workspace.employees.read') and sub-module reads
// ('workspace.employees.verification.read') — which is what "read only" means to
// the person granting it. Expanded once, here; resolution stays exact-match.
function expand(patterns, allKeys) {
  const out = new Set();
  (patterns || []).forEach((p) => {
    if (!p.includes('*')) { out.add(p); return; }
    const rx = new RegExp(`^${p.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
    allKeys.forEach((k) => { if (rx.test(k)) out.add(k); });
  });
  return [...out];
}

async function upsert(model, where, defaults, refresh = {}) {
  // A dry run touches the database NOT AT ALL — not even to read. It is meant to
  // answer "what would this seed do?" from a laptop with no MySQL, which is
  // exactly when somebody wants to review it.
  if (DRY) return { id: `dry-${where.key || 'row'}`, ...where, ...defaults };
  const existing = await model.findOne({ where });
  if (existing) {
    if (Object.keys(refresh).length) await existing.update(refresh);
    stats.skipped += 1;
    return existing;
  }
  return model.create({ ...where, ...defaults });
}

async function seedTaxonomy() {
  for (const p of PRODUCTS) {
    const product = await upsert(
      Product, { key: p.key },
      { name: p.name, icon: p.icon, sortOrder: p.sortOrder, isActive: true },
      { name: p.name, icon: p.icon, sortOrder: p.sortOrder },
    );
    stats.products += 1;

    for (const po of p.portals) {
      const portal = await upsert(
        Portal, { key: po.key },
        { productId: product.id, name: po.name, icon: po.icon, sortOrder: po.sortOrder, isActive: true },
        { name: po.name, icon: po.icon, sortOrder: po.sortOrder },
      );
      stats.portals += 1;

      for (const m of po.modules) {
        const mod = await upsert(
          Module, { key: m.key },
          {
            portalId: portal.id, name: m.name, route: m.route, icon: m.icon, sortOrder: m.sortOrder, isActive: true,
          },
          {
            name: m.name, route: m.route, icon: m.icon, sortOrder: m.sortOrder,
          },
        );
        stats.modules += 1;

        for (const perm of m.permissions) {
          await upsert(Permission, { key: perm.key }, { moduleId: mod.id, action: perm.action });
          stats.permissions += 1;
        }

        for (const s of m.subModules) {
          const sub = await upsert(
            SubModule, { key: s.key },
            {
              moduleId: mod.id, name: s.name, route: s.route, sortOrder: s.sortOrder, isActive: true,
            },
            { name: s.name, route: s.route, sortOrder: s.sortOrder },
          );
          stats.subModules += 1;
          for (const perm of s.permissions) {
            await upsert(Permission, { key: perm.key }, { moduleId: mod.id, subModuleId: sub.id, action: perm.action });
            stats.permissions += 1;
          }
        }
      }
    }
  }
}

async function seedSetsRolesChains() {
  const allPermissions = DRY ? [] : await Permission.findAll();
  const keyToId = new Map(allPermissions.map((p) => [p.key, p.id]));
  // In a dry run the permissions may not exist yet, so expand against what the
  // seed data DECLARES rather than what is in the database.
  const declared = PRODUCTS.flatMap((p) => p.portals).flatMap((p) => p.modules)
    .flatMap((m) => [...m.permissions, ...m.subModules.flatMap((s) => s.permissions)]).map((x) => x.key);
  const allKeys = DRY ? declared : [...keyToId.keys()];

  for (const ps of PERMISSION_SETS) {
    const set = await upsert(
      PermissionSet, { key: ps.key },
      { name: ps.name, description: ps.description, isSystem: true, isActive: true },
    );
    stats.sets += 1;
    const keys = expand(ps.permissions, allKeys);
    log(`  set ${ps.key}: ${keys.length} permissions`);
    if (!DRY) {
      const ids = keys.map((k) => keyToId.get(k)).filter(Boolean);
      const have = new Set((await PermissionSetPermission.findAll({ where: { permissionSetId: set.id } })).map((r) => r.permissionId));
      const missing = ids.filter((id) => !have.has(id));
      if (missing.length) {
        await PermissionSetPermission.bulkCreate(missing.map((permissionId) => ({ permissionSetId: set.id, permissionId })));
      }
    }
  }

  const setKeyToId = new Map(DRY ? [] : (await PermissionSet.findAll()).map((s) => [s.key, s.id]));

  for (const r of ROLES) {
    const before = DRY ? null : await Role.findOne({ where: { key: r.key } });
    const role = await upsert(
      Role, { key: r.key },
      {
        name: r.name, description: r.description, isSuperAdmin: Boolean(r.isSuperAdmin), isSystem: true,
      },
    );
    stats.roles += 1;
    const isNew = !before;
    const keys = expand(r.permissions, allKeys);
    log(`  role ${r.key}: ${keys.length} permissions, ${(r.permissionSets || []).length} sets${isNew ? '' : REGRANT ? ' (re-granting)' : ' (exists — grants left as configured)'}`);
    if (DRY || (!isNew && !REGRANT)) continue;
    if (keys.length) {
      const ids = keys.map((k) => keyToId.get(k)).filter(Boolean);
      const have = new Set((await RolePermission.findAll({ where: { roleId: role.id } })).map((x) => x.permissionId));
      const missing = ids.filter((id) => !have.has(id));
      if (missing.length) await RolePermission.bulkCreate(missing.map((permissionId) => ({ roleId: role.id, permissionId })));
    }
    for (const sk of r.permissionSets || []) {
      const permissionSetId = setKeyToId.get(sk);
      if (permissionSetId) {
        await RolePermissionSet.findOrCreate({ where: { roleId: role.id, permissionSetId } });
      }
    }
  }

  const roleKeyToId = new Map(DRY ? [] : (await Role.findAll()).map((x) => [x.key, x.id]));
  for (const c of APPROVAL_CHAINS) {
    const chain = await upsert(
      ApprovalChain, { key: c.key },
      {
        name: c.name, requestType: c.requestType, description: c.description, isActive: true,
      },
    );
    stats.chains += 1;
    log(`  chain ${c.key}: ${c.steps.length} steps`);
    if (DRY) continue;
    const existingSteps = await ApprovalStep.count({ where: { chainId: chain.id } });
    // Steps are only laid down for a NEW chain — same reasoning as roles: an
    // edited chain is somebody's decision, not drift to be corrected.
    if (existingSteps === 0) {
      await ApprovalStep.bulkCreate(c.steps.map((s, i) => ({
        chainId: chain.id,
        stepOrder: i + 1,
        name: s.name,
        approverRoleId: roleKeyToId.get(s.approverRoleKey) || null,
        requiredApprovals: 1,
        slaHours: s.slaHours || null,
      })));
    }
  }
}

(async () => {
  log(DRY ? '=== DRY RUN — no database is touched (pass --confirm to apply)' : '=== SEEDING IAM taxonomy');
  if (!DRY) {
    try {
      await db.authenticate();
    } catch (e) {
      console.error(`Cannot reach the IAM database: ${e.message}`);
      process.exit(1);
    }
    await db.sync({ alter: true });
  }
  await seedTaxonomy();
  await seedSetsRolesChains();
  log('---');
  log(`products=${stats.products} portals=${stats.portals} modules=${stats.modules} subModules=${stats.subModules} `
    + `permissions=${stats.permissions} sets=${stats.sets} roles=${stats.roles} chains=${stats.chains} `
    + `(${stats.skipped} already existed)`);
  log(DRY ? 'DRY RUN complete — re-run with --confirm to apply.' : 'Seed complete.');
  if (!DRY) await db.close();
})().catch((e) => { console.error(e); process.exit(1); });

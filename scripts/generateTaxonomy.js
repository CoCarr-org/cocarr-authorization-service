#!/usr/bin/env node
/**
 * Regenerate src/seeds/taxonomy.js from cocarr-platform-web's navConfig.js.
 *
 *   node scripts/generateTaxonomy.js [--web ../cocarr-platform-web] [--check]
 *
 * The IAM taxonomy and the navigation people actually use must not drift, so the
 * taxonomy is DERIVED from the nav rather than maintained beside it. Run this
 * after any nav change, then `seedTaxonomy.js --confirm`.
 *
 * `--check` writes nothing and exits non-zero if the committed seed is stale —
 * suitable for CI.
 *
 * NOTE: navConfig.js is ESM in another repo, so it is imported directly. That is
 * deliberate — parsing it would be a second implementation of its shape, and a
 * parser that silently mis-reads one entry is exactly how a screen goes missing.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const webIdx = args.indexOf('--web');
const WEB = path.resolve(webIdx >= 0 ? args[webIdx + 1] : path.join(__dirname, '../../cocarr-platform-web'));
const NAV_CONFIG = path.join(WEB, 'src/app/_helpers/navConfig.js');
const OUT = path.join(__dirname, '../src/seeds/taxonomy.js');

// Which product owns each nav GROUP. Everything unlisted is Operations, which is
// the charter's reading: the existing business modules are Operations, and
// admin-web is Platform Administration.
const PRODUCT_OF_GROUP = {
  employees: 'workspace',
  orgStructure: 'workspace',
  recruitment: 'workspace',
  accessRequests: 'workspace',
  administration: 'platform',
  settings: 'platform',
  system: 'platform',
};

// Modules that appear ONLY as per-page overrides and therefore have no group of
// their own to take a name from.
//
// Without these they inherit the label of whichever group happened to mention
// them first — `payouts` became "Hosts", and `roles`/`auditLogs`/`security` all
// became "Administration". That is not cosmetic: the module name IS the sidebar
// entry, so the menu showed "Hosts" twice and would have shown "Administration"
// three times, with no way to tell them apart.
const MODULE_OVERRIDES = {
  payouts: { name: 'Payouts & Settlements', icon: 'cash', product: 'operations' },
  roles: { name: 'Teams & Access', icon: 'settings', product: 'platform' },
  auditLogs: { name: 'Audit', icon: 'docs', product: 'platform' },
  security: { name: 'Security', icon: 'settings', product: 'platform' },
  integrations: { name: 'Integrations', icon: 'settings', product: 'platform' },
};

// Two nav GROUPS can claim the same RBAC module, and then the last one wins.
// `settings` is claimed by both the platform Settings group (General, Security,
// Policies, Taxes…) and the operations Master Data group (Cities, Brands,
// Protection Plans) — so Master Data, being later in the array, swallowed all
// nine platform settings screens and Platform ended up with no Settings entry.
//
// These are genuinely different concerns that happen to share one legacy RBAC
// key: the charter calls one "Global Settings" (Platform) and the other is
// business reference data an ops team edits (Operations). Splitting them is a
// new IAM module, not a change to core-api's grid, so nothing existing moves.
//
// Only the pages whose module is `settings` are remapped; the Master Data pages
// that already declare `vehicles` or `marketing` stay with those modules, which
// is what the old per-page overrides did too.
const GROUP_PAGE_MODULE_REMAP = {
  masterData: { settings: 'masterData' },
};
const REMAPPED_MODULE_META = {
  masterData: { name: 'Master Data', icon: 'docs', product: 'operations' },
};

// Charter modules with no screen today. admin-web needs somewhere to render IAM
// itself, so they are seeded now rather than accreting later.
const PLATFORM_EXTRA = [
  { key: 'organizations', name: 'Organizations', icon: 'apps', route: '/dashboard/platform/organizations' },
  { key: 'iamTaxonomy', name: 'Products & Modules', icon: 'apps', route: '/dashboard/platform/taxonomy' },
  { key: 'permissions', name: 'Permissions', icon: 'settings', route: '/dashboard/platform/permissions' },
  { key: 'approvalChains', name: 'Approval Chains', icon: 'docs', route: '/dashboard/platform/approval-chains' },
  { key: 'featureFlags', name: 'Feature Flags', icon: 'settings', route: '/dashboard/platform/feature-flags' },
];

const PRODUCTS = [
  { key: 'platform', name: 'Platform', icon: 'shield', sortOrder: 10, portal: { key: 'admin', name: 'Administration', icon: 'settings' } },
  { key: 'workspace', name: 'Workspace', icon: 'people', sortOrder: 20, portal: { key: 'workspace', name: 'Workspace', icon: 'people' } },
  { key: 'operations', name: 'Operations', icon: 'car', sortOrder: 30, portal: { key: 'ops', name: 'Operations', icon: 'car' } },
];

const CRUD = ['read', 'create', 'update', 'delete'];

// Actions a module needs BEYOND plain CRUD. Recruitment adds `approve` so that
// "who can post a job" (update) and "who can approve a posting for the public
// site" (approve) are grantable separately — separation of duties for the
// job-posting approval workflow. Kept here rather than hand-edited into the
// generated taxonomy so a regenerate does not drop it.
const MODULE_EXTRA_ACTIONS = { recruitment: ['approve'] };

function slugOf(route, moduleKey) {
  let segs = route.replace('/dashboard', '').split('/').filter(Boolean);
  if (segs[0] === moduleKey) segs = segs.slice(1);
  return segs.length ? segs.join('.') : 'home';
}

async function build() {
  if (!fs.existsSync(NAV_CONFIG)) {
    console.error(`navConfig.js not found at ${NAV_CONFIG} — pass --web <path to cocarr-platform-web>`);
    process.exit(1);
  }
  const { NAV_MODULES } = await import(pathToFileURL(NAV_CONFIG).href);

  const productOfGroup = (g) => PRODUCT_OF_GROUP[g.key] || 'operations';

  // Keyed by the RBAC MODULE, not the group: several groups feed one module and
  // access is argued about per module.
  const modules = new Map();
  for (const g of NAV_MODULES) {
    for (const p of g.pages) {
      const declared = p.module || g.module;
      const mk = (GROUP_PAGE_MODULE_REMAP[g.key] || {})[declared] || declared;
      if (!modules.has(mk)) {
        modules.set(mk, {
          key: mk, product: productOfGroup(g), name: g.label, icon: g.icon, route: null, subModules: [],
        });
      }
      const m = modules.get(mk);
      if (!m.route) m.route = p.route;
      m.subModules.push({ key: p.route, name: p.label, route: p.route, slug: slugOf(p.route, mk) });
    }
  }
  // A module that owns a group takes that group's identity — resolved through
  // the SAME remap as the pages. Without that, the Master Data group (whose own
  // `module` field still says `settings`) renames the platform Settings module
  // rather than the remapped one, which is the exact bug the remap exists to fix.
  for (const g of NAV_MODULES) {
    const groupModule = (GROUP_PAGE_MODULE_REMAP[g.key] || {})[g.module] || g.module;
    const m = modules.get(groupModule);
    if (m) { m.name = g.label; m.icon = g.icon; m.product = productOfGroup(g); }
  }
  // Remapped modules take their own identity, never the group's.
  for (const [key, o] of Object.entries(REMAPPED_MODULE_META)) {
    const m = modules.get(key);
    if (m) Object.assign(m, o);
  }
  // Then the explicit overrides win, for modules with no group of their own.
  for (const [key, o] of Object.entries(MODULE_OVERRIDES)) {
    const m = modules.get(key);
    if (m) Object.assign(m, o);
  }
  PLATFORM_EXTRA.forEach((m) => modules.set(m.key, { ...m, product: 'platform', subModules: [] }));

  const out = PRODUCTS.map((p) => {
    const mods = [...modules.values()].filter((m) => m.product === p.key).map((m, i) => {
      const seen = new Set();
      const subs = m.subModules
        .filter((s) => (seen.has(s.key) ? false : seen.add(s.key)))
        .map((s, j) => ({
          key: s.key,
          name: s.name,
          route: s.route,
          sortOrder: (j + 1) * 10,
          permissions: [{ key: `${p.key}.${m.key}.${s.slug}.read`, action: 'read' }],
        }));
      return {
        key: m.key,
        name: m.name,
        route: m.route,
        icon: m.icon,
        sortOrder: (i + 1) * 10,
        permissions: [...CRUD, ...(MODULE_EXTRA_ACTIONS[m.key] || [])]
          .map((a) => ({ key: `${p.key}.${m.key}.${a}`, action: a })),
        subModules: subs,
      };
    });
    return {
      key: p.key,
      name: p.name,
      icon: p.icon,
      sortOrder: p.sortOrder,
      portals: [{ key: p.portal.key, name: p.portal.name, icon: p.portal.icon, sortOrder: 10, modules: mods }],
    };
  });

  // Duplicate module NAMES within a product are a menu with two identical
  // entries and no way to tell them apart. Refuse rather than emit one.
  for (const p of out) {
    const names = p.portals.flatMap((po) => po.modules).map((m) => m.name);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    if (dupes.length) {
      console.error(`Duplicate module names in '${p.key}': ${[...new Set(dupes)].join(', ')} — add a MODULE_OVERRIDES entry.`);
      process.exit(1);
    }
  }
  return out;
}

const HEADER = `// THE PLATFORM TAXONOMY — Product > Portal > Module > SubModule > Action.
//
// GENERATED — do not edit by hand. Run:
//     node scripts/generateTaxonomy.js
// after any change to cocarr-platform-web's navConfig.js, then re-seed.
//
// It is derived from the real navigation (not maintained beside it) so the IAM
// tree and the sidebar people actually use cannot drift apart. The dynamic UI
// renders from this, so anything missing here is a screen that vanishes.
//
// Product ownership, module keying and the sub-module-key-is-its-route rule are
// documented in scripts/generateTaxonomy.js alongside the code that applies them.
const PRODUCTS = `;

(async () => {
  const data = await build();
  const body = HEADER + JSON.stringify(data, null, 2) + ';\n\nmodule.exports = { PRODUCTS };\n';

  const counts = (() => {
    const mods = data.flatMap((p) => p.portals).flatMap((po) => po.modules);
    const subs = mods.flatMap((m) => m.subModules);
    const perms = [...mods.flatMap((m) => m.permissions), ...subs.flatMap((s) => s.permissions)];
    return `${data.length} products, ${mods.length} modules, ${subs.length} sub-modules, ${perms.length} permissions`;
  })();

  if (CHECK) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (current !== body) {
      console.error('src/seeds/taxonomy.js is STALE — run node scripts/generateTaxonomy.js');
      process.exit(1);
    }
    console.log(`taxonomy.js is up to date (${counts})`);
    return;
  }
  fs.writeFileSync(OUT, body);
  console.log(`Wrote ${path.relative(process.cwd(), OUT)} — ${counts}`);
})();

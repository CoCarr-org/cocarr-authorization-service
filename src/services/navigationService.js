const {
  Product, Portal, Module, SubModule, Permission, FeatureFlag,
} = require('../models');
const resolution = require('./resolutionService');

// THE NAVIGATION PAYLOAD — what the dynamic UI renders itself from.
//
// The charter's rule is "menus, routes, sidebar, buttons generated dynamically
// from IAM; nothing is hardcoded". This is the endpoint that makes that true:
// one call returns the taxonomy tree ALREADY FILTERED to what this principal
// may see, plus the flat permission list and the routes it may open. A client
// that renders this needs no module list of its own, so a new module reaches
// the sidebar by being seeded here — no frontend deploy.
//
// WHY THE TREE IS ASSEMBLED IN JS rather than one nested include: a five-level
// eager load with per-level ordering is exactly the query where one missing
// association takes out the whole response. Five flat reads cannot fail
// partially, and the sort is explicit rather than dialect-dependent.
//
// WHAT DECIDES VISIBILITY, at every level, is a held PERMISSION — never a role.
// `actions` on each node is the list this principal actually holds there, which
// is what a button should be gated on ("can I see Edit?"), so the client never
// has to reason about roles to answer a permission question.
//
// A module survives if it has a held module-level permission OR at least one
// surviving sub-module: a module whose only granted screen is one sub-module
// must still appear, or the screen is unreachable.

const byOrder = (a, b) => (a.sortOrder - b.sortOrder) || String(a.name).localeCompare(String(b.name));

function actionsOf(permissions, held, superAdmin) {
  return permissions
    .filter((p) => superAdmin || held.has(p.key))
    .map((p) => p.action)
    .filter(Boolean)
    .filter((a, i, arr) => arr.indexOf(a) === i)
    .sort();
}

function permissionKeysOf(permissions, held, superAdmin) {
  return permissions.filter((p) => superAdmin || held.has(p.key)).map((p) => p.key).sort();
}

async function forPrincipal(principalId) {
  const eff = await resolution.effective(principalId);
  const held = new Set(eff.permissions);
  const { superAdmin } = eff;

  const [products, portals, modules, subModules, permissions, flags] = await Promise.all([
    Product.findAll({ where: { isActive: true } }),
    Portal.findAll({ where: { isActive: true } }),
    Module.findAll({ where: { isActive: true } }),
    SubModule.findAll({ where: { isActive: true } }),
    Permission.findAll(),
    FeatureFlag.findAll(),
  ]);

  const permsByModule = new Map();
  const permsBySubModule = new Map();
  permissions.forEach((p) => {
    if (p.subModuleId) {
      if (!permsBySubModule.has(p.subModuleId)) permsBySubModule.set(p.subModuleId, []);
      permsBySubModule.get(p.subModuleId).push(p);
    } else if (p.moduleId) {
      if (!permsByModule.has(p.moduleId)) permsByModule.set(p.moduleId, []);
      permsByModule.get(p.moduleId).push(p);
    }
  });

  const routes = [];

  const buildSubModules = (moduleId) => subModules
    .filter((s) => s.moduleId === moduleId)
    .sort(byOrder)
    .map((s) => {
      const perms = permsBySubModule.get(s.id) || [];
      const actions = actionsOf(perms, held, superAdmin);
      if (actions.length === 0) return null;
      if (s.route) routes.push(s.route);
      return {
        key: s.key,
        name: s.name,
        route: s.route,
        icon: s.icon,
        actions,
        permissions: permissionKeysOf(perms, held, superAdmin),
      };
    })
    .filter(Boolean);

  const buildModules = (portalId) => modules
    .filter((m) => m.portalId === portalId)
    .sort(byOrder)
    .map((m) => {
      const perms = permsByModule.get(m.id) || [];
      const actions = actionsOf(perms, held, superAdmin);
      const children = buildSubModules(m.id);
      // Held module permission OR a surviving child — see the note above.
      if (actions.length === 0 && children.length === 0) return null;
      if (m.route) routes.push(m.route);
      return {
        key: m.key,
        name: m.name,
        route: m.route,
        icon: m.icon,
        actions,
        permissions: permissionKeysOf(perms, held, superAdmin),
        subModules: children,
      };
    })
    .filter(Boolean);

  const tree = products
    .sort(byOrder)
    .map((product) => {
      const productPortals = portals
        .filter((p) => p.productId === product.id)
        .sort(byOrder)
        .map((portal) => {
          const mods = buildModules(portal.id);
          if (mods.length === 0) return null;
          return {
            key: portal.key, name: portal.name, icon: portal.icon, modules: mods,
          };
        })
        .filter(Boolean);
      if (productPortals.length === 0) return null;
      return {
        key: product.key, name: product.name, icon: product.icon, portals: productPortals,
      };
    })
    .filter(Boolean);

  // Feature flags the client may act on. Global flags always; a scoped flag only
  // when its scope survived the filter above — a flag for a product this
  // principal cannot see is not their business.
  const visibleProductIds = new Set(products.filter((p) => tree.some((t) => t.key === p.key)).map((p) => p.id));
  const visiblePortalIds = new Set(portals.map((p) => p.id).filter((id) => {
    const portal = portals.find((p) => p.id === id);
    return portal && visibleProductIds.has(portal.productId);
  }));
  const featureFlags = {};
  flags.forEach((f) => {
    const inScope = f.scopeType === 'global'
      || (f.scopeType === 'product' && visibleProductIds.has(f.scopeId))
      || (f.scopeType === 'portal' && visiblePortalIds.has(f.scopeId))
      || (f.scopeType === 'organization' && eff.scopes.includes(f.scopeId));
    if (inScope) featureFlags[f.key] = f.isEnabled;
  });

  return {
    principalId,
    superAdmin,
    roles: eff.roles,
    permissionSets: eff.permissionSets,
    permissions: eff.permissions,
    scopes: eff.scopes,
    // Flat list for a route guard — the client should not have to walk the tree
    // to answer "may I open this path?".
    routes: [...new Set(routes)].sort(),
    featureFlags,
    products: tree,
  };
}

module.exports = { forPrincipal };

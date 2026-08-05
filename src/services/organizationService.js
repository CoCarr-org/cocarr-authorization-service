const { createCrudService } = require('./crudFactory');
const { CustomError } = require('../middlewares/error');
const { Organization } = require('../models');

const crud = createCrudService({
  model: Organization,
  entityType: 'Organization',
  searchable: ['key', 'name'],
  allowed: ['key', 'name', 'type', 'parentId', 'description', 'isActive'],
});

// The org tree, assembled in memory. Orgs are few and change rarely, so one read
// beats a recursive query — and it lets the cycle guard below be explicit.
async function tree() {
  const all = await Organization.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
  const byId = new Map(all.map((o) => [o.id, {
    id: o.id, key: o.key, name: o.name, type: o.type, children: [],
  }]));
  const roots = [];
  all.forEach((o) => {
    const node = byId.get(o.id);
    const parent = o.parentId ? byId.get(o.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

// A cycle makes the tree infinite and every ancestor walk hang. Cheaper to
// refuse the edit than to defend every reader against it.
async function assertNoCycle(id, parentId) {
  let cursor = parentId;
  const seen = new Set([id]);
  while (cursor) {
    if (seen.has(cursor)) throw new CustomError('That parent would create a cycle', 400, 'VALIDATION_ERROR');
    seen.add(cursor);
    // eslint-disable-next-line no-await-in-loop
    const parent = await Organization.findByPk(cursor);
    cursor = parent ? parent.parentId : null;
  }
}

async function update(id, body) {
  if (body.parentId) await assertNoCycle(id, body.parentId);
  return crud.update(id, body);
}

module.exports = { ...crud, update, tree };

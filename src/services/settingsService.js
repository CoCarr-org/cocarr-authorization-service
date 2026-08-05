const { createCrudService } = require('./crudFactory');
const { GlobalSetting } = require('../models');
const audit = require('./auditService');

const crud = createCrudService({
  model: GlobalSetting,
  entityType: 'GlobalSetting',
  searchable: ['key', 'category'],
  allowed: ['key', 'value', 'valueType', 'category', 'description', 'isSecret'],
});

const MASK = '••••••••';

// A secret NEVER leaves the API in full. It round-trips through a browser
// otherwise, and from there into logs, screenshots and support tickets. The row
// still reports that it HAS a value (`hasValue`) so an operator can tell "not
// configured" from "configured, hidden" — which is the only question the mask
// would otherwise make unanswerable.
function project(row) {
  const o = row.toJSON ? row.toJSON() : row;
  if (!o.isSecret) return o;
  return { ...o, value: o.value ? MASK : null, hasValue: Boolean(o.value) };
}

async function list(query) {
  const res = await crud.list(query);
  return { ...res, data: res.data.map(project) };
}

async function getById(id) {
  return project(await crud.getById(id));
}

// Settings are addressed by KEY everywhere else in the platform, so the write
// path is an upsert on the key rather than an id lookup — a caller setting a
// value should not have to discover whether the row exists first.
async function upsert({ key, value, valueType, category, description, isSecret }, actorUid) {
  const [row, created] = await GlobalSetting.findOrCreate({
    where: { key },
    defaults: {
      value, valueType: valueType || 'string', category: category || null, description: description || null, isSecret: Boolean(isSecret),
    },
  });
  if (!created) {
    await row.update({
      value: value !== undefined ? value : row.value,
      valueType: valueType || row.valueType,
      category: category !== undefined ? category : row.category,
      description: description !== undefined ? description : row.description,
      isSecret: isSecret !== undefined ? Boolean(isSecret) : row.isSecret,
    });
  }
  // The VALUE is never written to the audit log — a secret recorded in an audit
  // trail is still a secret in a database somebody can read.
  await audit.log({
    actorUid, action: created ? 'setting.create' : 'setting.update', targetType: 'globalSetting', targetId: row.id, changes: { key },
  });
  return project(row);
}

module.exports = { ...crud, list, getById, upsert };

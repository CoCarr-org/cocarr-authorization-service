const { Op } = require('sequelize');
const { CustomError } = require('../middlewares/error');
function createCrudService({ model, entityType, searchable = [], defaultSort = '-createdAt', allowed = [] }) {
  const pick = (b) => { const o = {}; allowed.forEach((f) => { if (b[f] !== undefined) o[f] = b[f]; }); return o; };
  async function list({ search, sort, offset = 0, limit = 25, filters = {} } = {}) {
    const where = { ...filters };
    if (search && searchable.length) where[Op.or] = searchable.map((c) => ({ [c]: { [Op.like]: `%${search}%` } }));
    const s = sort || defaultSort; const dir = s.startsWith('-') ? 'DESC' : 'ASC'; const field = s.replace(/^-/, '');
    const data = await model.findAll({ where, order: [[field, dir]], offset: parseInt(offset, 10) || 0, limit: parseInt(limit, 10) || 25 });
    return { data, totalCount: await model.count({ where }) };
  }
  async function getById(id) { const r = await model.findByPk(id); if (!r) throw new CustomError(`${entityType} not found`, 404, 'NOT_FOUND'); return r; }
  const create = (b) => model.create(pick(b));
  async function update(id, b) { const r = await getById(id); await r.update(pick(b)); return r; }
  async function remove(id) { const r = await getById(id); await r.destroy(); return { success: true }; }
  return { list, getById, create, update, remove };
}
module.exports = { createCrudService };

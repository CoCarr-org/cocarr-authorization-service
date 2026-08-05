const { AuditLog } = require('../models');
// Never throws — an audit failure must not break the operation it records.
async function log({ actorUid, action, targetType, targetId, changes }) {
  try { await AuditLog.create({ actorUid, action, targetType, targetId, changes }); }
  catch (_) { /* swallow */ }
}
async function list({ targetType, targetId, offset = 0, limit = 50 } = {}) {
  const where = {};
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;
  const data = await AuditLog.findAll({ where, order: [['createdAt', 'DESC']], offset: parseInt(offset, 10) || 0, limit: parseInt(limit, 10) || 50 });
  return { data, totalCount: await AuditLog.count({ where }) };
}
module.exports = { log, list };

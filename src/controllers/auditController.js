const svc = require('../services/auditService');
module.exports = { list: async (req, res, next) => { try { res.json(await svc.list(req.query)); } catch (e) { next(e); } } };

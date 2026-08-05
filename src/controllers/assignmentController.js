const svc = require('../services/assignmentService');
module.exports = {
  assign: async (req, res, next) => { try { res.status(201).json(await svc.assign(req.body, req.actor && req.actor.uid)); } catch (e) { next(e); } },
  revoke: async (req, res, next) => { try { res.json(await svc.revoke(req.params.id, req.actor && req.actor.uid)); } catch (e) { next(e); } },
  listForPrincipal: async (req, res, next) => { try { res.json(await svc.listForPrincipal(req.params.principalId, { activeOnly: req.query.activeOnly === 'true' })); } catch (e) { next(e); } },
};

const svc = require('../services/delegationService');
module.exports = {
  create: async (req, res, next) => { try { res.status(201).json(await svc.create(req.body, req.actor && req.actor.uid)); } catch (e) { next(e); } },
  revoke: async (req, res, next) => { try { res.json(await svc.revoke(req.params.id, req.actor && req.actor.uid)); } catch (e) { next(e); } },
  list: async (req, res, next) => { try { res.json(await svc.list(req.query)); } catch (e) { next(e); } },
};

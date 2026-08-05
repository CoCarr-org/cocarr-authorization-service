const svc = require('../services/resolutionService');
module.exports = {
  effective: async (req, res, next) => { try { res.json(await svc.effective(req.params.principalId)); } catch (e) { next(e); } },
  authorize: async (req, res, next) => {
    try { res.json(await svc.authorize(req.body.principalId, req.body.permission)); } catch (e) { next(e); }
  },
};

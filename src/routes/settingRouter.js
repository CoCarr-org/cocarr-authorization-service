const { makeCrudRouter } = require('./crudRouterFactory');
const service = require('../services/settingsService');

module.exports = makeCrudRouter(service, {
  required: ['key'],
  extra: (router, ctrl, { authenticate }) => {
    // Settings are addressed by KEY everywhere else in the platform, so the
    // write path is an upsert on the key. Registered before '/:id'.
    router.put('/by-key', authenticate, async (req, res, next) => {
      try { res.json(await service.upsert(req.body, req.actor?.uid)); } catch (e) { next(e); }
    });
  },
});

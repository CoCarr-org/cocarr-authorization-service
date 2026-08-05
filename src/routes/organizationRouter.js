const { makeCrudRouter } = require('./crudRouterFactory');
const service = require('../services/organizationService');

module.exports = makeCrudRouter(service, {
  extra: (router, ctrl, { authenticate }) => {
    // Before '/:id' — otherwise 'tree' is matched as an organization id.
    router.get('/tree', authenticate, async (req, res, next) => {
      try { res.json(await service.tree()); } catch (e) { next(e); }
    });
  },
});

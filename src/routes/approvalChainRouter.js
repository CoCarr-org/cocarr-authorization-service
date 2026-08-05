const { makeCrudRouter } = require('./crudRouterFactory');
const service = require('../services/approvalChainService');

module.exports = makeCrudRouter(service, {
  required: ['key', 'name', 'requestType'],
  extra: (router, ctrl, { authenticate }) => {
    // Before '/:id'. Which chain governs a request type, for the product that
    // owns the request (Workspace's access requests are the first caller).
    router.get('/for-request-type/:requestType', authenticate, async (req, res, next) => {
      try {
        res.json(await service.forRequestType(req.params.requestType, req.query.organizationId || null));
      } catch (e) { next(e); }
    });
    router.put('/:id/steps', authenticate, async (req, res, next) => {
      try { res.json(await service.setSteps(req.params.id, req.body.steps, req.actor?.uid)); } catch (e) { next(e); }
    });
  },
});

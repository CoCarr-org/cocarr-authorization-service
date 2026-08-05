const { makeCrudRouter } = require('./crudRouterFactory');
const service = require('../services/permissionSetService');

module.exports = makeCrudRouter(service, {
  extra: (router, ctrl, { authenticate }) => {
    router.put('/:id/permissions', authenticate, async (req, res, next) => {
      try { res.json(await service.setPermissions(req.params.id, req.body.permissionIds, req.actor?.uid)); } catch (e) { next(e); }
    });
  },
});

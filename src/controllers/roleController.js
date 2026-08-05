const svc = require('../services/roleService');
const { makeCrudController } = require('./crudController');
const base = makeCrudController(svc);
module.exports = {
  ...base,
  setPermissions: async (req, res, next) => {
    try { res.json(await svc.setPermissions(req.params.id, req.body.permissionIds, req.actor && req.actor.uid)); } catch (e) { next(e); }
  },
};

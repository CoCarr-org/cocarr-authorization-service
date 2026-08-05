const express = require('express');
const { check } = require('express-validator');
const { assertValid } = require('../utils/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const { makeCrudController } = require('../controllers/crudController');

// One router shape for every plain-CRUD IAM resource. The alternative is seven
// near-identical files that drift — and the thing that drifts first is which
// routes require authentication.
//
// READS ARE AUTHENTICATED TOO. The taxonomy is a map of every module, screen
// and action the platform has; handing that to an anonymous caller describes the
// whole attack surface for free. There is no public IAM read.
function makeCrudRouter(service, { required = ['key', 'name'], extra } = {}) {
  const router = express.Router();
  const ctrl = makeCrudController(service);
  const validate = (req, res, next) => { try { assertValid(req); next(); } catch (e) { next(e); } };
  const requiredChecks = required.map((f) => check(f).notEmpty().withMessage(`${f} is required`));

  // Bespoke routes must be registered BEFORE '/:id', or Express matches a
  // literal segment as an id — the same ordering rule as core-api's routers.
  if (extra) extra(router, ctrl, { validate, authenticate });

  router.get('/', authenticate, ctrl.list);
  router.get('/:id', authenticate, ctrl.get);
  router.post('/', [authenticate, ...requiredChecks, validate], ctrl.create);
  router.put('/:id', authenticate, ctrl.update);
  router.delete('/:id', authenticate, ctrl.remove);
  return router;
}

module.exports = { makeCrudRouter };

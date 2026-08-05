const express = require('express');
const { check } = require('express-validator');
const { assertValid } = require('../utils/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const { makeCrudController } = require('../controllers/crudController');
const service = require('../services/taxonomyService').portals;

const router = express.Router();
const ctrl = makeCrudController(service);
const validate = (req, res, next) => { try { assertValid(req); next(); } catch (e) { next(e); } };

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', [authenticate,
  check('productId').notEmpty().withMessage('productId is required'),
  check('key').notEmpty().withMessage('key is required'),
  check('name').notEmpty().withMessage('name is required'),
  validate], ctrl.create);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;

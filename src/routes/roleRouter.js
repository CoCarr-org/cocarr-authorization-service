const express = require('express');
const { check } = require('express-validator');
const { assertValid } = require('../utils/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/roleController');

const router = express.Router();
const validate = (req, res, next) => { try { assertValid(req); next(); } catch (e) { next(e); } };

router.get('/', ctrl.list);
router.get('/:id', ctrl.get); // includes permissions
router.post('/', [authenticate, check('key').notEmpty().withMessage('key is required'), check('name').notEmpty().withMessage('name is required'), validate], ctrl.create);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.put('/:id/permissions', authenticate, ctrl.setPermissions); // { permissionIds: [] }

module.exports = router;

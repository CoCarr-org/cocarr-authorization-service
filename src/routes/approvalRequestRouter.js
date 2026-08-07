const express = require('express');
const { check } = require('express-validator');
const { assertValid } = require('../utils/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/approvalRequestController');

const router = express.Router();
const validate = (req, res, next) => { try { assertValid(req); next(); } catch (e) { next(e); } };

// Literal segments BEFORE '/:id', or Express matches 'mine' and 'subject' as an
// id — the same ordering rule every router here follows.
router.get('/mine', authenticate, ctrl.mine);
router.get('/subject/:subjectType/:subjectId', authenticate, ctrl.forSubject);

router.get('/', authenticate, ctrl.list);
router.post('/', [authenticate,
  check('requestType').notEmpty().withMessage('requestType is required'),
  check('subjectType').notEmpty().withMessage('subjectType is required'),
  check('subjectId').notEmpty().withMessage('subjectId is required'),
  validate,
], ctrl.open);

router.get('/:id', authenticate, ctrl.get);
router.post('/:id/decide', [authenticate,
  check('decision').notEmpty().withMessage('decision is required'),
  validate,
], ctrl.decide);
router.post('/:id/cancel', authenticate, ctrl.cancel);

module.exports = router;

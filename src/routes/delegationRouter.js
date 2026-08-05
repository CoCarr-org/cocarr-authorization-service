const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/delegationController');
const router = express.Router();
router.get('/', ctrl.list);
router.post('/', authenticate, ctrl.create);
router.delete('/:id', authenticate, ctrl.revoke);
module.exports = router;

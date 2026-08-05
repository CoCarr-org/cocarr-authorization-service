const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/auditController');
const router = express.Router();
router.get('/', authenticate, ctrl.list);
module.exports = router;

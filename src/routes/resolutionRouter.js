const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/resolutionController');
const router = express.Router();
// The core IAM answer. Called by services/gateway to make access decisions.
router.get('/principals/:principalId/permissions', authenticate, ctrl.effective);
router.post('/authorize', authenticate, ctrl.authorize); // { principalId, permission } -> { allow, reason }
module.exports = router;

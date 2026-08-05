const express = require('express');
const ctrl = require('../controllers/resolutionController');
const router = express.Router();
// The core IAM answer. Called by services/gateway to make access decisions.
router.get('/principals/:principalId/permissions', ctrl.effective);
router.post('/authorize', ctrl.authorize); // { principalId, permission } -> { allow, reason }
module.exports = router;

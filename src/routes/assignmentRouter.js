const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/assignmentController');
const router = express.Router();
router.post('/', authenticate, ctrl.assign);               // { principalId, roleId, expiresAt? }
router.delete('/:id', authenticate, ctrl.revoke);
router.get('/principal/:principalId', ctrl.listForPrincipal); // ?activeOnly=true
module.exports = router;

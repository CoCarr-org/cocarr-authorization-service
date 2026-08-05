const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/navigationController');

const router = express.Router();

// THE endpoint the dynamic UI renders itself from: the taxonomy tree filtered to
// what this principal may see, plus its flat permissions, openable routes and
// in-scope feature flags. One call, so a client never assembles nav from several.
router.get('/me/navigation', authenticate, ctrl.me);
// Same payload for another principal — "what does this person actually see?",
// which is the question an admin debugging a permissions complaint is asking.
router.get('/principals/:principalId/navigation', authenticate, ctrl.forPrincipal);

module.exports = router;

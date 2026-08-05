const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('../docs/openapi');
const { health } = require('../controllers/healthController');

const router = express.Router();
router.get('/health', health);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Taxonomy
router.use('/products', require('./productRouter'));
router.use('/portals', require('./portalRouter'));
router.use('/modules', require('./moduleRouter'));
router.use('/permissions', require('./permissionRouter'));
// Roles & PBAC
router.use('/roles', require('./roleRouter'));
router.use('/policies', require('./policyRouter'));
router.use('/assignments', require('./assignmentRouter'));
router.use('/delegations', require('./delegationRouter'));
router.use('/audit', require('./auditRouter'));
// Resolution (the decision point)
router.use('/', require('./resolutionRouter'));

module.exports = router;

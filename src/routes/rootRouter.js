const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('../docs/openapi');
const { health } = require('../controllers/healthController');

const router = express.Router();
router.get('/health', health);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Taxonomy: Product > Portal > Module > SubModule > Permission(action)
router.use('/products', require('./productRouter'));
router.use('/portals', require('./portalRouter'));
router.use('/modules', require('./moduleRouter'));
router.use('/sub-modules', require('./subModuleRouter'));
router.use('/permissions', require('./permissionRouter'));
router.use('/permission-sets', require('./permissionSetRouter'));
// Roles & PBAC
router.use('/roles', require('./roleRouter'));
router.use('/policies', require('./policyRouter'));
router.use('/assignments', require('./assignmentRouter'));
router.use('/delegations', require('./delegationRouter'));
// Platform administration
router.use('/organizations', require('./organizationRouter'));
router.use('/approval-chains', require('./approvalChainRouter'));
// The chains describe a process; these are the requests actually walking one.
router.use('/approval-requests', require('./approvalRequestRouter'));
router.use('/feature-flags', require('./featureFlagRouter'));
router.use('/settings', require('./settingRouter'));
router.use('/audit', require('./auditRouter'));
// Navigation — what the dynamic UI renders itself from. Mounted at '/' because
// its paths are '/me/navigation' and '/principals/:id/navigation'.
router.use('/', require('./navigationRouter'));
// Resolution (the decision point)
router.use('/', require('./resolutionRouter'));

module.exports = router;

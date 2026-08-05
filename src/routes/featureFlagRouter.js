const { makeCrudRouter } = require('./crudRouterFactory');
const service = require('../services/featureFlagService');
module.exports = makeCrudRouter(service);

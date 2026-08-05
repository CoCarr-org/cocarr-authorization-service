const { makeCrudRouter } = require('./crudRouterFactory');
const service = require('../services/taxonomyService').subModules;
module.exports = makeCrudRouter(service, { required: ['moduleId', 'key', 'name'] });

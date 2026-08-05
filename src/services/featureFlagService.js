const { createCrudService } = require('./crudFactory');
const { FeatureFlag } = require('../models');

// NOTHING BRANCHES ON THESE YET. They are returned on the navigation payload so
// a client can read one, but no server-side path is gated on a flag. Check for a
// consumer before telling anyone a toggle does something — cocarr-core-api has
// the same table in the same state, and that is exactly how it misled people.
module.exports = createCrudService({
  model: FeatureFlag,
  entityType: 'FeatureFlag',
  searchable: ['key', 'name'],
  allowed: ['key', 'name', 'description', 'isEnabled', 'scopeType', 'scopeId'],
});

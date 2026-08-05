const { CustomError } = require('../middlewares/error');
const svc = require('../services/navigationService');

// The principal is the PLATFORM IDENTITY ID when the gateway resolved one, and
// the Firebase uid otherwise. Both are accepted because role assignments are
// keyed by a free-string principalId — but the identity id is the stable one, so
// it is preferred wherever it exists. A caller with neither is not authenticated
// and must not silently resolve to an empty (and therefore harmless-looking)
// navigation payload.
function principalOf(req) {
  const principalId = req.actor?.identityId || req.actor?.uid;
  if (!principalId) throw new CustomError('No authenticated principal', 401, 'UNAUTHENTICATED');
  return principalId;
}

module.exports = {
  me: async (req, res, next) => {
    try { res.json(await svc.forPrincipal(principalOf(req))); } catch (e) { next(e); }
  },
  forPrincipal: async (req, res, next) => {
    try { res.json(await svc.forPrincipal(req.params.principalId)); } catch (e) { next(e); }
  },
};

const svc = require('../services/approvalRequestService');

// The acting principal is the platform identity id, falling back to the Firebase
// uid before `POST /v1/auth/verify` has created the identity row — the same
// fallback navigationController and the bootstrap owner use. Getting this wrong
// would record a decision against a principal that resolution cannot resolve.
const actorId = (req) => req.actor?.identityId || req.actor?.uid || null;

module.exports = {
  open: async (req, res, next) => {
    try {
      res.status(201).json(await svc.open({ ...req.body, requestedByPrincipalId: actorId(req) }));
    } catch (e) { next(e); }
  },
  list: async (req, res, next) => {
    try { res.json(await svc.list(req.query)); } catch (e) { next(e); }
  },
  mine: async (req, res, next) => {
    try { res.json(await svc.listPendingFor(actorId(req), req.query)); } catch (e) { next(e); }
  },
  forSubject: async (req, res, next) => {
    try {
      res.json(await svc.statusForSubject(
        req.params.subjectType, req.params.subjectId, req.query.requestType || null,
      ));
    } catch (e) { next(e); }
  },
  get: async (req, res, next) => {
    try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
  },
  decide: async (req, res, next) => {
    try { res.json(await svc.decide(req.params.id, req.body, actorId(req))); } catch (e) { next(e); }
  },
  cancel: async (req, res, next) => {
    try { res.json(await svc.cancel(req.params.id, actorId(req), req.body?.note)); } catch (e) { next(e); }
  },
};

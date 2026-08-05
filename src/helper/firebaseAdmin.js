const admin = require('firebase-admin');
const Logger = require('./logger');
let app = null; let configured = false;
function parse() {
  const raw = process.env.ADMIN_SERVICE_ACCOUNT;
  if (!raw) return null;
  try { return raw.trim().startsWith('{') ? JSON.parse(raw) : require(require('path').resolve(raw)); }
  catch (e) { Logger.error(`ADMIN_SERVICE_ACCOUNT parse failed: ${e.message}`); return null; }
}
(function init() {
  const sa = parse();
  if (!sa) { Logger.warn('[firebase] ADMIN_SERVICE_ACCOUNT not set — auth verification disabled.'); return; }
  app = admin.initializeApp({ credential: admin.credential.cert(sa) }, 'authz');
  configured = true; Logger.info('[firebase] Admin app initialised for authorization.');
})();
module.exports = { isConfigured: () => configured, verifyIdToken: (t) => admin.auth(app).verifyIdToken(t) };

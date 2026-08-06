const admin = require('firebase-admin');
const Logger = require('./logger');
let app = null; let configured = false;
// ADMIN_SERVICE_ACCOUNT is BASE64-ENCODED JSON across this platform. A service
// account carries a PEM private key full of newlines, and env vars holding
// literal newlines get mangled by hosts, shells and dashboards, so base64 is
// what makes the value survive — and it is what is set on Railway today.
//
// Only JSON and a file path were handled, so a base64 value fell through to
// require() and failed as a missing module, taking auth down service-wide.
// Order: JSON, then base64 (accepted only when it decodes to something starting
// with '{', so a real path is never mistaken for it), then the path form.
function parse() {
  const raw = process.env.ADMIN_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const value = raw.trim();
    if (value.startsWith('{')) return JSON.parse(value);

    const decoded = Buffer.from(value, 'base64').toString('utf8').trim();
    if (decoded.startsWith('{')) return JSON.parse(decoded);

    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(require('path').resolve(value));
  } catch (e) {
    // Deliberately WITHOUT e.message: require() puts the resolved path in its
    // error, and when the value is a service account that path IS the
    // credential — which is how a private key reached the deploy logs.
    Logger.error('ADMIN_SERVICE_ACCOUNT could not be parsed as JSON, base64 JSON, or a readable path.');
    return null;
  }
}
(function init() {
  const sa = parse();
  if (!sa) { Logger.warn('[firebase] ADMIN_SERVICE_ACCOUNT not set — auth verification disabled.'); return; }
  app = admin.initializeApp({ credential: admin.credential.cert(sa) }, 'authz');
  configured = true; Logger.info('[firebase] Admin app initialised for authorization.');
})();
module.exports = { isConfigured: () => configured, verifyIdToken: (t) => admin.auth(app).verifyIdToken(t) };

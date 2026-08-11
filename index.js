require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

fs.mkdirSync('logs', { recursive: true });

const Logger = require('./src/helper/logger');
const { db } = require('./src/models');
const rootRouter = require('./src/routes/rootRouter');
const { errorHandlerMiddleware } = require('./src/middlewares/error');

const app = express();
const CORS_ORIGINS = String(process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
if (CORS_ORIGINS.length === 0) { console.warn('[cors] CORS_ORIGINS not set — allowing every origin.'); app.use(cors({ origin: '*' })); }
else { app.use(cors({ origin: (o, cb) => (!o || CORS_ORIGINS.includes(o) ? cb(null, true) : cb(new Error('Not allowed by CORS'))), credentials: true })); }

app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
app.use('/v1', rootRouter);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3060;
// Say who the break-glass owner is at boot. Nobody holds a role on a freshly
// seeded IAM, so this line is the answer to "who can administer this?" — and it
// makes a typo'd BOOTSTRAP_OWNER_EMAIL visible in the deploy log instead of
// presenting later as an owner who mysteriously has no access.
Logger.info(`[bootstrap-owner] Owner account: ${require('./src/services/bootstrapOwnerService').OWNER_EMAIL}`);
// A FAILED SYNC IS NOT A WARNING — IT IS A BROKEN SERVICE THAT STILL BOOTS.
//
// alter:true rewrites every table on every boot, and when it throws PARTWAY
// every model after the failure point silently never gets created. This used to
// log one error line and start the server anyway, so the first symptom was
// `Table 'cocarr_iam.roleAssignments' doesn't exist` on a service whose startup
// looked fine.
//
// That table in particular takes the whole platform down rather than one
// screen: bootstrapOwnerService.ensure() writes a roleAssignment at
// AUTHENTICATION time, so every authenticated request 500s — including
// /me/navigation, which every panel renders its sidebar from.
//
// Still boots on failure, deliberately: refusing to start would hide the
// reason, and /health is how you find out. But it says so in a way nobody
// scrolls past, and names the script that repairs it.
// Classify the connection BEFORE sync, so "the schema does not exist" is
// reported as that rather than as a confusing sync error. Never throws.
const { preflight } = require('./src/configs/dbPreflight');

preflight(db, Logger)
  .then(({ ok }) => {
    // Skip the sync entirely when the database is unreachable: it can only
    // produce a second, noisier version of the error already reported, and
    // burying the real cause under it is how this went unnoticed.
    if (!ok) return Object.assign(Promise.reject(new Error('database unreachable')), {});
    return db.sync({ alter: true }).then(() => Logger.info('Authorization (IAM) schema synced.'));
  })
  .catch((err) => {
    // The preflight already reported an unreachable database, in detail.
    if (err.message === 'database unreachable') return;
    Logger.error('!!! SCHEMA SYNC FAILED — TABLES MAY BE MISSING !!!');
    Logger.error(`  reason: ${err?.parent?.sqlMessage || err.message}`);
    Logger.error('  Every model after the failure point has no table. Authenticated');
    Logger.error('  requests will 500 if roleAssignments is among them.');
    Logger.error('  Repair:  node scripts/syncTables.js --dry-run  then without the flag.');
  })
// Bind with NO host argument, so Node listens on :: with dual-stack and accepts
// both IPv4 and IPv6. Railway's PRIVATE NETWORK IS IPv6-ONLY: a server bound to
// '0.0.0.0' is reachable from the public edge and completely unreachable from
// sibling services, which presents as the gateway 502-ing every upstream while
// each upstream looks perfectly healthy on its own.
  .finally(() => app.listen(PORT, () => Logger.info(`cocarr-authorization-service listening on ${PORT}`)));

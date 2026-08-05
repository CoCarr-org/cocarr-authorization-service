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
db.sync({ alter: true })
  .then(() => Logger.info('Authorization (IAM) schema synced.'))
  .catch((err) => Logger.error(`Schema sync failed: ${err.message}`))
  .finally(() => app.listen(PORT, '0.0.0.0', () => Logger.info(`cocarr-authorization-service listening on ${PORT}`)));

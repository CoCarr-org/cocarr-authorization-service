const { validationResult } = require('express-validator');
const { CustomError } = require('../middlewares/error');
function assertValid(req) { const r = validationResult(req); if (!r.isEmpty()) throw new CustomError(r.array()[0].msg, 400, 'VALIDATION_ERROR'); }
module.exports = { assertValid };

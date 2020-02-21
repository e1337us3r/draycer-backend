const Logger = require("../core/logger");

module.exports = function LoggerMiddleware(req, res, next) {
  Logger.info({
    path: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params
  });
  next();
};

const Logger = require("../core/logger");

module.exports = async function LoggerMiddleware(req, res, next) {
  // scene is huge, don't log it
  const body = { ...req.body, scene: undefined };
  Logger.info({
    path: req.originalUrl,
    method: req.method,
    body,
    params: req.params
  });
  next();
};

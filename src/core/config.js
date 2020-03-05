const dotenv = require("dotenv");

dotenv.config();

const isProd = process.env.NODE_ENV === "prod";

const CONFIG = {
  logger: {
    base: null,
    level: isProd ? "info" : "debug",
    prettyPrint: false
  },
  port: process.env.PORT ? Number(process.env.PORT) : 7878,
  isProd,
  dbUri: process.env.DB_URI,
  redisUri: process.env.REDIS_URI
};

CONFIG.logger.timestamp = () => {
  const time = new Date().toISOString();
  return `,"time":"${time}"`;
};

module.exports = CONFIG;

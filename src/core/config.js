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
  redisUri: process.env.REDIS_URI,
  knex: {
    client: "pg",
    asyncStackTraces: true,
    connection:
      process.env.DB_URI ||
      "postgres://postgres:postgres_password@localhost:7879/postgres",
    debug: false,
    pool: {
      max: 10,
      min: 2,
      idleTimeoutMillis: 300000,
      reapIntervalMillis: 300000,
      destroyTimeoutMillis: 300000,
      createRetryIntervalMillis: 30000
    },
    acquireConnectionTimeout: 300000
  }
};

CONFIG.logger.timestamp = () => {
  const time = new Date().toISOString();
  return `,"time":"${time}"`;
};

module.exports = CONFIG;

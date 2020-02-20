const dotenv = require("dotenv");

dotenv.config();

const CONFIG = {
  port: process.env.PORT ? Number(process.env.PORT) : 7878,
  isProd: process.env.NODE_ENV === "prod",
  dbUri: process.env.DB_URI,
  redisUri: process.env.REDIS_URI
};

module.exports = CONFIG;

const Knex = require("knex");
const migrator = require("./migrator");
const CONFIG = require("../core/config.js");
const types = require("pg").types;
const Logger = require("../core/logger");
// Override parsing timestamptz and date column to Date()
types.setTypeParser(types.builtins.TIMESTAMPZ, val => val);
types.setTypeParser(types.builtins.DATE, val => val);
// Override parsing numeric column to string()
types.setTypeParser(1700, val => Number(val));

let db = Knex(CONFIG.knex);
Logger.info("Database connection established.");

module.exports = db;

module.exports.initializeDb = async function() {
  await db.migrate.latest({
    tableName: "migrations",
    migrationSource: migrator
  });
  Logger.info("Migrations completed.");
};

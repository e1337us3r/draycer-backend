const fs = require("fs").promises;
const path = require("path");
const semver = require("semver");

const baseMigrationPath = path.join(__dirname, "migrations");

module.exports = {
  async getMigrations() {
    const migrationFiles = await fs.readdir(baseMigrationPath);
    return migrationFiles
      .map(f => f.replace(/\.js/i, ""))
      .sort(semver.compare)
      .map(m => ({
        file: m,
        directory: baseMigrationPath
      }));
  },

  getMigrationName(migration) {
    return migration.file;
  },

  getMigration(migration) {
    return require(path.join(baseMigrationPath, migration.file));
  }
};

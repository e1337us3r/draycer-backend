const Pino = require("pino");
const CONFIG = require("./config");

const Logger = new Pino(CONFIG.logger);

module.exports = Logger;

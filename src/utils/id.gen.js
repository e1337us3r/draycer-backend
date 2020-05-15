const { nanoid } = require("nanoid");

module.exports = function generateId(length = 21) {
  return nanoid(length);
};

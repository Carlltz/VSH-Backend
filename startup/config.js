const config = require("config");

module.exports = function () {
  if (!config.get("jwtKey")) {
    throw new Error("FATAL ERROR: VSH_jwtKey is not defined.");
  }
  if (!config.get("db")) {
    throw new Error("FATAL ERROR: VSH_db is not defined.");
  }
};

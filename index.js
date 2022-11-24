require("./startup/logging")();
require("./startup/config.js")();
require("./startup/db")();

const express = require("express");
const app = express();
const winston = require("winston");

require("./startup/prod")(app);
require("./startup/routes")(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;

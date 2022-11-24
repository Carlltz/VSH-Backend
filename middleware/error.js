const winston = require("winston");

module.exports = function (err, req, res, next) {
  winston.error(err.message);

  // Can log:
  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  res.status(500).send("Something went wrong");
};

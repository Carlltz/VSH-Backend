const winston = require("winston");
require("winston-mongodb"); // Maybe comment out?!
require("express-async-errors");
const config = require("config");

module.exports = function () {
  /* process.on("uncaughtException", (ex) => {
  winston.error(ex.message);
  //process.exit(1);
}); */ // What winston.exceptions.handle really does!

  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  process.on("unhandledRejection", (ex) => {
    throw ex;
  }); // Handles unhandledRejections

  winston.add(
    new winston.transports.File({ filename: "logfile.log", level: "warn" })
  );
  winston.add(
    new winston.transports.MongoDB({
      db: config.get("db"),
      level: "warn", // Can pass level to just post important errors in db
      options: {
        useUnifiedTopology: true,
      },
    })
  ); // Maybe seperate db from real db. Maybe comment out?!
  winston.add(
    new winston.transports.Console({ colorize: true, prettyPrint: true })
  );
};

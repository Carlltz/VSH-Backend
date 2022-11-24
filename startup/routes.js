const test = require("../routes/test");
const users = require("../routes/users");
const usernames = require("../routes/usernames");
const auth = require("../routes/auth");
const groups = require("../routes/groups");
const recipes = require("../routes/recipes");

const express = require("express");
const error = require("../middleware/error");

module.exports = function (app) {
  // Middleware functions:
  app.use(express.json());
  app.use("/api/test", test);
  app.use("/api/users", users);
  app.use("/api/usernames", usernames);
  app.use("/api/auth", auth);
  app.use("/api/groups", groups);
  app.use("/api/recipes", recipes);
  app.use(error);
};

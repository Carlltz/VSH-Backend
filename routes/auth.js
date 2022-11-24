const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const mongoose = require("mongoose");
require("express-async-errors");
const bcrypt = require("bcrypt");
const joi = require("joi");

router.post("/", async (req, res) => {
  // Validation
  const { error } = validate(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  const email = req.body.email.toLowerCase();

  // Check if email exists
  const user = await User.findOne({
    email,
  });
  if (!user)
    return res
      .status(400)
      .send(
        "Ogiltig mail-adress eller lösenord, vänligen försök igen!"
      );

  const validPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validPassword)
    return res
      .status(400)
      .send(
        "Ogiltig mail-adress eller lösenord, vänligen försök igen!"
      );

  const token = user.generateAuthToken();
  const username = user.username;

  res.send({ token, username });
});

function validate(user) {
  const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  });
  return schema.validate(user);
}

module.exports = router;

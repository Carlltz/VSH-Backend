const express = require("express");
const router = express.Router();
require("express-async-errors");
const mongoose = require("mongoose");
const joi = require("joi");
const auth = require("../middleware/auth");

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlenght: 50,
    unique: true,
  },
});

const Test = mongoose.model("Test", testSchema);

router.get("/", async (req, res) => {
  const test = await Test.find().sort("name");
  res.send(test);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateTest(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  const test = new Test({
    name: req.body.name,
  });

  try {
    const result = await test.save();
    res.send(result);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send("Username already exists");
    } else {
      res.send(err.message);
    }
  }
});

function validateTest(genre) {
  const schema = joi.object({
    name: joi.string().min(3).max(50).required(),
  });
  return schema.validate(genre);
}

module.exports = router;

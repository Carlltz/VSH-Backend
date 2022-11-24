const express = require("express");
const router = express.Router();
require("express-async-errors");
const auth = require("../middleware/auth");
const {
  Username,
  validateUsername,
} = require("../models/username");

router.post("/search", auth, async (req, res) => {
  let username = await Username.find({
    username: { $regex: req.body.username, $options: "i" },
    uid: { $regex: req.body.uid },
  });
  res.send(username);
});

router.post("/data", auth, async (req, res) => {
  let username = await Username.find({ id: { $in: req.body } });
  res.send(username);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateTest(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  const test = new Username({
    username: req.body.name,
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

module.exports = router;

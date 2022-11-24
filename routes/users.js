const express = require("express");
const router = express.Router();
const { User, validateUser, validateUpdate } = require("../models/user");
const mongoose = require("mongoose");
require("express-async-errors");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const { Username } = require("../models/username");

router.get("/me/:fields", auth, async (req, res) => {
  const fields = req.params.fields.replaceAll("&", " ");
  if (!fields || fields.includes("password")) return res.status(500).send("Invalid params");

  const user = await User.findById(req.user._id).select(fields);
  res.send(user);
});

router.get("/firstGroup", auth, async (req, res) => {
  const firstGroup = await User.findOne({
    _id: req.user._id,
  })
    .select({ first: { $arrayElemAt: ["$groups", 0] } })
    .select("groups");

  res.send(firstGroup);
}); // Unused!

router.put("/me", auth, async (req, res) => {
  console.log(req.body);
  const { error } = validateUpdate(req.body);
  console.log(error);
  if (error) return res.status(400).send(error.details[0].message);
  let updates = {};
  Object.entries(req.body).forEach((key) => {
    updates = { ...updates, [key[0]]: key[1] };
  });
  console.log(updates);
  const result = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: updates,
    }
    // { new: true }
  );
  res.status(201).send("Updated");
});

router.post("/me", auth, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let updates = {};
  Object.entries(req.body).forEach((key) => {
    updates = {
      ...updates,
      [key[0]]: Array.isArray(key[1]) ? key[1] : [key[1]],
    };
  });
  const result = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updates,
    }
    // { new: true }
  );
  res.status(201).send("Updated");
});

router.delete("/me", auth, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let updates = {};
  Object.entries(req.body).forEach((key) => {
    updates = { ...updates, [key[0]]: [key[1]] };
  });
  const result = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pullAll: updates,
    }
    // { new: true }
  );
  res.status(201).send("Updated");
});

router.delete("/me/all/:fields", auth, async (req, res) => {
  const fields = req.params.fields.split("&");
  let updates = {};
  fields.forEach((field) => {
    updates = { ...updates, [field]: [] };
  });
  const result = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updates,
    }
    // { new: true }
  );
  res.status(201).send("Deleted");
});

router.post("/", async (req, res) => {
  // Validation
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.body.username.includes("#")) return res.status(400).send("Invalid char #");

  // Check if username with id exists
  const userExists = await User.exists({
    username: req.body.username,
  });
  const localuid = Math.floor(1000 + Math.random() * 9000);
  if (userExists) {
    let ids = await User.find({
      username: req.body.username,
    }).select("uid");
    ids = ids.map((id) => id.uid);
    while (ids.includes(localuid)) localuid = Math.floor(1000 + Math.random() * 9000);
  }

  // Check if email exists
  const emailExists = await User.findOne({
    email: req.body.email,
  });
  if (emailExists) return res.status(400).send("Mail-adressen är redan registrerad.\nTesta att logga in istället.");

  // It's working! Is it a transaction? Well idk... HAHA not working... JOO! Nu FAN!
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.create(
      [
        {
          username: req.body.username,
          uid: localuid.toString(),
          email: req.body.email.toLowerCase(),
          password: hashedPassword,
          groups: "Privat",
        },
      ],
      { session }
    );

    // Adding the link between _id and username
    const usernameCreated = await Username.create(
      [
        {
          username: req.body.username,
          uid: localuid.toString(),
          id: user[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Set jwt token
    const token = user[0].generateAuthToken();

    // Return user
    const { username, uid, email, _id } = user[0];
    res.header("VSH-auth-token", token).send({ username, uid, email, _id });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).send("An error occured: " + e);
  } finally {
    await session.endSession();
  }
});

module.exports = router;

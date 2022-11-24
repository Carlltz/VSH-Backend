const express = require("express");
const router = express.Router();
require("express-async-errors");
const auth = require("../middleware/auth");
const {
  Group,
  validateGroup,
  validateInitMemberData,
} = require("../models/group");
const { Username } = require("../models/username");
const {
  User,
  validateUser,
  validateUpdate,
} = require("../models/user");

router.get("/me", auth, async (req, res) => {
  // THIS! Is OP!
  console.log(req.user._id);
  const groups = await Group.find({
    [`members`]: req.user._id.toString(),
  });
  console.log("62f4f2373a3749c1d628d738");
  console.log(groups);
  res.send(groups);
});

router.post("/groupIds/:selections", auth, async (req, res) => {
  const fieselectionslds = req.params.selections.replaceAll(
    "&",
    " "
  );
  const group = await Group.find({
    _id: { $in: req.body.groupIds },
  }).select(selections);
  res.send(group);
});

router.delete("/leaveGroup/:groupId", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { groups: req.params.groupId },
      },
      { session }
    );
    await Group.findByIdAndUpdate(
      req.params.groupId,
      {
        $pull: {
          members: req.params.groupId,
          membersData: req.params.groupId,
        },
      },
      { session }
    );

    await session.commitTransaction();
    res.status(201).send("Deleted.");
  } catch (e) {
    await session.abortTransaction();
    res.status(500).send("An error occured: " + e);
  } finally {
    await session.endSession();
  }
});

router.put("/me/:id", auth, async (req, res) => {
  // Should add swipe data to group, not possible to add arrays but could fix it! Not so hard!
  const { error } = validateUpdate(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  let updates = {};
  Object.entries(req.body).forEach((key) => {
    updates = {
      ...updates,
      [`membersData.${req.user._id}.${key[0]}`]: key[1],
    };
  });

  const result = await Group.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: updates,
    },
    { new: true }
  );
  res.send(result);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateGroup(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  const group = new Group(req.body);

  // Started with code that would get id for username, but might just send it instead!
  /* let ids = []
  group.members.forEach(member => {
    ids.push(member.memberId)
  })

  const username = await Username.find({
    id: {$in: ids},
  }).select("username id");
  
   */

  try {
    const result = await group.save();
    res.send(result);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send("Group already exists");
    } else {
      res.send(err.message);
    }
  }
});

router.put("/initMemberData", auth, async (req, res) => {
  const { error } = validateInitMemberData(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  const group = await Group.findByIdAndUpdate(
    req.body._id,
    {
      $set: {
        [`membersData.${req.user._id}`]: { _id: req.user._id },
      },
    },
    { new: true }
  );

  res.send(group);
});

module.exports = router;

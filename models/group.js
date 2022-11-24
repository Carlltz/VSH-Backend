const joi = require("joi");
const mongoose = require("mongoose");
joi.objectId = require("joi-objectid")(joi);

const memberSchema = new mongoose.Schema({
  isMember: { type: Boolean, default: false },
  _id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
});

const membersDataSchema = new mongoose.Schema({
  liked: { type: [String] },
  disliked: { type: [String] },
  _id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  members: { type: Map, of: memberSchema },
  membersData: { type: Map, of: membersDataSchema },
});

const Group = mongoose.model("Group", groupSchema);

function validateGroup(group) {
  const schema = joi.object({
    name: joi.string().min(2).max(255).required(),
    members: joi.object().pattern(
      joi.objectId(),
      joi.object({
        isMember: joi.boolean(),
        _id: joi.objectId().required(),
      })
    ),
    membersData: joi.object().pattern(
      joi.objectId(),
      joi.object({
        liked: joi.array().items(joi.string()),
        disliked: joi.array().items(joi.string()),
        _id: joi.objectId().required(),
      })
    ),
  });
  return schema.validate(group);
}

function validateInitMemberData(data) {
  const schema = joi.object({
    _id: joi.objectId().required(),
  });
  return schema.validate(data);
}

exports.Group = Group;
exports.validateGroup = validateGroup;
exports.validateInitMemberData = validateInitMemberData;

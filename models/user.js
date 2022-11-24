const joi = require("joi");
const mongoose = require("mongoose");
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");
const config = require("config");
joi.objectId = require("joi-objectid")(joi);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlenght: 20,
  },
  uid: {
    type: String,
    required: true,
    minlength: 4,
    maxlenght: 4,
  },
  email: {
    type: String,
    required: true,
    minlength: 3,
    maxlenght: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlenght: 1024,
  },
  adminGroups: { type: [String], default: [] },
  disliked: { type: [String], default: [] },
  liked: { type: [String], default: [] },
  friends: { type: [mongoose.Types.ObjectId], default: [] },
  groups: { type: [String], default: [] },
  saved: { type: [String], default: [] },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    config.get("jwtKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const complexityOptions = {
    min: 8,
    max: 26,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    requirementCount: 4,
  };

  const schema = joi.object({
    username: joi.string().min(3).max(20).required(),
    email: joi.string().min(3).max(255).required().email(),
    password: passwordComplexity(complexityOptions).required(), //joi.string().min(3).max(255).required()
  });
  return schema.validate(user);
}

function validateUpdate(user) {
  const schema = joi.object({
    disliked: joi
      .array()
      .items(joi.string().min(1).max(255))
      .min(1)
      .max(255),
    liked: joi
      .array()
      .items(joi.string().min(1).max(255))
      .min(1)
      .max(255),
    friends: joi.string().min(1).max(255),
    groups: joi
      .array()
      .items(joi.string().min(1).max(255))
      .min(0)
      .max(255),
    saved: joi.string().min(1).max(255), // All of these should be objID!
  });
  return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
exports.validateUpdate = validateUpdate;

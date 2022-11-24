const joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlenght: 50,
  },
  uid: {
    type: String,
    required: true,
    minlength: 4,
    maxlenght: 4,
  },
});

const Username = mongoose.model("Username", userSchema);

function validateUser(user) {
  const schema = joi.object({
    username: joi.string().min(3).max(50).required(),
  });
  return schema.validate(user);
}

exports.Username = Username;
exports.validateUser = validateUser;

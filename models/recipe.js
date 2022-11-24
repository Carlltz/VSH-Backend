const joi = require("joi");
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  },
  image: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  ingredientAmount: {
    type: Number,
    required: true,
    minlength: 1,
    maxlength: 3,
  },
  stars: {
    type: [Number],
    required: true,
    minlength: 5,
    maxlength: 5,
  },
  time: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 63,
  },
  url: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

function validateRecipe(recipe) {
  let schema;
  if (Array.isArray(recipe)) {
    schema = joi
      .array()
      .items(
        joi.object({
          name: joi.string().min(1).max(255).required(),
          description: joi.string().min(1).max(500).required(),
          image: joi.string().min(1).max(255).required(),
          ingredientAmount: joi
            .number()
            .integer()
            .min(1)
            .max(99),
          stars: joi
            .array()
            .items(joi.number().integer().min(0).max(2))
            .min(5)
            .max(5)
            .required(),
          time: joi.string().min(1).max(63).required(),
          url: joi.string().min(1).max(255).uri().required(),
        })
      )
      .required();
  } else {
    schema = joi.object({
      name: joi.string().min(1).max(255).required(),
      description: joi.string().min(1).max(500).required(),
      image: joi.string().min(1).max(255).required(),
      ingredientAmount: joi.number().integer().min(1).max(99),
      stars: joi
        .array()
        .items(joi.number().integer().min(0).max(2))
        .length(5)
        .required(),
      time: joi.string().min(1).max(63).required(),
      url: joi.string().min(1).max(255).uri().required(),
    });
  }
  return schema.validate(recipe);
}

exports.Recipe = Recipe;
exports.validateRecipe = validateRecipe;

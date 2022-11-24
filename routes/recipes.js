const express = require("express");
const router = express.Router();
require("express-async-errors");
const auth = require("../middleware/auth");
const { Recipe, validateRecipe } = require("../models/recipe");

router.get("/", auth, async (req, res) => {
  const recipes = await Recipe.find();
  res.send(recipes);
});

router.get("/:ids", auth, async (req, res) => {
  const ids = req.params.ids;
});

router.post("/", auth, async (req, res) => {
  // Special operation!
  const { error } = validateRecipe(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  let result;
  if (Array.isArray(req.body)) {
    result = await Recipe.insertMany(req.body);
  } else {
    result = await Recipe.create(req.body);
  }
  res.status(201).json(result);
});

module.exports = router;

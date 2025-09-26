const express = require("express");
const Game = require("../models/Game");

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    let query = {};
    if (req.query.provider) query.provider_name = req.query.provider;
    if (req.query.category) query["game_category.Roulette"] = req.query.category;
    if (req.query.subcategory) query.game_subcategory = req.query.subcategory;
    if (req.query.tag) query.game_tag = req.query.tag;

    let games = await Game.find(query);


    if (req.query.sortBy === "category") {
      games.sort((a, b) =>
        JSON.stringify(a.game_category).localeCompare(JSON.stringify(b.game_category))
      );
    } else if (req.query.sortBy === "subcategory") {
      games.sort((a, b) =>
        (a.game_subcategory[0] || "").localeCompare(b.game_subcategory[0] || "")
      );
    }

    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/filters", async (req, res) => {
  try {
    const providers = await Game.distinct("provider_name");
    const subcategories = await Game.distinct("game_subcategory");
    const tags = await Game.distinct("game_tag");


    const categoriesRaw = await Game.find().select("game_category -_id");
    const categories = [...new Set(categoriesRaw.flatMap(c => Object.keys(c.game_category)))];

    res.json({ providers, categories, subcategories, tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




router.patch("/:id/priority", async (req, res) => {
  try {
    const { priority } = req.body;
    const updated = await Game.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;

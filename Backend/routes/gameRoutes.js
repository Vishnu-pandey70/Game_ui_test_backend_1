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

// router.patch("/update-priorities", async (req, res) => {
//   try {
//     const { games, tag } = req.body;
//     if (!tag) return res.status(400).json({ error: "Tag is required" });

//     const bulkOps = games.map((g) => ({
//       updateOne: {
//         filter: { _id: g._id },
//         update: { $set: { [`tag_priorities.${tag}`]: g.priority } },
//       },
//     }));

//     await Game.bulkWrite(bulkOps);
//     res.json({ success: true, message: `Priorities updated for tag: ${tag}` });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.patch("/update-priorities", async (req, res) => {
  try {
    const { games, tag } = req.body;
    if (!games || !Array.isArray(games)) return res.status(400).json({ error: "Games array is required" });

    const bulkOps = games.map((g) => {
      const update = tag ? { [`tag_priorities.${tag}`]: g.priority } : { priority: g.priority };
      return { updateOne: { filter: { _id: g._id }, update: { $set: update } } };
    });

    await Game.bulkWrite(bulkOps);
    res.json({ success: true, message: tag ? `Tag priorities updated` : "Global priorities updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Load JSON file (you can replace this with MongoDB later)
const rawData = fs.readFileSync("Game_list.json");
const games = JSON.parse(rawData);

// API to fetch all games
app.get("/api/games", (req, res) => {
  res.json(games);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

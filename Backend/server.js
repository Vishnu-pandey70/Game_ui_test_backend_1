const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (like Game_list.json)
app.use(express.static("public"));


app.get("/api/games", (req, res) => {
  res.sendFile(__dirname + "/public/Game_list.json");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

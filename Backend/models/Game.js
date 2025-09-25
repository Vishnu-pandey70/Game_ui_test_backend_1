const mongoose = require("mongoose");

const IntegrationSchema = new mongoose.Schema({
  int_platform: { type: String },
  opening_env: { type: String },
  orientation: { type: String },
  scene: { type: String },
  url_path: { type: String },
  canvas: { type: String },
  panel: { type: String },
});

const GameSchema = new mongoose.Schema(
  {
    opr_id: { type: String },
    game_code: { type: String },
    game_name: { type: String },
    game_icon: { type: String },
    
    game_category: { type: Object, required: false },
    game_subcategory: { type: [String], default: [] },
    game_tag: { type: [String], default: [] },
    game_status: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    operational_status: { type: String },
    provider_name: { type: String },
    provider_code: { type: String },
    integration_env_config: { type: [IntegrationSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", GameSchema);

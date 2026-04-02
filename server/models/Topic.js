const mongoose = require("mongoose");

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const subtopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    difficulty: { type: String, required: true, enum: DIFFICULTIES },
    isWeak: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameKey: { type: String, required: true, unique: true },
  subtopics: [subtopicSchema],
  createdAt: { type: Date, default: Date.now },
});

const model = mongoose.model("Topic", topicSchema);
model.DIFFICULTIES = DIFFICULTIES;
module.exports = model;

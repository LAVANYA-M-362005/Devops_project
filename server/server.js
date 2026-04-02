require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Topic = require("./models/Topic");
const DIFFICULTIES = Topic.DIFFICULTIES;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/placement_tracker";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

function normalizeKey(str) {
  return String(str).trim().toLowerCase();
}

function validateScorePayload(body) {
  const { topic, subtopic, score, difficulty } = body;
  if (topic === undefined || typeof topic !== "string" || !topic.trim()) {
    return "topic (string) is required";
  }
  if (subtopic === undefined || typeof subtopic !== "string" || !subtopic.trim()) {
    return "subtopic (string) is required";
  }
  const scoreNum = Number(score);
  if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
    return "score must be a number between 0 and 100";
  }
  if (difficulty === undefined || !DIFFICULTIES.includes(difficulty)) {
    return `difficulty must be one of: ${DIFFICULTIES.join(", ")}`;
  }
  return null;
}

function suggestionForTopic(topic) {
  const t = String(topic).toLowerCase();
  if (t.includes("dsa") || t.includes("data structure") || t.includes("algorithm"))
    return "Focus more on Data Structures and Algorithms";
  if (t.includes("dbms") || t.includes("database") || t.includes("sql"))
    return "Revise database concepts";
  if (t.includes("os") || t.includes("operating system"))
    return "Practice operating system concepts";
  return null;
}

function collectWeakEntries(topics) {
  const out = [];
  for (const doc of topics) {
    for (const st of doc.subtopics) {
      if (st.isWeak) {
        out.push({
          topicName: doc.name,
          subtopicName: st.name,
        });
      }
    }
  }
  return out;
}

function buildSuggestions(weakEntries) {
  if (weakEntries.length === 0) {
    return "Great job! No weak areas detected — keep practicing consistently.";
  }
  const seenDomain = new Set();
  const domainParts = [];
  const detailLabels = [];
  for (const { topicName, subtopicName } of weakEntries) {
    const s = suggestionForTopic(topicName);
    if (s && !seenDomain.has(s)) {
      seenDomain.add(s);
      domainParts.push(s);
    }
    detailLabels.push(`${topicName} → ${subtopicName}`);
  }
  const details = `Prioritize: ${[...new Set(detailLabels)].join("; ")}.`;
  return [...domainParts, details].join(" ");
}

function flattenSubtopicStats(topics) {
  let totalSubtopics = 0;
  let weakSubtopics = 0;
  let sum = 0;
  for (const t of topics) {
    for (const s of t.subtopics) {
      totalSubtopics++;
      sum += s.score;
      if (s.isWeak) weakSubtopics++;
    }
  }
  return { totalSubtopics, weakSubtopics, sum };
}

app.post("/api/scores", async (req, res) => {
  try {
    const errMsg = validateScorePayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const topicRaw = String(req.body.topic).trim();
    const subtopicRaw = String(req.body.subtopic).trim();
    const scoreNum = Number(req.body.score);
    const { difficulty } = req.body;
    const isWeak = scoreNum < 50;

    const nameKey = normalizeKey(topicRaw);
    const subKey = normalizeKey(subtopicRaw);

    let doc = await Topic.findOne({ nameKey });
    if (doc) {
      const dup = doc.subtopics.some((s) => normalizeKey(s.name) === subKey);
      if (dup) {
        return res.status(409).json({ error: "This subtopic already exists under this topic" });
      }
      doc.subtopics.push({
        name: subtopicRaw,
        score: scoreNum,
        difficulty,
        isWeak,
        createdAt: new Date(),
      });
      await doc.save();
      return res.status(201).json(doc);
    }

    doc = await Topic.create({
      name: topicRaw,
      nameKey,
      subtopics: [
        {
          name: subtopicRaw,
          score: scoreNum,
          difficulty,
          isWeak,
          createdAt: new Date(),
        },
      ],
    });
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Topic already exists (duplicate key)" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scores", async (req, res) => {
  try {
    const items = await Topic.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/weak", async (req, res) => {
  try {
    const topics = await Topic.find({ "subtopics.isWeak": true });
    const out = [];
    for (const t of topics) {
      for (const st of t.subtopics) {
        if (st.isWeak) {
          out.push({
            topicId: t._id,
            topicName: t.name,
            subtopic: st.toObject(),
          });
        }
      }
    }
    out.sort((a, b) => new Date(b.subtopic.createdAt) - new Date(a.subtopic.createdAt));
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/scores/:topicId/:subtopicId", async (req, res) => {
  try {
    const { topicId, subtopicId } = req.params;
    const doc = await Topic.findById(topicId);
    if (!doc) return res.status(404).json({ error: "Topic not found" });
    const sub = doc.subtopics.id(subtopicId);
    if (!sub) return res.status(404).json({ error: "Subtopic not found" });
    doc.subtopics.pull(subtopicId);
    await doc.save();
    if (doc.subtopics.length === 0) {
      await Topic.findByIdAndDelete(topicId);
    }
    res.json({ message: "Deleted", topicId, subtopicId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const all = await Topic.find();
    const totalTopics = all.length;
    const { totalSubtopics, weakSubtopics, sum } = flattenSubtopicStats(all);
    const averageScore = totalSubtopics === 0 ? 0 : Math.round((sum / totalSubtopics) * 10) / 10;
    res.json({ totalTopics, totalSubtopics, weakSubtopics, averageScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/suggestions", async (req, res) => {
  try {
    const topics = await Topic.find();
    const weakEntries = collectWeakEntries(topics);
    const text = buildSuggestions(weakEntries);
    res.json({ suggestion: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});

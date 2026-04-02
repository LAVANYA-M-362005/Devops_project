import { useState } from "react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function AddTopicForm({ onSubmit, busy }) {
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [score, setScore] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  function handleSubmit(e) {
    e.preventDefault();
    const n = Number(score);
    if (topic.trim() === "" || subtopic.trim() === "" || Number.isNaN(n)) return;
    if (n < 0 || n > 100) return;
    onSubmit({ topic: topic.trim(), subtopic: subtopic.trim(), score: n, difficulty });
    setTopic("");
    setSubtopic("");
    setScore("");
    setDifficulty("Easy");
  }

  return (
    <section className="card">
      <h2>Add subtopic</h2>
      <p className="form-hint">Each topic name is unique; new entries add a subtopic under it.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Topic
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. DSA, DBMS, OS"
            required
          />
        </label>
        <label>
          Subtopic
          <input
            type="text"
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value)}
            placeholder="e.g. Arrays, Deadlocks"
            required
          />
        </label>
        <label>
          Score (0–100)
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="0–100"
            required
          />
        </label>
        <label>
          Difficulty
          <select className="select-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save subtopic"}
        </button>
      </form>
    </section>
  );
}

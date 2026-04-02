import { useState, useEffect, useCallback } from "react";
import api from "./api";
import Dashboard from "./components/Dashboard.jsx";
import AddTopicForm from "./components/AddTopicForm.jsx";
import TopicsList from "./components/TopicsList.jsx";
import WeakAreas from "./components/WeakAreas.jsx";
import Suggestions from "./components/Suggestions.jsx";

const emptyStats = {
  totalTopics: 0,
  totalSubtopics: 0,
  weakSubtopics: 0,
  averageScore: 0,
};

export default function App() {
  const [topics, setTopics] = useState([]);
  const [weakItems, setWeakItems] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [suggestion, setSuggestion] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyKey, setBusyKey] = useState(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [scoresRes, weakRes, statsRes, suggestRes] = await Promise.all([
        api.get("/api/scores"),
        api.get("/api/weak"),
        api.get("/api/stats"),
        api.get("/api/suggestions"),
      ]);
      setTopics(scoresRes.data);
      setWeakItems(weakRes.data);
      setStats(statsRes.data);
      setSuggestion(suggestRes.data.suggestion || "");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAdd(payload) {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/scores", payload);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSubtopic(topicId, subtopicId) {
    const key = `${topicId}:${subtopicId}`;
    setBusyKey(key);
    setError("");
    try {
      await api.delete(`/api/scores/${topicId}/${subtopicId}`);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to delete");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Placement Preparation Tracker</h1>
        <p>Track topics and subtopics, spot weak areas from scores, and follow focused suggestions.</p>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? (
        <p className="loading">Loading…</p>
      ) : (
        <div className="grid grid-main">
          <div className="grid">
            <Dashboard stats={stats} />
            <AddTopicForm onSubmit={handleAdd} busy={submitting} />
            <WeakAreas weakItems={weakItems} />
            <Suggestions text={suggestion} />
          </div>
          <TopicsList
            topics={topics}
            filter={filter}
            onFilterChange={setFilter}
            onDeleteSubtopic={handleDeleteSubtopic}
            busyKey={busyKey}
          />
        </div>
      )}
    </div>
  );
}

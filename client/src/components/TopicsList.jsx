function filterTopics(topics, filter) {
  return topics
    .map((t) => ({
      ...t,
      subtopics: (t.subtopics || []).filter((s) => {
        if (filter === "weak") return s.isWeak;
        if (filter === "strong") return !s.isWeak;
        return true;
      }),
    }))
    .filter((t) => t.subtopics.length > 0);
}

export default function TopicsList({ topics, filter, onFilterChange, onDeleteSubtopic, busyKey }) {
  const filtered = filterTopics(topics, filter);

  return (
    <section className="card">
      <h2>Topics &amp; subtopics</h2>
      <div className="filters">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => onFilterChange("all")}>
          All
        </button>
        <button type="button" className={filter === "weak" ? "active" : ""} onClick={() => onFilterChange("weak")}>
          Weak
        </button>
        <button
          type="button"
          className={filter === "strong" ? "active" : ""}
          onClick={() => onFilterChange("strong")}
        >
          Strong
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="empty">Nothing in this view yet.</p>
      ) : (
        <ul className="topic-tree">
          {filtered.map((t) => (
            <li key={t._id} className="topic-group">
              <div className="topic-heading">Topic: {t.name}</div>
              <ul className="subtopic-list">
                {t.subtopics.map((s) => {
                  const key = `${t._id}:${s._id}`;
                  return (
                    <li key={s._id} className="subtopic-row">
                      <div className="subtopic-meta">
                        <span className="subtopic-name">{s.name}</span>
                        <span className="score-pill">Score: {s.score}</span>
                        <span className={s.isWeak ? "badge badge-weak" : "badge badge-strong"}>
                          {s.isWeak ? "Weak" : "Strong"}
                        </span>
                        <span className="diff-pill">{s.difficulty}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={busyKey === key}
                        onClick={() => onDeleteSubtopic(t._id, s._id)}
                      >
                        Delete
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

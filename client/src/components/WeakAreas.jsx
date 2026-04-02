export default function WeakAreas({ weakItems }) {
  return (
    <section className="card">
      <h2>Weak areas</h2>
      {weakItems.length === 0 ? (
        <p className="empty">No weak subtopics — scores below 50 appear here.</p>
      ) : (
        <ul className="weak-list">
          {weakItems.map((w) => (
            <li key={`${w.topicId}-${w.subtopic._id}`} className="weak-chip">
              <span className="weak-label">
                {w.topicName} → {w.subtopic.name}
              </span>
              <span className="weak-meta">
                {w.subtopic.score} · {w.subtopic.difficulty}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard({ stats }) {
  return (
    <section className="card">
      <h2>Dashboard</h2>
      <div className="stats-row stats-row-4">
        <div className="stat">
          <div className="stat-value">{stats.totalTopics}</div>
          <div className="stat-label">Total topics</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.totalSubtopics}</div>
          <div className="stat-label">Total subtopics</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.weakSubtopics}</div>
          <div className="stat-label">Weak subtopics</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.averageScore}</div>
          <div className="stat-label">Avg score</div>
        </div>
      </div>
    </section>
  );
}

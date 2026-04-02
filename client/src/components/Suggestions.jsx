export default function Suggestions({ text }) {
  return (
    <section className="card">
      <h2>Suggestions</h2>
      <p className="suggestion-box">{text || "Loading…"}</p>
    </section>
  );
}

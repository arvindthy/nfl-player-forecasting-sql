export default function AboutPage() {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">About Me</p>
        <h2>Builder Notes</h2>
        <p>Fantasy forecasting powered by research, film notes, and data systems.</p>
      </div>

      <div className="about-card">
        <p>
          I build weekly forecasting tools that blend play-level data, team context,
          and usage trends to surface confident fantasy decisions. The goal is
          simple: translate noisy stats into crisp, actionable insights every week.
        </p>
        <div className="about-meta">
          <div>
            <span>Focus</span>
            <strong>NFL Fantasy (PPR)</strong>
          </div>
          <div>
            <span>Data Stack</span>
            <strong>SQL, Python, Pandas</strong>
          </div>
          <div>
            <span>Workflow</span>
            <strong>Modeling + Game Film</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

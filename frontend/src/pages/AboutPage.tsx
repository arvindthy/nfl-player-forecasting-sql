export default function AboutPage() {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">About Me</p>
        <h2>Builder Notes</h2>
        <p>
          An end-to-end NFL fantasy forecasting platform built to turn raw game data
          into structured weekly decisions.
        </p>
      </div>

      <div className="about-card">
        <p>
          This project is a hands-on exploration of sports analytics, data modeling,
          and decision systems. I designed and built the platform end-to-end — from
          ingesting raw NFL data to presenting week-by-week forecasts through a
          fast, interactive UI.
        </p>

        <p>
          The core challenge is not data scarcity, but noise. NFL stats are deeply
          contextual: usage changes weekly, matchups matter, and box scores often
          hide more than they reveal. This system focuses on structuring that chaos
          into stable signals that support confident fantasy decisions.
        </p>

        <div className="about-meta">
          <div>
            <span>Domain Focus</span>
            <strong>NFL Fantasy Forecasting (PPR)</strong>
          </div>
          <div>
            <span>Data & Modeling</span>
            <strong>PostgreSQL, Python, Pandas</strong>
          </div>
          <div>
            <span>Backend</span>
            <strong>Django, Read-only APIs</strong>
          </div>
          <div>
            <span>Frontend</span>
            <strong>React, TypeScript, Custom Dashboards</strong>
          </div>
          <div>
            <span>Approach</span>
            <strong>Data Engineering + Game Context</strong>
          </div>
        </div>

        <p className="about-footnote">
          Beyond fantasy football, this project serves as a practical showcase of how
          I approach ambiguous data problems: model the domain carefully, favor
          interpretable signals over black boxes, and design systems that scale
          cleanly as complexity increases.
        </p>
      </div>
    </section>
  );
}

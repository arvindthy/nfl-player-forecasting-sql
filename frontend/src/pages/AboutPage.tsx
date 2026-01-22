export default function AboutPage() {
  return (
    <section className="section about-page">
      <div className="about-header">
        <div className="section-header">
          <h2>About</h2>
          <p>
            A product builder view of the person, the system, and the reasoning
            behind the design choices.
          </p>
		  <p><b>Project Repository: &nbsp;</b>
			<a 
				href="https://github.com/arvindthy"
				className="about-link"
			>
				https://github.com/arvindthy/nfl-player-forecasting-sql</a></p>
        </div>
        <section className="about-links">
	      <p>		
			<b>LinkedIn: &nbsp;</b>
			<a
				href="https://www.linkedin.com/in/arvindthy"
				target="_blank"
				rel="noopener noreferrer"
				className="about-link"
			>
				linkedin.com/in/arvindthy
			</a>
		  </p>
		  <p>
			<b>GitHub: &nbsp;</b>
			<a
				href="https://github.com/arvindthy"
				target="_blank"
				rel="noopener noreferrer"
				className="about-link"
			>
				github.com/arvindthy
			</a>
		  </p>
		  <p>
			<b>Email: &nbsp;</b>
			<a className="about-link" href="mailto:arvindthy@gmail.com">
				arvindthy@gmail.com
			</a>
		  </p>
        </section>
      </div>

      <section className="about-hero">
        <div className="about-portrait">
          <img src="/arvind_mask.png" alt="ArvindFFB portrait" />
        </div>
        <div className="about-bio">
          <p className="about-kicker">ARVIND THYAGARAJAN</p>
          <h3>Turning messy data into calm decisions.</h3>
		  <p className="stage-tile">
			I’m <b>Arvind Thyagarajan</b>, a recent Managerial Economics graduate from UC Davis 
			with experience in government consulting, financial analysis, and self-directed 
			AI/BI projects. I currently work on <b>CDMO Exchange</b>, a B2B decision-support 
			platform where I help develop data models and fit-scoring logic that combine 
			structured capability data, quality indicators, and risk metrics to enable 
			informed partner selection and process oversight in pharmaceutical manufacturing.
		 </p>

          <p>
            I built this Fantasy Football Forecasting platform to make weekly NFL decisions feel grounded. The
            focus is not raw stats, but the story they imply: how usage shifts,
            matchups change, and context drives fantasy outcomes.
          </p>
          <p>
            The system blends data engineering, applied analytics, and product UX
            into one workflow so the outputs stay explainable and useful under real
            conditions.
          </p>
          
        </div>
      </section>

      <section className="about-architecture">
        <div className="about-section-header">
          <p className="about-kicker">System Architecture</p>
          <h3>From raw NFL data to decision-ready dashboards.</h3>
        </div>
        <div className="architecture-grid">
          <div className="architecture-stage">
            <span className="stage-title">Ingestion</span>
            <div className="stage-tile">nflverse CSVs</div>
            <div className="stage-tile">Python + pandas</div>
            <div className="stage-tile">raw schema</div>
          </div>
          <div className="architecture-stage">
            <span className="stage-title">Modeling</span>
            <div className="stage-tile">PostgreSQL</div>
            <div className="stage-tile">SQL views</div>
            <div className="stage-tile">PPR signals</div>
          </div>
          <div className="architecture-stage">
            <span className="stage-title">Backend</span>
            <div className="stage-tile">Django API</div>
            <div className="stage-tile">Read-only queries</div>
            <div className="stage-tile">Cached analytics</div>
          </div>
          <div className="architecture-stage">
            <span className="stage-title">Frontend</span>
            <div className="stage-tile">React + TypeScript</div>
            <div className="stage-tile">Dashboards</div>
            <div className="stage-tile">Teams → Players</div>
          </div>
        </div>
        <p className="architecture-footnote">
          Built and iterated across multiple NFL seasons (2018–2024), with
          performance handled through precomputed SQL views and lean APIs.
        </p>
      </section>

      <section className="about-philosophy">
        <div className="about-section-header">
          <p className="about-kicker">Builder Philosophy</p>
          <h3>Intentional choices that shape the product.</h3>
        </div>
        <div className="philosophy-grid">
          <div className="philosophy-card">
            <h4>Interpretability stays visible</h4>
            <p>
              Accuracy and bias are surfaced alongside forecasts so users understand
              how the system behaves, not just the final number.
            </p>
          </div>
          <div className="philosophy-card">
            <h4>Result-first navigation</h4>
            <p>
              The flow mirrors real decisions: Teams lead to key players, while
              forecasting stays filter-first for weekly context.
            </p>
          </div>
          <div className="philosophy-card">
            <h4>Data design over novelty</h4>
            <p>
              Strong SQL modeling and clean aggregates scale better than flashy
              metrics, keeping the system trustworthy as data grows.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}

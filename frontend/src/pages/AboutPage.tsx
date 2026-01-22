import { useState } from "react";

type TileSection = {
  title?: string;
  body: string;
  code?: string;
  list?: string[];
  diagram?: string;
};

type TileDetail = {
  id: string;
  label: string;
  summary: string;
  sections: TileSection[];
  stage?: string;
};

const ARCHITECTURE_STAGES: Array<{
  title: string;
  tiles: TileDetail[];
}> = [
  {
    title: "Ingestion",
    tiles: [
      {
        id: "csvs",
        label: "nflverse CSVs",
        summary:
          "The source-of-truth files for every dataset live under backend/data/raw and travel with the repo.",
        sections: [
          {
            title: "Source dump",
            body:
              "Weekly exports from nflverse — games.csv, player_stats.csv, and metadata — cover seasons 2018‑2025. We keep the raw files in place so the ingestion scripts stay repeatable.",
            list: [
              "games.csv → raw.nflverse_games",
              "player_stats.csv → raw.nflverse_player_game_stats",
              "players.csv → lookup tables + headshots",
            ],
          },
          {
            title: "Refresh flow",
            body:
              "Custom loaders in scripts/ use SQLAlchemy to connect to the Postgres instance and overwrite raw tables before any derived views run.",
            code:
              "with engine.begin() as conn:\n    conn.exec_driver_sql(\"TRUNCATE TABLE raw.nflverse_player_game_stats\")\n    df.to_sql(\"nflverse_player_game_stats\", conn, schema=\"raw\", if_exists=\"append\", index=False)",
          },
        ],
      },
      {
        id: "python",
        label: "Python + pandas",
        summary:
          "Python/pandas orchestrate the cleanup, enrichment, and exports of the imported CSVs so SQL can breathe easier.",
        sections: [
          {
            title: "ETL steps",
            body:
              "pandas RTT is used to normalize datetimes, coerce numeric columns, calculate derived flags (overtime, rest days), and add IDs before the data lands in Postgres.",
            list: [
              "load CSVs with pd.read_csv(...) and inferschema",
              "normalize gameday/weekday with pd.to_datetime",
              "derive `game_id` + `home_away` using vectorized logic",
            ],
          },
          {
            title: "Snippet",
            body: "A taste of the transformation that guards type safety before data joins.",
            code:
              "games = pd.read_csv(csv_path)\ngames[\"gameday\"] = pd.to_datetime(games[\"gameday\"])\ngames[\"game_id\"] = games[\"season\"].astype(str) + \"-\" + games[\"week\"].astype(str) + \"-\" + games[\"home_team\"]",
          },
        ],
      },
      {
        id: "raw-schema",
        label: "raw schema",
        summary:
          "The raw schema mirrors the files with minimal change so the analytic layers stay auditable.",
        sections: [
          {
            title: "Tables",
            body:
              "raw.nflverse_games and raw.nflverse_player_game_stats keep the original columns and allow future analysts to re-materialize any signal.",
            list: [
              "raw.nflverse_games (season, week, home_team, away_team, scores, weather)",
              "raw.nflverse_player_game_stats (player_id, passing_yards, targets, epa, etc.)",
            ],
          },
          {
            title: "Why raw",
            body:
              "Downstream views decide on COALESCE defaults, so the raw schema avoids premature assumptions or imputation.",
            diagram: "CSV drop → raw tables → analytics views",
          },
        ],
      },
    ],
  },
  {
    title: "Modeling",
    tiles: [
      {
        id: "postgres",
        label: "PostgreSQL",
        summary:
          "Postgres keeps the data durable at scale, with indexes and materialized views supporting low-latency analytics.",
        sections: [
          {
            title: "Platform",
            body:
              "The database runs Postgres 14, and we rely on indexes (season/week), numeric casts, and VACUUMed tables to keep aggregations snappy.",
          },
          {
            title: "Signal flow",
            body:
              "Daily refreshes populate raw tables, then the SQL views that follow normalize, de-duplicate, and join metadata for the analytics API.",
            diagram: "raw tables → analytics.player_game_facts → API views",
          },
        ],
      },
      {
        id: "sql-views",
        label: "SQL views",
        summary:
          "SQL views distill the raw rows into digestible records for every player and game.",
        sections: [
          {
            title: "Composition",
            body:
              "Views like analytics.player_game_facts and analytics.player_game_facts_ppr aggregate the per-play data into season/week rollups with clean aliases.",
            code:
              "SELECT p.player_id,\n       SUM(p.passing_yards) AS passing_yards,\n       SUM(p.rushing_yards) AS rushing_yards\nFROM raw.nflverse_player_game_stats p\nWHERE p.season = %s\nGROUP BY p.player_id",
          },
          {
            title: "Why views",
            body:
              "They keep the ingestion scripts lean and let the API reuse the same SQL logic for forecasts, metrics, and player details.",
          },
        ],
      },
      {
        id: "ppr-signals",
        label: "PPR signals",
        summary:
          "Signals such as EPA adjustments and usage rates power the fantasy scoring story.",
        sections: [
          {
            title: "Key metrics",
            body:
              "Each player record exposes playing-time volume and efficiency indicators, from targets and air yards to passing/rushing/receiving EPA.",
            list: [
              "passing_epa & rushing_epa for efficiency",
              "fantasy_points_ppr splits volume and scoring",
              "target_share + air_yards_share capture opportunity",
            ],
          },
          {
            title: "Visualization",
            body:
              "These metrics feed the frontend tables and heatmaps so users can contrast the season averages with weekly volatility.",
          },
        ],
      },
    ],
  },
  {
    title: "Backend",
    tiles: [
      {
        id: "django-api",
        label: "Django API",
        summary:
          "Django wraps the SQL views, manages token auth, and serves only read endpoints.",
        sections: [
          {
            title: "Security",
            body:
              "`token_auth_required` guards every analytics endpoint, and CORS headers are applied centrally so clients can reuse the same domain-safe token.",
          },
          {
            title: "Endpoints",
            body:
              "The analytics_api app exposes overview, games, forecasts, MVPs, and player-details endpoints over those cached SQL views.",
          },
        ],
      },
      {
        id: "read-only",
        label: "Read-only queries",
        summary:
          "All database interactions are read-only, keeping analytics reproducible and safe.",
        sections: [
          {
            title: "Why read-only",
            body:
              "By avoiding writes, the production API can run on replicas while the ETL pipeline exclusively owns the raw tables.",
            list: [
              "fetch_games/ fetch_metrics/ fetch_filters reuse the same query builder",
              "No transactions or data mutations in API view code",
            ],
          },
          {
            title: "Debug visibility",
            body:
              "Each service file logs the generated SQL cleanly, so you can replicate the queries in psql or a SQL client.",
          },
        ],
      },
      {
        id: "cached",
        label: "Cached analytics",
        summary:
          "Key dashboards are materialized in the cache to keep the landing page fast.",
        sections: [
          {
            title: "Home cache",
            body:
              "home_dashboard_cache stores metrics, MVP data, and MAE so the landing page or mobile clients avoid re-running the heavy SQL.",
          },
          {
            title: "Refresh cadence",
            body:
              "A nightly job replaces the cache per season, and fetch_latest_home_cache returns the reference data plus timestamps for freshness.",
          },
        ],
      },
    ],
  },
  {
    title: "Frontend",
    tiles: [
      {
        id: "react",
        label: "React + TypeScript",
        summary:
          "The UI is a TypeScript SPA built with Vite, React Router, and shared theme tokens.",
        sections: [
          {
            title: "Structure",
            body:
              "AppShell provides the nav, themes manage CSS custom properties, and AppRoutes wires pages such as Games, Teams, Players, and Forecasting.",
          },
          {
            title: "Type safety",
            body:
              "Shared types (`@/types/games`, `@/types/forecast`) keep the API responses in sync and guard against silent undefined fields.",
          },
        ],
      },
      {
        id: "dashboards",
        label: "Dashboards",
        summary:
          "Interactive dashboards are the product’s heart; every hero, filter, and board refreshes in sync with the backend.",
        sections: [
          {
            title: "Experience",
            body:
              "GamesPage, ForecastExplorer, and TeamsPage use collapsible filters, highlight cards, and modal detail views to make exploration feel deliberate.",
          },
          {
            title: "State",
            body:
              "Each page keeps API/loading/error state together so components can show skeletons, errors, or the results board without jumping around.",
          },
        ],
      },
      {
        id: "teams-players",
        label: "Teams → Players",
        summary:
          "Navigation flows from teams to rosters to player profiles for fast scouting.",
        sections: [
          {
            title: "Flow",
            body:
              "TeamsPage summarizes win totals, then each roster row links directly to PlayerProfilePage (or the modal) with season/week filters pre-applied.",
          },
          {
            title: "Context",
            body:
              "PlayerProfileCard reuses the same detail view for the home page, games modal, and team pages so consistency stays tight.",
          },
        ],
      },
    ],
  },
];

export default function AboutPage() {
  const [activeTile, setActiveTile] = useState<TileDetail | null>(null);
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
          {ARCHITECTURE_STAGES.map((stage) => (
            <div key={stage.title} className="architecture-stage">
              <span className="stage-title">{stage.title}</span>
              {stage.tiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  className="stage-tile tile-button"
                  onClick={() => setActiveTile({ ...tile, stage: stage.title })}
                  aria-label={`Learn more about ${tile.label}`}
                >
                  {tile.label}
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className="architecture-footnote">
          Built and iterated across multiple NFL seasons (2018–2024), with
          performance handled through precomputed SQL views and lean APIs.
        </p>
      </section>

      {activeTile && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveTile(null)}
        >
          <div
            className="tile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setActiveTile(null)}
            >
              ×
            </button>
            <div className="tile-modal-header">
              {activeTile.stage && (
                <p className="modal-eyebrow">{activeTile.stage}</p>
              )}
              <h3>{activeTile.label}</h3>
              <p className="tile-modal-summary">{activeTile.summary}</p>
            </div>
            <div className="tile-modal-body">
              {activeTile.sections.map((section, index) => (
                <section key={`${activeTile.id}-${index}`} className="tile-section">
                  {section.title && <h4>{section.title}</h4>}
                  <p>{section.body}</p>
                  {section.list && (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.code && (
                    <pre className="tile-code">
                      <code>{section.code}</code>
                    </pre>
                  )}
                  {section.diagram && (
                    <div className="tile-diagram">{section.diagram}</div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

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

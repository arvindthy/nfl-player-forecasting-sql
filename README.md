# NFL Player Performance Forecasting (PPR) — SQL-Driven Analytics Project

## Overview

This project builds a **player-level performance forecasting system for the NFL (2025 season)**, with a deliberate focus on **SQL-first data modeling, analytics, and explainability**.

The goal is not to build a black-box prediction model, but to design a **transparent, production-style analytics pipeline** that mirrors how sports analytics and data engineering teams work in real environments.

The system forecasts **expected PPR fantasy points per player per game**, supported by clearly explainable components such as usage trends, matchup strength, and game context.

---

## Key Objectives

- Design a **relational data model** for NFL player, team, and game data
- Showcase **advanced SQL**:
  - Window functions
  - Rolling aggregates
  - Multi-level joins
  - Feature engineering via views
- Separate **data modeling**, **analytics**, and **presentation**
- Maintain realism in both data and workflow

---

## Forecasting Scope

- **Sport:** NFL (American Football)
- **Season:** 2025 Regular Season
- **Positions:** QB, RB, WR, TE
- **Scoring System:** Standard PPR (Point Per Reception)
- **Prediction Unit:** Player–Game
- **Primary Output:** Expected Fantasy Points (PPR)

---

## Scoring Rules (PPR)

| Category | Points |
|--------|--------|
| Passing Yards | 1 point per 25 yards |
| Passing TD | 4 points |
| Interception | −2 points |
| Rushing Yards | 1 point per 10 yards |
| Rushing TD | 6 points |
| Receiving Yards | 1 point per 10 yards |
| Receiving TD | 6 points |
| Reception | 1 point |
| Fumble Lost | −2 points |

---

## Architectural Philosophy

This project follows a **data-first, SQL-centric approach**:

- **PostgreSQL** is the single source of truth
- **Django** is used only for:
  - Schema management
  - Data ingestion
  - Admin-based inspection
- **All analytics logic lives in SQL**, not Python
- Forecasts are built as:
  - SQL views
  - Feature tables
  - Explainable aggregations

---

## Technology Stack

### Data & Backend
- PostgreSQL (central analytics database)
- Django (models, migrations, admin, ingestion)

### Analytics
- Pure SQL (CTEs, window functions, views)
- No ML frameworks in v1 by design

### Development
- VS Code
- Python (Django management commands)
- GitHub (versioned, documented workflow)

---

## Project Phases

### Phase 1 — Data Foundation (Current)
- PostgreSQL setup on a dedicated server
- Django project initialization
- Core schema definition
- Realistic sample data ingestion
- Data inspection via Django Admin

### Phase 2 — SQL Analytics & Forecasting
- Feature engineering using SQL
- Rolling usage & efficiency metrics
- Opponent-adjusted projections
- Weekly forecast generation
- Backtesting and evaluation

### Phase 3 — Presentation (Optional)
- Read-only analytics views
- Player projection dashboards
- Weekly leaderboards

---

## Design Principles

- **Explainability over opacity**
- **SQL over abstraction**
- **Realistic constraints**
- **Incremental, testable development**

This repository is intentionally structured to resemble how analytics projects evolve in professional environments.

---

## Status

🚧 **Active Development — Phase 1**

PostgreSQL infrastructure and project scaffolding are complete.  
Schema design and data ingestion are in progress.

---

## Author

**Arvind Thyagarajan**  


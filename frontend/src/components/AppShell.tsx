import { NavLink, Outlet } from "react-router-dom";
import { useMemo, useState } from "react";
import "@/App.css";
import {
  applyTheme,
  defaultThemeId,
  getStoredThemeId,
  storeThemeId,
  themes,
  getThemeById,
} from "@/themes";

export default function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeId, setThemeId] = useState(getStoredThemeId());
  const [draftThemeId, setDraftThemeId] = useState(themeId);
  const activeTheme = useMemo(() => getThemeById(themeId), [themeId]);

  const handleThemeChange = (nextThemeId: string) => {
    const nextTheme =
      themes.find((theme) => theme.id === nextThemeId) ??
      getThemeById(defaultThemeId);
    setThemeId(nextTheme.id);
    storeThemeId(nextTheme.id);
    applyTheme(nextTheme);
  };

  const handleOpenSettings = () => {
    setDraftThemeId(themeId);
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setDraftThemeId(themeId);
    setSettingsOpen(false);
  };

  const handleApplyTheme = () => {
    handleThemeChange(draftThemeId);
    setSettingsOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <img className="brand-logo" src="/logo_mask.png" alt="ArvindFFB logo" />
          <div>
            <p className="brand-eyebrow">Fantasy Forecasting</p>
            <h1>ArvindFFB</h1>
          </div>
        </div>
        <div className="top-bar-actions">
          <nav className="nav-tabs">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/forecasting"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Forecasting
            </NavLink>
            <NavLink
              to="/games"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Games
            </NavLink>
            <NavLink
              to="/teams"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Teams
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              About Me
            </NavLink>
          </nav>
          <button
            type="button"
            className="settings-button"
            aria-label="Open settings"
            onClick={handleOpenSettings}
          >
            ⚙
          </button>
        </div>
      </header>

      <main className="main-sections">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-item">
          <span>Contact</span>
          <strong>arvindthy@gmail.com</strong>
        </div>
        <div className="footer-item">
          <span>Website</span>
          <a className="footer-link" href="https://arvindffb.com" target="_blank" rel="noreferrer">
            arvindffb.com
          </a>
        </div>
        <div className="footer-item">
          <span>Built with</span>
          <strong>SQL + Python + React</strong>
        </div>
        <div className="footer-item">
          <span>ArvindFFB</span>
          <strong>Fantasy forecasting for the data-obsessed.</strong>
        </div>
        <div className="footer-logo footer-logo-right">
          <img src="/logo_mask.png" alt="ArvindFFB logo" />
        </div>
      </footer>
      {settingsOpen && (
        <div className="modal-backdrop" onClick={handleCloseSettings}>
          <div className="settings-modal" onClick={(event) => event.stopPropagation()}>
            <div className="settings-header">
              <p className="modal-eyebrow">Settings</p>
              <h3>Theme Selector</h3>
              <p>Choose a UI theme that fits your vibe.</p>
            </div>
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={
                    theme.id === draftThemeId ? "theme-card active" : "theme-card"
                  }
                  onClick={() => setDraftThemeId(theme.id)}
                  style={{
                    background: theme.variables["--color-bg"],
                    color: theme.variables["--color-text-rgb"]
                      ? `rgb(${theme.variables["--color-text-rgb"]})`
                      : undefined,
                    borderColor: theme.variables["--color-border-rgb"]
                      ? `rgba(${theme.variables["--color-border-rgb"]}, 0.5)`
                      : undefined,
                  }}
                >
                  <span>{theme.name}</span>
                  <div className="theme-preview">
                    <span
                      className="theme-swatch"
                      style={{
                        background: `rgb(${theme.variables["--color-accent-rgb"]})`,
                      }}
                    />
                    <span
                      className="theme-swatch"
                      style={{
                        background: `rgb(${theme.variables["--color-accent-2-rgb"]})`,
                      }}
                    />
                    <span
                      className="theme-swatch"
                      style={{
                        background: `rgb(${theme.variables["--color-accent-3-rgb"]})`,
                      }}
                    />
                    <span
                      className="theme-swatch"
                      style={{
                        background: `rgb(${theme.variables["--color-surface-rgb"]})`,
                        borderColor: `rgba(${theme.variables["--color-border-rgb"]}, 0.6)`,
                      }}
                    />
                  </div>
                  <strong>
                    {theme.id === draftThemeId
                      ? "Selected"
                      : theme.id === themeId
                        ? "Active"
                        : "Preview"}
                  </strong>
                </button>
              ))}
            </div>
            <div className="theme-current">
              <span>Current theme</span>
              <strong>{activeTheme.name}</strong>
            </div>
            <div className="theme-actions">
              <button type="button" className="theme-button" onClick={handleCloseSettings}>
                Close
              </button>
              <button
                type="button"
                className="theme-button primary"
                onClick={handleApplyTheme}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

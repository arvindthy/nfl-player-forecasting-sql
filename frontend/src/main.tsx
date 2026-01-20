import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { applyTheme, defaultThemeId, getStoredThemeId, themes } from "./themes";

const storedThemeId = getStoredThemeId();
const initialTheme =
  themes.find((theme) => theme.id === storedThemeId) ??
  themes.find((theme) => theme.id === defaultThemeId)!;
applyTheme(initialTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

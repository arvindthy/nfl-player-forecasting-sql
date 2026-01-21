import { midnightPro } from './definitions/midnightPro';
import { gridironGold } from './definitions/gridironGold';
import { endzoneRed } from './definitions/endzoneRed';
import { frozenTundra } from './definitions/frozenTundra';
import { vintageLeather } from './definitions/vintageLeather';
import { neonNight } from './definitions/neonNight';
import { slateTactical } from './definitions/slateTactical';
import { blitzOrange } from './definitions/blitzOrange';
import { royalPurple } from './definitions/royalPurple';
import { awayJersey } from './definitions/awayJersey';
import { desertHeat } from './definitions/desertHeat';
import { deepSea } from './definitions/deepSea';
import type { Theme } from './types';

export const themes: Theme[] = [
  midnightPro,
  gridironGold,
  endzoneRed,
  frozenTundra,
  vintageLeather,
  neonNight,
  slateTactical,
  blitzOrange,
  royalPurple,
  awayJersey,
  desertHeat,
  deepSea,
];

export const defaultThemeId = midnightPro.id;
const storageKey = "arvindffb-theme";

export const getStoredThemeId = () =>
  localStorage.getItem(storageKey) ?? defaultThemeId;

export const storeThemeId = (themeId: string) => {
  localStorage.setItem(storageKey, themeId);
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  Object.entries(theme.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.dataset.theme = theme.id;
  // Optional: Set a data-attribute for dark/light mode if you have specific overrides
  root.dataset.mode = theme.type; 
};

// Helper to find a theme object by ID
export const getThemeById = (id: string): Theme => {
  return themes.find(t => t.id === id) || themes[0];
};

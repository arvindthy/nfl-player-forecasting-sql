//Deep Sea (Dark): A teal/aquamarine theme. Unlike the "Navy" or "Black" themes, this uses rich dark teal backgrounds with electric mint accents
import type { Theme } from '../types';

export const deepSea: Theme = {
  id: "deep-sea",
  name: "Deep Sea",
  type: 'dark',
  variables: {
    "--font-body": "\"Barlow\", system-ui, sans-serif",
    "--font-display": "\"Bebas Neue\", sans-serif",
    
    // FIX 1: Background is now Deep Navy/Black (The Abyss)
    // No longer green.
    "--color-bg": "#0f172a",                  // Slate-900
    "--color-bg-rgb": "15, 23, 42",
    
    // FIX 2: Cards are Dark Slate (The Rocks)
    // Provides contrast against the background without being teal.
    "--color-surface-rgb": "30, 41, 59",      // Slate-800
    "--color-surface-2-rgb": "51, 65, 85",    // Slate-700
    "--color-surface-3-rgb": "45, 212, 191",  // Teal Accent
    "--color-surface-4-rgb": "15, 118, 110",
    "--color-surface-5-rgb": "17, 94, 89",

    // FIX 3: Text is White (Clarity)
    // Removed the "Teal-tinted" text that was hurting readability.
    "--color-text-rgb": "248, 250, 252",      // Slate-50
    "--color-text-muted-rgb": "148, 163, 184", // Slate-400 (Grey, not Green)
    "--color-text-dim-rgb": "100, 116, 139",  // Slate-500
    "--color-label-rgb": "124, 252, 0",
    "--color-kpi-label-rgb": "124, 252, 0",

    // Borders: Cool Grey
    "--color-border-rgb": "124, 252, 0", //"51, 65, 85",       // Slate-700
    "--color-border-light-rgb": "71, 85, 105", // Slate-600

    // Accents: Electric Teal (The Bioluminescence)
    // This is where the color lives now.
    "--color-accent-rgb": "45, 212, 191",     // Teal-400 (Bright)
    "--color-accent-2-rgb": "20, 184, 166",   // Teal-500 (Base)
    "--color-accent-3-rgb": "13, 148, 136",   // Teal-600 (Dark)
    "--color-ambient-1-rgb": "45, 212, 191",
    "--color-ambient-2-rgb": "34, 211, 238",  // Cyan

    "--color-warning-rgb": "250, 204, 21",
    "--color-success-rgb": "34, 197, 94",
    "--color-info-rgb": "56, 189, 248",
    "--color-purple-rgb": "168, 85, 247",
    
    "--color-warning-text-rgb": "254, 240, 138",
    "--color-success-text-rgb": "187, 247, 208",
    "--color-purple-text-rgb": "233, 213, 255",
    "--color-info-text-rgb": "186, 230, 253",
    
    "--color-shadow-rgb": "2, 6, 23",
    "--color-white-rgb": "255, 255, 255",
    "--color-ink-rgb": "15, 23, 42",
    "--color-ink-strong-rgb": "2, 6, 23",
    "--color-slate-rgb": "100, 116, 139",
    "--color-slate-strong-rgb": "71, 85, 105",
    "--color-surface-light-rgb": "255, 255, 255",
  },
};
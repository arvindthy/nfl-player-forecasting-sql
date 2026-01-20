import type { Theme } from '../types';

export const awayJersey: Theme = {
  id: "away-jersey",
  name: "Away Jersey",
  type: 'light',
  variables: {
    "--font-body": "\"Barlow\", system-ui, sans-serif",
    "--font-display": "\"Bebas Neue\", sans-serif",
    
    // FIX 1: Background darkened to "Athletic Grey" (Slate-200)
    // This provides a distinct backdrop for the white cards.
    "--color-bg": "#e2e8f0",
    "--color-bg-rgb": "226, 232, 240",

    // FIX 2: Cards set to Pure White for maximum pop
    "--color-surface-rgb": "255, 255, 255",
    "--color-surface-2-rgb": "241, 245, 249", // Slate-100 for alternate rows
    "--color-surface-3-rgb": "51, 65, 85",    // Slate-700
    "--color-surface-4-rgb": "30, 41, 59",
    "--color-surface-5-rgb": "71, 85, 105",

    // FIX 3: Stronger borders (Slate-400)
    // Previously invisible, now clearly defines the grid
    "--color-border-rgb": "0, 0, 0",
    "--color-border-light-rgb": "203, 213, 225", // Slate-300 for subtle dividers

    // Text (Dark Navy for sharp contrast)
    "--color-text-rgb": "15, 23, 42",         // Slate-900
    "--color-text-muted-rgb": "71, 85, 105",  // Slate-600 (Readable grey)
    "--color-text-dim-rgb": "100, 116, 139",  // Slate-500
    "--color-label-rgb": "0, 0, 0",
    "--color-kpi-label-rgb": "0, 0, 0",

    // Accents
    "--color-ambient-1-rgb": "71, 85, 105",
    "--color-ambient-2-rgb": "100, 116, 139",
    "--color-accent-rgb": "15, 23, 42",       // Dark Navy (Team Color)
    "--color-accent-2-rgb": "71, 85, 105",    // Slate
    "--color-accent-3-rgb": "226, 232, 240",  // Light Grey Accent

    "--color-warning-rgb": "234, 88, 12",     // Burnt Orange
    "--color-success-rgb": "21, 128, 61",     // Deep Green
    "--color-info-rgb": "2, 132, 199",        // Sky Blue
    "--color-purple-rgb": "126, 34, 206",
    
    "--color-warning-text-rgb": "154, 52, 18",
    "--color-success-text-rgb": "22, 101, 52",
    "--color-purple-text-rgb": "107, 33, 168",
    "--color-info-text-rgb": "12, 74, 110",
    
    // Shadows
    "--color-shadow-rgb": "100, 116, 139",    // Grey shadow, not black
    "--color-white-rgb": "255, 255, 255",
    "--color-ink-rgb": "241, 245, 249",
    "--color-ink-strong-rgb": "255, 255, 255",
    "--color-slate-rgb": "100, 116, 139",
    "--color-slate-strong-rgb": "71, 85, 105",
    "--color-surface-light-rgb": "255, 255, 255",
  },
};
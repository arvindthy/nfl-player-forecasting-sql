import type { Theme } from '../types';

export const frozenTundra: Theme = {
  id: "frozen-tundra",
  name: "Frozen Tundra",
  type: 'light',
  variables: {
    "--font-body": "\"Barlow\", system-ui, sans-serif",
    "--font-display": "\"Bebas Neue\", sans-serif",
    
    // FIX 1: Background darkened to a cool grey-blue. 
    // This makes the white cards stand out instantly.
    "--color-bg": "#dae4ef",
    "--color-bg-rgb": "218, 228, 239",

    // FIX 2: Cards remain pure white for contrast against the new background
    "--color-surface-rgb": "255, 255, 255",
    "--color-surface-2-rgb": "241, 245, 249", // Slate-100 (for alternate rows)
    "--color-surface-3-rgb": "14, 165, 233",
    "--color-surface-4-rgb": "2, 132, 199",
    "--color-surface-5-rgb": "3, 105, 161",
    
    "--color-ambient-1-rgb": "56, 189, 248",
    "--color-ambient-2-rgb": "186, 230, 253",

    // FIX 3: Darker borders. 
    // Previous borders were too light to see against the light background.
    "--color-border-rgb": "71, 85, 105",       // Slate-600 (Strong border)
    "--color-border-light-rgb": "148, 163, 184", // Slate-400 (Visible card dividers)

    // Text & Labels (High Contrast Navy)
    "--color-text-rgb": "15, 23, 42",          // Slate-900 (Main text)
    "--color-text-muted-rgb": "71, 85, 105",   // Slate-600 (Secondary text)
    "--color-text-dim-rgb": "100, 116, 139",   // Slate-500 (Tertiary)
    "--color-label-rgb": "51, 65, 85",
    "--color-kpi-label-rgb": "30, 41, 59",     // Darker for KPI labels

    // Accents
    "--color-accent-rgb": "2, 132, 199",       // Deep Sky
    "--color-accent-2-rgb": "14, 165, 233",    // Sky
    "--color-accent-3-rgb": "15, 23, 42",      // Navy (High contrast accent)
    
    "--color-warning-rgb": "234, 88, 12",      // Darker Orange for visibility
    "--color-success-rgb": "22, 163, 74",      // Green-600
    "--color-info-rgb": "2, 132, 199",
    "--color-purple-rgb": "126, 34, 206",
    
    "--color-warning-text-rgb": "154, 52, 18", // Red-Orange text
    "--color-success-text-rgb": "20, 83, 45",  // Dark Green text
    "--color-purple-text-rgb": "88, 28, 135",
    "--color-info-text-rgb": "12, 74, 110",
    
    // Shadows
    "--color-shadow-rgb": "148, 163, 184",     // Cool grey shadow
    "--color-white-rgb": "255, 255, 255",
    "--color-ink-rgb": "15, 23, 42",
    "--color-ink-strong-rgb": "2, 6, 23",
    "--color-slate-rgb": "71, 85, 105",
    "--color-slate-strong-rgb": "51, 65, 85",
    "--color-surface-light-rgb": "255, 255, 255",
  },
};
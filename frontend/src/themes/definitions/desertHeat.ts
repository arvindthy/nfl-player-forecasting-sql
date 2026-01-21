//Desert Heat (Light): A warm, sandy theme. Unlike your "Ice" and "Grey" themes, this uses warm beige and deep copper tones. It features a visible sand-colored background to make the white cards pop.
import type { Theme } from '../types';

export const desertHeat: Theme = {
  id: "desert-heat",
  name: "Desert Heat",
  type: 'light',
  variables: {
    "--font-body": "\"Barlow\", system-ui, sans-serif",
    "--font-display": "\"Bebas Neue\", sans-serif",
    
    // Background: Warm Sand (Stone-200)
    // Dark enough to make White cards stand out clearly
    "--color-bg": "#e7e5e4",
    "--color-bg-rgb": "231, 229, 228",

    // Cards: Pure White
    "--color-surface-rgb": "255, 255, 255",
    "--color-surface-2-rgb": "250, 250, 249", // Warm White (Stone-50)
    "--color-surface-3-rgb": "234, 88, 12",   // Burnt Orange
    "--color-surface-4-rgb": "194, 65, 12",
    "--color-surface-5-rgb": "154, 52, 18",

    // Text: Deep Espresso/Copper (High Contrast)
    "--color-text-rgb": "28, 25, 23",         // Stone-900 (Black-Brown)
    "--color-text-muted-rgb": "87, 83, 78",   // Stone-600 (Dark Grey-Brown)
    "--color-text-dim-rgb": "120, 113, 108",  // Stone-500
    "--color-label-rgb": "0, 0, 0",
    "--color-kpi-label-rgb": "0, 0, 0",

    // Borders: Warm Grey
    "--color-border-rgb": "0, 0, 0",    // Stone-400
    "--color-border-light-rgb": "214, 211, 209", // Stone-300

    // Accents: Copper & Orange
    "--color-accent-rgb": "234, 88, 12",      // Burnt Orange
    "--color-accent-2-rgb": "194, 65, 12",    // Rust
    "--color-accent-3-rgb": "251, 146, 60",   // Light Orange
    "--color-ambient-1-rgb": "234, 88, 12",
    "--color-ambient-2-rgb": "253, 186, 116",

    "--color-warning-rgb": "234, 179, 8",
    "--color-success-rgb": "21, 128, 61",     // Green
    "--color-info-rgb": "14, 165, 233",
    "--color-purple-rgb": "147, 51, 234",
    
    "--color-warning-text-rgb": "133, 77, 14",
    "--color-success-text-rgb": "20, 83, 45",
    "--color-purple-text-rgb": "107, 33, 168",
    "--color-info-text-rgb": "12, 74, 110",
    
    "--color-shadow-rgb": "28, 25, 23",       // Warm Shadow
    "--color-white-rgb": "255, 255, 255",
    "--color-ink-rgb": "28, 25, 23",
    "--color-ink-strong-rgb": "12, 10, 9",
    "--color-slate-rgb": "120, 113, 108",
    "--color-slate-strong-rgb": "87, 83, 78",
    "--color-surface-light-rgb": "255, 255, 255",
  },
};
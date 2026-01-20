// Midnight Pro (Modern, Sleek, Data-Heavy) Deep blue-black background with electric blue accents. Used for high-contrast stats.

import type { Theme } from '../types';

export const midnightPro: Theme = {
  id: "midnight-pro",
  name: "Midnight Pro",
  type: 'dark',
  variables: {
    "--font-body": "\"Barlow\", system-ui, sans-serif",
    "--font-display": "\"Bebas Neue\", sans-serif",
    "--color-bg": "#020617",
    "--color-bg-rgb": "2, 6, 23",
    "--color-surface-rgb": "15, 23, 42",
    "--color-surface-2-rgb": "30, 41, 59",
    "--color-surface-3-rgb": "56, 189, 248",
    "--color-surface-4-rgb": "14, 165, 233",
    "--color-surface-5-rgb": "7, 89, 133",
    "--color-ambient-1-rgb": "14, 165, 233",
    "--color-ambient-2-rgb": "99, 102, 241",
    "--color-border-rgb": "173, 216, 230", //"51, 65, 85",
    "--color-label-rgb": "173, 216, 230", //game cards labels
    "--color-kpi-label-rgb": "173, 216, 230", //"255, 255, 255",
    "--color-text-rgb": "255, 255, 255", //"248, 250, 252",
    "--color-text-muted-rgb": "255, 255, 255", //"148, 163, 184",
    "--color-text-dim-rgb": "255, 255, 255", //"71, 85, 105",
    "--color-accent-rgb": "56, 189, 248",      // Electric Blue
    "--color-accent-2-rgb": "99, 102, 241",    // Indigo
    "--color-accent-3-rgb": "14, 165, 233",    // Sky
    "--color-warning-rgb": "234, 179, 8",
    "--color-success-rgb": "34, 197, 94",
    "--color-info-rgb": "56, 189, 248",
    "--color-purple-rgb": "168, 85, 247",
    "--color-warning-text-rgb": "254, 240, 138",
    "--color-success-text-rgb": "187, 247, 208",
    "--color-purple-text-rgb": "233, 213, 255",
    "--color-info-text-rgb": "186, 230, 253",
    "--color-shadow-rgb": "2, 6, 23",
    "--color-white-rgb": "255, 255, 255",
    "--color-ink-rgb": "2, 6, 23",
    "--color-ink-strong-rgb": "0, 0, 0",
    "--color-slate-rgb": "100, 116, 139",
    "--color-slate-strong-rgb": "71, 85, 105",
    "--color-border-light-rgb": "30, 41, 59",
    "--color-surface-light-rgb": "255, 255, 255",
  },
};

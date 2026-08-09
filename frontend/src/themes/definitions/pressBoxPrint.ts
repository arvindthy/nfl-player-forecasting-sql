import type { Theme } from "../types";

export const pressBoxPrint: Theme = {
  id: "press-box-print",
  name: "Press Box Print",
  type: "light",
  description: "Paper + screenshots",
  variables: {
    "--font-body": '"Barlow", system-ui, sans-serif',
    "--font-display": '"Bebas Neue", sans-serif',

    // Near-white page stock with pure-white content surfaces.
    "--color-bg": "#f3f4f6",
    "--color-bg-rgb": "243, 244, 246",
    "--color-surface-rgb": "255, 255, 255",
    "--color-surface-2-rgb": "248, 250, 252",
    "--color-surface-3-rgb": "219, 234, 254",
    "--color-surface-4-rgb": "191, 219, 254",
    "--color-surface-5-rgb": "226, 232, 240",

    // Ink-first typography remains legible on office printers.
    "--color-text-rgb": "0, 0, 0",
    "--color-text-muted-rgb": "17, 24, 39",
    "--color-text-dim-rgb": "31, 41, 55",
    "--color-label-rgb": "0, 0, 0",
    "--color-kpi-label-rgb": "0, 0, 0",

    // A restrained editorial blue with print-safe semantic accents.
    "--color-accent-rgb": "29, 78, 216",
    "--color-accent-2-rgb": "180, 83, 9",
    "--color-accent-3-rgb": "219, 234, 254",
    "--color-ambient-1-rgb": "147, 197, 253",
    "--color-ambient-2-rgb": "226, 232, 240",
    "--color-warning-rgb": "194, 65, 12",
    "--color-success-rgb": "21, 128, 61",
    "--color-info-rgb": "3, 105, 161",
    "--color-purple-rgb": "109, 40, 217",
    "--color-warning-text-rgb": "124, 45, 18",
    "--color-success-text-rgb": "20, 83, 45",
    "--color-purple-text-rgb": "88, 28, 135",
    "--color-info-text-rgb": "12, 74, 110",

    // Crisp outlines replace ink-heavy shadows and dark panels.
    "--color-border-rgb": "15, 23, 42",
    "--color-border-light-rgb": "148, 163, 184",
    "--color-shadow-rgb": "148, 163, 184",
    "--color-white-rgb": "0, 0, 0",
    "--color-ink-rgb": "248, 250, 252",
    "--color-ink-strong-rgb": "0, 0, 0",
    "--color-slate-rgb": "71, 85, 105",
    "--color-slate-strong-rgb": "30, 41, 59",
    "--color-surface-light-rgb": "255, 255, 255",
  },
};

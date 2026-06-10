// PATH: src/pages/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const themes = {
  forest: {
    name: "Forest Green", emoji: "🌿",
    // ── Sidebar CSS vars (Sidebar.css) ──
    "--sb-bg":            "#f8fdf9",
    "--sb-border":        "#e2f0e8",
    "--sb-logo-bg":       "#1a3d2b",
    "--sb-text":          "#3d6b52",
    "--sb-text-muted":    "#7aab8e",
    "--sb-hover-bg":      "#edf7f1",
    "--sb-hover-text":    "#1a3d2b",
    "--sb-active-bg":     "#2d6a4f",
    "--sb-active-text":   "#ffffff",
    "--sb-active-icon":   "rgba(255,255,255,0.9)",
    "--sb-icon-bg":       "#e8f5ed",
    "--sb-icon-color":    "#2d6a4f",
    "--sb-sub-border":    "#c8e6d0",
    "--sb-sub-text":      "#5a8f72",
    "--sb-sub-active":    "#1a3d2b",
    "--sb-dot":           "#b0d9be",
    "--sb-dot-active":    "#2d6a4f",
    "--sb-search-bg":     "#ffffff",
    "--sb-search-border": "#d4ead9",
    // ── Layout ──
    "--manod-page-bg":    "#f0f4f1",
    "--manod-topbar":     "linear-gradient(90deg,#14532d 0%,#166534 100%)",
    // ── Page-wide accent colours ──
    "--manod-accent":          "#2d6a4f",
    "--manod-accent-light":    "#e8f5ed",
    "--manod-accent-mid":      "#74c69d",
    "--manod-welcome-bg":      "linear-gradient(135deg,#1a3d2b 0%,#2d6a4f 60%,#52b788 100%)",
    "--manod-welcome-text":    "#ffffff",
    "--manod-welcome-sub":     "rgba(255,255,255,0.75)",
    "--manod-btn-primary-bg":  "#2d6a4f",
    "--manod-btn-primary-text":"#ffffff",
    "--manod-btn-active-bg":   "#1a3d2b",
    "--manod-card-border-top": "#2d6a4f",
    "--manod-card-icon-bg":    "#e8f5ed",
    "--manod-card-icon-color": "#2d6a4f",
    "--manod-stat-up":         "#16a34a",
    "--manod-stat-down":       "#dc2626",
    "--manod-chart-1":         "#2d6a4f",
    "--manod-chart-2":         "#74c69d",
    "--manod-chart-3":         "#b7e4c7",
    "--manod-link":            "#2d6a4f",
    "--manod-focus-ring":      "rgba(45,106,79,0.18)",
    // JS props for preview
    topbarGradient: "linear-gradient(90deg,#14532d 0%,#166534 100%)",
    pageBg: "#f0f4f1", accent: "#2d6a4f", sidebar: "#1a3d2b",
  },
  ocean: {
    name: "Ocean Blue", emoji: "🌊",
    "--sb-bg":            "#f0f6ff",
    "--sb-border":        "#c7ddf5",
    "--sb-logo-bg":       "#0f2744",
    "--sb-text":          "#1e4a7c",
    "--sb-text-muted":    "#6d9bc3",
    "--sb-hover-bg":      "#deeeff",
    "--sb-hover-text":    "#0f2744",
    "--sb-active-bg":     "#1a3d6b",
    "--sb-active-text":   "#ffffff",
    "--sb-active-icon":   "rgba(255,255,255,0.9)",
    "--sb-icon-bg":       "#dbeafe",
    "--sb-icon-color":    "#1d4ed8",
    "--sb-sub-border":    "#93c5fd",
    "--sb-sub-text":      "#3b6fa0",
    "--sb-sub-active":    "#0f2744",
    "--sb-dot":           "#93c5fd",
    "--sb-dot-active":    "#1a3d6b",
    "--sb-search-bg":     "#ffffff",
    "--sb-search-border": "#bfdbfe",
    "--manod-page-bg":    "#f0f4ff",
    "--manod-topbar":     "linear-gradient(90deg,#0f2744 0%,#1e3a5f 100%)",
    "--manod-accent":          "#1a3d6b",
    "--manod-accent-light":    "#dbeafe",
    "--manod-accent-mid":      "#60a5fa",
    "--manod-welcome-bg":      "linear-gradient(135deg,#0f2744 0%,#1a3d6b 60%,#3b82f6 100%)",
    "--manod-welcome-text":    "#ffffff",
    "--manod-welcome-sub":     "rgba(255,255,255,0.75)",
    "--manod-btn-primary-bg":  "#1a3d6b",
    "--manod-btn-primary-text":"#ffffff",
    "--manod-btn-active-bg":   "#0f2744",
    "--manod-card-border-top": "#1a3d6b",
    "--manod-card-icon-bg":    "#dbeafe",
    "--manod-card-icon-color": "#1d4ed8",
    "--manod-stat-up":         "#16a34a",
    "--manod-stat-down":       "#dc2626",
    "--manod-chart-1":         "#1a3d6b",
    "--manod-chart-2":         "#60a5fa",
    "--manod-chart-3":         "#bfdbfe",
    "--manod-link":            "#1d4ed8",
    "--manod-focus-ring":      "rgba(26,61,107,0.18)",
    topbarGradient: "linear-gradient(90deg,#0f2744 0%,#1e3a5f 100%)",
    pageBg: "#f0f4ff", accent: "#1a3d6b", sidebar: "#0f2744",
  },
  sunset: {
    name: "Sunset Orange", emoji: "🌅",
    "--sb-bg":            "#fff8f3",
    "--sb-border":        "#f5d5b8",
    "--sb-logo-bg":       "#3d1a0f",
    "--sb-text":          "#7c3a1a",
    "--sb-text-muted":    "#c08060",
    "--sb-hover-bg":      "#fdeee4",
    "--sb-hover-text":    "#3d1a0f",
    "--sb-active-bg":     "#6b2d1a",
    "--sb-active-text":   "#ffffff",
    "--sb-active-icon":   "rgba(255,255,255,0.9)",
    "--sb-icon-bg":       "#fed7aa",
    "--sb-icon-color":    "#c2410c",
    "--sb-sub-border":    "#fdba74",
    "--sb-sub-text":      "#a8450f",
    "--sb-sub-active":    "#3d1a0f",
    "--sb-dot":           "#fdba74",
    "--sb-dot-active":    "#6b2d1a",
    "--sb-search-bg":     "#ffffff",
    "--sb-search-border": "#fed7aa",
    "--manod-page-bg":    "#fff7f0",
    "--manod-topbar":     "linear-gradient(90deg,#3d1a0f 0%,#7c2d12 100%)",
    "--manod-accent":          "#6b2d1a",
    "--manod-accent-light":    "#fed7aa",
    "--manod-accent-mid":      "#fb923c",
    "--manod-welcome-bg":      "linear-gradient(135deg,#3d1a0f 0%,#6b2d1a 60%,#f97316 100%)",
    "--manod-welcome-text":    "#ffffff",
    "--manod-welcome-sub":     "rgba(255,255,255,0.75)",
    "--manod-btn-primary-bg":  "#6b2d1a",
    "--manod-btn-primary-text":"#ffffff",
    "--manod-btn-active-bg":   "#3d1a0f",
    "--manod-card-border-top": "#f97316",
    "--manod-card-icon-bg":    "#fed7aa",
    "--manod-card-icon-color": "#c2410c",
    "--manod-stat-up":         "#16a34a",
    "--manod-stat-down":       "#dc2626",
    "--manod-chart-1":         "#6b2d1a",
    "--manod-chart-2":         "#fb923c",
    "--manod-chart-3":         "#fed7aa",
    "--manod-link":            "#c2410c",
    "--manod-focus-ring":      "rgba(107,45,26,0.18)",
    topbarGradient: "linear-gradient(90deg,#3d1a0f 0%,#7c2d12 100%)",
    pageBg: "#fff7f0", accent: "#6b2d1a", sidebar: "#3d1a0f",
  },
  violet: {
    name: "Royal Violet", emoji: "💜",
    "--sb-bg":            "#f8f4ff",
    "--sb-border":        "#ddd0f8",
    "--sb-logo-bg":       "#1e0b3a",
    "--sb-text":          "#4a2080",
    "--sb-text-muted":    "#9070c0",
    "--sb-hover-bg":      "#ede6ff",
    "--sb-hover-text":    "#1e0b3a",
    "--sb-active-bg":     "#3b1a6b",
    "--sb-active-text":   "#ffffff",
    "--sb-active-icon":   "rgba(255,255,255,0.9)",
    "--sb-icon-bg":       "#ede9fe",
    "--sb-icon-color":    "#6d28d9",
    "--sb-sub-border":    "#c4b5fd",
    "--sb-sub-text":      "#6030a8",
    "--sb-sub-active":    "#1e0b3a",
    "--sb-dot":           "#c4b5fd",
    "--sb-dot-active":    "#3b1a6b",
    "--sb-search-bg":     "#ffffff",
    "--sb-search-border": "#ddd0f8",
    "--manod-page-bg":    "#f5f0ff",
    "--manod-topbar":     "linear-gradient(90deg,#1e0b3a 0%,#3b1a6b 100%)",
    "--manod-accent":          "#3b1a6b",
    "--manod-accent-light":    "#ede9fe",
    "--manod-accent-mid":      "#a78bfa",
    "--manod-welcome-bg":      "linear-gradient(135deg,#1e0b3a 0%,#3b1a6b 60%,#8b5cf6 100%)",
    "--manod-welcome-text":    "#ffffff",
    "--manod-welcome-sub":     "rgba(255,255,255,0.75)",
    "--manod-btn-primary-bg":  "#3b1a6b",
    "--manod-btn-primary-text":"#ffffff",
    "--manod-btn-active-bg":   "#1e0b3a",
    "--manod-card-border-top": "#8b5cf6",
    "--manod-card-icon-bg":    "#ede9fe",
    "--manod-card-icon-color": "#6d28d9",
    "--manod-stat-up":         "#16a34a",
    "--manod-stat-down":       "#dc2626",
    "--manod-chart-1":         "#3b1a6b",
    "--manod-chart-2":         "#a78bfa",
    "--manod-chart-3":         "#ddd0f8",
    "--manod-link":             "#6d28d9",
    "--manod-focus-ring":       "rgba(59,26,107,0.18)",
    topbarGradient: "linear-gradient(90deg,#1e0b3a 0%,#3b1a6b 100%)",
    pageBg: "#f5f0ff", accent: "#3b1a6b", sidebar: "#1e0b3a",
  },
  slate: {
    name: "Slate Dark", emoji: "🌑",
    "--sb-bg":            "#f1f5f9",
    "--sb-border":        "#cbd5e1",
    "--sb-logo-bg":       "#0f172a",
    "--sb-text":          "#334155",
    "--sb-text-muted":    "#64748b",
    "--sb-hover-bg":      "#e2e8f0",
    "--sb-hover-text":    "#0f172a",
    "--sb-active-bg":     "#1e293b",
    "--sb-active-text":   "#ffffff",
    "--sb-active-icon":   "rgba(255,255,255,0.9)",
    "--sb-icon-bg":       "#e2e8f0",
    "--sb-icon-color":    "#0284c7",
    "--sb-sub-border":    "#94a3b8",
    "--sb-sub-text":      "#475569",
    "--sb-sub-active":    "#0f172a",
    "--sb-dot":           "#94a3b8",
    "--sb-dot-active":    "#1e293b",
    "--sb-search-bg":     "#ffffff",
    "--sb-search-border": "#cbd5e1",
    "--manod-page-bg":    "#f1f5f9",
    "--manod-topbar":     "linear-gradient(90deg,#0f172a 0%,#1e293b 100%)",
    "--manod-accent":          "#1e293b",
    "--manod-accent-light":    "#e2e8f0",
    "--manod-accent-mid":      "#38bdf8",
    "--manod-welcome-bg":      "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0ea5e9 100%)",
    "--manod-welcome-text":    "#ffffff",
    "--manod-welcome-sub":     "rgba(255,255,255,0.75)",
    "--manod-btn-primary-bg":  "#1e293b",
    "--manod-btn-primary-text":"#ffffff",
    "--manod-btn-active-bg":   "#0f172a",
    "--manod-card-border-top": "#0ea5e9",
    "--manod-card-icon-bg":    "#e0f2fe",
    "--manod-card-icon-color": "#0284c7",
    "--manod-stat-up":         "#16a34a",
    "--manod-stat-down":       "#dc2626",
    "--manod-chart-1":         "#1e293b",
    "--manod-chart-2":         "#38bdf8",
    "--manod-chart-3":         "#bae6fd",
    "--manod-link":             "#0284c7",
    "--manod-focus-ring":       "rgba(30,41,59,0.18)",
    topbarGradient: "linear-gradient(90deg,#0f172a 0%,#1e293b 100%)",
    pageBg: "#f1f5f9", accent: "#1e293b", sidebar: "#0f172a",
  },
  rose: {
    name: "Rose Pink", emoji: "🌸",
    "--sb-bg":            "#fff4f7",
    "--sb-border":        "#f8c8d8",
    "--sb-logo-bg":       "#3d0f1f",
    "--sb-text":          "#7c1a35",
    "--sb-text-muted":    "#c06080",
    "--sb-hover-bg":      "#fde4ec",
    "--sb-hover-text":    "#3d0f1f",
    "--sb-active-bg":     "#6b1a35",
    "--sb-active-text":   "#ffffff",
    "--sb-active-icon":   "rgba(255,255,255,0.9)",
    "--sb-icon-bg":       "#fce7f0",
    "--sb-icon-color":    "#be123c",
    "--sb-sub-border":    "#fca5b8",
    "--sb-sub-text":      "#a81840",
    "--sb-sub-active":    "#3d0f1f",
    "--sb-dot":           "#fca5b8",
    "--sb-dot-active":    "#6b1a35",
    "--sb-search-bg":     "#ffffff",
    "--sb-search-border": "#fce7f0",
    "--manod-page-bg":    "#fff0f4",
    "--manod-topbar":     "linear-gradient(90deg,#3d0f1f 0%,#6b1a35 100%)",
    "--manod-accent":          "#6b1a35",
    "--manod-accent-light":    "#fce7f0",
    "--manod-accent-mid":      "#f472b6",
    "--manod-welcome-bg":      "linear-gradient(135deg,#3d0f1f 0%,#6b1a35 60%,#f43f5e 100%)",
    "--manod-welcome-text":    "#ffffff",
    "--manod-welcome-sub":     "rgba(255,255,255,0.75)",
    "--manod-btn-primary-bg":  "#6b1a35",
    "--manod-btn-primary-text":"#ffffff",
    "--manod-btn-active-bg":   "#3d0f1f",
    "--manod-card-border-top": "#f43f5e",
    "--manod-card-icon-bg":    "#fce7f0",
    "--manod-card-icon-color": "#be123c",
    "--manod-stat-up":         "#16a34a",
    "--manod-stat-down":       "#dc2626",
    "--manod-chart-1":         "#6b1a35",
    "--manod-chart-2":         "#f472b6",
    "--manod-chart-3":         "#fce7f0",
    "--manod-link":             "#be123c",
    "--manod-focus-ring":       "rgba(107,26,53,0.18)",
    topbarGradient: "linear-gradient(90deg,#3d0f1f 0%,#6b1a35 100%)",
    pageBg: "#fff0f4", accent: "#6b1a35", sidebar: "#3d0f1f",
  },
};

const CSS_VARS = Object.keys(themes.forest).filter(k => k.startsWith("--"));

/* Injects a <style> tag that wires --manod-* vars into every common
   page element — cards, buttons, welcome banners, badges, links, inputs.
   This means Dashboard and ALL other pages automatically theme themselves
   without any code changes to those files. */
const GLOBAL_STYLE_ID = "manod-theme-global";
function injectGlobalStyles() {
  let el = document.getElementById(GLOBAL_STYLE_ID);
  if (!el) { el = document.createElement("style"); el.id = GLOBAL_STYLE_ID; document.head.appendChild(el); }
  el.textContent = `
    /* ── Welcome / hero banners ── */
    .dashboard-welcome,
    .welcome-banner,
    [class*="welcome"],
    [class*="hero-banner"] {
      background: var(--manod-welcome-bg) !important;
      color: var(--manod-welcome-text) !important;
    }

    /* ── Primary buttons ── */
    .btn-primary,
    button.btn-primary,
    [class*="btn-primary"],
    [class*="button-primary"] {
      background: var(--manod-btn-primary-bg) !important;
      color: var(--manod-btn-primary-text) !important;
      border-color: var(--manod-btn-primary-bg) !important;
    }

    /* Dashboard period buttons (Today / This Week / This Month / This Year) */
    .period-btn.active,
    [class*="period-btn"][class*="active"],
    .time-filter-btn.active,
    [class*="filter-btn"][class*="active"] {
      background: var(--manod-btn-active-bg) !important;
      color: #fff !important;
      border-color: var(--manod-btn-active-bg) !important;
    }

    /* ── Stat cards — top accent border ── */
    .stat-card,
    .summary-card,
    [class*="stat-card"],
    [class*="summary-card"],
    [class*="metric-card"] {
      border-top: 3px solid var(--manod-card-border-top) !important;
    }

    /* Card icon circles */
    .card-icon,
    [class*="card-icon"],
    [class*="stat-icon"] {
      background: var(--manod-card-icon-bg) !important;
      color: var(--manod-card-icon-color) !important;
    }

    /* ── Tables — header ── */
    thead tr,
    .table-header,
    [class*="table-head"] tr {
      background: var(--manod-accent-light) !important;
    }
    thead th {
      color: var(--manod-accent) !important;
    }

    /* ── Tabs / pills ── */
    .nav-tab.active,
    [class*="tab"][class*="active"],
    .pill.active,
    [class*="pill"][class*="active"] {
      background: var(--manod-accent) !important;
      color: #fff !important;
    }

    /* ── Badges / tags ── */
    .badge-primary,
    [class*="badge-primary"],
    .tag-primary {
      background: var(--manod-accent-light) !important;
      color: var(--manod-accent) !important;
    }

    /* ── Links ── */
    a { color: var(--manod-link) !important; }
    a:hover { opacity: 0.8; }

    /* ── Focus rings ── */
    *:focus-visible {
      outline: 2px solid var(--manod-accent) !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px var(--manod-focus-ring) !important;
    }

    /* ── Input / select borders on focus ── */
    input:focus, select:focus, textarea:focus {
      border-color: var(--manod-accent) !important;
      box-shadow: 0 0 0 3px var(--manod-focus-ring) !important;
    }

    /* ── Recharts / chart colours ── */
    .recharts-line path[stroke="#2d6a4f"],
    .recharts-line path[stroke="#1a3d6b"],
    .recharts-line path[stroke="#6b2d1a"],
    .recharts-line path[stroke="#3b1a6b"],
    .recharts-line path[stroke="#1e293b"],
    .recharts-line path[stroke="#6b1a35"] {
      stroke: var(--manod-chart-1) !important;
    }
    .recharts-bar rect[fill="#2d6a4f"],
    .recharts-bar rect[fill="#1a3d6b"],
    .recharts-bar rect[fill="#6b2d1a"],
    .recharts-bar rect[fill="#3b1a6b"],
    .recharts-bar rect[fill="#1e293b"],
    .recharts-bar rect[fill="#6b1a35"] {
      fill: var(--manod-chart-1) !important;
    }
    .recharts-bar rect[fill="#74c69d"],
    .recharts-bar rect[fill="#60a5fa"],
    .recharts-bar rect[fill="#fb923c"],
    .recharts-bar rect[fill="#a78bfa"],
    .recharts-bar rect[fill="#38bdf8"],
    .recharts-bar rect[fill="#f472b6"] {
      fill: var(--manod-chart-2) !important;
    }
  `;
}

function applyTheme(t) {
  const root = document.documentElement;
  CSS_VARS.forEach(k => root.style.setProperty(k, t[k]));
  document.body.style.background = t.pageBg;
  injectGlobalStyles();
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(
    () => localStorage.getItem("manod_theme") || "forest"
  );
  const theme = themes[themeKey] || themes.forest;

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("manod_theme", themeKey);
  }, [themeKey, theme]);

  return (
    <ThemeContext.Provider value={{ themeKey, setThemeKey, theme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
// PATH: src/pages/usePageTheme.js
// Import this in any page to get themed style objects
// Usage: const { addBtn, pageBg, card, th, pageBtnActive, primaryBtn } = usePageTheme();

import { useTheme } from "./ThemeContext";

export function usePageTheme() {
  const { theme } = useTheme();

  const accent      = theme["--manod-accent"]      || "#2d6a4f";
  const accentLight = theme["--manod-accent-light"] || "#e8f5ed";
  const accentMid   = theme["--manod-accent-mid"]   || "#74c69d";
  const pageBg      = theme["--manod-page-bg"]      || "#f0f4f1";
  const border      = theme["--sb-border"]           || "#e2f0e8";
  const logoBg      = theme["--sb-logo-bg"]          || "#1a3d2b";

  return {
    // page wrapper
    pageBg,

    // white card
    card: {
      background: "#fff",
      borderRadius: 10,
      padding: 24,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      marginBottom: 20,
    },

    // table header row
    thead: { background: accentLight },

    // table header cell
    th: {
      textAlign: "left",
      padding: "10px 14px",
      fontSize: 13,
      fontWeight: 600,
      color: accent,
      borderBottom: `1px solid ${border}`,
    },

    // "1" active pagination button
    pageBtnActive: {
      background: accent,
      color: "#fff",
      border: `1px solid ${accent}`,
    },

    // green "+ Add" button (top-right)
    addBtn: {
      background: `linear-gradient(135deg, ${accentMid} 0%, ${accent} 100%)`,
      color: "#fff",
      border: "none",
      borderRadius: 24,
      padding: "10px 20px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: `0 2px 8px ${accent}55`,
    },

    // fixed top-right "+ Add" button (Contacts style)
    addBtnFixed: {
      position: "fixed",
      top: 70,
      right: 24,
      zIndex: 400,
      background: `linear-gradient(135deg, ${accentMid} 0%, ${accent} 100%)`,
      color: "#fff",
      border: "none",
      borderRadius: 50,
      padding: "10px 24px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: `0 4px 16px ${accent}66`,
      whiteSpace: "nowrap",
    },

    // primary action button (Save, Submit etc.)
    primaryBtn: {
      background: `linear-gradient(135deg, ${accentMid} 0%, ${accent} 100%)`,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "10px 28px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: `0 2px 8px ${accent}55`,
    },

    // save button (larger, centered)
    saveBtn: {
      background: `linear-gradient(135deg, ${logoBg} 0%, ${accent} 60%, ${accentMid} 100%)`,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "13px 52px",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: `0 4px 18px ${accent}55`,
    },

    // active tab / nav button
    activeTab: {
      background: `linear-gradient(135deg, ${accentMid} 0%, ${accent} 100%)`,
      color: "#fff",
      boxShadow: `0 3px 10px ${accent}44`,
      border: "none",
    },

    // checkbox accentColor
    accentColor: accent,
    accent,
    accentLight,
    accentMid,
    logoBg,
    border,
  };
}
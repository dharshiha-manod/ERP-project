import { createContext, useContext, useState, useEffect } from "react";

export const themes = {
  forest: {
    name: "Forest Green",
    emoji: "🌿",
    sidebar: "#1a3a2a",
    sidebarHover: "#2d5a3d",
    sidebarActive: "#2d5a3d",
    sidebarText: "#e8f5e0",
    sidebarSubText: "#a8c8a0",
    topbar: "#1f4032",
    topbarText: "#ffffff",
    accent: "#4caf72",
    accentHover: "#3d9960",
    brand: "#2d7a4f",
    cardBg: "#ffffff",
    pageBg: "#f0f4f1",
    welcomeBg: "linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 100%)",
    welcomeText: "#ffffff",
    welcomeSub: "#a8d5b0",
    statUp: "#22c55e",
    statDown: "#ef4444",
    border: "#e2ece5",
    text: "#1a2e22",
    textSub: "#6b7c72",
    shadow: "rgba(45,90,61,0.10)",
  },
  ocean: {
    name: "Ocean Blue",
    emoji: "🌊",
    sidebar: "#0f2744",
    sidebarHover: "#1a3d6b",
    sidebarActive: "#1a3d6b",
    sidebarText: "#dbeafe",
    sidebarSubText: "#93c5fd",
    topbar: "#1e3a5f",
    topbarText: "#ffffff",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    brand: "#1d4ed8",
    cardBg: "#ffffff",
    pageBg: "#f0f4ff",
    welcomeBg: "linear-gradient(135deg, #0f2744 0%, #1a3d6b 100%)",
    welcomeText: "#ffffff",
    welcomeSub: "#93c5fd",
    statUp: "#22c55e",
    statDown: "#ef4444",
    border: "#dbeafe",
    text: "#0f2744",
    textSub: "#64748b",
    shadow: "rgba(15,39,68,0.10)",
  },
  sunset: {
    name: "Sunset Orange",
    emoji: "🌅",
    sidebar: "#3d1a0f",
    sidebarHover: "#6b2d1a",
    sidebarActive: "#6b2d1a",
    sidebarText: "#fde8d8",
    sidebarSubText: "#fdba74",
    topbar: "#5c2417",
    topbarText: "#ffffff",
    accent: "#f97316",
    accentHover: "#ea6c0a",
    brand: "#c2410c",
    cardBg: "#ffffff",
    pageBg: "#fff7f0",
    welcomeBg: "linear-gradient(135deg, #3d1a0f 0%, #7c2d12 100%)",
    welcomeText: "#ffffff",
    welcomeSub: "#fdba74",
    statUp: "#22c55e",
    statDown: "#ef4444",
    border: "#fed7aa",
    text: "#3d1a0f",
    textSub: "#78716c",
    shadow: "rgba(61,26,15,0.10)",
  },
  violet: {
    name: "Royal Violet",
    emoji: "💜",
    sidebar: "#1e0b3a",
    sidebarHover: "#3b1a6b",
    sidebarActive: "#3b1a6b",
    sidebarText: "#ede9fe",
    sidebarSubText: "#c4b5fd",
    topbar: "#2e1065",
    topbarText: "#ffffff",
    accent: "#8b5cf6",
    accentHover: "#7c3aed",
    brand: "#6d28d9",
    cardBg: "#ffffff",
    pageBg: "#f5f0ff",
    welcomeBg: "linear-gradient(135deg, #1e0b3a 0%, #3b1a6b 100%)",
    welcomeText: "#ffffff",
    welcomeSub: "#c4b5fd",
    statUp: "#22c55e",
    statDown: "#ef4444",
    border: "#ede9fe",
    text: "#1e0b3a",
    textSub: "#6b7280",
    shadow: "rgba(30,11,58,0.10)",
  },
  slate: {
    name: "Slate Dark",
    emoji: "🌑",
    sidebar: "#0f172a",
    sidebarHover: "#1e293b",
    sidebarActive: "#1e293b",
    sidebarText: "#e2e8f0",
    sidebarSubText: "#94a3b8",
    topbar: "#1e293b",
    topbarText: "#ffffff",
    accent: "#38bdf8",
    accentHover: "#0ea5e9",
    brand: "#0284c7",
    cardBg: "#ffffff",
    pageBg: "#f1f5f9",
    welcomeBg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    welcomeText: "#ffffff",
    welcomeSub: "#94a3b8",
    statUp: "#22c55e",
    statDown: "#ef4444",
    border: "#e2e8f0",
    text: "#0f172a",
    textSub: "#64748b",
    shadow: "rgba(15,23,42,0.10)",
  },
  rose: {
    name: "Rose Pink",
    emoji: "🌸",
    sidebar: "#3d0f1f",
    sidebarHover: "#6b1a35",
    sidebarActive: "#6b1a35",
    sidebarText: "#fde8ef",
    sidebarSubText: "#fca5b8",
    topbar: "#5c1728",
    topbarText: "#ffffff",
    accent: "#f43f5e",
    accentHover: "#e11d48",
    brand: "#be123c",
    cardBg: "#ffffff",
    pageBg: "#fff0f4",
    welcomeBg: "linear-gradient(135deg, #3d0f1f 0%, #6b1a35 100%)",
    welcomeText: "#ffffff",
    welcomeSub: "#fca5b8",
    statUp: "#22c55e",
    statDown: "#ef4444",
    border: "#fce7f0",
    text: "#3d0f1f",
    textSub: "#78716c",
    shadow: "rgba(61,15,31,0.10)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem("manod_theme") || "forest";
  });

  const theme = themes[themeKey] || themes.forest;

  useEffect(() => {
    localStorage.setItem("manod_theme", themeKey);
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
    // Apply body background immediately
    document.body.style.background = theme.pageBg;
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
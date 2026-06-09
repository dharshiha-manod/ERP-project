import { useState } from "react";
import { useTheme, themes } from "./ThemeContext";

export default function ThemeSwitcher() {
  const { themeKey, setThemeKey, theme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleSelect = (key) => {
    setThemeKey(key);
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <>
      {/* Trigger Button — place this in your TopHeader */}
      <button
        onClick={() => setOpen(true)}
        title="Change Theme"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "8px",
          padding: "5px 12px",
          cursor: "pointer",
          color: theme.topbarText,
          fontSize: "13px",
          fontWeight: 500,
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
      >
        <span style={{ fontSize: "16px" }}>🎨</span>
        <span>Theme</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              width: "520px",
              maxWidth: "95vw",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              animation: "fadeUp 0.22s ease",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#1a202c" }}>
                  🎨 Choose Your Theme
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                  Personalise your ERP experience
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            {/* Theme Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}>
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  style={{
                    border: themeKey === key ? `2.5px solid ${t.accent}` : "2.5px solid transparent",
                    borderRadius: "14px",
                    padding: "0",
                    cursor: "pointer",
                    background: "none",
                    position: "relative",
                    boxShadow: themeKey === key ? `0 0 0 3px ${t.accent}33` : "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.18s ease",
                    overflow: "hidden",
                  }}
                  onMouseEnter={e => {
                    if (themeKey !== key) e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  {/* Mini preview */}
                  <div style={{ borderRadius: "12px", overflow: "hidden" }}>
                    {/* Sidebar strip */}
                    <div style={{
                      display: "flex",
                      height: "70px",
                    }}>
                      <div style={{
                        width: "28%",
                        background: t.sidebar,
                        padding: "6px 5px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}>
                        <div style={{ background: t.accent, borderRadius: "3px", height: "5px", width: "70%" }} />
                        <div style={{ background: t.sidebarActive, borderRadius: "3px", height: "4px", width: "90%" }} />
                        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "3px", height: "4px", width: "80%" }} />
                        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "3px", height: "4px", width: "75%" }} />
                      </div>
                      <div style={{ flex: 1, background: t.pageBg, padding: "5px" }}>
                        {/* Topbar */}
                        <div style={{ background: t.topbar, borderRadius: "4px", height: "10px", marginBottom: "5px" }} />
                        {/* Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px" }}>
                          {[0,1,2,3].map(i => (
                            <div key={i} style={{
                              background: t.cardBg,
                              borderRadius: "4px",
                              height: "16px",
                              borderTop: `2px solid ${t.accent}`,
                              boxShadow: `0 1px 3px ${t.shadow}`,
                            }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div style={{
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: themeKey === key ? `${t.accent}15` : "#f9fafb",
                    borderTop: "1px solid #f0f0f0",
                  }}>
                    <span style={{ fontSize: "14px" }}>{t.emoji}</span>
                    <span style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: themeKey === key ? t.brand : "#374151",
                    }}>
                      {t.name}
                    </span>
                    {themeKey === key && (
                      <span style={{
                        marginLeft: "auto",
                        background: t.accent,
                        color: "#fff",
                        borderRadius: "10px",
                        fontSize: "10px",
                        padding: "1px 7px",
                        fontWeight: 700,
                      }}>Active</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <p style={{
              margin: "20px 0 0",
              textAlign: "center",
              fontSize: "12px",
              color: "#9ca3af",
            }}>
              Your preference is saved automatically
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
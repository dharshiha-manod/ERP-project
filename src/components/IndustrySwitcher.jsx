import { useState, useRef, useEffect } from "react";
import { useIndustry } from "../context/IndustryContext";

// Same type list used by General Settings' industry preset dropdown, so the
// label a user picks here matches what they'd see there.

const INDUSTRY_TYPE_OPTIONS = [
  ["general_manufacturing",                 "General Manufacturing"],
  ["automobile_manufacturing",              "Automobile Manufacturing"],
  ["jewellery_manufacturing",               "Jewellery Manufacturing"],
  ["furniture_manufacturing",               "Furniture Manufacturing"],
  ["textile_manufacturing",                 "Textile Manufacturing"],
  ["electronics_manufacturing",             "Electronics Manufacturing"],
  ["food_manufacturing",                    "Food Manufacturing"],
  ["garments_manufacturing",                "Garments Manufacturing"],
  ["engineering_components_manufacturing",  "Engineering Components Manufacturing"],
];
function useOutsideClick(ref, cb) {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, cb]);
}

function CreateIndustryModal({ onClose, onCreated, industry }) {
  const { industries } = useIndustry();
  const isEdit = Boolean(industry);
  const [name, setName]   = useState(industry?.name || "");
  const [type, setType]   = useState(industry?.industry_type || "general_manufacturing");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const save = async () => {
    if (!name.trim()) { setError("Industry name is required"); return; }
    setSaving(true); setError(null);
    try {
      const { industryAPI } = await import("../api/industryAPI");
      const res = isEdit
        ? await industryAPI.update(industry.id, { name: name.trim(), industry_type: type })
        : await industryAPI.create({ name: name.trim(), industry_type: type });
      if (!res.success) throw new Error(res.message || "Failed to save industry");
      await onCreated(res.data.id);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", padding: "26px", width: "420px", maxWidth: "95vw", boxShadow: "0 25px 60px rgba(0,0,0,0.30)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Industry Workspace" : industries.length === 0 ? "Set Up Your First Industry" : "New Industry Workspace"}
          </p>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer", fontSize: "18px", color: "#6b7280" }}>×</button>
        </div>

        <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#444", marginBottom: "4px", display: "block" }}>Industry Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jewellery Division"
          style={{ width: "100%", padding: "9px 11px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", marginBottom: "14px", fontFamily: "inherit" }} />

        <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#444", marginBottom: "4px", display: "block" }}>Industry Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}
          style={{ width: "100%", padding: "9px 11px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", marginBottom: "18px", fontFamily: "inherit", background: "#fff" }}>
          {INDUSTRY_TYPE_OPTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>

        {error && <div style={{ color: "#dc2626", fontSize: "12.5px", marginBottom: "12px" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#27ae60,#1a6b3c)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create & Switch"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IndustrySwitcher() {
  const { industries, activeIndustry, loading, switchIndustry, refreshIndustries } = useIndustry();
  const [open, setOpen]           = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const handleCreated = async (newId) => {
    await refreshIndustries();
    setShowCreate(false);
    setEditingIndustry(null);
    setOpen(false);
    await switchIndustry(newId); // reloads the app scoped to the new industry
  };

  if (loading) return null;

  const label = activeIndustry ? activeIndustry.name : "Select Industry";

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((p) => !p)}
          title="Switch Industry Workspace"
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: "8px", padding: "5px 12px",
            color: "#fff", fontSize: "12.5px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap", maxWidth: "160px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.26)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
          </svg>
        </button>

        {open && (
          <div style={{ position: "absolute", top: "40px", left: 0, background: "#fff", borderRadius: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", width: "240px", zIndex: 2000, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "linear-gradient(135deg,#052e16,#14532d)", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "0.08em" }}>
              INDUSTRY WORKSPACES
            </div>
            <div style={{ maxHeight: "260px", overflowY: "auto" }}>
              {industries.length === 0 && (
                <div style={{ padding: "14px", fontSize: "12.5px", color: "#9ca3af" }}>No industries yet.</div>
              )}
              {industries.map((ind) => {
                const active = activeIndustry && ind.id === activeIndustry.id;
               return (
                  <div key={ind.id} style={{ display: "flex", alignItems: "center", background: active ? "#f0fdf4" : "none" }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "none"; }}
                  >
                    <button
                      onClick={() => { if (!active) switchIndustry(ind.id); setOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flex: 1, padding: "10px 14px", background: "none",
                        border: "none", fontSize: "13px", fontWeight: active ? 700 : 500,
                        color: active ? "#15803d" : "#111827", cursor: active ? "default" : "pointer",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ind.name}</span>
                      {active && <span style={{ fontSize: "14px" }}>✓</span>}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingIndustry(ind); setOpen(false); }}
                      title="Edit industry type"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "12px", padding: "8px 10px" }}
                    >
                      ✎
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ height: "1px", background: "#f0f0f0" }} />
            <button
              onClick={() => { setShowCreate(true); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 14px", background: "none", border: "none", fontSize: "13px", fontWeight: 600, color: "#1a6b3c", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              + New Industry
            </button>
          </div>
        )}
      </div>

    {showCreate && <CreateIndustryModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {editingIndustry && (
        <CreateIndustryModal
          industry={editingIndustry}
          onClose={() => setEditingIndustry(null)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
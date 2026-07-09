/**
 * Manufacturing.jsx — Manod ERP
 * Professional style matching Users / Stock Transfers pages.
 * - No top tab bar (sidebar handles navigation via ?tab=)
 * - Auto-generated ref codes
 * - View modal on every tab
 * - Export CSV / Excel / Print / PDF buttons
 * - Column Visibility toggle
 * - Clean Inter font, green accent, proper table design
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE = "/api/manufacturing";
const hdrs = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("manod_token") || ""}`,
});
async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: hdrs(), ...opts });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  if (!res.ok) throw new Error(body?.message || body?.error || `Error ${res.status}`);
  return body;
}

// ─── Auto-ref generators (frontend fallback; backend auto-generates too) ──────
const pad = (n, len = 4) => String(n).padStart(len, "0");
const genRef = (prefix, list) => `${prefix}-${pad(list.length + 1)}`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  green: "#1a5c38", greenHover: "#164d2f", greenLight: "#e8f4ee", greenBorder: "#b6d9c5",
  white: "#ffffff",
  gray50: "#f8fafc", gray100: "#f1f5f9", gray200: "#e2e8f0", gray300: "#cbd5e1",
  gray400: "#94a3b8", gray500: "#64748b", gray600: "#475569", gray700: "#334155",
  gray800: "#1e293b", gray900: "#0f172a",
  blue: "#1e40af", blueBg: "#eff6ff", blueBd: "#bfdbfe",
  amber: "#92400e", amberBg: "#fffbeb", amberBd: "#fde68a",
  red: "#991b1b", redBg: "#fef2f2", redBd: "#fecaca",
  purple: "#5b21b6", purpleBg: "#f5f3ff", purpleBd: "#ddd6fe",
};

// ─── Status badge colors ──────────────────────────────────────────────────────
const STATUS = {
  planned:     { c: C.blue,   bg: C.blueBg,   bd: C.blueBd   },
  in_progress: { c: C.amber,  bg: C.amberBg,  bd: C.amberBd  },
  completed:   { c: C.green,  bg: C.greenLight,bd: C.greenBorder },
  on_hold:     { c: C.amber,  bg: C.amberBg,  bd: C.amberBd  },
  active:      { c: C.green,  bg: C.greenLight,bd: C.greenBorder },
  inactive:    { c: C.gray500,bg: C.gray100,  bd: C.gray300  },
  running:     { c: C.green,  bg: C.greenLight,bd: C.greenBorder },
  idle:        { c: C.amber,  bg: C.amberBg,  bd: C.amberBd  },
  maintenance: { c: C.red,    bg: C.redBg,    bd: C.redBd    },
  passed:      { c: C.green,  bg: C.greenLight,bd: C.greenBorder },
  failed:      { c: C.red,    bg: C.redBg,    bd: C.redBd    },
  pending:     { c: C.amber,  bg: C.amberBg,  bd: C.amberBd  },
  scheduled:   { c: C.blue,   bg: C.blueBg,   bd: C.blueBd   },
  overdue:     { c: C.red,    bg: C.redBg,    bd: C.redBd    },
  low:         { c: C.blue,   bg: C.blueBg,   bd: C.blueBd   },
  medium:      { c: C.amber,  bg: C.amberBg,  bd: C.amberBd  },
  high:        { c: C.red,    bg: C.redBg,    bd: C.redBd    },
};

// ─── Shared inline styles ─────────────────────────────────────────────────────
const font = "'Inter','Segoe UI',system-ui,sans-serif";

const inp = {
  width: "100%", padding: "8px 12px", border: `1px solid ${C.gray300}`,
  borderRadius: 6, fontSize: 13, color: C.gray800, background: C.white,
  boxSizing: "border-box", outline: "none", fontFamily: font,
  transition: "border-color .15s",
};
const sel = { ...inp, cursor: "pointer" };
const ta  = { ...inp, resize: "vertical", minHeight: 60 };

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ value }) {
  const s = String(value || "").toLowerCase().replace(/ /g, "_");
  const t = STATUS[s] || { c: C.gray500, bg: C.gray100, bd: C.gray300 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: t.c, background: t.bg, border: `1px solid ${t.bd}`,
      textTransform: "capitalize", whiteSpace: "nowrap", fontFamily: font,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.c, flexShrink: 0 }} />
      {String(value || "").replace(/_/g, " ")}
    </span>
  );
}

// ─── Code chip ────────────────────────────────────────────────────────────────
function Code({ v }) {
  if (!v) return <span style={{ color: C.gray400, fontSize: 12 }}>—</span>;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11,
      fontWeight: 700, color: C.green, background: C.greenLight,
      padding: "2px 8px", borderRadius: 4, border: `1px solid ${C.greenBorder}`,
    }}>{v}</span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setT({ msg, type });
    setTimeout(() => setT(null), 3000);
  }, []);
  const colors = { success: C.green, error: C.red, info: C.blue };
  const el = t ? (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: C.white, borderRadius: 8, padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,.14)", borderLeft: `4px solid ${colors[t.type] || C.green}`,
      display: "flex", alignItems: "center", gap: 10, minWidth: 260,
      fontFamily: font, animation: "slideIn .2s ease",
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{ fontSize: 13, color: C.gray800, flex: 1, fontWeight: 500 }}>{t.msg}</span>
      <button onClick={() => setT(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.gray400, lineHeight: 1 }}>×</button>
    </div>
  ) : null;
  return { show, el };
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, sub, onClose, children, wide = false }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16, fontFamily: font,
    }} onClick={onClose}>
      <div style={{
        background: C.white, borderRadius: 12, width: wide ? 740 : 520,
        maxWidth: "96vw", maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,.22)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "16px 24px 12px", borderBottom: `1px solid ${C.gray100}`,
          flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gray900 }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.gray400, lineHeight: 1, padding: "0 2px" }}>×</button>
        </div>
        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function MFoot({ onClose, onSave, label = "Save", saving }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16, borderTop: `1px solid ${C.gray100}`, marginTop: 8 }}>
      <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, color: C.gray600, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: font }}>Cancel</button>
      <button onClick={onSave} disabled={saving} style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: C.green, color: C.white, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .7 : 1, fontFamily: font }}>
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}

// ─── Form grid ────────────────────────────────────────────────────────────────
const G2 = ({ children, cols = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: "12px 16px" }}>{children}</div>
);
const Fld = ({ label, req, span, children }) => (
  <div style={span ? { gridColumn: "span 2" } : {}}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.gray600, marginBottom: 4, fontFamily: font }}>
      {label}{req && <span style={{ color: C.red }}> *</span>}
    </label>
    {children}
  </div>
);

// ─── View detail row ──────────────────────────────────────────────────────────
const DR = ({ label, value }) => (
  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.gray100}` }}>
    <span style={{ width: 150, flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.gray500, fontFamily: font }}>{label}</span>
    <span style={{ fontSize: 13, color: C.gray800, fontFamily: font }}>{value ?? "—"}</span>
  </div>
);

// ─── Export helpers ───────────────────────────────────────────────────────────
function exportCSV(rows, cols, filename) {
  const header = cols.map(c => c.l).join(",");
  const body = rows.map(r => cols.map(c => `"${(r[c.k] ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}
function exportExcel(rows, cols, filename) { exportCSV(rows, cols, filename.replace(".csv", ".xls")); }
function exportPDF(rows, cols, title) { printTable(rows, cols, title); }
function printTable(rows, cols, title) {
  const html = `<html><head><title>${title}</title><style>body{font-family:Inter,sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th{background:#1a5c38;color:#fff;padding:8px}td{padding:7px;border-bottom:1px solid #e2e8f0}</style></head><body><h2>${title}</h2><table><tr>${cols.map(c => `<th>${c.l}</th>`).join("")}</tr>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c.k] ?? ""}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
  const w = window.open("", "_blank"); w.document.write(html); w.document.close(); w.print();
}

// ─── Main data table ──────────────────────────────────────────────────────────
function DataTable({ cols, rows, onView, onEdit, onDelete, loading, hiddenCols = [] }) {
  const visible = cols.filter(c => !hiddenCols.includes(c.k));
  if (loading) return <div style={{ padding: "48px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>Loading…</div>;
  if (!rows?.length) return <div style={{ padding: "48px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>No records found. Use the button above to add one.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font }}>
        <thead>
          <tr style={{ background: C.gray50, borderBottom: `2px solid ${C.gray200}` }}>
            {visible.map(c => (
              <th key={c.k} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: .5, whiteSpace: "nowrap" }}>{c.l}</th>
            ))}
           <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: .5, textAlign: "center", width: 110 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}
              style={{ borderBottom: `1px solid ${C.gray100}`, transition: "background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.gray50}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {visible.map(c => (
                <td key={c.k} style={{ padding: "11px 14px", color: C.gray700, verticalAlign: "middle" }}>
                  {c.render ? c.render(row[c.k], row) : (row[c.k] ?? <span style={{ color: C.gray300 }}>—</span>)}
                </td>
              ))}
          <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
                  {onView && (
                    <button onClick={() => onView(row)} title="View" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#2563eb", display: "flex" }}>
                      <Eye size={17} />
                    </button>
                  )}
                  {onEdit && (
                    <button onClick={() => onEdit(row)} title="Edit" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#d97706", display: "flex" }}>
                      <Pencil size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)} title="Delete" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#dc2626", display: "flex" }}>
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
function PageShell({ title, sub, children }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.gray900 }}>{title}</h1>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.gray500 }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Toolbar for table pages ──────────────────────────────────────────────────
function Toolbar({ onAdd, addLabel, search, onSearch, onCSV, onExcel, onPrint, onPDF, showFilter, filterEls, cols, hiddenCols, setHiddenCols }) {
  const [showColMenu, setShowColMenu] = useState(false);
  const colRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (colRef.current && !colRef.current.contains(e.target)) setShowColMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Top row: export buttons + add button */}
     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <ExportBtn chip="CSV" chipColor="#1a7a3e" label="Export CSV" onClick={onCSV} />
          <ExportBtn chip="XLS" chipColor="#1a7a3e" label="Export Excel" onClick={onExcel} />
          <BtnOut onClick={onPrint}>Print</BtnOut>
          <BtnOut onClick={() => setShowColMenu(v => !v)}>Column visibility</BtnOut>
          <ExportBtn chip="PDF" chipColor="#c0392b" label="Export PDF" onClick={onPDF} />
          <div ref={colRef} style={{ position: "relative" }}>
            {showColMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
                background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: "8px 0", minWidth: 200,
              }}>
                {cols.map(c => (
                  <label key={c.k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, color: C.gray700, fontFamily: font }}>
                    <input type="checkbox" checked={!hiddenCols.includes(c.k)} onChange={() => setHiddenCols(h => h.includes(c.k) ? h.filter(x => x !== c.k) : [...h, c.k])} />
                    {c.l}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={onAdd} style={{
          padding: "9px 18px", borderRadius: 7, border: "none", background: C.green,
          color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font,
          display: "flex", alignItems: "center", gap: 6,
        }}>+ {addLabel}</button>
      </div>

      {/* Filter row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {filterEls}
        <div style={{ marginLeft: "auto", position: "relative" }}>
      
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search…"
            style={{ ...inp, paddingLeft: 32, width: 220, fontSize: 13 }} />
        </div>
      </div>
    </div>
  );
}

const BtnOut = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "7px 13px", borderRadius: 6, border: `1px solid ${C.gray300}`,
    background: C.white, color: C.gray600, fontSize: 12, fontWeight: 500,
    cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 5,
  }}>{children}</button>
);

const ExportBtn = ({ chip, chipColor, label, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 12px 6px 6px", borderRadius: 6, border: `1px solid ${C.gray300}`,
    background: C.white, cursor: "pointer", fontFamily: font,
  }}>
    <span style={{
      background: chipColor, color: "#fff", fontSize: 10, fontWeight: 800,
      padding: "3px 7px", borderRadius: 4, letterSpacing: .3, lineHeight: 1,
    }}>{chip}</span>
    <span style={{ fontSize: 13, color: C.gray700, fontWeight: 500 }}>{label}</span>
  </button>
);

// ─── KPI cards row ────────────────────────────────────────────────────────────
function KPIs({ cards }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: 14, marginBottom: 20 }}>
      {cards.map((k, i) => (
        <div key={i} style={{
          background: C.white, borderRadius: 10, border: `1px solid ${C.gray200}`,
          borderLeft: `3px solid ${k.color || C.green}`,
          padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: .6, marginBottom: 4, fontFamily: font }}>{k.label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.gray900, lineHeight: 1, fontFamily: font }}>{k.value ?? "—"}</div>
          {k.sub && <div style={{ fontSize: 11, color: C.gray400, marginTop: 4, fontFamily: font }}>{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Card wrapper for table ───────────────────────────────────────────────────
function Card({ children }) {
  return (
    <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.gray200}`, boxShadow: "0 1px 3px rgba(0,0,0,.06)", overflow: "hidden" }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — PRODUCTION PLANNING
// ══════════════════════════════════════════════════════════════════════════════
function PlanningTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [fStatus, setFS] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);

  const blank = { title: "", description: "", start_date: "", end_date: "", status: "planned", priority: "medium", assigned_team: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    api("/plans").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const fil = rows.filter(r =>
    (!fStatus || r.status === fStatus) &&
    `${r.title} ${r.assigned_team}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ title: r.title, description: r.description || "", start_date: r.start_date?.slice(0, 10) || "", end_date: r.end_date?.slice(0, 10) || "", status: r.status, priority: r.priority, assigned_team: r.assigned_team || "" }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm(`Delete "${r.title}"?`)) return;
    try { await api(`/plans/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.title || !form.start_date || !form.end_date) { show("Title, Start & End required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/plans/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Plan updated."); }
      else { const d = await api("/plans", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("Plan created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "title",         l: "Plan Title",    render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "start_date",    l: "Start Date",    render: v => v?.slice(0, 10) || "—" },
    { k: "end_date",      l: "End Date",      render: v => v?.slice(0, 10) || "—" },
    { k: "assigned_team", l: "Team" },
    { k: "priority",      l: "Priority",      render: v => <Badge value={v} /> },
    { k: "status",        l: "Status",        render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Production Planning" sub="Manage production plans, timelines and team assignments">
      <KPIs cards={[
        { icon: "📋", label: "Total Plans",  value: rows.length,                                        color: C.green },
        { icon: "🕒", label: "Planned",      value: rows.filter(r => r.status === "planned").length,     color: C.blue },
        { icon: "⚙️", label: "In Progress",  value: rows.filter(r => r.status === "in_progress").length, color: C.amber },
        { icon: "✅", label: "Completed",    value: rows.filter(r => r.status === "completed").length,   color: C.green },
      ]} />
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar
            onAdd={openAdd} addLabel="Add Plan"
            search={search} onSearch={setSearch}
       onCSV={() => exportCSV(fil, COLS, "production-plans.csv")}
            onExcel={() => exportExcel(fil, COLS, "production-plans.xls")}
            onPrint={() => printTable(fil, COLS, "Production Plans")}
            onPDF={() => exportPDF(fil, COLS, "Production Plans")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden}
            filterEls={
              <select value={fStatus} onChange={e => setFS(e.target.value)} style={{ ...sel, width: 150 }}>
                <option value="">All Status</option>
                {["planned", "in_progress", "completed", "on_hold"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            }
          />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>
          Showing {fil.length} of {rows.length} entries
        </div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.title} sub="Production Plan Details" onClose={() => setViewRow(null)}>
          <DR label="Plan Title" value={viewRow.title} />
          <DR label="Start Date" value={viewRow.start_date?.slice(0, 10)} />
          <DR label="End Date" value={viewRow.end_date?.slice(0, 10)} />
          <DR label="Assigned Team" value={viewRow.assigned_team} />
          <DR label="Priority" value={<Badge value={viewRow.priority} />} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="Description" value={viewRow.description} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setViewRow(null)} style={{ ...inp, width: "auto", padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700 }}>Close</button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Plan" : "New Production Plan"} sub="Define timeline, team and goals" onClose={() => setModal(false)}>
          <G2>
            <Fld label="Plan Title" req span><input style={inp} value={form.title} onChange={e => sf("title", e.target.value)} placeholder="e.g. Q3 Valve Production Run" /></Fld>
            <Fld label="Start Date" req><input type="date" style={inp} value={form.start_date} onChange={e => sf("start_date", e.target.value)} /></Fld>
            <Fld label="End Date" req><input type="date" style={inp} value={form.end_date} onChange={e => sf("end_date", e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["planned", "in_progress", "completed", "on_hold"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></Fld>
            <Fld label="Priority"><select style={sel} value={form.priority} onChange={e => sf("priority", e.target.value)}>{["low", "medium", "high"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Assigned Team"><input style={inp} value={form.assigned_team} onChange={e => sf("assigned_team", e.target.value)} placeholder="Team Alpha" /></Fld>
            <Fld label="Description" span><textarea style={ta} value={form.description} onChange={e => sf("description", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Create Plan"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — BOM
// ══════════════════════════════════════════════════════════════════════════════
function BOMTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);

  const blankI = () => ({ item_name: "", quantity: "", unit: "pcs", cost: "" });
  const blank = { product_name: "", product_code: "", quantity: "", unit: "pcs", version: "1.0", status: "active", notes: "", ingredients: [blankI()] };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const si = (i, k, v) => setForm(f => ({ ...f, ingredients: f.ingredients.map((x, j) => j === i ? { ...x, [k]: v } : x) }));

  useEffect(() => {
    setLoad(true);
    api("/bom").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const totalCost = bom => bom.ingredients?.reduce((s, x) => s + (parseFloat(x.cost) || 0) * (parseFloat(x.quantity) || 0), 0) || 0;
  const fil = rows.filter(r => `${r.product_name} ${r.product_code}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ ...blank, product_code: genRef("BOM", rows) }); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ product_name: r.product_name, product_code: r.product_code || "", quantity: r.quantity, unit: r.unit, version: r.version || "1.0", status: r.status, notes: r.notes || "", ingredients: r.ingredients?.length ? r.ingredients.map(x => ({ ...x })) : [blankI()] }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm(`Delete BOM for "${r.product_name}"?`)) return;
    try { await api(`/bom/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.product_name || !form.quantity) { show("Product name & quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/bom/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("BOM updated."); }
      else { const d = await api("/bom", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("BOM created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "product_code", l: "BOM Code",    render: v => <Code v={v} /> },
    { k: "product_name", l: "Product",     render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "quantity",     l: "Base Qty",    render: (v, r) => `${v} ${r.unit}` },
    { k: "version",      l: "Version",     render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v}</span> },
    { k: "ingredients",  l: "Components",  render: v => <span style={{ fontWeight: 600, color: C.green }}>{v?.length || 0} items</span> },
    { k: "ingredients",  l: "Total Cost",  render: (v, r) => <span style={{ fontWeight: 700, color: C.amber }}>₹{totalCost(r).toLocaleString("en-IN")}</span> },
    { k: "status",       l: "Status",      render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Bill of Materials" sub="Define product structure and material costs" icon="📐">
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar
            onAdd={openAdd} addLabel="New BOM"
            search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS.slice(0, 5), "bom.csv")}
            onExcel={() => exportExcel(fil, COLS.slice(0, 5), "bom.xls")}
            onPrint={() => printTable(fil, COLS.slice(0, 5), "Bill of Materials")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden}
          />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.product_name} sub={`${viewRow.product_code} · v${viewRow.version} · ₹${totalCost(viewRow).toLocaleString("en-IN")} total`} onClose={() => setViewRow(null)} wide>
          <DR label="BOM Code" value={<Code v={viewRow.product_code} />} />
          <DR label="Product" value={viewRow.product_name} />
          <DR label="Base Quantity" value={`${viewRow.quantity} ${viewRow.unit}`} />
          <DR label="Version" value={viewRow.version} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="Notes" value={viewRow.notes} />
          {viewRow.ingredients?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10, fontFamily: font }}>Components</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: font }}>
                <thead><tr style={{ background: C.green }}>{["Item", "Qty", "Unit", "Unit Cost", "Total"].map(h => <th key={h} style={{ padding: "7px 12px", textAlign: "left", color: C.white, fontWeight: 700 }}>{h}</th>)}</tr></thead>
                <tbody>{viewRow.ingredients.map((ing, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.gray100}`, background: i % 2 ? C.gray50 : C.white }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{ing.item_name}</td>
                    <td style={{ padding: "8px 12px" }}>{ing.quantity}</td>
                    <td style={{ padding: "8px 12px", color: C.gray500 }}>{ing.unit}</td>
                    <td style={{ padding: "8px 12px" }}>₹{(parseFloat(ing.cost) || 0).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: C.amber }}>₹{((parseFloat(ing.quantity) || 0) * (parseFloat(ing.cost) || 0)).toLocaleString("en-IN")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit BOM" : "New Bill of Materials"} sub="Define product structure and material costs" onClose={() => setModal(false)} wide>
          <G2>
            <Fld label="Product Name" req span><input style={inp} value={form.product_name} onChange={e => sf("product_name", e.target.value)} placeholder="Industrial Valve A3" /></Fld>
            <Fld label="BOM Code"><input style={{ ...inp, background: C.gray50 }} value={form.product_code} onChange={e => sf("product_code", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Base Quantity" req><input type="number" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Unit"><select style={sel} value={form.unit} onChange={e => sf("unit", e.target.value)}>{["pcs", "kg", "ltrs", "mtrs", "boxes"].map(u => <option key={u}>{u}</option>)}</select></Fld>
            <Fld label="Version"><input style={inp} value={form.version} onChange={e => sf("version", e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 8px" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: .5, fontFamily: font }}>Components</span>
            <button onClick={() => setForm(f => ({ ...f, ingredients: [...f.ingredients, blankI()] }))} style={{ padding: "5px 12px", borderRadius: 6, border: `1.5px solid ${C.green}`, background: C.white, color: C.green, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>+ Add Row</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: font }}>
            <thead><tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>{["Item Name", "Qty", "Unit", "Cost ₹", ""].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
            <tbody>{form.ingredients.map((ing, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.gray100}` }}>
                <td style={{ padding: "4px 4px" }}><input style={{ ...inp, fontSize: 12 }} value={ing.item_name} onChange={e => si(i, "item_name", e.target.value)} placeholder="Steel Body" /></td>
                <td style={{ padding: "4px 4px", width: 70 }}><input type="number" style={{ ...inp, fontSize: 12 }} value={ing.quantity} onChange={e => si(i, "quantity", e.target.value)} min={0} /></td>
                <td style={{ padding: "4px 4px", width: 70 }}><input style={{ ...inp, fontSize: 12 }} value={ing.unit} onChange={e => si(i, "unit", e.target.value)} /></td>
                <td style={{ padding: "4px 4px", width: 90 }}><input type="number" style={{ ...inp, fontSize: 12 }} value={ing.cost} onChange={e => si(i, "cost", e.target.value)} min={0} /></td>
                <td style={{ padding: "4px 4px", width: 32 }}><button onClick={() => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, j) => j !== i) }))} style={{ background: C.redBg, color: C.red, border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Create BOM"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — WORK ORDERS
// ══════════════════════════════════════════════════════════════════════════════
function WorkOrdersTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [fStatus, setFS] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);

  const blank = { wo_number: "", product_name: "", quantity: "", unit: "pcs", start_date: "", end_date: "", priority: "medium", status: "planned", assigned_team: "", progress: 0, notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    api("/work-orders").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const fil = rows.filter(r => (!fStatus || r.status === fStatus) && `${r.wo_number} ${r.product_name} ${r.assigned_team}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ ...blank, wo_number: genRef("WO", rows) }); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ wo_number: r.wo_number, product_name: r.product_name, quantity: r.quantity, unit: r.unit, start_date: r.start_date?.slice(0, 10) || "", end_date: r.end_date?.slice(0, 10) || "", priority: r.priority, status: r.status, assigned_team: r.assigned_team || "", progress: r.progress || 0, notes: r.notes || "" }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm(`Delete "${r.wo_number}"?`)) return;
    try { await api(`/work-orders/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.product_name || !form.quantity) { show("Product & quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/work-orders/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Updated."); }
      else { const d = await api("/work-orders", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("Work order created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const Bar = ({ pct = 0 }) => {
    const color = pct >= 100 ? C.green : pct > 60 ? C.green : pct > 30 ? C.amber : C.red;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, background: C.gray200, borderRadius: 99, height: 6, overflow: "hidden", minWidth: 80 }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.gray500, minWidth: 28, fontFamily: font }}>{pct}%</span>
      </div>
    );
  };

  const COLS = [
    { k: "wo_number",     l: "WO Number",  render: v => <Code v={v} /> },
    { k: "product_name",  l: "Product",    render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "quantity",      l: "Quantity",   render: (v, r) => `${v} ${r.unit}` },
    { k: "assigned_team", l: "Team" },
    { k: "start_date",    l: "Start",      render: v => v?.slice(0, 10) || "—" },
    { k: "end_date",      l: "Due Date",   render: v => v?.slice(0, 10) || "—" },
    { k: "progress",      l: "Progress",   render: v => <Bar pct={v || 0} /> },
    { k: "priority",      l: "Priority",   render: v => <Badge value={v} /> },
    { k: "status",        l: "Status",     render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Work Orders" sub="Track and manage production work orders" icon="⚙️">
      <KPIs cards={[
        { icon: "📋", label: "Total",       value: rows.length,                                          color: C.green },
        { icon: "🕒", label: "Planned",     value: rows.filter(r => r.status === "planned").length,       color: C.blue },
        { icon: "⚙️", label: "In Progress", value: rows.filter(r => r.status === "in_progress").length,   color: C.amber },
        { icon: "✅", label: "Completed",   value: rows.filter(r => r.status === "completed").length,     color: C.green },
        { icon: "⏸️", label: "On Hold",     value: rows.filter(r => r.status === "on_hold").length,       color: C.red },
      ]} />
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar
            onAdd={openAdd} addLabel="New Work Order"
            search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "work-orders.csv")}
            onExcel={() => exportExcel(fil, COLS, "work-orders.xls")}
            onPrint={() => printTable(fil, COLS, "Work Orders")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden}
            filterEls={
              <select value={fStatus} onChange={e => setFS(e.target.value)} style={{ ...sel, width: 150 }}>
                <option value="">All Status</option>
                {["planned", "in_progress", "completed", "on_hold"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            }
          />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.wo_number} sub="Work Order Details" onClose={() => setViewRow(null)}>
          <DR label="WO Number" value={<Code v={viewRow.wo_number} />} />
          <DR label="Product" value={viewRow.product_name} />
          <DR label="Quantity" value={`${viewRow.quantity} ${viewRow.unit}`} />
          <DR label="Assigned Team" value={viewRow.assigned_team} />
          <DR label="Start Date" value={viewRow.start_date?.slice(0, 10)} />
          <DR label="Due Date" value={viewRow.end_date?.slice(0, 10)} />
          <DR label="Priority" value={<Badge value={viewRow.priority} />} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="Progress" value={`${viewRow.progress || 0}%`} />
          <DR label="Notes" value={viewRow.notes} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button></div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? `Edit ${edit.wo_number}` : "New Work Order"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="WO Number"><input style={{ ...inp, background: C.gray50 }} value={form.wo_number} onChange={e => sf("wo_number", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Product Name" req><input style={inp} value={form.product_name} onChange={e => sf("product_name", e.target.value)} /></Fld>
            <Fld label="Quantity" req><input type="number" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Unit"><select style={sel} value={form.unit} onChange={e => sf("unit", e.target.value)}>{["pcs", "kg", "mtrs", "ltrs", "boxes"].map(u => <option key={u}>{u}</option>)}</select></Fld>
            <Fld label="Start Date"><input type="date" style={inp} value={form.start_date} onChange={e => sf("start_date", e.target.value)} /></Fld>
            <Fld label="End Date"><input type="date" style={inp} value={form.end_date} onChange={e => sf("end_date", e.target.value)} /></Fld>
            <Fld label="Priority"><select style={sel} value={form.priority} onChange={e => sf("priority", e.target.value)}>{["low", "medium", "high"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["planned", "in_progress", "completed", "on_hold"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></Fld>
            <Fld label="Assigned Team"><input style={inp} value={form.assigned_team} onChange={e => sf("assigned_team", e.target.value)} placeholder="Team Alpha" /></Fld>
            <Fld label="Progress (%)"><input type="number" style={inp} value={form.progress} onChange={e => sf("progress", Math.min(100, Math.max(0, +e.target.value)))} min={0} max={100} /></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Create Work Order"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — PRODUCTION
// ══════════════════════════════════════════════════════════════════════════════
function ProductionTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const blank = { ref_no: "", location: "", product: "", quantity: "", total_cost: "", date: today, recipe_used: "", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    api("/production").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const fil = rows.filter(r => `${r.ref_no} ${r.product} ${r.location}`.toLowerCase().includes(search.toLowerCase()));
  const totalQty = rows.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0);
  const totalCost = rows.reduce((s, r) => s + (parseFloat(r.total_cost) || 0), 0);

  const openAdd = () => { setForm({ ...blank, ref_no: genRef("PRD", rows) }); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ ref_no: r.ref_no, location: r.location || "", product: r.product, quantity: r.quantity, total_cost: r.total_cost || "", date: r.date?.slice(0, 10) || today, recipe_used: r.recipe_used || "", notes: r.notes || "" }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm(`Delete "${r.ref_no}"?`)) return;
    try { await api(`/production/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.product || !form.quantity) { show("Product & quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/production/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Updated."); }
      else { const d = await api("/production", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("Saved."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "date",        l: "Date",     render: v => v?.slice(0, 10) || "—" },
    { k: "ref_no",      l: "Ref No",   render: v => <Code v={v} /> },
    { k: "location",    l: "Location", render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v || "—"}</span> },
    { k: "product",     l: "Product",  render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "quantity",    l: "Quantity", render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { k: "total_cost",  l: "Total Cost", render: v => v ? <span style={{ fontWeight: 700, color: C.amber }}>₹{Number(v).toLocaleString("en-IN")}</span> : "—" },
    { k: "recipe_used", l: "BOM / Recipe", render: v => <Code v={v} /> },
  ];

  return (
    <PageShell title="Production" sub="Record and track production runs" icon="🏭">
      <KPIs cards={[
        { icon: "🏭", label: "Total Runs",  value: rows.length,                                        color: C.green },
        { icon: "📦", label: "Total Qty",   value: totalQty,                                           color: C.blue },
        { icon: "💰", label: "Total Cost",  value: `₹${totalCost.toLocaleString("en-IN")}`,            color: C.amber },
      ]} />
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="Add Production" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "production.csv")} onExcel={() => exportExcel(fil, COLS, "production.xls")} onPrint={() => printTable(fil, COLS, "Production Records")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden} />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.ref_no} sub="Production Record Details" onClose={() => setViewRow(null)}>
          <DR label="Reference No" value={<Code v={viewRow.ref_no} />} />
          <DR label="Date" value={viewRow.date?.slice(0, 10)} />
          <DR label="Product" value={viewRow.product} />
          <DR label="Quantity" value={viewRow.quantity} />
          <DR label="Location" value={viewRow.location} />
          <DR label="Total Cost" value={viewRow.total_cost ? `₹${Number(viewRow.total_cost).toLocaleString("en-IN")}` : "—"} />
          <DR label="Recipe / BOM" value={<Code v={viewRow.recipe_used} />} />
          <DR label="Notes" value={viewRow.notes} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button></div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Production" : "Add Production Record"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="Reference No"><input style={{ ...inp, background: C.gray50 }} value={form.ref_no} onChange={e => sf("ref_no", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Date"><input type="date" style={inp} value={form.date} onChange={e => sf("date", e.target.value)} /></Fld>
            <Fld label="Product" req><input style={inp} value={form.product} onChange={e => sf("product", e.target.value)} /></Fld>
            <Fld label="Quantity" req><input type="number" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Location"><input style={inp} value={form.location} onChange={e => sf("location", e.target.value)} placeholder="Unit A - Chennai" /></Fld>
            <Fld label="Total Cost (₹)"><input type="number" style={inp} value={form.total_cost} onChange={e => sf("total_cost", e.target.value)} min={0} /></Fld>
            <Fld label="Recipe / BOM"><input style={inp} value={form.recipe_used} onChange={e => sf("recipe_used", e.target.value)} placeholder="BOM-0001" /></Fld>
            <Fld label="Notes"><input style={inp} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Save Production"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — RESOURCES  (card grid → converted to table)
// ══════════════════════════════════════════════════════════════════════════════
function ResourcesTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);

  const blank = { name: "", type: "Machine", capacity: "", shift: "Morning", operator: "", status: "idle", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    api("/resources").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const fil = rows.filter(r => `${r.name} ${r.type} ${r.operator}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ name: r.name, type: r.type, capacity: r.capacity || "", shift: r.shift, operator: r.operator || "", status: r.status, notes: r.notes || "" }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm(`Delete "${r.name}"?`)) return;
    try { await api(`/resources/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.name) { show("Resource name required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/resources/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Updated."); }
      else { const d = await api("/resources", { method: "POST", body: JSON.stringify(form) }); setRows(p => [...p, d]); show("Added."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "name",     l: "Resource Name", render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "type",     l: "Type",          render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v}</span> },
    { k: "capacity", l: "Capacity/Day",  render: v => v ? `${v} units` : "—" },
    { k: "shift",    l: "Shift" },
    { k: "operator", l: "Operator" },
    { k: "status",   l: "Status",        render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Resources" sub="Manage workshop resources, machines and lines" icon="🏗️">
      <KPIs cards={[
        { icon: "🏗️", label: "Total",       value: rows.length,                                              color: C.green },
        { icon: "▶️", label: "Running",     value: rows.filter(r => r.status === "running").length,           color: C.green },
        { icon: "⏸️", label: "Idle",        value: rows.filter(r => r.status === "idle").length,              color: C.amber },
        { icon: "🔧", label: "Maintenance", value: rows.filter(r => r.status === "maintenance").length,       color: C.red },
      ]} />
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="Add Resource" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "resources.csv")} onExcel={() => exportExcel(fil, COLS, "resources.xls")} onPrint={() => printTable(fil, COLS, "Resources")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden} />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.name} sub="Resource Details" onClose={() => setViewRow(null)}>
          <DR label="Resource Name" value={viewRow.name} />
          <DR label="Type" value={viewRow.type} />
          <DR label="Capacity" value={viewRow.capacity ? `${viewRow.capacity} units/day` : "—"} />
          <DR label="Shift" value={viewRow.shift} />
          <DR label="Operator" value={viewRow.operator} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="Notes" value={viewRow.notes} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button></div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Resource" : "Add Resource"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="Resource Name" req span><input style={inp} value={form.name} onChange={e => sf("name", e.target.value)} placeholder="CNC Machine #1" /></Fld>
            <Fld label="Type"><select style={sel} value={form.type} onChange={e => sf("type", e.target.value)}>{["Machine", "Line", "Station", "Vehicle", "Tool"].map(t => <option key={t}>{t}</option>)}</select></Fld>
            <Fld label="Capacity (units/day)"><input type="number" style={inp} value={form.capacity} onChange={e => sf("capacity", e.target.value)} min={0} /></Fld>
            <Fld label="Shift"><select style={sel} value={form.shift} onChange={e => sf("shift", e.target.value)}>{["Morning", "Evening", "Night", "Full Day"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Operator / Team"><input style={inp} value={form.operator} onChange={e => sf("operator", e.target.value)} placeholder="Rajan Kumar" /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["running", "idle", "maintenance"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Add Resource"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 6 — MACHINES
// ══════════════════════════════════════════════════════════════════════════════
function MachinesTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);

  const blank = { name: "", machine_code: "", type: "", location: "", manufacturer: "", model: "", purchase_date: "", status: "active", last_maintenance: "", next_maintenance: "", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    api("/machines").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const fil = rows.filter(r => `${r.name} ${r.machine_code} ${r.type} ${r.location}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ ...blank, machine_code: genRef("MCH", rows) }); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ name: r.name, machine_code: r.machine_code || "", type: r.type || "", location: r.location || "", manufacturer: r.manufacturer || "", model: r.model || "", purchase_date: r.purchase_date?.slice(0, 10) || "", status: r.status, last_maintenance: r.last_maintenance?.slice(0, 10) || "", next_maintenance: r.next_maintenance?.slice(0, 10) || "", notes: r.notes || "" }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm(`Delete "${r.name}"?`)) return;
    try { await api(`/machines/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.name) { show("Machine name required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/machines/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Updated."); }
      else { const d = await api("/machines", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("Machine added."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "machine_code",     l: "Machine Code",    render: v => <Code v={v} /> },
    { k: "name",             l: "Machine Name",    render: (v, r) => <div><div style={{ fontWeight: 600, color: C.gray900 }}>{v}</div><div style={{ fontSize: 11, color: C.gray400 }}>{r.manufacturer} {r.model}</div></div> },
    { k: "type",             l: "Type",            render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v || "—"}</span> },
    { k: "location",         l: "Location",        render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v || "—"}</span> },
    { k: "last_maintenance", l: "Last Maintenance", render: v => v?.slice(0, 10) || "—" },
    { k: "next_maintenance", l: "Next Maintenance", render: v => v?.slice(0, 10) || "—" },
    { k: "status",           l: "Status",          render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Machines" sub="Machine registry, maintenance schedules and status" icon="🔩">
      <KPIs cards={[
        { icon: "🔩", label: "Total",       value: rows.length,                                              color: C.green },
        { icon: "✅", label: "Active",       value: rows.filter(r => r.status === "active").length,           color: C.green },
        { icon: "🔧", label: "Maintenance", value: rows.filter(r => r.status === "maintenance").length,       color: C.red },
        { icon: "❌", label: "Inactive",    value: rows.filter(r => r.status === "inactive").length,          color: C.gray500 },
      ]} />
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="Add Machine" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "machines.csv")} onExcel={() => exportExcel(fil, COLS, "machines.xls")} onPrint={() => printTable(fil, COLS, "Machines")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden} />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.name} sub="Machine Details" onClose={() => setViewRow(null)}>
          <DR label="Machine Code" value={<Code v={viewRow.machine_code} />} />
          <DR label="Machine Name" value={viewRow.name} />
          <DR label="Type" value={viewRow.type} />
          <DR label="Location" value={viewRow.location} />
          <DR label="Manufacturer" value={viewRow.manufacturer} />
          <DR label="Model" value={viewRow.model} />
          <DR label="Purchase Date" value={viewRow.purchase_date?.slice(0, 10)} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="Last Maintenance" value={viewRow.last_maintenance?.slice(0, 10)} />
          <DR label="Next Maintenance" value={viewRow.next_maintenance?.slice(0, 10)} />
          <DR label="Notes" value={viewRow.notes} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button></div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Machine" : "Add Machine"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="Machine Name" req><input style={inp} value={form.name} onChange={e => sf("name", e.target.value)} /></Fld>
            <Fld label="Machine Code"><input style={{ ...inp, background: C.gray50 }} value={form.machine_code} onChange={e => sf("machine_code", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Type"><input style={inp} value={form.type} onChange={e => sf("type", e.target.value)} placeholder="CNC, Lathe, Press…" /></Fld>
            <Fld label="Location"><input style={inp} value={form.location} onChange={e => sf("location", e.target.value)} placeholder="Bay A" /></Fld>
            <Fld label="Manufacturer"><input style={inp} value={form.manufacturer} onChange={e => sf("manufacturer", e.target.value)} /></Fld>
            <Fld label="Model"><input style={inp} value={form.model} onChange={e => sf("model", e.target.value)} /></Fld>
            <Fld label="Purchase Date"><input type="date" style={inp} value={form.purchase_date} onChange={e => sf("purchase_date", e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["active", "inactive", "maintenance"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Last Maintenance"><input type="date" style={inp} value={form.last_maintenance} onChange={e => sf("last_maintenance", e.target.value)} /></Fld>
            <Fld label="Next Maintenance"><input type="date" style={inp} value={form.next_maintenance} onChange={e => sf("next_maintenance", e.target.value)} /></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Add Machine"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 7 — QUALITY CONTROL
// ══════════════════════════════════════════════════════════════════════════════
function QCTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [fStatus, setFS] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const blank = { ref_no: "", product: "", batch_no: "", inspected_by: "", inspection_date: today, quantity_checked: "", quantity_passed: "", quantity_failed: "", status: "pending", remarks: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    api("/quality-checks").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const fil = rows.filter(r => (!fStatus || r.status === fStatus) && `${r.ref_no} ${r.product} ${r.batch_no}`.toLowerCase().includes(search.toLowerCase()));
  const totalChecked = rows.reduce((s, r) => s + (parseInt(r.quantity_checked) || 0), 0);
  const totalPassed = rows.reduce((s, r) => s + (parseInt(r.quantity_passed) || 0), 0);
  const passRate = totalChecked > 0 ? Math.round(totalPassed / totalChecked * 100) : 0;

  const openAdd = () => { setForm({ ...blank, ref_no: genRef("QC", rows) }); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ ref_no: r.ref_no, product: r.product, batch_no: r.batch_no || "", inspected_by: r.inspected_by || "", inspection_date: r.inspection_date?.slice(0, 10) || today, quantity_checked: r.quantity_checked, quantity_passed: r.quantity_passed, quantity_failed: r.quantity_failed, status: r.status, remarks: r.remarks || "" }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm("Delete this QC record?")) return;
    try { await api(`/quality-checks/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.product || !form.quantity_checked) { show("Product & quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/quality-checks/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Updated."); }
      else { const d = await api("/quality-checks", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("QC record saved."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "inspection_date",  l: "Date",       render: v => v?.slice(0, 10) || "—" },
    { k: "ref_no",           l: "QC Ref No",  render: v => <Code v={v} /> },
    { k: "product",          l: "Product",    render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "batch_no",         l: "Batch No",   render: v => <Code v={v} /> },
    { k: "quantity_checked", l: "Checked",    render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { k: "quantity_passed",  l: "Passed",     render: v => <span style={{ color: C.green, fontWeight: 700 }}>{v}</span> },
    { k: "quantity_failed",  l: "Failed",     render: v => <span style={{ color: v > 0 ? C.red : C.gray400, fontWeight: 700 }}>{v}</span> },
    { k: "inspected_by",     l: "Inspector",  render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v || "—"}</span> },
    { k: "status",           l: "Result",     render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Quality Control" sub="Record and track quality inspection results" icon="🔬">
      <KPIs cards={[
        { icon: "🔬", label: "Total Checks", value: rows.length,                                         color: C.green },
        { icon: "✅", label: "Passed",       value: rows.filter(r => r.status === "passed").length,      color: C.green, sub: `${passRate}% pass rate` },
        { icon: "❌", label: "Failed",       value: rows.filter(r => r.status === "failed").length,      color: C.red },
        { icon: "⏳", label: "Pending",      value: rows.filter(r => r.status === "pending").length,     color: C.amber },
      ]} />
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="Add QC Check" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "quality-checks.csv")} onExcel={() => exportExcel(fil, COLS, "qc.xls")} onPrint={() => printTable(fil, COLS, "Quality Control")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden}
            filterEls={
              <select value={fStatus} onChange={e => setFS(e.target.value)} style={{ ...sel, width: 140 }}>
                <option value="">All Results</option>
                {["pending", "passed", "failed"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            }
          />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.ref_no} sub="Quality Check Details" onClose={() => setViewRow(null)}>
          <DR label="QC Ref No" value={<Code v={viewRow.ref_no} />} />
          <DR label="Date" value={viewRow.inspection_date?.slice(0, 10)} />
          <DR label="Product" value={viewRow.product} />
          <DR label="Batch No" value={<Code v={viewRow.batch_no} />} />
          <DR label="Inspector" value={viewRow.inspected_by} />
          <DR label="Qty Checked" value={viewRow.quantity_checked} />
          <DR label="Qty Passed" value={<span style={{ color: C.green, fontWeight: 700 }}>{viewRow.quantity_passed}</span>} />
          <DR label="Qty Failed" value={<span style={{ color: C.red, fontWeight: 700 }}>{viewRow.quantity_failed}</span>} />
          <DR label="Result" value={<Badge value={viewRow.status} />} />
          <DR label="Remarks" value={viewRow.remarks} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button></div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit QC Record" : "New Quality Check"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="QC Ref No"><input style={{ ...inp, background: C.gray50 }} value={form.ref_no} onChange={e => sf("ref_no", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Inspection Date"><input type="date" style={inp} value={form.inspection_date} onChange={e => sf("inspection_date", e.target.value)} /></Fld>
            <Fld label="Product" req span><input style={inp} value={form.product} onChange={e => sf("product", e.target.value)} /></Fld>
            <Fld label="Batch No"><input style={inp} value={form.batch_no} onChange={e => sf("batch_no", e.target.value)} placeholder="BATCH-A3-01" /></Fld>
            <Fld label="Inspector"><input style={inp} value={form.inspected_by} onChange={e => sf("inspected_by", e.target.value)} /></Fld>
            <Fld label="Qty Checked" req><input type="number" style={inp} value={form.quantity_checked} onChange={e => sf("quantity_checked", e.target.value)} min={0} /></Fld>
            <Fld label="Qty Passed"><input type="number" style={inp} value={form.quantity_passed} onChange={e => sf("quantity_passed", e.target.value)} min={0} /></Fld>
            <Fld label="Qty Failed"><input type="number" style={inp} value={form.quantity_failed} onChange={e => sf("quantity_failed", e.target.value)} min={0} /></Fld>
            <Fld label="Result"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["pending", "passed", "failed"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Remarks" span><textarea style={ta} value={form.remarks} onChange={e => sf("remarks", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Save QC Record"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 8 — MAINTENANCE
// ══════════════════════════════════════════════════════════════════════════════
function MaintenanceTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [fType, setFT] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);

  const blank = { ref_no: "", machine_name: "", maintenance_type: "Preventive", technician: "", scheduled_date: "", completed_date: "", status: "scheduled", cost: "", description: "", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    api("/maintenance").then(d => setRows(d)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const fil = rows.filter(r => (!fType || r.maintenance_type === fType) && `${r.ref_no} ${r.machine_name} ${r.technician}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ ...blank, ref_no: genRef("MNT", rows) }); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ ref_no: r.ref_no, machine_name: r.machine_name, maintenance_type: r.maintenance_type, technician: r.technician || "", scheduled_date: r.scheduled_date?.slice(0, 10) || "", completed_date: r.completed_date?.slice(0, 10) || "", status: r.status, cost: r.cost || "", description: r.description || "", notes: r.notes || "" }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm("Delete this maintenance record?")) return;
    try { await api(`/maintenance/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.machine_name || !form.scheduled_date) { show("Machine name & date required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/maintenance/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Updated."); }
      else { const d = await api("/maintenance", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("Maintenance scheduled."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "ref_no",           l: "Ref No",        render: v => <Code v={v} /> },
    { k: "machine_name",     l: "Machine",        render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "maintenance_type", l: "Type",           render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v}</span> },
    { k: "technician",       l: "Technician",     render: v => <span style={{ fontSize: 12, color: C.gray500 }}>{v || "—"}</span> },
    { k: "scheduled_date",   l: "Scheduled",      render: v => v?.slice(0, 10) || "—" },
    { k: "completed_date",   l: "Completed",      render: v => v?.slice(0, 10) || "—" },
    { k: "cost",             l: "Cost",           render: v => v ? <span style={{ fontWeight: 700, color: C.amber }}>₹{Number(v).toLocaleString("en-IN")}</span> : "—" },
    { k: "status",           l: "Status",         render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Maintenance" sub="Schedule and track machine maintenance" icon="🔧">
      <KPIs cards={[
        { icon: "🔧", label: "Total",      value: rows.length,                                              color: C.green },
        { icon: "📅", label: "Scheduled",  value: rows.filter(r => r.status === "scheduled").length,        color: C.blue },
        { icon: "✅", label: "Completed",  value: rows.filter(r => r.status === "completed").length,        color: C.green },
        { icon: "⚠️", label: "Overdue",   value: rows.filter(r => r.status === "overdue").length,          color: C.red },
      ]} />
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="Schedule Maintenance" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "maintenance.csv")} onExcel={() => exportExcel(fil, COLS, "maintenance.xls")} onPrint={() => printTable(fil, COLS, "Maintenance")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden}
            filterEls={
              <select value={fType} onChange={e => setFT(e.target.value)} style={{ ...sel, width: 150 }}>
                <option value="">All Types</option>
                {["Preventive", "Corrective", "Predictive", "Emergency"].map(t => <option key={t}>{t}</option>)}
              </select>
            }
          />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.ref_no} sub="Maintenance Record Details" onClose={() => setViewRow(null)}>
          <DR label="Ref No" value={<Code v={viewRow.ref_no} />} />
          <DR label="Machine" value={viewRow.machine_name} />
          <DR label="Type" value={viewRow.maintenance_type} />
          <DR label="Technician" value={viewRow.technician} />
          <DR label="Scheduled" value={viewRow.scheduled_date?.slice(0, 10)} />
          <DR label="Completed" value={viewRow.completed_date?.slice(0, 10)} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="Cost" value={viewRow.cost ? `₹${Number(viewRow.cost).toLocaleString("en-IN")}` : "—"} />
          <DR label="Description" value={viewRow.description} />
          <DR label="Notes" value={viewRow.notes} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button></div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Maintenance" : "Schedule Maintenance"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="Ref No"><input style={{ ...inp, background: C.gray50 }} value={form.ref_no} onChange={e => sf("ref_no", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Machine Name" req><input style={inp} value={form.machine_name} onChange={e => sf("machine_name", e.target.value)} /></Fld>
            <Fld label="Type"><select style={sel} value={form.maintenance_type} onChange={e => sf("maintenance_type", e.target.value)}>{["Preventive", "Corrective", "Predictive", "Emergency"].map(t => <option key={t}>{t}</option>)}</select></Fld>
            <Fld label="Technician"><input style={inp} value={form.technician} onChange={e => sf("technician", e.target.value)} /></Fld>
            <Fld label="Scheduled Date" req><input type="date" style={inp} value={form.scheduled_date} onChange={e => sf("scheduled_date", e.target.value)} /></Fld>
            <Fld label="Completed Date"><input type="date" style={inp} value={form.completed_date} onChange={e => sf("completed_date", e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["scheduled", "in_progress", "completed", "overdue"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Cost (₹)"><input type="number" style={inp} value={form.cost} onChange={e => sf("cost", e.target.value)} min={0} /></Fld>
            <Fld label="Description" span><textarea style={ta} value={form.description} onChange={e => sf("description", e.target.value)} /></Fld>
            <Fld label="Notes" span><textarea style={{ ...ta, minHeight: 44 }} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Schedule"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 9 — REPORTS
// ══════════════════════════════════════════════════════════════════════════════
function ReportsTab({ show }) {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().setDate(1)).toISOString().split("T")[0];
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [load, setLoad] = useState(false);

  const doFetch = useCallback(async () => {
    setLoad(true);
    try { setData(await api(`/reports/summary?from=${from}&to=${to}`)); }
    catch { setData({ total_productions: 0, total_quantity: 0, total_cost: 0, completed_orders: 0, top_products: [], qc_summary: { total_checked: 0, total_passed: 0, total_failed: 0 } }); }
    finally { setLoad(false); }
  }, [from, to]);

  useEffect(() => { doFetch(); }, [doFetch]);

  return (
    <PageShell title="Production Reports" sub="Summary analytics across production, quality and orders" icon="📊">
      {/* Filter bar */}
      <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.gray200}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: .5, fontFamily: font }}>Date Range</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inp, width: 150 }} />
        <span style={{ fontSize: 12, color: C.gray400, fontFamily: font }}>to</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...inp, width: 150 }} />
        <button onClick={doFetch} style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: C.green, color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>{load ? "Loading…" : "Apply"}</button>
      </div>

      {data && (
        <>
          <KPIs cards={[
            { icon: "🏭", label: "Total Productions",     value: data.total_productions,                                    color: C.green },
            { icon: "📦", label: "Total Qty Produced",    value: data.total_quantity,                                       color: C.blue },
            { icon: "💰", label: "Total Cost",            value: `₹${Number(data.total_cost || 0).toLocaleString("en-IN")}`, color: C.amber },
            { icon: "✅", label: "Orders Completed",      value: data.completed_orders,                                     color: C.green },
          ]} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Top products */}
            <Card>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.gray900, fontFamily: font }}>Top Products by Quantity</span>
                <span style={{ fontSize: 11, color: C.gray400, fontFamily: font }}>{from} → {to}</span>
              </div>
              {data.top_products?.length > 0
                ? <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font }}>
                  <thead><tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                    {["#", "Product", "Qty", "Cost", "Runs"].map(h => <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{data.top_products.map((p, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.gray100}` }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: C.green }}>#{i + 1}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{p.product}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700 }}>{p.total_qty}</td>
                      <td style={{ padding: "10px 14px", color: C.amber, fontWeight: 600 }}>{p.total_cost ? `₹${Number(p.total_cost).toLocaleString("en-IN")}` : "—"}</td>
                      <td style={{ padding: "10px 14px", color: C.gray500 }}>{p.count}</td>
                    </tr>
                  ))}</tbody>
                </table>
                : <div style={{ padding: "32px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>No production data for this period.</div>
              }
            </Card>

            {/* QC Summary */}
            <Card>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.gray100}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.gray900, fontFamily: font }}>Quality Control Summary</span>
              </div>
              {data.qc_summary ? (
                <div style={{ padding: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[["Inspected", data.qc_summary.total_checked, C.green], ["Passed", data.qc_summary.total_passed, C.green], ["Failed", data.qc_summary.total_failed, C.red]].map(([label, val, color]) => (
                      <div key={label} style={{ background: C.gray50, borderRadius: 8, padding: "12px 14px", textAlign: "center", borderTop: `3px solid ${color}` }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: font }}>{val}</div>
                        <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600, textTransform: "uppercase", fontFamily: font, marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {data.qc_summary.total_checked > 0 && (
                    <div style={{ background: C.greenLight, borderRadius: 8, padding: "12px 16px", border: `1px solid ${C.greenBorder}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.gray600, fontFamily: font }}>Overall Pass Rate</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: font }}>{Math.round(data.qc_summary.total_passed / data.qc_summary.total_checked * 100)}%</span>
                      </div>
                      <div style={{ background: C.gray200, borderRadius: 99, height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round(data.qc_summary.total_passed / data.qc_summary.total_checked * 100)}%`, height: "100%", background: C.green, borderRadius: 99 }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : <div style={{ padding: "32px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>No QC data.</div>}
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 10 — MANUFACTURING SCHEDULE (dedicated schedule entity + timeline)
// ══════════════════════════════════════════════════════════════════════════════
function ScheduleTab({ show }) {
  const [rows, setRows] = useState([]);
  const [wo, setWo] = useState([]);
  const [plans, setPlans] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [fType, setFT] = useState("");
  const [fStatus, setFS] = useState("");
  const [view, setView] = useState("timeline"); // timeline | table
  const [viewRow, setViewRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const blank = {
    ref_no: "", title: "", event_type: "Production Run", product_name: "",
    start_date: today, end_date: today, start_time: "09:00", end_time: "18:00",
    assigned_team: "", location: "", machine_name: "", priority: "medium",
    status: "scheduled", recurrence: "none", notes: "",
  };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoad(true);
    Promise.all([
      api("/schedule").catch(() => []),
      api("/work-orders").catch(() => []),
      api("/plans").catch(() => []),
    ]).then(([s, w, p]) => { setRows(s); setWo(w); setPlans(p); }).finally(() => setLoad(false));
  }, []);

  // Merge dedicated schedule entries with Work Orders + Plans for a unified timeline
  const merged = [
    ...rows.map(r => ({ ...r, kind: r.event_type || "Scheduled Event", source: "schedule", ref: r.ref_no, title: r.title, start: r.start_date, end: r.end_date, team: r.assigned_team, progress: null })),
    ...wo.map(r => ({ ...r, kind: "Work Order", source: "wo", ref: r.wo_number, title: r.product_name, start: r.start_date, end: r.end_date, team: r.assigned_team, progress: r.progress })),
    ...plans.map(r => ({ ...r, kind: "Plan", source: "plan", ref: r.title, title: r.assigned_team || "—", start: r.start_date, end: r.end_date, team: r.assigned_team, progress: null })),
  ].filter(e => e.start);

  const fil = merged.filter(e =>
    (!fType || e.kind === fType) &&
    (!fStatus || e.status === fStatus) &&
    `${e.ref} ${e.title} ${e.team}`.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(a.start) - new Date(b.start));

  const grouped = fil.reduce((acc, e) => {
    const key = e.start?.slice(0, 10) || "Unscheduled";
    (acc[key] = acc[key] || []).push(e);
    return acc;
  }, {});
  const dateKeys = Object.keys(grouped).sort();
  const eventTypes = ["Production Run", "Shift", "Delivery", "Inspection", "Training", "Downtime", "Other"];

  const openAdd = () => { setForm({ ...blank, ref_no: genRef("SCH", rows) }); setEdit(null); setModal(true); };
  const openEdit = r => {
    setForm({
      ref_no: r.ref_no || "", title: r.title || "", event_type: r.event_type || "Production Run",
      product_name: r.product_name || "", start_date: r.start_date?.slice(0, 10) || today,
      end_date: r.end_date?.slice(0, 10) || today, start_time: r.start_time || "09:00", end_time: r.end_time || "18:00",
      assigned_team: r.assigned_team || "", location: r.location || "", machine_name: r.machine_name || "",
      priority: r.priority || "medium", status: r.status || "scheduled", recurrence: r.recurrence || "none",
      notes: r.notes || "",
    });
    setEdit(r); setModal(true);
  };
  const del = async r => {
    if (!confirm(`Delete schedule "${r.title}"?`)) return;
    try { await api(`/schedule/${r.id}`, { method: "DELETE" }); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.title || !form.start_date) { show("Title & start date required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/schedule/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Schedule updated."); }
      else { const d = await api("/schedule", { method: "POST", body: JSON.stringify(form) }); setRows(p => [d, ...p]); show("Schedule created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "ref_no",        l: "Ref No",   render: (v, r) => <Code v={v || r.ref} /> },
    { k: "title",         l: "Title",    render: (v, r) => <span style={{ fontWeight: 600, color: C.gray900 }}>{v || r.title}</span> },
    { k: "event_type",    l: "Type",     render: (v, r) => <span style={{ fontSize: 12, color: C.gray500 }}>{v || r.kind}</span> },
    { k: "start_date",    l: "Start",    render: (v, r) => (v || r.start)?.slice(0, 10) || "—" },
    { k: "end_date",      l: "End",      render: (v, r) => (v || r.end)?.slice(0, 10) || "—" },
    { k: "assigned_team", l: "Team",     render: (v, r) => v || r.team || "—" },
    { k: "priority",      l: "Priority", render: v => v ? <Badge value={v} /> : "—" },
    { k: "status",        l: "Status",  render: v => <Badge value={v} /> },
  ];

  const tableRows = rows; // only dedicated schedule entries go in the editable table

  return (
    <PageShell title="Manufacturing Schedule" sub="Plan, assign and track all production scheduling events" icon="🗓️">
      <KPIs cards={[
        { icon: "🗓️", label: "Total Events", value: merged.length,                                              color: C.green },
        { icon: "⏳", label: "Upcoming",     value: merged.filter(e => !e.end || e.end >= today).length,         color: C.blue },
        { icon: "⚙️", label: "In Progress",  value: merged.filter(e => e.status === "in_progress").length,       color: C.amber },
        { icon: "✅", label: "Completed",    value: merged.filter(e => e.status === "completed").length,         color: C.green },
        { icon: "⚠️", label: "Overdue",      value: merged.filter(e => e.status === "overdue" || (e.end && e.end < today && e.status !== "completed")).length, color: C.red },
      ]} />

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar
            onAdd={openAdd} addLabel="Add Schedule"
            search={search} onSearch={setSearch}
            onCSV={() => exportCSV(tableRows, COLS, "schedule.csv")}
            onExcel={() => exportExcel(tableRows, COLS, "schedule.xls")}
            onPrint={() => printTable(tableRows, COLS, "Manufacturing Schedule")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden}
            filterEls={
              <>
                <select value={fType} onChange={e => setFT(e.target.value)} style={{ ...sel, width: 170 }}>
                  <option value="">All Types</option>
                  {eventTypes.concat(["Work Order", "Plan"]).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={fStatus} onChange={e => setFS(e.target.value)} style={{ ...sel, width: 150 }}>
                  <option value="">All Status</option>
                  {["scheduled", "in_progress", "completed", "on_hold", "overdue"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <select value={view} onChange={e => setView(e.target.value)} style={{ ...sel, width: 140 }}>
                  <option value="timeline">Timeline View</option>
                  <option value="table">Table View</option>
                </select>
              </>
            }
          />
        </div>

        {load ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>Loading…</div>
        ) : view === "table" ? (
          <>
            <DataTable cols={COLS} rows={tableRows.filter(r => `${r.ref_no} ${r.title}`.toLowerCase().includes(search.toLowerCase()))} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
            <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {tableRows.length} scheduled entries</div>
          </>
        ) : dateKeys.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>No scheduled events found. Click "+ Add Schedule" to create one.</div>
        ) : (
          <div style={{ padding: "18px 20px" }}>
            {dateKeys.map(date => (
              <div key={date} style={{ marginBottom: 22 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                  fontSize: 12, fontWeight: 700, color: date === today ? C.green : C.gray500,
                  textTransform: "uppercase", letterSpacing: .5, fontFamily: font,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: date === today ? C.green : C.gray300 }} />
                  {date} {date === today && "(Today)"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 18, borderLeft: `2px solid ${C.gray100}` }}>
                  {grouped[date].map((e, i) => {
                    const kindColor = e.source === "wo" ? { bg: C.blueBg, c: C.blue } : e.source === "plan" ? { bg: C.purpleBg, c: C.purple } : { bg: C.greenLight, c: C.green };
                    return (
                      <div key={i}
                        onClick={() => e.source === "schedule" ? setViewRow(e) : null}
                        style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "10px 14px",
                          background: C.gray50, borderRadius: 8, border: `1px solid ${C.gray200}`,
                          cursor: e.source === "schedule" ? "pointer" : "default",
                        }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: kindColor.bg, color: kindColor.c, whiteSpace: "nowrap" }}>{e.kind}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900, fontFamily: font }}>{e.ref}{e.title ? ` — ${e.title}` : ""}</div>
                          <div style={{ fontSize: 11, color: C.gray400, fontFamily: font }}>
                            {e.team && `Team: ${e.team}`}{e.location ? ` · ${e.location}` : ""}{e.machine_name ? ` · ${e.machine_name}` : ""} {e.end && `· Due: ${e.end.slice(0, 10)}`}
                          </div>
                        </div>
                        {e.progress != null && (
                          <div style={{ width: 90, flexShrink: 0 }}>
                            <div style={{ background: C.gray200, borderRadius: 99, height: 6, overflow: "hidden" }}>
                              <div style={{ width: `${Math.min(e.progress, 100)}%`, height: "100%", background: C.green }} />
                            </div>
                          </div>
                        )}
                        {e.priority && <Badge value={e.priority} />}
                        <Badge value={e.status} />
                        {e.source === "schedule" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={ev => { ev.stopPropagation(); openEdit(e); }} style={{ padding: "4px 9px", borderRadius: 5, border: `1px solid ${C.greenBorder}`, background: C.greenLight, color: C.green, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                            <button onClick={ev => { ev.stopPropagation(); del(e); }} style={{ padding: "4px 9px", borderRadius: 5, border: `1px solid ${C.redBd}`, background: C.redBg, color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Delete</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {viewRow && (
        <Modal title={viewRow.title} sub={`${viewRow.ref_no} · ${viewRow.event_type}`} onClose={() => setViewRow(null)}>
          <DR label="Ref No" value={<Code v={viewRow.ref_no} />} />
          <DR label="Title" value={viewRow.title} />
          <DR label="Event Type" value={viewRow.event_type} />
          <DR label="Product" value={viewRow.product_name} />
          <DR label="Start" value={`${viewRow.start_date?.slice(0, 10)} ${viewRow.start_time || ""}`} />
          <DR label="End" value={`${viewRow.end_date?.slice(0, 10)} ${viewRow.end_time || ""}`} />
          <DR label="Team" value={viewRow.assigned_team} />
          <DR label="Location" value={viewRow.location} />
          <DR label="Machine" value={viewRow.machine_name} />
          <DR label="Priority" value={<Badge value={viewRow.priority} />} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="Recurrence" value={viewRow.recurrence} />
          <DR label="Notes" value={viewRow.notes} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Schedule" : "Add Schedule"} sub="Create a detailed manufacturing schedule entry" onClose={() => setModal(false)} wide>
          <G2>
            <Fld label="Ref No"><input style={{ ...inp, background: C.gray50 }} value={form.ref_no} onChange={e => sf("ref_no", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Title" req><input style={inp} value={form.title} onChange={e => sf("title", e.target.value)} placeholder="e.g. Night Shift — Line 2 Run" /></Fld>
            <Fld label="Event Type"><select style={sel} value={form.event_type} onChange={e => sf("event_type", e.target.value)}>{eventTypes.map(t => <option key={t}>{t}</option>)}</select></Fld>
            <Fld label="Product / Subject"><input style={inp} value={form.product_name} onChange={e => sf("product_name", e.target.value)} placeholder="Industrial Valve A3" /></Fld>
            <Fld label="Start Date" req><input type="date" style={inp} value={form.start_date} onChange={e => sf("start_date", e.target.value)} /></Fld>
            <Fld label="Start Time"><input type="time" style={inp} value={form.start_time} onChange={e => sf("start_time", e.target.value)} /></Fld>
            <Fld label="End Date"><input type="date" style={inp} value={form.end_date} onChange={e => sf("end_date", e.target.value)} /></Fld>
            <Fld label="End Time"><input type="time" style={inp} value={form.end_time} onChange={e => sf("end_time", e.target.value)} /></Fld>
            <Fld label="Assigned Team"><input style={inp} value={form.assigned_team} onChange={e => sf("assigned_team", e.target.value)} placeholder="Team Alpha" /></Fld>
            <Fld label="Location"><input style={inp} value={form.location} onChange={e => sf("location", e.target.value)} placeholder="Unit A - Chennai" /></Fld>
            <Fld label="Machine"><input style={inp} value={form.machine_name} onChange={e => sf("machine_name", e.target.value)} placeholder="CNC Machine #1" /></Fld>
            <Fld label="Priority"><select style={sel} value={form.priority} onChange={e => sf("priority", e.target.value)}>{["low", "medium", "high"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["scheduled", "in_progress", "completed", "on_hold", "overdue"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></Fld>
            <Fld label="Recurrence"><select style={sel} value={form.recurrence} onChange={e => sf("recurrence", e.target.value)}>{["none", "daily", "weekly", "monthly"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Create Schedule"} />
        </Modal>
      )}
    </PageShell>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// MAIN — reads ?tab= from URL, renders matching tab (NO top nav bar)
// ══════════════════════════════════════════════════════════════════════════════
const VALID_TABS = new Set(["planning", "bom", "workorders", "production", "resources", "machines", "qc", "maintenance", "reports", "schedule"]);

export default function Manufacturing() {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("tab");
  const tab = VALID_TABS.has(raw) ? raw : "planning";
  const { show, el } = useToast();

  return (
    <div style={{ fontFamily: font }}>
      {el}
      {tab === "planning"    && <PlanningTab    show={show} />}
      {tab === "bom"         && <BOMTab         show={show} />}
      {tab === "workorders"  && <WorkOrdersTab  show={show} />}
      {tab === "production"  && <ProductionTab  show={show} />}
      {tab === "resources"   && <ResourcesTab   show={show} />}
      {tab === "machines"    && <MachinesTab    show={show} />}
      {tab === "qc"          && <QCTab          show={show} />}
   {tab === "maintenance" && <MaintenanceTab show={show} />}
      {tab === "reports"     && <ReportsTab     show={show} />}
      {tab === "schedule"    && <ScheduleTab    show={show} />}
    </div>
  );
}
/**
 * carbonfoot.jsx — Manod ERP
 * Carbon Footprint / CO2e Tracking module.
 * Self-contained, matches Manufacturing.jsx design system exactly
 * (same PageShell / Card / Modal / Badge / DataTable / Toolbar pattern),
 * uses carbonAPI.js as-is — no backend changes needed beyond the
 * fixed casing + fabric-plans endpoints already shipped server-side.
 *
 * Tabs (internal, URL ?tab=):
 *   dashboard     — CO2e KPIs, by-process/machine/product breakdown, trend
 *   setup         — Industry template + process config (enable/reorder stages)
 *   machines      — Machine registry, IoT device-token issue/copy/regenerate
 *   factors       — Emission factors (kg CO2e per unit) per resource type
 *   batches       — Production batches + per-batch CO2e summary
 *   consumption   — Manual consumption logging (electricity/fuel/gas/water/etc.)
 *   fabric        — Size-wise Fabric Consumption / BOM yield calculator
 *                   Available Fabric ÷ Consumption per Size × Cutting
 *                   Efficiency = Expected Garment Quantity
 *
 * Stages tracked (Garment/Textile template):
 *   Cotton (Raw Material) → Spinning (Yarn) → Weaving/Knitting → Dyeing →
 *   Fabric Processing → Cutting → Stitching (Garment) → Finishing → Packing
 *   → Transportation
 * At each stage: electricity, fuel/diesel, gas/steam, water/wastewater,
 * transportation, and raw materials are logged and converted to CO2e
 * using the Emission Factors table.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Pencil, Trash2, Leaf } from "lucide-react";
import * as carbonAPI from "../api/carbonAPI";

// ─── Design tokens (identical to Manufacturing.jsx) ───────────────────────────
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

const STATUS = {
  planned:     { c: C.blue,   bg: C.blueBg,   bd: C.blueBd   },
  in_progress: { c: C.amber,  bg: C.amberBg,  bd: C.amberBd  },
  completed:   { c: C.green,  bg: C.greenLight,bd: C.greenBorder },
  active:      { c: C.green,  bg: C.greenLight,bd: C.greenBorder },
  inactive:    { c: C.gray500,bg: C.gray100,  bd: C.gray300  },
  manual:      { c: C.blue,   bg: C.blueBg,   bd: C.blueBd   },
  iot:         { c: C.purple, bg: C.purpleBg, bd: C.purpleBd },
};

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
        background: C.white, borderRadius: 12, width: wide ? 780 : 520,
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
const DR = ({ label, value }) => (
  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.gray100}` }}>
    <span style={{ width: 170, flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.gray500, fontFamily: font }}>{label}</span>
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
function printTable(rows, cols, title) {
  const html = `<html><head><title>${title}</title><style>body{font-family:Inter,sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th{background:#1a5c38;color:#fff;padding:8px}td{padding:7px;border-bottom:1px solid #e2e8f0}</style></head><body><h2>${title}</h2><table><tr>${cols.map(c => `<th>${c.l}</th>`).join("")}</tr>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c.k] ?? ""}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
  const w = window.open("", "_blank"); w.document.write(html); w.document.close(); w.print();
}

// ─── Data table ───────────────────────────────────────────────────────────────
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
            {(onView || onEdit || onDelete) && <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: .5, textAlign: "center", width: 110 }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}
              style={{ borderBottom: `1px solid ${C.gray100}`, transition: "background .1s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              {visible.map(c => (
                <td key={c.k} style={{ padding: "11px 14px", color: C.gray700, verticalAlign: "middle" }}>
                  {c.render ? c.render(row[c.k], row) : (row[c.k] ?? <span style={{ color: C.gray300 }}>—</span>)}
                </td>
              ))}
              {(onView || onEdit || onDelete) && (
                <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
                    {onView && <button onClick={() => onView(row)} title="View" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#2563eb", display: "flex" }}><Eye size={17} /></button>}
                    {onEdit && <button onClick={() => onEdit(row)} title="Edit" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#d97706", display: "flex" }}><Pencil size={16} /></button>}
                    {onDelete && <button onClick={() => onDelete(row)} title="Delete" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#dc2626", display: "flex" }}><Trash2 size={17} /></button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PageShell({ title, sub, children }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.gray900, display: "flex", alignItems: "center", gap: 9 }}>
          <Leaf size={22} color={C.green} />{title}
        </h1>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.gray500 }}>{sub}</p>}
      </div>
      {children}
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
    <span style={{ background: chipColor, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 4, letterSpacing: .3, lineHeight: 1 }}>{chip}</span>
    <span style={{ fontSize: 13, color: C.gray700, fontWeight: 500 }}>{label}</span>
  </button>
);

function Toolbar({ onAdd, addLabel, search, onSearch, onCSV, onExcel, onPrint, cols, hiddenCols, setHiddenCols, filterEls }) {
  const [showColMenu, setShowColMenu] = useState(false);
  const colRef = useRef(null);
  useEffect(() => {
    const handler = e => { if (colRef.current && !colRef.current.contains(e.target)) setShowColMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {onCSV && <ExportBtn chip="CSV" chipColor="#1a7a3e" label="Export CSV" onClick={onCSV} />}
          {onExcel && <ExportBtn chip="XLS" chipColor="#1a7a3e" label="Export Excel" onClick={onExcel} />}
          {onPrint && <BtnOut onClick={onPrint}>Print</BtnOut>}
          {cols && <BtnOut onClick={() => setShowColMenu(v => !v)}>Column visibility</BtnOut>}
          {cols && (
            <div ref={colRef} style={{ position: "relative" }}>
              {showColMenu && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100, background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: "8px 0", minWidth: 200 }}>
                  {cols.map(c => (
                    <label key={c.k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, color: C.gray700, fontFamily: font }}>
                      <input type="checkbox" checked={!hiddenCols.includes(c.k)} onChange={() => setHiddenCols(h => h.includes(c.k) ? h.filter(x => x !== c.k) : [...h, c.k])} />
                      {c.l}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {onAdd && (
          <button onClick={onAdd} style={{ padding: "9px 18px", borderRadius: 7, border: "none", background: C.green, color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6 }}>+ {addLabel}</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {filterEls}
        {onSearch && (
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search…" style={{ ...inp, width: 220, fontSize: 13 }} />
          </div>
        )}
      </div>
    </div>
  );
}

function KPIs({ cards }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, 1fr)`, gap: 14, marginBottom: 20 }}>
      {cards.map((k, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.gray200}`, borderLeft: `3px solid ${k.color || C.green}`, padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: .6, marginBottom: 4, fontFamily: font }}>{k.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.gray900, lineHeight: 1, fontFamily: font }}>{k.value ?? "—"}</div>
          {k.sub && <div style={{ fontSize: 11, color: C.gray400, marginTop: 4, fontFamily: font }}>{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.gray200}`, boxShadow: "0 1px 3px rgba(0,0,0,.06)", overflow: "hidden" }}>
      {children}
    </div>
  );
}

// ─── Bar row for simple breakdown lists ────────────────────────────────────────
function BreakdownBars({ rows, labelKey, valueKey, maxColor = C.green }) {
  if (!rows?.length) return <div style={{ padding: "24px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>No data yet.</div>;
  const max = Math.max(...rows.map(r => parseFloat(r[valueKey]) || 0), 0.0001);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 20px" }}>
      {rows.map((r, i) => {
        const val = parseFloat(r[valueKey]) || 0;
        const pct = Math.max(4, (val / max) * 100);
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3, fontFamily: font }}>
              <span style={{ fontWeight: 600, color: C.gray700, textTransform: "capitalize" }}>{String(r[labelKey] || "—").replace(/_/g, " ")}</span>
              <span style={{ fontWeight: 700, color: C.gray900 }}>{val.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: C.gray100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: maxColor, borderRadius: 4, transition: "width .3s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function DashboardTab({ show }) {
  const [dash, setDash] = useState(null);
  const [load, setLoad] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(() => {
    setLoad(true);
    const filters = {};
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    carbonAPI.fetchDashboard(filters)
      .then(d => setDash(d))
      .catch(e => show(e.message, "error"))
      .finally(() => setLoad(false));
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (load && !dash) return <div style={{ padding: "48px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>Loading dashboard…</div>;
  const d = dash || {};

  return (
    <PageShell title="Carbon Footprint Dashboard" sub="Total CO2e emissions across every production stage — spinning to packing">
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
        <Fld label="From"><input type="date" style={inp} value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></Fld>
        <Fld label="To"><input type="date" style={inp} value={dateTo} onChange={e => setDateTo(e.target.value)} /></Fld>
        <button onClick={fetchData} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, color: C.gray700, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Apply</button>
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "transparent", color: C.gray500, fontSize: 13, cursor: "pointer", fontFamily: font }}>Clear</button>}
      </div>

      <KPIs cards={[
        { label: "Total CO2e", value: `${(d.total_co2e_kg || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} kg`, color: C.green },
        { label: "Electricity", value: `${(d.electricity_kwh || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} kWh`, color: C.blue },
        { label: "Fuel / Diesel", value: `${(d.fuel_litres || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} L`, color: C.amber },
        { label: "Water", value: `${(d.water_litres || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} L`, color: C.purple },
        { label: "Fabric Plans", value: d.fabric_plan_count ?? 0, sub: `${(d.fabric_total_qty || 0).toLocaleString("en-IN")} total qty`, color: C.green },
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, fontSize: 13, fontWeight: 700, color: C.gray800, fontFamily: font }}>CO2e by Process Stage</div>
          <BreakdownBars rows={d.by_process} labelKey="process_key" valueKey="co2e_kg" />
        </Card>
        <Card>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, fontSize: 13, fontWeight: 700, color: C.gray800, fontFamily: font }}>CO2e by Resource Type</div>
          <BreakdownBars rows={d.by_resource} labelKey="resource_type" valueKey="co2e_kg" maxColor={C.blue} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, fontSize: 13, fontWeight: 700, color: C.gray800, fontFamily: font }}>Top Emitting Machines</div>
          <BreakdownBars rows={d.by_machine} labelKey="name" valueKey="co2e_kg" maxColor={C.amber} />
        </Card>
        <Card>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, fontSize: 13, fontWeight: 700, color: C.gray800, fontFamily: font }}>CO2e by Batch</div>
          <BreakdownBars rows={d.by_batch} labelKey="batch_code" valueKey="co2e_kg" maxColor={C.purple} />
        </Card>
      </div>

      {d.monthly_trend?.length > 0 && (
        <Card>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, fontSize: 13, fontWeight: 700, color: C.gray800, fontFamily: font, marginTop: 16 }}>Monthly Trend</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "20px", height: 140, overflowX: "auto" }}>
            {d.monthly_trend.map((m, i) => {
              const max = Math.max(...d.monthly_trend.map(x => parseFloat(x.co2e_kg) || 0), 0.0001);
              const h = Math.max(6, (parseFloat(m.co2e_kg) / max) * 100);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 44 }}>
                  <div style={{ fontSize: 10, color: C.gray500, fontFamily: font }}>{Math.round(m.co2e_kg)}</div>
                  <div style={{ width: 24, height: `${h}px`, background: C.green, borderRadius: "4px 4px 0 0" }} />
                  <div style={{ fontSize: 10, color: C.gray400, fontFamily: font, whiteSpace: "nowrap" }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: INDUSTRY SETUP (Template + Process Config)
// ══════════════════════════════════════════════════════════════════════════════
function SetupTab({ show }) {
  const [template, setTemplate] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [load, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStageLabel, setNewStageLabel] = useState("");

  const loadAll = useCallback(async () => {
    setLoad(true);
    try {
      const [t, p] = await Promise.all([carbonAPI.fetchTemplate(), carbonAPI.fetchProcessConfig()]);
      setTemplate(t);
      setProcesses(p?.length ? p : (t?.processes || []).map(x => ({ ...x, enabled: true })));
    } catch (e) { show(e.message, "error"); } finally { setLoad(false); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const toggle = (key) => setProcesses(ps => ps.map(p => p.process_key === key ? { ...p, enabled: !p.enabled } : p));
  const move = (idx, dir) => setProcesses(ps => {
    const arr = [...ps];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return ps;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    return arr.map((p, i) => ({ ...p, sort_order: i }));
  });

  // Slugify a label into a stable process_key, e.g. "Raw Material" -> "raw_material".
  // De-dupes against existing keys by appending _2, _3, etc.
  const slugify = (label) => {
    const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    let key = base || "stage";
    let n = 2;
    while (processes.some(p => p.process_key === key)) { key = `${base}_${n++}`; }
    return key;
  };

  const addStage = () => {
    const label = newStageLabel.trim();
    if (!label) { show("Enter a stage name first.", "error"); return; }
    const process_key = slugify(label);
    setProcesses(ps => [...ps, { process_key, process_label: label, enabled: true, sort_order: ps.length }]);
    setNewStageLabel("");
  };

  const removeStage = (key) => setProcesses(ps => ps.filter(p => p.process_key !== key).map((p, i) => ({ ...p, sort_order: i })));

  const save = async () => {
    if (processes.length === 0) { show("Add at least one process stage first.", "error"); return; }
    setSaving(true);
    try {
      const payload = processes.map((p, i) => ({ ...p, sort_order: i }));
      const saved = await carbonAPI.saveProcessConfig(payload);
      setProcesses(saved);
      show("Process configuration saved.");
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  if (load) return <div style={{ padding: "48px 0", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>Loading…</div>;

  return (
    <PageShell title="Industry Template & Process Stages" sub="Configure which production stages this workspace tracks, and their order">
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.gray900, fontFamily: font }}>{template?.label || "Unconfigured Industry"}</div>
            <div style={{ fontSize: 12, color: C.gray500, marginTop: 2, fontFamily: font }}>
              {template?.supported
                ? `${processes.length} stage(s) configured for this workspace`
                : "This industry type doesn't have a built-in template yet — stages can still be added manually below."}
            </div>
          </div>
          <button onClick={save} disabled={saving} style={{ padding: "9px 18px", borderRadius: 7, border: "none", background: C.green, color: C.white, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .7 : 1, fontFamily: font }}>
            {saving ? "Saving…" : "Save Order & Status"}
          </button>
        </div>
          <div style={{ padding: "8px 0" }}>
          {processes.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>No process stages yet. Add your first one below.</div>}
          {processes.map((p, i) => (
            <div key={p.process_key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: `1px solid ${C.gray100}` }}>
              <span style={{ fontSize: 11, color: C.gray400, width: 24, fontFamily: font }}>#{i + 1}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", color: i === 0 ? C.gray300 : C.gray500, fontSize: 10, lineHeight: 1, padding: 0 }}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === processes.length - 1} style={{ background: "none", border: "none", cursor: i === processes.length - 1 ? "default" : "pointer", color: i === processes.length - 1 ? C.gray300 : C.gray500, fontSize: 10, lineHeight: 1, padding: 0 }}>▼</button>
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.gray800, fontFamily: font }}>{p.process_label}</span>
              <Code v={p.process_key} />
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={p.enabled !== false} onChange={() => toggle(p.process_key)} />
                <span style={{ fontSize: 12, color: C.gray600, fontFamily: font }}>Enabled</span>
              </label>
              <button onClick={() => removeStage(p.process_key)} title="Remove stage" style={{ background: "none", border: "none", cursor: "pointer", color: C.gray400, fontSize: 16, lineHeight: 1, padding: "0 4px" }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, padding: "14px 20px", background: C.gray50 || "#fafafa" }}>
            <input
              value={newStageLabel}
              onChange={e => setNewStageLabel(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addStage(); }}
              placeholder="New stage name, e.g. Dyeing"
              style={{ flex: 1, padding: "9px 12px", borderRadius: 7, border: `1px solid ${C.gray200 || "#ddd"}`, fontSize: 13, fontFamily: font }}
            />
            <button onClick={addStage} style={{ padding: "9px 16px", borderRadius: 7, border: `1px solid ${C.green}`, background: C.white, color: C.green, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              + Add Stage
            </button>
          </div>
        </div>
      </Card>

      {template?.machine_suggestions && Object.keys(template.machine_suggestions).length > 0 && (
        <Card>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, fontSize: 13, fontWeight: 700, color: C.gray800, fontFamily: font, marginTop: 16 }}>Suggested Machines by Stage</div>
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {Object.entries(template.machine_suggestions).map(([stage, machines]) => (
              <div key={stage}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, fontFamily: font }}>{stage.replace(/_/g, " ")}</div>
                {machines.map(m => <div key={m} style={{ fontSize: 12, color: C.gray600, padding: "2px 0", fontFamily: font }}>• {m}</div>)}
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: MACHINES
// ══════════════════════════════════════════════════════════════════════════════
function MachinesTab({ show }) {
  const [rows, setRows] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [hidden, setHidden] = useState([]);

  const blank = { name: "", process_key: "", machine_type: "", status: "active", has_iot: false };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadAll = useCallback(async () => {
    setLoad(true);
    try {
      const [m, p] = await Promise.all([carbonAPI.fetchMachines(), carbonAPI.fetchProcessConfig()]);
      setRows(m); setProcesses(p);
    } catch (e) { show(e.message, "error"); } finally { setLoad(false); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const fil = rows.filter(r => `${r.name} ${r.machine_type}`.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ name: r.name, process_key: r.process_key, machine_type: r.machine_type || "", status: r.status, has_iot: r.has_iot }); setEdit(r); setModal(true); };

  const del = async r => {
    if (!confirm(`Delete machine "${r.name}"?`)) return;
    try { await carbonAPI.deleteMachine(r.id); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.name) { show("Machine name is required.", "error"); return; }
    if (!form.process_key) { show("Please select a process.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await carbonAPI.updateMachine(edit.id, form); setRows(p => p.map(x => x.id === edit.id ? d : x)); show("Machine updated."); }
      else { const d = await carbonAPI.createMachine(form); setRows(p => [d, ...p]); show("Machine created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };
  const regen = async (r) => {
    try { const d = await carbonAPI.regenerateDeviceToken(r.id); setRows(p => p.map(x => x.id === r.id ? d : x)); setViewRow(d); show("Device token regenerated."); } catch (e) { show(e.message, "error"); }
  };
  const copyToken = (token) => { navigator.clipboard?.writeText(token); show("Device token copied to clipboard.", "info"); };

  const COLS = [
    { k: "name", l: "Machine", render: v => <span style={{ fontWeight: 600, color: C.gray900 }}>{v}</span> },
    { k: "process_key", l: "Process", render: v => <Code v={v} /> },
    { k: "machine_type", l: "Type" },
    { k: "has_iot", l: "IoT", render: v => v ? <Badge value="iot" /> : <Badge value="manual" /> },
    { k: "status", l: "Status", render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Machines & IoT Devices" sub="Machine registry per process stage — issue device tokens for automated IoT ingestion">
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="New Machine" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "carbon-machines.csv")}
            onExcel={() => exportExcel(fil, COLS, "carbon-machines.xls")}
            onPrint={() => printTable(fil, COLS, "Carbon Footprint — Machines")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden} />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={setViewRow} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.name} sub={viewRow.process_key} onClose={() => setViewRow(null)}>
          <DR label="Process" value={<Code v={viewRow.process_key} />} />
          <DR label="Type" value={viewRow.machine_type} />
          <DR label="Status" value={<Badge value={viewRow.status} />} />
          <DR label="IoT Enabled" value={viewRow.has_iot ? "Yes" : "No"} />
          {viewRow.has_iot && (
            <>
              <DR label="Device Token" value={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code style={{ fontSize: 11, background: C.gray100, padding: "3px 8px", borderRadius: 4, wordBreak: "break-all" }}>{viewRow.device_token}</code>
                  <button onClick={() => copyToken(viewRow.device_token)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: `1px solid ${C.gray300}`, background: C.white, cursor: "pointer", fontFamily: font }}>Copy</button>
                </div>
              } />
              <div style={{ background: C.gray50, border: `1px dashed ${C.gray300}`, borderRadius: 8, padding: "10px 12px", marginTop: 8, fontSize: 11.5, color: C.gray500, fontFamily: font }}>
                POST to <code>/api/carbon/iot/ingest</code> with header <code>X-Device-Token</code> and body <code>{`{ resource_type, quantity, unit? }`}</code> to log consumption from this device.
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button onClick={() => regen(viewRow)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.amberBd}`, background: C.amberBg, color: C.amber, cursor: "pointer", fontWeight: 600, fontFamily: font }}>Regenerate Token</button>
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setViewRow(null)} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Machine" : "New Machine"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="Machine Name" req span><input style={inp} value={form.name} onChange={e => sf("name", e.target.value)} placeholder="e.g. Dyeing Machine 1" /></Fld>
            <Fld label="Process" req>
              <select style={sel} value={form.process_key} onChange={e => sf("process_key", e.target.value)}>
                <option value="">Select process...</option>
                {processes.map(p => <option key={p.process_key} value={p.process_key}>{p.process_label}</option>)}
              </select>
            </Fld>
            <Fld label="Type"><input style={inp} value={form.machine_type} onChange={e => sf("machine_type", e.target.value)} placeholder="e.g. Boiler" /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></Fld>
            <Fld label="IoT Enabled">
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.has_iot} onChange={e => sf("has_iot", e.target.checked)} />
                <span style={{ fontSize: 12, color: C.gray600, fontFamily: font }}>Issue a device token on save</span>
              </label>
            </Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Create Machine"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: EMISSION FACTORS
// ══════════════════════════════════════════════════════════════════════════════
function FactorsTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const blank = { resource_type: "electricity", unit: "kWh", factor: "", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load1 = useCallback(() => {
    setLoad(true);
    carbonAPI.fetchEmissionFactors().then(setRows).catch(e => show(e.message, "error")).finally(() => setLoad(false));
  }, []);
  useEffect(() => { load1(); }, [load1]);

  const openEdit = (r) => { setForm({ resource_type: r.resource_type, unit: r.unit, factor: r.factor, notes: r.notes || "" }); setModal(true); };
  const openAdd = () => { setForm(blank); setModal(true); };
  const save = async () => {
       if (!form.resource_type || !form.unit) { show("Resource type and unit are required.", "error"); return; }
    const numericPattern = /^-?\d+(\.\d+)?$/;
    if (!numericPattern.test(String(form.factor).trim())) {
      show("Factor must be a valid number, e.g. 0.42 or 2.68.", "error");
      return;
    }
    if (parseFloat(form.factor) <= 0) {
      show("Factor must be greater than 0.", "error");
      return;
    }
    setSaving(true);
    try {
      const d = await carbonAPI.saveEmissionFactor(form);
      setRows(p => {
        const idx = p.findIndex(x => x.resource_type === d.resource_type && x.unit === d.unit);
        if (idx >= 0) { const c = [...p]; c[idx] = d; return c; }
        return [...p, d];
      });
      show("Emission factor saved.");
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "resource_type", l: "Resource Type", render: v => <span style={{ fontWeight: 600, color: C.gray900, textTransform: "capitalize" }}>{String(v).replace(/_/g, " ")}</span> },
    { k: "unit", l: "Unit" },
    { k: "factor", l: "kg CO2e / unit", render: v => <span style={{ fontWeight: 700, color: C.green }}>{parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 6 })}</span> },
    { k: "notes", l: "Notes" },
  ];

  return (
    <PageShell title="Emission Factors" sub="kg CO2e per unit of each resource — used to convert consumption logs into carbon cost">
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="New Factor" />
        </div>
        <DataTable cols={COLS} rows={rows} loading={load} onEdit={openEdit} />
      </Card>

      {modal && (
        <Modal title="Emission Factor" sub="Verify against your actual grid / supplier data" onClose={() => setModal(false)}>
          <G2>
            <Fld label="Resource Type" req>
              <select style={sel} value={form.resource_type} onChange={e => sf("resource_type", e.target.value)}>
                {['electricity', 'diesel', 'natural_gas', 'steam', 'water', 'wastewater', 'transportation', 'raw_material'].map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
              </select>
            </Fld>
            <Fld label="Unit" req><input style={inp} value={form.unit} onChange={e => sf("unit", e.target.value)} placeholder="kWh / litres / kg / km" /></Fld>
            <Fld label="Factor (kg CO2e / unit)" req span><input type="number" step="0.000001" style={inp} value={form.factor} onChange={e => sf("factor", e.target.value)} /></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label="Save Factor" />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: BATCHES
// ══════════════════════════════════════════════════════════════════════════════
function BatchesTab({ show }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [summary, setSummary] = useState(null);
  const [hidden, setHidden] = useState([]);

  const blank = { batch_code: "", quantity: "", unit: "pcs", status: "in_progress" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadAll = useCallback(() => {
    setLoad(true);
    carbonAPI.fetchBatches().then(setRows).catch(e => show(e.message, "error")).finally(() => setLoad(false));
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const fil = rows.filter(r => `${r.batch_code} ${r.product_name || ""}`.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ batch_code: r.batch_code, quantity: r.quantity || "", unit: r.unit, status: r.status }); setEdit(r); setModal(true); };
  const del = async r => {
    if (!confirm(`Delete batch "${r.batch_code}"?`)) return;
    try { await carbonAPI.deleteBatch(r.id); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    setSaving(true);
    try {
      if (edit) { const d = await carbonAPI.updateBatch(edit.id, form); setRows(p => p.map(x => x.id === edit.id ? { ...x, ...d } : x)); show("Batch updated."); }
      else { const d = await carbonAPI.createBatch(form); setRows(p => [d, ...p]); show("Batch created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };
  const openSummary = async (r) => {
    setViewRow(r);
    try { const s = await carbonAPI.fetchBatchSummary(r.id); setSummary(s); } catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "batch_code", l: "Batch Code", render: v => <Code v={v} /> },
    { k: "product_name", l: "Product", render: v => v || <span style={{ color: C.gray400 }}>—</span> },
    { k: "quantity", l: "Quantity", render: (v, r) => v ? `${v} ${r.unit}` : "—" },
    { k: "total_co2e_kg", l: "Total CO2e", render: v => <span style={{ fontWeight: 700, color: C.green }}>{parseFloat(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg</span> },
    { k: "status", l: "Status", render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Production Batches" sub="Group consumption logs by batch to see CO2e cost per garment / product">
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="New Batch" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "carbon-batches.csv")}
            onExcel={() => exportExcel(fil, COLS, "carbon-batches.xls")}
            onPrint={() => printTable(fil, COLS, "Carbon Footprint — Batches")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden} />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={openSummary} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.batch_code} sub="Batch CO2e summary" onClose={() => { setViewRow(null); setSummary(null); }} wide>
          {!summary ? <div style={{ padding: 24, textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>Loading…</div> : (
            <>
              <KPIs cards={[
                { label: "Total CO2e", value: `${(summary.total_co2e_kg || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg`, color: C.green },
                { label: "CO2e / Unit", value: summary.co2e_per_unit_kg != null ? `${summary.co2e_per_unit_kg.toLocaleString("en-IN", { maximumFractionDigits: 3 })} kg` : "—", color: C.blue },
                { label: "Fabric Plans", value: summary.fabric_plans?.length || 0, color: C.purple },
              ]} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8, fontFamily: font }}>By Process</div>
              <BreakdownBars rows={summary.by_process} labelKey="process_key" valueKey="co2e_kg" />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: .5, margin: "16px 0 8px", fontFamily: font }}>By Resource</div>
              <BreakdownBars rows={summary.by_resource} labelKey="resource_type" valueKey="co2e_kg" maxColor={C.blue} />
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => { setViewRow(null); setSummary(null); }} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Batch" : "New Batch"} onClose={() => setModal(false)}>
          <G2>
            <Fld label="Batch Code"><input style={{ ...inp, background: C.gray50 }} value={form.batch_code} onChange={e => sf("batch_code", e.target.value)} placeholder="Auto-generated if left blank" /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="on_hold">On Hold</option></select></Fld>
            <Fld label="Quantity"><input type="number" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Unit"><select style={sel} value={form.unit} onChange={e => sf("unit", e.target.value)}>{["pcs", "kg", "mtrs", "boxes"].map(u => <option key={u}>{u}</option>)}</select></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Create Batch"} />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONSUMPTION LOGGING
// ══════════════════════════════════════════════════════════════════════════════
function ConsumptionTab({ show }) {
  const [rows, setRows] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [machines, setMachines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [load, setLoad] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fProcess, setFProcess] = useState("");
  const [hidden, setHidden] = useState([]);

  const blank = { batch_id: "", process_key: "", machine_id: "", resource_type: "electricity", quantity: "", unit: "kWh", department: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadAll = useCallback(async () => {
    setLoad(true);
    try {
      const filters = fProcess ? { process_key: fProcess } : {};
      const [logs, p, m, b] = await Promise.all([
        carbonAPI.fetchConsumption(filters), carbonAPI.fetchProcessConfig(), carbonAPI.fetchMachines(), carbonAPI.fetchBatches(),
      ]);
      setRows(logs); setProcesses(p); setMachines(m); setBatches(b);
    } catch (e) { show(e.message, "error"); } finally { setLoad(false); }
  }, [fProcess]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const openAdd = () => { setForm(blank); setModal(true); };
  const machinesForProcess = machines.filter(m => !form.process_key || m.process_key === form.process_key);

  const save = async () => {
    if (!form.process_key) { show("Please select a process.", "error"); return; }
    if (!form.resource_type) { show("Please select a resource type.", "error"); return; }
    if (form.quantity === "" || isNaN(parseFloat(form.quantity))) { show("Quantity is required.", "error"); return; }
    setSaving(true);
    try {
      const d = await carbonAPI.logConsumption({ ...form, batch_id: form.batch_id || null, machine_id: form.machine_id || null });
      setRows(p => [d, ...p]);
      show(`Logged — ${parseFloat(d.co2e_kg).toFixed(3)} kg CO2e added.`);
      setModal(false);
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };

  const COLS = [
    { k: "recorded_at", l: "Date", render: v => v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—" },
    { k: "process_key", l: "Process", render: v => <Code v={v} /> },
    { k: "resource_type", l: "Resource", render: v => <span style={{ textTransform: "capitalize" }}>{String(v).replace(/_/g, " ")}</span> },
    { k: "quantity", l: "Qty", render: (v, r) => `${parseFloat(v).toLocaleString("en-IN")} ${r.unit || ""}` },
    { k: "co2e_kg", l: "CO2e", render: v => <span style={{ fontWeight: 700, color: C.green }}>{parseFloat(v).toFixed(3)} kg</span> },
    { k: "source", l: "Source", render: v => <Badge value={v} /> },
  ];

  return (
    <PageShell title="Consumption Logging" sub="Log electricity, fuel/diesel, gas/steam, water, transportation, and raw material use per stage">
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="Log Consumption"
            filterEls={
              <select style={{ ...sel, width: 200 }} value={fProcess} onChange={e => setFProcess(e.target.value)}>
                <option value="">All processes</option>
                {processes.map(p => <option key={p.process_key} value={p.process_key}>{p.process_label}</option>)}
              </select>
            }
            onCSV={() => exportCSV(rows, COLS, "carbon-consumption.csv")}
            onExcel={() => exportExcel(rows, COLS, "carbon-consumption.xls")}
            onPrint={() => printTable(rows, COLS, "Carbon Footprint — Consumption Log")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden} />
        </div>
        <DataTable cols={COLS} rows={rows} loading={load} hiddenCols={hidden} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing latest {rows.length} entries · IoT devices post directly to <code>/api/carbon/iot/ingest</code></div>
      </Card>

      {modal && (
        <Modal title="Log Consumption" sub="CO2e is calculated automatically from the Emission Factors table" onClose={() => setModal(false)}>
          <G2>
            <Fld label="Process" req>
              <select style={sel} value={form.process_key} onChange={e => sf("process_key", e.target.value)}>
                <option value="">Select process...</option>
                {processes.map(p => <option key={p.process_key} value={p.process_key}>{p.process_label}</option>)}
              </select>
            </Fld>
            <Fld label="Machine (optional)">
              <select style={sel} value={form.machine_id} onChange={e => sf("machine_id", e.target.value)}>
                <option value="">None / manual entry</option>
                {machinesForProcess.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Fld>
            <Fld label="Resource Type" req>
              <select style={sel} value={form.resource_type} onChange={e => sf("resource_type", e.target.value)}>
                {['electricity', 'diesel', 'natural_gas', 'steam', 'water', 'wastewater', 'transportation', 'raw_material'].map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
              </select>
            </Fld>
            <Fld label="Unit"><input style={inp} value={form.unit} onChange={e => sf("unit", e.target.value)} placeholder="kWh / litres / kg / km" /></Fld>
            <Fld label="Quantity" req><input type="number" step="0.01" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Batch (optional)">
              <select style={sel} value={form.batch_id} onChange={e => sf("batch_id", e.target.value)}>
                <option value="">None</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batch_code}</option>)}
              </select>
            </Fld>
            <Fld label="Department" span><input style={inp} value={form.department} onChange={e => sf("department", e.target.value)} placeholder="Optional" /></Fld>
          </G2>
          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label="Log Entry" />
        </Modal>
      )}
    </PageShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: FABRIC CONSUMPTION (Size-wise BOM / Yield Calculator)
// Available Fabric ÷ Consumption per Size × Cutting Efficiency = Expected Qty
// ══════════════════════════════════════════════════════════════════════════════
function FabricTab({ show }) {
  const [rows, setRows] = useState([]);
  const [batches, setBatches] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [hidden, setHidden] = useState([]);

  const blankSize = () => ({ size_label: "", consumption_per_unit: "", fabric_allocated: "" });
  const blank = { batch_id: "", plan_name: "", fabric_type: "", available_fabric_qty: "", fabric_unit: "kg", cutting_efficiency_pct: "85", notes: "", sizes: ["XS", "S", "M", "L", "XL", "XXL"].map(s => ({ size_label: s, consumption_per_unit: "", fabric_allocated: "" })) };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const ss = (i, k, v) => setForm(f => ({ ...f, sizes: f.sizes.map((x, j) => j === i ? { ...x, [k]: v } : x) }));

  const loadAll = useCallback(async () => {
    setLoad(true);
    try {
      const [plans, b] = await Promise.all([carbonAPI.fetchFabricPlans?.() ?? fetchFabricPlansFallback(), carbonAPI.fetchBatches()]);
      setRows(plans); setBatches(b);
    } catch (e) { show(e.message, "error"); } finally { setLoad(false); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  // Live preview calc (mirrors backend computeSizePlan logic) so the user
  // sees Expected Qty update as they type, before saving.
  const preview = (() => {
    const effPct = parseFloat(form.cutting_efficiency_pct) || 0;
    const available = parseFloat(form.available_fabric_qty) || 0;
    const usablePool = available * (effPct / 100);
    const anyAllocated = form.sizes.some(s => s.fabric_allocated && parseFloat(s.fabric_allocated) > 0);
    let remaining = usablePool;
    const sizeRows = form.sizes.map(s => {
      const perUnit = parseFloat(s.consumption_per_unit) || 0;
      let usable;
      if (anyAllocated) usable = (parseFloat(s.fabric_allocated) || 0) * (effPct / 100);
      else usable = null;
      let expected, used;
      if (anyAllocated) {
        expected = perUnit > 0 ? Math.floor(usable / perUnit) : 0;
        used = expected * perUnit;
      } else {
        expected = perUnit > 0 ? Math.floor(remaining / perUnit) : 0;
        used = expected * perUnit;
        remaining = Math.max(0, remaining - used);
      }
      return { ...s, expected, used };
    });
    const totalExpected = sizeRows.reduce((s, r) => s + r.expected, 0);
    const totalUsed = sizeRows.reduce((s, r) => s + r.used, 0);
    return { sizeRows, totalExpected, totalUsed, usablePool, effLoss: available - usablePool };
  })();

  const fil = rows.filter(r => `${r.plan_name || ""} ${r.fabric_type || ""}`.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = (r) => {
    carbonAPI.fetchFabricPlans ? loadPlanForEdit(r) : null;
  };
  const loadPlanForEdit = async (r) => {
    try {
      const detail = await carbonAPI.fetchFabricPlanDetail?.(r.id) ?? fetchFabricPlanDetailFallback(r.id);
      setForm({
        batch_id: detail.plan.batch_id || "", plan_name: detail.plan.plan_name || "", fabric_type: detail.plan.fabric_type || "",
        available_fabric_qty: detail.plan.available_fabric_qty, fabric_unit: detail.plan.fabric_unit,
        cutting_efficiency_pct: detail.plan.cutting_efficiency_pct, notes: detail.plan.notes || "",
        sizes: detail.sizes.length ? detail.sizes.map(s => ({ size_label: s.size_label, consumption_per_unit: s.consumption_per_unit, fabric_allocated: s.fabric_allocated || "" })) : blank.sizes,
      });
      setEdit(r); setModal(true);
    } catch (e) { show(e.message, "error"); }
  };
  const del = async r => {
    if (!confirm(`Delete fabric plan "${r.plan_name || r.id}"?`)) return;
    try { await carbonAPI.deleteFabricPlan?.(r.id) ?? deleteFabricPlanFallback(r.id); setRows(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); } catch (e) { show(e.message, "error"); }
  };
  const save = async () => {
    if (!form.available_fabric_qty || parseFloat(form.available_fabric_qty) <= 0) { show("Available fabric quantity is required.", "error"); return; }
    const validSizes = form.sizes.filter(s => s.size_label && s.consumption_per_unit);
    if (!validSizes.length) { show("Add at least one size with consumption per unit.", "error"); return; }
    setSaving(true);
    try {
      const payload = { ...form, batch_id: form.batch_id || null, sizes: validSizes };
      let detail;
      if (edit) detail = await (carbonAPI.updateFabricPlan?.(edit.id, payload) ?? updateFabricPlanFallback(edit.id, payload));
      else detail = await (carbonAPI.createFabricPlan?.(payload) ?? createFabricPlanFallback(payload));
      show(edit ? "Fabric plan updated." : "Fabric plan created.");
      setModal(false);
      loadAll();
    } catch (e) { show(e.message, "error"); } finally { setSaving(false); }
  };
  const openView = async (r) => {
    setViewRow(r);
    try { const detail = await (carbonAPI.fetchFabricPlanDetail?.(r.id) ?? fetchFabricPlanDetailFallback(r.id)); setViewDetail(detail); } catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "plan_name", l: "Plan", render: (v, r) => <span style={{ fontWeight: 600, color: C.gray900 }}>{v || `Plan #${r.id}`}</span> },
    { k: "fabric_type", l: "Fabric Type" },
    { k: "available_fabric_qty", l: "Available", render: (v, r) => `${parseFloat(v).toLocaleString("en-IN")} ${r.fabric_unit}` },
    { k: "cutting_efficiency_pct", l: "Cutting Eff.", render: v => `${v}%` },
    { k: "batch_id", l: "Batch", render: (v, r) => r.batch_code || (v ? `#${v}` : "—") },
  ];

  return (
    <PageShell title="Fabric Consumption / Yield Calculator" sub="Available Fabric ÷ Consumption per Size × Cutting Efficiency = Expected Garment Quantity">
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <Toolbar onAdd={openAdd} addLabel="New Fabric Plan" search={search} onSearch={setSearch}
            onCSV={() => exportCSV(fil, COLS, "fabric-plans.csv")}
            onExcel={() => exportExcel(fil, COLS, "fabric-plans.xls")}
            onPrint={() => printTable(fil, COLS, "Fabric Consumption Plans")}
            cols={COLS} hiddenCols={hidden} setHiddenCols={setHidden} />
        </div>
        <DataTable cols={COLS} rows={fil} loading={load} hiddenCols={hidden} onView={openView} onEdit={openEdit} onDelete={del} />
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray100}`, fontSize: 12, color: C.gray400, fontFamily: font }}>Showing {fil.length} of {rows.length} entries</div>
      </Card>

      {viewRow && (
        <Modal title={viewRow.plan_name || `Fabric Plan #${viewRow.id}`} sub={viewRow.fabric_type} onClose={() => { setViewRow(null); setViewDetail(null); }} wide>
          {!viewDetail ? <div style={{ padding: 24, textAlign: "center", color: C.gray400, fontSize: 13, fontFamily: font }}>Loading…</div> : (
            <>
              <KPIs cards={[
                { label: "Available Fabric", value: `${viewDetail.computed.available_fabric_qty.toLocaleString("en-IN")} ${viewDetail.computed.fabric_unit}`, color: C.blue },
                { label: "Usable After Cutting Eff.", value: `${viewDetail.computed.usable_fabric_after_efficiency.toLocaleString("en-IN")} ${viewDetail.computed.fabric_unit}`, color: C.amber },
                { label: "Expected Garments", value: viewDetail.computed.total_expected_qty.toLocaleString("en-IN"), color: C.green },
              ]} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: font }}>
                <thead><tr style={{ background: C.green }}>{["Size", "Consumption/pc", "Expected Qty", "Fabric Used"].map(h => <th key={h} style={{ padding: "7px 12px", textAlign: "left", color: C.white, fontWeight: 700 }}>{h}</th>)}</tr></thead>
                <tbody>{viewDetail.computed.sizes.map((s, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.gray100}`, background: i % 2 ? C.gray50 : C.white }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.size_label}</td>
                    <td style={{ padding: "8px 12px" }}>{s.consumption_per_unit} {viewDetail.computed.fabric_unit}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: C.green }}>{s.expected_qty.toLocaleString("en-IN")} pcs</td>
                    <td style={{ padding: "8px 12px" }}>{s.fabric_used.toLocaleString("en-IN")} {viewDetail.computed.fabric_unit}</td>
                  </tr>
                ))}</tbody>
              </table>
              {viewDetail.plan.notes && <div style={{ marginTop: 12, fontSize: 12, color: C.gray600, fontFamily: font }}><strong>Notes:</strong> {viewDetail.plan.notes}</div>}
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => { setViewRow(null); setViewDetail(null); }} style={{ padding: "8px 20px", background: C.gray100, border: "none", cursor: "pointer", borderRadius: 6, fontWeight: 600, color: C.gray700, fontFamily: font }}>Close</button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={edit ? "Edit Fabric Plan" : "New Fabric Consumption Plan"} sub="Size-wise BOM — computes expected garment output from available fabric" onClose={() => setModal(false)} wide>
          <G2>
            <Fld label="Plan Name" span><input style={inp} value={form.plan_name} onChange={e => sf("plan_name", e.target.value)} placeholder="e.g. Round Neck Tee — Lot 42" /></Fld>
            <Fld label="Fabric Type"><input style={inp} value={form.fabric_type} onChange={e => sf("fabric_type", e.target.value)} placeholder="e.g. 180 GSM Cotton" /></Fld>
            <Fld label="Batch (optional)">
              <select style={sel} value={form.batch_id} onChange={e => sf("batch_id", e.target.value)}>
                <option value="">None</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batch_code}</option>)}
              </select>
            </Fld>
            <Fld label="Available Fabric Qty" req><input type="number" step="0.01" style={inp} value={form.available_fabric_qty} onChange={e => sf("available_fabric_qty", e.target.value)} min={0} /></Fld>
            <Fld label="Fabric Unit"><select style={sel} value={form.fabric_unit} onChange={e => sf("fabric_unit", e.target.value)}>{["kg", "mtrs", "yds"].map(u => <option key={u}>{u}</option>)}</select></Fld>
            <Fld label="Cutting Efficiency %" req span><input type="number" style={inp} value={form.cutting_efficiency_pct} onChange={e => sf("cutting_efficiency_pct", e.target.value)} min={0} max={100} /></Fld>
          </G2>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 8px" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: .5, fontFamily: font }}>Size-wise Consumption</span>
            <button onClick={() => setForm(f => ({ ...f, sizes: [...f.sizes, blankSize()] }))} style={{ padding: "5px 12px", borderRadius: 6, border: `1.5px solid ${C.green}`, background: C.white, color: C.green, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>+ Add Size</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: font }}>
            <thead><tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>{["Size", `Consumption / pc (${form.fabric_unit})`, "Fabric Allocated (optional)", "Expected Qty", ""].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
            <tbody>{preview.sizeRows.map((sRow, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.gray100}` }}>
                <td style={{ padding: "4px 4px", width: 90 }}><input style={{ ...inp, fontSize: 12 }} value={sRow.size_label} onChange={e => ss(i, "size_label", e.target.value)} placeholder="S / M / L" /></td>
                <td style={{ padding: "4px 4px", width: 140 }}><input type="number" style={{ ...inp, fontSize: 12 }} value={sRow.consumption_per_unit} onChange={e => ss(i, "consumption_per_unit", e.target.value)} min={0} step="0.001" /></td>
                <td style={{ padding: "4px 4px", width: 150 }}><input type="number" style={{ ...inp, fontSize: 12 }} value={sRow.fabric_allocated} onChange={e => ss(i, "fabric_allocated", e.target.value)} min={0} step="0.01" placeholder="leave blank = shared pool" /></td>
                <td style={{ padding: "4px 4px", fontWeight: 700, color: C.green }}>{sRow.expected.toLocaleString("en-IN")} pcs</td>
                <td style={{ padding: "4px 4px", width: 32 }}><button onClick={() => setForm(f => ({ ...f, sizes: f.sizes.filter((_, j) => j !== i) }))} style={{ background: C.redBg, color: C.red, border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>

          <div style={{ background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, padding: "12px 16px", marginTop: 12, fontFamily: font }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: C.green }}>
              <span>Total Expected Garments</span><span>{preview.totalExpected.toLocaleString("en-IN")} pcs</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.gray600, marginTop: 4 }}>
              <span>Fabric Used</span><span>{preview.totalUsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })} {form.fabric_unit}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.gray600 }}>
              <span>Cutting-Efficiency Loss</span><span>{preview.effLoss.toLocaleString("en-IN", { maximumFractionDigits: 2 })} {form.fabric_unit}</span>
            </div>
          </div>
          <div style={{ background: C.gray50, border: `1px dashed ${C.gray300}`, borderRadius: 8, padding: "8px 12px", marginTop: 8, fontSize: 11.5, color: C.gray500, fontFamily: font }}>
            Formula: Expected Qty (per size) = ⌊ (Available Fabric × Cutting Efficiency%) ÷ Consumption per Size ⌋. Leave "Fabric Allocated" blank to draw all sizes from one shared fabric pool in the order listed; set it per row to pre-allocate fabric per size instead.
          </div>

          <G2 cols={1}>
            <Fld label="Notes"><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </G2>

          <MFoot onClose={() => setModal(false)} onSave={save} saving={saving} label={edit ? "Save Changes" : "Create Plan"} />
        </Modal>
      )}
    </PageShell>
  );
}

// Fallback helpers — used only if carbonAPI.js hasn't been redeployed yet
// with the new fabric-plan functions (keeps this page from hard-crashing
// during a rolling deploy). Once carbonAPI.js ships the real exports,
// these are simply never called (the `?.` checks above prefer the real ones).
const FALLBACK_BASE = (() => {
  try { return (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/carbon"; } catch { return "/api/carbon"; }
})();
const fallbackHeaders = () => {
  const industryId = localStorage.getItem("manod_active_industry_id");
  return { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("manod_token") || ""}`, ...(industryId ? { "X-Industry-Id": industryId } : {}) };
};
async function fallbackRequest(url, options = {}) {
  const res = await fetch(url, { headers: fallbackHeaders(), ...options });
  let body; try { body = await res.json(); } catch { body = {}; }
  if (!res.ok || body?.success === false) throw new Error(body?.message || body?.error || `Request failed (${res.status})`);
  return body;
}
const fetchFabricPlansFallback = () => fallbackRequest(`${FALLBACK_BASE}/fabric-plans`).then(d => d.plans || []);
const fetchFabricPlanDetailFallback = (id) => fallbackRequest(`${FALLBACK_BASE}/fabric-plans/${id}`);
const createFabricPlanFallback = (data) => fallbackRequest(`${FALLBACK_BASE}/fabric-plans`, { method: "POST", body: JSON.stringify(data) });
const updateFabricPlanFallback = (id, data) => fallbackRequest(`${FALLBACK_BASE}/fabric-plans/${id}`, { method: "PUT", body: JSON.stringify(data) });
const deleteFabricPlanFallback = (id) => fallbackRequest(`${FALLBACK_BASE}/fabric-plans/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — tab router
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: "dashboard",   label: "Dashboard" },
  { key: "setup",       label: "Industry Setup" },
  { key: "machines",    label: "Machines" },
  { key: "factors",     label: "Emission Factors" },
  { key: "batches",     label: "Batches" },
  { key: "consumption", label: "Consumption Log" },
  { key: "fabric",      label: "Fabric Consumption" },
];

export default function CarbonFootprint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  const { show, el: toastEl } = useToast();

  const setTab = (key) => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set("tab", key); return p; });

  return (
    <div style={{ fontFamily: font, padding: "0 4px" }}>
      {toastEl}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.gray200}`, marginBottom: 20, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "10px 16px", background: "none", border: "none", borderBottom: activeTab === t.key ? `2px solid ${C.green}` : "2px solid transparent",
            color: activeTab === t.key ? C.green : C.gray500, fontWeight: activeTab === t.key ? 700 : 500,
            fontSize: 13, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", transition: "all .15s",
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === "dashboard" && <DashboardTab show={show} />}
      {activeTab === "setup" && <SetupTab show={show} />}
      {activeTab === "machines" && <MachinesTab show={show} />}
      {activeTab === "factors" && <FactorsTab show={show} />}
      {activeTab === "batches" && <BatchesTab show={show} />}
      {activeTab === "consumption" && <ConsumptionTab show={show} />}
      {activeTab === "fabric" && <FabricTab show={show} />}
    </div>
  );
}

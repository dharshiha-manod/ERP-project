import { useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────── */
const G       = "#1a5c38";
const G2      = "#14532d";
const TEAL    = "#0891b2";
const RED     = "#dc2626";
const AMBER   = "#d97706";
const PURPLE  = "#7c3aed";

/* ─────────────────────────────────────────────
   SHARED STYLE OBJECTS
───────────────────────────────────────────── */
const s = {
  /* ── wrapper: NO minHeight/overflow/background — App.jsx owns that ── */
  wrap: { fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 13 },

  /* ── CRM sub-nav (sits at top of the CRM content area) ── */
  subNav: {
    background: G,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    gap: 0,
    borderRadius: 8,
    marginBottom: 20,
    flexWrap: "nowrap",
    overflowX: "auto",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  },
  subNavBrand: {
    color: "#fff", fontWeight: 700, fontSize: 14, marginRight: 12,
    display: "flex", alignItems: "center", gap: 6,
    padding: "10px 0", whiteSpace: "nowrap", flexShrink: 0,
    borderRight: "1px solid rgba(255,255,255,0.2)", paddingRight: 14,
  },
  navLink: (active) => ({
    color: active ? "#fff" : "rgba(255,255,255,0.75)",
    background: active ? "rgba(0,0,0,0.2)" : "transparent",
    padding: "11px 11px",
    fontSize: 12,
    cursor: "pointer",
    display: "inline-block",
    whiteSpace: "nowrap",
    textDecoration: "none",
    fontWeight: active ? 600 : 400,
    borderBottom: active ? "2px solid #86efac" : "2px solid transparent",
    transition: "all 0.15s",
    flexShrink: 0,
  }),

  /* ── page sections ── */
  pageHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 18,
  },
  pageTitle:  { fontSize: 19, fontWeight: 600, color: "#111827" },
  breadcrumb: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  /* ── cards ── */
  card: {
    background: "#fff", borderRadius: 8,
    border: "1px solid #e5e7eb", marginBottom: 16, overflow: "hidden",
  },
  cardHeader: {
    padding: "12px 16px", borderBottom: "1px solid #e5e7eb",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", background: "#fafafa",
  },
  cardTitle: { fontSize: 13.5, fontWeight: 600, color: "#111827" },
  cardBody:  { padding: "14px 16px" },

  /* ── filter bar ── */
  filterBar: {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 8, marginBottom: 14, overflow: "hidden",
  },
  filterToggle: {
    padding: "10px 16px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 8,
    background: "#fafafa", userSelect: "none",
  },
  filterBody: {
    padding: "14px 16px", display: "flex",
    gap: 12, flexWrap: "wrap", alignItems: "flex-end",
    borderTop: "1px solid #e5e7eb",
  },
  fg: { display: "flex", flexDirection: "column", gap: 4, minWidth: 130 },
  fgLabel: {
    fontSize: 11, fontWeight: 600, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
  ctrl: {
    border: "1px solid #e5e7eb", borderRadius: 5,
    padding: "6px 9px", fontSize: 12.5,
    background: "#fff", color: "#111827",
    outline: "none", width: "100%", boxSizing: "border-box",
  },

  /* ── toolbar ── */
  toolbar: {
    display: "flex", alignItems: "center",
    gap: 7, marginBottom: 12, flexWrap: "wrap",
  },
  toolbarL: { display: "flex", alignItems: "center", gap: 7, flex: 1, flexWrap: "wrap" },
  toolbarR: { display: "flex", alignItems: "center", gap: 6 },
  showEntr: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#6b7280" },
  showSel: {
    border: "1px solid #e5e7eb", borderRadius: 4,
    padding: "3px 6px", fontSize: 12, background: "#fff",
  },

  expBtn: (color = "#6b7280") => ({
    background: "#fff", color, border: "1px solid #e5e7eb",
    borderRadius: 5, padding: "5px 9px", fontSize: 12,
    cursor: "pointer", display: "inline-flex",
    alignItems: "center", gap: 4, fontWeight: 500,
  }),
  searchWrap: { position: "relative", display: "inline-flex", alignItems: "center" },
  searchIco: {
    position: "absolute", left: 8, fontSize: 13,
    color: "#9ca3af", pointerEvents: "none",
  },
  searchInput: {
    border: "1px solid #e5e7eb", borderRadius: 5,
    padding: "5px 10px 5px 26px", fontSize: 12.5,
    width: 185, outline: "none",
  },

  /* ── table ── */
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 },
  th: {
    padding: "8px 10px", textAlign: "left", fontWeight: 600,
    color: "#374151", borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap", fontSize: 11.5,
    textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9fafb",
  },
  td: {
    padding: "8px 10px", color: "#111827",
    borderBottom: "1px solid #f3f4f6", verticalAlign: "middle",
  },
  noData: { textAlign: "center", padding: 28, color: "#9ca3af", fontStyle: "italic" },
  pagInfo: {
    fontSize: 12, color: "#6b7280",
    paddingTop: 10, borderTop: "1px solid #f3f4f6", marginTop: 8,
  },

  /* ── badge ── */
  badge: (v) => {
    const m = {
      green:  { background: "#dcfce7", color: "#15803d" },
      amber:  { background: "#fef3c7", color: "#b45309" },
      red:    { background: "#fee2e2", color: "#b91c1c" },
      blue:   { background: "#dbeafe", color: "#1d4ed8" },
      gray:   { background: "#f3f4f6", color: "#374151" },
      teal:   { background: "#ccfbf1", color: "#0f766e" },
      purple: { background: "#ede9fe", color: "#6d28d9" },
    };
    return {
      ...(m[v] || m.gray),
      display: "inline-flex", alignItems: "center",
      padding: "2px 9px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, lineHeight: 1.5,
    };
  },

  /* ── buttons ── */
  btn: (variant = "green", size = "md") => {
    const colors = {
      green:   { background: G,       color: "#fff", border: `1px solid ${G}` },
      teal:    { background: TEAL,    color: "#fff", border: `1px solid ${TEAL}` },
      gray:    { background: "#6b7280", color: "#fff", border: "1px solid #6b7280" },
      red:     { background: RED,     color: "#fff", border: `1px solid ${RED}` },
      purple:  { background: PURPLE,  color: "#fff", border: `1px solid ${PURPLE}` },
      outline: { background: "#fff",  color: G,      border: `1px solid ${G}` },
    };
    return {
      ...(colors[variant] || colors.green),
      borderRadius: 5,
      padding: size === "sm" ? "4px 10px" : "6px 14px",
      fontSize: size === "sm" ? 11.5 : 12.5,
      cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 5,
      fontWeight: 500,
    };
  },

  /* ── stat cards ── */
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
    gap: 12, marginBottom: 16,
  },
  statCard: {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 8, padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 12,
  },
  statIcon: (color) => ({
    width: 44, height: 44, borderRadius: 8, background: color,
    display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0, fontSize: 20, color: "#fff",
  }),
  statLabel: {
    fontSize: 10.5, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3,
  },
  statValue: { fontSize: 22, fontWeight: 700, color: "#111827" },

  /* ── modal ── */
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.45)", zIndex: 9999,
    display: "flex", alignItems: "flex-start",
    justifyContent: "center", paddingTop: 60,
  },
  modalBox: {
    background: "#fff", borderRadius: 10, padding: 24,
    width: "90%", maxWidth: 640,
    maxHeight: "82vh", overflowY: "auto",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
  modalHdr: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 18,
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#111827" },
  formGrid: (cols = 2) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "12px 14px",
  }),
  fg2: { display: "flex", flexDirection: "column", gap: 4 },
  fgLabel2: {
    fontSize: 11, fontWeight: 600, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
  input: {
    border: "1px solid #e5e7eb", borderRadius: 5,
    padding: "6px 9px", fontSize: 13,
    background: "#fff", color: "#111827",
    outline: "none", width: "100%", boxSizing: "border-box",
  },
  textarea: {
    border: "1px solid #e5e7eb", borderRadius: 5,
    padding: "7px 9px", fontSize: 13,
    background: "#fff", color: "#111827",
    outline: "none", width: "100%",
    resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
  },
  select: {
    border: "1px solid #e5e7eb", borderRadius: 5,
    padding: "6px 9px", fontSize: 13,
    background: "#fff", color: "#111827",
    outline: "none", width: "100%", boxSizing: "border-box",
  },
  mFooter: {
    display: "flex", justifyContent: "flex-end",
    gap: 8, marginTop: 18,
    paddingTop: 14, borderTop: "1px solid #e5e7eb",
  },

  /* ── misc ── */
  tabs: { display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 14 },
  tab: (active) => ({
    background: "none", border: "none", padding: "9px 16px",
    cursor: "pointer", fontSize: 13,
    color: active ? G : "#6b7280",
    fontWeight: active ? 600 : 400,
    borderBottom: active ? `2px solid ${G}` : "2px solid transparent",
    marginBottom: -2, transition: "all 0.15s",
  }),
  avatar: {
    width: 28, height: 28, borderRadius: "50%",
    background: G, color: "#fff",
    display: "inline-flex", alignItems: "center",
    justifyContent: "center", fontSize: 10, fontWeight: 600,
  },
  actionRow: { display: "flex", gap: 4 },
};

/* ─────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────── */
function Badge({ v, children }) {
  return <span style={s.badge(v)}>{children}</span>;
}

function StatusBadge({ status }) {
  const map = { Scheduled: "amber", Open: "blue", Completed: "green", Cancelled: "red", Sent: "green", Draft: "gray" };
  return <Badge v={map[status] || "gray"}>{status}</Badge>;
}

function NoData({ cols }) {
  return <tr><td colSpan={cols} style={s.noData}>No data available</td></tr>;
}

function ShowEntries({ value = 25, onChange }) {
  return (
    <span style={s.showEntr}>
      Show{" "}
      <select style={s.showSel} value={value} onChange={(e) => onChange && onChange(Number(e.target.value))}>
        {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
      </select>{" "}
      entries
    </span>
  );
}

function ExportButtons({ onCSV }) {
  return (
    <>
      <button style={s.expBtn("#059669")} onClick={onCSV || (() => alert("Pass onCSV prop."))}>📄 CSV</button>
      <button style={s.expBtn("#15803d")} onClick={() => alert("Excel: integrate SheetJS in your project.")}>📊 Excel</button>
      <button style={s.expBtn("#dc2626")} onClick={() => alert("PDF: use jsPDF or your backend PDF route.")}>📑 PDF</button>
      <button style={s.expBtn("#7c3aed")} onClick={() => window.print()}>🖨️ Print</button>
    </>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <div style={s.searchWrap}>
      <span style={s.searchIco}>🔍</span>
      <input
        style={s.searchInput}
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FilterBar({ open, onToggle, children }) {
  return (
    <div style={s.filterBar}>
      <div
        style={s.filterToggle}
        onClick={onToggle}
      >
        <span style={{ color: G, fontSize: 14 }}>⚙</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827", flex: 1 }}>Filters</span>
        <span style={{ color: "#6b7280", transition: "transform .2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </div>
      {open && <div style={s.filterBody}>{children}</div>}
    </div>
  );
}

function FG({ label, children }) {
  return (
    <div style={s.fg}>
      <label style={s.fgLabel}>{label}</label>
      {children}
    </div>
  );
}

function FilterActions({ onClear }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginLeft: "auto" }}>
      <button style={s.btn("gray", "sm")} onClick={onClear}>✕ Clear</button>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modalBox}>
        <div style={s.modalHdr}>
          <h3 style={s.modalTitle}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FF({ label, required, fullWidth, children }) {
  return (
    <div style={{ ...s.fg2, ...(fullWidth ? { gridColumn: "1/-1" } : {}) }}>
      <label style={s.fgLabel2}>{label}{required && <span style={{ color: RED }}> *</span>}</label>
      {children}
    </div>
  );
}

function MFooter({ onClose, onSave, saveLabel = "Save" }) {
  return (
    <div style={s.mFooter}>
      <button style={s.btn("gray")} onClick={onClose}>Cancel</button>
      <button style={s.btn("green")} onClick={onSave}>✓ {saveLabel}</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CSV EXPORT HELPER
───────────────────────────────────────────── */
function exportCSV(rows, filename = "export.csv") {
  if (!rows || rows.length === 0) { alert("Nothing to export."); return; }
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/* ─────────────────────────────────────────────
   SEED DATA
───────────────────────────────────────────── */
const SEED_LEADS = [
  { id: "CO0009", name: "Prime Grow Traders, Sampath Kumar",          mobile: "6380204252",      email: "",                 source: "Referral",   lastFU: "06/02/2026", stage: "New",       assigned: "Er Sarath Raj"  },
  { id: "CO0010", name: "Westry INC, Santhosh Kumar",                 mobile: "9626733733",      email: "",                 source: "Exhibition", lastFU: "06/02/2026", stage: "Contacted", assigned: "Ms Dharshiha C" },
  { id: "CO0011", name: "Sarath Chandran Ramakrishnan",               mobile: "cant connect",    email: "",                 source: "Cold Call",  lastFU: "06/02/2026", stage: "New",       assigned: "Er Sarath Raj"  },
  { id: "CO0012", name: "EXHICONNECT",                                mobile: "9904044745",      email: "",                 source: "Exhibition", lastFU: "06/02/2026", stage: "Qualified", assigned: "Mr Leejin"      },
  { id: "CO0013", name: "Sanket Electrotech, Arvind Patel",           mobile: "9687689988",      email: "",                 source: "Website",    lastFU: "06/02/2026", stage: "Proposal",  assigned: "Er Sarath Raj"  },
  { id: "CO0014", name: "Kaveri Polymers, Rajan M",                   mobile: "9944123456",      email: "kaveri@email.com", source: "Referral",   lastFU: "06/10/2026", stage: "Contacted", assigned: "Ms Dharshiha C" },
];

const SEED_FU = [
  { contact: "Dharshini Rubber Products, Karthik", start: "06/07/2026 09:54", end: "06/07/2026 16:55", status: "Scheduled", type: "Call",    cat: "call",  assigned: "SA", title: "contact on 1-6",  addedBy: "Er Sarath Raj"  },
  { contact: "SRI MADURA RUBBER, Manikandan",      start: "06/04/2026 10:00", end: "06/04/2026 13:09", status: "Open",      type: "Call",    cat: "call",  assigned: "SA", title: "didnt pickup",    addedBy: "Er Sarath Raj"  },
  { contact: "Prime Grow Traders",                 start: "06/05/2026 11:00", end: "06/05/2026 12:00", status: "Completed", type: "Meeting", cat: "email", assigned: "DC", title: "demo call",       addedBy: "Ms Dharshiha C" },
];

const SEED_CAMPAIGNS = [
  { name: "shalijah",          type: "Email", status: "Sent", by: "Ms Shalijah Stalin Rajakumar", date: "05/26/2026" },
  { name: "Digital Marketing", type: "Email", status: "Sent", by: "Ms Shalijah Stalin Rajakumar", date: "05/26/2026" },
];

/* ─────────────────────────────────────────────
   CRM SUB-NAV
   NOTE: No page background wrapper here.
   The outer <main> in App.jsx already provides
   the grey background, margin, and padding.
───────────────────────────────────────────── */
function CRMNav() {
  const location = useLocation();
  const links = [
    { label: "CRM",               path: "/crm" },
    { label: "Leads",             path: "/crm/leads" },
    { label: "Follow ups",        path: "/crm/follow-ups" },
    { label: "Campaigns",         path: "/crm/campaigns" },
    { label: "Contacts Login",    path: "/crm/contacts-login" },
    { label: "Reports",           path: "/crm/reports" },
    { label: "Proposal template", path: "/crm/proposal-template" },
    { label: "Proposals",         path: "/crm/proposals" },
    { label: "Sources",           path: "/crm/sources" },
    { label: "Life Stage",        path: "/crm/life-stage" },
    { label: "Followup Category", path: "/crm/followup-category" },
    { label: "Settings",          path: "/crm/settings" },
  ];
  return (
    <div style={s.subNav}>
      <span style={s.subNavBrand}>🤝 CRM</span>
      {links.map((l) => {
        const active =
          location.pathname === l.path ||
          (l.path !== "/crm" && location.pathname.startsWith(l.path));
        return (
          <Link key={l.path} to={l.path} style={s.navLink(active)}>
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */
function CRMDashboard() {
  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>CRM Dashboard</div>
          <div style={s.breadcrumb}>Overview of your CRM activity</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={s.statGrid}>
        {[
          { icon: "📅", color: TEAL,   label: "Today's Follow Ups",  value: 0  },
          { icon: "👤", color: G,      label: "My Leads",             value: 22 },
          { icon: "🔄", color: AMBER,  label: "Lead Conversions",     value: 0  },
          { icon: "👥", color: PURPLE, label: "Customers",            value: 1  },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statIcon(stat.color)}>{stat.icon}</div>
            <div>
              <div style={s.statLabel}>{stat.label}</div>
              <div style={s.statValue}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={s.card}>
          <div style={s.cardHeader}><span style={s.cardTitle}>My Follow ups</span></div>
          <div style={{ ...s.cardBody, padding: 0 }}>
            <table style={s.table}>
              <tbody>
                {[["Scheduled","amber"],["Open","blue"],["Cancelled","red"],["Completed","green"]].map(([k, v]) => (
                  <tr key={k}>
                    <td style={s.td}>{k}</td>
                    <td style={{ ...s.td, textAlign: "right" }}><Badge v={v}>0</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={s.card}>
          <div style={s.cardHeader}><span style={s.cardTitle}>Leads to Customer Conversion</span></div>
          <div style={s.cardBody}>
            <table style={s.table}>
              <thead><tr><th style={s.th}>Converted By</th><th style={s.th}>Total</th></tr></thead>
              <tbody><NoData cols={2} /></tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Follow ups by user */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Follow ups by user</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="date" style={{ ...s.ctrl, width: 140 }} defaultValue="2026-01-01" />
            <span style={{ fontSize: 12, color: "#6b7280", lineHeight: "2.2" }}>to</span>
            <input type="date" style={{ ...s.ctrl, width: 140 }} defaultValue="2026-12-31" />
          </div>
        </div>
        <div style={s.cardBody}>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>{["User","Scheduled","Open","Cancelled","Completed","None","Total"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[["Er Sarath Raj",9,0,0,0,44,53],["Mr Leejin",1,0,0,0,0,1]].map(([u,...vals]) => (
                  <tr key={u}>
                    <td style={s.td}>{u}</td>
                    {vals.map((v,i) => (
                      <td key={i} style={s.td}>
                        {i === vals.length - 1
                          ? <Badge v="teal">{v}</Badge>
                          : <>{v}<br /><a href="#" style={{ color: TEAL, fontSize: 11 }}>View</a></>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom three cols */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 14 }}>
        {[
          { title: "Sources",     cols: ["Source","Total","Conv."],  rows: [] },
          { title: "Life Stages", cols: ["Stage","Total"],           rows: [] },
        ].map(({ title, cols, rows }) => (
          <div key={title} style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>{title}</span></div>
            <div style={s.cardBody}>
              <table style={s.table}>
                <thead><tr>{cols.map((c) => <th key={c} style={s.th}>{c}</th>)}</tr></thead>
                <tbody><NoData cols={cols.length} /></tbody>
              </table>
            </div>
          </div>
        ))}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>🎂 Birthdays</span>
            <button style={s.btn("teal","sm")}>✉ Send Wishes</button>
          </div>
          <div style={s.cardBody}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>Today</div>
            <table style={s.table}><thead><tr><th style={s.th}>#</th><th style={s.th}>Name</th></tr></thead><tbody><NoData cols={2} /></tbody></table>
            <div style={{ fontWeight: 600, fontSize: 12, margin: "12px 0 6px" }}>Upcoming</div>
            <table style={s.table}><thead><tr><th style={s.th}>#</th><th style={s.th}>Name</th><th style={s.th}>Birthday</th></tr></thead><tbody><NoData cols={3} /></tbody></table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LEADS
───────────────────────────────────────────── */
function LeadsPage() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [view, setView]             = useState("list");
  const [search, setSearch]         = useState("");
  const [entries, setEntries]       = useState(25);
  const [filters, setFilters]       = useState({ source: "", stage: "", assigned: "" });
  const [form, setForm]             = useState({ mobile: "", email: "", source: "", stage: "New", assigned: "Ms Dharshiha C" });

  const filtered = SEED_LEADS.filter((l) => {
    const q = search.toLowerCase();
    const ms = !q || [l.name, l.mobile, l.email, l.id].some((v) => v.toLowerCase().includes(q));
    return ms
      && (!filters.source   || l.source   === filters.source)
      && (!filters.stage    || l.stage    === filters.stage)
      && (!filters.assigned || l.assigned === filters.assigned);
  }).slice(0, entries);

  const stageColor = { New: "gray", Contacted: "teal", Qualified: "blue", Proposal: "green" };

  const handleCSV = () => exportCSV(
    [["ID","Name","Mobile","Email","Source","Last FU","Stage","Assigned"],
     ...filtered.map((l) => [l.id, l.name, l.mobile, l.email, l.source, l.lastFU, l.stage, l.assigned])],
    "leads.csv"
  );

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Leads</div>
          <div style={s.breadcrumb}>CRM › Leads</div>
        </div>
        <button style={s.btn("green")} onClick={() => setShowAdd(true)}>+ Add Lead</button>
      </div>

      <FilterBar open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)}>
        <FG label="Source">
          <select style={s.ctrl} value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
            <option value="">All Sources</option>
            {["Website","Referral","Cold Call","Exhibition"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Life Stage">
          <select style={s.ctrl} value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
            <option value="">All Stages</option>
            {["New","Contacted","Qualified","Proposal"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Assigned to">
          <select style={s.ctrl} value={filters.assigned} onChange={(e) => setFilters({ ...filters, assigned: e.target.value })}>
            <option value="">All Users</option>
            {["Er Sarath Raj","Ms Dharshiha C","Mr Leejin"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Date From"><input type="date" style={s.ctrl} /></FG>
        <FG label="Date To"><input type="date" style={s.ctrl} /></FG>
        <FilterActions onClear={() => setFilters({ source: "", stage: "", assigned: "" })} />
      </FilterBar>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>All Leads</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={s.btn(view === "list"   ? "green" : "outline", "sm")} onClick={() => setView("list")}>☰ List</button>
            <button style={s.btn(view === "kanban" ? "green" : "gray",    "sm")} onClick={() => setView("kanban")}>⬛ Kanban</button>
          </div>
        </div>
        <div style={s.cardBody}>
          <div style={s.toolbar}>
            <div style={s.toolbarL}><ShowEntries value={entries} onChange={setEntries} /><ExportButtons onCSV={handleCSV} /></div>
            <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
          </div>

          {view === "list" ? (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>{["Action","Contact ID","Name","Mobile","Email","Source","Last Follow Up","Upcoming","Life Stage","Assigned to"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? <NoData cols={10} /> : filtered.map((l) => (
                    <tr key={l.id}>
                      <td style={s.td}>
                        <div style={s.actionRow}>
                          <button style={s.btn("teal",   "sm")} title="Edit">✏️</button>
                          <button style={s.btn("purple", "sm")} title="View">👁</button>
                          <button style={s.btn("red",    "sm")} title="Delete">🗑</button>
                        </div>
                      </td>
                      <td style={{ ...s.td, color: TEAL, fontWeight: 500 }}>{l.id}</td>
                      <td style={{ ...s.td, maxWidth: 160 }}>{l.name}</td>
                      <td style={s.td}>{l.mobile}</td>
                      <td style={s.td}>{l.email || "—"}</td>
                      <td style={s.td}>{l.source ? <Badge v="gray">{l.source}</Badge> : "—"}</td>
                      <td style={s.td}>{l.lastFU}</td>
                      <td style={s.td}><button style={s.btn("green","sm")}>+ Follow Up</button></td>
                      <td style={s.td}><Badge v={stageColor[l.stage] || "gray"}>{l.stage}</Badge></td>
                      <td style={s.td}>{l.assigned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {["New","Contacted","Qualified","Proposal"].map((stage) => {
                const bg  = { New:"#e5e7eb", Contacted:"#ccfbf1", Qualified:"#ede9fe", Proposal:"#dcfce7" };
                const col = { New:"#374151", Contacted:"#0f766e",  Qualified:"#6d28d9",  Proposal:"#15803d"  };
                return (
                  <div key={stage} style={{ background: "#f9fafb", borderRadius: 8, padding: 10, border: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 600, fontSize: 11, color: col[stage], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10, padding: "3px 8px", background: bg[stage], borderRadius: 4 }}>{stage}</div>
                    {filtered.filter((l) => l.stage === stage).length === 0
                      ? <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: 10 }}>Empty</div>
                      : filtered.filter((l) => l.stage === stage).map((l) => (
                        <div key={l.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: 10, marginBottom: 8, fontSize: 12 }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>{l.name}</div>
                          <div style={{ color: "#6b7280" }}>{l.mobile}</div>
                          <div style={{ marginTop: 6 }}><Badge v="gray">{l.id}</Badge></div>
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          )}
          <div style={s.pagInfo}>Showing {filtered.length} of {SEED_LEADS.length} entries</div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add New Lead" onClose={() => setShowAdd(false)}>
          <div style={s.formGrid(2)}>
            <FF label="Contact Type" fullWidth>
              <div style={{ display: "flex", gap: 16, marginBottom: 6 }}>
                <label style={{ fontSize: 13 }}><input type="radio" name="ctype" defaultChecked /> Individual</label>
                <label style={{ fontSize: 13 }}><input type="radio" name="ctype" /> Business</label>
              </div>
              <select style={s.select}><option>Lead</option><option>Customer</option></select>
            </FF>
            <FF label="Contact ID"><input style={s.input} placeholder="Auto-generated if empty" /></FF>
            <FF label="Mobile" required><input style={s.input} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></FF>
            <FF label="Alternate Number"><input style={s.input} /></FF>
            <FF label="Email"><input style={s.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FF>
            <FF label="Landline"><input style={s.input} /></FF>
            <FF label="Source">
              <select style={s.select} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option value="">Select Source</option>
                {["Website","Referral","Cold Call","Exhibition"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </FF>
            <FF label="Life Stage">
              <select style={s.select} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {["New","Contacted","Qualified","Proposal"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </FF>
            <FF label="Assigned to" required fullWidth>
              <select style={s.select} value={form.assigned} onChange={(e) => setForm({ ...form, assigned: e.target.value })}>
                {["Ms Dharshiha C","Er Sarath Raj","Mr Leejin"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </FF>
          </div>
          <MFooter onClose={() => setShowAdd(false)} onSave={() => { alert("Lead saved! Connect to Supabase to persist."); setShowAdd(false); }} saveLabel="Save Lead" />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOLLOW UPS
───────────────────────────────────────────── */
function FollowUpsPage() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [tab, setTab]               = useState("fu");
  const [search, setSearch]         = useState("");
  const [filters, setFilters]       = useState({ status: "", type: "", cat: "" });
  const [form, setForm]             = useState({ title: "", status: "Scheduled", type: "Call", cat: "call", assigned: "Ms Dharshiha C" });

  const filtered = SEED_FU.filter((f) => {
    const q = search.toLowerCase();
    const ms = !q || [f.contact, f.title, f.addedBy].some((v) => v.toLowerCase().includes(q));
    return ms
      && (!filters.status || f.status === filters.status)
      && (!filters.type   || f.type   === filters.type)
      && (!filters.cat    || f.cat    === filters.cat);
  });

  const handleCSV = () => exportCSV(
    [["Contact","Start","End","Status","Type","Category","Assigned","Title","Added By"],
     ...filtered.map((f) => [f.contact,f.start,f.end,f.status,f.type,f.cat,f.assigned,f.title,f.addedBy])],
    "followups.csv"
  );

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Follow Ups</div>
          <div style={s.breadcrumb}>CRM › Follow ups</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btn("green")} onClick={() => setShowAdd(true)}>+ Add Follow Up</button>
          <button style={s.btn("teal")}  onClick={() => setShowAdd(true)}>+ Advanced</button>
        </div>
      </div>

      <FilterBar open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)}>
        <FG label="Status">
          <select style={s.ctrl} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            {["Scheduled","Open","Completed","Cancelled"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Type">
          <select style={s.ctrl} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            {["Call","Email","Meeting","WhatsApp"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Category">
          <select style={s.ctrl} value={filters.cat} onChange={(e) => setFilters({ ...filters, cat: e.target.value })}>
            <option value="">All</option>
            {["call","email"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Date From"><input type="date" style={s.ctrl} /></FG>
        <FG label="Date To"><input type="date" style={s.ctrl} /></FG>
        <FilterActions onClear={() => setFilters({ status: "", type: "", cat: "" })} />
      </FilterBar>

      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>All Follow Ups</span></div>
        <div style={s.cardBody}>
          <div style={s.tabs}>
            <button style={s.tab(tab === "fu")}        onClick={() => setTab("fu")}>Follow ups</button>
            <button style={s.tab(tab === "recurring")} onClick={() => setTab("recurring")}>Recurring Follow up</button>
          </div>

          {tab === "fu" ? (
            <>
              <div style={s.toolbar}>
                <div style={s.toolbarL}><ShowEntries /><ExportButtons onCSV={handleCSV} /></div>
                <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>{["Action","Contact","Start","End","Status","Type","Category","Assigned","Title","Added By"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? <NoData cols={10} /> : filtered.map((f, i) => (
                      <tr key={i}>
                        <td style={s.td}>
                          <div style={s.actionRow}>
                            <button style={s.btn("teal","sm")}>✏️</button>
                            <button style={s.btn("red", "sm")}>🗑</button>
                          </div>
                        </td>
                        <td style={{ ...s.td, maxWidth: 150 }}>{f.contact}</td>
                        <td style={s.td}>{f.start}</td>
                        <td style={s.td}>{f.end}</td>
                        <td style={s.td}><StatusBadge status={f.status} /></td>
                        <td style={s.td}>{f.type}</td>
                        <td style={s.td}><Badge v="gray">{f.cat}</Badge></td>
                        <td style={s.td}><div style={s.avatar}>{f.assigned}</div></td>
                        <td style={s.td}>{f.title}</td>
                        <td style={s.td}>{f.addedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={s.pagInfo}>Showing {filtered.length} of {SEED_FU.length} entries</div>
            </>
          ) : (
            <div style={s.noData}>No recurring follow ups set up</div>
          )}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Follow Up" onClose={() => setShowAdd(false)}>
          <div style={s.formGrid(2)}>
            <FF label="Title" required fullWidth><input style={s.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FF>
            <FF label="Contact / Lead" required fullWidth>
              <select style={s.select}><option value="">Select Contact</option>{SEED_LEADS.map((l) => <option key={l.id}>{l.name}</option>)}</select>
            </FF>
            <FF label="Status">
              <select style={s.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Scheduled","Open","Completed","Cancelled"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </FF>
            <FF label="Follow Up Type" required>
              <select style={s.select} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Call","Email","Meeting","WhatsApp"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </FF>
            <FF label="Start Datetime" required><input type="datetime-local" style={s.input} /></FF>
            <FF label="End Datetime"   required><input type="datetime-local" style={s.input} /></FF>
            <FF label="Category" required>
              <select style={s.select} value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
                {["call","email"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </FF>
            <FF label="Assigned to" required>
              <select style={s.select} value={form.assigned} onChange={(e) => setForm({ ...form, assigned: e.target.value })}>
                {["Ms Dharshiha C","Er Sarath Raj","Mr Leejin"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </FF>
            <FF label="Description" fullWidth><textarea style={{ ...s.textarea, height: 80 }} /></FF>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 13 }}><input type="checkbox" style={{ marginRight: 6 }} />Send notification to contact</label>
            </div>
          </div>
          <MFooter onClose={() => setShowAdd(false)} onSave={() => { alert("Follow up saved!"); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CAMPAIGNS
───────────────────────────────────────────── */
function CampaignsPage() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [search, setSearch]         = useState("");
  const [filters, setFilters]       = useState({ type: "", status: "", by: "" });
  const [campaigns, setCampaigns]   = useState(SEED_CAMPAIGNS);

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase();
    const ms = !q || [c.name, c.by, c.type].some((v) => v.toLowerCase().includes(q));
    return ms
      && (!filters.type   || c.type   === filters.type)
      && (!filters.status || c.status === filters.status)
      && (!filters.by     || c.by     === filters.by);
  });

  const handleCSV = () => exportCSV(
    [["Name","Type","Status","Created By","Date"],
     ...filtered.map((c) => [c.name, c.type, c.status, c.by, c.date])],
    "campaigns.csv"
  );

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Campaigns</div>
          <div style={s.breadcrumb}>CRM › Campaigns</div>
        </div>
        <button style={s.btn("green")} onClick={() => navigate("/crm/campaigns/create")}>+ Add</button>
      </div>

      <FilterBar open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)}>
        <FG label="Campaign Type">
          <select style={s.ctrl} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            {["Email","SMS","WhatsApp"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Status">
          <select style={s.ctrl} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            {["Sent","Draft","Scheduled"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FG>
        <FG label="Created By">
          <select style={s.ctrl} value={filters.by} onChange={(e) => setFilters({ ...filters, by: e.target.value })}>
            <option value="">All Users</option>
            <option>Ms Shalijah Stalin Rajakumar</option>
          </select>
        </FG>
        <FilterActions onClear={() => setFilters({ type: "", status: "", by: "" })} />
      </FilterBar>

      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>All Campaigns</span></div>
        <div style={s.cardBody}>
          <div style={s.toolbar}>
            <div style={s.toolbarL}><ShowEntries /><ExportButtons onCSV={handleCSV} /></div>
            <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>{["Action","Campaign Name","Type","Status","Created By","Created At"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <NoData cols={6} /> : filtered.map((c) => (
                  <tr key={c.name}>
                    <td style={s.td}>
                      <div style={s.actionRow}>
                        <button style={s.btn("teal","sm")}>👁 View</button>
                        <button style={s.btn("red", "sm")} onClick={() => { if(window.confirm(`Delete "${c.name}"?`)) setCampaigns(campaigns.filter((x) => x.name !== c.name)); }}>🗑</button>
                      </div>
                    </td>
                    <td style={{ ...s.td, fontWeight: 500 }}>{c.name}</td>
                    <td style={s.td}>{c.type}</td>
                    <td style={s.td}><StatusBadge status={c.status} /></td>
                    <td style={s.td}>{c.by}</td>
                    <td style={s.td}>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={s.pagInfo}>Showing {filtered.length} of {campaigns.length} entries</div>
        </div>
      </div>
    </div>
  );
}

function CampaignCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", type: "Email", to: "", subject: "", body: "" });

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Create Campaign</div>
          <div style={s.breadcrumb}>CRM › Campaigns › Create</div>
        </div>
        <button style={s.btn("gray","sm")} onClick={() => navigate("/crm/campaigns")}>← Back</button>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>Campaign Details</span></div>
        <div style={s.cardBody}>
          <div style={s.formGrid(2)}>
            <FF label="Campaign Name" required><input style={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FF>
            <FF label="Campaign Type" required>
              <select style={s.select} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Email</option><option>SMS</option><option>WhatsApp</option>
              </select>
            </FF>
            <FF label="To" required fullWidth>
              <select style={s.select}><option value="">Select Recipients</option><option>All Leads</option><option>All Customers</option></select>
            </FF>
            <FF label="Subject" required fullWidth><input style={s.input} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></FF>
            <FF label="Email Body" required fullWidth><textarea style={{ ...s.textarea, height: 180 }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></FF>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Available tags: {"{contact_name}"}, {"{campaign_name}"}, {"{business_name}"}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button style={s.btn("gray")} onClick={() => navigate("/crm/campaigns")}>Cancel</button>
            <button style={s.btn("teal")} onClick={() => { if(!form.name.trim()){alert("Name required");return;} alert("Draft saved!"); navigate("/crm/campaigns"); }}>📝 Save Draft</button>
            <button style={s.btn("green")} onClick={() => { if(!form.name.trim()||!form.subject.trim()){alert("Name & Subject required");return;} alert("Campaign sent!"); navigate("/crm/campaigns"); }}>✉ Send Campaign</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTACTS LOGIN
───────────────────────────────────────────── */
function ContactsLoginPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [logins, setLogins]   = useState([]);
  const [search, setSearch]   = useState("");
  const [form, setForm]       = useState({ prefix: "", firstName: "", lastName: "", contact: "", email: "", mobile: "", dept: "", designation: "", active: true, allowLogin: false });

  const filtered = logins.filter((l) => {
    const q = search.toLowerCase();
    return !q || [l.firstName, l.lastName, l.email, l.dept].some((v) => (v||"").toLowerCase().includes(q));
  });

  const handleSave = () => {
    if (!form.firstName.trim() || !form.email.trim()) { alert("First Name and Email are required."); return; }
    setLogins([...logins, { ...form }]);
    setForm({ prefix: "", firstName: "", lastName: "", contact: "", email: "", mobile: "", dept: "", designation: "", active: true, allowLogin: false });
    setShowAdd(false);
  };

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Contacts Login</div>
          <div style={s.breadcrumb}>CRM › Contacts Login</div>
        </div>
        <button style={s.btn("green")} onClick={() => setShowAdd(true)}>+ Add Login</button>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>All Contact Logins</span></div>
        <div style={s.cardBody}>
          <div style={s.toolbar}>
            <div style={s.toolbarL}><ShowEntries /><ExportButtons /></div>
            <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
          </div>
          <table style={s.table}>
            <thead><tr>{["Action","Contact","Username","Name","Email","Department","Active"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length === 0 ? <NoData cols={7} /> : filtered.map((l, i) => (
                <tr key={i}>
                  <td style={s.td}><div style={s.actionRow}><button style={s.btn("teal","sm")}>✏️</button><button style={s.btn("red","sm")}>🗑</button></div></td>
                  <td style={s.td}>{l.contact||"—"}</td>
                  <td style={s.td}>{l.email}</td>
                  <td style={s.td}>{l.prefix} {l.firstName} {l.lastName}</td>
                  <td style={s.td}>{l.email}</td>
                  <td style={s.td}>{l.dept||"—"}</td>
                  <td style={s.td}><Badge v={l.active?"green":"gray"}>{l.active?"Active":"Inactive"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={s.pagInfo}>Showing {filtered.length} of {logins.length} entries</div>
        </div>
      </div>
      {showAdd && (
        <Modal title="Add Contact Login" onClose={() => setShowAdd(false)}>
          <div style={s.formGrid(3)}>
            <FF label="Prefix"><input style={s.input} placeholder="Mr / Ms" value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} /></FF>
            <FF label="First Name" required><input style={s.input} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></FF>
            <FF label="Last Name"><input style={s.input} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></FF>
            <FF label="Contact" required>
              <select style={s.select} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}>
                <option value="">Select</option>{SEED_LEADS.map((l) => <option key={l.id}>{l.name}</option>)}
              </select>
            </FF>
            <FF label="Email" required><input style={s.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FF>
            <FF label="Mobile"><input style={s.input} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></FF>
            <FF label="Department"><input style={s.input} value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} /></FF>
            <FF label="Designation"><input style={s.input} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></FF>
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 20 }}>
              <label style={{ fontSize: 13 }}><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ marginRight: 6 }} />Is Active?</label>
              <label style={{ fontSize: 13 }}><input type="checkbox" checked={form.allowLogin} onChange={(e) => setForm({ ...form, allowLogin: e.target.checked })} style={{ marginRight: 6 }} />Allow Login?</label>
            </div>
          </div>
          <MFooter onClose={() => setShowAdd(false)} onSave={handleSave} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   REPORTS
───────────────────────────────────────────── */
function CRMReportsPage() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [filters, setFilters]       = useState({ from: "2026-01-01", to: "2026-12-31", user: "" });

  const userRows     = [["Er Sarath Raj",9,0,0,0,44,53],["Mr Leejin",1,0,0,0,0,1]];
  const contactRows  = [["Mr Sanjeev Sharma",1,0,0,0,0,1],["NPE MAGNETICS INDIA PVT LTD",1,0,0,0,1,2],["SATHISH KUMAR G",1,0,0,0,0,1]];
  const filteredUsers = userRows.filter(([u]) => !filters.user || u === filters.user);

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Reports</div>
          <div style={s.breadcrumb}>CRM › Reports</div>
        </div>
      </div>
      <FilterBar open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)}>
        <FG label="Date From"><input type="date" style={s.ctrl} value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></FG>
        <FG label="Date To"><input type="date" style={s.ctrl} value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></FG>
        <FG label="User">
          <select style={s.ctrl} value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })}>
            <option value="">All Users</option>
            <option>Er Sarath Raj</option><option>Mr Leejin</option>
          </select>
        </FG>
        <FilterActions onClear={() => setFilters({ from: "2026-01-01", to: "2026-12-31", user: "" })} />
      </FilterBar>
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Follow ups by user</span>
          <button style={s.expBtn("#059669")} onClick={() => exportCSV([["User","Scheduled","Open","Cancelled","Completed","Others","Total"],...filteredUsers],"report_users.csv")}>📄 CSV</button>
        </div>
        <div style={s.cardBody}>
          <table style={s.table}>
            <thead><tr>{["User","Scheduled","Open","Cancelled","Completed","Others","Total"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filteredUsers.length === 0 ? <NoData cols={7} /> : filteredUsers.map(([u,...vals]) => (
                <tr key={u}>
                  <td style={s.td}>{u}</td>
                  {vals.map((v, i) => (
                    <td key={i} style={s.td}>
                      {i === vals.length - 1 ? <Badge v="teal">{v}</Badge> : <>{v}<br /><a href="#" style={{ color: TEAL, fontSize: 11 }}>View</a></>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>Follow ups by contact</span></div>
        <div style={s.cardBody}>
          <table style={s.table}>
            <thead><tr>{["Contact","Scheduled","Open","Cancelled","Completed","Others","Total"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {contactRows.map(([c,...vals]) => (
                <tr key={c}>
                  <td style={s.td}>{c}</td>
                  {vals.map((v, i) => <td key={i} style={s.td}>{i === vals.length - 1 ? <Badge v="gray">{v}</Badge> : v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROPOSAL TEMPLATE
───────────────────────────────────────────── */
function ProposalTemplatePage() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ cc: "", bcc: "", subject: "", body: "" });
  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Proposal Template</div>
          <div style={s.breadcrumb}>CRM › Proposal template</div>
        </div>
        <button style={s.btn("green")} onClick={() => setShowAdd(true)}>+ Add Template</button>
      </div>
      <div style={s.card}>
        <div style={s.cardBody}>
          <div style={{ background: TEAL, color: "#fff", borderRadius: 6, padding: "14px 18px", fontWeight: 600 }}>
            No proposal templates found! Click "+ Add Template" to create one.
          </div>
        </div>
      </div>
      {showAdd && (
        <Modal title="Create Proposal Template" onClose={() => setShowAdd(false)}>
          <FF label="CC"><input style={s.input} placeholder="Comma separated emails" value={form.cc} onChange={(e) => setForm({ ...form, cc: e.target.value })} /></FF>
          <div style={{ marginTop: 12 }} />
          <FF label="BCC"><input style={s.input} placeholder="Comma separated emails" value={form.bcc} onChange={(e) => setForm({ ...form, bcc: e.target.value })} /></FF>
          <div style={{ marginTop: 12 }} />
          <FF label="Subject" required><input style={s.input} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></FF>
          <div style={{ marginTop: 12 }} />
          <FF label="Email Body" required><textarea style={{ ...s.textarea, height: 140 }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></FF>
          <div style={{ marginTop: 12 }} />
          <FF label="Attachments">
            <div style={{ border: "2px dashed #e5e7eb", borderRadius: 6, padding: 16, textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              <input type="file" style={{ display: "block", margin: "0 auto" }} />
              <div style={{ marginTop: 6 }}>Max 5MB · .pdf, .csv, .doc, .docx, .jpg, .png</div>
            </div>
          </FF>
          <MFooter onClose={() => setShowAdd(false)} onSave={() => { if(!form.subject.trim()){alert("Subject required");return;} alert("Template saved!"); setShowAdd(false); }} saveLabel="Save Template" />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROPOSALS
───────────────────────────────────────────── */
function ProposalsPage() {
  const [search, setSearch] = useState("");
  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Proposals</div>
          <div style={s.breadcrumb}>CRM › Proposals</div>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>All Proposals</span></div>
        <div style={s.cardBody}>
          <div style={s.toolbar}>
            <div style={s.toolbarL}><ShowEntries /><ExportButtons /></div>
            <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
          </div>
          <table style={s.table}>
            <thead><tr>{["Contact","Subject","Sent by","Date","Action"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody><NoData cols={5} /></tbody>
          </table>
          <div style={s.pagInfo}>Showing 0 entries</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SOURCES
───────────────────────────────────────────── */
function SourcesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [rows, setRows]       = useState([]);
  const [search, setSearch]   = useState("");
  const [form, setForm]       = useState({ source: "", desc: "" });

  const filtered = rows.filter((r) => !search || r.source.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.source.trim()) { alert("Source name is required."); return; }
    if (editIdx !== null) { const u=[...rows]; u[editIdx]={...form}; setRows(u); setEditIdx(null); }
    else setRows([...rows, { ...form }]);
    setForm({ source: "", desc: "" }); setShowAdd(false);
  };

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Sources</div>
          <div style={s.breadcrumb}>CRM › Sources</div>
        </div>
        <button style={s.btn("green")} onClick={() => { setForm({ source:"",desc:"" }); setEditIdx(null); setShowAdd(true); }}>+ Add Source</button>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>Manage Sources</span></div>
        <div style={s.cardBody}>
          <div style={s.toolbar}>
            <div style={s.toolbarL}><ShowEntries /><button style={s.expBtn("#059669")} onClick={() => exportCSV([["Source","Description"],...rows.map((r)=>[r.source,r.desc])],"sources.csv")}>📄 CSV</button></div>
            <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
          </div>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Source Name</th><th style={s.th}>Description</th><th style={s.th}>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <NoData cols={3} /> : filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...s.td, fontWeight: 500 }}>{r.source}</td>
                  <td style={s.td}>{r.desc||"—"}</td>
                  <td style={s.td}>
                    <div style={s.actionRow}>
                      <button style={s.btn("teal","sm")} onClick={() => { setForm({...r}); setEditIdx(i); setShowAdd(true); }}>✏️ Edit</button>
                      <button style={s.btn("red","sm")}  onClick={() => { if(window.confirm("Delete?")) setRows(rows.filter((_,idx)=>idx!==i)); }}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={s.pagInfo}>Showing {filtered.length} of {rows.length} entries</div>
        </div>
      </div>
      {showAdd && (
        <Modal title={editIdx !== null ? "Edit Source" : "Add Source"} onClose={() => setShowAdd(false)}>
          <FF label="Source Name" required><input style={s.input} placeholder="e.g. Website, Referral" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></FF>
          <div style={{ marginTop: 12 }} />
          <FF label="Description"><textarea style={{ ...s.textarea, height: 80 }} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></FF>
          <MFooter onClose={() => setShowAdd(false)} onSave={handleSave} saveLabel={editIdx !== null ? "Update" : "Save"} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIFE STAGE
───────────────────────────────────────────── */
function LifeStagePage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [rows, setRows]       = useState([]);
  const [search, setSearch]   = useState("");
  const [form, setForm]       = useState({ lifeStage: "", desc: "" });

  const filtered = rows.filter((r) => !search || r.lifeStage.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.lifeStage.trim()) { alert("Life stage name is required."); return; }
    if (editIdx !== null) { const u=[...rows]; u[editIdx]={...form}; setRows(u); setEditIdx(null); }
    else setRows([...rows, { ...form }]);
    setForm({ lifeStage: "", desc: "" }); setShowAdd(false);
  };

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Life Stage</div>
          <div style={s.breadcrumb}>CRM › Life Stage</div>
        </div>
        <button style={s.btn("green")} onClick={() => { setForm({ lifeStage:"",desc:"" }); setEditIdx(null); setShowAdd(true); }}>+ Add Life Stage</button>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>Manage Life Stages</span></div>
        <div style={s.cardBody}>
          <div style={s.toolbar}>
            <div style={s.toolbarL}><ShowEntries /><button style={s.expBtn("#059669")} onClick={() => exportCSV([["Life Stage","Description"],...rows.map((r)=>[r.lifeStage,r.desc])],"life_stages.csv")}>📄 CSV</button></div>
            <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
          </div>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Life Stage</th><th style={s.th}>Description</th><th style={s.th}>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <NoData cols={3} /> : filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...s.td, fontWeight: 500 }}>{r.lifeStage}</td>
                  <td style={s.td}>{r.desc||"—"}</td>
                  <td style={s.td}>
                    <div style={s.actionRow}>
                      <button style={s.btn("teal","sm")} onClick={() => { setForm({...r}); setEditIdx(i); setShowAdd(true); }}>✏️ Edit</button>
                      <button style={s.btn("red","sm")}  onClick={() => { if(window.confirm("Delete?")) setRows(rows.filter((_,idx)=>idx!==i)); }}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={s.pagInfo}>Showing {filtered.length} of {rows.length} entries</div>
        </div>
      </div>
      {showAdd && (
        <Modal title={editIdx !== null ? "Edit Life Stage" : "Add Life Stage"} onClose={() => setShowAdd(false)}>
          <FF label="Life Stage Name" required><input style={s.input} placeholder="e.g. New, Contacted, Qualified" value={form.lifeStage} onChange={(e) => setForm({ ...form, lifeStage: e.target.value })} /></FF>
          <div style={{ marginTop: 12 }} />
          <FF label="Description"><textarea style={{ ...s.textarea, height: 80 }} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></FF>
          <MFooter onClose={() => setShowAdd(false)} onSave={handleSave} saveLabel={editIdx !== null ? "Update" : "Save"} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOLLOWUP CATEGORY
───────────────────────────────────────────── */
function FollowupCategoryPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [rows, setRows]       = useState([{ cat: "call", desc: "Telephone follow up" }, { cat: "email", desc: "Email communication" }]);
  const [search, setSearch]   = useState("");
  const [form, setForm]       = useState({ cat: "", desc: "" });

  const filtered = rows.filter((r) => !search || r.cat.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.cat.trim()) { alert("Category name is required."); return; }
    if (editIdx !== null) { const u=[...rows]; u[editIdx]={...form}; setRows(u); setEditIdx(null); }
    else setRows([...rows, { ...form }]);
    setForm({ cat: "", desc: "" }); setShowAdd(false);
  };

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Followup Category</div>
          <div style={s.breadcrumb}>CRM › Followup Category</div>
        </div>
        <button style={s.btn("green")} onClick={() => { setForm({ cat:"",desc:"" }); setEditIdx(null); setShowAdd(true); }}>+ Add Category</button>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>Manage Followup Categories</span></div>
        <div style={s.cardBody}>
          <div style={s.toolbar}>
            <div style={s.toolbarL}><ShowEntries /><button style={s.expBtn("#059669")} onClick={() => exportCSV([["Category","Description"],...rows.map((r)=>[r.cat,r.desc])],"followup_cats.csv")}>📄 CSV</button></div>
            <div style={s.toolbarR}><SearchInput value={search} onChange={setSearch} /></div>
          </div>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Category Name</th><th style={s.th}>Description</th><th style={s.th}>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <NoData cols={3} /> : filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...s.td, fontWeight: 500 }}>{r.cat}</td>
                  <td style={s.td}>{r.desc||"—"}</td>
                  <td style={s.td}>
                    <div style={s.actionRow}>
                      <button style={s.btn("teal","sm")} onClick={() => { setForm({...r}); setEditIdx(i); setShowAdd(true); }}>✏️ Edit</button>
                      <button style={s.btn("red","sm")}  onClick={() => { if(window.confirm("Delete?")) setRows(rows.filter((_,idx)=>idx!==i)); }}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={s.pagInfo}>Showing {filtered.length} of {rows.length} entries</div>
        </div>
      </div>
      {showAdd && (
        <Modal title={editIdx !== null ? "Edit Category" : "Add Followup Category"} onClose={() => setShowAdd(false)}>
          <FF label="Category Name" required><input style={s.input} placeholder="e.g. call, email, meeting" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} /></FF>
          <div style={{ marginTop: 12 }} />
          <FF label="Description"><textarea style={{ ...s.textarea, height: 80 }} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></FF>
          <MFooter onClose={() => setShowAdd(false)} onSave={handleSave} saveLabel={editIdx !== null ? "Update" : "Save"} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMMISSIONS
───────────────────────────────────────────── */
function CommissionsPage() {
  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Commissions</div>
          <div style={s.breadcrumb}>CRM › Contacts Login › Commissions</div>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>All Commissions</span></div>
        <div style={s.cardBody}>
          <div style={s.toolbar}><div style={s.toolbarL}><ShowEntries /><ExportButtons /></div></div>
          <table style={s.table}>
            <thead><tr>{["Date","Contact","Name","Mobile","Invoice No.","Location","Total Commission"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody><NoData cols={7} /></tbody>
          </table>
          <div style={{ background: "#f9fafb", padding: "8px 10px", display: "flex", justifyContent: "space-between", fontWeight: 600, marginTop: 4, fontSize: 13 }}>
            <span>Total:</span><span>₹ 0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────── */
function CRMSettings() {
  const [settings, setSettings] = useState({ orderRequest: false, prefix: "", defaultUser: "Ms Dharshiha C", fuReminder: false });

  return (
    <div style={s.wrap}>
      <CRMNav />
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>CRM Settings</div>
          <div style={s.breadcrumb}>CRM › Settings</div>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>General Settings</span></div>
        <div style={s.cardBody}>
          <div style={{ maxWidth: 580 }}>
            {[
              { key: "orderRequest", label: "Enable Order Request", desc: "Allow contacts to submit order requests from the portal" },
              { key: "fuReminder",   label: "Enable Follow-up Reminders", desc: "Send email notifications for upcoming follow-ups" },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", marginBottom: 12 }}>
                <input type="checkbox" checked={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} style={{ width: 15, height: 15, cursor: "pointer" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={s.formGrid(2)}>
              <FF label="Order Request Prefix">
                <input style={s.input} placeholder="e.g. ORQ-" value={settings.prefix} onChange={(e) => setSettings({ ...settings, prefix: e.target.value })} />
              </FF>
              <FF label="Default Assigned User">
                <select style={s.select} value={settings.defaultUser} onChange={(e) => setSettings({ ...settings, defaultUser: e.target.value })}>
                  {["Ms Dharshiha C","Er Sarath Raj","Mr Leejin"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </FF>
            </div>
            <div style={{ marginTop: 20 }}>
              <button style={s.btn("teal")} onClick={() => alert("Settings saved!")}>✓ Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROUTES EXPORT
───────────────────────────────────────────── */
export function CRMRoutes() {
  return (
    <Routes>
      <Route path="/"                   element={<CRMDashboard />} />
      <Route path="/leads"              element={<LeadsPage />} />
      <Route path="/follow-ups"         element={<FollowUpsPage />} />
      <Route path="/campaigns"          element={<CampaignsPage />} />
      <Route path="/campaigns/create"   element={<CampaignCreate />} />
      <Route path="/contacts-login"     element={<ContactsLoginPage />} />
      <Route path="/commissions"        element={<CommissionsPage />} />
      <Route path="/reports"            element={<CRMReportsPage />} />
      <Route path="/proposal-template"  element={<ProposalTemplatePage />} />
      <Route path="/proposals"          element={<ProposalsPage />} />
      <Route path="/sources"            element={<SourcesPage />} />
      <Route path="/life-stage"         element={<LifeStagePage />} />
      <Route path="/followup-category"  element={<FollowupCategoryPage />} />
      <Route path="/settings"           element={<CRMSettings />} />
    </Routes>
  );
}
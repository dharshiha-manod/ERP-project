// ════════════════════════════════════════════════════════════════════════════════
// src/pages/Sell.jsx  —  Advanced Sell Module v4
// Exports: AllSales, AddSale, ListPOS, POSCreate, AddDraft, ListDrafts,
//          AddQuotation, ListQuotations, SellReturn, Shipments, Discounts, ImportSales
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Design tokens ──────────────────────────────────────────────────────────────
const F          = "'Inter','Segoe UI',sans-serif";
const GREEN      = "#1a6b3f";
const GREEN_GRAD = "linear-gradient(135deg,#22863a 0%,#145730 100%)";
const LIGHT_GRN  = "#f0faf4";
const BORDER     = "#e2e8f0";
const TEXT_MAIN  = "#1e293b";
const TEXT_MUTED = "#64748b";
const BG         = "#f8fafc";
const RED        = "#dc2626";
const AMBER      = "#f59e0b";

// ── Page shell ────────────────────────────────────────────────────────────────
const PAGE = {
  fontFamily: F, display: "flex", flexDirection: "column",
  height: "calc(100vh - 130px)", overflow: "hidden", background: BG,
};

// ── Shared UI primitives ───────────────────────────────────────────────────────

const PageHeader = ({ title, breadcrumb, actions }) => (
  <div style={{
    background: "#fff", borderBottom: `1px solid ${BORDER}`,
    padding: "14px 24px", display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", flexShrink: 0,
  }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT_MAIN, letterSpacing: "-0.3px" }}>{title}</h2>
      {breadcrumb && <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>{breadcrumb}</div>}
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>{actions}</div>
  </div>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10,
    borderLeft: `4px solid ${accent || GREEN}`, padding: "16px 20px", flex: 1, minWidth: 0,
  }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 700, color: TEXT_MAIN, margin: "6px 0 2px", letterSpacing: "-0.5px" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: TEXT_MUTED }}>{sub}</div>}
  </div>
);

const Badge = ({ status }) => {
  const map = {
    Paid:      { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
    Unpaid:    { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
    Partial:   { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
    Draft:     { bg: "#e0e7ff", color: "#3730a3", border: "#c7d2fe" },
    Submitted: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
    Completed: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
    Cancelled: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
    Sent:      { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
    Accepted:  { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
    Rejected:  { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
    Expired:   { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    Shipped:   { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
    Delivered: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
    Active:    { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
    Inactive:  { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
    Pending:   { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
    "Walk-In": { bg: "#e0e7ff", color: "#3730a3", border: "#c7d2fe" },
    Retail:    { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
    Wholesale: { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-block",
    }}>{status}</span>
  );
};

// Table primitives
const Th = ({ children, right, center }) => (
  <th style={{
    padding: "9px 14px", textAlign: right ? "right" : center ? "center" : "left",
    fontSize: 11, fontWeight: 700, color: TEXT_MUTED, background: "#f8fafc",
    borderBottom: `2px solid ${BORDER}`, whiteSpace: "nowrap",
    letterSpacing: "0.4px", textTransform: "uppercase",
  }}>{children}</th>
);
const Td = ({ children, right, center, mono, muted }) => (
  <td style={{
    padding: "10px 14px", fontSize: 13,
    textAlign: right ? "right" : center ? "center" : "left",
    fontFamily: mono ? "'JetBrains Mono','Courier New',monospace" : F,
    borderBottom: `1px solid ${BORDER}`, color: muted ? TEXT_MUTED : TEXT_MAIN,
  }}>{children}</td>
);

// Buttons
const PrimaryBtn = ({ label, onClick, icon, disabled, type = "button", small }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{
    padding: small ? "6px 12px" : "8px 18px",
    background: disabled ? "#94a3b8" : GREEN_GRAD, color: "#fff",
    border: "none", borderRadius: 8, fontSize: small ? 12 : 13,
    cursor: disabled ? "not-allowed" : "pointer", fontFamily: F, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
  }}>{icon && <span>{icon}</span>}{label}</button>
);
const GhostBtn = ({ label, onClick, icon, small }) => (
  <button onClick={onClick} style={{
    padding: small ? "6px 12px" : "8px 16px",
    background: "#fff", color: TEXT_MAIN, border: `1px solid ${BORDER}`,
    borderRadius: 8, fontSize: small ? 12 : 13, cursor: "pointer",
    fontFamily: F, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
  }}>{icon && <span>{icon}</span>}{label}</button>
);
const DangerBtn = ({ label, onClick, small }) => (
  <button onClick={onClick} style={{
    padding: small ? "5px 10px" : "8px 14px",
    background: "#fff", color: RED, border: `1px solid #fecaca`,
    borderRadius: 6, fontSize: small ? 11 : 12, cursor: "pointer",
    fontFamily: F, fontWeight: 600,
  }}>{label}</button>
);

// SVG icon buttons
const IBtn = ({ icon, onClick, color = TEXT_MUTED, title }) => (
  <button title={title} onClick={onClick} style={{
    background: "none", border: "none", cursor: "pointer", color,
    padding: "4px 6px", borderRadius: 4, display: "inline-flex", alignItems: "center",
  }}
    onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}
  >{icon}</button>
);

// Icons
const IC = {
  eye:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  trash:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  print:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  convert:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  save:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  csv:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  tag:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  truck:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  close:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// Form elements
const Inp = ({ value, onChange, placeholder, type = "text", readOnly, min, max, style: s }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    readOnly={readOnly} min={min} max={max}
    style={{
      width: "100%", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 10px",
      fontSize: 13, fontFamily: F, background: readOnly ? "#f8fafc" : "#fff",
      color: TEXT_MAIN, outline: "none", boxSizing: "border-box", ...s,
    }}
    onFocus={e => { if (!readOnly) e.target.style.borderColor = GREEN; }}
    onBlur={e => { e.target.style.borderColor = BORDER; }}
  />
);
const Sel = ({ value, onChange, children, style: s }) => (
  <select value={value} onChange={onChange} style={{
    width: "100%", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 10px",
    fontSize: 13, fontFamily: F, background: "#fff", color: TEXT_MAIN,
    outline: "none", cursor: "pointer", boxSizing: "border-box", ...s,
  }}
    onFocus={e => e.target.style.borderColor = GREEN}
    onBlur={e => e.target.style.borderColor = BORDER}
  >{children}</select>
);
const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{
      width: "100%", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 10px",
      fontSize: 13, fontFamily: F, resize: "none", outline: "none", boxSizing: "border-box",
    }}
    onFocus={e => e.target.style.borderColor = GREEN}
    onBlur={e => e.target.style.borderColor = BORDER}
  />
);
const FL = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: TEXT_MUTED, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
    {children}{required && <span style={{ color: RED, marginLeft: 2 }}>*</span>}
  </label>
);

// Card
const Card = ({ children, style: s }) => (
  <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", ...s }}>{children}</div>
);
const CardTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_MAIN, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>{children}</div>
);

// Full-page table
const TablePage = ({ columns, rows, loading, emptyText, footer, topBar }) => (
  <div style={{
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10,
    flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden",
  }}>
    {topBar && (
      <div style={{
        padding: "12px 18px", borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12, flexWrap: "wrap",
      }}>{topBar}</div>
    )}
    <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
          <tr>{columns.map((c, i) => <Th key={i} right={c.right} center={c.center}>{c.label}</Th>)}</tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 40, color: TEXT_MUTED, fontSize: 13 }}>Loading...</td></tr>
            : rows.length === 0
              ? <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 60, color: TEXT_MUTED }}>
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.2 }}>■</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{emptyText}</div>
                </td></tr>
              : rows.map((r, i) => (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >{r}</tr>
                ))
          }
        </tbody>
      </table>
    </div>
    {footer && (
      <div style={{
        padding: "10px 18px", borderTop: `1px solid ${BORDER}`, flexShrink: 0,
        background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>{footer}</div>
    )}
  </div>
);

const PerPage = ({ value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 12, color: TEXT_MUTED }}>Show</span>
    <select value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: F, background: "#fff" }}>
      {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
    </select>
    <span style={{ fontSize: 12, color: TEXT_MUTED }}>entries</span>
  </div>
);

const SearchBox = ({ value, onChange, placeholder, width = 220 }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    <span style={{ position: "absolute", left: 10, pointerEvents: "none", display: "flex" }}>{IC.search}</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Search..."}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 10px 7px 30px", fontSize: 12, fontFamily: F, background: "#fff", width, outline: "none" }}
      onFocus={e => e.target.style.borderColor = GREEN}
      onBlur={e => e.target.style.borderColor = BORDER}
    />
  </div>
);

// Money formatter
const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

// Auto invoice number
const genNo = (prefix) => `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

// Summary row
const SumRow = ({ label, value, bold, big, color, border }) => (
  <div style={{
    display: "flex", justifyContent: "space-between",
    padding: big ? "12px 0 0" : "8px 0",
    borderTop: border ? `2px solid ${BORDER}` : undefined,
    borderBottom: !border ? `1px solid ${BORDER}` : undefined,
    fontSize: big ? 16 : 13,
  }}>
    <span style={{ color: TEXT_MUTED, fontWeight: bold ? 600 : 400 }}>{label}</span>
    <span style={{ fontWeight: bold || big ? 700 : 500, color: color || (big ? GREEN : TEXT_MAIN) }}>{value}</span>
  </div>
);

// ══════════════════════════════════════════════════════════════
// TYPEABLE CUSTOMER COMBOBOX
// Fetches customers from API, allows typing to filter, shows dropdown
// ══════════════════════════════════════════════════════════════
function CustomerCombobox({ value, onChange, customers, placeholder = "Search customer..." }) {
  const [q, setQ]         = useState(value || "");
  const [open, setOpen]   = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  // Sync external value to input
  useEffect(() => { setQ(value || ""); }, [value]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allOptions = [
    { id: "walkin", name: "Walk-In Customer", customer_type: "Walk-In" },
    ...customers.map(c => ({ ...c, name: c.name || c.contact_name || "" })),
  ];

  const filtered = allOptions.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.phone?.includes(q) || c.email?.toLowerCase().includes(q.toLowerCase())
  );

  const handleSelect = (c) => {
    setQ(c.name);
    onChange(c.name, c);
    setOpen(false);
  };

  const handleInput = (e) => {
    setQ(e.target.value);
    onChange(e.target.value, null);
    setOpen(true);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: 10, pointerEvents: "none", display: "flex", opacity: 0.5 }}>{IC.search}</span>
        <input
          value={q}
          onChange={handleInput}
          onFocus={() => { setOpen(true); setFocused(true); }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%", border: `1px solid ${focused ? GREEN : BORDER}`, borderRadius: 6,
            padding: "7px 36px 7px 32px", fontSize: 13, fontFamily: F, background: "#fff",
            color: TEXT_MAIN, outline: "none", boxSizing: "border-box",
          }}
        />
        {q && (
          <button onClick={() => { setQ(""); onChange("", null); setOpen(true); }}
            style={{ position: "absolute", right: 8, background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, display: "flex", padding: 2 }}>
            {IC.close}
          </button>
        )}
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8,
          maxHeight: 240, overflowY: "auto", zIndex: 100,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 14px", fontSize: 13, color: TEXT_MUTED }}>
              No customers found
              <a href="/contacts/customers/create" target="_blank"
                style={{ display: "block", marginTop: 6, fontSize: 12, color: GREEN, fontWeight: 600 }}>
                + Add New Customer
              </a>
            </div>
          ) : (
            filtered.slice(0, 15).map(c => (
              <div key={c.id || c.name}
                onMouseDown={() => handleSelect(c)}
                style={{
                  padding: "10px 14px", cursor: "pointer", fontSize: 13,
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
                onMouseEnter={e => e.currentTarget.style.background = LIGHT_GRN}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  {c.phone && <span style={{ color: TEXT_MUTED, fontSize: 11, marginLeft: 8 }}>{c.phone}</span>}
                  {c.email && <div style={{ fontSize: 11, color: TEXT_MUTED }}>{c.email}</div>}
                </div>
                {c.customer_type && <Badge status={c.customer_type} />}
              </div>
            ))
          )}
          <div style={{ padding: "8px 14px", borderTop: `1px solid ${BORDER}`, background: "#fafafa" }}>
            <a href="/contacts/customers/create" target="_blank"
              style={{ fontSize: 12, color: GREEN, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              {IC.plus} Add New Customer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Customer dropdown with "+ Add New" (legacy wrapper kept for POS) ──────────
function CustomerSelect({ value, onChange, customers }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <CustomerCombobox value={value} onChange={(name) => onChange(name)} customers={customers} />
      </div>
      <button
        title="Add New Customer"
        onClick={() => window.open("/contacts/customers/create", "_blank")}
        style={{
          padding: "7px 10px", background: LIGHT_GRN, border: `1px solid #a7f3d0`,
          borderRadius: 6, cursor: "pointer", color: GREEN, fontWeight: 700,
          fontSize: 13, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >{IC.plus} Add New</button>
    </div>
  );
}

// ── Product search dropdown ───────────────────────────────────────────────────
function ProductSearchDropdown({ products, onSelect, placeholder }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = products.filter(p =>
    !q || p.name?.toLowerCase().includes(q.toLowerCase()) ||
    p.sku?.toLowerCase().includes(q.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>{IC.search}</span>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || "Search product by name, SKU, or barcode..."}
          style={{ width: "100%", border: `1px solid ${q && open ? GREEN : BORDER}`, borderRadius: 6, padding: "8px 10px 8px 32px", fontSize: 13, fontFamily: F, background: "#fff", outline: "none", boxSizing: "border-box" }}
        />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8,
          maxHeight: 260, overflowY: "auto", zIndex: 50,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        }}>
          {filtered.length === 0
            ? <div style={{ padding: "12px 14px", fontSize: 13, color: TEXT_MUTED }}>
                {products.length === 0 ? "Loading products..." : "No products found"}
              </div>
            : filtered.slice(0, 12).map(p => (
              <div key={p.id || p.name}
                onClick={() => { onSelect(p); setQ(""); setOpen(false); }}
                style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = LIGHT_GRN}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  {p.sku && <span style={{ color: TEXT_MUTED, fontSize: 11, marginLeft: 8 }}>SKU: {p.sku}</span>}
                  {p.category && <span style={{ color: TEXT_MUTED, fontSize: 11, marginLeft: 6 }}>• {p.category}</span>}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                  {p.stock !== undefined && (
                    <span style={{ fontSize: 11, color: p.stock > 0 ? "#16a34a" : RED, background: p.stock > 0 ? "#f0fdf4" : "#fef2f2", padding: "2px 6px", borderRadius: 4 }}>
                      Stock: {p.stock}
                    </span>
                  )}
                  <span style={{ color: GREEN, fontWeight: 700 }}>Rs. {fmt(p.selling_price || p.cost_price || 0)}</span>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── Small inline number input ─────────────────────────────────────────────────
const NInp = ({ value, onChange, width = 65, min = 0, max }) => (
  <input type="number" value={value} onChange={onChange} min={min} max={max}
    style={{ width, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "4px 6px", fontSize: 12, textAlign: "right", fontFamily: F, outline: "none" }}
    onFocus={e => e.target.style.borderColor = GREEN}
    onBlur={e => e.target.style.borderColor = BORDER}
  />
);

// ── Hook to fetch products and customers ──────────────────────────────────────
function useProductsAndCustomers() {
  const [products, setProducts]   = useState([]);
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    (async () => {
      try { const r = await fetch("http://localhost:5000/api/products"); if (r.ok) { const d = await r.json(); setProducts(d.data || []); } } catch {}
      try { const r = await fetch("http://localhost:5000/api/contacts?type=customer"); if (r.ok) { const d = await r.json(); setCustomers(d.data || []); } } catch {}
    })();
  }, []);
  return { products, customers };
}

// ══════════════════════════════════════════════════════════════
// 1. ALL SALES
// ══════════════════════════════════════════════════════════════
export function AllSales() {
  const navigate = useNavigate();
  const [sales, setSales]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("All");
  const [methodF, setMethodF] = useState("All");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("http://localhost:5000/api/sales-invoice");
        if (r.ok) { const d = await r.json(); setSales(d.data || []); }
      } catch { setSales([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = sales.filter(s => {
    if (statusF !== "All" && s.paymentStatus !== statusF) return false;
    if (methodF !== "All" && s.paymentMethod !== methodF) return false;
    if (search && !`${s.invoiceNo} ${s.customer}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).slice(0, perPage);

  const totalPaid   = sales.filter(s => s.paymentStatus === "Paid").reduce((a, s) => a + Number(s.grandTotal || 0), 0);
  const totalUnpaid = sales.filter(s => s.paymentStatus === "Unpaid").reduce((a, s) => a + Number(s.grandTotal || 0), 0);
  const viewTotal   = filtered.reduce((a, s) => a + Number(s.grandTotal || 0), 0);

  const cols = [
    { label: "Action", center: true }, { label: "Invoice No." }, { label: "Date" },
    { label: "Customer" }, { label: "Location" }, { label: "Payment Status" },
    { label: "Method" }, { label: "Total (Rs.)", right: true },
  ];
  const rows = filtered.map((s, i) => (
    <>
      <Td center>
        <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <IBtn icon={IC.eye} title="View" />
          <IBtn icon={IC.edit} title="Edit" />
          <IBtn icon={IC.trash} title="Delete" color={RED} />
        </div>
      </Td>
      <Td mono>{s.invoiceNo || `INV-${String(i + 1).padStart(4, "0")}`}</Td>
      <Td>{s.date || new Date().toLocaleDateString("en-IN")}</Td>
      <Td>{s.customer || "—"}</Td>
      <Td muted>{s.location || "Manod HQ"}</Td>
      <Td><Badge status={s.paymentStatus || "Unpaid"} /></Td>
      <Td muted>{s.paymentMethod || "Cash"}</Td>
      <Td right><span style={{ fontWeight: 700, color: GREEN }}>Rs. {fmt(s.grandTotal)}</span></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="All Sales" breadcrumb="Home / Sell / All Sales"
        actions={<>
          <GhostBtn label="Export CSV" icon={IC.csv} />
          <PrimaryBtn label="Add Sale" icon={IC.plus} onClick={() => navigate("/sells/create")} />
        </>}
      />
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 14, flexShrink: 0 }}>
        <StatCard label="Total Invoices" value={sales.length} sub="All time" accent={GREEN} />
        <StatCard label="Total Paid" value={`Rs. ${fmt(totalPaid)}`} sub={`${sales.filter(s => s.paymentStatus === "Paid").length} invoices`} accent="#22c55e" />
        <StatCard label="Total Unpaid" value={`Rs. ${fmt(totalUnpaid)}`} sub={`${sales.filter(s => s.paymentStatus === "Unpaid").length} invoices`} accent={RED} />
        <StatCard label="Showing Total" value={`Rs. ${fmt(viewTotal)}`} sub="Current view" accent={AMBER} />
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: "14px 24px", display: "flex", flexDirection: "column" }}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No sales found. Click Add Sale to get started."
          topBar={<>
            <PerPage value={perPage} onChange={setPerPage} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={statusF} onChange={e => setStatusF(e.target.value)}
                style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: F, background: "#fff" }}>
                {["All", "Paid", "Unpaid", "Partial"].map(o => <option key={o}>{o}</option>)}
              </select>
              <select value={methodF} onChange={e => setMethodF(e.target.value)}
                style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: F, background: "#fff" }}>
                {["All", "Cash", "UPI", "Card", "Bank Transfer"].map(o => <option key={o}>{o}</option>)}
              </select>
              <SearchBox value={search} onChange={setSearch} placeholder="Search invoice or customer..." />
            </div>
          </>}
          footer={<>
            <span style={{ fontSize: 12, color: TEXT_MUTED }}>Showing {filtered.length} of {sales.length} entries</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Total: Rs. {fmt(viewTotal)}</span>
          </>}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 2. ADD SALE
// ══════════════════════════════════════════════════════════════
export function AddSale() {
  const navigate = useNavigate();
  const { products, customers } = useProductsAndCustomers();

  const [invoiceNo,   setInvoiceNo]   = useState(() => genNo("INV"));
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [warehouse,   setWarehouse]   = useState("Manod HQ");
  const [customer,     setCustomer]     = useState("Walk-In Customer");
  const [customerType, setCustomerType] = useState("Walk-In");
  const [salesperson, setSalesperson] = useState("");
  const [payTerm,     setPayTerm]     = useState("Immediate");
  const [payMethod,   setPayMethod]   = useState("Cash");
  const [taxRate,     setTaxRate]     = useState(18);
  const [globalDisc,  setGlobalDisc]  = useState(0);
  const [shipping,    setShipping]    = useState(0);
  const [notes,       setNotes]       = useState("");
  const [docStatus,   setDocStatus]   = useState("Submitted");
  const [items,       setItems]       = useState([]);
  const [saving,      setSaving]      = useState(false);

  const onSelectCustomer = (name, obj) => {
    setCustomer(name);
    setCustomerType(obj?.customer_type || obj?.type || (name === "Walk-In Customer" ? "Walk-In" : "Retail"));
  };

  const addProduct = (p) => {
    if (items.some(i => i.id === p.id)) return;
    setItems(prev => [...prev, {
      id: p.id || Date.now(), product: p.name, sku: p.sku || "",
      qty: 1, unit: "Pcs",
      unitPrice: Number(p.selling_price || p.cost_price || 0),
      discount: 0, tax: taxRate,
    }]);
  };

  const upd = (id, key, val) => setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
  const del = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const lSub  = r => r.qty * r.unitPrice;
  const lDisc = r => lSub(r) * (r.discount / 100);
  const lTax  = r => (lSub(r) - lDisc(r)) * (r.tax / 100);
  const lTot  = r => lSub(r) - lDisc(r) + lTax(r);

  const subtotal      = items.reduce((s, r) => s + lSub(r), 0);
  const itemDiscAmt   = items.reduce((s, r) => s + lDisc(r), 0);
  const taxAmt        = items.reduce((s, r) => s + lTax(r), 0);
  const globalDiscAmt = (subtotal - itemDiscAmt) * (globalDisc / 100);
  const grandTotal    = subtotal - itemDiscAmt - globalDiscAmt + taxAmt + Number(shipping);

  const dueDate = () => {
    const map = { Immediate: 0, "Net 7": 7, "Net 15": 15, "Net 30": 30 };
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + (map[payTerm] || 0));
    return d.toLocaleDateString("en-IN");
  };

  const handleSave = async () => {
    if (!customer) { alert("Customer is required."); return; }
    if (items.length === 0) { alert("Add at least one product."); return; }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/sales-invoice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "Sales Invoice", docStatus, affectsStock: docStatus === "Submitted",
          invoiceNo, invoiceDate, customer, customerType, warehouse,
          salesperson, paymentMethod: payMethod, paymentTerms: payTerm,
          dueDate: dueDate(), shippingAmt: Number(shipping),
          globalDiscount: globalDisc, taxAmt: taxAmt.toFixed(2),
          grandTotal: grandTotal.toFixed(2), notes, items,
        }),
      });
      if (res.ok) navigate("/sells");
      else { const e = await res.json(); alert("Error: " + (e.message || "Failed")); }
    } catch (e) { alert("Network error: " + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={PAGE}>
      <PageHeader title="New Sales Invoice"
        breadcrumb={`Home / Sell / New Invoice — ${invoiceNo}`}
        actions={<>
          <select value={docStatus} onChange={e => setDocStatus(e.target.value)}
            style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 12px", fontSize: 12, fontFamily: F, background: "#fff", cursor: "pointer" }}>
            <option value="Draft">Save as Draft</option>
            <option value="Submitted">Submit Invoice</option>
          </select>
          <GhostBtn label="Cancel" onClick={() => navigate("/sells")} />
          <PrimaryBtn label={saving ? "Saving..." : "Save Invoice"} icon={IC.save} onClick={handleSave} disabled={saving} />
        </>}
      />

      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 0, overflow: "hidden" }}>
        {/* LEFT scrollable */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "20px 20px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

          <Card>
            <CardTitle>Invoice Details</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div><FL>Invoice Number</FL><Inp value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
              <div><FL>Invoice Date</FL><Inp type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
              <div>
                <FL>Warehouse / Location</FL>
                <Sel value={warehouse} onChange={e => setWarehouse(e.target.value)}>
                  <option>Manod HQ</option><option>Branch - Chennai</option><option>Branch - Coimbatore</option>
                </Sel>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Customer &amp; Payment</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "span 2" }}>
                <FL required>Customer</FL>
                <CustomerCombobox value={customer} onChange={onSelectCustomer} customers={customers} />
                {customerType && (
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: TEXT_MUTED }}>Customer Type:</span>
                    <Badge status={customerType} />
                  </div>
                )}
              </div>
              <div>
                <FL>Salesperson</FL>
                <Sel value={salesperson} onChange={e => setSalesperson(e.target.value)}>
                  <option value="">— None —</option>
                  <option>Admin</option><option>Sales Rep</option><option>Cashier</option>
                </Sel>
              </div>
              <div>
                <FL>Payment Terms</FL>
                <Sel value={payTerm} onChange={e => setPayTerm(e.target.value)}>
                  {["Immediate", "Net 7", "Net 15", "Net 30"].map(o => <option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div>
                <FL>Payment Method</FL>
                <Sel value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  {["Cash", "UPI", "Card", "Bank Transfer", "Cheque"].map(o => <option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div><FL>Due Date</FL><Inp value={dueDate()} readOnly /></div>
              <div>
                <FL>Tax Rate (GST %)</FL>
                <Sel value={taxRate} onChange={e => { const v = Number(e.target.value); setTaxRate(v); setItems(p => p.map(i => ({ ...i, tax: v }))); }}>
                  {[0, 5, 12, 18, 28].map(v => <option key={v} value={v}>{v}%</option>)}
                </Sel>
              </div>
              <div><FL>Global Discount (%)</FL><Inp type="number" value={globalDisc} onChange={e => setGlobalDisc(Number(e.target.value))} min="0" max="100" /></div>
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column" }}>
            <CardTitle>Products / Line Items</CardTitle>
            <ProductSearchDropdown products={products} onSelect={addProduct} />
            <div style={{ marginTop: 12, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
              {items.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: TEXT_MUTED, fontSize: 13 }}>
                  Search above to add products to this invoice
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["#", "Product", "SKU", "Qty", "Unit", "Unit Price (Rs.)", "Disc %", "Tax %", "Total (Rs.)", ""].map((h, i) => (
                        <th key={i} style={{ padding: "8px 10px", fontWeight: 600, fontSize: 11, color: TEXT_MUTED, borderBottom: `1px solid ${BORDER}`, textTransform: "uppercase", textAlign: i >= 3 && i <= 8 ? "right" : "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ padding: "8px 10px", color: TEXT_MUTED, width: 28 }}>{i + 1}</td>
                        <td style={{ padding: "8px 10px", minWidth: 130 }}>
                          <input value={r.product} onChange={e => upd(r.id, "product", e.target.value)}
                            style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "4px 6px", fontSize: 12, fontFamily: F }} />
                        </td>
                        <td style={{ padding: "8px 10px", fontSize: 11, color: TEXT_MUTED }}>{r.sku || "—"}</td>
                        <td style={{ padding: "8px 10px" }}><NInp value={r.qty} min={1} onChange={e => upd(r.id, "qty", Number(e.target.value))} /></td>
                        <td style={{ padding: "8px 10px" }}>
                          <select value={r.unit} onChange={e => upd(r.id, "unit", e.target.value)}
                            style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: "4px 6px", fontSize: 12, fontFamily: F }}>
                            {["Pcs", "Box", "Kg", "L", "Pack", "Set"].map(u => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px 10px" }}><NInp value={r.unitPrice} width={90} onChange={e => upd(r.id, "unitPrice", Number(e.target.value))} /></td>
                        <td style={{ padding: "8px 10px" }}><NInp value={r.discount} width={55} max={100} onChange={e => upd(r.id, "discount", Number(e.target.value))} /></td>
                        <td style={{ padding: "8px 10px" }}><NInp value={r.tax} width={55} max={100} onChange={e => upd(r.id, "tax", Number(e.target.value))} /></td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: GREEN, whiteSpace: "nowrap" }}>Rs. {fmt(lTot(r))}</td>
                        <td style={{ padding: "8px 6px" }}><IBtn icon={IC.x} onClick={() => del(r.id)} color={RED} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <FL>Shipping Charges (Rs.)</FL>
              <Inp type="number" value={shipping} onChange={e => setShipping(e.target.value)} min="0" />
            </Card>
            <Card>
              <FL>Notes / Remarks</FL>
              <TextArea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal note or delivery instructions..." rows={2} />
            </Card>
          </div>
        </div>

        {/* RIGHT sticky summary */}
        <div style={{ width: 272, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: "#fff", overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ border: "none", padding: 0 }}>
            <CardTitle>Invoice Summary</CardTitle>
            <SumRow label="Subtotal"           value={`Rs. ${fmt(subtotal)}`} />
            <SumRow label="Item Discounts"     value={`- Rs. ${fmt(itemDiscAmt)}`} color="#ef4444" />
            {globalDisc > 0 && <SumRow label={`Global Disc (${globalDisc}%)`} value={`- Rs. ${fmt(globalDiscAmt)}`} color="#ef4444" />}
            <SumRow label="Tax (GST)"          value={`+ Rs. ${fmt(taxAmt)}`} color={AMBER} />
            {Number(shipping) > 0 && <SumRow label="Shipping" value={`+ Rs. ${fmt(shipping)}`} />}
            <SumRow label="Grand Total" value={`Rs. ${fmt(grandTotal)}`} big border />
          </Card>

          <Card style={{ border: "none", padding: 0, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
            <CardTitle>Invoice Info</CardTitle>
            {[
              { label: "Due Date", value: dueDate() },
              { label: "Items",    value: items.length },
              { label: "Method",   value: payMethod },
              { label: "Terms",    value: payTerm },
              { label: "Warehouse",value: warehouse },
              ...(salesperson ? [{ label: "Salesperson", value: salesperson }] : []),
              ...(customerType ? [{ label: "Cust. Type",  value: customerType }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>{label}</span>
                <span style={{ fontWeight: 600, color: TEXT_MAIN }}>{value}</span>
              </div>
            ))}
          </Card>

          {items.length > 0 && (
            <Card style={{ border: "none", padding: 0, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
              <CardTitle>Items ({items.length})</CardTitle>
              {items.map(r => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                  <span style={{ color: TEXT_MUTED, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.product} <span style={{ fontSize: 10 }}>x{r.qty}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: GREEN }}>Rs. {fmt(lTot(r))}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 3. LIST POS — with advanced detail side panel
// ══════════════════════════════════════════════════════════════
export function ListPOS() {
  const navigate = useNavigate();
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [perPage, setPerPage]   = useState(25);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null); // selected POS record for detail panel

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("http://localhost:5000/api/pos-sales");
        if (r.ok) { const d = await r.json(); setRecords(d.data || []); }
      } catch { setRecords([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const today      = new Date().toLocaleDateString("en-IN");
  const todayRecs  = records.filter(s => s.date === today);
  const filtered   = records.filter(s => !search || `${s.refNo} ${s.customer}`.toLowerCase().includes(search.toLowerCase())).slice(0, perPage);
  const viewTotal  = filtered.reduce((a, s) => a + Number(s.grandTotal || 0), 0);
  const todayTotal = todayRecs.reduce((a, s) => a + Number(s.grandTotal || 0), 0);

  const cols = [
    { label: "Action", center: true }, { label: "Ref No." }, { label: "Date" },
    { label: "Customer" }, { label: "Location" }, { label: "Payment Status" },
    { label: "Method" }, { label: "Total (Rs.)", right: true },
  ];
  const rows = filtered.map((s, i) => (
    <>
      <Td center>
        <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <IBtn icon={IC.eye} title="View Details" onClick={() => setSelected(s)} />
          <IBtn icon={IC.print} title="Print" />
        </div>
      </Td>
      <Td mono style={{ cursor: "pointer", color: GREEN }} onClick={() => setSelected(s)}>{s.refNo || `POS-${String(i + 1).padStart(4, "0")}`}</Td>
      <Td>{s.date || "—"}</Td>
      <Td>{s.customer || "Walk-In Customer"}</Td>
      <Td muted>{s.location || "Manod HQ"}</Td>
      <Td><Badge status={s.paymentStatus || "Paid"} /></Td>
      <Td muted>{s.paymentMethod || "Cash"}</Td>
      <Td right><span style={{ fontWeight: 700, color: GREEN }}>Rs. {fmt(s.grandTotal)}</span></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="POS Sales" breadcrumb="Home / Sell / POS Sales"
        actions={<PrimaryBtn label="Open POS" icon={IC.plus} onClick={() => navigate("/pos/create")} />}
      />
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 14, flexShrink: 0 }}>
        <StatCard label="Total Transactions" value={records.length} sub="All time" accent={GREEN} />
        <StatCard label="Today's Sales" value={`Rs. ${fmt(todayTotal)}`} sub={`${todayRecs.length} transactions`} accent="#22c55e" />
        <StatCard label="Showing Total" value={`Rs. ${fmt(viewTotal)}`} sub="Current view" accent={AMBER} />
        <StatCard label="Total POS Revenue" value={`Rs. ${fmt(records.reduce((a, s) => a + Number(s.grandTotal || 0), 0))}`} sub="All time" accent="#6366f1" />
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: "14px 24px", display: "flex", gap: 14 }}>
        {/* Table */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <TablePage columns={cols} rows={rows} loading={loading} emptyText="No POS sales yet. Open POS to start billing."
            topBar={<><PerPage value={perPage} onChange={setPerPage} /><SearchBox value={search} onChange={setSearch} /></>}
            footer={<>
              <span style={{ fontSize: 12, color: TEXT_MUTED }}>Showing {filtered.length} of {records.length} entries</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Total: Rs. {fmt(viewTotal)}</span>
            </>}
          />
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{
            width: 320, flexShrink: 0, background: "#fff", border: `1px solid ${BORDER}`,
            borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            {/* Panel header */}
            <div style={{ background: GREEN_GRAD, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{selected.refNo || "POS Sale"}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 }}>{selected.date || "—"}</div>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#fff", display: "flex" }}>
                {IC.close}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {/* Customer & Payment */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Transaction Info</div>
                {[
                  { label: "Customer",    value: selected.customer || "Walk-In Customer" },
                  { label: "Method",      value: selected.paymentMethod || "Cash" },
                  { label: "Status",      value: <Badge status={selected.paymentStatus || "Paid"} /> },
                  { label: "Location",    value: selected.location || "Manod HQ" },
                  { label: "Cashier",     value: selected.cashier || "Admin" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                    <span style={{ color: TEXT_MUTED }}>{label}</span>
                    <span style={{ fontWeight: 600, color: TEXT_MAIN }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Items */}
              {selected.items && selected.items.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Items ({selected.items.length})</div>
                  {selected.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name || item.product}</div>
                        {item.sku && <div style={{ fontSize: 10, color: TEXT_MUTED }}>SKU: {item.sku}</div>}
                        <div style={{ fontSize: 11, color: TEXT_MUTED }}>Rs. {fmt(item.price || item.unitPrice)} × {item.qty}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: GREEN, whiteSpace: "nowrap" }}>
                        Rs. {fmt((item.price || item.unitPrice || 0) * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div style={{ background: LIGHT_GRN, borderRadius: 8, padding: "12px 14px" }}>
                {selected.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: RED }}>
                    <span>Discount ({selected.discount}%)</span>
                    <span>- Rs. {fmt(Number(selected.grandTotal) * selected.discount / 100)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: AMBER }}>
                  <span>Tax (GST)</span>
                  <span>+ Rs. {fmt(selected.taxAmt || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: GREEN, paddingTop: 8, borderTop: `1px solid #a7f3d0`, marginTop: 4 }}>
                  <span>Grand Total</span>
                  <span>Rs. {fmt(selected.grandTotal)}</span>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#f8fafc", borderRadius: 6, fontSize: 12, color: TEXT_MUTED }}>
                  <strong>Notes:</strong> {selected.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8 }}>
              <PrimaryBtn label="Print Receipt" icon={IC.print} small onClick={() => window.print()} />
              <GhostBtn label="Return" small onClick={() => navigate("/sell-return")} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 4. POS CREATE
// ══════════════════════════════════════════════════════════════
export function POSCreate() {
  const navigate = useNavigate();
  const { products, customers } = useProductsAndCustomers();
  const [cart,      setCart]      = useState([]);
  const [customer,  setCustomer]  = useState("Walk-In Customer");
  const [payMethod, setPayMethod] = useState("Cash");
  const [discount,  setDiscount]  = useState(0);
  const [taxRate,   setTaxRate]   = useState(18);
  const [notes,     setNotes]     = useState("");
  const [receipt,   setReceipt]   = useState(null);
  const [saving,    setSaving]    = useState(false);

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, sku: p.sku || "", price: Number(p.selling_price || p.cost_price || 0), qty: 1 }];
    });
  };
  const updQty = (id, qty) => {
    if (qty < 1) { setCart(prev => prev.filter(c => c.id !== id)); return; }
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const subtotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discAmt    = subtotal * (discount / 100);
  const taxable    = subtotal - discAmt;
  const taxAmt     = taxable * (taxRate / 100);
  const grandTotal = taxable + taxAmt;

  const handleCompleteSale = async () => {
    if (cart.length === 0) { alert("Add at least one product to cart."); return; }
    setSaving(true);
    try {
      const refNo = genNo("POS");
      const res = await fetch("http://localhost:5000/api/pos-sales", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refNo, date: new Date().toLocaleDateString("en-IN"),
          customer, paymentMethod: payMethod, paymentStatus: "Paid",
          discount, taxAmt: taxAmt.toFixed(2), grandTotal: grandTotal.toFixed(2),
          affectsStock: true, notes, items: cart,
        }),
      });
      if (res.ok || true) {
        setReceipt({ refNo, customer, payMethod, cart, discount, taxAmt, grandTotal, date: new Date().toLocaleString("en-IN") });
      }
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  if (receipt) {
    return (
      <div style={PAGE}>
        <PageHeader title="Sale Complete" breadcrumb="Home / Sell / POS / Receipt"
          actions={<>
            <GhostBtn label="Print Receipt" icon={IC.print} onClick={() => window.print()} />
            <GhostBtn label="New Sale" onClick={() => { setReceipt(null); setCart([]); setDiscount(0); setNotes(""); }} />
            <PrimaryBtn label="Back to POS Sales" onClick={() => navigate("/pos")} />
          </>}
        />
        <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", padding: "30px 20px" }}>
          <div style={{ width: 400, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "28px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>Manod ERP</div>
              <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 2 }}>POS Receipt</div>
              <div style={{ marginTop: 10, padding: "6px 0", borderTop: `1px dashed ${BORDER}`, borderBottom: `1px dashed ${BORDER}` }}>
                <div style={{ fontSize: 11, color: TEXT_MUTED }}>Ref: {receipt.refNo}</div>
                <div style={{ fontSize: 11, color: TEXT_MUTED }}>{receipt.date}</div>
                <div style={{ fontSize: 11, color: TEXT_MUTED }}>Customer: {receipt.customer}</div>
              </div>
            </div>
            {receipt.cart.map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <span>{c.name} x{c.qty}</span>
                <span style={{ fontWeight: 600 }}>Rs. {fmt(c.price * c.qty)}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              {receipt.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: RED }}>
                <span>Discount ({receipt.discount}%)</span><span>- Rs. {fmt(subtotal * receipt.discount / 100)}</span>
              </div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: AMBER }}>
                <span>Tax (GST {taxRate}%)</span><span>+ Rs. {fmt(receipt.taxAmt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: GREEN, padding: "10px 0 0", borderTop: `2px solid ${BORDER}`, marginTop: 6 }}>
                <span>Total Paid</span><span>Rs. {fmt(receipt.grandTotal)}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: TEXT_MUTED, textAlign: "center" }}>Payment: {receipt.payMethod}</div>
            </div>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: TEXT_MUTED, paddingTop: 12, borderTop: `1px dashed ${BORDER}` }}>
              Thank you for your purchase!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={PAGE}>
      <PageHeader title="Point of Sale" breadcrumb="Home / Sell / POS Billing"
        actions={<GhostBtn label="Close POS" onClick={() => navigate("/pos")} />}
      />
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        {/* LEFT product grid */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 10, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <CustomerCombobox value={customer} onChange={(name) => setCustomer(name)} customers={customers} placeholder="Walk-In Customer..." />
            </div>
            <div style={{ flex: 2 }}>
              <ProductSearchDropdown products={products} onSelect={addToCart} placeholder="Search by name, SKU, or barcode..." />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {products.slice(0, 30).map(p => (
                <div key={p.id} onClick={() => addToCart(p)}
                  style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 10px", cursor: "pointer", textAlign: "center", transition: "border-color 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,107,63,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>■</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_MAIN, lineHeight: 1.3, marginBottom: 4 }}>{p.name}</div>
                  {p.sku && <div style={{ fontSize: 10, color: TEXT_MUTED }}>{p.sku}</div>}
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginTop: 6 }}>Rs. {fmt(p.selling_price || p.cost_price || 0)}</div>
                  {p.stock !== undefined && <div style={{ fontSize: 10, color: p.stock > 0 ? "#16a34a" : RED, marginTop: 2 }}>Stock: {p.stock}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT cart + payment */}
        <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {cart.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: TEXT_MUTED, fontSize: 13 }}>
                <div style={{ fontSize: 28, opacity: 0.2, marginBottom: 8 }}>■</div>
                Cart is empty
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: TEXT_MUTED, textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>Item</th>
                    <th style={{ padding: "8px 8px", fontSize: 11, fontWeight: 600, color: TEXT_MUTED, textAlign: "center", borderBottom: `1px solid ${BORDER}` }}>Qty</th>
                    <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: TEXT_MUTED, textAlign: "right", borderBottom: `1px solid ${BORDER}` }}>Total</th>
                    <th style={{ padding: "8px 8px", borderBottom: `1px solid ${BORDER}` }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "8px 12px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED }}>Rs. {fmt(c.price)} each</div>
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                          <button onClick={() => updQty(c.id, c.qty - 1)}
                            style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${BORDER}`, background: "#f8fafc", cursor: "pointer", fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 22, textAlign: "center" }}>{c.qty}</span>
                          <button onClick={() => updQty(c.id, c.qty + 1)}
                            style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${BORDER}`, background: "#f8fafc", cursor: "pointer", fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: GREEN }}>Rs. {fmt(c.price * c.qty)}</td>
                      <td style={{ padding: "8px 8px" }}><IBtn icon={IC.x} onClick={() => removeFromCart(c.id)} color={RED} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 16px", flexShrink: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <FL>Payment Method</FL>
                <Sel value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ fontSize: 12 }}>
                  {["Cash", "UPI", "Card", "Bank Transfer"].map(o => <option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div>
                <FL>Discount (%)</FL>
                <Inp type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min="0" max="100" />
              </div>
            </div>
            <div style={{ background: LIGHT_GRN, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
              {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: RED }}>
                <span>Discount ({discount}%)</span><span>- Rs. {fmt(discAmt)}</span>
              </div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: AMBER }}>
                <span>Tax (GST {taxRate}%)</span><span>+ Rs. {fmt(taxAmt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: GREEN, paddingTop: 8, borderTop: `1px solid #a7f3d0`, marginTop: 4 }}>
                <span>Grand Total</span><span>Rs. {fmt(grandTotal)}</span>
              </div>
            </div>
            <button onClick={handleCompleteSale} disabled={saving || cart.length === 0}
              style={{ width: "100%", padding: "13px", background: cart.length === 0 ? "#94a3b8" : GREEN_GRAD, color: "#fff", border: "none", borderRadius: 8, fontSize: 15, cursor: cart.length === 0 ? "not-allowed" : "pointer", fontFamily: F, fontWeight: 700 }}>
              {saving ? "Processing..." : `Complete Sale — Rs. ${fmt(grandTotal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 5. ADD DRAFT
// ══════════════════════════════════════════════════════════════
export function AddDraft() {
  const navigate = useNavigate();
  const { products, customers } = useProductsAndCustomers();
  const [draftNo,   setDraftNo]   = useState(() => genNo("DRF"));
  const [draftDate, setDraftDate] = useState(new Date().toISOString().slice(0, 10));
  const [customer,  setCustomer]  = useState("");
  const [warehouse, setWarehouse] = useState("Manod HQ");
  const [notes,     setNotes]     = useState("");
  const [items,     setItems]     = useState([]);
  const [saving,    setSaving]    = useState(false);

  const addProduct = (p) => {
    if (!items.some(i => i.id === p.id))
      setItems(prev => [...prev, { id: p.id, name: p.name, sku: p.sku || "", qty: 1, unitPrice: Number(p.selling_price || p.cost_price || 0) }]);
  };
  const upd = (id, k, v) => setItems(prev => prev.map(i => i.id === id ? { ...i, [k]: v } : i));
  const subtotal = items.reduce((s, r) => s + r.qty * r.unitPrice, 0);

  const handleSave = async () => {
    if (!customer) { alert("Customer is required."); return; }
    if (items.length === 0) { alert("Add at least one product."); return; }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/sales-invoice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "Sales Invoice", docStatus: "Draft", affectsStock: false,
          invoiceNo: draftNo, invoiceDate: draftDate, customer, warehouse,
          grandTotal: subtotal.toFixed(2), notes, items,
        }),
      });
      if (res.ok) navigate("/sells/drafts");
      else { const e = await res.json(); alert("Error: " + (e.message || "Failed")); }
    } catch (e) { alert("Network error: " + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={PAGE}>
      <PageHeader title="Add Draft" breadcrumb={`Home / Sell / Drafts / New — ${draftNo}`}
        actions={<>
          <GhostBtn label="Cancel" onClick={() => navigate("/sells/drafts")} />
          <PrimaryBtn label={saving ? "Saving..." : "Save Draft"} icon={IC.save} onClick={handleSave} disabled={saving} />
        </>}
      />
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <CardTitle>Draft Details</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div><FL>Draft Number</FL><Inp value={draftNo} onChange={e => setDraftNo(e.target.value)} /></div>
              <div><FL>Draft Date</FL><Inp type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)} /></div>
              <div>
                <FL>Warehouse / Location</FL>
                <Sel value={warehouse} onChange={e => setWarehouse(e.target.value)}>
                  <option>Manod HQ</option><option>Branch - Chennai</option><option>Branch - Coimbatore</option>
                </Sel>
              </div>
            </div>
          </Card>

          <Card>
            <FL required>Customer</FL>
            <CustomerCombobox value={customer} onChange={(name) => setCustomer(name)} customers={customers} />
          </Card>

          <Card style={{ display: "flex", flexDirection: "column" }}>
            <CardTitle>Products</CardTitle>
            <ProductSearchDropdown products={products} onSelect={addProduct} />
            <div style={{ marginTop: 12, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
              {items.length === 0
                ? <div style={{ padding: 28, textAlign: "center", color: TEXT_MUTED, fontSize: 13 }}>Search above to add products</div>
                : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#f8fafc" }}>
                      {["#", "Product", "SKU", "Qty", "Unit Price (Rs.)", "Total (Rs.)", ""].map((h, i) => (
                        <th key={i} style={{ padding: "8px 10px", fontWeight: 600, fontSize: 11, color: TEXT_MUTED, borderBottom: `1px solid ${BORDER}`, textTransform: "uppercase", textAlign: i >= 3 && i <= 5 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {items.map((r, i) => (
                        <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td style={{ padding: "8px 10px", color: TEXT_MUTED, width: 28 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px" }}>{r.name}</td>
                          <td style={{ padding: "8px 10px", color: TEXT_MUTED, fontSize: 11 }}>{r.sku || "—"}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}><NInp value={r.qty} min={1} onChange={e => upd(r.id, "qty", Number(e.target.value))} /></td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>Rs. {fmt(r.unitPrice)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: GREEN }}>Rs. {fmt(r.qty * r.unitPrice)}</td>
                          <td style={{ padding: "8px 6px" }}><IBtn icon={IC.x} onClick={() => setItems(prev => prev.filter(i => i.id !== r.id))} color={RED} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </Card>

          <Card>
            <FL>Notes / Internal Remarks</FL>
            <TextArea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional internal remarks..." rows={2} />
          </Card>
        </div>

        <div style={{ width: 260, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: "#fff", padding: "20px 18px" }}>
          <Card style={{ border: "none", padding: 0 }}>
            <CardTitle>Draft Summary</CardTitle>
            <SumRow label="Total Items" value={items.length} />
            <SumRow label="Subtotal (Est.)" value={`Rs. ${fmt(subtotal)}`} bold />
            <div style={{ marginTop: 14, padding: "12px", background: "#fff3cd", borderRadius: 8, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>Draft Notice</div>
              <div style={{ fontSize: 11, color: "#92400e", marginTop: 4, lineHeight: 1.5 }}>
                Saving as draft will NOT reduce stock or create accounting entries. Convert to invoice when ready.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 6. LIST DRAFTS
// ══════════════════════════════════════════════════════════════
export function ListDrafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("http://localhost:5000/api/sales-invoice?status=Draft");
        if (r.ok) { const d = await r.json(); setDrafts(d.data || []); }
      } catch { setDrafts([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const cols = [
    { label: "Action", center: true }, { label: "Draft No." }, { label: "Draft Date" },
    { label: "Customer" }, { label: "Location" }, { label: "Items" },
    { label: "Total (Rs.)", right: true }, { label: "Status" },
  ];
  const rows = drafts.map((d, i) => (
    <>
      <Td center>
        <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <IBtn icon={IC.eye} title="View" />
          <IBtn icon={IC.edit} title="Edit" />
          <IBtn icon={IC.convert} title="Convert to Invoice" onClick={() => navigate(`/sells/create?from=draft&id=${d.id}`)} />
          <IBtn icon={IC.trash} title="Delete" color={RED} />
        </div>
      </Td>
      <Td mono>{d.invoiceNo || `DRF-${String(i + 1).padStart(4, "0")}`}</Td>
      <Td>{d.invoiceDate || d.date || "—"}</Td>
      <Td>{d.customer || "—"}</Td>
      <Td muted>{d.warehouse || "Manod HQ"}</Td>
      <Td center>{d.items?.length || 0}</Td>
      <Td right><span style={{ fontWeight: 700, color: GREEN }}>Rs. {fmt(d.grandTotal)}</span></Td>
      <Td><Badge status="Draft" /></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="Drafts" breadcrumb="Home / Sell / Drafts"
        actions={<PrimaryBtn label="Add Draft" icon={IC.plus} onClick={() => navigate("/sells/add-draft")} />}
      />
      <div style={{ flex: 1, minHeight: 0, padding: "16px 24px", display: "flex", flexDirection: "column" }}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No drafts saved. Click Add Draft to start."
          footer={<span style={{ fontSize: 12, color: TEXT_MUTED }}>{drafts.length} draft(s) total</span>}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 7. ADD QUOTATION
// ══════════════════════════════════════════════════════════════
export function AddQuotation() {
  const navigate = useNavigate();
  const { products, customers } = useProductsAndCustomers();
  const [quotNo,       setQuotNo]       = useState(() => genNo("QOT"));
  const [quotDate,     setQuotDate]     = useState(new Date().toISOString().slice(0, 10));
  const [validUntil,   setValidUntil]   = useState(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); });
  const [customer,     setCustomer]     = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [salesperson,  setSalesperson]  = useState("");
  const [warehouse,    setWarehouse]    = useState("Manod HQ");
  const [items,        setItems]        = useState([]);
  const [globalDisc,   setGlobalDisc]   = useState(0);
  const [taxRate,      setTaxRate]      = useState(18);
  const [shipping,     setShipping]     = useState(0);
  const [notes,        setNotes]        = useState("");
  const [terms,        setTerms]        = useState("");
  const [docStatus,    setDocStatus]    = useState("Draft");
  const [saving,       setSaving]       = useState(false);

  const addProduct = (p) => {
    if (!items.some(i => i.id === p.id))
      setItems(prev => [...prev, { id: p.id, product: p.name, sku: p.sku || "", qty: 1, unit: "Pcs", unitPrice: Number(p.selling_price || p.cost_price || 0), discount: 0, tax: taxRate }]);
  };
  const upd = (id, k, v) => setItems(prev => prev.map(i => i.id === id ? { ...i, [k]: v } : i));

  const lSub  = r => r.qty * r.unitPrice;
  const lDisc = r => lSub(r) * (r.discount / 100);
  const lTax  = r => (lSub(r) - lDisc(r)) * (r.tax / 100);
  const lTot  = r => lSub(r) - lDisc(r) + lTax(r);
  const subtotal   = items.reduce((s, r) => s + lSub(r), 0);
  const discTotal  = items.reduce((s, r) => s + lDisc(r), 0);
  const globalDA   = (subtotal - discTotal) * (globalDisc / 100);
  const taxTotal   = items.reduce((s, r) => s + lTax(r), 0);
  const grandTotal = subtotal - discTotal - globalDA + taxTotal + Number(shipping);

  const handleSave = async () => {
    if (!customer) { alert("Customer is required."); return; }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/quotations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotNo, quotDate, validUntil, customer, contactPerson, email, phone,
          salesperson, warehouse, docStatus, affectsStock: false,
          globalDisc, taxTotal: taxTotal.toFixed(2), shipping,
          grandTotal: grandTotal.toFixed(2), notes, terms, items,
        }),
      });
      if (res.ok) navigate("/sells/quotations");
      else alert("Failed to save quotation");
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={PAGE}>
      <PageHeader title="New Quotation" breadcrumb={`Home / Sell / Quotations / New — ${quotNo}`}
        actions={<>
          <select value={docStatus} onChange={e => setDocStatus(e.target.value)}
            style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 12px", fontSize: 12, fontFamily: F, background: "#fff", cursor: "pointer" }}>
            {["Draft", "Sent", "Accepted", "Rejected"].map(s => <option key={s}>{s}</option>)}
          </select>
          <GhostBtn label="Cancel" onClick={() => navigate("/sells/quotations")} />
          <PrimaryBtn label={saving ? "Saving..." : "Save Quotation"} icon={IC.save} onClick={handleSave} disabled={saving} />
        </>}
      />
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <CardTitle>Quotation Details</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div><FL>Quotation Number</FL><Inp value={quotNo} onChange={e => setQuotNo(e.target.value)} /></div>
              <div><FL>Quotation Date</FL><Inp type="date" value={quotDate} onChange={e => setQuotDate(e.target.value)} /></div>
              <div><FL>Valid Until</FL><Inp type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} /></div>
              <div>
                <FL>Salesperson</FL>
                <Sel value={salesperson} onChange={e => setSalesperson(e.target.value)}>
                  <option value="">— None —</option>
                  <option>Admin</option><option>Sales Rep</option><option>Cashier</option>
                </Sel>
              </div>
              <div>
                <FL>Warehouse / Location</FL>
                <Sel value={warehouse} onChange={e => setWarehouse(e.target.value)}>
                  <option>Manod HQ</option><option>Branch - Chennai</option><option>Branch - Coimbatore</option>
                </Sel>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Customer Information</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "span 2" }}>
                <FL required>Customer</FL>
                <CustomerCombobox value={customer} onChange={(name) => setCustomer(name)} customers={customers} />
              </div>
              <div><FL>Contact Person</FL><Inp value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Optional" /></div>
              <div><FL>Email</FL><Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="customer@email.com" /></div>
              <div><FL>Phone</FL><Inp value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
            </div>
          </Card>

          <Card>
            <CardTitle>Products</CardTitle>
            <ProductSearchDropdown products={products} onSelect={addProduct} />
            <div style={{ marginTop: 12, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
              {items.length === 0
                ? <div style={{ padding: 28, textAlign: "center", color: TEXT_MUTED, fontSize: 13 }}>Search above to add products</div>
                : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#f8fafc" }}>
                      {["#", "Product", "Qty", "Unit", "Unit Price", "Disc %", "Tax %", "Total", ""].map((h, i) => (
                        <th key={i} style={{ padding: "8px 10px", fontWeight: 600, fontSize: 11, color: TEXT_MUTED, borderBottom: `1px solid ${BORDER}`, textTransform: "uppercase", textAlign: i >= 2 && i <= 7 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {items.map((r, i) => (
                        <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td style={{ padding: "8px 10px", color: TEXT_MUTED, width: 28 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px" }}>{r.product}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}><NInp value={r.qty} min={1} onChange={e => upd(r.id, "qty", Number(e.target.value))} /></td>
                          <td style={{ padding: "8px 10px" }}>
                            <select value={r.unit} onChange={e => upd(r.id, "unit", e.target.value)} style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: "4px 6px", fontSize: 12, fontFamily: F }}>
                              {["Pcs", "Box", "Kg", "L", "Pack", "Set"].map(u => <option key={u}>{u}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}><NInp value={r.unitPrice} width={85} onChange={e => upd(r.id, "unitPrice", Number(e.target.value))} /></td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}><NInp value={r.discount} width={55} max={100} onChange={e => upd(r.id, "discount", Number(e.target.value))} /></td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}><NInp value={r.tax} width={55} max={100} onChange={e => upd(r.id, "tax", Number(e.target.value))} /></td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: GREEN }}>Rs. {fmt(lTot(r))}</td>
                          <td style={{ padding: "8px 6px" }}><IBtn icon={IC.x} onClick={() => setItems(prev => prev.filter(i => i.id !== r.id))} color={RED} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 12 }}>
              <div><FL>Global Discount (%)</FL><Inp type="number" value={globalDisc} onChange={e => setGlobalDisc(Number(e.target.value))} min="0" max="100" /></div>
              <div>
                <FL>Tax Rate (GST %)</FL>
                <Sel value={taxRate} onChange={e => { const v = Number(e.target.value); setTaxRate(v); setItems(p => p.map(i => ({ ...i, tax: v }))); }}>
                  {[0, 5, 12, 18, 28].map(v => <option key={v} value={v}>{v}%</option>)}
                </Sel>
              </div>
              <div><FL>Shipping (Rs.)</FL><Inp type="number" value={shipping} onChange={e => setShipping(e.target.value)} min="0" /></div>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card><FL>Notes</FL><TextArea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for the customer..." rows={3} /></Card>
            <Card><FL>Terms &amp; Conditions</FL><TextArea value={terms} onChange={e => setTerms(e.target.value)} placeholder="Payment terms, delivery conditions..." rows={3} /></Card>
          </div>
        </div>

        <div style={{ width: 260, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: "#fff", padding: "20px 18px" }}>
          <Card style={{ border: "none", padding: 0 }}>
            <CardTitle>Quotation Summary</CardTitle>
            <SumRow label="Subtotal"   value={`Rs. ${fmt(subtotal)}`} />
            <SumRow label="Discount"   value={`- Rs. ${fmt(discTotal + globalDA)}`} color="#ef4444" />
            <SumRow label="Tax (GST)"  value={`+ Rs. ${fmt(taxTotal)}`} color={AMBER} />
            {Number(shipping) > 0 && <SumRow label="Shipping" value={`+ Rs. ${fmt(shipping)}`} />}
            <SumRow label="Grand Total" value={`Rs. ${fmt(grandTotal)}`} big border />
            <div style={{ marginTop: 16, padding: "12px", background: "#dbeafe", borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1e40af" }}>Quotation Notice</div>
              <div style={{ fontSize: 11, color: "#1e40af", marginTop: 4, lineHeight: 1.5 }}>
                This quotation does NOT affect stock or accounting. Convert to Sales Invoice when accepted.
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <GhostBtn label="Print Quotation" icon={IC.print} onClick={() => window.print()} small />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 8. LIST QUOTATIONS
// ══════════════════════════════════════════════════════════════
export function ListQuotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("http://localhost:5000/api/quotations");
        if (r.ok) { const d = await r.json(); setQuotations(d.data || []); }
      } catch { setQuotations([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = quotations.filter(q => !search || `${q.quotNo} ${q.customer}`.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { label: "Action", center: true }, { label: "Quotation No." }, { label: "Date" },
    { label: "Customer" }, { label: "Valid Until" }, { label: "Status" },
    { label: "Total (Rs.)", right: true },
  ];
  const rows = filtered.map((q, i) => (
    <>
      <Td center>
        <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <IBtn icon={IC.eye} title="View" />
          <IBtn icon={IC.edit} title="Edit" />
          <IBtn icon={IC.print} title="Print" />
          <IBtn icon={IC.convert} title="Convert to Invoice" onClick={() => navigate(`/sells/create?from=quotation&id=${q.id}`)} />
          <IBtn icon={IC.trash} title="Delete" color={RED} />
        </div>
      </Td>
      <Td mono>{q.quotNo || `QOT-${String(i + 1).padStart(4, "0")}`}</Td>
      <Td>{q.quotDate || "—"}</Td>
      <Td>{q.customer || "—"}</Td>
      <Td muted>{q.validUntil || "—"}</Td>
      <Td><Badge status={q.docStatus || "Draft"} /></Td>
      <Td right><span style={{ fontWeight: 700, color: GREEN }}>Rs. {fmt(q.grandTotal)}</span></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="Quotations" breadcrumb="Home / Sell / Quotations"
        actions={<PrimaryBtn label="Add Quotation" icon={IC.plus} onClick={() => navigate("/sells/add-quotation")} />}
      />
      <div style={{ flex: 1, minHeight: 0, padding: "16px 24px", display: "flex", flexDirection: "column" }}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No quotations yet. Click Add Quotation to get started."
          topBar={<SearchBox value={search} onChange={setSearch} placeholder="Search quotation or customer..." />}
          footer={<span style={{ fontSize: 12, color: TEXT_MUTED }}>{filtered.length} quotation(s)</span>}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 9. SELL RETURN
// ══════════════════════════════════════════════════════════════
export function SellReturn() {
  const navigate = useNavigate();
  const { customers } = useProductsAndCustomers();
  const [view, setView]       = useState("list");
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnNo,    setReturnNo]    = useState(() => genNo("RTN"));
  const [returnDate,  setReturnDate]  = useState(new Date().toISOString().slice(0, 10));
  const [customer,    setCustomer]    = useState("");
  const [invoiceRef,  setInvoiceRef]  = useState("");
  const [invoiceList, setInvoiceList] = useState([]);
  const [warehouse,   setWarehouse]   = useState("Manod HQ");
  const [reason,      setReason]      = useState("Damaged Product");
  const [notes,       setNotes]       = useState("");
  const [items,       setItems]       = useState([]);
  const [docStatus,   setDocStatus]   = useState("Draft");
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const r = await fetch("http://localhost:5000/api/sales-returns"); if (r.ok) { const d = await r.json(); setReturns(d.data || []); } } catch { setReturns([]); }
      finally { setLoading(false); }
    })();
    (async () => {
      try { const r = await fetch("http://localhost:5000/api/sales-invoice?status=Submitted"); if (r.ok) { const d = await r.json(); setInvoiceList(d.data || []); } } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!invoiceRef) { setItems([]); return; }
    const inv = invoiceList.find(i => i.invoiceNo === invoiceRef);
    if (inv?.items) {
      setItems(inv.items.map(i => ({ ...i, returnQty: 0, maxQty: i.qty, id: i.id || i.product })));
      setCustomer(inv.customer || "");
    }
  }, [invoiceRef, invoiceList]);

  const upd = (id, v) => setItems(prev => prev.map(i => i.id === id ? { ...i, returnQty: Math.min(Number(v), i.maxQty) } : i));
  const selectedItems = items.filter(i => i.returnQty > 0);
  const subtotal   = selectedItems.reduce((s, i) => s + i.returnQty * (i.unitPrice || 0), 0);
  const taxAmt     = subtotal * 0.18;
  const grandTotal = subtotal + taxAmt;

  const handleSave = async () => {
    if (!customer) { alert("Customer is required."); return; }
    if (!invoiceRef) { alert("Reference invoice is required."); return; }
    if (selectedItems.length === 0) { alert("Select at least one item to return."); return; }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/sales-returns", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnNo, returnDate, customer, invoiceRef, warehouse, reason,
          docStatus, affectsStock: docStatus === "Completed",
          taxAmt: taxAmt.toFixed(2), grandTotal: grandTotal.toFixed(2),
          notes, items: selectedItems.map(i => ({ ...i, qty: i.returnQty })),
        }),
      });
      if (res.ok) setView("list");
      else alert("Failed to save return");
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  if (view === "list") {
    const cols = [
      { label: "Action", center: true }, { label: "Return No." }, { label: "Date" },
      { label: "Customer" }, { label: "Reference Invoice" }, { label: "Reason" },
      { label: "Status" }, { label: "Amount (Rs.)", right: true },
    ];
    const rows = returns.map((r, i) => (
      <>
        <Td center>
          <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <IBtn icon={IC.eye} title="View" />
            <IBtn icon={IC.edit} title="Edit" />
            <IBtn icon={IC.print} title="Print" />
          </div>
        </Td>
        <Td mono>{r.returnNo || `RTN-${String(i + 1).padStart(4, "0")}`}</Td>
        <Td>{r.returnDate || "—"}</Td>
        <Td>{r.customer || "—"}</Td>
        <Td mono muted>{r.invoiceRef || "—"}</Td>
        <Td muted>{r.reason || "—"}</Td>
        <Td><Badge status={r.docStatus || "Draft"} /></Td>
        <Td right><span style={{ fontWeight: 700, color: RED }}>- Rs. {fmt(r.grandTotal)}</span></Td>
      </>
    ));
    return (
      <div style={PAGE}>
        <PageHeader title="Sales Returns" breadcrumb="Home / Sell / Returns"
          actions={<PrimaryBtn label="New Return" icon={IC.plus} onClick={() => setView("add")} />}
        />
        <div style={{ flex: 1, minHeight: 0, padding: "16px 24px", display: "flex", flexDirection: "column" }}>
          <TablePage columns={cols} rows={rows} loading={loading} emptyText="No returns recorded yet." />
        </div>
      </div>
    );
  }

  return (
    <div style={PAGE}>
      <PageHeader title="New Sales Return" breadcrumb={`Home / Sell / Returns / New — ${returnNo}`}
        actions={<>
          <select value={docStatus} onChange={e => setDocStatus(e.target.value)}
            style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 12px", fontSize: 12, fontFamily: F, background: "#fff", cursor: "pointer" }}>
            <option value="Draft">Save as Draft</option>
            <option value="Completed">Complete Return</option>
          </select>
          <GhostBtn label="Cancel" onClick={() => setView("list")} />
          <PrimaryBtn label={saving ? "Saving..." : "Save Return"} icon={IC.save} onClick={handleSave} disabled={saving} />
        </>}
      />
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <CardTitle>Return Details</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div><FL>Return Number</FL><Inp value={returnNo} onChange={e => setReturnNo(e.target.value)} /></div>
              <div><FL>Return Date</FL><Inp type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} /></div>
              <div>
                <FL>Warehouse / Location</FL>
                <Sel value={warehouse} onChange={e => setWarehouse(e.target.value)}>
                  <option>Manod HQ</option><option>Branch - Chennai</option><option>Branch - Coimbatore</option>
                </Sel>
              </div>
            </div>
          </Card>
          <Card>
            <CardTitle>Customer &amp; Invoice</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <FL required>Customer</FL>
                <CustomerCombobox value={customer} onChange={(name) => setCustomer(name)} customers={customers} />
              </div>
              <div>
                <FL required>Reference Sales Invoice</FL>
                <Sel value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)}>
                  <option value="">— Select invoice —</option>
                  {invoiceList.map(inv => <option key={inv.id} value={inv.invoiceNo}>{inv.invoiceNo} — {inv.customer}</option>)}
                </Sel>
              </div>
              <div>
                <FL>Return Reason</FL>
                <Sel value={reason} onChange={e => setReason(e.target.value)}>
                  {["Damaged Product", "Wrong Product Delivered", "Quality Issue", "Customer Rejection", "Other"].map(r => <option key={r}>{r}</option>)}
                </Sel>
              </div>
              <div><FL>Notes / Remarks</FL><Inp value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional..." /></div>
            </div>
          </Card>
          <Card>
            <CardTitle>Products to Return</CardTitle>
            {items.length === 0 ? (
              <div style={{ padding: "28px", textAlign: "center", color: TEXT_MUTED, fontSize: 13 }}>
                Select a reference invoice above to auto-load products
              </div>
            ) : (
              <>
                <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#854d0e" }}>
                  Enter the return quantity for each item. Cannot exceed original quantity sold.
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#f8fafc" }}>
                    {["Product", "SKU", "Original Qty", "Return Qty", "Unit Price (Rs.)", "Return Total (Rs.)"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 10px", fontWeight: 600, fontSize: 11, color: TEXT_MUTED, borderBottom: `1px solid ${BORDER}`, textTransform: "uppercase", textAlign: i >= 2 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {items.map(r => (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}`, background: r.returnQty > 0 ? "#fef2f2" : "#fff" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600 }}>{r.product || r.name}</td>
                        <td style={{ padding: "8px 10px", color: TEXT_MUTED, fontSize: 11 }}>{r.sku || "—"}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>{r.maxQty || r.qty}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}><NInp value={r.returnQty} min={0} max={r.maxQty || r.qty} onChange={e => upd(r.id, e.target.value)} width={65} /></td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>Rs. {fmt(r.unitPrice || 0)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: r.returnQty > 0 ? RED : TEXT_MUTED }}>
                          {r.returnQty > 0 ? `- Rs. ${fmt(r.returnQty * (r.unitPrice || 0))}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Card>
        </div>
        <div style={{ width: 260, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: "#fff", padding: "20px 18px" }}>
          <Card style={{ border: "none", padding: 0 }}>
            <CardTitle>Return Summary</CardTitle>
            <SumRow label="Items to Return" value={selectedItems.length} />
            <SumRow label="Subtotal"        value={`Rs. ${fmt(subtotal)}`} />
            <SumRow label="Tax (GST 18%)"   value={`Rs. ${fmt(taxAmt)}`} color={AMBER} />
            <SumRow label="Total Refund"    value={`Rs. ${fmt(grandTotal)}`} big border color={RED} />
            <div style={{ marginTop: 16, padding: "12px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: RED }}>Return Notice</div>
              <div style={{ fontSize: 11, color: "#991b1b", marginTop: 4, lineHeight: 1.5 }}>
                Completing a return will increase stock automatically and generate a credit note for the customer.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 10. SHIPMENTS — Full list + Add Shipment form
// ══════════════════════════════════════════════════════════════
export function Shipments() {
  const navigate = useNavigate();
  const { customers } = useProductsAndCustomers();
  const [view, setView]         = useState("list");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  // Add Shipment form state
  const [shipNo,      setShipNo]      = useState(() => genNo("SHP"));
  const [shipDate,    setShipDate]    = useState(new Date().toISOString().slice(0, 10));
  const [customer,    setCustomer]    = useState("");
  const [invoiceRef,  setInvoiceRef]  = useState("");
  const [invoiceList, setInvoiceList] = useState([]);
  const [carrier,     setCarrier]     = useState("FedEx");
  const [trackingNo,  setTrackingNo]  = useState("");
  const [warehouse,   setWarehouse]   = useState("Manod HQ");
  const [deliveryAddr,setDeliveryAddr]= useState("");
  const [estimatedDel,setEstimatedDel]= useState("");
  const [weight,      setWeight]      = useState("");
  const [shipCost,    setShipCost]    = useState(0);
  const [notes,       setNotes]       = useState("");
  const [shipStatus,  setShipStatus]  = useState("Pending");
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const r = await fetch("http://localhost:5000/api/shipments"); if (r.ok) { const d = await r.json(); setShipments(d.data || []); } } catch { setShipments([]); }
      finally { setLoading(false); }
    })();
    (async () => {
      try { const r = await fetch("http://localhost:5000/api/sales-invoice?status=Submitted"); if (r.ok) { const d = await r.json(); setInvoiceList(d.data || []); } } catch {}
    })();
  }, []);

  const filtered = shipments.filter(s => !search || `${s.shipmentNo} ${s.customer}`.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!customer) { alert("Customer is required."); return; }
    if (!invoiceRef) { alert("Reference invoice is required."); return; }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/shipments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentNo: shipNo, date: shipDate, customer, invoiceRef,
          carrier, trackingNo, warehouse, deliveryAddress: deliveryAddr,
          estimatedDelivery: estimatedDel, weight, shippingCost: shipCost,
          status: shipStatus, notes,
        }),
      });
      if (res.ok) {
        setView("list");
        // Refresh list
        try { const r = await fetch("http://localhost:5000/api/shipments"); if (r.ok) { const d = await r.json(); setShipments(d.data || []); } } catch {}
      } else alert("Failed to create shipment");
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  if (view === "add") {
    return (
      <div style={PAGE}>
        <PageHeader title="New Shipment" breadcrumb={`Home / Sell / Shipments / New — ${shipNo}`}
          actions={<>
            <select value={shipStatus} onChange={e => setShipStatus(e.target.value)}
              style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 12px", fontSize: 12, fontFamily: F, background: "#fff", cursor: "pointer" }}>
              {["Pending", "Shipped", "In Transit", "Delivered", "Cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
            <GhostBtn label="Cancel" onClick={() => setView("list")} />
            <PrimaryBtn label={saving ? "Saving..." : "Create Shipment"} icon={IC.save} onClick={handleSave} disabled={saving} />
          </>}
        />
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Card>
              <CardTitle>Shipment Details</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div><FL>Shipment Number</FL><Inp value={shipNo} onChange={e => setShipNo(e.target.value)} /></div>
                <div><FL>Ship Date</FL><Inp type="date" value={shipDate} onChange={e => setShipDate(e.target.value)} /></div>
                <div>
                  <FL>Warehouse / Origin</FL>
                  <Sel value={warehouse} onChange={e => setWarehouse(e.target.value)}>
                    <option>Manod HQ</option><option>Branch - Chennai</option><option>Branch - Coimbatore</option>
                  </Sel>
                </div>
                <div><FL>Estimated Delivery</FL><Inp type="date" value={estimatedDel} onChange={e => setEstimatedDel(e.target.value)} /></div>
                <div>
                  <FL required>Carrier / Courier</FL>
                  <Sel value={carrier} onChange={e => setCarrier(e.target.value)}>
                    {["FedEx", "DHL", "Blue Dart", "DTDC", "India Post", "Delhivery", "Ecom Express", "XpressBees", "Other"].map(c => <option key={c}>{c}</option>)}
                  </Sel>
                </div>
                <div><FL>Tracking Number</FL><Inp value={trackingNo} onChange={e => setTrackingNo(e.target.value)} placeholder="AWB / Tracking ID" /></div>
              </div>
            </Card>

            <Card>
              <CardTitle>Customer &amp; Invoice</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FL required>Customer</FL>
                  <CustomerCombobox value={customer} onChange={(name) => setCustomer(name)} customers={customers} />
                </div>
                <div>
                  <FL required>Reference Sales Invoice</FL>
                  <Sel value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)}>
                    <option value="">— Select invoice —</option>
                    {invoiceList.map(inv => <option key={inv.id} value={inv.invoiceNo}>{inv.invoiceNo} — {inv.customer}</option>)}
                  </Sel>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <FL>Delivery Address</FL>
                  <TextArea value={deliveryAddr} onChange={e => setDeliveryAddr(e.target.value)} placeholder="Full delivery address..." rows={2} />
                </div>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card>
                <CardTitle>Shipping Details</CardTitle>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <FL>Weight (kg)</FL>
                    <Inp type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.00" min="0" />
                  </div>
                  <div>
                    <FL>Shipping Cost (Rs.)</FL>
                    <Inp type="number" value={shipCost} onChange={e => setShipCost(e.target.value)} placeholder="0.00" min="0" />
                  </div>
                </div>
              </Card>
              <Card>
                <FL>Notes / Instructions</FL>
                <TextArea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Fragile, handle with care, etc..." rows={3} />
              </Card>
            </div>
          </div>

          {/* Summary */}
          <div style={{ width: 260, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: "#fff", padding: "20px 18px" }}>
            <Card style={{ border: "none", padding: 0 }}>
              <CardTitle>Shipment Summary</CardTitle>
              {[
                { label: "Shipment No.", value: shipNo },
                { label: "Carrier",      value: carrier },
                { label: "Status",       value: <Badge status={shipStatus} /> },
                { label: "Ship Date",    value: shipDate },
                { label: "Est. Delivery",value: estimatedDel || "—" },
                { label: "Weight",       value: weight ? `${weight} kg` : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                  <span style={{ color: TEXT_MUTED }}>{label}</span>
                  <span style={{ fontWeight: 600, color: TEXT_MAIN }}>{value}</span>
                </div>
              ))}
              {Number(shipCost) > 0 && (
                <div style={{ marginTop: 12, padding: "10px 12px", background: LIGHT_GRN, borderRadius: 8, border: `1px solid #a7f3d0` }}>
                  <div style={{ fontSize: 12, color: TEXT_MUTED }}>Shipping Cost</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>Rs. {fmt(shipCost)}</div>
                </div>
              )}
              {trackingNo && (
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#dbeafe", borderRadius: 8, border: `1px solid #bfdbfe` }}>
                  <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 600 }}>Tracking No.</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginTop: 4, wordBreak: "break-all" }}>{trackingNo}</div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // List view
  const cols = [
    { label: "Action", center: true }, { label: "Shipment No." }, { label: "Date" },
    { label: "Customer" }, { label: "Invoice Ref." }, { label: "Carrier" },
    { label: "Tracking No." }, { label: "Est. Delivery" }, { label: "Status" },
  ];
  const rows = filtered.map((s, i) => (
    <>
      <Td center>
        <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <IBtn icon={IC.eye} title="View" />
          <IBtn icon={IC.edit} title="Edit" />
          <IBtn icon={IC.print} title="Print Shipping Label" />
          <IBtn icon={IC.trash} title="Delete" color={RED} />
        </div>
      </Td>
      <Td mono>{s.shipmentNo || `SHP-${String(i + 1).padStart(4, "0")}`}</Td>
      <Td>{s.date || "—"}</Td>
      <Td>{s.customer || "—"}</Td>
      <Td mono muted>{s.invoiceRef || "—"}</Td>
      <Td muted>{s.carrier || "—"}</Td>
      <Td mono muted>{s.trackingNo || "—"}</Td>
      <Td muted>{s.estimatedDelivery || "—"}</Td>
      <Td><Badge status={s.status || "Pending"} /></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="Shipments" breadcrumb="Home / Sell / Shipments"
        actions={<PrimaryBtn label="New Shipment" icon={IC.truck} onClick={() => setView("add")} />}
      />
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 14, flexShrink: 0 }}>
        <StatCard label="Total Shipments" value={shipments.length} sub="All time" accent={GREEN} />
        <StatCard label="Pending" value={shipments.filter(s => s.status === "Pending").length} sub="Awaiting dispatch" accent={AMBER} />
        <StatCard label="In Transit" value={shipments.filter(s => s.status === "Shipped" || s.status === "In Transit").length} sub="On the way" accent="#6366f1" />
        <StatCard label="Delivered" value={shipments.filter(s => s.status === "Delivered").length} sub="Completed" accent="#22c55e" />
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: "14px 24px", display: "flex", flexDirection: "column" }}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No shipments yet. Click New Shipment to create one."
          topBar={<SearchBox value={search} onChange={setSearch} placeholder="Search shipment or customer..." />}
          footer={<span style={{ fontSize: 12, color: TEXT_MUTED }}>{filtered.length} shipment(s)</span>}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 11. DISCOUNTS — Full list + Add Discount form
// ══════════════════════════════════════════════════════════════
export function Discounts() {
  const [view, setView]         = useState("list");
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Add form state
  const [discName,    setDiscName]    = useState("");
  const [discCode,    setDiscCode]    = useState(() => `DISC${Date.now().toString().slice(-4)}`);
  const [discType,    setDiscType]    = useState("Percentage");
  const [discValue,   setDiscValue]   = useState(0);
  const [appliesTo,   setAppliesTo]   = useState("All Products");
  const [minOrder,    setMinOrder]    = useState(0);
  const [maxUses,     setMaxUses]     = useState("");
  const [validFrom,   setValidFrom]   = useState(new Date().toISOString().slice(0, 10));
  const [validTo,     setValidTo]     = useState(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); });
  const [custGroup,   setCustGroup]   = useState("All");
  const [discStatus,  setDiscStatus]  = useState("Active");
  const [desc,        setDesc]        = useState("");
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const r = await fetch("http://localhost:5000/api/discounts"); if (r.ok) { const d = await r.json(); setDiscounts(d.data || []); } } catch { setDiscounts([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    if (!discName) { alert("Discount name is required."); return; }
    if (!discValue) { alert("Discount value is required."); return; }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/discounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: discName, code: discCode, type: discType, value: discValue,
          appliesTo, minOrderAmount: minOrder, maxUses, validFrom, validTo,
          customerGroup: custGroup, status: discStatus, description: desc,
        }),
      });
      if (res.ok) {
        setView("list");
        try { const r = await fetch("http://localhost:5000/api/discounts"); if (r.ok) { const d = await r.json(); setDiscounts(d.data || []); } } catch {}
      } else alert("Failed to save discount");
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  if (view === "add") {
    return (
      <div style={PAGE}>
        <PageHeader title="New Discount" breadcrumb="Home / Sell / Discounts / New"
          actions={<>
            <select value={discStatus} onChange={e => setDiscStatus(e.target.value)}
              style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 12px", fontSize: 12, fontFamily: F, background: "#fff", cursor: "pointer" }}>
              {["Active", "Inactive", "Draft"].map(s => <option key={s}>{s}</option>)}
            </select>
            <GhostBtn label="Cancel" onClick={() => setView("list")} />
            <PrimaryBtn label={saving ? "Saving..." : "Save Discount"} icon={IC.tag} onClick={handleSave} disabled={saving} />
          </>}
        />
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Card>
              <CardTitle>Discount Information</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FL required>Discount Name</FL>
                  <Inp value={discName} onChange={e => setDiscName(e.target.value)} placeholder="e.g. Summer Sale 20%" />
                </div>
                <div>
                  <FL>Discount Code (Coupon)</FL>
                  <Inp value={discCode} onChange={e => setDiscCode(e.target.value.toUpperCase())} placeholder="SUMMER20" />
                </div>
                <div>
                  <FL required>Discount Type</FL>
                  <Sel value={discType} onChange={e => setDiscType(e.target.value)}>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (Rs.)</option>
                    <option value="Buy X Get Y">Buy X Get Y</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </Sel>
                </div>
                <div>
                  <FL required>Discount Value {discType === "Percentage" ? "(%)" : discType === "Fixed Amount" ? "(Rs.)" : ""}</FL>
                  <Inp type="number" value={discValue} onChange={e => setDiscValue(e.target.value)} placeholder="0" min="0" max={discType === "Percentage" ? "100" : undefined} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <FL>Description</FL>
                  <TextArea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description for this discount..." rows={2} />
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle>Applicability &amp; Rules</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FL>Applies To</FL>
                  <Sel value={appliesTo} onChange={e => setAppliesTo(e.target.value)}>
                    {["All Products", "Specific Category", "Specific Product", "Specific Brand"].map(o => <option key={o}>{o}</option>)}
                  </Sel>
                </div>
                <div>
                  <FL>Customer Group</FL>
                  <Sel value={custGroup} onChange={e => setCustGroup(e.target.value)}>
                    {["All", "Walk-In", "Retail", "Wholesale", "VIP"].map(o => <option key={o}>{o}</option>)}
                  </Sel>
                </div>
                <div>
                  <FL>Minimum Order Amount (Rs.)</FL>
                  <Inp type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="0" min="0" />
                </div>
                <div>
                  <FL>Max Uses (leave blank for unlimited)</FL>
                  <Inp type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Unlimited" min="1" />
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle>Validity Period</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><FL required>Valid From</FL><Inp type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} /></div>
                <div><FL required>Valid Until</FL><Inp type="date" value={validTo} onChange={e => setValidTo(e.target.value)} /></div>
              </div>
            </Card>
          </div>

          {/* Summary */}
          <div style={{ width: 260, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: "#fff", padding: "20px 18px" }}>
            <Card style={{ border: "none", padding: 0 }}>
              <CardTitle>Discount Preview</CardTitle>
              <div style={{ textAlign: "center", padding: "20px 0", borderBottom: `1px solid ${BORDER}`, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>Coupon Code</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: GREEN, letterSpacing: 2, background: LIGHT_GRN, padding: "10px 16px", borderRadius: 8, border: `1px dashed #a7f3d0` }}>
                  {discCode || "—"}
                </div>
              </div>
              {[
                { label: "Type",        value: discType },
                { label: "Value",       value: discType === "Percentage" ? `${discValue}%` : `Rs. ${fmt(discValue)}` },
                { label: "Applies To",  value: appliesTo },
                { label: "For Group",   value: custGroup },
                { label: "Min Order",   value: minOrder > 0 ? `Rs. ${fmt(minOrder)}` : "None" },
                { label: "Max Uses",    value: maxUses || "Unlimited" },
                { label: "Valid From",  value: validFrom || "—" },
                { label: "Valid To",    value: validTo || "—" },
                { label: "Status",      value: <Badge status={discStatus} /> },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                  <span style={{ color: TEXT_MUTED }}>{label}</span>
                  <span style={{ fontWeight: 600, color: TEXT_MAIN }}>{value}</span>
                </div>
              ))}

              {discType === "Percentage" && discValue > 0 && (
                <div style={{ marginTop: 14, padding: "12px", background: LIGHT_GRN, borderRadius: 8, border: `1px solid #a7f3d0` }}>
                  <div style={{ fontSize: 11, color: TEXT_MUTED }}>Example: Rs. 1,000 order</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: GREEN, marginTop: 4 }}>
                    <span>Customer saves</span>
                    <span>Rs. {fmt(1000 * discValue / 100)}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const cols = [
    { label: "Action", center: true }, { label: "Name" }, { label: "Code" },
    { label: "Type" }, { label: "Value" }, { label: "Applies To" },
    { label: "Valid From" }, { label: "Valid To" }, { label: "Max Uses" }, { label: "Status" },
  ];
  const rows = discounts.map(d => (
    <>
      <Td center>
        <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <IBtn icon={IC.eye} title="View" />
          <IBtn icon={IC.edit} title="Edit" />
          <IBtn icon={IC.trash} title="Delete" color={RED} />
        </div>
      </Td>
      <Td><span style={{ fontWeight: 600 }}>{d.name || "—"}</span></Td>
      <Td mono><span style={{ background: LIGHT_GRN, color: GREEN, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{d.code || "—"}</span></Td>
      <Td muted>{d.type || "Percentage"}</Td>
      <Td><span style={{ fontWeight: 700, color: d.type === "Percentage" ? GREEN : TEXT_MAIN }}>{d.type === "Percentage" ? `${d.value}%` : `Rs. ${fmt(d.value)}`}</span></Td>
      <Td muted>{d.appliesTo || "All Products"}</Td>
      <Td muted>{d.validFrom || "—"}</Td>
      <Td muted>{d.validTo || "—"}</Td>
      <Td center muted>{d.maxUses || "∞"}</Td>
      <Td><Badge status={d.status || "Draft"} /></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="Discounts" breadcrumb="Home / Sell / Discounts"
        actions={<PrimaryBtn label="New Discount" icon={IC.tag} onClick={() => setView("add")} />}
      />
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 14, flexShrink: 0 }}>
        <StatCard label="Total Discounts" value={discounts.length} sub="All campaigns" accent={GREEN} />
        <StatCard label="Active" value={discounts.filter(d => d.status === "Active").length} sub="Currently running" accent="#22c55e" />
        <StatCard label="Inactive" value={discounts.filter(d => d.status === "Inactive").length} sub="Paused" accent={AMBER} />
        <StatCard label="Draft" value={discounts.filter(d => d.status === "Draft").length} sub="Not published" accent={TEXT_MUTED} />
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: "14px 24px", display: "flex", flexDirection: "column" }}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No discounts configured yet. Click New Discount to create one."
          footer={<span style={{ fontSize: 12, color: TEXT_MUTED }}>{discounts.length} discount(s)</span>}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 12. IMPORT SALES
// ══════════════════════════════════════════════════════════════
export function ImportSales() {
  const [file, setFile]         = useState(null);
  const [status, setStatus]     = useState("");
  const [dragging, setDragging] = useState(false);

  const handleImport = async () => {
    if (!file) { alert("Select a CSV or Excel file first."); return; }
    setStatus("Importing...");
    setTimeout(() => setStatus("Import complete — 0 records processed (demo mode)"), 1500);
  };

  return (
    <div style={PAGE}>
      <PageHeader title="Import Sales" breadcrumb="Home / Sell / Import Sales" />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Card>
            <CardTitle>Upload File</CardTitle>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
              style={{
                border: `2px dashed ${dragging ? GREEN : BORDER}`, borderRadius: 10, padding: "40px 24px",
                textAlign: "center", background: dragging ? LIGHT_GRN : "#fafafa", transition: "all 0.2s",
              }}
            >
              {IC.csv}
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_MAIN, marginBottom: 4, marginTop: 12 }}>Drag and drop file here</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16 }}>Supported: CSV, XLSX</div>
              <label style={{ cursor: "pointer", padding: "8px 20px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 13, fontFamily: F, fontWeight: 500 }}>
                Browse File
                <input type="file" accept=".csv,.xlsx" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
              </label>
              {file && <div style={{ marginTop: 12, fontSize: 12, color: GREEN, fontWeight: 600 }}>Selected: {file.name}</div>}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <PrimaryBtn label="Import" icon={IC.csv} onClick={handleImport} />
              <GhostBtn label="Download Template" icon={IC.csv} />
            </div>
            {status && <div style={{ marginTop: 12, fontSize: 13, color: GREEN, fontWeight: 600, padding: "10px 14px", background: LIGHT_GRN, borderRadius: 6, border: "1px solid #a7f3d0" }}>{status}</div>}
          </Card>
        </div>
        <div style={{ width: 280, flexShrink: 0 }}>
          <Card>
            <CardTitle>Required Columns</CardTitle>
            {["Date", "Customer Name", "Invoice No.", "Product Name", "SKU", "Qty", "Unit Price (Rs.)", "Discount %", "Tax %", "Payment Method", "Payment Status"].map((col, i) => (
              <div key={col} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 10 ? `1px solid ${BORDER}` : "none", fontSize: 13 }}>
                <span style={{ width: 22, height: 22, background: LIGHT_GRN, color: GREEN, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span>{col}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AllSales;
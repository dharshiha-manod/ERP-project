// ════════════════════════════════════════════════════════════════════════════════
// src/pages/Sell.jsx  —  Advanced Sell Module v6
// v6 FIXES over v5:
//   • Action column moved to the END of every table (was first)
//   • fmtDate() — all dates render as DD/MM/YYYY, never raw timestamps
//   • autoComplete="off" on typeable search boxes (stops browser's own
//     "Saved info" autofill popup from covering the real dropdown)
//   • View / Edit / Delete are now functional on every list page
//     (Edit opens a save-able popup instead of a dead route)
//   • Export CSV on All Sales works
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import registerAPI from "../api/registerAPI";
import { useBusiness } from "../context/BusinessContext";
import * as settingsAPI from "../api/settingsAPI";
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

const PAGE = {
  fontFamily: F, display: "flex", flexDirection: "column",
  height: "calc(100vh - 130px)", overflow: "hidden", background: BG,
};

// ── Central API fetch — tries multiple ports, sends auth token ────────────────
const BASES = [
  "http://localhost:5000/api",
  "http://localhost:3000/api",
  "http://127.0.0.1:5000/api",
];
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("manod_token");
  for (const base of BASES) {
    try {
      const r = await fetch(`${base}${path}`, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) return await r.json();
      const errBody = await r.json().catch(() => ({}));
      const msg = errBody.message || errBody.error || `HTTP ${r.status}`;
      console.error(`[apiFetch] ${path} failed (${r.status}):`, msg);
      return { __error: true, status: r.status, message: msg }; // caller can now tell WHY it failed
    } catch (e) {
      if (e.message && !e.message.includes("Failed to fetch")) throw e;
      /* network-level failure only — try next base */
    }
  }
  return null;
}
// ── Module-level cache so products only load once per session ─────────────────
const _cache = {};

function useAPI(path) {
  const [data,    setData]    = useState(_cache[path] || null);
  const [loading, setLoading] = useState(!_cache[path]);

  useEffect(() => {
    if (_cache[path]) { setData(_cache[path]); setLoading(false); return; }
    setLoading(true);
    apiFetch(path).then(d => {
      if (d) { _cache[path] = d; setData(d); }
      setLoading(false);
    });
  }, [path]);

  const refresh = useCallback(() => {
    delete _cache[path];
    setLoading(true);
    apiFetch(path).then(d => { if (d) { _cache[path] = d; setData(d); } setLoading(false); });
  }, [path]);

  return { data, loading, refresh };
}

// ── Typed shortcuts ───────────────────────────────────────────────────────────
function useProducts() {
  const { data, loading } = useAPI("/products");
  const raw = data?.data || data?.products || [];
  const products = raw.map(p => ({
    ...p,
    name: p.name || p.product_name || p.title || "Unnamed Product",
    selling_price: Number(p.exc_tax_sell || p.selling_price || p.sale_price || p.price || p.cost_price || 0),
    purchase_price: Number(p.exc_tax || p.purchase_price || p.cost || 0),
    stock: p.current_stock ?? p.stock ?? p.quantity ?? p.stock_quantity ?? 0,
  }));
  return { products, loading };
}
function useCustomers() {
  const { data, loading } = useAPI("/contacts?contactType=Customers");
  const customers = data?.data || data?.contacts || [];
  return { customers, loading };
}
function useInvoices() {
  const { data, loading } = useAPI("/sales-invoice?status=Submitted");
  return { invoices: data?.data || [], loading };
}
// ── NEW: brands / categories for the Discounts "Applies To" selector ──────────
function useBrands() {
  const { data, loading } = useAPI("/products/brands");
  const brands = data?.data || data?.brands || [];
  return { brands, loading };
}
function useCategories() {
  const { data, loading } = useAPI("/products/categories");
  const categories = data?.data || data?.categories || [];
  return { categories, loading };
}
function useSellingPriceGroups() {
  const { data, loading } = useAPI("/selling-price-groups");
  const groups = data?.groups || data?.data || [];
  return { groups, loading };
}
function useLocations() {
  const { data, loading } = useAPI("/settings/locations");
  const locations = data?.data || [];
  return { locations, loading };
}
function useTaxRates() {
  const { data, loading } = useAPI("/settings/tax-rates");
  const taxRates = data?.data || [];
  return { taxRates, loading };
}
function useInvoiceSettings() {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    settingsAPI.getInvoiceSettings().then(res => {
      if (res?.success && res.data) setSettings(res.data);
    });
  }, []);
  return settings;
}
// Builds e.g. "IN-00001" from saved prefix/digits/separator/start number.
// Falls back to the old random genNo() pattern if settings haven't loaded yet.
function buildInvoiceNo(settings, fallbackPrefix = "INV") {
  if (!settings) return genNo(fallbackPrefix);
  const prefix = settings.invoice_prefix || fallbackPrefix;
  const digits = Number(settings.number_digits) || 5;
  const sep = settings.separator ?? "-";
  const start = Number(settings.invoice_start_number) || 1;
  const padded = String(start).padStart(digits, "0");
  return sep ? `${prefix}${sep}${padded}` : `${prefix}${padded}`;
}
// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt   = n  => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const genNo = px => `${px}-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}${Math.floor(Math.random()*900+100)}`;

// Formats any date value (ISO timestamp, "YYYY-MM-DD", or already-formatted
// string) down to a plain DD/MM/YYYY — fixes dates showing raw time/timezone.
const fmtDate = d => {
  if (!d) return "—";
  const s = String(d);
  // already formatted like "2/7/2026" or "02-07-2026" — leave as-is
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s)) return s;
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return s.slice(0, 10);
  return dt.toLocaleDateString("en-IN");
};

// ── NEW: customer type options — used everywhere a Customer Type dropdown
// appears (Add Sale, Add Quotation, All Sales edit popup, etc.) ───────────────
const CUSTOMER_TYPES = [
  "Walk-In",
  "Retail Shop",
  "Wholesale Business",
  "Manufacturing Company",
  "Trading Company",
  "Distribution Company",
];

// ═══════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════

const PageHeader = ({ title, breadcrumb, actions }) => (
  <div style={{ background:"#fff", borderBottom:`1px solid ${BORDER}`, padding:"14px 24px",
    display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexShrink:0 }}>
    <div>
      <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:TEXT_MAIN }}>{title}</h2>
      {breadcrumb && <div style={{ fontSize:12, color:TEXT_MUTED, marginTop:2 }}>{breadcrumb}</div>}
    </div>
    <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>{actions}</div>
  </div>
);

const StatCard = ({ label, value, sub, accent, onClick, active }) => (
  <div onClick={onClick} style={{ background:active?LIGHT_GRN:"#fff",
    border:`1px solid ${active?(accent||GREEN):BORDER}`, borderRadius:10,
    borderLeft:`4px solid ${accent||GREEN}`, padding:"16px 20px", flex:1, minWidth:0,
    cursor:onClick?"pointer":"default", transition:"all 0.15s",
    boxShadow:active?`0 0 0 1px ${accent||GREEN}`:"none" }}
    onMouseEnter={e=>{ if(onClick && !active) e.currentTarget.style.background="#fafafa"; }}
    onMouseLeave={e=>{ if(onClick && !active) e.currentTarget.style.background="#fff"; }}>
    <div style={{ fontSize:11, fontWeight:600, color:TEXT_MUTED, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
    <div style={{ fontSize:24, fontWeight:700, color:TEXT_MAIN, margin:"6px 0 2px" }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:TEXT_MUTED }}>{sub}</div>}
  </div>
);

const BADGE_MAP = {
  Paid:{bg:"#d1fae5",color:"#065f46",border:"#a7f3d0"},
  Unpaid:{bg:"#fee2e2",color:"#991b1b",border:"#fecaca"},
  Partial:{bg:"#fef9c3",color:"#854d0e",border:"#fde68a"},
  Draft:{bg:"#e0e7ff",color:"#3730a3",border:"#c7d2fe"},
  Submitted:{bg:"#d1fae5",color:"#065f46",border:"#a7f3d0"},
  Completed:{bg:"#d1fae5",color:"#065f46",border:"#a7f3d0"},
  Cancelled:{bg:"#fee2e2",color:"#991b1b",border:"#fecaca"},
  Sent:{bg:"#dbeafe",color:"#1e40af",border:"#bfdbfe"},
  Accepted:{bg:"#d1fae5",color:"#065f46",border:"#a7f3d0"},
  Rejected:{bg:"#fee2e2",color:"#991b1b",border:"#fecaca"},
  Shipped:{bg:"#dbeafe",color:"#1e40af",border:"#bfdbfe"},
  Delivered:{bg:"#d1fae5",color:"#065f46",border:"#a7f3d0"},
  Pending:{bg:"#fef9c3",color:"#854d0e",border:"#fde68a"},
  Active:{bg:"#d1fae5",color:"#065f46",border:"#a7f3d0"},
  Inactive:{bg:"#f1f5f9",color:"#475569",border:"#e2e8f0"},
  "Walk-In":{bg:"#e0e7ff",color:"#3730a3",border:"#c7d2fe"},
  Retail:{bg:"#dbeafe",color:"#1e40af",border:"#bfdbfe"},
  Wholesale:{bg:"#fef9c3",color:"#854d0e",border:"#fde68a"},
  "Retail Shop":{bg:"#dbeafe",color:"#1e40af",border:"#bfdbfe"},
  "Wholesale Business":{bg:"#fef9c3",color:"#854d0e",border:"#fde68a"},
  "Manufacturing Company":{bg:"#ede9fe",color:"#5b21b6",border:"#ddd6fe"},
  "Trading Company":{bg:"#fce7f3",color:"#9d174d",border:"#fbcfe8"},
  "Distribution Company":{bg:"#e0f2fe",color:"#075985",border:"#bae6fd"},
  Refunded:{bg:"#d1fae5",color:"#065f46",border:"#a7f3d0"},
};
const Badge = ({ status }) => {
  const s = BADGE_MAP[status] || { bg:"#f1f5f9", color:"#475569", border:"#e2e8f0" };
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, display:"inline-block" }}>{status}</span>
  );
};

const Th = ({ children, right, center }) => (
  <th style={{ padding:"9px 14px", textAlign:right?"right":center?"center":"left",
    fontSize:11, fontWeight:700, color:TEXT_MUTED, background:"#f8fafc",
    borderBottom:`2px solid ${BORDER}`, whiteSpace:"nowrap",
    letterSpacing:"0.4px", textTransform:"uppercase" }}>{children}</th>
);
const Td = ({ children, right, center, mono, muted, onClick, style:s }) => (
  <td onClick={onClick} style={{ padding:"10px 14px", fontSize:13,
    textAlign:right?"right":center?"center":"left",
    fontFamily:mono?"'JetBrains Mono','Courier New',monospace":F,
    borderBottom:`1px solid ${BORDER}`, color:muted?TEXT_MUTED:TEXT_MAIN,
    cursor:onClick?"pointer":undefined, ...s }}>{children}</td>
);

const PrimaryBtn = ({ label, onClick, icon, disabled, type="button", small }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{
    padding:small?"6px 12px":"8px 18px",
    background:disabled?"#94a3b8":GREEN_GRAD, color:"#fff",
    border:"none", borderRadius:8, fontSize:small?12:13,
    cursor:disabled?"not-allowed":"pointer", fontFamily:F, fontWeight:600,
    display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
    {icon&&<span>{icon}</span>}{label}
  </button>
);
const GhostBtn = ({ label, onClick, icon, small }) => (
  <button onClick={onClick} style={{ padding:small?"6px 12px":"8px 16px",
    background:"#fff", color:TEXT_MAIN, border:`1px solid ${BORDER}`,
    borderRadius:8, fontSize:small?12:13, cursor:"pointer",
    fontFamily:F, fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
    {icon&&<span>{icon}</span>}{label}
  </button>
);
const IBtn = ({ icon, onClick, color=TEXT_MUTED, title }) => (
  <button title={title} onClick={onClick} style={{ background:"none", border:"none",
    cursor:"pointer", color, padding:"4px 6px", borderRadius:4,
    display:"inline-flex", alignItems:"center" }}
    onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
    onMouseLeave={e=>e.currentTarget.style.background="none"}>{icon}</button>
);

const IC = {
  eye:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  trash:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  print:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  convert:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a6b3f" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  save:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  csv:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  tag:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  truck:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  close:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  box:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
};

const Inp = ({ value, onChange, placeholder, type="text", readOnly, min, max, style:s }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    readOnly={readOnly} min={min} max={max}
    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:6, padding:"7px 10px",
      fontSize:13, fontFamily:F, background:readOnly?"#f8fafc":"#fff",
      color:TEXT_MAIN, outline:"none", boxSizing:"border-box", ...s }}
    onFocus={e=>{ if(!readOnly) e.target.style.borderColor=GREEN; }}
    onBlur={e=>{ e.target.style.borderColor=BORDER; }}
  />
);
const Sel = ({ value, onChange, children, style:s }) => (
  <select value={value} onChange={onChange}
    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:6, padding:"7px 10px",
      fontSize:13, fontFamily:F, background:"#fff", color:TEXT_MAIN,
      outline:"none", cursor:"pointer", boxSizing:"border-box", ...s }}
    onFocus={e=>e.target.style.borderColor=GREEN}
    onBlur={e=>e.target.style.borderColor=BORDER}>{children}</select>
);
const TextArea = ({ value, onChange, placeholder, rows=3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:6, padding:"7px 10px",
      fontSize:13, fontFamily:F, resize:"none", outline:"none", boxSizing:"border-box" }}
    onFocus={e=>e.target.style.borderColor=GREEN}
    onBlur={e=>e.target.style.borderColor=BORDER}
  />
);
const FL = ({ children, required }) => (
  <label style={{ display:"block", fontSize:11, fontWeight:600, color:TEXT_MUTED,
    marginBottom:5, textTransform:"uppercase", letterSpacing:"0.4px" }}>
    {children}{required&&<span style={{ color:RED, marginLeft:2 }}>*</span>}
  </label>
);
const Card = ({ children, style:s }) => (
  <div style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 20px", ...s }}>{children}</div>
);
const CardTitle = ({ children }) => (
  <div style={{ fontSize:13, fontWeight:700, color:TEXT_MAIN, marginBottom:14,
    paddingBottom:10, borderBottom:`1px solid ${BORDER}` }}>{children}</div>
);
const SumRow = ({ label, value, bold, big, color, border }) => (
  <div style={{ display:"flex", justifyContent:"space-between",
    padding:big?"12px 0 0":"8px 0",
    borderTop:border?`2px solid ${BORDER}`:undefined,
    borderBottom:!border?`1px solid ${BORDER}`:undefined,
    fontSize:big?16:13 }}>
    <span style={{ color:TEXT_MUTED, fontWeight:bold?600:400 }}>{label}</span>
    <span style={{ fontWeight:bold||big?700:500, color:color||(big?GREEN:TEXT_MAIN) }}>{value}</span>
  </div>
);
const NInp = ({ value, onChange, width=65, min=0, max }) => (
  <input type="number" value={value} onChange={onChange} min={min} max={max}
    style={{ width, border:`1px solid ${BORDER}`, borderRadius:4, padding:"4px 6px",
      fontSize:12, textAlign:"right", fontFamily:F, outline:"none" }}
    onFocus={e=>e.target.style.borderColor=GREEN}
    onBlur={e=>e.target.style.borderColor=BORDER}
  />
);

const TablePage = ({ columns, rows, loading, emptyText, footer, topBar }) => (
  <div style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:10,
    flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden" }}>
    {topBar&&(
      <div style={{ padding:"12px 18px", borderBottom:`1px solid ${BORDER}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, gap:12, flexWrap:"wrap" }}>{topBar}</div>
    )}
    <div style={{ flex:1, overflowY:"auto", minHeight:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead style={{ position:"sticky", top:0, zIndex:2 }}>
          <tr>{columns.map((c,i)=><Th key={i} right={c.right} center={c.center}>{c.label}</Th>)}</tr>
        </thead>
        <tbody>
          {loading
            ?<tr><td colSpan={columns.length} style={{ textAlign:"center", padding:40, color:TEXT_MUTED }}>Loading...</td></tr>
            :rows.length===0
              ?<tr><td colSpan={columns.length} style={{ textAlign:"center", padding:60, color:TEXT_MUTED }}>
                  <div style={{ fontSize:28, marginBottom:8, opacity:0.2 }}>■</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{emptyText}</div>
                </td></tr>
              :rows.map((r,i)=>(
                <tr key={i}
                  onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >{r}</tr>
              ))
          }
        </tbody>
      </table>
    </div>
    {footer&&(
      <div style={{ padding:"10px 18px", borderTop:`1px solid ${BORDER}`, flexShrink:0,
        background:"#fafafa", display:"flex", justifyContent:"space-between", alignItems:"center" }}>{footer}</div>
    )}
  </div>
);

const PerPage = ({ value, onChange }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <span style={{ fontSize:12, color:TEXT_MUTED }}>Show</span>
    <select value={value} onChange={e=>onChange(Number(e.target.value))}
      style={{ border:`1px solid ${BORDER}`, borderRadius:6, padding:"5px 8px", fontSize:12, fontFamily:F, background:"#fff" }}>
      {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
    </select>
    <span style={{ fontSize:12, color:TEXT_MUTED }}>entries</span>
  </div>
);
const SearchBox = ({ value, onChange, placeholder, width=220 }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    <span style={{ position:"absolute", left:10, pointerEvents:"none", display:"flex" }}>{IC.search}</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search..."}
      autoComplete="off"
      style={{ border:`1px solid ${BORDER}`, borderRadius:6, padding:"7px 10px 7px 30px",
        fontSize:12, fontFamily:F, background:"#fff", width, outline:"none" }}
      onFocus={e=>e.target.style.borderColor=GREEN}
      onBlur={e=>e.target.style.borderColor=BORDER}
    />
  </div>
);

const Spinner = () => (
  <>
    <span style={{ display:"inline-block", width:13, height:13, border:"2px solid #ddd",
      borderTopColor:GREEN, borderRadius:"50%", animation:"spin .7s linear infinite", verticalAlign:"middle" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

// ── Generic detail popup — used by every list page's "View" button ────────────
function QuickView({ title, subtitle, rows, items, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)",
      zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, width:440,
        maxHeight:"82vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ background:GREEN_GRAD, padding:"16px 20px", display:"flex",
          justifyContent:"space-between", alignItems:"flex-start", borderRadius:"12px 12px 0 0" }}>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:16 }}>{title}</div>
            {subtitle && <div style={{ color:"rgba(255,255,255,0.8)", fontSize:12, marginTop:2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none",
            borderRadius:6, padding:"5px 8px", cursor:"pointer", color:"#fff", display:"flex" }}>{IC.close}</button>
        </div>
        <div style={{ padding:18 }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between",
              padding:"7px 0", borderBottom:`1px solid ${BORDER}`, fontSize:13 }}>
              <span style={{ color:TEXT_MUTED }}>{label}</span>
              <span style={{ fontWeight:600, color:TEXT_MAIN, textAlign:"right" }}>{value ?? "—"}</span>
            </div>
          ))}
          {items && items.length > 0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:TEXT_MUTED, textTransform:"uppercase",
                letterSpacing:"0.5px", marginBottom:8 }}>Items ({items.length})</div>
              {items.map((it, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  padding:"6px 0", borderBottom:`1px solid ${BORDER}`, fontSize:12 }}>
                  <span>{(it.product || it.name || "Item")} <span style={{ color:TEXT_MUTED }}>x{it.qty}</span></span>
                  <span style={{ fontWeight:700, color:GREEN }}>Rs. {fmt((it.unitPrice ?? it.price ?? 0) * (it.qty||1))}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Generic edit popup — used by every list page's "Edit" button ──────────────
// Only exposes fields the backend actually persists for that entity, so Save
// always genuinely works (no silently-ignored fields).
function QuickEdit({ title, fields, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const submit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)",
      zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, width:420,
        maxHeight:"82vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${BORDER}`,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, fontSize:15, color:TEXT_MAIN }}>{title}</span>
          <IBtn icon={IC.close} onClick={onClose}/>
        </div>
        <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
          {fields.map(f => (
            <div key={f.key}>
              <FL>{f.label}</FL>
              {f.type === "select" ? (
                <Sel value={form[f.key] ?? ""} onChange={e=>set(f.key, e.target.value)}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </Sel>
              ) : f.type === "textarea" ? (
                <TextArea value={form[f.key] ?? ""} onChange={e=>set(f.key, e.target.value)} rows={2}/>
              ) : (
                <Inp value={form[f.key] ?? ""} onChange={e=>set(f.key, e.target.value)}
                  type={f.type || "text"}/>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${BORDER}`, display:"flex", gap:8 }}>
          <GhostBtn label="Cancel" onClick={onClose}/>
          <PrimaryBtn label={saving?"Saving...":"Save Changes"} icon={IC.save} onClick={submit} disabled={saving}/>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMBOBOXES — Typeable searchable dropdowns
// ═══════════════════════════════════════════════════════════════

// ── Customer Combobox ─────────────────────────────────────────
function CustomerCombobox({ value, onChange, customers, placeholder="Search customer by name, phone, email..." }) {
  const [q,    setQ]    = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQ(value || ""); }, [value]);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const all = [
    { id:"walkin", name:"Walk-In Customer", customer_type:"Walk-In" },
    ...customers.map(c => ({ ...c, name: c.name || c.contact_name || c.business_name || "" })),
  ];
  const filtered = all.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) ||
    (c.phone||c.mobile||"").includes(q) ||
    (c.email||"").toLowerCase().includes(q.toLowerCase())
  );

  const pick = c => { setQ(c.name); onChange(c.name, c); setOpen(false); };

  // Safety net: if the typed text is an exact match for a saved customer
  // but the user tabbed/clicked away instead of clicking the dropdown row,
  // still capture that customer's real id — otherwise customerId silently
  // stays null and the invoice/sale never links back to the contact.
  const tryAutoPick = () => {
    if (!q) return;
    const exact = all.find(c => c.name.toLowerCase() === q.trim().toLowerCase());
    if (exact) pick(exact);
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
          pointerEvents:"none", display:"flex", opacity:0.4 }}>{IC.search}</span>
        <input value={q}
          name="customer-search-field" autoComplete="off" autoCorrect="off" spellCheck="false"
          onChange={e=>{ setQ(e.target.value); onChange(e.target.value, null); setOpen(true); }}
          onFocus={()=>setOpen(true)}
       onBlur={()=>setTimeout(tryAutoPick, 150)}
          onKeyDown={e=>{ if (e.key==="Enter") { e.preventDefault(); tryAutoPick(); } }}
          placeholder={placeholder}
          style={{ width:"100%", border:`1px solid ${open?GREEN:BORDER}`, borderRadius:6,
            padding:"7px 34px 7px 32px", fontSize:13, fontFamily:F, background:"#fff",
            color:TEXT_MAIN, outline:"none", boxSizing:"border-box" }}
        />
        {q && <button onMouseDown={()=>{ setQ(""); onChange("",null); setOpen(true); }} 
          style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", color:TEXT_MUTED, display:"flex" }}>{IC.close}</button>}
      </div>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0,
          background:"#fff", border:`1px solid ${BORDER}`, borderRadius:8,
          maxHeight:260, overflowY:"auto", zIndex:300,
          boxShadow:"0 8px 24px rgba(0,0,0,0.13)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"12px 14px", fontSize:13, color:TEXT_MUTED }}>
              No customers found
              <a href="/contacts/customers/create" target="_blank"
                style={{ display:"block", marginTop:6, fontSize:12, color:GREEN, fontWeight:600, textDecoration:"none" }}>
                + Add New Customer
              </a>
            </div>
          ) : filtered.slice(0,15).map(c => (
            <div key={c.id||c.name} onMouseDown={()=>pick(c)}
              style={{ padding:"10px 14px", cursor:"pointer", fontSize:13,
                borderBottom:`1px solid ${BORDER}`, display:"flex",
                justifyContent:"space-between", alignItems:"center" }}
              onMouseEnter={e=>e.currentTarget.style.background=LIGHT_GRN}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              <div>
                <div style={{ fontWeight:600 }}>{c.name}</div>
                {(c.phone||c.mobile) && <div style={{ fontSize:11, color:TEXT_MUTED }}>{c.phone||c.mobile}</div>}
                {c.email && <div style={{ fontSize:11, color:TEXT_MUTED }}>{c.email}</div>}
              </div>
              {c.customer_type && <Badge status={c.customer_type}/>}
            </div>
          ))}
          <div style={{ padding:"8px 14px", borderTop:`1px solid ${BORDER}`, background:"#fafafa" }}>
            <a href="/contacts/customers/create" target="_blank"
              style={{ fontSize:12, color:GREEN, fontWeight:600, textDecoration:"none",
                display:"flex", alignItems:"center", gap:4 }}>
              {IC.plus} Add New Customer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Invoice Combobox — typeable reference invoice picker ──────
function InvoiceCombobox({ invoices, value, onChange, placeholder="Type invoice no. or customer name..." }) {
  const [q,    setQ]    = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQ(value || ""); }, [value]);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = invoices.filter(inv =>
    !q || (inv.invoiceNo||"").toLowerCase().includes(q.toLowerCase()) ||
    (inv.customer||"").toLowerCase().includes(q.toLowerCase()) ||
    (inv.date||"").includes(q)
  );

  const pick = inv => { setQ(inv.invoiceNo); onChange(inv.invoiceNo, inv); setOpen(false); };

  // Fallback: if the typed text is an exact invoice number match but the
  // user never clicked a dropdown row (e.g. blurred/tabbed away), auto-pick
  // it anyway so "Products to Return" still loads instead of staying empty.
  const tryAutoPick = () => {
    if (!q) return;
    const exact = invoices.find(inv => (inv.invoiceNo||"").toLowerCase() === q.trim().toLowerCase());
    if (exact) pick(exact);
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
          pointerEvents:"none", display:"flex", opacity:0.4 }}>{IC.search}</span>
        <input value={q}
          name="invoice-ref-search-field" autoComplete="off" autoCorrect="off" spellCheck="false"
          onChange={e=>{ setQ(e.target.value); setOpen(true); }}
          onFocus={()=>setOpen(true)}
          onBlur={()=>setTimeout(tryAutoPick, 150)}
          onKeyDown={e=>{ if (e.key==="Enter") { e.preventDefault(); tryAutoPick(); } }}
          placeholder={placeholder}
          style={{ width:"100%", border:`1px solid ${open?GREEN:BORDER}`, borderRadius:6,
            padding:"7px 10px 7px 32px", fontSize:13, fontFamily:F, background:"#fff",
            color:TEXT_MAIN, outline:"none", boxSizing:"border-box" }}
        />
      </div>   
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0,
          background:"#fff", border:`1px solid ${BORDER}`, borderRadius:8,
          maxHeight:240, overflowY:"auto", zIndex:300,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)" }}>
          {invoices.length === 0 ? (
            <div style={{ padding:"12px 14px", fontSize:13, color:TEXT_MUTED, display:"flex", alignItems:"center", gap:8 }}>
              <Spinner/> Loading invoices...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"12px 14px", fontSize:13, color:TEXT_MUTED }}>No invoices match "{q}"</div>
          ) : filtered.slice(0,12).map(inv => (
            <div key={inv.id||inv.invoiceNo} onMouseDown={()=>pick(inv)}
              style={{ padding:"10px 14px", cursor:"pointer", fontSize:13,
                borderBottom:`1px solid ${BORDER}`, display:"flex",
                justifyContent:"space-between", alignItems:"center" }}
              onMouseEnter={e=>e.currentTarget.style.background=LIGHT_GRN}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              <div>
                <span style={{ fontWeight:700, color:GREEN, fontFamily:"monospace" }}>{inv.invoiceNo}</span>
                <span style={{ color:TEXT_MUTED, fontSize:11, marginLeft:8 }}>— {inv.customer}</span>
                {inv.date && <div style={{ fontSize:11, color:TEXT_MUTED }}>{fmtDate(inv.date)}</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                {inv.paymentStatus && <Badge status={inv.paymentStatus}/>}
                <span style={{ fontSize:12, fontWeight:700, color:GREEN }}>Rs. {fmt(inv.grandTotal)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Search Dropdown ───────────────────────────────────
function ProductSearchDropdown({ products, loading: prodLoading, onSelect, placeholder }) {
  const [q,    setQ]    = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = products.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) ||
    (p.sku||"").toLowerCase().includes(q.toLowerCase()) ||
    (p.barcode||"").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
          pointerEvents:"none", display:"flex" }}>{IC.search}</span>
        <input value={q}
          name="product-search-field" autoComplete="off" autoCorrect="off" spellCheck="false"
          onChange={e=>{ setQ(e.target.value); setOpen(true); }}
          onFocus={()=>setOpen(true)}
          placeholder={placeholder || "Search product by name, SKU, or barcode..."}
          style={{ width:"100%", border:`1px solid ${q&&open?GREEN:BORDER}`, borderRadius:6,
            padding:"8px 32px 8px 32px", fontSize:13, fontFamily:F, background:"#fff",
            outline:"none", boxSizing:"border-box" }}
        />
        {q && <button onMouseDown={()=>{ setQ(""); setOpen(true); }}
          style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", color:TEXT_MUTED, display:"flex" }}>{IC.close}</button>}
      </div>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0,
          background:"#fff", border:`1px solid ${BORDER}`, borderRadius:8,
          maxHeight:280, overflowY:"auto", zIndex:200,
          boxShadow:"0 8px 24px rgba(0,0,0,0.10)" }}>
          {prodLoading ? (
            <div style={{ padding:"14px", fontSize:13, color:TEXT_MUTED, display:"flex", alignItems:"center", gap:8 }}>
              <Spinner/> Loading products from database...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding:"14px", fontSize:13, color:TEXT_MUTED }}>
              No products in database. <a href="/products/create" style={{ color:GREEN, fontWeight:600 }}>Add a product</a>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"14px", fontSize:13, color:TEXT_MUTED }}>No products match "{q}"</div>
          ) : filtered.slice(0,15).map(p => (
            <div key={p.id||p.name}
              onMouseDown={()=>{ onSelect(p); setQ(""); setOpen(false); }}
              style={{ padding:"10px 14px", cursor:"pointer", fontSize:13,
                borderBottom:`1px solid ${BORDER}`, display:"flex",
                justifyContent:"space-between", alignItems:"center" }}
              onMouseEnter={e=>e.currentTarget.style.background=LIGHT_GRN}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              <div>
                <span style={{ fontWeight:600 }}>{p.name}</span>
                {p.sku && <span style={{ color:TEXT_MUTED, fontSize:11, marginLeft:8 }}>SKU: {p.sku}</span>}
                {p.category && <span style={{ color:TEXT_MUTED, fontSize:11, marginLeft:6 }}>• {p.category}</span>}
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
                {p.stock !== undefined && (
                  <span style={{ fontSize:11, color:p.stock>0?"#16a34a":RED,
                    background:p.stock>0?"#f0fdf4":"#fef2f2", padding:"2px 6px", borderRadius:4 }}>
                    {p.stock>0?`Stock: ${p.stock}`:"Out of stock"}
                  </span>
                )}
                <span style={{ color:GREEN, fontWeight:700 }}>Rs. {fmt(p.selling_price)}</span>
              </div>
            </div>
          ))}
          {!prodLoading && products.length > 0 && (
            <div style={{ padding:"6px 14px", borderTop:`1px solid ${BORDER}`,
              background:"#fafafa", fontSize:11, color:TEXT_MUTED }}>
              {filtered.length} of {products.length} products
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CSV helper — shared by Export CSV buttons ──────────────────────────────────
function downloadCSV(filename, headerRow, dataRows) {
  const esc = v => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const csv = [headerRow, ...dataRows].map(r => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════
// 1. ALL SALES
// ═══════════════════════════════════════════════════════════════
export function AllSales() {
  const navigate = useNavigate();
  const { data, loading, refresh } = useAPI("/sales-invoice");
  // Drafts live in the same table but belong on the Drafts page only —
  // exclude them here so All Sales only shows Submitted invoices.
  const sales = (data?.data || []).filter(s => (s.docStatus || "Submitted") !== "Draft");
const [perPage, setPerPage] = useState(25);
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("All");
  const [methodF, setMethodF] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [viewRec, setViewRec] = useState(null);
  const [editRec, setEditRec] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const hasActiveFilters = statusF!=="All" || methodF!=="All" || !!search || !!dateFrom || !!dateTo;

  // Every filter EXCEPT perPage — this feeds both the table AND the KPI cards,
  // so the KPIs actually respond live to whatever the user filters by.
  const filteredAll = sales.filter(s => {
    if (statusF !== "All" && s.paymentStatus !== statusF) return false;
    if (methodF !== "All" && s.paymentMethod !== methodF) return false;
    if (search && !`${s.invoiceNo} ${s.customer}`.toLowerCase().includes(search.toLowerCase())) return false;
    const d = (s.date || s.invoiceDate || "").slice(0,10);
    if (dateFrom && d && d < dateFrom) return false;
    if (dateTo   && d && d > dateTo)   return false;
    return true;
  });
  const filtered = filteredAll.slice(0, perPage);

  const totalPaid   = filteredAll.filter(s=>s.paymentStatus==="Paid").reduce((a,s)=>a+Number(s.grandTotal||0),0);
  const totalUnpaid = filteredAll.filter(s=>s.paymentStatus==="Unpaid").reduce((a,s)=>a+Number(s.grandTotal||0),0);
  const totalValue  = filteredAll.reduce((a,s)=>a+Number(s.grandTotal||0),0);
  const viewTotal   = filtered.reduce((a,s)=>a+Number(s.grandTotal||0),0);

  // NEW — balance due for a row when payment is Partial (falls back to
  // grandTotal-paidAmount, or the full grandTotal if no paidAmount stored).
  const balanceOf = s => {
    const paid = Number(s.paidAmount || 0);
    return Math.max(0, Number(s.grandTotal||0) - paid);
  };

 const handleExport = () => {
    downloadCSV(
      `all_sales_${Date.now()}.csv`,
      ["Invoice No.","Date","Due Date","Customer","Customer Type","Location","Payment Status","Amount Paid (Rs.)","Balance Due (Rs.)","Method","Total (Rs.)"],
      filteredAll.map(s => [s.invoiceNo, fmtDate(s.date||s.invoiceDate), fmtDate(s.dueDate), s.customer,
        s.customerType||"", s.warehouse||s.location||"Manod HQ", s.paymentStatus,
        s.paidAmount||0, balanceOf(s), s.paymentMethod, s.grandTotal])
    );
  };

 const handleDelete = async (s) => {
    if (!window.confirm(`Delete invoice ${s.invoiceNo}? This cannot be undone.`)) return;
    const res = await apiFetch(`/sales-invoice/${s.id}`, { method:"DELETE" });
    if (res) refresh(); else alert("Delete failed — check server");
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    const pageIds = filtered.map(s=>s.id);
    const allSelected = pageIds.every(id=>selectedIds.includes(id)) && pageIds.length>0;
    setSelectedIds(allSelected ? selectedIds.filter(id=>!pageIds.includes(id)) : [...new Set([...selectedIds, ...pageIds])]);
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length===0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected invoice(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    const results = await Promise.all(selectedIds.map(id => apiFetch(`/sales-invoice/${id}`, { method:"DELETE" })));
    const failed = results.filter(r=>!r).length;
    setBulkDeleting(false);
    setSelectedIds([]);
    refresh();
    if (failed>0) alert(`${failed} invoice(s) failed to delete — check server`);
  };

  const handleEditSave = async (form) => {
    const res = await apiFetch(`/sales-invoice/${editRec.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res) { setEditRec(null); refresh(); } else alert("Update failed — check server");
  };
const cols = [
    {label:<input type="checkbox"
        checked={filtered.length>0 && filtered.every(s=>selectedIds.includes(s.id))}
        onChange={toggleSelectAll}/>, center:true},
    {label:"Invoice No."},{label:"Date"},{label:"Due Date"},
    {label:"Customer"},{label:"Customer Type"},{label:"Location"},{label:"Payment Status"},
    {label:"Paid / Balance (Rs.)",right:true},
    {label:"Method"},{label:"Total (Rs.)",right:true},{label:"Action",center:true},
  ];
  const rows = filtered.map((s,i) => (
    <>
      <Td center>
        <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={()=>toggleSelect(s.id)}/>
      </Td>
      <Td mono style={{color:GREEN}}>{s.invoiceNo||`INV-${String(i+1).padStart(4,"0")}`}</Td>
      <Td>{fmtDate(s.date||s.invoiceDate)}</Td>
      <Td muted>{s.dueDate?fmtDate(s.dueDate):"—"}</Td>
      <Td>{s.customer||"—"}</Td>
      <Td>{s.customerType?<Badge status={s.customerType}/>:"—"}</Td>
      <Td muted>{s.warehouse||s.location||"Manod HQ"}</Td>
      <Td><Badge status={s.paymentStatus||"Unpaid"}/></Td>
      <Td right>
        {s.paymentStatus==="Partial" ? (
          <div style={{lineHeight:1.5}}>
            <div style={{fontSize:11,color:"#16a34a"}}>Paid: Rs. {fmt(s.paidAmount)}</div>
            <div style={{fontSize:11,color:RED,fontWeight:700}}>Due: Rs. {fmt(balanceOf(s))}</div>
          </div>
        ) : s.paymentStatus==="Paid" ? (
          <span style={{fontSize:11,color:"#16a34a"}}>Fully Paid</span>
        ) : (
          <span style={{fontSize:11,color:RED}}>Rs. {fmt(s.grandTotal)} due</span>
        )}
      </Td>
      <Td muted>{s.paymentMethod||"Cash"}</Td>
      <Td right><span style={{fontWeight:700,color:GREEN}}>Rs. {fmt(s.grandTotal)}</span></Td>
      <Td center><div style={{display:"flex",gap:2,justifyContent:"center"}}>
        <IBtn icon={IC.eye} title="View" onClick={()=>setViewRec(s)}/>
        <IBtn icon={IC.edit} title="Edit" onClick={()=>setEditRec(s)}/>
        <IBtn icon={IC.trash} title="Delete" color={RED} onClick={()=>handleDelete(s)}/>
      </div></Td>
    </>
  ));

  return (
    <div style={PAGE}>  
   <PageHeader title="All Sales" breadcrumb="Home / Sell / All Sales"
        actions={<>
          {selectedIds.length>0 && (
            <GhostBtn label={bulkDeleting?"Deleting...":`Delete Selected (${selectedIds.length})`}
              icon={IC.trash} onClick={bulkDeleting?undefined:handleBulkDelete}/>
          )}
          <GhostBtn label="Export CSV" icon={IC.csv} onClick={handleExport}/>
          <PrimaryBtn label="Add Sale" icon={IC.plus} onClick={()=>navigate("/sells/create")}/>
        </>}/>
     <div style={{padding:"16px 24px 0",display:"flex",gap:14,flexShrink:0}}>
        <StatCard label="Total Invoices" value={filteredAll.length} sub={hasActiveFilters?"Filtered":"All time"} accent={GREEN}
          active={!hasActiveFilters}
          onClick={()=>{setStatusF("All");setMethodF("All");setSearch("");setDateFrom("");setDateTo("");}}/>
        <StatCard label="Total Value" value={`Rs. ${fmt(totalValue)}`} sub={hasActiveFilters?"Filtered":"All invoices"} accent="#6366f1"
          active={!hasActiveFilters}
          onClick={()=>{setStatusF("All");setMethodF("All");setSearch("");setDateFrom("");setDateTo("");}}/>
        <StatCard label="Total Paid" value={`Rs. ${fmt(totalPaid)}`} sub={`${filteredAll.filter(s=>s.paymentStatus==="Paid").length} invoices`} accent="#22c55e"
          active={statusF==="Paid"}
          onClick={()=>setStatusF(prev=>prev==="Paid"?"All":"Paid")}/>
        <StatCard label="Total Unpaid" value={`Rs. ${fmt(totalUnpaid)}`} sub={`${filteredAll.filter(s=>s.paymentStatus==="Unpaid").length} invoices`} accent={RED}
          active={statusF==="Unpaid"}
          onClick={()=>setStatusF(prev=>prev==="Unpaid"?"All":"Unpaid")}/>
        <StatCard label="Partial Balance Due" value={`Rs. ${fmt(filteredAll.filter(s=>s.paymentStatus==="Partial").reduce((a,s)=>a+balanceOf(s),0))}`} sub={`${filteredAll.filter(s=>s.paymentStatus==="Partial").length} invoices`} accent={AMBER}
          active={statusF==="Partial"}
          onClick={()=>setStatusF(prev=>prev==="Partial"?"All":"Partial")}/>
      </div>
      <div style={{flex:1,minHeight:0,padding:"14px 24px",display:"flex",flexDirection:"column"}}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No sales found."
          topBar={<>
            <PerPage value={perPage} onChange={setPerPage}/>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <select value={statusF} onChange={e=>setStatusF(e.target.value)}
                style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"6px 10px",fontSize:12,fontFamily:F,background:"#fff"}}>
                {["All","Paid","Unpaid","Partial"].map(o=><option key={o}>{o}</option>)}
              </select>
              <select value={methodF} onChange={e=>setMethodF(e.target.value)}
                style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"6px 10px",fontSize:12,fontFamily:F,background:"#fff"}}>
                {["All","Cash","UPI","Card","Bank Transfer"].map(o=><option key={o}>{o}</option>)}
              </select>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
                  style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"6px 8px",fontSize:12,fontFamily:F,background:"#fff"}}/>
                <span style={{fontSize:11,color:TEXT_MUTED}}>to</span>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
                  style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"6px 8px",fontSize:12,fontFamily:F,background:"#fff"}}/>
              </div>
              {hasActiveFilters && (
                <button onClick={()=>{setStatusF("All");setMethodF("All");setSearch("");setDateFrom("");setDateTo("");}}
                  style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"6px 10px",fontSize:12,fontFamily:F,
                    background:"#fff",cursor:"pointer",color:TEXT_MUTED}}>
                  Clear Filters
                </button>
              )}
              <SearchBox value={search} onChange={setSearch} placeholder="Search invoice or customer..."/>
            </div>
          </>}
          footer={<>
            <span style={{fontSize:12,color:TEXT_MUTED}}>Showing {filtered.length} of {filteredAll.length} entries</span>
            <span style={{fontSize:13,fontWeight:700,color:GREEN}}>Total: Rs. {fmt(viewTotal)}</span>
          </>}/>
      </div>

      {viewRec && (
        <QuickView title={viewRec.invoiceNo} subtitle={fmtDate(viewRec.date||viewRec.invoiceDate)}
          onClose={()=>setViewRec(null)} items={viewRec.items}
          rows={[
            {label:"Customer", value:viewRec.customer},
            {label:"Customer Type", value:viewRec.customerType?<Badge status={viewRec.customerType}/>:"—"},
            {label:"Warehouse", value:viewRec.warehouse||viewRec.location},
            {label:"Due Date", value:viewRec.dueDate?fmtDate(viewRec.dueDate):"—"},
            {label:"Payment Status", value:<Badge status={viewRec.paymentStatus||"Unpaid"}/>},
            {label:"Amount Paid", value:`Rs. ${fmt(viewRec.paidAmount)}`},
            {label:"Balance Due", value:`Rs. ${fmt(balanceOf(viewRec))}`},
            {label:"Payment Method", value:viewRec.paymentMethod},
            {label:"Doc Status", value:<Badge status={viewRec.docStatus||"Draft"}/>},
            {label:"Notes", value:viewRec.notes||"—"},
            {label:"Grand Total", value:`Rs. ${fmt(viewRec.grandTotal)}`},
          ]}/>
      )}

      {editRec && (
        <QuickEdit title={`Edit ${editRec.invoiceNo}`} onClose={()=>setEditRec(null)} onSave={handleEditSave}
          initial={{
            docStatus: editRec.docStatus || "Draft",
            paymentStatus: editRec.paymentStatus || "Unpaid",
            paidAmount: editRec.paidAmount || 0,
            paymentMethod: editRec.paymentMethod || "Cash",
            customerType: editRec.customerType || "Walk-In",
            salesperson: editRec.salesperson || "",
            notes: editRec.notes || "",
          }}
          fields={[
            {key:"docStatus", label:"Document Status", type:"select", options:["Draft","Submitted"]},
            {key:"paymentStatus", label:"Payment Status", type:"select", options:["Unpaid","Paid","Partial"]},
            {key:"paidAmount", label:"Amount Paid (Rs.) — for Partial", type:"number"},
            {key:"paymentMethod", label:"Payment Method", type:"select", options:["Cash","UPI","Card","Bank Transfer","Cheque"]},
            {key:"customerType", label:"Customer Type", type:"select", options:CUSTOMER_TYPES},
            {key:"salesperson", label:"Salesperson"},
            {key:"notes", label:"Notes", type:"textarea"},
          ]}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. ADD SALE
// ═══════════════════════════════════════════════════════════════
export function AddSale() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
const { products, loading: prodLoading } = useProducts();
  const { customers } = useCustomers();
 const { groups: priceGroups } = useSellingPriceGroups();
const { locations } = useLocations();
  const invoiceSettings = useInvoiceSettings();
  const { taxRates } = useTaxRates();
  const [priceGroupId, setPriceGroupId] = useState("");

 const getPriceForGroup = (product) => {
    if (!priceGroupId) return product.selling_price;
    const group = priceGroups.find(g => String(g.id) === String(priceGroupId));
    if (!group) return product.selling_price;
    const pct = Number(group.percentage) || 0;
    const base = Number(product.selling_price) || 0;
    if (group.type === "Markup") return base + (base * pct / 100);
    if (group.type === "Discount") return base - (base * pct / 100);
    return base;
  };

 const [invoiceNo,   setInvoiceNo]   = useState(()=>genNo("INV"));
  const [invoiceNoTouched, setInvoiceNoTouched] = useState(false);
  // Once Invoice Settings load, replace the placeholder random number with
  // the real prefix/digits/separator-based number — but only if the user
  // hasn't already typed their own invoice number.
  useEffect(() => {
    if (invoiceSettings && !invoiceNoTouched) {
      setInvoiceNo(buildInvoiceNo(invoiceSettings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceSettings]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0,10));
const [warehouse,   setWarehouse]   = useState("");
// ── NEW CODE ──
  const [customer,    setCustomer]    = useState("Walk-In Customer");
  const [customerId,  setCustomerId]  = useState(null);
  const [customerAdvance, setCustomerAdvance] = useState(0);
  const [useAdvanceAmount, setUseAdvanceAmount] = useState(0);
  const [customerType,setCustomerType]= useState("Walk-In");
  const [salesperson, setSalesperson] = useState("");
  const [payTerm,     setPayTerm]     = useState("Immediate");
  const [payMethod,   setPayMethod]   = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paidAmount,  setPaidAmount]  = useState(0);
const [taxRate,     setTaxRate]     = useState(0); // GST selector default — set to saved default tax rate once loaded
  const [globalDisc,  setGlobalDisc]  = useState(0);
  const [shipping,    setShipping]    = useState(0);
  const [notes,       setNotes]       = useState("");
  const [docStatus,   setDocStatus]   = useState("Submitted");
const [items,       setItems]       = useState([]);
  const [saving,      setSaving]      = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);
  const [sourceFrom, setSourceFrom] = useState(null); // "draft" | "quotation" | null
  const [sourceId,   setSourceId]   = useState(null);

  // Convert-to-Invoice: when the Drafts/Quotations "Convert" button sends us
  // here as /sells/create?from=draft&id=123 or ?from=quotation&id=123,
  // fetch that record and pre-fill the form + line items.
useEffect(() => {
    if (!warehouse && locations.length > 0) setWarehouse(locations[0].location_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  useEffect(() => {
    const def = taxRates.find(t => t.is_default);
    if (def && taxRate === 0) setTaxRate(Number(def.rate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxRates]);

  useEffect(() => {
    const from = searchParams.get("from");
    const id   = searchParams.get("id");
    console.log("Convert-to-invoice params:", { from, id }); // TEMP debug — remove once confirmed working
    if (!from || !id) return;
    setSourceFrom(from);
    setSourceId(id);
    setLoadingSource(true);
const endpoint = from === "quotation" ? `/quotations/${id}`
  : from === "draft" ? `/sales-drafts/${id}`
  : `/sales-invoice/${id}`;
   apiFetch(endpoint).then(res => {
      const d = res?.data || res;
      if (!d) { setLoadingSource(false); return; }
      setWarehouse(d.warehouse || "Manod HQ");
      setCustomer(d.customer || "Walk-In Customer");
      setCustomerType(d.customerType || "Walk-In");
      setSalesperson(d.salesperson || "");
      setPayMethod(d.paymentMethod || "Cash");
      setNotes(d.notes || "");
     setDocStatus("Submitted");
      // Convert flow reuses the draft's old number sometimes — force a
      // fresh, guaranteed-unique invoice number so it never collides
      // with the original draft-era number or another recent invoice.
      if (!invoiceNoTouched) setInvoiceNo(genNo("INV") + "-" + Math.floor(Math.random()*900+100));
      // Carry over quotation-level discount & shipping too — drafts don't
      // have these fields so they just stay at their existing defaults (0).
      if (from === "quotation") {
        setGlobalDisc(Number(d.globalDisc || 0));
        setShipping(Number(d.shipping || 0));
      }
      // Drafts never collect a real Tax % (AddDraft has no tax field), so any
      // "tax" value on a draft's items is a stale/default value from the DB —
      // always force 0 on convert-from-draft. Quotations DO track tax
      // properly (AddQuotation has a Tax Rate field), so carry it over as-is.
  const mappedItems = (d.items || []).map(it => ({
        id: it.id || it.productId || (Date.now() + Math.random()),
        productId: it.productId || null,   // ← was missing: this is what createInvoice's stock loop reads
        product: it.product || it.name || "Unnamed Product",
        sku: it.sku || "",
        qty: Number(it.qty || 1),
        unit: it.unit || "Pcs",
        unitPrice: Number(it.unitPrice ?? it.unit_price ?? it.price ?? 0),
        discount: Number(it.discount || 0),
        tax: from === "draft" ? 0 : (Number(it.tax) || 0),
      }));
      setItems(mappedItems);
      setTaxRate(0); // keep the GST dropdown in sync too, so it doesn't show stale % either
      setLoadingSource(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
// ── NEW CODE ──
const onCust = async (name, obj) => {
    setCustomer(name);
    setCustomerId(obj?.id || null);
    setCustomerAdvance(Number(obj?.advance_balance || 0));
    setUseAdvanceAmount(0); // reset — don't carry over a previous customer's applied amount
    // Auto-fill customer type from the contact record when one is picked,
    // but the field below stays a normal dropdown so it can be corrected.
    if (obj?.customer_type || obj?.type) setCustomerType(obj.customer_type || obj.type);
    else if (name === "Walk-In Customer") setCustomerType("Walk-In");

    // NEW: auto-detect this customer's Customer Group pricing rule and
    // apply it as the active Price Group — recalculates all existing
    // line-item prices too, via the priceGroupId effect below.
    if (obj?.id) {
      const info = await apiFetch(`/contacts/${obj.id}/pricing-info`);
      const groupId = info?.pricing?.selling_price_group_id;
      setPriceGroupId(groupId ? String(groupId) : "");
    } else {
      setPriceGroupId("");
    }
  };
const addProduct = async p => {
    if (items.some(i=>i.id===p.id)) return;
    const unitPrice = await getPriceForGroup(p);
    setItems(prev=>[...prev,{
      id:p.id||Date.now(), productId:p.id, product:p.name, sku:p.sku||"",
      qty:1, unit:"Pcs", unitPrice, discount:0, tax:0,
    }]);
  };
  // NEW: re-price every line item already in the invoice whenever the
  // active price group changes (e.g. customer switched, auto-detected
  // group changed) — recalculates totals live like POS does.
  useEffect(() => {
    if (items.length === 0) return;
    (async () => {
      const repriced = await Promise.all(items.map(async (r) => {
        const prod = products.find(p => p.id === r.productId);
        if (!prod) return r;
        const unitPrice = await getPriceForGroup(prod);
        return { ...r, unitPrice };
      }));
      setItems(repriced);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceGroupId]);
 const upd = (id,k,v) => {
    if (k === "qty") {
      const row = items.find(i=>i.id===id);
      const prod = row ? products.find(p=>p.id===row.productId) : null;
      const stock = prod ? Number(prod.stock) || 0 : null;
      if (stock !== null && Number(v) > stock) {
        alert(`Cannot sell ${v} of "${row.product}" — only ${stock} in stock`);
        return;
      }
    }
    setItems(prev=>prev.map(i=>i.id===id?{...i,[k]:v}:i));
  };
  const del = id => setItems(prev=>prev.filter(i=>i.id!==id));

  const lSub  = r => r.qty * r.unitPrice;
  const lDisc = r => lSub(r)*(r.discount/100);
  const lTax  = r => (lSub(r)-lDisc(r))*(r.tax/100);
  const lTot  = r => lSub(r)-lDisc(r)+lTax(r);
  const subtotal     = items.reduce((s,r)=>s+lSub(r),0);
  const itemDiscAmt  = items.reduce((s,r)=>s+lDisc(r),0);
  const taxAmt       = items.reduce((s,r)=>s+lTax(r),0);
  const globalDiscAmt= (subtotal-itemDiscAmt)*(globalDisc/100);
  const grandTotal   = subtotal-itemDiscAmt-globalDiscAmt+taxAmt+Number(shipping);

  // Keep paidAmount sane whenever paymentStatus or grandTotal changes
  useEffect(() => {
    if (paymentStatus === "Paid") setPaidAmount(grandTotal);
    if (paymentStatus === "Unpaid") setPaidAmount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, grandTotal]);
  const balanceDue = Math.max(0, grandTotal - Number(paidAmount||0));

  const dueDate = () => {
    const map={Immediate:0,"Net 7":7,"Net 15":15,"Net 30":30};
    const d=new Date(invoiceDate); d.setDate(d.getDate()+(map[payTerm]||0));
    return d.toLocaleDateString("en-IN");
  };
  const dueDateISO = () => {
    const map={Immediate:0,"Net 7":7,"Net 15":15,"Net 30":30};
    const d=new Date(invoiceDate); d.setDate(d.getDate()+(map[payTerm]||0));
    return d.toISOString().slice(0,10);
  };
const handleSave = async () => {
    if (saving) return; // guard against double-submit / double-fire
    if (!customer) { alert("Customer is required."); return; }
    if (items.length===0) { alert("Add at least one product."); return; }
    if (docStatus === "Submitted") {
      for (const r of items) {
        const prod = products.find(p=>p.id===r.productId);
        const stock = prod ? Number(prod.stock) || 0 : null;
        if (stock !== null && Number(r.qty) > stock) {
          alert(`Insufficient stock for "${r.product}": only ${stock} available (you entered ${r.qty})`);
          return;
        }
      }
    }
    setSaving(true);

    // "Save as Draft" here must go to the dedicated drafts table
    // (sales_drafts), NOT sales_invoices — otherwise it's invisible on
    // both the Drafts page and All Sales page even though it saved fine.
    if (docStatus === "Draft") {
      const res = await apiFetch("/sales-drafts", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          invoiceNo, invoiceDate, customer, customerType, warehouse,
          salesperson, notes, grandTotal: grandTotal.toFixed(2), items,
        }),
      });
      setSaving(false);
      if (res) navigate("/sells/drafts");
      else alert("Save failed — check server");
      return;
    }
// ── NEW CODE ──
    let invNoToUse = invoiceNo || genNo("INV");
    let res = await apiFetch("/sales-invoice",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        docType:"Sales Invoice", docStatus, affectsStock:docStatus==="Submitted",
        invoiceNo: invNoToUse, invoiceDate, customer, customerId, customerType, warehouse,
        salesperson, paymentMethod:payMethod, paymentTerms:payTerm,
        paymentStatus, paidAmount:Number(paidAmount)||0,
        useAdvanceAmount:Number(useAdvanceAmount)||0,
        dueDate:dueDateISO(), shippingAmt:Number(shipping),
        globalDiscount:globalDisc, taxAmt:taxAmt.toFixed(2),
        grandTotal:grandTotal.toFixed(2), notes, items,
      }),
    });

  // Invoice number collided (409) — regenerate a fresh one and retry once.
    // Only retry on an actual 409 conflict, not on validation/server errors —
    // otherwise real bugs get masked as "just try a new number".
    if (!res && apiFetch.lastStatus === 409) {
      invNoToUse = genNo("INV");
      setInvoiceNo(invNoToUse);
      res = await apiFetch("/sales-invoice",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          docType:"Sales Invoice", docStatus, affectsStock:docStatus==="Submitted",
          invoiceNo: invNoToUse, invoiceDate, customer, customerId, customerType, warehouse,
          salesperson, paymentMethod:payMethod, paymentTerms:payTerm,
          paymentStatus, paidAmount:Number(paidAmount)||0,
          useAdvanceAmount:Number(useAdvanceAmount)||0,
          dueDate:dueDateISO(), shippingAmt:Number(shipping),
          globalDiscount:globalDisc, taxAmt:taxAmt.toFixed(2),
          grandTotal:grandTotal.toFixed(2), notes, items,
        }),
      });
    }

    if (!res && apiFetch.lastStatus !== 409) {
      setSaving(false);
      alert(`Save failed: ${apiFetch.lastMessage || "Unknown error — check server logs"}`);
      return;
    }

    if (res) {
      // This was a Convert-to-Invoice — remove the original draft/quotation
      // now that a real invoice has been created from it, so it doesn't
      // linger in the Drafts / Quotations list.
      if (sourceFrom === "draft" && sourceId) {
        const delRes = await apiFetch(`/sales-drafts/${sourceId}`, { method:"DELETE" });
        if (!delRes) {
          console.warn("Draft delete may have failed for id:", sourceId);
          alert(`Invoice was created, but the original draft (ID: ${sourceId}) could not be removed automatically. Please delete it manually from the Drafts page.`);
        }
      } else if (sourceFrom === "quotation" && sourceId) {
        const delRes = await apiFetch(`/quotations/${sourceId}`, { method:"DELETE" });
        if (!delRes) {
          console.warn("Quotation delete may have failed for id:", sourceId);
          alert(`Invoice was created, but the original quotation (ID: ${sourceId}) could not be removed automatically. Please delete it manually from the Quotations page.`);
        }
      }
      setSaving(false);
      navigate("/sells");
    } else {
      setSaving(false);
      alert("Save failed — check server");
    }
  };
  return (
    <div style={PAGE}>
     <PageHeader title="New Sales Invoice"
        breadcrumb={loadingSource ? "Loading draft data..." : `Home / Sell / New Invoice — ${invoiceNo}`} 
        actions={<>
          <select value={docStatus} onChange={e=>setDocStatus(e.target.value)}
            style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 12px",fontSize:12,fontFamily:F,background:"#fff",cursor:"pointer"}}>
            <option value="Draft">Save as Draft</option>
            <option value="Submitted">Submit Invoice</option>
          </select>
          <GhostBtn label="Cancel" onClick={()=>navigate("/sells")}/>
<PrimaryBtn label={saving?"Saving...":"Save Invoice"} icon={IC.save}
            onClick={saving ? undefined : handleSave} disabled={saving}/>        </>}/>
      <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,minWidth:0,overflowY:"auto",padding:"20px 20px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <CardTitle>Invoice Details</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div><FL>Invoice Number</FL><Inp value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)}/></div>
              <div><FL>Invoice Date</FL><Inp type="date" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)}/></div>
          <div><FL>Warehouse</FL>
                <Sel value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
                  {locations.length===0
                    ? <option>Manod HQ</option>
                    : locations.map(l=><option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                </Sel>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Customer &amp; Payment</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{gridColumn:"span 2"}}>
                <FL required>Customer</FL>
                <CustomerCombobox value={customer} onChange={onCust} customers={customers}/>
                {customers.length===0 && (
                  <div style={{marginTop:6,fontSize:11,color:AMBER}}>
                    ⚠ No customers loaded from database yet — only "Walk-In Customer" is shown.
                    Add customers under Contacts, or check the browser console for a /api/contacts error.
                  </div>
                )}
              </div>
              <div><FL required>Customer Type</FL>
                <Sel value={customerType} onChange={e=>setCustomerType(e.target.value)}>
                  {CUSTOMER_TYPES.map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div><FL>Price Group</FL>
                <Sel value={priceGroupId} onChange={e=>setPriceGroupId(e.target.value)}>
                  <option value="">Default Price</option>
                  {priceGroups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                </Sel>
              </div>
              <div><FL>Salesperson</FL>
                <Sel value={salesperson} onChange={e=>setSalesperson(e.target.value)}>
                  <option value="">— None —</option><option>Admin</option><option>Sales Rep</option><option>Cashier</option>
                </Sel>
              </div>
              <div><FL>Payment Terms</FL>
                <Sel value={payTerm} onChange={e=>setPayTerm(e.target.value)}>
                  {["Immediate","Net 7","Net 15","Net 30"].map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div><FL>Payment Method</FL>
                <Sel value={payMethod} onChange={e=>setPayMethod(e.target.value)}>
                  {["Cash","UPI","Card","Bank Transfer","Cheque"].map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
    
              <div><FL>Payment Status</FL>
                <Sel value={paymentStatus} onChange={e=>setPaymentStatus(e.target.value)}>
                  {["Unpaid","Paid","Partial"].map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
              {paymentStatus==="Partial" && (
                <div><FL>Amount Paid Now (Rs.)</FL>
                  <Inp type="number" value={paidAmount} onChange={e=>setPaidAmount(e.target.value)} min="0" max={grandTotal}/>
                </div>
              )}
              {customerId && customerAdvance > 0 && (
                <div style={{gridColumn:"span 2"}}>
                  <FL>Use Advance Balance (Rs. {fmt(customerAdvance)} available)</FL>
                  <Inp type="number" value={useAdvanceAmount}
                    onChange={e=>setUseAdvanceAmount(Math.max(0, Math.min(Number(e.target.value)||0, customerAdvance, grandTotal)))}
                    min="0" max={Math.min(customerAdvance, grandTotal)}/>
                  <div style={{fontSize:11,color:TEXT_MUTED,marginTop:4}}>
                    Applies this customer's existing credit toward this invoice.
                  </div>
                </div>
              )}
              <div><FL>Due Date</FL><Inp value={dueDate()} readOnly/></div>
           <div><FL>Tax Rate (GST %)</FL>
                <Sel value={taxRate} onChange={e=>{const v=Number(e.target.value);setTaxRate(v);setItems(p=>p.map(i=>({...i,tax:v})));} }>
                  <option value={0}>0%</option>
                  {taxRates.map(t=><option key={t.id} value={Number(t.rate)}>{t.tax_name} ({t.rate}%)</option>)}
                </Sel>
              </div>
              <div><FL>Global Discount (%)</FL><Inp type="number" value={globalDisc} onChange={e=>setGlobalDisc(Number(e.target.value))} min="0" max="100"/></div>
            </div>
          </Card>

          <Card style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${BORDER}`}}>
              <span style={{fontSize:13,fontWeight:700,color:TEXT_MAIN}}>Products / Line Items</span>
              {prodLoading
                ? <span style={{fontSize:11,color:AMBER,display:"flex",alignItems:"center",gap:5}}><Spinner/> Loading products...</span>
                : <span style={{fontSize:11,color:GREEN}}>✓ {products.length} products available</span>
              }
            </div>
            <ProductSearchDropdown products={products} loading={prodLoading} onSelect={addProduct}/>
            <div style={{marginTop:12,border:`1px solid ${BORDER}`,borderRadius:8,overflow:"hidden"}}>
              {items.length===0 ? (
                <div style={{padding:"32px",textAlign:"center",color:TEXT_MUTED,fontSize:13}}>
                  {prodLoading ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Loading products...</span>
                    : "Search above to add products"}
                </div>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f8fafc"}}>
                    {["#","Product","SKU","Stock","Qty","Unit","Unit Price","Disc %","Tax %","Total",""].map((h,i)=>(
                      <th key={i} style={{padding:"8px 10px",fontWeight:600,fontSize:11,color:TEXT_MUTED,
                        borderBottom:`1px solid ${BORDER}`,textTransform:"uppercase",
                        textAlign:i>=3&&i<=9?"right":"left",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {items.map((r,i)=>{
                      const prod = products.find(p=>p.id===r.productId);
                      const stock = prod ? Number(prod.stock) || 0 : null;
                      return (
                      <tr key={r.id} style={{borderBottom:`1px solid ${BORDER}`}}>
                        <td style={{padding:"8px 10px",color:TEXT_MUTED,width:28}}>{i+1}</td>
                        <td style={{padding:"8px 10px",minWidth:130}}>
                          <input value={r.product} onChange={e=>upd(r.id,"product",e.target.value)}
                            style={{width:"100%",border:`1px solid ${BORDER}`,borderRadius:4,padding:"4px 6px",fontSize:12,fontFamily:F}}/>
                        </td>
                        <td style={{padding:"8px 10px",fontSize:11,color:TEXT_MUTED}}>{r.sku||"—"}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>
                          {stock===null ? "—" : (
                            <span style={{fontSize:11,color:stock>0?"#16a34a":RED,
                              background:stock>0?"#f0fdf4":"#fef2f2",padding:"2px 6px",borderRadius:4,fontWeight:600}}>
                              {stock}
                            </span>
                          )}
                        </td>
                        <td style={{padding:"8px 10px"}}><NInp value={r.qty} min={1} onChange={e=>upd(r.id,"qty",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px"}}>
                          <select value={r.unit} onChange={e=>upd(r.id,"unit",e.target.value)}
                            style={{border:`1px solid ${BORDER}`,borderRadius:4,padding:"4px 6px",fontSize:12,fontFamily:F}}>
                            {["Pcs","Box","Kg","L","Pack","Set"].map(u=><option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td style={{padding:"8px 10px"}}><NInp value={r.unitPrice} width={90} onChange={e=>upd(r.id,"unitPrice",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px"}}><NInp value={r.discount} width={55} max={100} onChange={e=>upd(r.id,"discount",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px"}}><NInp value={r.tax} width={55} max={100} onChange={e=>upd(r.id,"tax",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:GREEN,whiteSpace:"nowrap"}}>Rs. {fmt(lTot(r))}</td>
                    <td style={{padding:"8px 6px"}}><IBtn icon={IC.x} onClick={()=>del(r.id)} color={RED}/></td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card><FL>Shipping Charges (Rs.)</FL><Inp type="number" value={shipping} onChange={e=>setShipping(e.target.value)} min="0"/></Card>
            <Card><FL>Notes / Remarks</FL><TextArea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Internal note..." rows={2}/></Card>
          </div>
        </div>

        {/* RIGHT sticky summary */}
        <div style={{width:272,flexShrink:0,borderLeft:`1px solid ${BORDER}`,background:"#fff",overflowY:"auto",padding:"20px 18px",display:"flex",flexDirection:"column",gap:14}}>
          <Card style={{border:"none",padding:0}}>
            <CardTitle>Invoice Summary</CardTitle>
            <SumRow label="Subtotal"       value={`Rs. ${fmt(subtotal)}`}/>
            <SumRow label="Item Discounts" value={`- Rs. ${fmt(itemDiscAmt)}`} color="#ef4444"/>
            {globalDisc>0 && <SumRow label={`Global Disc (${globalDisc}%)`} value={`- Rs. ${fmt(globalDiscAmt)}`} color="#ef4444"/>}
            <SumRow label="Tax (GST)"      value={`+ Rs. ${fmt(taxAmt)}`} color={AMBER}/>
            {Number(shipping)>0 && <SumRow label="Shipping" value={`+ Rs. ${fmt(shipping)}`}/>}
            <SumRow label="Grand Total"    value={`Rs. ${fmt(grandTotal)}`} big border/>
            {paymentStatus==="Partial" && (
              <>
                <SumRow label="Paid Now" value={`Rs. ${fmt(paidAmount)}`} color="#16a34a"/>
                <SumRow label="Balance Due" value={`Rs. ${fmt(balanceDue)}`} color={RED} bold/>
              </>
            )}
          </Card>
          <Card style={{border:"none",padding:0,borderTop:`1px solid ${BORDER}`,paddingTop:14}}>
            <CardTitle>Invoice Info</CardTitle>
            {[
              {label:"Due Date",   value:dueDate()},
              {label:"Items",      value:items.length},
              {label:"Method",     value:payMethod},
              {label:"Terms",      value:payTerm},
              {label:"Warehouse",  value:warehouse},
              {label:"Payment",    value:paymentStatus},
              ...(salesperson?[{label:"Salesperson",value:salesperson}]:[]),
              ...(customerType?[{label:"Cust. Type", value:customerType}]:[]),
            ].map(({label,value})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontSize:12}}>
                <span style={{color:TEXT_MUTED}}>{label}</span>
                <span style={{fontWeight:600,color:TEXT_MAIN}}>{value}</span>
              </div>
            ))}
          </Card>
          {items.length>0 && (
            <Card style={{border:"none",padding:0,borderTop:`1px solid ${BORDER}`,paddingTop:14}}>
              <CardTitle>Items ({items.length})</CardTitle>
              {items.map(r=>(
                <div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${BORDER}`,fontSize:12}}>
                  <span style={{color:TEXT_MUTED,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {r.product} <span style={{fontSize:10}}>x{r.qty}</span>
                  </span>
                  <span style={{fontWeight:700,color:GREEN}}>Rs. {fmt(lTot(r))}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
// ── Register Control — Open/Close cash register, shown in ListPOS header ─────
function RegisterControl() {
  const [reg, setReg] = useState(null);       // current open register session, or null
  const [loading, setLoading] = useState(true);
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [openingCash, setOpeningCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    registerAPI.getCurrent()
      .then(res => setReg(res?.data || res || null))
      .catch(() => setReg(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOpen = async () => {
    setSaving(true);
    try {
      await registerAPI.openRegister({
        openingCash: Number(openingCash) || 0,
        warehouse: "Manod HQ",
        notes,
      });
      setShowOpen(false);
      setOpeningCash(0);
      setNotes("");
      load();
    } catch (e) {
      alert(`Failed to open register: ${e.message}`);
    }
    setSaving(false);
  };

  const handleClose = async () => {
    setSaving(true);
    try {
      await registerAPI.closeRegister(reg.id, {
        closingCash: Number(closingCash) || 0,
        notes,
      });
      setShowClose(false);
      setClosingCash(0);
      setNotes("");
      load();
    } catch (e) {
      alert(`Failed to close register: ${e.message}`);
    }
    setSaving(false);
  };

  if (loading) {
    return <span style={{fontSize:12,color:TEXT_MUTED,display:"flex",alignItems:"center",gap:6}}><Spinner/> Register...</span>;
  }

  return (
    <>
      {reg ? (
        <>
          <span style={{fontSize:12,color:"#16a34a",background:"#f0fdf4",border:"1px solid #a7f3d0",
            padding:"6px 12px",borderRadius:8,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            ● Register Open — Opened Rs. {fmt(reg.openingCash)}
          </span>
          <GhostBtn label="Close Register" onClick={()=>setShowClose(true)}/>
        </>
      ) : (
        <PrimaryBtn label="Open Register" icon={IC.plus} onClick={()=>setShowOpen(true)}/>
      )}

      {showOpen && (
        <div onClick={()=>!saving && setShowOpen(false)} style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",
          zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:12,width:380,
            boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${BORDER}`,fontWeight:700,fontSize:15}}>Open Register</div>
            <div style={{padding:18,display:"flex",flexDirection:"column",gap:12}}>
              <div><FL required>Opening Cash (Rs.)</FL>
                <Inp type="number" value={openingCash} onChange={e=>setOpeningCash(e.target.value)} min="0"/>
              </div>
              <div><FL>Notes</FL><TextArea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Optional..."/></div>
            </div>
            <div style={{padding:"14px 20px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8}}>
              <GhostBtn label="Cancel" onClick={()=>setShowOpen(false)}/>
              <PrimaryBtn label={saving?"Opening...":"Open Register"} icon={IC.save} onClick={handleOpen} disabled={saving}/>
            </div>
          </div>
        </div>
      )}

      {showClose && reg && (
        <div onClick={()=>!saving && setShowClose(false)} style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",
          zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:12,width:380,
            boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${BORDER}`,fontWeight:700,fontSize:15}}>Close Register</div>
            <div style={{padding:18,display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:12,color:TEXT_MUTED}}>Opened with Rs. {fmt(reg.openingCash)}</div>
              <div><FL required>Closing Cash Count (Rs.)</FL>
                <Inp type="number" value={closingCash} onChange={e=>setClosingCash(e.target.value)} min="0"/>
              </div>
              <div><FL>Notes</FL><TextArea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Optional..."/></div>
            </div>
            <div style={{padding:"14px 20px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8}}>
              <GhostBtn label="Cancel" onClick={()=>setShowClose(false)}/>
              <PrimaryBtn label={saving?"Closing...":"Close Register"} icon={IC.save} onClick={handleClose} disabled={saving}/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// ═══════════════════════════════════════════════════════════════
// 3. LIST POS — click row for advanced detail panel
// ═══════════════════════════════════════════════════════════════
export function ListPOS() {
  const navigate  = useNavigate();
  const { data, loading, refresh } = useAPI("/pos-sales");
  const records = (data?.data || []).map(s => ({
    ...s,
    grandTotal: Number(s.grandTotal ?? s.grand_total ?? s.total ?? s.total_amount ?? 0),
    taxAmt:     Number(s.taxAmt ?? s.tax_amt ?? s.tax_amount ?? 0),
    discount:   Number(s.discount ?? s.discount_percent ?? 0),
  }));
  const [perPage,   setPerPage]   = useState(25);
  const [search,    setSearch]    = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [editRec,   setEditRec]   = useState(null);

  const today      = new Date().toLocaleDateString("en-IN");
  const todayRecs  = records.filter(s => fmtDate(s.date) === today);
  const todayTotal = todayRecs.reduce((a,s)=>a+Number(s.grandTotal||0), 0);

  const filteredAll = records.filter(s => {
    if (todayOnly && fmtDate(s.date) !== today) return false;
    if (search && !`${s.refNo} ${s.customer}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const filtered   = filteredAll.slice(0, perPage);
  const viewTotal  = filtered.reduce((a,s)=>a+Number(s.grandTotal||0), 0);

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete POS sale ${s.refNo}? This cannot be undone.`)) return;
    const res = await apiFetch(`/pos-sales/${s.id}`, { method:"DELETE" });
    if (res) { setSelected(null); refresh(); } else alert("Delete failed — check server.");
  };

  const handleEditSave = async (form) => {
    const res = await apiFetch(`/pos-sales/${editRec.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res) { setEditRec(null); refresh(); } else alert("Update failed — check server.");
  };

  const cols = [
    {label:"Ref No."},{label:"Date"},
    {label:"Customer"},{label:"Location"},{label:"Status"},
    {label:"Method"},{label:"Total (Rs.)",right:true},{label:"Action",center:true},
  ];
  const rows = filtered.map((s,i) => (
    <>
      <Td mono style={{color:GREEN,cursor:"pointer"}} onClick={()=>setSelected(s)}>
        {s.refNo||`POS-${String(i+1).padStart(4,"0")}`}
      </Td>
      <Td>{fmtDate(s.date)}</Td>
      <Td>{s.customer||"Walk-In Customer"}</Td>
      <Td muted>{s.location||"Manod HQ"}</Td>
      <Td><Badge status={s.paymentStatus||"Paid"}/></Td>
      <Td muted>{s.paymentMethod||"Cash"}</Td>
      <Td right><span style={{fontWeight:700,color:GREEN}}>Rs. {fmt(s.grandTotal)}</span></Td>
      <Td center>
        <div style={{display:"flex",gap:2,justifyContent:"center"}}>
          <IBtn icon={IC.eye} title="View Details" onClick={()=>setSelected(s)}/>
          <IBtn icon={IC.edit} title="Edit" onClick={()=>setEditRec(s)}/>
          <IBtn icon={IC.trash} title="Delete" color={RED} onClick={()=>handleDelete(s)}/>
        </div>
      </Td>
    </>
  ));

  return (
    <div style={PAGE}>
   <PageHeader title="POS Sales" breadcrumb="Home / Sell / POS Sales"
        actions={<>
          <RegisterControl/>
          <PrimaryBtn label="Open POS" icon={IC.plus} onClick={()=>navigate("/pos/create")}/>
        </>}/>
      <div style={{padding:"16px 24px 0",display:"flex",gap:14,flexShrink:0}}>
       <StatCard label="Total Transactions" value={records.length} sub="All time" accent={GREEN}
          active={!todayOnly && !search}
          onClick={()=>{setTodayOnly(false);setSearch("");}}/>
        <StatCard label="Today's Sales" value={`Rs. ${fmt(todayTotal)}`} accent="#22c55e"
          active={todayOnly}
          onClick={()=>setTodayOnly(prev=>!prev)}/>
        <StatCard label="Showing Total" value={`Rs. ${fmt(viewTotal)}`} sub="Current view" accent={AMBER}/>
        <StatCard label="All Time Revenue" value={`Rs. ${fmt(records.reduce((a,s)=>a+Number(s.grandTotal||0),0))}`} sub="POS only" accent="#6366f1"/>
      </div>
      <div style={{flex:1,minHeight:0,padding:"14px 24px",display:"flex",gap:14}}>
        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
          <TablePage columns={cols} rows={rows} loading={loading} emptyText="No POS sales yet."
            topBar={<><PerPage value={perPage} onChange={setPerPage}/><SearchBox value={search} onChange={setSearch}/></>}
           footer={<>
              <span style={{fontSize:12,color:TEXT_MUTED}}>Showing {filtered.length} of {filteredAll.length}</span>
              <span style={{fontSize:13,fontWeight:700,color:GREEN}}>Total: Rs. {fmt(viewTotal)}</span>
            </>}/>
        </div>

        {/* DETAIL PANEL */}
        {selected && (
          <div style={{width:320,flexShrink:0,background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{background:GREEN_GRAD,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#fff",fontWeight:700,fontSize:15}}>{selected.refNo||"POS Sale"}</div>
                <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,marginTop:2}}>{fmtDate(selected.date)}</div>
              </div>
              <button onClick={()=>setSelected(null)}
                style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#fff",display:"flex"}}>
                {IC.close}
              </button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:TEXT_MUTED,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Transaction Info</div>
              {[
                {label:"Customer",  value:selected.customer||"Walk-In Customer"},
                {label:"Method",    value:selected.paymentMethod||"Cash"},
                {label:"Status",    value:<Badge status={selected.paymentStatus||"Paid"}/>},
                {label:"Location",  value:selected.location||"Manod HQ"},
                {label:"Cashier",   value:selected.cashier||"Admin"},
                {label:"Date",      value:fmtDate(selected.date)},
              ].map(({label,value})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontSize:12}}>
                  <span style={{color:TEXT_MUTED}}>{label}</span>
                  <span style={{fontWeight:600,color:TEXT_MAIN}}>{value}</span>
                </div>
              ))}

              {selected.items?.length > 0 && (
                <div style={{marginTop:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:TEXT_MUTED,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>
                    Items ({selected.items.length})
                  </div>
                  {selected.items.map((item,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${BORDER}`,fontSize:12}}>
                      <div>
                        <div style={{fontWeight:600}}>{item.name||item.product}</div>
                        {item.sku && <div style={{fontSize:10,color:TEXT_MUTED}}>SKU: {item.sku}</div>}
                        <div style={{fontSize:11,color:TEXT_MUTED}}>Rs. {fmt(item.price||item.unitPrice)} × {item.qty}</div>
                      </div>
                      <div style={{fontWeight:700,color:GREEN,whiteSpace:"nowrap"}}>
                        Rs. {fmt((item.price||item.unitPrice||0)*item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{background:LIGHT_GRN,borderRadius:8,padding:"12px 14px",marginTop:14}}>
                {(selected.discount||0)>0 && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,color:RED}}>
                    <span>Discount ({selected.discount}%)</span>
                    <span>- Rs. {fmt(Number(selected.grandTotal)*selected.discount/100)}</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,color:AMBER}}>
                  <span>Tax (GST)</span><span>+ Rs. {fmt(selected.taxAmt||0)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:800,color:GREEN,paddingTop:8,borderTop:`1px solid #a7f3d0`,marginTop:4}}>
                  <span>Grand Total</span><span>Rs. {fmt(selected.grandTotal)}</span>
                </div>
              </div>
            </div>
            <div style={{padding:"12px 16px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8}}>
              <PrimaryBtn label="Print Receipt" icon={IC.print} small onClick={()=>window.print()}/>
              <GhostBtn label="Return" small onClick={()=>navigate("/sell-return")}/>
            </div>
          </div>
        )}
      </div>

      {editRec && (
        <QuickEdit title={`Edit ${editRec.refNo}`} onClose={()=>setEditRec(null)} onSave={handleEditSave}
          initial={{ paymentStatus: editRec.paymentStatus || "Paid", notes: editRec.notes || "" }}
          fields={[
            {key:"paymentStatus", label:"Payment Status", type:"select", options:["Paid","Refunded","Voided"]},
            {key:"notes", label:"Notes", type:"textarea"},
          ]}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. POS CREATE — real product grid from API
// ═══════════════════════════════════════════════════════════════
export function POSCreate() {
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { products, loading: prodLoading } = useProducts();
const { customers } = useCustomers();
  const { locations } = useLocations();
  const { groups: priceGroups } = useSellingPriceGroups();
const [cart,     setCart]     = useState([]);
  const [customer, setCustomer] = useState("Walk-In Customer");
  const [customerId, setCustomerId] = useState(null);
  const [priceGroupId, setPriceGroupId] = useState(""); // "" = default selling price
  const [payMethod,setPayMethod]= useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [taxRate,  setTaxRate]  = useState(0);
  const [notes,    setNotes]    = useState("");
  const [receipt,  setReceipt]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [gridQ,    setGridQ]    = useState("");

  // Looks up this product's price for the currently selected price group.
  // Falls back to the product's normal selling price if no group price is set.
  const getPriceForGroup = async (product) => {
  if (!priceGroupId) return product.selling_price;
  const group = priceGroups.find(g => String(g.id) === String(priceGroupId));
  if (!group) return product.selling_price;
  const pct = Number(group.percentage) || 0;
  const base = Number(product.selling_price) || 0;
  if (group.type === "Markup") return base + (base * pct / 100);
  if (group.type === "Discount") return base - (base * pct / 100);
  return base;
};

  const addToCart = async p => {
    const stock = Number(p.stock) || 0;
    const price = await getPriceForGroup(p);
    setCart(prev=>{
      const ex=prev.find(c=>c.id===p.id);
      if(ex) {
        if (ex.qty + 1 > stock) { alert(`Cannot add more "${p.name}" — only ${stock} in stock`); return prev; }
        return prev.map(c=>c.id===p.id?{...c,qty:c.qty+1}:c);
      }
      if (stock < 1) { alert(`"${p.name}" is out of stock`); return prev; }
      return [...prev,{id:p.id,name:p.name,sku:p.sku||"",price,qty:1}];
    });
  };

  // If the user switches price group AFTER already adding items, re-price
  // everything already in the cart so totals stay correct.
  useEffect(() => {
    if (cart.length === 0) return;
    (async () => {
      const repriced = await Promise.all(cart.map(async c => {
        const prod = products.find(p => p.id === c.id);
        if (!prod) return c;
        const price = await getPriceForGroup(prod);
        return { ...c, price };
      }));
      setCart(repriced);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceGroupId]);
 const updQty = (id,qty) => {
    if(qty<1){setCart(prev=>prev.filter(c=>c.id!==id));return;}
    const prod = products.find(p=>p.id===id);
    const stock = prod ? Number(prod.stock) || 0 : null;
    if (stock !== null && qty > stock) {
      alert(`Cannot sell ${qty} of "${prod.name}" — only ${stock} in stock`);
      return;
    }
    setCart(prev=>prev.map(c=>c.id===id?{...c,qty}:c));
  };
  const removeFromCart = id => setCart(prev=>prev.filter(c=>c.id!==id));

  const subtotal  = cart.reduce((s,c)=>s+c.price*c.qty, 0);
  const discAmt   = subtotal*(discount/100);
  const taxable   = subtotal-discAmt;
  const taxAmt    = taxable*(taxRate/100);
  const grandTotal= taxable+taxAmt;

  const gridProducts = products.filter(p =>
    !gridQ || p.name.toLowerCase().includes(gridQ.toLowerCase()) ||
    (p.sku||"").toLowerCase().includes(gridQ.toLowerCase())
  );
const handleCompleteSale = async () => {
    if(cart.length===0){alert("Add at least one product.");return;}
    for (const c of cart) {
      const prod = products.find(p=>p.id===c.id);
      const stock = prod ? Number(prod.stock) || 0 : 0;
      if (c.qty > stock) { alert(`Insufficient stock for "${c.name}": only ${stock} available`); return; }
    }
   setSaving(true);
    const refNo = genNo("POS");
    const res = await apiFetch("/pos-sales",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        refNo, date:new Date().toISOString().slice(0,10),
        customer, customerId, paymentMethod:payMethod, paymentStatus:"Paid",
        discount, taxAmt:taxAmt.toFixed(2), grandTotal:grandTotal.toFixed(2),
        affectsStock:true, notes, items:cart,
      }),
    });
    setSaving(false);
    if (!res) {
      alert("Sale failed to save — check backend terminal for the real error.");
      return;
    }
    setReceipt({refNo,customer,payMethod,cart,discount,taxAmt,grandTotal,date:new Date().toLocaleString("en-IN")});
  };  if(receipt){
    return (
      <div style={PAGE}>
        <PageHeader title="Sale Complete" breadcrumb="POS / Receipt"
          actions={<>
            <GhostBtn label="Print" icon={IC.print} onClick={()=>window.print()}/>
            <GhostBtn label="New Sale" onClick={()=>{setReceipt(null);setCart([]);setDiscount(0);}}/>
            <PrimaryBtn label="Back to POS List" onClick={()=>navigate("/pos")}/>
          </>}/>
        <div style={{flex:1,overflowY:"auto",display:"flex",justifyContent:"center",padding:"30px 20px"}}>
          <div style={{width:400,background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10,padding:"28px 24px"}}>
 <div style={{textAlign:"center",marginBottom:20}}>
              {business?.logo_url && (
                <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${business.logo_url}`}
                  alt="Logo" style={{width:44,height:44,borderRadius:8,objectFit:"cover",marginBottom:8}}/>
              )}
              <div style={{fontSize:22,fontWeight:800,color:GREEN}}>{business?.business_name || "Manod ERP"}</div>
              <div style={{fontSize:13,color:TEXT_MUTED}}>POS Receipt</div>
              <div style={{marginTop:10,padding:"6px 0",borderTop:`1px dashed ${BORDER}`,borderBottom:`1px dashed ${BORDER}`}}>
                <div style={{fontSize:11,color:TEXT_MUTED}}>Ref: {receipt.refNo}</div>
                <div style={{fontSize:11,color:TEXT_MUTED}}>{receipt.date}</div>
                <div style={{fontSize:11,color:TEXT_MUTED}}>Customer: {receipt.customer}</div>
              </div>
            </div>
            {receipt.cart.map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontSize:13}}>
                <span>{c.name} x{c.qty}</span>
                <span style={{fontWeight:600}}>Rs. {fmt(c.price*c.qty)}</span>
              </div>
            ))}
            <div style={{marginTop:12}}>
              {receipt.discount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",color:RED}}>
                <span>Discount ({receipt.discount}%)</span><span>- Rs. {fmt(subtotal*receipt.discount/100)}</span>
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",color:AMBER}}>
                <span>Tax (GST {taxRate}%)</span><span>+ Rs. {fmt(receipt.taxAmt)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:800,color:GREEN,padding:"10px 0 0",borderTop:`2px solid ${BORDER}`,marginTop:6}}>
                <span>Total Paid</span><span>Rs. {fmt(receipt.grandTotal)}</span>
              </div>
              <div style={{marginTop:8,fontSize:12,color:TEXT_MUTED,textAlign:"center"}}>Payment: {receipt.payMethod}</div>
            </div>
            <div style={{textAlign:"center",marginTop:16,fontSize:12,color:TEXT_MUTED,paddingTop:12,borderTop:`1px dashed ${BORDER}`}}>Thank you!</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={PAGE}>
      <PageHeader title="Point of Sale" breadcrumb="Home / Sell / POS Billing"
        actions={<GhostBtn label="Close POS" onClick={()=>navigate("/pos")}/>}/>
      <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
        {/* LEFT product grid */}
        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",borderRight:`1px solid ${BORDER}`,overflow:"hidden"}}>
         <div style={{padding:"10px 16px",borderBottom:`1px solid ${BORDER}`,display:"flex",gap:10,flexShrink:0}}>
        <div style={{flex:1}}>
            <CustomerCombobox
                value={customer}
                onChange={async (name, obj) => {
                  setCustomer(name);
                  setCustomerId(obj?.id || null);
                  // NEW: auto-detect Customer Group pricing for POS too
                  if (obj?.id) {
                    const info = await apiFetch(`/contacts/${obj.id}/pricing-info`);
                    const groupId = info?.pricing?.selling_price_group_id;
                    setPriceGroupId(groupId ? String(groupId) : "");
                  } else {
                    setPriceGroupId("");
                  }
                }}
                customers={customers}
                placeholder="Walk-In Customer..."
              />  
            </div>
            <div style={{width:170}}>
              <Sel value={priceGroupId} onChange={e=>setPriceGroupId(e.target.value)}>
                <option value="">Default Price</option>
                {priceGroups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </Sel>
            </div>
            <div style={{flex:2}}>
              <ProductSearchDropdown products={products} loading={prodLoading} onSelect={addToCart} placeholder="Search by name, SKU, barcode..."/>
            </div>
          </div>
          <div style={{padding:"7px 16px",borderBottom:`1px solid ${BORDER}`,background:"#fafafa",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <SearchBox value={gridQ} onChange={setGridQ} placeholder="Filter grid..." width={180}/>
            <span style={{fontSize:12,color:TEXT_MUTED}}>
              {prodLoading ? <span style={{display:"flex",alignItems:"center",gap:5}}><Spinner/> Loading...</span>
                : products.length===0 ? "No products — add in Products module"
                : `${gridProducts.length} / ${products.length} products`}
            </span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
            {prodLoading ? (
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:200,flexDirection:"column",gap:12}}>
                <Spinner/>
                <div style={{fontSize:13,color:TEXT_MUTED}}>Loading products from database...</div>
              </div>
            ) : products.length===0 ? (
              <div style={{textAlign:"center",padding:40,color:TEXT_MUTED}}>
                <div style={{fontSize:32,marginBottom:8}}>📦</div>
                <div style={{fontSize:14,fontWeight:600}}>No products found</div>
                <div style={{fontSize:12,marginTop:4}}>Add products in the Products module first</div>
                <button onClick={()=>window.location.href="/products/create"}
                  style={{marginTop:12,padding:"8px 18px",background:GREEN_GRAD,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:F}}>
                  Go to Add Product
                </button>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
                {gridProducts.slice(0,40).map(p=>(
                  <div key={p.id} onClick={()=>addToCart(p)}
                    style={{background:"#fff",border:`1px solid ${cart.find(c=>c.id===p.id)?GREEN:BORDER}`,borderRadius:8,padding:"12px 10px",cursor:"pointer",textAlign:"center",transition:"all 0.15s",position:"relative"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=GREEN;e.currentTarget.style.boxShadow="0 2px 8px rgba(26,107,63,0.12)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=cart.find(c=>c.id===p.id)?GREEN:BORDER;e.currentTarget.style.boxShadow="none";}}>
                    {cart.find(c=>c.id===p.id) && (
                      <span style={{position:"absolute",top:4,right:4,background:GREEN,color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>
                        {cart.find(c=>c.id===p.id).qty}
                      </span>
                    )}
                    <div style={{fontSize:24,marginBottom:6}}>🛍️</div>
                    <div style={{fontSize:12,fontWeight:600,color:TEXT_MAIN,lineHeight:1.3,marginBottom:4}}>{p.name}</div>
                    {p.sku && <div style={{fontSize:10,color:TEXT_MUTED}}>{p.sku}</div>}
                    <div style={{fontSize:13,fontWeight:700,color:GREEN,marginTop:6}}>Rs. {fmt(p.selling_price)}</div>
                    {p.stock!==undefined && <div style={{fontSize:10,color:p.stock>0?"#16a34a":RED,marginTop:2}}>
                      {p.stock>0?`Stock: ${p.stock}`:"Out of stock"}
                    </div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT cart */}
        <div style={{width:340,flexShrink:0,display:"flex",flexDirection:"column",background:"#fff"}}>
          <div style={{flex:1,overflowY:"auto",minHeight:0}}>
            {cart.length===0 ? (
              <div style={{padding:40,textAlign:"center",color:TEXT_MUTED,fontSize:13}}>
                <div style={{fontSize:32,marginBottom:8}}>🛒</div>Cart is empty
              </div>
            ) : (
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#f8fafc"}}>
                  <th style={{padding:"8px 12px",fontSize:11,fontWeight:600,color:TEXT_MUTED,textAlign:"left",borderBottom:`1px solid ${BORDER}`}}>Item</th>
                  <th style={{padding:"8px 8px",fontSize:11,fontWeight:600,color:TEXT_MUTED,textAlign:"center",borderBottom:`1px solid ${BORDER}`}}>Qty</th>
                  <th style={{padding:"8px 12px",fontSize:11,fontWeight:600,color:TEXT_MUTED,textAlign:"right",borderBottom:`1px solid ${BORDER}`}}>Total</th>
                  <th style={{padding:"8px 8px",borderBottom:`1px solid ${BORDER}`}}></th>
                </tr></thead>
                <tbody>
                  {cart.map(c=>(
                    <tr key={c.id} style={{borderBottom:`1px solid ${BORDER}`}}>
                      <td style={{padding:"8px 12px"}}>
                        <div style={{fontSize:13,fontWeight:600}}>{c.name}</div>
                        <div style={{fontSize:11,color:TEXT_MUTED}}>Rs. {fmt(c.price)} each</div>
                      </td>
                      <td style={{padding:"8px 8px",textAlign:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}>
                          <button onClick={()=>updQty(c.id,c.qty-1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${BORDER}`,background:"#f8fafc",cursor:"pointer",fontSize:14}}>−</button>
                          <span style={{fontSize:13,fontWeight:600,minWidth:22,textAlign:"center"}}>{c.qty}</span>
                          <button onClick={()=>updQty(c.id,c.qty+1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${BORDER}`,background:"#f8fafc",cursor:"pointer",fontSize:14}}>+</button>
                        </div>
                      </td>
                      <td style={{padding:"8px 12px",textAlign:"right",fontWeight:700,color:GREEN}}>Rs. {fmt(c.price*c.qty)}</td>
                      <td style={{padding:"8px 8px"}}><IBtn icon={IC.x} onClick={()=>removeFromCart(c.id)} color={RED}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{borderTop:`1px solid ${BORDER}`,padding:"14px 16px",flexShrink:0}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><FL>Payment Method</FL>
                <Sel value={payMethod} onChange={e=>setPayMethod(e.target.value)} style={{fontSize:12}}>
                  {["Cash","UPI","Card","Bank Transfer"].map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div><FL>Discount (%)</FL><Inp type="number" value={discount} onChange={e=>setDiscount(Number(e.target.value))} min="0" max="100"/></div>
              <div><FL>Tax Rate (GST %)</FL>
                <Sel value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} style={{fontSize:12}}>
                  {[0,5,12,18,28].map(v=><option key={v} value={v}>{v}%</option>)}
                </Sel>
              </div>
            </div>
            <div style={{background:LIGHT_GRN,borderRadius:8,padding:"12px 14px",marginBottom:12}}>
              {discount>0 && <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,color:RED}}>
                <span>Discount ({discount}%)</span><span>- Rs. {fmt(discAmt)}</span>
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,color:AMBER}}>
                <span>Tax (GST {taxRate}%)</span><span>+ Rs. {fmt(taxAmt)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:800,color:GREEN,paddingTop:8,borderTop:`1px solid #a7f3d0`,marginTop:4}}>
                <span>Grand Total</span><span>Rs. {fmt(grandTotal)}</span>
              </div>
            </div>
            <button onClick={handleCompleteSale} disabled={saving||cart.length===0}
              style={{width:"100%",padding:"13px",background:cart.length===0?"#94a3b8":GREEN_GRAD,color:"#fff",border:"none",borderRadius:8,fontSize:15,cursor:cart.length===0?"not-allowed":"pointer",fontFamily:F,fontWeight:700}}>
              {saving?"Processing...":`Complete Sale — Rs. ${fmt(grandTotal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// 5. ADD DRAFT
// Drafts live in the SAME `sales_invoices` table as Add Sale, just
// with doc_status='Draft' — there is no separate "drafts" table
// and none is needed. If saving fails, check the backend terminal
// for the real Postgres error.
// ═══════════════════════════════════════════════════════════════
export function AddDraft() {
  const navigate = useNavigate();
  const { products, loading: prodLoading } = useProducts();
  const { customers } = useCustomers();
  const { locations } = useLocations();
  const [draftNo,  setDraftNo]  = useState(()=>genNo("DRF"));
  const [draftDate,setDraftDate]= useState(new Date().toISOString().slice(0,10));
  const [customer, setCustomer] = useState("");
  const [customerType, setCustomerType] = useState("Walk-In");
 const [warehouse,setWarehouse]= useState("");
  const [notes,    setNotes]    = useState("");
  const [items,    setItems]    = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [errMsg,   setErrMsg]   = useState("");

useEffect(() => {
    if (!warehouse && locations.length > 0) setWarehouse(locations[0].location_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const onCust = (name, obj) => {
    setCustomer(name);
    if (obj?.customer_type || obj?.type) setCustomerType(obj.customer_type || obj.type);
  };
 const addProduct = p => {
    if (!items.some(i=>i.id===p.id))
      setItems(prev=>[...prev,{id:p.id,productId:p.id,product:p.name,name:p.name,sku:p.sku||"",qty:1,unitPrice:p.selling_price,stock:Number(p.stock)||0}]);
  };
  const upd = (id,k,v) => setItems(prev=>prev.map(i=>i.id===id?{...i,[k]:v}:i));
  const subtotal = items.reduce((s,r)=>s+r.qty*r.unitPrice, 0);

 const handleSave = async () => {
    if (saving) return; // guard against double-submit (double-click / convert re-fire)
    if (!customer) { alert("Customer is required."); return; }
    if (items.length===0) { alert("Add at least one product."); return; }
    setSaving(true); setErrMsg("");
    const res = await apiFetch("/sales-drafts", {
  method:"POST",
  headers:{ "Content-Type":"application/json" },
  body:JSON.stringify({
    invoiceNo: draftNo,
    invoiceDate: draftDate,
    customer,
    customerType,
    warehouse,
    notes,
    grandTotal: subtotal.toFixed(2),
    items,
  }),
});
    setSaving(false);
    if (res) navigate("/sells/drafts");
    else { setErrMsg("Save failed"); alert("Save failed — check backend terminal for the real error"); }
  };
  return (
    <div style={PAGE}>
      <PageHeader title="Add Draft" breadcrumb={`Home / Sell / Drafts / New — ${draftNo}`}
        actions={<>
          <GhostBtn label="Cancel" onClick={()=>navigate("/sells/drafts")}/>
          <PrimaryBtn label={saving?"Saving...":"Save Draft"} icon={IC.save} onClick={handleSave} disabled={saving}/>
        </>}/>
      <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"20px 20px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
          {errMsg && (
            <div style={{background:"#fef2f2",border:`1px solid #fecaca`,borderRadius:8,padding:"10px 14px",fontSize:12,color:RED}}>
              Server said: {errMsg}
            </div>
          )}
          <Card>
            <CardTitle>Draft Details</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div><FL>Draft Number</FL><Inp value={draftNo} onChange={e=>setDraftNo(e.target.value)}/></div>
              <div><FL>Draft Date</FL><Inp type="date" value={draftDate} onChange={e=>setDraftDate(e.target.value)}/></div>
              <div><FL>Warehouse</FL>
               <Sel value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
                  {locations.length===0
                    ? <option>Manod HQ</option>
                    : locations.map(l=><option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                </Sel>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <FL required>Customer</FL>
                <CustomerCombobox value={customer} onChange={onCust} customers={customers}/>
              </div>
              <div>
                <FL>Customer Type</FL>
                <Sel value={customerType} onChange={e=>setCustomerType(e.target.value)}>
                  {CUSTOMER_TYPES.map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
            </div>
          </Card>
          <Card style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${BORDER}`}}>
              <span style={{fontSize:13,fontWeight:700,color:TEXT_MAIN}}>Products</span>
              {prodLoading
                ?<span style={{fontSize:11,color:AMBER,display:"flex",alignItems:"center",gap:5}}><Spinner/> Loading...</span>
                :<span style={{fontSize:11,color:GREEN}}>✓ {products.length} available</span>}
            </div>
            <ProductSearchDropdown products={products} loading={prodLoading} onSelect={addProduct}/>
            <div style={{marginTop:12,border:`1px solid ${BORDER}`,borderRadius:8,overflow:"hidden"}}>
              {items.length===0
                ?<div style={{padding:28,textAlign:"center",color:TEXT_MUTED,fontSize:13}}>
                  {prodLoading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/>Loading products...</span>:"Search above to add products"}
                </div>
             :<table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {["#","Product","SKU","Stock","Qty","Unit Price (Rs.)","Total (Rs.)",""].map((h,i)=>(
                      <th key={i} style={{padding:"8px 10px",fontWeight:600,fontSize:11,color:TEXT_MUTED,borderBottom:`1px solid ${BORDER}`,textTransform:"uppercase",textAlign:i>=3&&i<=6?"right":"left"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {items.map((r,i)=>(
                      <tr key={r.id} style={{borderBottom:`1px solid ${BORDER}`}}>
                        <td style={{padding:"8px 10px",color:TEXT_MUTED,width:28}}>{i+1}</td>
                        <td style={{padding:"8px 10px",fontWeight:600}}>{r.name}</td>
                        <td style={{padding:"8px 10px",color:TEXT_MUTED,fontSize:11}}>{r.sku||"—"}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>
                          <span style={{fontSize:11,color:r.stock>0?"#16a34a":RED,background:r.stock>0?"#f0fdf4":"#fef2f2",padding:"2px 6px",borderRadius:4,fontWeight:600}}>
                            {r.stock ?? "—"}
                          </span>
                        </td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}><NInp value={r.qty} min={1} onChange={e=>upd(r.id,"qty",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>Rs. {fmt(r.unitPrice)}</td>
                        <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:GREEN}}>Rs. {fmt(r.qty*r.unitPrice)}</td>
                        <td style={{padding:"8px 6px"}}><IBtn icon={IC.x} onClick={()=>setItems(prev=>prev.filter(i=>i.id!==r.id))} color={RED}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          </Card>
          <Card><FL>Notes / Internal Remarks</FL><TextArea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional..." rows={2}/></Card>
        </div>
        <div style={{width:260,flexShrink:0,borderLeft:`1px solid ${BORDER}`,background:"#fff",padding:"20px 18px"}}>
          <Card style={{border:"none",padding:0}}>
            <CardTitle>Draft Summary</CardTitle>
            <SumRow label="Total Items"    value={items.length}/>
            <SumRow label="Subtotal (Est.)" value={`Rs. ${fmt(subtotal)}`} bold/>
            <div style={{marginTop:14,padding:"12px",background:"#fff3cd",borderRadius:8,border:"1px solid #fde68a"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#92400e"}}>Draft Notice</div>
              <div style={{fontSize:11,color:"#92400e",marginTop:4,lineHeight:1.5}}>
                Saving as draft will NOT reduce stock or create accounting entries. Convert to invoice when ready.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. LIST DRAFTS
// ═══════════════════════════════════════════════════════════════
export function ListDrafts() {
  const navigate = useNavigate();
  const { data, loading, refresh } = useAPI("/sales-drafts");
  const drafts = data?.data || [];
  const [viewRec, setViewRec] = useState(null);
  const [editRec, setEditRec] = useState(null);

 const handleDelete = async (d) => {
    if (!window.confirm(`Delete draft ${d.invoiceNo}? This cannot be undone.`)) return;
    const res = await apiFetch(`/sales-drafts/${d.id}`, { method:"DELETE" });
    if (res) refresh(); else alert("Delete failed — check server");
  };

 const handleEditSave = async (form) => {
    const res = await apiFetch(`/sales-drafts/${editRec.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res) { setEditRec(null); refresh(); } else alert("Update failed — check server");
  };
  const cols = [
    {label:"Draft No."},{label:"Date"},
    {label:"Customer"},{label:"Location"},{label:"Items"},{label:"Total (Rs.)",right:true},{label:"Status"},{label:"Action",center:true},
  ];
  const rows = drafts.map((d,i)=>(
    <>
      <Td mono>{d.invoiceNo||`DRF-${String(i+1).padStart(4,"0")}`}</Td>
      <Td>{fmtDate(d.invoiceDate||d.date)}</Td>
      <Td>{d.customer||"—"}</Td>
      <Td muted>{d.warehouse||"Manod HQ"}</Td>
      <Td center>{d.items?.length||0}</Td>
      <Td right><span style={{fontWeight:700,color:GREEN}}>Rs. {fmt(d.grandTotal)}</span></Td>
      <Td><Badge status="Draft"/></Td>
      <Td center><div style={{display:"flex",gap:2,justifyContent:"center"}}>
        <IBtn icon={IC.eye} title="View" onClick={()=>setViewRec(d)}/>
        <IBtn icon={IC.edit} title="Edit" onClick={()=>setEditRec(d)}/>
        <IBtn icon={IC.convert} title="Convert to Invoice"
          onClick={(e)=>{ e.currentTarget.disabled = true; navigate(`/sells/create?from=draft&id=${d.id}`); }}/>
        <IBtn icon={IC.trash} title="Delete" color={RED} onClick={()=>handleDelete(d)}/>
      </div></Td>
    </>
  ));
  return (
    <div style={PAGE}>
      <PageHeader title="Drafts" breadcrumb="Home / Sell / Drafts"
        actions={<PrimaryBtn label="Add Draft" icon={IC.plus} onClick={()=>navigate("/sells/add-draft")}/>}/>
      <div style={{flex:1,minHeight:0,padding:"16px 24px",display:"flex",flexDirection:"column"}}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No drafts saved."
          footer={<span style={{fontSize:12,color:TEXT_MUTED}}>{drafts.length} draft(s) total</span>}/>
      </div>

      {viewRec && (
        <QuickView title={viewRec.invoiceNo} subtitle={fmtDate(viewRec.invoiceDate||viewRec.date)}
          onClose={()=>setViewRec(null)} items={viewRec.items}
          rows={[
            {label:"Customer", value:viewRec.customer},
            {label:"Warehouse", value:viewRec.warehouse},
            {label:"Notes", value:viewRec.notes||"—"},
            {label:"Subtotal", value:`Rs. ${fmt(viewRec.grandTotal)}`},
          ]}/>
      )}
      {editRec && (
        <QuickEdit title={`Edit ${editRec.invoiceNo}`} onClose={()=>setEditRec(null)} onSave={handleEditSave}
          initial={{ notes: editRec.notes || "", salesperson: editRec.salesperson || "" }}
          fields={[
            {key:"salesperson", label:"Salesperson"},
            {key:"notes", label:"Notes", type:"textarea"},
          ]}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. ADD QUOTATION
// ═══════════════════════════════════════════════════════════════
export function AddQuotation() {
  const navigate = useNavigate();
  const { products, loading: prodLoading } = useProducts();
  const { customers } = useCustomers();
  const { locations } = useLocations();
  const [quotNo,      setQuotNo]      = useState(()=>genNo("QOT"));
  const [quotDate,    setQuotDate]    = useState(new Date().toISOString().slice(0,10));
  const [validUntil,  setValidUntil]  = useState(()=>{const d=new Date();d.setDate(d.getDate()+30);return d.toISOString().slice(0,10);});
  const [customer,    setCustomer]    = useState("");
  const [customerType,setCustomerType]= useState("Walk-In");
  const [contactPerson,setContactPerson] = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [salesperson, setSalesperson] = useState("");
const [warehouse,   setWarehouse]   = useState("");
  const [items,       setItems]       = useState([]);
  const [globalDisc,  setGlobalDisc]  = useState(0);
  const [taxRate,     setTaxRate]     = useState(0);
  const [shipping,    setShipping]    = useState(0);
  const [notes,       setNotes]       = useState("");
  const [terms,       setTerms]       = useState("");
  const [docStatus,   setDocStatus]   = useState("Draft");
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!warehouse && locations.length > 0) setWarehouse(locations[0].location_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const handleCustChange = (name, obj) => {
    setCustomer(name);
    if (obj) {
      if (obj.email)              setEmail(obj.email);
      if (obj.phone||obj.mobile)  setPhone(obj.phone||obj.mobile||"");
      if (obj.customer_type||obj.type) setCustomerType(obj.customer_type||obj.type);
    }
  };
  const addProduct = p => {
    if (!items.some(i=>i.id===p.id))
      setItems(prev=>[...prev,{id:p.id,productId:p.id,product:p.name,sku:p.sku||"",stock:Number(p.stock)||0,qty:1,unit:"Pcs",unitPrice:p.selling_price,discount:0,tax:taxRate}]);
  };
  const upd = (id,k,v) => setItems(prev=>prev.map(i=>i.id===id?{...i,[k]:v}:i));

  const lSub  = r => r.qty*r.unitPrice;
  const lDisc = r => lSub(r)*(r.discount/100);
  const lTax  = r => (lSub(r)-lDisc(r))*(r.tax/100);
  const lTot  = r => lSub(r)-lDisc(r)+lTax(r);
  const subtotal   = items.reduce((s,r)=>s+lSub(r),0);
  const discTotal  = items.reduce((s,r)=>s+lDisc(r),0);
  const globalDA   = (subtotal-discTotal)*(globalDisc/100);
  const taxTotal   = items.reduce((s,r)=>s+lTax(r),0);
  const grandTotal = subtotal-discTotal-globalDA+taxTotal+Number(shipping);
const handleSave = async () => {
    if (!customer) { alert("Customer is required."); return; }
    if (items.length===0) { alert("Add at least one product."); return; }
    setSaving(true);
   const res = await apiFetch("/quotations", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        quotNo, quotDate, validUntil, docStatus,
        customer, customerType, contactPerson, email, phone,
        salesperson, warehouse,
        globalDisc,
        taxTotal,
        shipping: Number(shipping),
        grandTotal: grandTotal.toFixed(2),
        notes, terms,
        affectsStock: docStatus === "Accepted",
        items,
      }),
    });
    setSaving(false);
    if (res) navigate("/sells/quotations");
    else alert("Save failed — check server logs for /api/quotations POST");
  };
  return (
    <div style={PAGE}>
      <PageHeader title="New Quotation" breadcrumb={`Home / Sell / Quotations / New — ${quotNo}`}
        actions={<>
          <select value={docStatus} onChange={e=>setDocStatus(e.target.value)}
            style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 12px",fontSize:12,fontFamily:F,background:"#fff",cursor:"pointer"}}>
            {["Draft","Sent","Accepted","Rejected"].map(s=><option key={s}>{s}</option>)}
          </select>
          <GhostBtn label="Cancel" onClick={()=>navigate("/sells/quotations")}/>
          <PrimaryBtn label={saving?"Saving...":"Save Quotation"} icon={IC.save} onClick={handleSave} disabled={saving}/>
        </>}/>
      <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"20px 20px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <CardTitle>Quotation Details</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div><FL>Quotation Number</FL><Inp value={quotNo} onChange={e=>setQuotNo(e.target.value)}/></div>
              <div><FL>Quotation Date</FL><Inp type="date" value={quotDate} onChange={e=>setQuotDate(e.target.value)}/></div>
              <div><FL>Valid Until</FL><Inp type="date" value={validUntil} onChange={e=>setValidUntil(e.target.value)}/></div>
              <div><FL>Salesperson</FL>
                <Sel value={salesperson} onChange={e=>setSalesperson(e.target.value)}>
                  <option value="">— None —</option><option>Admin</option><option>Sales Rep</option><option>Cashier</option>
                </Sel>
              </div>
             <div><FL>Warehouse</FL>
                <Sel value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
                  {locations.length===0
                    ? <option>Manod HQ</option>
                    : locations.map(l=><option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                </Sel>
              </div>
            </div>
          </Card>
          <Card>
            <CardTitle>Customer Information</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{gridColumn:"span 2"}}>
                <FL required>Customer</FL>
                <CustomerCombobox value={customer} onChange={handleCustChange} customers={customers}/>
              </div>
              <div><FL>Customer Type</FL>
                <Sel value={customerType} onChange={e=>setCustomerType(e.target.value)}>
                  {CUSTOMER_TYPES.map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div><FL>Contact Person</FL><Inp value={contactPerson} onChange={e=>setContactPerson(e.target.value)} placeholder="Optional"/></div>
              <div><FL>Email</FL><Inp type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="customer@email.com"/></div>
              <div><FL>Phone</FL><Inp value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"/></div>
            </div>
          </Card>
          <Card style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${BORDER}`}}>
              <span style={{fontSize:13,fontWeight:700,color:TEXT_MAIN}}>Products</span>
              {prodLoading
                ?<span style={{fontSize:11,color:AMBER,display:"flex",alignItems:"center",gap:5}}><Spinner/> Loading...</span>
                :<span style={{fontSize:11,color:GREEN}}>✓ {products.length} available</span>}
            </div>
            <ProductSearchDropdown products={products} loading={prodLoading} onSelect={addProduct}/>
            <div style={{marginTop:12,border:`1px solid ${BORDER}`,borderRadius:8,overflow:"hidden"}}>
              {items.length===0
                ?<div style={{padding:28,textAlign:"center",color:TEXT_MUTED,fontSize:13}}>Search above to add products</div>
              :<table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {["#","Product","Stock","Qty","Unit","Unit Price","Disc %","Tax %","Total",""].map((h,i)=>(
                      <th key={i} style={{padding:"8px 10px",fontWeight:600,fontSize:11,color:TEXT_MUTED,borderBottom:`1px solid ${BORDER}`,textTransform:"uppercase",textAlign:i>=2&&i<=8?"right":"left"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {items.map((r,i)=>(
                      <tr key={r.id} style={{borderBottom:`1px solid ${BORDER}`}}>
                        <td style={{padding:"8px 10px",color:TEXT_MUTED,width:28}}>{i+1}</td>
                        <td style={{padding:"8px 10px",fontWeight:600}}>{r.product}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>
                          <span style={{fontSize:11,color:r.stock>0?"#16a34a":RED,background:r.stock>0?"#f0fdf4":"#fef2f2",padding:"2px 6px",borderRadius:4,fontWeight:600}}>
                            {r.stock ?? "—"}
                          </span>
                        </td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}><NInp value={r.qty} min={1} onChange={e=>upd(r.id,"qty",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px"}}>
                          <select value={r.unit} onChange={e=>upd(r.id,"unit",e.target.value)} style={{border:`1px solid ${BORDER}`,borderRadius:4,padding:"4px 6px",fontSize:12,fontFamily:F}}>
                            {["Pcs","Box","Kg","L","Pack","Set"].map(u=><option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}><NInp value={r.unitPrice} width={85} onChange={e=>upd(r.id,"unitPrice",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}><NInp value={r.discount} width={55} max={100} onChange={e=>upd(r.id,"discount",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}><NInp value={r.tax} width={55} max={100} onChange={e=>upd(r.id,"tax",Number(e.target.value))}/></td>
                        <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:GREEN}}>Rs. {fmt(lTot(r))}</td>
                        <td style={{padding:"8px 6px"}}><IBtn icon={IC.x} onClick={()=>setItems(prev=>prev.filter(i=>i.id!==r.id))} color={RED}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:12}}>
              <div><FL>Global Discount (%)</FL><Inp type="number" value={globalDisc} onChange={e=>setGlobalDisc(Number(e.target.value))} min="0" max="100"/></div>
              <div><FL>Tax Rate (GST %)</FL>
                <Sel value={taxRate} onChange={e=>{const v=Number(e.target.value);setTaxRate(v);setItems(p=>p.map(i=>({...i,tax:v})));} }>
                  {[0,5,12,18,28].map(v=><option key={v} value={v}>{v}%</option>)}
                </Sel>
              </div>
              <div><FL>Shipping (Rs.)</FL><Inp type="number" value={shipping} onChange={e=>setShipping(e.target.value)} min="0"/></div>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card><FL>Notes</FL><TextArea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes for the customer..." rows={3}/></Card>
            <Card><FL>Terms &amp; Conditions</FL><TextArea value={terms} onChange={e=>setTerms(e.target.value)} placeholder="Payment terms, delivery conditions..." rows={3}/></Card>
          </div>
        </div>
        <div style={{width:260,flexShrink:0,borderLeft:`1px solid ${BORDER}`,background:"#fff",padding:"20px 18px"}}>
          <Card style={{border:"none",padding:0}}>
            <CardTitle>Quotation Summary</CardTitle>
            <SumRow label="Subtotal"   value={`Rs. ${fmt(subtotal)}`}/>
            <SumRow label="Discount"   value={`- Rs. ${fmt(discTotal+globalDA)}`} color="#ef4444"/>
            <SumRow label="Tax (GST)"  value={`+ Rs. ${fmt(taxTotal)}`} color={AMBER}/>
            {Number(shipping)>0 && <SumRow label="Shipping" value={`+ Rs. ${fmt(shipping)}`}/>}
            <SumRow label="Grand Total" value={`Rs. ${fmt(grandTotal)}`} big border/>
            <div style={{marginTop:16,padding:"12px",background:"#dbeafe",borderRadius:8,border:"1px solid #bfdbfe"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#1e40af"}}>Quotation Notice</div>
              <div style={{fontSize:11,color:"#1e40af",marginTop:4,lineHeight:1.5}}>Does NOT affect stock. Convert to Sales Invoice when accepted.</div>
            </div>
            <div style={{marginTop:14}}><GhostBtn label="Print Quotation" icon={IC.print} onClick={()=>window.print()} small/></div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. LIST QUOTATIONS
// ═══════════════════════════════════════════════════════════════
export function ListQuotations() {
  const navigate = useNavigate();
  const { data, loading, refresh } = useAPI("/quotations");
  const quotations = data?.data || [];
  const [search, setSearch] = useState("");
  const [viewRec, setViewRec] = useState(null);
  const [editRec, setEditRec] = useState(null);
  const filtered = quotations.filter(q=>!search||`${q.quotNo} ${q.customer}`.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete quotation ${q.quotNo}? This cannot be undone.`)) return;
    const res = await apiFetch(`/quotations/${q.id}`, { method:"DELETE" });
    if (res) refresh(); else alert("Delete failed — check server");
  };

  const handleEditSave = async (form) => {
    const res = await apiFetch(`/quotations/${editRec.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res) { setEditRec(null); refresh(); } else alert("Update failed — check server");
  };

  const cols = [
    {label:"Quotation No."},{label:"Date"},
    {label:"Customer"},{label:"Valid Until"},{label:"Status"},{label:"Total (Rs.)",right:true},{label:"Action",center:true},
  ];
  const rows = filtered.map((q,i)=>(
    <>
      <Td mono>{q.quotNo||`QOT-${String(i+1).padStart(4,"0")}`}</Td>
      <Td>{fmtDate(q.quotDate)}</Td>
      <Td>{q.customer||"—"}</Td>
      <Td muted>{fmtDate(q.validUntil)}</Td>
      <Td><Badge status={q.docStatus||"Draft"}/></Td>
      <Td right><span style={{fontWeight:700,color:GREEN}}>Rs. {fmt(q.grandTotal)}</span></Td>
      <Td center><div style={{display:"flex",gap:2,justifyContent:"center"}}>
        <IBtn icon={IC.eye} title="View" onClick={()=>setViewRec(q)}/>
        <IBtn icon={IC.edit} title="Edit" onClick={()=>setEditRec(q)}/>
        <IBtn icon={IC.print} title="Print" onClick={()=>window.print()}/>
        <IBtn icon={IC.convert} title="Convert to Invoice" onClick={()=>navigate(`/sells/create?from=quotation&id=${q.id}`)}/>
        <IBtn icon={IC.trash} title="Delete" color={RED} onClick={()=>handleDelete(q)}/>
      </div></Td>
    </>
  ));
  return (
    <div style={PAGE}>
      <PageHeader title="Quotations" breadcrumb="Home / Sell / Quotations"
        actions={<PrimaryBtn label="Add Quotation" icon={IC.plus} onClick={()=>navigate("/sells/add-quotation")}/>}/>
      <div style={{flex:1,minHeight:0,padding:"16px 24px",display:"flex",flexDirection:"column"}}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No quotations yet."
          topBar={<SearchBox value={search} onChange={setSearch} placeholder="Search quotation or customer..."/>}
          footer={<span style={{fontSize:12,color:TEXT_MUTED}}>{filtered.length} quotation(s)</span>}/>
      </div>

      {viewRec && (
        <QuickView title={viewRec.quotNo} subtitle={`Valid until ${fmtDate(viewRec.validUntil)}`}
          onClose={()=>setViewRec(null)} items={viewRec.items}
          rows={[
            {label:"Customer", value:viewRec.customer},
            {label:"Contact Person", value:viewRec.contactPerson||"—"},
            {label:"Email", value:viewRec.email||"—"},
            {label:"Phone", value:viewRec.phone||"—"},
            {label:"Status", value:<Badge status={viewRec.docStatus||"Draft"}/>},
            {label:"Notes", value:viewRec.notes||"—"},
            {label:"Grand Total", value:`Rs. ${fmt(viewRec.grandTotal)}`},
          ]}/>
      )}
      {editRec && (
        <QuickEdit title={`Edit ${editRec.quotNo}`} onClose={()=>setEditRec(null)} onSave={handleEditSave}
          initial={{ docStatus: editRec.docStatus || "Draft", notes: editRec.notes || "" }}
          fields={[
            {key:"docStatus", label:"Status", type:"select", options:["Draft","Sent","Accepted","Rejected"]},
            {key:"notes", label:"Notes", type:"textarea"},
          ]}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. SELL RETURN — typeable invoice combobox
// NEW: full refund tracking — Draft / Partial / Completed, with
// Refund Method + Amount Refunded so partial refunds are visible.
// ═══════════════════════════════════════════════════════════════
export function SellReturn() {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { invoices }  = useInvoices();
  const { locations } = useLocations();
  const [view, setView] = useState("list");
  const { data, loading, refresh } = useAPI("/sales-returns");
  const returns = data?.data || [];
  const [statusF, setStatusF] = useState("All"); // NEW — drives KPI-card filtering
  const [viewRec, setViewRec] = useState(null);
  const [editRec, setEditRec] = useState(null);

  const [returnNo,  setReturnNo]  = useState(()=>genNo("RTN"));
  const [returnDate,setReturnDate]= useState(new Date().toISOString().slice(0,10));
  const [customer,  setCustomer]  = useState("");
  const [invoiceRef,setInvoiceRef]= useState("");
  const [items,     setItems]     = useState([]);
const [warehouse, setWarehouse] = useState("");
  const [reason,    setReason]    = useState("Damaged Product");
  const [notes,     setNotes]     = useState("");
  const [docStatus, setDocStatus] = useState("Draft");
  // NEW — refund tracking
  const [refundStatus, setRefundStatus] = useState("Pending");   // Pending | Partial | Refunded
  const [refundMethod, setRefundMethod] = useState("Cash");
  const [refundAmount, setRefundAmount] = useState(0);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!warehouse && locations.length > 0) setWarehouse(locations[0].location_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const onInvoicePick = (invNo, inv) => {
    setInvoiceRef(invNo);
    if (inv?.items) {
      setItems(inv.items.map(i=>({...i,returnQty:0,maxQty:i.qty,id:i.id||i.product})));
      if (inv.customer) setCustomer(inv.customer);
    }
  };

  const upd = (id,v) => setItems(prev=>prev.map(i=>i.id===id?{...i,returnQty:Math.min(Number(v),i.maxQty)}:i));
  const selected = items.filter(i=>i.returnQty>0);
  const subtotal  = selected.reduce((s,i)=>s+i.returnQty*(i.unitPrice||0), 0);
  const taxAmt    = subtotal*0.18;
  const grandTotal= subtotal+taxAmt;
  const refundBalance = Math.max(0, grandTotal - Number(refundAmount||0));

  // Keep refundAmount in sync with the chosen status by default
  useEffect(() => {
    if (refundStatus === "Refunded") setRefundAmount(grandTotal);
    if (refundStatus === "Pending")  setRefundAmount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refundStatus, grandTotal]);

  const handleSave = async () => {
    if (!customer)    { alert("Customer is required."); return; }
    if (!invoiceRef)  { alert("Reference invoice is required."); return; }
    if (selected.length===0) { alert("Select at least one item to return."); return; }
    setSaving(true);
    const res = await apiFetch("/sales-returns",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        returnNo, returnDate, customer, invoiceRef, warehouse, reason,
        docStatus, affectsStock:docStatus==="Completed",
        refundStatus, refundMethod, refundAmount:Number(refundAmount)||0,
        taxAmt:taxAmt.toFixed(2), grandTotal:grandTotal.toFixed(2),
        notes, items:selected.map(i=>({...i,qty:i.returnQty})),
      }),
    });
    setSaving(false);
    if (res) { setView("list"); refresh(); }
    else alert("Failed to save return");
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete return ${r.returnNo}? This cannot be undone.`)) return;
    const res = await apiFetch(`/sales-returns/${r.id}`, { method:"DELETE" });
    if (res) refresh(); else alert("Delete failed — check server.");
  };

  const handleEditSave = async (form) => {
    const res = await apiFetch(`/sales-returns/${editRec.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res) { setEditRec(null); refresh(); } else alert("Update failed — check server.");
  };

const [search, setSearch] = useState("");
  const filteredReturns = returns.filter(r => {
    if (statusF !== "All" && (r.refundStatus || "Pending") !== statusF) return false;
    if (search && !`${r.returnNo} ${r.customer}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

if (view==="list") {
    const cols=[
      {label:"Return No."},{label:"Date"},
      {label:"Customer"},{label:"Reference Invoice"},{label:"Reason"},
      {label:"Status"},{label:"Refund Status"},{label:"Refunded / Balance (Rs.)",right:true},
      {label:"Amount (Rs.)",right:true},{label:"Action",center:true},
    ];
    const rows=returns.map((r,i)=>{
      const bal = Math.max(0, Number(r.grandTotal||0) - Number(r.refundAmount||0));
      return (
      <>
        <Td mono>{r.returnNo||`RTN-${String(i+1).padStart(4,"0")}`}</Td>
        <Td>{fmtDate(r.returnDate)}</Td><Td>{r.customer||"—"}</Td>
        <Td mono muted>{r.invoiceRef||"—"}</Td>
        <Td muted>{r.reason||"—"}</Td>
        <Td><Badge status={r.docStatus||"Draft"}/></Td>
        <Td><Badge status={r.refundStatus||"Pending"}/></Td>
        <Td right>
          <div style={{lineHeight:1.5}}>
            <div style={{fontSize:11,color:"#16a34a"}}>Refunded: Rs. {fmt(r.refundAmount)}</div>
            {bal>0 && <div style={{fontSize:11,color:RED,fontWeight:700}}>Balance: Rs. {fmt(bal)}</div>}
          </div>
        </Td>
        <Td right><span style={{fontWeight:700,color:RED}}>- Rs. {fmt(r.grandTotal)}</span></Td>
       <Td center><div style={{display:"flex",gap:2,justifyContent:"center"}}>
          <IBtn icon={IC.eye} title="View" onClick={()=>setViewRec(r)}/>
          <IBtn icon={IC.edit} title="Edit" onClick={()=>setEditRec(r)}/>
          <IBtn icon={IC.trash} title="Delete" color={RED} onClick={()=>handleDelete(r)}/>
        </div></Td>
      </>
    );});

    const handleExport = () => {
      downloadCSV(
        `sales_returns_${Date.now()}.csv`,
        ["Return No.","Date","Customer","Reference Invoice","Reason","Status","Refund Status","Refunded (Rs.)","Balance (Rs.)","Amount (Rs.)"],
        filteredReturns.map(r => [r.returnNo, fmtDate(r.returnDate), r.customer, r.invoiceRef,
          r.reason||"", r.docStatus||"Draft", r.refundStatus||"Pending",
          r.refundAmount||0, Math.max(0,Number(r.grandTotal||0)-Number(r.refundAmount||0)), r.grandTotal])
      );
    };

    const totalRefunded = filteredReturns.reduce((a,r)=>a+Number(r.refundAmount||0),0);
    const totalBalance  = filteredReturns.reduce((a,r)=>a+Math.max(0,Number(r.grandTotal||0)-Number(r.refundAmount||0)),0);

    return (
      <div style={PAGE}>
        <PageHeader title="Sales Returns" breadcrumb="Home / Sell / Returns"
          actions={<PrimaryBtn label="New Return" icon={IC.plus} onClick={()=>setView("add")}/>}/>
        <div style={{padding:"16px 24px 0",display:"flex",gap:14,flexShrink:0}}>
          <StatCard label="Total Returns" value={returns.length} sub="All time" accent={GREEN}
            active={statusF==="All"}
            onClick={()=>setStatusF("All")}/>
          <StatCard label="Pending Refunds" value={returns.filter(r=>(r.refundStatus||"Pending")==="Pending").length} sub="Awaiting refund" accent={AMBER}
            active={statusF==="Pending"}
            onClick={()=>setStatusF(prev=>prev==="Pending"?"All":"Pending")}/>
          <StatCard label="Partial Refunds" value={returns.filter(r=>r.refundStatus==="Partial").length} sub="Partially refunded" accent="#6366f1"
            active={statusF==="Partial"}
            onClick={()=>setStatusF(prev=>prev==="Partial"?"All":"Partial")}/>
          <StatCard label="Fully Refunded" value={returns.filter(r=>r.refundStatus==="Refunded").length} sub="Completed" accent="#22c55e"
            active={statusF==="Refunded"}
            onClick={()=>setStatusF(prev=>prev==="Refunded"?"All":"Refunded")}/>
          <StatCard label="Total Refund Balance" value={`Rs. ${fmt(totalBalance)}`} sub={`Rs. ${fmt(totalRefunded)} refunded`} accent={RED}/>
        </div>
      <div style={{flex:1,minHeight:0,padding:"14px 24px",display:"flex",flexDirection:"column"}}>
          <TablePage columns={cols} rows={rows} loading={loading} emptyText="No returns recorded yet."
            topBar={<>
              <GhostBtn label="Export CSV" icon={IC.csv} onClick={handleExport}/>
              <SearchBox value={search} onChange={setSearch} placeholder="Search return or customer..."/>
            </>}
            footer={<span style={{fontSize:12,color:TEXT_MUTED}}>Showing {filteredReturns.length} of {returns.length} return(s)</span>}/>
        </div>

        {viewRec && (
          <QuickView title={viewRec.returnNo} subtitle={fmtDate(viewRec.returnDate)}
            onClose={()=>setViewRec(null)} items={viewRec.items}
            rows={[
              {label:"Customer", value:viewRec.customer},
              {label:"Reference Invoice", value:viewRec.invoiceRef},
              {label:"Reason", value:viewRec.reason},
              {label:"Status", value:<Badge status={viewRec.docStatus||"Draft"}/>},
              {label:"Refund Status", value:<Badge status={viewRec.refundStatus||"Pending"}/>},
              {label:"Refund Method", value:viewRec.refundMethod||"—"},
              {label:"Amount Refunded", value:`Rs. ${fmt(viewRec.refundAmount)}`},
              {label:"Refund Balance", value:`Rs. ${fmt(Math.max(0,Number(viewRec.grandTotal||0)-Number(viewRec.refundAmount||0)))}`},
              {label:"Notes", value:viewRec.notes||"—"},
              {label:"Refund Total", value:`Rs. ${fmt(viewRec.grandTotal)}`},
            ]}/>
        )}
        {editRec && (
          <QuickEdit title={`Edit ${editRec.returnNo}`} onClose={()=>setEditRec(null)} onSave={handleEditSave}
            initial={{
              docStatus: editRec.docStatus || "Draft",
              refundStatus: editRec.refundStatus || "Pending",
              refundMethod: editRec.refundMethod || "Cash",
              refundAmount: editRec.refundAmount || 0,
              notes: editRec.notes || "",
            }}
            fields={[
              {key:"docStatus", label:"Status", type:"select", options:["Draft","Completed"]},
              {key:"refundStatus", label:"Refund Status", type:"select", options:["Pending","Partial","Refunded"]},
              {key:"refundMethod", label:"Refund Method", type:"select", options:["Cash","UPI","Card","Bank Transfer","Store Credit"]},
              {key:"refundAmount", label:"Amount Refunded (Rs.)", type:"number"},
              {key:"notes", label:"Notes", type:"textarea"},
            ]}/>
        )}
      </div>
    );
  }

  return (
    <div style={PAGE}>
      <PageHeader title="New Sales Return" breadcrumb={`Home / Sell / Returns / New — ${returnNo}`}
        actions={<>
          <select value={docStatus} onChange={e=>setDocStatus(e.target.value)}
            style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 12px",fontSize:12,fontFamily:F,background:"#fff",cursor:"pointer"}}>
            <option value="Draft">Save as Draft</option>
            <option value="Completed">Complete Return</option>
          </select>
          <GhostBtn label="Cancel" onClick={()=>setView("list")}/>
          <PrimaryBtn label={saving?"Saving...":"Save Return"} icon={IC.save} onClick={handleSave} disabled={saving}/>
        </>}/>
      <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"20px 20px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <CardTitle>Return Details</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div><FL>Return Number</FL><Inp value={returnNo} onChange={e=>setReturnNo(e.target.value)}/></div>
              <div><FL>Return Date</FL><Inp type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)}/></div>
             <div><FL>Warehouse</FL>
                <Sel value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
                  {locations.length===0
                    ? <option>Manod HQ</option>
                    : locations.map(l=><option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                </Sel>
              </div>
            </div>
          </Card>
          <Card>
            <CardTitle>Customer &amp; Invoice</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <FL required>Customer</FL>
                <CustomerCombobox value={customer} onChange={name=>setCustomer(name)} customers={customers}/>
              </div>
              <div>
                <FL required>Reference Sales Invoice</FL>
                <InvoiceCombobox invoices={invoices} value={invoiceRef} onChange={onInvoicePick}/>
                <div style={{fontSize:11,color:TEXT_MUTED,marginTop:4}}>Type invoice number or customer name to filter</div>
              </div>
              <div><FL>Return Reason</FL>
                <Sel value={reason} onChange={e=>setReason(e.target.value)}>
                  {["Damaged Product","Wrong Product Delivered","Quality Issue","Customer Rejection","Other"].map(r=><option key={r}>{r}</option>)}
                </Sel>
              </div>
              <div><FL>Notes / Remarks</FL><Inp value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional..."/></div>
            </div>
          </Card>
          <Card>
            <CardTitle>Products to Return</CardTitle>
            {items.length===0 ? (
              <div style={{padding:"28px",textAlign:"center",color:TEXT_MUTED,fontSize:13}}>
                Search and select a reference invoice above to auto-load products
              </div>
            ) : (
              <>
                <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:6,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#854d0e"}}>
                  Enter the return quantity for each item. Cannot exceed original quantity sold.
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {["Product","SKU","Original Qty","Return Qty","Unit Price (Rs.)","Return Total (Rs.)"].map((h,i)=>(
                      <th key={i} style={{padding:"8px 10px",fontWeight:600,fontSize:11,color:TEXT_MUTED,borderBottom:`1px solid ${BORDER}`,textTransform:"uppercase",textAlign:i>=2?"right":"left"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {items.map(r=>(
                      <tr key={r.id} style={{borderBottom:`1px solid ${BORDER}`,background:r.returnQty>0?"#fef2f2":"#fff"}}>
                        <td style={{padding:"8px 10px",fontWeight:600}}>{r.product||r.name}</td>
                        <td style={{padding:"8px 10px",color:TEXT_MUTED,fontSize:11}}>{r.sku||"—"}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>{r.maxQty||r.qty}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>
                          <NInp value={r.returnQty} min={0} max={r.maxQty||r.qty} onChange={e=>upd(r.id,e.target.value)} width={65}/>
                        </td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>Rs. {fmt(r.unitPrice||0)}</td>
                        <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:r.returnQty>0?RED:TEXT_MUTED}}>
                          {r.returnQty>0?`- Rs. ${fmt(r.returnQty*(r.unitPrice||0))}`:"—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Card>
          <Card>
            <CardTitle>Refund Details</CardTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div><FL>Refund Status</FL>
                <Sel value={refundStatus} onChange={e=>setRefundStatus(e.target.value)}>
                  {["Pending","Partial","Refunded"].map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div><FL>Refund Method</FL>
                <Sel value={refundMethod} onChange={e=>setRefundMethod(e.target.value)}>
                  {["Cash","UPI","Card","Bank Transfer","Store Credit"].map(o=><option key={o}>{o}</option>)}
                </Sel>
              </div>
              <div><FL>Amount Refunded (Rs.)</FL>
                <Inp type="number" value={refundAmount} onChange={e=>setRefundAmount(e.target.value)} min="0" max={grandTotal}/>
              </div>
            </div>
            <div style={{marginTop:6,fontSize:11,color:TEXT_MUTED}}>
              e.g. customer paid Rs. {fmt(grandTotal)} total refund due — you can record that only part of it (Partial) has actually been paid back to them so far.
            </div>
          </Card>
        </div>
        <div style={{width:260,flexShrink:0,borderLeft:`1px solid ${BORDER}`,background:"#fff",padding:"20px 18px"}}>
          <Card style={{border:"none",padding:0}}>
            <CardTitle>Return Summary</CardTitle>
            <SumRow label="Items to Return" value={selected.length}/>
            <SumRow label="Subtotal"        value={`Rs. ${fmt(subtotal)}`}/>
            <SumRow label="Tax (GST 18%)"   value={`Rs. ${fmt(taxAmt)}`} color={AMBER}/>
            <SumRow label="Total Refund"    value={`Rs. ${fmt(grandTotal)}`} big border color={RED}/>
            <SumRow label="Refunded So Far" value={`Rs. ${fmt(refundAmount)}`} color="#16a34a"/>
            {refundBalance>0 && <SumRow label="Refund Balance" value={`Rs. ${fmt(refundBalance)}`} color={RED} bold/>}
            <div style={{marginTop:16,padding:"12px",background:"#fef2f2",borderRadius:8,border:"1px solid #fecaca"}}>
              <div style={{fontSize:11,fontWeight:600,color:RED}}>Return Notice</div>
              <div style={{fontSize:11,color:"#991b1b",marginTop:4,lineHeight:1.5}}>
                Completing a return will increase stock and generate a credit note for the customer.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. SHIPMENTS
// UI/layout is UNCHANGED. Only added: auto-load Customer + Delivery
// Address + Invoice Details when a Reference Invoice is picked, a
// new "Product Details" card (Ordered / Shipped / Remaining Qty),
// and backend/DB wiring for shipment line items.
// ═══════════════════════════════════════════════════════════════
export function Shipments() {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { invoices }  = useInvoices();
  const { locations } = useLocations();
  const [view, setView] = useState("list");
  const { data, loading, refresh } = useAPI("/shipments");
  const shipments = data?.data || [];
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All"); // NEW — drives KPI-card filtering
  const [viewRec, setViewRec] = useState(null);
  const [editRec, setEditRec] = useState(null);
  const [shipNo,      setShipNo]      = useState(()=>genNo("SHP"));
  const [shipDate,    setShipDate]    = useState(new Date().toISOString().slice(0,10));
  const [customer,    setCustomer]    = useState("");
  const [invoiceRef,  setInvoiceRef]  = useState("");
  const [invoiceTotal,setInvoiceTotal]= useState(null); // NEW — invoice details preview
  const [carrier,     setCarrier]     = useState("FedEx");
  const [trackingNo,  setTrackingNo]  = useState("");
const [warehouse,   setWarehouse]   = useState("");
  const [deliveryAddr,setDeliveryAddr]= useState("");
  const [estimatedDel,setEstimatedDel]= useState("");
  const [weight,      setWeight]      = useState("");
  const [shipCost,    setShipCost]    = useState(0);
  const [notes,       setNotes]       = useState("");
  const [shipStatus,  setShipStatus]  = useState("Pending");
  const [saving,      setSaving]      = useState(false);
  // NEW — product details loaded from the selected invoice
  const [shipItems,   setShipItems]   = useState([]);

  // NEW — when an invoice is picked, auto-fill customer, delivery address,
  // invoice total, and populate the Product Details table with its items.
useEffect(() => {
    if (!warehouse && locations.length > 0) setWarehouse(locations[0].location_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const onInvoicePick = (invNo, inv) => {
    setInvoiceRef(invNo);
    if (!inv) return;
    if (inv.customer) setCustomer(inv.customer);
    setInvoiceTotal(inv.grandTotal ?? null);
    // Prefer an address on the invoice/customer record if present, else leave editable
    const custMatch = customers.find(c => (c.name||c.contact_name||c.business_name) === inv.customer);
    const addr = inv.deliveryAddress || inv.address || custMatch?.address || custMatch?.billing_address || "";
    if (addr) setDeliveryAddr(addr);
    if (inv.items?.length) {
      setShipItems(inv.items.map(it => ({
        id: it.id || it.productId || it.product,
        productId: it.productId || null,
        product: it.product || it.name,
        sku: it.sku || "",
        orderedQty: Number(it.qty || 0),
        shippedQty: Number(it.qty || 0), // default: ship everything, editable for partial shipment
      })));
    } else {
      setShipItems([]);
    }
  };
  const updShipQty = (id, v) => setShipItems(prev => prev.map(it =>
    it.id===id ? { ...it, shippedQty: Math.max(0, Math.min(Number(v)||0, it.orderedQty)) } : it
  ));

  const handleSave = async () => {
    if (!customer)   { alert("Customer is required."); return; }
    if (!invoiceRef) { alert("Reference invoice is required."); return; }
    setSaving(true);
    const res = await apiFetch("/shipments",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        shipmentNo:shipNo, date:shipDate, customer, invoiceRef,
        carrier, trackingNo, warehouse, deliveryAddress:deliveryAddr,
        estimatedDelivery:estimatedDel, weight, shippingCost:shipCost,
        status:shipStatus, notes,
        items: shipItems.map(it => ({
          productId: it.productId, product: it.product, sku: it.sku,
          orderedQty: it.orderedQty, shippedQty: it.shippedQty,
        })),
      }),
    });
    setSaving(false);
    if (res) { setView("list"); refresh(); }
    else alert("Failed to create shipment");
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete shipment ${s.shipmentNo}? This cannot be undone.`)) return;
    const res = await apiFetch(`/shipments/${s.id}`, { method:"DELETE" });
    if (res) refresh(); else alert("Delete failed — check server");
  };

  const handleEditSave = async (form) => {
    const res = await apiFetch(`/shipments/${editRec.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res) { setEditRec(null); refresh(); } else alert("Update failed — check server");
  };

  const filtered = shipments.filter(s => {
    if (statusF === "Pending"    && s.status !== "Pending") return false;
    if (statusF === "In Transit" && !["Shipped","In Transit"].includes(s.status)) return false;
    if (statusF === "Delivered"  && s.status !== "Delivered") return false;
    if (search && !`${s.shipmentNo} ${s.customer}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (view==="add") {
    return (
      <div style={PAGE}>
        <PageHeader title="New Shipment" breadcrumb={`Home / Sell / Shipments / New — ${shipNo}`}
          actions={<>
            <select value={shipStatus} onChange={e=>setShipStatus(e.target.value)}
              style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 12px",fontSize:12,fontFamily:F,background:"#fff",cursor:"pointer"}}>
              {["Pending","Shipped","In Transit","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
            </select>
            <GhostBtn label="Cancel" onClick={()=>setView("list")}/>
            <PrimaryBtn label={saving?"Saving...":"Create Shipment"} icon={IC.save} onClick={handleSave} disabled={saving}/>
          </>}/>
        <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"20px 20px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
            <Card>
              <CardTitle>Shipment Details</CardTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                <div><FL>Shipment Number</FL><Inp value={shipNo} onChange={e=>setShipNo(e.target.value)}/></div>
                <div><FL>Ship Date</FL><Inp type="date" value={shipDate} onChange={e=>setShipDate(e.target.value)}/></div>
               <div><FL>Warehouse / Origin</FL>
                  <Sel value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
                    {locations.length===0
                      ? <option>Manod HQ</option>
                      : locations.map(l=><option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                  </Sel>
                </div>
                <div><FL>Estimated Delivery</FL><Inp type="date" value={estimatedDel} onChange={e=>setEstimatedDel(e.target.value)}/></div>
                <div><FL required>Carrier / Courier</FL>
                  <Sel value={carrier} onChange={e=>setCarrier(e.target.value)}>
                    {["FedEx","DHL","Blue Dart","DTDC","India Post","Delhivery","Ecom Express","XpressBees","Other"].map(c=><option key={c}>{c}</option>)}
                  </Sel>
                </div>
                <div><FL>Tracking Number</FL><Inp value={trackingNo} onChange={e=>setTrackingNo(e.target.value)} placeholder="AWB / Tracking ID"/></div>
              </div>
            </Card>
            <Card>
              <CardTitle>Customer &amp; Invoice</CardTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <FL required>Customer</FL>
                  <CustomerCombobox value={customer} onChange={name=>setCustomer(name)} customers={customers}/>
                </div>
                <div>
                  <FL required>Reference Sales Invoice</FL>
                  <InvoiceCombobox invoices={invoices} value={invoiceRef} onChange={onInvoicePick}/>
                  <div style={{fontSize:11,color:TEXT_MUTED,marginTop:4}}>
                    Selecting an invoice auto-fills the customer, delivery address and product list below.
                  </div>
                </div>
                {invoiceTotal!==null && (
                  <div style={{gridColumn:"span 2",display:"flex",gap:14,fontSize:12,color:TEXT_MUTED,
                    background:LIGHT_GRN,border:`1px solid #a7f3d0`,borderRadius:6,padding:"8px 12px"}}>
                    <span>Invoice Total: <strong style={{color:GREEN}}>Rs. {fmt(invoiceTotal)}</strong></span>
                    <span>Invoice No: <strong style={{color:GREEN}}>{invoiceRef}</strong></span>
                  </div>
                )}
                <div style={{gridColumn:"span 2"}}>
                  <FL>Delivery Address</FL>
                  <TextArea value={deliveryAddr} onChange={e=>setDeliveryAddr(e.target.value)} placeholder="Full delivery address..." rows={2}/>
                </div>
              </div>
            </Card>

            {/* NEW — Product Details, auto-populated from the selected invoice */}
            <Card>
              <CardTitle>Product Details</CardTitle>
              {shipItems.length===0 ? (
                <div style={{padding:"24px",textAlign:"center",color:TEXT_MUTED,fontSize:13}}>
                  Select a Reference Sales Invoice above to load its products here.
                </div>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {["Product","SKU","Ordered Qty","Shipped Qty","Remaining Qty"].map((h,i)=>(
                      <th key={i} style={{padding:"8px 10px",fontWeight:600,fontSize:11,color:TEXT_MUTED,
                        borderBottom:`1px solid ${BORDER}`,textTransform:"uppercase",textAlign:i>=2?"right":"left"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {shipItems.map(it=>{
                      const remaining = Math.max(0, it.orderedQty - it.shippedQty);
                      return (
                        <tr key={it.id} style={{borderBottom:`1px solid ${BORDER}`}}>
                          <td style={{padding:"8px 10px",fontWeight:600}}>{it.product}</td>
                          <td style={{padding:"8px 10px",color:TEXT_MUTED,fontSize:11}}>{it.sku||"—"}</td>
                          <td style={{padding:"8px 10px",textAlign:"right"}}>{it.orderedQty}</td>
                          <td style={{padding:"8px 10px",textAlign:"right"}}>
                            <NInp value={it.shippedQty} min={0} max={it.orderedQty} width={65}
                              onChange={e=>updShipQty(it.id, e.target.value)}/>
                          </td>
                          <td style={{padding:"8px 10px",textAlign:"right",
                            color:remaining>0?AMBER:"#16a34a",fontWeight:700}}>
                            {remaining} {remaining>0 && <span style={{fontSize:10,fontWeight:500}}>(partial)</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Card>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Card>
                <CardTitle>Shipping Details</CardTitle>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><FL>Weight (kg)</FL><Inp type="number" value={weight} onChange={e=>setWeight(e.target.value)} min="0"/></div>
                  <div><FL>Shipping Cost (Rs.)</FL><Inp type="number" value={shipCost} onChange={e=>setShipCost(e.target.value)} min="0"/></div>
                </div>
              </Card>
              <Card><FL>Notes / Instructions</FL><TextArea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Fragile, handle with care..." rows={3}/></Card>
            </div>
          </div>
          <div style={{width:260,flexShrink:0,borderLeft:`1px solid ${BORDER}`,background:"#fff",padding:"20px 18px"}}>
            <Card style={{border:"none",padding:0}}>
              <CardTitle>Shipment Summary</CardTitle>
              {[
                {label:"Shipment No.",value:shipNo},{label:"Carrier",value:carrier},
                {label:"Status",value:<Badge status={shipStatus}/>},
                {label:"Ship Date",value:fmtDate(shipDate)},
                {label:"Est. Delivery",value:estimatedDel?fmtDate(estimatedDel):"—"},
                {label:"Weight",value:weight?`${weight} kg`:"—"},
                {label:"Products",value:shipItems.length},
              ].map(({label,value})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${BORDER}`,fontSize:12}}>
                  <span style={{color:TEXT_MUTED}}>{label}</span>
                  <span style={{fontWeight:600,color:TEXT_MAIN}}>{value}</span>
                </div>
              ))}
              {Number(shipCost)>0 && (
                <div style={{marginTop:12,padding:"10px 12px",background:LIGHT_GRN,borderRadius:8,border:`1px solid #a7f3d0`}}>
                  <div style={{fontSize:12,color:TEXT_MUTED}}>Shipping Cost</div>
                  <div style={{fontSize:18,fontWeight:800,color:GREEN}}>Rs. {fmt(shipCost)}</div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const cols = [
    {label:"Shipment No."},{label:"Date"},
    {label:"Customer"},{label:"Invoice Ref."},{label:"Carrier"},
    {label:"Tracking No."},{label:"Est. Delivery"},{label:"Status"},{label:"Action",center:true},
  ];
  const rows = filtered.map((s,i)=>(
    <>
      <Td mono>{s.shipmentNo||`SHP-${String(i+1).padStart(4,"0")}`}</Td>
      <Td>{fmtDate(s.date)}</Td><Td>{s.customer||"—"}</Td>
      <Td mono muted>{s.invoiceRef||"—"}</Td>
      <Td muted>{s.carrier||"—"}</Td>
      <Td mono muted>{s.trackingNo||"—"}</Td>
      <Td muted>{s.estimatedDelivery?fmtDate(s.estimatedDelivery):"—"}</Td>
      <Td><Badge status={s.status||"Pending"}/></Td>
      <Td center><div style={{display:"flex",gap:2,justifyContent:"center"}}>
        <IBtn icon={IC.eye} title="View" onClick={()=>setViewRec(s)}/>
        <IBtn icon={IC.edit} title="Edit" onClick={()=>setEditRec(s)}/>
        <IBtn icon={IC.print} title="Print Label" onClick={()=>window.print()}/>
        <IBtn icon={IC.trash} title="Delete" color={RED} onClick={()=>handleDelete(s)}/>
      </div></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="Shipments" breadcrumb="Home / Sell / Shipments"
        actions={<PrimaryBtn label="New Shipment" icon={IC.truck} onClick={()=>setView("add")}/>}/>
     <div style={{padding:"16px 24px 0",display:"flex",gap:14,flexShrink:0}}>
        <StatCard label="Total" value={shipments.length} sub="All time" accent={GREEN}
          active={statusF==="All"}
          onClick={()=>setStatusF("All")}/>
        <StatCard label="Pending" value={shipments.filter(s=>s.status==="Pending").length} sub="Awaiting dispatch" accent={AMBER}
          active={statusF==="Pending"}
          onClick={()=>setStatusF(prev=>prev==="Pending"?"All":"Pending")}/>
        <StatCard label="In Transit" value={shipments.filter(s=>["Shipped","In Transit"].includes(s.status)).length} sub="On the way" accent="#6366f1"
          active={statusF==="In Transit"}
          onClick={()=>setStatusF(prev=>prev==="In Transit"?"All":"In Transit")}/>
        <StatCard label="Delivered" value={shipments.filter(s=>s.status==="Delivered").length} sub="Completed" accent="#22c55e"
          active={statusF==="Delivered"}
          onClick={()=>setStatusF(prev=>prev==="Delivered"?"All":"Delivered")}/>
      </div>
      <div style={{flex:1,minHeight:0,padding:"14px 24px",display:"flex",flexDirection:"column"}}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No shipments yet. Click New Shipment to create one."
          topBar={<SearchBox value={search} onChange={setSearch} placeholder="Search shipment or customer..."/>}
          footer={<span style={{fontSize:12,color:TEXT_MUTED}}>{filtered.length} shipment(s)</span>}/>
      </div>

      {viewRec && (
        <QuickView title={viewRec.shipmentNo} subtitle={fmtDate(viewRec.date)}
          onClose={()=>setViewRec(null)} items={viewRec.items}
          rows={[
            {label:"Customer", value:viewRec.customer},
            {label:"Invoice Ref.", value:viewRec.invoiceRef},
            {label:"Carrier", value:viewRec.carrier},
            {label:"Tracking No.", value:viewRec.trackingNo||"—"},
            {label:"Delivery Address", value:viewRec.deliveryAddress||"—"},
            {label:"Est. Delivery", value:viewRec.estimatedDelivery?fmtDate(viewRec.estimatedDelivery):"—"},
            {label:"Status", value:<Badge status={viewRec.status||"Pending"}/>},
            {label:"Shipping Cost", value:`Rs. ${fmt(viewRec.shippingCost)}`},
          ]}/>
      )}
      {editRec && (
        <QuickEdit title={`Edit ${editRec.shipmentNo}`} onClose={()=>setEditRec(null)} onSave={handleEditSave}
          initial={{ status: editRec.status || "Pending", trackingNo: editRec.trackingNo || "", notes: editRec.notes || "" }}
          fields={[
            {key:"status", label:"Status", type:"select", options:["Pending","Shipped","In Transit","Delivered","Cancelled"]},
            {key:"trackingNo", label:"Tracking Number"},
            {key:"notes", label:"Notes", type:"textarea"},
          ]}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 11. DISCOUNTS
// NEW: "Applies To" — when Specific Brand / Category / Product is
// chosen, a second dropdown appears populated with real brands /
// categories / products so the discount actually targets something.
// ═══════════════════════════════════════════════════════════════
export function Discounts() {
const [view, setView] = useState("list");
  const { data, loading, refresh } = useAPI("/discounts");
  const discounts = data?.data || [];
  const [statusF, setStatusF] = useState("All"); // NEW — drives KPI-card filtering
  const [viewRec, setViewRec] = useState(null);
  const [editRec, setEditRec] = useState(null);

  const { brands }     = useBrands();
  const { categories } = useCategories();
  const { products }   = useProducts();

  const [discName,  setDiscName]  = useState("");
  const [discCode,  setDiscCode]  = useState(()=>`DISC${Date.now().toString().slice(-4)}`);
  const [discType,  setDiscType]  = useState("Percentage");
  const [discValue, setDiscValue] = useState(0);
  const [appliesTo, setAppliesTo] = useState("All Products");
  const [appliesToValue, setAppliesToValue] = useState(""); // NEW — the picked brand/category/product
  const [minOrder,  setMinOrder]  = useState(0);
  const [maxUses,   setMaxUses]   = useState("");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0,10));
  const [validTo,   setValidTo]   = useState(()=>{const d=new Date();d.setMonth(d.getMonth()+1);return d.toISOString().slice(0,10);});
  const [custGroup, setCustGroup] = useState("All");
  const [discStatus,setDiscStatus]= useState("Active");
  const [desc,      setDesc]      = useState("");
  const [saving,    setSaving]    = useState(false);

  // Reset the picked value whenever the applies-to category changes
  useEffect(() => { setAppliesToValue(""); }, [appliesTo]);

  const handleSave = async () => {
    if (!discName)  { alert("Discount name is required."); return; }
    if (!discValue) { alert("Discount value is required."); return; }
    if (appliesTo !== "All Products" && !appliesToValue) {
      alert(`Please select which ${appliesTo.replace("Specific ","").toLowerCase()} this discount applies to.`);
      return;
    }
    setSaving(true);
    const res = await apiFetch("/discounts",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name:discName, code:discCode, type:discType, value:discValue,
        appliesTo, appliesToValue, minOrderAmount:minOrder, maxUses, validFrom, validTo,
        customerGroup:custGroup, status:discStatus, description:desc,
      }),
    });
    setSaving(false);
    if (res) { setView("list"); refresh(); }
    else alert("Failed to save discount");
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete discount "${d.name}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/discounts/${d.id}`, { method:"DELETE" });
    if (res) refresh(); else alert("Delete failed — check server");
  };

  const handleEditSave = async (form) => {
    const res = await apiFetch(`/discounts/${editRec.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res) { setEditRec(null); refresh(); } else alert("Update failed — check server");
  };

  // NEW — options for the second "which one" dropdown, based on appliesTo
  const appliesToOptions =
    appliesTo === "Specific Brand"    ? brands.map(b=>b.name||b.brand_name) :
    appliesTo === "Specific Category" ? categories.map(c=>c.name||c.category_name) :
    appliesTo === "Specific Product"  ? products.map(p=>p.name) : [];

  if (view==="add") {
    return (
      <div style={PAGE}>
        <PageHeader title="New Discount" breadcrumb="Home / Sell / Discounts / New"
          actions={<>
            <select value={discStatus} onChange={e=>setDiscStatus(e.target.value)}
              style={{border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 12px",fontSize:12,fontFamily:F,background:"#fff",cursor:"pointer"}}>
              {["Active","Inactive","Draft"].map(s=><option key={s}>{s}</option>)}
            </select>
            <GhostBtn label="Cancel" onClick={()=>setView("list")}/>
            <PrimaryBtn label={saving?"Saving...":"Save Discount"} icon={IC.tag} onClick={handleSave} disabled={saving}/>
          </>}/>
        <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"20px 20px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
            <Card>
              <CardTitle>Discount Information</CardTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div><FL required>Discount Name</FL><Inp value={discName} onChange={e=>setDiscName(e.target.value)} placeholder="e.g. Summer Sale 20%"/></div>
                <div><FL>Coupon Code</FL><Inp value={discCode} onChange={e=>setDiscCode(e.target.value.toUpperCase())} placeholder="SUMMER20"/></div>
                <div><FL required>Type</FL>
                  <Sel value={discType} onChange={e=>setDiscType(e.target.value)}>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (Rs.)</option>
                    <option value="Buy X Get Y">Buy X Get Y</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </Sel>
                </div>
                <div>
                  <FL required>Value {discType==="Percentage"?"(%)":discType==="Fixed Amount"?"(Rs.)":""}</FL>
                  <Inp type="number" value={discValue} onChange={e=>setDiscValue(e.target.value)} placeholder="0" min="0" max={discType==="Percentage"?"100":undefined}/>
                </div>
                <div style={{gridColumn:"span 2"}}>
                  <FL>Description</FL>
                  <TextArea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Optional description..." rows={2}/>
                </div>
              </div>
            </Card>
            <Card>
              <CardTitle>Rules &amp; Applicability</CardTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div><FL>Applies To</FL>
                  <Sel value={appliesTo} onChange={e=>setAppliesTo(e.target.value)}>
                    {["All Products","Specific Category","Specific Product","Specific Brand"].map(o=><option key={o}>{o}</option>)}
                  </Sel>
                </div>
                {/* NEW — appears only when a "Specific ..." option is chosen */}
                {appliesTo !== "All Products" && (
                  <div>
                    <FL required>{appliesTo.replace("Specific ","Select ")}</FL>
                    <Sel value={appliesToValue} onChange={e=>setAppliesToValue(e.target.value)}>
                      <option value="">
                        {appliesToOptions.length===0 ? `No ${appliesTo.replace("Specific ","").toLowerCase()}s found` : "— Select —"}
                      </option>
                      {appliesToOptions.map(o=><option key={o} value={o}>{o}</option>)}
                    </Sel>
                    {appliesToOptions.length===0 && (
                      <div style={{fontSize:11,color:AMBER,marginTop:4}}>
                        ⚠ None found in the database yet — add one under Products first.
                      </div>
                    )}
                  </div>
                )}
                <div><FL>Customer Group</FL>
                  <Sel value={custGroup} onChange={e=>setCustGroup(e.target.value)}>
                    {["All","Walk-In","Retail","Wholesale","VIP"].map(o=><option key={o}>{o}</option>)}
                  </Sel>
                </div>
                <div><FL>Min Order Amount (Rs.)</FL><Inp type="number" value={minOrder} onChange={e=>setMinOrder(e.target.value)} placeholder="0" min="0"/></div>
                <div><FL>Max Uses (blank = unlimited)</FL><Inp type="number" value={maxUses} onChange={e=>setMaxUses(e.target.value)} placeholder="Unlimited" min="1"/></div>
              </div>
            </Card>
            <Card>
              <CardTitle>Validity Period</CardTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div><FL required>Valid From</FL><Inp type="date" value={validFrom} onChange={e=>setValidFrom(e.target.value)}/></div>
                <div><FL required>Valid Until</FL><Inp type="date" value={validTo} onChange={e=>setValidTo(e.target.value)}/></div>
              </div>
            </Card>
          </div>
          <div style={{width:260,flexShrink:0,borderLeft:`1px solid ${BORDER}`,background:"#fff",padding:"20px 18px"}}>
            <Card style={{border:"none",padding:0}}>
              <CardTitle>Preview</CardTitle>
              <div style={{textAlign:"center",padding:"16px 0",borderBottom:`1px solid ${BORDER}`,marginBottom:14}}>
                <div style={{fontSize:11,color:TEXT_MUTED,marginBottom:4}}>Coupon Code</div>
                <div style={{fontSize:18,fontWeight:800,color:GREEN,letterSpacing:2,background:LIGHT_GRN,padding:"10px 16px",borderRadius:8,border:`1px dashed #a7f3d0`}}>
                  {discCode||"—"}
                </div>
              </div>
              {[
                {label:"Type",     value:discType},
                {label:"Value",    value:discType==="Percentage"?`${discValue}%`:`Rs. ${fmt(discValue)}`},
                {label:"Applies",  value:appliesTo},
                ...(appliesTo!=="All Products"?[{label:appliesTo.replace("Specific ",""), value:appliesToValue||"—"}]:[]),
                {label:"Customer", value:custGroup},
                {label:"Min Order",value:minOrder>0?`Rs. ${fmt(minOrder)}`:"None"},
                {label:"Max Uses", value:maxUses||"Unlimited"},
                {label:"From",     value:validFrom?fmtDate(validFrom):"—"},
                {label:"Until",    value:validTo?fmtDate(validTo):"—"},
                {label:"Status",   value:<Badge status={discStatus}/>},
              ].map(({label,value})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontSize:12}}>
                  <span style={{color:TEXT_MUTED}}>{label}</span>
                  <span style={{fontWeight:600,color:TEXT_MAIN}}>{value}</span>
                </div>
              ))}
              {discType==="Percentage" && discValue>0 && (
                <div style={{marginTop:14,padding:"12px",background:LIGHT_GRN,borderRadius:8,border:`1px solid #a7f3d0`}}>
                  <div style={{fontSize:11,color:TEXT_MUTED}}>On a Rs. 1,000 order:</div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:GREEN,marginTop:4}}>
                    <span>Customer saves</span>
                    <span>Rs. {fmt(1000*discValue/100)}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }
const filteredDiscounts = discounts.filter(d => {
    if (statusF === "All") return true;
    return (d.status || "Draft") === statusF;
  });

  const cols = [
    {label:"Name"},{label:"Code"},
    {label:"Type"},{label:"Value"},{label:"Applies To"},
    {label:"Valid From"},{label:"Valid To"},{label:"Uses"},{label:"Status"},{label:"Action",center:true},
  ];
  const rows = filteredDiscounts.map(d=>(
    <>
      <Td><span style={{fontWeight:600}}>{d.name||"—"}</span></Td>
      <Td mono>
        <span style={{background:LIGHT_GRN,color:GREEN,padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700}}>
          {d.code||"—"}
        </span>
      </Td>
      <Td muted>{d.type||"Percentage"}</Td>
      <Td><span style={{fontWeight:700,color:d.type==="Percentage"?GREEN:TEXT_MAIN}}>
        {d.type==="Percentage"?`${d.value}%`:`Rs. ${fmt(d.value)}`}
      </span></Td>
      <Td muted>{d.appliesTo||"All Products"}{d.appliesToValue?` — ${d.appliesToValue}`:""}</Td>
      <Td muted>{d.validFrom?fmtDate(d.validFrom):"—"}</Td>
      <Td muted>{d.validTo?fmtDate(d.validTo):"—"}</Td>
      <Td center muted>{d.maxUses||"∞"}</Td>
      <Td><Badge status={d.status||"Draft"}/></Td>
      <Td center><div style={{display:"flex",gap:2,justifyContent:"center"}}>
        <IBtn icon={IC.eye} title="View" onClick={()=>setViewRec(d)}/>
        <IBtn icon={IC.edit} title="Edit" onClick={()=>setEditRec(d)}/>
        <IBtn icon={IC.trash} title="Delete" color={RED} onClick={()=>handleDelete(d)}/>
      </div></Td>
    </>
  ));

  return (
    <div style={PAGE}>
      <PageHeader title="Discounts" breadcrumb="Home / Sell / Discounts"
        actions={<PrimaryBtn label="New Discount" icon={IC.tag} onClick={()=>setView("add")}/>}/>
      <div style={{padding:"16px 24px 0",display:"flex",gap:14,flexShrink:0}}>
        <StatCard label="Total" value={discounts.length} sub="All campaigns" accent={GREEN}
          active={statusF==="All"}
          onClick={()=>setStatusF("All")}/>
        <StatCard label="Active" value={discounts.filter(d=>d.status==="Active").length} sub="Running now" accent="#22c55e"
          active={statusF==="Active"}
          onClick={()=>setStatusF(prev=>prev==="Active"?"All":"Active")}/>
        <StatCard label="Inactive" value={discounts.filter(d=>d.status==="Inactive").length} sub="Paused" accent={AMBER}
          active={statusF==="Inactive"}
          onClick={()=>setStatusF(prev=>prev==="Inactive"?"All":"Inactive")}/>
        <StatCard label="Draft" value={discounts.filter(d=>d.status==="Draft").length} sub="Not published" accent={TEXT_MUTED}
          active={statusF==="Draft"}
          onClick={()=>setStatusF(prev=>prev==="Draft"?"All":"Draft")}/>
      </div>
      <div style={{flex:1,minHeight:0,padding:"14px 24px",display:"flex",flexDirection:"column"}}>
        <TablePage columns={cols} rows={rows} loading={loading} emptyText="No discounts yet. Click New Discount to create one."
          footer={<span style={{fontSize:12,color:TEXT_MUTED}}>{filteredDiscounts.length} of {discounts.length} discount(s)</span>}/>
      </div>
      {viewRec && (
        <QuickView title={viewRec.name} subtitle={viewRec.code}
          onClose={()=>setViewRec(null)}
          rows={[
            {label:"Type", value:viewRec.type},
            {label:"Value", value:viewRec.type==="Percentage"?`${viewRec.value}%`:`Rs. ${fmt(viewRec.value)}`},
            {label:"Applies To", value:viewRec.appliesTo},
            {label:"Applies To Value", value:viewRec.appliesToValue||"—"},
            {label:"Customer Group", value:viewRec.customerGroup},
            {label:"Min Order", value:viewRec.minOrderAmount>0?`Rs. ${fmt(viewRec.minOrderAmount)}`:"None"},
            {label:"Max Uses", value:viewRec.maxUses||"Unlimited"},
            {label:"Valid", value:`${viewRec.validFrom?fmtDate(viewRec.validFrom):"—"} → ${viewRec.validTo?fmtDate(viewRec.validTo):"—"}`},
            {label:"Status", value:<Badge status={viewRec.status||"Draft"}/>},
            {label:"Description", value:viewRec.description||"—"},
          ]}/>
      )}
      {editRec && (
        <QuickEdit title={`Edit ${editRec.name}`} onClose={()=>setEditRec(null)} onSave={handleEditSave}
          initial={{ name: editRec.name || "", value: editRec.value ?? 0, status: editRec.status || "Active" }}
          fields={[
            {key:"name", label:"Discount Name"},
            {key:"value", label:"Value", type:"number"},
            {key:"status", label:"Status", type:"select", options:["Active","Inactive","Draft"]},
          ]}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 12. IMPORT SALES — CSV parse + column check + preview
// Imports into the SAME sales_invoices table as Add Sale / Add
// Draft (no separate "import" table needed for the records
// themselves). A lightweight sales_import_logs table records each
// import run for history/auditing — see the SQL migration file.
// ═══════════════════════════════════════════════════════════════
// This is a "lookup table" — a list that tells the app:
// "if you see this word, treat it the same as that word"
const HEADER_ALIASES = {
  "Invoice No.":         ["invoice no.", "invoice no", "invoice number", "invoice #"],
  "Date":                ["date", "invoice date"],
  "Due Date":            ["due date"],
  "Customer":            ["customer", "customer name", "client", "client name"],
  "Customer Type":       ["customer type"],
  "Location":            ["location", "warehouse"],
  "Payment Status":      ["payment status", "status"],
  "Amount Paid (Rs.)":   ["amount paid (rs.)", "amount paid", "paid amount"],
  "Balance Due (Rs.)":   ["balance due (rs.)", "balance due", "balance"],
  "Method":              ["method", "payment method", "mode of payment"],
  "Total (Rs.)":         ["total (rs.)", "total", "grand total"],
};

// This is a "function" — a reusable block of instructions.
// It checks your file's columns against the lookup table above,
// and tells us which required column matches which uploaded column.
function matchHeaders(rawHeaders, REQUIRED) {
  const map = {};
  REQUIRED.forEach(canonical => {
    const aliases = HEADER_ALIASES[canonical] || [canonical.toLowerCase()];
    const found = rawHeaders.find(h => aliases.includes(h.trim().toLowerCase()));
    if (found) map[canonical] = found;
  });
  return map;
}



export function ImportSales() {
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState([]);
  const [headers,   setHeaders]   = useState([]);
  const [status,    setStatus]    = useState("");
  const [importing, setImporting] = useState(false);
  const [dragging,  setDragging]  = useState(false);

const REQUIRED = ["Invoice No.","Date","Due Date","Customer","Customer Type",
    "Location","Payment Status","Amount Paid (Rs.)","Balance Due (Rs.)","Method","Total (Rs.)"];
    // These two lines re-run automatically every time the file changes.
  // headerMap = which uploaded column matches which required column
  // missingRequired = required columns that truly have no match at all
  const headerMap = matchHeaders(headers, REQUIRED);
  const missingRequired = REQUIRED.filter(r => !headerMap[r]);

  const parseCSV = text => {
    const lines = text.split(/\r?\n/).filter(l=>l.trim());
    if (lines.length < 2) return { h:[], rows:[] };
    const h = lines[0].split(",").map(s=>s.trim().replace(/^"|"$/g,""));
    const rows = lines.slice(1,6).map(l=>{
      const cells = l.split(",").map(s=>s.trim().replace(/^"|"$/g,""));
      return h.reduce((o,key,i)=>({...o,[key]:cells[i]||""}),{});
    });
    return { h, rows };
  };

const handleFile = f => {
  if (!f) return;
  setFile(f); setStatus(""); setPreview([]); setHeaders([]);
  const reader = new FileReader();
  reader.onload = e => {
    const { h, rows } = parseCSV(e.target.result);
    setHeaders(h); setPreview(rows);
    const map = matchHeaders(h, REQUIRED);
    const missing = REQUIRED.filter(r => !map[r]);
    if (missing.length > 0) {
      setStatus(
        `⚠️ Can't import yet — missing columns: ${missing.join(", ")}. ` +
        `This usually means you uploaded the "Export CSV" file instead of an ` +
        `import file — they use different columns. Click "Download Template" ` +
        `below, fill in product/qty/price details, then upload that instead.`
      );
    } else {
      setStatus(`✓ File loaded — ${rows.length} preview rows shown. All required columns found.`);
    }
  };
// NEW:
reader.onerror = () => setStatus("❌ Could not read file. Use CSV format.");
  reader.readAsText(f);
};

// This function takes your file's text, and "translates" its header row
// into the exact column names the backend expects — using the map we
// built earlier (e.g. renames "Customer" -> "Customer Name").
const buildNormalizedCSV = (text, map) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const rawHeaders = lines[0].split(",").map(s => s.trim().replace(/^"|"$/g, ""));
  const dataLines = lines.slice(1);
  const newLines = [REQUIRED.join(",")];
  dataLines.forEach(l => {
    const cells = l.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
    const rowObj = rawHeaders.reduce((o, key, i) => ({ ...o, [key]: cells[i] || "" }), {});
    const newRow = REQUIRED.map(canonical => rowObj[map[canonical]] ?? "");
    newLines.push(newRow.join(","));
  });
  return newLines.join("\n");
};

const handleImport = async () => {
  if (!file) { alert("Select a file first."); return; }
  if (preview.length===0) { alert("No valid data found."); return; }
  if (missingRequired.length > 0) {
    alert(
      `Cannot import — these required columns are missing:\n\n` +
      `${missingRequired.join(", ")}\n\n` +
      `Download the template below, fill it in, and upload that instead.`
    );
    return;
  }
  setImporting(true);
  const token = localStorage.getItem("manod_token");
  try {
    const rawText = await file.text();
    const normalizedCSV = buildNormalizedCSV(rawText, headerMap);
    const normalizedFile = new File([normalizedCSV], file.name, { type: "text/csv" });
    const form = new FormData(); form.append("file", normalizedFile);
   let r = null;
    for (const base of BASES) {
      try {
        r = await fetch(`${base}/import/sales`, {
          method:"POST",
          headers: token ? { Authorization:`Bearer ${token}` } : {},
          body: form,
        });
        if (r.ok) break;
      } catch (e) { /* try next base */ }
    }
    if (r && r.ok) {
      const d = await r.json();
      setStatus(`✓ Import complete — ${d.imported ?? d.data?.imported ?? preview.length} records imported`);
    } else {
      const body = await r.json().catch(()=>({}));
      setStatus(`❌ Import failed: ${body.message || `HTTP ${r.status}`}`);
    }
  } catch (e) {
    setStatus(`❌ Import failed: ${e.message}`);
  }
  setImporting(false);
};
const downloadTemplate = () => {
    const csv = REQUIRED.join(",") + "\n" +
      "INV-2026-000001,02/07/2026,09/07/2026,John Doe,Retail Shop,Manod HQ,Paid,500,0,Cash,500";
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sales_import_template.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={PAGE}>
      <PageHeader title="Import Sales" breadcrumb="Home / Sell / Import Sales"
        actions={preview.length>0 && (
          <PrimaryBtn label={importing?"Importing...":"Import Now"} icon={IC.upload} onClick={handleImport} disabled={importing || missingRequired.length>0}/>
        )}/>
      <div style={{flex:1,overflowY:"auto",padding:"24px",display:"flex",gap:20,alignItems:"flex-start"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <CardTitle>Upload CSV File</CardTitle>
            <div
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}
              style={{border:`2px dashed ${dragging?GREEN:BORDER}`,borderRadius:10,padding:"36px 24px",
                textAlign:"center",background:dragging?LIGHT_GRN:"#fafafa",transition:"all 0.2s"}}>
              <div style={{fontSize:32,marginBottom:8}}>📄</div>
              <div style={{fontSize:14,fontWeight:600,color:TEXT_MAIN,marginBottom:4}}>
                {file ? file.name : "Drag & drop your CSV file here"}
              </div>
              <div style={{fontSize:12,color:TEXT_MUTED,marginBottom:16}}>Supported: .csv</div>
              <label style={{cursor:"pointer",padding:"8px 20px",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:6,fontSize:13,fontFamily:F,fontWeight:500}}>
                Browse File
                <input type="file" accept=".csv" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
              </label>
            </div>

            {status && (
              <div style={{marginTop:12,fontSize:13,fontWeight:600,padding:"10px 14px",borderRadius:6,
                background:status.startsWith("✓")?LIGHT_GRN:status.startsWith("⚠️")?"#fef9c3":"#fef2f2",
                color:status.startsWith("✓")?GREEN:status.startsWith("⚠️")?"#854d0e":RED,
                border:`1px solid ${status.startsWith("✓")?"#a7f3d0":status.startsWith("⚠️")?"#fde68a":"#fecaca"}`}}>
                {status}
              </div>
            )}

         <div style={{marginTop:14,display:"flex",gap:10}}>
              <PrimaryBtn label={importing?"Importing...":"Import"} icon={IC.upload} onClick={handleImport} disabled={!file||importing||missingRequired.length>0}/>
              <GhostBtn label="Download Template" icon={IC.csv} onClick={downloadTemplate}/>
            </div>
          </Card>

          {preview.length>0 && (
            <Card>
              <CardTitle>Preview (first {preview.length} rows)</CardTitle>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {headers.map(h=>(
                      <th key={h} style={{padding:"6px 10px",fontWeight:600,fontSize:11,
                        color:REQUIRED.includes(h)?TEXT_MAIN:TEXT_MUTED,
                        borderBottom:`1px solid ${BORDER}`,whiteSpace:"nowrap",textAlign:"left"}}>
                        {h}
                        {REQUIRED.includes(h) && <span style={{color:GREEN,marginLeft:4}}>✓</span>}
                      </th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {preview.map((row,i)=>(
                      <tr key={i} style={{borderBottom:`1px solid ${BORDER}`}}>
                        {headers.map(h=>(
                          <td key={h} style={{padding:"6px 10px",fontSize:12,color:TEXT_MAIN}}>{row[h]||"—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div style={{width:280,flexShrink:0,display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <CardTitle>Required Columns</CardTitle>
            {REQUIRED.map((col,i)=>(
              <div key={col} style={{display:"flex",alignItems:"center",gap:10,
                padding:"7px 0",borderBottom:i<REQUIRED.length-1?`1px solid ${BORDER}`:"none",fontSize:13}}>
                <span style={{width:22,height:22,background:LIGHT_GRN,color:GREEN,borderRadius:4,
                  display:"inline-flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</span>
                <span style={{flex:1}}>{col}</span>
               {headers.length>0 && (
  <span style={{fontSize:14,color:headerMap[col]?"#16a34a":RED}}>
    {headerMap[col]?"✓":"✗"}
  </span>
)}
              </div>
            ))}
          </Card>

          {headers.length>0 && (
            <Card>
              <CardTitle>Column Match</CardTitle>
              {(() => {
               const matched  = REQUIRED.filter(r=>headerMap[r]).length;
                const pct      = Math.round(matched/REQUIRED.length*100);
                return (
                  <>
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                        <span style={{color:TEXT_MUTED}}>Match</span>
                        <span style={{fontWeight:700,color:pct===100?"#16a34a":pct>=60?AMBER:RED}}>{pct}%</span>
                      </div>
                      <div style={{background:"#f1f5f9",borderRadius:999,height:8,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:999,
                          background:pct===100?"#16a34a":pct>=60?AMBER:RED,
                          width:`${pct}%`,transition:"width 0.4s"}}/>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:TEXT_MUTED}}>
                      {matched} of {REQUIRED.length} required columns found
                    </div>
                  </>
                );
              })()}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllSales;
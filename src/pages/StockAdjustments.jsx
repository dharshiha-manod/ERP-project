/**
 * ============================================================
 * src/pages/StockAdjustments.jsx
 *
 * Two named exports consumed by App.jsx:
 *   • ListStockAdjustments  — /stock-adjustments
 *   • AddStockAdjustment    — /stock-adjustments/create
 *
 * Uses the same green design system as the rest of Manod ERP.
 * All data is fetched from PostgreSQL via stockAdjustmentAPI.js.
 * No dummy/hardcoded data.
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchStockAdjustments,
  deleteStockAdjustment,
  approveStockAdjustment,
  fetchAdjustmentStats,
  createStockAdjustment,
  searchProducts,
  fetchLocations,
} from "../api/stockAdjustmentAPI";

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES  (scoped prefix: sa-)
═══════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  :root {
    --g900:#1a2e1f; --g800:#1e3a25; --g700:#2d5a3d; --g600:#3a7a52;
    --g500:#4a9a68; --g400:#5db87e; --g300:#84d4a0; --g100:#e8f5ee; --g50:#f2faf5;
    --accent:#3b82f6; --danger:#ef4444; --warning:#f59e0b; --success:#22c55e;
    --td:#0f1f14; --tm:#374840; --tl:#6b7f72;
    --border:#d1e5d9; --surf:#ffffff; --bg:#f0f6f2;
    --rsm:6px; --r:10px; --rlg:16px;
    --sh-sm:0 1px 3px rgba(0,0,0,.07);
    --sh:0 4px 16px rgba(0,0,0,.09);
    --sh-lg:0 8px 32px rgba(0,0,0,.13);
  }

  .sa-page { font-family:'DM Sans',sans-serif; color:var(--td); background:var(--bg); min-height:100vh; }

  /* Header */
  .sa-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; }
  .sa-title { font-family:'Sora',sans-serif; font-size:1.75rem; font-weight:700; color:var(--g900); letter-spacing:-.5px; }
  .sa-breadcrumb { font-size:.78rem; color:var(--tl); margin-top:2px; }
  .sa-breadcrumb span { color:var(--g600); font-weight:500; }
  .sa-back-link { display:inline-flex; align-items:center; gap:6px; font-size:.83rem; font-weight:500; color:var(--g600); text-decoration:none; margin-bottom:8px; transition:color .12s; }
  .sa-back-link:hover { color:var(--g900); }

  /* Buttons */
  .sa-btn-add {
    display:inline-flex; align-items:center; gap:8px; flex-shrink:0;
    background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);
    color:#fff; border:none; border-radius:50px; padding:11px 26px;
    font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer;
    box-shadow:0 3px 10px rgba(34,197,94,.35); transition:transform .15s,box-shadow .15s;
    text-decoration:none; white-space:nowrap; margin-top:4px;
  }
  .sa-btn-add:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(34,197,94,.45); }
  .sa-btn-save {
    display:inline-flex; align-items:center; gap:10px;
    background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);
    color:#fff; border:none; border-radius:var(--r);
    padding:13px 52px; font-family:'Sora',sans-serif; font-size:1rem; font-weight:600;
    cursor:pointer; letter-spacing:.3px; box-shadow:0 4px 18px rgba(34,197,94,.4);
    transition:transform .15s,box-shadow .15s;
  }
  .sa-btn-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(34,197,94,.5); }
  .sa-btn-save:disabled { opacity:.55; cursor:not-allowed; }

  /* Stats cards */
  .sa-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  @media(max-width:900px){ .sa-stats-grid{grid-template-columns:1fr 1fr;} }
  @media(max-width:580px){ .sa-stats-grid{grid-template-columns:1fr;} }
  .sa-stat-card {
    background:var(--surf); border-radius:var(--rlg); border:1px solid var(--border);
    box-shadow:var(--sh-sm); padding:20px 22px;
    display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
  }
  .sa-stat-card::before {
    content:''; position:absolute; top:0; left:0; width:4px; height:100%;
  }
  .sa-stat-card.green::before  { background:var(--g500); }
  .sa-stat-card.blue::before   { background:var(--accent); }
  .sa-stat-card.amber::before  { background:var(--warning); }
  .sa-stat-card.red::before    { background:var(--danger); }
  .sa-stat-label { font-size:.75rem; font-weight:600; color:var(--tl); text-transform:uppercase; letter-spacing:.5px; }
  .sa-stat-value { font-family:'Sora',sans-serif; font-size:1.7rem; font-weight:700; color:var(--g900); }
  .sa-stat-sub   { font-size:.75rem; color:var(--tl); }

  /* Card */
  .sa-card { background:var(--surf); border-radius:var(--rlg); box-shadow:var(--sh); border:1px solid var(--border); overflow:hidden; }
  .sa-card-header { padding:18px 24px 0; }
  .sa-card-title  { font-family:'Sora',sans-serif; font-size:1rem; font-weight:600; color:var(--g900); }

  /* Toolbar */
  .sa-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:16px 24px; border-bottom:1px solid var(--border); }
  .sa-toolbar-left  { display:flex; align-items:center; gap:8px; }
  .sa-toolbar-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .sa-show-label  { font-size:.82rem; color:var(--tl); }
  .sa-show-select { border:1px solid var(--border); border-radius:var(--rsm); padding:4px 8px; font-family:'DM Sans',sans-serif; font-size:.82rem; color:var(--td); background:var(--bg); outline:none; cursor:pointer; }
  .sa-filter-select { border:1.5px solid var(--border); border-radius:var(--rsm); padding:6px 10px; font-family:'DM Sans',sans-serif; font-size:.82rem; color:var(--td); background:var(--bg); outline:none; min-width:130px; }

  /* Export buttons */
  .sa-export-group { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .sa-export-btn {
    display:inline-flex; align-items:center; gap:6px;
    border:1.5px solid var(--border); border-radius:var(--rsm); padding:6px 14px;
    background:var(--surf); font-family:'DM Sans',sans-serif; font-size:.8rem;
    font-weight:500; color:var(--tm); cursor:pointer; transition:all .15s;
    position:relative; overflow:hidden;
  }
  .sa-export-btn::before { content:''; position:absolute; inset:0; background:var(--g100); transform:scaleX(0); transform-origin:left; transition:transform .2s; z-index:0; }
  .sa-export-btn:hover::before { transform:scaleX(1); }
  .sa-export-btn:hover { border-color:var(--g400); color:var(--g800); }
  .sa-export-btn > * { position:relative; z-index:1; }

  /* Search */
  .sa-search-wrap { position:relative; display:flex; align-items:center; }
  .sa-search-icon { position:absolute; left:10px; color:var(--tl); width:14px; height:14px; pointer-events:none; }
  .sa-search-input { border:1.5px solid var(--border); border-radius:var(--rsm); padding:6px 12px 6px 30px; font-family:'DM Sans',sans-serif; font-size:.82rem; color:var(--td); background:var(--bg); outline:none; width:200px; transition:border-color .15s; }
  .sa-search-input:focus { border-color:var(--g500); background:#fff; }

  /* Table */
  .sa-table-wrap { overflow-x:auto; }
  table.sa-table { width:100%; border-collapse:collapse; font-size:.85rem; }
  .sa-table thead tr { background:linear-gradient(90deg,var(--g50) 0%,#f8fbfa 100%); border-bottom:2px solid var(--border); }
  .sa-table th { padding:12px 16px; text-align:left; font-family:'Sora',sans-serif; font-size:.75rem; font-weight:600; color:var(--g700); text-transform:uppercase; letter-spacing:.6px; white-space:nowrap; }
  .sa-table td { padding:13px 16px; border-bottom:1px solid var(--border); color:var(--tm); vertical-align:middle; }
  .sa-table tbody tr { transition:background .12s; }
  .sa-table tbody tr:hover { background:var(--g50); }
  .sa-table tbody tr:last-child td { border-bottom:none; }
  .sa-empty { text-align:center; padding:56px 0; color:var(--tl); font-size:.9rem; }
  .sa-empty-icon { font-size:2.5rem; margin-bottom:8px; opacity:.5; }

  /* Footer / Pagination */
  .sa-footer { display:flex; align-items:center; justify-content:space-between; padding:14px 24px; border-top:1px solid var(--border); font-size:.82rem; color:var(--tl); flex-wrap:wrap; gap:10px; }
  .sa-pagination { display:flex; gap:6px; }
  .sa-page-btn { border:1.5px solid var(--border); border-radius:var(--rsm); background:var(--surf); padding:5px 14px; font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:500; color:var(--tm); cursor:pointer; transition:all .15s; }
  .sa-page-btn:hover:not(:disabled) { background:var(--g100); border-color:var(--g400); color:var(--g800); }
  .sa-page-btn.active { background:var(--g600); color:#fff; border-color:var(--g600); }
  .sa-page-btn:disabled { opacity:.4; cursor:default; }

  /* Badges */
  .sa-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; white-space:nowrap; }
  .sa-badge--draft     { background:#f1f5f9; color:#475569; }
  .sa-badge--pending   { background:#fef3c7; color:#92400e; }
  .sa-badge--completed { background:#dcfce7; color:#166534; }
  .sa-badge--cancelled { background:#fee2e2; color:#991b1b; }
  .sa-badge--normal    { background:#e0f2fe; color:#0369a1; }
  .sa-badge--abnormal  { background:#fce7f3; color:#9d174d; }

  /* Action buttons */
  .sa-action-btn { border:none; background:none; cursor:pointer; padding:5px 7px; border-radius:6px; display:inline-flex; align-items:center; transition:background .12s; color:var(--tl); }
  .sa-action-btn:hover         { background:var(--g100); color:var(--g800); }
  .sa-action-btn.approve:hover { background:#dcfce7; color:#166534; }
  .sa-action-btn.delete:hover  { background:#fee2e2; color:#991b1b; }
  .sa-action-btn-group { display:flex; gap:4px; }

  /* Form layout */
  .sa-form-section { padding:24px; border-bottom:1px solid var(--border); }
  .sa-form-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  @media(max-width:900px){ .sa-form-grid{grid-template-columns:1fr 1fr;} }
  @media(max-width:580px){ .sa-form-grid{grid-template-columns:1fr;} }
  .sa-field { display:flex; flex-direction:column; gap:6px; }
  .sa-label { font-size:.78rem; font-weight:600; color:var(--tm); text-transform:uppercase; letter-spacing:.5px; display:flex; align-items:center; gap:4px; }
  .sa-req   { color:var(--danger); }
  .sa-input, .sa-select {
    border:1.5px solid var(--border); border-radius:var(--rsm); padding:9px 12px;
    font-family:'DM Sans',sans-serif; font-size:.88rem; color:var(--td); background:var(--bg);
    outline:none; transition:border-color .15s,background .15s; width:100%;
  }
  .sa-input:focus, .sa-select:focus { border-color:var(--g500); background:#fff; box-shadow:0 0 0 3px rgba(74,154,104,.12); }
  .sa-textarea { border:1.5px solid var(--border); border-radius:var(--rsm); padding:10px 12px; font-family:'DM Sans',sans-serif; font-size:.88rem; color:var(--td); background:var(--bg); outline:none; resize:vertical; min-height:90px; width:100%; transition:border-color .15s; }
  .sa-textarea:focus { border-color:var(--g500); background:#fff; }

  /* Product section */
  .sa-product-section { padding:24px; border-bottom:1px solid var(--border); }
  .sa-section-title   { font-family:'Sora',sans-serif; font-size:.9rem; font-weight:600; color:var(--g900); margin-bottom:16px; display:flex; align-items:center; gap:8px; }

  .sa-product-search-wrap { position:relative; max-width:540px; margin-bottom:20px; }
  .sa-product-search-input {
    width:100%; border:1.5px solid var(--border); border-radius:var(--r); padding:10px 14px 10px 40px;
    font-family:'DM Sans',sans-serif; font-size:.88rem; color:var(--td); background:var(--bg); outline:none; transition:border-color .15s;
  }
  .sa-product-search-input:focus { border-color:var(--g500); background:#fff; }
  .sa-product-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--tl); pointer-events:none; }
  .sa-product-dropdown {
    position:absolute; top:calc(100% + 4px); left:0; right:0;
    background:var(--surf); border:1px solid var(--border); border-radius:var(--r);
    box-shadow:var(--sh-lg); z-index:200; max-height:260px; overflow-y:auto;
    animation:fadeDown .12s ease;
  }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .sa-product-option {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 14px; cursor:pointer; transition:background .12s; border-bottom:1px solid var(--border);
  }
  .sa-product-option:last-child { border-bottom:none; }
  .sa-product-option:hover { background:var(--g50); }
  .sa-product-option-name  { font-weight:500; font-size:.85rem; color:var(--td); }
  .sa-product-option-meta  { font-size:.76rem; color:var(--tl); margin-top:2px; }
  .sa-product-option-stock { font-size:.78rem; font-weight:600; color:var(--g600); }
  .sa-no-results { padding:18px; text-align:center; color:var(--tl); font-size:.84rem; }

  table.sa-product-table { width:100%; border-collapse:collapse; font-size:.85rem; }
  .sa-product-table thead tr { background:var(--g50); border-bottom:2px solid var(--border); }
  .sa-product-table th { padding:10px 14px; font-family:'Sora',sans-serif; font-size:.74rem; font-weight:600; color:var(--g700); text-transform:uppercase; letter-spacing:.6px; text-align:left; }
  .sa-product-table td { padding:10px 14px; border-bottom:1px solid var(--border); color:var(--tm); vertical-align:middle; }
  .sa-product-table tfoot td { padding:12px 14px; font-weight:600; color:var(--g900); border-top:2px solid var(--border); font-size:.9rem; }

  .sa-qty-input { border:1.5px solid var(--border); border-radius:var(--rsm); padding:7px 10px; font-family:'DM Sans',sans-serif; font-size:.85rem; color:var(--td); background:var(--bg); outline:none; width:90px; text-align:center; }
  .sa-qty-input:focus { border-color:var(--g500); background:#fff; }
  .sa-del-btn { border:none; background:none; color:var(--danger); cursor:pointer; padding:5px; border-radius:4px; display:inline-flex; align-items:center; transition:background .12s; }
  .sa-del-btn:hover { background:#fee2e2; }

  /* Save section */
  .sa-save-section { display:flex; justify-content:flex-end; align-items:center; gap:16px; padding:24px; }

  /* Toast */
  .sa-toast { position:fixed; bottom:24px; right:24px; padding:13px 22px; border-radius:var(--r); font-size:.88rem; font-weight:500; box-shadow:var(--sh-lg); z-index:9999; animation:slideUp .25s ease; display:flex; align-items:center; gap:8px; }
  .sa-toast.success { background:var(--g800); color:#fff; }
  .sa-toast.error   { background:#991b1b;   color:#fff; }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  /* Confirm Dialog */
  .sa-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:8000; display:flex; align-items:center; justify-content:center; }
  .sa-dialog  { background:var(--surf); border-radius:var(--rlg); padding:32px; max-width:400px; width:90%; box-shadow:var(--sh-lg); text-align:center; }
  .sa-dialog-icon  { font-size:2.5rem; margin-bottom:12px; }
  .sa-dialog-title { font-family:'Sora',sans-serif; font-size:1.1rem; font-weight:700; color:var(--td); margin-bottom:8px; }
  .sa-dialog-msg   { font-size:.88rem; color:var(--tl); line-height:1.5; margin-bottom:24px; }
  .sa-dialog-btns  { display:flex; gap:12px; justify-content:center; }
  .sa-dialog-cancel { border:1.5px solid var(--border); border-radius:var(--r); background:var(--surf); padding:9px 24px; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500; color:var(--tm); cursor:pointer; transition:background .12s; }
  .sa-dialog-cancel:hover { background:var(--g50); }
  .sa-dialog-confirm { border:none; border-radius:var(--r); background:var(--danger); padding:9px 24px; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:600; color:#fff; cursor:pointer; transition:opacity .12s; }
  .sa-dialog-confirm.green { background:var(--g600); }
  .sa-dialog-confirm:hover { opacity:.88; }

  /* Loading skeleton */
  .sa-skeleton { background:linear-gradient(90deg,var(--border) 25%,var(--g50) 50%,var(--border) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:4px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  @media print {
    .sa-header .sa-btn-add, .sa-toolbar, .sa-footer, .sa-back-link, .sa-stats-grid { display:none !important; }
    .sa-card { box-shadow:none; border:none; }
  }
`;

let _stylesInjected = false;
function ensureStyles() {
  if (_stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  _stylesInjected = true;
}

/* ═══════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════ */
const IconPlus    = () => <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="1.5"/><path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconSearch  = () => <svg viewBox="0 0 16 16" fill="none" width="14" height="14" className="sa-search-icon"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconBack    = () => <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconSave    = () => <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M4 17h12a1 1 0 001-1V6.5L13.5 3H4a1 1 0 00-1 1v12a1 1 0 001 1z" stroke="#fff" strokeWidth="1.5"/><rect x="6" y="11" width="8" height="5" rx=".5" stroke="#fff" strokeWidth="1.3"/><rect x="7" y="3" width="4" height="3.5" rx=".3" stroke="#fff" strokeWidth="1.2"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><path d="M2 4h12M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 9h5l.5-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IconCheck   = () => <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconEye     = () => <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><ellipse cx="8" cy="8" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>;
const IconCSV     = () => <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><rect width="16" height="16" rx="2" fill="#16a34a"/><text x="2" y="12" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">CSV</text></svg>;
const IconPrint   = () => <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><rect x="2" y="5" width="12" height="8" rx="1.5" fill="none" stroke="#1d4ed8" strokeWidth="1.3"/><rect x="4" y="9" width="8" height="3.5" rx=".8" fill="#1d4ed8"/><path d="M4 5V2.5a.5.5 0 01.5-.5h7a.5.5 0 01.5.5V5" stroke="#1d4ed8" strokeWidth="1.3"/><circle cx="12" cy="7.5" r=".8" fill="#1d4ed8"/></svg>;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function fmtCurrency(v) {
  const n = parseFloat(v) || 0;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }) {
  const cls = {
    Draft: 'draft', Pending: 'pending', Completed: 'completed', Cancelled: 'cancelled',
  }[status] || 'draft';
  return <span className={`sa-badge sa-badge--${cls}`}>{status}</span>;
}
function TypeBadge({ type }) {
  const cls = type === 'Normal' ? 'normal' : 'abnormal';
  return <span className={`sa-badge sa-badge--${cls}`}>{type}</span>;
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);
  return [toast, show];
}

function downloadCSV(rows) {
  const cols = ['Reference No', 'Date', 'Location', 'Type', 'Status', 'Total Amount', 'Recovered', 'Reason', 'Added By'];
  const lines = [cols.join(',')];
  rows.forEach(r => {
    lines.push([
      r.reference_no, fmtDate(r.adjustment_date), r.location, r.adjustment_type,
      r.status, r.total_amount, r.total_amount_recovered, `"${(r.reason || '').replace(/"/g, '""')}"`, r.added_by || '',
    ].join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'stock-adjustments.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, color }) {
  return (
    <div className={`sa-stat-card ${color}`}>
      <div className="sa-stat-label">{label}</div>
      <div className="sa-stat-value">{value}</div>
      {sub && <div className="sa-stat-sub">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIST STOCK ADJUSTMENTS
═══════════════════════════════════════════════════════════════ */
export function ListStockAdjustments() {
  ensureStyles();
  const [rows,        setRows]        = useState([]);
  const [total,       setTotal]       = useState(0);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(25);
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('');
  const [filterStatus,setFilterStatus]= useState('');
  const [confirmDel,  setConfirmDel]  = useState(null);   // { id, ref }
  const [confirmApp,  setConfirmApp]  = useState(null);   // { id, ref }
  const [toast, showToast]            = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [adjData, statsData] = await Promise.all([
        fetchStockAdjustments({
          page, limit: pageSize, search,
          adjustment_type: filterType, status: filterStatus,
        }),
        fetchAdjustmentStats(),
      ]);
      setRows(adjData.stockAdjustments);
      setTotal(adjData.total);
      setStats(statsData.stats);
    } catch (err) {
      showToast(err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filterType, filterStatus]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  const searchTimeout = useRef(null);
  const handleSearch = (val) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await deleteStockAdjustment(confirmDel.id);
      showToast(`Deleted ${confirmDel.ref}`, 'success');
      setConfirmDel(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
      setConfirmDel(null);
    }
  };

  const handleApprove = async () => {
    if (!confirmApp) return;
    try {
      await approveStockAdjustment(confirmApp.id);
      showToast(`✅ ${confirmApp.ref} approved — stock updated`, 'success');
      setConfirmApp(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
      setConfirmApp(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="sa-page">
      {/* Header */}
      <div className="sa-header">
        <div>
          <div className="sa-title">Stock Adjustments</div>
          <div className="sa-breadcrumb">Home / <span>Stock Adjustment</span> / List</div>
        </div>
        <Link to="/stock-adjustments/create" className="sa-btn-add">
          <IconPlus /> Add Adjustment
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="sa-stats-grid">
          <StatCard label="Total Adjustments" value={stats.total_adjustments} color="green"
            sub={`${stats.completed_count} completed`} />
          <StatCard label="Total Value" value={fmtCurrency(stats.total_value)} color="blue"
            sub={`${stats.pending_count} pending`} />
          <StatCard label="Recovered" value={fmtCurrency(stats.total_recovered)} color="amber"
            sub={`${stats.normal_count} normal`} />
          <StatCard label="Net Loss" value={fmtCurrency(stats.net_loss)} color="red"
            sub={`${stats.abnormal_count} abnormal`} />
        </div>
      )}

      <div className="sa-card">
        <div className="sa-card-header">
          <div className="sa-card-title">All Stock Adjustments</div>
        </div>

        {/* Toolbar */}
        <div className="sa-toolbar">
          <div className="sa-toolbar-left">
            <span className="sa-show-label">Show</span>
            <select className="sa-show-select" value={pageSize}
              onChange={e => { setPageSize(+e.target.value); setPage(1); }}>
              {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
            </select>
            <span className="sa-show-label">entries</span>
          </div>

          <div className="sa-toolbar-right">
            <select className="sa-filter-select" value={filterType}
              onChange={e => { setFilterType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option>Normal</option>
              <option>Abnormal</option>
            </select>
            <select className="sa-filter-select" value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option>Draft</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <div className="sa-export-group">
              <button className="sa-export-btn" onClick={() => { downloadCSV(rows); showToast('CSV downloaded'); }}>
                <IconCSV /> CSV
              </button>
              <button className="sa-export-btn" onClick={() => window.print()}>
                <IconPrint /> Print
              </button>
            </div>
            <div className="sa-search-wrap">
              <IconSearch />
              <input className="sa-search-input" placeholder="Search ref, location…"
                onChange={e => handleSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Reference No</th>
                <th>Date</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Recovered</th>
                <th>Reason</th>
                <th>Added By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j}><div className="sa-skeleton" style={{ height: 16, width: j === 0 ? 80 : '70%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="sa-empty">
                      <div className="sa-empty-icon">📋</div>
                      No stock adjustments found. <Link to="/stock-adjustments/create" style={{ color: 'var(--g600)' }}>Add one now</Link>.
                    </div>
                  </td>
                </tr>
              ) : rows.map(row => (
                <tr key={row.id}>
                  <td>
                    <div className="sa-action-btn-group">
                      <button className="sa-action-btn" title="View" onClick={() => showToast(`Viewing ${row.reference_no}`)}>
                        <IconEye />
                      </button>
                      {row.status !== 'Completed' && row.status !== 'Cancelled' && (
                        <button className="sa-action-btn approve" title="Approve / Complete"
                          onClick={() => setConfirmApp({ id: row.id, ref: row.reference_no })}>
                          <IconCheck />
                        </button>
                      )}
                      <button className="sa-action-btn delete" title="Delete"
                        onClick={() => setConfirmDel({ id: row.id, ref: row.reference_no })}>
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--g700)' }}>{row.reference_no}</td>
                  <td>{fmtDate(row.adjustment_date)}</td>
                  <td>{row.location}</td>
                  <td><TypeBadge type={row.adjustment_type} /></td>
                  <td><StatusBadge status={row.status} /></td>
                  <td style={{ fontWeight: 600 }}>{fmtCurrency(row.total_amount)}</td>
                  <td>{fmtCurrency(row.total_amount_recovered)}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.reason || '—'}
                  </td>
                  <td>{row.added_by || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sa-footer">
          <span>
            {total === 0
              ? 'Showing 0 entries'
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} entries`}
          </span>
          <div className="sa-pagination">
            <button className="sa-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} className={`sa-page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button className="sa-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDel && (
        <div className="sa-overlay" onClick={() => setConfirmDel(null)}>
          <div className="sa-dialog" onClick={e => e.stopPropagation()}>
            <div className="sa-dialog-icon">🗑️</div>
            <div className="sa-dialog-title">Delete Adjustment?</div>
            <div className="sa-dialog-msg">
              Are you sure you want to delete <strong>{confirmDel.ref}</strong>?
              If this adjustment was Completed, stock will be restored. This cannot be undone.
            </div>
            <div className="sa-dialog-btns">
              <button className="sa-dialog-cancel" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="sa-dialog-confirm" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve confirm */}
      {confirmApp && (
        <div className="sa-overlay" onClick={() => setConfirmApp(null)}>
          <div className="sa-dialog" onClick={e => e.stopPropagation()}>
            <div className="sa-dialog-icon">✅</div>
            <div className="sa-dialog-title">Approve Adjustment?</div>
            <div className="sa-dialog-msg">
              Approving <strong>{confirmApp.ref}</strong> will mark it as Completed and
              deduct the adjusted quantities from current stock. This cannot be undone.
            </div>
            <div className="sa-dialog-btns">
              <button className="sa-dialog-cancel" onClick={() => setConfirmApp(null)}>Cancel</button>
              <button className="sa-dialog-confirm green" onClick={handleApprove}>Approve & Complete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`sa-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADD STOCK ADJUSTMENT
═══════════════════════════════════════════════════════════════ */
export function AddStockAdjustment() {
  ensureStyles();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    location:               '',
    reference_no:           '',
    adjustment_date:        new Date().toISOString().split('T')[0],
    adjustment_type:        '',
    status:                 'Draft',
    total_amount_recovered: '0',
    reason:                 '',
  });
  const [items,     setItems]     = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [toast, showToast]        = useToast();

  // Product search
  const [searchQ,   setSearchQ]   = useState('');
  const [products,  setProducts]  = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const searchRef                 = useRef(null);
  const dropRef                   = useRef(null);

  // Locations
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations()
      .then(d => setLocations(d.locations || []))
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) &&
          searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load all products by default so dropdown shows items without typing
  useEffect(() => {
    searchProducts('').then(d => setProducts(d.products || [])).catch(() => {});
  }, []);

  // Debounced product search
  const searchTimeout = useRef(null);
  const handleProductSearch = (val) => {
    setSearchQ(val);
    clearTimeout(searchTimeout.current);
    setShowDrop(true);
    if (!val.trim()) {
      // Show all products when search is cleared
      searchProducts('').then(d => setProducts(d.products || [])).catch(() => {});
      return;
    }
    setSearching(true);
    setShowDrop(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await searchProducts(val);
        setProducts(data.products || []);
      } catch (_) {
        setProducts([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const addProduct = (p) => {
    // Prevent duplicates
    if (items.find(it => it.product_id === p.id)) {
      showToast(`${p.product_name} already added`, 'error');
      setShowDrop(false);
      setSearchQ('');
      return;
    }
    setItems(prev => [...prev, {
      _key:         Date.now(),
      product_id:   p.id,
      product_name: p.product_name,
      sku:          p.sku,
      current_stock: p.current_stock,
      quantity:     1,
      unit_cost:    parseFloat(p.unit_cost) || 0,
      subtotal:     parseFloat(p.unit_cost) || 0,
    }]);
    setShowDrop(false);
    setSearchQ('');
  };

  const updateItem = (key, field, val) => {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: val };
      updated.subtotal = +(parseFloat(updated.quantity || 0) * parseFloat(updated.unit_cost || 0)).toFixed(2);
      return updated;
    }));
  };

  const removeItem = (key) => setItems(prev => prev.filter(it => it._key !== key));

  const totalAmount = items.reduce((s, it) => s + (it.subtotal || 0), 0);

  const handleSave = async (saveStatus) => {
    if (!form.location)        { showToast('Business location is required', 'error'); return; }
    if (!form.adjustment_type) { showToast('Adjustment type is required', 'error'); return; }
    if (items.length === 0)    { showToast('Add at least one product', 'error'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        status: saveStatus,
        total_amount_recovered: parseFloat(form.total_amount_recovered) || 0,
        items: items.map(it => ({
          product_id: it.product_id,
          quantity:   parseFloat(it.quantity)  || 1,
          unit_cost:  parseFloat(it.unit_cost) || 0,
        })),
      };

      await createStockAdjustment(payload);
      showToast(
        saveStatus === 'Completed'
          ? '✅ Adjustment saved & stock updated!'
          : '✅ Adjustment saved as ' + saveStatus,
        'success'
      );
      setTimeout(() => navigate('/stock-adjustments'), 1200);
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sa-page">
      <div className="sa-header">
        <div>
          <Link to="/stock-adjustments" className="sa-back-link"><IconBack /> Back to List</Link>
          <div className="sa-title">Add Stock Adjustment</div>
          <div className="sa-breadcrumb">Home / <span>Stock Adjustment</span> / Add</div>
        </div>
      </div>

      <div className="sa-card">

        {/* ── Section 1: Header fields ─────────────────────────────── */}
        <div className="sa-form-section">
          <div className="sa-form-grid">

            <div className="sa-field">
              <label className="sa-label">Business Location <span className="sa-req">*</span></label>
              <select className="sa-select" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
                <option value="">— Select Location —</option>
                {locations.length > 0
                  ? locations.map(loc => <option key={loc}>{loc}</option>)
                  : <>
                      <option>Main Store</option>
                      <option>Warehouse A</option>
                      <option>Warehouse B</option>
                    </>
                }
              </select>
            </div>

            <div className="sa-field">
              <label className="sa-label">Reference No</label>
              <input className="sa-input" placeholder="Auto-generated if blank"
                value={form.reference_no}
                onChange={e => setForm(f => ({ ...f, reference_no: e.target.value }))} />
            </div>

            <div className="sa-field">
              <label className="sa-label">Adjustment Date <span className="sa-req">*</span></label>
              <input className="sa-input" type="date" value={form.adjustment_date}
                onChange={e => setForm(f => ({ ...f, adjustment_date: e.target.value }))} />
            </div>

            <div className="sa-field">
              <label className="sa-label">Adjustment Type <span className="sa-req">*</span></label>
              <select className="sa-select" value={form.adjustment_type}
                onChange={e => setForm(f => ({ ...f, adjustment_type: e.target.value }))}>
                <option value="">— Select Type —</option>
                <option>Normal</option>
                <option>Abnormal</option>
              </select>
            </div>

          </div>
        </div>

        {/* ── Section 2: Product Line Items ────────────────────────── */}
        <div className="sa-product-section">
          <div className="sa-section-title">
            📦 Products for Adjustment
            <span style={{ fontSize: '.78rem', fontWeight: 400, color: 'var(--tl)' }}>
              — search and add products below
            </span>
          </div>

          {/* Product search */}
          <div className="sa-product-search-wrap" ref={dropRef}>
            <span className="sa-product-search-icon"><IconSearch /></span>
            <input
              ref={searchRef}
              className="sa-product-search-input"
              placeholder="Search by product name or SKU…"
              value={searchQ}
              onChange={e => handleProductSearch(e.target.value)}
              onFocus={() => setShowDrop(true)}
              autoComplete="off"
            />
            {showDrop && (
              <div className="sa-product-dropdown">
                {searching ? (
                  <div className="sa-no-results">Searching…</div>
                ) : products.length === 0 ? (
                  <div className="sa-no-results">No products found for "{searchQ}"</div>
                ) : products.map(p => (
                  <div key={p.id} className="sa-product-option" onMouseDown={() => addProduct(p)}>
                    <div>
                      <div className="sa-product-option-name">{p.product_name}</div>
                      <div className="sa-product-option-meta">SKU: {p.sku || '—'} · Cost: {fmtCurrency(p.unit_cost)}</div>
                    </div>
                    <div className="sa-product-option-stock">Stock: {p.current_stock ?? 0}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Line items table */}
          <table className="sa-product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Adj. Qty</th>
                <th>Unit Cost (₹)</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--tl)', fontSize: '.85rem' }}>
                    No products added yet — search above to add.
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item._key}>
                  <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                  <td style={{ color: 'var(--tl)', fontSize: '.8rem' }}>{item.sku || '—'}</td>
                  <td>
                    <span style={{ background: 'var(--g50)', borderRadius: 6, padding: '2px 8px', fontSize: '.8rem', color: 'var(--g700)', fontWeight: 600 }}>
                      {item.current_stock ?? 0}
                    </span>
                  </td>
                  <td>
                    <input type="number" className="sa-qty-input"
                      value={item.quantity} min="0.001" step="0.001"
                      onChange={e => updateItem(item._key, 'quantity', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" className="sa-qty-input" style={{ width: 110 }}
                      value={item.unit_cost} min="0" step="0.01"
                      onChange={e => updateItem(item._key, 'unit_cost', e.target.value)} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{fmtCurrency(item.subtotal)}</td>
                  <td>
                    <button className="sa-del-btn" onClick={() => removeItem(item._key)}><IconTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right' }}>Total Adjustment Amount:</td>
                  <td style={{ color: 'var(--g900)' }}>{fmtCurrency(totalAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* ── Section 3: Bottom fields ─────────────────────────────── */}
        <div className="sa-form-section">
          <div className="sa-form-grid">

            <div className="sa-field">
              <label className="sa-label">Total Amount Recovered (₹)</label>
              <input className="sa-input" type="number" min="0" step="0.01"
                value={form.total_amount_recovered}
                onChange={e => setForm(f => ({ ...f, total_amount_recovered: e.target.value }))} />
            </div>

            <div className="sa-field" style={{ gridColumn: 'span 3' }}>
              <label className="sa-label">Reason / Notes</label>
              <textarea className="sa-textarea" placeholder="Describe the reason for this stock adjustment…"
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>

          </div>
        </div>

        {/* ── Save Buttons ──────────────────────────────────────────── */}
        <div className="sa-save-section">
          <button
            className="sa-btn-save"
            style={{ background: 'var(--g100)', color: 'var(--g800)', boxShadow: 'none', border: '1.5px solid var(--border)' }}
            onClick={() => handleSave('Draft')}
            disabled={saving}>
            Save as Draft
          </button>
          <button
            className="sa-btn-save"
            style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', boxShadow: '0 4px 14px rgba(245,158,11,.35)' }}
            onClick={() => handleSave('Pending')}
            disabled={saving}>
            Save as Pending
          </button>
          <button className="sa-btn-save" onClick={() => handleSave('Completed')} disabled={saving}>
            <IconSave /> {saving ? 'Saving…' : 'Approve & Complete'}
          </button>
        </div>
      </div>

      {toast && <div className={`sa-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default ListStockAdjustments;
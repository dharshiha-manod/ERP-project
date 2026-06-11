import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  :root {
    --green-900: #1a2e1f;
    --green-800: #1e3a25;
    --green-700: #2d5a3d;
    --green-600: #3a7a52;
    --green-500: #4a9a68;
    --green-400: #5db87e;
    --green-300: #84d4a0;
    --green-100: #e8f5ee;
    --green-50:  #f2faf5;
    --accent:    #3b82f6;
    --danger:    #ef4444;
    --warning:   #f59e0b;
    --text-dark: #0f1f14;
    --text-mid:  #374840;
    --text-light:#6b7f72;
    --border:    #d1e5d9;
    --surface:   #ffffff;
    --bg:        #f0f6f2;
    --radius-sm: 6px;
    --radius:    10px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.07);
    --shadow:    0 4px 16px rgba(0,0,0,.09);
    --shadow-lg: 0 8px 32px rgba(0,0,0,.13);
  }

  .sa-page { font-family:'DM Sans',sans-serif; color:var(--text-dark); background:var(--bg); min-height:100vh; }

  /* ── FIXED HEADER: always shows title + Add button together ── */
  .sa-header {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    margin-bottom:24px;
    gap: 16px;
  }
  .sa-title { font-family:'Sora',sans-serif; font-size:1.75rem; font-weight:700; color:var(--green-900); letter-spacing:-.5px; }
  .sa-breadcrumb { font-size:.78rem; color:var(--text-light); margin-top:2px; }
  .sa-breadcrumb span { color:var(--green-600); font-weight:500; }

  /* Add button — inline in header, always visible */
  .sa-btn-add {
    display:inline-flex; align-items:center; gap:8px; flex-shrink:0;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color:#fff; border:none; border-radius:50px; padding:11px 26px;
    font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer;
    box-shadow: 0 3px 10px rgba(34,197,94,0.35);
    transition:transform .15s, box-shadow .15s; text-decoration:none;
    white-space:nowrap; margin-top: 4px;
  }
  .sa-btn-add:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(34,197,94,0.45); }

  .sa-card { background:var(--surface); border-radius:var(--radius-lg); box-shadow:var(--shadow); border:1px solid var(--border); overflow:hidden; }
  .sa-card-header { padding:18px 24px 0; }
  .sa-card-title { font-family:'Sora',sans-serif; font-size:1rem; font-weight:600; color:var(--green-900); }

  .sa-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:16px 24px; border-bottom:1px solid var(--border); }
  .sa-toolbar-left { display:flex; align-items:center; gap:8px; }
  .sa-show-label { font-size:.82rem; color:var(--text-light); }
  .sa-show-select { border:1px solid var(--border); border-radius:var(--radius-sm); padding:4px 8px; font-family:'DM Sans',sans-serif; font-size:.82rem; color:var(--text-dark); background:var(--bg); outline:none; cursor:pointer; }

  .sa-export-group { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .sa-export-btn {
    display:inline-flex; align-items:center; gap:6px;
    border:1.5px solid var(--border); border-radius:var(--radius-sm);
    padding:6px 14px; background:var(--surface);
    font-family:'DM Sans',sans-serif; font-size:.8rem; font-weight:500; color:var(--text-mid);
    cursor:pointer; transition:all .15s; position:relative; overflow:hidden;
  }
  .sa-export-btn::before {
    content:''; position:absolute; inset:0; background:var(--green-100);
    transform:scaleX(0); transform-origin:left; transition:transform .2s; z-index:0;
  }
  .sa-export-btn:hover::before { transform:scaleX(1); }
  .sa-export-btn:hover { border-color:var(--green-400); color:var(--green-800); }
  .sa-export-btn > * { position:relative; z-index:1; }
  .sa-export-btn:active { transform:scale(.96); }

  .sa-dropdown { position:relative; }
  .sa-dropdown-menu {
    position:absolute; top:calc(100% + 6px); left:0; background:var(--surface);
    border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow-lg);
    min-width:160px; z-index:100; overflow:hidden; animation:fadeDown .15s ease;
  }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .sa-dropdown-item { display:flex; align-items:center; gap:8px; padding:9px 16px; font-size:.82rem; color:var(--text-mid); cursor:pointer; transition:background .12s; }
  .sa-dropdown-item:hover { background:var(--green-50); color:var(--green-800); }

  .sa-col-panel {
    position:absolute; top:calc(100% + 6px); left:0; background:var(--surface);
    border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow-lg);
    min-width:200px; z-index:100; padding:8px 0; animation:fadeDown .15s ease;
  }
  .sa-col-item { display:flex; align-items:center; gap:8px; padding:7px 16px; font-size:.82rem; color:var(--text-mid); cursor:pointer; transition:background .12s; user-select:none; }
  .sa-col-item:hover { background:var(--green-50); }
  .sa-col-item input[type=checkbox] { accent-color:var(--green-600); width:14px; height:14px; cursor:pointer; }

  .sa-toolbar-right { display:flex; align-items:center; gap:10px; }
  .sa-search-wrap { position:relative; display:flex; align-items:center; }
  .sa-search-icon { position:absolute; left:10px; color:var(--text-light); width:14px; height:14px; pointer-events:none; }
  .sa-search-input { border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:6px 12px 6px 30px; font-family:'DM Sans',sans-serif; font-size:.82rem; color:var(--text-dark); background:var(--bg); outline:none; width:200px; transition:border-color .15s; }
  .sa-search-input:focus { border-color:var(--green-500); background:#fff; }

  .sa-table-wrap { overflow-x:auto; }
  table.sa-table { width:100%; border-collapse:collapse; font-size:.85rem; }
  .sa-table thead tr { background:linear-gradient(90deg,var(--green-50) 0%,#f8fbfa 100%); border-bottom:2px solid var(--border); }
  .sa-table th { padding:12px 16px; text-align:left; font-family:'Sora',sans-serif; font-size:.75rem; font-weight:600; color:var(--green-700); text-transform:uppercase; letter-spacing:.6px; white-space:nowrap; user-select:none; cursor:pointer; }
  .sa-table th:hover { color:var(--green-900); }
  .sa-table th .sort-icon { margin-left:4px; opacity:.5; font-size:.65rem; }
  .sa-table td { padding:13px 16px; border-bottom:1px solid var(--border); color:var(--text-mid); vertical-align:middle; }
  .sa-table tbody tr { transition:background .12s; }
  .sa-table tbody tr:hover { background:var(--green-50); }
  .sa-table tbody tr:last-child td { border-bottom:none; }

  .sa-empty { text-align:center; padding:48px 0; color:var(--text-light); font-size:.9rem; }
  .sa-empty-icon { font-size:2.5rem; margin-bottom:8px; opacity:.5; }

  .sa-footer { display:flex; align-items:center; justify-content:space-between; padding:14px 24px; border-top:1px solid var(--border); font-size:.82rem; color:var(--text-light); flex-wrap:wrap; gap:10px; }
  .sa-pagination { display:flex; gap:6px; }
  .sa-page-btn { border:1.5px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); padding:5px 14px; font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:500; color:var(--text-mid); cursor:pointer; transition:all .15s; }
  .sa-page-btn:hover:not(:disabled) { background:var(--green-100); border-color:var(--green-400); color:var(--green-800); }
  .sa-page-btn:disabled { opacity:.4; cursor:default; }

  .sa-form-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; padding:24px; border-bottom:1px solid var(--border); }
  @media(max-width:900px){ .sa-form-grid{grid-template-columns:1fr 1fr;} }
  @media(max-width:580px){ .sa-form-grid{grid-template-columns:1fr;} }

  .sa-field { display:flex; flex-direction:column; gap:6px; }
  .sa-label { font-size:.8rem; font-weight:600; color:var(--text-mid); text-transform:uppercase; letter-spacing:.5px; display:flex; align-items:center; gap:4px; }
  .sa-label .req { color:var(--danger); }
  .sa-input, .sa-select { border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:9px 12px; font-family:'DM Sans',sans-serif; font-size:.88rem; color:var(--text-dark); background:var(--bg); outline:none; transition:border-color .15s,background .15s; width:100%; }
  .sa-input:focus, .sa-select:focus { border-color:var(--green-500); background:#fff; box-shadow:0 0 0 3px rgba(74,154,104,.12); }

  .sa-product-section { padding:24px; border-bottom:1px solid var(--border); }
  .sa-product-search-wrap { display:flex; align-items:center; max-width:560px; margin:0 auto 20px; }
  .sa-product-search-btn { background:var(--green-600); border:none; border-radius:var(--radius-sm) 0 0 var(--radius-sm); padding:10px 14px; color:#fff; cursor:pointer; display:flex; align-items:center; transition:background .15s; }
  .sa-product-search-btn:hover { background:var(--green-700); }
  .sa-product-search-input { flex:1; border:1.5px solid var(--border); border-left:none; border-radius:0 var(--radius-sm) var(--radius-sm) 0; padding:9px 14px; font-family:'DM Sans',sans-serif; font-size:.88rem; color:var(--text-dark); background:var(--bg); outline:none; transition:border-color .15s; }
  .sa-product-search-input:focus { border-color:var(--green-500); background:#fff; }

  table.sa-product-table { width:100%; border-collapse:collapse; font-size:.85rem; }
  .sa-product-table thead tr { background:var(--green-50); border-bottom:2px solid var(--border); }
  .sa-product-table th { padding:10px 14px; font-family:'Sora',sans-serif; font-size:.75rem; font-weight:600; color:var(--green-700); text-transform:uppercase; letter-spacing:.6px; text-align:left; }
  .sa-product-table td { padding:10px 14px; border-bottom:1px solid var(--border); color:var(--text-mid); }
  .sa-product-table tfoot td { padding:12px 14px; font-weight:600; color:var(--green-900); border-top:2px solid var(--border); font-size:.9rem; }
  .sa-del-btn { border:none; background:none; color:var(--danger); cursor:pointer; padding:4px; border-radius:4px; display:flex; align-items:center; transition:background .12s; }
  .sa-del-btn:hover { background:#fee2e2; }

  .sa-bottom-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; padding:24px; border-bottom:1px solid var(--border); }
  @media(max-width:580px){ .sa-bottom-grid{grid-template-columns:1fr;} }

  .sa-textarea { border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px 12px; font-family:'DM Sans',sans-serif; font-size:.88rem; color:var(--text-dark); background:var(--bg); outline:none; resize:vertical; min-height:90px; width:100%; transition:border-color .15s; }
  .sa-textarea:focus { border-color:var(--green-500); background:#fff; }

  .sa-save-section { display:flex; justify-content:center; padding:24px; }
  .sa-btn-save {
    display:inline-flex; align-items:center; gap:10px;
    background:linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color:#fff; border:none; border-radius:var(--radius);
    padding:13px 52px; font-family:'Sora',sans-serif; font-size:1rem; font-weight:600;
    cursor:pointer; letter-spacing:.3px;
    box-shadow:0 4px 18px rgba(34,197,94,0.4);
    transition:transform .15s, box-shadow .15s;
    position:relative; overflow:hidden;
  }
  .sa-btn-save:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(34,197,94,0.5); }
  .sa-btn-save:active { transform:scale(.97); }

  .sa-back-link { display:inline-flex; align-items:center; gap:6px; font-size:.83rem; font-weight:500; color:var(--green-600); text-decoration:none; margin-bottom:8px; transition:color .12s; }
  .sa-back-link:hover { color:var(--green-900); }

  .sa-toast { position:fixed; bottom:24px; right:24px; background:var(--green-800); color:#fff; padding:12px 20px; border-radius:var(--radius); font-size:.88rem; font-weight:500; box-shadow:var(--shadow-lg); z-index:9999; animation:slideUp .25s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .sa-badge { display:inline-block; padding:2px 8px; border-radius:20px; font-size:.73rem; font-weight:600; }
  .sa-badge--normal   { background:#dcfce7; color:#166534; }
  .sa-badge--abnormal { background:#fee2e2; color:#991b1b; }

  @media print {
    .sa-header .sa-btn-add, .sa-toolbar, .sa-footer, .sa-back-link { display:none !important; }
    .sa-card { box-shadow:none; border:none; }
  }
`;

const IconCSV     = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><rect width="16" height="16" rx="2" fill="#16a34a"/><text x="2" y="12" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">CSV</text></svg>;
const IconExcel   = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><rect width="16" height="16" rx="2" fill="#15803d"/><text x="1" y="12" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">XLS</text></svg>;
const IconPrint   = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><rect x="2" y="5" width="12" height="8" rx="1.5" fill="none" stroke="#1d4ed8" strokeWidth="1.3"/><rect x="4" y="9" width="8" height="3.5" rx=".8" fill="#1d4ed8"/><path d="M4 5V2.5a.5.5 0 01.5-.5h7a.5.5 0 01.5.5V5" stroke="#1d4ed8" strokeWidth="1.3"/><circle cx="12" cy="7.5" r=".8" fill="#1d4ed8"/></svg>;
const IconColumns = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><rect x="1" y="3" width="4" height="10" rx="1" fill="#7c3aed"/><rect x="6" y="3" width="4" height="10" rx="1" fill="#7c3aed" opacity=".7"/><rect x="11" y="3" width="4" height="10" rx="1" fill="#7c3aed" opacity=".4"/></svg>;
const IconPDF     = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><rect width="16" height="16" rx="2" fill="#dc2626"/><text x="1" y="12" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">PDF</text></svg>;
const IconPlus    = () => <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="1.5"/><path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconSearch  = () => <svg viewBox="0 0 16 16" fill="none" className="sa-search-icon"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconSort    = () => <span className="sort-icon">⇅</span>;
const IconTrash   = () => <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M2 4h12M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 9h5l.5-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IconBack    = () => <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconSave    = () => <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M4 17h12a1 1 0 001-1V6.5L13.5 3H4a1 1 0 00-1 1v12a1 1 0 001 1z" stroke="#fff" strokeWidth="1.5"/><rect x="6" y="11" width="8" height="5" rx=".5" stroke="#fff" strokeWidth="1.3"/><rect x="7" y="3" width="4" height="3.5" rx=".3" stroke="#fff" strokeWidth="1.2"/></svg>;
const IconInfo    = () => <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{opacity:.55}}><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;

let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected) return;
  const el = document.createElement("style");
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

const ALL_COLUMNS = ["Date","Reference No","Location","Adjustment Type","Total Amount","Total Amount Recovered","Reason","Added By"];

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function exportCSV(rows, visibleCols) {
  const headers = ALL_COLUMNS.filter(c => visibleCols[c]);
  const colMap  = { "Date":"date","Reference No":"ref","Location":"location","Adjustment Type":"type","Total Amount":"total","Total Amount Recovered":"recovered","Reason":"reason","Added By":"addedBy" };
  const lines   = [headers.join(",")];
  rows.forEach(r => {
    lines.push(headers.map(h => `"${String(r[colMap[h]]??"").replace(/"/g,'""')}"`).join(","));
  });
  downloadFile(lines.join("\n"), "stock-adjustments.csv", "text/csv;charset=utf-8;");
}

function exportExcel(rows, visibleCols) {
  const headers = ALL_COLUMNS.filter(c => visibleCols[c]);
  const colMap  = { "Date":"date","Reference No":"ref","Location":"location","Adjustment Type":"type","Total Amount":"total","Total Amount Recovered":"recovered","Reason":"reason","Added By":"addedBy" };
  let html = `<html><head><meta charset="UTF-8"></head><body><table>`;
  html += "<tr>" + headers.map(h => `<th><b>${h}</b></th>`).join("") + "</tr>";
  rows.forEach(r => { html += "<tr>" + headers.map(h => `<td>${r[colMap[h]]??""}</td>`).join("") + "</tr>"; });
  html += "</table></body></html>";
  downloadFile(html, "stock-adjustments.xls", "application/vnd.ms-excel");
}

function exportPDF(rows, visibleCols, scope) {
  const headers = ALL_COLUMNS.filter(c => visibleCols[c]);
  const colMap  = { "Date":"date","Reference No":"ref","Location":"location","Adjustment Type":"type","Total Amount":"total","Total Amount Recovered":"recovered","Reason":"reason","Added By":"addedBy" };
  const tableRows = rows.map(r =>
    "<tr>" + headers.map(h => `<td style="padding:7px 10px;border:1px solid #d1fae5;font-size:12px;">${r[colMap[h]]??""}</td>`).join("") + "</tr>"
  ).join("");
  const html = `<!DOCTYPE html><html><head><title>Stock Adjustments</title>
  <style>body{font-family:sans-serif;padding:24px}h2{color:#1e3a25}table{width:100%;border-collapse:collapse}th{background:#1e3a25;color:#fff;padding:9px 10px;text-align:left;font-size:12px}tr:nth-child(even){background:#f2faf5}</style>
  </head><body><h2>Stock Adjustments — ${scope}</h2>
  <p style="font-size:12px;color:#6b7f72;margin-bottom:12px;">Exported on ${new Date().toLocaleDateString()}</p>
  <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script></body></html>`;
  const w = window.open("","_blank","width=900,height=600");
  if (w) { w.document.write(html); w.document.close(); }
}

const DEMO_DATA = [
  { id:1, date:"05/28/2026", ref:"SA-2026-001", location:"Main Store",  type:"Normal",   total:"₹4,250.00",  recovered:"₹1,000.00", reason:"Damaged goods", addedBy:"Admin",       _selected:false },
  { id:2, date:"05/30/2026", ref:"SA-2026-002", location:"Warehouse A", type:"Abnormal", total:"₹12,800.00", recovered:"₹0.00",      reason:"Theft",         addedBy:"Dharshiha C", _selected:false },
  { id:3, date:"06/01/2026", ref:"SA-2026-003", location:"Main Store",  type:"Normal",   total:"₹560.00",    recovered:"₹560.00",    reason:"Expiry",        addedBy:"Admin",       _selected:false },
];

const DEFAULT_VIS = Object.fromEntries(ALL_COLUMNS.map(c => [c, true]));

const actionBtn = { border:"none", background:"none", cursor:"pointer", fontSize:".9rem", padding:"3px 5px", borderRadius:"5px", transition:"background .12s" };

/* ═══════════════════════════════════════
   LIST STOCK ADJUSTMENTS
═══════════════════════════════════════ */
export function ListStockAdjustments() {
  ensureStyles();
  const [pdfOpen,     setPdfOpen]     = useState(false);
  const [colOpen,     setColOpen]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [rows,        setRows]        = useState(DEMO_DATA);
  const [toast,       setToast]       = useState(null);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VIS);
  const [pageSize,    setPageSize]    = useState(25);
  const [page,        setPage]        = useState(1);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const filtered = rows.filter(r =>
    r.ref.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    r.reason.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id) => { setRows(r => r.filter(x => x.id !== id)); showToast("🗑 Record deleted"); };
  const toggleCol    = (col) => setVisibleCols(v => ({ ...v, [col]: !v[col] }));
  const closeAll     = () => { setPdfOpen(false); setColOpen(false); };

  return (
    <div className="sa-page" onClick={closeAll}>

      {/* ── Header — title LEFT, Add button RIGHT, always visible ── */}
      <div className="sa-header">
        <div>
          <div className="sa-title">Stock Adjustments</div>
          <div className="sa-breadcrumb">Home / <span>Stock Adjustment</span> / List</div>
        </div>
        <Link to="/stock-adjustments/create" className="sa-btn-add">
          <IconPlus /> Add
        </Link>
      </div>

      <div className="sa-card">
        <div className="sa-card-header">
          <div className="sa-card-title">All stock adjustments</div>
        </div>

        {/* Toolbar */}
        <div className="sa-toolbar">
          <div className="sa-toolbar-left">
            <span className="sa-show-label">Show</span>
            <select className="sa-show-select" value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}>
              {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
            </select>
            <span className="sa-show-label">entries</span>
          </div>

          <div className="sa-export-group" onClick={e => e.stopPropagation()}>
            <button className="sa-export-btn" onClick={() => { exportCSV(filtered, visibleCols); showToast("✅ CSV downloaded"); }}>
              <IconCSV /> Export CSV
            </button>
            <button className="sa-export-btn" onClick={() => { exportExcel(filtered, visibleCols); showToast("✅ Excel downloaded"); }}>
              <IconExcel /> Export Excel
            </button>
            <button className="sa-export-btn" onClick={() => { showToast("🖨 Printing…"); setTimeout(() => window.print(), 300); }}>
              <IconPrint /> Print
            </button>
            <div className="sa-dropdown">
              <button className="sa-export-btn" onClick={e => { e.stopPropagation(); setColOpen(o => !o); setPdfOpen(false); }}>
                <IconColumns /> Column visibility
              </button>
              {colOpen && (
                <div className="sa-col-panel" onClick={e => e.stopPropagation()}>
                  {ALL_COLUMNS.map(col => (
                    <label key={col} className="sa-col-item">
                      <input type="checkbox" checked={!!visibleCols[col]} onChange={() => toggleCol(col)} />
                      {col}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="sa-dropdown">
              <button className="sa-export-btn" onClick={e => { e.stopPropagation(); setPdfOpen(o => !o); setColOpen(false); }}>
                <IconPDF /> Export PDF ▾
              </button>
              {pdfOpen && (
                <div className="sa-dropdown-menu" onClick={e => e.stopPropagation()}>
                  {["Current Page", "All Pages", "Selected Rows"].map(opt => (
                    <div key={opt} className="sa-dropdown-item"
                      onClick={() => {
                        const exportRows = opt === "Current Page" ? paginated : filtered;
                        exportPDF(exportRows, visibleCols, opt);
                        showToast(`✅ PDF — ${opt}`);
                        setPdfOpen(false);
                      }}>
                      <IconPDF /> {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sa-toolbar-right">
            <div className="sa-search-wrap">
              <IconSearch />
              <input className="sa-search-input" placeholder="Search..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Action <IconSort /></th>
                {ALL_COLUMNS.filter(c => visibleCols[c]).map(h => <th key={h}>{h} <IconSort /></th>)}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={ALL_COLUMNS.length + 1}>
                  <div className="sa-empty"><div className="sa-empty-icon">📦</div>No data available in table</div>
                </td></tr>
              ) : paginated.map(row => (
                <tr key={row.id}>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button style={actionBtn} title="View"   onClick={() => showToast("👁 Viewing " + row.ref)}>👁</button>
                      <button style={actionBtn} title="Edit"   onClick={() => showToast("✏️ Editing " + row.ref)}>✏️</button>
                      <button style={actionBtn} title="Delete" onClick={() => handleDelete(row.id)}>🗑</button>
                    </div>
                  </td>
                  {visibleCols["Date"]                   && <td>{row.date}</td>}
                  {visibleCols["Reference No"]           && <td style={{ fontWeight: 600, color: "var(--green-700)" }}>{row.ref}</td>}
                  {visibleCols["Location"]               && <td>{row.location}</td>}
                  {visibleCols["Adjustment Type"]        && <td><span className={`sa-badge sa-badge--${row.type === "Normal" ? "normal" : "abnormal"}`}>{row.type}</span></td>}
                  {visibleCols["Total Amount"]           && <td style={{ fontWeight: 600 }}>{row.total}</td>}
                  {visibleCols["Total Amount Recovered"] && <td>{row.recovered}</td>}
                  {visibleCols["Reason"]                 && <td>{row.reason}</td>}
                  {visibleCols["Added By"]               && <td>{row.addedBy}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sa-footer">
          <span>
            {filtered.length === 0
              ? "Showing 0 to 0 of 0 entries"
              : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} entries`}
          </span>
          <div className="sa-pagination">
            <button className="sa-page-btn" disabled={page <= 1}        onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="sa-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {toast && <div className="sa-toast">{toast}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════
   ADD STOCK ADJUSTMENT
═══════════════════════════════════════ */
export function AddStockAdjustment() {
  ensureStyles();
  const navigate = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [recovered, setRecovered] = useState("0");
  const [reason,    setReason]    = useState("");
  const [toast,     setToast]     = useState(null);
  const [form,      setForm]      = useState({
    location: "", refNo: "",
    date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", ""),
    adjType: ""
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleProductSearch = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    setProducts(p => [...p, { id: Date.now(), name: searchVal, qty: 1, unitPrice: 0, subtotal: 0 }]);
    setSearchVal("");
  };

  const updateQty     = (id, val) => setProducts(p => p.map(r => r.id === id ? { ...r, qty: +val, subtotal: +(+val * r.unitPrice).toFixed(2) } : r));
  const updatePrice   = (id, val) => setProducts(p => p.map(r => r.id === id ? { ...r, unitPrice: +val, subtotal: +(r.qty * +val).toFixed(2) } : r));
  const removeProduct = (id)      => setProducts(p => p.filter(r => r.id !== id));

  const totalAmount = products.reduce((s, r) => s + r.subtotal, 0).toFixed(2);

  const handleSave = () => {
    if (!form.location || !form.adjType) { showToast("⚠️ Please fill all required fields"); return; }
    showToast("✅ Stock Adjustment saved successfully!");
    setTimeout(() => navigate("/stock-adjustments"), 1500);
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
        <div className="sa-form-grid">
          <div className="sa-field">
            <label className="sa-label">Business Location <span className="req">*</span></label>
            <select className="sa-select" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              <option value="">Please Select</option>
              <option>Main Store</option><option>Warehouse A</option><option>Warehouse B</option>
            </select>
          </div>
          <div className="sa-field">
            <label className="sa-label">Reference No</label>
            <input className="sa-input" placeholder="Auto-generated" value={form.refNo} onChange={e => setForm(f => ({ ...f, refNo: e.target.value }))} />
          </div>
          <div className="sa-field">
            <label className="sa-label">Date <span className="req">*</span></label>
            <input className="sa-input" type="text" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="sa-field">
            <label className="sa-label">Adjustment type <span className="req">*</span> <IconInfo /></label>
            <select className="sa-select" value={form.adjType} onChange={e => setForm(f => ({ ...f, adjType: e.target.value }))}>
              <option value="">Please Select</option>
              <option>Normal</option><option>Abnormal</option>
            </select>
          </div>
        </div>

        <div className="sa-product-section">
          <form className="sa-product-search-wrap" onSubmit={handleProductSearch}>
            <button type="submit" className="sa-product-search-btn">
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#fff" strokeWidth="1.5"/>
                <path d="M10 10l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <input className="sa-product-search-input" placeholder="Search products for stock adjustment"
              value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          </form>

          <table className="sa-product-table">
            <thead>
              <tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Subtotal</th><th>🗑</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "28px", color: "var(--text-light)", fontSize: ".85rem" }}>
                  No products added. Search above to add products.
                </td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><input type="number" className="sa-input" style={{ width: 90 }} value={p.qty} min={1} onChange={e => updateQty(p.id, e.target.value)} /></td>
                  <td><input type="number" className="sa-input" style={{ width: 110 }} value={p.unitPrice} min={0} onChange={e => updatePrice(p.id, e.target.value)} /></td>
                  <td style={{ fontWeight: 600 }}>₹{p.subtotal.toFixed(2)}</td>
                  <td><button className="sa-del-btn" onClick={() => removeProduct(p.id)}><IconTrash /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "right" }}>Total Amount:</td>
                <td>₹{totalAmount}</td><td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="sa-bottom-grid">
          <div className="sa-field">
            <label className="sa-label">Total amount recovered <IconInfo /></label>
            <input className="sa-input" type="number" value={recovered} onChange={e => setRecovered(e.target.value)} />
          </div>
          <div className="sa-field">
            <label className="sa-label">Reason</label>
            <textarea className="sa-textarea" placeholder="Enter reason for adjustment…" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>

        <div className="sa-save-section">
          <button className="sa-btn-save" onClick={handleSave}>
            <IconSave /> Save
          </button>
        </div>
      </div>

      {toast && <div className="sa-toast">{toast}</div>}
    </div>
  );
}

export default ListStockAdjustments;
/**
 * src/pages/StockAdjustments.jsx — FINAL
 *
 * Changes:
 *  1. Action buttons → icons only (no text), compact pill style
 *  2. Action column moved to LAST (after Added By)
 *  3. Edit button → opens full edit modal (not "coming soon")
 *  4. Page fits viewport — no unnecessary scroll
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchStockAdjustments,
  fetchStockAdjustmentById,
  deleteStockAdjustment,
  approveStockAdjustment,
  updateStockAdjustment,
  fetchAdjustmentStats,
  createStockAdjustment,
  searchProducts,
  fetchLocations,
} from "../api/stockAdjustmentAPI";

/* ══════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  :root {
    --g900:#1a2e1f; --g800:#1e3a25; --g700:#2d5a3d; --g600:#3a7a52;
    --g500:#4a9a68; --g400:#5db87e; --g100:#e8f5ee; --g50:#f2faf5;
    --accent:#3b82f6; --danger:#ef4444; --warning:#f59e0b;
    --td:#0f1f14; --tm:#374840; --tl:#6b7f72;
    --border:#d1e5d9; --surf:#ffffff; --bg:#f0f6f2;
    --rsm:6px; --r:10px; --rlg:16px;
    --sh-sm:0 1px 3px rgba(0,0,0,.07);
    --sh:0 4px 16px rgba(0,0,0,.09);
    --sh-lg:0 8px 32px rgba(0,0,0,.13);
  }

  .sa-page {
    font-family:'DM Sans',sans-serif; color:var(--td); background:var(--bg);
    min-height:100vh; box-sizing:border-box;
  }

  /* ── Header ── */
  .sa-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; gap:16px; }
  .sa-title  { font-family:'Sora',sans-serif; font-size:1.65rem; font-weight:700; color:var(--g900); letter-spacing:-.5px; }
  .sa-breadcrumb { font-size:.76rem; color:var(--tl); margin-top:2px; }
  .sa-breadcrumb span { color:var(--g600); font-weight:500; }
  .sa-back-link { display:inline-flex; align-items:center; gap:6px; font-size:.82rem; font-weight:500; color:var(--g600); text-decoration:none; margin-bottom:6px; }
  .sa-back-link:hover { color:var(--g900); }

  .sa-btn-add {
    display:inline-flex; align-items:center; gap:8px; flex-shrink:0;
    background:linear-gradient(135deg,#22c55e,#16a34a);
    color:#fff; border:none; border-radius:50px; padding:10px 24px;
    font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:700; cursor:pointer;
    box-shadow:0 3px 10px rgba(34,197,94,.35); transition:transform .15s,box-shadow .15s;
    text-decoration:none; white-space:nowrap; margin-top:4px;
  }
  .sa-btn-add:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(34,197,94,.45); }

  /* ── Stats ── */
  .sa-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
  @media(max-width:900px){ .sa-stats-grid{grid-template-columns:1fr 1fr;} }
  .sa-stat-card { background:var(--surf); border-radius:var(--rlg); border:1px solid var(--border); box-shadow:var(--sh-sm); padding:16px 20px; display:flex; flex-direction:column; gap:4px; position:relative; overflow:hidden; }
  .sa-stat-card::before { content:''; position:absolute; top:0; left:0; width:4px; height:100%; }
  .sa-stat-card.green::before { background:var(--g500); }
  .sa-stat-card.blue::before  { background:var(--accent); }
  .sa-stat-card.amber::before { background:var(--warning); }
  .sa-stat-card.red::before   { background:var(--danger); }
  .sa-stat-label { font-size:.72rem; font-weight:600; color:var(--tl); text-transform:uppercase; letter-spacing:.5px; }
  .sa-stat-value { font-family:'Sora',sans-serif; font-size:1.5rem; font-weight:700; color:var(--g900); }
  .sa-stat-sub   { font-size:.72rem; color:var(--tl); }

  /* ── Card ── */
  .sa-card { background:var(--surf); border-radius:var(--rlg); box-shadow:var(--sh); border:1px solid var(--border); overflow:hidden; }
  .sa-card-header { padding:16px 22px 0; }
  .sa-card-title  { font-family:'Sora',sans-serif; font-size:.95rem; font-weight:600; color:var(--g900); }

  /* ── Toolbar ── */
  .sa-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:12px 22px; border-bottom:1px solid var(--border); }
  .sa-toolbar-left  { display:flex; align-items:center; gap:8px; }
  .sa-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .sa-show-label    { font-size:.8rem; color:var(--tl); }
  .sa-show-select   { border:1px solid var(--border); border-radius:var(--rsm); padding:4px 8px; font-family:'DM Sans',sans-serif; font-size:.8rem; color:var(--td); background:var(--bg); outline:none; cursor:pointer; }
  .sa-filter-select { border:1.5px solid var(--border); border-radius:var(--rsm); padding:5px 10px; font-family:'DM Sans',sans-serif; font-size:.8rem; color:var(--td); background:var(--bg); outline:none; min-width:120px; }
  .sa-export-btn {
    display:inline-flex; align-items:center; gap:5px;
    border:1.5px solid var(--border); border-radius:var(--rsm); padding:5px 12px;
    background:var(--surf); font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500; color:var(--tm); cursor:pointer; transition:all .15s; white-space:nowrap;
  }
  .sa-export-btn:hover { background:var(--g100); border-color:var(--g400); color:var(--g800); }
  .sa-search-wrap { position:relative; }
  .sa-search-ico  { position:absolute; left:9px; top:50%; transform:translateY(-50%); color:var(--tl); pointer-events:none; }
  .sa-search-input { border:1.5px solid var(--border); border-radius:var(--rsm); padding:5px 10px 5px 28px; font-family:'DM Sans',sans-serif; font-size:.8rem; color:var(--td); background:var(--bg); outline:none; width:190px; }
  .sa-search-input:focus { border-color:var(--g500); background:#fff; }

  /* ── Table — no horizontal scroll, last col for actions ── */
  .sa-table-wrap { overflow-x:auto; }
  table.sa-table { width:100%; border-collapse:collapse; font-size:.83rem; table-layout:auto; }
  .sa-table thead tr { background:linear-gradient(90deg,var(--g50),#f8fbfa); border-bottom:2px solid var(--border); }
  .sa-table th { padding:10px 14px; text-align:left; font-family:'Sora',sans-serif; font-size:.72rem; font-weight:600; color:var(--g700); text-transform:uppercase; letter-spacing:.5px; white-space:nowrap; }
  .sa-table td { padding:10px 14px; border-bottom:1px solid var(--border); color:var(--tm); vertical-align:middle; }
  .sa-table tbody tr:hover { background:var(--g50); }
  .sa-table tbody tr:last-child td { border-bottom:none; }
  .sa-empty { text-align:center; padding:48px 0; color:var(--tl); font-size:.88rem; }
  .sa-empty-icon { font-size:2rem; margin-bottom:8px; opacity:.5; }

  /* ── Icon-only action buttons ── */
  .sa-icon-btn {
    display:inline-flex; align-items:center; justify-content:center;
    width:30px; height:30px; border:none; border-radius:7px;
    cursor:pointer; transition:background .12s, transform .1s;
    background:transparent;
  }
  .sa-icon-btn:hover { transform:translateY(-1px); }
  .sa-icon-btn.view   { color:#1d4ed8; }
  .sa-icon-btn.view:hover   { background:#dbeafe; }
  .sa-icon-btn.edit   { color:#c2410c; }
  .sa-icon-btn.edit:hover   { background:#ffedd5; }
  .sa-icon-btn.delete { color:#dc2626; }
  .sa-icon-btn.delete:hover { background:#fee2e2; }
  .sa-icon-group { display:flex; gap:3px; align-items:center; }

  /* ── Footer / Pagination ── */
  .sa-footer { display:flex; align-items:center; justify-content:space-between; padding:12px 22px; border-top:1px solid var(--border); font-size:.8rem; color:var(--tl); flex-wrap:wrap; gap:8px; }
  .sa-pagination { display:flex; gap:5px; align-items:center; }
  .sa-page-btn { border:1.5px solid var(--border); border-radius:var(--rsm); background:var(--surf); padding:4px 12px; font-family:'DM Sans',sans-serif; font-size:.8rem; font-weight:500; color:var(--tm); cursor:pointer; transition:all .15s; }
  .sa-page-btn:hover:not(:disabled) { background:var(--g100); border-color:var(--g400); color:var(--g800); }
  .sa-page-btn.active { background:var(--g600); color:#fff; border-color:var(--g600); }
  .sa-page-btn:disabled { opacity:.4; cursor:default; }

  /* ── Badges ── */
  .sa-badge { display:inline-block; padding:2px 9px; border-radius:20px; font-size:.7rem; font-weight:700; white-space:nowrap; }
  .sa-badge--draft     { background:#f1f5f9; color:#475569; }
  .sa-badge--pending   { background:#fef3c7; color:#92400e; }
  .sa-badge--completed { background:#dcfce7; color:#166534; }
  .sa-badge--cancelled { background:#fee2e2; color:#991b1b; }
  .sa-badge--normal    { background:#e0f2fe; color:#0369a1; }
  .sa-badge--abnormal  { background:#fce7f3; color:#9d174d; }

  /* ── Skeleton ── */
  .sa-skeleton { background:linear-gradient(90deg,var(--border) 25%,var(--g50) 50%,var(--border) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:4px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── Toast ── */
  .sa-toast { position:fixed; bottom:22px; right:22px; padding:12px 20px; border-radius:var(--r); font-size:.86rem; font-weight:500; box-shadow:var(--sh-lg); z-index:9999; animation:slideUp .22s ease; max-width:340px; }
  .sa-toast.success { background:var(--g800); color:#fff; }
  .sa-toast.error   { background:#991b1b; color:#fff; }
  @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  /* ── Overlay ── */
  .sa-overlay { position:fixed; inset:0; background:rgba(0,0,0,.48); z-index:8000; display:flex; align-items:center; justify-content:center; padding:16px; }

  /* ── Confirm Dialog ── */
  .sa-dialog { background:var(--surf); border-radius:var(--rlg); padding:28px; max-width:400px; width:90%; box-shadow:var(--sh-lg); text-align:center; }
  .sa-dialog-icon  { font-size:2.2rem; margin-bottom:10px; }
  .sa-dialog-title { font-family:'Sora',sans-serif; font-size:1.05rem; font-weight:700; color:var(--td); margin-bottom:6px; }
  .sa-dialog-msg   { font-size:.85rem; color:var(--tl); line-height:1.5; margin-bottom:20px; }
  .sa-dialog-btns  { display:flex; gap:10px; justify-content:center; }
  .sa-dialog-cancel  { border:1.5px solid var(--border); border-radius:var(--r); background:var(--surf); padding:8px 22px; font-family:'DM Sans',sans-serif; font-size:.86rem; font-weight:500; color:var(--tm); cursor:pointer; }
  .sa-dialog-cancel:hover { background:var(--g50); }
  .sa-dialog-confirm { border:none; border-radius:var(--r); background:var(--danger); padding:8px 22px; font-family:'DM Sans',sans-serif; font-size:.86rem; font-weight:600; color:#fff; cursor:pointer; }
  .sa-dialog-confirm.green { background:var(--g600); }
  .sa-dialog-confirm:hover { opacity:.88; }

  /* ── Modal base ── */
  .sa-modal { background:var(--surf); border-radius:var(--rlg); box-shadow:var(--sh-lg); width:100%; max-width:800px; max-height:88vh; overflow-y:auto; animation:modalIn .18s ease; }
  @keyframes modalIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .sa-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px; border-bottom:1px solid var(--border);
    background:linear-gradient(135deg,var(--g800),var(--g700));
    border-radius:var(--rlg) var(--rlg) 0 0; position:sticky; top:0; z-index:10;
  }
  .sa-modal-title { font-family:'Sora',sans-serif; font-size:1rem; font-weight:700; color:#fff; }
  .sa-modal-close { background:rgba(255,255,255,.15); border:none; border-radius:7px; color:#fff; font-size:1.1rem; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .sa-modal-close:hover { background:rgba(255,255,255,.28); }
  .sa-modal-body { padding:22px; }

  /* ── Form helpers shared by Add + Edit ── */
  .sa-form-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:18px; }
  @media(max-width:900px){ .sa-form-grid{grid-template-columns:1fr 1fr;} }
  @media(max-width:560px){ .sa-form-grid{grid-template-columns:1fr;} }
  .sa-field { display:flex; flex-direction:column; gap:5px; }
  .sa-label { font-size:.74rem; font-weight:600; color:var(--tm); text-transform:uppercase; letter-spacing:.5px; }
  .sa-req   { color:var(--danger); }
  .sa-input,.sa-select {
    border:1.5px solid var(--border); border-radius:var(--rsm); padding:8px 11px;
    font-family:'DM Sans',sans-serif; font-size:.86rem; color:var(--td); background:var(--bg);
    outline:none; width:100%; box-sizing:border-box; transition:border-color .15s;
  }
  .sa-input:focus,.sa-select:focus { border-color:var(--g500); background:#fff; box-shadow:0 0 0 3px rgba(74,154,104,.1); }
  .sa-textarea { border:1.5px solid var(--border); border-radius:var(--rsm); padding:9px 11px; font-family:'DM Sans',sans-serif; font-size:.86rem; color:var(--td); background:var(--bg); outline:none; resize:vertical; min-height:80px; width:100%; box-sizing:border-box; }
  .sa-textarea:focus { border-color:var(--g500); background:#fff; }

  /* ── Combo (typable location) ── */
  .sa-combo-wrap { position:relative; }
  .sa-combo-input { border:1.5px solid var(--border); border-radius:var(--rsm); padding:8px 28px 8px 11px; font-family:'DM Sans',sans-serif; font-size:.86rem; color:var(--td); background:var(--bg); outline:none; width:100%; box-sizing:border-box; }
  .sa-combo-input:focus { border-color:var(--g500); background:#fff; box-shadow:0 0 0 3px rgba(74,154,104,.1); }
  .sa-combo-arrow { position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--tl); font-size:.65rem; }
  .sa-combo-dropdown { position:absolute; top:calc(100%+3px); left:0; right:0; background:var(--surf); border:1px solid var(--border); border-radius:var(--r); box-shadow:var(--sh-lg); z-index:300; max-height:180px; overflow-y:auto; animation:fadeDown .12s ease; }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
  .sa-combo-opt { padding:8px 13px; font-size:.84rem; color:var(--td); cursor:pointer; }
  .sa-combo-opt:hover { background:var(--g50); }
  .sa-combo-opt.dim { color:var(--tl); font-style:italic; cursor:default; }

  /* ── Product picker ── */
  .sa-prod-search-wrap { position:relative; max-width:520px; margin-bottom:18px; }
  .sa-prod-search-input { width:100%; border:1.5px solid var(--border); border-radius:var(--r); padding:9px 13px 9px 37px; font-family:'DM Sans',sans-serif; font-size:.86rem; color:var(--td); background:var(--bg); outline:none; box-sizing:border-box; }
  .sa-prod-search-input:focus { border-color:var(--g500); background:#fff; }
  .sa-prod-search-ico { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--tl); pointer-events:none; }
  .sa-prod-dropdown { position:absolute; top:calc(100%+4px); left:0; right:0; background:var(--surf); border:1px solid var(--border); border-radius:var(--r); box-shadow:var(--sh-lg); z-index:200; max-height:240px; overflow-y:auto; animation:fadeDown .12s ease; }
  .sa-prod-opt { display:flex; align-items:center; justify-content:space-between; padding:9px 13px; cursor:pointer; border-bottom:1px solid var(--border); }
  .sa-prod-opt:last-child { border-bottom:none; }
  .sa-prod-opt:hover { background:var(--g50); }
  .sa-prod-opt-name { font-weight:500; font-size:.84rem; color:var(--td); }
  .sa-prod-opt-meta { font-size:.74rem; color:var(--tl); margin-top:1px; }
  .sa-prod-opt-stock { font-size:.76rem; font-weight:600; color:var(--g600); }
  .sa-no-res { padding:16px; text-align:center; color:var(--tl); font-size:.82rem; }

  table.sa-items-table { width:100%; border-collapse:collapse; font-size:.83rem; }
  .sa-items-table thead tr { background:var(--g50); border-bottom:2px solid var(--border); }
  .sa-items-table th { padding:9px 12px; font-family:'Sora',sans-serif; font-size:.7rem; font-weight:600; color:var(--g700); text-transform:uppercase; letter-spacing:.5px; text-align:left; }
  .sa-items-table td { padding:9px 12px; border-bottom:1px solid var(--border); color:var(--tm); vertical-align:middle; }
  .sa-items-table tfoot td { padding:10px 12px; border-top:2px solid var(--border); font-weight:700; color:var(--g900); }
  .sa-qty-inp { border:1.5px solid var(--border); border-radius:var(--rsm); padding:6px 8px; font-family:'DM Sans',sans-serif; font-size:.83rem; color:var(--td); background:var(--bg); outline:none; width:84px; text-align:center; box-sizing:border-box; }
  .sa-qty-inp:focus { border-color:var(--g500); background:#fff; }
  .sa-del-btn { border:none; background:none; color:var(--danger); cursor:pointer; padding:4px; border-radius:4px; display:inline-flex; align-items:center; }
  .sa-del-btn:hover { background:#fee2e2; }

  /* ── Save row ── */
  .sa-save-row { display:flex; justify-content:flex-end; gap:12px; padding:18px 22px; flex-wrap:wrap; border-top:1px solid var(--border); }
  .sa-save-btn {
    display:inline-flex; align-items:center; gap:8px;
    border:none; border-radius:var(--r); padding:10px 28px;
    font-family:'Sora',sans-serif; font-size:.9rem; font-weight:600; cursor:pointer;
    transition:transform .15s, opacity .15s;
  }
  .sa-save-btn:hover:not(:disabled) { transform:translateY(-1px); opacity:.9; }
  .sa-save-btn:disabled { opacity:.5; cursor:not-allowed; }
  .sa-save-btn.draft    { background:var(--g100); color:var(--g800); border:1.5px solid var(--border); }
  .sa-save-btn.pending  { background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; box-shadow:0 3px 12px rgba(245,158,11,.35); }
  .sa-save-btn.complete { background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff; box-shadow:0 3px 12px rgba(34,197,94,.4); }

  /* ── View modal detail ── */
  .sa-vm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
  @media(max-width:560px){ .sa-vm-grid{grid-template-columns:1fr;} }
  .sa-vm-f { display:flex; flex-direction:column; gap:3px; }
  .sa-vm-lbl { font-size:.7rem; font-weight:600; color:var(--tl); text-transform:uppercase; letter-spacing:.5px; }
  .sa-vm-val { font-size:.88rem; color:var(--td); font-weight:500; }
  hr.sa-vm-hr { border:none; border-top:1px solid var(--border); margin:14px 0; }
  .sa-vm-sec { font-family:'Sora',sans-serif; font-size:.82rem; font-weight:600; color:var(--g700); margin-bottom:10px; }
  .sa-vm-reason { background:var(--g50); border-radius:var(--r); padding:10px 14px; font-size:.84rem; color:var(--tm); line-height:1.5; margin-top:14px; }

  /* ── Add page layout ── */
  .sa-form-section { padding:20px 22px; border-bottom:1px solid var(--border); }

  @media print {
    .sa-header .sa-btn-add,.sa-toolbar,.sa-footer,.sa-back-link,.sa-stats-grid { display:none !important; }
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

/* ══ ICONS ══ */
const IcoPlus   = () => <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="1.5"/><path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoSearch = () => <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IcoBack   = () => <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoSave   = () => <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4 17h12a1 1 0 001-1V6.5L13.5 3H4a1 1 0 00-1 1v12a1 1 0 001 1z" stroke="#fff" strokeWidth="1.5"/><rect x="6" y="11" width="8" height="5" rx=".5" stroke="#fff" strokeWidth="1.3"/><rect x="7" y="3" width="4" height="3.5" rx=".3" stroke="#fff" strokeWidth="1.2"/></svg>;
const IcoTrash  = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><path d="M2 4h12M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 9h5l.5-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoEye    = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><ellipse cx="8" cy="8" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>;
const IcoEdit   = () => <svg viewBox="0 0 16 16" fill="none" width="15" height="15"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoCSV    = () => <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><rect width="16" height="16" rx="2" fill="#16a34a"/><text x="2" y="12" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">CSV</text></svg>;
const IcoPrint  = () => <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><rect x="2" y="5" width="12" height="8" rx="1.5" fill="none" stroke="#1d4ed8" strokeWidth="1.3"/><rect x="4" y="9" width="8" height="3.5" rx=".8" fill="#1d4ed8"/><path d="M4 5V2.5a.5.5 0 01.5-.5h7a.5.5 0 01.5.5V5" stroke="#1d4ed8" strokeWidth="1.3"/><circle cx="12" cy="7.5" r=".8" fill="#1d4ed8"/></svg>;

/* ══ HELPERS ══ */
const fmt$ = (v) => `₹${(parseFloat(v)||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtD = (d) => { if(!d) return '—'; return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); };

const StatusBadge = ({status}) => {
  const c = {Draft:'draft',Pending:'pending',Completed:'completed',Cancelled:'cancelled'}[status]||'draft';
  return <span className={`sa-badge sa-badge--${c}`}>{status}</span>;
};
const TypeBadge = ({type}) => <span className={`sa-badge sa-badge--${type==='Normal'?'normal':'abnormal'}`}>{type}</span>;

function useToast() {
  const [t,setT] = useState(null);
  const show = useCallback((msg,type='success') => { setT({msg,type}); setTimeout(()=>setT(null),2800); },[]);
  return [t,show];
}

function dlCSV(rows) {
  const h = ['Reference No','Date','Location','Type','Status','Total','Recovered','Reason','Added By'];
  const lines = [h.join(','), ...rows.map(r=>[
    r.reference_no,fmtD(r.adjustment_date),r.location,r.adjustment_type,
    r.status,r.total_amount,r.total_amount_recovered,
    `"${(r.reason||'').replace(/"/g,'""')}"`,r.added_by||''
  ].join(','))];
  const url = URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv'}));
  const a = Object.assign(document.createElement('a'),{href:url,download:'stock-adjustments.csv'});
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ══ STAT CARD ══ */
const StatCard = ({label,value,sub,color}) => (
  <div className={`sa-stat-card ${color}`}>
    <div className="sa-stat-label">{label}</div>
    <div className="sa-stat-value">{value}</div>
    {sub && <div className="sa-stat-sub">{sub}</div>}
  </div>
);

/* ══ LOCATION COMBOBOX ══ */
function LocationCombo({value, onChange, locations}) {
  const [q,setQ]     = useState(value||'');
  const [open,setOpen] = useState(false);
  const wRef = useRef(null);

  useEffect(()=>{ setQ(value||''); },[value]);
  useEffect(()=>{
    const h=(e)=>{ if(wRef.current&&!wRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[]);

  const filtered = locations.filter(l=>l.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="sa-combo-wrap" ref={wRef}>
      <input className="sa-combo-input" value={q} autoComplete="off"
        placeholder="Type or select location"
        onChange={e=>{ setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={()=>setOpen(true)} />
      <span className="sa-combo-arrow">▾</span>
      {open && (
        <div className="sa-combo-dropdown">
          {filtered.length===0
            ? <div className="sa-combo-opt dim">{q?`Use "${q}"`:'No saved locations'}</div>
            : filtered.map(l=>(
                <div key={l} className="sa-combo-opt" onMouseDown={()=>{ setQ(l); onChange(l); setOpen(false); }}>{l}</div>
              ))
          }
        </div>
      )}
    </div>
  );
}

/* ══ PRODUCT PICKER (shared by Add + Edit) ══ */
function ProductPicker({items, setItems, allProds, showToast}) {
  const [q,setQ]       = useState('');
  const [list,setList] = useState(allProds);
  const [open,setOpen] = useState(false);
  const [busy,setBusy] = useState(false);
  const sRef = useRef(null);
  const dRef = useRef(null);
  const tRef = useRef(null);

  useEffect(()=>{ setList(allProds); },[allProds]);

  useEffect(()=>{
    const h=(e)=>{ if(dRef.current&&!dRef.current.contains(e.target)&&sRef.current&&!sRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[]);

  const search = (val) => {
    setQ(val); setOpen(true);
    clearTimeout(tRef.current);
    if(!val.trim()){ setList(allProds); return; }
    setBusy(true);
    tRef.current = setTimeout(async()=>{
      try { const d=await searchProducts(val); setList(d.products||[]); }
      catch(_){ setList(allProds.filter(p=>p.product_name.toLowerCase().includes(val.toLowerCase())||(p.sku||'').toLowerCase().includes(val.toLowerCase()))); }
      finally { setBusy(false); }
    },250);
  };

  const add = (p) => {
    if(items.find(it=>it.product_id===p.id)){ showToast(`${p.product_name} already added`,'error'); setOpen(false); setQ(''); return; }
    setItems(prev=>[...prev,{_key:Date.now(),product_id:p.id,product_name:p.product_name,sku:p.sku,current_stock:p.current_stock,quantity:1,unit_cost:parseFloat(p.unit_cost)||0,subtotal:parseFloat(p.unit_cost)||0}]);
    setOpen(false); setQ('');
  };

  const upd = (key,field,val) => setItems(prev=>prev.map(it=>{ if(it._key!==key) return it; const u={...it,[field]:val}; u.subtotal=+(parseFloat(u.quantity||0)*parseFloat(u.unit_cost||0)).toFixed(2); return u; }));
  const del = (key) => setItems(prev=>prev.filter(it=>it._key!==key));
  const total = items.reduce((s,it)=>s+(it.subtotal||0),0);

  return (
    <>
      <div className="sa-prod-search-wrap" ref={dRef}>
        <span className="sa-prod-search-ico"><IcoSearch /></span>
        <input ref={sRef} className="sa-prod-search-input" value={q} autoComplete="off"
          placeholder={`Click to browse ${allProds.length} products…`}
          onChange={e=>search(e.target.value)}
          onFocus={()=>{ setList(allProds); setOpen(true); }} />
        {open && (
          <div className="sa-prod-dropdown">
            {busy ? <div className="sa-no-res">Searching…</div>
              : list.length===0 ? <div className="sa-no-res">No products found</div>
              : list.map(p=>(
                  <div key={p.id} className="sa-prod-opt" onMouseDown={()=>add(p)}>
                    <div>
                      <div className="sa-prod-opt-name">{p.product_name}</div>
                      <div className="sa-prod-opt-meta">SKU: {p.sku||'—'} · Cost: {fmt$(p.unit_cost)}</div>
                    </div>
                    <div className="sa-prod-opt-stock">Stock: {p.current_stock??0}</div>
                  </div>
                ))
            }
          </div>
        )}
      </div>

      <table className="sa-items-table">
        <thead>
          <tr><th>Product</th><th>SKU</th><th>Stock</th><th>Adj.Qty</th><th>Unit Cost ₹</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          {items.length===0 ? (
            <tr><td colSpan={7} style={{textAlign:'center',padding:'28px',color:'var(--tl)',fontSize:'.83rem'}}>
              No products — click search above to add
            </td></tr>
          ) : items.map(item=>(
            <tr key={item._key}>
              <td style={{fontWeight:500}}>{item.product_name}</td>
              <td style={{color:'var(--tl)',fontSize:'.78rem'}}>{item.sku||'—'}</td>
              <td><span style={{background:'var(--g50)',borderRadius:5,padding:'2px 7px',fontSize:'.76rem',color:'var(--g700)',fontWeight:600}}>{item.current_stock??0}</span></td>
              <td><input type="number" className="sa-qty-inp" value={item.quantity} min="0.001" step="0.001" onChange={e=>upd(item._key,'quantity',e.target.value)}/></td>
              <td><input type="number" className="sa-qty-inp" style={{width:100}} value={item.unit_cost} min="0" step="0.01" onChange={e=>upd(item._key,'unit_cost',e.target.value)}/></td>
              <td style={{fontWeight:600}}>{fmt$(item.subtotal)}</td>
              <td><button className="sa-del-btn" onClick={()=>del(item._key)}><IcoTrash /></button></td>
            </tr>
          ))}
        </tbody>
        {items.length>0 && (
          <tfoot><tr>
            <td colSpan={5} style={{textAlign:'right'}}>Total:</td>
            <td>{fmt$(total)}</td><td></td>
          </tr></tfoot>
        )}
      </table>
    </>
  );
}

/* ══ VIEW MODAL ══ */
function ViewModal({id, onClose}) {
  const [adj,setAdj]   = useState(null);
  const [loading,setL] = useState(true);
  useEffect(()=>{
    if(!id) return;
    setL(true);
    fetchStockAdjustmentById(id).then(d=>{ setAdj(d.stockAdjustment); setL(false); }).catch(()=>setL(false));
  },[id]);
  return (
    <div className="sa-overlay" onClick={onClose}>
      <div className="sa-modal" onClick={e=>e.stopPropagation()}>
        <div className="sa-modal-head">
          <div className="sa-modal-title">{loading?'Loading…':adj?`${adj.reference_no} — Details`:'Not Found'}</div>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sa-modal-body">
          {loading && [1,2,3].map(i=><div key={i} className="sa-skeleton" style={{height:18,marginBottom:10}}/>)}
          {!loading && adj && (
            <>
              <div className="sa-vm-grid">
                {[
                  ['Reference No', <b style={{color:'var(--g700)'}}>{adj.reference_no}</b>],
                  ['Date',         fmtD(adj.adjustment_date)],
                  ['Location',     adj.location],
                  ['Type',         <TypeBadge type={adj.adjustment_type}/>],
                  ['Status',       <StatusBadge status={adj.status}/>],
                  ['Added By',     adj.added_by_name||'—'],
                  ['Total Amount', <b style={{color:'var(--g700)'}}>{fmt$(adj.total_amount)}</b>],
                  ['Recovered',    fmt$(adj.total_amount_recovered)],
                ].map(([l,v])=>(
                  <div key={l} className="sa-vm-f"><div className="sa-vm-lbl">{l}</div><div className="sa-vm-val">{v}</div></div>
                ))}
              </div>
              <hr className="sa-vm-hr"/>
              <div className="sa-vm-sec">📦 Products ({adj.items?.length||0} items)</div>
              {adj.items?.length>0 ? (
                <table className="sa-items-table">
                  <thead><tr><th>#</th><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Cost</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {adj.items.map((it,i)=>(
                      <tr key={it.id}>
                        <td style={{color:'var(--tl)'}}>{i+1}</td>
                        <td style={{fontWeight:500}}>{it.product_name||'—'}</td>
                        <td style={{color:'var(--tl)'}}>{it.sku||'—'}</td>
                        <td>{parseFloat(it.quantity).toFixed(3)}</td>
                        <td>{fmt$(it.unit_cost)}</td>
                        <td style={{fontWeight:600}}>{fmt$(it.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr><td colSpan={5} style={{textAlign:'right'}}>Total:</td><td>{fmt$(adj.total_amount)}</td></tr></tfoot>
                </table>
              ) : <p style={{color:'var(--tl)',fontSize:'.83rem'}}>No items found.</p>}
              {adj.reason && <div className="sa-vm-reason"><strong style={{fontSize:'.7rem',textTransform:'uppercase',color:'var(--tl)'}}>Reason</strong><p style={{margin:'5px 0 0'}}>{adj.reason}</p></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ EDIT MODAL ══ */
function EditModal({id, onClose, onSaved, showToast}) {
  const [form,setForm] = useState(null);
  const [items,setItems] = useState([]);
  const [allProds,setAllProds] = useState([]);
  const [locations,setLocations] = useState([]);
  const [saving,setSaving] = useState(false);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    if(!id) return;
    Promise.all([
      fetchStockAdjustmentById(id),
      searchProducts(''),
      fetchLocations(),
    ]).then(([adjD, prodsD, locsD])=>{
      const adj = adjD.stockAdjustment;
      setForm({
        location:               adj.location||'',
        reference_no:           adj.reference_no||'',
        adjustment_date:        adj.adjustment_date?.split('T')[0]||new Date().toISOString().split('T')[0],
        adjustment_type:        adj.adjustment_type||'Normal',
        status:                 adj.status||'Draft',
        total_amount_recovered: String(adj.total_amount_recovered||0),
        reason:                 adj.reason||'',
      });
      setItems((adj.items||[]).map(it=>({
        _key:         it.id,
        product_id:   it.product_id,
        product_name: it.product_name,
        sku:          it.sku,
        current_stock:it.current_stock,
        quantity:     parseFloat(it.quantity)||1,
        unit_cost:    parseFloat(it.unit_cost)||0,
        subtotal:     parseFloat(it.subtotal)||0,
      })));
      setAllProds(prodsD.products||[]);
      setLocations(locsD.locations||[]);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[id]);

  const save = async () => {
    if(!form.location)        { showToast('Location is required','error'); return; }
    if(!form.adjustment_type) { showToast('Type is required','error');     return; }
    if(items.length===0)      { showToast('Add at least one product','error'); return; }
    setSaving(true);
    try {
      await updateStockAdjustment(id,{
        ...form,
        total_amount_recovered: parseFloat(form.total_amount_recovered)||0,
        items: items.map(it=>({ product_id:it.product_id, quantity:parseFloat(it.quantity)||1, unit_cost:parseFloat(it.unit_cost)||0 })),
      });
      showToast('✅ Adjustment updated successfully','success');
      onSaved();
    } catch(err) {
      showToast(err.message||'Update failed','error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sa-overlay" onClick={onClose}>
      <div className="sa-modal" style={{maxWidth:860}} onClick={e=>e.stopPropagation()}>
        <div className="sa-modal-head">
          <div className="sa-modal-title">Edit Stock Adjustment</div>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sa-modal-body">
          {loading && [1,2,3,4].map(i=><div key={i} className="sa-skeleton" style={{height:20,marginBottom:12}}/>)}
          {!loading && form && (
            <>
              {/* Header fields */}
              <div className="sa-form-grid">
                <div className="sa-field">
                  <label className="sa-label">Location <span className="sa-req">*</span></label>
                  <LocationCombo value={form.location} onChange={v=>setForm(f=>({...f,location:v}))} locations={locations}/>
                </div>
                <div className="sa-field">
                  <label className="sa-label">Reference No</label>
                  <input className="sa-input" value={form.reference_no} readOnly style={{background:'var(--g50)',cursor:'not-allowed'}}/>
                </div>
                <div className="sa-field">
                  <label className="sa-label">Date <span className="sa-req">*</span></label>
                  <input className="sa-input" type="date" value={form.adjustment_date} onChange={e=>setForm(f=>({...f,adjustment_date:e.target.value}))}/>
                </div>
                <div className="sa-field">
                  <label className="sa-label">Type <span className="sa-req">*</span></label>
                  <select className="sa-select" value={form.adjustment_type} onChange={e=>setForm(f=>({...f,adjustment_type:e.target.value}))}>
                    <option>Normal</option><option>Abnormal</option>
                  </select>
                </div>
              </div>

              {/* Products */}
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:'Sora,sans-serif',fontSize:'.84rem',fontWeight:600,color:'var(--g700)',marginBottom:12}}>📦 Products</div>
                <ProductPicker items={items} setItems={setItems} allProds={allProds} showToast={showToast}/>
              </div>

              {/* Bottom */}
              <div className="sa-form-grid" style={{gridTemplateColumns:'1fr 3fr'}}>
                <div className="sa-field">
                  <label className="sa-label">Recovered (₹)</label>
                  <input className="sa-input" type="number" min="0" step="0.01" value={form.total_amount_recovered} onChange={e=>setForm(f=>({...f,total_amount_recovered:e.target.value}))}/>
                </div>
                <div className="sa-field">
                  <label className="sa-label">Reason / Notes</label>
                  <textarea className="sa-textarea" value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} placeholder="Reason for adjustment…"/>
                </div>
              </div>
            </>
          )}
        </div>
        {!loading && form && (
          <div className="sa-save-row">
            <button className="sa-save-btn draft" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="sa-save-btn complete" onClick={save} disabled={saving}>
              <IcoSave/>{saving?'Saving…':'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LIST STOCK ADJUSTMENTS
══════════════════════════════════════════════════════════ */
export function ListStockAdjustments() {
  ensureStyles();
  const [rows,setRows]           = useState([]);
  const [total,setTotal]         = useState(0);
  const [stats,setStats]         = useState(null);
  const [loading,setLoading]     = useState(true);
  const [page,setPage]           = useState(1);
  const [pageSize,setPageSize]   = useState(25);
  const [search,setSearch]       = useState('');
  const [filterType,setFType]    = useState('');
  const [filterStatus,setFStatus]= useState('');
  const [confirmDel,setDel]      = useState(null);
  const [viewId,setViewId]       = useState(null);
  const [editId,setEditId]       = useState(null);
  const [toast,showToast]        = useToast();

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const [a,s] = await Promise.all([
        fetchStockAdjustments({page,limit:pageSize,search,adjustment_type:filterType,status:filterStatus}),
        fetchAdjustmentStats(),
      ]);
      setRows(a.stockAdjustments); setTotal(a.total); setStats(s.stats);
    } catch(err){ showToast(err.message||'Failed to load','error'); }
    finally { setLoading(false); }
  },[page,pageSize,search,filterType,filterStatus]);

  useEffect(()=>{ load(); },[load]);

  const stRef = useRef(null);
  const handleSearch = (v)=>{ clearTimeout(stRef.current); stRef.current=setTimeout(()=>{ setSearch(v); setPage(1); },350); };

  const doDelete = async()=>{
    if(!confirmDel) return;
    try { await deleteStockAdjustment(confirmDel.id); showToast(`Deleted ${confirmDel.ref}`); setDel(null); load(); }
    catch(err){ showToast(err.message,'error'); setDel(null); }
  };

  const totalPages = Math.max(1,Math.ceil(total/pageSize));
  const pageNums = ()=>{
    let s=Math.max(1,page-2), e=Math.min(totalPages,s+4);
    if(e-s<4) s=Math.max(1,e-4);
    return Array.from({length:e-s+1},(_,i)=>s+i);
  };

  return (
    <div className="sa-page">
      <div className="sa-header">
        <div>
          <div className="sa-title">Stock Adjustments</div>
          <div className="sa-breadcrumb">Home / <span>Stock Adjustment</span> / List</div>
        </div>
        <Link to="/stock-adjustments/create" className="sa-btn-add"><IcoPlus/> Add Adjustment</Link>
      </div>

      {stats && (
        <div className="sa-stats-grid">
          <StatCard label="Total Adjustments" value={stats.total_adjustments} color="green" sub={`${stats.completed_count} completed`}/>
          <StatCard label="Total Value"        value={fmt$(stats.total_value)}     color="blue"  sub={`${stats.pending_count} pending`}/>
          <StatCard label="Recovered"          value={fmt$(stats.total_recovered)} color="amber" sub={`${stats.normal_count} normal`}/>
          <StatCard label="Net Loss"           value={fmt$(stats.net_loss)}        color="red"   sub={`${stats.abnormal_count} abnormal`}/>
        </div>
      )}

      <div className="sa-card">
        <div className="sa-card-header"><div className="sa-card-title">All Stock Adjustments</div></div>

        <div className="sa-toolbar">
          <div className="sa-toolbar-left">
            <span className="sa-show-label">Show</span>
            <select className="sa-show-select" value={pageSize} onChange={e=>{setPageSize(+e.target.value);setPage(1);}}>
              {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
            </select>
            <span className="sa-show-label">entries</span>
          </div>
          <div className="sa-toolbar-right">
            <select className="sa-filter-select" value={filterType} onChange={e=>{setFType(e.target.value);setPage(1);}}>
              <option value="">All Types</option><option>Normal</option><option>Abnormal</option>
            </select>
            <select className="sa-filter-select" value={filterStatus} onChange={e=>{setFStatus(e.target.value);setPage(1);}}>
              <option value="">All Status</option><option>Draft</option><option>Pending</option><option>Completed</option>
            </select>
            <button className="sa-export-btn" onClick={()=>{dlCSV(rows);showToast('CSV downloaded');}}><IcoCSV/> CSV</button>
            <button className="sa-export-btn" onClick={()=>window.print()}><IcoPrint/> Print</button>
            <div className="sa-search-wrap">
              <span className="sa-search-ico"><IcoSearch/></span>
              <input className="sa-search-input" placeholder="Search ref, location…" onChange={e=>handleSearch(e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Reference No</th>
                <th>Date</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Recovered</th>
                <th>Reason</th>
                <th>Added By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_,i)=>(
                  <tr key={i}>{Array.from({length:10}).map((_,j)=>(
                    <td key={j}><div className="sa-skeleton" style={{height:14,width:'75%'}}/></td>
                  ))}</tr>
                ))
              ) : rows.length===0 ? (
                <tr><td colSpan={10}>
                  <div className="sa-empty">
                    <div className="sa-empty-icon">📋</div>
                    No adjustments found. <Link to="/stock-adjustments/create" style={{color:'var(--g600)'}}>Add one now</Link>.
                  </div>
                </td></tr>
              ) : rows.map(row=>(
                <tr key={row.id}>
                  <td style={{fontWeight:600,color:'var(--g700)'}}>{row.reference_no}</td>
                  <td style={{whiteSpace:'nowrap'}}>{fmtD(row.adjustment_date)}</td>
                  <td>{row.location}</td>
                  <td><TypeBadge type={row.adjustment_type}/></td>
                  <td><StatusBadge status={row.status}/></td>
                  <td style={{fontWeight:600}}>{fmt$(row.total_amount)}</td>
                  <td>{fmt$(row.total_amount_recovered)}</td>
                  <td style={{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.reason||'—'}</td>
                  <td>{row.added_by||'—'}</td>
                  {/* ── Icon-only action buttons — LAST column ── */}
                  <td>
                    <div className="sa-icon-group">
                      <button className="sa-icon-btn view" title="View" onClick={()=>setViewId(row.id)}>
                        <IcoEye/>
                      </button>
                      <button className="sa-icon-btn edit" title="Edit" onClick={()=>setEditId(row.id)}>
                        <IcoEdit/>
                      </button>
                      <button className="sa-icon-btn delete" title="Delete" onClick={()=>setDel({id:row.id,ref:row.reference_no})}>
                        <IcoTrash/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sa-footer">
          <span>
            {total===0 ? 'Showing 0 entries'
              : `Showing ${(page-1)*pageSize+1}–${Math.min(page*pageSize,total)} of ${total} entries`}
          </span>
          <div className="sa-pagination">
            <button className="sa-page-btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
            {pageNums().map(p=>(
              <button key={p} className={`sa-page-btn${page===p?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
            ))}
            <button className="sa-page-btn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDel && (
        <div className="sa-overlay" onClick={()=>setDel(null)}>
          <div className="sa-dialog" onClick={e=>e.stopPropagation()}>
            <div className="sa-dialog-icon">🗑️</div>
            <div className="sa-dialog-title">Delete Adjustment?</div>
            <div className="sa-dialog-msg">Delete <strong>{confirmDel.ref}</strong>? If Completed, stock will be restored. Cannot be undone.</div>
            <div className="sa-dialog-btns">
              <button className="sa-dialog-cancel" onClick={()=>setDel(null)}>Cancel</button>
              <button className="sa-dialog-confirm" onClick={doDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {viewId && <ViewModal id={viewId} onClose={()=>setViewId(null)}/>}
      {editId && <EditModal id={editId} onClose={()=>setEditId(null)} onSaved={()=>{ setEditId(null); load(); }} showToast={showToast}/>}
      {toast && <div className={`sa-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADD STOCK ADJUSTMENT
══════════════════════════════════════════════════════════ */
export function AddStockAdjustment() {
  ensureStyles();
  const navigate = useNavigate();
  const [form,setForm] = useState({
    location:'', reference_no:'',
    adjustment_date: new Date().toISOString().split('T')[0],
    adjustment_type:'Normal', status:'Draft',
    total_amount_recovered:'0', reason:'',
  });
  const [items,setItems]     = useState([]);
  const [saving,setSaving]   = useState(false);
  const [allProds,setAllProds] = useState([]);
  const [locations,setLocs]  = useState([]);
  const [toast,showToast]    = useToast();

  useEffect(()=>{
    Promise.all([searchProducts(''), fetchLocations()])
      .then(([pd,ld])=>{ setAllProds(pd.products||[]); setLocs(ld.locations||[]); })
      .catch(()=>{});
  },[]);

  const save = async(saveStatus)=>{
    if(!form.location)        { showToast('Location is required','error');      return; }
    if(!form.adjustment_type) { showToast('Adjustment type is required','error'); return; }
    if(items.length===0)      { showToast('Add at least one product','error');   return; }
    setSaving(true);
    try {
      await createStockAdjustment({
        ...form, status:saveStatus,
        total_amount_recovered: parseFloat(form.total_amount_recovered)||0,
        items: items.map(it=>({ product_id:it.product_id, quantity:parseFloat(it.quantity)||1, unit_cost:parseFloat(it.unit_cost)||0 })),
      });
      showToast(saveStatus==='Completed'?'✅ Saved & stock updated!':'✅ Saved as '+saveStatus,'success');
      setTimeout(()=>navigate('/stock-adjustments'),1100);
    } catch(err){ showToast(err.message||'Failed to save','error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="sa-page">
      <div className="sa-header">
        <div>
          <Link to="/stock-adjustments" className="sa-back-link"><IcoBack/> Back to List</Link>
          <div className="sa-title">Add Stock Adjustment</div>
          <div className="sa-breadcrumb">Home / <span>Stock Adjustment</span> / Add</div>
        </div>
      </div>

      <div className="sa-card">
        <div className="sa-form-section">
          <div className="sa-form-grid">
            <div className="sa-field">
              <label className="sa-label">Business Location <span className="sa-req">*</span></label>
              <LocationCombo value={form.location} onChange={v=>setForm(f=>({...f,location:v}))} locations={locations}/>
            </div>
            <div className="sa-field">
              <label className="sa-label">Reference No</label>
              <input className="sa-input" placeholder="Auto-generated if blank" value={form.reference_no} onChange={e=>setForm(f=>({...f,reference_no:e.target.value}))}/>
            </div>
            <div className="sa-field">
              <label className="sa-label">Adjustment Date <span className="sa-req">*</span></label>
              <input className="sa-input" type="date" value={form.adjustment_date} onChange={e=>setForm(f=>({...f,adjustment_date:e.target.value}))}/>
            </div>
            <div className="sa-field">
              <label className="sa-label">Adjustment Type <span className="sa-req">*</span></label>
              <select className="sa-select" value={form.adjustment_type} onChange={e=>setForm(f=>({...f,adjustment_type:e.target.value}))}>
                <option value="">— Select —</option><option>Normal</option><option>Abnormal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="sa-form-section">
          <div style={{fontFamily:'Sora,sans-serif',fontSize:'.86rem',fontWeight:600,color:'var(--g700)',marginBottom:14}}>
            📦 Products for Adjustment
          </div>
          <ProductPicker items={items} setItems={setItems} allProds={allProds} showToast={showToast}/>
        </div>

        <div className="sa-form-section">
          <div className="sa-form-grid" style={{gridTemplateColumns:'1fr 3fr'}}>
            <div className="sa-field">
              <label className="sa-label">Total Amount Recovered (₹)</label>
              <input className="sa-input" type="number" min="0" step="0.01" value={form.total_amount_recovered} onChange={e=>setForm(f=>({...f,total_amount_recovered:e.target.value}))}/>
            </div>
            <div className="sa-field">
              <label className="sa-label">Reason / Notes</label>
              <textarea className="sa-textarea" placeholder="Describe the reason…" value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}/>
            </div>
          </div>
        </div>

        <div className="sa-save-row">
          <button className="sa-save-btn draft"   onClick={()=>save('Draft')}   disabled={saving}>Save as Draft</button>
          <button className="sa-save-btn pending" onClick={()=>save('Pending')} disabled={saving}>Save as Pending</button>
          <button className="sa-save-btn complete" onClick={()=>save('Completed')} disabled={saving}>
            <IcoSave/>{saving?'Saving…':'Approve & Complete'}
          </button>
        </div>
      </div>

      {toast && <div className={`sa-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default ListStockAdjustments;
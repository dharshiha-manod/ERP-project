import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════ */
const P = "#1a6b3c";
const PLt = "#f0faf4";
const PBdr = "#bbf7d0";
const G = { 50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",900:"#0f172a" };
const W = "#ffffff";
const F = "'Inter','Segoe UI',system-ui,sans-serif";

/* ══════════════════════════════════════
   SVG ICON LIBRARY
══════════════════════════════════════ */
const Ic = {
  eye:     (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit:    (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:   (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  dl:      (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  plus:    (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  upload:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  send:    (s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  search:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  file:    (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  print:   (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  check:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:       (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevL:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevR:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  filter:  (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  refresh: (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>,
  warn:    ()=><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  todo:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  doc:     ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  memo:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  cal:     ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chat:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  book:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  gear:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

/* ══════════════════════════════════════
   INJECT STYLES  (runs once)
══════════════════════════════════════ */
let _injected = false;
function injectStyles() {
  if (_injected) return; _injected = true;
  const el = document.createElement("style");
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${F};background:#f0f2f5}

    /* ── Root ── */
    .root{font-family:${F};color:${G[700]};background:#f0f2f5;min-height:100vh}

    /* ── Top nav tabs ── */
    .top-nav{background:${W};border-bottom:1px solid ${G[200]};display:flex;align-items:center;padding:0 20px;overflow-x:auto;gap:2px}
    .top-nav::-webkit-scrollbar{height:3px}
    .top-tab{padding:13px 14px;font-size:13px;font-weight:500;color:${G[500]};cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap;transition:color .15s;font-family:${F};display:inline-flex;align-items:center;gap:6px}
    .top-tab:hover{color:${P}}
    .top-tab.on{color:${P};border-bottom-color:${P};font-weight:600}

    /* ── Page shell ── */
    .page{padding:20px;max-width:1380px}
    .ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:12px;flex-wrap:wrap}
    .pt{font-size:19px;font-weight:700;color:${G[900]};letter-spacing:-.02em}
    .ps{font-size:12px;color:${G[400]};margin-top:2px}

    /* ── Card ── */
    .card{background:${W};border:1px solid ${G[200]};border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
    .cb{padding:18px 20px}

    /* ── Buttons ── */
    .btn-p{background:${P};color:#fff;border:none;border-radius:7px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:${F};transition:background .15s,box-shadow .15s;line-height:1}
    .btn-p:hover{background:#145a32;box-shadow:0 3px 10px rgba(26,107,60,.3)}
    .btn-s{background:${W};color:${G[700]};border:1px solid ${G[200]};border-radius:7px;padding:8px 14px;font-size:13px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:${F};transition:all .15s;line-height:1}
    .btn-s:hover{background:${G[50]};border-color:${G[300]}}
    .btn-d{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:7px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:${F};transition:all .15s;display:inline-flex;align-items:center;gap:6px}
    .btn-d:hover{background:#fee2e2}

    /* ── Action buttons (labeled pill) ── */
    .ag{display:flex;align-items:center;gap:4px;flex-wrap:nowrap}
    .ab{height:28px;padding:0 9px;border-radius:5px;border:1px solid;background:transparent;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;font-family:${F};transition:all .12s;white-space:nowrap;line-height:1}
    .ab.v{color:#2563eb;border-color:#bfdbfe;background:#eff6ff}.ab.v:hover{background:#dbeafe}
    .ab.e{color:#d97706;border-color:#fde68a;background:#fffbeb}.ab.e:hover{background:#fef3c7}
    .ab.r{color:#dc2626;border-color:#fecaca;background:#fef2f2}.ab.r:hover{background:#fee2e2}
    .ab.d{color:${P};border-color:${PBdr};background:${PLt}}.ab.d:hover{background:#dcfce7}

    /* ── Export bar ── */
    .ebar{display:flex;gap:4px;flex-wrap:wrap}
    .eb{height:28px;padding:0 10px;border:1px solid ${G[200]};background:${W};border-radius:5px;font-size:11.5px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-family:${F};color:${G[600]};transition:all .12s}
    .eb:hover{background:${G[50]};border-color:${G[300]}}
    .eb.g{color:#16a34a;border-color:#bbf7d0;background:#f0fdf4}.eb.g:hover{background:#dcfce7}
    .eb.red{color:#dc2626;border-color:#fecaca;background:#fef2f2}.eb.red:hover{background:#fee2e2}

    /* ── Table ── */
    .tw{overflow-x:auto}
    .tbl{width:100%;border-collapse:collapse;font-size:13px;min-width:680px}
    .tbl th{background:#f8fafc;color:${G[400]};font-weight:600;padding:9px 13px;text-align:left;border-bottom:1px solid ${G[200]};font-size:11px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
    .tbl td{padding:9px 13px;border-bottom:1px solid ${G[100]};color:${G[700]};vertical-align:middle}
    .tbl tr:last-child td{border-bottom:none}
    .tbl tbody tr:hover td{background:#fafcff}
    .nd{text-align:center;color:${G[400]};padding:44px;font-size:13.5px}

    /* ── Toolbar ── */
    .ttb{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:11px 14px;border-bottom:1px solid ${G[100]}}
    .sr{display:flex;align-items:center;gap:6px;font-size:12px;color:${G[500]}}
    .sr select{border:1px solid ${G[200]};border-radius:5px;padding:4px 7px;font-family:${F};font-size:12px;color:${G[700]};background:${W};outline:none}
    .tsrch{height:30px;padding:0 9px 0 28px;border:1px solid ${G[200]};border-radius:6px;width:190px;font-family:${F};font-size:12.5px;color:${G[700]};background:${W} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 8px center;outline:none;transition:.15s}
    .tsrch:focus{border-color:${P};box-shadow:0 0 0 2px rgba(26,107,60,.1)}

    /* ── Pagination ── */
    .pw{display:flex;justify-content:space-between;align-items:center;padding:9px 14px;font-size:11.5px;color:${G[500]};border-top:1px solid ${G[100]}}
    .pbs{display:flex;gap:3px}
    .pb{height:26px;min-width:26px;padding:0 6px;border:1px solid ${G[200]};background:${W};border-radius:5px;font-size:12px;cursor:pointer;font-family:${F};color:${G[600]};display:flex;align-items:center;justify-content:center;transition:.12s}
    .pb:hover:not(:disabled){background:${G[50]};border-color:${G[300]}}
    .pb.on{background:${P};color:#fff;border-color:${P}}
    .pb:disabled{opacity:.35;cursor:not-allowed}

    /* ── Badges ── */
    .bdg{padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
    .bdg::before{content:'';width:5px;height:5px;border-radius:50%;flex-shrink:0}
    .bhi{background:#fef2f2;color:#dc2626}.bhi::before{background:#dc2626}
    .bme{background:#fffbeb;color:#d97706}.bme::before{background:#d97706}
    .blo{background:#eff6ff;color:#2563eb}.blo::before{background:#2563eb}
    .bdn{background:#f0fdf4;color:#16a34a}.bdn::before{background:#16a34a}
    .bpr{background:#eff6ff;color:#2563eb}.bpr::before{background:#2563eb}
    .bwt{background:${G[100]};color:${G[500]}}.bwt::before{background:${G[400]}}
    .bpu{background:#f0fdf4;color:#16a34a}.bpu::before{background:#16a34a}
    .bpv{background:#fef2f2;color:#dc2626}.bpv::before{background:#dc2626}
    .btm{background:#f5f3ff;color:#7c3aed}.btm::before{background:#7c3aed}

    /* ── Filter bar ── */
    .fb{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;padding:12px 14px;background:#fafcfe;border-bottom:1px solid ${G[100]}}
    .fg{display:flex;flex-direction:column;gap:3px}
    .fl{font-size:10px;font-weight:700;color:${G[400]};text-transform:uppercase;letter-spacing:.06em}
    .fs{height:30px;padding:0 9px;border:1px solid ${G[200]};border-radius:6px;font-family:${F};font-size:12.5px;color:${G[700]};background:${W};cursor:pointer;min-width:120px;outline:none}
    .fs:focus{border-color:${P}}

    /* ── Modal ── */
    .mo{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);animation:fi .15s}
    @keyframes fi{from{opacity:0}to{opacity:1}}
    .mb{background:${W};border-radius:12px;width:580px;max-width:96vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:su .16s}
    @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
    .mh{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid ${G[100]}}
    .mt{font-size:15px;font-weight:700;color:${G[900]}}
    .mc{width:27px;height:27px;border-radius:6px;border:1px solid ${G[200]};background:${W};cursor:pointer;display:flex;align-items:center;justify-content:center;color:${G[400]};transition:.12s}
    .mc:hover{background:${G[100]};color:${G[700]}}
    .mbdy{padding:16px 20px}
    .mft{display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid ${G[100]}}

    /* ── Forms ── */
    .fg2{margin-bottom:13px}
    .lbl{font-size:11.5px;font-weight:600;color:${G[700]};margin-bottom:5px;display:block}
    .lbl .rq{color:#ef4444}
    .inp{width:100%;height:35px;padding:0 10px;border:1px solid ${G[200]};border-radius:7px;font-family:${F};font-size:13px;color:${G[900]};background:${W};outline:none;transition:.15s}
    .inp:focus{border-color:${P};box-shadow:0 0 0 2px rgba(26,107,60,.08)}
    .inp.ta{height:auto;padding:8px 10px;resize:vertical;line-height:1.55}
    .fr{display:grid;grid-template-columns:1fr 1fr;gap:13px}

    /* ── Rich text ── */
    .rtb{border:1px solid ${G[200]};border-radius:7px 7px 0 0;background:${G[50]};padding:5px 7px;display:flex;gap:3px;flex-wrap:wrap}
    .rtbt{height:25px;padding:0 6px;border:1px solid ${G[200]};background:${W};border-radius:4px;font-size:11.5px;cursor:pointer;font-family:${F};color:${G[600]};transition:.1s}
    .rtbt:hover{background:${G[100]}}
    .rta{border:1px solid ${G[200]};border-top:none;border-radius:0 0 7px 7px;min-height:90px;padding:8px 10px;font-family:${F};font-size:13px;width:100%;resize:vertical;outline:none;color:${G[900]};line-height:1.55}
    .rta:focus{border-color:${P}}

    /* ── Upload zone ── */
    .uz{border:2px dashed ${G[200]};border-radius:9px;padding:24px;text-align:center;cursor:pointer;transition:.15s}
    .uz:hover,.uz.ov{border-color:${P};background:${PLt}}

    /* ── Toast ── */
    .tw2{position:fixed;bottom:20px;right:20px;z-index:2000;display:flex;flex-direction:column;gap:6px}
    .tst{color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 6px 20px rgba(0,0,0,.18);animation:si .18s;display:flex;align-items:center;gap:8px}
    .tst.success{background:${P}}.tst.error{background:#ef4444}
    @keyframes si{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}

    /* ── Confirm ── */
    .cfm{background:${W};border-radius:12px;padding:26px 22px;width:350px;max-width:95vw;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:su .16s}

    /* ── Calendar ── */
    .cg{display:grid;grid-template-columns:repeat(7,1fr)}
    .chc{text-align:center;font-weight:600;font-size:10.5px;color:${G[400]};padding:7px 0;border-right:1px solid ${G[100]};border-bottom:1px solid ${G[200]};text-transform:uppercase;letter-spacing:.04em}
    .cc{min-height:75px;border-right:1px solid ${G[100]};border-bottom:1px solid ${G[100]};padding:4px 6px}
    .cc.emp{background:${G[50]}}.cc.td{background:#f0fdf4}
    .cc.td .cn{background:${P};color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center}
    .cn{font-size:11.5px;font-weight:600;color:${G[700]};margin-bottom:2px}
    .ce{border-radius:3px;padding:1px 5px;font-size:10px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;color:#fff}

    /* ═══ MESSAGES – clean full-width chat ═══ */
    .msg-shell{display:flex;flex-direction:column;height:560px;border-radius:10px;overflow:hidden;border:1px solid ${G[200]};background:${W};box-shadow:0 1px 4px rgba(0,0,0,.05)}
    .msg-contacts{padding:14px 16px;border-bottom:1px solid ${G[200]};display:flex;gap:8px;flex-wrap:wrap;background:${W}}
    .msg-contact-btn{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:50px;border:1px solid ${G[200]};background:${W};cursor:pointer;font-family:${F};font-size:13px;font-weight:500;color:${G[600]};transition:all .15s}
    .msg-contact-btn:hover{border-color:${PBdr};color:${P};background:${PLt}}
    .msg-contact-btn.on{background:${P};color:#fff;border-color:${P}}
    .msg-contact-btn.on .msg-av{background:rgba(255,255,255,.25);color:#fff}
    .msg-av{width:26px;height:26px;border-radius:50%;background:${PLt};color:${P};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
    .msg-chat{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:4px;background:#f9fafb}
    .msg-chat::-webkit-scrollbar{width:4px}
    .msg-chat::-webkit-scrollbar-thumb{background:${G[200]};border-radius:4px}
    .msg-row{display:flex;flex-direction:column}
    .msg-row.me{align-items:flex-end}
    .msg-row.them{align-items:flex-start}
    .msg-bbl{max-width:65%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.55;word-break:break-word}
    .msg-bbl.me{background:${P};color:#fff;border-bottom-right-radius:3px}
    .msg-bbl.them{background:${W};color:${G[700]};border-bottom-left-radius:3px;border:1px solid ${G[200]};box-shadow:0 1px 2px rgba(0,0,0,.04)}
    .msg-time{font-size:10.5px;color:${G[400]};margin-top:3px;padding:0 2px}
    .msg-input-bar{padding:12px 16px;border-top:1px solid ${G[200]};display:flex;gap:10px;align-items:center;background:${W}}
    .msg-inp{flex:1;height:40px;padding:0 14px;border:1px solid ${G[200]};border-radius:20px;font-family:${F};font-size:13.5px;outline:none;color:${G[900]};transition:.15s;background:${G[50]}}
    .msg-inp:focus{border-color:${P};background:${W};box-shadow:0 0 0 2px rgba(26,107,60,.08)}
    .msg-send{width:40px;height:40px;border-radius:50%;background:${P};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;transition:background .15s,box-shadow .15s}
    .msg-send:hover{background:#145a32;box-shadow:0 3px 10px rgba(26,107,60,.3)}

    /* ── KB card ── */
    .kbc{border:1px solid ${G[200]};border-radius:9px;padding:14px 17px;margin-bottom:9px;background:${W};transition:border-color .15s,box-shadow .15s}
    .kbc:hover{border-color:${PBdr};box-shadow:0 3px 10px rgba(26,107,60,.07)}

    /* ── Settings nav ── */
    .snav{width:155px;flex-shrink:0;padding:8px;border-right:1px solid ${G[200]}}
    .sni{padding:8px 10px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;color:${G[600]};transition:.12s}
    .sni:hover{background:${G[100]}}
    .sni.on{background:${PLt};color:${P};font-weight:600}

    /* ── Home grid ── */
    .hg{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
    @media(max-width:680px){.hg{grid-template-columns:1fr 1fr}.fr{grid-template-columns:1fr}}
    .hc{background:${W};border:1px solid ${G[200]};border-radius:10px;padding:18px;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .15s}
    .hc:hover{border-color:${PBdr};box-shadow:0 4px 14px rgba(26,107,60,.08);transform:translateY(-2px)}
    .hci{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:11px}
    .hct{font-size:14px;font-weight:700;color:${G[900]};margin-bottom:3px}
    .hcc{font-size:12px;color:${P};font-weight:600}

    /* ── Detail row ── */
    .dr{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid ${G[100]}}
    .dk{width:115px;font-weight:600;font-size:12px;color:${G[400]};flex-shrink:0}
    .dv{font-size:13px;color:${G[900]}}
  `;
  document.head.appendChild(el);
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function Toasts({ list }) {
  return <div className="tw2">{list.map(t=><div key={t.id} className={`tst ${t.type}`}>{Ic.check(13)} {t.msg}</div>)}</div>;
}
function useToast() {
  const [list, set] = useState([]);
  const show = (msg, type="success") => {
    const id = Date.now();
    set(l=>[...l,{id,msg,type}]);
    setTimeout(()=>set(l=>l.filter(x=>x.id!==id)),2800);
  };
  return { list, show };
}

/* ══════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════ */
function Confirm({ msg, onOk, onNo }) {
  return (
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onNo()}>
      <div className="cfm">
        <div style={{marginBottom:8}}>{Ic.warn()}</div>
        <div style={{fontSize:15,fontWeight:700,color:G[900],marginBottom:6}}>Delete this record?</div>
        <div style={{fontSize:13,color:G[500]}}>{msg}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:18}}>
          <button className="btn-s" onClick={onNo}>Cancel</button>
          <button className="btn-d" onClick={onOk}>{Ic.trash()} Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ACTION BUTTONS
══════════════════════════════════════ */
function AB({ onView, onEdit, onDel, onDl }) {
  return (
    <div className="ag">
      {onView && <button className="ab v" onClick={onView}>{Ic.eye()} View</button>}
      {onEdit && <button className="ab e" onClick={onEdit}>{Ic.edit()} Edit</button>}
      {onDel  && <button className="ab r" onClick={onDel}>{Ic.trash()} Delete</button>}
      {onDl   && <button className="ab d" onClick={onDl}>{Ic.dl()} Download</button>}
    </div>
  );
}

/* ══════════════════════════════════════
   EXPORT BAR
══════════════════════════════════════ */
function ExportBar({ data, cols, name }) {
  const csv = () => {
    if (!data?.length) return;
    const h = cols.map(c=>c.label).join(",");
    const r = data.map(r=>cols.map(c=>`"${String(r[c.key]??"").replace(/"/g,'""')}"`).join(","));
    const b = new Blob([[h,...r].join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`${name}.csv`; a.click();
  };
  const print = () => {
    const w = window.open("","_blank");
    const th = cols.map(c=>`<th style="border:1px solid #ddd;padding:7px;background:#f5f5f5">${c.label}</th>`).join("");
    const tr = data.map(r=>`<tr>${cols.map(c=>`<td style="border:1px solid #ddd;padding:7px">${r[c.key]??""}</td>`).join("")}</tr>`).join("");
    w.document.write(`<html><head><title>${name}</title><style>body{font-family:sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}</style></head><body><h2 style="margin-bottom:10px">${name}</h2><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></body></html>`);
    w.print();
  };
  return (
    <div className="ebar">
      <button className="eb g" onClick={csv}>{Ic.file()} CSV</button>
      <button className="eb g" onClick={csv}>{Ic.file()} Excel</button>
      <button className="eb red" onClick={print}>{Ic.file()} PDF</button>
      <button className="eb" onClick={print}>{Ic.print()} Print</button>
    </div>
  );
}

/* ══════════════════════════════════════
   RICH TEXT
══════════════════════════════════════ */
function RT({ val, onChange, ph="Write here…", rows=5 }) {
  return (
    <div>
      <div className="rtb">
        {["B","I","U","H1","H2","• List","1. List"].map(b=>(
          <button key={b} className="rtbt" type="button"
            style={{fontWeight:b==="B"?700:400,fontStyle:b==="I"?"italic":"normal",textDecoration:b==="U"?"underline":"none"}}>{b}</button>
        ))}
      </div>
      <textarea className="rta" value={val} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={rows}/>
    </div>
  );
}

/* ══════════════════════════════════════
   DATA TABLE
══════════════════════════════════════ */
function DT({ cols, data, empty="No records found" }) {
  const [q,setQ]=useState("");
  const [show,setShow]=useState(10);
  const [page,setPage]=useState(1);
  const filtered=data.filter(r=>cols.some(c=>String(r[c.key]??"").toLowerCase().includes(q.toLowerCase())));
  const pages=Math.max(1,Math.ceil(filtered.length/show));
  const slice=filtered.slice((page-1)*show,page*show);
  const ecols=cols.filter(c=>!["actions","priorityEl","statusEl","shareEl"].includes(c.key));
  return (
    <>
      <div className="ttb">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="sr">Show <select value={show} onChange={e=>{setShow(+e.target.value);setPage(1)}}>{[10,25,50,100].map(n=><option key={n}>{n}</option>)}</select> entries</div>
          <ExportBar data={data} cols={ecols} name="export"/>
        </div>
        <input className="tsrch" placeholder="Search…" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/>
      </div>
      <div className="tw">
        <table className="tbl">
          <thead><tr>{cols.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead>
          <tbody>
            {slice.length===0
              ?<tr><td colSpan={cols.length} className="nd">{empty}</td></tr>
              :slice.map((r,i)=><tr key={i}>{cols.map(c=><td key={c.key}>{r[c.key]}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <div className="pw">
        <span>Showing {slice.length?(page-1)*show+1:0}–{Math.min(page*show,filtered.length)} of {filtered.length} entries</span>
        <div className="pbs">
          <button className="pb" disabled={page===1} onClick={()=>setPage(1)}>«</button>
          <button className="pb" disabled={page===1} onClick={()=>setPage(p=>p-1)}>{Ic.chevL()}</button>
          {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>(
            <button key={p} className={`pb${p===page?" on":""}`} onClick={()=>setPage(p)}>{p}</button>
          ))}
          <button className="pb" disabled={page===pages} onClick={()=>setPage(p=>p+1)}>{Ic.chevR()}</button>
          <button className="pb" disabled={page===pages} onClick={()=>setPage(pages)}>»</button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════
   BADGES
══════════════════════════════════════ */
const PBadge=({v})=>{const m={High:"bhi",Medium:"bme",Low:"blo"};return<span className={`bdg ${m[v]||"bwt"}`}>{v}</span>};
const SBadge=({v})=>{const m={Completed:"bdn","In Progress":"bpr","Not Started":"bwt"};return<span className={`bdg ${m[v]||"bwt"}`}>{v}</span>};
const ShBadge=({v})=>{const m={Public:"bpu",Private:"bpv",Team:"btm"};return<span className={`bdg ${m[v]||"bwt"}`}>{v}</span>};

/* ══════════════════════════════════════
   VIEW MODAL
══════════════════════════════════════ */
function VM({ title, children, onClose }) {
  return (
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mb">
        <div className="mh"><div className="mt">{title}</div><button className="mc" onClick={onClose}>{Ic.x()}</button></div>
        <div className="mbdy">{children}</div>
        <div className="mft"><button className="btn-s" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SAMPLE DATA
══════════════════════════════════════ */
const TODOS=[
  {addedOn:"08/06/2026",taskId:"TASK-001",task:"Reconcile Q2 purchase invoices",     status:"In Progress", startDate:"2026-06-01",endDate:"2026-06-10",hours:"6",assignedBy:"Admin",  assignedTo:"Priya S.",  priority:"High"  },
  {addedOn:"07/06/2026",taskId:"TASK-002",task:"Update product pricing list",         status:"Not Started", startDate:"2026-06-08",endDate:"2026-06-15",hours:"3",assignedBy:"Admin",  assignedTo:"Rahul M.",  priority:"Medium"},
  {addedOn:"06/06/2026",taskId:"TASK-003",task:"Audit warehouse stock levels",        status:"Completed",   startDate:"2026-06-03",endDate:"2026-06-06",hours:"8",assignedBy:"Manager",assignedTo:"Ananya K.", priority:"High"  },
  {addedOn:"05/06/2026",taskId:"TASK-004",task:"Send supplier payment reminders",     status:"Completed",   startDate:"2026-06-05",endDate:"2026-06-05",hours:"1",assignedBy:"Admin",  assignedTo:"Vikram T.", priority:"Low"   },
  {addedOn:"04/06/2026",taskId:"TASK-005",task:"Prepare monthly expense report",      status:"In Progress", startDate:"2026-06-04",endDate:"2026-06-12",hours:"5",assignedBy:"Admin",  assignedTo:"Priya S.",  priority:"Medium"},
  {addedOn:"03/06/2026",taskId:"TASK-006",task:"Review and approve new sales orders", status:"Not Started", startDate:"2026-06-09",endDate:"2026-06-09",hours:"2",assignedBy:"Manager",assignedTo:"Rahul M.",  priority:"High"  },
  {addedOn:"02/06/2026",taskId:"TASK-007",task:"Update CRM customer records",         status:"In Progress", startDate:"2026-06-02",endDate:"2026-06-11",hours:"4",assignedBy:"Admin",  assignedTo:"Deepa R.",  priority:"Low"   },
];
const DOCS=[
  {name:"Q2_Purchase_Invoice_Bundle.pdf",  description:"All purchase invoices for April–June 2026",    uploadedDate:"07/06/2026",size:"2.4 MB",type:"PDF"  },
  {name:"Warehouse_Audit_Report_June.xlsx",description:"Stock audit results – Main warehouse",         uploadedDate:"06/06/2026",size:"1.1 MB",type:"XLSX" },
  {name:"Supplier_Contracts_2026.zip",     description:"Signed contracts with top 10 suppliers",       uploadedDate:"04/06/2026",size:"3.8 MB",type:"ZIP"  },
  {name:"Employee_Onboarding_Docs.pdf",    description:"HR onboarding package for new hires",          uploadedDate:"01/06/2026",size:"0.9 MB",type:"PDF"  },
  {name:"Brand_Guidelines_v3.pdf",         description:"Updated visual brand identity guidelines",      uploadedDate:"28/05/2026",size:"4.2 MB",type:"PDF"  },
  {name:"Tax_Filing_May2026.pdf",          description:"GST and income tax filing documents for May",   uploadedDate:"20/05/2026",size:"1.6 MB",type:"PDF"  },
];
const MEMOS=[
  {heading:"New POS Terminal Policy",      description:"All branches must validate receipts via the new POS system from July 1st. Paper receipts are no longer valid.",createdDate:"08/06/2026"},
  {heading:"Q3 Sales Target Announcement", description:"The Q3 target has been set at ₹42L across all regions. Branch managers to review and cascade to their teams.", createdDate:"07/06/2026"},
  {heading:"Inventory Freeze – June 30",   description:"No stock transfers or adjustments to be made on June 30 due to year-end audit. Plan accordingly.",              createdDate:"05/06/2026"},
  {heading:"Office Renovation Schedule",   description:"Head office 2nd floor under renovation June 20–25. Remote work approved for affected teams.",                   createdDate:"03/06/2026"},
  {heading:"Updated Leave Policy",         description:"Casual leave can now be applied 24 hrs in advance instead of 48 hrs. Refer to the updated HR policy document.", createdDate:"01/06/2026"},
];
const EVENTS=[
  {name:"Board Review Meeting",         date:"2026-06-10",startTime:"10:00",endTime:"12:00",repeat:"One time"},
  {name:"Monthly Payroll Run",          date:"2026-06-15",startTime:"09:00",endTime:"10:00",repeat:"Monthly" },
  {name:"Team Standup",                 date:"2026-06-09",startTime:"09:30",endTime:"09:45",repeat:"Daily"   },
  {name:"Supplier Call – Arjun Traders",date:"2026-06-11",startTime:"14:00",endTime:"15:00",repeat:"One time"},
  {name:"Stock Audit Deadline",         date:"2026-06-20",startTime:"17:00",endTime:"17:00",repeat:"One time"},
  {name:"Q2 Closing",                   date:"2026-06-30",startTime:"18:00",endTime:"18:00",repeat:"Monthly" },
];
const MSGS_INIT={
  Admin:  [{text:"Warehouse stock report ready for review.",           time:"09:05 AM",from:"them"},{text:"Please check the new supplier invoice in Documents.",time:"09:18 AM",from:"them"},{text:"Stock audit completed – no discrepancies found.",    time:"10:30 AM",from:"me"  },{text:"Q2 targets updated in the sales dashboard.",           time:"11:00 AM",from:"me"  },{text:"Reminder: team meeting at 3 PM today.",                time:"02:45 PM",from:"them"}],
  "Priya S.":[{text:"Leave request approved for June 18.",            time:"10:10 AM",from:"them"}],
  "Rahul M.":[{text:"Sales figures updated for May 2026.",            time:"11:30 AM",from:"them"}],
  "Ananya K.":[{text:"Warehouse audit report submitted.",             time:"09:50 AM",from:"them"}],
};
const KB=[
  {title:"How to Process a Purchase Return",content:"Navigate to Purchases → Purchase Return, click Add, select the original invoice and enter return details.",share:"Public", date:"05/06/2026"},
  {title:"Stock Transfer SOP",              content:"Raise a transfer request in Stock Transfers module. Branch manager must approve within 24 hrs before processing.",share:"Team",   date:"01/06/2026"},
  {title:"Month-End Closing Checklist",     content:"1. Reconcile all invoices. 2. Run stock audit. 3. Export P&L report. 4. Archive documents. 5. Submit to finance.",share:"Private",date:"28/05/2026"},
  {title:"Adding a New Supplier",           content:"Go to Contacts → Suppliers, click + Add. Fill mandatory fields: Name, GST No., Payment Terms. Save and verify.",share:"Public", date:"20/05/2026"},
];
const EC=["#1a6b3c","#2563eb","#7c3aed","#dc2626","#d97706","#0891b2"];

/* ══════════════════════════════════════
   HOME PAGE
══════════════════════════════════════ */
function HomePage({ setTab, counts }) {
  const cards=[
    {tab:"To Do",         label:"To Do",         count:`${counts.todos} tasks`,    bg:"#f0fdf4",ic:<span style={{color:"#16a34a"}}>{Ic.todo()}</span>},
    {tab:"Document",      label:"Documents",      count:`${counts.docs} files`,     bg:"#fffbeb",ic:<span style={{color:"#d97706"}}>{Ic.doc()}</span>},
    {tab:"Memos",         label:"Memos",          count:`${counts.memos} memos`,    bg:"#fef2f2",ic:<span style={{color:"#dc2626"}}>{Ic.memo()}</span>},
    {tab:"Reminders",     label:"Reminders",      count:`${counts.events} events`,  bg:"#eff6ff",ic:<span style={{color:"#2563eb"}}>{Ic.cal()}</span>},
    {tab:"Messages",      label:"Messages",       count:`${counts.msgs} contacts`,  bg:"#f5f3ff",ic:<span style={{color:"#7c3aed"}}>{Ic.chat()}</span>},
    {tab:"Knowledge Base",label:"Knowledge Base", count:`${counts.kb} articles`,    bg:"#fdf4ff",ic:<span style={{color:"#be185d"}}>{Ic.book()}</span>},
  ];
  return (
    <div>
      <div className="ph">
        <div><div className="pt">Essentials</div><div className="ps">Your productivity hub — tasks, docs, memos, reminders &amp; more</div></div>
      </div>
      <div className="hg">
        {cards.map(c=>(
          <div key={c.tab} className="hc" onClick={()=>setTab(c.tab)}>
            <div className="hci" style={{background:c.bg}}>{c.ic}</div>
            <div className="hct">{c.label}</div>
            <div className="hcc">{c.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TO-DO PAGE
══════════════════════════════════════ */
function TodoPage({ toast }) {
  const [todos,setTodos]=useState(TODOS);
  const [modal,setModal]=useState(false);
  const [editIdx,setEditIdx]=useState(null);
  const [view,setView]=useState(null);
  const [cfm,setCfm]=useState(null);
  const [fil,setFil]=useState({assignedTo:"All",priority:"All",status:"All"});
  const blank={task:"",assignedTo:"",priority:"Medium",status:"Not Started",startDate:"",endDate:"",hours:"",desc:""};
  const [form,setForm]=useState(blank);
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const fil2=todos.filter(t=>
    (fil.assignedTo==="All"||t.assignedTo===fil.assignedTo)&&
    (fil.priority==="All"||t.priority===fil.priority)&&
    (fil.status==="All"||t.status===fil.status)
  );

  const save=()=>{
    if(!form.task.trim())return toast("Task name is required","error");
    if(!form.assignedTo.trim())return toast("Assigned To is required","error");
    const now=new Date().toLocaleDateString("en-IN");
    if(editIdx!==null){setTodos(ts=>ts.map((t,i)=>i===editIdx?{...t,...form}:t));toast("Task updated");}
    else{setTodos(ts=>[...ts,{addedOn:now,taskId:`TASK-${String(ts.length+1).padStart(3,"0")}`,assignedBy:"Admin",...form}]);toast("Task added");}
    setModal(false);
  };

  const cols=[
    {key:"addedOn",label:"Added On"},{key:"taskId",label:"Task ID"},{key:"task",label:"Task"},
    {key:"priorityEl",label:"Priority"},{key:"statusEl",label:"Status"},
    {key:"startDate",label:"Start"},{key:"endDate",label:"End"},{key:"hours",label:"Hrs"},
    {key:"assignedBy",label:"By"},{key:"assignedTo",label:"Assigned To"},{key:"actions",label:"Actions"},
  ];
  const tdata=fil2.map(t=>({
    ...t,
    priorityEl:<PBadge v={t.priority}/>,
    statusEl:<SBadge v={t.status}/>,
    actions:<AB
      onView={()=>setView(t)}
      onEdit={()=>{setForm({...t,desc:""});setEditIdx(todos.indexOf(t));setModal(true);}}
      onDel={()=>setCfm({msg:`Delete "${t.task}"?`,onOk:()=>{setTodos(ts=>ts.filter((_,i)=>i!==todos.indexOf(t)));toast("Task deleted");setCfm(null);}})}
    />,
  }));

  return (
    <div>
      {cfm&&<Confirm {...cfm} onNo={()=>setCfm(null)}/>}
      {view&&(
        <VM title="Task Details" onClose={()=>setView(null)}>
          {[["Task ID",view.taskId],["Task",view.task],["Priority",<PBadge v={view.priority}/>],["Status",<SBadge v={view.status}/>],["Start",view.startDate],["End",view.endDate],["Hours",view.hours],["Assigned By",view.assignedBy],["Assigned To",view.assignedTo]].map(([k,v])=>(
            <div key={k} className="dr"><span className="dk">{k}</span><span className="dv">{v}</span></div>
          ))}
        </VM>
      )}
      {modal&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mb">
            <div className="mh"><div className="mt">{editIdx!==null?"Edit Task":"Add Task"}</div><button className="mc" onClick={()=>setModal(false)}>{Ic.x()}</button></div>
            <div className="mbdy">
              <div className="fg2"><label className="lbl">Task Name <span className="rq">*</span></label><input className="inp" value={form.task} onChange={s("task")} placeholder="Enter task name"/></div>
              <div className="fg2"><label className="lbl">Assigned To <span className="rq">*</span></label><input className="inp" value={form.assignedTo} onChange={s("assignedTo")} placeholder="Employee name"/></div>
              <div className="fr">
                <div className="fg2"><label className="lbl">Priority</label><select className="inp" value={form.priority} onChange={s("priority")}><option>High</option><option>Medium</option><option>Low</option></select></div>
                <div className="fg2"><label className="lbl">Status</label><select className="inp" value={form.status} onChange={s("status")}><option>Not Started</option><option>In Progress</option><option>Completed</option></select></div>
              </div>
              <div className="fr">
                <div className="fg2"><label className="lbl">Start Date</label><input className="inp" type="date" value={form.startDate} onChange={s("startDate")}/></div>
                <div className="fg2"><label className="lbl">End Date</label><input className="inp" type="date" value={form.endDate} onChange={s("endDate")}/></div>
              </div>
              <div className="fg2"><label className="lbl">Estimated Hours</label><input className="inp" type="number" min="0" value={form.hours} onChange={s("hours")} style={{maxWidth:130}}/></div>
              <div className="fg2"><label className="lbl">Description</label><RT val={form.desc} onChange={v=>setForm(f=>({...f,desc:v}))}/></div>
            </div>
            <div className="mft">
              <button className="btn-s" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn-p" onClick={save}>{Ic.check()} {editIdx!==null?"Update Task":"Save Task"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="ph">
        <div><div className="pt">To-Do List</div><div className="ps">{todos.length} tasks total</div></div>
        <button className="btn-p" onClick={()=>{setForm(blank);setEditIdx(null);setModal(true);}}>{Ic.plus()} Add Task</button>
      </div>
      <div className="card" style={{marginBottom:12}}>
        <div className="fb">
          <div className="fg"><span className="fl">Assigned To</span>
            <select className="fs" value={fil.assignedTo} onChange={e=>setFil(f=>({...f,assignedTo:e.target.value}))}>
              <option>All</option>{[...new Set(todos.map(t=>t.assignedTo))].map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="fg"><span className="fl">Priority</span>
            <select className="fs" value={fil.priority} onChange={e=>setFil(f=>({...f,priority:e.target.value}))}>
              <option>All</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div className="fg"><span className="fl">Status</span>
            <select className="fs" value={fil.status} onChange={e=>setFil(f=>({...f,status:e.target.value}))}>
              <option>All</option><option>Not Started</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
          <div style={{display:"flex",gap:6,paddingBottom:1}}>
            <button className="btn-p" style={{height:30,padding:"0 12px",fontSize:12}}>{Ic.filter()} Apply</button>
            <button className="btn-s" style={{height:30,padding:"0 10px",fontSize:12}} onClick={()=>setFil({assignedTo:"All",priority:"All",status:"All"})}>{Ic.refresh()} Reset</button>
          </div>
        </div>
      </div>
      <div className="card"><DT cols={cols} data={tdata} empty="No tasks match filters."/></div>
    </div>
  );
}

/* ══════════════════════════════════════
   DOCUMENTS PAGE
══════════════════════════════════════ */
function DocPage({ toast }) {
  const [docs,setDocs]=useState(DOCS);
  const [form,setForm]=useState(false);
  const [file,setFile]=useState(null);
  const [desc,setDesc]=useState("");
  const [cfm,setCfm]=useState(null);
  const [drag,setDrag]=useState(false);
  const ref=useRef();

  const submit=()=>{
    if(!file)return toast("Please choose a file","error");
    setDocs(d=>[...d,{name:file.name,description:desc,uploadedDate:new Date().toLocaleDateString("en-IN"),size:`${(file.size/1048576).toFixed(1)} MB`,type:file.name.split(".").pop().toUpperCase(),_file:file}]);
    setFile(null);setDesc("");setForm(false);toast("Document uploaded");
  };
  const dl=(d,i)=>{
    if(d._file){const a=document.createElement("a");a.href=URL.createObjectURL(d._file);a.download=d.name;a.click();}
    else toast(`Downloading ${d.name}…`);
  };

  const cols=[
    {key:"name",label:"File Name"},{key:"description",label:"Description"},
    {key:"type",label:"Type"},{key:"size",label:"Size"},{key:"uploadedDate",label:"Uploaded"},{key:"actions",label:"Actions"},
  ];
  const tdata=docs.map((d,i)=>({
    ...d,
    actions:<AB
      onView={()=>toast(`Opening ${d.name}…`)}
      onDl={()=>dl(d,i)}
      onDel={()=>setCfm({msg:`Delete "${d.name}"?`,onOk:()=>{setDocs(ds=>ds.filter((_,j)=>j!==i));toast("Document deleted");setCfm(null);}})}
    />,
  }));

  return (
    <div>
      {cfm&&<Confirm {...cfm} onNo={()=>setCfm(null)}/>}
      <div className="ph">
        <div><div className="pt">Documents</div><div className="ps">Manage shared files and attachments</div></div>
        <button className="btn-p" onClick={()=>setForm(v=>!v)}>{Ic.upload()} Upload Document</button>
      </div>
      {form&&(
        <div className="card cb" style={{marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:13,color:G[900]}}>Upload New Document</div>
          <div className="fg2">
            <label className="lbl">File <span className="rq">*</span></label>
            <input type="file" ref={ref} style={{display:"none"}} onChange={e=>setFile(e.target.files[0])}/>
            <div className={`uz${drag?" ov":""}`}
              onClick={()=>ref.current.click()}
              onDragOver={e=>{e.preventDefault();setDrag(true);}}
              onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)setFile(f);}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div style={{fontSize:13.5,color:file?G[900]:G[500]}}>{file?<strong>{file.name}</strong>:"Click to browse or drag & drop"}</div>
              <div style={{fontSize:12,color:G[400],marginTop:3}}>PDF, CSV, XLSX, DOCX, ZIP, JPG, PNG</div>
            </div>
          </div>
          <div className="fg2"><label className="lbl">Description</label><textarea className="inp ta" rows={3} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Brief description…"/></div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-p" onClick={submit}>{Ic.upload()} Upload</button>
            <button className="btn-s" onClick={()=>{setForm(false);setFile(null);setDesc("");}}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card"><DT cols={cols} data={tdata}/></div>
    </div>
  );
}

/* ══════════════════════════════════════
   MEMOS PAGE
══════════════════════════════════════ */
function MemosPage({ toast }) {
  const [memos,setMemos]=useState(MEMOS);
  const [modal,setModal]=useState(false);
  const [editIdx,setEditIdx]=useState(null);
  const [view,setView]=useState(null);
  const [cfm,setCfm]=useState(null);
  const blank={heading:"",desc:""};
  const [form,setForm]=useState(blank);

  const save=()=>{
    if(!form.heading.trim())return toast("Heading is required","error");
    const now=new Date().toLocaleDateString("en-IN");
    if(editIdx!==null){setMemos(ms=>ms.map((m,i)=>i===editIdx?{...m,heading:form.heading,description:form.desc,createdDate:now}:m));toast("Memo updated");}
    else{setMemos(ms=>[...ms,{heading:form.heading,description:form.desc,createdDate:now}]);toast("Memo added");}
    setModal(false);
  };

  const cols=[{key:"heading",label:"Heading"},{key:"description",label:"Content"},{key:"createdDate",label:"Date"},{key:"actions",label:"Actions"}];
  const tdata=memos.map((m,i)=>({
    ...m,
    actions:<AB
      onView={()=>setView(m)}
      onEdit={()=>{setForm({heading:m.heading,desc:m.description});setEditIdx(i);setModal(true);}}
      onDel={()=>setCfm({msg:`Delete "${m.heading}"?`,onOk:()=>{setMemos(ms=>ms.filter((_,j)=>j!==i));toast("Memo deleted");setCfm(null);}})}
    />,
  }));

  return (
    <div>
      {cfm&&<Confirm {...cfm} onNo={()=>setCfm(null)}/>}
      {view&&(<VM title={view.heading} onClose={()=>setView(null)}><p style={{fontSize:13.5,color:G[700],lineHeight:1.8}}>{view.description}</p><p style={{fontSize:12,color:G[400],marginTop:10}}>Created: {view.createdDate}</p></VM>)}
      {modal&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mb">
            <div className="mh"><div className="mt">{editIdx!==null?"Edit Memo":"Add Memo"}</div><button className="mc" onClick={()=>setModal(false)}>{Ic.x()}</button></div>
            <div className="mbdy">
              <div className="fg2"><label className="lbl">Heading <span className="rq">*</span></label><input className="inp" value={form.heading} onChange={e=>setForm(f=>({...f,heading:e.target.value}))} placeholder="Memo heading"/></div>
              <div className="fg2"><label className="lbl">Content</label><RT val={form.desc} onChange={v=>setForm(f=>({...f,desc:v}))}/></div>
            </div>
            <div className="mft"><button className="btn-s" onClick={()=>setModal(false)}>Cancel</button><button className="btn-p" onClick={save}>{Ic.check()} {editIdx!==null?"Update":"Save"}</button></div>
          </div>
        </div>
      )}
      <div className="ph">
        <div><div className="pt">Memos</div><div className="ps">Internal announcements and notices</div></div>
        <button className="btn-p" onClick={()=>{setForm(blank);setEditIdx(null);setModal(true);}}>{Ic.plus()} Add Memo</button>
      </div>
      <div className="card"><DT cols={cols} data={tdata}/></div>
    </div>
  );
}

/* ══════════════════════════════════════
   REMINDERS PAGE
══════════════════════════════════════ */
function RemindersPage({ toast }) {
  const [events,setEvents]=useState(EVENTS);
  const [modal,setModal]=useState(false);
  const [cfm,setCfm]=useState(null);
  const today=new Date();
  const [cur,setCur]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const blank={name:"",repeat:"One time",date:"",startTime:"",endTime:""};
  const [form,setForm]=useState(blank);
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const yr=cur.getFullYear(),mo=cur.getMonth();
  const fd=new Date(yr,mo,1).getDay(),di=new Date(yr,mo+1,0).getDate();
  const cells=[...Array(fd).fill(null),...Array.from({length:di},(_,i)=>i+1)];

  const save=()=>{
    if(!form.name.trim()||!form.date)return toast("Name and date are required","error");
    setEvents(es=>[...es,form]);toast("Reminder added");setModal(false);
  };

  return (
    <div>
      {cfm&&<Confirm {...cfm} onNo={()=>setCfm(null)}/>}
      {modal&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mb" style={{maxWidth:430}}>
            <div className="mh"><div className="mt">Add Reminder</div><button className="mc" onClick={()=>setModal(false)}>{Ic.x()}</button></div>
            <div className="mbdy">
              <div className="fg2"><label className="lbl">Event Name <span className="rq">*</span></label><input className="inp" value={form.name} onChange={s("name")} placeholder="e.g. Monthly Payroll Run"/></div>
              <div className="fr">
                <div className="fg2"><label className="lbl">Repeat</label><select className="inp" value={form.repeat} onChange={s("repeat")}><option>One time</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
                <div className="fg2"><label className="lbl">Date <span className="rq">*</span></label><input className="inp" type="date" value={form.date} onChange={s("date")}/></div>
              </div>
              <div className="fr">
                <div className="fg2"><label className="lbl">Start Time</label><input className="inp" type="time" value={form.startTime} onChange={s("startTime")}/></div>
                <div className="fg2"><label className="lbl">End Time</label><input className="inp" type="time" value={form.endTime} onChange={s("endTime")}/></div>
              </div>
            </div>
            <div className="mft"><button className="btn-s" onClick={()=>setModal(false)}>Cancel</button><button className="btn-p" onClick={save}>{Ic.check()} Save Reminder</button></div>
          </div>
        </div>
      )}
      <div className="ph">
        <div><div className="pt">Reminders</div><div className="ps">{events.length} scheduled events</div></div>
        <button className="btn-p" onClick={()=>{setForm(blank);setModal(true);}}>{Ic.plus()} Add Reminder</button>
      </div>
      <div className="card cb" style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <button className="btn-s" style={{height:28,padding:"0 9px"}} onClick={()=>setCur(new Date(yr,mo-1,1))}>{Ic.chevL()}</button>
          <button className="btn-s" style={{height:28,padding:"0 9px",fontSize:11.5}} onClick={()=>setCur(new Date(today.getFullYear(),today.getMonth(),1))}>Today</button>
          <button className="btn-s" style={{height:28,padding:"0 9px"}} onClick={()=>setCur(new Date(yr,mo+1,1))}>{Ic.chevR()}</button>
          <span style={{fontWeight:700,fontSize:14.5,color:P}}>{cur.toLocaleString("default",{month:"long"})} {yr}</span>
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <div className="cg">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="chc">{d}</div>)}
            {cells.map((d,i)=>{
              const isTd=d===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear();
              const evs=events.filter(ev=>{if(!ev.date||!d)return false;const ed=new Date(ev.date);return ed.getDate()===d&&ed.getMonth()===mo&&ed.getFullYear()===yr;});
              return(
                <div key={i} className={`cc${d===null?" emp":""}${isTd?" td":""}`}>
                  {d&&<div className="cn">{d}</div>}
                  {evs.map((ev,ei)=><div key={ei} className="ce" style={{background:EC[ei%EC.length]}} title={`${ev.name} ${ev.startTime}–${ev.endTime}`}>{ev.startTime} {ev.name}</div>)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="card cb">
        <div style={{fontWeight:700,fontSize:13.5,marginBottom:11,color:G[900]}}>All Events</div>
        {events.map((ev,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${G[100]}`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:EC[i%EC.length],flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13.5,color:G[900]}}>{ev.name}</div>
              <div style={{fontSize:11.5,color:G[400]}}>{ev.date} · {ev.startTime}{ev.endTime?`–${ev.endTime}`:""} · {ev.repeat}</div>
            </div>
            <button className="ab r" onClick={()=>setCfm({msg:`Delete "${ev.name}"?`,onOk:()=>{setEvents(es=>es.filter((_,j)=>j!==i));toast("Event deleted");setCfm(null);}})}>
              {Ic.trash()} Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MESSAGES PAGE  — matches screenshot exactly
══════════════════════════════════════ */
function MessagesPage() {
  const contacts=["Admin","Priya S.","Rahul M.","Ananya K."];
  const [active,setActive]=useState("Admin");
  const [allMsgs,setAllMsgs]=useState(MSGS_INIT);
  const [input,setInput]=useState("");
  const endRef=useRef();

  const msgs=allMsgs[active]||[];
  const send=()=>{
    if(!input.trim())return;
    const t=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setAllMsgs(m=>({...m,[active]:[...(m[active]||[]),{text:input,time:t,from:"me"}]}));
    setInput("");
  };
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  return (
    <div>
      <div className="ph"><div><div className="pt">Messages</div><div className="ps">Internal team chat</div></div></div>
      <div className="msg-shell">
        {/* Contact tabs at top — exactly like screenshot */}
        <div className="msg-contacts">
          {contacts.map(c=>(
            <button key={c} className={`msg-contact-btn${active===c?" on":""}`} onClick={()=>setActive(c)}>
              <div className="msg-av">{c[0]}</div>
              {c}
            </button>
          ))}
        </div>
        {/* Chat area */}
        <div className="msg-chat">
          {msgs.map((m,i)=>(
            <div key={i} className={`msg-row ${m.from}`}>
              <div className={`msg-bbl ${m.from}`}>{m.text}</div>
              <div className="msg-time">{m.time}</div>
            </div>
          ))}
          {msgs.length===0&&(
            <div style={{textAlign:"center",color:G[400],marginTop:60,fontSize:14}}>No messages yet. Say hello!</div>
          )}
          <div ref={endRef}/>
        </div>
        {/* Input bar */}
        <div className="msg-input-bar">
          <input className="msg-inp" placeholder="Type a message…" value={input}
            onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
          <button className="msg-send" onClick={send}>{Ic.send(15)}</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   KNOWLEDGE BASE
══════════════════════════════════════ */
function KBPage({ toast }) {
  const [arts,setArts]=useState(KB);
  const [form,setForm]=useState(false);
  const [editIdx,setEditIdx]=useState(null);
  const [view,setView]=useState(null);
  const [cfm,setCfm]=useState(null);
  const [q,setQ]=useState("");
  const blank={title:"",content:"",share:"Public"};
  const [fd,setFd]=useState(blank);

  const save=()=>{
    if(!fd.title.trim())return toast("Title is required","error");
    const now=new Date().toLocaleDateString("en-IN");
    if(editIdx!==null){setArts(as=>as.map((a,i)=>i===editIdx?{...a,...fd,date:now}:a));toast("Article updated");}
    else{setArts(as=>[...as,{...fd,date:now}]);toast("Article published");}
    setForm(false);
  };

  const fil=arts.filter(a=>a.title.toLowerCase().includes(q.toLowerCase())||a.content.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      {cfm&&<Confirm {...cfm} onNo={()=>setCfm(null)}/>}
      {view&&(
        <VM title={view.title} onClose={()=>setView(null)}>
          <div style={{display:"flex",gap:8,marginBottom:11,alignItems:"center"}}><ShBadge v={view.share}/><span style={{fontSize:11.5,color:G[400]}}>Published {view.date}</span></div>
          <p style={{fontSize:13.5,color:G[700],lineHeight:1.8}}>{view.content}</p>
        </VM>
      )}
      <div className="ph">
        <div><div className="pt">Knowledge Base</div><div className="ps">{arts.length} articles</div></div>
        <button className="btn-p" onClick={()=>{setFd(blank);setEditIdx(null);setForm(v=>!v);}}>{Ic.plus()} Add Article</button>
      </div>
      {form&&(
        <div className="card cb" style={{marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:13}}>New Article</div>
          <div className="fg2"><label className="lbl">Title <span className="rq">*</span></label><input className="inp" value={fd.title} onChange={e=>setFd(f=>({...f,title:e.target.value}))} placeholder="Article title"/></div>
          <div className="fg2"><label className="lbl">Content</label><RT val={fd.content} onChange={v=>setFd(f=>({...f,content:v}))}/></div>
          <div className="fg2" style={{maxWidth:170}}><label className="lbl">Visibility</label><select className="inp" value={fd.share} onChange={e=>setFd(f=>({...f,share:e.target.value}))}><option>Public</option><option>Private</option><option>Team</option></select></div>
          <div style={{display:"flex",gap:8}}><button className="btn-p" onClick={save}>{Ic.check()} Publish</button><button className="btn-s" onClick={()=>setForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card cb" style={{marginBottom:10}}>
        <div style={{position:"relative",maxWidth:320}}>
          <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:G[400],pointerEvents:"none"}}>{Ic.search()}</span>
          <input style={{width:"100%",height:32,padding:"0 10px 0 28px",border:`1px solid ${G[200]}`,borderRadius:6,fontFamily:F,fontSize:12.5,outline:"none",color:G[900]}} placeholder="Search articles…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      {fil.length===0
        ?<div className="card cb" style={{textAlign:"center",color:G[400],padding:36}}>No articles found.</div>
        :fil.map((a,i)=>(
          <div key={i} className="kbc">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:G[900],marginBottom:4}}>{a.title}</div>
                <div style={{fontSize:13,color:G[500],lineHeight:1.6,marginBottom:7}}>{a.content.length>140?a.content.slice(0,140)+"…":a.content}</div>
                <div style={{display:"flex",gap:7,alignItems:"center"}}><ShBadge v={a.share}/><span style={{fontSize:11,color:G[400]}}>Published {a.date}</span></div>
              </div>
              <AB
                onView={()=>setView(a)}
                onEdit={()=>{setFd({title:a.title,content:a.content,share:a.share});setEditIdx(arts.indexOf(a));setForm(true);}}
                onDel={()=>setCfm({msg:`Delete "${a.title}"?`,onOk:()=>{setArts(as=>as.filter((_,j)=>j!==arts.indexOf(a)));toast("Article deleted");setCfm(null);}})}
              />
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ══════════════════════════════════════
   SETTINGS PAGE
══════════════════════════════════════ */
function SettingsPage({ toast }) {
  const [tab,setTab]=useState("Leave");
  const [form,setForm]=useState({leavePrefix:"LEV-2026-",maxDays:12,autoAfter:3,autoApproval:false,leaveInstr:"All leave applications must be submitted at least 48 hours in advance.",payrollCycle:"Monthly",payrollDate:28,currency:"INR (₹)",workStart:"09:00",workEnd:"18:00",grace:15});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value}));
  const tabs=["Leave","Payroll","Attendance","Sales Targets","Essentials"];
  return (
    <div>
      <div className="ph"><div><div className="pt">Settings</div><div className="ps">Essentials &amp; HRM module configuration</div></div></div>
      <div className="card" style={{display:"flex",overflow:"hidden"}}>
        <div className="snav">
          {tabs.map(t=><div key={t} className={`sni${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>)}
        </div>
        <div style={{flex:1,padding:20}}>
          {tab==="Leave"&&(<>
            <div style={{fontWeight:700,fontSize:14.5,marginBottom:16,color:G[900]}}>Leave Settings</div>
            <div className="fg2" style={{maxWidth:270}}><label className="lbl">Leave Reference Prefix</label><input className="inp" value={form.leavePrefix} onChange={s("leavePrefix")}/></div>
            <div className="fr" style={{maxWidth:360}}>
              <div className="fg2"><label className="lbl">Max Casual Leave / Year</label><input className="inp" type="number" value={form.maxDays} onChange={s("maxDays")}/></div>
              <div className="fg2"><label className="lbl">Auto-Approve After (days)</label><input className="inp" type="number" value={form.autoAfter} onChange={s("autoAfter")}/></div>
            </div>
            <div className="fg2"><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={form.autoApproval} onChange={s("autoApproval")}/><span className="lbl" style={{margin:0}}>Enable Auto Approval</span></label></div>
            <div className="fg2"><label className="lbl">Leave Application Instructions</label><RT val={form.leaveInstr} onChange={v=>setForm(f=>({...f,leaveInstr:v}))} rows={4}/></div>
          </>)}
          {tab==="Payroll"&&(<>
            <div style={{fontWeight:700,fontSize:14.5,marginBottom:16,color:G[900]}}>Payroll Settings</div>
            <div className="fg2" style={{maxWidth:230}}><label className="lbl">Payroll Cycle</label><select className="inp" value={form.payrollCycle} onChange={s("payrollCycle")}><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select></div>
            <div className="fg2" style={{maxWidth:170}}><label className="lbl">Processing Date (day of month)</label><input className="inp" type="number" value={form.payrollDate} onChange={s("payrollDate")} min={1} max={31}/></div>
            <div className="fg2" style={{maxWidth:230}}><label className="lbl">Default Currency</label><select className="inp" value={form.currency} onChange={s("currency")}><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select></div>
          </>)}
          {tab==="Attendance"&&(<>
            <div style={{fontWeight:700,fontSize:14.5,marginBottom:16,color:G[900]}}>Attendance Settings</div>
            <div className="fr" style={{maxWidth:360}}>
              <div className="fg2"><label className="lbl">Work Start Time</label><input className="inp" type="time" value={form.workStart} onChange={s("workStart")}/></div>
              <div className="fg2"><label className="lbl">Work End Time</label><input className="inp" type="time" value={form.workEnd} onChange={s("workEnd")}/></div>
            </div>
            <div className="fg2" style={{maxWidth:170}}><label className="lbl">Late Arrival Grace (minutes)</label><input className="inp" type="number" value={form.grace} onChange={s("grace")}/></div>
          </>)}
          {(tab==="Sales Targets"||tab==="Essentials")&&<div style={{color:G[400],fontSize:13.5,padding:"16px 0"}}>{tab} settings — configure as needed for your organisation.</div>}
          <div style={{marginTop:18}}><button className="btn-p" onClick={()=>toast("Settings saved")}>{Ic.check()} Save Changes</button></div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:11,color:G[400],marginTop:10}}>Essentials &amp; HRM · Version 5.1</div>
    </div>
  );
}

/* ══════════════════════════════════════
   ROOT
══════════════════════════════════════ */
const TABS=[
  {id:"Essentials",     label:"Essentials"    },
  {id:"To Do",          label:"To Do"         },
  {id:"Document",       label:"Document"      },
  {id:"Memos",          label:"Memos"         },
  {id:"Reminders",      label:"Reminders"     },
  {id:"Messages",       label:"Messages"      },
  {id:"Knowledge Base", label:"Knowledge Base"},
  {id:"Settings",       label:"Settings"      },
];

export default function App() {
  injectStyles();
  const [tab,setTab]=useState("Essentials");
  const {list,show}=useToast();
  const [todos]=useState(TODOS);
  const [docs]=useState(DOCS);
  const [memos]=useState(MEMOS);
  const [events]=useState(EVENTS);
  const [kb]=useState(KB);

  return (
    <div className="root">
      <Toasts list={list}/>
      {/* Header */}
      <div style={{background:W,borderBottom:`1px solid ${G[200]}`,padding:"7px 18px 0"}}>
        <div style={{fontSize:10.5,color:G[400],fontWeight:500,letterSpacing:".04em",marginBottom:1}}>ERP · Essentials</div>
        <nav className="top-nav" style={{padding:0}}>
          {TABS.map(t=>(
            <button key={t.id} className={`top-tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
      </div>
      {/* Page */}
      <div className="page">
        {tab==="Essentials"    &&<HomePage setTab={setTab} counts={{todos:todos.length,docs:docs.length,memos:memos.length,events:events.length,msgs:Object.keys(MSGS_INIT).length,kb:kb.length}}/>}
        {tab==="To Do"         &&<TodoPage     toast={show}/>}
        {tab==="Document"      &&<DocPage      toast={show}/>}
        {tab==="Memos"         &&<MemosPage    toast={show}/>}
        {tab==="Reminders"     &&<RemindersPage toast={show}/>}
        {tab==="Messages"      &&<MessagesPage/>}
        {tab==="Knowledge Base"&&<KBPage       toast={show}/>}
        {tab==="Settings"      &&<SettingsPage toast={show}/>}
      </div>
    </div>
  );
}
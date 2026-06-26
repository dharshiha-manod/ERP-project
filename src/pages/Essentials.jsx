import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────
   STYLES  – injected once into <head>
───────────────────────────────────────── */
let _injected = false;
function injectStyles() {
  if (_injected) return;
  _injected = true;
  const el = document.createElement("style");
  el.textContent = `
    /* Google Font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* Reset scoped to .ess */
    .ess *, .ess *::before, .ess *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .ess { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; color: #334155; }

    /* ── TAB NAV ── */
    .ess-nav { display: flex; align-items: center; gap: 2px; border-bottom: 1px solid #e2e8f0;
               background: #fff; padding: 0 4px; overflow-x: auto; }
    .ess-nav::-webkit-scrollbar { height: 3px; }
    .ess-nav::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
    .ess-tab { padding: 13px 14px; font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer;
               border: none; background: none; border-bottom: 2px solid transparent;
               margin-bottom: -1px; white-space: nowrap; transition: color .15s; font-family: inherit; }
    .ess-tab:hover { color: #1a6b3c; }
    .ess-tab.on { color: #1a6b3c; border-bottom-color: #1a6b3c; font-weight: 600; }

    /* ── PAGE AREA ── */
    .ess-page { padding: 22px 20px; }

    /* ── DASHBOARD CARDS ── */
    .ess-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    @media(max-width:700px){ .ess-grid { grid-template-columns: 1fr 1fr; } }
    @media(max-width:440px){ .ess-grid { grid-template-columns: 1fr; } }
    .ess-dcard { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
                 padding: 24px 22px; cursor: pointer; transition: all .18s; }
    .ess-dcard:hover { border-color: #bbf7d0; box-shadow: 0 6px 20px rgba(26,107,60,.10);
                       transform: translateY(-2px); }
    .ess-dicon { width: 50px; height: 50px; border-radius: 13px; display: flex;
                 align-items: center; justify-content: center; margin-bottom: 15px; }
    .ess-dname { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .ess-dcount { font-size: 13px; font-weight: 600; }

    /* ── PAGE HEADER ── */
    .ess-ph { display: flex; justify-content: space-between; align-items: flex-start;
              margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
    .ess-pt { font-size: 19px; font-weight: 700; color: #0f172a; letter-spacing: -.02em; }
    .ess-ps { font-size: 13px; color: #94a3b8; margin-top: 3px; }

    /* ── CARD ── */
    .ess-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; }
    .ess-cb   { padding: 18px 20px; }

    /* ── BUTTONS ── */
    .ess-btn { height: 36px; padding: 0 15px; border-radius: 7px; font-size: 13px; font-weight: 600;
               cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
               font-family: inherit; transition: all .15s; border: none; }
    .ess-btn-p { background: #1a6b3c; color: #fff; }
    .ess-btn-p:hover { background: #145a32; box-shadow: 0 4px 12px rgba(26,107,60,.28); }
    .ess-btn-s { background: #fff; color: #334155; border: 1px solid #cbd5e1; }
    .ess-btn-s:hover { background: #f8fafc; }
    .ess-btn-d { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
    .ess-btn-d:hover { background: #fee2e2; }

    /* ── ACTION ICON BUTTONS  (eye=blue  pencil=amber  trash=red) ── */
    .ess-acts { display: flex; align-items: center; gap: 4px; }
    .ess-ai { width: 30px; height: 30px; border-radius: 6px; border: none; cursor: pointer;
              display: inline-flex; align-items: center; justify-content: center; transition: all .15s; }
    .ess-ai-v { background: #eff6ff; color: #3b82f6; }
    .ess-ai-e { background: #fffbeb; color: #f59e0b; }
    .ess-ai-d { background: #fef2f2; color: #ef4444; }
    .ess-ai:hover { opacity: .8; transform: translateY(-1px); }

    /* ── EXPORT BAR ── */
    .ess-expbar { display: flex; gap: 5px; flex-wrap: wrap; }
    .ess-eb { height: 29px; padding: 0 10px; border: 1px solid #e2e8f0; background: #fff;
              border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;
              font-family: inherit; color: #334155; display: inline-flex; align-items: center;
              gap: 4px; transition: .12s; }
    .ess-eb:hover { background: #f8fafc; }
    .ess-eb-g { color: #1a6b3c; border-color: #bbf7d0; }
    .ess-eb-r { color: #ef4444; border-color: #fecaca; }

    /* ── TABLE ── */
    .ess-twrap { overflow-x: auto; }
    .ess-tbl { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px; }
    .ess-tbl th { background: #f8fafc; color: #64748b; font-weight: 600; padding: 10px 13px;
                  text-align: left; border-bottom: 1px solid #e2e8f0; white-space: nowrap;
                  font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; }
    .ess-tbl td { padding: 10px 13px; border-bottom: 1px solid #f1f5f9; color: #334155;
                  vertical-align: middle; }
    .ess-tbl tr:last-child td { border-bottom: none; }
    .ess-tbl tbody tr:hover td { background: #f0faf4; }
    .ess-nd { text-align: center; color: #94a3b8; padding: 40px; font-size: 13.5px; }

    /* ── TABLE TOOLBAR ── */
    .ess-ttop { display: flex; justify-content: space-between; align-items: center;
                flex-wrap: wrap; gap: 10px; padding: 12px 18px; border-bottom: 1px solid #f1f5f9; }
    .ess-show { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #64748b; }
    .ess-show select { border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px;
                       font-family: inherit; font-size: 12.5px; }
    .ess-srch { height: 31px; padding: 0 10px 0 30px; border: 1px solid #e2e8f0; border-radius: 7px;
                font-family: inherit; font-size: 13px; width: 185px; outline: none; transition: .15s;
                background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 8px center; }
    .ess-srch:focus { border-color: #1a6b3c; box-shadow: 0 0 0 3px rgba(26,107,60,.09); outline: none; }

    /* ── PAGINATION ── */
    .ess-pag { display: flex; justify-content: space-between; align-items: center;
               padding: 10px 18px; font-size: 12.5px; color: #64748b; border-top: 1px solid #f1f5f9; }
    .ess-pbtns { display: flex; gap: 4px; }
    .ess-pb { height: 27px; min-width: 27px; padding: 0 7px; border: 1px solid #e2e8f0;
              background: #fff; border-radius: 5px; font-size: 12px; cursor: pointer;
              font-family: inherit; color: #334155; transition: .12s; }
    .ess-pb:hover:not(:disabled) { background: #f8fafc; }
    .ess-pb.on { background: #1a6b3c; color: #fff; border-color: #1a6b3c; }
    .ess-pb:disabled { opacity: .35; cursor: not-allowed; }

    /* ── BADGES ── */
    .ess-bk { padding: 3px 9px; border-radius: 20px; font-size: 11.5px; font-weight: 600;
              display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
    .ess-bk::before { content: ''; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
    .bhi { background: #fef2f2; color: #dc2626; } .bhi::before { background: #dc2626; }
    .bme { background: #fffbeb; color: #d97706; } .bme::before { background: #d97706; }
    .blo { background: #eff6ff; color: #2563eb; } .blo::before { background: #2563eb; }
    .bdn { background: #f0fdf4; color: #16a34a; } .bdn::before { background: #16a34a; }
    .bpr { background: #eff6ff; color: #2563eb; } .bpr::before { background: #2563eb; }
    .bwt { background: #f1f5f9; color: #64748b; } .bwt::before { background: #94a3b8; }
    .bpu { background: #f0fdf4; color: #16a34a; } .bpu::before { background: #16a34a; }
    .bpv { background: #fef2f2; color: #dc2626; } .bpv::before { background: #dc2626; }
    .btm { background: #f5f3ff; color: #7c3aed; } .btm::before { background: #7c3aed; }

    /* ── FILTER BAR ── */
    .ess-fbar { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
                padding: 12px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .ess-fg  { display: flex; flex-direction: column; gap: 4px; }
    .ess-fl  { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
    .ess-fs  { height: 31px; padding: 0 9px; border: 1px solid #e2e8f0; border-radius: 6px;
               font-family: inherit; font-size: 12.5px; color: #334155; background: #fff;
               outline: none; min-width: 120px; }
    .ess-fs:focus { border-color: #1a6b3c; }

    /* ── MODAL ── */
    .ess-ov { position: fixed; inset: 0; background: rgba(15,23,42,.52); z-index: 9999;
              display: flex; align-items: center; justify-content: center;
              backdrop-filter: blur(2px); animation: essfi .15s; }
    @keyframes essfi { from { opacity: 0; } to { opacity: 1; } }
    .ess-mb { background: #fff; border-radius: 14px; width: 560px; max-width: 96vw;
              max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,.18);
              animation: esssu .18s; }
    @keyframes esssu { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .ess-mh   { display: flex; justify-content: space-between; align-items: center; padding: 20px 22px 0; }
    .ess-mt   { font-size: 17px; font-weight: 700; color: #0f172a; }
    .ess-mc   { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e2e8f0;
                background: #fff; cursor: pointer; font-size: 15px; display: flex;
                align-items: center; justify-content: center; color: #94a3b8; transition: .12s; }
    .ess-mc:hover { background: #f1f5f9; }
    .ess-mbody { padding: 18px 22px; }
    .ess-mfoot { display: flex; justify-content: flex-end; gap: 9px; padding: 14px 22px;
                 border-top: 1px solid #f1f5f9; background: #f8fafc;
                 border-radius: 0 0 14px 14px; }

    /* ── FORM ── */
    .ess-fg2  { margin-bottom: 14px; }
    .ess-lbl  { font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 5px; display: block; }
    .ess-req  { color: #ef4444; }
    .ess-fc   { width: 100%; height: 37px; padding: 0 11px; border: 1px solid #e2e8f0;
                border-radius: 7px; font-family: inherit; font-size: 13.5px; color: #0f172a;
                background: #fff; outline: none; transition: .15s; }
    .ess-fc:focus { border-color: #1a6b3c; box-shadow: 0 0 0 3px rgba(26,107,60,.09); }
    .ess-fta  { height: auto; padding: 9px 11px; resize: vertical; line-height: 1.5; }
    .ess-frow { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    /* ── RICH TEXT ── */
    .ess-rtbar { border: 1px solid #e2e8f0; border-radius: 7px 7px 0 0; background: #f8fafc;
                 padding: 6px 9px; display: flex; gap: 4px; }
    .ess-rtb  { width: 26px; height: 24px; border: 1px solid #e2e8f0; background: #fff;
                border-radius: 4px; font-size: 11.5px; cursor: pointer; display: flex;
                align-items: center; justify-content: center; transition: .12s; }
    .ess-rtb:hover { background: #f1f5f9; }
    .ess-rta  { border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 7px 7px;
                min-height: 100px; padding: 10px 11px; font-family: inherit; font-size: 13px;
                width: 100%; resize: vertical; outline: none; transition: .15s; color: #0f172a; }
    .ess-rta:focus { border-color: #1a6b3c; box-shadow: 0 0 0 3px rgba(26,107,60,.08); }

    /* ── UPLOAD ZONE ── */
    .ess-uz { border: 2px dashed #e2e8f0; border-radius: 10px; padding: 26px;
              text-align: center; cursor: pointer; transition: .15s; }
    .ess-uz:hover, .ess-uz.over { border-color: #1a6b3c; background: #f0faf4; }

    /* ── TOAST ── */
    .ess-twr { position: fixed; bottom: 22px; right: 22px; z-index: 99999;
               display: flex; flex-direction: column; gap: 7px; pointer-events: none; }
    .ess-toast { background: #0f172a; color: #fff; padding: 10px 16px; border-radius: 9px;
                 font-size: 13.5px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,.18);
                 animation: essti .2s; display: flex; align-items: center; gap: 7px; }
    .ess-toast.s { background: #1a6b3c; }
    .ess-toast.e { background: #ef4444; }
    @keyframes essti { from { transform: translateX(36px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* ── CONFIRM ── */
    .ess-cfm { background: #fff; border-radius: 12px; padding: 24px;
               width: 360px; max-width: 95vw; text-align: center; }

    /* ── CALENDAR ── */
    .ess-calgrid { display: grid; grid-template-columns: repeat(7,1fr); }
    .ess-calh  { text-align: center; font-weight: 600; font-size: 11px; color: #94a3b8;
                 padding: 9px 0; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #e2e8f0;
                 text-transform: uppercase; letter-spacing: .04em; }
    .ess-calc  { min-height: 82px; border-right: 1px solid #f1f5f9;
                 border-bottom: 1px solid #f1f5f9; padding: 5px 7px; }
    .ess-calc.em { background: #f8fafc; }
    .ess-calc.td { background: #f0fdf4; }
    .ess-cnum  { font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 3px; }
    .ess-calc.td .ess-cnum { background: #1a6b3c; color: #fff; border-radius: 50%;
                              width: 20px; height: 20px; display: flex; align-items: center;
                              justify-content: center; font-size: 11px; }
    .ess-cev   { border-radius: 3px; padding: 2px 5px; font-size: 10px; margin-top: 2px;
                 white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                 color: #fff; font-weight: 500; }

    /* ── MESSAGES ── */
    .ess-mlist { min-height: 280px; max-height: 360px; overflow-y: auto; padding: 16px;
                 display: flex; flex-direction: column; gap: 9px; }
    .ess-bbl   { max-width: 72%; padding: 9px 13px; border-radius: 12px;
                 font-size: 13.5px; line-height: 1.5; }
    .ess-bbl.me   { background: #1a6b3c; color: #fff; align-self: flex-end; border-bottom-right-radius: 3px; }
    .ess-bbl.them { background: #f1f5f9; color: #334155; align-self: flex-start; border-bottom-left-radius: 3px; }
    .ess-btime { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .ess-minrow { display: flex; gap: 8px; padding: 11px 16px; border-top: 1px solid #f1f5f9; }
    .ess-minin  { flex: 1; height: 38px; padding: 0 13px; border: 1px solid #e2e8f0;
                  border-radius: 8px; font-family: inherit; font-size: 13.5px; outline: none; transition: .15s; }
    .ess-minin:focus { border-color: #1a6b3c; box-shadow: 0 0 0 3px rgba(26,107,60,.09); }

    /* ── KB CARDS ── */
    .ess-kbc { border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px 17px;
               margin-bottom: 9px; transition: .15s; background: #fff; }
    .ess-kbc:hover { border-color: #bbf7d0; box-shadow: 0 4px 12px rgba(26,107,60,.07); }

    /* ── SETTINGS NAV ── */
    .ess-snav { width: 155px; flex-shrink: 0; padding: 8px; border-right: 1px solid #e2e8f0; }
    .ess-sni  { padding: 9px 11px; border-radius: 7px; cursor: pointer; font-size: 13px;
                font-weight: 500; color: #64748b; transition: .12s; margin-bottom: 2px; }
    .ess-sni:hover { background: #f1f5f9; }
    .ess-sni.on { background: #f0faf4; color: #1a6b3c; font-weight: 600; }
  `;
  document.head.appendChild(el);
}

/* ─── SVG Icons (no emojis anywhere) ─── */
const Icon = {
  eye:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  dl:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  send:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  plus:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  up:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  todo:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a6b3c" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  doc:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  memo:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  cal:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chat:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  book:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a21caf" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  gear:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

/* ─── Toast hook ─── */
function useToast() {
  const [ts, setTs] = useState([]);
  const show = (msg, type = "s") => {
    const id = Date.now();
    setTs(t => [...t, { id, msg, type }]);
    setTimeout(() => setTs(t => t.filter(x => x.id !== id)), 2600);
  };
  return { ts, show };
}

/* ─── Confirm dialog ─── */
function Confirm({ msg, onOk, onNo }) {
  return (
    <div className="ess-ov" onClick={e => e.target === e.currentTarget && onNo()}>
      <div className="ess-cfm">
        <div style={{ fontSize: 30, marginBottom: 8, color: "#ef4444" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>Delete this record?</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>{msg}</div>
        <div style={{ display: "flex", gap: 9, justifyContent: "center" }}>
          <button className="ess-btn ess-btn-s" onClick={onNo}>Cancel</button>
          <button className="ess-btn ess-btn-d" onClick={onOk}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Action button group ─── */
function Acts({ onV, onE, onD, onDl }) {
  return (
    <div className="ess-acts">
      {onV  && <button className="ess-ai ess-ai-v" title="View"     onClick={onV}>{Icon.eye}</button>}
      {onE  && <button className="ess-ai ess-ai-e" title="Edit"     onClick={onE}>{Icon.edit}</button>}
      {onD  && <button className="ess-ai ess-ai-d" title="Delete"   onClick={onD}>{Icon.trash}</button>}
      {onDl && <button className="ess-ai ess-ai-v" title="Download" onClick={onDl}>{Icon.dl}</button>}
    </div>
  );
}

/* ─── Export bar ─── */
function ExpBar({ data, cols, name }) {
  const csv = () => {
    if (!data?.length) return;
    const h = cols.map(c => c.l).join(",");
    const r = data.map(d => cols.map(c => `"${String(d[c.k] ?? "").replace(/"/g, '""')}"`).join(","));
    const b = new Blob([[h, ...r].join("\n")], { type: "text/csv" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(b), download: `${name}.csv` }).click();
  };
  const pr = () => {
    const w = window.open("", "_blank");
    const th = cols.map(c => `<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5">${c.l}</th>`).join("");
    const tr = data.map(r => `<tr>${cols.map(c => `<td style="border:1px solid #ddd;padding:8px">${r[c.k] ?? ""}</td>`).join("")}</tr>`).join("");
    w.document.write(`<html><head><title>${name}</title><style>body{font-family:sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}</style></head><body><h2>${name}</h2><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></body></html>`);
    w.print();
  };
  return (
    <div className="ess-expbar">
      <button className="ess-eb ess-eb-g" onClick={csv}>CSV</button>
      <button className="ess-eb ess-eb-g" onClick={csv}>Excel</button>
      <button className="ess-eb ess-eb-r" onClick={pr}>PDF</button>
      <button className="ess-eb" onClick={pr}>Print</button>
    </div>
  );
}

/* ─── Rich text ─── */
function RT({ value, onChange, ph = "Write here…", rows = 5 }) {
  return (
    <>
      <div className="ess-rtbar">
        {["B", "I", "U", "H1", "•", "1."].map(b => <button key={b} className="ess-rtb">{b}</button>)}
      </div>
      <textarea className="ess-rta" value={value} onChange={e => onChange(e.target.value)} placeholder={ph} rows={rows} />
    </>
  );
}

/* ─── Data Table ─── */
function DT({ cols, data, empty = "No records found" }) {
  const [q, setQ] = useState("");
  const [show, setShow] = useState(10);
  const [page, setPage] = useState(1);
  const filt = data.filter(r => cols.some(c => String(r[c.k] ?? "").toLowerCase().includes(q.toLowerCase())));
  const pages = Math.max(1, Math.ceil(filt.length / show));
  const sl = filt.slice((page - 1) * show, page * show);
  const raw = data.map(r => { const x = { ...r }; delete x.actions; return x; });
  return (
    <>
      <div className="ess-ttop">
        <div className="ess-show">
          Show
          <select value={show} onChange={e => { setShow(+e.target.value); setPage(1); }}>
            {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
          </select>
          entries
        </div>
        <ExpBar data={raw} cols={cols.filter(c => c.k !== "actions")} name="export" />
        <input className="ess-srch" placeholder="Search…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
      </div>
      <div className="ess-twrap">
        <table className="ess-tbl">
          <thead><tr>{cols.map(c => <th key={c.k}>{c.l}</th>)}</tr></thead>
          <tbody>
            {sl.length === 0
              ? <tr><td colSpan={cols.length} className="ess-nd">{empty}</td></tr>
              : sl.map((r, i) => <tr key={i}>{cols.map(c => <td key={c.k}>{r[c.k]}</td>)}</tr>)
            }
          </tbody>
        </table>
      </div>
      <div className="ess-pag">
        <span>Showing {sl.length ? (page - 1) * show + 1 : 0}–{Math.min(page * show, filt.length)} of {filt.length}</span>
        <div className="ess-pbtns">
          <button className="ess-pb" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`ess-pb${p === page ? " on" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="ess-pb" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      </div>
    </>
  );
}

/* ─── Badges ─── */
const PBadge  = ({ v }) => { const m = { High: "bhi", Medium: "bme", Low: "blo" };   return <span className={`ess-bk ${m[v] || "bwt"}`}>{v}</span>; };
const SBadge  = ({ v }) => { const m = { Completed: "bdn", "In Progress": "bpr", "Not Started": "bwt" }; return <span className={`ess-bk ${m[v] || "bwt"}`}>{v}</span>; };
const ShBadge = ({ v }) => { const m = { Public: "bpu", Private: "bpv", Team: "btm" }; return <span className={`ess-bk ${m[v] || "bwt"}`}>{v}</span>; };

/* ─── Sample Data ─── */
const I_TODO = [
  { addedOn:"08/06/2026", taskId:"TASK-001", task:"Reconcile Q2 purchase invoices",    status:"In Progress", startDate:"2026-06-01", endDate:"2026-06-10", hours:"6",  assignedBy:"Admin",   assignedTo:"Priya S.",  priority:"High"   },
  { addedOn:"07/06/2026", taskId:"TASK-002", task:"Update product pricing list",        status:"Not Started", startDate:"2026-06-08", endDate:"2026-06-15", hours:"3",  assignedBy:"Admin",   assignedTo:"Rahul M.",  priority:"Medium" },
  { addedOn:"06/06/2026", taskId:"TASK-003", task:"Audit warehouse stock levels",       status:"Completed",   startDate:"2026-06-03", endDate:"2026-06-06", hours:"8",  assignedBy:"Manager", assignedTo:"Ananya K.", priority:"High"   },
  { addedOn:"05/06/2026", taskId:"TASK-004", task:"Send supplier payment reminders",    status:"Completed",   startDate:"2026-06-05", endDate:"2026-06-05", hours:"1",  assignedBy:"Admin",   assignedTo:"Vikram T.", priority:"Low"    },
  { addedOn:"04/06/2026", taskId:"TASK-005", task:"Prepare monthly expense report",     status:"In Progress", startDate:"2026-06-04", endDate:"2026-06-12", hours:"5",  assignedBy:"Admin",   assignedTo:"Priya S.",  priority:"Medium" },
  { addedOn:"03/06/2026", taskId:"TASK-006", task:"Review and approve new sales orders",status:"Not Started", startDate:"2026-06-09", endDate:"2026-06-09", hours:"2",  assignedBy:"Manager", assignedTo:"Rahul M.",  priority:"High"   },
  { addedOn:"02/06/2026", taskId:"TASK-007", task:"Update CRM customer records",        status:"In Progress", startDate:"2026-06-02", endDate:"2026-06-11", hours:"4",  assignedBy:"Admin",   assignedTo:"Deepa R.",  priority:"Low"    },
];
const I_DOC = [
  { name:"Q2_Purchase_Invoice_Bundle.pdf",   description:"All purchase invoices for April–June 2026",  uploadedDate:"07/06/2026", size:"2.4 MB", type:"PDF"   },
  { name:"Warehouse_Audit_Report_June.xlsx", description:"Stock audit results – Main warehouse",       uploadedDate:"06/06/2026", size:"1.1 MB", type:"Excel" },
  { name:"Supplier_Contracts_2026.zip",      description:"Signed contracts with top 10 suppliers",     uploadedDate:"04/06/2026", size:"3.8 MB", type:"ZIP"   },
  { name:"Employee_Onboarding_Docs.pdf",     description:"HR onboarding package for new hires",        uploadedDate:"01/06/2026", size:"0.9 MB", type:"PDF"   },
  { name:"Brand_Guidelines_v3.pdf",          description:"Updated visual brand identity guidelines",    uploadedDate:"28/05/2026", size:"4.2 MB", type:"PDF"   },
  { name:"Tax_Filing_May2026.pdf",           description:"GST and income tax filing for May",          uploadedDate:"20/05/2026", size:"1.6 MB", type:"PDF"   },
];
const I_MEMO = [
  { heading:"New POS Terminal Policy",      description:"All branches must validate receipts via the new POS system from July 1st.", createdDate:"08/06/2026" },
  { heading:"Q3 Sales Target Announcement", description:"The Q3 target has been set at ₹42L across all regions.",                   createdDate:"07/06/2026" },
  { heading:"Inventory Freeze – June 30",   description:"No stock transfers or adjustments to be made on June 30.",                  createdDate:"05/06/2026" },
  { heading:"Office Renovation Schedule",   description:"Head office 2nd floor under renovation June 20–25.",                        createdDate:"03/06/2026" },
  { heading:"Updated Leave Policy",         description:"Casual leave can now be applied 24hrs in advance instead of 48hrs.",        createdDate:"01/06/2026" },
];
const I_EV = [
  { name:"Board Review Meeting",         date:"2026-06-10", startTime:"10:00", endTime:"12:00", repeat:"One time" },
  { name:"Monthly Payroll Run",          date:"2026-06-15", startTime:"09:00", endTime:"10:00", repeat:"Monthly"  },
  { name:"Team Standup",                 date:"2026-06-09", startTime:"09:30", endTime:"09:45", repeat:"Daily"    },
  { name:"Supplier Call – Arjun Traders",date:"2026-06-11", startTime:"14:00", endTime:"15:00", repeat:"One time" },
  { name:"Stock Audit Deadline",         date:"2026-06-20", startTime:"17:00", endTime:"17:00", repeat:"One time" },
  { name:"Q2 Closing",                   date:"2026-06-30", startTime:"18:00", endTime:"18:00", repeat:"Monthly"  },
];
const I_MSG = [
  { text:"Warehouse stock report ready for review.",           time:"09:05 AM", from:"Admin" },
  { text:"Please check the new supplier invoice in Documents.",time:"09:18 AM", from:"Admin" },
  { text:"Stock audit completed – no discrepancies found.",    time:"10:30 AM", from:"me"    },
  { text:"Q2 targets updated in the sales dashboard.",         time:"11:00 AM", from:"me"    },
  { text:"Reminder: team meeting at 3 PM today.",              time:"02:45 PM", from:"Admin" },
];
const I_KB = [
  { title:"How to Process a Purchase Return", content:"Navigate to Purchases → Purchase Return, click Add, select the original invoice.", share:"Public",  date:"05/06/2026" },
  { title:"Stock Transfer SOP",               content:"Raise a transfer request in Stock Transfers. Branch manager must approve within 24 hrs.", share:"Team",    date:"01/06/2026" },
  { title:"Month-End Closing Checklist",      content:"1. Reconcile invoices. 2. Run stock audit. 3. Export P&L. 4. Archive docs.",            share:"Private", date:"28/05/2026" },
  { title:"Adding a New Supplier",            content:"Go to Contacts → Suppliers, click + Add. Fill Name, GST No., Payment Terms.",          share:"Public",  date:"20/05/2026" },
];
const EVC = ["#1a6b3c","#2563eb","#7c3aed","#dc2626","#d97706","#0891b2"];

/* ════════ DASHBOARD ════════ */
function Dashboard({ onNav, counts }) {
  const cards = [
    { key:"To Do",         label:"To Do",         count:`${counts.todos} tasks`,    bg:"#e8f5ee", ic:"#1a6b3c", icon: Icon.todo },
    { key:"Document",      label:"Documents",      count:`${counts.docs} files`,     bg:"#fef9c3", ic:"#d97706", icon: Icon.doc  },
    { key:"Memos",         label:"Memos",          count:`${counts.memos} memos`,    bg:"#fef2f2", ic:"#dc2626", icon: Icon.memo },
    { key:"Reminders",     label:"Reminders",      count:`${counts.events} events`,  bg:"#ede9fe", ic:"#7c3aed", icon: Icon.cal  },
    { key:"Messages",      label:"Messages",       count:`${counts.msgs} messages`,  bg:"#eff6ff", ic:"#2563eb", icon: Icon.chat },
    { key:"Knowledge Base",label:"Knowledge Base", count:`${counts.kb} articles`,   bg:"#fdf4ff", ic:"#a21caf", icon: Icon.book },
  ];
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="ess-pt">Essentials</div>
        <div className="ess-ps">Your productivity hub — tasks, docs, memos, reminders &amp; more</div>
      </div>
      <div className="ess-grid">
        {cards.map(c => (
          <div key={c.key} className="ess-dcard" onClick={() => onNav(c.key)}>
            <div className="ess-dicon" style={{ background: c.bg }}>{c.icon}</div>
            <div className="ess-dname">{c.label}</div>
            <div className="ess-dcount" style={{ color: c.ic }}>{c.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════ TO-DO PAGE ════════ */
function TodoPage({ toast }) {
  const [todos, setTodos] = useState(I_TODO);
  const [modal, setModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [view, setView] = useState(null);
  const [cfm, setCfm] = useState(null);
  const [filt, setFilt] = useState({ assignedTo:"All", priority:"All", status:"All" });
  const blank = { task:"", assignedTo:"", priority:"Medium", status:"Not Started", startDate:"", endDate:"", hours:"", desc:"" };
  const [form, setForm] = useState(blank);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = todos.filter(t =>
    (filt.assignedTo === "All" || t.assignedTo === filt.assignedTo) &&
    (filt.priority   === "All" || t.priority   === filt.priority) &&
    (filt.status     === "All" || t.status     === filt.status)
  );

  const save = () => {
    if (!form.task.trim()) return toast("Task name is required", "e");
    const now = new Date().toLocaleDateString("en-IN");
    if (editIdx !== null) {
      setTodos(ts => ts.map((t, i) => i === editIdx ? { ...t, ...form } : t));
      toast("Task updated");
    } else {
      setTodos(ts => [...ts, { addedOn:now, taskId:`TASK-${String(ts.length+1).padStart(3,"0")}`, ...form, assignedBy:"Admin" }]);
      toast("Task added");
    }
    setModal(false);
  };

  const cols = [
    {k:"addedOn",l:"Added On"},{k:"taskId",l:"Task ID"},{k:"task",l:"Task"},
    {k:"pr",l:"Priority"},{k:"st",l:"Status"},{k:"startDate",l:"Start"},
    {k:"endDate",l:"End"},{k:"hours",l:"Hrs"},{k:"assignedBy",l:"By"},
    {k:"assignedTo",l:"To"},{k:"actions",l:"Actions"},
  ];
  const tdata = filtered.map(t => ({
    ...t,
    pr: <PBadge v={t.priority} />,
    st: <SBadge v={t.status}   />,
    actions: <Acts
      onV={() => setView(t)}
      onE={() => { setForm({ ...t, desc:"" }); setEditIdx(todos.indexOf(t)); setModal(true); }}
      onD={() => setCfm({ msg:`Delete "${t.task}"?`, ok:() => { setTodos(ts => ts.filter(x => x.taskId !== t.taskId)); toast("Deleted"); setCfm(null); } })}
    />,
  }));

  return (
    <div>
      {cfm && <Confirm msg={cfm.msg} onOk={cfm.ok} onNo={() => setCfm(null)} />}

      {/* View modal */}
      {view && (
        <div className="ess-ov" onClick={() => setView(null)}>
          <div className="ess-mb">
            <div className="ess-mh"><div className="ess-mt">Task Details</div><button className="ess-mc" onClick={() => setView(null)}>×</button></div>
            <div className="ess-mbody">
              {[["Task ID",view.taskId],["Task",view.task],["Priority",<PBadge v={view.priority}/>],["Status",<SBadge v={view.status}/>],
                ["Start Date",view.startDate],["End Date",view.endDate],["Hours",view.hours],
                ["Assigned By",view.assignedBy],["Assigned To",view.assignedTo]].map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                  <span style={{width:115,fontWeight:600,fontSize:12.5,color:"#64748b",flexShrink:0}}>{k}</span>
                  <span style={{fontSize:13,color:"#0f172a"}}>{v}</span>
                </div>
              ))}
            </div>
            <div className="ess-mfoot"><button className="ess-btn ess-btn-s" onClick={() => setView(null)}>Close</button></div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {modal && (
        <div className="ess-ov" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="ess-mb">
            <div className="ess-mh"><div className="ess-mt">{editIdx !== null ? "Edit Task" : "Add Task"}</div><button className="ess-mc" onClick={() => setModal(false)}>×</button></div>
            <div className="ess-mbody">
              <div className="ess-fg2"><label className="ess-lbl">Task Name <span className="ess-req">*</span></label>
                <input className="ess-fc" value={form.task} onChange={set("task")} placeholder="Enter task name" /></div>
              <div className="ess-fg2"><label className="ess-lbl">Assigned To</label>
                <input className="ess-fc" value={form.assignedTo} onChange={set("assignedTo")} placeholder="Employee name" /></div>
              <div className="ess-frow">
                <div className="ess-fg2"><label className="ess-lbl">Priority</label>
                  <select className="ess-fc" value={form.priority} onChange={set("priority")}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select></div>
                <div className="ess-fg2"><label className="ess-lbl">Status</label>
                  <select className="ess-fc" value={form.status} onChange={set("status")}>
                    <option>Not Started</option><option>In Progress</option><option>Completed</option>
                  </select></div>
              </div>
              <div className="ess-frow">
                <div className="ess-fg2"><label className="ess-lbl">Start Date</label>
                  <input className="ess-fc" type="date" value={form.startDate} onChange={set("startDate")} /></div>
                <div className="ess-fg2"><label className="ess-lbl">End Date</label>
                  <input className="ess-fc" type="date" value={form.endDate} onChange={set("endDate")} /></div>
              </div>
              <div className="ess-fg2"><label className="ess-lbl">Estimated Hours</label>
                <input className="ess-fc" type="number" value={form.hours} onChange={set("hours")} style={{maxWidth:140}} /></div>
              <div className="ess-fg2"><label className="ess-lbl">Description</label>
                <RT value={form.desc} onChange={v => setForm(f => ({ ...f, desc:v }))} /></div>
            </div>
            <div className="ess-mfoot">
              <button className="ess-btn ess-btn-s" onClick={() => setModal(false)}>Cancel</button>
              <button className="ess-btn ess-btn-p" onClick={save}>{editIdx !== null ? "Update" : "Save Task"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="ess-ph">
        <div><div className="ess-pt">To-Do List</div><div className="ess-ps">{todos.length} tasks total</div></div>
        <button className="ess-btn ess-btn-p" onClick={() => { setForm(blank); setEditIdx(null); setModal(true); }}>
          {Icon.plus} Add Task
        </button>
      </div>

      <div className="ess-card" style={{marginBottom:12}}>
        <div className="ess-fbar">
          <div className="ess-fg"><span className="ess-fl">Assigned To</span>
            <select className="ess-fs" value={filt.assignedTo} onChange={e => setFilt(f => ({ ...f, assignedTo:e.target.value }))}>
              <option>All</option>{[...new Set(todos.map(t => t.assignedTo))].map(n => <option key={n}>{n}</option>)}
            </select></div>
          <div className="ess-fg"><span className="ess-fl">Priority</span>
            <select className="ess-fs" value={filt.priority} onChange={e => setFilt(f => ({ ...f, priority:e.target.value }))}>
              <option>All</option><option>High</option><option>Medium</option><option>Low</option>
            </select></div>
          <div className="ess-fg"><span className="ess-fl">Status</span>
            <select className="ess-fs" value={filt.status} onChange={e => setFilt(f => ({ ...f, status:e.target.value }))}>
              <option>All</option><option>Not Started</option><option>In Progress</option><option>Completed</option>
            </select></div>
          <button className="ess-btn ess-btn-s" style={{height:31,fontSize:12}} onClick={() => setFilt({assignedTo:"All",priority:"All",status:"All"})}>Reset</button>
        </div>
      </div>

      <div className="ess-card"><DT cols={cols} data={tdata} /></div>
    </div>
  );
}

/* ════════ DOCUMENTS PAGE ════════ */
function DocumentPage({ toast }) {
  const [docs, setDocs] = useState(I_DOC);
  const [showF, setShowF] = useState(false);
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [cfm, setCfm] = useState(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const submit = () => {
    if (!file) return toast("Please choose a file", "e");
    setDocs(ds => [...ds, { name:file.name, description:desc,
      uploadedDate: new Date().toLocaleDateString("en-IN"),
      size:`${(file.size/1048576).toFixed(1)} MB`,
      type: file.name.split(".").pop().toUpperCase() }]);
    setFile(null); setDesc(""); setShowF(false); toast("Document uploaded");
  };

  const cols = [
    {k:"name",l:"File Name"},{k:"description",l:"Description"},
    {k:"type",l:"Type"},{k:"size",l:"Size"},{k:"uploadedDate",l:"Uploaded"},{k:"actions",l:"Actions"},
  ];
  const tdata = docs.map((d, i) => ({
    ...d,
    actions: <Acts
      onV={() => toast(`Viewing ${d.name}`)}
      onDl={() => toast(`Downloading ${d.name}`)}
      onD={() => setCfm({ msg:`Delete "${d.name}"?`, ok:() => { setDocs(ds => ds.filter((_,j) => j !== i)); toast("Deleted"); setCfm(null); } })}
    />,
  }));

  return (
    <div>
      {cfm && <Confirm msg={cfm.msg} onOk={cfm.ok} onNo={() => setCfm(null)} />}
      <div className="ess-ph">
        <div><div className="ess-pt">Documents</div><div className="ess-ps">Manage shared files and attachments</div></div>
        <button className="ess-btn ess-btn-p" onClick={() => setShowF(v => !v)}>{Icon.up} Upload Document</button>
      </div>
      {showF && (
        <div className="ess-card ess-cb" style={{marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Upload New Document</div>
          <input type="file" ref={ref} style={{display:"none"}} onChange={e => setFile(e.target.files[0])} />
          <div className={`ess-uz${drag ? " over" : ""}`}
            onClick={() => ref.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}>
            <div style={{color:"#1a6b3c",marginBottom:6}}>{Icon.up}</div>
            <div style={{fontSize:13.5,color:file?"#1a6b3c":"#64748b"}}>{file ? <strong>{file.name}</strong> : "Click to browse or drag & drop"}</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>PDF, CSV, XLSX, DOCX, ZIP, JPG, PNG</div>
          </div>
          <div className="ess-fg2" style={{marginTop:12}}><label className="ess-lbl">Description</label>
            <textarea className="ess-fc ess-fta" rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description" /></div>
          <div style={{display:"flex",gap:9}}>
            <button className="ess-btn ess-btn-p" onClick={submit}>Upload</button>
            <button className="ess-btn ess-btn-s" onClick={() => { setShowF(false); setFile(null); setDesc(""); }}>Cancel</button>
          </div>
        </div>
      )}
      <div className="ess-card"><DT cols={cols} data={tdata} /></div>
    </div>
  );
}

/* ════════ MEMOS PAGE ════════ */
function MemosPage({ toast }) {
  const [memos, setMemos] = useState(I_MEMO);
  const [modal, setModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [view, setView] = useState(null);
  const [cfm, setCfm] = useState(null);
  const blank = { heading:"", desc:"" };
  const [form, setForm] = useState(blank);

  const save = () => {
    if (!form.heading.trim()) return toast("Heading is required", "e");
    const now = new Date().toLocaleDateString("en-IN");
    if (editIdx !== null) {
      setMemos(ms => ms.map((m,i) => i === editIdx ? { ...m, heading:form.heading, description:form.desc, createdDate:now } : m));
      toast("Memo updated");
    } else {
      setMemos(ms => [...ms, { heading:form.heading, description:form.desc, createdDate:now }]);
      toast("Memo added");
    }
    setModal(false);
  };

  const cols = [
    {k:"heading",l:"Heading"},{k:"description",l:"Content"},{k:"createdDate",l:"Date"},{k:"actions",l:"Actions"},
  ];
  const tdata = memos.map((m, i) => ({
    ...m,
    actions: <Acts
      onV={() => setView(m)}
      onE={() => { setForm({ heading:m.heading, desc:m.description }); setEditIdx(i); setModal(true); }}
      onD={() => setCfm({ msg:`Delete "${m.heading}"?`, ok:() => { setMemos(ms => ms.filter((_,j) => j !== i)); toast("Deleted"); setCfm(null); } })}
    />,
  }));

  return (
    <div>
      {cfm && <Confirm msg={cfm.msg} onOk={cfm.ok} onNo={() => setCfm(null)} />}
      {view && (
        <div className="ess-ov" onClick={() => setView(null)}>
          <div className="ess-mb">
            <div className="ess-mh"><div className="ess-mt">{view.heading}</div><button className="ess-mc" onClick={() => setView(null)}>×</button></div>
            <div className="ess-mbody">
              <p style={{fontSize:13.5,color:"#334155",lineHeight:1.7}}>{view.description}</p>
              <p style={{fontSize:12,color:"#94a3b8",marginTop:12}}>Created: {view.createdDate}</p>
            </div>
            <div className="ess-mfoot"><button className="ess-btn ess-btn-s" onClick={() => setView(null)}>Close</button></div>
          </div>
        </div>
      )}
      {modal && (
        <div className="ess-ov" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="ess-mb">
            <div className="ess-mh"><div className="ess-mt">{editIdx !== null ? "Edit Memo" : "Add Memo"}</div><button className="ess-mc" onClick={() => setModal(false)}>×</button></div>
            <div className="ess-mbody">
              <div className="ess-fg2"><label className="ess-lbl">Heading <span className="ess-req">*</span></label>
                <input className="ess-fc" value={form.heading} onChange={e => setForm(f => ({ ...f, heading:e.target.value }))} placeholder="Memo heading" /></div>
              <div className="ess-fg2"><label className="ess-lbl">Content</label>
                <RT value={form.desc} onChange={v => setForm(f => ({ ...f, desc:v }))} /></div>
            </div>
            <div className="ess-mfoot">
              <button className="ess-btn ess-btn-s" onClick={() => setModal(false)}>Cancel</button>
              <button className="ess-btn ess-btn-p" onClick={save}>{editIdx !== null ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="ess-ph">
        <div><div className="ess-pt">Memos</div><div className="ess-ps">Internal announcements and notices</div></div>
        <button className="ess-btn ess-btn-p" onClick={() => { setForm(blank); setEditIdx(null); setModal(true); }}>{Icon.plus} Add Memo</button>
      </div>
      <div className="ess-card"><DT cols={cols} data={tdata} /></div>
    </div>
  );
}

/* ════════ REMINDERS PAGE ════════ */
function RemindersPage({ toast }) {
  const [events, setEvents] = useState(I_EV);
  const [modal, setModal] = useState(false);
  const [cfm, setCfm] = useState(null);
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const blank = { name:"", repeat:"One time", date:"", startTime:"", endTime:"" };
  const [form, setForm] = useState(blank);
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  const yr = cur.getFullYear(), mo = cur.getMonth();
  const fd = new Date(yr, mo, 1).getDay();
  const di = new Date(yr, mo+1, 0).getDate();
  const cells = [...Array(fd).fill(null), ...Array.from({ length:di }, (_, i) => i+1)];

  const save = () => {
    if (!form.name.trim() || !form.date) return toast("Name and date required", "e");
    setEvents(es => [...es, form]); toast("Reminder added"); setModal(false);
  };

  return (
    <div>
      {cfm && <Confirm msg={cfm.msg} onOk={cfm.ok} onNo={() => setCfm(null)} />}
      {modal && (
        <div className="ess-ov" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="ess-mb" style={{maxWidth:440}}>
            <div className="ess-mh"><div className="ess-mt">Add Reminder</div><button className="ess-mc" onClick={() => setModal(false)}>×</button></div>
            <div className="ess-mbody">
              <div className="ess-fg2"><label className="ess-lbl">Event Name <span className="ess-req">*</span></label>
                <input className="ess-fc" value={form.name} onChange={set("name")} placeholder="Event name" /></div>
              <div className="ess-frow">
                <div className="ess-fg2"><label className="ess-lbl">Repeat</label>
                  <select className="ess-fc" value={form.repeat} onChange={set("repeat")}>
                    <option>One time</option><option>Daily</option><option>Weekly</option><option>Monthly</option>
                  </select></div>
                <div className="ess-fg2"><label className="ess-lbl">Date <span className="ess-req">*</span></label>
                  <input className="ess-fc" type="date" value={form.date} onChange={set("date")} /></div>
              </div>
              <div className="ess-frow">
                <div className="ess-fg2"><label className="ess-lbl">Start Time</label>
                  <input className="ess-fc" type="time" value={form.startTime} onChange={set("startTime")} /></div>
                <div className="ess-fg2"><label className="ess-lbl">End Time</label>
                  <input className="ess-fc" type="time" value={form.endTime} onChange={set("endTime")} /></div>
              </div>
            </div>
            <div className="ess-mfoot">
              <button className="ess-btn ess-btn-s" onClick={() => setModal(false)}>Cancel</button>
              <button className="ess-btn ess-btn-p" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
      <div className="ess-ph">
        <div><div className="ess-pt">Reminders</div><div className="ess-ps">{events.length} scheduled events</div></div>
        <button className="ess-btn ess-btn-p" onClick={() => { setForm(blank); setModal(true); }}>{Icon.plus} Add Reminder</button>
      </div>
      <div className="ess-card ess-cb" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <button className="ess-btn ess-btn-s" style={{height:30,fontSize:12,padding:"0 10px"}} onClick={() => setCur(new Date(yr,mo-1,1))}>‹</button>
          <button className="ess-btn ess-btn-s" style={{height:30,fontSize:12,padding:"0 10px"}} onClick={() => setCur(new Date(today.getFullYear(),today.getMonth(),1))}>Today</button>
          <button className="ess-btn ess-btn-s" style={{height:30,fontSize:12,padding:"0 10px"}} onClick={() => setCur(new Date(yr,mo+1,1))}>›</button>
          <span style={{fontWeight:700,fontSize:15,color:"#1a6b3c",marginLeft:4}}>{cur.toLocaleString("default",{month:"long"})} {yr}</span>
        </div>
        <div className="ess-card" style={{overflow:"hidden"}}>
          <div className="ess-calgrid">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="ess-calh">{d}</div>)}
            {cells.map((d, i) => {
              const isTd = d === today.getDate() && mo === today.getMonth() && yr === today.getFullYear();
              const evs = events.filter(ev => {
                if (!ev.date || !d) return false;
                const ed = new Date(ev.date);
                return ed.getDate() === d && ed.getMonth() === mo && ed.getFullYear() === yr;
              });
              return (
                <div key={i} className={`ess-calc${d === null ? " em" : ""}${isTd ? " td" : ""}`}>
                  {d && <div className="ess-cnum">{d}</div>}
                  {evs.map((ev, ei) => (
                    <div key={ei} className="ess-cev" style={{background:EVC[ei%EVC.length]}}
                      title={`${ev.name} ${ev.startTime}–${ev.endTime}`}>
                      {ev.startTime && `${ev.startTime} `}{ev.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ess-card ess-cb">
        <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:"#0f172a"}}>All Events</div>
        {events.map((ev, i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:"1px solid #f1f5f9"}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:EVC[i%EVC.length],flexShrink:0}} />
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13.5,color:"#0f172a"}}>{ev.name}</div>
              <div style={{fontSize:11.5,color:"#94a3b8"}}>{ev.date} · {ev.startTime}{ev.endTime ? `–${ev.endTime}` : ""} · {ev.repeat}</div>
            </div>
            <button className="ess-ai ess-ai-d" title="Delete"
              onClick={() => setCfm({ msg:`Delete "${ev.name}"?`, ok:() => { setEvents(es => es.filter((_,j) => j !== i)); toast("Deleted"); setCfm(null); } })}>
              {Icon.trash}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════ MESSAGES PAGE ════════ */
function MessagesPage() {
  const [msgs, setMsgs] = useState(I_MSG);
  const [input, setInput] = useState("");
  const [active, setActive] = useState("Admin");
  const contacts = ["Admin","Priya S.","Rahul M.","Ananya K."];
  const endRef = useRef();
  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { text:input, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), from:"me" }]);
    setInput("");
  };
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  return (
    <div>
      <div className="ess-ph"><div><div className="ess-pt">Messages</div><div className="ess-ps">Internal team chat</div></div></div>
      <div className="ess-card" style={{display:"flex",overflow:"hidden"}}>
        <div style={{width:160,borderRight:"1px solid #e2e8f0",padding:"10px 7px",background:"#f8fafc"}}>
          <div style={{fontSize:10.5,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".06em",padding:"3px 8px 9px"}}>Contacts</div>
          {contacts.map(c => (
            <div key={c} onClick={() => setActive(c)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 9px",borderRadius:7,cursor:"pointer",marginBottom:2,
                background:active===c?"#f0faf4":"transparent",color:active===c?"#1a6b3c":"#334155",
                fontWeight:active===c?600:500,fontSize:13}}>
              <div style={{width:27,height:27,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:11,fontWeight:700,
                background:active===c?"#1a6b3c":"#e2e8f0",color:active===c?"#fff":"#64748b"}}>
                {c[0]}
              </div>
              {c}
            </div>
          ))}
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:33,height:33,borderRadius:"50%",background:"#1a6b3c",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{active[0]}</div>
            <div>
              <div style={{fontWeight:700,fontSize:13.5,color:"#0f172a"}}>{active}</div>
              <div style={{fontSize:11,color:"#22c55e"}}>● Online</div>
            </div>
          </div>
          <div className="ess-mlist">
            {msgs.map((m, i) => (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.from==="me"?"flex-end":"flex-start"}}>
                <div className={`ess-bbl ${m.from==="me"?"me":"them"}`}>{m.text}</div>
                <div className="ess-btime">{m.time}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="ess-minrow">
            <input className="ess-minin" placeholder="Type a message…" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
            <button className="ess-btn ess-btn-p" style={{height:38,width:42,padding:0,justifyContent:"center"}} onClick={send}>{Icon.send}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════ KNOWLEDGE BASE ════════ */
function KnowledgePage({ toast }) {
  const [articles, setArticles] = useState(I_KB);
  const [showF, setShowF] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [view, setView] = useState(null);
  const [cfm, setCfm] = useState(null);
  const [search, setSearch] = useState("");
  const blank = { title:"", content:"", share:"Public" };
  const [form, setForm] = useState(blank);

  const save = () => {
    if (!form.title.trim()) return toast("Title is required", "e");
    const now = new Date().toLocaleDateString("en-IN");
    if (editIdx !== null) {
      setArticles(as => as.map((a,i) => i === editIdx ? { ...a, ...form, date:now } : a));
      toast("Updated");
    } else {
      setArticles(as => [...as, { ...form, date:now }]);
      toast("Published");
    }
    setShowF(false);
  };

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {cfm && <Confirm msg={cfm.msg} onOk={cfm.ok} onNo={() => setCfm(null)} />}
      {view && (
        <div className="ess-ov" onClick={() => setView(null)}>
          <div className="ess-mb">
            <div className="ess-mh"><div className="ess-mt">{view.title}</div><button className="ess-mc" onClick={() => setView(null)}>×</button></div>
            <div className="ess-mbody">
              <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                <ShBadge v={view.share} /><span style={{fontSize:12,color:"#94a3b8"}}>Published {view.date}</span>
              </div>
              <p style={{fontSize:13.5,color:"#334155",lineHeight:1.8}}>{view.content}</p>
            </div>
            <div className="ess-mfoot"><button className="ess-btn ess-btn-s" onClick={() => setView(null)}>Close</button></div>
          </div>
        </div>
      )}
      <div className="ess-ph">
        <div><div className="ess-pt">Knowledge Base</div><div className="ess-ps">{articles.length} articles</div></div>
        <button className="ess-btn ess-btn-p" onClick={() => { setForm(blank); setEditIdx(null); setShowF(v => !v); }}>{Icon.plus} Add Article</button>
      </div>
      {showF && (
        <div className="ess-card ess-cb" style={{marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>New Article</div>
          <div className="ess-fg2"><label className="ess-lbl">Title <span className="ess-req">*</span></label>
            <input className="ess-fc" value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="Article title" /></div>
          <div className="ess-fg2"><label className="ess-lbl">Content</label>
            <RT value={form.content} onChange={v => setForm(f => ({ ...f, content:v }))} /></div>
          <div className="ess-fg2" style={{maxWidth:200}}><label className="ess-lbl">Visibility</label>
            <select className="ess-fc" value={form.share} onChange={e => setForm(f => ({ ...f, share:e.target.value }))}>
              <option>Public</option><option>Private</option><option>Team</option>
            </select></div>
          <div style={{display:"flex",gap:9}}>
            <button className="ess-btn ess-btn-p" onClick={save}>Publish</button>
            <button className="ess-btn ess-btn-s" onClick={() => setShowF(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="ess-card ess-cb" style={{marginBottom:11}}>
        <input className="ess-srch" style={{width:"100%",maxWidth:340}} placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0
        ? <div className="ess-card ess-cb" style={{textAlign:"center",color:"#94a3b8",padding:36}}>No articles found.</div>
        : filtered.map((a, i) => (
          <div key={i} className="ess-kbc">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14.5,color:"#0f172a",marginBottom:5}}>{a.title}</div>
                <div style={{fontSize:13,color:"#64748b",lineHeight:1.6,marginBottom:8}}>
                  {a.content.length > 130 ? a.content.slice(0,130)+"…" : a.content}
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <ShBadge v={a.share} /><span style={{fontSize:12,color:"#94a3b8"}}>Published {a.date}</span>
                </div>
              </div>
              <Acts
                onV={() => setView(a)}
                onE={() => { setForm({ title:a.title, content:a.content, share:a.share }); setEditIdx(articles.indexOf(a)); setShowF(true); }}
                onD={() => setCfm({ msg:`Delete "${a.title}"?`, ok:() => { setArticles(as => as.filter(x => x.title !== a.title)); toast("Deleted"); setCfm(null); } })}
              />
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ════════ SETTINGS PAGE ════════ */
function SettingsPage({ toast }) {
  const [tab, setTab] = useState("Leave");
  const [form, setForm] = useState({
    leavePrefix:"LEV-2026-", maxDays:12, autoAfter:3, autoApproval:false,
    leaveInstr:"All leave applications must be submitted at least 48 hours in advance.",
    payrollCycle:"Monthly", payrollDate:28, currency:"INR (₹)",
    workStart:"09:00", workEnd:"18:00", grace:15,
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const tabs = ["Leave","Payroll","Attendance","Sales Targets","Essentials"];

  return (
    <div>
      <div className="ess-ph"><div><div className="ess-pt">Settings</div><div className="ess-ps">Essentials & HRM configuration</div></div></div>
      <div className="ess-card" style={{display:"flex",overflow:"hidden"}}>
        <div className="ess-snav">
          {tabs.map(t => <div key={t} className={`ess-sni${tab===t?" on":""}`} onClick={() => setTab(t)}>{t}</div>)}
        </div>
        <div style={{flex:1,padding:22}}>
          {tab === "Leave" && (
            <>
              <div style={{fontWeight:700,fontSize:15,marginBottom:18,color:"#0f172a"}}>Leave Settings</div>
              <div className="ess-fg2" style={{maxWidth:280}}><label className="ess-lbl">Leave Reference Prefix</label>
                <input className="ess-fc" value={form.leavePrefix} onChange={set("leavePrefix")} /></div>
              <div className="ess-frow" style={{maxWidth:380}}>
                <div className="ess-fg2"><label className="ess-lbl">Max Casual Leave / Year</label>
                  <input className="ess-fc" type="number" value={form.maxDays} onChange={set("maxDays")} /></div>
                <div className="ess-fg2"><label className="ess-lbl">Auto-Approve After (days)</label>
                  <input className="ess-fc" type="number" value={form.autoAfter} onChange={set("autoAfter")} /></div>
              </div>
              <div className="ess-fg2">
                <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}}>
                  <input type="checkbox" checked={form.autoApproval} onChange={set("autoApproval")} />
                  <span className="ess-lbl" style={{margin:0}}>Enable Auto Approval</span>
                </label>
              </div>
              <div className="ess-fg2"><label className="ess-lbl">Leave Application Instructions</label>
                <RT value={form.leaveInstr} onChange={v => setForm(f => ({ ...f, leaveInstr:v }))} rows={4} /></div>
            </>
          )}
          {tab === "Payroll" && (
            <>
              <div style={{fontWeight:700,fontSize:15,marginBottom:18,color:"#0f172a"}}>Payroll Settings</div>
              <div className="ess-fg2" style={{maxWidth:240}}><label className="ess-lbl">Payroll Cycle</label>
                <select className="ess-fc" value={form.payrollCycle} onChange={set("payrollCycle")}>
                  <option>Monthly</option><option>Bi-weekly</option><option>Weekly</option>
                </select></div>
              <div className="ess-fg2" style={{maxWidth:160}}><label className="ess-lbl">Processing Date</label>
                <input className="ess-fc" type="number" value={form.payrollDate} onChange={set("payrollDate")} min={1} max={31} /></div>
              <div className="ess-fg2" style={{maxWidth:240}}><label className="ess-lbl">Default Currency</label>
                <select className="ess-fc" value={form.currency} onChange={set("currency")}>
                  <option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option>
                </select></div>
            </>
          )}
          {tab === "Attendance" && (
            <>
              <div style={{fontWeight:700,fontSize:15,marginBottom:18,color:"#0f172a"}}>Attendance Settings</div>
              <div className="ess-frow" style={{maxWidth:380}}>
                <div className="ess-fg2"><label className="ess-lbl">Work Start Time</label>
                  <input className="ess-fc" type="time" value={form.workStart} onChange={set("workStart")} /></div>
                <div className="ess-fg2"><label className="ess-lbl">Work End Time</label>
                  <input className="ess-fc" type="time" value={form.workEnd} onChange={set("workEnd")} /></div>
              </div>
              <div className="ess-fg2" style={{maxWidth:180}}><label className="ess-lbl">Late Grace (minutes)</label>
                <input className="ess-fc" type="number" value={form.grace} onChange={set("grace")} /></div>
            </>
          )}
          {(tab === "Sales Targets" || tab === "Essentials") && (
            <div style={{color:"#94a3b8",fontSize:13.5,padding:"16px 0"}}>{tab} settings — configure as needed.</div>
          )}
          <div style={{marginTop:22}}>
            <button className="ess-btn ess-btn-p" onClick={() => toast("Settings saved")}>Save Changes</button>
          </div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:12,color:"#94a3b8",marginTop:12}}>Essentials & HRM · Version 5.1</div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN EXPORT — this is what your router renders
   The sidebar + top header come from your layout,
   so this component only outputs the tab nav +
   page content, nothing else.
════════════════════════════════════════════════ */
const TABS = [
  { key:"Essentials",     label:"Essentials"     },
  { key:"To Do",          label:"To Do"           },
  { key:"Document",       label:"Document"        },
  { key:"Memos",          label:"Memos"           },
  { key:"Reminders",      label:"Reminders"       },
  { key:"Messages",       label:"Messages"        },
  { key:"Knowledge Base", label:"Knowledge Base"  },
  { key:"Settings",       label:"Settings"        },
];

const COUNTS = { todos:I_TODO.length, docs:I_DOC.length, memos:I_MEMO.length,
                  events:I_EV.length, msgs:I_MSG.length, kb:I_KB.length };

export default function Essentials() {
  injectStyles();
  const [tab, setTab] = useState("Essentials");
  const { ts, show: toast } = useToast();

  return (
    <div className="ess">
      {/* Toast notifications */}
      <div className="ess-twr">
        {ts.map(t => <div key={t.id} className={`ess-toast ${t.type}`}>{t.msg}</div>)}
      </div>

      {/* Sub-tab navigation (sits below your app's main top bar) */}
      <div className="ess-nav">
        {TABS.map(t => (
          <button key={t.key} className={`ess-tab${tab === t.key ? " on" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Page content */}
      <div className="ess-page">
        {tab === "Essentials"      && <Dashboard     onNav={setTab} counts={COUNTS} />}
        {tab === "To Do"           && <TodoPage       toast={toast} />}
        {tab === "Document"        && <DocumentPage   toast={toast} />}
        {tab === "Memos"           && <MemosPage      toast={toast} />}
        {tab === "Reminders"       && <RemindersPage  toast={toast} />}
        {tab === "Messages"        && <MessagesPage               />}
        {tab === "Knowledge Base"  && <KnowledgePage  toast={toast} />}
        {tab === "Settings"        && <SettingsPage   toast={toast} />}
      </div>
    </div>
  );
}
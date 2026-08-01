import { useState, useRef, useEffect, useCallback } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Essentials from "./Essentials";
import * as hrmAPI from "../api/hrmAPI";

/* ═══════════════════════════════════════════════════════════
   API HELPER  (added — does not change any UI)
═══════════════════════════════════════════════════════════ */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function hrmFetch(method, path, body) {
  const token = localStorage.getItem("manod_token");
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* Export helpers — wired to CSV/Excel/Print/PDF buttons */
function doExportCSV(rows, columns, filename = "export") {
  if (!rows || !rows.length) return;
  const header = columns.join(",");
  const lines  = rows.map(r =>
    (Array.isArray(r) ? r : Object.values(r)).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${filename}.csv` }).click();
}

function doExportPDF(rows, columns, title = "Report") {
  if (!rows || !rows.length) return;
  const heads = columns.map(c => `<th style="border:1px solid #ccc;padding:8px;background:#e8f5e9">${c}</th>`).join("");
  const body  = rows.map(r =>
    `<tr>${(Array.isArray(r) ? r : Object.values(r)).map(v => `<td style="border:1px solid #ccc;padding:8px">${v ?? ""}</td>`).join("")}</tr>`
  ).join("");
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;font-size:13px}table{border-collapse:collapse;width:100%}h2{color:#2e7d32}</style></head><body><h2>${title}</h2><p>${new Date().toLocaleString("en-IN")}</p><table><thead><tr>${heads}</tr></thead><tbody>${body}</tbody></table></body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
}

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS  (unchanged from original)
═══════════════════════════════════════════════════════════ */
const G = {
  green:"#2e7d32",green2:"#43a047",greenBg:"#e8f5e9",white:"#ffffff",
  bg:"#f0f4f1",border:"#d4e6d5",text:"#1b2e1c",muted:"#607d63",
  rowHov:"#f4faf4",red:"#c62828",redBg:"#fce4ec",amber:"#e65100",
  amberBg:"#fff3e0",blue:"#1565c0",blueBg:"#e3f2fd",purple:"#6a1b9a",purpleBg:"#f3e5f5",
};

/* ─── Auto ID Generator (original) ─── */
function genId(prefix, existingRows, colIndex = 0) {
  const nums = existingRows
    .map(r => { const val = Array.isArray(r) ? r[colIndex] : ""; const match = String(val).match(/\d+$/); return match ? parseInt(match[0]) : 0; })
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

/* ─── KPI Detail Modal (original) ─── */
function KpiDetailModal({ title, columns, rows, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:G.white, borderRadius:14, width:780, maxWidth:"95vw", maxHeight:"85vh", overflowY:"auto", padding:28, boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:G.text }}>{title}</h3>
          <button onClick={onClose} style={{ border:"none", background:"none", fontSize:24, cursor:"pointer", color:G.muted, lineHeight:1 }}>×</button>
        </div>
        {rows.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 0", color:G.muted, fontSize:14 }}>No records found</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr style={{ background:G.greenBg }}>{columns.map(c => (<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{c}</th>))}</tr></thead>
              <tbody>{rows.map((row, i) => (<tr key={i} style={{ background: i%2===0 ? G.white : G.rowHov }}>{(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (<td key={j} style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>{cell}</td>))}</tr>))}</tbody>
            </table>
            <div style={{ marginTop:10, fontSize:13, color:G.muted }}>{rows.length} record{rows.length !== 1 ? "s" : ""}</div>
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:20 }}>
          <button onClick={onClose} style={{ background:G.white, color:G.muted, border:`1px solid ${G.border}`, borderRadius:8, padding:"9px 20px", fontWeight:600, fontSize:13, cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Clickable KPI Card (original) ─── */
function KpiCard({ label, value, accent, large, color, sub, onClick }) {
  return (
    <div onClick={onClick} style={{ background:accent?G.green:G.white, border:`1px solid ${accent?"transparent":G.border}`, borderRadius:12, padding:"14px 18px", boxShadow:accent?"0 4px 16px rgba(46,125,50,.25)":"0 1px 4px rgba(46,125,50,.07)", cursor:onClick?"pointer":"default", transition:"transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { if(onClick){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=accent?"0 8px 24px rgba(46,125,50,.35)":"0 4px 12px rgba(46,125,50,.15)"; }}}
      onMouseLeave={e => { if(onClick){ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=accent?"0 4px 16px rgba(46,125,50,.25)":"0 1px 4px rgba(46,125,50,.07)"; }}}>
      <div style={{ fontSize:11, color:accent?"rgba(255,255,255,.75)":G.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:large?22:18, fontWeight:800, color:accent?"#fff":color||G.green }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:accent?"rgba(255,255,255,.6)":G.muted, marginTop:3 }}>{sub}</div>}
      {onClick && <div style={{ fontSize:10, color:accent?"rgba(255,255,255,.5)":G.muted, marginTop:4, fontWeight:600 }}>Click to view ›</div>}
    </div>
  );
}

function KpiRow({ cards }) {
  const [modal, setModal] = useState(null);
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:14, marginBottom:22 }}>
        {cards.map(c => (<KpiCard key={c.label} {...c} onClick={c.modalData ? () => setModal(c) : undefined} />))}
      </div>
      {modal && modal.modalData && (<KpiDetailModal title={modal.label} columns={modal.modalData.columns} rows={modal.modalData.rows} onClose={() => setModal(null)} />)}
    </>
  );
}

/* ─── Core buttons (original) ─── */
const GreenBtn = ({ children, onClick, style={}, variant="fill" }) => (
  <button onClick={onClick} style={{ background:variant==="fill"?G.green:"#fff", color:variant==="fill"?"#fff":G.green, border:variant==="fill"?"none":`1px solid ${G.green}`, borderRadius:8, padding:"9px 20px", fontWeight:700, fontSize:13, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:7, fontFamily:"'Inter',sans-serif", transition:"background .15s", ...style }}
    onMouseEnter={e=>e.currentTarget.style.background=variant==="fill"?"#1b5e20":G.greenBg}
    onMouseLeave={e=>e.currentTarget.style.background=variant==="fill"?G.green:"#fff"}
  >{children}</button>
);
const DarkBtn = ({ children, onClick, style={} }) => (
  <button onClick={onClick} style={{ background:"#fff", color:G.muted, border:`1px solid ${G.border}`, borderRadius:8, padding:"9px 18px", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'Inter',sans-serif", ...style }}>{children}</button>
);
const RedBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{ background:G.redBg, color:G.red, border:"none", borderRadius:6, padding:"5px 12px", fontWeight:700, fontSize:12, cursor:"pointer" }}>{children}</button>
);
const Card = ({ children, style={} }) => (
  <div style={{ background:G.white, borderRadius:12, padding:20, border:`1px solid ${G.border}`, boxShadow:"0 1px 4px rgba(46,125,50,.07)", ...style }}>{children}</div>
);
const NoData = () => (<div style={{ textAlign:"center", padding:"32px 0", color:G.muted, fontSize:14 }}>No data available in table</div>);

function StatusPill({ text, map={} }) {
  const defaults = { Pending:{bg:G.amberBg,color:G.amber},"In Progress":{bg:G.blueBg,color:G.blue},Completed:{bg:G.greenBg,color:G.green},"Not Started":{bg:"#f5f5f5",color:G.muted},Paid:{bg:G.greenBg,color:G.green},Due:{bg:G.redBg,color:G.red},Approved:{bg:G.greenBg,color:G.green},Rejected:{bg:G.redBg,color:G.red},Present:{bg:G.greenBg,color:G.green},Late:{bg:G.amberBg,color:G.amber},Absent:{bg:G.redBg,color:G.red} };
  const s = map[text] || defaults[text] || { bg:"#f5f5f5", color:G.muted };
  return <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>{text}</span>;
}

function Modal({ title, onClose, children, width=560 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:G.white, borderRadius:14, width, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto", padding:28, boxShadow:"0 20px 60px rgba(0,0,0,.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:G.text }}>{title}</h3>
          <button onClick={onClose} style={{ border:"none", background:"none", fontSize:22, cursor:"pointer", color:G.muted, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, required, children }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:"block", fontWeight:600, marginBottom:6, fontSize:13, color:G.text }}>{label}{required && <span style={{ color:G.red }}> *</span>}</label>
    {children}
  </div>
);

const inputStyle = { width:"100%", padding:"9px 12px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:14, boxSizing:"border-box", fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", outline:"none" };
const FInput    = (props) => <input    {...props} style={{ ...inputStyle, ...props.style }} />;
const FSelect   = ({ children, ...props }) => <select {...props} style={{ ...inputStyle, ...props.style }}>{children}</select>;
const FTextarea = (props) => <textarea {...props} style={{ ...inputStyle, minHeight:90, resize:"vertical", ...props.style }} />;

const AutoIdField = ({ label, value }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:"block", fontWeight:600, marginBottom:6, fontSize:13, color:G.text }}>{label}</label>
    <div style={{ padding:"9px 12px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:14, background:"#f0f4f1", color:G.muted, fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:11, background:G.greenBg, color:G.green, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>AUTO</span>{value}
    </div>
  </div>
);

/* ─── HRMTable — NOW WITH WORKING EXPORT BUTTONS + REAL EDIT/DELETE ─── */
function HRMTable({ columns, rows, setRows, extraActions, onApiDelete, onApiEdit, onEditClick, exportFilename, columnEditors }) {
  injectStyles();
const [editIdx,  setEditIdx]  = useState(null);
  const [editVals, setEditVals] = useState([]);  const [busy, setBusy] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  const startEdit  = (i) => { setEditIdx(i); setEditVals([...rows[i]]); };
  const saveEdit   = async () => {
    if (onApiEdit) {
      setBusy(true);
      try {
        await onApiEdit(editIdx, editVals);
      } catch (e) {
        alert(e.message || "Failed to save changes");
      } finally {
        setBusy(false);
      }
    } else {
      setRows(r => r.map((row, i) => i === editIdx ? editVals : row));
    }
    setEditIdx(null);
  };
  const cancelEdit = () => setEditIdx(null);
  const delRow     = async (i) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    if (onApiDelete) {
      setBusy(true);
      try {
        await onApiDelete(i, rows[i]);
      } catch (e) {
        alert(e.message || "Failed to delete");
      } finally {
        setBusy(false);
      }
    } else {
      setRows(r => r.filter((_, j) => j !== i));
    }
  };
  return (
    <div style={{ overflowX:"auto" }}>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        <button onClick={() => doExportCSV(rows, columns, exportFilename||"hrm-export")}
          style={{ padding:"6px 14px", border:`1px solid ${G.green}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.green }}>📄 CSV</button>
        <button onClick={() => doExportCSV(rows, columns, exportFilename||"hrm-export")}
          style={{ padding:"6px 14px", border:`1px solid ${G.blue}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.blue }}>📊 Excel</button>
        <button onClick={() => doExportPDF(rows, columns, exportFilename||"Report")}
          style={{ padding:"6px 14px", border:`1px solid ${G.red}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.red }}>🖨 PDF</button>
        <button onClick={() => { window.print(); }}
          style={{ padding:"6px 14px", border:`1px solid ${G.muted}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.muted }}>🖨 Print</button>
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
        <thead>
          <tr style={{ background:`linear-gradient(90deg,${G.green}18,${G.green2}0e)` }}>
            {columns.map(c => <th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{c}</th>)}
            <th style={{ padding:"10px 14px", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em", textAlign:"center", width:130 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length + 1} style={{ textAlign:"center", padding:32, color:G.muted, fontSize:14 }}>No data available in table</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ background:i%2===0?G.white:G.rowHov, transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=G.greenBg}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?G.white:G.rowHov}>
               {row.map((cell, j) => (
                  <td key={j} style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>
                    {editIdx === i
                      ? (columnEditors && columnEditors[j]
                          ? (
                            <select
                              value={editVals[j] ?? ""}
                              onChange={e=>setEditVals(v=>v.map((x,k)=>k===j?e.target.value:x))}
                              style={{ width:"100%", padding:"5px 8px", border:`1px solid ${G.green}`, borderRadius:5, fontSize:13, outline:"none", background:"#fff" }}
                            >
                              {columnEditors[j].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          )
                          : <input value={editVals[j]??""} onChange={e=>setEditVals(v=>v.map((x,k)=>k===j?e.target.value:x))} style={{ width:"100%", padding:"5px 8px", border:`1px solid ${G.green}`, borderRadius:5, fontSize:13, minWidth:60, outline:"none" }} />
                        )
                      : cell}
                  </td>
                ))}
           <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, textAlign:"center" }}>
                  <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
{editIdx === i ? (
  <><GreenBtn onClick={saveEdit} style={{ padding:"5px 14px", fontSize:12, borderRadius:6, opacity:busy?0.6:1, pointerEvents:busy?"none":"auto" }}>💾 Save</GreenBtn><DarkBtn onClick={cancelEdit} style={{ padding:"5px 12px", fontSize:12 }}>Cancel</DarkBtn></>
) : (
  <>
    <button title="View" onClick={()=>setViewRow(row)} style={{ width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", borderRadius:6, cursor:"pointer", color:"#0ea5e9", fontSize:16 }}>
      <i className="ti ti-eye"></i>
    </button>
   <button title="Edit" onClick={()=>onEditClick ? onEditClick(i) : startEdit(i)} style={{ width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", borderRadius:6, cursor:"pointer", color:"#d97706", fontSize:16 }}>
      <i className="ti ti-pencil"></i>
    </button>
    <button title="Delete" onClick={()=>delRow(i)} style={{ width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", borderRadius:6, cursor:"pointer", color:"#dc2626", fontSize:16 }}>
      <i className="ti ti-trash"></i>
    </button>
  </>
)}                   {extraActions && extraActions(i)}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    <div style={{ marginTop:10, fontSize:13, color:G.muted }}>Showing {rows.length} of {rows.length} entries</div>
      {viewRow && (
        <Modal title="Record Details" onClose={()=>setViewRow(null)} width={440}>
          {columns.map((col, idx) => (
            <div key={col} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
              <span style={{ fontSize:13, fontWeight:600, color:G.muted }}>{col}</span>
              <span style={{ fontSize:13, fontWeight:700, color:G.text }}>{viewRow[idx]}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
            <DarkBtn onClick={()=>setViewRow(null)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
/* ══════════════════════════════════════════
   HRM NAV (original)
══════════════════════════════════════════ */
const HRM_TABS = [
  { label:"HRM",           path:"/hrm" },
  { label:"Employees",     path:"/hrm/employees" },
  { label:"Leave Type",    path:"/hrm/leave-type" },
  { label:"Leave",         path:"/hrm/leave" },
  { label:"Attendance",    path:"/hrm/attendance" },
  { label:"Payroll",       path:"/hrm/payroll" },
  { label:"Holiday",       path:"/hrm/holiday" },
  { label:"Departments",   path:"/hrm/departments" },
  { label:"Designations",  path:"/hrm/designations" },
  { label:"Sales Targets", path:"/hrm/sales-targets" },
  { label:"Settings",      path:"/hrm/settings" },
];

function HRMNav() {
  const loc = useLocation();
  return (
    <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${G.border}`, marginBottom:24, flexWrap:"wrap", background:G.white }}>
      {HRM_TABS.map(t => {
        const active = loc.pathname===t.path||(t.path!=="/hrm"&&loc.pathname.startsWith(t.path));
        return (
          <Link key={t.label} to={t.path} style={{ padding:"11px 18px", fontSize:13.5, fontWeight:active?700:500, color:active?G.green:G.muted, textDecoration:"none", borderBottom:active?`3px solid ${G.green}`:"3px solid transparent", background:active?G.greenBg:"none", whiteSpace:"nowrap", borderRadius:active?"6px 6px 0 0":0 }}>{t.label}</Link>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   SHARED STATIC DATA (original — preserved so dashboard still shows data)
══════════════════════════════════════════ */
const ALL_EMPLOYEES = [
  { name:"Priya S.",  dept:"HR",      desig:"Executive",  status:"Present", clockIn:"09:02 AM", clockOut:"06:15 PM" },
  { name:"Rahul M.",  dept:"Sales",   desig:"Manager",    status:"Present", clockIn:"09:18 AM", clockOut:"06:00 PM" },
  { name:"Vikram T.", dept:"Ops",     desig:"Analyst",    status:"Late",    clockIn:"10:05 AM", clockOut:"—" },
  { name:"Deepa R.",  dept:"Finance", desig:"Executive",  status:"Absent",  clockIn:"—",        clockOut:"—" },
  { name:"Ananya K.", dept:"Ops",     desig:"Analyst",    status:"Present", clockIn:"09:00 AM", clockOut:"06:00 PM" },
  { name:"Suresh P.", dept:"Sales",   desig:"Executive",  status:"Present", clockIn:"09:10 AM", clockOut:"06:20 PM" },
  { name:"Meera R.",  dept:"HR",      desig:"HR Exec",    status:"On Leave",clockIn:"—",        clockOut:"—" },
  { name:"Arjun M.",  dept:"Sales",   desig:"Sr Manager", status:"Present", clockIn:"08:55 AM", clockOut:"06:30 PM" },
  { name:"Sneha N.",  dept:"Finance", desig:"Analyst",    status:"On Leave",clockIn:"—",        clockOut:"—" },
  { name:"Kiran L.",  dept:"Ops",     desig:"Lead",       status:"Absent",  clockIn:"—",        clockOut:"—" },
];
const LEAVE_DATA = [
  { emp:"Priya S.",  type:"Sick Leave",   from:"10-Jun", to:"11-Jun", days:2, status:"Approved" },
  { emp:"Rahul M.",  type:"Casual Leave", from:"13-Jun", to:"13-Jun", days:1, status:"Pending"  },
  { emp:"Ananya K.", type:"Annual Leave", from:"20-Jun", to:"24-Jun", days:5, status:"Approved" },
];
const SALES_TARGET_DATA = [
  { rep:"Arjun M.",  target:"₹3,50,000", achieved:"₹4,10,000", pct:117, commission:"₹20,500" },
  { rep:"Priya S.",  target:"₹3,00,000", achieved:"₹2,60,000", pct:87,  commission:"₹13,000" },
  { rep:"Vikram T.", target:"₹2,80,000", achieved:"₹3,20,000", pct:114, commission:"₹16,000" },
];
const BIRTHDAY_DATA = [
  { name:"Ananya K.", dept:"Warehouse", date:"09 Jun" },
  { name:"Suresh P.", dept:"Sales",     date:"15 Jun" },
  { name:"Meera R.",  dept:"HR",        date:"22 Jun" },
];
const PENDING_LEAVES = [
  ["LEV-2026-002","Casual Leave","Rahul M.","13-Jun – 13-Jun","Personal work","Pending"],
  ["LEV-2026-004","Sick Leave",  "Kiran L.","25-Jun – 26-Jun","Fever",        "Pending"],
  ["LEV-2026-005","Annual Leave","Suresh P.","28-Jun – 30-Jun","Trip",        "Pending"],
  ["LEV-2026-006","Casual Leave","Vikram T.","27-Jun – 27-Jun","Personal",    "Pending"],
];

function MiniBar({ value, max, color }) {
  const pct = max ? Math.min(100, Math.round((value/max)*100)) : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, background:G.border, borderRadius:4, height:8, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, background:color||G.green2, height:"100%", borderRadius:4 }} />
      </div>
      <span style={{ fontSize:11, color:G.muted, minWidth:32, textAlign:"right" }}>{pct}%</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   HRM DASHBOARD (original UI — data preserved)
══════════════════════════════════════════ */
function HRMDashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-IN",{ weekday:"long", day:"2-digit", month:"short", year:"numeric" });

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [todayAtt, setTodayAtt] = useState([]);
  const [attLoading, setAttLoading] = useState(true);

  const [leaveRecs, setLeaveRecs] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(true);

  const [targets, setTargets] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(true);

  const load = async () => {
    setStatsLoading(true); setAttLoading(true); setLeaveLoading(true); setTargetsLoading(true);
    try {
      const [s, a, l, t] = await Promise.all([
        hrmAPI.getDashboardStats(),
        hrmAPI.getAttendance(),   // defaults to today's records
        hrmAPI.getLeaves(),
        hrmAPI.getSalesTargets(),
      ]);
      setStats(s.stats || null);
      setTodayAtt(a.attendance || []);
      setLeaveRecs(l.leaves || []);
      setTargets(t.targets || []);
    } catch (e) { console.error(e); }
    setStatsLoading(false); setAttLoading(false); setLeaveLoading(false); setTargetsLoading(false);
  };
  useEffect(() => { load(); }, []);

  const att = stats?.attendance || { present:0, late:0, absent:0, on_leave:0 };
  const leaves = stats?.leaves || { total:0, pending:0, approved:0 };
  const payroll = stats?.payroll || { total_payrolls:0, paid:0, pending:0, total_payout:0 };

  const pendingLeaveRows = leaveRecs
    .filter(l => l.status === "Pending")
    .map(l => [l.reference_no, l.leave_type_name, l.employee_name, `${l.start_date?.slice(0,10)} – ${l.end_date?.slice(0,10)}`, l.reason, l.status]);

  const presentAttRows = todayAtt.filter(a=>a.status==="Present").map(a=>[a.employee_name, a.attendance_date?.slice(0,10), a.clock_in||"—", a.clock_out||"—"]);
  const lateAttRows    = todayAtt.filter(a=>a.status==="Late").map(a=>[a.employee_name, a.attendance_date?.slice(0,10), a.clock_in||"—", a.clock_out||"—"]);
  const absentAttRows  = todayAtt.filter(a=>a.status==="Absent").map(a=>[a.employee_name, a.attendance_date?.slice(0,10)]);

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div><h2 style={{ margin:0, fontSize:22, fontWeight:700, color:G.text }}>HR Dashboard</h2><p style={{ margin:0, fontSize:13, color:G.muted, marginTop:2 }}>{today}</p></div>
        <GreenBtn onClick={()=>navigate("/hrm/payroll")} style={{ fontSize:14, padding:"10px 24px" }}>💰 Run Payroll</GreenBtn>
      </div>

      {statsLoading ? (
        <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading dashboard…</div>
      ) : (
        <KpiRow cards={[
{ label:"Present Today", value:String(att.present + att.late), sub:`${att.present} on time, ${att.late} late`, accent:true, large:true, modalData:{ columns:["Employee","Date","Clock In","Clock Out"], rows:[...presentAttRows, ...lateAttRows] } },
{ label:"Late Today",    value:String(att.late),    color:G.amber, modalData:{ columns:["Employee","Date","Clock In","Clock Out"], rows:lateAttRows } },
          { label:"Absent Today",  value:String(att.absent),  color:G.red,   modalData:{ columns:["Employee","Date"], rows:absentAttRows } },
          { label:"On Leave Today",value:String(att.on_leave),color:G.blue },
          { label:"Pending Leaves",value:String(leaves.pending), color:G.blue, modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows:pendingLeaveRows } },
          { label:"Total Payroll Payout", value:`₹${Number(payroll.total_payout||0).toLocaleString("en-IN")}`, color:G.text },
        ]} />
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18, marginBottom:18 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:G.text }}>📅 Today's Attendance</h4>
            <Link to="/hrm/attendance" style={{ fontSize:12, color:G.green, textDecoration:"none", fontWeight:600 }}>View all →</Link>
          </div>
          {attLoading ? <div style={{ color:G.muted, fontSize:13 }}>Loading…</div> :
           todayAtt.length===0 ? <NoData /> :
           todayAtt.slice(0,4).map((a,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<3?`1px solid ${G.border}`:"none" }}>
              <div><div style={{ fontWeight:600, fontSize:13, color:G.text }}>{a.employee_name}</div><div style={{ fontSize:11, color:G.muted }}>{a.clock_in||"—"} → {a.clock_out||"—"}</div></div>
              <StatusPill text={a.status} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:G.text }}>🌿 Leave Requests</h4>
            <Link to="/hrm/leave" style={{ fontSize:12, color:G.green, textDecoration:"none", fontWeight:600 }}>View all →</Link>
          </div>
          {leaveLoading ? <div style={{ color:G.muted, fontSize:13 }}>Loading…</div> :
           leaveRecs.length===0 ? <NoData /> :
           leaveRecs.slice(0,4).map((l,i)=>(
            <div key={i} style={{ padding:"8px 0", borderBottom:i<3?`1px solid ${G.border}`:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:600, fontSize:13, color:G.text }}>{l.employee_name}</span><StatusPill text={l.status} />
              </div>
              <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{l.leave_type_name} · {l.start_date?.slice(0,10)}–{l.end_date?.slice(0,10)}</div>
            </div>
          ))}
        </Card>

        <Card>
          <h4 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:G.text }}>💰 Payroll Overview</h4>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}` }}>
            <span style={{ fontSize:13, color:G.text }}>Total Payrolls</span><span style={{ fontWeight:700, fontSize:13 }}>{payroll.total_payrolls}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}` }}>
            <span style={{ fontSize:13, color:G.text }}>Paid</span><span style={{ fontWeight:700, fontSize:13, color:G.green }}>{payroll.paid}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
            <span style={{ fontSize:13, color:G.text }}>Pending</span><span style={{ fontWeight:700, fontSize:13, color:G.amber }}>{payroll.pending}</span>
          </div>
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:G.text }}>🎯 Sales Targets</h4>
            <Link to="/hrm/sales-targets" style={{ fontSize:12, color:G.green, textDecoration:"none", fontWeight:600 }}>Manage →</Link>
          </div>
          {targetsLoading ? <div style={{ color:G.muted, fontSize:13 }}>Loading…</div> :
           targets.length===0 ? <NoData /> :
           targets.slice(0,5).map((t,i)=>{
            const achieved = Number(t.achieved_amount||0), target = Number(t.target_amount||0);
            const pct = target ? Math.round((achieved/target)*100) : 0;
            return (
              <div key={i} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:G.text }}>{t.employee_name}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:pct>=100?G.green:G.amber }}>₹{achieved.toLocaleString("en-IN")} / ₹{target.toLocaleString("en-IN")}</span>
                </div>
                <MiniBar value={pct} max={120} color={pct>=100?G.green2:"#ef5350"} />
                <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>Commission: {t.commission_pct||0}%</div>
              </div>
            );
          })}
        </Card>
        <Card>
          <h4 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:G.text }}>⚡ Quick Actions</h4>
          {[
            { label:"Add Leave",       path:"/hrm/leave",       icon:"🌿" },
            { label:"Clock In",        path:"/hrm/attendance",  icon:"⬇️" },
            { label:"Add Holiday",     path:"/hrm/holiday",     icon:"🏖" },
            { label:"Run Payroll",     path:"/hrm/payroll",     icon:"💰" },
            { label:"View My Payslip", path:"/hrm/payroll/my",  icon:"📄" },
            { label:"HRM Settings",    path:"/hrm/settings",    icon:"⚙️" },
          ].map(q=>(
            <Link key={q.label} to={q.path} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, marginBottom:6, background:G.bg, textDecoration:"none", fontSize:13, fontWeight:600, color:G.text, transition:"background .15s" }}
              onMouseEnter={e=>e.currentTarget.style.background=G.greenBg}
              onMouseLeave={e=>e.currentTarget.style.background=G.bg}>
              <span>{q.icon}</span> {q.label}<span style={{ marginLeft:"auto", color:G.muted, fontSize:14 }}>›</span>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════
   LEAVE TYPE — API connected, original UI
══════════════════════════════════════════ */
// NEW
const LEAVE_TYPE_DEFAULT_FORM = {
  name:"", leaveCode:"", description:"",
  isPaid:true, maxCount:"", monthlyAccrual:"0",
  carryForward:false, maxCarryForwardDays:"0",
  requiresApproval:true, requiresDocument:false, minDaysRequiringAttachment:"0",
  allowHalfDay:true, allowNegativeBalance:false, deductFromBalance:true,
  affectsPayroll:false, countAsPresent:true, countAsAbsent:false, active:true,
};

// A compact Yes/No pair — used a dozen times below so every toggle stays consistent
const YesNoField = ({ label, value, onChange, hint }) => (
  <Field label={label}>
    <div style={{ display:"flex", gap:20, marginTop:2 }}>
      <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13.5 }}>
        <input type="radio" checked={value===true} onChange={()=>onChange(true)} /> Yes
      </label>
      <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13.5 }}>
        <input type="radio" checked={value===false} onChange={()=>onChange(false)} /> No
      </label>
    </div>
    {hint && <div style={{ fontSize:11.5, color:G.muted, marginTop:4 }}>{hint}</div>}
  </Field>
);

function LeaveType() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(LEAVE_TYPE_DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);

  const yn = (v) => (v === false ? "No" : "Yes");

const rows = records.map(lt => [
    `LT-${String(lt.id).padStart(3,"0")}`,
    lt.leave_code || "—",
    lt.name,
    yn(lt.is_paid),
    lt.max_count === 0 ? "Unlimited" : String(lt.max_count),
    yn(lt.requires_approval),
    yn(lt.affects_payroll),
    yn(lt.active),
  ]);

  const COLUMNS = [
    "ID","Code","Leave Type","Paid","Annual Limit","Requires Approval","Affects Payroll","Active",
  ];
  const load = async () => {
    setLoading(true);
    try {
      const d = await hrmAPI.getLeaveTypes();
      setRecords(d.leaveTypes || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const newId = () => `LT-${String(records.length + 1).padStart(3,"0")}`;

  const toBody = () => ({
    name: form.name,
    leave_code: form.leaveCode || null,
    description: form.description || null,
    max_count: parseInt(form.maxCount) || 0,
    interval: "None",
    is_paid: form.isPaid,
    monthly_accrual: parseFloat(form.monthlyAccrual) || 0,
    carry_forward: form.carryForward,
    max_carry_forward_days: parseInt(form.maxCarryForwardDays) || 0,
    requires_approval: form.requiresApproval,
    requires_document: form.requiresDocument,
    min_days_requiring_attachment: parseInt(form.minDaysRequiringAttachment) || 0,
    allow_half_day: form.allowHalfDay,
    allow_negative_balance: form.allowNegativeBalance,
    deduct_from_balance: form.deductFromBalance,
    affects_payroll: form.affectsPayroll,
    count_as_present: form.countAsPresent,
    count_as_absent: form.countAsAbsent,
    active: form.active,
  });

  const resetForm = () => { setModal(false); setEditingId(null); setForm(LEAVE_TYPE_DEFAULT_FORM); };

  const save = async () => {
    if (!form.name) return;
    try { await hrmAPI.createLeaveType(toBody()); await load(); }
    catch (e) { alert(e.message); }
    resetForm();
  };

  const apiDelete = async (i) => {
    const rec = records[i];
    await hrmAPI.deleteLeaveType(rec.id);
    await load();
  };

  const openEdit = (i) => {
    const rec = records[i];
    setEditingId(rec.id);
    setForm({
      name: rec.name || "", leaveCode: rec.leave_code || "", description: rec.description || "",
      isPaid: rec.is_paid !== false,
      maxCount: String(rec.max_count ?? ""), monthlyAccrual: String(rec.monthly_accrual ?? "0"),
      carryForward: !!rec.carry_forward, maxCarryForwardDays: String(rec.max_carry_forward_days ?? "0"),
      requiresApproval: rec.requires_approval !== false,
      requiresDocument: !!rec.requires_document, minDaysRequiringAttachment: String(rec.min_days_requiring_attachment ?? "0"),
      allowHalfDay: rec.allow_half_day !== false,
      allowNegativeBalance: !!rec.allow_negative_balance,
      deductFromBalance: rec.deduct_from_balance !== false,
      affectsPayroll: !!rec.affects_payroll,
      countAsPresent: rec.count_as_present !== false,
      countAsAbsent: !!rec.count_as_absent,
      active: rec.active !== false,
    });
    setModal(true);
  };

  const saveEditType = async () => {
    if (!form.name) return;
    try { await hrmAPI.updateLeaveType(editingId, toBody()); await load(); }
    catch (e) { alert(e.message); }
    resetForm();
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Leave Types</h2>
        <GreenBtn onClick={()=>setModal(true)}>+ Add Leave Type</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Types", value:rows.length.toString(), accent:true, modalData:{ columns:COLUMNS, rows } },
        { label:"Affects Payroll", value:records.filter(lt=>lt.affects_payroll).length.toString(), color:G.red },
        { label:"Active Types",   value:records.filter(lt=>lt.active!==false).length.toString(), color:G.green },
      ]} />
      <Card>
        {loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
          <HRMTable columns={COLUMNS} rows={rows} exportFilename="leave-types" onApiDelete={apiDelete} onEditClick={openEdit} />}
      </Card>
      {modal && (
        <Modal title={editingId ? "Edit Leave Type" : "Add Leave Type"} onClose={resetForm} width={620}>
          <AutoIdField label="Leave Type ID" value={editingId ? `LT-${String(editingId).padStart(3,"0")}` : newId()} />
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
            <Field label="Leave Type Name" required><FInput value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Sick Leave" /></Field>
            <Field label="Leave Code"><FInput value={form.leaveCode} onChange={e=>setForm(f=>({...f,leaveCode:e.target.value.toUpperCase()}))} placeholder="e.g. SL" /></Field>
          </div>
          <Field label="Description"><FTextarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description of this leave type" /></Field>

          <YesNoField label="Paid Leave" value={form.isPaid} onChange={v=>setForm(f=>({...f,isPaid:v}))} hint="Approved leave of this type will not reduce salary." />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Annual Leave Limit (0 = Unlimited)"><FInput type="number" value={form.maxCount} onChange={e=>setForm(f=>({...f,maxCount:e.target.value}))} placeholder="e.g. 12" /></Field>
            <Field label="Monthly Accrual (days/month)"><FInput type="number" step="0.5" value={form.monthlyAccrual} onChange={e=>setForm(f=>({...f,monthlyAccrual:e.target.value}))} placeholder="0" /></Field>
          </div>

          <YesNoField label="Carry Forward" value={form.carryForward} onChange={v=>setForm(f=>({...f,carryForward:v}))} />
          {form.carryForward && (
            <Field label="Maximum Carry Forward Days"><FInput type="number" value={form.maxCarryForwardDays} onChange={e=>setForm(f=>({...f,maxCarryForwardDays:e.target.value}))} /></Field>
          )}

          <YesNoField label="Requires Approval" value={form.requiresApproval} onChange={v=>setForm(f=>({...f,requiresApproval:v}))} />
          <YesNoField label="Requires Supporting Document" value={form.requiresDocument} onChange={v=>setForm(f=>({...f,requiresDocument:v}))} />
          {form.requiresDocument && (
            <Field label="Minimum Days Requiring Attachment"><FInput type="number" value={form.minDaysRequiringAttachment} onChange={e=>setForm(f=>({...f,minDaysRequiringAttachment:e.target.value}))} /></Field>
          )}

          <YesNoField label="Allow Half-Day Leave" value={form.allowHalfDay} onChange={v=>setForm(f=>({...f,allowHalfDay:v}))} />
          <YesNoField label="Allow Negative Leave Balance" value={form.allowNegativeBalance} onChange={v=>setForm(f=>({...f,allowNegativeBalance:v}))} />
          <YesNoField label="Deduct From Leave Balance" value={form.deductFromBalance} onChange={v=>setForm(f=>({...f,deductFromBalance:v}))} />

          <YesNoField label="Affects Payroll" value={form.affectsPayroll} onChange={v=>setForm(f=>({...f,affectsPayroll:v}))} hint="Yes = salary is deducted for approved leave of this type (e.g. LOP)." />
          <YesNoField label="Count as Present" value={form.countAsPresent} onChange={v=>setForm(f=>({...f,countAsPresent:v}))} />
          <YesNoField label="Count as Absent" value={form.countAsAbsent} onChange={v=>setForm(f=>({...f,countAsAbsent:v}))} />
          <YesNoField label="Active" value={form.active} onChange={v=>setForm(f=>({...f,active:v}))} />

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:10 }}>
            <GreenBtn onClick={editingId ? saveEditType : save}>{editingId ? "Update" : "Save"}</GreenBtn>
            <DarkBtn onClick={resetForm}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
/* ══════════════════════════════════════════
   LEAVE — API connected, original UI
══════════════════════════════════════════ */
function Leave() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const loadLeaveTypes = async () => {
    try {
      const d = await hrmAPI.getLeaveTypes();
      setLeaveTypes(d.leaveTypes || []);
    } catch (e) { console.error(e); }
  };
  

  const rows = records.map(l => [
    l.reference_no, l.leave_type_name, l.employee_name,
    `${l.start_date?.slice(0,10)} – ${l.end_date?.slice(0,10)}`, l.reason, l.status,
  ]);

  const load = async () => {
    setLoading(true);
    try {
      const d = await hrmAPI.getLeaves();
      setRecords(d.leaves || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); loadLeaveTypes(); }, []);

  const newId = () => {
    const nums = records.map(r=>parseInt((r.reference_no||"").replace("LEV-2026-",""))||0);
    const next = nums.length>0?Math.max(...nums)+1:1;
    return `LEV-2026-${String(next).padStart(3,"0")}`;
  };
  const save = async () => {
    if (!form.leaveType||!form.startDate||!form.endDate) return;
    try {
      await hrmAPI.createLeave({ employee_name:form.employee||"Self", leave_type_name:form.leaveType, start_date:form.startDate, end_date:form.endDate, reason:form.reason });
      await load();
    } catch (e) { alert(e.message); }
    setModal(false); setForm({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });
  };

const apiDelete = async (i) => {
    const rec = records[i];
    await hrmAPI.deleteLeave(rec.id);
    await load();
  };

  const [editingId,setEditingId]=useState(null);
  const openEdit = (i) => {
    const rec = records[i];
    setEditingId(rec.id);
    setForm({
      employee: rec.employee_name || "",
      leaveType: rec.leave_type_name || "",
      startDate: rec.start_date ? String(rec.start_date).slice(0,10) : "",
      endDate: rec.end_date ? String(rec.end_date).slice(0,10) : "",
      reason: rec.reason || "",
    });
    setModal(true);
  };
  const saveEditLeave = async () => {
    if (!form.leaveType||!form.startDate||!form.endDate) return;
    try {
      await hrmAPI.updateLeave(editingId, {
        leave_type_name:form.leaveType, employee_name:form.employee,
        start_date:form.startDate, end_date:form.endDate,
        reason:form.reason, status: records.find(r=>r.id===editingId)?.status || "Pending",
      });
      await load();
    } catch (e) { alert(e.message); }
    setModal(false); setEditingId(null); setForm({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });
  };
const approveLeave = async (i) => {
    if (!window.confirm("Approve this leave request?")) return;
    const remarks = window.prompt("Add a remark for the employee (optional):", "") || "";
    try { await hrmAPI.updateLeaveStatus(records[i].id, "Approved", remarks); await load(); }
    catch (e) { alert(e.message); }
  };
  const rejectLeave = async (i) => {
    if (!window.confirm("Reject this leave request?")) return;
    const remarks = window.prompt("Reason for rejection (optional):", "") || "";
    try { await hrmAPI.updateLeaveStatus(records[i].id, "Rejected", remarks); await load(); }
    catch (e) { alert(e.message); }
  };

  const approved = rows.filter(r=>r[5]==="Approved");
  const pending  = rows.filter(r=>r[5]==="Pending");
  const rejected = rows.filter(r=>r[5]==="Rejected");
  const leaveTypeOptions = leaveTypes.length ? leaveTypes.map(lt=>lt.name) : ["Vacation","Sick Leave","Casual Leave","Health issue"];

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Leave Management</h2>
        <GreenBtn onClick={()=>setModal(true)}>+ Apply Leave</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Leaves", value:rows.length.toString(), accent:true, modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows } },
        { label:"Approved", value:approved.length.toString(), color:G.green, modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows:approved } },
        { label:"Pending",  value:pending.length.toString(),  color:G.amber, modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows:pending } },
        { label:"Rejected", value:rejected.length.toString(), color:G.red,   modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows:rejected } },
      ]} />
    <Card>
        {loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
          <HRMTable
            columns={["Ref No","Leave Type","Employee","Date","Reason","Status"]}
            rows={rows}
            exportFilename="leaves"
            onApiDelete={apiDelete}
            onEditClick={openEdit}
            extraActions={(i) => rows[i][5] === "Pending" ? (
              <>
                <button onClick={()=>approveLeave(i)} style={{ padding:"5px 12px", background:G.greenBg, color:G.green, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12 }}>✓ Approve</button>
                <button onClick={()=>rejectLeave(i)} style={{ padding:"5px 12px", background:G.redBg, color:G.red, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12 }}>✕ Reject</button>
              </>
            ) : null}
          />}
      </Card>
      {modal && (
        <Modal title={editingId ? "Edit Leave" : "Apply Leave"} onClose={()=>{setModal(false); setEditingId(null); setForm({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });}}>
          {!editingId && <AutoIdField label="Reference No." value={newId()} />}
          <Field label="Employee"><FInput value={form.employee} onChange={e=>setForm(f=>({...f,employee:e.target.value}))} placeholder="Employee name" /></Field>
          <Field label="Leave Type" required>
            <FSelect value={form.leaveType} onChange={e=>setForm(f=>({...f,leaveType:e.target.value}))}>
              <option value="">Please Select</option>
           // NEW
              {leaveTypes.length === 0
                ? <option value="" disabled>No leave types added yet — add one in Leave Type tab</option>
                : leaveTypes.filter(lt => lt.active !== false).map(lt => <option key={lt.id} value={lt.name}>{lt.name}</option>)}
            </FSelect>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start Date" required><FInput type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} /></Field>
            <Field label="End Date"   required><FInput type="date" value={form.endDate}   onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} /></Field>
          </div>
          <Field label="Reason"><FTextarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} placeholder="Reason for leave" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={editingId ? saveEditLeave : save}>{editingId ? "Update" : "Submit"}</GreenBtn><DarkBtn onClick={()=>{setModal(false); setEditingId(null); setForm({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   ATTENDANCE (original UI + working CSV/PDF/Print)
══════════════════════════════════════════ */
function fmtDate(d) { return d.toLocaleDateString("en-IN",{ day:"2-digit", month:"2-digit", year:"numeric" }); }
function toISODate(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d)) return String(dateVal).slice(0,10);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function normalize(str) { return String(str||"").trim().toLowerCase(); }
function getDateRange(filter,customFrom,customTo) {
  const now=new Date(); const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if (filter==="Today") return {from:today,to:today};
  if (filter==="Yesterday") { const y=new Date(today); y.setDate(y.getDate()-1); return {from:y,to:y}; }
  if (filter==="This Week") { const day=today.getDay(); const mon=new Date(today); mon.setDate(today.getDate()-(day===0?6:day-1)); return {from:mon,to:today}; }
  if (filter==="Last Week") { const day=today.getDay(); const mon=new Date(today); mon.setDate(today.getDate()-(day===0?6:day-1)-7); const sun=new Date(mon); sun.setDate(mon.getDate()+6); return {from:mon,to:sun}; }
  if (filter==="This Month") return {from:new Date(today.getFullYear(),today.getMonth(),1),to:today};
  if (filter==="Last Month") { const first=new Date(today.getFullYear(),today.getMonth()-1,1); const last=new Date(today.getFullYear(),today.getMonth(),0); return {from:first,to:last}; }
  if (filter==="Custom"&&customFrom&&customTo) return {from:new Date(customFrom),to:new Date(customTo)};
  return null;
}
function parseIndianDate(str) { if(!str) return null; const p=str.split("/"); if(p.length!==3) return null; return new Date(+p[2],+p[1]-1,+p[0]); }

function Attendance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [officeSettings,setOfficeSettings]=useState(null);
  useEffect(() => { hrmAPI.getSettings().then(d=>setOfficeSettings(d.settings)).catch(()=>{}); }, []);
  const params = new URLSearchParams(location.search);
  const initialTab = params.get("tab") || "All Attendance";
  const [tab,_setTab]=useState(initialTab);
  const setTab = (t) => {
    _setTab(t);
    const p = new URLSearchParams(location.search);
    p.set("tab", t);
    navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
  };
  const [dateFilter,setDateFilter]=useState("All");
  const [customFrom,setCustomFrom]=useState("");
  const [customTo,setCustomTo]=useState("");
const [empFilter,setEmpFilter]=useState("All");
const [shiftFilter,setShiftFilter]=useState("");
  const [byDateInput,setByDateInput]=useState(new Date().toISOString().split("T")[0]);
  const [byDateFilter,setByDateFilter]=useState(new Date().toISOString().split("T")[0]);
const [statusFilter,setStatusFilter]=useState("All");
  const [empSearch,setEmpSearch]=useState("");
  const [shiftRecords,setShiftRecords]=useState([]);
  const [shiftsLoading,setShiftsLoading]=useState(true);
  const shifts = shiftRecords.map(s=>[s.id_display, s.name, s.shift_type, s.start_time, s.end_time, s.holiday_day||"—"]);
  const [departments,setDepartments]=useState([]);
  const loadDepartments = async () => {
    try { const d = await hrmAPI.getDepartments(); setDepartments(d.departments||[]); } catch(e){ console.error(e); }
  };

  const [attRecords,setAttRecords]=useState([]);
  const [attLoading,setAttLoading]=useState(true);

  const [clockInModal,setClockInModal]=useState(false);
  const [addShiftModal,setAddShiftModal]=useState(false);
  const [addAttModal,setAddAttModal]=useState(false);
  const [editingAttId,setEditingAttId]=useState(null);
  const [viewAttRecord,setViewAttRecord]=useState(null);
  const [attForm,setAttForm]=useState({ employee:"", date:new Date().toISOString().split("T")[0], status:"Present", clockIn:"", clockOut:"", department:"", shiftName:"" });
  const [clockNote,setClockNote]=useState("");
  const [shiftForm,setShiftForm]=useState({ name:"", type:"Fixed shift", start:"", end:"", holiday:"" });
  const loadShifts = async () => {
    
    setShiftsLoading(true);
    try {
      const d = await hrmAPI.getShifts();
      const list = (d.shifts||[]).map(s => ({ ...s, id_display: `SHF-${String(s.id).padStart(3,"0")}` }));
      setShiftRecords(list);
    } catch(e){ console.error(e); }
    setShiftsLoading(false);
  };
  const loadAttendance = async () => {
    setAttLoading(true);
    try {
      const d = await hrmAPI.getAttendance("?date_filter=All");
      setAttRecords(d.attendance||[]);
    } catch(e){ console.error(e); }
    setAttLoading(false);
  };
const attApiDelete = async (id) => {
    if (!window.confirm("Delete this attendance record? This cannot be undone.")) return;
    try { await hrmAPI.deleteAttendanceRecord(id); await loadAttendance(); }
    catch(e){ alert(e.message); }
  };
 const viewAtt = (row) => {
    const recId = row[6];
    const fullRecord = attRecords.find(a=>a.id===recId);
    if (!fullRecord) { alert("Could not find this record — please refresh and try again."); return; }
    setViewAttRecord(fullRecord);
  };
  const openEditAtt = (row) => {
    const recId = row[6];
    const fullRecord = attRecords.find(a=>a.id===recId);
    if (!fullRecord) { alert("Could not find this record — please refresh and try again."); return; }
    setEditingAttId(recId);
    setAttForm({
      employee: fullRecord.employee_name || row[0],
      date: fullRecord.attendance_date ? String(fullRecord.attendance_date).slice(0,10) : "",
      status: fullRecord.status || row[4],
      clockIn: fullRecord.clock_in || "",
      clockOut: fullRecord.clock_out || "",
      department: fullRecord.department || "",
      shiftName: fullRecord.shift_name || "",
    });
    setAddAttModal(true);
  };
  useEffect(() => { loadShifts(); loadAttendance(); loadDepartments(); }, []);

  const newShiftId = ()=>`SHF-${String(shiftRecords.length+1).padStart(3,"0")}`;
  const saveShift = async ()=>{
    if(!shiftForm.name||!shiftForm.start||!shiftForm.end) return;
    try {
      await hrmAPI.createShift({ name:shiftForm.name, shift_type:shiftForm.type, start_time:shiftForm.start, end_time:shiftForm.end, holiday_day:shiftForm.holiday||null });
      await loadShifts();
    } catch(e){ alert(e.message); }
    setAddShiftModal(false); setShiftForm({ name:"", type:"Fixed shift", start:"", end:"", holiday:"" });
  };
  const shiftApiDelete = async (i) => {
    const rec = shiftRecords[i];
    await hrmAPI.deleteShift(rec.id);
    await loadShifts();
  };
  const shiftApiEdit = async (i, vals) => {
    const rec = shiftRecords[i];
    await hrmAPI.updateShift(rec.id, { name:vals[1], shift_type:vals[2], start_time:vals[3], end_time:vals[4], holiday_day:vals[5]==="—"?null:vals[5] });
    await loadShifts();
  };

  // Build display rows for attendance table straight from DB records
  
const allAtt = attRecords.map(a => [
    a.employee_name, a.attendance_date ? fmtDate(new Date(a.attendance_date)) : "", a.clock_in||"—", a.clock_out||"—", a.status, a.department||"—", a.id, a.shift_name||"—",
  ]);
const byDateRows = attRecords
    .filter(a => toISODate(a.attendance_date) === byDateFilter)
    .map(a => [a.employee_name, a.status, a.clock_in||"—", a.clock_out||"—", a.department||"—"]);
const byShiftRows = attRecords
    .filter(a => shiftFilter && normalize(a.shift_name) === normalize(shiftFilter))
    .map(a => [a.employee_name, a.attendance_date ? fmtDate(new Date(a.attendance_date)) : "", a.clock_in||"—", a.clock_out||"—", a.status]);
 const filteredAtt=(()=>{
    let rows=allAtt;
    const range=getDateRange(dateFilter,customFrom,customTo);
    if(range) rows=rows.filter(r=>{ const d=parseIndianDate(r[1]); if(!d) return false; return d>=range.from&&d<=range.to; });
    if(empFilter!=="All") rows=rows.filter(r=>r[0]===empFilter);
    if(statusFilter!=="All") rows=rows.filter(r=>r[4]===statusFilter);
    if(empSearch.trim()) {
      const q = normalize(empSearch);
      rows = rows.filter(r =>
        normalize(r[0]).includes(q) ||   // Employee
        normalize(r[5]).includes(q) ||   // Department
        normalize(r[7]).includes(q)      // Shift
      );
    }
    return rows;
  })();
 const todayStr=fmtDate(new Date());
  const todayRows=allAtt.filter(r=>r[1]===todayStr);
  const presentToday=todayRows.filter(r=>r[4]==="Present");
  const lateToday=todayRows.filter(r=>r[4]==="Late");
  const absentToday=todayRows.filter(r=>r[4]==="Absent");
  const onLeaveToday=todayRows.filter(r=>r[4]==="On Leave");
  const uniqueEmps=[...new Set(allAtt.map(r=>r[0]))].sort();
  const filterLabel=(()=>{ const range=getDateRange(dateFilter,customFrom,customTo); if(!range) return "All Records"; const from=fmtDate(range.from); const to=fmtDate(range.to); return from===to?from:`${from} → ${to}`; })();

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Attendance</h2>
     <div style={{ display:"flex", gap:10 }}>
         <GreenBtn onClick={()=>{
            setEditingAttId(null);
            setAttForm({ employee:"", date:new Date().toISOString().split("T")[0], status:"Present", clockIn:"", clockOut:"", department:"", shiftName:"" });
            setAddAttModal(true);
          }}>+ Add Attendance</GreenBtn>
    
          <GreenBtn onClick={()=>setClockInModal(true)}>⬇ Clock In</GreenBtn>
        </div>
      </div>
      {officeSettings && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, padding:"10px 16px", background:G.greenBg, border:`1px solid ${G.border}`, borderRadius:10, fontSize:13, color:G.text, fontWeight:600 }}>
          🕒 Office Hours: {officeSettings.work_start_time?.slice(0,5) || "09:00"} – {officeSettings.work_end_time?.slice(0,5) || "18:00"}
          <span style={{ color:G.muted, fontWeight:500 }}>(grace: {officeSettings.late_grace_minutes ?? 15} min — clock in after this counts as Late. Edit in HRM → Settings.)</span>
        </div>
      )}
     <KpiRow cards={[
        { label:"Present Today",  value:presentToday.length.toString(), accent:true, modalData:{ columns:["Employee","Date","Clock In","Clock Out","Status","Dept"], rows:presentToday } },
        { label:"Late Today",     value:lateToday.length.toString(),    color:G.amber, modalData:{ columns:["Employee","Date","Clock In","Clock Out","Status","Dept"], rows:lateToday } },
        { label:"Absent Today",   value:absentToday.length.toString(),  color:G.red,   modalData:{ columns:["Employee","Date","Clock In","Clock Out","Status","Dept"], rows:absentToday } },
        { label:"On Leave Today", value:onLeaveToday.length.toString(), color:G.blue,  modalData:{ columns:["Employee","Date","Clock In","Clock Out","Status","Dept"], rows:onLeaveToday } },
      
      ]} />
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${G.border}`, marginBottom:20 }}>
       {["All Attendance","Shifts","By Shift","By Date"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 18px", border:"none", background:"none", cursor:"pointer", fontWeight:tab===t?700:500, color:tab===t?G.green:G.muted, borderBottom:tab===t?`3px solid ${G.green}`:"3px solid transparent", fontSize:13 }}>{t}</button>
        ))}
      </div>

      {tab==="Shifts" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}><GreenBtn onClick={()=>setAddShiftModal(true)}>+ Add Shift</GreenBtn></div>
          {shiftsLoading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
            <HRMTable columns={["ID","Name","Type","Start","End","Holiday"]} rows={shifts} exportFilename="shifts" onApiDelete={shiftApiDelete} onApiEdit={shiftApiEdit}
             extraActions={i=><button style={{ padding:"0 12px", height:30, background:G.greenBg, color:G.green, border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>Assign Users</button>}
            />}
        </Card>
      )}

      {tab==="All Attendance" && (
        <div>
          <Card style={{ marginBottom:16, padding:"16px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:G.muted }}>
                Show
                <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe" }}>
                  {["All","Today","Yesterday","This Week","Last Week","This Month","Last Month","Custom"].map(o=><option key={o}>{o}</option>)}
                </select>
                entries
              </div>

              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", minWidth:110 }}>
                {["All","Present","Late","Absent","On Leave"].map(o=><option key={o}>{o}</option>)}
              </select>

              <select value={empFilter} onChange={e=>setEmpFilter(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", minWidth:110 }}>
                <option>All</option>{uniqueEmps.map(n=><option key={n}>{n}</option>)}
              </select>

              {dateFilter==="Custom" && (
                <>
                  <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text }} />
                  <span style={{ fontSize:13, color:G.muted }}>to</span>
                  <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text }} />
                </>
              )}

              <div style={{ position:"relative", flex:1, minWidth:220 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:G.muted, fontSize:14 }}></span>
                <input
                  type="text"
                  placeholder="Search ..."
                  value={empSearch || ""}
                  onChange={e=>setEmpSearch && setEmpSearch(e.target.value)}
                  style={{ width:"100%", padding:"7px 12px 7px 34px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, boxSizing:"border-box" }}
                />
              </div>

              {(dateFilter!=="All" || empFilter!=="All" || statusFilter!=="All") && (
                <button onClick={()=>{ setDateFilter("All"); setEmpFilter("All"); setStatusFilter("All"); setCustomFrom(""); setCustomTo(""); }} style={{ padding:"7px 16px", background:G.redBg, color:G.red, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700 }}>✕ Reset</button>
              )}
            </div>
          </Card>
          <Card>
            {attLoading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
            filteredAtt.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:G.muted }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                <div style={{ fontSize:15, fontWeight:600 }}>No attendance records found</div>
                <div style={{ fontSize:13, marginTop:4 }}>Try changing the date filter or selecting "All"</div>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
<div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  <button onClick={()=>doExportCSV(filteredAtt,["Employee","Date","Clock In","Clock Out","Status","Department","Shift"],"attendance")} style={{ padding:"6px 14px", border:`1px solid ${G.green}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.green }}>📄 CSV</button>
                  <button onClick={()=>doExportCSV(filteredAtt,["Employee","Date","Clock In","Clock Out","Status","Department","Shift"],"attendance")} style={{ padding:"6px 14px", border:`1px solid ${G.blue}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.blue }}>📊 Excel</button>
                  <button onClick={()=>doExportPDF(filteredAtt,["Employee","Date","Clock In","Clock Out","Status","Department","Shift"],"Attendance Report")} style={{ padding:"6px 14px", border:`1px solid ${G.red}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.red }}>🖨 PDF</button>
                  <button onClick={()=>window.print()} style={{ padding:"6px 14px", border:`1px solid ${G.muted}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:G.muted }}>🖨 Print</button>
                </div>
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr style={{ background:G.greenBg }}>{["Employee","Date","Clock In","Clock Out","Status","Department","Shift"].map(c=>(<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{c}</th>))}<th style={{ padding:"10px 14px", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em", textAlign:"center", width:130 }}>Actions</th></tr></thead>
                  <tbody>
                    {filteredAtt.map((row,i)=>{
                      const statusColors={ Present:{bg:G.greenBg,color:G.green},Late:{bg:G.amberBg,color:G.amber},Absent:{bg:G.redBg,color:G.red},"On Leave":{bg:G.blueBg,color:G.blue} };
                      const sc=statusColors[row[4]]||{bg:"#f5f5f5",color:G.muted};
                      return (
                        <tr key={i} style={{ background:i%2===0?G.white:G.rowHov }} onMouseEnter={e=>e.currentTarget.style.background=G.greenBg} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?G.white:G.rowHov}>
                          <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text, fontWeight:600 }}>{row[0]}</td>
                          <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>{row[1]}</td>
                          <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>{row[2]}</td>
                          <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>{row[3]}</td>
                          <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}><span style={{ background:sc.bg, color:sc.color, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>{row[4]}</span></td>
                         <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.muted }}>{row[5]}</td>
                          <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.muted }}>{row[7]}</td>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, textAlign:"center" }}>
                            <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                              <button title="View" onClick={()=>viewAtt(row)} style={{ width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", borderRadius:6, cursor:"pointer", color:"#0ea5e9", fontSize:16 }}>
                                <i className="ti ti-eye"></i>
                              </button>
                              <button title="Edit" onClick={()=>openEditAtt(row)} style={{ width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", borderRadius:6, cursor:"pointer", color:"#d97706", fontSize:16 }}>
                                <i className="ti ti-pencil"></i>
                              </button>
                              <button title="Delete" onClick={()=>attApiDelete(row[6])} style={{ width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", borderRadius:6, cursor:"pointer", color:"#dc2626", fontSize:16 }}>
                                <i className="ti ti-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop:10, fontSize:13, color:G.muted }}>Showing {filteredAtt.length} of {allAtt.length} total records</div>
              </div>
            )}
          </Card>
        </div>
      )}
{tab==="By Shift" && (
  <Card>
    <div style={{ marginBottom:14 }}>
      <label style={{ fontWeight:600, fontSize:13, color:G.text, marginRight:10 }}>Select Shift:</label>
      <select
        value={shiftFilter}
        onChange={e=>setShiftFilter(e.target.value)}
        style={{ padding:"8px 12px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif" }}
      >
        <option value="">Please Select</option>
        {shiftRecords.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
    {!shiftFilter ? (
      <div style={{ textAlign:"center", padding:32, color:G.muted }}>Please select a shift to view its attendance.</div>
    ) : byShiftRows.length===0 ? (
      <NoData />
    ) : (
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
        <thead><tr style={{ background:G.greenBg }}>{["Employee","Date","Clock In","Clock Out","Status"].map(c=>(<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase" }}>{c}</th>))}</tr></thead>
        <tbody>
          {byShiftRows.map((row,i)=>(
            <tr key={i} style={{ background:i%2===0?G.white:G.rowHov }}>
              <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[0]}</td>
              <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[1]}</td>
              <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[2]}</td>
              <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[3]}</td>
              <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}><StatusPill text={row[4]} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </Card>
)}
     {tab==="By Date" && (
        <Card>
          <div style={{ marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
            <label style={{ fontWeight:600, fontSize:13, color:G.text }}>Select Date:</label>
            <input
              type="date"
              value={byDateInput}
              onChange={e=>setByDateInput(e.target.value)}
              style={{ padding:"8px 12px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif" }}
            />
            <GreenBtn onClick={()=>setByDateFilter(byDateInput)} style={{ padding:"8px 18px", fontSize:12 }}>View</GreenBtn>
          </div>
          {byDateRows.length===0 ? (
            <NoData />
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr style={{ background:G.greenBg }}>{["Employee","Status","Clock In","Clock Out","Department"].map(c=>(<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase" }}>{c}</th>))}</tr></thead>
              <tbody>
                {byDateRows.map((row,i)=>(
                  <tr key={i} style={{ background:i%2===0?G.white:G.rowHov }}>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[0]}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}><StatusPill text={row[1]} /></td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[2]}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[3]}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {clockInModal && (
        <Modal title="Clock In" onClose={()=>setClockInModal(false)} width={420}>
          <p style={{ color:G.muted, fontSize:13, margin:"0 0 16px" }}>IP Address: 192.168.1.10 · {new Date().toLocaleTimeString()}</p>
          <Field label="Clock In Note"><FTextarea value={clockNote} onChange={e=>setClockNote(e.target.value)} placeholder="Optional note..." /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={async()=>{
              try {
                await hrmAPI.clockIn({ note:clockNote });
                await loadAttendance();
              } catch(e){ alert(e.message); }
              setClockInModal(false); setClockNote("");
            }}>Submit</GreenBtn>
            <DarkBtn onClick={()=>setClockInModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    {viewAttRecord && (
        <Modal title="Attendance Details" onClose={()=>setViewAttRecord(null)} width={440}>
          {[
            { label:"Employee", value: viewAttRecord.employee_name || "—" },
            { label:"Date", value: viewAttRecord.attendance_date ? String(viewAttRecord.attendance_date).slice(0,10) : "—" },
            { label:"Status", value: viewAttRecord.status || "—" },
            { label:"Clock In", value: viewAttRecord.clock_in || "—" },
            { label:"Clock Out", value: viewAttRecord.clock_out || "—" },
            { label:"Department", value: viewAttRecord.department || "—" },
            { label:"Shift", value: viewAttRecord.shift_name || "—" },
            { label:"Note", value: viewAttRecord.note || "—" },
          ].map(f => (
            <div key={f.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
              <span style={{ fontSize:13, fontWeight:600, color:G.muted }}>{f.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:G.text }}>{f.value}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
            <DarkBtn onClick={()=>setViewAttRecord(null)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {addAttModal && (
     <Modal title={editingAttId ? "Edit Attendance" : "Add Attendance"} onClose={()=>{setAddAttModal(false); setEditingAttId(null);}} width={480}>
          <Field label="Employee" required><FInput value={attForm.employee} onChange={e=>setAttForm(f=>({...f,employee:e.target.value}))} placeholder="Employee name" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Date" required><FInput type="date" value={attForm.date} onChange={e=>setAttForm(f=>({...f,date:e.target.value}))} /></Field>
            <Field label="Status" required>
              <FSelect value={attForm.status} onChange={e=>setAttForm(f=>({...f,status:e.target.value}))}>
                <option>Present</option><option>Late</option><option>Absent</option><option>On Leave</option>
              </FSelect>
            </Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Clock In"><FInput type="time" value={attForm.clockIn} onChange={e=>setAttForm(f=>({...f,clockIn:e.target.value}))} /></Field>
            <Field label="Clock Out"><FInput type="time" value={attForm.clockOut} onChange={e=>setAttForm(f=>({...f,clockOut:e.target.value}))} /></Field>
          </div>
        <Field label="Department">
            <FSelect value={attForm.department} onChange={e=>setAttForm(f=>({...f,department:e.target.value}))}>
              <option value="">Please Select</option>
              {departments.length === 0
                ? <option value="" disabled>No departments added yet</option>
                : departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Shift" required>
            <FSelect value={attForm.shiftName} onChange={e=>setAttForm(f=>({...f,shiftName:e.target.value}))}>
              <option value="">Please Select</option>
              {shiftRecords.length === 0
                ? <option value="" disabled>No shifts added yet</option>
                : shiftRecords.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </FSelect>
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={async()=>{
              if(!attForm.employee||!attForm.date) return;
              try {
               if (editingAttId) {
                  await hrmAPI.updateAttendanceRecord(editingAttId, {
                    employee_name:attForm.employee, attendance_date:attForm.date, status:attForm.status,
                    clock_in:attForm.clockIn||null, clock_out:attForm.clockOut||null, department:attForm.department||null,
                    shift_name:attForm.shiftName||null,
                  });
                } else {
                  await hrmAPI.createAttendanceRecord({
                    employee_name:attForm.employee, attendance_date:attForm.date, status:attForm.status,
                    clock_in:attForm.clockIn||null, clock_out:attForm.clockOut||null, department:attForm.department||null,
                    shift_name:attForm.shiftName||null,
                  });
                }
        await loadAttendance();
        setDateFilter("All");
                alert(`Attendance record ${editingAttId ? "updated" : "saved"} successfully!\n\nIf you don't see it in the table, check your Date Range / Employee / Status filters — the record's date might not match "Today."`);
              } catch(e){ alert(e.message); }
              setAddAttModal(false); setEditingAttId(null);
              setAttForm({ employee:"", date:new Date().toISOString().split("T")[0], status:"Present", clockIn:"", clockOut:"", department:"" });
            }}>{editingAttId ? "Update" : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>{setAddAttModal(false); setEditingAttId(null);}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {addShiftModal && (
        <Modal title="Add Shift" onClose={()=>setAddShiftModal(false)}>
          <AutoIdField label="Shift ID" value={newShiftId()} />
          <Field label="Name" required><FInput value={shiftForm.name} onChange={e=>setShiftForm(f=>({...f,name:e.target.value}))} placeholder="Shift name" /></Field>
          <Field label="Shift Type"><FSelect value={shiftForm.type} onChange={e=>setShiftForm(f=>({...f,type:e.target.value}))}><option>Fixed shift</option><option>Flexible shift</option><option>Rotating shift</option></FSelect></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start" required><FInput type="time" value={shiftForm.start} onChange={e=>setShiftForm(f=>({...f,start:e.target.value}))} /></Field>
            <Field label="End"   required><FInput type="time" value={shiftForm.end}   onChange={e=>setShiftForm(f=>({...f,end:e.target.value}))} /></Field>
          </div>
          <Field label="Holiday"><FInput value={shiftForm.holiday} onChange={e=>setShiftForm(f=>({...f,holiday:e.target.value}))} placeholder="e.g. Sun" /></Field>
         <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}><GreenBtn onClick={saveShift}>Save</GreenBtn><DarkBtn onClick={()=>setAddShiftModal(false)}>Close</DarkBtn></div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   PAYROLL (original UI + API save + working exports)
══════════════════════════════════════════ */
function Payroll() {
  const [tab,setTab]=useState("All Payrolls");
  const [modal,setModal]=useState(false);

  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const rows = records.map(p => [p.reference_no, p.employee_name, p.department||"—", p.designation||"—", p.month_year, `₹${Number(p.net_salary||0).toLocaleString("en-IN")}`, p.status]);

const [form,setForm]=useState({ employee:"", month:"", department:"", designation:"" });
  const [editModal,setEditModal]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [editForm,setEditForm]=useState({ employee:"", department:"", designation:"", month:"", amount:"", status:"Pending" });
  const [departments,setDepartments]=useState([]);
  const [designations,setDesignations]=useState([]);
  const [compRecords,setCompRecords]=useState([]);
  const [compLoading,setCompLoading]=useState(true);
  const payComp = compRecords.map(c => [`PC-${String(c.id).padStart(3,"0")}`, c.description, c.component_type, c.calc_method||"Fixed", c.calc_method==="Percentage" ? `${Number(c.amount||0)}%` : `₹${Number(c.amount||0).toLocaleString("en-IN")}`, c.status||"Active", c.applicable_from ? String(c.applicable_from).slice(0,10) : "—"]);

const [compModal,setCompModal]=useState(false);
  const [compForm,setCompForm]=useState({ desc:"", type:"Earning", calcMethod:"Fixed", amount:"", status:"Active", date:"" });
  const [compSaving,setCompSaving]=useState(false);
  const [editingCompId,setEditingCompId]=useState(null);
  const openEditComp = (i) => {
    const rec = compRecords[i];
    setEditingCompId(rec.id);
    setCompForm({
      desc: rec.description || "",
      type: rec.component_type || "Earning",
      calcMethod: rec.calc_method || "Fixed",
      amount: String(rec.amount ?? ""),
      status: rec.status || "Active",
      date: rec.applicable_from ? String(rec.applicable_from).slice(0,10) : "",
    });
    setCompModal(true);
  };
  const saveEditComp = async () => {
    if (!compForm.desc) return;
    try {
      await hrmAPI.updatePayComponent(editingCompId, {
        description: compForm.desc,
        component_type: compForm.type,
        calc_method: compForm.calcMethod,
        amount: parseFloat(compForm.amount) || 0,
        status: compForm.status,
        applicable_from: compForm.date || null,
      });
      await loadComponents();
    } catch(e) { alert(e.message); }
    setCompModal(false); setEditingCompId(null);
    setCompForm({ desc:"", type:"Earning", calcMethod:"Fixed", amount:"", status:"Active", date:"" });
  };

  const [groupRecords,setGroupRecords]=useState([]);
  const [groupsLoading,setGroupsLoading]=useState(true);
  const groupRows = groupRecords.map(g => [`PG-${String(g.id).padStart(3,"0")}`, g.name, g.pay_schedule||"—", g.employee_count!=null?String(g.employee_count):"0", g.description||"—"]);
const [groupModal,setGroupModal]=useState(false);
  const [groupForm,setGroupForm]=useState({ name:"", schedule:"Monthly", employees:"", desc:"" });
  const [editingGroupId,setEditingGroupId]=useState(null);
  const openEditGroup = (i) => {
    const rec = groupRecords[i];
    setEditingGroupId(rec.id);
    setGroupForm({
      name: rec.name || "",
      schedule: rec.pay_schedule || "Monthly",
      employees: String(rec.employee_count ?? ""),
      desc: rec.description || "",
    });
    setGroupModal(true);
  };
  const saveEditGroup = async () => {
    if (!groupForm.name) return;
    try {
      await hrmAPI.updatePayrollGroup(editingGroupId, {
        name: groupForm.name,
        pay_schedule: groupForm.schedule,
        employee_count: parseInt(groupForm.employees) || 0,
        description: groupForm.desc,
      });
      await loadGroups();
    } catch(e) { alert(e.message); }
    setGroupModal(false); setEditingGroupId(null);
    setGroupForm({ name:"", schedule:"Monthly", employees:"", desc:"" });
  };

  const [manageCompModal,setManageCompModal]=useState(false);
  const [managingGroupIdx,setManagingGroupIdx]=useState(null);
  const [groupCompIds,setGroupCompIds]=useState([]);
  const [groupCompLoading,setGroupCompLoading]=useState(false);
  const [groupCompSaving,setGroupCompSaving]=useState(false);

  const openManageComponents = async (i) => {
    const rec = groupRecords[i];
    setManagingGroupIdx(i);
    setManageCompModal(true);
    setGroupCompLoading(true);
    try {
      const d = await hrmAPI.getGroupComponents(rec.id);
      setGroupCompIds((d.components || []).map(c => c.id));
    } catch(e) { alert(e.message); }
    setGroupCompLoading(false);
  };

  const toggleGroupComp = (id) => {
    setGroupCompIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  };

 const saveGroupComponents = async () => {
    const rec = groupRecords[managingGroupIdx];
    setGroupCompSaving(true);
    try {
      await hrmAPI.updateGroupComponents(rec.id, groupCompIds);
      setManageCompModal(false); setManagingGroupIdx(null);
    } catch(e) { alert(e.message); }
    setGroupCompSaving(false);
  };

  const [employees,setEmployees]=useState([]);
  const [employeesLoading,setEmployeesLoading]=useState(true);
  const [assigningId,setAssigningId]=useState(null);

  const loadEmployees = async () => {
    setEmployeesLoading(true);
    try { const d = await hrmAPI.getEmployeesWithGroups(); setEmployees(d.employees||[]); } catch(e){ console.error(e); }
    setEmployeesLoading(false);
  };

const handleAssign = async (userId, groupId, source) => {
    setAssigningId(userId);
    try {
      await hrmAPI.assignPayrollGroup(userId, groupId || null, source || 'user');
      await loadEmployees();
      await loadGroups();
    } catch(e) { alert(e.message); }
    setAssigningId(null);
  };
  const loadPayroll = async () => {
    setLoading(true);
    try { const d = await hrmAPI.getPayrolls(); setRecords(d.payrolls||[]); } catch(e){ console.error(e); }
    setLoading(false);
  };
  const loadComponents = async () => {
    setCompLoading(true);
    try { const d = await hrmAPI.getPayComponents(); setCompRecords(d.components||[]); } catch(e){ console.error(e); }
    setCompLoading(false);
  };
const loadDeptDesig = async () => {
    try {
      const d = await hrmAPI.getDepartments();
      setDepartments(d.departments||[]);
      const g = await hrmAPI.getDesignations();
      setDesignations(g.designations||[]);
    } catch(e){ console.error(e); }
  };
  const loadGroups = async () => {
    setGroupsLoading(true);
    try { const d = await hrmAPI.getPayrollGroups(); setGroupRecords(d.groups||[]); } catch(e){ console.error(e); }
    setGroupsLoading(false);
  };
 useEffect(() => { loadPayroll(); loadComponents(); loadDeptDesig(); loadGroups(); loadEmployees(); }, []);

  const newGroupId=()=>`PG-${String(groupRecords.length+1).padStart(3,"0")}`;
  const saveGroup = async () => {
    if(!groupForm.name) return;
    try {
      await hrmAPI.createPayrollGroup({
        name: groupForm.name,
        pay_schedule: groupForm.schedule,
        employee_count: parseInt(groupForm.employees)||0,
        description: groupForm.desc,
      });
      await loadGroups();
    } catch(e){ alert(e.message); }
    setGroupModal(false); setGroupForm({ name:"", schedule:"Monthly", employees:"", desc:"" });
  };
  const groupApiDelete = async (i) => { await hrmAPI.deletePayrollGroup(groupRecords[i].id); await loadGroups(); };
  const groupApiEdit = async (i, vals) => {
    const rec = groupRecords[i];
    await hrmAPI.updatePayrollGroup(rec.id, {
      name: vals[1], pay_schedule: vals[2], employee_count: parseInt(vals[3])||0, description: vals[4],
    });
    await loadGroups();
  };

  const newPayId=()=>{ const nums=records.map(r=>parseInt((r.reference_no||"").replace("PAY-2026-",""))||0); const next=nums.length>0?Math.max(...nums)+1:1; return `PAY-2026-${String(next).padStart(3,"0")}`; };
  const newCompId=()=>`PC-${String(compRecords.length+1).padStart(3,"0")}`;
  const paid=rows.filter(r=>r[6]==="Paid");
  const pending=rows.filter(r=>r[6]==="Pending");

  const payrollApiDelete = async (i) => { await hrmAPI.deletePayroll(records[i].id); await loadPayroll(); };
 const payrollApiEdit = async (i, vals) => {
    const rec = records[i];
    await hrmAPI.updatePayroll(rec.id, {
      employee_name:vals[1], department:vals[2], designation:vals[3], month_year:vals[4],
      net_salary: parseFloat(String(vals[5]).replace(/[₹,]/g,""))||0, status:vals[6],
    });
    await loadPayroll();
  };
  const openEditPayroll = (i) => {
    const rec = records[i];
    setEditingId(rec.id);
    setEditForm({
      employee: rec.employee_name || "",
      department: rec.department || "",
      designation: rec.designation || "",
      month: rec.month_year || "",
      amount: String(rec.net_salary || ""),
      status: rec.status || "Pending",
    });
    setEditModal(true);
  };
  const saveEditPayroll = async () => {
    try {
      await hrmAPI.updatePayroll(editingId, {
        employee_name: editForm.employee,
        department: editForm.department,
        designation: editForm.designation,
        month_year: editForm.month,
        net_salary: parseFloat(editForm.amount) || 0,
        status: editForm.status,
      });
      await loadPayroll();
    } catch(e) { alert(e.message); }
    setEditModal(false); setEditingId(null);
  };
  const compApiDelete = async (i) => { await hrmAPI.deletePayComponent(compRecords[i].id); await loadComponents(); };
const compApiEdit = async (i, vals) => {
    const rec = compRecords[i];
    await hrmAPI.updatePayComponent(rec.id, {
      description:vals[1], component_type:vals[2], calc_method:vals[3],
      amount: parseFloat(String(vals[4]).replace(/[₹,%]/g,""))||0,
      status:vals[5],
      applicable_from: vals[6]==="—"?null:vals[6],
    });
    await loadComponents();
  };

  const [runModal,setRunModal]=useState(false);
  const [runMonth,setRunMonth]=useState("");
  const [eligible,setEligible]=useState([]);
  const [eligibleLoading,setEligibleLoading]=useState(false);
  const [selectedEmpIds,setSelectedEmpIds]=useState([]);
  const [previewData,setPreviewData]=useState(null);
  const [previewLoading,setPreviewLoading]=useState(false);
  const [running,setRunning]=useState(false);

  const loadEligible = async (month) => {
    if (!month) { setEligible([]); return; }
    setEligibleLoading(true);
    try {
      const d = await hrmAPI.getEligibleForRun(month);
      setEligible(d.employees || []);
      setSelectedEmpIds([]);
    } catch(e) { alert(e.message); }
    setEligibleLoading(false);
  };
const toggleEmpSelect = (id, source) => {
    setSelectedEmpIds(ids => {
      const exists = ids.some(x => (typeof x === 'object' ? x.id : x) === id);
      if (exists) return ids.filter(x => (typeof x === 'object' ? x.id : x) !== id);
      return [...ids, { id, source: source || 'user' }];
    });
  };
  const isEmpSelected = (id) => selectedEmpIds.some(x => (typeof x === 'object' ? x.id : x) === id);
  const allEmpSelected = eligible.length > 0 && selectedEmpIds.length === eligible.length;
  const toggleSelectAll = () => {
    setSelectedEmpIds(allEmpSelected ? [] : eligible.map(emp => ({ id: emp.id, source: emp.source || 'user' })));
  };  

const previewOne = async (employeeId, source) => {
    setPreviewLoading(true);
    try {
      const d = await hrmAPI.previewPayroll(employeeId, source || 'user', runMonth);
      setPreviewData(d.preview);
    } catch(e) { alert(e.message); }
    setPreviewLoading(false);
  };
const executeRun = async () => {
    if (!runMonth) { alert("Please select a Month / Year."); return; }
    if (!selectedEmpIds.length) { alert("Select at least one employee to run payroll for."); return; }
    setRunning(true);
    try {
      const result = await hrmAPI.runPayroll(selectedEmpIds, runMonth);
      const createdCount = result.created?.length || 0;
      const errorCount = result.errors?.length || 0;
      let msg = `Payroll run complete: ${createdCount} record(s) created.`;
      if (errorCount) msg += `\n${errorCount} failed:\n` + result.errors.map(e=>`• Employee ${e.employee_id}: ${e.error}`).join("\n");
      alert(msg);
      await loadPayroll();
      setRunModal(false); setRunMonth(""); setEligible([]); setSelectedEmpIds([]); setPreviewData(null);
    } catch(e) { alert(e.message); }
    setRunning(false);
  };

  const [slipModal,setSlipModal]=useState(false);
  const [slipData,setSlipData]=useState(null);
  const [slipLoading,setSlipLoading]=useState(false);

  const openSalarySlip = async (i) => {
    const rec = records[i];
    setSlipModal(true);
    setSlipLoading(true);
    try {
      const d = await hrmAPI.getPayrollItems(rec.id);
      setSlipData({ payroll: rec, items: d.items || [] });
    } catch(e) { alert(e.message); setSlipModal(false); }
    setSlipLoading(false);
  };

  const printSlip = () => {
    if (!slipData) return;
    const { payroll, items } = slipData;
    const earnings = items.filter(it => it.component_type === "Earning");
    const deductions = items.filter(it => it.component_type === "Deduction");
    const gross = Number(payroll.gross_salary || earnings.reduce((s,i)=>s+Number(i.amount||0),0));
    const ded = Number(payroll.total_deductions || deductions.reduce((s,i)=>s+Number(i.amount||0),0));
    const net = Number(payroll.net_salary || (gross - ded));

    const rowsHtml = (list) => list.length
      ? list.map(it => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${it.component_name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${Number(it.amount).toLocaleString("en-IN")}</td></tr>`).join("")
      : `<tr><td colspan="2" style="padding:8px;color:#999;text-align:center">None</td></tr>`;

    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Salary Slip - ${payroll.reference_no}</title>
 <style>
        body{font-family:'Inter',Arial,sans-serif;font-size:13px;color:#1b2e1c;background:#f0f4f1;margin:0;padding:40px 0}
        .sheet{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:36px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
        h2{color:#2e7d32;margin:0 0 4px;text-align:center}
        .meta{color:#607d63;font-size:12px;margin-bottom:24px;text-align:center;border-bottom:1px solid #eee;padding-bottom:16px}
        table{width:100%;border-collapse:collapse;margin-bottom:16px}
        th{background:#e8f5e9;color:#2e7d32;text-align:left;padding:8px;font-size:11px;text-transform:uppercase}
        .totals{margin-top:12px;border-top:2px solid #2e7d32;padding-top:12px}
        .totals div{display:flex;justify-content:space-between;padding:4px 0}
        .net{font-weight:800;font-size:16px;color:#2e7d32;border-top:1px solid #ccc;margin-top:8px;padding-top:8px}
      </style></head><body><div class="sheet">
        <h2>Salary Slip</h2>
        <div class="meta">Ref: ${payroll.reference_no} · ${payroll.month_year} · Generated ${new Date().toLocaleString("en-IN")}</div>
        <table><tr><td style="padding:4px 0"><strong>Employee:</strong> ${payroll.employee_name}</td></tr>
        <tr><td style="padding:4px 0"><strong>Department:</strong> ${payroll.department || "—"} &nbsp;&nbsp; <strong>Designation:</strong> ${payroll.designation || "—"}</td></tr></table>
        <h3 style="color:#2e7d32">Earnings</h3>
        <table><thead><tr><th>Component</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rowsHtml(earnings)}</tbody></table>
        <h3 style="color:#c62828">Deductions</h3>
        <table><thead><tr><th>Component</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rowsHtml(deductions)}</tbody></table>
        <div class="totals">
          <div><span>Gross Earnings</span><span>₹${gross.toLocaleString("en-IN")}</span></div>
          <div><span>Total Deductions</span><span>₹${ded.toLocaleString("en-IN")}</span></div>
         <div class="net"><span>Net Salary</span><span>₹${net.toLocaleString("en-IN")}</span></div>
        </div>
      </div></body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => w.print(), 300);
  };
  return (
    <div>
      <HRMNav />
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Payroll</h2>
        <div style={{ display:"flex", gap:10 }}>
          <GreenBtn onClick={()=>setRunModal(true)}>▶ Run Payroll</GreenBtn>
          <DarkBtn onClick={()=>setModal(true)}>+ Manual Entry</DarkBtn>
        </div>
      </div>
      <KpiRow cards={[
        { label:"Total Payrolls", value:rows.length.toString(), accent:true, modalData:{ columns:["Ref No","Employee","Dept","Designation","Month","Amount","Status"], rows } },
        { label:"Total Payout",  value:`₹${rows.reduce((s,r)=>s+ (parseFloat(String(r[5]).replace(/[₹,]/g,""))||0),0).toLocaleString("en-IN")}`, color:G.green },
        { label:"Paid",    value:paid.length.toString(),    color:G.green, modalData:{ columns:["Ref No","Employee","Dept","Designation","Month","Amount","Status"], rows:paid } },
        { label:"Pending", value:pending.length.toString(), color:G.amber, modalData:{ columns:["Ref No","Employee","Dept","Designation","Month","Amount","Status"], rows:pending } },
      ]} />
     <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${G.border}`, marginBottom:20 }}>
        {["All Payrolls","Payroll Groups","Pay Components","Assign Employees"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 18px", border:"none", background:"none", cursor:"pointer", fontWeight:tab===t?700:500, color:tab===t?G.green:G.muted, borderBottom:tab===t?`3px solid ${G.green}`:"3px solid transparent", fontSize:13 }}>{t}</button>))}
      </div>
{tab==="All Payrolls" && <Card>{loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
        <HRMTable
          columns={["Ref No","Employee","Department","Designation","Month","Amount","Status"]}
          rows={rows}
          exportFilename="payroll"
          onApiDelete={payrollApiDelete}
          onEditClick={openEditPayroll}
          extraActions={(i) => (
            <button title="Salary Slip" onClick={()=>openSalarySlip(i)} style={{ width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", borderRadius:6, cursor:"pointer", color:G.green, fontSize:16 }}>
              <i className="ti ti-file-invoice"></i>
            </button>
          )}
        />}</Card>}
   {tab==="Payroll Groups" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
            <GreenBtn onClick={()=>{ setEditingGroupId(null); setGroupForm({ name:"", schedule:"Monthly", employees:"", desc:"" }); setGroupModal(true); }}>+ Add Group</GreenBtn>
          </div>
          {groupsLoading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
            <HRMTable
              columns={["ID","Group Name","Pay Schedule","Employees","Description"]}
              rows={groupRows}
              exportFilename="payroll-groups"
              onApiDelete={groupApiDelete}
              onEditClick={openEditGroup}
              extraActions={(i) => (
                <button onClick={()=>openManageComponents(i)} style={{ padding:"5px 12px", background:G.purpleBg, color:G.purple, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12, whiteSpace:"nowrap" }}>⚙ Components</button>
              )}
            />}
        </Card>
      )}
     {tab==="Pay Components" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}><GreenBtn onClick={()=>{ setEditingCompId(null); setCompForm({ desc:"", type:"Earning", calcMethod:"Fixed", amount:"", status:"Active", date:"" }); setCompModal(true); }}>+ Add Component</GreenBtn></div>
          {compLoading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
            <HRMTable
              columns={["ID","Description","Type","Calc Method","Amount","Status","Applicable From"]}
              rows={payComp}
              exportFilename="pay-components"
              onApiDelete={compApiDelete}
              onEditClick={openEditComp}
            />}
        </Card>
      )}
     {tab==="Assign Employees" && (
        <Card>
          {employeesLoading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
          employees.length === 0 ? (
            <div style={{ textAlign:"center", padding:32, color:G.muted }}>No employees found.</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
           <thead>
                  <tr style={{ background:G.greenBg }}>
                    {["Employee","Type","Email","Assigned Payroll Group"].map(c => (
                      <th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em" }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp,i) => (
                    <tr key={`${emp.source||'user'}-${emp.id}`} style={{ background:i%2===0?G.white:G.rowHov }}>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text, fontWeight:600 }}>{emp.full_name || "—"}</td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20, background:emp.source==="employee"?G.purpleBg:G.blueBg, color:emp.source==="employee"?G.purple:G.blue }}>
                          {emp.source==="employee" ? "Non-login" : "User"}
                        </span>
                      </td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.muted }}>{emp.email || "—"}</td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>
                        <FSelect
                          value={emp.payroll_group_id || ""}
                          onChange={e=>handleAssign(emp.id, e.target.value ? parseInt(e.target.value) : null, emp.source || 'user')}
                          style={{ opacity:assigningId===emp.id?0.6:1, pointerEvents:assigningId===emp.id?"none":"auto", maxWidth:220 }}
                        >
                          <option value="">Unassigned</option>
                          {groupRecords.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </FSelect>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop:10, fontSize:13, color:G.muted }}>Showing {employees.length} of {employees.length} entries</div>
            </div>
          )}
        </Card>
      )}
      {runModal && (
        <Modal title="Run Payroll" onClose={()=>{setRunModal(false); setRunMonth(""); setEligible([]); setSelectedEmpIds([]); setPreviewData(null);}} width={700}>
          <Field label="Month / Year" required>
            <FInput type="month" value={runMonth} onChange={e=>{ const v=e.target.value; setRunMonth(v); loadEligible(v); setPreviewData(null); }} />
          </Field>

          {!runMonth ? (
            <div style={{ textAlign:"center", padding:24, color:G.muted, fontSize:13 }}>Select a month to see eligible employees.</div>
          ) : eligibleLoading ? (
            <div style={{ textAlign:"center", padding:24, color:G.muted }}>Loading eligible employees…</div>
          ) : eligible.length === 0 ? (
            <div style={{ textAlign:"center", padding:24, color:G.muted, fontSize:13 }}>No eligible employees — either everyone already has a payroll record for this month, or no one has an assigned Payroll Group.</div>
          ) : (
            <>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:G.text }}>Select Employees ({selectedEmpIds.length} selected)</span>
                <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:G.green, cursor:"pointer" }}>
                  <input type="checkbox" checked={allEmpSelected} onChange={toggleSelectAll} /> Select All
                </label>
              </div>
              <div style={{ maxHeight:240, overflowY:"auto", border:`1px solid ${G.border}`, borderRadius:8, marginBottom:16 }}>
              {eligible.map(emp => (
                  <div key={`${emp.source||'user'}-${emp.id}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderBottom:`1px solid ${G.border}` }}>
                    <input type="checkbox" checked={isEmpSelected(emp.id)} onChange={()=>toggleEmpSelect(emp.id, emp.source)} />
                    <span style={{ flex:1, fontSize:13.5, color:G.text }}>{emp.full_name}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:emp.source==="employee"?G.purpleBg:G.blueBg, color:emp.source==="employee"?G.purple:G.blue }}>
                      {emp.source==="employee" ? "Non-login" : "User"}
                    </span>
                    <span style={{ fontSize:12, color:G.muted }}>{emp.payroll_group_name}</span>
                    <button onClick={()=>previewOne(emp.id, emp.source)} style={{ padding:"4px 10px", background:G.blueBg, color:G.blue, border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700 }}>Preview</button>
                  </div>
                ))}
              </div>

              {previewLoading && <div style={{ textAlign:"center", padding:16, color:G.muted, fontSize:13 }}>Calculating preview…</div>}
              {previewData && !previewLoading && (
                <div style={{ border:`1px solid ${G.border}`, borderRadius:8, padding:16, marginBottom:16, background:G.bg }}>
                  <div style={{ fontWeight:700, fontSize:14, color:G.text, marginBottom:10 }}>Preview — {previewData.employee.full_name}</div>
                  {previewData.items.map((it,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}>
                      <span style={{ color:G.muted }}>{it.component_name} ({it.component_type})</span>
                      <span style={{ color:it.component_type==="Deduction"?G.red:G.green, fontWeight:600 }}>{it.component_type==="Deduction"?"-":""}₹{Number(it.amount).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:`1px solid ${G.border}`, marginTop:8, paddingTop:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span>Gross Earnings</span><span style={{ fontWeight:700 }}>₹{Number(previewData.grossEarnings).toLocaleString("en-IN")}</span></div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span>Total Deductions</span><span style={{ fontWeight:700, color:G.red }}>₹{Number(previewData.totalDeductions).toLocaleString("en-IN")}</span></div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:800, color:G.green, marginTop:4 }}><span>Net Salary</span><span>₹{Number(previewData.netSalary).toLocaleString("en-IN")}</span></div>
                  </div>
                </div>
              )}
            </>
          )}
<div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={executeRun} style={{ opacity:running?0.6:1, pointerEvents:running?"none":"auto" }}>{running ? "Running…" : `▶ Run Payroll (${selectedEmpIds.length})`}</GreenBtn>
            <DarkBtn onClick={()=>{setRunModal(false); setRunMonth(""); setEligible([]); setSelectedEmpIds([]); setPreviewData(null);}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {slipModal && (
        <Modal title="Salary Slip" onClose={()=>{setSlipModal(false); setSlipData(null);}} width={560}>
          {slipLoading ? (
            <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div>
          ) : slipData && (() => {
            const { payroll, items } = slipData;
            const earnings = items.filter(it => it.component_type === "Earning");
            const deductions = items.filter(it => it.component_type === "Deduction");
            const gross = Number(payroll.gross_salary ?? earnings.reduce((s,i)=>s+Number(i.amount||0),0));
            const ded = Number(payroll.total_deductions ?? deductions.reduce((s,i)=>s+Number(i.amount||0),0));
            const net = Number(payroll.net_salary ?? (gross - ded));
            return (
              <div>
                <div style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ fontWeight:700, fontSize:15, color:G.text }}>{payroll.employee_name}</div>
                  <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{payroll.reference_no} · {payroll.month_year} · {payroll.department || "—"} / {payroll.designation || "—"}</div>
                </div>

                <div style={{ fontWeight:700, fontSize:13, color:G.green, marginBottom:8 }}>Earnings</div>
                {earnings.length === 0 ? <div style={{ fontSize:13, color:G.muted, marginBottom:12 }}>None</div> : earnings.map((it,idx) => (
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}>
                    <span style={{ color:G.text }}>{it.component_name}</span>
                    <span style={{ fontWeight:600, color:G.green }}>₹{Number(it.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}

                <div style={{ fontWeight:700, fontSize:13, color:G.red, marginTop:14, marginBottom:8 }}>Deductions</div>
                {deductions.length === 0 ? <div style={{ fontSize:13, color:G.muted, marginBottom:12 }}>None</div> : deductions.map((it,idx) => (
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}>
                    <span style={{ color:G.text }}>{it.component_name}</span>
                    <span style={{ fontWeight:600, color:G.red }}>-₹{Number(it.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}

                <div style={{ marginTop:16, paddingTop:16, borderTop:`2px solid ${G.green}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"3px 0" }}><span>Gross Earnings</span><span style={{ fontWeight:700 }}>₹{gross.toLocaleString("en-IN")}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"3px 0" }}><span>Total Deductions</span><span style={{ fontWeight:700, color:G.red }}>₹{ded.toLocaleString("en-IN")}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, color:G.green, marginTop:6, paddingTop:6, borderTop:`1px solid ${G.border}` }}><span>Net Salary</span><span>₹{net.toLocaleString("en-IN")}</span></div>
                </div>

                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:24 }}>
                  <GreenBtn onClick={printSlip}>🖨 Print / PDF</GreenBtn>
                  <DarkBtn onClick={()=>{setSlipModal(false); setSlipData(null);}}>Close</DarkBtn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
      {modal && (
        <Modal title="Add Payroll" onClose={()=>setModal(false)}>
          <AutoIdField label="Payroll Ref No." value={newPayId()} />
<Field label="Employee" required><FInput value={form.employee} onChange={e=>setForm(f=>({...f,employee:e.target.value}))} placeholder="Employee name" /></Field>
          <Field label="Department">
            <FSelect value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}>
              <option value="">Please Select</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Designation">
            <FSelect value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))}>
              <option value="">Please Select</option>
              {designations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Month / Year" required><FInput type="month" value={form.month} onChange={e=>setForm(f=>({...f,month:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={async()=>{
              if(form.employee&&form.month){
          try {
                  await hrmAPI.createPayroll({ employee_name:form.employee, month_year:form.month, department:form.department, designation:form.designation });
                  await loadPayroll();
                } catch(e){ alert(e.message); }
                setModal(false); setForm({ employee:"", month:"", department:"", designation:"" });
              }
            }}>Save</GreenBtn>
            <DarkBtn onClick={()=>setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
  {groupModal && (
        <Modal title={editingGroupId ? "Edit Payroll Group" : "Add Payroll Group"} onClose={()=>{setGroupModal(false); setEditingGroupId(null);}}>
          {!editingGroupId && <AutoIdField label="Group ID" value={newGroupId()} />}
          <Field label="Group Name" required><FInput value={groupForm.name} onChange={e=>setGroupForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Monthly Staff" /></Field>
          <Field label="Pay Schedule"><FSelect value={groupForm.schedule} onChange={e=>setGroupForm(f=>({...f,schedule:e.target.value}))}><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></FSelect></Field>
          <Field label="Number of Employees"><FInput type="number" value={groupForm.employees} onChange={e=>setGroupForm(f=>({...f,employees:e.target.value}))} placeholder="e.g. 12" /></Field>
          <Field label="Description"><FTextarea value={groupForm.desc} onChange={e=>setGroupForm(f=>({...f,desc:e.target.value}))} placeholder="Brief description" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={editingGroupId ? saveEditGroup : saveGroup}>{editingGroupId ? "Update" : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>{setGroupModal(false); setEditingGroupId(null);}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {manageCompModal && (
        <Modal title={`Manage Components — ${groupRecords[managingGroupIdx]?.name || ""}`} onClose={()=>{setManageCompModal(false); setManagingGroupIdx(null);}} width={520}>
          {groupCompLoading ? (
            <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div>
          ) : compRecords.length === 0 ? (
            <div style={{ textAlign:"center", padding:32, color:G.muted }}>No pay components yet — add some in the Pay Components tab first.</div>
          ) : (
            <div style={{ maxHeight:360, overflowY:"auto" }}>
              {compRecords.map(c => (
                <label key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderBottom:`1px solid ${G.border}`, cursor:"pointer", fontSize:14 }}>
                  <input type="checkbox" checked={groupCompIds.includes(c.id)} onChange={()=>toggleGroupComp(c.id)} />
                  <span style={{ flex:1, color:G.text }}>{c.description}</span>
                  <span style={{ fontSize:11, background:c.component_type==="Earning"?G.greenBg:G.redBg, color:c.component_type==="Earning"?G.green:G.red, padding:"3px 10px", borderRadius:20, fontWeight:700 }}>{c.component_type}</span>
                  <span style={{ fontSize:12, color:G.muted, minWidth:60, textAlign:"right" }}>{c.calc_method==="Percentage" ? `${Number(c.amount||0)}%` : `₹${Number(c.amount||0).toLocaleString("en-IN")}`}</span>
                </label>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
            <GreenBtn onClick={saveGroupComponents} style={{ opacity:groupCompSaving?0.6:1, pointerEvents:groupCompSaving?"none":"auto" }}>{groupCompSaving ? "Saving..." : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>{setManageCompModal(false); setManagingGroupIdx(null);}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {editModal && (
        <Modal title="Edit Payroll" onClose={()=>{setEditModal(false); setEditingId(null);}}>
          <Field label="Employee" required><FInput value={editForm.employee} onChange={e=>setEditForm(f=>({...f,employee:e.target.value}))} placeholder="Employee name" /></Field>
          <Field label="Department">
            <FSelect value={editForm.department} onChange={e=>setEditForm(f=>({...f,department:e.target.value}))}>
              <option value="">Please Select</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Designation">
            <FSelect value={editForm.designation} onChange={e=>setEditForm(f=>({...f,designation:e.target.value}))}>
              <option value="">Please Select</option>
              {designations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Month / Year" required><FInput type="month" value={editForm.month} onChange={e=>setEditForm(f=>({...f,month:e.target.value}))} /></Field>
          <Field label="Amount"><FInput type="number" value={editForm.amount} onChange={e=>setEditForm(f=>({...f,amount:e.target.value}))} placeholder="0" /></Field>
          <Field label="Status">
            <FSelect value={editForm.status} onChange={e=>setEditForm(f=>({...f,status:e.target.value}))}>
              <option>Pending</option><option>Paid</option>
            </FSelect>
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={saveEditPayroll}>Save</GreenBtn>
            <DarkBtn onClick={()=>{setEditModal(false); setEditingId(null);}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
     {compModal && (
        <Modal title={editingCompId ? "Edit Pay Component" : "Add Pay Component"} onClose={()=>{setCompModal(false); setEditingCompId(null);}}>
          {!editingCompId && <AutoIdField label="Component ID" value={newCompId()} />}
          <Field label="Description" required><FInput value={compForm.desc} onChange={e=>setCompForm(f=>({...f,desc:e.target.value}))} placeholder="e.g. Basic Salary, HRA, PF" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Type"><FSelect value={compForm.type} onChange={e=>setCompForm(f=>({...f,type:e.target.value}))}><option>Earning</option><option>Deduction</option></FSelect></Field>
            <Field label="Calculation Method"><FSelect value={compForm.calcMethod} onChange={e=>setCompForm(f=>({...f,calcMethod:e.target.value}))}><option>Fixed</option><option>Percentage</option></FSelect></Field>
          </div>
          <Field label={compForm.calcMethod==="Percentage" ? "Percentage (%)" : "Amount"}>
            <FInput type="text" value={compForm.amount} onChange={e=>setCompForm(f=>({...f,amount:e.target.value}))} placeholder={compForm.calcMethod==="Percentage" ? "e.g. 12" : "₹0"} />
          </Field>
          <Field label="Status"><FSelect value={compForm.status} onChange={e=>setCompForm(f=>({...f,status:e.target.value}))}><option>Active</option><option>Inactive</option></FSelect></Field>
          <Field label="Applicable Date"><FInput type="date" value={compForm.date} onChange={e=>setCompForm(f=>({...f,date:e.target.value}))} /></Field>
<div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn
              onClick={async()=>{
                if(!compForm.desc || compSaving) return;
                setCompSaving(true);
                try {
                  if (editingCompId) {
                    await saveEditComp();
                  } else {
                    await hrmAPI.createPayComponent({ description:compForm.desc, component_type:compForm.type, calc_method:compForm.calcMethod, amount:parseFloat(compForm.amount)||0, status:compForm.status, applicable_from:compForm.date||null });
                    await loadComponents();
                    setCompModal(false); setCompForm({ desc:"", type:"Earning", calcMethod:"Fixed", amount:"", status:"Active", date:"" });
                  }
                } catch(e){ alert(e.message); }
                setCompSaving(false);
              }}
              style={{ opacity:compSaving?0.6:1, pointerEvents:compSaving?"none":"auto" }}
            >{compSaving ? "Saving..." : (editingCompId ? "Update" : "Save")}</GreenBtn>
            <DarkBtn onClick={()=>{setCompModal(false); setEditingCompId(null);}}>Close</DarkBtn>
          </div>        </Modal>
      )}
    </div>
  );
}

function MyPayrolls() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [slipModal,setSlipModal]=useState(false);
  const [slipData,setSlipData]=useState(null);
  const [slipLoading,setSlipLoading]=useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await hrmAPI.getPayrolls();
      const all = d.payrolls || [];
      let myId = null, myName = null;
      try {
        const stored = JSON.parse(localStorage.getItem("manod_user") || "{}");
        myId = stored.id || null;
        myName = stored.name || null;
      } catch {}
      const mine = all.filter(p =>
        (myId && p.employee_id === myId) ||
        (!myId && myName && p.employee_name?.toLowerCase() === myName.toLowerCase())
      );
      setRecords(mine);
    } catch(e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const rows = records.map(p => [p.reference_no, p.month_year, `₹${Number(p.net_salary||0).toLocaleString("en-IN")}`, p.status]);

  const openSlip = async (i) => {
    const rec = records[i];
    setSlipModal(true);
    setSlipLoading(true);
    try {
      const d = await hrmAPI.getPayrollItems(rec.id);
      setSlipData({ payroll: rec, items: d.items || [] });
    } catch(e) { alert(e.message); setSlipModal(false); }
    setSlipLoading(false);
  };

  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16, fontSize:20, fontWeight:700, color:G.text }}>My Payrolls</h2>
      <Card>
        {loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
        rows.length === 0 ? <NoData /> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead>
                <tr style={{ background:G.greenBg }}>
                  {["Ref No","Month","Net Salary","Status"].map(c => (
                    <th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase" }}>{c}</th>
                  ))}
                  <th style={{ padding:"10px 14px", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", textAlign:"center" }}>Slip</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row,i) => (
                  <tr key={i} style={{ background:i%2===0?G.white:G.rowHov }}>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text, fontWeight:600 }}>{row[0]}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>{row[1]}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>{row[2]}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}><StatusPill text={row[3]} /></td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, textAlign:"center" }}>
                      <button onClick={()=>openSlip(i)} style={{ padding:"5px 12px", background:G.greenBg, color:G.green, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12 }}>View Slip</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop:10, fontSize:13, color:G.muted }}>Showing {rows.length} of {rows.length} entries</div>
          </div>
        )}
      </Card>
      {slipModal && (
        <Modal title="Salary Slip" onClose={()=>{setSlipModal(false); setSlipData(null);}} width={560}>
          {slipLoading ? (
            <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div>
          ) : slipData && (() => {
            const { payroll, items } = slipData;
            const earnings = items.filter(it => it.component_type === "Earning");
            const deductions = items.filter(it => it.component_type === "Deduction");
            const gross = Number(payroll.gross_salary ?? earnings.reduce((s,i)=>s+Number(i.amount||0),0));
            const ded = Number(payroll.total_deductions ?? deductions.reduce((s,i)=>s+Number(i.amount||0),0));
            const net = Number(payroll.net_salary ?? (gross - ded));
            return (
              <div>
                <div style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ fontWeight:700, fontSize:15, color:G.text }}>{payroll.employee_name}</div>
                  <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{payroll.reference_no} · {payroll.month_year}</div>
                </div>
                <div style={{ fontWeight:700, fontSize:13, color:G.green, marginBottom:8 }}>Earnings</div>
                {earnings.length === 0 ? <div style={{ fontSize:13, color:G.muted, marginBottom:12 }}>None</div> : earnings.map((it,idx) => (
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}>
                    <span style={{ color:G.text }}>{it.component_name}</span>
                    <span style={{ fontWeight:600, color:G.green }}>₹{Number(it.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div style={{ fontWeight:700, fontSize:13, color:G.red, marginTop:14, marginBottom:8 }}>Deductions</div>
                {deductions.length === 0 ? <div style={{ fontSize:13, color:G.muted, marginBottom:12 }}>None</div> : deductions.map((it,idx) => (
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}>
                    <span style={{ color:G.text }}>{it.component_name}</span>
                    <span style={{ fontWeight:600, color:G.red }}>-₹{Number(it.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div style={{ marginTop:16, paddingTop:16, borderTop:`2px solid ${G.green}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"3px 0" }}><span>Gross Earnings</span><span style={{ fontWeight:700 }}>₹{gross.toLocaleString("en-IN")}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"3px 0" }}><span>Total Deductions</span><span style={{ fontWeight:700, color:G.red }}>₹{ded.toLocaleString("en-IN")}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, color:G.green, marginTop:6, paddingTop:6, borderTop:`1px solid ${G.border}` }}><span>Net Salary</span><span>₹{net.toLocaleString("en-IN")}</span></div>
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:24 }}>
                  <DarkBtn onClick={()=>{setSlipModal(false); setSlipData(null);}}>Close</DarkBtn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
/* ══════════════════════════════════════════
   EMPLOYEES (non-login staff for Payroll/Attendance/Leave)
══════════════════════════════════════════ */
// NEW
function HrmEmployees() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState("All");
  const [deptFilter,setDeptFilter]=useState("All");
  const [sortBy,setSortBy]=useState("name-asc");
  const typeBadge = (source, linkedUserId) => (
    <span style={{
      display:"inline-block", padding:"3px 12px", borderRadius:20, fontSize:11.5, fontWeight:700,
      background: (source==="user" || linkedUserId) ? G.blueBg : G.purpleBg,
      color: (source==="user" || linkedUserId) ? G.blue : G.purple,
    }}>
      {source==="user" ? "User" : linkedUserId ? "Login enabled" : "Non-login"}
    </span>
  );
const uniqueDepts = [...new Set(records.map(e => e.department).filter(Boolean))].sort();

  const filteredRecords = records
    .filter(e => {
      if (typeFilter === "Non-login" && e.source === "user") return false;
      if (typeFilter === "User" && e.source !== "user") return false;
      if (deptFilter !== "All" && e.department !== deptFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${e.full_name||""} ${e.department||""} ${e.designation||""} ${e.phone||""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc")   return (a.full_name||"").localeCompare(b.full_name||"");
      if (sortBy === "name-desc")  return (b.full_name||"").localeCompare(a.full_name||"");
      if (sortBy === "salary-high") return (Number(b.basic_salary)||0) - (Number(a.basic_salary)||0);
      if (sortBy === "salary-low")  return (Number(a.basic_salary)||0) - (Number(b.basic_salary)||0);
      return 0;
    });

  const rows = filteredRecords.map(e => [
    e.source === "user" ? `USR-${String(e.id).slice(0,8)}` : `EMP-${String(e.id).padStart(3,"0")}`,
    e.full_name,
    e.department||"—",
    e.designation||"—",
    `₹${Number(e.basic_salary||0).toLocaleString("en-IN")}`,
    e.salary_period||"—",
    e.phone||"—",
    e.status||"active",
    typeBadge(e.source, e.linked_user_id),
  ]);

  const [modal,setModal]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [form,setForm]=useState({ fullName:"", department:"", designation:"", basicSalary:"", salaryPeriod:"Per Month", phone:"", status:"active" });
  const [departments,setDepartments]=useState([]);
  const [designations,setDesignations]=useState([]);

  // ── Enable Login modal state ──
  const [enableModal,setEnableModal]=useState(false);
  const [enableTargetIdx,setEnableTargetIdx]=useState(null);
  const [enableForm,setEnableForm]=useState({ email:"", password:"" });
  const [enableSaving,setEnableSaving]=useState(false);

  const load = async () => {
    setLoading(true);
    try { const d = await hrmAPI.getHrmEmployees(); setRecords(d.employees||[]); } catch(e){ console.error(e); }
    setLoading(false);
  };
  const loadDeptDesig = async () => {
    try {
      const d = await hrmAPI.getDepartments(); setDepartments(d.departments||[]);
      const g = await hrmAPI.getDesignations(); setDesignations(g.designations||[]);
    } catch(e){ console.error(e); }
  };
  useEffect(() => { load(); loadDeptDesig(); }, []);

  const newId=()=>`EMP-${String(records.length+1).padStart(3,"0")}`;

  const openAdd = () => {
    setEditingId(null);
    setForm({ fullName:"", department:"", designation:"", basicSalary:"", salaryPeriod:"Per Month", phone:"", status:"active" });
    setModal(true);
  };
const openEdit = (i) => {
    const rec = filteredRecords[i];
    if (rec.source === "user") {
      alert("This is a login user account, not a non-login employee record — it can't be edited from this page. Manage it from User Management instead.");
      return;
    }
    setEditingId(rec.id);
    setForm({
      fullName: rec.full_name || "",
      department: rec.department || "",
      designation: rec.designation || "",
      basicSalary: String(rec.basic_salary ?? ""),
      salaryPeriod: rec.salary_period || "Per Month",
      phone: rec.phone || "",
      status: rec.status || "active",
    });
    setModal(true);
  };  

  const save = async () => {
    if (!form.fullName) return;
    try {
      const payload = {
        full_name: form.fullName,
        department: form.department || null,
        designation: form.designation || null,
        basic_salary: parseFloat(form.basicSalary) || 0,
        salary_period: form.salaryPeriod,
        phone: form.phone || null,
        status: form.status,
      };
      if (editingId) {
        await hrmAPI.updateHrmEmployee(editingId, payload);
      } else {
        await hrmAPI.createHrmEmployee(payload);
      }
      await load();
    } catch(e){ alert(e.message); }
    setModal(false); setEditingId(null);
    setForm({ fullName:"", department:"", designation:"", basicSalary:"", salaryPeriod:"Per Month", phone:"", status:"active" });
  };


const apiDelete = async (i) => {
  const rec = filteredRecords[i];
  if (!rec) return;
  if (rec.source === "user") {
    alert("This is a login user account, not a non-login employee record — it can't be deleted from this page. Manage it from User Management instead.");
    return;
  }
  await hrmAPI.deleteHrmEmployee(rec.id);
  await load();
};

  // ── Enable Login handlers ──
  const openEnableLogin = (i) => {
    setEnableTargetIdx(i);
    setEnableForm({ email:"", password:"" });
    setEnableModal(true);
  };
  const closeEnableLogin = () => {
    setEnableModal(false); setEnableTargetIdx(null);
    setEnableForm({ email:"", password:"" });
  };
  const submitEnableLogin = async () => {
    const rec = filteredRecords[enableTargetIdx];
    if (!rec) return;
    if (!enableForm.email || !enableForm.password) { alert("Email and password are required"); return; }
    setEnableSaving(true);
    try {
      await hrmAPI.enableEmployeeLogin(rec.id, { email: enableForm.email, password: enableForm.password });
      await load();
      closeEnableLogin();
    } catch(e) { alert(e.message || "Failed to enable login"); }
    setEnableSaving(false);
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Employees</h2>
          <p style={{ margin:0, fontSize:13, color:G.muted, marginTop:2 }}>Non-login staff — warehouse workers, drivers, cleaners, etc. who need Payroll/Attendance/Leave but never log in</p>
        </div>
 <GreenBtn onClick={openAdd}>+ Add Employee</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Employees", value:records.length.toString(), accent:true },
        { label:"Non-login Staff", value:records.filter(e=>e.source!=="user" && !e.linked_user_id).length.toString(), color:G.purple },
        { label:"Login Users",     value:records.filter(e=>e.source==="user" || e.linked_user_id).length.toString(), color:G.blue },
      ]} />
<Card style={{ marginBottom:16, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", minWidth:140 }}>
            <option value="All">All Types</option>
            <option value="Non-login">Non-login</option>
            <option value="User">Login User</option>
          </select>
          <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", minWidth:160 }}>
            <option value="All">All Departments</option>
            {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", minWidth:160 }}>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="salary-high">Salary (High–Low)</option>
            <option value="salary-low">Salary (Low–High)</option>
          </select>
          <div style={{ position:"relative", flex:1, minWidth:220 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:G.muted, fontSize:14 }}></span>
            <input
              type="text"
              placeholder="Search by name, department, designation, phone..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", padding:"7px 12px 7px 34px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:13, fontFamily:"'Inter',sans-serif", color:G.text, boxSizing:"border-box" }}
            />
          </div>
          {(typeFilter!=="All" || deptFilter!=="All" || sortBy!=="name-asc" || search.trim()) && (
            <button onClick={()=>{ setTypeFilter("All"); setDeptFilter("All"); setSortBy("name-asc"); setSearch(""); }} style={{ padding:"7px 16px", background:G.redBg, color:G.red, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700 }}>✕ Reset</button>
          )}
        </div>
      </Card>
    <Card>
        {loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
         filteredRecords.length === 0 ? (
           <div style={{ textAlign:"center", padding:"40px 0", color:G.muted }}>
             <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
             <div style={{ fontSize:15, fontWeight:600 }}>No employees match your filter</div>
             <div style={{ fontSize:13, marginTop:4 }}>Try adjusting the type, department, or search</div>
           </div>
         ) : (
<HRMTable
  columns={["ID","Name","Department","Designation","Basic Salary","Period","Phone","Status","Type"]}
  rows={rows}
  exportFilename="employees"
  onApiDelete={apiDelete}
  onEditClick={openEdit}
  extraActions={(i) => {
    const rec = filteredRecords[i];
    if (!rec || rec.source === "user" || rec.linked_user_id) return null;
    return (
      <button title="Enable Login" onClick={()=>openEnableLogin(i)} style={{ padding:"5px 12px", background:G.purpleBg, color:G.purple, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12, whiteSpace:"nowrap" }}>
        🔑 Enable Login
      </button>
    );
  }}
/>
         )}
      </Card>
      {modal && (
        <Modal title={editingId ? "Edit Employee" : "Add Employee"} onClose={()=>{setModal(false); setEditingId(null);}}>
          {!editingId && <AutoIdField label="Employee ID" value={newId()} />}
          <Field label="Full Name" required><FInput value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))} placeholder="e.g. Ramesh Kumar" /></Field>
          <Field label="Department">
            <FSelect value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}>
              <option value="">Please Select</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Designation">
            <FSelect value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))}>
              <option value="">Please Select</option>
              {designations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Basic Salary"><FInput type="number" value={form.basicSalary} onChange={e=>setForm(f=>({...f,basicSalary:e.target.value}))} placeholder="₹0" /></Field>
            <Field label="Salary Period"><FSelect value={form.salaryPeriod} onChange={e=>setForm(f=>({...f,salaryPeriod:e.target.value}))}><option>Per Month</option><option>Per Day</option><option>Per Hour</option></FSelect></Field>
          </div>
          <Field label="Phone"><FInput value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="Phone number" /></Field>
          <Field label="Status"><FSelect value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></FSelect></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={save}>{editingId ? "Update" : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>{setModal(false); setEditingId(null);}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {enableModal && (
        <Modal title={`Enable Login — ${filteredRecords[enableTargetIdx]?.full_name || ""}`} onClose={closeEnableLogin} width={440}>
          <p style={{ color:G.muted, fontSize:13, margin:"0 0 16px" }}>This creates a login account pre-filled with this employee's existing name, department, designation and salary — nothing else changes.</p>

          <Field label="Email" required><FInput type="email" name={`enable-login-email-${filteredRecords[enableTargetIdx]?.id || "x"}`} autoComplete="off" value={enableForm.email} onChange={e=>setEnableForm(f=>({...f,email:e.target.value}))} placeholder="employee@example.com" /></Field>
          <Field label="Password" required><FInput type="password" name={`enable-login-password-${filteredRecords[enableTargetIdx]?.id || "x"}`} autoComplete="new-password" value={enableForm.password} onChange={e=>setEnableForm(f=>({...f,password:e.target.value}))} placeholder="Set a login password" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={submitEnableLogin} style={{ opacity:enableSaving?0.6:1, pointerEvents:enableSaving?"none":"auto" }}>{enableSaving ? "Enabling..." : "Enable Login"}</GreenBtn>
            <DarkBtn onClick={closeEnableLogin}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
/* ══════════════════════════════════════════
   HOLIDAY (original UI + API save + exports)
══════════════════════════════════════════ */
function Holiday() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const rows = records.map(h => [`HOL-${String(h.id).padStart(3,"0")}`, h.name, h.start_date?String(h.start_date).slice(0,10):"", h.end_date?String(h.end_date).slice(0,10):"", h.duration, h.location]);

 const [modal,setModal]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [form,setForm]=useState({ name:"", startDate:"", endDate:"", location:"All Locations", note:"" });
  const [locations,setLocations]=useState([]);
const loadLocations = async () => {
    try { const d = await hrmAPI.getBusinessLocations(); setLocations(d.data||[]); } catch(e){ console.error(e); }
  };
  const load = async () => {
    setLoading(true);
    try { const d = await hrmAPI.getHolidays(); setRecords(d.holidays||[]); } catch(e){ console.error(e); }
    setLoading(false);
  };
useEffect(() => { load(); loadLocations(); }, []);

  const newId=()=>editingId ? `HOL-${String(records.findIndex(r=>r.id===editingId)+1).padStart(3,"0")}` : `HOL-${String(records.length+1).padStart(3,"0")}`;

  const openAdd = () => {
    setEditingId(null);
    setForm({ name:"", startDate:"", endDate:"", location:"All Locations", note:"" });
    setModal(true);
  };
  const openEdit = (i) => {
    const rec = records[i];
    setEditingId(rec.id);
    setForm({
      name: rec.name || "",
      startDate: rec.start_date ? String(rec.start_date).slice(0,10) : "",
      endDate: rec.end_date ? String(rec.end_date).slice(0,10) : "",
      location: rec.location || "All Locations",
      note: rec.note || "",
    });
    setModal(true);
  };

  const save=async()=>{
    if(!form.name||!form.startDate||!form.endDate) return;
    try {
      if (editingId) {
        await hrmAPI.updateHoliday(editingId, { name:form.name, start_date:form.startDate, end_date:form.endDate, location:form.location, note:form.note });
      } else {
        await hrmAPI.createHoliday({ name:form.name, start_date:form.startDate, end_date:form.endDate, location:form.location, note:form.note });
      }
      await load();
    } catch(e){ alert(e.message); }
    setModal(false); setEditingId(null); setForm({ name:"", startDate:"", endDate:"", location:"All Locations", note:"" });
  };
  const apiDelete = async (i) => { await hrmAPI.deleteHoliday(records[i].id); await load(); };

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Holidays</h2>
        <GreenBtn onClick={openAdd}>+ Add Holiday</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Holidays", value:rows.length.toString(), accent:true, modalData:{ columns:["ID","Name","Start","End","Duration","Location"], rows } },
        { label:"This Quarter", value:String(rows.length), color:G.green },
        { label:"Total Days Off", value:rows.reduce((s,r)=>s+(parseInt(r[4])||0),0).toString(), color:G.blue },
      ]} />
      <Card>{loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
        <HRMTable columns={["ID","Name","Start","End","Duration","Location"]} rows={rows} exportFilename="holidays" onApiDelete={apiDelete} onEditClick={openEdit} />}</Card>
      {modal && (
        <Modal title={editingId ? "Edit Holiday" : "Add Holiday"} onClose={()=>{setModal(false); setEditingId(null);}}>
          <AutoIdField label="Holiday ID" value={newId()} />
          <Field label="Name" required><FInput value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Holiday name" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start Date" required><FInput type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} /></Field>
            <Field label="End Date"   required><FInput type="date" value={form.endDate}   onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} /></Field>
          </div>
<Field label="Location">
            <FSelect value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}>
              <option value="All Locations">All Locations</option>
              {locations.length === 0
                ? <option value="" disabled>No locations found — add one in Settings → Business Locations</option>
                : locations.map(loc => <option key={loc.id} value={loc.location_name}>{loc.location_name}</option>)}
            </FSelect>
          </Field>        <Field label="Note"><FTextarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={2} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}><GreenBtn onClick={save}>{editingId ? "Update" : "Save"}</GreenBtn><DarkBtn onClick={()=>{setModal(false); setEditingId(null);}}>Close</DarkBtn></div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DEPARTMENTS (original UI + API + exports)
══════════════════════════════════════════ */
function Departments() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const rows = records.map(d => [`DEPT-${String(d.id).padStart(3,"0")}`, d.name, d.dept_code, d.description||"—"]);
const [modal,setModal]=useState(false);
  const [form,setForm]=useState({ dept:"", deptCode:"", desc:"" });

  const load = async () => {
    setLoading(true);
    try { const d = await hrmAPI.getDepartments(); setRecords(d.departments||[]); } catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const newId=()=>`DEPT-${String(records.length+1).padStart(3,"0")}`;
  const newDeptId=(name)=>name?`DEPT-${name.slice(0,4).toUpperCase().replace(/\s/g,"")}`:"Auto-generated from name";

const apiDelete = async (i) => { await hrmAPI.deleteDepartment(records[i].id); await load(); };

  const [editingId,setEditingId]=useState(null);
  const openEdit = (i) => {
    const rec = records[i];
    setEditingId(rec.id);
    setForm({ dept: rec.name || "", deptCode: rec.dept_code || "", desc: rec.description || "" });
    setModal(true);
  };
  const saveEdit = async () => {
    try {
      await hrmAPI.updateDepartment(editingId, { name:form.dept, dept_code:form.deptCode, description:form.desc });
      await load();
    } catch(e){ alert(e.message); }
    setModal(false); setEditingId(null); setForm({ dept:"", deptCode:"", desc:"" });
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Departments</h2>
        <GreenBtn onClick={()=>setModal(true)}>+ Add Department</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Departments", value:rows.length.toString(), accent:true, modalData:{ columns:["ID","Department","Dept Code","Description"], rows } },
        { label:"Active", value:rows.length.toString(), color:G.green },
      ]} />
    <Card>{loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
        <HRMTable columns={["ID","Department","Dept Code","Description"]} rows={rows} exportFilename="departments" onApiDelete={apiDelete} onEditClick={openEdit} />}</Card>
      {modal && (
        <Modal title={editingId ? "Edit Department" : "Add Department"} onClose={()=>{setModal(false); setEditingId(null); setForm({ dept:"", deptCode:"", desc:"" });}}>
          {editingId ? (
            <Field label="Department Code"><FInput value={form.deptCode} onChange={e=>setForm(f=>({...f,deptCode:e.target.value}))} /></Field>
          ) : (
            <>
              <AutoIdField label="System ID"       value={newId()} />
              <AutoIdField label="Department Code" value={form.dept?newDeptId(form.dept):"Auto-generated from name"} />
            </>
          )}
          <Field label="Department Name" required><FInput value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))} placeholder="e.g. Sales" /></Field>
          <Field label="Description"><FTextarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Brief description" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <GreenBtn onClick={async()=>{
              if(!form.dept) return;
              if (editingId) { await saveEdit(); return; }
              try {
                await hrmAPI.createDepartment({ name:form.dept, description:form.desc });
                await load();
              } catch(e){ alert(e.message); }
              setModal(false); setForm({ dept:"", deptCode:"", desc:"" });
            }}>{editingId ? "Update" : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>{setModal(false); setEditingId(null); setForm({ dept:"", deptCode:"", desc:"" });}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DESIGNATIONS (original UI + API + exports)
══════════════════════════════════════════ */
function Designations() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const rows = records.map(d => [`DES-${String(d.id).padStart(3,"0")}`, d.name, d.description||"—"]);

  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({ desig:"", desc:"" });

  const load = async () => {
    setLoading(true);
    try { const d = await hrmAPI.getDesignations(); setRecords(d.designations||[]); } catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const newId=()=>`DES-${String(records.length+1).padStart(3,"0")}`;

  const apiDelete = async (i) => { await hrmAPI.deleteDesignation(records[i].id); await load(); };

  const [editingId,setEditingId]=useState(null);
  const openEdit = (i) => {
    const rec = records[i];
    setEditingId(rec.id);
    setForm({ desig: rec.name || "", desc: rec.description || "" });
    setModal(true);
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Designations</h2>
        <GreenBtn onClick={()=>setModal(true)}>+ Add Designation</GreenBtn>
      </div>
      <KpiRow cards={[{ label:"Total Designations", value:rows.length.toString(), accent:true, modalData:{ columns:["ID","Designation","Description"], rows } }]} />
      <Card>{loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
        <HRMTable columns={["ID","Designation","Description"]} rows={rows} exportFilename="designations" onApiDelete={apiDelete} onEditClick={openEdit} />}</Card>
      {modal && (
        <Modal title={editingId ? "Edit Designation" : "Add Designation"} onClose={()=>{setModal(false); setEditingId(null); setForm({ desig:"", desc:"" });}}>
          <AutoIdField label="Designation ID" value={newId()} />
          <Field label="Designation" required><FInput value={form.desig} onChange={e=>setForm(f=>({...f,desig:e.target.value}))} placeholder="e.g. Sales Executive" /></Field>
          <Field label="Description"><FTextarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={async()=>{
              if(!form.desig) return;
              try {
                if (editingId) {
                  await hrmAPI.updateDesignation(editingId, { name:form.desig, description:form.desc });
                } else {
                  await hrmAPI.createDesignation({ name:form.desig, description:form.desc });
                }
                await load();
              } catch(e){ alert(e.message); }
              setModal(false); setEditingId(null); setForm({ desig:"", desc:"" });
            }}>{editingId ? "Update" : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>{setModal(false); setEditingId(null); setForm({ desig:"", desc:"" });}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   SALES TARGETS (original UI + API + exports)
══════════════════════════════════════════ */
function SalesTargets() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [employees,setEmployees]=useState([]);

  const TARGET_TYPES = [
    { value:"amount",     label:"Sales Amount" },
    { value:"orders",     label:"Number of Orders" },
    { value:"customers",  label:"Number of Customers" },
  ];
  const PERIOD_TYPES = ["Monthly","Quarterly","Yearly","Custom"];

  const statusColor = (s) => ({ Exceeded:G.blue, Achieved:G.green, "In Progress":G.amber, "Not Started":G.muted }[s] || G.muted);

  const rows = records.map((t) => {
    const type = t.order_target>0 ? "orders" : t.customer_target>0 ? "customers" : "amount";
    const targetVal = type==="orders" ? t.order_target : type==="customers" ? t.customer_target : t.target_amount;
    const achievedVal = type==="orders" ? t.order_achieved : type==="customers" ? t.customer_achieved : t.achieved_amount;
    const fmtVal = (v) => type==="amount" ? `₹${Number(v||0).toLocaleString("en-IN")}` : String(v||0);
    return [
      `ST-${String(t.id).padStart(3,"0")}`,
      t.employee_name,
      TARGET_TYPES.find(x=>x.value===type)?.label || "Sales Amount",
      t.month_year||"—",
      fmtVal(targetVal),
      fmtVal(achievedVal),
      fmtVal(Math.max(0,(targetVal||0)-(achievedVal||0))),
      `${t.achievement_pct||0}%`,
      t.computed_status || "Not Started",
    ];
  });

  const [modal,setModal]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [form,setForm]=useState({ employeeKey:"", targetType:"amount", periodType:"Monthly", month:"", target:"", commission:"", notes:"" });

  const load = async () => {
    setLoading(true);
    try {
      const [d, e] = await Promise.all([hrmAPI.getSalesTargets(), hrmAPI.getEmployeesWithGroups()]);
      setRecords(d.targets||[]);
      setEmployees(e.employees||[]);
    } catch(err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const newId=()=>editingId ? `ST-${String(records.findIndex(r=>r.id===editingId)+1).padStart(3,"0")}` : `ST-${String(records.length+1).padStart(3,"0")}`;

  const openAdd = () => {
    setEditingId(null);
    setForm({ employeeKey:"", targetType:"amount", periodType:"Monthly", month:"", target:"", commission:"", notes:"" });
    setModal(true);
  };
  const openEdit = (i) => {
    const rec = records[i];
    const type = rec.order_target>0 ? "orders" : rec.customer_target>0 ? "customers" : "amount";
    const targetVal = type==="orders" ? rec.order_target : type==="customers" ? rec.customer_target : rec.target_amount;
    setEditingId(rec.id);
    setForm({
      employeeKey: rec.employee_id ? `${rec.employee_source||'user'}:${rec.employee_id}` : "",
      targetType: type,
      periodType: "Monthly",
      month: rec.month_year || "",
      target: String(targetVal || ""),
      commission: String(rec.commission_pct || ""),
      notes: rec.remarks || "",
    });
    setModal(true);
  };

  const save = async () => {
    if(!form.employeeKey||!form.target) return;
    const emp = employees.find(e => `${e.source||'user'}:${e.id}` === form.employeeKey);
    const payload = {
      employee_name: emp?.full_name || "",
      employee_id: emp?.id ? String(emp.id) : null,
      employee_source: emp?.source || 'user',
      commission_pct: parseFloat(form.commission)||0,
      month_year: form.month,
      remarks: form.notes || null,
      target_amount:     form.targetType==="amount"    ? parseFloat(String(form.target).replace(/[₹,]/g,""))||0 : 0,
      order_target:      form.targetType==="orders"    ? parseInt(form.target)||0 : 0,
      customer_target:   form.targetType==="customers" ? parseInt(form.target)||0 : 0,
    };
    try {
      if (editingId) {
        await hrmAPI.updateSalesTarget(editingId, payload);
      } else {
        await hrmAPI.createSalesTarget(payload);
      }
      await load();
    } catch(e){ alert(e.message); }
    setModal(false); setEditingId(null); setForm({ employeeKey:"", targetType:"amount", periodType:"Monthly", month:"", target:"", commission:"", notes:"" });
  };

  const apiDelete = async (i) => { await hrmAPI.deleteSalesTarget(records[i].id); await load(); };

  const totalAmountTargets = records.filter(r=>!r.order_target && !r.customer_target);

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Sales Targets</h2>
        <GreenBtn onClick={openAdd}>+ Add Target</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Targets", value:records.length.toString(), accent:true, modalData:{ columns:["ID","Employee","Type","Period","Target","Achieved","Remaining","Progress","Status"], rows } },
        { label:"Achieved",      value:records.filter(r=>r.computed_status==="Achieved").length.toString(), color:G.green },
        { label:"Over Achieved", value:records.filter(r=>r.computed_status==="Exceeded").length.toString(), color:G.blue },
        { label:"Pending",       value:records.filter(r=>r.computed_status==="Not Started"||r.computed_status==="In Progress").length.toString(), color:G.amber },
        { label:"Total Target Value", value:`₹${totalAmountTargets.reduce((s,r)=>s+Number(r.target_amount||0),0).toLocaleString("en-IN")}`, color:G.text },
      ]} />
      <Card>{loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> :
        <HRMTable columns={["ID","Employee","Type","Period","Target","Achieved","Remaining","Progress","Status"]} rows={rows} exportFilename="sales-targets" onApiDelete={apiDelete} onEditClick={openEdit} />}</Card>
      {modal && (
        <Modal title={editingId ? "Edit Sales Target" : "Add Sales Target"} onClose={()=>{setModal(false); setEditingId(null);}}>
          <AutoIdField label="Target ID" value={newId()} />
          <Field label="Employee" required>
            <FSelect value={form.employeeKey} onChange={e=>setForm(f=>({...f,employeeKey:e.target.value}))}>
              <option value="">Please Select</option>
              {employees.map(e => (
                <option key={`${e.source||'user'}-${e.id}`} value={`${e.source||'user'}:${e.id}`}>
                  {e.full_name} {e.source==="employee" ? "(Non-login)" : ""}
                </option>
              ))}
            </FSelect>
          </Field>
          <Field label="Target Type" required>
            <FSelect value={form.targetType} onChange={e=>setForm(f=>({...f,targetType:e.target.value}))}>
              {TARGET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </FSelect>
          </Field>
          <Field label="Target Period">
            <FSelect value={form.periodType} onChange={e=>setForm(f=>({...f,periodType:e.target.value}))}>
              {PERIOD_TYPES.map(p => <option key={p}>{p}</option>)}
            </FSelect>
          </Field>
          <Field label="Month / Year"><FInput type="month" value={form.month} onChange={e=>setForm(f=>({...f,month:e.target.value}))} /></Field>
          <Field label={form.targetType==="amount" ? "Target Amount" : "Target Count"} required>
            <FInput value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder={form.targetType==="amount" ? "₹0" : "0"} />
          </Field>
          <Field label="Commission %"><FInput type="number" value={form.commission} onChange={e=>setForm(f=>({...f,commission:e.target.value}))} placeholder="5" /></Field>
          <Field label="Notes"><FTextarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional notes" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={save}>{editingId ? "Update" : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>{setModal(false); setEditingId(null);}}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   HRM SETTINGS (original — unchanged)
══════════════════════════════════════════ */
// NEW
function HRMSettings() {
  const [form,setForm]=useState({ workDays:"5", workHours:"8", overtimeRate:"1.5", currency:"INR", payslipNote:"Thank you for your service.", leaveApproval:"manager", attendanceMode:"manual", workStartTime:"09:00", workEndTime:"18:00", lateGraceMinutes:"15" });
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await hrmAPI.getSettings();
      const s = d.settings;
   // NEW
      if (s) {
        setForm({
          workDays: String(s.work_days_per_week ?? "5"),
          workHours: String(s.work_hours_per_day ?? "8"),
          overtimeRate: String(s.overtime_rate_multiplier ?? "1.5"),
          currency: s.currency || "INR",
          payslipNote: s.payslip_note || "",
          leaveApproval: s.leave_approval || "manager",
          attendanceMode: s.attendance_mode || "manual",
          workStartTime: (s.work_start_time || "09:00").slice(0,5),
          workEndTime: (s.work_end_time || "18:00").slice(0,5),
          lateGraceMinutes: String(s.late_grace_minutes ?? "15"),
        });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
 // NEW
      await hrmAPI.updateSettings({
        work_days_per_week: parseInt(form.workDays) || 5,
        work_hours_per_day: parseFloat(form.workHours) || 8,
        overtime_rate_multiplier: parseFloat(form.overtimeRate) || 1.5,
        currency: form.currency,
        payslip_note: form.payslipNote,
        leave_approval: form.leaveApproval,
        attendance_mode: form.attendanceMode,
        work_start_time: form.workStartTime,
        work_end_time: form.workEndTime,
        late_grace_minutes: parseInt(form.lateGraceMinutes) || 15,
      });
      setSaved(true); setTimeout(()=>setSaved(false),2500);
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:18, fontSize:20, fontWeight:700, color:G.text }}>HRM Settings</h2>
      <Card style={{ maxWidth:700 }}>
        <h3 style={{ marginTop:0, marginBottom:20, fontSize:15, fontWeight:700, borderBottom:`1px solid ${G.border}`, paddingBottom:12, color:G.text }}>General Configuration</h3>
        {loading ? <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div> : (
        <>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Working Days / Week"><FSelect value={form.workDays} onChange={e=>setForm(f=>({...f,workDays:e.target.value}))}>{["5","6","7"].map(v=><option key={v}>{v}</option>)}</FSelect></Field>
          <Field label="Working Hours / Day"><FInput type="number" value={form.workHours} onChange={e=>setForm(f=>({...f,workHours:e.target.value}))} /></Field>
          <Field label="Overtime Rate Multiplier"><FInput type="number" step="0.1" value={form.overtimeRate} onChange={e=>setForm(f=>({...f,overtimeRate:e.target.value}))} /></Field>
          <Field label="Currency"><FSelect value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>{["INR","USD","EUR","GBP"].map(v=><option key={v}>{v}</option>)}</FSelect></Field>
        
          <Field label="Leave Approval"><FSelect value={form.leaveApproval} onChange={e=>setForm(f=>({...f,leaveApproval:e.target.value}))}><option value="manager">Manager</option><option value="hr">HR Dept</option><option value="auto">Auto Approve</option></FSelect></Field>
          <Field label="Attendance Mode"><FSelect value={form.attendanceMode} onChange={e=>setForm(f=>({...f,attendanceMode:e.target.value}))}><option value="manual">Manual Clock In/Out</option><option value="biometric">Biometric</option><option value="gps">GPS Based</option></FSelect></Field>
          <Field label="Office Start Time"><FInput type="time" value={form.workStartTime} onChange={e=>setForm(f=>({...f,workStartTime:e.target.value}))} /></Field>
          <Field label="Office End Time"><FInput type="time" value={form.workEndTime} onChange={e=>setForm(f=>({...f,workEndTime:e.target.value}))} /></Field>
          <Field label="Late Grace Period (minutes)"><FInput type="number" value={form.lateGraceMinutes} onChange={e=>setForm(f=>({...f,lateGraceMinutes:e.target.value}))} placeholder="15" /></Field>
        </div>
        <Field label="Payslip Footer Note"><FTextarea value={form.payslipNote} onChange={e=>setForm(f=>({...f,payslipNote:e.target.value}))} /></Field>
        <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:10 }}>
          <GreenBtn onClick={save} style={{ fontSize:14, padding:"10px 28px", opacity:saving?0.6:1, pointerEvents:saving?"none":"auto" }}>💾 {saving ? "Saving..." : "Save Settings"}</GreenBtn>
          {saved && <span style={{ color:G.green, fontSize:13, fontWeight:700, background:G.greenBg, padding:"6px 14px", borderRadius:8 }}>✓ Settings saved!</span>}
        </div>
        </>
        )}
      </Card>
    </div>
  );
}
/* ══════════════════════════════════════════
   ESSENTIALS — 100% ORIGINAL CODE BELOW
   (no changes — just pasted as-is)
══════════════════════════════════════════ */
const FONT      = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";
const FONT_BODY = FONT;
const GREEN      = "#1a6b3c";
const GREEN2     = "#22863a";
const GREEN_LITE = "#eaf3ea";
const SHADOW     = "0 1px 3px rgba(0,0,0,.08)";

const SAMPLE_TODOS = [
  { addedOn:"08/06/2026", taskId:"TASK-001", task:"Reconcile Q2 purchase invoices",      status:"In Progress",  startDate:"2026-06-01", endDate:"2026-06-10", hours:"6", assignedBy:"Admin",   assignedTo:"Priya S.",  priority:"High"   },
  { addedOn:"07/06/2026", taskId:"TASK-002", task:"Update product pricing list",          status:"Not Started",  startDate:"2026-06-08", endDate:"2026-06-15", hours:"3", assignedBy:"Admin",   assignedTo:"Rahul M.",  priority:"Medium" },
  { addedOn:"06/06/2026", taskId:"TASK-003", task:"Audit warehouse stock levels",         status:"Completed",    startDate:"2026-06-03", endDate:"2026-06-06", hours:"8", assignedBy:"Manager", assignedTo:"Ananya K.", priority:"High"   },
  { addedOn:"05/06/2026", taskId:"TASK-004", task:"Send supplier payment reminders",      status:"Completed",    startDate:"2026-06-05", endDate:"2026-06-05", hours:"1", assignedBy:"Admin",   assignedTo:"Vikram T.", priority:"Low"    },
  { addedOn:"04/06/2026", taskId:"TASK-005", task:"Prepare monthly expense report",      status:"In Progress",  startDate:"2026-06-04", endDate:"2026-06-12", hours:"5", assignedBy:"Admin",   assignedTo:"Priya S.",  priority:"Medium" },
  { addedOn:"03/06/2026", taskId:"TASK-006", task:"Review and approve new sales orders", status:"Not Started",  startDate:"2026-06-09", endDate:"2026-06-09", hours:"2", assignedBy:"Manager", assignedTo:"Rahul M.",  priority:"High"   },
  { addedOn:"02/06/2026", taskId:"TASK-007", task:"Update CRM customer records",         status:"In Progress",  startDate:"2026-06-02", endDate:"2026-06-11", hours:"4", assignedBy:"Admin",   assignedTo:"Deepa R.",  priority:"Low"    },
];
const SAMPLE_DOCS = [
  { name:"Q2_Purchase_Invoice_Bundle.pdf",   description:"All purchase invoices for April–June 2026",  uploadedDate:"07/06/2026" },
  { name:"Warehouse_Audit_Report_June.xlsx", description:"Stock audit results – Main warehouse",       uploadedDate:"06/06/2026" },
  { name:"Supplier_Contracts_2026.zip",      description:"Signed contracts with top 10 suppliers",     uploadedDate:"04/06/2026" },
  { name:"Employee_Onboarding_Docs.pdf",     description:"HR onboarding package for new hires",        uploadedDate:"01/06/2026" },
  { name:"Brand_Guidelines_v3.pdf",          description:"Updated visual brand identity guidelines",    uploadedDate:"28/05/2026" },
  { name:"Tax_Filing_May2026.pdf",           description:"GST and income tax filing documents for May", uploadedDate:"20/05/2026" },
];
const SAMPLE_MEMOS = [
  { heading:"New POS Terminal Policy",      description:"All branches must validate receipts via the new POS system from July 1st.",      createdDate:"08/06/2026" },
  { heading:"Q3 Sales Target Announcement", description:"The Q3 target has been set at ₹42L across all regions.",                         createdDate:"07/06/2026" },
  { heading:"Inventory Freeze – June 30",   description:"No stock transfers or adjustments to be made on June 30 due to year-end audit.", createdDate:"05/06/2026" },
  { heading:"Office Renovation Schedule",   description:"Head office 2nd floor will be under renovation June 20–25.",                    createdDate:"03/06/2026" },
  { heading:"Updated Leave Policy",         description:"Casual leave can now be applied 24hrs in advance instead of 48hrs.",             createdDate:"01/06/2026" },
];
const SAMPLE_EVENTS = [
  { name:"Board Review Meeting",          date:"2026-06-10", startTime:"10:00", endTime:"12:00", repeat:"One time" },
  { name:"Monthly Payroll Run",           date:"2026-06-15", startTime:"09:00", endTime:"10:00", repeat:"Monthly"  },
  { name:"Team Standup",                  date:"2026-06-09", startTime:"09:30", endTime:"09:45", repeat:"Daily"    },
  { name:"Supplier Call – Arjun Traders", date:"2026-06-11", startTime:"14:00", endTime:"15:00", repeat:"One time" },
  { name:"Stock Audit Deadline",          date:"2026-06-20", startTime:"17:00", endTime:"17:00", repeat:"One time" },
  { name:"Q2 Closing",                    date:"2026-06-30", startTime:"18:00", endTime:"18:00", repeat:"Monthly"  },
];
const SAMPLE_MESSAGES = [
  { text:"Warehouse stock report ready for review.",            time:"09:05 AM", sender:"system" },
  { text:"Please check the new supplier invoice in Documents.", time:"09:18 AM", sender:"system" },
  { text:"Stock audit completed – no discrepancies found.",     time:"10:30 AM", sender:"self"   },
  { text:"Q2 targets updated in the sales dashboard.",          time:"11:00 AM", sender:"self"   },
  { text:"Reminder: team meeting at 3 PM today.",               time:"02:45 PM", sender:"system" },
];
const SAMPLE_KB = [
  { title:"How to Process a Purchase Return", content:"Navigate to Purchases › Purchase Return, click Add, select the original invoice...", share:"Public",  date:"05/06/2026" },
  { title:"Stock Transfer SOP",               content:"Raise a transfer request in Stock Transfers module. Branch manager must approve within 24 hrs...", share:"Team", date:"01/06/2026" },
  { title:"Month-End Closing Checklist",      content:"1. Reconcile all invoices. 2. Run stock audit. 3. Export P&L report. 4. Archive documents...", share:"Private", date:"28/05/2026" },
  { title:"Adding a New Supplier",            content:"Go to Contacts › Suppliers, click + Add. Fill mandatory fields: Name, GST No., Payment Terms...", share:"Public", date:"20/05/2026" },
];

let stylesInjected=false;
function injectStyles(){
  if(stylesInjected)return; stylesInjected=true;
  const s=document.createElement("style");
  const tabler=document.createElement("link"); tabler.rel="stylesheet"; tabler.href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/dist/tabler-icons.min.css"; document.head.appendChild(tabler);
  const gf=document.createElement("link"); gf.rel="stylesheet"; gf.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"; document.head.appendChild(gf);
  s.textContent=`* { box-sizing:border-box; } .ess-wrap { font-family:${FONT_BODY}; color:#222; font-size:14px; line-height:1.5; } .ess-tabs { display:flex; gap:0; border-bottom:2px solid #e4ebe7; background:#fff; padding:0 10px; flex-wrap:wrap; } .ess-tab { padding:13px 18px; font-size:13.5px; font-weight:600; color:#6b7280; cursor:pointer; border:none; background:none; border-bottom:3px solid transparent; margin-bottom:-2px; transition:.2s; font-family:${FONT_BODY}; } .ess-tab:hover { color:${GREEN}; } .ess-tab.active { color:${GREEN}; border-bottom-color:${GREEN}; background:${GREEN_LITE}; border-radius:6px 6px 0 0; } .ess-title { font-size:20px; font-weight:600; color:#111827; font-family:'Inter',sans-serif; } .ess-sub { font-size:13px; color:#9ca3af; margin-top:2px; } .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; } .ess-card { background:#fff; border-radius:12px; box-shadow:${SHADOW}; padding:20px; margin-bottom:18px; border:1px solid #f0f4f1; } .btn-add { background:#1a6b3c; color:#fff; border:none; border-radius:7px; padding:9px 20px; font-size:13.5px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:7px; font-family:'Inter',sans-serif; transition:background .15s; } .btn-add:hover { background:#145530; } .btn-save { background:#1a6b3c; color:#fff; border:none; border-radius:7px; padding:9px 24px; font-size:13.5px; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; transition:background .15s; } .btn-save:hover { background:#145530; } .btn-cancel { background:#fff; color:#374151; border:1px solid #d1d5db; border-radius:7px; padding:9px 20px; font-size:13.5px; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; } .export-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; } .exp-btn { border:1px solid #d1d5db; background:#fff; border-radius:7px; padding:7px 13px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:5px; font-family:${FONT_BODY}; transition:.15s; color:#374151; } .exp-btn:hover { background:#f9fafb; } .exp-btn.csv { color:#1a6b3c; border-color:#1a6b3c; } .exp-btn.excel { color:#217346; border-color:#217346; } .exp-btn.pdf { color:#dc2626; border-color:#dc2626; } .exp-btn.print { color:#4b5563; border-color:#9ca3af; } .exp-btn.col { color:#7c3aed; border-color:#7c3aed; } .ess-table { width:100%; border-collapse:collapse; font-size:13.5px; } .ess-table th { background:#f8faf9; color:#6b7280; font-weight:500; padding:10px 14px; text-align:left; border-bottom:1px solid #e5e7eb; white-space:nowrap; font-family:'Inter',sans-serif; font-size:12px; letter-spacing:.04em; text-transform:uppercase; } .ess-table td { padding:11px 14px; border-bottom:1px solid #f3f4f6; color:#374151; vertical-align:middle; } .ess-table tr:hover td { background:#f0faf4; } .no-data { text-align:center; color:#9ca3af; padding:40px; font-size:14px; } .show-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#6b7280; margin-bottom:10px; } .show-row select { border:1px solid #d1d5db; border-radius:6px; padding:4px 8px; font-family:${FONT_BODY}; font-size:13px; } .tbl-search { border:1px solid #d1d5db; border-radius:7px; padding:8px 13px; font-family:${FONT_BODY}; font-size:13px; width:200px; outline:none; transition:.2s; } .tbl-search:focus { border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.10); } .tbl-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px; } .form-group { margin-bottom:16px; } .form-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:5px; display:block; } .form-control { width:100%; border:1px solid #d1d5db; border-radius:8px; padding:9px 13px; font-family:${FONT_BODY}; font-size:13.5px; box-sizing:border-box; color:#111827; transition:.2s; } .form-control:focus { outline:none; border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.12); } .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; } .filter-bar { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:16px; } .filter-title { font-size:14px; font-weight:700; color:${GREEN}; margin-bottom:12px; display:flex; align-items:center; gap:6px; } .badge { padding:3px 10px; border-radius:20px; font-size:11.5px; font-weight:600; display:inline-block; } .badge-high { background:#fee2e2; color:#991b1b; } .badge-medium { background:#fef9c3; color:#713f12; } .badge-low { background:#dbeafe; color:#1e40af; } .badge-done { background:#d1fae5; color:#065f46; } .badge-prog { background:#e0f2fe; color:#075985; } .badge-wait { background:#f3f4f6; color:#374151; } .badge-pub { background:#d1fae5; color:#065f46; } .badge-priv { background:#fee2e2; color:#991b1b; } .badge-team { background:#ede9fe; color:#5b21b6; } .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.50); z-index:1000; display:flex; align-items:center; justify-content:center; } .modal-box { background:#fff; border-radius:14px; padding:28px; width:560px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.20); } .modal-title { font-size:18px; font-weight:700; color:#111827; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; } .modal-close { background:none; border:none; font-size:22px; cursor:pointer; color:#9ca3af; line-height:1; } .cal-wrap { background:#fff; border-radius:12px; padding:22px; } .cal-nav { display:flex; align-items:center; gap:10px; margin-bottom:16px; } .cal-nav button { border:1px solid #d1d5db; background:#fff; border-radius:7px; padding:5px 13px; cursor:pointer; font-family:${FONT_BODY}; font-size:13px; } .cal-month { font-size:19px; font-weight:700; color:${GREEN}; flex:1; text-align:center; } .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); border-left:1px solid #e5e7eb; border-top:1px solid #e5e7eb; } .cal-day-hdr { text-align:center; font-weight:600; font-size:12.5px; color:#6b7280; padding:9px 0; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; background:#f8faf9; } .cal-cell { min-height:88px; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; padding:6px 8px; font-size:13px; color:#374151; } .cal-cell.today { background:#f0fdf4; } .cal-cell.empty { background:#fafafa; color:#d1d5db; } .cal-date-num { font-weight:600; font-size:13px; } .msg-area { min-height:320px; padding:20px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; } .msg-bubble { padding:10px 14px; border-radius:12px; max-width:72%; font-size:13.5px; line-height:1.5; } .msg-bubble.self { background:${GREEN}; color:#fff; align-self:flex-end; border-bottom-right-radius:3px; } .msg-bubble.system { background:#f3f4f6; color:#374151; align-self:flex-start; border-bottom-left-radius:3px; } .msg-time { font-size:11px; opacity:.65; margin-top:3px; } .msg-input-row { display:flex; gap:8px; padding:12px 16px; border-top:1px solid #f3f4f6; background:#fff; border-radius:0 0 12px 12px; } .msg-input { flex:1; border:1px solid #d1d5db; border-radius:8px; padding:10px 14px; font-family:${FONT_BODY}; font-size:13.5px; outline:none; transition:.2s; } .msg-input:focus { border-color:${GREEN}; } .msg-send { background:#1a6b3c; color:#fff; border:none; border-radius:7px; padding:10px 16px; font-size:16px; cursor:pointer; } .rich-toolbar { border:1px solid #d1d5db; border-radius:8px 8px 0 0; background:#f9fafb; padding:8px 12px; display:flex; gap:6px; flex-wrap:wrap; } .rich-btn { background:#fff; border:1px solid #d1d5db; border-radius:5px; padding:3px 9px; font-size:12px; cursor:pointer; } .rich-area { border:1px solid #d1d5db; border-top:none; border-radius:0 0 8px 8px; min-height:130px; padding:12px; font-family:${FONT_BODY}; font-size:13.5px; width:100%; box-sizing:border-box; resize:vertical; outline:none; } .dropzone { border:2px dashed #d1d5db; border-radius:10px; padding:36px; text-align:center; color:#9ca3af; font-size:14px; cursor:pointer; transition:.2s; } .dropzone:hover { border-color:${GREEN}; color:${GREEN}; background:#f0fdf4; } .kb-card { border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:12px; transition:.2s; } .kb-card:hover { border-color:${GREEN}; box-shadow:0 4px 12px rgba(26,107,60,.10); } .settings-sidebar { background:#f8faf9; border-right:1px solid #e5e7eb; min-width:160px; border-radius:12px 0 0 12px; } .settings-tab { padding:13px 20px; cursor:pointer; font-weight:600; font-size:13.5px; transition:.2s; border-bottom:1px solid #e9ecef; font-family:${FONT_BODY}; } .settings-tab:hover { background:#e8f5ee; color:${GREEN}; } .settings-tab.active { background:${GREEN}; color:#fff; } .pag-btn { border:1px solid #d1d5db; background:#fff; border-radius:6px; padding:6px 13px; font-size:13px; cursor:pointer; font-family:${FONT_BODY}; transition:.15s; } .pag-btn:hover { background:#f3f4f6; } .act-btn { background:none; border:none; cursor:pointer; padding:5px 7px; border-radius:6px; font-size:15px; transition:.15s; color:#6b7280; display:inline-flex; align-items:center; } .act-btn:hover { background:#f3f4f6; color:#374151; } .act-btn.edit-del { color:#9ca3af; } .act-btn.edit-del:hover { background:#fee2e2; color:#dc2626; }`;
  document.head.appendChild(s);
}

function EssExportBar({ data=[], columns=[], filename="export" }) {
  const toCSV=()=>{ const header=columns.map(c=>c.label).join(","); const rows=data.map(row=>columns.map(c=>`"${row[c.key]??""}`).join(",")); const blob=new Blob([[header,...rows].join("\n")],{type:"text/csv"}); Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:`${filename}.csv`}).click(); };
  const toPrint=()=>{ const w=window.open("","_blank"); const hdrs=columns.map(c=>`<th style="border:1px solid #ccc;padding:8px">${c.label}</th>`).join(""); const rows=data.map(row=>`<tr>${columns.map(c=>`<td style="border:1px solid #ccc;padding:8px">${row[c.key]??""}</td>`).join("")}</tr>`).join(""); w.document.write(`<html><head><title>${filename}</title><style>body{font-family:sans-serif;font-size:13px}table{border-collapse:collapse;width:100%}</style></head><body><h2>${filename}</h2><table><thead><tr>${hdrs}</tr></thead><tbody>${rows}</tbody></table></body></html>`); w.print(); };
  const [showCols,setShowCols]=useState(false);
  const [visible,setVisible]=useState(()=>Object.fromEntries(columns.map(c=>[c.key,true])));
  return (
    <div className="export-bar">
      <button className="exp-btn csv"   onClick={toCSV}><i className="ti ti-file-text" style={{fontSize:14}}></i> CSV</button>
      <button className="exp-btn excel" onClick={toCSV}><i className="ti ti-table"     style={{fontSize:14}}></i> Excel</button>
      <button className="exp-btn print" onClick={toPrint}><i className="ti ti-printer"  style={{fontSize:14}}></i> Print</button>
      <div style={{position:"relative"}}>
        <button className="exp-btn col" onClick={()=>setShowCols(v=>!v)}><i className="ti ti-columns" style={{fontSize:14}}></i> Columns</button>
        {showCols&&(<div style={{position:"absolute",top:"110%",left:0,background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:14,zIndex:100,minWidth:190,boxShadow:"0 8px 24px rgba(0,0,0,.12)"}}>{columns.map(c=>(<label key={c.key} style={{display:"flex",gap:8,alignItems:"center",marginBottom:7,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={!!visible[c.key]} onChange={()=>setVisible(v=>({...v,[c.key]:!v[c.key]}))} />{c.label}</label>))}</div>)}
      </div>
      <button className="exp-btn pdf" onClick={toPrint}><i className="ti ti-file-type-pdf" style={{fontSize:14}}></i> PDF</button>
    </div>
  );
}

function EssDataTable({ columns, data, emptyMsg="No data available in table" }) {
  const [q,setQ]=useState(""); const [show,setShow]=useState(25); const [page,setPage]=useState(1);
  const filtered=data.filter(row=>columns.some(c=>String(row[c.key]??"").toLowerCase().includes(q.toLowerCase())));
  const totalPages=Math.ceil(filtered.length/show); const shown=filtered.slice((page-1)*show,page*show);
  return (
    <>
      <div className="tbl-top">
        <div className="show-row">Show <select value={show} onChange={e=>{setShow(+e.target.value);setPage(1);}}>{[10,25,50,100].map(n=><option key={n}>{n}</option>)}</select> entries</div>
        <EssExportBar data={data} columns={columns} />
        <input className="tbl-search" placeholder="Search..." value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} />
      </div>
      <div style={{overflowX:"auto"}}>
        <table className="ess-table">
          <thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead>
          <tbody>{shown.length===0?<tr><td colSpan={columns.length} className="no-data">{emptyMsg}</td></tr>:shown.map((row,i)=><tr key={i}>{columns.map(c=><td key={c.key}>{row[c.key]}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,fontSize:13,color:"#6b7280"}}>
        <span>Showing {shown.length===0?0:(page-1)*show+1} to {Math.min(page*show,filtered.length)} of {filtered.length} entries</span>
        <div style={{display:"flex",gap:6}}>
          <button className="pag-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(<button key={p} className="pag-btn" onClick={()=>setPage(p)} style={{background:p===page?GREEN:"#fff",color:p===page?"#fff":"#374151",borderColor:p===page?GREEN:"#d1d5db"}}>{p}</button>))}
          <button className="pag-btn" disabled={page===totalPages||totalPages===0} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      </div>
    </>
  );
}

function EssFilterBar({ filters }) {
  return (<div className="filter-bar"><div className="filter-title">▼ Filters</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>{filters.map(f=>(<div key={f.label}><label className="form-label">{f.label}:</label><select className="form-control" defaultValue="All">{(f.options||["All"]).map(o=><option key={o}>{o}</option>)}</select></div>))}</div></div>);
}
function EssRichTextArea({ value, onChange }) {
  return (<><div className="rich-toolbar">{["B","I","U","≡","⊞","⊟","🔗"].map(b=><button key={b} className="rich-btn">{b}</button>)}<span style={{fontSize:11,color:"#9ca3af",marginLeft:"auto",alignSelf:"center"}}>Rich Text</span></div><textarea className="rich-area" value={value} onChange={e=>onChange(e.target.value)} placeholder="Write here..." /></>);
}

const TODO_COLS=[{key:"addedOn",label:"Added On"},{key:"taskId",label:"Task ID"},{key:"task",label:"Task"},{key:"priority",label:"Priority"},{key:"statusBadge",label:"Status"},{key:"startDate",label:"Start Date"},{key:"endDate",label:"End Date"},{key:"hours",label:"Est. Hours"},{key:"assignedBy",label:"Assigned By"},{key:"assignedTo",label:"Assigned To"},{key:"actions",label:"Actions"}];
function priorityBadge(p){const cls={High:"badge-high",Medium:"badge-medium",Low:"badge-low"}[p]||"badge-wait";return <span className={`badge ${cls}`}>{p}</span>;}
function statusBadge(s){const cls={Completed:"badge-done","In Progress":"badge-prog","Not Started":"badge-wait"}[s]||"badge-wait";return <span className={`badge ${cls}`}>{s}</span>;}
function genTaskId(todos){const nums=todos.map(t=>parseInt(String(t.taskId||"").replace("TASK-",""))||0);const next=nums.length>0?Math.max(...nums)+1:1;return `TASK-${String(next).padStart(3,"0")}`;}

function TodoModal({ onClose, onSave, nextId }) {
  const [form,setForm]=useState({task:"",assignedTo:"",priority:"",status:"",startDate:"",endDate:"",hours:"",desc:""});
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="modal-title">Add Task <button className="modal-close" onClick={onClose}><i className="ti ti-x" style={{fontSize:18,verticalAlign:"middle"}}></i></button></div>
        <div style={{padding:"8px 12px",background:G.greenBg,borderRadius:8,marginBottom:16,fontSize:13,color:G.green,fontWeight:600,display:"flex",alignItems:"center",gap:8}}><span style={{background:G.green,color:"#fff",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>AUTO ID</span>{nextId}</div>
        <div className="form-group"><label className="form-label">Task Name *</label><input className="form-control" value={form.task} onChange={set("task")} placeholder="Enter task name" /></div>
        <div className="form-group"><label className="form-label">Assigned To *</label><input className="form-control" value={form.assignedTo} onChange={set("assignedTo")} placeholder="Employee name" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Priority</label><select className="form-control" value={form.priority} onChange={set("priority")}><option value="">Select</option><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={form.status} onChange={set("status")}><option value="">Select</option><option>Not Started</option><option>In Progress</option><option>Completed</option></select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Start Date *</label><input className="form-control" type="datetime-local" value={form.startDate} onChange={set("startDate")} /></div>
          <div className="form-group"><label className="form-label">End Date</label><input className="form-control" type="datetime-local" value={form.endDate} onChange={set("endDate")} /></div>
        </div>
        <div className="form-group"><label className="form-label">Estimated Hours</label><input className="form-control" type="number" value={form.hours} onChange={set("hours")} placeholder="Hours" style={{maxWidth:160}} /></div>
        <div className="form-group"><label className="form-label">Description</label><EssRichTextArea value={form.desc} onChange={v=>setForm(f=>({...f,desc:v}))} /></div>
        <div className="form-group"><label className="form-label">Attach Documents</label><div className="dropzone">📎 Drop files here or click to upload</div></div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}><button className="btn-save" onClick={()=>{onSave(form);onClose();}}>Save</button><button className="btn-cancel" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

function EssTodoPage() {
  const [showModal,setShowModal]=useState(false);
  const now=new Date().toLocaleDateString("en-IN");
  const [todos,setTodos]=useState(SAMPLE_TODOS.map(t=>({...t,priority:priorityBadge(t.priority),statusBadge:statusBadge(t.status),actions:<><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>})));
  const nextId=genTaskId(todos);
  return (
    <div>
      {showModal&&(<TodoModal nextId={nextId} onClose={()=>setShowModal(false)} onSave={f=>setTodos(ts=>[...ts,{addedOn:now,taskId:nextId,task:f.task,priority:priorityBadge(f.priority||"Low"),statusBadge:statusBadge(f.status||"Not Started"),startDate:f.startDate,endDate:f.endDate,hours:f.hours,assignedBy:"Admin",assignedTo:f.assignedTo,actions:<><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>}])} />)}
      <div className="page-header"><div><div className="ess-title">📋 To-Do List</div><div className="ess-sub">{todos.length} tasks total</div></div><button className="btn-add" onClick={()=>setShowModal(true)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Task</button></div>
      <EssFilterBar filters={[{label:"Assigned To",options:["All","Priya S.","Rahul M.","Ananya K.","Vikram T.","Deepa R."]},{label:"Priority",options:["All","High","Medium","Low"]},{label:"Status",options:["All","Not Started","In Progress","Completed"]},{label:"Date Range",options:["All","This Week","This Month","Custom"]}]} />
      <div className="ess-card"><EssDataTable columns={TODO_COLS} data={todos} /></div>
    </div>
  );
}

const DOC_COLS=[{key:"name",label:"File Name"},{key:"description",label:"Description"},{key:"uploadedDate",label:"Uploaded Date"},{key:"size",label:"Size"},{key:"actions",label:"Actions"}];
function EssDocumentPage() {
  const [showForm,setShowForm]=useState(false); const [file,setFile]=useState(null); const [desc,setDesc]=useState(""); const fileRef=useRef();
  const [docs,setDocs]=useState(SAMPLE_DOCS.map(d=>({...d,size:`${(Math.random()*4+0.5).toFixed(1)} MB`,actions:<><button className="act-btn"><i className="ti ti-download"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>})));
  const handleSubmit=()=>{ if(!file) return alert("Please choose a file"); setDocs(ds=>[...ds,{name:file.name,description:desc,uploadedDate:new Date().toLocaleDateString("en-IN"),size:`${(file.size/1048576).toFixed(1)} MB`,actions:<><button className="act-btn"><i className="ti ti-download"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>}]); setFile(null); setDesc(""); setShowForm(false); };
  return (
    <div>
      <div className="page-header"><div><div className="ess-title">📁 Documents</div><div className="ess-sub">Manage shared files and attachments</div></div><button className="btn-add" onClick={()=>setShowForm(v=>!v)}><i className="ti ti-upload" style={{fontSize:15}}></i> Upload</button></div>
      {showForm&&(<div className="ess-card"><div style={{fontWeight:700,fontSize:15,marginBottom:14,color:"#111827"}}>Upload Document</div><div className="form-group"><label className="form-label">File *</label><input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png,.xlsx" ref={fileRef} onChange={e=>setFile(e.target.files[0])} style={{display:"none"}} /><div style={{display:"flex",alignItems:"center",gap:10}}><button className="exp-btn" onClick={()=>fileRef.current.click()}>Choose File</button><span style={{fontSize:13,color:"#6b7280"}}>{file?file.name:"No file chosen"}</span></div></div><div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Brief description" /></div><div style={{display:"flex",gap:10}}><button className="btn-save" onClick={handleSubmit}>Submit</button><button className="btn-cancel" onClick={()=>setShowForm(false)}>Cancel</button></div></div>)}
      <div className="ess-card"><EssDataTable columns={DOC_COLS} data={docs} /></div>
    </div>
  );
}

const MEMO_COLS=[{key:"heading",label:"Heading"},{key:"description",label:"Description"},{key:"createdDate",label:"Created Date"},{key:"actions",label:"Actions"}];
function MemoModal({ onClose, onSave }) {
  const [heading,setHeading]=useState(""); const [desc,setDesc]=useState("");
  return (<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal-box"><div className="modal-title">Add Memo <button className="modal-close" onClick={onClose}><i className="ti ti-x" style={{fontSize:18,verticalAlign:"middle"}}></i></button></div><div className="form-group"><label className="form-label">Heading *</label><input className="form-control" value={heading} onChange={e=>setHeading(e.target.value)} placeholder="Memo heading" /></div><div className="form-group"><label className="form-label">Content</label><EssRichTextArea value={desc} onChange={setDesc} /></div><div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}><button className="btn-save" onClick={()=>{if(heading){onSave({heading,desc});onClose();}}}>Save</button><button className="btn-cancel" onClick={onClose}>Close</button></div></div></div>);
}
function EssMemosPage() {
  const [showModal,setShowModal]=useState(false);
  const [memos,setMemos]=useState(SAMPLE_MEMOS.map(m=>({...m,actions:<><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>})));
  return (<div>{showModal&&<MemoModal onClose={()=>setShowModal(false)} onSave={m=>setMemos(ms=>[...ms,{heading:m.heading,description:m.desc,createdDate:new Date().toLocaleDateString("en-IN"),actions:<><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>}])} />}<div className="page-header"><div><div className="ess-title">📝 Memos</div><div className="ess-sub">Internal announcements and notices</div></div><button className="btn-add" onClick={()=>setShowModal(true)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Memo</button></div><div className="ess-card"><EssDataTable columns={MEMO_COLS} data={memos} /></div></div>);
}

function ReminderModal({ onClose, onSave }) {
  const [form,setForm]=useState({name:"",repeat:"One time",date:"",startTime:"",endTime:""});
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  return (<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal-box" style={{maxWidth:480}}><div className="modal-title">Add Reminder <button className="modal-close" onClick={onClose}><i className="ti ti-x" style={{fontSize:18,verticalAlign:"middle"}}></i></button></div><div className="form-group"><label className="form-label">Event Name *</label><input className="form-control" value={form.name} onChange={set("name")} placeholder="e.g. Monthly Payroll Run" /></div><div className="form-row"><div className="form-group"><label className="form-label">Repeat</label><select className="form-control" value={form.repeat} onChange={set("repeat")}><option>One time</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div><div className="form-group"><label className="form-label">Date *</label><input className="form-control" type="date" value={form.date} onChange={set("date")} /></div></div><div className="form-row"><div className="form-group"><label className="form-label">Start Time *</label><input className="form-control" type="time" value={form.startTime} onChange={set("startTime")} /></div><div className="form-group"><label className="form-label">End Time</label><input className="form-control" type="time" value={form.endTime} onChange={set("endTime")} /></div></div><div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}><button className="btn-cancel" onClick={onClose}>Cancel</button><button className="btn-save" onClick={()=>{if(form.name&&form.date){onSave(form);onClose();}}}>Save</button></div></div></div>);
}

const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const EVENT_COLORS=["#1a6b3c","#0284c7","#7c3aed","#dc2626","#d97706","#0891b2"];

function EssRemindersPage() {
  const [showModal,setShowModal]=useState(false); const [events,setEvents]=useState(SAMPLE_EVENTS); const today=new Date();
  const [current,setCurrent]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const year=current.getFullYear(),month=current.getMonth();
  const firstDay=new Date(year,month,1).getDay(),daysIn=new Date(year,month+1,0).getDate();
  const cells=[...Array(firstDay).fill(null),...Array.from({length:daysIn},(_,i)=>i+1)];
  const monthName=current.toLocaleString("default",{month:"long"});
  return (
    <div>
      {showModal&&<ReminderModal onClose={()=>setShowModal(false)} onSave={r=>setEvents(e=>[...e,r])} />}
      <div className="page-header"><div><div className="ess-title">🗓️ Reminders</div><div className="ess-sub">{events.length} upcoming events</div></div><button className="btn-add" onClick={()=>setShowModal(true)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Reminder</button></div>
      <div className="ess-card cal-wrap" style={{padding:22}}>
        <div className="cal-nav"><button onClick={()=>setCurrent(new Date(year,month-1,1))}>‹ Prev</button><button onClick={()=>setCurrent(new Date(today.getFullYear(),today.getMonth(),1))}>Today</button><button onClick={()=>setCurrent(new Date(year,month+1,1))}>Next ›</button><div className="cal-month">{monthName} {year}</div></div>
        <div className="cal-grid">
          {DAYS.map(d=><div key={d} className="cal-day-hdr">{d}</div>)}
          {cells.map((d,i)=>{ const isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear(); const dayEvents=events.filter(ev=>{if(!ev.date)return false;const ed=new Date(ev.date);return ed.getDate()===d&&ed.getMonth()===month&&ed.getFullYear()===year;}); return (<div key={i} className={`cal-cell${d===null?" empty":""}${isToday?" today":""}`}>{d&&<div className="cal-date-num" style={{color:isToday?GREEN:"#374151"}}>{d}</div>}{dayEvents.map((ev,ei)=>(<div key={ei} style={{background:EVENT_COLORS[ei%EVENT_COLORS.length],color:"#fff",borderRadius:5,padding:"2px 6px",fontSize:11,marginTop:3,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={ev.name}>{ev.startTime} {ev.name}</div>))}</div>); })}
        </div>
      </div>
      <div className="ess-card"><div style={{fontWeight:700,fontSize:15,marginBottom:14,color:"#111827"}}>Upcoming Events</div>{events.map((ev,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}><div style={{width:10,height:10,borderRadius:"50%",background:EVENT_COLORS[i%EVENT_COLORS.length],flexShrink:0}}/><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14,color:"#111827"}}>{ev.name}</div><div style={{fontSize:12,color:"#9ca3af"}}>{ev.date} · {ev.startTime}{ev.endTime?`–${ev.endTime}`:""} · {ev.repeat}</div></div><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></div>))}</div>
    </div>
  );
}

function EssMessagesPage() {
  const [msgs,setMsgs]=useState(SAMPLE_MESSAGES); const [input,setInput]=useState("");
  const send=()=>{ if(!input.trim()) return; setMsgs(m=>[...m,{text:input,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),sender:"self"}]); setInput(""); };
  return (
    <div>
      <div className="ess-title" style={{marginBottom:18}}>💬 Messages</div>
      <div className="ess-card" style={{padding:0,display:"flex",flexDirection:"column"}}>
        <div style={{borderBottom:"1px solid #f3f4f6",padding:"12px 16px",display:"flex",gap:10,alignItems:"center"}}>{["Admin","Priya S.","Rahul M.","Ananya K."].map((n,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:i===0?GREEN_LITE:"transparent",border:i===0?`1px solid ${GREEN}`:"1px solid #e5e7eb",cursor:"pointer",fontSize:13,fontWeight:600,color:i===0?GREEN:"#374151"}}><div style={{width:26,height:26,borderRadius:"50%",background:i===0?GREEN:"#e5e7eb",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{n[0]}</div>{n}</div>))}</div>
        <div className="msg-area">{msgs.map((m,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.sender==="self"?"flex-end":"flex-start"}}><div className={`msg-bubble ${m.sender}`}>{m.text}</div><div className="msg-time" style={{color:"#9ca3af"}}>{m.time}</div></div>))}</div>
        <div className="msg-input-row"><input className="msg-input" placeholder="Type a message..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} /><button className="msg-send" onClick={send}><i className="ti ti-send" style={{fontSize:16}}></i></button></div>
      </div>
    </div>
  );
}

function EssKnowledgePage() {
  const [showForm,setShowForm]=useState(false); const [articles,setArticles]=useState(SAMPLE_KB); const [form,setForm]=useState({title:"",content:"",share:"Public"}); const [search,setSearch]=useState("");
  const filtered=articles.filter(a=>a.title.toLowerCase().includes(search.toLowerCase())||a.content.toLowerCase().includes(search.toLowerCase()));
  const shareBadge=s=>{const cls={Public:"badge-pub",Private:"badge-priv",Team:"badge-team"}[s]||"badge-wait";return <span className={`badge ${cls}`}>{s}</span>;};
  return (
    <div>
      <div className="page-header"><div><div className="ess-title">📚 Knowledge Base</div><div className="ess-sub">{articles.length} articles</div></div><button className="btn-add" onClick={()=>setShowForm(v=>!v)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Article</button></div>
      {showForm&&(<div className="ess-card"><div style={{fontWeight:700,fontSize:16,marginBottom:16,color:"#111827"}}>New Article</div><div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Article title" /></div><div className="form-group"><label className="form-label">Content</label><EssRichTextArea value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} /></div><div className="form-row"><div className="form-group"><label className="form-label">Visibility</label><select className="form-control" value={form.share} onChange={e=>setForm(f=>({...f,share:e.target.value}))}><option>Public</option><option>Private</option><option>Team</option></select></div><div/></div><div style={{display:"flex",justifyContent:"flex-end",gap:10}}><button className="btn-save" onClick={()=>{if(!form.title) return alert("Title required");setArticles(a=>[...a,{...form,date:new Date().toLocaleDateString("en-IN")}]);setForm({title:"",content:"",share:"Public"});setShowForm(false);}}>Publish</button><button className="btn-cancel" onClick={()=>setShowForm(false)}>Cancel</button></div></div>)}
      <div className="ess-card" style={{marginBottom:14}}><input className="tbl-search" style={{width:"100%",maxWidth:360}} placeholder="Search articles..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
      {filtered.map((a,i)=>(<div key={i} className="kb-card"><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:4}}>{a.title}</div><div style={{fontSize:13,color:"#6b7280",lineHeight:1.6,marginBottom:8}}>{a.content.length>120?a.content.slice(0,120)+"…":a.content}</div><div style={{display:"flex",gap:8,alignItems:"center"}}>{shareBadge(a.share)}<span style={{fontSize:12,color:"#9ca3af"}}>Published {a.date}</span></div></div><div style={{display:"flex",gap:4,marginLeft:16}}><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></div></div></div>))}
      {filtered.length===0&&<div className="ess-card" style={{textAlign:"center",color:"#9ca3af",padding:40}}>No articles found.</div>}
    </div>
  );
}

function EssentialsSettingsPage() {
  const [tab,setTab]=useState("Leave"); const [leavePrefix,setLeavePrefix]=useState("LEV-2026-"); const [leaveInstructions,setLeaveInstructions]=useState("All leave applications must be submitted at least 48 hours in advance."); const [autoApproval,setAutoApproval]=useState(false);
  const tabs=["Leave","Payroll","Attendance","Sales Targets","Essentials"];
  return (
    <div>
      <div className="ess-title" style={{marginBottom:18}}>⚙️ Essentials & HRM Settings</div>
      <div className="ess-card" style={{display:"flex",gap:0,padding:0,overflow:"hidden"}}>
        <div className="settings-sidebar">{tabs.map(t=><div key={t} className={`settings-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t}</div>)}</div>
        <div style={{flex:1,padding:24}}>
          {tab==="Leave"&&(<><div style={{fontWeight:700,fontSize:16,marginBottom:18,color:"#111827"}}>Leave Settings</div><div className="form-group"><label className="form-label">Leave Reference No. Prefix</label><input className="form-control" value={leavePrefix} onChange={e=>setLeavePrefix(e.target.value)} style={{maxWidth:300}}/></div><div className="form-group"><label className="form-label">Max Casual Leave Days / Year</label><input className="form-control" type="number" defaultValue={12} style={{maxWidth:150}}/></div><div className="form-group"><label className="form-label">Auto Approval After (days)</label><input className="form-control" type="number" defaultValue={3} style={{maxWidth:150}}/></div><div className="form-group"><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><input type="checkbox" checked={autoApproval} onChange={e=>setAutoApproval(e.target.checked)}/><span className="form-label" style={{margin:0}}>Enable Auto Approval</span></label></div><div className="form-group"><label className="form-label">Leave Application Instructions</label><EssRichTextArea value={leaveInstructions} onChange={setLeaveInstructions}/></div></>)}
          {tab==="Payroll"&&(<div><div style={{fontWeight:700,fontSize:16,marginBottom:18,color:"#111827"}}>Payroll Settings</div><div className="form-group"><label className="form-label">Payroll Cycle</label><select className="form-control" defaultValue="Monthly" style={{maxWidth:240}}><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select></div><div className="form-group"><label className="form-label">Payroll Processing Date</label><input className="form-control" type="number" defaultValue={28} min={1} max={31} style={{maxWidth:120}}/></div><div className="form-group"><label className="form-label">Default Currency</label><select className="form-control" defaultValue="INR (₹)" style={{maxWidth:240}}><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select></div></div>)}
          {tab==="Attendance"&&(<div><div style={{fontWeight:700,fontSize:16,marginBottom:18,color:"#111827"}}>Attendance Settings</div><div className="form-group"><label className="form-label">Work Start Time</label><input className="form-control" type="time" defaultValue="09:00" style={{maxWidth:180}}/></div><div className="form-group"><label className="form-label">Work End Time</label><input className="form-control" type="time" defaultValue="18:00" style={{maxWidth:180}}/></div><div className="form-group"><label className="form-label">Late Arrival Grace (minutes)</label><input className="form-control" type="number" defaultValue={15} style={{maxWidth:150}}/></div></div>)}
          {(tab==="Sales Targets"||tab==="Essentials")&&<div style={{color:"#9ca3af",fontSize:14,padding:20}}>{tab} settings — configure as needed.</div>}
          <div style={{marginTop:24}}><button className="btn-save">Update Settings</button></div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:12,color:"#9ca3af",marginTop:14}}>Essentials and HRM module version — <strong>5.1</strong></div>
    </div>
  );
}

const ESS_TABS=[
  { label:"Essentials",     path:"/essentials",                icon:"🏠" },
  { label:"To Do",          path:"/essentials/todo",           icon:"✅" },
  { label:"Document",       path:"/essentials/document",       icon:"📁" },
  { label:"Memos",          path:"/essentials/memos",          icon:"📝" },
  { label:"Reminders",      path:"/essentials/reminders",      icon:"🗓️" },
  { label:"Messages",       path:"/essentials/messages",       icon:"💬" },
  { label:"Knowledge Base", path:"/essentials/knowledge-base", icon:"📚" },
  { label:"Settings",       path:"/essentials/settings",       icon:"⚙️" },
];

function EssentialsNav() {
  const loc=useLocation();
  return (
    <div style={{display:"flex",gap:0,borderBottom:"2px solid #e4ebe7",marginBottom:24,flexWrap:"wrap",background:"#fff"}}>
      {ESS_TABS.map(t=>{ const active=loc.pathname===t.path||(t.path!=="/essentials"&&loc.pathname.startsWith(t.path)); return (<Link key={t.label} to={t.path} style={{padding:"12px 18px",fontSize:13.5,fontWeight:active?700:500,color:active?"#1a6b3c":"#718096",textDecoration:"none",borderBottom:active?"3px solid #1a6b3c":"3px solid transparent",background:active?"#e8f5ee":"none",borderRadius:active?"6px 6px 0 0":0,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,transition:".15s"}}>{t.icon} {t.label}</Link>); })}
    </div>
  );
}

function EssentialsDashboard() {
  const cards=[
    { icon:"✅", label:"To Do",          path:"/essentials/todo",           count:"7 tasks",    color:"#d1fae5", accent:"#1a6b3c" },
    { icon:"📁", label:"Documents",      path:"/essentials/document",       count:"6 files",    color:"#dbeafe", accent:"#1d4ed8" },
    { icon:"📝", label:"Memos",          path:"/essentials/memos",          count:"5 memos",    color:"#fef9c3", accent:"#713f12" },
    { icon:"🗓️", label:"Reminders",     path:"/essentials/reminders",      count:"6 events",   color:"#ede9fe", accent:"#6d28d9" },
    { icon:"💬", label:"Messages",       path:"/essentials/messages",       count:"5 messages", color:"#e0f2fe", accent:"#0369a1" },
    { icon:"📚", label:"Knowledge Base", path:"/essentials/knowledge-base", count:"4 articles", color:"#fce7f3", accent:"#9d174d" },
  ];
  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:700,color:"#111827"}}>✅ Essentials</h2><p style={{margin:0,color:"#9ca3af",fontSize:14}}>Your productivity hub — tasks, docs, memos, reminders & more</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
        {cards.map(c=>(<Link key={c.label} to={c.path} style={{textDecoration:"none"}}><div style={{background:"#fff",borderRadius:12,padding:20,boxShadow:"0 2px 10px rgba(0,0,0,.06)",border:"1px solid #f0f4f1",cursor:"pointer",transition:".2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.12)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.06)"}><div style={{width:48,height:48,borderRadius:12,background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12}}>{c.icon}</div><div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:4}}>{c.label}</div><div style={{fontSize:13,color:c.accent,fontWeight:600}}>{c.count}</div></div></Link>))}
      </div>
    </div>
  );
}

function EssLayout({ children }) {
  injectStyles();
  return (<div className="ess-wrap" style={{padding:"0 0 40px 0"}}><div style={{background:"#fff",borderBottom:"2px solid #e4ebe7",marginBottom:20}}><EssentialsNav /></div><div style={{padding:"0 2px"}}>{children}</div></div>);
}

/* ══════════════════════════════════════════
   ROOT EXPORTS (both preserved — fixes the App.jsx error)
══════════════════════════════════════════ */
export function HRMRoutes() {
  return (
    <Routes>
      <Route path="/"              element={<HRMDashboard />} />
      <Route path="/employees"     element={<HrmEmployees />} />
      <Route path="/leave-type"    element={<LeaveType />} />
      <Route path="/leave"         element={<Leave />} />
      <Route path="/attendance"    element={<Attendance />} />
      <Route path="/payroll"       element={<Payroll />} />
      <Route path="/payroll/my"    element={<MyPayrolls />} />
      <Route path="/holiday"       element={<Holiday />} />
      <Route path="/departments"   element={<Departments />} />
      <Route path="/designations"  element={<Designations />} />
      <Route path="/sales-targets" element={<SalesTargets />} />
      <Route path="/settings"      element={<HRMSettings />} />
    </Routes>
  );
}

export function EssentialsRoutes() {
  return <Essentials />;
}
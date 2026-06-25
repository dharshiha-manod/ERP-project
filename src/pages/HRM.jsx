import { useState, useRef } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const G = {
  green:   "#2e7d32",
  green2:  "#43a047",
  greenBg: "#e8f5e9",
  white:   "#ffffff",
  bg:      "#f0f4f1",
  border:  "#d4e6d5",
  text:    "#1b2e1c",
  muted:   "#607d63",
  rowHov:  "#f4faf4",
  red:     "#c62828",
  redBg:   "#fce4ec",
  amber:   "#e65100",
  amberBg: "#fff3e0",
  blue:    "#1565c0",
  blueBg:  "#e3f2fd",
  purple:  "#6a1b9a",
  purpleBg:"#f3e5f5",
};

/* ─── Auto ID Generator ─── */
function genId(prefix, existingRows, colIndex = 0) {
  const nums = existingRows
    .map(r => {
      const val = Array.isArray(r) ? r[colIndex] : "";
      const match = String(val).match(/\d+$/);
      return match ? parseInt(match[0]) : 0;
    })
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

/* ─── KPI Detail Modal ─── */
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
              <thead>
                <tr style={{ background:G.greenBg }}>
                  {columns.map(c => (
                    <th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ background: i%2===0 ? G.white : G.rowHov }}>
                    {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (
                      <td key={j} style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
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

/* ─── Clickable KPI Card ─── */
function KpiCard({ label, value, accent, large, color, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: accent ? G.green : G.white,
        border: `1px solid ${accent ? "transparent" : G.border}`,
        borderRadius: 12, padding: "14px 18px",
        boxShadow: accent ? "0 4px 16px rgba(46,125,50,.25)" : "0 1px 4px rgba(46,125,50,.07)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={e => { if(onClick){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=accent?"0 8px 24px rgba(46,125,50,.35)":"0 4px 12px rgba(46,125,50,.15)"; }}}
      onMouseLeave={e => { if(onClick){ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=accent?"0 4px 16px rgba(46,125,50,.25)":"0 1px 4px rgba(46,125,50,.07)"; }}}
    >
      <div style={{ fontSize:11, color: accent ? "rgba(255,255,255,.75)" : G.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize: large ? 22 : 18, fontWeight:800, color: accent ? "#fff" : color || G.green }}>{value}</div>
      {sub && <div style={{ fontSize:11, color: accent ? "rgba(255,255,255,.6)" : G.muted, marginTop:3 }}>{sub}</div>}
      {onClick && <div style={{ fontSize:10, color: accent ? "rgba(255,255,255,.5)" : G.muted, marginTop:4, fontWeight:600 }}>Click to view ›</div>}
    </div>
  );
}

function KpiRow({ cards }) {
  const [modal, setModal] = useState(null);
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:14, marginBottom:22 }}>
        {cards.map(c => (
          <KpiCard key={c.label} {...c} onClick={c.modalData ? () => setModal(c) : undefined} />
        ))}
      </div>
      {modal && modal.modalData && (
        <KpiDetailModal
          title={modal.label}
          columns={modal.modalData.columns}
          rows={modal.modalData.rows}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

/* ─── Core button ─── */
const GreenBtn = ({ children, onClick, style = {}, variant = "fill" }) => (
  <button onClick={onClick} style={{
    background: variant === "fill" ? G.green : "#fff",
    color: variant === "fill" ? "#fff" : G.green,
    border: variant === "fill" ? "none" : `1px solid ${G.green}`,
    borderRadius: 8, padding: "9px 20px", fontWeight: 700,
    fontSize: 13, cursor: "pointer", display: "inline-flex",
    alignItems: "center", gap: 7, fontFamily: "'Inter',sans-serif",
    transition: "background .15s", ...style,
  }}
    onMouseEnter={e => e.currentTarget.style.background = variant === "fill" ? "#1b5e20" : G.greenBg}
    onMouseLeave={e => e.currentTarget.style.background = variant === "fill" ? G.green : "#fff"}
  >{children}</button>
);

const DarkBtn = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{
    background: "#fff", color: G.muted, border: `1px solid ${G.border}`,
    borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13,
    cursor: "pointer", fontFamily: "'Inter',sans-serif", ...style,
  }}>{children}</button>
);

const RedBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background: G.redBg, color: G.red, border: "none",
    borderRadius: 6, padding: "5px 12px", fontWeight: 700,
    fontSize: 12, cursor: "pointer",
  }}>{children}</button>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: G.white, borderRadius: 12, padding: 20, border: `1px solid ${G.border}`, boxShadow: "0 1px 4px rgba(46,125,50,.07)", ...style }}>{children}</div>
);

const NoData = () => (
  <div style={{ textAlign: "center", padding: "32px 0", color: G.muted, fontSize: 14 }}>No data available in table</div>
);

function StatusPill({ text, map = {} }) {
  const defaults = {
    Pending:       { bg: G.amberBg, color: G.amber },
    "In Progress": { bg: G.blueBg,  color: G.blue  },
    Completed:     { bg: G.greenBg, color: G.green  },
    "Not Started": { bg: "#f5f5f5", color: G.muted  },
    Paid:          { bg: G.greenBg, color: G.green  },
    Due:           { bg: G.redBg,   color: G.red    },
    Approved:      { bg: G.greenBg, color: G.green  },
    Rejected:      { bg: G.redBg,   color: G.red    },
    Present:       { bg: G.greenBg, color: G.green  },
    Late:          { bg: G.amberBg, color: G.amber  },
    Absent:        { bg: G.redBg,   color: G.red    },
  };
  const s = map[text] || defaults[text] || { bg: "#f5f5f5", color: G.muted };
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{text}</span>;
}

function Modal({ title, onClose, children, width = 560 }) {
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
  <div style={{ marginBottom: 16 }}>
    <label style={{ display:"block", fontWeight:600, marginBottom:6, fontSize:13, color:G.text }}>
      {label}{required && <span style={{ color:G.red }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = { width:"100%", padding:"9px 12px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:14, boxSizing:"border-box", fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", outline:"none" };
const FInput    = (props) => <input {...props} style={{ ...inputStyle, ...props.style }} />;
const FSelect   = ({ children, ...props }) => <select {...props} style={{ ...inputStyle, ...props.style }}>{children}</select>;
const FTextarea = (props) => <textarea {...props} style={{ ...inputStyle, minHeight:90, resize:"vertical", ...props.style }} />;

/* ─── Auto-ID display field ─── */
const AutoIdField = ({ label, value }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:"block", fontWeight:600, marginBottom:6, fontSize:13, color:G.text }}>{label}</label>
    <div style={{ padding:"9px 12px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:14, background:"#f0f4f1", color:G.muted, fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:11, background:G.greenBg, color:G.green, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>AUTO</span>
      {value}
    </div>
  </div>
);

/* ─── HRMTable ─── */
function HRMTable({ columns, rows, setRows, extraActions }) {
  const [editIdx,  setEditIdx]  = useState(null);
  const [editVals, setEditVals] = useState([]);

  const startEdit  = (i) => { setEditIdx(i); setEditVals([...rows[i]]); };
  const saveEdit   = () => { setRows(r => r.map((row, i) => i === editIdx ? editVals : row)); setEditIdx(null); };
  const cancelEdit = () => setEditIdx(null);
  const delRow     = (i) => setRows(r => r.filter((_, j) => j !== i));

  return (
    <div style={{ overflowX:"auto" }}>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {[["CSV", G.green], ["Excel", G.blue], ["Print", G.muted]].map(([t, col]) => (
          <button key={t} style={{ padding:"6px 14px", border:`1px solid ${G.border}`, borderRadius:7, background:G.white, fontSize:12, fontWeight:600, cursor:"pointer", color:col }}>{t}</button>
        ))}
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
        <thead>
          <tr style={{ background:`linear-gradient(90deg,${G.green}18,${G.green2}0e)` }}>
            {columns.map(c => <th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{c}</th>)}
            <th style={{ padding:"10px 14px", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase", letterSpacing:".05em" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length + 1} style={{ textAlign:"center", padding:32, color:G.muted, fontSize:14 }}>No data available in table</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ background: i%2===0 ? G.white : G.rowHov, transition:"background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = G.greenBg}
                onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? G.white : G.rowHov}
              >
                {row.map((cell, j) => (
                  <td key={j} style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.text }}>
                    {editIdx === i
                      ? <input value={editVals[j] ?? ""} onChange={e => setEditVals(v => v.map((x, k) => k===j ? e.target.value : x))}
                          style={{ width:"100%", padding:"5px 8px", border:`1px solid ${G.green}`, borderRadius:5, fontSize:13, minWidth:60, outline:"none" }} />
                      : cell}
                  </td>
                ))}
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {editIdx === i ? (
                      <>
                        <GreenBtn onClick={saveEdit} style={{ padding:"5px 14px", fontSize:12, borderRadius:6 }}>💾 Save</GreenBtn>
                        <DarkBtn onClick={cancelEdit} style={{ padding:"5px 12px", fontSize:12 }}>Cancel</DarkBtn>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(i)} style={{ padding:"5px 12px", background:G.blueBg, color:G.blue, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12 }}>✎ Edit</button>
                        <RedBtn onClick={() => delRow(i)}>🗑 Delete</RedBtn>
                      </>
                    )}
                    {extraActions && extraActions(i)}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div style={{ marginTop:10, fontSize:13, color:G.muted }}>Showing {rows.length} of {rows.length} entries</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HRM NAV
══════════════════════════════════════════ */
const HRM_TABS = [
  { label:"HRM",           path:"/hrm" },
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
        const active = loc.pathname === t.path || (t.path !== "/hrm" && loc.pathname.startsWith(t.path));
        return (
          <Link key={t.label} to={t.path} style={{
            padding:"11px 18px", fontSize:13.5, fontWeight: active ? 700 : 500,
            color: active ? G.green : G.muted, textDecoration:"none",
            borderBottom: active ? `3px solid ${G.green}` : "3px solid transparent",
            background: active ? G.greenBg : "none", whiteSpace:"nowrap",
            borderRadius: active ? "6px 6px 0 0" : 0,
          }}>{t.label}</Link>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   SHARED EMPLOYEE DATA (used across dashboard cards)
══════════════════════════════════════════ */
const ALL_EMPLOYEES = [
  { name:"Priya S.",   dept:"HR",      desig:"Executive",  status:"Present", clockIn:"09:02 AM", clockOut:"06:15 PM" },
  { name:"Rahul M.",   dept:"Sales",   desig:"Manager",    status:"Present", clockIn:"09:18 AM", clockOut:"06:00 PM" },
  { name:"Vikram T.",  dept:"Ops",     desig:"Analyst",    status:"Late",    clockIn:"10:05 AM", clockOut:"—" },
  { name:"Deepa R.",   dept:"Finance", desig:"Executive",  status:"Absent",  clockIn:"—",        clockOut:"—" },
  { name:"Ananya K.",  dept:"Ops",     desig:"Analyst",    status:"Present", clockIn:"09:00 AM", clockOut:"06:00 PM" },
  { name:"Suresh P.",  dept:"Sales",   desig:"Executive",  status:"Present", clockIn:"09:10 AM", clockOut:"06:20 PM" },
  { name:"Meera R.",   dept:"HR",      desig:"HR Exec",    status:"On Leave",clockIn:"—",        clockOut:"—" },
  { name:"Arjun M.",   dept:"Sales",   desig:"Sr Manager", status:"Present", clockIn:"08:55 AM", clockOut:"06:30 PM" },
  { name:"Sneha N.",   dept:"Finance", desig:"Analyst",    status:"On Leave",clockIn:"—",        clockOut:"—" },
  { name:"Kiran L.",   dept:"Ops",     desig:"Lead",       status:"Absent",  clockIn:"—",        clockOut:"—" },
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

/* pending leave requests */
const PENDING_LEAVES = [
  ["LEV-2026-002", "Casual Leave", "Rahul M.", "13-Jun – 13-Jun", "Personal work", "Pending"],
  ["LEV-2026-004", "Sick Leave",   "Kiran L.", "25-Jun – 26-Jun", "Fever",         "Pending"],
  ["LEV-2026-005", "Annual Leave", "Suresh P.","28-Jun – 30-Jun", "Trip",          "Pending"],
  ["LEV-2026-006", "Casual Leave", "Vikram T.","27-Jun – 27-Jun", "Personal",      "Pending"],
];

function MiniBar({ value, max, color }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, background:G.border, borderRadius:4, height:8, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, background: color || G.green2, height:"100%", borderRadius:4 }} />
      </div>
      <span style={{ fontSize:11, color:G.muted, minWidth:32, textAlign:"right" }}>{pct}%</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   HRM DASHBOARD
══════════════════════════════════════════ */
function HRMDashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-IN", { weekday:"long", day:"2-digit", month:"short", year:"numeric" });

  const presentEmps  = ALL_EMPLOYEES.filter(e => e.status === "Present");
  const onLeaveEmps  = ALL_EMPLOYEES.filter(e => e.status === "On Leave");
  const absentEmps   = ALL_EMPLOYEES.filter(e => e.status === "Absent");

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <HRMNav />

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:G.text }}>HR Dashboard</h2>
          <p style={{ margin:0, fontSize:13, color:G.muted, marginTop:2 }}>{today}</p>
        </div>
        <GreenBtn onClick={() => navigate("/hrm/payroll")} style={{ fontSize:14, padding:"10px 24px" }}>
          💰 Run Payroll
        </GreenBtn>
      </div>

      {/* ── KPI Row with clickable cards ── */}
      <KpiRow cards={[
        {
          label:"Total Employees", value: ALL_EMPLOYEES.length.toString(), accent:true, large:true,
          modalData: {
            columns:["Name","Department","Designation","Status"],
            rows: ALL_EMPLOYEES.map(e => [e.name, e.dept, e.desig, e.status])
          }
        },
        {
          label:"Present Today", value: presentEmps.length.toString(), color:G.green,
          modalData: {
            columns:["Name","Department","Clock In","Clock Out"],
            rows: presentEmps.map(e => [e.name, e.dept, e.clockIn, e.clockOut])
          }
        },
        {
          label:"On Leave Today", value: onLeaveEmps.length.toString(), color:G.amber,
          modalData: {
            columns:["Name","Department","Designation"],
            rows: onLeaveEmps.map(e => [e.name, e.dept, e.desig])
          }
        },
        {
          label:"Absent Today", value: absentEmps.length.toString(), color:G.red,
          modalData: {
            columns:["Name","Department","Designation"],
            rows: absentEmps.map(e => [e.name, e.dept, e.desig])
          }
        },
        {
          label:"Pending Leaves", value: PENDING_LEAVES.length.toString(), color:G.blue,
          modalData: {
            columns:["Ref No","Leave Type","Employee","Date","Reason","Status"],
            rows: PENDING_LEAVES
          }
        },
        { label:"This Month Payroll", value:"₹4.2L", color:G.text },
      ]} />

      {/* Row 2 — 3 cols */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18, marginBottom:18 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:G.text }}>📅 Today's Attendance</h4>
            <Link to="/hrm/attendance" style={{ fontSize:12, color:G.green, textDecoration:"none", fontWeight:600 }}>View all →</Link>
          </div>
          {ALL_EMPLOYEES.slice(0,4).map((a, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i < 3 ? `1px solid ${G.border}` : "none" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:G.text }}>{a.name}</div>
                <div style={{ fontSize:11, color:G.muted }}>{a.clockIn} → {a.clockOut}</div>
              </div>
              <StatusPill text={a.status} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:G.text }}>🌿 Leave Requests</h4>
            <Link to="/hrm/leave" style={{ fontSize:12, color:G.green, textDecoration:"none", fontWeight:600 }}>View all →</Link>
          </div>
          {LEAVE_DATA.map((l, i) => (
            <div key={i} style={{ padding:"8px 0", borderBottom: i < LEAVE_DATA.length - 1 ? `1px solid ${G.border}` : "none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:600, fontSize:13, color:G.text }}>{l.emp}</span>
                <StatusPill text={l.status} />
              </div>
              <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{l.type} · {l.from}–{l.to} ({l.days}d)</div>
            </div>
          ))}
        </Card>

        <Card>
          <h4 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:G.text }}>🎂 Birthdays this Month</h4>
          {BIRTHDAY_DATA.map((b, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom: i < BIRTHDAY_DATA.length - 1 ? `1px solid ${G.border}` : "none" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${G.green},${G.green2})`, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, flexShrink:0 }}>
                {b.name[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13, color:G.text }}>{b.name}</div>
                <div style={{ fontSize:11, color:G.muted }}>{b.dept}</div>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:G.green, background:G.greenBg, padding:"3px 10px", borderRadius:20 }}>{b.date}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Row 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:G.text }}>🎯 Sales Targets – June 2026</h4>
            <Link to="/hrm/sales-targets" style={{ fontSize:12, color:G.green, textDecoration:"none", fontWeight:600 }}>Manage →</Link>
          </div>
          {SALES_TARGET_DATA.map((s, i) => (
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, fontWeight:600, color:G.text }}>{s.rep}</span>
                <span style={{ fontSize:12, fontWeight:700, color: s.pct >= 100 ? G.green : G.amber }}>{s.achieved} / {s.target}</span>
              </div>
              <MiniBar value={s.pct} max={120} color={s.pct >= 100 ? G.green2 : "#ef5350"} />
              <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>Commission: {s.commission}</div>
            </div>
          ))}
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
          ].map(q => (
            <Link key={q.label} to={q.path} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, marginBottom:6, background:G.bg, textDecoration:"none", fontSize:13, fontWeight:600, color:G.text, transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = G.greenBg}
              onMouseLeave={e => e.currentTarget.style.background = G.bg}
            >
              <span>{q.icon}</span> {q.label}
              <span style={{ marginLeft:"auto", color:G.muted, fontSize:14 }}>›</span>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   LEAVE TYPE
══════════════════════════════════════════ */
function LeaveType() {
  const [rows, setRows] = useState([
    ["LT-001", "Sick Leave",      "12", "Current financial year"],
    ["LT-002", "Casual Leave",    "8",  "Current month"],
    ["LT-003", "Annual Leave",    "20", "Current financial year"],
    ["LT-004", "Maternity Leave", "90", "None"],
    ["LT-005", "Paternity Leave", "15", "None"],
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type:"", maxCount:"", interval:"None" });

  const newId = () => genId("LT-", rows, 0);

  const save = () => {
    if (!form.type) return;
    setRows(r => [...r, [newId(), form.type, form.maxCount || "—", form.interval]]);
    setModal(false); setForm({ type:"", maxCount:"", interval:"None" });
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Leave Types</h2>
        <GreenBtn onClick={() => setModal(true)}>+ Add Leave Type</GreenBtn>
      </div>
      <KpiRow cards={[
        {
          label:"Total Types", value: rows.length.toString(), accent:true,
          modalData:{ columns:["ID","Leave Type","Max Count","Interval"], rows }
        },
        { label:"Max Annual Leave", value:"20 days", color:G.green },
        { label:"Max Sick Leave",   value:"12 days", color:G.blue  },
      ]} />
      <Card>
        <HRMTable columns={["ID","Leave Type","Max Count","Interval"]} rows={rows} setRows={setRows} />
      </Card>
      {modal && (
        <Modal title="Add Leave Type" onClose={() => setModal(false)}>
          <AutoIdField label="Leave Type ID" value={newId()} />
          <Field label="Leave Type" required><FInput value={form.type} onChange={e => setForm(f => ({ ...f, type:e.target.value }))} placeholder="e.g. Sick Leave" /></Field>
          <Field label="Max Leave Count"><FInput type="number" value={form.maxCount} onChange={e => setForm(f => ({ ...f, maxCount:e.target.value }))} placeholder="e.g. 12" /></Field>
          <Field label="Leave Count Interval">
            <div style={{ display:"flex", gap:20, marginTop:4 }}>
              {["Current month","Current financial year","None"].map(v => (
                <label key={v} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:14 }}>
                  <input type="radio" name="interval" checked={form.interval === v} onChange={() => setForm(f => ({ ...f, interval:v }))} />{v}
                </label>
              ))}
            </div>
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:10 }}>
            <GreenBtn onClick={save}>Save</GreenBtn>
            <DarkBtn onClick={() => setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   LEAVE
══════════════════════════════════════════ */
function Leave() {
  const [rows, setRows] = useState([
    ["LEV-2026-001","Sick Leave",  "Priya S.", "08-Jun – 09-Jun","Fever",        "Approved"],
    ["LEV-2026-002","Casual Leave","Rahul M.", "13-Jun – 13-Jun","Personal work","Pending" ],
    ["LEV-2026-003","Annual Leave","Ananya K.","20-Jun – 24-Jun","Vacation",     "Approved"],
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });

  const newId = () => {
    const nums = rows.map(r => parseInt(r[0].replace("LEV-2026-","")) || 0);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `LEV-2026-${String(next).padStart(3,"0")}`;
  };

  const save = () => {
    if (!form.leaveType || !form.startDate || !form.endDate) return;
    setRows(r => [...r, [newId(), form.leaveType, form.employee || "Self", `${form.startDate} – ${form.endDate}`, form.reason, "Pending"]]);
    setModal(false); setForm({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });
  };

  const approved = rows.filter(r => r[5]==="Approved");
  const pending  = rows.filter(r => r[5]==="Pending");

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Leave Management</h2>
        <GreenBtn onClick={() => setModal(true)}>+ Apply Leave</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Leaves", value: rows.length.toString(), accent:true,
          modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows } },
        { label:"Approved", value: approved.length.toString(), color:G.green,
          modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows:approved } },
        { label:"Pending",  value: pending.length.toString(),  color:G.amber,
          modalData:{ columns:["Ref No","Leave Type","Employee","Date","Reason","Status"], rows:pending } },
      ]} />
      <Card>
        <HRMTable columns={["Ref No","Leave Type","Employee","Date","Reason","Status"]} rows={rows} setRows={setRows} />
      </Card>
      {modal && (
        <Modal title="Apply Leave" onClose={() => setModal(false)}>
          <AutoIdField label="Reference No." value={newId()} />
          <Field label="Employee"><FInput value={form.employee} onChange={e => setForm(f => ({ ...f, employee:e.target.value }))} placeholder="Employee name" /></Field>
          <Field label="Leave Type" required>
            <FSelect value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType:e.target.value }))}>
              <option value="">Please Select</option>
              <option>Sick Leave</option><option>Casual Leave</option><option>Annual Leave</option><option>Maternity Leave</option>
            </FSelect>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start Date" required><FInput type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate:e.target.value }))} /></Field>
            <Field label="End Date"   required><FInput type="date" value={form.endDate}   onChange={e => setForm(f => ({ ...f, endDate:e.target.value }))} /></Field>
          </div>
          <Field label="Reason"><FTextarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason:e.target.value }))} placeholder="Reason for leave" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={save}>Submit</GreenBtn>
            <DarkBtn onClick={() => setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   ATTENDANCE
══════════════════════════════════════════ */
function Attendance() {
  const [tab, setTab] = useState("Shifts");
  const [shifts, setShifts] = useState([
    ["SHF-001","Day Shift",  "Fixed shift",    "09:00","18:00","Sun"],
    ["SHF-002","Night Shift","Fixed shift",    "21:00","06:00","Sun"],
    ["SHF-003","Flex Shift", "Flexible shift", "08:00","20:00","—"],
  ]);
  const [allAtt, setAllAtt] = useState(
    ALL_EMPLOYEES.filter(e => e.status !== "On Leave").map(e => [
      e.name, new Date().toLocaleDateString(), e.clockIn, e.clockOut, e.status
    ])
  );
  const [clockInModal,  setClockInModal]  = useState(false);
  const [addShiftModal, setAddShiftModal] = useState(false);
  const [clockNote, setClockNote] = useState("");
  const [shiftForm, setShiftForm] = useState({ name:"", type:"Fixed shift", start:"", end:"", holiday:"" });

  const newShiftId = () => genId("SHF-", shifts, 0);

  const saveShift = () => {
    if (!shiftForm.name || !shiftForm.start || !shiftForm.end) return;
    setShifts(s => [...s, [newShiftId(), shiftForm.name, shiftForm.type, shiftForm.start, shiftForm.end, shiftForm.holiday || "—"]]);
    setAddShiftModal(false); setShiftForm({ name:"", type:"Fixed shift", start:"", end:"", holiday:"" });
  };

  const present = allAtt.filter(r => r[4]==="Present");
  const late    = allAtt.filter(r => r[4]==="Late");

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Attendance</h2>
        <GreenBtn onClick={() => setClockInModal(true)}>⬇ Clock In</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Present Today", value: present.length.toString(), accent:true,
          modalData:{ columns:["Employee","Date","Clock In","Clock Out","Status"], rows:present } },
        { label:"Late", value: late.length.toString(), color:G.amber,
          modalData:{ columns:["Employee","Date","Clock In","Clock Out","Status"], rows:late } },
        { label:"Absent",       value: allAtt.filter(r=>r[4]==="Absent").length.toString(), color:G.red,
          modalData:{ columns:["Employee","Date","Clock In","Clock Out","Status"], rows:allAtt.filter(r=>r[4]==="Absent") } },
        { label:"Total Shifts", value: shifts.length.toString(), color:G.blue,
          modalData:{ columns:["ID","Name","Type","Start","End","Holiday"], rows:shifts } },
      ]} />
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${G.border}`, marginBottom:20 }}>
        {["Shifts","All Attendance","By Shift","By Date"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"10px 18px", border:"none", background:"none", cursor:"pointer", fontWeight: tab===t ? 700 : 500, color: tab===t ? G.green : G.muted, borderBottom: tab===t ? `3px solid ${G.green}` : "3px solid transparent", fontSize:13 }}>{t}</button>
        ))}
      </div>
      {tab === "Shifts" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
            <GreenBtn onClick={() => setAddShiftModal(true)}>+ Add Shift</GreenBtn>
          </div>
          <HRMTable columns={["ID","Name","Type","Start","End","Holiday"]} rows={shifts} setRows={setShifts}
            extraActions={i => <button style={{ padding:"5px 10px", background:G.greenBg, color:G.green, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12 }}>Assign Users</button>}
          />
        </Card>
      )}
      {tab === "All Attendance" && (
        <Card>
          <HRMTable columns={["Employee","Date","Clock In","Clock Out","Status"]} rows={allAtt} setRows={setAllAtt} />
        </Card>
      )}
      {["By Shift","By Date"].includes(tab) && <Card><NoData /></Card>}

      {clockInModal && (
        <Modal title="Clock In" onClose={() => setClockInModal(false)} width={420}>
          <p style={{ color:G.muted, fontSize:13, margin:"0 0 16px" }}>IP Address: 192.168.1.10 · {new Date().toLocaleTimeString()}</p>
          <Field label="Clock In Note"><FTextarea value={clockNote} onChange={e => setClockNote(e.target.value)} placeholder="Optional note..." /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={() => {
              setAllAtt(a => [...a, ["Admin", new Date().toLocaleDateString(), new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), "—", "Present"]]);
              setClockInModal(false); setClockNote("");
            }}>Submit</GreenBtn>
            <DarkBtn onClick={() => setClockInModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {addShiftModal && (
        <Modal title="Add Shift" onClose={() => setAddShiftModal(false)}>
          <AutoIdField label="Shift ID" value={newShiftId()} />
          <Field label="Name" required><FInput value={shiftForm.name} onChange={e => setShiftForm(f => ({ ...f, name:e.target.value }))} placeholder="Shift name" /></Field>
          <Field label="Shift Type">
            <FSelect value={shiftForm.type} onChange={e => setShiftForm(f => ({ ...f, type:e.target.value }))}>
              <option>Fixed shift</option><option>Flexible shift</option><option>Rotating shift</option>
            </FSelect>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start" required><FInput type="time" value={shiftForm.start} onChange={e => setShiftForm(f => ({ ...f, start:e.target.value }))} /></Field>
            <Field label="End"   required><FInput type="time" value={shiftForm.end}   onChange={e => setShiftForm(f => ({ ...f, end:e.target.value }))} /></Field>
          </div>
          <Field label="Holiday"><FInput value={shiftForm.holiday} onChange={e => setShiftForm(f => ({ ...f, holiday:e.target.value }))} placeholder="e.g. Sun" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={saveShift}>Save</GreenBtn>
            <DarkBtn onClick={() => setAddShiftModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   PAYROLL
══════════════════════════════════════════ */
function Payroll() {
  const [tab, setTab] = useState("All Payrolls");
  const [modal, setModal] = useState(false);
  const [rows, setRows] = useState([
    ["PAY-2026-001","Priya S.", "HR",   "Executive","May 2026","₹42,000","Paid"   ],
    ["PAY-2026-002","Rahul M.", "Sales","Manager",  "May 2026","₹65,000","Paid"   ],
    ["PAY-2026-003","Ananya K.","Ops",  "Analyst",  "May 2026","₹38,500","Pending"],
  ]);
  const [form, setForm] = useState({ employee:"", month:"" });
  const [payComp, setPayComp] = useState([
    ["PC-001","Basic Salary","Earning",  "₹35,000","01-Jun-26"],
    ["PC-002","HRA",         "Earning",  "₹14,000","01-Jun-26"],
    ["PC-003","PF Deduction","Deduction","₹4,200", "01-Jun-26"],
    ["PC-004","Tax (TDS)",   "Deduction","₹3,800", "01-Jun-26"],
  ]);
  const [compModal, setCompModal] = useState(false);
  const [compForm, setCompForm] = useState({ desc:"", type:"Earning", amount:"", date:"" });

  const newPayId = () => {
    const nums = rows.map(r => parseInt(r[0].replace("PAY-2026-","")) || 0);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `PAY-2026-${String(next).padStart(3,"0")}`;
  };
  const newCompId = () => genId("PC-", payComp, 0);

  const paid    = rows.filter(r => r[6]==="Paid");
  const pending = rows.filter(r => r[6]==="Pending");

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Payroll</h2>
        <GreenBtn onClick={() => setModal(true)}>+ Add Payroll</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Payrolls", value: rows.length.toString(), accent:true,
          modalData:{ columns:["Ref No","Employee","Dept","Designation","Month","Amount","Status"], rows } },
        { label:"Total Payout",  value:"₹1,45,500", color:G.green },
        { label:"Paid",    value: paid.length.toString(),    color:G.green,
          modalData:{ columns:["Ref No","Employee","Dept","Designation","Month","Amount","Status"], rows:paid } },
        { label:"Pending", value: pending.length.toString(), color:G.amber,
          modalData:{ columns:["Ref No","Employee","Dept","Designation","Month","Amount","Status"], rows:pending } },
      ]} />
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${G.border}`, marginBottom:20 }}>
        {["All Payrolls","Payroll Groups","Pay Components"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"10px 18px", border:"none", background:"none", cursor:"pointer", fontWeight: tab===t ? 700 : 500, color: tab===t ? G.green : G.muted, borderBottom: tab===t ? `3px solid ${G.green}` : "3px solid transparent", fontSize:13 }}>{t}</button>
        ))}
      </div>
      {tab === "All Payrolls" && <Card><HRMTable columns={["Ref No","Employee","Dept","Designation","Month","Amount","Status"]} rows={rows} setRows={setRows} /></Card>}
      {tab === "Payroll Groups" && <Card><NoData /></Card>}
      {tab === "Pay Components" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
            <GreenBtn onClick={() => setCompModal(true)}>+ Add Component</GreenBtn>
          </div>
          <HRMTable columns={["ID","Description","Type","Amount","Applicable From"]} rows={payComp} setRows={setPayComp} />
        </Card>
      )}
      {modal && (
        <Modal title="Add Payroll" onClose={() => setModal(false)}>
          <AutoIdField label="Payroll Ref No." value={newPayId()} />
          <Field label="Employee" required><FInput value={form.employee} onChange={e => setForm(f => ({ ...f, employee:e.target.value }))} placeholder="Employee name" /></Field>
          <Field label="Month / Year" required><FInput type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month:e.target.value }))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={() => {
              if (form.employee && form.month) {
                setRows(r => [...r, [newPayId(), form.employee, "—","—", form.month, "₹0","Pending"]]);
                setModal(false); setForm({ employee:"", month:"" });
              }
            }}>Save</GreenBtn>
            <DarkBtn onClick={() => setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
      {compModal && (
        <Modal title="Add Pay Component" onClose={() => setCompModal(false)}>
          <AutoIdField label="Component ID" value={newCompId()} />
          <Field label="Description"><FInput value={compForm.desc} onChange={e => setCompForm(f => ({ ...f, desc:e.target.value }))} /></Field>
          <Field label="Type"><FSelect value={compForm.type} onChange={e => setCompForm(f => ({ ...f, type:e.target.value }))}><option>Earning</option><option>Deduction</option></FSelect></Field>
          <Field label="Amount"><FInput type="text" value={compForm.amount} onChange={e => setCompForm(f => ({ ...f, amount:e.target.value }))} placeholder="₹0" /></Field>
          <Field label="Applicable Date"><FInput type="date" value={compForm.date} onChange={e => setCompForm(f => ({ ...f, date:e.target.value }))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={() => {
              if (compForm.desc) {
                setPayComp(p => [...p, [newCompId(), compForm.desc, compForm.type, compForm.amount, compForm.date]]);
                setCompModal(false); setCompForm({ desc:"", type:"Earning", amount:"", date:"" });
              }
            }}>Save</GreenBtn>
            <DarkBtn onClick={() => setCompModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MyPayrolls() {
  return (
    <div><HRMNav />
      <h2 style={{ marginBottom:16, fontSize:20, fontWeight:700, color:G.text }}>My Payrolls</h2>
      <Card><NoData /></Card>
    </div>
  );
}

/* ══════════════════════════════════════════
   HOLIDAY
══════════════════════════════════════════ */
function Holiday() {
  const [rows, setRows] = useState([
    ["HOL-001","Eid Al-Adha",      "27-May-26","28-May-26","2 days","All Locations"],
    ["HOL-002","Independence Day", "15-Aug-26","15-Aug-26","1 day", "All Locations"],
    ["HOL-003","Diwali",           "20-Oct-26","21-Oct-26","2 days","All Locations"],
    ["HOL-004","Christmas",        "25-Dec-26","25-Dec-26","1 day", "All Locations"],
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:"", startDate:"", endDate:"", location:"All Locations", note:"" });

  const newId = () => genId("HOL-", rows, 0);

  const save = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    const s = new Date(form.startDate), e = new Date(form.endDate);
    const days = Math.max(1, Math.round((e - s) / 86400000) + 1);
    setRows(r => [...r, [newId(), form.name, form.startDate, form.endDate, `${days} day${days > 1 ? "s" : ""}`, form.location]]);
    setModal(false); setForm({ name:"", startDate:"", endDate:"", location:"All Locations", note:"" });
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Holidays</h2>
        <GreenBtn onClick={() => setModal(true)}>+ Add Holiday</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Holidays", value: rows.length.toString(), accent:true,
          modalData:{ columns:["ID","Name","Start","End","Duration","Location"], rows } },
        { label:"This Quarter", value:"2", color:G.green },
        { label:"Total Days Off", value: rows.reduce((s,r)=>s+parseInt(r[4]),0).toString(), color:G.blue },
      ]} />
      <Card>
        <HRMTable columns={["ID","Name","Start","End","Duration","Location"]} rows={rows} setRows={setRows} />
      </Card>
      {modal && (
        <Modal title="Add Holiday" onClose={() => setModal(false)}>
          <AutoIdField label="Holiday ID" value={newId()} />
          <Field label="Name" required><FInput value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Holiday name" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start Date" required><FInput type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate:e.target.value }))} /></Field>
            <Field label="End Date"   required><FInput type="date" value={form.endDate}   onChange={e => setForm(f => ({ ...f, endDate:e.target.value }))} /></Field>
          </div>
          <Field label="Location">
            <FSelect value={form.location} onChange={e => setForm(f => ({ ...f, location:e.target.value }))}>
              <option>All Locations</option><option>Manodtechnologies</option><option>Branch 1</option>
            </FSelect>
          </Field>
          <Field label="Note"><FTextarea value={form.note} onChange={e => setForm(f => ({ ...f, note:e.target.value }))} rows={2} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={save}>Save</GreenBtn>
            <DarkBtn onClick={() => setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DEPARTMENTS
══════════════════════════════════════════ */
function Departments() {
  const [rows, setRows] = useState([
    ["DEPT-001","Sales",            "DEPT-SALES","Handles all outbound and inbound sales"    ],
    ["DEPT-002","Digital Marketing","DEPT-MKTG", "Online marketing and brand strategy"       ],
    ["DEPT-003","Operations",       "DEPT-OPS",  "Warehouse and logistics management"        ],
    ["DEPT-004","Human Resources",  "DEPT-HR",   "Recruitment, payroll and employee welfare" ],
    ["DEPT-005","Finance",          "DEPT-FIN",  "Accounts, billing and financial planning"  ],
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ dept:"", desc:"" });

  const newId     = () => genId("DEPT-", rows, 0);
  const newDeptId = (name) => name ? `DEPT-${name.slice(0,4).toUpperCase().replace(/\s/g,"")}` : genId("DEPT-", rows, 2);

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Departments</h2>
        <GreenBtn onClick={() => setModal(true)}>+ Add Department</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Departments", value: rows.length.toString(), accent:true,
          modalData:{ columns:["ID","Department","Dept Code","Description"], rows } },
        { label:"Active", value: rows.length.toString(), color:G.green },
      ]} />
      <Card>
        <HRMTable columns={["ID","Department","Dept Code","Description"]} rows={rows} setRows={setRows} />
      </Card>
      {modal && (
        <Modal title="Add Department" onClose={() => setModal(false)}>
          <AutoIdField label="System ID"     value={newId()} />
          <AutoIdField label="Department Code" value={form.dept ? newDeptId(form.dept) : "Auto-generated from name"} />
          <Field label="Department Name" required>
            <FInput value={form.dept} onChange={e => setForm(f => ({ ...f, dept:e.target.value }))} placeholder="e.g. Sales" />
          </Field>
          <Field label="Description">
            <FTextarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc:e.target.value }))} placeholder="Brief description" />
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={() => {
              if (form.dept) {
                setRows(r => [...r, [newId(), form.dept, newDeptId(form.dept), form.desc || "—"]]);
                setModal(false); setForm({ dept:"", desc:"" });
              }
            }}>Save</GreenBtn>
            <DarkBtn onClick={() => setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DESIGNATIONS
══════════════════════════════════════════ */
function Designations() {
  const [rows, setRows] = useState([
    ["DES-001","Sales Executive",   "Handles day-to-day customer sales and CRM"   ],
    ["DES-002","Sales Manager",     "Manages sales team and targets"               ],
    ["DES-003","HR Executive",      "Recruitment and employee onboarding"          ],
    ["DES-004","Warehouse Analyst", "Stock management and audits"                  ],
    ["DES-005","Finance Executive", "Invoicing and account reconciliation"         ],
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desig:"", desc:"" });

  const newId = () => genId("DES-", rows, 0);

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Designations</h2>
        <GreenBtn onClick={() => setModal(true)}>+ Add Designation</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Designations", value: rows.length.toString(), accent:true,
          modalData:{ columns:["ID","Designation","Description"], rows } },
      ]} />
      <Card>
        <HRMTable columns={["ID","Designation","Description"]} rows={rows} setRows={setRows} />
      </Card>
      {modal && (
        <Modal title="Add Designation" onClose={() => setModal(false)}>
          <AutoIdField label="Designation ID" value={newId()} />
          <Field label="Designation" required><FInput value={form.desig} onChange={e => setForm(f => ({ ...f, desig:e.target.value }))} placeholder="e.g. Sales Executive" /></Field>
          <Field label="Description"><FTextarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc:e.target.value }))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={() => {
              if (form.desig) {
                setRows(r => [...r, [newId(), form.desig, form.desc || "—"]]);
                setModal(false); setForm({ desig:"", desc:"" });
              }
            }}>Save</GreenBtn>
            <DarkBtn onClick={() => setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   SALES TARGETS
══════════════════════════════════════════ */
function SalesTargets() {
  const [rows, setRows] = useState([
    ["ST-001","Arjun Mehta", "₹3,50,000","5%","Jun 2026"],
    ["ST-002","Priya Singh", "₹3,00,000","4%","Jun 2026"],
    ["ST-003","Vikram Rao",  "₹2,80,000","5%","Jun 2026"],
    ["ST-004","Sneha Nair",  "₹2,50,000","4%","Jun 2026"],
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ user:"", target:"", commission:"", month:"" });

  const newId = () => genId("ST-", rows, 0);

  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:G.text }}>Sales Targets</h2>
        <GreenBtn onClick={() => setModal(true)}>+ Add Target</GreenBtn>
      </div>
      <KpiRow cards={[
        { label:"Total Reps", value: rows.length.toString(), accent:true,
          modalData:{ columns:["ID","User","Target Amount","Commission %","Month"], rows } },
        { label:"Total Target",             value:"₹12,80,000", color:G.green },
        { label:"Total Commission Budget",  value:"₹57,600",    color:G.blue  },
      ]} />
      <Card>
        <HRMTable columns={["ID","User","Target Amount","Commission %","Month"]} rows={rows} setRows={setRows} />
      </Card>
      {modal && (
        <Modal title="Add Sales Target" onClose={() => setModal(false)}>
          <AutoIdField label="Target ID" value={newId()} />
          <Field label="User" required><FInput value={form.user} onChange={e => setForm(f => ({ ...f, user:e.target.value }))} placeholder="Employee name" /></Field>
          <Field label="Target Amount" required><FInput value={form.target} onChange={e => setForm(f => ({ ...f, target:e.target.value }))} placeholder="₹0" /></Field>
          <Field label="Commission %"><FInput type="number" value={form.commission} onChange={e => setForm(f => ({ ...f, commission:e.target.value }))} placeholder="5" /></Field>
          <Field label="Month / Year"><FInput type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month:e.target.value }))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={() => {
              if (form.user && form.target) {
                setRows(r => [...r, [newId(), form.user, form.target, `${form.commission}%`, form.month]]);
                setModal(false); setForm({ user:"", target:"", commission:"", month:"" });
              }
            }}>Save</GreenBtn>
            <DarkBtn onClick={() => setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   HRM SETTINGS
══════════════════════════════════════════ */
function HRMSettings() {
  const [form, setForm] = useState({ workDays:"5", workHours:"8", overtimeRate:"1.5", currency:"INR", payslipNote:"Thank you for your service.", leaveApproval:"manager", attendanceMode:"manual" });
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:18, fontSize:20, fontWeight:700, color:G.text }}>HRM Settings</h2>
      <Card style={{ maxWidth:700 }}>
        <h3 style={{ marginTop:0, marginBottom:20, fontSize:15, fontWeight:700, borderBottom:`1px solid ${G.border}`, paddingBottom:12, color:G.text }}>General Configuration</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Working Days / Week"><FSelect value={form.workDays} onChange={e => setForm(f => ({ ...f, workDays:e.target.value }))}>{["5","6","7"].map(v=><option key={v}>{v}</option>)}</FSelect></Field>
          <Field label="Working Hours / Day"><FInput type="number" value={form.workHours} onChange={e => setForm(f => ({ ...f, workHours:e.target.value }))} /></Field>
          <Field label="Overtime Rate Multiplier"><FInput type="number" step="0.1" value={form.overtimeRate} onChange={e => setForm(f => ({ ...f, overtimeRate:e.target.value }))} /></Field>
          <Field label="Currency"><FSelect value={form.currency} onChange={e => setForm(f => ({ ...f, currency:e.target.value }))}>{["INR","USD","EUR","GBP"].map(v=><option key={v}>{v}</option>)}</FSelect></Field>
          <Field label="Leave Approval"><FSelect value={form.leaveApproval} onChange={e => setForm(f => ({ ...f, leaveApproval:e.target.value }))}><option value="manager">Manager</option><option value="hr">HR Dept</option><option value="auto">Auto Approve</option></FSelect></Field>
          <Field label="Attendance Mode"><FSelect value={form.attendanceMode} onChange={e => setForm(f => ({ ...f, attendanceMode:e.target.value }))}><option value="manual">Manual Clock In/Out</option><option value="biometric">Biometric</option><option value="gps">GPS Based</option></FSelect></Field>
        </div>
        <Field label="Payslip Footer Note"><FTextarea value={form.payslipNote} onChange={e => setForm(f => ({ ...f, payslipNote:e.target.value }))} /></Field>
        <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:10 }}>
          <GreenBtn onClick={save} style={{ fontSize:14, padding:"10px 28px" }}>💾 Save Settings</GreenBtn>
          {saved && <span style={{ color:G.green, fontSize:13, fontWeight:700, background:G.greenBg, padding:"6px 14px", borderRadius:8 }}>✓ Settings saved!</span>}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════
   ESSENTIALS — tokens & helpers
══════════════════════════════════════════ */
const FONT      = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";
const FONT_HEAD = FONT;
const FONT_BODY = FONT;
const GREEN      = "#1a6b3c";
const GREEN2     = "#22863a";
const GREEN_LITE = "#eaf3ea";
const SHADOW     = "0 1px 3px rgba(0,0,0,.08)";

const SAMPLE_TODOS = [
  { addedOn:"08/06/2026", taskId:"TASK-001", task:"Reconcile Q2 purchase invoices",     status:"In Progress",  startDate:"2026-06-01", endDate:"2026-06-10", hours:"6", assignedBy:"Admin",   assignedTo:"Priya S.",  priority:"High"   },
  { addedOn:"07/06/2026", taskId:"TASK-002", task:"Update product pricing list",         status:"Not Started",  startDate:"2026-06-08", endDate:"2026-06-15", hours:"3", assignedBy:"Admin",   assignedTo:"Rahul M.",  priority:"Medium" },
  { addedOn:"06/06/2026", taskId:"TASK-003", task:"Audit warehouse stock levels",        status:"Completed",    startDate:"2026-06-03", endDate:"2026-06-06", hours:"8", assignedBy:"Manager", assignedTo:"Ananya K.", priority:"High"   },
  { addedOn:"05/06/2026", taskId:"TASK-004", task:"Send supplier payment reminders",    status:"Completed",    startDate:"2026-06-05", endDate:"2026-06-05", hours:"1", assignedBy:"Admin",   assignedTo:"Vikram T.", priority:"Low"    },
  { addedOn:"04/06/2026", taskId:"TASK-005", task:"Prepare monthly expense report",     status:"In Progress",  startDate:"2026-06-04", endDate:"2026-06-12", hours:"5", assignedBy:"Admin",   assignedTo:"Priya S.",  priority:"Medium" },
  { addedOn:"03/06/2026", taskId:"TASK-006", task:"Review and approve new sales orders",status:"Not Started",  startDate:"2026-06-09", endDate:"2026-06-09", hours:"2", assignedBy:"Manager", assignedTo:"Rahul M.",  priority:"High"   },
  { addedOn:"02/06/2026", taskId:"TASK-007", task:"Update CRM customer records",        status:"In Progress",  startDate:"2026-06-02", endDate:"2026-06-11", hours:"4", assignedBy:"Admin",   assignedTo:"Deepa R.",  priority:"Low"    },
];
const SAMPLE_DOCS = [
  { name:"Q2_Purchase_Invoice_Bundle.pdf",   description:"All purchase invoices for April–June 2026",     uploadedDate:"07/06/2026" },
  { name:"Warehouse_Audit_Report_June.xlsx", description:"Stock audit results – Main warehouse",          uploadedDate:"06/06/2026" },
  { name:"Supplier_Contracts_2026.zip",      description:"Signed contracts with top 10 suppliers",        uploadedDate:"04/06/2026" },
  { name:"Employee_Onboarding_Docs.pdf",     description:"HR onboarding package for new hires",           uploadedDate:"01/06/2026" },
  { name:"Brand_Guidelines_v3.pdf",          description:"Updated visual brand identity guidelines",       uploadedDate:"28/05/2026" },
  { name:"Tax_Filing_May2026.pdf",           description:"GST and income tax filing documents for May",    uploadedDate:"20/05/2026" },
];
const SAMPLE_MEMOS = [
  { heading:"New POS Terminal Policy",      description:"All branches must validate receipts via the new POS system from July 1st.",       createdDate:"08/06/2026" },
  { heading:"Q3 Sales Target Announcement", description:"The Q3 target has been set at ₹42L across all regions.",                          createdDate:"07/06/2026" },
  { heading:"Inventory Freeze – June 30",   description:"No stock transfers or adjustments to be made on June 30 due to year-end audit.",  createdDate:"05/06/2026" },
  { heading:"Office Renovation Schedule",   description:"Head office 2nd floor will be under renovation June 20–25.",                     createdDate:"03/06/2026" },
  { heading:"Updated Leave Policy",         description:"Casual leave can now be applied 24hrs in advance instead of 48hrs.",              createdDate:"01/06/2026" },
];
const SAMPLE_EVENTS = [
  { name:"Board Review Meeting",      date:"2026-06-10", startTime:"10:00", endTime:"12:00", repeat:"One time" },
  { name:"Monthly Payroll Run",       date:"2026-06-15", startTime:"09:00", endTime:"10:00", repeat:"Monthly"  },
  { name:"Team Standup",              date:"2026-06-09", startTime:"09:30", endTime:"09:45", repeat:"Daily"    },
  { name:"Supplier Call – Arjun Traders", date:"2026-06-11", startTime:"14:00", endTime:"15:00", repeat:"One time" },
  { name:"Stock Audit Deadline",      date:"2026-06-20", startTime:"17:00", endTime:"17:00", repeat:"One time" },
  { name:"Q2 Closing",                date:"2026-06-30", startTime:"18:00", endTime:"18:00", repeat:"Monthly"  },
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

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const s = document.createElement("style");
  const tabler = document.createElement("link");
  tabler.rel = "stylesheet";
  tabler.href = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/dist/tabler-icons.min.css";
  document.head.appendChild(tabler);
  const gf = document.createElement("link");
  gf.rel = "stylesheet";
  gf.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(gf);
  s.textContent = `
    * { box-sizing:border-box; }
    .ess-wrap { font-family:${FONT_BODY}; color:#222; font-size:14px; line-height:1.5; }
    .ess-tabs { display:flex; gap:0; border-bottom:2px solid #e4ebe7; background:#fff; padding:0 10px; flex-wrap:wrap; }
    .ess-tab  { padding:13px 18px; font-size:13.5px; font-weight:600; color:#6b7280; cursor:pointer; border:none; background:none; border-bottom:3px solid transparent; margin-bottom:-2px; transition:.2s; font-family:${FONT_BODY}; }
    .ess-tab:hover { color:${GREEN}; }
    .ess-tab.active { color:${GREEN}; border-bottom-color:${GREEN}; background:${GREEN_LITE}; border-radius:6px 6px 0 0; }
    .ess-title { font-size:20px; font-weight:600; color:#111827; font-family:'Inter',sans-serif; }
    .ess-sub   { font-size:13px; color:#9ca3af; margin-top:2px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
    .ess-card { background:#fff; border-radius:12px; box-shadow:${SHADOW}; padding:20px; margin-bottom:18px; border:1px solid #f0f4f1; }
    .btn-add { background:#1a6b3c; color:#fff; border:none; border-radius:7px; padding:9px 20px; font-size:13.5px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:7px; font-family:'Inter',sans-serif; transition:background .15s; }
    .btn-add:hover { background:#145530; }
    .btn-save { background:#1a6b3c; color:#fff; border:none; border-radius:7px; padding:9px 24px; font-size:13.5px; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; transition:background .15s; }
    .btn-save:hover { background:#145530; }
    .btn-cancel { background:#fff; color:#374151; border:1px solid #d1d5db; border-radius:7px; padding:9px 20px; font-size:13.5px; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; }
    .export-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
    .exp-btn { border:1px solid #d1d5db; background:#fff; border-radius:7px; padding:7px 13px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:5px; font-family:${FONT_BODY}; transition:.15s; color:#374151; }
    .exp-btn:hover { background:#f9fafb; }
    .exp-btn.csv   { color:#1a6b3c; border-color:#1a6b3c; }
    .exp-btn.excel { color:#217346; border-color:#217346; }
    .exp-btn.pdf   { color:#dc2626; border-color:#dc2626; }
    .exp-btn.print { color:#4b5563; border-color:#9ca3af; }
    .exp-btn.col   { color:#7c3aed; border-color:#7c3aed; }
    .ess-table { width:100%; border-collapse:collapse; font-size:13.5px; }
    .ess-table th { background:#f8faf9; color:#6b7280; font-weight:500; padding:10px 14px; text-align:left; border-bottom:1px solid #e5e7eb; white-space:nowrap; font-family:'Inter',sans-serif; font-size:12px; letter-spacing:.04em; text-transform:uppercase; }
    .ess-table td { padding:11px 14px; border-bottom:1px solid #f3f4f6; color:#374151; vertical-align:middle; }
    .ess-table tr:hover td { background:#f0faf4; }
    .no-data { text-align:center; color:#9ca3af; padding:40px; font-size:14px; }
    .show-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#6b7280; margin-bottom:10px; }
    .show-row select { border:1px solid #d1d5db; border-radius:6px; padding:4px 8px; font-family:${FONT_BODY}; font-size:13px; }
    .tbl-search { border:1px solid #d1d5db; border-radius:7px; padding:8px 13px; font-family:${FONT_BODY}; font-size:13px; width:200px; outline:none; transition:.2s; }
    .tbl-search:focus { border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.10); }
    .tbl-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px; }
    .form-group { margin-bottom:16px; }
    .form-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:5px; display:block; }
    .form-control { width:100%; border:1px solid #d1d5db; border-radius:8px; padding:9px 13px; font-family:${FONT_BODY}; font-size:13.5px; box-sizing:border-box; color:#111827; transition:.2s; }
    .form-control:focus { outline:none; border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.12); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .filter-bar { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:16px; }
    .filter-title { font-size:14px; font-weight:700; color:${GREEN}; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .badge { padding:3px 10px; border-radius:20px; font-size:11.5px; font-weight:600; display:inline-block; }
    .badge-high   { background:#fee2e2; color:#991b1b; }
    .badge-medium { background:#fef9c3; color:#713f12; }
    .badge-low    { background:#dbeafe; color:#1e40af; }
    .badge-done   { background:#d1fae5; color:#065f46; }
    .badge-prog   { background:#e0f2fe; color:#075985; }
    .badge-wait   { background:#f3f4f6; color:#374151; }
    .badge-pub    { background:#d1fae5; color:#065f46; }
    .badge-priv   { background:#fee2e2; color:#991b1b; }
    .badge-team   { background:#ede9fe; color:#5b21b6; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.50); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .modal-box { background:#fff; border-radius:14px; padding:28px; width:560px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.20); }
    .modal-title { font-size:18px; font-weight:700; color:#111827; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
    .modal-close { background:none; border:none; font-size:22px; cursor:pointer; color:#9ca3af; line-height:1; }
    .cal-wrap { background:#fff; border-radius:12px; padding:22px; }
    .cal-nav  { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
    .cal-nav button { border:1px solid #d1d5db; background:#fff; border-radius:7px; padding:5px 13px; cursor:pointer; font-family:${FONT_BODY}; font-size:13px; }
    .cal-month { font-size:19px; font-weight:700; color:${GREEN}; flex:1; text-align:center; }
    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); border-left:1px solid #e5e7eb; border-top:1px solid #e5e7eb; }
    .cal-day-hdr { text-align:center; font-weight:600; font-size:12.5px; color:#6b7280; padding:9px 0; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; background:#f8faf9; }
    .cal-cell { min-height:88px; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; padding:6px 8px; font-size:13px; color:#374151; }
    .cal-cell.today { background:#f0fdf4; }
    .cal-cell.empty { background:#fafafa; color:#d1d5db; }
    .cal-date-num { font-weight:600; font-size:13px; }
    .msg-area { min-height:320px; padding:20px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; }
    .msg-bubble { padding:10px 14px; border-radius:12px; max-width:72%; font-size:13.5px; line-height:1.5; }
    .msg-bubble.self   { background:${GREEN}; color:#fff; align-self:flex-end; border-bottom-right-radius:3px; }
    .msg-bubble.system { background:#f3f4f6; color:#374151; align-self:flex-start; border-bottom-left-radius:3px; }
    .msg-time { font-size:11px; opacity:.65; margin-top:3px; }
    .msg-input-row { display:flex; gap:8px; padding:12px 16px; border-top:1px solid #f3f4f6; background:#fff; border-radius:0 0 12px 12px; }
    .msg-input { flex:1; border:1px solid #d1d5db; border-radius:8px; padding:10px 14px; font-family:${FONT_BODY}; font-size:13.5px; outline:none; transition:.2s; }
    .msg-input:focus { border-color:${GREEN}; }
    .msg-send { background:#1a6b3c; color:#fff; border:none; border-radius:7px; padding:10px 16px; font-size:16px; cursor:pointer; }
    .rich-toolbar { border:1px solid #d1d5db; border-radius:8px 8px 0 0; background:#f9fafb; padding:8px 12px; display:flex; gap:6px; flex-wrap:wrap; }
    .rich-btn { background:#fff; border:1px solid #d1d5db; border-radius:5px; padding:3px 9px; font-size:12px; cursor:pointer; }
    .rich-area { border:1px solid #d1d5db; border-top:none; border-radius:0 0 8px 8px; min-height:130px; padding:12px; font-family:${FONT_BODY}; font-size:13.5px; width:100%; box-sizing:border-box; resize:vertical; outline:none; }
    .dropzone { border:2px dashed #d1d5db; border-radius:10px; padding:36px; text-align:center; color:#9ca3af; font-size:14px; cursor:pointer; transition:.2s; }
    .dropzone:hover { border-color:${GREEN}; color:${GREEN}; background:#f0fdf4; }
    .kb-card { border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:12px; transition:.2s; }
    .kb-card:hover { border-color:${GREEN}; box-shadow:0 4px 12px rgba(26,107,60,.10); }
    .settings-sidebar { background:#f8faf9; border-right:1px solid #e5e7eb; min-width:160px; border-radius:12px 0 0 12px; }
    .settings-tab { padding:13px 20px; cursor:pointer; font-weight:600; font-size:13.5px; transition:.2s; border-bottom:1px solid #e9ecef; font-family:${FONT_BODY}; }
    .settings-tab:hover { background:#e8f5ee; color:${GREEN}; }
    .settings-tab.active { background:${GREEN}; color:#fff; }
    .pag-btn { border:1px solid #d1d5db; background:#fff; border-radius:6px; padding:6px 13px; font-size:13px; cursor:pointer; font-family:${FONT_BODY}; transition:.15s; }
    .pag-btn:hover { background:#f3f4f6; }
    .act-btn { background:none; border:none; cursor:pointer; padding:5px 7px; border-radius:6px; font-size:15px; transition:.15s; color:#6b7280; display:inline-flex; align-items:center; }
    .act-btn:hover { background:#f3f4f6; color:#374151; }
    .act-btn.edit-del { color:#9ca3af; }
    .act-btn.edit-del:hover { background:#fee2e2; color:#dc2626; }
  `;
  document.head.appendChild(s);
}

function EssExportBar({ data = [], columns = [], filename = "export" }) {
  const toCSV = () => {
    const header = columns.map(c => c.label).join(",");
    const rows   = data.map(row => columns.map(c => `"${row[c.key] ?? ""}"`).join(","));
    const blob   = new Blob([[header, ...rows].join("\n")], { type:"text/csv" });
    Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`${filename}.csv` }).click();
  };
  const toPrint = () => {
    const w = window.open("","_blank");
    const hdrs = columns.map(c => `<th style="border:1px solid #ccc;padding:8px">${c.label}</th>`).join("");
    const rows = data.map(row => `<tr>${columns.map(c => `<td style="border:1px solid #ccc;padding:8px">${row[c.key]??""}</td>`).join("")}</tr>`).join("");
    w.document.write(`<html><head><title>${filename}</title><style>body{font-family:sans-serif;font-size:13px}table{border-collapse:collapse;width:100%}</style></head><body><h2>${filename}</h2><table><thead><tr>${hdrs}</tr></thead><tbody>${rows}</tbody></table></body></html>`);
    w.print();
  };
  const [showCols, setShowCols] = useState(false);
  const [visible,  setVisible]  = useState(() => Object.fromEntries(columns.map(c => [c.key, true])));
  return (
    <div className="export-bar">
      <button className="exp-btn csv"   onClick={toCSV}><i className="ti ti-file-text" style={{fontSize:14}}></i> CSV</button>
      <button className="exp-btn excel" onClick={toCSV}><i className="ti ti-table"     style={{fontSize:14}}></i> Excel</button>
      <button className="exp-btn print" onClick={toPrint}><i className="ti ti-printer"  style={{fontSize:14}}></i> Print</button>
      <div style={{ position:"relative" }}>
        <button className="exp-btn col" onClick={() => setShowCols(v => !v)}><i className="ti ti-columns" style={{fontSize:14}}></i> Columns</button>
        {showCols && (
          <div style={{ position:"absolute", top:"110%", left:0, background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:14, zIndex:100, minWidth:190, boxShadow:"0 8px 24px rgba(0,0,0,.12)" }}>
            {columns.map(c => (
              <label key={c.key} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:7, fontSize:13, cursor:"pointer" }}>
                <input type="checkbox" checked={!!visible[c.key]} onChange={() => setVisible(v => ({ ...v, [c.key]:!v[c.key] }))} />{c.label}
              </label>
            ))}
          </div>
        )}
      </div>
      <button className="exp-btn pdf" onClick={toPrint}><i className="ti ti-file-type-pdf" style={{fontSize:14}}></i> PDF</button>
    </div>
  );
}

function EssDataTable({ columns, data, emptyMsg = "No data available in table" }) {
  const [q,    setQ]    = useState("");
  const [show, setShow] = useState(25);
  const [page, setPage] = useState(1);
  const filtered   = data.filter(row => columns.some(c => String(row[c.key] ?? "").toLowerCase().includes(q.toLowerCase())));
  const totalPages = Math.ceil(filtered.length / show);
  const shown      = filtered.slice((page-1)*show, page*show);
  return (
    <>
      <div className="tbl-top">
        <div className="show-row">
          Show <select value={show} onChange={e => { setShow(+e.target.value); setPage(1); }}>{[10,25,50,100].map(n=><option key={n}>{n}</option>)}</select> entries
        </div>
        <EssExportBar data={data} columns={columns} />
        <input className="tbl-search" placeholder="Search..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
      </div>
      <div style={{ overflowX:"auto" }}>
        <table className="ess-table">
          <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
          <tbody>
            {shown.length === 0
              ? <tr><td colSpan={columns.length} className="no-data">{emptyMsg}</td></tr>
              : shown.map((row, i) => <tr key={i}>{columns.map(c => <td key={c.key}>{row[c.key]}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, fontSize:13, color:"#6b7280" }}>
        <span>Showing {shown.length===0?0:(page-1)*show+1} to {Math.min(page*show,filtered.length)} of {filtered.length} entries</span>
        <div style={{ display:"flex", gap:6 }}>
          <button className="pag-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
          {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p => (
            <button key={p} className="pag-btn" onClick={() => setPage(p)} style={{ background:p===page?GREEN:"#fff", color:p===page?"#fff":"#374151", borderColor:p===page?GREEN:"#d1d5db" }}>{p}</button>
          ))}
          <button className="pag-btn" disabled={page===totalPages||totalPages===0} onClick={() => setPage(p=>p+1)}>Next →</button>
        </div>
      </div>
    </>
  );
}

function EssFilterBar({ filters }) {
  return (
    <div className="filter-bar">
      <div className="filter-title">▼ Filters</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
        {filters.map(f => (
          <div key={f.label}>
            <label className="form-label">{f.label}:</label>
            <select className="form-control" defaultValue="All">{(f.options||["All"]).map(o=><option key={o}>{o}</option>)}</select>
          </div>
        ))}
      </div>
    </div>
  );
}

function EssRichTextArea({ value, onChange }) {
  return (
    <>
      <div className="rich-toolbar">{["B","I","U","≡","⊞","⊟","🔗"].map(b=><button key={b} className="rich-btn">{b}</button>)}<span style={{fontSize:11,color:"#9ca3af",marginLeft:"auto",alignSelf:"center"}}>Rich Text</span></div>
      <textarea className="rich-area" value={value} onChange={e=>onChange(e.target.value)} placeholder="Write here..." />
    </>
  );
}

/* ── TODO ── */
const TODO_COLS = [
  { key:"addedOn",    label:"Added On"    },
  { key:"taskId",     label:"Task ID"     },
  { key:"task",       label:"Task"        },
  { key:"priority",   label:"Priority"    },
  { key:"statusBadge",label:"Status"      },
  { key:"startDate",  label:"Start Date"  },
  { key:"endDate",    label:"End Date"    },
  { key:"hours",      label:"Est. Hours"  },
  { key:"assignedBy", label:"Assigned By" },
  { key:"assignedTo", label:"Assigned To" },
  { key:"actions",    label:"Actions"     },
];
function priorityBadge(p) { const cls={High:"badge-high",Medium:"badge-medium",Low:"badge-low"}[p]||"badge-wait"; return <span className={`badge ${cls}`}>{p}</span>; }
function statusBadge(s)   { const cls={Completed:"badge-done","In Progress":"badge-prog","Not Started":"badge-wait"}[s]||"badge-wait"; return <span className={`badge ${cls}`}>{s}</span>; }

function genTaskId(todos) {
  const nums = todos.map(t => parseInt(String(t.taskId||"").replace("TASK-",""))||0);
  const next = nums.length > 0 ? Math.max(...nums)+1 : 1;
  return `TASK-${String(next).padStart(3,"0")}`;
}

function TodoModal({ onClose, onSave, nextId }) {
  const [form, setForm] = useState({ task:"", assignedTo:"", priority:"", status:"", startDate:"", endDate:"", hours:"", desc:"" });
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Add Task <button className="modal-close" onClick={onClose}><i className="ti ti-x" style={{fontSize:18,verticalAlign:"middle"}}></i></button></div>
        <div style={{ padding:"8px 12px", background:G.greenBg, borderRadius:8, marginBottom:16, fontSize:13, color:G.green, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ background:G.green, color:"#fff", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700 }}>AUTO ID</span>
          {nextId}
        </div>
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
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
          <button className="btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function EssTodoPage() {
  const [showModal, setShowModal] = useState(false);
  const now = new Date().toLocaleDateString("en-IN");
  const [todos, setTodos] = useState(
    SAMPLE_TODOS.map(t => ({
      ...t,
      priority:    priorityBadge(t.priority),
      statusBadge: statusBadge(t.status),
      actions: <><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>,
    }))
  );
  const nextId = genTaskId(todos);
  return (
    <div>
      {showModal && (
        <TodoModal nextId={nextId} onClose={() => setShowModal(false)}
          onSave={f => setTodos(ts => [...ts, {
            addedOn:now, taskId:nextId, task:f.task,
            priority:priorityBadge(f.priority||"Low"), statusBadge:statusBadge(f.status||"Not Started"),
            startDate:f.startDate, endDate:f.endDate, hours:f.hours,
            assignedBy:"Admin", assignedTo:f.assignedTo,
            actions:<><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>
          }])}
        />
      )}
      <div className="page-header">
        <div><div className="ess-title">📋 To-Do List</div><div className="ess-sub">{todos.length} tasks total</div></div>
        <button className="btn-add" onClick={() => setShowModal(true)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Task</button>
      </div>
      <EssFilterBar filters={[
        { label:"Assigned To", options:["All","Priya S.","Rahul M.","Ananya K.","Vikram T.","Deepa R."] },
        { label:"Priority",    options:["All","High","Medium","Low"] },
        { label:"Status",      options:["All","Not Started","In Progress","Completed"] },
        { label:"Date Range",  options:["All","This Week","This Month","Custom"] },
      ]} />
      <div className="ess-card"><EssDataTable columns={TODO_COLS} data={todos} /></div>
    </div>
  );
}

/* ── DOCUMENT ── */
const DOC_COLS = [
  { key:"name",         label:"File Name"     },
  { key:"description",  label:"Description"   },
  { key:"uploadedDate", label:"Uploaded Date" },
  { key:"size",         label:"Size"          },
  { key:"actions",      label:"Actions"       },
];

function EssDocumentPage() {
  const [showForm, setShowForm] = useState(false);
  const [file,     setFile]     = useState(null);
  const [desc,     setDesc]     = useState("");
  const fileRef = useRef();
  const [docs, setDocs] = useState(
    SAMPLE_DOCS.map(d => ({
      ...d,
      size:`${(Math.random()*4+0.5).toFixed(1)} MB`,
      actions:<><button className="act-btn"><i className="ti ti-download"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></>,
    }))
  );
  const handleSubmit = () => {
    if (!file) return alert("Please choose a file");
    setDocs(ds => [...ds, { name:file.name, description:desc, uploadedDate:new Date().toLocaleDateString("en-IN"), size:`${(file.size/1048576).toFixed(1)} MB`, actions:<><button className="act-btn"><i className="ti ti-download"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></> }]);
    setFile(null); setDesc(""); setShowForm(false);
  };
  return (
    <div>
      <div className="page-header">
        <div><div className="ess-title">📁 Documents</div><div className="ess-sub">Manage shared files and attachments</div></div>
        <button className="btn-add" onClick={() => setShowForm(v=>!v)}><i className="ti ti-upload" style={{fontSize:15}}></i> Upload</button>
      </div>
      {showForm && (
        <div className="ess-card">
          <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:"#111827"}}>Upload Document</div>
          <div className="form-group">
            <label className="form-label">File *</label>
            <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png,.xlsx" ref={fileRef} onChange={e=>setFile(e.target.files[0])} style={{display:"none"}} />
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button className="exp-btn" onClick={() => fileRef.current.click()}>Choose File</button>
              <span style={{fontSize:13,color:"#6b7280"}}>{file ? file.name : "No file chosen"}</span>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Brief description" /></div>
          <div style={{display:"flex",gap:10}}><button className="btn-save" onClick={handleSubmit}>Submit</button><button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="ess-card"><EssDataTable columns={DOC_COLS} data={docs} /></div>
    </div>
  );
}

/* ── MEMOS ── */
const MEMO_COLS = [
  { key:"heading",     label:"Heading"      },
  { key:"description", label:"Description"  },
  { key:"createdDate", label:"Created Date" },
  { key:"actions",     label:"Actions"      },
];

function MemoModal({ onClose, onSave }) {
  const [heading, setHeading] = useState("");
  const [desc,    setDesc]    = useState("");
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="modal-title">Add Memo <button className="modal-close" onClick={onClose}><i className="ti ti-x" style={{fontSize:18,verticalAlign:"middle"}}></i></button></div>
        <div className="form-group"><label className="form-label">Heading *</label><input className="form-control" value={heading} onChange={e=>setHeading(e.target.value)} placeholder="Memo heading" /></div>
        <div className="form-group"><label className="form-label">Content</label><EssRichTextArea value={desc} onChange={setDesc} /></div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
          <button className="btn-save" onClick={() => { if(heading){ onSave({heading,desc}); onClose(); } }}>Save</button>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function EssMemosPage() {
  const [showModal, setShowModal] = useState(false);
  const [memos, setMemos] = useState(SAMPLE_MEMOS.map(m => ({ ...m, actions:<><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></> })));
  return (
    <div>
      {showModal && <MemoModal onClose={() => setShowModal(false)} onSave={m => setMemos(ms => [...ms, { heading:m.heading, description:m.desc, createdDate:new Date().toLocaleDateString("en-IN"), actions:<><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></> }])} />}
      <div className="page-header">
        <div><div className="ess-title">📝 Memos</div><div className="ess-sub">Internal announcements and notices</div></div>
        <button className="btn-add" onClick={() => setShowModal(true)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Memo</button>
      </div>
      <div className="ess-card"><EssDataTable columns={MEMO_COLS} data={memos} /></div>
    </div>
  );
}

/* ── REMINDERS ── */
function ReminderModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:"", repeat:"One time", date:"", startTime:"", endTime:"" });
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:480}}>
        <div className="modal-title">Add Reminder <button className="modal-close" onClick={onClose}><i className="ti ti-x" style={{fontSize:18,verticalAlign:"middle"}}></i></button></div>
        <div className="form-group"><label className="form-label">Event Name *</label><input className="form-control" value={form.name} onChange={set("name")} placeholder="e.g. Monthly Payroll Run" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Repeat</label><select className="form-control" value={form.repeat} onChange={set("repeat")}><option>One time</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
          <div className="form-group"><label className="form-label">Date *</label><input className="form-control" type="date" value={form.date} onChange={set("date")} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Start Time *</label><input className="form-control" type="time" value={form.startTime} onChange={set("startTime")} /></div>
          <div className="form-group"><label className="form-label">End Time</label><input className="form-control" type="time" value={form.endTime} onChange={set("endTime")} /></div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={() => { if(form.name&&form.date){ onSave(form); onClose(); } }}>Save</button>
        </div>
      </div>
    </div>
  );
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const EVENT_COLORS = ["#1a6b3c","#0284c7","#7c3aed","#dc2626","#d97706","#0891b2"];

function EssRemindersPage() {
  const [showModal, setShowModal] = useState(false);
  const [events,    setEvents]    = useState(SAMPLE_EVENTS);
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year=current.getFullYear(), month=current.getMonth();
  const firstDay=new Date(year,month,1).getDay(), daysIn=new Date(year,month+1,0).getDate();
  const cells=[...Array(firstDay).fill(null),...Array.from({length:daysIn},(_,i)=>i+1)];
  const monthName=current.toLocaleString("default",{month:"long"});
  return (
    <div>
      {showModal && <ReminderModal onClose={() => setShowModal(false)} onSave={r => setEvents(e=>[...e,r])} />}
      <div className="page-header">
        <div><div className="ess-title">🗓️ Reminders</div><div className="ess-sub">{events.length} upcoming events</div></div>
        <button className="btn-add" onClick={() => setShowModal(true)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Reminder</button>
      </div>
      <div className="ess-card cal-wrap" style={{padding:22}}>
        <div className="cal-nav">
          <button onClick={() => setCurrent(new Date(year,month-1,1))}>‹ Prev</button>
          <button onClick={() => setCurrent(new Date(today.getFullYear(),today.getMonth(),1))}>Today</button>
          <button onClick={() => setCurrent(new Date(year,month+1,1))}>Next ›</button>
          <div className="cal-month">{monthName} {year}</div>
        </div>
        <div className="cal-grid">
          {DAYS.map(d=><div key={d} className="cal-day-hdr">{d}</div>)}
          {cells.map((d,i) => {
            const isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
            const dayEvents=events.filter(ev=>{if(!ev.date)return false;const ed=new Date(ev.date);return ed.getDate()===d&&ed.getMonth()===month&&ed.getFullYear()===year;});
            return (
              <div key={i} className={`cal-cell${d===null?" empty":""}${isToday?" today":""}`}>
                {d && <div className="cal-date-num" style={{color:isToday?GREEN:"#374151"}}>{d}</div>}
                {dayEvents.map((ev,ei)=>(
                  <div key={ei} style={{background:EVENT_COLORS[ei%EVENT_COLORS.length],color:"#fff",borderRadius:5,padding:"2px 6px",fontSize:11,marginTop:3,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={`${ev.name}`}>
                    {ev.startTime} {ev.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="ess-card">
        <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:"#111827"}}>Upcoming Events</div>
        {events.map((ev,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:EVENT_COLORS[i%EVENT_COLORS.length],flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:"#111827"}}>{ev.name}</div>
              <div style={{fontSize:12,color:"#9ca3af"}}>{ev.date} · {ev.startTime}{ev.endTime?`–${ev.endTime}`:""} · {ev.repeat}</div>
            </div>
            <button className="act-btn edit-del"><i className="ti ti-trash"></i></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MESSAGES ── */
function EssMessagesPage() {
  const [msgs,  setMsgs]  = useState(SAMPLE_MESSAGES);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMsgs(m=>[...m,{text:input,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),sender:"self"}]);
    setInput("");
  };
  return (
    <div>
      <div className="ess-title" style={{marginBottom:18}}>💬 Messages</div>
      <div className="ess-card" style={{padding:0,display:"flex",flexDirection:"column"}}>
        <div style={{borderBottom:"1px solid #f3f4f6",padding:"12px 16px",display:"flex",gap:10,alignItems:"center"}}>
          {["Admin","Priya S.","Rahul M.","Ananya K."].map((n,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:i===0?GREEN_LITE:"transparent",border:i===0?`1px solid ${GREEN}`:"1px solid #e5e7eb",cursor:"pointer",fontSize:13,fontWeight:600,color:i===0?GREEN:"#374151"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?GREEN:"#e5e7eb",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{n[0]}</div>
              {n}
            </div>
          ))}
        </div>
        <div className="msg-area">
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.sender==="self"?"flex-end":"flex-start"}}>
              <div className={`msg-bubble ${m.sender}`}>{m.text}</div>
              <div className="msg-time" style={{color:"#9ca3af"}}>{m.time}</div>
            </div>
          ))}
        </div>
        <div className="msg-input-row">
          <input className="msg-input" placeholder="Type a message..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} />
          <button className="msg-send" onClick={send}><i className="ti ti-send" style={{fontSize:16}}></i></button>
        </div>
      </div>
    </div>
  );
}

/* ── KNOWLEDGE BASE ── */
function EssKnowledgePage() {
  const [showForm, setShowForm] = useState(false);
  const [articles, setArticles] = useState(SAMPLE_KB);
  const [form,     setForm]     = useState({ title:"", content:"", share:"Public" });
  const [search,   setSearch]   = useState("");
  const filtered = articles.filter(a=>a.title.toLowerCase().includes(search.toLowerCase())||a.content.toLowerCase().includes(search.toLowerCase()));
  const shareBadge = s => { const cls={Public:"badge-pub",Private:"badge-priv",Team:"badge-team"}[s]||"badge-wait"; return <span className={`badge ${cls}`}>{s}</span>; };
  return (
    <div>
      <div className="page-header">
        <div><div className="ess-title">📚 Knowledge Base</div><div className="ess-sub">{articles.length} articles</div></div>
        <button className="btn-add" onClick={() => setShowForm(v=>!v)}><i className="ti ti-plus" style={{fontSize:15}}></i> Add Article</button>
      </div>
      {showForm && (
        <div className="ess-card">
          <div style={{fontWeight:700,fontSize:16,marginBottom:16,color:"#111827"}}>New Article</div>
          <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Article title" /></div>
          <div className="form-group"><label className="form-label">Content</label><EssRichTextArea value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Visibility</label><select className="form-control" value={form.share} onChange={e=>setForm(f=>({...f,share:e.target.value}))}><option>Public</option><option>Private</option><option>Team</option></select></div>
            <div/>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
            <button className="btn-save" onClick={() => { if(!form.title) return alert("Title required"); setArticles(a=>[...a,{...form,date:new Date().toLocaleDateString("en-IN")}]); setForm({title:"",content:"",share:"Public"}); setShowForm(false); }}>Publish</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="ess-card" style={{marginBottom:14}}><input className="tbl-search" style={{width:"100%",maxWidth:360}} placeholder="Search articles..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
      {filtered.map((a,i)=>(
        <div key={i} className="kb-card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:4}}>{a.title}</div>
              <div style={{fontSize:13,color:"#6b7280",lineHeight:1.6,marginBottom:8}}>{a.content.length>120?a.content.slice(0,120)+"…":a.content}</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>{shareBadge(a.share)}<span style={{fontSize:12,color:"#9ca3af"}}>Published {a.date}</span></div>
            </div>
            <div style={{display:"flex",gap:4,marginLeft:16}}><button className="act-btn"><i className="ti ti-edit"></i></button><button className="act-btn edit-del"><i className="ti ti-trash"></i></button></div>
          </div>
        </div>
      ))}
      {filtered.length===0&&<div className="ess-card" style={{textAlign:"center",color:"#9ca3af",padding:40}}>No articles found.</div>}
    </div>
  );
}

/* ── ESSENTIALS SETTINGS ── */
function EssentialsSettingsPage() {
  const [tab, setTab] = useState("Leave");
  const [leavePrefix, setLeavePrefix] = useState("LEV-2026-");
  const [leaveInstructions, setLeaveInstructions] = useState("All leave applications must be submitted at least 48 hours in advance.");
  const [autoApproval, setAutoApproval] = useState(false);
  const tabs = ["Leave","Payroll","Attendance","Sales Targets","Essentials"];
  return (
    <div>
      <div className="ess-title" style={{marginBottom:18}}>⚙️ Essentials & HRM Settings</div>
      <div className="ess-card" style={{display:"flex",gap:0,padding:0,overflow:"hidden"}}>
        <div className="settings-sidebar">{tabs.map(t=><div key={t} className={`settings-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t}</div>)}</div>
        <div style={{flex:1,padding:24}}>
          {tab==="Leave"&&(
            <>
              <div style={{fontWeight:700,fontSize:16,marginBottom:18,color:"#111827"}}>Leave Settings</div>
              <div className="form-group"><label className="form-label">Leave Reference No. Prefix</label><input className="form-control" value={leavePrefix} onChange={e=>setLeavePrefix(e.target.value)} style={{maxWidth:300}}/></div>
              <div className="form-group"><label className="form-label">Max Casual Leave Days / Year</label><input className="form-control" type="number" defaultValue={12} style={{maxWidth:150}}/></div>
              <div className="form-group"><label className="form-label">Auto Approval After (days)</label><input className="form-control" type="number" defaultValue={3} style={{maxWidth:150}}/></div>
              <div className="form-group"><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><input type="checkbox" checked={autoApproval} onChange={e=>setAutoApproval(e.target.checked)}/><span className="form-label" style={{margin:0}}>Enable Auto Approval</span></label></div>
              <div className="form-group"><label className="form-label">Leave Application Instructions</label><EssRichTextArea value={leaveInstructions} onChange={setLeaveInstructions}/></div>
            </>
          )}
          {tab==="Payroll"&&(
            <div>
              <div style={{fontWeight:700,fontSize:16,marginBottom:18,color:"#111827"}}>Payroll Settings</div>
              <div className="form-group"><label className="form-label">Payroll Cycle</label><select className="form-control" defaultValue="Monthly" style={{maxWidth:240}}><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select></div>
              <div className="form-group"><label className="form-label">Payroll Processing Date</label><input className="form-control" type="number" defaultValue={28} min={1} max={31} style={{maxWidth:120}}/></div>
              <div className="form-group"><label className="form-label">Default Currency</label><select className="form-control" defaultValue="INR (₹)" style={{maxWidth:240}}><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select></div>
            </div>
          )}
          {tab==="Attendance"&&(
            <div>
              <div style={{fontWeight:700,fontSize:16,marginBottom:18,color:"#111827"}}>Attendance Settings</div>
              <div className="form-group"><label className="form-label">Work Start Time</label><input className="form-control" type="time" defaultValue="09:00" style={{maxWidth:180}}/></div>
              <div className="form-group"><label className="form-label">Work End Time</label><input className="form-control" type="time" defaultValue="18:00" style={{maxWidth:180}}/></div>
              <div className="form-group"><label className="form-label">Late Arrival Grace (minutes)</label><input className="form-control" type="number" defaultValue={15} style={{maxWidth:150}}/></div>
            </div>
          )}
          {(tab==="Sales Targets"||tab==="Essentials")&&<div style={{color:"#9ca3af",fontSize:14,padding:20}}>{tab} settings — configure as needed.</div>}
          <div style={{marginTop:24}}><button className="btn-save">Update Settings</button></div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:12,color:"#9ca3af",marginTop:14}}>Essentials and HRM module version — <strong>5.1</strong></div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ESSENTIALS NAV & DASHBOARD
══════════════════════════════════════════ */
const ESS_TABS = [
  { label:"Essentials",     path:"/essentials",               icon:"🏠" },
  { label:"To Do",          path:"/essentials/todo",          icon:"✅" },
  { label:"Document",       path:"/essentials/document",      icon:"📁" },
  { label:"Memos",          path:"/essentials/memos",         icon:"📝" },
  { label:"Reminders",      path:"/essentials/reminders",     icon:"🗓️" },
  { label:"Messages",       path:"/essentials/messages",      icon:"💬" },
  { label:"Knowledge Base", path:"/essentials/knowledge-base",icon:"📚" },
  { label:"Settings",       path:"/essentials/settings",      icon:"⚙️" },
];

function EssentialsNav() {
  const loc = useLocation();
  return (
    <div style={{ display:"flex", gap:0, borderBottom:"2px solid #e4ebe7", marginBottom:24, flexWrap:"wrap", background:"#fff" }}>
      {ESS_TABS.map(t => {
        const active = loc.pathname===t.path||(t.path!=="/essentials"&&loc.pathname.startsWith(t.path));
        return (
          <Link key={t.label} to={t.path} style={{
            padding:"12px 18px", fontSize:13.5, fontWeight:active?700:500,
            color:active?"#1a6b3c":"#718096", textDecoration:"none",
            borderBottom:active?"3px solid #1a6b3c":"3px solid transparent",
            background:active?"#e8f5ee":"none",
            borderRadius:active?"6px 6px 0 0":0,
            whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5, transition:".15s",
          }}>{t.icon} {t.label}</Link>
        );
      })}
    </div>
  );
}

function EssentialsDashboard() {
  const cards = [
    { icon:"✅", label:"To Do",          path:"/essentials/todo",          count:"7 tasks",    color:"#d1fae5", accent:"#1a6b3c" },
    { icon:"📁", label:"Documents",      path:"/essentials/document",      count:"6 files",    color:"#dbeafe", accent:"#1d4ed8" },
    { icon:"📝", label:"Memos",          path:"/essentials/memos",         count:"5 memos",    color:"#fef9c3", accent:"#713f12" },
    { icon:"🗓️", label:"Reminders",     path:"/essentials/reminders",     count:"6 events",   color:"#ede9fe", accent:"#6d28d9" },
    { icon:"💬", label:"Messages",       path:"/essentials/messages",      count:"5 messages", color:"#e0f2fe", accent:"#0369a1" },
    { icon:"📚", label:"Knowledge Base", path:"/essentials/knowledge-base",count:"4 articles", color:"#fce7f3", accent:"#9d174d" },
  ];
  return (
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:700,color:"#111827"}}>✅ Essentials</h2>
        <p style={{margin:0,color:"#9ca3af",fontSize:14}}>Your productivity hub — tasks, docs, memos, reminders & more</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
        {cards.map(c=>(
          <Link key={c.label} to={c.path} style={{textDecoration:"none"}}>
            <div style={{background:"#fff",borderRadius:12,padding:20,boxShadow:"0 2px 10px rgba(0,0,0,.06)",border:"1px solid #f0f4f1",cursor:"pointer",transition:".2s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.12)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.06)"}
            >
              <div style={{width:48,height:48,borderRadius:12,background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12}}>{c.icon}</div>
              <div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:4}}>{c.label}</div>
              <div style={{fontSize:13,color:c.accent,fontWeight:600}}>{c.count}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EssLayout({ children }) {
  injectStyles();
  return (
    <div className="ess-wrap" style={{padding:"0 0 40px 0"}}>
      <div style={{background:"#fff",borderBottom:"2px solid #e4ebe7",marginBottom:20}}><EssentialsNav /></div>
      <div style={{padding:"0 2px"}}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT EXPORTS
══════════════════════════════════════════ */
export function HRMRoutes() {
  return (
    <Routes>
      <Route path="/"              element={<HRMDashboard />} />
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
  return (
    <Routes>
      <Route path="/"               element={<EssLayout><EssentialsDashboard /></EssLayout>} />
      <Route path="/todo"           element={<EssLayout><EssTodoPage /></EssLayout>} />
      <Route path="/document"       element={<EssLayout><EssDocumentPage /></EssLayout>} />
      <Route path="/memos"          element={<EssLayout><EssMemosPage /></EssLayout>} />
      <Route path="/reminders"      element={<EssLayout><EssRemindersPage /></EssLayout>} />
      <Route path="/messages"       element={<EssLayout><EssMessagesPage /></EssLayout>} />
      <Route path="/knowledge-base" element={<EssLayout><EssKnowledgePage /></EssLayout>} />
      <Route path="/settings"       element={<EssLayout><EssentialsSettingsPage /></EssLayout>} />
    </Routes>
  );
}
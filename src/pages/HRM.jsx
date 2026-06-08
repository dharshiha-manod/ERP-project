import { useState, useRef } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";

/* ─── shared palette ─── */
const C = {
  green: "#2d6a4f", greenLight: "#52b788", greenBg: "#f0f4f1",
  white: "#fff", border: "#e2e8f0", text: "#1a202c", muted: "#718096",
  danger: "#e53e3e", purple: "#553c9a", purpleLight: "#6b46c1",
};

const Btn = ({ children, onClick, variant = "primary", type = "button", style = {} }) => {
  const base = {
    padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity .15s",
    ...(variant === "primary" && { background: C.purpleLight, color: "#fff" }),
    ...(variant === "dark"    && { background: "#2d3748", color: "#fff" }),
    ...(variant === "green"   && { background: C.green, color: "#fff" }),
    ...(variant === "outline" && { background: "#fff", color: C.text, border: `1px solid ${C.border}` }),
    ...(variant === "danger"  && { background: C.danger, color: "#fff" }),
    ...style,
  };
  return <button type={type} style={base} onClick={onClick}>{children}</button>;
};

const Badge = ({ children, color = C.greenLight }) => (
  <span style={{ background: color + "22", color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{children}</span>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 10, padding: 20, boxShadow: "0 1px 4px #0001", ...style }}>{children}</div>
);

const NoData = () => (
  <div style={{ textAlign: "center", padding: "28px 0", color: C.muted, fontSize: 14 }}>No data available in table</div>
);

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0007", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 10, width: 560, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", padding: 28, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
      {label}{required && <span style={{ color: C.danger }}> *</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, boxSizing: "border-box", ...props.style }} />
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, boxSizing: "border-box", ...props.style }}>{children}</select>
);

const Textarea = (props) => (
  <textarea {...props} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, minHeight: 90, resize: "vertical", boxSizing: "border-box", ...props.style }} />
);

function DataTable({ columns, rows, onEdit, onDelete, extraActions }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["Export CSV","Export Excel","Print","Column visibility","Export PDF"].map(t => (
          <button key={t} style={{ padding: "5px 12px", border: `1px solid ${C.border}`, borderRadius: 5, background: C.white, fontSize: 12, cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f7fafc" }}>
            {columns.map(c => <th key={c} style={{ padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${C.border}`, fontWeight: 600, color: C.text }}>{c}</th>)}
            <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 28, color: C.muted }}>No data available in table</td></tr>
            : rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  {row.map((cell, j) => <td key={j} style={{ padding: "10px 14px" }}>{cell}</td>)}
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {onEdit && <button onClick={() => onEdit(i)} style={{ padding: "4px 12px", background: "#edf2ff", color: C.purpleLight, border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>✎ Edit</button>}
                      {onDelete && <button onClick={() => onDelete(i)} style={{ padding: "4px 12px", background: "#fff5f5", color: C.danger, border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🗑 Delete</button>}
                      {extraActions && extraActions(i)}
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 13, color: C.muted }}>Showing {rows.length} to {rows.length} of {rows.length} entries</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HRM NAV
══════════════════════════════════════════ */
const HRM_TABS = [
  { label: "HRM",           path: "/hrm" },
  { label: "Leave Type",    path: "/hrm/leave-type" },
  { label: "Leave",         path: "/hrm/leave" },
  { label: "Attendance",    path: "/hrm/attendance" },
  { label: "Payroll",       path: "/hrm/payroll" },
  { label: "Holiday",       path: "/hrm/holiday" },
  { label: "Departments",   path: "/hrm/departments" },
  { label: "Designations",  path: "/hrm/designations" },
  { label: "Sales Targets", path: "/hrm/sales-targets" },
  { label: "Settings",      path: "/hrm/settings" },
];

function HRMNav() {
  const loc = useLocation();
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 24, flexWrap: "wrap" }}>
      {HRM_TABS.map(t => {
        const active = loc.pathname === t.path || (t.path !== "/hrm" && loc.pathname.startsWith(t.path));
        return (
          <Link key={t.label} to={t.path} style={{ padding: "10px 18px", fontSize: 14, fontWeight: active ? 700 : 500, color: active ? C.green : C.muted, textDecoration: "none", borderBottom: active ? `3px solid ${C.green}` : "3px solid transparent", background: "none", whiteSpace: "nowrap" }}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   HRM DASHBOARD
══════════════════════════════════════════ */
function HRMDashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <HRMNav />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <h4 style={{ margin: "0 0 14px", color: C.text }}>🌿 My leaves</h4>
          <div style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "18px 0" }}>No data</div>
        </Card>
        <Card>
          <h4 style={{ margin: "0 0 14px", color: C.text }}>🎯 My sales targets</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 12, color: C.muted }}>Target achieved last month:</div><div style={{ color: C.green, fontWeight: 700, fontSize: 16 }}>₹ 0.00</div></div>
            <div><div style={{ fontSize: 12, color: C.muted }}>Target achieved this month:</div><div style={{ color: C.green, fontWeight: 700, fontSize: 16 }}>₹ 0.00</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 13, fontWeight: 600, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            <span>Targets</span><span>Commission Percent</span>
          </div>
          <div style={{ color: C.muted, fontSize: 13, textAlign: "center", paddingTop: 8 }}>No data</div>
        </Card>
        <Card>
          <h4 style={{ margin: "0 0 14px", color: C.text }}>🎂 Birthdays</h4>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Today</div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>No data</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Upcoming</div>
          <div style={{ color: C.muted, fontSize: 13 }}>No data</div>
        </Card>
      </div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/hrm/payroll/my")} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          💰 My Payrolls
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
        {[["👥 Users","Today","Upcoming"],["🌿 Leaves","Today","Upcoming"],["🏖️ Holidays","Today","Upcoming"]].map(([title,...subs]) => (
          <Card key={title}>
            <h4 style={{ margin: "0 0 14px", color: C.text }}>{title}</h4>
            {subs.map(s => (<div key={s} style={{ marginBottom: 12 }}><div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s}</div><div style={{ color: C.muted, fontSize: 13 }}>No data</div></div>))}
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        <Card>
          <h4 style={{ margin: "0 0 14px", color: C.text }}>📅 Today's Attendance</h4>
          <table style={{ width: "100%", fontSize: 13 }}>
            <thead><tr>{["Employee","Clock In","Clock Out"].map(h=><th key={h} style={{ textAlign:"left", paddingBottom:8, color:C.muted }}>{h}</th>)}</tr></thead>
            <tbody><tr><td colSpan={3} style={{ textAlign:"center", color:C.muted, paddingTop:12 }}>No data</td></tr></tbody>
          </table>
        </Card>
        <Card><h4 style={{ margin: "0 0 14px", color: C.text }}>🎯 Sales targets</h4><NoData /></Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ LEAVE TYPE ══════════════════════════════════════════ */
function LeaveType() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: "", maxCount: "", interval: "none" });
  const [editIdx, setEditIdx] = useState(null);
  const save = () => {
    if (!form.type) return;
    if (editIdx !== null) { setRows(r => r.map((x,i) => i===editIdx ? [form.type, form.maxCount||"—"] : x)); setEditIdx(null); }
    else setRows(r => [...r, [form.type, form.maxCount||"—"]]);
    setModal(false); setForm({ type:"", maxCount:"", interval:"none" });
  };
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>Leave Type</h2>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:16 }}>All leave types</h3>
          <Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ type:"", maxCount:"", interval:"none" }); }}>+ Add</Btn>
        </div>
        <DataTable columns={["Leave Type","Max Leave Count"]} rows={rows}
          onEdit={i => { setForm({ type:rows[i][0], maxCount:rows[i][1]==="—"?"":rows[i][1], interval:"none" }); setEditIdx(i); setModal(true); }}
          onDelete={i => setRows(r => r.filter((_,j) => j!==i))} />
      </Card>
      {modal && (
        <Modal title={editIdx!==null?"Edit Leave Type":"Add Leave Type"} onClose={() => setModal(false)}>
          <Field label="Leave Type" required><Input value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} /></Field>
          <Field label="Max Leave Count"><Input type="number" value={form.maxCount} onChange={e => setForm(f=>({...f,maxCount:e.target.value}))} /></Field>
          <Field label="Leave count interval">
            <div style={{ display:"flex", gap:20, marginTop:4 }}>
              {["Current month","Current financial year","None"].map(v => (
                <label key={v} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:14 }}>
                  <input type="radio" name="interval" checked={form.interval===v.toLowerCase().replace(" ","_")} onChange={() => setForm(f=>({...f,interval:v.toLowerCase().replace(" ","_")}))} />{v}
                </label>
              ))}
            </div>
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:10 }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══ LEAVE ══ */
function Leave() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });
  const save = () => {
    if (!form.leaveType||!form.startDate||!form.endDate) return;
    setRows(r => [...r, [`REF-${Date.now()}`, form.leaveType, form.employee||"Self", `${form.startDate} – ${form.endDate}`, form.reason, <Badge color={C.greenLight}>Pending</Badge>]]);
    setModal(false); setForm({ employee:"", leaveType:"", startDate:"", endDate:"", reason:"" });
  };
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>Leave</h2>
      <Card style={{ marginBottom:14 }}><div style={{ fontWeight:600 }}>🔽 Filters</div></Card>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:16 }}>All Leaves</h3>
          <Btn onClick={() => setModal(true)}>+ Add</Btn>
        </div>
        <DataTable columns={["Reference No","Leave Type","Employee","Date","Reason","Status"]} rows={rows} onEdit={() => {}} onDelete={i => setRows(r => r.filter((_,j) => j!==i))} />
      </Card>
      {modal && (
        <Modal title="Add Leave" onClose={() => setModal(false)}>
          <Field label="Select employee"><Input value={form.employee} onChange={e => setForm(f=>({...f,employee:e.target.value}))} /></Field>
          <Field label="Leave Type" required>
            <Select value={form.leaveType} onChange={e => setForm(f=>({...f,leaveType:e.target.value}))}>
              <option value="">Please Select</option><option>Sick Leave</option><option>Casual Leave</option><option>Annual Leave</option>
            </Select>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start Date" required><Input type="date" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} /></Field>
            <Field label="End Date" required><Input type="date" value={form.endDate} onChange={e => setForm(f=>({...f,endDate:e.target.value}))} /></Field>
          </div>
          <Field label="Reason"><Textarea value={form.reason} onChange={e => setForm(f=>({...f,reason:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={save}>Save</Btn><Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══ ATTENDANCE ══ */
function Attendance() {
  const [tab, setTab] = useState("Shifts");
  const [shifts, setShifts] = useState([{ name:"day shift", type:"Fixed shift", start:"14:36", end:"23:36", holiday:"" }]);
  const [allAtt, setAllAtt] = useState([]);
  const [clockInModal, setClockInModal] = useState(false);
  const [addShiftModal, setAddShiftModal] = useState(false);
  const [clockNote, setClockNote] = useState("");
  const [shiftForm, setShiftForm] = useState({ name:"", type:"Fixed shift", start:"", end:"", holiday:"", autoClockOut:false });
  const [editIdx, setEditIdx] = useState(null);
  const ATABS = ["Shifts","All Attendance","Attendance by shift","Attendance by date","Import Attendance"];
  const saveShift = () => {
    if (!shiftForm.name||!shiftForm.start||!shiftForm.end) return;
    const entry = { name:shiftForm.name, type:shiftForm.type, start:shiftForm.start, end:shiftForm.end, holiday:shiftForm.holiday };
    if (editIdx!==null) { setShifts(s => s.map((x,i) => i===editIdx?entry:x)); setEditIdx(null); }
    else setShifts(s => [...s, entry]);
    setAddShiftModal(false); setShiftForm({ name:"", type:"Fixed shift", start:"", end:"", holiday:"", autoClockOut:false });
  };
  return (
    <div>
      <HRMNav />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ margin:0 }}>Attendance</h2>
        <button onClick={() => setClockInModal(true)} style={{ background:"#2b6cb0", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", cursor:"pointer", fontWeight:700 }}>⬇ Clock In</button>
      </div>
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${C.border}`, marginBottom:20, overflowX:"auto" }}>
        {ATABS.map(t => (<button key={t} onClick={() => setTab(t)} style={{ padding:"10px 16px", border:"none", background:"none", cursor:"pointer", fontWeight:tab===t?700:500, color:tab===t?C.green:C.muted, borderBottom:tab===t?`3px solid ${C.green}`:"3px solid transparent", fontSize:13, whiteSpace:"nowrap" }}>{t}</button>))}
      </div>
      {tab==="Shifts" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
            <Btn onClick={() => { setAddShiftModal(true); setEditIdx(null); }}>+ Add</Btn>
          </div>
          <DataTable columns={["Name","Shift Type","Start time","End time","Holiday"]}
            rows={shifts.map(s => [s.name, s.type, s.start, s.end, s.holiday||"—"])}
            onEdit={i => { setShiftForm({...shifts[i], autoClockOut:false}); setEditIdx(i); setAddShiftModal(true); }}
            onDelete={i => setShifts(s => s.filter((_,j) => j!==i))}
            extraActions={i => (<button style={{ padding:"4px 12px", background:"#e6fffa", color:C.green, border:"none", borderRadius:5, cursor:"pointer", fontWeight:600, fontSize:12 }}>👥 Assign Users</button>)}
          />
        </Card>
      )}
      {tab==="All Attendance" && (<Card><DataTable columns={["Employee","Date","Clock In","Note"]} rows={allAtt.map(a=>[a.emp,a.date,a.time,a.note||"—"])} onEdit={() => {}} onDelete={i => setAllAtt(a => a.filter((_,j) => j!==i))} /></Card>)}
      {["Attendance by shift","Attendance by date","Import Attendance"].includes(tab) && (<Card><NoData /></Card>)}
      {clockInModal && (
        <Modal title="Clock In" onClose={() => setClockInModal(false)}>
          <p style={{ color:C.muted, fontSize:14 }}>IP Address: 117.200.179.60</p>
          <Field label="Clock in note:"><Textarea value={clockNote} onChange={e => setClockNote(e.target.value)} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={() => { setAllAtt(a => [...a, { emp:"Admin", time:new Date().toLocaleTimeString(), note:clockNote, date:new Date().toLocaleDateString() }]); setClockInModal(false); setClockNote(""); }}>Submit</Btn>
            <Btn variant="dark" onClick={() => setClockInModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
      {addShiftModal && (
        <Modal title="Add Shift" onClose={() => setAddShiftModal(false)}>
          <Field label="Name" required><Input value={shiftForm.name} onChange={e => setShiftForm(f=>({...f,name:e.target.value}))} /></Field>
          <Field label="Shift Type" required>
            <Select value={shiftForm.type} onChange={e => setShiftForm(f=>({...f,type:e.target.value}))}>
              <option>Fixed shift</option><option>Flexible shift</option><option>Rotating shift</option>
            </Select>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start time" required><Input type="time" value={shiftForm.start} onChange={e => setShiftForm(f=>({...f,start:e.target.value}))} /></Field>
            <Field label="End time" required><Input type="time" value={shiftForm.end} onChange={e => setShiftForm(f=>({...f,end:e.target.value}))} /></Field>
          </div>
          <Field label="Holiday"><Input value={shiftForm.holiday} onChange={e => setShiftForm(f=>({...f,holiday:e.target.value}))} /></Field>
          <label style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, cursor:"pointer", fontSize:14 }}>
            <input type="checkbox" checked={shiftForm.autoClockOut} onChange={e => setShiftForm(f=>({...f,autoClockOut:e.target.checked}))} />Do auto clock out ℹ️
          </label>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={saveShift}>Submit</Btn><Btn variant="dark" onClick={() => setAddShiftModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══ PAYROLL ══ */
function Payroll() {
  const [tab, setTab] = useState("All Payrolls");
  const [modal, setModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ location:"All locations", employee:"", month:"" });
  const [payComponents, setPayComponents] = useState([]);
  const [compModal, setCompModal] = useState(false);
  const [compForm, setCompForm] = useState({ desc:"", type:"Earning", amount:"", date:"" });
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>Payroll</h2>
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${C.border}`, marginBottom:20 }}>
        {["All Payrolls","All payroll groups","Pay Components"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"10px 18px", border:"none", background:"none", cursor:"pointer", fontWeight:tab===t?700:500, color:tab===t?C.green:C.muted, borderBottom:tab===t?`3px solid ${C.green}`:"3px solid transparent", fontSize:14 }}>{t}</button>
        ))}
      </div>
      {tab==="All Payrolls" && (<Card><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}><Btn onClick={() => setModal(true)}>+ Add</Btn></div><DataTable columns={["Employee","Department","Designation","Month/Year","Reference No","Total amount","Payment Status"]} rows={rows} onEdit={() => {}} onDelete={i => setRows(r => r.filter((_,j) => j!==i))} /></Card>)}
      {tab==="All payroll groups" && <Card><NoData /></Card>}
      {tab==="Pay Components" && (<Card><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}><Btn onClick={() => setCompModal(true)}>+ Add</Btn></div><DataTable columns={["Description","Type","Amount","Applicable Date"]} rows={payComponents.map(c=>[c.desc,c.type,`₹${c.amount}`,c.date])} onEdit={() => {}} onDelete={i => setPayComponents(p => p.filter((_,j) => j!==i))} /></Card>)}
      {modal && (
        <Modal title="Add Payroll" onClose={() => setModal(false)}>
          <Field label="Location" required><Select value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))}><option>All locations</option><option>Manodtechnologies</option></Select></Field>
          <Field label="Employee" required><Input value={form.employee} onChange={e => setForm(f=>({...f,employee:e.target.value}))} /></Field>
          <Field label="Month/Year" required><Input type="month" value={form.month} onChange={e => setForm(f=>({...f,month:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={() => { if(form.employee&&form.month){ setRows(r=>[...r,[form.employee,"Sales","Sales",form.month,`REF-${Date.now()}`,"₹0.00",<Badge color={C.greenLight}>Pending</Badge>]]); setModal(false); } }}>Proceed</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
      {compModal && (
        <Modal title="Add Pay Component" onClose={() => setCompModal(false)}>
          <Field label="Description"><Input value={compForm.desc} onChange={e => setCompForm(f=>({...f,desc:e.target.value}))} /></Field>
          <Field label="Type"><Select value={compForm.type} onChange={e => setCompForm(f=>({...f,type:e.target.value}))}><option>Earning</option><option>Deduction</option></Select></Field>
          <Field label="Amount"><Input type="number" value={compForm.amount} onChange={e => setCompForm(f=>({...f,amount:e.target.value}))} /></Field>
          <Field label="Applicable Date"><Input type="date" value={compForm.date} onChange={e => setCompForm(f=>({...f,date:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={() => { if(compForm.desc){ setPayComponents(p=>[...p,compForm]); setCompModal(false); setCompForm({ desc:"", type:"Earning", amount:"", date:"" }); } }}>Save</Btn>
            <Btn variant="dark" onClick={() => setCompModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MyPayrolls() {
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>My Payrolls</h2>
      <Card><NoData /></Card>
    </div>
  );
}

/* ══ HOLIDAY ══ */
function Holiday() {
  const [rows, setRows] = useState([{ name:"shalijah", start:"05/27/2026", end:"05/28/2026", days:2, location:"Manodtechnologies", note:"" }]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:"", startDate:"", endDate:"", location:"All", note:"" });
  const [editIdx, setEditIdx] = useState(null);
  const save = () => {
    if (!form.name||!form.startDate||!form.endDate) return;
    const s=new Date(form.startDate), e=new Date(form.endDate);
    const days=Math.max(1,Math.round((e-s)/86400000)+1);
    const entry={ name:form.name, start:form.startDate, end:form.endDate, days, location:form.location||"All", note:form.note };
    if (editIdx!==null) { setRows(r=>r.map((x,i)=>i===editIdx?entry:x)); setEditIdx(null); }
    else setRows(r=>[...r,entry]);
    setModal(false); setForm({ name:"", startDate:"", endDate:"", location:"All", note:"" });
  };
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>Holiday</h2>
      <Card style={{ marginBottom:14 }}><div style={{ fontWeight:600 }}>🔽 Filters</div></Card>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:16 }}>All Holidays</h3>
          <Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ name:"", startDate:"", endDate:"", location:"All", note:"" }); }}>+ Add</Btn>
        </div>
        <DataTable columns={["Name","Date","Business Location","Note"]} rows={rows.map(r=>[r.name,`${r.start} – ${r.end} (${r.days}Days)`,r.location,r.note||"—"])}
          onEdit={i => { const r=rows[i]; setForm({ name:r.name, startDate:r.start, endDate:r.end, location:r.location, note:r.note }); setEditIdx(i); setModal(true); }}
          onDelete={i => setRows(r=>r.filter((_,j)=>j!==i))} />
      </Card>
      {modal && (
        <Modal title="Add Holiday" onClose={() => setModal(false)}>
          <Field label="Name" required><Input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start Date" required><Input type="date" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} /></Field>
            <Field label="End Date" required><Input type="date" value={form.endDate} onChange={e => setForm(f=>({...f,endDate:e.target.value}))} /></Field>
          </div>
          <Field label="Business Location:"><Select value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))}><option>All</option><option>Manodtechnologies</option></Select></Field>
          <Field label="Note:"><Textarea value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={save}>Save</Btn><Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══ DEPARTMENTS ══ */
function Departments() {
  const [rows, setRows] = useState([{ dept:"sales", id:"sales", desc:"sales" },{ dept:"Digital Marketing", id:"", desc:"" }]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ dept:"", id:"", desc:"" });
  const [editIdx, setEditIdx] = useState(null);
  const save = () => {
    if (!form.dept) return;
    if (editIdx!==null) { setRows(r=>r.map((x,i)=>i===editIdx?form:x)); setEditIdx(null); }
    else setRows(r=>[...r,form]);
    setModal(false); setForm({ dept:"", id:"", desc:"" });
  };
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>Departments</h2>
      <Card>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}><Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ dept:"", id:"", desc:"" }); }}>+ Add</Btn></div>
        <DataTable columns={["Department","Department ID","Description"]} rows={rows.map(r=>[r.dept,r.id||"—",r.desc||"—"])}
          onEdit={i => { setForm(rows[i]); setEditIdx(i); setModal(true); }} onDelete={i => setRows(r=>r.filter((_,j)=>j!==i))} />
      </Card>
      {modal && (
        <Modal title="Add Department" onClose={() => setModal(false)}>
          <Field label="Department" required><Input value={form.dept} onChange={e => setForm(f=>({...f,dept:e.target.value}))} /></Field>
          <Field label="Department ID:"><Input value={form.id} onChange={e => setForm(f=>({...f,id:e.target.value}))} /></Field>
          <Field label="Description:"><Textarea value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={save}>Save</Btn><Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══ DESIGNATIONS ══ */
function Designations() {
  const [rows, setRows] = useState([{ desig:"sales", desc:"sales" }]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desig:"", desc:"" });
  const [editIdx, setEditIdx] = useState(null);
  const save = () => {
    if (!form.desig) return;
    if (editIdx!==null) { setRows(r=>r.map((x,i)=>i===editIdx?form:x)); setEditIdx(null); }
    else setRows(r=>[...r,form]);
    setModal(false); setForm({ desig:"", desc:"" });
  };
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>Designations</h2>
      <Card>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}><Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ desig:"", desc:"" }); }}>+ Add</Btn></div>
        <DataTable columns={["Designation","Description"]} rows={rows.map(r=>[r.desig,r.desc||"—"])}
          onEdit={i => { setForm(rows[i]); setEditIdx(i); setModal(true); }} onDelete={i => setRows(r=>r.filter((_,j)=>j!==i))} />
      </Card>
      {modal && (
        <Modal title={editIdx!==null?"Edit Designation":"Add Designation"} onClose={() => setModal(false)}>
          <Field label="Designation" required><Input value={form.desig} onChange={e => setForm(f=>({...f,desig:e.target.value}))} /></Field>
          <Field label="Description:"><Textarea value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={save}>Save</Btn><Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══ SALES TARGETS ══ */
function SalesTargets() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ user:"", target:"", commission:"", month:"" });
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>Sales Targets</h2>
      <Card>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}><Btn onClick={() => setModal(true)}>+ Add</Btn></div>
        <DataTable columns={["User","Target","Commission %","Month/Year"]} rows={rows} onEdit={() => {}} onDelete={i => setRows(r=>r.filter((_,j)=>j!==i))} />
      </Card>
      {modal && (
        <Modal title="Add Sales Target" onClose={() => setModal(false)}>
          <Field label="User" required><Input value={form.user} onChange={e => setForm(f=>({...f,user:e.target.value}))} /></Field>
          <Field label="Target Amount" required><Input type="number" value={form.target} onChange={e => setForm(f=>({...f,target:e.target.value}))} /></Field>
          <Field label="Commission %"><Input type="number" value={form.commission} onChange={e => setForm(f=>({...f,commission:e.target.value}))} /></Field>
          <Field label="Month/Year"><Input type="month" value={form.month} onChange={e => setForm(f=>({...f,month:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn onClick={() => { if(form.user&&form.target){ setRows(r=>[...r,[form.user,`₹${form.target}`,`${form.commission}%`,form.month]]); setModal(false); setForm({ user:"", target:"", commission:"", month:"" }); } }}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══ HRM SETTINGS ══ */
function HRMSettings() {
  const [form, setForm] = useState({ workDays:"5", workHours:"8", overtimeRate:"1.5", currency:"INR", payslipNote:"", leaveApproval:"manager", attendanceMode:"manual" });
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom:16 }}>HRM Settings</h2>
      <Card style={{ maxWidth:700 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Working Days per Week"><Select value={form.workDays} onChange={e => setForm(f=>({...f,workDays:e.target.value}))}>{["5","6","7"].map(v=><option key={v}>{v}</option>)}</Select></Field>
          <Field label="Working Hours per Day"><Input type="number" value={form.workHours} onChange={e => setForm(f=>({...f,workHours:e.target.value}))} /></Field>
          <Field label="Overtime Rate Multiplier"><Input type="number" step="0.1" value={form.overtimeRate} onChange={e => setForm(f=>({...f,overtimeRate:e.target.value}))} /></Field>
          <Field label="Currency"><Select value={form.currency} onChange={e => setForm(f=>({...f,currency:e.target.value}))}>{["INR","USD","EUR","GBP"].map(v=><option key={v}>{v}</option>)}</Select></Field>
          <Field label="Leave Approval"><Select value={form.leaveApproval} onChange={e => setForm(f=>({...f,leaveApproval:e.target.value}))}><option value="manager">Manager Approval</option><option value="hr">HR Approval</option><option value="auto">Auto Approve</option></Select></Field>
          <Field label="Attendance Mode"><Select value={form.attendanceMode} onChange={e => setForm(f=>({...f,attendanceMode:e.target.value}))}><option value="manual">Manual Clock In/Out</option><option value="biometric">Biometric</option><option value="gps">GPS Based</option></Select></Field>
        </div>
        <Field label="Payslip Footer Note"><Textarea value={form.payslipNote} onChange={e => setForm(f=>({...f,payslipNote:e.target.value}))} /></Field>
        <div style={{ display:"flex", gap:10, alignItems:"center", marginTop:8 }}>
          <Btn onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2000); }} variant="green">💾 Save Settings</Btn>
          {saved && <span style={{ color:C.green, fontSize:13, fontWeight:600 }}>✓ Saved!</span>}
        </div>
      </Card>
    </div>
  );
}

const FONT_HEAD = "'DM Sans', 'Nunito', sans-serif";
const FONT_BODY = "'Inter', 'Segoe UI', sans-serif";
const GREEN      = "#1a6b3c";
const GREEN2     = "#28a745";
const GREEN_LITE = "#e8f5ee";
const NAVY       = "#0f2027";
const BTN_GRAD   = "linear-gradient(135deg,#1a6b3c 0%,#22c55e 100%)";
const SHADOW     = "0 2px 12px rgba(26,107,60,.10)";

/* ─── Sample / Mock Data ─── */
const SAMPLE_TODOS = [
  { addedOn:"08/06/2026", taskId:"TASK-001", task:"Reconcile Q2 purchase invoices",    status:"In Progress",  startDate:"2026-06-01", endDate:"2026-06-10", hours:"6",  assignedBy:"Admin",   assignedTo:"Priya S.",   priority:"High",   action:"" },
  { addedOn:"07/06/2026", taskId:"TASK-002", task:"Update product pricing list",        status:"Not Started",  startDate:"2026-06-08", endDate:"2026-06-15", hours:"3",  assignedBy:"Admin",   assignedTo:"Rahul M.",   priority:"Medium", action:"" },
  { addedOn:"06/06/2026", taskId:"TASK-003", task:"Audit warehouse stock levels",       status:"Completed",    startDate:"2026-06-03", endDate:"2026-06-06", hours:"8",  assignedBy:"Manager", assignedTo:"Ananya K.",  priority:"High",   action:"" },
  { addedOn:"05/06/2026", taskId:"TASK-004", task:"Send supplier payment reminders",   status:"Completed",    startDate:"2026-06-05", endDate:"2026-06-05", hours:"1",  assignedBy:"Admin",   assignedTo:"Vikram T.",  priority:"Low",    action:"" },
  { addedOn:"04/06/2026", taskId:"TASK-005", task:"Prepare monthly expense report",    status:"In Progress",  startDate:"2026-06-04", endDate:"2026-06-12", hours:"5",  assignedBy:"Admin",   assignedTo:"Priya S.",   priority:"Medium", action:"" },
  { addedOn:"03/06/2026", taskId:"TASK-006", task:"Review and approve new sales orders",status:"Not Started", startDate:"2026-06-09", endDate:"2026-06-09", hours:"2",  assignedBy:"Manager", assignedTo:"Rahul M.",   priority:"High",   action:"" },
  { addedOn:"02/06/2026", taskId:"TASK-007", task:"Update CRM customer records",       status:"In Progress",  startDate:"2026-06-02", endDate:"2026-06-11", hours:"4",  assignedBy:"Admin",   assignedTo:"Deepa R.",   priority:"Low",    action:"" },
];

const SAMPLE_DOCS = [
  { name:"Q2_Purchase_Invoice_Bundle.pdf",    description:"All purchase invoices for April–June 2026",      uploadedDate:"07/06/2026", action:"" },
  { name:"Warehouse_Audit_Report_June.xlsx",  description:"Stock audit results – Main warehouse",           uploadedDate:"06/06/2026", action:"" },
  { name:"Supplier_Contracts_2026.zip",       description:"Signed contracts with top 10 suppliers",         uploadedDate:"04/06/2026", action:"" },
  { name:"Employee_Onboarding_Docs.pdf",      description:"HR onboarding package for new hires",            uploadedDate:"01/06/2026", action:"" },
  { name:"Brand_Guidelines_v3.pdf",           description:"Updated visual brand identity guidelines",        uploadedDate:"28/05/2026", action:"" },
  { name:"Tax_Filing_May2026.pdf",            description:"GST and income tax filing documents for May",     uploadedDate:"20/05/2026", action:"" },
];

const SAMPLE_MEMOS = [
  { heading:"New POS Terminal Policy",          description:"All branches must validate receipts via the new POS system from July 1st. Paper receipts are no longer valid.",              createdDate:"08/06/2026", action:"" },
  { heading:"Q3 Sales Target Announcement",     description:"The Q3 target has been set at ₹42L across all regions. Branch managers to review and cascade to their teams.",               createdDate:"07/06/2026", action:"" },
  { heading:"Inventory Freeze – June 30",       description:"No stock transfers or adjustments to be made on June 30 due to year-end audit. Plan accordingly.",                           createdDate:"05/06/2026", action:"" },
  { heading:"Office Renovation Schedule",       description:"Head office 2nd floor will be under renovation June 20–25. Remote work approved for affected teams during this period.",     createdDate:"03/06/2026", action:"" },
  { heading:"Updated Leave Policy",             description:"Casual leave can now be applied 24hrs in advance instead of 48hrs. Refer to the updated HR policy document for details.",    createdDate:"01/06/2026", action:"" },
];

const SAMPLE_EVENTS = [
  { name:"Board Review Meeting", date:"2026-06-10", startTime:"10:00", endTime:"12:00", repeat:"One time" },
  { name:"Monthly Payroll Run",  date:"2026-06-15", startTime:"09:00", endTime:"10:00", repeat:"Monthly"  },
  { name:"Team Standup",         date:"2026-06-09", startTime:"09:30", endTime:"09:45", repeat:"Daily"    },
  { name:"Supplier Call – Arjun Traders", date:"2026-06-11", startTime:"14:00", endTime:"15:00", repeat:"One time" },
  { name:"Stock Audit Deadline", date:"2026-06-20", startTime:"17:00", endTime:"17:00", repeat:"One time" },
  { name:"Q2 Closing",           date:"2026-06-30", startTime:"18:00", endTime:"18:00", repeat:"Monthly"  },
];

const SAMPLE_MESSAGES = [
  { text:"Warehouse stock report ready for review.",           time:"09:05 AM", sender:"system" },
  { text:"Please check the new supplier invoice in Documents.", time:"09:18 AM", sender:"system" },
  { text:"Stock audit completed – no discrepancies found.",    time:"10:30 AM", sender:"self"   },
  { text:"Q2 targets updated in the sales dashboard.",         time:"11:00 AM", sender:"self"   },
  { text:"Reminder: team meeting at 3 PM today.",              time:"02:45 PM", sender:"system" },
];

const SAMPLE_KB = [
  { title:"How to Process a Purchase Return",     content:"Navigate to Purchases › Purchase Return, click Add, select the original invoice...", share:"Public",  date:"05/06/2026" },
  { title:"Stock Transfer SOP",                   content:"Raise a transfer request in Stock Transfers module. Branch manager must approve within 24 hrs...", share:"Team", date:"01/06/2026" },
  { title:"Month-End Closing Checklist",          content:"1. Reconcile all invoices. 2. Run stock audit. 3. Export P&L report. 4. Archive documents...", share:"Private", date:"28/05/2026" },
  { title:"Adding a New Supplier",                content:"Go to Contacts › Suppliers, click + Add. Fill mandatory fields: Name, GST No., Payment Terms...", share:"Public", date:"20/05/2026" },
];

/* ─── Inject global styles once ─── */
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const s = document.createElement("style");
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

    .ess-wrap { font-family:${FONT_BODY}; color:#222; }

    /* ── Tab bar ── */
    .ess-tabs { display:flex; gap:0; border-bottom:2px solid #e4ebe7; background:#fff;
                 padding:0 10px; flex-wrap:wrap; }
    .ess-tab  { padding:13px 18px; font-size:13.5px; font-weight:600; color:#6b7280; cursor:pointer;
                 border:none; background:none; border-bottom:3px solid transparent; margin-bottom:-2px;
                 transition:.2s; font-family:${FONT_BODY}; letter-spacing:.01em; }
    .ess-tab:hover { color:${GREEN}; }
    .ess-tab.active { color:${GREEN}; border-bottom-color:${GREEN}; background:${GREEN_LITE}; border-radius:6px 6px 0 0; }

    /* ── Page header ── */
    .ess-title { font-size:21px; font-weight:700; color:#111827; font-family:${FONT_HEAD}; letter-spacing:-.02em; }
    .ess-sub   { font-size:13px; color:#9ca3af; margin-top:2px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }

    /* ── Cards ── */
    .ess-card { background:#fff; border-radius:12px; box-shadow:${SHADOW}; padding:20px; margin-bottom:18px; border:1px solid #f0f4f1; }

    /* ── Buttons ── */
    .btn-add { background:${BTN_GRAD}; color:#fff; border:none; border-radius:8px;
                padding:10px 22px; font-size:13.5px; font-weight:600; cursor:pointer;
                display:inline-flex; align-items:center; gap:6px; font-family:${FONT_BODY};
                box-shadow:0 3px 12px rgba(26,107,60,.30); transition:.2s; letter-spacing:.01em; }
    .btn-add:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(26,107,60,.40); }
    .btn-save { background:${BTN_GRAD}; color:#fff; border:none; border-radius:8px;
                 padding:10px 28px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:${FONT_BODY}; transition:.2s; }
    .btn-save:hover { opacity:.9; }
    .btn-cancel { background:#374151; color:#fff; border:none; border-radius:8px;
                   padding:10px 22px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:${FONT_BODY}; transition:.2s; }
    .btn-cancel:hover { background:#1f2937; }

    /* ── Export bar ── */
    .export-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
    .exp-btn { border:1px solid #d1d5db; background:#fff; border-radius:7px; padding:7px 13px;
                font-size:13px; font-weight:500; cursor:pointer; display:inline-flex;
                align-items:center; gap:5px; font-family:${FONT_BODY}; transition:.15s; color:#374151; }
    .exp-btn:hover { background:#f9fafb; }
    .exp-btn.csv   { color:#1a6b3c; border-color:#1a6b3c; }
    .exp-btn.excel { color:#217346; border-color:#217346; }
    .exp-btn.pdf   { color:#dc2626; border-color:#dc2626; }
    .exp-btn.print { color:#4b5563; border-color:#9ca3af; }
    .exp-btn.col   { color:#7c3aed; border-color:#7c3aed; }

    /* ── Table ── */
    .ess-table { width:100%; border-collapse:collapse; font-size:13.5px; }
    .ess-table th { background:#f8faf9; color:#374151; font-weight:600; padding:11px 14px;
                     text-align:left; border-bottom:2px solid #e5e7eb; white-space:nowrap; font-family:${FONT_HEAD}; font-size:13px; }
    .ess-table td { padding:11px 14px; border-bottom:1px solid #f3f4f6; color:#374151; vertical-align:middle; }
    .ess-table tr:hover td { background:#f0faf4; }
    .no-data { text-align:center; color:#9ca3af; padding:40px; font-size:14px; }

    /* ── Show entries & search ── */
    .show-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#6b7280; margin-bottom:10px; }
    .show-row select { border:1px solid #d1d5db; border-radius:6px; padding:4px 8px; font-family:${FONT_BODY}; font-size:13px; }
    .tbl-search { border:1px solid #d1d5db; border-radius:7px; padding:8px 13px; font-family:${FONT_BODY};
                   font-size:13px; width:200px; outline:none; transition:.2s; }
    .tbl-search:focus { border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.10); }
    .tbl-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px; }

    /* ── Form fields ── */
    .form-group { margin-bottom:16px; }
    .form-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:5px; display:block; letter-spacing:.01em; }
    .form-control { width:100%; border:1px solid #d1d5db; border-radius:8px; padding:9px 13px;
                     font-family:${FONT_BODY}; font-size:13.5px; box-sizing:border-box; color:#111827; transition:.2s; }
    .form-control:focus { outline:none; border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.12); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

    /* ── Filter bar ── */
    .filter-bar { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:16px; }
    .filter-title { font-size:14px; font-weight:700; color:${GREEN}; margin-bottom:12px; display:flex; align-items:center; gap:6px; font-family:${FONT_HEAD}; }

    /* ── Priority/Status badges ── */
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

    /* ── Modal ── */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.50); z-index:1000;
                      display:flex; align-items:center; justify-content:center; }
    .modal-box { background:#fff; border-radius:14px; padding:28px; width:560px; max-width:95vw;
                  max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.20); }
    .modal-title { font-size:18px; font-weight:700; color:#111827; margin-bottom:20px;
                    display:flex; justify-content:space-between; align-items:center; font-family:${FONT_HEAD}; }
    .modal-close { background:none; border:none; font-size:22px; cursor:pointer; color:#9ca3af; line-height:1; }
    .modal-close:hover { color:#374151; }

    /* ── Calendar ── */
    .cal-wrap { background:#fff; border-radius:12px; padding:22px; }
    .cal-nav  { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
    .cal-nav button { border:1px solid #d1d5db; background:#fff; border-radius:7px; padding:5px 13px;
                       cursor:pointer; font-family:${FONT_BODY}; font-size:13px; transition:.15s; }
    .cal-nav button:hover { background:#f3f4f6; }
    .cal-month { font-size:19px; font-weight:700; color:${GREEN}; flex:1; text-align:center; font-family:${FONT_HEAD}; }
    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); border-left:1px solid #e5e7eb; border-top:1px solid #e5e7eb; }
    .cal-day-hdr { text-align:center; font-weight:600; font-size:12.5px; color:#6b7280;
                    padding:9px 0; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb;
                    background:#f8faf9; font-family:${FONT_HEAD}; }
    .cal-cell { min-height:88px; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb;
                 padding:6px 8px; font-size:13px; color:#374151; vertical-align:top; }
    .cal-cell.today { background:#f0fdf4; }
    .cal-cell.empty { background:#fafafa; color:#d1d5db; }
    .cal-date-num { font-weight:600; font-size:13px; }

    /* ── Messages ── */
    .msg-area { min-height:320px; padding:20px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; }
    .msg-bubble { padding:10px 14px; border-radius:12px; max-width:72%; font-size:13.5px; line-height:1.5; }
    .msg-bubble.self   { background:${GREEN}; color:#fff; align-self:flex-end; border-bottom-right-radius:3px; }
    .msg-bubble.system { background:#f3f4f6; color:#374151; align-self:flex-start; border-bottom-left-radius:3px; }
    .msg-time { font-size:11px; opacity:.65; margin-top:3px; }
    .msg-input-row { display:flex; gap:8px; padding:12px 16px; border-top:1px solid #f3f4f6; background:#fff; border-radius:0 0 12px 12px; }
    .msg-input { flex:1; border:1px solid #d1d5db; border-radius:8px; padding:10px 14px;
                  font-family:${FONT_BODY}; font-size:13.5px; outline:none; transition:.2s; }
    .msg-input:focus { border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.10); }
    .msg-send { background:${BTN_GRAD}; color:#fff; border:none; border-radius:8px;
                 padding:10px 18px; font-size:20px; cursor:pointer; line-height:1; }

    /* ── Rich text mock ── */
    .rich-toolbar { border:1px solid #d1d5db; border-radius:8px 8px 0 0; background:#f9fafb;
                     padding:8px 12px; display:flex; gap:6px; flex-wrap:wrap; }
    .rich-btn { background:#fff; border:1px solid #d1d5db; border-radius:5px; padding:3px 9px;
                 font-size:12px; cursor:pointer; font-family:${FONT_BODY}; transition:.15s; }
    .rich-btn:hover { background:#f3f4f6; }
    .rich-area { border:1px solid #d1d5db; border-top:none; border-radius:0 0 8px 8px;
                  min-height:130px; padding:12px; font-family:${FONT_BODY}; font-size:13.5px;
                  width:100%; box-sizing:border-box; resize:vertical; outline:none; transition:.2s; }
    .rich-area:focus { border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.10); }

    /* ── Dropzone ── */
    .dropzone { border:2px dashed #d1d5db; border-radius:10px; padding:36px; text-align:center;
                 color:#9ca3af; font-size:14px; cursor:pointer; transition:.2s; }
    .dropzone:hover { border-color:${GREEN}; color:${GREEN}; background:#f0fdf4; }

    /* ── KB cards ── */
    .kb-card { border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:12px; transition:.2s; }
    .kb-card:hover { border-color:${GREEN}; box-shadow:0 4px 12px rgba(26,107,60,.10); }

    /* ── Settings sidebar ── */
    .settings-sidebar { background:#f8faf9; border-right:1px solid #e5e7eb; min-width:160px; border-radius:12px 0 0 12px; }
    .settings-tab { padding:13px 20px; cursor:pointer; font-weight:600; font-size:13.5px;
                     transition:.2s; border-bottom:1px solid #e9ecef; font-family:${FONT_BODY}; }
    .settings-tab:hover { background:#e8f5ee; color:${GREEN}; }
    .settings-tab.active { background:${GREEN}; color:#fff; }

    /* ── Pagination ── */
    .pag-btn { border:1px solid #d1d5db; background:#fff; border-radius:6px; padding:6px 13px;
                font-size:13px; cursor:pointer; font-family:${FONT_BODY}; transition:.15s; }
    .pag-btn:hover { background:#f3f4f6; }

    /* ── Action icon buttons ── */
    .act-btn { background:none; border:none; cursor:pointer; padding:4px 6px; border-radius:5px; font-size:15px; transition:.15s; }
    .act-btn:hover { background:#f3f4f6; }
  `;
  document.head.appendChild(s);
}

/* ─── Export Bar ─── */
function EssExportBar({ data = [], columns = [], filename = "export" }) {
  const toCSV = () => {
    const header = columns.map(c => c.label).join(",");
    const rows   = data.map(row => columns.map(c => `"${row[c.key] ?? ""}"`).join(","));
    const blob   = new Blob([[header, ...rows].join("\n")], { type:"text/csv" });
    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download:`${filename}.csv`
    }).click();
  };
  const toPrint = () => {
    const w = window.open("", "_blank");
    const hdrs = columns.map(c => `<th style="border:1px solid #ccc;padding:8px">${c.label}</th>`).join("");
    const rows = data.map(row =>
      `<tr>${columns.map(c => `<td style="border:1px solid #ccc;padding:8px">${row[c.key]??""}</td>`).join("")}</tr>`
    ).join("");
    w.document.write(`<html><head><title>${filename}</title><style>body{font-family:sans-serif;font-size:13px}table{border-collapse:collapse;width:100%}</style></head><body><h2>${filename}</h2><table><thead><tr>${hdrs}</tr></thead><tbody>${rows}</tbody></table></body></html>`);
    w.print();
  };
  const [showCols, setShowCols] = useState(false);
  const [visible,  setVisible]  = useState(() => Object.fromEntries(columns.map(c => [c.key, true])));
  return (
    <div className="export-bar">
      <button className="exp-btn csv"   onClick={toCSV}>   📄 CSV   </button>
      <button className="exp-btn excel" onClick={toCSV}>   📊 Excel </button>
      <button className="exp-btn print" onClick={toPrint}> 🖨 Print  </button>
      <div style={{ position:"relative" }}>
        <button className="exp-btn col" onClick={() => setShowCols(v => !v)}>⠿ Columns</button>
        {showCols && (
          <div style={{ position:"absolute", top:"110%", left:0, background:"#fff", border:"1px solid #e5e7eb",
                         borderRadius:10, padding:14, zIndex:100, minWidth:190, boxShadow:"0 8px 24px rgba(0,0,0,.12)" }}>
            {columns.map(c => (
              <label key={c.key} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:7, fontSize:13, cursor:"pointer" }}>
                <input type="checkbox" checked={!!visible[c.key]} onChange={() => setVisible(v => ({ ...v, [c.key]: !v[c.key] }))} />
                {c.label}
              </label>
            ))}
          </div>
        )}
      </div>
      <button className="exp-btn pdf" onClick={toPrint}>📑 PDF</button>
    </div>
  );
}

/* ─── DataTable ─── */
function EssDataTable({ columns, data, emptyMsg = "No data available in table" }) {
  const [q,    setQ]    = useState("");
  const [show, setShow] = useState(25);
  const [page, setPage] = useState(1);
  const filtered = data.filter(row =>
    columns.some(c => String(row[c.key] ?? "").toLowerCase().includes(q.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / show);
  const shown      = filtered.slice((page-1)*show, page*show);
  return (
    <>
      <div className="tbl-top">
        <div className="show-row">
          Show <select value={show} onChange={e => { setShow(+e.target.value); setPage(1); }}>
            {[10,25,50,100].map(n => <option key={n}>{n}</option>)}
          </select> entries
        </div>
        <EssExportBar data={data} columns={columns} />
        <input className="tbl-search" placeholder="Search..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
      </div>
      <div style={{ overflowX:"auto" }}>
        <table className="ess-table">
          <thead>
            <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {shown.length === 0
              ? <tr><td colSpan={columns.length} className="no-data">{emptyMsg}</td></tr>
              : shown.map((row, i) => (
                  <tr key={i}>{columns.map(c => <td key={c.key}>{row[c.key]}</td>)}</tr>
                ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, fontSize:13, color:"#6b7280" }}>
        <span>Showing {shown.length === 0 ? 0 : (page-1)*show+1} to {Math.min(page*show, filtered.length)} of {filtered.length} entries</span>
        <div style={{ display:"flex", gap:6 }}>
          <button className="pag-btn" disabled={page===1} onClick={() => setPage(p => p-1)}>← Prev</button>
          {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p => (
            <button key={p} className="pag-btn" onClick={() => setPage(p)}
              style={{ background: p===page ? GREEN : "#fff", color: p===page ? "#fff" : "#374151", borderColor: p===page ? GREEN : "#d1d5db" }}>
              {p}
            </button>
          ))}
          <button className="pag-btn" disabled={page===totalPages||totalPages===0} onClick={() => setPage(p => p+1)}>Next →</button>
        </div>
      </div>
    </>
  );
}

/* ─── Filter Bar ─── */
function EssFilterBar({ filters }) {
  return (
    <div className="filter-bar">
      <div className="filter-title">▼ Filters</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
        {filters.map(f => (
          <div key={f.label}>
            <label className="form-label">{f.label}:</label>
            <select className="form-control" defaultValue="All">
              {(f.options || ["All"]).map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Rich Text Area mock ─── */
function EssRichTextArea({ value, onChange }) {
  return (
    <>
      <div className="rich-toolbar">
        {["B","I","U","≡","⊞","⊟","🔗"].map(b => <button key={b} className="rich-btn">{b}</button>)}
        <span style={{ fontSize:11, color:"#9ca3af", marginLeft:"auto", alignSelf:"center" }}>Rich Text</span>
      </div>
      <textarea className="rich-area" value={value} onChange={e => onChange(e.target.value)} placeholder="Write here..." />
    </>
  );
}

/* ═══════════════════════════════ TO DO PAGE ═══════════════════════════════ */
const TODO_COLS = [
  { key:"addedOn",    label:"Added On"        },
  { key:"taskId",     label:"Task ID"         },
  { key:"task",       label:"Task"            },
  { key:"priority",   label:"Priority"        },
  { key:"statusBadge",label:"Status"          },
  { key:"startDate",  label:"Start Date"      },
  { key:"endDate",    label:"End Date"        },
  { key:"hours",      label:"Est. Hours"      },
  { key:"assignedBy", label:"Assigned By"     },
  { key:"assignedTo", label:"Assigned To"     },
  { key:"actions",    label:"Actions"         },
];

function priorityBadge(p) {
  const cls = { High:"badge-high", Medium:"badge-medium", Low:"badge-low" }[p] || "badge-wait";
  return <span className={`badge ${cls}`}>{p}</span>;
}
function statusBadge(s) {
  const cls = { Completed:"badge-done", "In Progress":"badge-prog", "Not Started":"badge-wait" }[s] || "badge-wait";
  return <span className={`badge ${cls}`}>{s}</span>;
}

function TodoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ task:"", assignedTo:"", priority:"", status:"", startDate:"", endDate:"", hours:"", desc:"" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Add Task <button className="modal-close" onClick={onClose}>×</button></div>
        <div className="form-group">
          <label className="form-label">Task Name *</label>
          <input className="form-control" value={form.task} onChange={set("task")} placeholder="Enter task name" />
        </div>
        <div className="form-group">
          <label className="form-label">Assigned To *</label>
          <input className="form-control" value={form.assignedTo} onChange={set("assignedTo")} placeholder="Employee name" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-control" value={form.priority} onChange={set("priority")}>
              <option value="">Select</option>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={set("status")}>
              <option value="">Select</option>
              <option>Not Started</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input className="form-control" type="datetime-local" value={form.startDate} onChange={set("startDate")} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className="form-control" type="datetime-local" value={form.endDate} onChange={set("endDate")} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Estimated Hours</label>
          <input className="form-control" type="number" value={form.hours} onChange={set("hours")} placeholder="Hours" style={{ maxWidth:160 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <EssRichTextArea value={form.desc} onChange={v => setForm(f => ({ ...f, desc:v }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Attach Documents</label>
          <div className="dropzone">📎 Drop files here or click to upload</div>
        </div>
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
      actions:     <><button className="act-btn" title="Edit">✏️</button><button className="act-btn" title="Delete">🗑️</button></>,
    }))
  );
  return (
    <div>
      {showModal && (
        <TodoModal
          onClose={() => setShowModal(false)}
          onSave={f => setTodos(ts => [...ts, {
            addedOn: now, taskId:`TASK-${(ts.length+1).toString().padStart(3,"0")}`,
            task: f.task, priority: priorityBadge(f.priority||"Low"),
            statusBadge: statusBadge(f.status||"Not Started"),
            startDate: f.startDate, endDate: f.endDate, hours: f.hours,
            assignedBy:"Admin", assignedTo: f.assignedTo,
            actions: <><button className="act-btn">✏️</button><button className="act-btn">🗑️</button></>
          }])}
        />
      )}
      <div className="page-header">
        <div>
          <div className="ess-title">📋 To-Do List</div>
          <div className="ess-sub">{todos.length} tasks total</div>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>＋ Add Task</button>
      </div>
      <EssFilterBar filters={[
        { label:"Assigned To", options:["All","Priya S.","Rahul M.","Ananya K.","Vikram T.","Deepa R."] },
        { label:"Priority",    options:["All","High","Medium","Low"] },
        { label:"Status",      options:["All","Not Started","In Progress","Completed"] },
        { label:"Date Range",  options:["All","This Week","This Month","Custom"] },
      ]} />
      <div className="ess-card">
        <EssDataTable columns={TODO_COLS} data={todos} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ DOCUMENT PAGE ═══════════════════════════════ */
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
      size:    `${(Math.random()*4+0.5).toFixed(1)} MB`,
      actions: <><button className="act-btn" title="Download">⬇️</button><button className="act-btn" title="Delete">🗑️</button></>,
    }))
  );
  const handleSubmit = () => {
    if (!file) return alert("Please choose a file");
    setDocs(ds => [...ds, {
      name: file.name, description: desc,
      uploadedDate: new Date().toLocaleDateString("en-IN"),
      size: `${(file.size/1048576).toFixed(1)} MB`,
      actions: <><button className="act-btn">⬇️</button><button className="act-btn">🗑️</button></>
    }]);
    setFile(null); setDesc(""); setShowForm(false);
  };
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="ess-title">📁 Documents</div>
          <div className="ess-sub">Manage shared files and attachments</div>
        </div>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>＋ Upload</button>
      </div>
      {showForm && (
        <div className="ess-card">
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14, color:"#111827" }}>Upload Document</div>
          <div className="form-group">
            <label className="form-label">File *</label>
            <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png,.xlsx" ref={fileRef}
              onChange={e => setFile(e.target.files[0])} style={{ display:"none" }} />
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="exp-btn" onClick={() => fileRef.current.click()}>Choose File</button>
              <span style={{ fontSize:13, color:"#6b7280" }}>{file ? file.name : "No file chosen"}</span>
            </div>
            <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>Allowed: .pdf .csv .zip .doc .docx .jpeg .jpg .png .xlsx</div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description of this document" />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-save" onClick={handleSubmit}>Submit</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="ess-card">
        <EssDataTable columns={DOC_COLS} data={docs} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ MEMOS PAGE ═══════════════════════════════ */
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
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Add Memo <button className="modal-close" onClick={onClose}>×</button></div>
        <div className="form-group">
          <label className="form-label">Heading *</label>
          <input className="form-control" value={heading} onChange={e => setHeading(e.target.value)} placeholder="Memo heading" />
        </div>
        <div className="form-group">
          <label className="form-label">Content</label>
          <EssRichTextArea value={desc} onChange={setDesc} />
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
          <button className="btn-save" onClick={() => { if(heading){ onSave({heading,desc}); onClose(); } }}>Save</button>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function EssMemosPage() {
  const [showModal, setShowModal] = useState(false);
  const [memos, setMemos] = useState(
    SAMPLE_MEMOS.map(m => ({
      ...m,
      actions: <><button className="act-btn">✏️</button><button className="act-btn">🗑️</button></>
    }))
  );
  return (
    <div>
      {showModal && (
        <MemoModal
          onClose={() => setShowModal(false)}
          onSave={m => setMemos(ms => [...ms, {
            heading: m.heading, description: m.desc,
            createdDate: new Date().toLocaleDateString("en-IN"),
            actions: <><button className="act-btn">✏️</button><button className="act-btn">🗑️</button></>
          }])}
        />
      )}
      <div className="page-header">
        <div>
          <div className="ess-title">📝 Memos</div>
          <div className="ess-sub">Internal announcements and notices</div>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>＋ Add Memo</button>
      </div>
      <div className="ess-card">
        <EssDataTable columns={MEMO_COLS} data={memos} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ REMINDERS PAGE ═══════════════════════════════ */
function ReminderModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:"", repeat:"One time", date:"", startTime:"", endTime:"" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:480 }}>
        <div className="modal-title">Add Reminder <button className="modal-close" onClick={onClose}>×</button></div>
        <div className="form-group">
          <label className="form-label">Event Name *</label>
          <input className="form-control" value={form.name} onChange={set("name")} placeholder="e.g. Monthly Payroll Run" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Repeat</label>
            <select className="form-control" value={form.repeat} onChange={set("repeat")}>
              <option>One time</option><option>Daily</option><option>Weekly</option><option>Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-control" type="date" value={form.date} onChange={set("date")} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time *</label>
            <input className="form-control" type="time" value={form.startTime} onChange={set("startTime")} />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input className="form-control" type="time" value={form.endTime} onChange={set("endTime")} />
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={() => { if(form.name && form.date){ onSave(form); onClose(); } }}>Save</button>
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
  const today   = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year     = current.getFullYear();
  const month    = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysIn   = new Date(year, month+1, 0).getDate();
  const cells    = [...Array(firstDay).fill(null), ...Array.from({length:daysIn},(_,i)=>i+1)];
  const monthName = current.toLocaleString("default",{month:"long"});

  return (
    <div>
      {showModal && (
        <ReminderModal onClose={() => setShowModal(false)} onSave={r => setEvents(e => [...e, r])} />
      )}
      <div className="page-header">
        <div>
          <div className="ess-title">🗓️ Reminders</div>
          <div className="ess-sub">{events.length} upcoming events</div>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>＋ Add Reminder</button>
      </div>
      <div className="ess-card cal-wrap" style={{ padding:22 }}>
        <div className="cal-nav">
          <button onClick={() => setCurrent(new Date(year, month-1, 1))}>‹ Prev</button>
          <button onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
          <button onClick={() => setCurrent(new Date(year, month+1, 1))}>Next ›</button>
          <div className="cal-month">{monthName} {year}</div>
        </div>
        <div className="cal-grid">
          {DAYS.map(d => <div key={d} className="cal-day-hdr">{d}</div>)}
          {cells.map((d, i) => {
            const isToday = d===today.getDate() && month===today.getMonth() && year===today.getFullYear();
            const dayEvents = events.filter(ev => {
              if (!ev.date) return false;
              const ed = new Date(ev.date);
              return ed.getDate()===d && ed.getMonth()===month && ed.getFullYear()===year;
            });
            return (
              <div key={i} className={`cal-cell${d===null?" empty":""}${isToday?" today":""}`}>
                {d && (
                  <div className="cal-date-num" style={{ color: isToday ? GREEN : "#374151" }}>
                    {d}
                    {isToday && <span style={{ background:GREEN, color:"#fff", borderRadius:"50%", width:20, height:20, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, marginLeft:4 }}>{d}</span>}
                  </div>
                )}
                {dayEvents.map((ev, ei) => (
                  <div key={ei} style={{
                    background: EVENT_COLORS[ei % EVENT_COLORS.length], color:"#fff",
                    borderRadius:5, padding:"2px 6px", fontSize:11, marginTop:3, fontWeight:500,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                  }} title={`${ev.name} (${ev.startTime}–${ev.endTime})`}>
                    {ev.startTime && `${ev.startTime} `}{ev.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {/* Upcoming events list */}
      <div className="ess-card">
        <div style={{ fontWeight:700, fontSize:15, marginBottom:14, color:"#111827", fontFamily:FONT_HEAD }}>Upcoming Events</div>
        {events.map((ev, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom:"1px solid #f3f4f6" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:EVENT_COLORS[i%EVENT_COLORS.length], flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{ev.name}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>{ev.date} · {ev.startTime}{ev.endTime ? `–${ev.endTime}` : ""} · {ev.repeat}</div>
            </div>
            <button className="act-btn">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════ MESSAGES PAGE ═══════════════════════════════ */
function EssMessagesPage() {
  const [msgs,  setMsgs]  = useState(SAMPLE_MESSAGES);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { text:input, time: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}), sender:"self" }]);
    setInput("");
  };
  return (
    <div>
      <div className="ess-title" style={{ marginBottom:18 }}>💬 Messages</div>
      <div className="ess-card" style={{ padding:0, display:"flex", flexDirection:"column" }}>
        {/* Contacts bar */}
        <div style={{ borderBottom:"1px solid #f3f4f6", padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
          {["Admin","Priya S.","Rahul M.","Ananya K."].map((n,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20,
              background: i===0 ? GREEN_LITE : "transparent", border: i===0 ? `1px solid ${GREEN}` : "1px solid #e5e7eb",
              cursor:"pointer", fontSize:13, fontWeight:600, color: i===0 ? GREEN : "#374151" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background: i===0 ? GREEN : "#e5e7eb",
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>
                {n[0]}
              </div>
              {n}
            </div>
          ))}
        </div>
        <div className="msg-area">
          {msgs.map((m, i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: m.sender==="self" ? "flex-end" : "flex-start" }}>
              <div className={`msg-bubble ${m.sender}`}>{m.text}</div>
              <div className="msg-time" style={{ color:"#9ca3af", paddingLeft: m.sender==="system" ? 4 : 0, paddingRight: m.sender==="self" ? 4 : 0 }}>
                {m.time}
              </div>
            </div>
          ))}
        </div>
        <div className="msg-input-row">
          <input className="msg-input" placeholder="Type a message..." value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} />
          <button className="msg-send" onClick={send}>➤</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ KNOWLEDGE BASE ═══════════════════════════════ */
function EssKnowledgePage() {
  const [showForm,  setShowForm]  = useState(false);
  const [articles,  setArticles]  = useState(SAMPLE_KB);
  const [form,      setForm]      = useState({ title:"", content:"", share:"Public" });
  const [search,    setSearch]    = useState("");
  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));

  const shareBadge = s => {
    const cls = { Public:"badge-pub", Private:"badge-priv", Team:"badge-team" }[s] || "badge-wait";
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  const handleSave = () => {
    if (!form.title) return alert("Title is required");
    setArticles(a => [...a, { ...form, date: new Date().toLocaleDateString("en-IN") }]);
    setForm({ title:"", content:"", share:"Public" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="ess-title">📚 Knowledge Base</div>
          <div className="ess-sub">{articles.length} articles</div>
        </div>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>＋ Add Article</button>
      </div>
      {showForm && (
        <div className="ess-card">
          <div style={{ fontWeight:700, fontSize:16, marginBottom:16, color:"#111827", fontFamily:FONT_HEAD }}>New Article</div>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} placeholder="Article title" />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <EssRichTextArea value={form.content} onChange={v => setForm(f => ({...f,content:v}))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Visibility</label>
              <select className="form-control" value={form.share} onChange={e => setForm(f => ({...f,share:e.target.value}))}>
                <option>Public</option><option>Private</option><option>Team</option>
              </select>
            </div>
            <div />
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <button className="btn-save" onClick={handleSave}>Publish</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="ess-card" style={{ marginBottom:14 }}>
        <input className="tbl-search" style={{ width:"100%", maxWidth:360 }} placeholder="Search articles..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.map((a, i) => (
        <div key={i} className="kb-card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"#111827", marginBottom:4, fontFamily:FONT_HEAD }}>{a.title}</div>
              <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.6, marginBottom:8 }}>
                {a.content.length > 120 ? a.content.slice(0, 120) + "…" : a.content}
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {shareBadge(a.share)}
                <span style={{ fontSize:12, color:"#9ca3af" }}>Published {a.date}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:4, marginLeft:16 }}>
              <button className="act-btn">✏️</button>
              <button className="act-btn">🗑️</button>
            </div>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="ess-card" style={{ textAlign:"center", color:"#9ca3af", padding:40 }}>
          No articles found. Try a different search or click + Add Article.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════ SETTINGS PAGE ═══════════════════════════════ */
function EssentialsSettingsPage() {
  const [tab,              setTab]              = useState("Leave");
  const [leavePrefix,      setLeavePrefix]      = useState("LEV-2026-");
  const [leaveInstructions,setLeaveInstructions] = useState("All leave applications must be submitted at least 48 hours in advance. Emergency leave must be approved by the direct manager.");
  const [autoApproval,     setAutoApproval]     = useState(false);
  const tabs = ["Leave","Payroll","Attendance","Sales Targets","Essentials"];

  return (
    <div>
      <div className="ess-title" style={{ marginBottom:18 }}>⚙️ Essentials & HRM Settings</div>
      <div className="ess-card" style={{ display:"flex", gap:0, padding:0, overflow:"hidden" }}>
        <div className="settings-sidebar">
          {tabs.map(t => (
            <div key={t} className={`settings-tab${tab===t?" active":""}`} onClick={() => setTab(t)}>{t}</div>
          ))}
        </div>
        <div style={{ flex:1, padding:24 }}>
          {tab === "Leave" && (
            <>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:18, color:"#111827", fontFamily:FONT_HEAD }}>Leave Settings</div>
              <div className="form-group">
                <label className="form-label">Leave Reference No. Prefix</label>
                <input className="form-control" value={leavePrefix} onChange={e => setLeavePrefix(e.target.value)} style={{ maxWidth:300 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Casual Leave Days / Year</label>
                <input className="form-control" type="number" defaultValue={12} style={{ maxWidth:150 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Auto Approval After (days)</label>
                <input className="form-control" type="number" defaultValue={3} style={{ maxWidth:150 }} />
              </div>
              <div className="form-group">
                <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                  <input type="checkbox" checked={autoApproval} onChange={e => setAutoApproval(e.target.checked)} />
                  <span className="form-label" style={{ margin:0 }}>Enable Auto Approval</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Leave Application Instructions</label>
                <EssRichTextArea value={leaveInstructions} onChange={setLeaveInstructions} />
              </div>
            </>
          )}
          {tab === "Payroll" && (
            <div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:18, color:"#111827", fontFamily:FONT_HEAD }}>Payroll Settings</div>
              <div className="form-group">
                <label className="form-label">Payroll Cycle</label>
                <select className="form-control" defaultValue="Monthly" style={{ maxWidth:240 }}>
                  <option>Monthly</option><option>Bi-weekly</option><option>Weekly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payroll Processing Date</label>
                <input className="form-control" type="number" defaultValue={28} min={1} max={31} style={{ maxWidth:120 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select className="form-control" defaultValue="INR (₹)" style={{ maxWidth:240 }}>
                  <option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option>
                </select>
              </div>
            </div>
          )}
          {tab === "Attendance" && (
            <div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:18, color:"#111827", fontFamily:FONT_HEAD }}>Attendance Settings</div>
              <div className="form-group">
                <label className="form-label">Work Start Time</label>
                <input className="form-control" type="time" defaultValue="09:00" style={{ maxWidth:180 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Work End Time</label>
                <input className="form-control" type="time" defaultValue="18:00" style={{ maxWidth:180 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Late Arrival Grace (minutes)</label>
                <input className="form-control" type="number" defaultValue={15} style={{ maxWidth:150 }} />
              </div>
            </div>
          )}
          {(tab === "Sales Targets" || tab === "Essentials") && (
            <div style={{ color:"#9ca3af", fontSize:14, padding:20 }}>
              {tab} settings — configure as needed.
            </div>
          )}
          <div style={{ marginTop:24 }}>
            <button className="btn-save">Update Settings</button>
          </div>
        </div>
      </div>
      <div style={{ textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:14 }}>
        Essentials and HRM module version — <strong>5.1</strong>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ MAIN COMPONENT ═══════════════════════════════ */
const TABS = [
  { key:"To Do"       },
  { key:"Document"},
  { key:"Memos" },
  { key:"Reminders" },
  { key:"Messages" },
  { key:"Knowledge Base" },
  { key:"Settings" },
];


/* ══════════════════════════════════════════
   ESSENTIALS NAV
══════════════════════════════════════════ */
const ESS_TABS = [
  { label: "Essentials",     path: "/essentials" },
  { label: "To Do",          path: "/essentials/todo" },
  { label: "Document",       path: "/essentials/document"},
  { label: "Memos",          path: "/essentials/memos" },
  { label: "Reminders",      path: "/essentials/reminders" },
  { label: "Messages",       path: "/essentials/messages" },
  { label: "Knowledge Base", path: "/essentials/knowledge-base" },
  { label: "Settings",       path: "/essentials/settings" },
];

function EssentialsNav() {
  const loc = useLocation();
  return (
    <div style={{
      display: "flex", gap: 0,
      borderBottom: "2px solid #e4ebe7",
      marginBottom: 24, flexWrap: "wrap",
      background: "#fff",
    }}>
      {ESS_TABS.map(t => {
        const active = loc.pathname === t.path ||
          (t.path !== "/essentials" && loc.pathname.startsWith(t.path));
        return (
          <Link key={t.label} to={t.path} style={{
            padding: "12px 18px", fontSize: 13.5, fontWeight: active ? 700 : 500,
            color: active ? "#1a6b3c" : "#718096", textDecoration: "none",
            borderBottom: active ? "3px solid #1a6b3c" : "3px solid transparent",
            background: active ? "#e8f5ee" : "none",
            borderRadius: active ? "6px 6px 0 0" : 0,
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5,
            transition: ".15s",
          }}>
            {t.icon} {t.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   ESSENTIALS DASHBOARD
══════════════════════════════════════════ */
function EssentialsDashboard() {
  const cards = [
    {  label:"To Do",         path:"/essentials/todo",          count:"7 tasks",   color:"#d1fae5", accent:"#1a6b3c" },
    {  label:"Documents",     path:"/essentials/document",      count:"6 files",   color:"#dbeafe", accent:"#1d4ed8" },
    { label:"Memos",         path:"/essentials/memos",         count:"5 memos",   color:"#fef9c3", accent:"#713f12" },
    {  label:"Reminders",    path:"/essentials/reminders",     count:"6 events",  color:"#ede9fe", accent:"#6d28d9" },
    {  label:"Messages",      path:"/essentials/messages",      count:"5 messages",color:"#e0f2fe", accent:"#0369a1" },
    {  label:"Knowledge Base",path:"/essentials/knowledge-base",count:"4 articles",color:"#fce7f3", accent:"#9d174d" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#111827" }}>✅ Essentials</h2>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 14 }}>Your productivity hub — tasks, docs, memos, reminders & more</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {cards.map(c => (
          <Link key={c.label} to={c.path} style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fff", borderRadius: 12, padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,.06)", border: "1px solid #f0f4f1",
              cursor: "pointer", transition: ".2s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,.06)"}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>
                {c.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: c.accent, fontWeight: 600 }}>{c.count}</div>
            </div>
          </Link>
        ))}
      </div>
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

/* ── Layout wrapper: injects CSS + provides ess-wrap + EssentialsNav for every page ── */
function EssLayout({ children }) {
  injectStyles();
  return (
    <div className="ess-wrap" style={{ padding: "0 0 40px 0" }}>
      {/* Top tab nav */}
      <div style={{
        background: "#fff",
        borderBottom: "2px solid #e4ebe7",
        marginBottom: 20,
      }}>
        <EssentialsNav />
      </div>
      {/* Page body */}
      <div style={{ padding: "0 2px" }}>
        {children}
      </div>
    </div>
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
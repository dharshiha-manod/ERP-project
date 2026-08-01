   import { useState, useEffect, useRef } from "react";
import * as essAPI from "../api/essAPI";
/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — self-contained, mirrors HRM.jsx palette
═══════════════════════════════════════════════════════════ */
const G = {
  green:"#2e7d32",green2:"#43a047",greenBg:"#e8f5e9",white:"#ffffff",
  bg:"#f0f4f1",border:"#d4e6d5",text:"#1b2e1c",muted:"#607d63",
  rowHov:"#f4faf4",red:"#c62828",redBg:"#fce4ec",amber:"#e65100",
  amberBg:"#fff3e0",blue:"#1565c0",blueBg:"#e3f2fd",
};

const Card = ({ children, style={} }) => (
  <div style={{ background:G.white, borderRadius:12, padding:20, border:`1px solid ${G.border}`, boxShadow:"0 1px 4px rgba(46,125,50,.07)", ...style }}>{children}</div>
);
const GreenBtn = ({ children, onClick, style={}, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ background:G.green, color:"#fff", border:"none", borderRadius:8, padding:"9px 20px", fontWeight:700, fontSize:13, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, fontFamily:"'Inter',sans-serif", ...style }}>{children}</button>
);
const DarkBtn = ({ children, onClick, style={} }) => (
  <button onClick={onClick} style={{ background:"#fff", color:G.muted, border:`1px solid ${G.border}`, borderRadius:8, padding:"9px 18px", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'Inter',sans-serif", ...style }}>{children}</button>
);
const NoData = ({ text="No records found" }) => (<div style={{ textAlign:"center", padding:"32px 0", color:G.muted, fontSize:14 }}>{text}</div>);

function StatusPill({ text }) {
  const map = { Pending:{bg:G.amberBg,color:G.amber}, Approved:{bg:G.greenBg,color:G.green}, Rejected:{bg:G.redBg,color:G.red}, Paid:{bg:G.greenBg,color:G.green}, Present:{bg:G.greenBg,color:G.green}, Late:{bg:G.amberBg,color:G.amber}, Absent:{bg:G.redBg,color:G.red}, "On Leave":{bg:G.blueBg,color:G.blue} };
  const s = map[text] || { bg:"#f5f5f5", color:G.muted };
  return <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>{text}</span>;
}

function KpiCard({ label, value, accent, color }) {
  return (
    <div style={{ background:accent?G.green:G.white, border:`1px solid ${accent?"transparent":G.border}`, borderRadius:12, padding:"14px 18px", boxShadow:accent?"0 4px 16px rgba(46,125,50,.25)":"0 1px 4px rgba(46,125,50,.07)" }}>
      <div style={{ fontSize:11, color:accent?"rgba(255,255,255,.75)":G.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:800, color:accent?"#fff":color||G.green }}>{value}</div>
    </div>
  );
}
const KpiRow = ({ cards }) => (
  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:22 }}>
    {cards.map(c => <KpiCard key={c.label} {...c} />)}
  </div>
);

const inputStyle = { width:"100%", padding:"9px 12px", border:`1px solid ${G.border}`, borderRadius:8, fontSize:14, boxSizing:"border-box", fontFamily:"'Inter',sans-serif", color:G.text, background:"#fafffe", outline:"none" };
const FInput    = (props) => <input {...props} style={{ ...inputStyle, ...props.style }} />;
const FSelect   = ({ children, ...props }) => <select {...props} style={{ ...inputStyle, ...props.style }}>{children}</select>;
const FTextarea = (props) => <textarea {...props} style={{ ...inputStyle, minHeight:80, resize:"vertical", ...props.style }} />;
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:"block", fontWeight:600, marginBottom:6, fontSize:13, color:G.text }}>{label}{required && <span style={{ color:G.red }}> *</span>}</label>
    {children}
  </div>
);

function Modal({ title, onClose, children, width=520 }) {
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

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION BELL — leave status updates (Approved/Rejected)
   Reuses hrm_leaves.employee_seen via /ess/leaves/notifications.
═══════════════════════════════════════════════════════════ */
function NotificationBell({ onViewHoliday }) {
  const [items,setItems]=useState([]);
  const [general,setGeneral]=useState([]);
  const [open,setOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const boxRef = useRef(null);

  const load = async () => {
    try {
      const [leaveRes, genRes] = await Promise.all([
        essAPI.getMyLeaveNotifications(),
        essAPI.getMyNotifications(),
      ]);
      setItems(leaveRes.notifications || []);
      setGeneral(genRes.notifications || []);
    } catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

const dismissLeave = async (id) => {
    try { await essAPI.markLeaveNotificationSeen(id); setItems(list => list.filter(n => n.id !== id)); }
    catch(e){ console.error(e); }
  };
  const dismissGeneral = async (id) => {
    try { await essAPI.markNotificationSeen(id); setGeneral(list => list.filter(n => n.id !== id)); }
    catch(e){ console.error(e); }
  };

  const fmtDate = (d) => d ? String(d).slice(0,10) : "—";
  const totalCount = items.length + general.length;

  return (
    <div ref={boxRef} style={{ position:"relative" }}>
      <button onClick={()=>{ setOpen(v=>!v); load(); }} style={{ position:"relative", background:"#fff", border:`1px solid ${G.border}`, borderRadius:8, width:38, height:38, cursor:"pointer", fontSize:17 }}>
        🔔
        {totalCount > 0 && (
          <span style={{ position:"absolute", top:-4, right:-4, background:G.red, color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position:"absolute", right:0, top:44, width:340, maxHeight:440, overflowY:"auto", background:"#fff", border:`1px solid ${G.border}`, borderRadius:12, boxShadow:"0 12px 32px rgba(0,0,0,.15)", zIndex:500 }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${G.border}`, fontWeight:700, fontSize:13, color:G.text }}>Notifications</div>
          {loading ? (
            <div style={{ padding:20, textAlign:"center", color:G.muted, fontSize:13 }}>Loading…</div>
          ) : totalCount === 0 ? (
            <div style={{ padding:20, textAlign:"center", color:G.muted, fontSize:13 }}>No new updates</div>
          ) : (
            <>
              {items.map(n => (
                <div key={`leave-${n.id}`} style={{ padding:"12px 16px", borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div style={{ fontSize:13, color:G.text, lineHeight:1.5 }}>
                      Your <strong>{n.leave_type_name}</strong> for {fmtDate(n.start_date)}
                      {n.start_date !== n.end_date ? ` – ${fmtDate(n.end_date)}` : ""} has been{" "}
                      <span style={{ color:n.status==="Approved"?G.green:G.red, fontWeight:700 }}>{n.status}</span>.
                      {n.approver_remarks && <div style={{ color:G.muted, fontSize:12, marginTop:2 }}>Remarks: {n.approver_remarks}</div>}
                    </div>
                    <button onClick={()=>dismissLeave(n.id)} title="Dismiss" style={{ border:"none", background:"none", cursor:"pointer", color:G.muted, fontSize:16, lineHeight:1, flexShrink:0 }}>×</button>
                  </div>
                </div>
            ))}
              {general.map(n => (
                <div key={`gen-${n.id}`} style={{ padding:"12px 16px", borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div style={{ fontSize:13, color:G.text, lineHeight:1.5 }}>
                      <strong>{n.title}</strong>
                      {n.message && <div style={{ color:G.muted, fontSize:12, marginTop:2 }}>{n.message}</div>}
                    {n.module === "Holiday" && onViewHoliday && (
                        <button onClick={()=>{ onViewHoliday(n.record_id); setOpen(false); }} style={{ marginTop:6, padding:"3px 10px", background:G.greenBg, color:G.green, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:11.5 }}>View →</button>
                      )}
                    </div>
                    <button onClick={()=>dismissGeneral(n.id)} title="Dismiss" style={{ border:"none", background:"none", cursor:"pointer", color:G.muted, fontSize:16, lineHeight:1, flexShrink:0 }}>×</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV — always visible, no permission checks
═══════════════════════════════════════════════════════════ */

const ESS_TABS = ["My Profile","My Attendance","My Leave","My Holidays","My Sales Target","My Payroll"];

function ESSNav({ tab, setTab }) {
  return (
    <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${G.border}`, marginBottom:24, flexWrap:"wrap", background:G.white }}>
      {ESS_TABS.map(t => (
        <button key={t} onClick={()=>setTab(t)} style={{ padding:"11px 18px", fontSize:13.5, fontWeight:tab===t?700:500, color:tab===t?G.green:G.muted, background:tab===t?G.greenBg:"none", border:"none", borderBottom:tab===t?`3px solid ${G.green}`:"3px solid transparent", cursor:"pointer", borderRadius:tab===t?"6px 6px 0 0":0 }}>{t}</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY PROFILE
═══════════════════════════════════════════════════════════ */
function MyProfileTab() {
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [editModal,setEditModal]=useState(false);
  const [form,setForm]=useState({ phone:"", dob:"", gender:"", marital_status:"", permanent_address:"", current_address:"" });
  const [saving,setSaving]=useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await essAPI.getMyProfile();
      setProfile(d.profile);
    } catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = () => {
    setForm({
      phone: profile.phone || "", dob: profile.dob ? String(profile.dob).slice(0,10) : "",
      gender: profile.gender || "", marital_status: profile.marital_status || "",
      permanent_address: profile.permanent_address || "", current_address: profile.current_address || "",
    });
    setEditModal(true);
  };
  const save = async () => {
    setSaving(true);
    try {
      const d = await essAPI.updateMyProfile(form);
      setProfile(d.profile);
      setEditModal(false);
    } catch(e){ alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div style={{ textAlign:"center", padding:32, color:G.muted }}>Loading…</div>;
  if (!profile) return <NoData text="Profile not found" />;

  const rows = [
    { label:"Employee ID",   value:`EMP-${String(profile.id).padStart(4,"0")}` },
    { label:"Full Name",     value:profile.full_name || "—" },
    { label:"Email",         value:profile.email || "—" },
    { label:"Phone",         value:profile.phone || "—" },
    { label:"Department",    value:profile.department || "—" },
    { label:"Designation",   value:profile.designation || "—" },
    { label:"Date of Birth", value:profile.dob ? String(profile.dob).slice(0,10) : "—" },
    { label:"Gender",        value:profile.gender || "—" },
    { label:"Marital Status",value:profile.marital_status || "—" },
    { label:"Permanent Address", value:profile.permanent_address || "—" },
    { label:"Current Address",   value:profile.current_address || "—" },
  ];

  return (
    <Card style={{ maxWidth:640 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:G.text }}>Personal Details</h3>
        <GreenBtn onClick={openEdit}>Edit</GreenBtn>
      </div>
      {rows.map(r => (
        <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
          <span style={{ fontSize:13, fontWeight:600, color:G.muted }}>{r.label}</span>
          <span style={{ fontSize:13, fontWeight:700, color:G.text, textAlign:"right", maxWidth:"60%" }}>{r.value}</span>
        </div>
      ))}
      <p style={{ fontSize:12, color:G.muted, marginTop:16 }}>Department, designation and role are managed by HR/Admin and cannot be self-edited.</p>

      {editModal && (
        <Modal title="Edit My Profile" onClose={()=>setEditModal(false)}>
          <Field label="Phone"><FInput value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></Field>
          <Field label="Date of Birth"><FInput type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} /></Field>
          <Field label="Gender">
            <FSelect value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>
              <option value="">Please Select</option><option>Male</option><option>Female</option><option>Other</option>
            </FSelect>
          </Field>
          <Field label="Marital Status">
            <FSelect value={form.marital_status} onChange={e=>setForm(f=>({...f,marital_status:e.target.value}))}>
              <option value="">Please Select</option><option>Single</option><option>Married</option>
            </FSelect>
          </Field>
          <Field label="Permanent Address"><FTextarea value={form.permanent_address} onChange={e=>setForm(f=>({...f,permanent_address:e.target.value}))} /></Field>
          <Field label="Current Address"><FTextarea value={form.current_address} onChange={e=>setForm(f=>({...f,current_address:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</GreenBtn>
            <DarkBtn onClick={()=>setEditModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY ATTENDANCE
═══════════════════════════════════════════════════════════ */

function MyAttendanceTab() {
  const [records,setRecords]=useState([]);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [clockModal,setClockModal]=useState(false);
  const [note,setNote]=useState("");
  const [busy,setBusy]=useState(false);
  const [deptOpts,setDeptOpts]=useState([]);
  const [shiftOpts,setShiftOpts]=useState([]);
  const [selDept,setSelDept]=useState("");
  const [selShift,setSelShift]=useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([essAPI.getMyAttendance(), essAPI.getMyAttendanceStats()]);
      setRecords(a.attendance || []);
      setStats(s.stats || null);
    } catch(e){ console.error(e); }
    setLoading(false);
  };
  const loadOptions = async () => {
    try {
      const [d, sh] = await Promise.all([essAPI.getMyDepartments(), essAPI.getMyShifts()]);
      setDeptOpts(d.departments || []);
      setShiftOpts(sh.shifts || []);
    } catch(e){ console.error(e); }
  };
  useEffect(() => { load(); loadOptions(); }, []);

  const doClockIn = async () => {
    setBusy(true);
    try {
      await essAPI.clockInSelf({ note, department: selDept || null, shift_name: selShift || null });
      await load(); setClockModal(false); setNote(""); setSelDept(""); setSelShift("");
    }
    catch(e){ alert(e.message); }
    setBusy(false);
  };
  const doClockOut = async (id) => {
    setBusy(true);
    try { await essAPI.clockOutSelf(id); await load(); }
    catch(e){ alert(e.message); }
    setBusy(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => String(r.attendance_date).slice(0,10) === today);

  return (
    <div>
      {stats && (
        <KpiRow cards={[
          { label:"Present", value:stats.present, accent:true },
          { label:"Late", value:stats.late, color:G.amber },
          { label:"Absent", value:stats.absent, color:G.red },
          { label:"On Leave", value:stats.on_leave, color:G.blue },
        ]} />
      )}
      <Card style={{ marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:13, color:G.muted }}>
          {todayRecord ? <>Today: <StatusPill text={todayRecord.status} /> · In {todayRecord.clock_in||"—"} · Out {todayRecord.clock_out||"—"} · Dept {todayRecord.department||"—"} · Shift {todayRecord.shift_name||"—"}</> : "You haven't clocked in today."}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {!todayRecord && <GreenBtn onClick={()=>setClockModal(true)}>⬇ Clock In</GreenBtn>}
          {todayRecord && !todayRecord.clock_out && <GreenBtn onClick={()=>doClockOut(todayRecord.id)} disabled={busy}>⬆ Clock Out</GreenBtn>}
        </div>
      </Card>
      <Card>
        <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700, color:G.text }}>Attendance History</h3>
        {loading ? <div style={{ textAlign:"center", padding:24, color:G.muted }}>Loading…</div> :
        records.length === 0 ? <NoData text="No attendance records yet" /> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr style={{ background:G.greenBg }}>{["Date","Clock In","Clock Out","Status","Department","Shift"].map(c=>(<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase" }}>{c}</th>))}</tr></thead>
              <tbody>
                {records.map((r,i)=>(
                  <tr key={i} style={{ background:i%2===0?G.white:G.rowHov }}>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{String(r.attendance_date).slice(0,10)}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.clock_in||"—"}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.clock_out||"—"}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}><StatusPill text={r.status} /></td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.department||"—"}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.shift_name||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {clockModal && (
        <Modal title="Clock In" onClose={()=>setClockModal(false)} width={420}>
          <p style={{ color:G.muted, fontSize:13, margin:"0 0 16px" }}>{new Date().toLocaleTimeString()}</p>
          <Field label="Department">
            <FSelect value={selDept} onChange={e=>setSelDept(e.target.value)}>
              <option value="">Please Select</option>
              {deptOpts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Shift">
            <FSelect value={selShift} onChange={e=>setSelShift(e.target.value)}>
              <option value="">Please Select</option>
              {shiftOpts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </FSelect>
          </Field>
          <Field label="Note (optional)"><FTextarea value={note} onChange={e=>setNote(e.target.value)} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={doClockIn} disabled={busy}>Submit</GreenBtn>
            <DarkBtn onClick={()=>setClockModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   MY LEAVE
═══════════════════════════════════════════════════════════ */
function MyLeaveTab() {
  const [records,setRecords]=useState([]);
  const [balance,setBalance]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({ leaveType:"", startDate:"", endDate:"", reason:"" });
  const [saving,setSaving]=useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [l, b] = await Promise.all([essAPI.getMyLeaves(), essAPI.getMyLeaveBalance()]);
      setRecords(l.leaves || []);
      setBalance(b.balance || []);
    } catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const apply = async () => {
    if (!form.leaveType || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await essAPI.applyMyLeave({ leave_type_name:form.leaveType, start_date:form.startDate, end_date:form.endDate, reason:form.reason });
      await load();
      setModal(false); setForm({ leaveType:"", startDate:"", endDate:"", reason:"" });
    } catch(e){ alert(e.message); }
    setSaving(false);
  };
  const cancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try { await essAPI.cancelMyLeave(id); await load(); }
    catch(e){ alert(e.message); }
  };

  return (
    <div>
      {balance.length > 0 && (
        <KpiRow cards={balance.map(b => ({ label:b.leave_type_name, value:`${b.remaining} / ${b.max_count} left`, color:b.remaining<=0?G.red:G.green }))} />
      )}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <GreenBtn onClick={()=>setModal(true)}>+ Apply Leave</GreenBtn>
      </div>
      <Card>
        <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700, color:G.text }}>My Leave History</h3>
        {loading ? <div style={{ textAlign:"center", padding:24, color:G.muted }}>Loading…</div> :
        records.length === 0 ? <NoData text="No leave requests yet" /> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr style={{ background:G.greenBg }}>{["Ref No","Leave Type","Date","Reason","Status","Actions"].map(c=>(<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase" }}>{c}</th>))}</tr></thead>
              <tbody>
                {records.map((r,i)=>(
                  <tr key={i} style={{ background:i%2===0?G.white:G.rowHov }}>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.reference_no}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.leave_type_name}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{String(r.start_date).slice(0,10)} – {String(r.end_date).slice(0,10)}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.reason||"—"}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}><StatusPill text={r.status} /></td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>
                      {r.status==="Pending" && <button onClick={()=>cancel(r.id)} style={{ padding:"5px 12px", background:G.redBg, color:G.red, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12 }}>Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {modal && (
        <Modal title="Apply Leave" onClose={()=>setModal(false)}>
          <Field label="Leave Type" required>
            <FSelect value={form.leaveType} onChange={e=>setForm(f=>({...f,leaveType:e.target.value}))}>
              <option value="">Please Select</option>
              {balance.map(b => <option key={b.leave_type_id} value={b.leave_type_name}>{b.leave_type_name} ({b.remaining} left)</option>)}
            </FSelect>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Start Date" required><FInput type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} /></Field>
            <Field label="End Date"   required><FInput type="date" value={form.endDate}   onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} /></Field>
          </div>
          <Field label="Reason"><FTextarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <GreenBtn onClick={apply} disabled={saving}>{saving ? "Submitting..." : "Submit"}</GreenBtn>
            <DarkBtn onClick={()=>setModal(false)}>Close</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
// NEW CODE — insert before "function MyPayrollTab() {"
/* ═══════════════════════════════════════════════════════════
   MY SALES TARGET
═══════════════════════════════════════════════════════════ */
function MySalesTargetTab() {
  const [targets,setTargets]=useState([]);
  const [loading,setLoading]=useState(true);

  const load = async () => {
    setLoading(true);
    try { const d = await essAPI.getMySalesTarget(); setTargets(d.targets || []); }
    catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const fmtVal = (t, key) => key==="amount" ? `₹${Number(t.target_amount||0).toLocaleString("en-IN")}` : String(t[key]||0);

  return (
    <div>
      {loading ? <div style={{ textAlign:"center", padding:24, color:G.muted }}>Loading…</div> :
      targets.length === 0 ? <NoData text="No sales targets assigned yet" /> : (
        targets.map(t => {
          const isAmount = !t.order_target && !t.customer_target;
          const target = isAmount ? Number(t.target_amount||0) : (t.order_target || t.customer_target || 0);
          const achieved = isAmount ? Number(t.achieved_amount||0) : (t.order_achieved || t.customer_achieved || 0);
          const remaining = Math.max(0, target - achieved);
          const pct = t.achievement_pct || 0;
          return (
            <Card key={t.id} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:G.text }}>{t.month_year || "Current Period"}</h3>
                <StatusPill text={t.computed_status || "Not Started"} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:12 }}>
                <div><div style={{ fontSize:11, color:G.muted }}>Target</div><div style={{ fontSize:16, fontWeight:700, color:G.text }}>{isAmount ? fmtVal(t,"amount") : target}</div></div>
                <div><div style={{ fontSize:11, color:G.muted }}>Achieved</div><div style={{ fontSize:16, fontWeight:700, color:G.green }}>{isAmount ? `₹${achieved.toLocaleString("en-IN")}` : achieved}</div></div>
                <div><div style={{ fontSize:11, color:G.muted }}>Remaining</div><div style={{ fontSize:16, fontWeight:700, color:G.amber }}>{isAmount ? `₹${remaining.toLocaleString("en-IN")}` : remaining}</div></div>
              </div>
              <div style={{ background:G.border, borderRadius:6, height:10, overflow:"hidden" }}>
                <div style={{ width:`${Math.min(100,pct)}%`, background:pct>=100?G.green:G.amber, height:"100%" }} />
              </div>
              <div style={{ fontSize:12, color:G.muted, marginTop:6, textAlign:"right" }}>{pct}% complete</div>
            </Card>
          );
        })
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY HOLIDAYS
═══════════════════════════════════════════════════════════ */
function MyHolidaysTab({ highlightId, reloadKey }) {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);

  const load = async () => {
    setLoading(true);
    try { const d = await essAPI.getMyHolidays(); setRecords(d.holidays || []); }
    catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [reloadKey]);

  const today = new Date().toISOString().split('T')[0];
  const fmt = (d) => d ? String(d).slice(0,10) : "—";

  return (
    <div>
      <Card>
        <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700, color:G.text }}>Upcoming Holidays</h3>
        {highlightId && !loading && records.length > 0 && !records.some(r => r.id === highlightId) && (
          <div style={{ marginBottom:14, padding:"10px 14px", background:G.amberBg, color:G.amber, borderRadius:8, fontSize:13, fontWeight:600 }}>
            That holiday is no longer available — it may have been removed or changed by HR.
          </div>
        )}
        {loading ? <div style={{ textAlign:"center", padding:24, color:G.muted }}>Loading…</div> :
        records.length === 0 ? (
          <NoData text={highlightId ? "That holiday is no longer available — it may have been removed by HR." : "No upcoming holidays"} />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr style={{ background:G.greenBg }}>{["Holiday","Type","Start","End","Location","Note"].map(c=>(<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase" }}>{c}</th>))}</tr></thead>
              <tbody>
             {records.map((r,i)=>{
                  const isToday = fmt(r.start_date) <= today && today <= fmt(r.end_date);
                  const isHighlighted = highlightId && r.id === highlightId;
                  return (
                   <tr key={i} style={{ background:isHighlighted?G.amberBg:(isToday?G.greenBg:(i%2===0?G.white:G.rowHov)) }}>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, fontWeight:600 }}>{r.name}{isToday && <span style={{ marginLeft:8, fontSize:11, color:G.green, fontWeight:700 }}>● Today</span>}</td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.holiday_type || "—"}</td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{fmt(r.start_date)}</td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{fmt(r.end_date)}</td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.location || "All Locations"}</td>
                      <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}`, color:G.muted }}>{r.note || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY PAYROLL / PAYSLIPS
═══════════════════════════════════════════════════════════ */
function MyPayrollTab() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [slipModal,setSlipModal]=useState(false);
  const [slipData,setSlipData]=useState(null);
  const [slipLoading,setSlipLoading]=useState(false);

  const load = async () => {
    setLoading(true);
    try { const d = await essAPI.getMyPayroll(); setRecords(d.payrolls || []); }
    catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openSlip = async (id) => {
    setSlipModal(true); setSlipLoading(true);
    try {
      const rec = records.find(r => r.id === id);
      const d = await essAPI.getMyPayrollItems(id);
      setSlipData({ payroll: rec, items: d.items || [] });
    } catch(e){ alert(e.message); setSlipModal(false); }
    setSlipLoading(false);
  };

  const printSlip = () => window.print();

  return (
    <div>
      <Card>
        <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700, color:G.text }}>Salary History</h3>
        {loading ? <div style={{ textAlign:"center", padding:24, color:G.muted }}>Loading…</div> :
        records.length === 0 ? <NoData text="No payroll records yet" /> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr style={{ background:G.greenBg }}>{["Ref No","Month","Net Salary","Status","Payslip"].map(c=>(<th key={c} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`2px solid ${G.border}`, fontWeight:700, color:G.green, fontSize:11, textTransform:"uppercase" }}>{c}</th>))}</tr></thead>
              <tbody>
                {records.map((r,i)=>(
                  <tr key={i} style={{ background:i%2===0?G.white:G.rowHov }}>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.reference_no}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>{r.month_year}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>₹{Number(r.net_salary||0).toLocaleString("en-IN")}</td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}><StatusPill text={r.status} /></td>
                    <td style={{ padding:"10px 14px", borderBottom:`1px solid ${G.border}` }}>
                      <button onClick={()=>openSlip(r.id)} style={{ padding:"5px 12px", background:G.greenBg, color:G.green, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:12 }}>View Slip</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {slipModal && (
        <Modal title="My Payslip" onClose={()=>{setSlipModal(false); setSlipData(null);}} width={520}>
          {slipLoading ? <div style={{ textAlign:"center", padding:24, color:G.muted }}>Loading…</div> :
          slipData && (() => {
            const { payroll, items } = slipData;
            const earnings = items.filter(it => it.component_type === "Earning");
            const deductions = items.filter(it => it.component_type === "Deduction");
            const gross = Number(payroll.gross_salary ?? earnings.reduce((s,i)=>s+Number(i.amount||0),0));
            const ded = Number(payroll.total_deductions ?? deductions.reduce((s,i)=>s+Number(i.amount||0),0));
            const net = Number(payroll.net_salary ?? (gross - ded));
            return (
              <div>
                <div style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ fontWeight:700, fontSize:15, color:G.text }}>{payroll.reference_no}</div>
                  <div style={{ fontSize:12, color:G.muted }}>{payroll.month_year}</div>
                </div>
                <div style={{ fontWeight:700, fontSize:13, color:G.green, marginBottom:8 }}>Earnings</div>
                {earnings.length===0 ? <div style={{ fontSize:13, color:G.muted, marginBottom:12 }}>None</div> : earnings.map((it,idx)=>(
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}><span>{it.component_name}</span><span style={{ fontWeight:600, color:G.green }}>₹{Number(it.amount).toLocaleString("en-IN")}</span></div>
                ))}
                <div style={{ fontWeight:700, fontSize:13, color:G.red, marginTop:14, marginBottom:8 }}>Deductions</div>
                {deductions.length===0 ? <div style={{ fontSize:13, color:G.muted, marginBottom:12 }}>None</div> : deductions.map((it,idx)=>(
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}><span>{it.component_name}</span><span style={{ fontWeight:600, color:G.red }}>-₹{Number(it.amount).toLocaleString("en-IN")}</span></div>
                ))}
                <div style={{ marginTop:16, paddingTop:16, borderTop:`2px solid ${G.green}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span>Gross Earnings</span><span style={{ fontWeight:700 }}>₹{gross.toLocaleString("en-IN")}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span>Total Deductions</span><span style={{ fontWeight:700, color:G.red }}>₹{ded.toLocaleString("en-IN")}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, color:G.green, marginTop:6, paddingTop:6, borderTop:`1px solid ${G.border}` }}><span>Net Salary</span><span>₹{net.toLocaleString("en-IN")}</span></div>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
                  <GreenBtn onClick={printSlip}>🖨 Print</GreenBtn>
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

/* ═══════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════ */
export default function EmployeeSelfService() {
  const [tab,setTab]=useState("My Profile");
  const [highlightHolidayId,setHighlightHolidayId]=useState(null);
  const [holidayViewTick,setHolidayViewTick]=useState(0);
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:G.text }}>👤 My Space</h2>
          <p style={{ margin:0, fontSize:13, color:G.muted, marginTop:2 }}>Your own profile, attendance, leave and payroll — visible to you only</p>
        </div>
     <NotificationBell onViewHoliday={(holidayId)=>{
        setTab("My Holidays");
        setHighlightHolidayId(holidayId);
        setHolidayViewTick(t=>t+1);
      }} />
      </div>
    <ESSNav tab={tab} setTab={setTab} />
      {tab==="My Profile"     && <MyProfileTab />}  
      {tab==="My Attendance"  && <MyAttendanceTab />}
      {tab==="My Leave"       && <MyLeaveTab />}
   {tab==="My Holidays"    && <MyHolidaysTab highlightId={highlightHolidayId} reloadKey={holidayViewTick} />}
      {tab==="My Sales Target" && <MySalesTargetTab />}
      {tab==="My Payroll"     && <MyPayrollTab />}
    </div>
  );
}
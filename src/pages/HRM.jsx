import { useState } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";

/* ─── shared palette (matches the green ERP theme) ─── */
const C = {
  green: "#2d6a4f",
  greenLight: "#52b788",
  greenBg: "#f0f4f1",
  white: "#fff",
  border: "#e2e8f0",
  text: "#1a202c",
  muted: "#718096",
  danger: "#e53e3e",
  purple: "#553c9a",
  purpleLight: "#6b46c1",
};

/* ─── tiny helpers ─── */
const Btn = ({ children, onClick, variant = "primary", type = "button", style = {} }) => {
  const base = {
    padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6,
    transition: "opacity .15s",
    ...(variant === "primary" && { background: C.purpleLight, color: "#fff" }),
    ...(variant === "dark"    && { background: "#2d3748",     color: "#fff" }),
    ...(variant === "green"   && { background: C.green,       color: "#fff" }),
    ...(variant === "outline" && { background: "#fff", color: C.text, border: `1px solid ${C.border}` }),
    ...(variant === "danger"  && { background: C.danger,      color: "#fff" }),
    ...style,
  };
  return <button type={type} style={base} onClick={onClick}>{children}</button>;
};

const Badge = ({ children, color = C.greenLight }) => (
  <span style={{ background: color + "22", color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
    {children}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 10, padding: 20, boxShadow: "0 1px 4px #0001", ...style }}>
    {children}
  </div>
);

const NoData = () => (
  <div style={{ textAlign: "center", padding: "28px 0", color: C.muted, fontSize: 14 }}>No data available in table</div>
);

/* ─── Modal wrapper ─── */
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

/* ─── Form field helpers ─── */
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
  <select {...props} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, boxSizing: "border-box", ...props.style }}>
    {children}
  </select>
);

const Textarea = (props) => (
  <textarea {...props} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, minHeight: 90, resize: "vertical", boxSizing: "border-box", ...props.style }} />
);

/* ─── Table wrapper ─── */
function DataTable({ columns, rows, onEdit, onDelete, extraActions }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["Export CSV", "Export Excel", "Print", "Column visibility", "Export PDF"].map(t => (
          <button key={t} style={{ padding: "5px 12px", border: `1px solid ${C.border}`, borderRadius: 5, background: C.white, fontSize: 12, cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f7fafc" }}>
            {columns.map(c => (
              <th key={c} style={{ padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${C.border}`, fontWeight: 600, color: C.text }}>{c}</th>
            ))}
            <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 28, color: C.muted }}>No data available in table</td></tr>
          ) : rows.map((row, i) => (
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
   HRM TAB NAV
══════════════════════════════════════════ */
const HRM_TABS = [
  { label: "HRM", path: "/hrm" },
  { label: "Leave Type", path: "/hrm/leave-type" },
  { label: "Leave", path: "/hrm/leave" },
  { label: "Attendance", path: "/hrm/attendance" },
  { label: "Payroll", path: "/hrm/payroll" },
  { label: "Holiday", path: "/hrm/holiday" },
  { label: "Departments", path: "/hrm/departments" },
  { label: "Designations", path: "/hrm/designations" },
  { label: "Sales Targets", path: "/hrm/sales-targets" },
  { label: "Settings", path: "/hrm/settings" },
];

function HRMNav() {
  const loc = useLocation();
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 24, flexWrap: "wrap" }}>
      {HRM_TABS.map(t => {
        const active = loc.pathname === t.path || (t.path !== "/hrm" && loc.pathname.startsWith(t.path));
        return (
          <Link key={t.label} to={t.path} style={{
            padding: "10px 18px", fontSize: 14, fontWeight: active ? 700 : 500,
            color: active ? C.green : C.muted, textDecoration: "none",
            borderBottom: active ? `3px solid ${C.green}` : "3px solid transparent",
            background: "none", whiteSpace: "nowrap",
          }}>{t.label}</Link>
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
      {/* Row 1 */}
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

      {/* My Payrolls button */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/hrm/payroll/my")} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          💰 My Payrolls
        </button>
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
        {[["👥 Users", "Today", "Upcoming"], ["🌿 Leaves", "Today", "Upcoming"], ["🏖️ Holidays", "Today", "Upcoming"]].map(([title, ...subs]) => (
          <Card key={title}>
            <h4 style={{ margin: "0 0 14px", color: C.text }}>{title}</h4>
            {subs.map(s => (
              <div key={s} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s}</div>
                <div style={{ color: C.muted, fontSize: 13 }}>No data</div>
              </div>
            ))}
          </Card>
        ))}
      </div>

      {/* Row 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        <Card>
          <h4 style={{ margin: "0 0 14px", color: C.text }}>📅 Today's Attendance</h4>
          <table style={{ width: "100%", fontSize: 13 }}>
            <thead><tr>{["Employee","Clock In","Clock Out"].map(h=><th key={h} style={{ textAlign:"left", paddingBottom:8, color:C.muted }}>{h}</th>)}</tr></thead>
            <tbody><tr><td colSpan={3} style={{ textAlign:"center", color:C.muted, paddingTop:12 }}>No data</td></tr></tbody>
          </table>
        </Card>
        <Card>
          <h4 style={{ margin: "0 0 14px", color: C.text }}>🎯 Sales targets</h4>
          <NoData />
        </Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   LEAVE TYPE
══════════════════════════════════════════ */
function LeaveType() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: "", maxCount: "", interval: "none" });
  const [editIdx, setEditIdx] = useState(null);

  const save = () => {
    if (!form.type) return;
    if (editIdx !== null) {
      setRows(r => r.map((x, i) => i === editIdx ? [form.type, form.maxCount || "—"] : x));
      setEditIdx(null);
    } else {
      setRows(r => [...r, [form.type, form.maxCount || "—"]]);
    }
    setModal(false); setForm({ type: "", maxCount: "", interval: "none" });
  };

  const handleEdit = (i) => {
    setForm({ type: rows[i][0], maxCount: rows[i][1] === "—" ? "" : rows[i][1], interval: "none" });
    setEditIdx(i); setModal(true);
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Leave Type</h2>
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>All leave types</h3>
          <Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ type: "", maxCount: "", interval: "none" }); }}>+ Add</Btn>
        </div>
        <DataTable
          columns={["Leave Type", "Max Leave Count"]}
          rows={rows}
          onEdit={handleEdit}
          onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
        />
      </Card>
      {modal && (
        <Modal title={editIdx !== null ? "Edit Leave Type" : "Add Leave Type"} onClose={() => setModal(false)}>
          <Field label="Leave Type" required><Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="Leave Type" /></Field>
          <Field label="Max Leave Count"><Input type="number" value={form.maxCount} onChange={e => setForm(f => ({ ...f, maxCount: e.target.value }))} placeholder="Max Leave Count" /></Field>
          <Field label="Leave count interval">
            <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
              {["Current month", "Current financial year", "None"].map(v => (
                <label key={v} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                  <input type="radio" name="interval" checked={form.interval === v.toLowerCase().replace(" ", "_")} onChange={() => setForm(f => ({ ...f, interval: v.toLowerCase().replace(" ", "_") }))} />
                  {v}
                </label>
              ))}
            </div>
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
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
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ employee: "", leaveType: "", startDate: "", endDate: "", reason: "" });
  const [editIdx, setEditIdx] = useState(null);

  const save = () => {
    if (!form.leaveType || !form.startDate || !form.endDate) return;
    const entry = [
      `REF-${Date.now()}`, form.leaveType, form.employee || "Self",
      `${form.startDate} – ${form.endDate}`, form.reason,
      <Badge color={C.greenLight}>Pending</Badge>
    ];
    if (editIdx !== null) {
      setRows(r => r.map((x, i) => i === editIdx ? entry : x));
      setEditIdx(null);
    } else {
      setRows(r => [...r, entry]);
    }
    setModal(false); setForm({ employee: "", leaveType: "", startDate: "", endDate: "", reason: "" });
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Leave</h2>
      </div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
          🔽 Filters
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>All Leaves</h3>
          <Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ employee: "", leaveType: "", startDate: "", endDate: "", reason: "" }); }}>+ Add</Btn>
        </div>
        <DataTable
          columns={["Reference No", "Leave Type", "Employee", "Date", "Reason", "Status"]}
          rows={rows}
          onEdit={i => { setEditIdx(i); setModal(true); }}
          onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
        />
      </Card>
      {modal && (
        <Modal title="Add Leave" onClose={() => setModal(false)}>
          <Field label="Select employee"><Input value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))} placeholder="Employee name" /></Field>
          <Field label="Leave Type" required>
            <Select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
              <option value="">Please Select</option>
              <option>Sick Leave</option><option>Casual Leave</option><option>Annual Leave</option>
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Start Date" required><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></Field>
            <Field label="End Date" required><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></Field>
          </div>
          <Field label="Reason"><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason" /></Field>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Leave on {new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
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
  const [shifts, setShifts] = useState([{ name: "day shift", type: "Fixed shift", start: "14:36", end: "23:36", holiday: "" }]);
  const [allAtt, setAllAtt] = useState([]);
  const [clockInModal, setClockInModal] = useState(false);
  const [addShiftModal, setAddShiftModal] = useState(false);
  const [clockNote, setClockNote] = useState("");
  const [shiftForm, setShiftForm] = useState({ name: "", type: "Fixed shift", start: "", end: "", holiday: "", autoClockOut: false });
  const [editIdx, setEditIdx] = useState(null);

  const TABS = ["Shifts", "All Attendance", "Attendance by shift", "Attendance by date", "Import Attendance"];

  const saveShift = () => {
    if (!shiftForm.name || !shiftForm.start || !shiftForm.end) return;
    const entry = { name: shiftForm.name, type: shiftForm.type, start: shiftForm.start, end: shiftForm.end, holiday: shiftForm.holiday };
    if (editIdx !== null) { setShifts(s => s.map((x, i) => i === editIdx ? entry : x)); setEditIdx(null); }
    else setShifts(s => [...s, entry]);
    setAddShiftModal(false); setShiftForm({ name: "", type: "Fixed shift", start: "", end: "", holiday: "", autoClockOut: false });
  };

  const clockIn = () => {
    setAllAtt(a => [...a, { emp: "Dharshiha C", time: new Date().toLocaleTimeString(), note: clockNote, date: new Date().toLocaleDateString() }]);
    setClockInModal(false); setClockNote("");
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Attendance</h2>
        <button onClick={() => setClockInModal(true)} style={{ background: "#2b6cb0", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          ⬇ Clock In
        </button>
      </div>

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 20, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? C.green : C.muted, borderBottom: tab === t ? `3px solid ${C.green}` : "3px solid transparent", fontSize: 13, whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      {tab === "Shifts" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Btn onClick={() => { setAddShiftModal(true); setEditIdx(null); setShiftForm({ name: "", type: "Fixed shift", start: "", end: "", holiday: "", autoClockOut: false }); }}>+ Add</Btn>
          </div>
          <DataTable
            columns={["Name", "Shift Type", "Start time", "End time", "Holiday"]}
            rows={shifts.map(s => [s.name, s.type, s.start, s.end, s.holiday || "—"])}
            onEdit={i => { setShiftForm({ ...shifts[i], autoClockOut: false }); setEditIdx(i); setAddShiftModal(true); }}
            onDelete={i => setShifts(s => s.filter((_, j) => j !== i))}
            extraActions={i => (
              <button style={{ padding: "4px 12px", background: "#e6fffa", color: C.green, border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                👥 Assign Users
              </button>
            )}
          />
        </Card>
      )}

      {tab === "All Attendance" && (
        <Card>
          <DataTable
            columns={["Employee", "Date", "Clock In", "Note"]}
            rows={allAtt.map(a => [a.emp, a.date, a.time, a.note || "—"])}
            onEdit={() => {}} onDelete={i => setAllAtt(a => a.filter((_, j) => j !== i))}
          />
        </Card>
      )}

      {(tab === "Attendance by shift" || tab === "Attendance by date" || tab === "Import Attendance") && (
        <Card><NoData /></Card>
      )}

      {/* Clock In Modal */}
      {clockInModal && (
        <Modal title="Clock In" onClose={() => setClockInModal(false)}>
          <p style={{ color: C.muted, fontSize: 14 }}>IP Address: 117.200.179.60</p>
          <Field label="Clock in note:">
            <Textarea value={clockNote} onChange={e => setClockNote(e.target.value)} placeholder="Clock in note" />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={clockIn}>Submit</Btn>
            <Btn variant="dark" onClick={() => setClockInModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}

      {/* Add Shift Modal */}
      {addShiftModal && (
        <Modal title="Add Shift" onClose={() => setAddShiftModal(false)}>
          <Field label="Name" required><Input value={shiftForm.name} onChange={e => setShiftForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" /></Field>
          <Field label="Shift Type" required>
            <Select value={shiftForm.type} onChange={e => setShiftForm(f => ({ ...f, type: e.target.value }))}>
              <option>Fixed shift</option><option>Flexible shift</option><option>Rotating shift</option>
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Start time" required><Input type="time" value={shiftForm.start} onChange={e => setShiftForm(f => ({ ...f, start: e.target.value }))} /></Field>
            <Field label="End time" required><Input type="time" value={shiftForm.end} onChange={e => setShiftForm(f => ({ ...f, end: e.target.value }))} /></Field>
          </div>
          <Field label="Holiday"><Input value={shiftForm.holiday} onChange={e => setShiftForm(f => ({ ...f, holiday: e.target.value }))} /></Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={shiftForm.autoClockOut} onChange={e => setShiftForm(f => ({ ...f, autoClockOut: e.target.checked }))} />
            Do auto clock out ℹ️
          </label>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={saveShift}>Submit</Btn>
            <Btn variant="dark" onClick={() => setAddShiftModal(false)}>Close</Btn>
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
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ location: "All locations", employee: "", month: "" });
  const [payComponents, setPayComponents] = useState([]);
  const [compModal, setCompModal] = useState(false);
  const [compForm, setCompForm] = useState({ desc: "", type: "Earning", amount: "", date: "" });

  const proceed = () => {
    if (!form.employee || !form.month) return;
    setRows(r => [...r, [form.employee, "Sales", "Sales", form.month, `REF-${Date.now()}`, "₹0.00", <Badge color={C.greenLight}>Pending</Badge>]]);
    setModal(false);
  };

  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom: 16 }}>Payroll</h2>
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 20 }}>
        {["All Payrolls", "All payroll groups", "Pay Components"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? C.green : C.muted, borderBottom: tab === t ? `3px solid ${C.green}` : "3px solid transparent", fontSize: 14 }}>{t}</button>
        ))}
      </div>

      {tab === "All Payrolls" && (
        <Card>
          <Card style={{ marginBottom: 14, background: "#f7fafc" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>🔽 Filters</div>
          </Card>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Btn onClick={() => setModal(true)}>+ Add</Btn>
          </div>
          <DataTable
            columns={["Employee", "Department", "Designation", "Month/Year", "Reference No", "Total amount", "Payment Status"]}
            rows={rows}
            onEdit={() => {}} onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
          />
        </Card>
      )}

      {tab === "All payroll groups" && <Card><NoData /></Card>}

      {tab === "Pay Components" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Btn onClick={() => setCompModal(true)}>+ Add</Btn>
          </div>
          <DataTable
            columns={["Description", "Type", "Amount", "Applicable Date"]}
            rows={payComponents.map(c => [c.desc, c.type, `₹${c.amount}`, c.date])}
            onEdit={() => {}} onDelete={i => setPayComponents(p => p.filter((_, j) => j !== i))}
          />
        </Card>
      )}

      {modal && (
        <Modal title="Add Payroll" onClose={() => setModal(false)}>
          <Field label="Location" required>
            <Select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              <option>All locations</option><option>Manodtechnologies</option>
            </Select>
          </Field>
          <Field label="Employee" required>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <button style={{ padding: "4px 12px", border: `1px solid ${C.purpleLight}`, borderRadius: 20, color: C.purpleLight, background: "#fff", cursor: "pointer", fontSize: 13 }}>Select all</button>
              <button style={{ padding: "4px 12px", border: `1px solid ${C.purpleLight}`, borderRadius: 20, color: C.purpleLight, background: "#fff", cursor: "pointer", fontSize: 13 }}>Deselect all</button>
            </div>
            <Input value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))} placeholder="Select employee..." />
          </Field>
          <Field label="Month/Year" required><Input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={proceed}>Proceed</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}

      {compModal && (
        <Modal title="Add Pay Component" onClose={() => setCompModal(false)}>
          <Field label="Description"><Input value={compForm.desc} onChange={e => setCompForm(f => ({ ...f, desc: e.target.value }))} /></Field>
          <Field label="Type">
            <Select value={compForm.type} onChange={e => setCompForm(f => ({ ...f, type: e.target.value }))}>
              <option>Earning</option><option>Deduction</option>
            </Select>
          </Field>
          <Field label="Amount"><Input type="number" value={compForm.amount} onChange={e => setCompForm(f => ({ ...f, amount: e.target.value }))} /></Field>
          <Field label="Applicable Date"><Input type="date" value={compForm.date} onChange={e => setCompForm(f => ({ ...f, date: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => { if (compForm.desc) { setPayComponents(p => [...p, compForm]); setCompModal(false); setCompForm({ desc: "", type: "Earning", amount: "", date: "" }); } }}>Save</Btn>
            <Btn variant="dark" onClick={() => setCompModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MY PAYROLLS
══════════════════════════════════════════ */
function MyPayrolls() {
  const [tab, setTab] = useState("Pay Components");
  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom: 16 }}>My Payrolls</h2>
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 20 }}>
        {["Pay Components", "All Payrolls"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? C.green : C.muted, borderBottom: tab === t ? `3px solid ${C.green}` : "3px solid transparent", fontSize: 14 }}>{t}</button>
        ))}
      </div>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f7fafc" }}>
              {["Description","Type","Amount","Applicable Date"].map(h => <th key={h} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`1px solid ${C.border}`, fontWeight:600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={4} style={{ textAlign:"center", padding:28, color:C.muted }}>No data found</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════
   HOLIDAY
══════════════════════════════════════════ */
function Holiday() {
  const [rows, setRows] = useState([{ name: "shalijah", start: "05/27/2026", end: "05/28/2026", days: 2, location: "Manodtechnologies", note: "" }]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", location: "All", note: "" });
  const [editIdx, setEditIdx] = useState(null);

  const save = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    const s = new Date(form.startDate), e = new Date(form.endDate);
    const days = Math.max(1, Math.round((e - s) / 86400000) + 1);
    const entry = { name: form.name, start: form.startDate, end: form.endDate, days, location: form.location || "All", note: form.note };
    if (editIdx !== null) { setRows(r => r.map((x, i) => i === editIdx ? entry : x)); setEditIdx(null); }
    else setRows(r => [...r, entry]);
    setModal(false); setForm({ name: "", startDate: "", endDate: "", location: "All", note: "" });
  };

  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom: 16 }}>Holiday</h2>
      <Card style={{ marginBottom: 14 }}><div style={{ fontWeight: 600 }}>🔽 Filters</div></Card>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>All Holidays</h3>
          <Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ name: "", startDate: "", endDate: "", location: "All", note: "" }); }}>+ Add</Btn>
        </div>
        <DataTable
          columns={["Name", "Date", "Business Location", "Note"]}
          rows={rows.map(r => [r.name, `${r.start} – ${r.end} (${r.days}Days)`, r.location, r.note || "—"])}
          onEdit={i => { const r = rows[i]; setForm({ name: r.name, startDate: r.start, endDate: r.end, location: r.location, note: r.note }); setEditIdx(i); setModal(true); }}
          onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
        />
      </Card>
      {modal && (
        <Modal title="Add Holiday" onClose={() => setModal(false)}>
          <Field label="Name" required><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Start Date" required><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></Field>
            <Field label="End Date" required><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></Field>
          </div>
          <Field label="Business Location:">
            <Select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              <option>All</option><option>Manodtechnologies</option>
            </Select>
          </Field>
          <Field label="Note:"><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Note" /></Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
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
    { dept: "sales", id: "sales", desc: "sales" },
    { dept: "Digital Marketing", id: "", desc: "" },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ dept: "", id: "", desc: "" });
  const [editIdx, setEditIdx] = useState(null);

  const save = () => {
    if (!form.dept) return;
    if (editIdx !== null) { setRows(r => r.map((x, i) => i === editIdx ? form : x)); setEditIdx(null); }
    else setRows(r => [...r, form]);
    setModal(false); setForm({ dept: "", id: "", desc: "" });
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Departments</h2>
        <span style={{ color: C.muted, fontSize: 14 }}>Manage Departments</span>
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ dept: "", id: "", desc: "" }); }}>+ Add</Btn>
        </div>
        <DataTable
          columns={["Department", "Department ID", "Description"]}
          rows={rows.map(r => [r.dept, r.id || "—", r.desc || "—"])}
          onEdit={i => { setForm(rows[i]); setEditIdx(i); setModal(true); }}
          onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
        />
      </Card>
      {modal && (
        <Modal title="Add" onClose={() => setModal(false)}>
          <Field label="Department" required><Input value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} placeholder="Department" /></Field>
          <Field label="Department ID:">
            <Input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} placeholder="Department ID" />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Enter unique department ID</div>
          </Field>
          <Field label="Description:"><Textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description" /></Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
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
  const [rows, setRows] = useState([{ desig: "sales", desc: "sales" }]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desig: "", desc: "" });
  const [editIdx, setEditIdx] = useState(null);

  const save = () => {
    if (!form.desig) return;
    if (editIdx !== null) { setRows(r => r.map((x, i) => i === editIdx ? form : x)); setEditIdx(null); }
    else setRows(r => [...r, form]);
    setModal(false); setForm({ desig: "", desc: "" });
  };

  return (
    <div>
      <HRMNav />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Designations</h2>
        <span style={{ color: C.muted, fontSize: 14 }}>Manage designations</span>
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <Btn onClick={() => { setModal(true); setEditIdx(null); setForm({ desig: "", desc: "" }); }}>+ Add</Btn>
        </div>
        <DataTable
          columns={["Designation", "Description"]}
          rows={rows.map(r => [r.desig, r.desc || "—"])}
          onEdit={i => { setForm(rows[i]); setEditIdx(i); setModal(true); }}
          onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
        />
      </Card>
      {modal && (
        <Modal title={editIdx !== null ? "Edit Designation" : "Add Designation"} onClose={() => setModal(false)}>
          <Field label="Designation" required><Input value={form.desig} onChange={e => setForm(f => ({ ...f, desig: e.target.value }))} placeholder="Designation" /></Field>
          <Field label="Description:"><Textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description" /></Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
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
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ user: "", target: "", commission: "", month: "" });

  const save = () => {
    if (!form.user || !form.target) return;
    setRows(r => [...r, [form.user, `₹${form.target}`, `${form.commission}%`, form.month]]);
    setModal(false); setForm({ user: "", target: "", commission: "", month: "" });
  };

  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom: 16 }}>Sales Targets</h2>
      <Card>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <Btn onClick={() => setModal(true)}>+ Add</Btn>
        </div>
        <DataTable
          columns={["User", "Target", "Commission %", "Month/Year"]}
          rows={rows}
          onEdit={() => {}} onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
        />
      </Card>
      {modal && (
        <Modal title="Add Sales Target" onClose={() => setModal(false)}>
          <Field label="User" required><Input value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} placeholder="Select user..." /></Field>
          <Field label="Target Amount" required><Input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="0.00" /></Field>
          <Field label="Commission %"><Input type="number" value={form.commission} onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} placeholder="0" /></Field>
          <Field label="Month/Year"><Input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
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
  const [form, setForm] = useState({ workDays: "5", workHours: "8", overtimeRate: "1.5", currency: "INR", payslipNote: "", leaveApproval: "manager", attendanceMode: "manual" });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <HRMNav />
      <h2 style={{ marginBottom: 16 }}>HRM Settings</h2>
      <Card style={{ maxWidth: 700 }}>
        <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>General Settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Working Days per Week">
            <Select value={form.workDays} onChange={e => setForm(f => ({ ...f, workDays: e.target.value }))}>
              {["5","6","7"].map(v => <option key={v}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Working Hours per Day">
            <Input type="number" value={form.workHours} onChange={e => setForm(f => ({ ...f, workHours: e.target.value }))} />
          </Field>
          <Field label="Overtime Rate Multiplier">
            <Input type="number" step="0.1" value={form.overtimeRate} onChange={e => setForm(f => ({ ...f, overtimeRate: e.target.value }))} />
          </Field>
          <Field label="Currency">
            <Select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              {["INR","USD","EUR","GBP"].map(v => <option key={v}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Leave Approval">
            <Select value={form.leaveApproval} onChange={e => setForm(f => ({ ...f, leaveApproval: e.target.value }))}>
              <option value="manager">Manager Approval</option>
              <option value="hr">HR Approval</option>
              <option value="auto">Auto Approve</option>
            </Select>
          </Field>
          <Field label="Attendance Mode">
            <Select value={form.attendanceMode} onChange={e => setForm(f => ({ ...f, attendanceMode: e.target.value }))}>
              <option value="manual">Manual Clock In/Out</option>
              <option value="biometric">Biometric</option>
              <option value="gps">GPS Based</option>
            </Select>
          </Field>
        </div>
        <Field label="Payslip Footer Note">
          <Textarea value={form.payslipNote} onChange={e => setForm(f => ({ ...f, payslipNote: e.target.value }))} placeholder="Optional note to appear on payslips..." />
        </Field>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
          <Btn onClick={save} variant="green">💾 Save Settings</Btn>
          {saved && <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>✓ Saved!</span>}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════
   ESSENTIALS MODULE
══════════════════════════════════════════ */
const ESS_TABS = [
  { label: "Essentials", path: "/essentials" },
  { label: "To Do", path: "/essentials/todo" },
  { label: "Document", path: "/essentials/document" },
  { label: "Memos", path: "/essentials/memos" },
  { label: "Reminders", path: "/essentials/reminders" },
  { label: "Messages", path: "/essentials/messages" },
  { label: "Knowledge Base", path: "/essentials/knowledge-base" },
  { label: "Settings", path: "/essentials/settings" },
];

function EssentialsNav() {
  const loc = useLocation();
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 24, flexWrap: "wrap" }}>
      {ESS_TABS.map(t => {
        const active = loc.pathname === t.path;
        return (
          <Link key={t.label} to={t.path} style={{ padding: "10px 18px", fontSize: 14, fontWeight: active ? 700 : 500, color: active ? C.green : C.muted, textDecoration: "none", borderBottom: active ? `3px solid ${C.green}` : "3px solid transparent", whiteSpace: "nowrap" }}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

function ToDoPage() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ task: "", assignedTo: "", priority: "", status: "", startDate: new Date().toISOString().slice(0, 16), endDate: "", hours: "", desc: "" });
  const [editIdx, setEditIdx] = useState(null);

  const save = () => {
    if (!form.task) return;
    const entry = [
      new Date().toLocaleDateString(),
      `TASK-${Date.now()}`,
      form.task, form.status || "Pending",
      form.startDate, form.endDate || "—",
      form.hours || "—",
      "Admin", form.assignedTo,
    ];
    if (editIdx !== null) { setRows(r => r.map((x, i) => i === editIdx ? entry : x)); setEditIdx(null); }
    else setRows(r => [...r, entry]);
    setModal(false); setForm({ task: "", assignedTo: "", priority: "", status: "", startDate: new Date().toISOString().slice(0, 16), endDate: "", hours: "", desc: "" });
  };

  return (
    <div>
      <EssentialsNav />
      <Card style={{ marginBottom: 14 }}><div style={{ fontWeight: 600 }}>🔽 Filters</div></Card>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>📋 To Do List</h3>
          <Btn onClick={() => { setModal(true); setEditIdx(null); }}>+ Add</Btn>
        </div>
        <DataTable
          columns={["Added On", "Task Id", "Task", "Status", "Start Date", "End Date", "Estimated Hours", "Assigned By", "Assigned To"]}
          rows={rows}
          onEdit={i => { setEditIdx(i); setModal(true); }}
          onDelete={i => setRows(r => r.filter((_, j) => j !== i))}
        />
      </Card>

      {modal && (
        <Modal title="Add To Do" onClose={() => setModal(false)}>
          <Field label="Task" required><Input value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} /></Field>
          <Field label="Assigned To" required>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
              <span style={{ padding: "8px 10px", background: "#f7fafc" }}>👤</span>
              <input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 14, outline: "none" }} />
            </div>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Priority:">
              <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="">Please Select</option>
                <option>Low</option><option>Medium</option><option>High</option>
              </Select>
            </Field>
            <Field label="Status:">
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="">Please Select</option>
                <option>Pending</option><option>In Progress</option><option>Completed</option>
              </Select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Start Date:" required><Input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></Field>
            <Field label="End Date:"><Input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></Field>
          </div>
          <Field label="Estimated Hours:">
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
              <span style={{ padding: "8px 10px", background: "#f7fafc" }}>🕐</span>
              <input type="number" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 14, outline: "none" }} />
            </div>
          </Field>
          <Field label="Description:">
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 6 }}>
              <div style={{ padding: "6px 10px", background: "#f7fafc", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>My Favorites · File · Edit · View · Insert · Format · Tools · Table · Help</div>
              <Textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ border: "none", borderRadius: 0, minHeight: 80 }} />
            </div>
          </Field>
          <Field label="Upload Documents:">
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: 6, padding: "28px 0", textAlign: "center", color: C.muted, fontSize: 14 }}>Drop files here to upload</div>
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={save}>Save</Btn>
            <Btn variant="dark" onClick={() => setModal(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EssentialsDashboard() {
  return (
    <div>
      <EssentialsNav />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {[["📋 To Do", "/essentials/todo"], ["📄 Documents", "/essentials/document"], ["📝 Memos", "/essentials/memos"], ["⏰ Reminders", "/essentials/reminders"], ["💬 Messages", "/essentials/messages"], ["📚 Knowledge Base", "/essentials/knowledge-base"]].map(([label, path]) => (
          <Link key={label} to={path} style={{ textDecoration: "none" }}>
            <Card style={{ cursor: "pointer", transition: "box-shadow .2s", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{label.split(" ")[0]}</div>
              <div style={{ fontWeight: 600, color: C.text }}>{label.slice(label.indexOf(" ") + 1)}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SimplePage({ title }) {
  return (
    <div>
      <EssentialsNav />
      <h2 style={{ marginBottom: 16 }}>{title}</h2>
      <Card><NoData /></Card>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT EXPORT — drop into App.jsx Routes
══════════════════════════════════════════ */
export function HRMRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<HRMDashboard />} />
      <Route path="/leave-type" element={<LeaveType />} />
      <Route path="/leave"      element={<Leave />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/payroll"    element={<Payroll />} />
      <Route path="/payroll/my" element={<MyPayrolls />} />
      <Route path="/holiday"    element={<Holiday />} />
      <Route path="/departments"  element={<Departments />} />
      <Route path="/designations" element={<Designations />} />
      <Route path="/sales-targets" element={<SalesTargets />} />
      <Route path="/settings"   element={<HRMSettings />} />
    </Routes>
  );
}

export function EssentialsRoutes() {
  return (
    <Routes>
      <Route path="/"             element={<EssentialsDashboard />} />
      <Route path="/todo"         element={<ToDoPage />} />
      <Route path="/document"     element={<SimplePage title="Documents" />} />
      <Route path="/memos"        element={<SimplePage title="Memos" />} />
      <Route path="/reminders"    element={<SimplePage title="Reminders" />} />
      <Route path="/messages"     element={<SimplePage title="Messages" />} />
      <Route path="/knowledge-base" element={<SimplePage title="Knowledge Base" />} />
      <Route path="/settings"     element={<SimplePage title="Essentials Settings" />} />
    </Routes>
  );
}
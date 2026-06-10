import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ─── colour tokens ────────────────────────────────────────────────────────
const C = {
  green:      "#1a5c38",
  greenMid:   "#256b43",
  greenLight: "#e8f4ee",
  greenHover: "#145230",
  accent:     "#f0a500",
  accentSoft: "#fff8e6",
  red:        "#d94f3d",
  redSoft:    "#fdecea",
  blue:       "#2a6db5",
  blueSoft:   "#e8f0fb",
  purple:     "#6c3fc5",
  purpleSoft: "#f0ebff",
  text:       "#1a2b23",
  textMid:    "#4a6358",
  textLight:  "#8ba898",
  border:     "#dce9e2",
  bg:         "#f0f4f1",
  card:       "#ffffff",
};

const STATUS_CONFIG = {
  planned:     { label: "Planned",     color: C.blue,   bg: C.blueSoft   },
  in_progress: { label: "In Progress", color: C.accent, bg: C.accentSoft },
  completed:   { label: "Completed",   color: C.green,  bg: C.greenLight },
  on_hold:     { label: "On Hold",     color: C.red,    bg: C.redSoft    },
};

const PRIORITY = {
  high:   { label: "High",   color: C.red    },
  medium: { label: "Medium", color: C.accent },
  low:    { label: "Low",    color: C.blue   },
};

// ─── seed data ────────────────────────────────────────────────────────────
const SEED_ORDERS = [
  { id: "WO-001", product: "Industrial Valve A3",    qty: 200, unit: "pcs",  startDate: "2026-06-10", endDate: "2026-06-18", status: "in_progress", priority: "high",   progress: 65, assignedTo: "Team Alpha", bom: [{ item: "Steel Body", req: 200, avail: 200 }, { item: "Rubber Seal", req: 400, avail: 390 }, { item: "Bolt Set", req: 800, avail: 800 }] },
  { id: "WO-002", product: "Pump Housing B7",        qty: 50,  unit: "pcs",  startDate: "2026-06-12", endDate: "2026-06-25", status: "planned",     priority: "medium", progress: 0,  assignedTo: "Team Beta",  bom: [{ item: "Cast Iron", req: 100, avail: 80  }, { item: "Gasket Kit", req: 50, avail: 50 }] },
  { id: "WO-003", product: "Control Panel CP-12",    qty: 30,  unit: "pcs",  startDate: "2026-06-05", endDate: "2026-06-11", status: "completed",   priority: "high",   progress: 100,assignedTo: "Team Gamma", bom: [{ item: "PCB Board", req: 30, avail: 30 }, { item: "Switch Module", req: 90, avail: 90 }] },
  { id: "WO-004", product: "Conveyor Belt Section",  qty: 120, unit: "mtrs", startDate: "2026-06-08", endDate: "2026-06-20", status: "on_hold",     priority: "low",    progress: 20, assignedTo: "Team Alpha", bom: [{ item: "Rubber Belt", req: 120, avail: 60 }, { item: "Frame Steel", req: 240, avail: 240 }] },
  { id: "WO-005", product: "Hydraulic Cylinder HC5", qty: 80,  unit: "pcs",  startDate: "2026-06-14", endDate: "2026-06-28", status: "planned",     priority: "high",   progress: 0,  assignedTo: "Team Beta",  bom: [{ item: "Cylinder Rod", req: 80, avail: 80 }, { item: "Seal Kit", req: 160, avail: 145 }] },
  { id: "WO-006", product: "Gear Box Assembly GX3",  qty: 40,  unit: "pcs",  startDate: "2026-06-16", endDate: "2026-06-30", status: "planned",     priority: "medium", progress: 0,  assignedTo: "Team Gamma", bom: [{ item: "Gear Set", req: 40, avail: 40 }, { item: "Housing", req: 40, avail: 35 }] },
];

const SEED_RESOURCES = [
  { id: 1, name: "CNC Machine #1",    type: "Machine",  capacity: 100, utilization: 78, status: "running",     shift: "Morning", operator: "Rajan K.",    lastMaintenance: "2026-05-20", nextMaintenance: "2026-07-20" },
  { id: 2, name: "CNC Machine #2",    type: "Machine",  capacity: 100, utilization: 45, status: "running",     shift: "Evening", operator: "Suresh M.",   lastMaintenance: "2026-06-01", nextMaintenance: "2026-08-01" },
  { id: 3, name: "Assembly Line A",   type: "Line",     capacity: 100, utilization: 90, status: "running",     shift: "Full Day",operator: "Team Alpha",   lastMaintenance: "2026-05-15", nextMaintenance: "2026-07-15" },
  { id: 4, name: "Assembly Line B",   type: "Line",     capacity: 100, utilization: 20, status: "idle",        shift: "Morning", operator: "Team Beta",    lastMaintenance: "2026-06-05", nextMaintenance: "2026-08-05" },
  { id: 5, name: "Welding Station",   type: "Station",  capacity: 100, utilization: 60, status: "running",     shift: "Morning", operator: "Dinesh P.",   lastMaintenance: "2026-05-28", nextMaintenance: "2026-07-28" },
  { id: 6, name: "Paint Booth",       type: "Station",  capacity: 100, utilization: 0,  status: "maintenance", shift: "—",       operator: "—",            lastMaintenance: "2026-06-09", nextMaintenance: "2026-06-15" },
  { id: 7, name: "Hydraulic Press",   type: "Machine",  capacity: 100, utilization: 55, status: "running",     shift: "Evening", operator: "Arun S.",     lastMaintenance: "2026-05-10", nextMaintenance: "2026-07-10" },
  { id: 8, name: "Lathe Machine #1",  type: "Machine",  capacity: 100, utilization: 0,  status: "idle",        shift: "—",       operator: "Unassigned",  lastMaintenance: "2026-04-20", nextMaintenance: "2026-06-20" },
];

// ─── helpers ──────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {};
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: cfg.color, background: cfg.bg, letterSpacing: 0.3 }}>{cfg.label}</span>;
};

const PriBadge = ({ p }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY[p]?.color }}>{PRIORITY[p]?.label?.toUpperCase()}</span>
);

const ProgressBar = ({ pct, height = 7 }) => (
  <div style={{ background: C.border, borderRadius: 4, height, width: "100%", overflow: "hidden" }}>
    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4,
      background: pct === 100 ? C.green : pct > 60 ? C.greenMid : pct > 30 ? C.accent : C.red,
      transition: "width .4s" }} />
  </div>
);

const StatCard = ({ icon, label, value, sub, color, bg }) => (
  <div style={{ background: C.card, borderRadius: 12, padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,.07)", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textMid, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color || C.textLight, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const inp = {
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px",
  fontSize: 13, color: C.text, background: "#fff", outline: "none",
  width: "100%", boxSizing: "border-box",
};
const btn = (variant = "primary") => ({
  padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
  cursor: "pointer", border: "none",
  background: variant === "primary" ? C.green : variant === "danger" ? C.red : variant === "ghost" ? "transparent" : C.border,
  color: variant === "primary" || variant === "danger" ? "#fff" : variant === "ghost" ? C.textMid : C.text,
});

// ══════════════════════════════════════════════════════════════════════════
export default function ProductionPlanning() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read tab from URL query param
  const qp  = new URLSearchParams(location.search);
  const tab = qp.get("tab") || "orders";

  function setTab(t) {
    navigate(t === "orders" ? "/production-planning" : `/production-planning?tab=${t}`, { replace: true });
  }

  const [orders, setOrders]   = useState(SEED_ORDERS);
  const [resources, setResources] = useState(SEED_RESOURCES);
  const [filterStatus, setFilt]   = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [showResForm, setShowResForm] = useState(false);
  const [editRes, setEditRes]         = useState(null);
  const [form, setForm] = useState({ product: "", qty: "", unit: "pcs", startDate: "", endDate: "", priority: "medium", assignedTo: "" });
  const [resForm, setResForm] = useState({ name: "", type: "Machine", capacity: 100, shift: "Morning", operator: "" });

  const filteredOrders = orders.filter(o =>
    (filterStatus === "all" || o.status === filterStatus) &&
    (o.product.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  );

  const filteredRes = resources.filter(r =>
    (filterType === "all" || r.type === filterType) &&
    (r.name.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total:      orders.length,
    inProgress: orders.filter(o => o.status === "in_progress").length,
    planned:    orders.filter(o => o.status === "planned").length,
    completed:  orders.filter(o => o.status === "completed").length,
  };

  function addOrder() {
    if (!form.product || !form.qty || !form.startDate || !form.endDate) return;
    setOrders([...orders, {
      id: `WO-${String(orders.length + 1).padStart(3,"0")}`,
      product: form.product, qty: +form.qty, unit: form.unit,
      startDate: form.startDate, endDate: form.endDate,
      status: "planned", priority: form.priority, progress: 0,
      assignedTo: form.assignedTo || "Unassigned", bom: [],
    }]);
    setShowForm(false);
    setForm({ product: "", qty: "", unit: "pcs", startDate: "", endDate: "", priority: "medium", assignedTo: "" });
  }

  function updateStatus(id, status) {
    setOrders(orders.map(o => o.id === id ? { ...o, status,
      progress: status === "completed" ? 100 : status === "planned" ? 0 : o.progress } : o));
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
  }

  function saveResource() {
    if (!resForm.name) return;
    if (editRes) {
      setResources(resources.map(r => r.id === editRes.id ? { ...r, ...resForm } : r));
    } else {
      setResources([...resources, { id: Date.now(), ...resForm, utilization: 0, status: "idle", lastMaintenance: "—", nextMaintenance: "—" }]);
    }
    setShowResForm(false); setEditRes(null);
    setResForm({ name: "", type: "Machine", capacity: 100, shift: "Morning", operator: "" });
  }

  function deleteResource(id) {
    setResources(resources.filter(r => r.id !== id));
  }

  // ── Resource status color ───────────────────────────────────────────────
  function resColor(status) {
    return status === "running" ? C.green : status === "idle" ? C.accent : C.red;
  }
  function resBg(status) {
    return status === "running" ? C.greenLight : status === "idle" ? C.accentSoft : C.redSoft;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🏭 Production Planning</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMid }}>Manage work orders, resources & production schedules</p>
        </div>
        {tab === "orders" && <button style={btn("primary")} onClick={() => setShowForm(true)}>+ New Work Order</button>}
        {tab === "resources" && <button style={btn("primary")} onClick={() => { setEditRes(null); setShowResForm(true); }}>+ Add Resource</button>}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="📋" label="Total Work Orders" value={stats.total}      bg={C.greenLight} />
        <StatCard icon="⚙️" label="In Progress"       value={stats.inProgress} bg={C.accentSoft} color={C.accent} sub="Active production" />
        <StatCard icon="🕒" label="Planned"           value={stats.planned}    bg={C.blueSoft}   color={C.blue}   sub="Queued" />
        <StatCard icon="✅" label="Completed"         value={stats.completed}  bg={C.greenLight} color={C.green}  sub="This month" />
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24,
        background: C.card, padding: 6, borderRadius: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,.07)", width: "fit-content" }}>
        {[
          ["orders",    "Work Orders", "📋", stats.total],
          ["resources", "Resources",   "🔧", resources.length],
          ["schedule",  "Schedule",    "📅", null],
        ].map(([k, label, icon, count]) => {
          const active = tab === k;
          return (
            <button key={k} onClick={() => setTab(k)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13, transition: "all .18s",
              background: active ? C.green : "transparent",
              color: active ? "#fff" : C.textMid,
              boxShadow: active ? "0 2px 8px rgba(26,92,56,.25)" : "none",
            }}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span>{label}</span>
              {count !== null && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: active ? "rgba(255,255,255,0.22)" : C.greenLight,
                  color: active ? "#fff" : C.green,
                  borderRadius: 20, padding: "1px 7px", lineHeight: "18px",
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══ WORK ORDERS TAB ═══════════════════════════════════════════════ */}
      {tab === "orders" && (
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input placeholder="Search product or WO ID…" value={search}
                onChange={e => setSearch(e.target.value)} style={{ ...inp, width: 220 }} />
              <select value={filterStatus} onChange={e => setFilt(e.target.value)} style={{ ...inp, width: 150 }}>
                <option value="all">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{ background: C.card, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.greenLight, textAlign: "left" }}>
                    {["WO ID","Product","Qty","Priority","Dates","Progress","Status",""].map(h => (
                      <th key={h} style={{ padding: "10px 14px", fontWeight: 600, fontSize: 11, color: C.greenMid, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o, i) => (
                    <tr key={o.id} onClick={() => setSelected(o)}
                      style={{ borderTop: `1px solid ${C.border}`,
                        background: selected?.id === o.id ? C.greenLight : i%2===0 ? "#fff" : "#fafcfb",
                        cursor: "pointer" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: C.green }}>{o.id}</td>
                      <td style={{ padding: "12px 14px" }}>{o.product}</td>
                      <td style={{ padding: "12px 14px", color: C.textMid }}>{o.qty} {o.unit}</td>
                      <td style={{ padding: "12px 14px" }}><PriBadge p={o.priority} /></td>
                      <td style={{ padding: "12px 14px", fontSize: 11, color: C.textMid, whiteSpace: "nowrap" }}>{o.startDate}<br/>{o.endDate}</td>
                      <td style={{ padding: "12px 14px", minWidth: 100 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <ProgressBar pct={o.progress} />
                          <span style={{ fontSize: 11, color: C.textMid, whiteSpace: "nowrap" }}>{o.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}><Badge status={o.status} /></td>
                      <td style={{ padding: "12px 14px" }}>
                        <select value={o.status} onClick={e => e.stopPropagation()}
                          onChange={e => updateStatus(o.id, e.target.value)}
                          style={{ ...inp, width: 120, fontSize: 11, padding: "4px 8px" }}>
                          {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: C.textLight }}>No work orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ width: 300, background: C.card, borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,.07)", padding: 20, flexShrink: 0,
              alignSelf: "flex-start", position: "sticky", top: 80 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{selected.id}</span>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.textLight }}>×</button>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selected.product}</div>
              <div style={{ fontSize: 12, color: C.textMid, marginBottom: 14 }}>{selected.qty} {selected.unit} · {selected.assignedTo}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}><Badge status={selected.status} /><PriBadge p={selected.priority} /></div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4, fontWeight: 600 }}>PROGRESS</div>
                <ProgressBar pct={selected.progress} />
                <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>{selected.progress}% complete</div>
              </div>
              <div style={{ fontSize: 11, color: C.textMid, marginBottom: 14 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>TIMELINE</div>
                <div>Start: {selected.startDate}</div><div>End: {selected.endDate}</div>
              </div>
              {selected.bom.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>BILL OF MATERIALS</div>
                  {selected.bom.map((b, i) => {
                    const ok = b.avail >= b.req;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between",
                        padding: "7px 10px", borderRadius: 8, marginBottom: 4,
                        background: ok ? C.greenLight : C.redSoft, fontSize: 12 }}>
                        <span>{b.item}</span>
                        <span style={{ fontWeight: 600, color: ok ? C.green : C.red }}>{b.avail}/{b.req}{!ok && " ⚠️"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ RESOURCES TAB ═════════════════════════════════════════════════ */}
      {tab === "resources" && (
        <div>
          {/* Resource summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            <StatCard icon="🏗️" label="Total Resources"    value={resources.length}                                   bg={C.greenLight} />
            <StatCard icon="▶️" label="Running"            value={resources.filter(r=>r.status==="running").length}    bg={C.greenLight} color={C.green}  sub="Active now" />
            <StatCard icon="⏸️" label="Idle"               value={resources.filter(r=>r.status==="idle").length}       bg={C.accentSoft} color={C.accent} sub="Not assigned" />
            <StatCard icon="🔧" label="Under Maintenance"  value={resources.filter(r=>r.status==="maintenance").length} bg={C.redSoft}    color={C.red}    sub="Down time" />
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input placeholder="Search resource…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ ...inp, width: 220 }} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inp, width: 150 }}>
              <option value="all">All Types</option>
              {["Machine","Line","Station"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Resource cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {filteredRes.map(r => (
              <div key={r.id} style={{ background: C.card, borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,.07)", padding: 20,
                borderTop: `3px solid ${resColor(r.status)}` }}>
                {/* card header */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{r.type}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    color: resColor(r.status), background: resBg(r.status), alignSelf: "flex-start", whiteSpace: "nowrap" }}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>

                {/* utilization bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMid, marginBottom: 4 }}>
                    <span>Utilization</span>
                    <span style={{ fontWeight: 600, color: r.utilization > 85 ? C.red : r.utilization > 50 ? C.green : C.accent }}>
                      {r.utilization}%
                    </span>
                  </div>
                  <ProgressBar pct={r.utilization} height={8} />
                </div>

                {/* details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    ["Capacity", `${r.capacity} u/day`],
                    ["Shift", r.shift],
                    ["Operator", r.operator],
                    ["Next Maint.", r.nextMaintenance],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ background: C.bg, borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    setEditRes(r);
                    setResForm({ name: r.name, type: r.type, capacity: r.capacity, shift: r.shift, operator: r.operator });
                    setShowResForm(true);
                  }} style={{ ...btn("secondary"), flex: 1, fontSize: 12, padding: "7px 0" }}>✏️ Edit</button>
                  <select value={r.status}
                    onChange={e => setResources(resources.map(x => x.id===r.id ? {...x, status: e.target.value} : x))}
                    style={{ ...inp, flex: 1, fontSize: 12, padding: "7px 8px" }}>
                    {["running","idle","maintenance"].map(s =>
                      <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <button onClick={() => deleteResource(r.id)}
                    style={{ ...btn("danger"), fontSize: 12, padding: "7px 12px" }}>🗑</button>
                </div>
              </div>
            ))}

            {filteredRes.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: C.textLight, background: C.card, borderRadius: 12 }}>
                No resources found
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SCHEDULE TAB ══════════════════════════════════════════════════ */}
      {tab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            <StatCard icon="📅" label="Active This Month"  value={orders.filter(o=>o.status!=="completed").length} bg={C.blueSoft}   color={C.blue} />
            <StatCard icon="⚡" label="Overdue / At Risk"  value={orders.filter(o=>o.status==="on_hold").length}   bg={C.redSoft}    color={C.red}  sub="On hold" />
            <StatCard icon="🎯" label="On Track"           value={orders.filter(o=>o.status==="in_progress").length} bg={C.greenLight} color={C.green} sub="In progress" />
            <StatCard icon="📦" label="Queued"             value={orders.filter(o=>o.status==="planned").length}   bg={C.accentSoft} color={C.accent} sub="Not started" />
          </div>

          {/* Gantt card */}
          <div style={{ background: C.card, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.07)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>📅 Gantt Schedule — June 2026</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Production timeline across all work orders</div>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: v.color }} />
                    <span style={{ color: C.textMid }}>{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "20px 24px", overflowX: "auto" }}>
              {(() => {
                const days = Array.from({length: 30}, (_,i) => i+1);
                const today = 10;
                return (
                  <div style={{ minWidth: 700 }}>
                    {/* day header */}
                    <div style={{ display: "flex", marginBottom: 12 }}>
                      <div style={{ width: 220, flexShrink: 0 }} />
                      <div style={{ flex: 1, display: "flex" }}>
                        {days.map(d => (
                          <div key={d} style={{ flex: 1, textAlign: "center",
                            fontSize: d % 5 === 0 || d === today ? 10 : 0,
                            fontWeight: d === today ? 800 : 500,
                            color: d === today ? C.green : C.textLight }}>
                            {d % 5 === 0 || d === today ? d : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* today line marker */}
                    <div style={{ position: "relative" }}>
                      {orders.map((o, idx) => {
                        const s    = +o.startDate.split("-")[2];
                        const e    = +o.endDate.split("-")[2];
                        const cfg  = STATUS_CONFIG[o.status];
                        const left = `${(s-1)/30*100}%`;
                        const width= `${(e-s+1)/30*100}%`;
                        return (
                          <div key={o.id} style={{ display: "flex", alignItems: "center",
                            marginBottom: 10, position: "relative" }}>
                            {/* today marker */}
                            {idx === 0 && (
                              <div style={{ position: "absolute", left: `calc(220px + ${(today-1)/30*(100)}%)`,
                                top: -8, bottom: -8, width: 2, background: C.green,
                                zIndex: 10, pointerEvents: "none" }} />
                            )}
                            <div style={{ width: 220, flexShrink: 0, paddingRight: 16 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{o.id}</div>
                              <div style={{ fontSize: 11, color: C.textMid, whiteSpace: "nowrap",
                                overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{o.product}</div>
                            </div>
                            <div style={{ flex: 1, position: "relative", height: 32, background: C.bg, borderRadius: 4 }}>
                              {/* bar */}
                              <div style={{ position: "absolute", height: "100%", left, width,
                                background: cfg.color, borderRadius: 6, opacity: 0.9,
                                display: "flex", alignItems: "center", paddingLeft: 8, overflow: "hidden" }}>
                                {/* progress overlay */}
                                <div style={{ position: "absolute", left: 0, top: 0, height: "100%",
                                  width: `${o.progress}%`, background: "rgba(0,0,0,0.2)", borderRadius: 6 }} />
                                <span style={{ fontSize: 10, color: "#fff", fontWeight: 700,
                                  position: "relative", zIndex: 1, whiteSpace: "nowrap" }}>
                                  {o.progress}% · {o.assignedTo}
                                </span>
                              </div>
                            </div>
                            <div style={{ width: 60, textAlign: "right", fontSize: 11, color: C.textMid, paddingLeft: 10, flexShrink: 0 }}>
                              {o.endDate.slice(5)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Per-team workload table */}
          <div style={{ background: C.card, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.07)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 15 }}>
              👥 Team Workload
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.greenLight }}>
                  {["Team","Assigned Orders","Total Qty","Completion Avg","Status Breakdown"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontWeight: 600, fontSize: 11,
                      color: C.greenMid, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Team Alpha","Team Beta","Team Gamma"].map((team, ti) => {
                  const teamOrders = orders.filter(o => o.assignedTo === team);
                  const avgProgress = teamOrders.length
                    ? Math.round(teamOrders.reduce((a,o) => a + o.progress, 0) / teamOrders.length)
                    : 0;
                  const totalQty = teamOrders.reduce((a,o) => a + o.qty, 0);
                  const statusCounts = teamOrders.reduce((acc, o) => { acc[o.status] = (acc[o.status]||0)+1; return acc; }, {});
                  return (
                    <tr key={team} style={{ borderTop: `1px solid ${C.border}`, background: ti%2===0?"#fff":"#fafcfb" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>{team}</td>
                      <td style={{ padding: "12px 16px", color: C.textMid }}>{teamOrders.length} orders</td>
                      <td style={{ padding: "12px 16px", color: C.textMid }}>{totalQty.toLocaleString()} units</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, maxWidth: 100 }}><ProgressBar pct={avgProgress} /></div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{avgProgress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {Object.entries(statusCounts).map(([s,n]) => (
                            <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px",
                              borderRadius: 12, color: STATUS_CONFIG[s]?.color, background: STATUS_CONFIG[s]?.bg }}>
                              {STATUS_CONFIG[s]?.label} ×{n}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ NEW WORK ORDER MODAL ══════════════════════════════════════════ */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 32,
            width: 480, boxShadow: "0 8px 32px rgba(0,0,0,.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>New Work Order</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textLight }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Product Name *</label>
                <input style={inp} value={form.product} onChange={e => setForm({...form, product: e.target.value})} placeholder="e.g. Industrial Valve A3" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Quantity *</label>
                <input style={inp} type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} placeholder="100" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Unit</label>
                <select style={inp} value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                  {["pcs","kg","mtrs","ltrs","boxes"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Start Date *</label>
                <input style={inp} type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>End Date *</label>
                <input style={inp} type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Priority</label>
                <select style={inp} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  {Object.entries(PRIORITY).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Assigned Team</label>
                <input style={inp} value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} placeholder="e.g. Team Alpha" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button style={btn("ghost")} onClick={() => setShowForm(false)}>Cancel</button>
              <button style={btn("primary")} onClick={addOrder}>Create Work Order</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD / EDIT RESOURCE MODAL ═════════════════════════════════════ */}
      {showResForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 32,
            width: 460, boxShadow: "0 8px 32px rgba(0,0,0,.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{editRes ? "Edit Resource" : "Add Resource"}</h2>
              <button onClick={() => { setShowResForm(false); setEditRes(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textLight }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Resource Name *</label>
                <input style={inp} value={resForm.name} onChange={e => setResForm({...resForm, name: e.target.value})} placeholder="e.g. CNC Machine #3" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Type</label>
                <select style={inp} value={resForm.type} onChange={e => setResForm({...resForm, type: e.target.value})}>
                  {["Machine","Line","Station"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Capacity (units/day)</label>
                <input style={inp} type="number" value={resForm.capacity} onChange={e => setResForm({...resForm, capacity: +e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Shift</label>
                <select style={inp} value={resForm.shift} onChange={e => setResForm({...resForm, shift: e.target.value})}>
                  {["Morning","Evening","Full Day","Night"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 4 }}>Operator / Team</label>
                <input style={inp} value={resForm.operator} onChange={e => setResForm({...resForm, operator: e.target.value})} placeholder="e.g. Rajan K." />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button style={btn("ghost")} onClick={() => { setShowResForm(false); setEditRes(null); }}>Cancel</button>
              <button style={btn("primary")} onClick={saveResource}>{editRes ? "Save Changes" : "Add Resource"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
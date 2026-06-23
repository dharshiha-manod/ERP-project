import { useState, useMemo } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  green: "#1a5c38", greenDark: "#134429", greenMid: "#256b43",
  greenLight: "#e8f4ee", greenFaint: "#f2faf5",
  accent: "#f0a500", accentSoft: "#fff8e6",
  red: "#c0392b", redSoft: "#fdf0ef",
  blue: "#2563eb", blueSoft: "#eff6ff",
  purple: "#7c3aed", purpleSoft: "#f5f3ff",
  amber: "#d97706", amberSoft: "#fffbeb",
  teal: "#0d9488", tealSoft: "#f0fdfa",
  text: "#111827", textMid: "#4b5563", textLight: "#9ca3af",
  border: "#e5e7eb", borderMid: "#d1d5db",
  bg: "#f8fafc", card: "#ffffff",
  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08)",
};

// ─── Reusable Primitives ─────────────────────────────────────────────────────

const Badge = ({ label, color = T.green, bg = T.greenLight, dot }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
    color, background: bg, letterSpacing: 0.3, whiteSpace: "nowrap",
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />}
    {label}
  </span>
);

const KPI = ({ icon, label, value, sub, color = T.green, bg = T.greenLight, trend }) => (
  <div style={{
    background: T.card, borderRadius: 12, padding: "20px 22px",
    border: `1px solid ${T.border}`, boxShadow: T.shadow,
    display: "flex", alignItems: "flex-start", gap: 16,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
    }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textMid, marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: trend === "up" ? T.green : trend === "dn" ? T.red : T.textLight, marginTop: 3 }}>{sub}</div>}
    </div>
  </div>
);

const ProgressBar = ({ pct, color, height = 6 }) => {
  const c = color || (pct === 100 ? T.green : pct > 60 ? T.greenMid : pct > 30 ? T.accent : T.red);
  return (
    <div style={{ background: T.border, borderRadius: 4, height, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 4, transition: "width .3s" }} />
    </div>
  );
};

const StatusDot = ({ status }) => {
  const map = {
    active: T.green, running: T.green, completed: T.green, approved: T.green,
    planned: T.blue, in_progress: T.accent, pending: T.accent, scheduled: T.blue,
    on_hold: T.red, idle: T.textLight, maintenance: T.red, failed: T.red,
    draft: T.textLight, rejected: T.red,
  };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: map[status] || T.textLight, marginRight: 6 }} />;
};

const Input = ({ label, ...props }) => (
  <div>
    {label && <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 5 }}>{label}</div>}
    <input {...props} style={{
      width: "100%", border: `1px solid ${T.borderMid}`, borderRadius: 8,
      padding: "8px 12px", fontSize: 13, color: T.text, background: T.card,
      outline: "none", boxSizing: "border-box", ...props.style,
    }} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    {label && <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 5 }}>{label}</div>}
    <select {...props} style={{
      width: "100%", border: `1px solid ${T.borderMid}`, borderRadius: 8,
      padding: "8px 12px", fontSize: 13, color: T.text, background: T.card,
      outline: "none", boxSizing: "border-box", ...props.style,
    }}>{children}</select>
  </div>
);

const Btn = ({ children, variant = "primary", size = "md", ...props }) => {
  const styles = {
    primary: { background: T.green, color: "#fff", border: "none" },
    secondary: { background: "#fff", color: T.text, border: `1px solid ${T.borderMid}` },
    danger: { background: T.red, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: T.textMid, border: `1px solid ${T.border}` },
    success: { background: "#059669", color: "#fff", border: "none" },
  };
  const sizes = { sm: "6px 12px", md: "8px 16px", lg: "10px 22px" };
  return (
    <button {...props} style={{
      ...styles[variant], padding: sizes[size], borderRadius: 8,
      fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex",
      alignItems: "center", gap: 6, transition: "all .15s", ...props.style,
    }}>{children}</button>
  );
};

const SectionHeader = ({ title, sub, actions }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>{title}</h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textMid }}>{sub}</p>}
    </div>
    {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: T.shadow, ...style }}>
    {children}
  </div>
);

const Th = ({ children, style }) => (
  <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.6, background: T.bg, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap", ...style }}>{children}</th>
);
const Td = ({ children, style }) => (
  <td style={{ padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, ...style }}>{children}</td>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, width = 540 }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
  }}>
    <div style={{
      background: T.card, borderRadius: 16, padding: 32, width, maxWidth: "95vw",
      maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.textLight, lineHeight: 1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const ModalFooter = ({ onClose, onSave, saveLabel = "Save" }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
    <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
    <Btn variant="primary" onClick={onSave}>{saveLabel}</Btn>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const el = toast ? (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: T.card, borderRadius: 10, padding: "12px 20px",
      boxShadow: T.shadowMd, borderLeft: `4px solid ${toast.type === "success" ? T.green : toast.type === "error" ? T.red : T.blue}`,
      display: "flex", alignItems: "center", gap: 10, minWidth: 260,
      animation: "fadeUp .2s ease",
    }}>
      <style>{`@keyframes fadeUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <span style={{ fontSize: 16 }}>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
      <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{toast.msg}</span>
    </div>
  ) : null;
  return { show, Toast: el };
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — PRODUCTION PLANNING (Kanban + Gantt overview)
// ═══════════════════════════════════════════════════════════════════════════════
const WO_SEED = [
  { id: "WO-001", product: "Industrial Valve A3", qty: 200, unit: "pcs", start: "2026-06-10", end: "2026-06-18", status: "in_progress", priority: "high", pct: 65, team: "Team Alpha" },
  { id: "WO-002", product: "Pump Housing B7", qty: 50, unit: "pcs", start: "2026-06-12", end: "2026-06-25", status: "planned", priority: "medium", pct: 0, team: "Team Beta" },
  { id: "WO-003", product: "Control Panel CP-12", qty: 30, unit: "pcs", start: "2026-06-05", end: "2026-06-11", status: "completed", priority: "high", pct: 100, team: "Team Gamma" },
  { id: "WO-004", product: "Conveyor Belt Section", qty: 120, unit: "mtrs", start: "2026-06-08", end: "2026-06-20", status: "on_hold", priority: "low", pct: 20, team: "Team Alpha" },
  { id: "WO-005", product: "Hydraulic Cylinder HC5", qty: 80, unit: "pcs", start: "2026-06-14", end: "2026-06-28", status: "planned", priority: "high", pct: 0, team: "Team Beta" },
  { id: "WO-006", product: "Gear Box Assembly GX3", qty: 40, unit: "pcs", start: "2026-06-16", end: "2026-06-30", status: "planned", priority: "medium", pct: 0, team: "Team Gamma" },
];

const PRIORITY_CFG = {
  high: { label: "High", color: T.red, bg: "#fdf0ef" },
  medium: { label: "Medium", color: T.amber, bg: "#fffbeb" },
  low: { label: "Low", color: T.blue, bg: T.blueSoft },
};
const STATUS_CFG = {
  planned: { label: "Planned", color: T.blue, bg: T.blueSoft },
  in_progress: { label: "In Progress", color: T.amber, bg: T.amberSoft },
  completed: { label: "Completed", color: T.green, bg: T.greenLight },
  on_hold: { label: "On Hold", color: T.red, bg: T.redSoft },
};

function ProductionPlanningPage() {
  const [orders, setOrders] = useState(WO_SEED);
  const [view, setView] = useState("kanban");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product: "", qty: "", unit: "pcs", start: "", end: "", priority: "medium", team: "" });
  const { show, Toast } = useToast();

  const cols = [
    { key: "planned", label: "Planned", color: T.blue },
    { key: "in_progress", label: "In Progress", color: T.amber },
    { key: "completed", label: "Completed", color: T.green },
    { key: "on_hold", label: "On Hold", color: T.red },
  ];

  const addOrder = () => {
    if (!form.product || !form.qty) { show("Fill required fields", "error"); return; }
    setOrders(o => [...o, { ...form, id: `WO-00${o.length + 1}`, qty: +form.qty, status: "planned", pct: 0 }]);
    setShowModal(false); show("Work order created"); setForm({ product: "", qty: "", unit: "pcs", start: "", end: "", priority: "medium", team: "" });
  };

  const ganttDays = Array.from({ length: 21 }, (_, i) => i + 10);

  return (
    <div>
      {Toast}
      <SectionHeader
        title="Production Planning"
        sub="Track work orders across stages · June 2026"
        actions={<>
          <div style={{ display: "flex", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            {["kanban", "gantt"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "7px 16px", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: view === v ? T.green : "transparent", color: view === v ? "#fff" : T.textMid,
              }}>{v === "kanban" ? "⊞ Kanban" : "📅 Gantt"}</button>
            ))}
          </div>
          <Btn onClick={() => setShowModal(true)}>＋ New Work Order</Btn>
        </>}
      />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="📋" label="Total Orders" value={orders.length} bg={T.greenLight} />
        <KPI icon="⚙️" label="In Progress" value={orders.filter(o => o.status === "in_progress").length} bg={T.amberSoft} color={T.amber} sub="Active now" />
        <KPI icon="🕐" label="Planned" value={orders.filter(o => o.status === "planned").length} bg={T.blueSoft} color={T.blue} sub="Queued" />
        <KPI icon="✅" label="Completed" value={orders.filter(o => o.status === "completed").length} bg={T.greenLight} color={T.green} sub="This month" trend="up" />
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {cols.map(col => (
            <div key={col.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{col.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: col.color + "20", color: col.color, padding: "2px 8px", borderRadius: 12 }}>
                  {orders.filter(o => o.status === col.key).length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orders.filter(o => o.status === col.key).map(o => (
                  <Card key={o.id} style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{o.id}</span>
                      <Badge label={PRIORITY_CFG[o.priority].label} color={PRIORITY_CFG[o.priority].color} bg={PRIORITY_CFG[o.priority].bg} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 6 }}>{o.product}</div>
                    <div style={{ fontSize: 11, color: T.textMid, marginBottom: 10 }}>{o.qty} {o.unit} · {o.team}</div>
                    {o.pct > 0 && <><ProgressBar pct={o.pct} /><div style={{ fontSize: 11, color: T.textMid, marginTop: 4 }}>{o.pct}% done</div></>}
                    <div style={{ fontSize: 11, color: T.textLight, marginTop: 8 }}>{o.start} → {o.end}</div>
                    <select value={o.status} onChange={e => setOrders(orders.map(x => x.id === o.id ? { ...x, status: e.target.value } : x))}
                      style={{ marginTop: 10, width: "100%", fontSize: 11, border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: "4px 8px", color: T.text, background: T.bg, cursor: "pointer" }}>
                      {cols.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gantt View */}
      {view === "gantt" && (
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14 }}>
            📅 Gantt — June 2026
          </div>
          <div style={{ padding: 20, overflowX: "auto" }}>
            <div style={{ minWidth: 700 }}>
              <div style={{ display: "flex", marginBottom: 8 }}>
                <div style={{ width: 200, flexShrink: 0 }} />
                {ganttDays.map(d => (
                  <div key={d} style={{ flex: 1, textAlign: "center", fontSize: 10, color: d === 23 ? T.green : T.textLight, fontWeight: d === 23 ? 800 : 400 }}>
                    {d % 5 === 0 || d === 23 ? d : ""}
                  </div>
                ))}
              </div>
              {orders.map(o => {
                const s = +o.start.split("-")[2];
                const e = +o.end.split("-")[2];
                const left = `${Math.max(0, (s - 10) / 21 * 100)}%`;
                const width = `${Math.min(100, (e - Math.max(s, 10) + 1) / 21 * 100)}%`;
                const cfg = STATUS_CFG[o.status];
                return (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 200, flexShrink: 0, paddingRight: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{o.id}</div>
                      <div style={{ fontSize: 11, color: T.textMid, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{o.product}</div>
                    </div>
                    <div style={{ flex: 1, position: "relative", height: 28, background: T.bg, borderRadius: 4 }}>
                      <div style={{ position: "absolute", height: "100%", left, width, background: cfg.color, borderRadius: 6, opacity: 0.85, display: "flex", alignItems: "center", paddingLeft: 8, overflow: "hidden" }}>
                        <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>{o.pct}% · {o.team}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {showModal && (
        <Modal title="New Work Order" onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Product Name *" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Industrial Valve A3" /></div>
            <Input label="Quantity *" type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
            <Select label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              {["pcs", "kg", "mtrs", "ltrs", "boxes"].map(u => <option key={u}>{u}</option>)}
            </Select>
            <Input label="Start Date *" type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} />
            <Input label="End Date *" type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} />
            <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Input label="Assigned Team" value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} placeholder="e.g. Team Alpha" />
          </div>
          <ModalFooter onClose={() => setShowModal(false)} onSave={addOrder} saveLabel="Create Work Order" />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — BILL OF MATERIALS
// ═══════════════════════════════════════════════════════════════════════════════
const BOM_SEED = [
  { id: "BOM-001", product: "Industrial Valve A3", version: "v2.1", components: 8, cost: "₹4,250", status: "active", lastUpdated: "2026-06-10" },
  { id: "BOM-002", product: "Pump Housing B7", version: "v1.0", components: 5, cost: "₹2,800", status: "active", lastUpdated: "2026-06-08" },
  { id: "BOM-003", product: "Control Panel CP-12", version: "v3.0", components: 12, cost: "₹8,900", status: "draft", lastUpdated: "2026-06-05" },
  { id: "BOM-004", product: "Gear Box Assembly", version: "v1.2", components: 6, cost: "₹3,600", status: "active", lastUpdated: "2026-06-01" },
];

const BOM_ITEMS = [
  { item: "Steel Body", partNo: "ST-001", qty: 1, unit: "pcs", unitCost: "₹800", totalCost: "₹800", supplier: "Tamil Steel Co." },
  { item: "Rubber Seal Kit", partNo: "RS-044", qty: 4, unit: "pcs", unitCost: "₹120", totalCost: "₹480", supplier: "RubberTech" },
  { item: "Bolt Set M12", partNo: "BT-012", qty: 8, unit: "pcs", unitCost: "₹25", totalCost: "₹200", supplier: "Fastener Hub" },
  { item: "Stainless Shaft", partNo: "SS-203", qty: 1, unit: "pcs", unitCost: "₹1,200", totalCost: "₹1,200", supplier: "Stainless Works" },
  { item: "Pressure Gasket", partNo: "PG-011", qty: 2, unit: "pcs", unitCost: "₹180", totalCost: "₹360", supplier: "Sealtech" },
];

function BOMPage() {
  const { show, Toast } = useToast();
  const [selected, setSelected] = useState(BOM_SEED[0]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {Toast}
      <SectionHeader
        title="Bill of Materials"
        sub="Define component structures for manufactured products"
        actions={<Btn onClick={() => setShowModal(true)}>＋ New BOM</Btn>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="📄" label="Total BOMs" value={BOM_SEED.length} bg={T.greenLight} />
        <KPI icon="✅" label="Active" value={BOM_SEED.filter(b => b.status === "active").length} bg={T.greenLight} color={T.green} />
        <KPI icon="✏️" label="Draft" value={BOM_SEED.filter(b => b.status === "draft").length} bg={T.amberSoft} color={T.amber} />
        <KPI icon="🔩" label="Avg Components" value={Math.round(BOM_SEED.reduce((a, b) => a + b.components, 0) / BOM_SEED.length)} bg={T.blueSoft} color={T.blue} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
        {/* BOM List */}
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13 }}>All BOMs</div>
          <div>
            {BOM_SEED.map(b => (
              <div key={b.id} onClick={() => setSelected(b)} style={{
                padding: "14px 16px", cursor: "pointer", borderBottom: `1px solid ${T.border}`,
                background: selected?.id === b.id ? T.greenFaint : "transparent",
                borderLeft: selected?.id === b.id ? `3px solid ${T.green}` : "3px solid transparent",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{b.id}</span>
                  <Badge label={b.status} color={b.status === "active" ? T.green : T.amber} bg={b.status === "active" ? T.greenLight : T.amberSoft} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{b.product}</div>
                <div style={{ fontSize: 11, color: T.textMid, marginTop: 3 }}>{b.version} · {b.components} components · {b.cost}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* BOM Detail */}
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>{selected?.id}</span>
                <h3 style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: T.text }}>{selected?.product}</h3>
                <span style={{ fontSize: 12, color: T.textMid }}>{selected?.version} · Updated {selected?.lastUpdated}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" size="sm">📋 Duplicate</Btn>
                <Btn variant="primary" size="sm">✏️ Edit BOM</Btn>
              </div>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th>#</Th><Th>Component</Th><Th>Part No.</Th><Th>Qty</Th><Th>Unit</Th><Th>Unit Cost</Th><Th>Total Cost</Th><Th>Supplier</Th>
                </tr>
              </thead>
              <tbody>
                {BOM_ITEMS.map((item, i) => (
                  <tr key={i}>
                    <Td><span style={{ color: T.textLight, fontWeight: 700 }}>{i + 1}</span></Td>
                    <Td><span style={{ fontWeight: 600 }}>{item.item}</span></Td>
                    <Td><code style={{ fontSize: 11, background: T.bg, padding: "2px 6px", borderRadius: 4 }}>{item.partNo}</code></Td>
                    <Td>{item.qty}</Td>
                    <Td>{item.unit}</Td>
                    <Td>{item.unitCost}</Td>
                    <Td><span style={{ fontWeight: 700 }}>{item.totalCost}</span></Td>
                    <Td><span style={{ fontSize: 11, color: T.textMid }}>{item.supplier}</span></Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} style={{ padding: "12px 14px", fontWeight: 700, fontSize: 13, color: T.textMid }}>Total BOM Cost</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 14, color: T.green }}>{selected?.cost}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>

      {showModal && (
        <Modal title="New Bill of Materials" onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Select label="Product *"><option>Select product...</option></Select></div>
            <Input label="Version" placeholder="e.g. v1.0" />
            <Select label="Status"><option>Draft</option><option>Active</option></Select>
          </div>
          <ModalFooter onClose={() => setShowModal(false)} onSave={() => { show("BOM created"); setShowModal(false); }} saveLabel="Create BOM" />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — WORK ORDERS (table-focused with filters)
// ═══════════════════════════════════════════════════════════════════════════════
function WorkOrdersPage() {
  const [orders, setOrders] = useState(WO_SEED);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { show, Toast } = useToast();

  const filtered = orders.filter(o =>
    (filter === "all" || o.status === filter) &&
    (o.product.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  );

  return (
    <div>
      {Toast}
      <SectionHeader
        title="Work Orders"
        sub="Manage and track all manufacturing work orders"
        actions={<Btn onClick={() => { setEditItem(null); setShowModal(true); }}>＋ New Work Order</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {Object.entries(STATUS_CFG).map(([k, v]) => (
          <KPI key={k} icon={k === "completed" ? "✅" : k === "in_progress" ? "⚙️" : k === "planned" ? "🕐" : "⏸️"}
            label={v.label} value={orders.filter(o => o.status === k).length}
            bg={v.bg} color={v.color} />
        ))}
      </div>

      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search orders..."
            style={{ border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none", width: 220 }} />
          {["all", ...Object.keys(STATUS_CFG)].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: filter === s ? T.green : T.bg, color: filter === s ? "#fff" : T.textMid,
            }}>{s === "all" ? "All" : STATUS_CFG[s]?.label}</button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 12, color: T.textLight }}>{filtered.length} orders</div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <Th>WO ID</Th><Th>Product</Th><Th>Qty</Th><Th>Priority</Th><Th>Start</Th><Th>End</Th><Th>Progress</Th><Th>Team</Th><Th>Status</Th><Th>Actions</Th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.greenFaint}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <Td><span style={{ fontWeight: 700, color: T.green }}>{o.id}</span></Td>
                  <Td><span style={{ fontWeight: 600 }}>{o.product}</span></Td>
                  <Td>{o.qty} {o.unit}</Td>
                  <Td><Badge label={PRIORITY_CFG[o.priority].label} color={PRIORITY_CFG[o.priority].color} bg={PRIORITY_CFG[o.priority].bg} /></Td>
                  <Td style={{ color: T.textMid }}>{o.start}</Td>
                  <Td style={{ color: T.textMid }}>{o.end}</Td>
                  <Td style={{ minWidth: 120 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1 }}><ProgressBar pct={o.pct} /></div>
                      <span style={{ fontSize: 11, color: T.textMid, width: 30 }}>{o.pct}%</span>
                    </div>
                  </Td>
                  <Td style={{ fontSize: 12 }}>{o.team}</Td>
                  <Td>
                    <select value={o.status} onChange={e => setOrders(orders.map(x => x.id === o.id ? { ...x, status: e.target.value } : x))}
                      style={{ fontSize: 11, border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: "4px 8px", background: T.bg, color: T.text }}>
                      {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn size="sm" variant="secondary" onClick={() => { setEditItem(o); setShowModal(true); }}>✏️</Btn>
                      <Btn size="sm" variant="danger" onClick={() => { setOrders(orders.filter(x => x.id !== o.id)); show("Order deleted", "error"); }}>🗑️</Btn>
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: T.textLight, fontSize: 14 }}>No work orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal title={editItem ? "Edit Work Order" : "New Work Order"} onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Product *" defaultValue={editItem?.product} placeholder="Product name" /></div>
            <Input label="Quantity *" type="number" defaultValue={editItem?.qty} />
            <Select label="Priority" defaultValue={editItem?.priority}>
              {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Input label="Start Date" type="date" defaultValue={editItem?.start} />
            <Input label="End Date" type="date" defaultValue={editItem?.end} />
            <Input label="Assigned Team" defaultValue={editItem?.team} placeholder="Team name" />
            <Input label="Progress %" type="number" defaultValue={editItem?.pct} min="0" max="100" />
          </div>
          <ModalFooter onClose={() => setShowModal(false)} onSave={() => { show("Saved"); setShowModal(false); }} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 4 — PRODUCTION (manufacturing runs with ingredients/outputs)
// ═══════════════════════════════════════════════════════════════════════════════
const PROD_SEED = [
  { id: "PRD-001", date: "09/06/2026", ref: "PRD-0001", location: "Unit A - Chennai", product: "Masala Chai Blend", bom: "BOM-005", qty: 50, cost: "₹1,250", status: "completed" },
  { id: "PRD-002", date: "08/06/2026", ref: "PRD-0002", location: "Unit B - Coimbatore", product: "Whole Wheat Bread", bom: "BOM-003", qty: 30, cost: "₹2,100", status: "in_progress" },
  { id: "PRD-003", date: "07/06/2026", ref: "PRD-0003", location: "Unit A - Chennai", product: "Tomato Ketchup", bom: "BOM-007", qty: 100, cost: "₹4,500", status: "planned" },
  { id: "PRD-004", date: "06/06/2026", ref: "PRD-0004", location: "Unit C - Madurai", product: "Mango Pickle", bom: "BOM-009", qty: 75, cost: "₹3,375", status: "completed" },
  { id: "PRD-005", date: "05/06/2026", ref: "PRD-0005", location: "Unit B - Coimbatore", product: "Coconut Oil", bom: "BOM-002", qty: 60, cost: "₹7,200", status: "in_progress" },
];

function ProductionPage() {
  const [prods, setProds] = useState(PROD_SEED);
  const [showModal, setShowModal] = useState(false);
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [loc, setLoc] = useState("");
  const { show, Toast } = useToast();

  const filtered = prods.filter(p =>
    (!loc || p.location.includes(loc))
  );

  const statusColor = s => s === "completed" ? T.green : s === "in_progress" ? T.amber : T.blue;
  const statusBg = s => s === "completed" ? T.greenLight : s === "in_progress" ? T.amberSoft : T.blueSoft;

  return (
    <div>
      {Toast}
      <SectionHeader
        title="Production Runs"
        sub="Log and manage all manufacturing production entries"
        actions={<Btn onClick={() => setShowModal(true)}>＋ Add Production</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <KPI icon="🏭" label="Total Runs" value={prods.length} bg={T.greenLight} />
        <KPI icon="✅" label="Completed" value={prods.filter(p => p.status === "completed").length} bg={T.greenLight} color={T.green} />
        <KPI icon="⚙️" label="In Progress" value={prods.filter(p => p.status === "in_progress").length} bg={T.amberSoft} color={T.amber} />
        <KPI icon="📦" label="Total Qty" value={prods.reduce((a, b) => a + b.qty, 0)} bg={T.blueSoft} color={T.blue} sub="Units produced" />
      </div>

      {/* Filters */}
      <Card style={{ padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.textMid }}>🔽 Filters</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "6px 10px", fontSize: 13 }} />
        <span style={{ color: T.textLight, fontSize: 12 }}>to</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "6px 10px", fontSize: 13 }} />
        <select value={loc} onChange={e => setLoc(e.target.value)} style={{ border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>
          <option value="">All Locations</option>
          {["Unit A - Chennai", "Unit B - Coimbatore", "Unit C - Madurai"].map(l => <option key={l}>{l}</option>)}
        </select>
        <Btn size="sm">Apply</Btn>
        <Btn size="sm" variant="secondary" onClick={() => { setFrom(""); setTo(""); setLoc(""); }}>Reset</Btn>
      </Card>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <Th>Date</Th><Th>Ref No.</Th><Th>Location</Th><Th>Product</Th><Th>BOM</Th><Th>Qty</Th><Th>Total Cost</Th><Th>Status</Th><Th>Actions</Th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}
                  onMouseEnter={e => e.currentTarget.style.background = T.greenFaint}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <Td style={{ color: T.textMid }}>{p.date}</Td>
                  <Td><span style={{ fontWeight: 700, color: T.green, fontSize: 12 }}>{p.ref}</span></Td>
                  <Td style={{ fontSize: 12 }}>{p.location}</Td>
                  <Td><span style={{ fontWeight: 600 }}>{p.product}</span></Td>
                  <Td><code style={{ fontSize: 11, background: T.bg, padding: "2px 6px", borderRadius: 4 }}>{p.bom}</code></Td>
                  <Td><span style={{ fontWeight: 700 }}>{p.qty}</span></Td>
                  <Td><span style={{ fontWeight: 700, color: T.green }}>{p.cost}</span></Td>
                  <Td><Badge label={STATUS_CFG[p.status]?.label || p.status} color={statusColor(p.status)} bg={statusBg(p.status)} dot /></Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn size="sm" variant="secondary">👁️ View</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => { setProds(prods.filter(x => x.id !== p.id)); show("Deleted", "error"); }}>🗑️</Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal title="Add Production Run" onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Reference No." placeholder="Auto-generated" />
            <Select label="Location"><option>Unit A - Chennai</option><option>Unit B - Coimbatore</option><option>Unit C - Madurai</option></Select>
            <div style={{ gridColumn: "1/-1" }}><Select label="Product *"><option>Select product...</option></Select></div>
            <Select label="BOM"><option>Select BOM...</option></Select>
            <Input label="Quantity *" type="number" placeholder="0" />
            <div style={{ gridColumn: "1/-1" }}><Input label="Notes" placeholder="Optional notes..." /></div>
          </div>
          <ModalFooter onClose={() => setShowModal(false)} onSave={() => { show("Production run added"); setShowModal(false); }} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 5 — RESOURCES (card grid with utilization)
// ═══════════════════════════════════════════════════════════════════════════════
const RES_SEED = [
  { id: 1, name: "CNC Machine #1", type: "Machine", util: 78, status: "running", shift: "Morning", operator: "Rajan K.", nextMaint: "2026-07-20" },
  { id: 2, name: "CNC Machine #2", type: "Machine", util: 45, status: "running", shift: "Evening", operator: "Suresh M.", nextMaint: "2026-08-01" },
  { id: 3, name: "Assembly Line A", type: "Line", util: 90, status: "running", shift: "Full Day", operator: "Team Alpha", nextMaint: "2026-07-15" },
  { id: 4, name: "Assembly Line B", type: "Line", util: 20, status: "idle", shift: "Morning", operator: "Team Beta", nextMaint: "2026-08-05" },
  { id: 5, name: "Welding Station", type: "Station", util: 60, status: "running", shift: "Morning", operator: "Dinesh P.", nextMaint: "2026-07-28" },
  { id: 6, name: "Paint Booth", type: "Station", util: 0, status: "maintenance", shift: "—", operator: "—", nextMaint: "2026-06-25" },
];

function ResourcesPage() {
  const [resources, setResources] = useState(RES_SEED);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Machine", shift: "Morning", operator: "" });
  const { show, Toast } = useToast();

  const filtered = resources.filter(r => filter === "all" || r.status === filter);

  const statusColor = s => s === "running" ? T.green : s === "idle" ? T.amber : T.red;
  const statusBg = s => s === "running" ? T.greenLight : s === "idle" ? T.amberSoft : T.redSoft;
  const utilColor = u => u > 85 ? T.red : u > 50 ? T.green : T.amber;

  return (
    <div>
      {Toast}
      <SectionHeader
        title="Resources"
        sub="Monitor machine and workstation availability"
        actions={<Btn onClick={() => setShowModal(true)}>＋ Add Resource</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="🏗️" label="Total Resources" value={resources.length} bg={T.greenLight} />
        <KPI icon="▶️" label="Running" value={resources.filter(r => r.status === "running").length} bg={T.greenLight} color={T.green} sub="Active now" />
        <KPI icon="⏸️" label="Idle" value={resources.filter(r => r.status === "idle").length} bg={T.amberSoft} color={T.amber} sub="Unassigned" />
        <KPI icon="🔧" label="Maintenance" value={resources.filter(r => r.status === "maintenance").length} bg={T.redSoft} color={T.red} sub="Down time" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "running", "idle", "maintenance"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 16px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: filter === s ? T.green : T.bg, color: filter === s ? "#fff" : T.textMid,
            textTransform: "capitalize",
          }}>{s === "all" ? "All" : s}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {filtered.map(r => (
          <Card key={r.id} style={{ borderTop: `3px solid ${statusColor(r.status)}` }}>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{r.type}</div>
                </div>
                <Badge label={r.status.charAt(0).toUpperCase() + r.status.slice(1)} color={statusColor(r.status)} bg={statusBg(r.status)} dot />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMid, marginBottom: 4 }}>
                  <span>Utilization</span>
                  <span style={{ fontWeight: 700, color: utilColor(r.util) }}>{r.util}%</span>
                </div>
                <ProgressBar pct={r.util} color={utilColor(r.util)} height={8} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[["Shift", r.shift], ["Operator", r.operator], ["Next Maint.", r.nextMaint], ["Capacity", "100 u/day"]].map(([l, v]) => (
                  <div key={l} style={{ background: T.bg, borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 10, color: T.textLight, fontWeight: 600, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <select value={r.status} onChange={e => setResources(resources.map(x => x.id === r.id ? { ...x, status: e.target.value } : x))}
                  style={{ flex: 1, fontSize: 11, border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: "5px 8px", background: T.bg }}>
                  {["running", "idle", "maintenance"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <Btn size="sm" variant="danger" onClick={() => { setResources(resources.filter(x => x.id !== r.id)); show("Removed", "error"); }}>🗑️</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal title="Add Resource" onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Resource Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. CNC Machine #3" /></div>
            <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {["Machine", "Line", "Station"].map(t => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Shift" value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}>
              {["Morning", "Evening", "Full Day", "Night"].map(s => <option key={s}>{s}</option>)}
            </Select>
            <div style={{ gridColumn: "1/-1" }}><Input label="Operator / Team" value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })} placeholder="e.g. Rajan K." /></div>
          </div>
          <ModalFooter onClose={() => setShowModal(false)} onSave={() => {
            if (!form.name) { show("Name required", "error"); return; }
            setResources([...resources, { id: Date.now(), ...form, util: 0, status: "idle", nextMaint: "—" }]);
            show("Resource added"); setShowModal(false);
          }} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 6 — MACHINES (technical detail + maintenance schedule)
// ═══════════════════════════════════════════════════════════════════════════════
const MACHINE_SEED = [
  { id: "MCH-001", name: "CNC Milling Machine", model: "Haas VF-2", serial: "HVF2-20231", dept: "Machining", status: "running", hours: 1240, maxHours: 1500, lastMaint: "2026-05-20", nextMaint: "2026-07-20", operator: "Rajan K." },
  { id: "MCH-002", name: "Hydraulic Press", model: "Atlas H-50T", serial: "AH50-20198", dept: "Forming", status: "running", hours: 890, maxHours: 1200, lastMaint: "2026-05-10", nextMaint: "2026-07-10", operator: "Arun S." },
  { id: "MCH-003", name: "TIG Welding Unit", model: "Lincoln TIG 200", serial: "LT200-20214", dept: "Welding", status: "maintenance", hours: 1490, maxHours: 1500, lastMaint: "2026-06-09", nextMaint: "2026-06-25", operator: "Dinesh P." },
  { id: "MCH-004", name: "Lathe Machine", model: "Precimax L-400", serial: "PML4-20187", dept: "Machining", status: "idle", hours: 320, maxHours: 1200, lastMaint: "2026-04-20", nextMaint: "2026-06-20", operator: "Unassigned" },
];

function MachinesPage() {
  const [selected, setSelected] = useState(MACHINE_SEED[0]);
  const statusColor = s => s === "running" ? T.green : s === "idle" ? T.amber : T.red;
  const statusBg = s => s === "running" ? T.greenLight : s === "idle" ? T.amberSoft : T.redSoft;

  return (
    <div>
      <SectionHeader
        title="Machines"
        sub="Track machine health, hours, and maintenance schedules"
        actions={<Btn>＋ Register Machine</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="⚙️" label="Total Machines" value={MACHINE_SEED.length} bg={T.greenLight} />
        <KPI icon="✅" label="Running" value={MACHINE_SEED.filter(m => m.status === "running").length} bg={T.greenLight} color={T.green} />
        <KPI icon="🔧" label="In Maintenance" value={MACHINE_SEED.filter(m => m.status === "maintenance").length} bg={T.redSoft} color={T.red} />
        <KPI icon="⚠️" label="Near Service Limit" value={MACHINE_SEED.filter(m => m.hours / m.maxHours > 0.85).length} bg={T.amberSoft} color={T.amber} sub="Above 85% hours" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <Th>Machine</Th><Th>Model</Th><Th>Dept</Th><Th>Hours Used</Th><Th>Health</Th><Th>Status</Th><Th>Next Maint.</Th>
              </tr></thead>
              <tbody>
                {MACHINE_SEED.map(m => {
                  const pct = Math.round(m.hours / m.maxHours * 100);
                  const hColor = pct > 90 ? T.red : pct > 70 ? T.amber : T.green;
                  return (
                    <tr key={m.id} onClick={() => setSelected(m)} style={{ cursor: "pointer", background: selected?.id === m.id ? T.greenFaint : "" }}
                      onMouseEnter={e => { if (selected?.id !== m.id) e.currentTarget.style.background = T.bg; }}
                      onMouseLeave={e => { if (selected?.id !== m.id) e.currentTarget.style.background = ""; }}>
                      <Td>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: T.textLight }}>{m.serial}</div>
                      </Td>
                      <Td style={{ fontSize: 12, color: T.textMid }}>{m.model}</Td>
                      <Td><Badge label={m.dept} color={T.blue} bg={T.blueSoft} /></Td>
                      <Td>
                        <div style={{ fontSize: 12, fontWeight: 700, color: hColor, marginBottom: 4 }}>{m.hours}/{m.maxHours}h</div>
                        <ProgressBar pct={pct} color={hColor} />
                      </Td>
                      <Td style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: hColor }}>{100 - pct}%</div>
                        <div style={{ fontSize: 10, color: T.textLight }}>remaining</div>
                      </Td>
                      <Td><Badge label={m.status.charAt(0).toUpperCase() + m.status.slice(1)} color={statusColor(m.status)} bg={statusBg(m.status)} dot /></Td>
                      <Td style={{ fontSize: 12, color: pct > 90 ? T.red : T.textMid, fontWeight: pct > 90 ? 700 : 400 }}>{m.nextMaint}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Machine Detail Panel */}
        <Card style={{ alignSelf: "flex-start", position: "sticky", top: 20 }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 4 }}>{selected?.id}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{selected?.name}</div>
            <div style={{ fontSize: 12, color: T.textMid }}>{selected?.model} · {selected?.serial}</div>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <Badge label={selected?.status} color={statusColor(selected?.status)} bg={statusBg(selected?.status)} dot />
              <Badge label={selected?.dept} color={T.blue} bg={T.blueSoft} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Service Hours</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: T.textMid }}>Used</span>
                <span style={{ fontWeight: 700 }}>{selected?.hours} / {selected?.maxHours}h</span>
              </div>
              <ProgressBar pct={selected ? Math.round(selected.hours / selected.maxHours * 100) : 0} />
            </div>

            {[["Operator", selected?.operator], ["Department", selected?.dept], ["Last Service", selected?.lastMaint], ["Next Service", selected?.nextMaint]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span style={{ color: T.textMid }}>{l}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <Btn variant="secondary" size="sm" style={{ flex: 1 }}>📋 Log Issue</Btn>
              <Btn variant="primary" size="sm" style={{ flex: 1 }}>🔧 Schedule</Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 7 — SCHEDULE (Gantt-first view with team workload)
// ═══════════════════════════════════════════════════════════════════════════════
function SchedulePage() {
  const ganttDays = Array.from({ length: 21 }, (_, i) => i + 10);
  const today = 23;

  return (
    <div>
      <SectionHeader
        title="Schedule"
        sub="Production timeline and team workload — June 2026"
        actions={<><Btn variant="secondary">📤 Export</Btn><Btn>＋ Schedule Run</Btn></>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="📅" label="Active This Month" value={WO_SEED.filter(o => o.status !== "completed").length} bg={T.blueSoft} color={T.blue} />
        <KPI icon="⚡" label="On Hold / At Risk" value={WO_SEED.filter(o => o.status === "on_hold").length} bg={T.redSoft} color={T.red} />
        <KPI icon="🎯" label="On Track" value={WO_SEED.filter(o => o.status === "in_progress").length} bg={T.greenLight} color={T.green} sub="In progress" />
        <KPI icon="📦" label="Queued" value={WO_SEED.filter(o => o.status === "planned").length} bg={T.amberSoft} color={T.amber} sub="Not started" />
      </div>

      {/* Gantt */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Production Timeline — June 2026</div>
            <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>Today: Jun 23 (shown in green)</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.textMid }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: v.color }} />
                {v.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "20px 24px", overflowX: "auto" }}>
          <div style={{ minWidth: 700 }}>
            {/* Day header */}
            <div style={{ display: "flex", marginBottom: 12, paddingLeft: 210 }}>
              {ganttDays.map(d => (
                <div key={d} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: d === today ? 800 : 400, color: d === today ? T.green : T.textLight }}>
                  {d % 5 === 0 || d === today ? d : ""}
                </div>
              ))}
            </div>
            {WO_SEED.map(o => {
              const s = +o.start.split("-")[2];
              const e = +o.end.split("-")[2];
              const leftPct = Math.max(0, (s - 10) / 21 * 100);
              const widthPct = Math.min(100 - leftPct, (e - Math.max(s, 10) + 1) / 21 * 100);
              const cfg = STATUS_CFG[o.status];
              const todayPct = (today - 10) / 21 * 100;
              return (
                <div key={o.id} style={{ display: "flex", alignItems: "center", marginBottom: 10, position: "relative" }}>
                  <div style={{ width: 210, flexShrink: 0, paddingRight: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{o.id}</div>
                    <div style={{ fontSize: 11, color: T.textMid, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 190 }}>{o.product}</div>
                  </div>
                  <div style={{ flex: 1, position: "relative", height: 32, background: T.bg, borderRadius: 4 }}>
                    {/* today line */}
                    <div style={{ position: "absolute", left: `${todayPct}%`, top: -4, bottom: -4, width: 2, background: T.green, borderRadius: 1, zIndex: 2 }} />
                    <div style={{ position: "absolute", height: "100%", left: `${leftPct}%`, width: `${widthPct}%`, background: cfg.color, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8, overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${o.pct}%`, background: "rgba(0,0,0,0.18)", borderRadius: 6 }} />
                      <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, position: "relative", zIndex: 1, whiteSpace: "nowrap" }}>{o.pct}% · {o.team}</span>
                    </div>
                  </div>
                  <div style={{ width: 60, textAlign: "right", fontSize: 11, color: T.textMid, paddingLeft: 10, flexShrink: 0 }}>{o.end.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Team Workload */}
      <Card>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14 }}>👥 Team Workload</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Team</Th><Th>Orders</Th><Th>Total Qty</Th><Th>Avg Progress</Th><Th>Breakdown</Th></tr></thead>
          <tbody>
            {["Team Alpha", "Team Beta", "Team Gamma"].map((team, ti) => {
              const teamOrders = WO_SEED.filter(o => o.team === team);
              const avg = teamOrders.length ? Math.round(teamOrders.reduce((a, o) => a + o.pct, 0) / teamOrders.length) : 0;
              const totalQty = teamOrders.reduce((a, o) => a + o.qty, 0);
              return (
                <tr key={team} style={{ background: ti % 2 === 0 ? "#fff" : T.bg }}>
                  <Td><span style={{ fontWeight: 700 }}>{team}</span></Td>
                  <Td>{teamOrders.length} orders</Td>
                  <Td>{totalQty.toLocaleString()} units</Td>
                  <Td style={{ minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 100 }}><ProgressBar pct={avg} /></div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{avg}%</span>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Object.entries(teamOrders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})).map(([s, n]) => (
                        <Badge key={s} label={`${STATUS_CFG[s]?.label} ×${n}`} color={STATUS_CFG[s]?.color} bg={STATUS_CFG[s]?.bg} />
                      ))}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 8 — QUALITY CONTROL (inspection checklists)
// ═══════════════════════════════════════════════════════════════════════════════
const QC_SEED = [
  { id: "QC-001", ref: "PRD-0001", product: "Industrial Valve A3", inspector: "Meena S.", date: "2026-06-09", result: "passed", defects: 0, batch: 50, sampled: 10 },
  { id: "QC-002", ref: "PRD-0003", product: "Tomato Ketchup", inspector: "Arjun R.", date: "2026-06-08", result: "failed", defects: 3, batch: 100, sampled: 15 },
  { id: "QC-003", ref: "PRD-0004", product: "Mango Pickle", inspector: "Priya K.", date: "2026-06-07", result: "passed", defects: 1, batch: 75, sampled: 10 },
  { id: "QC-004", ref: "PRD-0002", product: "Whole Wheat Bread", inspector: "Meena S.", date: "2026-06-06", result: "pending", defects: 0, batch: 30, sampled: 0 },
  { id: "QC-005", ref: "PRD-0005", product: "Coconut Oil", inspector: "Arjun R.", date: "2026-06-05", result: "passed", defects: 0, batch: 60, sampled: 8 },
];

const CHECKLIST = [
  { check: "Visual inspection — no visible defects", status: "passed" },
  { check: "Dimensional tolerances ±0.1mm", status: "passed" },
  { check: "Pressure test at 150 PSI", status: "passed" },
  { check: "Surface finish Ra < 1.6μm", status: "failed" },
  { check: "Weight within ±2% spec", status: "passed" },
  { check: "Leak test — 30 min hold", status: "passed" },
];

function QualityControlPage() {
  const [selected, setSelected] = useState(QC_SEED[0]);
  const { show, Toast } = useToast();
  const resultColor = r => r === "passed" ? T.green : r === "failed" ? T.red : T.amber;
  const resultBg = r => r === "passed" ? T.greenLight : r === "failed" ? T.redSoft : T.amberSoft;

  const passRate = Math.round(QC_SEED.filter(q => q.result === "passed").length / QC_SEED.filter(q => q.result !== "pending").length * 100);

  return (
    <div>
      {Toast}
      <SectionHeader
        title="Quality Control"
        sub="Inspection records, checklists, and defect tracking"
        actions={<Btn>＋ New Inspection</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="🔍" label="Inspections" value={QC_SEED.length} bg={T.greenLight} />
        <KPI icon="✅" label="Pass Rate" value={`${passRate}%`} bg={T.greenLight} color={T.green} sub="Last 30 days" trend="up" />
        <KPI icon="❌" label="Failed" value={QC_SEED.filter(q => q.result === "failed").length} bg={T.redSoft} color={T.red} sub="Need rework" />
        <KPI icon="⏳" label="Pending" value={QC_SEED.filter(q => q.result === "pending").length} bg={T.amberSoft} color={T.amber} sub="Awaiting check" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        <Card>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13 }}>Inspection Records</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>ID</Th><Th>Production Ref</Th><Th>Product</Th><Th>Inspector</Th><Th>Date</Th><Th>Batch</Th><Th>Defects</Th><Th>Result</Th></tr></thead>
            <tbody>
              {QC_SEED.map(q => (
                <tr key={q.id} onClick={() => setSelected(q)} style={{ cursor: "pointer", background: selected?.id === q.id ? T.greenFaint : "" }}
                  onMouseEnter={e => { if (selected?.id !== q.id) e.currentTarget.style.background = T.bg; }}
                  onMouseLeave={e => { if (selected?.id !== q.id) e.currentTarget.style.background = ""; }}>
                  <Td><span style={{ fontWeight: 700, color: T.green, fontSize: 12 }}>{q.id}</span></Td>
                  <Td style={{ fontSize: 12 }}>{q.ref}</Td>
                  <Td><span style={{ fontWeight: 600 }}>{q.product}</span></Td>
                  <Td style={{ fontSize: 12, color: T.textMid }}>{q.inspector}</Td>
                  <Td style={{ fontSize: 12, color: T.textMid }}>{q.date}</Td>
                  <Td>{q.batch} units</Td>
                  <Td>
                    {q.defects > 0
                      ? <span style={{ fontWeight: 700, color: T.red }}>{q.defects} found</span>
                      : <span style={{ color: T.textLight }}>—</span>}
                  </Td>
                  <Td><Badge label={q.result.charAt(0).toUpperCase() + q.result.slice(1)} color={resultColor(q.result)} bg={resultBg(q.result)} dot /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* QC Detail + Checklist */}
        <Card style={{ alignSelf: "flex-start" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{selected?.id}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 2 }}>{selected?.product}</div>
            <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{selected?.ref} · {selected?.date}</div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["Inspector", selected?.inspector], ["Batch Size", `${selected?.batch} u`], ["Sampled", `${selected?.sampled} u`], ["Defects Found", selected?.defects || "0"]].map(([l, v]) => (
                <div key={l} style={{ background: T.bg, borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: T.textLight, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 12, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5 }}>Inspection Checklist</div>
            {CHECKLIST.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 14 }}>{c.status === "passed" ? "✅" : "❌"}</span>
                <span style={{ fontSize: 12, color: T.text, flex: 1 }}>{c.check}</span>
              </div>
            ))}

            <Btn variant="primary" style={{ width: "100%", marginTop: 16, justifyContent: "center" }} onClick={() => show("Report downloaded", "info")}>
              📄 Download Report
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 9 — MAINTENANCE (timeline + upcoming tasks)
// ═══════════════════════════════════════════════════════════════════════════════
const MAINT_SEED = [
  { id: "MNT-001", machine: "CNC Machine #1", type: "Preventive", scheduled: "2026-06-20", engineer: "Rajan K.", duration: "4h", status: "scheduled", priority: "medium" },
  { id: "MNT-002", machine: "Paint Booth", type: "Corrective", scheduled: "2026-06-25", engineer: "Vendor Team", duration: "8h", status: "in_progress", priority: "high" },
  { id: "MNT-003", machine: "Lathe Machine #1", type: "Predictive", scheduled: "2026-06-20", engineer: "Suresh M.", duration: "2h", status: "overdue", priority: "high" },
  { id: "MNT-004", machine: "Assembly Line B", type: "Preventive", scheduled: "2026-07-05", engineer: "Team Beta", duration: "6h", status: "scheduled", priority: "low" },
  { id: "MNT-005", machine: "Hydraulic Press", type: "Predictive", scheduled: "2026-07-10", engineer: "Arun S.", duration: "3h", status: "scheduled", priority: "medium" },
];

function MaintenancePage() {
  const { show, Toast } = useToast();
  const [tasks, setTasks] = useState(MAINT_SEED);
  const [showModal, setShowModal] = useState(false);

  const statusColor = s => s === "completed" ? T.green : s === "in_progress" ? T.amber : s === "overdue" ? T.red : T.blue;
  const statusBg = s => s === "completed" ? T.greenLight : s === "in_progress" ? T.amberSoft : s === "overdue" ? T.redSoft : T.blueSoft;
  const typeColor = t => t === "Corrective" ? T.red : t === "Preventive" ? T.green : T.purple;

  return (
    <div>
      {Toast}
      <SectionHeader
        title="Maintenance"
        sub="Schedule and track preventive and corrective maintenance tasks"
        actions={<><Btn variant="secondary">📋 Maintenance Log</Btn><Btn onClick={() => setShowModal(true)}>＋ Schedule Task</Btn></>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="🔧" label="Total Tasks" value={tasks.length} bg={T.greenLight} />
        <KPI icon="📅" label="Scheduled" value={tasks.filter(t => t.status === "scheduled").length} bg={T.blueSoft} color={T.blue} />
        <KPI icon="⚠️" label="Overdue" value={tasks.filter(t => t.status === "overdue").length} bg={T.redSoft} color={T.red} sub="Needs attention" />
        <KPI icon="⚙️" label="In Progress" value={tasks.filter(t => t.status === "in_progress").length} bg={T.amberSoft} color={T.amber} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Maintenance Schedule</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Task ID</Th><Th>Machine</Th><Th>Type</Th><Th>Scheduled</Th><Th>Engineer</Th><Th>Duration</Th><Th>Priority</Th><Th>Status</Th><Th>Action</Th></tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}
                  onMouseEnter={e => e.currentTarget.style.background = T.bg}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <Td><span style={{ fontWeight: 700, color: T.green, fontSize: 12 }}>{t.id}</span></Td>
                  <Td><span style={{ fontWeight: 600 }}>{t.machine}</span></Td>
                  <Td><span style={{ fontSize: 12, fontWeight: 700, color: typeColor(t.type) }}>{t.type}</span></Td>
                  <Td style={{ color: t.status === "overdue" ? T.red : T.textMid, fontWeight: t.status === "overdue" ? 700 : 400 }}>{t.scheduled}</Td>
                  <Td style={{ fontSize: 12 }}>{t.engineer}</Td>
                  <Td style={{ color: T.textMid }}>{t.duration}</Td>
                  <Td><Badge label={PRIORITY_CFG[t.priority].label} color={PRIORITY_CFG[t.priority].color} bg={PRIORITY_CFG[t.priority].bg} /></Td>
                  <Td><Badge label={t.status.charAt(0).toUpperCase() + t.status.replace("_", " ").slice(1)} color={statusColor(t.status)} bg={statusBg(t.status)} dot /></Td>
                  <Td>
                    <Btn size="sm" variant="secondary" onClick={() => { setTasks(tasks.map(x => x.id === t.id ? { ...x, status: "completed" } : x)); show("Marked complete"); }}>
                      ✅ Complete
                    </Btn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Sidebar: Type breakdown + upcoming */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: T.text }}>By Type</div>
            {[["Preventive", T.green], ["Corrective", T.red], ["Predictive", T.purple]].map(([type, color]) => {
              const count = tasks.filter(t => t.type === type).length;
              const pct = Math.round(count / tasks.length * 100);
              return (
                <div key={type} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color }}>{type}</span>
                    <span style={{ color: T.textMid }}>{count} tasks · {pct}%</span>
                  </div>
                  <ProgressBar pct={pct} color={color} />
                </div>
              );
            })}
          </Card>

          <Card style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: T.text }}>⚠️ Overdue / Urgent</div>
            {tasks.filter(t => t.status === "overdue" || t.priority === "high").slice(0, 3).map(t => (
              <div key={t.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.red }}>{t.machine}</div>
                <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>{t.type} · {t.scheduled}</div>
                <div style={{ fontSize: 11, color: T.textMid }}>{t.engineer}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {showModal && (
        <Modal title="Schedule Maintenance Task" onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Select label="Machine *"><option>Select machine...</option>{MACHINE_SEED.map(m => <option key={m.id}>{m.name}</option>)}</Select></div>
            <Select label="Type"><option>Preventive</option><option>Corrective</option><option>Predictive</option></Select>
            <Select label="Priority"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></Select>
            <Input label="Scheduled Date *" type="date" />
            <Input label="Estimated Duration" placeholder="e.g. 4h" />
            <div style={{ gridColumn: "1/-1" }}><Input label="Assigned Engineer / Team" placeholder="e.g. Rajan K." /></div>
            <div style={{ gridColumn: "1/-1" }}><Input label="Notes" placeholder="Maintenance details..." /></div>
          </div>
          <ModalFooter onClose={() => setShowModal(false)} onSave={() => { show("Task scheduled"); setShowModal(false); }} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 10 — PRODUCTION REPORTS (analytics + charts)
// ═══════════════════════════════════════════════════════════════════════════════
const MONTHLY = [
  { month: "Jan", produced: 320, target: 350, cost: 142000 },
  { month: "Feb", produced: 290, target: 300, cost: 128000 },
  { month: "Mar", produced: 410, target: 380, cost: 178000 },
  { month: "Apr", produced: 380, target: 400, cost: 165000 },
  { month: "May", produced: 450, target: 420, cost: 195000 },
  { month: "Jun", produced: 315, target: 430, cost: 138000 },
];

const BarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.produced, d.target)));
  const h = 180;
  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: h, position: "relative" }}>
        {/* horizontal guides */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <div key={f} style={{ position: "absolute", left: 0, right: 0, bottom: `${f * 100}%`, borderTop: `1px dashed ${T.border}`, fontSize: 10, color: T.textLight }}>
            <span style={{ position: "absolute", left: -30, top: -6 }}>{Math.round(maxVal * f)}</span>
          </div>
        ))}
        {data.map(d => (
          <div key={d.month} style={{ flex: 1, display: "flex", gap: 2, alignItems: "flex-end", position: "relative", zIndex: 1 }}>
            <div title={`Produced: ${d.produced}`} style={{ flex: 1, height: `${d.produced / maxVal * h}px`, background: T.green, borderRadius: "3px 3px 0 0", transition: "height .3s" }} />
            <div title={`Target: ${d.target}`} style={{ flex: 1, height: `${d.target / maxVal * h}px`, background: T.greenLight, border: `1px solid ${T.green}`, borderRadius: "3px 3px 0 0", transition: "height .3s" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, paddingLeft: 30 }}>
        {data.map(d => (
          <div key={d.month} style={{ flex: 1, textAlign: "center", fontSize: 11, color: T.textMid, paddingTop: 6 }}>{d.month}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMid }}>
          <div style={{ width: 12, height: 12, background: T.green, borderRadius: 2 }} />Produced
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMid }}>
          <div style={{ width: 12, height: 12, background: T.greenLight, border: `1px solid ${T.green}`, borderRadius: 2 }} />Target
        </div>
      </div>
    </div>
  );
};

function ReportsPage() {
  const [period, setPeriod] = useState("6M");
  const totalProduced = MONTHLY.reduce((a, m) => a + m.produced, 0);
  const totalTarget = MONTHLY.reduce((a, m) => a + m.target, 0);
  const efficiency = Math.round(totalProduced / totalTarget * 100);

  return (
    <div>
      <SectionHeader
        title="Production Reports"
        sub="Analytics, trends, and performance metrics"
        actions={<>
          <div style={{ display: "flex", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            {["1M", "3M", "6M", "YTD"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "6px 14px", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: period === p ? T.green : "transparent", color: period === p ? "#fff" : T.textMid,
              }}>{p}</button>
            ))}
          </div>
          <Btn variant="secondary">📤 Export</Btn>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="📦" label="Total Produced" value={totalProduced.toLocaleString()} bg={T.greenLight} sub={`${efficiency}% of target`} trend="up" />
        <KPI icon="🎯" label="Efficiency" value={`${efficiency}%`} bg={efficiency >= 90 ? T.greenLight : T.amberSoft} color={efficiency >= 90 ? T.green : T.amber} sub="vs plan" />
        <KPI icon="💰" label="Total Cost" value={`₹${(MONTHLY.reduce((a, m) => a + m.cost, 0) / 1000).toFixed(0)}K`} bg={T.blueSoft} color={T.blue} sub="Manufacturing cost" />
        <KPI icon="📉" label="Defect Rate" value="2.4%" bg={T.redSoft} color={T.red} sub="Below 5% target" trend="dn" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Production vs Target — 2026</div>
          <div style={{ paddingLeft: 30 }}>
            <BarChart data={MONTHLY} />
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Monthly Summary</div>
          {MONTHLY.map(m => {
            const pct = Math.round(m.produced / m.target * 100);
            return (
              <div key={m.month} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: T.text }}>{m.month}</span>
                  <span style={{ color: pct >= 100 ? T.green : pct >= 85 ? T.amber : T.red, fontWeight: 700 }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} color={pct >= 100 ? T.green : pct >= 85 ? T.amber : T.red} />
                <div style={{ fontSize: 10, color: T.textLight, marginTop: 2 }}>{m.produced} / {m.target} units</div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Product-level breakdown */}
      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Product Performance</div>
          <Btn variant="ghost" size="sm">View All →</Btn>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Product</Th><Th>Runs</Th><Th>Qty Produced</Th><Th>Total Cost</Th><Th>Defects</Th><Th>Efficiency</Th><Th>Status</Th></tr></thead>
          <tbody>
            {[
              { product: "Industrial Valve A3", runs: 3, qty: 600, cost: "₹12,750", defects: 2, eff: 95 },
              { product: "Masala Chai Blend", runs: 5, qty: 250, cost: "₹6,250", defects: 0, eff: 100 },
              { product: "Tomato Ketchup", runs: 4, qty: 400, cost: "₹18,000", defects: 12, eff: 78 },
              { product: "Coconut Oil", runs: 2, qty: 120, cost: "₹14,400", defects: 1, eff: 91 },
              { product: "Mango Pickle", runs: 3, qty: 225, cost: "₹10,125", defects: 3, eff: 86 },
            ].map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : T.bg }}
                onMouseEnter={e => e.currentTarget.style.background = T.greenFaint}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : T.bg}>
                <Td><span style={{ fontWeight: 600 }}>{r.product}</span></Td>
                <Td style={{ color: T.textMid }}>{r.runs}</Td>
                <Td><span style={{ fontWeight: 700 }}>{r.qty}</span></Td>
                <Td><span style={{ fontWeight: 700, color: T.green }}>{r.cost}</span></Td>
                <Td><span style={{ color: r.defects > 5 ? T.red : r.defects > 0 ? T.amber : T.textLight, fontWeight: 700 }}>{r.defects}</span></Td>
                <Td style={{ minWidth: 120 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80 }}><ProgressBar pct={r.eff} /></div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.eff >= 90 ? T.green : r.eff >= 80 ? T.amber : T.red }}>{r.eff}%</span>
                  </div>
                </Td>
                <Td><Badge label={r.eff >= 90 ? "Good" : r.eff >= 80 ? "Fair" : "Needs Review"} color={r.eff >= 90 ? T.green : r.eff >= 80 ? T.amber : T.red} bg={r.eff >= 90 ? T.greenLight : r.eff >= 80 ? T.amberSoft : T.redSoft} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL — Sidebar nav + page router
// ═══════════════════════════════════════════════════════════════════════════════
const NAV = [
  { key: "planning", label: "Production Planning", icon: "📋" },
  { key: "bom", label: "Bill of Materials", icon: "🔩" },
  { key: "workorders", label: "Work Orders", icon: "📑" },
  { key: "production", label: "Production", icon: "🏭" },
  { key: "resources", label: "Resources", icon: "⚙️" },
  { key: "machines", label: "Machines", icon: "🔧" },
  { key: "schedule", label: "Schedule", icon: "📅" },
  { key: "quality", label: "Quality Control", icon: "🔍" },
  { key: "maintenance", label: "Maintenance", icon: "🛠️" },
  { key: "reports", label: "Production Reports", icon: "📊" },
];

export default function ManufacturingERP() {
  const [page, setPage] = useState("planning");

  const pageMap = {
    planning: <ProductionPlanningPage />,
    bom: <BOMPage />,
    workorders: <WorkOrdersPage />,
    production: <ProductionPage />,
    resources: <ResourcesPage />,
    machines: <MachinesPage />,
    schedule: <SchedulePage />,
    quality: <QualityControlPage />,
    maintenance: <MaintenancePage />,
    reports: <ReportsPage />,
  };

  const current = NAV.find(n => n.key === page);

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: T.bg, color: T.text }}>

      {/* Sidebar */}
      <div style={{
        width: 230, flexShrink: 0, background: T.greenDark, display: "flex",
        flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏭</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 0.3 }}>Manufacturing</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Manod ERP</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV.map(n => {
            const active = page === n.key;
            return (
              <button key={n.key} onClick={() => setPage(n.key)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                marginBottom: 2, textAlign: "left",
                background: active ? T.green : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                fontWeight: active ? 700 : 400, fontSize: 13,
                transition: "all .15s",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
                <span style={{ lineHeight: 1.3 }}>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Manufacturing Module v4.0
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          background: T.card, borderBottom: `1px solid ${T.border}`,
          padding: "12px 28px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: T.textLight }}>Manufacturing</span>
            <span style={{ color: T.border }}>›</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{current?.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 11, color: T.textLight, background: T.bg, padding: "4px 12px", borderRadius: 20, border: `1px solid ${T.border}` }}>
              June 2026
            </div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.green }}>M</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px 28px 40px" }}>
          {pageMap[page]}
        </div>
      </div>
    </div>
  );
}
import { useState, useRef } from "react";

// ─── Export Utilities ────────────────────────────────────────────
function exportCSV(agents) {
  const headers = ["ID", "Name", "Email", "Phone", "Commission Type", "Commission %", "Status", "Customers", "Sales This Month (₹)", "Total Earned (₹)"];
  const rows = agents.map((a) => [
    a.id, a.name, a.email, a.phone, a.commissionType,
    a.commissionRate, a.status, a.customers, a.salesThisMonth, a.totalEarned,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sales_commission_agents.csv";
  a.click();
}

function exportExcel(agents) {
  const html = `<table>
    <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Commission Type</th><th>Commission %</th><th>Status</th><th>Customers</th><th>Sales This Month</th><th>Total Earned</th></tr>
    ${agents.map((a) => `<tr><td>${a.id}</td><td>${a.name}</td><td>${a.email}</td><td>${a.phone}</td><td>${a.commissionType}</td><td>${a.commissionRate}%</td><td>${a.status}</td><td>${a.customers}</td><td>₹${a.salesThisMonth}</td><td>₹${a.totalEarned}</td></tr>`).join("")}
  </table>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sales_commission_agents.xls";
  link.click();
}

function printAgents(agents) {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Sales Commission Agents</title>
  <style>body{font-family:sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f0f0f0}h2{color:#333}</style>
  </head><body><h2>Sales Commission Agents</h2>
  <table><tr><th>Name</th><th>Email</th><th>Phone</th><th>Commission Type</th><th>Rate</th><th>Customers</th><th>Sales/Month</th><th>Total Earned</th><th>Status</th></tr>
  ${agents.map((a) => `<tr><td>${a.name}</td><td>${a.email}</td><td>${a.phone}</td><td>${a.commissionType}</td><td>${a.commissionRate}%</td><td>${a.customers}</td><td>₹${a.salesThisMonth}</td><td>₹${a.totalEarned}</td><td>${a.status}</td></tr>`).join("")}
  </table></body></html>`);
  win.document.close();
  win.print();
}

function exportPDF(agents) {
  printAgents(agents);
}

// ─── Initial Data ────────────────────────────────────────────────
const initialAgents = [
  { id: 1, name: "Arjun Mehta", email: "arjun.mehta@manod.in", phone: "9876543210", commissionType: "Percentage", commissionRate: 5, status: "Active", customers: 24, salesThisMonth: 184000, totalEarned: 92000, joinDate: "2024-01-15", region: "South", notes: "Top performer Q1 2026" },
  { id: 2, name: "Priya Nair", email: "priya.nair@manod.in", phone: "9123456789", commissionType: "Fixed", commissionRate: 3, status: "Active", customers: 18, salesThisMonth: 97500, totalEarned: 48750, joinDate: "2024-03-22", region: "Kerala", notes: "Excellent customer retention" },
  { id: 3, name: "Ravi Kumar", email: "ravi.kumar@manod.in", phone: "9988776655", commissionType: "Percentage", commissionRate: 4, status: "Inactive", customers: 9, salesThisMonth: 0, totalEarned: 34200, joinDate: "2023-11-05", region: "Tamil Nadu", notes: "On leave until July 2026" },
];

const emptyForm = {
  name: "", email: "", phone: "", commissionType: "Percentage",
  commissionRate: "", status: "Active", customers: 0,
  salesThisMonth: 0, totalEarned: 0, joinDate: "", region: "", notes: "",
};

// ─── Agent Form (Add / Edit) ─────────────────────────────────────
function AgentFormPage({ onBack, onSave, editAgent }) {
  function Field({ label, required, children }) {
  return (
    <div style={fStyles.fieldWrap}>
      <label style={fStyles.label}>
        {label}
        {required && <span style={{ color: "#e53e3e" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
  const [form, setForm] = useState(editAgent ? { ...editAgent } : { ...emptyForm });
  const isEdit = !!editAgent;

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = () => {
    if (!form.name.trim()) { alert("Agent Name is required"); return; }
    if (!form.email.trim()) { alert("Email is required"); return; }
    if (!form.phone.trim()) { alert("Phone is required"); return; }
    if (!form.commissionRate) { alert("Commission Rate is required"); return; }
    onSave({ ...form });
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{isEdit ? "Edit Agent" : "Add Sales Commission Agent"}</h1>
          <span style={styles.subtitle}>{isEdit ? `Editing: ${editAgent.name}` : "Register a new commission agent"}</span>
        </div>
        <button onClick={onBack} style={styles.backBtn}>← Back to Agents</button>
      </div>

      <div style={styles.card}>
        <h3 style={fStyles.sectionTitle}>👤 Basic Information</h3>
        <div style={fStyles.grid}>
          <Field label="Agent Name" required>
            <input style={fStyles.input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Email" required>
            <input style={fStyles.input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="agent@company.com" />
          </Field>
          <Field label="Phone" required>
            <input style={fStyles.input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit number" />
          </Field>
          <Field label="Join Date">
            <input style={fStyles.input} type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} />
          </Field>
          <Field label="Region">
            <input style={fStyles.input} value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="e.g. South, Kerala" />
          </Field>
          <Field label="Status">
            <select style={fStyles.input} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>
          </Field>
        </div>

        <h3 style={{ ...fStyles.sectionTitle, marginTop: 28 }}>💰 Commission Details</h3>
        <div style={fStyles.grid}>
          <Field label="Commission Type" required>
            <select style={fStyles.input} value={form.commissionType} onChange={(e) => set("commissionType", e.target.value)}>
              <option>Percentage</option>
              <option>Fixed</option>
              <option>Tiered</option>
            </select>
          </Field>
          <Field label="Commission Rate (%)" required>
            <input style={fStyles.input} type="number" min="0" max="100" step="0.1" value={form.commissionRate} onChange={(e) => set("commissionRate", parseFloat(e.target.value) || "")} placeholder="e.g. 5" />
          </Field>
          <Field label="Customers Assigned">
            <input style={fStyles.input} type="number" min="0" value={form.customers} onChange={(e) => set("customers", parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Sales This Month (₹)">
            <input style={fStyles.input} type="number" min="0" value={form.salesThisMonth} onChange={(e) => set("salesThisMonth", parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Total Earned (₹)">
            <input style={fStyles.input} type="number" min="0" value={form.totalEarned} onChange={(e) => set("totalEarned", parseInt(e.target.value) || 0)} />
          </Field>
        </div>

        <h3 style={{ ...fStyles.sectionTitle, marginTop: 28 }}>📝 Notes</h3>
        <textarea
          style={{ ...fStyles.input, width: "100%", maxWidth: 600, minHeight: 80, resize: "vertical" }}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Any additional notes about this agent..."
        />

        <div style={styles.formActions}>
          <button onClick={handleSave} style={styles.saveBtn}>
            {isEdit ? "💾 Update Agent" : "💾 Save Agent"}
          </button>
          <button onClick={onBack} style={styles.cancelBtn}>Cancel</button>
        </div>
      </div>

      <div style={styles.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

// ─── Main List ───────────────────────────────────────────────────
export default function SalesCommissionAgents() {
  const [view, setView] = useState("list");
  const [agents, setAgents] = useState(initialAgents);
  const [editAgent, setEditAgent] = useState(null);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState("25");
  const [showColMenu, setShowColMenu] = useState(false);
  const [colVisible, setColVisible] = useState({
    Name: true, Email: true, Phone: true, "Commission Type": true,
    "Rate": true, Customers: true, "Sales/Month": true, "Total Earned": true, Status: true, Action: true,
  });
  const nextId = useRef(initialAgents.length + 1);

  if (view === "add") {
    return (
      <AgentFormPage
        onBack={() => setView("list")}
        onSave={(data) => {
          setAgents((prev) => [...prev, { ...data, id: nextId.current++ }]);
          setView("list");
        }}
        editAgent={null}
      />
    );
  }

  if (view === "edit") {
    return (
      <AgentFormPage
        onBack={() => { setEditAgent(null); setView("list"); }}
        onSave={(data) => {
          setAgents((prev) => prev.map((a) => a.id === editAgent.id ? { ...data, id: a.id } : a));
          setEditAgent(null);
          setView("list");
        }}
        editAgent={editAgent}
      />
    );
  }

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.region.toLowerCase().includes(search.toLowerCase())
  );
  const shown = filtered.slice(0, parseInt(show));

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this agent?"))
      setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const totalSales = agents.reduce((s, a) => s + a.salesThisMonth, 0);
  const activeCount = agents.filter((a) => a.status === "Active").length;

  const cols = [
    { key: "Name", render: (a) => <span style={{ fontWeight: 500 }}>{a.name}</span> },
    { key: "Email", render: (a) => a.email },
    { key: "Phone", render: (a) => a.phone },
    { key: "Commission Type", render: (a) => <span style={{ ...badge, background: a.commissionType === "Percentage" ? "#eff6ff" : "#f0fdf4", color: a.commissionType === "Percentage" ? "#2563eb" : "#15803d" }}>{a.commissionType}</span> },
    { key: "Rate", render: (a) => `${a.commissionRate}%` },
    { key: "Customers", render: (a) => a.customers },
    { key: "Sales/Month", render: (a) => `₹${a.salesThisMonth.toLocaleString("en-IN")}` },
    { key: "Total Earned", render: (a) => `₹${a.totalEarned.toLocaleString("en-IN")}` },
    {
      key: "Status", render: (a) => (
        <span style={{ ...badge, background: a.status === "Active" ? "#f0fdf4" : a.status === "Inactive" ? "#fef9c3" : "#fef2f2", color: a.status === "Active" ? "#16a34a" : a.status === "Inactive" ? "#a16207" : "#dc2626" }}>
          {a.status}
        </span>
      )
    },
  ];

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sales Commission Agents</h1>
          <span style={styles.subtitle}>Manage commission agents & their performance</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={summaryGrid}>
        {[
          { label: "Total Agents", value: agents.length, color: "#4f46e5", icon: "👥" },
          { label: "Active Agents", value: activeCount, color: "#16a34a", icon: "✅" },
          { label: "Sales This Month", value: `₹${totalSales.toLocaleString("en-IN")}`, color: "#0891b2", icon: "📈" },
          { label: "Avg Commission", value: agents.length ? `${(agents.reduce((s, a) => s + parseFloat(a.commissionRate || 0), 0) / agents.length).toFixed(1)}%` : "0%", color: "#d97706", icon: "💰" },
        ].map((c) => (
          <div key={c.label} style={{ ...summaryCard, borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: 24 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.tableToolbar}>
          <h3 style={styles.tableTitle}>All Agents</h3>
          <button onClick={() => setView("add")} style={styles.addBtn}>+ Add Agent</button>
        </div>

        {/* Export Buttons */}
        <div style={styles.exportBar}>
          <button onClick={() => exportCSV(filtered)} style={styles.exportBtn}>
            <span style={{ ...styles.exportIcon, background: "#16a34a", color: "#fff" }}>CSV</span> Export CSV
          </button>
          <button onClick={() => exportExcel(filtered)} style={styles.exportBtn}>
            <span style={{ ...styles.exportIcon, background: "#15803d", color: "#fff" }}>XLS</span> Export Excel
          </button>
          <button onClick={() => printAgents(filtered)} style={styles.exportBtn}>
            <span style={{ ...styles.exportIcon, background: "#6b7280", color: "#fff" }}>🖨</span> Print
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowColMenu((v) => !v)} style={styles.exportBtn}>
              <span style={{ ...styles.exportIcon, background: "#7c3aed", color: "#fff" }}>⊞</span> Column visibility
            </button>
            {showColMenu && (
              <div style={styles.colMenu}>
                {Object.keys(colVisible).map((col) => (
                  <label key={col} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>
                    <input type="checkbox" checked={colVisible[col]} onChange={() => setColVisible((v) => ({ ...v, [col]: !v[col] }))} />
                    {col}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => exportPDF(filtered)} style={styles.exportBtn}>
            <span style={{ ...styles.exportIcon, background: "#dc2626", color: "#fff" }}>PDF</span> Export PDF
          </button>
        </div>

        <div style={styles.tableControls}>
          <div style={styles.showEntries}>
            Show&nbsp;
            <select value={show} onChange={(e) => setShow(e.target.value)} style={styles.select}>
              {["10", "25", "50", "100"].map((n) => <option key={n}>{n}</option>)}
            </select>
            &nbsp;entries
          </div>
          <input placeholder="Search name, email, region..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...styles.searchInput, width: 240 }} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                {cols.filter((c) => colVisible[c.key]).map((c) => (
                  <th key={c.key} style={styles.th}>{c.key}</th>
                ))}
                {colVisible.Action && <th style={styles.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: 32, color: "#a0aec0" }}>No agents found</td></tr>
              ) : shown.map((agent) => (
                <tr key={agent.id} className="table-row">
                  {cols.filter((c) => colVisible[c.key]).map((c) => (
                    <td key={c.key} style={styles.td}>{c.render(agent)}</td>
                  ))}
                  {colVisible.Action && (
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={styles.editBtn} onClick={() => { setEditAgent(agent); setView("edit"); }}>✎ Edit</button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(agent.id)}>🗑 Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.tableFooter}>
          <span>Showing 1 to {shown.length} of {filtered.length} entries</span>
          <div style={styles.pagination}>
            <button style={styles.pageBtn}>Previous</button>
            <button style={{ ...styles.pageBtn, ...styles.pageBtnActive }}>1</button>
            <button style={styles.pageBtn}>Next</button>
          </div>
        </div>
      </div>

      <div style={styles.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const badge = { borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: 600, display: "inline-block" };

const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 20 };
const summaryCard = { background: "#fff", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif", background: "#f0f4f1", minHeight: "100vh", padding: "0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 700, color: "#1a202c", margin: 0 },
  subtitle: { fontSize: 13, color: "#718096" },
  backBtn: { background: "#fff", border: "1px solid #cbd5e0", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#4a5568", fontWeight: 500 },
  card: { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 20 },
  tableToolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  tableTitle: { fontSize: 16, fontWeight: 600, margin: 0, color: "#2d3748" },
  addBtn: { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(34,197,94,0.35)" },
  exportBar: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" },
  exportBtn: { display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 },
  exportIcon: { borderRadius: 3, padding: "1px 5px", fontSize: 11, fontWeight: 700, lineHeight: "18px" },
  colMenu: { position: "absolute", top: "100%", left: 0, zIndex: 100, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: 200, padding: "4px 0" },
  tableControls: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 },
  showEntries: { fontSize: 13, color: "#4a5568", display: "flex", alignItems: "center" },
  select: { border: "1px solid #cbd5e0", borderRadius: 4, padding: "2px 6px", fontSize: 13 },
  searchInput: { border: "1px solid #cbd5e0", borderRadius: 6, padding: "6px 12px", fontSize: 13, width: 200 },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f7fafc" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#4a5568", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" },
  td: { padding: "12px 14px", fontSize: 13, color: "#2d3748", borderBottom: "1px solid #f0f4f1", whiteSpace: "nowrap" },
  tableFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13, color: "#718096", flexWrap: "wrap", gap: 10 },
  pagination: { display: "flex", gap: 4 },
  pageBtn: { border: "1px solid #cbd5e0", background: "#fff", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 13, color: "#4a5568" },
  pageBtnActive: { background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  editBtn: { background: "#fff", border: "1px solid #a0aec0", borderRadius: 5, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: "#4a5568", fontWeight: 500 },
  deleteBtn: { background: "#fff", border: "1px solid #fc8181", borderRadius: 5, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: "#e53e3e", fontWeight: 500 },
  formActions: { display: "flex", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid #e2e8f0" },
  saveBtn: { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(34,197,94,0.35)" },
  cancelBtn: { background: "#fff", color: "#4a5568", border: "1px solid #cbd5e0", borderRadius: 6, padding: "10px 24px", fontSize: 14, cursor: "pointer" },
  footer: { textAlign: "center", fontSize: 12, color: "#a0aec0", padding: "16px 0" },
};

const fStyles = {
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 16px", padding: "0 0 8px", borderBottom: "1px solid #e5e7eb" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", fontSize: 14, outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" },
};

const css = `
  .table-row:hover td { background: #f7fafc; }
  input:focus, select:focus, textarea:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
`;
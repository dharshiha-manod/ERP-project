import { useState } from "react";

const PREFIXES = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

export default function SalesCommissionAgents() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState("25");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    prefix: "", firstName: "", lastName: "",
    email: "", contactNumber: "", address: "", commissionPercentage: "",
  });
  const [errors, setErrors] = useState({});

  const filtered = agents.filter(
    (a) =>
      a.firstName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setForm({ prefix: "", firstName: "", lastName: "", email: "", contactNumber: "", address: "", commissionPercentage: "" });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First Name is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setAgents((prev) => [...prev, {
      id: Date.now(), ...form,
      name: `${form.prefix ? form.prefix + " " : ""}${form.firstName} ${form.lastName}`.trim(),
    }]);
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this agent?"))
      setAgents((a) => a.filter((x) => x.id !== id));
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  return (
    // ✅ No background or padding here — App.jsx already handles that
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100%" }}>
      <style>{css}</style>

      {/* Header */}
      <h1 style={s.title}>Sales Commission Agents</h1>

      {/* Card */}
      <div style={s.card}>
        <div style={s.toolbar}>
          <div style={s.toolbarLeft}>
            <div style={s.showEntries}>
              Show&nbsp;
              <select value={show} onChange={(e) => setShow(e.target.value)} style={s.select}>
                {["10", "25", "50", "100"].map((n) => <option key={n}>{n}</option>)}
              </select>
              &nbsp;entries
            </div>
            <div style={s.exportBtns}>
              {["Export CSV", "Export Excel", "Print", "Column visibility", "Export PDF"].map((label) => (
                <button key={label} style={s.exportBtn}>{label}</button>
              ))}
            </div>
          </div>
          <div style={s.toolbarRight}>
            <input
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
            />
            {/* ✅ Add button styled as a round purple pill, top-right per screenshot */}
            <button onClick={openModal} style={s.addBtn}>+ Add</button>
          </div>
        </div>

        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {["Name", "Email", "Contact Number", "Address", "Sales Commission Percentage (%)", "Action"].map((col) => (
                <th key={col} style={s.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={s.noData}>No data available in table</td></tr>
            ) : (
              filtered.map((agent) => (
                <tr key={agent.id} className="table-row">
                  <td style={s.td}>{agent.name}</td>
                  <td style={s.td}>{agent.email}</td>
                  <td style={s.td}>{agent.contactNumber}</td>
                  <td style={s.td}>{agent.address}</td>
                  <td style={s.td}>{agent.commissionPercentage}</td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={s.editBtn} onClick={() => alert(`Edit ${agent.name}`)}>✎ Edit</button>
                      <button style={s.deleteBtn} onClick={() => handleDelete(agent.id)}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={s.tableFooter}>
          <span>
            Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${filtered.length} of ${filtered.length}`} entries
          </span>
          <div style={s.pagination}>
            <button style={s.pageBtn}>Previous</button>
            <button style={s.pageBtn}>Next</button>
          </div>
        </div>
      </div>

      <div style={s.footer}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </div>

      {/* Modal */}
      {showModal && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Add sales commission agent</span>
              <button style={s.closeX} onClick={closeModal}>×</button>
            </div>

            <div style={s.modalBody}>
              {/* Row 1 */}
              <div style={s.row3}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Prefix:</label>
                  <select value={form.prefix} onChange={set("prefix")} style={s.inputSm}>
                    <option value="">Mr / M</option>
                    {PREFIXES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>First Name:<span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    style={{ ...s.input, borderColor: errors.firstName ? "#e53e3e" : "#cbd5e0" }}
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={set("firstName")}
                  />
                  {errors.firstName && <span style={s.error}>{errors.firstName}</span>}
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Last Name:</label>
                  <input style={s.input} placeholder="Last Name" value={form.lastName} onChange={set("lastName")} />
                </div>
              </div>

              {/* Row 2 */}
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Email:</label>
                  <input style={s.input} placeholder="Email" value={form.email} onChange={set("email")} type="email" />
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Contact Number:</label>
                  <input style={s.input} placeholder="Contact Number" value={form.contactNumber} onChange={set("contactNumber")} />
                </div>
              </div>

              {/* Address */}
              <div style={s.field}>
                <label style={s.fieldLabel}>Address:</label>
                <textarea style={s.textarea} placeholder="Address" value={form.address} onChange={set("address")} rows={3} />
              </div>

              {/* Commission % */}
              <div style={{ ...s.field, maxWidth: 260 }}>
                <label style={s.fieldLabel}>Sales Commission Percentage (%):</label>
                <input
                  style={s.input}
                  placeholder="Sales Commission Percentage (%)"
                  value={form.commissionPercentage}
                  onChange={set("commissionPercentage")}
                  type="number" min="0" max="100"
                />
              </div>
            </div>

            <div style={s.modalFooter}>
              <button onClick={handleSave} style={s.saveBtn}>Save</button>
              <button onClick={closeModal} style={s.closeBtnDark}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const s = {
  // ✅ title sits flush — App.jsx padding already gives the 24px gap
  title: { fontSize: 26, fontWeight: 700, color: "#1a202c", margin: "0 0 20px 0" },

  card: {
    background: "#fff",
    borderRadius: 10,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    marginBottom: 20,
  },
  toolbar: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16,
  },
  toolbarLeft: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  toolbarRight: { display: "flex", alignItems: "center", gap: 10 },
  showEntries: { fontSize: 13, color: "#4a5568", display: "flex", alignItems: "center" },
  select: { border: "1px solid #cbd5e0", borderRadius: 4, padding: "2px 6px", fontSize: 13 },
  exportBtns: { display: "flex", gap: 6, flexWrap: "wrap" },
  exportBtn: {
    background: "#fff", border: "1px solid #cbd5e0", borderRadius: 4,
    padding: "5px 10px", fontSize: 12, cursor: "pointer", color: "#4a5568",
  },
  searchInput: {
    border: "1px solid #cbd5e0", borderRadius: 6,
    padding: "6px 12px", fontSize: 13, width: 180,
  },
  // ✅ Matches screenshot: round pill, indigo/purple
  addBtn: {
    background: "#4338ca", color: "#fff", border: "none",
    borderRadius: 999, padding: "10px 22px",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 2px 8px rgba(67,56,202,0.25)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f7fafc" },
  th: {
    textAlign: "left", padding: "10px 14px", fontSize: 13,
    fontWeight: 600, color: "#4a5568",
    borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap",
  },
  td: { padding: "12px 14px", fontSize: 14, color: "#2d3748", borderBottom: "1px solid #f0f4f1" },
  noData: { textAlign: "center", padding: "40px 0", color: "#a0aec0", fontSize: 14 },
  tableFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 16, fontSize: 13, color: "#718096", flexWrap: "wrap", gap: 10,
  },
  pagination: { display: "flex", gap: 4 },
  pageBtn: {
    border: "1px solid #cbd5e0", background: "#fff", borderRadius: 4,
    padding: "5px 12px", cursor: "pointer", fontSize: 13, color: "#4a5568",
  },
  editBtn: {
    background: "#fff", border: "1px solid #a0aec0", borderRadius: 5,
    padding: "5px 10px", fontSize: 12, cursor: "pointer", color: "#4a5568",
  },
  deleteBtn: {
    background: "#fff", border: "1px solid #fc8181", borderRadius: 5,
    padding: "5px 10px", fontSize: 12, cursor: "pointer", color: "#e53e3e",
  },
  footer: { textAlign: "center", fontSize: 12, color: "#a0aec0", padding: "16px 0" },

  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 10, width: "100%", maxWidth: 680,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px", borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#1a202c" },
  closeX: { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#718096", lineHeight: 1 },
  modalBody: {
    padding: "20px 24px", display: "flex", flexDirection: "column",
    gap: 16, maxHeight: "70vh", overflowY: "auto",
  },
  row3: { display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 12 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel: { fontSize: 13, fontWeight: 500, color: "#2d3748" },
  input: {
    border: "1px solid #cbd5e0", borderRadius: 6, padding: "8px 10px",
    fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box",
  },
  inputSm: {
    border: "1px solid #cbd5e0", borderRadius: 6, padding: "8px 6px",
    fontSize: 14, outline: "none", width: "100%", background: "#fff",
  },
  textarea: {
    border: "1px solid #cbd5e0", borderRadius: 6, padding: "8px 10px",
    fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box",
    resize: "vertical", fontFamily: "inherit",
  },
  error: { fontSize: 11, color: "#e53e3e" },
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: 10,
    padding: "16px 24px", borderTop: "1px solid #e2e8f0",
  },
  saveBtn: {
    background: "#6c6fe6", color: "#fff", border: "none", borderRadius: 6,
    padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  closeBtnDark: {
    background: "#2d3748", color: "#fff", border: "none", borderRadius: 6,
    padding: "10px 24px", fontSize: 14, cursor: "pointer",
  },
};

const css = `
  .table-row:hover td { background: #f7fafc; }
  input:focus, textarea:focus, select:focus {
    border-color: #4f46e5 !important;
    outline: none;
    box-shadow: 0 0 0 2px rgba(79,70,229,0.1);
  }
`;
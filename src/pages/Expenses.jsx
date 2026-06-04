import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── shared design tokens ─────────────────────────────── */
const T = {
  bg: "#f0f4f1",
  surface: "#ffffff",
  border: "#e0e8e2",
  primary: "#1a7a4a",
  primaryDark: "#145c38",
  accent: "#2ecc71",
  textMain: "#1a2e22",
  textSub: "#5a7566",
  textMuted: "#8fa89a",
  danger: "#e53e3e",
  warn: "#dd6b20",
  info: "#2b6cb0",
};

const styles = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: T.bg,
    minHeight: "100vh",
    padding: "24px",
    color: T.textMain,
  },
  card: {
    background: T.surface,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: T.textMain,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: T.textMain,
    padding: "16px 20px",
    borderBottom: `1px solid ${T.border}`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    padding: "12px 14px",
    background: "#f6faf7",
    color: T.textSub,
    fontWeight: 600,
    fontSize: 13,
    borderBottom: `1px solid ${T.border}`,
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "11px 14px",
    borderBottom: `1px solid ${T.border}`,
    color: T.textMain,
    fontSize: 13,
    verticalAlign: "middle",
  },
  // Green gradient save button (matches img 7)
  btnSave: {
    background: "linear-gradient(135deg, #1a7a4a 0%, #25a05f 60%, #2ecc71 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 26px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 14px rgba(26,122,74,0.35)",
    transition: "transform .15s, box-shadow .15s",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #1a7a4a 0%, #2ecc71 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 3px 10px rgba(26,122,74,0.3)",
  },
  btnSecondary: {
    background: T.surface,
    color: T.textMain,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  btnDanger: {
    background: "#fff0f0",
    color: T.danger,
    border: `1px solid #fca5a5`,
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    fontSize: 14,
    color: T.textMain,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: T.textSub,
    display: "block",
    marginBottom: 5,
  },
  formGroup: {
    marginBottom: 18,
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    fontSize: 14,
    color: T.textMain,
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  },
  // Export/utility buttons matching img 6 style
  exportBtn: (color) => ({
    background: color || "#f6faf7",
    color: color ? "#fff" : T.textSub,
    border: color ? "none" : `1px solid ${T.border}`,
    borderRadius: 7,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
  }),
};

/* ─── Export toolbar (reusable) ─────────────────────────── */
function ExportBar({ onPrint }) {
  const handleExport = (type) => {
    alert(`Export as ${type} — connect your backend here`);
  };
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: T.textSub }}>
          Show&nbsp;
          <select style={{ ...styles.select, width: 60, display: "inline-block", padding: "4px 6px" }}>
            <option>25</option><option>50</option><option>100</option>
          </select>
          &nbsp;entries
        </span>
        <button style={styles.exportBtn("#217a48")} onClick={() => handleExport("CSV")}>
          📊 Export CSV
        </button>
        <button style={styles.exportBtn("#1d6a3a")} onClick={() => handleExport("Excel")}>
          📗 Export Excel
        </button>
        <button style={styles.exportBtn()} onClick={onPrint || (() => window.print())}>
          🖨️ Print
        </button>
        <button style={styles.exportBtn()} onClick={() => handleExport("Columns")}>
          👁 Column visibility
        </button>
        <button style={styles.exportBtn("#b91c1c")} onClick={() => handleExport("PDF")}>
          📄 Export PDF ▾
        </button>
      </div>
      <input placeholder="Search ..." style={{ ...styles.input, width: 180 }} />
    </div>
  );
}

/* ─── Filters bar ────────────────────────────────────────── */
function FiltersBar() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...styles.card, marginBottom: 20 }}>
      <div
        style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: T.textSub, fontSize: 14 }}>
          <span>⚙️</span> Filters
        </span>
        <span style={{ fontSize: 18, color: T.textMuted, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
      </div>
      {open && (
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
          <div>
            <label style={styles.label}>Date From</label>
            <input type="date" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Date To</label>
            <input type="date" style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Expense Category</label>
            <select style={styles.select}><option>All</option></select>
          </div>
          <div>
            <label style={styles.label}>Payment Status</label>
            <select style={styles.select}><option>All</option><option>Paid</option><option>Due</option></select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button style={styles.btnPrimary}>Filter</button>
            <button style={styles.btnSecondary}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   1. LIST EXPENSES
════════════════════════════════════════════════════════════ */
export function ListExpenses() {
  const navigate = useNavigate();
  const [expenses] = useState([
    { id: 1, date: "06/01/2026", ref: "EP-2026-001", category: "Office Supplies", sub: "Stationery", location: "Main Store", paymentStatus: "Paid", tax: "₹0.00", total: "₹1,200.00", due: "₹0.00", expFor: "Admin", contact: "—", note: "Monthly stationery", addedBy: "Dharshiha C" },
    { id: 2, date: "06/03/2026", ref: "EP-2026-002", category: "Utilities", sub: "Electricity", location: "Warehouse A", paymentStatus: "Due", tax: "₹180.00", total: "₹3,600.00", due: "₹3,600.00", expFor: "Admin", contact: "—", note: "", addedBy: "Admin" },
    { id: 3, date: "06/04/2026", ref: "EP-2026-003", category: "Logistics", sub: "Courier", location: "Main Store", paymentStatus: "Paid", tax: "₹54.00", total: "₹600.00", due: "₹0.00", expFor: "Dharshiha C", contact: "ABC Corp", note: "Urgent delivery", addedBy: "Dharshiha C" },
  ]);

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Expenses</h1>
      <FiltersBar />
      <div style={styles.card}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>All expenses</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={styles.btnPrimary} onClick={() => navigate("/import-expenses")}>
              ⬆ Import expense
            </button>
            <button style={styles.btnSave} onClick={() => navigate("/expenses/create")}>
              + Add
            </button>
          </div>
        </div>
        <ExportBar />
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Action","Date","Reference No","Recurring details","Expense Category","Sub category","Location","Payment Status","Tax","Total amount","Payment due","Expense for","Contact","Expense note","Added by"].map(h => (
                  <th key={h} style={styles.th}>{h} {["Date","Reference No","Expense Category","Payment Status","Total amount"].includes(h) ? "⇅" : ""}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={e.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfb" }}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button title="View" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>👁</button>
                      <button title="Edit" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✏️</button>
                      <button title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>🗑️</button>
                    </div>
                  </td>
                  <td style={styles.td}>{e.date}</td>
                  <td style={styles.td}><strong>{e.ref}</strong></td>
                  <td style={styles.td}>—</td>
                  <td style={styles.td}>{e.category}</td>
                  <td style={styles.td}>{e.sub}</td>
                  <td style={styles.td}>{e.location}</td>
                  <td style={styles.td}>
                    <span style={{
                      background: e.paymentStatus === "Paid" ? "#dcfce7" : "#fef9c3",
                      color: e.paymentStatus === "Paid" ? "#166534" : "#854d0e",
                      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600
                    }}>{e.paymentStatus}</span>
                  </td>
                  <td style={styles.td}>{e.tax}</td>
                  <td style={styles.td}><strong>{e.total}</strong></td>
                  <td style={styles.td}>{e.due}</td>
                  <td style={styles.td}>{e.expFor}</td>
                  <td style={styles.td}>{e.contact}</td>
                  <td style={styles.td}>{e.note}</td>
                  <td style={styles.td}>{e.addedBy}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f0f4f1" }}>
                <td colSpan={9} style={{ ...styles.td, fontWeight: 700, textAlign: "right" }}>Total:</td>
                <td style={{ ...styles.td, fontWeight: 700 }}>₹5,400.00</td>
                <td style={{ ...styles.td, fontWeight: 700 }}>₹3,600.00</td>
                <td colSpan={4} style={styles.td}></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: T.textSub }}>
          <span>Showing 1 to {expenses.length} of {expenses.length} entries</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.btnSecondary}>Previous</button>
            <button style={styles.btnSecondary}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. ADD EXPENSE
════════════════════════════════════════════════════════════ */
export function AddExpense() {
  const navigate = useNavigate();
  const [isRecurring, setIsRecurring] = useState(false);
  const [isRefund, setIsRefund] = useState(false);
  const [form, setForm] = useState({
    location: "Manodtechnologies (BL0001)",
    category: "", sub: "", ref: "", date: new Date().toLocaleDateString("en-GB").replace(/\//g, "/") + " " + new Date().toTimeString().slice(0,5),
    expFor: "None", expContact: "", tax: "None", amount: "", note: "",
    file: null, interval: "", intervalUnit: "Days", repetitions: ""
  });
  const fileRef = useRef();

  const handleSave = (e) => {
    e.preventDefault();
    alert("Expense saved!");
    navigate("/expenses");
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Add Expense</h1>
      <form onSubmit={handleSave}>
        {/* Main card */}
        <div style={{ ...styles.card, marginBottom: 20, padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ ...styles.label }}>Business Location:*</label>
              <select style={styles.select} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
                <option>Manodtechnologies (BL0001)</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Expense Category:</label>
              <select style={styles.select} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Please Select</option>
                <option>Office Supplies</option>
                <option>Utilities</option>
                <option>Logistics</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Sub category:</label>
              <select style={styles.select} value={form.sub} onChange={e => setForm({ ...form, sub: e.target.value })}>
                <option value="">Please Select</option>
                <option>Stationery</option>
                <option>Electricity</option>
                <option>Courier</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={styles.label}>Reference No:</label>
              <input style={styles.input} placeholder="Leave empty to autogenerate" value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} />
              <span style={{ fontSize: 12, color: T.textMuted }}>Leave empty to autogenerate</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={styles.label}>Date:*</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>📅</span>
                <input style={{ ...styles.input, paddingLeft: 34 }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div>
              <label style={styles.label}>Expense for: ℹ️</label>
              <select style={styles.select} value={form.expFor} onChange={e => setForm({ ...form, expFor: e.target.value })}>
                <option>None</option>
                <option>Admin</option>
                <option>Dharshiha C</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Expense for contact:</label>
              <select style={styles.select} value={form.expContact} onChange={e => setForm({ ...form, expContact: e.target.value })}>
                <option value="">Please Select</option>
                <option>ABC Corp</option>
                <option>XYZ Ltd</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={styles.label}>Attach Document:</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png" onChange={e => setForm({ ...form, file: e.target.files[0] })} />
                <input style={{ ...styles.input, flex: 1 }} readOnly value={form.file ? form.file.name : ""} placeholder="" />
                <button type="button" style={{ ...styles.btnPrimary, whiteSpace: "nowrap", padding: "9px 14px" }} onClick={() => fileRef.current.click()}>
                  📁 Browse..
                </button>
              </div>
              <span style={{ fontSize: 11, color: T.textMuted }}>Max File size: 5MB — .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</span>
            </div>
            <div>
              <label style={styles.label}>Applicable Tax:</label>
              <select style={styles.select}>
                <option>None</option>
                <option>GST 5%</option>
                <option>GST 12%</option>
                <option>GST 18%</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Total amount:*</label>
              <input style={styles.input} type="number" placeholder="Total amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={styles.label}>Expense note:</label>
              <textarea style={{ ...styles.input, height: 90, resize: "vertical" }} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingTop: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                <input type="checkbox" checked={isRefund} onChange={e => setIsRefund(e.target.checked)} style={{ width: 18, height: 18, accentColor: T.primary }} />
                Is refund? ℹ️
              </label>
            </div>
          </div>
        </div>

        {/* Recurring card */}
        <div style={{ ...styles.card, marginBottom: 24, padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: 18, height: 18, accentColor: T.primary }} />
              <label htmlFor="recurring" style={{ fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Is Recurring? ℹ️</label>
            </div>
            <div>
              <label style={styles.label}>Recurring interval:*</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...styles.input, flex: 1 }} type="number" value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })} disabled={!isRecurring} />
                <select style={{ ...styles.select, width: 100 }} value={form.intervalUnit} onChange={e => setForm({ ...form, intervalUnit: e.target.value })} disabled={!isRecurring}>
                  <option>Days</option><option>Weeks</option><option>Months</option>
                </select>
              </div>
            </div>
            <div>
              <label style={styles.label}>No. of Repetitions:</label>
              <input style={styles.input} type="number" placeholder="" value={form.repetitions} onChange={e => setForm({ ...form, repetitions: e.target.value })} disabled={!isRecurring} />
              <span style={{ fontSize: 11, color: T.textMuted }}>If blank expense will be generated infinite times</span>
            </div>
          </div>
        </div>

        {/* Save button matching img 7 */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="submit" style={{ ...styles.btnSave, padding: "14px 60px", fontSize: 16, borderRadius: 10 }}>
            💾 Save
          </button>
        </div>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. IMPORT EXPENSE
════════════════════════════════════════════════════════════ */
export function ImportExpenses() {
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const instructions = [
    { col: 1, name: "Business Location", instruction: "" },
    { col: 2, name: "Expense Category (Optional)", instruction: "Name of the Category (If not found new category with the given name will be created)" },
    { col: 3, name: "Sub category (Optional)", instruction: "Name of the Sub-Category (If not found new sub-category with the given name under the parent Category will be created)" },
    { col: 4, name: "Reference No (Optional)", instruction: "Leave empty to autogenerate" },
    { col: 5, name: "Date (Optional)", instruction: 'Expense date time format should be "Y-m-d H:i:s" (2020-07-15 17:45:32)' },
    { col: 6, name: "Expense for (Optional)", instruction: "Choose the user (email/username) for which expense is related to (Optional)" },
    { col: 7, name: "Contact (Optional)", instruction: "Contact name or ID" },
    { col: 8, name: "Applicable Tax (Optional)", instruction: "Tax rate name" },
    { col: 9, name: "Total Amount*", instruction: "Total expense amount (Required)" },
    { col: 10, name: "Payment Status (Optional)", instruction: "paid / due / partial" },
    { col: 11, name: "Expense Note (Optional)", instruction: "Additional notes" },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Import expense</h1>
      <div style={{ ...styles.card, marginBottom: 24, padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <label style={{ ...styles.label, marginBottom: 8 }}>File To Import:</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
              <button type="button" style={styles.btnSecondary} onClick={() => fileRef.current.click()}>
                Choose File
              </button>
              <span style={{ fontSize: 13, color: T.textMuted }}>{file ? file.name : "No file chosen"}</span>
            </div>
          </div>
          <div style={{ paddingTop: 22 }}>
            <button style={{ ...styles.btnSave, padding: "10px 32px" }} onClick={() => { if (!file) { alert("Please select a file first"); return; } alert("Import submitted!"); }}>
              Submit
            </button>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button
            style={{ background: "linear-gradient(135deg,#166534,#22c55e)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            onClick={() => alert("Downloading template...")}
          >
            ⬇ Download template file
          </button>
        </div>
      </div>

      {/* Instructions table */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Instructions</div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Column Number</th>
                <th style={styles.th}>Column Name</th>
                <th style={styles.th}>Instruction</th>
              </tr>
            </thead>
            <tbody>
              {instructions.map((r, i) => (
                <tr key={r.col} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfb" }}>
                  <td style={styles.td}>{r.col}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{r.name}</td>
                  <td style={{ ...styles.td, color: T.textSub, fontSize: 12 }}>{r.instruction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. EXPENSE CATEGORIES
════════════════════════════════════════════════════════════ */
export function ExpenseCategories() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Office Supplies", code: "OS-001" },
    { id: 2, name: "Utilities", code: "UT-001" },
    { id: 3, name: "Logistics", code: "LG-001" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({ name: "", code: "", isSub: false });
  const [editId, setEditId] = useState(null);

  const handleSave = () => {
    if (!modalForm.name.trim()) { alert("Category name is required"); return; }
    if (editId) {
      setCategories(categories.map(c => c.id === editId ? { ...c, name: modalForm.name, code: modalForm.code } : c));
    } else {
      setCategories([...categories, { id: Date.now(), name: modalForm.name, code: modalForm.code }]);
    }
    setShowModal(false);
    setModalForm({ name: "", code: "", isSub: false });
    setEditId(null);
  };

  const handleEdit = (c) => {
    setModalForm({ name: c.name, code: c.code, isSub: false });
    setEditId(c.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>
        Expense Categories <span style={{ fontSize: 15, fontWeight: 400, color: T.textMuted, marginLeft: 10 }}>Manage your expense categories</span>
      </h1>
      <div style={styles.card}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>All your expense categories</span>
          <button style={styles.btnSave} onClick={() => { setModalForm({ name: "", code: "", isSub: false }); setEditId(null); setShowModal(true); }}>
            + Add
          </button>
        </div>
        <ExportBar />
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category name ⇅</th>
                <th style={styles.th}>Category code ⇅</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={3} style={{ ...styles.td, textAlign: "center", color: T.textMuted, padding: "32px" }}>No data available in table</td></tr>
              ) : categories.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfb" }}>
                  <td style={styles.td}>{c.name}</td>
                  <td style={styles.td}>{c.code}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEdit(c)} style={{ ...styles.btnSecondary, padding: "5px 12px", fontSize: 12 }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={{ ...styles.btnSecondary, padding: "5px 12px", fontSize: 12, color: T.danger, borderColor: "#fca5a5" }}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", fontSize: 13, color: T.textSub, alignItems: "center" }}>
          <span>Showing {categories.length === 0 ? "0 to 0 of 0" : `1 to ${categories.length} of ${categories.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.btnSecondary}>Previous</button>
            <button style={styles.btnSecondary}>Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 440, padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editId ? "Edit" : "Add"} Expense Category</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.textMuted }}>×</button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category name:*</label>
              <input style={styles.input} placeholder="Category name" value={modalForm.name} onChange={e => setModalForm({ ...modalForm, name: e.target.value })} autoFocus />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category code:</label>
              <input style={styles.input} placeholder="Category code" value={modalForm.code} onChange={e => setModalForm({ ...modalForm, code: e.target.value })} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 24 }}>
              <input type="checkbox" checked={modalForm.isSub} onChange={e => setModalForm({ ...modalForm, isSub: e.target.checked })} style={{ width: 16, height: 16, accentColor: T.primary }} />
              Add as sub-category
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={{ ...styles.btnSave, padding: "10px 28px" }} onClick={handleSave}>Save</button>
              <button style={{ background: "#374151", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }} onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────── default export convenience ──────────────────────── */
export default ListExpenses;
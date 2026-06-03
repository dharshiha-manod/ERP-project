import { useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   SHARED UTILITIES
───────────────────────────────────────────── */
const CRM_GREEN = "#1a5c38";
const BTN_TEAL = "#17a2b8";

const styles = {
  page: { background: "#f4f6f9", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  topNav: {
    background: CRM_GREEN, display: "flex", alignItems: "center", padding: "0 16px",
    gap: 0, borderBottom: "2px solid #14532d", flexWrap: "wrap"
  },
  topNavBrand: {
    color: "#fff", fontWeight: 700, fontSize: 15, marginRight: 16, display: "flex",
    alignItems: "center", gap: 6, padding: "10px 0"
  },
  topNavLink: (active) => ({
    color: active ? "#fff" : "rgba(255,255,255,0.8)", background: active ? "rgba(0,0,0,0.2)" : "transparent",
    padding: "12px 14px", fontSize: 13, cursor: "pointer", borderBottom: "none",
    textDecoration: "none", display: "inline-block", transition: "background 0.15s",
    whiteSpace: "nowrap"
  }),
  content: { padding: "24px" },
  card: {
    background: "#fff", borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    padding: "20px", marginBottom: 20
  },
  pageTitle: { fontSize: 22, fontWeight: 600, color: "#333", marginBottom: 16 },
  filterBar: {
    background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6,
    padding: "14px 18px", marginBottom: 16
  },
  filterRow: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" },
  label: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 },
  select: {
    border: "1px solid #ccc", borderRadius: 4, padding: "6px 10px", fontSize: 13,
    background: "#fff", minWidth: 160, cursor: "pointer"
  },
  input: {
    border: "1px solid #ccc", borderRadius: 4, padding: "6px 10px", fontSize: 13,
    background: "#fff", width: "100%", boxSizing: "border-box"
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#f8f9fa", border: "1px solid #dee2e6", padding: "8px 10px",
    textAlign: "left", fontWeight: 600, color: "#495057", whiteSpace: "nowrap"
  },
  td: { border: "1px solid #dee2e6", padding: "8px 10px", color: "#333", verticalAlign: "middle" },
  badge: (color) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11,
    fontWeight: 600, background: color, color: "#fff"
  }),
  btn: (color = CRM_GREEN, outline = false) => ({
    background: outline ? "transparent" : color,
    color: outline ? color : "#fff",
    border: `1px solid ${color}`,
    borderRadius: 4, padding: "6px 14px", fontSize: 13, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 4
  }),
  btnSm: (color = BTN_TEAL) => ({
    background: color, color: "#fff", border: "none",
    borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer"
  }),
  toolbarRow: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap"
  },
  exportBtn: {
    background: "#6c757d", color: "#fff", border: "none", borderRadius: 4,
    padding: "5px 10px", fontSize: 12, cursor: "pointer", display: "inline-flex",
    alignItems: "center", gap: 3
  },
  searchInput: {
    border: "1px solid #ccc", borderRadius: 4, padding: "5px 10px", fontSize: 13,
    marginLeft: "auto"
  },
  modal: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex",
    alignItems: "center", justifyContent: "center"
  },
  modalBox: {
    background: "#fff", borderRadius: 8, padding: "24px", minWidth: 520,
    maxWidth: 720, width: "90%", maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
  },
  modalTitle: { fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#333" },
  formGroup: { marginBottom: 14 },
  statCard: {
    background: "#fff", borderRadius: 8, padding: "18px 20px", display: "flex",
    alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flex: 1, minWidth: 200
  },
  statIcon: (color) => ({
    width: 52, height: 52, borderRadius: "50%", background: color,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff"
  }),
};

function ExportButtons() {
  return (
    <>
      <button style={styles.exportBtn}>📄 Export CSV</button>
      <button style={styles.exportBtn}>📊 Export Excel</button>
      <button style={styles.exportBtn}>🖨️ Print</button>
      <button style={styles.exportBtn}>📋 Column visibility</button>
      <button style={styles.exportBtn}>📑 Export PDF ▾</button>
    </>
  );
}

function ShowEntries({ value = 25, onChange }) {
  return (
    <span style={{ fontSize: 13, color: "#555" }}>
      Show{" "}
      <select
        style={{ ...styles.select, minWidth: 60, padding: "3px 6px" }}
        value={value}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
      >
        {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
      </select>{" "}
      entries
    </span>
  );
}

function FilterToggle({ open, onToggle, children }) {
  return (
    <div style={styles.filterBar}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        onClick={onToggle}
      >
        <span style={{ color: CRM_GREEN }}>▼</span>
        <strong style={{ fontSize: 14 }}>Filters</strong>
        <span style={{ marginLeft: "auto" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={styles.formGroup}>
      <div style={styles.label}>{label}{required && <span style={{ color: "red" }}>*</span>}</div>
      {children}
    </div>
  );
}

function ModalFooter({ onClose, onSave, saveLabel = "Save" }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 14, borderTop: "1px solid #eee" }}>
      <button style={styles.btn("#6c757d")} onClick={onClose}>Close</button>
      <button style={styles.btn(CRM_GREEN)} onClick={onSave}>{saveLabel}</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CRM TOP NAV
───────────────────────────────────────────── */
function CRMNav() {
  const location = useLocation();
  const links = [
    { label: "CRM", path: "/crm" },
    { label: "Leads", path: "/crm/leads" },
    { label: "Follow ups", path: "/crm/follow-ups" },
    { label: "Campaigns", path: "/crm/campaigns" },
    { label: "Contacts Login", path: "/crm/contacts-login" },
    { label: "Reports", path: "/crm/reports" },
    { label: "Proposal template", path: "/crm/proposal-template" },
    { label: "Proposals", path: "/crm/proposals" },
    { label: "Sources", path: "/crm/sources" },
    { label: "Life Stage", path: "/crm/life-stage" },
    { label: "Followup Category", path: "/crm/followup-category" },
    { label: "Settings", path: "/crm/settings" },
  ];
  return (
    <div style={styles.topNav}>
      <span style={styles.topNavBrand}>
        <span>🤝</span> CRM
      </span>
      {links.map((l) => (
        <Link
          key={l.path}
          to={l.path}
          style={styles.topNavLink(location.pathname === l.path || (l.path !== "/crm" && location.pathname.startsWith(l.path)))}
        >
          {l.label}
          {l.label === "Contacts Login" && " ▾"}
        </Link>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */
function CRMDashboard() {
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        {/* Top stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={styles.statCard}>
            <div style={styles.statIcon(BTN_TEAL)}>📅</div>
            <div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase" }}>Today's Follow Ups</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>0</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon(BTN_TEAL)}>👤</div>
            <div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase" }}>My Leads</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>0</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon(BTN_TEAL)}>🔄</div>
            <div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase" }}>My Leads To Customer Conversion</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>0</div>
            </div>
          </div>
          <div style={{ ...styles.card, flex: 1, minWidth: 240, marginBottom: 0 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>My Follow ups</div>
            {[["Scheduled", 0], ["Open", 0], ["Cancelled", 0], ["Completed", 0]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 13 }}>{k}</span><span style={{ fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {[["👥", BTN_TEAL, "CUSTOMERS", 1], ["👤", BTN_TEAL, "LEADS", 22], ["🔍", "#f0a500", "SOURCES", 0], ["⚙️", "#f0a500", "LIFE STAGES", 0]].map(([icon, color, label, val]) => (
            <div key={label} style={{ ...styles.statCard, flex: "1 1 180px" }}>
              <div style={styles.statIcon(color)}>{icon}</div>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sources / Life Stages / Birthdays */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ ...styles.card, flex: 1, minWidth: 220 }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Sources</th><th style={styles.th}>Total</th><th style={styles.th}>Conversion</th></tr></thead>
              <tbody><tr><td style={styles.td} colSpan={3} align="center">No data</td></tr></tbody>
            </table>
          </div>
          <div style={{ ...styles.card, flex: 1, minWidth: 220 }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Life Stages</th><th style={styles.th}>Total</th></tr></thead>
              <tbody><tr><td style={styles.td} colSpan={2} align="center">No data</td></tr></tbody>
            </table>
          </div>
          <div style={{ ...styles.card, flex: 2, minWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontWeight: 600 }}>🎂 Birthdays</span>
              <button style={{ ...styles.btnSm("#28a745"), marginLeft: "auto" }}>✉ Send wishes</button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Today</div>
            <table style={styles.table}><thead><tr><th style={styles.th}>#</th><th style={styles.th}>Name</th></tr></thead>
              <tbody><tr><td style={styles.td} colSpan={2} align="center">No data</td></tr></tbody></table>
            <div style={{ fontSize: 12, fontWeight: 600, margin: "12px 0 6px" }}>Upcoming</div>
            <table style={styles.table}><thead><tr><th style={styles.th}>#</th><th style={styles.th}>Name</th><th style={styles.th}>Birthday on</th></tr></thead>
              <tbody><tr><td style={styles.td} colSpan={3} align="center">No data</td></tr></tbody></table>
          </div>
        </div>

        {/* Follow ups by user */}
        <div style={styles.card}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Follow ups by user</div>
          <div style={styles.filterRow}>
            <div><div style={styles.label}>Date Range:</div>
              <input style={{ ...styles.input, width: 200 }} defaultValue="01/01/2026 - 12/31/2026" /></div>
            <div><div style={styles.label}>Followup Category:*</div>
              <select style={styles.select}><option>All</option></select></div>
          </div>
          <div style={{ ...styles.toolbarRow, marginTop: 12 }}>
            <ShowEntries />
            <ExportButtons />
            <input style={styles.searchInput} placeholder="Search ..." />
          </div>
          <table style={styles.table}>
            <thead><tr>{["User", "Scheduled", "Open", "Cancelled", "Completed", "None", "Total follow ups"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {[["Er Sarath Raj", 9, 0, 0, 0, 44, 53], ["Mr Leejin", 1, 0, 0, 0, 0, 1]].map(([u, ...vals]) => (
                <tr key={u}><td style={styles.td}>{u}</td>{vals.map((v, i) => <td key={i} style={styles.td}>{v}<br /><a href="#" style={{ color: BTN_TEAL, fontSize: 11 }}>View</a></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leads to customer conversion */}
        <div style={{ ...styles.card, maxWidth: 500 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Leads to customer conversion</div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /></div>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Converted By</th><th style={styles.th}>Total</th></tr></thead>
            <tbody><tr><td style={styles.td} colSpan={2} align="center">No data available in table</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LEADS
───────────────────────────────────────────── */
const SAMPLE_LEADS = [
  { id: "CO0009", name: "Prime Grow Traders, Sampath Kumar", mobile: "6380204252", email: "", source: "", lastFollowup: "06/02/2026 09:19", lifeStage: "" },
  { id: "CO0010", name: "Westry INC, Santhosh Kumar Ramasamy", mobile: "9626733733", email: "", source: "", lastFollowup: "06/02/2026 09:18", lifeStage: "" },
  { id: "CO0011", name: "Sarath Chandran Ramakrishnan, Amr Mohamed Alshazly", mobile: "cant connect number", email: "", source: "", lastFollowup: "06/02/2026 09:17", lifeStage: "" },
  { id: "CO0012", name: "EXHICONNECT", mobile: "9904044745", email: "", source: "", lastFollowup: "06/02/2026 09:16", lifeStage: "" },
  { id: "CO0013", name: "Sanket Electrotech, Arvind Patel", mobile: "9687689988", email: "", source: "", lastFollowup: "06/02/2026 09:15", lifeStage: "" },
];

function LeadsPage() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({ type: "Lead", individual: true, name: "", mobile: "", email: "", source: "", lifeStage: "", assignedTo: "Ms Dharshiha C" });

  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Leads</h2>
        <FilterToggle open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)}>
          <div style={styles.filterRow}>
            <div><div style={styles.label}>Source:</div>
              <select style={styles.select}><option>All</option></select></div>
            <div><div style={styles.label}>Life Stage:</div>
              <select style={styles.select}><option>All</option></select></div>
            <div><div style={styles.label}>Assigned to:</div>
              <select style={styles.select}><option>All</option></select></div>
          </div>
        </FilterToggle>

        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <strong>All Leads</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.btn(view === "list" ? CRM_GREEN : "#6c757d")} onClick={() => setView("list")}>List View</button>
              <button style={styles.btn(view === "kanban" ? CRM_GREEN : "#6c757d")} onClick={() => setView("kanban")}>Kanban Board</button>
              <button style={styles.btn(CRM_GREEN)} onClick={() => setShowAdd(true)}>+ Add</button>
            </div>
          </div>
          <div style={styles.toolbarRow}>
            <ShowEntries />
            <ExportButtons />
            <input style={styles.searchInput} placeholder="Search ..." />
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Action", "Contact ID", "Name", "Mobile", "Email", "Source", "Last follow up", "Upcoming follow up", "Life Stage", "Assigned to"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_LEADS.map((l) => (
                  <tr key={l.id}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={styles.btnSm(BTN_TEAL)}>Action ▾</button>
                      </div>
                    </td>
                    <td style={styles.td}>{l.id}</td>
                    <td style={styles.td}>{l.name}</td>
                    <td style={styles.td}>{l.mobile}</td>
                    <td style={styles.td}>{l.email}</td>
                    <td style={styles.td}>{l.source}</td>
                    <td style={styles.td}>{l.lastFollowup} <span style={{ color: BTN_TEAL, cursor: "pointer" }}>✏️</span></td>
                    <td style={styles.td}><button style={styles.btnSm(CRM_GREEN)}>+ Add Follow Up</button></td>
                    <td style={styles.td}>{l.lifeStage}</td>
                    <td style={styles.td}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>Showing 1 to {SAMPLE_LEADS.length} of {SAMPLE_LEADS.length} entries</div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add a new contact" onClose={() => setShowAdd(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Contact type" required>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, marginRight: 6 }}>
                  <input type="radio" name="ctype" defaultChecked /> Individual &nbsp;
                  <input type="radio" name="ctype" /> Business
                </span>
              </div>
              <select style={{ ...styles.select, marginTop: 6, width: "100%" }}>
                <option>Lead</option><option>Customer</option>
              </select>
            </FormField>
            <FormField label="Contact ID">
              <input style={styles.input} placeholder="Contact ID" />
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>Leave empty to autogenerate</div>
            </FormField>
            <FormField label="Mobile" required>
              <input style={styles.input} placeholder="Mobile" />
            </FormField>
            <FormField label="Alternate contact number">
              <input style={styles.input} placeholder="Alternate contact number" />
            </FormField>
            <FormField label="Landline">
              <input style={styles.input} placeholder="Landline" />
            </FormField>
            <FormField label="Email">
              <input style={styles.input} placeholder="Email" />
            </FormField>
            <FormField label="Source">
              <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
            </FormField>
            <FormField label="Life Stage">
              <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
            </FormField>
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="Assigned to" required>
                <input style={styles.input} defaultValue="Ms Dharshiha C" />
              </FormField>
            </div>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button style={styles.btn(CRM_GREEN)}>More Informations ▾</button>
            <button style={styles.btn(BTN_TEAL)}>Add Contact Persons ▾</button>
          </div>
          <ModalFooter onClose={() => setShowAdd(false)} onSave={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOLLOW UPS
───────────────────────────────────────────── */
const SAMPLE_FOLLOWUPS = [
  { contact: "Dharshini Rubber Products, Karthik", start: "06/07/2026 09:54", end: "06/07/2026 16:55 (in 4 days)", status: "Scheduled", type: "Call", category: "call", assigned: "SA", desc: "", info: "", title: "contact on 1-6", addedBy: "Er Sarath Raj" },
  { contact: "SRI MADURA RUBBER, Manikandan", start: "06/04/2026 10:00", end: "06/04/2026 13:09 (in 21 hours)", status: "", type: "Call", category: "call", assigned: "SA", desc: "", info: "", title: "didnt pickup", addedBy: "Er Sarath Raj" },
];

function FollowUpsPage() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAdvModal, setShowAdvModal] = useState(false);
  const [tab, setTab] = useState("followups");

  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Follow ups</h2>
        <FilterToggle open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)}>
          <div style={styles.filterRow}>
            {[["Contact", "All"], ["Assigned to:", "All"], ["Status:", "All"]].map(([lbl, def]) => (
              <div key={lbl}><div style={styles.label}>{lbl}</div><select style={styles.select}><option>{def}</option></select></div>
            ))}
            <div><div style={styles.label}>Follow Up Type:</div><select style={styles.select}><option>All</option></select></div>
            <div><div style={styles.label}>Date Range:</div><input style={{ ...styles.input, width: 180 }} defaultValue="01/01/2026 - 12/31/2026" /></div>
            <div><div style={styles.label}>Follow up by:</div><select style={styles.select}><option>All</option></select></div>
            <div><div style={styles.label}>Followup Category:</div><select style={styles.select}><option>All</option></select></div>
          </div>
        </FilterToggle>

        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <strong>All Follow ups</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.btn(CRM_GREEN)} onClick={() => setShowAdd(true)}>+ Add</button>
              <button style={styles.btn("#28a745")} onClick={() => setShowAdvModal(true)}>+ Add advance follow up</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: "2px solid #e0e0e0" }}>
            {["Follow ups", "Recurring Follow up"].map((t) => (
              <button key={t} onClick={() => setTab(t.toLowerCase().replace(/ /g, ""))}
                style={{ background: "none", border: "none", padding: "8px 16px", cursor: "pointer", fontSize: 13,
                  borderBottom: tab === t.toLowerCase().replace(/ /g, "") ? `2px solid ${CRM_GREEN}` : "2px solid transparent",
                  color: tab === t.toLowerCase().replace(/ /g, "") ? CRM_GREEN : "#666", marginBottom: -2 }}>
                {t}
              </button>
            ))}
          </div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>{["Action", "Contact", "Start Datetime", "End Datetime", "Status", "Follow Up Type", "Followup Category", "Assigned to", "Description", "Additional info", "Title", "Added By"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {SAMPLE_FOLLOWUPS.map((f, i) => (
                  <tr key={i}>
                    <td style={styles.td}><button style={styles.btnSm(BTN_TEAL)}>Action ▾</button></td>
                    <td style={styles.td}>{f.contact} <span style={{ color: BTN_TEAL }}>✏️</span></td>
                    <td style={styles.td}>{f.start}</td>
                    <td style={styles.td}>{f.end}</td>
                    <td style={styles.td}>{f.status && <span style={styles.badge("#f0a500")}>{f.status}</span>}</td>
                    <td style={styles.td}>{f.type}</td>
                    <td style={styles.td}>{f.category}</td>
                    <td style={styles.td}><div style={{ ...styles.statIcon("#6c757d"), width: 28, height: 28, fontSize: 12, display: "inline-flex" }}>{f.assigned}</div></td>
                    <td style={styles.td}>{f.desc}</td>
                    <td style={styles.td}>{f.info}</td>
                    <td style={styles.td}>{f.title}</td>
                    <td style={styles.td}>{f.addedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Follow Up" onClose={() => setShowAdd(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="Title" required><input style={styles.input} /></FormField>
            </div>
            <FormField label="Customer/Lead" required>
              <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
            </FormField>
            <FormField label="Status">
              <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
            </FormField>
            <FormField label="Start Datetime" required>
              <input type="datetime-local" style={styles.input} />
            </FormField>
            <FormField label="End Datetime" required>
              <input type="datetime-local" style={styles.input} />
            </FormField>
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="Description">
                <textarea style={{ ...styles.input, height: 100, resize: "vertical" }} />
              </FormField>
            </div>
            <FormField label="Follow Up Type" required>
              <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
            </FormField>
            <FormField label="Followup Category" required>
              <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
            </FormField>
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="Assigned to" required>
                <input style={styles.input} />
              </FormField>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 13 }}><input type="checkbox" style={{ marginRight: 6 }} />Send Notification</label>
            </div>
          </div>
          <ModalFooter onClose={() => setShowAdd(false)} onSave={() => setShowAdd(false)} />
        </Modal>
      )}

      {showAdvModal && (
        <Modal title="Add advance follow up" onClose={() => setShowAdvModal(false)}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "20px 0" }}>
            <button style={styles.btn("#28a745")} onClick={() => { setShowAdvModal(false); setShowAdd(true); }}>+ Add one time follow up</button>
            <button style={styles.btn(BTN_TEAL)}>+ Add recurring follow up</button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button style={styles.btn("#6c757d")} onClick={() => setShowAdvModal(false)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CAMPAIGNS
───────────────────────────────────────────── */
function CampaignsPage() {
  const navigate = useNavigate();
  const campaigns = [
    { name: "shalijah", type: "Email", status: "Sent", createdBy: "Ms Shalijah Stalin Rajakumar", date: "05/26/2026" },
    { name: "Digital Marketing", type: "Email", status: "Sent", createdBy: "Ms Shalijah Stalin Rajakumar", date: "05/26/2026" },
  ];
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Campaigns</h2>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <strong>All Campaigns</strong>
            <button style={styles.btn(CRM_GREEN)} onClick={() => navigate("/crm/campaigns/create")}>+ Add</button>
          </div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr>{["Action", "Campaign Name", "Campaign Type", "Created By", "Created At"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.name}>
                  <td style={styles.td}><button style={styles.btnSm(BTN_TEAL)}>👁 View</button> <button style={styles.btnSm("#dc3545")}>🗑 Delete</button></td>
                  <td style={styles.td}>{c.name} <span style={styles.badge("#28a745")}>{c.status}</span></td>
                  <td style={styles.td}>{c.type}</td>
                  <td style={styles.td}>{c.createdBy}</td>
                  <td style={styles.td}>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>Showing 1 to 2 of 2 entries</div>
        </div>
      </div>
    </div>
  );
}

function CampaignCreate() {
  const navigate = useNavigate();
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Campaigns <span style={{ fontSize: 16, color: "#888" }}>Create</span></h2>
        <div style={styles.card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Campaign Name" required>
              <input style={styles.input} />
            </FormField>
            <FormField label="Campaign Type" required>
              <select style={{ ...styles.select, width: "100%" }}><option>Email</option></select>
            </FormField>
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="To" required>
                <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
              </FormField>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="Subject" required>
                <input style={styles.input} />
              </FormField>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="Email Body" required>
                <textarea style={{ ...styles.input, height: 180, resize: "vertical" }} />
              </FormField>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={styles.label}>Available Tags:</div>
            <div style={{ fontSize: 13, color: "#666" }}>{"{contact_name}"}, {"{campaign_name}"}, {"{business_name}"}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button style={styles.btn(CRM_GREEN)} onClick={() => navigate("/crm/campaigns")}>✉ Send Notification</button>
            <button style={styles.btn("#6c757d")}>📝 Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTACTS LOGIN
───────────────────────────────────────────── */
function ContactsLoginPage() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Contacts Login</h2>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <strong>All Contacts Login</strong>
            <button style={styles.btn(CRM_GREEN)} onClick={() => setShowAdd(true)}>+ Add</button>
          </div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr>{["Action", "Contact", "Username", "Name", "Email", "Department", "Designation"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody><tr><td style={styles.td} colSpan={7} align="center">No data available in table</td></tr></tbody>
          </table>
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>Showing 0 to 0 of 0 entries</div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Login" onClose={() => setShowAdd(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <FormField label="Prefix"><input style={styles.input} placeholder="Mr / M" /></FormField>
            <FormField label="First Name" required><input style={styles.input} placeholder="First Name" /></FormField>
            <FormField label="Last Name"><input style={styles.input} placeholder="Last Name" /></FormField>
            <FormField label="Contact" required>
              <select style={{ ...styles.select, width: "100%" }}><option>Please Select</option></select>
            </FormField>
            <FormField label="Email" required><input style={styles.input} placeholder="Email" /></FormField>
            <FormField label="Mobile Number"><input style={styles.input} placeholder="Mobile Number" /></FormField>
            <FormField label="Alternate contact number"><input style={styles.input} /></FormField>
            <FormField label="Family contact number"><input style={styles.input} /></FormField>
            <FormField label="Department"><input style={styles.input} placeholder="Department" /></FormField>
            <FormField label="Designation"><input style={styles.input} placeholder="Designation" /></FormField>
            <FormField label="Sales Commission Percentage (%)"><input style={styles.input} /></FormField>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 13 }}><input type="checkbox" defaultChecked style={{ marginRight: 6 }} />Is active?</label><br />
              <label style={{ fontSize: 13, marginTop: 8, display: "block" }}><input type="checkbox" style={{ marginRight: 6 }} />Allow login</label>
            </div>
          </div>
          <ModalFooter onClose={() => setShowAdd(false)} onSave={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMMISSIONS (sub of Contacts Login)
───────────────────────────────────────────── */
function CommissionsPage() {
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Commissions</h2>
        <div style={styles.card}>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr>{["Date", "Contact", "Name", "Mobile Number", "Invoice No.", "Location", "Total commission"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody><tr><td style={styles.td} colSpan={7} align="center">No data available in table</td></tr></tbody>
          </table>
          <div style={{ background: "#f8f9fa", padding: "8px 10px", display: "flex", justifyContent: "space-between", fontWeight: 600, marginTop: 4 }}>
            <span>Total:</span><span>₹ 0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REPORTS
───────────────────────────────────────────── */
function CRMReportsPage() {
  const contacts = [
    ["Mr Sanjeev Sharma", 1, 0, 0, 0, 0, 1],
    ["NPE MAGNETICS INDIA PVT LTD", 1, 0, 0, 0, 1, 2],
    ["SATHISH KUMAR G", 1, 0, 0, 0, 0, 1],
  ];
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Reports</h2>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Follow ups by user</div>
          <div style={{ marginBottom: 12 }}>
            <div style={styles.label}>Date Range:</div>
            <input style={{ ...styles.input, width: 200 }} defaultValue="01/01/2026 - 12/31/2026" />
          </div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr>{["User", "Scheduled", "Open", "Cancelled", "Completed", "Others", "Total follow ups"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {[["Er Sarath Raj", 9, 0, 0, 0, 44, 53], ["Mr Leejin", 1, 0, 0, 0, 0, 1]].map(([u, ...vals]) => (
                <tr key={u}><td style={styles.td}>{u}</td>{vals.map((v, i) => <td key={i} style={styles.td}>{v}<br /><a href="#" style={{ color: BTN_TEAL, fontSize: 11 }}>View</a></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Follow ups by contacts</div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr>{["Contact", "Scheduled", "Open", "Cancelled", "Completed", "Others", "Total follow ups"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {contacts.map(([c, ...vals]) => (
                <tr key={c}><td style={styles.td}>{c}</td>{vals.map((v, i) => <td key={i} style={styles.td}>{v}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROPOSAL TEMPLATE
───────────────────────────────────────────── */
function ProposalTemplatePage() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Proposal template</h2>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button style={styles.btn(CRM_GREEN)} onClick={() => setShowAdd(true)}>+ Add</button>
          </div>
          <div style={{ background: "#17a2b8", color: "#fff", borderRadius: 6, padding: "14px 18px", fontWeight: 600, fontSize: 15 }}>
            No proposal template found!
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Proposal template Create" onClose={() => setShowAdd(false)}>
          <FormField label="CC"><input style={styles.input} placeholder="Comma separated values of emails" /></FormField>
          <FormField label="BCC"><input style={styles.input} placeholder="Comma separated values of emails" /></FormField>
          <FormField label="Subject" required><input style={styles.input} /></FormField>
          <FormField label="Email Body" required>
            <textarea style={{ ...styles.input, height: 140, resize: "vertical" }} />
          </FormField>
          <FormField label="Attachments">
            <div style={{ border: "2px dashed #ccc", borderRadius: 6, padding: "16px", textAlign: "center", fontSize: 13, color: "#888" }}>
              <input type="file" style={{ display: "block", margin: "0 auto" }} />
              <div style={{ marginTop: 6 }}>Max File size: 5MB | Allowed: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</div>
            </div>
          </FormField>
          <ModalFooter onClose={() => setShowAdd(false)} onSave={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROPOSALS
───────────────────────────────────────────── */
function ProposalsPage() {
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Proposals</h2>
        <div style={styles.card}>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr>{["Contact", "Subject", "Sent by", "Date", "Action"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody><tr><td style={styles.td} colSpan={5} align="center">No data available in table</td></tr></tbody>
          </table>
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>Showing 0 to 0 of 0 entries</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SOURCES
───────────────────────────────────────────── */
function SourcesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ source: "", desc: "" });

  const save = () => {
    if (form.source) { setRows([...rows, { ...form }]); setForm({ source: "", desc: "" }); setShowAdd(false); }
  };

  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Sources <span style={{ fontSize: 13, color: "#888" }}>Manage Source ℹ️</span></h2>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button style={styles.btn(CRM_GREEN)} onClick={() => setShowAdd(true)}>+ Add</button>
          </div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Source</th><th style={styles.th}>Description</th><th style={styles.th}>Action</th></tr></thead>
            <tbody>
              {rows.length === 0
                ? <tr><td style={styles.td} colSpan={3} align="center">No data available in table</td></tr>
                : rows.map((r, i) => <tr key={i}><td style={styles.td}>{r.source}</td><td style={styles.td}>{r.desc}</td><td style={styles.td}><button style={styles.btnSm(BTN_TEAL)}>✏️ Edit</button> <button style={styles.btnSm("#dc3545")}>🗑 Delete</button></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Source" onClose={() => setShowAdd(false)}>
          <FormField label="Source" required>
            <input style={styles.input} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <textarea style={{ ...styles.input, height: 80 }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          </FormField>
          <ModalFooter onClose={() => setShowAdd(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIFE STAGE
───────────────────────────────────────────── */
function LifeStagePage() {
  const [showAdd, setShowAdd] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ lifeStage: "", desc: "" });

  const save = () => {
    if (form.lifeStage) { setRows([...rows, { ...form }]); setForm({ lifeStage: "", desc: "" }); setShowAdd(false); }
  };

  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Life Stage <span style={{ fontSize: 13, color: "#888" }}>Manage Life Stage ℹ️</span></h2>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button style={styles.btn(CRM_GREEN)} onClick={() => setShowAdd(true)}>+ Add</button>
          </div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Life Stage</th><th style={styles.th}>Description</th><th style={styles.th}>Action</th></tr></thead>
            <tbody>
              {rows.length === 0
                ? <tr><td style={styles.td} colSpan={3} align="center">No data available in table</td></tr>
                : rows.map((r, i) => <tr key={i}><td style={styles.td}>{r.lifeStage}</td><td style={styles.td}>{r.desc}</td><td style={styles.td}><button style={styles.btnSm(BTN_TEAL)}>✏️ Edit</button> <button style={styles.btnSm("#dc3545")}>🗑 Delete</button></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Life Stage" onClose={() => setShowAdd(false)}>
          <FormField label="Life Stage" required>
            <input style={styles.input} value={form.lifeStage} onChange={e => setForm({ ...form, lifeStage: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <textarea style={{ ...styles.input, height: 80 }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          </FormField>
          <ModalFooter onClose={() => setShowAdd(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOLLOWUP CATEGORY
───────────────────────────────────────────── */
function FollowupCategoryPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [rows, setRows] = useState([{ cat: "call", desc: "call" }, { cat: "email", desc: "" }]);
  const [form, setForm] = useState({ cat: "", desc: "" });

  const save = () => {
    if (form.cat) { setRows([...rows, { ...form }]); setForm({ cat: "", desc: "" }); setShowAdd(false); }
  };

  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Followup Category <span style={{ fontSize: 13, color: "#888" }}>Manage Followup Category</span></h2>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button style={styles.btn(CRM_GREEN)} onClick={() => setShowAdd(true)}>+ Add</button>
          </div>
          <div style={styles.toolbarRow}><ShowEntries /><ExportButtons /><input style={styles.searchInput} placeholder="Search ..." /></div>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Followup Category</th><th style={styles.th}>Description</th><th style={styles.th}>Action</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}>{r.cat}</td>
                  <td style={styles.td}>{r.desc}</td>
                  <td style={styles.td}><button style={styles.btnSm(BTN_TEAL)}>✏️ Edit</button> <button style={styles.btnSm("#dc3545")}>🗑 Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8, fontSize: 13 }}>Showing 1 to {rows.length} of {rows.length} entries</div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Followup Category" onClose={() => setShowAdd(false)}>
          <FormField label="Followup Category" required>
            <input style={styles.input} value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <textarea style={{ ...styles.input, height: 80 }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          </FormField>
          <ModalFooter onClose={() => setShowAdd(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────── */
function CRMSettings() {
  const [enabled, setEnabled] = useState(false);
  const [prefix, setPrefix] = useState("");
  return (
    <div style={styles.page}>
      <CRMNav />
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Settings</h2>
        <div style={styles.card}>
          <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
            <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
              Enable Order Request ℹ️
            </label>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FormField label="Order Request Prefix:">
                <input style={styles.input} placeholder="Order Request Prefix" value={prefix} onChange={e => setPrefix(e.target.value)} />
              </FormField>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button style={styles.btn(BTN_TEAL)}>Update</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROUTES EXPORT
───────────────────────────────────────────── */
export function CRMRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CRMDashboard />} />
      <Route path="/leads" element={<LeadsPage />} />
      <Route path="/follow-ups" element={<FollowUpsPage />} />
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/campaigns/create" element={<CampaignCreate />} />
      <Route path="/contacts-login" element={<ContactsLoginPage />} />
      <Route path="/commissions" element={<CommissionsPage />} />
      <Route path="/reports" element={<CRMReportsPage />} />
      <Route path="/proposal-template" element={<ProposalTemplatePage />} />
      <Route path="/proposals" element={<ProposalsPage />} />
      <Route path="/sources" element={<SourcesPage />} />
      <Route path="/life-stage" element={<LifeStagePage />} />
      <Route path="/followup-category" element={<FollowupCategoryPage />} />
      <Route path="/settings" element={<CRMSettings />} />
    </Routes>
  );
}
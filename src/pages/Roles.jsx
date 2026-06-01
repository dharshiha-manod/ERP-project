import { useState } from "react";

const PERMISSIONS = [
  {
    group: "Others",
    items: [
      "View export to buttons (csv/excel/print/pdf) on tables",
      "Payment Received",
      "Payment Reminder",
    ],
  },
  {
    group: "User",
    items: ["View user", "Add user", "Edit user", "Delete user"],
  },
  {
    group: "Roles",
    items: ["View role", "Add Role", "Edit Role", "Delete role"],
  },
  {
    group: "Supplier",
    items: [
      "View all supplier",
      "View own supplier",
      "Add supplier",
      "Edit supplier",
      "Delete supplier",
    ],
  },
  {
    group: "Customer",
    items: [
      "View all customer",
      "View own customer",
      "View customers with no sell from one month only",
      "View customers with no sell from three months only",
      "View customers with no sell from six months only",
      "View customers with no sell from one year only",
      "View customers irrespective of their sell",
      "Add customer",
      "Edit customer",
      "Delete customer",
    ],
  },
  {
    group: "Product",
    items: [
      "View product",
      "Add product",
      "Edit product",
      "Delete product",
      "Add Opening Stock",
      "View Purchase Price",
    ],
  },
  {
    group: "Purchase",
    items: [
      "View all Purchase",
      "View own Purchase",
      "Add purchase",
      "Edit purchase",
      "Delete purchase",
      "Add purchase payment",
      "Edit purchase payment",
      "Delete purchase payment",
      "Update Status",
    ],
  },
  {
    group: "Stock Adjustment",
    items: [
      "View all stock adjustment",
      "View own stock adjustment",
      "Add stock adjustment",
      "Edit stock adjustment",
      "Delete stock adjustment",
    ],
  },
  {
    group: "Stock Transfer",
    items: [
      "View all stock transfer",
      "View own stock transfer",
      "Add stock transfer",
      "Edit stock transfer",
      "Delete stock transfer",
    ],
  },
  {
    group: "POS",
    items: [
      "View POS sell",
      "Add POS sell",
      "Edit POS sell",
      "Delete POS sell",
      "Edit product price from POS screen",
      "Edit product discount from POS screen",
      "Add/Edit Payment",
      "Print Invoice",
      "Disable Multiple Pay",
      "Disable Draft",
      "Disable Express Checkout",
      "Disable Discount",
      "Disable Suspend Sale",
      "Disable credit sale button",
      "Disable Quotation",
      "Disable Card",
    ],
  },
  {
    group: "Sell",
    items: [
      "View all sell",
      "View own sell only",
      "View paid sells only",
      "View due sells only",
      "View partially paid sells only",
      "View overdue sells only",
      "Add Sell",
      "Update Sell",
      "Delete Sell",
      "Commission agent can view their own sell",
      "Add sell payment",
      "Edit sell payment",
      "Delete sell payment",
      "Edit product price from sales screen",
      "Edit product discount from Sale screen",
      "Add/Edit/Delete Discount",
      "Access all sell return",
      "Access own sell return",
      "Add edit invoice number",
    ],
  },
  {
    group: "Draft",
    items: [
      "View all drafts",
      "View own drafts",
      "Edit draft",
      "Delete draft",
    ],
  },
  {
    group: "Quotation",
    items: [
      "View all quotations",
      "View own quotations",
      "Edit quotation",
      "Delete quotation",
    ],
  },
  {
    group: "Shipments",
    items: [
      "Access all shipments",
      "Access own shipments",
      "Access pending shipments only",
      "Commission agent can access their own shipments",
    ],
  },
  {
    group: "Cash Register",
    items: ["View cash register", "Close cash register"],
  },
  {
    group: "Brand",
    items: ["View brand", "Add brand", "Edit brand", "Delete brand"],
  },
  {
    group: "Tax rate",
    items: [
      "View tax rate",
      "Add tax rate",
      "Edit tax rate",
      "Delete tax rate",
    ],
  },
  {
    group: "Unit",
    items: ["View unit", "Add unit", "Edit unit", "Delete unit"],
  },
  {
    group: "Category",
    items: [
      "View category",
      "Add category",
      "Edit category",
      "Delete category",
    ],
  },
  {
    group: "Report",
    items: [
      "View purchase & sell report",
      "View Tax report",
      "View Supplier & Customer report",
      "View expense report",
      "View profit/loss report",
      "View stock report, stock adjustment report & stock expiry report",
      "View trending product report",
      "View register report",
      "View sales representative report",
      "View product stock value",
    ],
  },
  {
    group: "Settings",
    items: [
      "Access business settings",
      "Access barcode settings",
      "Access invoice settings",
      "Access printers",
    ],
  },
  {
    group: "Expense",
    items: [
      "Access all expenses",
      "View own expense only",
      "Add Expense",
      "Edit Expense",
      "Delete Expense",
    ],
  },
  {
    group: "Home",
    items: ["View Home data"],
  },
  {
    group: "Account",
    items: [
      "Access Accounts",
      "Edit account transaction",
      "Delete account transaction",
    ],
  },
  {
    group: "Access selling price groups",
    items: ["Default Selling Price"],
  },
  {
    group: "Crm",
    items: [
      "Access all follow up",
      "Access own follow up",
      "Access all leads",
      "Access own leads",
      "Access all campaigns",
      "Access own campaigns",
      "Access contact login",
      "Access sources",
      "Access life stage",
      "Access proposal",
    ],
  },
  {
    group: "Essentials",
    items: [
      "Add/Edit/View/Delete leave type",
      "Add/Edit/View/Delete all leave",
      "Add/View own leave",
      "Approve Leave",
      "Add/Edit/View/Delete all attendance",
      "View own attendance",
      "Allow users to enter their own attendance from web",
      "Allow users to enter their own attendance from api",
      "View Pay Component",
      "Add Pay Component",
      "Add/Edit/View/Delete department",
      "Add/Edit/View/Delete designation",
      "View all Payroll",
      "Add Payroll",
      "Edit Payroll",
      "Delete Payroll",
      "Assign To Do's to others",
      "Add To Do's",
      "Edit To Do's",
      "Delete To Do's",
      "Create Message",
      "View Message",
      "Access Sales Targets",
      "Edit Knowledge Base",
      "Delete Knowledge Base",
    ],
  },
  {
    group: "Manufacturing",
    items: [
      "View Recipe",
      "Add Recipe",
      "Edit Recipe",
      "Access Production",
    ],
  },
];

const initialRoles = [
  { id: 1, name: "Admin", deletable: false },
  { id: 2, name: "Cashier", deletable: true },
];

// ─── Add Role Page ───────────────────────────────────────────────
function AddRolePage({ onBack }) {
  const [roleName, setRoleName] = useState("");
  const [perms, setPerms] = useState({});

  const isChecked = (group, item) => !!perms[`${group}::${item}`];
  const isGroupAll = (group) =>
    PERMISSIONS.find((g) => g.group === group).items.every((i) =>
      isChecked(group, i)
    );

  const toggleItem = (group, item) => {
    const key = `${group}::${item}`;
    setPerms((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleGroup = (group) => {
    const all = isGroupAll(group);
    const items = PERMISSIONS.find((g) => g.group === group).items;
    setPerms((p) => {
      const next = { ...p };
      items.forEach((i) => (next[`${group}::${i}`] = !all));
      return next;
    });
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      alert("Role Name is required");
      return;
    }
    alert(`Role "${roleName}" saved!`);
    onBack();
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add Role</h1>
        </div>
        <button onClick={onBack} style={styles.backBtn}>
          ← Back to Roles
        </button>
      </div>

      <div style={styles.card}>
        {/* Role Name */}
        <div style={styles.fieldRow}>
          <label style={styles.label}>
            Role Name: <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <input
            style={styles.input}
            placeholder="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        {/* Permissions */}
        <div style={{ marginTop: 24 }}>
          <label style={styles.label}>Permissions:</label>
          <div style={styles.permGrid}>
            {PERMISSIONS.map(({ group, items }) => (
              <div key={group} style={styles.permGroup}>
                <div style={styles.permGroupHeader}>
                  <strong style={styles.permGroupTitle}>{group}</strong>
                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={isGroupAll(group)}
                      onChange={() => toggleGroup(group)}
                      style={styles.checkbox}
                    />
                    Select all
                  </label>
                </div>
                {items.map((item) => (
                  <label key={item} style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={isChecked(group, item)}
                      onChange={() => toggleItem(group, item)}
                      style={styles.checkbox}
                    />
                    {item}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.formActions}>
          <button onClick={handleSave} style={styles.saveBtn}>
            Save
          </button>
          <button onClick={onBack} style={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>

      <div style={styles.footer}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </div>
    </div>
  );
}

// ─── Roles List Page ─────────────────────────────────────────────
export default function Roles() {
  const [view, setView] = useState("list"); // "list" | "add"
  const [roles, setRoles] = useState(initialRoles);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState("25");

  if (view === "add") return <AddRolePage onBack={() => setView("list")} />;

  const filtered = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Delete this role?"))
      setRoles((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Roles</h1>
          <span style={styles.subtitle}>Manage roles</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableToolbar}>
          <h3 style={styles.tableTitle}>All roles</h3>
          <button onClick={() => setView("add")} style={styles.addBtn}>
            + Add
          </button>
        </div>

        <div style={styles.tableControls}>
          <div style={styles.showEntries}>
            Show&nbsp;
            <select
              value={show}
              onChange={(e) => setShow(e.target.value)}
              style={styles.select}
            >
              {["10", "25", "50", "100"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            &nbsp;entries
          </div>
          <input
            placeholder="Search ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Roles</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((role) => (
              <tr key={role.id} className="table-row">
                <td style={styles.td}>{role.name}</td>
                <td style={styles.td}>
                  {role.deletable && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={styles.editBtn}
                        onClick={() => alert(`Edit "${role.name}"`)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(role.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.tableFooter}>
          <span>
            Showing 1 to {filtered.length} of {filtered.length} entries
          </span>
          <div style={styles.pagination}>
            <button style={styles.pageBtn}>Previous</button>
            <button style={{ ...styles.pageBtn, ...styles.pageBtnActive }}>
              1
            </button>
            <button style={styles.pageBtn}>Next</button>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f0f4f1",
    minHeight: "100vh",
    padding: "0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1a202c",
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: "#718096",
  },
  backBtn: {
    background: "#fff",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 13,
    color: "#4a5568",
    fontWeight: 500,
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    marginBottom: 20,
  },
  tableToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
    color: "#2d3748",
  },
  addBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tableControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  showEntries: {
    fontSize: 13,
    color: "#4a5568",
    display: "flex",
    alignItems: "center",
  },
  select: {
    border: "1px solid #cbd5e0",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: 13,
  },
  searchInput: {
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 13,
    width: 200,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "#f7fafc",
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
    color: "#4a5568",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "12px 14px",
    fontSize: 14,
    color: "#2d3748",
    borderBottom: "1px solid #f0f4f1",
  },
  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    fontSize: 13,
    color: "#718096",
    flexWrap: "wrap",
    gap: 10,
  },
  pagination: {
    display: "flex",
    gap: 4,
  },
  pageBtn: {
    border: "1px solid #cbd5e0",
    background: "#fff",
    borderRadius: 4,
    padding: "5px 12px",
    cursor: "pointer",
    fontSize: 13,
    color: "#4a5568",
  },
  pageBtnActive: {
    background: "#4f46e5",
    color: "#fff",
    border: "1px solid #4f46e5",
  },
  editBtn: {
    background: "#fff",
    border: "1px solid #a0aec0",
    borderRadius: 5,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    color: "#4a5568",
    fontWeight: 500,
  },
  deleteBtn: {
    background: "#fff",
    border: "1px solid #fc8181",
    borderRadius: 5,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    color: "#e53e3e",
    fontWeight: 500,
  },
  // Add Role form styles
  fieldRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxWidth: 400,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#2d3748",
  },
  input: {
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  },
  permGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20,
    marginTop: 12,
  },
  permGroup: {
    background: "#f7fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  permGroupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingBottom: 8,
    borderBottom: "1px solid #e2e8f0",
  },
  permGroupTitle: {
    fontSize: 13,
    color: "#2d3748",
  },
  checkLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 13,
    color: "#4a5568",
    cursor: "pointer",
    lineHeight: 1.4,
  },
  checkbox: {
    marginTop: 2,
    accentColor: "#4f46e5",
    flexShrink: 0,
  },
  formActions: {
    display: "flex",
    gap: 12,
    marginTop: 32,
    paddingTop: 20,
    borderTop: "1px solid #e2e8f0",
  },
  saveBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 28px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#fff",
    color: "#4a5568",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    padding: "10px 24px",
    fontSize: 14,
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#a0aec0",
    padding: "16px 0",
  },
};

const css = `
  .table-row:hover td { background: #f7fafc; }
  input:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
`;
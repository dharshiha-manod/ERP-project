/**
 * ============================================================
 * pages/Roles.jsx  (FIXED)
 *
 * Fixes:
 * 1. PAGINATION — was slicing filtered.slice(0, 25) always.
 *    Now tracks currentPage and shows the correct slice.
 * 2. Next/Previous buttons actually work.
 * 3. Page number buttons render for all pages.
 * ============================================================
 */

import { useState, useEffect, useRef } from "react";
import CreatableSelect from "react-select/creatable";

const API_BASE = "http://localhost:5000/api";

const DEFAULT_PERMISSIONS = [
  { group: "Others",          items: ["View export to buttons (csv/excel/print/pdf) on tables","Payment Received","Payment Reminder"] },
  { group: "User",            items: ["View user","Add user","Edit user","Delete user"] },
  { group: "Roles",           items: ["View role","Add Role","Edit Role","Delete role"] },
  { group: "Supplier",        items: ["View all supplier","View own supplier","Add supplier","Edit supplier","Delete supplier"] },
  { group: "Customer",        items: ["View all customer","View own customer","View customers with no sell from one month only","View customers with no sell from three months only","View customers with no sell from six months only","View customers with no sell from one year only","View customers irrespective of their sell","Add customer","Edit customer","Delete customer"] },
  { group: "Product",         items: ["View product","Add product","Edit product","Delete product","Add Opening Stock","View Purchase Price"] },
  { group: "Purchase",        items: ["View all Purchase","View own Purchase","Add purchase","Edit purchase","Delete purchase","Add purchase payment","Edit purchase payment","Delete purchase payment","Update Status"] },
  { group: "Stock Adjustment",items: ["View all stock adjustment","View own stock adjustment","Add stock adjustment","Edit stock adjustment","Delete stock adjustment"] },
  { group: "Stock Transfer",  items: ["View all stock transfer","View own stock transfer","Add stock transfer","Edit stock transfer","Delete stock transfer"] },
  { group: "POS",             items: ["View POS sell","Add POS sell","Edit POS sell","Delete POS sell","Edit product price from POS screen","Edit product discount from POS screen","Add/Edit Payment","Print Invoice","Disable Multiple Pay","Disable Draft","Disable Express Checkout","Disable Discount","Disable Suspend Sale","Disable credit sale button","Disable Quotation","Disable Card"] },
  { group: "Sell",            items: ["View all sell","View own sell only","View paid sells only","View due sells only","View partially paid sells only","View overdue sells only","Add Sell","Update Sell","Delete Sell","Commission agent can view their own sell","Add sell payment","Edit sell payment","Delete sell payment","Edit product price from sales screen","Edit product discount from Sale screen","Add/Edit/Delete Discount","Access all sell return","Access own sell return","Add edit invoice number"] },
  { group: "Draft",           items: ["View all drafts","View own drafts","Edit draft","Delete draft"] },
  { group: "Quotation",       items: ["View all quotations","View own quotations","Edit quotation","Delete quotation"] },
  { group: "Shipments",       items: ["Access all shipments","Access own shipments","Access pending shipments only","Commission agent can access their own shipments"] },
  { group: "Cash Register",   items: ["View cash register","Close cash register"] },
  { group: "Brand",           items: ["View brand","Add brand","Edit brand","Delete brand"] },
  { group: "Tax rate",        items: ["View tax rate","Add tax rate","Edit tax rate","Delete tax rate"] },
  { group: "Unit",            items: ["View unit","Add unit","Edit unit","Delete unit"] },
  { group: "Category",        items: ["View category","Add category","Edit category","Delete category"] },
  { group: "Report",          items: ["View purchase & sell report","View Tax report","View Supplier & Customer report","View expense report","View profit/loss report","View stock report, stock adjustment report & stock expiry report","View trending product report","View register report","View sales representative report","View product stock value"] },
  { group: "Settings",        items: ["Access business settings","Access barcode settings","Access invoice settings","Access printers"] },
  { group: "Expense",         items: ["Access all expenses","View own expense only","Add Expense","Edit Expense","Delete Expense"] },
  { group: "Home",            items: ["View Home data"] },
  { group: "Account",         items: ["Access Accounts","Edit account transaction","Delete account transaction"] },
  { group: "Access selling price groups", items: ["Default Selling Price"] },
  { group: "Crm",             items: ["Access all follow up","Access own follow up","Access all leads","Access own leads","Access all campaigns","Access own campaigns","Access contact login","Access sources","Access life stage","Access proposal"] },
  { group: "Essentials",      items: ["Add/Edit/View/Delete leave type","Add/Edit/View/Delete all leave","Add/View own leave","Approve Leave","Add/Edit/View/Delete all attendance","View own attendance","Allow users to enter their own attendance from web","Allow users to enter their own attendance from api","View Pay Component","Add Pay Component","Add/Edit/View/Delete department","Add/Edit/View/Delete designation","View all Payroll","Add Payroll","Edit Payroll","Delete Payroll","Assign To Do's to others","Add To Do's","Edit To Do's","Delete To Do's","Create Message","View Message","Access Sales Targets","Edit Knowledge Base","Delete Knowledge Base"] },
  { group: "Manufacturing",   items: ["View Recipe","Add Recipe","Edit Recipe","Access Production"] },
];

function exportCSV(roles) {
  const rows = [["ID","Role Name","Deletable"],...roles.map(r=>[r.id,r.name,r.deletable?"Yes":"No"])];
  const blob = new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="roles.csv";a.click();
}
function exportExcel(roles) {
  const html=`<table><tr><th>ID</th><th>Name</th><th>Deletable</th></tr>${roles.map(r=>`<tr><td>${r.id}</td><td>${r.name}</td><td>${r.deletable?"Yes":"No"}</td></tr>`).join("")}</table>`;
  const blob=new Blob([html],{type:"application/vnd.ms-excel"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="roles.xls";a.click();
}
function exportPDF(roles) {
  const win=window.open("","_blank");
  win.document.write(`<html><body><h2>Roles</h2><table border="1" cellpadding="6">${roles.map(r=>`<tr><td>${r.id}</td><td>${r.name}</td><td>${r.deletable?"Yes":"No"}</td></tr>`).join("")}</table></body></html>`);
  win.document.close();win.print();
}

/* ── Role Form ─────────────────────────────────────────────── */
function RoleFormPage({ onBack, onSave, editRole, allRoles, permissionGroups }) {
  const isEdit = !!editRole;
  const [selectedRole, setSelectedRole] = useState(
    isEdit ? { value: editRole.name, label: editRole.name } : null
  );
  const [perms,   setPerms]   = useState({});
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const roleOptions = allRoles.map((r) => ({ value: r.name, label: r.name }));

  useEffect(() => {
    if (isEdit && editRole.id) {
      setLoading(true);
      const token = localStorage.getItem("manod_token");
      fetch(`${API_BASE}/roles/${editRole.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data.permissions) {
            const p = {};
            data.data.permissions.forEach((key) => (p[key] = true));
            setPerms(p);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isEdit, editRole]);

  const isChecked  = (group, item) => !!perms[`${group}::${item}`];
  const isGroupAll = (group) =>
    permissionGroups.find((g) => g.group === group)?.items.every((i) => isChecked(group, i));

  const toggleItem  = (group, item) => {
    const key = `${group}::${item}`;
    setPerms((p) => ({ ...p, [key]: !p[key] }));
  };
  const toggleGroup = (group) => {
    const all   = isGroupAll(group);
    const items = permissionGroups.find((g) => g.group === group)?.items || [];
    setPerms((p) => {
      const next = { ...p };
      items.forEach((i) => (next[`${group}::${i}`] = !all));
      return next;
    });
  };

  const handleSave = async () => {
    setError("");
    if (!selectedRole?.value?.trim()) { setError("Role name is required"); return; }
    const permKeys = Object.keys(perms).filter((k) => perms[k]);
    setSaving(true);
    try { await onSave({ name: selectedRole.value.trim(), permissions: permKeys }); }
    catch (err) { setError(err.message || "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={styles.loading}>⏳ Loading permissions...</div>;

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{isEdit ? "Edit Role" : "Add Role"}</h1>
          <span style={styles.subtitle}>{isEdit ? `Editing: ${editRole.name}` : "Create a new role"}</span>
        </div>
        <button onClick={onBack} style={styles.backBtn}>← Back to Roles</button>
      </div>

      <div style={styles.card}>
        <div style={{ ...styles.fieldRow, maxWidth: 420 }}>
          <label style={styles.label}>Role Name: <span style={{ color:"#e53e3e" }}>*</span></label>
          <CreatableSelect
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            isClearable
            placeholder="Select existing or type new role..."
            formatCreateLabel={(input) => `✨ Create new role: "${input}"`}
            styles={selectStyles}
          />
          <span style={{ fontSize:11,color:"#718096" }}>💡 Select an existing role or type a new name</span>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={{ marginTop:24 }}>
          <label style={styles.label}>Permissions:</label>
          <div style={styles.permGrid}>
            {permissionGroups.map(({ group, items }) => (
              <div key={group} style={styles.permGroup}>
                <div style={styles.permGroupHeader}>
                  <strong style={styles.permGroupTitle}>{group}</strong>
                  <label style={styles.checkLabel}>
                    <input type="checkbox" checked={!!isGroupAll(group)} onChange={() => toggleGroup(group)} style={styles.checkbox} />
                    Select all
                  </label>
                </div>
                {items.map((item) => (
                  <label key={item} style={styles.checkLabel}>
                    <input type="checkbox" checked={isChecked(group,item)} onChange={() => toggleItem(group,item)} style={styles.checkbox} />
                    {item}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.formActions}>
          <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving ? "⏳ Saving..." : isEdit ? "💾 Update" : "💾 Save"}
          </button>
          <button onClick={onBack} style={styles.cancelBtn} disabled={saving}>Cancel</button>
        </div>
      </div>
      <div style={styles.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

/* ── Main Roles List ───────────────────────────────────────── */
export default function Roles() {
  const [view,        setView]        = useState("list");
  const [roles,       setRoles]       = useState([]);
  const [editRole,    setEditRole]    = useState(null);
  const [permGroups,  setPermGroups]  = useState(DEFAULT_PERMISSIONS);
  const [search,      setSearch]      = useState("");
  const [show,        setShow]        = useState(25);   // ← number not string
  const [currentPage, setCurrentPage] = useState(1);   // ← FIXED: track page
  const [colVisible,  setColVisible]  = useState({ Roles:true, Action:true });
  const [showColMenu, setShowColMenu] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast,       setToast]       = useState(null);

  useEffect(() => { loadRoles(); loadPermissions(); }, []);

  // Reset to page 1 whenever search or show-count changes
  useEffect(() => { setCurrentPage(1); }, [search, show]);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("manod_token")}`,
  });

  const loadRoles = async () => {
    setPageLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/roles`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setRoles(data.data);
      else showToast("Failed to load roles","error");
    } catch { showToast("Cannot connect to backend","error"); }
    finally { setPageLoading(false); }
  };

  const loadPermissions = async () => {
    try {
      const res  = await fetch(`${API_BASE}/roles/permissions`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        const groups = Object.entries(data.data).map(([group, items]) => ({
          group,
          items: items.map((i) => i.name),
        }));
        if (groups.length > 0) setPermGroups(groups);
      }
    } catch {}
  };

  const handleAdd = async ({ name, permissions }) => {
    const res  = await fetch(`${API_BASE}/roles`, { method:"POST", headers: authHeader(), body: JSON.stringify({ name, permissions }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    await loadRoles();
    setView("list");
    showToast("Role created successfully!");
  };

  const handleEditSave = async ({ name, permissions }) => {
    const res  = await fetch(`${API_BASE}/roles/${editRole.id}`, { method:"PUT", headers: authHeader(), body: JSON.stringify({ name, permissions }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    await loadRoles();
    setEditRole(null);
    setView("list");
    showToast("Role updated successfully!");
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      const res  = await fetch(`${API_BASE}/roles/${role.id}`, { method:"DELETE", headers: authHeader() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadRoles();
      showToast("Role deleted");
    } catch (err) { showToast(err.message || "Delete failed","error"); }
  };

  if (view === "add") return <RoleFormPage onBack={() => setView("list")} onSave={handleAdd} editRole={null} allRoles={roles} permissionGroups={permGroups} />;
  if (view === "edit") return <RoleFormPage onBack={() => { setEditRole(null); setView("list"); }} onSave={handleEditSave} editRole={editRole} allRoles={roles} permissionGroups={permGroups} />;

  // ── PAGINATION LOGIC (FIXED) ──────────────────────────────
  const filtered   = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / show));
  // Clamp currentPage in case rows shrink (e.g. after delete / search)
  const safePage   = Math.min(currentPage, totalPages);
  const startIdx   = (safePage - 1) * show;
  const shown      = filtered.slice(startIdx, startIdx + show); // ← FIXED

  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  // Build page number buttons (show max 5 around current)
  const pageButtons = [];
  const maxBtns  = 5;
  let   startBtn = Math.max(1, safePage - Math.floor(maxBtns / 2));
  let   endBtn   = Math.min(totalPages, startBtn + maxBtns - 1);
  if (endBtn - startBtn < maxBtns - 1) startBtn = Math.max(1, endBtn - maxBtns + 1);
  for (let i = startBtn; i <= endBtn; i++) pageButtons.push(i);

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {toast && (
        <div style={{ ...styles.toast, background: toast.type==="error"?"#e53e3e":"#22c55e" }}>
          {toast.msg}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Roles</h1>
          <span style={styles.subtitle}>Manage roles</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableToolbar}>
          <h3 style={styles.tableTitle}>All roles</h3>
          <button onClick={() => setView("add")} style={styles.addBtn}>+ Add</button>
        </div>

        {/* Export buttons */}
        <div style={styles.exportBar}>
          <button onClick={() => exportCSV(filtered)}   style={styles.exportBtn}><span style={{ ...styles.exportIcon,background:"#16a34a",color:"#fff" }}>CSV</span>Export CSV</button>
          <button onClick={() => exportExcel(filtered)} style={styles.exportBtn}><span style={{ ...styles.exportIcon,background:"#15803d",color:"#fff" }}>XLS</span>Export Excel</button>
          <button onClick={() => exportPDF(filtered)}   style={styles.exportBtn}><span style={{ ...styles.exportIcon,background:"#dc2626",color:"#fff" }}>PDF</span>Export PDF</button>
          <div style={{ position:"relative" }}>
            <button onClick={() => setShowColMenu((v) => !v)} style={styles.exportBtn}>
              <span style={{ ...styles.exportIcon,background:"#7c3aed",color:"#fff" }}>⊞</span>Column visibility
            </button>
            {showColMenu && (
              <div style={styles.colMenu}>
                {["Roles","Action"].map((col) => (
                  <label key={col} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 12px",cursor:"pointer",fontSize:13 }}>
                    <input type="checkbox" checked={colVisible[col]} onChange={() => setColVisible((v) => ({ ...v,[col]:!v[col] }))} />{col}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.tableControls}>
          <div style={styles.showEntries}>
            Show&nbsp;
            <select
              value={show}
              onChange={(e) => { setShow(parseInt(e.target.value)); }}
              style={styles.select}
            >
              {[10,25,50,100].map((n) => <option key={n} value={n}>{n}</option>)}
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

        {pageLoading ? (
          <div style={styles.loading}>⏳ Loading roles...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                {colVisible.Roles  && <th style={styles.th}>Roles</th>}
                {colVisible.Action && <th style={styles.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={2} style={{ ...styles.td, textAlign:"center", color:"#a0aec0" }}>No roles found</td></tr>
              ) : (
                shown.map((role) => (
                  <tr key={role.id} className="table-row">
                    {colVisible.Roles && <td style={styles.td}>{role.name}</td>}
                    {colVisible.Action && (
                      <td style={styles.td}>
                        {role.deletable ? (
                          <div style={{ display:"flex",gap:8 }}>
                            <button style={styles.editBtn}   onClick={() => { setEditRole(role); setView("edit"); }}>✎ Edit</button>
                            <button style={styles.deleteBtn} onClick={() => handleDelete(role)}>🗑 Delete</button>
                          </div>
                        ) : (
                          <span style={{ fontSize:12,color:"#a0aec0" }}>Protected</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ── FIXED PAGINATION ── */}
        <div style={styles.tableFooter}>
          <span>
            Showing {filtered.length === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + show, filtered.length)} of {filtered.length} entries
          </span>
          <div style={styles.pagination}>
            {/* Previous */}
            <button
              style={{ ...styles.pageBtn, opacity: safePage === 1 ? 0.4 : 1 }}
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
            >
              Previous
            </button>

            {/* Page number buttons */}
            {pageButtons.map((pg) => (
              <button
                key={pg}
                onClick={() => goToPage(pg)}
                style={{ ...styles.pageBtn, ...(pg === safePage ? styles.pageBtnActive : {}) }}
              >
                {pg}
              </button>
            ))}

            {/* Next */}
            <button
              style={{ ...styles.pageBtn, opacity: safePage === totalPages ? 0.4 : 1 }}
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div style={styles.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

/* ── react-select styles ── */
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#4f46e5" : "#cbd5e0",
    boxShadow:   state.isFocused ? "0 0 0 2px rgba(79,70,229,0.1)" : "none",
    borderRadius: 6, fontSize: 14, minHeight: 38,
    "&:hover": { borderColor: "#4f46e5" },
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? "#4f46e5" : state.isFocused ? "#eef2ff" : "#fff",
    color: state.isSelected ? "#fff" : "#2d3748",
    fontSize: 13,
  }),
};

const styles = {
  page:           { fontFamily:"'Segoe UI',sans-serif",background:"#f0f4f1",minHeight:"100vh",padding:0 },
  header:         { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 },
  title:          { fontSize:26,fontWeight:700,color:"#1a202c",margin:0 },
  subtitle:       { fontSize:13,color:"#718096" },
  backBtn:        { background:"#fff",border:"1px solid #cbd5e0",borderRadius:6,padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#4a5568",fontWeight:500 },
  card:           { background:"#fff",borderRadius:10,padding:24,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:20 },
  tableToolbar:   { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 },
  tableTitle:     { fontSize:16,fontWeight:600,margin:0,color:"#2d3748" },
  addBtn:         { background:"linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",color:"#fff",border:"none",borderRadius:24,padding:"10px 20px",fontSize:14,fontWeight:600,cursor:"pointer" },
  exportBar:      { display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center" },
  exportBtn:      { display:"flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #d1d5db",borderRadius:6,padding:"6px 12px",fontSize:13,cursor:"pointer",color:"#374151",fontWeight:500 },
  exportIcon:     { borderRadius:3,padding:"1px 5px",fontSize:11,fontWeight:700,lineHeight:"18px" },
  colMenu:        { position:"absolute",top:"100%",left:0,zIndex:100,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",minWidth:180,padding:"4px 0" },
  tableControls:  { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:10 },
  showEntries:    { fontSize:13,color:"#4a5568",display:"flex",alignItems:"center" },
  select:         { border:"1px solid #cbd5e0",borderRadius:4,padding:"2px 6px",fontSize:13 },
  searchInput:    { border:"1px solid #cbd5e0",borderRadius:6,padding:"6px 12px",fontSize:13,width:200 },
  table:          { width:"100%",borderCollapse:"collapse" },
  thead:          { background:"#f7fafc" },
  th:             { textAlign:"left",padding:"10px 14px",fontSize:13,fontWeight:600,color:"#4a5568",borderBottom:"1px solid #e2e8f0" },
  td:             { padding:"12px 14px",fontSize:14,color:"#2d3748",borderBottom:"1px solid #f0f4f1" },
  tableFooter:    { display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,fontSize:13,color:"#718096",flexWrap:"wrap",gap:10 },
  pagination:     { display:"flex",gap:4 },
  pageBtn:        { border:"1px solid #cbd5e0",background:"#fff",borderRadius:4,padding:"5px 12px",cursor:"pointer",fontSize:13,color:"#4a5568" },
  pageBtnActive:  { background:"#4f46e5",color:"#fff",border:"1px solid #4f46e5" },
  editBtn:        { background:"#fff",border:"1px solid #a0aec0",borderRadius:5,padding:"5px 12px",fontSize:12,cursor:"pointer",color:"#4a5568",fontWeight:500 },
  deleteBtn:      { background:"#fff",border:"1px solid #fc8181",borderRadius:5,padding:"5px 12px",fontSize:12,cursor:"pointer",color:"#e53e3e",fontWeight:500 },
  fieldRow:       { display:"flex",flexDirection:"column",gap:6 },
  label:          { fontSize:13,fontWeight:600,color:"#2d3748" },
  permGrid:       { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20,marginTop:12 },
  permGroup:      { background:"#f7fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"14px 16px",display:"flex",flexDirection:"column",gap:8 },
  permGroupHeader:{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,paddingBottom:8,borderBottom:"1px solid #e2e8f0" },
  permGroupTitle: { fontSize:13,color:"#2d3748" },
  checkLabel:     { display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:"#4a5568",cursor:"pointer",lineHeight:1.4 },
  checkbox:       { marginTop:2,accentColor:"#4f46e5",flexShrink:0 },
  formActions:    { display:"flex",gap:12,marginTop:32,paddingTop:20,borderTop:"1px solid #e2e8f0" },
  saveBtn:        { background:"linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",color:"#fff",border:"none",borderRadius:6,padding:"10px 28px",fontSize:14,fontWeight:600,cursor:"pointer" },
  cancelBtn:      { background:"#fff",color:"#4a5568",border:"1px solid #cbd5e0",borderRadius:6,padding:"10px 24px",fontSize:14,cursor:"pointer" },
  footer:         { textAlign:"center",fontSize:12,color:"#a0aec0",padding:"16px 0" },
  loading:        { textAlign:"center",padding:40,color:"#718096",fontSize:14 },
  errorBox:       { marginTop:12,background:"#fff5f5",border:"1px solid #fc8181",borderRadius:6,padding:"10px 14px",color:"#e53e3e",fontSize:13 },
  toast:          { position:"fixed",top:20,right:20,zIndex:9999,color:"#fff",borderRadius:8,padding:"12px 20px",fontSize:14,fontWeight:500,boxShadow:"0 4px 12px rgba(0,0,0,0.15)" },
};

const css = `
  .table-row:hover td { background: #f7fafc; }
  input:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
`;
import { useState } from "react";

const initialUsers = [
  { id: 1, username: "Dharshiha", name: "Ms Dharshiha C", role: "Admin", email: "dharshihamanodtechnologies@gmail.com" },
  { id: 2, username: "leejin", name: "Mr Leejin", role: "Cashier", email: "manodtechnologies@gmail.com" },
  { id: 3, username: "sanjeev", name: "Mrs Rekha Malar", role: "Admin", email: "manodrekha@gmail.com" },
  { id: 4, username: "sarath", name: "Er Sarath Raj", role: "Admin", email: "sarathmanodtechnologies01@gmail.com" },
  { id: 5, username: "Shalijah", name: "Ms Shalijah Stalin Rajakumar", role: "Admin", email: "shalijahmanodtechnologies@gmail.com" },
];

const emptyForm = {
  prefix: "", firstName: "", lastName: "", email: "", isActive: true,
  servicePinEnabled: false, allowLogin: true, username: "", password: "",
  confirmPassword: "", role: "Admin",
  accessLocations: "All Locations",
  salesCommission: "", maxDiscount: "",
  dob: "", gender: "", maritalStatus: "", bloodGroup: "",
  mobile: "", altContact: "", familyContact: "",
  facebook: "", twitter: "", social1: "", social2: "",
  custom1: "", custom2: "", custom3: "", custom4: "",
  guardianName: "", idProofName: "", idProofNumber: "",
  permanentAddress: "", currentAddress: "",
  accountHolder: "", accountNumber: "", bankName: "", bankCode: "", branch: "", taxPayerId: "",
  department: "", designation: "",
  primaryWorkLocation: "", basicSalary: "",
};

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit | view
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDelete, setShowDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [search, setSearch] = useState("");

  const openAdd = () => {
    setForm(emptyForm); setErrors({}); setModalMode("add");
    setActiveTab("basic"); setShowModal(true);
  };

  const openEdit = (user) => {
    setForm({
      ...emptyForm,
      prefix: user.name.split(" ")[0],
      firstName: user.name.split(" ")[1] || "",
      lastName: user.name.split(" ").slice(2).join(" "),
      email: user.email, username: user.username, role: user.role,
    });
    setEditId(user.id); setErrors({}); setModalMode("edit");
    setActiveTab("basic"); setShowModal(true);
  };

  const openView = (user) => {
    setForm({
      ...emptyForm,
      prefix: user.name.split(" ")[0],
      firstName: user.name.split(" ")[1] || "",
      lastName: user.name.split(" ").slice(2).join(" "),
      email: user.email, username: user.username, role: user.role,
    });
    setEditId(user.id); setModalMode("view");
    setActiveTab("basic"); setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (modalMode === "add") {
      if (!form.password) e.password = "Password is required";
      if (!form.confirmPassword) e.confirmPassword = "Please confirm password";
      else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    if (!form.role) e.role = "Role is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const fullName = [form.prefix, form.firstName, form.lastName].filter(Boolean).join(" ");
    const username = form.username || form.firstName.toLowerCase() + Math.floor(Math.random() * 100);
    if (modalMode === "add") {
      setUsers(u => [...u, { id: Date.now(), username, name: fullName, role: form.role, email: form.email }]);
    } else {
      setUsers(u => u.map(x => x.id === editId ? { ...x, name: fullName, role: form.role, email: form.email, username } : x));
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setUsers(u => u.filter(x => x.id !== id));
    setShowDelete(null);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = ["basic", "sales", "personal", "bank", "hrm"];
  const tabLabels = { basic: "Basic Info", sales: "Sales", personal: "Personal", bank: "Bank Details", hrm: "HRM" };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#1e2d1e" }}>Users</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>Manage users</p>
        </div>
        <button onClick={openAdd} style={{
          background: "linear-gradient(135deg, #2d6a4f, #40916c)",
          color: "#fff", border: "none", borderRadius: "10px",
          padding: "10px 22px", fontWeight: 700, fontSize: "14px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          boxShadow: "0 3px 10px rgba(45,106,79,0.3)",
        }}>
          <span style={{ fontSize: "18px" }}>+</span> Add User
        </button>
      </div>

      {/* Table Card */}
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #eaf1ec", overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #f0f4f1", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#1e2d1e" }}>All Users</div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {["Export CSV", "Export Excel", "Print", "Export PDF"].map(b => (
              <button key={b} style={{
                padding: "6px 12px", borderRadius: "7px", border: "1px solid #d1fae5",
                background: "#f0fdf4", color: "#2d6a4f", fontSize: "12px", fontWeight: 600, cursor: "pointer"
              }}>{b}</button>
            ))}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{
              padding: "7px 12px", borderRadius: "8px", border: "1px solid #d1d5db",
              fontSize: "13px", outline: "none", width: "180px"
            }} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fdf9" }}>
                {["Username", "Name", "Role", "Email", "Action"].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", color: "#374151", fontWeight: 600, fontSize: "13px", borderBottom: "2px solid #eaf1ec" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f0f4f1", background: i % 2 === 0 ? "#fff" : "#fafcfa" }}>
                  <td style={{ padding: "13px 18px", fontWeight: 600, color: "#1e2d1e" }}>{u.username}</td>
                  <td style={{ padding: "13px 18px", color: "#374151" }}>{u.name}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{
                      padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                      background: u.role === "Admin" ? "#dcfce7" : "#fef9c3",
                      color: u.role === "Admin" ? "#166534" : "#854d0e",
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "13px 18px", color: "#6b7280", fontSize: "13px" }}>{u.email}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => openEdit(u)} style={actionBtn("#2d6a4f", "#f0fdf4")}>✏️ Edit</button>
                      <button onClick={() => openView(u)} style={actionBtn("#2563eb", "#eff6ff")}>👁 View</button>
                      <button onClick={() => setShowDelete(u.id)} style={actionBtn("#dc2626", "#fef2f2")}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f4f1", color: "#6b7280", fontSize: "13px" }}>
          Showing 1 to {filtered.length} of {filtered.length} entries
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "28px", color: "#9ca3af", fontSize: "12px" }}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </div>

      {/* Delete Confirm */}
      {showDelete && (
        <div style={overlay}>
          <div style={{ ...modalBox, maxWidth: "380px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", color: "#1e2d1e" }}>Delete User?</h3>
            <p style={{ color: "#6b7280", margin: "0 0 22px", fontSize: "14px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setShowDelete(null)} style={secondaryBtnStyle}>Cancel</button>
              <button onClick={() => handleDelete(showDelete)} style={{ ...primaryBtnStyle, background: "#dc2626" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit/View Modal */}
      {showModal && (
        <div style={overlay}>
          <div style={{ ...modalBox, maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e2d1e" }}>
                {modalMode === "add" ? "Add User" : modalMode === "edit" ? "Edit User" : "View User"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: "none", fontSize: "22px", cursor: "pointer", color: "#6b7280" }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "22px", borderBottom: "2px solid #eaf1ec", paddingBottom: "0" }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: 600,
                  color: activeTab === t ? "#2d6a4f" : "#9ca3af",
                  borderBottom: activeTab === t ? "3px solid #2d6a4f" : "3px solid transparent",
                  marginBottom: "-2px",
                }}>{tabLabels[t]}</button>
              ))}
            </div>

            {activeTab === "basic" && (
              <div>
                <div style={row3}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Prefix</label>
                    <select disabled={modalMode === "view"} value={form.prefix} onChange={e => setForm({ ...form, prefix: e.target.value })} style={inp}>
                      <option value="">Select</option>
                      {["Mr", "Mrs", "Ms", "Dr", "Er"].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>First Name <span style={{ color: "#dc2626" }}>*</span></label>
                    <input disabled={modalMode === "view"} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={{ ...inp, borderColor: errors.firstName ? "#dc2626" : "#d1d5db" }} placeholder="First Name" />
                    {errors.firstName && <span style={errTxt}>{errors.firstName}</span>}
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Last Name</label>
                    <input disabled={modalMode === "view"} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} style={inp} placeholder="Last Name" />
                  </div>
                </div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Email <span style={{ color: "#dc2626" }}>*</span></label>
                    <input disabled={modalMode === "view"} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...inp, borderColor: errors.email ? "#dc2626" : "#d1d5db" }} placeholder="Email" />
                    {errors.email && <span style={errTxt}>{errors.email}</span>}
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Username</label>
                    <input disabled={modalMode === "view"} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={inp} placeholder="Leave blank to auto generate" />
                  </div>
                </div>
                {modalMode !== "view" && (
                  <div style={row2}>
                    <div style={fieldWrap}>
                      <label style={lbl}>Password <span style={{ color: "#dc2626" }}>*</span></label>
                      <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...inp, borderColor: errors.password ? "#dc2626" : "#d1d5db" }} placeholder="Password" />
                      {errors.password && <span style={errTxt}>{errors.password}</span>}
                    </div>
                    <div style={fieldWrap}>
                      <label style={lbl}>Confirm Password <span style={{ color: "#dc2626" }}>*</span></label>
                      <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={{ ...inp, borderColor: errors.confirmPassword ? "#dc2626" : "#d1d5db" }} placeholder="Confirm Password" />
                      {errors.confirmPassword && <span style={errTxt}>{errors.confirmPassword}</span>}
                    </div>
                  </div>
                )}
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Role <span style={{ color: "#dc2626" }}>*</span></label>
                    <select disabled={modalMode === "view"} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inp, borderColor: errors.role ? "#dc2626" : "#d1d5db" }}>
                      <option value="">Select Role</option>
                      <option>Admin</option>
                      <option>Cashier</option>
                    </select>
                    {errors.role && <span style={errTxt}>{errors.role}</span>}
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Access Locations</label>
                    <select disabled={modalMode === "view"} value={form.accessLocations} onChange={e => setForm({ ...form, accessLocations: e.target.value })} style={inp}>
                      <option>All Locations</option>
                      <option>Manodtechnologies (BL0001)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
                  {[
                    { label: "Is Active?", key: "isActive" },
                    { label: "Enable service staff pin", key: "servicePinEnabled" },
                    { label: "Allow Login", key: "allowLogin" },
                  ].map(({ label, key }) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: modalMode === "view" ? "default" : "pointer" }}>
                      <input type="checkbox" disabled={modalMode === "view"} checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} style={{ width: "16px", height: "16px", accentColor: "#2d6a4f" }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "sales" && (
              <div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Sales Commission Percentage (%)</label>
                    <input disabled={modalMode === "view"} type="number" value={form.salesCommission} onChange={e => setForm({ ...form, salesCommission: e.target.value })} style={inp} placeholder="0.00" />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Max Sales Discount Percent</label>
                    <input disabled={modalMode === "view"} type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} style={inp} placeholder="0.00" />
                  </div>
                </div>
                <div style={fieldWrap}>
                  <label style={lbl}>Allow Selected Contacts</label>
                  <textarea disabled={modalMode === "view"} value={form.allowContacts} onChange={e => setForm({ ...form, allowContacts: e.target.value })} style={{ ...inp, height: "80px", resize: "vertical" }} placeholder="Enter contact names..." />
                </div>
              </div>
            )}

            {activeTab === "personal" && (
              <div>
                <div style={row3}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Date of Birth</label>
                    <input disabled={modalMode === "view"} type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Gender</label>
                    <select disabled={modalMode === "view"} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={inp}>
                      <option value="">Please Select</option>
                      <option>Male</option><option>Female</option><option>Others</option>
                    </select>
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Marital Status</label>
                    <select disabled={modalMode === "view"} value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })} style={inp}>
                      <option value="">Marital Status</option>
                      <option>Married</option><option>Unmarried</option><option>Divorced</option>
                    </select>
                  </div>
                </div>
                <div style={row3}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Blood Group</label>
                    <input disabled={modalMode === "view"} value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} style={inp} placeholder="A+" />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Mobile Number</label>
                    <input disabled={modalMode === "view"} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} style={inp} placeholder="+91" />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Alternate Contact</label>
                    <input disabled={modalMode === "view"} value={form.altContact} onChange={e => setForm({ ...form, altContact: e.target.value })} style={inp} placeholder="+91" />
                  </div>
                </div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Family Contact Number</label>
                    <input disabled={modalMode === "view"} value={form.familyContact} onChange={e => setForm({ ...form, familyContact: e.target.value })} style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Guardian Name</label>
                    <input disabled={modalMode === "view"} value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} style={inp} />
                  </div>
                </div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Facebook Link</label>
                    <input disabled={modalMode === "view"} value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} style={inp} placeholder="https://facebook.com/..." />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Twitter Link</label>
                    <input disabled={modalMode === "view"} value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} style={inp} placeholder="https://twitter.com/..." />
                  </div>
                </div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>ID Proof Name</label>
                    <input disabled={modalMode === "view"} value={form.idProofName} onChange={e => setForm({ ...form, idProofName: e.target.value })} style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>ID Proof Number</label>
                    <input disabled={modalMode === "view"} value={form.idProofNumber} onChange={e => setForm({ ...form, idProofNumber: e.target.value })} style={inp} />
                  </div>
                </div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Permanent Address</label>
                    <textarea disabled={modalMode === "view"} value={form.permanentAddress} onChange={e => setForm({ ...form, permanentAddress: e.target.value })} style={{ ...inp, height: "70px", resize: "vertical" }} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Current Address</label>
                    <textarea disabled={modalMode === "view"} value={form.currentAddress} onChange={e => setForm({ ...form, currentAddress: e.target.value })} style={{ ...inp, height: "70px", resize: "vertical" }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bank" && (
              <div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Account Holder's Name</label>
                    <input disabled={modalMode === "view"} value={form.accountHolder} onChange={e => setForm({ ...form, accountHolder: e.target.value })} style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Account Number</label>
                    <input disabled={modalMode === "view"} value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} style={inp} />
                  </div>
                </div>
                <div style={row3}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Bank Name</label>
                    <input disabled={modalMode === "view"} value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Bank Identifier Code</label>
                    <input disabled={modalMode === "view"} value={form.bankCode} onChange={e => setForm({ ...form, bankCode: e.target.value })} style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Branch</label>
                    <input disabled={modalMode === "view"} value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} style={inp} />
                  </div>
                </div>
                <div style={fieldWrap}>
                  <label style={lbl}>Tax Payer ID</label>
                  <input disabled={modalMode === "view"} value={form.taxPayerId} onChange={e => setForm({ ...form, taxPayerId: e.target.value })} style={inp} />
                </div>
              </div>
            )}

            {activeTab === "hrm" && (
              <div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Department</label>
                    <select disabled={modalMode === "view"} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inp}>
                      <option value="">Please Select</option>
                      <option>Digital Marketing</option>
                      <option>sales-sales</option>
                    </select>
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Designation</label>
                    <select disabled={modalMode === "view"} value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} style={inp}>
                      <option value="">Please Select</option>
                      <option>sales</option>
                    </select>
                  </div>
                </div>
                <div style={row2}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Primary Work Location</label>
                    <select disabled={modalMode === "view"} value={form.primaryWorkLocation} onChange={e => setForm({ ...form, primaryWorkLocation: e.target.value })} style={inp}>
                      <option value="">Please Select</option>
                      <option>Manodtechnologies (BL0001)</option>
                    </select>
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Basic Salary</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input disabled={modalMode === "view"} type="number" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: e.target.value })} style={{ ...inp, flex: 1 }} placeholder="0.00" />
                      <select disabled={modalMode === "view"} value={form.salaryPeriod} onChange={e => setForm({ ...form, salaryPeriod: e.target.value })} style={{ ...inp, width: "120px" }}>
                        <option>Per Month</option>
                        <option>Per Week</option>
                        <option>Per Day</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            {modalMode !== "view" && (
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #eaf1ec" }}>
                <button onClick={() => setShowModal(false)} style={secondaryBtnStyle}>Close</button>
                <button onClick={handleSave} style={primaryBtnStyle}>
                  {modalMode === "add" ? "Save User" : "Update User"}
                </button>
              </div>
            )}
            {modalMode === "view" && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #eaf1ec" }}>
                <button onClick={() => setShowModal(false)} style={secondaryBtnStyle}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Shared style helpers
const actionBtn = (color, bg) => ({
  padding: "5px 10px", borderRadius: "7px", border: `1px solid ${color}20`,
  background: bg, color, fontSize: "12px", fontWeight: 600, cursor: "pointer",
});

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: "20px",
};

const modalBox = {
  background: "#fff", borderRadius: "16px", padding: "28px",
  width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};

const primaryBtnStyle = {
  background: "linear-gradient(135deg, #2d6a4f, #40916c)",
  color: "#fff", border: "none", borderRadius: "9px",
  padding: "10px 24px", fontWeight: 700, fontSize: "14px", cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db",
  borderRadius: "9px", padding: "10px 20px", fontWeight: 600, fontSize: "14px", cursor: "pointer",
};

const fieldWrap = { display: "flex", flexDirection: "column", gap: "5px", flex: 1 };

const lbl = { fontSize: "12px", fontWeight: 600, color: "#374151" };

const inp = {
  padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db",
  fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box",
  background: "#fff",
};

const row2 = { display: "flex", gap: "14px", marginBottom: "14px" };
const row3 = { display: "flex", gap: "14px", marginBottom: "14px" };
const errTxt = { fontSize: "11px", color: "#dc2626" };
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchAllUsers } from "../api/userApi";
import {
  getAllContacts, getContactById as apiGetContactById, createContact as apiCreateContact, updateContact as apiUpdateContact,
  deleteContact as apiDeleteContact, getContactStats, getAllGroups, createGroup as apiCreateGroup,
  updateGroup as apiUpdateGroup, deleteGroup as apiDeleteGroup, importContacts as apiImportContacts, parseCSVFile,
  getContactOutstanding as apiGetContactOutstanding, recordContactPayment as apiRecordContactPayment,
  getContactStatement as apiGetContactStatement, recordSalesPayment as apiRecordSalesPayment,
} from "../api/contactsAPI";
import { usePermissions } from "../context/PermissionsContext";

// ─── Export Utilities ────────────────────────────────────────────────────────
const toCSV = (data, cols) => {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...data.map((r) => cols.map((c) => escape(r[c])).join(","))].join("\n");
};

const downloadBlob = (content, filename, mime) => {
  const blob = new Blob([content], { type: mime });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

const printHTML = (title, tableHTML) => {
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:20px}h2{color:#1a5c38}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f0f0f0;font-weight:600}</style></head>
    <body><h2>${title}</h2>${tableHTML}</body></html>`);
  w.document.close(); w.print();
};

// ─── Map backend row → UI row shape ──────────────────────────────────────────
// FIXED: uses contact_name (DB column) instead of name
const mapContact = (c) => ({
  id: c.id,
  contactType: c.contact_type,
  individual: c.is_individual,
  contactId: c.contact_id,
  prefix: c.prefix || "",
  firstName: c.first_name || "",
  middleName: c.middle_name || "",
  lastName: c.last_name || "",
  businessName: c.business_name || "",
  name: c.contact_name || c.name || "—",  // FIXED: prefer contact_name
  email: c.email || "—",
  taxNumber: c.tax_number || "—",
  payTerm: c.pay_term || "—",
  creditLimit: `₹${Number(c.credit_limit || 0).toFixed(2)}`,
  openingBalance: `₹${Number(c.opening_balance || 0).toFixed(2)}`,
  advanceBalance: `₹${Number(c.advance_balance || 0).toFixed(2)}`,
  addedOn: c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—",
  address: c.address || "—",
  city: c.city || "",
  state: c.state || "",
  country: c.country || "",
  zip: c.zip || "",
mobile: c.phone || "—",
  altPhone: c.alt_phone || "",
  landline: c.landline || "",
  assignedTo: c.assigned_to || "",
  customerGroup: c.customer_group_name || "—",
  customerGroupId: c.customer_group_id || "",
  totalPurchaseDue: `₹${Number(c.total_purchase_due || 0).toFixed(2)}`,
  totalPurchaseReturnDue: `₹${Number(c.total_purchase_return_due || 0).toFixed(2)}`,
  persons: c.persons || [],
});

const mapToPayload = (c) => ({
  contactType: c.contactType,
  individual: c.individual,
  contactId: c.contactId,
  prefix: c.prefix,
  firstName: c.firstName,
  middleName: c.middleName,
  lastName: c.lastName,
  businessName: c.businessName,
  mobile: c.mobile === "—" ? "" : c.mobile,
  altPhone: c.altPhone,
  landline: c.landline,
  email: c.email === "—" ? "" : c.email,
  assignedTo: c.assignedTo,
  taxNumber: c.taxNumber === "—" ? "" : c.taxNumber,
  payTerm: c.payTerm === "—" ? "" : c.payTerm,
  creditLimit: String(c.creditLimit || "").replace(/[₹,]/g, ""),
  openingBalance: String(c.openingBalance || "").replace(/[₹,]/g, ""),
  address: c.address === "—" ? "" : c.address,
  city: c.city, state: c.state, country: c.country, zip: c.zip,
  customerGroupId: c.customerGroupId || null,
  persons: c.persons,
});

// ─── Shared Styles ────────────────────────────────────────────────────────────
const GREEN = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
const GREEN_SHADOW = "0 3px 10px rgba(34,197,94,0.35)";

const pageStyle = { fontFamily: "'Segoe UI', sans-serif", background: "#f0f4f1", minHeight: "100vh", padding: 0 };
const pageTitle = { margin: 0, fontSize: 24, fontWeight: 700, color: "#1a202c" };
const pageSubtitle = { fontSize: 13, color: "#718096" };
const card = { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 20 };
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = { padding: "11px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" };
const td = { padding: "11px 12px", borderBottom: "1px solid #f3f4f6", color: "#374151", wordBreak: "break-word" };  
const emptyCell = { textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 };
const pgBtn = { border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13, color: "#4a5568" };
const tableFooter = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13, color: "#6b7280", flexWrap: "wrap", gap: 10 };
const xBtn = { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 13px", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 };
const xIcon = { borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700, lineHeight: "17px", color: "#fff" };
const colMenuStyle = { position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 210, padding: "4px 0" };
const selectStyle = { border: "1px solid #d1d5db", borderRadius: 4, padding: "3px 8px", fontSize: 13 };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const editBtnStyle = { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#374151", fontWeight: 500 };
const delBtnStyle = { background: "#fff", border: "1px solid #fca5a5", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#dc2626", fontWeight: 500 };
const greenBtn = { background: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: GREEN_SHADOW };
const darkBtn = { background: "#374151", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, cursor: "pointer" };
const hoverCss = `.tr-hover:hover td { background: #f7fafc !important; } input:focus, select:focus { border-color: #16a34a !important; box-shadow: 0 0 0 2px rgba(34,197,94,0.15); }`;

// ─── Modal field styles (defined OUTSIDE components to avoid remount) ─────────
const modalInp = {
  border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 12px",
  fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none",
  transition: "border-color 0.15s",
};
const modalLbl = { display: "block", fontWeight: 600, marginBottom: 5, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" };
const iconBox = { padding: "9px 10px", border: "1px solid #d1d5db", borderRight: "none", borderRadius: "6px 0 0 6px", background: "#f9fafb", fontSize: 14, display: "flex", alignItems: "center" };
const iconInp = { ...modalInp, borderRadius: "0 6px 6px 0", borderLeft: "none" };

// ─── Export Button Bar ────────────────────────────────────────────────────────
function ExportBar({ onCSV, onExcel, onPrint, onPDF, columns, colVisible, setColVisible }) {
  const [showColMenu, setShowColMenu] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowColMenu(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
      <button onClick={onCSV} style={xBtn}>
        <span style={{ ...xIcon, background: "#16a34a" }}>CSV</span> Export CSV
      </button>
      <button onClick={onExcel} style={xBtn}>
        <span style={{ ...xIcon, background: "#15803d" }}>XLS</span> Export Excel
      </button>
      <button onClick={onPrint} style={xBtn}>
        <span style={{ ...xIcon, background: "#4b5563" }}>PRT</span> Print
      </button>
      <div style={{ position: "relative" }} ref={ref}>
        <button onClick={() => setShowColMenu((v) => !v)} style={xBtn}>
          <span style={{ ...xIcon, background: "#7c3aed" }}>COL</span> Column visibility
        </button>
        {showColMenu && (
          <div style={colMenuStyle}>
            {columns.map((col) => (
              <label key={col} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, color: "#374151" }}>
                <input type="checkbox" checked={colVisible[col] !== true} style={{ accentColor: "#7c3aed" }}
                  onChange={() => setColVisible((v) => ({ ...v, [col]: v[col] !== true }))} />
                {col}
              </label>
            ))}
          </div>
        )}
      </div>
      <button onClick={onPDF} style={xBtn}>
        <span style={{ ...xIcon, background: "#dc2626" }}>PDF</span> Export PDF
      </button>
    </div>
  );
}

// ─── Table Controls Row ───────────────────────────────────────────────────────
function TableControls({ showEntries, setShowEntries, search, setSearch }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4a5568" }}>
        Show&nbsp;
        <select value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))} style={selectStyle}>
          {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
        </select>
        &nbsp;entries
      </div>
      <input
        placeholder="Search ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 12px", fontSize: 13, width: 200, outline: "none" }}
      />
    </div>
  );
}

// ─── Dashboard Cards ──────────────────────────────────────────────────────────
function DashboardCards({ stats, onCardClick, activeCard }) {
  if (!stats) return null;
  const cards = [
    { key: "suppliers", label: "TOTAL SUPPLIERS", value: stats.totalSuppliers, color: "#16a34a" },
    { key: "customers", label: "TOTAL CUSTOMERS", value: stats.totalCustomers, color: "#2563eb" },
    { key: "due", label: "TOTAL PURCHASE DUE", value: `₹${Number(stats.totalPurchaseDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#dc2626" },
    { key: "groups", label: "CUSTOMER GROUPS", value: stats.totalCustomerGroups, color: "#7c3aed" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
      {cards.map((c) => (
        <div
          key={c.key}
          onClick={onCardClick ? () => onCardClick(c.key) : undefined}
          style={{
            background: "#fff", borderRadius: 10, padding: "18px 20px",
            boxShadow: activeCard === c.key ? `0 0 0 2px ${c.color}` : "0 1px 4px rgba(0,0,0,0.08)",
            cursor: onCardClick ? "pointer" : "default",
            borderLeft: `4px solid ${c.color}`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.04em" }}>{c.label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1a202c", marginTop: 4 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ADD / EDIT CONTACT MODAL ─────────────────────────────────────────────────
function FieldBox({ label, required, children }) {
  return (
    <div>
      <label style={modalLbl}>{label}{required && <span style={{ color: "#e53e3e" }}> *</span>}</label>
      {children}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
    </div>
  );
}

function AddContactModal({ defaultType, onSave, onClose, editContact, groups }) {
  const isEdit = !!editContact;
  const init = editContact || {};

  const [contactType, setContactType] = useState(init.contactType || defaultType || "Suppliers");
  const [individual, setIndividual] = useState(init.individual !== false);
  const [contactId, setContactId] = useState(init.contactId || "");
  const [customerGroupId, setCustomerGroupId] = useState(init.customerGroupId || "");
  const [mobile, setMobile] = useState(init.mobile === "—" ? "" : (init.mobile || ""));
  const [altPhone, setAltPhone] = useState(init.altPhone || "");
  const [landline, setLandline] = useState(init.landline || "");
  const [email, setEmail] = useState(init.email === "—" ? "" : (init.email || ""));
  const [assignedTo, setAssignedTo] = useState(init.assignedTo || "");
  const [prefix, setPrefix] = useState(init.prefix || "");
  const [firstName, setFirstName] = useState(init.firstName || "");
  const [middleName, setMiddleName] = useState(init.middleName || "");
  const [lastName, setLastName] = useState(init.lastName || "");
  const [taxNumber, setTaxNumber] = useState(init.taxNumber === "—" ? "" : (init.taxNumber || ""));
  const [payTerm, setPayTerm] = useState(init.payTerm === "—" ? "" : (init.payTerm || ""));
  const [creditLimit, setCreditLimit] = useState(init.creditLimit ? String(init.creditLimit).replace(/[₹,]/g, "") : "");
  const [openingBalance, setOpeningBalance] = useState(init.openingBalance ? String(init.openingBalance).replace(/[₹,]/g, "") : "");
  const [address, setAddress] = useState(init.address === "—" ? "" : (init.address || ""));
  const [city, setCity] = useState(init.city || "");
  const [state, setState] = useState(init.state || "");
  const [country, setCountry] = useState(init.country || "");
  const [zip, setZip] = useState(init.zip || "");
  const [businessName, setBusinessName] = useState(init.businessName || "");
  const [persons, setPersons] = useState(init.persons?.length ? init.persons : [{ name: "", mobile: "", email: "" }]);
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAllUsers()
      .then((data) => setUsers(data || []))
      .catch(() => setUsers([]));
  }, []);

  const handleSave = async () => {
    setErrorMsg("");
    if (!mobile.trim()) { setErrorMsg("Mobile number is required."); return; }
    if (!individual && !businessName.trim()) { setErrorMsg("Business Name is required for business contacts."); return; }
    if (individual && !firstName.trim()) { setErrorMsg("First Name is required."); return; }
    setSaving(true);
    try {
      await onSave({
        contactType, individual, contactId, businessName,
        prefix, firstName, middleName, lastName,
        email, taxNumber, payTerm, creditLimit, openingBalance,
        address, city, state, country, zip, mobile,
        altPhone, landline, assignedTo, customerGroupId,
        persons: persons.filter((p) => p.name || p.mobile || p.email),
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to save contact.");
    } finally {
      setSaving(false);
    }
  };

  const tabStyle = (active) => ({
    padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
    borderBottom: active ? "2px solid #16a34a" : "2px solid transparent",
    background: "none", color: active ? "#16a34a" : "#6b7280", transition: "all 0.15s",
  });

  return (
    <div style={overlayStyle}>
      <div style={{
        background: "#fff", borderRadius: 14, width: "min(780px, 96vw)",
        maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        position: "relative", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a202c" }}>
                {isEdit ? "✎ Edit Contact" : "＋ Add New Contact"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>Fill in the contact details below</p>
            </div>
            <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {[["basic", "Basic Info"], ["details", "Financial Details"], ["address", "Address & More"]].map(([key, label]) => (
              <button key={key} style={tabStyle(activeTab === key)} onClick={() => setActiveTab(key)}>{label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px", flex: 1 }}>
          {errorMsg && (
            <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
              ⚠ {errorMsg}
            </div>
          )}

          {activeTab === "basic" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
                <FieldBox label="Contact Type" required>
                  <select value={contactType} onChange={(e) => setContactType(e.target.value)} style={modalInp}>
                    <option>Suppliers</option><option>Customers</option><option>Both</option>
                  </select>
                </FieldBox>
                <FieldBox label="Contact Mode">
                  <div style={{ display: "flex", gap: 0, border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden" }}>
                    {[["Individual", true], ["Business", false]].map(([label, val]) => (
                      <button key={label} type="button" onClick={() => setIndividual(val)}
                        style={{ flex: 1, padding: "9px 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s", background: individual === val ? "#16a34a" : "#fff", color: individual === val ? "#fff" : "#6b7280" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </FieldBox>
                <FieldBox label="Contact ID">
                  <input value={contactId} onChange={(e) => setContactId(e.target.value)} placeholder="Auto-generated if empty" style={modalInp} disabled={isEdit} />
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Leave empty to auto-generate</div>
                </FieldBox>
              </div>

              {!individual && (
                <div style={{ marginBottom: 18 }}>
                  <FieldBox label="Business / Company Name" required>
                    <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Manod Technologies Pvt Ltd" style={modalInp} />
                  </FieldBox>
                </div>
              )}

              {individual && (
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
                  <FieldBox label="Prefix">
                    <select value={prefix} onChange={(e) => setPrefix(e.target.value)} style={modalInp}>
                      <option value="">—</option>
                      <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                    </select>
                  </FieldBox>
                  <FieldBox label="First Name" required>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" style={modalInp} />
                  </FieldBox>
                  <FieldBox label="Middle Name">
                    <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" style={modalInp} />
                  </FieldBox>
                  <FieldBox label="Last Name">
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" style={modalInp} />
                  </FieldBox>
                </div>
              )}

              <SectionDivider label="Contact Information" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <FieldBox label="Mobile" required>
                  <div style={{ display: "flex" }}>
                    <span style={iconBox}>📱</span>
                    <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" style={iconInp} />
                  </div>
                </FieldBox>
                <FieldBox label="Alternate Number">
                  <div style={{ display: "flex" }}>
                    <span style={iconBox}>📞</span>
                    <input value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder="Alternate contact" style={iconInp} />
                  </div>
                </FieldBox>
                <FieldBox label="Landline">
                  <div style={{ display: "flex" }}>
                    <span style={iconBox}>☎️</span>
                    <input value={landline} onChange={(e) => setLandline(e.target.value)} placeholder="Landline number" style={iconInp} />
                  </div>
                </FieldBox>
                <FieldBox label="Email Address">
                  <div style={{ display: "flex" }}>
                    <span style={iconBox}>✉️</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" style={iconInp} />
                  </div>
                </FieldBox>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {(contactType === "Customers" || contactType === "Both") && (
                  <FieldBox label="Customer Group">
                    <select value={customerGroupId} onChange={(e) => setCustomerGroupId(e.target.value)} style={modalInp}>
                      <option value="">No group</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </FieldBox>
                )}
             <FieldBox label="Assigned To">
                  <div style={{ display: "flex" }}>
                    <span style={iconBox}>👤</span>
                    <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={iconInp}>
                      <option value="">Select sales person</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.full_name || u.name}>
                          {u.full_name || u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </FieldBox>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div>
              <SectionDivider label="Tax & Payment" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <FieldBox label="Tax Number (GST/PAN)">
                  <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="e.g. 33ABCDE1234F1Z5" style={modalInp} />
                </FieldBox>
                <FieldBox label="Pay Term">
                  <select value={payTerm} onChange={(e) => setPayTerm(e.target.value)} style={modalInp}>
                    <option value="">No specific term</option>
                    <option>7 days</option><option>15 days</option><option>30 days</option>
                    <option>45 days</option><option>60 days</option><option>90 days</option>
                  </select>
                </FieldBox>
              </div>

              <SectionDivider label="Opening Balances" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <FieldBox label="Opening Balance (₹)">
                  <div style={{ display: "flex" }}>
                    <span style={{ ...iconBox, fontWeight: 700, fontSize: 13, minWidth: 36, justifyContent: "center" }}>₹</span>
                    <input value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="0.00" type="number" min="0" style={iconInp} />
                  </div>
                </FieldBox>
                <FieldBox label="Credit Limit (₹)">
                  <div style={{ display: "flex" }}>
                    <span style={{ ...iconBox, fontWeight: 700, fontSize: 13, minWidth: 36, justifyContent: "center" }}>₹</span>
                    <input value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="0.00" type="number" min="0" style={iconInp} />
                  </div>
                </FieldBox>
              </div>

              <SectionDivider label="Contact Persons" />
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: 16, border: "1px solid #e5e7eb" }}>
                {persons.map((p, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 10 }}>
                    <input value={p.name} onChange={(e) => { const a = [...persons]; a[i] = { ...a[i], name: e.target.value }; setPersons(a); }} placeholder="Full name" style={modalInp} />
                    <input value={p.mobile} onChange={(e) => { const a = [...persons]; a[i] = { ...a[i], mobile: e.target.value }; setPersons(a); }} placeholder="Mobile" style={modalInp} />
                    <input value={p.email} onChange={(e) => { const a = [...persons]; a[i] = { ...a[i], email: e.target.value }; setPersons(a); }} placeholder="Email" style={modalInp} />
                    <button onClick={() => setPersons(persons.filter((_, idx) => idx !== i))} style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 700 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setPersons([...persons, { name: "", mobile: "", email: "" }])}
                  style={{ background: "#f0fdf4", color: "#16a34a", border: "1px dashed #86efac", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13, width: "100%" }}>
                  ＋ Add Contact Person
                </button>
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div>
              <SectionDivider label="Address Details" />
              <div style={{ marginBottom: 16 }}>
                <FieldBox label="Street Address">
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address, area, landmark" style={modalInp} />
                </FieldBox>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FieldBox label="City">
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Nagercoil" style={modalInp} />
                </FieldBox>
                <FieldBox label="State">
                  <input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Tamil Nadu" style={modalInp} />
                </FieldBox>
                <FieldBox label="Country">
                  <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" style={modalInp} />
                </FieldBox>
                <FieldBox label="ZIP / PIN Code">
                  <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g. 629001" style={modalInp} />
                </FieldBox>
              </div>
              <SectionDivider label="Preview" />
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: 16, border: "1px solid #e5e7eb", fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                {[address, city, state, zip, country].filter(Boolean).join(", ") || <span style={{ color: "#9ca3af" }}>Address will appear here once filled</span>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa", borderRadius: "0 0 14px 14px" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["basic", "details", "address"].map((tab) => (
              <div key={tab} style={{ width: 8, height: 8, borderRadius: "50%", background: activeTab === tab ? "#16a34a" : "#d1d5db", cursor: "pointer", transition: "background 0.15s" }} onClick={() => setActiveTab(tab)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{ ...greenBtn, opacity: saving ? 0.7 : 1, padding: "10px 32px" }}>
              {saving ? "Saving..." : (isEdit ? "💾 Update Contact" : "💾 Save Contact")}
            </button>
            <button onClick={onClose} style={darkBtn}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADVANCED FILTER PANEL ────────────────────────────────────────────────────
const fLbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 };
const fInp = { border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 10px", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
function AdvancedFilter({ onFilter, type, groups }) {
  const [payTerm, setPayTerm] = useState("");
  const [customerGroupId, setCustomerGroupId] = useState("");

  const apply = (next) => onFilter(next);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
      <select
        value={payTerm}
        onChange={(e) => { setPayTerm(e.target.value); apply({ payTerm: e.target.value, customerGroupId }); }}
        style={{ ...selectStyle, minWidth: 140 }}
      >
        <option value="">All Pay Terms</option>
        <option>7 days</option><option>15 days</option><option>30 days</option><option>45 days</option><option>60 days</option>
      </select>
      {type === "customer" && (
        <select
          value={customerGroupId}
          onChange={(e) => { setCustomerGroupId(e.target.value); apply({ payTerm, customerGroupId: e.target.value }); }}
          style={{ ...selectStyle, minWidth: 160 }}
        >
          <option value="">All Groups</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      )}
    </div>
  );
}

// ─── Shared data hook ─────────────────────────────────────────────────────────
function useContactsData(contactType) {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showEntries, setShowEntries] = useState(25);
  const [search, setSearch] = useState("");
  const [filterParams, setFilterParams] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setErrorMsg("");
    try {
      const [contactsRes, groupsRes, statsRes] = await Promise.all([
        getAllContacts({ page, limit: showEntries, search, contactType, ...filterParams }),
        getAllGroups().catch(() => []),
        getContactStats().catch(() => null),
      ]);
      setContacts((contactsRes.contacts || []).map(mapContact));
      setTotal(contactsRes.total || 0);
      setGroups(groupsRes || []);
      setStats(statsRes);
    } catch (err) {
      setErrorMsg(err.message || "Failed to load contacts.");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [page, showEntries, search, contactType, filterParams]);

  useEffect(() => { load(); }, [load]);

  return {
    contacts, setContacts, groups, stats, loading, errorMsg,
    total, page, setPage, showEntries, setShowEntries, search, setSearch,
    filterParams, setFilterParams, reload: load,
  };
}

// ─── Page Header ──────────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, onAdd }) {
  return (
    <>
      <div style={{ paddingBottom: 16, marginBottom: 4 }}>
        <h2 style={pageTitle}>{title}</h2>
        <span style={pageSubtitle}>{subtitle}</span>
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{
          position: "fixed", top: 70, right: 24, zIndex: 400,
          background: GREEN, color: "#fff", border: "none", borderRadius: 50,
          padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(34,197,94,0.45)", whiteSpace: "nowrap",
        }}>
          ＋ Add
        </button>
      )}
    </>
  );
}

// ─── Pagination Row ───────────────────────────────────────────────────────────
function PaginationRow({ page, setPage, showEntries, total }) {
  return (
    <div style={tableFooter}>
      <span>Showing {total === 0 ? "0 to 0 of 0" : `${(page - 1) * showEntries + 1} to ${Math.min(page * showEntries, total)} of ${total}`} entries</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button style={pgBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
        <button style={{ ...pgBtn, background: "#16a34a", color: "#fff", borderColor: "#16a34a" }}>{page}</button>
        <button style={pgBtn} disabled={page * showEntries >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

// ─── SUPPLIERS PAGE ───────────────────────────────────────────────────────────
// ─── Shared Contact Detail Modal ──────────────────────────────────────────────
function ContactDetailModal({ c, onClose, onEdit, canEdit }) {
  // ── Real outstanding — opening balance + actual invoice/purchase/payment
  // transactions, from accountingService (single source of truth, same
  // function used by the Sell credit-limit check, Reports, and Statement).
  // NOT the static c.openingBalance field — that alone was the bug.
  const [outstanding, setOutstanding] = useState(null);
  const [outstandingLoading, setOutstandingLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payNote, setPayNote] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError] = useState("");
  const [payResult, setPayResult] = useState(null); // last FIFO allocation result, shown after a customer payment

  // ── Statement / Ledger tab ──
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'statement'
  const [statement, setStatement] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementError, setStatementError] = useState("");

  const loadOutstanding = useCallback(async () => {
    if (!c?.id) return;
    setOutstandingLoading(true);
    try {
      const data = await apiGetContactOutstanding(c.id);
      setOutstanding(data);
    } catch (err) {
      console.error("Failed to load outstanding:", err.message);
      setOutstanding(null);
    } finally {
      setOutstandingLoading(false);
    }
  }, [c?.id]);

  useEffect(() => { loadOutstanding(); }, [loadOutstanding]);

  const isCustomer = c.contactType === "Customers" || c.contactType === "Customer" || c.contactType === "Both";
  const isSupplier = c.contactType === "Suppliers" || c.contactType === "Supplier" || c.contactType === "Both";
  const custData = outstanding?.customer;
  const supData = outstanding?.supplier;

  const loadStatement = useCallback(async () => {
    if (!c?.id) return;
    setStatementLoading(true);
    setStatementError("");
    try {
      const side = isSupplier && !isCustomer ? "supplier" : "customer";
      const data = await apiGetContactStatement(c.id, side);
      setStatement(data);
    } catch (err) {
      setStatementError(err.message || "Failed to load statement");
      setStatement(null);
    } finally {
      setStatementLoading(false);
    }
  }, [c?.id, isCustomer, isSupplier]);

  useEffect(() => {
    if (activeTab === "statement" && !statement) loadStatement();
  }, [activeTab, statement, loadStatement]);

  // Customer payments use the dedicated Sales-side FIFO endpoint (applies
  // oldest-invoice-first); supplier payments keep the existing generic
  // opening-balance/advance endpoint since FIFO purchase allocation is out
  // of scope here.
  const submitPayment = async () => {
    setPayError("");
    setPayResult(null);
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { setPayError("Enter a valid amount"); return; }
    setPaySubmitting(true);
    try {
      const useCustomerFIFO = isCustomer && !(isSupplier && !isCustomer);
      if (useCustomerFIFO) {
        const result = await apiRecordSalesPayment(c.id, {
          amount: amt,
          paymentMethod: payMethod,
          note: payNote || undefined,
          allowOverpayAsAdvance: true,
        });
        setPayResult(result);
      } else {
        await apiRecordContactPayment(c.id, {
          amount: amt,
          paymentMethod: payMethod,
          note: payNote || undefined,
          direction: "out",
        });
      }
      setPayAmount(""); setPayNote("");
      await loadOutstanding();
      setStatement(null); // force statement reload with fresh data next time it's opened
    } catch (err) {
      setPayError(err.message || "Failed to record payment");
    } finally {
      setPaySubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={{ background: "#fff", borderRadius: 14, width: "min(680px, 96vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ background: GREEN, padding: "28px 28px 20px", borderRadius: "14px 14px 0 0", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", right: 16, top: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              {(c.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{c.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{c.contactId} · {c.contactType}</div>
              {c.customerGroup && c.customerGroup !== "—" && (
                <span style={{ background: "rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 10, marginTop: 4, display: "inline-block" }}>{c.customerGroup}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          {/* ── Real outstanding card — replaces the old static-only display ── */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
            {outstandingLoading ? (
              <div style={{ fontSize: 13, color: "#6b7280" }}>Loading outstanding…</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: (isCustomer && isSupplier) ? "1fr 1fr" : "1fr", gap: 16 }}>
                  {isCustomer && custData && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Customer Outstanding (Receivable)</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#166534" }}>₹{custData.total.toFixed(2)}</div>
                      <div style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                        Opening ₹{custData.openingBalance.toFixed(2)} + Invoiced ₹{custData.invoiced.toFixed(2)} − Paid ₹{custData.paid.toFixed(2)}
                      </div>
                      {custData.creditLimit > 0 && (
                        <div style={{ fontSize: 12, color: "#2563eb", marginTop: 4, fontWeight: 600 }}>
                          Available credit: ₹{custData.availableCredit.toFixed(2)} of ₹{custData.creditLimit.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                  {isSupplier && supData && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Supplier Payable</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#991b1b" }}>₹{supData.total.toFixed(2)}</div>
                      <div style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                        Opening ₹{supData.openingBalance.toFixed(2)} + Purchased ₹{supData.purchased.toFixed(2)} − Paid ₹{supData.paid.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
                {((custData && custData.total > 0) || (supData && supData.total > 0)) && (
                  <button
                    onClick={() => setShowPayModal(true)}
                    style={{ marginTop: 14, background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Record Payment
                  </button>
                )}
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Opening Balance", value: c.openingBalance, color: "#16a34a" },
              { label: "Credit Limit",    value: c.creditLimit,    color: "#2563eb" },
              { label: "Advance Balance", value: c.advanceBalance, color: "#7c3aed" },
            ].map((item) => (
              <div key={item.label} style={{ background: "#f9fafb", borderRadius: 8, padding: "14px 16px", textAlign: "center", border: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          {showPayModal && (
            <div style={{ ...overlayStyle, zIndex: 1100 }}>
              <div style={{ background: "#fff", borderRadius: 12, width: "min(440px, 92vw)", padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Record Payment — {c.name}</div>
                {payError && <div style={{ background: "#fef2f2", color: "#991b1b", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 12 }}>{payError}</div>}

                {payResult ? (
                  <div>
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 6 }}>Payment applied (FIFO)</div>
                      {payResult.allocations?.length > 0 ? payResult.allocations.map((a) => (
                        <div key={a.invoiceId} style={{ fontSize: 12, color: "#374151", display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                          <span>{a.invoiceNo || `Invoice #${a.invoiceId}`}</span>
                          <span>₹{a.appliedAmount.toFixed(2)} applied · ₹{a.remainingBalance.toFixed(2)} left</span>
                        </div>
                      )) : (
                        <div style={{ fontSize: 12, color: "#6b7280" }}>No open invoices — full amount credited as advance.</div>
                      )}
                      {payResult.advanceCredited > 0 && (
                        <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6, fontWeight: 600 }}>
                          ₹{payResult.advanceCredited.toFixed(2)} credited to advance balance
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={() => { setShowPayModal(false); setPayResult(null); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: GREEN, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Done</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Amount (₹)</label>
                    <input type="number" min="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 12, fontSize: 14 }} />
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Payment Method</label>
                    <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 12, fontSize: 14 }}>
                      <option>Cash</option><option>Bank</option><option>UPI</option><option>Card</option><option>Other</option>
                    </select>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Note (optional)</label>
                    <input value={payNote} onChange={(e) => setPayNote(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 8, fontSize: 14 }} />
                    {isCustomer && (
                      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>Applied oldest-invoice-first (FIFO). Any excess is credited to advance balance.</div>
                    )}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => setShowPayModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
                      <button disabled={paySubmitting} onClick={submitPayment} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: GREEN, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: paySubmitting ? 0.6 : 1 }}>
                        {paySubmitting ? "Saving…" : "Save Payment"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Overview / Statement tabs ── */}
          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #f3f4f6", marginBottom: 18 }}>
            {["overview", "statement"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, textTransform: "capitalize",
                  color: activeTab === tab ? GREEN : "#9ca3af",
                  borderBottom: activeTab === tab ? `2px solid ${GREEN}` : "2px solid transparent",
                }}>
                {tab === "statement" ? "Statement / Ledger" : "Overview"}
              </button>
            ))}
          </div>

          {activeTab === "statement" ? (
            <div style={{ marginBottom: 24 }}>
              {statementLoading ? (
                <div style={{ fontSize: 13, color: "#6b7280" }}>Loading statement…</div>
              ) : statementError ? (
                <div style={{ background: "#fef2f2", color: "#991b1b", padding: "8px 12px", borderRadius: 6, fontSize: 13 }}>{statementError}</div>
              ) : statement ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                      Outstanding: ₹{Number(statement.summary?.total || 0).toFixed(2)}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          const cols = ["date", "type", "ref", "debit", "credit", "runningBalance"];
                          const csv = toCSV(statement.lines.map(l => ({
                            date: l.date ? new Date(l.date).toLocaleDateString("en-IN") : "-",
                            type: l.type, ref: l.ref,
                            debit: Number(l.debit || 0).toFixed(2), credit: Number(l.credit || 0).toFixed(2),
                            runningBalance: Number(l.runningBalance || 0).toFixed(2),
                          })), cols);
                          downloadBlob(csv, `${c.name.replace(/\s+/g, "_")}_statement.csv`, "text/csv");
                        }}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => {
                          const rows = statement.lines.map(l => `<tr>
                            <td>${l.date ? new Date(l.date).toLocaleDateString("en-IN") : "-"}</td>
                            <td>${l.type}</td><td>${l.ref}</td>
                            <td>${Number(l.debit || 0).toFixed(2)}</td>
                            <td>${Number(l.credit || 0).toFixed(2)}</td>
                            <td>${Number(l.runningBalance || 0).toFixed(2)}</td>
                          </tr>`).join("");
                          printHTML(`Statement — ${c.name}`,
                            `<table><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody>${rows}</tbody></table>`
                          );
                        }}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        Print / PDF
                      </button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid #f3f4f6", borderRadius: 8 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", position: "sticky", top: 0 }}>
                          <th style={{ textAlign: "left", padding: "8px 10px" }}>Date</th>
                          <th style={{ textAlign: "left", padding: "8px 10px" }}>Description</th>
                          <th style={{ textAlign: "left", padding: "8px 10px" }}>Reference</th>
                          <th style={{ textAlign: "right", padding: "8px 10px" }}>Debit</th>
                          <th style={{ textAlign: "right", padding: "8px 10px" }}>Credit</th>
                          <th style={{ textAlign: "right", padding: "8px 10px" }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statement.lines.map((l, i) => (
                          <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "8px 10px" }}>{l.date ? new Date(l.date).toLocaleDateString("en-IN") : "-"}</td>
                            <td style={{ padding: "8px 10px" }}>{l.type}</td>
                            <td style={{ padding: "8px 10px" }}>{l.ref}</td>
                            <td style={{ padding: "8px 10px", textAlign: "right" }}>{Number(l.debit || 0) > 0 ? Number(l.debit).toFixed(2) : ""}</td>
                            <td style={{ padding: "8px 10px", textAlign: "right" }}>{Number(l.credit || 0) > 0 ? Number(l.credit).toFixed(2) : ""}</td>
                            <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600 }}>{Number(l.runningBalance || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#6b7280" }}>No statement data.</div>
              )}
            </div>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {[
              { label: "Mobile",       value: c.mobile },
              { label: "Email",         value: c.email },
              { label: "Landline",      value: c.landline || "—" },
              { label: "Alt Phone",     value: c.altPhone || "—" },
              { label: "Tax Number",    value: c.taxNumber },
              { label: "Pay Term",      value: c.payTerm },
              { label: "Address",       value: [c.address, c.city, c.state].filter(v => v && v !== "—").join(", ") || "—" },
              { label: "Added On",      value: c.addedOn },
              { label: "Assigned To",   value: c.assignedTo || "—" },
              { label: "Country / ZIP", value: [c.country, c.zip].filter(Boolean).join(" - ") || "—" },
              // Was reading the static c.totalPurchaseDue field, which the
              // backend only ever computes for Suppliers (fetchContactById
              // skips it entirely for Customers, leaving it stuck at the
              // stored — and never updated — DB column value of 0). Also,
              // even the supplier-side static value ignored opening_balance
              // and purchase_returns. Switched both to the same live
              // `outstanding` data (opening balance + invoices/purchases −
              // payments − returns) this modal already fetches and uses
              // elsewhere for the Statement tab and payment flow — single
              // source of truth, correct for both contact types.
              {
                label: isCustomer ? "Total Sale Due" : "Total Purchase Due",
                value: outstandingLoading
                  ? "Loading…"
                  : `₹${Number((isCustomer ? custData?.total : supData?.total) || 0).toFixed(2)}`,
              },
              ...(isSupplier ? [{
                label: "Total Purchase Return Due",
                value: outstandingLoading ? "Loading…" : `₹${Number(supData?.returns || 0).toFixed(2)}`,
              }] : []),
            ].map((row) => (
              <div key={row.label} style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
          )}

          {c.persons?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact Persons</div>
              {c.persons.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: "#6b7280" }}>{p.mobile}</span>
                  <span style={{ color: "#6b7280" }}>{p.email}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
            {canEdit && <button style={greenBtn} onClick={onEdit}>Edit</button>}
            <button onClick={onClose} style={darkBtn}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function SuppliersPage() {
  const { hasPermission, isAdmin } = usePermissions();
  const canAdd    = isAdmin || hasPermission("Supplier", "Add supplier");
  const canEdit   = isAdmin || hasPermission("Supplier", "Edit supplier");
  const canDelete = isAdmin || hasPermission("Supplier", "Delete supplier");

  // FIXED: pass "Suppliers" (capitalized) — matches DB values
  const { contacts, groups, stats, loading, errorMsg, total, page, setPage, showEntries, setShowEntries, search, setSearch, setFilterParams, reload } = useContactsData("Suppliers");
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [viewContact, setViewContact] = useState(null);
  const [selected, setSelected] = useState([]);
const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
const toggleAll = () => setSelected(selected.length === contacts.length && contacts.length > 0 ? [] : contacts.map(c => c.id));
const handleDeleteSelected = async () => {
  if (!selected.length) { alert("Select at least one contact"); return; }
  if (!window.confirm(`Delete ${selected.length} supplier(s)? This cannot be undone.`)) return;
  try {
    await Promise.all(selected.map(id => apiDeleteContact(id)));
    setSelected([]);
    reload();
  } catch (err) { alert(err.message || "Failed to delete selected suppliers."); }
};

  const colList = ["Contact ID", "Business Name", "Name", "Email", "Tax number", "Pay term", "Opening Balance", "Advance Balance", "Added On", "Address", "Mobile", "Total Purchase Due", "Total Purchase Return Due"];
  const [colVisible, setColVisible] = useState({});

  const buildTableHTML = () => `<table border="1" cellpadding="8"><tr>${colList.map((h) => `<th>${h}</th>`).join("")}</tr>${contacts.map((c) => `<tr><td>${c.contactId}</td><td>${c.businessName}</td><td>${c.name}</td><td>${c.email}</td><td>${c.taxNumber}</td><td>${c.payTerm}</td><td>${c.openingBalance}</td><td>${c.advanceBalance}</td><td>${c.addedOn}</td><td>${c.address}</td><td>${c.mobile}</td><td>${c.totalPurchaseDue}</td><td>${c.totalPurchaseReturnDue}</td></tr>`).join("")}</table>`;
  const csvKeys = ["contactId", "businessName", "name", "email", "taxNumber", "payTerm", "openingBalance", "advanceBalance", "addedOn", "address", "mobile", "totalPurchaseDue", "totalPurchaseReturnDue"];

  const handleSave = async (formData) => {
    const payload = mapToPayload({ ...formData, contactType: formData.contactType || "Suppliers" });
    if (editContact) { await apiUpdateContact(editContact.id, payload); }
    else { await apiCreateContact(payload); }
    setShowModal(false); setEditContact(null); reload();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try { await apiDeleteContact(id); reload(); }
    catch (err) { alert(err.message || "Failed to delete."); }
  };

  return (
    <div style={pageStyle}>
     <PageHeader title="Suppliers" subtitle="Manage your Suppliers" onAdd={canAdd ? () => { setEditContact(null); setShowModal(true); } : null} />
      <DashboardCards stats={stats} />
      <AdvancedFilter onFilter={setFilterParams} type="supplier" groups={groups} />

      <div style={card}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1a202c" }}>All your Suppliers</h3>
        {errorMsg && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>⚠ {errorMsg}</div>}
{selected.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 16px" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#dc2626" }}>{selected.length} selected</span>
            <button onClick={handleDeleteSelected} style={{ background:"#dc2626", color:"#fff", border:"none", borderRadius:6, padding:"7px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Delete Selected</button>
            <button onClick={()=>setSelected([])} style={xBtn}>Clear Selection</button>
          </div>
        )}
        <ExportBar onCSV={() => downloadBlob(toCSV(contacts, csvKeys), "suppliers.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(contacts, csvKeys), "suppliers.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Suppliers", buildTableHTML())}
          onPDF={() => printHTML("Suppliers - PDF Export", buildTableHTML())}
          columns={colList} colVisible={colVisible} setColVisible={setColVisible} />

        <TableControls showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch} />
<div>
          <table style={{ ...tbl, tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#f7fafc" }}>
                <th style={th}><input type="checkbox" checked={selected.length===contacts.length && contacts.length>0} onChange={toggleAll} /></th>
                {colList.map((h) => colVisible[h] !== true && <th key={h} style={th}>{h}</th>)}
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={14} style={emptyCell}>Loading...</td></tr>
                : contacts.length === 0
                  ? <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>
               : contacts.map((c) => (
                    <tr key={c.id} className="tr-hover">
                      <td style={td}><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggleSelect(c.id)} /></td>
                      {colVisible["Contact ID"] !== true && <td style={td}>{c.contactId}</td>}
                      {colVisible["Business Name"] !== true && <td style={td}>{c.businessName || "—"}</td>}
                      {colVisible["Name"] !== true && <td style={td}><strong>{c.name}</strong></td>}
                      {colVisible["Email"] !== true && <td style={td}>{c.email}</td>}
                      {colVisible["Tax number"] !== true && <td style={td}>{c.taxNumber}</td>}
                      {colVisible["Pay term"] !== true && <td style={td}>{c.payTerm}</td>}
                      {colVisible["Opening Balance"] !== true && <td style={td}>{c.openingBalance}</td>}
                      {colVisible["Advance Balance"] !== true && <td style={td}>{c.advanceBalance}</td>}
                      {colVisible["Added On"] !== true && <td style={td}>{c.addedOn}</td>}
                      {colVisible["Address"] !== true && <td style={{ ...td, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{c.address}</td>}
                      {colVisible["Mobile"] !== true && <td style={td}>{c.mobile}</td>}
                      {colVisible["Total Purchase Due"] !== true && <td style={{ ...td, color: "#dc2626", fontWeight: 600 }}>{c.totalPurchaseDue}</td>}
                      {colVisible["Total Purchase Return Due"] !== true && <td style={{ ...td, color: "#d97706" }}>{c.totalPurchaseReturnDue}</td>}
                  <td style={{ ...td, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                         <button
  title="View"
  onClick={async () => {
    try {
      const full = await apiGetContactById(c.id);
      setViewContact(mapContact(full));
    } catch {
      setViewContact(c);
    }
  }}
  style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 4, display: "inline-flex" }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
</button>
{canEdit && (
  <button
    title="Edit"
    onClick={async () => {
      try {
        const full = await apiGetContactById(c.id);
        setEditContact(mapContact(full));
      } catch {
        setEditContact(c);
      }
      setShowModal(true);
    }}
    style={{ background: "none", border: "none", cursor: "pointer", color: "#d97706", padding: 4, display: "inline-flex" }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  </button>
)}
{canDelete && (
  <button
    title="Delete"
    onClick={() => handleDelete(c.id)}
    style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4, display: "inline-flex" }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  </button>
)}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <PaginationRow page={page} setPage={setPage} showEntries={showEntries} total={total} />
      </div>  

   {viewContact && (
        <ContactDetailModal
          c={viewContact}
          canEdit={canEdit}
          onClose={() => setViewContact(null)}
          onEdit={async () => {
            setViewContact(null);
            try {
              const full = await apiGetContactById(viewContact.id);
              setEditContact(mapContact(full));
            } catch {
              setEditContact(viewContact);
            }
            setShowModal(true);
          }}
        />
      )}
      {showModal && (
        <AddContactModal defaultType="Suppliers" editContact={editContact} groups={groups}
          onSave={handleSave} onClose={() => { setShowModal(false); setEditContact(null); }} />
      )}
      <style>{hoverCss}</style>
    </div>
  );
}

// ─── CUSTOMERS PAGE ───────────────────────────────────────────────────────────
export function CustomersPage() {
  const { hasPermission, isAdmin } = usePermissions();
  const canAdd    = isAdmin || hasPermission("Customer", "Add customer");
  const canEdit   = isAdmin || hasPermission("Customer", "Edit customer");
  const canDelete = isAdmin || hasPermission("Customer", "Delete customer");

  // FIXED: pass "Customers" (capitalized) — matches DB values
  const { contacts, groups, stats, loading, errorMsg, total, page, setPage, showEntries, setShowEntries, search, setSearch, setFilterParams, reload } = useContactsData("Customers");
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [viewContact, setViewContact] = useState(null);
  const [selected, setSelected] = useState([]);
const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
const toggleAll = () => setSelected(selected.length === contacts.length && contacts.length > 0 ? [] : contacts.map(c => c.id));
const handleDeleteSelected = async () => {
  if (!selected.length) { alert("Select at least one contact"); return; }
  if (!window.confirm(`Delete ${selected.length} customer(s)? This cannot be undone.`)) return;
  try {
    await Promise.all(selected.map(id => apiDeleteContact(id)));
    setSelected([]);
    reload();
  } catch (err) { alert(err.message || "Failed to delete selected customers."); }
};

  const colList = ["Contact ID", "Business Name", "Name", "Email", "Tax number", "Credit Limit", "Pay term", "Opening Balance", "Advance Balance", "Added On", "Customer Group", "Address", "Mobile"];
  const [colVisible, setColVisible] = useState({});

  const buildTableHTML = () => `<table border="1" cellpadding="8"><tr>${colList.map((h) => `<th>${h}</th>`).join("")}</tr>${contacts.map((c) => `<tr><td>${c.contactId}</td><td>${c.businessName}</td><td>${c.name}</td><td>${c.email}</td><td>${c.taxNumber}</td><td>${c.creditLimit}</td><td>${c.payTerm}</td><td>${c.openingBalance}</td><td>${c.advanceBalance}</td><td>${c.addedOn}</td><td>${c.customerGroup}</td><td>${c.address}</td><td>${c.mobile}</td></tr>`).join("")}</table>`;
  const csvKeys = ["contactId", "businessName", "name", "email", "taxNumber", "creditLimit", "payTerm", "openingBalance", "advanceBalance", "addedOn", "customerGroup", "address", "mobile"];

  const handleSave = async (formData) => {
    const payload = mapToPayload({ ...formData, contactType: formData.contactType || "Customers" });
    if (editContact) { await apiUpdateContact(editContact.id, payload); }
    else { await apiCreateContact(payload); }
    setShowModal(false); setEditContact(null); reload();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try { await apiDeleteContact(id); reload(); }
    catch (err) { alert(err.message || "Failed to delete."); }
  };

return (
    <div style={pageStyle}>
      <PageHeader title="Customers" subtitle="Manage your Customers" onAdd={canAdd ? () => { setEditContact(null); setShowModal(true); } : null} />
<DashboardCards
        stats={{
          totalSuppliers: stats?.totalSuppliers ?? 0,
          totalPurchaseDue: stats?.totalPurchaseDue ?? 0,
          totalCustomers: stats?.totalCustomers ?? 0,
          totalCustomerGroups: stats?.totalCustomerGroups ?? 0,
        }}
      />
      <AdvancedFilter onFilter={setFilterParams} type="customer" groups={groups} />

      <div style={card}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1a202c" }}>All your Customers</h3>
        {errorMsg && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>⚠ {errorMsg}</div>}

      {selected.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 16px" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#dc2626" }}>{selected.length} selected</span>
            <button onClick={handleDeleteSelected} style={{ background:"#dc2626", color:"#fff", border:"none", borderRadius:6, padding:"7px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Delete Selected</button>
            <button onClick={()=>setSelected([])} style={xBtn}>Clear Selection</button>
          </div>
        )}
        <ExportBar onCSV={() => downloadBlob(toCSV(contacts, csvKeys), "customers.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(contacts, csvKeys), "customers.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Customers", buildTableHTML())}
          onPDF={() => printHTML("Customers - PDF Export", buildTableHTML())}
          columns={colList} colVisible={colVisible} setColVisible={setColVisible} />

        <TableControls showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch} />
<div>
          <table style={{ ...tbl, tableLayout: "fixed" }}>
            <thead>
             <tr style={{ background: "#f7fafc" }}>
                <th style={th}><input type="checkbox" checked={selected.length===contacts.length && contacts.length>0} onChange={toggleAll} /></th>
                {colList.map((h) => colVisible[h] !== true && <th key={h} style={th}>{h}</th>)}
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={14} style={emptyCell}>Loading...</td></tr>
                : contacts.length === 0
                  ? <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>
               : contacts.map((c) => (
                    <tr key={c.id} className="tr-hover">
                      <td style={td}><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggleSelect(c.id)} /></td>
                      {colVisible["Contact ID"] !== true && <td style={td}>{c.contactId}</td>}
                      {colVisible["Business Name"] !== true && <td style={td}>{c.businessName || "—"}</td>}
                      {colVisible["Name"] !== true && <td style={td}><strong>{c.name}</strong></td>}
                      {colVisible["Email"] !== true && <td style={td}>{c.email}</td>}
                      {colVisible["Tax number"] !== true && <td style={td}>{c.taxNumber}</td>}
                      {colVisible["Credit Limit"] !== true && <td style={{ ...td, color: "#16a34a", fontWeight: 600 }}>{c.creditLimit}</td>}
                      {colVisible["Pay term"] !== true && <td style={td}>{c.payTerm}</td>}
                      {colVisible["Opening Balance"] !== true && <td style={td}>{c.openingBalance}</td>}
                      {colVisible["Advance Balance"] !== true && <td style={td}>{c.advanceBalance}</td>}
                      {colVisible["Added On"] !== true && <td style={td}>{c.addedOn}</td>}
                      {colVisible["Customer Group"] !== true && <td style={td}>
                        {c.customerGroup && c.customerGroup !== "—"
                          ? <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: 10, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{c.customerGroup}</span>
                          : "—"}
                      </td>}
                      {colVisible["Address"] !== true && <td style={{ ...td, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{c.address}</td>}
                      {colVisible["Mobile"] !== true && <td style={td}>{c.mobile}</td>}
                      <td style={{ ...td, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                          <button
                            title="View"
                            onClick={async () => {
                              try {
                                const full = await apiGetContactById(c.id);
                                setViewContact(mapContact(full));
                              } catch {
                                setViewContact(c);
                              }
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: 16, padding: 2 }}
                          >👁</button>
                          {canEdit && (
                            <button
                              title="Edit"
                              onClick={async () => {
                                try {
                                  const full = await apiGetContactById(c.id);
                                  setEditContact(mapContact(full));
                                } catch {
                                  setEditContact(c);
                                }
                                setShowModal(true);
                              }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#d97706", fontSize: 16, padding: 2 }}
                            >✎</button>
                          )}
                          {canDelete && (
                            <button
                              title="Delete"
                              onClick={() => handleDelete(c.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16, padding: 2 }}
                            >🗑</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <PaginationRow page={page} setPage={setPage} showEntries={showEntries} total={total} />
      </div>

      {viewContact && (
        <ContactDetailModal
          c={viewContact}
          canEdit={canEdit}
          onClose={() => setViewContact(null)}
          onEdit={async () => {
            setViewContact(null);
            try {
              const full = await apiGetContactById(viewContact.id);
              setEditContact(mapContact(full));
            } catch {
              setEditContact(viewContact);
            }
            setShowModal(true);
          }}
        />
      )}
      {showModal && (
        <AddContactModal defaultType="Customers" editContact={editContact} groups={groups}
          onSave={handleSave} onClose={() => { setShowModal(false); setEditContact(null); }} />
      )}
      <style>{hoverCss}</style>
    </div>
  );
}


export function CustomerGroupsPage() {
  const { hasPermission, isAdmin } = usePermissions();
  const canAdd    = isAdmin || hasPermission("Customer", "Add customer");
  const canDelete = isAdmin || hasPermission("Customer", "Delete customer");

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [viewGroup, setViewGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [sellingPriceGroupId, setSellingPriceGroupId] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [colVisible, setColVisible] = useState({});
  const [saving, setSaving] = useState(false);

  // NEW — real Selling Price Groups, for the "Linked Selling Price Group" dropdown
  const [sellingPriceGroups, setSellingPriceGroups] = useState([]);
const gpBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";
  const gpAuthHeaders = () => {
    const token = localStorage.getItem("manod_token");
    const industryId = localStorage.getItem("manod_active_industry_id");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(industryId ? { "X-Industry-Id": industryId } : {}),
    };
  };
  const loadSellingPriceGroups = useCallback(async () => {
    try {
      const res = await fetch(`${gpBase}/selling-price-groups?limit=100`, { headers: gpAuthHeaders() });
      const data = await res.json();
      setSellingPriceGroups(data.groups || []);
    } catch (e) { console.error("Failed to load selling price groups:", e.message); }
  }, []);

  const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#374151" };
  const inp = { border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };

  const load = useCallback(async () => {
    setLoading(true); setErrorMsg("");
    try { const data = await getAllGroups(); setGroups(data || []); }
    catch (err) { setErrorMsg(err.message || "Failed to load customer groups."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); loadSellingPriceGroups(); }, [load, loadSellingPriceGroups]);

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const colList = ["Customer Group Name", "Selling Price Group", "Description"];

  const resetForm = () => {
    setGroupName(""); setSellingPriceGroupId(""); setDescription(""); setEditGroup(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

const handleSave = async () => {
    if (!groupName.trim()) return alert("Customer Group Name is required.");
    setSaving(true);
    try {
      const payload = {
        name: groupName,
        sellingPriceGroupId: sellingPriceGroupId || null,
        description,
      };
      if (editGroup) await apiUpdateGroup(editGroup.id, payload);
      else await apiCreateGroup(payload);
      setShowModal(false); resetForm();
      load();
    } catch (err) {
      const msg = err.message || "Failed to save group.";
      alert(msg.includes("already exists") ? `⚠ ${msg}. Please choose a different name.` : msg);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await apiDeleteGroup(id); load(); }
    catch (err) { alert(err.message || "Failed to delete."); }
  };

  const csvKeys = ["name", "selling_price_group_name", "description"];
  const buildTableHTML = () => `<table border="1" cellpadding="8"><tr><th>Group Name</th><th>Selling Price Group</th><th>Description</th></tr>${filtered.map((g) => `<tr><td>${g.name}</td><td>${g.selling_price_group_name || "—"}</td><td>${g.description || ""}</td></tr>`).join("")}</table>`;

  return (
    <div style={pageStyle}>
      <PageHeader title="Customer Groups" subtitle="Manage customer groups & their linked Selling Price Group" onAdd={canAdd ? openAdd : null} />

      <div style={card}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1a202c" }}>All Customer Groups</h3>
        {errorMsg && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>⚠ {errorMsg}</div>}

        <ExportBar
          onCSV={() => downloadBlob(toCSV(filtered, csvKeys), "customer_groups.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(filtered, csvKeys), "customer_groups.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Customer Groups", buildTableHTML())}
          onPDF={() => printHTML("Customer Groups - PDF", buildTableHTML())}
          columns={colList} colVisible={colVisible} setColVisible={setColVisible} />

        <TableControls showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch} />

        <table style={tbl}>
          <thead>
            <tr style={{ background: "#f7fafc" }}>
              {colList.map((h) => colVisible[h] !== true && <th key={h} style={th}>{h}</th>)}
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={emptyCell}>Loading...</td></tr>
              : filtered.slice(0, showEntries).length === 0
                ? <tr><td colSpan={4} style={emptyCell}>No data available in table</td></tr>
                : filtered.slice(0, showEntries).map((g) => (
                  <tr key={g.id} className="tr-hover">
                    {colVisible["Customer Group Name"] !== true && <td style={td}><strong>{g.name}</strong></td>}
                    {colVisible["Selling Price Group"] !== true && (
                      <td style={td}>
                        {g.selling_price_group_name
                          ? <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{g.selling_price_group_name}</span>
                          : <span style={{ color: "#9ca3af" }}>— Not linked —</span>}
                      </td>
                    )}
                    {colVisible["Description"] !== true && <td style={{ ...td, color: "#6b7280", maxWidth: 280 }}>{g.description || "—"}</td>}
                    <td style={td}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button title="View" onClick={() => setViewGroup(g)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 4, display: "inline-flex" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {canAdd && (
                          <button title="Edit" onClick={() => {
                            setEditGroup(g);
                            setGroupName(g.name);
                            setSellingPriceGroupId(g.selling_price_group_id ? String(g.selling_price_group_id) : "");
                            setDescription(g.description || "");
                            setShowModal(true);
                          }} style={{ background: "none", border: "none", cursor: "pointer", color: "#d97706", padding: 4, display: "inline-flex" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                            </svg>
                          </button>
                        )}
                        {canDelete && (
                          <button title="Delete" onClick={() => handleDelete(g.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4, display: "inline-flex" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        <div style={tableFooter}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: "min(500px, 94vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", position: "relative" }}>
            <button onClick={() => { setShowModal(false); resetForm(); }} style={{ position: "absolute", right: 18, top: 14, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280" }}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 18, fontWeight: 700 }}>{editGroup ? "Edit Customer Group" : "Add Customer Group"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>Customer Group Name: <span style={{ color: "#e53e3e" }}>*</span></label>
                <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. VIP, Wholesale" style={inp} />
              </div>
              <div>
                <label style={lbl}>Linked Selling Price Group:</label>
                <select value={sellingPriceGroupId} onChange={(e) => setSellingPriceGroupId(e.target.value)} style={inp}>
                  <option value="">— No Selling Price Group linked (use default price) —</option>
                  {sellingPriceGroups.map((spg) => (
                    <option key={spg.id} value={spg.id}>
                      {spg.name} ({spg.type} {spg.percentage}%){spg.is_default ? " ★ Default" : ""}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  Customers in this group automatically get product prices from this Selling Price Group during Sales, Quotations, Invoices and POS.
                </div>
              </div>
              <div>
                <label style={lbl}>Description:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes about this group" rows={3}
                  style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
              <button onClick={handleSave} disabled={saving} style={{ ...greenBtn, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "💾 Save"}</button>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={darkBtn}>Close</button>
            </div>
          </div>
        </div>
      )}

      {viewGroup && (
        <div style={overlayStyle}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: "min(460px, 94vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", position: "relative" }}>
            <button onClick={() => setViewGroup(null)} style={{ position: "absolute", right: 18, top: 14, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280" }}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, fontWeight: 700 }}>{viewGroup.name}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div><span style={{ color: "#9ca3af", fontWeight: 600 }}>Selling Price Group: </span>{viewGroup.selling_price_group_name || "— Not linked —"}</div>
              <div><span style={{ color: "#9ca3af", fontWeight: 600 }}>Description: </span>{viewGroup.description || "—"}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
              {canAdd && <button style={greenBtn} onClick={() => {
                const g = viewGroup;
                setViewGroup(null);
                setEditGroup(g);
                setGroupName(g.name);
                setSellingPriceGroupId(g.selling_price_group_id ? String(g.selling_price_group_id) : "");
                setDescription(g.description || "");
                setShowModal(true);
              }}>Edit</button>}
              <button onClick={() => setViewGroup(null)} style={darkBtn}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{hoverCss}</style>
    </div>
  );
}

// ─── IMPORT CONTACTS PAGE ─────────────────────────────────────────────────────
const instructions = [
  { col: 1,  name: "Contact type",              required: true,  instruction: "1 = Customer\n2 = Supplier\n3 = Both" },
  { col: 2,  name: "Prefix",                    required: false, instruction: "" },
  { col: 3,  name: "First Name",                required: true,  instruction: "" },
  { col: 4,  name: "Middle name",               required: false, instruction: "" },
  { col: 5,  name: "Last Name",                 required: false, instruction: "" },
  { col: 6,  name: "Business name",             required: false, instruction: "" },
  { col: 7,  name: "Tax number",                required: false, instruction: "" },
  { col: 8,  name: "Email",                     required: false, instruction: "" },
  { col: 9,  name: "Mobile",                    required: true,  instruction: "" },
  { col: 10, name: "Alternate contact number",  required: false, instruction: "" },
  { col: 11, name: "City",                      required: false, instruction: "" },
  { col: 12, name: "State",                     required: false, instruction: "" },
  { col: 13, name: "Country",                   required: false, instruction: "" },
  { col: 14, name: "Address line 1",            required: false, instruction: "" },
  { col: 15, name: "Address line 2",            required: false, instruction: "" },
  { col: 16, name: "Zip code",                  required: false, instruction: "" },
  { col: 17, name: "Contact ID",                required: false, instruction: "Leave empty to auto-generate" },
  { col: 18, name: "Pay term number",           required: false, instruction: "" },
  { col: 19, name: "Pay term type",             required: false, instruction: "days / months" },
  { col: 20, name: "Opening balance",           required: false, instruction: "" },
  { col: 21, name: "Customer group name",       required: false, instruction: "Must exist in system" },
];

export function ImportContactsPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!file) return alert("Please choose a file to import.");
    setUploading(true); setResult(null);
    try {
      const rows = await parseCSVFile(file);
      const res = await apiImportContacts(rows);
      setResult(res); setFile(null);
    } catch (err) {
      alert(err.message || "Import failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = instructions.map((r) => r.name).join(",");
    downloadBlob(headers + "\n", "contacts_template.csv", "text/csv");
  };

  return (
    <div style={pageStyle}>
      <PageHeader title="Import Contacts" subtitle="Bulk import contacts from CSV" />

      <div style={{ ...card, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Upload File</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginRight: 10, color: "#374151" }}>File To Import:</label>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ fontSize: 13 }} />
          </div>
          <button onClick={handleSubmit} disabled={uploading} style={{ ...greenBtn, opacity: uploading ? 0.7 : 1 }}>
            {uploading ? "Importing..." : "Submit"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 16, background: result.failed > 0 ? "#fffbeb" : "#f0fdf4", border: `1px solid ${result.failed > 0 ? "#fde68a" : "#bbf7d0"}`, borderRadius: 8, padding: 14, fontSize: 13 }}>
            ✅ Imported: <strong>{result.created}</strong>&nbsp;
            {result.failed > 0 && <>⚠ Failed: <strong>{result.failed}</strong></>}
            {result.errors?.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {result.errors.slice(0, 10).map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
              </ul>
            )}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button onClick={handleDownloadTemplate} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: GREEN_SHADOW }}>
            ⬇️ Download template file
          </button>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>Instructions</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>
          <strong>Carefully follow the instructions before importing the file.</strong><br />
          The columns of the CSV file should be in the following order.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...tbl, fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7fafc" }}>
                {["Column No.", "Column Name", "Instruction"].map((h) => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {instructions.map((row) => (
                <tr key={row.col} className="tr-hover">
                  <td style={td}>{row.col}</td>
                  <td style={td}>
                    {row.name}&nbsp;
                    {row.required
                      ? <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 4, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>Required</span>
                      : <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>Optional</span>}
                  </td>
                  <td style={{ ...td, whiteSpace: "pre-line", color: row.instruction ? "#374151" : "#d1d5db" }}>
                    {row.instruction || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{hoverCss}</style>
    </div>
  );
}

// ─── DEFAULT EXPORT (router) ──────────────────────────────────────────────────
// FIXED: handles both lowercase and capitalized type params robustly
export default function Contacts() {
  const location = useLocation();
  const type = (new URLSearchParams(location.search).get("type") || "").toLowerCase();

  if (type === "customer" || type === "customers") return <CustomersPage />;
  if (type === "groups")                            return <CustomerGroupsPage />;
  if (type === "import")                            return <ImportContactsPage />;
  // "supplier", "suppliers", or anything else → Suppliers
  return <SuppliersPage />;
}

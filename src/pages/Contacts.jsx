import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  getAllContacts, createContact as apiCreateContact, updateContact as apiUpdateContact,
  deleteContact as apiDeleteContact, getContactStats, getAllGroups, createGroup as apiCreateGroup,
  deleteGroup as apiDeleteGroup, importContacts as apiImportContacts, parseCSVFile,
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
  mobile: c.mobile || "—",
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
const th = { padding: "11px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap" };
const td = { padding: "11px 12px", whiteSpace: "nowrap", borderBottom: "1px solid #f3f4f6", color: "#374151" };
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
        <span style={{ ...xIcon, background: "#15803d", fontSize: 10 }}>XLS</span> Export Excel
      </button>
      <button onClick={onPrint} style={xBtn}>
        <span style={{ ...xIcon, background: "#4b5563", fontSize: 13 }}>🖨</span> Print
      </button>
      <div style={{ position: "relative" }} ref={ref}>
        <button onClick={() => setShowColMenu((v) => !v)} style={xBtn}>
          <span style={{ ...xIcon, background: "#7c3aed", fontSize: 13 }}>⊞</span> Column visibility
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
        <span style={{ ...xIcon, background: "#dc2626", fontSize: 10 }}>PDF</span> Export PDF
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
function DashboardCards({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: "Total Suppliers", value: stats.totalSuppliers, color: "#16a34a", icon: "🏭" },
    { label: "Total Customers", value: stats.totalCustomers, color: "#2563eb", icon: "🧑‍🤝‍🧑" },
    { label: "Total Purchase Due", value: `₹${Number(stats.totalPurchaseDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#dc2626", icon: "💰" },
    { label: "Customer Groups", value: stats.totalCustomerGroups, color: "#7c3aed", icon: "📂" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 26, background: `${c.color}1a`, color: c.color, borderRadius: 10, padding: "10px 14px" }}>{c.icon}</div>
          <div>
            <div style={{ fontSize: 13, color: "#718096" }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a202c" }}>{c.value}</div>
          </div>
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
                    <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Sales person name" style={iconInp} />
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [payTerm, setPayTerm] = useState("");
  const [customerGroupId, setCustomerGroupId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const applyFilters = () => onFilter({ name, mobile, city, payTerm, customerGroupId, dateFrom, dateTo });
  const resetFilters = () => {
    setName(""); setMobile(""); setCity(""); setPayTerm("");
    setCustomerGroupId(""); setDateFrom(""); setDateTo("");
    onFilter({});
  };
  const activeCount = [name, mobile, city, payTerm, dateFrom, dateTo, customerGroupId].filter(Boolean).length;

  return (
    <div style={{ background: "#fff", borderRadius: 8, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{open ? "▲" : "▼"} Filters</span>
          {activeCount > 0 && <span style={{ background: "#16a34a", color: "#fff", fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 10 }}>{activeCount} active</span>}
        </div>
        {activeCount > 0 && (
          <button onClick={(e) => { e.stopPropagation(); resetFilters(); }} style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>✕ Clear all</button>
        )}
      </div>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 14 }}>
            <div><label style={fLbl}>Name / Business</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Search name..." style={fInp} /></div>
            <div><label style={fLbl}>Mobile</label><input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" style={fInp} /></div>
            <div><label style={fLbl}>City / Address</label><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Chennai" style={fInp} /></div>
            <div>
              <label style={fLbl}>Pay Term</label>
              <select value={payTerm} onChange={(e) => setPayTerm(e.target.value)} style={fInp}>
                <option value="">All Pay Terms</option>
                <option>7 days</option><option>15 days</option><option>30 days</option><option>45 days</option><option>60 days</option>
              </select>
            </div>
            {type === "customer" && (
              <div>
                <label style={fLbl}>Customer Group</label>
                <select value={customerGroupId} onChange={(e) => setCustomerGroupId(e.target.value)} style={fInp}>
                  <option value="">All Groups</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
            <div><label style={fLbl}>Added From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={fInp} /></div>
            <div><label style={fLbl}>Added To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={fInp} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={applyFilters} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "8px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: GREEN_SHADOW }}>
              🔍 Apply Filters
            </button>
            <button onClick={resetFilters} style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Reset
            </button>
          </div>
        </div>
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
export function SuppliersPage() {
  const { hasPermission, isAdmin } = usePermissions();
  const canAdd    = isAdmin || hasPermission("Supplier", "Add supplier");
  const canEdit   = isAdmin || hasPermission("Supplier", "Edit supplier");
  const canDelete = isAdmin || hasPermission("Supplier", "Delete supplier");

  // FIXED: pass "Suppliers" (capitalized) — matches DB values
  const { contacts, groups, stats, loading, errorMsg, total, page, setPage, showEntries, setShowEntries, search, setSearch, setFilterParams, reload } = useContactsData("Suppliers");
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);

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

        <ExportBar onCSV={() => downloadBlob(toCSV(contacts, csvKeys), "suppliers.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(contacts, csvKeys), "suppliers.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Suppliers", buildTableHTML())}
          onPDF={() => printHTML("Suppliers - PDF Export", buildTableHTML())}
          columns={colList} colVisible={colVisible} setColVisible={setColVisible} />

        <TableControls showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch} />

        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr style={{ background: "#f7fafc" }}>
                <th style={th}>Action</th>
                {colList.map((h) => colVisible[h] !== true && <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={14} style={emptyCell}>Loading...</td></tr>
                : contacts.length === 0
                  ? <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>
                  : contacts.map((c) => (
                    <tr key={c.id} className="tr-hover">
                      <td style={td}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {canEdit && <button style={editBtnStyle} onClick={() => { setEditContact(c); setShowModal(true); }}>✎ Edit</button>}
                          {canDelete && <button style={delBtnStyle} onClick={() => handleDelete(c.id)}>🗑</button>}
                        </div>
                      </td>
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
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <PaginationRow page={page} setPage={setPage} showEntries={showEntries} total={total} />
      </div>

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

  // ── Customer Detail Modal ──
  const DetailModal = ({ c, onClose }) => (
    <div style={overlayStyle}>
      <div style={{ background: "#fff", borderRadius: 14, width: "min(680px, 96vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        {/* Header */}
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
          {/* Balance cards */}
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

          {/* Detail rows */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {[
              { label: "📱 Mobile",       value: c.mobile },
              { label: "✉️ Email",         value: c.email },
              { label: "☎️ Landline",      value: c.landline || "—" },
              { label: "📞 Alt Phone",     value: c.altPhone || "—" },
              { label: "🧾 Tax Number",    value: c.taxNumber },
              { label: "📅 Pay Term",      value: c.payTerm },
              { label: "📌 Address",       value: [c.address, c.city, c.state].filter(v => v && v !== "—").join(", ") || "—" },
              { label: "🗓 Added On",      value: c.addedOn },
              { label: "👤 Assigned To",   value: c.assignedTo || "—" },
              { label: "🏘 Country / ZIP", value: [c.country, c.zip].filter(Boolean).join(" - ") || "—" },
            ].map((row) => (
              <div key={row.label} style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Contact persons */}
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
            {canEdit && <button style={greenBtn} onClick={() => { setViewContact(null); setEditContact(c); setShowModal(true); }}>✎ Edit</button>}
            <button onClick={onClose} style={darkBtn}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <PageHeader title="Customers" subtitle="Manage your Customers" onAdd={canAdd ? () => { setEditContact(null); setShowModal(true); } : null} />
      <DashboardCards stats={stats} />
      <AdvancedFilter onFilter={setFilterParams} type="customer" groups={groups} />

      <div style={card}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1a202c" }}>All your Customers</h3>
        {errorMsg && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>⚠ {errorMsg}</div>}

        <ExportBar onCSV={() => downloadBlob(toCSV(contacts, csvKeys), "customers.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(contacts, csvKeys), "customers.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Customers", buildTableHTML())}
          onPDF={() => printHTML("Customers - PDF Export", buildTableHTML())}
          columns={colList} colVisible={colVisible} setColVisible={setColVisible} />

        <TableControls showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch} />

        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr style={{ background: "#f7fafc" }}>
                <th style={th}>Action</th>
                {colList.map((h) => colVisible[h] !== true && <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={14} style={emptyCell}>Loading...</td></tr>
                : contacts.length === 0
                  ? <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>
                  : contacts.map((c) => (
                    <tr key={c.id} className="tr-hover" style={{ cursor: "pointer" }}>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button style={{ ...editBtnStyle, color: "#2563eb", borderColor: "#93c5fd" }} onClick={() => setViewContact(c)}>👁 View</button>
                          {canEdit && <button style={editBtnStyle} onClick={() => { setEditContact(c); setShowModal(true); }}>✎ Edit</button>}
                          {canDelete && <button style={delBtnStyle} onClick={() => handleDelete(c.id)}>🗑</button>}
                        </div>
                      </td>
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
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <PaginationRow page={page} setPage={setPage} showEntries={showEntries} total={total} />
      </div>

      {viewContact && <DetailModal c={viewContact} onClose={() => setViewContact(null)} />}
      {showModal && (
        <AddContactModal defaultType="Customers" editContact={editContact} groups={groups}
          onSave={handleSave} onClose={() => { setShowModal(false); setEditContact(null); }} />
      )}
      <style>{hoverCss}</style>
    </div>
  );
}

// ─── CUSTOMER GROUPS PAGE ─────────────────────────────────────────────────────
export function CustomerGroupsPage() {
  const { hasPermission, isAdmin } = usePermissions();
  const canAdd    = isAdmin || hasPermission("Customer", "Add customer");
  const canDelete = isAdmin || hasPermission("Customer", "Delete customer");

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [priceCalcType, setPriceCalcType] = useState("Percentage");
  const [calcPercent, setCalcPercent] = useState("");
  const [sellingPriceGroup, setSellingPriceGroup] = useState("");
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [colVisible, setColVisible] = useState({});
  const [saving, setSaving] = useState(false);

  const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#374151" };
  const inp = { border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };

  const load = useCallback(async () => {
    setLoading(true); setErrorMsg("");
    try { const data = await getAllGroups(); setGroups(data || []); }
    catch (err) { setErrorMsg(err.message || "Failed to load customer groups."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const colList = ["Customer Group Name", "Price Calc Type", "Calculation Percentage (%)", "Selling Price Group"];

  const handleSave = async () => {
    if (!groupName.trim()) return alert("Customer Group Name is required.");
    setSaving(true);
    try {
      await apiCreateGroup({ name: groupName, priceCalcType, calcPercent, sellingPriceGroup });
      setShowModal(false); setGroupName(""); setPriceCalcType("Percentage"); setCalcPercent(""); setSellingPriceGroup("");
      load();
    } catch (err) { alert(err.message || "Failed to create group."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await apiDeleteGroup(id); load(); }
    catch (err) { alert(err.message || "Failed to delete."); }
  };

  const csvKeys = ["name", "price_calc_type", "calc_percent", "selling_price_group"];
  const buildTableHTML = () => `<table border="1" cellpadding="8"><tr><th>Group Name</th><th>Type</th><th>Calc %</th><th>Price Group</th></tr>${filtered.map((g) => `<tr><td>${g.name}</td><td>${g.price_calc_type}</td><td>${g.calc_percent}%</td><td>${g.selling_price_group || "—"}</td></tr>`).join("")}</table>`;

  return (
    <div style={pageStyle}>
      <PageHeader title="Customer Groups" subtitle="Manage customer groups & pricing" onAdd={canAdd ? () => setShowModal(true) : null} />

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
            {loading ? <tr><td colSpan={5} style={emptyCell}>Loading...</td></tr>
              : filtered.slice(0, showEntries).length === 0
                ? <tr><td colSpan={5} style={emptyCell}>No data available in table</td></tr>
                : filtered.slice(0, showEntries).map((g) => (
                  <tr key={g.id} className="tr-hover">
                    {colVisible["Customer Group Name"] !== true && <td style={td}><strong>{g.name}</strong></td>}
                    {colVisible["Price Calc Type"] !== true && <td style={td}>{g.price_calc_type}</td>}
                    {colVisible["Calculation Percentage (%)"] !== true && <td style={td}>{g.calc_percent}%</td>}
                    {colVisible["Selling Price Group"] !== true && <td style={td}>{g.selling_price_group || "—"}</td>}
                    <td style={td}>{canDelete && <button style={delBtnStyle} onClick={() => handleDelete(g.id)}>🗑 Delete</button>}</td>
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
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", right: 18, top: 14, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280" }}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 18, fontWeight: 700 }}>Add Customer Group</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={lbl}>Customer Group Name: <span style={{ color: "#e53e3e" }}>*</span></label>
                <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. VIP, Wholesale" style={inp} /></div>
              <div><label style={lbl}>Price calculation type:</label>
                <select value={priceCalcType} onChange={(e) => setPriceCalcType(e.target.value)} style={inp}>
                  <option>Percentage</option><option>Fixed</option><option>Markup</option>
                </select></div>
              <div><label style={lbl}>Calculation Percentage (%):</label>
                <input value={calcPercent} onChange={(e) => setCalcPercent(e.target.value)} placeholder="e.g. 10" type="number" min="0" style={inp} /></div>
              <div><label style={lbl}>Selling Price Group:</label>
                <input value={sellingPriceGroup} onChange={(e) => setSellingPriceGroup(e.target.value)} placeholder="e.g. Wholesale Price" style={inp} /></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
              <button onClick={handleSave} disabled={saving} style={{ ...greenBtn, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "💾 Save"}</button>
              <button onClick={() => setShowModal(false)} style={darkBtn}>Close</button>
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
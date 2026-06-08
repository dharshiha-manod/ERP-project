import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

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

// ─── Export Button Bar (matching image 3 UI) ─────────────────────────────────
function ExportBar({ onCSV, onExcel, onPrint, onPDF, columns, colVisible, setColVisible }) {
  const [showColMenu, setShowColMenu] = useState(false);
  const ref = useRef();

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
                <input type="checkbox" checked={colVisible[col] !== false} style={{ accentColor: "#7c3aed" }}
                  onChange={() => setColVisible((v) => ({ ...v, [col]: v[col] === false }))} />
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

// ─── ADD CONTACT MODAL ────────────────────────────────────────────────────────
function AddContactModal({ defaultType, onSave, onClose, editContact }) {
  const isEdit = !!editContact;
  const init = editContact || {};

  const [contactType, setContactType] = useState(init.contactType || defaultType || "Suppliers");
  const [individual, setIndividual] = useState(init.individual !== false);
  const [contactId, setContactId] = useState(init.contactId || "");
  const [customerGroup, setCustomerGroup] = useState(init.customerGroup || "None");
  const [mobile, setMobile] = useState(init.mobile || "");
  const [altPhone, setAltPhone] = useState(init.altPhone || "");
  const [landline, setLandline] = useState(init.landline || "");
  const [email, setEmail] = useState(init.email === "—" ? "" : (init.email || ""));
  const [assignedTo, setAssignedTo] = useState(init.assignedTo || "");
  const [showMore, setShowMore] = useState(isEdit);
  const [showPersons, setShowPersons] = useState(false);
  const [prefix, setPrefix] = useState(init.prefix || "");
  const [firstName, setFirstName] = useState(init.firstName || "");
  const [middleName, setMiddleName] = useState(init.middleName || "");
  const [lastName, setLastName] = useState(init.lastName || "");
  const [taxNumber, setTaxNumber] = useState(init.taxNumber === "—" ? "" : (init.taxNumber || ""));
  const [payTerm, setPayTerm] = useState(init.payTerm === "—" ? "" : (init.payTerm || ""));
  const [creditLimit, setCreditLimit] = useState(init.creditLimit || "");
  const [openingBalance, setOpeningBalance] = useState(init.openingBalance ? String(init.openingBalance).replace(/[₹,]/g, "") : "");
  const [address, setAddress] = useState(init.address === "—" ? "" : (init.address || ""));
  const [city, setCity] = useState(init.city || "");
  const [state, setState] = useState(init.state || "");
  const [country, setCountry] = useState(init.country || "");
  const [zip, setZip] = useState(init.zip || "");
  const [businessName, setBusinessName] = useState(init.businessName || "");
  const [persons, setPersons] = useState(init.persons || [{ name: "", mobile: "", email: "" }]);

  const handleSave = () => {
    if (!mobile.trim()) return alert("Mobile is required.");
    const fullName = individual
      ? `${prefix ? prefix + " " : ""}${firstName} ${lastName}`.trim() || "—"
      : businessName || "—";
    onSave({
      contactType,
      individual,
      contactId: contactId || "CO" + String(Math.floor(Math.random() * 9000) + 1000),
      businessName: individual ? businessName : businessName,
      name: fullName,
      prefix, firstName, middleName, lastName,
      email: email || "—",
      taxNumber: taxNumber || "—",
      payTerm: payTerm || "—",
      creditLimit: creditLimit ? `₹${Number(creditLimit).toFixed(2)}` : "₹0.00",
      openingBalance: `₹${Number(openingBalance || 0).toFixed(2)}`,
      advanceBalance: init.advanceBalance || "₹0.00",
      addedOn: init.addedOn || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
      address: [address, city, state].filter(Boolean).join(", ") || "—",
      city, state, country, zip,
      mobile: mobile,
      altPhone, landline, assignedTo,
      customerGroup: contactType === "Customers" || contactType === "Both" ? customerGroup : "—",
      totalPurchaseDue: init.totalPurchaseDue || "₹0.00",
      totalPurchaseReturnDue: init.totalPurchaseReturnDue || "₹0.00",
      persons,
    });
  };

  const FieldBox = ({ label, required, children }) => (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color: "#e53e3e" }}> *</span>}:</label>
      {children}
    </div>
  );

  return (
    <div style={overlayStyle}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: "min(720px, 95vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", right: 18, top: 14, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>×</button>
        <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 18, fontWeight: 700, color: "#1a202c" }}>
          {isEdit ? "Edit Contact" : "Add a new contact"}
        </h3>

        {/* Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <FieldBox label="Contact type" required>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>👤</span>
              <select value={contactType} onChange={(e) => setContactType(e.target.value)} style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }}>
                <option>Suppliers</option><option>Customers</option><option>Both</option>
              </select>
            </div>
          </FieldBox>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, paddingBottom: 4 }}>
            {[["Individual", true], ["Business", false]].map(([label, val]) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                <input type="radio" checked={individual === val} onChange={() => setIndividual(val)} /> {label}
              </label>
            ))}
          </div>
          <FieldBox label="Contact ID">
            <div style={{ display: "flex" }}>
              <span style={iconBox}>🪪</span>
              <input value={contactId} onChange={(e) => setContactId(e.target.value)} placeholder="Auto-generate if empty" style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }} />
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Leave empty to auto-generate</div>
          </FieldBox>
        </div>

        {/* Business Name */}
        {!individual && (
          <div style={{ marginBottom: 16 }}>
            <FieldBox label="Business Name" required>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business / Company name" style={inp} />
            </FieldBox>
          </div>
        )}

        {/* Customer Group */}
        {(contactType === "Customers" || contactType === "Both") && (
          <div style={{ marginBottom: 16, maxWidth: 280 }}>
            <FieldBox label="Customer Group">
              <div style={{ display: "flex" }}>
                <span style={iconBox}>👥</span>
                <select value={customerGroup} onChange={(e) => setCustomerGroup(e.target.value)} style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }}>
                  <option>None</option><option>VIP</option><option>Regular</option><option>Wholesale</option><option>Retail</option>
                </select>
              </div>
            </FieldBox>
          </div>
        )}

        {/* Contact fields */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 16 }}>
          <FieldBox label="Mobile" required>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>📱</span>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }} />
            </div>
          </FieldBox>
          <FieldBox label="Alternate contact number">
            <div style={{ display: "flex" }}>
              <span style={iconBox}>📞</span>
              <input value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder="Alternate number" style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }} />
            </div>
          </FieldBox>
          <FieldBox label="Landline">
            <div style={{ display: "flex" }}>
              <span style={iconBox}>☎️</span>
              <input value={landline} onChange={(e) => setLandline(e.target.value)} placeholder="Landline" style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }} />
            </div>
          </FieldBox>
          <FieldBox label="Email">
            <div style={{ display: "flex" }}>
              <span style={iconBox}>✉️</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }} />
            </div>
          </FieldBox>
        </div>

        <div style={{ marginBottom: 16, maxWidth: 320 }}>
          <FieldBox label="Assigned to">
            <div style={{ display: "flex" }}>
              <span style={iconBox}>👤</span>
              <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ ...inp, borderRadius: "0 4px 4px 0", borderLeft: "none" }} />
            </div>
          </FieldBox>
        </div>

        {/* More Information */}
        <button onClick={() => setShowMore(!showMore)} style={toggleBtn}>
          {showMore ? "▲" : "▼"} More Informations
        </button>

        {showMore && (
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 18, margin: "12px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
              {[["Prefix", prefix, setPrefix], ["First Name", firstName, setFirstName], ["Middle Name", middleName, setMiddleName], ["Last Name", lastName, setLastName]].map(([label, val, setter]) => (
                <div key={label}>
                  <label style={lbl}>{label}:</label>
                  <input value={val} onChange={(e) => setter(e.target.value)} placeholder={label} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
              {[["Tax Number", taxNumber, setTaxNumber], ["Pay Term", payTerm, setPayTerm], ["Credit Limit (₹)", creditLimit, setCreditLimit], ["Opening Balance (₹)", openingBalance, setOpeningBalance]].map(([label, val, setter]) => (
                <div key={label}>
                  <label style={lbl}>{label}:</label>
                  <input value={val} onChange={(e) => setter(e.target.value)} placeholder={label} style={inp} type={label.includes("₹") ? "number" : "text"} min="0" />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[["Address", address, setAddress], ["City", city, setCity], ["State", state, setState], ["Country", country, setCountry], ["ZIP", zip, setZip]].map(([label, val, setter]) => (
                <div key={label}>
                  <label style={lbl}>{label}:</label>
                  <input value={val} onChange={(e) => setter(e.target.value)} placeholder={label} style={inp} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Persons */}
        <button onClick={() => setShowPersons(!showPersons)} style={{ ...toggleBtn, background: "#3b82f6", marginTop: 10 }}>
          {showPersons ? "▲" : "▼"} Add Contact Persons
        </button>

        {showPersons && (
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 18, margin: "12px 0" }}>
            {persons.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 10 }}>
                <input value={p.name} onChange={(e) => { const a = [...persons]; a[i] = { ...a[i], name: e.target.value }; setPersons(a); }} placeholder="Name" style={inp} />
                <input value={p.mobile} onChange={(e) => { const a = [...persons]; a[i] = { ...a[i], mobile: e.target.value }; setPersons(a); }} placeholder="Mobile" style={inp} />
                <input value={p.email} onChange={(e) => { const a = [...persons]; a[i] = { ...a[i], email: e.target.value }; setPersons(a); }} placeholder="Email" style={inp} />
                <button onClick={() => setPersons(persons.filter((_, idx) => idx !== i))} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "6px 10px", cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <button onClick={() => setPersons([...persons, { name: "", mobile: "", email: "" }])} style={greenBtn}>
              ＋ Add Person
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          <button onClick={handleSave} style={greenBtn}>{isEdit ? "💾 Update" : "💾 Save"}</button>
          <button onClick={onClose} style={darkBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── SUPPLIERS PAGE ───────────────────────────────────────────────────────────
const initialSuppliers = [
  { contactType: "Suppliers", contactId: "SUP0001", businessName: "Sri Murugan Traders", name: "Mr Rajan K", email: "rajan@srimurugan.com", taxNumber: "29ABCDE1234F1Z5", payTerm: "30 days", openingBalance: "₹12,500.00", advanceBalance: "₹0.00", addedOn: "12/01/2025", address: "42, Gandhi Nagar, Chennai", mobile: "9876543210", totalPurchaseDue: "₹45,200.00", totalPurchaseReturnDue: "₹0.00" },
  { contactType: "Suppliers", contactId: "SUP0002", businessName: "Kavitha Electronics", name: "Ms Kavitha R", email: "kavitha@kelec.in", taxNumber: "33XYZAB5678G2H6", payTerm: "15 days", openingBalance: "₹8,000.00", advanceBalance: "₹2,500.00", addedOn: "03/15/2025", address: "18, Nehru Street, Coimbatore", mobile: "9123456789", totalPurchaseDue: "₹22,750.00", totalPurchaseReturnDue: "₹1,500.00" },
  { contactType: "Suppliers", contactId: "SUP0003", businessName: "Nagercoil Wholesale Hub", name: "Mr Arjun P", email: "arjun@nwh.co.in", taxNumber: "31LMNOP3456H3K7", payTerm: "45 days", openingBalance: "₹0.00", advanceBalance: "₹5,000.00", addedOn: "07/22/2025", address: "5, Market Road, Nagercoil", mobile: "9988776655", totalPurchaseDue: "₹68,000.00", totalPurchaseReturnDue: "₹3,200.00" },
  { contactType: "Suppliers", contactId: "SUP0004", businessName: "Madurai Paper Mart", name: "Mrs Selvi D", email: "selvi@mpm.in", taxNumber: "33PAPMA7890I4J8", payTerm: "7 days", openingBalance: "₹3,200.00", advanceBalance: "₹0.00", addedOn: "11/05/2025", address: "77, Paper Mills Road, Madurai", mobile: "9445678901", totalPurchaseDue: "₹11,300.00", totalPurchaseReturnDue: "₹0.00" },
];

export function SuppliersPage() {
  const [contacts, setContacts] = useState(initialSuppliers);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const colList = ["Contact ID", "Business Name", "Name", "Email", "Tax number", "Pay term", "Opening Balance", "Advance Balance", "Added On", "Address", "Mobile", "Total Purchase Due", "Total Purchase Return Due"];
  const [colVisible, setColVisible] = useState({});

  const filtered = contacts.filter((c) =>
    Object.values(c).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const buildTableHTML = () => `<table border="1" cellpadding="8"><tr>${colList.map((h) => `<th>${h}</th>`).join("")}</tr>
    ${filtered.map((c) => `<tr><td>${c.contactId}</td><td>${c.businessName}</td><td>${c.name}</td><td>${c.email}</td><td>${c.taxNumber}</td><td>${c.payTerm}</td><td>${c.openingBalance}</td><td>${c.advanceBalance}</td><td>${c.addedOn}</td><td>${c.address}</td><td>${c.mobile}</td><td>${c.totalPurchaseDue}</td><td>${c.totalPurchaseReturnDue}</td></tr>`).join("")}</table>`;

  const csvKeys = ["contactId", "businessName", "name", "email", "taxNumber", "payTerm", "openingBalance", "advanceBalance", "addedOn", "address", "mobile", "totalPurchaseDue", "totalPurchaseReturnDue"];

  return (
    <div style={pageStyle}>
      <PageHeader title="Suppliers" subtitle="Manage your Suppliers" onAdd={() => { setEditContact(null); setShowModal(true); }} />

      {/* Filters Bar */}
      <div style={filterBar}><span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>▼ Filters</span></div>

      <div style={card}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1a202c" }}>All your Suppliers</h3>

        <ExportBar
          onCSV={() => downloadBlob(toCSV(filtered, csvKeys), "suppliers.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(filtered, csvKeys), "suppliers.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Suppliers", buildTableHTML())}
          onPDF={() => printHTML("Suppliers - PDF Export", buildTableHTML())}
          columns={colList}
          colVisible={colVisible}
          setColVisible={setColVisible}
        />

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
              {filtered.slice(0, showEntries).length === 0
                ? <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>
                : filtered.slice(0, showEntries).map((c, i) => (
                  <tr key={i} className="tr-hover">
                    <td style={td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={editBtnStyle} onClick={() => { setEditContact(c); setShowModal(true); }}>✎ Edit</button>
                        <button style={delBtnStyle} onClick={() => { if (window.confirm("Delete this supplier?")) setContacts((p) => p.filter((_, idx) => idx !== i)); }}>🗑</button>
                      </div>
                    </td>
                    {colVisible["Contact ID"] !== true && <td style={td}>{c.contactId}</td>}
                    {colVisible["Business Name"] !== true && <td style={td}>{c.businessName}</td>}
                    {colVisible["Name"] !== true && <td style={td}><strong>{c.name}</strong></td>}
                    {colVisible["Email"] !== true && <td style={td}>{c.email}</td>}
                    {colVisible["Tax number"] !== true && <td style={td}>{c.taxNumber}</td>}
                    {colVisible["Pay term"] !== true && <td style={td}>{c.payTerm}</td>}
                    {colVisible["Opening Balance"] !== true && <td style={td}>{c.openingBalance}</td>}
                    {colVisible["Advance Balance"] !== true && <td style={td}>{c.advanceBalance}</td>}
                    {colVisible["Added On"] !== true && <td style={td}>{c.addedOn}</td>}
                    {colVisible["Address"] !== true && <td style={td} style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{c.address}</td>}
                    {colVisible["Mobile"] !== true && <td style={td}>{c.mobile}</td>}
                    {colVisible["Total Purchase Due"] !== true && <td style={{ ...td, color: "#dc2626", fontWeight: 600 }}>{c.totalPurchaseDue}</td>}
                    {colVisible["Total Purchase Return Due"] !== true && <td style={{ ...td, color: "#d97706" }}>{c.totalPurchaseReturnDue}</td>}
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f7fafc", fontWeight: 700, fontSize: 13 }}>
                <td colSpan={12} style={{ padding: "10px 14px", color: "#374151" }}>Total:</td>
                <td style={{ padding: "10px 14px", color: "#dc2626" }}>
                  ₹{filtered.reduce((s, c) => s + parseFloat(c.totalPurchaseDue.replace(/[₹,]/g, "") || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "10px 14px", color: "#d97706" }}>
                  ₹{filtered.reduce((s, c) => s + parseFloat(c.totalPurchaseReturnDue.replace(/[₹,]/g, "") || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={tableFooter}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={pgBtn}>Previous</button>
            <button style={{ ...pgBtn, background: "#16a34a", color: "#fff", borderColor: "#16a34a" }}>1</button>
            <button style={pgBtn}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddContactModal
          defaultType="Suppliers"
          editContact={editContact}
          onSave={(c) => {
            if (editContact) {
              setContacts((p) => p.map((x) => x.contactId === editContact.contactId ? { ...c } : x));
            } else {
              setContacts((p) => [...p, c]);
            }
            setShowModal(false); setEditContact(null);
          }}
          onClose={() => { setShowModal(false); setEditContact(null); }}
        />
      )}
      <style>{hoverCss}</style>
    </div>
  );
}

// ─── CUSTOMERS PAGE ───────────────────────────────────────────────────────────
const initialCustomers = [
  { contactType: "Customers", contactId: "CO0001", businessName: "", name: "Walk-In Customer", email: "—", taxNumber: "—", creditLimit: "₹0.00", payTerm: "—", openingBalance: "₹0.00", advanceBalance: "₹0.00", addedOn: "23/05/2026", customerGroup: "—", address: "—", mobile: "—" },
  { contactType: "Customers", contactId: "CO0002", businessName: "", name: "Ms Anitha Suresh", email: "anitha.s@gmail.com", taxNumber: "—", creditLimit: "₹10,000.00", payTerm: "15 days", openingBalance: "₹0.00", advanceBalance: "₹500.00", addedOn: "01/02/2026", customerGroup: "VIP", address: "12, Rose Street, Nagercoil", mobile: "9876501234" },
  { contactType: "Customers", contactId: "CO0003", businessName: "Chennai Retail Co.", name: "Mr Karthik V", email: "karthik@chennairetail.com", taxNumber: "33CRTKO9012K5L1", creditLimit: "₹50,000.00", payTerm: "30 days", openingBalance: "₹2,000.00", advanceBalance: "₹0.00", addedOn: "18/03/2026", customerGroup: "Wholesale", address: "88, Anna Salai, Chennai", mobile: "9445109876" },
  { contactType: "Customers", contactId: "CO0004", businessName: "", name: "Mrs Leela Devi", email: "leela.d@yahoo.com", taxNumber: "—", creditLimit: "₹5,000.00", payTerm: "7 days", openingBalance: "₹0.00", advanceBalance: "₹200.00", addedOn: "10/04/2026", customerGroup: "Regular", address: "3, MG Road, Tirunelveli", mobile: "9500223344" },
  { contactType: "Customers", contactId: "CO0005", businessName: "Nagercoil Stores", name: "Mr Suresh Babu", email: "suresh@ngstores.in", taxNumber: "31NGSTR4567M6N2", creditLimit: "₹25,000.00", payTerm: "45 days", openingBalance: "₹8,500.00", advanceBalance: "₹1,000.00", addedOn: "05/05/2026", customerGroup: "Wholesale", address: "22, Main Bazar, Nagercoil", mobile: "9789012345" },
];

export function CustomersPage() {
  const [contacts, setContacts] = useState(initialCustomers);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const colList = ["Contact ID", "Business Name", "Name", "Email", "Tax number", "Credit Limit", "Pay term", "Opening Balance", "Advance Balance", "Added On", "Customer Group", "Address", "Mobile"];
  const [colVisible, setColVisible] = useState({});

  const filtered = contacts.filter((c) =>
    Object.values(c).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const buildTableHTML = () => `<table border="1" cellpadding="8"><tr>${colList.map((h) => `<th>${h}</th>`).join("")}</tr>
    ${filtered.map((c) => `<tr><td>${c.contactId}</td><td>${c.businessName}</td><td>${c.name}</td><td>${c.email}</td><td>${c.taxNumber}</td><td>${c.creditLimit}</td><td>${c.payTerm}</td><td>${c.openingBalance}</td><td>${c.advanceBalance}</td><td>${c.addedOn}</td><td>${c.customerGroup}</td><td>${c.address}</td><td>${c.mobile}</td></tr>`).join("")}</table>`;

  const csvKeys = ["contactId", "businessName", "name", "email", "taxNumber", "creditLimit", "payTerm", "openingBalance", "advanceBalance", "addedOn", "customerGroup", "address", "mobile"];

  return (
    <div style={pageStyle}>
      <PageHeader title="Customers" subtitle="Manage your Customers" onAdd={() => { setEditContact(null); setShowModal(true); }} />

      <div style={filterBar}><span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>▼ Filters</span></div>

      <div style={card}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1a202c" }}>All your Customers</h3>

        <ExportBar
          onCSV={() => downloadBlob(toCSV(filtered, csvKeys), "customers.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(filtered, csvKeys), "customers.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Customers", buildTableHTML())}
          onPDF={() => printHTML("Customers - PDF Export", buildTableHTML())}
          columns={colList}
          colVisible={colVisible}
          setColVisible={setColVisible}
        />

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
              {filtered.slice(0, showEntries).map((c, i) => (
                <tr key={i} className="tr-hover">
                  <td style={td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={editBtnStyle} onClick={() => { setEditContact(c); setShowModal(true); }}>✎ Edit</button>
                      <button style={delBtnStyle} onClick={() => { if (window.confirm("Delete this customer?")) setContacts((p) => p.filter((_, idx) => idx !== i)); }}>🗑</button>
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
                    {c.customerGroup && c.customerGroup !== "—" && (
                      <span style={{ background: c.customerGroup === "VIP" ? "#fef3c7" : c.customerGroup === "Wholesale" ? "#eff6ff" : "#f0fdf4", color: c.customerGroup === "VIP" ? "#d97706" : c.customerGroup === "Wholesale" ? "#2563eb" : "#16a34a", borderRadius: 10, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                        {c.customerGroup}
                      </span>
                    )}
                    {(!c.customerGroup || c.customerGroup === "—") && "—"}
                  </td>}
                  {colVisible["Address"] !== true && <td style={{ ...td, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{c.address}</td>}
                  {colVisible["Mobile"] !== true && <td style={td}>{c.mobile}</td>}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={tableFooter}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={pgBtn}>Previous</button>
            <button style={{ ...pgBtn, background: "#16a34a", color: "#fff", borderColor: "#16a34a" }}>1</button>
            <button style={pgBtn}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddContactModal
          defaultType="Customers"
          editContact={editContact}
          onSave={(c) => {
            if (editContact) {
              setContacts((p) => p.map((x) => x.contactId === editContact.contactId ? { ...c, creditLimit: c.creditLimit || "₹0.00" } : x));
            } else {
              setContacts((p) => [...p, { ...c, creditLimit: c.creditLimit || "₹0.00" }]);
            }
            setShowModal(false); setEditContact(null);
          }}
          onClose={() => { setShowModal(false); setEditContact(null); }}
        />
      )}
      <style>{hoverCss}</style>
    </div>
  );
}

// ─── CUSTOMER GROUPS PAGE ─────────────────────────────────────────────────────
const initialGroups = [
  { name: "VIP", calcPercent: "10", priceCalcType: "Percentage", sellingPriceGroup: "Premium" },
  { name: "Wholesale", calcPercent: "20", priceCalcType: "Percentage", sellingPriceGroup: "Wholesale Price" },
  { name: "Regular", calcPercent: "5", priceCalcType: "Percentage", sellingPriceGroup: "Default" },
  { name: "Retail", calcPercent: "0", priceCalcType: "Fixed", sellingPriceGroup: "MRP" },
];

export function CustomerGroupsPage() {
  const [groups, setGroups] = useState(initialGroups);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [priceCalcType, setPriceCalcType] = useState("Percentage");
  const [calcPercent, setCalcPercent] = useState("");
  const [sellingPriceGroup, setSellingPriceGroup] = useState("");
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [colVisible, setColVisible] = useState({});

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const colList = ["Customer Group Name", "Price Calc Type", "Calculation Percentage (%)", "Selling Price Group"];

  const handleSave = () => {
    if (!groupName.trim()) return alert("Customer Group Name is required.");
    setGroups((p) => [...p, { name: groupName, priceCalcType, calcPercent: calcPercent || "0", sellingPriceGroup: sellingPriceGroup || "—" }]);
    setShowModal(false); setGroupName(""); setPriceCalcType("Percentage"); setCalcPercent(""); setSellingPriceGroup("");
  };

  const csvKeys = ["name", "priceCalcType", "calcPercent", "sellingPriceGroup"];
  const buildTableHTML = () => `<table border="1" cellpadding="8"><tr><th>Group Name</th><th>Type</th><th>Calc %</th><th>Price Group</th></tr>${filtered.map((g) => `<tr><td>${g.name}</td><td>${g.priceCalcType}</td><td>${g.calcPercent}%</td><td>${g.sellingPriceGroup}</td></tr>`).join("")}</table>`;

  return (
    <div style={pageStyle}>
      <PageHeader title="Customer Groups" subtitle="Manage customer groups & pricing" onAdd={() => setShowModal(true)} />

      <div style={card}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1a202c" }}>All Customer Groups</h3>

        <ExportBar
          onCSV={() => downloadBlob(toCSV(filtered, csvKeys), "customer_groups.csv", "text/csv")}
          onExcel={() => downloadBlob(toCSV(filtered, csvKeys), "customer_groups.xls", "application/vnd.ms-excel")}
          onPrint={() => printHTML("Customer Groups", buildTableHTML())}
          onPDF={() => printHTML("Customer Groups - PDF", buildTableHTML())}
          columns={colList}
          colVisible={colVisible}
          setColVisible={setColVisible}
        />

        <TableControls showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch} />

        <table style={tbl}>
          <thead>
            <tr style={{ background: "#f7fafc" }}>
              {colList.map((h) => colVisible[h] !== true && <th key={h} style={th}>{h}</th>)}
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showEntries).length === 0
              ? <tr><td colSpan={5} style={emptyCell}>No data available in table</td></tr>
              : filtered.slice(0, showEntries).map((g, i) => (
                <tr key={i} className="tr-hover">
                  {colVisible["Customer Group Name"] !== true && <td style={td}><strong>{g.name}</strong></td>}
                  {colVisible["Price Calc Type"] !== true && <td style={td}>{g.priceCalcType}</td>}
                  {colVisible["Calculation Percentage (%)"] !== true && <td style={td}>{g.calcPercent}%</td>}
                  {colVisible["Selling Price Group"] !== true && <td style={td}>{g.sellingPriceGroup}</td>}
                  <td style={td}>
                    <button style={delBtnStyle} onClick={() => { if (window.confirm("Delete?")) setGroups(groups.filter((_, idx) => idx !== i)); }}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div style={tableFooter}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={pgBtn}>Previous</button>
            <button style={{ ...pgBtn, background: "#16a34a", color: "#fff", borderColor: "#16a34a" }}>1</button>
            <button style={pgBtn}>Next</button>
          </div>
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
              <button onClick={handleSave} style={greenBtn}>💾 Save</button>
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
  { col: 1, name: "Contact type", required: true, instruction: "1 = Customer\n2 = Supplier\n3 = Both" },
  { col: 2, name: "Prefix", required: false, instruction: "" },
  { col: 3, name: "First Name", required: true, instruction: "" },
  { col: 4, name: "Middle name", required: false, instruction: "" },
  { col: 5, name: "Last Name", required: false, instruction: "" },
  { col: 6, name: "Business name", required: false, instruction: "" },
  { col: 7, name: "Tax number", required: false, instruction: "" },
  { col: 8, name: "Email", required: false, instruction: "" },
  { col: 9, name: "Mobile", required: true, instruction: "" },
  { col: 10, name: "Alternate contact number", required: false, instruction: "" },
  { col: 11, name: "City", required: false, instruction: "" },
  { col: 12, name: "State", required: false, instruction: "" },
  { col: 13, name: "Country", required: false, instruction: "" },
  { col: 14, name: "Address line 1", required: false, instruction: "" },
  { col: 15, name: "Address line 2", required: false, instruction: "" },
  { col: 16, name: "Zip code", required: false, instruction: "" },
  { col: 17, name: "Contact ID", required: false, instruction: "Leave empty to auto-generate" },
  { col: 18, name: "Pay term number", required: false, instruction: "" },
  { col: 19, name: "Pay term type", required: false, instruction: "days / months" },
  { col: 20, name: "Opening balance", required: false, instruction: "" },
  { col: 21, name: "Customer group name", required: false, instruction: "Must exist in system" },
];

export function ImportContactsPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = () => {
    if (!file) return alert("Please choose a file to import.");
    setUploading(true);
    setTimeout(() => { setUploading(false); alert(`✅ File "${file.name}" imported successfully!`); setFile(null); }, 1500);
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
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} style={{ fontSize: 13 }} />
          </div>
          <button onClick={handleSubmit} disabled={uploading} style={{ ...greenBtn, opacity: uploading ? 0.7 : 1 }}>
            {uploading ? "Importing..." : "Submit"}
          </button>
        </div>
        <div style={{ marginTop: 20 }}>
          <button onClick={handleDownloadTemplate} style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
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

// ─── DEFAULT EXPORT ───────────────────────────────────────────────────────────
export default function Contacts() {
  const location = useLocation();
  const type = new URLSearchParams(location.search).get("type");
  if (type === "customer") return <CustomersPage />;
  if (type === "groups") return <CustomerGroupsPage />;
  if (type === "import") return <ImportContactsPage />;
  return <SuppliersPage />;
}

// ─── Scroll hook — true once user has scrolled > 60px ────────────────────────
function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = document.getElementById("erp-main-content") || window;
    const onScroll = () => setScrolled((el.scrollTop ?? el.scrollY ?? 0) > threshold);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const GREEN = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
const GREEN_SHADOW = "0 3px 10px rgba(34,197,94,0.35)";

const pageStyle = { fontFamily: "'Segoe UI', sans-serif", background: "#f0f4f1", minHeight: "100vh", paddingTop: 76 };
// stickyHeader is now built inline per page using useScrolled
const pageTitle = { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a202c" };
const pageSubtitle = { fontSize: 13, color: "#718096" };
// addBtn is rendered conditionally via scrolled state — see PageHeader component below
const filterBar = { background: "#fff", borderRadius: 8, padding: "10px 16px", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer" };
const card = { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 20 };
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = { padding: "11px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap" };
const td = { padding: "11px 12px", whiteSpace: "nowrap", borderBottom: "1px solid #f3f4f6", color: "#374151" };
const emptyCell = { textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 };
const pgBtn = { border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13, color: "#4a5568" };
const tableFooter = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13, color: "#6b7280", flexWrap: "wrap", gap: 10 };
const xBtn = { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 13px", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500, transition: "background 0.15s" };
const xIcon = { borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700, lineHeight: "17px", color: "#fff" };
const colMenuStyle = { position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 210, padding: "4px 0" };
const selectStyle = { border: "1px solid #d1d5db", borderRadius: 4, padding: "3px 8px", fontSize: 13 };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#374151" };
const inp = { border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
const iconBox = { padding: "8px 10px", border: "1px solid #d1d5db", borderRight: "none", borderRadius: "4px 0 0 4px", background: "#f9fafb", fontSize: 14, whiteSpace: "nowrap", display: "flex", alignItems: "center" };
// All action buttons now green
const toggleBtn = { background: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: GREEN_SHADOW };
const editBtnStyle = { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#374151", fontWeight: 500 };
const delBtnStyle = { background: "#fff", border: "1px solid #fca5a5", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#dc2626", fontWeight: 500 };
const greenBtn = { background: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: GREEN_SHADOW };
const darkBtn = { background: "#374151", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, cursor: "pointer" };
const hoverCss = `.tr-hover:hover td { background: #f7fafc !important; } input:focus, select:focus { border-color: #16a34a !important; box-shadow: 0 0 0 2px rgba(34,197,94,0.15); } .add-fab { transition: opacity 0.25s, transform 0.25s; }`;

// ─── Page Header — title always visible, Add button only appears when scrolled ──
function PageHeader({ title, subtitle, onAdd }) {
  const scrolled = useScrolled(60);
  return (
    <>
      {/* Static page title row — NO add button here */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 16px", marginBottom: 4 }}>
        <div>
          <h2 style={pageTitle}>{title}</h2>
          <span style={pageSubtitle}>{subtitle}</span>
        </div>
        {/* Add button shown inline ONLY before any scroll happens — fades out once floating takes over */}
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              background: GREEN, color: "#fff", border: "none", borderRadius: 50,
              padding: "11px 26px", fontSize: 15, fontWeight: 700,
              cursor: "pointer", boxShadow: GREEN_SHADOW,
              whiteSpace: "nowrap", flexShrink: 0,
              opacity: scrolled ? 0 : 1,
              pointerEvents: scrolled ? "none" : "auto",
              transition: "opacity 0.25s",
            }}
          >
            ＋ Add
          </button>
        )}
      </div>

      {/* Floating Add button — fixed top-right, slides in only AFTER scrolling 60px */}
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            position: "fixed", top: 70, right: 28, zIndex: 999,
            background: GREEN, color: "#fff", border: "none",
            borderRadius: 50, padding: "12px 28px",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 6px 20px rgba(34,197,94,0.45)",
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "translateY(0)" : "translateY(-10px)",
            pointerEvents: scrolled ? "auto" : "none",
            transition: "opacity 0.25s, transform 0.25s",
          }}
        >
          ＋ Add
        </button>
      )}
    </>
  );
}
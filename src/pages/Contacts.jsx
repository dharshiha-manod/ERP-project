import { useState } from "react";
import { useLocation } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────────────────
const exportCSV = (data, headers, filename) => {
  const rows = [headers.join(","), ...data.map((r) => headers.map((h) => r[h] ?? "").join(","))];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click(); URL.revokeObjectURL(a.href);
};
const exportPDF = (title) => {
  const w = window.open("", "_blank");
  w.document.write(`<html><body><h2>${title}</h2><p>No data.</p></body></html>`);
  w.document.close(); w.print();
};

function TableToolbar({ showEntries, setShowEntries, search, setSearch, onExportCSV, onExportExcel, onExportPDF }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>Show</span>
        <select value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))}
          style={{ border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: 14 }}>
          {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
        </select>
        <span style={{ fontSize: 14 }}>entries</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "📄 Export CSV", fn: onExportCSV },
          { label: "📊 Export Excel", fn: onExportExcel },
          { label: "🖨️ Print", fn: () => window.print() },
          { label: "👁️ Column visibility", fn: () => alert("Toggle columns") },
          { label: "📑 Export PDF", fn: onExportPDF },
        ].map(({ label, fn }) => (
          <button key={label} onClick={fn} style={xBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
            {label}
          </button>
        ))}
        <input placeholder="Search ..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ border: "1px solid #ccc", borderRadius: 4, padding: "6px 12px", fontSize: 13, width: 160 }} />
      </div>
    </div>
  );
}

// ─── ADD CONTACT MODAL ───────────────────────────────────────────────────────
function AddContactModal({ defaultType, onSave, onClose }) {
  const [contactType, setContactType] = useState(defaultType || "Suppliers");
  const [individual, setIndividual] = useState(true);
  const [contactId, setContactId] = useState("");
  const [customerGroup, setCustomerGroup] = useState("None");
  const [mobile, setMobile] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showPersons, setShowPersons] = useState(false);
  // More info fields
  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [payTerm, setPayTerm] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");
  // Contact persons
  const [persons, setPersons] = useState([{ name: "", mobile: "", email: "" }]);

  const handleSave = () => {
    if (!mobile) return alert("Mobile is required.");
    onSave({
      contactId: contactId || "CO" + String(Math.floor(Math.random() * 9000) + 1000),
      businessName: "",
      name: `${prefix} ${firstName} ${lastName}`.trim() || "—",
      email: email || "—",
      taxNumber: taxNumber || "—",
      payTerm: payTerm || "—",
      openingBalance: `₹${Number(openingBalance || 0).toFixed(2)}`,
      advanceBalance: "₹0.00",
      addedOn: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      address: address || "—",
      mobile: mobile,
      customerGroup: contactType === "Customers" ? customerGroup : undefined,
      totalPurchaseDue: "₹0.00",
      totalPurchaseReturnDue: "₹0.00",
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, minWidth: 600, maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={modalClose}>×</button>
        <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 18 }}>Add a new contact</h3>

        {/* Row 1: Contact type + Individual/Business + Contact ID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={lbl}>Contact type:*</label>
            <div style={{ display: "flex", gap: 0 }}>
              <span style={iconBox}>👤</span>
              <select value={contactType} onChange={(e) => setContactType(e.target.value)}
                style={{ ...inp, borderRadius: "0 4px 4px 0" }}>
                <option>Suppliers</option>
                <option>Customers</option>
                <option>Both</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, paddingBottom: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
              <input type="radio" checked={individual} onChange={() => setIndividual(true)} /> Individual
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
              <input type="radio" checked={!individual} onChange={() => setIndividual(false)} /> Business
            </label>
          </div>
          <div>
            <label style={lbl}>Contact ID:</label>
            <div style={{ display: "flex", gap: 0 }}>
              <span style={iconBox}>🪪</span>
              <input value={contactId} onChange={(e) => setContactId(e.target.value)}
                placeholder="Contact ID" style={{ ...inp, borderRadius: "0 4px 4px 0" }} />
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Leave empty to autogenerate</div>
          </div>
        </div>

        {/* Customer Group — only for Customers */}
        {(contactType === "Customers" || contactType === "Both") && (
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Customer Group:</label>
            <div style={{ display: "flex", gap: 0, maxWidth: 280 }}>
              <span style={iconBox}>👥</span>
              <select value={customerGroup} onChange={(e) => setCustomerGroup(e.target.value)}
                style={{ ...inp, borderRadius: "0 4px 4px 0" }}>
                <option>None</option>
                <option>VIP</option>
                <option>Regular</option>
                <option>Wholesale</option>
              </select>
            </div>
          </div>
        )}

        {/* Row 2: Mobile, Alt phone, Landline, Email */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={lbl}>Mobile:*</label>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>📱</span>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile" style={{ ...inp, borderRadius: "0 4px 4px 0" }} />
            </div>
          </div>
          <div>
            <label style={lbl}>Alternate contact number:</label>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>📞</span>
              <input value={altPhone} onChange={(e) => setAltPhone(e.target.value)}
                placeholder="Alternate contact num" style={{ ...inp, borderRadius: "0 4px 4px 0" }} />
            </div>
          </div>
          <div>
            <label style={lbl}>Landline:</label>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>📞</span>
              <input value={landline} onChange={(e) => setLandline(e.target.value)}
                placeholder="Landline" style={{ ...inp, borderRadius: "0 4px 4px 0" }} />
            </div>
          </div>
          <div>
            <label style={lbl}>Email:</label>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>✉️</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" style={{ ...inp, borderRadius: "0 4px 4px 0" }} />
            </div>
          </div>
        </div>

        {/* Assigned to */}
        <div style={{ marginBottom: 20, maxWidth: 300 }}>
          <label style={lbl}>Assigned to:</label>
          <div style={{ display: "flex" }}>
            <span style={iconBox}>👤</span>
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
              style={{ ...inp, borderRadius: "0 4px 4px 0" }} />
          </div>
        </div>

        {/* More Informations toggle */}
        <button onClick={() => setShowMore(!showMore)}
          style={{ ...toggleBtn, marginBottom: 12 }}>
          More Informations {showMore ? "▲" : "▼"}
        </button>

        {showMore && (
          <div style={{ background: "#f9f9f9", borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
              {[["Prefix", prefix, setPrefix], ["First Name *", firstName, setFirstName],
                ["Middle Name", middleName, setMiddleName], ["Last Name", lastName, setLastName]].map(([label, val, setter]) => (
                <div key={label}>
                  <label style={lbl}>{label}:</label>
                  <input value={val} onChange={(e) => setter(e.target.value)} style={inp} placeholder={label} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
              {[["Tax Number", taxNumber, setTaxNumber], ["Pay term", payTerm, setPayTerm],
                ["Opening Balance", openingBalance, setOpeningBalance]].map(([label, val, setter]) => (
                <div key={label}>
                  <label style={lbl}>{label}:</label>
                  <input value={val} onChange={(e) => setter(e.target.value)} style={inp} placeholder={label} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[["Address", address, setAddress], ["City", city, setCity],
                ["State", state, setState], ["Country", country, setCountry], ["ZIP", zip, setZip]].map(([label, val, setter]) => (
                <div key={label}>
                  <label style={lbl}>{label}:</label>
                  <input value={val} onChange={(e) => setter(e.target.value)} style={inp} placeholder={label} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Contact Persons toggle */}
        <button onClick={() => setShowPersons(!showPersons)}
          style={{ ...toggleBtn, background: "#3498db", marginBottom: 12 }}>
          Add Contact Persons {showPersons ? "▲" : "▼"}
        </button>

        {showPersons && (
          <div style={{ background: "#f9f9f9", borderRadius: 6, padding: 16, marginBottom: 16 }}>
            {persons.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, marginBottom: 10 }}>
                <input value={p.name} onChange={(e) => { const a = [...persons]; a[i].name = e.target.value; setPersons(a); }}
                  placeholder="Name" style={inp} />
                <input value={p.mobile} onChange={(e) => { const a = [...persons]; a[i].mobile = e.target.value; setPersons(a); }}
                  placeholder="Mobile" style={inp} />
                <input value={p.email} onChange={(e) => { const a = [...persons]; a[i].email = e.target.value; setPersons(a); }}
                  placeholder="Email" style={inp} />
                <button onClick={() => setPersons(persons.filter((_, idx) => idx !== i))}
                  style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, padding: "6px 10px", cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <button onClick={() => setPersons([...persons, { name: "", mobile: "", email: "" }])}
              style={{ background: "#1a5c38", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
              ＋ Add Person
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button onClick={handleSave} style={saveBtn}>Save</button>
          <button onClick={onClose} style={closeBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── SUPPLIERS PAGE ─────────────────────────────────────────────────────────
export function SuppliersPage() {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const filtered = contacts.filter((c) => Object.values(c).join(" ").toLowerCase().includes(search.toLowerCase()));
  const HEADERS = ["action", "contactId", "businessName", "name", "email", "taxNumber", "payTerm", "openingBalance", "advanceBalance", "addedOn", "address", "mobile", "totalPurchaseDue", "totalPurchaseReturnDue"];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, display: "inline" }}>Suppliers </h2>
        <span style={{ fontSize: 14, color: "#777", marginLeft: 8 }}>Manage your Suppliers</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001" }}>
        <span style={{ fontSize: 14, color: "#555" }}>🔽 Filters</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>All your Suppliers</h3>
          <button onClick={() => setShowModal(true)} style={addRoundBtn}>＋ Add</button>
        </div>
        <TableToolbar showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch}
          onExportCSV={() => exportCSV(filtered, HEADERS, "suppliers.csv")}
          onExportExcel={() => exportCSV(filtered, HEADERS, "suppliers.xls")}
          onExportPDF={() => exportPDF("Suppliers")} />

        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                {["Action", "Contact ID", "Business Name", "Name", "Email", "Tax number", "Pay term", "Opening Balance", "Advance Balance", "Added On", "Address", "Mobile", "Total Purchase Due", "Total Purchase Return Due"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, showEntries).length === 0
                ? <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>
                : filtered.slice(0, showEntries).map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={td}><button style={actionBtn}>Actions ▾</button></td>
                    <td style={td}>{c.contactId}</td><td style={td}>{c.businessName}</td>
                    <td style={td}>{c.name}</td><td style={td}>{c.email}</td>
                    <td style={td}>{c.taxNumber}</td><td style={td}>{c.payTerm}</td>
                    <td style={td}>{c.openingBalance}</td><td style={td}>{c.advanceBalance}</td>
                    <td style={td}>{c.addedOn}</td><td style={td}>{c.address}</td>
                    <td style={td}>{c.mobile}</td><td style={td}>{c.totalPurchaseDue}</td>
                    <td style={td}>{c.totalPurchaseReturnDue}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f7f7f7", fontWeight: 600 }}>
                <td colSpan={12} style={{ padding: "10px 12px" }}>Total:</td>
                <td style={{ padding: "10px 12px" }}>₹ 0.00</td>
                <td style={{ padding: "10px 12px" }}>₹ 0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13, color: "#555" }}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>Previous</button><button style={pgBtn}>Next</button></div>
        </div>
      </div>

      {showModal && (
        <AddContactModal defaultType="Suppliers"
          onSave={(c) => { setContacts((p) => [...p, c]); setShowModal(false); }}
          onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

// ─── CUSTOMERS PAGE ──────────────────────────────────────────────────────────
export function CustomersPage() {
  const [contacts, setContacts] = useState([
    { contactId: "CO0001", businessName: "", name: "Walk-In Customer", email: "—", taxNumber: "—", creditLimit: "₹0.00", payTerm: "—", openingBalance: "₹0.00", advanceBalance: "₹0.00", addedOn: "05/23/2026", customerGroup: "—", address: "—", mobile: "—" }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const filtered = contacts.filter((c) => Object.values(c).join(" ").toLowerCase().includes(search.toLowerCase()));
  const HEADERS = ["action", "contactId", "businessName", "name", "email", "taxNumber", "creditLimit", "payTerm", "openingBalance", "advanceBalance", "addedOn", "customerGroup", "address", "mobile"];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, display: "inline" }}>Customers </h2>
        <span style={{ fontSize: 14, color: "#777", marginLeft: 8 }}>Manage your Customers</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001" }}>
        <span style={{ fontSize: 14, color: "#555" }}>🔽 Filters</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>All your Customers</h3>
          <button onClick={() => setShowModal(true)} style={addRoundBtn}>＋ Add</button>
        </div>
        <TableToolbar showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch}
          onExportCSV={() => exportCSV(filtered, HEADERS, "customers.csv")}
          onExportExcel={() => exportCSV(filtered, HEADERS, "customers.xls")}
          onExportPDF={() => exportPDF("Customers")} />

        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                {["Action", "Contact ID", "Business Name", "Name", "Email", "Tax number", "Credit Limit", "Pay term", "Opening Balance", "Advance Balance", "Added On", "Customer Group", "Address", "Mobile"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, showEntries).map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}><button style={actionBtn}>Actions ▾</button></td>
                  <td style={td}>{c.contactId}</td><td style={td}>{c.businessName}</td>
                  <td style={td}>{c.name}</td><td style={td}>{c.email}</td>
                  <td style={td}>{c.taxNumber}</td><td style={td}>{c.creditLimit}</td>
                  <td style={td}>{c.payTerm}</td><td style={td}>{c.openingBalance}</td>
                  <td style={td}>{c.advanceBalance}</td><td style={td}>{c.addedOn}</td>
                  <td style={td}>{c.customerGroup}</td><td style={td}>{c.address}</td>
                  <td style={td}>{c.mobile}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={14} style={emptyCell}>No data available in table</td></tr>}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f7f7f7", fontWeight: 600 }}>
                <td colSpan={14} style={{ padding: "10px 12px" }}>Total:</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13, color: "#555" }}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={pgBtn}>Previous</button>
            {[1].map((n) => <button key={n} style={{ ...pgBtn, background: "#1a5c38", color: "#fff", border: "1px solid #1a5c38" }}>{n}</button>)}
            <button style={pgBtn}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddContactModal defaultType="Customers"
          onSave={(c) => { setContacts((p) => [...p, { ...c, creditLimit: "₹0.00" }]); setShowModal(false); }}
          onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

// ─── CUSTOMER GROUPS PAGE ────────────────────────────────────────────────────
export function CustomerGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [priceCalcType, setPriceCalcType] = useState("Percentage");
  const [calcPercent, setCalcPercent] = useState("");
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!groupName.trim()) return alert("Customer Group Name is required.");
    setGroups((p) => [...p, { name: groupName, calcPercent: calcPercent || "—", sellingPriceGroup: "—" }]);
    setShowModal(false); setGroupName(""); setPriceCalcType("Percentage"); setCalcPercent("");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 26, fontWeight: 700 }}>Customer Groups</h2>

      <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>All Customer Groups</h3>
          <button onClick={() => setShowModal(true)} style={addRoundBtn}>＋ Add</button>
        </div>
        <TableToolbar showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch}
          onExportCSV={() => exportCSV(filtered, ["name", "calcPercent", "sellingPriceGroup"], "customer_groups.csv")}
          onExportExcel={() => exportCSV(filtered, ["name", "calcPercent", "sellingPriceGroup"], "customer_groups.xls")}
          onExportPDF={() => exportPDF("Customer Groups")} />

        <table style={tbl}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
              {["Customer Group Name", "Calculation Percentage (%)", "Selling Price Group", "Action"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showEntries).length === 0
              ? <tr><td colSpan={4} style={emptyCell}>No data available in table</td></tr>
              : filtered.slice(0, showEntries).map((g, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}>{g.name}</td>
                  <td style={td}>{g.calcPercent}</td>
                  <td style={td}>{g.sellingPriceGroup}</td>
                  <td style={td}>
                    <button onClick={() => setGroups(groups.filter((_, idx) => idx !== i))}
                      style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13, color: "#555" }}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>Previous</button><button style={pgBtn}>Next</button></div>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, minWidth: 480 }}>
            <button onClick={() => setShowModal(false)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 18 }}>Add Customer Group</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Customer Group Name:*</label>
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)}
                placeholder="Customer Group Name" style={inp} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Price calculation type:</label>
              <select value={priceCalcType} onChange={(e) => setPriceCalcType(e.target.value)} style={inp}>
                {["Percentage", "Fixed", "Markup"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Calculation Percentage (%): <span style={{ color: "#3498db" }}>ℹ️</span></label>
              <input value={calcPercent} onChange={(e) => setCalcPercent(e.target.value)}
                placeholder="Calculation Percentage (%)" style={inp} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={handleSave} style={saveBtn}>Save</button>
              <button onClick={() => setShowModal(false)} style={closeBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── IMPORT CONTACTS PAGE ────────────────────────────────────────────────────
export function ImportContactsPage() {
  const [file, setFile] = useState(null);

  const instructions = [
    { col: 1, name: "Contact type", required: true, instruction: "Available Options:\n1 = Customer,\n2 = Supplier\n3 = Both" },
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
    { col: 17, name: "Contact ID", required: false, instruction: "Leave empty to autogenerate" },
    { col: 18, name: "Pay term number", required: false, instruction: "" },
    { col: 19, name: "Pay term type", required: false, instruction: "days / months" },
    { col: 20, name: "Opening balance", required: false, instruction: "" },
    { col: 21, name: "Customer group name", required: false, instruction: "Must exist in system" },
  ];

  const handleSubmit = () => {
    if (!file) return alert("Please choose a file to import.");
    alert(`File "${file.name}" submitted for import!`);
  };

  const handleDownloadTemplate = () => {
    const headers = instructions.map((r) => r.name).join(",");
    const blob = new Blob([headers + "\n"], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "contacts_template.csv" });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 26, fontWeight: 700 }}>Import Contacts</h2>

      <div style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px #0001", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, marginRight: 10 }}>File To Import:</label>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setFile(e.target.files[0])}
              style={{ fontSize: 13 }} />
          </div>
          <button onClick={handleSubmit}
            style={{ background: "#6c47ff", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Submit
          </button>
        </div>
        <div style={{ marginTop: 20 }}>
          <button onClick={handleDownloadTemplate}
            style={{ background: "#1a5c38", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            ⬇️ Download template file
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px #0001" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Instructions</h3>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#555" }}>
          <b>Carefully follow the instructions before importing the file.</b><br />
          The columns of the CSV file should be in the following order.
        </p>
        <table style={{ ...tbl, fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0e0e0", background: "#f7f7f7" }}>
              {["Column Number", "Column Name", "Instruction"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {instructions.map((row) => (
              <tr key={row.col} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px" }}>{row.col}</td>
                <td style={{ padding: "12px 16px" }}>
                  {row.name} {row.required && <span style={{ color: "#e74c3c", fontWeight: 600, fontSize: 11 }}>(Required)</span>}
                  {!row.required && <span style={{ color: "#888", fontSize: 11 }}> (Optional)</span>}
                </td>
                <td style={{ padding: "12px 16px", whiteSpace: "pre-line", color: row.instruction ? "#222" : "#ccc" }}>
                  {row.instruction || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── DEFAULT EXPORT: route switcher by query param ───────────────────────────
export default function Contacts() {
  const location = useLocation();
  const type = new URLSearchParams(location.search).get("type");
  if (type === "supplier") return <SuppliersPage />;
  if (type === "customer") return <CustomersPage />;
  return <SuppliersPage />;
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const th = { padding: "12px 12px", textAlign: "left", fontWeight: 600, color: "#333", whiteSpace: "nowrap" };
const td = { padding: "10px 12px", whiteSpace: "nowrap" };
const emptyCell = { textAlign: "center", padding: 32, color: "#888" };
const pgBtn = { border: "1px solid #ccc", background: "#fff", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13 };
const xBtn = { padding: "6px 14px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 };
const addRoundBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 50, padding: "10px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle = { background: "#fff", borderRadius: 10, padding: 32, minWidth: 480, maxWidth: 600, boxShadow: "0 8px 32px #0002", position: "relative" };
const modalClose = { position: "absolute", right: 16, top: 14, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666" };
const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#333" };
const inp = { border: "1px solid #ccc", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" };
const iconBox = { padding: "8px 10px", border: "1px solid #ccc", borderRight: "none", borderRadius: "4px 0 0 4px", background: "#f5f5f5", whiteSpace: "nowrap" };
const toggleBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 };
const saveBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 };
const closeBtn = { background: "#333", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 };
const actionBtn = { background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 };
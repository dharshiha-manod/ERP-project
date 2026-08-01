import { useState, useEffect, useRef } from "react";
// NEW
import * as settingsAPI from "../api/settingsAPI"; // adjust path to your actual file
import { useBusiness } from "../context/BusinessContext";
import GeneralSettings from './GeneralSettings';
// GeneralSettings component not built yet
// ─── Shared styles ────────────────────────────────────────────────────────────
const G = {
  green: "linear-gradient(135deg,#27ae60 0%,#1a6b3c 100%)",
  greenHover: "linear-gradient(135deg,#2ecc71 0%,#1a6b3c 100%)",
  black: "linear-gradient(135deg,#444 0%,#222 100%)",
  red: "linear-gradient(135deg,#e74c3c 0%,#922b21 100%)",
  blue: "linear-gradient(135deg,#3498db 0%,#1a5276 100%)",
};

const btnBase = {
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "9px 20px", border: "none", borderRadius: 8,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  letterSpacing: ".01em", transition: "transform .12s, box-shadow .12s",
  fontFamily: "inherit",
};
const BtnGreen = ({ children, onClick, style = {}, type = "button" }) => (
  <button type={type} onClick={onClick} style={{ ...btnBase, background: G.green, color: "#fff", boxShadow: "0 3px 10px rgba(26,107,60,.30)", ...style }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 5px 16px rgba(26,107,60,.38)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 3px 10px rgba(26,107,60,.30)"; }}>
    {children}
  </button>
);
const BtnBlack = ({ children, onClick }) => (
  <button onClick={onClick} style={{ ...btnBase, background: G.black, color: "#fff", boxShadow: "0 3px 10px rgba(0,0,0,.25)" }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
    {children}
  </button>
);
const BtnBlue = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{ ...btnBase, background: G.blue, color: "#fff", boxShadow: "0 3px 10px rgba(52,152,219,.30)", ...style }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
    {children}
  </button>
);
const BtnRed = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{ ...btnBase, background: G.red, color: "#fff", boxShadow: "0 3px 10px rgba(231,76,60,.30)", ...style }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
    {children}
  </button>
);

// ─── Form helpers ─────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: "#444", marginBottom: 4, display: "block" }}>
    {children} {required && <span style={{ color: "#e53935" }}>*</span>}
  </label>
);
const Input = ({ placeholder = "", value, onChange, type = "text", style = {} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width: "100%", padding: "8px 11px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, color: "#333", background: "#fff", boxSizing: "border-box", outline: "none", fontFamily: "inherit", ...style }}
    onFocus={e => e.target.style.borderColor = "#1a6b3c"}
    onBlur={e => e.target.style.borderColor = "#ddd"} />
);
const Select = ({ children, value, onChange, style = {} }) => (
  <select value={value} onChange={onChange}
    style={{ width: "100%", padding: "8px 30px 8px 11px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, color: "#333", background: "#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\") no-repeat right 10px center", appearance: "none", boxSizing: "border-box", fontFamily: "inherit", outline: "none", ...style }}
    onFocus={e => e.target.style.borderColor = "#1a6b3c"}
    onBlur={e => e.target.style.borderColor = "#ddd"}>
    {children}
  </select>
);
const FormRow = ({ children, cols = 3 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18, marginBottom: 18 }}>
    {children}
  </div>
);
const FG = ({ label, required, children }) => (
  <div><Label required={required}>{label}</Label>{children}</div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 700, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#222" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
        {footer && <div style={{ padding: "14px 22px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children }) => (
  <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0e0e0", padding: "26px 28px" }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a6b3c", borderBottom: "2px solid #e8f5ee", paddingBottom: 8, marginBottom: 18 }}>{children}</div>
);

const Divider = () => <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "20px 0" }} />;

// ─── 1. BUSINESS SETTINGS ─────────────────────────────────────────────────────
function BusinessSettings() {
  const { refreshBusiness } = useBusiness();
  const logoInputRef = useRef(null);
  const [subTab, setSubTab] = useState("general");
  const [form, setForm] = useState({
    name: "", startDate: "05/23/2026", profit: "25.00",
    currency: "INR", symbolPlacement: "Before amount", timezone: "Asia/Kolkata",
    financialMonth: "January", stockMethod: "FIFO", editDays: "30",
    dateFormat: "mm/dd/yyyy", timeFormat: "24 Hour", currencyPrecision: "2", qtyPrecision: "2",
    logoFile: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
// NEW
useEffect(() => {
  (async () => {
    const res = await settingsAPI.getBusinessSettings();
    if (res.success && res.data) {
      setForm((prev) => ({
        ...prev,
        name: res.data.business_name || "",
        currency: res.data.currency || "INR",
        timezone: res.data.timezone || "Asia/Kolkata",
        startDate: res.data.start_date || prev.startDate,
        profit: res.data.profit_percent != null ? String(res.data.profit_percent) : prev.profit,
        symbolPlacement: res.data.symbol_placement || prev.symbolPlacement,
        financialMonth: res.data.financial_year_start_month || prev.financialMonth,
        stockMethod: res.data.stock_method || prev.stockMethod,
        editDays: res.data.transaction_edit_days != null ? String(res.data.transaction_edit_days) : prev.editDays,
        dateFormat: res.data.date_format || prev.dateFormat,
        timeFormat: res.data.time_format || prev.timeFormat,
        currencyPrecision: res.data.currency_precision != null ? String(res.data.currency_precision) : prev.currencyPrecision,
        qtyPrecision: res.data.qty_precision != null ? String(res.data.qty_precision) : prev.qtyPrecision,
      }));
    }
    // If 404 (no settings row yet), keep default form values so user can create one
    setLoading(false);
  })();
}, []);
 const handleSave = async () => {
    setSaving(true); setMsg(null);

    // Logo upload (multipart) only if a new file was picked
    if (form.logoFile) {
      const logoRes = await settingsAPI.uploadBusinessLogo(form.logoFile);
      if (!logoRes.success) {
        setSaving(false);
        setMsg(`❌ ${logoRes.message || "Logo upload failed"}`);
        return;
      }
    }

   // NEW
   // NEW
    const res = await settingsAPI.updateBusinessSettings({
      business_name: form.name,
      currency: form.currency,
      timezone: form.timezone,
      start_date: form.startDate,
      profit_percent: form.profit,
      symbol_placement: form.symbolPlacement,
      financial_year_start_month: form.financialMonth,
      stock_method: form.stockMethod,
      transaction_edit_days: form.editDays,
      date_format: form.dateFormat,
      time_format: form.timeFormat,
      currency_precision: form.currencyPrecision,
      qty_precision: form.qtyPrecision,
    });
    setSaving(false);
    setMsg(res.success ? "✅ Settings updated" : `❌ ${res.message}`);
    if (res.success) refreshBusiness(); // <-- pushes new name/currency/logo to every module instantly
  };

  if (loading) return <Card>Loading...</Card>;

  const subTabs = [
    { key: "general", label: "General" },
    { key: "format", label: "Format" },
    { key: "auditlog", label: "Audit Log" },
  ];

  return (
    <Card>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            style={{
              padding: "7px 16px", border: "1px solid #e0e0e0", borderRadius: 6, cursor: "pointer",
              fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
              background: subTab === t.key ? "#1a6b3c" : "#fff",
              color: subTab === t.key ? "#fff" : "#555",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "general" && <>
      <SectionTitle>General Business Information</SectionTitle>
      <FormRow cols={3}>
        <FG label="Business Name" required><Input value={form.name} onChange={f("name")} /></FG>
        <FG label="Start Date"><Input value={form.startDate} onChange={f("startDate")} /></FG>
        <FG label="Default Profit Percent" required><Input type="number" value={form.profit} onChange={f("profit")} /></FG>
      </FormRow>
      <FormRow cols={3}>
        <FG label="Currency">
          <Select value={form.currency} onChange={f("currency")}>
            <option value="INR">India - Rupees (INR)</option>
            <option value="USD">USD - Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </Select>
        </FG>
        <FG label="Currency Symbol Placement">
          <Select value={form.symbolPlacement} onChange={f("symbolPlacement")}>
            <option>Before amount</option><option>After amount</option>
          </Select>
        </FG>
        <FG label="Time Zone">
          <Select value={form.timezone} onChange={f("timezone")}>
            <option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option>
          </Select>
        </FG>
      </FormRow>

      <FormRow cols={2}>
      <FG label="Upload Logo">
          <div style={{ display: "flex", gap: 8 }}>
            <Input placeholder={form.logoFile ? form.logoFile.name : "No file chosen"} style={{ flex: 1 }} />
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setForm({ ...form, logoFile: file });
              }}
            />
            <BtnGreen
              style={{ whiteSpace: "nowrap", padding: "8px 14px" }}
              onClick={() => logoInputRef.current.click()}
            >
              📁 Browse...
            </BtnGreen>
          </div>
          <p style={{ fontSize: 11.5, color: "#999", marginTop: 3 }}>Previous logo (if exists) will be replaced</p>
        </FG>
        <FG label="Financial Year Start Month">
          <Select value={form.financialMonth} onChange={f("financialMonth")}>
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}
          </Select>
        </FG>
      </FormRow>
</>}

      {subTab === "format" && <>
      <SectionTitle>Transaction & Format Settings</SectionTitle>
      <FormRow cols={3}>
        <FG label="Stock Accounting Method" required>
          <Select value={form.stockMethod} onChange={f("stockMethod")}>
            <option>FIFO (First In First Out)</option>
            <option>LIFO (Last In First Out)</option>
            <option>Average</option>
          </Select>
        </FG>
        <FG label="Transaction Edit Days" required><Input type="number" value={form.editDays} onChange={f("editDays")} /></FG>
        <FG label="Date Format" required>
          <Select value={form.dateFormat} onChange={f("dateFormat")}>
            <option>mm/dd/yyyy</option><option>dd/mm/yyyy</option><option>yyyy-mm-dd</option>
          </Select>
        </FG>
      </FormRow>
      <FormRow cols={3}>
        <FG label="Time Format" required>
          <Select value={form.timeFormat} onChange={f("timeFormat")}><option>24 Hour</option><option>12 Hour</option></Select>
        </FG>
        <FG label="Currency Precision" required>
          <Select value={form.currencyPrecision} onChange={f("currencyPrecision")}><option>2</option><option>3</option><option>4</option></Select>
        </FG>
        <FG label="Quantity Precision" required>
          <Select value={form.qtyPrecision} onChange={f("qtyPrecision")}><option>2</option><option>3</option><option>4</option></Select>
        </FG>
     </FormRow>
<div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <BtnGreen onClick={handleSave} style={{ padding: "13px 44px", fontSize: 15, borderRadius: 10, background: G.green, boxShadow: "0 4px 16px rgba(26,107,60,.35)", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : "💾 Update Settings"}
        </BtnGreen>
        {msg && <span style={{ fontSize: 12.5, color: msg.startsWith("✅") ? "#1a6b3c" : "#e53935" }}>{msg}</span>}
      </div>
      </>}

      {subTab === "auditlog" && <AuditLog />}
    </Card>
  );
}

// ─── 2. BUSINESS LOCATIONS ────────────────────────────────────────────────────
const paymentMethods = ["Cash","Card","Cheque","Bank Transfer","Other","Custom Payment 1","Custom Payment 2","Custom Payment 3","Custom Payment 4","Custom Payment 5","Custom Payment 6","Custom Payment 7"];

function BusinessLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name:"",locationId:"",landmark:"",city:"",zip:"",state:"",country:"",mobile:"",altContact:"",email:"",website:"",invoiceSchemePOS:"",invoiceSchemeSale:"",invoiceLayoutPOS:"",invoiceLayoutSale:"",priceGroup:"",custom1:"",custom2:"",custom3:"",custom4:"", payments: paymentMethods.reduce((a,k)=>({...a,[k]:true}),{}) });
  const f = k => e => setForm({ ...form, [k]: e.target.value });
  const togglePay = k => setForm({ ...form, payments: { ...form.payments, [k]: !form.payments[k] } });

  const loadLocations = async () => {
    const res = await settingsAPI.getLocations();
    if (res.success) {
      setLocations(res.data.map(l => ({
        id: l.location_id, dbId: l.id, name: l.location_name, landmark: l.address,
        city: l.city, zip: l.postal_code, state: l.state, country: l.country,
        invoiceScheme: "Default", invoiceLayoutPOS: "Default", invoiceLayoutSale: "Default",
      })));
    }
    setLoading(false);
  };
  useEffect(() => { loadLocations(); }, []);

  const openAdd = () => { setEditingId(null); setForm(prev => ({ ...prev, name:"",landmark:"",city:"",zip:"",state:"",country:"",mobile:"" })); setShowAdd(true); };
  const openEdit = (loc) => {
    setEditingId(loc.dbId);
    setForm(prev => ({ ...prev, name: loc.name, landmark: loc.landmark || "", city: loc.city || "", zip: loc.zip || "", state: loc.state || "", country: loc.country || "" }));
    setShowAdd(true);
  };

  const handleSave = async () => {
  const payload = { location_name: form.name, address: form.landmark, city: form.city, postal_code: form.zip, state: form.state, country: form.country, phone: form.mobile };
  const res = editingId ? await settingsAPI.updateLocation(editingId, payload) : await settingsAPI.createLocation(payload);
  if (res.success) {
    setShowAdd(false);
    loadLocations();
  } else {
    alert(res.message || 'Failed to save location');
  }
};

 // NEW
// NEW
  const handleDeactivate = async (dbId) => {
    await settingsAPI.deactivateLocation(dbId);
    loadLocations();
  };

const handleDelete = async (dbId) => {
    if (!window.confirm("Permanently delete this location? This cannot be undone.")) return;
    const res = await settingsAPI.deleteLocation(dbId);
    if (res.success) {
      loadLocations();
    } else {
      alert(res.message || "Failed to delete location");
    }
  };

  const thStyle = { padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#555", background: "#f8f8f8", borderBottom: "1px solid #e0e0e0" };
  const tdStyle = { padding: "10px 12px", fontSize: 13, color: "#444", borderBottom: "1px solid #f4f4f4" };

  if (loading) return <Card>Loading...</Card>;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionTitle>All Business Locations</SectionTitle>
      <BtnBlue onClick={openAdd}>+ Add Location</BtnBlue>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Name","Location ID","Landmark","City","Zip Code","State","Country","Invoice Scheme","Inv. Layout POS","Inv. Layout Sale","Action"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((loc, i) => (
              <tr key={i}>
                <td style={tdStyle}>{loc.name}</td>
                <td style={tdStyle}>{loc.id}</td>
                <td style={tdStyle}>{loc.landmark}</td>
                <td style={tdStyle}>{loc.city}</td>
                <td style={tdStyle}>{loc.zip}</td>
                <td style={tdStyle}>{loc.state}</td>
                <td style={tdStyle}>{loc.country}</td>
                <td style={tdStyle}>{loc.invoiceScheme}</td>
                <td style={tdStyle}>{loc.invoiceLayoutPOS}</td>
                <td style={tdStyle}>{loc.invoiceLayoutSale}</td>
          
              <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <BtnGreen style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => openEdit(loc)}>✏️ Edit</BtnGreen>
                    <BtnBlue style={{ padding: "5px 12px", fontSize: 12 }}>⚙️ Settings</BtnBlue>
                    <BtnRed style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleDeactivate(loc.dbId)}>🚫 Deactivate</BtnRed>
                    <BtnRed style={{ padding: "5px 12px", fontSize: 12, background: G.black }} onClick={() => handleDelete(loc.dbId)}>🗑️ Delete</BtnRed>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>Showing 1 to {locations.length} of {locations.length} entries</p>
<Modal open={showAdd} onClose={() => setShowAdd(false)} title={editingId ? "Edit business location" : "Add a new business location"}
        footer={<><BtnGreen onClick={handleSave}>💾 Save</BtnGreen><BtnBlack onClick={() => setShowAdd(false)}>✕ Close</BtnBlack></>}>
        <FormRow cols={1}><FG label="Name" required><Input value={form.name} onChange={f("name")} placeholder="Name" /></FG></FormRow>
        <FormRow cols={2}>
          <FG label="Location ID"><Input value={form.locationId} onChange={f("locationId")} placeholder="Location ID" /></FG>
          <FG label="Landmark"><Input value={form.landmark} onChange={f("landmark")} placeholder="Landmark" /></FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="City" required><Input value={form.city} onChange={f("city")} placeholder="City" /></FG>
          <FG label="Zip Code" required><Input value={form.zip} onChange={f("zip")} placeholder="Zip Code" /></FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="State" required><Input value={form.state} onChange={f("state")} placeholder="State" /></FG>
          <FG label="Country" required><Input value={form.country} onChange={f("country")} placeholder="Country" /></FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="Mobile"><Input value={form.mobile} onChange={f("mobile")} placeholder="Mobile" type="tel" /></FG>
          <FG label="Alternate Contact Number"><Input value={form.altContact} onChange={f("altContact")} placeholder="Alternate contact" type="tel" /></FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="Email"><Input value={form.email} onChange={f("email")} placeholder="Email" type="email" /></FG>
          <FG label="Website"><Input value={form.website} onChange={f("website")} placeholder="Website" type="url" /></FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="Invoice Scheme for POS" required>
            <Select value={form.invoiceSchemePOS} onChange={f("invoiceSchemePOS")}><option value="">Please Select</option><option>Default</option></Select>
          </FG>
          <FG label="Invoice Scheme for Sale" required>
            <Select value={form.invoiceSchemeSale} onChange={f("invoiceSchemeSale")}><option value="">Please Select</option><option>Default</option></Select>
          </FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="Invoice Layout for POS" required>
            <Select value={form.invoiceLayoutPOS} onChange={f("invoiceLayoutPOS")}><option value="">Please Select</option><option>Default</option></Select>
          </FG>
          <FG label="Invoice Layout for Sale" required>
            <Select value={form.invoiceLayoutSale} onChange={f("invoiceLayoutSale")}><option value="">Please Select</option><option>Default</option></Select>
          </FG>
        </FormRow>
        <FG label="Default Selling Price Group">
          <Select><option value="">Please Select</option></Select>
        </FG>
        <Divider />
        <SectionTitle>Custom Fields</SectionTitle>
        <FormRow cols={2}>
          <FG label="Custom field 1"><Input value={form.custom1} onChange={f("custom1")} placeholder="Custom field 1" /></FG>
          <FG label="Custom field 2"><Input value={form.custom2} onChange={f("custom2")} placeholder="Custom field 2" /></FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="Custom field 3"><Input value={form.custom3} onChange={f("custom3")} placeholder="Custom field 3" /></FG>
          <FG label="Custom field 4"><Input value={form.custom4} onChange={f("custom4")} placeholder="Custom field 4" /></FG>
        </FormRow>
        <Divider />
        <SectionTitle>POS Screen Featured Products</SectionTitle>
        <Input placeholder="Search products..." style={{ marginBottom: 16 }} />
        <Divider />
        <SectionTitle>Payment Options</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={thStyle}>Payment Method</th><th style={{ ...thStyle, textAlign: "center" }}>Enable</th></tr></thead>
          <tbody>
            {paymentMethods.map(pm => (
              <tr key={pm}>
                <td style={tdStyle}>{pm}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <input type="checkbox" checked={form.payments[pm]} onChange={() => togglePay(pm)} style={{ width: 16, height: 16, accentColor: "#1a6b3c", cursor: "pointer" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </Card>
  );
}

// ─── 3. INVOICE SETTINGS ─────────────────────────────────────────────────────
function InvoiceSettings() {
  const [form, setForm] = useState({
    prefix: "INV", digits: "5", separator: "-", startNumber: "1",
    showLogo: true, showAddress: true, showTax: true, showDiscount: true,
    footerText: "", termsText: "", defaultDue: "0",
    layout: "Default", logoSize: "Medium",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const f = k => e => setForm({ ...form, [k]: e.target.value });
  const t = k => () => setForm({ ...form, [k]: !form[k] });

useEffect(() => {
  (async () => {
    const res = await settingsAPI.getInvoiceSettings();
    if (res.success && res.data) {
      setForm(prev => ({
        ...prev,
        prefix: res.data.invoice_prefix ?? prev.prefix,
        digits: String(res.data.number_digits ?? prev.digits),
        separator: res.data.separator ?? prev.separator,
        startNumber: String(res.data.invoice_start_number ?? prev.startNumber),
        showTax: res.data.show_tax_id ?? prev.showTax,
        termsText: res.data.notes_template || "",
      }));
    }
    setLoading(false);
  })();
}, []);

// NEW
 const handleSave = async () => {
    console.log("SAVE CLICKED, profit value:", form.profit, "full form:", form);
    setSaving(true); setMsg(null);
   const res = await settingsAPI.updateInvoiceSettings({
  invoice_prefix: form.prefix,
  invoice_start_number: form.startNumber,
  number_digits: form.digits,
  separator: form.separator,
  show_tax_id: form.showTax,
  show_notes: !!form.termsText,
  notes_template: form.termsText,
});
    setSaving(false);
    setMsg(res.success ? "✅ Settings updated" : `❌ ${res.message}`);
  };

  const Toggle = ({ checked, onChange, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: checked ? "#1a6b3c" : "#ccc", cursor: "pointer", position: "relative", transition: ".2s" }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: checked ? 20 : 2, transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
      </div>
      <span style={{ fontSize: 13, color: "#444" }}>{label}</span>
    </div>
  );
if (loading) return <Card>Loading...</Card>;

  return (
    <Card>
      <SectionTitle>Invoice Number Configuration</SectionTitle>
      <FormRow cols={4}>
        <FG label="Invoice Prefix"><Input value={form.prefix} onChange={f("prefix")} placeholder="INV" /></FG>
        <FG label="Number Digits"><Input type="number" value={form.digits} onChange={f("digits")} /></FG>
        <FG label="Separator"><Input value={form.separator} onChange={f("separator")} /></FG>
        <FG label="Start Number"><Input type="number" value={form.startNumber} onChange={f("startNumber")} /></FG>
      </FormRow>
      <FormRow cols={2}>
        <FG label="Invoice Layout">
          <Select value={form.layout} onChange={f("layout")}><option>Default</option><option>Classic</option><option>Modern</option><option>Minimal</option></Select>
        </FG>
        <FG label="Logo Size">
          <Select value={form.logoSize} onChange={f("logoSize")}><option>Small</option><option>Medium</option><option>Large</option></Select>
        </FG>
      </FormRow>
      <FG label="Default Due Days"><Input type="number" value={form.defaultDue} onChange={f("defaultDue")} style={{ maxWidth: 160 }} /></FG>
      <Divider />
      <SectionTitle>Display Options</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <Toggle checked={form.showLogo} onChange={t("showLogo")} label="Show Business Logo" />
        <Toggle checked={form.showAddress} onChange={t("showAddress")} label="Show Business Address" />
        <Toggle checked={form.showTax} onChange={t("showTax")} label="Show Tax Details" />
        <Toggle checked={form.showDiscount} onChange={t("showDiscount")} label="Show Discount" />
      </div>
      <Divider />
      <SectionTitle>Footer & Terms</SectionTitle>
      <FormRow cols={1}>
        <FG label="Footer Text">
          <textarea value={form.footerText} onChange={f("footerText")} placeholder="Enter footer text for invoices..."
            style={{ width: "100%", padding: "8px 11px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
        </FG>
      </FormRow>
      <FG label="Terms & Conditions">
        <textarea value={form.termsText} onChange={f("termsText")} placeholder="Enter terms and conditions..."
          style={{ width: "100%", padding: "8px 11px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
      </FG>
   <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <BtnGreen onClick={handleSave} style={{ padding: "13px 44px", fontSize: 15, borderRadius: 10, boxShadow: "0 4px 16px rgba(26,107,60,.35)", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : "💾 Update Settings"}
        </BtnGreen>
        {msg && <span style={{ fontSize: 12.5, color: msg.startsWith("✅") ? "#1a6b3c" : "#e53935" }}>{msg}</span>}
      </div>
    </Card>
  );
}

// ─── 4. BARCODE SETTINGS ─────────────────────────────────────────────────────
function BarcodeSettings() {
  const [form, setForm] = useState({
    barcodeType: "CODE128", labelWidth: "50", labelHeight: "30",
    font: "Arial", fontSize: "10", showProductName: true, showPrice: true,
    showSKU: true, showBarcode: true, copies: "1", paperSize: "A4",
    labelPerRow: "3", topMargin: "5", leftMargin: "5", gap: "3",
  });
  const f = k => e => setForm({ ...form, [k]: e.target.value });
  const t = k => () => setForm({ ...form, [k]: !form[k] });

  const Toggle = ({ checked, onChange, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: checked ? "#1a6b3c" : "#ccc", cursor: "pointer", position: "relative", transition: ".2s" }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: checked ? 20 : 2, transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
      </div>
      <span style={{ fontSize: 13, color: "#444" }}>{label}</span>
    </div>
  );

  return (
    <Card>
      <SectionTitle>Barcode Configuration</SectionTitle>
      <FormRow cols={3}>
        <FG label="Barcode Type" required>
          <Select value={form.barcodeType} onChange={f("barcodeType")}>
            <option>CODE128</option><option>CODE39</option><option>EAN13</option><option>EAN8</option><option>UPC</option><option>QR Code</option>
          </Select>
        </FG>
        <FG label="Label Width (mm)"><Input type="number" value={form.labelWidth} onChange={f("labelWidth")} /></FG>
        <FG label="Label Height (mm)"><Input type="number" value={form.labelHeight} onChange={f("labelHeight")} /></FG>
      </FormRow>
      <FormRow cols={3}>
        <FG label="Font"><Select value={form.font} onChange={f("font")}><option>Arial</option><option>Times New Roman</option><option>Courier New</option><option>Verdana</option></Select></FG>
        <FG label="Font Size (pt)"><Input type="number" value={form.fontSize} onChange={f("fontSize")} /></FG>
        <FG label="Copies Per Print"><Input type="number" value={form.copies} onChange={f("copies")} /></FG>
      </FormRow>
      <Divider />
      <SectionTitle>Label Display Options</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <Toggle checked={form.showBarcode} onChange={t("showBarcode")} label="Show Barcode" />
        <Toggle checked={form.showProductName} onChange={t("showProductName")} label="Show Product Name" />
        <Toggle checked={form.showPrice} onChange={t("showPrice")} label="Show Price" />
        <Toggle checked={form.showSKU} onChange={t("showSKU")} label="Show SKU / Code" />
      </div>
      <Divider />
      <SectionTitle>Paper & Layout</SectionTitle>
      <FormRow cols={4}>
        <FG label="Paper Size"><Select value={form.paperSize} onChange={f("paperSize")}><option>A4</option><option>A5</option><option>Letter</option><option>Custom</option></Select></FG>
        <FG label="Labels Per Row"><Input type="number" value={form.labelPerRow} onChange={f("labelPerRow")} /></FG>
        <FG label="Top Margin (mm)"><Input type="number" value={form.topMargin} onChange={f("topMargin")} /></FG>
        <FG label="Left Margin (mm)"><Input type="number" value={form.leftMargin} onChange={f("leftMargin")} /></FG>
      </FormRow>
      <FG label="Gap Between Labels (mm)"><Input type="number" value={form.gap} onChange={f("gap")} style={{ maxWidth: 160 }} /></FG>

      <div style={{ background: "#f8fdf9", border: "1px dashed #1a6b3c", borderRadius: 8, padding: 18, marginTop: 18, textAlign: "center" }}>
        <p style={{ fontSize: 12.5, color: "#1a6b3c", fontWeight: 600, marginBottom: 8 }}>Label Preview</p>
        <div style={{ display: "inline-block", background: "#fff", border: "1px solid #ccc", borderRadius: 4, padding: "10px 16px", minWidth: 140 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#222", marginBottom: 3 }}>Product Name</div>
          <div style={{ fontFamily: "monospace", fontSize: 18, letterSpacing: 2, color: "#222", marginBottom: 2 }}>|||||||||||||||</div>
          <div style={{ fontSize: 10, color: "#555" }}>1234567890</div>
          <div style={{ fontSize: 10, color: "#1a6b3c", fontWeight: 600 }}>₹ 99.00</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, marginTop: 20, display: "flex", justifyContent: "center" }}>
        <BtnGreen style={{ padding: "13px 44px", fontSize: 15, borderRadius: 10, boxShadow: "0 4px 16px rgba(26,107,60,.35)" }}>💾 Update Settings</BtnGreen>
      </div>
    </Card>
  );
}

// ─── 5. RECEIPT PRINTERS ─────────────────────────────────────────────────────
// ─── 5. RECEIPT PRINTERS ─────────────────────────────────────────────────────
function ReceiptPrinters() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Thermal", connection: "USB", ip: "", port: "9100", paperWidth: "80mm", charPerLine: "48", location: "" });
  const f = k => e => setForm({ ...form, [k]: e.target.value });

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", type: "Thermal", connection: "USB", ip: "", port: "9100", paperWidth: "80mm", charPerLine: "48", location: "" });
    setShowAdd(true);
  };
  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name, type: p.type, connection: p.connection === "Network" ? "Network / LAN" : "USB",
      ip: "", port: "9100", paperWidth: p.paperWidth, charPerLine: "48", location: ""
    });
    setShowAdd(true);
  };

  const loadPrinters = async () => {
    const res = await settingsAPI.getPrinters();
    if (res.success) {
      setPrinters(res.data.map(p => ({
        id: p.id, name: p.printer_name, connection: p.ip_address ? "Network" : "USB",
        type: "Thermal", paperWidth: p.paper_width ? `${p.paper_width}mm` : "80mm", status: "Active",
      })));
    }
    setLoading(false);
  };
  useEffect(() => { loadPrinters(); }, []);

  const handleSave = async () => {
    const payload = {
      printer_name: form.name, ip_address: form.ip || null,
      port: form.port || null, paper_width: parseInt(form.paperWidth) || 80,
    };
    const res = editingId
      ? await settingsAPI.updatePrinter(editingId, payload)
      : await settingsAPI.createPrinter(payload);
    if (res.success) { setShowAdd(false); loadPrinters(); } else { alert(res.message || 'Failed to save printer'); }
  };

  const handleDelete = async (id) => {
    await settingsAPI.deletePrinter(id);
    loadPrinters();
  };

  const thStyle = { padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#555", background: "#f8f8f8", borderBottom: "1px solid #e0e0e0" };
  const tdStyle = { padding: "10px 12px", fontSize: 13, color: "#444", borderBottom: "1px solid #f4f4f4" };
  if (loading) return <Card>Loading...</Card>;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionTitle>Receipt Printers</SectionTitle>
        <BtnBlue onClick={openAdd}>+ Add Printer</BtnBlue>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["Printer Name","Type","Connection","Paper Width","Status","Action"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {printers.map(p => (
            <tr key={p.id}>
              <td style={tdStyle}>{p.name}</td>
              <td style={tdStyle}>{p.type}</td>
              <td style={tdStyle}>{p.connection}</td>
              <td style={tdStyle}>{p.paperWidth}</td>
              <td style={tdStyle}><span style={{ background: "#e8f5ee", color: "#1a6b3c", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{p.status}</span></td>
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: 6 }}>
                  <BtnGreen style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => openEdit(p)}>✏️ Edit</BtnGreen>
                  <BtnRed style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleDelete(p.id)}>🗑️ Delete</BtnRed>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editingId ? "Edit Receipt Printer" : "Add Receipt Printer"}
        footer={<><BtnGreen onClick={handleSave}>💾 Save</BtnGreen><BtnBlack onClick={() => setShowAdd(false)}>✕ Close</BtnBlack></>}>
        <FormRow cols={2}>
          <FG label="Printer Name" required><Input value={form.name} onChange={f("name")} placeholder="e.g. Main Counter Printer" /></FG>
          <FG label="Printer Type" required>
            <Select value={form.type} onChange={f("type")}><option>Thermal</option><option>Inkjet</option><option>Laser</option><option>Dot Matrix</option></Select>
          </FG>
        </FormRow>
        <FormRow cols={2}>
          <FG label="Connection Type" required>
            <Select value={form.connection} onChange={f("connection")}><option>USB</option><option>Network / LAN</option><option>Bluetooth</option><option>Serial</option></Select>
          </FG>
          <FG label="Business Location">
            <Select value={form.location} onChange={f("location")}><option value="">Please Select</option><option>Manodtechnologies</option></Select>
          </FG>
        </FormRow>
        {form.connection === "Network / LAN" && (
          <FormRow cols={2}>
            <FG label="IP Address"><Input value={form.ip} onChange={f("ip")} placeholder="192.168.1.100" /></FG>
            <FG label="Port"><Input type="number" value={form.port} onChange={f("port")} /></FG>
          </FormRow>
        )}
        <FormRow cols={2}>
          <FG label="Paper Width">
            <Select value={form.paperWidth} onChange={f("paperWidth")}><option>58mm</option><option>72mm</option><option>80mm</option><option>110mm</option></Select>
          </FG>
          <FG label="Characters Per Line"><Input type="number" value={form.charPerLine} onChange={f("charPerLine")} /></FG>
        </FormRow>
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 7, padding: "10px 14px", fontSize: 12.5, color: "#92400e" }}>
          ⚠️ Make sure the printer driver is installed and the printer is connected before saving.
        </div>
      </Modal>
    </Card>
  );
}
// ─── 6. TAX RATES ─────────────────────────────────────────────────────────────
function TaxRates() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Percentage", rate: "", isDefault: false });
  const f = k => e => setForm({ ...form, [k]: e.target.value });

  const loadTaxes = async () => {
    const res = await settingsAPI.getTaxRates();
    if (res.success) {
      setTaxes(res.data.map(t => ({
        id: t.id, name: t.tax_name, rate: t.rate,
        type: Number(t.rate) === 0 ? "Fixed" : "Percentage", isDefault: t.is_default,
      })));
    }
    setLoading(false);
  };
  useEffect(() => { loadTaxes(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", type: "Percentage", rate: "", isDefault: false });
    setShowAdd(true);
  };

  const openEdit = (tax) => {
    setEditingId(tax.id);
    setForm({ name: tax.name, type: tax.type, rate: String(tax.rate), isDefault: tax.isDefault });
    setShowAdd(true);
  };

  const handleSave = async () => {
    const payload = { tax_name: form.name, rate: form.rate, is_default: form.isDefault };
    const res = editingId
      ? await settingsAPI.updateTaxRate(editingId, payload)
      : await settingsAPI.createTaxRate(payload);
    if (res.success) { setShowAdd(false); loadTaxes(); } else { alert(res.message || 'Failed to save tax rate'); }
  };

  const handleDelete = async (id) => {
    await settingsAPI.deleteTaxRate(id);
    loadTaxes();
  };

  const thStyle = { padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#555", background: "#f8f8f8", borderBottom: "1px solid #e0e0e0" };
  const tdStyle = { padding: "10px 12px", fontSize: 13, color: "#444", borderBottom: "1px solid #f4f4f4" };
if (loading) return <Card>Loading...</Card>;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionTitle>Tax Rates</SectionTitle>
      <BtnBlue onClick={openAdd}>+ Add Tax Rate</BtnBlue>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["Tax Name","Type","Rate","Default","Action"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {taxes.map(tax => (
            <tr key={tax.id}>
              <td style={tdStyle}>{tax.name}</td>
              <td style={tdStyle}>{tax.type}</td>
              <td style={tdStyle}>{tax.type === "Percentage" ? `${tax.rate}%` : `₹${tax.rate}`}</td>
              <td style={tdStyle}>
                {tax.isDefault
                  ? <span style={{ background: "#e8f5ee", color: "#1a6b3c", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>✓ Default</span>
                  : <span style={{ background: "#f0f0f0", color: "#888", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>—</span>}
              </td>
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: 6 }}>
                <BtnGreen style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => { console.log('Edit clicked', tax); openEdit(tax); }}>✏️ Edit</BtnGreen>
                 <BtnRed style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleDelete(tax.id)}>🗑️ Delete</BtnRed>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>Showing {taxes.length} tax rates</p>

  <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editingId ? "Edit Tax Rate" : "Add Tax Rate"}
        footer={<><BtnGreen onClick={handleSave}>💾 Save</BtnGreen><BtnBlack onClick={() => setShowAdd(false)}>✕ Close</BtnBlack></>}>
        <FormRow cols={1}><FG label="Tax Name" required><Input value={form.name} onChange={f("name")} placeholder="e.g. GST 18%" /></FG></FormRow>
        <FormRow cols={2}>
          <FG label="Tax Type" required>
            <Select value={form.type} onChange={f("type")}><option>Percentage</option><option>Fixed</option></Select>
          </FG>
          <FG label={form.type === "Percentage" ? "Rate (%)" : "Amount (₹)"} required>
            <Input type="number" value={form.rate} onChange={f("rate")} placeholder={form.type === "Percentage" ? "e.g. 18" : "e.g. 50"} />
          </FG>
        </FormRow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="defTax" checked={form.isDefault} onChange={() => setForm({ ...form, isDefault: !form.isDefault })} style={{ width: 16, height: 16, accentColor: "#1a6b3c", cursor: "pointer" }} />
          <label htmlFor="defTax" style={{ fontSize: 13, color: "#444", cursor: "pointer" }}>Set as default tax rate</label>
        </div>
      </Modal>
    </Card>
  );
}
// ─── 7. AUDIT LOG ─────────────────────────────────────────────────────────────
function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ module: "", action: "" });
  const [viewLog, setViewLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.module) params.append("module", filters.module);
    if (filters.action) params.append("action", filters.action);
    const token = localStorage.getItem("manod_token");
    const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/audit-logs?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLogs(data.rows || []);
    setTotal(data.total || 0);
    setLoading(false);
  };
  useEffect(() => { loadLogs(); }, [filters.module, filters.action]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this audit log entry? This cannot be undone.")) return;
    const token = localStorage.getItem("manod_token");
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/audit-logs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadLogs();
  };

  const thStyle= { padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#555", background: "#f8f8f8", borderBottom: "1px solid #e0e0e0" };
  const tdStyle = { padding: "10px 12px", fontSize: 13, color: "#444", borderBottom: "1px solid #f4f4f4" };

  return (
    <>
      <SectionTitle>Audit Log</SectionTitle>
      <FormRow cols={2}>
        <FG label="Module">
          <Input placeholder="e.g. PurchaseReturn" value={filters.module} onChange={e => setFilters({ ...filters, module: e.target.value })} />
        </FG>
        <FG label="Action">
          <Select value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })}>
            <option value="">All</option>
            <option>CREATE</option>
            <option>UPDATE</option>
            <option>DELETE</option>
          </Select>
        </FG>
      </FormRow>
      {loading ? (
        <p style={{ fontSize: 13, color: "#888" }}>Loading...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
        <tr>{["Date/Time","Module","Action","Record","User","Details","Action"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={tdStyle}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={tdStyle}>{log.module}</td>
                  <td style={tdStyle}>{log.action}</td>
                  <td style={tdStyle}>{log.record_label || log.record_id || "—"}</td>
                  <td style={tdStyle}>{log.user_name || "—"}</td>
             <td style={tdStyle}>
                    {log.old_data || log.new_data
                      ? <span onClick={() => setViewLog(log)} style={{ color: "#1a6b3c", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>View</span>
                      : "—"}
                  </td>
                  <td style={tdStyle}>
                    <BtnRed style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleDelete(log.id)}>🗑️ Delete</BtnRed>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  <p style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>Showing {logs.length} of {total} entries</p>

      <Modal open={!!viewLog} onClose={() => setViewLog(null)}
        title={viewLog ? `${viewLog.module} — ${viewLog.action} (${viewLog.record_label || viewLog.record_id})` : ""}
        footer={<BtnBlack onClick={() => setViewLog(null)}>✕ Close</BtnBlack>}>
        {viewLog && (
          <div style={{ display: "grid", gridTemplateColumns: viewLog.old_data && viewLog.new_data ? "1fr 1fr" : "1fr", gap: 16 }}>
            {viewLog.old_data && (
              <div>
                <Label>Old Data</Label>
                <pre style={{ background: "#fff5f5", border: "1px solid #f5c2c2", borderRadius: 6, padding: 12, fontSize: 11.5, overflowX: "auto", maxHeight: 400 }}>
                  {JSON.stringify(typeof viewLog.old_data === "string" ? JSON.parse(viewLog.old_data) : viewLog.old_data, null, 2)}
                </pre>
              </div>
            )}
            {viewLog.new_data && (
              <div>
                <Label>New Data</Label>
                <pre style={{ background: "#f5fff7", border: "1px solid #b8e6c1", borderRadius: 6, padding: 12, fontSize: 11.5, overflowX: "auto", maxHeight: 400 }}>
                  {JSON.stringify(typeof viewLog.new_data === "string" ? JSON.parse(viewLog.new_data) : viewLog.new_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── ROOT SETTINGS PAGE───────────────────────────────────────────────────────
// NEW
const TABS = [
  { key: "general", label: "General Settings", icon: "⚙️" },
  { key: "business", label: "Business Settings", icon: "🏢" },
  { key: "locations", label: "Business Locations", icon: "📍" },
  { key: "invoice", label: "Invoice Settings", icon: "🧾" },
  { key: "barcode", label: "Barcode Settings", icon: "📊" },
  { key: "printers", label: "Receipt Printers", icon: "🖨️" },
  { key: "taxrates", label: "Tax Rates", icon: "💹" },
];
export default function Settings({ defaultTab = "business" }) {
  const [active, setActive] = useState(defaultTab);
  useEffect(() => { setActive(defaultTab); }, [defaultTab]);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#f4f6f8", color: "#333" }}>
      <div style={{ padding: "4px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#222", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Manage your business configuration and preferences</p>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 22, flexWrap: "wrap" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActive(tab.key)}
              style={{
                padding: "9px 16px", border: "none", borderRadius: 8, cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                background: active === tab.key ? G.green : "#fff",
                color: active === tab.key ? "#fff" : "#555",
                boxShadow: active === tab.key ? "0 3px 10px rgba(26,107,60,.28)" : "0 1px 3px rgba(0,0,0,.08)",
                border: active === tab.key ? "none" : "1px solid #e0e0e0",
                transition: ".15s",
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      {/* Tab content */}
{active === "general" && <GeneralSettings />}
        {active === "business" && <BusinessSettings />}
        {active === "locations" && <BusinessLocations />}
        {active === "invoice" && <InvoiceSettings />}
        {active === "barcode" && <BarcodeSettings />}
        {active === "printers" && <ReceiptPrinters />}
   {active === "taxrates" && <TaxRates />}
      </div>

      <p style={{ textAlign: "center", color: "#bbb", fontSize: 12, paddingBottom: 20 }}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </p>
    </div>
  );
}
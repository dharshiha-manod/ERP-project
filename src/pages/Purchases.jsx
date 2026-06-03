import { useState } from "react";

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

const SUPPLIERS = ["Supplier A", "Supplier B", "Supplier C"];
const LOCATIONS = ["Manodtechnologies (BL0001)", "Warehouse 2"];
const STATUSES = ["Ordered", "Pending", "Received"];
const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Cheque"];

// ─── ADD PURCHASE FORM (exported as named export) ───────────────────────────
export function AddPurchasePage() {
  const [form, setForm] = useState({
    supplier: "", refNo: "", status: "", address: "",
    location: "Manodtechnologies (BL0001)", payTerm: "",
    discountType: "None", discountAmount: "0", purchaseTax: "None",
    additionalNotes: "", shippingDetails: "", shippingCharges: "0",
    paymentAmount: "0.00", paymentMethod: "Cash", paymentNote: "",
  });
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [docFile, setDocFile] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAddProduct = () => {
    if (!productSearch.trim()) return;
    setProducts((p) => [...p, { name: productSearch, qty: 1, unitCost: 0, discount: 0, lineTotal: 0, margin: 0, sellingPrice: 0 }]);
    setProductSearch("");
  };

  const netTotal = products.reduce((s, p) => s + Number(p.lineTotal), 0);
  const purchaseTotal = netTotal + Number(form.shippingCharges || 0);
  const paymentDue = Math.max(0, purchaseTotal - Number(form.paymentAmount || 0));

  const handleSave = () => {
    if (!form.supplier) return alert("Please select a supplier.");
    if (!form.status) return alert("Please select purchase status.");
    alert("Purchase saved successfully!");
    window.history.back();
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: 1100 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Add Purchase</h2>

      {/* Section 1 */}
      <div style={card}>
        <div style={grid4}>
          <div>
            <label style={lbl}>Supplier:*</label>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={iconBox}>👤</span>
              <select value={form.supplier} onChange={(e) => set("supplier", e.target.value)} style={{ ...inp, borderRadius: "0 4px 4px 0" }}>
                <option value="">Please Select</option>
                {SUPPLIERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Reference No: ℹ️</label>
            <input value={form.refNo} onChange={(e) => set("refNo", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Purchase Date:*</label>
            <div style={{ display: "flex", gap: 0 }}>
              <span style={iconBox}>📅</span>
              <input readOnly value={new Date().toLocaleString()} style={{ ...inp, borderRadius: "0 4px 4px 0", background: "#f5f5f5" }} />
            </div>
          </div>
          <div>
            <label style={lbl}>Purchase Status:* ℹ️</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} style={inp}>
              <option value="">Please Select</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ ...grid4, marginTop: 16 }}>
          <div>
            <label style={lbl}>Address:</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Business Location:* ℹ️</label>
            <select value={form.location} onChange={(e) => set("location", e.target.value)} style={inp}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Pay term: ℹ️</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input placeholder="Pay term" style={{ ...inp, width: 80 }} />
              <select style={inp}><option>Please Select</option></select>
            </div>
          </div>
          <div>
            <label style={lbl}>Attach Document:</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input readOnly value={docFile?.name || ""} style={{ ...inp, flex: 1 }} />
              <label style={{ ...browseBtn, cursor: "pointer" }}>
                📁 Browse..
                <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png" hidden onChange={(e) => setDocFile(e.target.files[0])} />
              </label>
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Max File size: 5MB<br />Allowed: .pdf .csv .zip .doc .docx .jpeg .jpg .png</div>
          </div>
        </div>
      </div>

      {/* Section 2: Products */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button style={importBtn}>Import Products</button>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 10, top: 9, color: "#999" }}>🔍</span>
            <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
              placeholder="Enter Product name / SKU / Scan bar code"
              style={{ ...inp, paddingLeft: 32 }} />
          </div>
          <button onClick={handleAddProduct} style={{ background: "none", border: "none", color: "#3498db", fontWeight: 600, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>＋ Add new product</button>
        </div>
        <table style={tbl}>
          <thead>
            <tr style={{ background: "#1a5c38", color: "#fff" }}>
              {["#", "Product Name", "Purchase Qty", "Unit Cost (Before Discount)", "Discount %", "Unit Cost (Before Tax)", "Line Total", "Profit Margin %", "Unit Selling Price (Inc. tax)", "🗑️"].map((h) => (
                <th key={h} style={{ padding: "10px 10px", textAlign: "left", fontWeight: 600, fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0
              ? <tr><td colSpan={10} style={emptyCell}>No products added</td></tr>
              : products.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdS}>{i + 1}</td>
                  <td style={tdS}>{p.name}</td>
                  <td style={tdS}><input type="number" defaultValue={1} style={{ width: 60, ...inpSm }} /></td>
                  <td style={tdS}><input type="number" defaultValue={0} style={{ width: 80, ...inpSm }} /></td>
                  <td style={tdS}><input type="number" defaultValue={0} style={{ width: 60, ...inpSm }} /></td>
                  <td style={tdS}>0.00</td><td style={tdS}>0.00</td>
                  <td style={tdS}><input type="number" defaultValue={0} style={{ width: 60, ...inpSm }} /></td>
                  <td style={tdS}>0.00</td>
                  <td style={tdS}><button onClick={() => setProducts(products.filter((_, idx) => idx !== i))}
                    style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 16 }}>🗑️</button></td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={{ textAlign: "right", marginTop: 12, fontSize: 14 }}>
          <div>Total Items: <b>{products.length}</b></div>
          <div>Net Total Amount: <b>₹{netTotal.toFixed(2)}</b></div>
        </div>
      </div>

      {/* Section 3: Discount/Tax */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={grid3}>
          <div>
            <label style={lbl}>Discount Type:</label>
            <select value={form.discountType} onChange={(e) => set("discountType", e.target.value)} style={inp}>
              {["None", "Fixed", "Percentage"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Discount Amount:</label>
            <input value={form.discountAmount} onChange={(e) => set("discountAmount", e.target.value)} style={inp} />
          </div>
          <div style={{ textAlign: "right", paddingTop: 28 }}>
            <span style={{ fontWeight: 600 }}>Discount:(-) {Number(form.discountAmount || 0).toFixed(2)}</span>
          </div>
        </div>
        <div style={{ ...grid3, marginTop: 16 }}>
          <div>
            <label style={lbl}>Purchase Tax:</label>
            <select value={form.purchaseTax} onChange={(e) => set("purchaseTax", e.target.value)} style={inp}>
              {["None", "GST 5%", "GST 12%", "GST 18%"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div /><div style={{ textAlign: "right", paddingTop: 28 }}><span style={{ fontWeight: 600 }}>Purchase Tax:(+) 0.00</span></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={lbl}>Additional Notes</label>
          <textarea value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)}
            rows={3} style={{ ...inp, resize: "vertical" }} />
        </div>
      </div>

      {/* Section 4: Shipping */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Shipping Details:</label>
            <input value={form.shippingDetails} onChange={(e) => set("shippingDetails", e.target.value)} style={inp} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>(+) Additional Shipping charges:</label>
            <input value={form.shippingCharges} onChange={(e) => set("shippingCharges", e.target.value)} style={inp} />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button style={{ background: "#6c47ff", color: "#fff", border: "none", borderRadius: 4, padding: "9px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            ＋ Add additional expenses ▾
          </button>
        </div>
        <div style={{ textAlign: "right", marginTop: 12, fontWeight: 600 }}>Purchase Total: ₹{purchaseTotal.toFixed(2)}</div>
      </div>

      {/* Section 5: Payment */}
      <div style={{ ...card, marginTop: 16 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>Add payment</h3>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Advance Balance: 0</div>
        <div style={grid2}>
          <div>
            <label style={lbl}>Amount:*</label>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>💵</span>
              <input value={form.paymentAmount} onChange={(e) => set("paymentAmount", e.target.value)}
                style={{ ...inp, borderRadius: "0 4px 4px 0" }} />
            </div>
          </div>
          <div>
            <label style={lbl}>Paid on:*</label>
            <div style={{ display: "flex" }}>
              <span style={iconBox}>📅</span>
              <input readOnly value={new Date().toLocaleString()} style={{ ...inp, borderRadius: "0 4px 4px 0", background: "#f5f5f5" }} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={lbl}>Payment Method:*</label>
          <div style={{ display: "flex" }}>
            <span style={iconBox}>💵</span>
            <select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}
              style={{ ...inp, borderRadius: "0 4px 4px 0" }}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={lbl}>Payment note:</label>
          <textarea value={form.paymentNote} onChange={(e) => set("paymentNote", e.target.value)}
            rows={3} style={{ ...inp, resize: "vertical" }} />
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />
        <div style={{ textAlign: "right", fontWeight: 600, marginBottom: 16 }}>Payment due: {paymentDue.toFixed(2)}</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={handleSave} style={{ background: "#6c47ff", color: "#fff", border: "none", borderRadius: 6, padding: "12px 60px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LIST PURCHASES (default export) ───────────────────────────────────────
export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const filtered = purchases.filter((p) =>
    Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>Purchases</h2>
      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001" }}>
        <span style={{ fontSize: 14, color: "#555" }}>🔽 Filters</span>
      </div>
      <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>All Purchases</h3>
          <a href="/purchases/create" style={{ background: "#6c47ff", color: "#fff", border: "none", borderRadius: 50, padding: "10px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>＋ Add</a>
        </div>
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
              { label: "📄 Export CSV", fn: () => exportCSV(filtered, ["date", "refNo", "location", "supplier", "purchaseStatus", "paymentStatus", "grandTotal", "paymentDue", "addedBy"], "purchases.csv") },
              { label: "📊 Export Excel", fn: () => exportCSV(filtered, ["date", "refNo", "location", "supplier", "purchaseStatus", "paymentStatus", "grandTotal", "paymentDue", "addedBy"], "purchases.xls") },
              { label: "🖨️ Print", fn: () => window.print() },
              { label: "👁️ Column visibility", fn: () => alert("Column visibility") },
              { label: "📑 Export PDF", fn: () => exportPDF("Purchases") },
            ].map(({ label, fn }) => (
              <button key={label} onClick={fn} style={xBtn}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>{label}</button>
            ))}
            <input placeholder="Search ..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "1px solid #ccc", borderRadius: 4, padding: "6px 12px", fontSize: 13, width: 160 }} />
          </div>
        </div>
        <table style={tbl}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
              {["Action", "Date", "Reference No", "Location", "Supplier", "Purchase Status", "Payment Status", "Grand Total", "Payment due ℹ️", "Added By"].map((h) => (
                <th key={h} style={{ padding: "12px 10px", textAlign: "left", fontWeight: 600, color: "#333", fontSize: 14 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showEntries).length === 0
              ? <tr><td colSpan={10} style={emptyCell}>No data available in table</td></tr>
              : filtered.slice(0, showEntries).map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={tdS}><button style={{ background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>View</button></td>
                  <td style={tdS}>{p.date}</td><td style={tdS}>{p.refNo}</td>
                  <td style={tdS}>{p.location}</td><td style={tdS}>{p.supplier}</td>
                  <td style={tdS}>{p.purchaseStatus}</td><td style={tdS}>{p.paymentStatus}</td>
                  <td style={tdS}>{p.grandTotal}</td><td style={tdS}>{p.paymentDue}</td>
                  <td style={tdS}>{p.addedBy}</td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f7f7f7", fontWeight: 600 }}>
              <td colSpan={7} style={{ padding: "10px 10px" }}>Total:</td>
              <td style={{ padding: "10px 10px" }}>₹{filtered.reduce((s, p) => s + parseFloat(p.grandTotal?.replace("₹", "") || 0), 0).toFixed(2)}</td>
              <td colSpan={2} style={{ padding: "10px 10px", fontSize: 12 }}>
                Purchase Due - ₹0.00<br />Purchase Return - ₹0.00
              </td>
            </tr>
          </tfoot>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13, color: "#555" }}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>Previous</button><button style={pgBtn}>Next</button></div>
        </div>
      </div>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" };
const grid4 = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 };
const grid2 = { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 };
const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#333" };
const inp = { border: "1px solid #ccc", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" };
const inpSm = { border: "1px solid #ccc", borderRadius: 4, padding: "6px 8px", fontSize: 12, boxSizing: "border-box" };
const iconBox = { padding: "8px 10px", border: "1px solid #ccc", borderRight: "none", borderRadius: "4px 0 0 4px", background: "#f5f5f5", whiteSpace: "nowrap" };
const browseBtn = { background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 13, fontWeight: 600 };
const importBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 4, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const tdS = { padding: "10px 10px" };
const emptyCell = { textAlign: "center", padding: 32, color: "#888" };
const xBtn = { padding: "6px 14px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 };
const pgBtn = { border: "1px solid #ccc", background: "#fff", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13 };
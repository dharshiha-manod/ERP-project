import { useState } from "react";

const exportCSV = (data, headers, filename) => {
  const csvRows = [headers.join(",")];
  data.forEach((row) => csvRows.push(headers.map((h) => row[h] ?? "").join(",")));
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const exportPDF = (title) => {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>${title}</title></head><body><h2>${title}</h2><p>No data.</p></body></html>`);
  win.document.close(); win.print();
};

const SUPPLIERS = ["Supplier A", "Supplier B", "Supplier C"];
const LOCATIONS = ["Manodtechnologies (BL0001)", "Warehouse 2"];

function AddPurchaseReturnForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    supplier: "", location: "", refNo: "",
    date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    purchaseTax: "None",
  });
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [docFile, setDocFile] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSearch = () => {
    if (!productSearch.trim()) return;
    setProducts((prev) => [
      ...prev,
      { name: productSearch, qty: 1, unitPrice: 0, subtotal: 0 },
    ]);
    setProductSearch("");
  };

  const totalAmount = products.reduce((s, p) => s + Number(p.subtotal), 0);

  const handleSubmit = () => {
    if (!form.supplier) return alert("Please select a supplier.");
    if (!form.location) return alert("Please select a business location.");
    onSubmit({
      date: new Date().toLocaleDateString(),
      refNo: form.refNo || "—",
      parentPurchase: "—",
      location: form.location,
      supplier: form.supplier,
      paymentStatus: "Due",
      grandTotal: `₹${totalAmount.toFixed(2)}`,
      paymentDue: `₹${totalAmount.toFixed(2)}`,
    });
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: 1000 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Add Purchase Return</h2>

      {/* Header fields */}
      <div style={card}>
        <div style={grid4}>
          <div>
            <label style={lbl}>Supplier:*</label>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={iconBox}>👤</span>
              <select value={form.supplier} onChange={(e) => set("supplier", e.target.value)} style={{ ...inp, flex: 1 }}>
                <option value="">Please Select</option>
                {SUPPLIERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Business Location:*</label>
            <select value={form.location} onChange={(e) => set("location", e.target.value)} style={inp}>
              <option value="">Please Select</option>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Reference No:</label>
            <input value={form.refNo} onChange={(e) => set("refNo", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Date:*</label>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={iconBox}>📅</span>
              <input value={form.date} readOnly style={{ ...inp, flex: 1, background: "#f5f5f5" }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={lbl}>Attach Document:</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input readOnly value={docFile?.name || ""} style={{ ...inp, maxWidth: 260 }} />
            <label style={{ ...browseBtn, cursor: "pointer" }}>
              📁 Browse..
              <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png" hidden onChange={(e) => setDocFile(e.target.files[0])} />
            </label>
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
            Max File size: 5MB<br />Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png
          </div>
        </div>
      </div>

      {/* Search Products */}
      <div style={{ ...card, marginTop: 16 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Search Products</h3>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ position: "relative", width: "60%" }}>
            <span style={{ position: "absolute", left: 10, top: 9, color: "#999" }}>🔍</span>
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search Products"
              style={{ ...inp, paddingLeft: 34 }}
            />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
              {["Product", "Quantity", "Unit Price", "Subtotal", "🗑️"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#333" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>No products added</td></tr>
            ) : products.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={td}>{p.name}</td>
                <td style={td}>
                  <input type="number" defaultValue={1} style={{ width: 70, ...inp }}
                    onChange={(e) => { const arr = [...products]; arr[i].qty = e.target.value; arr[i].subtotal = e.target.value * arr[i].unitPrice; setProducts([...arr]); }} />
                </td>
                <td style={td}>
                  <input type="number" defaultValue={0} style={{ width: 90, ...inp }}
                    onChange={(e) => { const arr = [...products]; arr[i].unitPrice = e.target.value; arr[i].subtotal = arr[i].qty * e.target.value; setProducts([...arr]); }} />
                </td>
                <td style={td}>₹{Number(p.subtotal).toFixed(2)}</td>
                <td style={td}>
                  <button onClick={() => setProducts(products.filter((_, idx) => idx !== i))}
                    style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 16 }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tax + Total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 }}>
          <div>
            <label style={lbl}>Purchase Tax:</label>
            <select value={form.purchaseTax} onChange={(e) => set("purchaseTax", e.target.value)}
              style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 32px 8px 10px", fontSize: 13, minWidth: 200 }}>
              {["None", "GST 5%", "GST 12%", "GST 18%"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            Total Amount: ₹{totalAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
        <button onClick={handleSubmit} style={submitBtn}>Submit</button>
      </div>
    </div>
  );
}

export default function PurchaseReturn() {
  const [view, setView] = useState("list");
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const filtered = returns.filter((r) =>
    Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (view === "add") {
    return (
      <AddPurchaseReturnForm
        onSubmit={(r) => { setReturns((prev) => [...prev, r]); setView("list"); }}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>Purchase Return</h2>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001" }}>
        <span style={{ fontSize: 14, color: "#555" }}>🔽 Filters</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>All Purchase Returns</h3>
          <button onClick={() => setView("add")} style={addRoundBtn}>＋ Add</button>
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
              { label: "📄 Export CSV", action: () => exportCSV(filtered, ["date", "refNo", "parentPurchase", "location", "supplier", "paymentStatus", "grandTotal", "paymentDue"], "purchase_returns.csv") },
              { label: "📊 Export Excel", action: () => exportCSV(filtered, ["date", "refNo", "parentPurchase", "location", "supplier", "paymentStatus", "grandTotal", "paymentDue"], "purchase_returns.xls") },
              { label: "🖨️ Print", action: () => window.print() },
              { label: "👁️ Column visibility", action: () => alert("Column visibility") },
              { label: "📑 Export PDF", action: () => exportPDF("Purchase Returns") },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} style={exportBtn}
                onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                onMouseLeave={(e) => (e.target.style.background = "#fff")}>
                {label}
              </button>
            ))}
            <input type="text" placeholder="Search ..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "1px solid #ccc", borderRadius: 4, padding: "6px 12px", fontSize: 13, width: 160 }} />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
              {["Date", "Reference No", "Parent Purchase", "Location", "Supplier", "Payment Status", "Grand Total", "Payment due ℹ️", "Action"].map((h) => (
                <th key={h} style={{ padding: "12px 10px", textAlign: "left", fontWeight: 600, color: "#333" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showEntries).length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#888" }}>No data available in table</td></tr>
            ) : filtered.slice(0, showEntries).map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 10px" }}>{r.date}</td>
                <td style={{ padding: "10px 10px" }}>{r.refNo}</td>
                <td style={{ padding: "10px 10px" }}>{r.parentPurchase}</td>
                <td style={{ padding: "10px 10px" }}>{r.location}</td>
                <td style={{ padding: "10px 10px" }}>{r.supplier}</td>
                <td style={{ padding: "10px 10px" }}>{r.paymentStatus}</td>
                <td style={{ padding: "10px 10px" }}>{r.grandTotal}</td>
                <td style={{ padding: "10px 10px" }}>{r.paymentDue}</td>
                <td style={{ padding: "10px 10px" }}>
                  <button style={{ background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f7f7f7", fontWeight: 600 }}>
              <td colSpan={6} style={{ padding: "10px 10px" }}>Total:</td>
              <td style={{ padding: "10px 10px" }}>₹{filtered.reduce((s, r) => s + parseFloat(r.grandTotal?.replace("₹", "") || 0), 0).toFixed(2)}</td>
              <td style={{ padding: "10px 10px" }}>₹{filtered.reduce((s, r) => s + parseFloat(r.paymentDue?.replace("₹", "") || 0), 0).toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13, color: "#555" }}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={pgBtn}>Previous</button>
            <button style={pgBtn}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" };
const grid4 = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 };
const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#333" };
const inp = { border: "1px solid #ccc", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" };
const td = { padding: "10px 10px" };
const iconBox = { padding: "8px 10px", border: "1px solid #ccc", borderRight: "none", borderRadius: "4px 0 0 4px", background: "#f5f5f5" };
const browseBtn = { background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 13, fontWeight: 600 };
const submitBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 6, padding: "12px 40px", fontWeight: 700, fontSize: 15, cursor: "pointer" };
const cancelBtn = { background: "#555", color: "#fff", border: "none", borderRadius: 6, padding: "12px 30px", fontWeight: 700, fontSize: 15, cursor: "pointer" };
const addRoundBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 50, padding: "10px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer" };
const exportBtn = { padding: "6px 14px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 };
const pgBtn = { border: "1px solid #ccc", background: "#fff", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13 };
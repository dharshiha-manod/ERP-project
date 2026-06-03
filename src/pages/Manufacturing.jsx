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

const PRODUCTS = ["Product A", "Product B", "Product C", "Product D"];
const RECIPE_OPTS = ["None", "Recipe 1", "Recipe 2"];

function RecipeTab() {
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [chosenProduct, setChosenProduct] = useState("");
  const [copyFrom, setCopyFrom] = useState("None");
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const filtered = recipes.filter((r) => r.recipe.toLowerCase().includes(search.toLowerCase()));

  const handleContinue = () => {
    if (!chosenProduct) return alert("Please select a product.");
    setRecipes((p) => [...p, { recipe: chosenProduct, category: "General", subCategory: "-", quantity: 1, price: "₹0.00", unitPrice: "₹0.00" }]);
    setShowModal(false); setChosenProduct(""); setCopyFrom("None");
  };

  return (
    <div>
      <h2 style={pageTitle}>Recipe</h2>
      <div style={tableCard}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={() => setShowModal(true)} style={addRoundBtn}>＋ Add</button>
        </div>
        <TableToolbar showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch}
          onExportCSV={() => exportCSV(filtered, ["recipe", "category", "subCategory", "quantity", "price", "unitPrice"], "recipes.csv")}
          onExportExcel={() => exportCSV(filtered, ["recipe", "category", "subCategory", "quantity", "price", "unitPrice"], "recipes.xls")}
          onExportPDF={() => exportPDF("Recipes")} />
        <table style={tbl}>
          <thead>
            <tr style={theadRow}>
              <th style={th}><input type="checkbox" /></th>
              {["Recipe", "Category", "Sub category", "Quantity", "Price ℹ️", "Unit Price", "Action"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showEntries).length === 0
              ? <tr><td colSpan={8} style={emptyCell}>No data available in table</td></tr>
              : filtered.slice(0, showEntries).map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}><input type="checkbox" /></td>
                  <td style={td}>{r.recipe}</td><td style={td}>{r.category}</td>
                  <td style={td}>{r.subCategory}</td><td style={td}>{r.quantity}</td>
                  <td style={td}>{r.price}</td><td style={td}>{r.unitPrice}</td>
                  <td style={td}>
                    <button onClick={() => setRecipes(recipes.filter((_, idx) => idx !== i))}
                      style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ border: "1px solid #e74c3c", color: "#e74c3c", background: "#fff", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
            onClick={() => alert("Update product price")}>Update product price</button>
          <span style={{ color: "#3498db", cursor: "pointer" }}>ℹ️</span>
        </div>
        <div style={paginationRow}>
          <span style={{ fontSize: 13, color: "#555" }}>
            Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries
          </span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>Previous</button><button style={pgBtn}>Next</button></div>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowModal(false)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Choose Product</h3>
            <label style={lbl}>Choose Product:</label>
            <select value={chosenProduct} onChange={(e) => setChosenProduct(e.target.value)} style={sel}>
              <option value="">Please Select</option>
              {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <label style={{ ...lbl, marginTop: 20 }}>Copy from recipe:</label>
            <select value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)} style={sel}>
              {RECIPE_OPTS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
              <button onClick={() => setShowModal(false)} style={closeBtn}>Close</button>
              <button onClick={handleContinue} style={continueBtn}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductionTab() {
  const [productions, setProductions] = useState([]);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ refNo: "", location: "", product: "", qty: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const filtered = productions.filter((p) => Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.product || !form.qty) return alert("Fill required fields.");
    setProductions((p) => [...p, { date: new Date().toLocaleDateString(), refNo: form.refNo || "—", location: form.location || "—", product: form.product, quantity: form.qty, totalCost: "₹0.00" }]);
    setShowModal(false); setForm({ refNo: "", location: "", product: "", qty: "" });
  };

  return (
    <div>
      <h2 style={pageTitle}>Production</h2>
      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001" }}>
        <span style={{ fontSize: 14, color: "#555" }}>🔽 Filters</span>
      </div>
      <div style={tableCard}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={() => setShowModal(true)} style={addRoundBtn}>＋ Add</button>
        </div>
        <TableToolbar showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch}
          onExportCSV={() => exportCSV(filtered, ["date", "refNo", "location", "product", "quantity", "totalCost"], "production.csv")}
          onExportExcel={() => exportCSV(filtered, ["date", "refNo", "location", "product", "quantity", "totalCost"], "production.xls")}
          onExportPDF={() => exportPDF("Production")} />
        <table style={tbl}>
          <thead>
            <tr style={theadRow}>
              {["Date", "Reference No", "Location", "Product", "Quantity", "Total Cost", "Action"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showEntries).length === 0
              ? <tr><td colSpan={7} style={emptyCell}>No data available in table</td></tr>
              : filtered.slice(0, showEntries).map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}>{p.date}</td><td style={td}>{p.refNo}</td>
                  <td style={td}>{p.location}</td><td style={td}>{p.product}</td>
                  <td style={td}>{p.quantity}</td><td style={td}>{p.totalCost}</td>
                  <td style={td}><button style={{ background: "#3498db", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>View</button></td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={paginationRow}>
          <span style={{ fontSize: 13, color: "#555" }}>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>Previous</button><button style={pgBtn}>Next</button></div>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, minWidth: 500 }}>
            <button onClick={() => setShowModal(false)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Add Production</h3>
            {[["Reference No", "refNo"], ["Location", "location"], ["Product *", "product"], ["Quantity *", "qty"]].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={lbl}>{label}:</label>
                <input value={form[key]} onChange={(e) => set(key, e.target.value)} style={sel} placeholder={label} />
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={closeBtn}>Close</button>
              <button onClick={handleAdd} style={continueBtn}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [prefix, setPrefix] = useState("");
  const [disableEdit, setDisableEdit] = useState(false);
  const [updatePrice, setUpdatePrice] = useState(false);

  return (
    <div>
      <h2 style={pageTitle}>Settings</h2>
      <div style={tableCard}>
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ background: "#1a5c38", color: "#fff", borderRadius: 6, padding: "12px 28px", fontWeight: 700, fontSize: 15, height: "fit-content" }}>Settings</div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, alignItems: "flex-start" }}>
            <div>
              <label style={lbl}>Production Ref No. prefix:</label>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)}
                placeholder="Production Ref No. prefix"
                style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 28 }}>
              <input type="checkbox" checked={disableEdit} onChange={(e) => setDisableEdit(e.target.checked)} id="disableEdit" />
              <label htmlFor="disableEdit" style={{ fontSize: 14, cursor: "pointer" }}>Disable editing ingredients quantity in production</label>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 28 }}>
              <input type="checkbox" checked={updatePrice} onChange={(e) => setUpdatePrice(e.target.checked)} id="updatePrice" />
              <label htmlFor="updatePrice" style={{ fontSize: 14, cursor: "pointer" }}>Update product purchase price based on production price, on finalizing production</label>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
          <button onClick={() => alert("Settings saved!")} style={continueBtn}>Update</button>
        </div>
        <div style={{ marginTop: 40, fontSize: 13, color: "#777" }}>
          Manufacturing module version - <span style={{ color: "#e67e22", fontWeight: 700 }}>4.0</span>
        </div>
      </div>
    </div>
  );
}

function ManufacturingReportTab() {
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  return (
    <div>
      <h2 style={pageTitle}>Manufacturing Report</h2>
      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001" }}>
        <span style={{ fontSize: 14, color: "#555" }}>🔽 Filters</span>
      </div>
      <div style={tableCard}>
        <TableToolbar showEntries={showEntries} setShowEntries={setShowEntries} search={search} setSearch={setSearch}
          onExportCSV={() => exportCSV([], ["product", "qty", "cost"], "mfg_report.csv")}
          onExportExcel={() => exportCSV([], ["product", "qty", "cost"], "mfg_report.xls")}
          onExportPDF={() => exportPDF("Manufacturing Report")} />
        <table style={tbl}>
          <thead>
            <tr style={theadRow}>
              {["Date", "Reference No", "Location", "Product", "Quantity", "Total Cost", "Action"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={7} style={emptyCell}>No data available in table</td></tr>
          </tbody>
        </table>
        <div style={paginationRow}>
          <span style={{ fontSize: 13, color: "#555" }}>Showing 0 to 0 of 0 entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>Previous</button><button style={pgBtn}>Next</button></div>
        </div>
      </div>
    </div>
  );
}

const TABS = ["Recipe", "Production", "Settings", "Manufacturing Report"];

export default function Manufacturing() {
  const [activeTab, setActiveTab] = useState("Recipe");

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#222" }}>
      <div style={{ display: "flex", background: "#fff", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #e0e0e0" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderRight: "1px solid #e0e0e0", color: "#555", fontSize: 14, fontWeight: 500 }}>
          🏭 Manufacturing
        </div>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "12px 20px", border: "none", background: "transparent",
            borderBottom: activeTab === tab ? "3px solid #1a5c38" : "3px solid transparent",
            color: activeTab === tab ? "#1a5c38" : "#555",
            fontWeight: activeTab === tab ? 700 : 400,
            cursor: "pointer", fontSize: 14, marginBottom: -2, transition: "all 0.15s",
          }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 24 }}>
        {activeTab === "Recipe" && <RecipeTab />}
        {activeTab === "Production" && <ProductionTab />}
        {activeTab === "Settings" && <SettingsTab />}
        {activeTab === "Manufacturing Report" && <ManufacturingReportTab />}
      </div>
    </div>
  );
}

const pageTitle = { margin: "0 0 20px", fontSize: 26, fontWeight: 700 };
const tableCard = { background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" };
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const theadRow = { background: "#f7f7f7", borderBottom: "2px solid #e0e0e0" };
const th = { padding: "12px 12px", textAlign: "left", fontWeight: 600, color: "#333" };
const td = { padding: "10px 12px" };
const emptyCell = { textAlign: "center", padding: 32, color: "#888" };
const paginationRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 };
const pgBtn = { border: "1px solid #ccc", background: "#fff", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13 };
const xBtn = { padding: "6px 14px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 };
const addRoundBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 50, padding: "10px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle = { background: "#fff", borderRadius: 10, padding: 32, minWidth: 480, maxWidth: 540, boxShadow: "0 8px 32px #0002", position: "relative" };
const modalClose = { position: "absolute", right: 16, top: 14, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666" };
const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 };
const sel = { width: "100%", border: "1px solid #ccc", borderRadius: 6, padding: "10px 12px", fontSize: 14, background: "#fff", boxSizing: "border-box" };
const closeBtn = { background: "#333", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 };
const continueBtn = { background: "#6c47ff", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 };
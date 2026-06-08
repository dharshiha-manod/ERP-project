import { useState } from "react";

// ── Toast Notification ─────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const colors = { success: "#1a5c38", error: "#dc2626", info: "#3b82f6" };
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: "#fff", borderRadius: 10, padding: "14px 20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      borderLeft: `5px solid ${colors[type] || "#1a5c38"}`,
      display: "flex", alignItems: "center", gap: 12, minWidth: 280, maxWidth: 380,
      animation: "slideIn 0.25s ease",
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{ fontSize: 20 }}>{icons[type] || "✅"}</span>
      <span style={{ fontSize: 14, color: "#111", flex: 1, fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>×</button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  return { showToast, ToastEl };
}

// ── Export helpers ─────────────────────────────────────────────────────────────
const exportCSV = (data, headers, filename) => {
  const rows = [
    headers.join(","),
    ...data.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
};

const exportExcel = (data, headers, filename) => {
  const xmlRows = data.map((r) => `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${String(r[h] ?? "")}</Data></Cell>`).join("")}</Row>`).join("");
  const headerRow = `<Row>${headers.map((h) => `<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>`;
  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="header"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Sheet1"><Table>${headerRow}${xmlRows}</Table></Worksheet></Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
};

const exportPDF = (title, columns, data) => {
  const w = window.open("", "_blank");
  const tableRows = data.length === 0
    ? `<tr><td colspan="${columns.length}" style="text-align:center;padding:20px;color:#888;">No data available</td></tr>`
    : data.map((r) => `<tr>${columns.map((c) => `<td style="padding:8px 12px;border-bottom:1px solid #eee;">${r[c.key] ?? ""}</td>`).join("")}</tr>`).join("");
  const headerCells = columns.map((c) => `<th style="padding:10px 12px;text-align:left;background:#1a5c38;color:#fff;font-weight:600;">${c.label}</th>`).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#222;}h2{color:#1a5c38;margin-bottom:20px;}table{width:100%;border-collapse:collapse;font-size:13px;}@media print{button{display:none!important}}</style></head>
    <body><h2>${title}</h2><p style="color:#666;margin-bottom:16px;">Generated: ${new Date().toLocaleDateString()}</p>
    <table><thead><tr>${headerCells}</tr></thead><tbody>${tableRows}</tbody></table>
    <div style="margin-top:40px;text-align:right;"><button onclick="window.print()" style="background:#1a5c38;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;">🖨️ Print</button></div></body></html>`);
  w.document.close();
};

// ── Column Visibility Modal ────────────────────────────────────────────────────
function ColumnVisibilityModal({ columns, visibleCols, setVisibleCols, onClose }) {
  const toggle = (key) => setVisibleCols((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, minWidth: 260, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={modalClose}>×</button>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>Toggle Columns</h3>
        {columns.map((col) => (
          <label key={col.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={visibleCols.includes(col.key)} onChange={() => toggle(col.key)} style={{ width: 16, height: 16, accentColor: "#1a5c38" }} />
            {col.label}
          </label>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={greenBtn}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Export Toolbar — exact match to image 3 ───────────────────────────────────
function TableToolbar({ showEntries, setShowEntries, search, setSearch, onExportCSV, onExportExcel, onExportPDF, columns, visibleCols, setVisibleCols }) {
  const [showColModal, setShowColModal] = useState(false);

  const exportBtns = [
    {
      label: "Export CSV",
      color: "#1a5c38",
      bg: "#e8f5ee",
      border: "#1a5c38",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      fn: onExportCSV,
      tag: "csv",
    },
    {
      label: "Export Excel",
      color: "#1a5c38",
      bg: "#e8f5ee",
      border: "#1a5c38",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
      ),
      fn: onExportExcel,
      tag: "xls",
    },
    {
      label: "Print",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#93c5fd",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
      ),
      fn: () => window.print(),
    },
    {
      label: "Column visibility",
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#c4b5fd",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
        </svg>
      ),
      fn: () => setShowColModal(true),
    },
    {
      label: "Export PDF",
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fca5a5",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
        </svg>
      ),
      fn: onExportPDF,
      hasDropdown: true,
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#555" }}>Show</span>
        <select value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer" }}>
          {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#555" }}>entries</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {exportBtns.map(({ label, icon, color, bg, border, fn, tag, hasDropdown }) => (
          <button key={label} onClick={fn}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 13px",
              border: `1px solid ${border || "#d1d5db"}`,
              borderRadius: 6,
              background: bg || "#fff",
              color: color,
              cursor: "pointer", fontSize: 13, fontWeight: 500,
              transition: "all 0.15s",
              position: "relative",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.82"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {/* Coloured badge for CSV/XLS */}
            {tag && (
              <span style={{ background: color, color: "#fff", borderRadius: 3, fontSize: 9, fontWeight: 800, padding: "1px 4px", letterSpacing: 0.5, textTransform: "uppercase" }}>{tag}</span>
            )}
            {!tag && icon}
            {label}
            {hasDropdown && <span style={{ marginLeft: 2, fontSize: 11 }}>▼</span>}
          </button>
        ))}
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 12px", fontSize: 13, width: 160, outline: "none", color: "#374151" }} />
      </div>
      {showColModal && columns && (
        <ColumnVisibilityModal columns={columns} visibleCols={visibleCols} setVisibleCols={setVisibleCols} onClose={() => setShowColModal(false)} />
      )}
    </div>
  );
}

// ── Sample Data ────────────────────────────────────────────────────────────────
const SAMPLE_RECIPES = [
  { recipe: "Masala Chai Blend", category: "Beverages", subCategory: "Hot Drinks", quantity: 50, price: "₹1,250.00", unitPrice: "₹25.00" },
  { recipe: "Whole Wheat Bread", category: "Bakery", subCategory: "Breads", quantity: 30, price: "₹2,100.00", unitPrice: "₹70.00" },
  { recipe: "Tomato Ketchup", category: "Condiments", subCategory: "Sauces", quantity: 100, price: "₹4,500.00", unitPrice: "₹45.00" },
  { recipe: "Mango Pickle", category: "Preserved Foods", subCategory: "Pickles", quantity: 75, price: "₹3,375.00", unitPrice: "₹45.00" },
  { recipe: "Coconut Oil", category: "Oils & Fats", subCategory: "Cooking Oil", quantity: 60, price: "₹7,200.00", unitPrice: "₹120.00" },
  { recipe: "Herbal Soap Bar", category: "Personal Care", subCategory: "Soap", quantity: 200, price: "₹6,000.00", unitPrice: "₹30.00" },
];

const SAMPLE_PRODUCTIONS = [
  { date: "08/06/2026", refNo: "PRD-0001", location: "Unit A - Chennai", product: "Masala Chai Blend", quantity: 50, totalCost: "₹1,250.00" },
  { date: "07/06/2026", refNo: "PRD-0002", location: "Unit B - Coimbatore", product: "Whole Wheat Bread", quantity: 30, totalCost: "₹2,100.00" },
  { date: "06/06/2026", refNo: "PRD-0003", location: "Unit A - Chennai", product: "Tomato Ketchup", quantity: 100, totalCost: "₹4,500.00" },
  { date: "05/06/2026", refNo: "PRD-0004", location: "Unit C - Madurai", product: "Mango Pickle", quantity: 75, totalCost: "₹3,375.00" },
  { date: "04/06/2026", refNo: "PRD-0005", location: "Unit B - Coimbatore", product: "Coconut Oil", quantity: 60, totalCost: "₹7,200.00" },
];

const PRODUCTS = ["Masala Chai Blend", "Whole Wheat Bread", "Tomato Ketchup", "Mango Pickle", "Coconut Oil", "Herbal Soap Bar", "Turmeric Powder", "Cumin Seeds Mix"];
const LOCATIONS = ["Unit A - Chennai", "Unit B - Coimbatore", "Unit C - Madurai", "Unit D - Trichy"];
const RECIPE_OPTS = ["None", ...SAMPLE_RECIPES.map((r) => r.recipe)];
const CATEGORIES = ["Beverages", "Bakery", "Condiments", "Preserved Foods", "Oils & Fats", "Personal Care"];
const SUB_CATEGORIES = {
  Beverages: ["Hot Drinks", "Cold Drinks", "Juices"],
  Bakery: ["Breads", "Cakes", "Pastries"],
  Condiments: ["Sauces", "Chutneys", "Spreads"],
  "Preserved Foods": ["Pickles", "Jams", "Dried Foods"],
  "Oils & Fats": ["Cooking Oil", "Butter", "Ghee"],
  "Personal Care": ["Soap", "Shampoo", "Cream"],
};

// ── Recipe Tab ─────────────────────────────────────────────────────────────────
function RecipeTab() {
  const { showToast, ToastEl } = useToast();
  const [recipes, setRecipes] = useState(SAMPLE_RECIPES);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null = add mode
  const [chosenProduct, setChosenProduct] = useState("");
  const [chosenCategory, setChosenCategory] = useState("");
  const [chosenSubCategory, setChosenSubCategory] = useState("");
  const [chosenQuantity, setChosenQuantity] = useState("");
  const [chosenPrice, setChosenPrice] = useState("");
  const [copyFrom, setCopyFrom] = useState("None");
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [selected, setSelected] = useState([]);
  const [viewData, setViewData] = useState(null);

  const RECIPE_COLS = [
    { key: "recipe", label: "Recipe" }, { key: "category", label: "Category" },
    { key: "subCategory", label: "Sub Category" }, { key: "quantity", label: "Quantity" },
    { key: "price", label: "Price" }, { key: "unitPrice", label: "Unit Price" },
  ];
  const [visibleCols, setVisibleCols] = useState(RECIPE_COLS.map((c) => c.key));

  const filtered = recipes.filter((r) => Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (i) => setSelected((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((_, i) => i));

  const openAdd = () => {
    setEditIndex(null);
    setChosenProduct(""); setChosenCategory(""); setChosenSubCategory("");
    setChosenQuantity(""); setChosenPrice(""); setCopyFrom("None");
    setShowModal(true);
  };

  const openEdit = (i) => {
    const r = filtered[i];
    setEditIndex(recipes.indexOf(r));
    setChosenProduct(r.recipe);
    setChosenCategory(r.category === "General" ? "" : r.category);
    setChosenSubCategory(r.subCategory === "—" ? "" : r.subCategory);
    setChosenQuantity(String(r.quantity));
    setChosenPrice(String(parseFloat(r.unitPrice?.replace(/[₹,]/g, "") || 0)));
    setCopyFrom("None");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!chosenProduct) { showToast("Please select a product.", "error"); return; }
    const qty = Number(chosenQuantity) || 1;
    const price = Number(chosenPrice) || 0;
    const newEntry = {
      recipe: chosenProduct,
      category: chosenCategory || "General",
      subCategory: chosenSubCategory || "—",
      quantity: qty,
      price: `₹${(qty * price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      unitPrice: `₹${price.toFixed(2)}`,
    };
    if (editIndex !== null) {
      const updated = [...recipes];
      updated[editIndex] = newEntry;
      setRecipes(updated);
      console.log("✏️ Recipe Updated:", newEntry);
      showToast(`Recipe "${chosenProduct}" updated successfully!`, "success");
    } else {
      setRecipes((p) => [...p, newEntry]);
      console.log("✅ Recipe Saved:", newEntry);
      showToast(`Recipe "${chosenProduct}" saved successfully!`, "success");
    }
    setShowModal(false);
  };

  const handleDelete = (i) => {
    const name = filtered[i].recipe;
    setRecipes(recipes.filter((r) => r !== filtered[i]));
    console.log("🗑️ Recipe Deleted:", filtered[i]);
    showToast(`Recipe "${name}" deleted.`, "info");
  };

  const csvHeaders = ["recipe", "category", "subCategory", "quantity", "price", "unitPrice"];

  return (
    <div>
      {ToastEl}
      <h2 style={pageTitle}>Recipe</h2>
      <div style={tableCard}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={openAdd} style={addGreenBtn}>＋ Add</button>
        </div>
        <TableToolbar
          showEntries={showEntries} setShowEntries={setShowEntries}
          search={search} setSearch={setSearch}
          columns={RECIPE_COLS} visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          onExportCSV={() => { exportCSV(filtered, csvHeaders, "recipes.csv"); showToast("CSV exported!", "success"); }}
          onExportExcel={() => { exportExcel(filtered, csvHeaders, "recipes.xls"); showToast("Excel exported!", "success"); }}
          onExportPDF={() => { exportPDF("Recipe List", RECIPE_COLS, filtered); showToast("PDF opened in new tab.", "info"); }}
        />
        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr style={theadRow}>
                <th style={th}><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ accentColor: "#1a5c38" }} /></th>
                {RECIPE_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => (
                  <th key={c.key} style={th}>{c.label}{c.key === "price" ? " ℹ️" : ""}</th>
                ))}
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, showEntries).length === 0
                ? <tr><td colSpan={RECIPE_COLS.length + 2} style={emptyCell}>No data available in table</td></tr>
                : filtered.slice(0, showEntries).map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: selected.includes(i) ? "#f0fdf4" : "transparent" }}
                    onMouseEnter={(e) => { if (!selected.includes(i)) e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selected.includes(i) ? "#f0fdf4" : "transparent"; }}>
                    <td style={td}><input type="checkbox" checked={selected.includes(i)} onChange={() => toggleSelect(i)} style={{ accentColor: "#1a5c38" }} /></td>
                    {RECIPE_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => <td key={c.key} style={td}>{r[c.key]}</td>)}
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(i)} style={editBtnStyle}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#1a5c38"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#2d7a50"}>✏️ Edit</button>
                        <button onClick={() => handleDelete(i)} style={deleteBtnStyle}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#b91c1c"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#dc2626"}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ border: "1.5px solid #1a5c38", color: "#1a5c38", background: "#fff", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
            onClick={() => { console.log("🔄 Product prices updated for all recipes"); showToast("Product prices updated!", "success"); }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
            🔄 Update product price
          </button>
          <span title="Updates the selling price of linked products based on recipe cost" style={{ color: "#3b82f6", cursor: "help" }}>ℹ️</span>
        </div>
        <div style={paginationRow}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>← Previous</button><button style={pgBtn}>Next →</button></div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowModal(false)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, color: "#111" }}>{editIndex !== null ? "Edit Recipe" : "Add Recipe"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>Choose Product <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={chosenProduct} onChange={(e) => setChosenProduct(e.target.value)} style={sel}>
                  <option value="">Please Select</option>
                  {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select value={chosenCategory} onChange={(e) => { setChosenCategory(e.target.value); setChosenSubCategory(""); }} style={sel}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Sub Category</label>
                <select value={chosenSubCategory} onChange={(e) => setChosenSubCategory(e.target.value)} style={sel}>
                  <option value="">Select Sub Category</option>
                  {(SUB_CATEGORIES[chosenCategory] || []).map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Quantity</label>
                <input type="number" value={chosenQuantity} onChange={(e) => setChosenQuantity(e.target.value)} style={sel} placeholder="0" min="0" />
              </div>
              <div>
                <label style={lbl}>Unit Price (₹)</label>
                <input type="number" value={chosenPrice} onChange={(e) => setChosenPrice(e.target.value)} style={sel} placeholder="0.00" min="0" step="0.01" />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>Copy from Recipe:</label>
                <select value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)} style={sel}>
                  {RECIPE_OPTS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
              <button onClick={() => setShowModal(false)} style={cancelBtn}>Close</button>
              <button onClick={handleSave} style={greenBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 7 }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewData && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, minWidth: 400 }}>
            <button onClick={() => setViewData(null)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18 }}>Recipe Details</h3>
            {Object.entries(viewData).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontWeight: 600, color: "#374151", fontSize: 13, textTransform: "capitalize" }}>{k}</span>
                <span style={{ color: "#111", fontSize: 13 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setViewData(null)} style={cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Production Tab ─────────────────────────────────────────────────────────────
function ProductionTab() {
  const { showToast, ToastEl } = useToast();
  const [productions, setProductions] = useState(SAMPLE_PRODUCTIONS);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [form, setForm] = useState({ refNo: "", location: "", product: "", qty: "", notes: "" });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const PROD_COLS = [
    { key: "date", label: "Date" }, { key: "refNo", label: "Reference No" },
    { key: "location", label: "Location" }, { key: "product", label: "Product" },
    { key: "quantity", label: "Quantity" }, { key: "totalCost", label: "Total Cost" },
  ];
  const [visibleCols, setVisibleCols] = useState(PROD_COLS.map((c) => c.key));
  const [refCounter, setRefCounter] = useState(6);

  const filtered = productions.filter((p) => Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditIndex(null);
    setForm({ refNo: "", location: "", product: "", qty: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (i) => {
    const p = filtered[i];
    setEditIndex(productions.indexOf(p));
    setForm({ refNo: p.refNo, location: p.location, product: p.product, qty: String(p.quantity), notes: "" });
    setShowModal(true);
  };

  const openView = (i) => setViewData(filtered[i]);

  const handleSave = () => {
    if (!form.product || !form.qty) { showToast("Please fill required fields (Product and Quantity).", "error"); return; }
    if (editIndex !== null) {
      const updated = [...productions];
      updated[editIndex] = { ...updated[editIndex], location: form.location || updated[editIndex].location, product: form.product, quantity: Number(form.qty) };
      setProductions(updated);
      console.log("✏️ Production Updated:", updated[editIndex]);
      showToast("Production record updated!", "success");
    } else {
      const refNo = form.refNo || `PRD-${String(refCounter).padStart(4, "0")}`;
      setRefCounter((n) => n + 1);
      const newEntry = { date: new Date().toLocaleDateString("en-IN"), refNo, location: form.location || "Unit A - Chennai", product: form.product, quantity: Number(form.qty), totalCost: "₹0.00" };
      setProductions((p) => [newEntry, ...p]);
      console.log("✅ Production Saved:", newEntry);
      showToast(`Production "${form.product}" saved!`, "success");
    }
    setShowModal(false);
    setForm({ refNo: "", location: "", product: "", qty: "", notes: "" });
  };

  const handleDelete = (i) => {
    const item = filtered[i];
    setProductions(productions.filter((p) => p !== item));
    console.log("🗑️ Production Deleted:", item);
    showToast(`Production "${item.product}" deleted.`, "info");
  };

  const csvHeaders = ["date", "refNo", "location", "product", "quantity", "totalCost"];

  return (
    <div>
      {ToastEl}
      <h2 style={pageTitle}>Production</h2>
      <div style={{ background: "#fff", borderRadius: 8, padding: "14px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: "#555", fontWeight: 500 }}>🔽 Filters</span>
        <input type="date" style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13 }} />
        <input type="date" style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13 }} />
        <select style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13 }}>
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <button style={{ ...greenBtn, padding: "6px 16px", fontSize: 13 }}>Apply</button>
      </div>
      <div style={tableCard}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={openAdd} style={addGreenBtn}>＋ Add</button>
        </div>
        <TableToolbar
          showEntries={showEntries} setShowEntries={setShowEntries}
          search={search} setSearch={setSearch}
          columns={PROD_COLS} visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          onExportCSV={() => { exportCSV(filtered, csvHeaders, "production.csv"); showToast("CSV exported!", "success"); }}
          onExportExcel={() => { exportExcel(filtered, csvHeaders, "production.xls"); showToast("Excel exported!", "success"); }}
          onExportPDF={() => { exportPDF("Production Report", PROD_COLS, filtered); showToast("PDF opened in new tab.", "info"); }}
        />
        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr style={theadRow}>
                {PROD_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => <th key={c.key} style={th}>{c.label}</th>)}
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, showEntries).length === 0
                ? <tr><td colSpan={PROD_COLS.length + 1} style={emptyCell}>No data available in table</td></tr>
                : filtered.slice(0, showEntries).map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    {PROD_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => <td key={c.key} style={td}>{p[c.key]}</td>)}
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openView(i)} style={viewBtnStyle}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}>👁️ View</button>
                        <button onClick={() => openEdit(i)} style={editBtnStyle}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#1a5c38"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#2d7a50"}>✏️ Edit</button>
                        <button onClick={() => handleDelete(i)} style={deleteBtnStyle}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#b91c1c"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#dc2626"}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={paginationRow}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>← Previous</button><button style={pgBtn}>Next →</button></div>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, minWidth: 520 }}>
            <button onClick={() => setShowModal(false)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 20, color: "#111" }}>{editIndex !== null ? "Edit Production" : "Add Production"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
              <div>
                <label style={lbl}>Reference No</label>
                <input value={form.refNo} onChange={(e) => setF("refNo", e.target.value)} style={sel} placeholder="Auto-generated if empty" />
              </div>
              <div>
                <label style={lbl}>Location</label>
                <select value={form.location} onChange={(e) => setF("location", e.target.value)} style={sel}>
                  <option value="">Select Location</option>
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Product <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={form.product} onChange={(e) => setF("product", e.target.value)} style={sel}>
                  <option value="">Select Product</option>
                  {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Quantity <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="number" value={form.qty} onChange={(e) => setF("qty", e.target.value)} style={sel} placeholder="0" min="1" />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>Notes</label>
                <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)} style={{ ...sel, resize: "vertical", minHeight: 60 }} placeholder="Optional production notes..." />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={cancelBtn}>Close</button>
              <button onClick={handleSave} style={greenBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 7 }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewData && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, minWidth: 420 }}>
            <button onClick={() => setViewData(null)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18 }}>Production Details</h3>
            {PROD_COLS.map(({ key, label }) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontWeight: 600, color: "#6b7280", fontSize: 13 }}>{label}</span>
                <span style={{ color: "#111", fontSize: 13, fontWeight: 500 }}>{viewData[key]}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setViewData(null)} style={cancelBtn}>Close</button>
              <button onClick={() => { setViewData(null); openEdit(filtered.indexOf(viewData)); }} style={greenBtn}>✏️ Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ───────────────────────────────────────────────────────────────
function SettingsTab() {
  const { showToast, ToastEl } = useToast();
  const [prefix, setPrefix] = useState("PRD-");
  const [disableEdit, setDisableEdit] = useState(false);
  const [updatePrice, setUpdatePrice] = useState(true);
  const [autoRef, setAutoRef] = useState(true);

  const handleSave = () => {
    const settings = { prefix, disableEdit, updatePrice, autoRef };
    console.log("⚙️ Settings Saved:", settings);
    showToast("Settings saved successfully!", "success");
  };

  return (
    <div>
      {ToastEl}
      <h2 style={pageTitle}>Settings</h2>
      <div style={tableCard}>
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ background: "linear-gradient(135deg, #1a5c38, #2d7a50)", color: "#fff", borderRadius: 8, padding: "14px 28px", fontWeight: 700, fontSize: 15, height: "fit-content", boxShadow: "0 4px 12px #1a5c3830" }}>⚙️ Settings</div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px 32px", alignItems: "flex-start" }}>
            <div>
              <label style={lbl}>Production Ref No. Prefix</label>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. PRD-"
                style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 12px", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#1a5c38"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 28 }}>
              {[
                { id: "disableEdit", checked: disableEdit, onChange: setDisableEdit, label: "Disable editing ingredient quantities in production" },
                { id: "autoRef", checked: autoRef, onChange: setAutoRef, label: "Auto-generate reference numbers" },
              ].map(({ id, checked, onChange, label }) => (
                <label key={id} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 17, height: 17, marginTop: 2, accentColor: "#1a5c38", cursor: "pointer" }} />
                  <span style={{ fontSize: 14, color: "#374151" }}>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 28 }}>
              <input type="checkbox" checked={updatePrice} onChange={(e) => setUpdatePrice(e.target.checked)} style={{ width: 17, height: 17, marginTop: 2, accentColor: "#1a5c38", cursor: "pointer" }} />
              <label style={{ fontSize: 14, color: "#374151", cursor: "pointer" }}>Update product purchase price based on production cost on finalizing production</label>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 36 }}>
          <button onClick={handleSave} style={greenBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 7 }}>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Update
          </button>
        </div>
        <div style={{ marginTop: 48, paddingTop: 16, borderTop: "1px solid #f3f4f6", fontSize: 13, color: "#9ca3af" }}>
          Manufacturing module version — <span style={{ color: "#e67e22", fontWeight: 700 }}>4.0</span>
        </div>
      </div>
    </div>
  );
}

// ── Manufacturing Report Tab ───────────────────────────────────────────────────
function ManufacturingReportTab() {
  const { showToast, ToastEl } = useToast();
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [viewData, setViewData] = useState(null);

  const allData = [...SAMPLE_PRODUCTIONS];
  const filtered = allData.filter((r) => {
    const matchSearch = Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase());
    const matchProduct = !filterProduct || r.product === filterProduct;
    return matchSearch && matchProduct;
  });

  const RPT_COLS = [
    { key: "date", label: "Date" }, { key: "refNo", label: "Reference No" },
    { key: "location", label: "Location" }, { key: "product", label: "Product" },
    { key: "quantity", label: "Quantity" }, { key: "totalCost", label: "Total Cost" },
  ];
  const [visibleCols, setVisibleCols] = useState(RPT_COLS.map((c) => c.key));
  const csvHeaders = ["date", "refNo", "location", "product", "quantity", "totalCost"];

  return (
    <div>
      {ToastEl}
      <h2 style={pageTitle}>Manufacturing Report</h2>
      <div style={{ background: "#fff", borderRadius: 8, padding: "14px 16px", marginBottom: 16, boxShadow: "0 1px 3px #0001", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: "#555", fontWeight: 500 }}>🔽 Filters</span>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13 }} />
        <span style={{ fontSize: 13, color: "#888" }}>to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13 }} />
        <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13 }}>
          <option value="">All Products</option>
          {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <button style={{ ...greenBtn, padding: "6px 16px", fontSize: 13 }}>Apply</button>
        <button style={{ ...cancelBtn, padding: "6px 16px", fontSize: 13 }} onClick={() => { setFromDate(""); setToDate(""); setFilterProduct(""); }}>Reset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Productions", value: filtered.length, icon: "🏭", color: "#1a5c38" },
          { label: "Total Quantity", value: filtered.reduce((s, r) => s + Number(r.quantity), 0), icon: "📦", color: "#3b82f6" },
          { label: "Total Records", value: filtered.length, icon: "📋", color: "#e67e22" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 8, padding: "16px 20px", boxShadow: "0 1px 3px #0001", borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={tableCard}>
        <TableToolbar
          showEntries={showEntries} setShowEntries={setShowEntries}
          search={search} setSearch={setSearch}
          columns={RPT_COLS} visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          onExportCSV={() => { exportCSV(filtered, csvHeaders, "mfg_report.csv"); showToast("CSV exported!", "success"); }}
          onExportExcel={() => { exportExcel(filtered, csvHeaders, "mfg_report.xls"); showToast("Excel exported!", "success"); }}
          onExportPDF={() => { exportPDF("Manufacturing Report", RPT_COLS, filtered); showToast("PDF opened in new tab.", "info"); }}
        />
        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr style={theadRow}>
                {RPT_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => <th key={c.key} style={th}>{c.label}</th>)}
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, showEntries).length === 0
                ? <tr><td colSpan={RPT_COLS.length + 1} style={emptyCell}>No data available in table</td></tr>
                : filtered.slice(0, showEntries).map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    {RPT_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => <td key={c.key} style={td}>{r[c.key]}</td>)}
                    <td style={td}>
                      <button onClick={() => setViewData(r)} style={viewBtnStyle}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}>👁️ View</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={paginationRow}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(showEntries, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 8 }}><button style={pgBtn}>← Previous</button><button style={pgBtn}>Next →</button></div>
        </div>
      </div>

      {viewData && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, minWidth: 420 }}>
            <button onClick={() => setViewData(null)} style={modalClose}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18 }}>Production Details</h3>
            {RPT_COLS.map(({ key, label }) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontWeight: 600, color: "#6b7280", fontSize: 13 }}>{label}</span>
                <span style={{ color: "#111", fontSize: 13, fontWeight: 500 }}>{viewData[key]}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setViewData(null)} style={cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const TABS = ["Recipe", "Production", "Settings", "Manufacturing Report"];

export default function Manufacturing() {
  const [activeTab, setActiveTab] = useState("Recipe");
  return (
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", color: "#111827" }}>
      <div style={{ display: "flex", background: "#fff", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #e5e7eb", boxShadow: "0 1px 3px #0001" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "13px 20px", borderRight: "1px solid #e5e7eb", color: "#1a5c38", fontSize: 14, fontWeight: 700, gap: 6 }}>
          🏭 Manufacturing
        </div>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "13px 20px", border: "none", background: "transparent",
            borderBottom: activeTab === tab ? "3px solid #1a5c38" : "3px solid transparent",
            color: activeTab === tab ? "#1a5c38" : "#6b7280",
            fontWeight: activeTab === tab ? 700 : 400,
            cursor: "pointer", fontSize: 14, marginBottom: -2, transition: "all 0.15s",
          }}
            onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.color = "#1a5c38"; }}
            onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.color = "#6b7280"; }}>
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

// ── Shared Styles ──────────────────────────────────────────────────────────────
const pageTitle = { margin: "0 0 20px", fontSize: 26, fontWeight: 700, color: "#111827" };
const tableCard = { background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px #0001" };
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const theadRow = { background: "#f9fafb", borderBottom: "2px solid #e5e7eb" };
const th = { padding: "12px 12px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 13 };
const td = { padding: "11px 12px", color: "#374151" };
const emptyCell = { textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 };
const paginationRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 };
const pgBtn = { border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500 };

// ✅ Green Add button — matches Save style
const addGreenBtn = {
  background: "linear-gradient(135deg, #1a5c38 0%, #2d7a50 60%, #22693f 100%)",
  color: "#fff", border: "none", borderRadius: 8,
  padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  boxShadow: "0 4px 12px #1a5c3840", transition: "all 0.15s", letterSpacing: "0.01em",
};
// ✅ Green Save/Update button
const greenBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "linear-gradient(135deg, #1a5c38 0%, #2d7a50 60%, #22693f 100%)",
  color: "#fff", border: "none", borderRadius: 8,
  padding: "11px 28px", cursor: "pointer", fontSize: 14, fontWeight: 600,
  boxShadow: "0 4px 14px #1a5c3840", transition: "all 0.15s", letterSpacing: "0.01em",
};
const cancelBtn = { background: "#374151", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle = { background: "#fff", borderRadius: 12, padding: 32, minWidth: 500, maxWidth: 560, boxShadow: "0 20px 60px #00000025", position: "relative" };
const modalClose = { position: "absolute", right: 16, top: 14, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af", lineHeight: 1 };
const lbl = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#374151" };
const sel = { width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 12px", fontSize: 14, background: "#fff", boxSizing: "border-box", color: "#374151", outline: "none" };
const editBtnStyle = { background: "#2d7a50", color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "background 0.15s" };
const deleteBtnStyle = { background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "background 0.15s" };
const viewBtnStyle = { background: "#3b82f6", color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "background 0.15s" };
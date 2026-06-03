import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// ── Constants ─────────────────────────────────────────────────────────────────
const UNITS = ["Piece", "Kg", "Litre", "Box", "Pack", "Dozen"];
const BRANDS = ["Brand A", "Brand B", "Brand C"];
const CATEGORIES = ["Electronics", "Clothing", "Food", "Stationery", "Other"];
const SUB_CATEGORIES = ["Sub Cat 1", "Sub Cat 2", "Sub Cat 3"];
const TAXES = ["None", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];
const TAX_TYPES = ["Exclusive", "Inclusive"];
const PRODUCT_TYPES = ["Single", "Variable"];
const BARCODE_TYPES = ["Code 128 (C128)", "EAN-13", "EAN-8", "QR Code", "UPC-A"];

const EMPTY_FORM = {
  name: "", sku: "", barcodeType: "Code 128 (C128)",
  unit: "", brand: "", category: "", subCategory: "",
  businessLocation: "Manodtechnologies (BL0001)",
  alertQty: "", manageStock: true,
  description: "", weight: "", prepTime: "",
  tax: "None", sellingPriceTaxType: "Exclusive",
  productType: "Single",
  excTax: "", incTax: "", margin: "25.00", excTaxSell: "",
  image: null, imagePreview: null,
};

// Shared product store (module-level so both pages share state)
let _products = [];
let _listeners = [];
const subscribe = (fn) => { _listeners.push(fn); return () => { _listeners = _listeners.filter(l => l !== fn); }; };
const getProducts = () => _products;
const setProducts = (updater) => {
  _products = typeof updater === "function" ? updater(_products) : updater;
  _listeners.forEach(fn => fn(_products));
};

// ── Reusable Field wrapper ────────────────────────────────────────────────────
function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <label style={s.label}>{label}</label>}
      {children}
    </div>
  );
}

// ── Add Product Form (used both as page and standalone) ───────────────────────
export function AddProductForm({ onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const fileRef = useRef();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("image", file);
    const reader = new FileReader();
    reader.onload = (ev) => set("imagePreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = (andNew = false) => {
    if (!form.name.trim()) { alert("Product Name is required"); return; }
    if (!form.unit) { alert("Unit is required"); return; }
    const product = { ...form, id: Date.now(), currentStock: 0 };
    setProducts(prev => [...prev, product]);
    if (onSaved) { onSaved(product); return; }
    if (andNew) { setForm(EMPTY_FORM); }
    else { navigate("/products/"); }
  };

  return (
    <div style={s.formPage}>
      {/* Section: Basic Info */}
      <div style={s.card}>
        <div style={s.row3}>
          <Field label="Product Name *">
            <input style={s.input} placeholder="Product Name"
              value={form.name} onChange={e => set("name", e.target.value)} />
          </Field>
          <Field label="SKU">
            <input style={s.input} placeholder="SKU"
              value={form.sku} onChange={e => set("sku", e.target.value)} />
          </Field>
          <Field label="Barcode Type *">
            <select style={s.input} value={form.barcodeType} onChange={e => set("barcodeType", e.target.value)}>
              {BARCODE_TYPES.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>

        <div style={s.row3}>
          <Field label="Unit *">
            <select style={s.input} value={form.unit} onChange={e => set("unit", e.target.value)}>
              <option value="">Please Select</option>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="Brand">
            <select style={s.input} value={form.brand} onChange={e => set("brand", e.target.value)}>
              <option value="">Please Select</option>
              {BRANDS.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select style={s.input} value={form.category} onChange={e => set("category", e.target.value)}>
              <option value="">Please Select</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div style={s.row3}>
          <Field label="Sub Category">
            <select style={s.input} value={form.subCategory} onChange={e => set("subCategory", e.target.value)}>
              <option value="">Please Select</option>
              {SUB_CATEGORIES.map(sc => <option key={sc}>{sc}</option>)}
            </select>
          </Field>
          <Field label="Business Locations">
            <div style={s.locationBox}>
              <span style={s.locationBadge}>✕ {form.businessLocation}</span>
            </div>
          </Field>
          <Field label="Alert Quantity">
            <input style={s.input} placeholder="Alert quantity" type="number"
              value={form.alertQty} onChange={e => set("alertQty", e.target.value)} />
          </Field>
        </div>

        <div style={s.row2}>
          <Field label="">
            <label style={s.checkLabel}>
              <input type="checkbox" checked={form.manageStock}
                onChange={e => set("manageStock", e.target.checked)}
                style={{ marginRight: 8, accentColor: "#6c63ff" }} />
              <span style={{ fontWeight: 600, color: "#374151" }}>Manage Stock?</span>
              <span style={{ color: "#888", fontSize: 12, marginLeft: 6, fontStyle: "italic" }}>
                Enable stock management at product level
              </span>
            </label>
          </Field>
        </div>

        {/* Description + Image side by side */}
        <div style={s.row2}>
          <Field label="Product Description">
            <textarea style={{ ...s.input, height: 100, resize: "vertical" }}
              placeholder="Enter product description..."
              value={form.description} onChange={e => set("description", e.target.value)} />
          </Field>
          <Field label="Product Image">
            <div style={s.imgArea}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="preview" style={s.imgPreview} />
                : <div style={s.imgEmpty}>No image</div>}
              <button style={s.browseBtn} onClick={() => fileRef.current.click()}>
                📂 Browse…
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleImage} />
              <span style={s.imgNote}>Max File size: 5MB · Aspect ratio 1:1</span>
            </div>
          </Field>
        </div>

        <div style={s.row2}>
          <Field label="Weight">
            <input style={s.input} placeholder="Weight" type="number"
              value={form.weight} onChange={e => set("weight", e.target.value)} />
          </Field>
          <Field label="Service staff timer / Preparation time (In minutes)">
            <input style={s.input} placeholder="Preparation time (In minutes)" type="number"
              value={form.prepTime} onChange={e => set("prepTime", e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Section: Tax & Pricing */}
      <div style={s.card}>
        <div style={s.row2}>
          <Field label="Applicable Tax">
            <select style={s.input} value={form.tax} onChange={e => set("tax", e.target.value)}>
              {TAXES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Selling Price Tax Type *">
            <select style={s.input} value={form.sellingPriceTaxType}
              onChange={e => set("sellingPriceTaxType", e.target.value)}>
              {TAX_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Product Type *" style={{ maxWidth: 320 }}>
          <select style={s.input} value={form.productType}
            onChange={e => set("productType", e.target.value)}>
            {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>

        {/* Pricing Table */}
        <div style={s.pricingWrap}>
          <div style={s.pricingHead}>
            <div style={s.pricingCol}>Default Purchase Price</div>
            <div style={s.pricingCol}>x Margin(%)</div>
            <div style={s.pricingCol}>Default Selling Price</div>
            <div style={s.pricingCol}>Product Image</div>
          </div>
          <div style={s.pricingBody}>
            <div style={s.pricingCell}>
              <div style={s.pricingFieldLabel}>Exc. tax *</div>
              <input style={s.input} placeholder="Exc. tax" type="number"
                value={form.excTax} onChange={e => set("excTax", e.target.value)} />
              <div style={{ ...s.pricingFieldLabel, marginTop: 10 }}>Inc. tax *</div>
              <input style={s.input} placeholder="Inc. tax" type="number"
                value={form.incTax} onChange={e => set("incTax", e.target.value)} />
            </div>
            <div style={s.pricingCell}>
              <input style={s.input} type="number"
                value={form.margin} onChange={e => set("margin", e.target.value)} />
            </div>
            <div style={s.pricingCell}>
              <div style={s.pricingFieldLabel}>Exc. Tax</div>
              <input style={s.input} placeholder="Exc. tax" type="number"
                value={form.excTaxSell} onChange={e => set("excTaxSell", e.target.value)} />
            </div>
            <div style={s.pricingCell}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="product"
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }} />
                : <span style={{ color: "#bbb", fontSize: 13 }}>No file chosen</span>}
              <div style={s.imgNote}>Max File size: 5MB · Aspect ratio 1:1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={s.formFooter}>
        <button style={s.btnSaveStock} onClick={() => save(false)}>
          💾 Save &amp; Add Opening Stock
        </button>
        <button style={s.btnSaveAnother} onClick={() => save(true)}>
          Save And Add Another
        </button>
        <button style={s.btnSave} onClick={() => save(false)}>
          Save
        </button>
      </div>
    </div>
  );
}

// ── Add Product Page (route: /products/create) ────────────────────────────────
export function AddProductPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>Add new product</h1>
      </div>
      <AddProductForm onSaved={() => navigate("/products/")} />
    </div>
  );
}

// ── List Products Page (route: /products/) ────────────────────────────────────
export default function ListProducts() {
  const navigate = useNavigate();
  const [products, setLocalProducts] = useState(getProducts());
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState([]);

  // Keep in sync with module store
  useState(() => {
    const unsub = subscribe(setLocalProducts);
    return unsub;
  });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setLocalProducts(getProducts());
  };

  const deleteSelected = () => {
    setProducts(prev => prev.filter(p => !selected.includes(p.id)));
    setLocalProducts(getProducts());
    setSelected([]);
  };

  const handleDownloadExcel = () => {
    if (products.length === 0) { alert("No products to export"); return; }
    const data = products.map(p => ({
      "Product Name": p.name,
      "SKU": p.sku || "",
      "Barcode Type": p.barcodeType || "",
      "Unit": p.unit || "",
      "Brand": p.brand || "",
      "Category": p.category || "",
      "Sub Category": p.subCategory || "",
      "Business Location": p.businessLocation || "",
      "Alert Qty": p.alertQty || "",
      "Applicable Tax": p.tax || "",
      "Tax Type": p.sellingPriceTaxType || "",
      "Product Type": p.productType || "",
      "Purchase Price (Exc. Tax)": p.excTax || "",
      "Purchase Price (Inc. Tax)": p.incTax || "",
      "Margin (%)": p.margin || "",
      "Selling Price (Exc. Tax)": p.excTaxSell || "",
      "Current Stock": p.currentStock ?? 0,
      "Weight": p.weight || "",
      "Description": p.description || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    // Column widths
    ws["!cols"] = Object.keys(data[0] || {}).map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products.xlsx");
  };

  const handleExportCSV = () => {
    if (products.length === 0) { alert("No products to export"); return; }
    const headers = ["Product Name","SKU","Unit","Brand","Category","Current Stock","Selling Price (Exc.)","Tax","Product Type"];
    const rows = products.map(p => [
      p.name, p.sku, p.unit, p.brand, p.category,
      p.currentStock ?? 0, p.excTaxSell, p.tax, p.productType
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const displayed = filtered.slice(0, showEntries);

  return (
    <div style={s.page}>
      {/* Page title row */}
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <span style={s.pageSubtitle}>Manage your products</span>
        </div>
        <div style={s.topBtns}>
          <button style={s.btnAdd} onClick={() => navigate("/products/create")}>＋ Add</button>
          <button style={s.btnExcel} onClick={handleDownloadExcel}>⬇ Download Excel</button>
        </div>
      </div>

      {/* Filters bar */}
      <div style={s.filtersBar}>
        <span style={{ color: "#6c63ff", fontWeight: 600, fontSize: 14 }}>▼ Filters</span>
        <span style={{ marginLeft: "auto", color: "#6c63ff", fontSize: 18, cursor: "pointer" }}>∨</span>
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {[
          { key: "all", label: "🛒 All Products" },
          { key: "stock", label: "📊 Stock Report" },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ ...s.tab, ...(activeTab === t.key ? s.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.toolLeft}>
          <span style={s.toolText}>Show</span>
          <select style={s.entriesSelect} value={showEntries}
            onChange={e => setShowEntries(+e.target.value)}>
            {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
          </select>
          <span style={s.toolText}>entries</span>
        </div>
        <div style={s.toolRight}>
          <button style={s.toolBtn} onClick={handleExportCSV}>📄 Export CSV</button>
          <button style={s.toolBtn} onClick={handleDownloadExcel}>📊 Export Excel</button>
          <button style={s.toolBtn} onClick={() => window.print()}>🖨 Print</button>
          <button style={s.toolBtn}>👁 Column visibility</button>
          <button style={s.toolBtn}>📑 Export PDF ▾</button>
          <input style={s.searchBox} placeholder="Search …"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.theadRow}>
              <th style={s.th}>
                <input type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll} />
              </th>
              <th style={s.th}>Product Image</th>
              <th style={s.th}>Action</th>
              <th style={s.th}>Product ↕</th>
              <th style={s.th}>Business Location ↕</th>
              <th style={s.th}>Unit Purchase Price ↕</th>
              <th style={s.th}>Selling Price ↕</th>
              <th style={s.th}>Current Stock ↕</th>
              <th style={s.th}>Product Type ↕</th>
              <th style={s.th}>Category ↕</th>
              <th style={s.th}>Brand ↕</th>
              <th style={s.th}>Tax ↕</th>
              <th style={s.th}>SKU ↕</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={13} style={s.noData}>No data available in table</td>
              </tr>
            ) : (
              displayed.map((p, i) => (
                <tr key={p.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0eeff"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa"}>
                  <td style={s.td}>
                    <input type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td style={s.td}>
                    {p.imagePreview
                      ? <img src={p.imagePreview} alt={p.name}
                          style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                      : <div style={s.noImg}>—</div>}
                  </td>
                  <td style={s.td}>
                    <button style={s.actionEdit} title="Edit"
                      onClick={() => navigate("/products/create")}>✏</button>
                    <button style={s.actionDel} title="Delete"
                      onClick={() => deleteProduct(p.id)}>🗑</button>
                  </td>
                  <td style={{ ...s.td, fontWeight: 500 }}>{p.name}</td>
                  <td style={s.td}>{p.businessLocation}</td>
                  <td style={s.td}>{p.excTax ? `₹${p.excTax}` : "—"}</td>
                  <td style={s.td}>{p.excTaxSell ? `₹${p.excTaxSell}` : "—"}</td>
                  <td style={s.td}>
                    <span style={s.stockBadge}>{p.currentStock ?? 0}</span>
                  </td>
                  <td style={s.td}>{p.productType}</td>
                  <td style={s.td}>{p.category || "—"}</td>
                  <td style={s.td}>{p.brand || "—"}</td>
                  <td style={s.td}>{p.tax}</td>
                  <td style={s.td}>{p.sku || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk actions */}
      <div style={s.bulkRow}>
        <button style={s.bulkDel} onClick={deleteSelected}>Delete Selected</button>
        <button style={s.bulkAdd}>Add to location</button>
        <button style={s.bulkRem}>Remove from location</button>
        <button style={s.bulkDeact}>Deactivate Selected</button>
        <span style={s.infoIcon} title="Select rows first">ℹ</span>
      </div>

      {/* Footer count + pagination */}
      <div style={s.footerRow}>
        <span>
          Showing {displayed.length === 0 ? "0" : "1"} to {displayed.length} of {filtered.length} entries
        </span>
        <div style={s.pagination}>
          <button style={s.pageBtn}>Previous</button>
          <button style={s.pageBtn}>Next</button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  // Page layout
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#222", fontSize: 14 },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  pageTitle: { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a2e" },
  pageSubtitle: { fontSize: 13, color: "#888" },
  topBtns: { display: "flex", gap: 10 },
  btnAdd: {
    background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6,
    padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14,
    transition: "opacity 0.2s",
  },
  btnExcel: {
    background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6,
    padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14,
  },

  // Filters bar
  filtersBar: {
    display: "flex", alignItems: "center", padding: "12px 16px",
    border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16,
    background: "#fff",
  },

  // Tabs
  tabRow: { display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: 16 },
  tab: {
    padding: "10px 22px", border: "none", background: "transparent",
    cursor: "pointer", fontSize: 14, color: "#555", fontWeight: 500,
  },
  tabActive: { color: "#6c63ff", borderBottom: "2px solid #6c63ff", marginBottom: -2, fontWeight: 600 },

  // Toolbar
  toolbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap", gap: 10, marginBottom: 12,
  },
  toolLeft: { display: "flex", alignItems: "center", gap: 8 },
  toolRight: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  toolText: { fontSize: 13, color: "#555" },
  entriesSelect: { border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", fontSize: 13 },
  toolBtn: {
    background: "#fff", border: "1px solid #d1d5db", borderRadius: 4,
    padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444",
  },
  searchBox: {
    border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 10px",
    fontSize: 13, width: 170, outline: "none",
  },

  // Table
  tableWrap: { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  theadRow: { background: "#f9fafb" },
  th: {
    padding: "12px 10px", textAlign: "left", fontWeight: 600,
    borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap", color: "#374151",
  },
  td: { padding: "10px 10px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  rowEven: { background: "#fff", transition: "background 0.15s" },
  rowOdd: { background: "#fafafa", transition: "background 0.15s" },
  noData: { textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 14 },
  noImg: { color: "#d1d5db", textAlign: "center" },
  stockBadge: {
    background: "#e0f2fe", color: "#0369a1", padding: "2px 10px",
    borderRadius: 20, fontWeight: 600, fontSize: 12,
  },
  actionEdit: {
    background: "none", border: "1px solid #e5e7eb", borderRadius: 4,
    cursor: "pointer", fontSize: 14, padding: "3px 7px", marginRight: 4,
    color: "#6c63ff",
  },
  actionDel: {
    background: "none", border: "1px solid #fee2e2", borderRadius: 4,
    cursor: "pointer", fontSize: 14, padding: "3px 7px", color: "#ef4444",
  },

  // Bulk actions
  bulkRow: { display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" },
  bulkDel: {
    background: "#fff", border: "1px solid #ef4444", color: "#ef4444",
    borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500,
  },
  bulkAdd: {
    background: "#fff", border: "1px solid #16a34a", color: "#16a34a",
    borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500,
  },
  bulkRem: {
    background: "#fff", border: "1px solid #6b7280", color: "#6b7280",
    borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500,
  },
  bulkDeact: {
    background: "#fff", border: "1px solid #f59e0b", color: "#d97706",
    borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500,
  },
  infoIcon: { color: "#6c63ff", fontSize: 16, cursor: "help" },

  // Footer
  footerRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 12, fontSize: 13, color: "#6b7280",
  },
  pagination: { display: "flex", gap: 6 },
  pageBtn: {
    background: "#fff", border: "1px solid #d1d5db", borderRadius: 4,
    padding: "5px 14px", cursor: "pointer", fontSize: 13, color: "#374151",
  },

  // ── Add Product Form ──
  formPage: { display: "flex", flexDirection: "column", gap: 20 },
  card: {
    background: "#fff", borderRadius: 10, padding: "24px 28px",
    border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 4 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 },
  input: {
    width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 10px",
    fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  locationBox: { padding: "7px 10px", border: "1px solid #6c63ff", borderRadius: 6, background: "#f5f3ff" },
  locationBadge: {
    background: "#6c63ff", color: "#fff", borderRadius: 4,
    padding: "3px 10px", fontSize: 12, fontWeight: 500,
  },
  checkLabel: { display: "flex", alignItems: "center", fontSize: 13, cursor: "pointer", paddingTop: 6 },
  imgArea: { display: "flex", flexDirection: "column", gap: 8 },
  imgPreview: { width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" },
  imgEmpty: {
    width: 80, height: 80, background: "#f9fafb", borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#d1d5db", fontSize: 12, border: "1px dashed #d1d5db",
  },
  browseBtn: {
    background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6,
    padding: "8px 16px", cursor: "pointer", fontSize: 13, width: "fit-content",
  },
  imgNote: { fontSize: 11, color: "#9ca3af" },

  // Pricing table
  pricingWrap: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginTop: 16 },
  pricingHead: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
    background: "#2e7d32", color: "#fff", padding: "12px 16px",
    fontWeight: 600, fontSize: 13,
  },
  pricingCol: {},
  pricingBody: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
    padding: "16px", gap: 16, background: "#fff",
  },
  pricingCell: { display: "flex", flexDirection: "column", gap: 6 },
  pricingFieldLabel: { fontSize: 12, fontWeight: 600, color: "#6b7280" },

  // Form footer
  formFooter: {
    display: "flex", justifyContent: "center", gap: 12,
    padding: "20px 0 8px",
  },
  btnSaveStock: {
    background: "#374151", color: "#fff", border: "none", borderRadius: 6,
    padding: "12px 22px", cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
  btnSaveAnother: {
    background: "#e91e8c", color: "#fff", border: "none", borderRadius: 6,
    padding: "12px 22px", cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
  btnSave: {
    background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6,
    padding: "12px 32px", cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
};
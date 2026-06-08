import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Constants ─────────────────────────────────────────────────────────────────
const UNITS = ["Piece", "Kg", "Litre", "Box", "Pack", "Dozen"];
const BRANDS = ["Samsung", "Apple", "Nike", "Adidas", "Sony", "LG", "Bosch", "Puma"];
const CATEGORIES = ["Electronics", "Clothing", "Food", "Stationery", "Other", "Appliances", "Sports"];
const SUB_CATEGORIES = ["Mobile Phones", "Laptops", "T-Shirts", "Footwear", "Snacks", "Office Supplies"];
const TAXES = ["None", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];
const TAX_TYPES = ["Exclusive", "Inclusive"];
const PRODUCT_TYPES = ["Single", "Variable"];
const BARCODE_TYPES = ["Code 128 (C128)", "EAN-13", "EAN-8", "QR Code", "UPC-A"];

// ── Advanced Sample Data ──────────────────────────────────────────────────────
const SAMPLE_PRODUCTS = [
  { id: 1, name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-001", barcodeType: "EAN-13", unit: "Piece", brand: "Samsung", category: "Electronics", subCategory: "Mobile Phones", businessLocation: "Manodtechnologies (BL0001)", alertQty: "5", manageStock: true, description: "Latest Samsung flagship smartphone", weight: "0.233", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "85000", incTax: "100300", margin: "25.00", excTaxSell: "106250", currentStock: 42, imagePreview: null },
  { id: 2, name: "Apple iPhone 15 Pro", sku: "APL-IP15P-002", barcodeType: "EAN-13", unit: "Piece", brand: "Apple", category: "Electronics", subCategory: "Mobile Phones", businessLocation: "Manodtechnologies (BL0001)", alertQty: "3", manageStock: true, description: "Apple iPhone 15 Pro with A17 chip", weight: "0.187", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "110000", incTax: "129800", margin: "20.00", excTaxSell: "132000", currentStock: 28, imagePreview: null },
  { id: 3, name: "Nike Air Max 270", sku: "NIK-AM270-003", barcodeType: "Code 128 (C128)", unit: "Piece", brand: "Nike", category: "Clothing", subCategory: "Footwear", businessLocation: "Manodtechnologies (BL0001)", alertQty: "10", manageStock: true, description: "Comfortable running shoes", weight: "0.4", prepTime: "", tax: "GST 12%", sellingPriceTaxType: "Exclusive", productType: "Variable", excTax: "4500", incTax: "5040", margin: "40.00", excTaxSell: "6300", currentStock: 85, imagePreview: null },
  { id: 4, name: "Sony WH-1000XM5 Headphones", sku: "SNY-WH1000-004", barcodeType: "EAN-13", unit: "Piece", brand: "Sony", category: "Electronics", subCategory: "Mobile Phones", businessLocation: "Manodtechnologies (BL0001)", alertQty: "5", manageStock: true, description: "Noise cancelling wireless headphones", weight: "0.25", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "22000", incTax: "25960", margin: "30.00", excTaxSell: "28600", currentStock: 17, imagePreview: null },
  { id: 5, name: "Bosch Washing Machine 7kg", sku: "BSH-WM7-005", barcodeType: "EAN-13", unit: "Piece", brand: "Bosch", category: "Appliances", subCategory: "Mobile Phones", businessLocation: "Manodtechnologies (BL0001)", alertQty: "2", manageStock: true, description: "Front load washing machine", weight: "65", prepTime: "", tax: "GST 28%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "28000", incTax: "35840", margin: "22.00", excTaxSell: "34160", currentStock: 8, imagePreview: null },
  { id: 6, name: "Adidas Ultraboost 22", sku: "ADI-UB22-006", barcodeType: "Code 128 (C128)", unit: "Piece", brand: "Adidas", category: "Sports", subCategory: "Footwear", businessLocation: "Manodtechnologies (BL0001)", alertQty: "8", manageStock: true, description: "Premium running shoes", weight: "0.38", prepTime: "", tax: "GST 12%", sellingPriceTaxType: "Exclusive", productType: "Variable", excTax: "8000", incTax: "8960", margin: "35.00", excTaxSell: "10800", currentStock: 54, imagePreview: null },
  { id: 7, name: "LG 55\" OLED TV", sku: "LG-OLED55-007", barcodeType: "EAN-13", unit: "Piece", brand: "LG", category: "Electronics", subCategory: "Laptops", businessLocation: "Manodtechnologies (BL0001)", alertQty: "2", manageStock: true, description: "55 inch OLED 4K Smart TV", weight: "17.2", prepTime: "", tax: "GST 28%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "75000", incTax: "96000", margin: "18.00", excTaxSell: "88500", currentStock: 6, imagePreview: null },
  { id: 8, name: "Puma RS-X Sneakers", sku: "PMA-RSX-008", barcodeType: "Code 128 (C128)", unit: "Piece", brand: "Puma", category: "Sports", subCategory: "Footwear", businessLocation: "Manodtechnologies (BL0001)", alertQty: "10", manageStock: true, description: "Retro-inspired chunky sneakers", weight: "0.42", prepTime: "", tax: "GST 12%", sellingPriceTaxType: "Exclusive", productType: "Variable", excTax: "5500", incTax: "6160", margin: "32.00", excTaxSell: "7260", currentStock: 63, imagePreview: null },
  { id: 9, name: "A4 Copier Paper (500 sheets)", sku: "STA-A4P-009", barcodeType: "Code 128 (C128)", unit: "Pack", brand: "Bosch", category: "Stationery", subCategory: "Office Supplies", businessLocation: "Manodtechnologies (BL0001)", alertQty: "20", manageStock: true, description: "80 GSM A4 copier paper", weight: "2.5", prepTime: "", tax: "GST 5%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "220", incTax: "231", margin: "28.00", excTaxSell: "281.60", currentStock: 210, imagePreview: null },
  { id: 10, name: "Samsung 65\" QLED 4K TV", sku: "SAM-Q65-010", barcodeType: "EAN-13", unit: "Piece", brand: "Samsung", category: "Electronics", subCategory: "Laptops", businessLocation: "Manodtechnologies (BL0001)", alertQty: "2", manageStock: true, description: "QLED 4K Smart TV with Neo Quantum", weight: "22.5", prepTime: "", tax: "GST 28%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "95000", incTax: "121600", margin: "15.00", excTaxSell: "109250", currentStock: 4, imagePreview: null },
];

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

// Shared product store
let _products = [...SAMPLE_PRODUCTS];
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

// ── Export Utilities ──────────────────────────────────────────────────────────
function buildExportData(products) {
  return products.map(p => ({
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
}

function exportCSV(products) {
  if (!products.length) { alert("No products to export"); return; }
  const data = buildExportData(products);
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "products.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(products) {
  if (!products.length) { alert("No products to export"); return; }
  const data = buildExportData(products);
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, "products.xlsx");
}

function exportPDF(products) {
  if (!products.length) { alert("No products to export"); return; }
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Products List", 14, 15);
  doc.setFontSize(10);
  doc.text(`Exported: ${new Date().toLocaleDateString()}`, 14, 22);
  const columns = ["Product", "SKU", "Unit", "Brand", "Category", "Purchase Price", "Selling Price", "Stock", "Tax"];
  const rows = products.map(p => [
    p.name, p.sku || "—", p.unit || "—", p.brand || "—", p.category || "—",
    p.excTax ? `₹${Number(p.excTax).toLocaleString()}` : "—",
    p.excTaxSell ? `₹${Number(p.excTaxSell).toLocaleString()}` : "—",
    String(p.currentStock ?? 0), p.tax || "—"
  ]);
  autoTable(doc, { head: [columns], body: rows, startY: 28, styles: { fontSize: 8 }, headStyles: { fillColor: [34, 139, 34] } });
  doc.save("products.pdf");
}

function printTable(products) {
  const data = buildExportData(products);
  const headers = ["Product Name","SKU","Unit","Brand","Category","Selling Price","Stock","Tax"];
  const rows = products.map(p => [
    p.name, p.sku||"—", p.unit||"—", p.brand||"—", p.category||"—",
    p.excTaxSell ? `₹${Number(p.excTaxSell).toLocaleString()}` : "—",
    String(p.currentStock ?? 0), p.tax||"—"
  ]);
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Products</title><style>
    body{font-family:sans-serif;font-size:12px;} table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;}
    th{background:#2e7d32;color:#fff;} h2{margin-bottom:8px;}
  </style></head><body>
    <h2>Products List</h2><p>Date: ${new Date().toLocaleDateString()}</p>
    <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></body></html>`);
  win.document.close(); win.print();
}

// ── Add Product Form ──────────────────────────────────────────────────────────
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
                style={{ marginRight: 8, accentColor: "#2e7d32" }} />
              <span style={{ fontWeight: 600, color: "#374151" }}>Manage Stock?</span>
              <span style={{ color: "#888", fontSize: 12, marginLeft: 6, fontStyle: "italic" }}>
                Enable stock management at product level
              </span>
            </label>
          </Field>
        </div>
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

      <div style={s.formFooter}>
        <button style={s.btnSaveStock} onClick={() => save(false)}>
          💾 Save &amp; Add Opening Stock
        </button>
        <button style={s.btnSaveAnother} onClick={() => save(true)}>
          Save And Add Another
        </button>
        <button style={s.btnSave} onClick={() => save(false)}>
          🖫 Save
        </button>
      </div>
    </div>
  );
}

// ── Add Product Page ──────────────────────────────────────────────────────────
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

// ── List Products Page ────────────────────────────────────────────────────────
export default function ListProducts() {
  const navigate = useNavigate();
  const [products, setLocalProducts] = useState(getProducts());
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState([]);
  const [colVisibility, setColVisibility] = useState({
    image: true, action: true, product: true, location: true,
    purchasePrice: true, sellingPrice: true, stock: true,
    productType: true, category: true, brand: true, tax: true, sku: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  useState(() => {
    const unsub = subscribe(setLocalProducts);
    return unsub;
  });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
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

  const displayed = filtered.slice(0, showEntries);

  return (
    <div style={s.page}>
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <span style={s.pageSubtitle}>Manage your products</span>
        </div>
        <div style={s.topBtns}>
          <button style={s.btnAdd} onClick={() => navigate("/products/create")}>＋ Add</button>
          <button style={s.btnExcel} onClick={() => exportExcel(products)}>⬇ Download Excel</button>
        </div>
      </div>

      <div style={s.filtersBar}>
        <span style={{ color: "#2e7d32", fontWeight: 600, fontSize: 14 }}>▼ Filters</span>
        <span style={{ marginLeft: "auto", color: "#2e7d32", fontSize: 18, cursor: "pointer" }}>∨</span>
      </div>

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
          {/* Export CSV */}
          <button style={s.toolBtnCsv} onClick={() => exportCSV(products)}>
            <span style={s.btnIconCsv}>CSV</span> Export CSV
          </button>
          {/* Export Excel */}
          <button style={s.toolBtnXls} onClick={() => exportExcel(products)}>
            <span style={s.btnIconXls}>XLS</span> Export Excel
          </button>
          {/* Print */}
          <button style={s.toolBtn} onClick={() => printTable(products)}>
            🖨 Print
          </button>
          {/* Column Visibility */}
          <div style={{ position: "relative" }}>
            <button style={s.toolBtnCol} onClick={() => setShowColMenu(v => !v)}>
              ⊞ Column visibility
            </button>
            {showColMenu && (
              <div style={s.colMenu}>
                {Object.keys(colVisibility).map(col => (
                  <label key={col} style={s.colMenuItem}>
                    <input type="checkbox" checked={colVisibility[col]}
                      onChange={() => setColVisibility(prev => ({ ...prev, [col]: !prev[col] }))}
                      style={{ accentColor: "#2e7d32" }} />
                    <span style={{ textTransform: "capitalize" }}>{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Export PDF */}
          <button style={s.toolBtnPdf} onClick={() => exportPDF(products)}>
            <span style={s.btnIconPdf}>PDF</span> Export PDF ▾
          </button>
          <input style={s.searchBox} placeholder="Search …"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.theadRow}>
              <th style={s.th}><input type="checkbox"
                checked={selected.length === filtered.length && filtered.length > 0}
                onChange={toggleAll} /></th>
              {colVisibility.image && <th style={s.th}>Product Image</th>}
              {colVisibility.action && <th style={s.th}>Action</th>}
              {colVisibility.product && <th style={s.th}>Product ↕</th>}
              {colVisibility.location && <th style={s.th}>Business Location ↕</th>}
              {colVisibility.purchasePrice && <th style={s.th}>Unit Purchase Price ↕</th>}
              {colVisibility.sellingPrice && <th style={s.th}>Selling Price ↕</th>}
              {colVisibility.stock && <th style={s.th}>Current Stock ↕</th>}
              {colVisibility.productType && <th style={s.th}>Product Type ↕</th>}
              {colVisibility.category && <th style={s.th}>Category ↕</th>}
              {colVisibility.brand && <th style={s.th}>Brand ↕</th>}
              {colVisibility.tax && <th style={s.th}>Tax ↕</th>}
              {colVisibility.sku && <th style={s.th}>SKU ↕</th>}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr><td colSpan={13} style={s.noData}>No data available in table</td></tr>
            ) : (
              displayed.map((p, i) => (
                <tr key={p.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa"}>
                  <td style={s.td}><input type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggleSelect(p.id)} /></td>
                  {colVisibility.image && <td style={s.td}>
                    {p.imagePreview
                      ? <img src={p.imagePreview} alt={p.name} style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                      : <div style={s.noImg}>—</div>}
                  </td>}
                  {colVisibility.action && <td style={s.td}>
                    <button style={s.actionEdit} onClick={() => navigate("/products/create")}>✏</button>
                    <button style={s.actionDel} onClick={() => deleteProduct(p.id)}>🗑</button>
                  </td>}
                  {colVisibility.product && <td style={{ ...s.td, fontWeight: 500 }}>{p.name}</td>}
                  {colVisibility.location && <td style={s.td}>{p.businessLocation}</td>}
                  {colVisibility.purchasePrice && <td style={s.td}>{p.excTax ? `₹${Number(p.excTax).toLocaleString()}` : "—"}</td>}
                  {colVisibility.sellingPrice && <td style={s.td}>{p.excTaxSell ? `₹${Number(p.excTaxSell).toLocaleString()}` : "—"}</td>}
                  {colVisibility.stock && <td style={s.td}>
                    <span style={{ ...s.stockBadge, background: p.currentStock < 10 ? "#fee2e2" : "#dcfce7", color: p.currentStock < 10 ? "#dc2626" : "#16a34a" }}>
                      {p.currentStock ?? 0}
                    </span>
                  </td>}
                  {colVisibility.productType && <td style={s.td}>{p.productType}</td>}
                  {colVisibility.category && <td style={s.td}>{p.category || "—"}</td>}
                  {colVisibility.brand && <td style={s.td}>{p.brand || "—"}</td>}
                  {colVisibility.tax && <td style={s.td}>{p.tax}</td>}
                  {colVisibility.sku && <td style={s.td}>{p.sku || "—"}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={s.bulkRow}>
        <button style={s.bulkDel} onClick={deleteSelected}>Delete Selected</button>
        <button style={s.bulkAdd}>Add to location</button>
        <button style={s.bulkRem}>Remove from location</button>
        <button style={s.bulkDeact}>Deactivate Selected</button>
        <span style={s.infoIcon} title="Select rows first">ℹ</span>
      </div>

      <div style={s.footerRow}>
        <span>Showing {displayed.length === 0 ? "0" : "1"} to {displayed.length} of {filtered.length} entries</span>
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
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#222", fontSize: 14 },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  pageTitle: { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a2e" },
  pageSubtitle: { fontSize: 13, color: "#888" },
  topBtns: { display: "flex", gap: 10 },
  btnAdd: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnExcel: { background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  filtersBar: { display: "flex", alignItems: "center", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16, background: "#fff" },
  tabRow: { display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: 16 },
  tab: { padding: "10px 22px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#555", fontWeight: 500 },
  tabActive: { color: "#2e7d32", borderBottom: "2px solid #2e7d32", marginBottom: -2, fontWeight: 600 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  toolLeft: { display: "flex", alignItems: "center", gap: 8 },
  toolRight: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  toolText: { fontSize: 13, color: "#555" },
  entriesSelect: { border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", fontSize: 13 },
  toolBtn: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444" },
  toolBtnCsv: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444", display: "flex", alignItems: "center", gap: 5 },
  toolBtnXls: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444", display: "flex", alignItems: "center", gap: 5 },
  toolBtnPdf: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444", display: "flex", alignItems: "center", gap: 5 },
  toolBtnCol: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444" },
  btnIconCsv: { background: "#16a34a", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
  btnIconXls: { background: "#2e7d32", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
  btnIconPdf: { background: "#dc2626", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
  colMenu: { position: "absolute", top: "110%", right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 16px", zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", minWidth: 180 },
  colMenuItem: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer", fontSize: 13 },
  searchBox: { border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 10px", fontSize: 13, width: 170, outline: "none" },
  tableWrap: { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  theadRow: { background: "#f9fafb" },
  th: { padding: "12px 10px", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap", color: "#374151" },
  td: { padding: "10px 10px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  rowEven: { background: "#fff", transition: "background 0.15s" },
  rowOdd: { background: "#fafafa", transition: "background 0.15s" },
  noData: { textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 14 },
  noImg: { color: "#d1d5db", textAlign: "center" },
  stockBadge: { padding: "2px 10px", borderRadius: 20, fontWeight: 600, fontSize: 12 },
  actionEdit: { background: "none", border: "1px solid #e5e7eb", borderRadius: 4, cursor: "pointer", fontSize: 14, padding: "3px 7px", marginRight: 4, color: "#2e7d32" },
  actionDel: { background: "none", border: "1px solid #fee2e2", borderRadius: 4, cursor: "pointer", fontSize: 14, padding: "3px 7px", color: "#ef4444" },
  bulkRow: { display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" },
  bulkDel: { background: "#fff", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  bulkAdd: { background: "#fff", border: "1px solid #16a34a", color: "#16a34a", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  bulkRem: { background: "#fff", border: "1px solid #6b7280", color: "#6b7280", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  bulkDeact: { background: "#fff", border: "1px solid #f59e0b", color: "#d97706", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  infoIcon: { color: "#2e7d32", fontSize: 16, cursor: "help" },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 13, color: "#6b7280" },
  pagination: { display: "flex", gap: 6 },
  pageBtn: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13, color: "#374151" },
  formPage: { display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "#fff", borderRadius: 10, padding: "24px 28px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 4 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 },
  input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  locationBox: { padding: "7px 10px", border: "1px solid #2e7d32", borderRadius: 6, background: "#f0fdf4" },
  locationBadge: { background: "#2e7d32", color: "#fff", borderRadius: 4, padding: "3px 10px", fontSize: 12, fontWeight: 500 },
  checkLabel: { display: "flex", alignItems: "center", fontSize: 13, cursor: "pointer", paddingTop: 6 },
  imgArea: { display: "flex", flexDirection: "column", gap: 8 },
  imgPreview: { width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" },
  imgEmpty: { width: 80, height: 80, background: "#f9fafb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 12, border: "1px dashed #d1d5db" },
  browseBtn: { background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 13, width: "fit-content" },
  imgNote: { fontSize: 11, color: "#9ca3af" },
  pricingWrap: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginTop: 16 },
  pricingHead: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", background: "#2e7d32", color: "#fff", padding: "12px 16px", fontWeight: 600, fontSize: 13 },
  pricingCol: {},
  pricingBody: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "16px", gap: 16, background: "#fff" },
  pricingCell: { display: "flex", flexDirection: "column", gap: 6 },
  pricingFieldLabel: { fontSize: 12, fontWeight: 600, color: "#6b7280" },
  formFooter: { display: "flex", justifyContent: "center", gap: 12, padding: "20px 0 8px" },
  btnSaveStock: { background: "#374151", color: "#fff", border: "none", borderRadius: 6, padding: "12px 22px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  btnSaveAnother: { background: "#e91e8c", color: "#fff", border: "none", borderRadius: 6, padding: "12px 22px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  btnSave: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 6, padding: "12px 32px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  pageHeader: {},
};
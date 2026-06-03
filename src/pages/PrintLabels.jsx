import { useState, useRef } from "react";

const PRICE_OPTIONS = ["Inc. tax", "Exc. tax"];
const BARCODE_SETTINGS = [
  "20 Labels per Sheet, Sheet Size: 8.5\" x 11\", Label Size: 2.625\" x 1\"",
  "30 Labels per Sheet, Sheet Size: 8.5\" x 11\", Label Size: 2.625\" x 1\"",
  "10 Labels per Sheet, Sheet Size: A4, Label Size: 70mm x 29mm",
];

// Simulated product search
const ALL_PRODUCTS = [
  { id: 1, name: "Product Alpha", sku: "SKU001", price: 150, brand: "Brand A" },
  { id: 2, name: "Product Beta", sku: "SKU002", price: 200, brand: "Brand B" },
  { id: 3, name: "Product Gamma", sku: "SKU003", price: 350, brand: "Brand C" },
];

export default function PrintLabels() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [labelProducts, setLabelProducts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Label info options
  const [options, setOptions] = useState({
    productName: true, productNameSize: 15,
    productVariation: true, productVariationSize: 17,
    productPrice: true, productPriceSize: 17,
    businessName: true, businessNameSize: 20,
    packingDate: true, packingDateSize: 12,
    showPrice: "Inc. tax",
  });
  const [barcodeSetting, setBarcodeSetting] = useState(BARCODE_SETTINGS[0]);

  const setOpt = (k, v) => setOptions(o => ({ ...o, [k]: v }));

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (q.trim().length < 1) { setSearchResults([]); return; }
    setSearchResults(ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase())
    ));
  };

  const addProduct = (product) => {
    if (labelProducts.find(p => p.id === product.id)) return;
    setLabelProducts(prev => [...prev, { ...product, qty: 1, packingDate: "", priceGroup: "Default" }]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateProduct = (id, key, val) => {
    setLabelProducts(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p));
  };

  const removeProduct = (id) => setLabelProducts(prev => prev.filter(p => p.id !== id));

  const handlePreview = () => {
    if (labelProducts.length === 0) { alert("Please add at least one product."); return; }
    setShowPreview(true);
  };

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>
        Print Labels
        <span style={s.infoIcon} title="Print barcode labels for your products">ℹ</span>
      </h1>

      {/* Add products section */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Add products to generate Labels</h2>

        {/* Search */}
        <div style={s.searchRow}>
          <span style={s.searchIcon}>🔍</span>
          <input style={s.searchInput}
            placeholder="Enter products name to print labels"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)} />
        </div>

        {/* Dropdown results */}
        {searchResults.length > 0 && (
          <div style={s.dropdown}>
            {searchResults.map(p => (
              <div key={p.id} style={s.dropItem} onClick={() => addProduct(p)}
                onMouseEnter={e => e.currentTarget.style.background = "#f0eeff"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                <strong>{p.name}</strong> <span style={{ color: "#888", fontSize: 12 }}>({p.sku})</span>
              </div>
            ))}
          </div>
        )}

        {/* Products table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.theadRow}>
                <th style={s.th}>Products</th>
                <th style={s.th}>No. of labels</th>
                <th style={s.th}>Packing Date</th>
                <th style={s.th}>Selling Price Group</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {labelProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={s.noData}>Search and add products above</td>
                </tr>
              ) : (
                labelProducts.map(p => (
                  <tr key={p.id} style={s.row}>
                    <td style={s.td}><strong>{p.name}</strong><br /><span style={{ color: "#888", fontSize: 12 }}>{p.sku}</span></td>
                    <td style={s.td}>
                      <input type="number" min={1} value={p.qty} style={s.numInput}
                        onChange={e => updateProduct(p.id, "qty", +e.target.value)} />
                    </td>
                    <td style={s.td}>
                      <input type="date" value={p.packingDate} style={s.numInput}
                        onChange={e => updateProduct(p.id, "packingDate", e.target.value)} />
                    </td>
                    <td style={s.td}>
                      <select style={s.numInput} value={p.priceGroup}
                        onChange={e => updateProduct(p.id, "priceGroup", e.target.value)}>
                        <option>Default</option>
                        <option>Wholesale</option>
                        <option>Retail</option>
                      </select>
                    </td>
                    <td style={s.td}>
                      <button style={s.removeBtn} onClick={() => removeProduct(p.id)}>✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Label info options */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Information to show in Labels</h2>
        <div style={s.optionsGrid}>
          {[
            { key: "productName", label: "Product Name", sizeKey: "productNameSize" },
            { key: "productVariation", label: "Product Variation (recommended)", sizeKey: "productVariationSize" },
            { key: "productPrice", label: "Product Price", sizeKey: "productPriceSize" },
            { key: "businessName", label: "Business name", sizeKey: "businessNameSize" },
            { key: "packingDate", label: "Print packing date", sizeKey: "packingDateSize" },
          ].map(opt => (
            <div key={opt.key} style={s.optionCard}>
              <label style={s.checkLabel}>
                <input type="checkbox" checked={options[opt.key]}
                  onChange={e => setOpt(opt.key, e.target.checked)}
                  style={{ accentColor: "#6c63ff", marginRight: 8 }} />
                {opt.label}
              </label>
              <div style={s.sizeRow}>
                <span style={s.sizeLabel}>Size</span>
                <input type="number" style={s.sizeInput} value={options[opt.sizeKey]}
                  onChange={e => setOpt(opt.sizeKey, +e.target.value)} />
              </div>
            </div>
          ))}

          {/* Show Price */}
          <div style={s.optionCard}>
            <label style={s.checkLabel}>
              <span style={{ fontWeight: 600 }}>Show Price:</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={s.infoIcon2} title="Tax type for price display">ℹ</span>
              <select style={s.sizeInput} value={options.showPrice}
                onChange={e => setOpt("showPrice", e.target.value)}>
                {PRICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        <hr style={s.divider} />

        {/* Barcode setting */}
        <div style={s.barcodeRow}>
          <span style={s.sizeLabel}>Barcode setting:</span>
          <div style={s.barcodeSelectRow}>
            <span style={s.gearIcon}>⚙</span>
            <select style={s.barcodeSelect} value={barcodeSetting}
              onChange={e => setBarcodeSetting(e.target.value)}>
              {BARCODE_SETTINGS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Preview button */}
      <div style={s.previewRow}>
        <button style={s.btnPreview} onClick={handlePreview}>Preview</button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={s.overlay}>
          <div style={s.previewModal}>
            <div style={s.previewHeader}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Label Preview</span>
              <button style={s.closeBtn} onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <div style={s.previewBody}>
              {labelProducts.map(p => (
                Array.from({ length: Math.min(p.qty, 4) }).map((_, i) => (
                  <div key={`${p.id}-${i}`} style={s.labelCard}>
                    {options.businessName && <div style={{ fontSize: options.businessNameSize, fontWeight: 700, color: "#1a1a2e" }}>Manodtechnologies</div>}
                    {options.productName && <div style={{ fontSize: options.productNameSize, fontWeight: 600 }}>{p.name}</div>}
                    {options.productVariation && <div style={{ fontSize: options.productVariationSize, color: "#555" }}>{p.sku}</div>}
                    {options.productPrice && <div style={{ fontSize: options.productPriceSize, color: "#6c63ff", fontWeight: 700 }}>₹{p.price}</div>}
                    {options.packingDate && p.packingDate && <div style={{ fontSize: options.packingDateSize, color: "#888" }}>Packed: {p.packingDate}</div>}
                    {/* Barcode visual */}
                    <div style={s.barcodeSvg}>
                      {Array.from({ length: 30 }).map((_, bi) => (
                        <div key={bi} style={{ ...s.barcodeBar, width: bi % 3 === 0 ? 3 : 1, background: bi % 5 === 0 ? "#fff" : "#111" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: "#333" }}>{p.sku}</div>
                  </div>
                ))
              ))}
            </div>
            <div style={s.previewFooter}>
              <button style={s.btnPrint} onClick={() => window.print()}>🖨 Print</button>
              <button style={s.btnClose} onClick={() => setShowPreview(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#222" },
  pageTitle: { fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 },
  infoIcon: { fontSize: 16, color: "#6c63ff", cursor: "help" },
  infoIcon2: { fontSize: 14, color: "#6c63ff", cursor: "help" },
  card: { background: "#fff", borderRadius: 10, padding: "28px 32px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", marginBottom: 20 },
  searchRow: { display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", marginBottom: 16, maxWidth: 700, position: "relative" },
  searchIcon: { padding: "0 12px", fontSize: 16, background: "#f9fafb", borderRight: "1px solid #e5e7eb", lineHeight: "42px" },
  searchInput: { flex: 1, border: "none", outline: "none", padding: "10px 14px", fontSize: 14, fontFamily: "inherit" },
  dropdown: { position: "absolute", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, zIndex: 100, width: 480, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", marginTop: -8 },
  dropItem: { padding: "10px 16px", cursor: "pointer", fontSize: 14, transition: "background 0.15s" },
  tableWrap: { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  theadRow: { background: "#f9fafb" },
  th: { padding: "11px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  row: { background: "#fff" },
  noData: { textAlign: "center", padding: 32, color: "#9ca3af", fontSize: 14 },
  numInput: { border: "1px solid #d1d5db", borderRadius: 5, padding: "6px 10px", fontSize: 13, width: 100, outline: "none" },
  removeBtn: { background: "none", border: "1px solid #fca5a5", borderRadius: 4, color: "#ef4444", cursor: "pointer", padding: "4px 10px", fontSize: 14 },
  optionsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  optionCard: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", background: "#fafafa" },
  checkLabel: { display: "flex", alignItems: "center", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 10 },
  sizeRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 6 },
  sizeLabel: { fontSize: 13, fontWeight: 600, color: "#6b7280" },
  sizeInput: { border: "1px solid #d1d5db", borderRadius: 5, padding: "5px 10px", fontSize: 13, width: 80, outline: "none" },
  divider: { border: "none", borderTop: "1px solid #f0f0f0", margin: "20px 0" },
  barcodeRow: { display: "flex", flexDirection: "column", gap: 10 },
  barcodeSelectRow: { display: "flex", alignItems: "center", gap: 10 },
  gearIcon: { fontSize: 18, color: "#6b7280" },
  barcodeSelect: { border: "1px solid #d1d5db", borderRadius: 5, padding: "7px 12px", fontSize: 13, outline: "none", maxWidth: 500 },
  previewRow: { display: "flex", justifyContent: "center", marginBottom: 24 },
  btnPreview: { background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, padding: "13px 48px", fontWeight: 700, fontSize: 16, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  previewModal: { background: "#fff", borderRadius: 10, width: 700, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  previewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e5e7eb" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#555" },
  previewBody: { padding: 24, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 16 },
  labelCard: { border: "2px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", width: 180, display: "flex", flexDirection: "column", gap: 4, background: "#fff" },
  barcodeSvg: { display: "flex", height: 36, alignItems: "flex-end", gap: 1, margin: "6px 0" },
  barcodeBar: { height: "100%", borderRadius: 1 },
  previewFooter: { display: "flex", justifyContent: "center", gap: 12, padding: "16px 24px", borderTop: "1px solid #e5e7eb" },
  btnPrint: { background: "#374151", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 600, cursor: "pointer" },
  btnClose: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, padding: "10px 28px", fontWeight: 600, cursor: "pointer" },
  footer: { textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 32 },
};
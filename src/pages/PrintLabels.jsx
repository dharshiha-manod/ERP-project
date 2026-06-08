import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-001", barcode: "8901234567890", price: "₹1,06,250", category: "Electronics", unit: "Piece" },
  { id: 2, name: "Apple iPhone 15 Pro", sku: "APL-IP15P-002", barcode: "8901234567891", price: "₹1,32,000", category: "Electronics", unit: "Piece" },
  { id: 3, name: "Nike Air Max 270", sku: "NIK-AM270-003", barcode: "8901234567892", price: "₹6,300", category: "Clothing", unit: "Piece" },
  { id: 4, name: "Sony WH-1000XM5 Headphones", sku: "SNY-WH1000-004", barcode: "8901234567893", price: "₹28,600", category: "Electronics", unit: "Piece" },
  { id: 5, name: "Bosch Washing Machine 7kg", sku: "BSH-WM7-005", barcode: "8901234567894", price: "₹34,160", category: "Appliances", unit: "Piece" },
  { id: 6, name: "Adidas Ultraboost 22", sku: "ADI-UB22-006", barcode: "8901234567895", price: "₹10,800", category: "Sports", unit: "Piece" },
  { id: 7, name: "LG 55\" OLED TV", sku: "LG-OLED55-007", barcode: "8901234567896", price: "₹88,500", category: "Electronics", unit: "Piece" },
  { id: 8, name: "A4 Copier Paper (500 sheets)", sku: "STA-A4P-009", barcode: "8901234567897", price: "₹282", category: "Stationery", unit: "Pack" },
];

const LABEL_SIZES = [
  { label: "Small (2\" × 1\")", value: "small", width: 160, height: 64 },
  { label: "Medium (3\" × 1.5\")", value: "medium", width: 220, height: 96 },
  { label: "Large (4\" × 2\")", value: "large", width: 280, height: 128 },
];

const PAPER_SIZES = ["A4", "A5", "Letter"];

export default function PrintLabels() {
  const [selected, setSelected] = useState([]);
  const [labelSize, setLabelSize] = useState("medium");
  const [paperSize, setPaperSize] = useState("A4");
  const [showPrice, setShowPrice] = useState(true);
  const [showSKU, setShowSKU] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [copies, setCopies] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  const selectedProducts = SAMPLE_PRODUCTS.filter(p => selected.includes(p.id));
  const size = LABEL_SIZES.find(l => l.value === labelSize);

  const handlePrint = () => {
    if (!selectedProducts.length) { alert("Please select at least one product to print labels."); return; }
    const labels = [];
    for (let c = 0; c < copies; c++) {
      selectedProducts.forEach(p => {
        labels.push(`
          <div style="width:${size.width}px;height:${size.height}px;border:1px solid #ccc;padding:6px;margin:4px;display:inline-block;font-family:monospace;font-size:10px;vertical-align:top;box-sizing:border-box;">
            <div style="font-weight:700;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div>
            ${showSKU ? `<div style="color:#555;">SKU: ${p.sku}</div>` : ""}
            ${showBarcode ? `<div style="font-size:18px;font-family:'Libre Barcode 128',monospace;letter-spacing:2px;overflow:hidden;">${p.barcode}</div><div style="font-size:9px;text-align:center;">${p.barcode}</div>` : ""}
            ${showPrice ? `<div style="font-weight:700;font-size:13px;color:#2e7d32;">${p.price}</div>` : ""}
          </div>
        `);
      });
    }
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Print Labels</title>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap" rel="stylesheet">
      <style>body{margin:10px;} @media print{body{margin:0;}}</style>
    </head><body>${labels.join("")}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleExportExcel = () => {
    const data = selectedProducts.length ? selectedProducts : SAMPLE_PRODUCTS;
    const ws = XLSX.utils.json_to_sheet(data.map(p => ({ Name: p.name, SKU: p.sku, Barcode: p.barcode, Price: p.price, Category: p.category, Unit: p.unit })));
    ws["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labels");
    XLSX.writeFile(wb, "product_labels.xlsx");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 4 }}>Print Labels</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Select products and configure label settings to print barcode labels.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Product Selection */}
        <div style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontWeight: 700, margin: 0 }}>Select Products ({selected.length} selected)</h4>
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, width: 200, outline: "none" }} />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ ...th, width: 40 }}>
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll} style={{ accentColor: "#2e7d32" }} />
                </th>
                <th style={th}>Product Name</th>
                <th style={th}>SKU</th>
                <th style={th}>Barcode</th>
                <th style={th}>Price</th>
                <th style={th}>Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0", background: selected.includes(p.id) ? "#f0fdf4" : i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={td}>
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)}
                      style={{ accentColor: "#2e7d32" }} />
                  </td>
                  <td style={{ ...td, fontWeight: 500 }}>{p.name}</td>
                  <td style={td}><code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{p.sku}</code></td>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: 11, color: "#555" }}>{p.barcode}</td>
                  <td style={{ ...td, color: "#2e7d32", fontWeight: 600 }}>{p.price}</td>
                  <td style={td}><span style={{ background: "#f3f4f6", borderRadius: 20, padding: "2px 10px", fontSize: 11 }}>{p.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Settings Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h4 style={{ fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Label Settings</h4>

            <div style={{ marginBottom: 14 }}>
              <label style={settingLabel}>Label Size</label>
              <select value={labelSize} onChange={e => setLabelSize(e.target.value)} style={settingInput}>
                {LABEL_SIZES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={settingLabel}>Paper Size</label>
              <select value={paperSize} onChange={e => setPaperSize(e.target.value)} style={settingInput}>
                {PAPER_SIZES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={settingLabel}>Copies per product</label>
              <input type="number" min="1" max="100" value={copies} onChange={e => setCopies(+e.target.value)} style={settingInput} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={settingLabel}>Show on Label</label>
              <label style={checkRow}><input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} style={{ accentColor: "#2e7d32" }} /> Show Price</label>
              <label style={checkRow}><input type="checkbox" checked={showSKU} onChange={e => setShowSKU(e.target.checked)} style={{ accentColor: "#2e7d32" }} /> Show SKU</label>
              <label style={checkRow}><input type="checkbox" checked={showBarcode} onChange={e => setShowBarcode(e.target.checked)} style={{ accentColor: "#2e7d32" }} /> Show Barcode</label>
            </div>
          </div>

          {/* Label Preview */}
          <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h4 style={{ fontWeight: 700, margin: "0 0 12px", color: "#1a1a2e" }}>Preview</h4>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80 }}>
              <div style={{ border: "1px dashed #9ca3af", padding: 8, width: size.width * 0.7, minHeight: size.height * 0.7, fontFamily: "monospace", fontSize: 9, background: "#fff" }}>
                <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 2 }}>Samsung Galaxy S24 Ultra</div>
                {showSKU && <div style={{ color: "#555", marginBottom: 2 }}>SKU: SAM-S24U-001</div>}
                {showBarcode && <div style={{ fontSize: 14, letterSpacing: 2, marginBottom: 2 }}>|||||||||||||||||</div>}
                {showPrice && <div style={{ fontWeight: 700, color: "#2e7d32" }}>₹1,06,250</div>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button style={{ background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 8, padding: "13px 0", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }}
            onClick={handlePrint}>
            🖨 Print Labels {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
          <button style={{ background: "#fff", border: "1px solid #2e7d32", color: "#2e7d32", borderRadius: 8, padding: "11px 0", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" }}
            onClick={handleExportExcel}>
            📊 Export to Excel
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 32 }}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </div>
    </div>
  );
}

const th = { textAlign: "left", padding: "10px 12px", fontWeight: 600, borderBottom: "2px solid #e5e7eb", color: "#374151" };
const td = { padding: "9px 12px", verticalAlign: "middle" };
const settingLabel = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 };
const settingInput = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" };
const checkRow = { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 6, padding: "4px 0" };
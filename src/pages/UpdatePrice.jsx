import { useState, useRef } from "react";
import * as XLSX from "xlsx";

// Sample product store (in real app, import from shared store)
const SAMPLE_PRODUCTS = [];

export default function UpdatePrice() {
  const fileRef = useRef();
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null); // null | 'success' | 'error'
  const [importMsg, setImportMsg] = useState("");

  const handleExport = () => {
    // Build export data — headers match the import format
    const headers = [
      ["Product Name", "SKU", "Purchase Price (Exc. Tax)", "Purchase Price (Inc. Tax)",
       "Selling Price", "Tax Rate", "Selling Price Tax Type"]
    ];
    // If you have real products, map them here. We export template.
    const rows = SAMPLE_PRODUCTS.length > 0
      ? SAMPLE_PRODUCTS.map(p => [p.name, p.sku, p.excTax, p.incTax, p.excTaxSell, p.tax, p.sellingPriceTaxType])
      : [["Example Product", "SKU001", "100", "118", "150", "GST 18%", "exclusive"]];

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    ws["!cols"] = headers[0].map(() => ({ wch: 26 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product Prices");
    XLSX.writeFile(wb, "product_prices.xlsx");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file || null);
    setImportStatus(null);
    setImportMsg("");
  };

  const handleSubmit = () => {
    if (!importFile) {
      setImportStatus("error");
      setImportMsg("Please choose a file to import.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        setImportStatus("success");
        setImportMsg(`Successfully imported ${rows.length} product price(s).`);
      } catch {
        setImportStatus("error");
        setImportMsg("Failed to parse file. Please use the exported template.");
      }
    };
    reader.readAsArrayBuffer(importFile);
  };

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Update Price</h1>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Import Export Product Price</h2>

        <div style={s.twoCol}>
          {/* Export side */}
          <div style={s.exportSide}>
            <button style={s.btnExport} onClick={handleExport}>
              Export product prices
            </button>
          </div>

          {/* Import side */}
          <div style={s.importSide}>
            <div style={s.fileRow}>
              <span style={s.fileLabel}>File To Import:</span>
              <div style={s.fileInputWrap}>
                <button style={s.chooseBtn} onClick={() => fileRef.current.click()}>
                  Choose File
                </button>
                <span style={s.fileName}>
                  {importFile ? importFile.name : "No file chosen"}
                </span>
                <input ref={fileRef} type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: "none" }}
                  onChange={handleFileChange} />
              </div>
            </div>
            <button style={s.btnSubmit} onClick={handleSubmit}>Submit</button>

            {importStatus && (
              <div style={importStatus === "success" ? s.alertSuccess : s.alertError}>
                {importStatus === "success" ? "✅ " : "❌ "}{importMsg}
              </div>
            )}
          </div>
        </div>

        <hr style={s.divider} />

        {/* Instructions */}
        <div style={s.instructions}>
          <h3 style={s.instrTitle}>Instructions:</h3>
          <ul style={s.instrList}>
            <li>Export product prices by clicking on the Export button above.</li>
            <li>Make changes in product price including tax &amp; selling price groups.</li>
            <li>Do not change any product name, SKU &amp; headers.</li>
            <li>After making changes import the file.</li>
          </ul>
        </div>
      </div>

      <div style={s.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#222", minHeight: "100vh" },
  pageTitle: { fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: 24 },
  card: { background: "#fff", borderRadius: 10, padding: "32px 36px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 28, borderBottom: "1px solid #f0f0f0", paddingBottom: 12 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" },
  exportSide: {},
  importSide: { display: "flex", flexDirection: "column", gap: 16 },
  btnExport: { background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 600, fontSize: 15, cursor: "pointer" },
  fileRow: { display: "flex", flexDirection: "column", gap: 8 },
  fileLabel: { fontWeight: 600, fontSize: 14, color: "#374151" },
  fileInputWrap: { display: "flex", alignItems: "center", gap: 10 },
  chooseBtn: { background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "#374151" },
  fileName: { fontSize: 13, color: "#6b7280" },
  btnSubmit: { background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, padding: "11px 32px", fontWeight: 600, fontSize: 15, cursor: "pointer", alignSelf: "flex-start" },
  alertSuccess: { background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 6, padding: "10px 16px", color: "#065f46", fontSize: 13 },
  alertError: { background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 16px", color: "#991b1b", fontSize: 13 },
  divider: { border: "none", borderTop: "1px solid #f0f0f0", margin: "28px 0" },
  instructions: {},
  instrTitle: { fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 10 },
  instrList: { paddingLeft: 20, color: "#555", fontSize: 14, lineHeight: 2 },
  footer: { textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 32 },
};
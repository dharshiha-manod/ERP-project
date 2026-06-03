import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const COLUMNS = [
  { no: 1,  field: "Product name",                     required: true,  note: "Name of the product" },
  { no: 2,  field: "Unit",                             required: true,  note: "Name of the unit" },
  { no: 3,  field: "Brand",                            required: false, note: "Name of the brand" },
  { no: 4,  field: "Category",                         required: true,  note: "Name of the product category" },
  { no: 5,  field: "Sub category",                     required: false, note: "Name of the Sub-Category. If not found, new sub-category will be created under the parent Category." },
  { no: 6,  field: "SKU",                              required: false, note: "Product SKU. If blank an SKU will be automatically generated." },
  { no: 7,  field: "Barcode Type",                     required: false, note: "Barcode Type. Default: C128. Options: C128, C39, EAN-13, EAN-8, UPC-A, UPC-E, ITF-14" },
  { no: 8,  field: "Manage Stock?",                    required: true,  note: "Enable or disable stock management. 1 = Yes, 0 = No" },
  { no: 9,  field: "Alert quantity",                   required: false, note: "Alert quantity" },
  { no: 10, field: "Expires in",                       required: false, note: "Product expiry period (Only in numbers)" },
  { no: 11, field: "Expiry Period Unit",               required: false, note: "Unit for expiry period. Options: days, months" },
  { no: 12, field: "Applicable Tax",                   required: false, note: "Name of the Tax Rate. Required if Purchase Price (Exc. Tax) ≠ Purchase Price (Inc. Tax)." },
  { no: 13, field: "Selling Price Tax Type",           required: true,  note: "Options: inclusive, exclusive" },
  { no: 14, field: "Product Type",                     required: true,  note: "Options: single, variable" },
  { no: 15, field: "Variation Name",                   required: false, note: "Required if product type is variable. e.g. Size, Color" },
  { no: 16, field: "Variation Values",                 required: false, note: "Values separated with '|'. e.g. Red|Blue|Green" },
  { no: 17, field: "Variation SKUs",                   required: false, note: "SKUs of each variation separated by '|' if product type is variable" },
  { no: 18, field: "Purchase Price (Including Tax)",   required: false, note: "Required if Purchase Price Exc. Tax not given. For variable products '|' separated. e.g. 84|85|88" },
  { no: 19, field: "Purchase Price (Excluding Tax)",   required: false, note: "Required if Purchase Price Inc. Tax not given. For variable products '|' separated. e.g. 84|85|88" },
  { no: 20, field: "Profit Margin %",                  required: false, note: "Profit Margin (numbers only). If blank, default business margin used." },
  { no: 21, field: "Selling Price",                    required: false, note: "If blank, selling price calculated from Purchase Price + Tax." },
  { no: 22, field: "Opening Stock",                    required: false, note: "Opening Stock (numbers only). For variable: '|' separated. e.g. 100|150|200" },
  { no: 23, field: "Opening stock location",           required: false, note: "Name of the business location. If blank, first location used." },
  { no: 24, field: "Expiry Date",                      required: false, note: "Format: mm-dd-yyyy. e.g. 11-25-2018" },
  { no: 25, field: "Enable Product description/IMEI",  required: false, note: "1 = Yes, 0 = No. Default: 0" },
  { no: 26, field: "Weight",                           required: false, note: "Optional" },
  { no: 27, field: "Rack",                             required: false, note: "Rack details separated by '|' for different business locations. e.g. R1|R5|R12" },
  { no: 28, field: "Row",                              required: false, note: "Row details separated by '|'. e.g. ROW1|ROW2|ROW3" },
  { no: 29, field: "Position",                         required: false, note: "Position details separated by '|'. e.g. POS1|POS2|POS3" },
  { no: 30, field: "Image",                            required: false, note: "Image name with extension or URL of the image." },
  { no: 31, field: "Product Description",              required: false, note: "" },
  { no: 32, field: "Custom Field1",                    required: false, note: "" },
  { no: 33, field: "Custom Field2",                    required: false, note: "" },
  { no: 34, field: "Custom Field3",                    required: false, note: "" },
  { no: 35, field: "Custom Field4",                    required: false, note: "" },
  { no: 36, field: "Not for selling",                  required: false, note: "1 = Yes, 0 = No" },
  { no: 37, field: "Product locations",                required: false, note: "Comma separated string of business location names where product will be available." },
];

const TEMPLATE_ROW = {
  "Product name": "Sample Product",
  "Unit": "Piece",
  "Brand": "Brand A",
  "Category": "Electronics",
  "Sub category": "",
  "SKU": "SKU001",
  "Barcode Type": "C128",
  "Manage Stock?": 1,
  "Alert quantity": 10,
  "Expires in": "",
  "Expiry Period Unit": "",
  "Applicable Tax": "GST 18%",
  "Selling Price Tax Type": "exclusive",
  "Product Type": "single",
  "Variation Name": "",
  "Variation Values": "",
  "Variation SKUs": "",
  "Purchase Price (Including Tax)": 118,
  "Purchase Price (Excluding Tax)": 100,
  "Profit Margin %": 25,
  "Selling Price": 150,
  "Opening Stock": 100,
  "Opening stock location": "Manodtechnologies (BL0001)",
  "Expiry Date": "",
  "Enable Product description/IMEI": 0,
  "Weight": "",
  "Rack": "",
  "Row": "",
  "Position": "",
  "Image": "",
  "Product Description": "",
  "Custom Field1": "",
  "Custom Field2": "",
  "Custom Field3": "",
  "Custom Field4": "",
  "Not for selling": 0,
  "Product locations": "Manodtechnologies (BL0001)",
};

export default function ImportProducts() {
  const fileRef = useRef();
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const [importedRows, setImportedRows] = useState([]);
  const [activeTab, setActiveTab] = useState("instructions");

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([TEMPLATE_ROW]);
    ws["!cols"] = Object.keys(TEMPLATE_ROW).map(() => ({ wch: 28 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Import");
    XLSX.writeFile(wb, "products_import_template.xlsx");
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0] || null);
    setImportStatus(null);
    setImportMsg("");
    setImportedRows([]);
  };

  const handleImport = () => {
    if (!importFile) { setImportStatus("error"); setImportMsg("Please choose a file."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        if (rows.length === 0) { setImportStatus("error"); setImportMsg("File is empty."); return; }
        setImportedRows(rows);
        setImportStatus("success");
        setImportMsg(`Successfully imported ${rows.length} product(s).`);
      } catch {
        setImportStatus("error");
        setImportMsg("Failed to parse file. Please use the provided template.");
      }
    };
    reader.readAsArrayBuffer(importFile);
  };

  return (
    <div style={s.page}>
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Import Products</h1>
          <span style={s.pageSubtitle}>Bulk import products via Excel/CSV</span>
        </div>
        <button style={s.btnTemplate} onClick={handleDownloadTemplate}>
          ⬇ Download Template
        </button>
      </div>

      {/* Upload card */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Upload File</h2>
        <div style={s.uploadArea}>
          <div style={s.uploadBox} onClick={() => fileRef.current.click()}>
            <span style={s.uploadIcon}>📤</span>
            <span style={s.uploadText}>
              {importFile ? importFile.name : "Click to choose file or drag & drop here"}
            </span>
            <span style={s.uploadHint}>.xlsx, .xls or .csv</span>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv"
            style={{ display: "none" }} onChange={handleFileChange} />
          <button style={s.btnImport} onClick={handleImport}>Import</button>
        </div>

        {importStatus && (
          <div style={importStatus === "success" ? s.alertSuccess : s.alertError}>
            {importStatus === "success" ? "✅ " : "❌ "}{importMsg}
          </div>
        )}

        {/* Imported preview */}
        {importedRows.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
              Preview (first 5 rows)
            </h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.theadRow}>
                    {Object.keys(importedRows[0]).slice(0, 8).map(k => (
                      <th key={k} style={s.th}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importedRows.slice(0, 5).map((row, i) => (
                    <tr key={i} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                      {Object.values(row).slice(0, 8).map((val, j) => (
                        <td key={j} style={s.td}>{String(val ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Instructions / Column details */}
      <div style={s.card}>
        <div style={s.tabRow}>
          {["instructions", "columns"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }}>
              {t === "instructions" ? "📋 Instructions" : "📊 Column Details (37 columns)"}
            </button>
          ))}
        </div>

        {activeTab === "instructions" && (
          <div style={s.instrSection}>
            <ol style={s.instrList}>
              <li>Download the import template using the <strong>Download Template</strong> button above.</li>
              <li>Fill in your product data following the column specifications.</li>
              <li><strong>Required fields:</strong> Product name, Unit, Category, Manage Stock?, Selling Price Tax Type, Product Type.</li>
              <li>For <strong>variable products</strong>, fill Variation Name, Variation Values (separated by <code>|</code>), and Variation SKUs.</li>
              <li>Do not change column headers in the template.</li>
              <li>For multiple business locations, separate values with <code>|</code>.</li>
              <li>Save as .xlsx or .csv and import using the Upload section above.</li>
              <li>After import, products will appear in your <strong>List Products</strong> page.</li>
            </ol>
          </div>
        )}

        {activeTab === "columns" && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.theadRow}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Column / Field</th>
                  <th style={s.th}>Required</th>
                  <th style={s.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map((col, i) => (
                  <tr key={col.no} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                    <td style={{ ...s.td, color: "#6b7280", width: 40 }}>{col.no}</td>
                    <td style={{ ...s.td, fontWeight: 600, whiteSpace: "nowrap" }}>{col.field}</td>
                    <td style={s.td}>
                      <span style={col.required ? s.badgeReq : s.badgeOpt}>
                        {col.required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: "#555", fontSize: 13 }}>{col.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={s.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#222" },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  pageTitle: { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a2e" },
  pageSubtitle: { fontSize: 13, color: "#888" },
  btnTemplate: { background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  card: { background: "#fff", borderRadius: 10, padding: "24px 28px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", marginBottom: 20 },
  uploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  uploadBox: { border: "2px dashed #d1d5db", borderRadius: 10, padding: "36px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", width: "100%", boxSizing: "border-box", transition: "border-color 0.2s", background: "#fafafa" },
  uploadIcon: { fontSize: 36 },
  uploadText: { fontSize: 15, color: "#374151", fontWeight: 500 },
  uploadHint: { fontSize: 12, color: "#9ca3af" },
  btnImport: { background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, padding: "12px 48px", fontWeight: 700, fontSize: 15, cursor: "pointer" },
  alertSuccess: { background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 6, padding: "12px 16px", color: "#065f46", fontSize: 13, marginTop: 14 },
  alertError: { background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "12px 16px", color: "#991b1b", fontSize: 13, marginTop: 14 },
  tabRow: { display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: 20 },
  tab: { padding: "10px 22px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#555", fontWeight: 500 },
  tabActive: { color: "#6c63ff", borderBottom: "2px solid #6c63ff", marginBottom: -2, fontWeight: 600 },
  instrSection: { padding: "0 8px" },
  instrList: { paddingLeft: 20, color: "#555", fontSize: 14, lineHeight: 2.2 },
  tableWrap: { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  theadRow: { background: "#f9fafb" },
  th: { padding: "11px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f0f0f0", verticalAlign: "top" },
  rowEven: { background: "#fff" },
  rowOdd: { background: "#fafafa" },
  badgeReq: { background: "#fee2e2", color: "#dc2626", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 },
  badgeOpt: { background: "#f0fdf4", color: "#16a34a", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 },
  footer: { textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 32 },
};
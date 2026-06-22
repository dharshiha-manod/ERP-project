import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const COLUMNS = [
  { no:1,  field:"Product name",                    required:true,  note:"Name of the product" },
  { no:2,  field:"Unit",                            required:true,  note:"Name of the unit" },
  { no:3,  field:"Brand",                           required:false, note:"Name of the brand" },
  { no:4,  field:"Category",                        required:true,  note:"Name of the product category" },
  { no:5,  field:"Sub category",                    required:false, note:"Name of the Sub-Category. If not found, new sub-category will be created under the parent Category." },
  { no:6,  field:"SKU",                             required:false, note:"Product SKU. If blank an SKU will be automatically generated." },
  { no:7,  field:"Barcode Type",                    required:false, note:"Barcode Type. Default: C128. Options: C128, C39, EAN-13, EAN-8, UPC-A, UPC-E, ITF-14" },
  { no:8,  field:"Manage Stock?",                   required:true,  note:"Enable or disable stock management. 1 = Yes, 0 = No" },
  { no:9,  field:"Alert quantity",                  required:false, note:"Alert quantity" },
  { no:10, field:"Applicable Tax",                  required:false, note:"Name of the Tax Rate. e.g. GST 18%" },
  { no:11, field:"Selling Price Tax Type",          required:true,  note:"Options: inclusive, exclusive" },
  { no:12, field:"Product Type",                    required:true,  note:"Options: single, variable" },
  { no:13, field:"Variation Name",                  required:false, note:"Required if product type is variable. e.g. Size, Color" },
  { no:14, field:"Variation Values",                required:false, note:"Values separated with '|'. e.g. Red|Blue|Green" },
  { no:15, field:"Purchase Price (Including Tax)",  required:false, note:"For variable products '|' separated. e.g. 84|85|88" },
  { no:16, field:"Purchase Price (Excluding Tax)",  required:false, note:"For variable products '|' separated. e.g. 84|85|88" },
  { no:17, field:"Profit Margin %",                 required:false, note:"Profit Margin (numbers only). If blank, default business margin used." },
  { no:18, field:"Selling Price",                   required:false, note:"If blank, selling price calculated from Purchase Price + Tax." },
  { no:19, field:"Opening Stock",                   required:false, note:"Opening Stock (numbers only)." },
  { no:20, field:"Opening stock location",          required:false, note:"Name of the business location. If blank, first location used." },
  { no:21, field:"Weight",                          required:false, note:"Weight in kg" },
  { no:22, field:"Product Description",             required:false, note:"" },
  { no:23, field:"Not for selling",                 required:false, note:"1 = Yes, 0 = No" },
  { no:24, field:"Product locations",               required:false, note:"Comma separated business location names." },
];

const TEMPLATE_ROW = {
  "Product name": "Sample Product",
  "Unit": "Pieces",
  "Brand": "Generic",
  "Category": "Electronics",
  "Sub category": "",
  "SKU": "SKU001",
  "Barcode Type": "C128",
  "Manage Stock?": 1,
  "Alert quantity": 10,
  "Applicable Tax": "GST 18%",
  "Selling Price Tax Type": "exclusive",
  "Product Type": "single",
  "Variation Name": "",
  "Variation Values": "",
  "Purchase Price (Including Tax)": 118,
  "Purchase Price (Excluding Tax)": 100,
  "Profit Margin %": 25,
  "Selling Price": 150,
  "Opening Stock": 100,
  "Opening stock location": "Manodtechnologies (BL0001)",
  "Weight": "",
  "Product Description": "",
  "Not for selling": 0,
  "Product locations": "Manodtechnologies (BL0001)",
};

// Map Excel row → API payload
function rowToPayload(row) {
  return {
    name:                   row["Product name"],
    sku:                    row["SKU"] || null,
    barcode_type:           row["Barcode Type"] || "Code 128 (C128)",
    unit:                   row["Unit"],
    brand:                  row["Brand"] || null,
    category:               row["Category"] || null,
    sub_category:           row["Sub category"] || null,
    business_location:      row["Opening stock location"] || "Manodtechnologies (BL0001)",
    alert_qty:              parseFloat(row["Alert quantity"]) || 0,
    manage_stock:           String(row["Manage Stock?"]) === "1",
    description:            row["Product Description"] || null,
    weight:                 row["Weight"] || null,
    tax:                    row["Applicable Tax"] || "None",
    selling_price_tax_type: row["Selling Price Tax Type"] || "Exclusive",
    product_type:           row["Product Type"] || "Single",
    exc_tax:                parseFloat(row["Purchase Price (Excluding Tax)"]) || 0,
    inc_tax:                parseFloat(row["Purchase Price (Including Tax)"]) || 0,
    margin:                 parseFloat(row["Profit Margin %"]) || 0,
    exc_tax_sell:           parseFloat(row["Selling Price"]) || 0,
    status:                 "Active",
  };
}

export default function ImportProducts() {
  const fileRef = useRef();
  const [importFile, setImportFile]     = useState(null);
  const [importStatus, setImportStatus] = useState(null); // null | "success" | "error" | "partial"
  const [importMsg, setImportMsg]       = useState("");
  const [importedRows, setImportedRows] = useState([]);
  const [importing, setImporting]       = useState(false);
  const [results, setResults]           = useState([]); // per-row results
  const [activeTab, setActiveTab]       = useState("instructions");

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([TEMPLATE_ROW]);
    ws["!cols"] = Object.keys(TEMPLATE_ROW).map(() => ({ wch: 28 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Import");
    XLSX.writeFile(wb, "products_import_template.xlsx");
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0] || null);
    setImportStatus(null); setImportMsg(""); setImportedRows([]); setResults([]);
  };

  // Parse file and preview
  const handlePreview = () => {
    if (!importFile) { setImportStatus("error"); setImportMsg("Please choose a file."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        if (!rows.length) { setImportStatus("error"); setImportMsg("File is empty."); return; }
        // Validate required fields
        const missing = rows.map((r, i) => {
          const errs = [];
          if (!r["Product name"]) errs.push("Product name");
          if (!r["Unit"])         errs.push("Unit");
          if (!r["Category"])     errs.push("Category");
          return errs.length ? `Row ${i+2}: missing ${errs.join(", ")}` : null;
        }).filter(Boolean);
        if (missing.length) {
          setImportStatus("error");
          setImportMsg("Validation errors:\n" + missing.slice(0,5).join("\n") + (missing.length>5?`\n...and ${missing.length-5} more`:""));
          return;
        }
        setImportedRows(rows);
        setImportStatus("preview");
        setImportMsg(`${rows.length} rows ready to import. Click "Import" to proceed.`);
      } catch { setImportStatus("error"); setImportMsg("Failed to parse file. Please use the provided template."); }
    };
    reader.readAsArrayBuffer(importFile);
  };

  // Actual import to backend
  const handleImport = async () => {
    if (!importedRows.length) { alert("Please preview a valid file first."); return; }
    setImporting(true);
    setResults([]);
    const res = [];
    for (let i = 0; i < importedRows.length; i++) {
      const row = importedRows[i];
      const payload = rowToPayload(row);
      try {
        const resp = await fetch(`${BASE_URL}/products`, { method:"POST", headers: authHeaders(), body: JSON.stringify(payload) });
        const data = await resp.json();
        res.push({ row: i+2, name: payload.name, ok: resp.ok, msg: resp.ok ? "Imported" : (data.error||"Failed") });
      } catch (err) {
        res.push({ row: i+2, name: payload.name, ok: false, msg: err.message });
      }
    }
    setResults(res);
    const success = res.filter(r=>r.ok).length;
    const failed  = res.filter(r=>!r.ok).length;
    setImportStatus(failed === 0 ? "success" : success === 0 ? "error" : "partial");
    setImportMsg(`Imported ${success} of ${importedRows.length} product(s).${failed>0?` ${failed} failed.`:""}`);
    setImporting(false);
  };

  return (
    <div style={s.page}>
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Import Products</h1>
          <span style={s.pageSubtitle}>Bulk import products via Excel/CSV</span>
        </div>
        <button style={s.btnTemplate} onClick={handleDownloadTemplate}>⬇ Download Template</button>
      </div>

      {/* Upload card */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Upload File</h2>
        <div style={s.uploadArea}>
          <div style={s.uploadBox} onClick={() => fileRef.current.click()}>
            <span style={s.uploadIcon}>📤</span>
            <span style={s.uploadText}>{importFile ? importFile.name : "Click to choose file or drag & drop here"}</span>
            <span style={s.uploadHint}>.xlsx, .xls or .csv</span>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }} onChange={handleFileChange}/>
          <div style={{ display:"flex", gap:12 }}>
            <button style={s.btnPreview} onClick={handlePreview} disabled={importing}>Preview</button>
            <button style={{ ...s.btnImport, opacity: (!importedRows.length||importing)?0.6:1 }}
              onClick={handleImport} disabled={!importedRows.length||importing}>
              {importing ? `Importing... (${results.length}/${importedRows.length})` : "Import"}
            </button>
          </div>
        </div>

        {importStatus && importStatus !== "preview" && (
          <div style={importStatus==="success"?s.alertSuccess:importStatus==="partial"?s.alertWarning:s.alertError}>
            {importStatus==="success"?"✅ ":importStatus==="partial"?"⚠️ ":"❌ "}{importMsg}
          </div>
        )}
        {importStatus === "preview" && (
          <div style={s.alertSuccess}>ℹ️ {importMsg}</div>
        )}

        {/* Per-row results */}
        {results.length > 0 && (
          <div style={{ marginTop:16 }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>Import Results</h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr style={s.theadRow}>
                  <th style={s.th}>Row</th><th style={s.th}>Product</th><th style={s.th}>Status</th><th style={s.th}>Message</th>
                </tr></thead>
                <tbody>
                  {results.map((r,i) => (
                    <tr key={i} style={i%2===0?s.rowEven:s.rowOdd}>
                      <td style={{ ...s.td, color:"#6b7280" }}>{r.row}</td>
                      <td style={{ ...s.td, fontWeight:500 }}>{r.name}</td>
                      <td style={s.td}><span style={r.ok?s.badgeOk:s.badgeErr}>{r.ok?"✓ OK":"✗ Failed"}</span></td>
                      <td style={{ ...s.td, color: r.ok?"#065f46":"#991b1b", fontSize:12 }}>{r.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Preview table */}
        {importedRows.length > 0 && !results.length && (
          <div style={{ marginTop:20 }}>
            <h3 style={{ fontSize:14, fontWeight:600, color:"#374151", marginBottom:10 }}>Preview (first 5 rows)</h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr style={s.theadRow}>
                  {Object.keys(importedRows[0]).slice(0,8).map(k => <th key={k} style={s.th}>{k}</th>)}
                </tr></thead>
                <tbody>
                  {importedRows.slice(0,5).map((row,i) => (
                    <tr key={i} style={i%2===0?s.rowEven:s.rowOdd}>
                      {Object.values(row).slice(0,8).map((val,j) => <td key={j} style={s.td}>{String(val??"")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Instructions / Column details */}
      <div style={s.card}>
        <div style={s.tabRow}>
          {["instructions","columns"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ ...s.tab, ...(activeTab===t?s.tabActive:{}) }}>
              {t==="instructions"?"📋 Instructions":`📊 Column Details (${COLUMNS.length} columns)`}
            </button>
          ))}
        </div>

        {activeTab === "instructions" && (
          <div style={s.instrSection}>
            <ol style={s.instrList}>
              <li>Download the import template using the <strong>Download Template</strong> button above.</li>
              <li>Fill in your product data following the column specifications.</li>
              <li><strong>Required fields:</strong> Product name, Unit, Category, Manage Stock?, Selling Price Tax Type, Product Type.</li>
              <li>For <strong>variable products</strong>, fill Variation Name and Variation Values (separated by <code>|</code>).</li>
              <li>Do not change column headers in the template.</li>
              <li>Click <strong>Preview</strong> to validate your file first, then click <strong>Import</strong> to save.</li>
              <li>After import, products will appear in your <strong>List Products</strong> page.</li>
            </ol>
          </div>
        )}

        {activeTab === "columns" && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr style={s.theadRow}>
                <th style={s.th}>#</th><th style={s.th}>Column / Field</th>
                <th style={s.th}>Required</th><th style={s.th}>Description</th>
              </tr></thead>
              <tbody>
                {COLUMNS.map((col,i) => (
                  <tr key={col.no} style={i%2===0?s.rowEven:s.rowOdd}>
                    <td style={{ ...s.td, color:"#6b7280", width:40 }}>{col.no}</td>
                    <td style={{ ...s.td, fontWeight:600, whiteSpace:"nowrap" }}>{col.field}</td>
                    <td style={s.td}><span style={col.required?s.badgeReq:s.badgeOpt}>{col.required?"Required":"Optional"}</span></td>
                    <td style={{ ...s.td, color:"#555", fontSize:13 }}>{col.note}</td>
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
  page:         { fontFamily:"'Segoe UI', sans-serif", color:"#222" },
  titleRow:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 },
  pageTitle:    { margin:0, fontSize:26, fontWeight:700, color:"#1a1a2e" },
  pageSubtitle: { fontSize:13, color:"#888" },
  btnTemplate:  { background:"#2e7d32", color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", fontWeight:600, cursor:"pointer", fontSize:14 },
  card:         { background:"#fff", borderRadius:10, padding:"24px 28px", border:"1px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", marginBottom:20 },
  cardTitle:    { fontSize:17, fontWeight:600, color:"#1a1a2e", marginBottom:20 },
  uploadArea:   { display:"flex", flexDirection:"column", alignItems:"center", gap:16 },
  uploadBox:    { border:"2px dashed #d1d5db", borderRadius:10, padding:"36px 60px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, cursor:"pointer", width:"100%", boxSizing:"border-box", background:"#fafafa" },
  uploadIcon:   { fontSize:36 },
  uploadText:   { fontSize:15, color:"#374151", fontWeight:500 },
  uploadHint:   { fontSize:12, color:"#9ca3af" },
  btnPreview:   { background:"#374151", color:"#fff", border:"none", borderRadius:8, padding:"12px 32px", fontWeight:700, fontSize:15, cursor:"pointer" },
  btnImport:    { background:"#6c63ff", color:"#fff", border:"none", borderRadius:8, padding:"12px 48px", fontWeight:700, fontSize:15, cursor:"pointer" },
  alertSuccess: { background:"#d1fae5", border:"1px solid #6ee7b7", borderRadius:6, padding:"12px 16px", color:"#065f46", fontSize:13, marginTop:14, whiteSpace:"pre-line" },
  alertWarning: { background:"#fef3c7", border:"1px solid #fcd34d", borderRadius:6, padding:"12px 16px", color:"#92400e", fontSize:13, marginTop:14 },
  alertError:   { background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:6, padding:"12px 16px", color:"#991b1b", fontSize:13, marginTop:14, whiteSpace:"pre-line" },
  tabRow:       { display:"flex", borderBottom:"2px solid #e5e7eb", marginBottom:20 },
  tab:          { padding:"10px 22px", border:"none", background:"transparent", cursor:"pointer", fontSize:14, color:"#555", fontWeight:500 },
  tabActive:    { color:"#6c63ff", borderBottom:"2px solid #6c63ff", marginBottom:-2, fontWeight:600 },
  instrSection: { padding:"0 8px" },
  instrList:    { paddingLeft:20, color:"#555", fontSize:14, lineHeight:2.2 },
  tableWrap:    { overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:8 },
  table:        { width:"100%", borderCollapse:"collapse", fontSize:13 },
  theadRow:     { background:"#f9fafb" },
  th:           { padding:"11px 14px", textAlign:"left", fontWeight:600, color:"#374151", borderBottom:"2px solid #e5e7eb", whiteSpace:"nowrap" },
  td:           { padding:"10px 14px", borderBottom:"1px solid #f0f0f0", verticalAlign:"top" },
  rowEven:      { background:"#fff" },
  rowOdd:       { background:"#fafafa" },
  badgeReq:     { background:"#fee2e2", color:"#dc2626", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600 },
  badgeOpt:     { background:"#f0fdf4", color:"#16a34a", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600 },
  badgeOk:      { background:"#d1fae5", color:"#065f46", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 },
  badgeErr:     { background:"#fee2e2", color:"#991b1b", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 },
  footer:       { textAlign:"center", color:"#9ca3af", fontSize:12, marginTop:32 },
};
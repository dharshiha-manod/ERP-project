import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authHeaders = () => {
  const token = localStorage.getItem("manod_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const COLUMNS = [
  { num:1, name:"SKU",                   badge:"Required", instruction:"Exact SKU of the existing product" },
  { num:2, name:"Location",              badge:"Optional", sub:"If blank, first business location will be used", instruction:"Name of the business location" },
  { num:3, name:"Quantity",              badge:"Required", instruction:"Opening stock quantity (numbers only)" },
  { num:4, name:"Unit Cost (Before Tax)",badge:"Required", instruction:"Purchase price excluding tax" },
  { num:5, name:"Lot Number",            badge:"Optional", instruction:"" },
  { num:6, name:"Expiry Date",           badge:"Optional", instruction:'Stock expiry date in mm/dd/yyyy format. e.g. 06/03/2026' },
];

const TEMPLATE_ROW = {
  "SKU":                    "SGS24-128-BLK",
  "Location":               "Manodtechnologies (BL0001)",
  "Quantity":               50,
  "Unit Cost (Before Tax)": 52999,
  "Lot Number":             "",
  "Expiry Date":            "",
};

export default function ImportOpeningStock() {
  const fileRef = useRef();
  const [fileName, setFileName]   = useState("No file chosen");
  const [file, setFile]           = useState(null);
  const [rows, setRows]           = useState([]);
  const [importing, setImporting] = useState(false);
  const [status, setStatus]       = useState(null); // null | "preview" | "success" | "error" | "partial"
  const [msg, setMsg]             = useState("");
  const [results, setResults]     = useState([]);

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([TEMPLATE_ROW]);
    ws["!cols"] = Object.keys(TEMPLATE_ROW).map(() => ({ wch: 28 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Opening Stock");
    XLSX.writeFile(wb, "opening_stock_template.xlsx");
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFileName(f.name); setFile(f); setRows([]); setStatus(null); setMsg(""); setResults([]); }
  };

  const handlePreview = () => {
    if (!file) { setStatus("error"); setMsg("Please choose a file first."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb    = XLSX.read(new Uint8Array(ev.target.result), { type:"array" });
        const ws    = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(ws);
        if (!parsed.length) { setStatus("error"); setMsg("File is empty."); return; }
        // Validate required
        const errors = parsed.map((r,i) => {
          const e = [];
          if (!r["SKU"])      e.push("SKU");
          if (!r["Quantity"]) e.push("Quantity");
          if (!r["Unit Cost (Before Tax)"]) e.push("Unit Cost (Before Tax)");
          return e.length ? `Row ${i+2}: missing ${e.join(", ")}` : null;
        }).filter(Boolean);
        if (errors.length) { setStatus("error"); setMsg(errors.slice(0,5).join("\n") + (errors.length>5?`\n...and ${errors.length-5} more`:"")); return; }
        setRows(parsed);
        setStatus("preview");
        setMsg(`${parsed.length} row(s) ready. Click Submit to update opening stock.`);
      } catch { setStatus("error"); setMsg("Failed to parse file. Please use the provided template."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (!rows.length) { alert("Please preview a valid file first."); return; }
    setImporting(true); setResults([]);
    const res = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const sku = String(row["SKU"] || "").trim();
      const qty = parseInt(row["Quantity"]) || 0;

      try {
        // 1. Find product by SKU
        const searchRes  = await fetch(`${BASE_URL}/products?search=${encodeURIComponent(sku)}&limit=5`, { headers: authHeaders() });
        const searchData = await searchRes.json();
        const product    = (searchData.products || []).find(p => p.sku && p.sku.toLowerCase() === sku.toLowerCase());

        if (!product) {
          res.push({ row:i+2, sku, ok:false, msg:`Product with SKU "${sku}" not found` });
          continue;
        }

        // 2. Update stock via PATCH
        const updateRes  = await fetch(`${BASE_URL}/products/${product.id}/stock`, {
          method: "PATCH", headers: authHeaders(),
          body: JSON.stringify({ quantity: qty, type: "opening", unit_cost: parseFloat(row["Unit Cost (Before Tax)"]) || 0 })
        });
        const updateData = await updateRes.json();
        res.push({ row:i+2, sku, ok: updateRes.ok, msg: updateRes.ok ? `Stock set to ${qty}` : (updateData.error||"Failed") });
      } catch (err) {
        res.push({ row:i+2, sku, ok:false, msg: err.message });
      }
    }

    setResults(res);
    const ok   = res.filter(r=>r.ok).length;
    const fail = res.filter(r=>!r.ok).length;
    setStatus(fail===0?"success":ok===0?"error":"partial");
    setMsg(`Updated ${ok} of ${rows.length} product(s).${fail>0?` ${fail} failed.`:""}`);
    setImporting(false);
  };

  return (
    <div style={{ fontFamily:"sans-serif", color:"#333" }}>
      <h2 style={{ fontWeight:700, fontSize:24, marginBottom:20 }}>Import Opening Stock</h2>

      {/* Upload Card */}
      <div style={{ background:"#fff", borderRadius:8, padding:"24px", marginBottom:24, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <div>
            <label style={{ fontWeight:500, marginRight:8 }}>
              File To Import:
              <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:18, height:18,
                borderRadius:"50%", background:"#17a2b8", color:"#fff", fontSize:11, marginLeft:4, cursor:"pointer" }}
                title="Upload a CSV or Excel file with columns: SKU, Location, Quantity, Unit Cost (Before Tax), Lot Number, Expiry Date">i</span>
            </label>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
              <label style={{ padding:"5px 10px", border:"1px solid #aaa", borderRadius:4, cursor:"pointer", background:"#f8f8f8", fontSize:13 }}>
                Choose File
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display:"none" }} onChange={handleFileChange}/>
              </label>
              <span style={{ fontSize:13, color:"#666" }}>{fileName}</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginLeft:"auto" }}>
            <button onClick={handlePreview}
              style={{ background:"#374151", color:"#fff", border:"none", borderRadius:6, padding:"10px 20px", fontSize:14, cursor:"pointer", fontWeight:500 }}>
              Preview
            </button>
            <button onClick={handleSubmit} disabled={!rows.length || importing}
              style={{ background:"#6f42c1", color:"#fff", border:"none", borderRadius:6, padding:"10px 28px", fontSize:15, cursor:(!rows.length||importing)?"not-allowed":"pointer", fontWeight:500, opacity:(!rows.length||importing)?0.6:1 }}>
              {importing ? `Updating... (${results.length}/${rows.length})` : "Submit"}
            </button>
          </div>
        </div>

        {status && (
          <div style={{ marginTop:14, padding:"12px 16px", borderRadius:6, fontSize:13, whiteSpace:"pre-line",
            background: status==="success"?"#d1fae5":status==="preview"?"#dbeafe":status==="partial"?"#fef3c7":"#fee2e2",
            border: `1px solid ${status==="success"?"#6ee7b7":status==="preview"?"#93c5fd":status==="partial"?"#fcd34d":"#fca5a5"}`,
            color: status==="success"?"#065f46":status==="preview"?"#1e40af":status==="partial"?"#92400e":"#991b1b" }}>
            {status==="success"?"✅ ":status==="preview"?"ℹ️ ":status==="partial"?"⚠️ ":"❌ "}{msg}
          </div>
        )}

        {/* Per-row results */}
        {results.length > 0 && (
          <div style={{ marginTop:16 }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>Update Results</h3>
            <div style={{ overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:8 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr style={{ background:"#f9fafb" }}>
                  <th style={th}>Row</th><th style={th}>SKU</th><th style={th}>Status</th><th style={th}>Message</th>
                </tr></thead>
                <tbody>
                  {results.map((r,i) => (
                    <tr key={i} style={{ background:i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f0f0f0" }}>
                      <td style={{ padding:"10px 12px", color:"#6b7280" }}>{r.row}</td>
                      <td style={{ padding:"10px 12px", fontFamily:"monospace", fontSize:12 }}>{r.sku}</td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ background:r.ok?"#d1fae5":"#fee2e2", color:r.ok?"#065f46":"#991b1b", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 }}>
                          {r.ok?"✓ OK":"✗ Failed"}
                        </span>
                      </td>
                      <td style={{ padding:"10px 12px", color:r.ok?"#065f46":"#991b1b", fontSize:12 }}>{r.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Preview table */}
        {rows.length > 0 && !results.length && (
          <div style={{ marginTop:16 }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>Preview (first 5 rows)</h3>
            <div style={{ overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:8 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr style={{ background:"#f9fafb" }}>
                  {Object.keys(rows[0]).map(k => <th key={k} style={th}>{k}</th>)}
                </tr></thead>
                <tbody>
                  {rows.slice(0,5).map((row,i) => (
                    <tr key={i} style={{ background:i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f0f0f0" }}>
                      {Object.values(row).map((v,j) => <td key={j} style={{ padding:"10px 12px" }}>{String(v??"")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Download Template */}
        <div style={{ marginTop:20 }}>
          <button onClick={handleDownloadTemplate}
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#28a745", color:"#fff", padding:"10px 20px", borderRadius:6, border:"none", fontWeight:500, fontSize:14, cursor:"pointer" }}>
            <span style={{ fontSize:16 }}>⬇</span> Download template file
          </button>
        </div>
      </div>

      {/* Instructions Card */}
      <div style={{ background:"#fff", borderRadius:8, padding:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
        <h4 style={{ fontWeight:700, fontSize:18, marginBottom:12 }}>Instructions</h4>
        <p style={{ fontWeight:600, marginBottom:4 }}>Carefully follow the instructions before importing the file.</p>
        <p style={{ color:"#555", marginBottom:16 }}>The columns of the CSV/Excel file should be in the following order:</p>

        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #dee2e6" }}>
              <th style={th}>Column Number</th>
              <th style={th}>Column Name</th>
              <th style={th}>Instruction</th>
            </tr>
          </thead>
          <tbody>
            {COLUMNS.map((row, i) => (
              <tr key={i} style={{ borderBottom:"1px solid #dee2e6", background:i%2===0?"#fff":"#f9f9f9" }}>
                <td style={{ padding:"10px 12px" }}>{row.num}</td>
                <td style={{ padding:"10px 12px" }}>
                  {row.name}{" "}
                  <span style={{ fontSize:11, color:"#555", background:"#e9ecef", borderRadius:3, padding:"1px 5px" }}>
                    ({row.badge})
                  </span>
                  {row.sub && <div style={{ fontSize:12, color:"#888", marginTop:2 }}>{row.sub}</div>}
                </td>
                <td style={{ padding:"10px 12px", color:"#555" }}>{row.instruction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign:"left", padding:"10px 12px", fontWeight:600, borderBottom:"2px solid #e5e7eb", color:"#374151" };
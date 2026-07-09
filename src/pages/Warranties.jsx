import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── API base (same pattern as rest of ERP) ──────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authHeaders = () => {
  const token = localStorage.getItem("manod_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
};

const warrantiesAPI = {
  getAll:  (p = {}) => {
    const qs = Object.entries(p).filter(([,v]) => v !== undefined && v !== "").map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return fetch(`${BASE_URL}/products/warranties${qs ? "?" + qs : ""}`, { headers: authHeaders() }).then(handleResponse);
  },
  create:  (d)    => fetch(`${BASE_URL}/products/warranties`,      { method: "POST",   headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:  (id,d) => fetch(`${BASE_URL}/products/warranties/${id}`,{ method: "PUT",    headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:  (id)   => fetch(`${BASE_URL}/products/warranties/${id}`,{ method: "DELETE", headers: authHeaders() }).then(handleResponse),
};

const DURATION_UNITS = ["Days", "Months", "Years"];

// ── Export helpers ──────────────────────────────────────────
function exportCSV(warranties) {
  if (!warranties.length) { alert("No data to export"); return; }
  const headers = ["Name","Description","Duration","Unit"];
  const rows = warranties.map(w => [`"${w.name}"`,`"${w.description||""}"`,`"${w.duration}"`,`"${w.duration_type||w.durationUnit}"`]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "warranties.csv"; a.click();
  URL.revokeObjectURL(url);
}
function exportExcel(warranties) {
  if (!warranties.length) { alert("No data to export"); return; }
  const data = warranties.map(w => ({ Name: w.name, Description: w.description||"", Duration: w.duration, Unit: w.duration_type||w.durationUnit }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 25 },{ wch: 55 },{ wch: 12 },{ wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Warranties");
  XLSX.writeFile(wb, "warranties.xlsx");
}
function exportPDF(warranties) {
  if (!warranties.length) { alert("No data to export"); return; }
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text("Warranties List", 14, 15);
  doc.setFontSize(10); doc.text(`Exported: ${new Date().toLocaleDateString()}`, 14, 22);
  autoTable(doc, {
    head: [["Name","Description","Duration","Unit"]],
    body: warranties.map(w => [w.name, w.description||"", w.duration, w.duration_type||w.durationUnit]),
    startY: 28, styles: { fontSize: 9 },
    headStyles: { fillColor: [46,125,50] },
    columnStyles: { 1: { cellWidth: 80 } }
  });
  doc.save("warranties.pdf");
}
function printWarranties(warranties) {
  const win = window.open("","_blank");
  win.document.write(`<html><head><title>Warranties</title><style>
    body{font-family:sans-serif;font-size:12px;} table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;}
    th{background:#2e7d32;color:#fff;}
  </style></head><body>
    <h2>Warranties List</h2><p>Date: ${new Date().toLocaleDateString()}</p>
    <table><thead><tr><th>Name</th><th>Description</th><th>Duration</th><th>Unit</th></tr></thead>
    <tbody>${warranties.map(w => `<tr><td>${w.name}</td><td>${w.description||""}</td><td>${w.duration}</td><td>${w.duration_type||""}</td></tr>`).join("")}</tbody>
    </table></body></html>`);
  win.document.close(); win.print();
}

export default function Warranties() {
  const [warranties, setWarranties] = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState({ name: "", description: "", duration: "", durationUnit: "" });
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [perPage, setPerPage]       = useState(25);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await warrantiesAPI.getAll({ page, limit: perPage, search });
      setWarranties(data.warranties || []);
      setTotal(data.total || 0);
    } catch (err) { setError(err.message || "Failed to load warranties"); }
    finally { setLoading(false); }
  }, [page, perPage, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openAdd  = () => { setForm({ name: "", description: "", duration: "", durationUnit: "" }); setEditItem(null); setShowModal(true); };
  const openEdit = (w) => { setForm({ name: w.name, description: w.description||"", duration: String(w.duration), durationUnit: w.duration_type||"" }); setEditItem(w); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim())              { alert("Name is required."); return; }
    if (!form.duration || !form.durationUnit) { alert("Duration and unit are required."); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description, duration: parseInt(form.duration), duration_type: form.durationUnit.toLowerCase() };
      if (editItem) await warrantiesAPI.update(editItem.id, payload);
      else          await warrantiesAPI.create(payload);
      setShowModal(false); setPage(1); await load();
    } catch (err) { alert(err.message || "Failed to save warranty"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (w) => {
    if (!window.confirm(`Delete warranty "${w.name}"?`)) return;
    try { await warrantiesAPI.delete(w.id); await load(); }
    catch (err) { alert(err.message || "Failed to delete warranty"); }
  };

  const totalPages = Math.ceil(total / perPage);
  const showing = warranties.length === 0 ? "0 to 0 of 0" : `${(page-1)*perPage+1} to ${(page-1)*perPage+warranties.length} of ${total}`;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Warranties</h2>

      {error && <div style={{ background:"#fff3cd", border:"1px solid #ffc107", borderRadius:6, padding:"10px 16px", marginBottom:12, color:"#856404" }}>{error}</div>}

      <div style={{ background:"#fff", borderRadius:8, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h4 style={{ fontWeight:700, margin:0 }}>All Warranties</h4>
          <button onClick={openAdd} style={btn.green}>+ Add</button>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:13 }}>Show</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} style={inputSm}>
              {[10,25,50,100].map(n => <option key={n}>{n}</option>)}
            </select>
            <span style={{ fontSize:13 }}>entries</span>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
            <button onClick={() => exportCSV(warranties)} style={btn.csv}><span style={icon.csv}>CSV</span> Export CSV</button>
            <button onClick={() => exportExcel(warranties)} style={btn.xls}><span style={icon.xls}>XLS</span> Export Excel</button>
            <button onClick={() => printWarranties(warranties)} style={btn.outline}>🖨 Print</button>
            <button style={btn.outline}>⊞ Column visibility</button>
            <button onClick={() => exportPDF(warranties)} style={btn.pdf}><span style={icon.pdf}>PDF</span> Export PDF</button>
            <input placeholder="Search ..." value={searchInput} onChange={e => setSearchInput(e.target.value)} style={inputSearch} />
          </div>
        </div>

        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead>
            <tr style={{ background:"#f9fafb" }}>
              <th style={th}>Name</th>
              <th style={th}>Description</th>
              <th style={th}>Duration</th>
        <th style={{ ...th, textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign:"center", padding:28, color:"#888" }}>Loading...</td></tr>
            ) : warranties.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign:"center", padding:28, color:"#888" }}>No data available in table</td></tr>
            ) : (
              warranties.map((w, i) => (
                <tr key={w.id} style={{ borderBottom:"1px solid #f0f0f0", background: i%2===0?"#fff":"#fafafa" }}>
                  <td style={td}><strong>{w.name}</strong></td>
                  <td style={{ ...td, maxWidth:320, color:"#555" }}>{w.description}</td>
                  <td style={td}>
                    <span style={{ background:"#dcfce7", color:"#15803d", borderRadius:20, padding:"2px 12px", fontSize:12, fontWeight:600 }}>
                      {w.duration} {w.duration_type}
                    </span>
                  </td>
               <td style={{ ...td, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
                      <button onClick={() => openEdit(w)} title="View" style={btn.iconView}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button onClick={() => openEdit(w)} title="Edit" style={btn.iconEdit}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(w)} title="Delete" style={btn.iconDelete}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, fontSize:13, color:"#555" }}>
          <span>Showing {showing} entries</span>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page<=1}
              style={{ ...btn.page, opacity:page<=1?0.5:1, cursor:page<=1?"not-allowed":"pointer" }}>Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page>=totalPages}
              style={{ ...btn.page, opacity:page>=totalPages?0.5:1, cursor:page>=totalPages?"not-allowed":"pointer" }}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={modal.overlay}>
          <div style={modal.box}>
            <div style={modal.header}>
              <h5 style={{ fontWeight:700, fontSize:18, margin:0 }}>{editItem?"Edit":"Add"} Warranty</h5>
              <button onClick={() => setShowModal(false)} style={modal.close}>×</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <label style={modal.label}>Name: *</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name" style={modal.input}/>
              <label style={modal.label}>Description:</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" rows={4}
                style={{ ...modal.input, resize:"vertical" }}/>
              <label style={modal.label}>Duration: *</label>
              <div style={{ display:"flex", gap:8, marginTop:6 }}>
                <input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="Duration" type="number" min="1"
                  style={{ ...modal.input, flex:1, marginTop:0 }}/>
                <select value={form.durationUnit} onChange={e=>setForm({...form,durationUnit:e.target.value})}
                  style={{ ...modal.input, flex:1, marginTop:0 }}>
                  <option value="">Please Select</option>
                  {DURATION_UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div style={modal.footer}>
              <button onClick={handleSave} disabled={saving}
                style={{ ...btn.savePrimary, opacity:saving?0.7:1, cursor:saving?"not-allowed":"pointer" }}>
                {saving?"Saving...":"🖫 Save"}
              </button>
              <button onClick={() => setShowModal(false)} style={btn.closeDark}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btn = {
  green:       { background:"linear-gradient(135deg,#2e7d32,#43a047)", color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", fontSize:14, cursor:"pointer", fontWeight:600 },
  savePrimary: { background:"linear-gradient(135deg,#2e7d32,#43a047)", color:"#fff", border:"none", borderRadius:6, padding:"10px 28px", fontSize:14, cursor:"pointer", fontWeight:600 },
  closeDark:   { background:"#343a40", color:"#fff", border:"none", borderRadius:6, padding:"10px 24px", fontSize:14, cursor:"pointer" },
  csv:     { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 10px", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 },
  xls:     { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 10px", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 },
  pdf:     { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 10px", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 },
  outline: { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 10px", fontSize:12, cursor:"pointer" },
iconView:   { background:"transparent", border:"none", color:"#0ea5e9", cursor:"pointer", padding:0, display:"flex", alignItems:"center" },
  iconEdit:   { background:"transparent", border:"none", color:"#d97706", cursor:"pointer", padding:0, display:"flex", alignItems:"center" },
  iconDelete: { background:"transparent", border:"none", color:"#dc2626", cursor:"pointer", padding:0, display:"flex", alignItems:"center" },
  page:    { padding:"4px 14px", borderRadius:4, border:"1px solid #ccc", background:"#fff", cursor:"pointer" },
};
const icon = {
  csv: { background:"#16a34a", color:"#fff", borderRadius:3, padding:"1px 5px", fontSize:10, fontWeight:700 },
  xls: { background:"#2e7d32", color:"#fff", borderRadius:3, padding:"1px 5px", fontSize:10, fontWeight:700 },
  pdf: { background:"#dc2626", color:"#fff", borderRadius:3, padding:"1px 5px", fontSize:10, fontWeight:700 },
};
const th = { textAlign:"left", padding:"10px 12px", fontWeight:600, borderBottom:"2px solid #e5e7eb", color:"#374151" };
const td = { padding:"10px 12px", verticalAlign:"middle" };
const inputSm     = { padding:"4px 8px", borderRadius:4, border:"1px solid #ccc", fontSize:13 };
const inputSearch = { padding:"5px 10px", border:"1px solid #ccc", borderRadius:4, fontSize:13, width:160 };
const modal = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  box:     { background:"#fff", borderRadius:10, width:520, maxWidth:"95vw", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", fontFamily:"'Segoe UI', sans-serif" },
  header:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 28px", borderBottom:"1px solid #e5e7eb" },
  close:   { background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#888" },
  footer:  { display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 28px", borderTop:"1px solid #e5e7eb" },
  label:   { display:"block", fontWeight:600, fontSize:13, color:"#374151", marginBottom:6, marginTop:16 },
  input:   { width:"100%", padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:6, marginTop:6, marginBottom:4, fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:"inherit" },
};
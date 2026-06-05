import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ─── Shared style tokens (matching images 13 & 14) ─── */
const FONT = "'Nunito', 'Segoe UI', sans-serif";
const GREEN = "#1a6b3c";
const GREEN2 = "#28a745";
const BTN_GRADIENT = "linear-gradient(135deg,#1a6b3c 0%,#28a745 100%)";

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

  .ess-wrap { font-family:${FONT}; color:#222; }

  /* Tab bar */
  .ess-tabs { display:flex; gap:0; border-bottom:2px solid #e0e0e0; background:#fff; padding:0 8px; }
  .ess-tab  { padding:12px 20px; font-size:14px; font-weight:600; color:#555; cursor:pointer;
               border:none; background:none; border-bottom:3px solid transparent; margin-bottom:-2px;
               transition:.2s; font-family:${FONT}; }
  .ess-tab:hover { color:${GREEN}; }
  .ess-tab.active { color:${GREEN}; border-bottom-color:${GREEN}; }

  /* Page title */
  .ess-title { font-size:22px; font-weight:800; color:#1a1a1a; margin-bottom:4px; }
  .ess-sub   { font-size:13px; color:#888; margin-bottom:18px; }

  /* Card */
  .ess-card { background:#fff; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,.07);
               padding:20px; margin-bottom:20px; }

  /* Add button */
  .btn-add { background:${BTN_GRADIENT}; color:#fff; border:none; border-radius:8px;
              padding:10px 22px; font-size:14px; font-weight:700; cursor:pointer;
              display:inline-flex; align-items:center; gap:6px; font-family:${FONT};
              box-shadow:0 3px 10px rgba(26,107,60,.35); transition:.2s; }
  .btn-add:hover { opacity:.9; transform:translateY(-1px); }

  /* Save / Submit */
  .btn-save { background:${BTN_GRADIENT}; color:#fff; border:none; border-radius:8px;
               padding:10px 30px; font-size:14px; font-weight:700; cursor:pointer;
               font-family:${FONT}; box-shadow:0 3px 10px rgba(26,107,60,.35); transition:.2s; }
  .btn-save:hover { opacity:.9; }

  /* Cancel / Close */
  .btn-cancel { background:#343a40; color:#fff; border:none; border-radius:8px;
                 padding:10px 24px; font-size:14px; font-weight:700; cursor:pointer;
                 font-family:${FONT}; transition:.2s; }
  .btn-cancel:hover { opacity:.85; }

  /* Export toolbar */
  .export-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
  .exp-btn { border:1px solid #ddd; background:#fff; border-radius:6px; padding:7px 14px;
              font-size:13px; font-weight:600; cursor:pointer; display:inline-flex;
              align-items:center; gap:6px; font-family:${FONT}; transition:.15s; }
  .exp-btn:hover { background:#f5f5f5; }
  .exp-btn.csv   { color:#1a6b3c; border-color:#1a6b3c; }
  .exp-btn.excel { color:#217346; border-color:#217346; }
  .exp-btn.print { color:#555;    border-color:#999; }
  .exp-btn.col   { color:#6f42c1; border-color:#6f42c1; }
  .exp-btn.pdf   { color:#dc3545; border-color:#dc3545; }

  /* Table */
  .ess-table { width:100%; border-collapse:collapse; font-size:13.5px; }
  .ess-table th { background:#f8f9fa; color:#444; font-weight:700; padding:11px 14px;
                   text-align:left; border-bottom:2px solid #dee2e6; white-space:nowrap; }
  .ess-table td { padding:11px 14px; border-bottom:1px solid #f0f0f0; color:#333; }
  .ess-table tr:hover td { background:#f9fffe; }
  .no-data { text-align:center; color:#aaa; padding:30px; }

  /* Show entries */
  .show-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#555; margin-bottom:10px; }
  .show-row select { border:1px solid #ccc; border-radius:5px; padding:4px 8px;
                      font-family:${FONT}; font-size:13px; }

  /* Search */
  .tbl-search { border:1px solid #ccc; border-radius:6px; padding:7px 12px;
                  font-family:${FONT}; font-size:13px; width:180px; }

  /* Form fields */
  .form-group { margin-bottom:16px; }
  .form-label { font-size:13px; font-weight:700; color:#333; margin-bottom:5px; display:block; }
  .form-control { width:100%; border:1px solid #ccc; border-radius:7px; padding:9px 12px;
                   font-family:${FONT}; font-size:13.5px; box-sizing:border-box; }
  .form-control:focus { outline:none; border-color:${GREEN}; box-shadow:0 0 0 3px rgba(26,107,60,.12); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

  /* Filter bar */
  .filter-bar { background:#fff; border:1px solid #e0e0e0; border-radius:8px;
                  padding:16px; margin-bottom:16px; }
  .filter-title { font-size:14px; font-weight:700; color:${GREEN}; margin-bottom:12px;
                   display:flex; align-items:center; gap:6px; }

  /* Badges */
  .badge-normal   { background:#d4edda; color:#155724; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; }
  .badge-abnormal { background:#f8d7da; color:#721c24; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; }

  /* Calendar */
  .cal-wrap { background:#fff; border-radius:10px; padding:20px; }
  .cal-nav  { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
  .cal-nav button { border:1px solid #ccc; background:#fff; border-radius:6px; padding:5px 12px; cursor:pointer; font-family:${FONT}; }
  .cal-nav .today-btn { font-size:13px; }
  .cal-nav .view-btns button.active { background:#1a6b3c; color:#fff; border-color:#1a6b3c; }
  .cal-month { font-size:18px; font-weight:800; color:#1a6b3c; flex:1; text-align:center; }
  .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); }
  .cal-day-hdr { text-align:center; font-weight:700; font-size:13px; color:#555;
                  padding:8px 0; border:1px solid #e9ecef; background:#f8f9fa; }
  .cal-cell { min-height:90px; border:1px solid #e9ecef; padding:6px; font-size:13px; color:#444; vertical-align:top; }
  .cal-cell.today { background:#fffbe6; }
  .cal-cell.empty { background:#fafafa; color:#bbb; }

  /* Dropzone */
  .dropzone { border:2px dashed #ccc; border-radius:8px; padding:40px; text-align:center;
               color:#aaa; font-size:14px; cursor:pointer; }
  .dropzone:hover { border-color:${GREEN}; color:${GREEN}; }

  /* Modal overlay */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:1000;
                    display:flex; align-items:center; justify-content:center; }
  .modal-box { background:#fff; border-radius:12px; padding:30px; width:560px; max-width:95vw;
                max-height:90vh; overflow-y:auto; box-shadow:0 8px 40px rgba(0,0,0,.2); }
  .modal-title { font-size:18px; font-weight:800; color:#1a1a1a; margin-bottom:20px;
                  display:flex; justify-content:space-between; align-items:center; }
  .modal-close { background:none; border:none; font-size:20px; cursor:pointer; color:#999; }

  /* Messages */
  .msg-input-row { display:flex; gap:8px; padding:12px; border-top:1px solid #eee; background:#fff; }
  .msg-input { flex:1; border:1px solid #ccc; border-radius:8px; padding:10px 14px;
                font-family:${FONT}; font-size:14px; }
  .msg-send { background:${BTN_GRADIENT}; color:#fff; border:none; border-radius:8px;
               padding:10px 18px; font-size:14px; cursor:pointer; font-family:${FONT}; }
  .msg-area { min-height:300px; padding:20px; color:#aaa; font-size:14px; display:flex;
               align-items:center; justify-content:center; }

  /* Rich-text mock */
  .rich-toolbar { border:1px solid #ccc; border-radius:8px 8px 0 0; background:#f8f9fa;
                   padding:8px 12px; display:flex; gap:6px; flex-wrap:wrap; }
  .rich-btn { background:none; border:1px solid #ddd; border-radius:4px; padding:3px 8px;
               font-size:12px; cursor:pointer; font-family:${FONT}; }
  .rich-area { border:1px solid #ccc; border-top:none; border-radius:0 0 8px 8px;
                min-height:140px; padding:12px; font-family:${FONT}; font-size:14px;
                width:100%; box-sizing:border-box; resize:vertical; }

  /* Tbl toolbar row */
  .tbl-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px; }

  /* Add reminder modal submit */
  .btn-submit { background:linear-gradient(135deg,#4b2fc7 0%,#7c3aed 100%); color:#fff; border:none;
                 border-radius:8px; padding:10px 28px; font-size:14px; font-weight:700; cursor:pointer;
                 font-family:${FONT}; box-shadow:0 3px 10px rgba(75,47,199,.35); transition:.2s; }
  .btn-submit:hover { opacity:.9; }

  .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
`;

/* ─── Utility: inject styles once ─── */
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement("style");
  el.textContent = baseStyles;
  document.head.appendChild(el);
  stylesInjected = true;
}

/* ─── Export toolbar ─── */
function ExportBar({ data = [], columns = [], filename = "export" }) {
  const toCSV = () => {
    const header = columns.map(c => c.label).join(",");
    const rows = data.map(row => columns.map(c => `"${row[c.key] ?? ""}"`).join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${filename}.csv` });
    a.click();
  };
  const toPrint = () => {
    const w = window.open("", "_blank");
    const rows = data.map(row => `<tr>${columns.map(c => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`).join("");
    w.document.write(`<html><body><table border="1">${rows}</table></body></html>`);
    w.print();
  };
  const [showCols, setShowCols] = useState(false);
  const [visible, setVisible] = useState(() => Object.fromEntries(columns.map(c => [c.key, true])));

  return (
    <div className="export-bar">
      <button className="exp-btn csv" onClick={toCSV}>
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5z"/></svg>
        Export CSV
      </button>
      <button className="exp-btn excel" onClick={toCSV}>
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5z"/></svg>
        Export Excel
      </button>
      <button className="exp-btn print" onClick={toPrint}>
        🖨 Print
      </button>
      <div style={{ position: "relative" }}>
        <button className="exp-btn col" onClick={() => setShowCols(v => !v)}>
          ⠿ Column visibility
        </button>
        {showCols && (
          <div style={{ position:"absolute", top:"110%", left:0, background:"#fff", border:"1px solid #ddd",
                         borderRadius:8, padding:12, zIndex:100, minWidth:180, boxShadow:"0 4px 16px rgba(0,0,0,.12)" }}>
            {columns.map(c => (
              <label key={c.key} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, fontSize:13, cursor:"pointer" }}>
                <input type="checkbox" checked={visible[c.key]} onChange={() =>
                  setVisible(v => ({ ...v, [c.key]: !v[c.key] }))} />
                {c.label}
              </label>
            ))}
          </div>
        )}
      </div>
      <button className="exp-btn pdf" onClick={toPrint}>
        📄 Export PDF ▾
      </button>
    </div>
  );
}

/* ─── DataTable ─── */
function DataTable({ columns, data, emptyMsg = "No data available in table" }) {
  const [q, setQ] = useState("");
  const [show, setShow] = useState(25);
  const filtered = data.filter(row => columns.some(c => String(row[c.key] ?? "").toLowerCase().includes(q.toLowerCase())));
  const shown = filtered.slice(0, show);
  return (
    <>
      <div className="tbl-top">
        <div className="show-row">
          Show <select value={show} onChange={e => setShow(+e.target.value)}>
            {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
          </select> entries
        </div>
        <ExportBar data={data} columns={columns} />
        <input className="tbl-search" placeholder="Search ..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <table className="ess-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label} ↕</th>)}</tr>
        </thead>
        <tbody>
          {shown.length === 0
            ? <tr><td colSpan={columns.length} className="no-data">{emptyMsg}</td></tr>
            : shown.map((row, i) => (
                <tr key={i}>{columns.map(c => <td key={c.key}>{row[c.key]}</td>)}</tr>
              ))}
        </tbody>
      </table>
      <div style={{ fontSize:13, color:"#666", marginTop:8 }}>
        Showing 0 to {shown.length} of {filtered.length} entries
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
        <button className="exp-btn">Previous</button>
        <button className="exp-btn">Next</button>
      </div>
    </>
  );
}

/* ─── Filters block ─── */
function FilterBar({ filters }) {
  return (
    <div className="filter-bar">
      <div className="filter-title">▼ Filters</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
        {filters.map(f => (
          <div key={f.label}>
            <label className="form-label">{f.label}:</label>
            <select className="form-control" defaultValue="All">
              {(f.options || ["All"]).map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Rich text mock ─── */
function RichTextArea({ value, onChange }) {
  return (
    <>
      <div className="rich-toolbar">
        {["B", "I", "≡", "⊞", "⊟"].map(b => <button key={b} className="rich-btn">{b}</button>)}
        <span style={{ fontSize:11, color:"#aaa", marginLeft:"auto", alignSelf:"center" }}>POWERED BY TINY</span>
      </div>
      <textarea className="rich-area" value={value} onChange={e => onChange(e.target.value)} placeholder="Content..." />
    </>
  );
}

/* ═══════════════════════════════════════════════
   TO DO PAGE
═══════════════════════════════════════════════ */
const TODO_COLS = [
  { key:"addedOn", label:"Added On" },
  { key:"taskId",  label:"Task Id" },
  { key:"task",    label:"Task" },
  { key:"status",  label:"Status" },
  { key:"startDate", label:"Start Date" },
  { key:"endDate",   label:"End Date" },
  { key:"hours",     label:"Estimated Hours" },
  { key:"assignedBy",label:"Assigned By" },
  { key:"assignedTo",label:"Assigned To" },
  { key:"action",    label:"Action" },
];

function TodoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ task:"", assignedTo:"", priority:"", status:"", startDate:"", endDate:"", hours:"", desc:"" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Add To Do <button className="modal-close" onClick={onClose}>×</button></div>
        <div className="form-group">
          <label className="form-label">Task: *</label>
          <input className="form-control" value={form.task} onChange={set("task")} placeholder="Task name" />
        </div>
        <div className="form-group">
          <label className="form-label">Assigned To: *</label>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span>👤</span>
            <input className="form-control" value={form.assignedTo} onChange={set("assignedTo")} placeholder="Assigned to" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority:</label>
            <select className="form-control" value={form.priority} onChange={set("priority")}>
              <option value="">Please Select</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status:</label>
            <select className="form-control" value={form.status} onChange={set("status")}>
              <option value="">Please Select</option>
              <option>Not Started</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date: *</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span>📅</span>
              <input className="form-control" type="datetime-local" value={form.startDate} onChange={set("startDate")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">End Date:</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span>📅</span>
              <input className="form-control" type="datetime-local" value={form.endDate} onChange={set("endDate")} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Estimated Hours:</label>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span>🕐</span>
            <input className="form-control" type="number" value={form.hours} onChange={set("hours")} placeholder="Hours" style={{ width:200 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description:</label>
          <RichTextArea value={form.desc} onChange={v => setForm(f => ({ ...f, desc: v }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Upload Documents:</label>
          <div className="dropzone">Drop files here to upload</div>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
          <button className="btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function TodoPage() {
  const [showModal, setShowModal] = useState(false);
  const [todos, setTodos] = useState([]);
  const now = new Date().toLocaleDateString("en-IN");
  return (
    <div>
      {showModal && (
        <TodoModal
          onClose={() => setShowModal(false)}
          onSave={f => setTodos(t => [...t, {
            addedOn: now, taskId: `TASK-${t.length+1}`, task: f.task,
            status: f.status || "Not Started", startDate: f.startDate, endDate: f.endDate,
            hours: f.hours, assignedBy: "Admin", assignedTo: f.assignedTo, action: "✏️ 🗑️"
          }])}
        />
      )}
      <div className="page-header">
        <div>
          <div className="ess-title">📋 To Do List</div>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>＋ Add</button>
      </div>
      <FilterBar filters={[
        { label:"Assigned To", options:["All"] },
        { label:"Priority",    options:["All","Low","Medium","High"] },
        { label:"Status",      options:["All","Not Started","In Progress","Completed"] },
        { label:"Date Range",  options:["01/01/2026 - 12/31/2026"] },
      ]} />
      <div className="ess-card">
        <DataTable columns={TODO_COLS} data={todos} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DOCUMENT PAGE
═══════════════════════════════════════════════ */
const DOC_COLS = [
  { key:"name", label:"Name" },
  { key:"description", label:"Description" },
  { key:"uploadedDate", label:"Uploaded Date" },
  { key:"action", label:"Action" },
];

function DocumentPage() {
  const [showForm, setShowForm] = useState(false);
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const fileRef = useRef();

  const handleSubmit = () => {
    if (!file) return alert("Please choose a file");
    setDocs(d => [...d, {
      name: file.name, description: desc,
      uploadedDate: new Date().toLocaleDateString("en-IN"), action: "🗑️"
    }]);
    setFile(null); setDesc(""); setShowForm(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="ess-title">📁 All documents</div>
          <div className="ess-sub">Manage all your documents</div>
        </div>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>＋ Add</button>
      </div>
      {showForm && (
        <div className="ess-card">
          <div className="form-group">
            <label className="form-label">Document: *</label>
            <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png" ref={fileRef}
              onChange={e => setFile(e.target.files[0])} style={{ display:"none" }} />
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="exp-btn" onClick={() => fileRef.current.click()}>Choose File</button>
              <span style={{ fontSize:13, color:"#666" }}>{file ? file.name : "No file chosen"}</span>
            </div>
            <div style={{ fontSize:12, color:"#888", marginTop:4 }}>
              Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description:</label>
            <textarea className="form-control" rows={4} value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-save" onClick={handleSubmit}>Submit</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="ess-card">
        <DataTable columns={DOC_COLS} data={docs} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MEMOS PAGE
═══════════════════════════════════════════════ */
const MEMO_COLS = [
  { key:"heading", label:"Heading" },
  { key:"description", label:"Description" },
  { key:"createdDate", label:"Created Date" },
  { key:"action", label:"Action" },
];

function MemoModal({ onClose, onSave }) {
  const [heading, setHeading] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Add Memo <button className="modal-close" onClick={onClose}>×</button></div>
        <div className="form-group">
          <label className="form-label">Heading: *</label>
          <input className="form-control" value={heading} onChange={e => setHeading(e.target.value)} placeholder="Memo heading" />
        </div>
        <div className="form-group">
          <label className="form-label">Description:</label>
          <RichTextArea value={desc} onChange={setDesc} />
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
          <button className="btn-save" onClick={() => { if(heading){ onSave({heading,desc}); onClose(); } }}>Save</button>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function MemosPage() {
  const [showModal, setShowModal] = useState(false);
  const [memos, setMemos] = useState([]);
  return (
    <div>
      {showModal && (
        <MemoModal
          onClose={() => setShowModal(false)}
          onSave={m => setMemos(ms => [...ms, {
            heading: m.heading, description: m.desc,
            createdDate: new Date().toLocaleDateString("en-IN"), action:"✏️ 🗑️"
          }])}
        />
      )}
      <div className="page-header">
        <div>
          <div className="ess-title">📝 All memos</div>
          <div className="ess-sub">Manage all your memos</div>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>＋ Add</button>
      </div>
      <div className="ess-card">
        <DataTable columns={MEMO_COLS} data={memos} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REMINDERS PAGE
═══════════════════════════════════════════════ */
function ReminderModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:"", repeat:"One time", date:"", startTime:"", endTime:"" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:500 }}>
        <div className="modal-title">Add reminder <button className="modal-close" onClick={onClose}>×</button></div>
        <div className="form-group">
          <label className="form-label">Event Name: *</label>
          <input className="form-control" value={form.name} onChange={set("name")} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Repeat: *</label>
            <select className="form-control" value={form.repeat} onChange={set("repeat")}>
              <option>One time</option><option>Daily</option><option>Weekly</option><option>Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date: *</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span>📅</span>
              <input className="form-control" type="date" value={form.date} onChange={set("date")} />
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start time: *</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span>🕐</span>
              <input className="form-control" type="time" value={form.startTime} onChange={set("startTime")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">End time:</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span>🕐</span>
              <input className="form-control" type="time" value={form.endTime} onChange={set("endTime")} />
            </div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-submit" onClick={() => { onSave(form); onClose(); }}>Submit</button>
        </div>
      </div>
    </div>
  );
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function RemindersPage() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState("month");

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  const monthName = current.toLocaleString("default",{month:"long"});

  return (
    <div>
      {showModal && (
        <ReminderModal
          onClose={() => setShowModal(false)}
          onSave={r => setEvents(e => [...e, r])}
        />
      )}
      <div className="page-header">
        <div></div>
        <button className="btn-add" onClick={() => setShowModal(true)}>＋ Add reminder</button>
      </div>
      <div className="cal-wrap ess-card">
        <div className="cal-nav">
          <button onClick={() => setCurrent(new Date(year, month-1, 1))}>‹</button>
          <button onClick={() => setCurrent(new Date(year, month+1, 1))}>›</button>
          <button className="today-btn" onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))}>today</button>
          <div className="cal-month">{monthName} {year}</div>
          <div className="view-btns" style={{ display:"flex", gap:4 }}>
            {["month","week","day"].map(v =>
              <button key={v} className={view===v?"active":""} onClick={() => setView(v)}
                style={{ border:"1px solid #ccc", borderRadius:5, padding:"4px 12px", cursor:"pointer",
                          fontFamily:FONT, background: view===v ? GREEN : "#fff", color: view===v ? "#fff" : "#333" }}>
                {v}
              </button>
            )}
          </div>
        </div>
        <div className="cal-grid">
          {DAYS.map(d => <div key={d} className="cal-day-hdr">{d}</div>)}
          {cells.map((d, i) => (
            <div key={i} className={`cal-cell${d===null?" empty":""}${d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()?" today":""}`}>
              {d}
              {events.filter(e => {
                if (!e.date) return false;
                const ed = new Date(e.date);
                return ed.getDate()===d && ed.getMonth()===month && ed.getFullYear()===year;
              }).map((e,ei) => (
                <div key={ei} style={{ background:"#1a6b3c", color:"#fff", borderRadius:4, padding:"2px 5px", fontSize:11, marginTop:2 }}>
                  {e.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MESSAGES PAGE
═══════════════════════════════════════════════ */
function MessagesPage() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { text: input, time: new Date().toLocaleTimeString() }]);
    setInput("");
  };
  return (
    <div>
      <div className="ess-title" style={{ marginBottom:16 }}>💬 Messages</div>
      <div className="ess-card" style={{ padding:0, display:"flex", flexDirection:"column", minHeight:380 }}>
        <div className="msg-area">
          {msgs.length === 0
            ? "No messages yet"
            : msgs.map((m,i) => (
                <div key={i} style={{ alignSelf:"flex-end", background:GREEN, color:"#fff", borderRadius:10, padding:"8px 14px", marginBottom:6, maxWidth:"70%", fontSize:14 }}>
                  {m.text}
                  <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>{m.time}</div>
                </div>
              ))}
        </div>
        <div className="msg-input-row">
          <input className="msg-input" placeholder="Type message..." value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} />
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <select style={{ border:"1px solid #ccc", borderRadius:6, padding:"8px 12px", fontFamily:FONT, fontSize:13 }}>
              <option>Select location</option>
            </select>
            <button className="msg-send" onClick={send}>＋</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   KNOWLEDGE BASE PAGE
═══════════════════════════════════════════════ */
function KnowledgePage() {
  const [showForm, setShowForm] = useState(false);
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({ title:"", content:"", share:"Public" });

  const handleSave = () => {
    if (!form.title) return alert("Title is required");
    setArticles(a => [...a, { ...form, date: new Date().toLocaleDateString("en-IN") }]);
    setForm({ title:"", content:"", share:"Public" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="ess-title">📚 Knowledge Base</div>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>＋ Add</button>
      </div>
      {showForm && (
        <div className="ess-card">
          <div className="ess-title" style={{ fontSize:18, marginBottom:16 }}>Add knowledge base</div>
          <div className="form-group">
            <label className="form-label">Title: *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Title" />
          </div>
          <div className="form-group">
            <label className="form-label">Content:</label>
            <RichTextArea value={form.content} onChange={v => setForm(f => ({...f, content:v}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Share with:</label>
            <select className="form-control" value={form.share} onChange={e => setForm(f => ({...f, share:e.target.value}))} style={{ maxWidth:300 }}>
              <option>Public</option><option>Private</option><option>Team</option>
            </select>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn-save" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}
      {articles.length > 0 && (
        <div className="ess-card">
          {articles.map((a,i) => (
            <div key={i} style={{ borderBottom:"1px solid #f0f0f0", padding:"12px 0" }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{a.title}</div>
              <div style={{ fontSize:12, color:"#888", marginTop:3 }}>{a.share} · {a.date}</div>
            </div>
          ))}
        </div>
      )}
      {!showForm && articles.length === 0 && (
        <div className="ess-card" style={{ textAlign:"center", color:"#aaa", padding:40 }}>
          No knowledge base articles yet. Click + Add to create one.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SETTINGS PAGE
═══════════════════════════════════════════════ */
function EssentialsSettingsPage() {
  const [tab, setTab] = useState("Leave");
  const tabs = ["Leave","Payroll","Attendance","Sales Targets","Essentials"];
  const [leavePrefix, setLeavePrefix] = useState("");
  const [leaveInstructions, setLeaveInstructions] = useState("");

  return (
    <div>
      <div className="ess-title" style={{ marginBottom:16 }}>⚙️ Essentials and HRM Settings</div>
      <div className="ess-card" style={{ display:"flex", gap:0, padding:0, overflow:"hidden" }}>
        <div style={{ background:"#f8f9fa", borderRight:"1px solid #e0e0e0", minWidth:160 }}>
          {tabs.map(t => (
            <div key={t} onClick={() => setTab(t)}
              style={{ padding:"14px 20px", cursor:"pointer", fontWeight:700, fontSize:14,
                        background: t===tab ? GREEN : "transparent",
                        color: t===tab ? "#fff" : "#333",
                        transition:".2s", borderBottom:"1px solid #e9ecef" }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ flex:1, padding:24 }}>
          {tab === "Leave" && (
            <>
              <div className="form-group">
                <label className="form-label">Leave Reference No. prefix:</label>
                <input className="form-control" value={leavePrefix} onChange={e => setLeavePrefix(e.target.value)} placeholder="Leave Reference No. prefix" style={{ maxWidth:400 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Leave Instructions:</label>
                <RichTextArea value={leaveInstructions} onChange={setLeaveInstructions} />
              </div>
            </>
          )}
          {tab !== "Leave" && (
            <div style={{ color:"#aaa", fontSize:14, padding:20 }}>
              {tab} settings — configure as needed.
            </div>
          )}
          <div style={{ marginTop:20 }}>
            <button className="btn-save" style={{ background:"linear-gradient(135deg,#c0392b 0%,#e74c3c 100%)" }}>
              Update
            </button>
          </div>
        </div>
      </div>
      <div style={{ textAlign:"center", fontSize:12, color:"#aaa", marginTop:16 }}>
        Essentials and HRM module version - <strong>5.1</strong>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN ESSENTIALS COMPONENT
═══════════════════════════════════════════════ */
const TABS = ["To Do","Document","Memos","Reminders","Messages","Knowledge Base","Settings"];

export default function Essentials() {
  injectStyles();
  const [activeTab, setActiveTab] = useState("To Do");

  return (
    <div className="ess-wrap">
      {/* Tab navigation */}
      <div className="ess-tabs" style={{ marginBottom:20, flexWrap:"wrap" }}>
        <div className="ess-tab" style={{ display:"flex", alignItems:"center", gap:6, cursor:"default" }}>
          <span style={{ color:GREEN, fontWeight:800 }}>✅ Essentials</span>
        </div>
        {TABS.map(t => (
          <button key={t} className={`ess-tab${activeTab===t?" active":""}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Page content */}
      {activeTab === "To Do"        && <TodoPage />}
      {activeTab === "Document"     && <DocumentPage />}
      {activeTab === "Memos"        && <MemosPage />}
      {activeTab === "Reminders"    && <RemindersPage />}
      {activeTab === "Messages"     && <MessagesPage />}
      {activeTab === "Knowledge Base" && <KnowledgePage />}
      {activeTab === "Settings"     && <EssentialsSettingsPage />}
    </div>
  );
}
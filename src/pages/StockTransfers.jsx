import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page: { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#333" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" },
  card: { background: "#fff", borderRadius: "8px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", overflow: "visible" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e8e8e8" },
  cardTitle: { fontSize: "1rem", fontWeight: 600, color: "#333", margin: 0 },
  addBtn: { display: "inline-flex", alignItems: "center", gap: "6px", background: "#4f6ef7", color: "#fff", border: "none", borderRadius: "50px", padding: "9px 20px", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", cursor: "pointer" },
  backBtn: { background: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", padding: "7px 16px", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", cursor: "pointer" },
  toolbar: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", flexWrap: "wrap", borderBottom: "1px solid #f0f0f0" },
  showEntries: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#555" },
  select: { border: "1px solid #ccc", borderRadius: "4px", padding: "3px 6px", fontSize: "0.85rem", background: "#fff" },
  actionsRow: { display: "flex", gap: "6px", flexWrap: "wrap", flex: 1 },
  actionBtn: { border: "1px solid #d0d0d0", background: "#fff", borderRadius: "5px", padding: "5px 11px", fontSize: "0.8rem", cursor: "pointer", color: "#333", display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "inherit" },
  searchWrap: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#555" },
  searchInput: { border: "1px solid #ccc", borderRadius: "4px", padding: "5px 10px", fontSize: "0.85rem", width: "160px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: { background: "#f8f9fa", padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#444", borderBottom: "2px solid #e0e0e0", whiteSpace: "nowrap" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f0f0f0", color: "#555", verticalAlign: "middle" },
  emptyTd: { padding: "32px", textAlign: "center", color: "#999", borderBottom: "1px solid #f0f0f0" },
  pagination: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", fontSize: "0.84rem", color: "#666", borderTop: "1px solid #f0f0f0" },
  pager: { display: "flex", gap: "6px" },
  pageBtn: { border: "1px solid #ccc", background: "#fff", borderRadius: "4px", padding: "5px 12px", fontSize: "0.83rem", cursor: "pointer", color: "#444" },
  rowActions: { display: "flex", gap: "4px" },
  rowBtnView: { border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer", background: "#cce5ff" },
  rowBtnEdit: { border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer", background: "#fff3cd" },
  rowBtnDelete: { border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer", background: "#f8d7da" },
  // Column visibility dropdown
  colVisDropdown: { position: "relative", display: "inline-block" },
  colVisMenu: { position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid #ddd", borderRadius: "6px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 999, minWidth: "200px", padding: "8px 0" },
  colVisItem: { display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "0.84rem", color: "#333" },
  colVisItemHover: { background: "#f5f5f5" },
  // PDF dropdown
  pdfDropdown: { position: "relative", display: "inline-block" },
  pdfMenu: { position: "absolute", top: "110%", right: 0, background: "#fff", border: "1px solid #ddd", borderRadius: "6px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 999, minWidth: "160px", padding: "8px 0" },
  pdfMenuItem: { display: "block", padding: "8px 16px", cursor: "pointer", fontSize: "0.84rem", color: "#333", whiteSpace: "nowrap" },
  // Form
  form: { padding: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "0.84rem", fontWeight: 600, color: "#444" },
  req: { color: "#e74c3c" },
  input: { border: "1px solid #ccc", borderRadius: "5px", padding: "7px 10px", fontSize: "0.87rem", background: "#fff", color: "#333", width: "100%", boxSizing: "border-box" },
  inputSm: { border: "1px solid #ccc", borderRadius: "5px", padding: "5px 8px", fontSize: "0.83rem", background: "#fff", color: "#333", width: "100%", boxSizing: "border-box" },
  textarea: { border: "1px solid #ccc", borderRadius: "5px", padding: "7px 10px", fontSize: "0.87rem", background: "#fff", color: "#333", width: "100%", boxSizing: "border-box", resize: "vertical" },
  sectionTitle: { fontSize: "0.92rem", fontWeight: 700, color: "#2d6a4f", margin: "20px 0 10px", borderBottom: "2px solid #d4edda", paddingBottom: "5px" },
  formThSmall: { background: "#f8f9fa", padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#444", borderBottom: "2px solid #e0e0e0", whiteSpace: "nowrap" },
  formTdSmall: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#555", verticalAlign: "middle" },
  subtotal: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#2d6a4f", fontWeight: 600, verticalAlign: "middle" },
  addRowBtn: { background: "#f0faf4", border: "1px dashed #2d6a4f", color: "#2d6a4f", borderRadius: "5px", padding: "6px 16px", fontSize: "0.84rem", cursor: "pointer", marginBottom: "16px" },
  formFooter: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" },
  cancelBtn: { background: "#fff", border: "1px solid #ccc", color: "#555", borderRadius: "5px", padding: "8px 22px", fontSize: "0.87rem", cursor: "pointer" },
  submitBtn: { background: "#2d6a4f", color: "#fff", border: "none", borderRadius: "5px", padding: "8px 22px", fontSize: "0.87rem", fontWeight: 600, cursor: "pointer" },
};

function badgeStyle(status) {
  const base = { display: "inline-block", borderRadius: "20px", padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 };
  switch (status?.toLowerCase()) {
    case "completed":  return { ...base, background: "#d4edda", color: "#155724" };
    case "pending":    return { ...base, background: "#fff3cd", color: "#856404" };
    case "in transit": return { ...base, background: "#cce5ff", color: "#004085" };
    case "cancelled":  return { ...base, background: "#f8d7da", color: "#721c24" };
    default:           return { ...base, background: "#fff3cd", color: "#856404" };
  }
}

// ── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_DATA = [
  { id: 1, date: "04/06/2026", referenceNo: "ST-2026-001", locationFrom: "Main Warehouse", locationTo: "Branch A",  status: "Completed",  shippingCharges: "0.00",    totalAmount: "12500.00", additionalNotes: "-" },
  { id: 2, date: "03/06/2026", referenceNo: "ST-2026-002", locationFrom: "Branch A",        locationTo: "Branch B",  status: "Pending",    shippingCharges: "150.00",  totalAmount: "8200.00",  additionalNotes: "Fragile items" },
  { id: 3, date: "02/06/2026", referenceNo: "ST-2026-003", locationFrom: "Branch B",        locationTo: "Branch C",  status: "In Transit", shippingCharges: "200.00",  totalAmount: "5400.00",  additionalNotes: "-" },
  { id: 4, date: "01/06/2026", referenceNo: "ST-2026-004", locationFrom: "Main Warehouse",  locationTo: "Branch C",  status: "Cancelled",  shippingCharges: "0.00",    totalAmount: "3100.00",  additionalNotes: "Order cancelled" },
];

const ALL_COLUMNS = [
  { key: "date",            label: "Date" },
  { key: "referenceNo",     label: "Reference No" },
  { key: "locationFrom",    label: "Location (From)" },
  { key: "locationTo",      label: "Location (To)" },
  { key: "status",          label: "Status" },
  { key: "shippingCharges", label: "Shipping Charges" },
  { key: "totalAmount",     label: "Total Amount" },
  { key: "additionalNotes", label: "Additional Notes" },
];

const LOCATIONS = ["Main Warehouse", "Branch A", "Branch B", "Branch C"];

// ── Utility: trigger file download ──────────────────────────────────────────

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export CSV ───────────────────────────────────────────────────────────────

function exportCSV(rows, visibleCols) {
  const headers = visibleCols.map((c) => c.label).join(",");
  const body = rows
    .map((row) => visibleCols.map((c) => `"${row[c.key] ?? ""}"`).join(","))
    .join("\n");
  downloadFile(`${headers}\n${body}`, "stock_transfers.csv", "text/csv;charset=utf-8;");
}

// ── Export Excel (simple HTML table → .xls) ─────────────────────────────────

function exportExcel(rows, visibleCols) {
  const headerRow = visibleCols.map((c) => `<th>${c.label}</th>`).join("");
  const bodyRows = rows
    .map((row) => `<tr>${visibleCols.map((c) => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`)
    .join("");
  const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  downloadFile(html, "stock_transfers.xls", "application/vnd.ms-excel");
}

// ── Export PDF (using browser print with styled iframe) ──────────────────────

function exportPDF(rows, visibleCols, orientation = "portrait") {
  const headerRow = visibleCols.map((c) => `<th>${c.label}</th>`).join("");
  const bodyRows = rows
    .map((row) => `<tr>${visibleCols.map((c) => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Stock Transfers</title>
  <style>
    @page { size: A4 ${orientation}; margin: 20mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; }
    h2 { font-size: 14px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2d6a4f; color: #fff; padding: 7px 8px; text-align: left; font-size: 10px; }
    td { padding: 6px 8px; border-bottom: 1px solid #e0e0e0; font-size: 10px; }
    tr:nth-child(even) td { background: #f7fbf9; }
  </style>
</head>
<body>
  <h2>Stock Transfers — ${new Date().toLocaleDateString()}</h2>
  <table>
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}

// ── Print table ──────────────────────────────────────────────────────────────

function printTable(rows, visibleCols) {
  exportPDF(rows, visibleCols, "landscape");
}

// ── LIST STOCK TRANSFERS ────────────────────────────────────────────────────

export function ListStockTransfers() {
  const [entries, setEntries] = useState(25);
  const [search, setSearch]   = useState("");
  const [data]                = useState(DUMMY_DATA);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Column visibility
  const [visibleKeys, setVisibleKeys] = useState(ALL_COLUMNS.map((c) => c.key));
  const [showColMenu, setShowColMenu] = useState(false);
  const [hovColItem, setHovColItem]   = useState(null);

  // PDF dropdown
  const [showPdfMenu, setShowPdfMenu] = useState(false);
  const [hovPdfItem, setHovPdfItem]   = useState(null);

  const visibleCols = ALL_COLUMNS.filter((c) => visibleKeys.includes(c.key));

  const filtered = data.filter(
    (row) =>
      row.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
      row.locationFrom.toLowerCase().includes(search.toLowerCase()) ||
      row.locationTo.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCol = (key) => {
    setVisibleKeys((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((k) => k !== key) : prev // keep at least 1
        : [...prev, key]
    );
  };

  // Close dropdowns when clicking outside
  const closeMenus = () => { setShowColMenu(false); setShowPdfMenu(false); };

  return (
    <div style={S.page} onClick={closeMenus}>
      <h1 style={S.pageTitle}>Stock Transfers</h1>

      <div style={S.card}>
        {/* Header */}
        <div style={S.cardHeader}>
          <h2 style={S.cardTitle}>All Stock Transfers</h2>
          <Link to="/stock-transfers/create" style={S.addBtn}>
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> Add
          </Link>
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          {/* Show entries */}
          <div style={S.showEntries}>
            <span>Show</span>
            <select style={S.select} value={entries} onChange={(e) => setEntries(Number(e.target.value))}>
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>

          {/* Action buttons */}
          <div style={S.actionsRow}>
            {/* Export CSV */}
            <button
              style={S.actionBtn}
              onClick={(e) => { e.stopPropagation(); exportCSV(filtered, visibleCols); }}
              title="Download as CSV"
            >
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3C/svg%3E" alt="" />
              Export CSV
            </button>

            {/* Export Excel */}
            <button
              style={S.actionBtn}
              onClick={(e) => { e.stopPropagation(); exportExcel(filtered, visibleCols); }}
              title="Download as Excel"
            >
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23217346' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M3 9h18M9 3v18'/%3E%3C/svg%3E" alt="" />
              Export Excel
            </button>

            {/* Print */}
            <button
              style={S.actionBtn}
              onClick={(e) => { e.stopPropagation(); printTable(filtered, visibleCols); }}
              title="Print table"
            >
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpolyline points='6 9 6 2 18 2 18 9'/%3E%3Cpath d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/%3E%3Crect x='6' y='14' width='12' height='8'/%3E%3C/svg%3E" alt="" />
              Print
            </button>

            {/* Column Visibility */}
            <div style={S.colVisDropdown} onClick={(e) => e.stopPropagation()}>
              <button
                style={{
                  ...S.actionBtn,
                  background: showColMenu ? "#f0f4f1" : "#fff",
                  borderColor: showColMenu ? "#2d6a4f" : "#d0d0d0",
                }}
                onClick={() => { setShowColMenu((v) => !v); setShowPdfMenu(false); }}
                title="Show/hide columns"
              >
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z'/%3E%3C/svg%3E" alt="" />
                Column visibility
              </button>
              {showColMenu && (
                <div style={S.colVisMenu}>
                  {ALL_COLUMNS.map((col) => {
                    const checked = visibleKeys.includes(col.key);
                    return (
                      <div
                        key={col.key}
                        style={{
                          ...S.colVisItem,
                          ...(hovColItem === col.key ? S.colVisItemHover : {}),
                          fontWeight: checked ? 600 : 400,
                        }}
                        onClick={() => toggleCol(col.key)}
                        onMouseEnter={() => setHovColItem(col.key)}
                        onMouseLeave={() => setHovColItem(null)}
                      >
                        <span style={{
                          width: "16px", height: "16px", border: "1px solid #ccc",
                          borderRadius: "3px", background: checked ? "#2d6a4f" : "#fff",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {checked && <span style={{ color: "#fff", fontSize: "11px", lineHeight: 1 }}>✓</span>}
                        </span>
                        {col.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Export PDF dropdown */}
            <div style={S.pdfDropdown} onClick={(e) => e.stopPropagation()}>
              <button
                style={{
                  ...S.actionBtn,
                  background: showPdfMenu ? "#f0f4f1" : "#fff",
                  borderColor: showPdfMenu ? "#2d6a4f" : "#d0d0d0",
                }}
                onClick={() => { setShowPdfMenu((v) => !v); setShowColMenu(false); }}
                title="Export as PDF"
              >
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c0392b' stroke-width='2'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cline x1='9' y1='13' x2='15' y2='13'/%3E%3Cline x1='9' y1='17' x2='15' y2='17'/%3E%3C/svg%3E" alt="" />
                Export PDF ▾
              </button>
              {showPdfMenu && (
                <div style={S.pdfMenu}>
                  {[
                    { label: "📄 Portrait (A4)",   orientation: "portrait" },
                    { label: "🖨️ Landscape (A4)",  orientation: "landscape" },
                  ].map((opt) => (
                    <div
                      key={opt.orientation}
                      style={{
                        ...S.pdfMenuItem,
                        background: hovPdfItem === opt.orientation ? "#f5f5f5" : "transparent",
                      }}
                      onClick={() => { exportPDF(filtered, visibleCols, opt.orientation); setShowPdfMenu(false); }}
                      onMouseEnter={() => setHovPdfItem(opt.orientation)}
                      onMouseLeave={() => setHovPdfItem(null)}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div style={S.searchWrap}>
            <span>Search:</span>
            <input
              style={S.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ..."
            />
          </div>
        </div>

        {/* Table */}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {visibleCols.map((col) => (
                  <th key={col.key} style={S.th}>
                    {col.label} <span style={{ opacity: 0.45, fontSize: "0.73rem" }}>⇅</span>
                  </th>
                ))}
                <th style={S.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 1} style={S.emptyTd}>
                    No data available in table
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    style={{ background: hoveredRow === row.id ? "#f7fbf9" : "transparent" }}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {visibleCols.map((col) => (
                      <td key={col.key} style={S.td}>
                        {col.key === "status" ? (
                          <span style={badgeStyle(row[col.key])}>{row[col.key]}</span>
                        ) : col.key === "shippingCharges" || col.key === "totalAmount" ? (
                          `₹${row[col.key]}`
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                    <td style={S.td}>
                      <div style={S.rowActions}>
                        <button style={S.rowBtnView} title="View">👁</button>
                        <button style={S.rowBtnEdit} title="Edit">✏️</button>
                        <button style={S.rowBtnDelete} title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={S.pagination}>
          <span>
            {filtered.length === 0
              ? "Showing 0 to 0 of 0 entries"
              : `Showing 1 to ${Math.min(entries, filtered.length)} of ${filtered.length} entries`}
          </span>
          <div style={S.pager}>
            <button style={S.pageBtn}>Previous</button>
            <button style={S.pageBtn}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADD STOCK TRANSFER ──────────────────────────────────────────────────────

export function AddStockTransfer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    referenceNo: `ST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    locationFrom: "",
    locationTo: "",
    shippingCharges: "",
    additionalNotes: "",
    status: "Pending",
  });
  const [products, setProducts] = useState([
    { id: 1, name: "", quantity: 1, unitCost: "", subtotal: "" },
  ]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const updateProduct = (idx, field, val) => {
    setProducts((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        const updated = { ...p, [field]: val };
        if (field === "quantity" || field === "unitCost") {
          const qty  = field === "quantity"  ? Number(val) : Number(p.quantity);
          const cost = field === "unitCost"  ? Number(val) : Number(p.unitCost);
          updated.subtotal = qty && cost ? `₹${(qty * cost).toFixed(2)}` : "";
        }
        return updated;
      })
    );
  };

  const addRow    = () => setProducts((prev) => [...prev, { id: Date.now(), name: "", quantity: 1, unitCost: "", subtotal: "" }]);
  const removeRow = (idx) => setProducts((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Stock Transfer saved successfully!");
    navigate("/stock-transfers");
  };

  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Stock Transfers</h1>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h2 style={S.cardTitle}>Add Stock Transfer</h2>
          <Link to="/stock-transfers" style={S.backBtn}>← Back to List</Link>
        </div>

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.formGrid}>
            <div style={S.formGroup}>
              <label style={S.label}>Date <span style={S.req}>*</span></label>
              <input type="date" style={S.input} value={form.date} onChange={(e) => set("date", e.target.value)} required />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Reference No</label>
              <input type="text" style={S.input} value={form.referenceNo} onChange={(e) => set("referenceNo", e.target.value)} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Status <span style={S.req}>*</span></label>
              <select style={S.input} value={form.status} onChange={(e) => set("status", e.target.value)} required>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="In Transit">In Transit</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={S.formGrid}>
            <div style={S.formGroup}>
              <label style={S.label}>Location (From) <span style={S.req}>*</span></label>
              <select style={S.input} value={form.locationFrom} onChange={(e) => set("locationFrom", e.target.value)} required>
                <option value="">-- Select location --</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Location (To) <span style={S.req}>*</span></label>
              <select style={S.input} value={form.locationTo} onChange={(e) => set("locationTo", e.target.value)} required>
                <option value="">-- Select location --</option>
                {LOCATIONS.filter((l) => l !== form.locationFrom).map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Shipping Charges</label>
              <input type="number" style={S.input} placeholder="0.00" value={form.shippingCharges} onChange={(e) => set("shippingCharges", e.target.value)} min="0" step="0.01" />
            </div>
          </div>

          <div style={S.sectionTitle}>Products</div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {["Product Name *", "Quantity *", "Unit Cost", "Subtotal", "Action"].map((h) => (
                    <th key={h} style={S.formThSmall}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={S.formTdSmall}>
                      <input style={S.inputSm} placeholder="Type to search product..." value={p.name} onChange={(e) => updateProduct(idx, "name", e.target.value)} required />
                    </td>
                    <td style={S.formTdSmall}>
                      <input type="number" style={S.inputSm} min="1" value={p.quantity} onChange={(e) => updateProduct(idx, "quantity", e.target.value)} required />
                    </td>
                    <td style={S.formTdSmall}>
                      <input type="number" style={S.inputSm} placeholder="0.00" min="0" step="0.01" value={p.unitCost} onChange={(e) => updateProduct(idx, "unitCost", e.target.value)} />
                    </td>
                    <td style={S.subtotal}>{p.subtotal || "-"}</td>
                    <td style={S.formTdSmall}>
                      <button type="button" style={{ ...S.rowBtnDelete, opacity: products.length === 1 ? 0.3 : 1 }} onClick={() => removeRow(idx)} disabled={products.length === 1}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" style={S.addRowBtn} onClick={addRow}>+ Add Product Row</button>

          <div style={S.formGroup}>
            <label style={S.label}>Additional Notes</label>
            <textarea style={S.textarea} rows={3} placeholder="Enter any additional notes..." value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} />
          </div>

          <div style={S.formFooter}>
            <button type="button" style={S.cancelBtn} onClick={() => navigate("/stock-transfers")}>Cancel</button>
            <button type="submit" style={S.submitBtn}>Save Stock Transfer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
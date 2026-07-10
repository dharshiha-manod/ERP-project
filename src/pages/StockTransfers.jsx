import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// NEW
import {
  fetchAllStockTransfers,
  fetchStockTransferById,
  createStockTransfer,
  updateStockTransfer,
  deleteStockTransfer,
  fetchProductsForTransfer,
  fetchStockTransferStats,
} from "../api/stockTransfersAPI";

// ── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page: { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#333" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" },
  card: { background: "#fff", borderRadius: "8px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", overflow: "visible" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e8e8e8" },
  cardTitle: { fontSize: "1rem", fontWeight: 600, color: "#333", margin: 0 },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "linear-gradient(135deg, #2e7d32, #43a047)",
    color: "#fff", border: "none", borderRadius: "50px", padding: "9px 22px",
    fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", cursor: "pointer",
    boxShadow: "0 2px 8px rgba(46,125,50,0.35)", transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "#fff", color: "#2d6a4f", border: "1.5px solid #2d6a4f",
    borderRadius: "6px", padding: "8px 18px", fontSize: "0.85rem", fontWeight: 600,
    textDecoration: "none", cursor: "pointer", transition: "all 0.15s ease",
  },
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
  pageBtnDisabled: { opacity: 0.45, cursor: "not-allowed" },
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
  submitBtn: {
    background: "linear-gradient(135deg, #2e7d32, #43a047)", color: "#fff", border: "none",
    borderRadius: "5px", padding: "8px 22px", fontSize: "0.87rem", fontWeight: 600, cursor: "pointer",
    boxShadow: "0 2px 8px rgba(46,125,50,0.3)",
  },
  errorBanner: { background: "#f8d7da", color: "#721c24", padding: "10px 16px", borderRadius: "6px", marginBottom: "14px", fontSize: "0.85rem" },
  loadingWrap: { padding: "40px", textAlign: "center", color: "#888" },
  // View modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: "#fff", borderRadius: "10px", width: "560px", maxWidth: "92vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.25)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #eee" },
  modalCloseBtn: { border: "none", background: "transparent", fontSize: "1.3rem", cursor: "pointer", color: "#888", lineHeight: 1 },
  modalBody: { padding: "20px" },
 modalRow: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f3f3", fontSize: "0.88rem" },
  modalLabel: { color: "#777", fontWeight: 600 },
  modalValue: { color: "#222" },
  // KPI cards
  // KPI cards — flat, professional, all same white background
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "18px" },
  kpiCard: {
    background: "#fff", borderRadius: "10px", padding: "16px 18px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)", borderLeft: "4px solid #ccc",
    cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
    userSelect: "none",
  },
  kpiCardStatic: {
    background: "#fff", borderRadius: "10px", padding: "16px 18px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)", borderLeft: "4px solid #ccc",
  },
  kpiLabel: { fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#888", marginBottom: "6px" },
  kpiValue: { fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" },
  // Filter bar
  filterBar: { display: "flex", alignItems: "flex-end", gap: "14px", padding: "14px 20px", flexWrap: "wrap", borderBottom: "1px solid #f0f0f0", background: "#fafcfb" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  filterLabel: { fontSize: "0.75rem", fontWeight: 600, color: "#666" },
  filterInput: { border: "1px solid #ccc", borderRadius: "5px", padding: "6px 9px", fontSize: "0.83rem", background: "#fff" },
  clearFilterBtn: { border: "none", background: "transparent", color: "#c0392b", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", padding: "6px 4px" },
  // Distinct export buttons
  exportBtnCSV:   { border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", color: "#fff", background: "linear-gradient(135deg,#0d9488,#14b8a6)", display: "inline-flex", alignItems: "center", gap: "6px" },
  exportBtnExcel: { border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", color: "#fff", background: "linear-gradient(135deg,#15803d,#22c55e)", display: "inline-flex", alignItems: "center", gap: "6px" },
  exportBtnPrint: { border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", color: "#fff", background: "linear-gradient(135deg,#334155,#475569)", display: "inline-flex", alignItems: "center", gap: "6px" },
  exportBtnPDF:   { border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", color: "#fff", background: "linear-gradient(135deg,#b91c1c,#dc2626)", display: "inline-flex", alignItems: "center", gap: "6px" },
};
// Global anchor-color rules elsewhere in the app can override inline
// `color` on <Link> (which renders an <a>) with !important, making the
// Add/Back buttons hard to read. This scoped override wins that fight.
const BTN_COLOR_OVERRIDE = `
  .st-add-btn, .st-add-btn:visited, .st-add-btn:hover, .st-add-btn:focus {
    color: #ffffff !important;
  }
  .st-back-btn, .st-back-btn:visited, .st-back-btn:focus {
    color: #2d6a4f !important;
  }
  .st-back-btn:hover {
    color: #ffffff !important;
  }
`;

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

const ALL_COLUMNS = [
  { key: "transfer_date",   label: "Date" },
  { key: "transfer_number", label: "Reference No" },
  { key: "location_from",   label: "Location (From)" },
  { key: "location_to",     label: "Location (To)" },
  { key: "status",          label: "Status" },
  { key: "total_amount",    label: "Total Amount" },
  { key: "notes",           label: "Additional Notes" },
];

// Locations are not yet backed by a dedicated table in the database,
// so this is a static list. Update here if/when locations become dynamic.
const LOCATIONS = ["Main Warehouse", "Branch A", "Branch B", "Branch C"];

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-GB");
}

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

function exportCSV(rows, visibleCols) {
  const headers = visibleCols.map((c) => c.label).join(",");
  const body = rows
    .map((row) => visibleCols.map((c) => `"${row[c.key] ?? ""}"`).join(","))
    .join("\n");
  downloadFile(`${headers}\n${body}`, "stock_transfers.csv", "text/csv;charset=utf-8;");
}

function exportExcel(rows, visibleCols) {
  const headerRow = visibleCols.map((c) => `<th>${c.label}</th>`).join("");
  const bodyRows = rows
    .map((row) => `<tr>${visibleCols.map((c) => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`)
    .join("");
  const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  downloadFile(html, "stock_transfers.xls", "application/vnd.ms-excel");
}

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

function printTable(rows, visibleCols) {
  exportPDF(rows, visibleCols, "landscape");
}

// ── VIEW MODAL ───────────────────────────────────────────────────────────────

function ViewStockTransferModal({ id, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchStockTransferById(id)
      .then((res) => { if (active) setData(res); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#1a1a1a" }}>Stock Transfer Details</h3>
          <button style={S.modalCloseBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>
          {loading && <div style={S.loadingWrap}>Loading...</div>}
          {error && <div style={S.errorBanner}>{error}</div>}
          {data && (
            <>
              <div style={S.modalRow}><span style={S.modalLabel}>Reference No</span><span style={S.modalValue}>{data.transfer_number}</span></div>
              <div style={S.modalRow}><span style={S.modalLabel}>Date</span><span style={S.modalValue}>{formatDate(data.transfer_date)}</span></div>
              <div style={S.modalRow}><span style={S.modalLabel}>Location (From)</span><span style={S.modalValue}>{data.location_from}</span></div>
              <div style={S.modalRow}><span style={S.modalLabel}>Location (To)</span><span style={S.modalValue}>{data.location_to}</span></div>
              <div style={S.modalRow}><span style={S.modalLabel}>Status</span><span style={badgeStyle(data.status)}>{data.status}</span></div>
              <div style={S.modalRow}><span style={S.modalLabel}>Notes</span><span style={S.modalValue}>{data.notes || "-"}</span></div>

              <div style={S.sectionTitle}>Products</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.formThSmall}>Product</th>
                    <th style={S.formThSmall}>SKU</th>
                    <th style={S.formThSmall}>Qty</th>
                    <th style={S.formThSmall}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items || []).map((it) => (
                    <tr key={it.id}>
                      <td style={S.formTdSmall}>{it.product_name || "-"}</td>
                      <td style={S.formTdSmall}>{it.sku || "-"}</td>
                      <td style={S.formTdSmall}>{it.quantity}</td>
                      <td style={S.subtotal}>₹{Number(it.subtotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "right", marginTop: 10, fontWeight: 700, color: "#2d6a4f" }}>
                Total: ₹{Number(data.total_amount || 0).toFixed(2)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LIST STOCK TRANSFERS ────────────────────────────────────────────────────
export function ListStockTransfers() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(25);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");

  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // KPI stats
  const [stats, setStats]               = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [hoveredRow, setHoveredRow] = useState(null);
  const [viewingId, setViewingId]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Column visibility
  const [visibleKeys, setVisibleKeys] = useState(ALL_COLUMNS.map((c) => c.key));
  const [showColMenu, setShowColMenu] = useState(false);
  const [hovColItem, setHovColItem]   = useState(null);

  // PDF dropdown
  const [showPdfMenu, setShowPdfMenu] = useState(false);
  const [hovPdfItem, setHovPdfItem]   = useState(null);

  const visibleCols = ALL_COLUMNS.filter((c) => visibleKeys.includes(c.key));

  const loadData = useCallback(() => {
    setLoading(true);
    setError("");
    fetchAllStockTransfers({
      page, limit: entries, search,
      status: statusFilter, date_from: dateFrom, date_to: dateTo,
    })
      .then((res) => {
        setRows(res.stockTransfers || []);
        setTotal(res.total || 0);
      })
      .catch((err) => setError(err.message || "Failed to load stock transfers"))
      .finally(() => setLoading(false));
  }, [page, entries, search, statusFilter, dateFrom, dateTo]);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    fetchStockTransferStats()
      .then((s) => setStats(s))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const toggleCol = (key) => {
    setVisibleKeys((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((k) => k !== key) : prev
        : [...prev, key]
    );
  };

  const closeMenus = () => { setShowColMenu(false); setShowPdfMenu(false); };
const clearFilters = () => {
    setStatusFilter(""); setDateFrom(""); setDateTo(""); setSearch(""); setPage(1);
  };

  // Clicking a KPI card filters the table by that status.
  // Clicking the same one again (or "Total Transfers") clears the status filter.
  const handleKpiClick = (statusValue) => {
    setStatusFilter((prev) => (prev === statusValue ? "" : statusValue));
    setPage(1);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete stock transfer "${row.transfer_number}"? This cannot be undone.`)) return;
    try {
      setDeletingId(row.id);
      await deleteStockTransfer(row.id);
      loadData();
      loadStats();
    } catch (err) {
      alert(err.message || "Failed to delete stock transfer");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / entries));
  const fmtMoney = (v) => `₹${Number(v || 0).toFixed(2)}`;

  return (
    <div style={S.page} onClick={closeMenus}>
      <style>{BTN_COLOR_OVERRIDE}</style>
      <h1 style={S.pageTitle}>Stock Transfers</h1>
{/* KPI Cards — click a status card to filter the table by it */}
      <div style={S.kpiGrid}>
        <div
          style={{
            ...S.kpiCard,
            borderLeftColor: "#2e7d32",
            ...(statusFilter === "" ? { background: "#f0faf4", boxShadow: "0 0 0 2px #2e7d32 inset" } : {}),
          }}
          onClick={() => handleKpiClick("")}
          title="Show all transfers"
        >
          <div style={{ ...S.kpiLabel, color: "#2e7d32" }}>Total Transfers</div>
          <div style={S.kpiValue}>{statsLoading ? "…" : (stats?.total_transfers ?? 0)}</div>
        </div>

        <div style={{ ...S.kpiCardStatic, borderLeftColor: "#0d9488" }} title="Sum of all transfer values">
          <div style={{ ...S.kpiLabel, color: "#0d9488" }}>Total Value</div>
          <div style={S.kpiValue}>{statsLoading ? "…" : fmtMoney(stats?.total_value)}</div>
        </div>

        <div
          style={{
            ...S.kpiCard,
            borderLeftColor: "#856404",
            ...(statusFilter === "Pending" ? { background: "#fffaf0", boxShadow: "0 0 0 2px #856404 inset" } : {}),
          }}
          onClick={() => handleKpiClick("Pending")}
          title="Filter by Pending"
        >
          <div style={{ ...S.kpiLabel, color: "#856404" }}>Pending</div>
          <div style={S.kpiValue}>{statsLoading ? "…" : (stats?.pending_count ?? 0)}</div>
        </div>

        <div
          style={{
            ...S.kpiCard,
            borderLeftColor: "#004085",
            ...(statusFilter === "In Transit" ? { background: "#f0f7ff", boxShadow: "0 0 0 2px #004085 inset" } : {}),
          }}
          onClick={() => handleKpiClick("In Transit")}
          title="Filter by In Transit"
        >
          <div style={{ ...S.kpiLabel, color: "#004085" }}>In Transit</div>
          <div style={S.kpiValue}>{statsLoading ? "…" : (stats?.in_transit_count ?? 0)}</div>
        </div>

        <div
          style={{
            ...S.kpiCard,
            borderLeftColor: "#155724",
            ...(statusFilter === "Completed" ? { background: "#f0faf4", boxShadow: "0 0 0 2px #155724 inset" } : {}),
          }}
          onClick={() => handleKpiClick("Completed")}
          title="Filter by Completed"
        >
          <div style={{ ...S.kpiLabel, color: "#155724" }}>Completed</div>
          <div style={S.kpiValue}>{statsLoading ? "…" : (stats?.completed_count ?? 0)}</div>
        </div>

        <div
          style={{
            ...S.kpiCard,
            borderLeftColor: "#721c24",
            ...(statusFilter === "Cancelled" ? { background: "#fdf3f4", boxShadow: "0 0 0 2px #721c24 inset" } : {}),
          }}
          onClick={() => handleKpiClick("Cancelled")}
          title="Filter by Cancelled"
        >
          <div style={{ ...S.kpiLabel, color: "#721c24" }}>Cancelled</div>
          <div style={S.kpiValue}>{statsLoading ? "…" : (stats?.cancelled_count ?? 0)}</div>
        </div>
      </div>

      <div style={S.card}>
        {/* Header */}
        <div style={S.cardHeader}>
          <h2 style={S.cardTitle}>All Stock Transfers</h2>
          <Link
            to="/stock-transfers/create"
            className="st-add-btn"
            style={S.addBtn}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(46,125,50,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(46,125,50,0.35)"; }}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> Add
          </Link>
        </div>

        {/* Filter bar */}
        <div style={S.filterBar} onClick={(e) => e.stopPropagation()}>
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Status</span>
            <select
              style={S.filterInput}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Date From</span>
            <input type="date" style={S.filterInput} value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Date To</span>
            <input type="date" style={S.filterInput} value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </div>
          {(statusFilter || dateFrom || dateTo || search) && (
            <button style={S.clearFilterBtn} onClick={clearFilters}>✕ Clear filters</button>
          )}
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          <div style={S.showEntries}>
            <span>Show</span>
            <select style={S.select} value={entries} onChange={(e) => { setEntries(Number(e.target.value)); setPage(1); }}>
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>

          <div style={S.actionsRow}>
            <button style={S.exportBtnCSV} onClick={(e) => { e.stopPropagation(); exportCSV(rows, visibleCols); }} title="Download as CSV">
              📄 CSV
            </button>

            <button style={S.exportBtnExcel} onClick={(e) => { e.stopPropagation(); exportExcel(rows, visibleCols); }} title="Download as Excel">
              📊 Excel
            </button>

            <button style={S.exportBtnPrint} onClick={(e) => { e.stopPropagation(); printTable(rows, visibleCols); }} title="Print table">
              🖨️ Print
            </button>

            <div style={S.colVisDropdown} onClick={(e) => e.stopPropagation()}>
              <button
                style={{ ...S.actionBtn, background: showColMenu ? "#f0f4f1" : "#fff", borderColor: showColMenu ? "#2d6a4f" : "#d0d0d0" }}
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
                        style={{ ...S.colVisItem, ...(hovColItem === col.key ? S.colVisItemHover : {}), fontWeight: checked ? 600 : 400 }}
                        onClick={() => toggleCol(col.key)}
                        onMouseEnter={() => setHovColItem(col.key)}
                        onMouseLeave={() => setHovColItem(null)}
                      >
                        <span style={{ width: "16px", height: "16px", border: "1px solid #ccc", borderRadius: "3px", background: checked ? "#2d6a4f" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {checked && <span style={{ color: "#fff", fontSize: "11px", lineHeight: 1 }}>✓</span>}
                        </span>
                        {col.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={S.pdfDropdown} onClick={(e) => e.stopPropagation()}>
              <button
                style={S.exportBtnPDF}
                onClick={() => { setShowPdfMenu((v) => !v); setShowColMenu(false); }}
                title="Export as PDF"
              >
                📕 PDF ▾
              </button>
              {showPdfMenu && (
                <div style={S.pdfMenu}>
                  {[
                    { label: "📄 Portrait (A4)",  orientation: "portrait" },
                    { label: "🖨️ Landscape (A4)", orientation: "landscape" },
                  ].map((opt) => (
                    <div
                      key={opt.orientation}
                      style={{ ...S.pdfMenuItem, background: hovPdfItem === opt.orientation ? "#f5f5f5" : "transparent" }}
                      onClick={() => { exportPDF(rows, visibleCols, opt.orientation); setShowPdfMenu(false); }}
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

          <div style={S.searchWrap}>
            <span>Search:</span>
            <input
              style={S.searchInput}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ..."
            />
          </div>
        </div>

        {error && <div style={{ ...S.errorBanner, margin: "14px 20px 0" }}>{error}</div>}

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
              {loading ? (
                <tr><td colSpan={visibleCols.length + 1} style={S.emptyTd}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={visibleCols.length + 1} style={S.emptyTd}>No data available in table</td></tr>
              ) : (
                rows.map((row) => (
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
                        ) : col.key === "total_amount" ? (
                          fmtMoney(row[col.key])
                        ) : col.key === "transfer_date" ? (
                          formatDate(row[col.key])
                        ) : col.key === "notes" ? (
                          row[col.key] || "-"
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                    <td style={S.td}>
                      <div style={S.rowActions}>
                        <button style={S.rowBtnView} title="View" onClick={() => setViewingId(row.id)}>👁</button>
                        <button style={S.rowBtnEdit} title="Edit" onClick={() => navigate(`/stock-transfers/${row.id}/edit`)}>✏️</button>
                        <button
                          style={{ ...S.rowBtnDelete, opacity: deletingId === row.id ? 0.5 : 1 }}
                          title="Delete"
                          disabled={deletingId === row.id}
                          onClick={() => handleDelete(row)}
                        >
                          🗑
                        </button>
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
            {total === 0
              ? "Showing 0 to 0 of 0 entries"
              : `Showing ${(page - 1) * entries + 1} to ${Math.min(page * entries, total)} of ${total} entries`}
          </span>
          <div style={S.pager}>
            <button
              style={{ ...S.pageBtn, ...(page <= 1 ? S.pageBtnDisabled : {}) }}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              style={{ ...S.pageBtn, ...(page >= totalPages ? S.pageBtnDisabled : {}) }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {viewingId && <ViewStockTransferModal id={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  );
}
// ── ADD / EDIT STOCK TRANSFER (shared form) ─────────────────────────────────

function StockTransferForm({ mode }) {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = mode === "edit";

  const [form, setForm] = useState({
    transfer_date: new Date().toISOString().split("T")[0],
    transfer_number: "",
    location_from: "",
    location_to: "",
    notes: "",
    status: "Pending",
  });
  const [products, setProducts] = useState([
    { rowId: 1, product_id: "", quantity: 1, cost_price: 0 },
  ]);

  const [productOptions, setProductOptions] = useState([]);
  const [loading, setLoading]   = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  // Load product dropdown options
  useEffect(() => {
    fetchProductsForTransfer()
      .then((list) => setProductOptions(list || []))
      .catch((err) => setError(err.message || "Failed to load products"));
  }, []);

  // Load existing transfer when editing
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoading(true);
    fetchStockTransferById(id)
      .then((data) => {
        if (!active) return;
        setForm({
          transfer_date: data.transfer_date ? data.transfer_date.split("T")[0] : "",
          transfer_number: data.transfer_number || "",
          location_from: data.location_from || "",
          location_to: data.location_to || "",
          notes: data.notes || "",
          status: data.status || "Pending",
        });
        setProducts(
          (data.items || []).map((it, idx) => ({
            rowId: it.id || idx + 1,
            product_id: it.product_id,
            quantity: it.quantity,
            cost_price: it.cost_price || 0,
          }))
        );
      })
      .catch((err) => setError(err.message || "Failed to load stock transfer"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isEdit, id]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const productById = (pid) => productOptions.find((p) => String(p.id) === String(pid));

const updateProductRow = (idx, field, val) => {
    if (field === "quantity") {
      const row = products[idx];
      const prod = productById(row.product_id);
      const stock = prod ? Number(prod.current_stock) || 0 : null;
      if (stock !== null && Number(val) > stock) {
        setError(`Cannot transfer ${val} of "${prod.product_name}" — only ${stock} in stock`);
        return;
      }
    }
    setProducts((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        const updated = { ...p, [field]: val };
        if (field === "product_id") {
          const prod = productById(val);
          updated.cost_price = prod ? Number(prod.cost_price) || 0 : 0;
        }
        return updated;
      })
    );
  };

  const addRow    = () => setProducts((prev) => [...prev, { rowId: Date.now(), product_id: "", quantity: 1, cost_price: 0 }]);
  const removeRow = (idx) => setProducts((prev) => prev.filter((_, i) => i !== idx));

  const subtotalFor = (row) => {
    const qty  = Number(row.quantity) || 0;
    const cost = Number(row.cost_price) || 0;
    return qty * cost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.location_from || !form.location_to) {
      setError("Both source and destination locations are required.");
      return;
    }
    if (form.location_from === form.location_to) {
      setError("Source and destination locations must be different.");
      return;
    }
    const validItems = products.filter((p) => p.product_id);
    if (validItems.length === 0) {
      setError("At least one product is required.");
      return;
    }
    for (const p of validItems) {
      const prod = productById(p.product_id);
      const stock = prod ? Number(prod.current_stock) || 0 : 0;
      if (Number(p.quantity) > stock) {
        setError(`Insufficient stock for "${prod?.product_name || 'product'}": only ${stock} available`);
        return;
      }
    }
    const payload = {
      transfer_date: form.transfer_date,
      location_from: form.location_from,
      location_to: form.location_to,
      status: form.status,
      notes: form.notes,
      items: validItems.map((p) => ({
        product_id: p.product_id,
        quantity: Number(p.quantity) || 1,
      })),
    };
    if (!isEdit && form.transfer_number) payload.transfer_number = form.transfer_number;

    try {
      setSaving(true);
      if (isEdit) {
        await updateStockTransfer(id, payload);
      } else {
        await createStockTransfer(payload);
      }
      navigate("/stock-transfers");
    } catch (err) {
      setError(err.message || "Failed to save stock transfer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={S.page}>
        <h1 style={S.pageTitle}>Stock Transfers</h1>
        <div style={S.card}><div style={S.loadingWrap}>Loading...</div></div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{BTN_COLOR_OVERRIDE}</style>
      <h1 style={S.pageTitle}>Stock Transfers</h1>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h2 style={S.cardTitle}>{isEdit ? "Edit Stock Transfer" : "Add Stock Transfer"}</h2>
          <Link
            to="/stock-transfers"
            className="st-back-btn"
            style={S.backBtn}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2d6a4f"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2d6a4f"; }}
          >
            ← Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={S.form}>
          {error && <div style={S.errorBanner}>{error}</div>}

          <div style={S.formGrid}>
            <div style={S.formGroup}>
              <label style={S.label}>Date <span style={S.req}>*</span></label>
              <input type="date" style={S.input} value={form.transfer_date} onChange={(e) => set("transfer_date", e.target.value)} required />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Reference No</label>
              <input
                type="text" style={S.input} value={form.transfer_number}
                placeholder={isEdit ? "" : "Auto-generated if left blank"}
                onChange={(e) => set("transfer_number", e.target.value)}
                disabled={isEdit}
              />
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
              <select style={S.input} value={form.location_from} onChange={(e) => set("location_from", e.target.value)} required>
                <option value="">-- Select location --</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Location (To) <span style={S.req}>*</span></label>
              <select style={S.input} value={form.location_to} onChange={(e) => set("location_to", e.target.value)} required>
                <option value="">-- Select location --</option>
                {LOCATIONS.filter((l) => l !== form.location_from).map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={S.sectionTitle}>Products</div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
               <tr>
                  {["Product *", "Stock", "Quantity *", "Unit Cost", "Subtotal", "Action"].map((h) => (
                    <th key={h} style={S.formThSmall}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.rowId}>
                    <td style={S.formTdSmall}>
                      <select
                        style={S.inputSm}
                        value={p.product_id}
                        onChange={(e) => updateProductRow(idx, "product_id", e.target.value)}
                        required
                      >
                        <option value="">-- Select product --</option>
                        {productOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.product_name}{opt.sku ? ` (${opt.sku})` : ""}
                          </option>
                        ))}
                      </select>
                   </td>
                    <td style={S.formTdSmall}>
                      {(() => {
                        const prod = productById(p.product_id);
                        const stock = prod ? Number(prod.current_stock) || 0 : null;
                        return stock === null ? "—" : (
                          <span style={{ background: stock === 0 ? "#f8d7da" : "#eef7f0", color: stock === 0 ? "#721c24" : "#2d6a4f", borderRadius: 4, padding: "2px 8px", fontWeight: 600, fontSize: "0.8rem" }}>
                            {stock}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={S.formTdSmall}>
                      <input type="number" style={S.inputSm} min="1" value={p.quantity} onChange={(e) => updateProductRow(idx, "quantity", e.target.value)} required />
                    </td>
                    <td style={S.formTdSmall}>₹{Number(p.cost_price || 0).toFixed(2)}</td>
                    <td style={S.subtotal}>₹{subtotalFor(p).toFixed(2)}</td>
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
            <textarea style={S.textarea} rows={3} placeholder="Enter any additional notes..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <div style={S.formFooter}>
            <button type="button" style={S.cancelBtn} onClick={() => navigate("/stock-transfers")}>Cancel</button>
            <button type="submit" style={{ ...S.submitBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Stock Transfer" : "Save Stock Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddStockTransfer() {
  return <StockTransferForm mode="add" />;
}

export function EditStockTransfer() {
  return <StockTransferForm mode="edit" />;
}
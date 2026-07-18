import { useState, useMemo, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import reportsAPI from "../api/reportsAPI";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
const C = {
  bg: "#f0f4f1",
  card: "#ffffff",
  green1: "#2e7d32",
  green2: "#43a047",
  green3: "#e8f5e9",
  text: "#1b2e1c",
  muted: "#607d63",
  border: "#d4e6d5",
  rowHover: "#f4faf4",
  red: "#c62828",
  redBg: "#fce4ec",
  amber: "#e65100",
  amberBg: "#fff3e0",
  blue: "#1565c0",
  blueBg: "#e3f2fd",
  purple: "#6a1b9a",
  purpleBg: "#f3e5f5",
};

const inputSt = {
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  padding: "7px 10px",
  fontSize: 13,
  color: C.text,
  background: "#fafffe",
  outline: "none",
  width: 140,
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StatusPill({ text }) {
  const config = {
    Paid: { bg: C.green3, color: C.green1 },
    Received: { bg: C.green3, color: C.green1 },
    Addition: { bg: C.green3, color: C.green1 },
    Due: { bg: C.redBg, color: C.red },
    Deduction: { bg: C.redBg, color: C.red },
    Unpaid: { bg: C.redBg, color: C.red },
    Supplier: { bg: C.blueBg, color: C.blue },
    Customer: { bg: C.purpleBg, color: C.purple },
    Partial: { bg: C.amberBg, color: C.amber },
    "In Stock": { bg: C.green3, color: C.green1 },
    "Low Stock": { bg: C.amberBg, color: C.amber },
    "Out of Stock": { bg: C.redBg, color: C.red },
  };
  const isPlus = String(text).startsWith("+");
  const isMinus = String(text).startsWith("-");
  const style = config[text] || (isPlus ? { bg: C.green3, color: C.green1 } : isMinus ? { bg: C.redBg, color: C.red } : { bg: "#f0f4f1", color: C.muted });
  return (
    <span style={{ background: style.bg, color: style.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, display: "inline-block" }}>
      {text}
    </span>
  );
}

function isPillValue(val) {
  const str = String(val);
  const PILLS = ["Paid", "Received", "Due", "Addition", "Deduction", "Unpaid", "Supplier", "Customer", "Partial", "In Stock", "Low Stock", "Out of Stock"];
  return PILLS.includes(str) || str.startsWith("+") || str.startsWith("-");
}

function isGrowth(val) {
  const str = String(val);
  return (str.startsWith("+") || str.startsWith("-")) && str.endsWith("%");
}

function GrowthBadge({ text }) {
  const isPos = text.startsWith("+");
  return (
    <span style={{ background: isPos ? C.green3 : C.redBg, color: isPos ? C.green1 : C.red, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
      {isPos ? "▲" : "▼"} {text}
    </span>
  );
}

function FilterBar({ fields, filters, onChange, onRun }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(46,125,50,0.07)" }}>
      {fields.map((f) => (
        <div key={f} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px" }}>{f}</label>
          {f === "Date Range" ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="date" style={inputSt} value={filters.from || ""} onChange={(e) => onChange("from", e.target.value)} />
              <span style={{ color: C.muted, fontSize: 12 }}>to</span>
              <input type="date" style={inputSt} value={filters.to || ""} onChange={(e) => onChange("to", e.target.value)} />
            </div>
          ) : (
            <input type="text" placeholder={`Filter ${f}...`} style={inputSt} value={filters[f] || ""} onChange={(e) => onChange(f, e.target.value)} />
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, alignSelf: "flex-end", marginLeft: "auto" }}>
        <button onClick={onRun} style={{ background: `linear-gradient(135deg, ${C.green1}, ${C.green2})`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(46,125,50,0.3)", letterSpacing: "0.3px" }}>
          ▶ Run Report
        </button>
        <button onClick={() => onChange("__reset__", null)} style={{ background: "#fff", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
}

function DataTable({ cols, data, highlight }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const av = Object.values(a)[sortCol] ?? "";
      const bv = Object.values(b)[sortCol] ?? "";
      const an = parseFloat(String(av).replace(/[^0-9.-]/g, ""));
      const bn = parseFloat(String(bv).replace(/[^0-9.-]/g, ""));
      if (!isNaN(an) && !isNaN(bn)) return sortDir === "asc" ? an - bn : bn - an;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [data, sortCol, sortDir]);

  const handleSort = (i) => {
    if (sortCol === i) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(i); setSortDir("asc"); }
  };

  if (!data.length) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted, background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>No records found</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
    </div>
  );

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(46,125,50,0.06)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: `linear-gradient(90deg, ${C.green1}22, ${C.green2}14)` }}>
            {cols.map((c, i) => (
              <th key={c} onClick={() => handleSort(i)} style={{ padding: "12px 18px", textAlign: "left", fontWeight: 800, color: C.green1, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `2px solid ${C.border}`, whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" }}>
                {c} {sortCol === i ? (sortDir === "asc" ? " ↑" : " ↓") : <span style={{ opacity: 0.3 }}> ↕</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => {
            const vals = Object.values(row);
            const isHighlighted = highlight && vals.some((v) => String(v).includes(highlight));
            return (
              <tr key={ri}
                style={{ background: isHighlighted ? "#fffde7" : ri % 2 === 0 ? "#fff" : C.rowHover, transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e8f5e9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = isHighlighted ? "#fffde7" : ri % 2 === 0 ? "#fff" : C.rowHover)}
              >
              {vals.map((v, vi) => {
                  const isElement = v !== null && typeof v === "object" && "$$typeof" in Object(v);
                  const str = isElement ? "" : String(v);
                  return (
                    <td key={vi} style={{ padding: "11px 18px", borderBottom: `1px solid ${C.border}`, color: C.text, whiteSpace: "nowrap" }}>
                      {isElement ? v : isPillValue(str) ? <StatusPill text={str} /> : isGrowth(str) ? <GrowthBadge text={str} /> : str}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function KpiCards({ cards }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background: c.accent ? `linear-gradient(135deg, ${C.green1}, ${C.green2})` : "#fff", border: `1px solid ${c.accent ? "transparent" : C.border}`, borderRadius: 12, padding: "14px 18px", boxShadow: c.accent ? "0 4px 16px rgba(46,125,50,0.3)" : "0 1px 4px rgba(46,125,50,0.07)" }}>
          <div style={{ fontSize: 11, color: c.accent ? "rgba(255,255,255,0.75)" : C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: c.large ? 22 : 18, fontWeight: 900, color: c.accent ? "#fff" : c.color || C.green1 }}>{c.value}</div>
          {c.sub && <div style={{ fontSize: 11, color: c.accent ? "rgba(255,255,255,0.6)" : C.muted, marginTop: 3 }}>{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function ActionBar({ onExportCSV, onExportExcel, onPrint, extraBtns }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {extraBtns}
      <button onClick={onExportCSV} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, color: C.green1, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        📥 CSV
      </button>
      <button onClick={onExportExcel} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, color: "#1565c0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        📊 Excel
      </button>
      <button onClick={onPrint} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        🖨 Print
      </button>
    </div>
  );
}

function Pagination({ total, page, perPage, onPage }) {
  const totalPages = Math.ceil(total / perPage) || 1;
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, color: C.muted, fontSize: 13 }}>
      <span>Showing <b style={{ color: C.text }}>{start}–{end}</b> of <b style={{ color: C.text }}>{total}</b> records</span>
      <div style={{ display: "flex", gap: 4 }}>
        {[["«", 1], ["‹", page - 1], [page, page], ["›", page + 1], ["»", totalPages]].map(([label, target]) => {
          const disabled = target < 1 || target > totalPages || target === page;
          return (
            <button key={label} onClick={() => !disabled && onPage(Number(target))} disabled={disabled}
              style={{ border: `1px solid ${C.border}`, background: label == page ? C.green1 : "#fff", color: label == page ? "#fff" : C.muted, borderRadius: 6, width: 32, height: 32, cursor: disabled ? "default" : "pointer", fontWeight: 700, fontSize: 13, opacity: disabled ? 0.4 : 1 }}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniBar({ value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 8, overflow: "hidden", minWidth: 80 }}>
        <div style={{ width: `${pct}%`, background: color || C.green2, height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, color: C.muted, minWidth: 30, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

// ─── Page shell — clean white header, no green gradient ──────────────
function ReportPage({ icon, label, description, children }) {
  const breadcrumb = label;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
      <div style={{ background: "#ffffff", borderBottom: `1px solid ${C.border}`, padding: "20px 30px 16px" }}>
        <h1 style={{ margin: 0, color: C.text, fontSize: 22, fontWeight: 800, letterSpacing: "-0.2px" }}>{label}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
          <span style={{ fontSize: 12, color: C.muted, cursor: "default" }}>Home</span>
          <span style={{ fontSize: 12, color: C.muted }}>/</span>
          <span style={{ fontSize: 12, color: C.muted, cursor: "default" }}>Reports</span>
          <span style={{ fontSize: 12, color: C.muted }}>/</span>
          <span style={{ fontSize: 12, color: C.green1, fontWeight: 600 }}>{breadcrumb}</span>
        </div>
      </div>
      <div style={{ padding: "24px 30px" }}>{children}</div>
    </div>
  );
}

// ─── Loading / Error shells (new — used by live reports only) ─────────────
function ReportLoading() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted, background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>Loading report...</div>
    </div>
  );
}

function ReportError({ message, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.red, background: C.redBg, borderRadius: 12, border: `1px solid ${C.red}30` }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>Failed to load report</div>
      <div style={{ fontSize: 13, marginTop: 4, color: C.muted }}>{message}</div>
      <button onClick={onRetry} style={{ marginTop: 14, background: C.green1, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        ↺ Retry
      </button>
    </div>
  );
}

// ─── CSV export helper ────────────────────────────────────────────────────────
function exportCSV(cols, data, filename) {
  const rows = [cols, ...data.map((r) => Object.values(r))];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = filename + ".csv";
  a.click();
}

function printTable(cols, data, title) {
  const rows = data.map((r) => `<tr>${Object.values(r).map((v) => `<td>${v}</td>`).join("")}</tr>`).join("");
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>${title}</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px}th{background:#2e7d32;color:#fff}</style></head><body><h2>${title}</h2><table><thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></body></html>`);
  w.document.close();
  w.print();
}

// ── Formatting helpers for live data ───────────────────────────────────────
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).replace(/ /g, "-");
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. STOCK REPORT  (LIVE — Products + business_locations + current_stock)
// ═══════════════════════════════════════════════════════════════════════════════
export function StockReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getStockReport({
        location: filters.Location || "",
        category: filters.Category || "",
        brand: filters.Brand || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Location, filters.Category, filters.Brand]);

  const COLS = ["Product", "SKU", "Category", "Brand", "Location", "Qty", "Reorder Pt", "Stock Value", "Status"];
  const tableRows = rows.map((r) => ({
    product: r.product,
    sku: r.sku || "—",
    category: r.category || "—",
    brand: r.brand || "—",
    location: r.location || "—",
    qty: String(r.qty),
    reorder: String(r.reorder_point),
    stockValue: fmtINR(r.stock_value),
    status: r.status,
  }));

  const lowStock = summary ? parseInt(summary.low_or_out_count, 10) || 0 : 0;

  return (
    <ReportPage icon="📦" label="Stock Report" description="Current stock levels across all locations">
      {summary && (
        <KpiCards cards={[
          { label: "Total SKUs", value: String(summary.total_skus || 0) },
          { label: "Total Stock Value", value: fmtINR(summary.total_stock_value), accent: true },
          { label: "Low / Out of Stock", value: String(lowStock), color: C.red },
          { label: "Warehouses", value: String(summary.warehouse_count || 0), color: C.blue },
          { label: "Healthy Stock", value: String((summary.total_skus || 0) - lowStock), color: C.green1 },
        ]} />
      )}
      {lowStock > 0 && (
        <div style={{ background: C.amberBg, border: `1px solid ${C.amber}30`, borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ color: C.amber, fontWeight: 700 }}>{lowStock} item(s) need restocking</span>
        </div>
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "stock-report")}
        onExportExcel={() => exportCSV(COLS, tableRows, "stock-report")}
        onPrint={() => printTable(COLS, tableRows, "Stock Report")}
      />
      <FilterBar fields={["Location", "Category", "Brand"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. STOCK ADJUSTMENT REPORT  (LIVE — stock_adjustments + items)
// ═══════════════════════════════════════════════════════════════════════════════
export function StockAdjustmentReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getStockAdjustmentReport({
        location: filters.Location || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Location, filters.from, filters.to]);

  const COLS = ["Date", "Ref No", "Type", "Products", "Qty", "Value", "Reason", "By"];
  const tableRows = rows.map((r) => ({
    date: fmtDate(r.date),
    ref: r.ref,
    type: r.type,
    products: r.products || "—",
    qty: String(r.qty),
    value: (r.type === "Deduction" ? "-" : "+") + fmtINR(r.value),
    reason: r.reason || "—",
    by: r.added_by || "—",
  }));

  return (
    <ReportPage icon="🔧" label="Stock Adjustment Report" description="All stock additions and deductions log">
      {summary && (
        <KpiCards cards={[
          { label: "Total Adjustments", value: String(summary.total_adjustments || 0) },
          { label: "Additions", value: String(summary.additions || 0), color: C.green1 },
          { label: "Deductions", value: String(summary.deductions || 0), color: C.red },
          { label: "Net Value Change", value: (Number(summary.net_value_change) >= 0 ? "+" : "") + fmtINR(summary.net_value_change), accent: true },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "stock-adjustment")}
        onExportExcel={() => exportCSV(COLS, tableRows, "stock-adjustment")}
        onPrint={() => printTable(COLS, tableRows, "Stock Adjustment Report")}
      />
      <FilterBar fields={["Date Range", "Location", "User"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ITEMS REPORT  (LIVE — products + SUM(purchase_items) + SUM(sales_invoice_items))
// ═══════════════════════════════════════════════════════════════════════════════
export function ItemsReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getItemsReport({
        category: filters.Category || "",
        brand: filters.Brand || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Category, filters.Brand]);

  const COLS = ["Product", "SKU", "Category", "Brand", "Units Sold", "Purchased", "Balance", "Buy Price", "Sell Price", "Margin"];
  const tableRows = rows.map((r) => ({
    product: r.product,
    sku: r.sku || "—",
    category: r.category || "—",
    brand: r.brand || "—",
    unitsSold: String(r.units_sold),
    purchased: String(r.purchased),
    balance: String(r.balance),
    purchasePrice: fmtINR(r.purchase_price),
    sellPrice: fmtINR(r.sell_price),
    margin: (Number(r.margin_pct) >= 0 ? "+" : "") + r.margin_pct + "%",
  }));

  return (
    <ReportPage icon="🗂️" label="Items Report" description="Full product catalogue with sales and purchase totals">
      {summary && (
        <KpiCards cards={[
          { label: "Total Products", value: String(summary.total_products || 0) },
          { label: "Total Units Sold", value: String(summary.total_units_sold || 0), accent: true },
          { label: "Categories", value: String(summary.category_count || 0), color: C.blue },
        ]} />
      )}
      <ActionBar onExportCSV={() => exportCSV(COLS, tableRows, "items-report")} onExportExcel={() => exportCSV(COLS, tableRows, "items-report")} onPrint={() => printTable(COLS, tableRows, "Items Report")} />
      <FilterBar fields={["Category", "Brand"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. PRODUCT PURCHASE REPORT  (LIVE — purchase_items + purchases)
// ═══════════════════════════════════════════════════════════════════════════════
export function ProductPurchaseReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getProductPurchaseReport({
        product: filters.Product || "",
        supplier: filters.Supplier || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Product, filters.Supplier, filters.from, filters.to]);
const COLS = ["Date", "Invoice No", "Product", "SKU", "Supplier", "Qty", "Unit Cost", "Amount", "Status"];
  const tableRows = rows.map((r) => ({
    date: fmtDate(r.date),
    invoiceNo: r.invoice_no,
    product: r.product,
    sku: r.sku || "—",
    supplier: r.supplier || "—",
    qty: String(Number(r.qty)),
    unitCost: fmtINR(r.unit_cost),
    amount: fmtINR(r.amount),
    status: r.status,
  }));

  return (
    <ReportPage icon="🏭" label="Product Purchase Report" description="Purchase history per product with supplier breakdown">
      {summary && (
        <KpiCards cards={[
          { label: "Total Purchases", value: String(summary.total_purchases || 0) },
          { label: "Total Amount", value: fmtINR(summary.total_amount), accent: true },
          { label: "Paid", value: String(summary.paid_count || 0), color: C.green1 },
          { label: "Due", value: String(summary.due_count || 0), color: C.red },
        { label: "Total Qty", value: `${Number(summary.total_qty || 0)} units`, color: C.blue },  
        ]} />
      )}
      <ActionBar onExportCSV={() => exportCSV(COLS, tableRows, "product-purchase")} onExportExcel={() => exportCSV(COLS, tableRows, "product-purchase")} onPrint={() => printTable(COLS, tableRows, "Product Purchase Report")} />
      <FilterBar fields={["Date Range", "Product", "Supplier"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. PRODUCT SELL REPORT  (LIVE — sales_invoice_items + sales_invoices)
// ═══════════════════════════════════════════════════════════════════════════════
export function ProductSellReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getProductSellReport({
        product: filters.Product || "",
        customer: filters.Customer || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Product, filters.Customer, filters.from, filters.to]);

  const COLS = ["Date", "Invoice No", "Product", "SKU", "Customer", "Qty", "Unit Price", "Amount", "Status"];
  const tableRows = rows.map((r) => ({
    date: fmtDate(r.date),
    invoiceNo: r.invoice_no,
    product: r.product,
    sku: r.sku || "—",
    customer: r.customer || "—",
    qty: String(r.qty),
    unitPrice: fmtINR(r.unit_price),
    amount: fmtINR(r.amount),
    status: r.status,
  }));

  return (
    <ReportPage icon="🛍️" label="Product Sell Report" description="Sales history per product with customer details">
      {summary && (
        <KpiCards cards={[
          { label: "Total Orders", value: String(summary.total_orders || 0) },
          { label: "Total Revenue", value: fmtINR(summary.total_revenue), accent: true },
          { label: "Paid / Received", value: String(summary.paid_or_received_count || 0), color: C.green1 },
          { label: "Due", value: String(summary.due_count || 0), color: C.red },
          { label: "Total Units", value: String(summary.total_units || 0), color: C.blue },
        ]} />
      )}
      <ActionBar onExportCSV={() => exportCSV(COLS, tableRows, "product-sell")} onExportExcel={() => exportCSV(COLS, tableRows, "product-sell")} onPrint={() => printTable(COLS, tableRows, "Product Sell Report")} />
      <FilterBar fields={["Date Range", "Product", "Customer"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REMAINING REPORTS — unchanged, still dummy data, to be migrated in later batches
// (Profit/Loss, Purchase & Sale, Tax, Supplier & Customer, Customer Groups,
//  Trending Products, Purchase Payment, Sell Payment, Expense, Register,
//  Sales Representative, Activity Log)
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// PROFIT / LOSS REPORT  (LIVE — sales_invoices revenue − expenses − purchases, by month)
// ═══════════════════════════════════════════════════════════════════════════════
const fmtMonth = (ym) => {
  if (!ym) return "—";
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export function ProfitLossReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 12;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getProfitLossReport({
        location: filters.Location || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Location, filters.from, filters.to]);

  const COLS = ["Period", "Revenue", "Expenses", "Net Profit", "Margin %"];
  const tableRows = rows.map((r) => ({
    period: fmtMonth(r.period),
    revenue: fmtINR(r.revenue),
    expenses: fmtINR(r.expenses),
    netProfit: fmtINR(r.net_profit),
    margin: `${r.margin_pct}%`,
  }));

  return (
    <ReportPage icon="📈" label="Profit / Loss Report" description="Net profit and loss across all business periods">
      {summary && (
        <KpiCards cards={[
          { label: "Total Revenue", value: fmtINR(summary.total_revenue), accent: true, large: true },
          { label: "Total Expenses", value: fmtINR(summary.total_expenses), color: C.red },
          { label: "Net Profit", value: fmtINR(summary.net_profit), color: C.green1 },
          { label: "Avg Margin", value: `${summary.avg_margin}%`, color: C.blue },
          { label: "Best Month", value: fmtMonth(summary.best_month), sub: `${fmtINR(summary.best_month_profit)} profit` },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "profit-loss")}
        onExportExcel={() => exportCSV(COLS, tableRows, "profit-loss")}
        onPrint={() => printTable(COLS, tableRows, "Profit / Loss Report")}
      />
      <FilterBar fields={["Date Range", "Location"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

export function PurchaseSaleReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getPurchaseSaleReport({
        product: filters.Product || "",
        category: filters.Category || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Product, filters.Category, filters.from, filters.to]);

  const COLS = ["Product", "Purchased", "Sold", "Gain", "Gain %", "Qty Sold"];
  const tableRows = rows.map((r) => ({
    product: r.product,
    purchased: fmtINR(r.purchased),
    sold: fmtINR(r.sold),
    gain: (Number(r.gain) >= 0 ? "+" : "") + fmtINR(r.gain),
    gainPct: (Number(r.gain_pct) >= 0 ? "+" : "") + r.gain_pct + "%",
    qtySold: String(r.qty_sold),
  }));

  return (
    <ReportPage icon="🛒" label="Purchase & Sale Report" description="Comparative purchase vs sale summary by product">
      {summary && (
        <KpiCards cards={[
          { label: "Total Purchased", value: fmtINR(summary.total_purchased), color: C.red },
          { label: "Total Sold", value: fmtINR(summary.total_sold), accent: true },
          { label: "Total Gain", value: fmtINR(summary.total_gain), color: C.green1 },
          { label: "Avg Margin", value: `${summary.avg_margin}%`, color: C.blue },
          { label: "Products", value: String(summary.product_count || 0), sub: "in this report" },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "purchase-sale")}
        onExportExcel={() => exportCSV(COLS, tableRows, "purchase-sale")}
        onPrint={() => printTable(COLS, tableRows, "Purchase & Sale Report")}
      />
      <FilterBar fields={["Date Range", "Product", "Category"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}
export function TaxReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [byProduct, setByProduct] = useState([]);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getTaxReport({
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
      setByProduct(res.byProduct || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.from, filters.to]);

  const COLS = ["Period", "Taxable Amount", "Sales Tax", "Purchase Tax", "Net Tax Payable"];
  const tableRows = rows.map((r) => ({
    period: r.period,
    taxable: fmtINR(r.taxable_amount),
    salesTax: fmtINR(r.sales_tax),
    purchaseTax: fmtINR(r.purchase_tax),
    netTaxPayable: (Number(r.net_tax_payable) >= 0 ? "+" : "") + fmtINR(r.net_tax_payable),
  }));

  return (
    <ReportPage icon="🧾" label="Tax Report" description="Sales tax and purchase tax by quarter">
      {summary && (
        <KpiCards cards={[
          { label: "Total Taxable", value: fmtINR(summary.total_taxable), accent: true },
          { label: "Total Sales Tax", value: fmtINR(summary.total_sales_tax), color: C.blue },
          { label: "Total Purchase Tax", value: fmtINR(summary.total_purchase_tax), color: C.purple },
          { label: "Net Tax Payable", value: fmtINR(summary.net_tax_payable), color: C.red },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "tax-report")}
        onExportExcel={() => exportCSV(COLS, tableRows, "tax-report")}
        onPrint={() => printTable(COLS, tableRows, "Tax Report")}
      />
     <FilterBar fields={["Date Range"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />

          {byProduct.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 10 }}>
                🧾 Tax Collected by Product
              </div>
              <DataTable
                cols={["Product", "Tax Rate", "Taxable Amount", "Tax Collected"]}
                data={byProduct.map((r) => ({
                  product: r.product,
                  taxRate: `${r.tax_rate}%`,
                  taxableAmount: fmtINR(r.taxable_amount),
                  taxCollected: fmtINR(r.tax_collected),
                }))}
              />
            </div>
          )}
        </>
      )}
    </ReportPage>
  );
}

export function SupplierCustomerReport() {
  const [filters, setFilters] = useState({});
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [sendMsg, setSendMsg] = useState(null); // { id, ok, text }

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getSupplierCustomerReport({
        contact_type: typeFilter,
        name: filters["Contact Name"] || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, typeFilter, filters["Contact Name"]]);

  const handleSendLedger = async (contact) => {
    setSendingId(contact.id);
    setSendMsg(null);
    try {
      await reportsAPI.sendLedger(contact.id);
      setSendMsg({ id: contact.id, ok: true, text: `Ledger sent to ${contact.email}` });
    } catch (err) {
      setSendMsg({ id: contact.id, ok: false, text: err.message || "Failed to send ledger" });
    } finally {
      setSendingId(null);
    }
  };

  const COLS = ["Name", "Type", "Total", "Settled", "Due", "Status", "Ledger"];
  const tableRows = rows.map((r) => ({
    name: r.name,
    type: r.type,
    total: fmtINR(r.total),
    settled: fmtINR(r.settled),
    due: fmtINR(r.due),
    status: r.status,
    ledger: (
      <button
        key={r.id}
        onClick={() => handleSendLedger(r)}
        disabled={sendingId === r.id || !r.email}
        title={!r.email ? "No email on file for this contact" : "Email this contact's ledger"}
        style={{
          border: `1px solid ${C.border}`,
          background: sendingId === r.id ? "#f0f4f1" : "#fff",
          color: !r.email ? C.muted : C.green1,
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 700,
          cursor: sendingId === r.id || !r.email ? "default" : "pointer",
          opacity: !r.email ? 0.5 : 1,
        }}
      >
        {sendingId === r.id ? "Sending..." : "📧 Send Ledger"}
      </button>
    ),
  }));

  return (
    <ReportPage icon="🤝" label="Supplier & Customer Report" description="Ledger-wise summary for suppliers and customers">
      {summary && (
        <KpiCards cards={[
          { label: "Total Suppliers", value: String(summary.supplier_count || 0), color: C.blue },
          { label: "Total Customers", value: String(summary.customer_count || 0), color: C.purple },
          { label: "Total Business", value: fmtINR(summary.total_business), accent: true },
          { label: "Total Due", value: fmtINR(summary.total_due), color: C.red },
          { label: "Settled", value: fmtINR(summary.total_settled), color: C.green1 },
        ]} />
      )}
      {sendMsg && (
        <div style={{
          background: sendMsg.ok ? C.green3 : C.redBg,
          color: sendMsg.ok ? C.green1 : C.red,
          border: `1px solid ${sendMsg.ok ? C.green1 : C.red}30`,
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
        }}>
          {sendMsg.text}
        </div>
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows.map((r) => ({ ...r, ledger: "" })), "supplier-customer")}
        onExportExcel={() => exportCSV(COLS, tableRows.map((r) => ({ ...r, ledger: "" })), "supplier-customer")}
        onPrint={() => printTable(COLS.filter((c) => c !== "Ledger"), rows.map((r) => ({
          name: r.name, type: r.type, total: fmtINR(r.total), settled: fmtINR(r.settled), due: fmtINR(r.due), status: r.status,
        })), "Supplier & Customer Report")}
        extraBtns={
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Supplier", "Customer"].map((t) => (
              <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }} style={{ border: `1px solid ${C.border}`, background: typeFilter === t ? C.green1 : "#fff", color: typeFilter === t ? "#fff" : C.muted, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        }
      />
      <FilterBar fields={["Contact Name"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

export function CustomerGroupsReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getCustomerGroupsReport({
        group: filters["Customer Group"] || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters["Customer Group"], filters.from, filters.to]);

  const COLS = ["Group", "Customers", "Total Sales", "Avg / Customer", "Top Product", "Growth"];
  const maxSales = rows.length ? Math.max(...rows.map((r) => Number(r.total_sales) || 0)) : 1;
  const tableRows = rows.map((r) => ({
    group: r.group,
    customers: String(r.customers),
    totalSales: fmtINR(r.total_sales),
    avgPerCustomer: fmtINR(r.avg_per_customer),
    topProduct: r.top_product || "—",
    growth: r.growth_pct === null ? "—" : (Number(r.growth_pct) >= 0 ? "+" : "") + r.growth_pct + "%",
  }));

  return (
    <ReportPage icon="👥" label="Customer Groups Report" description="Sales performance broken down by customer group">
      {summary && (
        <KpiCards cards={[
          { label: "Total Groups", value: String(summary.total_groups || 0) },
          { label: "Total Customers", value: String(summary.total_customers || 0), color: C.blue },
          { label: "Total Sales", value: fmtINR(summary.total_sales), accent: true },
          { label: "Best Group", value: summary.best_group || "—", sub: fmtINR(summary.best_group_sales) },
          { label: "Fastest Growth", value: summary.fastest_growth_group || "—", sub: summary.fastest_growth_pct != null ? `${summary.fastest_growth_pct >= 0 ? "+" : ""}${summary.fastest_growth_pct}%` : "Select a date range" },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "customer-groups")}
        onExportExcel={() => exportCSV(COLS, tableRows, "customer-groups")}
        onPrint={() => printTable(COLS, tableRows, "Customer Groups Report")}
      />
      <FilterBar fields={["Date Range", "Customer Group"]} filters={filters} onChange={handle} onRun={load} />
      {rows.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>📊 Sales by Group</div>
          {rows.map((r) => (
            <div key={r.group} style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.group}</span>
              <MiniBar value={Number(r.total_sales) || 0} max={maxSales} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.green1, textAlign: "right" }}>{fmtINR(r.total_sales)}</span>
            </div>
          ))}
        </div>
      )}
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

export function TrendingProductsReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getTrendingProductsReport({
        category: filters.Category || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Category, filters.from, filters.to]);

  const COLS = ["Rank", "Product", "Category", "Units Sold", "Revenue", "Growth"];
  const rankIcons = ["🥇", "🥈", "🥉"];
  const maxQty = rows.length ? Math.max(...rows.map((r) => Number(r.units_sold) || 0)) : 1;

  const tableRows = rows.map((r, i) => ({
    rank: i < 3 ? `${rankIcons[i]} ${i + 1}` : String(i + 1 + (page - 1) * PER),
    product: r.product,
    category: r.category || "—",
    unitsSold: String(r.units_sold),
    revenue: fmtINR(r.revenue),
    growth: r.growth_pct === null ? "—" : (Number(r.growth_pct) >= 0 ? "+" : "") + r.growth_pct + "%",
  }));

  return (
    <ReportPage icon="🔥" label="Trending Products" description="Top-selling products ranked by volume and revenue">
      {summary && (
        <KpiCards cards={[
          { label: "#1 Product", value: summary.top_product || "—", sub: `${summary.top_product_units || 0} units sold`, accent: true },
          { label: "Total Revenue", value: fmtINR(summary.total_revenue), color: C.green1 },
          { label: "Total Units Sold", value: String(summary.total_units || 0), color: C.blue },
          { label: "Products Tracked", value: String(summary.product_count || 0), sub: "in this range" },
        ]} />
      )}
      {rows.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>🔥 Units Sold Comparison</div>
          {rows.slice(0, 5).map((r, i) => (
            <div key={r.product} style={{ display: "grid", gridTemplateColumns: "30px 120px 1fr 80px", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{i < 3 ? rankIcons[i] : `${i + 1}️⃣`}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.product}</span>
              <MiniBar value={Number(r.units_sold) || 0} max={maxQty} color={i === 0 ? "#f9a825" : i === 1 ? "#90a4ae" : i === 2 ? "#a0522d" : C.green2} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textAlign: "right" }}>{r.units_sold}</span>
            </div>
          ))}
        </div>
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "trending-products")}
        onExportExcel={() => exportCSV(COLS, tableRows, "trending-products")}
        onPrint={() => printTable(COLS, tableRows, "Trending Products")}
      />
      <FilterBar fields={["Date Range", "Category"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// PURCHASE PAYMENT REPORT  (LIVE — purchases + purchase_payments)
// ═══════════════════════════════════════════════════════════════════════════════
export function PurchasePaymentReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getPurchasePaymentReport({
        supplier: filters.Supplier || "",
        payment_method: filters["Payment Method"] || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Supplier, filters["Payment Method"], filters.from, filters.to]);

  const COLS = ["Date", "Supplier", "Invoice", "Invoice Amt", "Paid", "Balance", "Method", "Status"];
  const tableRows = rows.map((r) => ({
    date: fmtDate(r.date),
    supplier: r.supplier || "—",
    invoice: r.invoice,
    amount: fmtINR(r.amount),
    paid: fmtINR(r.paid),
    balance: fmtINR(r.balance),
    method: r.method || "—",
    status: r.status,
  }));

  return (
    <ReportPage icon="💳" label="Purchase Payment Report" description="Payments made to suppliers with method breakdown">
      {summary && (
        <KpiCards cards={[
          { label: "Total Invoices", value: String(summary.total_invoices || 0) },
          { label: "Total Billed", value: fmtINR(summary.total_billed), color: C.text },
          { label: "Total Paid", value: fmtINR(summary.total_paid), accent: true },
          { label: "Outstanding", value: fmtINR(summary.outstanding), color: C.red },
          { label: "Fully Paid", value: String(summary.fully_paid_count || 0), color: C.green1 },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "purchase-payment")}
        onExportExcel={() => exportCSV(COLS, tableRows, "purchase-payment")}
        onPrint={() => printTable(COLS, tableRows, "Purchase Payment Report")}
      />
      <FilterBar fields={["Date Range", "Supplier", "Payment Method"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELL PAYMENT REPORT  (LIVE — sales_invoices payment fields)
// ═══════════════════════════════════════════════════════════════════════════════
export function SalesPaymentReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getSellPaymentReport({
        customer: filters.Customer || "",
        payment_method: filters["Payment Method"] || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Customer, filters["Payment Method"], filters.from, filters.to]);

  const COLS = ["Date", "Customer", "Invoice", "Invoice Amt", "Received", "Balance", "Method", "Status"];
  const tableRows = rows.map((r) => ({
    date: fmtDate(r.date),
    customer: r.customer || "—",
    invoice: r.invoice,
    amount: fmtINR(r.amount),
    received: fmtINR(r.received),
    balance: fmtINR(r.balance),
    method: r.method || "—",
    status: r.status,
  }));

  return (
  <ReportPage icon="💰" label="Sales Payment Report" description="Payments received from customers">
      {summary && (
        <KpiCards cards={[
          { label: "Total Invoices", value: String(summary.total_invoices || 0) },
          { label: "Total Billed", value: fmtINR(summary.total_billed), color: C.text },
          { label: "Total Received", value: fmtINR(summary.total_received), accent: true },
          { label: "Outstanding", value: fmtINR(summary.outstanding), color: C.red },
          { label: "Fully Received", value: String(summary.fully_received_count || 0), color: C.green1 },
        ]} />
      )}
      <ActionBar
     onExportCSV={() => exportCSV(COLS, tableRows, "sales-payment")}
        onExportExcel={() => exportCSV(COLS, tableRows, "sales-payment")}
        onPrint={() => printTable(COLS, tableRows, "Sales Payment Report")}
      />
      <FilterBar fields={["Date Range", "Customer", "Payment Method"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPENSE REPORT  (LIVE — expenses + expense_categories + users)
// ═══════════════════════════════════════════════════════════════════════════════
export function ExpenseReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getExpenseReport({
        category: filters.Category || "",
        location: filters.Location || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.Category, filters.Location, filters.from, filters.to]);

  const COLS = ["Date", "Ref", "Category", "Note", "Location", "Amount", "By"];
  const tableRows = rows.map((r) => ({
    date: fmtDate(r.date),
    ref: r.ref,
    category: r.category || "—",
    note: r.note || "—",
    location: r.location || "—",
    amount: fmtINR(r.amount),
    by: r.added_by || "—",
  }));

  return (
    <ReportPage icon="📉" label="Expense Report" description="All expenses categorised by type and location">
      {summary && (
        <KpiCards cards={[
          { label: "Total Expenses", value: fmtINR(summary.total_amount), accent: true },
          { label: "Entries", value: String(summary.total_expenses || 0) },
          { label: "Top Category", value: summary.top_category || "—" },
          { label: "Locations", value: String(summary.location_count || 0), color: C.blue },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "expense-report")}
        onExportExcel={() => exportCSV(COLS, tableRows, "expense-report")}
        onPrint={() => printTable(COLS, tableRows, "Expense Report")}
      />
      <FilterBar fields={["Date Range", "Category", "Location"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

export function RegisterReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const [tableRows, setTableRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Shift", "User", "Location", "Opening Bal", "Cash In", "Cash Out", "Closing Bal", "Total Sales"];
const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        date_from: filters["Date Range"]?.from,
        date_to: filters["Date Range"]?.to,
        location: filters.Location,
        user: filters.User,
        page,
        limit: PER,
      };

      const res = await reportsAPI.getRegisterReport(params);
      const rows = (res.data || []).map((r) => ({
        date: r.date,
        shift: r.shift,
        user: r.user_name || "—",
        location: r.location || "—",
        openingBal: fmtINR(r.opening_bal),
        cashIn: fmtINR(r.cash_in),
        cashOut: fmtINR(r.cash_out),
        closingBal: fmtINR(r.closing_bal),
        totalSales: fmtINR(r.total_sales),
      }));
     setTableRows(rows);
      setSummary(res.summary);
      setTotal(res.total || rows.length);
    } catch (err) {
      setError(err.message || "Failed to load register report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <ReportPage icon="🖨️" label="Register Report" description="Cash register open/close summary per shift">
      {summary && (
        <KpiCards cards={[
          { label: "Total Shifts", value: String(summary.total_shifts || 0) },
          { label: "Total Sales", value: fmtINR(summary.total_sales), accent: true },
          { label: "Total Cash In", value: fmtINR(summary.total_cash_in), color: C.green1 },
          { label: "Total Cash Out", value: fmtINR(summary.total_cash_out), color: C.red },
          { label: "Cashiers", value: String(summary.cashier_count || 0), color: C.blue },
        ]} />
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "register-report")}
        onExportExcel={() => exportCSV(COLS, tableRows, "register-report")}
        onPrint={() => printTable(COLS, tableRows, "Register Report")}
      />
      <FilterBar fields={["Date Range", "Location", "User"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SALES REPRESENTATIVE REPORT  (LIVE — sales_invoices grouped by salesperson)
// ═══════════════════════════════════════════════════════════════════════════════
export function SalesRepresentativeReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") setFilters({});
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getSalesRepresentativeReport({
        sales_rep: filters["Sales Rep"] || "",
        location: filters.Location || "",
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters["Sales Rep"], filters.Location, filters.from, filters.to]);

  const COLS = ["Sales Rep", "Employee ID", "Branch / Location", "Customers Handled", "Quotations", "Sales Orders", "Sales Invoices", "Total Sales", "Payments Collected", "Outstanding", "Returns", "Commission", "Target", "Achievement %"];
  const maxSales = Math.max(1, ...rows.map((r) => Number(r.total_sales) || 0));
  const tableRows = rows.map((r) => ({
    representative: r.representative,
    employeeId: r.employee_id != null ? String(r.employee_id) : "—",
    territory: r.territory || "—",
    customersHandled: String(r.customers_handled || 0),
    quotations: String(r.quotations || 0),
    salesOrders: String(r.sales_orders || 0),
    salesInvoices: String(r.sales_invoices || 0),
    totalSales: fmtINR(r.total_sales),
    paymentsCollected: fmtINR(r.payments_collected),
    outstanding: fmtINR(r.outstanding),
    salesReturns: String(r.sales_returns || 0),
    commission: fmtINR(r.commission),
    target: fmtINR(r.target),
    achievementPct: `${r.achievement_pct || 0}%`,
  }));

  return (
    <ReportPage icon="🧑‍💼" label="Sales Representative Report" description="Performance metrics per sales representative">
      {summary && (
        <KpiCards cards={[
          { label: "Top Performer", value: summary.top_performer || "—", sub: fmtINR(summary.top_performer_sales), accent: true },
          { label: "Team Revenue", value: fmtINR(summary.team_revenue), color: C.green1 },
          { label: "Total Reps", value: String(summary.total_reps || 0), color: C.blue },
        ]} />
      )}
      {rows.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>🏆 Sales by Representative</div>
          {rows.map((r) => (
            <div key={r.representative} style={{ display: "grid", gridTemplateColumns: "140px 1fr 100px", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.representative}</span>
              <MiniBar value={Number(r.total_sales) || 0} max={maxSales} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.green1, textAlign: "right" }}>{fmtINR(r.total_sales)}</span>
            </div>
          ))}
        </div>
      )}
      <ActionBar
        onExportCSV={() => exportCSV(COLS, tableRows, "sales-rep")}
        onExportExcel={() => exportCSV(COLS, tableRows, "sales-rep")}
        onPrint={() => printTable(COLS, tableRows, "Sales Representative Report")}
      />
      <FilterBar fields={["Date Range", "Sales Rep", "Location"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

const MODULE_COLORS = { Purchases: C.blueBg, Stock: C.green3, POS: C.purpleBg, Users: C.amberBg, Expenses: C.redBg, Reports: "#f3e5f5", Sales: C.blueBg };
const MODULE_TEXT = { Purchases: C.blue, Stock: C.green1, POS: C.purple, Users: C.amber, Expenses: C.red, Reports: C.purple, Sales: C.blue };

const fmtTime = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return String(ts);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

export function ActivityLogReport() {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 6;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const handle = (k, v) => {
    if (k === "__reset__") { setFilters({}); setSearch(""); }
    else setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getActivityLogReport({
        user: filters.User || "",
        module: filters.Module || "",
        search,
        date_from: filters.from || "",
        date_to: filters.to || "",
        page,
        limit: PER,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filters.User, filters.Module, filters.from, filters.to, search]);

  const COLS = ["Time", "User", "Module", "Action", "Detail", "IP Address"];
  const tableRows = rows.map((r) => ({
    time: fmtTime(r.created_at),
    user: r.user_name || "—",
    module: r.module,
    action: r.action,
    detail: r.detail || "—",
    ip: r.ip_address || "—",
  }));

  return (
    <ReportPage icon="📋" label="Activity Log" description="Full audit trail of all user actions in the system">
      {summary && (
        <KpiCards cards={[
          { label: "Total Events", value: String(summary.total_events || 0) },
          { label: "Today", value: String(summary.today_count || 0), accent: true },
          { label: "Users Active", value: String(summary.users_active || 0), color: C.green1 },
          { label: "Modules", value: String(summary.module_count || 0), color: C.blue },
        ]} />
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 14 }}>🔍</span>
          <input placeholder="Search all fields..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputSt, width: "100%", paddingLeft: 34, fontSize: 13, boxSizing: "border-box" }} />
        </div>
      </div>
      {rows.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 14 }}>🕐 Activity Timeline</div>
          {rows.slice(0, 5).map((r, i) => (
            <div key={r.id || i} style={{ display: "flex", gap: 14, marginBottom: 14, position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: MODULE_TEXT[r.module] || C.green2, border: `2px solid ${C.card}`, boxShadow: `0 0 0 2px ${MODULE_TEXT[r.module] || C.green2}`, flexShrink: 0, marginTop: 3 }} />
                {i < 4 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{fmtTime(r.created_at)}</span>
                  <span style={{ background: MODULE_COLORS[r.module] || "#f0f4f1", color: MODULE_TEXT[r.module] || C.muted, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{r.module}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>by <b style={{ color: C.text }}>{r.user_name || "—"}</b></span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.action}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ActionBar onExportCSV={() => exportCSV(COLS, tableRows, "activity-log")} onExportExcel={() => exportCSV(COLS, tableRows, "activity-log")} onPrint={() => printTable(COLS, tableRows, "Activity Log")} />
      <FilterBar fields={["Date Range", "User", "Module"]} filters={filters} onChange={handle} onRun={load} />
      {loading ? <ReportLoading /> : error ? <ReportError message={error} onRetry={load} /> : (
        <>
          <DataTable cols={COLS} data={tableRows} />
          <Pagination total={total} page={page} perPage={PER} onPage={setPage} />
        </>
      )}
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Reports() {
  return (
    <Routes>
      <Route index element={<Navigate to="profit-loss" replace />} />
      <Route path="profit-loss"          element={<ProfitLossReport />} />
      <Route path="purchase-sale"        element={<PurchaseSaleReport />} />
      <Route path="tax"                  element={<TaxReport />} />
      <Route path="supplier-customer"    element={<SupplierCustomerReport />} />
      <Route path="customer-groups"      element={<CustomerGroupsReport />} />
      <Route path="stock"                element={<StockReport />} />
      <Route path="stock-adjustment"     element={<StockAdjustmentReport />} />
      <Route path="trending-products"    element={<TrendingProductsReport />} />
      <Route path="items"                element={<ItemsReport />} />
      <Route path="product-purchase"     element={<ProductPurchaseReport />} />
      <Route path="product-sell"         element={<ProductSellReport />} />
      <Route path="purchase-payment"     element={<PurchasePaymentReport />} />
     <Route path="sell-payment"         element={<SalesPaymentReport />} />
      <Route path="expense"              element={<ExpenseReport />} />
      <Route path="register"             element={<RegisterReport />} />
      <Route path="sales-representative" element={<SalesRepresentativeReport />} />
      <Route path="activity-log"         element={<ActivityLogReport />} />
      <Route path="*"                    element={<Navigate to="profit-loss" replace />} />
    </Routes>
  );
} 
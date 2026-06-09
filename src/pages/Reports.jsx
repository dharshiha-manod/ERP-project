import { useState, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
  const PILLS = ["Paid", "Received", "Due", "Addition", "Deduction", "Unpaid", "Supplier", "Customer", "Partial"];
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
                  const str = String(v);
                  return (
                    <td key={vi} style={{ padding: "11px 18px", borderBottom: `1px solid ${C.border}`, color: C.text, whiteSpace: "nowrap" }}>
                      {isPillValue(str) ? <StatusPill text={str} /> : isGrowth(str) ? <GrowthBadge text={str} /> : str}
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
  const start = (page - 1) * perPage + 1;
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

// ─── Chart bar for simple inline visualisation ───────────────────────────────
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

// ─── Page shell ──────────────────────────────────────────────────────────────
function ReportPage({ icon, label, description, children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.green1}, ${C.green2})`, padding: "18px 30px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 12px rgba(46,125,50,0.2)" }}>
        <div style={{ background: "rgba(255, 255, 255, 0.15)", borderRadius: 10, padding: "8px 10px", fontSize: 24 }}>{icon}</div>
        <div>
          <h1 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 900, letterSpacing: "0.3px" }}>{label}</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 2 }}>{description}</p>
        </div>
        <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          📅 {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>
      <div style={{ padding: "24px 30px" }}>{children}</div>
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

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PROFIT / LOSS REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const PL_DATA = [
  { period: "Jan 2025", revenue: "₹4,20,000", expenses: "₹2,80,000", profit: "₹1,40,000", margin: "33.3%", growth: "+8%" },
  { period: "Feb 2025", revenue: "₹3,85,000", expenses: "₹2,60,000", profit: "₹1,25,000", margin: "32.5%", growth: "-10%" },
  { period: "Mar 2025", revenue: "₹5,10,000", expenses: "₹3,20,000", profit: "₹1,90,000", margin: "37.3%", growth: "+52%" },
  { period: "Apr 2025", revenue: "₹4,75,000", expenses: "₹3,00,000", profit: "₹1,75,000", margin: "36.8%", growth: "-8%" },
  { period: "May 2025", revenue: "₹5,40,000", expenses: "₹3,40,000", profit: "₹2,00,000", margin: "37.0%", growth: "+14%" },
  { period: "Jun 2025", revenue: "₹6,20,000", expenses: "₹3,80,000", profit: "₹2,40,000", margin: "38.7%", growth: "+20%" },
];

export function ProfitLossReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Period", "Revenue", "Expenses", "Net Profit", "Margin %", "Growth"];
  const filtered = PL_DATA.filter((r) => {
    if (filters.Location && !["HQ", "All"].includes(filters.Location)) return false;
    return true;
  });
  const pageData = filtered.slice((page - 1) * PER, page * PER);
  const totalRevenue = "₹29,50,000";
  const totalProfit = "₹10,70,000";

  return (
    <ReportPage icon="📈" label="Profit / Loss Report" description="Net profit and loss across all business periods">
      <KpiCards cards={[
        { label: "Total Revenue", value: totalRevenue, accent: true, large: true },
        { label: "Total Expenses", value: "₹18,80,000", color: C.red },
        { label: "Net Profit", value: totalProfit, color: C.green1 },
        { label: "Avg Margin", value: "36.1%", color: C.blue },
        { label: "Best Month", value: "Jun 2025", sub: "₹2,40,000 profit" },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "profit-loss")} onExportExcel={() => exportCSV(COLS, filtered, "profit-loss")} onPrint={() => printTable(COLS, filtered, "Profit / Loss Report")} />
      <FilterBar fields={["Date Range", "Location", "User"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={pageData} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PURCHASE & SALE
// ═══════════════════════════════════════════════════════════════════════════════
const PS_DATA = [
  { product: "Widget A", category: "Electronics", purchased: "₹80,000", sold: "₹1,10,000", gain: "₹30,000", gainPct: "+37.5%", qtySold: "320" },
  { product: "Widget B", category: "Hardware", purchased: "₹55,000", sold: "₹74,000", gain: "₹19,000", gainPct: "+34.5%", qtySold: "210" },
  { product: "Widget C", category: "Electronics", purchased: "₹1,20,000", sold: "₹1,65,000", gain: "₹45,000", gainPct: "+37.5%", qtySold: "540" },
  { product: "Widget D", category: "Accessories", purchased: "₹40,000", sold: "₹58,000", gain: "₹18,000", gainPct: "+45.0%", qtySold: "180" },
  { product: "Widget E", category: "Hardware", purchased: "₹95,000", sold: "₹1,22,000", gain: "₹27,000", gainPct: "+28.4%", qtySold: "410" },
  { product: "Widget F", category: "Electronics", purchased: "₹70,000", sold: "₹88,000", gain: "₹18,000", gainPct: "+25.7%", qtySold: "290" },
];

export function PurchaseSaleReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Product", "Category", "Purchased", "Sold", "Gain", "Gain %", "Qty Sold"];
  const filtered = PS_DATA.filter((r) => {
    if (filters.Product && !r.product.toLowerCase().includes(filters.Product.toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="🛒" label="Purchase & Sale Report" description="Comparative purchase vs sale summary by product">
      <KpiCards cards={[
        { label: "Total Purchased", value: "₹4,60,000", color: C.red },
        { label: "Total Sold", value: "₹6,17,000", accent: true },
        { label: "Total Gain", value: "₹1,57,000", color: C.green1 },
        { label: "Avg Margin", value: "34.1%", color: C.blue },
        { label: "Products", value: filtered.length.toString(), sub: "in this report" },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "purchase-sale")} onExportExcel={() => exportCSV(COLS, filtered, "purchase-sale")} onPrint={() => printTable(COLS, filtered, "Purchase & Sale Report")} />
      <FilterBar fields={["Date Range", "Location", "Product"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TAX REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const TAX_DATA = [
  { period: "Q1 2025", taxable: "₹3,00,000", cgst: "₹27,000", sgst: "₹27,000", igst: "₹0", total: "₹54,000", filed: "Yes" },
  { period: "Q2 2025", taxable: "₹3,80,000", cgst: "₹34,200", sgst: "₹34,200", igst: "₹0", total: "₹68,400", filed: "Yes" },
  { period: "Q3 2025", taxable: "₹4,20,000", cgst: "₹37,800", sgst: "₹37,800", igst: "₹5,000", total: "₹80,600", filed: "No" },
  { period: "Q4 2025", taxable: "₹5,10,000", cgst: "₹45,900", sgst: "₹45,900", igst: "₹8,000", total: "₹99,800", filed: "No" },
];

export function TaxReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Period", "Taxable Amount", "CGST", "SGST", "IGST", "Total Tax", "Filed"];
  return (
    <ReportPage icon="🧾" label="Tax Report" description="GST / tax collected and paid by quarter">
      <KpiCards cards={[
        { label: "Total Taxable", value: "₹16,10,000", accent: true },
        { label: "Total CGST", value: "₹1,44,900", color: C.blue },
        { label: "Total SGST", value: "₹1,44,900", color: C.purple },
        { label: "Total IGST", value: "₹13,000", color: C.amber },
        { label: "Total Tax", value: "₹3,02,800", color: C.red },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, TAX_DATA, "tax-report")} onExportExcel={() => exportCSV(COLS, TAX_DATA, "tax-report")} onPrint={() => printTable(COLS, TAX_DATA, "Tax Report")} />
      <FilterBar fields={["Date Range", "Tax Group", "Location"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={TAX_DATA.slice((page - 1) * PER, page * PER)} />
      <Pagination total={TAX_DATA.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SUPPLIER & CUSTOMER REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const SC_DATA = [
  { name: "Acme Suppliers", type: "Supplier", total: "₹2,10,000", settled: "₹1,90,000", due: "₹20,000", status: "Partial" },
  { name: "Beta Corp", type: "Customer", total: "₹1,50,000", settled: "₹1,50,000", due: "₹0", status: "Paid" },
  { name: "Zeta Traders", type: "Supplier", total: "₹90,000", settled: "₹90,000", due: "₹0", status: "Paid" },
  { name: "Delta Stores", type: "Customer", total: "₹2,40,000", settled: "₹1,80,000", due: "₹60,000", status: "Partial" },
  { name: "Omega Parts", type: "Supplier", total: "₹3,20,000", settled: "₹2,80,000", due: "₹40,000", status: "Partial" },
  { name: "Alpha Retail", type: "Customer", total: "₹1,10,000", settled: "₹1,10,000", due: "₹0", status: "Received" },
];

export function SupplierCustomerReport() {
  const [filters, setFilters] = useState({});
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Name", "Type", "Total", "Settled", "Due", "Status"];
  const filtered = SC_DATA.filter((r) => {
    if (typeFilter !== "All" && r.type !== typeFilter) return false;
    if (filters["Contact Name"] && !r.name.toLowerCase().includes(filters["Contact Name"].toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="🤝" label="Supplier & Customer Report" description="Ledger-wise summary for suppliers and customers">
      <KpiCards cards={[
        { label: "Total Suppliers", value: SC_DATA.filter((r) => r.type === "Supplier").length.toString(), color: C.blue },
        { label: "Total Customers", value: SC_DATA.filter((r) => r.type === "Customer").length.toString(), color: C.purple },
        { label: "Total Business", value: "₹10,20,000", accent: true },
        { label: "Total Due", value: "₹1,20,000", color: C.red },
        { label: "Settled", value: "₹9,00,000", color: C.green1 },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "supplier-customer")} onExportExcel={() => exportCSV(COLS, filtered, "supplier-customer")} onPrint={() => printTable(COLS, filtered, "Supplier & Customer Report")}
        extraBtns={
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Supplier", "Customer"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{ border: `1px solid ${C.border}`, background: typeFilter === t ? C.green1 : "#fff", color: typeFilter === t ? "#fff" : C.muted, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        }
      />
      <FilterBar fields={["Date Range", "Contact Type", "Contact Name"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CUSTOMER GROUPS
// ═══════════════════════════════════════════════════════════════════════════════
const CG_DATA = [
  { group: "Retail", customers: "124", totalSales: "₹6,80,000", avgPerCustomer: "₹5,484", topProduct: "Widget A", growth: "+14%" },
  { group: "Wholesale", customers: "38", totalSales: "₹14,20,000", avgPerCustomer: "₹37,368", topProduct: "Widget C", growth: "+22%" },
  { group: "Online", customers: "210", totalSales: "₹4,90,000", avgPerCustomer: "₹2,333", topProduct: "Widget B", growth: "+9%" },
  { group: "Corporate", customers: "15", totalSales: "₹8,50,000", avgPerCustomer: "₹56,667", topProduct: "Widget C", growth: "+31%" },
  { group: "Distributor", customers: "8", totalSales: "₹11,20,000", avgPerCustomer: "₹1,40,000", topProduct: "Widget A", growth: "+18%" },
];

export function CustomerGroupsReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Group", "Customers", "Total Sales", "Avg / Customer", "Top Product", "Growth"];
  const maxSales = 14200000;
  return (
    <ReportPage icon="👥" label="Customer Groups Report" description="Sales performance broken down by customer group">
      <KpiCards cards={[
        { label: "Total Groups", value: CG_DATA.length.toString() },
        { label: "Total Customers", value: "395", color: C.blue },
        { label: "Total Sales", value: "₹45,60,000", accent: true },
        { label: "Best Group", value: "Wholesale", sub: "₹14,20,000" },
        { label: "Fastest Growth", value: "Corporate", sub: "+31%" },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, CG_DATA, "customer-groups")} onExportExcel={() => exportCSV(COLS, CG_DATA, "customer-groups")} onPrint={() => printTable(COLS, CG_DATA, "Customer Groups Report")} />
      <FilterBar fields={["Date Range", "Customer Group"]} filters={filters} onChange={handle} onRun={() => {}} />
      {/* Visual comparison */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>📊 Sales by Group</div>
        {CG_DATA.map((r) => (
          <div key={r.group} style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.group}</span>
            <MiniBar value={parseInt(r.totalSales.replace(/[^0-9]/g, ""))} max={maxSales} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.green1, textAlign: "right" }}>{r.totalSales}</span>
          </div>
        ))}
      </div>
      <DataTable cols={COLS} data={CG_DATA.slice((page - 1) * PER, page * PER)} />
      <Pagination total={CG_DATA.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. STOCK REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const STOCK_DATA = [
  { product: "Widget A", sku: "WA-001", category: "Electronics", location: "Warehouse 1", qty: "320", reorder: "50", stockValue: "₹64,000", status: "In Stock" },
  { product: "Widget B", sku: "WB-002", category: "Hardware", location: "Warehouse 2", qty: "210", reorder: "30", stockValue: "₹42,000", status: "In Stock" },
  { product: "Widget C", sku: "WC-003", category: "Electronics", location: "Warehouse 1", qty: "12", reorder: "50", stockValue: "₹2,400", status: "Low Stock" },
  { product: "Widget D", sku: "WD-004", category: "Accessories", location: "Warehouse 3", qty: "540", reorder: "100", stockValue: "₹1,08,000", status: "In Stock" },
  { product: "Widget E", sku: "WE-005", category: "Hardware", location: "Warehouse 2", qty: "0", reorder: "20", stockValue: "₹0", status: "Out of Stock" },
  { product: "Widget F", sku: "WF-006", category: "Electronics", location: "Warehouse 1", qty: "88", reorder: "50", stockValue: "₹17,600", status: "In Stock" },
];

export function StockReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Product", "SKU", "Category", "Location", "Qty", "Reorder Pt", "Stock Value", "Status"];
  const filtered = STOCK_DATA.filter((r) => {
    if (filters.Location && !r.location.toLowerCase().includes(filters.Location.toLowerCase())) return false;
    if (filters.Category && !r.category.toLowerCase().includes(filters.Category.toLowerCase())) return false;
    return true;
  });
  const lowStock = STOCK_DATA.filter((r) => parseInt(r.qty) < parseInt(r.reorder)).length;
  return (
    <ReportPage icon="📦" label="Stock Report" description="Current stock levels across all locations">
      <KpiCards cards={[
        { label: "Total SKUs", value: STOCK_DATA.length.toString() },
        { label: "Total Stock Value", value: "₹2,34,000", accent: true },
        { label: "Low / Out of Stock", value: lowStock.toString(), color: C.red },
        { label: "Warehouses", value: "3", color: C.blue },
        { label: "Healthy Stock", value: (STOCK_DATA.length - lowStock).toString(), color: C.green1 },
      ]} />
      {lowStock > 0 && (
        <div style={{ background: C.amberBg, border: `1px solid ${C.amber}30`, borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ color: C.amber, fontWeight: 700 }}>{lowStock} item(s) need restocking</span>
        </div>
      )}
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "stock-report")} onExportExcel={() => exportCSV(COLS, filtered, "stock-report")} onPrint={() => printTable(COLS, filtered, "Stock Report")} />
      <FilterBar fields={["Location", "Category", "Brand"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. STOCK ADJUSTMENT
// ═══════════════════════════════════════════════════════════════════════════════
const SA_DATA = [
  { date: "12-Mar-25", ref: "SA-0021", type: "Addition", product: "Widget A", sku: "WA-001", qty: "+50", value: "+₹10,000", reason: "Restock", by: "Admin" },
  { date: "18-Mar-25", ref: "SA-0022", type: "Deduction", product: "Widget B", sku: "WB-002", qty: "-15", value: "-₹3,000", reason: "Damaged", by: "Manager" },
  { date: "25-Mar-25", ref: "SA-0023", type: "Addition", product: "Widget C", sku: "WC-003", qty: "+100", value: "+₹20,000", reason: "Restock", by: "Admin" },
  { date: "01-Apr-25", ref: "SA-0024", type: "Deduction", product: "Widget D", sku: "WD-004", qty: "-30", value: "-₹6,000", reason: "Expired", by: "Manager" },
  { date: "08-Apr-25", ref: "SA-0025", type: "Addition", product: "Widget E", sku: "WE-005", qty: "+200", value: "+₹40,000", reason: "Restock", by: "Admin" },
];

export function StockAdjustmentReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Ref No", "Type", "Product", "SKU", "Qty", "Value", "Reason", "By"];
  return (
    <ReportPage icon="🔧" label="Stock Adjustment Report" description="All stock additions and deductions log">
      <KpiCards cards={[
        { label: "Total Adjustments", value: SA_DATA.length.toString() },
        { label: "Additions", value: SA_DATA.filter((r) => r.type === "Addition").length.toString(), color: C.green1 },
        { label: "Deductions", value: SA_DATA.filter((r) => r.type === "Deduction").length.toString(), color: C.red },
        { label: "Net Value Change", value: "+₹61,000", accent: true },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, SA_DATA, "stock-adjustment")} onExportExcel={() => exportCSV(COLS, SA_DATA, "stock-adjustment")} onPrint={() => printTable(COLS, SA_DATA, "Stock Adjustment Report")} />
      <FilterBar fields={["Date Range", "Location", "User"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={SA_DATA.slice((page - 1) * PER, page * PER)} />
      <Pagination total={SA_DATA.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. TRENDING PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════
const TREND_DATA = [
  { rank: "🥇 1", product: "Widget C", category: "Electronics", unitsSold: "540", revenue: "₹1,65,000", growth: "+12%", rating: "4.8/5" },
  { rank: "🥈 2", product: "Widget A", category: "Electronics", unitsSold: "320", revenue: "₹1,10,000", growth: "+8%", rating: "4.6/5" },
  { rank: "🥉 3", product: "Widget E", category: "Hardware", unitsSold: "290", revenue: "₹98,000", growth: "+15%", rating: "4.5/5" },
  { rank: "4", product: "Widget D", category: "Accessories", unitsSold: "210", revenue: "₹84,000", growth: "+3%", rating: "4.2/5" },
  { rank: "5", product: "Widget B", category: "Hardware", unitsSold: "180", revenue: "₹74,000", growth: "+3%", rating: "4.0/5" },
];

export function TrendingProductsReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Rank", "Product", "Category", "Units Sold", "Revenue", "Growth", "Rating"];
  const maxQty = 540;
  return (
    <ReportPage icon="🔥" label="Trending Products" description="Top-selling products ranked by volume and revenue">
      <KpiCards cards={[
        { label: "#1 Product", value: "Widget C", sub: "540 units sold", accent: true },
        { label: "Top Revenue", value: "₹1,65,000", color: C.green1 },
        { label: "Fastest Growing", value: "Widget E", sub: "+15% growth" },
        { label: "Top Rated", value: "Widget C", sub: "4.8/5 ⭐" },
        { label: "Total Tracked", value: TREND_DATA.length.toString(), sub: "products" },
      ]} />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>🔥 Units Sold Comparison</div>
        {TREND_DATA.map((r, i) => (
          <div key={r.product} style={{ display: "grid", gridTemplateColumns: "30px 120px 1fr 80px", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{r.product}</span>
            <MiniBar value={parseInt(r.unitsSold)} max={maxQty} color={i === 0 ? "#f9a825" : i === 1 ? "#90a4ae" : i === 2 ? "#a0522d" : C.green2} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textAlign: "right" }}>{r.unitsSold}</span>
          </div>
        ))}
      </div>
      <ActionBar onExportCSV={() => exportCSV(COLS, TREND_DATA, "trending-products")} onExportExcel={() => exportCSV(COLS, TREND_DATA, "trending-products")} onPrint={() => printTable(COLS, TREND_DATA, "Trending Products")} />
      <FilterBar fields={["Date Range", "Location", "Category"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={TREND_DATA.slice((page - 1) * PER, page * PER)} />
      <Pagination total={TREND_DATA.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ITEMS REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const ITEMS_DATA = [
  { product: "Widget A", sku: "WA-001", category: "Electronics", brand: "TechPro", unitsSold: "320", purchased: "400", balance: "80", purchasePrice: "₹200", sellPrice: "₹344", margin: "+72%" },
  { product: "Widget B", sku: "WB-002", category: "Hardware", brand: "BuildIt", unitsSold: "210", purchased: "250", balance: "40", purchasePrice: "₹262", sellPrice: "₹352", margin: "+34%" },
  { product: "Widget C", sku: "WC-003", category: "Electronics", brand: "TechPro", unitsSold: "540", purchased: "640", balance: "100", purchasePrice: "₹222", sellPrice: "₹306", margin: "+38%" },
  { product: "Widget D", sku: "WD-004", category: "Accessories", brand: "QuickFit", unitsSold: "180", purchased: "220", balance: "40", purchasePrice: "₹222", sellPrice: "₹322", margin: "+45%" },
  { product: "Widget E", sku: "WE-005", category: "Hardware", brand: "BuildIt", unitsSold: "290", purchased: "310", balance: "20", purchasePrice: "₹307", sellPrice: "₹338", margin: "+10%" },
];

export function ItemsReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Product", "SKU", "Category", "Brand", "Units Sold", "Purchased", "Balance", "Buy Price", "Sell Price", "Margin"];
  const filtered = ITEMS_DATA.filter((r) => {
    if (filters.Category && !r.category.toLowerCase().includes(filters.Category.toLowerCase())) return false;
    if (filters.Brand && !r.brand.toLowerCase().includes(filters.Brand.toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="🗂️" label="Items Report" description="Full product catalogue with sales and purchase totals">
      <KpiCards cards={[
        { label: "Total Products", value: ITEMS_DATA.length.toString() },
        { label: "Total Units Sold", value: "1,540", accent: true },
        { label: "Avg Margin", value: "+39.8%", color: C.green1 },
        { label: "Best Margin", value: "Widget A", sub: "+72%" },
        { label: "Categories", value: "3", color: C.blue },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "items-report")} onExportExcel={() => exportCSV(COLS, filtered, "items-report")} onPrint={() => printTable(COLS, filtered, "Items Report")} />
      <FilterBar fields={["Date Range", "Category", "Brand"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. PRODUCT PURCHASE REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const PP_DATA = [
  { date: "05-Feb-25", invoiceNo: "PO-001", product: "Widget A", sku: "WA-001", supplier: "Acme Suppliers", qty: "100", unitCost: "₹200", amount: "₹20,000", status: "Paid" },
  { date: "18-Feb-25", invoiceNo: "PO-002", product: "Widget C", sku: "WC-003", supplier: "Zeta Traders", qty: "200", unitCost: "₹222", amount: "₹44,400", status: "Paid" },
  { date: "02-Mar-25", invoiceNo: "PO-003", product: "Widget B", sku: "WB-002", supplier: "Acme Suppliers", qty: "80", unitCost: "₹262", amount: "₹20,960", status: "Paid" },
  { date: "15-Mar-25", invoiceNo: "PO-004", product: "Widget E", sku: "WE-005", supplier: "Omega Parts", qty: "150", unitCost: "₹307", amount: "₹46,050", status: "Paid" },
  { date: "20-Mar-25", invoiceNo: "PO-005", product: "Widget D", sku: "WD-004", supplier: "Zeta Traders", qty: "60", unitCost: "₹222", amount: "₹13,320", status: "Due" },
  { date: "28-Mar-25", invoiceNo: "PO-006", product: "Widget A", sku: "WA-001", supplier: "Acme Suppliers", qty: "120", unitCost: "₹200", amount: "₹24,000", status: "Paid" },
];

export function ProductPurchaseReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Invoice No", "Product", "SKU", "Supplier", "Qty", "Unit Cost", "Amount", "Status"];
  const filtered = PP_DATA.filter((r) => {
    if (filters.Product && !r.product.toLowerCase().includes(filters.Product.toLowerCase())) return false;
    if (filters.Supplier && !r.supplier.toLowerCase().includes(filters.Supplier.toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="🏭" label="Product Purchase Report" description="Purchase history per product with supplier breakdown">
      <KpiCards cards={[
        { label: "Total Purchases", value: PP_DATA.length.toString() },
        { label: "Total Amount", value: "₹1,68,730", accent: true },
        { label: "Paid", value: PP_DATA.filter((r) => r.status === "Paid").length.toString(), color: C.green1 },
        { label: "Due", value: PP_DATA.filter((r) => r.status === "Due").length.toString(), color: C.red },
        { label: "Total Qty", value: "710 units", color: C.blue },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "product-purchase")} onExportExcel={() => exportCSV(COLS, filtered, "product-purchase")} onPrint={() => printTable(COLS, filtered, "Product Purchase Report")} />
      <FilterBar fields={["Date Range", "Product", "Supplier"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. PRODUCT SELL REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const PSL_DATA = [
  { date: "10-Mar-25", invoiceNo: "INV-301", product: "Widget A", sku: "WA-001", customer: "Beta Corp", qty: "50", unitPrice: "₹344", amount: "₹17,200", status: "Paid" },
  { date: "22-Mar-25", invoiceNo: "INV-302", product: "Widget C", sku: "WC-003", customer: "Retail Walk-in", qty: "80", unitPrice: "₹306", amount: "₹24,480", status: "Paid" },
  { date: "28-Mar-25", invoiceNo: "INV-303", product: "Widget B", sku: "WB-002", customer: "Online Store", qty: "60", unitPrice: "₹352", amount: "₹21,120", status: "Received" },
  { date: "02-Apr-25", invoiceNo: "INV-304", product: "Widget E", sku: "WE-005", customer: "Delta Stores", qty: "100", unitPrice: "₹338", amount: "₹33,800", status: "Due" },
  { date: "08-Apr-25", invoiceNo: "INV-305", product: "Widget D", sku: "WD-004", customer: "Alpha Retail", qty: "45", unitPrice: "₹322", amount: "₹14,490", status: "Received" },
];

export function ProductSellReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Invoice No", "Product", "SKU", "Customer", "Qty", "Unit Price", "Amount", "Status"];
  const filtered = PSL_DATA.filter((r) => {
    if (filters.Product && !r.product.toLowerCase().includes(filters.Product.toLowerCase())) return false;
    if (filters.Customer && !r.customer.toLowerCase().includes(filters.Customer.toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="🛍️" label="Product Sell Report" description="Sales history per product with customer details">
      <KpiCards cards={[
        { label: "Total Orders", value: PSL_DATA.length.toString() },
        { label: "Total Revenue", value: "₹1,11,090", accent: true },
        { label: "Paid / Received", value: PSL_DATA.filter((r) => r.status !== "Due").length.toString(), color: C.green1 },
        { label: "Due", value: PSL_DATA.filter((r) => r.status === "Due").length.toString(), color: C.red },
        { label: "Total Units", value: "335", color: C.blue },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "product-sell")} onExportExcel={() => exportCSV(COLS, filtered, "product-sell")} onPrint={() => printTable(COLS, filtered, "Product Sell Report")} />
      <FilterBar fields={["Date Range", "Product", "Customer"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. PURCHASE PAYMENT REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const PPUR_DATA = [
  { date: "15-Mar-25", supplier: "Acme Suppliers", invoice: "PO-001", amount: "₹20,000", paid: "₹20,000", balance: "₹0", method: "Bank Transfer", status: "Paid" },
  { date: "20-Mar-25", supplier: "Zeta Traders", invoice: "PO-002", amount: "₹44,400", paid: "₹44,400", balance: "₹0", method: "Cheque", status: "Paid" },
  { date: "28-Mar-25", supplier: "Acme Suppliers", invoice: "PO-003", amount: "₹20,960", paid: "₹20,960", balance: "₹0", method: "UPI", status: "Paid" },
  { date: "01-Apr-25", supplier: "Omega Parts", invoice: "PO-004", amount: "₹46,050", paid: "₹30,000", balance: "₹16,050", method: "Bank Transfer", status: "Partial" },
  { date: "05-Apr-25", supplier: "Zeta Traders", invoice: "PO-005", amount: "₹13,320", paid: "₹0", balance: "₹13,320", method: "—", status: "Due" },
];

export function PurchasePaymentReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Supplier", "Invoice", "Invoice Amt", "Paid", "Balance", "Method", "Status"];
  const filtered = PPUR_DATA.filter((r) => {
    if (filters.Supplier && !r.supplier.toLowerCase().includes(filters.Supplier.toLowerCase())) return false;
    if (filters["Payment Method"] && !r.method.toLowerCase().includes(filters["Payment Method"].toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="💳" label="Purchase Payment Report" description="Payments made to suppliers with method breakdown">
      <KpiCards cards={[
        { label: "Total Invoices", value: PPUR_DATA.length.toString() },
        { label: "Total Billed", value: "₹1,44,730", color: C.text },
        { label: "Total Paid", value: "₹1,15,360", accent: true },
        { label: "Outstanding", value: "₹29,370", color: C.red },
        { label: "Fully Paid", value: PPUR_DATA.filter((r) => r.status === "Paid").length.toString(), color: C.green1 },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "purchase-payment")} onExportExcel={() => exportCSV(COLS, filtered, "purchase-payment")} onPrint={() => printTable(COLS, filtered, "Purchase Payment Report")} />
      <FilterBar fields={["Date Range", "Supplier", "Payment Method"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. SELL PAYMENT REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const SPAY_DATA = [
  { date: "12-Mar-25", customer: "Beta Corp", invoice: "INV-301", amount: "₹17,200", received: "₹17,200", balance: "₹0", method: "UPI", status: "Received" },
  { date: "25-Mar-25", customer: "Retail Walk-in", invoice: "INV-302", amount: "₹24,480", received: "₹24,480", balance: "₹0", method: "Cash", status: "Received" },
  { date: "30-Mar-25", customer: "Online Store", invoice: "INV-303", amount: "₹21,120", received: "₹21,120", balance: "₹0", method: "Bank Transfer", status: "Received" },
  { date: "05-Apr-25", customer: "Delta Stores", invoice: "INV-304", amount: "₹33,800", received: "₹20,000", balance: "₹13,800", method: "Cheque", status: "Partial" },
  { date: "10-Apr-25", customer: "Alpha Retail", invoice: "INV-305", amount: "₹14,490", received: "₹0", balance: "₹14,490", method: "—", status: "Due" },
];

export function SellPaymentReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Customer", "Invoice", "Invoice Amt", "Received", "Balance", "Method", "Status"];
  const filtered = SPAY_DATA.filter((r) => {
    if (filters.Customer && !r.customer.toLowerCase().includes(filters.Customer.toLowerCase())) return false;
    if (filters["Payment Method"] && !r.method.toLowerCase().includes(filters["Payment Method"].toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="💰" label="Sell Payment Report" description="Payments received from customers">
      <KpiCards cards={[
        { label: "Total Invoices", value: SPAY_DATA.length.toString() },
        { label: "Total Billed", value: "₹1,11,090", color: C.text },
        { label: "Total Received", value: "₹82,800", accent: true },
        { label: "Outstanding", value: "₹28,290", color: C.red },
        { label: "Fully Received", value: SPAY_DATA.filter((r) => r.status === "Received").length.toString(), color: C.green1 },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "sell-payment")} onExportExcel={() => exportCSV(COLS, filtered, "sell-payment")} onPrint={() => printTable(COLS, filtered, "Sell Payment Report")} />
      <FilterBar fields={["Date Range", "Customer", "Payment Method"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. EXPENSE REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const EXP_DATA = [
  { date: "05-Mar-25", ref: "EXP-001", category: "Rent", note: "Office Rent – March", location: "HQ", amount: "₹45,000", by: "Admin" },
  { date: "08-Mar-25", ref: "EXP-002", category: "Utilities", note: "Electricity Bill", location: "Warehouse 1", amount: "₹8,200", by: "Manager" },
  { date: "14-Mar-25", ref: "EXP-003", category: "Salaries", note: "March Salaries", location: "HQ", amount: "₹2,10,000", by: "Admin" },
  { date: "20-Mar-25", ref: "EXP-004", category: "Transport", note: "Delivery Charges", location: "Warehouse 2", amount: "₹12,400", by: "Manager" },
  { date: "25-Mar-25", ref: "EXP-005", category: "Marketing", note: "Social Media Ads", location: "HQ", amount: "₹18,000", by: "Admin" },
  { date: "30-Mar-25", ref: "EXP-006", category: "Utilities", note: "Internet & Phones", location: "HQ", amount: "₹6,500", by: "Admin" },
];

export function ExpenseReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Ref", "Category", "Note", "Location", "Amount", "By"];
  const cats = [...new Set(EXP_DATA.map((r) => r.category))];
  const catTotals = cats.map((c) => ({ cat: c, total: EXP_DATA.filter((r) => r.category === c).reduce((s, r) => s + parseInt(r.amount.replace(/[^0-9]/g, "")), 0) }));
  const maxCat = Math.max(...catTotals.map((c) => c.total));
  const filtered = EXP_DATA.filter((r) => {
    if (filters.Category && !r.category.toLowerCase().includes(filters.Category.toLowerCase())) return false;
    if (filters.Location && !r.location.toLowerCase().includes(filters.Location.toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="📉" label="Expense Report" description="All expenses categorised by type and location">
      <KpiCards cards={[
        { label: "Total Expenses", value: "₹3,00,100", accent: true },
        { label: "Entries", value: EXP_DATA.length.toString() },
        { label: "Largest", value: "Salaries", sub: "₹2,10,000" },
        { label: "Locations", value: "3", color: C.blue },
        { label: "This Month", value: "₹3,00,100", color: C.red },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>By Category</div>
          {catTotals.map((c) => (
            <div key={c.cat} style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{c.cat}</span>
              <MiniBar value={c.total} max={maxCat} color="#e57373" />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.red, textAlign: "right" }}>₹{c.total.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>Recent Entries</div>
          {EXP_DATA.slice(0, 4).map((r) => (
            <div key={r.ref} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
              <div><span style={{ fontWeight: 700, color: C.text }}>{r.category}</span><br /><span style={{ color: C.muted }}>{r.note}</span></div>
              <span style={{ fontWeight: 800, color: C.red }}>{r.amount}</span>
            </div>
          ))}
        </div>
      </div>
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "expense-report")} onExportExcel={() => exportCSV(COLS, filtered, "expense-report")} onPrint={() => printTable(COLS, filtered, "Expense Report")} />
      <FilterBar fields={["Date Range", "Category", "Location"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. REGISTER REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const REG_DATA = [
  { date: "01-Mar-25", shift: "Morning", user: "Cashier 1", location: "HQ", openingBal: "₹5,000", cashIn: "₹18,400", cashOut: "₹3,200", closingBal: "₹20,200", totalSales: "₹13,400" },
  { date: "01-Mar-25", shift: "Evening", user: "Cashier 2", location: "HQ", openingBal: "₹5,000", cashIn: "₹22,700", cashOut: "₹4,000", closingBal: "₹23,700", totalSales: "₹17,700" },
  { date: "02-Mar-25", shift: "Morning", user: "Cashier 1", location: "Branch 1", openingBal: "₹5,000", cashIn: "₹19,800", cashOut: "₹2,800", closingBal: "₹22,000", totalSales: "₹14,800" },
  { date: "02-Mar-25", shift: "Evening", user: "Cashier 3", location: "Branch 1", openingBal: "₹5,000", cashIn: "₹16,200", cashOut: "₹3,100", closingBal: "₹18,100", totalSales: "₹11,200" },
];

export function RegisterReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Date", "Shift", "User", "Location", "Opening Bal", "Cash In", "Cash Out", "Closing Bal", "Total Sales"];
  const filtered = REG_DATA.filter((r) => {
    if (filters.Location && !r.location.toLowerCase().includes(filters.Location.toLowerCase())) return false;
    if (filters.User && !r.user.toLowerCase().includes(filters.User.toLowerCase())) return false;
    return true;
  });
  return (
    <ReportPage icon="🖨️" label="Register Report" description="Cash register open/close summary per shift">
      <KpiCards cards={[
        { label: "Total Shifts", value: REG_DATA.length.toString() },
        { label: "Total Sales", value: "₹57,100", accent: true },
        { label: "Total Cash In", value: "₹77,100", color: C.green1 },
        { label: "Total Cash Out", value: "₹13,100", color: C.red },
        { label: "Cashiers", value: "3", color: C.blue },
      ]} />
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "register-report")} onExportExcel={() => exportCSV(COLS, filtered, "register-report")} onPrint={() => printTable(COLS, filtered, "Register Report")} />
      <FilterBar fields={["Date Range", "Location", "User"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. SALES REPRESENTATIVE
// ═══════════════════════════════════════════════════════════════════════════════
const SR_DATA = [
  { rep: "Raj Kumar", territory: "North", totalSales: "₹3,40,000", target: "₹3,00,000", achievement: "113%", commission: "₹17,000", orders: "28", avgOrder: "₹12,143", growth: "+18%" },
  { rep: "Priya Singh", territory: "South", totalSales: "₹2,90,000", target: "₹3,20,000", achievement: "91%", commission: "₹14,500", orders: "22", avgOrder: "₹13,182", growth: "+5%" },
  { rep: "Arjun Mehta", territory: "West", totalSales: "₹4,10,000", target: "₹3,50,000", achievement: "117%", commission: "₹20,500", orders: "35", avgOrder: "₹11,714", growth: "+24%" },
  { rep: "Sneha Nair", territory: "East", totalSales: "₹2,60,000", target: "₹2,80,000", achievement: "93%", commission: "₹13,000", orders: "20", avgOrder: "₹13,000", growth: "+2%" },
  { rep: "Vikram Rao", territory: "Central", totalSales: "₹3,80,000", target: "₹3,50,000", achievement: "109%", commission: "₹19,000", orders: "31", avgOrder: "₹12,258", growth: "+11%" },
];

export function SalesRepresentativeReport() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1); const PER = 5;
  const handle = (k, v) => { k === "__reset__" ? setFilters({}) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Representative", "Territory", "Total Sales", "Target", "Achievement", "Commission", "Orders", "Avg Order", "Growth"];
  const maxSales = 4100000;
  return (
    <ReportPage icon="🧑‍💼" label="Sales Representative Report" description="Performance metrics per sales representative">
      <KpiCards cards={[
        { label: "Top Performer", value: "Arjun Mehta", sub: "₹4,10,000 | 117%", accent: true },
        { label: "Team Revenue", value: "₹16,80,000", color: C.green1 },
        { label: "Total Commission", value: "₹84,000", color: C.blue },
        { label: "Over Target", value: SR_DATA.filter((r) => parseInt(r.achievement) > 100).length.toString(), color: C.green1, sub: "reps" },
        { label: "Below Target", value: SR_DATA.filter((r) => parseInt(r.achievement) < 100).length.toString(), color: C.red, sub: "reps" },
      ]} />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 12 }}>🏆 Performance vs Target</div>
        {SR_DATA.map((r) => {
          const pct = parseInt(r.achievement);
          return (
            <div key={r.rep} style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px 60px", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.rep}</span>
              <div style={{ position: "relative" }}>
                <div style={{ background: C.border, borderRadius: 4, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? C.green2 : "#ef5350", height: "100%", borderRadius: 4 }} />
                </div>
                {pct > 100 && <div style={{ position: "absolute", left: "100%", top: 0, width: `${Math.min(pct - 100, 30)}%`, height: "100%", background: "#a5d6a7", borderRadius: "0 4px 4px 0" }} />}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? C.green1 : C.red, textAlign: "center" }}>{r.achievement}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{r.growth}</span>
            </div>
          );
        })}
      </div>
      <ActionBar onExportCSV={() => exportCSV(COLS, SR_DATA, "sales-rep")} onExportExcel={() => exportCSV(COLS, SR_DATA, "sales-rep")} onPrint={() => printTable(COLS, SR_DATA, "Sales Representative Report")} />
      <FilterBar fields={["Date Range", "Sales Rep", "Location"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={SR_DATA.slice((page - 1) * PER, page * PER)} />
      <Pagination total={SR_DATA.length} page={page} perPage={PER} onPage={setPage} />
    </ReportPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 17. ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════════════════════
const ACT_DATA = [
  { time: "09:12 AM", date: "07-Jun-25", user: "Admin", role: "Administrator", module: "Purchases", action: "Created PO-006", detail: "Widget A × 120 from Acme Suppliers", ip: "192.168.1.1" },
  { time: "10:23 AM", date: "07-Jun-25", user: "Admin", role: "Administrator", module: "Purchases", action: "Approved PO-004", detail: "Omega Parts payment confirmed", ip: "192.168.1.1" },
  { time: "11:05 AM", date: "07-Jun-25", user: "Manager", role: "Branch Manager", module: "Stock", action: "Adjusted SA-0025", detail: "Widget E +200 units – Restock", ip: "192.168.1.4" },
  { time: "12:30 PM", date: "07-Jun-25", user: "Cashier 1", role: "Cashier", module: "POS", action: "Completed Sale INV-305", detail: "Alpha Retail – ₹14,490", ip: "192.168.1.9" },
  { time: "02:14 PM", date: "07-Jun-25", user: "Cashier 2", role: "Cashier", module: "POS", action: "Completed Sale INV-302", detail: "Retail Walk-in – ₹24,480", ip: "192.168.1.11" },
  { time: "03:40 PM", date: "07-Jun-25", user: "Admin", role: "Administrator", module: "Users", action: "Updated Role: Manager", detail: "Priya Singh role changed", ip: "192.168.1.1" },
  { time: "04:15 PM", date: "07-Jun-25", user: "Manager", role: "Branch Manager", module: "Expenses", action: "Added EXP-006", detail: "Internet & Phones – ₹6,500", ip: "192.168.1.4" },
  { time: "05:00 PM", date: "07-Jun-25", user: "Admin", role: "Administrator", module: "Reports", action: "Exported Stock Report", detail: "CSV download – 6 items", ip: "192.168.1.1" },
];

const MODULE_COLORS = { Purchases: C.blueBg, Stock: C.green3, POS: C.purpleBg, Users: C.amberBg, Expenses: C.redBg, Reports: "#f3e5f5" };
const MODULE_TEXT = { Purchases: C.blue, Stock: C.green1, POS: C.purple, Users: C.amber, Expenses: C.red, Reports: C.purple };

export function ActivityLogReport() {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); const PER = 6;
  const handle = (k, v) => { k === "__reset__" ? (setFilters({}), setSearch("")) : setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const COLS = ["Time", "Date", "User", "Role", "Module", "Action", "Detail", "IP Address"];

  const filtered = ACT_DATA.filter((r) => {
    if (filters.User && !r.user.toLowerCase().includes(filters.User.toLowerCase())) return false;
    if (filters.Module && !r.module.toLowerCase().includes(filters.Module.toLowerCase())) return false;
    if (search && !Object.values(r).some((v) => v.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <ReportPage icon="📋" label="Activity Log" description="Full audit trail of all user actions in the system">
      <KpiCards cards={[
        { label: "Total Events", value: ACT_DATA.length.toString() },
        { label: "Today", value: ACT_DATA.length.toString(), accent: true },
        { label: "Users Active", value: "4", color: C.green1 },
        { label: "Modules", value: [...new Set(ACT_DATA.map((r) => r.module))].length.toString(), color: C.blue },
        { label: "Admin Actions", value: ACT_DATA.filter((r) => r.role === "Administrator").length.toString(), color: C.purple },
      ]} />
      {/* Live search */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 14 }}>🔍</span>
          <input placeholder="Search all fields..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputSt, width: "100%", paddingLeft: 34, fontSize: 13, boxSizing: "border-box" }} />
        </div>
      </div>
      {/* Timeline view */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.text, marginBottom: 14 }}>🕐 Activity Timeline</div>
        {filtered.slice(0, 5).map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 20 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: MODULE_TEXT[r.module] || C.green2, border: `2px solid ${C.card}`, boxShadow: `0 0 0 2px ${MODULE_TEXT[r.module] || C.green2}`, flexShrink: 0, marginTop: 3 }} />
              {i < 4 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{r.time}</span>
                <span style={{ background: MODULE_COLORS[r.module] || "#f0f4f1", color: MODULE_TEXT[r.module] || C.muted, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{r.module}</span>
                <span style={{ fontSize: 11, color: C.muted }}>by <b style={{ color: C.text }}>{r.user}</b></span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.action}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{r.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <ActionBar onExportCSV={() => exportCSV(COLS, filtered, "activity-log")} onExportExcel={() => exportCSV(COLS, filtered, "activity-log")} onPrint={() => printTable(COLS, filtered, "Activity Log")} />
      <FilterBar fields={["Date Range", "User", "Module"]} filters={filters} onChange={handle} onRun={() => {}} />
      <DataTable cols={COLS} data={filtered.slice((page - 1) * PER, page * PER)} />
      <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage} />
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
      <Route path="sell-payment"         element={<SellPaymentReport />} />
      <Route path="expense"              element={<ExpenseReport />} />
      <Route path="register"             element={<RegisterReport />} />
      <Route path="sales-representative" element={<SalesRepresentativeReport />} />
      <Route path="activity-log"         element={<ActivityLogReport />} />
      <Route path="*"                    element={<Navigate to="profit-loss" replace />} />
    </Routes>
  );
}
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import expensesAPI from "../api/expensesAPI";
import * as settingsAPI from "../api/settingsAPI";

/* ─── shared design tokens ─────────────────────────────── */
const T = {
  bg: "#f0f4f1",
  surface: "#ffffff",
  border: "#e0e8e2",
  primary: "#1a7a4a",
  primaryDark: "#145c38",
  accent: "#2ecc71",
  textMain: "#1a2e22",
  textSub: "#5a7566",
  textMuted: "#8fa89a",
  danger: "#e53e3e",
  warn: "#dd6b20",
  info: "#2b6cb0",
};

/* page now uses a fixed viewport-height flex column instead of
   "scroll the whole page" — only the table body scrolls. */
const styles = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: T.bg,
    height: "calc(100vh - 60px)", // assumes 60px TopHeader, matches AppLayout
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    color: T.textMain,
    overflowX: "hidden", // ← page itself never scrolls sideways
    overflowY: "hidden",
    boxSizing: "border-box",
  },
  card: {
    background: T.surface,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 5,
    background: T.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    padding: "16px 24px 10px",
    flexShrink: 0,
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  pageTitle: { fontSize: 22, fontWeight: 700, color: T.textMain, margin: 0 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 12px",
    background: "#f6faf7",
    color: T.textSub,
    fontWeight: 600,
    fontSize: 12,
    borderBottom: `1px solid ${T.border}`,
    textAlign: "left",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  td: {
    padding: "9px 12px",
    borderBottom: `1px solid ${T.border}`,
    color: T.textMain,
    fontSize: 13,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  btnSave: {
    background: "linear-gradient(135deg, #1a7a4a 0%, #25a05f 60%, #2ecc71 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 14px rgba(26,122,74,0.35)",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #1a7a4a 0%, #2ecc71 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 3px 10px rgba(26,122,74,0.3)",
  },
  btnSecondary: {
    background: T.surface,
    color: T.textMain,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  input: {
    width: "100%",
    padding: "8px 11px",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: T.textMain,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  label: { fontSize: 12, fontWeight: 600, color: T.textSub, display: "block", marginBottom: 4 },
  formGroup: { marginBottom: 14 },
  select: {
    width: "100%",
    padding: "8px 11px",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: T.textMain,
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  },
  exportBtn: (color) => ({
    background: color || "#f6faf7",
    color: color ? "#fff" : T.textSub,
    border: color ? "none" : `1px solid ${T.border}`,
    borderRadius: 7,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
  }),
};

const money = (n) => `₹${parseFloat(n || 0).toFixed(2)}`;

/* ─── Export toolbar (reusable, compact, real CSV/print) ────── */
function ExportBar({ rows, columns, filename, onSearch, search }) {
  const toCSV = () => {
    const header = columns.map((c) => c.label).join(",");
    const body = rows
      .map((r) => columns.map((c) => `"${(c.value(r) ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: "flex", gap: 8, flexWrap: "wrap", padding: "10px 16px",
        borderBottom: `1px solid ${T.border}`, alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button style={styles.exportBtn("#217a48")} onClick={toCSV}>📊 Export CSV</button>
        <button style={styles.exportBtn("#1d6a3a")} onClick={toCSV}>📗 Export Excel</button>
        <button style={styles.exportBtn()} onClick={() => window.print()}>🖨️ Print</button>
        <button style={styles.exportBtn("#b91c1c")} onClick={() => window.print()}>📄 Export PDF</button>
      </div>
      <input
        placeholder="Search ..."
        style={{ ...styles.input, width: 180 }}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

/* ─── Typable + searchable dropdown (category / sub-category) ──
   - Click or focus → shows full list (like img 1)
   - Type → filters the list live
   - Typing something not in the list shows a "+ Create" row,
     so brand-new categories get added on save (no separate modal)
─────────────────────────────────────────────────────────────── */
function Combobox({ label, value, onChange, options, placeholder = "Please Select", disabled = false, required = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const boxRef = useRef();

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const exactMatch = options.some((o) => o.toLowerCase() === query.toLowerCase());

  const pick = (val) => {
    setQuery(val);
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      {label && <label style={styles.label}>{label}{required ? "*" : ""}</label>}
      <input
        style={{ ...styles.input, ...(disabled ? { background: "#f6faf7", cursor: "not-allowed" } : {}) }}
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
      />
      {open && !disabled && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
          background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8,
          marginTop: 4, maxHeight: 220, overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}>
          <div
            style={{ padding: "9px 14px", fontSize: 13, color: T.textMuted, cursor: "pointer", background: !query ? "#f0f4f1" : "transparent" }}
            onMouseDown={(e) => { e.preventDefault(); pick(""); }}
          >
            Please Select
          </div>
          {filtered.map((o) => (
            <div
              key={o}
              style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer" }}
              onMouseDown={(e) => { e.preventDefault(); pick(o); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4f1")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {o}
            </div>
          ))}
          {query && !exactMatch && (
            <div
              style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", color: T.primary, fontWeight: 600, borderTop: `1px solid ${T.border}` }}
              onMouseDown={(e) => { e.preventDefault(); pick(query); }}
            >
              + Create "{query}"
            </div>
          )}
          {filtered.length === 0 && !query && (
            <div style={{ padding: "9px 14px", fontSize: 12, color: T.textMuted }}>No categories yet — type to create one</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   1. LIST EXPENSES — compact single-screen layout
════════════════════════════════════════════════════════════ */
export function ListExpenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ total: 0, due: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef();
const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await expensesAPI.list({ limit: 500 });
      setExpenses(data.expenses || []);
      setTotals(data.totals || { total: 0, due: 0 });
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setSearch(val);
  };
const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await expensesAPI.remove(id);
      load();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete expense");
    }
  };
  const columns = [
    { label: "Date", value: (e) => e.expense_date },
    { label: "Reference No", value: (e) => e.expense_number },
    { label: "Category", value: (e) => e.category_name || e.category },
    { label: "Location", value: (e) => e.location },
    { label: "Payment Status", value: (e) => e.payment_status },
    { label: "Tax", value: (e) => e.tax_amount },
    { label: "Total amount", value: (e) => e.total_amount },
    { label: "Refund Amount", value: (e) => e.refund_amount || 0 },
    { label: "Net Expense", value: (e) => e.net_expense ?? (parseFloat(e.total_amount || 0) - parseFloat(e.refund_amount || 0)) },
    { label: "Payment due", value: (e) => e.payment_due },
    { label: "Expense for", value: (e) => e.expense_for },
    { label: "Note", value: (e) => e.description },
  ];

  const iconBtn = (bg, color) => ({
    width: 30, height: 30, borderRadius: 8, border: "none", background: bg, color,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 14,
  });

  const exportCSV = () => {
    const header = columns.map((c) => c.label).join(",");
    const body = expenses
      .map((r) => columns.map((c) => `"${(c.value(r) ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ── KPI metrics — derived live from the loaded rows, not the server totals,
  // so refunds/paid/due always reflect exactly what's on screen ──────────────
  const paidCount = expenses.filter((e) => e.payment_status === "paid").length;
  const dueCount = expenses.filter((e) => e.payment_status !== "paid").length;
  const refundRows = expenses.filter((e) => e.is_refund);
  const refundTotal = refundRows.reduce((s, e) => s + parseFloat(e.refund_amount || 0), 0);
  // "Amount paid" = total billed minus whatever is still due — correct even for partial payments
  const amountPaid = expenses.reduce((s, e) => s + (parseFloat(e.total_amount || 0) - parseFloat(e.payment_due || 0)), 0);
const totalDue = expenses.reduce((s, e) => s + parseFloat(e.payment_due || 0), 0);

  // ── Active KPI filter ──────────────────────────────────────────────────────
  // null = show all; "paid" | "partial" | "due" | "refund" = filtered
const [kpiFilter, setKpiFilter] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExpenses.map((e) => e.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected expense(s)?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => expensesAPI.remove(id)));
      setSelectedIds([]);
      load();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete selected expenses");
    }
  };

 const searchFiltered = search.trim() === "" ? expenses : expenses.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.expense_number || "").toLowerCase().includes(q) ||
      (e.category_name  || e.category || "").toLowerCase().includes(q) ||
      (e.sub_category_name || "").toLowerCase().includes(q) ||
      (e.expense_for    || "").toLowerCase().includes(q) ||
      (e.location       || "").toLowerCase().includes(q) ||
      (e.description    || "").toLowerCase().includes(q) ||
      (e.payment_status || "").toLowerCase().includes(q) ||
      (e.payment_method || "").toLowerCase().includes(q) ||
      String(e.total_amount || "").includes(q) ||
      String(e.tax_amount   || "").includes(q)
    );
  });

  const filteredExpenses = kpiFilter === null ? searchFiltered
    : kpiFilter === "refund"  ? searchFiltered.filter((e) => e.is_refund)
    : kpiFilter === "paid"    ? searchFiltered.filter((e) => e.payment_status === "paid")
    : kpiFilter === "due"     ? searchFiltered.filter((e) => e.payment_status === "due")
    : kpiFilter === "partial" ? searchFiltered.filter((e) => e.payment_status === "partial")
    : searchFiltered;

  // KPI-scoped totals (recalc on filteredExpenses so footer row matches)
  const filteredTotal  = filteredExpenses.reduce((s, e) => s + parseFloat(e.total_amount || 0), 0);
  const filteredDue    = filteredExpenses.reduce((s, e) => s + parseFloat(e.payment_due || 0), 0);
  const filteredPaid   = filteredExpenses.reduce((s, e) => s + (parseFloat(e.total_amount || 0) - parseFloat(e.payment_due || 0)), 0);

 const partialCount  = expenses.filter((e) => e.payment_status === "partial").length;
  const partialAmount = expenses
    .filter((e) => e.payment_status === "partial")
    .reduce((s, e) => s + parseFloat(e.total_amount || 0), 0);

  const kpiCards = [
    { label: "TOTAL EXPENSES", value: expenses.length,     sub: `${paidCount} paid`,               color: T.primary,  filter: null },
    { label: "TOTAL AMOUNT",   value: money(totals.total), sub: `${expenses.length} records`,       color: "#1a7a4a",  filter: null },
    { label: "AMOUNT PAID",    value: money(amountPaid),   sub: `${paidCount} paid`,                color: "#16a34a",  filter: "paid" },
    { label: "PARTIAL",        value: money(partialAmount),sub: `${partialCount} partial`,          color: "#7c3aed",  filter: "partial" },
    { label: "PAYMENT DUE",    value: money(totalDue),     sub: `${dueCount} unpaid`,               color: "#dd6b20",  filter: "due" },
    { label: "REFUNDS",        value: money(refundTotal),  sub: `${refundRows.length} refunded`,    color: "#dc2626",  filter: "refund" },
  ];

  return (
    <div style={styles.page}>
      {/* ── Sticky top bar: title + breadcrumb + primary action ── */}
      <div style={{ ...styles.topBar, overflowX: "hidden" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={styles.pageTitle}>Expenses</h1>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
            Home / Expenses / List
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", flex: "1 1 320px", minWidth: 0 }}>
          <button style={styles.btnPrimary} onClick={() => navigate("/import-expenses")}>⬆ Import expense</button>
          <button style={styles.btnPrimary} onClick={() => navigate("/expense-categories")}>🏷 Categories</button>
          <button style={styles.btnSave} onClick={() => navigate("/expenses/create")}>⊕ Add Expense</button>
        </div>
      </div>

      {/* ── KPI cards (Stock-Adjustment style) — fixed height, never affects scroll ── */}
      <div style={{
  display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12,
        margin: "0 20px 16px", flexShrink: 0,
      }}>
     {kpiCards.map(({ label, value, sub, color, filter }) => {
          const isActive = kpiFilter === filter;
          return (
            <div
              key={label}
              onClick={() => setKpiFilter(isActive ? null : filter)}
              style={{
                background: isActive ? color : T.surface,
                borderRadius: 10, padding: "16px 20px",
                boxShadow: isActive ? `0 4px 16px ${color}44` : "0 1px 4px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${color}`,
                minWidth: 0, cursor: filter !== null ? "pointer" : "default",
                transition: "all 0.18s ease",
                transform: isActive ? "translateY(-2px)" : "none",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: isActive ? "rgba(255,255,255,0.8)" : T.textMuted }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 2px", color: isActive ? "#fff" : T.textMain }}>{value}</div>
              <div style={{ fontSize: 12, color: isActive ? "rgba(255,255,255,0.75)" : T.textMuted }}>
         
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Card fills remaining height; only table body scrolls ── */}
      <div style={{ ...styles.card, flex: 1, display: "flex", flexDirection: "column", margin: "0 20px 16px", minHeight: 0, minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>All Expenses</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: T.textSub }}>Show</span>
              <select style={{ ...styles.select, width: 70, padding: "6px 8px" }}>
                <option>25</option><option>50</option><option>100</option>
              </select>
              <span style={{ fontSize: 13, color: T.textSub }}>entries</span>
           <button style={styles.exportBtn("#217a48")} onClick={exportCSV}>📊 Export CSV</button>
              <button style={styles.exportBtn()} onClick={() => window.print()}>🖨️ Print</button>
              {selectedIds.length > 0 && (
                <button style={styles.exportBtn("#e53e3e")} onClick={handleBulkDelete}>
                  🗑️ Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>
            <input
              placeholder="Search ref, category..."
              style={{ ...styles.input, width: 220 }}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: "10px 16px", color: T.danger, fontSize: 13, flexShrink: 0 }}>{error}</div>
        )}

        <div style={{ flex: 1, overflow: "auto", minHeight: 0, minWidth: 0, width: "100%" }}>
          <table style={styles.table}>
            <thead>
              <tr>
               <th style={{ ...styles.th, width: 36 }}>
                  <input
                    type="checkbox"
                    checked={filteredExpenses.length > 0 && selectedIds.length === filteredExpenses.length}
                    onChange={toggleSelectAll}
                    style={{ width: 15, height: 15, accentColor: T.primary, cursor: "pointer" }}
                  />
                </th>
                {["Date", "Reference No", "Category", "Sub category", "Location", "Payment Status", "Tax", "Total amount", "Refund", "Net Expense", "Payment due", "Expense for", "Note", "Action"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
             <tr><td colSpan={15} style={{ ...styles.td, textAlign: "center", padding: 30 }}>Loading...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={15} style={{ ...styles.td, textAlign: "center", padding: 30, color: T.textMuted }}>
                  {kpiFilter ? `No "${kpiFilter}" expenses found — click the card again to clear filter` : "No expenses found"}
                </td></tr>
) : filteredExpenses.map((e, i) => (                <tr key={e.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfb" }}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(e.id)}
                      onChange={() => toggleSelect(e.id)}
                      style={{ width: 15, height: 15, accentColor: T.primary, cursor: "pointer" }}
                    />
                  </td>
                  <td style={styles.td}>{e.expense_date ? new Date(e.expense_date).toLocaleDateString("en-GB") : "—"}</td>
                  <td style={styles.td}><strong>{e.expense_number}</strong></td>
                  <td style={styles.td}>{e.category_name || e.category || "—"}</td>
                  <td style={styles.td}>{e.sub_category_name || "—"}</td>
                  <td style={styles.td}>{e.location || "—"}</td>
                  <td style={styles.td}>
                    <span style={{
                      background: e.payment_status === "paid" ? "#dcfce7" : "#fef9c3",
                      color: e.payment_status === "paid" ? "#166534" : "#854d0e",
                      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                    }}>{e.payment_status || "due"}</span>
                  </td>
                  <td style={styles.td}>{money(e.tax_amount)}</td>
                  <td style={styles.td}><strong>{money(e.total_amount)}</strong></td>
                  <td style={styles.td}>
                    {e.is_refund ? <span style={{ color: T.danger, fontWeight: 600 }}>-{money(e.refund_amount)}</span> : <span style={{ color: T.textMuted }}>—</span>}
                  </td>
                  <td style={styles.td}>
                    <strong style={{ color: e.is_refund ? T.primary : T.textMain }}>
                      {money(e.net_expense ?? (parseFloat(e.total_amount || 0) - parseFloat(e.refund_amount || 0)))}
                    </strong>
                  </td>
                  <td style={styles.td}>{money(e.payment_due)}</td>
                  <td style={styles.td}>{e.expense_for || "—"}</td>
                  <td style={styles.td}>{e.description || ""}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button title="View" style={iconBtn("#eaf2ff", "#2563eb")} onClick={() => navigate(`/expenses/${e.id}`)}>👁</button>
                      <button title="Edit" style={iconBtn("#fff4e6", "#dd6b20")} onClick={() => navigate(`/expenses/${e.id}/edit`)}>✏️</button>
                      <button title="Delete" style={iconBtn("#fdecec", "#e53e3e")} onClick={() => handleDelete(e.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {expenses.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f0f4f1" }}>
                  <td colSpan={7} style={{ ...styles.td, fontWeight: 700, textAlign: "right" }}>Total:</td>
          <td style={{ ...styles.td, fontWeight: 700 }}>{money(filteredTotal)}</td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>{money(filteredDue)}</td> 
                  <td style={{ ...styles.td, fontWeight: 700, color: T.danger }}>-{money(refundTotal)}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: T.primary }}>{money(totals.total - refundTotal)}</td>
                  
                  <td colSpan={3} style={styles.td}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: T.textSub, flexShrink: 0, borderTop: `1px solid ${T.border}` }}>
      <span>
            Showing {filteredExpenses.length} of {expenses.length} entries
            {kpiFilter && <span style={{ marginLeft: 8, color: T.primary, fontWeight: 600, fontSize: 11 }}>
              [Filtered: {kpiFilter}]
            </span>}
          </span> 
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. ADD / EDIT EXPENSE
════════════════════════════════════════════════════════════ */
function ExpenseFormPage({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const readOnly = mode === "view";
  const [isRecurring, setIsRecurring] = useState(false);
  const [isRefund, setIsRefund] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(mode !== "create");
  const [error, setError] = useState("");
const [form, setForm] = useState({
    location: "",
    category: "", sub_category: "", expense_number: "",
    expense_date: new Date().toISOString().slice(0, 10),
    expense_for: "",
    tax_type: "amount",   // "amount" | "percent"
    tax_value: "",        // raw user input
    base_amount: "",      // before-tax amount user enters
    amount_paid: "",      // for partial
    payment_method: "Cash",
    description: "", payment_status: "due",
    attachment_url: "", attachment_name: "",
    refund_amount: "", refund_date: new Date().toISOString().slice(0, 10),
    refund_reason: "", refund_method: "Cash",
    interval: "", intervalUnit: "Days", repetitions: "",
  });
  const fileRef = useRef();

  // Derived: compute tax rupees and grand total from base_amount + tax_value + tax_type
  const baseAmt   = parseFloat(form.base_amount) || 0;
  const taxVal    = parseFloat(form.tax_value) || 0;
  const taxRupees = form.tax_type === "percent" ? +(baseAmt * taxVal / 100).toFixed(2) : taxVal;
  const grandTotal = +(baseAmt + taxRupees).toFixed(2);
  const balanceDue = form.payment_status === "partial"
    ? Math.max(0, grandTotal - (parseFloat(form.amount_paid) || 0))
    : form.payment_status === "paid" ? 0 : grandTotal;

const loadCategories = () => {
    expensesAPI.categories.list().then((d) => setCategories(d.categories || [])).catch(() => {});
  };
  useEffect(loadCategories, []);

  useEffect(() => {
    settingsAPI.getLocations().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setLocations(res.data);
        if (mode === "create") {
          const def = res.data.find((l) => l.is_default) || res.data[0];
          if (def) setForm((f) => ({ ...f, location: def.location_name }));
        }
      }
    }).catch(() => {});
  }, [mode]);

  // Edit / View → fetch the existing expense and prefill the form
  useEffect(() => {
    if (mode === "create" || !id) return;
    setLoadingRecord(true);
    expensesAPI.get(id)
      .then((d) => {
        const e = d.expense;
        if (!e) { setError("Expense not found"); return; }
        let dateStr = "";
        if (e.expense_date) {
          try { dateStr = new Date(e.expense_date).toISOString().slice(0, 10); }
          catch { dateStr = String(e.expense_date).slice(0, 10); }
        }
        let refundDateStr = "";
        if (e.refund_date) {
          try { refundDateStr = new Date(e.refund_date).toISOString().slice(0, 10); }
          catch { refundDateStr = String(e.refund_date).slice(0, 10); }
        }
        const storedTotal = parseFloat(e.total_amount) || 0;
        const storedTax   = parseFloat(e.tax_amount) || 0;
        // Derive amount_paid from total - payment_due (DB amount_paid column is unreliable)
        const storedDue   = parseFloat(e.payment_due) || 0;
       const derivedPaid = e.payment_status === "partial"
          ? Math.round((storedTotal - storedDue) * 100) / 100
          : "";
        setForm({
        location: e.location || "",
          category: e.category_name || "",
          sub_category: e.sub_category_name || "",
          expense_number: e.expense_number || "",
          expense_date: dateStr,
          expense_for: e.expense_for || "",
          tax_type: "amount",
          tax_value: String(storedTax),
          total_amount: String(storedTotal),
          amount_paid: derivedPaid === "" ? "" : String(Math.max(0, derivedPaid)),
          payment_method: e.payment_method || "Cash",
          description: e.description || "",
          payment_status: e.payment_status || "due",
          attachment_url: e.attachment_url || "",
          attachment_name: "",
          refund_amount: e.refund_amount ?? "",
          refund_date: refundDateStr || new Date().toISOString().slice(0, 10),
          refund_reason: e.refund_reason || "",
          refund_method: e.refund_method || "Cash",
          interval: e.recurring_interval || "",
          intervalUnit: e.recurring_interval_unit || "Days",
          repetitions: e.recurring_repetitions || "",
        });
        setIsRefund(!!e.is_refund);
        setIsRecurring(!!e.is_recurring);
      })
      .catch((err) => setError(err?.response?.data?.error || "Failed to load expense"))
      .finally(() => setLoadingRecord(false));
  }, [mode, id]);

  const topLevelNames = categories.filter((c) => !c.parent_id).map((c) => c.name);
  const parentCat = categories.find((c) => !c.parent_id && c.name.toLowerCase() === form.category.toLowerCase());
  const subNames = parentCat ? categories.filter((c) => c.parent_id === parentCat.id).map((c) => c.name) : [];

  // Resolve a typed category name to an id — creates it (and/or its parent) if it doesn't exist yet
  const resolveCategoryId = async (name, parentId = null) => {
    if (!name || !name.trim()) return null;
    const existing = categories.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase() && (c.parent_id || null) === (parentId || null)
    );
    if (existing) return existing.id;
    const { category } = await expensesAPI.categories.create({ name: name.trim(), parent_id: parentId });
    setCategories((prev) => [...prev, category]);
    return category.id;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!form.total_amount) { setError("Total amount is required"); return; }

    const totalVal = parseFloat(form.total_amount) || 0;
    const taxVal   = parseFloat(form.tax_value) || 0;
    const computedTax = form.tax_type === "percent"
      ? +(totalVal * taxVal / 100).toFixed(2)
      : taxVal;

    const amtPaid = parseFloat(form.amount_paid) || 0;

    if (form.payment_status === "partial") {
      if (!form.amount_paid || isNaN(amtPaid)) { setError("Amount paid is required for Partial status"); return; }
      if (amtPaid <= 0) { setError("Amount paid must be greater than 0"); return; }
      if (amtPaid >= totalVal) { setError("Amount paid must be less than total — use Paid instead"); return; }
    }
    if (isRefund) {
      const refundAmt = parseFloat(form.refund_amount);
      if (!form.refund_amount || isNaN(refundAmt)) { setError("Refund amount is required"); return; }
      if (refundAmt <= 0) { setError("Refund amount must be > 0"); return; }
      if (refundAmt > totalVal) { setError("Refund cannot exceed total expense"); return; }
    }

    // Correct payment_due calculation
    let finalAmountPaid = 0;
    let finalPaymentDue = totalVal;
    if (form.payment_status === "paid") {
      finalAmountPaid = totalVal;
      finalPaymentDue = 0;
    } else if (form.payment_status === "partial") {
      finalAmountPaid = amtPaid;
      finalPaymentDue = +(totalVal - amtPaid).toFixed(2);
    }

    setSaving(true);
    setError("");
    try {
      const category_id = await resolveCategoryId(form.category);
      const sub_category_id = form.sub_category ? await resolveCategoryId(form.sub_category, category_id) : null;

      const payload = {
        location: form.location,
        category_id,
        sub_category_id,
        category_name: form.category || null,
        sub_category_name: form.sub_category || null,
        expense_number: form.expense_number || null,
        expense_date: form.expense_date,
        expense_for: form.expense_for || null,
        tax_amount: computedTax,
        total_amount: totalVal,
        amount_paid: finalAmountPaid,
        payment_due: finalPaymentDue,
        payment_method: form.payment_method || "Cash",
        payment_status: form.payment_status,
        description: form.description || null,
        attachment_url: form.attachment_url || null,
        is_refund: isRefund,
        refund_amount: isRefund ? parseFloat(form.refund_amount) : null,
        refund_date: isRefund ? form.refund_date : null,
        refund_reason: isRefund ? (form.refund_reason || null) : null,
        refund_method: isRefund ? form.refund_method : null,
        is_recurring: isRecurring,
        recurring_interval: form.interval || null,
        recurring_interval_unit: form.intervalUnit,
        recurring_repetitions: form.repetitions || null,
        contact_id: null,
      };

      if (mode === "edit") await expensesAPI.update(id, payload);
      else await expensesAPI.create(payload);
      navigate("/expenses");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const pageHeading = mode === "edit" ? "Edit Expense" : mode === "view" ? "View Expense" : "Add Expense";

  if (loadingRecord) {
    return (
      <div style={{ ...styles.page, alignItems: "center", justifyContent: "center", display: "flex" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── Sticky header: title + breadcrumb stay fixed, never scroll ── */}
      <div style={{ ...styles.topBar, overflowX: "hidden" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={styles.pageTitle}>{pageHeading}</h1>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
            Home / Expenses / {pageHeading}
          </div>
        </div>
      </div>

      {/* ── Only this inner area scrolls — the page frame itself is static ── */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0, minWidth: 0, width: "100%", padding: "0 20px 20px", boxSizing: "border-box" }}>
        <form onSubmit={handleSave}>
        {error && <div style={{ color: T.danger, marginBottom: 12, fontSize: 13 }}>{error}</div>}

        <fieldset disabled={readOnly} style={{ border: "none", padding: 0, margin: 0 }}>
        <div style={{ ...styles.card, marginBottom: 16, padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
           <div>
  <label style={styles.label}>Business Location:*</label>
  <select style={styles.select} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required disabled={readOnly}>
    <option value="">{locations.length === 0 ? "Loading…" : "-- Select location --"}</option>
    {locations.map((l) => (
      <option key={l.id} value={l.location_name}>{l.location_name}</option>
    ))}
  </select>
</div>
            <div>
              <Combobox
                label="Expense Category:"
                value={form.category}
                onChange={(val) => setForm({ ...form, category: val, sub_category: "" })}
                options={topLevelNames}
                disabled={readOnly}
              />
            </div>
            <div>
              <Combobox
                label="Sub category:"
                value={form.sub_category}
                onChange={(val) => setForm({ ...form, sub_category: val })}
                options={subNames}
                disabled={readOnly || !form.category}
                placeholder={form.category ? "Please Select" : "Select a category first"}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Reference No:</label>
            <input style={styles.input} placeholder="Leave empty to autogenerate" value={form.expense_number} onChange={(e) => setForm({ ...form, expense_number: e.target.value })} disabled={mode !== "create"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={styles.label}>Date:*</label>
              <input type="date" style={styles.input} value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required />
            </div>
            <div>
              <label style={styles.label}>Expense for:</label>
              <input style={styles.input} placeholder="e.g. Admin" value={form.expense_for} onChange={(e) => setForm({ ...form, expense_for: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Payment Status:</label>
              <select style={styles.select} value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
                <option value="due">Due</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Tax + Total row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={styles.label}>Attach Document:</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  ref={fileRef}
                  type="file"
                  style={{ display: "none" }}
                  accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { alert("Max file size is 5MB"); return; }
                    const reader = new FileReader();
                    reader.onload = () => {
                      setForm((f) => ({ ...f, attachment_url: reader.result, attachment_name: file.name }));
                    };
                    reader.onerror = () => alert("Failed to read file");
                    reader.readAsDataURL(file);
                  }}
                />
                <button type="button" style={{ ...styles.btnPrimary, padding: "8px 12px" }} onClick={() => fileRef.current.click()} disabled={readOnly}>📁 Browse..</button>
                {form.attachment_name && <span style={{ fontSize: 12, color: T.textSub }}>{form.attachment_name}</span>}
                {!form.attachment_name && form.attachment_url && (
                  <a href={form.attachment_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.primary }}>📎 View attachment</a>
                )}
              </div>
              <span style={{ fontSize: 11, color: T.textMuted }}>Max 5MB — .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</span>
            </div>

            {/* Tax — toggle between fixed amount and percentage */}
            <div>
              <label style={styles.label}>
                Tax:
                <span style={{ marginLeft: 10, display: "inline-flex", gap: 0, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden", verticalAlign: "middle" }}>
                  {["amount", "percent"].map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => setForm((f) => ({ ...f, tax_type: t, tax_value: "" }))}
                      style={{
                        padding: "2px 10px", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                        background: form.tax_type === t ? T.primary : "#f6faf7",
                        color: form.tax_type === t ? "#fff" : T.textSub,
                      }}
                    >{t === "amount" ? "₹" : "%"}</button>
                  ))}
                </span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  style={styles.input} type="number" min="0" step="0.01"
                  placeholder={form.tax_type === "percent" ? "e.g. 18" : "0.00"}
                  value={form.tax_value}
                  onChange={(e) => setForm({ ...form, tax_value: e.target.value })}
                  disabled={readOnly}
                />
                <span style={{ fontSize: 12, color: T.textMuted, whiteSpace: "nowrap" }}>
                  {form.tax_type === "percent" && form.tax_value && form.total_amount
                    ? `= ${money(parseFloat(form.total_amount || 0) * parseFloat(form.tax_value || 0) / 100)}`
                    : ""}
                </span>
              </div>
            </div>

            <div>
              <label style={styles.label}>Total amount:*</label>
              <input style={styles.input} type="number" placeholder="Total amount" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required disabled={readOnly} />
            </div>
          </div>

          {/* Partial payment fields — only shown when payment_status = partial */}
          {form.payment_status === "partial" && (
            <div style={{
              marginBottom: 16, padding: 14, borderRadius: 10,
              background: "#fffbeb", border: "1px solid #fde68a",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
            }}>
              <div>
                <label style={styles.label}>Amount Paid:*
                  <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 6, fontSize: 11 }}>
                    {form.total_amount ? `(Max: ${money(form.total_amount)})` : ""}
                  </span>
                </label>
                <input
                  style={styles.input} type="number" min="0.01" step="0.01"
                  placeholder="How much was paid?"
                  value={form.amount_paid}
                  onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                  required={form.payment_status === "partial"}
                  disabled={readOnly}
                />
                {form.amount_paid && form.total_amount && parseFloat(form.amount_paid) > 0 && (
                  <span style={{ fontSize: 11, color: T.warn }}>
                    Balance due: {money(Math.max(0, parseFloat(form.total_amount) - parseFloat(form.amount_paid || 0)))}
                  </span>
                )}
              </div>
              <div>
                <label style={styles.label}>Payment Method:</label>
                <select
                  style={styles.select}
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  disabled={readOnly}
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Cheque</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={styles.label}>Expense note:</label>
              <textarea style={{ ...styles.input, height: 80, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                <input type="checkbox" checked={isRefund} onChange={(e) => setIsRefund(e.target.checked)} style={{ width: 16, height: 16, accentColor: T.primary }} />
                Is refund?
              </label>
            </div>
          </div>

          {/* ── Refund details — only visible when "Is refund?" is checked ── */}
          {isRefund && (
            <div style={{
              marginTop: 18, padding: 16, borderRadius: 10,
              background: "#fff7f7", border: "1px solid #fecaca",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, marginBottom: 12 }}>↩ Refund Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={styles.label}>Refund Amount:*</label>
                  <input
                    style={styles.input} type="number" min="0.01" step="0.01"
                    placeholder="0.00"
                    value={form.refund_amount}
                    onChange={(e) => setForm({ ...form, refund_amount: e.target.value })}
                    required={isRefund}
                  />
                  {form.total_amount && (
                    <span style={{ fontSize: 11, color: T.textMuted }}>Max: {money(form.total_amount)}</span>
                  )}
                </div>
                <div>
                  <label style={styles.label}>Refund Date:</label>
                  <input
                    style={styles.input} type="date"
                    value={form.refund_date}
                    onChange={(e) => setForm({ ...form, refund_date: e.target.value })}
                  />
                </div>
                <div>
                  <label style={styles.label}>Refund Method:</label>
                  <select
                    style={styles.select}
                    value={form.refund_method}
                    onChange={(e) => setForm({ ...form, refund_method: e.target.value })}
                  >
                    <option>Cash</option>
                    <option>Bank</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Refund Reason:</label>
                  <input
                    style={styles.input} placeholder="Optional"
                    value={form.refund_reason}
                    onChange={(e) => setForm({ ...form, refund_reason: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Net Expense preview: Net = Total - Refund */}
              {form.total_amount && form.refund_amount && !isNaN(parseFloat(form.refund_amount)) && (
                <div style={{
                  marginTop: 14, paddingTop: 12, borderTop: "1px solid #fecaca",
                  display: "flex", gap: 24, fontSize: 13,
                }}>
                  <span style={{ color: T.textSub }}>Original: <b style={{ color: T.textMain }}>{money(form.total_amount)}</b></span>
                  <span style={{ color: T.textSub }}>Refund: <b style={{ color: T.danger }}>-{money(form.refund_amount)}</b></span>
                  <span style={{ color: T.textSub }}>Net Expense: <b style={{ color: T.primary }}>
                    {money(Math.max(0, parseFloat(form.total_amount) - parseFloat(form.refund_amount)))}
                  </b></span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ ...styles.card, marginBottom: 20, padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="recurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} style={{ width: 16, height: 16, accentColor: T.primary }} />
              <label htmlFor="recurring" style={{ fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Is Recurring?</label>
            </div>
            <div>
              <label style={styles.label}>Recurring interval:</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...styles.input, flex: 1 }} type="number" value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })} disabled={!isRecurring} />
                <select style={{ ...styles.select, width: 100 }} value={form.intervalUnit} onChange={(e) => setForm({ ...form, intervalUnit: e.target.value })} disabled={!isRecurring}>
                  <option>Days</option><option>Weeks</option><option>Months</option>
                </select>
              </div>
            </div>
            <div>
              <label style={styles.label}>No. of Repetitions:</label>
              <input style={styles.input} type="number" value={form.repetitions} onChange={(e) => setForm({ ...form, repetitions: e.target.value })} disabled={!isRecurring} />
            </div>
          </div>
        </div>
        </fieldset>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button type="button" style={styles.btnSecondary} onClick={() => navigate("/expenses")}>{readOnly ? "Back" : "Cancel"}</button>
          {!readOnly && (
            <button type="submit" disabled={saving} style={{ ...styles.btnSave, padding: "12px 50px", fontSize: 15, borderRadius: 10, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "💾 Save"}
            </button>
          )}
          {readOnly && (
            <button type="button" style={{ ...styles.btnSave, padding: "12px 40px", fontSize: 15, borderRadius: 10 }} onClick={() => navigate(`/expenses/${id}/edit`)}>
              ✏️ Edit
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}

export function AddExpense() {
  return <ExpenseFormPage mode="create" />;
}

export function EditExpense() {
  return <ExpenseFormPage mode="edit" />;
}

export function ViewExpense() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    expensesAPI.get(id)
      .then((d) => setExpense(d.expense))
      .catch(() => setError("Failed to load expense"))
      .finally(() => setLoading(false));
  }, [id]);

  const field = (label, value, highlight = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontWeight: 600, color: T.textSub, fontSize: 13 }}>{label}</span>
      <span style={{ color: highlight ? T.primary : T.textMain, fontSize: 13, fontWeight: highlight ? 700 : 500 }}>{value || "—"}</span>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={{ ...styles.topBar, overflowX: "hidden" }}>
        <div>
          <h1 style={styles.pageTitle}>View Expense</h1>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>Home / Expenses / View</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={styles.btnSecondary} onClick={() => navigate("/expenses")}>← Back</button>
          <button style={styles.btnSave} onClick={() => navigate(`/expenses/${id}/edit`)}>✏️ Edit</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", minHeight: 0, minWidth: 0, padding: "0 24px 24px", boxSizing: "border-box" }}>
        {loading && <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>Loading...</div>}
        {error && <div style={{ color: T.danger, padding: 16 }}>{error}</div>}
        {expense && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
            {/* Left card */}
            <div style={{ ...styles.card, padding: "20px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: T.textMain }}>Expense Details</div>
              {field("Reference No", expense.expense_number)}
              {field("Date", expense.expense_date ? new Date(expense.expense_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—")}
              {field("Location", expense.location)}
              {field("Category", expense.category_name || expense.category)}
              {field("Sub Category", expense.sub_category_name)}
              {field("Expense For", expense.expense_for)}
              {field("Note", expense.description)}
            </div>
            {/* Right card */}
            <div style={{ ...styles.card, padding: "20px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: T.textMain }}>Payment Details</div>
              {field("Total Amount", `₹${parseFloat(expense.total_amount || 0).toFixed(2)}`, true)}
              {field("Tax", `₹${parseFloat(expense.tax_amount || 0).toFixed(2)}`)}
              {field("Payment Status",
                <span style={{
                  background: expense.payment_status === "paid" ? "#dcfce7" : expense.payment_status === "partial" ? "#fef9c3" : "#fee2e2",
                  color: expense.payment_status === "paid" ? "#166534" : expense.payment_status === "partial" ? "#854d0e" : "#b91c1c",
                  borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                }}>{expense.payment_status}</span>
              )}
              {field("Amount Paid", `₹${parseFloat(expense.amount_paid || 0).toFixed(2)}`)}
              {field("Payment Due", `₹${parseFloat(expense.payment_due || 0).toFixed(2)}`)}
              {field("Payment Method", expense.payment_method)}
              {expense.is_refund && field("Refund Amount", `₹${parseFloat(expense.refund_amount || 0).toFixed(2)}`)}
              {expense.is_refund && field("Net Expense", `₹${parseFloat(expense.net_expense || 0).toFixed(2)}`, true)}
            </div>
            {/* Recurring card — only if recurring */}
            {expense.is_recurring && (
              <div style={{ ...styles.card, padding: "20px 24px", gridColumn: "1 / -1" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: T.textMain }}>Recurring Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {field("Interval", `${expense.recurring_interval} ${expense.recurring_interval_unit}`)}
                  {field("Repetitions", expense.recurring_repetitions ?? "Infinite")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
/* ════════════════════════════════════════════════════════════
   3. IMPORT EXPENSE
════════════════════════════════════════════════════════════ */
export function ImportExpenses() {
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const instructions = [
    { col: 1, name: "Business Location", instruction: "" },
    { col: 2, name: "Expense Category (Optional)", instruction: "Name of the Category (created if missing)" },
    { col: 3, name: "Sub category (Optional)", instruction: "Created under the parent Category if missing" },
    { col: 4, name: "Reference No (Optional)", instruction: "Leave empty to autogenerate" },
    { col: 5, name: "Date (Optional)", instruction: 'Format "Y-m-d" (2026-06-24)' },
    { col: 6, name: "Expense for (Optional)", instruction: "Choose the user this expense is related to" },
    { col: 7, name: "Total Amount*", instruction: "Required" },
    { col: 8, name: "Payment Status (Optional)", instruction: "paid / due / partial" },
    { col: 9, name: "Expense Note (Optional)", instruction: "Additional notes" },
  ];

  return (
    <div style={{ ...styles.page, height: "auto", overflow: "visible", padding: "16px 20px" }}>
      <h1 style={{ ...styles.pageTitle, marginBottom: 16 }}>Import expense</h1>
      <div style={{ ...styles.card, marginBottom: 20, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <label style={{ ...styles.label, marginBottom: 8 }}>File To Import:</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
              <button type="button" style={styles.btnSecondary} onClick={() => fileRef.current.click()}>Choose File</button>
              <span style={{ fontSize: 13, color: T.textMuted }}>{file ? file.name : "No file chosen"}</span>
            </div>
          </div>
          <div style={{ paddingTop: 18 }}>
            <button style={{ ...styles.btnSave, padding: "9px 28px" }} onClick={() => { if (!file) { alert("Please select a file first"); return; } alert("Import wired to backend bulk-import endpoint (extend expensesAPI as needed)."); }}>
              Submit
            </button>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, fontWeight: 600, fontSize: 14 }}>Instructions</div>
        <table style={styles.table}>
          <thead>
            <tr><th style={styles.th}>Column</th><th style={styles.th}>Name</th><th style={styles.th}>Instruction</th></tr>
          </thead>
          <tbody>
            {instructions.map((r, i) => (
              <tr key={r.col} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfb" }}>
                <td style={styles.td}>{r.col}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>{r.name}</td>
                <td style={{ ...styles.td, color: T.textSub, fontSize: 12, whiteSpace: "normal" }}>{r.instruction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. EXPENSE CATEGORIES
════════════════════════════════════════════════════════════ */
export function ExpenseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({ name: "", parent_name: "" });
  const [editId, setEditId] = useState(null);
  const [editCode, setEditCode] = useState("");

  const load = () => {
    setLoading(true);
    expensesAPI.categories.list()
      .then((d) => setCategories(d.categories || []))
      .catch((err) => setError(err?.response?.data?.error || "Failed to load categories"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async () => {
    if (!modalForm.name.trim()) { alert("Category name is required"); return; }
    try {
      let parent_id = null;
      const parentName = modalForm.parent_name?.trim();
      if (parentName) {
        const existing = categories.find(
          (c) => !c.parent_id && c.id !== editId && c.name.toLowerCase() === parentName.toLowerCase()
        );
        if (existing) {
          parent_id = existing.id;
        } else {
          const { category } = await expensesAPI.categories.create({ name: parentName, parent_id: null });
          parent_id = category.id;
        }
      }

      const payload = { name: modalForm.name.trim(), parent_id };
      if (editId) {
        await expensesAPI.categories.update(editId, payload);
      } else {
        await expensesAPI.categories.create(payload);
      }
      setShowModal(false);
      setModalForm({ name: "", parent_name: "" });
      setEditId(null);
      setEditCode("");
      load();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to save category");
    }
  };

  const handleEdit = (c) => {
    setModalForm({ name: c.name, parent_name: c.parent_name || "" });
    setEditCode(c.code || "");
    setEditId(c.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await expensesAPI.categories.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete category");
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Sticky top bar: title + breadcrumb + primary action (matches Stock Adjustments) ── */}
      <div style={{ ...styles.topBar, overflowX: "hidden" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={styles.pageTitle}>Expense Categories</h1>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
            Home / Expenses / Categories
          </div>
        </div>
        <button
          style={{ ...styles.btnSave, borderRadius: 20, padding: "10px 22px" }}
          onClick={() => { setModalForm({ name: "", parent_name: "" }); setEditId(null); setEditCode(""); setShowModal(true); }}
        >
          ⊕ Add Category
        </button>
      </div>

      {/* ── Card fills remaining height; only table body scrolls ── */}
      <div style={{ ...styles.card, flex: 1, display: "flex", flexDirection: "column", margin: "0 20px 16px", minHeight: 0, minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>All Expense Categories</div>
        </div>

        {error && <div style={{ padding: "10px 18px", color: T.danger, fontSize: 13, flexShrink: 0 }}>{error}</div>}

        <div style={{ flex: 1, overflow: "auto", minHeight: 0, minWidth: 0, width: "100%" }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["CATEGORY NAME", "CODE", "PARENT", "ACTION"].map((h) => (
                  <th key={h} style={{ ...styles.th, fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", borderBottom: `2px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", padding: 32, color: T.textMuted }}>Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", color: T.textMuted, padding: 32 }}>
                  No categories yet — click "⊕ Add Category" to create one
                </td></tr>
              ) : categories.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 600, color: T.textMain }}>{c.name}</span>
                  </td>
                  <td style={styles.td}>
                    {c.code ? (
                      <span style={{
                        background: "#f0f4f1", color: T.textSub, fontFamily: "monospace",
                        fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
                        border: `1px solid ${T.border}`,
                      }}>{c.code}</span>
                    ) : (
                      <span style={{ color: T.textMuted, fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {c.parent_name ? (
                      <span style={{ color: T.textSub }}>↳ {c.parent_name}</span>
                    ) : (
                      <span style={{
                        background: "#eef2ff", color: "#4338ca", fontSize: 11, fontWeight: 600,
                        borderRadius: 999, padding: "2px 9px",
                      }}>Top-level</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        title="Edit"
                        onClick={() => handleEdit(c)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #fed7aa", background: "#fff7ed", color: "#dd6b20", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                      >✏️</button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(c.id)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #fca5a5", background: "#fef2f2", color: T.danger, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "10px 16px", fontSize: 12, color: T.textSub, flexShrink: 0, borderTop: `1px solid ${T.border}` }}>
          Showing {categories.length} {categories.length === 1 ? "category" : "categories"}
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 420, padding: "26px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{editId ? "Edit" : "Add"} Expense Category</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.textMuted }}>×</button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category name:*</label>
              <input style={styles.input} value={modalForm.name} onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })} autoFocus />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category code:</label>
              <input
                style={{ ...styles.input, background: "#f6faf7", color: T.textMuted, cursor: "not-allowed" }}
                value={editId ? editCode : "Auto-generated on save (e.g. EXP-004)"}
                readOnly
                disabled
              />
            </div>
            <div style={styles.formGroup}>
              <Combobox
                label="Parent category (optional → makes this a sub-category):"
                value={modalForm.parent_name}
                onChange={(val) => setModalForm({ ...modalForm, parent_name: val })}
                options={categories.filter((c) => !c.parent_id && c.id !== editId).map((c) => c.name)}
                placeholder="None — type to search or create"
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button style={{ ...styles.btnSave, padding: "9px 24px" }} onClick={handleSave}>Save</button>
              <button style={{ background: "#374151", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }} onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListExpenses;
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import expensesAPI from "../api/expensesAPI";

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
    padding: "14px 20px 10px",
    flexShrink: 0,
    width: "100%",
    boxSizing: "border-box",
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

  const load = useCallback(async (searchVal = search) => {
    setLoading(true);
    setError("");
    try {
      const data = await expensesAPI.list({ search: searchVal, limit: 100 });
      setExpenses(data.expenses || []);
      setTotals(data.totals || { total: 0, due: 0 });
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(""); }, []); // eslint-disable-line

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(val), 350);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await expensesAPI.remove(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
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
    { label: "Payment due", value: (e) => e.payment_due },
    { label: "Expense for", value: (e) => e.expense_for },
    { label: "Note", value: (e) => e.description },
  ];

  return (
    <div style={styles.page}>
      {/* ── Sticky top bar: title + primary actions always visible ── */}
      <div style={styles.topBar}>
        <h1 style={styles.pageTitle}>Expenses</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={styles.btnPrimary} onClick={() => navigate("/import-expenses")}>⬆ Import expense</button>
          <button style={styles.btnPrimary} onClick={() => navigate("/expense-categories")}>🏷 Categories</button>
          <button style={styles.btnSave} onClick={() => navigate("/expenses/create")}>+ Add</button>
        </div>
      </div>

      {/* ── Card fills remaining height; only table body scrolls ── */}
      <div style={{ ...styles.card, flex: 1, display: "flex", flexDirection: "column", margin: "0 20px 16px", minHeight: 0, minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
        <ExportBar
          rows={expenses}
          columns={columns}
          filename="expenses"
          search={search}
          onSearch={handleSearch}
        />

        {error && (
          <div style={{ padding: "10px 16px", color: T.danger, fontSize: 13 }}>{error}</div>
        )}

        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Action", "Date", "Reference No", "Category", "Sub category", "Location", "Payment Status", "Tax", "Total amount", "Payment due", "Expense for", "Note"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ ...styles.td, textAlign: "center", padding: 30 }}>Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={12} style={{ ...styles.td, textAlign: "center", padding: 30, color: T.textMuted }}>No expenses found</td></tr>
              ) : expenses.map((e, i) => (
                <tr key={e.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfb" }}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button title="View" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }} onClick={() => navigate(`/expenses/${e.id}`)}>👁</button>
                      <button title="Edit" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }} onClick={() => navigate(`/expenses/${e.id}/edit`)}>✏️</button>
                      <button title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }} onClick={() => handleDelete(e.id)}>🗑️</button>
                    </div>
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
                  <td style={styles.td}>{money(e.payment_due)}</td>
                  <td style={styles.td}>{e.expense_for || "—"}</td>
                  <td style={styles.td}>{e.description || ""}</td>
                </tr>
              ))}
            </tbody>
            {expenses.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f0f4f1" }}>
                  <td colSpan={8} style={{ ...styles.td, fontWeight: 700, textAlign: "right" }}>Total:</td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>{money(totals.total)}</td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>{money(totals.due)}</td>
                  <td colSpan={2} style={styles.td}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: T.textSub, flexShrink: 0, borderTop: `1px solid ${T.border}` }}>
          <span>Showing {expenses.length} of {expenses.length} entries</span>
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
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(mode !== "create");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    location: "Manodtechnologies (BL0001)",
    category: "", sub_category: "", expense_number: "",
    expense_date: new Date().toISOString().slice(0, 10),
    expense_for: "", contact_id: "", tax_amount: 0, total_amount: "",
    description: "", payment_status: "due",
    interval: "", intervalUnit: "Days", repetitions: "",
  });
  const fileRef = useRef();

  const loadCategories = () => {
    expensesAPI.categories.list().then((d) => setCategories(d.categories || [])).catch(() => {});
  };
  useEffect(loadCategories, []);

  // Edit / View → fetch the existing expense and prefill the form
  useEffect(() => {
    if (mode === "create" || !id) return;
    setLoadingRecord(true);
    expensesAPI.get(id)
      .then((d) => {
        const e = d.expense;
        if (!e) { setError("Expense not found"); return; }
        setForm({
          location: e.location || "Manodtechnologies (BL0001)",
          category: e.category_name || "",
          sub_category: e.sub_category_name || "",
          expense_number: e.expense_number || "",
          expense_date: e.expense_date ? new Date(e.expense_date).toISOString().slice(0, 10) : "",
          expense_for: e.expense_for || "",
          contact_id: e.contact_id || "",
          tax_amount: e.tax_amount || 0,
          total_amount: e.total_amount || "",
          description: e.description || "",
          payment_status: e.payment_status || "due",
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
    setSaving(true);
    setError("");
    try {
      const category_id = await resolveCategoryId(form.category);
      const sub_category_id = form.sub_category ? await resolveCategoryId(form.sub_category, category_id) : null;

      const payload = {
        ...form,
        category_id,
        sub_category_id,
        category_name: form.category || null,
        sub_category_name: form.sub_category || null,
        is_refund: isRefund,
        is_recurring: isRecurring,
        recurring_interval: form.interval || null,
        recurring_interval_unit: form.intervalUnit,
        recurring_repetitions: form.repetitions || null,
      };

      if (mode === "edit") {
        await expensesAPI.update(id, payload);
      } else {
        await expensesAPI.create(payload);
      }
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
      <div style={{ ...styles.page, height: "auto", overflow: "visible", padding: "30px 20px" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, height: "auto", overflow: "visible" }}>
      <div style={{ padding: "16px 20px 0" }}>
        <h1 style={{ ...styles.pageTitle, marginBottom: 16 }}>{pageHeading}</h1>
      </div>
      <form onSubmit={handleSave} style={{ padding: "0 20px 20px" }}>
        {error && <div style={{ color: T.danger, marginBottom: 12, fontSize: 13 }}>{error}</div>}

        <fieldset disabled={readOnly} style={{ border: "none", padding: 0, margin: 0 }}>
        <div style={{ ...styles.card, marginBottom: 16, padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={styles.label}>Business Location:*</label>
              <select style={styles.select} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                <option>Manodtechnologies (BL0001)</option>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={styles.label}>Attach Document:</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input ref={fileRef} type="file" style={{ display: "none" }} />
                <button type="button" style={{ ...styles.btnPrimary, padding: "8px 12px" }} onClick={() => fileRef.current.click()} disabled={readOnly}>📁 Browse..</button>
              </div>
            </div>
            <div>
              <label style={styles.label}>Tax amount:</label>
              <input style={styles.input} type="number" value={form.tax_amount} onChange={(e) => setForm({ ...form, tax_amount: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Total amount:*</label>
              <input style={styles.input} type="number" placeholder="Total amount" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required />
            </div>
          </div>

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
  );
}

export function AddExpense() {
  return <ExpenseFormPage mode="create" />;
}

export function EditExpense() {
  return <ExpenseFormPage mode="edit" />;
}

export function ViewExpense() {
  return <ExpenseFormPage mode="view" />;
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
      {/* ── Sticky top bar ── */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>Expense Categories</h1>
          <div style={{ fontSize: 13, color: T.textSub, marginTop: 2 }}>Manage your expense categories</div>
        </div>
        <button style={styles.btnSave} onClick={() => { setModalForm({ name: "", parent_name: "" }); setEditId(null); setEditCode(""); setShowModal(true); }}>
          + Add Category
        </button>
      </div>

      {/* ── Card fills remaining height; only table body scrolls ── */}
      <div style={{ ...styles.card, flex: 1, display: "flex", flexDirection: "column", margin: "0 20px 16px", minHeight: 0, minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            🏷 All your expense categories
            <span style={{
              background: "#eaf6ee", color: T.primary, fontSize: 11, fontWeight: 700,
              borderRadius: 999, padding: "2px 9px",
            }}>{categories.length}</span>
          </span>
        </div>

        {error && <div style={{ padding: "10px 18px", color: T.danger, fontSize: 13, flexShrink: 0 }}>{error}</div>}

        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category name</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Parent</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", padding: 32, color: T.textMuted }}>Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", color: T.textMuted, padding: 32 }}>
                  No categories yet — click "+ Add Category" to create one
                </td></tr>
              ) : categories.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfb" }}>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
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
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEdit(c)} style={{ ...styles.btnSecondary, padding: "5px 12px", fontSize: 12 }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={{ ...styles.btnSecondary, padding: "5px 12px", fontSize: 12, color: T.danger, borderColor: "#fca5a5" }}>🗑️ Delete</button>
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

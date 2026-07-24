/**
 * ============================================================
 * pages/Accounting.jsx — Accounting & Finance Module
 * Single-file component, 11 internal tabs
 *
 * REAL DATA NOTICE:
 * Every tab below calls src/api/accountingApi.js, which hits
 * /api/accounting/* on your backend. Nothing here is SEED_ data
 * anymore — numbers come from sales_invoices, purchases,
 * expenses, hrm_payroll, products, and the new accounting_*
 * tables (bank accounts, fixed assets, cost centers, budgets,
 * journal entries) you just created in Supabase.
 * ============================================================
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen, Receipt, FileText, Landmark, Percent, Boxes,
  Factory, PieChart, Wallet, LayoutDashboard, Plus, Search,
  ArrowUpRight, ArrowDownRight, Download, Filter,
  CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Building2, CreditCard, FileBarChart2, Scale, Loader2, X, Trash2,
  Eye, Pencil, FileSpreadsheet, ArrowLeft, Lock, Info, Copy,
} from "lucide-react";
// new
import {
  fetchDashboard, fetchReceivables, fetchPayables,
  fetchBankAccounts, createBankAccount, fetchBankTransactions, createBankTransaction, reconcileBankTransaction,
  updateBankTransaction, deleteBankTransaction, fetchBankAccountLedger, fetchBankStatement, fetchCashBankSummary,
  fetchGST, fetchGSTLedger, fetchGSTTrend, fetchGSTSettings, updateGSTSettings, fetchGSTHSNSummary, fetchGSTByState, fetchFixedAssets, createFixedAsset, updateFixedAsset, disposeFixedAsset, postMonthlyDepreciation, fetchAssetDepreciationLog,
 fetchCostCenters, createCostCenter, updateCostCenter, deleteCostCenter, fetchExpenseLocations, fetchProductCosting,
  deleteFixedAsset,
  fetchBudgets, createBudget, fetchExpenseRequests, fetchExpenseCategories,
  fetchChartOfAccounts, fetchJournalEntries, createJournalEntry, deleteJournalEntry,
  fetchTrialBalance, fetchProfitAndLoss, fetchBalanceSheet, fetchCashFlow,
} from "../api/accountingApi";
/* ============================================================
   THEME TOKENS (mirrors Manod ERP green identity)
   ============================================================ */
const C = {
  bg: "#f0f4f1", card: "#ffffff", border: "#e2e8e4", text: "#1a202c", sub: "#64748b",
  primary: "#16a34a", primaryDark: "#15803d", primarySoft: "#e8f5e9",
  danger: "#dc2626", dangerSoft: "#fef2f2", warn: "#d97706", warnSoft: "#fffbeb",
  info: "#2563eb", infoSoft: "#eff6ff", purple: "#7c3aed", purpleSoft: "#f5f3ff",
};

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================================================
   SHARED UI PRIMITIVES
   ============================================================ */
function Card({ children, style, ...rest }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }} {...rest}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, tint, sub }) {
  const positive = change >= 0;
  return (
    <Card style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: tint || C.primarySoft }}>
          <Icon size={18} color={C.primaryDark} strokeWidth={2} />
        </div>
        {change !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: positive ? C.primary : C.danger }}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, fontSize: 22, fontWeight: 800, color: C.text }}>{value}</div>
      <div style={{ marginTop: 2, fontSize: 12.5, color: C.sub, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ marginTop: 4, fontSize: 11.5, color: C.sub }}>{sub}</div>}
    </Card>
  );
}

function Badge({ text, tone = "default" }) {
  const tones = {
    default: { bg: "#f1f5f9", color: "#475569" }, success: { bg: C.primarySoft, color: C.primaryDark },
    danger: { bg: C.dangerSoft, color: C.danger }, warn: { bg: C.warnSoft, color: C.warn },
    info: { bg: C.infoSoft, color: C.info }, purple: { bg: C.purpleSoft, color: C.purple },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: t.bg, color: t.color, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

function statusTone(status) {
  const map = {
    Paid: "success", Posted: "success", Active: "success", Approved: "success",
    Due: "warn", Unpaid: "warn", Partial: "warn", Pending: "warn", pending: "warn", due: "warn", partial: "warn",
    Overdue: "danger", Rejected: "danger", Disposed: "default",
  };
  return map[status] || "default";
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

function Btn({ children, icon: Icon, variant = "primary", onClick, style, disabled }) {
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", border: "none" },
    outline: { background: "#fff", color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.sub, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
      fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
      ...variants[variant], ...style,
    }}>
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function Table({ columns, rows, renderRow, emptyText = "No records yet" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{ textAlign: c.align || "left", padding: "10px 12px", fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: "28px 12px", textAlign: "center", color: C.sub, fontSize: 13 }}>{emptyText}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>{renderRow(row, i)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children, align, style }) {
  return <td style={{ padding: "11px 12px", textAlign: align || "left", color: C.text, ...style }}>{children}</td>;
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", minWidth: 220 }}>
      <Search size={14} color={C.sub} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent" }} />
    </div>
  );
}

function ProgressBar({ pct, tone = C.primary }) {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ width: "100%", height: 6, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
      <div style={{ width: `${clamped}%`, height: "100%", background: tone, borderRadius: 999 }} />
    </div>
  );
}

function LoadingBlock({ label = "Loading real data…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "60px 0", color: C.sub, fontSize: 14 }}>
      <Loader2 size={18} className="spin" style={{ animation: "spin 1s linear infinite" }} />
      {label}
      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}

function ErrorBlock({ message, onRetry }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "40px 0", color: C.danger, fontSize: 13.5 }}>
      <AlertTriangle size={22} />
      <div>{message || "Couldn't load this from the server."}</div>
      {onRetry && <Btn variant="outline" onClick={onRetry}>Retry</Btn>}
    </div>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: width, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: C.sub }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = { padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5, display: "block" };

/* Generic hook: fetch on mount, expose {data, loading, error, reload} */
function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((res) => setState({ data: res, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err.message }));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Refetch whenever this tab regains focus/visibility, so switching
  // between Cash & Bank -> Statements always shows current numbers
  // instead of a stale snapshot from when the tab first mounted.
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  return { ...state, reload: load };
}

/* ============================================================
   TAB 1 — FINANCIAL DASHBOARD
   ============================================================ */
function DashboardTab() {
  const { data, loading, error, reload } = useApi(fetchDashboard);
  if (loading) return <LoadingBlock label="Pulling live revenue, expenses & cash…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const k = data.data;
  const trend = data.trend || [];
  const aging = data.aging || [];
  const maxRev = Math.max(1, ...trend.map((d) => Math.max(d.revenue, d.expense)));
  const agingTotal = aging.reduce((s, b) => s + b.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={TrendingUp} label="Revenue (this month)" value={fmtINR(k.revenue)} change={k.revenueChange} />
       <StatCard icon={TrendingDown} label="Total Expenses" value={fmtINR(k.expenses)} change={-k.expensesChange} tint={C.dangerSoft} sub={`Opex ${fmtINR(k.opExpenses)} + Purchases ${fmtINR(k.purchasesCost)}`} />
        <StatCard icon={Wallet} label="Net Profit" value={fmtINR(k.netProfit)} change={k.netProfitChange} tint={C.purpleSoft} />
        <StatCard icon={Landmark} label="Cash & Bank Balance" value={fmtINR(k.cashBalance)} tint={C.infoSoft} />
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <Card style={{ flex: 2, minWidth: 360 }}>
          <SectionHeader title="Revenue vs Expenses" subtitle="Last 5 months — from sales_invoices, purchases & expenses" />
          {trend.length === 0 ? (
            <div style={{ color: C.sub, fontSize: 13, padding: "30px 0", textAlign: "center" }}>No invoices/expenses recorded yet.</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 180, paddingTop: 10 }}>
                {trend.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140 }}>
                      <div title={fmtINR(d.revenue)} style={{ width: 16, borderRadius: "4px 4px 0 0", background: `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`, height: `${(d.revenue / maxRev) * 140}px` }} />
                      <div title={fmtINR(d.expense)} style={{ width: 16, borderRadius: "4px 4px 0 0", background: "#cbd5e1", height: `${(d.expense / maxRev) * 140}px` }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700 }}>{d.month}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: C.primary, display: "inline-block" }} /> Revenue
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: "#cbd5e1", display: "inline-block" }} /> Expenses
                </div>
              </div>
            </>
          )}
        </Card>

        <Card style={{ flex: 1, minWidth: 240 }}>
          <SectionHeader title="Outstanding" subtitle="Live from sales_invoices / purchases" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
              <span style={{ color: C.sub, fontWeight: 600 }}>Receivables (AR)</span>
              <span style={{ fontWeight: 800, color: C.text }}>{fmtINR(k.arTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
              <span style={{ color: C.sub, fontWeight: 600 }}>Payables (AP)</span>
              <span style={{ fontWeight: 800, color: C.text }}>{fmtINR(k.apTotal)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="AR Aging Summary" subtitle="Outstanding customer invoices, by days overdue" />
        {aging.map((b, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ color: C.sub, fontWeight: 600 }}>{b.bucket}</span>
              <span style={{ fontWeight: 800, color: C.text }}>{fmtINR(b.amount)}</span>
            </div>
            <ProgressBar pct={agingTotal ? (b.amount / agingTotal) * 100 : 0} tone={i === 3 ? C.danger : i === 2 ? C.warn : C.info} />
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ============================================================
   TAB 2 — GENERAL LEDGER (Chart of Accounts + Journal Entries)
   ============================================================ */
function GeneralLedgerTab() {
  const [glSubTab, setGlSubTab] = useState("journal");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  const coa = useApi(fetchChartOfAccounts);
  const journal = useApi(() => fetchJournalEntries(30));

  const confirmDeleteEntry = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setDeleteErr("");
      await deleteJournalEntry(deleteTarget.id);
      setDeleteTarget(null);
      journal.reload();
      coa.reload();
    } catch (e) {
      setDeleteErr(e.message || "Failed to delete journal entry.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCOA = (coa.data?.data || []).filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.code.includes(q));
  const manualEntries = journal.data?.data || [];
  const derivedEntries = journal.data?.derived || [];
  const filteredDerived = derivedEntries.filter((e) => !q || e.narration.toLowerCase().includes(q.toLowerCase()) || e.ref?.toLowerCase().includes(q.toLowerCase()));

  const totalDebit = filteredCOA.filter((a) => a.normal_side === "Debit").reduce((s, a) => s + a.balance, 0);
  const totalCredit = filteredCOA.filter((a) => a.normal_side === "Credit").reduce((s, a) => s + a.balance, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={BookOpen} label="Derived Entries (sales/purchase/expense)" value={derivedEntries.length} tint={C.infoSoft} />
        <StatCard icon={CheckCircle2} label="Manual Journal Entries" value={manualEntries.length} tint={C.primarySoft} />
        <StatCard icon={FileBarChart2} label="Chart of Accounts — Debit total" value={fmtINR(totalDebit)} sub={`Credit total: ${fmtINR(totalCredit)}`} tint={C.purpleSoft} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 9 }}>
            {[{ id: "journal", label: "Journal Entries" }, { id: "coa", label: "Chart of Accounts" }].map((t) => (
              <button key={t.id} onClick={() => setGlSubTab(t.id)} style={{
                padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                background: glSubTab === t.id ? "#fff" : "transparent", color: glSubTab === t.id ? C.primaryDark : C.sub,
                boxShadow: glSubTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SearchBox value={q} onChange={setQ} placeholder={glSubTab === "journal" ? "Search entries..." : "Search accounts..."} />
            {glSubTab === "journal" && <Btn icon={Plus} onClick={() => setShowAdd(true)}>New Journal Entry</Btn>}
          </div>
        </div>

        {glSubTab === "journal" ? (
          journal.loading ? <LoadingBlock /> : journal.error ? <ErrorBlock message={journal.error} onRetry={journal.reload} /> : (
            <>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 8 }}>MANUAL ENTRIES (posted by your team)</div>
              <Table
                columns={[{ label: "Entry #" }, { label: "Date" }, { label: "Narration" }, { label: "Debit", align: "right" }, { label: "Credit", align: "right" }, { label: "Status" }, { label: "Actions", align: "right" }]}
                rows={manualEntries}
                emptyText="No manual journal entries yet — add opening balances or adjustments above."
                renderRow={(e) => {
                  const lines = e.lines || [];
                  const d = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
                  const c = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
                  return (
                    <>
                      <Td style={{ fontWeight: 700 }}>{e.entry_no}</Td>
                      <Td>{new Date(e.entry_date).toLocaleDateString("en-IN")}</Td>
                      <Td>{e.narration || "—"}</Td>
                      <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(d)}</Td>
                      <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(c)}</Td>
                      <Td><Badge text={e.status} tone={statusTone(e.status)} /></Td>
                      <Td align="right">
                        <button
                          onClick={() => { setDeleteErr(""); setDeleteTarget(e); }}
                          title="Delete journal entry"
                          style={{ border: `1px solid ${C.danger}40`, background: C.dangerSoft, color: C.danger, borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </Td>
                    </>
                  );
                }}
              />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, margin: "20px 0 8px" }}>DERIVED FROM SALES / PURCHASES / EXPENSES</div>
              <Table
                columns={[{ label: "Ref" }, { label: "Date" }, { label: "Narration" }, { label: "Debit", align: "right" }, { label: "Credit", align: "right" }, { label: "Source" }]}
                rows={filteredDerived}
                renderRow={(e) => {
                  const d = e.debit.reduce((s, x) => s + x.amt, 0);
                  const c = e.credit.reduce((s, x) => s + x.amt, 0);
                  return (
                    <>
                      <Td style={{ fontWeight: 700 }}>{e.ref}</Td>
                      <Td>{new Date(e.date).toLocaleDateString("en-IN")}</Td>
                      <Td>{e.narration}</Td>
                      <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(d)}</Td>
                      <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(c)}</Td>
                      <Td><Badge text={e.source} tone="info" /></Td>
                    </>
                  );
                }}
              />
            </>
          )
        ) : (
          coa.loading ? <LoadingBlock /> : coa.error ? <ErrorBlock message={coa.error} onRetry={coa.reload} /> : (
            <Table
              columns={[{ label: "Code" }, { label: "Account Name" }, { label: "Type" }, { label: "Subtype" }, { label: "Normal Bal." }, { label: "Live Balance", align: "right" }]}
              rows={filteredCOA}
              renderRow={(a) => (
                <>
                  <Td style={{ fontWeight: 700, color: C.sub }}>{a.code}</Td>
                  <Td style={{ fontWeight: 700 }}>{a.name}</Td>
                  <Td><Badge text={a.type} tone={a.type === "Asset" ? "info" : a.type === "Liability" ? "warn" : a.type === "Equity" ? "purple" : a.type === "Income" ? "success" : "danger"} /></Td>
                  <Td style={{ color: C.sub }}>{a.subtype}</Td>
                  <Td style={{ color: C.sub }}>{a.normal_side}</Td>
                  <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(a.balance)}</Td>
                </>
              )}
            />
          )
        )}
      </Card>
{showAdd && <NewJournalEntryModal accounts={coa.data?.data || []} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); journal.reload(); coa.reload(); }} />}

      {deleteTarget && (
        <Modal title="Delete Journal Entry" onClose={() => !deleting && setDeleteTarget(null)} width={420}>
          {deleteErr && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{deleteErr}</div>}
          <div style={{ fontSize: 13.5, color: C.text, marginBottom: 18 }}>
            Are you sure you want to delete this manual journal entry?
            {deleteTarget.entry_no && (
              <div style={{ marginTop: 6, fontWeight: 700 }}>{deleteTarget.entry_no}</div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Btn>
            <Btn onClick={confirmDeleteEntry} disabled={deleting} style={{ background: C.danger }}>
              {deleting ? "Deleting..." : "Delete Entry"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function NewJournalEntryModal({ accounts, onClose, onSaved }) {
  const [narration, setNarration] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState([{ account_id: "", debit: "", credit: "" }, { account_id: "", debit: "", credit: "" }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const setLine = (i, key, val) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));
  const addLine = () => setLines((ls) => [...ls, { account_id: "", debit: "", credit: "" }]);

  const save = async () => {
    setErr("");
    if (!balanced) { setErr("Debits must equal credits before posting."); return; }
    try {
      setSaving(true);
      await createJournalEntry({
        entry_date: entryDate, narration,
        lines: lines.filter((l) => l.account_id).map((l) => ({ account_id: Number(l.account_id), debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0 })),
      });
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="New Manual Journal Entry" onClose={onClose} width={560}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Date</label>
      <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Narration</label>
      <input value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g. Opening balance — Owner's Capital" style={{ ...inputStyle, marginBottom: 14 }} />

      <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>LINES</div>
      {lines.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select value={l.account_id} onChange={(e) => setLine(i, "account_id", e.target.value)} style={{ ...inputStyle, flex: 2 }}>
            <option value="">Select account</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
          </select>
          <input type="number" placeholder="Debit" value={l.debit} onChange={(e) => setLine(i, "debit", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <input type="number" placeholder="Credit" value={l.credit} onChange={(e) => setLine(i, "credit", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>
      ))}
      <Btn variant="outline" icon={Plus} onClick={addLine} style={{ marginBottom: 14 }}>Add Line</Btn>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, padding: "10px 0", borderTop: `1px dashed ${C.border}` }}>
        <span>Total Debit: {fmtINR(totalDebit)}</span>
        <span>Total Credit: {fmtINR(totalCredit)}</span>
        <Badge text={balanced ? "Balanced" : "Not balanced"} tone={balanced ? "success" : "danger"} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving || !balanced}>{saving ? "Posting..." : "Post Entry"}</Btn>
      </div>
    </Modal>
  );
}

/* ============================================================
   TAB 3 — ACCOUNTS RECEIVABLE
   ============================================================ */
function ReceivableTab() {
  const [q, setQ] = useState("");
  const { data, loading, error, reload } = useApi(() => fetchReceivables({ search: q }), [q]);

  if (loading) return <LoadingBlock label="Loading customer invoices…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const rows = data.data || [];
  const s = data.summary || {};
  const aging = data.aging || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Receipt} label="Total Outstanding" value={fmtINR(s.outstanding)} tint={C.infoSoft} />
        <StatCard icon={AlertTriangle} label="Overdue Invoices" value={s.overdue_count || 0} tint={C.dangerSoft} />
        <StatCard icon={CheckCircle2} label="Received This Month" value={fmtINR(s.paid_this_month)} tint={C.primarySoft} />
      </div>

      <Card>
        <SectionHeader title="Customer Invoices" subtitle="Live from sales_invoices" action={<SearchBox value={q} onChange={setQ} placeholder="Search customer or invoice..." />} />
        <Table
          columns={[{ label: "Invoice #" }, { label: "Customer" }, { label: "Date" }, { label: "Due Date" }, { label: "Amount", align: "right" }, { label: "Paid", align: "right" }, { label: "Balance", align: "right" }, { label: "Status" }]}
          rows={rows}
          emptyText="No sales invoices found."
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.id_no}</Td>
              <Td>{r.customer}</Td>
              <Td>{r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}</Td>
              <Td>{r.due ? new Date(r.due).toLocaleDateString("en-IN") : "—"}</Td>
              <Td align="right">{fmtINR(r.amount)}</Td>
              <Td align="right" style={{ color: C.primary, fontWeight: 700 }}>{fmtINR(r.paid)}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.amount - r.paid)}</Td>
              <Td><Badge text={r.status} tone={statusTone(r.status)} /></Td>
            </>
          )}
        />
      </Card>

      {aging.length > 0 && (
        <Card>
          <SectionHeader title="Receivables Aging" subtitle="How overdue is outstanding customer debt" />
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {aging.map((b, i) => (
              <div key={i} style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{fmtINR(b.amount)}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 4, fontWeight: 700 }}>{b.bucket}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   TAB 4 — ACCOUNTS PAYABLE
   ============================================================ */
function PayableTab() {
  const [q, setQ] = useState("");
  const { data, loading, error, reload } = useApi(() => fetchPayables({ search: q }), [q]);

  if (loading) return <LoadingBlock label="Loading vendor bills…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const rows = data.data || [];
  const s = data.summary || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={FileText} label="Total Payable" value={fmtINR(s.outstanding)} tint={C.warnSoft} />
        <StatCard icon={AlertTriangle} label="Overdue Bills" value={s.overdue_count || 0} tint={C.dangerSoft} />
        <StatCard icon={CheckCircle2} label="Paid This Month" value={fmtINR(s.paid_this_month)} tint={C.primarySoft} />
      </div>

<Card>
        <SectionHeader title="Vendor Bills & Unpaid Expenses" subtitle="Live from purchases and expenses" action={<SearchBox value={q} onChange={setQ} placeholder="Search vendor or bill..." />} />
        <Table
          columns={[{ label: "Bill #" }, { label: "Vendor" }, { label: "Source" }, { label: "Date" }, { label: "Amount", align: "right" }, { label: "Paid", align: "right" }, { label: "Balance", align: "right" }, { label: "Status" }]}
          rows={rows}
          emptyText="No outstanding bills or expenses found."
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.id_no}</Td>
              <Td>{r.vendor}</Td>
              <Td><Badge text={r.source || "Purchase"} tone={r.source === "Expense" ? "danger" : "warn"} /></Td>
              <Td>{r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}</Td>
              <Td align="right">{fmtINR(r.amount)}</Td>
              <Td align="right" style={{ color: C.primary, fontWeight: 700 }}>{fmtINR(r.paid)}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.amount - r.paid)}</Td>
              <Td><Badge text={r.status} tone={statusTone(r.status)} /></Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

/* ============================================================
   TAB 5 — CASH & BANK MANAGEMENT
   ============================================================ */
const MANUAL_TXN_REASONS = [
  "Owner Investment", "Bank Charges", "Bank Interest", "Cash Deposit",
  "Cash Withdrawal", "Opening Balance", "Miscellaneous Adjustment",
];

const SOURCE_TONES = {
  Sales: "success", Purchase: "warn", Expense: "danger",
  Payroll: "purple", Assets: "info", Manual: "default",
};

function CashBankTab() {
  const [view, setView] = useState("list"); // 'list' | 'ledger' | 'statement'
  const [ledgerAccountId, setLedgerAccountId] = useState(null);

  const [filters, setFilters] = useState({ date_from: "", date_to: "", bank_account_id: "", txn_type: "", source_module: "" });
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  const summary = useApi(fetchCashBankSummary);
  const accounts = useApi(fetchBankAccounts);
  const activeFilters = useMemo(() => {
    const f = { limit: 100 };
    Object.entries(filters).forEach(([k, v]) => { if (v) f[k] = v; });
    return f;
  }, [filters]);
  const txns = useApi(() => fetchBankTransactions(activeFilters), [JSON.stringify(activeFilters)]);

  const reloadAll = () => { summary.reload(); accounts.reload(); txns.reload(); };

  if (view === "ledger" && ledgerAccountId) {
    return <BankLedgerView accountId={ledgerAccountId} onBack={() => setView("list")} onViewStatement={() => setView("statement")} />;
  }
  if (view === "statement" && ledgerAccountId) {
    return <BankStatementView accountId={ledgerAccountId} onBack={() => setView("ledger")} />;
  }

  if (accounts.loading) return <LoadingBlock label="Loading bank & cash accounts…" />;
  if (accounts.error) return <ErrorBlock message={accounts.error} onRetry={accounts.reload} />;

  const bankAccounts = accounts.data.data || [];
  const bankTxns = txns.data?.data || [];
  const totalBalance = bankAccounts.reduce((s, a) => s + Number(a.balance), 0);
  const unreconciled = bankTxns.filter((t) => !t.reconciled).length;
  const s = summary.data?.data || {};

  const openLedger = (accountId) => { setLedgerAccountId(accountId); setView("ledger"); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true); setDeleteErr("");
      await deleteBankTransaction(deleteTarget.id);
      setDeleteTarget(null);
      reloadAll();
    } catch (e) {
      setDeleteErr(e.message || "Failed to delete transaction.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Landmark} label="Cash Balance" value={fmtINR(s.cashBalance)} tint={C.primarySoft} />
        <StatCard icon={Building2} label="Bank Balance" value={fmtINR(s.bankBalance)} tint={C.infoSoft} />
        <StatCard icon={ArrowUpRight} label="Today's Receipts" value={fmtINR(s.todaysReceipts)} tint={C.primarySoft} />
        <StatCard icon={ArrowDownRight} label="Today's Payments" value={fmtINR(s.todaysPayments)} tint={C.dangerSoft} />
        <StatCard icon={s.netCashFlow >= 0 ? TrendingUp : TrendingDown} label="Net Cash Flow (Today)" value={fmtINR(s.netCashFlow)} tint={s.netCashFlow >= 0 ? C.primarySoft : C.dangerSoft} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn icon={Plus} variant="outline" onClick={() => setShowAddAccount(true)}>Add Bank Account</Btn>
        <Btn icon={Plus} onClick={() => setShowAddTxn(true)} disabled={bankAccounts.length === 0}>Add Transaction</Btn>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {bankAccounts.length === 0 ? (
          <Card style={{ flex: 1 }}><div style={{ textAlign: "center", color: C.sub, padding: "20px 0" }}>No bank accounts yet — add your first one above.</div></Card>
        ) : bankAccounts.map((a) => (
          <Card key={a.id} style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.infoSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={16} color={C.info} /></div>
              <Badge text={a.account_type} tone="info" />
            </div>
            <div style={{ marginTop: 12, fontWeight: 800, fontSize: 14 }}>{a.name}</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>A/c {a.account_number || "—"} · IFSC {a.ifsc || "—"}</div>
            <button
              onClick={() => openLedger(a.id)}
              title="View account ledger"
              style={{ marginTop: 12, fontSize: 20, fontWeight: 800, color: C.primaryDark, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
            >
              {fmtINR(a.balance)}
            </button>
            <div style={{ marginTop: 4, fontSize: 11.5, color: C.info, fontWeight: 700, cursor: "pointer" }} onClick={() => openLedger(a.id)}>View Ledger →</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="Recent Transactions" subtitle="Bank & cash movement — auto-synced from Sales, Purchases, Expenses, Payroll & Assets" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} style={{ ...inputStyle, width: 150 }} title="From date" />
          <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} style={{ ...inputStyle, width: 150 }} title="To date" />
          <select value={filters.bank_account_id} onChange={(e) => setFilters({ ...filters, bank_account_id: e.target.value })} style={{ ...inputStyle, width: 170 }}>
            <option value="">All Accounts</option>
            {bankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filters.txn_type} onChange={(e) => setFilters({ ...filters, txn_type: e.target.value })} style={{ ...inputStyle, width: 130 }}>
            <option value="">All Types</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </select>
          <select value={filters.source_module} onChange={(e) => setFilters({ ...filters, source_module: e.target.value })} style={{ ...inputStyle, width: 150 }}>
            <option value="">All Sources</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
            <option value="Expense">Expense</option>
            <option value="Payroll">Payroll</option>
            <option value="Assets">Assets</option>
            <option value="Manual">Manual</option>
          </select>
          {(filters.date_from || filters.date_to || filters.bank_account_id || filters.txn_type || filters.source_module) && (
            <Btn variant="ghost" onClick={() => setFilters({ date_from: "", date_to: "", bank_account_id: "", txn_type: "", source_module: "" })}>Clear</Btn>
          )}
        </div>

        {txns.loading ? <LoadingBlock /> : txns.error ? <ErrorBlock message={txns.error} onRetry={txns.reload} /> : (
          <Table
            columns={[{ label: "Date" }, { label: "Description" }, { label: "Account" }, { label: "Source" }, { label: "Type" }, { label: "Amount", align: "right" }, { label: "Reconciled" }, { label: "Actions", align: "right" }]}
            rows={bankTxns}
            emptyText="No transactions recorded yet."
            renderRow={(t) => {
              const isManual = !t.auto_generated;
              return (
                <>
                  <Td>{new Date(t.txn_date).toLocaleDateString("en-IN")}</Td>
                  <Td>{t.description || "—"}</Td>
                  <Td style={{ color: C.sub }}>{t.account_name}</Td>
                  <Td><Badge text={t.source || "Manual"} tone={SOURCE_TONES[t.source] || "default"} /></Td>
                  <Td>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: t.txn_type === "Credit" ? C.primary : C.danger, fontWeight: 700 }}>
                      {t.txn_type === "Credit" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{t.txn_type}
                    </span>
                  </Td>
                  <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(t.amount)}</Td>
                  <Td>
                    {t.reconciled ? <Badge text="Reconciled" tone="success" /> : (
                      <button onClick={() => reconcileBankTransaction(t.id).then(reloadAll)} style={{ border: `1px solid ${C.warn}40`, background: C.warnSoft, color: C.warn, borderRadius: 7, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Mark Reconciled
                      </button>
                    )}
                  </Td>
                  <Td align="right">
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => openLedger(t.bank_account_id)} title="View in ledger" style={{ border: `1px solid ${C.border}`, background: "#fff", borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.sub, display: "inline-flex" }}>
                        <Eye size={14} />
                      </button>
                      {isManual ? (
                        <>
                          <button onClick={() => setEditTarget(t)} title="Edit" style={{ border: `1px solid ${C.border}`, background: "#fff", borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.info, display: "inline-flex" }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => { setDeleteErr(""); setDeleteTarget(t); }} title="Delete" style={{ border: `1px solid ${C.danger}40`, background: C.dangerSoft, borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.danger, display: "inline-flex" }}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span title="Managed by its source module — edit/delete there instead" style={{ border: `1px solid ${C.border}`, background: "#f8fafc", borderRadius: 7, padding: "5px 7px", color: C.sub, display: "inline-flex" }}>
                          <Lock size={14} />
                        </span>
                      )}
                    </div>
                  </Td>
                </>
              );
            }}
          />
        )}
      </Card>

      {showAddAccount && <AddBankAccountModal onClose={() => setShowAddAccount(false)} onSaved={() => { setShowAddAccount(false); reloadAll(); }} />}
      {showAddTxn && <AddBankTxnModal accounts={bankAccounts} onClose={() => setShowAddTxn(false)} onSaved={() => { setShowAddTxn(false); reloadAll(); }} />}
      {editTarget && <EditBankTxnModal txn={editTarget} accounts={bankAccounts} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); reloadAll(); }} />}

      {deleteTarget && (
        <Modal title="Delete Transaction" onClose={() => !deleting && setDeleteTarget(null)} width={420}>
          {deleteErr && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{deleteErr}</div>}
          <div style={{ fontSize: 13.5, color: C.text, marginBottom: 18 }}>
            Are you sure you want to delete this transaction?
            <div style={{ marginTop: 6, fontWeight: 700 }}>{deleteTarget.description || "Untitled transaction"} — {fmtINR(deleteTarget.amount)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Btn>
            <Btn onClick={confirmDelete} disabled={deleting} style={{ background: C.danger }}>{deleting ? "Deleting..." : "Delete"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function BankLedgerView({ accountId, onBack, onViewStatement }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const ledger = useApi(() => fetchBankAccountLedger(accountId, { date_from: dateFrom || undefined, date_to: dateTo || undefined }), [accountId, dateFrom, dateTo]);

  if (ledger.loading) return <LoadingBlock label="Loading account ledger…" />;
  if (ledger.error) return <ErrorBlock message={ledger.error} onRetry={ledger.reload} />;

  const d = ledger.data.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <Btn variant="outline" icon={ArrowLeft} onClick={onBack}>Back to Cash & Bank</Btn>
        <Btn icon={FileSpreadsheet} onClick={onViewStatement}>View Bank Statement</Btn>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Landmark} label={d.account.name} value={fmtINR(d.closingBalance)} sub="Current balance" tint={C.primarySoft} />
        <StatCard icon={Wallet} label="Opening Balance (period)" value={fmtINR(d.openingBalance)} tint={C.infoSoft} />
      </div>

      <Card>
        <SectionHeader title="Account Ledger" subtitle="Running balance across all transactions"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 150 }} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ ...inputStyle, width: 150 }} />
            </div>
          } />
        <Table
          columns={[{ label: "Date" }, { label: "Description" }, { label: "Source" }, { label: "Debit", align: "right" }, { label: "Credit", align: "right" }, { label: "Running Balance", align: "right" }]}
          rows={d.rows}
          emptyText="No transactions in this period."
          renderRow={(t) => (
            <>
              <Td>{new Date(t.txn_date).toLocaleDateString("en-IN")}</Td>
              <Td>{t.description || "—"}</Td>
              <Td><Badge text={t.source || "Manual"} tone={SOURCE_TONES[t.source] || "default"} /></Td>
              <Td align="right" style={{ color: C.danger }}>{t.txn_type === "Debit" ? fmtINR(t.amount) : "—"}</Td>
              <Td align="right" style={{ color: C.primary }}>{t.txn_type === "Credit" ? fmtINR(t.amount) : "—"}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(t.running_balance)}</Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

function BankStatementView({ accountId, onBack }) {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(1)).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const stmt = useApi(() => fetchBankStatement(accountId, { date_from: dateFrom, date_to: dateTo }), [accountId, dateFrom, dateTo]);

  if (stmt.loading) return <LoadingBlock label="Preparing bank statement…" />;
  if (stmt.error) return <ErrorBlock message={stmt.error} onRetry={stmt.reload} />;

  const d = stmt.data.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Btn variant="outline" icon={ArrowLeft} onClick={onBack}>Back to Ledger</Btn>

      <Card>
        <SectionHeader title={`Bank Statement — ${d.account.name}`} subtitle={`${dateFrom} to ${dateTo}`}
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 150 }} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ ...inputStyle, width: 150 }} />
              <Btn icon={Download} variant="outline">Export</Btn>
            </div>
          } />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <StatCard icon={Wallet} label="Opening Balance" value={fmtINR(d.openingBalance)} tint={C.infoSoft} />
          <StatCard icon={ArrowUpRight} label="Total Receipts" value={fmtINR(d.receipts)} tint={C.primarySoft} />
          <StatCard icon={ArrowDownRight} label="Total Payments" value={fmtINR(d.payments)} tint={C.dangerSoft} />
          <StatCard icon={Landmark} label="Closing Balance" value={fmtINR(d.closingBalance)} tint={C.purpleSoft} />
        </div>
        <Table
          columns={[{ label: "Date" }, { label: "Description" }, { label: "Source" }, { label: "Debit", align: "right" }, { label: "Credit", align: "right" }, { label: "Balance", align: "right" }]}
          rows={d.rows}
          emptyText="No transactions in this period."
          renderRow={(t) => (
            <>
              <Td>{new Date(t.txn_date).toLocaleDateString("en-IN")}</Td>
              <Td>{t.description || "—"}</Td>
              <Td><Badge text={t.source || "Manual"} tone={SOURCE_TONES[t.source] || "default"} /></Td>
              <Td align="right" style={{ color: C.danger }}>{t.txn_type === "Debit" ? fmtINR(t.amount) : "—"}</Td>
              <Td align="right" style={{ color: C.primary }}>{t.txn_type === "Credit" ? fmtINR(t.amount) : "—"}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(t.running_balance)}</Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

function AddBankAccountModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", account_number: "", ifsc: "", account_type: "Current", opening_balance: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.name) { setErr("Account name is required."); return; }
    try {
      setSaving(true); setErr("");
      await createBankAccount({ ...form, opening_balance: parseFloat(form.opening_balance) || 0 });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Add Bank / Cash Account" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Account Name *</label>
      <input value={form.name} onChange={f("name")} placeholder="e.g. HDFC Bank — Current A/c" style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Account Number</label>
      <input value={form.account_number} onChange={f("account_number")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>IFSC</label>
      <input value={form.ifsc} onChange={f("ifsc")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Type</label>
      <select value={form.account_type} onChange={f("account_type")} style={{ ...inputStyle, marginBottom: 12 }}>
        <option>Current</option><option>Cash Credit</option><option>Cash</option>
      </select>
      <label style={labelStyle}>Opening Balance</label>
      <input type="number" value={form.opening_balance} onChange={f("opening_balance")} style={{ ...inputStyle, marginBottom: 18 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Account"}</Btn>
      </div>
    </Modal>
  );
}

function AddBankTxnModal({ accounts, onClose, onSaved }) {
  const [form, setForm] = useState({ bank_account_id: accounts[0]?.id || "", txn_date: new Date().toISOString().slice(0, 10), description: MANUAL_TXN_REASONS[0], txn_type: "Credit", amount: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.bank_account_id || !form.amount) { setErr("Account and amount are required."); return; }
    try {
      setSaving(true); setErr("");
      await createBankTransaction({ ...form, amount: parseFloat(form.amount) });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Add Bank / Cash Transaction" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, background: C.infoSoft, padding: "8px 12px", borderRadius: 8 }}>
        For manual banking activity only — Sales, Purchase, Expense, Payroll and Fixed Asset payments post here automatically.
      </div>
      <label style={labelStyle}>Account</label>
      <select value={form.bank_account_id} onChange={f("bank_account_id")} style={{ ...inputStyle, marginBottom: 12 }}>
        {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <label style={labelStyle}>Date</label>
      <input type="date" value={form.txn_date} onChange={f("txn_date")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Reason</label>
      <select value={form.description} onChange={f("description")} style={{ ...inputStyle, marginBottom: 12 }}>
        {MANUAL_TXN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <label style={labelStyle}>Type</label>
      <select value={form.txn_type} onChange={f("txn_type")} style={{ ...inputStyle, marginBottom: 12 }}>
        <option>Credit</option><option>Debit</option>
      </select>
      <label style={labelStyle}>Amount</label>
      <input type="number" value={form.amount} onChange={f("amount")} style={{ ...inputStyle, marginBottom: 18 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Transaction"}</Btn>
      </div>
    </Modal>
  );
}

function EditBankTxnModal({ txn, accounts, onClose, onSaved }) {
  const [form, setForm] = useState({
    bank_account_id: txn.bank_account_id,
    txn_date: txn.txn_date ? new Date(txn.txn_date).toISOString().slice(0, 10) : "",
    description: txn.description || "",
    txn_type: txn.txn_type,
    amount: txn.amount,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.bank_account_id || !form.amount) { setErr("Account and amount are required."); return; }
    try {
      setSaving(true); setErr("");
      await updateBankTransaction(txn.id, { ...form, amount: parseFloat(form.amount) });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Edit Transaction" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Account</label>
      <select value={form.bank_account_id} onChange={f("bank_account_id")} style={{ ...inputStyle, marginBottom: 12 }}>
        {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <label style={labelStyle}>Date</label>
      <input type="date" value={form.txn_date} onChange={f("txn_date")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Description</label>
      <input value={form.description} onChange={f("description")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Type</label>
      <select value={form.txn_type} onChange={f("txn_type")} style={{ ...inputStyle, marginBottom: 12 }}>
        <option>Credit</option><option>Debit</option>
      </select>
      <label style={labelStyle}>Amount</label>
      <input type="number" value={form.amount} onChange={f("amount")} style={{ ...inputStyle, marginBottom: 18 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
      </div>
    </Modal>
  );
}
/* ============================================================
   TAB 6 — GST & TAX MANAGEMENT
   ============================================================ */
function GSTTab() {
  const [gstSubTab, setGstSubTab] = useState("overview");
  const { data, loading, error, reload } = useApi(fetchGST);
  const ledger = useApi(fetchGSTLedger, [gstSubTab === "ledger"]);
  const trend = useApi(fetchGSTTrend, [gstSubTab === "trend"]);
  const hsn = useApi(fetchGSTHSNSummary, [gstSubTab === "hsn"]);
  const byState = useApi(fetchGSTByState, [gstSubTab === "state"]);

  if (loading) return <LoadingBlock label="Calculating GST from invoices & bills…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const g = data.data;
  const taxRates = data.taxRates || [];
  const returns = data.returns || [];
  const breakup = g.breakup || { cgst: 0, sgst: 0, igst: 0 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 9, width: "fit-content" }}>
{[{ id: "overview", label: "Overview" }, { id: "ledger", label: "GST Ledger" }, { id: "trend", label: "Monthly Trend" }, { id: "hsn", label: "HSN Summary" }, { id: "state", label: "By State" }, { id: "settings", label: "Settings" }].map((t) => (
          <button key={t.id} onClick={() => setGstSubTab(t.id)} style={{
            padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
            background: gstSubTab === t.id ? "#fff" : "transparent", color: gstSubTab === t.id ? C.primaryDark : C.sub,
            boxShadow: gstSubTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>{t.label}</button>
        ))}
      </div>

      {gstSubTab === "overview" && (
      <>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Percent} label="Output GST (Sales, this month)" value={fmtINR(g.outputGST)} tint={C.dangerSoft} />
        <StatCard icon={Percent} label="Input GST — ITC (this month)" value={fmtINR(g.inputGST)} tint={C.primarySoft} />
        <StatCard icon={Wallet} label="Net GST Payable" value={fmtINR(g.netPayable)} tint={C.warnSoft} sub={g.period} />
      </div>
      <Card>
        <SectionHeader title="CGST / SGST / IGST Breakup" subtitle="Net position (output minus input) for the current month" />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{fmtINR(breakup.cgst)}</div>
            <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginTop: 4 }}>CGST</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{fmtINR(breakup.sgst)}</div>
            <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginTop: 4 }}>SGST</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{fmtINR(breakup.igst)}</div>
            <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginTop: 4 }}>IGST</div>
          </div>
        </div>
      </Card>
      </>
      )}

      {gstSubTab === "ledger" && (
        ledger.loading ? <LoadingBlock /> : ledger.error ? <ErrorBlock message={ledger.error} onRetry={ledger.reload} /> : (
<Card>
            <SectionHeader title="GST Ledger" subtitle="Every GST-bearing transaction, from Sales and Purchases"
              action={<Btn icon={Download} variant="outline" onClick={() => downloadCSV("gst-ledger.csv", ledger.data.data || [])}>Export</Btn>} />
            <Table
              columns={[{ label: "Date" }, { label: "Ref" }, { label: "Source" }, { label: "CGST", align: "right" }, { label: "SGST", align: "right" }, { label: "IGST", align: "right" }, { label: "Total GST", align: "right" }]}
              rows={ledger.data.data || []}
              emptyText="No GST transactions yet."
              renderRow={(r) => (
                <>
                  <Td>{new Date(r.date).toLocaleDateString("en-IN")}</Td>
                  <Td style={{ fontWeight: 700 }}>{r.ref}</Td>
                  <Td><Badge text={r.source} tone={r.source === "Sales" ? "success" : "warn"} /></Td>
                  <Td align="right">{fmtINR(r.cgst_amt)}</Td>
                  <Td align="right">{fmtINR(r.sgst_amt)}</Td>
                  <Td align="right">{fmtINR(r.igst_amt)}</Td>
                  <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.total_gst)}</Td>
                </>
              )}
            />
          </Card>
        )
      )}

      {gstSubTab === "trend" && (
        trend.loading ? <LoadingBlock /> : trend.error ? <ErrorBlock message={trend.error} onRetry={trend.reload} /> : (
          <Card>
            <SectionHeader title="Monthly GST Trend" subtitle="Output vs Input GST, last 12 months" />
            <Table
              columns={[{ label: "Month" }, { label: "Output GST", align: "right" }, { label: "Input GST", align: "right" }, { label: "Net", align: "right" }]}
              rows={trend.data.data || []}
              emptyText="No GST activity in the last 12 months."
              renderRow={(r) => (
                <>
                  <Td style={{ fontWeight: 700 }}>{r.month}</Td>
                  <Td align="right">{fmtINR(r.outputGST)}</Td>
                  <Td align="right">{fmtINR(r.inputGST)}</Td>
                  <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.outputGST - r.inputGST)}</Td>
                </>
              )}
            />
          </Card>
        )
      )}
    {gstSubTab === "hsn" && (
        hsn.loading ? <LoadingBlock label="Grouping line items by HSN/SAC code…" /> : hsn.error ? <ErrorBlock message={hsn.error} onRetry={hsn.reload} /> : (
          <>
            <Card>
              <SectionHeader title="HSN Summary — Sales" subtitle="Grouped by HSN/SAC code from sale line items"
                action={<Btn icon={Download} variant="outline" onClick={() => downloadCSV("hsn-summary-sales.csv", hsn.data.data.sales || [])}>Export</Btn>} />
              <Table
                columns={[{ label: "HSN Code" }, { label: "Txns", align: "right" }, { label: "Taxable Value", align: "right" }, { label: "CGST", align: "right" }, { label: "SGST", align: "right" }, { label: "IGST", align: "right" }, { label: "Total Tax", align: "right" }]}
                rows={hsn.data.data.sales || []}
                emptyText="No sales line items yet."
                renderRow={(r) => (
                  <>
                    <Td style={{ fontWeight: 700 }}>{r.hsnCode}</Td>
                    <Td align="right">{r.txnCount}</Td>
                    <Td align="right">{fmtINR(r.taxableValue)}</Td>
                    <Td align="right">{fmtINR(r.cgst)}</Td>
                    <Td align="right">{fmtINR(r.sgst)}</Td>
                    <Td align="right">{fmtINR(r.igst)}</Td>
                    <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.totalTax)}</Td>
                  </>
                )}
              />
            </Card>
            <Card>
              <SectionHeader title="HSN Summary — Purchases" subtitle="Grouped by HSN/SAC code from purchase line items"
                action={<Btn icon={Download} variant="outline" onClick={() => downloadCSV("hsn-summary-purchases.csv", hsn.data.data.purchases || [])}>Export</Btn>} />
              <Table
                columns={[{ label: "HSN Code" }, { label: "Txns", align: "right" }, { label: "Taxable Value", align: "right" }, { label: "CGST", align: "right" }, { label: "SGST", align: "right" }, { label: "IGST", align: "right" }, { label: "Total Tax", align: "right" }]}
                rows={hsn.data.data.purchases || []}
                emptyText="No purchase line items yet."
                renderRow={(r) => (
                  <>
                    <Td style={{ fontWeight: 700 }}>{r.hsnCode}</Td>
                    <Td align="right">{r.txnCount}</Td>
                    <Td align="right">{fmtINR(r.taxableValue)}</Td>
                    <Td align="right">{fmtINR(r.cgst)}</Td>
                    <Td align="right">{fmtINR(r.sgst)}</Td>
                    <Td align="right">{fmtINR(r.igst)}</Td>
                    <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.totalTax)}</Td>
                  </>
                )}
              />
            </Card>
            {(hsn.data.data.sales || []).every((r) => r.hsnCode === "Unspecified") && (
              <div style={{ fontSize: 12.5, color: C.warn, background: C.warnSoft, padding: "10px 14px", borderRadius: 8 }}>
                All rows show "Unspecified" — add HSN/SAC codes on your Products to make this report useful for GSTR-1 filing.
              </div>
            )}
          </>
        )
      )}

      {gstSubTab === "state" && (
        byState.loading ? <LoadingBlock label="Grouping invoices by customer/supplier state…" /> : byState.error ? <ErrorBlock message={byState.error} onRetry={byState.reload} /> : (
          <>
            <Card>
              <SectionHeader title="GST by State — Sales" subtitle="Grouped by customer's billing state"
                action={<Btn icon={Download} variant="outline" onClick={() => downloadCSV("gst-by-state-sales.csv", byState.data.data.sales || [])}>Export</Btn>} />
              <Table
                columns={[{ label: "State" }, { label: "Invoices", align: "right" }, { label: "Taxable Value", align: "right" }, { label: "CGST", align: "right" }, { label: "SGST", align: "right" }, { label: "IGST", align: "right" }, { label: "Total Tax", align: "right" }]}
                rows={byState.data.data.sales || []}
                emptyText="No sales invoices with a linked customer yet."
                renderRow={(r) => (
                  <>
                    <Td style={{ fontWeight: 700 }}>{r.state}</Td>
                    <Td align="right">{r.invoiceCount}</Td>
                    <Td align="right">{fmtINR(r.taxableValue)}</Td>
                    <Td align="right">{fmtINR(r.cgst)}</Td>
                    <Td align="right">{fmtINR(r.sgst)}</Td>
                    <Td align="right">{fmtINR(r.igst)}</Td>
                    <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.totalTax)}</Td>
                  </>
                )}
              />
            </Card>
            <Card>
              <SectionHeader title="GST by State — Purchases" subtitle="Grouped by supplier's billing state"
                action={<Btn icon={Download} variant="outline" onClick={() => downloadCSV("gst-by-state-purchases.csv", byState.data.data.purchases || [])}>Export</Btn>} />
              <Table
                columns={[{ label: "State" }, { label: "Bills", align: "right" }, { label: "Taxable Value", align: "right" }, { label: "CGST", align: "right" }, { label: "SGST", align: "right" }, { label: "IGST", align: "right" }, { label: "Total Tax", align: "right" }]}
                rows={byState.data.data.purchases || []}
                emptyText="No purchase bills with a linked supplier yet."
                renderRow={(r) => (
                  <>
                    <Td style={{ fontWeight: 700 }}>{r.state}</Td>
                    <Td align="right">{r.invoiceCount}</Td>
                    <Td align="right">{fmtINR(r.taxableValue)}</Td>
                    <Td align="right">{fmtINR(r.cgst)}</Td>
                    <Td align="right">{fmtINR(r.sgst)}</Td>
                    <Td align="right">{fmtINR(r.igst)}</Td>
                    <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.totalTax)}</Td>
                  </>
                )}
              />
            </Card>
          </>
        )
      )}

      {gstSubTab === "settings" && <GSTSettingsPanel />}
      <Card>
        <SectionHeader title="GST by Quarter" subtitle="Taxable value, sales tax & purchase tax — from sales_invoices.tax_amt / purchases.tax_amount" />
        <Table
          columns={[{ label: "Period" }, { label: "Taxable Value", align: "right" }, { label: "Sales Tax (Output)", align: "right" }, { label: "Purchase Tax (Input)", align: "right" }, { label: "Net Payable", align: "right" }]}
          rows={returns}
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.period}</Td>
              <Td align="right">{fmtINR(r.taxable)}</Td>
              <Td align="right">{fmtINR(r.salesTax)}</Td>
              <Td align="right">{fmtINR(r.purchaseTax)}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.salesTax - r.purchaseTax)}</Td>
            </>
          )}
        />
      </Card>

      <Card>
        <SectionHeader title="Tax Rate Usage" subtitle="Live count of products at each GST rate (from products.tax)" />
        <Table
          columns={[{ label: "GST Rate" }, { label: "Products at this rate", align: "right" }]}
          rows={taxRates}
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.rate}%</Td>
              <Td align="right">{r.productCount}</Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
function GSTSettingsPanel() {
  const { data, loading, error, reload } = useApi(fetchGSTSettings);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (data?.data) setForm(data.data); }, [data]);

  if (loading || !form) return <LoadingBlock label="Loading GST settings…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      await updateGSTSettings(form);
      setSaved(true);
      reload();
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <SectionHeader title="GST Settings" subtitle="Business GSTIN, state & default rates — used to auto-split CGST/SGST vs IGST on every invoice and bill" />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={labelStyle}>Business GSTIN</label>
          <input value={form.business_gstin || ""} onChange={f("business_gstin")} placeholder="e.g. 33ABCDE1234F1Z5" style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={labelStyle}>Business State</label>
          <input value={form.business_state || ""} onChange={f("business_state")} placeholder="e.g. Tamil Nadu" style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={labelStyle}>Default CGST %</label>
          <input type="number" value={form.default_cgst_rate || 0} onChange={f("default_cgst_rate")} style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={labelStyle}>Default SGST %</label>
          <input type="number" value={form.default_sgst_rate || 0} onChange={f("default_sgst_rate")} style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={labelStyle}>Default IGST %</label>
          <input type="number" value={form.default_igst_rate || 0} onChange={f("default_igst_rate")} style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={labelStyle}>Default CESS %</label>
          <input type="number" value={form.default_cess_rate || 0} onChange={f("default_cess_rate")} style={inputStyle} />
        </div>
      </div>
     <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
          <input type="checkbox" checked={!!form.reverse_charge_enabled} onChange={(e) => setForm({ ...form, reverse_charge_enabled: e.target.checked })} />
          Reverse Charge Enabled
          <span
            title="Under Reverse Charge Mechanism (RCM), the buyer pays GST directly to the government instead of the supplier — common for purchases from unregistered dealers or specific notified goods/services."
            style={{ display: "inline-flex", cursor: "help", color: C.sub }}
          >
            <Info size={14} />
          </span>
        </label>
        <select value={form.filing_frequency || "Monthly"} onChange={f("filing_frequency")} style={{ ...inputStyle, width: 160 }}>
          <option>Monthly</option><option>Quarterly</option>
        </select>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        {saved && <Badge text="Saved" tone="success" />}
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Btn>
      </div>
    </Card>
  );
}

/* ============================================================
   TAB 7 — FIXED ASSETS
   ============================================================ */
function FixedAssetsTab() {
  const { data, loading, error, reload } = useApi(fetchFixedAssets);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  const confirmDeleteAsset = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true); setDeleteErr("");
      await deleteFixedAsset(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (e) {
      setDeleteErr(e.message || "Failed to delete asset.");
    } finally {
      setDeleting(false);
    }
  };
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState(null);
  if (loading) return <LoadingBlock label="Loading fixed asset register…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const assets = data.data || [];
const nonDisposed = assets.filter((a) => a.status !== "Disposed");
  const activeCount = assets.filter((a) => a.status === "Active" || a.status === "In Use").length;
  const totalCost = nonDisposed.reduce((s, a) => s + Number(a.cost), 0);
  const totalNBV = nonDisposed.reduce((s, a) => s + a.nbv, 0);
  const totalDep = nonDisposed.reduce((s, a) => s + a.accumDep, 0);

  const runDepreciation = async () => {
    setPosting(true); setPostMsg(null);
    try {
      const res = await postMonthlyDepreciation();
      const count = res.data?.postedCount ?? 0;
      setPostMsg(count > 0 ? `✅ Posted depreciation for ${count} asset(s)` : "✅ Already posted for this month — nothing new to post");
      reload();
    } catch (e) {
      setPostMsg(`❌ ${e.message}`);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Boxes} label="Gross Asset Value" value={fmtINR(totalCost)} tint={C.infoSoft} />
        <StatCard icon={TrendingDown} label="Accum. Depreciation" value={fmtINR(totalDep)} tint={C.dangerSoft} />
        <StatCard icon={Landmark} label="Net Book Value" value={fmtINR(totalNBV)} tint={C.primarySoft} />
  <StatCard icon={Boxes} label="Active Assets" value={activeCount} tint={C.purpleSoft} />
      </div>

      <Card>
        <SectionHeader title="Fixed Asset Register" subtitle="Cost, method & depreciation calculated live"
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {postMsg && <span style={{ fontSize: 12.5, color: postMsg.startsWith("✅") ? C.primary : C.danger, fontWeight: 600 }}>{postMsg}</span>}
<Btn icon={CheckCircle2} variant="outline" onClick={runDepreciation} disabled={posting || nonDisposed.length === 0}>
                {posting ? "Posting..." : "Post This Month's Depreciation"}
              </Btn>
              <Btn icon={Plus} onClick={() => setShowAdd(true)}>Add Asset</Btn>
            </div>
          } />
       <Table
          columns={[{ label: "Code" }, { label: "Name" }, { label: "Category" }, { label: "Purchase Date" }, { label: "Cost", align: "right" }, { label: "Method" }, { label: "Accum. Dep.", align: "right" }, { label: "NBV", align: "right" }, { label: "Status" }, { label: "Actions", align: "right" }]}
          rows={assets}
          emptyText="No fixed assets recorded yet — add machinery, vehicles or equipment above."
          renderRow={(a) => (
            <>
              <Td style={{ fontWeight: 700 }}>{a.asset_code}</Td>
              <Td>{a.name}</Td>
              <Td style={{ color: C.sub }}>{a.category || "—"}</Td>
              <Td>{new Date(a.purchase_date).toLocaleDateString("en-IN")}</Td>
              <Td align="right">{fmtINR(a.cost)}</Td>
              <Td><Badge text={a.method} tone="info" /></Td>
              <Td align="right" style={{ color: C.danger }}>{fmtINR(a.accumDep)}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(a.nbv)}</Td>
              <Td>
                {a.status !== "Disposed" ? (
                  <button onClick={() => disposeFixedAsset(a.id).then(reload)} style={{ border: `1px solid ${C.border}`, background: "#fff", borderRadius: 7, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: C.sub }}>
                    Mark Disposed
                  </button>
                ) : <Badge text="Disposed" tone="default" />}
              </Td>
          <Td align="right">
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => setHistoryTarget(a)} title="Depreciation history" style={{ border: `1px solid ${C.border}`, background: "#fff", borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.sub, display: "inline-flex" }}>
                    <Clock size={14} />
                  </button>
                  {a.status !== "Disposed" && (
                    <button onClick={() => setEditTarget(a)} title="Edit asset" style={{ border: `1px solid ${C.border}`, background: "#fff", borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.info, display: "inline-flex" }}>
                      <Pencil size={14} />
                    </button>
                  )}
                  <button onClick={() => { setDeleteErr(""); setDeleteTarget(a); }} title="Delete asset" style={{ border: `1px solid ${C.danger}40`, background: C.dangerSoft, borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.danger, display: "inline-flex" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </Td>
            </>
          )}
        />
      </Card>

  {showAdd && <AddFixedAssetModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); reload(); }} />}
      {editTarget && <EditFixedAssetModal asset={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); reload(); }} />}
      {historyTarget && <DepreciationHistoryModal asset={historyTarget} onClose={() => setHistoryTarget(null)} />}

      {deleteTarget && (
        <Modal title="Delete Fixed Asset" onClose={() => !deleting && setDeleteTarget(null)} width={420}>
          {deleteErr && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{deleteErr}</div>}
          <div style={{ fontSize: 13.5, color: C.text, marginBottom: 18 }}>
            Are you sure you want to delete this asset? This also removes its depreciation history.
            <div style={{ marginTop: 6, fontWeight: 700 }}>{deleteTarget.name} — {fmtINR(deleteTarget.cost)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Btn>
            <Btn onClick={confirmDeleteAsset} disabled={deleting} style={{ background: C.danger }}>{deleting ? "Deleting..." : "Delete Asset"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AddFixedAssetModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ asset_code: "", name: "", category: "", purchase_date: new Date().toISOString().slice(0, 10), cost: "", method: "SLM", useful_life_yrs: "5", salvage_value: "0" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.asset_code || !form.name || !form.cost) { setErr("Asset code, name and cost are required."); return; }
    try {
      setSaving(true); setErr("");
      await createFixedAsset({ ...form, cost: parseFloat(form.cost), useful_life_yrs: parseFloat(form.useful_life_yrs), salvage_value: parseFloat(form.salvage_value) || 0 });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Add Fixed Asset" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Asset Code *</label>
      <input value={form.asset_code} onChange={f("asset_code")} placeholder="FA-001" style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Name *</label>
      <input value={form.name} onChange={f("name")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Category</label>
      <input value={form.category} onChange={f("category")} placeholder="Plant & Machinery / Vehicle / Office Equipment" style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Purchase Date</label>
      <input type="date" value={form.purchase_date} onChange={f("purchase_date")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Cost *</label>
      <input type="number" value={form.cost} onChange={f("cost")} style={{ ...inputStyle, marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Method</label>
          <select value={form.method} onChange={f("method")} style={inputStyle}><option>SLM</option><option>WDV</option></select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Useful Life (yrs)</label>
          <input type="number" value={form.useful_life_yrs} onChange={f("useful_life_yrs")} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Salvage Value</label>
          <input type="number" value={form.salvage_value} onChange={f("salvage_value")} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Asset"}</Btn>
      </div>
    </Modal>
  );
}
function EditFixedAssetModal({ asset, onClose, onSaved }) {
  const [form, setForm] = useState({
    asset_code: asset.asset_code, name: asset.name, category: asset.category || "",
    purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toISOString().slice(0, 10) : "",
    cost: asset.cost, method: asset.method, useful_life_yrs: asset.useful_life_yrs, salvage_value: asset.salvage_value,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.asset_code || !form.name || !form.cost) { setErr("Asset code, name and cost are required."); return; }
    try {
      setSaving(true); setErr("");
      await updateFixedAsset(asset.id, { ...form, cost: parseFloat(form.cost), useful_life_yrs: parseFloat(form.useful_life_yrs), salvage_value: parseFloat(form.salvage_value) || 0 });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Edit Fixed Asset" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Asset Code *</label>
      <input value={form.asset_code} onChange={f("asset_code")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Name *</label>
      <input value={form.name} onChange={f("name")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Category</label>
      <input value={form.category} onChange={f("category")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Purchase Date</label>
      <input type="date" value={form.purchase_date} onChange={f("purchase_date")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Cost *</label>
      <input type="number" value={form.cost} onChange={f("cost")} style={{ ...inputStyle, marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Method</label>
          <select value={form.method} onChange={f("method")} style={inputStyle}><option>SLM</option><option>WDV</option></select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Useful Life (yrs)</label>
          <input type="number" value={form.useful_life_yrs} onChange={f("useful_life_yrs")} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Salvage Value</label>
          <input type="number" value={form.salvage_value} onChange={f("salvage_value")} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
      </div>
    </Modal>
  );
}

function DepreciationHistoryModal({ asset, onClose }) {
  const { data, loading, error, reload } = useApi(() => fetchAssetDepreciationLog(asset.id), [asset.id]);
  return (
    <Modal title={`Depreciation History — ${asset.name}`} onClose={onClose} width={520}>
      {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : (
        <Table
          columns={[{ label: "Period" }, { label: "Amount", align: "right" }, { label: "Posted At" }]}
          rows={data.data || []}
          emptyText="No depreciation posted yet for this asset."
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.period}</Td>
              <Td align="right">{fmtINR(r.amount)}</Td>
              <Td style={{ color: C.sub }}>{new Date(r.posted_at).toLocaleDateString("en-IN")}</Td>
            </>
          )}
        />
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <Btn variant="outline" onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
}
/* ============================================================
   TAB 8 — COST CENTER & PRODUCT COSTING
   ============================================================ */
function CostCenterTab() {
  const centers = useApi(fetchCostCenters);
  const costing = useApi(fetchProductCosting);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  if (centers.loading) return <LoadingBlock label="Loading cost centers…" />;
  if (centers.error) return <ErrorBlock message={centers.error} onRetry={centers.reload} />;

  const rows = centers.data.data || [];
  const totalBudget = rows.reduce((s, c) => s + Number(c.budget), 0);
  const totalActual = rows.reduce((s, c) => s + Number(c.actual), 0);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true); setDeleteErr("");
      await deleteCostCenter(deleteTarget.id);
      setDeleteTarget(null);
      centers.reload();
    } catch (e) {
      setDeleteErr(e.message || "Failed to delete cost center.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Factory} label="Total Cost Center Budget" value={fmtINR(totalBudget)} tint={C.infoSoft} />
        <StatCard icon={Wallet} label="Actual Spend" value={fmtINR(totalActual)} tint={C.warnSoft} />
        <StatCard icon={totalActual <= totalBudget ? TrendingUp : TrendingDown} label="Net Variance" value={fmtINR(totalBudget - totalActual)} tint={totalActual <= totalBudget ? C.primarySoft : C.dangerSoft} />
      </div>

      <Card>
        <SectionHeader title="Cost Centers" subtitle="Budget vs. actual — actual matched live against expenses.location/department" action={<Btn icon={Plus} variant="outline" onClick={() => setShowAdd(true)}>Add Cost Center</Btn>} />
        <Table
          columns={[{ label: "Code" }, { label: "Cost Center" }, { label: "Head" }, { label: "Budget", align: "right" }, { label: "Actual", align: "right" }, { label: "Variance", align: "right" }, { label: "Utilization" }, { label: "Actions", align: "right" }]}
          rows={rows}
          emptyText="No cost centers yet — add one and link it to a department/location above."
          renderRow={(c) => (
            <>
              <Td style={{ fontWeight: 700, color: C.sub }}>{c.code}</Td>
              <Td style={{ fontWeight: 700 }}>{c.name}</Td>
              <Td>{c.head_name || "—"}</Td>
              <Td align="right">{fmtINR(c.budget)}</Td>
              <Td align="right">{fmtINR(c.actual)}</Td>
              <Td align="right" style={{ fontWeight: 800, color: c.variance >= 0 ? C.primary : C.danger }}>{c.variance >= 0 ? "+" : ""}{fmtINR(c.variance)}</Td>
              <Td style={{ width: 140 }}><ProgressBar pct={c.budget ? (c.actual / c.budget) * 100 : 0} tone={c.actual > c.budget ? C.danger : C.primary} /></Td>
              <Td align="right">
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => setEditTarget(c)} title="Edit" style={{ border: `1px solid ${C.border}`, background: "#fff", borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.info, display: "inline-flex" }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { setDeleteErr(""); setDeleteTarget(c); }} title="Delete" style={{ border: `1px solid ${C.danger}40`, background: C.dangerSoft, borderRadius: 7, padding: "5px 7px", cursor: "pointer", color: C.danger, display: "inline-flex" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </Td>
            </>
          )}
        />
      </Card>

      <Card>
        <SectionHeader title="Product Costing" subtitle="Live purchase price vs. selling price from products table" />
        {costing.loading ? <LoadingBlock /> : costing.error ? <ErrorBlock message={costing.error} onRetry={costing.reload} /> : (
          <Table
            columns={[{ label: "Product" }, { label: "Cost", align: "right" }, { label: "Selling Price", align: "right" }, { label: "Margin" }]}
            rows={costing.data.data || []}
            emptyText="No priced products found."
            renderRow={(p) => (
              <>
                <Td style={{ fontWeight: 700 }}>{p.product}</Td>
                <Td align="right">{fmtINR(p.totalCost)}</Td>
                <Td align="right">{fmtINR(p.sellingPrice)}</Td>
                <Td><Badge text={p.margin} tone="success" /></Td>
              </>
            )}
          />
        )}
      </Card>

    {showAdd && <AddCostCenterModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); centers.reload(); }} />}
      {editTarget && <EditCostCenterModal center={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); centers.reload(); }} />}

      {deleteTarget && (
        <Modal title="Delete Cost Center" onClose={() => !deleting && setDeleteTarget(null)} width={420}>
          {deleteErr && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{deleteErr}</div>}
          <div style={{ fontSize: 13.5, color: C.text, marginBottom: 18 }}>
            Are you sure you want to delete this cost center?
            <div style={{ marginTop: 6, fontWeight: 700 }}>{deleteTarget.name}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Btn>
            <Btn onClick={confirmDelete} disabled={deleting} style={{ background: C.danger }}>{deleting ? "Deleting..." : "Delete"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AddCostCenterModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ code: "", name: "", budget: "", match_department: "", match_location: "" });
  const [locations, setLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { fetchExpenseLocations().then((res) => setLocations(res.data || [])).catch(() => {}); }, []);

  const save = async () => {
    if (!form.code || !form.name) { setErr("Code and name are required."); return; }
    try {
      setSaving(true); setErr("");
      await createCostCenter({ ...form, budget: parseFloat(form.budget) || 0 });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Add Cost Center" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Code *</label>
      <input value={form.code} onChange={f("code")} placeholder="CC-01" style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Name *</label>
      <input value={form.name} onChange={f("name")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Budget</label>
      <input type="number" value={form.budget} onChange={f("budget")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Match Department/Location (from Expenses)</label>
      <select value={form.match_department} onChange={f("match_department")} style={{ ...inputStyle, marginBottom: 18 }}>
        <option value="">— None —</option>
        {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Cost Center"}</Btn>
      </div>
    </Modal>
  );
}
function EditCostCenterModal({ center, onClose, onSaved }) {
  const [form, setForm] = useState({
    code: center.code, name: center.name, budget: center.budget,
    match_department: center.match_department || "", match_location: center.match_location || "",
  });
  const [locations, setLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { fetchExpenseLocations().then((res) => setLocations(res.data || [])).catch(() => {}); }, []);

  const save = async () => {
    if (!form.code || !form.name) { setErr("Code and name are required."); return; }
    try {
      setSaving(true); setErr("");
      await updateCostCenter(center.id, { ...form, budget: parseFloat(form.budget) || 0 });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Edit Cost Center" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Code *</label>
      <input value={form.code} onChange={f("code")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Name *</label>
      <input value={form.name} onChange={f("name")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Budget</label>
      <input type="number" value={form.budget} onChange={f("budget")} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Match Department/Location (from Expenses)</label>
      <select value={form.match_department} onChange={f("match_department")} style={{ ...inputStyle, marginBottom: 18 }}>
        <option value="">— None —</option>
        {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
      </div>
    </Modal>
  );
}
/* ============================================================
   TAB 9 — FINANCIAL STATEMENTS (P&L, Balance Sheet, Cash Flow, Trial Balance)
   ============================================================ */
function LineRow({ label, amount, bold, indent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", paddingLeft: indent ? 16 : 0, borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13, fontWeight: bold ? 800 : 500, color: bold ? C.text : C.sub }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 800 : 600, color: amount < 0 ? C.danger : C.text }}>{fmtINR(amount)}</span>
    </div>
  );
}

function FinancialStatementsTab() {
  const [stmt, setStmt] = useState("pl");
  const pl = useApi(fetchProfitAndLoss, [stmt === "pl"]);
  const bs = useApi(fetchBalanceSheet, [stmt === "bs"]);
  const cf = useApi(fetchCashFlow, [stmt === "cf"]);
  const tb = useApi(fetchTrialBalance, [stmt === "tb"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 9, flexWrap: "wrap" }}>
          {[{ id: "pl", label: "Profit & Loss" }, { id: "bs", label: "Balance Sheet" }, { id: "cf", label: "Cash Flow" }, { id: "tb", label: "Trial Balance" }].map((t) => (
            <button key={t.id} onClick={() => setStmt(t.id)} style={{
              padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
              background: stmt === t.id ? "#fff" : "transparent", color: stmt === t.id ? C.primaryDark : C.sub,
              boxShadow: stmt === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {stmt === "pl" && (pl.loading ? <LoadingBlock /> : pl.error ? <ErrorBlock message={pl.error} onRetry={pl.reload} /> : (
        <Card>
          <SectionHeader title="Profit & Loss Statement" subtitle="Live from sales_invoices, purchases & expenses" />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Revenue</div>
          {pl.data.data.revenue.map((r, i) => <LineRow key={i} label={r.label} amount={r.amount} indent />)}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Cost of Goods Sold</div>
          {pl.data.data.cogs.map((r, i) => <LineRow key={i} label={r.label} amount={r.amount} indent />)}
          <LineRow label="Gross Profit" amount={pl.data.data.grossProfit} bold />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Operating Expenses</div>
          {pl.data.data.opex.length === 0 ? <div style={{ color: C.sub, fontSize: 13, padding: "10px 0" }}>No expenses recorded.</div> : pl.data.data.opex.map((r, i) => <LineRow key={i} label={r.label} amount={r.amount} indent />)}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10, borderTop: `2px solid ${C.text}` }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Net Profit</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: pl.data.data.netProfit >= 0 ? C.primary : C.danger }}>{fmtINR(pl.data.data.netProfit)}</span>
          </div>
        </Card>
      ))}

      {stmt === "bs" && (bs.loading ? <LoadingBlock /> : bs.error ? <ErrorBlock message={bs.error} onRetry={bs.reload} /> : (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Card style={{ flex: 1, minWidth: 300 }}>
            <SectionHeader title="Assets" subtitle={`As of ${bs.data.data.asOf}`} />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Current Assets</div>
            {bs.data.data.currentAssets.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Fixed Assets</div>
            {bs.data.data.fixed.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10, borderTop: `2px solid ${C.text}` }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>Total Assets</span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{fmtINR(bs.data.data.totalAssets)}</span>
            </div>
          </Card>
          <Card style={{ flex: 1, minWidth: 300 }}>
            <SectionHeader title="Liabilities & Equity" subtitle={`As of ${bs.data.data.asOf}`} />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Current Liabilities</div>
            {bs.data.data.currentLiab.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Equity</div>
            {bs.data.data.equity.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10, borderTop: `2px solid ${C.text}` }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>Total Liabilities + Equity</span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{fmtINR(bs.data.data.totalLiab + bs.data.data.equity.reduce((s, a) => s + a.amount, 0))}</span>
            </div>
          </Card>
        </div>
      ))}

      {stmt === "cf" && (cf.loading ? <LoadingBlock /> : cf.error ? <ErrorBlock message={cf.error} onRetry={cf.reload} /> : (
        <Card>
          <SectionHeader title="Cash Flow Statement" subtitle="Indirect method — derived from real P&L, AR & AP movement" />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Operating Activities</div>
          {cf.data.data.operating.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Investing Activities</div>
          {cf.data.data.investing.length === 0 ? <div style={{ color: C.sub, fontSize: 13, padding: "10px 0" }}>No fixed asset purchases in this period.</div> : cf.data.data.investing.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10, borderTop: `2px solid ${C.text}` }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Net Increase in Cash</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: cf.data.data.netCash >= 0 ? C.primary : C.danger }}>{fmtINR(cf.data.data.netCash)}</span>
          </div>
        </Card>
      ))}

      {stmt === "tb" && (tb.loading ? <LoadingBlock /> : tb.error ? <ErrorBlock message={tb.error} onRetry={tb.reload} /> : (
        <Card>
          <SectionHeader title="Trial Balance" subtitle={`As of ${tb.data.data.asOf} — every account's live balance, Dr vs Cr`}
            action={<Badge text={tb.data.data.balanced ? "Balanced" : `Off by ${fmtINR(Math.abs(tb.data.data.difference))}`} tone={tb.data.data.balanced ? "success" : "danger"} />} />
          <Table
            columns={[{ label: "Code" }, { label: "Account" }, { label: "Type" }, { label: "Debit", align: "right" }, { label: "Credit", align: "right" }]}
            rows={tb.data.data.rows}
            renderRow={(r) => (
              <>
                <Td style={{ color: C.sub, fontWeight: 700 }}>{r.code}</Td>
                <Td style={{ fontWeight: 700 }}>{r.name}</Td>
                <Td><Badge text={r.type} tone={r.type === "Asset" ? "info" : r.type === "Liability" ? "warn" : r.type === "Equity" ? "purple" : r.type === "Income" ? "success" : "danger"} /></Td>
                <Td align="right">{r.debit > 0 ? fmtINR(r.debit) : "—"}</Td>
                <Td align="right">{r.credit > 0 ? fmtINR(r.credit) : "—"}</Td>
              </>
            )}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 30, marginTop: 14, paddingTop: 14, borderTop: `2px solid ${C.text}` }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Total Debit: {fmtINR(tb.data.data.totalDebit)}</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Total Credit: {fmtINR(tb.data.data.totalCredit)}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   TAB 10 — BUDGET & EXPENSE MANAGEMENT
   ============================================================ */
// new
function BudgetExpenseTab() {
  const budgets = useApi(fetchBudgets);
  const requests = useApi(fetchExpenseRequests);
  const [showAdd, setShowAdd] = useState(false);
  const [showCopy, setShowCopy] = useState(false);

  if (budgets.loading) return <LoadingBlock label="Loading budgets…" />;
  if (budgets.error) return <ErrorBlock message={budgets.error} onRetry={budgets.reload} />;

  const rows = budgets.data.data || [];
  const totalBudgeted = rows.reduce((s, b) => s + Number(b.budgeted), 0);
  const totalActual = rows.reduce((s, b) => s + Number(b.actual), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={PieChart} label="Total Budgeted" value={fmtINR(totalBudgeted)} tint={C.infoSoft} />
        <StatCard icon={Wallet} label="Actual Spend" value={fmtINR(totalActual)} tint={C.warnSoft} />
        <StatCard icon={totalActual <= totalBudgeted ? TrendingUp : TrendingDown} label="Budget Variance" value={fmtINR(totalBudgeted - totalActual)} tint={totalActual <= totalBudgeted ? C.primarySoft : C.dangerSoft} />
      </div>

     <Card>
        <SectionHeader title="Budgets" subtitle="Budgeted vs. actual spend per category, by period"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              {rows.length > 0 && <Btn variant="outline" onClick={() => setShowCopy(true)}>Copy Previous Period</Btn>}
              <Btn icon={Plus} onClick={() => setShowAdd(true)}>New Budget Line</Btn>
            </div>
          } />
        <Table
          columns={[{ label: "Category" }, { label: "Period" }, { label: "Budgeted", align: "right" }, { label: "Actual", align: "right" }, { label: "Utilization" }]}
          rows={rows}
          emptyText="No budgets set yet — add one above and link it to an expense category."
          renderRow={(b) => {
            const pct = b.budgeted ? (b.actual / b.budgeted) * 100 : 0;
            const over = b.actual > b.budgeted;
            return (
              <>
                <Td style={{ fontWeight: 700 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {b.category_name || b.category_label || "Uncategorized"}
                    {!b.category_id && (
                      <span title="Not linked to a real expense category — Actual spend won't be tracked for this line. Delete and re-add it using the category dropdown." style={{ display: "inline-flex", color: C.warn, cursor: "help" }}>
                        <AlertTriangle size={13} />
                      </span>
                    )}
                  </div>
                </Td>
                <Td style={{ color: C.sub }}>{b.period}</Td>
                <Td align="right">{fmtINR(b.budgeted)}</Td>
                <Td align="right" style={{ fontWeight: 700, color: over ? C.danger : C.text }}>{fmtINR(b.actual)}</Td>
                <Td style={{ width: 160 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><ProgressBar pct={pct} tone={over ? C.danger : C.primary} /></div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: over ? C.danger : C.sub, minWidth: 34 }}>{Math.round(pct)}%</span>
                  </div>
                </Td>
              </>
            );
          }}
        />
      </Card>

      <Card>
        <SectionHeader title="Expenses" subtitle="Live from the Expense module" />
        {requests.loading ? <LoadingBlock /> : requests.error ? <ErrorBlock message={requests.error} onRetry={requests.reload} /> : (
          <Table
            columns={[{ label: "Expense #" }, { label: "Added By" }, { label: "Purpose" }, { label: "Date" }, { label: "Amount", align: "right" }, { label: "Status" }]}
            rows={requests.data.data || []}
            emptyText="No expenses recorded yet."
            renderRow={(e) => (
              <>
                <Td style={{ fontWeight: 700 }}>{e.id_no}</Td>
                <Td>{e.requested_by || "—"}</Td>
                <Td>{e.purpose || "—"}</Td>
                <Td>{e.date ? new Date(e.date).toLocaleDateString("en-IN") : "—"}</Td>
                <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(e.amount)}</Td>
                <Td><Badge text={e.status} tone={statusTone(e.status)} /></Td>
              </>
            )}
          />
        )}
      </Card>

     // new
      {showAdd && <AddBudgetModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); budgets.reload(); }} />}
      {showCopy && <CopyPreviousPeriodModal rows={rows} onClose={() => setShowCopy(false)} onSaved={() => { setShowCopy(false); budgets.reload(); }} />}
    </div>
  );
}

function CopyPreviousPeriodModal({ rows, onClose, onSaved }) {
  const [newPeriod, setNewPeriod] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const lastPeriod = rows[0]?.period || null;              // most recently added period
  const sourceRows = rows.filter((r) => r.period === lastPeriod);

  const save = async () => {
    if (!newPeriod) { setErr("Enter a name for the new period."); return; }
    try {
      setSaving(true); setErr("");
      for (const r of sourceRows) {
        await createBudget({
          category_id: r.category_id || null,
          category_label: r.category_name || r.category_label,
          period: newPeriod,
          period_start: "",
          period_end: "",
          budgeted: r.budgeted,
        });
      }
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Copy Previous Period's Budget" onClose={onClose} width={440}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 12 }}>
        Copies all {sourceRows.length} budget line{sourceRows.length === 1 ? "" : "s"} from{" "}
        <strong>{lastPeriod || "the most recent period"}</strong> into a new period, same categories and amounts — adjust afterward if needed.
      </div>
      <label style={labelStyle}>New Period *</label>
      <input value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)} placeholder="e.g. Aug 2026" style={{ ...inputStyle, marginBottom: 18 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving || sourceRows.length === 0}>{saving ? "Copying..." : `Copy ${sourceRows.length} Line(s)`}</Btn>
      </div>
    </Modal>
  );
}
// new
function AddBudgetModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ category_id: "", category_label: "", period: "", period_start: "", period_end: "", budgeted: "" });
  const [categories, setCategories] = useState([]);
  useEffect(() => { fetchExpenseCategories().then((res) => setCategories(res.data || [])).catch(() => {}); }, []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onCategoryChange = (e) => {
    const id = e.target.value;
    const picked = categories.find((c) => String(c.id) === String(id));
    setForm({ ...form, category_id: id, category_label: picked ? picked.name : "" });
  };

  const save = async () => {
    if (!form.category_id || !form.period) { setErr("Category and period are required."); return; }
    try {
      setSaving(true); setErr("");
      await createBudget({ ...form, budgeted: parseFloat(form.budgeted) || 0 });
      onSaved();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="New Budget Line" onClose={onClose}>
      {err && <div style={{ background: C.dangerSoft, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
      <label style={labelStyle}>Category *</label>
      <select value={form.category_id} onChange={onCategoryChange} style={{ ...inputStyle, marginBottom: 12 }}>
        <option value="">Select expense category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {categories.length === 0 && (
        <div style={{ fontSize: 11.5, color: C.warn, marginTop: -6, marginBottom: 12 }}>
          No expense categories found — create one in the Expense module first.
        </div>
      )}
      <label style={labelStyle}>Period *</label>
      <input value={form.period} onChange={f("period")} placeholder="e.g. Q2 FY26" style={{ ...inputStyle, marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Period Start</label>
          <input type="date" value={form.period_start} onChange={f("period_start")} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Period End</label>
          <input type="date" value={form.period_end} onChange={f("period_end")} style={inputStyle} />
        </div>
      </div>
      <label style={labelStyle}>Budgeted Amount</label>
      <input type="number" value={form.budgeted} onChange={f("budgeted")} style={{ ...inputStyle, marginBottom: 18 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Budget"}</Btn>
      </div>
    </Modal>
  );
}

/* ============================================================
   MAIN COMPONENT — Accounting
   ============================================================ */
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, Comp: DashboardTab },
  { id: "gl", label: "General Ledger", icon: BookOpen, Comp: GeneralLedgerTab },
  { id: "ar", label: "Accounts Receivable", icon: Receipt, Comp: ReceivableTab },
  { id: "ap", label: "Accounts Payable", icon: FileText, Comp: PayableTab },
  { id: "cashbank", label: "Cash & Bank", icon: Landmark, Comp: CashBankTab },
  { id: "gst", label: "GST & Tax", icon: Percent, Comp: GSTTab },
  { id: "assets", label: "Fixed Assets", icon: Boxes, Comp: FixedAssetsTab },
  { id: "costcenter", label: "Cost Center & Costing", icon: Factory, Comp: CostCenterTab },
  { id: "statements", label: "Financial Statements", icon: Scale, Comp: FinancialStatementsTab },
  { id: "budget", label: "Budget & Expenses", icon: Wallet, Comp: BudgetExpenseTab },
];

export default function Accounting() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTabState] = useState(TABS.some((t) => t.id === urlTab) ? urlTab : "dashboard");

  useEffect(() => {
    if (urlTab && TABS.some((t) => t.id === urlTab) && urlTab !== activeTab) setActiveTabState(urlTab);
  }, [urlTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveTab = (id) => { setActiveTabState(id); setSearchParams({ tab: id }); };
  const active = useMemo(() => TABS.find((t) => t.id === activeTab) || TABS[0], [activeTab]);
  const ActiveComp = active.Comp;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Accounting & Finance</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>General ledger, receivables, payables, tax, assets, and financial reporting — live from your ERP data</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn icon={Filter} variant="outline">Filter</Btn>
          <Btn icon={Download} variant="outline">Export</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, overflowX: "auto", borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === activeTab;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", border: "none", background: "none",
              cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, fontWeight: 700,
              color: isActive ? C.primaryDark : C.sub, borderBottom: isActive ? `2.5px solid ${C.primary}` : "2.5px solid transparent", marginBottom: -1,
            }}>
              <Icon size={15} strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </div>

      <ActiveComp />
    </div>
  );
}
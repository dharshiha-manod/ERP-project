/**
 * ============================================================
 * pages/Accounting.jsx — Accounting & Finance Module
 * Single-file component, 10 internal tabs (Manufacturing.jsx pattern)
 * ============================================================
 *
 * SEED DATA NOTICE:
 * Every array below prefixed with `SEED_` is placeholder/reference data
 * for UI layout only. Replace each with a real API call
 * (fetch from /api/accounting/...) using the same shape.
 * DO NOT ship SEED_ arrays to production — wire to Supabase.
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen, Receipt, FileText, Landmark, Percent, Boxes,
  Factory, PieChart, Wallet, LayoutDashboard, Plus, Search,
  ArrowUpRight, ArrowDownRight, ChevronRight, Download, Filter,
  CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown,
  X, Calendar, Building2, CreditCard, FileBarChart2,
} from "lucide-react";

/* ============================================================
   THEME TOKENS (mirrors Manod ERP green identity)
   ============================================================ */
const C = {
  bg: "#f0f4f1",
  card: "#ffffff",
  border: "#e2e8e4",
  text: "#1a202c",
  sub: "#64748b",
  primary: "#16a34a",
  primaryDark: "#15803d",
  primarySoft: "#e8f5e9",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
  warn: "#d97706",
  warnSoft: "#fffbeb",
  info: "#2563eb",
  infoSoft: "#eff6ff",
  purple: "#7c3aed",
  purpleSoft: "#f5f3ff",
};

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

/* ============================================================
   SEED DATA — Chart of Accounts
   ============================================================ */
const SEED_COA = [
  { code: "1000", name: "Cash in Hand",            type: "Asset",     subtype: "Current Asset",  balance: 84500,   normal: "Debit" },
  { code: "1010", name: "HDFC Bank — Current A/c",  type: "Asset",     subtype: "Bank",           balance: 1842300, normal: "Debit" },
  { code: "1020", name: "ICICI Bank — CC A/c",      type: "Asset",     subtype: "Bank",           balance: 356200,  normal: "Debit" },
  { code: "1100", name: "Accounts Receivable",      type: "Asset",     subtype: "Current Asset",  balance: 972400,  normal: "Debit" },
  { code: "1200", name: "Inventory",                type: "Asset",     subtype: "Current Asset",  balance: 2140000, normal: "Debit" },
  { code: "1300", name: "Input GST (ITC)",          type: "Asset",     subtype: "Current Asset",  balance: 128450,  normal: "Debit" },
  { code: "1500", name: "Plant & Machinery",        type: "Asset",     subtype: "Fixed Asset",    balance: 3200000, normal: "Debit" },
  { code: "1510", name: "Accum. Depreciation — P&M",type: "Asset",     subtype: "Contra Asset",   balance: -640000, normal: "Credit" },
  { code: "2000", name: "Accounts Payable",         type: "Liability", subtype: "Current Liab.",  balance: 614200,  normal: "Credit" },
  { code: "2100", name: "Output GST Payable",       type: "Liability", subtype: "Current Liab.",  balance: 218900,  normal: "Credit" },
  { code: "2200", name: "Salary Payable",           type: "Liability", subtype: "Current Liab.",  balance: 340000,  normal: "Credit" },
  { code: "2500", name: "Term Loan — HDFC",         type: "Liability", subtype: "Long-Term Liab.",balance: 1500000, normal: "Credit" },
  { code: "3000", name: "Owner's Capital",          type: "Equity",    subtype: "Equity",         balance: 4000000, normal: "Credit" },
  { code: "3100", name: "Retained Earnings",        type: "Equity",    subtype: "Equity",         balance: 1284650, normal: "Credit" },
  { code: "4000", name: "Sales Revenue",            type: "Income",    subtype: "Operating Income",balance: 6840000,normal: "Credit" },
  { code: "4100", name: "Sales Returns & Allowances",type:"Income",    subtype: "Contra Income",  balance: -124000, normal: "Debit" },
  { code: "5000", name: "Cost of Goods Sold",       type: "Expense",   subtype: "COGS",           balance: 4120000, normal: "Debit" },
  { code: "5100", name: "Raw Material Consumed",    type: "Expense",   subtype: "COGS",           balance: 1860000, normal: "Debit" },
  { code: "6000", name: "Salaries & Wages",         type: "Expense",   subtype: "Operating Exp.", balance: 980000,  normal: "Debit" },
  { code: "6100", name: "Rent Expense",             type: "Expense",   subtype: "Operating Exp.", balance: 240000,  normal: "Debit" },
  { code: "6200", name: "Electricity & Utilities",  type: "Expense",   subtype: "Operating Exp.", balance: 186000,  normal: "Debit" },
  { code: "6300", name: "Depreciation Expense",     type: "Expense",   subtype: "Operating Exp.", balance: 160000,  normal: "Debit" },
];

/* ============================================================
   SEED DATA — General Ledger (journal entries, double-entry)
   ============================================================ */
const SEED_GL = [
  { id: "JE-2026-0142", date: "2026-07-05", ref: "INV-3311", narration: "Sale to Sri Ram Traders",     debit: [{acc:"1100 Accounts Receivable", amt:118000}], credit:[{acc:"4000 Sales Revenue", amt:100000},{acc:"2100 Output GST Payable", amt:18000}], status: "Posted", source: "Sales" },
  { id: "JE-2026-0141", date: "2026-07-05", ref: "BILL-889",  narration: "Purchase — Raw Steel 2mm",    debit: [{acc:"1200 Inventory", amt:236000},{acc:"1300 Input GST (ITC)", amt:42480}], credit:[{acc:"2000 Accounts Payable", amt:278480}], status: "Posted", source: "Purchase" },
  { id: "JE-2026-0140", date: "2026-07-04", ref: "PAY-2201",  narration: "Payment received — Kavin Enterprises", debit:[{acc:"1010 HDFC Bank", amt:95000}], credit:[{acc:"1100 Accounts Receivable", amt:95000}], status: "Posted", source: "Receipt" },
  { id: "JE-2026-0139", date: "2026-07-04", ref: "EXP-556",   narration: "Electricity bill — July",     debit: [{acc:"6200 Electricity & Utilities", amt:31200}], credit:[{acc:"1010 HDFC Bank", amt:31200}], status: "Posted", source: "Expense" },
  { id: "JE-2026-0138", date: "2026-07-03", ref: "PAY-OUT-77",narration: "Payment to Vendor — Anand Steels", debit:[{acc:"2000 Accounts Payable", amt:180000}], credit:[{acc:"1020 ICICI Bank CC", amt:180000}], status: "Posted", source: "Payment" },
  { id: "JE-2026-0137", date: "2026-07-02", ref: "DEP-0726",  narration: "Monthly depreciation — Plant & Machinery", debit:[{acc:"6300 Depreciation Expense", amt:13333}], credit:[{acc:"1510 Accum. Depreciation — P&M", amt:13333}], status: "Posted", source: "Adjustment" },
  { id: "JE-2026-0136", date: "2026-07-01", ref: "MANUAL",    narration: "Salary provision — June",     debit: [{acc:"6000 Salaries & Wages", amt:340000}], credit:[{acc:"2200 Salary Payable", amt:340000}], status: "Draft",  source: "Manual" },
];

/* ============================================================
   SEED DATA — Accounts Receivable (customer invoices)
   ============================================================ */
const SEED_AR = [
  { id: "INV-3311", customer: "Sri Ram Traders",      date: "2026-07-05", due: "2026-08-04", amount: 118000, paid: 0,      status: "Unpaid",    age: 3   },
  { id: "INV-3308", customer: "Kavin Enterprises",     date: "2026-06-28", due: "2026-07-28", amount: 95000,  paid: 95000, status: "Paid",      age: 0   },
  { id: "INV-3299", customer: "Nila Hardware",         date: "2026-06-20", due: "2026-07-20", amount: 214000, paid: 100000,status: "Partial",   age: -12 },
  { id: "INV-3287", customer: "Bharath Auto Parts",    date: "2026-06-10", due: "2026-07-10", amount: 62000,  paid: 0,      status: "Overdue",   age: -2  },
  { id: "INV-3260", customer: "Om Sakthi Distributors", date: "2026-05-18", due: "2026-06-17", amount: 340000, paid: 0,     status: "Overdue",   age: -21 },
  { id: "INV-3241", customer: "Sri Ram Traders",       date: "2026-05-02", due: "2026-06-01", amount: 143400, paid: 143400,status: "Paid",      age: 0   },
];

const AR_AGING = [
  { bucket: "0–30 days",  amount: 213000, color: C.info },
  { bucket: "31–60 days", amount: 114000, color: C.warn },
  { bucket: "61–90 days", amount: 340000, color: C.danger },
  { bucket: "90+ days",   amount: 0,      color: "#7f1d1d" },
];

/* ============================================================
   SEED DATA — Accounts Payable (vendor bills)
   ============================================================ */
const SEED_AP = [
  { id: "BILL-889", vendor: "Anand Steels & Metals",   date: "2026-07-05", due: "2026-08-04", amount: 278480, paid: 0,      status: "Unpaid",  age: 3   },
  { id: "BILL-874", vendor: "Chennai Polymers Pvt Ltd", date: "2026-06-25", due: "2026-07-10", amount: 156000, paid: 156000,status: "Paid",     age: 0   },
  { id: "BILL-861", vendor: "Sri Balaji Packaging",     date: "2026-06-18", due: "2026-07-03", amount: 84200,  paid: 40000, status: "Partial",  age: -5  },
  { id: "BILL-849", vendor: "Coimbatore Electricals",   date: "2026-06-05", due: "2026-06-20", amount: 61300,  paid: 0,     status: "Overdue",  age: -18 },
];

/* ============================================================
   SEED DATA — Cash & Bank
   ============================================================ */
const SEED_BANK_ACCOUNTS = [
  { id: 1, name: "HDFC Bank — Current A/c", number: "XXXX 4821", balance: 1842300, type: "Current", ifsc: "HDFC0000452" },
  { id: 2, name: "ICICI Bank — CC A/c",      number: "XXXX 1190", balance: 356200,  type: "Cash Credit", ifsc: "ICIC0001120" },
  { id: 3, name: "Cash in Hand",             number: "—",         balance: 84500,   type: "Cash", ifsc: "—" },
];

const SEED_BANK_TXNS = [
  { date: "2026-07-05", desc: "NEFT — Kavin Enterprises",   type: "Credit", amount: 95000,  reconciled: true,  account: "HDFC Bank" },
  { date: "2026-07-04", desc: "Electricity bill — TANGEDCO", type: "Debit", amount: 31200,  reconciled: true,  account: "HDFC Bank" },
  { date: "2026-07-03", desc: "RTGS — Anand Steels",         type: "Debit", amount: 180000, reconciled: true,  account: "ICICI CC" },
  { date: "2026-07-02", desc: "UPI — Petty cash top-up",     type: "Debit", amount: 10000,  reconciled: false, account: "Cash" },
  { date: "2026-07-01", desc: "Salary disbursal — June",     type: "Debit", amount: 340000, reconciled: false, account: "HDFC Bank" },
];

/* ============================================================
   SEED DATA — GST & Tax
   ============================================================ */
const SEED_GST_SUMMARY = {
  outputGST: 218900,
  inputGST: 128450,
  netPayable: 90450,
  period: "June 2026",
  dueDate: "2026-07-20",
  gstin: "33ABCDE1234F1Z5",
};

const SEED_GST_RETURNS = [
  { period: "Jun 2026", type: "GSTR-1",  status: "Filed",    filedOn: "2026-07-10", taxable: 6840000, tax: 218900 },
  { period: "Jun 2026", type: "GSTR-3B", status: "Pending",  filedOn: null,          taxable: 6840000, tax: 90450  },
  { period: "May 2026", type: "GSTR-1",  status: "Filed",    filedOn: "2026-06-10", taxable: 5920000, tax: 190400 },
  { period: "May 2026", type: "GSTR-3B", status: "Filed",    filedOn: "2026-06-18", taxable: 5920000, tax: 82100  },
];

const SEED_TAX_RATES = [
  { hsn: "7213", desc: "MS Wire Rods",    cgst: 9, sgst: 9, igst: 18 },
  { hsn: "3926", desc: "Plastic Components", cgst: 9, sgst: 9, igst: 18 },
  { hsn: "8501", desc: "Electric Motors", cgst: 9, sgst: 9, igst: 18 },
  { hsn: "9954", desc: "Job Work Services", cgst: 6, sgst: 6, igst: 12 },
];

/* ============================================================
   SEED DATA — Fixed Assets
   ============================================================ */
const SEED_ASSETS = [
  { id: "FA-001", name: "CNC Lathe Machine",      category: "Plant & Machinery", purchaseDate: "2023-04-12", cost: 1800000, method: "SLM", life: 15, salvage: 180000, accumDep: 324000, nbv: 1476000, status: "Active" },
  { id: "FA-002", name: "Hydraulic Press",        category: "Plant & Machinery", purchaseDate: "2022-01-20", cost: 1400000, method: "SLM", life: 12, salvage: 140000, accumDep: 420000, nbv: 980000,  status: "Active" },
  { id: "FA-003", name: "Office Computers (x8)",  category: "Office Equipment",  purchaseDate: "2024-08-01", cost: 480000,  method: "WDV", life: 5,  salvage: 0,      accumDep: 96000,  nbv: 384000,  status: "Active" },
  { id: "FA-004", name: "Delivery Van — TN37 AB 1122", category: "Vehicle",      purchaseDate: "2021-11-05", cost: 950000,  method: "WDV", life: 8,  salvage: 95000,  accumDep: 512000, nbv: 438000,  status: "Active" },
  { id: "FA-005", name: "Old Compressor Unit",    category: "Plant & Machinery", purchaseDate: "2018-03-15", cost: 320000,  method: "SLM", life: 10, salvage: 32000,  accumDep: 320000, nbv: 0,       status: "Disposed" },
];

/* ============================================================
   SEED DATA — Cost Centers & Manufacturing Costing
   ============================================================ */
const SEED_COST_CENTERS = [
  { id: "CC-01", name: "Machining Shop",   budget: 850000,  actual: 792000,  variance: 58000,   head: "Suresh Kumar" },
  { id: "CC-02", name: "Assembly Line",    budget: 620000,  actual: 664000,  variance: -44000,  head: "Priya R" },
  { id: "CC-03", name: "Quality Control",  budget: 210000,  actual: 198500,  variance: 11500,   head: "Arjun Dev" },
  { id: "CC-04", name: "Warehouse & Logistics", budget: 340000, actual: 356200, variance: -16200, head: "Meena S" },
  { id: "CC-05", name: "Admin & Overheads", budget: 480000, actual: 452000, variance: 28000,   head: "—" },
];

const SEED_PRODUCT_COSTING = [
  { product: "Bracket Assembly M-12", material: 210, labor: 85,  overhead: 62,  totalCost: 357, sellingPrice: 520, margin: "31.3%" },
  { product: "Hydraulic Valve Body",  material: 640, labor: 220, overhead: 165, totalCost: 1025,sellingPrice: 1450,margin: "29.3%" },
  { product: "Steel Bracket Type-A",  material: 95,  labor: 40,  overhead: 30,  totalCost: 165, sellingPrice: 240, margin: "31.3%" },
  { product: "Motor Housing Cover",   material: 380, labor: 140, overhead: 98,  totalCost: 618, sellingPrice: 890, margin: "30.6%" },
];

/* ============================================================
   SEED DATA — Budget & Expense Management
   ============================================================ */
const SEED_BUDGETS = [
  { category: "Raw Materials",      budgeted: 2000000, actual: 1860000, period: "Q2 FY26" },
  { category: "Salaries & Wages",   budgeted: 950000,  actual: 980000,  period: "Q2 FY26" },
  { category: "Utilities",          budgeted: 200000,  actual: 186000,  period: "Q2 FY26" },
  { category: "Marketing",          budgeted: 150000,  actual: 92000,   period: "Q2 FY26" },
  { category: "Rent & Facilities",  budgeted: 240000,  actual: 240000,  period: "Q2 FY26" },
  { category: "Repairs & Maintenance", budgeted: 120000, actual: 148000, period: "Q2 FY26" },
];

const SEED_EXPENSE_REQUESTS = [
  { id: "EXR-441", requestedBy: "Meena S",  purpose: "Warehouse racking repair", amount: 38000, status: "Pending Approval", date: "2026-07-06" },
  { id: "EXR-438", requestedBy: "Arjun Dev", purpose: "QC calibration equipment", amount: 62000, status: "Approved", date: "2026-07-03" },
  { id: "EXR-432", requestedBy: "Priya R",  purpose: "Team travel — vendor visit", amount: 14500, status: "Rejected", date: "2026-06-29" },
];

/* ============================================================
   SEED DATA — Financial Statements
   ============================================================ */
const SEED_PL = {
  period: "Q1 FY 2026-27 (Apr–Jun 2026)",
  revenue: [
    { label: "Sales Revenue", amount: 6840000 },
    { label: "Less: Sales Returns", amount: -124000 },
  ],
  cogs: [
    { label: "Raw Material Consumed", amount: 1860000 },
    { label: "Direct Labor", amount: 980000 },
    { label: "Manufacturing Overhead", amount: 1280000 },
  ],
  opex: [
    { label: "Salaries & Wages (Admin)", amount: 340000 },
    { label: "Rent Expense", amount: 240000 },
    { label: "Electricity & Utilities", amount: 186000 },
    { label: "Depreciation", amount: 160000 },
    { label: "Marketing", amount: 92000 },
  ],
};

const SEED_BALANCE_SHEET = {
  asOf: "30 Jun 2026",
  assets: {
    current: [
      { label: "Cash & Bank", amount: 2283000 },
      { label: "Accounts Receivable", amount: 972400 },
      { label: "Inventory", amount: 2140000 },
      { label: "Input GST (ITC)", amount: 128450 },
    ],
    fixed: [
      { label: "Plant & Machinery (Net)", amount: 2560000 },
      { label: "Vehicles (Net)", amount: 438000 },
      { label: "Office Equipment (Net)", amount: 384000 },
    ],
  },
  liabilities: {
    current: [
      { label: "Accounts Payable", amount: 614200 },
      { label: "Output GST Payable", amount: 218900 },
      { label: "Salary Payable", amount: 340000 },
    ],
    longTerm: [
      { label: "Term Loan — HDFC", amount: 1500000 },
    ],
  },
  equity: [
    { label: "Owner's Capital", amount: 4000000 },
    { label: "Retained Earnings", amount: 1233750 },
  ],
};

const SEED_CASH_FLOW = {
  period: "Q1 FY 2026-27",
  operating: [
    { label: "Net Profit", amount: 949750 },
    { label: "Add: Depreciation", amount: 160000 },
    { label: "Change in Receivables", amount: -212000 },
    { label: "Change in Payables", amount: 98000 },
    { label: "Change in Inventory", amount: -340000 },
  ],
  investing: [
    { label: "Purchase of Machinery", amount: -480000 },
  ],
  financing: [
    { label: "Term Loan Repayment", amount: -125000 },
    { label: "Owner Drawings", amount: -80000 },
  ],
};

/* ============================================================
   SEED DATA — Financial Dashboard KPIs
   ============================================================ */
const SEED_KPIS = {
  revenue: 6840000, revenueChange: 12.4,
  expenses: 4778000, expensesChange: 6.1,
  netProfit: 949750, netProfitChange: 18.7,
  cashBalance: 2283000, cashChange: -4.2,
  arTotal: 972400, apTotal: 614200,
  currentRatio: 2.8, quickRatio: 1.9,
};

const SEED_REVENUE_TREND = [
  { month: "Feb", revenue: 4820000, expense: 3640000 },
  { month: "Mar", revenue: 5210000, expense: 3890000 },
  { month: "Apr", revenue: 5680000, expense: 4120000 },
  { month: "May", revenue: 5920000, expense: 4310000 },
  { month: "Jun", revenue: 6840000, expense: 4778000 },
];

/* ============================================================
   SHARED UI PRIMITIVES
   ============================================================ */
function Card({ children, style, ...rest }) {
  return (
    <div
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: 18, ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, tint, sub }) {
  const positive = change >= 0;
  return (
    <Card style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center",
          justifyContent: "center", background: tint || C.primarySoft,
        }}>
          <Icon size={18} color={C.primaryDark} strokeWidth={2} />
        </div>
        {change !== undefined && (
          <div style={{
            display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700,
            color: positive ? C.primary : C.danger,
          }}>
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
    default: { bg: "#f1f5f9", color: "#475569" },
    success: { bg: C.primarySoft, color: C.primaryDark },
    danger:  { bg: C.dangerSoft, color: C.danger },
    warn:    { bg: C.warnSoft, color: C.warn },
    info:    { bg: C.infoSoft, color: C.info },
    purple:  { bg: C.purpleSoft, color: C.purple },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 700, background: t.bg, color: t.color, whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function statusTone(status) {
  const map = {
    Paid: "success", Posted: "success", Filed: "success", Active: "success", Approved: "success",
    Unpaid: "warn", Partial: "warn", "Pending Approval": "warn", Draft: "default", Pending: "warn",
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

function Btn({ children, icon: Icon, variant = "primary", onClick, style }) {
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", border: "none" },
    outline: { background: "#fff", color: C.text, border: `1px solid ${C.border}` },
    ghost:   { background: "transparent", color: C.sub, border: "none" },
  };
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
        borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
        ...variants[variant], ...style,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function Table({ columns, rows, renderRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{
                textAlign: c.align || "left", padding: "10px 12px", fontSize: 11.5,
                fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.4px",
                borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              {renderRow(row, i)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children, align, style }) {
  return (
    <td style={{ padding: "11px 12px", textAlign: align || "left", color: C.text, ...style }}>
      {children}
    </td>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
      border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", minWidth: 220,
    }}>
      <Search size={14} color={C.sub} />
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent" }}
      />
    </div>
  );
}

function ProgressBar({ pct, tone = C.primary }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ width: "100%", height: 6, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
      <div style={{ width: `${clamped}%`, height: "100%", background: tone, borderRadius: 999 }} />
    </div>
  );
}

function RingIndicator({ pct, size = 54, tone = C.primary, label }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2ef" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size > 48 ? 13 : 11, fontWeight: 800, color: C.text,
      }}>{label ?? `${Math.round(pct)}%`}</div>
    </div>
  );
}

/* ============================================================
   TAB 1 — FINANCIAL DASHBOARD
   ============================================================ */
function DashboardTab() {
  const k = SEED_KPIS;
  const maxRev = Math.max(...SEED_REVENUE_TREND.map(d => d.revenue));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={TrendingUp}   label="Revenue (this month)" value={fmtINR(k.revenue)}   change={k.revenueChange} />
        <StatCard icon={TrendingDown} label="Total Expenses"       value={fmtINR(k.expenses)}  change={-k.expensesChange} tint={C.dangerSoft} />
        <StatCard icon={Wallet}       label="Net Profit"           value={fmtINR(k.netProfit)} change={k.netProfitChange} tint={C.purpleSoft} />
        <StatCard icon={Landmark}     label="Cash & Bank Balance"  value={fmtINR(k.cashBalance)} change={k.cashChange} tint={C.infoSoft} />
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <Card style={{ flex: 2, minWidth: 360 }}>
          <SectionHeader title="Revenue vs Expenses" subtitle="Last 5 months" />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 180, paddingTop: 10 }}>
            {SEED_REVENUE_TREND.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140 }}>
                  <div title={fmtINR(d.revenue)} style={{
                    width: 16, borderRadius: "4px 4px 0 0", background: `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`,
                    height: `${(d.revenue / maxRev) * 140}px`,
                  }} />
                  <div title={fmtINR(d.expense)} style={{
                    width: 16, borderRadius: "4px 4px 0 0", background: "#cbd5e1",
                    height: `${(d.expense / maxRev) * 140}px`,
                  }} />
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
        </Card>

        <Card style={{ flex: 1, minWidth: 240 }}>
          <SectionHeader title="Liquidity" subtitle="Key ratios" />
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>
            <div style={{ textAlign: "center" }}>
              <RingIndicator pct={k.currentRatio * 25} tone={C.info} label={k.currentRatio.toFixed(1)} />
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 8, fontWeight: 600 }}>Current Ratio</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <RingIndicator pct={k.quickRatio * 33} tone={C.purple} label={k.quickRatio.toFixed(1)} />
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 8, fontWeight: 600 }}>Quick Ratio</div>
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
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

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <Card style={{ flex: 1, minWidth: 300 }}>
          <SectionHeader title="AR Aging Summary" subtitle="Outstanding customer invoices" />
          {AR_AGING.map((b, i) => {
            const total = AR_AGING.reduce((s, x) => s + x.amount, 0);
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: C.sub, fontWeight: 600 }}>{b.bucket}</span>
                  <span style={{ fontWeight: 800, color: C.text }}>{fmtINR(b.amount)}</span>
                </div>
                <ProgressBar pct={total ? (b.amount / total) * 100 : 0} tone={b.color} />
              </div>
            );
          })}
        </Card>

        <Card style={{ flex: 1, minWidth: 300 }}>
          <SectionHeader title="GST Snapshot" subtitle={SEED_GST_SUMMARY.period} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: C.sub, fontWeight: 600 }}>Output GST</span>
              <span style={{ fontWeight: 800 }}>{fmtINR(SEED_GST_SUMMARY.outputGST)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: C.sub, fontWeight: 600 }}>Input GST (ITC)</span>
              <span style={{ fontWeight: 800 }}>{fmtINR(SEED_GST_SUMMARY.inputGST)}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4,
              borderTop: `1px dashed ${C.border}`,
            }}>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 800 }}>Net Payable</span>
              <span style={{ fontWeight: 800, color: C.danger }}>{fmtINR(SEED_GST_SUMMARY.netPayable)}</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge text={`Due ${SEED_GST_SUMMARY.dueDate}`} tone="warn" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 2 — GENERAL LEDGER (Chart of Accounts + Journal Entries)
   ============================================================ */
function GeneralLedgerTab() {
  const [glSubTab, setGlSubTab] = useState("journal"); // journal | coa
  const [q, setQ] = useState("");

  const filteredGL = SEED_GL.filter(e =>
    !q || e.narration.toLowerCase().includes(q.toLowerCase()) || e.id.toLowerCase().includes(q.toLowerCase())
  );
  const filteredCOA = SEED_COA.filter(a =>
    !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.code.includes(q)
  );

  const totalDebit = SEED_COA.filter(a => a.normal === "Debit").reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalCredit = SEED_COA.filter(a => a.normal === "Credit").reduce((s, a) => s + Math.abs(a.balance), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={BookOpen} label="Total Journal Entries (MTD)" value={SEED_GL.length} tint={C.infoSoft} />
        <StatCard icon={CheckCircle2} label="Posted" value={SEED_GL.filter(e => e.status === "Posted").length} tint={C.primarySoft} />
        <StatCard icon={Clock} label="Draft / Unposted" value={SEED_GL.filter(e => e.status === "Draft").length} tint={C.warnSoft} />
        <StatCard icon={FileBarChart2} label="Total Debits = Credits" value={fmtINR(totalDebit)} sub={`Credits: ${fmtINR(totalCredit)}`} tint={C.purpleSoft} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 9 }}>
            {[{ id: "journal", label: "Journal Entries" }, { id: "coa", label: "Chart of Accounts" }].map(t => (
              <button key={t.id} onClick={() => setGlSubTab(t.id)}
                style={{
                  padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 12.5, fontWeight: 700,
                  background: glSubTab === t.id ? "#fff" : "transparent",
                  color: glSubTab === t.id ? C.primaryDark : C.sub,
                  boxShadow: glSubTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}>{t.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SearchBox value={q} onChange={setQ} placeholder={glSubTab === "journal" ? "Search entries..." : "Search accounts..."} />
            <Btn icon={Plus}>{glSubTab === "journal" ? "New Journal Entry" : "New Account"}</Btn>
          </div>
        </div>

        {glSubTab === "journal" ? (
          <Table
            columns={[
              { label: "Entry #" }, { label: "Date" }, { label: "Reference" }, { label: "Narration" },
              { label: "Debit", align: "right" }, { label: "Credit", align: "right" },
              { label: "Source" }, { label: "Status" },
            ]}
            rows={filteredGL}
            renderRow={(e) => {
              const totalD = e.debit.reduce((s, x) => s + x.amt, 0);
              const totalC = e.credit.reduce((s, x) => s + x.amt, 0);
              return (
                <>
                  <Td style={{ fontWeight: 700 }}>{e.id}</Td>
                  <Td>{e.date}</Td>
                  <Td>{e.ref}</Td>
                  <Td>{e.narration}</Td>
                  <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(totalD)}</Td>
                  <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(totalC)}</Td>
                  <Td><Badge text={e.source} tone="info" /></Td>
                  <Td><Badge text={e.status} tone={statusTone(e.status)} /></Td>
                </>
              );
            }}
          />
        ) : (
          <Table
            columns={[
              { label: "Code" }, { label: "Account Name" }, { label: "Type" }, { label: "Subtype" },
              { label: "Normal Bal." }, { label: "Balance", align: "right" },
            ]}
            rows={filteredCOA}
            renderRow={(a) => (
              <>
                <Td style={{ fontWeight: 700, color: C.sub }}>{a.code}</Td>
                <Td style={{ fontWeight: 700 }}>{a.name}</Td>
                <Td><Badge text={a.type} tone={
                  a.type === "Asset" ? "info" : a.type === "Liability" ? "warn" : a.type === "Equity" ? "purple" : a.type === "Income" ? "success" : "danger"
                } /></Td>
                <Td style={{ color: C.sub }}>{a.subtype}</Td>
                <Td style={{ color: C.sub }}>{a.normal}</Td>
                <Td align="right" style={{ fontWeight: 800, color: a.balance < 0 ? C.danger : C.text }}>{fmtINR(a.balance)}</Td>
              </>
            )}
          />
        )}
      </Card>

      {glSubTab === "journal" && (
        <Card>
          <SectionHeader title="Journal Entry Detail — Example" subtitle={`${SEED_GL[0].id} · double-entry breakdown`} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 8 }}>Debit</div>
              {SEED_GL[0].debit.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px dashed ${C.border}` }}>
                  <span style={{ fontSize: 13 }}>{d.acc}</span>
                  <span style={{ fontWeight: 700 }}>{fmtINR(d.amt)}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 8 }}>Credit</div>
              {SEED_GL[0].credit.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px dashed ${C.border}` }}>
                  <span style={{ fontSize: 13 }}>{d.acc}</span>
                  <span style={{ fontWeight: 700 }}>{fmtINR(d.amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   TAB 3 — ACCOUNTS RECEIVABLE
   ============================================================ */
function ReceivableTab() {
  const [q, setQ] = useState("");
  const rows = SEED_AR.filter(r => !q || r.customer.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()));
  const totalOutstanding = SEED_AR.reduce((s, r) => s + (r.amount - r.paid), 0);
  const overdueCount = SEED_AR.filter(r => r.status === "Overdue").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Receipt} label="Total Outstanding" value={fmtINR(totalOutstanding)} tint={C.infoSoft} />
        <StatCard icon={AlertTriangle} label="Overdue Invoices" value={overdueCount} tint={C.dangerSoft} />
        <StatCard icon={CheckCircle2} label="Paid This Month" value={fmtINR(SEED_AR.filter(r => r.status === "Paid").reduce((s, r) => s + r.paid, 0))} tint={C.primarySoft} />
        <StatCard icon={Clock} label="Avg. Collection Period" value="34 days" tint={C.purpleSoft} />
      </div>

      <Card>
        <SectionHeader title="Customer Invoices" subtitle="Sales invoices awaiting or receiving payment" action={
          <div style={{ display: "flex", gap: 8 }}>
            <SearchBox value={q} onChange={setQ} placeholder="Search customer or invoice..." />
            <Btn icon={Plus}>New Invoice</Btn>
          </div>
        } />
        <Table
          columns={[
            { label: "Invoice #" }, { label: "Customer" }, { label: "Date" }, { label: "Due Date" },
            { label: "Amount", align: "right" }, { label: "Paid", align: "right" },
            { label: "Balance", align: "right" }, { label: "Status" },
          ]}
          rows={rows}
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.id}</Td>
              <Td>{r.customer}</Td>
              <Td>{r.date}</Td>
              <Td>{r.due}</Td>
              <Td align="right">{fmtINR(r.amount)}</Td>
              <Td align="right" style={{ color: C.primary, fontWeight: 700 }}>{fmtINR(r.paid)}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(r.amount - r.paid)}</Td>
              <Td><Badge text={r.status} tone={statusTone(r.status)} /></Td>
            </>
          )}
        />
      </Card>

      <Card>
        <SectionHeader title="Receivables Aging" subtitle="How overdue is outstanding customer debt" />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {AR_AGING.map((b, i) => (
            <div key={i} style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
              <RingIndicator pct={Math.min(100, (b.amount / 400000) * 100)} tone={b.color} label={fmtINR(b.amount)} size={72} />
              <div style={{ fontSize: 12, color: C.sub, marginTop: 8, fontWeight: 700 }}>{b.bucket}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   TAB 4 — ACCOUNTS PAYABLE
   ============================================================ */
function PayableTab() {
  const [q, setQ] = useState("");
  const rows = SEED_AP.filter(r => !q || r.vendor.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()));
  const totalOutstanding = SEED_AP.reduce((s, r) => s + (r.amount - r.paid), 0);
  const overdueCount = SEED_AP.filter(r => r.status === "Overdue").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={FileText} label="Total Payable" value={fmtINR(totalOutstanding)} tint={C.warnSoft} />
        <StatCard icon={AlertTriangle} label="Overdue Bills" value={overdueCount} tint={C.dangerSoft} />
        <StatCard icon={CheckCircle2} label="Paid This Month" value={fmtINR(SEED_AP.filter(r => r.status === "Paid").reduce((s, r) => s + r.paid, 0))} tint={C.primarySoft} />
        <StatCard icon={Clock} label="Avg. Payment Period" value="21 days" tint={C.infoSoft} />
      </div>

      <Card>
        <SectionHeader title="Vendor Bills" subtitle="Purchase bills awaiting or receiving payment" action={
          <div style={{ display: "flex", gap: 8 }}>
            <SearchBox value={q} onChange={setQ} placeholder="Search vendor or bill..." />
            <Btn icon={Plus}>New Bill</Btn>
          </div>
        } />
        <Table
          columns={[
            { label: "Bill #" }, { label: "Vendor" }, { label: "Date" }, { label: "Due Date" },
            { label: "Amount", align: "right" }, { label: "Paid", align: "right" },
            { label: "Balance", align: "right" }, { label: "Status" },
          ]}
          rows={rows}
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.id}</Td>
              <Td>{r.vendor}</Td>
              <Td>{r.date}</Td>
              <Td>{r.due}</Td>
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
function CashBankTab() {
  const totalBalance = SEED_BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const unreconciled = SEED_BANK_TXNS.filter(t => !t.reconciled).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Landmark} label="Total Cash & Bank" value={fmtINR(totalBalance)} tint={C.primarySoft} />
        <StatCard icon={CreditCard} label="Bank Accounts" value={SEED_BANK_ACCOUNTS.length} tint={C.infoSoft} />
        <StatCard icon={AlertTriangle} label="Unreconciled Transactions" value={unreconciled} tint={C.warnSoft} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {SEED_BANK_ACCOUNTS.map((a) => (
          <Card key={a.id} style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, background: C.infoSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Building2 size={16} color={C.info} /></div>
              <Badge text={a.type} tone="info" />
            </div>
            <div style={{ marginTop: 12, fontWeight: 800, fontSize: 14 }}>{a.name}</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>A/c {a.number} · IFSC {a.ifsc}</div>
            <div style={{ marginTop: 12, fontSize: 20, fontWeight: 800, color: C.text }}>{fmtINR(a.balance)}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="Recent Transactions" subtitle="Bank & cash movement — reconciliation status" action={<Btn icon={Plus}>Add Transaction</Btn>} />
        <Table
          columns={[{ label: "Date" }, { label: "Description" }, { label: "Account" }, { label: "Type" }, { label: "Amount", align: "right" }, { label: "Reconciled" }]}
          rows={SEED_BANK_TXNS}
          renderRow={(t) => (
            <>
              <Td>{t.date}</Td>
              <Td>{t.desc}</Td>
              <Td style={{ color: C.sub }}>{t.account}</Td>
              <Td>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: t.type === "Credit" ? C.primary : C.danger, fontWeight: 700 }}>
                  {t.type === "Credit" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{t.type}
                </span>
              </Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(t.amount)}</Td>
              <Td>{t.reconciled ? <Badge text="Reconciled" tone="success" /> : <Badge text="Pending" tone="warn" />}</Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

/* ============================================================
   TAB 6 — GST & TAX MANAGEMENT
   ============================================================ */
function GSTTab() {
  const g = SEED_GST_SUMMARY;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Percent} label="Output GST (Sales)" value={fmtINR(g.outputGST)} tint={C.dangerSoft} />
        <StatCard icon={Percent} label="Input GST — ITC" value={fmtINR(g.inputGST)} tint={C.primarySoft} />
        <StatCard icon={Wallet} label="Net GST Payable" value={fmtINR(g.netPayable)} tint={C.warnSoft} sub={`Due ${g.dueDate}`} />
        <StatCard icon={Building2} label="GSTIN" value={g.gstin} tint={C.infoSoft} />
      </div>

      <Card>
        <SectionHeader title="GST Returns Filing" subtitle="GSTR-1 / GSTR-3B filing status" action={<Btn icon={Download} variant="outline">Export GSTR-1 JSON</Btn>} />
        <Table
          columns={[{ label: "Period" }, { label: "Return Type" }, { label: "Taxable Value", align: "right" }, { label: "Tax Amount", align: "right" }, { label: "Filed On" }, { label: "Status" }]}
          rows={SEED_GST_RETURNS}
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.period}</Td>
              <Td><Badge text={r.type} tone="purple" /></Td>
              <Td align="right">{fmtINR(r.taxable)}</Td>
              <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(r.tax)}</Td>
              <Td style={{ color: C.sub }}>{r.filedOn || "—"}</Td>
              <Td><Badge text={r.status} tone={statusTone(r.status)} /></Td>
            </>
          )}
        />
      </Card>

      <Card>
        <SectionHeader title="HSN / Tax Rate Master" subtitle="GST rates by product HSN code" action={<Btn icon={Plus} variant="outline">Add HSN Rate</Btn>} />
        <Table
          columns={[{ label: "HSN Code" }, { label: "Description" }, { label: "CGST %", align: "right" }, { label: "SGST %", align: "right" }, { label: "IGST %", align: "right" }]}
          rows={SEED_TAX_RATES}
          renderRow={(r) => (
            <>
              <Td style={{ fontWeight: 700 }}>{r.hsn}</Td>
              <Td>{r.desc}</Td>
              <Td align="right">{r.cgst}%</Td>
              <Td align="right">{r.sgst}%</Td>
              <Td align="right" style={{ fontWeight: 700 }}>{r.igst}%</Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

/* ============================================================
   TAB 7 — FIXED ASSETS
   ============================================================ */
function FixedAssetsTab() {
  const active = SEED_ASSETS.filter(a => a.status === "Active");
  const totalCost = active.reduce((s, a) => s + a.cost, 0);
  const totalNBV = active.reduce((s, a) => s + a.nbv, 0);
  const totalDep = active.reduce((s, a) => s + a.accumDep, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Boxes} label="Gross Asset Value" value={fmtINR(totalCost)} tint={C.infoSoft} />
        <StatCard icon={TrendingDown} label="Accum. Depreciation" value={fmtINR(totalDep)} tint={C.dangerSoft} />
        <StatCard icon={Landmark} label="Net Book Value" value={fmtINR(totalNBV)} tint={C.primarySoft} />
        <StatCard icon={Boxes} label="Active Assets" value={active.length} tint={C.purpleSoft} />
      </div>

      <Card>
        <SectionHeader title="Fixed Asset Register" subtitle="Cost, depreciation method, and net book value" action={<Btn icon={Plus}>Add Asset</Btn>} />
        <Table
          columns={[
            { label: "Asset ID" }, { label: "Name" }, { label: "Category" }, { label: "Purchase Date" },
            { label: "Cost", align: "right" }, { label: "Method" }, { label: "Life (yrs)", align: "right" },
            { label: "Accum. Dep.", align: "right" }, { label: "NBV", align: "right" }, { label: "Status" },
          ]}
          rows={SEED_ASSETS}
          renderRow={(a) => (
            <>
              <Td style={{ fontWeight: 700 }}>{a.id}</Td>
              <Td>{a.name}</Td>
              <Td style={{ color: C.sub }}>{a.category}</Td>
              <Td>{a.purchaseDate}</Td>
              <Td align="right">{fmtINR(a.cost)}</Td>
              <Td><Badge text={a.method} tone="info" /></Td>
              <Td align="right">{a.life}</Td>
              <Td align="right" style={{ color: C.danger }}>{fmtINR(a.accumDep)}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>{fmtINR(a.nbv)}</Td>
              <Td><Badge text={a.status} tone={statusTone(a.status)} /></Td>
            </>
          )}
        />
      </Card>

      <Card>
        <SectionHeader title="Depreciation Methods — Reference" subtitle="Formulas used across the asset register" />
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260, padding: 14, borderRadius: 10, background: C.infoSoft }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.info }}>Straight Line (SLM)</div>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 6, lineHeight: 1.6 }}>
              Annual Depreciation = (Cost − Salvage Value) ÷ Useful Life
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260, padding: 14, borderRadius: 10, background: C.purpleSoft }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.purple }}>Written Down Value (WDV)</div>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 6, lineHeight: 1.6 }}>
              Annual Depreciation = NBV at start of year × Depreciation Rate %
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   TAB 8 — COST CENTER & MANUFACTURING COSTING
   ============================================================ */
function CostCenterTab() {
  const totalBudget = SEED_COST_CENTERS.reduce((s, c) => s + c.budget, 0);
  const totalActual = SEED_COST_CENTERS.reduce((s, c) => s + c.actual, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Factory} label="Total Cost Center Budget" value={fmtINR(totalBudget)} tint={C.infoSoft} />
        <StatCard icon={Wallet} label="Actual Spend (MTD)" value={fmtINR(totalActual)} tint={C.warnSoft} />
        <StatCard icon={totalActual <= totalBudget ? TrendingUp : TrendingDown}
          label="Net Variance" value={fmtINR(totalBudget - totalActual)}
          tint={totalActual <= totalBudget ? C.primarySoft : C.dangerSoft} />
      </div>

      <Card>
        <SectionHeader title="Cost Centers" subtitle="Budget vs actual spend by department" action={<Btn icon={Plus} variant="outline">Add Cost Center</Btn>} />
        <Table
          columns={[{ label: "Code" }, { label: "Cost Center" }, { label: "Head" }, { label: "Budget", align: "right" }, { label: "Actual", align: "right" }, { label: "Variance", align: "right" }, { label: "Utilization" }]}
          rows={SEED_COST_CENTERS}
          renderRow={(c) => (
            <>
              <Td style={{ fontWeight: 700, color: C.sub }}>{c.id}</Td>
              <Td style={{ fontWeight: 700 }}>{c.name}</Td>
              <Td>{c.head}</Td>
              <Td align="right">{fmtINR(c.budget)}</Td>
              <Td align="right">{fmtINR(c.actual)}</Td>
              <Td align="right" style={{ fontWeight: 800, color: c.variance >= 0 ? C.primary : C.danger }}>
                {c.variance >= 0 ? "+" : ""}{fmtINR(c.variance)}
              </Td>
              <Td style={{ width: 140 }}>
                <ProgressBar pct={(c.actual / c.budget) * 100} tone={c.actual > c.budget ? C.danger : C.primary} />
              </Td>
            </>
          )}
        />
      </Card>

      <Card>
        <SectionHeader title="Product Costing (Manufacturing)" subtitle="Material + labor + overhead build-up per unit" action={<Btn icon={Plus} variant="outline">Add Costing Sheet</Btn>} />
        <Table
          columns={[{ label: "Product" }, { label: "Material", align: "right" }, { label: "Labor", align: "right" }, { label: "Overhead", align: "right" }, { label: "Total Cost", align: "right" }, { label: "Selling Price", align: "right" }, { label: "Margin" }]}
          rows={SEED_PRODUCT_COSTING}
          renderRow={(p) => (
            <>
              <Td style={{ fontWeight: 700 }}>{p.product}</Td>
              <Td align="right">₹{p.material}</Td>
              <Td align="right">₹{p.labor}</Td>
              <Td align="right">₹{p.overhead}</Td>
              <Td align="right" style={{ fontWeight: 800 }}>₹{p.totalCost}</Td>
              <Td align="right">₹{p.sellingPrice}</Td>
              <Td><Badge text={p.margin} tone="success" /></Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

/* ============================================================
   TAB 9 — FINANCIAL STATEMENTS (P&L, Balance Sheet, Cash Flow)
   ============================================================ */
function LineRow({ label, amount, bold, indent }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", padding: "8px 0",
      paddingLeft: indent ? 16 : 0, borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 13, fontWeight: bold ? 800 : 500, color: bold ? C.text : C.sub }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 800 : 600, color: amount < 0 ? C.danger : C.text }}>{fmtINR(amount)}</span>
    </div>
  );
}

function FinancialStatementsTab() {
  const [stmt, setStmt] = useState("pl"); // pl | bs | cf

  const revTotal = SEED_PL.revenue.reduce((s, r) => s + r.amount, 0);
  const cogsTotal = SEED_PL.cogs.reduce((s, r) => s + r.amount, 0);
  const grossProfit = revTotal - cogsTotal;
  const opexTotal = SEED_PL.opex.reduce((s, r) => s + r.amount, 0);
  const netProfit = grossProfit - opexTotal;

  const bs = SEED_BALANCE_SHEET;
  const currentAssets = bs.assets.current.reduce((s, a) => s + a.amount, 0);
  const fixedAssets = bs.assets.fixed.reduce((s, a) => s + a.amount, 0);
  const totalAssets = currentAssets + fixedAssets;
  const currentLiab = bs.liabilities.current.reduce((s, a) => s + a.amount, 0);
  const longTermLiab = bs.liabilities.longTerm.reduce((s, a) => s + a.amount, 0);
  const totalLiab = currentLiab + longTermLiab;
  const totalEquity = bs.equity.reduce((s, a) => s + a.amount, 0);

  const cf = SEED_CASH_FLOW;
  const opCash = cf.operating.reduce((s, a) => s + a.amount, 0);
  const invCash = cf.investing.reduce((s, a) => s + a.amount, 0);
  const finCash = cf.financing.reduce((s, a) => s + a.amount, 0);
  const netCash = opCash + invCash + finCash;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 9 }}>
          {[{ id: "pl", label: "Profit & Loss" }, { id: "bs", label: "Balance Sheet" }, { id: "cf", label: "Cash Flow" }].map(t => (
            <button key={t.id} onClick={() => setStmt(t.id)}
              style={{
                padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 12.5, fontWeight: 700,
                background: stmt === t.id ? "#fff" : "transparent",
                color: stmt === t.id ? C.primaryDark : C.sub,
                boxShadow: stmt === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{t.label}</button>
          ))}
        </div>
        <Btn icon={Download} variant="outline">Export PDF</Btn>
      </div>

      {stmt === "pl" && (
        <Card>
          <SectionHeader title="Profit & Loss Statement" subtitle={SEED_PL.period} />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Revenue</div>
          {SEED_PL.revenue.map((r, i) => <LineRow key={i} label={r.label} amount={r.amount} indent />)}
          <LineRow label="Net Revenue" amount={revTotal} bold />

          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Cost of Goods Sold</div>
          {SEED_PL.cogs.map((r, i) => <LineRow key={i} label={r.label} amount={r.amount} indent />)}
          <LineRow label="Gross Profit" amount={grossProfit} bold />

          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Operating Expenses</div>
          {SEED_PL.opex.map((r, i) => <LineRow key={i} label={r.label} amount={r.amount} indent />)}

          <div style={{
            display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10,
            borderTop: `2px solid ${C.text}`,
          }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Net Profit</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: netProfit >= 0 ? C.primary : C.danger }}>{fmtINR(netProfit)}</span>
          </div>
        </Card>
      )}

      {stmt === "bs" && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Card style={{ flex: 1, minWidth: 300 }}>
            <SectionHeader title="Assets" subtitle={`As of ${bs.asOf}`} />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Current Assets</div>
            {bs.assets.current.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <LineRow label="Total Current Assets" amount={currentAssets} bold />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Fixed Assets</div>
            {bs.assets.fixed.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <LineRow label="Total Fixed Assets" amount={fixedAssets} bold />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10, borderTop: `2px solid ${C.text}` }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>Total Assets</span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{fmtINR(totalAssets)}</span>
            </div>
          </Card>

          <Card style={{ flex: 1, minWidth: 300 }}>
            <SectionHeader title="Liabilities & Equity" subtitle={`As of ${bs.asOf}`} />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Current Liabilities</div>
            {bs.liabilities.current.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <LineRow label="Total Current Liabilities" amount={currentLiab} bold />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Long-Term Liabilities</div>
            {bs.liabilities.longTerm.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <LineRow label="Total Liabilities" amount={totalLiab} bold />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Equity</div>
            {bs.equity.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
            <LineRow label="Total Equity" amount={totalEquity} bold />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10, borderTop: `2px solid ${C.text}` }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>Total Liabilities + Equity</span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{fmtINR(totalLiab + totalEquity)}</span>
            </div>
          </Card>
        </div>
      )}

      {stmt === "cf" && (
        <Card>
          <SectionHeader title="Cash Flow Statement" subtitle={cf.period} />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", marginBottom: 6 }}>Operating Activities</div>
          {cf.operating.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
          <LineRow label="Net Cash from Operations" amount={opCash} bold />

          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Investing Activities</div>
          {cf.investing.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
          <LineRow label="Net Cash from Investing" amount={invCash} bold />

          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", margin: "16px 0 6px" }}>Financing Activities</div>
          {cf.financing.map((a, i) => <LineRow key={i} label={a.label} amount={a.amount} indent />)}
          <LineRow label="Net Cash from Financing" amount={finCash} bold />

          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 10, borderTop: `2px solid ${C.text}` }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Net Increase in Cash</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: netCash >= 0 ? C.primary : C.danger }}>{fmtINR(netCash)}</span>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   TAB 10 — BUDGET & EXPENSE MANAGEMENT
   ============================================================ */
function BudgetExpenseTab() {
  const totalBudgeted = SEED_BUDGETS.reduce((s, b) => s + b.budgeted, 0);
  const totalActual = SEED_BUDGETS.reduce((s, b) => s + b.actual, 0);
  const pendingCount = SEED_EXPENSE_REQUESTS.filter(e => e.status === "Pending Approval").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={PieChart} label="Total Budgeted" value={fmtINR(totalBudgeted)} tint={C.infoSoft} />
        <StatCard icon={Wallet} label="Actual Spend" value={fmtINR(totalActual)} tint={C.warnSoft} />
        <StatCard icon={totalActual <= totalBudgeted ? TrendingUp : TrendingDown}
          label="Budget Variance" value={fmtINR(totalBudgeted - totalActual)}
          tint={totalActual <= totalBudgeted ? C.primarySoft : C.dangerSoft} />
        <StatCard icon={Clock} label="Pending Approvals" value={pendingCount} tint={C.purpleSoft} />
      </div>

      <Card>
        <SectionHeader title="Budget vs Actual" subtitle="By expense category — current quarter" action={<Btn icon={Plus} variant="outline">New Budget Line</Btn>} />
        <Table
          columns={[{ label: "Category" }, { label: "Period" }, { label: "Budgeted", align: "right" }, { label: "Actual", align: "right" }, { label: "Utilization" }]}
          rows={SEED_BUDGETS}
          renderRow={(b) => {
            const pct = (b.actual / b.budgeted) * 100;
            const over = b.actual > b.budgeted;
            return (
              <>
                <Td style={{ fontWeight: 700 }}>{b.category}</Td>
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
        <SectionHeader title="Expense Approval Requests" subtitle="Employee-submitted expenses awaiting review" action={<Btn icon={Plus}>New Request</Btn>} />
        <Table
          columns={[{ label: "Request #" }, { label: "Requested By" }, { label: "Purpose" }, { label: "Date" }, { label: "Amount", align: "right" }, { label: "Status" }]}
          rows={SEED_EXPENSE_REQUESTS}
          renderRow={(e) => (
            <>
              <Td style={{ fontWeight: 700 }}>{e.id}</Td>
              <Td>{e.requestedBy}</Td>
              <Td>{e.purpose}</Td>
              <Td>{e.date}</Td>
              <Td align="right" style={{ fontWeight: 700 }}>{fmtINR(e.amount)}</Td>
              <Td><Badge text={e.status} tone={statusTone(e.status)} /></Td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT — Accounting
   ============================================================ */
const TABS = [
  { id: "dashboard",   label: "Dashboard",              icon: LayoutDashboard, Comp: DashboardTab },
  { id: "gl",          label: "General Ledger",         icon: BookOpen,        Comp: GeneralLedgerTab },
  { id: "ar",          label: "Accounts Receivable",    icon: Receipt,         Comp: ReceivableTab },
  { id: "ap",          label: "Accounts Payable",       icon: FileText,        Comp: PayableTab },
  { id: "cashbank",    label: "Cash & Bank",             icon: Landmark,        Comp: CashBankTab },
  { id: "gst",         label: "GST & Tax",               icon: Percent,         Comp: GSTTab },
  { id: "assets",      label: "Fixed Assets",            icon: Boxes,           Comp: FixedAssetsTab },
  { id: "costcenter",  label: "Cost Center & Costing",   icon: Factory,         Comp: CostCenterTab },
  { id: "statements",  label: "Financial Statements",    icon: FileBarChart2,   Comp: FinancialStatementsTab },
  { id: "budget",      label: "Budget & Expenses",       icon: Wallet,          Comp: BudgetExpenseTab },
];

export default function Accounting() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTabState] = useState(
    TABS.some(t => t.id === urlTab) ? urlTab : "dashboard"
  );

  useEffect(() => {
    if (urlTab && TABS.some(t => t.id === urlTab) && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  const setActiveTab = (id) => {
    setActiveTabState(id);
    setSearchParams({ tab: id });
  };

  const active = useMemo(() => TABS.find(t => t.id === activeTab) || TABS[0], [activeTab]);
  const ActiveComp = active.Comp;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Accounting & Finance</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>
            General ledger, receivables, payables, tax, assets, and financial reporting
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn icon={Filter} variant="outline">Filter</Btn>
          <Btn icon={Download} variant="outline">Export</Btn>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{
        display: "flex", gap: 4, overflowX: "auto", borderBottom: `1px solid ${C.border}`,
        paddingBottom: 0,
      }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 14px",
                border: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap",
                fontSize: 13, fontWeight: 700,
                color: isActive ? C.primaryDark : C.sub,
                borderBottom: isActive ? `2.5px solid ${C.primary}` : "2.5px solid transparent",
                marginBottom: -1,
              }}
            >
              <Icon size={15} strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <ActiveComp />
    </div>
  );
}
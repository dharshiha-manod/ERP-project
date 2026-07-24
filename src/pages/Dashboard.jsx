import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { useBusiness } from "../context/BusinessContext";

const BASES = ["http://localhost:5000/api","http://localhost:3000/api","http://127.0.0.1:5000/api"];
async function apiFetch(path) {
  const token = localStorage.getItem("manod_token");
  for (const base of BASES) {
    try {
      const r = await fetch(`${base}${path}`, { headers: token ? { Authorization:`Bearer ${token}` } : {} });
      if (r.ok) return await r.json();
    } catch (e) { /* try next base */ }
  }
  return null;
}
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

/* ─── Palette reads from theme ───────────────────────────────────────────── */
function useC() {
  const { theme } = useTheme();
  return {
    brand:    theme["--sb-active-bg"]  || "#1a4731",
    brandMid: theme["--sb-icon-color"] || "#2d6a4f",
    brandLt:  theme["--manod-accent-mid"] || "#40916c",
    accent:   theme["--manod-accent-mid"] || "#52b788",
    accentLt: theme["--manod-accent-mid"] || "#95d5b2",
    gold:     "#f59e0b",
    red:      "#ef4444",
    blue:     "#3b82f6",
    purple:   "#8b5cf6",
    bg:       theme["--manod-page-bg"] || "#f0f4f1",
    card:     "#ffffff",
    border:   theme["--sb-border"]     || "#e2ede6",
    text:     "#0f1f16",
    muted:    "#6b7a72",
    welcome:  theme["--manod-welcome-bg"] || "linear-gradient(135deg,#1a3d2b 0%,#2d5a3d 100%)",
    btnActive: theme["--manod-btn-active-bg"] || "#1a3d2b",
  };
}

/* ─── Mock Data ──────────────────────────────────────────────────────────── */
// live data now loaded inside Dashboard() via apiFetch — see useEffect below
/* ─── Icons ──────────────────────────────────────────────────────────────── */
const icon = (d) => (sz=18,col="currentColor") => <svg width={sz} height={sz} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={d}/></svg>;
function ShoppingCartIcon({size=18,color="currentColor"}) { return <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>; }
function PackageIcon({size=18,color="currentColor"}) { return <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function ReceiptIcon({size=18,color="currentColor"}) { return <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8H8m8 4H8m8 4H8"/></svg>; }
function MonitorIcon({size=18,color="currentColor"}) { return <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>; }
function ChartBarIcon({size=18,color="currentColor"}) { return <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>; }
function UserPlusIcon({size=18,color="currentColor"}) { return <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>; }
function BellIcon({size=18}) { return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function TrendUpIcon({size=14}) { return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function TrendDownIcon({size=14}) { return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>; }

/* ─── Animated Counter ───────────────────────────────────────────────────── */
function AnimCounter({ target, prefix="₹ ", suffix="", decimals=2, duration=1200 }) {
  const [val, setVal] = useState(0);
  const fr = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(target * ease);
      if (p < 1) fr.current = requestAnimationFrame(tick);
    };
    fr.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(fr.current);
  }, [target, duration]);
  const display = decimals > 0
    ? val.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(val).toLocaleString("en-IN");
  return <span>{prefix}{display}{suffix}</span>;
}

/* ─── Chart Tooltip ──────────────────────────────────────────────────────── */
function ChartTip({ active, payload, label }) {
  const C = useC();
  if (!active || !payload?.length) return null;

  // Merge payload so both Sales & Purchases always show, even if one series has 0 or is missing from payload
  const dataPoint = payload[0]?.payload || {};
  const series = [
    { name: "Sales", value: dataPoint.sales ?? 0, color: C.brandMid },
    { name: "Purchases", value: dataPoint.purchases ?? 0, color: C.blue },
  ];

  return (
    <div style={{
      background: "#ffffff",
      color: C.text,
      borderRadius: 12,
      padding: "12px 16px",
      fontSize: 12,
      minWidth: 160,
      boxShadow: "0 8px 28px rgba(15,31,22,0.18)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 12.5, color: C.muted, letterSpacing: "0.2px" }}>
        {label}
      </div>
      {series.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "3px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            <span style={{ color: C.muted, fontWeight: 600 }}>{s.name}</span>
          </div>
          <span style={{ fontWeight: 800, color: C.text }}>₹ {s.value.toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, iconBg, iconColor, change, changeUp, prefix="₹ ", decimals=0, isCount }) {
  const C = useC();
  return (
    <div style={{ background:C.card, borderRadius:16, padding:"20px 22px", boxShadow:`0 1px 8px ${C.border}`, border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:12, transition:"transform 0.2s, box-shadow 0.2s", cursor:"default" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(15,31,22,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 1px 8px ${C.border}`; }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:"0.3px", textTransform:"uppercase" }}>{label}</span>
        <div style={{ width:40, height:40, borderRadius:10, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={18} color={iconColor} />
        </div>
      </div>
      <div style={{ fontSize:24, fontWeight:800, color:C.text, lineHeight:1 }}>
        <AnimCounter target={value} prefix={isCount?"":prefix} decimals={isCount?0:decimals} />
      </div>
      {change && (
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, fontWeight:600, color: changeUp?"#16a34a":C.red }}>
          {changeUp ? <TrendUpIcon /> : <TrendDownIcon />}
          {change} vs last period
        </div>
      )}
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
function Badge({ status }) {
  const map = { Paid:{bg:"#dcfce7",color:"#166534"}, Due:{bg:"#fee2e2",color:"#991b1b"}, Partial:{bg:"#fef9c3",color:"#854d0e"} };
  const s = map[status] || { bg:"#f3f4f6", color:"#374151" };
  return <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color, letterSpacing:"0.3px" }}>{status}</span>;
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
function Avatar({ initials }) {
  const C = useC();
  const colors = [C.brandMid, "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
  const idx = initials.charCodeAt(0) % colors.length;
  return <div style={{ width:34, height:34, borderRadius:10, background:colors[idx], display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0 }}>{initials}</div>;
}

/* ─── Card wrappers ──────────────────────────────────────────────────────── */
function Card({ children, style={} }) {
  const C = useC();
  return <div style={{ background:C.card, borderRadius:16, boxShadow:`0 1px 8px ${C.border}`, border:`1px solid ${C.border}`, overflow:"hidden", ...style }}>{children}</div>;
}
function CardHeader({ title, subtitle, action }) {
  const C = useC();
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 0" }}>
      <div>
        <div style={{ fontWeight:800, fontSize:15, color:C.text }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const C = useC();
const { theme } = useTheme();
  const { business } = useBusiness();
  const [period, setPeriod] = useState("This Month");
  const [mounted, setMounted] = useState(false);

  // Turn the selected period into a concrete date range
  function getPeriodRange(p) {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (p === "Today") {
      // start = end = today
    } else if (p === "This Week") {
      const day = now.getDay(); // 0=Sun
      const diffToMonday = day === 0 ? 6 : day - 1;
      start.setDate(now.getDate() - diffToMonday);
    } else if (p === "This Month") {
      start.setDate(1);
    } else if (p === "This Year") {
      start.setMonth(0, 1);
    }

    const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
    return { from: fmt(start), to: fmt(end) };
  }
  const [stats, setStats] = useState({
    totalSales:0, netProfit:0, invoiceDue:0, totalSellReturn:0,
    totalPurchase:0, purchaseDue:0, totalOrders:0, totalExpense:0,
  });
  const [salesData, setSalesData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stockCounts, setStockCounts] = useState({ low:0, out:0, total:0 });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);
useEffect(() => {
    (async () => {
      setLoadingData(true);

      const { from, to } = getPeriodRange(period);
      // report endpoints use snake_case date params
      const rq = `date_from=${from}&date_to=${to}`;
      // /sales-invoice uses camelCase date params
      const invQ = `dateFrom=${from}&dateTo=${to}`;

      const [sellPay, netProfit, purPay, prodSell, stock, posSales, invoices, returns, expenses, categorySales] = await Promise.all([
        apiFetch(`/reports/sell-payment?limit=1000&${rq}`),
        apiFetch(`/reports/net-profit?${rq}`),
        apiFetch(`/reports/purchase-payment?limit=1000&${rq}`),
        apiFetch(`/reports/product-sell?limit=1000&${rq}`),
        apiFetch("/reports/stock?limit=1000"), // stock has no date dimension — always current
        apiFetch("/pos-sales?limit=1000"),      // backend ignores date filter — filter client-side below
        apiFetch(`/sales-invoice?limit=1000&${invQ}`),
        apiFetch("/sales-returns?limit=1000"),  // backend ignores date filter — filter client-side below
        apiFetch(`/reports/expense?limit=1000&${rq}`),
        apiFetch(`/reports/sales-by-category?${rq}`),
      ]);

      // POS sales: backend doesn't filter by date, so filter here using each row's `date`
      const posInRange = (posSales?.data || []).filter(p => {
        if (!p.date) return false;
        const d = new Date(p.date).toISOString().slice(0, 10);
        return d >= from && d <= to;
      });

      // Sales returns: same situation — filter by createdAt
      const returnsInRange = (returns?.data || []).filter(r => {
        const raw = r.createdAt || r.date;
        if (!raw) return false;
        const d = new Date(raw).toISOString().slice(0, 10);
        return d >= from && d <= to;
      });

      const sellSummary = sellPay?.summary || {};
      const purSummary  = purPay?.summary  || {};
const npData      = netProfit?.data?.summary || {};
      const stockSummary = stock?.summary || {};
      const totalSellReturn = returnsInRange.reduce((s,r)=>s+Number(r.grandTotal||0),0);

      setStats({
        totalSales:     Number(sellSummary.total_billed || 0),
       netProfit:      Number(npData.net_profit || 0), 
        invoiceDue:     Number(sellSummary.outstanding || 0),
        totalSellReturn,
        totalPurchase:  Number(purSummary.total_billed || 0),
        purchaseDue:    Number(purSummary.outstanding || 0),
        totalOrders:    (invoices?.data?.length || 0) + posInRange.length,
        totalExpense:   Number(expenses?.summary?.total_amount || 0),
      });
setStockCounts({
        low:   Number(stockSummary.low_or_out_count || 0),
        out:   (stock?.data || []).filter(r=>r.status==="Out of Stock").length,
        total: Number(stockSummary.total_skus || 0),
      });

      // Group invoices by day for the trend chart (last 30 entries)
      const byDay = {};
      (invoices?.data || []).forEach(inv => {
        const d = inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("en-IN",{month:"short",day:"numeric"}) : "—";
        byDay[d] = byDay[d] || { day:d, sales:0, purchases:0 };
        byDay[d].sales += Number(inv.grandTotal||0);
      });
      (purPay?.data || []).forEach(p => {
        const d = p.date ? new Date(p.date).toLocaleDateString("en-IN",{month:"short",day:"numeric"}) : "—";
        byDay[d] = byDay[d] || { day:d, sales:0, purchases:0 };
        byDay[d].purchases += Number(p.amount||0);
      });
  const rawDays = Object.values(byDay);
const paddedDays = [];
const todayDate = new Date();
for (let i = 6; i >= 0; i--) {
  const d = new Date(todayDate);
  d.setDate(d.getDate() - i);
  const label = d.toLocaleDateString("en-IN", { month:"short", day:"numeric" });
  const existing = rawDays.find(r => r.day === label);
  paddedDays.push(existing || { day: label, sales: 0, purchases: 0 });
}
setSalesData(paddedDays);
      const invRows = (invoices?.data || []).slice(0,5).map(inv => ({
        id: inv.invoiceNo, customer: inv.customer, amount: Number(inv.grandTotal||0),
        status: inv.paymentStatus === "Unpaid" ? "Due" : inv.paymentStatus,
        date: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("en-IN",{month:"short",day:"numeric"}) : "",
        avatar: (inv.customer||"NA").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      }));
      setRecentSales(invRows);

      const prodMap = {};
      (prodSell?.data || []).forEach(r => {
        const key = r.product;
        if (!prodMap[key]) prodMap[key] = { name:r.product, sku:r.sku, sold:0, revenue:0 };
        prodMap[key].sold += Number(r.qty||0);
        prodMap[key].revenue += Number(r.amount||0);
      });
      const topList = Object.values(prodMap).sort((a,b)=>b.sold-a.sold).slice(0,5)
        .map(p => ({ ...p, trend:"", up:true }));
   setTopProducts(topList);
      setCategoryData(categorySales?.data || []);

      setLoadingData(false);
    })();
  }, [period]);

  const today = new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const go = (path) => { window.location.href = path; };



  const quickActions = [
    { label:"Add Sale",     icon:ShoppingCartIcon, path:"/sells/create",     bg:"#dcfce7", accent:C.brandMid },
    { label:"Add Purchase", icon:PackageIcon,       path:"/purchases/create", bg:"#eff6ff", accent:C.blue },
    { label:"Add Expense",  icon:ReceiptIcon,       path:"/expenses/create",  bg:"#faf5ff", accent:C.purple },
    { label:"Open POS",     icon:MonitorIcon,       path:"/pos/create",       bg:"#fffbeb", accent:C.gold },
    { label:"Stock Report", icon:ChartBarIcon,      path:"/reports/stock",    bg:"#fef2f2", accent:C.red },
    { label:"Add Customer", icon:UserPlusIcon,      path:"/contacts",         bg:"#f0fdf4", accent:C.accent },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", color:C.text, padding:"28px 32px", background:C.bg, minHeight:"100vh", opacity:mounted?1:0, transition:"opacity 0.4s ease" }}>

      {/* ── Welcome Banner ── */}
      <div style={{ background:C.welcome, borderRadius:20, padding:"28px 36px", marginBottom:28, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:`0 8px 32px rgba(0,0,0,0.18)`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-60, top:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute", right:100, bottom:-80, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:13, marginBottom:4 }}>{today}</div>
       <h1 style={{ color:"#fff", fontSize:30, fontWeight:900, margin:0 }}>Welcome back, Admin 👋</h1>
         <p style={{ color:"rgba(255,255,255,0.75)", margin:"6px 0 0", fontSize:14 }}>
            Here's your business snapshot for <strong style={{ color:"#fff" }}>{business?.business_name || "Manodtechnologies"}</strong>
          </p>
        </div>
        <div style={{ display:"flex", gap:8, position:"relative" }}>
          {["Today","This Week","This Month","This Year"].map(f => (
            <button key={f} onClick={() => setPeriod(f)} style={{ padding:"8px 18px", borderRadius:24, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:period===f?"#fff":"rgba(255,255,255,0.15)", color:period===f?C.btnActive:"#fff", transition:"all 0.2s", boxShadow:period===f?"0 2px 12px rgba(0,0,0,0.15)":"none" }}>{f}</button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards Row 1 ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Sales"       value={stats.totalSales}      icon={ShoppingCartIcon} iconBg="#dcfce7" iconColor={C.brandMid} />
        <StatCard label="Net Profit"        value={stats.netProfit}       icon={ChartBarIcon}     iconBg="#eff6ff" iconColor={C.blue} />
        <StatCard label="Invoice Due"       value={stats.invoiceDue}      icon={ReceiptIcon}      iconBg="#fffbeb" iconColor={C.gold} />
        <StatCard label="Total Sell Return" value={stats.totalSellReturn} icon={PackageIcon}      iconBg="#fef2f2" iconColor={C.red} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        <StatCard label="Total Purchase" value={stats.totalPurchase} icon={PackageIcon}      iconBg="#eef2ff" iconColor={C.purple} />
        <StatCard label="Purchase Due"   value={stats.purchaseDue}   icon={BellIcon}         iconBg="#fff7ed" iconColor="#f97316" />
        <StatCard label="Total Orders"   value={stats.totalOrders}   icon={ShoppingCartIcon} iconBg="#f0fdf4" iconColor={C.accent} isCount />
        <StatCard label="Total Expense"  value={stats.totalExpense}  icon={ReceiptIcon}      iconBg="#faf5ff" iconColor={C.purple} />
      </div>
      {/* ── Charts Row 1 ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
       <Card>
          <CardHeader title="📈 Sales vs Purchase — Last 7 Days" subtitle="Manodtechnologies (BL0001)"
            action={<span style={{ fontSize:12, color:C.muted, background:"#f0fdf4", padding:"4px 12px", borderRadius:20, fontWeight:600 }}>{salesData[0]?.day} – {salesData[salesData.length-1]?.day}</span>} />
     <div style={{ padding:"16px 22px 20px" }}>
           <ResponsiveContainer width="100%" height={280}>
  <AreaChart data={salesData} margin={{ top:20, right:16, left:0, bottom:0 }}>
    <defs>
      <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.brandMid} stopOpacity={0.35}/>
        <stop offset="55%" stopColor={C.brandMid} stopOpacity={0.08}/>
        <stop offset="100%" stopColor={C.brandMid} stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.blue} stopOpacity={0.28}/>
        <stop offset="55%" stopColor={C.blue} stopOpacity={0.06}/>
        <stop offset="100%" stopColor={C.blue} stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="4 8" stroke="#e9f0ec" vertical={false} />
    <XAxis
      dataKey="day"
      tick={{ fontSize:11.5, fill:C.muted, fontWeight:600 }}
      tickLine={false}
      axisLine={{ stroke: C.border }}
      padding={{ left:16, right:16 }}
    />
    <YAxis
      tick={{ fontSize:11, fill:C.muted, fontWeight:500 }}
      tickLine={false}
      axisLine={false}
      width={48}
      tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(1)}k` : `₹${v}`}
    />
    <Tooltip
      content={<ChartTip />}
      cursor={{ stroke: C.brandMid, strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.4 }}
    />
    <Area
      type="monotone"
      dataKey="purchases"
      name="Purchases"
      stroke={C.blue}
      strokeWidth={2.5}
      fill="url(#gP)"
      dot={false}
      activeDot={{ r:6, fill:"#fff", strokeWidth:2.5, stroke:C.blue }}
      animationDuration={1000}
      animationEasing="ease-out"
    />
    <Area
      type="monotone"
      dataKey="sales"
      name="Sales"
      stroke={C.brandMid}
      strokeWidth={3}
      fill="url(#gS)"
      dot={false}
      activeDot={{ r:6.5, fill:"#fff", strokeWidth:3, stroke:C.brandMid }}
      animationDuration={1200}
      animationEasing="ease-out"
    />
  </AreaChart>
</ResponsiveContainer>
  <div style={{ display:"flex", gap:12, marginTop:18 }}>
  {[
    { label:"Total Sales", val:stats.totalSales, dot:C.brandMid, bg:"#f7fdf9" },
    { label:"Total Purchase", val:stats.totalPurchase, dot:C.blue, bg:"#f7faff" },
    { label:"Net Profit", val:stats.netProfit, dot:C.accent, bg: stats.netProfit>=0 ? "#f7fdf9" : "#fff7f7" },
  ].map(m => (
    <div key={m.label} style={{ flex:1, display:"flex", flexDirection:"column", gap:6, padding:"14px 16px", borderRadius:14, background:m.bg, border:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:m.dot, boxShadow:`0 0 0 3px ${m.dot}22` }} />
        <span style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:"0.3px", textTransform:"uppercase" }}>{m.label}</span>
      </div>
      <div style={{ fontWeight:900, fontSize:19, color:C.text, letterSpacing:"-0.3px" }}>
        {m.val < 0 ? "-" : ""}₹{Math.abs(m.val).toLocaleString("en-IN")}
      </div>
    </div>
  ))}
</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="📦 Sales by Category" />
          <div style={{ padding:"16px 22px 20px" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="pct" nameKey="category" paddingAngle={3} strokeWidth={0}>
                  {categoryData.map((e, i) => <Cell key={i} fill={[C.brandMid, C.accent, C.gold, C.blue, C.purple, C.red][i % 6]} />)}
                </Pie>
                <Tooltip formatter={v=>`${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
              {categoryData.map((c, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:[C.brandMid, C.accent, C.gold, C.blue, C.purple, C.red][i % 6] }} />
                    <span style={{ fontSize:12, color:C.muted }}>{c.category}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
   <Card>
          <CardHeader title="📊 Weekly Revenue" subtitle="This week vs returns" />
          <div style={{ padding:"14px 22px 20px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={salesData} barGap={4}>
            <CartesianGrid stroke="transparent" />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:C.muted }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11, fill:C.muted }} tickLine={false} axisLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="sales"   name="Sales"   fill={C.brandMid} radius={[6,6,0,0]} maxBarSize={28} />
                <Bar dataKey="returns" name="Returns" fill="#fca5a5"    radius={[6,6,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="⚡ Quick Actions" />
          <div style={{ padding:"14px 22px 20px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {quickActions.map((q, i) => (
                <button key={i} onClick={() => go(q.path)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, border:"none", background:q.bg, cursor:"pointer", fontSize:13, fontWeight:700, color:q.accent, transition:"all 0.15s", textAlign:"left" }}
                  onMouseEnter={e => { e.currentTarget.style.filter="brightness(0.93)"; e.currentTarget.style.transform="scale(0.98)"; }}
                  onMouseLeave={e => { e.currentTarget.style.filter="none"; e.currentTarget.style.transform="none"; }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:`${q.accent}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <q.icon size={17} color={q.accent} />
                  </div>
                  {q.label}
                </button>
              ))}
            </div>
         <div style={{ marginTop:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:8 }}>🔔 Alerts</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {(stockCounts.out > 0 || stockCounts.low > 0
                  ? [
                      ...(stockCounts.out > 0 ? [{ type:"error",   msg:`${stockCounts.out} products out of stock`, time:"" }] : []),
                      ...(stockCounts.low > 0 ? [{ type:"warning", msg:`${stockCounts.low} products below minimum stock level`, time:"" }] : []),
                    ]
                  : [{ type:"info", msg:"No stock alerts right now", time:"" }]
                ).map((a, i) => {
                  const cfg = { warning:{ bg:"#fffbeb", color:"#92400e", dot:"#f59e0b" }, error:{ bg:"#fef2f2", color:"#991b1b", dot:"#ef4444" }, info:{ bg:"#eff6ff", color:"#1e40af", dot:"#3b82f6" } }[a.type];
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, background:cfg.bg, borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, marginTop:4, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, color:cfg.color, fontWeight:600 }}>{a.msg}</div>
                        <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{a.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Tables ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <Card>
          <CardHeader title="📋 Recent Sales"
            action={<button onClick={() => go("/sells")} style={{ fontSize:12, fontWeight:700, color:C.brandMid, background:"#f0fdf4", border:"none", cursor:"pointer", padding:"5px 12px", borderRadius:20 }}>View All →</button>} />
          <div style={{ padding:"12px 0 0" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>{["Invoice","Customer","Amount","Status","Date"].map(h => <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.3px", textTransform:"uppercase", borderBottom:`2px solid ${C.border}` }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${i<recentSales.length-1?C.border:"transparent"}` }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8fbf9"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"11px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:8 }}><Avatar initials={s.avatar}/><span style={{ color:C.brandMid, fontWeight:700, fontSize:12 }}>{s.id}</span></div></td>
                    <td style={{ padding:"11px 14px", color:C.text, fontWeight:500 }}>{s.customer}</td>
                    <td style={{ padding:"11px 14px", fontWeight:800, color:C.text }}>₹ {s.amount.toLocaleString("en-IN")}</td>
                    <td style={{ padding:"11px 14px" }}><Badge status={s.status} /></td>
                    <td style={{ padding:"11px 14px", color:C.muted, fontSize:12 }}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="🔥 Top Products"
            action={<button onClick={() => go("/reports/product-sell")} style={{ fontSize:12, fontWeight:700, color:C.brandMid, background:"#f0fdf4", border:"none", cursor:"pointer", padding:"5px 12px", borderRadius:20 }}>Full Report →</button>} />
          <div style={{ padding:"12px 0 0" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>{["Product","Sold","Revenue","Trend"].map(h => <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.3px", textTransform:"uppercase", borderBottom:`2px solid ${C.border}` }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${i<topProducts.length-1?C.border:"transparent"}` }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8fbf9"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 14px" }}><div style={{ fontWeight:700, color:C.text, fontSize:12 }}>{p.name}</div><div style={{ fontSize:10, color:C.muted }}>{p.sku}</div></td>
                    <td style={{ padding:"10px 14px", color:C.muted, fontWeight:600 }}>{p.sold}</td>
                    <td style={{ padding:"10px 14px", fontWeight:800, color:C.brandMid }}>₹ {p.revenue.toLocaleString("en-IN")}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:11, fontWeight:700, color:p.up?"#16a34a":C.red, background:p.up?"#dcfce7":"#fee2e2", padding:"3px 8px", borderRadius:20 }}>
                        {p.up ? <TrendUpIcon size={11}/> : <TrendDownIcon size={11}/>}{p.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ margin:"12px 14px 14px", background:C.bg, borderRadius:12, display:"flex", gap:0, overflow:"hidden", border:`1px solid ${C.border}` }}>
             {[
  { label:"Low Stock", val:String(stockCounts.low), color:C.gold },
  { label:"Out of Stock", val:String(stockCounts.out), color:C.red },
  { label:"Total Products", val:String(stockCounts.total), color:C.brandMid },
].map((m, i) => (
                <div key={i} style={{ flex:1, padding:"12px 14px", textAlign:"center", borderRight:i<2?`1px solid ${C.border}`:"none" }}>
                  <div style={{ fontWeight:900, fontSize:20, color:m.color }}>{m.val}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ textAlign:"center", color:C.muted, fontSize:12, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
        Manod Technologies — V8.0 &nbsp;|&nbsp; Copyright © 2026 All rights reserved.
      </div>
    </div>
  );
}
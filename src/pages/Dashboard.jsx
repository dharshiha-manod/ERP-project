import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
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
const salesData = [
  { day:"May 1",  sales:12400, purchases:8200,  profit:4200 },
  { day:"May 5",  sales:18900, purchases:11000, profit:7900 },
  { day:"May 10", sales:15300, purchases:9800,  profit:5500 },
  { day:"May 15", sales:22800, purchases:14200, profit:8600 },
  { day:"May 20", sales:19600, purchases:12500, profit:7100 },
  { day:"May 25", sales:31200, purchases:18900, profit:12300 },
  { day:"Jun 1",  sales:27500, purchases:16400, profit:11100 },
];
const weeklyData = [
  { day:"Mon", sales:4200,  returns:320 },
  { day:"Tue", sales:6800,  returns:180 },
  { day:"Wed", sales:5100,  returns:420 },
  { day:"Thu", sales:7900,  returns:260 },
  { day:"Fri", sales:9200,  returns:310 },
  { day:"Sat", sales:11400, returns:480 },
  { day:"Sun", sales:3800,  returns:140 },
];
const recentSales = [
  { id:"INV-2026-0091", customer:"Arvind Systems", amount:48200, status:"Paid",    date:"Jun 01", avatar:"AS" },
  { id:"INV-2026-0090", customer:"TechVision Ltd",  amount:32750, status:"Partial", date:"May 31", avatar:"TV" },
  { id:"INV-2026-0089", customer:"GlobalMart Co",   amount:19400, status:"Due",     date:"May 30", avatar:"GM" },
  { id:"INV-2026-0088", customer:"Nexus Hardware",  amount:71300, status:"Paid",    date:"May 29", avatar:"NH" },
  { id:"INV-2026-0087", customer:"BrightCore Inc",  amount:25600, status:"Paid",    date:"May 28", avatar:"BC" },
];
const topProducts = [
  { name:'ASUS ROG Monitor 27"', sku:"EL-MON-027", sold:143, revenue:214500, trend:"+18%", up:true },
  { name:"Logitech MX Master 3S", sku:"AC-MOU-003", sold:218, revenue:87200,  trend:"+31%", up:true },
  { name:"Samsung SSD 1TB",        sku:"CP-SSD-010", sold:97,  revenue:97000,  trend:"-4%",  up:false },
  { name:"Corsair RAM 16GB DDR5",  sku:"CP-RAM-016", sold:182, revenue:127400, trend:"+22%", up:true },
  { name:"TP-Link WiFi 6 Router",  sku:"NT-RTR-006", sold:64,  revenue:64000,  trend:"+9%",  up:true },
];
const alerts = [
  { type:"warning", msg:"12 products below minimum stock level", time:"2h ago" },
  { type:"error",   msg:"3 invoices overdue by more than 30 days", time:"5h ago" },
  { type:"info",    msg:"Purchase order PO-2026-044 received", time:"Yesterday" },
];

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
  return (
    <div style={{ background: C.brand, color:"#fff", borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
      <div style={{ fontWeight:700, marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || C.accentLt }}>{p.name}: ₹ {Number(p.value).toLocaleString("en-IN")}</div>)}
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
  const [period, setPeriod] = useState("This Month");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const go = (path) => { window.location.href = path; };

  const categoryData = [
    { name:"Electronics", value:38, color:C.brandMid },
    { name:"Accessories", value:24, color:C.accent },
    { name:"Components",  value:21, color:C.gold },
    { name:"Peripherals", value:17, color:C.blue },
  ];

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
            Here's your business snapshot for <strong style={{ color:"#fff" }}>Manodtechnologies</strong>
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
        <StatCard label="Total Sales"       value={328450} icon={ShoppingCartIcon} iconBg="#dcfce7" iconColor={C.brandMid} change="+18.4%" changeUp />
        <StatCard label="Net Profit"        value={124800} icon={ChartBarIcon}     iconBg="#eff6ff" iconColor={C.blue}    change="+12.1%" changeUp />
        <StatCard label="Invoice Due"       value={47300}  icon={ReceiptIcon}      iconBg="#fffbeb" iconColor={C.gold}    change="+3.2%"  changeUp={false} />
        <StatCard label="Total Sell Return" value={9200}   icon={PackageIcon}      iconBg="#fef2f2" iconColor={C.red}     change="-8.5%"  changeUp />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        <StatCard label="Total Purchase" value={203650} icon={PackageIcon}      iconBg="#eef2ff" iconColor={C.purple} change="+9.7%" changeUp />
        <StatCard label="Purchase Due"   value={31500}  icon={BellIcon}         iconBg="#fff7ed" iconColor="#f97316" change="-2.1%" changeUp />
        <StatCard label="Total Orders"   value={1284}   icon={ShoppingCartIcon} iconBg="#f0fdf4" iconColor={C.accent} change="+24%" changeUp isCount />
        <StatCard label="Total Expense"  value={28900}  icon={ReceiptIcon}      iconBg="#faf5ff" iconColor={C.purple} change="+6.3%" changeUp={false} />
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <Card>
          <CardHeader title="📈 Sales vs Purchase — Last 30 Days" subtitle="Manodtechnologies (BL0001)"
            action={<span style={{ fontSize:12, color:C.muted, background:"#f0fdf4", padding:"4px 12px", borderRadius:20, fontWeight:600 }}>May – Jun 2026</span>} />
          <div style={{ padding:"16px 22px 20px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={salesData} margin={{ top:5, right:10, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.brandMid} stopOpacity={0.25}/><stop offset="95%" stopColor={C.brandMid} stopOpacity={0}/></linearGradient>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.2}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2ef" />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:C.muted }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11, fill:C.muted }} tickLine={false} axisLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="sales"     name="Sales"     stroke={C.brandMid} strokeWidth={2.5} fill="url(#gS)" dot={false} />
                <Area type="monotone" dataKey="purchases" name="Purchases" stroke={C.blue}     strokeWidth={2}   fill="url(#gP)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:24, marginTop:12 }}>
              {[{ label:"Total Sales", val:"₹3,28,450", dot:C.brandMid },{ label:"Total Purchase", val:"₹2,03,650", dot:C.blue },{ label:"Net Profit", val:"₹1,24,800", dot:C.accent }].map(m => (
                <div key={m.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:m.dot }} />
                  <div><div style={{ fontSize:11, color:C.muted }}>{m.label}</div><div style={{ fontWeight:800, fontSize:14, color:C.text }}>{m.val}</div></div>
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
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v=>`${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
              {categoryData.map((c, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:c.color }} />
                    <span style={{ fontSize:12, color:C.muted }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{c.value}%</span>
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
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2ef" vertical={false} />
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
                {alerts.map((a, i) => {
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
              {[{ label:"Low Stock", val:"12", color:C.gold },{ label:"Out of Stock", val:"3", color:C.red },{ label:"Total Products", val:"486", color:C.brandMid }].map((m, i) => (
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
/**
 * TopHeader.jsx — Manod ERP
 * Updated: added ThemeSwitcher button and Admin User profile click. All original features kept intact.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../pages/ThemeContext";       // ← NEW
import ThemeSwitcher from "./ThemeSwitcher";            // ← NEW

/* ─── outside click hook ─────────────────────────────────────────────────── */
function useOutsideClick(ref, cb) {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, cb]);
}

/* ─── INR formatter ─────────────────────────────────────────────────────── */
const INR = (n) =>
  "₹ " + Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ══════════════════════════════════════════════════════════════════════════
   CALCULATOR
══════════════════════════════════════════════════════════════════════════ */
function Calculator() {
  const [display, setDisplay] = useState("0");
  const [pending, setPending] = useState(null);
  const [op,      setOp]      = useState(null);
  const [fresh,   setFresh]   = useState(false);

  const evaluate = (a, b, o) => {
    switch (o) {
      case "+": return Math.round((a + b) * 1e10) / 1e10;
      case "−": return Math.round((a - b) * 1e10) / 1e10;
      case "×": return Math.round((a * b) * 1e10) / 1e10;
      case "÷": return b === 0 ? null : Math.round((a / b) * 1e10) / 1e10;
      default:  return b;
    }
  };

  const digit = (d) => {
    if (fresh) { setDisplay(d === "." ? "0." : String(d)); setFresh(false); return; }
    setDisplay((prev) => {
      if (d === "." && prev.includes(".")) return prev;
      if (prev === "0" && d !== ".") return String(d);
      return prev + d;
    });
  };

  const operator = (nextOp) => {
    const cur = parseFloat(display);
    if (pending !== null && !fresh) {
      const result = evaluate(pending, cur, op);
      if (result === null) { setDisplay("Error"); reset(); return; }
      setDisplay(String(result)); setPending(result);
    } else { setPending(cur); }
    setOp(nextOp); setFresh(true);
  };

  const equals = () => {
    if (pending === null || op === null) return;
    const result = evaluate(pending, parseFloat(display), op);
    setDisplay(result === null ? "Div/0 Error" : String(result));
    setPending(null); setOp(null); setFresh(true);
  };

  const reset   = () => { setDisplay("0"); setPending(null); setOp(null); setFresh(false); };
  const negate  = () => setDisplay((d) => d === "0" ? "0" : String(parseFloat(d) * -1));
  const percent = () => setDisplay((d) => String(parseFloat(d) / 100));
  const back    = () => {
    if (fresh) { reset(); return; }
    setDisplay((d) => d.length > 1 && d !== "Div/0 Error" ? d.slice(0, -1) : "0");
  };

  const B = ({ label, fn, bg = "#3a3a3c", fg = "#fff" }) => (
    <button onClick={fn}
      style={{ background: bg, color: fg, border: "none", borderRadius: "10px", fontSize: "17px", fontWeight: 600, cursor: "pointer", padding: "15px 0", fontFamily: "inherit", transition: "filter 0.08s" }}
      onMouseDown={(e) => (e.currentTarget.style.filter = "brightness(1.5)")}
      onMouseUp={(e)   => (e.currentTarget.style.filter = "brightness(1)")}
      onMouseLeave={(e)=> (e.currentTarget.style.filter = "brightness(1)")}
    >{label}</button>
  );

  const GRN = "#166534";

  return (
    <div style={{ position: "absolute", top: "54px", right: 0, background: "#1c1c1e", borderRadius: "16px", padding: "16px", width: "276px", boxShadow: "0 24px 64px rgba(0,0,0,0.65)", zIndex: 2000 }}>
      <div style={{ textAlign: "right", padding: "4px 10px 14px", userSelect: "none" }}>
        <div style={{ fontSize: "12px", color: "#636366", minHeight: "16px" }}>
          {pending !== null ? `${pending} ${op ?? ""}` : ""}
        </div>
        <div style={{ fontSize: display.length > 10 ? "24px" : "38px", fontWeight: 300, color: "#fff", wordBreak: "break-all", lineHeight: 1.1, minHeight: "46px", transition: "font-size 0.1s" }}>
          {display}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
        <B label="AC"  fn={reset}               bg="#505050" />
        <B label="+/−" fn={negate}              bg="#505050" />
        <B label="%"   fn={percent}             bg="#505050" />
        <B label="÷"   fn={() => operator("÷")} bg={GRN} />
        <B label="7"   fn={() => digit("7")} />
        <B label="8"   fn={() => digit("8")} />
        <B label="9"   fn={() => digit("9")} />
        <B label="×"   fn={() => operator("×")} bg={GRN} />
        <B label="4"   fn={() => digit("4")} />
        <B label="5"   fn={() => digit("5")} />
        <B label="6"   fn={() => digit("6")} />
        <B label="−"   fn={() => operator("−")} bg={GRN} />
        <B label="1"   fn={() => digit("1")} />
        <B label="2"   fn={() => digit("2")} />
        <B label="3"   fn={() => digit("3")} />
        <B label="+"   fn={() => operator("+")} bg={GRN} />
        <B label="⌫"   fn={back}                bg="#505050" />
        <B label="0"   fn={() => digit("0")} />
        <B label="."   fn={() => digit(".")} />
        <B label="="   fn={equals}              bg="#16a34a" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TODAY'S PROFIT MODAL
══════════════════════════════════════════════════════════════════════════ */
const COST_ROWS = [
  { label: "Opening Stock",                    sub: "(By purchase price)", key: "openStockPurchase" },
  { label: "Opening Stock",                    sub: "(By sale price)",     key: "openStockSale" },
  { label: "Total purchase:",                  sub: "(Exc. tax, Discount)",key: "totalPurchase",       accent: "orange" },
  { label: "Total Stock Adjustment:",                                       key: "stockAdj" },
  { label: "Total Expense:",                                                key: "expense" },
  { label: "Total purchase shipping charge:",                               key: "purchaseShipping" },
  { label: "Purchase additional expenses:",                                 key: "purchaseAdditional" },
  { label: "Total transfer shipping charge:",                               key: "transferShipping" },
  { label: "Total Sell discount:",                                          key: "sellDiscount" },
  { label: "Total customer reward:",                                        key: "customerReward" },
  { label: "Total Sell Return:",                                            key: "sellReturn" },
  { label: "Total Payroll:",                                                key: "payroll" },
  { label: "Total Production Cost:",                                        key: "productionCost" },
];

const REVENUE_ROWS = [
  { label: "Closing stock",                    sub: "(By purchase price)", key: "closeStockPurchase" },
  { label: "Closing stock",                    sub: "(By sale price)",     key: "closeStockSale" },
  { label: "Total Sales:",                     sub: "(Exc. tax, Discount)",key: "totalSales",          accent: "green" },
  { label: "Total sell shipping charge:",                                   key: "sellShipping" },
  { label: "Sell additional expenses:",                                     key: "sellAdditional" },
  { label: "Total Stock Recovered:",                                        key: "stockRecovered" },
  { label: "Total Purchase Return:",                                        key: "purchaseReturn" },
  { label: "Total Purchase discount:",                                      key: "purchaseDiscount" },
  { label: "Total sell round off:",                                         key: "sellRoundOff" },
  { label: "Total sell return discount:",                                   key: "sellReturnDiscount" },
];

async function fetchProfitData(filter) {
  await new Promise((r) => setTimeout(r, 500));
  const base = {
    openStockPurchase: 0, openStockSale: 0, totalPurchase: 203650,
    stockAdj: 1200, expense: 28900, purchaseShipping: 1800,
    purchaseAdditional: 500, transferShipping: 0, sellDiscount: 3200,
    customerReward: 0, sellReturn: 9200, payroll: 45000, productionCost: 12000,
    closeStockPurchase: 0, closeStockSale: 0, totalSales: 328450,
    sellShipping: 4500, sellAdditional: 0, stockRecovered: 0,
    purchaseReturn: 0, purchaseDiscount: 1500, sellRoundOff: 0, sellReturnDiscount: 0,
  };
  const m = { today: 1, week: 7, month: 30, year: 365 }[filter] ?? 1;
  const out = {};
  Object.entries(base).forEach(([k, v]) => (out[k] = +(v * m).toFixed(2)));
  return out;
}

function DataColumn({ title, titleColor, titleBg, borderColor, rows, data, totalLabel, total, totalColor }) {
  return (
    <div style={{ border: `1px solid ${borderColor}`, borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ background: titleBg, padding: "11px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${borderColor}` }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: titleColor, display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: "11.5px", color: titleColor, letterSpacing: "0.06em" }}>{title}</span>
      </div>
      {rows.map((r, i) => {
        const isO = r.accent === "orange", isG = r.accent === "green";
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 16px", background: isO ? "#fff7ed" : isG ? "#f0fdf4" : i % 2 === 0 ? "#fff" : "#fafafa", borderLeft: `3px solid ${isO ? "#f97316" : isG ? "#16a34a" : "transparent"}` }}>
            <div style={{ flex: 1, marginRight: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: r.accent ? 700 : 500, color: "#111827" }}>{r.label}</div>
              {r.sub && <div style={{ fontSize: "11px", color: "#6b7280" }}>{r.sub}</div>}
            </div>
            <div style={{ fontSize: "13px", fontWeight: r.accent ? 700 : 500, color: isO ? "#ea580c" : isG ? "#15803d" : "#374151", whiteSpace: "nowrap" }}>
              {INR(data[r.key])}
            </div>
          </div>
        );
      })}
      <div style={{ borderTop: `1px solid ${borderColor}`, padding: "11px 16px", background: titleBg, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: "13px", color: totalColor }}>{totalLabel}</span>
        <span style={{ fontWeight: 700, fontSize: "13px", color: totalColor }}>{INR(total)}</span>
      </div>
    </div>
  );
}

function ProfitModal({ onClose }) {
  const [filter,  setFilter]  = useState("today");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    fetchProfitData(filter).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [filter]);

  const totalCost = data ? COST_ROWS.reduce((s, r) => s + (data[r.key] ?? 0), 0) : 0;
  const totalRev  = data ? REVENUE_ROWS.reduce((s, r) => s + (data[r.key] ?? 0), 0) : 0;
  const net       = totalRev - totalCost;
  const isProfit  = net >= 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 3000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "68px" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "min(1060px,96vw)", maxHeight: "calc(100vh - 88px)", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.35)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: "linear-gradient(135deg,#052e16,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>Today's Profit</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Costs & Deductions vs Revenue & Income</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {[["today","Today"],["week","This Week"],["month","This Month"],["year","This Year"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${filter === k ? "#16a34a" : "#e5e7eb"}`, background: filter === k ? "#16a34a" : "#fff", color: filter === k ? "#fff" : "#374151", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>{l}</button>
            ))}
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "20px", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>
        {data && !loading && (
          <div style={{ padding: "10px 22px", background: isProfit ? "#f0fdf4" : "#fef2f2", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: "15px", color: isProfit ? "#15803d" : "#dc2626" }}>
              {isProfit ? "📈" : "📉"} Net Profit: {INR(net)}
            </span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Revenue: <strong>{INR(totalRev)}</strong> &nbsp;|&nbsp; Costs: <strong>{INR(totalCost)}</strong>
            </span>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "220px", gap: "14px" }}>
              <div style={{ width: 38, height: 38, border: "3px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "hSpin 0.8s linear infinite" }} />
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Loading profit data…</span>
            </div>
          )}
          {error && <div style={{ padding: "24px", textAlign: "center", color: "#dc2626" }}>⚠ {error}</div>}
          {!loading && !error && data && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <DataColumn title="COSTS AND DEDUCTIONS" titleColor="#dc2626" titleBg="#fef2f2" borderColor="#fecaca" rows={COST_ROWS}    data={data} totalLabel="Total Costs"   total={totalCost} totalColor="#dc2626" />
              <DataColumn title="REVENUE AND INCOME"   titleColor="#15803d" titleBg="#f0fdf4" borderColor="#bbf7d0" rows={REVENUE_ROWS} data={data} totalLabel="Total Revenue" total={totalRev}  totalColor="#15803d" />
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes hSpin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   QUICK CREATE MENU
══════════════════════════════════════════════════════════════════════════ */
function QuickCreateMenu({ onClose }) {
  const navigate = useNavigate();
  const items = [
    { icon: "🛒", label: "New Sale",       path: "/sells/create" },
    { icon: "📦", label: "New Purchase",   path: "/purchases/create" },
    { icon: "👤", label: "New Contact",    path: "/contacts" },
    { icon: "📋", label: "New Product",    path: "/products/create" },
    { icon: "💸", label: "New Expense",    path: "/expenses/create" },
    { icon: "📄", label: "New Quotation",  path: "/sells/add-quotation" },
    { icon: "↩️", label: "Sell Return",    path: "/sell-return" },
    { icon: "🔄", label: "Stock Transfer", path: "/stock-transfers/create" },
  ];
  return (
    <div style={{ position: "absolute", top: "54px", right: 0, background: "#fff", borderRadius: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", width: "218px", zIndex: 2000, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "linear-gradient(135deg,#052e16,#14532d)", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "0.08em" }}>QUICK CREATE</div>
      {items.map((item) => (
        <button key={item.path} onClick={() => { navigate(item.path); onClose(); }}
          style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 14px", background: "none", border: "none", fontSize: "13px", fontWeight: 500, color: "#111827", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
          <span style={{ fontSize: "16px" }}>{item.icon}</span>{item.label}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════════════════════════════ */
const INIT_NOTIFS = [
  { id: 1, icon: "🛒", title: "New Sale #INV-1042",        sub: "₹ 12,500 — Walk-in Customer",  time: "2 min ago",  unread: true  },
  { id: 2, icon: "⚠️", title: "Low Stock Alert",            sub: "Wireless Mouse — Qty: 3 left", time: "18 min ago", unread: true  },
  { id: 3, icon: "💳", title: "Payment Received",           sub: "₹ 45,000 — Ravi Enterprises",  time: "1 hr ago",   unread: true  },
  { id: 4, icon: "📦", title: "Purchase #PO-0091 Pending",  sub: "Supplier: Techmart Pvt Ltd",   time: "3 hr ago",   unread: false },
  { id: 5, icon: "↩️", title: "Sell Return #SR-012",        sub: "₹ 2,300 — Refund processed",  time: "Yesterday",  unread: false },
];

function NotificationsPanel({ onClose }) {
  const [notifs, setNotifs] = useState(INIT_NOTIFS);
  const unread   = notifs.filter((n) => n.unread).length;
  const markOne  = (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, unread: false } : n));
  const markAll  = ()   => setNotifs((p) => p.map((n) => ({ ...n, unread: false })));
  return (
    <div style={{ position: "absolute", top: "54px", right: 0, background: "#fff", borderRadius: "14px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", width: "320px", zIndex: 2000, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>Notifications</span>
          {unread > 0 && <span style={{ background: "#dc2626", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" }}>{unread}</span>}
        </div>
        {unread > 0 && <button onClick={markAll} style={{ fontSize: "12px", color: "#15803d", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>}
      </div>
      <div style={{ maxHeight: "340px", overflowY: "auto" }}>
        {notifs.map((n) => (
          <div key={n.id} onClick={() => markOne(n.id)}
            style={{ display: "flex", gap: "11px", padding: "11px 16px", background: n.unread ? "#f0fdf4" : "#fff", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = n.unread ? "#f0fdf4" : "#fff")}>
            <span style={{ fontSize: "20px", flexShrink: 0 }}>{n.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: n.unread ? 700 : 500, color: "#111827" }}>{n.title}</span>
                {n.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", flexShrink: 0, marginTop: "5px" }} />}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{n.sub}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
        <button onClick={onClose} style={{ fontSize: "12px", color: "#15803d", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all notifications →</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ACCOUNT DROPDOWN
══════════════════════════════════════════════════════════════════════════ */
function AccountDropdown({ onClose, onSignOut }) {
  const navigate = useNavigate();
  const go = (path) => { navigate(path); onClose(); };
  const user    = JSON.parse(localStorage.getItem("manod_user") || "{}");
  const name    = user.name    || "Dharshiha C";
  const role    = user.role    || "Administrator";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ position: "absolute", top: "54px", right: 0, background: "#fff", borderRadius: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", minWidth: "224px", zIndex: 2000, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", background: "linear-gradient(135deg,#052e16,#14532d)", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px" }}>{initial}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>{name}</div>
            <div style={{ fontSize: "11px", opacity: 0.75 }}>{role}</div>
          </div>
        </div>
      </div>
      <MenuRow icon="👤" label="My Profile"       onClick={() => go("/profile")} />
      <MenuRow icon="⚙️" label="Settings"         onClick={() => go("/settings")} />
      <MenuRow icon="🔑" label="Change Password"  onClick={() => go("/change-password")} />
      <div style={{ height: "1px", background: "#f0f0f0" }} />
      <button onClick={onSignOut}
        style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 16px", background: "none", border: "none", fontSize: "13px", fontWeight: 700, color: "#dc2626", cursor: "pointer" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </div>
  );
}

function MenuRow({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 16px", background: "none", border: "none", fontSize: "13px", fontWeight: 500, color: "#111827", cursor: "pointer" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
      <span style={{ fontSize: "15px" }}>{icon}</span>{label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ICON BUTTON
══════════════════════════════════════════════════════════════════════════ */
function IBtn({ children, onClick, active, title, badge = 0 }) {
  const [h, setH] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button title={title} onClick={onClick}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ background: active || h ? "rgba(255,255,255,0.2)" : "transparent", border: "none", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.15s", flexShrink: 0 }}>
        {children}
      </button>
      {badge > 0 && <span style={{ position: "absolute", top: "4px", right: "4px", width: "7px", height: "7px", borderRadius: "50%", background: "#f87171", border: "2px solid #166534", pointerEvents: "none" }} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TOP HEADER  (main export)
══════════════════════════════════════════════════════════════════════════ */
export default function TopHeader({ businessName = "Manodtechnologies" }) {
  const navigate    = useNavigate();
  const { theme }   = useTheme();      // ← live theme colours

  const [profitOpen,  setProfitOpen]  = useState(false);
  const [calcOpen,    setCalcOpen]    = useState(false);
  const [quickOpen,   setQuickOpen]   = useState(false);
  const [notiOpen,    setNotiOpen]    = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const calcRef    = useRef(null);
  const quickRef   = useRef(null);
  const notiRef    = useRef(null);
  const accountRef = useRef(null);

  const closeAll = useCallback(() => {
    setCalcOpen(false); setQuickOpen(false); setNotiOpen(false); setAccountOpen(false);
  }, []);

  useOutsideClick(calcRef,    () => setCalcOpen(false));
  useOutsideClick(quickRef,   () => setQuickOpen(false));
  useOutsideClick(notiRef,    () => setNotiOpen(false));
  useOutsideClick(accountRef, () => setAccountOpen(false));

  const only = (setter) => () => { closeAll(); setter((p) => !p); };

  const signOut = () => {
    localStorage.removeItem("manod_token");
    localStorage.removeItem("manod_user");
    navigate("/login");
  };

  const today   = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const user    = JSON.parse(localStorage.getItem("manod_user") || "{}");
  const name    = user.name || "Dharshiha C";
  const initial = name.charAt(0).toUpperCase();

  /* shared button style for "Today's Profit" and "POS" */
  const tbBtn = {
    display: "flex", alignItems: "center", gap: "6px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: "8px", padding: "5px 13px",
    color: "#fff", fontSize: "12.5px", fontWeight: 700,
    cursor: "pointer", whiteSpace: "nowrap",
  };

  return (
    <>
      <style>{`
        #erp-main-content, .erp-content-area { padding-top: 68px !important; }
        #erp-main-content { overflow-y: auto; height: 100vh; }
        @keyframes hSpin { to { transform:rotate(360deg); } }
      `}</style>

      <div style={{
        position: "fixed", top: 0, left: "260px", right: 0,
        height: "60px", zIndex: 500,
        background: "var(--manod-topbar)",   /* ← themed gradient via CSS var */
        display: "flex", alignItems: "center",
        padding: "0 20px", gap: "6px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        transition: "background 0.3s ease",
      }}>

        {/* Business name + online dot */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {businessName}
          </span>
          <span title="Online" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 7px #4ade80", flexShrink: 0 }} />
        </div>

        {/* Today's Profit */}
        <button onClick={() => { closeAll(); setProfitOpen(true); }} style={tbBtn}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.26)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Today's Profit
        </button>

        {/* POS */}
        <button onClick={() => navigate("/pos")} style={{ ...tbBtn, border: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.26)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          POS
        </button>

        {/* ── 🎨 Theme Switcher ── inserted right after POS */}
        <ThemeSwitcher />

        {/* Quick Create */}
        <div ref={quickRef} style={{ position: "relative" }}>
          <IBtn title="Quick Create" active={quickOpen} onClick={only(setQuickOpen)}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </IBtn>
          {quickOpen && <QuickCreateMenu onClose={() => setQuickOpen(false)} />}
        </div>

        {/* Calculator */}
        <div ref={calcRef} style={{ position: "relative" }}>
          <IBtn title="Calculator" active={calcOpen} onClick={only(setCalcOpen)}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <circle cx="8"  cy="10" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="10" r="1.2" fill="currentColor"/>
              <circle cx="16" cy="10" r="1.2" fill="currentColor"/>
              <circle cx="8"  cy="14" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="14" r="1.2" fill="currentColor"/>
              <circle cx="16" cy="14" r="1.2" fill="currentColor"/>
              <circle cx="8"  cy="18" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="18" r="1.2" fill="currentColor"/>
              <circle cx="16" cy="18" r="1.2" fill="currentColor"/>
            </svg>
          </IBtn>
          {calcOpen && <Calculator />}
        </div>

        {/* Date badge */}
        <div style={{ padding: "4px 12px", background: "rgba(255,255,255,0.12)", borderRadius: "8px", color: "#fff", fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
          {today}
        </div>

        {/* Notifications */}
        <div ref={notiRef} style={{ position: "relative" }}>
          <IBtn title="Notifications" badge={INIT_NOTIFS.filter((n) => n.unread).length} active={notiOpen} onClick={only(setNotiOpen)}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </IBtn>
          {notiOpen && <NotificationsPanel onClose={() => setNotiOpen(false)} />}
        </div>

        {/* Account */}
        <div ref={accountRef} style={{ position: "relative" }}>
          <button onClick={only(setAccountOpen)}
            style={{ display: "flex", alignItems: "center", gap: "7px", background: accountOpen ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)", border: "none", borderRadius: "8px", padding: "4px 10px 4px 5px", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            onMouseLeave={(e) => { if (!accountOpen) e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.24)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px", color: "#fff" }}>{initial}</div>
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>{name}</span>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points={accountOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
            </svg>
          </button>
          {accountOpen && <AccountDropdown onClose={() => setAccountOpen(false)} onSignOut={signOut} />}
        </div>

        {/* Quick sign-out */}
        <IBtn title="Sign Out" onClick={signOut}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </IBtn>

      </div>

      {profitOpen && <ProfitModal onClose={() => setProfitOpen(false)} />}
    </>
  );
}
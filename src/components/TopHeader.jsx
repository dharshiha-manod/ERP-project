/**
 * TopHeader.jsx — Manod ERP
 * Updated: added ThemeSwitcher button and Admin User profile click. All original features kept intact.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../pages/ThemeContext";       // ← NEW
import ThemeSwitcher from "./ThemeSwitcher";            // ← NEW
import IndustrySwitcher from "./IndustrySwitcher";      // ← NEW: switch active industry workspace
import { useBusiness } from "../context/BusinessContext"; // ← NEW
import { usePermissions } from "../context/PermissionsContext"; // ← NEW

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
const BASES_LOCAL = ["http://localhost:5000/api","http://localhost:3000/api","http://127.0.0.1:5000/api"];
async function apiFetchLocal(path) {
  const token = localStorage.getItem("manod_token");
  const industryId = localStorage.getItem("manod_active_industry_id");
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(industryId ? { "X-Industry-Id": industryId } : {}),
  };
  for (const base of BASES_LOCAL) {
    try {
      const r = await fetch(`${base}${path}`, { headers });
      if (r.ok) return await r.json();
    } catch (e) {}
  }
}

function getRangeFor(filter) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (filter === "week") {
    const day = now.getDay();
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  } else if (filter === "month") {
    start.setDate(1);
  } else if (filter === "year") {
    start.setMonth(0, 1);
  }
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { from: fmt(start), to: fmt(end) };
}

async function fetchProfitData(filter) {
  const { from, to } = getRangeFor(filter);
  const res = await apiFetchLocal(`/reports/net-profit?date_from=${from}&date_to=${to}`);
  const summary = res?.data?.summary || {};
  return {
    totalSales:  Number(summary.total_revenue || 0),
    totalCosts:  Number(summary.total_expenses || 0),
    netProfit:   Number(summary.net_profit || 0),
  };
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

  const totalCost = data?.totalCosts ?? 0;
  const totalRev  = data?.totalSales ?? 0;
  const net       = data?.netProfit ?? 0;
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
              <div style={{ border: "1px solid #fecaca", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ background: "#fef2f2", padding: "11px 16px", fontWeight: 700, fontSize: "11.5px", color: "#dc2626", letterSpacing: "0.06em" }}>COSTS (PURCHASES + EXPENSES)</div>
                <div style={{ padding: "11px 16px", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>Total Costs</span><span style={{ color: "#dc2626" }}>{INR(totalCost)}</span>
                </div>
              </div>
              <div style={{ border: "1px solid #bbf7d0", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ background: "#f0fdf4", padding: "11px 16px", fontWeight: 700, fontSize: "11.5px", color: "#15803d", letterSpacing: "0.06em" }}>REVENUE (SALES)</div>
                <div style={{ padding: "11px 16px", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>Total Sales</span><span style={{ color: "#15803d" }}>{INR(totalRev)}</span>
                </div>
              </div>
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
const READ_KEY = "manod_read_notifs";
const getReadIds = () => {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch { return []; }
};
const saveReadIds = (ids) => localStorage.setItem(READ_KEY, JSON.stringify(ids));

function NotificationsPanel({ onClose }) {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    apiFetchLocal(`/reports/stock?limit=1000`).then((res) => {
      const rows = res?.data || [];
      const lowStock = rows.filter(r => r.status === "Low Stock" || r.status === "Out of Stock");
      const readIds = getReadIds();
      const built = lowStock.slice(0, 10).map((r, i) => {
        const stableId = `${r.product}-${r.status}`;
        return {
          id: stableId,
          icon: r.status === "Out of Stock" ? "🔴" : "⚠️",
          title: r.status === "Out of Stock" ? "Out of Stock" : "Low Stock Alert",
          sub: `${r.product} — Qty: ${r.qty} left`,
          time: "",
          unread: !readIds.includes(stableId),
        };
      });
      setNotifs(built);
      setLoadingNotifs(false);
    }).catch(() => setLoadingNotifs(false));
  }, []);
  const unread   = notifs.filter((n) => n.unread).length;
  const markOne  = (id) => {
    setNotifs((p) => p.map((n) => n.id === id ? { ...n, unread: false } : n));
    const ids = getReadIds();
    if (!ids.includes(id)) saveReadIds([...ids, id]);
  };
  const markAll  = () => {
    setNotifs((p) => p.map((n) => ({ ...n, unread: false })));
    saveReadIds(notifs.map((n) => n.id));
  };
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
        {loadingNotifs && <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>Loading…</div>}
        {!loadingNotifs && notifs.length === 0 && <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No alerts right now</div>}
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
<button onClick={() => { onClose(); navigate("/notifications/alerts"); }} style={{ fontSize: "12px", color: "#15803d", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all notifications →</button>
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
export default function TopHeader() {
  const navigate    = useNavigate();
  const { theme }   = useTheme();      // ← live theme colours
  const { business } = useBusiness();  // ← live business settings
  const { clearPermissions } = usePermissions(); // ← needed so signOut can actually clear it

  const businessName = business?.business_name || "Manodtechnologies";
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
    clearPermissions();
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
          {business?.logo_url && (
            <img
              src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${business.logo_url}`}
              alt="Logo"
              style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
            />
          )}
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {businessName}
          </span>
      <span title="Online" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 7px #4ade80", flexShrink: 0 }} />
        </div>

        {/* Industry workspace switcher */}
        <IndustrySwitcher />

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
<IBtn title="Notifications" badge={notiOpen ? 0 : 1} active={notiOpen} onClick={only(setNotiOpen)}>
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
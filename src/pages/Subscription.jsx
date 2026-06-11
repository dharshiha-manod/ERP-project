import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── MODE SWITCH ────────────────────────────────────────────────────────────────
// Set to true once your backend (Node/Express + Razorpay) is running.
// While false, subscriptions are stored in localStorage — fully working demo,
// no network calls, no errors.
const USE_BACKEND = false;

// ─── API base (used only when USE_BACKEND = true) ─────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("manod_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// ─── Subscription state ────────────────────────────────────────────────────────
let _cachedSub = null;

const LOCAL_KEY = "manod_subscription";

function readLocalSub() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeLocalSub(plan) {
  const now = new Date();
  let expiresAt;
  if (plan === "trial")   expiresAt = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  if (plan === "starter") expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (plan === "pro")     expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sub = { plan, startedAt: now.toISOString(), expiresAt: expiresAt.toISOString() };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(sub));
  return sub;
}

export async function fetchSubscription() {
  if (!USE_BACKEND) {
    _cachedSub = readLocalSub();
    return _cachedSub;
  }
  try {
    const res = await fetch(`${API}/subscription`, { headers: authHeaders() });
    if (!res.ok) { _cachedSub = null; return null; }
    const data = await res.json();
    _cachedSub = data; // null if no active subscription
    return data;
  } catch {
    _cachedSub = null;
    return null;
  }
}

export function getSubscription() {
  if (!USE_BACKEND) return readLocalSub();
  return _cachedSub;
}

export function isSubscriptionActive() {
  const sub = USE_BACKEND ? _cachedSub : readLocalSub();
  if (!sub) return false;
  return new Date(sub.expires_at || sub.expiresAt) > new Date();
}

// ─── Plans config ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    price: "₹0",
    period: "1 day only",
    badge: null,
    color: "#607d63",
    accent: false,
    features: [
      "Full access for 1 day",
      "Dashboard, POS, Products, Sell",
      "Contacts",
      "1 User",
      "Community support",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹2,999",
    period: "per month",
    badge: "Popular",
    color: "#2e7d32",
    accent: true,
    features: [
      "30 days full access",
      "Everything in Trial",
      "All Reports & Analytics",
      "Purchases & Manufacturing",
      "Stock Transfers & Adjustments",
      "Expenses",
      "Up to 5 Users",
      "Email support",
    ],
    cta: "Choose Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹7,999",
    period: "per month",
    badge: "Best Value",
    color: "#1565c0",
    accent: false,
    features: [
      "30 days full access",
      "Everything in Starter",
      "Unlimited Users",
      "HRM & CRM modules",
      "Production Planning",
      "User Management & Settings",
      "Priority support",
      "API Access",
    ],
    cta: "Choose Pro",
  },
];

// ─── Razorpay loader (used only when USE_BACKEND = true) ──────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Main Subscription Page ───────────────────────────────────────────────────
export default function Subscription({ onActivate }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [activatedPlan, setActivatedPlan] = useState(null);
  const [activatedExpiry, setActivatedExpiry] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    fetchSubscription().then((sub) => {
      if (sub && new Date(sub.expires_at || sub.expiresAt) > new Date()) {
        setCurrentPlan(sub.plan);
      }
    });
  }, []);

  const goToDashboard = () => {
    setTimeout(() => { if (onActivate) onActivate(); else navigate("/"); }, 1800);
  };

  const handleSelect = async (planId) => {
    setError("");
    setSelected(planId);

    // ── DEMO MODE: instant local activation, no network ──
    if (!USE_BACKEND) {
      setPaying(true);
      await new Promise((r) => setTimeout(r, planId === "trial" ? 700 : 1400));
      const sub = writeLocalSub(planId);
      _cachedSub = sub;
      setActivatedPlan(planId);
      setActivatedExpiry(sub.expiresAt);
      setPaying(false);
      setDone(true);
      goToDashboard();
      return;
    }

    // ── FREE TRIAL: simple backend call, no payment ──
    if (planId === "trial") {
      setPaying(true);
      try {
        const res = await fetch(`${API}/subscription/trial`, {
          method: "POST",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not start trial");

        await fetchSubscription();
        setActivatedPlan("trial");
        setActivatedExpiry(data.expiresAt);
        setPaying(false);
        setDone(true);
        goToDashboard();
      } catch (err) {
        setPaying(false);
        setError(err.message || "Something went wrong. Please try again.");
      }
      return;
    }

    // ── PAID PLANS: Razorpay checkout ──
    setPaying(true);
    try {
      const orderRes = await fetch(`${API}/subscription/create-order`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ plan: planId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Could not create order");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway. Check your connection.");

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Manod ERP",
        description: `${planId === "starter" ? "Starter" : "Pro"} Plan — Monthly Subscription`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API}/subscription/verify`, {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

            await fetchSubscription();
            setActivatedPlan(planId);
            setActivatedExpiry(verifyData.expiresAt);
            setPaying(false);
            setDone(true);
            goToDashboard();
          } catch (err) {
            setPaying(false);
            setError(err.message || "Payment verification failed. Contact support if money was deducted.");
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            setError("Payment cancelled.");
          },
        },
        prefill: {},
        theme: { color: "#2e7d32" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setPaying(false);
        setError(resp.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  // ── Success screen ──
  if (done) {
    const planName = PLANS.find((p) => p.id === activatedPlan)?.name || "Plan";
    const expiresAt = activatedExpiry
      ? new Date(activatedExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "";
    return (
      <div style={S.fullPage}>
        <div style={S.centerCard}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={S.successTitle}>You're all set!</h2>
          <p style={S.successSub}><b>{planName}</b> activated. Valid until <b>{expiresAt}</b>.</p>
          <p style={{ fontSize: 13, color: "#607d63", marginTop: 6 }}>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Paying / processing screen ──
  if (paying) {
    const plan = PLANS.find((p) => p.id === selected);
    return (
      <div style={S.fullPage}>
        <div style={S.centerCard}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>💳</div>
          <h2 style={S.successTitle}>
            {plan?.id === "trial" ? "Activating Trial…" : "Opening Payment…"}
          </h2>
          <p style={S.successSub}>
            {plan?.id === "trial"
              ? "Setting up your free trial"
              : <>Setting up <b>{plan?.name}</b> — {plan?.price}/month</>}
          </p>
          <div style={S.spinner} />
        </div>
      </div>
    );
  }

  // ── Plans screen ──
  return (
    <div style={S.fullPage}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ background: "#2e7d32", color: "#fff", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#1b2e1c" }}>Manod ERP</div>
            <div style={{ fontSize: 11, color: "#607d63", textTransform: "uppercase", letterSpacing: "1px" }}>Inventory System</div>
          </div>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#1b2e1c", margin: "0 0 10px", letterSpacing: "-0.5px" }}>Choose Your Plan</h1>
        <p style={{ fontSize: 15, color: "#607d63", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
          Unlock the full power of Manod ERP. Start free or pick a plan that fits your business.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: "#fce4ec", color: "#c62828", borderRadius: 10, padding: "12px 20px", marginBottom: 24, fontSize: 13, fontWeight: 600, maxWidth: 600, textAlign: "center" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Plans grid */}
      <div style={S.grid}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
          <div key={plan.id} style={{ ...S.card, ...(plan.accent ? S.cardAccent : {}), transform: plan.accent ? "translateY(-10px)" : "none", ...(isCurrent ? { outline: `2px solid ${plan.accent ? "#fff" : plan.color}`, outlineOffset: 2 } : {}) }}>
            {plan.badge && !isCurrent && (
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", borderRadius: 20, padding: "4px 18px", fontSize: 12, fontWeight: 800, letterSpacing: "0.4px", background: plan.accent ? "#fff" : plan.color, color: plan.accent ? plan.color : "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", whiteSpace: "nowrap" }}>
                {plan.badge}
              </div>
            )}
            {isCurrent && (
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", borderRadius: 20, padding: "4px 18px", fontSize: 12, fontWeight: 800, letterSpacing: "0.4px", background: "#1b2e1c", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", whiteSpace: "nowrap" }}>
                ✓ Current Plan
              </div>
            )}

            <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10, color: plan.accent ? "#fff" : plan.color }}>{plan.name}</div>
            <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px", color: plan.accent ? "#fff" : plan.color, lineHeight: 1 }}>{plan.price}</div>
            <div style={{ fontSize: 13, marginBottom: 20, marginTop: 4, color: plan.accent ? "rgba(255,255,255,0.7)" : "#607d63" }}>{plan.period}</div>

            <div style={{ height: 1, background: "rgba(100,140,100,0.15)", marginBottom: 20 }} />

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flex: 1 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", marginBottom: 10, lineHeight: 1.4 }}>
                  <span style={{ color: plan.accent ? "#a5d6a7" : plan.color, marginRight: 8, fontWeight: 900 }}>✓</span>
                  <span style={{ color: plan.accent ? "rgba(255,255,255,0.88)" : "#1b2e1c", fontSize: 13 }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => !isCurrent && handleSelect(plan.id)}
              disabled={isCurrent}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 10, fontWeight: 800, fontSize: 14,
                cursor: isCurrent ? "default" : "pointer", letterSpacing: "0.3px",
                background: isCurrent ? (plan.accent ? "rgba(255,255,255,0.25)" : "#e8f5e9") : (plan.accent ? "#fff" : plan.color),
                color: isCurrent ? (plan.accent ? "#fff" : plan.color) : (plan.accent ? plan.color : "#fff"),
                border: isCurrent ? "none" : (plan.accent ? "none" : `2px solid ${plan.color}`),
                opacity: isCurrent ? 0.85 : 1,
              }}
            >
              {isCurrent ? "✓ Active" : (plan.id === "trial" ? "🚀 " : plan.id === "pro" ? "⚡ " : "✅ ") + plan.cta}
            </button>

            {plan.id === "trial" && !isCurrent && (
              <div style={{ textAlign: "center", fontSize: 11, marginTop: 10, color: "#90a4ae" }}>No credit card required</div>
            )}
            {plan.id !== "trial" && !isCurrent && (
              <div style={{ textAlign: "center", fontSize: 11, marginTop: 10, color: plan.accent ? "rgba(255,255,255,0.6)" : "#90a4ae" }}>
                {USE_BACKEND ? "Secure payment via Razorpay" : "Demo mode — instant activation"}
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, fontSize: 13, color: "#90a4ae" }}>
        🔒 Secure &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; All prices include GST
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  fullPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f5e9 0%, #f0f4f1 50%, #e3f2fd 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px 60px",
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    maxWidth: 960,
    width: "100%",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "32px 28px",
    boxShadow: "0 4px 24px rgba(46,125,50,0.10)",
    border: "1.5px solid #d4e6d5",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  cardAccent: {
    background: "linear-gradient(160deg, #2e7d32, #43a047)",
    border: "none",
    boxShadow: "0 8px 40px rgba(46,125,50,0.35)",
  },
  centerCard: {
    background: "#fff",
    borderRadius: 20,
    padding: "60px 48px",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(46,125,50,0.15)",
    maxWidth: 400,
    width: "100%",
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 900,
    color: "#1b2e1c",
    margin: "0 0 10px",
  },
  successSub: {
    fontSize: 14,
    color: "#607d63",
    lineHeight: 1.6,
    margin: 0,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "4px solid #e8f5e9",
    borderTop: "4px solid #2e7d32",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "24px auto 0",
  },
};
import { useState } from "react";

const stats = [
  { label: "Total Sales", value: "₹ 0.00", icon: "🛒", color: "#4ade80", bg: "#f0fdf4" },
  { label: "Net", value: "₹ 0.00", icon: "💰", color: "#60a5fa", bg: "#eff6ff" },
  { label: "Invoice Due", value: "₹ 0.00", icon: "📄", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Total Sell Return", value: "₹ 0.00", icon: "↩️", color: "#f87171", bg: "#fef2f2" },
  { label: "Total Purchase", value: "₹ 0.00", icon: "📦", color: "#818cf8", bg: "#eef2ff" },
  { label: "Purchase Due", value: "₹ 0.00", icon: "⚠️", color: "#fb923c", bg: "#fff7ed" },
  { label: "Total Purchase Return", value: "₹ 0.00", icon: "🔄", color: "#f87171", bg: "#fef2f2" },
  { label: "Expense", value: "₹ 0.00", icon: "💸", color: "#c084fc", bg: "#faf5ff" },
];

const quickLinks = [
  { label: "Add Sale", icon: "➕", path: "#" },
  { label: "Add Purchase", icon: "🛍️", path: "#" },
  { label: "Add Expense", icon: "📝", path: "#" },
  { label: "POS", icon: "🖥️", path: "#" },
  { label: "Stock Report", icon: "📊", path: "#" },
  { label: "Add Customer", icon: "👤", path: "#" },
];

const recentSales = [
  { id: "INV-001", customer: "—", amount: "₹ 0.00", status: "Paid", date: "01/06/2026" },
  { id: "INV-002", customer: "—", amount: "₹ 0.00", status: "Due", date: "01/06/2026" },
];

const topProducts = [
  { name: "No data yet", qty: 0, revenue: "₹ 0.00" },
];

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState("This Month");

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#1e2d1e" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a4731 0%, #2d6a4f 60%, #40916c 100%)",
        borderRadius: "16px",
        padding: "28px 32px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(29,77,55,0.18)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div>
          <div style={{ color: "#b7e4c7", fontSize: "14px", marginBottom: "4px", letterSpacing: "0.5px" }}>
            Monday, June 01, 2026
          </div>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 700, margin: 0 }}>
            Welcome back, Dharshiha 👋
          </h1>
          <p style={{ color: "#95d5b2", margin: "6px 0 0", fontSize: "14px" }}>
            Here's what's happening with Manodtechnologies today.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {["Today", "This Week", "This Month", "This Year"].map(f => (
            <button key={f} onClick={() => setDateFilter(f)} style={{
              padding: "7px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              background: dateFilter === f ? "#fff" : "rgba(255,255,255,0.15)",
              color: dateFilter === f ? "#1a4731" : "#fff",
              transition: "all 0.2s",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "28px",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "20px 22px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            border: "1px solid #eaf1ec",
            transition: "transform 0.15s, box-shadow 0.15s",
            cursor: "default",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)"; }}
          >
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: s.bg, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500, marginBottom: "3px" }}>{s.label}</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e2d1e" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>

        {/* Sales Chart Placeholder */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #eaf1ec" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px" }}>🛒 Sales Last 30 Days</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Manodtechnologies (BL0001)</div>
            </div>
          </div>
          {/* Mini chart bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px" }}>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{
                flex: 1,
                background: i % 5 === 0 ? "#2d6a4f" : "#d1fae5",
                borderRadius: "3px 3px 0 0",
                height: `${Math.max(8, Math.random() * 40)}px`,
                transition: "background 0.2s",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "#9ca3af" }}>
            <span>May 2</span><span>May 15</span><span>Jun 1</span>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Total Sales</div>
              <div style={{ fontWeight: 700, color: "#2d6a4f" }}>₹ 0.00</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Orders</div>
              <div style={{ fontWeight: 700, color: "#2d6a4f" }}>0</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Avg/Day</div>
              <div style={{ fontWeight: 700, color: "#2d6a4f" }}>₹ 0.00</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #eaf1ec" }}>
          <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "16px" }}>⚡ Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {quickLinks.map((q, i) => (
              <a key={i} href={q.path} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "10px",
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                textDecoration: "none", color: "#1a4731",
                fontSize: "13px", fontWeight: 600,
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#dcfce7"; e.currentTarget.style.borderColor = "#86efac"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; }}
              >
                <span style={{ fontSize: "18px" }}>{q.icon}</span>
                {q.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Recent Sales */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #eaf1ec" }}>
          <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "16px" }}>📋 Recent Sales</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0fdf4" }}>
                {["Invoice", "Customer", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: "#6b7280", fontWeight: 600, fontSize: "12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "10px 6px", color: "#2d6a4f", fontWeight: 600 }}>{s.id}</td>
                  <td style={{ padding: "10px 6px", color: "#374151" }}>{s.customer}</td>
                  <td style={{ padding: "10px 6px", fontWeight: 600 }}>{s.amount}</td>
                  <td style={{ padding: "10px 6px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: s.status === "Paid" ? "#dcfce7" : "#fef9c3",
                      color: s.status === "Paid" ? "#166534" : "#854d0e",
                    }}>{s.status}</span>
                  </td>
                  <td style={{ padding: "10px 6px", color: "#6b7280" }}>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #eaf1ec" }}>
          <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "16px" }}>🔥 Top Products</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0fdf4" }}>
                {["Product", "Qty Sold", "Revenue"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: "#6b7280", fontWeight: 600, fontSize: "12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "12px 6px", color: "#374151" }}>{p.name}</td>
                  <td style={{ padding: "12px 6px", color: "#6b7280" }}>{p.qty}</td>
                  <td style={{ padding: "12px 6px", fontWeight: 600, color: "#2d6a4f" }}>{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Stock summary */}
          <div style={{ marginTop: "20px", padding: "14px", background: "#f0fdf4", borderRadius: "10px", display: "flex", gap: "24px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>Low Stock Items</div>
              <div style={{ fontWeight: 700, color: "#dc2626", fontSize: "18px" }}>0</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>Out of Stock</div>
              <div style={{ fontWeight: 700, color: "#9ca3af", fontSize: "18px" }}>0</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>Total Products</div>
              <div style={{ fontWeight: 700, color: "#2d6a4f", fontSize: "18px" }}>0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "32px", color: "#9ca3af", fontSize: "12px" }}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </div>
    </div>
  );
}
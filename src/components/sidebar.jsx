import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", icon: "🏠", path: "/" },
  {
    label: "User Management",
    icon: "👥",
    path: "/users",
    children: [
      { label: "Users", path: "/users" },
      { label: "Roles", path: "/roles" },
      { label: "Sales Commission Agents", path: "/agents" },
    ],
  },
  { label: "Contacts", icon: "📋", path: "/contacts" },
  { label: "Products", icon: "📦", path: "/products" },
  { label: "Manufacturing", icon: "🏭", path: "/manufacturing" },
  { label: "Purchases", icon: "⬇️", path: "/purchases" },
  { label: "Sell", icon: "🛒", path: "/sell" },
  { label: "Stock Transfers", icon: "🔄", path: "/stock-transfers" },
  { label: "Stock Adjustment", icon: "📊", path: "/stock-adjustment" },
  { label: "Expenses", icon: "💸", path: "/expenses" },
  { label: "Reports", icon: "📈", path: "/reports" },
  { label: "Notification Templates", icon: "🔔", path: "/notifications" },
  { label: "Settings", icon: "⚙️", path: "/settings" },
  { label: "CRM", icon: "🤝", path: "/crm" },
  { label: "HRM", icon: "👤", path: "/hrm" },
  { label: "Essentials", icon: "⭐", path: "/essentials" },
];

export default function Sidebar() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("User Management");

  return (
    <aside style={{
      width: "var(--sidebar-width)",
      background: "var(--sidebar-bg)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "0",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 100,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        fontWeight: "700",
        fontSize: "18px",
        letterSpacing: "0.5px",
      }}>
        🌿 Manod ERP
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, paddingTop: "8px" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isOpen = openMenu === item.label;

          return (
            <div key={item.label}>
              <div
                onClick={() =>
                  item.children
                    ? setOpenMenu(isOpen ? null : item.label)
                    : null
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  cursor: "pointer",
                  background: isActive ? "var(--sidebar-hover)" : "transparent",
                  color: isActive ? "#fff" : "var(--sidebar-text)",
                  borderLeft: isActive ? "3px solid var(--accent-green)" : "3px solid transparent",
                  transition: "all 0.2s",
                  fontSize: "14px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--sidebar-hover)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--sidebar-text)";
                  }
                }}
              >
                {item.children ? (
                  <span>{item.icon} {item.label}</span>
                ) : (
                  <Link
                    to={item.path}
                    style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", width: "100%" }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
                {item.children && (
                  <span style={{ fontSize: "10px", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                )}
              </div>

              {/* Submenu */}
              {item.children && isOpen && (
                <div style={{ background: "rgba(0,0,0,0.2)" }}>
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.path}
                      style={{
                        display: "block",
                        padding: "8px 16px 8px 44px",
                        color: location.pathname === child.path ? "#fff" : "var(--sidebar-text)",
                        textDecoration: "none",
                        fontSize: "13px",
                        background: location.pathname === child.path ? "var(--sidebar-hover)" : "transparent",
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
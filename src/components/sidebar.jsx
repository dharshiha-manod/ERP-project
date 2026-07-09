/**
 * ============================================================
 * components/Sidebar.jsx  — Fixed routes for Sell submenu
 * ============================================================
 */

import "../styles/Sidebar.css";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Users, BookUser, Package, Factory, ShoppingCart,
  BadgeDollarSign, ArrowLeftRight, SlidersHorizontal, Wallet,
  BarChart3, Bell, Settings, HeartHandshake, BriefcaseBusiness,
  ClipboardCheck, Search, ChevronDown, Lock, Landmark,
} from "lucide-react";
import { hasFeature, FEATURES, getPlanLabel } from "../planAccess";
import { usePermissions } from "../context/PermissionsContext";
import { FEATURE_PERM_MAP } from "../featurePermissionMap";

const navItems = [
  { label: "Home", icon: Home, path: "/", feature: FEATURES.DASHBOARD },

  {
    label: "User Management", icon: Users, path: "/users", feature: FEATURES.USER_MANAGEMENT,
    children: [
      { label: "Users",                   path: "/users",                    exact: true },
      { label: "Roles",                   path: "/roles" },
      { label: "Sales Commission Agents", path: "/sales-commission-agents" },
    ],
  },

  {
    label: "Contacts", icon: BookUser, path: "/contacts", feature: FEATURES.CONTACTS,
    children: [
      { label: "Suppliers",       path: "/contacts/suppliers" },
      { label: "Customers",       path: "/contacts/customers" },
      { label: "Customer Groups", path: "/customer-group" },
      { label: "Import Contacts", path: "/contacts/import" },
    ],
  },

  {
    label: "Products", icon: Package, path: "/products", feature: FEATURES.PRODUCTS,
    children: [
      { label: "List Products",        path: "/products/",            exact: true },
      { label: "Add Product",          path: "/products/create" },
      { label: "Update Price",         path: "/update-product-price" },
      { label: "Print Labels",         path: "/labels/show" },
      { label: "Variations",           path: "/variation-templates" },
      { label: "Import Products",      path: "/import-products" },
      { label: "Import Opening Stock", path: "/import-opening-stock" },
      { label: "Selling Price Group",  path: "/selling-price-group" },
      { label: "Units",                path: "/units" },
      { label: "Categories",           path: "/taxonomies" },
      { label: "Brands",               path: "/brands" },
      { label: "Warranties",           path: "/warranties" },
    ],
  },

  {
    label: "Manufacturing", icon: Factory, path: "/manufacturing", feature: FEATURES.MANUFACTURING,
    children: [
      { label: "Production Planning",     path: "/manufacturing?tab=planning" },
      { label: "Bill of Materials (BOM)", path: "/manufacturing?tab=bom" },
      { label: "Work Orders",             path: "/manufacturing?tab=workorders" },
      { label: "Production",              path: "/manufacturing?tab=production" },
      { label: "Resources",               path: "/manufacturing?tab=resources" },
      { label: "Machines",                path: "/manufacturing?tab=machines" },
      { label: "Schedule",                path: "/manufacturing?tab=schedule" },
      { label: "Quality Control",         path: "/manufacturing?tab=qc" },
      { label: "Maintenance",             path: "/manufacturing?tab=maintenance" },
      { label: "Production Reports",      path: "/manufacturing?tab=reports" },
    ],
  },
  {
  label: "Accounting", icon: Landmark, path: "/accounting", feature: FEATURES.ACCOUNTING,
  children: [
    { label: "Dashboard",            path: "/accounting?tab=dashboard" },
    { label: "General Ledger",       path: "/accounting?tab=gl" },
    { label: "Accounts Receivable",  path: "/accounting?tab=ar" },
    { label: "Accounts Payable",     path: "/accounting?tab=ap" },
    { label: "Cash & Bank",          path: "/accounting?tab=cashbank" },
    { label: "GST & Tax",            path: "/accounting?tab=gst" },
    { label: "Fixed Assets",         path: "/accounting?tab=assets" },
    { label: "Cost Center & Costing",path: "/accounting?tab=costcenter" },
    { label: "Financial Statements", path: "/accounting?tab=statements" },
    { label: "Budget & Expenses",    path: "/accounting?tab=budget" },
  ],
},

  {
    label: "Purchases", icon: ShoppingCart, path: "/purchases", feature: FEATURES.PURCHASES,
    children: [
      { label: "List Purchases",       path: "/purchases",        exact: true },
      { label: "Add Purchase",         path: "/purchases/create" },
      { label: "List Purchase Return", path: "/purchase-return" },
    ],
  },

  // ── Sell — ALL children use exact matching to prevent cross-lighting ──
  {
    label: "Sales", icon: BadgeDollarSign, path: "/sells", feature: FEATURES.SELL,
    children: [
      { label: "All Sales",          path: "/sells",               exact: true },
      { label: "Add Sale",           path: "/sells/create",        exact: true },
      { label: "List POS",           path: "/pos",                 exact: true },
      { label: "POS",                path: "/pos/create",          exact: true },
      { label: "Add Draft",          path: "/sells/add-draft",     exact: true },
      { label: "List Drafts",        path: "/sells/drafts",        exact: true },
      { label: "Add Quotation",      path: "/sells/add-quotation", exact: true },
      { label: "List Quotations",    path: "/sells/quotations",    exact: true },
      { label: "List Sell Return",   path: "/sell-return",         exact: true },
      { label: "Shipments",          path: "/shipments",           exact: true },
      { label: "Discounts",          path: "/discount",            exact: true },
      { label: "Import Sales",       path: "/import-sales",        exact: true },
    ],
  },

  {
    label: "Stock Transfers", icon: ArrowLeftRight, path: "/stock-transfers", feature: FEATURES.STOCK_TRANSFERS,
    children: [
      { label: "List Stock Transfers", path: "/stock-transfers",        exact: true },
      { label: "Add Stock Transfer",   path: "/stock-transfers/create" },
    ],
  },

  {
    label: "Stock Adjustment", icon: SlidersHorizontal, path: "/stock-adjustments", feature: FEATURES.STOCK_ADJUSTMENT,
    children: [
      { label: "List Stock Adjustments", path: "/stock-adjustments",        exact: true },
      { label: "Add Stock Adjustment",   path: "/stock-adjustments/create" },
    ],
  },

  {
    label: "Expenses", icon: Wallet, path: "/expenses", feature: FEATURES.EXPENSES,
    children: [
      { label: "Expense Categories", path: "/expense-categories" },
      { label: "Add Expense",        path: "/expenses/create" },
      { label: "List Expenses",      path: "/expenses", exact: true },
    ],
  },

  {
    label: "Reports", icon: BarChart3, path: "/reports", feature: FEATURES.REPORTS,
    children: [
      { label: "Profit / Loss Report",        path: "/reports/profit-loss" },
      { label: "Purchase & Sale",             path: "/reports/purchase-sale" },
      { label: "Tax Report",                  path: "/reports/tax" },
      { label: "Supplier & Customer Report",  path: "/reports/supplier-customer" },
      { label: "Customer Groups Report",      path: "/reports/customer-groups" },
      { label: "Stock Report",                path: "/reports/stock" },
      { label: "Stock Adjustment Report",     path: "/reports/stock-adjustment" },
      { label: "Trending Products",           path: "/reports/trending-products" },
      { label: "Items Report",                path: "/reports/items" },
      { label: "Product Purchase Report",     path: "/reports/product-purchase" },
      { label: "Product Sell Report",         path: "/reports/product-sell" },
      { label: "Purchase Payment Report",     path: "/reports/purchase-payment" },
      { label: "Sell Payment Report",         path: "/reports/sell-payment" },
      { label: "Expense Report",              path: "/reports/expense" },
      { label: "Register Report",             path: "/reports/register" },
      { label: "Sales Representative Report", path: "/reports/sales-representative" },
      { label: "Activity Log",                path: "/reports/activity-log" },
    ],
  },

  { label: "Notification Templates", icon: Bell,         path: "/notifications", feature: FEATURES.NOTIFICATIONS },
  { label: "Settings",               icon: Settings,     path: "/settings",      feature: FEATURES.SETTINGS },
  { label: "CRM",                    icon: HeartHandshake,path: "/crm",          feature: FEATURES.CRM },

  {
    label: "HRM", icon: BriefcaseBusiness, path: "/hrm", feature: FEATURES.HRM,
    children: [
      { label: "Dashboard",     path: "/hrm",                exact: true },
      { label: "Leave Type",    path: "/hrm/leave-type" },
      { label: "Leave",         path: "/hrm/leave",          exact: true },
      { label: "Attendance",    path: "/hrm/attendance" },
      { label: "Payroll",       path: "/hrm/payroll",        exact: true },
      { label: "My Payrolls",   path: "/hrm/payroll/my" },
      { label: "Holiday",       path: "/hrm/holiday" },
      { label: "Departments",   path: "/hrm/departments" },
      { label: "Designations",  path: "/hrm/designations" },
      { label: "Sales Targets", path: "/hrm/sales-targets" },
      { label: "Settings",      path: "/hrm/settings" },
    ],
  },

  {
    label: "Essentials", icon: ClipboardCheck, path: "/essentials", feature: FEATURES.ESSENTIALS,
    children: [
      { label: "Dashboard",      path: "/essentials",                exact: true },
      { label: "To Do",          path: "/essentials/todo" },
      { label: "Document",       path: "/essentials/document" },
      { label: "Memos",          path: "/essentials/memos" },
      { label: "Reminders",      path: "/essentials/reminders" },
      { label: "Messages",       path: "/essentials/messages" },
      { label: "Knowledge Base", path: "/essentials/knowledge-base" },
      { label: "Settings",       path: "/essentials/settings" },
    ],
  },
];

/* ── Active-route helpers ─────────────────────────────────────────────────── */
function childMatches(c, pathname, search) {
  const [cPath, cQuery] = c.path.split("?");
  if (cQuery) {
    const params = new URLSearchParams(cQuery);
    const cur    = new URLSearchParams(search);
    return pathname === cPath && params.get("tab") === cur.get("tab");
  }
  if (c.exact) return pathname === cPath;
  return pathname === cPath || pathname.startsWith(cPath + "/");
}

function checkActive(item, pathname, search) {
  if (item.path === "/manufacturing") {
    return pathname === "/manufacturing" || pathname.startsWith("/manufacturing");
  }
  if (item.children) return item.children.some(c => childMatches(c, pathname, search));
  if (item.path === "/") return pathname === "/";
  return pathname.startsWith(item.path);
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [search,   setSearch]   = useState("");

  const { hasPermission, loaded, isAdmin, userName, userRole, userAvatar } = usePermissions();
  const planLabel = getPlanLabel();

  const visibleItems = navItems.filter(it => {
    if (!hasFeature(it.feature)) return false;
    if (!it.feature || it.feature === FEATURES.DASHBOARD) return true;
    if (!loaded) return false;
    if (isAdmin) return true;
    const checker = FEATURE_PERM_MAP[it.feature];
    if (!checker) return true;
    return checker(hasPermission);
  });

  const q        = search.toLowerCase().trim();
  const filtered = q
    ? visibleItems.filter(it =>
        it.label.toLowerCase().includes(q) ||
        it.children?.some(c => c.label.toLowerCase().includes(q))
      )
    : visibleItems;

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.2 2 5 4.8 5 9c0 5.8 7 13 7 13s7-7.2 7-13c0-4.2-3.2-7-7-7z" fill="white" opacity="0.9"/>
            <circle cx="12" cy="9" r="2.5" fill="rgba(26,61,43,0.7)"/>
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">Manod ERP</div>
          <div className="sidebar-logo-sub">Inventory System</div>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <span className="sidebar-search-icon"><Search size={14} /></span>
        <input className="sidebar-search-input" placeholder="Search menu..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Plan badge */}
      <div style={{
        margin: "0 14px 10px", padding: "6px 12px", borderRadius: 8,
        background: "#e8f5e9", color: "#2e7d32", fontSize: 11, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "0.6px", textAlign: "center",
      }}>{planLabel} Plan</div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {filtered.map(item => {
          const Icon   = item.icon;
          const active = checkActive(item, location.pathname, location.search);
          const open   = openMenu === item.label;

          return (
            <div key={item.label} className="sidebar-item-wrapper">
              {item.children ? (
                <div className={`sidebar-item${active ? " active" : ""}`}
                  onClick={() => setOpenMenu(open ? null : item.label)}>
                  <span className="sidebar-item-icon">{Icon && <Icon size={16} strokeWidth={1.8} />}</span>
                  <span className="sidebar-item-label">{item.label}</span>
                  <span className={`sidebar-chevron${open ? " rotated" : ""}`}>
                    <ChevronDown size={13} strokeWidth={2.2} />
                  </span>
                </div>
              ) : (
                <Link to={item.path} className={`sidebar-item${active ? " active" : ""}`}>
                  <span className="sidebar-item-icon">{Icon && <Icon size={16} strokeWidth={1.8} />}</span>
                  <span className="sidebar-item-label">{item.label}</span>
                </Link>
              )}

              {item.children && open && (
                <div className="sidebar-submenu">
                  {item.children
                    .filter(c => !q || c.label.toLowerCase().includes(q))
                    .map(child => {
                      const ca = childMatches(child, location.pathname, location.search);
                      return (
                        <Link key={child.label} to={child.path}
                          className={`sidebar-subitem${ca ? " active" : ""}`}>
                          <span className="sidebar-subitem-dot" />
                          {child.label}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}

        {planLabel !== "Pro" && (
          <Link to="/subscribe" className="sidebar-item-wrapper" style={{ textDecoration: "none" }}>
            <div className="sidebar-item" style={{
              marginTop: 8, background: "linear-gradient(135deg, #2e7d32, #43a047)",
              color: "#fff", borderRadius: 10,
            }}>
              <span className="sidebar-item-icon"><Lock size={16} strokeWidth={1.8} color="#fff" /></span>
              <span className="sidebar-item-label" style={{ color: "#fff", fontWeight: 700 }}>Upgrade Plan</span>
            </div>
          </Link>
        )}
      </nav>

      {/* User Card */}
      <div className="sidebar-user" onClick={() => navigate("/profile")}
        style={{ cursor: "pointer", transition: "all 0.2s ease", borderRadius: "10px" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(22,163,74,0.1)"; e.currentTarget.style.transform = "translateX(4px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
        title="Click to view profile">
        <div className="sidebar-user-avatar">{userAvatar || "U"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userName || "User"}
          </div>
          <div className="sidebar-user-role">{userRole || "—"}</div>
        </div>
        <div className="sidebar-user-arrow">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    </aside>
  );
}
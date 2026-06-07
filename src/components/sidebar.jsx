import "../styles/Sidebar.css";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  BookUser,
  Package,
  Factory,
  ShoppingCart,
  BadgeDollarSign,
  ArrowLeftRight,
  SlidersHorizontal,
  Wallet,
  BarChart3,
  Bell,
  Settings,
  HeartHandshake,
  BriefcaseBusiness,
  ClipboardCheck,
  Search,
  ChevronDown,
} from "lucide-react";

/* ── Nav Data ─────────────────────────────────────────────────────────────── */
const navItems = [
  { label: "Home", icon: Home, path: "/" },
  {
    label: "User Management", icon: Users, path: "/users",
    children: [
      { label: "Users", path: "/users" },
      { label: "Roles", path: "/roles" },
      { label: "Sales Commission Agents", path: "/sales-commission-agents" },
    ],
  },
  {
    label: "Contacts", icon: BookUser, path: "/contacts",
    children: [
      { label: "Suppliers", path: "/contacts?type=supplier" },
      { label: "Customers", path: "/contacts?type=customer" },
      { label: "Customer Groups", path: "/customer-group" },
      { label: "Import Contacts", path: "/contacts/import" },
    ],
  },
  {
    label: "Products", icon: Package, path: "/products",
    children: [
      { label: "List Products", path: "/products/" },
      { label: "Add Product", path: "/products/create" },
      { label: "Update Price", path: "/update-product-price" },
      { label: "Print Labels", path: "/labels/show" },
      { label: "Variations", path: "/variation-templates" },
      { label: "Import Products", path: "/import-products" },
      { label: "Import Opening Stock", path: "/import-opening-stock" },
      { label: "Selling Price Group", path: "/selling-price-group" },
      { label: "Units", path: "/units" },
      { label: "Categories", path: "/taxonomies" },
      { label: "Brands", path: "/brands" },
      { label: "Warranties", path: "/warranties" },
    ],
  },
  { label: "Manufacturing", icon: Factory, path: "/manufacturing/recipe" },
  {
    label: "Purchases", icon: ShoppingCart, path: "/purchases",
    children: [
      { label: "List Purchases", path: "/purchases" },
      { label: "Add Purchase", path: "/purchases/create" },
      { label: "List Purchase Return", path: "/purchase-return" },
    ],
  },
  {
    label: "Sell", icon: BadgeDollarSign, path: "/sells",
    children: [
      { label: "All Sales", path: "/sells" },
      { label: "Add Sale", path: "/sells/create" },
      { label: "List POS", path: "/pos" },
      { label: "POS", path: "/pos/create" },
      { label: "Add Draft", path: "/sells/create?status=draft" },
      { label: "List Drafts", path: "/sells/drafts" },
      { label: "Add Quotation", path: "/sells/create?status=quotation" },
      { label: "List Quotations", path: "/sells/quotations" },
      { label: "List Sell Return", path: "/sell-return" },
      { label: "Shipments", path: "/shipments" },
      { label: "Discounts", path: "/discount" },
      { label: "Import Sales", path: "/import-sales" },
    ],
  },
  {
    label: "Stock Transfers", icon: ArrowLeftRight, path: "/stock-transfers",
    children: [
      { label: "List Stock Transfers", path: "/stock-transfers" },
      { label: "Add Stock Transfer", path: "/stock-transfers/create" },
    ],
  },
  {
    label: "Stock Adjustment", icon: SlidersHorizontal, path: "/stock-adjustments",
    children: [
      { label: "List Stock Adjustments", path: "/stock-adjustments" },
      { label: "Add Stock Adjustment", path: "/stock-adjustments/create" },
    ],
  },
  {
    label: "Expenses", icon: Wallet, path: "/expenses",
    children: [
      { label: "List Expenses", path: "/expenses" },
      { label: "Add Expense", path: "/expenses/create" },
      { label: "Expense Categories", path: "/expense-categories" },
    ],
  },
  {
    label: "Reports", icon: BarChart3, path: "/reports",
    children: [
      { label: "Profit / Loss Report", path: "/reports/profit-loss" },
      { label: "Purchase & Sale", path: "/reports/purchase-sale" },
      { label: "Tax Report", path: "/reports/tax" },
      { label: "Supplier & Customer Report", path: "/reports/supplier-customer" },
      { label: "Customer Groups Report", path: "/reports/customer-groups" },
      { label: "Stock Report", path: "/reports/stock" },
      { label: "Stock Adjustment Report", path: "/reports/stock-adjustment" },
      { label: "Trending Products", path: "/reports/trending-products" },
      { label: "Items Report", path: "/reports/items" },
      { label: "Product Purchase Report", path: "/reports/product-purchase" },
      { label: "Product Sell Report", path: "/reports/product-sell" },
      { label: "Purchase Payment Report", path: "/reports/purchase-payment" },
      { label: "Sell Payment Report", path: "/reports/sell-payment" },
      { label: "Expense Report", path: "/reports/expense" },
      { label: "Register Report", path: "/reports/register" },
      { label: "Sales Representative Report", path: "/reports/sales-representative" },
      { label: "Activity Log", path: "/reports/activity-log" },
    ],
  },
  { label: "Notification Templates", icon: Bell, path: "/notifications" },
  {
    label: "Settings", icon: Settings, path: "/settings",
    children: [
      { label: "Business Settings", path: "/settings/business" },
      { label: "Tax Rates", path: "/settings/tax-rates" },
      { label: "Payment Methods", path: "/settings/payment-methods" },
      { label: "Account Settings", path: "/settings/account" },
      { label: "Barcode Settings", path: "/settings/barcode" },
      { label: "Receipt Printer", path: "/settings/receipt-printer" },
    ],
  },
  { label: "CRM", icon: HeartHandshake, path: "/crm" },
  {
    label: "HRM", icon: BriefcaseBusiness, path: "/hrm",
    children: [
      { label: "Dashboard", path: "/hrm" },
      { label: "Leave Type", path: "/hrm/leave-type" },
      { label: "Leave", path: "/hrm/leave" },
      { label: "Attendance", path: "/hrm/attendance" },
      { label: "Payroll", path: "/hrm/payroll" },
      { label: "My Payrolls", path: "/hrm/payroll/my" },
      { label: "Holiday", path: "/hrm/holiday" },
      { label: "Departments", path: "/hrm/departments" },
      { label: "Designations", path: "/hrm/designations" },
      { label: "Sales Targets", path: "/hrm/sales-targets" },
      { label: "Settings", path: "/hrm/settings" },
    ],
  },
  {
    label: "Essentials", icon: ClipboardCheck, path: "/essentials",
    children: [
      { label: "Dashboard", path: "/essentials" },
      { label: "To Do", path: "/essentials/todo" },
      { label: "Document", path: "/essentials/document" },
      { label: "Memos", path: "/essentials/memos" },
      { label: "Reminders", path: "/essentials/reminders" },
      { label: "Messages", path: "/essentials/messages" },
      { label: "Knowledge Base", path: "/essentials/knowledge-base" },
      { label: "Settings", path: "/essentials/settings" },
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function checkActive(item, pathname) {
  if (item.children) {
    return item.children.some((c) => {
      const p = c.path.split("?")[0];
      return pathname === p || pathname.startsWith(p + "/");
    });
  }
  if (item.path === "/") return pathname === "/";
  return pathname === item.path || pathname.startsWith(item.path + "/");
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Sidebar() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();
  const filtered = q
    ? navItems.filter(
        (it) =>
          it.label.toLowerCase().includes(q) ||
          it.children?.some((c) => c.label.toLowerCase().includes(q))
      )
    : navItems;

  return (
    <aside className="sidebar">

      {/* ── Logo ── */}
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

      {/* ── Search ── */}
      <div className="sidebar-search">
        <span className="sidebar-search-icon"><Search size={14} /></span>
        <input
          className="sidebar-search-input"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        {filtered.map((item) => {
          const Icon = item.icon;
          const active = checkActive(item, location.pathname);
          const open = openMenu === item.label;

          return (
            <div key={item.label} className="sidebar-item-wrapper">
              {item.children ? (
                <div
                  className={`sidebar-item${active ? " active" : ""}`}
                  onClick={() => setOpenMenu(open ? null : item.label)}
                >
                  <span className="sidebar-item-icon">
                    {Icon && <Icon size={16} strokeWidth={1.8} />}
                  </span>
                  <span className="sidebar-item-label">{item.label}</span>
                  <span className={`sidebar-chevron${open ? " rotated" : ""}`}>
                    <ChevronDown size={13} strokeWidth={2.2} />
                  </span>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`sidebar-item${active ? " active" : ""}`}
                >
                  <span className="sidebar-item-icon">
                    {Icon && <Icon size={16} strokeWidth={1.8} />}
                  </span>
                  <span className="sidebar-item-label">{item.label}</span>
                </Link>
              )}

              {item.children && open && (
                <div className="sidebar-submenu">
                  {item.children
                    .filter((c) => !q || c.label.toLowerCase().includes(q))
                    .map((child) => {
                      const cp = child.path.split("?")[0];
                      const ca =
                        location.pathname === cp ||
                        location.pathname.startsWith(cp + "/");
                      return (
                        <Link
                          key={child.label}
                          to={child.path}
                          className={`sidebar-subitem${ca ? " active" : ""}`}
                        >
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
      </nav>

      {/* ── User Card ── */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">A</div>
        <div>
          <div className="sidebar-user-name">Admin User</div>
          <div className="sidebar-user-role">Administrator</div>
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
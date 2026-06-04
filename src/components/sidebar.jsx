import "../styles/Sidebar.css";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", icon: "🏠", path: "/" },
  {
    label: "User Management",
    path: "/users",
    children: [
      { label: "Users", path: "/users" },
      { label: "Roles", path: "/roles" },
      { label: "Sales Commission Agents", path: "/sales-commission-agents" },
    ],
  },
  {
    label: "Contacts",
    icon: "📋",
    path: "/contacts",
    children: [
      { label: "Suppliers", path: "/contacts?type=supplier" },
      { label: "Customers", path: "/contacts?type=customer" },
      { label: "Customer Groups", path: "/customer-group" },
      { label: "Import Contacts", path: "/contacts/import" },
    ],
  },
  {
    label: "Products",
    icon: "📦",
    path: "/products",
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
      { label: "Categories", path: "/taxonomies?type=product" },
      { label: "Brands", path: "/brands" },
      { label: "Warranties", path: "/warranties" },
    ],
  },
  { label: "Manufacturing", icon: "🏭", path: "/manufacturing/recipe" },
  {
    label: "Purchases",
    icon: "⬇️",
    path: "/purchases",
    children: [
      { label: "List Purchases", path: "/purchases" },
      { label: "Add Purchase", path: "/purchases/create" },
      { label: "List Purchase Return", path: "/purchase-return" },
    ],
  },
  {
    label: "Sell",
    icon: "🛒",
    path: "/sell",
    children: [
      { label: "All Sales", path: "/sells" },
      { label: "Add Sale", path: "/sells/create" },
      { label: "List POS", path: "/pos" },
      { label: "POS", path: "/pos/create" },
      { label: "Add Draft", path: "/sells/add-draft" },
      { label: "List Drafts", path: "/sells/drafts" },
      { label: "Add Quotation", path: "/sells/add-quotation" },
      { label: "List Quotations", path: "/sells/quotations" },
      { label: "List Sell Return", path: "/sell-return" },
      { label: "Shipments", path: "/shipments" },
      { label: "Discounts", path: "/discount" },
      { label: "Import Sales", path: "/import-sales" },
    ],
  },
  {
    label: "Stock Transfers",
    icon: "🔄",
    path: "/stock-transfers",
    children: [
      { label: "List Stock Transfers", path: "/stock-transfers" },
      { label: "Add Stock Transfer", path: "/stock-transfers/create" },
    ],
  },
  {
    label: "Stock Adjustment",
    icon: "📊",
    path: "/stock-adjustments",
    children: [
      { label: "List Stock Adjustments", path: "/stock-adjustments" },
      { label: "Add Stock Adjustment", path: "/stock-adjustments/create" },
    ],
  },
  {
    label: "Expenses",
    icon: "💸",
    path: "/expenses",
    children: [
      { label: "List Expenses", path: "/expenses" },
      { label: "Add Expense", path: "/expenses/create" },
      { label: "Expense Categories", path: "/expense-categories" },
    ],
  },
  {
    label: "Reports",
    icon: "📈",
    path: "/reports",
    children: [
      { label: "Profit / Loss Report", path: "/reports/profit-loss" },
      { label: "Purchase & Sale", path: "/reports/purchase-sell" },
      { label: "Tax Report", path: "/reports/tax-report" },
      { label: "Supplier & Customer Report", path: "/reports/customer-supplier" },
      { label: "Customer Groups Report", path: "/reports/customer-group" },
      { label: "Stock Report", path: "/reports/stock-report" },
      { label: "Stock Adjustment Report", path: "/reports/stock-adjustment-report" },
      { label: "Trending Products", path: "/reports/trending-products" },
      { label: "Items Report", path: "/reports/items-report" },
      { label: "Product Purchase Report", path: "/reports/product-purchase-report" },
      { label: "Product Sell Report", path: "/reports/product-sell-report" },
      { label: "Purchase Payment Report", path: "/reports/purchase-payment-report" },
      { label: "Sell Payment Report", path: "/reports/sell-payment-report" },
      { label: "Expense Report", path: "/reports/expense-report" },
      { label: "Register Report", path: "/reports/register-report" },
      { label: "Sales Representative Report", path: "/reports/sales-representative-report" },
      { label: "Activity Log", path: "/reports/activity-log" },
    ],
  },
  { label: "Notification Templates", icon: "🔔", path: "/notifications" },
  {
    label: "Settings",
    icon: "⚙️",
    path: "/settings",
    children: [
      { label: "Business Settings", path: "/settings/business" },
      { label: "Tax Rates", path: "/settings/tax-rates" },
      { label: "Payment Methods", path: "/settings/payment-methods" },
      { label: "Account Settings", path: "/settings/account" },
      { label: "Barcode Settings", path: "/settings/barcode" },
      { label: "Receipt Printer", path: "/settings/receipt-printer" },
    ],
  },
  { label: "CRM", icon: "🤝", path: "/crm" },
  {
    label: "HRM",
    icon: "👥",
    path: "/hrm",
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
    label: "Essentials",
    icon: "✅",
    path: "/essentials",
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

export default function Sidebar() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🌿</span>
        <span className="sidebar-logo-text">Manod ERP</span>
      </div>
      <div className="sidebar-search">
        <span className="sidebar-search-icon">🔍</span>
        <input className="sidebar-search-input" placeholder="Search menu..." type="text" />
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (!item.children && item.path !== "/" && location.pathname.startsWith(item.path)) ||
            (item.children &&
              item.children.some((c) => location.pathname.startsWith(c.path.split("?")[0])));
          const isOpen = openMenu === item.label;

          return (
            <div key={item.label} className="sidebar-item-wrapper">
              {item.children ? (
                <div
                  className={`sidebar-item${isActive ? " active" : ""}${isOpen ? " open" : ""}`}
                  onClick={() => setOpenMenu(isOpen ? null : item.label)}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span className="sidebar-item-label">{item.label}</span>
                  <span className={`sidebar-chevron${isOpen ? " rotated" : ""}`}>‹</span>
                </div>
              ) : (
                <Link to={item.path} className={`sidebar-item${isActive ? " active" : ""}`}>
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span className="sidebar-item-label">{item.label}</span>
                </Link>
              )}
              {item.children && isOpen && (
                <div className="sidebar-submenu">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.path}
                      className={`sidebar-subitem${
                        location.pathname === child.path.split("?")[0] ||
                        location.pathname.startsWith(child.path.split("?")[0] + "/")
                          ? " active"
                          : ""
                      }`}
                    >
                      <span className="sidebar-subitem-dot" />
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
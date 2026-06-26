import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./pages/ThemeContext";
import { PermissionsProvider, usePermissions } from "./context/PermissionsContext";
import { FEATURE_PERM_MAP } from "./featurePermissionMap";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import SalesCommissionAgents from "./pages/SalesCommissionAgents";
import ListProducts, { AddProductPage } from "./pages/Products";
import UpdatePrice from "./pages/UpdatePrice";
import PrintLabels from "./pages/PrintLabels";
import Variations from "./pages/Variations";
import ImportProducts from "./pages/ImportProducts";
import ImportOpeningStock from "./pages/ImportOpeningStock";
import SellingPriceGroup from "./pages/SellingPriceGroup";
import Units from "./pages/Units";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Warranties from "./pages/Warranties";

// ── Manufacturing — single component, all tabs inside ─────────────────────
import Manufacturing from "./pages/Manufacturing";

import Purchases from "./pages/Purchases";
import PurchaseReturn from "./pages/PurchaseReturn";
import Contacts, {
  SuppliersPage, CustomersPage, CustomerGroupsPage, ImportContactsPage,
} from "./pages/Contacts";
import { AllSales, AddSale, ListPOS, POSCreate, AddDraft, ListDrafts, AddQuotation, ListQuotations, SellReturn, Shipments, Discounts, ImportSales } from "./pages/Sell";
import { ListStockTransfers, AddStockTransfer } from "./pages/StockTransfers";
import { ListStockAdjustments, AddStockAdjustment } from "./pages/StockAdjustments";
// ↓ CHANGED: added EditExpense, ViewExpense to the Expenses import
import { ListExpenses, AddExpense, EditExpense, ViewExpense, ImportExpenses, ExpenseCategories } from "./pages/Expenses";
import NotificationTemplates from "./pages/NotificationTemplates";
import { HRMRoutes, EssentialsRoutes } from "./pages/HRM";
import { CRMRoutes } from "./pages/CRM";
import Settings from "./pages/settings";
import {
  ProfitLossReport, PurchaseSaleReport, TaxReport, SupplierCustomerReport,
  CustomerGroupsReport, StockReport, StockAdjustmentReport, TrendingProductsReport,
  ItemsReport, ProductPurchaseReport, ProductSellReport, PurchasePaymentReport,
  SellPaymentReport, ExpenseReport, RegisterReport, SalesRepresentativeReport,
  ActivityLogReport,
} from "./pages/Reports";
import MyProfile      from "./pages/MyProfile";
import ChangePassword from "./pages/ChangePassword";
import Login          from "./pages/Login";
import Subscription, { isSubscriptionActive } from "./pages/Subscription";
import { hasFeature, FEATURES } from "./planAccess";
import "./App.css";

// ─── Auth helpers ──────────────────────────────────────────────────────────
function isAuthenticated() {
  return !!localStorage.getItem("manod_token");
}

// ─── Access Denied ─────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: 16,
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a202c", margin: 0 }}>Access Denied</h2>
      <p style={{ color: "#718096", fontSize: 15, textAlign: "center", maxWidth: 400 }}>
        You don't have permission to view this page. Please contact your administrator.
      </p>
      <button
        onClick={() => window.location.href = "/"}
        style={{
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}
      >← Go to Home</button>
    </div>
  );
}

// ─── Route guards ──────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isSubscriptionActive()) return <Navigate to="/subscribe" replace />;
  return children;
}

function PublicRoute({ children }) {
  if (!isAuthenticated()) return children;
  return isSubscriptionActive() ? <Navigate to="/" replace /> : <Navigate to="/subscribe" replace />;
}

function SubscriptionGate({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function FeatureRoute({ feature, children }) {
  const { hasPermission, loaded, isAdmin } = usePermissions();
  if (!hasFeature(feature)) return <Navigate to="/subscribe" replace />;
  if (!loaded) return null;
  if (isAdmin) return children;
  const checker = FEATURE_PERM_MAP[feature];
  if (!checker) return <AccessDenied />;
  if (!checker(hasPermission)) return <AccessDenied />;
  return children;
}

// ─── App Layout ───────────────────────────────────────────────────────────
function AppLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <TopHeader businessName="Manodtechnologies" />
      <main style={{
        marginLeft: "260px",
        marginTop: "60px",
        flex: 1,
        minHeight: "calc(100vh - 60px)",
        background: "var(--manod-page-bg, #f0f4f1)",
        padding: "24px 32px",
        transition: "background 0.3s ease",
      }}>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<FeatureRoute feature={FEATURES.DASHBOARD}><Dashboard /></FeatureRoute>} />

          {/* Profile — always accessible */}
          <Route path="/profile"          element={<MyProfile />} />
          <Route path="/change-password"  element={<ChangePassword />} />

          {/* User Management */}
          <Route path="/users"                   element={<FeatureRoute feature={FEATURES.USER_MANAGEMENT}><Users /></FeatureRoute>} />
          <Route path="/roles"                   element={<FeatureRoute feature={FEATURES.USER_MANAGEMENT}><Roles /></FeatureRoute>} />
          <Route path="/sales-commission-agents" element={<FeatureRoute feature={FEATURES.USER_MANAGEMENT}><SalesCommissionAgents /></FeatureRoute>} />

          {/* Contacts */}
          <Route path="/contacts"           element={<FeatureRoute feature={FEATURES.CONTACTS}><SuppliersPage /></FeatureRoute>} />
          <Route path="/contacts/suppliers" element={<FeatureRoute feature={FEATURES.CONTACTS}><SuppliersPage /></FeatureRoute>} />
          <Route path="/contacts/customers" element={<FeatureRoute feature={FEATURES.CONTACTS}><CustomersPage /></FeatureRoute>} />
          <Route path="/customer-group"     element={<FeatureRoute feature={FEATURES.CONTACTS}><CustomerGroupsPage /></FeatureRoute>} />
          <Route path="/contacts/import"    element={<FeatureRoute feature={FEATURES.CONTACTS}><ImportContactsPage /></FeatureRoute>} />

          {/* Products */}
          <Route path="/products/"           element={<FeatureRoute feature={FEATURES.PRODUCTS}><ListProducts /></FeatureRoute>} />
          <Route path="/products/create"     element={<FeatureRoute feature={FEATURES.PRODUCTS}><AddProductPage /></FeatureRoute>} />
          <Route path="/update-product-price"element={<FeatureRoute feature={FEATURES.PRODUCTS}><UpdatePrice /></FeatureRoute>} />
          <Route path="/labels/show"         element={<FeatureRoute feature={FEATURES.PRODUCTS}><PrintLabels /></FeatureRoute>} />
          <Route path="/variation-templates" element={<FeatureRoute feature={FEATURES.PRODUCTS}><Variations /></FeatureRoute>} />
          <Route path="/import-products"     element={<FeatureRoute feature={FEATURES.PRODUCTS}><ImportProducts /></FeatureRoute>} />
          <Route path="/import-opening-stock"element={<FeatureRoute feature={FEATURES.PRODUCTS}><ImportOpeningStock /></FeatureRoute>} />
          <Route path="/selling-price-group" element={<FeatureRoute feature={FEATURES.PRODUCTS}><SellingPriceGroup /></FeatureRoute>} />
          <Route path="/units"               element={<FeatureRoute feature={FEATURES.PRODUCTS}><Units /></FeatureRoute>} />
          <Route path="/taxonomies"          element={<FeatureRoute feature={FEATURES.PRODUCTS}><Categories /></FeatureRoute>} />
          <Route path="/brands"              element={<FeatureRoute feature={FEATURES.PRODUCTS}><Brands /></FeatureRoute>} />
          <Route path="/warranties"          element={<FeatureRoute feature={FEATURES.PRODUCTS}><Warranties /></FeatureRoute>} />

          {/* ── MANUFACTURING ─────────────────────────────────────────────
           *  Single route, single component.
           *  The ?tab= query param switches the active tab inside Manufacturing.jsx.
           *  Sidebar links use /manufacturing?tab=<key> — they all land here.
           * ──────────────────────────────────────────────────────────── */}
          <Route
            path="/manufacturing"
            element={
              <FeatureRoute feature={FEATURES.MANUFACTURING}>
                <Manufacturing />
              </FeatureRoute>
            }
          />

          {/* Purchases */}
          <Route path="/purchases"              element={<FeatureRoute feature={FEATURES.PURCHASES}><Purchases /></FeatureRoute>} />
          <Route path="/purchases/create"       element={<FeatureRoute feature={FEATURES.PURCHASES}><Purchases /></FeatureRoute>} />
          <Route path="/purchase-return"        element={<FeatureRoute feature={FEATURES.PURCHASES}><PurchaseReturn /></FeatureRoute>} />
          <Route path="/purchase-return/create" element={<FeatureRoute feature={FEATURES.PURCHASES}><PurchaseReturn /></FeatureRoute>} />

          {/* Sell */}
          <Route path="/sells"               element={<FeatureRoute feature={FEATURES.SELL}><AllSales /></FeatureRoute>} />
          <Route path="/sells/create"        element={<FeatureRoute feature={FEATURES.SELL}><AddSale /></FeatureRoute>} />
          <Route path="/sells/drafts"        element={<FeatureRoute feature={FEATURES.SELL}><ListDrafts /></FeatureRoute>} />
          <Route path="/sells/add-draft"     element={<FeatureRoute feature={FEATURES.SELL}><AddDraft /></FeatureRoute>} />
          <Route path="/sells/quotations"    element={<FeatureRoute feature={FEATURES.SELL}><ListQuotations /></FeatureRoute>} />
          <Route path="/sells/add-quotation" element={<FeatureRoute feature={FEATURES.SELL}><AddQuotation /></FeatureRoute>} />
          <Route path="/sell-return"         element={<FeatureRoute feature={FEATURES.SELL}><SellReturn /></FeatureRoute>} />
          <Route path="/shipments"           element={<FeatureRoute feature={FEATURES.SELL}><Shipments /></FeatureRoute>} />
          <Route path="/discount"            element={<FeatureRoute feature={FEATURES.SELL}><Discounts /></FeatureRoute>} />
          <Route path="/import-sales"        element={<FeatureRoute feature={FEATURES.SELL}><ImportSales /></FeatureRoute>} />

          {/* POS */}
          <Route path="/pos"        element={<FeatureRoute feature={FEATURES.POS}><ListPOS /></FeatureRoute>} />
          <Route path="/pos/create" element={<FeatureRoute feature={FEATURES.POS}><POSCreate /></FeatureRoute>} />

          {/* Stock */}
          <Route path="/stock-transfers"          element={<FeatureRoute feature={FEATURES.STOCK_TRANSFERS}><ListStockTransfers /></FeatureRoute>} />
          <Route path="/stock-transfers/create"   element={<FeatureRoute feature={FEATURES.STOCK_TRANSFERS}><AddStockTransfer /></FeatureRoute>} />
          <Route path="/stock-adjustments"        element={<FeatureRoute feature={FEATURES.STOCK_ADJUSTMENT}><ListStockAdjustments /></FeatureRoute>} />
          <Route path="/stock-adjustments/create" element={<FeatureRoute feature={FEATURES.STOCK_ADJUSTMENT}><AddStockAdjustment /></FeatureRoute>} />

          {/* Expenses */}
          <Route path="/expenses"           element={<FeatureRoute feature={FEATURES.EXPENSES}><ListExpenses /></FeatureRoute>} />
          <Route path="/expenses/create"    element={<FeatureRoute feature={FEATURES.EXPENSES}><AddExpense /></FeatureRoute>} />
          {/* ↓ NEW: view + edit routes — these were missing, which is why
                 clicking the 👁 / ✏️ buttons on List Expenses showed a blank page */}
          <Route path="/expenses/:id"       element={<FeatureRoute feature={FEATURES.EXPENSES}><ViewExpense /></FeatureRoute>} />
          <Route path="/expenses/:id/edit"  element={<FeatureRoute feature={FEATURES.EXPENSES}><EditExpense /></FeatureRoute>} />
          <Route path="/import-expenses"    element={<FeatureRoute feature={FEATURES.EXPENSES}><ImportExpenses /></FeatureRoute>} />
          <Route path="/expense-categories" element={<FeatureRoute feature={FEATURES.EXPENSES}><ExpenseCategories /></FeatureRoute>} />

          {/* Notifications */}
          <Route path="/notifications" element={<FeatureRoute feature={FEATURES.NOTIFICATIONS}><NotificationTemplates /></FeatureRoute>} />

          {/* CRM / HRM / Essentials */}
          <Route path="/crm/*"        element={<FeatureRoute feature={FEATURES.CRM}><CRMRoutes /></FeatureRoute>} />
          <Route path="/hrm/*"        element={<FeatureRoute feature={FEATURES.HRM}><HRMRoutes /></FeatureRoute>} />
          <Route path="/essentials/*" element={<FeatureRoute feature={FEATURES.ESSENTIALS}><EssentialsRoutes /></FeatureRoute>} />

          {/* Settings */}
          <Route path="/settings"                  element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="business" /></FeatureRoute>} />
          <Route path="/settings/business"         element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="business" /></FeatureRoute>} />
          <Route path="/settings/tax-rates"        element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="taxrates" /></FeatureRoute>} />
          <Route path="/settings/payment-methods"  element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="locations" /></FeatureRoute>} />
          <Route path="/settings/account"          element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="business" /></FeatureRoute>} />
          <Route path="/settings/barcode"          element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="barcode" /></FeatureRoute>} />
          <Route path="/settings/receipt-printer"  element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="printers" /></FeatureRoute>} />

          {/* Reports */}
          <Route path="/reports"                      element={<FeatureRoute feature={FEATURES.REPORTS}><ProfitLossReport /></FeatureRoute>} />
          <Route path="/reports/profit-loss"          element={<FeatureRoute feature={FEATURES.REPORTS}><ProfitLossReport /></FeatureRoute>} />
          <Route path="/reports/purchase-sale"        element={<FeatureRoute feature={FEATURES.REPORTS}><PurchaseSaleReport /></FeatureRoute>} />
          <Route path="/reports/tax"                  element={<FeatureRoute feature={FEATURES.REPORTS}><TaxReport /></FeatureRoute>} />
          <Route path="/reports/supplier-customer"    element={<FeatureRoute feature={FEATURES.REPORTS}><SupplierCustomerReport /></FeatureRoute>} />
          <Route path="/reports/customer-groups"      element={<FeatureRoute feature={FEATURES.REPORTS}><CustomerGroupsReport /></FeatureRoute>} />
          <Route path="/reports/stock"                element={<FeatureRoute feature={FEATURES.REPORTS}><StockReport /></FeatureRoute>} />
          <Route path="/reports/stock-adjustment"     element={<FeatureRoute feature={FEATURES.REPORTS}><StockAdjustmentReport /></FeatureRoute>} />
          <Route path="/reports/trending-products"    element={<FeatureRoute feature={FEATURES.REPORTS}><TrendingProductsReport /></FeatureRoute>} />
          <Route path="/reports/items"                element={<FeatureRoute feature={FEATURES.REPORTS}><ItemsReport /></FeatureRoute>} />
          <Route path="/reports/product-purchase"     element={<FeatureRoute feature={FEATURES.REPORTS}><ProductPurchaseReport /></FeatureRoute>} />
          <Route path="/reports/product-sell"         element={<FeatureRoute feature={FEATURES.REPORTS}><ProductSellReport /></FeatureRoute>} />
          <Route path="/reports/purchase-payment"     element={<FeatureRoute feature={FEATURES.REPORTS}><PurchasePaymentReport /></FeatureRoute>} />
          <Route path="/reports/sell-payment"         element={<FeatureRoute feature={FEATURES.REPORTS}><SellPaymentReport /></FeatureRoute>} />
          <Route path="/reports/expense"              element={<FeatureRoute feature={FEATURES.REPORTS}><ExpenseReport /></FeatureRoute>} />
          <Route path="/reports/register"             element={<FeatureRoute feature={FEATURES.REPORTS}><RegisterReport /></FeatureRoute>} />
          <Route path="/reports/sales-representative" element={<FeatureRoute feature={FEATURES.REPORTS}><SalesRepresentativeReport /></FeatureRoute>} />
          <Route path="/reports/activity-log"         element={<FeatureRoute feature={FEATURES.REPORTS}><ActivityLogReport /></FeatureRoute>} />
        </Routes>
      </main>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────
function App() {
  return (
    <PermissionsProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/subscribe" element={<SubscriptionGate><Subscription /></SubscriptionGate>} />
            <Route path="/*"         element={<PrivateRoute><AppLayout /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </PermissionsProvider>
  );
}

export default App;
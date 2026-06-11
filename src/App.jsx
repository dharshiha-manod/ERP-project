import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./pages/ThemeContext";
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
import Manufacturing from "./pages/Manufacturing";
import Purchases, { AddPurchasePage } from "./pages/Purchases";
import PurchaseReturn from "./pages/PurchaseReturn";
import Contacts, { CustomerGroupsPage, ImportContactsPage } from "./pages/Contacts";
import { AllSales, AddSale, ListPOS, POSCreate, AddDraft, ListDrafts, AddQuotation, ListQuotations, SellReturn, Shipments, Discounts, ImportSales } from "./pages/Sell";
import { ListStockTransfers, AddStockTransfer } from "./pages/StockTransfers";
import { ListStockAdjustments, AddStockAdjustment } from "./pages/StockAdjustments";
import { ListExpenses, AddExpense, ImportExpenses, ExpenseCategories } from "./pages/Expenses";
import NotificationTemplates from "./pages/NotificationTemplates";
import { HRMRoutes, EssentialsRoutes } from "./pages/HRM";
import { CRMRoutes } from "./pages/CRM";
import Settings from "./pages/Settings";
import { ProfitLossReport, PurchaseSaleReport, TaxReport, SupplierCustomerReport, CustomerGroupsReport, StockReport, StockAdjustmentReport, TrendingProductsReport, ItemsReport, ProductPurchaseReport, ProductSellReport, PurchasePaymentReport, SellPaymentReport, ExpenseReport, RegisterReport, SalesRepresentativeReport, ActivityLogReport } from "./pages/Reports";
import MyProfile      from "./pages/MyProfile";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import ProductionPlanning from "./pages/ProductionPlanning";
// ── Subscription ──────────────────────────────────────────────────────────────
import Subscription, { isSubscriptionActive } from "./pages/Subscription";
import { hasFeature, FEATURES } from "./planAccess";
import "./App.css";

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function isAuthenticated() {
  return !!localStorage.getItem("manod_token");
}

// ─── Route guards ─────────────────────────────────────────────────────────────

// 1. Not logged in → go to /login
//    Logged in but no subscription → go to /subscribe
//    (Order: Signup/Login → Subscribe → App)
function PrivateRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isSubscriptionActive()) return <Navigate to="/subscribe" replace />;
  return children;
}

// 2. Already logged in → can't visit /login again
function PublicRoute({ children }) {
  if (!isAuthenticated()) return children;
  return isSubscriptionActive()
    ? <Navigate to="/" replace />
    : <Navigate to="/subscribe" replace />;
}

// 3. Subscribe page — must be logged in. Always accessible (even with an
//    active plan) so users can upgrade/change plans anytime.
function SubscriptionGate({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

// 4. Feature-gated route — blocks direct URL access to features
//    not included in the user's current plan.
function FeatureRoute({ feature, children }) {
  if (!hasFeature(feature)) return <Navigate to="/subscribe" replace />;
  return children;
}

// ─── App layout (sidebar + content) ──────────────────────────────────────────
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
          <Route path="/"                           element={<Dashboard />} />

          {/* User Management */}
          <Route path="/users"                      element={<FeatureRoute feature={FEATURES.USER_MANAGEMENT}><Users /></FeatureRoute>} />
          <Route path="/roles"                      element={<FeatureRoute feature={FEATURES.USER_MANAGEMENT}><Roles /></FeatureRoute>} />
          <Route path="/sales-commission-agents"    element={<FeatureRoute feature={FEATURES.USER_MANAGEMENT}><SalesCommissionAgents /></FeatureRoute>} />

          <Route path="/profile"                    element={<MyProfile />} />
          <Route path="/change-password"            element={<ChangePassword />} />

          {/* Contacts */}
          <Route path="/contacts"                   element={<FeatureRoute feature={FEATURES.CONTACTS}><Contacts /></FeatureRoute>} />
          <Route path="/customer-group"             element={<FeatureRoute feature={FEATURES.CONTACTS}><CustomerGroupsPage /></FeatureRoute>} />
          <Route path="/contacts/import"            element={<FeatureRoute feature={FEATURES.CONTACTS}><ImportContactsPage /></FeatureRoute>} />

          {/* Products */}
          <Route path="/products/"                  element={<FeatureRoute feature={FEATURES.PRODUCTS}><ListProducts /></FeatureRoute>} />
          <Route path="/products/create"            element={<FeatureRoute feature={FEATURES.PRODUCTS}><AddProductPage /></FeatureRoute>} />
          <Route path="/update-product-price"       element={<FeatureRoute feature={FEATURES.PRODUCTS}><UpdatePrice /></FeatureRoute>} />
          <Route path="/labels/show"                element={<FeatureRoute feature={FEATURES.PRODUCTS}><PrintLabels /></FeatureRoute>} />
          <Route path="/variation-templates"        element={<FeatureRoute feature={FEATURES.PRODUCTS}><Variations /></FeatureRoute>} />
          <Route path="/import-products"            element={<FeatureRoute feature={FEATURES.PRODUCTS}><ImportProducts /></FeatureRoute>} />
          <Route path="/import-opening-stock"       element={<FeatureRoute feature={FEATURES.PRODUCTS}><ImportOpeningStock /></FeatureRoute>} />
          <Route path="/selling-price-group"        element={<FeatureRoute feature={FEATURES.PRODUCTS}><SellingPriceGroup /></FeatureRoute>} />
          <Route path="/units"                      element={<FeatureRoute feature={FEATURES.PRODUCTS}><Units /></FeatureRoute>} />
          <Route path="/taxonomies"                 element={<FeatureRoute feature={FEATURES.PRODUCTS}><Categories /></FeatureRoute>} />
          <Route path="/brands"                     element={<FeatureRoute feature={FEATURES.PRODUCTS}><Brands /></FeatureRoute>} />
          <Route path="/warranties"                 element={<FeatureRoute feature={FEATURES.PRODUCTS}><Warranties /></FeatureRoute>} />

          {/* Manufacturing */}
          <Route path="/manufacturing"              element={<FeatureRoute feature={FEATURES.MANUFACTURING}><Manufacturing /></FeatureRoute>} />
          <Route path="/manufacturing/*"            element={<FeatureRoute feature={FEATURES.MANUFACTURING}><Manufacturing /></FeatureRoute>} />

          {/* Purchases */}
          <Route path="/purchases"                  element={<FeatureRoute feature={FEATURES.PURCHASES}><Purchases /></FeatureRoute>} />
          <Route path="/purchases/create"           element={<FeatureRoute feature={FEATURES.PURCHASES}><AddPurchasePage /></FeatureRoute>} />
          <Route path="/purchase-return"            element={<FeatureRoute feature={FEATURES.PURCHASES}><PurchaseReturn /></FeatureRoute>} />
          <Route path="/purchase-return/create"     element={<FeatureRoute feature={FEATURES.PURCHASES}><PurchaseReturn /></FeatureRoute>} />

          {/* Sell */}
          <Route path="/sells"                      element={<FeatureRoute feature={FEATURES.SELL}><AllSales /></FeatureRoute>} />
          <Route path="/sells/create"               element={<FeatureRoute feature={FEATURES.SELL}><AddSale /></FeatureRoute>} />
          <Route path="/pos"                        element={<FeatureRoute feature={FEATURES.POS}><ListPOS /></FeatureRoute>} />
          <Route path="/pos/create"                 element={<FeatureRoute feature={FEATURES.POS}><POSCreate /></FeatureRoute>} />
          <Route path="/sells/drafts"               element={<FeatureRoute feature={FEATURES.SELL}><ListDrafts /></FeatureRoute>} />
          <Route path="/sells/add-draft"            element={<FeatureRoute feature={FEATURES.SELL}><AddDraft /></FeatureRoute>} />
          <Route path="/sells/quotations"           element={<FeatureRoute feature={FEATURES.SELL}><ListQuotations /></FeatureRoute>} />
          <Route path="/sells/add-quotation"        element={<FeatureRoute feature={FEATURES.SELL}><AddQuotation /></FeatureRoute>} />
          <Route path="/sell-return"                element={<FeatureRoute feature={FEATURES.SELL}><SellReturn /></FeatureRoute>} />
          <Route path="/shipments"                  element={<FeatureRoute feature={FEATURES.SELL}><Shipments /></FeatureRoute>} />
          <Route path="/discount"                   element={<FeatureRoute feature={FEATURES.SELL}><Discounts /></FeatureRoute>} />
          <Route path="/import-sales"               element={<FeatureRoute feature={FEATURES.SELL}><ImportSales /></FeatureRoute>} />

          {/* Stock Transfers */}
          <Route path="/stock-transfers"            element={<FeatureRoute feature={FEATURES.STOCK_TRANSFERS}><ListStockTransfers /></FeatureRoute>} />
          <Route path="/stock-transfers/create"     element={<FeatureRoute feature={FEATURES.STOCK_TRANSFERS}><AddStockTransfer /></FeatureRoute>} />

          {/* Stock Adjustment */}
          <Route path="/stock-adjustments"          element={<FeatureRoute feature={FEATURES.STOCK_ADJUSTMENT}><ListStockAdjustments /></FeatureRoute>} />
          <Route path="/stock-adjustments/create"   element={<FeatureRoute feature={FEATURES.STOCK_ADJUSTMENT}><AddStockAdjustment /></FeatureRoute>} />

          {/* Expenses */}
          <Route path="/expenses"                   element={<FeatureRoute feature={FEATURES.EXPENSES}><ListExpenses /></FeatureRoute>} />
          <Route path="/expenses/create"            element={<FeatureRoute feature={FEATURES.EXPENSES}><AddExpense /></FeatureRoute>} />
          <Route path="/import-expenses"            element={<FeatureRoute feature={FEATURES.EXPENSES}><ImportExpenses /></FeatureRoute>} />
          <Route path="/expense-categories"         element={<FeatureRoute feature={FEATURES.EXPENSES}><ExpenseCategories /></FeatureRoute>} />

          <Route path="/notifications"              element={<FeatureRoute feature={FEATURES.NOTIFICATIONS}><NotificationTemplates /></FeatureRoute>} />

          {/* CRM / HRM / Essentials */}
          <Route path="/crm/*"                      element={<FeatureRoute feature={FEATURES.CRM}><CRMRoutes /></FeatureRoute>} />
          <Route path="/hrm/*"                      element={<FeatureRoute feature={FEATURES.HRM}><HRMRoutes /></FeatureRoute>} />
          <Route path="/essentials/*"               element={<FeatureRoute feature={FEATURES.ESSENTIALS}><EssentialsRoutes /></FeatureRoute>} />

          {/* Settings */}
          <Route path="/settings"                   element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="business" /></FeatureRoute>} />
          <Route path="/settings/business"          element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="business" /></FeatureRoute>} />
          <Route path="/settings/tax-rates"         element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="taxrates" /></FeatureRoute>} />
          <Route path="/settings/payment-methods"   element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="locations" /></FeatureRoute>} />
          <Route path="/settings/account"           element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="business" /></FeatureRoute>} />
          <Route path="/settings/barcode"           element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="barcode" /></FeatureRoute>} />
          <Route path="/settings/receipt-printer"   element={<FeatureRoute feature={FEATURES.SETTINGS}><Settings defaultTab="printers" /></FeatureRoute>} />

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

          {/* Production Planning */}
          <Route path="/production-planning"          element={<FeatureRoute feature={FEATURES.PRODUCTION_PLANNING}><ProductionPlanning /></FeatureRoute>} />
          <Route path="/production-planning/*"        element={<FeatureRoute feature={FEATURES.PRODUCTION_PLANNING}><ProductionPlanning /></FeatureRoute>} />
        </Routes>
      </main>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Step 1: Login / Signup */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Step 2: Subscribe (pick a plan) — shown right after login */}
          <Route
            path="/subscribe"
            element={
              <SubscriptionGate>
                <Subscription />
              </SubscriptionGate>
            }
          />

          {/* Step 3: App — requires login + active subscription.
              Individual routes are further gated by plan via FeatureRoute. */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
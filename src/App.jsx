import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// ── New pages from header ──
import MyProfile      from "./pages/MyProfile";
import ChangePassword from "./pages/ChangePassword";

// ── Auth ──
import Login from "./pages/Login";

import "./App.css";

function isAuthenticated() {
  return !!localStorage.getItem("manod_token");
}
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}
function PublicRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
}

function AppLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <TopHeader businessName="Manodtechnologies" />
      <main style={{ marginLeft: "255px", marginTop: "48px", flex: 1, minHeight: "calc(100vh - 48px)", background: "#f0f4f1", padding: "24px 32px" }}>
        <Routes>
          <Route path="/"                           element={<Dashboard />} />
          <Route path="/users"                      element={<Users />} />
          <Route path="/roles"                      element={<Roles />} />
          <Route path="/sales-commission-agents"    element={<SalesCommissionAgents />} />

          {/* ── Profile & Password (header dropdown) ── */}
          <Route path="/profile"                    element={<MyProfile />} />
          <Route path="/change-password"            element={<ChangePassword />} />

          {/* ── Contacts ── */}
          <Route path="/contacts"                   element={<Contacts />} />
          <Route path="/customer-group"             element={<CustomerGroupsPage />} />
          <Route path="/contacts/import"            element={<ImportContactsPage />} />

          {/* ── Products ── */}
          <Route path="/products/"                  element={<ListProducts />} />
          <Route path="/products/create"            element={<AddProductPage />} />
          <Route path="/update-product-price"       element={<UpdatePrice />} />
          <Route path="/labels/show"                element={<PrintLabels />} />
          <Route path="/variation-templates"        element={<Variations />} />
          <Route path="/import-products"            element={<ImportProducts />} />
          <Route path="/import-opening-stock"       element={<ImportOpeningStock />} />
          <Route path="/selling-price-group"        element={<SellingPriceGroup />} />
          <Route path="/units"                      element={<Units />} />
          <Route path="/taxonomies"                 element={<Categories />} />
          <Route path="/brands"                     element={<Brands />} />
          <Route path="/warranties"                 element={<Warranties />} />

          {/* ── Manufacturing ── */}
          <Route path="/manufacturing"              element={<Manufacturing />} />
          <Route path="/manufacturing/*"            element={<Manufacturing />} />

          {/* ── Purchases ── */}
          <Route path="/purchases"                  element={<Purchases />} />
          <Route path="/purchases/create"           element={<AddPurchasePage />} />
          <Route path="/purchase-return"            element={<PurchaseReturn />} />
          <Route path="/purchase-return/create"     element={<PurchaseReturn />} />

          {/* ── Sell ── */}
          <Route path="/sells"                      element={<AllSales />} />
          <Route path="/sells/create"               element={<AddSale />} />
          <Route path="/pos"                        element={<ListPOS />} />
          <Route path="/pos/create"                 element={<POSCreate />} />
          <Route path="/sells/drafts"               element={<ListDrafts />} />
          <Route path="/sells/add-draft"            element={<AddDraft />} />
          <Route path="/sells/quotations"           element={<ListQuotations />} />
          <Route path="/sells/add-quotation"        element={<AddQuotation />} />
          <Route path="/sell-return"                element={<SellReturn />} />
          <Route path="/shipments"                  element={<Shipments />} />
          <Route path="/discount"                   element={<Discounts />} />
          <Route path="/import-sales"               element={<ImportSales />} />

          {/* ── Stock ── */}
          <Route path="/stock-transfers"            element={<ListStockTransfers />} />
          <Route path="/stock-transfers/create"     element={<AddStockTransfer />} />
          <Route path="/stock-adjustments"          element={<ListStockAdjustments />} />
          <Route path="/stock-adjustments/create"   element={<AddStockAdjustment />} />

          {/* ── Expenses ── */}
          <Route path="/expenses"                   element={<ListExpenses />} />
          <Route path="/expenses/create"            element={<AddExpense />} />
          <Route path="/import-expenses"            element={<ImportExpenses />} />
          <Route path="/expense-categories"         element={<ExpenseCategories />} />

          {/* ── Misc ── */}
          <Route path="/notifications"              element={<NotificationTemplates />} />
          <Route path="/crm/*"                      element={<CRMRoutes />} />
          <Route path="/hrm/*"                      element={<HRMRoutes />} />
          <Route path="/essentials/*"               element={<EssentialsRoutes />} />

          {/* ── Settings ── */}
          <Route path="/settings"                   element={<Settings defaultTab="business" />} />
          <Route path="/settings/business"          element={<Settings defaultTab="business" />} />
          <Route path="/settings/tax-rates"         element={<Settings defaultTab="taxrates" />} />
          <Route path="/settings/payment-methods"   element={<Settings defaultTab="locations" />} />
          <Route path="/settings/account"           element={<Settings defaultTab="business" />} />
          <Route path="/settings/barcode"           element={<Settings defaultTab="barcode" />} />
          <Route path="/settings/receipt-printer"   element={<Settings defaultTab="printers" />} />

          {/* ── Reports ── */}
          <Route path="/reports"                      element={<ProfitLossReport />} />
          <Route path="/reports/profit-loss"          element={<ProfitLossReport />} />
          <Route path="/reports/purchase-sale"        element={<PurchaseSaleReport />} />
          <Route path="/reports/tax"                  element={<TaxReport />} />
          <Route path="/reports/supplier-customer"    element={<SupplierCustomerReport />} />
          <Route path="/reports/customer-groups"      element={<CustomerGroupsReport />} />
          <Route path="/reports/stock"                element={<StockReport />} />
          <Route path="/reports/stock-adjustment"     element={<StockAdjustmentReport />} />
          <Route path="/reports/trending-products"    element={<TrendingProductsReport />} />
          <Route path="/reports/items"                element={<ItemsReport />} />
          <Route path="/reports/product-purchase"     element={<ProductPurchaseReport />} />
          <Route path="/reports/product-sell"         element={<ProductSellReport />} />
          <Route path="/reports/purchase-payment"     element={<PurchasePaymentReport />} />
          <Route path="/reports/sell-payment"         element={<SellPaymentReport />} />
          <Route path="/reports/expense"              element={<ExpenseReport />} />
          <Route path="/reports/register"             element={<RegisterReport />} />
          <Route path="/reports/sales-representative" element={<SalesRepresentativeReport />} />
          <Route path="/reports/activity-log"         element={<ActivityLogReport />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/*"     element={<PrivateRoute><AppLayout /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
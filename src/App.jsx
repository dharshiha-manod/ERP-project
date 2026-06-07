import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
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
import Contacts, {
  SuppliersPage,
  CustomersPage,
  CustomerGroupsPage,
  ImportContactsPage,
} from "./pages/Contacts";

// Sell module
import {
  AllSales,
  AddSale,
  ListPOS,
  POSCreate,
  AddDraft,
  ListDrafts,
  AddQuotation,
  ListQuotations,
  SellReturn,
  Shipments,
  Discounts,
  ImportSales,
} from "./pages/Sell";

// Stock Transfers module
import { ListStockTransfers, AddStockTransfer } from "./pages/StockTransfers";

// Stock Adjustments module
import { ListStockAdjustments, AddStockAdjustment } from "./pages/StockAdjustments";

// Expenses module
import { ListExpenses, AddExpense, ImportExpenses, ExpenseCategories } from "./pages/Expenses";

// Notification Templates
import NotificationTemplates from "./pages/NotificationTemplates";

// HRM module
import { HRMRoutes, EssentialsRoutes } from "./pages/HRM";

// CRM module
import { CRMRoutes } from "./pages/CRM";

// ── Settings ──────────────────────────────────────────────────────────────────
import Settings from "./pages/Settings";

// ── Reports — import all 17 named exports + default ──────────────────────────
import Reports, {
  ProfitLossReport,
  PurchaseSaleReport,
  TaxReport,
  SupplierCustomerReport,
  CustomerGroupsReport,
  StockReport,
  StockAdjustmentReport,
  TrendingProductsReport,
  ItemsReport,
  ProductPurchaseReport,
  ProductSellReport,
  PurchasePaymentReport,
  SellPaymentReport,
  ExpenseReport,
  RegisterReport,
  SalesRepresentativeReport,
  ActivityLogReport,
} from "./pages/Reports";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main
          style={{
            marginLeft: "255px",
            flex: 1,
            minHeight: "100vh",
            background: "#f0f4f1",
            padding: "0",
          }}
        >
          <Routes>
            {/* ── Core ── */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/sales-commission-agents" element={<SalesCommissionAgents />} />

            {/* ── Contacts ── */}
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/customer-group" element={<CustomerGroupsPage />} />
            <Route path="/contacts/import" element={<ImportContactsPage />} />

            {/* ── Products ── */}
            <Route path="/products/" element={<ListProducts />} />
            <Route path="/products/create" element={<AddProductPage />} />
            <Route path="/update-product-price" element={<UpdatePrice />} />
            <Route path="/labels/show" element={<PrintLabels />} />
            <Route path="/variation-templates" element={<Variations />} />
            <Route path="/import-products" element={<ImportProducts />} />
            <Route path="/import-opening-stock" element={<ImportOpeningStock />} />
            <Route path="/selling-price-group" element={<SellingPriceGroup />} />
            <Route path="/units" element={<Units />} />
            <Route path="/taxonomies" element={<Categories />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/warranties" element={<Warranties />} />

            {/* ── Manufacturing ── */}
            <Route path="/manufacturing" element={<Manufacturing />} />
            <Route path="/manufacturing/*" element={<Manufacturing />} />

            {/* ── Purchases ── */}
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/create" element={<AddPurchasePage />} />
            <Route path="/purchase-return" element={<PurchaseReturn />} />
            <Route path="/purchase-return/create" element={<PurchaseReturn />} />

            {/* ── Sell ── */}
            <Route path="/sells" element={<AllSales />} />
            <Route path="/sells/create" element={<AddSale />} />
            <Route path="/pos" element={<ListPOS />} />
            <Route path="/pos/create" element={<POSCreate />} />
            <Route path="/sells/drafts" element={<ListDrafts />} />
            <Route path="/sells/add-draft" element={<AddDraft />} />
            <Route path="/sells/quotations" element={<ListQuotations />} />
            <Route path="/sells/add-quotation" element={<AddQuotation />} />
            <Route path="/sell-return" element={<SellReturn />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/discount" element={<Discounts />} />
            <Route path="/import-sales" element={<ImportSales />} />

            {/* ── Stock Transfers ── */}
            <Route path="/stock-transfers" element={<ListStockTransfers />} />
            <Route path="/stock-transfers/create" element={<AddStockTransfer />} />

            {/* ── Stock Adjustments ── */}
            <Route path="/stock-adjustments" element={<ListStockAdjustments />} />
            <Route path="/stock-adjustments/create" element={<AddStockAdjustment />} />

            {/* ── Expenses ── */}
            <Route path="/expenses" element={<ListExpenses />} />
            <Route path="/expenses/create" element={<AddExpense />} />
            <Route path="/import-expenses" element={<ImportExpenses />} />
            <Route path="/expense-categories" element={<ExpenseCategories />} />

            {/* ── Notification Templates ── */}
            <Route path="/notifications" element={<NotificationTemplates />} />

            {/* ── CRM ── */}
            <Route path="/crm/*" element={<CRMRoutes />} />

            {/* ── HRM ── */}
            <Route path="/hrm/*" element={<HRMRoutes />} />

            {/* ── Essentials ── */}
            <Route path="/essentials/*" element={<EssentialsRoutes />} />

            {/* ══════════════════════════════════════════════════════════════
                SETTINGS — all sub-routes map to Settings with a defaultTab prop
                Paths must match Sidebar.jsx children paths exactly
                ══════════════════════════════════════════════════════════════ */}
            <Route path="/settings"                       element={<Settings defaultTab="business" />} />
            <Route path="/settings/business"              element={<Settings defaultTab="business" />} />
            <Route path="/settings/tax-rates"             element={<Settings defaultTab="taxrates" />} />
            <Route path="/settings/payment-methods"       element={<Settings defaultTab="locations" />} />
            <Route path="/settings/account"               element={<Settings defaultTab="business" />} />
            <Route path="/settings/barcode"               element={<Settings defaultTab="barcode" />} />
            <Route path="/settings/receipt-printer"       element={<Settings defaultTab="printers" />} />

            {/* ══════════════════════════════════════════════════════════════
                REPORTS — all 17 child routes as top-level flat routes
                NOTE: paths here must match Sidebar.jsx children paths exactly
                ══════════════════════════════════════════════════════════════ */}
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
    </BrowserRouter>
  );
}

export default App;
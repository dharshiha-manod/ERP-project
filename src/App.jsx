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

// Essentials module — single component handles all sub-tabs
import Essentials from "./pages/Essentials";

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
            padding: "24px",
          }}
        >
          <Routes>
            {/* Core */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/sales-commission-agents" element={<SalesCommissionAgents />} />

            {/* Contacts */}
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/customer-group" element={<CustomerGroupsPage />} />
            <Route path="/contacts/import" element={<ImportContactsPage />} />

            {/* Products */}
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

            {/* Manufacturing */}
            <Route path="/manufacturing" element={<Manufacturing />} />
            <Route path="/manufacturing/*" element={<Manufacturing />} />

            {/* Purchases */}
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/create" element={<AddPurchasePage />} />
            <Route path="/purchase-return" element={<PurchaseReturn />} />
            <Route path="/purchase-return/create" element={<PurchaseReturn />} />

            {/* Sell */}
            <Route path="/sells" element={<AllSales />} />
            <Route path="/sells/create" element={<AddSale />} />

            {/* POS */}
            <Route path="/pos" element={<ListPOS />} />
            <Route path="/pos/create" element={<POSCreate />} />

            {/* Drafts */}
            <Route path="/sells/drafts" element={<ListDrafts />} />
            <Route path="/sells/add-draft" element={<AddDraft />} />

            {/* Quotations */}
            <Route path="/sells/quotations" element={<ListQuotations />} />
            <Route path="/sells/add-quotation" element={<AddQuotation />} />

            {/* Sell Return */}
            <Route path="/sell-return" element={<SellReturn />} />

            {/* Shipments */}
            <Route path="/shipments" element={<Shipments />} />

            {/* Discounts */}
            <Route path="/discount" element={<Discounts />} />

            {/* Import Sales */}
            <Route path="/import-sales" element={<ImportSales />} />

            {/* Stock Transfers */}
            <Route path="/stock-transfers" element={<ListStockTransfers />} />
            <Route path="/stock-transfers/create" element={<AddStockTransfer />} />

            {/* Stock Adjustments */}
            <Route path="/stock-adjustments" element={<ListStockAdjustments />} />
            <Route path="/stock-adjustments/create" element={<AddStockAdjustment />} />

            {/* Expenses */}
            <Route path="/expenses" element={<ListExpenses />} />
            <Route path="/expenses/create" element={<AddExpense />} />
            <Route path="/import-expenses" element={<ImportExpenses />} />
            <Route path="/expense-categories" element={<ExpenseCategories />} />

            {/* Notification Templates */}
            <Route path="/notifications" element={<NotificationTemplates />} />

            {/* ── Essentials (all sub-pages handled by one component via tabs) ── */}
            <Route path="/essentials"                   element={<Essentials />} />
            <Route path="/essentials/todo"              element={<Essentials />} />
            <Route path="/essentials/document"          element={<Essentials />} />
            <Route path="/essentials/memos"             element={<Essentials />} />
            <Route path="/essentials/reminders"         element={<Essentials />} />
            <Route path="/essentials/messages"          element={<Essentials />} />
            <Route path="/essentials/knowledge-base"    element={<Essentials />} />
            <Route path="/essentials/settings"          element={<Essentials />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

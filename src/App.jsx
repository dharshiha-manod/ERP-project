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
import Contacts, { SuppliersPage, CustomersPage, CustomerGroupsPage, ImportContactsPage } from "./pages/Contacts";
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

            {/* Contacts — query param routing handled inside Contacts component */}
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

            {/* Purchase Return */}
            <Route path="/purchase-return" element={<PurchaseReturn />} />
            <Route path="/purchase-return/create" element={<PurchaseReturn />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
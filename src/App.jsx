import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import SalesCommissionAgents from "./pages/SalesCommissionAgents";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{
          marginLeft: "255px",
          flex: 1,
          minHeight: "100vh",
          background: "#f0f4f1",
          padding: "24px",
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/sales-commission-agents" element={<SalesCommissionAgents />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
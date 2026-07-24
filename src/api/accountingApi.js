/**
 * ============================================================
 * src/api/accountingApi.js
 * Frontend API layer for the Accounting & Finance module.
 * Same fetch + Bearer-token pattern as your other *Api.js files
 * (userApi.js, roleApi.js, etc). Drop this into src/api/.
 * ============================================================
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/accounting`
  : "http://localhost:5000/api/accounting";

function authHeaders() {
  const token = localStorage.getItem("manod_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

const get = (path, params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
  const qs = new URLSearchParams(cleanParams).toString();
  return fetch(`${API_BASE}${path}${qs ? `?${qs}` : ""}`, { headers: authHeaders() }).then(handle);
};
const post = (path, body) =>
  fetch(`${API_BASE}${path}`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }).then(handle);
const patch = (path, body = {}) =>
  fetch(`${API_BASE}${path}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(body) }).then(handle);
const del = (path) =>
  fetch(`${API_BASE}${path}`, { method: "DELETE", headers: authHeaders() }).then(handle);

// Dashboard
export const fetchDashboard = () => get("/dashboard");

// AR / AP
export const fetchReceivables = (params) => get("/receivables", params);
export const fetchPayables = (params) => get("/payables", params);

// Cash & Bank
export const fetchBankAccounts = () => get("/bank-accounts");
export const createBankAccount = (data) => post("/bank-accounts", data);
export const fetchBankTransactions = (params = {}) => get("/bank-transactions", typeof params === "object" ? params : { limit: params });
export const createBankTransaction = (data) => post("/bank-transactions", data);
export const updateBankTransaction = (id, data) =>
  fetch(`${API_BASE}/bank-transactions/${id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(data) }).then(handle);
export const deleteBankTransaction = (id) =>
  fetch(`${API_BASE}/bank-transactions/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);
export const reconcileBankTransaction = (id) => patch(`/bank-transactions/${id}/reconcile`);
export const fetchBankAccountLedger = (id, params = {}) => get(`/bank-accounts/${id}/ledger`, params);
export const fetchBankStatement = (id, params = {}) => get(`/bank-accounts/${id}/statement`, params);
export const fetchCashBankSummary = () => get("/cash-bank-summary");

// GST & Tax
export const fetchGST = () => get("/gst");
export const fetchGSTLedger = () => get("/gst/ledger");
export const fetchGSTTrend = () => get("/gst/trend");
export const fetchGSTSettings = () => get("/gst/settings");
export const updateGSTSettings = (data) => patch("/gst/settings", data);
export const fetchGSTHSNSummary = () => get("/gst/hsn-summary");
export const fetchGSTByState = () => get("/gst/by-state");  

// Fixed Assets
export const fetchFixedAssets = () => get("/fixed-assets");
export const createFixedAsset = (data) => post("/fixed-assets", data);
export const updateFixedAsset = async (id, data) => {
  const res = await fetch(`${API_BASE}/fixed-assets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('manod_token')}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchAssetDepreciationLog = async (id) => {
  const res = await fetch(`${API_BASE}/fixed-assets/${id}/depreciation-log`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('manod_token')}`,
    },
  });
  return res.json();
};
export const disposeFixedAsset = (id) => patch(`/fixed-assets/${id}/dispose`);
export const deleteFixedAsset = (id) => del(`/fixed-assets/${id}`);
export const postMonthlyDepreciation = () => post("/fixed-assets/post-depreciation");

// Cost Centers & Costing
export const fetchCostCenters = () => get("/cost-centers");
export const createCostCenter = (data) => post("/cost-centers", data);
export const updateCostCenter = (id, data) =>
  fetch(`${API_BASE}/cost-centers/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then(handle);
export const deleteCostCenter = (id) => del(`/cost-centers/${id}`);
export const fetchExpenseLocations = () => get("/expense-locations");
export const fetchProductCosting = () => get("/product-costing");

// Budgets & Expense Requests
export const fetchBudgets = () => get("/budgets");
export const createBudget = (data) => post("/budgets", data);
export const fetchExpenseRequests = () => get("/expense-requests");

// Expense Categories live on the Expense module, not Accounting —
// GET /api/expenses/categories returns { success, categories: [...] }
const EXPENSES_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/expenses`
  : "http://localhost:5000/api/expenses";

export const fetchExpenseCategories = async () => {
  const res = await fetch(`${EXPENSES_BASE}/categories`, { headers: authHeaders() });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return { data: json.categories || [] };
};

// Chart of Accounts & General Ledger
export const fetchChartOfAccounts = () => get("/chart-of-accounts");
export const fetchJournalEntries = (limit = 30) => get("/journal-entries", { limit });
export const createJournalEntry = (data) => post("/journal-entries", data);
export const deleteJournalEntry = (id) => del(`/journal-entries/${id}`);

// Trial Balance
export const fetchTrialBalance = () => get("/statements/trial-balance");

// Financial Statements
export const fetchProfitAndLoss = (params) => get("/statements/pl", params);
export const fetchBalanceSheet = () => get("/statements/balance-sheet");
export const fetchCashFlow = () => get("/statements/cash-flow");
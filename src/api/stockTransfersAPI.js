// ====================================================
// STOCK TRANSFER API - connects to backend
// Handles token expiry + all CRUD
// Mirrors the style of api/userApi.js exactly
// ====================================================

const BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("manod_token");

// If token expired → clear storage → redirect to login
const handleUnauthorized = () => {
  localStorage.removeItem("manod_token");
  localStorage.removeItem("manod_user");
  window.location.href = "/login";
};

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired. Please login again.");
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// GET all stock transfers (paginated + filtered)
// params: { page, limit, search, status, location_from, location_to, date_from, date_to }
export const fetchAllStockTransfers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/stock-transfers?${query}`, { headers: headers() });
  const data = await handleResponse(res);
  return data; // { success, total, page, limit, pages, stockTransfers }
};

// GET stock transfer by ID (with items)
export const fetchStockTransferById = async (id) => {
  const res = await fetch(`${BASE_URL}/stock-transfers/${id}`, { headers: headers() });
  const data = await handleResponse(res);
  return data.stockTransfer;
};

// POST create stock transfer
export const createStockTransfer = async (transferData) => {
  const res = await fetch(`${BASE_URL}/stock-transfers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(transferData),
  });
  const data = await handleResponse(res);
  return data.stockTransfer;
};

// PUT update stock transfer
export const updateStockTransfer = async (id, transferData) => {
  const res = await fetch(`${BASE_URL}/stock-transfers/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(transferData),
  });
  const data = await handleResponse(res);
  return data.stockTransfer;
};

// DELETE stock transfer
export const deleteStockTransfer = async (id) => {
  const res = await fetch(`${BASE_URL}/stock-transfers/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handleResponse(res);
};

// GET dashboard stats
export const fetchStockTransferStats = async () => {
  const res = await fetch(`${BASE_URL}/stock-transfers/stats`, { headers: headers() });
  const data = await handleResponse(res);
  return data.stats;
};

// GET products dropdown (for the Add/Edit item search field)
export const fetchProductsForTransfer = async () => {
  const res = await fetch(`${BASE_URL}/stock-transfers/products`, { headers: headers() });
  const data = await handleResponse(res);
  return data.products;
};
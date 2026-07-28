/**
 * ====================================================
 * src/api/reportsAPI.js
 *
 * Follows the exact pattern of purchaseAPI.js.
 * Each function maps 1:1 to a report tab in Reports.jsx.
 * Endpoints not yet built on the backend are commented
 * as TODO and Reports.jsx should keep them wired for
 * whenever we add them in a later batch.
 * ====================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('manod_token') || ''}`,
});

const request = async (method, path, body = null) => {
  const options = { method, headers: authHeaders() };
  if (body !== null) options.body = JSON.stringify(body);
  const res  = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Request failed with status ${res.status}`);
  return data;
};

const buildQuery = (params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
};

// ── STOCK REPORT ─────────────────────────────────────────────────────────────
const getStockReport = (params = {}) => request('GET', `/reports/stock${buildQuery(params)}`);

// ── STOCK ADJUSTMENT REPORT ──────────────────────────────────────────────────
const getStockAdjustmentReport = (params = {}) =>
  request('GET', `/reports/stock-adjustment${buildQuery(params)}`);

// ── ITEMS REPORT ──────────────────────────────────────────────────────────────
const getItemsReport = (params = {}) => request('GET', `/reports/items${buildQuery(params)}`);

// ── PRODUCT PURCHASE REPORT ──────────────────────────────────────────────────
const getProductPurchaseReport = (params = {}) =>
  request('GET', `/reports/product-purchase${buildQuery(params)}`);

// ── PRODUCT SELL REPORT ──────────────────────────────────────────────────────
const getProductSellReport = (params = {}) =>
  request('GET', `/reports/product-sell${buildQuery(params)}`);

// ── EXPENSE REPORT ────────────────────────────────────────────────────────────
const getExpenseReport = (params = {}) => request('GET', `/reports/expense${buildQuery(params)}`);

// ── SALES REPRESENTATIVE REPORT ──────────────────────────────────────────────
const getSalesRepresentativeReport = (params = {}) =>
  request('GET', `/reports/sales-representative${buildQuery(params)}`);

// ── PURCHASE PAYMENT REPORT ───────────────────────────────────────────────────
const getPurchasePaymentReport = (params = {}) =>
  request('GET', `/reports/purchase-payment${buildQuery(params)}`);

// ── SELL PAYMENT REPORT ───────────────────────────────────────────────────────
const getSellPaymentReport = (params = {}) =>
  request('GET', `/reports/sell-payment${buildQuery(params)}`);

// ── PROFIT / LOSS REPORT ──────────────────────────────────────────────────────
const getProfitLossReport = (params = {}) => request('GET', `/reports/profit-loss${buildQuery(params)}`);

// ── TAX REPORT ────────────────────────────────────────────────────────────
const getTaxReport = (params = {}) => request('GET', `/reports/tax${buildQuery(params)}`);

// ── TRENDING PRODUCTS REPORT ─────────────────────────────────────────────
const getTrendingProductsReport = (params = {}) => request('GET', `/reports/trending-products${buildQuery(params)}`);

// ── SUPPLIER & CUSTOMER REPORT ───────────────────────────────────────────
const getSupplierCustomerReport = (params = {}) => request('GET', `/reports/supplier-customer${buildQuery(params)}`);

// ── SEND LEDGER ───────────────────────────────────────────────────────────
const sendLedger = (contactId) => request('POST', `/reports/send-ledger/${contactId}`);

// ── CUSTOMER GROUPS REPORT ───────────────────────────────────────────────
const getCustomerGroupsReport = (params = {}) => request('GET', `/reports/customer-groups${buildQuery(params)}`);

// ── PURCHASE & SALE REPORT ───────────────────────────────────────────────
const getPurchaseSaleReport = (params = {}) => request('GET', `/reports/purchase-sale${buildQuery(params)}`);

// ── ACTIVITY LOG REPORT ──────────────────────────────────────────────────────
const getActivityLogReport = (params = {}) => request('GET', `/reports/activity-log${buildQuery(params)}`);

// ── REGISTER REPORT ───────────────────────────────────────────────────────
const getRegisterReport = (params = {}) => request('GET', `/reports/register${buildQuery(params)}`);

// ── LOCATION-WISE STOCK REPORT ────────────────────────────────────────────
const getLocationWiseStockReport = (params = {}) =>
  request('GET', `/reports/location-wise-stock${buildQuery(params)}`);

const reportsAPI = {
  getStockReport,
  getStockAdjustmentReport,
  getItemsReport,
  getProductPurchaseReport,
  getProductSellReport,
  getExpenseReport,
  getSalesRepresentativeReport,
  getPurchasePaymentReport,
  getSellPaymentReport,
 getProfitLossReport,
 getTaxReport,
 getTrendingProductsReport,
getSupplierCustomerReport,
  sendLedger,
  getCustomerGroupsReport,
  getPurchaseSaleReport,
 getActivityLogReport,
  getRegisterReport,
  getLocationWiseStockReport,
};

export default reportsAPI;
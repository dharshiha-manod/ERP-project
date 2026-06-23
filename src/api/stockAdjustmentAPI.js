/**
 * ============================================================
 * src/api/stockAdjustmentAPI.js
 * All HTTP calls for the Stock Adjustment module.
 * Mirrors the style of stockTransfersAPI.js exactly.
 * Base URL is read from VITE_API_URL (set in .env).
 * ============================================================
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getHeaders() {
  const token = localStorage.getItem('manod_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

// ── LIST  (with filters + pagination) ────────────────────────────────────────
export const fetchStockAdjustments = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return request('GET', `/stock-adjustments${qs ? '?' + qs : ''}`);
};

// ── SINGLE ────────────────────────────────────────────────────────────────────
export const fetchStockAdjustmentById = (id) =>
  request('GET', `/stock-adjustments/${id}`);

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createStockAdjustment = (body) =>
  request('POST', '/stock-adjustments', body);

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateStockAdjustment = (id, body) =>
  request('PUT', `/stock-adjustments/${id}`, body);

// ── APPROVE (Draft/Pending → Completed + stock deducted) ─────────────────────
export const approveStockAdjustment = (id) =>
  request('PATCH', `/stock-adjustments/${id}/approve`);

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteStockAdjustment = (id) =>
  request('DELETE', `/stock-adjustments/${id}`);

// ── STATS ─────────────────────────────────────────────────────────────────────
export const fetchAdjustmentStats = () =>
  request('GET', '/stock-adjustments/stats');

// ── PRODUCTS SEARCH (for line-item picker) ────────────────────────────────────
export const searchProducts = (search = '') =>
  request('GET', `/stock-adjustments/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);

// ── LOCATIONS DROPDOWN ────────────────────────────────────────────────────────
export const fetchLocations = () =>
  request('GET', '/stock-adjustments/locations');

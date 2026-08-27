/**
 * ====================================================
 * src/api/purchaseAPI.js  (FIXED v3)
 *
 * - getSuppliers() now uses /api/contacts?contactType=Suppliers
 *   (the existing working endpoint — no new backend needed)
 * - searchProducts() calls /api/purchases/products/search
 * ====================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const authHeaders = () => {
  const token = localStorage.getItem('manod_token');
  // Only meaningful for admins (who can switch workspaces). For non-admin
  // users this will be empty/stale and is fine to omit — the backend
  // ignores this header for them and scopes every request to their own
  // users.industry_id instead (see middleware/industry.js).
  const industryId = localStorage.getItem('manod_active_industry_id');  
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(industryId ? { 'X-Industry-Id': industryId } : {}),
  };
};

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

// ── PURCHASE ENDPOINTS ───────────────────────────────────────────────────────
const getAll      = (params = {}) => request('GET', `/purchases${buildQuery(params)}`);
const getById     = (id)          => request('GET', `/purchases/${id}`);
const create      = (body)        => request('POST', '/purchases', body);
const update      = (id, body)    => request('PUT', `/purchases/${id}`, body);
const remove      = (id)          => request('DELETE', `/purchases/${id}`);
const addPayment  = (pid, body)   => request('POST', `/purchases/${pid}/payments`, body);
const deletePayment = (pid, payId)=> request('DELETE', `/purchases/${pid}/payments/${payId}`);
const getStats    = ()            => request('GET', '/purchases/stats');

// ── SUPPLIERS — uses existing /api/contacts endpoint ────────────────────────
const getSuppliers = async () => {
  // Uses the existing working contacts endpoint
  const data = await request('GET', `/contacts${buildQuery({ contactType: 'Suppliers', limit: 500 })}`);
  // contacts endpoint returns { success, total, contacts: [...] }
  const list = data.contacts || [];
  return {
    success: true,
    suppliers: list.map(c => ({
      id:     c.id,
      name:   c.name || c.business_name || '—',
      mobile: c.mobile || '',
      email:  c.email  || '',
    })),
  };
};

// ── PRODUCT SEARCH — calls /api/purchases/products/search ───────────────────
const searchProducts = (query = '') =>
  request('GET', `/purchases/products/search${buildQuery({ q: query })}`);

const purchaseAPI = {
  getAll, getById, create, update, remove,
  addPayment, deletePayment, getStats,
  getSuppliers, searchProducts,
};

export default purchaseAPI;
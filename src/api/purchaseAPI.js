/**
 * ====================================================
 * src/services/purchaseAPI.js
 *
 * Single source of truth for all Purchase API calls.
 * Import this wherever you need to talk to the backend:
 *
 *   import purchaseAPI from '../services/purchaseAPI';
 *
 * Uses the same auth token pattern as the rest of the app.
 * ====================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── AUTH HEADER ──────────────────────────────────────────────────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('manod_token') || ''}`,
});

// ── GENERIC REQUEST HELPER ───────────────────────────────────────────────────
const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: authHeaders(),
  };
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  return data;
};

// ── BUILD QUERY STRING ───────────────────────────────────────────────────────
const buildQuery = (params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
};

// ── PURCHASE ENDPOINTS ───────────────────────────────────────────────────────

/**
 * List purchases with optional filters + pagination.
 * @param {object} params  { page, limit, search, supplier_id, purchase_status,
 *                           payment_status, date_from, date_to, location }
 * @returns {{ success, total, page, limit, pages, purchases }}
 */
const getAll = (params = {}) =>
  request('GET', `/purchases${buildQuery(params)}`);

/**
 * Get a single purchase by id — includes items[] and payments[].
 * @param {number|string} id
 * @returns {{ success, purchase }}
 */
const getById = (id) =>
  request('GET', `/purchases/${id}`);

/**
 * Create a new purchase.
 * @param {object} body
 *   Required: purchase_status, items[]
 *   Optional: supplier_id, reference_no, invoice_no, location, purchase_date,
 *             discount_type, discount_amount, tax_label, shipping_charges,
 *             notes, shipping_details, pay_term,
 *             payment_amount, payment_method, payment_note, payment_date
 * @returns {{ success, message, purchase }}
 */
const create = (body) =>
  request('POST', '/purchases', body);

/**
 * Update an existing purchase.
 * @param {number|string} id
 * @param {object} body  Any subset of purchase fields; items[] replaces all items if provided.
 * @returns {{ success, message, purchase }}
 */
const update = (id, body) =>
  request('PUT', `/purchases/${id}`, body);

/**
 * Delete a purchase (cascades items + payments).
 * @param {number|string} id
 * @returns {{ success, message, deleted }}
 */
const remove = (id) =>
  request('DELETE', `/purchases/${id}`);

/**
 * Add a payment to a purchase.
 * @param {number|string} purchaseId
 * @param {object} body  { amount, payment_method, paid_on, note }
 * @returns {{ success, message, payment }}
 */
const addPayment = (purchaseId, body) =>
  request('POST', `/purchases/${purchaseId}/payments`, body);

/**
 * Delete a specific payment from a purchase.
 * @param {number|string} purchaseId
 * @param {number|string} paymentId
 * @returns {{ success, message, deleted }}
 */
const deletePayment = (purchaseId, paymentId) =>
  request('DELETE', `/purchases/${purchaseId}/payments/${paymentId}`);

/**
 * Dashboard summary totals.
 * @returns {{ success, stats: { total_purchases, total_value, total_paid, total_due, ... } }}
 */
const getStats = () =>
  request('GET', '/purchases/stats');

/**
 * Supplier list for the Add/Edit form dropdown.
 * @returns {{ success, suppliers: [{ id, name, contact_id, mobile, email, address }] }}
 */
const getSuppliers = () =>
  request('GET', '/purchases/suppliers');

// ── EXPORT ───────────────────────────────────────────────────────────────────
const purchaseAPI = {
  getAll,
  getById,
  create,
  update,
  remove,
  addPayment,
  deletePayment,
  getStats,
  getSuppliers,
};

export default purchaseAPI;

/**
 * ── USAGE EXAMPLES ───────────────────────────────────────────────────────────
 *
 * // 1. Load the purchase list in a component
 * const { purchases, total } = await purchaseAPI.getAll({
 *   page: 1, limit: 25, search: 'PO-0001'
 * });
 *
 * // 2. Create a purchase (matches your existing AddPurchasePage form shape)
 * await purchaseAPI.create({
 *   supplier_id:      42,
 *   purchase_status:  'Ordered',
 *   location:         'Manodtechnologies (BL0001)',
 *   discount_type:    'None',
 *   discount_amount:  0,
 *   tax_label:        'GST 18%',
 *   shipping_charges: 150,
 *   notes:            'Urgent order',
 *   payment_amount:   5000,
 *   payment_method:   'UPI',
 *   items: [
 *     { product_name: 'Masala Chai Blend', quantity: 10, unit_cost: 500, discount_pct: 5, margin_pct: 20 },
 *   ],
 * });
 *
 * // 3. Add a payment later
 * await purchaseAPI.addPayment(purchaseId, {
 *   amount: 2000, payment_method: 'Bank Transfer', note: 'Partial payment'
 * });
 *
 * // 4. Edit purchase status
 * await purchaseAPI.update(purchaseId, { purchase_status: 'Received' });
 *
 * // 5. Delete
 * await purchaseAPI.remove(purchaseId);
 * ──────────────────────────────────────────────────────────────────────────── */
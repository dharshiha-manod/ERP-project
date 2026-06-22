/**
 * ====================================================
 * PRODUCT API — src/api/productAPI.js
 * Covers: Products, Brands, Units, Variations, Categories
 * ====================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helper: get auth headers ──
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Helper: handle response ──
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
};

// ── Helper: build query string ──
const buildQuery = (params = {}) => {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return filtered.length ? `?${filtered.join('&')}` : '';
};

// ─────────────────────────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────────────────────────

export const brandsAPI = {
  /** GET /api/products/brands?page=&limit=&search= */
  getAll: (params = {}) =>
    fetch(`${BASE_URL}/products/brands${buildQuery(params)}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** GET /api/products/brands/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/products/brands/${id}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** POST /api/products/brands */
  create: (data) =>
    fetch(`${BASE_URL}/products/brands`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** PUT /api/products/brands/:id */
  update: (id, data) =>
    fetch(`${BASE_URL}/products/brands/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** DELETE /api/products/brands/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/products/brands/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};

// ─────────────────────────────────────────────────────────────
// UNITS
// ─────────────────────────────────────────────────────────────

export const unitsAPI = {
  /** GET /api/products/units?page=&limit=&search= */
  getAll: (params = {}) =>
    fetch(`${BASE_URL}/products/units${buildQuery(params)}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** GET /api/products/units/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/products/units/${id}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** POST /api/products/units */
  create: (data) =>
    fetch(`${BASE_URL}/products/units`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** PUT /api/products/units/:id */
  update: (id, data) =>
    fetch(`${BASE_URL}/products/units/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** DELETE /api/products/units/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/products/units/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};

// ─────────────────────────────────────────────────────────────
// VARIATIONS
// ─────────────────────────────────────────────────────────────

export const variationsAPI = {
  /** GET /api/products/variations?page=&limit=&search= */
  getAll: (params = {}) =>
    fetch(`${BASE_URL}/products/variations${buildQuery(params)}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** GET /api/products/variations/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/products/variations/${id}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /**
   * POST /api/products/variations
   * body: { name: string, values: string[] }
   */
  create: (data) =>
    fetch(`${BASE_URL}/products/variations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /**
   * PUT /api/products/variations/:id
   * body: { name?: string, values?: string[] }
   */
  update: (id, data) =>
    fetch(`${BASE_URL}/products/variations/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** DELETE /api/products/variations/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/products/variations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────

export const categoriesAPI = {
  /** GET /api/products/categories?page=&limit=&search= */
  getAll: (params = {}) =>
    fetch(`${BASE_URL}/products/categories${buildQuery(params)}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** GET /api/products/categories/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/products/categories/${id}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** POST /api/products/categories */
  create: (data) =>
    fetch(`${BASE_URL}/products/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** PUT /api/products/categories/:id */
  update: (id, data) =>
    fetch(`${BASE_URL}/products/categories/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** DELETE /api/products/categories/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/products/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────

export const productsAPI = {
  /**
   * GET /api/products?page=&limit=&search=&status=&category_id=&brand_id=
   */
  getAll: (params = {}) =>
    fetch(`${BASE_URL}/products${buildQuery(params)}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /** GET /api/products/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  /**
   * POST /api/products
   * Sends unit/brand/category as name strings (backend resolves to IDs)
   * OR as numeric IDs directly — both work.
   */
  create: (data) =>
    fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** PUT /api/products/:id */
  update: (id, data) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** DELETE /api/products/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),

  /**
   * PATCH /api/products/:id/status
   * body: { status: 'Active' | 'Inactive' }
   */
  updateStatus: (id, status) =>
    fetch(`${BASE_URL}/products/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),
};
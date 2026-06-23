/**
 * ====================================================
 * PRODUCT API — src/api/productAPI.js
 * Fixed: uses "manod_token" (matches rest of ERP)
 * ====================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Auth headers — matches PermissionsContext.jsx pattern ──
const authHeaders = () => {
  const token = localStorage.getItem('manod_token'); // ← FIXED: was 'token'
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
};

const buildQuery = (params = {}) => {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return filtered.length ? `?${filtered.join('&')}` : '';
};

export const brandsAPI = {
  getAll:  (p = {}) => fetch(`${BASE_URL}/products/brands${buildQuery(p)}`,        { headers: authHeaders() }).then(handleResponse),
  getById: (id)     => fetch(`${BASE_URL}/products/brands/${id}`,                   { headers: authHeaders() }).then(handleResponse),
  create:  (d)      => fetch(`${BASE_URL}/products/brands`,       { method:'POST',   headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:  (id, d)  => fetch(`${BASE_URL}/products/brands/${id}`, { method:'PUT',    headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:  (id)     => fetch(`${BASE_URL}/products/brands/${id}`, { method:'DELETE', headers: authHeaders() }).then(handleResponse),
};

export const unitsAPI = {
  getAll:  (p = {}) => fetch(`${BASE_URL}/products/units${buildQuery(p)}`,        { headers: authHeaders() }).then(handleResponse),
  getById: (id)     => fetch(`${BASE_URL}/products/units/${id}`,                   { headers: authHeaders() }).then(handleResponse),
  create:  (d)      => fetch(`${BASE_URL}/products/units`,       { method:'POST',   headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:  (id, d)  => fetch(`${BASE_URL}/products/units/${id}`, { method:'PUT',    headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:  (id)     => fetch(`${BASE_URL}/products/units/${id}`, { method:'DELETE', headers: authHeaders() }).then(handleResponse),
};

export const variationsAPI = {
  getAll:  (p = {}) => fetch(`${BASE_URL}/products/variations${buildQuery(p)}`,        { headers: authHeaders() }).then(handleResponse),
  getById: (id)     => fetch(`${BASE_URL}/products/variations/${id}`,                   { headers: authHeaders() }).then(handleResponse),
  create:  (d)      => fetch(`${BASE_URL}/products/variations`,       { method:'POST',   headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:  (id, d)  => fetch(`${BASE_URL}/products/variations/${id}`, { method:'PUT',    headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:  (id)     => fetch(`${BASE_URL}/products/variations/${id}`, { method:'DELETE', headers: authHeaders() }).then(handleResponse),
};

export const categoriesAPI = {
  getAll:  (p = {}) => fetch(`${BASE_URL}/products/categories${buildQuery(p)}`,        { headers: authHeaders() }).then(handleResponse),
  getById: (id)     => fetch(`${BASE_URL}/products/categories/${id}`,                   { headers: authHeaders() }).then(handleResponse),
  create:  (d)      => fetch(`${BASE_URL}/products/categories`,       { method:'POST',   headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:  (id, d)  => fetch(`${BASE_URL}/products/categories/${id}`, { method:'PUT',    headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:  (id)     => fetch(`${BASE_URL}/products/categories/${id}`, { method:'DELETE', headers: authHeaders() }).then(handleResponse),
};

export const productsAPI = {
  getAll:       (p = {}) => fetch(`${BASE_URL}/products${buildQuery(p)}`,                    { headers: authHeaders() }).then(handleResponse),
  getById:      (id)     => fetch(`${BASE_URL}/products/${id}`,                               { headers: authHeaders() }).then(handleResponse),
  create:       (d)      => fetch(`${BASE_URL}/products`,             { method:'POST',         headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:       (id, d)  => fetch(`${BASE_URL}/products/${id}`,       { method:'PUT',          headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:       (id)     => fetch(`${BASE_URL}/products/${id}`,       { method:'DELETE',       headers: authHeaders() }).then(handleResponse),
  updateStatus: (id, s)  => fetch(`${BASE_URL}/products/${id}/status`,{ method:'PATCH',        headers: authHeaders(), body: JSON.stringify({ status: s }) }).then(handleResponse),
  updateStock:  (id, d)  => fetch(`${BASE_URL}/products/${id}/stock`, { method:'PATCH',        headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
};

export const warrantiesAPI = {
  getAll:  (p = {}) => fetch(`${BASE_URL}/products/warranties${buildQuery(p)}`,        { headers: authHeaders() }).then(handleResponse),
  getById: (id)     => fetch(`${BASE_URL}/products/warranties/${id}`,                   { headers: authHeaders() }).then(handleResponse),
  create:  (d)      => fetch(`${BASE_URL}/products/warranties`,       { method:'POST',   headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:  (id, d)  => fetch(`${BASE_URL}/products/warranties/${id}`, { method:'PUT',    headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:  (id)     => fetch(`${BASE_URL}/products/warranties/${id}`, { method:'DELETE', headers: authHeaders() }).then(handleResponse),
};
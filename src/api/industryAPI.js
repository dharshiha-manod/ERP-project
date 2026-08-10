const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = () => {
  const token = localStorage.getItem('manod_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
};

export const industryAPI = {
  getAll:     ()      => fetch(`${BASE_URL}/industries`,           { headers: authHeaders() }).then(handleResponse),
  create:     (d)     => fetch(`${BASE_URL}/industries`,           { method: 'POST',   headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  update:     (id, d) => fetch(`${BASE_URL}/industries/${id}`,     { method: 'PUT',    headers: authHeaders(), body: JSON.stringify(d) }).then(handleResponse),
  delete:     (id)    => fetch(`${BASE_URL}/industries/${id}`,     { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  setActive:  (id)    => fetch(`${BASE_URL}/industries/set-active`,{ method: 'POST',   headers: authHeaders(), body: JSON.stringify({ industry_id: id }) }).then(handleResponse),
};
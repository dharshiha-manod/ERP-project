/**
 * src/api/essentialsAPI.js
 * Thin fetch wrapper for /api/essentials/* — mirrors the pattern used by
 * the other files in src/api/ (contactsAPI.js, expensesAPI.js, etc).
 */

export const API_ORIGIN = "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api/essentials`;

function authHeaders(json = true) {
  const token = localStorage.getItem("manod_token");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  let data = {};
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function qs(params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
}

/* ── To-Do ─────────────────────────────────────────────────────────────── */
export const getTodos    = (filters) => fetch(`${API_BASE}/todos${qs(filters)}`, { headers: authHeaders() }).then(handle);
export const createTodo  = (payload) => fetch(`${API_BASE}/todos`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const updateTodo  = (id, payload) => fetch(`${API_BASE}/todos/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const deleteTodo  = (id) => fetch(`${API_BASE}/todos/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);

/* ── Documents ─────────────────────────────────────────────────────────── */
export const getDocuments   = () => fetch(`${API_BASE}/documents`, { headers: authHeaders() }).then(handle);
export const uploadDocument = (file, description) => {
  const fd = new FormData();
  fd.append("file", file);
  if (description) fd.append("description", description);
  return fetch(`${API_BASE}/documents`, { method: "POST", headers: authHeaders(false), body: fd }).then(handle);
};
export const deleteDocument = (id) => fetch(`${API_BASE}/documents/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);

/* ── Memos ─────────────────────────────────────────────────────────────── */
export const getMemos   = () => fetch(`${API_BASE}/memos`, { headers: authHeaders() }).then(handle);
export const createMemo = (payload) => fetch(`${API_BASE}/memos`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const updateMemo = (id, payload) => fetch(`${API_BASE}/memos/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const deleteMemo = (id) => fetch(`${API_BASE}/memos/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);

/* ── Reminders ─────────────────────────────────────────────────────────── */
export const getReminders   = () => fetch(`${API_BASE}/reminders`, { headers: authHeaders() }).then(handle);
export const createReminder = (payload) => fetch(`${API_BASE}/reminders`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const deleteReminder = (id) => fetch(`${API_BASE}/reminders/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);

//* ── Messages ──────────────────────────────────────────────────────────── */
export const getContacts   = () => fetch(`${API_BASE}/contacts`, { headers: authHeaders() }).then(handle);
export const getMessages   = (recipient_id) => fetch(`${API_BASE}/messages${qs({ recipient_id })}`, { headers: authHeaders() }).then(handle);
export const createMessage = (payload) => fetch(`${API_BASE}/messages`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
/* ── Knowledge Base ────────────────────────────────────────────────────── */
export const getKb    = (search) => fetch(`${API_BASE}/kb${qs({ search })}`, { headers: authHeaders() }).then(handle);
export const createKb = (payload) => fetch(`${API_BASE}/kb`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const updateKb = (id, payload) => fetch(`${API_BASE}/kb/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const deleteKb = (id) => fetch(`${API_BASE}/kb/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);

/* ── Settings ──────────────────────────────────────────────────────────── */
export const getSettings    = () => fetch(`${API_BASE}/settings`, { headers: authHeaders() }).then(handle);
export const updateSettings = (payload) => fetch(`${API_BASE}/settings`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
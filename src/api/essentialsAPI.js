/**
 * src/api/essentialsAPI.js
 * Thin fetch wrapper for /api/essentials/* — mirrors the pattern used by
 * the other files in src/api/ (contactsAPI.js, expensesAPI.js, etc).
 */

export const API_ORIGIN = "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api/essentials`;
function authHeaders(json = true) {
  const token = localStorage.getItem("manod_token");
  const industryId = localStorage.getItem("manod_active_industry_id");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(industryId ? { "X-Industry-Id": industryId } : {}),
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
export const getTodoDetail = (id) => fetch(`${API_BASE}/todos/${id}`, { headers: authHeaders() }).then(handle);

// Comments
export const addTodoComment = (id, comment) =>
  fetch(`${API_BASE}/todos/${id}/comments`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ comment }) }).then(handle);

// Attachments
export const addTodoAttachment = (id, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return fetch(`${API_BASE}/todos/${id}/attachments`, { method: "POST", headers: authHeaders(false), body: fd }).then(handle);
};
export const deleteTodoAttachment = (id, attachmentId) =>
  fetch(`${API_BASE}/todos/${id}/attachments/${attachmentId}`, { method: "DELETE", headers: authHeaders() }).then(handle);

// Checklist
export const addChecklistItem = (id, item) =>
  fetch(`${API_BASE}/todos/${id}/checklist`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ item }) }).then(handle);
export const toggleChecklistItem = (id, itemId, is_done) =>
  fetch(`${API_BASE}/todos/${id}/checklist/${itemId}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ is_done }) }).then(handle);
export const deleteChecklistItem = (id, itemId) =>
  fetch(`${API_BASE}/todos/${id}/checklist/${itemId}`, { method: "DELETE", headers: authHeaders() }).then(handle);

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
export const getMemos          = (status) => fetch(`${API_BASE}/memos${qs({ status })}`, { headers: authHeaders() }).then(handle);
export const getMemoDetail     = (id) => fetch(`${API_BASE}/memos/${id}`, { headers: authHeaders() }).then(handle);
export const getMemoReadStats  = (id) => fetch(`${API_BASE}/memos/${id}/read-stats`, { headers: authHeaders() }).then(handle);
export const createMemo        = (payload) => fetch(`${API_BASE}/memos`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const updateMemo        = (id, payload) => fetch(`${API_BASE}/memos/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const publishMemo       = (id) => fetch(`${API_BASE}/memos/${id}/publish`, { method: "POST", headers: authHeaders() }).then(handle);
export const archiveMemo       = (id) => fetch(`${API_BASE}/memos/${id}/archive`, { method: "POST", headers: authHeaders() }).then(handle);
export const deleteMemo        = (id) => fetch(`${API_BASE}/memos/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);
export const addMemoAttachment = (id, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return fetch(`${API_BASE}/memos/${id}/attachments`, { method: "POST", headers: authHeaders(false), body: fd }).then(handle);
};
export const deleteMemoAttachment = (id, attachmentId) =>
  fetch(`${API_BASE}/memos/${id}/attachments/${attachmentId}`, { method: "DELETE", headers: authHeaders() }).then(handle);
export const markMemoSeen      = (id) => fetch(`${API_BASE}/memos/${id}/seen`, { method: "POST", headers: authHeaders() }).then(handle);
export const acknowledgeMemo   = (id) => fetch(`${API_BASE}/memos/${id}/acknowledge`, { method: "POST", headers: authHeaders() }).then(handle);

/* ── Reminders ─────────────────────────────────────────────────────────── */
export const getReminders   = () => fetch(`${API_BASE}/reminders`, { headers: authHeaders() }).then(handle);
export const createReminder = (payload) => fetch(`${API_BASE}/reminders`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const deleteReminder = (id) => fetch(`${API_BASE}/reminders/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);

//* ── Messages ──────────────────────────────────────────────────────────── */
export const getContacts   = () => fetch(`${API_BASE}/contacts`, { headers: authHeaders() }).then(handle);
export const getMessages   = (recipient_id) => fetch(`${API_BASE}/messages${qs({ recipient_id })}`, { headers: authHeaders() }).then(handle);
export const createMessage = (payload) => fetch(`${API_BASE}/messages`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
/* ── Knowledge Base ────────────────────────────────────────────────────── */
export const getKb          = (filters) => fetch(`${API_BASE}/kb${qs(filters)}`, { headers: authHeaders() }).then(handle);
export const getKbDetail    = (id) => fetch(`${API_BASE}/kb/${id}`, { headers: authHeaders() }).then(handle);
export const createKb       = (payload) => fetch(`${API_BASE}/kb`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const updateKb       = (id, payload) => fetch(`${API_BASE}/kb/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const deleteKb       = (id) => fetch(`${API_BASE}/kb/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);
export const publishKb      = (id) => fetch(`${API_BASE}/kb/${id}/publish`, { method: "POST", headers: authHeaders() }).then(handle);
export const archiveKb      = (id) => fetch(`${API_BASE}/kb/${id}/archive`, { method: "POST", headers: authHeaders() }).then(handle);

export const addKbAttachment = (id, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return fetch(`${API_BASE}/kb/${id}/attachments`, { method: "POST", headers: authHeaders(false), body: fd }).then(handle);
};
export const deleteKbAttachment = (id, attachmentId) =>
  fetch(`${API_BASE}/kb/${id}/attachments/${attachmentId}`, { method: "DELETE", headers: authHeaders() }).then(handle);

export const toggleKbFavorite = (id) => fetch(`${API_BASE}/kb/${id}/favorite`, { method: "POST", headers: authHeaders() }).then(handle);
export const recordKbView     = (id) => fetch(`${API_BASE}/kb/${id}/view`, { method: "POST", headers: authHeaders() }).then(handle);
export const getRecentlyViewedKb = () => fetch(`${API_BASE}/kb/recent`, { headers: authHeaders() }).then(handle);

export const getKbVersions    = (id) => fetch(`${API_BASE}/kb/${id}/versions`, { headers: authHeaders() }).then(handle);
export const restoreKbVersion = (id, versionId) =>
  fetch(`${API_BASE}/kb/${id}/versions/${versionId}/restore`, { method: "POST", headers: authHeaders() }).then(handle);

export const getKbCategories    = () => fetch(`${API_BASE}/kb/categories`, { headers: authHeaders() }).then(handle);
export const createKbCategory   = (payload) => fetch(`${API_BASE}/kb/categories`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const updateKbCategory   = (id, payload) => fetch(`${API_BASE}/kb/categories/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
export const deleteKbCategory   = (id) => fetch(`${API_BASE}/kb/categories/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);

export const getKbTags     = () => fetch(`${API_BASE}/kb/tags`, { headers: authHeaders() }).then(handle);
export const getKbAuditLog = (article_id) => fetch(`${API_BASE}/kb/audit-log${qs({ article_id })}`, { headers: authHeaders() }).then(handle);
export const getKbStats    = () => fetch(`${API_BASE}/kb/stats`, { headers: authHeaders() }).then(handle);

/* ── Notifications (shared engine — same table HRM/Sales Target/Holiday
   already write to via services/notificationService.js) ────────────────── */
const ESS_BASE = `${API_ORIGIN}/api/ess`;
export const getMyNotifications     = () => fetch(`${ESS_BASE}/notifications`, { headers: authHeaders() }).then(handle);
export const markNotificationSeen   = (id) => fetch(`${ESS_BASE}/notifications/${id}/seen`, { method: "PATCH", headers: authHeaders() }).then(handle);
export const markAllNotificationsSeen = () => fetch(`${ESS_BASE}/notifications/seen-all`, { method: "PATCH", headers: authHeaders() }).then(handle);
export const getSettings    = () => fetch(`${API_BASE}/settings`, { headers: authHeaders() }).then(handle);
export const updateSettings = (payload) => fetch(`${API_BASE}/settings`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }).then(handle);
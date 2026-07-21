/**
 * src/api/crmAPI.js
 * Backend returns: { success: true, data: <row or rows> }
 * We reshape to named keys so CRM.jsx can use res.lead, res.leads, etc.
 */

const BASE = 'http://localhost:5000/api/crm';

function authHeaders() {
  const token = localStorage.getItem('manod_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
// Reshape list response  → { [key]: [] }
// Reshape list response  → { [key]: [] }
const list = (key) => async (method, path, body) => {
  const res = await request(method, path, body);
  const arr = res[key] || res.data || [];
  return { [key]: Array.isArray(arr) ? arr : [] };
};

// Reshape single response → { [key]: {} }
const one = (key) => async (method, path, body) => {
  const res = await request(method, path, body);
  const item = res[key] || res.data;
  return { [key]: Array.isArray(item) ? item[0] : item };
};

// ── Dashboard ─────────────────────────────────────────────────
export const fetchCRMStats = () => request('GET', '/dashboard/stats');

// ── Leads ────────────────────────────────────────────────────
export const fetchLeads    = (p = {}) => list('leads')('GET', `/leads?${new URLSearchParams(p)}`);
export const fetchLeadById = (id)     => one('lead')('GET', `/leads/${id}`);
export const createLead    = (body)   => one('lead')('POST', '/leads', body);
export const updateLead    = (id, b)  => one('lead')('PUT', `/leads/${id}`, b);
export const deleteLead    = (id)     => request('DELETE', `/leads/${id}`);
export const convertLead   = (id)     => one('lead')('PATCH', `/leads/${id}/convert`);

// ── Follow-ups ───────────────────────────────────────────────
export const fetchFollowups  = (p = {}) => list('followups')('GET', `/followups?${new URLSearchParams(p)}`);
export const createFollowup  = (body)   => one('followup')('POST', '/followups', body);
export const updateFollowup  = (id, b)  => one('followup')('PUT', `/followups/${id}`, b);
export const deleteFollowup  = (id)     => request('DELETE', `/followups/${id}`);

// ── Campaigns ────────────────────────────────────────────────
export const fetchCampaigns = (p = {}) => list('campaigns')('GET', `/campaigns?${new URLSearchParams(p)}`);
export const createCampaign = (body)   => one('campaign')('POST', '/campaigns', body);
export const deleteCampaign = (id)     => request('DELETE', `/campaigns/${id}`);
// ── Proposals ────────────────────────────────────────────────
export const fetchProposals  = (p = {}) => list('proposals')('GET', `/proposals?${new URLSearchParams(p)}`);
export const createProposal  = (body)   => one('proposal')('POST', '/proposals', body);
export const updateProposal  = (id, b)  => one('proposal')('PUT', `/proposals/${id}`, b);
export const deleteProposal  = (id)     => request('DELETE', `/proposals/${id}`);

// ── Templates ────────────────────────────────────────────────
export const fetchTemplates = (p = {}) => list('templates')('GET', `/templates?${new URLSearchParams(p)}`);
export const createTemplate = (body)   => one('template')('POST', '/templates', body);
export const updateTemplate = (id, b)  => one('template')('PUT', `/templates/${id}`, b);
export const deleteTemplate = (id)     => request('DELETE', `/templates/${id}`);

// ── Contacts ─────────────────────────────────────────────────
export const fetchContacts = (p = {}) => list('contacts')('GET', `/contacts?${new URLSearchParams(p)}`);
export const createContact = (body)   => one('contact')('POST', '/contacts', body);
export const updateContact = (id, b)  => one('contact')('PUT', `/contacts/${id}`, b);
export const deleteContact = (id)     => request('DELETE', `/contacts/${id}`);
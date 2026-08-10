/**
 * ====================================================
 * CONTACTS API CLIENT
 * src/api/contactsAPI.js
 * Frontend API calls to backend — same pattern as
 * commissionAgentAPI.js
 * ====================================================
 */
const ENDPOINT = "http://localhost:5000/api/contacts";

const getAuthToken = () => {
  const token = localStorage.getItem('manod_token');
  if (!token) throw new Error('Authentication token not found. Please login.');
  return token;
};

// ── Industry Workspace Isolation — matches productAPI.js / purchaseAPI.js ──
const getIndustryHeader = () => {
  const industryId = localStorage.getItem('manod_active_industry_id');
  return industryId ? { 'X-Industry-Id': industryId } : {};
};

const apiFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...getIndustryHeader(),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }
  return data;
};

// ── GET ALL CONTACTS (paginated, filtered) ──
export const getAllContacts = async (params = {}) => {
  const query = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 25,
    search: params.search || '',
    contactType: params.contactType || '',
    mobile: params.mobile || '',
    city: params.city || '',
    payTerm: params.payTerm || '',
    customerGroupId: params.customerGroupId || '',
    dateFrom: params.dateFrom || '',
    dateTo: params.dateTo || '',
  }).toString();

  return apiFetch(`${ENDPOINT}?${query}`);
};

// ── GET CUSTOMERS ONLY — used by Sell.jsx's customer dropdown so
// suppliers never leak into the list ──
export const getCustomersOnly = async () => {
  const data = await apiFetch(`${ENDPOINT}?contactType=Customers&limit=1000`);
  return data?.data || data?.contacts || [];
};

// ── GET SINGLE CONTACT ──
export const getContactById = async (id) => {
  const data = await apiFetch(`${ENDPOINT}/${id}`);
  return data.contact;
};

// ── DASHBOARD STATS ──
export const getContactStats = async () => {
  const data = await apiFetch(`${ENDPOINT}/stats`);
  return data.stats;
};

// ── CREATE CONTACT ──
export const createContact = async (payload) => {
  return apiFetch(ENDPOINT, { method: 'POST', body: JSON.stringify(payload) });
};

// ── UPDATE CONTACT ──
export const updateContact = async (id, payload) => {
  return apiFetch(`${ENDPOINT}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
};

// ── DELETE CONTACT ──
export const deleteContact = async (id) => {
  return apiFetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
};

// ── OUTSTANDING (Receivable/Payable, opening balance + real transactions) ──
export const getContactOutstanding = async (id) => {
  return apiFetch(`${ENDPOINT}/${id}/outstanding`);
};

// ── STATEMENT (full ledger with running balance) ──
export const getContactStatement = async (id, side) => {
  const query = side ? `?side=${side}` : '';
  const data = await apiFetch(`${ENDPOINT}/${id}/statement${query}`);
  return data.statement;
};

// ── CONTACT LEDGER (purchase/sale history, used by Reports "Send Ledger") ──
export const getContactLedger = async (id) => {
  return apiFetch(`${ENDPOINT}/${id}/ledger`);
};

// ── RECORD A STANDALONE PAYMENT (opening balance settlement, advance/lump-sum) ──
// direction: 'in' (customer paid us) | 'out' (we paid supplier) — optional,
// inferred server-side from the contact's type if omitted.
export const recordContactPayment = async (id, payload) => {
  return apiFetch(`${ENDPOINT}/${id}/payments`, { method: 'POST', body: JSON.stringify(payload) });
};

// ── SALES-SIDE CUSTOMER PAYMENT (FIFO invoice allocation) ──
export const recordSalesPayment = async (id, payload) => {
  return apiFetch(`${ENDPOINT}/${id}/sales-payments`, { method: 'POST', body: JSON.stringify(payload) });
};

// ── IMPORT CONTACTS (rows already parsed from CSV/Excel on the client) ──
export const importContacts = async (rows) => {
  return apiFetch(`${ENDPOINT}/import`, { method: 'POST', body: JSON.stringify({ rows }) });
};

// ── CUSTOMER GROUPS ──
export const getAllGroups = async () => {
  const data = await apiFetch(`${ENDPOINT}/groups`);
  return data.groups;
};

export const createGroup = async (payload) => {
  return apiFetch(`${ENDPOINT}/groups`, { method: 'POST', body: JSON.stringify(payload) });
};

export const updateGroup = async (id, payload) => {
  return apiFetch(`${ENDPOINT}/groups/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
};

export const deleteGroup = async (id) => {
  return apiFetch(`${ENDPOINT}/groups/${id}`, { method: 'DELETE' });
};

// ── CSV PARSING HELPER (for Import page) ──
// Minimal CSV parser sufficient for the contacts template columns.
// Proper CSV line parser — respects quoted fields, escaped quotes ("") and commas inside quotes
const parseCSVLine = (line) => {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { cells.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
  }
  cells.push(cur.trim());
  return cells;
};

export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        const rows = lines.slice(1).map((line) => {
          const cells = parseCSVLine(line);
          return {
            contactType: cells[0],
            prefix: cells[1],
            firstName: cells[2],
            middleName: cells[3],
            lastName: cells[4],
            businessName: cells[5],
            taxNumber: cells[6],
            email: cells[7],
            mobile: cells[8],
            altPhone: cells[9],
            city: cells[10],
            state: cells[11],
            country: cells[12],
            addressLine1: cells[13],
            addressLine2: cells[14],
            zip: cells[15],
            contactId: cells[16],
            payTermNumber: cells[17],
            payTermType: cells[18],
            openingBalance: cells[19],
            customerGroupName: cells[20],
          };
        });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
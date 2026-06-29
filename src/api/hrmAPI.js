/**
 * ====================================================
 * src/api/hrmAPI.js
 * All HRM API calls — mirrors existing API files like purchaseAPI.js
 * Base URL reads from VITE_API_URL env var.
 * ====================================================
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
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ── DEPARTMENTS ──────────────────────────────────────────────
export const getDepartments    = ()        => request('GET',    '/hrm/departments');
export const createDepartment  = (body)    => request('POST',   '/hrm/departments', body);
export const updateDepartment  = (id,body) => request('PUT',    `/hrm/departments/${id}`, body);
export const deleteDepartment  = (id)      => request('DELETE', `/hrm/departments/${id}`);

// ── DESIGNATIONS ─────────────────────────────────────────────
export const getDesignations   = ()        => request('GET',    '/hrm/designations');
export const createDesignation = (body)    => request('POST',   '/hrm/designations', body);
export const updateDesignation = (id,body) => request('PUT',    `/hrm/designations/${id}`, body);
export const deleteDesignation = (id)      => request('DELETE', `/hrm/designations/${id}`);

// ── LEAVE TYPES ──────────────────────────────────────────────
export const getLeaveTypes     = ()        => request('GET',    '/hrm/leave-types');
export const createLeaveType   = (body)    => request('POST',   '/hrm/leave-types', body);
export const updateLeaveType   = (id,body) => request('PUT',    `/hrm/leave-types/${id}`, body);
export const deleteLeaveType   = (id)      => request('DELETE', `/hrm/leave-types/${id}`);

// ── LEAVES ───────────────────────────────────────────────────
export const getLeaves         = (params='')     => request('GET',    `/hrm/leaves${params}`);
export const createLeave       = (body)          => request('POST',   '/hrm/leaves', body);
export const updateLeave       = (id,body)       => request('PUT',    `/hrm/leaves/${id}`, body);
export const updateLeaveStatus = (id,status)     => request('PATCH',  `/hrm/leaves/${id}/status`, { status });
export const deleteLeave       = (id)            => request('DELETE', `/hrm/leaves/${id}`);

// ── SHIFTS ───────────────────────────────────────────────────
export const getShifts         = ()        => request('GET',    '/hrm/shifts');
export const createShift       = (body)    => request('POST',   '/hrm/shifts', body);
export const updateShift       = (id,body) => request('PUT',    `/hrm/shifts/${id}`, body);
export const deleteShift       = (id)      => request('DELETE', `/hrm/shifts/${id}`);

// ── ATTENDANCE ───────────────────────────────────────────────
export const getAttendance      = (params='') => request('GET',   `/hrm/attendance${params}`);
export const getAttendanceStats = ()          => request('GET',   '/hrm/attendance/stats');
export const clockIn            = (body)      => request('POST',  '/hrm/attendance/clock-in', body);
export const clockOut           = (id)        => request('PATCH', `/hrm/attendance/${id}/clock-out`);

// ── PAYROLL ──────────────────────────────────────────────────
export const getPayrolls        = (params='') => request('GET',    `/hrm/payroll${params}`);
export const createPayroll      = (body)      => request('POST',   '/hrm/payroll', body);
export const updatePayroll      = (id,body)   => request('PUT',    `/hrm/payroll/${id}`, body);
export const deletePayroll      = (id)        => request('DELETE', `/hrm/payroll/${id}`);

// ── PAY COMPONENTS ───────────────────────────────────────────
export const getPayComponents   = ()        => request('GET',    '/hrm/pay-components');
export const createPayComponent = (body)    => request('POST',   '/hrm/pay-components', body);
export const updatePayComponent = (id,body) => request('PUT',    `/hrm/pay-components/${id}`, body);
export const deletePayComponent = (id)      => request('DELETE', `/hrm/pay-components/${id}`);

// ── HOLIDAYS ─────────────────────────────────────────────────
export const getHolidays        = ()        => request('GET',    '/hrm/holidays');
export const createHoliday      = (body)    => request('POST',   '/hrm/holidays', body);
export const updateHoliday      = (id,body) => request('PUT',    `/hrm/holidays/${id}`, body);
export const deleteHoliday      = (id)      => request('DELETE', `/hrm/holidays/${id}`);

// ── SALES TARGETS ────────────────────────────────────────────
export const getSalesTargets    = (params='') => request('GET',    `/hrm/sales-targets${params}`);
export const createSalesTarget  = (body)      => request('POST',   '/hrm/sales-targets', body);
export const updateSalesTarget  = (id,body)   => request('PUT',    `/hrm/sales-targets/${id}`, body);
export const deleteSalesTarget  = (id)        => request('DELETE', `/hrm/sales-targets/${id}`);

// ── DASHBOARD ────────────────────────────────────────────────
export const getDashboardStats  = ()          => request('GET',    '/hrm/dashboard');

// ── EXPORT HELPERS (client-side) ─────────────────────────────

/** Export any array of objects to CSV and trigger download */
export function exportCSV(data, filename = 'export') {
  if (!data || !data.length) return;
  const keys   = Object.keys(data[0]);
  const header = keys.join(',');
  const rows   = data.map(row =>
    keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: `${filename}.csv` }).click();
  URL.revokeObjectURL(url);
}

/** Export to PDF via print window */
export function exportPDF(data, columns, title = 'Report') {
  if (!data || !data.length) return;
  const heads = columns.map(c => `<th style="border:1px solid #ccc;padding:8px;background:#e8f5e9">${c.label}</th>`).join('');
  const body  = data.map(row =>
    `<tr>${columns.map(c => `<td style="border:1px solid #ccc;padding:8px">${row[c.key] ?? ''}</td>`).join('')}</tr>`
  ).join('');
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>${title}</title>
    <style>body{font-family:sans-serif;font-size:13px}table{border-collapse:collapse;width:100%}h2{color:#2e7d32}</style>
    </head><body>
    <h2>${title}</h2>
    <p style="color:#666">Generated: ${new Date().toLocaleString('en-IN')}</p>
    <table><thead><tr>${heads}</tr></thead><tbody>${body}</tbody></table>
    </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

/** Export to Excel (uses CSV with .xlsx extension — opens fine in Excel) */
export function exportExcel(data, filename = 'export') {
  exportCSV(data, filename); // browsers treat CSV as Excel-openable
}
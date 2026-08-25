/**
 * ====================================================
 * src/api/hrmAPI.js
 * All HRM API calls — mirrors existing API files like purchaseAPI.js
 * Base URL reads from VITE_API_URL env var.
 * ====================================================
 */
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

function getHeaders(isFormData) {
  const token = localStorage.getItem('manod_token');
  const industryId = localStorage.getItem('manod_active_industry_id');
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(industryId ? { 'X-Industry-Id': industryId } : {}),
  };
}
async function request(method, path, body, isFormData) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(isFormData),
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
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
export const updateLeaveStatus = (id,status,remarks='') => request('PATCH', `/hrm/leaves/${id}/status`, { status, remarks });
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
export const createAttendanceRecord = (body)      => request('POST',   '/hrm/attendance', body);
export const updateAttendanceRecord = (id,body)   => request('PUT',    `/hrm/attendance/${id}`, body);
export const deleteAttendanceRecord = (id)        => request('DELETE', `/hrm/attendance/${id}`);

// ── PAYROLL ──────────────────────────────────────────────────
export const getPayrolls        = (params='') => request('GET',    `/hrm/payroll${params}`);
export const createPayroll      = (body)      => request('POST',   '/hrm/payroll', body);
export const updatePayroll      = (id,body)   => request('PUT',    `/hrm/payroll/${id}`, body);
export const deletePayroll      = (id)        => request('DELETE', `/hrm/payroll/${id}`);
export const getEligibleForRun  = (monthYear) => request('GET', `/hrm/payroll-run/eligible?month_year=${encodeURIComponent(monthYear)}`);
export const previewPayroll     = (employeeId, source='user', month='') => request('GET', `/hrm/payroll-run/preview/${employeeId}?source=${source}${month ? `&month=${encodeURIComponent(month)}` : ''}`);
export const runPayroll         = (employeeIds, monthYear) => request('POST', '/hrm/payroll-run', { employeeIds, month_year: monthYear });
export const getPayrollItems    = (payrollId) => request('GET', `/hrm/payroll/${payrollId}/items`);
// ── PAY COMPONENTS ───────────────────────────────────────────
export const getPayComponents   = ()        => request('GET',    '/hrm/pay-components');
export const createPayComponent = (body)    => request('POST',   '/hrm/pay-components', body);
export const updatePayComponent = (id,body) => request('PUT',    `/hrm/pay-components/${id}`, body);
export const deletePayComponent = (id)      => request('DELETE', `/hrm/pay-components/${id}`);

// ── PAYROLL GROUPS ───────────────────────────────────────────
export const getPayrollGroups    = ()        => request('GET',    '/hrm/payroll-groups');
export const createPayrollGroup  = (body)    => request('POST',   '/hrm/payroll-groups', body);
export const updatePayrollGroup  = (id,body) => request('PUT',    `/hrm/payroll-groups/${id}`, body);
export const deletePayrollGroup  = (id)      => request('DELETE', `/hrm/payroll-groups/${id}`);
export const getGroupComponents    = (id)             => request('GET', `/hrm/payroll-groups/${id}/components`);
export const updateGroupComponents = (id,componentIds) => request('PUT', `/hrm/payroll-groups/${id}/components`, { componentIds });
export const getEmployeesWithGroups = ()                       => request('GET', '/hrm/employees');
export const assignPayrollGroup     = (userId,groupId,source='user') => request('PUT', `/hrm/employees/${userId}/payroll-group`, { payroll_group_id: groupId, source });

// ── HRM EMPLOYEES (non-login staff) ──────────────────────────
export const getHrmEmployees    = ()        => request('GET',    '/hrm/hrm-employees');
export const createHrmEmployee  = (body)    => request('POST',   '/hrm/hrm-employees', body);
export const updateHrmEmployee  = (id,body) => request('PUT',    `/hrm/hrm-employees/${id}`, body);

// Phase 2 — Education / Experience / Documents / Skills
export const getEmployeeEducation    = (employeeId)      => request('GET',    `/hrm/hrm-employees/${employeeId}/education`);
export const createEmployeeEducation = (employeeId,body) => request('POST',   `/hrm/hrm-employees/${employeeId}/education`, body);
export const updateEmployeeEducation = (id,body)          => request('PUT',    `/hrm/hrm-employees/education/${id}`, body);
export const deleteEmployeeEducation = (id)                => request('DELETE',`/hrm/hrm-employees/education/${id}`);

export const getEmployeeExperience    = (employeeId)      => request('GET',    `/hrm/hrm-employees/${employeeId}/experience`);
export const createEmployeeExperience = (employeeId,body) => request('POST',   `/hrm/hrm-employees/${employeeId}/experience`, body);
export const updateEmployeeExperience = (id,body)          => request('PUT',    `/hrm/hrm-employees/experience/${id}`, body);
export const deleteEmployeeExperience = (id)                => request('DELETE',`/hrm/hrm-employees/experience/${id}`);

export const getEmployeeDocuments   = (employeeId)        => request('GET',    `/hrm/hrm-employees/${employeeId}/documents`);
export const uploadEmployeeDocument = (employeeId,formData) => request('POST', `/hrm/hrm-employees/${employeeId}/documents`, formData, true);
export const deleteEmployeeDocument = (id)                  => request('DELETE',`/hrm/hrm-employees/documents/${id}`);

export const getEmployeeSkills   = (employeeId)      => request('GET',    `/hrm/hrm-employees/${employeeId}/skills`);
export const createEmployeeSkill = (employeeId,body) => request('POST',   `/hrm/hrm-employees/${employeeId}/skills`, body);
export const deleteEmployeeSkill = (id)                => request('DELETE',`/hrm/hrm-employees/skills/${id}`);

// Phase 3 — Employee Timeline
export const getEmployeeTimeline = (employeeId) => request('GET', `/hrm/hrm-employees/${employeeId}/timeline`);
export const deleteHrmEmployee  = (id)      => request('DELETE', `/hrm/hrm-employees/${id}`);

// ── HOLIDAYS ─────────────────────────────────────────────────
export const getHolidays        = ()        => request('GET',    '/hrm/holidays');
export const createHoliday      = (body)    => request('POST',   '/hrm/holidays', body);
export const updateHoliday      = (id,body) => request('PUT',    `/hrm/holidays/${id}`, body);
export const deleteHoliday      = (id)      => request('DELETE', `/hrm/holidays/${id}`);

// ── SALES TARGETS ────────────────────────────────────────────
// NEW
export const getSalesTargets    = (params='') => request('GET',    `/hrm/sales-targets${params}`);
export const createSalesTarget  = (body)      => request('POST',   '/hrm/sales-targets', body);
export const updateSalesTarget  = (id,body)   => request('PUT',    `/hrm/sales-targets/${id}`, body);
export const deleteSalesTarget  = (id)        => request('DELETE', `/hrm/sales-targets/${id}`);

// NEW
// ── SETTINGS ─────────────────────────────────────────────────
export const getSettings        = ()        => request('GET', '/hrm/settings');
export const updateSettings     = (body)    => request('PUT', '/hrm/settings', body);
export const enableEmployeeLogin = (id, body) => request('POST', `/hrm/hrm-employees/${id}/enable-login`, body);
// ── BUSINESS LOCATIONS (used by Holiday's Location dropdown) ─
export const getBusinessLocations = () => request('GET', '/settings/locations');

// ── DASHBOARD ────────────────────────────────────────────────
// ── DASHBOARD ────────────────────────────────────────────────
export const getDashboardStats  = ()          => request('GET',    '/hrm/dashboard');
export const getMySalesTarget = () => request('GET', '/hrm/my/sales-target');

export const searchEmployees = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return request('GET', `/hrm/hrm-employees/search${qs ? `?${qs}` : ''}`);
};

const reportParams = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return qs ? `?${qs}` : '';
};
export const getAttendanceReport  = (params={}) => request('GET', `/hrm/reports/attendance${reportParams(params)}`);
export const getLeaveReport       = (params={}) => request('GET', `/hrm/reports/leave${reportParams(params)}`);
export const getLateReport        = (params={}) => request('GET', `/hrm/reports/late${reportParams(params)}`);
export const getOvertimeReport    = (params={}) => request('GET', `/hrm/reports/overtime${reportParams(params)}`);
export const getEmployeeDirectory = ()          => request('GET', `/hrm/reports/employee-directory`);
export const getPayrollReport     = (params={}) => request('GET', `/hrm/reports/payroll${reportParams(params)}`);
export const getJoiningReport     = (params={}) => request('GET', `/hrm/reports/joining${reportParams(params)}`);
export const getExitReport        = (params={}) => request('GET', `/hrm/reports/exit${reportParams(params)}`);
export const getDepartmentReport  = ()          => request('GET', `/hrm/reports/department`);
export const getBranchReport      = ()          => request('GET', `/hrm/reports/branch`);
export const getSalaryReport      = (params={}) => request('GET', `/hrm/reports/salary${reportParams(params)}`);
export const getTrainingReport    = ()          => request('GET', `/hrm/reports/training`);

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
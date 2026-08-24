/**
 * ====================================================
 * src/api/essAPI.js
 * Employee Self-Service API calls — mirrors hrmAPI.js.
 * Every call here only ever returns/affects the logged-in
 * user's own records (enforced server-side via JWT).
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

// ── MY PROFILE ────────────────────────────────────────────────
export const getMyProfile    = ()     => request('GET', '/ess/profile');
export const updateMyProfile = (body) => request('PUT', '/ess/profile', body);
// NEW
export const getBusinessLocations = () => request('GET', '/settings/locations');

// ── MY DEPARTMENTS / SHIFTS (for Clock In modal dropdowns) ───
export const getMyDepartments = () => request('GET', '/ess/departments');
export const getMyShifts      = () => request('GET', '/ess/shifts');

// ── MY ATTENDANCE ────────────────────────────────────────────
export const getMyAttendance      = (params='') => request('GET',  `/ess/attendance${params}`);
export const getMyAttendanceStats = ()           => request('GET',  '/ess/attendance/stats');
export const clockInSelf          = (body)       => request('POST', '/ess/attendance/clock-in', body);
export const clockOutSelf         = (id)         => request('PATCH',`/ess/attendance/${id}/clock-out`);

// ── MY LEAVE ─────────────────────────────────────────────────
export const getMyLeaves      = ()     => request('GET',   '/ess/leaves');
export const getMyLeaveBalance= ()     => request('GET',   '/ess/leaves/balance');
export const applyMyLeave     = (body) => request('POST',  '/ess/leaves', body);
export const cancelMyLeave    = (id)   => request('PATCH', `/ess/leaves/${id}/cancel`);

// ── MY LEAVE NOTIFICATIONS ──────────────────────────────────
export const getMyLeaveNotifications  = ()   => request('GET',   '/ess/leaves/notifications');
export const markLeaveNotificationSeen = (id) => request('PATCH', `/ess/leaves/${id}/seen`);

// ── MY HOLIDAYS ──────────────────────────────────────────────
export const getMyHolidays = () => request('GET', '/ess/holidays');

// ── MY SALES TARGET ──────────────────────────────────────────
export const getMySalesTarget = () => request('GET', '/ess/sales-target');

// ── MY PAYROLL / PAYSLIPS ───────────────────────────────────
export const getMyPayroll      = ()   => request('GET', '/ess/payroll');
export const getMyPayrollItems = (id) => request('GET', `/ess/payroll/${id}/items`);

// Phase 6 — My Documents / Education / Timeline
export const getMyDocuments = () => request('GET', '/ess/documents');
export const getMyEducation = () => request('GET', '/ess/education');
export const getMyTimeline  = () => request('GET', '/ess/timeline');
export const getMyNotifications        = () => request('GET', '/ess/notifications');
export const markNotificationSeen      = (id) => request('PATCH', `/ess/notifications/${id}/seen`);
export const markAllNotificationsSeen  = () => request('PATCH', '/ess/notifications/seen-all');
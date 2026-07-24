/**
 * src/api/manufacturingAPI.js
 * ─────────────────────────────────────────────────────────────────
 * All frontend API calls for the Manufacturing module.
 * ─────────────────────────────────────────────────────────────────
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MFG  = `${BASE}/manufacturing`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization:  `Bearer ${localStorage.getItem("manod_token") || ""}`,
});

async function request(url, options = {}) {
  const res = await fetch(url, { headers: headers(), ...options });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  if (!res.ok) {
    const msg = body?.message || body?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body;
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS — used to populate dropdowns in BOM / Production / Work Orders
// ══════════════════════════════════════════════════════════════════════════════
export const fetchProductsList = (params = {}) => {
  const qs = new URLSearchParams({ limit: 1000, ...params }).toString();
  return request(`${BASE}/products?${qs}`);
};

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION PLANS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchPlans  = () => request(`${MFG}/plans`);
export const createPlan  = (data) => request(`${MFG}/plans`, { method: "POST", body: JSON.stringify(data) });
export const updatePlan  = (id, data) => request(`${MFG}/plans/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePlan  = (id) => request(`${MFG}/plans/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// BILL OF MATERIALS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchBOMs = () => request(`${MFG}/bom`);
export const createBOM = (data) => request(`${MFG}/bom`, { method: "POST", body: JSON.stringify(data) });
export const updateBOM = (id, data) => request(`${MFG}/bom/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBOM = (id) => request(`${MFG}/bom/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// WORK ORDERS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchWorkOrders = () => request(`${MFG}/work-orders`);
export const createWorkOrder = (data) => request(`${MFG}/work-orders`, { method: "POST", body: JSON.stringify(data) });
export const updateWorkOrder = (id, data) => request(`${MFG}/work-orders/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteWorkOrder = (id) => request(`${MFG}/work-orders/${id}`, { method: "DELETE" });

// Purchases module integration: check this Work Order's BOM against real
// stock and auto-raise Purchase Order(s) for any shortfall (grouped by each
// component's default supplier on the Products table).
export const createPOForShortfall = (woId) => request(`${MFG}/work-orders/${woId}/create-po`, { method: "POST" });

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION RUNS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchProduction = () => request(`${MFG}/production`);
export const createProduction = (data) => request(`${MFG}/production`, { method: "POST", body: JSON.stringify(data) });
export const updateProduction = (id, data) => request(`${MFG}/production/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduction = (id) => request(`${MFG}/production/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// RESOURCES
// ══════════════════════════════════════════════════════════════════════════════
export const fetchResources = () => request(`${MFG}/resources`);
export const createResource = (data) => request(`${MFG}/resources`, { method: "POST", body: JSON.stringify(data) });
export const updateResource = (id, data) => request(`${MFG}/resources/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteResource = (id) => request(`${MFG}/resources/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// MACHINES
// ══════════════════════════════════════════════════════════════════════════════
export const fetchMachines = () => request(`${MFG}/machines`);
export const createMachine = (data) => request(`${MFG}/machines`, { method: "POST", body: JSON.stringify(data) });
export const updateMachine = (id, data) => request(`${MFG}/machines/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMachine = (id) => request(`${MFG}/machines/${id}`, { method: "DELETE" });

export const fetchFleetOEE = (from, to) => request(`${MFG}/machines/oee?from=${from}&to=${to}`);
export const fetchMachineDetail = (id) => request(`${MFG}/machines/${id}/detail`);
export const fetchMachineOEE = (id, from, to) => request(`${MFG}/machines/${id}/oee?from=${from}&to=${to}`);

export const fetchMachineLogs = (machineId) => request(`${MFG}/machines/${machineId}/logs`);
export const createMachineLog = (machineId, data) => request(`${MFG}/machines/${machineId}/logs`, { method: "POST", body: JSON.stringify(data) });
export const updateMachineLog = (logId, data) => request(`${MFG}/machines/logs/${logId}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMachineLog = (logId) => request(`${MFG}/machines/logs/${logId}`, { method: "DELETE" });

export const fetchMachineDocuments = (machineId) => request(`${MFG}/machines/${machineId}/documents`);
export const createMachineDocument = (machineId, data) => request(`${MFG}/machines/${machineId}/documents`, { method: "POST", body: JSON.stringify(data) });
export const deleteMachineDocument = (docId) => request(`${MFG}/machines/documents/${docId}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// QUALITY CHECKS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchQualityChecks = () => request(`${MFG}/quality-checks`);
export const createQualityCheck = (data) => request(`${MFG}/quality-checks`, { method: "POST", body: JSON.stringify(data) });
export const updateQualityCheck = (id, data) => request(`${MFG}/quality-checks/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteQualityCheck = (id) => request(`${MFG}/quality-checks/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE
// ══════════════════════════════════════════════════════════════════════════════
export const fetchMaintenance = () => request(`${MFG}/maintenance`);
export const createMaintenance = (data) => request(`${MFG}/maintenance`, { method: "POST", body: JSON.stringify(data) });
export const updateMaintenance = (id, data) => request(`${MFG}/maintenance/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMaintenance = (id) => request(`${MFG}/maintenance/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// SCHEDULE
// ══════════════════════════════════════════════════════════════════════════════
export const fetchSchedule = () => request(`${MFG}/schedule`);
export const createSchedule = (data) => request(`${MFG}/schedule`, { method: "POST", body: JSON.stringify(data) });
export const updateSchedule = (id, data) => request(`${MFG}/schedule/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSchedule = (id) => request(`${MFG}/schedule/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchReportsSummary = (from, to) => request(`${MFG}/reports/summary?from=${from}&to=${to}`);
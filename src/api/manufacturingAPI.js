/**
 * src/api/manufacturingAPI.js
 * ─────────────────────────────────────────────────────────────────
 * All frontend API calls for the Manufacturing module.
 *
 * HOW TO USE in Manufacturing.jsx:
 *   Replace the local `api()` helper with imports from this file:
 *
 *   import {
 *     fetchPlans, createPlan, updatePlan, deletePlan,
 *     fetchBOMs, createBOM, updateBOM, deleteBOM,
 *     fetchWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder,
 *     fetchProduction, createProduction, updateProduction, deleteProduction,
 *     fetchResources, createResource, updateResource, deleteResource,
 *     fetchMachines, createMachine, updateMachine, deleteMachine,
 *     fetchQualityChecks, createQualityCheck, updateQualityCheck, deleteQualityCheck,
 *     fetchMaintenance, createMaintenance, updateMaintenance, deleteMaintenance,
 *     fetchReportsSummary,
 *   } from "../api/manufacturingAPI";
 * ─────────────────────────────────────────────────────────────────
 */

// ── Base URL ──────────────────────────────────────────────────────────────────
// Uses VITE env var if set, otherwise falls back to localhost:5000.
// In development, Vite proxy (vite.config.js) will forward /api/* → backend.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MFG  = `${BASE}/manufacturing`;

// ── Auth header ───────────────────────────────────────────────────────────────
const headers = () => ({
  "Content-Type": "application/json",
  Authorization:  `Bearer ${localStorage.getItem("manod_token") || ""}`,
});

// ── Generic request helper ────────────────────────────────────────────────────
async function request(url, options = {}) {
  const res = await fetch(url, { headers: headers(), ...options });

  // Parse body regardless (may contain error message)
  let body;
  try { body = await res.json(); } catch { body = {}; }

  if (!res.ok) {
    const msg = body?.message || body?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body;
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION PLANS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchPlans = () =>
  request(`${MFG}/plans`);

export const createPlan = (data) =>
  request(`${MFG}/plans`, { method: "POST", body: JSON.stringify(data) });

export const updatePlan = (id, data) =>
  request(`${MFG}/plans/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePlan = (id) =>
  request(`${MFG}/plans/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// BILL OF MATERIALS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchBOMs = () =>
  request(`${MFG}/bom`);

export const createBOM = (data) =>
  request(`${MFG}/bom`, { method: "POST", body: JSON.stringify(data) });

export const updateBOM = (id, data) =>
  request(`${MFG}/bom/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteBOM = (id) =>
  request(`${MFG}/bom/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// WORK ORDERS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchWorkOrders = () =>
  request(`${MFG}/work-orders`);

export const createWorkOrder = (data) =>
  request(`${MFG}/work-orders`, { method: "POST", body: JSON.stringify(data) });

export const updateWorkOrder = (id, data) =>
  request(`${MFG}/work-orders/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteWorkOrder = (id) =>
  request(`${MFG}/work-orders/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION RUNS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchProduction = () =>
  request(`${MFG}/production`);

export const createProduction = (data) =>
  request(`${MFG}/production`, { method: "POST", body: JSON.stringify(data) });

export const updateProduction = (id, data) =>
  request(`${MFG}/production/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteProduction = (id) =>
  request(`${MFG}/production/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// RESOURCES
// ══════════════════════════════════════════════════════════════════════════════
export const fetchResources = () =>
  request(`${MFG}/resources`);

export const createResource = (data) =>
  request(`${MFG}/resources`, { method: "POST", body: JSON.stringify(data) });

export const updateResource = (id, data) =>
  request(`${MFG}/resources/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteResource = (id) =>
  request(`${MFG}/resources/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// MACHINES
// ══════════════════════════════════════════════════════════════════════════════
export const fetchMachines = () =>
  request(`${MFG}/machines`);

export const createMachine = (data) =>
  request(`${MFG}/machines`, { method: "POST", body: JSON.stringify(data) });

export const updateMachine = (id, data) =>
  request(`${MFG}/machines/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteMachine = (id) =>
  request(`${MFG}/machines/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// QUALITY CHECKS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchQualityChecks = () =>
  request(`${MFG}/quality-checks`);

export const createQualityCheck = (data) =>
  request(`${MFG}/quality-checks`, { method: "POST", body: JSON.stringify(data) });

export const updateQualityCheck = (id, data) =>
  request(`${MFG}/quality-checks/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteQualityCheck = (id) =>
  request(`${MFG}/quality-checks/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE
// ══════════════════════════════════════════════════════════════════════════════
export const fetchMaintenance = () =>
  request(`${MFG}/maintenance`);

export const createMaintenance = (data) =>
  request(`${MFG}/maintenance`, { method: "POST", body: JSON.stringify(data) });

export const updateMaintenance = (id, data) =>
  request(`${MFG}/maintenance/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteMaintenance = (id) =>
  request(`${MFG}/maintenance/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchReportsSummary = (from, to) =>
  request(`${MFG}/reports/summary?from=${from}&to=${to}`);
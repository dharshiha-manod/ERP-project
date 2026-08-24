/**
 * src/api/carbonAPI.js
 * ─────────────────────────────────────────────────────────────────
 * All frontend API calls for the Carbon Footprint module.
 * Same conventions as manufacturingAPI.js (X-Industry-Id header
 * from the active workspace, JSON in/out, thrown Error on failure).
 * ─────────────────────────────────────────────────────────────────
 */

const BASE   = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CARBON = `${BASE}/carbon`;

const headers = () => {
  const industryId = localStorage.getItem("manod_active_industry_id");
  return {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${localStorage.getItem("manod_token") || ""}`,
    ...(industryId ? { "X-Industry-Id": industryId } : {}),
  };
};

async function request(url, options = {}) {
  const res = await fetch(url, { headers: headers(), ...options });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || body?.error || `Request failed (${res.status})`);
  }
  return body?.data !== undefined ? body.data : body;
}

// ══════════════════════════════════════════════════════════════════════════════
// INDUSTRY TEMPLATE — what's available for the active workspace's industry_type
// ══════════════════════════════════════════════════════════════════════════════
export const fetchTemplate = () => request(`${CARBON}/template`).then(d => d.template);

// ══════════════════════════════════════════════════════════════════════════════
// PROCESS CONFIG
// ══════════════════════════════════════════════════════════════════════════════
export const fetchProcessConfig = () => request(`${CARBON}/process-config`).then(d => d.processes);
export const saveProcessConfig  = (processes) =>
  request(`${CARBON}/process-config`, { method: "PUT", body: JSON.stringify({ processes }) }).then(d => d.processes);

// ══════════════════════════════════════════════════════════════════════════════
// MACHINES
// ══════════════════════════════════════════════════════════════════════════════
export const fetchMachines = (processKey) =>
  request(`${CARBON}/machines${processKey ? `?process_key=${encodeURIComponent(processKey)}` : ""}`).then(d => d.machines);
export const createMachine = (data)     => request(`${CARBON}/machines`, { method: "POST", body: JSON.stringify(data) }).then(d => d.machine);
export const updateMachine = (id, data) => request(`${CARBON}/machines/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(d => d.machine);
export const deleteMachine = (id)       => request(`${CARBON}/machines/${id}`, { method: "DELETE" });
export const regenerateDeviceToken = (id) => request(`${CARBON}/machines/${id}/regenerate-token`, { method: "POST" }).then(d => d.machine);

// ══════════════════════════════════════════════════════════════════════════════
// EMISSION FACTORS
// ══════════════════════════════════════════════════════════════════════════════
export const fetchEmissionFactors = () => request(`${CARBON}/emission-factors`).then(d => d.factors);
export const saveEmissionFactor   = (data) => request(`${CARBON}/emission-factors`, { method: "PUT", body: JSON.stringify(data) }).then(d => d.factor);

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION BATCHES
// ══════════════════════════════════════════════════════════════════════════════
export const fetchBatches   = () => request(`${CARBON}/batches`).then(d => d.batches);
export const createBatch    = (data) => request(`${CARBON}/batches`, { method: "POST", body: JSON.stringify(data) }).then(d => d.batch);
export const updateBatch    = (id, data) => request(`${CARBON}/batches/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(d => d.batch);
export const deleteBatch    = (id) => request(`${CARBON}/batches/${id}`, { method: "DELETE" });
export const fetchBatchSummary = (id) => request(`${CARBON}/batches/${id}/summary`).then(d => d.summary);

// ══════════════════════════════════════════════════════════════════════════════
// CONSUMPTION LOGS (manual entry — IoT gateways hit /api/carbon/iot/ingest directly)
// ══════════════════════════════════════════════════════════════════════════════
export const fetchConsumption = (filters = {}) => {
  const qs = new URLSearchParams(filters).toString();
  return request(`${CARBON}/consumption${qs ? `?${qs}` : ""}`).then(d => d.logs);
};
export const logConsumption = (data) => request(`${CARBON}/consumption`, { method: "POST", body: JSON.stringify(data) }).then(d => d.log);

// ══════════════════════════════════════════════════════════════════════════════
// FABRIC CONSUMPTION PLANS (size-wise BOM / yield calculator)
// Available Fabric ÷ Consumption per Size × Cutting Efficiency = Expected Qty
// ══════════════════════════════════════════════════════════════════════════════
export const fetchFabricPlans = (batchId) =>
  request(`${CARBON}/fabric-plans${batchId ? `?batch_id=${encodeURIComponent(batchId)}` : ""}`).then(d => d.plans);
export const fetchFabricPlanDetail = (id) =>
  request(`${CARBON}/fabric-plans/${id}`).then(d => ({ plan: d.plan, sizes: d.sizes, computed: d.computed }));
export const createFabricPlan = (data) =>
  request(`${CARBON}/fabric-plans`, { method: "POST", body: JSON.stringify(data) }).then(d => ({ plan: d.plan, sizes: d.sizes, computed: d.computed }));
export const updateFabricPlan = (id, data) =>
  request(`${CARBON}/fabric-plans/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(d => ({ plan: d.plan, sizes: d.sizes, computed: d.computed }));
export const deleteFabricPlan = (id) => request(`${CARBON}/fabric-plans/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export const fetchDashboard = (filters = {}) => {
  const qs = new URLSearchParams(filters).toString();
  return request(`${CARBON}/dashboard${qs ? `?${qs}` : ""}`).then(d => d.dashboard);
};

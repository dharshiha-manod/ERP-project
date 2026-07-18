// src/api/registerAPI.js
const BASES = [
  "http://localhost:5000/api",
  "http://localhost:3000/api",
  "http://127.0.0.1:5000/api",
];

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("manod_token");
  let lastErr = null;
  for (const base of BASES) {
    try {
      const r = await fetch(`${base}${path}`, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          ...(opts.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(8000),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(body.message || body.error || `HTTP ${r.status}`);
      }
      return body;
    } catch (e) {
      lastErr = e;
      if (e.message && !e.message.includes("Failed to fetch")) throw e;
      // network-level failure only — try next base
    }
  }
  throw lastErr || new Error("Unable to reach server");
}

const registerAPI = {
  getCurrent: () => apiFetch("/register/current"),
  openRegister: (payload) =>
    apiFetch("/register/open", { method: "POST", body: JSON.stringify(payload) }),
  closeRegister: (id, payload) =>
    apiFetch(`/register/${id}/close`, { method: "POST", body: JSON.stringify(payload) }),
  addCashMovement: (id, payload) =>
    apiFetch(`/register/${id}/cash-movement`, { method: "POST", body: JSON.stringify(payload) }),
};

export default registerAPI;
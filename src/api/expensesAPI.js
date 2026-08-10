/**
 * src/api/expensesAPI.js
 * Axios client for the Expenses module.
 * Mirrors the convention used by stockAdjustmentAPI.js / productAPI.js
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("manod_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const industryId = localStorage.getItem("manod_active_industry_id");
  if (industryId) config.headers["X-Industry-Id"] = industryId;
  return config;
});

export const expensesAPI = {
  list: (params = {}) => client.get("/expenses", { params }).then((r) => r.data),
  get: (id) => client.get(`/expenses/${id}`).then((r) => r.data),
  create: (payload) => client.post("/expenses", payload).then((r) => r.data),
  update: (id, payload) => client.put(`/expenses/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/expenses/${id}`).then((r) => r.data),

  categories: {
    list: () => client.get("/expenses/categories").then((r) => r.data),
    create: (payload) => client.post("/expenses/categories", payload).then((r) => r.data),
    update: (id, payload) => client.put(`/expenses/categories/${id}`, payload).then((r) => r.data),
    remove: (id) => client.delete(`/expenses/categories/${id}`).then((r) => r.data),
  },
};

export default expensesAPI;
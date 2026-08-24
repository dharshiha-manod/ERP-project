/**
 * ============================================================
 * ROLE API - Centralized API Layer
 * Handles token expiry + all CRUD + permissions
 * Mirrors userApi.js pattern for consistency
 * ============================================================
 */

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

// ✅ Get token from localStorage
const getToken = () => localStorage.getItem("manod_token");
const getIndustryId = () => localStorage.getItem("manod_active_industry_id"); // matches STORAGE_KEY in IndustryContext.jsx

// If token expired → clear storage → redirect to login
const handleUnauthorized = () => {
  localStorage.removeItem("manod_token");
  localStorage.removeItem("manod_user");
  window.location.href = "/login";
};

// Request headers with Authorization Bearer token
const headers = () => {
  const industryId = getIndustryId();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
    ...(industryId ? { "x-industry-id": industryId } : {}),
  };
};

// Handle API response and check for auth errors
const handleResponse = async (res) => {
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired. Please login again.");
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ==========================================
// ROLE CRUD OPERATIONS
// ==========================================

/**
 * GET all roles
 * Returns: { success: true, data: [roles...] }
 */
export const fetchAllRoles = async () => {
  const res = await fetch(`${BASE_URL}/roles`, { headers: headers() });
  const data = await handleResponse(res);
  return data.data; // Return roles array
};

/**
 * GET role by ID (includes permissions)
 * Returns: { success: true, data: { id, name, permissions: [...] } }
 */
export const fetchRoleById = async (id) => {
  const res = await fetch(`${BASE_URL}/roles/${id}`, { headers: headers() });
  const data = await handleResponse(res);
  return data.data; // Return role object
};

/**
 * CREATE new role
 * Returns: { success: true, data: newRole }
 */
export const createRole = async (roleData) => {
  const res = await fetch(`${BASE_URL}/roles`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(roleData),
  });
  const data = await handleResponse(res);
  return data.data; // Return created role
};

/**
 * UPDATE existing role
 * Returns: { success: true, data: updatedRole }
 */
export const updateRole = async (id, roleData) => {
  const res = await fetch(`${BASE_URL}/roles/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(roleData),
  });
  const data = await handleResponse(res);
  return data.data; // Return updated role
};

/**
 * DELETE role
 * Returns: { success: true, message: "Role deleted successfully" }
 */
export const deleteRole = async (id) => {
  const res = await fetch(`${BASE_URL}/roles/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handleResponse(res);
};

// ==========================================
// PERMISSIONS
// ==========================================

/**
 * GET all available permissions grouped by category
 * Returns: { success: true, data: { "User": [...], "Roles": [...] } }
 */
export const fetchAllPermissions = async () => {
  const res = await fetch(`${BASE_URL}/roles/permissions`, {
    headers: headers(),
  });
  const data = await handleResponse(res);
  return data.data; // Return permissions object/array
};

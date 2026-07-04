// src/api/notificationTemplatesAPI.js
const BASE_URL = "http://localhost:5000/api/notification-templates";

function authHeaders() {
  const token = localStorage.getItem("manod_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Load a single template by its type key (e.g. "customer_new_sale").
 * Always resolves — the backend returns an empty shell if nothing's
 * been saved yet, so the form can just render blank fields.
 */
export async function getTemplateByType(templateType) {
  const res = await fetch(`${BASE_URL}/type/${encodeURIComponent(templateType)}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to load notification template");
  }
  return data.template;
}

/**
 * Save (create or update) a template by its type key.
 * payload: { email_subject, cc_email, bcc_email, email_body, auto_email,
 *            sms_body, auto_sms, whatsapp_body, auto_whatsapp }
 */
export async function saveTemplateByType(templateType, payload) {
  const res = await fetch(`${BASE_URL}/type/${encodeURIComponent(templateType)}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to save notification template");
  }
  return data.template;
}

export async function getAllTemplates(filters = {}) {
  const qs = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}${qs ? `?${qs}` : ""}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to load notification templates");
  }
  return data.templates;
}
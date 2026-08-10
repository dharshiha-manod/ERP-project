/**
 * ════════════════════════════════════════════════════════════
 * SETTINGS API - Frontend API Layer
 * Matches your existing API file pattern (productAPI.js, contactsAPI.js, etc)
 * ════════════════════════════════════════════════════════════
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/settings`
  : 'http://localhost:5000/api/settings';

const getToken = () => localStorage.getItem('manod_token');
// ── GENERAL SETTINGS ───────────────────────────────────────────
// NEW
// NEW
const getIndustryId = () => localStorage.getItem("manod_active_industry_id"); // matches STORAGE_KEY in IndustryContext.jsx

// NEW — shared header builder for every industry-scoped Settings endpoint
// (Tax Rates, Locations, Printers, Barcode, Invoice). Business Settings/Logo
// intentionally do NOT use this — those stay global across industries.
const industryHeaders = (extra = {}) => {
  const industryId = getIndustryId();
  return {
    Authorization: `Bearer ${getToken()}`,
    ...(industryId ? { "x-industry-id": industryId } : {}),
    ...extra,
  };
};

// NEW
export const getGeneralSettings = async () => {
  try {
    const token = localStorage.getItem("manod_token");
    const industryId = localStorage.getItem("manod_active_industry_id");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/settings/general?t=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(industryId ? { "x-industry-id": industryId } : {}),
        },
        cache: 'no-store',
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// NEW
export const updateGeneralSettings = async (payload) => {
  try {
    const token = localStorage.getItem("manod_token");
    const industryId = localStorage.getItem("manod_active_industry_id");
    const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/settings/general`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(industryId ? { "x-industry-id": industryId } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};
// ─── TAX RATES ──────────────────────────────────────────────
export const getTaxRates = async () => {
  try {
    const res = await fetch(`${API_BASE}/tax-rates`, {
     headers: industryHeaders()
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error fetching tax rates:', error);
    return { success: false, message: error.message };
  }
};

export const createTaxRate = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/tax-rates`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error creating tax rate:', error);
    return { success: false, message: error.message };
  }
};

export const updateTaxRate = async (id, data) => {
  try {
    const res = await fetch(`${API_BASE}/tax-rates/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error updating tax rate:', error);
    return { success: false, message: error.message };
  }
};

export const deleteTaxRate = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/tax-rates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error deleting tax rate:', error);
    return { success: false, message: error.message };
  }
};

// ─── BUSINESS LOCATIONS ────────────────────────────────────
export const getLocations = async () => {
  try {
    const res = await fetch(`${API_BASE}/locations`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error fetching locations:', error);
    return { success: false, message: error.message };
  }
};

export const createLocation = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error creating location:', error);
    return { success: false, message: error.message };
  }
};

export const updateLocation = async (id, data) => {
  try {
    const res = await fetch(`${API_BASE}/locations/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error updating location:', error);
    return { success: false, message: error.message };
  }
};

// NEW
export const deactivateLocation = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/locations/${id}/deactivate`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error deactivating location:', error);
    return { success: false, message: error.message };
  }
};

export const deleteLocation = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/locations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error deleting location:', error);
    return { success: false, message: error.message };
  }
};
// ─── RECEIPT PRINTERS ──────────────────────────────────────
export const getPrinters = async () => {
  try {
    const res = await fetch(`${API_BASE}/printers`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error fetching printers:', error);
    return { success: false, message: error.message };
  }
};

export const createPrinter = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/printers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error creating printer:', error);
    return { success: false, message: error.message };
  }
};

export const updatePrinter = async (id, data) => {
  try {
    const res = await fetch(`${API_BASE}/printers/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error updating printer:', error);
    return { success: false, message: error.message };
  }
};

export const deletePrinter = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/printers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error deleting printer:', error);
    return { success: false, message: error.message };
  }
};

// ─── BUSINESS SETTINGS ────────────────────────────────────
// NEW
export const getBusinessSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/business?t=${Date.now()}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
      cache: 'no-store'
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error fetching business settings:', error);
    return { success: false, message: error.message };
  }
};

export const updateBusinessSettings = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/business`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error updating business settings:', error);
    return { success: false, message: error.message };
  }
};

// ─── BUSINESS LOGO ─────────────────────────────────────────
export const uploadBusinessLogo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await fetch(`${API_BASE}/business/logo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }, // NOTE: no Content-Type, browser sets multipart boundary
      body: formData
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    return { success: false, message: error.message };
  }
};

// ─── BARCODE SETTINGS ──────────────────────────────────────
export const getBarcodeSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/barcode`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error fetching barcode settings:', error);
    return { success: false, message: error.message };
  }
};

export const updateBarcodeSettings = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/barcode`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error updating barcode settings:', error);
    return { success: false, message: error.message };
  }
};

// ─── INVOICE SETTINGS ──────────────────────────────────────
export const getInvoiceSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/invoice`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error fetching invoice settings:', error);
    return { success: false, message: error.message };
  }
};

export const updateInvoiceSettings = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/invoice`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('❌ Error updating invoice settings:', error);
    return { success: false, message: error.message };
  }
};
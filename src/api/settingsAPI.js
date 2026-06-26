/**
 * ════════════════════════════════════════════════════════════
 * SETTINGS API - Frontend API Layer
 * Matches your existing API file pattern (productAPI.js, contactsAPI.js, etc)
 * ════════════════════════════════════════════════════════════
 */

const API_BASE = 'http://localhost:5000/api/settings';

const getToken = () => localStorage.getItem('manod_token');

// ─── TAX RATES ──────────────────────────────────────────────
export const getTaxRates = async () => {
  try {
    const res = await fetch(`${API_BASE}/tax-rates`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
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
export const getBusinessSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/business`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
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
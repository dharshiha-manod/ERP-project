/**
 * ====================================================
 * SALES COMMISSION AGENTS API CLIENT
 * Frontend API calls to backend
 * ====================================================
 */
const ENDPOINT = "http://localhost:5000/api/sales-commission-agents";
// ── Get auth token from localStorage ──
const getAuthToken = () => {
  const token = localStorage.getItem('manod_token');
  if (!token) throw new Error('Authentication token not found. Please login.');
  return token;
};

// ── Helper: Make API call with error handling ──
const apiFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }

  return data;
};

/**
 * ── GET ALL AGENTS ──
 * Fetch paginated list of agents with search and filters
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 25)
 * @param {string} params.search - Search term (name, email, region)
 * @param {string} params.status - Filter by status
 * @param {string} params.region - Filter by region
 * @returns {Promise<Object>} - { success, total, page, limit, pages, agents }
 */
export const getAllAgents = async (params = {}) => {
  const queryString = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 25,
    search: params.search || '',
    status: params.status || '',
    region: params.region || ''
  }).toString();

  const data = await apiFetch(`${ENDPOINT}?${queryString}`);
  return data;
};

/**
 * ── GET SINGLE AGENT ──
 * Fetch details of a specific agent
 * 
 * @param {number} id - Agent ID
 * @returns {Promise<Object>} - { success, agent }
 */
export const getAgentById = async (id) => {
  const data = await apiFetch(`${ENDPOINT}/${id}`);
  return data.agent;
};

/**
 * ── GET DASHBOARD STATS ──
 * Fetch aggregated statistics for dashboard
 * 
 * @returns {Promise<Object>} - { success, stats }
 */
export const getDashboardStats = async () => {
  const data = await apiFetch(`${ENDPOINT}/stats`);
  return data;
};

/**
 * ── CREATE NEW AGENT ──
 * Add a new sales commission agent
 * 
 * @param {Object} agentData - Agent information
 * @param {string} agentData.name - Agent name (required)
 * @param {string} agentData.email - Agent email (required)
 * @param {string} agentData.phone - Agent phone
 * @param {string} agentData.commission_type - Commission type (required)
 * @param {number} agentData.commission_rate - Commission rate (required)
 * @param {string} agentData.status - Agent status
 * @param {number} agentData.customers - Customers assigned
 * @param {string} agentData.region - Region
 * @param {string} agentData.join_date - Join date
 * @param {string} agentData.notes - Notes
 * @returns {Promise<Object>} - { success, message, agent }
 */
export const createAgent = async (agentData) => {
  const data = await apiFetch(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(agentData)
  });
  return data;
};

/**
 * ── UPDATE AGENT ──
 * Update an existing agent's information
 * 
 * @param {number} id - Agent ID
 * @param {Object} agentData - Updated agent information
 * @returns {Promise<Object>} - { success, message, agent }
 */
export const updateAgent = async (id, agentData) => {
  const data = await apiFetch(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agentData)
  });
  return data;
};

/**
 * ── DELETE AGENT ──
 * Delete an agent
 * 
 * @param {number} id - Agent ID
 * @returns {Promise<Object>} - { success, message, agent }
 */
export const deleteAgent = async (id) => {
  const data = await apiFetch(`${ENDPOINT}/${id}`, {
    method: 'DELETE'
  });
  return data;
};

/**
 * ── RECALCULATE COMMISSIONS ──
 * Recalculate commissions for all agents
 * 
 * @returns {Promise<Object>} - { success, message, data }
 */
export const recalculateCommissions = async () => {
  const data = await apiFetch(`${ENDPOINT}/recalculate`, {
    method: 'POST'
  });
  return data;
};

/**
 * ── EXPORT AGENTS TO CSV ──
 * Generate and download CSV file
 * 
 * @param {Array} agents - List of agents to export
 */
export const exportToCSV = (agents) => {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Commission Type', 'Commission %', 'Status', 'Customers', 'Sales This Month', 'Total Earned'];
  const rows = agents.map(a => [
    a.id,
    a.name,
    a.email,
    a.phone,
    a.commission_type,
    a.commission_rate,
    a.status,
    a.customers,
    a.salesThisMonth || 0,
    a.totalEarned || 0
  ]);

  const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales-commission-agents-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * ── EXPORT AGENTS TO EXCEL ──
 * Generate and download Excel file
 * 
 * @param {Array} agents - List of agents to export
 */
export const exportToExcel = (agents) => {
  const html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Commission Type</th>
          <th>Rate (%)</th>
          <th>Status</th>
          <th>Customers</th>
          <th>Sales/Month</th>
          <th>Total Earned</th>
        </tr>
      </thead>
      <tbody>
        ${agents.map(a => `
          <tr>
            <td>${a.id}</td>
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td>${a.phone}</td>
            <td>${a.commission_type}</td>
            <td>${a.commission_rate}</td>
            <td>${a.status}</td>
            <td>${a.customers}</td>
            <td>${a.salesThisMonth || 0}</td>
            <td>${a.totalEarned || 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales-commission-agents-${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * ── PRINT AGENTS ──
 * Open print dialog with agents table
 * 
 * @param {Array} agents - List of agents to print
 */
export const printAgents = (agents) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales Commission Agents</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>Sales Commission Agents Report</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Commission Type</th>
              <th>Rate</th>
              <th>Customers</th>
              <th>Sales/Month</th>
              <th>Total Earned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${agents.map(a => `
              <tr>
                <td>${a.name}</td>
                <td>${a.email}</td>
                <td>${a.phone}</td>
                <td>${a.commission_type}</td>
                <td>${a.commission_rate}%</td>
                <td>${a.customers}</td>
                <td>₹${(a.salesThisMonth || 0).toLocaleString('en-IN')}</td>
                <td>₹${(a.totalEarned || 0).toLocaleString('en-IN')}</td>
                <td>${a.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=600,width=900');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};
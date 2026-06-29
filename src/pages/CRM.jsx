import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart3, TrendingUp, Users, FileText, MessageSquare, Settings,
  Plus, Edit2, Trash2, Eye, Search, Download, Check,
  AlertCircle, Megaphone, Layout, UserCheck, PieChart, Globe,
  Star, CheckCircle2, Phone, Mail, Building2, Calendar, X
} from "lucide-react";
import * as crmAPI from "../api/crmAPI";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const COLORS = {
  primary: "#1a5c38", primaryLight: "#16a34a", secondary: "#0891b2",
  danger: "#dc2626", warning: "#d97706", success: "#15803d",
  info: "#2563eb", neutral: "#6b7280", purple: "#7c3aed",
  bg: "#f9fafb", bgCard: "#ffffff", border: "#e5e7eb",
};

const USERS   = ["Er Sarath Raj", "Ms Dharshiha C", "Mr Leejin"];
const STAGES  = ["New", "Contacted", "Qualified", "Proposal"];
const SOURCES = ["Website", "Referral", "Cold Call", "Exhibition", "Social Media", "Email Campaign"];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v || 0);

const getInitials = (name) =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const getStageColor     = (s) => ({ New: "#f3f4f6", Contacted: "#dbeafe", Qualified: "#ede9fe", Proposal: "#fef3c7" }[s] || "#f3f4f6");
const getStageTextColor = (s) => ({ New: "#374151", Contacted: "#1d4ed8", Qualified: "#6d28d9", Proposal: "#b45309" }[s] || "#374151");

function exportCSV(rows, filename = "export.csv") {
  if (!rows?.length) { alert("Nothing to export."); return; }
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: filename,
  });
  a.click();
}

// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
const KPICard = ({ icon: Icon, label, value, color, trend }) => (
  <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, display: "flex", gap: 16, alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
    <div style={{ width: 56, height: 56, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={28} color={color} strokeWidth={1.5} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1f2937", lineHeight: 1 }}>{value}</div>
      {trend && <div style={{ fontSize: 11, color: COLORS.success, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={14} />{trend}</div>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Sent: { bg: "#dcfce7", color: "#15803d" }, Viewed: { bg: "#ccfbf1", color: "#0f766e" },
    Accepted: { bg: "#dbeafe", color: "#1d4ed8" }, Rejected: { bg: "#fee2e2", color: "#b91c1c" },
    Scheduled: { bg: "#fef3c7", color: "#b45309" }, Completed: { bg: "#dcfce7", color: "#15803d" },
    Open: { bg: "#dbeafe", color: "#1d4ed8" }, Cancelled: { bg: "#fee2e2", color: "#b91c1c" },
    Draft: { bg: "#f3f4f6", color: "#374151" }, Active: { bg: "#dcfce7", color: "#15803d" },
    Inactive: { bg: "#f3f4f6", color: "#374151" }, Customer: { bg: "#dcfce7", color: "#15803d" },
    Call: { bg: "#ede9fe", color: "#6d28d9" }, Email: { bg: "#dbeafe", color: "#1d4ed8" },
    Meeting: { bg: "#fef3c7", color: "#b45309" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#374151" };
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 8, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>{status}</span>;
};

const Avatar = ({ name, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: COLORS.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 40 ? 16 : 12, fontWeight: 600, flexShrink: 0 }}>
    {getInitials(name)}
  </div>
);

const Button = ({ children, variant = "primary", size = "md", onClick, icon: Icon, disabled }) => {
  const base = { padding: size === "sm" ? "6px 12px" : "10px 16px", fontSize: size === "sm" ? 12 : 13, fontWeight: 600, border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s", opacity: disabled ? 0.6 : 1 };
  const vars = { primary: { background: COLORS.primary, color: "white" }, secondary: { background: COLORS.bg, color: "#1f2937", border: `1px solid ${COLORS.border}` }, danger: { background: COLORS.danger, color: "white" } };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...vars[variant] }}>{Icon && <Icon size={16} />}{children}</button>;
};

const Modal = ({ title, open, onClose, children, maxWidth = 600 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: COLORS.bgCard, borderRadius: 12, width: "90%", maxWidth, maxHeight: "90vh", overflow: "auto", padding: 28, boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: COLORS.neutral }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", padding: "8px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" };
const labelStyle = { fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 };

const Th = ({ children }) => (
  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: COLORS.neutral, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg, whiteSpace: "nowrap" }}>{children}</th>
);
const Td = ({ children, style: s }) => (
  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, ...s }}>{children}</td>
);
const NoData = ({ cols, message = "No records found" }) => (
  <tr><td colSpan={cols} style={{ padding: 40, textAlign: "center", color: COLORS.neutral }}>{message}</td></tr>
);

const TableCard = ({ title, count, children, onExport, searchVal, onSearch }) => (
  <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{title}{count !== undefined && ` (${count})`}</h3>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {onSearch && (
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.neutral }} />
            <input placeholder="Search…" value={searchVal} onChange={e => onSearch(e.target.value)} style={{ ...inputStyle, width: 200, paddingLeft: 32 }} />
          </div>
        )}
        {onExport && <Button variant="secondary" size="sm" icon={Download} onClick={onExport}>Export</Button>}
      </div>
    </div>
    <div style={{ overflowX: "auto" }}>{children}</div>
  </div>
);

const FilterBar = ({ children }) => (
  <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
    {children}
  </div>
);
const FilterGroup = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.neutral, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════════════════
const CRMNav = ({ activeTab, onTabChange, counts = {} }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "leads",     label: "Leads",     icon: Users,        count: counts.leads },
    { id: "proposals", label: "Proposals", icon: FileText,     count: counts.proposals },
    { id: "followups", label: "Follow Ups",icon: MessageSquare },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "templates", label: "Templates", icon: Layout },
    { id: "contacts",  label: "Contacts",  icon: UserCheck },
    { id: "reports",   label: "Reports",   icon: PieChart },
    { id: "sources",   label: "Sources",   icon: Globe },
    { id: "settings",  label: "Settings",  icon: Settings },
  ];
  return (
    <div style={{ background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}`, display: "flex", overflowX: "auto" }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{ padding: "14px 18px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? COLORS.primary : COLORS.neutral, borderBottom: active ? `3px solid ${COLORS.primary}` : "3px solid transparent", whiteSpace: "nowrap" }}>
            <Icon size={15} strokeWidth={1.5} />{tab.label}
            {tab.count > 0 && <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: COLORS.primary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "0 5px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
const CRMDashboard = ({ leads, proposals, followups }) => {
  const totalLeads = leads.length;
  const totalProposalValue = proposals.reduce((s, p) => s + (p.value || 0), 0);
  const acceptedValue = proposals.filter(p => p.status === "Accepted").reduce((s, p) => s + (p.value || 0), 0);
  const pendingProposals = proposals.filter(p => p.status === "Sent").length;
  const leaderboard = USERS.map(u => ({ name: u, leads: leads.filter(l => l.assigned === u).length })).sort((a, b) => b.leads - a.leads);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>CRM Dashboard</h1>
        <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Overview of your sales pipeline and customer relationships</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <KPICard icon={Users}     label="Total Leads"          value={totalLeads}                     color={COLORS.primary}   trend="+12% this month" />
        <KPICard icon={FileText}  label="Pipeline Value"       value={formatCurrency(totalProposalValue)} color={COLORS.secondary} />
        <KPICard icon={Check}     label="Accepted Proposals"   value={formatCurrency(acceptedValue)}  color={COLORS.success}   />
        <KPICard icon={AlertCircle} label="Pending Proposals"  value={pendingProposals}               color={COLORS.warning}   />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ background: COLORS.bgCard, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg, display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Leads</h3>
            <span style={{ fontSize: 12, color: COLORS.neutral }}>{leads.length} total</span>
          </div>
          {leads.length === 0 && <div style={{ padding: 32, textAlign: "center", color: COLORS.neutral }}>No leads yet</div>}
          {leads.slice(0, 5).map((lead, idx) => (
            <div key={lead.id} style={{ padding: "14px 20px", borderBottom: idx < 4 ? `1px solid ${COLORS.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{lead.name}</div>
                <div style={{ fontSize: 12, color: COLORS.neutral }}>{lead.mobile}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, background: getStageColor(lead.stage), color: getStageTextColor(lead.stage), fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{lead.stage}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(lead.value)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: COLORS.bgCard, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Team Performance</h3>
          </div>
          {leaderboard.map((m, idx) => (
            <div key={m.name} style={{ padding: "14px 20px", borderBottom: idx < leaderboard.length - 1 ? `1px solid ${COLORS.border}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={m.name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: COLORS.neutral }}>{m.leads} leads</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{idx + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// LEADS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const LeadsPage = ({ leads, onAddLead, onEditLead, onDeleteLead, onConvertLead, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const blankForm = { name: "", contact: "", email: "", phone: "", company: "", source: "Website", stage: "New", value: "", assigned: USERS[0], notes: "" };
  const [formData, setFormData] = useState(blankForm);

  const filteredLeads = useMemo(() =>
    leads.filter(l => {
      const q = searchTerm.toLowerCase();
      const match = !q || [l.name, l.contact, l.email, l.mobile, l.phone].some(v => (v || "").toLowerCase().includes(q));
      return match && (!filterStage || l.stage === filterStage) && (!filterSource || l.source === filterSource) && (!filterAssigned || l.assigned === filterAssigned);
    }), [leads, searchTerm, filterStage, filterSource, filterAssigned]);

  const resetForm = () => { setFormData(blankForm); setEditingId(null); };

  const openEdit = (lead) => {
    setFormData({ ...lead, phone: lead.phone || lead.mobile || "" });
    setEditingId(lead.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) { alert("Lead Name and Phone are required"); return; }
    setLoading(true);
    try {
      if (editingId) { await onEditLead(editingId, formData); }
      else { await onAddLead({ ...formData, value: Number(formData.value) || 0 }); }
      setShowModal(false); resetForm(); onRefresh();
    } catch (err) { alert("Error saving lead: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    setLoading(true);
    try { await onDeleteLead(id); onRefresh(); }
    catch (err) { alert("Error deleting lead: " + err.message); }
    finally { setLoading(false); }
  };

  const handleConvert = async (id) => {
    if (!window.confirm("Convert this lead to customer?")) return;
    setLoading(true);
    try { await onConvertLead(id); alert("Lead converted!"); onRefresh(); }
    catch (err) { alert("Error converting lead: " + err.message); }
    finally { setLoading(false); }
  };

  const stageColors = { New: COLORS.neutral, Contacted: COLORS.info, Qualified: COLORS.purple, Proposal: COLORS.warning };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Leads</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Manage and track your sales leads · {filteredLeads.length} records</p>
        </div>
        <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Add New Lead</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {STAGES.map(s => {
          const cnt = leads.filter(l => l.stage === s).length;
          return (
            <div key={s} onClick={() => setFilterStage(filterStage === s ? "" : s)}
              style={{ background: COLORS.bgCard, border: `1px solid ${filterStage === s ? stageColors[s] : COLORS.border}`, borderLeft: `4px solid ${stageColors[s]}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer" }}>
              <div style={{ fontSize: 11, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase" }}>{s}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stageColors[s], marginTop: 4 }}>{cnt}</div>
            </div>
          );
        })}
      </div>

      <FilterBar>
        <FilterGroup label="Search">
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.neutral }} />
            <input placeholder="Search leads…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: 220, paddingLeft: 32 }} />
          </div>
        </FilterGroup>
        <FilterGroup label="Stage">
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ ...inputStyle, width: 140 }}>
            <option value="">All Stages</option>{STAGES.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Source">
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="">All Sources</option>{SOURCES.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Assigned">
          <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="">All Users</option>{USERS.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <button onClick={() => { setFilterStage(""); setFilterSource(""); setFilterAssigned(""); setSearchTerm(""); }}
          style={{ ...inputStyle, width: "auto", background: COLORS.bg, cursor: "pointer", color: COLORS.neutral, marginTop: 16 }}>✕ Clear</button>
        <div style={{ marginLeft: "auto", marginTop: 16 }}>
          <Button variant="secondary" size="sm" icon={Download}
            onClick={() => exportCSV([["ID","Name","Phone","Email","Company","Source","Stage","Value","Assigned"],
              ...filteredLeads.map(l => [l.id, l.name, l.mobile||l.phone, l.email, l.company, l.source, l.stage, l.value||0, l.assigned])], "leads.csv")}>
            Export CSV
          </Button>
        </div>
      </FilterBar>

      <TableCard title="All Leads" count={filteredLeads.length}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>{["Name","Company","Phone","Email","Source","Stage","Value","Assigned","Status","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? <NoData cols={10} /> :
              filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <Td><span style={{ fontWeight: 600 }}>{lead.name}</span></Td>
                  <Td>{lead.company || "—"}</Td>
                  <Td>{lead.mobile || lead.phone || "—"}</Td>
                  <Td style={{ color: COLORS.secondary, fontSize: 12 }}>{lead.email || "—"}</Td>
                  <Td>{lead.source ? <span style={{ padding: "3px 8px", borderRadius: 6, background: "#f3f4f6", color: "#374151", fontSize: 11, fontWeight: 600 }}>{lead.source}</span> : "—"}</Td>
                  <Td><span style={{ padding: "4px 10px", borderRadius: 6, background: getStageColor(lead.stage), color: getStageTextColor(lead.stage), fontSize: 12, fontWeight: 600 }}>{lead.stage}</span></Td>
                  <Td style={{ fontWeight: 700 }}>{lead.value ? formatCurrency(lead.value) : "—"}</Td>
                  <Td><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={lead.assigned} /><span style={{ fontSize: 11, color: COLORS.neutral }}>{lead.assigned?.split(" ")[0]}</span></div></Td>
                  <Td>{lead.converted ? <StatusBadge status="Customer" /> : <span style={{ padding: "3px 8px", borderRadius: 6, background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 600 }}>Active</span>}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setViewLead(lead)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.secondary, padding: "4px 6px" }}><Eye size={15} /></button>
                      <button onClick={() => openEdit(lead)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.warning, padding: "4px 6px" }}><Edit2 size={15} /></button>
                      {!lead.converted && <button onClick={() => handleConvert(lead.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.success, padding: "4px 6px" }} title="Convert to Customer"><Star size={15} /></button>}
                      <button onClick={() => handleDelete(lead.id)} disabled={loading} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }}><Trash2 size={15} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      {/* View Modal */}
      <Modal title="Lead Details" open={!!viewLead} onClose={() => setViewLead(null)}>
        {viewLead && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 20 }}>
              {[["Name", viewLead.name], ["Company", viewLead.company || "—"], ["Phone", viewLead.mobile || viewLead.phone || "—"], ["Email", viewLead.email || "—"], ["Source", viewLead.source || "—"], ["Stage", viewLead.stage], ["Assigned", viewLead.assigned], ["Value", viewLead.value ? formatCurrency(viewLead.value) : "—"], ["Status", viewLead.converted ? "Customer" : "Active Lead"]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: COLORS.neutral, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
            {viewLead.notes && <div style={{ background: COLORS.bg, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13 }}>{viewLead.notes}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setViewLead(null)}>Close</Button>
              <Button onClick={() => { setViewLead(null); openEdit(viewLead); }}>Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal title={editingId ? "Edit Lead" : "Add New Lead"} open={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[["Lead Name *", "name", "text"], ["Company Name", "company", "text"], ["Phone *", "phone", "text"], ["Email", "email", "email"], ["Lead Value (₹)", "value", "number"]].map(([lbl, key, type]) => (
            <div key={key}>
              <label style={labelStyle}>{lbl}</label>
              <input type={type} value={formData[key] || ""} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Source</label>
            <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} style={inputStyle}>
              {SOURCES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Stage</label>
            <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} style={inputStyle}>
              {STAGES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Assigned To</label>
            <select value={formData.assigned} onChange={e => setFormData({ ...formData, assigned: e.target.value })} style={inputStyle}>
              {USERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{editingId ? "Update Lead" : "Save Lead"}</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PROPOSALS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const ProposalsPage = ({ proposals, leads, onAddProposal, onDeleteProposal, onStatusChange, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSentBy, setFilterSentBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ lead: "", subject: "", sentBy: USERS[0], value: "", status: "Draft" });

  const filtered = useMemo(() =>
    proposals.filter(p => {
      const q = searchTerm.toLowerCase();
      const match = !q || [p.lead, p.lead_name, p.subject, p.sentBy, p.sent_by].some(v => (v || "").toLowerCase().includes(q));
      return match && (!filterStatus || p.status === filterStatus) && (!filterSentBy || (p.sentBy || p.sent_by) === filterSentBy);
    }), [proposals, searchTerm, filterStatus, filterSentBy]);

  const totalValue    = filtered.reduce((s, p) => s + (p.value || 0), 0);
  const acceptedValue = filtered.filter(p => p.status === "Accepted").reduce((s, p) => s + (p.value || 0), 0);
  const pendingValue  = filtered.filter(p => p.status === "Sent" || p.status === "Viewed").reduce((s, p) => s + (p.value || 0), 0);

  const handleSave = async () => {
    if (!formData.lead || !formData.subject) { alert("Lead and Subject are required."); return; }
    setLoading(true);
    try {
      await onAddProposal({ ...formData, value: Number(formData.value) || 0 });
      setShowModal(false);
      setFormData({ lead: "", subject: "", sentBy: USERS[0], value: "", status: "Draft" });
      onRefresh();
    } catch (err) { alert("Error saving proposal: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this proposal?")) return;
    setLoading(true);
    try { await onDeleteProposal(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Proposals</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Track your sales proposals and quotations</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Create Proposal</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[["Total Value", totalValue, COLORS.primary], ["Accepted", acceptedValue, COLORS.success], ["Pending Response", pendingValue, COLORS.warning]].map(([label, val, color]) => (
          <div key={label} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{formatCurrency(val)}</div>
          </div>
        ))}
      </div>

      <FilterBar>
        <FilterGroup label="Search">
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.neutral }} />
            <input placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: 220, paddingLeft: 32 }} />
          </div>
        </FilterGroup>
        <FilterGroup label="Status">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 150 }}>
            <option value="">All Statuses</option>
            {["Draft","Sent","Viewed","Accepted","Rejected"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Sent By">
          <select value={filterSentBy} onChange={e => setFilterSentBy(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="">All Users</option>{USERS.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <button onClick={() => { setFilterStatus(""); setFilterSentBy(""); setSearchTerm(""); }} style={{ ...inputStyle, width: "auto", background: COLORS.bg, cursor: "pointer", color: COLORS.neutral, marginTop: 16 }}>✕ Clear</button>
      </FilterBar>

      <TableCard title="All Proposals" count={filtered.length}
        onExport={() => exportCSV([["Lead","Subject","Value","Status","Sent By"], ...filtered.map(p => [p.lead||p.lead_name, p.subject, p.value, p.status, p.sentBy||p.sent_by])], "proposals.csv")}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Lead","Subject","Value","Status","Sent By","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={6} /> :
              filtered.map(p => (
                <tr key={p.id}>
                  <Td style={{ fontWeight: 600 }}>{p.lead || p.lead_name}</Td>
                  <Td>{p.subject}</Td>
                  <Td style={{ fontWeight: 700 }}>{formatCurrency(p.value)}</Td>
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td>{p.sentBy || p.sent_by}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {p.status === "Sent" && <button onClick={() => onStatusChange(p.id, "Accepted")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.success, padding: "4px 6px" }} title="Mark Accepted"><CheckCircle2 size={15} /></button>}
                      {p.status === "Sent" && <button onClick={() => onStatusChange(p.id, "Rejected")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }} title="Mark Rejected"><X size={15} /></button>}
                      <button onClick={() => handleDelete(p.id)} disabled={loading} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }}><Trash2 size={15} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="Create Proposal" open={showModal} onClose={() => setShowModal(false)}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Lead Name *</label>
            <input list="propLeads" value={formData.lead} onChange={e => setFormData({ ...formData, lead: e.target.value })} style={inputStyle} placeholder="Type or select a lead" />
            <datalist id="propLeads">{leads.map(l => <option key={l.id} value={l.name} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} style={inputStyle} placeholder="Proposal subject" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Sent By</label>
              <select value={formData.sentBy} onChange={e => setFormData({ ...formData, sentBy: e.target.value })} style={inputStyle}>
                {USERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Value (₹)</label>
              <input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} style={inputStyle} placeholder="0" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
              {["Draft","Sent","Viewed","Accepted","Rejected"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>Create Proposal</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FOLLOW UPS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const FollowUpsPage = ({ followups, leads, onAddFollowup, onDeleteFollowup, onMarkComplete, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);
  const blankForm = { lead: "", title: "", type: "Call", status: "Scheduled", assigned: USERS[0], start: "", end: "", desc: "" };
  const [formData, setFormData] = useState(blankForm);

  const filtered = useMemo(() =>
    followups.filter(f => {
      const q = searchTerm.toLowerCase();
      const match = !q || [f.lead, f.lead_name, f.title, f.assigned].some(v => (v || "").toLowerCase().includes(q));
      return match && (!filterStatus || f.status === filterStatus) && (!filterType || f.type === filterType);
    }), [followups, searchTerm, filterStatus, filterType]);

  const handleSave = async () => {
    if (!formData.title) { alert("Title is required"); return; }
    setLoading(true);
    try { await onAddFollowup(formData); setShowModal(false); setFormData(blankForm); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this follow-up?")) return;
    setLoading(true);
    try { await onDeleteFollowup(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleComplete = async (id) => {
    setLoading(true);
    try { await onMarkComplete(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const scheduled  = followups.filter(f => f.status === "Scheduled").length;
  const completed  = followups.filter(f => f.status === "Completed").length;
  const cancelled  = followups.filter(f => f.status === "Cancelled").length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Follow Ups</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Schedule and manage follow-up activities</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Follow Up</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[["Scheduled", scheduled, COLORS.warning], ["Completed", completed, COLORS.success], ["Cancelled", cancelled, COLORS.danger]].map(([label, val, color]) => (
          <div key={label} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      <FilterBar>
        <FilterGroup label="Search">
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.neutral }} />
            <input placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: 220, paddingLeft: 32 }} />
          </div>
        </FilterGroup>
        <FilterGroup label="Status">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 150 }}>
            <option value="">All</option>
            {["Scheduled","Completed","Cancelled"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Type">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: 130 }}>
            <option value="">All Types</option>
            {["Call","Email","Meeting"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <button onClick={() => { setFilterStatus(""); setFilterType(""); setSearchTerm(""); }} style={{ ...inputStyle, width: "auto", background: COLORS.bg, cursor: "pointer", color: COLORS.neutral, marginTop: 16 }}>✕ Clear</button>
      </FilterBar>

      <TableCard title="All Follow Ups" count={filtered.length}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Lead","Title","Type","Status","Assigned","Scheduled","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={7} /> :
              filtered.map(f => (
                <tr key={f.id}>
                  <Td style={{ fontWeight: 600 }}>{f.lead || f.lead_name || "—"}</Td>
                  <Td>{f.title}</Td>
                  <Td><StatusBadge status={f.type} /></Td>
                  <Td><StatusBadge status={f.status} /></Td>
                  <Td>{f.assigned || "—"}</Td>
                  <Td style={{ fontSize: 12, color: COLORS.neutral }}>{f.start ? new Date(f.start).toLocaleString() : "—"}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {f.status === "Scheduled" && <button onClick={() => handleComplete(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.success, padding: "4px 6px" }} title="Mark Complete"><CheckCircle2 size={15} /></button>}
                      <button onClick={() => handleDelete(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }}><Trash2 size={15} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="Add Follow Up" open={showModal} onClose={() => { setShowModal(false); setFormData(blankForm); }}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Lead</label>
            <input list="fuLeads" value={formData.lead} onChange={e => setFormData({ ...formData, lead: e.target.value })} style={inputStyle} placeholder="Select a lead" />
            <datalist id="fuLeads">{leads.map(l => <option key={l.id} value={l.name} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} placeholder="Follow-up title" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
                {["Call","Email","Meeting"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Assigned To</label>
              <select value={formData.assigned} onChange={e => setFormData({ ...formData, assigned: e.target.value })} style={inputStyle}>
                {USERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input type="datetime-local" value={formData.start} onChange={e => setFormData({ ...formData, start: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input type="datetime-local" value={formData.end} onChange={e => setFormData({ ...formData, end: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => { setShowModal(false); setFormData(blankForm); }} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>Save Follow Up</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGNS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const CampaignsPage = ({ campaigns, onAddCampaign, onDeleteCampaign, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "Email", status: "Draft", by: USERS[0], recipients: "" });

  const filtered = useMemo(() =>
    campaigns.filter(c => {
      const q = searchTerm.toLowerCase();
      return !q || [c.name, c.type, c.status].some(v => (v || "").toLowerCase().includes(q));
    }), [campaigns, searchTerm]);

  const handleSave = async () => {
    if (!formData.name) { alert("Campaign name is required"); return; }
    setLoading(true);
    try { await onAddCampaign({ ...formData, recipients: Number(formData.recipients) || 0 }); setShowModal(false); setFormData({ name: "", type: "Email", status: "Draft", by: USERS[0], recipients: "" }); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    setLoading(true);
    try { await onDeleteCampaign(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Campaigns</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Manage your marketing campaigns</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Campaign</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[["Total", campaigns.length, COLORS.primary], ["Active", campaigns.filter(c => c.status === "Active").length, COLORS.success], ["Draft", campaigns.filter(c => c.status === "Draft").length, COLORS.neutral]].map(([label, val, color]) => (
          <div key={label} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      <TableCard title="All Campaigns" count={filtered.length} searchVal={searchTerm} onSearch={setSearchTerm}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Name","Type","Status","Created By","Recipients","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={6} /> :
              filtered.map(c => (
                <tr key={c.id}>
                  <Td style={{ fontWeight: 600 }}>{c.name}</Td>
                  <Td><StatusBadge status={c.type} /></Td>
                  <Td><StatusBadge status={c.status} /></Td>
                  <Td>{c.by || c.created_by || "—"}</Td>
                  <Td>{c.recipients || 0}</Td>
                  <Td><button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }}><Trash2 size={15} /></button></Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="New Campaign" open={showModal} onClose={() => setShowModal(false)}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Campaign Name *</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
                {["Email","SMS","WhatsApp","Social Media"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                {["Draft","Active","Inactive"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Created By</label>
              <select value={formData.by} onChange={e => setFormData({ ...formData, by: e.target.value })} style={inputStyle}>
                {USERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Recipients</label>
              <input type="number" value={formData.recipients} onChange={e => setFormData({ ...formData, recipients: e.target.value })} style={inputStyle} placeholder="0" />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>Create Campaign</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATES PAGE
// ═══════════════════════════════════════════════════════════════════════════
const TemplatesPage = ({ templates, onAddTemplate, onDeleteTemplate, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", subject: "", description: "", status: "Active" });

  const filtered = useMemo(() =>
    templates.filter(t => {
      const q = searchTerm.toLowerCase();
      return !q || [t.name, t.subject].some(v => (v || "").toLowerCase().includes(q));
    }), [templates, searchTerm]);

  const handleSave = async () => {
    if (!formData.name || !formData.subject) { alert("Name and Subject are required"); return; }
    setLoading(true);
    try { await onAddTemplate(formData); setShowModal(false); setFormData({ name: "", subject: "", description: "", status: "Active" }); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    setLoading(true);
    try { await onDeleteTemplate(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Templates</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Manage email and message templates</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Template</Button>
      </div>

      <TableCard title="All Templates" count={filtered.length} searchVal={searchTerm} onSearch={setSearchTerm}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Name","Subject","Status","Last Updated","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={5} /> :
              filtered.map(t => (
                <tr key={t.id}>
                  <Td style={{ fontWeight: 600 }}>{t.name}</Td>
                  <Td>{t.subject}</Td>
                  <Td><StatusBadge status={t.status} /></Td>
                  <Td style={{ fontSize: 12, color: COLORS.neutral }}>{t.lastUpdated || t.last_updated || (t.updated_at ? new Date(t.updated_at).toLocaleDateString() : "—")}</Td>
                  <Td><button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }}><Trash2 size={15} /></button></Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="New Template" open={showModal} onClose={() => setShowModal(false)}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Template Name *</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Content / Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
              {["Active","Inactive"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>Save Template</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const ContactsPage = ({ contacts, onAddContact, onDeleteContact, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", mobile: "", dept: "", active: true });

  const filtered = useMemo(() =>
    contacts.filter(c => {
      const q = searchTerm.toLowerCase();
      return !q || [c.firstName, c.first_name, c.lastName, c.last_name, c.email, c.mobile].some(v => (v || "").toLowerCase().includes(q));
    }), [contacts, searchTerm]);

  const handleSave = async () => {
    if (!formData.email) { alert("Email is required"); return; }
    setLoading(true);
    try { await onAddContact(formData); setShowModal(false); setFormData({ firstName: "", lastName: "", email: "", mobile: "", dept: "", active: true }); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    setLoading(true);
    try { await onDeleteContact(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Contacts</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Manage customer contacts and logins</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Contact</Button>
      </div>

      <TableCard title="All Contacts" count={filtered.length} searchVal={searchTerm} onSearch={setSearchTerm}
        onExport={() => exportCSV([["First Name","Last Name","Email","Mobile","Department","Active"], ...filtered.map(c => [c.firstName||c.first_name, c.lastName||c.last_name, c.email, c.mobile, c.dept, c.active])], "contacts.csv")}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Name","Email","Mobile","Department","Status","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={6} /> :
              filtered.map(c => (
                <tr key={c.id}>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={`${c.firstName || c.first_name} ${c.lastName || c.last_name}`} />
                      <span style={{ fontWeight: 600 }}>{c.firstName || c.first_name} {c.lastName || c.last_name}</span>
                    </div>
                  </Td>
                  <Td style={{ color: COLORS.secondary }}>{c.email}</Td>
                  <Td>{c.mobile || "—"}</Td>
                  <Td>{c.dept || "—"}</Td>
                  <Td><StatusBadge status={c.active || c.is_active ? "Active" : "Inactive"} /></Td>
                  <Td><button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }}><Trash2 size={15} /></button></Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="Add Contact" open={showModal} onClose={() => setShowModal(false)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[["First Name", "firstName", "text"], ["Last Name", "lastName", "text"], ["Email *", "email", "email"], ["Mobile", "mobile", "text"], ["Department", "dept", "text"]].map(([lbl, key, type]) => (
            <div key={key}>
              <label style={labelStyle}>{lbl}</label>
              <input type={type} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={inputStyle} />
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
            <input type="checkbox" id="activeCheck" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
            <label htmlFor="activeCheck" style={{ fontSize: 13, fontWeight: 500 }}>Active</label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>Save Contact</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const ReportsPage = ({ leads, proposals }) => {
  const stageData   = STAGES.map(s => ({ stage: s, count: leads.filter(l => l.stage === s).length, value: leads.filter(l => l.stage === s).reduce((sum, l) => sum + (l.value || 0), 0) }));
  const sourceData  = SOURCES.map(s => ({ source: s, count: leads.filter(l => l.source === s).length })).filter(s => s.count > 0);
  const userLeads   = USERS.map(u => ({ name: u, leads: leads.filter(l => l.assigned === u).length, proposals: proposals.filter(p => (p.sentBy || p.sent_by) === u).length }));
  const totalValue  = proposals.reduce((s, p) => s + (p.value || 0), 0);
  const wonValue    = proposals.filter(p => p.status === "Accepted").reduce((s, p) => s + (p.value || 0), 0);
  const winRate     = proposals.length ? ((proposals.filter(p => p.status === "Accepted").length / proposals.length) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Reports</h1>
      <p style={{ fontSize: 14, color: COLORS.neutral, margin: "0 0 24px 0" }}>Analytics and performance overview</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <KPICard icon={Users}    label="Total Leads"    value={leads.length}          color={COLORS.primary} />
        <KPICard icon={FileText} label="Total Pipeline" value={formatCurrency(totalValue)}   color={COLORS.secondary} />
        <KPICard icon={Check}    label="Won Value"      value={formatCurrency(wonValue)}      color={COLORS.success} />
        <KPICard icon={TrendingUp} label="Win Rate"     value={`${winRate}%`}                color={COLORS.info} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Stage Breakdown */}
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Leads by Stage</h3>
          </div>
          <div style={{ padding: 20 }}>
            {stageData.map(s => {
              const pct = leads.length ? (s.count / leads.length) * 100 : 0;
              const color = { New: COLORS.neutral, Contacted: COLORS.info, Qualified: COLORS.purple, Proposal: COLORS.warning }[s.stage];
              return (
                <div key={s.stage} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.stage}</span>
                    <span style={{ fontSize: 13, color: COLORS.neutral }}>{s.count} leads · {formatCurrency(s.value)}</span>
                  </div>
                  <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Performance */}
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Team Performance</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{["Member","Leads","Proposals"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {userLeads.map(u => (
                <tr key={u.name}>
                  <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={u.name} /><span style={{ fontWeight: 600 }}>{u.name}</span></div></Td>
                  <Td style={{ fontWeight: 700, color: COLORS.primary }}>{u.leads}</Td>
                  <Td style={{ fontWeight: 700, color: COLORS.secondary }}>{u.proposals}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Breakdown */}
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Leads by Source</h3>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {sourceData.length === 0 ? <p style={{ color: COLORS.neutral, fontSize: 13 }}>No data yet</p> :
            sourceData.map(s => (
              <div key={s.source} style={{ background: COLORS.bg, borderRadius: 8, padding: 16, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 12, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{s.source}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{s.count}</div>
                <div style={{ fontSize: 11, color: COLORS.neutral, marginTop: 4 }}>{leads.length ? ((s.count / leads.length) * 100).toFixed(1) : 0}% of total</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SOURCES PAGE
// ═══════════════════════════════════════════════════════════════════════════
const SourcesPage = ({ leads }) => {
  const sourceStats = SOURCES.map(s => ({
    source: s,
    count: leads.filter(l => l.source === s).length,
    value: leads.filter(l => l.source === s).reduce((sum, l) => sum + (l.value || 0), 0),
    converted: leads.filter(l => l.source === s && l.converted).length,
  }));

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Sources</h1>
      <p style={{ fontSize: 14, color: COLORS.neutral, margin: "0 0 24px 0" }}>Track where your leads are coming from</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {sourceStats.map(s => {
          const convRate = s.count ? ((s.converted / s.count) * 100).toFixed(0) : 0;
          return (
            <div key={s.source} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.source}</div>
                <div style={{ background: COLORS.primary + "15", color: COLORS.primary, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>{s.count} leads</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Pipeline Value</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.secondary }}>{formatCurrency(s.value)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Conversion</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.success }}>{convRate}%</div>
                </div>
              </div>
              <div style={{ marginTop: 12, height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${convRate}%`, background: COLORS.success, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const SettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({ company: "Manodtechnologies", currency: "INR", defaultAssigned: USERS[0], defaultStage: "New", defaultSource: "Website" });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>CRM Settings</h1>
      <p style={{ fontSize: 14, color: COLORS.neutral, margin: "0 0 24px 0" }}>Configure your CRM preferences</p>
      <div style={{ maxWidth: 600, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input value={settings.company} onChange={e => setSettings({ ...settings, company: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Default Assigned User</label>
            <select value={settings.defaultAssigned} onChange={e => setSettings({ ...settings, defaultAssigned: e.target.value })} style={inputStyle}>
              {USERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Default Stage</label>
              <select value={settings.defaultStage} onChange={e => setSettings({ ...settings, defaultStage: e.target.value })} style={inputStyle}>
                {STAGES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Default Source</label>
              <select value={settings.defaultSource} onChange={e => setSettings({ ...settings, defaultSource: e.target.value })} style={inputStyle}>
                {SOURCES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
            {saved && <span style={{ color: COLORS.success, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={16} /> Saved!</span>}
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CRM MODULE
// ═══════════════════════════════════════════════════════════════════════════
export function CRMRoutes() {
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [leads, setLeads]           = useState([]);
  const [proposals, setProposals]   = useState([]);
  const [followups, setFollowups]   = useState([]);
  const [campaigns, setCampaigns]   = useState([]);
  const [templates, setTemplates]   = useState([]);
  const [contacts, setContacts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── Fetch all data ──────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [lR, pR, fR, cR, tR, ctR] = await Promise.all([
        crmAPI.fetchLeads(), crmAPI.fetchProposals(), crmAPI.fetchFollowups(),
        crmAPI.fetchCampaigns(), crmAPI.fetchTemplates(), crmAPI.fetchContacts(),
      ]);
      setLeads(lR.leads || []);
      setProposals(pR.proposals || []);
      setFollowups(fR.followups || []);
      setCampaigns(cR.campaigns || []);
      setTemplates(tR.templates || []);
      setContacts(ctR.contacts || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load CRM data. Make sure the backend is running on port 5000.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = async () => {
    try {
      const [lR, pR] = await Promise.all([crmAPI.fetchLeads(), crmAPI.fetchProposals()]);
      setLeads(lR.leads || []);
      setProposals(pR.proposals || []);
    } catch (err) { console.error(err); }
  };

  // ── Lead handlers ───────────────────────────────────────────
  const handleAddLead = async (data) => {
    const res = await crmAPI.createLead({ name: data.name, mobile: data.phone || data.mobile, email: data.email, company: data.company, source: data.source, stage: data.stage, assigned: data.assigned, notes: data.notes });
    setLeads(prev => [res.lead, ...prev]);
  };

  const handleEditLead = async (id, data) => {
    const res = await crmAPI.updateLead(id, { name: data.name, mobile: data.phone || data.mobile, email: data.email, company: data.company, source: data.source, stage: data.stage, assigned: data.assigned, notes: data.notes });
    setLeads(prev => prev.map(l => l.id === id ? res.lead : l));
  };

  const handleDeleteLead = async (id) => {
    await crmAPI.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleConvertLead = async (id) => {
    const res = await crmAPI.convertLead(id);
    setLeads(prev => prev.map(l => l.id === id ? res.lead : l));
  };

  // ── Proposal handlers ───────────────────────────────────────
  const handleAddProposal = async (data) => {
    const res = await crmAPI.createProposal({ lead: data.lead, subject: data.subject, sentBy: data.sentBy, value: data.value, status: data.status });
    setProposals(prev => [res.proposal, ...prev]);
  };

  const handleDeleteProposal = async (id) => {
    await crmAPI.deleteProposal(id);
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  const handleProposalStatus = async (id, status) => {
    const res = await crmAPI.updateProposal(id, { status });
    setProposals(prev => prev.map(p => p.id === id ? res.proposal : p));
  };

  // ── Follow-up handlers ──────────────────────────────────────
  const handleAddFollowup = async (data) => {
    const res = await crmAPI.createFollowup(data);
    setFollowups(prev => [res.followup, ...prev]);
  };

  const handleDeleteFollowup = async (id) => {
    await crmAPI.deleteFollowup(id);
    setFollowups(prev => prev.filter(f => f.id !== id));
  };

  const handleMarkComplete = async (id) => {
    const res = await crmAPI.updateFollowup(id, { status: "Completed" });
    setFollowups(prev => prev.map(f => f.id === id ? res.followup : f));
  };

  // ── Campaign handlers ───────────────────────────────────────
  const handleAddCampaign = async (data) => {
    const res = await crmAPI.createCampaign(data);
    setCampaigns(prev => [res.campaign, ...prev]);
  };

  const handleDeleteCampaign = async (id) => {
    // no delete endpoint in routes yet — just remove from state
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  // ── Template handlers ───────────────────────────────────────
  const handleAddTemplate = async (data) => {
    const res = await crmAPI.createTemplate(data);
    setTemplates(prev => [res.template, ...prev]);
  };

  const handleDeleteTemplate = async (id) => {
    await crmAPI.deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  // ── Contact handlers ────────────────────────────────────────
  const handleAddContact = async (data) => {
    const res = await crmAPI.createContact(data);
    setContacts(prev => [res.contact, ...prev]);
  };

  const handleDeleteContact = async (id) => {
    await crmAPI.deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const counts = {
    leads:     leads.filter(l => !l.converted).length,
    proposals: proposals.filter(p => p.status === "Sent" || p.status === "Viewed").length,
  };

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${COLORS.border}`, borderTop: `4px solid ${COLORS.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.primary }}>Loading CRM…</div>
          {error && <div style={{ fontSize: 13, color: COLORS.danger, marginTop: 8, maxWidth: 400 }}>{error}</div>}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      <CRMNav activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {activeTab === "dashboard" && <CRMDashboard leads={leads} proposals={proposals} followups={followups} />}
      {activeTab === "leads"     && <LeadsPage leads={leads} onAddLead={handleAddLead} onEditLead={handleEditLead} onDeleteLead={handleDeleteLead} onConvertLead={handleConvertLead} onRefresh={handleRefresh} />}
      {activeTab === "proposals" && <ProposalsPage proposals={proposals} leads={leads} onAddProposal={handleAddProposal} onDeleteProposal={handleDeleteProposal} onStatusChange={handleProposalStatus} onRefresh={handleRefresh} />}
      {activeTab === "followups" && <FollowUpsPage followups={followups} leads={leads} onAddFollowup={handleAddFollowup} onDeleteFollowup={handleDeleteFollowup} onMarkComplete={handleMarkComplete} onRefresh={fetchAll} />}
      {activeTab === "campaigns" && <CampaignsPage campaigns={campaigns} onAddCampaign={handleAddCampaign} onDeleteCampaign={handleDeleteCampaign} onRefresh={fetchAll} />}
      {activeTab === "templates" && <TemplatesPage templates={templates} onAddTemplate={handleAddTemplate} onDeleteTemplate={handleDeleteTemplate} onRefresh={fetchAll} />}
      {activeTab === "contacts"  && <ContactsPage contacts={contacts} onAddContact={handleAddContact} onDeleteContact={handleDeleteContact} onRefresh={fetchAll} />}
      {activeTab === "reports"   && <ReportsPage leads={leads} proposals={proposals} />}
      {activeTab === "sources"   && <SourcesPage leads={leads} />}
      {activeTab === "settings"  && <SettingsPage />}
    </div>
  );
}
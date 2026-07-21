import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3, TrendingUp, Users, FileText, MessageSquare, Settings,
  Plus, Edit2, Trash2, Eye, Search, Download, Check,
  AlertCircle, Megaphone, Layout, UserCheck, PieChart, Globe,
  Star, CheckCircle2, Phone, Mail, Building2, Calendar, X, ArrowRightLeft,
  Link2, Repeat2, Filter, ChevronDown, MapPin, Briefcase, DollarSign, Clock
} from "lucide-react";
import * as crmAPI from "../api/crmAPI";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const COLORS = {
  primary: "#1a5c38", primaryLight: "#16a34a", secondary: "#0891b2",
  danger: "#dc2626", warning: "#d97706", success: "#15803d",
  info: "#2563eb", neutral: "#6b7280", purple: "#7c3aed",
  bg: "#f9fafb", bgCard: "#ffffff", border: "#e5e7eb",
};

const USERS = ["Er Sarath Raj", "Ms Dharshiha C", "Mr Leejin"];
const LEAD_STAGES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const LEAD_SOURCES = ["Website", "Referral", "Cold Call", "Exhibition", "Social Media", "Email Campaign", "Direct Contact"];
const FOLLOW_UP_TYPES = ["Call", "Email", "Meeting", "Demo", "Site Visit"];
const FOLLOW_UP_CATEGORIES = ["Sales", "Support", "Technical", "Admin", "Contract"];
const FOLLOW_UP_STATUS = ["Scheduled", "Completed", "Cancelled", "Pending"];
const PROPOSAL_STATUS = ["Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired"];
const CONTACT_DESIGNATIONS = ["Decision Maker", "Influencer", "User", "Administrator", "Finance"];
const INDUSTRIES = ["Technology", "Manufacturing", "Retail", "Healthcare", "Finance", "Education", "Other"];
const LIFE_STAGES = ["Lead", "Prospect", "Customer", "Inactive"];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v || 0);

const getInitials = (name) =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString(); }
  catch { return "—"; }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleString(); }
  catch { return "—"; }
};

const getStageColor = (s) => {
  const map = {
    New: "#f3f4f6", Contacted: "#dbeafe", Qualified: "#ede9fe", 
    Proposal: "#fef3c7", Negotiation: "#fed7aa", Won: "#dcfce7", Lost: "#fee2e2"
  };
  return map[s] || "#f3f4f6";
};

const getStageTextColor = (s) => {
  const map = {
    New: "#374151", Contacted: "#1d4ed8", Qualified: "#6d28d9",
    Proposal: "#b45309", Negotiation: "#c2410c", Won: "#15803d", Lost: "#b91c1c"
  };
  return map[s] || "#374151";
};

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
const KPICard = ({ icon: Icon, label, value, color, trend, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20,
      display: "flex", gap: 16, alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      cursor: onClick ? "pointer" : "default", transition: "transform 0.12s ease, box-shadow 0.12s ease",
    }}
    onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)"; } }}
    onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; } }}
  >
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
    Meeting: { bg: "#fef3c7", color: "#b45309" }, Demo: { bg: "#ede9fe", color: "#6d28d9" },
    "Site Visit": { bg: "#fed7aa", color: "#c2410c" }, Pending: { bg: "#fef3c7", color: "#b45309" },
    Won: { bg: "#dcfce7", color: "#15803d" }, Lost: { bg: "#fee2e2", color: "#b91c1c" },
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

const Modal = ({ title, open, onClose, children, maxWidth = 700 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px 0" }} onClick={onClose}>
      <div style={{ background: COLORS.bgCard, borderRadius: 12, width: "90%", maxWidth, maxHeight: "90vh", overflow: "auto", padding: 28, boxShadow: "0 20px 25px rgba(0,0,0,0.15)", margin: "20px 0" }} onClick={e => e.stopPropagation()}>
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
// ENHANCED LEAD FORM SECTION
// ═══════════════════════════════════════════════════════════════════════════
const LeadFormSection = ({ formData, setFormData, title = "Lead Information" }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${COLORS.border}` }}>
      {title}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
      {[["Lead Name *", "name", "text"], ["Company", "company", "text"], ["Phone *", "phone", "tel"], ["Email", "email", "email"]].map(([lbl, key, type]) => (
        <div key={key}>
          <label style={labelStyle}>{lbl}</label>
          <input type={type} value={formData[key] || ""} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={inputStyle} />
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
      {[["Location", "location", "text"], ["Industry", "industry", "text"], ["Contact Person", "contact", "text"], ["Lead Value (₹)", "value", "number"]].map(([lbl, key, type]) => (
        <div key={key}>
          <label style={labelStyle}>{lbl}</label>
          <input type={type} value={formData[key] || ""} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={inputStyle} />
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <label style={labelStyle}>Source</label>
        <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} style={inputStyle}>
          {LEAD_SOURCES.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Stage</label>
        <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} style={inputStyle}>
          {LEAD_STAGES.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  </div>
);

const AdditionalInfoSection = ({ formData, setFormData }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${COLORS.border}` }}>
      Additional Information
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
      <div>
        <label style={labelStyle}>Assigned To</label>
        <select value={formData.assigned} onChange={e => setFormData({ ...formData, assigned: e.target.value })} style={inputStyle}>
          {USERS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Status</label>
        <select value={formData.converted ? "Customer" : "Active"} onChange={e => setFormData({ ...formData, converted: e.target.value === "Customer" })} style={inputStyle}>
          <option>Active</option>
          <option>Customer</option>
        </select>
      </div>
    </div>
    <div>
      <label style={labelStyle}>Notes</label>
      <textarea value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Add notes about this lead..." />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
const CRMNav = ({ activeTab, onTabChange, counts = {} }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: Users, count: counts.leads },
    { id: "followups", label: "Follow Ups", icon: MessageSquare, count: counts.followups },
    { id: "proposals", label: "Proposals", icon: FileText, count: counts.proposals },
    { id: "contacts", label: "Contacts", icon: UserCheck },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "sources", label: "Sources", icon: Globe },
    { id: "reports", label: "Reports", icon: PieChart },
    { id: "settings", label: "Settings", icon: Settings },
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
const CRMDashboard = ({ leads, proposals, followups, navigate }) => {
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !l.converted).length;
  const totalProposalValue = proposals.reduce((s, p) => s + (Number(p.value) || 0), 0);
  const acceptedValue = proposals.filter(p => p.status === "Accepted").reduce((s, p) => s + (Number(p.value) || 0), 0);
  const pendingFollowups = followups.filter(f => f.status === "Scheduled").length;
  const leaderboard = USERS.map(u => ({ name: u, leads: leads.filter(l => l.assigned === u).length })).sort((a, b) => b.leads - a.leads);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>CRM Dashboard</h1>
        <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Overview of your sales pipeline, follow-ups, and customer relationships</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <KPICard icon={Users} label="Active Leads" value={activeLeads} color={COLORS.primary} trend={`${totalLeads} total`} onClick={() => navigate("/crm/leads")} />
        <KPICard icon={FileText} label="Pipeline Value" value={formatCurrency(totalProposalValue)} color={COLORS.secondary} onClick={() => navigate("/crm/proposals")} />
        <KPICard icon={Check} label="Accepted Value" value={formatCurrency(acceptedValue)} color={COLORS.success} onClick={() => navigate("/crm/proposals")} />
        <KPICard icon={MessageSquare} label="Pending Follow-ups" value={pendingFollowups} color={COLORS.warning} onClick={() => navigate("/crm/followups")} />
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
                <div style={{ fontSize: 12, color: COLORS.neutral }}>{lead.mobile || lead.phone || "—"}</div>
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
// ENHANCED LEADS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const LeadsPage = ({ leads, followups = [], onAddLead, onEditLead, onDeleteLead, onConvertLead, onAddFollowup, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const blankForm = {
    name: "", contact: "", email: "", phone: "", company: "", source: "Website",
    stage: "New", value: "", assigned: USERS[0], notes: "", location: "", industry: "", converted: false,
    contactType: "Lead", entityType: "Individual",
    taxNumber: "", address1: "", address2: "", city: "", state: "", country: "", zipCode: "",
    landmark: "", streetName: "", buildingNumber: "", additionalNumber: "",
    customFields: {},
    contactPersons: []
  };
  const [formData, setFormData] = useState(blankForm);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showContactPersons, setShowContactPersons] = useState(false);

  const [fuForm, setFuForm] = useState({
    title: "", type: "Call", category: "Sales", status: "Scheduled",
    assigned: USERS[0], start: "", end: "", desc: "", isRecurring: false, recurringDays: 7
  });

  const filteredLeads = useMemo(() =>
    leads.filter(l => {
      const q = searchTerm.toLowerCase();
      const match = !q || [l.name, l.contact, l.email, l.mobile, l.phone, l.company].some(v => (v || "").toLowerCase().includes(q));
      return match && (!filterStage || l.stage === filterStage) && (!filterSource || l.source === filterSource) && (!filterAssigned || l.assigned === filterAssigned);
    }), [leads, searchTerm, filterStage, filterSource, filterAssigned]);

  const resetForm = () => { setFormData(blankForm); setEditingId(null); setShowMoreInfo(false); setShowContactPersons(false); };

  const openEdit = (lead) => {
    setFormData({ ...blankForm, ...lead, phone: lead.phone || lead.mobile || "" });
    setEditingId(lead.id);
    setShowModal(true);
  };

 const handleSave = async () => {
  if (!formData.name || !formData.phone) { alert("Lead Name and Phone are required"); return; }
  setLoading(true);
  try {
    const payload = {
      ...formData,
      mobile: formData.phone,
      value: Number(formData.value) || 0,
      status: formData.converted ? "Customer" : "Active",
      contactType: formData.entityType,
    };
    if (editingId) { await onEditLead(editingId, payload); }
    else { await onAddLead(payload); }
    setShowModal(false); resetForm(); onRefresh();
  } catch (err) { alert("Error saving lead: " + err.message); }
  finally { setLoading(false); }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    setLoading(true);
    try { await onDeleteLead(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleConvert = async (id) => {
    if (!window.confirm("Convert this lead to customer?")) return;
    setLoading(true);
    try { await onConvertLead(id); alert("Lead converted to customer!"); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const followupsForLead = (lead) => followups.filter(f => (f.lead || f.lead_name || "") === lead.name);
 const getLastFollowup = (lead) => {
    const past = followupsForLead(lead).filter(f => f.start && new Date(f.start) <= new Date()).sort((a, b) => new Date(b.start) - new Date(a.start));
    return past[0] || null;
  };
  const getUpcomingFollowup = (lead) => {
    const upcoming = followupsForLead(lead).filter(f => f.status === "Scheduled" && f.start).sort((a, b) => new Date(a.start) - new Date(b.start));
    return upcoming[0] || null;
  };
  const openFollowupModal = (lead) => {
    setSelectedLead(lead);
    setFuForm({ title: "", type: "Call", category: "Sales", status: "Scheduled", assigned: USERS[0], start: "", end: "", desc: "", isRecurring: false, recurringDays: 7 });
    setShowFollowupModal(true);
  };

  const handleSaveFollowup = async () => {
    if (!fuForm.title || !fuForm.start) { alert("Title and Start Time are required"); return; }
    setLoading(true);
    try {
      await onAddFollowup({ ...fuForm, lead: selectedLead.name });
      setShowFollowupModal(false);
      onRefresh();
    } catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Leads Management</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Manage all your sales leads · {filteredLeads.length} records</p>
        </div>
        <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Add Lead</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        {LEAD_STAGES.map(s => {
          const cnt = leads.filter(l => l.stage === s).length;
          const color = getStageTextColor(s);
          return (
            <div key={s} onClick={() => setFilterStage(filterStage === s ? "" : s)}
              style={{ background: COLORS.bgCard, border: `1px solid ${filterStage === s ? color : COLORS.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer" }}>
              <div style={{ fontSize: 11, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase" }}>{s}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{cnt}</div>
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
            <option value="">All</option>{LEAD_STAGES.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Source">
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="">All</option>{LEAD_SOURCES.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Assigned">
          <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="">All</option>{USERS.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <button onClick={() => { setFilterStage(""); setFilterSource(""); setFilterAssigned(""); setSearchTerm(""); }} style={{ ...inputStyle, width: "auto", background: COLORS.bg, cursor: "pointer", color: COLORS.neutral, marginTop: 16 }}>✕ Clear</button>
        <div style={{ marginLeft: "auto", marginTop: 16 }}>
          <Button variant="secondary" size="sm" icon={Download}
            onClick={() => exportCSV([["Name", "Company", "Phone", "Email", "Location", "Industry", "Source", "Stage", "Value", "Assigned", "Status"], ...filteredLeads.map(l => [l.name, l.company||"—", l.mobile||l.phone||"—", l.email||"—", l.location||"—", l.industry||"—", l.source, l.stage, l.value||0, l.assigned, l.converted ? "Customer" : "Active"])], "leads.csv")}>
            Export
          </Button>
        </div>
      </FilterBar>

      <TableCard title="All Leads" count={filteredLeads.length}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Name", "Company", "Location", "Phone", "Email", "Source", "Stage", "Value", "Assigned", "Last Follow-up", "Next Follow-up", "Status", "Actions"].map(h => <Th key={h}>{h}</Th>)}</tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? <NoData cols={12} /> :
             filteredLeads.map(lead => {
  const upcomingFu = getUpcomingFollowup(lead);
  const lastFu = getLastFollowup(lead);
  return (
                  <tr key={lead.id}>
                    <Td><span style={{ fontWeight: 600 }}>{lead.name}</span></Td>
                    <Td>{lead.company || "—"}</Td>
                    <Td style={{ fontSize: 12, color: COLORS.neutral }}>{lead.location || "—"}</Td>
                    <Td>{lead.mobile || lead.phone || "—"}</Td>
                    <Td style={{ color: COLORS.secondary }}>{lead.email || "—"}</Td>
                    <Td><span style={{ padding: "3px 8px", borderRadius: 6, background: "#f3f4f6", color: "#374151", fontSize: 11, fontWeight: 600 }}>{lead.source}</span></Td>
                    <Td><span style={{ padding: "4px 10px", borderRadius: 6, background: getStageColor(lead.stage), color: getStageTextColor(lead.stage), fontSize: 12, fontWeight: 600 }}>{lead.stage}</span></Td>
                    <Td style={{ fontWeight: 700 }}>{lead.value ? formatCurrency(lead.value) : "—"}</Td>
                    <Td><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={lead.assigned} size={28} /><span style={{ fontSize: 11, color: COLORS.neutral }}>{lead.assigned?.split(" ")[0]}</span></div></Td>
                  <Td style={{ fontSize: 12, color: COLORS.neutral }}>{lastFu ? formatDateTime(lastFu.start) : "—"}</Td>
<Td>
  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
    {upcomingFu && <span style={{ fontSize: 12, color: COLORS.neutral }}>{formatDateTime(upcomingFu.start)}</span>}
    <button onClick={() => openFollowupModal(lead)} style={{ background: COLORS.primary, border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 600, padding: "5px 10px", cursor: "pointer" }}><Plus size={12} /> Add</button>
  </div>
</Td>
                    <Td>{lead.converted ? <StatusBadge status="Customer" /> : <StatusBadge status="Active" />}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setViewLead(lead)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.secondary, padding: "4px 6px" }} title="View"><Eye size={15} /></button>
                        <button onClick={() => openEdit(lead)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.warning, padding: "4px 6px" }} title="Edit"><Edit2 size={15} /></button>
                        {!lead.converted && <button onClick={() => handleConvert(lead.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.success, padding: "4px 6px" }} title="Convert"><ArrowRightLeft size={15} /></button>}
                        <button onClick={() => handleDelete(lead.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </TableCard>

      {/* Add/Edit Lead Modal */}
      <Modal title={editingId ? "Edit Lead" : "Add Lead"} open={showModal} onClose={() => { setShowModal(false); resetForm(); }} maxWidth={800}>
        <div style={{ marginBottom: 20, display: "flex", gap: 24, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Contact Type:</span>
          {["Individual", "Business"].map(t => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="radio" name="entityType" checked={formData.entityType === t} onChange={() => setFormData({ ...formData, entityType: t })} />
              {t}
            </label>
          ))}
        </div>

        <LeadFormSection formData={formData} setFormData={setFormData} title="Lead Information" />
        <AdditionalInfoSection formData={formData} setFormData={setFormData} />

        {/* More Informations (collapsible) */}
        <div style={{ marginBottom: 24 }}>
          <button type="button" onClick={() => setShowMoreInfo(!showMoreInfo)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 14, fontWeight: 700, color: COLORS.primary, marginBottom: showMoreInfo ? 16 : 0 }}>
            More Informations <ChevronDown size={16} style={{ transform: showMoreInfo ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {showMoreInfo && (
            <div style={{ paddingTop: 4 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Tax Number</label>
                <input value={formData.taxNumber} onChange={e => setFormData({ ...formData, taxNumber: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[["Address Line 1", "address1"], ["Address Line 2", "address2"], ["City", "city"], ["State", "state"], ["Country", "country"], ["Zip Code", "zipCode"], ["Landmark", "landmark"], ["Street Name", "streetName"], ["Building Number", "buildingNumber"], ["Additional Number", "additionalNumber"]].map(([lbl, key]) => (
                  <div key={key}>
                    <label style={labelStyle}>{lbl}</label>
                    <input value={formData[key] || ""} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <div key={n}>
                    <label style={labelStyle}>Custom Field {n}</label>
                    <input value={formData.customFields[`field${n}`] || ""} onChange={e => setFormData({ ...formData, customFields: { ...formData.customFields, [`field${n}`]: e.target.value } })} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Contact Persons (collapsible) */}
        <div style={{ marginBottom: 24 }}>
          <button type="button" onClick={() => setShowContactPersons(!showContactPersons)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 14, fontWeight: 700, color: COLORS.primary, marginBottom: showContactPersons ? 16 : 0 }}>
            Add Contact Persons <ChevronDown size={16} style={{ transform: showContactPersons ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {showContactPersons && (
            <div style={{ display: "grid", gap: 20 }}>
              {[0, 1, 2].map(idx => {
                const cp = formData.contactPersons[idx] || { prefix: "", firstName: "", lastName: "", email: "", mobile: "", altPhone: "", familyPhone: "", department: "", designation: "", commission: "", allowLogin: false };
                const updateCP = (field, val) => {
                  const updated = [...formData.contactPersons];
                  updated[idx] = { ...cp, [field]: val };
                  setFormData({ ...formData, contactPersons: updated });
                };
                return (
                  <div key={idx} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Contact Person {idx + 1}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Prefix</label><input value={cp.prefix} onChange={e => updateCP("prefix", e.target.value)} style={inputStyle} placeholder="Mr / Mrs / Miss" /></div>
                      <div><label style={labelStyle}>First Name</label><input value={cp.firstName} onChange={e => updateCP("firstName", e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Last Name</label><input value={cp.lastName} onChange={e => updateCP("lastName", e.target.value)} style={inputStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Email</label><input value={cp.email} onChange={e => updateCP("email", e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Mobile Number</label><input value={cp.mobile} onChange={e => updateCP("mobile", e.target.value)} style={inputStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Alternate Contact Number</label><input value={cp.altPhone} onChange={e => updateCP("altPhone", e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Family Contact Number</label><input value={cp.familyPhone} onChange={e => updateCP("familyPhone", e.target.value)} style={inputStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Department</label><input value={cp.department} onChange={e => updateCP("department", e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Designation</label><input value={cp.designation} onChange={e => updateCP("designation", e.target.value)} style={inputStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                      <div><label style={labelStyle}>Sales Commission Percentage (%)</label><input type="number" value={cp.commission} onChange={e => updateCP("commission", e.target.value)} style={inputStyle} /></div>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, paddingTop: 18 }}>
                        <input type="checkbox" checked={cp.allowLogin} onChange={e => updateCP("allowLogin", e.target.checked)} /> Allow login
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{editingId ? "Update" : "Save"}</Button>
        </div>
      </Modal>

      {/* Add Follow-up Modal */}
      <Modal title={`Add Follow-up — ${selectedLead?.name || ""}`} open={showFollowupModal} onClose={() => setShowFollowupModal(false)} maxWidth={750}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={fuForm.title} onChange={e => setFuForm({ ...fuForm, title: e.target.value })} style={inputStyle} placeholder="e.g. Follow-up call" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={fuForm.type} onChange={e => setFuForm({ ...fuForm, type: e.target.value })} style={inputStyle}>
                {FOLLOW_UP_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={fuForm.category} onChange={e => setFuForm({ ...fuForm, category: e.target.value })} style={inputStyle}>
                {FOLLOW_UP_CATEGORIES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Start Time *</label>
              <input type="datetime-local" value={fuForm.start} onChange={e => setFuForm({ ...fuForm, start: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input type="datetime-local" value={fuForm.end} onChange={e => setFuForm({ ...fuForm, end: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Assigned To</label>
            <select value={fuForm.assigned} onChange={e => setFuForm({ ...fuForm, assigned: e.target.value })} style={inputStyle}>
              {USERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={fuForm.desc} onChange={e => setFuForm({ ...fuForm, desc: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Add detailed description..." />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" id="recurring" checked={fuForm.isRecurring} onChange={e => setFuForm({ ...fuForm, isRecurring: e.target.checked })} />
            <label htmlFor="recurring" style={{ fontSize: 13, fontWeight: 500 }}>Recurring every</label>
            <input type="number" value={fuForm.recurringDays} onChange={e => setFuForm({ ...fuForm, recurringDays: Number(e.target.value) })} min="1" style={{ ...inputStyle, width: 60 }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>days</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowFollowupModal(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveFollowup} disabled={loading}>Save</Button>
        </div>
      </Modal>

      {/* View Lead Modal */}
      <Modal title="Lead Details" open={!!viewLead} onClose={() => setViewLead(null)} maxWidth={700}>
        {viewLead && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 20 }}>
{[["Name", viewLead.name], ["Company", viewLead.company || "—"], ["Phone", viewLead.mobile || viewLead.phone || "—"], ["Email", viewLead.email || "—"], ["Location", viewLead.location || "—"], ["Industry", viewLead.industry || "—"], ["Contact Person", viewLead.contact || "—"], ["Contact Type", viewLead.contact_type || viewLead.entityType || "—"], ["Source", viewLead.source || "—"], ["Stage", viewLead.stage], ["Value", viewLead.value ? formatCurrency(viewLead.value) : "—"], ["Assigned", viewLead.assigned], ["Status", viewLead.status || (viewLead.converted ? "Customer" : "Active")]].map(([label, val]) => (                <div key={label}>
                  <div style={{ fontSize: 11, color: COLORS.neutral, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
            {viewLead.notes && <div style={{ background: COLORS.bg, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13 }}><strong>Notes:</strong> {viewLead.notes}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setViewLead(null)}>Close</Button>
              <Button onClick={() => { setViewLead(null); openEdit(viewLead); }}>Edit</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED FOLLOW-UPS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const FollowUpsPage = ({ followups, leads, onAddFollowup, onEditFollowup, onDeleteFollowup, onMarkComplete, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const blankForm = {
    lead: "", title: "", type: "Call", category: "Sales", status: "Scheduled",
    assigned: USERS[0], start: "", end: "", desc: "", isRecurring: false, recurringDays: 7
  };
 const [formData, setFormData] = useState(blankForm);
const [editingId, setEditingId] = useState(null);
const openEditFollowup = (f) => {
  setFormData({ lead: f.lead || f.lead_name || "", title: f.title, type: f.type, category: f.category, status: f.status, assigned: f.assigned, start: f.start ? f.start.slice(0,16) : "", end: f.end ? f.end.slice(0,16) : "", desc: f.desc || "", isRecurring: false, recurringDays: 7 });
  setEditingId(f.id);
  setShowModal(true);
};

  const filtered = useMemo(() =>
    followups.filter(f => {
      const q = searchTerm.toLowerCase();
      const match = !q || [f.lead, f.lead_name, f.title, f.assigned].some(v => (v || "").toLowerCase().includes(q));
      return match && (!filterStatus || f.status === filterStatus) && (!filterType || f.type === filterType) && (!filterCategory || f.category === filterCategory);
    }), [followups, searchTerm, filterStatus, filterType, filterCategory]);

const handleSave = async () => {
    if (!formData.title || !formData.lead) { alert("Title and Lead are required"); return; }
    setLoading(true);
    try {
      if (editingId) { await onEditFollowup(editingId, formData); }
      else { await onAddFollowup(formData); }
      setShowModal(false); setFormData(blankForm); setEditingId(null); onRefresh();
    }
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

  const scheduled = followups.filter(f => f.status === "Scheduled").length;
  const completed = followups.filter(f => f.status === "Completed").length;
  const cancelled = followups.filter(f => f.status === "Cancelled").length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Follow-ups Management</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Schedule and track follow-up activities · {filtered.length} records</p>
        </div>
        <Button icon={Plus} onClick={() => { setFormData(blankForm); setShowModal(true); }}>Add Follow-up</Button>
      </div>

     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[["Scheduled", scheduled, COLORS.warning], ["Completed", completed, COLORS.success], ["Cancelled", cancelled, COLORS.danger]].map(([label, val, color]) => (
          <div key={label}
            onClick={() => setFilterStatus(filterStatus === label ? "" : label)}
            style={{ background: COLORS.bgCard, border: `1px solid ${filterStatus === label ? color : COLORS.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 20, cursor: "pointer" }}>
            <div style={{ fontSize: 12, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>
      <FilterBar>
        <FilterGroup label="Search">
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.neutral }} />
            <input placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: 200, paddingLeft: 32 }} />
          </div>
        </FilterGroup>
        <FilterGroup label="Status">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 140 }}>
            <option value="">All</option>{FOLLOW_UP_STATUS.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Type">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: 130 }}>
            <option value="">All</option>{FOLLOW_UP_TYPES.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Category">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, width: 130 }}>
            <option value="">All</option>{FOLLOW_UP_CATEGORIES.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <button onClick={() => { setFilterStatus(""); setFilterType(""); setFilterCategory(""); setSearchTerm(""); }} style={{ ...inputStyle, width: "auto", background: COLORS.bg, cursor: "pointer", color: COLORS.neutral, marginTop: 16 }}>✕ Clear</button>
      </FilterBar>

      <TableCard title="All Follow-ups" count={filtered.length}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Lead", "Title", "Type", "Category", "Status", "Assigned", "Start", "End", "Actions"].map(h => <Th key={h}>{h}</Th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={8} /> :
              filtered.map(f => (
                <tr key={f.id}>
                  <Td style={{ fontWeight: 600 }}>{f.lead || f.lead_name || "—"}</Td>
                  <Td>{f.title}</Td>
                  <Td><StatusBadge status={f.type} /></Td>
                  <Td><span style={{ padding: "3px 8px", borderRadius: 6, background: COLORS.bg, fontSize: 11, fontWeight: 600 }}>{f.category}</span></Td>
                  <Td><StatusBadge status={f.status} /></Td>
                  <Td><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={f.assigned} size={28} />{f.assigned?.split(" ")[0]}</div></Td>
                 <Td style={{ fontSize: 12, color: COLORS.neutral }}>{formatDateTime(f.start)}</Td>
<Td style={{ fontSize: 12, color: COLORS.neutral }}>{formatDateTime(f.end)}</Td>
<Td>
  <div style={{ display: "flex", gap: 4 }}>
    <button onClick={() => openEditFollowup(f)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.warning, padding: "4px 6px" }} title="Edit"><Edit2 size={15} /></button>
    {f.status === "Scheduled" && <button onClick={() => handleComplete(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.success, padding: "4px 6px" }} title="Mark Complete"><CheckCircle2 size={15} /></button>}
    <button onClick={() => handleDelete(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }} title="Delete"><Trash2 size={15} /></button>
  </div>
</Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="Add Follow-up" open={showModal} onClose={() => { setShowModal(false); setFormData(blankForm); }} maxWidth={750}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Customer/Lead *</label>
            <input list="fuLeads" value={formData.lead} onChange={e => setFormData({ ...formData, lead: e.target.value })} style={inputStyle} placeholder="Type or select a lead" />
            <datalist id="fuLeads">{leads.map(l => <option key={l.id} value={l.name} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} placeholder="e.g. Follow-up call" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
                {FOLLOW_UP_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                {FOLLOW_UP_CATEGORIES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Start Time *</label>
              <input type="datetime-local" value={formData.start} onChange={e => setFormData({ ...formData, start: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input type="datetime-local" value={formData.end} onChange={e => setFormData({ ...formData, end: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Assigned To</label>
            <select value={formData.assigned} onChange={e => setFormData({ ...formData, assigned: e.target.value })} style={inputStyle}>
              {USERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Add detailed notes..." />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" id="recurring" checked={formData.isRecurring} onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })} />
            <label htmlFor="recurring" style={{ fontSize: 13, fontWeight: 500 }}>Recurring every</label>
            <input type="number" value={formData.recurringDays} onChange={e => setFormData({ ...formData, recurringDays: Number(e.target.value) })} min="1" style={{ ...inputStyle, width: 60 }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>days</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => { setShowModal(false); setFormData(blankForm); setEditingId(null); }} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{editingId ? "Update" : "Save"}</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED PROPOSALS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const RichTextEditor = ({ value, onChange }) => {
  const editorRef = React.useRef(null);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []);

  return (
    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, padding: 8, background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("bold"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer", fontWeight: 700 }}>B</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("italic"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer", fontStyle: "italic" }}>I</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("underline"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer", textDecoration: "underline" }}>U</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("justifyLeft"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer" }}>⬅</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("justifyCenter"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer" }}>↔</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("justifyRight"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer" }}>➡</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer" }}>• List</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer" }}>1. List</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); const url = prompt("Enter URL:"); if (url) exec("createLink", url); }} style={{ padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, background: "white", cursor: "pointer" }}>🔗</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={e => onChange(e.currentTarget.innerHTML)}
        style={{ minHeight: 160, padding: 12, fontSize: 13, outline: "none" }}
      />
    </div>
  );
};

const ProposalsPage = ({ proposals, leads, onAddProposal, onEditProposal, onDeleteProposal, onStatusChange, onSendProposal, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [viewProposal, setViewProposal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ lead: "", subject: "", sentBy: USERS[0], value: "", status: "Draft", dueDate: "", cc: "", bcc: "", body: "" });
const [editingId, setEditingId] = useState(null);
  const openEditProposal = (p) => {
    setFormData({ lead: p.lead || p.lead_name || "", subject: p.subject, sentBy: p.sentBy || p.sent_by, value: p.value || "", status: p.status, dueDate: p.dueDate || p.due_date || "", cc: p.cc || "", bcc: p.bcc || "", body: p.body || "" });
    setEditingId(p.id);
    setShowModal(true);
  };
  const filtered = useMemo(() =>
    proposals.filter(p => {
      const q = searchTerm.toLowerCase();
      const match = !q || [p.lead, p.lead_name, p.subject, p.sentBy, p.sent_by].some(v => (v || "").toLowerCase().includes(q));
      return match && (!filterStatus || p.status === filterStatus) && (!filterAssigned || p.sentBy === filterAssigned);
    }), [proposals, searchTerm, filterStatus, filterAssigned]);

  const totalValue = filtered.reduce((s, p) => s + (Number(p.value) || 0), 0);
  const acceptedValue = filtered.filter(p => p.status === "Accepted").reduce((s, p) => s + (Number(p.value) || 0), 0);
  const pendingValue = filtered.filter(p => ["Sent", "Viewed"].includes(p.status)).reduce((s, p) => s + (Number(p.value) || 0), 0);

 const handleSave = async () => {
    if (!formData.lead || !formData.subject) { alert("Lead and Subject are required"); return; }
    setLoading(true);
    try {
      const payload = { ...formData, value: Number(formData.value) || 0 };
      if (editingId) { await onEditProposal(editingId, payload); }
      else { await onAddProposal(payload); }
      setShowModal(false);
      setFormData({ lead: "", subject: "", sentBy: USERS[0], value: "", status: "Draft", dueDate: "", cc: "", bcc: "", body: "" });
      setEditingId(null);
      onRefresh();
    } catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this proposal?")) return;
    setLoading(true);
    try { await onDeleteProposal(id); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    try { await onStatusChange(id, status); onRefresh(); }
    catch (err) { alert("Error updating status: " + err.message); }
    finally { setLoading(false); }
  };

  const handleSend = async (id) => {
    if (!window.confirm("Send this proposal to the lead's email?")) return;
    setLoading(true);
    try { await onSendProposal(id); onRefresh(); alert("Proposal sent!"); }
    catch (err) { alert("Error sending: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Proposals</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Manage sales proposals and templates</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Create Proposal</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[["Total Value", totalValue, COLORS.primary], ["Accepted", acceptedValue, COLORS.success], ["Pending", pendingValue, COLORS.warning]].map(([label, val, color]) => (
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
            <input placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: 200, paddingLeft: 32 }} />
          </div>
        </FilterGroup>
        <FilterGroup label="Status">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 140 }}>
            <option value="">All</option>{PROPOSAL_STATUS.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="Sent By">
          <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="">All</option>{USERS.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterGroup>
        <button onClick={() => { setFilterStatus(""); setFilterAssigned(""); setSearchTerm(""); }} style={{ ...inputStyle, width: "auto", background: COLORS.bg, cursor: "pointer", color: COLORS.neutral, marginTop: 16 }}>✕ Clear</button>
      </FilterBar>

      <TableCard title="All Proposals" count={filtered.length}
onExport={() => exportCSV([["Lead", "Subject", "Value", "Status", "Sent By", "Due Date"], ...filtered.map(p => [p.lead||p.lead_name, p.subject, p.value, p.status, p.sentBy||p.sent_by, p.dueDate||p.due_date||"—"])], "proposals.csv")}>        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Lead", "Subject", "Value", "Status", "Due Date", "Sent By", "Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={7} /> :
              filtered.map(p => (
                <tr key={p.id}>
                  <Td style={{ fontWeight: 600 }}>{p.lead || p.lead_name}</Td>
                  <Td>{p.subject}</Td>
                  <Td style={{ fontWeight: 700 }}>{formatCurrency(p.value)}</Td>
                  <Td><StatusBadge status={p.status} /></Td>
<Td style={{ fontSize: 12, color: COLORS.neutral }}>{formatDate(p.dueDate || p.due_date)}</Td>
                  <Td>{p.sentBy || p.sent_by || "—"}</Td>
                <Td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setViewProposal(p)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.secondary, padding: "4px 6px" }} title="View"><Eye size={15} /></button>
                      {p.status === "Draft" && <button onClick={() => handleSend(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.primary, padding: "4px 6px" }} title="Send"><Mail size={15} /></button>}
                      <button onClick={() => openEditProposal(p)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.warning, padding: "4px 6px" }} title="Edit"><Edit2 size={15} /></button>
                      {p.status === "Sent" && <button onClick={() => handleStatusChange(p.id, "Accepted")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.success, padding: "4px 6px" }} title="Accept"><CheckCircle2 size={15} /></button>}
                      {p.status === "Sent" && <button onClick={() => handleStatusChange(p.id, "Rejected")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }} title="Reject"><X size={15} /></button>}
                      <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title={editingId ? "Edit Proposal" : "Create Proposal"} open={showModal} onClose={() => { setShowModal(false); setFormData({ lead: "", subject: "", sentBy: USERS[0], value: "", status: "Draft", dueDate: "", cc: "", bcc: "", body: "" }); setEditingId(null); }} maxWidth={850}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Customer/Lead *</label>
            <input list="propLeads" value={formData.lead} onChange={e => setFormData({ ...formData, lead: e.target.value })} style={inputStyle} placeholder="Type or select a lead" />
            <datalist id="propLeads">{leads.map(l => <option key={l.id} value={l.name} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} style={inputStyle} placeholder="Proposal subject" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>CC (comma separated)</label>
              <input value={formData.cc || ""} onChange={e => setFormData({ ...formData, cc: e.target.value })} style={inputStyle} placeholder="email@example.com" />
            </div>
            <div>
              <label style={labelStyle}>BCC (comma separated)</label>
              <input value={formData.bcc || ""} onChange={e => setFormData({ ...formData, bcc: e.target.value })} style={inputStyle} placeholder="email@example.com" />
            </div>
          </div>
         <div>
            <label style={labelStyle}>Email Body</label>
            <RichTextEditor value={formData.body} onChange={html => setFormData({ ...formData, body: html })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Value (₹)</label>
              <input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Sent By</label>
              <select value={formData.sentBy} onChange={e => setFormData({ ...formData, sentBy: e.target.value })} style={inputStyle}>
                {USERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                {PROPOSAL_STATUS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
         <Button variant="secondary" onClick={() => { setShowModal(false); setEditingId(null); }} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{editingId ? "Update" : "Create"}</Button>
        </div>
      </Modal>

      <Modal title="Proposal Details" open={!!viewProposal} onClose={() => setViewProposal(null)} maxWidth={700}>
        {viewProposal && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 20 }}>
              {[["Lead", viewProposal.lead || viewProposal.lead_name || "—"], ["Subject", viewProposal.subject], ["Value", formatCurrency(viewProposal.value)], ["Status", viewProposal.status], ["Due Date", formatDate(viewProposal.dueDate || viewProposal.due_date)], ["Sent By", viewProposal.sentBy || viewProposal.sent_by || "—"], ["CC", viewProposal.cc || "—"], ["BCC", viewProposal.bcc || "—"]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: COLORS.neutral, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
            {viewProposal.body && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: COLORS.neutral, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Email Body</div>
                <div style={{ background: COLORS.bg, borderRadius: 8, padding: 12, fontSize: 13 }} dangerouslySetInnerHTML={{ __html: viewProposal.body }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setViewProposal(null)}>Close</Button>
              <Button onClick={() => { setViewProposal(null); openEditProposal(viewProposal); }}>Edit</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED CONTACTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const ContactsPage = ({ contacts, leads, onAddContact, onDeleteContact, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", mobile: "", department: "",
    designation: "User", linkedLead: "", active: true, phone: "", altPhone: "",
    lifeStage: "Lead", salesCommission: ""
  });

 const filtered = useMemo(() =>
    contacts.filter(c => {
      const q = searchTerm.toLowerCase();
      return !q || [c.firstName, c.first_name, c.lastName, c.last_name, c.email, c.mobile, c.linkedLead, c.linked_lead].some(v => (v || "").toLowerCase().includes(q));
    }), [contacts, searchTerm]);

  const handleSave = async () => {
    if (!formData.email) { alert("Email is required"); return; }
    setLoading(true);
    try {
      await onAddContact(formData);
      setShowModal(false);
      setFormData({ firstName: "", lastName: "", email: "", mobile: "", department: "", designation: "User", linkedLead: "", active: true, phone: "", altPhone: "", lifeStage: "Lead", salesCommission: "" });
      onRefresh();
    } catch (err) { alert("Error: " + err.message); }
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
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Contacts Management</h1>
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Customer contacts and stakeholders · {filtered.length} records</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Contact</Button>
      </div>

      <FilterBar>
        <FilterGroup label="Search">
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.neutral }} />
            <input placeholder="Search contacts…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: 220, paddingLeft: 32 }} />
          </div>
        </FilterGroup>
        <button onClick={() => setSearchTerm("")} style={{ ...inputStyle, width: "auto", background: COLORS.bg, cursor: "pointer", color: COLORS.neutral, marginTop: 16 }}>✕ Clear</button>
      </FilterBar>

      <TableCard title="All Contacts" count={filtered.length}
        onExport={() => exportCSV([["First Name", "Last Name", "Email", "Mobile", "Phone", "Department", "Designation", "Linked Lead", "Life Stage", "Status"], ...filtered.map(c => [c.firstName||c.first_name, c.lastName||c.last_name, c.email, c.mobile, c.phone||"—", c.department||"—", c.designation||"—", c.linkedLead||c.linked_lead||"—", c.lifeStage||c.life_stage||"—", c.active||c.is_active ? "Active" : "Inactive"])], "contacts.csv")}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Name", "Email", "Mobile", "Department", "Designation", "Linked Lead", "Life Stage", "Status", "Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={9} /> :
              filtered.map(c => (
                <tr key={c.id}>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={`${c.firstName || c.first_name} ${c.lastName || c.last_name}`} size={32} />
                      <span style={{ fontWeight: 600 }}>{c.firstName || c.first_name} {c.lastName || c.last_name}</span>
                    </div>
                  </Td>
                  <Td style={{ color: COLORS.secondary }}>{c.email}</Td>
                  <Td>{c.mobile || "—"}</Td>
                  <Td>{c.department || "—"}</Td>
                  <Td><span style={{ padding: "3px 8px", borderRadius: 6, background: COLORS.bg, fontSize: 11, fontWeight: 600 }}>{c.designation || "User"}</span></Td>
                 <Td>{c.linkedLead || c.linked_lead || "—"}</Td>
                  <Td>{c.lifeStage || c.life_stage || "—"}</Td>
                  <Td><StatusBadge status={c.active || c.is_active ? "Active" : "Inactive"} /></Td>
                  <Td><button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }} title="Delete"><Trash2 size={15} /></button></Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="Add Contact" open={showModal} onClose={() => setShowModal(false)} maxWidth={800}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${COLORS.border}` }}>
            Contact Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {[["First Name *", "firstName"], ["Last Name", "lastName"], ["Email *", "email"], ["Department", "department"]].map(([lbl, key]) => (
              <div key={key}>
                <label style={labelStyle}>{lbl}</label>
                <input value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${COLORS.border}` }}>
            Contact Numbers
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Mobile *</label>
              <input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} style={inputStyle} type="tel" />
            </div>
            <div>
              <label style={labelStyle}>Alternate Number</label>
              <input value={formData.altPhone || ""} onChange={e => setFormData({ ...formData, altPhone: e.target.value })} style={inputStyle} type="tel" />
            </div>
            <div>
              <label style={labelStyle}>Landline</label>
              <input value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} type="tel" />
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${COLORS.border}` }}>
            Additional Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Designation</label>
              <select value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} style={inputStyle}>
                {CONTACT_DESIGNATIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Life Stage</label>
              <select value={formData.lifeStage || "Lead"} onChange={e => setFormData({ ...formData, lifeStage: e.target.value })} style={inputStyle}>
                {LIFE_STAGES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Link to Lead (Optional)</label>
              <input list="contactLeads" value={formData.linkedLead} onChange={e => setFormData({ ...formData, linkedLead: e.target.value })} style={inputStyle} placeholder="Select or type" />
              <datalist id="contactLeads">{leads.map(l => <option key={l.id} value={l.name} />)}</datalist>
            </div>
            <div>
              <label style={labelStyle}>Sales Commission (%)</label>
              <input type="number" value={formData.salesCommission || ""} onChange={e => setFormData({ ...formData, salesCommission: e.target.value })} style={inputStyle} placeholder="0" />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <input type="checkbox" id="activeCheck" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
            <label htmlFor="activeCheck" style={{ fontSize: 13, fontWeight: 500 }}>Active</label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED CAMPAIGNS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const CampaignsPage = ({ campaigns, leads, onAddCampaign, onDeleteCampaign, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "Email", status: "Draft", createdBy: USERS[0], recipients: "", subject: "", body: "", cc: "" });

  const filtered = useMemo(() =>
    campaigns.filter(c => {
      const q = searchTerm.toLowerCase();
      return !q || [c.name, c.type, c.status].some(v => (v || "").toLowerCase().includes(q));
    }), [campaigns, searchTerm]);

  const handleSave = async () => {
    if (!formData.name) { alert("Campaign name is required"); return; }
    setLoading(true);
    try {
      await onAddCampaign({ ...formData, recipients: Number(formData.recipients) || 0 });
      setShowModal(false);
      setFormData({ name: "", type: "Email", status: "Draft", createdBy: USERS[0], recipients: "", subject: "", body: "", cc: "" });
      onRefresh();
    } catch (err) { alert("Error: " + err.message); }
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
          <p style={{ fontSize: 14, color: COLORS.neutral, margin: 0 }}>Marketing campaigns linked to leads · {filtered.length} records</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Create Campaign</Button>
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Name", "Type", "Status", "Created By", "Recipients", "Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <NoData cols={6} /> :
              filtered.map(c => (
                <tr key={c.id}>
                  <Td style={{ fontWeight: 600 }}>{c.name}</Td>
                  <Td><StatusBadge status={c.type} /></Td>
                  <Td><StatusBadge status={c.status} /></Td>
                  <Td>{c.createdBy || c.created_by || "—"}</Td>
                  <Td>{c.recipients || 0}</Td>
                  <Td><button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, padding: "4px 6px" }} title="Delete"><Trash2 size={15} /></button></Td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <Modal title="Create Campaign" open={showModal} onClose={() => setShowModal(false)} maxWidth={850}>
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Campaign Name *</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
                {["Email", "SMS", "Social Media", "WhatsApp"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                {["Draft", "Active", "Inactive", "Completed"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Created By</label>
              <select value={formData.createdBy} onChange={e => setFormData({ ...formData, createdBy: e.target.value })} style={inputStyle}>
                {USERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Recipients</label>
              <input type="number" value={formData.recipients} onChange={e => setFormData({ ...formData, recipients: e.target.value })} style={inputStyle} placeholder="0" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <input value={formData.subject || ""} onChange={e => setFormData({ ...formData, subject: e.target.value })} style={inputStyle} placeholder="Email subject" />
          </div>
          <div>
            <label style={labelStyle}>CC (comma separated)</label>
            <input value={formData.cc || ""} onChange={e => setFormData({ ...formData, cc: e.target.value })} style={inputStyle} placeholder="email@example.com" />
          </div>
          <div>
            <label style={labelStyle}>Email Body</label>
            <RichTextEditor value={formData.body} onChange={html => setFormData({ ...formData, body: html })} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>Create</Button>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SOURCES PAGE (MASTER DATA)
// ═══════════════════════════════════════════════════════════════════════════
const SourcesPage = ({ leads }) => {
  const sourceStats = LEAD_SOURCES.map(s => ({
    source: s,
    count: leads.filter(l => l.source === s).length,
    value: leads.filter(l => l.source === s).reduce((sum, l) => sum + (Number(l.value) || 0), 0),
    converted: leads.filter(l => l.source === s && l.converted).length,
  }));

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Lead Sources</h1>
      <p style={{ fontSize: 14, color: COLORS.neutral, margin: "0 0 24px 0" }}>Track where your leads originate from</p>
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
                  <div style={{ fontSize: 11, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Value</div>
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
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const ReportsPage = ({ leads, proposals, navigate }) => {
  const stageData = LEAD_STAGES.map(s => ({ stage: s, count: leads.filter(l => l.stage === s).length, value: leads.filter(l => l.stage === s).reduce((sum, l) => sum + (Number(l.value) || 0), 0) }));
  const sourceData = LEAD_SOURCES.map(s => ({ source: s, count: leads.filter(l => l.source === s).length })).filter(s => s.count > 0);
  const userLeads = USERS.map(u => ({ name: u, leads: leads.filter(l => l.assigned === u).length, proposals: proposals.filter(p => p.sentBy === u).length }));
  const totalValue = proposals.reduce((s, p) => s + (Number(p.value) || 0), 0);
  const wonValue = proposals.filter(p => p.status === "Accepted").reduce((s, p) => s + (Number(p.value) || 0), 0);
  const winRate = proposals.length ? ((proposals.filter(p => p.status === "Accepted").length / proposals.length) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Reports</h1>
      <p style={{ fontSize: 14, color: COLORS.neutral, margin: "0 0 24px 0" }}>Sales analytics and performance overview</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <KPICard icon={Users} label="Total Leads" value={leads.length} color={COLORS.primary} onClick={() => navigate("/crm/leads")} />
        <KPICard icon={FileText} label="Pipeline" value={formatCurrency(totalValue)} color={COLORS.secondary} onClick={() => navigate("/crm/proposals")} />
        <KPICard icon={Check} label="Won Value" value={formatCurrency(wonValue)} color={COLORS.success} onClick={() => navigate("/crm/proposals")} />
        <KPICard icon={TrendingUp} label="Win Rate" value={`${winRate}%`} color={COLORS.info} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Leads by Stage</h3>
          </div>
          <div style={{ padding: 20 }}>
            {stageData.map(s => {
              const pct = leads.length ? (s.count / leads.length) * 100 : 0;
              const color = getStageTextColor(s.stage);
              return (
                <div key={s.stage} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.stage}</span>
                    <span style={{ fontSize: 13, color: COLORS.neutral }}>{s.count} · {formatCurrency(s.value)}</span>
                  </div>
                  <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Team Performance</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{["Member", "Leads", "Proposals"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
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

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>By Source</h3>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {sourceData.length === 0 ? <p style={{ color: COLORS.neutral, fontSize: 13 }}>No data</p> :
            sourceData.map(s => (
              <div key={s.source} style={{ background: COLORS.bg, borderRadius: 8, padding: 12, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 12, color: COLORS.neutral, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{s.source}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{s.count}</div>
                <div style={{ fontSize: 10, color: COLORS.neutral, marginTop: 2 }}>{leads.length ? ((s.count / leads.length) * 100).toFixed(0) : 0}% of total</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════
const SettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    company: "Manod Technologies",
    currency: "INR",
    defaultAssigned: USERS[0],
    defaultStage: "New",
    defaultSource: "Website"
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Settings</h1>
      <p style={{ fontSize: 14, color: COLORS.neutral, margin: "0 0 24px 0" }}>Configure your CRM system</p>
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
          <div>
            <label style={labelStyle}>Default Lead Stage</label>
            <select value={settings.defaultStage} onChange={e => setSettings({ ...settings, defaultStage: e.target.value })} style={inputStyle}>
              {LEAD_STAGES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Default Lead Source</label>
            <select value={settings.defaultSource} onChange={e => setSettings({ ...settings, defaultSource: e.target.value })} style={inputStyle}>
              {LEAD_SOURCES.map(o => <option key={o}>{o}</option>)}
            </select>
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
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (pathname) => {
    const seg = pathname.replace("/crm", "").replace(/^\//, "").split("/")[0];
    const map = {
      "": "dashboard", "leads": "leads", "proposals": "proposals",
      "follow-ups": "followups", "campaigns": "campaigns", "contacts": "contacts",
      "reports": "reports", "sources": "sources", "settings": "settings",
    };
    return map[seg] || "dashboard";
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab) => {
    const pathMap = {
      dashboard: "/crm", leads: "/crm/leads", proposals: "/crm/proposals",
      followups: "/crm/follow-ups", campaigns: "/crm/campaigns", contacts: "/crm/contacts",
      reports: "/crm/reports", sources: "/crm/sources", settings: "/crm/settings",
    };
    navigate(pathMap[tab] || "/crm");
  };

  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const fetchAll = async () => {
  setLoading(true); setError(null);
  try {
    const results = await Promise.allSettled([
      crmAPI.fetchLeads(), crmAPI.fetchProposals(), crmAPI.fetchFollowups(),
      crmAPI.fetchCampaigns(), crmAPI.fetchContacts(),
    ]);
    const [lR, pR, fR, cR, ctR] = results.map(r => r.status === "fulfilled" ? r.value : {});
    setLeads(lR.leads || []);
    setProposals(pR.proposals || []);
    setFollowups(fR.followups || []);
    setCampaigns(cR.campaigns || []);
    setContacts(ctR.contacts || []);

    const failed = results.filter(r => r.status === "rejected");
    if (failed.length > 0) {
      console.error("Some CRM data failed to load:", failed);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load data. Ensure the backend is running.");
  } finally { setLoading(false); }
};
  useEffect(() => { fetchAll(); }, []);

  const handleAddLead = async (data) => {
    const res = await crmAPI.createLead(data);
    setLeads(prev => [res.lead, ...prev]);
  };

  const handleEditLead = async (id, data) => {
    const res = await crmAPI.updateLead(id, data);
    setLeads(prev => prev.map(l => l.id === id ? res.lead : l));
  };

  const handleDeleteLead = async (id) => {
    await crmAPI.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleConvertLead = async (id) => {
    const lead = leads.find(l => l.id === id);
    const res = await crmAPI.convertLead(id);
    setLeads(prev => prev.map(l => l.id === id ? res.lead : l));
    if (lead) {
      await crmAPI.createContact({
        firstName: lead.name.split(" ")[0],
        lastName: lead.name.split(" ").slice(1).join(" ") || "—",
        email: lead.email,
        mobile: lead.phone || lead.mobile,
        linkedLead: lead.name,
        active: true
      }).catch(e => console.error("Contact creation failed:", e));
    }
  };

  const handleAddProposal = async (data) => {
    const res = await crmAPI.createProposal(data);
    setProposals(prev => [res.proposal, ...prev]);
  };
const handleEditProposal = async (id, data) => {
    const res = await crmAPI.updateProposal(id, data);
    setProposals(prev => prev.map(p => p.id === id ? res.proposal : p));
  };
  const handleDeleteProposal = async (id) => {
    await crmAPI.deleteProposal(id);
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  const handleProposalStatus = async (id, status) => {
    const existing = proposals.find(p => p.id === id);
    const res = await crmAPI.updateProposal(id, { ...existing, status });
    setProposals(prev => prev.map(p => p.id === id ? res.proposal : p));
  };

  const handleSendProposal = async (id) => {
    const res = await crmAPI.sendProposal(id);
    setProposals(prev => prev.map(p => p.id === id ? res.proposal : p));
  };

  const handleAddFollowup = async (data) => {
    const res = await crmAPI.createFollowup(data);
    setFollowups(prev => [res.followup, ...prev]);
  };

  const handleEditFollowup = async (id, data) => {
    const res = await crmAPI.updateFollowup(id, data);
    setFollowups(prev => prev.map(f => f.id === id ? res.followup : f));
  };
  const handleDeleteFollowup = async (id) => {
    await crmAPI.deleteFollowup(id);
    setFollowups(prev => prev.filter(f => f.id !== id));
  };

const handleMarkComplete = async (id) => {
    const existing = followups.find(f => f.id === id);
    const res = await crmAPI.updateFollowup(id, { ...existing, lead: existing.lead || existing.lead_name, status: "Completed" });
    setFollowups(prev => prev.map(f => f.id === id ? res.followup : f));
  };
  const handleAddCampaign = async (data) => {
    const res = await crmAPI.createCampaign(data);
    setCampaigns(prev => [res.campaign, ...prev]);
  };

  const handleDeleteCampaign = async (id) => {
  await crmAPI.deleteCampaign(id);
  setCampaigns(prev => prev.filter(c => c.id !== id));
};
  const handleAddContact = async (data) => {
    const res = await crmAPI.createContact(data);
    setContacts(prev => [res.contact, ...prev]);
  };

  const handleDeleteContact = async (id) => {
    await crmAPI.deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const counts = {
  leads: leads.filter(l => l && !l.converted).length,
  followups: followups.filter(f => f && f.status === "Scheduled").length,
  proposals: proposals.filter(p => p && ["Sent", "Viewed"].includes(p.status)).length,
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
      <CRMNav activeTab={activeTab} onTabChange={handleTabChange} counts={counts} />

      {activeTab === "dashboard" && <CRMDashboard leads={leads} proposals={proposals} followups={followups} navigate={navigate} />}
      {activeTab === "leads" && <LeadsPage leads={leads} followups={followups} onAddLead={handleAddLead} onEditLead={handleEditLead} onDeleteLead={handleDeleteLead} onConvertLead={handleConvertLead} onAddFollowup={handleAddFollowup} onRefresh={fetchAll} />}
      {activeTab === "followups" && <FollowUpsPage followups={followups} leads={leads} onAddFollowup={handleAddFollowup} onEditFollowup={handleEditFollowup} onDeleteFollowup={handleDeleteFollowup} onMarkComplete={handleMarkComplete} onRefresh={fetchAll} />}
{activeTab === "proposals" && <ProposalsPage proposals={proposals} leads={leads} onAddProposal={handleAddProposal} onEditProposal={handleEditProposal} onDeleteProposal={handleDeleteProposal} onStatusChange={handleProposalStatus} onSendProposal={handleSendProposal} onRefresh={fetchAll} />}      {activeTab === "contacts" && <ContactsPage contacts={contacts} leads={leads} onAddContact={handleAddContact} onDeleteContact={handleDeleteContact} onRefresh={fetchAll} />}
      {activeTab === "campaigns" && <CampaignsPage campaigns={campaigns} leads={leads} onAddCampaign={handleAddCampaign} onDeleteCampaign={handleDeleteCampaign} onRefresh={fetchAll} />}
      {activeTab === "reports" && <ReportsPage leads={leads} proposals={proposals} navigate={navigate} />}
      {activeTab === "sources" && <SourcesPage leads={leads} />}
      {activeTab === "settings" && <SettingsPage />}
    </div>
  );
}
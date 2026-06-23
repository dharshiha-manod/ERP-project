/**
 * Manufacturing.jsx  — Manod ERP
 * ─────────────────────────────────────────────────────────────────
 * Single-file Manufacturing module.  All 10 tabs live here:
 *   Production Planning · BOM · Work Orders · Production ·
 *   Resources · Machines · Schedule · Quality Control ·
 *   Maintenance · Production Reports
 *
 * Data: GET / POST / PUT / DELETE  →  /api/manufacturing/*
 * Auth: Bearer token from localStorage("manod_token")
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";

// ─── API ──────────────────────────────────────────────────────────
const API = "/api/manufacturing";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("manod_token") || ""}`,
});

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// ─── Design tokens ────────────────────────────────────────────────
const G = {
  green:     "#1a5c38",
  greenDark: "#144a2e",
  greenMid:  "#256b43",
  g100:      "#e8f4ee",
  g50:       "#f2faf5",
  amber:     "#b45309",
  amberBg:   "#fffbeb",
  amberBdr:  "#fde68a",
  red:       "#b91c1c",
  redBg:     "#fef2f2",
  redBdr:    "#fecaca",
  blue:      "#1d4ed8",
  blueBg:    "#eff6ff",
  blueBdr:   "#bfdbfe",
  purple:    "#6d28d9",
  purpleBg:  "#f5f3ff",
  n900:      "#111827",
  n800:      "#1f2937",
  n700:      "#374151",
  n600:      "#4b5563",
  n500:      "#6b7280",
  n400:      "#9ca3af",
  n300:      "#d1d5db",
  n200:      "#e5e7eb",
  n100:      "#f3f4f6",
  n50:       "#f9fafb",
  white:     "#ffffff",
  sh:        "0 1px 3px rgba(0,0,0,.09),0 1px 2px rgba(0,0,0,.05)",
  shMd:      "0 4px 8px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.05)",
  shLg:      "0 10px 24px rgba(0,0,0,.10)",
  shXl:      "0 20px 48px rgba(0,0,0,.14)",
};

// ─── Status config ────────────────────────────────────────────────
const SC = {
  planned:     { txt: G.blue,   bg: G.blueBg,   bdr: G.blueBdr   },
  in_progress: { txt: G.amber,  bg: G.amberBg,  bdr: G.amberBdr  },
  completed:   { txt: G.green,  bg: G.g100,     bdr: "#6ee7b7"   },
  on_hold:     { txt: G.amber,  bg: G.amberBg,  bdr: G.amberBdr  },
  active:      { txt: G.green,  bg: G.g100,     bdr: "#6ee7b7"   },
  inactive:    { txt: G.n500,   bg: G.n100,     bdr: G.n300      },
  running:     { txt: G.green,  bg: G.g100,     bdr: "#6ee7b7"   },
  idle:        { txt: G.amber,  bg: G.amberBg,  bdr: G.amberBdr  },
  maintenance: { txt: G.red,    bg: G.redBg,    bdr: G.redBdr    },
  passed:      { txt: G.green,  bg: G.g100,     bdr: "#6ee7b7"   },
  failed:      { txt: G.red,    bg: G.redBg,    bdr: G.redBdr    },
  pending:     { txt: G.amber,  bg: G.amberBg,  bdr: G.amberBdr  },
  scheduled:   { txt: G.blue,   bg: G.blueBg,   bdr: G.blueBdr   },
  overdue:     { txt: G.red,    bg: G.redBg,    bdr: G.redBdr    },
  low:         { txt: G.blue,   bg: G.blueBg,   bdr: G.blueBdr   },
  medium:      { txt: G.amber,  bg: G.amberBg,  bdr: G.amberBdr  },
  high:        { txt: G.red,    bg: G.redBg,    bdr: G.redBdr    },
};

// ─── Tiny components ──────────────────────────────────────────────

function Chip({ status, label }) {
  const c = SC[status] || { txt: G.n500, bg: G.n100, bdr: G.n300 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, letterSpacing: .3,
      padding: "3px 9px", borderRadius: 20,
      color: c.txt, background: c.bg, border: `1px solid ${c.bdr}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.txt, flexShrink: 0 }} />
      {label || status?.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}
    </span>
  );
}

function Bar({ pct = 0, h = 6 }) {
  const color = pct >= 100 ? G.green : pct > 60 ? G.greenMid : pct > 30 ? G.amber : G.red;
  return (
    <div style={{ background: G.n200, borderRadius: 99, height: h, overflow: "hidden", minWidth: 80 }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s" }} />
    </div>
  );
}

function KCard({ icon, label, value, sub, accent }) {
  const ac = accent || G.green;
  return (
    <div style={{
      background: G.white, borderRadius: 12, padding: "18px 20px",
      boxShadow: G.sh, border: `1px solid ${G.n200}`,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${ac}18`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: G.n500, textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: G.n900, lineHeight: 1 }}>{value ?? "—"}</div>
        {sub && <div style={{ fontSize: 12, color: G.n500, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Shared input styles ──────────────────────────────────────────
const inp = { width: "100%", padding: "8px 11px", borderRadius: 7, border: `1px solid ${G.n300}`, fontSize: 13, color: G.n800, background: G.white, boxSizing: "border-box", outline: "none" };
const sel = { ...inp, cursor: "pointer" };
const ta  = { ...inp, resize: "vertical", minHeight: 64 };
const btnPri = { background: `linear-gradient(135deg,${G.green},${G.greenMid})`, color: G.white, border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: `0 2px 6px ${G.green}40` };
const btnOut = { background: G.white, color: G.green, border: `1.5px solid ${G.green}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const btnGh  = { background: G.n100, color: G.n700, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnDel = { background: G.redBg, color: G.red, border: `1px solid ${G.redBdr}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" };
const btnEdit= { background: G.g50, color: G.green, border: `1px solid ${G.g100}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" };
const btnView= { background: G.blueBg, color: G.blue, border: `1px solid ${G.blueBdr}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" };

// ─── Field & form helpers ─────────────────────────────────────────
const Lbl = ({ t, req }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.n600, marginBottom: 4 }}>
    {t}{req && <span style={{ color: G.red }}> *</span>}
  </label>
);

function Fld({ label, req, span, children }) {
  return (
    <div style={span ? { gridColumn: "span 2" } : {}}>
      <Lbl t={label} req={req} />
      {children}
    </div>
  );
}

function FGrid({ children, cols = 2 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: "12px 16px" }}>{children}</div>;
}

// ─── Modal ────────────────────────────────────────────────────────
function Mdl({ title, subtitle, onClose, children, wide }) {
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.52)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div style={{ background: G.white, borderRadius: 16, padding: 0, width: wide ? 760 : 540, maxWidth: "95vw", maxHeight: "90vh", boxShadow: G.shXl, display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${G.n100}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: G.n900 }}>{title}</div>
              {subtitle && <div style={{ fontSize: 12, color: G.n500, marginTop: 2 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: G.n400, lineHeight: 1, padding: 0 }}>×</button>
          </div>
        </div>
        <div style={{ padding: "18px 24px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function MdlFoot({ onClose, onSave, saveLabel = "Save", saving }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16, borderTop: `1px solid ${G.n100}`, marginTop: 4 }}>
      <button onClick={onClose} style={btnGh}>Cancel</button>
      <button onClick={onSave} disabled={saving} style={{ ...btnPri, opacity: saving ? .7 : 1 }}>{saving ? "Saving…" : saveLabel}</button>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────
function Tbl({ cols, rows, onEdit, onDelete, onView, loading, emptyMsg = "No records found." }) {
  if (loading) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: G.n400, fontSize: 13 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>Loading…
    </div>
  );
  if (!rows?.length) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: G.n400, fontSize: 13 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>{emptyMsg}
    </div>
  );
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: G.n50, borderBottom: `1px solid ${G.n200}` }}>
            {cols.map(c => (
              <th key={c.k || c.label} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: G.n500, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
            <th style={{ padding: "9px 14px", fontSize: 10, fontWeight: 700, color: G.n500, textTransform: "uppercase", letterSpacing: .6 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} style={{ borderBottom: `1px solid ${G.n100}`, transition: "background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background = G.g50}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {cols.map(c => (
                <td key={c.k || c.label} style={{ padding: "11px 14px", color: G.n700, verticalAlign: "middle" }}>
                  {c.r ? c.r(row[c.k], row) : (row[c.k] ?? "—")}
                </td>
              ))}
              <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {onView   && <button style={btnView}  onClick={() => onView(row)}>👁</button>}
                  {onEdit   && <button style={btnEdit}  onClick={() => onEdit(row)}>✏️</button>}
                  {onDelete && <button style={btnDel}   onClick={() => onDelete(row)}>🗑</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PgBar({ total, page, perPage, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from  = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to    = Math.min(page * perPage, total);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: `1px solid ${G.n100}`, fontSize: 12, color: G.n500 }}>
      <span>Showing {from}–{to} of {total}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {[{ l: "‹ Prev", p: page - 1, d: page <= 1 }, { l: "Next ›", p: page + 1, d: page >= pages }].map(({ l, p, d }) => (
          <button key={l} onClick={() => !d && onPage(p)} disabled={d} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${G.n200}`, background: d ? G.n100 : G.white, color: d ? G.n300 : G.n700, cursor: d ? "default" : "pointer", fontSize: 12, fontWeight: 600 }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function SBar({ search, setSearch, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${G.n100}`, flexWrap: "wrap" }}>
      {children}
      <div style={{ position: "relative", marginLeft: "auto" }}>
        <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: G.n400, pointerEvents: "none" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ ...inp, paddingLeft: 28, width: 190 }} />
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: G.white, borderRadius: 12, border: `1px solid ${G.n200}`, boxShadow: G.sh, overflow: "hidden", ...style }}>{children}</div>;
}

function Divider({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: G.n500, textTransform: "uppercase", letterSpacing: .7, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: G.n200 }} />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────
function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setT({ msg, type });
    setTimeout(() => setT(null), 3500);
  }, []);
  const ac = { success: G.green, error: G.red, info: G.blue };
  const ic = { success: "✓", error: "✕", info: "i" };
  const el = t ? (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: G.white, borderRadius: 10, padding: "12px 18px",
      boxShadow: G.shLg, borderLeft: `5px solid ${ac[t.type] || G.green}`,
      display: "flex", alignItems: "center", gap: 12, minWidth: 280,
      animation: "mfgIn .25s ease",
    }}>
      <style>{`@keyframes mfgIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: ac[t.type] || G.green, color: G.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{ic[t.type]}</span>
      <span style={{ fontSize: 14, color: G.n800, flex: 1, fontWeight: 500 }}>{t.msg}</span>
      <button onClick={() => setT(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: G.n400 }}>×</button>
    </div>
  ) : null;
  return { show, el };
}

// ══════════════════════════════════════════════════════════════════
// TAB 1 — PRODUCTION PLANNING
// ══════════════════════════════════════════════════════════════════
function PlanningTab({ show }) {
  const [plans,  setPlans]  = useState([]);
  const [load,   setLoad]   = useState(true);
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);
  const [fStatus,setFS]     = useState("");
  const [modal,  setModal]  = useState(false);
  const [edit,   setEdit]   = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 10;

  const blank = { title: "", description: "", start_date: "", end_date: "", status: "planned", priority: "medium", assigned_team: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetch = useCallback(async () => {
    setLoad(true);
    try { setPlans(await api("/plans")); }
    catch (e) { show(e.message, "error"); }
    finally { setLoad(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = plans.filter(p =>
    (!fStatus || p.status === fStatus) &&
    `${p.title} ${p.assigned_team}`.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ title: r.title, description: r.description || "", start_date: r.start_date || "", end_date: r.end_date || "", status: r.status, priority: r.priority, assigned_team: r.assigned_team || "" }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.title || !form.start_date || !form.end_date) { show("Title, Start Date and End Date are required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/plans/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setPlans(p => p.map(x => x.id === edit.id ? d : x)); show("Plan updated."); }
      else       { const d = await api("/plans", { method: "POST", body: JSON.stringify(form) }); setPlans(p => [d, ...p]); show("Plan created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm(`Delete plan "${r.title}"?`)) return;
    try { await api(`/plans/${r.id}`, { method: "DELETE" }); setPlans(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "title",         label: "Plan Title",    r: v => <span style={{ fontWeight: 600, color: G.n800 }}>{v}</span> },
    { k: "start_date",    label: "Start" },
    { k: "end_date",      label: "End" },
    { k: "assigned_team", label: "Team" },
    { k: "priority",      label: "Priority",      r: v => <Chip status={v} /> },
    { k: "status",        label: "Status",        r: v => <Chip status={v} /> },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <KCard icon="📋" label="Total Plans"  value={plans.length} />
        <KCard icon="🕒" label="Planned"      value={plans.filter(p => p.status === "planned").length}     accent={G.blue} />
        <KCard icon="⚙️" label="In Progress"  value={plans.filter(p => p.status === "in_progress").length} accent={G.amber} />
        <KCard icon="✅" label="Completed"    value={plans.filter(p => p.status === "completed").length}   accent={G.green} />
      </div>
      <Card>
        <SBar search={search} setSearch={setSearch}>
          <select value={fStatus} onChange={e => { setFS(e.target.value); setPage(1); }} style={{ ...sel, width: 150 }}>
            <option value="">All Status</option>
            {["planned", "in_progress", "completed", "on_hold"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <button style={btnPri} onClick={openAdd}>+ Add Plan</button>
        </SBar>
        <Tbl cols={COLS} rows={paged} loading={load} onEdit={openEdit} onDelete={del} />
        <PgBar total={filtered.length} page={page} perPage={PER} onPage={setPage} />
      </Card>

      {modal && (
        <Mdl title={edit ? "Edit Plan" : "New Production Plan"} subtitle="Fill in the plan details" onClose={() => setModal(false)}>
          <FGrid cols={2}>
            <Fld label="Plan Title" req span><input style={inp} value={form.title} onChange={e => sf("title", e.target.value)} placeholder="e.g. Q3 Industrial Valve Run" /></Fld>
            <Fld label="Start Date" req><input type="date" style={inp} value={form.start_date} onChange={e => sf("start_date", e.target.value)} /></Fld>
            <Fld label="End Date"   req><input type="date" style={inp} value={form.end_date}   onChange={e => sf("end_date",   e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["planned","in_progress","completed","on_hold"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Priority"><select style={sel} value={form.priority} onChange={e => sf("priority", e.target.value)}>{["low","medium","high"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Assigned Team"><input style={inp} value={form.assigned_team} onChange={e => sf("assigned_team", e.target.value)} placeholder="Team Alpha" /></Fld>
            <Fld label="Description" span><textarea style={ta} value={form.description} onChange={e => sf("description", e.target.value)} placeholder="Optional notes…" /></Fld>
          </FGrid>
          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Create Plan"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 2 — BILL OF MATERIALS
// ══════════════════════════════════════════════════════════════════
function BOMTab({ show }) {
  const [boms, setBoms] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 10;

  const blankIng = () => ({ item_name: "", quantity: "", unit: "pcs", cost: "" });
  const blank = { product_name: "", product_code: "", quantity: "", unit: "pcs", version: "1.0", status: "active", notes: "", ingredients: [blankIng()] };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const si = (i, k, v) => setForm(f => ({ ...f, ingredients: f.ingredients.map((x, j) => j === i ? { ...x, [k]: v } : x) }));

  const fetch = useCallback(async () => {
    setLoad(true);
    try { setBoms(await api("/bom")); }
    catch (e) { show(e.message, "error"); }
    finally { setLoad(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = boms.filter(b => `${b.product_name} ${b.product_code}`.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ product_name: r.product_name, product_code: r.product_code || "", quantity: r.quantity, unit: r.unit, version: r.version || "1.0", status: r.status, notes: r.notes || "", ingredients: r.ingredients?.length ? r.ingredients.map(x => ({ ...x })) : [blankIng()] }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.product_name || !form.quantity) { show("Product name and quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/bom/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setBoms(p => p.map(x => x.id === edit.id ? d : x)); show("BOM updated."); }
      else       { const d = await api("/bom", { method: "POST", body: JSON.stringify(form) }); setBoms(p => [d, ...p]); show("BOM created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm(`Delete BOM for "${r.product_name}"?`)) return;
    try { await api(`/bom/${r.id}`, { method: "DELETE" }); setBoms(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "product_code",  label: "Code",    r: v => <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: G.green, background: G.g50, padding: "2px 6px", borderRadius: 4 }}>{v || "—"}</span> },
    { k: "product_name",  label: "Product", r: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { k: "quantity",      label: "Qty",     r: (v, r) => `${v} ${r.unit}` },
    { k: "version",       label: "Version" },
    { k: "ingredients",   label: "Components", r: v => <span style={{ fontWeight: 600 }}>{v?.length || 0}</span> },
    { k: "status",        label: "Status",  r: v => <Chip status={v} /> },
  ];

  const totalCost = (bom) => bom.ingredients?.reduce((s, x) => s + (parseFloat(x.cost) || 0) * (parseFloat(x.quantity) || 0), 0) || 0;

  return (
    <div>
      <Card>
        <SBar search={search} setSearch={setSearch}>
          <button style={btnPri} onClick={openAdd}>+ New BOM</button>
        </SBar>
        <Tbl cols={COLS} rows={paged} loading={load} onView={r => setView(r)} onEdit={openEdit} onDelete={del} />
        <PgBar total={filtered.length} page={page} perPage={PER} onPage={setPage} />
      </Card>

      {/* View BOM */}
      {view && (
        <Mdl title={view.product_name} subtitle={`${view.product_code || ""} · v${view.version}`} onClose={() => setView(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
            {[["BOM Cost", `₹${totalCost(view).toLocaleString()}`], ["Base Qty", `${view.quantity} ${view.unit}`], ["Components", view.ingredients?.length || 0], ["Status", null]].map(([l, v]) => (
              <div key={l} style={{ background: G.n50, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: G.n400, textTransform: "uppercase", letterSpacing: .5, marginBottom: 4 }}>{l}</div>
                {l === "Status" ? <Chip status={view.status} /> : <div style={{ fontSize: 16, fontWeight: 700, color: G.green }}>{v}</div>}
              </div>
            ))}
          </div>
          {view.ingredients?.length > 0 && (
            <>
              <Divider title="Components" />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: G.green }}>
                  {["Item Name", "Qty", "Unit", "Unit Cost ₹", "Total ₹"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: G.white, fontSize: 11, fontWeight: 700 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {view.ingredients.map((ing, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${G.n100}`, background: i % 2 ? G.n50 : G.white }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600 }}>{ing.item_name}</td>
                      <td style={{ padding: "9px 12px" }}>{ing.quantity}</td>
                      <td style={{ padding: "9px 12px", color: G.n500 }}>{ing.unit}</td>
                      <td style={{ padding: "9px 12px" }}>₹{(parseFloat(ing.cost) || 0).toLocaleString()}</td>
                      <td style={{ padding: "9px 12px", fontWeight: 700, color: G.green }}>₹{((parseFloat(ing.quantity) || 0) * (parseFloat(ing.cost) || 0)).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ background: G.g50, fontWeight: 700 }}>
                    <td colSpan={4} style={{ padding: "9px 12px", textAlign: "right" }}>Total Material Cost</td>
                    <td style={{ padding: "9px 12px", color: G.green, fontSize: 14 }}>₹{totalCost(view).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
          {view.notes && <div style={{ marginTop: 14, padding: "10px 14px", background: G.amberBg, borderRadius: 8, fontSize: 13, color: G.amber, border: `1px solid ${G.amberBdr}` }}>📝 {view.notes}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setView(null)} style={btnGh}>Close</button>
          </div>
        </Mdl>
      )}

      {/* Add / Edit BOM */}
      {modal && (
        <Mdl title={edit ? "Edit BOM" : "New Bill of Materials"} subtitle="Define product structure and component costs" onClose={() => setModal(false)} wide>
          <FGrid cols={2}>
            <Fld label="Product Name" req span><input style={inp} value={form.product_name} onChange={e => sf("product_name", e.target.value)} placeholder="Industrial Valve A3" /></Fld>
            <Fld label="Product Code"><input style={inp} value={form.product_code} onChange={e => sf("product_code", e.target.value)} placeholder="IVA3-001" /></Fld>
            <Fld label="Base Quantity" req><input type="number" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Unit"><select style={sel} value={form.unit} onChange={e => sf("unit", e.target.value)}>{["pcs", "kg", "ltrs", "mtrs", "boxes"].map(u => <option key={u}>{u}</option>)}</select></Fld>
            <Fld label="Version"><input style={inp} value={form.version} onChange={e => sf("version", e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </FGrid>

          <Divider title="Components / Ingredients" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 8 }}>
              <thead><tr style={{ background: G.n50, borderBottom: `1px solid ${G.n200}` }}>
                {["Item Name", "Qty", "Unit", "Unit Cost ₹", ""].map(h => <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: G.n500, textTransform: "uppercase" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {form.ingredients.map((ing, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${G.n100}` }}>
                    <td style={{ padding: "5px 6px" }}><input style={{ ...inp, width: 160 }} value={ing.item_name} onChange={e => si(i, "item_name", e.target.value)} placeholder="Steel Body" /></td>
                    <td style={{ padding: "5px 6px" }}><input type="number" style={{ ...inp, width: 65 }} value={ing.quantity} onChange={e => si(i, "quantity", e.target.value)} min={0} /></td>
                    <td style={{ padding: "5px 6px" }}><input style={{ ...inp, width: 70 }} value={ing.unit} onChange={e => si(i, "unit", e.target.value)} /></td>
                    <td style={{ padding: "5px 6px" }}><input type="number" style={{ ...inp, width: 85 }} value={ing.cost} onChange={e => si(i, "cost", e.target.value)} min={0} /></td>
                    <td style={{ padding: "5px 6px" }}><button onClick={() => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, j) => j !== i) }))} style={{ background: G.redBg, color: G.red, border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setForm(f => ({ ...f, ingredients: [...f.ingredients, blankIng()] }))} style={{ ...btnOut, fontSize: 12, padding: "5px 12px", marginBottom: 4 }}>+ Add Component</button>

          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Create BOM"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 3 — WORK ORDERS
// ══════════════════════════════════════════════════════════════════
function WorkOrdersTab({ show }) {
  const [orders, setOrders] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [fStatus, setFS] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 10;

  const blank = { wo_number: "", product_name: "", quantity: "", unit: "pcs", start_date: "", end_date: "", priority: "medium", status: "planned", assigned_team: "", progress: 0, notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetch = useCallback(async () => { setLoad(true); try { setOrders(await api("/work-orders")); } catch (e) { show(e.message, "error"); } finally { setLoad(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = orders.filter(o =>
    (!fStatus || o.status === fStatus) &&
    `${o.wo_number} ${o.product_name} ${o.assigned_team}`.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ wo_number: r.wo_number, product_name: r.product_name, quantity: r.quantity, unit: r.unit, start_date: r.start_date || "", end_date: r.end_date || "", priority: r.priority, status: r.status, assigned_team: r.assigned_team || "", progress: r.progress || 0, notes: r.notes || "" }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.product_name || !form.quantity) { show("Product and quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/work-orders/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setOrders(p => p.map(x => x.id === edit.id ? d : x)); show("Work order updated."); }
      else       { const d = await api("/work-orders", { method: "POST", body: JSON.stringify(form) }); setOrders(p => [d, ...p]); show("Work order created."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm(`Delete work order "${r.wo_number}"?`)) return;
    try { await api(`/work-orders/${r.id}`, { method: "DELETE" }); setOrders(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const quickStatus = async (r, status) => {
    try { const d = await api(`/work-orders/${r.id}`, { method: "PUT", body: JSON.stringify({ ...r, status }) }); setOrders(p => p.map(x => x.id === r.id ? d : x)); show("Status updated."); }
    catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "wo_number",     label: "WO #",    r: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: G.green, fontSize: 12 }}>{v}</span> },
    { k: "product_name",  label: "Product", r: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { k: "quantity",      label: "Qty",     r: (v, r) => `${v} ${r.unit}` },
    { k: "assigned_team", label: "Team" },
    { k: "start_date",    label: "Start" },
    { k: "end_date",      label: "End" },
    { k: "progress",      label: "Progress", r: v => <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 110 }}><Bar pct={v || 0} /><span style={{ fontSize: 11, color: G.n500, whiteSpace: "nowrap" }}>{v || 0}%</span></div> },
    { k: "priority",      label: "Priority", r: v => <Chip status={v} /> },
    { k: "status",        label: "Status",   r: (v, r) => (
      <select value={v} onClick={e => e.stopPropagation()} onChange={e => quickStatus(r, e.target.value)} style={{ ...sel, width: 130, fontSize: 11, padding: "4px 8px" }}>
        {["planned", "in_progress", "completed", "on_hold"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
      </select>
    )},
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 22 }}>
        <KCard icon="📋" label="Total"       value={orders.length} />
        <KCard icon="🕒" label="Planned"     value={orders.filter(o => o.status === "planned").length}     accent={G.blue} />
        <KCard icon="⚙️" label="In Progress" value={orders.filter(o => o.status === "in_progress").length} accent={G.amber} />
        <KCard icon="✅" label="Completed"   value={orders.filter(o => o.status === "completed").length}   accent={G.green} />
        <KCard icon="⏸️" label="On Hold"     value={orders.filter(o => o.status === "on_hold").length}     accent={G.red} />
      </div>
      <Card>
        <SBar search={search} setSearch={setSearch}>
          <select value={fStatus} onChange={e => { setFS(e.target.value); setPage(1); }} style={{ ...sel, width: 150 }}>
            <option value="">All Status</option>
            {["planned", "in_progress", "completed", "on_hold"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <button style={btnPri} onClick={openAdd}>+ New Work Order</button>
        </SBar>
        <Tbl cols={COLS} rows={paged} loading={load} onEdit={openEdit} onDelete={del} />
        <PgBar total={filtered.length} page={page} perPage={PER} onPage={setPage} />
      </Card>

      {modal && (
        <Mdl title={edit ? `Edit ${edit.wo_number}` : "New Work Order"} onClose={() => setModal(false)}>
          <FGrid cols={2}>
            <Fld label="WO Number"><input style={inp} value={form.wo_number} onChange={e => sf("wo_number", e.target.value)} placeholder="Auto-generated if blank" /></Fld>
            <Fld label="Product Name" req><input style={inp} value={form.product_name} onChange={e => sf("product_name", e.target.value)} /></Fld>
            <Fld label="Quantity" req><input type="number" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Unit"><select style={sel} value={form.unit} onChange={e => sf("unit", e.target.value)}>{["pcs","kg","mtrs","ltrs","boxes"].map(u => <option key={u}>{u}</option>)}</select></Fld>
            <Fld label="Start Date"><input type="date" style={inp} value={form.start_date} onChange={e => sf("start_date", e.target.value)} /></Fld>
            <Fld label="End Date"><input type="date" style={inp} value={form.end_date} onChange={e => sf("end_date", e.target.value)} /></Fld>
            <Fld label="Priority"><select style={sel} value={form.priority} onChange={e => sf("priority", e.target.value)}>{["low","medium","high"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["planned","in_progress","completed","on_hold"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Assigned Team"><input style={inp} value={form.assigned_team} onChange={e => sf("assigned_team", e.target.value)} placeholder="Team Alpha" /></Fld>
            <Fld label="Progress (%)"><input type="number" style={inp} value={form.progress} onChange={e => sf("progress", Math.min(100, Math.max(0, +e.target.value)))} min={0} max={100} /></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </FGrid>
          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Create Work Order"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 4 — PRODUCTION
// ══════════════════════════════════════════════════════════════════
function ProductionTab({ show }) {
  const [recs, setRecs] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 10;

  const today = new Date().toISOString().split("T")[0];
  const blank = { ref_no: "", location: "", product: "", quantity: "", total_cost: "", date: today, recipe_used: "", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetch = useCallback(async () => { setLoad(true); try { setRecs(await api("/production")); } catch (e) { show(e.message, "error"); } finally { setLoad(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = recs.filter(r => `${r.ref_no} ${r.product} ${r.location}`.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ ref_no: r.ref_no, location: r.location || "", product: r.product, quantity: r.quantity, total_cost: r.total_cost || "", date: r.date || today, recipe_used: r.recipe_used || "", notes: r.notes || "" }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.product || !form.quantity) { show("Product and quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/production/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRecs(p => p.map(x => x.id === edit.id ? d : x)); show("Production record updated."); }
      else       { const d = await api("/production", { method: "POST", body: JSON.stringify(form) }); setRecs(p => [d, ...p]); show("Production record saved."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm(`Delete "${r.ref_no}"?`)) return;
    try { await api(`/production/${r.id}`, { method: "DELETE" }); setRecs(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "date",        label: "Date",     r: v => <span style={{ fontSize: 12, color: G.n500 }}>{v}</span> },
    { k: "ref_no",      label: "Ref No",   r: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: G.green, fontSize: 12 }}>{v}</span> },
    { k: "location",    label: "Location", r: v => <span style={{ fontSize: 12 }}>{v || "—"}</span> },
    { k: "product",     label: "Product",  r: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { k: "quantity",    label: "Qty",      r: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { k: "total_cost",  label: "Cost",     r: v => v ? <span style={{ fontWeight: 600, color: G.green }}>₹{Number(v).toLocaleString()}</span> : "—" },
    { k: "recipe_used", label: "Recipe",   r: v => <span style={{ fontSize: 12, color: G.n500 }}>{v || "—"}</span> },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <KCard icon="🏭" label="Total Productions" value={recs.length} />
        <KCard icon="📦" label="Total Qty Produced" value={recs.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0)} accent={G.blue} />
        <KCard icon="💰" label="Total Production Cost" value={recs.reduce((s, r) => s + (parseFloat(r.total_cost) || 0), 0) > 0 ? `₹${recs.reduce((s, r) => s + (parseFloat(r.total_cost) || 0), 0).toLocaleString("en-IN")}` : "₹0"} accent={G.amber} />
      </div>
      <Card>
        <SBar search={search} setSearch={setSearch}>
          <button style={btnPri} onClick={openAdd}>+ Add Production</button>
        </SBar>
        <Tbl cols={COLS} rows={paged} loading={load} onEdit={openEdit} onDelete={del} />
        <PgBar total={filtered.length} page={page} perPage={PER} onPage={setPage} />
      </Card>

      {modal && (
        <Mdl title={edit ? "Edit Production" : "Add Production Record"} onClose={() => setModal(false)}>
          <FGrid cols={2}>
            <Fld label="Reference No"><input style={inp} value={form.ref_no} onChange={e => sf("ref_no", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Date"><input type="date" style={inp} value={form.date} onChange={e => sf("date", e.target.value)} /></Fld>
            <Fld label="Product" req><input style={inp} value={form.product} onChange={e => sf("product", e.target.value)} /></Fld>
            <Fld label="Quantity" req><input type="number" style={inp} value={form.quantity} onChange={e => sf("quantity", e.target.value)} min={0} /></Fld>
            <Fld label="Location"><input style={inp} value={form.location} onChange={e => sf("location", e.target.value)} placeholder="Unit A - Chennai" /></Fld>
            <Fld label="Total Cost (₹)"><input type="number" style={inp} value={form.total_cost} onChange={e => sf("total_cost", e.target.value)} min={0} /></Fld>
            <Fld label="Recipe / BOM Used"><input style={inp} value={form.recipe_used} onChange={e => sf("recipe_used", e.target.value)} placeholder="IVA3-001" /></Fld>
            <Fld label="Notes"><textarea style={{ ...ta, minHeight: 50 }} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </FGrid>
          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Save Production"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 5 — RESOURCES
// ══════════════════════════════════════════════════════════════════
function ResourcesTab({ show }) {
  const [res, setRes] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = { name: "", type: "Machine", capacity: "", shift: "Morning", operator: "", status: "idle", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetch = useCallback(async () => { setLoad(true); try { setRes(await api("/resources")); } catch (e) { show(e.message, "error"); } finally { setLoad(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = res.filter(r => `${r.name} ${r.type} ${r.operator}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ name: r.name, type: r.type, capacity: r.capacity || "", shift: r.shift, operator: r.operator || "", status: r.status, notes: r.notes || "" }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.name) { show("Resource name required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/resources/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRes(p => p.map(x => x.id === edit.id ? d : x)); show("Resource updated."); }
      else       { const d = await api("/resources", { method: "POST", body: JSON.stringify(form) }); setRes(p => [...p, d]); show("Resource added."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm(`Delete "${r.name}"?`)) return;
    try { await api(`/resources/${r.id}`, { method: "DELETE" }); setRes(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const quickStatus = async (r, status) => {
    try { const d = await api(`/resources/${r.id}`, { method: "PUT", body: JSON.stringify({ ...r, status }) }); setRes(p => p.map(x => x.id === r.id ? d : x)); }
    catch (e) { show(e.message, "error"); }
  };

  const stc = { running: G.green, idle: G.amber, maintenance: G.red };

  if (load) return <div style={{ textAlign: "center", padding: 40, color: G.n400 }}>⏳ Loading…</div>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <KCard icon="🏗️" label="Total"       value={res.length} />
        <KCard icon="▶️" label="Running"     value={res.filter(r => r.status === "running").length}     accent={G.green} />
        <KCard icon="⏸️" label="Idle"        value={res.filter(r => r.status === "idle").length}        accent={G.amber} />
        <KCard icon="🔧" label="Maintenance" value={res.filter(r => r.status === "maintenance").length} accent={G.red} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: G.n400 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…" style={{ ...inp, paddingLeft: 28, width: 220 }} />
        </div>
        <button style={btnPri} onClick={openAdd}>+ Add Resource</button>
      </div>

      {filtered.length === 0
        ? <Card><div style={{ textAlign: "center", padding: "40px 0", color: G.n400 }}>📭 No resources found.</div></Card>
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background: G.white, borderRadius: 12, border: `1px solid ${G.n200}`, boxShadow: G.sh, overflow: "hidden" }}>
                <div style={{ height: 4, background: stc[r.status] || G.n300 }} />
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: G.n900 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: G.n500, marginTop: 2 }}>{r.type}</div>
                    </div>
                    <Chip status={r.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {[["Capacity", `${r.capacity || "—"} u/day`], ["Shift", r.shift || "—"], ["Operator", r.operator || "Unassigned"]].map(([l, v]) => (
                      <div key={l} style={{ background: G.n50, borderRadius: 6, padding: "6px 10px" }}>
                        <div style={{ fontSize: 10, color: G.n400, fontWeight: 600, marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: G.n700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...btnEdit, flex: 1, justifyContent: "center" }} onClick={() => openEdit(r)}>✏️ Edit</button>
                    <select value={r.status} onChange={e => quickStatus(r, e.target.value)} style={{ ...sel, flex: 1, fontSize: 11, padding: "4px 8px" }}>
                      {["running", "idle", "maintenance"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <button style={btnDel} onClick={() => del(r)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {modal && (
        <Mdl title={edit ? "Edit Resource" : "Add Resource"} onClose={() => setModal(false)}>
          <FGrid cols={2}>
            <Fld label="Resource Name" req span><input style={inp} value={form.name} onChange={e => sf("name", e.target.value)} placeholder="CNC Machine #1" /></Fld>
            <Fld label="Type"><select style={sel} value={form.type} onChange={e => sf("type", e.target.value)}>{["Machine","Line","Station","Vehicle","Tool"].map(t => <option key={t}>{t}</option>)}</select></Fld>
            <Fld label="Capacity (u/day)"><input type="number" style={inp} value={form.capacity} onChange={e => sf("capacity", e.target.value)} min={0} /></Fld>
            <Fld label="Shift"><select style={sel} value={form.shift} onChange={e => sf("shift", e.target.value)}>{["Morning","Evening","Night","Full Day"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Operator / Team"><input style={inp} value={form.operator} onChange={e => sf("operator", e.target.value)} placeholder="Rajan Kumar" /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["running","idle","maintenance"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </FGrid>
          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Add Resource"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 6 — MACHINES
// ══════════════════════════════════════════════════════════════════
function MachinesTab({ show }) {
  const [machines, setMachines] = useState([]);
  const [load, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 10;

  const blank = { name: "", machine_code: "", type: "", location: "", manufacturer: "", model: "", purchase_date: "", status: "active", last_maintenance: "", next_maintenance: "", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetch = useCallback(async () => { setLoad(true); try { setMachines(await api("/machines")); } catch (e) { show(e.message, "error"); } finally { setLoad(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = machines.filter(m => `${m.name} ${m.machine_code} ${m.type} ${m.location}`.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ name: r.name, machine_code: r.machine_code || "", type: r.type || "", location: r.location || "", manufacturer: r.manufacturer || "", model: r.model || "", purchase_date: r.purchase_date || "", status: r.status, last_maintenance: r.last_maintenance || "", next_maintenance: r.next_maintenance || "", notes: r.notes || "" }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.name) { show("Machine name required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/machines/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setMachines(p => p.map(x => x.id === edit.id ? d : x)); show("Machine updated."); }
      else       { const d = await api("/machines", { method: "POST", body: JSON.stringify(form) }); setMachines(p => [d, ...p]); show("Machine added."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm(`Delete "${r.name}"?`)) return;
    try { await api(`/machines/${r.id}`, { method: "DELETE" }); setMachines(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "machine_code",     label: "Code",         r: v => <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: G.green, background: G.g50, padding: "2px 6px", borderRadius: 4 }}>{v || "—"}</span> },
    { k: "name",             label: "Machine",      r: (v, r) => <div><div style={{ fontWeight: 700 }}>{v}</div><div style={{ fontSize: 11, color: G.n400 }}>{r.manufacturer} {r.model}</div></div> },
    { k: "type",             label: "Type" },
    { k: "location",         label: "Location",     r: v => <span style={{ fontSize: 12 }}>{v || "—"}</span> },
    { k: "last_maintenance", label: "Last Maint.",  r: v => <span style={{ fontSize: 12, color: G.n500 }}>{v || "—"}</span> },
    { k: "next_maintenance", label: "Next Maint.",  r: v => <span style={{ fontSize: 12, fontWeight: 600, color: G.n700 }}>{v || "—"}</span> },
    { k: "status",           label: "Status",       r: v => <Chip status={v} /> },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <KCard icon="🔩" label="Total Machines"   value={machines.length} />
        <KCard icon="✅" label="Active"            value={machines.filter(m => m.status === "active").length}      accent={G.green} />
        <KCard icon="🔧" label="In Maintenance"   value={machines.filter(m => m.status === "maintenance").length} accent={G.red} />
      </div>
      <Card>
        <SBar search={search} setSearch={setSearch}>
          <button style={btnPri} onClick={openAdd}>+ Add Machine</button>
        </SBar>
        <Tbl cols={COLS} rows={paged} loading={load} onEdit={openEdit} onDelete={del} />
        <PgBar total={filtered.length} page={page} perPage={PER} onPage={setPage} />
      </Card>

      {modal && (
        <Mdl title={edit ? "Edit Machine" : "Add Machine"} onClose={() => setModal(false)}>
          <FGrid cols={2}>
            <Fld label="Machine Name" req><input style={inp} value={form.name} onChange={e => sf("name", e.target.value)} /></Fld>
            <Fld label="Machine Code"><input style={inp} value={form.machine_code} onChange={e => sf("machine_code", e.target.value)} placeholder="MCH-001" /></Fld>
            <Fld label="Type"><input style={inp} value={form.type} onChange={e => sf("type", e.target.value)} placeholder="CNC, Lathe, Press…" /></Fld>
            <Fld label="Location"><input style={inp} value={form.location} onChange={e => sf("location", e.target.value)} placeholder="Bay A" /></Fld>
            <Fld label="Manufacturer"><input style={inp} value={form.manufacturer} onChange={e => sf("manufacturer", e.target.value)} /></Fld>
            <Fld label="Model"><input style={inp} value={form.model} onChange={e => sf("model", e.target.value)} /></Fld>
            <Fld label="Purchase Date"><input type="date" style={inp} value={form.purchase_date} onChange={e => sf("purchase_date", e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["active","inactive","maintenance"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Last Maintenance"><input type="date" style={inp} value={form.last_maintenance} onChange={e => sf("last_maintenance", e.target.value)} /></Fld>
            <Fld label="Next Maintenance"><input type="date" style={inp} value={form.next_maintenance} onChange={e => sf("next_maintenance", e.target.value)} /></Fld>
            <Fld label="Notes" span><textarea style={ta} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </FGrid>
          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Add Machine"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 7 — SCHEDULE (Gantt from work orders)
// ══════════════════════════════════════════════════════════════════
function ScheduleTab({ show }) {
  const [orders, setOrders] = useState([]);
  const [load, setLoad]     = useState(true);
  const [month, setMonth]   = useState(() => new Date().toISOString().slice(0, 7));

  const fetch = useCallback(async () => { setLoad(true); try { setOrders(await api("/work-orders")); } catch (e) { show(e.message, "error"); } finally { setLoad(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const [yr, mo] = month.split("-").map(Number);
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayDay = new Date().getDate();
  const isCurMo  = month === new Date().toISOString().slice(0, 7);

  const inMonth = orders.filter(o => o.start_date && o.end_date && o.start_date.slice(0, 7) <= month && o.end_date.slice(0, 7) >= month);

  if (load) return <div style={{ textAlign: "center", padding: 40, color: G.n400 }}>⏳ Loading schedule…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: G.n900 }}>📅 Production Schedule — Gantt View</div>
          <div style={{ fontSize: 12, color: G.n500, marginTop: 2 }}>Derived from active work orders</div>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ ...inp, width: 180 }} />
      </div>

      {inMonth.length === 0
        ? <Card><div style={{ textAlign: "center", padding: "40px 0", color: G.n400 }}>📭 No work orders in this period.</div></Card>
        : (
          <Card>
            <div style={{ padding: "16px 20px", overflowX: "auto" }}>
              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                {[["planned", "Planned"], ["in_progress", "In Progress"], ["completed", "Completed"], ["on_hold", "On Hold"]].map(([s, l]) => {
                  const c = SC[s];
                  return <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.n600 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: c?.txt }} />{l}
                  </div>;
                })}
                {isCurMo && <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.green }}><div style={{ width: 2, height: 12, background: G.green }} />Today</div>}
              </div>

              <div style={{ minWidth: 760 }}>
                {/* Day header */}
                <div style={{ display: "flex", marginBottom: 8 }}>
                  <div style={{ width: 200, flexShrink: 0, fontSize: 11, fontWeight: 700, color: G.n400, textTransform: "uppercase", letterSpacing: .5 }}>Work Order</div>
                  <div style={{ flex: 1, display: "flex" }}>
                    {days.map(d => (
                      <div key={d} style={{ flex: 1, textAlign: "center", fontSize: isCurMo && d === todayDay ? 11 : 0, fontWeight: 800, color: G.green }}>
                        {(isCurMo && d === todayDay) || d % 5 === 0 || d === 1 ? d : ""}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rows */}
                {inMonth.map(o => {
                  const cfg = SC[o.status] || {};
                  const sD  = Math.max(1, parseInt(o.start_date?.slice(-2)));
                  const eD  = Math.min(daysInMonth, parseInt(o.end_date?.slice(-2)));
                  const left  = `${(sD - 1) / daysInMonth * 100}%`;
                  const width = `${Math.max((eD - sD + 1) / daysInMonth * 100, 1.5)}%`;
                  return (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 200, flexShrink: 0, paddingRight: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: G.green }}>{o.wo_number}</div>
                        <div style={{ fontSize: 11, color: G.n500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 186 }}>{o.product_name}</div>
                      </div>
                      <div style={{ flex: 1, position: "relative", height: 28, background: G.n100, borderRadius: 5 }}>
                        {isCurMo && <div style={{ position: "absolute", left: `${(todayDay - 1) / daysInMonth * 100}%`, top: -2, bottom: -2, width: 2, background: G.green, zIndex: 2, borderRadius: 1 }} />}
                        <div style={{ position: "absolute", height: "100%", left, width, background: cfg.txt || G.green, borderRadius: 5, opacity: .85, display: "flex", alignItems: "center", overflow: "hidden" }}>
                          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${o.progress || 0}%`, background: "rgba(0,0,0,.18)", borderRadius: 5 }} />
                          <span style={{ fontSize: 10, color: G.white, fontWeight: 700, position: "relative", zIndex: 1, paddingLeft: 6, whiteSpace: "nowrap" }}>{o.progress || 0}%</span>
                        </div>
                      </div>
                      <div style={{ width: 80, textAlign: "right", paddingLeft: 10, flexShrink: 0 }}>
                        <Chip status={o.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 8 — QUALITY CONTROL
// ══════════════════════════════════════════════════════════════════
function QCTab({ show }) {
  const [checks, setChecks] = useState([]);
  const [load, setLoad]     = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [fStatus, setFS]    = useState("");
  const [modal, setModal]   = useState(false);
  const [edit, setEdit]     = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 10;

  const today = new Date().toISOString().split("T")[0];
  const blank = { ref_no: "", product: "", batch_no: "", inspected_by: "", inspection_date: today, quantity_checked: "", quantity_passed: "", quantity_failed: "", status: "pending", remarks: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetch = useCallback(async () => { setLoad(true); try { setChecks(await api("/quality-checks")); } catch (e) { show(e.message, "error"); } finally { setLoad(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = checks.filter(c =>
    (!fStatus || c.status === fStatus) &&
    `${c.ref_no} ${c.product} ${c.batch_no}`.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ ref_no: r.ref_no, product: r.product, batch_no: r.batch_no || "", inspected_by: r.inspected_by || "", inspection_date: r.inspection_date, quantity_checked: r.quantity_checked, quantity_passed: r.quantity_passed, quantity_failed: r.quantity_failed, status: r.status, remarks: r.remarks || "" }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.product || !form.quantity_checked) { show("Product and quantity required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/quality-checks/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setChecks(p => p.map(x => x.id === edit.id ? d : x)); show("QC record updated."); }
      else       { const d = await api("/quality-checks", { method: "POST", body: JSON.stringify(form) }); setChecks(p => [d, ...p]); show("QC record saved."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm("Delete this QC record?")) return;
    try { await api(`/quality-checks/${r.id}`, { method: "DELETE" }); setChecks(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const passRate = checks.length
    ? Math.round(checks.reduce((s, c) => s + (parseInt(c.quantity_passed) || 0), 0) / Math.max(checks.reduce((s, c) => s + (parseInt(c.quantity_checked) || 0), 0), 1) * 100)
    : 0;

  const COLS = [
    { k: "inspection_date", label: "Date",     r: v => <span style={{ fontSize: 12, color: G.n500 }}>{v}</span> },
    { k: "ref_no",          label: "Ref No",   r: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: G.green, fontSize: 12 }}>{v}</span> },
    { k: "product",         label: "Product",  r: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { k: "batch_no",        label: "Batch",    r: v => <span style={{ fontSize: 12 }}>{v || "—"}</span> },
    { k: "quantity_checked",label: "Checked",  r: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { k: "quantity_passed", label: "Passed",   r: v => <span style={{ color: G.green, fontWeight: 700 }}>{v}</span> },
    { k: "quantity_failed", label: "Failed",   r: v => <span style={{ color: v > 0 ? G.red : G.n400, fontWeight: 700 }}>{v}</span> },
    { k: "inspected_by",    label: "Inspector",r: v => <span style={{ fontSize: 12 }}>{v || "—"}</span> },
    { k: "status",          label: "Status",   r: v => <Chip status={v} /> },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <KCard icon="🔬" label="Total Checks" value={checks.length} />
        <KCard icon="✅" label="Passed"        value={checks.filter(c => c.status === "passed").length}  accent={G.green} sub={`${passRate}% pass rate`} />
        <KCard icon="❌" label="Failed"         value={checks.filter(c => c.status === "failed").length}  accent={G.red} />
        <KCard icon="⏳" label="Pending"       value={checks.filter(c => c.status === "pending").length} accent={G.amber} />
      </div>
      <Card>
        <SBar search={search} setSearch={setSearch}>
          <select value={fStatus} onChange={e => { setFS(e.target.value); setPage(1); }} style={{ ...sel, width: 150 }}>
            <option value="">All Status</option>
            {["pending", "passed", "failed"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button style={btnPri} onClick={openAdd}>+ Add QC Check</button>
        </SBar>
        <Tbl cols={COLS} rows={paged} loading={load} onEdit={openEdit} onDelete={del} />
        <PgBar total={filtered.length} page={page} perPage={PER} onPage={setPage} />
      </Card>

      {modal && (
        <Mdl title={edit ? "Edit QC Record" : "New Quality Check"} subtitle="Record inspection results" onClose={() => setModal(false)}>
          <FGrid cols={2}>
            <Fld label="Reference No"><input style={inp} value={form.ref_no} onChange={e => sf("ref_no", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Inspection Date"><input type="date" style={inp} value={form.inspection_date} onChange={e => sf("inspection_date", e.target.value)} /></Fld>
            <Fld label="Product" req span><input style={inp} value={form.product} onChange={e => sf("product", e.target.value)} /></Fld>
            <Fld label="Batch No"><input style={inp} value={form.batch_no} onChange={e => sf("batch_no", e.target.value)} placeholder="BATCH-A3-001" /></Fld>
            <Fld label="Inspector"><input style={inp} value={form.inspected_by} onChange={e => sf("inspected_by", e.target.value)} placeholder="Dinesh Pillai" /></Fld>
            <Fld label="Qty Checked" req><input type="number" style={inp} value={form.quantity_checked} onChange={e => sf("quantity_checked", e.target.value)} min={0} /></Fld>
            <Fld label="Qty Passed"><input type="number" style={inp} value={form.quantity_passed} onChange={e => sf("quantity_passed", e.target.value)} min={0} /></Fld>
            <Fld label="Qty Failed"><input type="number" style={inp} value={form.quantity_failed} onChange={e => sf("quantity_failed", e.target.value)} min={0} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["pending","passed","failed"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Remarks" span><textarea style={ta} value={form.remarks} onChange={e => sf("remarks", e.target.value)} /></Fld>
          </FGrid>
          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Save QC Record"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 9 — MAINTENANCE
// ══════════════════════════════════════════════════════════════════
function MaintenanceTab({ show }) {
  const [recs, setRecs]   = useState([]);
  const [load, setLoad]   = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage]   = useState(1);
  const [fType, setFT]    = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit]   = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 10;

  const blank = { ref_no: "", machine_name: "", maintenance_type: "Preventive", technician: "", scheduled_date: "", completed_date: "", status: "scheduled", cost: "", description: "", notes: "" };
  const [form, setForm] = useState(blank);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetch = useCallback(async () => { setLoad(true); try { setRecs(await api("/maintenance")); } catch (e) { show(e.message, "error"); } finally { setLoad(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = recs.filter(r =>
    (!fType || r.maintenance_type === fType) &&
    `${r.ref_no} ${r.machine_name} ${r.technician}`.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const openAdd  = () => { setForm(blank); setEdit(null); setModal(true); };
  const openEdit = r => { setForm({ ref_no: r.ref_no, machine_name: r.machine_name, maintenance_type: r.maintenance_type, technician: r.technician || "", scheduled_date: r.scheduled_date || "", completed_date: r.completed_date || "", status: r.status, cost: r.cost || "", description: r.description || "", notes: r.notes || "" }); setEdit(r); setModal(true); };

  const save = async () => {
    if (!form.machine_name || !form.scheduled_date) { show("Machine name and scheduled date required.", "error"); return; }
    setSaving(true);
    try {
      if (edit) { const d = await api(`/maintenance/${edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setRecs(p => p.map(x => x.id === edit.id ? d : x)); show("Maintenance record updated."); }
      else       { const d = await api("/maintenance", { method: "POST", body: JSON.stringify(form) }); setRecs(p => [d, ...p]); show("Maintenance scheduled."); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async r => {
    if (!confirm("Delete this maintenance record?")) return;
    try { await api(`/maintenance/${r.id}`, { method: "DELETE" }); setRecs(p => p.filter(x => x.id !== r.id)); show("Deleted.", "info"); }
    catch (e) { show(e.message, "error"); }
  };

  const COLS = [
    { k: "ref_no",           label: "Ref No",   r: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: G.green, fontSize: 12 }}>{v}</span> },
    { k: "machine_name",     label: "Machine",  r: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { k: "maintenance_type", label: "Type",     r: v => <span style={{ fontSize: 12, color: G.n600 }}>{v}</span> },
    { k: "technician",       label: "Technician", r: v => <span style={{ fontSize: 12 }}>{v || "—"}</span> },
    { k: "scheduled_date",   label: "Scheduled",  r: v => <span style={{ fontSize: 12, color: G.n600 }}>{v || "—"}</span> },
    { k: "completed_date",   label: "Completed",  r: v => <span style={{ fontSize: 12, color: G.n500 }}>{v || "—"}</span> },
    { k: "cost",             label: "Cost",       r: v => v ? <span style={{ fontWeight: 600, color: G.amber }}>₹{Number(v).toLocaleString()}</span> : "—" },
    { k: "status",           label: "Status",     r: v => <Chip status={v} /> },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <KCard icon="🔧" label="Total"     value={recs.length} />
        <KCard icon="📅" label="Scheduled" value={recs.filter(r => r.status === "scheduled").length}     accent={G.blue} />
        <KCard icon="✅" label="Completed" value={recs.filter(r => r.status === "completed").length}     accent={G.green} />
        <KCard icon="⚠️" label="Overdue"  value={recs.filter(r => r.status === "overdue").length}       accent={G.red} />
      </div>
      <Card>
        <SBar search={search} setSearch={setSearch}>
          <select value={fType} onChange={e => { setFT(e.target.value); setPage(1); }} style={{ ...sel, width: 160 }}>
            <option value="">All Types</option>
            {["Preventive", "Corrective", "Predictive", "Emergency"].map(t => <option key={t}>{t}</option>)}
          </select>
          <button style={btnPri} onClick={openAdd}>+ Schedule Maintenance</button>
        </SBar>
        <Tbl cols={COLS} rows={paged} loading={load} onEdit={openEdit} onDelete={del} />
        <PgBar total={filtered.length} page={page} perPage={PER} onPage={setPage} />
      </Card>

      {modal && (
        <Mdl title={edit ? "Edit Maintenance" : "Schedule Maintenance"} onClose={() => setModal(false)}>
          <FGrid cols={2}>
            <Fld label="Ref No"><input style={inp} value={form.ref_no} onChange={e => sf("ref_no", e.target.value)} placeholder="Auto-generated" /></Fld>
            <Fld label="Machine Name" req><input style={inp} value={form.machine_name} onChange={e => sf("machine_name", e.target.value)} /></Fld>
            <Fld label="Type"><select style={sel} value={form.maintenance_type} onChange={e => sf("maintenance_type", e.target.value)}>{["Preventive","Corrective","Predictive","Emergency"].map(t => <option key={t}>{t}</option>)}</select></Fld>
            <Fld label="Technician"><input style={inp} value={form.technician} onChange={e => sf("technician", e.target.value)} placeholder="Arun Selvam" /></Fld>
            <Fld label="Scheduled Date" req><input type="date" style={inp} value={form.scheduled_date} onChange={e => sf("scheduled_date", e.target.value)} /></Fld>
            <Fld label="Completed Date"><input type="date" style={inp} value={form.completed_date} onChange={e => sf("completed_date", e.target.value)} /></Fld>
            <Fld label="Status"><select style={sel} value={form.status} onChange={e => sf("status", e.target.value)}>{["scheduled","in_progress","completed","overdue"].map(s => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Cost (₹)"><input type="number" style={inp} value={form.cost} onChange={e => sf("cost", e.target.value)} min={0} /></Fld>
            <Fld label="Description" span><textarea style={ta} value={form.description} onChange={e => sf("description", e.target.value)} placeholder="Describe the maintenance work…" /></Fld>
            <Fld label="Notes" span><textarea style={{ ...ta, minHeight: 48 }} value={form.notes} onChange={e => sf("notes", e.target.value)} /></Fld>
          </FGrid>
          <MdlFoot onClose={() => setModal(false)} onSave={save} saving={saving} saveLabel={edit ? "Save Changes" : "Schedule"} />
        </Mdl>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 10 — PRODUCTION REPORTS
// ══════════════════════════════════════════════════════════════════
function ReportsTab({ show }) {
  const [data, setData]   = useState(null);
  const [load, setLoad]   = useState(true);
  const [from, setFrom]   = useState(() => new Date(new Date().setDate(1)).toISOString().split("T")[0]);
  const [to, setTo]       = useState(() => new Date().toISOString().split("T")[0]);

  const fetch = useCallback(async () => {
    setLoad(true);
    try { setData(await api(`/reports/summary?from=${from}&to=${to}`)); }
    catch (e) { show(e.message, "error"); }
    finally { setLoad(false); }
  }, [from, to]);
  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div>
      {/* Date filter */}
      <div style={{ background: G.white, borderRadius: 12, border: `1px solid ${G.n200}`, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: G.sh }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: G.n600 }}>📅 Date Range</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inp, width: 160 }} />
        <span style={{ fontSize: 12, color: G.n400 }}>to</span>
        <input type="date" value={to}   onChange={e => setTo(e.target.value)}   style={{ ...inp, width: 160 }} />
        <button style={btnPri} onClick={fetch}>Apply</button>
      </div>

      {load
        ? <div style={{ textAlign: "center", padding: 48, color: G.n400 }}>⏳ Loading report…</div>
        : !data
        ? <div style={{ textAlign: "center", padding: 48, color: G.n400 }}>No data available.</div>
        : (
          <>
            {/* Summary KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
              <KCard icon="🏭" label="Total Productions"  value={data.total_productions} />
              <KCard icon="📦" label="Total Qty Produced"  value={data.total_quantity}    accent={G.blue} />
              <KCard icon="💰" label="Total Cost"          value={data.total_cost != null ? `₹${Number(data.total_cost).toLocaleString("en-IN")}` : "₹0"} accent={G.amber} />
              <KCard icon="✅" label="Work Orders Completed" value={data.completed_orders} accent={G.green} />
            </div>

            {/* Top products */}
            {data.top_products?.length > 0 && (
              <Card style={{ marginBottom: 20 }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.n100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: G.n900 }}>🏆 Top Products by Production Qty</div>
                  <span style={{ fontSize: 12, color: G.n500 }}>{from} → {to}</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ background: G.n50, borderBottom: `1px solid ${G.n200}` }}>
                    {["#","Product","Total Qty","Total Cost","Runs"].map(h => <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: G.n500, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {data.top_products.map((p, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${G.n100}` }}
                        onMouseEnter={e => e.currentTarget.style.background = G.g50}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "11px 16px", fontWeight: 700, color: G.green }}>#{i + 1}</td>
                        <td style={{ padding: "11px 16px", fontWeight: 600 }}>{p.product}</td>
                        <td style={{ padding: "11px 16px", fontWeight: 700 }}>{p.total_qty}</td>
                        <td style={{ padding: "11px 16px", color: G.amber, fontWeight: 600 }}>{p.total_cost != null ? `₹${Number(p.total_cost).toLocaleString("en-IN")}` : "—"}</td>
                        <td style={{ padding: "11px 16px" }}>{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* QC Summary */}
            {data.qc_summary && (
              <Card>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.n100}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: G.n900 }}>🔬 Quality Control Summary</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, padding: 18 }}>
                  <KCard icon="🔬" label="Total Inspected" value={data.qc_summary.total_checked} />
                  <KCard icon="✅" label="Passed"           value={data.qc_summary.total_passed}  accent={G.green}
                    sub={data.qc_summary.total_checked > 0 ? `${Math.round(data.qc_summary.total_passed / data.qc_summary.total_checked * 100)}% pass rate` : ""} />
                  <KCard icon="❌" label="Failed"            value={data.qc_summary.total_failed}  accent={G.red} />
                </div>
              </Card>
            )}
          </>
        )
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN Manufacturing Component
// ══════════════════════════════════════════════════════════════════
const TABS = [
  { key: "planning",    label: "Production Planning", icon: "📋" },
  { key: "bom",         label: "BOM",                 icon: "📐" },
  { key: "workorders",  label: "Work Orders",          icon: "⚙️" },
  { key: "production",  label: "Production",           icon: "🏭" },
  { key: "resources",   label: "Resources",            icon: "🏗️" },
  { key: "machines",    label: "Machines",             icon: "🔩" },
  { key: "schedule",    label: "Schedule",             icon: "📅" },
  { key: "qc",          label: "Quality Control",      icon: "🔬" },
  { key: "maintenance", label: "Maintenance",          icon: "🔧" },
  { key: "reports",     label: "Production Reports",   icon: "📊" },
];

export default function Manufacturing() {
  const [tab, setTab] = useState("planning");
  const { show, el }  = useToast();

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: G.n800 }}>
      {el}

      {/* ── Tab bar ───────────────────────────────────────────── */}
      <div style={{
        background: G.white,
        borderRadius: "12px 12px 0 0",
        boxShadow: G.sh,
        border: `1px solid ${G.n200}`,
        borderBottom: "none",
        overflowX: "auto",
        display: "flex",
        alignItems: "stretch",
      }}>
        {/* Module label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 20px", borderRight: `1px solid ${G.n200}`,
          flexShrink: 0, minWidth: 170,
        }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: G.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🏭</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: G.green, letterSpacing: -.3 }}>Manufacturing</span>
        </div>

        {/* Tabs */}
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "14px 16px",
              border: "none",
              borderBottom: active ? `3px solid ${G.green}` : "3px solid transparent",
              borderTop: "none",
              background: "transparent",
              color: active ? G.green : G.n500,
              fontWeight: active ? 700 : 400,
              cursor: "pointer",
              fontSize: 12,
              marginBottom: -1,
              transition: "all .15s",
              display: "flex", alignItems: "center", gap: 5,
              flexShrink: 0, whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = G.greenMid; e.currentTarget.style.background = G.g50; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = G.n500; e.currentTarget.style.background = "transparent"; } }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ───────────────────────────────────────── */}
      <div style={{
        background: "#f4f7f5",
        borderRadius: "0 0 12px 12px",
        border: `1px solid ${G.n200}`,
        borderTop: "none",
        padding: "24px 24px",
        minHeight: 500,
      }}>
        {tab === "planning"    && <PlanningTab    show={show} />}
        {tab === "bom"         && <BOMTab         show={show} />}
        {tab === "workorders"  && <WorkOrdersTab  show={show} />}
        {tab === "production"  && <ProductionTab  show={show} />}
        {tab === "resources"   && <ResourcesTab   show={show} />}
        {tab === "machines"    && <MachinesTab    show={show} />}
        {tab === "schedule"    && <ScheduleTab    show={show} />}
        {tab === "qc"          && <QCTab          show={show} />}
        {tab === "maintenance" && <MaintenanceTab show={show} />}
        {tab === "reports"     && <ReportsTab     show={show} />}
      </div>
    </div>
  );
}
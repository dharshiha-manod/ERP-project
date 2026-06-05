import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Font injection ───────────────────────────────────────────────────────────
if (!document.getElementById("sell-font")) {
  const l = document.createElement("link");
  l.id = "sell-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;0,6..12,800&display=swap";
  document.head.appendChild(l);
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const F = "'Nunito Sans','Segoe UI',sans-serif";
const GREEN_GRAD = "linear-gradient(135deg,#2e8b57 0%,#1a5c38 100%)";
const GREEN_HOV   = "linear-gradient(135deg,#369966 0%,#216945 100%)";

// ─── Base styles ──────────────────────────────────────────────────────────────
const selBase = {
  border: "1px solid #cdd3da", borderRadius: 5, padding: "7px 10px",
  fontSize: 13, fontFamily: "inherit", color: "#212529", background: "#fff", outline: "none",
};
const inputBase = { ...selBase, width: "100%", boxSizing: "border-box" };
const labelBase = { display: "block", fontSize: 13, fontWeight: 700, color: "#212529", marginBottom: 5 };

// ─── Green gradient button (all save/action buttons) ─────────────────────────
function GreenBtn({ children, onClick, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: hov ? GREEN_HOV : GREEN_GRAD,
        color: "#fff", border: "none", borderRadius: 8,
        padding: "9px 22px", fontWeight: 700, fontSize: 14,
        cursor: "pointer", fontFamily: "inherit",
        boxShadow: "0 3px 10px rgba(26,90,56,.28)",
        transition: "background .18s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Purple pill Add button ───────────────────────────────────────────────────
function AddBtn({ label = "Add", onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 22px",
        background: hov ? "#4338ca" : "#4f46e5",
        color: "#fff", border: "none", borderRadius: 50,
        fontWeight: 700, fontSize: 14, cursor: "pointer",
        boxShadow: "0 3px 10px rgba(79,70,229,.38)",
        fontFamily: "inherit", transition: "background .15s",
      }}
    >
      + {label}
    </button>
  );
}

// ─── Working export buttons ───────────────────────────────────────────────────
function ExportButtons({ columns, rows = [], filename = "export" }) {
  const [showCols, setShowCols] = useState(false);
  const [vis, setVis] = useState(() => Object.fromEntries(columns.map((c) => [c, true])));

  const visCols = columns.filter((c) => vis[c]);

  const toCSV = () => {
    const hdr = visCols.join(",");
    const body = rows.map((r) => visCols.map((c) => `"${r[c] ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([hdr + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = filename + ".csv"; a.click();
  };

  const toExcel = () => {
    let html = "<table><tr>" + visCols.map((c) => `<th>${c}</th>`).join("") + "</tr>";
    rows.forEach((r) => { html += "<tr>" + visCols.map((c) => `<td>${r[c] ?? ""}</td>`).join("") + "</tr>"; });
    html += "</table>";
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = filename + ".xls"; a.click();
  };

  const doPrint = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${filename}</title>
      <style>body{font-family:'Nunito Sans',sans-serif;font-size:13px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:7px 12px;text-align:left}th{background:#f0f0f0;font-weight:700}</style>
      </head><body><h2 style="font-family:'Nunito Sans',sans-serif">${filename}</h2><table>
      <tr>${visCols.map((c) => `<th>${c}</th>`).join("")}</tr>
      ${rows.map((r) => `<tr>${visCols.map((c) => `<td>${r[c] ?? ""}</td>`).join("")}</tr>`).join("")}
      </table></body></html>`);
    w.document.close(); w.print();
  };

  const bs = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 12px", border: "1px solid #cdd3da", borderRadius: 5,
    background: "#fff", fontSize: 12.5, color: "#495057", cursor: "pointer",
    fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", position: "relative" }}>
      <button style={bs} onClick={toCSV}>
        <span style={{ color: "#217346", fontWeight: 800, fontSize: 13 }}>⬇</span> Export CSV
      </button>
      <button style={bs} onClick={toExcel}>
        <span style={{ color: "#217346", fontWeight: 800, fontSize: 13 }}>⬇</span> Export Excel
      </button>
      <button style={bs} onClick={doPrint}>
        <span style={{ fontSize: 14 }}>🖨</span> Print
      </button>
      <div style={{ position: "relative" }}>
        <button style={bs} onClick={() => setShowCols((p) => !p)}>
          <span style={{ fontSize: 13 }}>☰</span> Column visibility
        </button>
        {showCols && (
          <div style={{
            position: "absolute", top: "110%", left: 0, background: "#fff",
            border: "1px solid #dee2e6", borderRadius: 7, padding: "10px 14px",
            zIndex: 9999, minWidth: 200, boxShadow: "0 6px 20px rgba(0,0,0,.13)",
          }}>
            {columns.map((c) => (
              <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={vis[c]} onChange={() => setVis((p) => ({ ...p, [c]: !p[c] }))} />
                {c}
              </label>
            ))}
          </div>
        )}
      </div>
      <button style={bs} onClick={doPrint}>
        <span style={{ color: "#c00", fontWeight: 800, fontSize: 13 }}>⬇</span> Export PDF ▾
      </button>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: "1px solid #dee2e6",
      boxShadow: "0 1px 5px rgba(0,0,0,.07)",
      marginBottom: 20, ...style,
    }}>
      {children}
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────
function DataTable({ columns, totalsRow, rows = [] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "inherit" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={{
                padding: "10px 13px", textAlign: "left", fontWeight: 700,
                fontSize: 12, color: "#495057", borderBottom: "2px solid #dee2e6",
                background: "#f8f9fa", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".3px",
              }}>
                {c}
                {["Date","Invoice No.","Customer name","Contact Number","Location","Reference No"].includes(c) && (
                  <span style={{ color: "#bbb", marginLeft: 4, fontSize: 10 }}>⇅</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "32px 0", color: "#6c757d", fontSize: 13 }}>
                No data available in table
              </td>
            </tr>
          ) : rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #f0f0f0" }}>
              {columns.map((c) => (
                <td key={c} style={{ padding: "10px 13px", fontSize: 13 }}>{row[c] ?? ""}</td>
              ))}
            </tr>
          ))}
          {totalsRow && (
            <tr style={{ background: "#e9ecef" }}>
              {totalsRow.map((cell, i) => (
                <td key={i} style={{ padding: "9px 13px", fontWeight: 700, fontSize: 13 }}>{cell}</td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ count = 0 }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 13, color: "#6c757d" }}>
      <span>Showing 0 to 0 of {count} entries</span>
      <div style={{ display: "flex", gap: 6 }}>
        {["Previous", "Next"].map((l) => (
          <button key={l} style={{ padding: "5px 14px", border: "1px solid #dee2e6", borderRadius: 5, background: "#fff", fontSize: 13, cursor: "pointer", color: "#495057", fontFamily: "inherit" }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function ShowEntries() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#495057" }}>
      Show
      <select defaultValue="25" style={{ ...selBase, padding: "5px 8px" }}>
        {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
      </select>
      entries
    </div>
  );
}

function Footer() {
  return (
    <p style={{ textAlign: "center", fontSize: 12, color: "#6c757d", marginTop: 16 }}>
      manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
    </p>
  );
}

function Page({ children }) {
  return <div style={{ fontFamily: F, color: "#212529", fontSize: 14 }}>{children}</div>;
}

function Section({ children }) {
  return <Card><div style={{ padding: 20 }}>{children}</div></Card>;
}

// ─── Filter helpers ───────────────────────────────────────────────────────────
function FilterField({ label, type = "select", options = ["All"], placeholder, checkLabel, inputType = "text" }) {
  if (type === "checkbox") return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={{ ...labelBase, visibility: "hidden" }}>_</label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginTop: 6 }}>
        <input type="checkbox" style={{ width: 15, height: 15, accentColor: "#1a7a4a" }} />
        {checkLabel || label}
      </label>
    </div>
  );
  if (type === "select") return (
    <div>
      <label style={labelBase}>{label}:</label>
      <div style={{ position: "relative" }}>
        <select style={{ ...selBase, width: "100%", appearance: "none", paddingRight: 28 }}>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#666", fontSize: 10 }}>▼</span>
      </div>
    </div>
  );
  return (
    <div>
      <label style={labelBase}>{label}:</label>
      <input type={inputType} placeholder={placeholder || label} style={inputBase} />
    </div>
  );
}

function FiltersCard({ fields, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: "12px 20px", background: "none", border: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 700, color: "#212529", fontFamily: "inherit",
          borderBottom: open ? "1px solid #f0f0f0" : "none",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters
        <svg style={{ marginLeft: "auto" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2.5">
          <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>
      {open && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
          gap: 14, padding: "16px 20px 20px",
        }}>
          {fields.map((f) => <FilterField key={f.label} {...f} />)}
        </div>
      )}
    </Card>
  );
}

// ─── SALE FORM (shared: Add Sale / Add Draft / Add Quotation) ─────────────────
function SaleForm({ title, mode, onSave, onSaveAndPrint }) {
  const isSale = mode === "sale";
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expName, setExpName] = useState(""); const [expAmt, setExpAmt] = useState("");

  const addExpense = () => {
    if (expName) { setExpenses((p) => [...p, { name: expName, amount: expAmt }]); setExpName(""); setExpAmt(""); setShowExpenseForm(false); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{title}</h2>

      {/* Location */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: "#6c757d" }}>📍</span>
        <select style={selBase}><option>Manodtechnologies (BL0001)</option></select>
        <span style={{ color: "#0d6efd", fontSize: 18, cursor: "pointer" }}>ℹ</span>
      </div>

      {/* ── Customer / Pay term / Date ── */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelBase}>Customer:*</label>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ color: "#6c757d", fontSize: 16 }}>👤</span>
              <select style={{ ...selBase, flex: 1 }}><option>Walk-In Customer</option></select>
              <button style={{ color: "#0d6efd", fontSize: 22, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>+</button>
            </div>
            <p style={{ fontSize: 12, color: "#6c757d", marginTop: 6 }}>Billing Address: Walk-In Customer</p>
            <p style={{ fontSize: 12, color: "#6c757d" }}>Shipping Address: Walk-In Customer,</p>
          </div>
          <div>
            <label style={labelBase}>Pay term: <span style={{ color: "#0d6efd", fontSize: 15 }}>ℹ</span></label>
            <div style={{ display: "flex", gap: 4 }}>
              <input placeholder="Pay term" style={{ ...inputBase, width: 90 }} />
              <select style={{ ...selBase, flex: 1 }}><option>Please Select</option><option>Days</option><option>Months</option></select>
            </div>
            {isSale && (<>
              <label style={{ ...labelBase, marginTop: 12 }}>Status:*</label>
              <select style={{ ...selBase, width: "100%" }}><option>Please Select</option><option>Final</option><option>Draft</option></select>
            </>)}
          </div>
          <div>
            <label style={labelBase}>Sale Date:*</label>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span>📅</span>
              <input defaultValue="06/04/2026 10:13" readOnly style={{ ...inputBase, flex: 1 }} />
            </div>
            <label style={{ ...labelBase, marginTop: 12 }}>Invoice scheme:</label>
            <select style={{ ...selBase, width: "100%" }}><option>Default</option></select>
            <label style={{ ...labelBase, marginTop: 12 }}>Invoice No.:</label>
            <input placeholder="Invoice No." style={inputBase} />
            <p style={{ fontSize: 11, color: "#6c757d", marginTop: 3 }}>Keep blank to auto generate</p>
            <label style={{ ...labelBase, marginTop: 12 }}>Attach Document:</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input readOnly style={{ ...inputBase, flex: 1 }} />
              <GreenBtn style={{ padding: "6px 12px", fontSize: 12, borderRadius: 5, boxShadow: "none" }}>📁 Browse…</GreenBtn>
            </div>
            <p style={{ fontSize: 11, color: "#6c757d", marginTop: 3 }}>Max File size: 5MB · .pdf .csv .zip .doc .docx .jpeg .jpg .png</p>
          </div>
        </div>
      </Section>

      {/* ── Products table ── */}
      <Section>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "inherit" }}>
            <thead>
              <tr>
                {["#","Product","Quantity","Unit Price","Discount","Subtotal","✕"].map((h) => (
                  <th key={h} style={{ padding: "10px 13px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #dee2e6", background: "#f8f9fa", color: "#495057", fontSize: 12, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={7}><div style={{ textAlign: "right", padding: "16px 13px", fontSize: 13, color: "#495057" }}>Items: 0.00 &nbsp;&nbsp; Total: 0.00</div></td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <span style={{ color: "#1a7a4a", fontSize: 18 }}>🔍</span>
          <input placeholder="Enter Product name / SKU / Scan bar code" style={{ ...inputBase, flex: 1 }} />
          <button style={{ background: GREEN_GRAD, color: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>+</button>
        </div>
      </Section>

      {/* ── Discount + Tax + Note ── */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelBase}>Discount Type:*</label>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ color: "#0d6efd" }}>ℹ</span>
                  <select style={{ ...selBase, flex: 1 }}><option>Please Select</option><option>Fixed</option><option>Percentage</option></select>
                </div>
              </div>
              <div>
                <label style={labelBase}>Discount Amount:*</label>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ color: "#0d6efd" }}>ℹ</span>
                  <input defaultValue="0.00" style={{ ...inputBase, flex: 1 }} />
                </div>
              </div>
            </div>
            <div>
              <label style={labelBase}>Order Tax:*</label>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ color: "#0d6efd" }}>ℹ</span>
                <select style={{ ...selBase, flex: 1 }}><option>Please Select</option><option>None</option></select>
              </div>
            </div>
            <div>
              <label style={labelBase}>Sell note</label>
              <textarea style={{ ...inputBase, minHeight: 72, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#495057", paddingTop: 28 }}>
            <p style={{ marginBottom: 10 }}>Discount Amount: (-) 0.00</p>
            <p>Order Tax: (+) 0.00</p>
          </div>
        </div>
      </Section>

      {/* ── Shipping ── */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelBase}>Shipping Details</label>
            <textarea placeholder="Shipping Details" style={{ ...inputBase, minHeight: 80, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelBase}>Shipping Address</label>
            <textarea placeholder="Shipping Address" style={{ ...inputBase, minHeight: 80, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelBase}>Shipping Charges</label>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ color: "#0d6efd" }}>ℹ</span>
              <input defaultValue="0.00" style={{ ...inputBase, flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={labelBase}>Shipping Status</label>
            <select style={{ ...selBase, width: "100%" }}>
              <option value="">Please Select</option>
              <option>Ordered</option><option>Packed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
            </select>
          </div>
          <div>
            <label style={labelBase}>Delivered To:</label>
            <input placeholder="Delivered To" style={inputBase} />
          </div>
          <div>
            <label style={labelBase}>Delivery Person:</label>
            <select style={{ ...selBase, width: "100%" }}>
              <option value="">Please Select</option>
              <option>Mrs Rekha Malar</option><option>Mr Leejin</option>
              <option>Ms Shalijah Stalin Rajakumar</option>
              <option>Er Sarath Raj</option><option>Ms Dharshiha C</option>
            </select>
          </div>
        </div>

        {/* Shipping Documents */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelBase}>Shipping Documents:</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input readOnly style={{ ...inputBase, maxWidth: 240 }} />
            <GreenBtn style={{ padding: "6px 14px", fontSize: 12, borderRadius: 5, boxShadow: "none" }}>📁 Browse..</GreenBtn>
          </div>
          <p style={{ fontSize: 11, color: "#6c757d", marginTop: 5 }}>Max File size: 5MB</p>
          <p style={{ fontSize: 11, color: "#6c757d" }}>Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</p>
        </div>

        {/* Add additional expenses — green gradient pill */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <button
            onClick={() => setShowExpenseForm((p) => !p)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: GREEN_GRAD,
              color: "#fff", border: "none", borderRadius: 50,
              padding: "10px 30px", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 3px 10px rgba(26,90,56,.28)",
            }}
          >
            + Add additional expenses <span style={{ fontSize: 16 }}>▾</span>
          </button>
        </div>

        {showExpenseForm && (
          <div style={{ background: "#f8fdf9", border: "1px solid #d1e7dd", borderRadius: 8, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
            <div>
              <label style={labelBase}>Expense Name:*</label>
              <input value={expName} onChange={(e) => setExpName(e.target.value)} placeholder="Expense name" style={inputBase} />
            </div>
            <div>
              <label style={labelBase}>Amount:</label>
              <input value={expAmt} onChange={(e) => setExpAmt(e.target.value)} placeholder="0.00" style={inputBase} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <GreenBtn onClick={addExpense} style={{ padding: "7px 18px", fontSize: 13 }}>Add</GreenBtn>
              <button onClick={() => setShowExpenseForm(false)} style={{ padding: "7px 14px", border: "1px solid #dee2e6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {expenses.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                <span>{e.name}</span><span>₹ {e.amount || "0.00"}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "right", fontWeight: 700, fontSize: 14, marginTop: 8 }}>
          Total Payable: 0.00
        </div>
      </Section>

      {/* ── Payment section (Add Sale only) ── */}
      {isSale && (
        <Section>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Add payment</h3>
          <p style={{ fontSize: 13, color: "#495057", marginBottom: 14 }}>Advance Balance: ₹ 0.00</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelBase}>Amount:*</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#6c757d" }}>💵</span>
                <input defaultValue="0.00" style={{ ...inputBase, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelBase}>Paid on:*</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span>📅</span>
                <input defaultValue="06/04/2026 10:13" readOnly style={{ ...inputBase, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelBase}>Payment Method:*</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#6c757d" }}>💵</span>
                <select style={{ ...selBase, flex: 1 }}><option>Cash</option><option>Card</option><option>Bank Transfer</option></select>
              </div>
            </div>
            <div>
              <label style={labelBase}>Payment note:</label>
              <textarea style={{ ...inputBase, minHeight: 72, resize: "vertical" }} />
            </div>
          </div>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #dee2e6" }} />
          <p style={{ fontSize: 13, fontWeight: 700 }}>Change Return:</p>
          <p style={{ fontSize: 20, fontWeight: 800 }}>₹ 0.00</p>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #dee2e6" }} />
          <p style={{ textAlign: "right", fontSize: 13, color: "#6c757d" }}>Balance: ₹ 0.00</p>
        </Section>
      )}

      {/* ── Action buttons ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "8px 0 28px" }}>
        <GreenBtn onClick={onSave}>
          <span style={{ fontSize: 15 }}>💾</span> Save
        </GreenBtn>
        <GreenBtn onClick={onSaveAndPrint}>
          <span style={{ fontSize: 15 }}>🖨</span> Save and print
        </GreenBtn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COLUMN DEFINITIONS
// ═══════════════════════════════════════════════════════════
const SALES_COLS = ["Action","Date","Invoice No.","Customer name","Contact Number","Location","Payment Status","Payment Method","Total amount","Total paid","Sell Due","Sell Return Due","Shipping Status","Total Items","Added By"];
const DRAFT_COLS = ["Action","Date","Reference No","Customer name","Contact Number","Location","Total Items","Added By"];
const QUOT_COLS  = ["Date","Reference No","Customer name","Contact Number","Location","Total Items","Added By","Action"];
const SR_COLS    = ["Date","Invoice No.","Parent Sale","Customer name","Location","Payment Status","Total amount","Payment due","Action"];
const SHIP_COLS  = ["Action","Date","Invoice No.","Customer name","Contact Number","Location","Delivery Person","Shipping Status","Payment Status"];
const DISC_COLS  = ["Name","Starts At","Ends At","Discount Amount","Priority","Brand","Category","Products","Location","Action"];

// ═══════════════════════════════════════════════════════════
// ALL SALES
// ═══════════════════════════════════════════════════════════
export function AllSales() {
  const navigate = useNavigate();
  return (
    <Page>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 22, fontWeight: 800 }}>Sales </span>
        <span style={{ fontSize: 13, color: "#6c757d" }}>05/06/2026 ~ 06/04/2026</span>
      </div>
      <FiltersCard fields={[
        { label: "Business Location", type: "select", options: ["All"] },
        { label: "Customer", type: "select", options: ["All"] },
        { label: "Payment Status", type: "select", options: ["All","Paid","Due","Partial"] },
        { label: "Date Range", type: "text", placeholder: "05/06/2026 - 06/04/2026" },
        { label: "User", type: "select", options: ["All"] },
        { label: "Shipping Status", type: "select", options: ["All","Ordered","Packed","Shipped","Delivered","Cancelled"] },
        { label: "Subscriptions", type: "checkbox", checkLabel: "Subscriptions" },
        { label: "Payment Method", type: "select", options: ["All","Cash","Card","Bank Transfer"] },
      ]} />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>All sales</span>
            <AddBtn label="Add" onClick={() => navigate("/sells/create")} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <ShowEntries />
            <ExportButtons columns={SALES_COLS} filename="all-sales" />
          </div>
          <DataTable columns={SALES_COLS} totalsRow={["Total:","","","","","","","","","₹ 0.00","₹ 0.00","₹ 0.00","","₹ 0.00",""]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// ADD SALE
// ═══════════════════════════════════════════════════════════
export function AddSale() {
  const navigate = useNavigate();
  return (
    <Page>
      <SaleForm title="Add Sale" mode="sale" onSave={() => navigate("/sells")} onSaveAndPrint={() => navigate("/sells")} />
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// LIST POS
// ═══════════════════════════════════════════════════════════
export function ListPOS() {
  const navigate = useNavigate();
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>POS</h2>
      <FiltersCard fields={[
        { label: "Business Location", type: "select", options: ["All"] },
        { label: "Customer", type: "select", options: ["All"] },
        { label: "Payment Status", type: "select", options: ["All","Paid","Due","Partial"] },
        { label: "Date Range", type: "text", placeholder: "05/06/2026 - 06/04/2026" },
        { label: "User", type: "select", options: ["All"] },
        { label: "Shipping Status", type: "select", options: ["All","Ordered","Packed","Shipped","Delivered","Cancelled"] },
        { label: "Subscriptions", type: "checkbox", checkLabel: "Subscriptions" },
        { label: "Payment Method", type: "select", options: ["All","Cash","Card","Bank Transfer"] },
      ]} />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>List POS</span>
            <AddBtn label="Add" onClick={() => navigate("/pos/create")} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <ShowEntries />
            <ExportButtons columns={SALES_COLS} filename="list-pos" />
          </div>
          <DataTable columns={SALES_COLS} totalsRow={["Total:","","","","","","","","₹ 0.00","₹ 0.00","₹ 0.00","₹ 0.00","","",""]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// POS CREATE (Open Cash Register)
// ═══════════════════════════════════════════════════════════
export function POSCreate() {
  const navigate = useNavigate();
  const [cash, setCash] = useState("");
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Open Cash Register</h2>
      <Card>
        <div style={{ padding: 40, maxWidth: 520 }}>
          <label style={labelBase}>Cash in hand:*</label>
          <input value={cash} onChange={(e) => setCash(e.target.value)} placeholder="Enter amount" style={{ ...inputBase, marginBottom: 20 }} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <GreenBtn onClick={() => navigate("/pos")}>Open Register</GreenBtn>
          </div>
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// ADD DRAFT
// ═══════════════════════════════════════════════════════════
export function AddDraft() {
  const navigate = useNavigate();
  return (
    <Page>
      <SaleForm title="Add Draft" mode="draft" onSave={() => navigate("/sells/drafts")} onSaveAndPrint={() => navigate("/sells/drafts")} />
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// LIST DRAFTS
// ═══════════════════════════════════════════════════════════
export function ListDrafts() {
  const navigate = useNavigate();
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>List Drafts</h2>
      <FiltersCard fields={[
        { label: "Business Location", type: "select", options: ["All"] },
        { label: "Customer", type: "select", options: ["All"] },
        { label: "Date Range", type: "text", placeholder: "05/06/2026 - 06/04/2026" },
        { label: "User", type: "select", options: ["All"] },
      ]} />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>List Drafts</span>
            <AddBtn label="Add Draft" onClick={() => navigate("/sells/add-draft")} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <ShowEntries />
            <ExportButtons columns={DRAFT_COLS} filename="list-drafts" />
          </div>
          <DataTable columns={DRAFT_COLS} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// ADD QUOTATION
// ═══════════════════════════════════════════════════════════
export function AddQuotation() {
  const navigate = useNavigate();
  return (
    <Page>
      <SaleForm title="Add Quotation" mode="quotation" onSave={() => navigate("/sells/quotations")} onSaveAndPrint={() => navigate("/sells/quotations")} />
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// LIST QUOTATIONS
// ═══════════════════════════════════════════════════════════
export function ListQuotations() {
  const navigate = useNavigate();
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>List quotations</h2>
      <FiltersCard fields={[
        { label: "Business Location", type: "select", options: ["All"] },
        { label: "Customer", type: "select", options: ["All"] },
        { label: "Date Range", type: "text", placeholder: "05/06/2026 - 06/04/2026" },
        { label: "User", type: "select", options: ["All"] },
      ]} />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>List quotations</span>
            <AddBtn label="Add Quotation" onClick={() => navigate("/sells/add-quotation")} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <ShowEntries />
            <ExportButtons columns={QUOT_COLS} filename="quotations" />
          </div>
          <DataTable columns={QUOT_COLS} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// SELL RETURN
// ═══════════════════════════════════════════════════════════
export function SellReturn() {
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Sell Return</h2>
      <FiltersCard fields={[
        { label: "Business Location", type: "select", options: ["All"] },
        { label: "Customer", type: "select", options: ["All"] },
        { label: "Payment Status", type: "select", options: ["All","Paid","Due","Partial"] },
        { label: "Date Range", type: "text", placeholder: "05/06/2026 - 06/04/2026" },
        { label: "User", type: "select", options: ["All"] },
      ]} />
      <Card>
        <div style={{ padding: 20 }}>
          <span style={{ fontWeight: 800, fontSize: 16, display: "block", marginBottom: 16 }}>Sell Return</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <ShowEntries />
            <ExportButtons columns={SR_COLS} filename="sell-return" />
          </div>
          <DataTable columns={SR_COLS} totalsRow={["Total:","","","","","","₹ 0.00","₹ 0.00",""]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// SHIPMENTS
// ═══════════════════════════════════════════════════════════
export function Shipments() {
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Shipments</h2>
      <FiltersCard fields={[
        { label: "Business Location", type: "select", options: ["All"] },
        { label: "Customer", type: "select", options: ["All"] },
        { label: "Shipping Status", type: "select", options: ["All","Ordered","Packed","Shipped","Delivered","Cancelled"] },
        { label: "Date Range", type: "text", placeholder: "05/06/2026 - 06/04/2026" },
        { label: "Delivery Person", type: "select", options: ["All","Mrs Rekha Malar","Mr Leejin","Ms Shalijah Stalin Rajakumar","Er Sarath Raj","Ms Dharshiha C"] },
      ]} />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <ShowEntries />
            <ExportButtons columns={SHIP_COLS} filename="shipments" />
          </div>
          <DataTable columns={SHIP_COLS} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// DISCOUNT MODAL
// ═══════════════════════════════════════════════════════════
function DiscountModal({ onClose }) {
  const [name, setName] = useState("");
  const [products, setProducts] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountAmt, setDiscountAmt] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priceGroup, setPriceGroup] = useState("All");
  const [isActive, setIsActive] = useState(true);
  const [applyGroups, setApplyGroups] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.48)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 10, width: 580, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,.22)", fontFamily: F }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #dee2e6" }}>
          <h3 style={{ fontWeight: 800, fontSize: 17, margin: 0 }}>Add Discount</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6c757d", lineHeight: 1 }}>×</button>
        </div>
        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelBase}>Name:*</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inputBase} />
          </div>
          <div>
            <label style={labelBase}>Products:</label>
            <input value={products} onChange={(e) => setProducts(e.target.value)} style={inputBase} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelBase}>Brand:</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ ...selBase, width: "100%" }}>
                <option value="">Please Select</option><option>Brand A</option><option>Brand B</option>
              </select>
            </div>
            <div>
              <label style={labelBase}>Category:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...selBase, width: "100%" }}>
                <option value="">Please Select</option><option>Category A</option>
              </select>
            </div>
            <div>
              <label style={labelBase}>Location:*</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ ...selBase, width: "100%" }}>
                <option value="">Please Select</option><option>Main Store</option><option>Warehouse A</option>
              </select>
            </div>
            <div>
              <label style={{ ...labelBase, display: "flex", alignItems: "center", gap: 5 }}>
                Priority: <span style={{ color: "#0d6efd", fontSize: 16 }}>ℹ</span>
              </label>
              <input value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="Priority" style={inputBase} />
            </div>
            <div>
              <label style={labelBase}>Discount Type:*</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ ...selBase, width: "100%" }}>
                <option value="">Please Select</option><option>Fixed</option><option>Percentage</option>
              </select>
            </div>
            <div>
              <label style={labelBase}>Discount Amount:*</label>
              <input value={discountAmt} onChange={(e) => setDiscountAmt(e.target.value)} placeholder="Discount Amount" style={inputBase} />
            </div>
            <div>
              <label style={labelBase}>Starts At:</label>
              <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts At" style={inputBase} />
            </div>
            <div>
              <label style={labelBase}>Ends At:</label>
              <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} placeholder="Ends At" style={inputBase} />
            </div>
          </div>
          <div>
            <label style={labelBase}>Selling Price Group:</label>
            <select value={priceGroup} onChange={(e) => setPriceGroup(e.target.value)} style={{ ...selBase, width: "50%" }}>
              <option>All</option><option>Retail</option><option>Wholesale</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={applyGroups} onChange={(e) => setApplyGroups(e.target.checked)} style={{ width: 16, height: 16 }} />
              Apply in customer groups
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#1a7a4a" }} />
              Is active
            </label>
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding: "14px 24px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #dee2e6" }}>
          <button onClick={onClose} style={{ padding: "8px 20px", border: "1px solid #dee2e6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            Cancel
          </button>
          <GreenBtn onClick={onClose}><span>💾</span> Save</GreenBtn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DISCOUNTS LIST
// ═══════════════════════════════════════════════════════════
export function Discounts() {
  const [showModal, setShowModal] = useState(false);
  return (
    <Page>
      {showModal && <DiscountModal onClose={() => setShowModal(false)} />}
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Discount</h2>
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <AddBtn label="Add" onClick={() => setShowModal(true)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <ShowEntries />
            <ExportButtons columns={DISC_COLS} filename="discounts" />
          </div>
          <DataTable columns={["☐", ...DISC_COLS]} />
          <div style={{ marginTop: 10 }}>
            <button style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 5, padding: "6px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Deactivate Selected
            </button>
          </div>
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// IMPORT SALES
// ═══════════════════════════════════════════════════════════
export function ImportSales() {
  const fields = [
    ["Invoice No.", ""],
    ["Customer name", ""],
    ["Customer Phone number", "Either customer email id or phone number required"],
    ["Customer Email", "Either customer email id or phone number required"],
    ["Sale Date", 'Sale date time format should be "Y-m-d H:i:s" (2020-07-15 17:45:32)'],
    ["Product Name", "Either product name (for single and combo only) or product sku required"],
    ["Product SKU", "Either product name (for single and combo only) or product sku required"],
    ["Quantity", "Required"],
    ["Product Unit", ""],
    ["Unit Price", ""],
    ["Item Tax", ""],
    ["Item Discount", ""],
    ["Item Description", ""],
    ["Order Total", ""],
  ];
  const tdStyle = { padding: "7px 13px", border: "1px solid #dee2e6", fontSize: 13 };
  const thStyle = { ...tdStyle, fontWeight: 700, background: "#f8f9fa" };

  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Import Sales</h2>
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <label style={labelBase}>File To Import:</label>
              <input type="file" accept=".xlsx,.xls,.csv" style={{ fontSize: 13, fontFamily: "inherit" }} />
            </div>
            <GreenBtn>Upload and review</GreenBtn>
          </div>
          <GreenBtn><span>⬇</span> Download template file</GreenBtn>
        </div>
      </Card>
      <Card>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Instructions</h3>
          <ol style={{ fontSize: 13, color: "#495057", paddingLeft: 20, lineHeight: 2.2 }}>
            <li>Upload sales data in excel format</li>
            <li>Choose business location and column by which sell lines will be grouped</li>
            <li>Choose respective sales fields for each column</li>
            <li style={{ marginTop: 6 }}>
              <strong>Importable fields</strong>
              <table style={{ marginTop: 8, width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={thStyle}>Importable fields</th><th style={thStyle}>Instructions</th></tr></thead>
                <tbody>
                  {fields.map(([f, i]) => (
                    <tr key={f}><td style={tdStyle}>{f}</td><td style={{ ...tdStyle, color: "#6c757d" }}>{i}</td></tr>
                  ))}
                </tbody>
              </table>
            </li>
          </ol>
        </div>
      </Card>
      <Card>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Imports</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["Import batch","Import time","Created By","Invoices","Action"].map((h) => (<th key={h} style={thStyle}>{h}</th>))}</tr>
            </thead>
            <tbody>
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#6c757d" }}>No imports yet</td></tr>
            </tbody>
          </table>
        </div>
      </Card>
      <Footer />
    </Page>
  );
}
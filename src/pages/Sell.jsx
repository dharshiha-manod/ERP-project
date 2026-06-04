import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Google Font injection (runs once) ───────────────────────────────────────
if (!document.getElementById("sell-nunitosans")) {
  const l = document.createElement("link");
  l.id = "sell-nunitosans";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const F = "'Nunito Sans', 'Segoe UI', sans-serif";

// Root wrapper — applies font to every descendant automatically
function Page({ children }) {
  return (
    <div style={{ fontFamily: F, color: "#212529", fontSize: 14 }}>
      {children}
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #dee2e6",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        marginBottom: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function FiltersAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "12px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: "#212529",
          fontFamily: "inherit",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters
        <svg style={{ marginLeft: "auto" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2">
          <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>
      {open && (
        <div
          style={{
            padding: "4px 16px 16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            gap: 12,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          {["Customer", "Location", "Payment Status", "Date Range"].map((f) => (
            <div key={f}>
              <label style={{ fontSize: 12, color: "#6c757d", display: "block", marginBottom: 4, fontWeight: 600 }}>
                {f}
              </label>
              <input
                placeholder={f}
                style={{
                  width: "100%",
                  border: "1px solid #dee2e6",
                  borderRadius: 4,
                  padding: "6px 10px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button style={btn("#1a7a4a")}>Search</button>
            <button style={btn("#6c757d", true)}>Reset</button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Button factory
function btn(bg, outline = false) {
  return {
    background: outline ? "#fff" : bg,
    color: outline ? "#495057" : "#fff",
    border: outline ? "1px solid #dee2e6" : "none",
    borderRadius: 4,
    padding: "7px 18px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function AddBtn({ label = "Add", onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 20px",
        background: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: 50,
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(79,70,229,.3)",
        fontFamily: "inherit",
      }}
    >
      + {label}
    </button>
  );
}

function TableToolbar() {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#495057" }}>
        Show
        <select defaultValue="25" style={selBase}>
          {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
        </select>
        entries
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" }}>
        {[
          { icon: "⬇", label: "Export CSV" },
          { icon: "⬇", label: "Export Excel" },
          { icon: "🖨", label: "Print" },
          { icon: "☰", label: "Column visibility" },
          { icon: "⬇", label: "Export PDF ▾" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "5px 10px", border: "1px solid #dee2e6", borderRadius: 4,
              background: "#fff", fontSize: 12, color: "#495057", cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 11 }}>{icon}</span> {label}
          </button>
        ))}
        <input
          placeholder="Search ..."
          style={{ ...selBase, width: 160, padding: "5px 10px" }}
        />
      </div>
    </div>
  );
}

const selBase = {
  border: "1px solid #dee2e6",
  borderRadius: 4,
  padding: "5px 8px",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#212529",
  background: "#fff",
};

const inputBase = {
  ...selBase,
  width: "100%",
  padding: "7px 10px",
  boxSizing: "border-box",
};

const labelBase = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#212529",
  marginBottom: 4,
};

function DataTable({ columns, totalsRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "inherit" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#495057",
                  borderBottom: "2px solid #dee2e6",
                  background: "#f8f9fa",
                  whiteSpace: "nowrap",
                }}
              >
                {c}
                {["Date", "Invoice No.", "Customer name", "Contact Number", "Location"].includes(c) && (
                  <span style={{ color: "#bbb", marginLeft: 3, fontSize: 10 }}>⇅</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              colSpan={columns.length}
              style={{ textAlign: "center", padding: "28px 0", color: "#6c757d", fontSize: 13 }}
            >
              No data available in table
            </td>
          </tr>
          {totalsRow && (
            <tr style={{ background: "#e9ecef" }}>
              {totalsRow.map((cell, i) => (
                <td key={i} style={{ padding: "8px 12px", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
                  {cell}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 13, color: "#6c757d" }}>
      <span>Showing 0 to 0 of 0 entries</span>
      <div style={{ display: "flex", gap: 6 }}>
        {["Previous", "Next"].map((l) => (
          <button key={l} style={{ padding: "4px 14px", border: "1px solid #dee2e6", borderRadius: 4, background: "#fff", fontSize: 13, cursor: "pointer", color: "#495057", fontFamily: "inherit" }}>
            {l}
          </button>
        ))}
      </div>
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

function Section({ children }) {
  return (
    <Card>
      <div style={{ padding: 20 }}>{children}</div>
    </Card>
  );
}

// ─── SALE FORM (shared by Add Sale / Add Draft / Add Quotation) ───────────────

function SaleForm({ title, mode, onSave, onSaveAndPrint }) {
  const isSale = mode === "sale";
  const [discountType, setDiscountType] = useState("Percentage");
  const [orderTax, setOrderTax] = useState("None");
  const [shippingStatus, setShippingStatus] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{title}</h2>

      {/* Location bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: "#6c757d" }}>📍</span>
        <select style={selBase}>
          <option>Manodtechnologies (BL0001)</option>
        </select>
        <span style={{ color: "#0d6efd", fontSize: 18, cursor: "pointer" }}>ℹ</span>
      </div>

      {/* ── Customer / Pay term / Date ── */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {/* Customer */}
          <div>
            <label style={labelBase}>Customer:*</label>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ color: "#6c757d" }}>👤</span>
              <select style={{ ...selBase, flex: 1 }}><option>Walk-In Customer</option></select>
              <button style={{ color: "#0d6efd", fontSize: 22, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>+</button>
            </div>
            <p style={{ fontSize: 12, color: "#6c757d", marginTop: 6 }}>Billing Address: Walk-In Customer</p>
            <p style={{ fontSize: 12, color: "#6c757d" }}>Shipping Address: Walk-In Customer,</p>
          </div>

          {/* Pay term + Status */}
          <div>
            <label style={labelBase}>Pay term: <span style={{ color: "#0d6efd", fontSize: 16 }}>ℹ</span></label>
            <div style={{ display: "flex", gap: 4 }}>
              <input placeholder="Pay term" style={{ ...inputBase, width: 90 }} />
              <select style={{ ...selBase, flex: 1 }}><option>Please Select</option><option>Days</option><option>Months</option></select>
            </div>
            {isSale && (
              <>
                <label style={{ ...labelBase, marginTop: 12 }}>Status:*</label>
                <select style={{ ...selBase, width: "100%" }}>
                  <option>Please Select</option><option>Final</option><option>Draft</option>
                </select>
              </>
            )}
          </div>

          {/* Sale date + scheme + invoice + attach */}
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
            {isSale && (
              <>
                <label style={{ ...labelBase, marginTop: 12 }}>Attach Document:</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input readOnly style={{ ...inputBase, flex: 1 }} />
                  <button style={{ background: "#1a7a4a", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    📁 Browse…
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#6c757d", marginTop: 3 }}>Max File size: 5MB · .pdf .csv .zip .doc .docx .jpeg .jpg .png</p>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* ── Products table ── */}
      <Section>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "inherit" }}>
            <thead>
              <tr>
                {["#", "Product", "Quantity", "Unit Price", "Discount", "Subtotal", "✕"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #dee2e6", background: "#f8f9fa", color: "#495057" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7}>
                  <div style={{ textAlign: "right", padding: "16px 12px", fontSize: 13, color: "#495057" }}>
                    Items: 0.00 &nbsp;&nbsp; Total: 0.00
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <span style={{ color: "#1a7a4a", fontSize: 18 }}>🔍</span>
          <input placeholder="Enter Product name / SKU / Scan bar code" style={{ ...inputBase, flex: 1 }} />
          <button style={{ background: "#1a7a4a", color: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
            +
          </button>
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
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ ...selBase, flex: 1 }}>
                    <option>Please Select</option><option>Fixed</option><option>Percentage</option>
                  </select>
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
                <select value={orderTax} onChange={(e) => setOrderTax(e.target.value)} style={{ ...selBase, flex: 1 }}>
                  <option>Please Select</option><option>None</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelBase}>Sell note</label>
              <textarea style={{ ...inputBase, minHeight: 72, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#495057", paddingTop: 30 }}>
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
            <textarea placeholder="Shipping Details" style={{ ...inputBase, minHeight: 72, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelBase}>Shipping Address</label>
            <textarea placeholder="Shipping Address" style={{ ...inputBase, minHeight: 72, resize: "vertical" }} />
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
            <select value={shippingStatus} onChange={(e) => setShippingStatus(e.target.value)} style={{ ...selBase, width: "100%" }}>
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
            <select value={deliveryPerson} onChange={(e) => setDeliveryPerson(e.target.value)} style={{ ...selBase, width: "100%" }}>
              <option value="">Please Select</option>
              <option>Mrs Rekha Malar</option><option>Mr Leejin</option>
              <option>Ms Shalijah Stalin Rajakumar</option>
              <option>Er Sarath Raj</option><option>Ms Dharshiha C</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelBase}>Shipping Documents:</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input readOnly style={{ ...inputBase, flex: 1 }} />
            <button style={{ background: "#1a7a4a", color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              📁 Browse…
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#6c757d", marginTop: 4 }}>
            Max File size: 5MB &nbsp;·&nbsp; Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png
          </p>
        </div>
        <div style={{ textAlign: "right", fontWeight: 600, fontSize: 13, marginTop: 16 }}>
          Total Payable: 0.00
        </div>
      </Section>

      {/* ── Payment (Add Sale only) ── */}
      {isSale && (
        <Section>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Add payment</h3>
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
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ ...selBase, flex: 1 }}>
                  <option>Cash</option><option>Card</option><option>Bank Transfer</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelBase}>Payment note:</label>
              <textarea style={{ ...inputBase, minHeight: 72, resize: "vertical" }} />
            </div>
          </div>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #dee2e6" }} />
          <p style={{ fontSize: 13, fontWeight: 600 }}>Change Return:</p>
          <p style={{ fontSize: 20, fontWeight: 800 }}>₹ 0.00</p>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #dee2e6" }} />
          <p style={{ textAlign: "right", fontSize: 13, color: "#6c757d" }}>Balance: ₹ 0.00</p>
        </Section>
      )}

      {/* ── Action buttons ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "8px 0 24px" }}>
        <button onClick={onSave} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6, padding: "10px 40px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          Save
        </button>
        <button onClick={onSaveAndPrint} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "10px 40px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          Save and print
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════

export function AllSales() {
  const navigate = useNavigate();
  return (
    <Page>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>Sales </span>
        <span style={{ fontSize: 13, color: "#6c757d" }}>05/06/2026 ~ 06/04/2026</span>
      </div>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>All sales</span>
            <AddBtn label="Add" onClick={() => navigate("/sells/create")} />
          </div>
          <TableToolbar />
          <DataTable
            columns={["Action","Date","Invoice No.","Customer name","Contact Number","Location","Payment Status","Payment Method","Total amount","Total paid","Sell Due","Sell Return Due","Shipping Status","Total Items","Added By"]}
            totalsRow={["Total:","","","","","","","","","₹ 0.00","₹ 0.00","₹ 0.00","","₹ 0.00",""]}
          />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

export function AddSale() {
  const navigate = useNavigate();
  return (
    <Page>
      <SaleForm title="Add Sale" mode="sale" onSave={() => navigate("/sells")} onSaveAndPrint={() => navigate("/sells")} />
      <Footer />
    </Page>
  );
}

export function ListPOS() {
  const navigate = useNavigate();
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>POS</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>List POS</span>
            <AddBtn label="Add" onClick={() => navigate("/pos/create")} />
          </div>
          <TableToolbar />
          <DataTable
            columns={["Action","Date","Invoice No.","Customer name","Contact Number","Location","Payment Status","Payment Method","Total amount","Total paid","Sell Due","Sell Return Due","Shipping Status","Total Items","Added By"]}
            totalsRow={["Total:","","","","","","","","₹ 0.00","₹ 0.00","₹ 0.00","₹ 0.00","","",""]}
          />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

export function POSCreate() {
  const navigate = useNavigate();
  const [cash, setCash] = useState("");
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Open Cash Register</h2>
      <Card>
        <div style={{ padding: 40, maxWidth: 520 }}>
          <label style={labelBase}>Cash in hand:*</label>
          <input value={cash} onChange={(e) => setCash(e.target.value)} placeholder="Enter amount" style={{ ...inputBase, marginBottom: 20 }} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => navigate("/pos")} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Open Register
            </button>
          </div>
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

export function AddDraft() {
  const navigate = useNavigate();
  return (
    <Page>
      <SaleForm title="Add Draft" mode="draft" onSave={() => navigate("/sells/drafts")} onSaveAndPrint={() => navigate("/sells/drafts")} />
      <Footer />
    </Page>
  );
}

export function ListDrafts() {
  const navigate = useNavigate();
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>List Drafts</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>List Drafts</span>
            <AddBtn label="Add Draft" onClick={() => navigate("/sells/add-draft")} />
          </div>
          <TableToolbar />
          <DataTable columns={["Action","Date","Reference No","Customer name","Contact Number","Location","Total Items","Added By"]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

export function AddQuotation() {
  const navigate = useNavigate();
  return (
    <Page>
      <SaleForm title="Add Quotation" mode="quotation" onSave={() => navigate("/sells/quotations")} onSaveAndPrint={() => navigate("/sells/quotations")} />
      <Footer />
    </Page>
  );
}

export function ListQuotations() {
  const navigate = useNavigate();
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>List quotations</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>List quotations</span>
            <AddBtn label="Add Quotation" onClick={() => navigate("/sells/add-quotation")} />
          </div>
          <TableToolbar />
          <DataTable columns={["Date","Reference No","Customer name","Contact Number","Location","Total Items","Added By","Action"]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

export function SellReturn() {
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Sell Return</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 15, display: "block", marginBottom: 14 }}>Sell Return</span>
          <TableToolbar />
          <DataTable
            columns={["Date","Invoice No.","Parent Sale","Customer name","Location","Payment Status","Total amount","Payment due","Action"]}
            totalsRow={["Total:","","","","","","₹ 0.00","₹ 0.00",""]}
          />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

export function Shipments() {
  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Shipments</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <TableToolbar />
          <DataTable columns={["Action","Date","Invoice No.","Customer name","Contact Number","Location","Delivery Person","Shipping Status","Payment Status"]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </Page>
  );
}

export function Discounts() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [amt, setAmt] = useState("");
  const [dtype, setDtype] = useState("Percentage");

  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Discount</h2>
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <AddBtn label="Add" onClick={() => setShowForm(!showForm)} />
          </div>
          {showForm && (
            <div style={{ background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 6, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
              {[
                { label: "Name:*", value: name, set: setName, type: "text" },
                { label: "Starts At:", value: starts, set: setStarts, type: "date" },
                { label: "Ends At:", value: ends, set: setEnds, type: "date" },
                { label: "Discount Amount:*", value: amt, set: setAmt, type: "number" },
              ].map(({ label, value, set, type }) => (
                <div key={label}>
                  <label style={labelBase}>{label}</label>
                  <input type={type} value={value} onChange={(e) => set(e.target.value)} style={inputBase} />
                </div>
              ))}
              <div>
                <label style={labelBase}>Discount Type:</label>
                <select value={dtype} onChange={(e) => setDtype(e.target.value)} style={{ ...selBase, width: "100%" }}>
                  <option>Percentage</option><option>Fixed</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <button onClick={() => setShowForm(false)} style={{ ...btn("#1a7a4a") }}>Save</button>
                <button onClick={() => setShowForm(false)} style={{ ...btn("#fff", true) }}>Cancel</button>
              </div>
            </div>
          )}
          <TableToolbar />
          <DataTable columns={["☐","Name","Starts At","Ends At","Discount Amount","Priority","Brand","Category","Products","Location","Action"]} />
          <div style={{ marginTop: 10 }}>
            <button style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 4, padding: "6px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
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

  const tdStyle = { padding: "7px 12px", border: "1px solid #dee2e6", fontSize: 13 };
  const thStyle = { ...tdStyle, fontWeight: 700, background: "#f8f9fa" };

  return (
    <Page>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Import Sales</h2>

      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <label style={labelBase}>File To Import:</label>
              <input type="file" accept=".xlsx,.xls,.csv" style={{ fontSize: 13, fontFamily: "inherit" }} />
            </div>
            <button style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Upload and review
            </button>
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            ⬇ Download template file
          </button>
        </div>
      </Card>

      <Card>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Instructions</h3>
          <ol style={{ fontSize: 13, color: "#495057", paddingLeft: 20, lineHeight: 2.2 }}>
            <li>Upload sales data in excel format</li>
            <li>Choose business location and column by which sell lines will be grouped</li>
            <li>Choose respective sales fields for each column</li>
            <li style={{ marginTop: 6 }}>
              <strong>Importable fields</strong>
              <table style={{ marginTop: 8, width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr><th style={thStyle}>Importable fields</th><th style={thStyle}>Instructions</th></tr>
                </thead>
                <tbody>
                  {fields.map(([f, i]) => (
                    <tr key={f}>
                      <td style={tdStyle}>{f}</td>
                      <td style={{ ...tdStyle, color: "#6c757d" }}>{i}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          </ol>
        </div>
      </Card>

      <Card>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Imports</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Import batch","Import time","Created By","Invoices","Action"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#6c757d" }}>
                  No imports yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <Footer />
    </Page>
  );
}
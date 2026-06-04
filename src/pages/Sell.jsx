import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════
//  DESIGN TOKENS  (match the live app exactly)
// ═══════════════════════════════════════════════════════════
// Primary green  : #1a7a4a  (sidebar active, labels)
// Accent purple  : #4f46e5  (Add buttons)
// Save green     : #16a34a
// Card bg        : #ffffff
// Page bg        : #f0f4f1
// Table head bg  : #f8f9fa
// Border         : #dee2e6
// Text dark      : #212529
// Text muted     : #6c757d

// ═══════════════════════════════════════════════════════════
//  SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════

function Card({ children, className = "" }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #dee2e6",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        marginBottom: 20,
      }}
      className={className}
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
        }}
      >
        <span style={{ color: "#1a7a4a", fontSize: 16 }}>⊟</span>
        Filters
        <span style={{ marginLeft: "auto", color: "#6c757d", fontSize: 12 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 16px 16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            gap: 12,
          }}
        >
          {["Customer", "Location", "Payment Status", "Date Range"].map((f) => (
            <div key={f}>
              <label style={{ fontSize: 12, color: "#6c757d", display: "block", marginBottom: 4 }}>
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
                }}
              />
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button
              style={{
                background: "#1a7a4a",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "7px 18px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Search
            </button>
            <button
              style={{
                background: "#fff",
                color: "#495057",
                border: "1px solid #dee2e6",
                borderRadius: 4,
                padding: "7px 14px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function TableToolbar({ searchPlaceholder = "Search ..." }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#495057" }}>
        Show
        <select
          defaultValue="25"
          style={{
            border: "1px solid #dee2e6",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 13,
          }}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        entries
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" }}>
        {[
          { icon: "📄", label: "Export CSV" },
          { icon: "📊", label: "Export Excel" },
          { icon: "🖨️", label: "Print" },
          { icon: "👁️", label: "Column visibility" },
          { icon: "📑", label: "Export PDF ▾" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              border: "1px solid #dee2e6",
              borderRadius: 4,
              background: "#fff",
              fontSize: 12,
              color: "#495057",
              cursor: "pointer",
            }}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
        <input
          placeholder={searchPlaceholder}
          style={{
            border: "1px solid #dee2e6",
            borderRadius: 4,
            padding: "5px 10px",
            fontSize: 13,
            width: 160,
          }}
        />
      </div>
    </div>
  );
}

function DataTable({ columns, totalsRow, children }) {
  const thStyle = {
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 13,
    color: "#495057",
    borderBottom: "2px solid #dee2e6",
    whiteSpace: "nowrap",
    background: "#f8f9fa",
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={thStyle}>
                {c}{" "}
                {["Date", "Invoice No.", "Customer name", "Contact Number", "Location"].includes(c) && (
                  <span style={{ color: "#aaa", fontSize: 10 }}>⇅</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: "28px 0", color: "#6c757d", fontSize: 13 }}
              >
                No data available in table
              </td>
            </tr>
          )}
          {totalsRow && (
            <tr style={{ background: "#e9ecef" }}>
              {totalsRow.map((cell, i) => (
                <td
                  key={i}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#212529",
                  }}
                >
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

function Pagination({ total = 0 }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        fontSize: 13,
        color: "#6c757d",
      }}
    >
      <span>Showing 0 to 0 of {total} entries</span>
      <div style={{ display: "flex", gap: 6 }}>
        {["Previous", "Next"].map((l) => (
          <button
            key={l}
            style={{
              padding: "4px 14px",
              border: "1px solid #dee2e6",
              borderRadius: 4,
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
              color: "#495057",
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddBtn({ label = "Add", onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 20px",
        background: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: 50,
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(79,70,229,.35)",
      }}
    >
      + {label}
    </button>
  );
}

function Footer() {
  return (
    <p style={{ textAlign: "center", fontSize: 12, color: "#6c757d", marginTop: 16 }}>
      manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
    </p>
  );
}

// ═══════════════════════════════════════════════════════════
//  SHARED SALE FORM
// ═══════════════════════════════════════════════════════════

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#212529",
  marginBottom: 4,
};

const inputStyle = {
  width: "100%",
  border: "1px solid #dee2e6",
  borderRadius: 4,
  padding: "7px 10px",
  fontSize: 13,
  color: "#212529",
  boxSizing: "border-box",
};

const selectStyle = { ...inputStyle };

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 72,
};

function FormSection({ children }) {
  return (
    <Card>
      <div style={{ padding: 20 }}>{children}</div>
    </Card>
  );
}

function SaleForm({ title, mode = "sale", onSave, onSaveAndPrint }) {
  const [discountType, setDiscountType] = useState("Percentage");
  const [orderTax, setOrderTax] = useState("None");
  const [shippingStatus, setShippingStatus] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const showStatusField = mode === "sale";
  const showPaymentSection = mode === "sale";

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>{title}</h2>

      {/* Location selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: "#6c757d" }}>📍</span>
        <select style={{ border: "1px solid #dee2e6", borderRadius: 4, padding: "6px 10px", fontSize: 13 }}>
          <option>Manodtechnologies (BL0001)</option>
        </select>
        <span style={{ color: "#0d6efd", cursor: "pointer" }}>ℹ️</span>
      </div>

      {/* ── Section 1: Customer / Pay term / Date ── */}
      <FormSection>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {/* Customer */}
          <div>
            <label style={labelStyle}>Customer:*</label>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ color: "#6c757d", alignSelf: "center" }}>👤</span>
              <select style={{ ...selectStyle, flex: 1 }}>
                <option>Walk-In Customer</option>
              </select>
              <button style={{ color: "#0d6efd", fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>+</button>
            </div>
            <p style={{ fontSize: 12, color: "#6c757d", marginTop: 4 }}>Billing Address: Walk-In Customer</p>
            <p style={{ fontSize: 12, color: "#6c757d" }}>Shipping Address: Walk-In Customer,</p>
          </div>

          {/* Pay term + Status */}
          <div>
            <label style={labelStyle}>Pay term:</label>
            <div style={{ display: "flex", gap: 4 }}>
              <input placeholder="Pay term" style={{ ...inputStyle, width: 80 }} />
              <select style={{ ...selectStyle, flex: 1 }}>
                <option>Please Select</option>
                <option>Days</option>
                <option>Months</option>
              </select>
            </div>
            {showStatusField && (
              <>
                <label style={{ ...labelStyle, marginTop: 12 }}>Status:*</label>
                <select style={selectStyle}>
                  <option>Please Select</option>
                  <option>Final</option>
                  <option>Draft</option>
                </select>
              </>
            )}
          </div>

          {/* Sale Date + Invoice scheme + Invoice No + Attach */}
          <div>
            <label style={labelStyle}>Sale Date:*</label>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span>📅</span>
              <input defaultValue="06/04/2026 10:13" style={{ ...inputStyle, flex: 1 }} readOnly />
            </div>
            <label style={{ ...labelStyle, marginTop: 10 }}>Invoice scheme:</label>
            <select style={selectStyle}>
              <option>Default</option>
            </select>
            <label style={{ ...labelStyle, marginTop: 10 }}>Invoice No.:</label>
            <input placeholder="Invoice No." style={inputStyle} />
            <p style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>Keep blank to auto generate</p>
            {showStatusField && (
              <>
                <label style={{ ...labelStyle, marginTop: 10 }}>Attach Document:</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input style={{ ...inputStyle, flex: 1 }} readOnly />
                  <button
                    style={{
                      background: "#1a7a4a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    📁 Browse…
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>
                  Max File size: 5MB · .pdf .csv .zip .doc .docx .jpeg .jpg .png
                </p>
              </>
            )}
          </div>
        </div>
      </FormSection>

      {/* ── Section 2: Products table ── */}
      <FormSection>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                {["#", "Product", "Quantity", "Unit Price", "Discount", "Subtotal", "✕"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                      color: "#495057",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} style={{ padding: "20px 0" }}>
                  <div style={{ textAlign: "right", fontSize: 13, color: "#495057", paddingRight: 12 }}>
                    Items: 0.00 &nbsp;&nbsp; Total: 0.00
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ color: "#6c757d" }}>🔍</span>
          <input
            placeholder="Enter Product name / SKU / Scan bar code"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            style={{
              background: "#1a7a4a",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
      </FormSection>

      {/* ── Section 3: Discount + Tax + Note ── */}
      <FormSection>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Discount Type:*</label>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ color: "#0d6efd", alignSelf: "center" }}>ℹ</span>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
                    <option>Please Select</option>
                    <option>Fixed</option>
                    <option>Percentage</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Discount Amount:*</label>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ color: "#0d6efd", alignSelf: "center" }}>ℹ</span>
                  <input defaultValue="0.00" style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Order Tax:*</label>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ color: "#0d6efd", alignSelf: "center" }}>ℹ</span>
                <select value={orderTax} onChange={(e) => setOrderTax(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
                  <option>Please Select</option>
                  <option>None</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Sell note</label>
              <textarea style={textareaStyle} />
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#495057", paddingTop: 28 }}>
            <p style={{ marginBottom: 8 }}>Discount Amount: (-) 0.00</p>
            <p>Order Tax: (+) 0.00</p>
          </div>
        </div>
      </FormSection>

      {/* ── Section 4: Shipping ── */}
      <FormSection>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Shipping Details</label>
            <textarea placeholder="Shipping Details" style={textareaStyle} />
          </div>
          <div>
            <label style={labelStyle}>Shipping Address</label>
            <textarea placeholder="Shipping Address" style={textareaStyle} />
          </div>
          <div>
            <label style={labelStyle}>Shipping Charges</label>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ color: "#0d6efd", alignSelf: "center" }}>ℹ</span>
              <input defaultValue="0.00" style={{ ...inputStyle, flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Shipping Status</label>
            <select value={shippingStatus} onChange={(e) => setShippingStatus(e.target.value)} style={selectStyle}>
              <option value="">Please Select</option>
              <option>Ordered</option>
              <option>Packed</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Delivered To:</label>
            <input placeholder="Delivered To" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Delivery Person:</label>
            <select value={deliveryPerson} onChange={(e) => setDeliveryPerson(e.target.value)} style={selectStyle}>
              <option value="">Please Select</option>
              <option>Mrs Rekha Malar</option>
              <option>Mr Leejin</option>
              <option>Ms Shalijah Stalin Rajakumar</option>
              <option>Er Sarath Raj</option>
              <option>Ms Dharshiha C</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Shipping Documents:</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} readOnly />
            <button
              style={{
                background: "#1a7a4a",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 14px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              📁 Browse…
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#6c757d", marginTop: 4 }}>
            Max File size: 5MB &nbsp;·&nbsp; Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png
          </p>
        </div>
        <div style={{ textAlign: "right", fontWeight: 600, fontSize: 13, color: "#212529", marginTop: 16 }}>
          Total Payable: 0.00
        </div>
      </FormSection>

      {/* ── Section 5: Payment (sale only) ── */}
      {showPaymentSection && (
        <FormSection>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#212529", marginBottom: 14 }}>Add payment</h3>
          <p style={{ fontSize: 13, color: "#495057", marginBottom: 12 }}>Advance Balance: ₹ 0.00</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Amount:*</label>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ color: "#6c757d", alignSelf: "center" }}>💵</span>
                <input defaultValue="0.00" style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Paid on:*</label>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ alignSelf: "center" }}>📅</span>
                <input defaultValue="06/04/2026 10:13" style={{ ...inputStyle, flex: 1 }} readOnly />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Payment Method:*</label>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ color: "#6c757d", alignSelf: "center" }}>💵</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Payment note:</label>
              <textarea style={textareaStyle} />
            </div>
          </div>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #dee2e6" }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#212529" }}>Change Return:</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#212529" }}>₹ 0.00</p>
          </div>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #dee2e6" }} />
          <div style={{ textAlign: "right", fontSize: 13, color: "#6c757d" }}>Balance: ₹ 0.00</div>
        </FormSection>
      )}

      {/* ── Action Buttons ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingBottom: 24 }}>
        <button
          onClick={onSave}
          style={{
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 36px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={onSaveAndPrint}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 36px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Save and print
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: ALL SALES
// ═══════════════════════════════════════════════════════════
export function AllSales() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", display: "inline" }}>Sales </h2>
        <span style={{ fontSize: 13, color: "#6c757d" }}>05/06/2026 ~ 06/04/2026</span>
      </div>

      <FiltersAccordion />

      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#212529" }}>All sales</span>
            <AddBtn label="Add" onClick={() => navigate("/sells/create")} />
          </div>
          <TableToolbar />
          <DataTable
            columns={["Action","Date","Invoice No.","Customer name","Contact Number","Location","Payment Status","Payment Method","Total amount","Total paid","Sell Due","Sell Return Due","Shipping Status","Total Items","Added By"]}
            totalsRow={["Total:", "", "", "", "", "", "", "", "", "₹ 0.00", "₹ 0.00", "₹ 0.00", "", "₹ 0.00", ""]}
          />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: ADD SALE
// ═══════════════════════════════════════════════════════════
export function AddSale() {
  const navigate = useNavigate();
  return (
    <SaleForm
      title="Add Sale"
      mode="sale"
      onSave={() => navigate("/sells")}
      onSaveAndPrint={() => navigate("/sells")}
    />
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: LIST POS
// ═══════════════════════════════════════════════════════════
export function ListPOS() {
  const navigate = useNavigate();
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>POS</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>List POS</span>
            <AddBtn label="Add" onClick={() => navigate("/pos/create")} />
          </div>
          <TableToolbar />
          <DataTable
            columns={["Action","Date","Invoice No.","Customer name","Contact Number","Location","Payment Status","Payment Method","Total amount","Total paid","Sell Due","Sell Return Due","Shipping Status","Total Items","Added By"]}
            totalsRow={["Total:", "", "", "", "", "", "", "", "₹ 0.00", "₹ 0.00", "₹ 0.00", "₹ 0.00", "", "", ""]}
          />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: POS CREATE (Open Cash Register)
// ═══════════════════════════════════════════════════════════
export function POSCreate() {
  const navigate = useNavigate();
  const [cash, setCash] = useState("");
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 20 }}>Open Cash Register</h2>
      <Card>
        <div style={{ padding: 40, maxWidth: 520, margin: "0 auto" }}>
          <label style={labelStyle}>Cash in hand:*</label>
          <input
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            placeholder="Enter amount"
            style={{ ...inputStyle, marginBottom: 20 }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => navigate("/pos")}
              style={{
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "9px 24px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Open Register
            </button>
          </div>
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: ADD DRAFT
// ═══════════════════════════════════════════════════════════
export function AddDraft() {
  const navigate = useNavigate();
  return (
    <SaleForm
      title="Add Draft"
      mode="draft"
      onSave={() => navigate("/sells/drafts")}
      onSaveAndPrint={() => navigate("/sells/drafts")}
    />
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: LIST DRAFTS
// ═══════════════════════════════════════════════════════════
export function ListDrafts() {
  const navigate = useNavigate();
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>List Drafts</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>List Drafts</span>
            <AddBtn label="Add Draft" onClick={() => navigate("/sells/add-draft")} />
          </div>
          <TableToolbar />
          <DataTable columns={["Action","Date","Reference No","Customer name","Contact Number","Location","Total Items","Added By"]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: ADD QUOTATION
// ═══════════════════════════════════════════════════════════
export function AddQuotation() {
  const navigate = useNavigate();
  return (
    <SaleForm
      title="Add Quotation"
      mode="quotation"
      onSave={() => navigate("/sells/quotations")}
      onSaveAndPrint={() => navigate("/sells/quotations")}
    />
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: LIST QUOTATIONS
// ═══════════════════════════════════════════════════════════
export function ListQuotations() {
  const navigate = useNavigate();
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>List quotations</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>List quotations</span>
            <AddBtn label="Add Quotation" onClick={() => navigate("/sells/add-quotation")} />
          </div>
          <TableToolbar />
          <DataTable columns={["Date","Reference No","Customer name","Contact Number","Location","Total Items","Added By","Action"]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: SELL RETURN
// ═══════════════════════════════════════════════════════════
export function SellReturn() {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>Sell Return</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <span style={{ fontWeight: 600, fontSize: 15, display: "block", marginBottom: 14 }}>Sell Return</span>
          <TableToolbar />
          <DataTable
            columns={["Date","Invoice No.","Parent Sale","Customer name","Location","Payment Status","Total amount","Payment due","Action"]}
            totalsRow={["Total:", "", "", "", "", "", "₹ 0.00", "₹ 0.00", ""]}
          />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: SHIPMENTS
// ═══════════════════════════════════════════════════════════
export function Shipments() {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>Shipments</h2>
      <FiltersAccordion />
      <Card>
        <div style={{ padding: 20 }}>
          <TableToolbar />
          <DataTable columns={["Action","Date","Invoice No.","Customer name","Contact Number","Location","Delivery Person","Shipping Status","Payment Status"]} />
          <Pagination />
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: DISCOUNTS
// ═══════════════════════════════════════════════════════════
export function Discounts() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [amt, setAmt] = useState("");
  const [dtype, setDtype] = useState("Percentage");

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>Discount</h2>
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <AddBtn label="Add" onClick={() => setShowForm(!showForm)} />
          </div>

          {showForm && (
            <div
              style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 6,
                padding: 16,
                marginBottom: 16,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
                gap: 12,
              }}
            >
              {[
                { label: "Name:*", value: name, set: setName, type: "text" },
                { label: "Starts At:", value: starts, set: setStarts, type: "date" },
                { label: "Ends At:", value: ends, set: setEnds, type: "date" },
                { label: "Discount Amount:*", value: amt, set: setAmt, type: "number" },
              ].map(({ label, value, set, type }) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={value} onChange={(e) => set(e.target.value)} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Discount Type:</label>
                <select value={dtype} onChange={(e) => setDtype(e.target.value)} style={selectStyle}>
                  <option>Percentage</option>
                  <option>Fixed</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "#1a7a4a", color: "#fff", border: "none", borderRadius: 4, padding: "7px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 4, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <TableToolbar />
          <DataTable columns={["☐","Name","Starts At","Ends At","Discount Amount","Priority","Brand","Category","Products","Location","Action"]} />
          <div style={{ marginTop: 8 }}>
            <button
              style={{
                background: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 16px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Deactivate Selected
            </button>
          </div>
          <Pagination />
        </div>
      </Card>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PAGE: IMPORT SALES
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

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#212529", marginBottom: 16 }}>Import Sales</h2>

      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>File To Import:</label>
              <input type="file" accept=".xlsx,.xls,.csv" style={{ fontSize: 13 }} />
            </div>
            <button
              style={{
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "9px 20px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Upload and review
            </button>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ⬇ Download template file
          </button>
        </div>
      </Card>

      <Card>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Instructions</h3>
          <ol style={{ fontSize: 13, color: "#495057", paddingLeft: 20, lineHeight: 2 }}>
            <li>Upload sales data in excel format</li>
            <li>Choose business location and column by which sell lines will be grouped</li>
            <li>Choose respective sales fields for each column</li>
            <li style={{ marginTop: 8 }}>
              <strong>Importable fields</strong>
              <table
                style={{
                  marginTop: 8,
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", border: "1px solid #dee2e6", fontWeight: 600 }}>
                      Importable fields
                    </th>
                    <th style={{ padding: "8px 12px", textAlign: "left", border: "1px solid #dee2e6", fontWeight: 600 }}>
                      Instructions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(([f, i]) => (
                    <tr key={f}>
                      <td style={{ padding: "7px 12px", border: "1px solid #dee2e6" }}>{f}</td>
                      <td style={{ padding: "7px 12px", border: "1px solid #dee2e6", color: "#6c757d" }}>{i}</td>
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
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Imports</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                {["Import batch", "Import time", "Created By", "Invoices", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, border: "1px solid #dee2e6" }}>
                    {h}
                  </th>
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
    </div>
  );
}
import { useState } from "react";

export default function MyProfile() {
  const stored = JSON.parse(localStorage.getItem("manod_user") || "{}");
  const [form, setForm] = useState({
    name:    stored.name    || "Dharshiha C",
    email:   stored.email   || "dharshiha@manodtecnologies.com",
    phone:   stored.phone   || "+91 98765 43210",
    role:    stored.role    || "Administrator",
    address: stored.address || "",
  });
  const [saved, setSaved] = useState(false);

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const save = () => {
    // Validate email before saving
    if (form.email && !isValidEmail(form.email)) {
      alert("❌ Please enter a valid email address (e.g., user@gmail.com)");
      return;
    }

    // Validate phone
    if (form.phone && !/^[\d+\s]*$/.test(form.phone)) {
      alert("❌ Phone number can only contain digits, +, and spaces");
      return;
    }

    localStorage.setItem("manod_user", JSON.stringify({ ...stored, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (e, fieldName) => {
    let value = e.target.value;
    
    // Phone field: only accept numbers, +, and spaces for formatting
    if (fieldName === "phone") {
      value = value.replace(/[^\d+\s]/g, "");  // Allow spaces for formatting
      if (value.replace(/\D/g, "").length > 15) {
        value = value.slice(0, -1);
      }
    }
    
    setForm(prev => ({ ...prev, [fieldName]: value }));
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const disabledInputStyle = {
    ...inputStyle,
    color: "#6b7280",
    background: "#f3f4f6",
    cursor: "not-allowed",
  };

  const activeInputStyle = {
    ...inputStyle,
    color: "#111827",
    background: "#fff",
    cursor: "text",
  };

  // Check if email is invalid
  const emailIsInvalid = form.email && !isValidEmail(form.email);
  const phoneIsInvalid = form.phone && !/^[\d+\s]*$/.test(form.phone);  // Allow spaces

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Page title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>
          My Profile
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
          View and update your personal information
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Avatar card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "28px 20px",
            textAlign: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            border: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#14532d,#16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 800,
              color: "#fff",
              margin: "0 auto 14px",
            }}
          >
            {(form.name || "D").charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>
            {form.name || "Dharshiha C"}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {form.role || "Administrator"}
          </div>
          <div
            style={{
              marginTop: "16px",
              padding: "8px 14px",
              background: "#f0fdf4",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#15803d",
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            ● Active
          </div>
        </div>

        {/* Form */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "28px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            border: "1px solid #f0f0f0",
          }}
        >
          {saved && (
            <div
              style={{
                padding: "10px 14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#15803d",
                fontWeight: 600,
                marginBottom: "18px",
              }}
            >
              ✓ Profile updated successfully
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            {/* FULL NAME */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                placeholder="Enter your full name"
                onChange={(e) => handleChange(e, "name")}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                style={activeInputStyle}
              />
            </div>

            {/* ROLE - READ ONLY */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                Role <span style={{ color: "#9ca3af", fontSize: "11px" }}>(Read Only)</span>
              </label>
              <input
                type="text"
                value={form.role}
                disabled
                style={disabledInputStyle}
              />
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                Contact administrator to change role
              </div>
            </div>

            {/* EMAIL */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                placeholder="user@gmail.com"
                onChange={(e) => handleChange(e, "email")}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = emailIsInvalid ? "#dc2626" : "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                style={{
                  ...activeInputStyle,
                  borderColor: emailIsInvalid ? "#dc2626" : "#d1d5db",
                  background: emailIsInvalid ? "#fef2f2" : "#fff",
                }}
              />
              {emailIsInvalid && (
                <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>
                  ⚠ Please enter a valid email (e.g., user@gmail.com)
                </div>
              )}
            </div>

            {/* PHONE */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                placeholder="+91 98765 43210"
                onChange={(e) => handleChange(e, "phone")}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = phoneIsInvalid ? "#dc2626" : "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                inputMode="tel"
                style={{
                  ...activeInputStyle,
                  borderColor: phoneIsInvalid ? "#dc2626" : "#d1d5db",
                  background: phoneIsInvalid ? "#fef2f2" : "#fff",
                }}
              />
              {phoneIsInvalid && (
                <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>
                  ⚠ Phone number should contain only digits, +, and spaces
                </div>
              )}
            </div>
          </div>

          {/* ADDRESS */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
              Address
            </label>
            <input
              type="text"
              value={form.address}
              placeholder="Enter your address"
              onChange={(e) => handleChange(e, "address")}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
                e.target.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
              style={activeInputStyle}
            />
          </div>

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={save}
              disabled={emailIsInvalid || phoneIsInvalid}
              style={{
                padding: "10px 24px",
                background: emailIsInvalid || phoneIsInvalid 
                  ? "#9ca3af" 
                  : "linear-gradient(135deg,#14532d,#16a34a)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: emailIsInvalid || phoneIsInvalid ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!emailIsInvalid && !phoneIsInvalid) {
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              {emailIsInvalid || phoneIsInvalid ? "Fix Errors to Save" : "Save Changes"}
            </button>
            <button
              onClick={() =>
                setForm({
                  name: stored.name || "Dharshiha C",
                  email: stored.email || "",
                  phone: stored.phone || "",
                  role: stored.role || "Administrator",
                  address: stored.address || "",
                })
              }
              style={{
                padding: "10px 24px",
                background: "#fff",
                color: "#374151",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.target.style.background = "#fff")}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
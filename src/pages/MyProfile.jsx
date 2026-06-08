


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

  const save = () => {
    localStorage.setItem("manod_user", JSON.stringify({ ...stored, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const F = ({ label, k, type = "text", disabled }) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>{label}</label>
      <input type={type} value={form[k]} disabled={disabled}
        onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
        style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: disabled ? "#6b7280" : "#111827", background: disabled ? "#f3f4f6" : "#fff", outline: "none" }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = "#16a34a"; }}
        onBlur={(e)  => e.target.style.borderColor = "#d1d5db"}
      />
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Page title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>My Profile</h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>View and update your personal information</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Avatar card */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "28px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#14532d,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 800, color: "#fff", margin: "0 auto 14px" }}>
            {form.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>{form.name}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{form.role}</div>
          <div style={{ marginTop: "16px", padding: "8px 14px", background: "#f0fdf4", borderRadius: "8px", fontSize: "12px", color: "#15803d", fontWeight: 600, display: "inline-block" }}>● Active</div>
        </div>

        {/* Form */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
          {saved && (
            <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "13px", color: "#15803d", fontWeight: 600, marginBottom: "18px" }}>
              ✓ Profile updated successfully
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <F label="Full Name"     k="name" />
            <F label="Role"          k="role" disabled />
            <F label="Email Address" k="email" type="email" />
            <F label="Phone Number"  k="phone" />
          </div>
          <F label="Address" k="address" />

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button onClick={save}
              style={{ padding: "10px 24px", background: "linear-gradient(135deg,#14532d,#16a34a)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Save Changes
            </button>
            <button onClick={() => setForm({ name: stored.name || "Dharshiha C", email: stored.email || "", phone: stored.phone || "", role: stored.role || "Administrator", address: stored.address || "" })}
              style={{ padding: "10px 24px", background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";

function PwdInput({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #d1d5db", borderRadius: "8px", padding: "10px 40px 10px 12px", fontSize: "13px", color: "#111827", background: "#fff", outline: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
          onBlur={(e)  => (e.target.style.borderColor = "#d1d5db")} />
        <button onClick={() => setShow((p) => !p)} tabIndex={-1}
          style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
          {show
            ? <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            : <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          }
        </button>
      </div>
    </div>
  );
}

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}

export default function ChangePassword() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const str = strength(form.next);
  const strLabel = ["", "Weak", "Fair", "Good", "Strong"][str];
  const strColor = ["", "#ef4444", "#f97316", "#eab308", "#16a34a"][str];

  const validate = () => {
    const e = {};
    if (!form.current)          e.current = "Current password is required.";
    if (!form.next)             e.next    = "New password is required.";
    else if (form.next.length < 8) e.next = "Minimum 8 characters.";
    if (form.next !== form.confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    /*
     * REAL API:
     * await fetch("/api/auth/change-password", {
     *   method: "POST",
     *   headers: { "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("manod_token")}` },
     *   body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
     * });
     */
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    setForm({ current: "", next: "", confirm: "" });
  };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>Change Password</h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>Update your account password</p>
      </div>

      <div style={{ maxWidth: "480px", background: "#fff", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
        {success && (
          <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "13px", color: "#15803d", fontWeight: 600, marginBottom: "18px" }}>
            ✓ Password changed successfully!
          </div>
        )}

        <PwdInput label="Current Password" value={form.current} onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))} />
        {errors.current && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "-12px", marginBottom: "12px" }}>{errors.current}</div>}

        <PwdInput label="New Password" value={form.next} onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))} />
        {form.next && (
          <div style={{ marginTop: "-10px", marginBottom: "14px" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
              {[1,2,3,4].map((i) => (
                <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i <= str ? strColor : "#e5e7eb", transition: "background 0.3s" }} />
              ))}
            </div>
            <span style={{ fontSize: "11px", color: strColor, fontWeight: 600 }}>{strLabel}</span>
          </div>
        )}
        {errors.next && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "-10px", marginBottom: "12px" }}>{errors.next}</div>}

        <PwdInput label="Confirm New Password" value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} />
        {errors.confirm && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "-12px", marginBottom: "12px" }}>{errors.confirm}</div>}

        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 14px", fontSize: "12px", color: "#6b7280", marginBottom: "20px", lineHeight: 1.6 }}>
          <strong style={{ color: "#374151" }}>Password requirements:</strong><br />
          • Minimum 8 characters<br />
          • Include at least one uppercase letter<br />
          • Include at least one number<br />
          • Include at least one special character
        </div>

        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#14532d,#16a34a)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.75 : 1 }}>
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}
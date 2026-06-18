import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

// ─── EYE ICON ─────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      ) : (
        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
      )}
    </svg>
  );
}

// ─── ALERT ───────────────────────────────────────────────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div style={{
      padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
      fontWeight: 500, marginBottom: "16px",
      background: isError ? "#fef2f2" : "#f0fdf4",
      color: isError ? "#b91c1c" : "#15803d",
      border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
      display: "flex", alignItems: "center", gap: "8px",
    }}>
      <span>{isError ? "⚠" : "✓"}</span> {message}
    </div>
  );
}

// ─── SHARED FIELD ─────────────────────────────────────────────────────────────
function Field({ label, error, children, half }) {
  return (
    <div style={{ flex: half ? "0 0 calc(50% - 8px)" : "1 1 100%", minWidth: 0 }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
        {label}
      </label>
      {children}
      {error && <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px" }}>{error}</div>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      style={{
        width: "100%", boxSizing: "border-box",
        border: `1.5px solid ${error ? "#dc2626" : "#d1d5db"}`,
        borderRadius: "8px", padding: "9px 11px",
        fontSize: "13px", color: "#111827", background: "#f9fafb",
        outline: "none", transition: "border-color 0.15s",
      }}
      onFocus={e => e.target.style.borderColor = "#1a5c38"}
      onBlur={e => e.target.style.borderColor = error ? "#dc2626" : "#d1d5db"}
      {...props}
    />
  );
}

function Select({ error, children, ...props }) {
  return (
    <select
      style={{
        width: "100%", boxSizing: "border-box",
        border: `1.5px solid ${error ? "#dc2626" : "#d1d5db"}`,
        borderRadius: "8px", padding: "9px 11px",
        fontSize: "13px", color: "#374151", background: "#f9fafb",
        outline: "none", cursor: "pointer",
      }}
      {...props}
    >{children}</select>
  );
}

const STEPS = ["Business", "Business Settings", "Owner"];
const row = { display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "14px" };
const fileStyle = { width: "100%", boxSizing: "border-box", border: "1.5px dashed #d1d5db", borderRadius: "8px", padding: "8px 11px", fontSize: "13px", color: "#6b7280", background: "#f9fafb", cursor: "pointer" };

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
function Step1({ data, set, errors }) {
  const u = k => e => set(p => ({ ...p, [k]: e.target.value }));
  return (
    <>
      <div style={row}>
        <Field label="Business Name *" error={errors.businessName}>
          <Input placeholder="Business Name" value={data.businessName} onChange={u("businessName")} error={errors.businessName} />
        </Field>
      </div>
      <div style={row}>
        <Field label="Start Date" half><Input type="date" value={data.startDate} onChange={u("startDate")} /></Field>
        <Field label="Currency *" error={errors.currency} half>
          <Select value={data.currency} onChange={u("currency")} error={errors.currency}>
            <option value="">Select Currency</option>
            <option value="INR">₹ INR – Indian Rupee</option>
            <option value="USD">$ USD – US Dollar</option>
            <option value="EUR">€ EUR – Euro</option>
            <option value="GBP">£ GBP – British Pound</option>
          </Select>
        </Field>
      </div>
      <div style={row}>
        <Field label="Upload Logo" half><input type="file" accept="image/*" style={fileStyle} onChange={e => set(p => ({ ...p, logo: e.target.files[0] }))} /></Field>
        <Field label="Website" half><Input placeholder="https://yoursite.com" value={data.website} onChange={u("website")} /></Field>
      </div>
      <div style={row}>
        <Field label="Business Contact Number" half><Input placeholder="+91 XXXXX XXXXX" value={data.phone} onChange={u("phone")} /></Field>
        <Field label="Alternate Contact Number" half><Input placeholder="+91 XXXXX XXXXX" value={data.altPhone} onChange={u("altPhone")} /></Field>
      </div>
      <div style={row}>
        <Field label="Country *" error={errors.country} half><Input placeholder="Country" value={data.country} onChange={u("country")} error={errors.country} /></Field>
        <Field label="State *" error={errors.state} half><Input placeholder="State" value={data.state} onChange={u("state")} error={errors.state} /></Field>
      </div>
      <div style={row}>
        <Field label="City *" error={errors.city} half><Input placeholder="City" value={data.city} onChange={u("city")} error={errors.city} /></Field>
        <Field label="Zip Code *" error={errors.zip} half><Input placeholder="Zip Code" value={data.zip} onChange={u("zip")} error={errors.zip} /></Field>
      </div>
    </>
  );
}

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
function Step2({ data, set, errors }) {
  const u = k => e => set(p => ({ ...p, [k]: e.target.value }));
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return (
    <>
      <div style={row}>
        <Field label="Financial Year Start *" error={errors.fyStart} half>
          <Select value={data.fyStart} onChange={u("fyStart")} error={errors.fyStart}>
            <option value="">Select Month</option>
            {months.map(m => <option key={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="Time Zone *" error={errors.timezone} half>
          <Select value={data.timezone} onChange={u("timezone")} error={errors.timezone}>
            <option value="">Select Timezone</option>
            <option value="IST">IST – India (UTC+5:30)</option>
            <option value="UTC">UTC – Coordinated Universal Time</option>
            <option value="EST">EST – Eastern (UTC-5)</option>
            <option value="PST">PST – Pacific (UTC-8)</option>
          </Select>
        </Field>
      </div>
      <div style={row}>
        <Field label="Date Format *" error={errors.dateFormat} half>
          <Select value={data.dateFormat} onChange={u("dateFormat")} error={errors.dateFormat}>
            <option value="">Select Format</option>
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </Select>
        </Field>
        <Field label="Stock Accounting Method *" error={errors.stockMethod} half>
          <Select value={data.stockMethod} onChange={u("stockMethod")} error={errors.stockMethod}>
            <option value="">Select Method</option>
            <option value="FIFO">FIFO – First In First Out</option>
            <option value="LIFO">LIFO – Last In First Out</option>
            <option value="Average">Average Cost</option>
          </Select>
        </Field>
      </div>
      <div style={row}>
        <Field label="Default Tax (%)" half><Input type="number" placeholder="0" value={data.tax} onChange={u("tax")} /></Field>
        <Field label="Invoice Prefix" half><Input placeholder="INV-" value={data.invoicePrefix} onChange={u("invoicePrefix")} /></Field>
      </div>
      <div style={row}>
        <Field label="Business Description">
          <textarea value={data.description} onChange={u("description")} placeholder="Brief description of your business..."
            style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #d1d5db", borderRadius: "8px", padding: "9px 11px", fontSize: "13px", color: "#111827", background: "#f9fafb", outline: "none", resize: "vertical", minHeight: "72px", fontFamily: "inherit" }} />
        </Field>
      </div>
    </>
  );
}

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
function Step3({ data, set, errors }) {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const u = k => e => set(p => ({ ...p, [k]: e.target.value }));
  const pwInput = (key, show, toggle, placeholder) => (
    <div style={{ position: "relative" }}>
      <Input type={show ? "text" : "password"} placeholder={placeholder} value={data[key]} onChange={u(key)} error={errors[key]} style={{ paddingRight: "38px" }} />
      <button onClick={toggle} tabIndex={-1} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0, display: "flex" }}>
        <EyeIcon open={show} />
      </button>
    </div>
  );
  return (
    <>
      <div style={row}>
        <Field label="First Name *" error={errors.firstName} half><Input placeholder="First Name" value={data.firstName} onChange={u("firstName")} error={errors.firstName} /></Field>
        <Field label="Last Name *" error={errors.lastName} half><Input placeholder="Last Name" value={data.lastName} onChange={u("lastName")} error={errors.lastName} /></Field>
      </div>
      <div style={row}>
        <Field label="Email Address *" error={errors.email}><Input type="email" placeholder="owner@business.com" value={data.email} onChange={u("email")} error={errors.email} /></Field>
      </div>
      <div style={row}>
        <Field label="Password *" error={errors.password} half>
          {pwInput("password", showPw, () => setShowPw(p => !p), "Create password")}
          {errors.password && <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px" }}>{errors.password}</div>}
        </Field>
        <Field label="Confirm Password *" error={errors.confirmPassword} half>
          {pwInput("confirmPassword", showCpw, () => setShowCpw(p => !p), "Re-enter password")}
          {errors.confirmPassword && <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px" }}>{errors.confirmPassword}</div>}
        </Field>
      </div>
      <div style={row}>
        <Field label="Phone Number" half><Input placeholder="+91 XXXXX XXXXX" value={data.ownerPhone} onChange={u("ownerPhone")} /></Field>
      </div>
    </>
  );
}

// ─── LOGO MARK ───────────────────────────────────────────────────────────────
function LogoMark({ size = 38 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "10px", background: "linear-gradient(135deg, #14532d, #166534)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.42, flexShrink: 0 }}>M</div>
  );
}

// ─── SHARED STYLE TOKENS ──────────────────────────────────────────────────────
const cardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  padding: "36px 40px",
  width: "100%",
  maxWidth: "460px",
  position: "relative",
  zIndex: 1,
};

const greenBtn = {
  background: "linear-gradient(135deg, #14532d, #16a34a)",
  color: "#fff", border: "none", borderRadius: "10px",
  padding: "11px 24px", fontWeight: 700, fontSize: "13.5px",
  cursor: "pointer", transition: "opacity 0.15s",
};

const outlineBtn = {
  background: "#fff", color: "#374151",
  border: "1.5px solid #e5e7eb", borderRadius: "10px",
  padding: "11px 22px", fontWeight: 600, fontSize: "13.5px", cursor: "pointer",
};

const inputWrap = (hasErr) => ({
  display: "flex", alignItems: "center", gap: "10px",
  border: `1.5px solid ${hasErr ? "#dc2626" : "#d1d5db"}`,
  borderRadius: "10px", padding: "0 13px",
  background: "#f9fafb", transition: "border-color 0.15s",
});

const bareInput = {
  flex: 1, border: "none", background: "transparent",
  padding: "11px 0", fontSize: "13.5px", color: "#111827", outline: "none",
};

const errText = { fontSize: "12px", color: "#dc2626", marginTop: "4px" };

// ─── REGISTER FORM ────────────────────────────────────────────────────────────
function RegisterForm({ onBack }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const [biz, setBiz] = useState({ businessName: "", startDate: "", currency: "", website: "", phone: "", altPhone: "", country: "", state: "", city: "", zip: "", logo: null });
  const [settings, setSettings] = useState({ fyStart: "", timezone: "", dateFormat: "", stockMethod: "", tax: "", invoicePrefix: "INV-", description: "" });
  const [owner, setOwner] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", ownerPhone: "" });

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!biz.businessName.trim()) e.businessName = "Please specify your business name";
      if (!biz.currency) e.currency = "This field is required.";
      if (!biz.country.trim()) e.country = "This field is required.";
      if (!biz.state.trim()) e.state = "This field is required.";
      if (!biz.city.trim()) e.city = "This field is required.";
      if (!biz.zip.trim()) e.zip = "This field is required.";
    }
    if (step === 1) {
      if (!settings.fyStart) e.fyStart = "This field is required.";
      if (!settings.timezone) e.timezone = "This field is required.";
      if (!settings.dateFormat) e.dateFormat = "This field is required.";
      if (!settings.stockMethod) e.stockMethod = "This field is required.";
    }
    if (step === 2) {
      if (!owner.firstName.trim()) e.firstName = "First name is required.";
      if (!owner.lastName.trim()) e.lastName = "Last name is required.";
      if (!owner.email.trim()) e.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(owner.email)) e.email = "Enter a valid email.";
      if (!owner.password) e.password = "Password is required.";
      else if (owner.password.length < 8) e.password = "Minimum 8 characters.";
      if (owner.password !== owner.confirmPassword) e.confirmPassword = "Passwords do not match.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => { setErrors({}); setStep(s => s - 1); };

  // ── REAL API CALL ──
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${owner.firstName} ${owner.lastName}`,
          email: owner.email,
          password: owner.password,
          phone: owner.ownerPhone || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setDone(true);
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Registration failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (done) return (
    <div style={cardStyle}>
      <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Registration Successful!</div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
          Welcome, <strong>{owner.firstName} {owner.lastName}</strong>!<br />
          <strong>{biz.businessName}</strong> is all set up on Manod ERP.
        </div>
        <button style={greenBtn} onClick={onBack}>Go to Login →</button>
      </div>
    </div>
  );

  return (
    <div style={{ ...cardStyle, maxWidth: "680px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
        <LogoMark />
        <div>
          <div style={{ fontWeight: 700, fontSize: "17px", color: "#111827" }}>manod tecnologies</div>
          <div style={{ fontSize: "10px", color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Inventory System</div>
        </div>
      </div>
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "22px" }}>Register and Get Started in minutes</div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "22px" }}>
        {STEPS.map((label, i) => (
          <button key={i} onClick={() => i < step && setStep(i)}
            style={{
              flex: 1, padding: "10px 6px", borderRadius: "8px", border: "none",
              fontWeight: 600, fontSize: "12.5px",
              cursor: i < step ? "pointer" : "default",
              background: i === step ? "linear-gradient(135deg, #14532d, #16a34a)" : i < step ? "#dcfce7" : "#f3f4f6",
              color: i === step ? "#fff" : i < step ? "#15803d" : "#9ca3af",
              transition: "all 0.2s",
            }}>
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
        {STEPS[step]} details:
      </div>

      <Alert type={alert?.type} message={alert?.message} />

      {step === 0 && <Step1 data={biz} set={setBiz} errors={errors} />}
      {step === 1 && <Step2 data={settings} set={setSettings} errors={errors} />}
      {step === 2 && <Step3 data={owner} set={setOwner} errors={errors} />}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
        <button style={outlineBtn} onClick={step === 0 ? onBack : prev}>
          ← {step === 0 ? "Back to Login" : "Previous"}
        </button>
        {step < 2
          ? <button style={greenBtn} onClick={next}>Next →</button>
          : <button style={{ ...greenBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }} onClick={submit} disabled={loading}>
              {loading ? "Registering…" : "Complete Registration ✓"}
            </button>
        }
      </div>

      <div style={{ textAlign: "center", fontSize: "12.5px", color: "#6b7280", marginTop: "14px" }}>
        Already have an account?{" "}
        <span style={{ color: "#15803d", fontWeight: 600, cursor: "pointer" }} onClick={onBack}>Login here</span>
      </div>
    </div>
  );
}

// ─── LOGIN FORM ───────────────────────────────────────────────────────────────
function LoginForm({ onRegister }) {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");

      // Save token + user info
      localStorage.setItem("manod_token", data.token);
      localStorage.setItem("manod_user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === "Enter") submit(); };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <LogoMark />
        <div>
          <div style={{ fontWeight: 700, fontSize: "17px", color: "#111827" }}>manod tecnologies</div>
          <div style={{ fontSize: "10px", color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Inventory System</div>
        </div>
      </div>

      <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Welcome Back</div>
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Login to your manod tecnologies account</div>

      <Alert type={alert?.type} message={alert?.message} />

      {/* Email */}
      <div style={{ marginBottom: "14px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Email</label>
        <div style={inputWrap(errors.email)}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
          </svg>
          <input
            style={bareInput} placeholder="Enter your email" type="email"
            value={form.email}
            onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }}
            onKeyDown={handleKey}
          />
        </div>
        {errors.email && <div style={errText}>{errors.email}</div>}
      </div>

      {/* Password */}
      <div style={{ marginBottom: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Password</label>
          <span style={{ fontSize: "12.5px", color: "#15803d", cursor: "pointer", fontWeight: 500 }}>Forgot Your Password?</span>
        </div>
        <div style={inputWrap(errors.password)}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            style={bareInput} type={showPw ? "text" : "password"} placeholder="••••••••"
            value={form.password}
            onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: "" })); }}
            onKeyDown={handleKey}
          />
          <button onClick={() => setShowPw(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex" }}>
            <EyeIcon open={showPw} />
          </button>
        </div>
        {errors.password && <div style={errText}>{errors.password}</div>}
      </div>

      {/* Remember Me */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "14px 0 20px" }}>
        <input type="checkbox" id="rem" style={{ width: "15px", height: "15px", accentColor: "#15803d", cursor: "pointer" }}
          checked={form.remember} onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))} />
        <label htmlFor="rem" style={{ fontSize: "13px", color: "#374151", cursor: "pointer" }}>Remember Me</label>
      </div>

      <button
        style={{ ...greenBtn, width: "100%", fontSize: "15px", padding: "13px", opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
        onClick={submit}
        disabled={loading}
      >
        {loading ? "Logging in…" : "Login"}
      </button>

      <div style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "18px" }}>
        Not yet registered?{" "}
        <span style={{ color: "#15803d", fontWeight: 600, cursor: "pointer" }} onClick={onRegister}>Register Now</span>
      </div>
    </div>
  );
}

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
export default function Login() {
  const [mode, setMode] = useState("login");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 70%, #1a7a42 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", position: "relative", overflow: "hidden",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-140px", left: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "20px", right: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          style={{ border: "1.5px solid rgba(255,255,255,0.6)", color: "#fff", background: "transparent", borderRadius: "50px", padding: "7px 18px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
          onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Register" : "Login"}
        </button>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", cursor: "pointer" }}>▶ English</span>
      </div>

      {mode === "login"
        ? <LoginForm onRegister={() => setMode("register")} />
        : <RegisterForm onBack={() => setMode("login")} />
      }
    </div>
  );
}
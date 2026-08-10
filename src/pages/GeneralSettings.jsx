
import { useState, useEffect } from "react";
import * as settingsAPI from "../api/settingsAPI";
import { useIndustry } from "../context/IndustryContext";

// ─── Shared styles (mirrors Settings.jsx) ─────────────────────────────────
const G = {
  green: "linear-gradient(135deg,#27ae60 0%,#1a6b3c 100%)",
};

const btnBase = {
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "9px 20px", border: "none", borderRadius: 8,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  letterSpacing: ".01em", transition: "transform .12s, box-shadow .12s",
  fontFamily: "inherit",
};
const BtnGreen = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{ ...btnBase, background: G.green, color: "#fff", boxShadow: "0 3px 10px rgba(26,107,60,.30)", ...style }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
    {children}
  </button>
);

const Label = ({ children }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: "#444", marginBottom: 4, display: "block" }}>
    {children}
  </label>
);
const Input = ({ value, onChange, placeholder = "", type = "text", style = {} }) => (
  <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder}
    style={{ width: "100%", padding: "8px 11px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, color: "#333", background: "#fff", boxSizing: "border-box", outline: "none", fontFamily: "inherit", ...style }}
    onFocus={e => e.target.style.borderColor = "#1a6b3c"}
    onBlur={e => e.target.style.borderColor = "#ddd"} />
);
const Select = ({ children, value, onChange, style = {} }) => (
  <select value={value ?? ""} onChange={onChange}
    style={{ width: "100%", padding: "8px 30px 8px 11px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, color: "#333", background: "#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\") no-repeat right 10px center", appearance: "none", boxSizing: "border-box", fontFamily: "inherit", outline: "none", ...style }}
    onFocus={e => e.target.style.borderColor = "#1a6b3c"}
    onBlur={e => e.target.style.borderColor = "#ddd"}>
    {children}
  </select>
);
const FormRow = ({ children, cols = 3 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18, marginBottom: 18 }}>
    {children}
  </div>
);
const FG = ({ label, children }) => (
  <div><Label>{label}</Label>{children}</div>
);
const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a6b3c", borderBottom: "2px solid #e8f5ee", paddingBottom: 8, marginBottom: 18, marginTop: 8 }}>{children}</div>
);
const Divider = () => <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "20px 0" }} />;
const Card = ({ children }) => (
  <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0e0e0", padding: "26px 28px" }}>
    {children}
  </div>
);
const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: checked ? "#1a6b3c" : "#ccc", cursor: "pointer", position: "relative", transition: ".2s" }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: checked ? 20 : 2, transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </div>
    <span style={{ fontSize: 13, color: "#444" }}>{label}</span>
  </div>
);

// ─── Industry recommended defaults ─────────────────────────────────────────
// NEW
const INDUSTRY_PRESETS = {
  jewellery_manufacturing: {
    default_unit: "Gram",
    default_category: "Jewellery",
    industry_fields: {
      gold_purity: true, gross_weight: true, net_weight: true,
      stone_weight: true, wastage_percentage: true, making_charge: true, hallmark: true,
    },
  },
  automobile_manufacturing: {
    default_unit: "Piece",
    default_category: "Automobile",
    industry_fields: {
      vin: true, engine_number: true, chassis_number: true, model_year: true, variant: true,
    },
  },
  furniture_manufacturing: {
    default_unit: "Piece",
    default_category: "Furniture",
    industry_fields: {
      wood_type: true, material: true, dimensions: true, finish: true,
    },
  },
  textile_manufacturing: {
    default_unit: "Meter",
    default_category: "Textile",
    industry_fields: {
      fabric_type: true, gsm: true, roll_length: true, pattern: true, color: true,
    },
  },
  garments_manufacturing: {
    default_unit: "Piece",
    default_category: "Garments",
    industry_fields: {
      size: true, color: true, fabric_type: true, season: true, gender: true,
    },
  },
};

const INDUSTRY_LABELS = {
  general_manufacturing: "General Manufacturing",
  automobile_manufacturing: "Automobile Manufacturing",
  jewellery_manufacturing: "Jewellery Manufacturing",
  furniture_manufacturing: "Furniture Manufacturing",
  textile_manufacturing: "Textile Manufacturing",
  electronics_manufacturing: "Electronics Manufacturing",
  food_manufacturing: "Food Manufacturing",
  garments_manufacturing: "Garments Manufacturing",
};

// NEW
const INDUSTRY_FIELD_LABELS = {
  gold_purity: "Gold Purity", gross_weight: "Gross Weight", net_weight: "Net Weight",
  stone_weight: "Stone Weight", wastage_percentage: "Wastage Percentage",
  making_charge: "Making Charge", hallmark: "Hallmark",
  vin: "VIN", engine_number: "Engine Number", chassis_number: "Chassis Number",
  model_year: "Model Year", variant: "Variant",
  wood_type: "Wood Type", material: "Material", dimensions: "Dimensions", finish: "Finish",
  fabric_type: "Fabric Type", gsm: "GSM", roll_length: "Roll Length", pattern: "Pattern", color: "Color",
  size: "Size", season: "Season", gender: "Gender",
};

// ─── Default form state ─────────────────────────────────────────────────────
const DEFAULT_FORM = {
  company_name: "", industry_type: "general_manufacturing", currency: "INR",
  financial_year: "", timezone: "Asia/Kolkata", date_format: "mm/dd/yyyy",

  default_unit: "", default_tax: "", default_category: "",
  auto_sku_generation: true, barcode_enabled: true, batch_tracking_enabled: false,
  serial_tracking_enabled: false, product_images_enabled: true,
  manufacturing_date_enabled: false, expiry_date_enabled: false, product_variants_enabled: false,
  industry_fields: {},

  allow_negative_stock: false, low_stock_alert_enabled: true, multi_warehouse_enabled: false,
  stock_reservation_enabled: false, stock_transfer_enabled: true, default_warehouse: "",

  bom_required: true, production_planning_enabled: true, work_orders_enabled: true,
  quality_check_enabled: false, scrap_management_enabled: false,
  machine_tracking_enabled: false, auto_production_number: true,
};


export default function GeneralSettings() {
  const { activeIndustry } = useIndustry();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const t = (k) => () => setForm({ ...form, [k]: !form[k] });
  const tField = (k) => () =>
    setForm({ ...form, industry_fields: { ...form.industry_fields, [k]: !form.industry_fields[k] } });

// NEW
  useEffect(() => {
    setLoading(true);
    (async () => {
      const res = await settingsAPI.getGeneralSettings();
      if (res.success && res.data) {
        // industry_type always comes from the backend, which derives it from
        // the active workspace (industries table) — never from a saved value.
        const preset = INDUSTRY_PRESETS[res.data.industry_type];
        setForm((prev) => ({
          ...prev,
          ...res.data,
          default_unit: res.data.default_unit || preset?.default_unit || "",
          default_category: res.data.default_category || preset?.default_category || "",
          industry_fields:
            res.data.industry_fields && Object.keys(res.data.industry_fields).length > 0
              ? res.data.industry_fields
              : preset ? { ...preset.industry_fields } : {},
        }));
      }
      setLoading(false);
    })();
  }, [activeIndustry?.id]);
  // Applying an industry preset only updates default form values — never touches existing products
const applyIndustryPreset = (industryKey) => {
    const preset = INDUSTRY_PRESETS[industryKey];
    setForm((prev) => ({
      ...prev,
      industry_type: industryKey,
      default_unit: preset ? preset.default_unit : "",
      default_category: preset?.default_category ? preset.default_category : "",
      industry_fields: preset ? { ...preset.industry_fields } : {},
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    const res = await settingsAPI.updateGeneralSettings(form);
    setSaving(false);
    setMsg(res.success ? "✅ Settings updated" : `❌ ${res.message}`);
  };

  if (loading) return <Card>Loading...</Card>;

  const activeFields = INDUSTRY_PRESETS[form.industry_type]?.industry_fields
    ? Object.keys(INDUSTRY_PRESETS[form.industry_type].industry_fields)
    : [];

  return (
    <Card>
      <SectionTitle>Company Settings</SectionTitle>
      <FormRow cols={3}>
        <FG label="Company Name"><Input value={form.company_name} onChange={f("company_name")} placeholder="Your company name" /></FG>
     
        <FG label="Industry Type">
          <Select value={form.industry_type} disabled style={{ background: "#f4f6f8", color: "#666", cursor: "not-allowed" }}>
            <option value={form.industry_type}>
              {INDUSTRY_LABELS[form.industry_type] || form.industry_type}
            </option>
          </Select>
          <p style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
            Controlled by the active workspace — switch it from the header dropdown.
          </p>
        </FG>
        <FG label="Currency">
          <Select value={form.currency} onChange={f("currency")}>
            <option value="INR">India - Rupees (INR)</option>
            <option value="USD">USD - Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </Select>
        </FG>
      </FormRow>
      <FormRow cols={3}>
        <FG label="Financial Year"><Input value={form.financial_year} onChange={f("financial_year")} placeholder="e.g. 2026-2027" /></FG>
        <FG label="Time Zone">
          <Select value={form.timezone} onChange={f("timezone")}>
            <option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option>
          </Select>
        </FG>
        <FG label="Date Format">
          <Select value={form.date_format} onChange={f("date_format")}>
            <option>mm/dd/yyyy</option><option>dd/mm/yyyy</option><option>yyyy-mm-dd</option>
          </Select>
        </FG>
      </FormRow>

      <Divider />
      <SectionTitle>Product Default Settings</SectionTitle>
      <p style={{ fontSize: 12, color: "#999", marginTop: -12, marginBottom: 16 }}>
        These only apply to newly created products — existing products are never changed.
      </p>
      <FormRow cols={3}>
        <FG label="Default Unit"><Input value={form.default_unit} onChange={f("default_unit")} placeholder="e.g. Piece, Gram, Meter" /></FG>
        <FG label="Default Tax"><Input value={form.default_tax} onChange={f("default_tax")} placeholder="e.g. GST 18%" /></FG>
        <FG label="Default Category"><Input value={form.default_category} onChange={f("default_category")} placeholder="e.g. General" /></FG>
      </FormRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 10 }}>
        <Toggle checked={form.auto_sku_generation} onChange={t("auto_sku_generation")} label="Auto SKU Generation" />
        <Toggle checked={form.barcode_enabled} onChange={t("barcode_enabled")} label="Barcode" />
        <Toggle checked={form.batch_tracking_enabled} onChange={t("batch_tracking_enabled")} label="Batch Tracking" />
        <Toggle checked={form.serial_tracking_enabled} onChange={t("serial_tracking_enabled")} label="Serial Number Tracking" />
        <Toggle checked={form.product_images_enabled} onChange={t("product_images_enabled")} label="Product Images" />
        <Toggle checked={form.manufacturing_date_enabled} onChange={t("manufacturing_date_enabled")} label="Manufacturing Date" />
        <Toggle checked={form.expiry_date_enabled} onChange={t("expiry_date_enabled")} label="Expiry Date" />
        <Toggle checked={form.product_variants_enabled} onChange={t("product_variants_enabled")} label="Product Variants" />
      </div>

      {activeFields.length > 0 && (
        <>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#1a6b3c", marginTop: 18, marginBottom: 10 }}>
            {INDUSTRY_LABELS[form.industry_type]} — Recommended Fields
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {activeFields.map((key) => (
              <Toggle key={key} checked={!!form.industry_fields[key]} onChange={tField(key)} label={INDUSTRY_FIELD_LABELS[key] || key} />
            ))}
          </div>
        </>
      )}

    <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <BtnGreen onClick={handleSave} style={{ padding: "13px 44px", fontSize: 15, borderRadius: 10, boxShadow: "0 4px 16px rgba(26,107,60,.35)", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : "💾 Update Settings"}
        </BtnGreen>
        {msg && <span style={{ fontSize: 12.5, color: msg.startsWith("✅") ? "#1a6b3c" : "#e53935" }}>{msg}</span>}
      </div>
    </Card>
  );
}
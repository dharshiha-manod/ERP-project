import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
// NEW
import { productsAPI, brandsAPI, unitsAPI, categoriesAPI, variationsAPI } from "../api/productAPI";
// NEW
import { getLocations, getBusinessSettings } from "../api/settingsAPI";
import { getGeneralSettings } from "../api/settingsAPI"; // General Settings module

// ── Constants ──────────────────────────────────────────────
const TAXES        = ["None","GST 5%","GST 12%","GST 18%","GST 28%"];
const TAX_TYPES    = ["Exclusive","Inclusive"];
const PRODUCT_TYPES= ["Single","Variable"];
const BARCODE_TYPES= ["Code 128 (C128)","EAN-13","EAN-8","QR Code","UPC-A"];
// NEW
// Business locations are now fetched live from Settings → Business Locations
const ITEM_TYPES   = ["Finished Product", "Raw Material", "Semi-Finished Product", "Packing Material", "Service"];

// ── Auto-generate SKU ──────────────────────────────────────
const genSKU = (name = "") => {
  const prefix = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase()||"").join("").slice(0,3) || "PRD";
  const rand   = Math.random().toString(36).substring(2,6).toUpperCase();
  const num    = Date.now().toString().slice(-4);
  return `${prefix}-${rand}${num}`;
};
const EMPTY_FORM = {
  name:"", sku:"", barcodeType:"Code 128 (C128)",
  unit:"", brand:"", category:"", subCategory:"", variationTemplate:"", warranty:"",
  itemType:"Finished Product",
  businessLocation:"",
  hsnCode:"",
  alertQty:"", manageStock:true,
  description:"", weight:"", prepTime:"",
  tax:"None", sellingPriceTaxType:"Exclusive",
  productType:"Single",
  excTax:"", incTax:"",  margin:"", excTaxSell:"",
  openingStock:"", openingStockValue:"",
  image:null, imagePreview:null,
};
// ── Searchable Select Component ────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder = "Search or select...", disabled }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o =>
    (o.label || o).toLowerCase().includes(query.toLowerCase())
  );
  const selected = options.find(o => (o.value || o) === value);
  const displayLabel = selected ? (selected.label || selected) : "";

  const handleSelect = (opt) => {
    onChange(opt.value || opt);
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={ref} style={{ position:"relative", width:"100%" }}>
      <div
        onClick={() => !disabled && setOpen(v => !v)}
        style={{
          ...ss.box,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          background: "#fff",
        }}
      >
        {open ? (
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{ border:"none", outline:"none", width:"100%", fontSize:14, background:"transparent" }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span style={{ color: displayLabel ? "#222" : "#9ca3af", fontSize:14, flex:1 }}>
            {displayLabel || placeholder}
          </span>
        )}
        {displayLabel && !open && (
          <span onClick={handleClear} style={{ color:"#9ca3af", fontSize:16, cursor:"pointer", padding:"0 4px" }}>×</span>
        )}
        <span style={{ color:"#9ca3af", fontSize:11, marginLeft:4 }}>▾</span>
      </div>
      {open && (
        <div style={ss.dropdown}>
          {filtered.length === 0 ? (
            <div style={ss.noOpt}>No options found</div>
          ) : (
            filtered.map((opt, i) => {
              const val = opt.value || opt;
              const lbl = opt.label || opt;
              return (
                <div key={i} onClick={() => handleSelect(opt)}
                  style={{ ...ss.opt, background: val === value ? "#f0fdf4" : "transparent" }}>
                  {lbl}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const ss = {
  box:      { display:"flex", alignItems:"center", border:"1px solid #d1d5db", borderRadius:6, padding:"8px 10px", minHeight:38, boxSizing:"border-box" },
  dropdown: { position:"absolute", top:"110%", left:0, right:0, background:"#fff", border:"1px solid #d1d5db", borderRadius:6, boxShadow:"0 4px 12px rgba(0,0,0,0.12)", zIndex:300, maxHeight:220, overflowY:"auto" },
  noOpt:    { padding:"10px 14px", color:"#9ca3af", fontSize:13 },
  opt:      { padding:"9px 14px", cursor:"pointer", fontSize:14, color:"#222", borderBottom:"1px solid #f3f4f6" },
};

// ── Column Visibility Menu ─────────────────────────────────
function ColVisMenu({ cols, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const labels = { image:"Product Image", action:"Action", product:"Product", location:"Business Location", purchase:"Unit Purchase Price", selling:"Selling Price", stock:"Current Stock", type:"Product Type", category:"Category", brand:"Brand", tax:"Tax", sku:"SKU", status:"Status", supplier:"Default Supplier" };
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(v => !v)} style={tb.btn}>Column visibility</button>
      {open && (
        <div style={{ position:"absolute", right:0, top:"110%", background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 14px", zIndex:400, minWidth:180, boxShadow:"0 6px 20px rgba(0,0,0,0.12)" }}>
          {Object.keys(cols).map(k => (
            <label key={k} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", fontSize:13, cursor:"pointer" }}>
              <input type="checkbox" checked={cols[k]} onChange={e => onChange(k, e.target.checked)} style={{ accentColor:"#2d7a3a" }}/>
              {labels[k] || k}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Export helpers ─────────────────────────────────────────
const exportCSV = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const headers = ["Product Name","SKU","Unit","Brand","Category","Sub Category","Purchase Price","Selling Price","Current Stock","Product Type","Tax","Status"];
  const rows = products.map(p => [p.name,p.sku||"",p.unit||"",p.brand||"",p.category||"",p.sub_category||"",p.exc_tax||0,p.exc_tax_sell||0,p.current_stock??0,p.product_type,p.tax,p.status]);
  const csv = [headers,...rows].map(r => r.map(c => `"${String(c??'').replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}));
  a.download = "products.csv"; a.click();
};
const exportExcel = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const data = products.map(p => ({"Name":p.name,"SKU":p.sku||"","Unit":p.unit||"","Brand":p.brand||"","Category":p.category||"","Selling Price":p.exc_tax_sell||0,"Stock":p.current_stock??0,"Status":p.status||"Active"}));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = Object.keys(data[0]).map(k=>({wch:Math.max(k.length+2,16)}));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Products");
  XLSX.writeFile(wb,"products.xlsx");
};
const exportPDF = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const rows = products.map(p=>`<tr><td>${p.name}</td><td>${p.sku||""}</td><td>${p.unit||""}</td><td>${p.brand||""}</td><td>${p.category||""}</td><td>₹${p.exc_tax_sell||0}</td><td>${p.current_stock??0}</td><td>${p.status}</td></tr>`).join("");
  const win = window.open("","_blank");
  win.document.write(`<html><head><title>Products</title><style>body{font-family:sans-serif;font-size:11px;padding:16px}table{width:100%;border-collapse:collapse}th{background:#2d7a3a;color:#fff;padding:7px}td{padding:6px;border-bottom:1px solid #eee}tr:nth-child(even){background:#f9f9f9}</style></head><body>
    <h2>Products Report</h2><p>Generated: ${new Date().toLocaleString()}</p>
    <table><thead><tr><th>Product</th><th>SKU</th><th>Unit</th><th>Brand</th><th>Category</th><th>Selling Price</th><th>Stock</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
  win.document.close(); win.print();
};

// ═══════════════════════════════════════════════════════════
// ADD / EDIT PRODUCT FORM
// ═══════════════════════════════════════════════════════════
export function AddProductForm({ onSaved, editProduct }) {
  const navigate   = useNavigate();
  const fileRef    = useRef();
const [units,       setUnits]       = useState([]);
  const [brands,      setBrands]      = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [subCats,     setSubCats]     = useState([]);
  const [allCats,     setAllCats]     = useState([]);
  const [warranties,  setWarranties]  = useState([]);
  const [locations,   setLocations]   = useState([]);
const [variationTemplates, setVariationTemplates] = useState([]);
  const [saving,      setSaving]      = useState(false);
const initForm = editProduct ? {
    name:                editProduct.name || "",
    sku:                 editProduct.sku  || "",
    barcodeType:         editProduct.barcode_type || "Code 128 (C128)",
    unit:                editProduct.unit  || "",
    brand:               editProduct.brand || "",
    category:            editProduct.category || "",
    subCategory:         editProduct.sub_category || "",
    variationTemplate:   editProduct.variation_template || "",
    warranty:            editProduct.warranty || "",
itemType:            editProduct.item_type || "Finished Product",
  businessLocation:    editProduct.business_location || "",
    hsnCode:              editProduct.hsn_code || "",
    barcodeValue:         editProduct.barcode_value || "",
    batchNumber:          editProduct.batch_number || "",
    serialNumber:         editProduct.serial_number || "",
    alertQty:            editProduct.alert_qty ?? "",
    manageStock:         editProduct.manage_stock !== undefined ? editProduct.manage_stock : true,
    description:         editProduct.description || "",
    weight:               editProduct.weight ?? "",
    prepTime:             editProduct.prep_time ?? "",
    tax:                  editProduct.tax || "None",
    sellingPriceTaxType:  editProduct.selling_price_tax_type || "Exclusive",
    productType:          editProduct.product_type || "Single",
    excTax:               editProduct.exc_tax ?? "",
    incTax:               editProduct.inc_tax ?? "",
    margin:               editProduct.margin ?? "25.00",
    excTaxSell:            editProduct.exc_tax_sell ?? "",
    openingStock:          editProduct.current_stock ?? "",
    openingStockValue:     "",
    image:                 null,
    imagePreview:          editProduct.image_url || null,
    _skuManual:            true,
  } : EMPTY_FORM;
const [form, setForm] = useState(initForm);


  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  console.log("DEBUG editProduct.warranty:", editProduct?.warranty, "| full editProduct:", editProduct);

  console.log("DEBUG editProduct.warranty:", editProduct?.warranty, "| full editProduct:", editProduct);

  // ── Group Pricing state ──
// NEW
  const [priceGroups, setPriceGroups] = useState([]);
  const [groupPrices, setGroupPrices] = useState({}); // { [groupId]: "price string" }

  // NEW — General Settings integration (additive only, all safely defaulted)
  const [genSettings, setGenSettings] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await getGeneralSettings();
        if (res.success && res.data) setGenSettings(res.data);
      } catch (e) { console.error("General settings load error:", e.message); }
    })();
  }, []);
const pd = {
    defaultUnit: genSettings?.default_unit,
    defaultCategory: genSettings?.default_category,
    defaultTax: genSettings?.default_tax,
    barcode: genSettings?.barcode_enabled,
    batchTracking: genSettings?.batch_tracking_enabled,
    serialTracking: genSettings?.serial_tracking_enabled,
    manufacturingDate: genSettings?.manufacturing_date_enabled,
    expiryDate: genSettings?.expiry_date_enabled,
    productImages: genSettings?.product_images_enabled,
    productVariants: genSettings?.product_variants_enabled,
  };
// NEW — dynamic industry-specific fields (Gold Purity, VIN, Wood Type, etc.)
  const industryFields = genSettings?.industry_fields || {};
  const activeIndustryFieldKeys = Object.keys(industryFields).filter(k => industryFields[k]);
  const [customFieldValues, setCustomFieldValues] = useState(editProduct?.custom_fields || {});
  const setCF = (k, v) => setCustomFieldValues(c => ({ ...c, [k]: v }));
  // Auto-populate Default Unit / Default Category for NEW products only,
  // and only if the admin hasn't already typed something in.
useEffect(() => {
    if (editProduct) return;
    if (pd.defaultUnit && !form.unit && units.some(u => u.value === pd.defaultUnit)) set("unit", pd.defaultUnit);
    if (pd.defaultCategory && !form.category && categories.some(c => c.value === pd.defaultCategory)) set("category", pd.defaultCategory);
    if (pd.defaultTax && form.tax === "None") set("tax", pd.defaultTax);
  }, [genSettings, units, categories]);
const gpBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const gpAuthHeaders = () => {
    const token = localStorage.getItem("manod_token");
    const industryId = localStorage.getItem("manod_active_industry_id");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(industryId ? { "X-Industry-Id": industryId } : {}),
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${gpBase}/selling-price-groups?limit=100`, { headers: gpAuthHeaders() });
        const data = await res.json();
        setPriceGroups(data.groups || []);

        if (editProduct) {
          const pRes  = await fetch(`${gpBase}/product-selling-prices/${editProduct.id}`, { headers: gpAuthHeaders() });
          const pData = await pRes.json();
          const map = {};
          (pData.prices || []).forEach(pr => { map[pr.selling_price_group_id] = String(pr.selling_price); });
          setGroupPrices(map);
        }
      } catch (e) { console.error("Price group load error:", e.message); }
    })();
  }, [editProduct]);

  const computeSuggested = (group) => {
    const base = parseFloat(form.excTaxSell) || 0;
    if (!base) return "";
    const pct = parseFloat(group.percentage) || 0;
    const val = group.type === "Markup" ? base * (1 + pct / 100) : base * (1 - pct / 100);
    return val.toFixed(2);
  };

  // Auto-generate SKU when name changes (only for new products)
  useEffect(() => {
    if (!editProduct && form.name && !form._skuManual) {
      set("sku", genSKU(form.name));
    }
  }, [form.name]);
// Auto-calculate Inc. tax from Exc. tax + selected GST%
  useEffect(() => {
    const exc = parseFloat(form.excTax);
    const gstMatch = (form.tax || "").match(/(\d+(\.\d+)?)/);
    const gstPct = gstMatch ? parseFloat(gstMatch[1]) : 0;
    if (!isNaN(exc) && exc > 0) {
      const inc = (exc * (1 + gstPct / 100)).toFixed(2);
      setForm(f => ({ ...f, incTax: inc }));
    } else {
      setForm(f => ({ ...f, incTax: "" }));
    }
  }, [form.excTax, form.tax]);

  // Auto-calculate selling price from purchase + margin
  useEffect(() => {
    const exc = parseFloat(form.excTax);
    const mar = parseFloat(form.margin);
    if (!isNaN(exc) && !isNaN(mar) && exc > 0) {
      const sell = (exc * (1 + mar / 100)).toFixed(2);
      setForm(f => ({ ...f, excTaxSell: sell }));
    }
  }, [form.excTax, form.margin]);
  // Auto-calculate opening stock value (qty × purchase price)
  useEffect(() => {
    const qty   = parseFloat(form.openingStock);
    const price = parseFloat(form.excTax);
    if (!isNaN(qty) && !isNaN(price) && qty >= 0 && price >= 0) {
      setForm(f => ({ ...f, openingStockValue: (qty * price).toFixed(2) }));
    } else {
      setForm(f => ({ ...f, openingStockValue: "" }));
    }
  }, [form.openingStock, form.excTax]);

// Auto-fill HSN Code from the selected category's default — fully locked, no manual override
  useEffect(() => {
    if (!form.category) { set("hsnCode", ""); return; }
    const cat = allCats.find(c => c.name === form.category);
    set("hsnCode", cat?.default_hsn_code || "");
  }, [form.category, allCats]);
 // Load dropdowns — each isolated so one failure can't block the others
  useEffect(() => {
    (async () => {
   try {
        const u = await unitsAPI.getAll({ limit:200 });
        setUnits((u.units||[]).map(x => ({ value: x.name, label: x.short_name ? `${x.name} (${x.short_name})` : x.name })));
      } catch (e) { console.error("Units load error:", e.message); }

 try {
        const b = await brandsAPI.getAll({ limit:200 });
        setBrands((b.brands||[]).map(x => ({ value: x.name, label: x.name })));
      } catch (e) { console.error("Brands load error:", e.message); }

      try {
  const c = await categoriesAPI.getAll({ limit:500 });
  const allC = c.categories||[];
  setAllCats(allC);
  // Show ALL categories in the main Category dropdown
  setCategories(allC.map(x => ({ value: x.name, label: x.name })));
  setSubCats(allC.filter(x => !!x.parent_id).map(x => ({ value: x.name, label: x.name })));
} catch (e) { console.error("Categories load error:", e.message); }

     try {
        const vt = await variationsAPI.getAll({ limit:200 });
     setVariationTemplates((vt.variations||[]).map(x => ({ value: x.name, label: `${x.name} (${(x.values||[]).map(val=>val.value||val).join(", ")})` })));
        console.log("editProduct raw:", JSON.stringify(editProduct));
        console.log("form.variationTemplate:", JSON.stringify(form.variationTemplate));
        console.log("variationTemplates options:", (vt.variations||[]).map(x => x.name));
      } catch (e) { console.error("Variations load error:", e.message); }

 try {
  const wRes = await fetch(`${gpBase}/products/warranties?limit=200`, { headers: gpAuthHeaders() });
  const w = await wRes.json();
  if (!wRes.ok) throw new Error(w.error || "Failed to load warranties");
  let list = (w.warranties||[]).map(x => ({ value: x.name, label: `${x.name} (${x.duration} ${x.duration_type})` }));
  if (editProduct?.warranty && !list.some(o => o.value === editProduct.warranty)) {
    list = [{ value: editProduct.warranty, label: editProduct.warranty }, ...list];
  }
  setWarranties(list);
  if (editProduct?.warranty) {
    setForm(f => ({ ...f, warranty: editProduct.warranty }));
  }
// NEW
} catch (e) { console.error("Warranties load error:", e.message); }

try {
    const locRes = await getLocations();
    const list = (locRes.data || []).map(x => ({ id: x.id, name: x.location_name }));
    setLocations(list);
    if (!editProduct && list.length) {
      setForm(f => ({ ...f, businessLocation: f.businessLocation || list[0].name }));
    }
  } catch (e) { console.error("Locations load error:", e.message); }

  try {
    if (!editProduct) {
      const bsRes = await getBusinessSettings();
      const defaultMargin = bsRes?.data?.profit_percent;
      if (defaultMargin != null) {
        setForm(f => ({ ...f, margin: f.margin || String(defaultMargin) }));
      }
    }
  } catch (e) { console.error("Default profit % load error:", e.message); }
    })();
  }, []);

  // Filter sub-cats when category changes
 const filteredSubCats = form.category
    ? (() => {
        const parent = allCats.find(c => c.name === form.category && !c.parent_id);
        const list = parent
          ? allCats.filter(c => c.parent_id === parent.id).map(c => ({ value:c.name, label:c.name }))
          : subCats;
        // Keep the current value visible even if it hasn't loaded into the filtered list yet
        if (form.subCategory && !list.some(o => o.value === form.subCategory)) {
          return [{ value: form.subCategory, label: form.subCategory }, ...list];
        }
        return list;
      })()
    : subCats;

  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    set("image", file);
    const r = new FileReader(); r.onload = ev => set("imagePreview", ev.target.result); r.readAsDataURL(file);
  };

  const save = async (andNew = false) => {
   if (!form.name.trim()) { alert("Product Name is required"); return; }
    if (!form.unit)        { alert("Unit is required"); return; }
    if (form.productType === "Variable" && !form.variationTemplate) { alert("Please select a Variation for a Variable product"); return; }
    setSaving(true);
    try {
    const payload = {
        name:                   form.name,
        sku:                    form.sku || genSKU(form.name),
        barcode_type:           form.barcodeType,
        unit:                   form.unit,
        brand:                  form.brand || null,
      category:               form.category || null,
       sub_category:           form.subCategory || null,
        variation_template:     form.variationTemplate || null,
     business_location:      form.businessLocation,
        warranty:               form.warranty || null,
        item_type:              form.itemType || "Finished Product",
    hsn_code:                form.hsnCode || null,
        barcode_value:           form.barcodeValue || null,
        batch_number:            form.batchNumber || null,
        serial_number:           form.serialNumber || null,
        alert_qty:              form.alertQty || 0,
        manage_stock:           form.manageStock,
        description:            form.description || null,
        weight:                 form.weight || null,
        prep_time:              form.prepTime || null,
        tax:                    form.tax,
        selling_price_tax_type: form.sellingPriceTaxType,
        product_type:           form.productType,
        exc_tax:                form.excTax || 0,
        inc_tax:                form.incTax || 0,
        margin:                 form.margin || 0,
exc_tax_sell:           form.excTaxSell || 0,
      opening_stock:          form.openingStock !== undefined && form.openingStock !== null && form.openingStock !== "" ? parseInt(form.openingStock) : 0,
        status:                 "Active",
        image:                  form.imagePreview || null,
        custom_fields:          customFieldValues,
      };
    let savedProductId = editProduct?.id;
      if (editProduct) {
        await productsAPI.update(editProduct.id, payload);
      } else {
        const created = await productsAPI.create(payload);
        savedProductId = created?.product?.id;
      }

      // Save per-group prices (only entries the user actually filled in)
      const priceEntries = Object.entries(groupPrices)
        .filter(([, val]) => val !== "" && val !== null && val !== undefined)
        .map(([groupId, val]) => ({ selling_price_group_id: parseInt(groupId), selling_price: parseFloat(val) }));

      if (savedProductId && priceEntries.length) {
        try {
          await fetch(`${gpBase}/product-selling-prices/${savedProductId}`, {
            method: "PUT", headers: gpAuthHeaders(),
            body: JSON.stringify({ prices: priceEntries })
          });
        } catch (e) { console.error("Failed to save group prices:", e.message); }
      }

      if (onSaved) { onSaved(); return; }
      if (andNew)  setForm({ ...EMPTY_FORM, sku: "" });
      else         navigate("/products/");

    } catch (err) { alert(err.message || "Failed to save product"); }
    finally { setSaving(false); }
  };

  return (
    <div style={f.page}>
      <div style={f.card}>
        <h3 style={f.sec}>Product Details</h3>

        <div style={f.row3}>
          {/* Product Name */}
          <div style={f.field}>
            <label style={f.lbl}>Product Name *</label>
            <input style={f.inp} placeholder="" value={form.name}
              onChange={e => set("name", e.target.value)}/>
          </div>

          {/* SKU - auto-generated with refresh button */}
          <div style={f.field}>
            <label style={f.lbl}>
              SKU
              <span style={f.hint} title="Auto-generated from product name. Click ↻ to regenerate.">ⓘ</span>
            </label>
            <div style={{ display:"flex", gap:6 }}>
              <input style={{ ...f.inp, flex:1 }} value={form.sku}
                onChange={e => { set("sku", e.target.value); set("_skuManual", true); }}
                placeholder="Auto-generated"/>
              <button onClick={() => { set("sku", genSKU(form.name)); set("_skuManual", false); }}
                title="Regenerate SKU"
                style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:6, cursor:"pointer", background:"#f9fafb", fontSize:16 }}>↻</button>
            </div>
          </div>

          {/* Barcode Type */}
          <div style={f.field}>
            <label style={f.lbl}>Barcode Type *</label>
            <select style={f.inp} value={form.barcodeType} onChange={e => set("barcodeType", e.target.value)}>
              {BARCODE_TYPES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

 {/* Barcode field only shown if General Settings → Product Defaults → Barcode is enabled */}
        {pd.barcode && (
          <div style={f.row3}>
            <div style={f.field}>
              <label style={f.lbl}>Barcode</label>
              <input style={f.inp} placeholder="Scan or enter barcode" value={form.barcodeValue || ""}
                onChange={e => set("barcodeValue", e.target.value)} />
            </div>
          </div>
        )}

        {/* NEW — Batch / Serial fields, shown only when enabled in General Settings */}
         {(pd.batchTracking || pd.serialTracking) && (
          <div style={f.row3}>
            {pd.batchTracking && (
              <div style={f.field}>
                <label style={f.lbl}>Batch Number</label>
                <input style={f.inp} placeholder="e.g. BATCH-2026-001" value={form.batchNumber || ""}
                  onChange={e => set("batchNumber", e.target.value)} />
              </div>
            )}
            {pd.serialTracking && (
              <div style={f.field}>
                <label style={f.lbl}>Serial Number</label>
                <input style={f.inp} placeholder="e.g. SN-000123" value={form.serialNumber || ""}
                  onChange={e => set("serialNumber", e.target.value)} />
              </div>
            )}
          </div>
        )}

        {/* NEW — Industry-specific fields, driven by General Settings → Industry Type */}
        {activeIndustryFieldKeys.length > 0 && (
          <div style={f.row3}>
            {activeIndustryFieldKeys.map(key => (
              <div style={f.field} key={key}>
                <label style={f.lbl}>{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</label>
                <input style={f.inp} value={customFieldValues[key] || ""} onChange={e => setCF(key, e.target.value)} />
              </div>
            ))}
          </div>
        )}

        <div style={f.row3}>
          {/* Unit - searchable */}
          <div style={f.field}>
            <label style={f.lbl}>Unit *</label>
            <SearchableSelect options={units} value={form.unit} onChange={v => set("unit", v)} placeholder="Search unit..."/>
          </div>

          {/* Brand - searchable */}
          <div style={f.field}>
            <label style={f.lbl}>Brand</label>
            <SearchableSelect options={brands} value={form.brand} onChange={v => set("brand", v)} placeholder="Search brand..."/>
          </div>

          {/* Category - searchable */}
          <div style={f.field}>
            <label style={f.lbl}>Category</label>
     <SearchableSelect options={categories} value={form.category}
              onChange={v => { set("category", v); set("subCategory", ""); set("hsnCode", ""); }}
              placeholder="Search category..."/>
          </div>
        </div>

        <div style={f.row3}>
          {/* Sub Category - filtered by selected category */}
          <div style={f.field}>
            <label style={f.lbl}>
              Sub Category
              <span style={f.hint} title="Select a category first to filter sub-categories">ⓘ</span>
            </label>
            <SearchableSelect options={filteredSubCats} value={form.subCategory}
              onChange={v => set("subCategory", v)} placeholder="Search sub-category..."/>
          </div>

          {/* Business Location - dropdown */}
          <div style={f.field}>
            <label style={f.lbl}>Business Locations</label>
            <div style={f.locBox}>
        
              <select value={form.businessLocation} onChange={e => set("businessLocation", e.target.value)}
                style={{ border:"none", background:"transparent", outline:"none", fontSize:14, width:"100%", cursor:"pointer" }}>
                {locations.length === 0 && <option value="">Loading locations...</option>}
                {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* Alert Quantity */}
          <div style={f.field}>
            <label style={f.lbl}>Alert Quantity</label>
            <input style={f.inp} placeholder="e.g. 10" type="number" min="0"
              value={form.alertQty} onChange={e => set("alertQty", e.target.value)}/>
          </div>
        </div>

<div style={f.row3}>
          <div style={f.field}>
            <label style={f.lbl}>
              Warranty
              <span style={f.hint} title="Link a warranty policy to this product">ⓘ</span>
            </label>
            <SearchableSelect options={warranties} value={form.warranty}
              onChange={v => set("warranty", v)} placeholder="Search warranty..."/>
          </div>
          <div style={f.field}>
            <label style={f.lbl}>
              Item Type *
              <span style={f.hint} title="Determines whether this product can be used as a BOM component or is a finished product">ⓘ</span>
            </label>
            <select style={f.inp} value={form.itemType} onChange={e => set("itemType", e.target.value)}>
              {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
  <div style={f.field}>
            <label style={f.lbl}>
              HSN/SAC Code
              <span style={f.hint} title="Auto-filled from the selected category's default HSN code. Set the default on the category to change it.">ⓘ</span>
            </label>
            <input style={{ ...f.inp, background:"#f0fdf4" }} placeholder="Select a category to auto-fill"
              value={form.hsnCode} disabled/>
          </div>
        </div>  

        <div style={f.row1}>
          <label style={f.checkRow}>
            <input type="checkbox" checked={form.manageStock} onChange={e => set("manageStock", e.target.checked)}
              style={{ accentColor:"#2d7a3a", width:16, height:16 }}/>
            <span style={{ fontWeight:600, color:"#374151" }}>Manage Stock?</span>
            <span style={{ color:"#9ca3af", fontSize:12, marginLeft:6 }}>Enable stock management at product level</span>
          </label>
        </div>

        <div style={f.row2}>
          <div style={f.field}>
            <label style={f.lbl}>Product Description</label>
            <textarea style={{ ...f.inp, height:100, resize:"vertical" }}
              placeholder="Enter product description..." value={form.description}
              onChange={e => set("description", e.target.value)}/>
          </div>
       {pd.productImages !== false && (
          <div style={f.field}>
            <label style={f.lbl}>Product Image</label>
            <div style={f.imgBox}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="preview" style={{ width:80, height:80, objectFit:"cover", borderRadius:8, border:"1px solid #e5e7eb" }}/>
                : <div style={f.imgEmpty}>No image</div>}
              <button onClick={() => fileRef.current.click()} style={f.browseBtn}>Browse...</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImage}/>
              <span style={{ fontSize:11, color:"#9ca3af" }}>Max 5MB · 1:1 ratio</span>
            </div>
          </div>
          )}
        </div>


        <div style={f.row2}>
          <div style={f.field}>
            <label style={f.lbl}>Weight (kg)</label>
            <input style={f.inp} placeholder="e.g. 0.5" type="number" value={form.weight} onChange={e => set("weight", e.target.value)}/>
          </div>
          <div style={f.field}>
            <label style={f.lbl}>Preparation Time (minutes)</label>
            <input style={f.inp} placeholder="e.g. 15" type="number" value={form.prepTime} onChange={e => set("prepTime", e.target.value)}/>
          </div>
        </div>

        {/* NEW — Manufacturing Date / Expiry Date, shown only if enabled in General Settings */}
     {(pd.manufacturingDate || pd.expiryDate) && (
          <div style={f.row2}>
            {pd.manufacturingDate && (
              <div style={f.field}>
                <label style={f.lbl}>Manufacturing Date</label>
                <input style={f.inp} type="date" value={form.manufacturingDate || ""} onChange={e => set("manufacturingDate", e.target.value)}/>
              </div>
            )}
            {pd.expiryDate && (
              <div style={f.field}>
                <label style={f.lbl}>Expiry Date</label>
                <input style={f.inp} type="date" value={form.expiryDate || ""} onChange={e => set("expiryDate", e.target.value)}/>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricing Card */}
      <div style={f.card}>
        <h3 style={f.sec}>Pricing & Tax</h3>
        <div style={f.row2}>
          <div style={f.field}>
            <label style={f.lbl}>Applicable Tax</label>
            <select style={f.inp} value={form.tax} onChange={e => set("tax", e.target.value)}>
              {TAXES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={f.field}>
            <label style={f.lbl}>Selling Price Tax Type *</label>
            <select style={f.inp} value={form.sellingPriceTaxType} onChange={e => set("sellingPriceTaxType", e.target.value)}>
              {TAX_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
       <div style={f.row2}>
          <div style={f.field}>
            <label style={f.lbl}>Product Type *</label>
            <select style={f.inp} value={form.productType} onChange={e => set("productType", e.target.value)}>
              {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
       
          {form.productType === "Variable" && (
            <div style={f.field}>
              <label style={f.lbl}>Variation *</label>
              <SearchableSelect options={variationTemplates} value={form.variationTemplate}
                onChange={v => set("variationTemplate", v)} placeholder="Search variation..."/>
            </div>
          )}
        </div>

          {/* Product Variants section, only shown if enabled in General Settings */}
        {pd.productVariants && form.productType !== "Variable" && (
          <div style={{ background: "#f8fdf9", border: "1px dashed #1a6b3c", borderRadius: 8, padding: "10px 16px", marginTop: 12, fontSize: 12.5, color: "#1a6b3c" }}>
            ℹ️ Product Variants is enabled in General Settings. Set Product Type to "Variable" above to configure variants for this product.
          </div>
        )}

        {/* Pricing table */}
        <div style={f.pricingWrap}>
          <div style={f.pricingHead}>
            <div>Default Purchase Price</div>
            <div>× Margin (%)</div>
            <div>Default Selling Price</div>
            <div>Product Image</div>
          </div>
          <div style={f.pricingBody}>
            <div style={f.pricingCol}>
              <label style={f.priceLbl}>
                Exc. tax * 
                <span style={f.hint} title="Purchase price excluding tax (what you pay to supplier)">ⓘ</span>
              </label>
              <input style={f.inp} placeholder="0.00" type="number" value={form.excTax}
                onChange={e => set("excTax", e.target.value)}/>
            <label style={{ ...f.priceLbl, marginTop:10 }}>
                Inc. tax
                <span style={f.hint} title="Auto-calculated: Exc. tax + selected GST%">ⓘ</span>
              </label>
              <input style={{ ...f.inp, background:"#f0fdf4" }} placeholder="0.00" type="number" value={form.incTax} disabled/>
            </div>
            <div style={f.pricingCol}>
              <label style={f.priceLbl}>Margin %</label>
              <input style={f.inp} type="number" value={form.margin}
                onChange={e => set("margin", e.target.value)} placeholder="25.00"/>
            </div>
            <div style={f.pricingCol}>
              <label style={f.priceLbl}>
                Exc. Tax (Selling)
                <span style={f.hint} title="Selling price excluding tax (auto-calculated from purchase + margin)">ⓘ</span>
              </label>
              <input style={{ ...f.inp, background:"#f0fdf4" }} placeholder="0.00" type="number" value={form.excTaxSell}
                onChange={e => set("excTaxSell", e.target.value)}/>
            </div>
            <div style={f.pricingCol}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="" style={{ width:70, height:70, objectFit:"cover", borderRadius:6 }}/>
                : <span style={{ color:"#d1d5db", fontSize:12 }}>No image</span>}
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>Max 5MB · 1:1</div>
            </div>
          </div>
     </div>

       <div style={{ ...f.row2, maxWidth:640, marginTop:20 }}>
          <div style={f.field}>
            <label style={f.lbl}>
              Opening Stock (Qty)
              <span style={f.hint} title="Initial quantity available for this product. This becomes the starting Current Stock and feeds the Stock Report.">ⓘ</span>
            </label>
            <input style={f.inp} type="number" min="0" placeholder="e.g. 20"
              value={form.openingStock} onChange={e => set("openingStock", e.target.value)}/>
          </div>
         <div style={f.field}>
            <label style={f.lbl}>
              Opening Stock Value (₹)
              <span style={f.hint} title="Auto-calculated: Opening Stock × Purchase Price (Exc. tax)">ⓘ</span>
            </label>
            <input style={{ ...f.inp, background:"#f0fdf4" }} disabled
              value={form.openingStockValue ? `₹${Number(form.openingStockValue).toLocaleString("en-IN")}` : "₹0.00"}/>
          </div>
        </div>

        {priceGroups.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 10 }}>
              Group Pricing <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 12 }}>(optional — leave blank to use default selling price)</span>
            </h4>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign:"left", padding:"9px 12px", fontWeight:600, color:"#374151" }}>Group</th>
                    <th style={{ textAlign:"left", padding:"9px 12px", fontWeight:600, color:"#374151" }}>Type</th>
                    <th style={{ textAlign:"left", padding:"9px 12px", fontWeight:600, color:"#374151" }}>Suggested</th>
                    <th style={{ textAlign:"left", padding:"9px 12px", fontWeight:600, color:"#374151" }}>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {priceGroups.map(g => (
                    <tr key={g.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding:"9px 12px", fontWeight:600 }}>{g.name}{g.is_default ? " ★" : ""}</td>
                      <td style={{ padding:"9px 12px" }}>
                        <span style={{ background: g.type==="Discount"?"#fee2e2":"#dbeafe", color: g.type==="Discount"?"#dc2626":"#1d4ed8", borderRadius:20, padding:"2px 10px", fontSize:11 }}>
                          {g.type} {g.percentage}%
                        </span>
                      </td>
                      <td style={{ padding:"9px 12px", color:"#9ca3af" }}>
                        {computeSuggested(g) ? `₹${computeSuggested(g)}` : "—"}
                      </td>
                      <td style={{ padding:"9px 12px" }}>
                        <input
                          type="number" placeholder={computeSuggested(g) || "0.00"}
                          value={groupPrices[g.id] ?? ""}
                          onChange={e => setGroupPrices(gp => ({ ...gp, [g.id]: e.target.value }))}
                          style={{ ...f.inp, maxWidth: 140 }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div style={f.footer}>
        <button disabled={saving} onClick={() => save(false)}
          style={{ ...f.btnDark, opacity: saving?0.7:1 }}>
          {saving ? "Saving..." : "Save & Add Opening Stock"}
        </button>
        <button disabled={saving} onClick={() => save(true)}
          style={{ ...f.btnGreen, opacity: saving?0.7:1 }}>
          {saving ? "Saving..." : "Save And Add Another"}
        </button>
        <button disabled={saving} onClick={() => save(false)}
          style={{ ...f.btnGreenDark, opacity: saving?0.7:1 }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export function AddProductPage() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 style={{ margin:"0 0 20px", fontSize:26, fontWeight:700, color:"#1a1a2e" }}>Add New Product</h1>
      <AddProductForm onSaved={() => navigate("/products/")}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LIST PRODUCTS
// ═══════════════════════════════════════════════════════════
export default function ListProducts() {
  const navigate = useNavigate();
  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search,      setSearch]      = useState("");
  const [perPage,     setPerPage]     = useState(25);   
  const [page,        setPage]        = useState(1);
  const [selected,    setSelected]    = useState([]);
  const [activeTab,   setActiveTab]   = useState("all");
 const [editProduct, setEditProduct] = useState(null);
const [showEdit,    setShowEdit]    = useState(false);
const [viewProduct, setViewProduct] = useState(null);
const [showView,    setShowView]    = useState(false);
const [viewStockLocations, setViewStockLocations] = useState([]);
const [viewStockLoading,   setViewStockLoading]   = useState(false);
 const [cols, setCols] = useState({
    image:false, action:true, product:true, location:false,
    purchase:true, selling:true, stock:true, type:false,
    category:false, brand:false, tax:false, sku:true, status:true,
    supplier:true
  });
  // Filters
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand,    setFilterBrand]    = useState("");
  const [showFilters,    setShowFilters]    = useState(false);
  const [categories,     setCategories]     = useState([]);
  const [brands,         setBrands]         = useState([]);

 const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
    const params = {
        page, limit: perPage,
        search: search || undefined,
        status: filterStatus || undefined,
        category_id: filterCategory || undefined,
        brand_id: filterBrand || undefined,
      };
      const res = await productsAPI.getAll(params);
      setProducts(res.products || []);
      setTotal(res.total ?? (res.products ? res.products.length : 0));
    } catch (e) {
      setError(e.message || "Failed to load products");
      setProducts([]); setTotal(0);
    }
    setLoading(false);
  }, [page, perPage, search, filterStatus, filterCategory, filterBrand]);

  useEffect(() => { load(); }, [load]);

  // Real filter dropdowns
  useEffect(() => {
    (async () => {
      try {
        const [c, b] = await Promise.all([
          categoriesAPI.getAll({ limit:500 }),
          brandsAPI.getAll({ limit:200 }),
        ]);
    setCategories((c.categories||[]).filter(x=>!x.parent_id).map(x=>({ id:x.id, name:x.name })));
        setBrands((b.brands||[]).map(x=>({ id:x.id, name:x.name })));
      } catch (e) { console.error("Filter dropdown load error:", e.message); }
    })();
  }, []);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const toggleAll    = ()   => setSelected(selected.length === products.length && products.length > 0 ? [] : products.map(p=>p.id));
const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await productsAPI.delete(id);
      await load();
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("foreign key constraint") || msg.includes("violates")) {
        const wantsDeactivate = window.confirm(
          "This product can't be deleted because it's used in stock adjustment history.\n\nWould you like to mark it as Inactive instead? (Keeps history intact, hides it from active use)"
        );
        if (wantsDeactivate) {
          try {
            await productsAPI.update(id, { status: "Inactive" });
            await load();
          } catch (e2) { alert(e2.message || "Failed to deactivate product"); }
        }
      } else {
        alert(msg || "Failed to delete product");
      }
    }
  };
const handleDeleteSelected = async () => {
    if (!selected.length) { alert("Select at least one product"); return; }
    if (!window.confirm(`This will permanently delete ${selected.length} product(s). This cannot be undone. Continue?`)) return;
    try {
      await Promise.all(selected.map(id => productsAPI.delete(id)));
      setSelected([]);
      await load();
    } catch (e) { alert(e.message || "Failed to delete selected products"); }
  };

  const handleDeactivate = async () => {
    if (!selected.length) { alert("Select at least one product"); return; }
    try {
      await Promise.all(selected.map(id => productsAPI.update(id, { status:"Inactive" })));
      setSelected([]);
      await load();
    } catch (e) { alert(e.message || "Failed to deactivate selected products"); }
  };

  // ── Request Reorder — sends a PO-style email to the last supplier ──
  const handleRequestReorder = async (product) => {
    const qty = window.prompt(`How many units of "${product.name}" do you want to reorder?`);
    if (!qty || Number(qty) <= 0) return;

    const token = localStorage.getItem("manod_token");
    try {
      const res = await fetch(`http://localhost:5000/api/products/${product.id}/request-reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ quantity: Number(qty) }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Reorder request for ${qty} units sent to the supplier.`);
      } else {
        alert(`Could not send reorder request: ${data.error}`);
      }
    } catch (e) {
      alert(`Failed to send reorder request: ${e.message}`);
    }
  };

const stockColor = (qty, alertQty) => {
    const threshold = Number(alertQty) > 0 ? Number(alertQty) : 10;
    if (qty <= 0) return { bg:"#fee2e2", color:"#991b1b", label:"Out of Stock" };
    if (qty <= threshold) return { bg:"#fef3c7", color:"#92400e", label:"Low Stock" };
    return { bg:"#d1fae5", color:"#065f46", label:null };
  };

  const from = products.length === 0 ? 0 : (page-1)*perPage+1;
  const to   = (page-1)*perPage+products.length;

 const activeCount   = products.filter(pr => (pr.status||"Active")==="Active").length;
  const lowStockCount = products.filter(pr => (pr.current_stock??0) > 0 && (pr.current_stock??0) <= (Number(pr.alert_qty)>0?Number(pr.alert_qty):10)).length;
  const outOfStockCount = products.filter(pr => (pr.current_stock??0) <= 0).length;
  const totalStockValue = products.reduce((s,pr)=> s + (Number(pr.exc_tax)||0) * (Number(pr.current_stock)||0), 0);

  const statCards = [
    { label:"TOTAL PRODUCTS", value: total, sub:`${activeCount} active`, color:"#15803d" },
    { label:"STOCK VALUE", value:`₹${totalStockValue.toLocaleString("en-IN",{maximumFractionDigits:0})}`, sub:`${products.length} on this page`, color:"#1d4ed8" },
    { label:"ACTIVE", value: activeCount, sub:"in catalog", color:"#7c3aed" },
    { label:"LOW STOCK", value: lowStockCount, sub:"needs reorder", color:"#c2410c" },
    { label:"OUT OF STOCK", value: outOfStockCount, sub:"unavailable", color:"#b91c1c" },
  ];

  return (
    <div style={p.page}>
      {/* Header */}
      <div style={p.titleRow}>
        <div>
          <h1 style={p.title}>All Products</h1>
          <div style={p.breadcrumb}>Home / Products / List</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => navigate("/products/create")} style={p.btnAdd}>＋ Add Product</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={p.statGrid}>
        {statCards.map(({label,value,sub,color}) => (
          <div key={label} style={{...p.statCard, borderLeft:`4px solid ${color}`}}>
            <div style={p.statLabel}>{label}</div>
            <div style={p.statValue}>{value}</div>
            <div style={p.statSub}>{sub}</div>
          </div>
        ))}
      </div>

      {error && <div style={p.errBanner}>{error} <button onClick={load} style={p.retryBtn}>Retry</button></div>}

      {/* Filters panel */}
      <div style={p.filtersCard}>
        <div style={p.filtersHeader} onClick={() => setShowFilters(v=>!v)}>
          <span style={{ color:"#2d7a3a", fontWeight:600, fontSize:14 }}>⚙ Filters</span>
          <span style={{ color:"#2d7a3a", fontSize:18 }}>{showFilters?"▲":"▼"}</span>
        </div>
        {showFilters && (
          <div style={p.filtersBody}>
            <div style={p.filterRow}>
              <div style={p.filterField}>
                <label style={p.filterLbl}>Status</label>
                <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);}} style={p.filterInp}>
                  <option value="">All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div style={p.filterField}>
                <label style={p.filterLbl}>Category</label>
                <select value={filterCategory} onChange={e=>{setFilterCategory(e.target.value);setPage(1);}} style={p.filterInp}>
                  <option value="">All Categories</option>
                  {categories.filter(c=>!c.parent_id).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={p.filterField}>
                <label style={p.filterLbl}>Brand</label>
                <select value={filterBrand} onChange={e=>{setFilterBrand(e.target.value);setPage(1);}} style={p.filterInp}>
                  <option value="">All Brands</option>
                  {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={p.filterField}>
                <button onClick={()=>{setFilterStatus("");setFilterCategory("");setFilterBrand("");setPage(1);}} style={p.clearBtn}>Clear Filters</button>
              </div>
            </div>
          </div>
        )}
      </div>

     {/* Tabs */}
      <div style={p.tabRow}>
        {[{k:"all",l:"All Products"}].map(t=>(
          <button key={t.k} onClick={()=>setActiveTab(t.k)}
            style={{...p.tab,...(activeTab===t.k?p.tabActive:{})}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={p.toolbar}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, color:"#555" }}>Show</span>
          <select value={perPage} onChange={e=>{setPerPage(+e.target.value);setPage(1);}} style={tb.select}>
            {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
          </select>
          <span style={{ fontSize:13, color:"#555" }}>entries</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <button onClick={()=>exportCSV(products)}   style={{...tb.btn,...tb.csvBtn}}><span style={tb.csvIco}>CSV</span>Export CSV</button>
          <button onClick={()=>exportExcel(products)} style={{...tb.btn,...tb.xlsBtn}}><span style={tb.xlsIco}>XLS</span>Export Excel</button>
          <button onClick={()=>exportPDF(products)}   style={tb.btn}>Print</button>
          <ColVisMenu cols={cols} onChange={(k,v) => setCols(c=>({...c,[k]:v}))} />
          <button onClick={()=>exportPDF(products)}   style={{...tb.btn,...tb.pdfBtn}}><span style={tb.pdfIco}>PDF</span>Export PDF</button>
<input value={searchInput}
            onChange={e=>setSearchInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"){ setSearch(searchInput); setPage(1); } }}
            placeholder="Search ..." style={tb.search}/>
        </div>
      </div>

      {/* Table */}
      <div style={p.tableWrap}>
        <table style={p.table}>
          <thead>
            <tr style={p.thead}>
<th style={p.th}><input type="checkbox" checked={selected.length===products.length&&products.length>0} onChange={toggleAll} style={{ accentColor:"#2d7a3a" }}/></th>
  {cols.product  && <th style={p.th}>Product</th>}
  {cols.location && <th style={p.th}>Business Location</th>}
  {cols.purchase && <th style={p.th}>Unit Purchase Price</th>}
  {cols.selling  && <th style={p.th}>Selling Price</th>}
  {cols.stock    && <th style={p.th}>Current Stock</th>}
  {cols.type     && <th style={p.th}>Product Type</th>}
  {cols.category && <th style={p.th}>Category</th>}
  {cols.brand    && <th style={p.th}>Brand</th>}
  {cols.tax      && <th style={p.th}>Tax</th>}
  {cols.sku      && <th style={p.th}>SKU</th>}
  {cols.status   && <th style={p.th}>Status</th>}
  {cols.supplier && <th style={p.th}>Default Supplier</th>}
  {cols.action   && <th style={p.th}>Action</th>}
  {cols.image    && <th style={p.th}>Product Image</th>}
</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={15} style={p.noData}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <div style={{ width:20, height:20, border:"3px solid #2d7a3a", borderTop:"3px solid transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                  Loading products...
                </div>
              </td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={15} style={p.noData}>No data available in table</td></tr>
            ) : (
              products.map((prod, i) => {
                const sc = stockColor(prod.current_stock ?? 0, prod.alert_qty);
                const isSelected = selected.includes(prod.id);
                return (
                  <tr key={prod.id}
                    style={{ background: isSelected?"#f0fdf4": i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f0f0f0", transition:"background 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background="#f9fafb"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background=i%2===0?"#fff":"#fafafa"; }}>
                    <td style={p.td}><input type="checkbox" checked={isSelected} onChange={()=>toggleSelect(prod.id)} style={{ accentColor:"#2d7a3a" }}/></td>
                    {cols.product  && <td style={{...p.td,fontWeight:600,maxWidth:200}}>{prod.name}</td>}
                    {cols.location && <td style={{...p.td,color:"#6b7280",fontSize:12}}>{prod.business_location}</td>}
                    {cols.purchase && <td style={p.td}>{prod.exc_tax>0?`₹${Number(prod.exc_tax).toLocaleString("en-IN")}`:"—"}</td>}
                    {cols.selling  && <td style={{...p.td,fontWeight:700,color:"#2d7a3a"}}>{prod.exc_tax_sell>0?`₹${Number(prod.exc_tax_sell).toLocaleString("en-IN")}`:"—"}</td>}
{cols.stock    && (
                      <td style={p.td}>
                        <span style={{background:sc.bg,color:sc.color,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>
                          {prod.current_stock??0}{sc.label ? ` · ${sc.label}` : ""}
                        </span>
                      </td>
                    )}                    {cols.type     && <td style={p.td}><span style={{background:"#ede9fe",color:"#6d28d9",borderRadius:20,padding:"2px 10px",fontSize:12}}>{prod.product_type}</span></td>}
                    {cols.category && <td style={p.td}>{prod.category||"—"}</td>}
                    {cols.brand    && <td style={p.td}>{prod.brand||"—"}</td>}
                    {cols.tax      && <td style={{...p.td,fontSize:12,color:"#6b7280"}}>{prod.tax}</td>}
                    {cols.sku      && <td style={{...p.td,fontFamily:"monospace",fontSize:12,color:"#6b7280"}}>{prod.sku||"—"}</td>}
                   {cols.status   && (
                      <td style={p.td}>
                        <span style={{background:prod.status==="Active"?"#d1fae5":"#fee2e2",color:prod.status==="Active"?"#065f46":"#991b1b",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:500}}>
                          {prod.status||"Active"}
                        </span>
                      </td>
                    )}
                    {cols.supplier && <td style={{...p.td,color:"#6b7280"}}>{prod.default_supplier_name||"—"}</td>}
       {cols.action && (
  <td style={p.td}>
    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
<button onClick={()=>{
          setViewProduct(prod);
          setShowView(true);
          setViewStockLocations([]);
          setViewStockLoading(true);
          productsAPI.getStockByLocation(prod.id)
            .then(res => setViewStockLocations(res.locations || []))
            .catch(e => console.error("Stock by location load error:", e.message))
            .finally(() => setViewStockLoading(false));
        }} style={p.iconBtnView} title="View">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
      <button onClick={()=>{setEditProduct(prod);setShowEdit(true);}} style={p.iconBtnEdit} title="Edit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
        </svg>
      </button>
      <button onClick={()=>handleDelete(prod.id)} style={p.iconBtnDel} title="Delete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
        </svg>
      </button>
      {(prod.current_stock ?? 0) <= (Number(prod.alert_qty) > 0 ? Number(prod.alert_qty) : 10) && (
        <button onClick={()=>handleRequestReorder(prod)} style={p.iconBtnReorder} title="Request Reorder from Supplier">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </button>
      )}
    </div>
  </td>
)}
                    {cols.image && (
                      <td style={p.td}>
                        {prod.image_url
                          ? <img src={prod.image_url} alt={prod.name} style={{ width:44, height:44, objectFit:"cover", borderRadius:6, border:"1px solid #e5e7eb" }}/>
                          : <div style={{ width:44, height:44, borderRadius:6, background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#d1d5db", fontSize:11 }}>IMG</div>}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

   {/* Bulk actions */}
      <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap", alignItems:"center" }}>
        {selected.length > 0 && (
          <span style={{ fontSize:13, fontWeight:600, color:"#2d7a3a", marginRight:4 }}>
            {selected.length} selected
          </span>
        )}
        <button onClick={handleDeleteSelected} disabled={!selected.length} style={{...p.bulkDel, opacity: selected.length?1:0.5, cursor: selected.length?"pointer":"not-allowed"}}>Delete Selected</button>
        <button style={p.bulkOutline}>Add to location</button>
        <button style={p.bulkOutline}>Remove from location</button>
        <button onClick={handleDeactivate} disabled={!selected.length} style={{...p.bulkWarn, opacity: selected.length?1:0.5, cursor: selected.length?"pointer":"not-allowed"}}>Deactivate Selected</button>
        {selected.length > 0 && (
          <button onClick={()=>setSelected([])} style={p.bulkOutline}>Clear Selection</button>
        )}
      </div>
      {/* Pagination */}
      <div style={p.footRow}>
        <span style={{ fontSize:13, color:"#6b7280" }}>
          Showing {from} to {to} of {total} entries
        </span>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          <button onClick={()=>setPage(1)} disabled={page<=1} style={{...p.pageBtn,opacity:page<=1?0.45:1}}>«</button>
          <button onClick={()=>setPage(v=>Math.max(1,v-1))} disabled={page<=1} style={{...p.pageBtn,opacity:page<=1?0.45:1}}>Previous</button>
          {Array.from({length:Math.min(totalPages,5)},(_, i)=>{
            const pg = Math.max(1, Math.min(page-2,totalPages-4))+i;
            return pg<=totalPages?(
              <button key={pg} onClick={()=>setPage(pg)}
                style={{...p.pageBtn,...(page===pg?p.pageActive:{})}}>{pg}</button>
            ):null;
          })}
          <button onClick={()=>setPage(v=>Math.min(totalPages,v+1))} disabled={page>=totalPages} style={{...p.pageBtn,opacity:page>=totalPages?0.45:1}}>Next</button>
          <button onClick={()=>setPage(totalPages)} disabled={page>=totalPages} style={{...p.pageBtn,opacity:page>=totalPages?0.45:1}}>»</button>
        </div>
      </div>

      {/* Edit Modal */}
      {showView && viewProduct && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, overflowY:"auto", display:"flex", justifyContent:"center", padding:"32px 16px" }}>
          <div style={{ background:"#fff", borderRadius:12, width:"100%", maxWidth:480, padding:"28px 24px", maxHeight:"90vh", overflowY:"auto", position:"relative" }}>
            <button onClick={()=>{setShowView(false);setViewProduct(null);}}
              style={{ position:"absolute", right:20, top:20, background:"none", border:"none", fontSize:24, cursor:"pointer", color:"#666" }}>×</button>
            <h2 style={{ margin:"0 0 18px", fontSize:20, fontWeight:700 }}>Product Details</h2>
            <div style={{ display:"flex", gap:16, marginBottom:16 }}>
              {viewProduct.image_url
                ? <img src={viewProduct.image_url} alt={viewProduct.name} style={{ width:80, height:80, objectFit:"cover", borderRadius:8, border:"1px solid #e5e7eb" }}/>
                : <div style={{ width:80, height:80, borderRadius:8, background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#d1d5db", fontSize:12 }}>No image</div>}
              <div>
                <div style={{ fontSize:17, fontWeight:700, color:"#1a1a2e" }}>{viewProduct.name}</div>
                <div style={{ fontSize:12, color:"#6b7280", fontFamily:"monospace", marginTop:4 }}>SKU: {viewProduct.sku||"—"}</div>
                <span style={{background:viewProduct.status==="Active"?"#d1fae5":"#fee2e2",color:viewProduct.status==="Active"?"#065f46":"#991b1b",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,marginTop:6,display:"inline-block"}}>
                  {viewProduct.status||"Active"}
                </span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px", fontSize:13 }}>
              <div><b>Brand:</b> {viewProduct.brand||"—"}</div>
              <div><b>Category:</b> {viewProduct.category||"—"}</div>
              <div><b>Unit:</b> {viewProduct.unit||"—"}</div>
              <div><b>Product Type:</b> {viewProduct.product_type||"—"}</div>
              <div><b>Purchase Price:</b> {viewProduct.exc_tax>0?`₹${Number(viewProduct.exc_tax).toLocaleString("en-IN")}`:"—"}</div>
              <div><b>Selling Price:</b> {viewProduct.exc_tax_sell>0?`₹${Number(viewProduct.exc_tax_sell).toLocaleString("en-IN")}`:"—"}</div>
              <div><b>Current Stock:</b> {viewProduct.current_stock??0}</div>
              <div><b>Tax:</b> {viewProduct.tax||"—"}</div>
              <div><b>Business Location:</b> {viewProduct.business_location||"—"}</div>
            </div>

            <div style={{ marginTop:16 }}>
              <b style={{ fontSize:13 }}>Stock by Location:</b>
              {viewStockLoading ? (
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:6 }}>Loading...</div>
              ) : viewStockLocations.length === 0 ? (
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:6 }}>No per-location stock recorded</div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginTop:8 }}>
                  <thead>
                    <tr style={{ background:"#f9fafb" }}>
                      <th style={{ textAlign:"left", padding:"6px 8px", fontWeight:600, color:"#374151", borderBottom:"1px solid #e5e7eb" }}>Location</th>
                      <th style={{ textAlign:"right", padding:"6px 8px", fontWeight:600, color:"#374151", borderBottom:"1px solid #e5e7eb" }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewStockLocations.map(loc => (
                      <tr key={loc.location_id}>
                        <td style={{ padding:"6px 8px", borderBottom:"1px solid #f5f5f5" }}>{loc.location_name}</td>
                        <td style={{ padding:"6px 8px", borderBottom:"1px solid #f5f5f5", textAlign:"right", fontWeight:600 }}>{loc.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {viewProduct.description && (
              <div style={{ marginTop:16, fontSize:13, color:"#374151" }}>
                <b>Description:</b>
                <p style={{ margin:"4px 0 0", color:"#6b7280" }}>{viewProduct.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editProduct && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, overflowY:"auto", display:"flex", justifyContent:"center", padding:"32px 16px" }}>
          <div style={{ background:"#f9fafb", borderRadius:12, width:"100%", maxWidth:920, padding:"28px 24px", maxHeight:"90vh", overflowY:"auto", position:"relative" }}>
            <button onClick={()=>{setShowEdit(false);setEditProduct(null);}}
              style={{ position:"absolute", right:20, top:20, background:"none", border:"none", fontSize:24, cursor:"pointer", color:"#666" }}>×</button>
            <h2 style={{ margin:"0 0 20px", fontSize:22, fontWeight:700 }}>Edit Product</h2>
            <AddProductForm key={editProduct?.id || "new"} editProduct={editProduct} onSaved={()=>{setShowEdit(false);setEditProduct(null);load();}}/>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────
const f = {
  page:       { display:"flex", flexDirection:"column", gap:20, fontFamily:"'Segoe UI',sans-serif" },
  card:       { background:"#fff", borderRadius:10, padding:"24px 28px", border:"1px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  sec:        { fontSize:16, fontWeight:700, color:"#1a1a2e", marginBottom:20, marginTop:0 },
  row3:       { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:4 },
  row2:       { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:4 },
  row1:       { marginBottom:16 },
  field:      { marginBottom:16 },
  lbl:        { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 },
  hint:       { cursor:"help", color:"#9ca3af", fontSize:13, marginLeft:5 },
  inp:        { width:"100%", border:"1px solid #d1d5db", borderRadius:6, padding:"8px 11px", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  locBox:     { border:"1px solid #2d7a3a", borderRadius:6, padding:"8px 12px", background:"#f0fdf4", display:"flex", alignItems:"center" },
  checkRow:   { display:"flex", alignItems:"center", gap:8, fontSize:14, cursor:"pointer" },
  imgBox:     { display:"flex", flexDirection:"column", gap:8 },
  imgEmpty:   { width:80, height:80, background:"#f9fafb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#d1d5db", fontSize:12, border:"1px dashed #d1d5db" },
  browseBtn:  { background:"#2d7a3a", color:"#fff", border:"none", borderRadius:6, padding:"8px 16px", cursor:"pointer", fontSize:13, width:"fit-content" },
  pricingWrap:{ border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden" },
  pricingHead:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", background:"#2d7a3a", color:"#fff", padding:"12px 16px", fontWeight:600, fontSize:13, gap:12 },
  pricingBody:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"16px", gap:16 },
  pricingCol: { display:"flex", flexDirection:"column", gap:6 },
  priceLbl:   { fontSize:12, fontWeight:600, color:"#6b7280" },
  footer:     { display:"flex", justifyContent:"center", gap:12, padding:"8px 0 20px" },
  btnDark:    { background:"#374151", color:"#fff", border:"none", borderRadius:8, padding:"12px 22px", cursor:"pointer", fontSize:14, fontWeight:600 },
  btnGreen:   { background:"#2d7a3a", color:"#fff", border:"none", borderRadius:8, padding:"12px 22px", cursor:"pointer", fontSize:14, fontWeight:600 },
  btnGreenDark:{ background:"linear-gradient(135deg,#2d7a3a,#1a5c28)", color:"#fff", border:"none", borderRadius:8, padding:"12px 32px", cursor:"pointer", fontSize:14, fontWeight:700 },
};

const p = {
  page:       { fontFamily:"'Segoe UI',sans-serif", color:"#222", fontSize:14 },
  titleRow:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 },
  title:      { margin:0, fontSize:24, fontWeight:700, color:"#111827" },
  sub:        { margin:"4px 0 0", color:"#9ca3af", fontSize:13 },
  breadcrumb: { fontSize:12, color:"#9ca3af", marginTop:4 },
  btnAdd:     { background:"linear-gradient(135deg,#16a34a,#15803d)", color:"#fff", border:"none", borderRadius:20, padding:"10px 22px", fontWeight:600, cursor:"pointer", fontSize:14 },
  btnXls:     { background:"#217346", color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", fontWeight:600, cursor:"pointer", fontSize:14 },
  statGrid:   { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, marginBottom:20 },
  statCard:   { background:"#fff", borderRadius:10, padding:"16px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  statLabel:  { fontSize:11, fontWeight:700, color:"#9ca3af", letterSpacing:1 },
  statValue:  { fontSize:24, fontWeight:800, color:"#111827", margin:"6px 0 2px" },
  statSub:    { fontSize:12, color:"#9ca3af" },
  errBanner:  { background:"#fff3cd", border:"1px solid #ffc107", borderRadius:6, padding:"10px 16px", marginBottom:12, color:"#856404", display:"flex", alignItems:"center", gap:12 },
  retryBtn:   { background:"#ffc107", border:"none", borderRadius:4, padding:"4px 12px", cursor:"pointer", fontSize:12, fontWeight:600 },
  filtersCard:{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, marginBottom:14, overflow:"hidden" },
  filtersHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", cursor:"pointer" },
  filtersBody:{ padding:"16px", borderTop:"1px solid #f0f0f0" },
  filterRow:  { display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:16, alignItems:"end" },
  filterField:{ display:"flex", flexDirection:"column", gap:5 },
  filterLbl:  { fontSize:12, fontWeight:600, color:"#6b7280" },
  filterInp:  { border:"1px solid #d1d5db", borderRadius:6, padding:"7px 10px", fontSize:13, outline:"none" },
  clearBtn:   { background:"#f3f4f6", border:"1px solid #d1d5db", borderRadius:6, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:500, whiteSpace:"nowrap" },
  tabRow:     { display:"flex", borderBottom:"2px solid #e5e7eb", marginBottom:14 },
  tab:        { padding:"10px 22px", border:"none", background:"transparent", cursor:"pointer", fontSize:14, color:"#6b7280", fontWeight:500 },
  tabActive:  { color:"#2d7a3a", borderBottom:"3px solid #2d7a3a", marginBottom:-2, fontWeight:700 },
  toolbar:    { display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:12 },
  tableWrap:  { overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff" },
  table:      { width:"100%", borderCollapse:"collapse", fontSize:13 },
  thead:      { background:"#f9fafb" },
  th:         { padding:"12px 10px", textAlign:"left", fontWeight:600, borderBottom:"2px solid #e5e7eb", whiteSpace:"nowrap", color:"#374151" },
  td:         { padding:"11px 10px", borderBottom:"1px solid #f5f5f5", verticalAlign:"middle" },
  noData:     { textAlign:"center", padding:"52px 0", color:"#9ca3af", fontSize:14 },
  iconBtnView:{ background:"none", border:"none", padding:0, cursor:"pointer", color:"#3b82f6", display:"flex", alignItems:"center" },
iconBtnEdit:{ background:"none", border:"none", padding:0, cursor:"pointer", color:"#f59e0b", display:"flex", alignItems:"center" },
iconBtnDel: { background:"none", border:"none", padding:0, cursor:"pointer", color:"#ef4444", display:"flex", alignItems:"center" },
  iconBtnReorder: { background:"none", border:"none", padding:0, cursor:"pointer", color:"#0d9488", display:"flex", alignItems:"center" },
  bulkDel:    { background:"#fff", border:"1px solid #ef4444", color:"#ef4444", borderRadius:5, padding:"7px 16px", cursor:"pointer", fontSize:13, fontWeight:500 },
  bulkOutline:{ background:"#fff", border:"1px solid #d1d5db", color:"#374151", borderRadius:5, padding:"7px 16px", cursor:"pointer", fontSize:13 },
  bulkWarn:   { background:"#fff", border:"1px solid #f59e0b", color:"#d97706", borderRadius:5, padding:"7px 16px", cursor:"pointer", fontSize:13, fontWeight:500 },
  footRow:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, flexWrap:"wrap", gap:8 },
  pageBtn:    { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 12px", cursor:"pointer", fontSize:13, color:"#374151" },
  pageActive: { background:"#2d7a3a", color:"#fff", border:"1px solid #2d7a3a" },
};

const tb = {
  btn:    { background:"#fff", border:"1px solid #d1d5db", borderRadius:5, padding:"6px 11px", fontSize:12, cursor:"pointer", color:"#444", display:"flex", alignItems:"center", gap:5 },
  csvBtn: { },
  xlsBtn: { },
  pdfBtn: { },
  csvIco: { background:"#16a34a", color:"#fff", borderRadius:3, padding:"1px 5px", fontSize:10, fontWeight:700 },
  xlsIco: { background:"#217346", color:"#fff", borderRadius:3, padding:"1px 5px", fontSize:10, fontWeight:700 },
  pdfIco: { background:"#dc2626", color:"#fff", borderRadius:3, padding:"1px 5px", fontSize:10, fontWeight:700 },
  select: { border:"1px solid #d1d5db", borderRadius:4, padding:"5px 8px", fontSize:13, outline:"none" },
  search: { border:"1px solid #d1d5db", borderRadius:5, padding:"6px 10px", fontSize:13, width:170, outline:"none" },
};
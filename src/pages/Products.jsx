import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { productsAPI, brandsAPI, unitsAPI, categoriesAPI } from "../api/productAPI";

// ── Static options ────────────────────────────────────────────
const TAXES         = ["None","GST 5%","GST 12%","GST 18%","GST 28%"];
const TAX_TYPES     = ["Exclusive","Inclusive"];
const PRODUCT_TYPES = ["Single","Variable"];
const BARCODE_TYPES = ["Code 128 (C128)","EAN-13","EAN-8","QR Code","UPC-A"];

// ── SKU Auto-generator ────────────────────────────────────────
const generateSKU = (name = "") => {
  const prefix = name.trim().slice(0,3).toUpperCase().replace(/[^A-Z0-9]/g,"") || "PRD";
  const rand   = Math.random().toString(36).substring(2,6).toUpperCase();
  const ts     = Date.now().toString().slice(-4);
  return `${prefix}-${rand}${ts}`;
};

const EMPTY_FORM = {
  name:"", sku:"", barcodeType:"Code 128 (C128)",
  unit:"", unitId:null,
  brand:"", brandId:null,
  category:"", categoryId:null,
  subCategory:"", subCategoryId:null,
  businessLocation:"Manodtechnologies (BL0001)",
  alertQty:"", manageStock:true,
  description:"", weight:"", prepTime:"",
  tax:"None", sellingPriceTaxType:"Exclusive",
  productType:"Single",
  excTax:"", incTax:"", margin:"25.00", excTaxSell:"",
  image:null, imagePreview:null,
};

// ── Searchable Typeahead Dropdown ─────────────────────────────
function TypeaheadSelect({ label, required, placeholder, items, value, onChange, onSelect }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState(value || "");
  const ref               = useRef();

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handlePick = (item) => {
    setQuery(item.name);
    onSelect(item);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    onSelect(null);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || `Search or type ${label}...`}
          autoComplete="off"
          style={{ ...s.input, paddingRight:28 }}
        />
        {query && (
          <button onClick={handleClear}
            style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", fontSize:16, lineHeight:1 }}>
            ×
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div style={s.dropdown}>
          {filtered.slice(0,10).map(item => (
            <div key={item.id} onMouseDown={() => handlePick(item)} style={s.dropdownItem}
              onMouseEnter={e => e.currentTarget.style.background="#f0fdf4"}
              onMouseLeave={e => e.currentTarget.style.background="#fff"}>
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Export helpers ────────────────────────────────────────────
const exportCSV = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const headers = ["Product","SKU","Unit","Brand","Category","Selling Price","Stock","Type","Tax","Status"];
  const rows = products.map(p => [p.name,p.sku||"",p.unit||"",p.brand||"",p.category||"",
    p.exc_tax_sell||"",p.current_stock??0,p.product_type,p.tax,p.status||"Active"]);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="products.csv"; a.click();
  URL.revokeObjectURL(url);
};

const exportExcel = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const data = products.map(p => ({"Product":p.name,"SKU":p.sku||"","Unit":p.unit||"","Brand":p.brand||"","Category":p.category||"","Selling Price":p.exc_tax_sell||"","Stock":p.current_stock??0,"Status":p.status||"Active"}));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = Object.keys(data[0]).map(()=>({wch:20}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Products");
  XLSX.writeFile(wb,"products.xlsx");
};

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, required, tooltip, children, style }) {
  return (
    <div style={{ marginBottom:16, ...style }}>
      {label && (
        <label style={s.label}>
          {label}{required && <span style={{ color:"#dc2626" }}> *</span>}
          {tooltip && (
            <span title={tooltip}
              style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",
                width:16,height:16,borderRadius:"50%",background:"#17a2b8",color:"#fff",
                fontSize:10,marginLeft:6,cursor:"pointer",fontWeight:700 }}>i</span>
          )}
        </label>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD/EDIT PRODUCT FORM
// ─────────────────────────────────────────────────────────────
export function AddProductForm({ onSaved, editProduct }) {
  const navigate = useNavigate();

  const initForm = () => editProduct ? {
    name:                editProduct.name || "",
    sku:                 editProduct.sku  || "",
    barcodeType:         editProduct.barcode_type || "Code 128 (C128)",
    unit:                editProduct.unit  || "", unitId: editProduct.unit_id || null,
    brand:               editProduct.brand || "", brandId: editProduct.brand_id || null,
    category:            editProduct.category || "", categoryId: editProduct.category_id || null,
    subCategory:         editProduct.sub_category || "", subCategoryId: editProduct.sub_category_id || null,
    businessLocation:    editProduct.business_location || "Manodtechnologies (BL0001)",
    alertQty:            editProduct.alert_qty ?? "",
    manageStock:         editProduct.manage_stock ?? true,
    description:         editProduct.description || "",
    weight:              editProduct.weight ?? "",
    prepTime:            editProduct.prep_time ?? "",
    tax:                 editProduct.tax || "None",
    sellingPriceTaxType: editProduct.selling_price_tax_type || "Exclusive",
    productType:         editProduct.product_type || "Single",
    excTax:              editProduct.exc_tax ?? "",
    incTax:              editProduct.inc_tax ?? "",
    margin:              editProduct.margin ?? "25.00",
    excTaxSell:          editProduct.exc_tax_sell ?? "",
    image:null, imagePreview:null,
  } : EMPTY_FORM;

  const [form, setForm]       = useState(initForm);
  const [saving, setSaving]   = useState(false);
  const [units, setUnits]     = useState([]);
  const [brands, setBrands]   = useState([]);
  const [allCats, setAllCats] = useState([]);
  const fileRef               = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load dropdowns
  useEffect(() => {
    const load = async () => {
      try {
        const [u, b, c] = await Promise.all([
          unitsAPI.getAll({ limit: 200 }),
          brandsAPI.getAll({ limit: 200 }),
          categoriesAPI.getAll({ limit: 200 }),
        ]);
        setUnits(u.units || []);
        setBrands(b.brands || []);
        setAllCats(c.categories || []);
      } catch (err) { console.error("Failed to load dropdowns:", err.message); }
    };
    load();
  }, []);

  // Auto-generate SKU when name changes (only if SKU is empty)
  useEffect(() => {
    if (!editProduct && form.name && !form.sku) {
      // Debounce SKU generation
      const t = setTimeout(() => {
        set("sku", generateSKU(form.name));
      }, 600);
      return () => clearTimeout(t);
    }
  }, [form.name]);

  // Auto-calculate Inc Tax from Exc Tax + margin/tax
  useEffect(() => {
    if (form.excTax) {
      const exc    = parseFloat(form.excTax) || 0;
      const taxPct = form.tax === "None" ? 0 : parseFloat(form.tax.replace(/[^0-9.]/g,"")) || 0;
      const inc    = exc * (1 + taxPct / 100);
      set("incTax", inc.toFixed(2));
      // Auto-calc selling price
      const margin  = parseFloat(form.margin) || 0;
      const sellExc = exc * (1 + margin / 100);
      set("excTaxSell", sellExc.toFixed(2));
    }
  }, [form.excTax, form.tax, form.margin]);

  // Parent categories only
  const parentCats = allCats.filter(c => !c.parent_id);
  // Sub-categories filtered by selected parent
  const subCats    = allCats.filter(c => c.parent_id && (
    !form.categoryId || c.parent_id === form.categoryId
  ));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("image", file);
    const reader = new FileReader();
    reader.onload = (ev) => set("imagePreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = async (andNew = false) => {
    if (!form.name.trim())        { alert("Product Name is required"); return; }
    if (!form.unit && !form.unitId) { alert("Unit is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name:                   form.name,
        sku:                    form.sku || generateSKU(form.name),
        barcode_type:           form.barcodeType,
        unit_id:                form.unitId || undefined,
        unit:                   form.unitId ? undefined : form.unit,
        brand_id:               form.brandId || undefined,
        brand:                  form.brandId ? undefined : (form.brand || null),
        category_id:            form.categoryId || undefined,
        category:               form.categoryId ? undefined : (form.category || null),
        sub_category_id:        form.subCategoryId || undefined,
        sub_category:           form.subCategoryId ? undefined : (form.subCategory || null),
        business_location:      form.businessLocation,
        alert_qty:              form.alertQty || 0,
        manage_stock:           form.manageStock,
        description:            form.description || null,
        weight:                 form.weight || null,
        prep_time:              form.prepTime || null,
        tax:                    form.tax,
        selling_price_tax_type: form.sellingPriceTaxType,
        product_type:           form.productType,
        exc_tax:                parseFloat(form.excTax) || 0,
        inc_tax:                parseFloat(form.incTax) || 0,
        margin:                 parseFloat(form.margin) || 0,
        exc_tax_sell:           parseFloat(form.excTaxSell) || 0,
        status:                 "Active",
      };

      if (editProduct) {
        await productsAPI.update(editProduct.id, payload);
      } else {
        await productsAPI.create(payload);
      }

      if (onSaved) { onSaved(); return; }
      if (andNew)  { setForm(EMPTY_FORM); }
      else          { navigate("/products/"); }
    } catch (err) {
      alert(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.formPage}>
      {/* ── Card 1: Product Info ── */}
      <div style={s.card}>
        <div style={s.row3}>
          <Field label="Product Name" required>
            <input style={s.input} placeholder="e.g. Samsung Galaxy S24"
              value={form.name}
              onChange={e => { set("name", e.target.value); if (!editProduct && !form.sku) {} }}/>
          </Field>
          <Field label="SKU"
            tooltip="Stock Keeping Unit. Auto-generated from product name. You can edit it.">
            <div style={{ display:"flex", gap:6 }}>
              <input style={{ ...s.input, flex:1, fontFamily:"monospace" }}
                placeholder="Auto-generated"
                value={form.sku}
                onChange={e => set("sku", e.target.value)}/>
              <button type="button" onClick={() => set("sku", generateSKU(form.name))}
                title="Regenerate SKU"
                style={{ padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:6, background:"#f9fafb", cursor:"pointer", fontSize:14 }}>
                ↺
              </button>
            </div>
          </Field>
          <Field label="Barcode Type" required>
            <select style={s.input} value={form.barcodeType} onChange={e=>set("barcodeType",e.target.value)}>
              {BARCODE_TYPES.map(b=><option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>

        <div style={s.row3}>
          <Field label="Unit" required>
            <TypeaheadSelect
              label="Unit" items={units}
              value={form.unit}
              onChange={v => set("unit", v)}
              onSelect={item => { set("unit", item ? item.name : ""); set("unitId", item ? item.id : null); }}
              placeholder="Type to search units..."
            />
          </Field>
          <Field label="Brand">
            <TypeaheadSelect
              label="Brand" items={brands}
              value={form.brand}
              onChange={v => set("brand", v)}
              onSelect={item => { set("brand", item ? item.name : ""); set("brandId", item ? item.id : null); }}
              placeholder="Type to search brands..."
            />
          </Field>
          <Field label="Category">
            <TypeaheadSelect
              label="Category" items={parentCats}
              value={form.category}
              onChange={v => set("category", v)}
              onSelect={item => {
                set("category", item ? item.name : "");
                set("categoryId", item ? item.id : null);
                // Reset sub-category when parent changes
                set("subCategory", ""); set("subCategoryId", null);
              }}
              placeholder="Type to search categories..."
            />
          </Field>
        </div>

        <div style={s.row3}>
          <Field label="Sub Category"
            tooltip={form.categoryId ? `Showing sub-categories under "${form.category}"` : "Select a Category first to filter sub-categories"}>
            <TypeaheadSelect
              label="Sub Category" items={subCats}
              value={form.subCategory}
              onChange={v => set("subCategory", v)}
              onSelect={item => { set("subCategory", item ? item.name : ""); set("subCategoryId", item ? item.id : null); }}
              placeholder={form.categoryId ? "Type to search sub-categories..." : "Select Category first..."}
            />
          </Field>
          <Field label="Business Locations">
            <div style={s.locationBox}>
              <span style={s.locationBadge}>✕ {form.businessLocation}</span>
            </div>
          </Field>
          <Field label="Alert Quantity">
            <input style={s.input} placeholder="e.g. 10" type="number" min="0"
              value={form.alertQty} onChange={e=>set("alertQty",e.target.value)}/>
          </Field>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, cursor:"pointer" }}>
            <input type="checkbox" checked={form.manageStock}
              onChange={e=>set("manageStock",e.target.checked)}
              style={{ accentColor:"#2d7a3a", width:16, height:16 }}/>
            <span style={{ fontWeight:600, color:"#374151" }}>Manage Stock?</span>
            <span style={{ color:"#9ca3af", fontSize:12, fontStyle:"italic" }}>
              Enable stock management at product level
            </span>
          </label>
        </div>

        <div style={s.row2}>
          <Field label="Product Description">
            <textarea style={{ ...s.input, height:100, resize:"vertical" }}
              placeholder="Enter product description..."
              value={form.description} onChange={e=>set("description",e.target.value)}/>
          </Field>
          <Field label="Product Image">
            <div style={s.imgArea}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="preview" style={s.imgPreview}/>
                : <div style={s.imgEmpty}>No image</div>}
              <button type="button" style={s.browseBtn} onClick={()=>fileRef.current.click()}>
                Browse...
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display:"none" }} onChange={handleImage}/>
              <span style={s.imgNote}>Max File size: 5MB · Aspect ratio 1:1</span>
            </div>
          </Field>
        </div>

        <div style={s.row2}>
          <Field label="Weight (kg)">
            <input style={s.input} placeholder="e.g. 0.5" type="number" step="0.001"
              value={form.weight} onChange={e=>set("weight",e.target.value)}/>
          </Field>
          <Field label="Preparation Time (minutes)">
            <input style={s.input} placeholder="e.g. 15" type="number"
              value={form.prepTime} onChange={e=>set("prepTime",e.target.value)}/>
          </Field>
        </div>
      </div>

      {/* ── Card 2: Pricing ── */}
      <div style={s.card}>
        <div style={s.row2}>
          <Field label="Applicable Tax">
            <select style={s.input} value={form.tax} onChange={e=>set("tax",e.target.value)}>
              {TAXES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Selling Price Tax Type" required>
            <select style={s.input} value={form.sellingPriceTaxType}
              onChange={e=>set("sellingPriceTaxType",e.target.value)}>
              {TAX_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Product Type" required style={{ maxWidth:320 }}>
          <select style={s.input} value={form.productType}
            onChange={e=>set("productType",e.target.value)}>
            {PRODUCT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </Field>

        {/* Pricing table */}
        <div style={s.pricingWrap}>
          <div style={s.pricingHead}>
            <div>Default Purchase Price</div>
            <div>× Margin (%)</div>
            <div>Default Selling Price</div>
            <div>Product Image</div>
          </div>
          <div style={s.pricingBody}>
            {/* Purchase price */}
            <div style={s.pricingCell}>
              <Field label="Exc. tax *"
                tooltip="Exc. Tax = Purchase price EXCLUDING tax. This is what you pay the supplier before tax is added.">
                <input style={s.input} placeholder="0.00" type="number" step="0.01"
                  value={form.excTax} onChange={e=>set("excTax",e.target.value)}/>
              </Field>
              <Field label="Inc. tax *"
                tooltip="Inc. Tax = Purchase price INCLUDING tax. Auto-calculated from Exc. Tax + applicable tax rate.">
                <input style={s.input} placeholder="0.00" type="number" step="0.01"
                  value={form.incTax} onChange={e=>set("incTax",e.target.value)}/>
              </Field>
            </div>
            {/* Margin */}
            <div style={s.pricingCell}>
              <Field label="Margin %" tooltip="Profit margin percentage. Selling price = Purchase price × (1 + margin/100)">
                <input style={s.input} type="number" step="0.01"
                  value={form.margin} onChange={e=>set("margin",e.target.value)}/>
              </Field>
            </div>
            {/* Selling price */}
            <div style={s.pricingCell}>
              <Field label="Exc. Tax" tooltip="Default selling price excluding tax. Auto-calculated from Purchase Price + Margin.">
                <input style={s.input} placeholder="0.00" type="number" step="0.01"
                  value={form.excTaxSell} onChange={e=>set("excTaxSell",e.target.value)}/>
              </Field>
            </div>
            {/* Image preview */}
            <div style={{ ...s.pricingCell, alignItems:"center", justifyContent:"center" }}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="product"
                    style={{ width:64, height:64, objectFit:"cover", borderRadius:6 }}/>
                : <span style={{ color:"#d1d5db", fontSize:12 }}>No file chosen</span>}
              <div style={s.imgNote}>Max 5MB · 1:1</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer buttons ── */}
      <div style={s.formFooter}>
        <button style={{ ...s.btnSaveStock, opacity:saving?0.7:1 }}
          onClick={()=>save(false)} disabled={saving}>
          {saving?"Saving...":"Save & Add Opening Stock"}
        </button>
        <button style={{ ...s.btnSaveAnother, opacity:saving?0.7:1 }}
          onClick={()=>save(true)} disabled={saving}>
          {saving?"Saving...":"Save And Add Another"}
        </button>
        <button style={{ ...s.btnSave, opacity:saving?0.7:1 }}
          onClick={()=>save(false)} disabled={saving}>
          {saving?"Saving...":"Save"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD PRODUCT PAGE
// ─────────────────────────────────────────────────────────────
export function AddProductPage() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 style={{ margin:"0 0 20px", fontSize:26, fontWeight:700, color:"#1a1a2e" }}>
        Add New Product
      </h1>
      <AddProductForm onSaved={()=>navigate("/products/")}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIST PRODUCTS
// ─────────────────────────────────────────────────────────────
export default function ListProducts() {
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]         = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [activeTab, setActiveTab]   = useState("all");
  const [selected, setSelected]     = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await productsAPI.getAll({ page:currentPage, limit:showEntries, search });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) { setError(err.message || "Failed to load products"); }
    finally { setLoading(false); }
  }, [currentPage, showEntries, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages  = Math.max(1, Math.ceil(total / showEntries));
  const toggleAll   = () => setSelected(selected.length===products.length&&products.length>0 ? [] : products.map(p=>p.id));
  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await productsAPI.delete(id); load(); }
    catch (err) { alert(err.message || "Failed to delete"); }
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) { alert("Select at least one product"); return; }
    if (!window.confirm(`Delete ${selected.length} product(s)?`)) return;
    try { await Promise.all(selected.map(id => productsAPI.delete(id))); setSelected([]); load(); }
    catch (err) { alert(err.message); }
  };

  const handleDeactivate = async () => {
    if (!selected.length) { alert("Select at least one product"); return; }
    try { await Promise.all(selected.map(id => productsAPI.updateStatus(id,"Inactive"))); setSelected([]); load(); }
    catch (err) { alert(err.message); }
  };

  const stockStyle = (qty) => {
    if (!qty || qty === 0) return { bg:"#fee2e2", color:"#991b1b" };
    if (qty < 10)          return { bg:"#fef3c7", color:"#92400e" };
    return                        { bg:"#d1fae5", color:"#065f46" };
  };

  return (
    <div style={s.page}>
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <span style={s.pageSubtitle}>Manage your products</span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={s.btnAdd}   onClick={()=>navigate("/products/create")}>+ Add</button>
          <button style={s.btnExcel} onClick={()=>exportExcel(products)}>Download Excel</button>
        </div>
      </div>

      {error && (
        <div style={{ background:"#fff3cd", border:"1px solid #ffc107", borderRadius:6, padding:"10px 16px", marginBottom:12, color:"#856404" }}>
          ⚠ {error}
        </div>
      )}

      <div style={s.filtersBar}>
        <span style={{ color:"#2d7a3a", fontWeight:600, fontSize:14 }}>Filters</span>
        <span style={{ marginLeft:"auto", color:"#2d7a3a", fontSize:18 }}>v</span>
      </div>

      <div style={s.tabRow}>
        {[{key:"all",label:"All Products"},{key:"stock",label:"Stock Report"}].map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            style={{ ...s.tab, ...(activeTab===t.key?s.tabActive:{}) }}>{t.label}</button>
        ))}
      </div>

      <div style={s.toolbar}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13 }}>Show</span>
          <select style={{ border:"1px solid #d1d5db", borderRadius:4, padding:"5px 8px", fontSize:13 }}
            value={showEntries} onChange={e=>{setShowEntries(+e.target.value);setCurrentPage(1);}}>
            {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
          </select>
          <span style={{ fontSize:13 }}>entries</span>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          <button onClick={()=>exportCSV(products)} style={s.toolBtn}>
            <span style={{ ...s.tbIcon, background:"#1d6f42" }}>CSV</span>Export CSV
          </button>
          <button onClick={()=>exportExcel(products)} style={s.toolBtn}>
            <span style={{ ...s.tbIcon, background:"#217346" }}>XLS</span>Export Excel
          </button>
          <button style={s.toolBtn}>Print</button>
          <button style={s.toolBtn}>Column visibility</button>
          <button style={s.toolBtn}>
            <span style={{ ...s.tbIcon, background:"#d32f2f" }}>PDF</span>Export PDF
          </button>
          <input style={{ border:"1px solid #d1d5db", borderRadius:4, padding:"6px 10px", fontSize:13, width:170 }}
            placeholder="Search ..." value={searchInput}
            onChange={e=>setSearchInput(e.target.value)}/>
        </div>
      </div>

      <div style={{ overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#f9fafb" }}>
              <th style={s.th}><input type="checkbox" checked={selected.length===products.length&&products.length>0} onChange={toggleAll}/></th>
              <th style={s.th}>Product Image</th>
              <th style={s.th}>Action</th>
              <th style={s.th}>Product</th>
              <th style={s.th}>Business Location</th>
              <th style={s.th}>Unit Purchase Price</th>
              <th style={s.th}>Selling Price</th>
              <th style={s.th}>Current Stock</th>
              <th style={s.th}>Product Type</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Brand</th>
              <th style={s.th}>Tax</th>
              <th style={s.th}>SKU</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={14} style={{ textAlign:"center", padding:48, color:"#9ca3af" }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={14} style={{ textAlign:"center", padding:48, color:"#9ca3af" }}>No data available in table</td></tr>
            ) : (
              products.map((p, i) => {
                const sc = stockStyle(p.current_stock);
                return (
                  <tr key={p.id}
                    style={{ background:i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f0f0f0" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafafa"}>
                    <td style={s.td}><input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleSelect(p.id)}/></td>
                    <td style={s.td}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width:40,height:40,objectFit:"cover",borderRadius:4,border:"1px solid #e5e7eb" }}/>
                        : <div style={{ width:40,height:40,background:"#f3f4f6",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",color:"#d1d5db",fontSize:10 }}>IMG</div>}
                    </td>
                    <td style={s.td}>
                      <button onClick={()=>{setEditProduct(p);setShowEditModal(true);}}
                        style={{ background:"#f0fdf4",border:"none",borderRadius:4,cursor:"pointer",fontSize:12,padding:"4px 8px",marginRight:4,color:"#2d7a3a",fontWeight:500 }}>Edit</button>
                      <button onClick={()=>handleDelete(p.id)}
                        style={{ background:"#fee2e2",border:"none",borderRadius:4,cursor:"pointer",fontSize:12,padding:"4px 8px",color:"#ef4444",fontWeight:500 }}>Del</button>
                    </td>
                    <td style={{ ...s.td, fontWeight:500 }}>{p.name}</td>
                    <td style={s.td}>{p.business_location}</td>
                    <td style={s.td}>{p.exc_tax ? `₹${Number(p.exc_tax).toLocaleString("en-IN")}` : "--"}</td>
                    <td style={{ ...s.td, fontWeight:600, color:"#065f46" }}>
                      {p.exc_tax_sell ? `₹${Number(p.exc_tax_sell).toLocaleString("en-IN")}` : "--"}
                    </td>
                    <td style={s.td}>
                      <span style={{ background:sc.bg,color:sc.color,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600 }}>
                        {p.current_stock ?? 0}
                      </span>
                    </td>
                    <td style={s.td}>{p.product_type}</td>
                    <td style={s.td}>{p.category || "--"}</td>
                    <td style={s.td}>{p.brand || "--"}</td>
                    <td style={s.td}>{p.tax}</td>
                    <td style={{ ...s.td, fontFamily:"monospace", fontSize:11, color:"#6b7280" }}>{p.sku || "--"}</td>
                    <td style={s.td}>
                      <span style={{
                        background:p.status==="Active"?"#d1fae5":"#fee2e2",
                        color:p.status==="Active"?"#065f46":"#991b1b",
                        borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:500
                      }}>{p.status||"Active"}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
        <button onClick={handleDeleteSelected}  style={s.bulkDel}>Delete Selected</button>
        <button style={s.bulkAdd}>Add to location</button>
        <button style={s.bulkRem}>Remove from location</button>
        <button onClick={handleDeactivate}      style={s.bulkDeact}>Deactivate Selected</button>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, fontSize:13, color:"#6b7280" }}>
        <span>
          Showing {products.length===0?"0":`${(currentPage-1)*showEntries+1}`} to {Math.min(currentPage*showEntries,total)} of {total} entries
        </span>
        <div style={{ display:"flex", gap:6 }}>
          <button style={{ ...s.pageBtn, opacity:currentPage===1?0.5:1 }}
            onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>Previous</button>
          {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(pg=>(
            <button key={pg} style={{ ...s.pageBtn, ...(currentPage===pg?s.pageBtnActive:{}) }}
              onClick={()=>setCurrentPage(pg)}>{pg}</button>
          ))}
          {totalPages>5 && <span style={{ padding:"5px 8px",color:"#6b7280" }}>...</span>}
          <button style={{ ...s.pageBtn, opacity:currentPage===totalPages?0.5:1 }}
            onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Next</button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editProduct && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,overflowY:"auto",display:"flex",justifyContent:"center",padding:"40px 16px" }}>
          <div style={{ background:"#f9fafb",borderRadius:12,width:"100%",maxWidth:900,padding:28,maxHeight:"90vh",overflowY:"auto",position:"relative" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h2 style={{ margin:0,fontSize:22,fontWeight:700,color:"#1a1a2e" }}>Edit Product</h2>
              <button onClick={()=>setShowEditModal(false)}
                style={{ background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#666" }}>×</button>
            </div>
            <AddProductForm editProduct={editProduct} onSaved={()=>{ setShowEditModal(false); load(); }}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────
const s = {
  page:         { fontFamily:"'Segoe UI',sans-serif", color:"#222", fontSize:14 },
  titleRow:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 },
  pageTitle:    { margin:0, fontSize:26, fontWeight:700, color:"#1a1a2e" },
  pageSubtitle: { fontSize:13, color:"#888" },
  btnAdd:       { background:"#2d7a3a", color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", fontWeight:600, cursor:"pointer", fontSize:14 },
  btnExcel:     { background:"#217346", color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", fontWeight:600, cursor:"pointer", fontSize:14 },
  filtersBar:   { display:"flex", alignItems:"center", padding:"12px 16px", border:"1px solid #e5e7eb", borderRadius:8, marginBottom:16, background:"#fff" },
  tabRow:       { display:"flex", borderBottom:"2px solid #e5e7eb", marginBottom:16 },
  tab:          { padding:"10px 22px", border:"none", background:"transparent", cursor:"pointer", fontSize:14, color:"#555", fontWeight:500 },
  tabActive:    { color:"#2d7a3a", borderBottom:"2px solid #2d7a3a", marginBottom:-2, fontWeight:600 },
  toolbar:      { display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:12 },
  toolBtn:      { background:"#fff", border:"1px solid #d1d5db", borderRadius:6, padding:"6px 12px", fontSize:12, cursor:"pointer", color:"#444", display:"flex", alignItems:"center", gap:5 },
  tbIcon:       { color:"#fff", borderRadius:3, padding:"1px 5px", fontSize:10, fontWeight:700 },
  th:           { padding:"12px 10px", textAlign:"left", fontWeight:600, borderBottom:"2px solid #e5e7eb", whiteSpace:"nowrap", color:"#374151" },
  td:           { padding:"10px 10px", verticalAlign:"middle" },
  bulkDel:      { background:"#fff", border:"1px solid #ef4444", color:"#ef4444", borderRadius:4, padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:500 },
  bulkAdd:      { background:"#fff", border:"1px solid #2d7a3a", color:"#2d7a3a", borderRadius:4, padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:500 },
  bulkRem:      { background:"#fff", border:"1px solid #6b7280", color:"#6b7280", borderRadius:4, padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:500 },
  bulkDeact:    { background:"#fff", border:"1px solid #f59e0b", color:"#d97706", borderRadius:4, padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:500 },
  pageBtn:      { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 14px", cursor:"pointer", fontSize:13, color:"#374151" },
  pageBtnActive:{ background:"#2d7a3a", color:"#fff", border:"1px solid #2d7a3a" },
  // Form styles
  formPage:       { display:"flex", flexDirection:"column", gap:20 },
  card:           { background:"#fff", borderRadius:10, padding:"24px 28px", border:"1px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  row3:           { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:4 },
  row2:           { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:4 },
  label:          { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:5 },
  input:          { width:"100%", border:"1px solid #d1d5db", borderRadius:6, padding:"8px 10px", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  locationBox:    { padding:"7px 10px", border:"1px solid #2d7a3a", borderRadius:6, background:"#f0fdf4" },
  locationBadge:  { background:"#2d7a3a", color:"#fff", borderRadius:4, padding:"3px 10px", fontSize:12, fontWeight:500 },
  imgArea:        { display:"flex", flexDirection:"column", gap:8 },
  imgPreview:     { width:80, height:80, objectFit:"cover", borderRadius:8, border:"1px solid #e5e7eb" },
  imgEmpty:       { width:80, height:80, background:"#f9fafb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#d1d5db", fontSize:12, border:"1px dashed #d1d5db" },
  browseBtn:      { background:"#2d7a3a", color:"#fff", border:"none", borderRadius:6, padding:"8px 16px", cursor:"pointer", fontSize:13, width:"fit-content" },
  imgNote:        { fontSize:11, color:"#9ca3af" },
  pricingWrap:    { border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden", marginTop:16 },
  pricingHead:    { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", background:"#2d7a3a", color:"#fff", padding:"12px 16px", fontWeight:600, fontSize:13 },
  pricingBody:    { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"16px", gap:16, background:"#fff" },
  pricingCell:    { display:"flex", flexDirection:"column", gap:8 },
  formFooter:     { display:"flex", justifyContent:"center", gap:12, padding:"20px 0 8px" },
  btnSaveStock:   { background:"#374151", color:"#fff", border:"none", borderRadius:6, padding:"12px 22px", cursor:"pointer", fontSize:14, fontWeight:600 },
  btnSaveAnother: { background:"#2d7a3a", color:"#fff", border:"none", borderRadius:6, padding:"12px 22px", cursor:"pointer", fontSize:14, fontWeight:600 },
  btnSave:        { background:"linear-gradient(135deg,#2d7a3a,#1a5c28)", color:"#fff", border:"none", borderRadius:6, padding:"12px 32px", cursor:"pointer", fontSize:14, fontWeight:600 },
  dropdown:       { position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1px solid #d1d5db", borderRadius:6, boxShadow:"0 4px 12px rgba(0,0,0,0.1)", zIndex:100, maxHeight:200, overflowY:"auto", marginTop:2 },
  dropdownItem:   { padding:"9px 12px", cursor:"pointer", fontSize:13, color:"#374151", borderBottom:"1px solid #f0f0f0" },
};
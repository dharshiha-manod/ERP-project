import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { productsAPI, brandsAPI, unitsAPI, categoriesAPI } from "../api/productAPI";

// ── Static options (unchanged from original) ──
const TAXES        = ["None", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];
const TAX_TYPES    = ["Exclusive", "Inclusive"];
const PRODUCT_TYPES = ["Single", "Variable"];
const BARCODE_TYPES = ["Code 128 (C128)", "EAN-13", "EAN-8", "QR Code", "UPC-A"];

const EMPTY_FORM = {
  name: "", sku: "", barcodeType: "Code 128 (C128)",
  unit: "", brand: "", category: "", subCategory: "",
  businessLocation: "Manodtechnologies (BL0001)",
  alertQty: "", manageStock: true,
  description: "", weight: "", prepTime: "",
  tax: "None", sellingPriceTaxType: "Exclusive",
  productType: "Single",
  excTax: "", incTax: "", margin: "25.00", excTaxSell: "",
  image: null, imagePreview: null,
};

// ── Export helpers (unchanged from original) ──
const exportCSV = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const headers = ["Product Name","SKU","Barcode Type","Unit","Brand","Category","Sub Category","Business Location","Alert Qty","Tax","Tax Type","Product Type","Purchase Price (Exc.)","Purchase Price (Inc.)","Margin (%)","Selling Price (Exc.)","Current Stock","Weight","Description"];
  const rows = products.map(p => [p.name,p.sku,p.barcode_type||p.barcodeType,p.unit,p.brand,p.category,p.sub_category||p.subCategory,p.business_location||p.businessLocation,p.alert_qty||p.alertQty,p.tax,p.selling_price_tax_type||p.sellingPriceTaxType,p.product_type||p.productType,p.exc_tax||p.excTax,p.inc_tax||p.incTax,p.margin,p.exc_tax_sell||p.excTaxSell,p.current_stock??p.currentStock??0,p.weight,p.description]);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${(c??'').toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="products.csv"; a.click();
  URL.revokeObjectURL(url);
};

const exportExcel = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const data = products.map(p => ({"Product Name":p.name,"SKU":p.sku||"","Unit":p.unit||"","Brand":p.brand||"","Category":p.category||"","Selling Price":p.exc_tax_sell||p.excTaxSell||"","Current Stock":p.current_stock??p.currentStock??0,"Status":p.status||"Active"}));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = Object.keys(data[0]).map(k=>({wch:Math.max(k.length+2,16)}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Products");
  XLSX.writeFile(wb,"products.xlsx");
};

const exportPDF = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const rows = products.map(p=>`<tr><td>${p.name}</td><td>${p.sku||''}</td><td>${p.unit||''}</td><td>${p.brand||''}</td><td>${p.category||''}</td><td>Rs.${p.exc_tax_sell||p.excTaxSell||'-'}</td><td>${p.current_stock??p.currentStock??0}</td><td>${p.product_type||p.productType}</td><td>${p.tax}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>Products</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}h2{color:#1a1a2e}table{width:100%;border-collapse:collapse}th{background:#2d7a3a;color:#fff;padding:7px 8px;text-align:left}td{padding:6px 8px;border-bottom:1px solid #eee}tr:nth-child(even){background:#f9f9f9}</style></head><body><h2>Products Report</h2><p style="color:#666;font-size:11px">Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>Product</th><th>SKU</th><th>Unit</th><th>Brand</th><th>Category</th><th>Selling Price</th><th>Stock</th><th>Type</th><th>Tax</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
  win.print();
};

// ── Field wrapper (unchanged from original) ──
function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <label style={s.label}>{label}</label>}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD PRODUCT FORM
// ─────────────────────────────────────────────────────────────
export function AddProductForm({ onSaved, editProduct }) {
  const [form, setForm]       = useState(editProduct ? {
    name:                editProduct.name || "",
    sku:                 editProduct.sku  || "",
    barcodeType:         editProduct.barcode_type || "Code 128 (C128)",
    unit:                editProduct.unit  || "",
    brand:               editProduct.brand || "",
    category:            editProduct.category || "",
    subCategory:         editProduct.sub_category || "",
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
    image: null, imagePreview: null,
  } : EMPTY_FORM);

  const [saving, setSaving]       = useState(false);
  const [units, setUnits]         = useState([]);
  const [brands, setBrands]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const fileRef = useRef();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load dropdown data from API
  useEffect(() => {
    const load = async () => {
      try {
        const [u, b, c] = await Promise.all([
          unitsAPI.getAll({ limit: 100 }),
          brandsAPI.getAll({ limit: 100 }),
          categoriesAPI.getAll({ limit: 100 }),
        ]);
        setUnits(u.units || []);
        setBrands(b.brands || []);
        // Split into parent categories and sub-categories
        const allCats = c.categories || [];
        setCategories(allCats.filter(cat => !cat.parent_id));
        setSubCategories(allCats.filter(cat => !!cat.parent_id));
      } catch (err) {
        console.error("Failed to load dropdown data:", err.message);
      }
    };
    load();
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("image", file);
    const reader = new FileReader();
    reader.onload = (ev) => set("imagePreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = async (andNew = false) => {
    if (!form.name.trim()) { alert("Product Name is required"); return; }
    if (!form.unit)        { alert("Unit is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name:                    form.name,
        sku:                     form.sku || null,
        barcode_type:            form.barcodeType,
        unit:                    form.unit,
        brand:                   form.brand || null,
        category:                form.category || null,
        sub_category:            form.subCategory || null,
        business_location:       form.businessLocation,
        alert_qty:               form.alertQty || 0,
        manage_stock:            form.manageStock,
        description:             form.description || null,
        weight:                  form.weight || null,
        prep_time:               form.prepTime || null,
        tax:                     form.tax,
        selling_price_tax_type:  form.sellingPriceTaxType,
        product_type:            form.productType,
        exc_tax:                 form.excTax || 0,
        inc_tax:                 form.incTax || 0,
        margin:                  form.margin || 0,
        exc_tax_sell:            form.excTaxSell || 0,
        status:                  "Active",
      };

      let saved;
      if (editProduct) {
        saved = await productsAPI.update(editProduct.id, payload);
      } else {
        saved = await productsAPI.create(payload);
      }

      if (onSaved) { onSaved(saved.product); return; }
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
      <div style={s.card}>
        <div style={s.row3}>
          <Field label="Product Name *"><input style={s.input} placeholder="e.g. Samsung Galaxy S24" value={form.name} onChange={e=>set("name",e.target.value)}/></Field>
          <Field label="SKU"><input style={s.input} placeholder="e.g. SGS24-128-BLK" value={form.sku} onChange={e=>set("sku",e.target.value)}/></Field>
          <Field label="Barcode Type *">
            <select style={s.input} value={form.barcodeType} onChange={e=>set("barcodeType",e.target.value)}>
              {BARCODE_TYPES.map(b=><option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>
        <div style={s.row3}>
          <Field label="Unit *">
            <select style={s.input} value={form.unit} onChange={e=>set("unit",e.target.value)}>
              <option value="">Please Select</option>
              {units.map(u=><option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Brand">
            <select style={s.input} value={form.brand} onChange={e=>set("brand",e.target.value)}>
              <option value="">Please Select</option>
              {brands.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select style={s.input} value={form.category} onChange={e=>set("category",e.target.value)}>
              <option value="">Please Select</option>
              {categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div style={s.row3}>
          <Field label="Sub Category">
            <select style={s.input} value={form.subCategory} onChange={e=>set("subCategory",e.target.value)}>
              <option value="">Please Select</option>
              {subCategories.map(sc=><option key={sc.id} value={sc.name}>{sc.name}</option>)}
            </select>
          </Field>
          <Field label="Business Locations">
            <div style={s.locationBox}><span style={s.locationBadge}>x {form.businessLocation}</span></div>
          </Field>
          <Field label="Alert Quantity">
            <input style={s.input} placeholder="e.g. 10" type="number" value={form.alertQty} onChange={e=>set("alertQty",e.target.value)}/>
          </Field>
        </div>
        <div style={s.row2}>
          <Field label="">
            <label style={s.checkLabel}>
              <input type="checkbox" checked={form.manageStock} onChange={e=>set("manageStock",e.target.checked)} style={{marginRight:8,accentColor:"#2d7a3a"}}/>
              <span style={{fontWeight:600,color:"#374151"}}>Manage Stock?</span>
              <span style={{color:"#888",fontSize:12,marginLeft:6,fontStyle:"italic"}}>Enable stock management at product level</span>
            </label>
          </Field>
        </div>
        <div style={s.row2}>
          <Field label="Product Description">
            <textarea style={{...s.input,height:100,resize:"vertical"}} placeholder="Enter product description..." value={form.description} onChange={e=>set("description",e.target.value)}/>
          </Field>
          <Field label="Product Image">
            <div style={s.imgArea}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="preview" style={s.imgPreview}/>
                : <div style={s.imgEmpty}>No image</div>}
              <button style={s.browseBtn} onClick={()=>fileRef.current.click()}>Browse...</button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImage}/>
              <span style={s.imgNote}>Max File size: 5MB · Aspect ratio 1:1</span>
            </div>
          </Field>
        </div>
        <div style={s.row2}>
          <Field label="Weight (kg)"><input style={s.input} placeholder="e.g. 0.5" type="number" value={form.weight} onChange={e=>set("weight",e.target.value)}/></Field>
          <Field label="Preparation Time (minutes)"><input style={s.input} placeholder="e.g. 15" type="number" value={form.prepTime} onChange={e=>set("prepTime",e.target.value)}/></Field>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.row2}>
          <Field label="Applicable Tax">
            <select style={s.input} value={form.tax} onChange={e=>set("tax",e.target.value)}>
              {TAXES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Selling Price Tax Type *">
            <select style={s.input} value={form.sellingPriceTaxType} onChange={e=>set("sellingPriceTaxType",e.target.value)}>
              {TAX_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Product Type *" style={{maxWidth:320}}>
          <select style={s.input} value={form.productType} onChange={e=>set("productType",e.target.value)}>
            {PRODUCT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </Field>
        <div style={s.pricingWrap}>
          <div style={s.pricingHead}>
            <div>Default Purchase Price</div><div>x Margin(%)</div><div>Default Selling Price</div><div>Product Image</div>
          </div>
          <div style={s.pricingBody}>
            <div style={s.pricingCell}>
              <div style={s.pricingFieldLabel}>Exc. tax *</div>
              <input style={s.input} placeholder="0.00" type="number" value={form.excTax} onChange={e=>set("excTax",e.target.value)}/>
              <div style={{...s.pricingFieldLabel,marginTop:10}}>Inc. tax *</div>
              <input style={s.input} placeholder="0.00" type="number" value={form.incTax} onChange={e=>set("incTax",e.target.value)}/>
            </div>
            <div style={s.pricingCell}>
              <input style={s.input} type="number" value={form.margin} onChange={e=>set("margin",e.target.value)}/>
            </div>
            <div style={s.pricingCell}>
              <div style={s.pricingFieldLabel}>Exc. Tax</div>
              <input style={s.input} placeholder="0.00" type="number" value={form.excTaxSell} onChange={e=>set("excTaxSell",e.target.value)}/>
            </div>
            <div style={s.pricingCell}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="product" style={{width:64,height:64,objectFit:"cover",borderRadius:6}}/>
                : <span style={{color:"#bbb",fontSize:13}}>No file chosen</span>}
              <div style={s.imgNote}>Max 5MB · 1:1</div>
            </div>
          </div>
        </div>
      </div>

      <div style={s.formFooter}>
        <button style={{...s.btnSaveStock, opacity: saving ? 0.7 : 1}} onClick={()=>save(false)} disabled={saving}>
          {saving ? "Saving..." : "Save & Add Opening Stock"}
        </button>
        <button style={{...s.btnSaveAnother, opacity: saving ? 0.7 : 1}} onClick={()=>save(true)} disabled={saving}>
          {saving ? "Saving..." : "Save And Add Another"}
        </button>
        <button style={{...s.btnSave, opacity: saving ? 0.7 : 1}} onClick={()=>save(false)} disabled={saving}>
          {saving ? "Saving..." : "Save"}
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
      <div><h1 style={{margin:0,fontSize:26,fontWeight:700,color:"#1a1a2e",marginBottom:20}}>Add New Product</h1></div>
      <AddProductForm onSaved={()=>navigate("/products/")}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIST PRODUCTS (default export)
// ─────────────────────────────────────────────────────────────
export default function ListProducts() {
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [activeTab, setActiveTab]   = useState("all");
  const [selected, setSelected]     = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productsAPI.getAll({
        page: currentPage,
        limit: showEntries,
        search,
      });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, showEntries, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(total / showEntries));

  const toggleSelect  = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll     = () => setSelected(selected.length === products.length && products.length > 0 ? [] : products.map(p => p.id));

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await productsAPI.delete(id);
      await loadProducts();
    } catch (err) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) { alert("Select at least one product"); return; }
    if (!window.confirm(`Delete ${selected.length} product(s)?`)) return;
    try {
      await Promise.all(selected.map(id => productsAPI.delete(id)));
      setSelected([]);
      await loadProducts();
    } catch (err) {
      alert(err.message || "Failed to delete products");
    }
  };

  const handleDeactivateSelected = async () => {
    if (!selected.length) { alert("Select at least one product"); return; }
    try {
      await Promise.all(selected.map(id => productsAPI.updateStatus(id, "Inactive")));
      setSelected([]);
      await loadProducts();
    } catch (err) {
      alert(err.message || "Failed to deactivate products");
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setShowEditModal(true);
  };

  const stockStyle = (qty) => {
    if (qty === 0) return { bg: "#fee2e2", color: "#991b1b" };
    if (qty < 10)  return { bg: "#fef3c7", color: "#92400e" };
    return { bg: "#d1fae5", color: "#065f46" };
  };

  return (
    <div style={s.page}>
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <span style={s.pageSubtitle}>Manage your products</span>
        </div>
        <div style={s.topBtns}>
          <button style={s.btnAdd} onClick={()=>navigate("/products/create")}>+ Add</button>
          <button style={s.btnExcel} onClick={()=>exportExcel(products)}>Download Excel</button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, padding: "10px 16px", marginBottom: 12, color: "#856404" }}>
          {error}
        </div>
      )}

      <div style={s.filtersBar}>
        <span style={{color:"#2d7a3a",fontWeight:600,fontSize:14}}>Filters</span>
        <span style={{marginLeft:"auto",color:"#2d7a3a",fontSize:18,cursor:"pointer"}}>v</span>
      </div>

      <div style={s.tabRow}>
        {[{key:"all",label:"All Products"},{key:"stock",label:"Stock Report"}].map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{...s.tab,...(activeTab===t.key?s.tabActive:{})}}>{t.label}</button>
        ))}
      </div>

      <div style={s.toolbar}>
        <div style={s.toolLeft}>
          <span style={s.toolText}>Show</span>
          <select style={s.entriesSelect} value={showEntries} onChange={e=>{setShowEntries(+e.target.value);setCurrentPage(1);}}>
            {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
          </select>
          <span style={s.toolText}>entries</span>
        </div>
        <div style={s.toolRight}>
          <button style={{...s.toolBtn,...s.toolBtnCSV}} onClick={()=>exportCSV(products)}><span style={{...s.tbIcon,background:"#1d6f42"}}>CSV</span>Export CSV</button>
          <button style={{...s.toolBtn,...s.toolBtnXLS}} onClick={()=>exportExcel(products)}><span style={{...s.tbIcon,background:"#217346"}}>XLS</span>Export Excel</button>
          <button style={s.toolBtn} onClick={()=>exportPDF(products)}>Print</button>
          <button style={s.toolBtn}>Column visibility</button>
          <button style={{...s.toolBtn,...s.toolBtnPDF}} onClick={()=>exportPDF(products)}><span style={{...s.tbIcon,background:"#d32f2f"}}>PDF</span>Export PDF</button>
          <input style={s.searchBox} placeholder="Search ..." value={searchInput} onChange={e=>{setSearchInput(e.target.value);}}/>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.theadRow}>
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
              <tr><td colSpan={14} style={s.noData}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={14} style={s.noData}>No data available in table</td></tr>
            ) : (
              products.map((p, i) => {
                const sc = stockStyle(p.current_stock ?? 0);
                return (
                  <tr key={p.id} style={i%2===0?s.rowEven:s.rowOdd}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafafa"}>
                    <td style={s.td}><input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleSelect(p.id)}/></td>
                    <td style={s.td}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{width:42,height:42,objectFit:"cover",borderRadius:6,border:"1px solid #e5e7eb"}}/>
                        : <div style={s.noImg}>-</div>}
                    </td>
                    <td style={s.td}>
                      <button style={s.actionEdit} onClick={()=>openEdit(p)}>Edit</button>
                      <button style={s.actionDel}  onClick={()=>handleDelete(p.id)}>Del</button>
                    </td>
                    <td style={{...s.td,fontWeight:500}}>{p.name}</td>
                    <td style={s.td}>{p.business_location}</td>
                    <td style={s.td}>{p.exc_tax ? `Rs.${Number(p.exc_tax).toLocaleString("en-IN")}` : "--"}</td>
                    <td style={{...s.td,fontWeight:600}}>{p.exc_tax_sell ? `Rs.${Number(p.exc_tax_sell).toLocaleString("en-IN")}` : "--"}</td>
                    <td style={s.td}><span style={{...s.stockBadge,background:sc.bg,color:sc.color}}>{p.current_stock ?? 0}</span></td>
                    <td style={s.td}>{p.product_type}</td>
                    <td style={s.td}>{p.category || "--"}</td>
                    <td style={s.td}>{p.brand || "--"}</td>
                    <td style={s.td}>{p.tax}</td>
                    <td style={{...s.td,fontFamily:"monospace",fontSize:12}}>{p.sku || "--"}</td>
                    <td style={s.td}>
                      <span style={{
                        background: p.status === "Active" ? "#d1fae5" : "#fee2e2",
                        color:      p.status === "Active" ? "#065f46" : "#991b1b",
                        borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 500
                      }}>{p.status || "Active"}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={s.bulkRow}>
        <button style={s.bulkDel}   onClick={handleDeleteSelected}>Delete Selected</button>
        <button style={s.bulkAdd}>Add to location</button>
        <button style={s.bulkRem}>Remove from location</button>
        <button style={s.bulkDeact} onClick={handleDeactivateSelected}>Deactivate Selected</button>
      </div>

      <div style={s.footerRow}>
        <span>
          Showing {products.length===0?"0":`${(currentPage-1)*showEntries+1}`} to {Math.min(currentPage*showEntries,total)} of {total} entries
        </span>
        <div style={s.pagination}>
          <button style={s.pageBtn} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>Previous</button>
          {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
            const pg = i + 1;
            return (
              <button key={pg} style={{...s.pageBtn,...(currentPage===pg?s.pageBtnActive:{})}} onClick={()=>setCurrentPage(pg)}>{pg}</button>
            );
          })}
          {totalPages > 5 && <span style={{padding:"5px 8px",color:"#6b7280"}}>...</span>}
          <button style={s.pageBtn} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Next</button>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && editProduct && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, overflowY:"auto", display:"flex", justifyContent:"center", padding:"40px 16px" }}>
          <div style={{ background:"#f9fafb", borderRadius:12, width:"100%", maxWidth:900, padding:28, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:"#1a1a2e" }}>Edit Product</h2>
              <button onClick={()=>setShowEditModal(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#666" }}>×</button>
            </div>
            <AddProductForm
              editProduct={editProduct}
              onSaved={() => { setShowEditModal(false); loadProducts(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:{fontFamily:"'Segoe UI',sans-serif",color:"#222",fontSize:14},
  titleRow:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16},
  pageTitle:{margin:0,fontSize:26,fontWeight:700,color:"#1a1a2e"},
  pageSubtitle:{fontSize:13,color:"#888"},
  topBtns:{display:"flex",gap:10},
  btnAdd:{background:"#2d7a3a",color:"#fff",border:"none",borderRadius:6,padding:"10px 22px",fontWeight:600,cursor:"pointer",fontSize:14},
  btnExcel:{background:"#217346",color:"#fff",border:"none",borderRadius:6,padding:"10px 22px",fontWeight:600,cursor:"pointer",fontSize:14},
  filtersBar:{display:"flex",alignItems:"center",padding:"12px 16px",border:"1px solid #e5e7eb",borderRadius:8,marginBottom:16,background:"#fff"},
  tabRow:{display:"flex",borderBottom:"2px solid #e5e7eb",marginBottom:16},
  tab:{padding:"10px 22px",border:"none",background:"transparent",cursor:"pointer",fontSize:14,color:"#555",fontWeight:500},
  tabActive:{color:"#2d7a3a",borderBottom:"2px solid #2d7a3a",marginBottom:-2,fontWeight:600},
  toolbar:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:12},
  toolLeft:{display:"flex",alignItems:"center",gap:8},
  toolRight:{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"},
  toolText:{fontSize:13,color:"#555"},
  entriesSelect:{border:"1px solid #d1d5db",borderRadius:4,padding:"5px 8px",fontSize:13},
  toolBtn:{background:"#fff",border:"1px solid #d1d5db",borderRadius:6,padding:"6px 12px",fontSize:12,cursor:"pointer",color:"#444",display:"flex",alignItems:"center",gap:5},
  toolBtnCSV:{},toolBtnXLS:{},toolBtnPDF:{},
  tbIcon:{color:"#fff",borderRadius:3,padding:"1px 5px",fontSize:10,fontWeight:700,background:"#1d6f42"},
  searchBox:{border:"1px solid #d1d5db",borderRadius:4,padding:"6px 10px",fontSize:13,width:170,outline:"none"},
  tableWrap:{overflowX:"auto",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff"},
  table:{width:"100%",borderCollapse:"collapse",fontSize:13},
  theadRow:{background:"#f9fafb"},
  th:{padding:"12px 10px",textAlign:"left",fontWeight:600,borderBottom:"2px solid #e5e7eb",whiteSpace:"nowrap",color:"#374151"},
  td:{padding:"10px 10px",borderBottom:"1px solid #f0f0f0",verticalAlign:"middle"},
  rowEven:{background:"#fff",transition:"background 0.15s"},
  rowOdd:{background:"#fafafa",transition:"background 0.15s"},
  noData:{textAlign:"center",padding:"48px 0",color:"#9ca3af",fontSize:14},
  noImg:{color:"#d1d5db",textAlign:"center"},
  stockBadge:{padding:"2px 10px",borderRadius:20,fontWeight:600,fontSize:12},
  actionEdit:{background:"#f0fdf4",border:"none",borderRadius:4,cursor:"pointer",fontSize:12,padding:"4px 8px",marginRight:4,color:"#2d7a3a",fontWeight:500},
  actionDel:{background:"#fee2e2",border:"none",borderRadius:4,cursor:"pointer",fontSize:12,padding:"4px 8px",color:"#ef4444",fontWeight:500},
  bulkRow:{display:"flex",gap:8,marginTop:14,alignItems:"center",flexWrap:"wrap"},
  bulkDel:{background:"#fff",border:"1px solid #ef4444",color:"#ef4444",borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:500},
  bulkAdd:{background:"#fff",border:"1px solid #2d7a3a",color:"#2d7a3a",borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:500},
  bulkRem:{background:"#fff",border:"1px solid #6b7280",color:"#6b7280",borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:500},
  bulkDeact:{background:"#fff",border:"1px solid #f59e0b",color:"#d97706",borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:500},
  footerRow:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,fontSize:13,color:"#6b7280"},
  pagination:{display:"flex",gap:6},
  pageBtn:{background:"#fff",border:"1px solid #d1d5db",borderRadius:4,padding:"5px 14px",cursor:"pointer",fontSize:13,color:"#374151"},
  pageBtnActive:{background:"#2d7a3a",color:"#fff",border:"1px solid #2d7a3a"},
  formPage:{display:"flex",flexDirection:"column",gap:20},
  card:{background:"#fff",borderRadius:10,padding:"24px 28px",border:"1px solid #e5e7eb",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"},
  row3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:4},
  row2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:4},
  label:{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5},
  input:{width:"100%",border:"1px solid #d1d5db",borderRadius:6,padding:"8px 10px",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"},
  locationBox:{padding:"7px 10px",border:"1px solid #2d7a3a",borderRadius:6,background:"#f0fdf4"},
  locationBadge:{background:"#2d7a3a",color:"#fff",borderRadius:4,padding:"3px 10px",fontSize:12,fontWeight:500},
  checkLabel:{display:"flex",alignItems:"center",fontSize:13,cursor:"pointer",paddingTop:6},
  imgArea:{display:"flex",flexDirection:"column",gap:8},
  imgPreview:{width:80,height:80,objectFit:"cover",borderRadius:8,border:"1px solid #e5e7eb"},
  imgEmpty:{width:80,height:80,background:"#f9fafb",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#d1d5db",fontSize:12,border:"1px dashed #d1d5db"},
  browseBtn:{background:"#2d7a3a",color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",cursor:"pointer",fontSize:13,width:"fit-content"},
  imgNote:{fontSize:11,color:"#9ca3af"},
  pricingWrap:{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",marginTop:16},
  pricingHead:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",background:"#2d7a3a",color:"#fff",padding:"12px 16px",fontWeight:600,fontSize:13},
  pricingBody:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"16px",gap:16,background:"#fff"},
  pricingCell:{display:"flex",flexDirection:"column",gap:6},
  pricingFieldLabel:{fontSize:12,fontWeight:600,color:"#6b7280"},
  formFooter:{display:"flex",justifyContent:"center",gap:12,padding:"20px 0 8px"},
  btnSaveStock:{background:"#374151",color:"#fff",border:"none",borderRadius:6,padding:"12px 22px",cursor:"pointer",fontSize:14,fontWeight:600},
  btnSaveAnother:{background:"#2d7a3a",color:"#fff",border:"none",borderRadius:6,padding:"12px 22px",cursor:"pointer",fontSize:14,fontWeight:600},
  btnSave:{background:"linear-gradient(135deg,#2d7a3a,#1a5c28)",color:"#fff",border:"none",borderRadius:6,padding:"12px 32px",cursor:"pointer",fontSize:14,fontWeight:600},
};
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const UNITS = ["Piece", "Kg", "Litre", "Box", "Pack", "Dozen"];
const BRANDS = ["Samsung", "Apple", "Sony", "LG", "Bosch", "Generic"];
const CATEGORIES = ["Electronics", "Clothing", "Food & Beverage", "Stationery", "Home & Kitchen", "Other"];
const SUB_CATEGORIES = ["Mobile Phones", "Laptops", "Accessories", "Kitchen Appliances", "Office Supplies", "Beverages"];
const TAXES = ["None", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];
const TAX_TYPES = ["Exclusive", "Inclusive"];
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

const SEED_PRODUCTS = [
  { id: 1, name: "Samsung Galaxy S24", sku: "SGS24-128-BLK", barcodeType: "EAN-13", unit: "Piece", brand: "Samsung", category: "Electronics", subCategory: "Mobile Phones", businessLocation: "Manodtechnologies (BL0001)", alertQty: "5", manageStock: true, description: "Latest Samsung flagship smartphone", weight: "0.167", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "52999", incTax: "62539", margin: "22.00", excTaxSell: "64690", image: null, imagePreview: null, currentStock: 42 },
  { id: 2, name: "Apple iPhone 15 Pro", sku: "AIPH15P-256", barcodeType: "EAN-13", unit: "Piece", brand: "Apple", category: "Electronics", subCategory: "Mobile Phones", businessLocation: "Manodtechnologies (BL0001)", alertQty: "3", manageStock: true, description: "Apple iPhone 15 Pro 256GB", weight: "0.187", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "109900", incTax: "129682", margin: "18.00", excTaxSell: "134990", image: null, imagePreview: null, currentStock: 18 },
  { id: 3, name: "Sony WH-1000XM5 Headphones", sku: "SNY-WH1000XM5", barcodeType: "Code 128 (C128)", unit: "Piece", brand: "Sony", category: "Electronics", subCategory: "Accessories", businessLocation: "Manodtechnologies (BL0001)", alertQty: "8", manageStock: true, description: "Industry-leading noise cancelling headphones", weight: "0.250", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "22000", incTax: "25960", margin: "25.00", excTaxSell: "29990", image: null, imagePreview: null, currentStock: 35 },
  { id: 4, name: "LG 32\" 4K Monitor", sku: "LG-32UN880-B", barcodeType: "EAN-13", unit: "Piece", brand: "LG", category: "Electronics", subCategory: "Accessories", businessLocation: "Manodtechnologies (BL0001)", alertQty: "4", manageStock: true, description: "32 inch UltraFine 4K USB-C Monitor", weight: "5.900", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "41500", incTax: "48970", margin: "20.00", excTaxSell: "49990", image: null, imagePreview: null, currentStock: 12 },
  { id: 5, name: "Bosch Cordless Drill Set", sku: "BSH-GSR12V-15", barcodeType: "Code 128 (C128)", unit: "Piece", brand: "Bosch", category: "Home & Kitchen", subCategory: "Kitchen Appliances", businessLocation: "Manodtechnologies (BL0001)", alertQty: "6", manageStock: true, description: "12V Professional Cordless Drill/Driver", weight: "1.100", prepTime: "", tax: "GST 12%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "5200", incTax: "5824", margin: "30.00", excTaxSell: "6999", image: null, imagePreview: null, currentStock: 27 },
  { id: 6, name: "A4 Premium Copy Paper 500 Sheets", sku: "PAPER-A4-500", barcodeType: "EAN-8", unit: "Pack", brand: "Generic", category: "Stationery", subCategory: "Office Supplies", businessLocation: "Manodtechnologies (BL0001)", alertQty: "20", manageStock: true, description: "80 GSM A4 White Copy Paper", weight: "2.400", prepTime: "", tax: "GST 5%", sellingPriceTaxType: "Inclusive", productType: "Single", excTax: "285", incTax: "299", margin: "20.00", excTaxSell: "349", image: null, imagePreview: null, currentStock: 156 },
  { id: 7, name: "Nescafe Gold Blend 200g", sku: "NSCF-GOLD-200", barcodeType: "EAN-13", unit: "Box", brand: "Generic", category: "Food & Beverage", subCategory: "Beverages", businessLocation: "Manodtechnologies (BL0001)", alertQty: "15", manageStock: true, description: "Premium instant coffee blend, 200g jar", weight: "0.280", prepTime: "", tax: "GST 5%", sellingPriceTaxType: "Inclusive", productType: "Single", excTax: "445", incTax: "467", margin: "22.00", excTaxSell: "549", image: null, imagePreview: null, currentStock: 88 },
  { id: 8, name: "MacBook Air M3 13-inch", sku: "APPL-MBA-M3-256", barcodeType: "EAN-13", unit: "Piece", brand: "Apple", category: "Electronics", subCategory: "Laptops", businessLocation: "Manodtechnologies (BL0001)", alertQty: "2", manageStock: true, description: "MacBook Air 13-inch, M3 chip, 8GB RAM, 256GB SSD", weight: "1.240", prepTime: "", tax: "GST 18%", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "88999", incTax: "105019", margin: "15.00", excTaxSell: "114900", image: null, imagePreview: null, currentStock: 9 },
  { id: 9, name: "Classmate Notebook 200 Pages", sku: "CLS-NB200-RLD", barcodeType: "EAN-8", unit: "Piece", brand: "Generic", category: "Stationery", subCategory: "Office Supplies", businessLocation: "Manodtechnologies (BL0001)", alertQty: "50", manageStock: true, description: "A4 Ruled Notebook, 200 pages", weight: "0.320", prepTime: "", tax: "None", sellingPriceTaxType: "Exclusive", productType: "Single", excTax: "55", incTax: "55", margin: "35.00", excTaxSell: "75", image: null, imagePreview: null, currentStock: 240 },
  { id: 10, name: "Instant Noodles Masala Pack 12x", sku: "MAGGI-12PK-MSL", barcodeType: "EAN-13", unit: "Box", brand: "Generic", category: "Food & Beverage", subCategory: "Beverages", businessLocation: "Manodtechnologies (BL0001)", alertQty: "30", manageStock: true, description: "Masala Instant Noodles, 12-pack carton", weight: "0.840", prepTime: "", tax: "GST 5%", sellingPriceTaxType: "Inclusive", productType: "Single", excTax: "140", incTax: "147", margin: "15.00", excTaxSell: "169", image: null, imagePreview: null, currentStock: 0 },
];

let _products = [...SEED_PRODUCTS];
let _listeners = [];
const subscribe = (fn) => { _listeners.push(fn); return () => { _listeners = _listeners.filter(l => l !== fn); }; };
const getProducts = () => _products;
const setProducts = (updater) => {
  _products = typeof updater === "function" ? updater(_products) : updater;
  _listeners.forEach(fn => fn(_products));
};

const exportCSV = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const headers = ["Product Name","SKU","Barcode Type","Unit","Brand","Category","Sub Category","Business Location","Alert Qty","Tax","Tax Type","Product Type","Purchase Price (Exc.)","Purchase Price (Inc.)","Margin (%)","Selling Price (Exc.)","Current Stock","Weight","Description"];
  const rows = products.map(p => [p.name,p.sku,p.barcodeType,p.unit,p.brand,p.category,p.subCategory,p.businessLocation,p.alertQty,p.tax,p.sellingPriceTaxType,p.productType,p.excTax,p.incTax,p.margin,p.excTaxSell,p.currentStock??0,p.weight,p.description]);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${(c??'').toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="products.csv"; a.click();
  URL.revokeObjectURL(url);
};

const exportExcel = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const data = products.map(p => ({"Product Name":p.name,"SKU":p.sku||"","Barcode Type":p.barcodeType||"","Unit":p.unit||"","Brand":p.brand||"","Category":p.category||"","Sub Category":p.subCategory||"","Business Location":p.businessLocation||"","Alert Qty":p.alertQty||"","Applicable Tax":p.tax||"","Tax Type":p.sellingPriceTaxType||"","Product Type":p.productType||"","Purchase Price (Exc. Tax)":p.excTax||"","Purchase Price (Inc. Tax)":p.incTax||"","Margin (%)":p.margin||"","Selling Price (Exc. Tax)":p.excTaxSell||"","Current Stock":p.currentStock??0,"Weight (kg)":p.weight||"","Description":p.description||""}));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = Object.keys(data[0]).map(k=>({wch:Math.max(k.length+2,18)}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Products");
  XLSX.writeFile(wb,"products.xlsx");
};

const exportPDF = (products) => {
  if (!products.length) { alert("No products to export"); return; }
  const rows = products.map(p=>`<tr><td>${p.name}</td><td>${p.sku||''}</td><td>${p.unit||''}</td><td>${p.brand||''}</td><td>${p.category||''}</td><td>Rs.${p.excTaxSell||'-'}</td><td>${p.currentStock??0}</td><td>${p.productType}</td><td>${p.tax}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>Products</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}h2{color:#1a1a2e}table{width:100%;border-collapse:collapse}th{background:#2d7a3a;color:#fff;padding:7px 8px;text-align:left}td{padding:6px 8px;border-bottom:1px solid #eee}tr:nth-child(even){background:#f9f9f9}.footer{margin-top:20px;font-size:10px;color:#999;text-align:center}</style></head><body><h2>Products Report</h2><p style="color:#666;font-size:11px">Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>Product</th><th>SKU</th><th>Unit</th><th>Brand</th><th>Category</th><th>Selling Price</th><th>Stock</th><th>Type</th><th>Tax</th></tr></thead><tbody>${rows}</tbody></table><div class="footer">Manod Technologies - V7.0 | Copyright 2026</div></body></html>`;
  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
  win.print();
};

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <label style={s.label}>{label}</label>}
      {children}
    </div>
  );
}

export function AddProductForm({ onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const fileRef = useRef();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("image", file);
    const reader = new FileReader();
    reader.onload = (ev) => set("imagePreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = (andNew = false) => {
    if (!form.name.trim()) { alert("Product Name is required"); return; }
    if (!form.unit) { alert("Unit is required"); return; }
    const product = { ...form, id: Date.now(), currentStock: 0 };
    setProducts(prev => [...prev, product]);
    if (onSaved) { onSaved(product); return; }
    if (andNew) setForm(EMPTY_FORM);
    else navigate("/products/");
  };

  return (
    <div style={s.formPage}>
      <div style={s.card}>
        <div style={s.row3}>
          <Field label="Product Name *"><input style={s.input} placeholder="e.g. Samsung Galaxy S24" value={form.name} onChange={e=>set("name",e.target.value)}/></Field>
          <Field label="SKU"><input style={s.input} placeholder="e.g. SGS24-128-BLK" value={form.sku} onChange={e=>set("sku",e.target.value)}/></Field>
          <Field label="Barcode Type *"><select style={s.input} value={form.barcodeType} onChange={e=>set("barcodeType",e.target.value)}>{BARCODE_TYPES.map(b=><option key={b}>{b}</option>)}</select></Field>
        </div>
        <div style={s.row3}>
          <Field label="Unit *"><select style={s.input} value={form.unit} onChange={e=>set("unit",e.target.value)}><option value="">Please Select</option>{UNITS.map(u=><option key={u}>{u}</option>)}</select></Field>
          <Field label="Brand"><select style={s.input} value={form.brand} onChange={e=>set("brand",e.target.value)}><option value="">Please Select</option>{BRANDS.map(b=><option key={b}>{b}</option>)}</select></Field>
          <Field label="Category"><select style={s.input} value={form.category} onChange={e=>set("category",e.target.value)}><option value="">Please Select</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
        </div>
        <div style={s.row3}>
          <Field label="Sub Category"><select style={s.input} value={form.subCategory} onChange={e=>set("subCategory",e.target.value)}><option value="">Please Select</option>{SUB_CATEGORIES.map(sc=><option key={sc}>{sc}</option>)}</select></Field>
          <Field label="Business Locations"><div style={s.locationBox}><span style={s.locationBadge}>x {form.businessLocation}</span></div></Field>
          <Field label="Alert Quantity"><input style={s.input} placeholder="e.g. 10" type="number" value={form.alertQty} onChange={e=>set("alertQty",e.target.value)}/></Field>
        </div>
        <div style={s.row2}>
          <Field label=""><label style={s.checkLabel}><input type="checkbox" checked={form.manageStock} onChange={e=>set("manageStock",e.target.checked)} style={{marginRight:8,accentColor:"#2d7a3a"}}/><span style={{fontWeight:600,color:"#374151"}}>Manage Stock?</span><span style={{color:"#888",fontSize:12,marginLeft:6,fontStyle:"italic"}}>Enable stock management at product level</span></label></Field>
        </div>
        <div style={s.row2}>
          <Field label="Product Description"><textarea style={{...s.input,height:100,resize:"vertical"}} placeholder="Enter product description..." value={form.description} onChange={e=>set("description",e.target.value)}/></Field>
          <Field label="Product Image">
            <div style={s.imgArea}>
              {form.imagePreview?<img src={form.imagePreview} alt="preview" style={s.imgPreview}/>:<div style={s.imgEmpty}>No image</div>}
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
          <Field label="Applicable Tax"><select style={s.input} value={form.tax} onChange={e=>set("tax",e.target.value)}>{TAXES.map(t=><option key={t}>{t}</option>)}</select></Field>
          <Field label="Selling Price Tax Type *"><select style={s.input} value={form.sellingPriceTaxType} onChange={e=>set("sellingPriceTaxType",e.target.value)}>{TAX_TYPES.map(t=><option key={t}>{t}</option>)}</select></Field>
        </div>
        <Field label="Product Type *" style={{maxWidth:320}}><select style={s.input} value={form.productType} onChange={e=>set("productType",e.target.value)}>{PRODUCT_TYPES.map(t=><option key={t}>{t}</option>)}</select></Field>
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
            <div style={s.pricingCell}><input style={s.input} type="number" value={form.margin} onChange={e=>set("margin",e.target.value)}/></div>
            <div style={s.pricingCell}>
              <div style={s.pricingFieldLabel}>Exc. Tax</div>
              <input style={s.input} placeholder="0.00" type="number" value={form.excTaxSell} onChange={e=>set("excTaxSell",e.target.value)}/>
            </div>
            <div style={s.pricingCell}>
              {form.imagePreview?<img src={form.imagePreview} alt="product" style={{width:64,height:64,objectFit:"cover",borderRadius:6}}/>:<span style={{color:"#bbb",fontSize:13}}>No file chosen</span>}
              <div style={s.imgNote}>Max 5MB · 1:1</div>
            </div>
          </div>
        </div>
      </div>

      <div style={s.formFooter}>
        <button style={s.btnSaveStock} onClick={()=>save(false)}>Save &amp; Add Opening Stock</button>
        <button style={s.btnSaveAnother} onClick={()=>save(true)}>Save And Add Another</button>
        <button style={s.btnSave} onClick={()=>save(false)}>Save</button>
      </div>
    </div>
  );
}

export function AddProductPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div><h1 style={{margin:0,fontSize:26,fontWeight:700,color:"#1a1a2e",marginBottom:20}}>Add New Product</h1></div>
      <AddProductForm onSaved={()=>navigate("/products/")}/>
    </div>
  );
}

export default function ListProducts() {
  const navigate = useNavigate();
  const [products, setLocalProducts] = useState(getProducts());
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useState(() => { const unsub = subscribe(setLocalProducts); return unsub; });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku||"").toLowerCase().includes(search.toLowerCase()) ||
    (p.category||"").toLowerCase().includes(search.toLowerCase()) ||
    (p.brand||"").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / showEntries));
  const paginated = filtered.slice((currentPage-1)*showEntries, currentPage*showEntries);

  const toggleSelect = (id) => setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const toggleAll = () => setSelected(selected.length===paginated.length?[]:paginated.map(p=>p.id));

  const deleteProduct = (id) => {
    if (!window.confirm("Delete this product?")) return;
    setProducts(prev=>prev.filter(p=>p.id!==id));
    setLocalProducts(getProducts());
  };

  const deleteSelected = () => {
    if (!selected.length) { alert("Select at least one product"); return; }
    if (!window.confirm(`Delete ${selected.length} product(s)?`)) return;
    setProducts(prev=>prev.filter(p=>!selected.includes(p.id)));
    setLocalProducts(getProducts());
    setSelected([]);
  };

  const stockStyle = (qty) => {
    if (qty===0) return {bg:"#fee2e2",color:"#991b1b"};
    if (qty<10) return {bg:"#fef3c7",color:"#92400e"};
    return {bg:"#d1fae5",color:"#065f46"};
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
          <input style={s.searchBox} placeholder="Search ..." value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}}/>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.theadRow}>
              <th style={s.th}><input type="checkbox" checked={selected.length===paginated.length&&paginated.length>0} onChange={toggleAll}/></th>
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
            </tr>
          </thead>
          <tbody>
            {paginated.length===0?(
              <tr><td colSpan={13} style={s.noData}>No data available in table</td></tr>
            ):(
              paginated.map((p,i)=>{
                const sc=stockStyle(p.currentStock??0);
                return (
                  <tr key={p.id} style={i%2===0?s.rowEven:s.rowOdd}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafafa"}>
                    <td style={s.td}><input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleSelect(p.id)}/></td>
                    <td style={s.td}>{p.imagePreview?<img src={p.imagePreview} alt={p.name} style={{width:42,height:42,objectFit:"cover",borderRadius:6,border:"1px solid #e5e7eb"}}/>:<div style={s.noImg}>-</div>}</td>
                    <td style={s.td}>
                      <button style={s.actionEdit} onClick={()=>navigate("/products/create")}>Edit</button>
                      <button style={s.actionDel} onClick={()=>deleteProduct(p.id)}>Del</button>
                    </td>
                    <td style={{...s.td,fontWeight:500}}>{p.name}</td>
                    <td style={s.td}>{p.businessLocation}</td>
                    <td style={s.td}>{p.excTax?`Rs.${Number(p.excTax).toLocaleString("en-IN")}`:"--"}</td>
                    <td style={{...s.td,fontWeight:600}}>{p.excTaxSell?`Rs.${Number(p.excTaxSell).toLocaleString("en-IN")}`:"--"}</td>
                    <td style={s.td}><span style={{...s.stockBadge,background:sc.bg,color:sc.color}}>{p.currentStock??0}</span></td>
                    <td style={s.td}>{p.productType}</td>
                    <td style={s.td}>{p.category||"--"}</td>
                    <td style={s.td}>{p.brand||"--"}</td>
                    <td style={s.td}>{p.tax}</td>
                    <td style={{...s.td,fontFamily:"monospace",fontSize:12}}>{p.sku||"--"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={s.bulkRow}>
        <button style={s.bulkDel} onClick={deleteSelected}>Delete Selected</button>
        <button style={s.bulkAdd}>Add to location</button>
        <button style={s.bulkRem}>Remove from location</button>
        <button style={s.bulkDeact}>Deactivate Selected</button>
      </div>

      <div style={s.footerRow}>
        <span>Showing {paginated.length===0?"0":`${(currentPage-1)*showEntries+1}`} to {Math.min(currentPage*showEntries,filtered.length)} of {filtered.length} entries</span>
        <div style={s.pagination}>
          <button style={s.pageBtn} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>Previous</button>
          {Array.from({length:totalPages},(_,i)=>(
            <button key={i+1} style={{...s.pageBtn,...(currentPage===i+1?s.pageBtnActive:{})}} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
          ))}
          <button style={s.pageBtn} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Next</button>
        </div>
      </div>
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
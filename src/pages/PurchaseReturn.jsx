/**
 * ============================================================
 * src/pages/PurchaseReturn.jsx  (UPDATED)
 * Changes:
 *   1. List view: Edit + Delete buttons added to every row
 *   2. Action column shows View + Edit + Delete (matches design)
 * ============================================================
 */
import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('manod_token') || ''}`,
});
const apiFetch = async (method, path, body = null) => {
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const colors = { success:"#1a5c38", error:"#dc2626", info:"#3b82f6" };
  return (
    <div style={{
      position:"fixed",top:24,right:24,zIndex:9999,background:"#fff",borderRadius:10,
      padding:"14px 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
      borderLeft:`5px solid ${colors[type]||"#1a5c38"}`,
      display:"flex",alignItems:"center",gap:12,minWidth:280,maxWidth:380,animation:"slideIn 0.25s ease",
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{fontSize:14,color:"#111",flex:1,fontWeight:500}}>{message}</span>
      <button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#9ca3af"}}>×</button>
    </div>
  );
}
function useToast() {
  const [toast,setToast] = useState(null);
  const showToast = (message,type="success") => { setToast({message,type}); setTimeout(()=>setToast(null),3500); };
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/> : null;
  return {showToast,ToastEl};
}

// ── Export helpers ────────────────────────────────────────────────────────────
const exportCSV = (data,headers,filename) => {
  const rows=[headers.join(","),...data.map(r=>headers.map(h=>`"${String(r[h]??"").replace(/"/g,'""')}"`).join(","))];
  const blob=new Blob([rows.join("\n")],{type:"text/csv;charset=utf-8;"});
  const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:filename});
  document.body.appendChild(a);a.click();document.body.removeChild(a);
};
const exportExcel = (data,headers,filename) => {
  const xmlRows=data.map(r=>`<Row>${headers.map(h=>`<Cell><Data ss:Type="String">${String(r[h]??"")}</Data></Cell>`).join("")}</Row>`).join("");
  const headerRow=`<Row>${headers.map(h=>`<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>`;
  const xml=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="header"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Sheet1"><Table>${headerRow}${xmlRows}</Table></Worksheet></Workbook>`;
  const blob=new Blob([xml],{type:"application/vnd.ms-excel;charset=utf-8;"});
  const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:filename});
  document.body.appendChild(a);a.click();document.body.removeChild(a);
};
const exportPDF = (title,columns,data) => {
  const w=window.open("","_blank");
  const rows=data.length===0?`<tr><td colspan="${columns.length}" style="text-align:center;padding:20px;color:#888;">No data</td></tr>`:data.map(r=>`<tr>${columns.map(c=>`<td style="padding:8px 12px;border-bottom:1px solid #eee;">${r[c.key]??""}</td>`).join("")}</tr>`).join("");
  const ths=columns.map(c=>`<th style="padding:10px 12px;text-align:left;background:#1a5c38;color:#fff;font-weight:600;">${c.label}</th>`).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:24px;}h2{color:#1a5c38;}table{width:100%;border-collapse:collapse;font-size:13px;}@media print{button{display:none}}</style></head><body><h2>${title}</h2><table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table><div style="margin-top:40px;text-align:right;"><button onclick="window.print()" style="background:#1a5c38;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">🖨️ Print</button></div></body></html>`);
  w.document.close();
};

// ── Column visibility ─────────────────────────────────────────────────────────
function ColVisModal({columns,visibleCols,setVisibleCols,onClose}) {
  const toggle=key=>setVisibleCols(p=>p.includes(key)?p.filter(k=>k!==key):[...p,key]);
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{...modalStyle,minWidth:260,padding:24}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={modalClose}>×</button>
        <h3 style={{marginTop:0,marginBottom:16,fontSize:16}}>Toggle Columns</h3>
        {columns.map(col=>(
          <label key={col.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"pointer",fontSize:14}}>
            <input type="checkbox" checked={visibleCols.includes(col.key)} onChange={()=>toggle(col.key)} style={{width:16,height:16,accentColor:"#1a5c38"}}/>
            {col.label}
          </label>
        ))}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
          <button onClick={onClose} style={greenBtn}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Export Toolbar ────────────────────────────────────────────────────────────
function ExportToolbar({showEntries,setShowEntries,search,setSearch,onExportCSV,onExportExcel,onExportPDF,columns,visibleCols,setVisibleCols}) {
  const [showColModal,setShowColModal]=useState(false);
  const btns=[
    {label:"Export CSV",tag:"csv",tagColor:"#1a5c38",bg:"#e8f5ee",border:"#86efac",color:"#1a5c38",fn:onExportCSV},
    {label:"Export Excel",tag:"xls",tagColor:"#1a5c38",bg:"#e8f5ee",border:"#86efac",color:"#1a5c38",fn:onExportExcel},
    {label:"Print",color:"#2563eb",bg:"#eff6ff",border:"#93c5fd",fn:()=>window.print(),icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>},
    {label:"Column visibility",color:"#7c3aed",bg:"#f5f3ff",border:"#c4b5fd",fn:()=>setShowColModal(true),icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>},
    {label:"Export PDF",color:"#dc2626",bg:"#fef2f2",border:"#fca5a5",fn:onExportPDF,hasDropdown:true,icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
  ];
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:13,color:"#555"}}>Show</span>
        <select value={showEntries} onChange={e=>setShowEntries(Number(e.target.value))} style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13,color:"#374151",background:"#fff",cursor:"pointer"}}>
          {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
        </select>
        <span style={{fontSize:13,color:"#555"}}>entries</span>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {btns.map(({label,icon,tag,tagColor,color,bg,border,fn,hasDropdown})=>(
          <button key={label} onClick={fn} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 13px",border:`1px solid ${border||"#d1d5db"}`,borderRadius:6,background:bg||"#fff",color,cursor:"pointer",fontSize:13,fontWeight:500}}
            onMouseEnter={e=>{e.currentTarget.style.opacity="0.82";}}
            onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>
            {tag?<span style={{background:tagColor,color:"#fff",borderRadius:3,fontSize:9,fontWeight:800,padding:"1px 4px",textTransform:"uppercase"}}>{tag}</span>:icon}
            {label}{hasDropdown&&<span style={{marginLeft:2,fontSize:10}}>▼</span>}
          </button>
        ))}
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{border:"1px solid #d1d5db",borderRadius:6,padding:"7px 12px",fontSize:13,width:160,outline:"none",color:"#374151"}}/>
      </div>
      {showColModal&&<ColVisModal columns={columns} visibleCols={visibleCols} setVisibleCols={setVisibleCols} onClose={()=>setShowColModal(false)}/>}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const LOCATIONS = ["Manodtechnologies (BL0001)","Warehouse 2","Warehouse 3"];
const PAYMENT_METHODS = ["Cash","Card","Bank Transfer","Cheque","UPI"];

const LIST_COLS = [
  {key:"return_date",     label:"Date"},
  {key:"return_number",   label:"Reference No"},
  {key:"purchase_ref",    label:"Parent Purchase"},
  {key:"location",        label:"Location"},
  {key:"supplier_name",   label:"Supplier"},
  {key:"payment_status",  label:"Payment Status"},
  {key:"total_amount",    label:"Grand Total"},
  {key:"payment_due",     label:"Payment Due"},
];

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN") : "—";
const fmtINR  = n => `₹${parseFloat(n||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`;

const statusBadge = status => {
  const c={Paid:"#1a5c38",Due:"#dc2626",Partial:"#e67e22"}[status]||"#6b7280";
  return <span style={{background:`${c}18`,color:c,border:`1px solid ${c}40`,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>{status}</span>;
};

const Spinner = () => (
  <div style={{display:"flex",justifyContent:"center",padding:60}}>
    <div style={{width:36,height:36,border:"4px solid #e5e7eb",borderTopColor:"#1a5c38",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

function ConfirmModal({message,onConfirm,onCancel}) {
  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={{...modalStyle,maxWidth:380,padding:28,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
        <h3 style={{margin:"0 0 10px",fontSize:17,fontWeight:700}}>Delete Return?</h3>
        <p style={{fontSize:14,color:"#6b7280",margin:"0 0 24px"}}>{message}</p>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={onCancel} style={cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={{...cancelBtn,background:"#dc2626"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ADD / EDIT PURCHASE RETURN FORM ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function PurchaseReturnForm({onSubmit, onCancel, editData=null}) {
  const {showToast,ToastEl} = useToast();
  const isEdit = !!editData;
  const [saving, setSaving] = useState(false);

  const [suppliers,        setSuppliers]        = useState([]);
  const [supplierSearch,   setSupplierSearch]   = useState('');
  const [showSupplierDrop, setShowSupplierDrop] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [productSearch,     setProductSearch]     = useState('');
  const [productSuggestions,setProductSuggestions]= useState([]);
  const [showProdDrop,      setShowProdDrop]      = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [products,          setProducts]          = useState([]);

  const [form, setForm] = useState({
    location:'', parentPurchase:'', refNo:'', reason:'',
    purchaseTax:'None', paymentMethod:'Cash', paymentAmount:'0', paymentNote:'',
  });
  const [docFile, setDocFile] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    fetch(`${BASE_URL}/contacts?contactType=Suppliers&limit=500`, {headers:authHeaders()})
      .then(r=>r.json())
      .then(d=>{
        const list = d.contacts||[];
        setSuppliers(list.map(c=>({
          id: c.id,
          name: (c.name||c.business_name||c.first_name||'').trim()||`Supplier #${c.id}`,
          mobile: c.mobile||'',
        })).filter(s=>s.name));
      }).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!editData) return;
    setForm({
      location:        editData.location||'',
      parentPurchase:  editData.purchase_ref||editData.parentPurchase||'',
      refNo:           editData.return_number||'',
      purchaseTax:     editData.tax_label||'None',
      reason:          editData.reason||'',
      paymentMethod:   'Cash',
      paymentAmount:   String(editData.amount_paid||0),
      paymentNote:     editData.payment_note||'',
    });
    if(editData.supplier_name){
      setSupplierSearch(editData.supplier_name);
      setSelectedSupplier({id:editData.supplier_id, name:editData.supplier_name});
    }
    if(Array.isArray(editData.items)){
      setProducts(editData.items.map(i=>({
        name:      i.product_name,
        sku:       i.product_sku||'',
        qty:       parseFloat(i.quantity)||1,
        unitPrice: parseFloat(i.unit_cost)||parseFloat(i.unit_price)||0,
        subtotal:  parseFloat(i.total_amount)||parseFloat(i.subtotal)||0,
      })));
    }
  },[editData]);

  const handleProductFocus = async () => {
    if(productSuggestions.length===0){
      setSearchingProducts(true);
      try {
        const data = await apiFetch('GET',`/purchases/products/search?q=`);
        setProductSuggestions(data.products||[]);
      } catch { setProductSuggestions([]); }
      finally { setSearchingProducts(false); }
    }
    setShowProdDrop(true);
  };

  const handleProductSearchChange = async (val) => {
    setProductSearch(val);
    setSearchingProducts(true);
    try {
      const data = await apiFetch('GET',`/purchases/products/search?q=${encodeURIComponent(val)}`);
      setProductSuggestions(data.products||[]);
      setShowProdDrop(true);
    } catch { setProductSuggestions([]); }
    finally { setSearchingProducts(false); }
  };

  const handleSelectProduct = (p) => {
    setProducts(prev=>[...prev,{
      name:p.name, sku:p.sku||'',
      qty:1, unitPrice:parseFloat(p.default_price)||0,
      subtotal:parseFloat(p.default_price)||0,
    }]);
    setProductSearch(''); setShowProdDrop(false);
  };

  const handleAddManual = () => {
    if(!productSearch.trim()) return;
    setProducts(p=>[...p,{name:productSearch,sku:'',qty:1,unitPrice:0,subtotal:0}]);
    setProductSearch(''); setShowProdDrop(false);
  };

  const updateProduct = (i,field,val) => {
    setProducts(prev=>{
      const arr=[...prev];
      arr[i]={...arr[i],[field]:parseFloat(val)||0};
      arr[i].subtotal=(field==='qty'?parseFloat(val)||0:arr[i].qty)*(field==='unitPrice'?parseFloat(val)||0:arr[i].unitPrice);
      return arr;
    });
  };

  const taxRates = {'GST 5%':0.05,'GST 12%':0.12,'GST 18%':0.18};
  const subTotal = products.reduce((s,p)=>s+Number(p.subtotal),0);
  const taxAmt   = subTotal*(taxRates[form.purchaseTax]||0);
  const totalAmt = subTotal+taxAmt;

  const handleSubmit = async () => {
    if(!selectedSupplier)    { showToast("Please select a supplier","error"); return; }
    if(!form.location)       { showToast("Please select a location","error"); return; }
    if(products.length===0)  { showToast("Please add at least one product","error"); return; }

    setSaving(true);
    try {
      const body = {
        supplier_id:    selectedSupplier.id,
        supplier_name:  selectedSupplier.name,
        location:       form.location,
        purchase_ref:   form.parentPurchase||null,
        return_number:  form.refNo||null,
        reason:         form.reason||null,
        tax_label:      form.purchaseTax,
        tax_amount:     taxAmt,
        subtotal:       subTotal,
        total_amount:   totalAmt,
        payment_status: parseFloat(form.paymentAmount)>=totalAmt&&totalAmt>0 ? 'Paid'
                       : parseFloat(form.paymentAmount)>0 ? 'Partial' : 'Due',
        payment_due:    Math.max(0, totalAmt - (parseFloat(form.paymentAmount)||0)),
        amount_paid:    parseFloat(form.paymentAmount)||0,
        items: products.map(p=>({
          product_name: p.name,
          product_sku:  p.sku||null,
          quantity:     p.qty,
          unit_price:   p.unitPrice,
          subtotal:     p.subtotal,
        })),
      };

      let result;
      if(isEdit){
        result = await apiFetch('PUT', `/purchase-returns/${editData.id}`, body);
        showToast("Return updated successfully!","success");
      } else {
        result = await apiFetch('POST', '/purchase-returns', body);
        showToast("Return submitted!","success");
      }
      setTimeout(()=>onSubmit(result.purchaseReturn||result), 1200);
    } catch(err){
      showToast(err.message||"Failed to save","error");
    } finally { setSaving(false); }
  };

  return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:1000}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onCancel} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6b7280"}}>←</button>
        <h2 style={{fontSize:24,fontWeight:700,margin:0}}>{isEdit?"Edit":"Add"} Purchase Return</h2>
      </div>

      <div style={card}>
        <div style={grid4}>
          <div>
            <label style={lbl}>Supplier:*</label>
            <div style={{position:'relative'}}>
              <div style={{display:'flex'}}>
                <span style={iconBox}>👤</span>
                <input value={supplierSearch}
                  onChange={e=>{setSupplierSearch(e.target.value);setShowSupplierDrop(true);if(!e.target.value){setSelectedSupplier(null);}}}
                  onFocus={()=>setShowSupplierDrop(true)}
                  onBlur={()=>setTimeout(()=>setShowSupplierDrop(false),150)}
                  placeholder="Type to search supplier..."
                  style={{...inp,borderRadius:'0 6px 6px 0'}} autoComplete="off"/>
              </div>
              {selectedSupplier&&<div style={{fontSize:11,color:'#1a5c38',marginTop:2}}>✓ {selectedSupplier.name}</div>}
              {showSupplierDrop&&(
                <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:200,background:'#fff',border:'1px solid #d1d5db',borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.12)',maxHeight:200,overflowY:'auto',marginTop:2}}>
                  {suppliers.filter(s=>!supplierSearch||s.name.toLowerCase().includes(supplierSearch.toLowerCase())).map(s=>(
                    <div key={s.id} onMouseDown={()=>{setSelectedSupplier(s);setSupplierSearch(s.name);setShowSupplierDrop(false);}}
                      style={{padding:'9px 14px',cursor:'pointer',borderBottom:'1px solid #f3f4f6'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                      {s.mobile&&<div style={{fontSize:11,color:'#9ca3af'}}>{s.mobile}</div>}
                    </div>
                  ))}
                  {suppliers.filter(s=>!supplierSearch||s.name.toLowerCase().includes(supplierSearch.toLowerCase())).length===0&&(
                    <div style={{padding:'14px',color:'#9ca3af',fontSize:13,textAlign:'center'}}>No suppliers found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label style={lbl}>Business Location:*</label>
            <select value={form.location} onChange={e=>set('location',e.target.value)} style={inp}>
              <option value="">Please Select</option>
              {LOCATIONS.map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Parent Purchase:</label>
            <input value={form.parentPurchase} onChange={e=>set('parentPurchase',e.target.value)} style={inp} placeholder="e.g. PO-0001"/>
          </div>
          <div>
            <label style={lbl}>Reference No:</label>
            <input value={form.refNo} onChange={e=>set('refNo',e.target.value)} style={inp} placeholder="Auto-generated"/>
          </div>
        </div>
        <div style={{marginTop:16}}>
          <label style={lbl}>Reason for Return:</label>
          <textarea value={form.reason} onChange={e=>set('reason',e.target.value)}
            style={{...inp,height:60,resize:'vertical'}} placeholder="Optional — describe why goods are being returned"/>
        </div>
        <div style={{...grid4,marginTop:16}}>
          <div>
            <label style={lbl}>Date:</label>
            <div style={{display:'flex'}}>
              <span style={iconBox}>📅</span>
              <input readOnly value={new Date().toLocaleString()} style={{...inp,borderRadius:'0 6px 6px 0',background:'#f9fafb'}}/>
            </div>
          </div>
          <div style={{gridColumn:'span 3'}}>
            <label style={lbl}>Attach Document:</label>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input readOnly value={docFile?.name||''} style={{...inp,maxWidth:300}} placeholder="No file chosen"/>
              <label style={{...browseBtn,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                📁 Browse
                <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png" hidden onChange={e=>setDocFile(e.target.files[0])}/>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div style={{...card,marginTop:16}}>
        <h3 style={{margin:'0 0 14px',fontSize:16,fontWeight:700}}>Products</h3>
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <div style={{position:'relative',width:'70%'}}>
            <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',zIndex:1}}>
              {searchingProducts?'⏳':'🔍'}
            </span>
            <input value={productSearch}
              onChange={e=>handleProductSearchChange(e.target.value)}
              onFocus={handleProductFocus}
              onBlur={()=>setTimeout(()=>setShowProdDrop(false),150)}
              onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();handleAddManual();} if(e.key==='Escape')setShowProdDrop(false); }}
              placeholder="Click or type to search products from database..."
              style={{...inp,paddingLeft:34}} autoComplete="off"/>
            {showProdDrop&&productSuggestions.length>0&&(
              <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:100,background:'#fff',border:'1px solid #d1d5db',borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.12)',maxHeight:250,overflowY:'auto',marginTop:2}}>
                {productSuggestions.filter(p=>!productSearch||p.name?.toLowerCase().includes(productSearch.toLowerCase())).map((p,i)=>(
                  <div key={p.id||i} onMouseDown={()=>handleSelectProduct(p)}
                    style={{padding:'9px 14px',cursor:'pointer',borderBottom:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
                      {p.sku&&<div style={{fontSize:11,color:'#9ca3af'}}>SKU: {p.sku}</div>}
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:'#1a5c38'}}>{p.default_price?`₹${parseFloat(p.default_price).toFixed(2)}`:'—'}</div>
                  </div>
                ))}
                {productSearch&&(
                  <div onMouseDown={handleAddManual}
                    style={{padding:'9px 14px',cursor:'pointer',color:'#3b82f6',fontWeight:600,fontSize:13,borderTop:'1px solid #e5e7eb',textAlign:'center'}}>
                    ＋ Add "{productSearch}" manually
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={handleAddManual} style={{marginLeft:10,background:'none',border:'none',color:'#3b82f6',fontWeight:700,cursor:'pointer',fontSize:13}}>＋ Add</button>
        </div>

        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead>
              <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
                {['Product','Quantity','Unit Price','Subtotal',''].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left',fontWeight:600,color:'#374151',fontSize:13}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length===0
                ?<tr><td colSpan={5} style={emptyCell}>No products added — click search box above</td></tr>
                :products.map((p,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={tdS}><span style={{fontWeight:500}}>{p.name}</span>{p.sku&&<span style={{fontSize:11,color:'#9ca3af',marginLeft:6}}>{p.sku}</span>}</td>
                    <td style={tdS}><input type="number" defaultValue={p.qty} min={1} style={{width:80,...inp}} onChange={e=>updateProduct(i,'qty',e.target.value)}/></td>
                    <td style={tdS}><input type="number" defaultValue={p.unitPrice} min={0} style={{width:100,...inp}} onChange={e=>updateProduct(i,'unitPrice',e.target.value)}/></td>
                    <td style={tdS}><b style={{color:'#1a5c38'}}>₹{Number(p.subtotal).toFixed(2)}</b></td>
                    <td style={tdS}><button onClick={()=>setProducts(products.filter((_,idx)=>idx!==i))} style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:4,color:'#dc2626',cursor:'pointer',padding:'4px 10px',fontSize:13}}>🗑️</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:16,flexWrap:'wrap',gap:16}}>
          <div>
            <label style={lbl}>Purchase Tax:</label>
            <select value={form.purchaseTax} onChange={e=>set('purchaseTax',e.target.value)}
              style={{border:'1px solid #d1d5db',borderRadius:6,padding:'9px 32px 9px 12px',fontSize:13,minWidth:180,color:'#374151'}}>
              {['None','GST 5%','GST 12%','GST 18%'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,color:'#6b7280'}}>Sub Total: ₹{subTotal.toFixed(2)}</div>
            {taxAmt>0&&<div style={{fontSize:13,color:'#6b7280'}}>Tax: ₹{taxAmt.toFixed(2)}</div>}
            <div style={{fontWeight:700,fontSize:16,color:'#1a5c38',marginTop:4}}>Total: ₹{totalAmt.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{...card,marginTop:16}}>
        <h3 style={{margin:'0 0 14px',fontSize:16,fontWeight:700}}>Payment</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
          <div>
            <label style={lbl}>Amount Paid:</label>
            <input type="number" min={0} value={form.paymentAmount} onChange={e=>set('paymentAmount',e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Method:</label>
            <select value={form.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)} style={inp}>
              {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Note:</label>
            <input value={form.paymentNote} onChange={e=>set('paymentNote',e.target.value)} style={inp} placeholder="Optional"/>
          </div>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:28}}>
        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={{...greenBtnLg,opacity:saving?0.7:1}}>
          {saving?'Saving…':(isEdit?'Update Return':'Submit Return')}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PURCHASE RETURN LIST ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function PurchaseReturn() {
  const {showToast,ToastEl} = useToast();
  const [view,     setView]     = useState('list');
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);

  const [returns,      setReturns]      = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState('');
  const [showEntries,  setShowEntries]  = useState(25);
  const [page,         setPage]         = useState(1);
  const [visibleCols,  setVisibleCols]  = useState(LIST_COLS.map(c=>c.key));
  const [confirmDelete,setConfirmDelete]= useState(null);
  const [suppliers,    setSuppliers]    = useState([]);
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');

  useEffect(()=>{
    fetch(`${BASE_URL}/contacts?contactType=Suppliers&limit=500`,{headers:authHeaders()})
      .then(r=>r.json())
      .then(d=>setSuppliers((d.contacts||[]).map(c=>({id:c.id,name:(c.name||c.business_name||'').trim()||`#${c.id}`}))))
      .catch(()=>{});
  },[]);

  const loadReturns = useCallback(async()=>{
    setLoading(true);
    try {
      const params = new URLSearchParams({page,limit:showEntries});
      if(search)          params.set('search',search);
      if(filterSupplier)  params.set('supplier_id',filterSupplier);
      if(filterDateFrom)  params.set('date_from',filterDateFrom);
      if(filterDateTo)    params.set('date_to',filterDateTo);

      const data = await apiFetch('GET',`/purchase-returns?${params}`);
      setReturns(data.returns||data.purchaseReturns||[]);
      setTotal(data.total||0);
    } catch(err){
      setReturns([]);
      setTotal(0);
    } finally { setLoading(false); }
  },[page,showEntries,search,filterSupplier,filterDateFrom,filterDateTo]);

  useEffect(()=>{ if(view==='list') loadReturns(); },[view,loadReturns]);
  useEffect(()=>setPage(1),[search,showEntries,filterSupplier]);

  const handleDelete = async () => {
    if(!confirmDelete) return;
    try {
      await apiFetch('DELETE',`/purchase-returns/${confirmDelete.id}`);
      showToast(`Return ${confirmDelete.ref} deleted`,"success");
      setConfirmDelete(null);
      loadReturns();
    } catch(err){ showToast(err.message,"error"); setConfirmDelete(null); }
  };

  const displayRows = returns.map(r=>({
    ...r,
    return_date:   fmtDate(r.return_date||r.created_at),
    total_amount:  fmtINR(r.total_amount),
    payment_due:   fmtINR(r.payment_due),
  }));

  const pages = Math.ceil(total/showEntries)||1;

  if(view==='add' || view==='edit') return (
    <PurchaseReturnForm
      editData={view==='edit'?editData:null}
      onSubmit={()=>{ setView('list'); loadReturns(); showToast(view==='edit'?'Return updated!':'Return added!',"success"); }}
      onCancel={()=>{ setView('list'); setEditData(null); }}/>
  );

  if(view==='view' && viewData) return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:860}}>
      {ToastEl}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={()=>{setView('list');setViewData(null);}} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#6b7280'}}>←</button>
        <h2 style={{fontSize:24,fontWeight:700,margin:0}}>Purchase Return Details</h2>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={async()=>{
              try{
                const full=await apiFetch('GET',`/purchase-returns/${viewData.id}`);
                setEditData(full.purchaseReturn||full);
              }catch{setEditData(viewData);}
              setView('edit');
            }} style={{...greenBtn,padding:'8px 18px',fontSize:13}}>✏️ Edit</button>
          <button onClick={()=>{setConfirmDelete({id:viewData.id,ref:viewData.return_number});setView('list');}} style={{background:'#dc2626',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}}>🗑️ Delete</button>
        </div>
      </div>
      <div style={card}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 32px'}}>
          {LIST_COLS.map(({key,label})=>(
            <div key={key} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #f3f4f6'}}>
              <span style={{fontWeight:600,color:'#6b7280',fontSize:13}}>{label}</span>
              <span style={{color:'#111',fontSize:13,fontWeight:500}}>
                {key==='payment_status'?statusBadge(viewData[key]):key==='return_date'?fmtDate(viewData[key]||viewData.created_at):key==='total_amount'||key==='payment_due'?fmtINR(viewData[key]):viewData[key]||'—'}
              </span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:24}}>
          <button onClick={()=>{setView('list');setViewData(null);}} style={cancelBtn}>← Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      {ToastEl}
      {confirmDelete&&<ConfirmModal message={`Delete return "${confirmDelete.ref}"?`} onConfirm={handleDelete} onCancel={()=>setConfirmDelete(null)}/>}

      <h2 style={{fontSize:26,fontWeight:700,marginBottom:16,color:'#111827'}}>Purchase Return</h2>

      {/* Filters */}
      <div style={{background:'#fff',borderRadius:8,padding:'14px 16px',marginBottom:16,boxShadow:'0 1px 3px #0001',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={{fontSize:14,color:'#555',fontWeight:500}}>🔽 Filters</span>
        <input type="date" value={filterDateFrom} onChange={e=>{setFilterDateFrom(e.target.value);setPage(1);}} style={{border:'1px solid #d1d5db',borderRadius:6,padding:'5px 10px',fontSize:13}}/>
        <input type="date" value={filterDateTo} onChange={e=>{setFilterDateTo(e.target.value);setPage(1);}} style={{border:'1px solid #d1d5db',borderRadius:6,padding:'5px 10px',fontSize:13}}/>
        <select value={filterSupplier} onChange={e=>{setFilterSupplier(e.target.value);setPage(1);}} style={{border:'1px solid #d1d5db',borderRadius:6,padding:'5px 10px',fontSize:13}}>
          <option value="">All Suppliers</option>
          {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={()=>{setPage(1);loadReturns();}} style={{...greenBtn,padding:'6px 16px',fontSize:13}}>Apply</button>
        <button onClick={()=>{setFilterSupplier('');setFilterDateFrom('');setFilterDateTo('');setPage(1);}} style={{border:'1px solid #d1d5db',borderRadius:6,padding:'5px 14px',fontSize:13,cursor:'pointer',background:'#fff',color:'#374151'}}>Clear</button>
      </div>

      <div style={{background:'#fff',borderRadius:8,padding:20,boxShadow:'0 1px 4px #0001'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700}}>All Purchase Returns</h3>
          <button onClick={()=>setView('add')} style={addGreenBtn}>＋ Add</button>
        </div>

        <ExportToolbar
          showEntries={showEntries} setShowEntries={setShowEntries}
          search={search} setSearch={setSearch}
          columns={LIST_COLS} visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          onExportCSV={()=>{exportCSV(displayRows,LIST_COLS.map(c=>c.key),'purchase_returns.csv');showToast('CSV exported!','success');}}
          onExportExcel={()=>{exportExcel(displayRows,LIST_COLS.map(c=>c.key),'purchase_returns.xls');showToast('Excel exported!','success');}}
          onExportPDF={()=>{exportPDF('Purchase Returns',LIST_COLS.filter(c=>visibleCols.includes(c.key)),displayRows);showToast('PDF opened.','info');}}
        />

        {loading?<Spinner/>:(
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
              <thead>
                <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
                  {LIST_COLS.filter(c=>visibleCols.includes(c.key)).map(c=>(
                    <th key={c.key} style={th}>{c.label}{c.key==='payment_due'?' ℹ️':''}</th>
                  ))}
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {returns.length===0
                  ?<tr><td colSpan={LIST_COLS.length+1} style={emptyCell}>No data available in table</td></tr>
                  :returns.map((r,i)=>(
                    <tr key={r.id||i} style={{borderBottom:'1px solid #f3f4f6'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {LIST_COLS.filter(c=>visibleCols.includes(c.key)).map(c=>(
                        <td key={c.key} style={tdS}>
                          {c.key==='payment_status'   ? statusBadge(r[c.key])
                          :c.key==='return_date'      ? fmtDate(r[c.key]||r.created_at)
                          :c.key==='total_amount'||c.key==='payment_due' ? fmtINR(r[c.key])
                          : r[c.key]||'—'}
                        </td>
                      ))}
                      {/* ── ACTION BUTTONS (View + Edit + Delete) ── */}
                      <td style={{...tdS,whiteSpace:'nowrap'}}>
                        <div style={{display:'flex',gap:5}}>
                          <button onClick={()=>{setViewData(r);setView('view');}} style={viewBtnStyle}
                            onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
                            onMouseLeave={e=>e.currentTarget.style.background='#3b82f6'}>👁️ View</button>
                          <button onClick={async()=>{
                              try{
                                const full=await apiFetch('GET',`/purchase-returns/${r.id}`);
                                setEditData(full.purchaseReturn||full);
                              }catch{setEditData(r);}
                              setView('edit');
                            }}
                            style={{...viewBtnStyle,background:'#f59e0b'}}
                            onMouseEnter={e=>e.currentTarget.style.background='#d97706'}
                            onMouseLeave={e=>e.currentTarget.style.background='#f59e0b'}>✏️ Edit</button>
                          <button onClick={()=>setConfirmDelete({id:r.id,ref:r.return_number||`#${r.id}`})}
                            style={{...viewBtnStyle,background:'#dc2626'}}
                            onMouseEnter={e=>e.currentTarget.style.background='#b91c1c'}
                            onMouseLeave={e=>e.currentTarget.style.background='#dc2626'}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
              <tfoot>
                <tr style={{background:'#f9fafb',fontWeight:700,borderTop:'2px solid #e5e7eb'}}>
                  <td colSpan={visibleCols.filter(k=>!['total_amount','payment_due'].includes(k)).length} style={{padding:'12px',color:'#374151'}}>Total ({total} records):</td>
                  <td style={{padding:'12px',color:'#1a5c38'}}>{fmtINR(returns.reduce((s,r)=>s+parseFloat(r.total_amount||0),0))}</td>
                  <td style={{padding:'12px',color:'#dc2626'}}>{fmtINR(returns.reduce((s,r)=>s+parseFloat(r.payment_due||0),0))}</td>
                  <td/>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',marginTop:16,fontSize:13,color:'#6b7280',alignItems:'center'}}>
          <span>{total===0?'Showing 0 to 0 of 0 entries':`Showing ${(page-1)*showEntries+1} to ${Math.min(page*showEntries,total)} of ${total} entries`}</span>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{...pgBtn,opacity:page<=1?0.5:1}}>← Previous</button>
            <span style={{fontSize:13,color:'#374151',fontWeight:600}}>{page}/{pages}</span>
            <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages} style={{...pgBtn,opacity:page>=pages?0.5:1}}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const card       = {background:'#fff',borderRadius:8,padding:20,boxShadow:'0 1px 4px #0001'};
const grid4      = {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16};
const lbl        = {display:'block',fontWeight:600,marginBottom:6,fontSize:13,color:'#374151'};
const inp        = {border:'1px solid #d1d5db',borderRadius:6,padding:'9px 12px',fontSize:13,width:'100%',boxSizing:'border-box',color:'#374151',outline:'none'};
const iconBox    = {padding:'9px 12px',border:'1px solid #d1d5db',borderRight:'none',borderRadius:'6px 0 0 6px',background:'#f9fafb',whiteSpace:'nowrap',fontSize:13};
const browseBtn  = {background:'#3b82f6',color:'#fff',border:'none',borderRadius:6,padding:'9px 14px',fontSize:13,fontWeight:600};
const th         = {padding:'12px 12px',textAlign:'left',fontWeight:600,color:'#374151',fontSize:13};
const tdS        = {padding:'11px 12px'};
const emptyCell  = {textAlign:'center',padding:40,color:'#9ca3af',fontSize:14};
const pgBtn      = {border:'1px solid #d1d5db',background:'#fff',borderRadius:6,padding:'6px 16px',cursor:'pointer',fontSize:13,color:'#374151',fontWeight:500};
const overlayStyle = {position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000};
const modalStyle   = {background:'#fff',borderRadius:12,padding:32,minWidth:300,maxWidth:420,boxShadow:'0 20px 60px #00000025',position:'relative'};
const modalClose   = {position:'absolute',right:16,top:14,background:'none',border:'none',fontSize:24,cursor:'pointer',color:'#9ca3af',lineHeight:1};
const addGreenBtn  = {background:'linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontSize:14,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 12px #1a5c3840'};
const greenBtn     = {display:'inline-flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)',color:'#fff',border:'none',borderRadius:8,padding:'11px 28px',cursor:'pointer',fontSize:14,fontWeight:600,boxShadow:'0 4px 14px #1a5c3840'};
const greenBtnLg   = {display:'inline-flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)',color:'#fff',border:'none',borderRadius:10,padding:'13px 50px',cursor:'pointer',fontSize:16,fontWeight:700,boxShadow:'0 6px 20px #1a5c3850'};
const cancelBtn    = {background:'#374151',color:'#fff',border:'none',borderRadius:8,padding:'13px 30px',cursor:'pointer',fontSize:15,fontWeight:700};
const viewBtnStyle = {background:'#3b82f6',color:'#fff',border:'none',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:500,transition:'background 0.15s'};
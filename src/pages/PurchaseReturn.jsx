/**
 * src/pages/PurchaseReturn.jsx
 * Professional UI matching Stock Adjustments / Purchases style
 * - Stats cards, icon-only action buttons, proper filters
 * - Edit loads all fields including amount_paid, reason
 */
import { useState, useEffect, useCallback } from "react";
import * as settingsAPI from "../api/settingsAPI";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("manod_token") || ""}` });
const apiFetch = async (method, path, body = null) => {
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
};

function Toast({ message, type, onClose }) {
  const colors = { success:"#16a34a", error:"#dc2626", info:"#2563eb" };
  return (
    <div style={{position:"fixed",top:24,right:24,zIndex:9999,background:"#fff",borderRadius:10,padding:"14px 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",borderLeft:`5px solid ${colors[type]||"#16a34a"}`,display:"flex",alignItems:"center",gap:12,minWidth:280,animation:"slideIn .25s ease"}}>
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:none;opacity:1}}`}</style>
      <span style={{fontSize:14,color:"#111",flex:1,fontWeight:500}}>{message}</span>
      <button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#9ca3af"}}>×</button>
    </div>
  );
}
function useToast() {
  const [toast,setToast]=useState(null);
  const showToast=(msg,type="success")=>{setToast({message:msg,type});setTimeout(()=>setToast(null),3500);};
  const ToastEl=toast?<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>:null;
  return {showToast,ToastEl};
}

const fmtDate=d=>d?new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
const fmtINR=n=>`₹${parseFloat(n||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`;

const PYSC={Paid:{bg:"#dcfce7",color:"#15803d",border:"#86efac"},Due:{bg:"#fee2e2",color:"#b91c1c",border:"#fca5a5"},Partial:{bg:"#ffedd5",color:"#c2410c",border:"#fed7aa"},pending:{bg:"#f3f4f6",color:"#374151",border:"#d1d5db"}};
function Badge({label}){const c=PYSC[label]||{bg:"#f3f4f6",color:"#374151",border:"#d1d5db"};return <span style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{label||"—"}</span>;}
const Spinner=()=>(<div style={{display:"flex",justifyContent:"center",padding:60}}><div style={{width:36,height:36,border:"3px solid #e5e7eb",borderTopColor:"#16a34a",borderRadius:"50%",animation:"spin .7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);
function ConfirmModal({message,onConfirm,onCancel}){return(<div style={OVR} onClick={onCancel}><div style={{background:"#fff",borderRadius:12,padding:28,maxWidth:360,width:"90%",textAlign:"center",boxShadow:"0 20px 60px #0002"}} onClick={e=>e.stopPropagation()}><div style={{fontSize:44,marginBottom:8}}>🗑️</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:700}}>Confirm Delete</h3><p style={{fontSize:14,color:"#6b7280",margin:"0 0 20px"}}>{message}</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><button onClick={onCancel} style={BG}>Cancel</button><button onClick={onConfirm} style={{...BG,background:"#dc2626",color:"#fff",borderColor:"#dc2626"}}>Delete</button></div></div></div>);}

const PMTS=["Cash","Card","Bank Transfer","Cheque","UPI"];
// Locations and Tax Rates are no longer hardcoded here — ReturnForm
// fetches them live from settingsAPI (Business Locations / Tax Rates).

const IconEye=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDel=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

// ══════════════════════════════════════════════════════════════════════════
// RETURN FORM
// ══════════════════════════════════════════════════════════════════════════
function ReturnForm({onSubmit,onCancel,editData=null}){
  const {showToast,ToastEl}=useToast();
  const isEdit=!!editData;
  const [saving,setSaving]=useState(false);
  const [suppliers,setSuppliers]=useState([]);
  const [supSearch,setSupSearch]=useState("");
  const [showSupDrop,setShowSupDrop]=useState(false);
  const [selSup,setSelSup]=useState(null);
  const [prodSearch,setProdSearch]=useState("");
  const [prodSugg,setProdSugg]=useState([]);
  const [showProdDrop,setShowProdDrop]=useState(false);
  const [searchingProd,setSearchingProd]=useState(false);
  const [products,setProducts]=useState([]);
  const [locations,setLocations]=useState([]);
  const [taxRates,setTaxRates]=useState([]);
  const [form,setForm]=useState({location:"",parentPurchase:"",refNo:"",reason:"",purchaseTax:"None",payMethod:"Cash",payAmt:"0",payNote:""});
  const [docFile,setDocFile]=useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    fetch(`${BASE_URL}/contacts?contactType=Suppliers&limit=500`,{headers:authHeaders()})
      .then(r=>r.json()).then(d=>setSuppliers((d.contacts||[]).map(c=>({id:c.id,name:(c.name||c.business_name||c.first_name||"").trim()||`#${c.id}`,mobile:c.mobile||""})).filter(s=>s.name))).catch(()=>{});
  },[]);

  // Load Business Locations + Tax Rates from Settings — replaces hardcoded LOCS/TXRT
  useEffect(()=>{
    settingsAPI.getLocations().then(res=>{
      if(res.success&&Array.isArray(res.data))setLocations(res.data);
    }).catch(()=>{});
    settingsAPI.getTaxRates().then(res=>{
      if(res.success&&Array.isArray(res.data))setTaxRates(res.data);
    }).catch(()=>{});
  },[]);

  const locationNames=locations.map(l=>l.location_name).filter(Boolean);
  const taxMap=taxRates.reduce((m,t)=>{m[t.tax_name]=Number(t.rate)/100;return m;},{"None":0});

  useEffect(()=>{
    if(!editData)return;
    setForm({
      location:editData.location||"",
      parentPurchase:editData.purchase_ref||"",
      refNo:editData.return_number||"",
      reason:editData.reason||"",
      purchaseTax:editData.tax_label||"None",
      payMethod:editData.payment_method||"Cash",
      payAmt:String(editData.amount_paid||0),
      payNote:editData.payment_note||"",
    });
    if(editData.supplier_name){setSupSearch(editData.supplier_name);setSelSup({id:editData.supplier_id,name:editData.supplier_name});}
    if(Array.isArray(editData.items)){
      setProducts(editData.items.map(i=>({
        name:i.product_name||i.name||"",sku:i.product_sku||i.sku||"",
        qty:parseFloat(i.quantity)||1,
        unitPrice:parseFloat(i.unit_price)||parseFloat(i.unit_cost)||0,
        subtotal:parseFloat(i.total_amount)||parseFloat(i.subtotal)||0,
      })));
    }
  },[editData]);

  const loadProds=async()=>{
    if(prodSugg.length===0){setSearchingProd(true);try{const d=await apiFetch("GET","/purchases/products/search?q=");setProdSugg(d.products||[]);}catch{setProdSugg([]);}finally{setSearchingProd(false);}}
    setShowProdDrop(true);
  };
  const searchProd=async(val)=>{setProdSearch(val);setSearchingProd(true);try{const d=await apiFetch("GET",`/purchases/products/search?q=${encodeURIComponent(val)}`);setProdSugg(d.products||[]);setShowProdDrop(true);}catch{setProdSugg([]);}finally{setSearchingProd(false);};};
const selProd=(p)=>{
  const price=parseFloat(p.default_price ?? p.unit_purchase_price ?? p.purchase_price ?? p.selling_price ?? p.default_sell_price ?? 0)||0;
  setProducts(prev=>[...prev,{id:p.id||null,name:p.name,sku:p.sku||"",qty:1,unitPrice:price,subtotal:price}]);
  setProdSearch("");setShowProdDrop(false);
};
  const addManual=()=>{if(!prodSearch.trim())return;setProducts(prev=>[...prev,{name:prodSearch,sku:"",qty:1,unitPrice:0,subtotal:0}]);setProdSearch("");setShowProdDrop(false);};
  const updProd=(i,field,val)=>{setProducts(prev=>{const arr=[...prev];arr[i]={...arr[i],[field]:parseFloat(val)||0};const q=field==="qty"?parseFloat(val)||0:arr[i].qty;const p=field==="unitPrice"?parseFloat(val)||0:arr[i].unitPrice;arr[i].subtotal=+(q*p).toFixed(2);return arr;});};

  const sub=products.reduce((s,p)=>s+Number(p.subtotal),0);
  const tax=sub*(taxMap[form.purchaseTax]||0);
  const total=sub+tax;
  const paid=parseFloat(form.payAmt)||0;

  const submit=async()=>{
    if(!selSup){showToast("Please select a supplier","error");return;}
    if(!form.location){showToast("Please select a location","error");return;}
    if(products.length===0){showToast("Please add at least one product","error");return;}
    setSaving(true);
    try{
      const body={
        supplier_id:selSup.id,supplier_name:selSup.name,location:form.location,
        purchase_ref:form.parentPurchase||null,return_number:form.refNo||null,
        reason:form.reason||null,tax_label:form.purchaseTax,tax_amount:tax,
        subtotal:sub,total_amount:total,
        amount_paid:paid,payment_due:Math.max(0,total-paid),
        payment_status:paid>=total&&total>0?"Paid":paid>0?"Partial":"Due",
 items:products.map(p=>({product_id:p.id||null,product_name:p.name,product_sku:p.sku||null,quantity:p.qty,unit_price:p.unitPrice,subtotal:p.subtotal})),
      };
      if(isEdit){await apiFetch("PUT",`/purchase-returns/${editData.id}`,body);showToast("Return updated!","success");}
      else{await apiFetch("POST","/purchase-returns",body);showToast("Return submitted!","success");}
      setTimeout(()=>onSubmit(),1200);
    }catch(err){showToast(err.message||"Failed to save","error");}
    finally{setSaving(false);}
  };

  return(
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:1000}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onCancel} style={BG}>← Back</button>
        <div>
          <h2 style={{fontSize:22,fontWeight:700,margin:0,color:"#111827"}}>{isEdit?"Edit":"Add"} Purchase Return</h2>
          <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>Home / Purchase Return / {isEdit?"Edit":"Add"}</div>
        </div>
      </div>

      <div style={FC}>
        <div style={ST}>Return Information</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          <div>
            <label style={LB}>Supplier *</label>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",border:"1px solid #d1d5db",borderRadius:8,background:"#fff"}}>
                <span style={{padding:"0 10px",color:"#9ca3af"}}>👤</span>
                <input value={supSearch} onChange={e=>{setSupSearch(e.target.value);setShowSupDrop(true);if(!e.target.value)setSelSup(null);}} onFocus={()=>setShowSupDrop(true)} onBlur={()=>setTimeout(()=>setShowSupDrop(false),150)} placeholder="Search supplier..." style={{...INP,border:"none",flex:1}} autoComplete="off"/>
              </div>
              {selSup&&<div style={{fontSize:11,color:"#16a34a",marginTop:3,fontWeight:500}}>✓ {selSup.name}</div>}
              {showSupDrop&&<div style={DD}>{suppliers.filter(s=>!supSearch||s.name.toLowerCase().includes(supSearch.toLowerCase())).slice(0,10).map(s=><div key={s.id} onMouseDown={()=>{setSelSup(s);setSupSearch(s.name);setShowSupDrop(false);}} style={DI} onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><div style={{fontWeight:600,fontSize:13}}>{s.name}</div>{s.mobile&&<div style={{fontSize:11,color:"#9ca3af"}}>{s.mobile}</div>}</div>)}{!suppliers.filter(s=>!supSearch||s.name.toLowerCase().includes(supSearch.toLowerCase())).length&&<div style={{padding:"12px",color:"#9ca3af",fontSize:13,textAlign:"center"}}>No suppliers found</div>}</div>}
            </div>
          </div>
          <div><label style={LB}>Business Location *</label><select value={form.location} onChange={e=>set("location",e.target.value)} style={INP}><option value="">{locationNames.length===0?"Loading…":"Please Select"}</option>{locationNames.map(l=><option key={l}>{l}</option>)}</select></div>
          <div><label style={LB}>Parent Purchase</label><input value={form.parentPurchase} onChange={e=>set("parentPurchase",e.target.value)} style={INP} placeholder="e.g. PO-0001"/></div>
          <div><label style={LB}>Reference No</label><input value={form.refNo} onChange={e=>set("refNo",e.target.value)} style={INP} placeholder="Auto-generated"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:14}}>
          <div>
            <label style={LB}>Reason for Return</label>
            <textarea value={form.reason} onChange={e=>set("reason",e.target.value)} style={{...INP,height:60,resize:"vertical"}} placeholder="Optional — describe why goods are being returned"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div><label style={LB}>Date</label><input readOnly value={new Date().toLocaleString()} style={{...INP,background:"#f9fafb",color:"#6b7280"}}/></div>
            <div><label style={LB}>Attach Document</label><div style={{display:"flex",gap:8}}><input readOnly value={docFile?.name||""} style={{...INP,flex:1}} placeholder="No file chosen"/><label style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:8,padding:"9px 14px",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Browse<input type="file" hidden onChange={e=>setDocFile(e.target.files[0])}/></label></div></div>
          </div>
        </div>
      </div>

      <div style={{...FC,marginTop:16}}>
        <div style={ST}>Products</div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{position:"relative",width:"75%"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:searchingProd?"#f59e0b":"#9ca3af",zIndex:1}}>{searchingProd?"⏳":"🔍"}</span>
            <input value={prodSearch} onChange={e=>searchProd(e.target.value)} onFocus={loadProds} onBlur={()=>setTimeout(()=>setShowProdDrop(false),150)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addManual();}if(e.key==="Escape")setShowProdDrop(false);}} placeholder="Search products from database..." style={{...INP,paddingLeft:38}} autoComplete="off"/>
            {showProdDrop&&prodSugg.length>0&&<div style={{...DD,maxHeight:260}}>{prodSugg.filter(p=>!prodSearch||p.name?.toLowerCase().includes(prodSearch.toLowerCase())).map((p,i)=><div key={p.id||i} onMouseDown={()=>selProd(p)} style={{...DI,display:"flex",justifyContent:"space-between"}} onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><div><div style={{fontWeight:600,fontSize:13}}>{p.name}</div>{p.sku&&<div style={{fontSize:11,color:"#9ca3af"}}>SKU: {p.sku}</div>}</div><div style={{fontWeight:600,color:"#16a34a",fontSize:13}}>{(p.default_price ?? p.unit_purchase_price ?? p.purchase_price ?? p.selling_price ?? p.default_sell_price)?`₹${parseFloat(p.default_price ?? p.unit_purchase_price ?? p.purchase_price ?? p.selling_price ?? p.default_sell_price).toFixed(2)}`:"—"}</div></div>)}{prodSearch&&<div onMouseDown={addManual} style={{...DI,color:"#2563eb",fontWeight:600,textAlign:"center",borderTop:"1px solid #f3f4f6"}}>＋ Add "{prodSearch}" manually</div>}</div>}
          </div>
          <button onClick={addManual} style={{marginLeft:10,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,color:"#2563eb",fontWeight:600,cursor:"pointer",fontSize:13,padding:"0 16px"}}>＋ Add</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f0fdf4",borderBottom:"2px solid #bbf7d0"}}>{["#","Product","Quantity","Unit Price","Subtotal",""].map(h=><th key={h} style={{padding:"10px",textAlign:"left",fontWeight:700,color:"#15803d",fontSize:12}}>{h}</th>)}</tr></thead>
            <tbody>
              {products.length===0?<tr><td colSpan={6} style={{textAlign:"center",padding:40,color:"#9ca3af",fontSize:14}}>No products added — search above to add</td></tr>
              :products.map((p,i)=><tr key={i} style={{borderBottom:"1px solid #f3f4f6"}} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><td style={TD}><span style={{fontWeight:600,color:"#6b7280"}}>{i+1}</span></td><td style={TD}><div style={{fontWeight:600}}>{p.name}</div>{p.sku&&<div style={{fontSize:11,color:"#9ca3af"}}>{p.sku}</div>}</td><td style={TD}><input type="number" defaultValue={p.qty} min={1} style={{...INP,width:80,padding:"6px 8px"}} onChange={e=>updProd(i,"qty",e.target.value)}/></td><td style={TD}><input type="number" defaultValue={p.unitPrice} min={0} style={{...INP,width:100,padding:"6px 8px"}} onChange={e=>updProd(i,"unitPrice",e.target.value)}/></td><td style={TD}><b style={{color:"#15803d"}}>₹{Number(p.subtotal).toFixed(2)}</b></td><td style={TD}><button onClick={()=>setProducts(products.filter((_,idx)=>idx!==i))} style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:6,color:"#dc2626",cursor:"pointer",padding:"5px 10px"}}>🗑</button></td></tr>)}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:16,flexWrap:"wrap",gap:16}}>
          <div><label style={LB}>Purchase Tax</label><select value={form.purchaseTax} onChange={e=>set("purchaseTax",e.target.value)} style={{...INP,width:180}}>{Object.keys(taxMap).map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{background:"#f0fdf4",borderRadius:10,padding:"14px 20px",textAlign:"right",border:"1px solid #bbf7d0"}}>
            <div style={{fontSize:13,color:"#6b7280"}}>Sub Total: <b>{fmtINR(sub)}</b></div>
            {tax>0&&<div style={{fontSize:13,color:"#6b7280"}}>Tax: <b>{fmtINR(tax)}</b></div>}
            <div style={{fontWeight:800,fontSize:20,color:"#15803d",marginTop:6,borderTop:"1px solid #bbf7d0",paddingTop:6}}>Total: {fmtINR(total)}</div>
          </div>
        </div>
      </div>

      <div style={{...FC,marginTop:16}}>
        <div style={ST}>Payment Details</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
          <div><label style={LB}>Amount Paid</label><input type="number" min={0} value={form.payAmt} onChange={e=>set("payAmt",e.target.value)} style={INP}/></div>
          <div><label style={LB}>Payment Method</label><select value={form.payMethod} onChange={e=>set("payMethod",e.target.value)} style={INP}>{PMTS.map(m=><option key={m}>{m}</option>)}</select></div>
          <div><label style={LB}>Payment Note</label><input value={form.payNote} onChange={e=>set("payNote",e.target.value)} style={INP} placeholder="Optional"/></div>
        </div>
        <div style={{marginTop:12,padding:"10px 14px",background:"#f9fafb",borderRadius:8,fontSize:13,color:"#374151"}}>
          Payment Due: <b style={{color:Math.max(0,total-paid)>0?"#dc2626":"#16a34a"}}>{fmtINR(Math.max(0,total-paid))}</b>
          &nbsp;|&nbsp; Status: <b>{paid>=total&&total>0?"Paid":paid>0?"Partial":"Due"}</b>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:28}}>
        <button onClick={onCancel} style={BG}>Cancel</button>
        <button onClick={submit} disabled={saving} style={{...GN,opacity:saving?0.7:1,minWidth:180}}>{saving?"Saving…":isEdit?"Update Return":"Submit Return"}</button>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════
// PURCHASE RETURN LIST
// ══════════════════════════════════════════════════════════════════════════
export default function PurchaseReturn(){
  const {showToast,ToastEl}=useToast();
  const [view,setView]=useState("list");
  const [editData,setEditData]=useState(null);
  const [viewData,setViewData]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const [selectedIds,setSelectedIds]=useState([]);
  const [confirmBulkDel,setConfirmBulkDel]=useState(false);
  const [bulkDeleting,setBulkDeleting]=useState(false);
  const [returns,setReturns]=useState([]);
  const [total,setTotal]=useState(0);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [showEntries,setShowEntries]=useState(25);
  const [page,setPage]=useState(1);
 const [suppliers,setSuppliers]=useState([]);
  const [fSup,setFSup]=useState("");
  const [fFrom,setFFrom]=useState("");
  const [fTo,setFTo]=useState("");
  const [fPayStatus,setFPayStatus]=useState("");
  const [reloadTick,setReloadTick]=useState(0);

  useEffect(()=>{fetch(`${BASE_URL}/contacts?contactType=Suppliers&limit=500`,{headers:authHeaders()}).then(r=>r.json()).then(d=>setSuppliers((d.contacts||[]).map(c=>({id:c.id,name:(c.name||c.business_name||"").trim()||`#${c.id}`})))).catch(()=>{});},[]);
const load=useCallback(async(ov={})=>{
    setLoading(true);
    try{
      const p=new URLSearchParams({page,limit:showEntries});
      const s=ov.search!==undefined?ov.search:search;
      const sup=ov.fSup!==undefined?ov.fSup:fSup;
      const fr=ov.fFrom!==undefined?ov.fFrom:fFrom;
      const to=ov.fTo!==undefined?ov.fTo:fTo;
      const ps=ov.fPayStatus!==undefined?ov.fPayStatus:fPayStatus;
      if(s)p.set("search",s);
      if(sup)p.set("supplier_id",sup);
      if(fr)p.set("date_from",fr);
      if(to)p.set("date_to",to);
      if(ps)p.set("payment_status",ps);
      const data=await apiFetch("GET",`/purchase-returns?${p}`);
      setReturns(data.returns||data.purchaseReturns||[]);
      setTotal(data.total||0);
    }catch{setReturns([]);setTotal(0);}
    finally{setLoading(false);}
  },[page,showEntries,search,fSup,fFrom,fTo,fPayStatus,reloadTick]);

useEffect(()=>{if(view==="list")load();},[view,load]);
  useEffect(()=>setPage(1),[search,showEntries]);
  useEffect(()=>{setSelectedIds([]);},[returns]);

 const delReturn=async()=>{
    if(!confirmDel)return;
    try{await apiFetch("DELETE",`/purchase-returns/${confirmDel.id}`);showToast("Deleted","success");setConfirmDel(null);load();}
    catch(err){showToast(err.message,"error");setConfirmDel(null);}
  };

  const toggleSelect=(id)=>{
    setSelectedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  };
  const toggleSelectAll=()=>{
    setSelectedIds(prev=>prev.length===returns.length?[]:returns.map(r=>r.id));
  };
  const bulkDelete=async()=>{
    if(selectedIds.length===0)return;
    setBulkDeleting(true);
    try{
      const res=await apiFetch("POST","/purchase-returns/bulk-delete",{ids:selectedIds});
      showToast(res.message||`Deleted ${selectedIds.length} return(s)`,"success");
      setSelectedIds([]);
      setConfirmBulkDel(false);
      load();
    }catch(err){
      showToast(err.message||"Bulk delete failed","error");
      setConfirmBulkDel(false);
    }finally{
      setBulkDeleting(false);
    }
  };
  const openEdit=async(r)=>{
    try{const full=await apiFetch("GET",`/purchase-returns/${r.id}`);setEditData(full.purchaseReturn||full);}
    catch{setEditData(r);}
    setView("edit");
  };

 const clearF=()=>{setFSup("");setFFrom("");setFTo("");setFPayStatus("");setPage(1);setReloadTick(t=>t+1);};
  const pages=Math.ceil(total/showEntries)||1;

  if(view==="add"||view==="edit") return <ReturnForm editData={view==="edit"?editData:null} onSubmit={()=>{setView("list");load();showToast(view==="edit"?"Updated!":"Added!","success");}} onCancel={()=>{setView("list");setEditData(null);}}/>;

  if(view==="view"&&viewData) return(
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:900}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={()=>{setView("list");setViewData(null);}} style={BG}>← Back</button>
        <div><h2 style={{fontSize:22,fontWeight:700,margin:0}}>Purchase Return Details</h2><div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>Home / Purchase Return / Detail</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={()=>openEdit(viewData)} style={GN}>✏️ Edit</button>
          <button onClick={()=>{setConfirmDel({id:viewData.id,ref:viewData.return_number});setViewData(null);setView("list");}} style={{...BG,background:"#dc2626",color:"#fff",borderColor:"#dc2626"}}>🗑 Delete</button>
        </div>
      </div>
<div style={FC}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 32px"}}>
          {[["Return No",viewData.return_number],["Date",fmtDate(viewData.return_date||viewData.created_at)],["Supplier",viewData.supplier_name],["Location",viewData.location],["Parent Purchase",viewData.purchase_ref||"—"],["Payment Status",viewData.payment_status],["Grand Total",fmtINR(viewData.total_amount)],["Amount Paid",fmtINR(viewData.amount_paid)],["Payment Due",fmtINR(viewData.payment_due)],["Reason",viewData.reason||"—"]].map(([label,val])=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}>
              <span style={{fontWeight:600,color:"#6b7280",fontSize:13}}>{label}</span>
              <span style={{color:"#111",fontSize:13,fontWeight:500}}>{val||"—"}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{...FC,marginTop:16}}>
        <div style={ST}>Products</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#f0fdf4",borderBottom:"2px solid #bbf7d0"}}>
            {["#","Product","Qty","Unit Price","Subtotal"].map(h=><th key={h} style={{padding:"10px",textAlign:"left",fontWeight:700,color:"#15803d",fontSize:12}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {(!viewData.items||viewData.items.length===0)
              ?<tr><td colSpan={5} style={{textAlign:"center",padding:24,color:"#9ca3af"}}>No products found</td></tr>
              :viewData.items.map((it,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}>
                  <td style={TD}>{i+1}</td>
                  <td style={TD}>{it.product_name}{it.product_sku&&<div style={{fontSize:11,color:"#9ca3af"}}>{it.product_sku}</div>}</td>
                  <td style={TD}>{it.quantity}</td>
                  <td style={TD}>{fmtINR(it.unit_price)}</td>
                  <td style={TD}><b style={{color:"#15803d"}}>{fmtINR(it.total_amount)}</b></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

const statCards=[
    {label:"TOTAL RETURNS",value:total,sub:`${returns.length} records`,color:"#15803d",
      onClick:()=>{setFSup("");setFFrom("");setFTo("");setFPayStatus("");setPage(1);}},
    {label:"TOTAL VALUE",value:fmtINR(returns.reduce((s,r)=>s+parseFloat(r.total_amount||0),0)),sub:"returned value",color:"#7c3aed",
      onClick:()=>{setFSup("");setFFrom("");setFTo("");setFPayStatus("");setPage(1);}},
    {label:"PAID",value:returns.filter(r=>r.payment_status==="Paid").length,sub:"fully paid",color:"#1d4ed8",
      onClick:()=>{setFPayStatus("Paid");setPage(1);}},
    {label:"PARTIAL",value:returns.filter(r=>r.payment_status==="Partial").length,sub:"partially paid",color:"#c2410c",
      onClick:()=>{setFPayStatus("Partial");setPage(1);}},
    {label:"PAYMENT DUE",value:fmtINR(returns.reduce((s,r)=>s+parseFloat(r.payment_due||0),0)),sub:`${returns.filter(r=>r.payment_status==="Due").length} pending`,color:"#b91c1c",
      onClick:()=>{setFPayStatus("Due");setPage(1);}},
  ];

  return(
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
 {ToastEl}
      {confirmDel&&<ConfirmModal message={`Delete return "${confirmDel.ref}"?`} onConfirm={delReturn} onCancel={()=>setConfirmDel(null)}/>}
      {confirmBulkDel&&<ConfirmModal message={`Delete ${selectedIds.length} selected return(s)? This cannot be undone.`} onConfirm={bulkDelete} onCancel={()=>setConfirmBulkDel(false)}/>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{fontSize:24,fontWeight:700,margin:0,color:"#111827"}}>Purchase Returns</h2>
          <div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>Home / Purchases / Purchase Return</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {selectedIds.length>0&&(
            <button
              onClick={()=>setConfirmBulkDel(true)}
              disabled={bulkDeleting}
              style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:20,padding:"10px 18px",fontSize:14,fontWeight:600,cursor:"pointer",opacity:bulkDeleting?0.7:1,display:"flex",alignItems:"center",gap:6}}
            >
              🗑 Delete Selected ({selectedIds.length})
            </button>
          )}
          <button onClick={()=>setView("add")} style={{...GN,display:"flex",alignItems:"center",gap:6,padding:"10px 20px",fontSize:14,borderRadius:20}}>＋ Add Return</button>
        </div>
      </div>

      {/* Stats */}
   <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16,marginBottom:20}}>
        {statCards.map(({label,value,sub,color,onClick})=>(
          <div key={label} onClick={onClick} style={{background:"#fff",borderRadius:10,padding:"16px 20px",boxShadow:"0 1px 4px #0001",borderLeft:`4px solid ${color}`,cursor:onClick?"pointer":"default",transition:"box-shadow .15s"}}
            onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow="0 4px 16px #0002";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px #0001";}}>
            <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",letterSpacing:1}}>{label}</div>
            <div style={{fontSize:24,fontWeight:800,color:"#111827",margin:"6px 0 2px"}}>{value}</div>
            <div style={{fontSize:12,color:"#9ca3af"}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{background:"#fff",borderRadius:10,padding:"14px 18px",marginBottom:16,boxShadow:"0 1px 3px #0001",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{fontSize:13,color:"#374151",fontWeight:600}}>Filters:</span>
        <input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} style={FI}/>
        <span style={{fontSize:12,color:"#9ca3af"}}>to</span>
        <input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} style={FI}/>
        <select value={fSup} onChange={e=>setFSup(e.target.value)} style={FI}><option value="">All Suppliers</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={fPayStatus} onChange={e=>{setFPayStatus(e.target.value);}} style={{border:"1px solid #d1d5db",borderRadius:7,padding:"7px 10px",fontSize:13,color:"#374151",background:"#fff"}}><option value="">All Payment Status</option><option>Paid</option><option>Due</option><option>Partial</option></select>
    <button onClick={()=>{setPage(1);setReloadTick(t=>t+1);}} style={GN}>Apply</button>
        <button onClick={clearF} style={BG}>Clear</button>
      </div>

      {/* Table */}
      <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px #0001",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid #f3f4f6",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,color:"#6b7280"}}>Show</span>
            <select value={showEntries} onChange={e=>{setShowEntries(Number(e.target.value));setPage(1);}} style={{...FI,width:70}}>{[10,25,50,100].map(n=><option key={n}>{n}</option>)}</select>
            <span style={{fontSize:13,color:"#6b7280"}}>entries</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>window.print()} style={{...BG,fontSize:12,padding:"6px 12px"}}>🖨 Print</button>
            <div style={{position:"relative"}}>
              <input placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{...FI,width:200,paddingLeft:30}}/>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#9ca3af",fontSize:13}}>🔍</span>
            </div>
          </div>
        </div>

        {loading?<Spinner/>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
                <tr style={{background:"#f9fafb",borderBottom:"2px solid #e5e7eb"}}>
                  <th style={{padding:"11px 12px",width:36}}>
                    <input
                      type="checkbox"
                      checked={returns.length>0&&selectedIds.length===returns.length}
                      onChange={toggleSelectAll}
                      style={{width:15,height:15,cursor:"pointer"}}
                    />
                  </th>
                  {["DATE","REFERENCE NO","PARENT PURCHASE","LOCATION","SUPPLIER","PAYMENT STATUS","GRAND TOTAL","PAYMENT DUE","ACTION"].map(h=>(
                    <th key={h} style={{padding:"11px 12px",textAlign:"left",fontWeight:700,color:"#374151",fontSize:12,letterSpacing:0.5,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.length===0
                  ?<tr><td colSpan={10} style={{textAlign:"center",padding:50,color:"#9ca3af",fontSize:14}}>No data available in table</td></tr>
                  :returns.map((r,i)=>(
                    <tr key={r.id||i} style={{borderBottom:"1px solid #f3f4f6",background:selectedIds.includes(r.id)?"#fef2f2":"transparent"}} onMouseEnter={e=>{if(!selectedIds.includes(r.id))e.currentTarget.style.background="#fafafa";}} onMouseLeave={e=>{if(!selectedIds.includes(r.id))e.currentTarget.style.background="transparent";}}>
                      <td style={TD}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={()=>toggleSelect(r.id)}
                          style={{width:15,height:15,cursor:"pointer"}}
                        />
                      </td>
                      <td style={TD}>{fmtDate(r.return_date||r.created_at)}</td>
                      <td style={TD}><span style={{fontWeight:600,color:"#111827"}}>{r.return_number||"—"}</span></td>
                      <td style={TD}>{r.purchase_ref||"—"}</td>
                      <td style={TD}>{r.location||"—"}</td>
                      <td style={TD}>{r.supplier_name||"—"}</td>
                      <td style={TD}><Badge label={r.payment_status}/></td>
                      <td style={{...TD,fontWeight:600,color:"#15803d"}}>{fmtINR(r.total_amount)}</td>
                      <td style={{...TD,fontWeight:600,color:"#b91c1c"}}>{fmtINR(r.payment_due)}</td>
                      <td style={{...TD,whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={async()=>{try{const full=await apiFetch("GET",`/purchase-returns/${r.id}`);setViewData(full.purchaseReturn||full);}catch{setViewData(r);}setView("view");}} title="View" style={IB("#2563eb")}><IconEye/></button>
                          <button onClick={()=>openEdit(r)} title="Edit" style={IB("#f59e0b")}><IconEdit/></button>
                          <button onClick={()=>setConfirmDel({id:r.id,ref:r.return_number||`#${r.id}`})} title="Delete" style={IB("#dc2626")}><IconDel/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
         {returns.length>0&&<tfoot><tr style={{background:"#f9fafb",fontWeight:700,borderTop:"2px solid #e5e7eb"}}>
                <td colSpan={7} style={{padding:"12px",color:"#374151"}}>Total ({total} records):</td>
                <td style={{padding:"12px",color:"#15803d"}}>{fmtINR(returns.reduce((s,r)=>s+parseFloat(r.total_amount||0),0))}</td>
                <td style={{padding:"12px",color:"#b91c1c"}}>{fmtINR(returns.reduce((s,r)=>s+parseFloat(r.payment_due||0),0))}</td>
                <td/>
              </tr></tfoot>}
            </table>
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px",borderTop:"1px solid #f3f4f6",fontSize:13,color:"#6b7280"}}>
          <span>{total===0?"Showing 0 entries":`Showing ${(page-1)*showEntries+1}–${Math.min(page*showEntries,total)} of ${total} entries`}</span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{...BG,padding:"5px 14px",opacity:page<=1?0.4:1}}>← Prev</button>
            {Array.from({length:Math.min(5,pages)},(_,i)=>{const pg=page<=3?i+1:page+i-2;if(pg<1||pg>pages)return null;return<button key={pg} onClick={()=>setPage(pg)} style={{...BG,padding:"5px 12px",background:pg===page?"#16a34a":"#fff",color:pg===page?"#fff":"#374151",borderColor:pg===page?"#16a34a":"#d1d5db",fontWeight:pg===page?700:400}}>{pg}</button>;})}
            <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages} style={{...BG,padding:"5px 14px",opacity:page>=pages?0.4:1}}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const OVR={position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000};
const FC={background:"#fff",borderRadius:10,padding:"20px 24px",boxShadow:"0 1px 4px #0001"};
const ST={fontSize:15,fontWeight:700,color:"#111827",marginBottom:14,paddingBottom:10,borderBottom:"1px solid #f3f4f6"};
const LB={display:"block",fontWeight:600,marginBottom:5,fontSize:12,color:"#374151",letterSpacing:0.3};
const INP={border:"1px solid #d1d5db",borderRadius:8,padding:"9px 12px",fontSize:13,width:"100%",boxSizing:"border-box",color:"#374151",outline:"none",background:"#fff"};
const TD={padding:"11px 12px",verticalAlign:"middle"};
const FI={border:"1px solid #d1d5db",borderRadius:7,padding:"7px 10px",fontSize:13,color:"#374151",background:"#fff",outline:"none"};
const DD={position:"absolute",top:"100%",left:0,right:0,zIndex:200,background:"#fff",border:"1px solid #d1d5db",borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",maxHeight:200,overflowY:"auto",marginTop:2};
const DI={padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f9fafb",background:"#fff"};
const GN={background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:600};
const BG={background:"#fff",color:"#374151",border:"1px solid #d1d5db",borderRadius:8,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:500};
const IB=(color)=>({background:`${color}15`,border:`1px solid ${color}40`,borderRadius:6,color,cursor:"pointer",padding:"6px 8px",display:"inline-flex",alignItems:"center",justifyContent:"center"});
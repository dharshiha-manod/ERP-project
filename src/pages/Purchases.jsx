/**
 * src/pages/Purchases.jsx
 * UI matches Stock Adjustments page style
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("manod_token") || ""}`,
});
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

const PSC={Received:{bg:"#dcfce7",color:"#15803d",border:"#86efac"},Ordered:{bg:"#dbeafe",color:"#1d4ed8",border:"#93c5fd"},Pending:{bg:"#fef9c3",color:"#a16207",border:"#fde047"},Cancelled:{bg:"#fee2e2",color:"#b91c1c",border:"#fca5a5"}};
const PYC={Paid:{bg:"#dcfce7",color:"#15803d",border:"#86efac"},Due:{bg:"#fee2e2",color:"#b91c1c",border:"#fca5a5"},Partial:{bg:"#ffedd5",color:"#c2410c",border:"#fed7aa"}};

function Badge({label,cm}){const c=(cm||{})[label]||{bg:"#f3f4f6",color:"#374151",border:"#d1d5db"};return <span style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{label||"—"}</span>;}
const Spinner=()=>(<div style={{display:"flex",justifyContent:"center",padding:60}}><div style={{width:36,height:36,border:"3px solid #e5e7eb",borderTopColor:"#16a34a",borderRadius:"50%",animation:"spin .7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

function ConfirmModal({message,onConfirm,onCancel}){return(<div style={OVR} onClick={onCancel}><div style={{background:"#fff",borderRadius:12,padding:28,maxWidth:360,width:"90%",textAlign:"center",boxShadow:"0 20px 60px #0002"}} onClick={e=>e.stopPropagation()}><div style={{fontSize:44,marginBottom:8}}>🗑️</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:700}}>Confirm Delete</h3><p style={{fontSize:14,color:"#6b7280",margin:"0 0 20px"}}>{message}</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><button onClick={onCancel} style={BG}>Cancel</button><button onClick={onConfirm} style={{...BG,background:"#dc2626",color:"#fff",borderColor:"#dc2626"}}>Delete</button></div></div></div>);}

const LOCS=["Manodtechnologies (BL0001)","Warehouse 2","Warehouse 3"];
const PMTS=["Cash","Card","Bank Transfer","Cheque","UPI"];
const PSTS=["Ordered","Received","Pending","Cancelled"];
const TXRT={"None":0,"GST 5%":0.05,"GST 12%":0.12,"GST 18%":0.18};

// ── ICON SVGs ──────────────────────────────────────────────────────────────
const IconEye=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDel=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

// ══════════════════════════════════════════════════════════════════════════
// PURCHASE FORM
// ══════════════════════════════════════════════════════════════════════════
function PurchaseForm({onSubmit,onCancel,editData=null}){
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
  const [items,setItems]=useState([]);
  const [form,setForm]=useState({refNo:"",invoiceNo:"",location:LOCS[0],purchStatus:"Ordered",payTerm:"",taxLabel:"None",discType:"None",discAmt:"0",shipping:"0",payMethod:"Cash",payAmt:"0",payNote:"",notes:""});
  const [docFile,setDocFile]=useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    fetch(`${BASE_URL}/contacts?contactType=Suppliers&limit=500`,{headers:authHeaders()})
      .then(r=>r.json()).then(d=>setSuppliers((d.contacts||[]).map(c=>({id:c.id,name:(c.name||c.business_name||c.first_name||"").trim()||`#${c.id}`,mobile:c.mobile||""})).filter(s=>s.name))).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!editData)return;
    setForm({refNo:editData.reference_no||"",invoiceNo:editData.invoice_no||"",location:editData.location||LOCS[0],purchStatus:editData.purchase_status||"Ordered",payTerm:editData.pay_term||"",taxLabel:editData.tax_label||"None",discType:"Fixed",discAmt:String(editData.discount_amount||0),shipping:String(editData.shipping_charges||0),payMethod:editData.payment_method||"Cash",payAmt:String(editData.amount_paid||0),payNote:editData.notes||editData.payment_note||"",notes:editData.notes||""});
    if(editData.supplier_name){setSupSearch(editData.supplier_name);setSelSup({id:editData.supplier_id,name:editData.supplier_name});}
    if(Array.isArray(editData.items)){setItems(editData.items.map(i=>({id:i.product_id||null,name:i.product_name||i.name||"",sku:i.product_sku||i.sku||"",qty:parseFloat(i.quantity)||1,unitCost:parseFloat(i.unit_cost)||0,discPct:parseFloat(i.discount_pct)||0,marginPct:parseFloat(i.margin_pct)||0,lineTotal:parseFloat(i.line_total)||0,sellingPrice:parseFloat(i.selling_price)||0})));}
  },[editData]);

  const loadProds=async()=>{
    if(prodSugg.length===0){setSearchingProd(true);try{const d=await apiFetch("GET","/purchases/products/search?q=");setProdSugg(d.products||[]);}catch{setProdSugg([]);}finally{setSearchingProd(false);}}
    setShowProdDrop(true);
  };
  const searchProd=async(val)=>{
    setProdSearch(val);setSearchingProd(true);
    try{const d=await apiFetch("GET",`/purchases/products/search?q=${encodeURIComponent(val)}`);setProdSugg(d.products||[]);setShowProdDrop(true);}
    catch{setProdSugg([]);}finally{setSearchingProd(false);}
  };
const selProd=(p)=>{
  const cost=parseFloat(p.default_price ?? p.unit_purchase_price ?? p.purchase_price ?? 0)||0;
  setItems(prev=>[...prev,{id:p.id||null,name:p.name,sku:p.sku||"",qty:1,unitCost:cost,discPct:0,marginPct:0,lineTotal:cost,sellingPrice:cost}]);
  setProdSearch("");setShowProdDrop(false);
};
  const addManual=()=>{if(!prodSearch.trim())return;setItems(prev=>[...prev,{id:null,name:prodSearch,sku:"",qty:1,unitCost:0,discPct:0,marginPct:0,lineTotal:0,sellingPrice:0}]);setProdSearch("");setShowProdDrop(false);};
  const updItem=(i,field,val)=>{setItems(prev=>{const arr=[...prev];const it={...arr[i],[field]:parseFloat(val)||0};const qty=field==="qty"?parseFloat(val)||0:it.qty;const cost=field==="unitCost"?parseFloat(val)||0:it.unitCost;const disc=field==="discPct"?parseFloat(val)||0:it.discPct;const margin=field==="marginPct"?parseFloat(val)||0:it.marginPct;const cxd=cost*(1-disc/100);it.lineTotal=+(qty*cxd).toFixed(2);it.sellingPrice=+(cxd*(1+margin/100)).toFixed(2);arr[i]=it;return arr;});};

  const sub=items.reduce((s,i)=>s+i.lineTotal,0);
  const discVal=+(form.discType==="Percentage"?sub*(parseFloat(form.discAmt)||0)/100:parseFloat(form.discAmt)||0).toFixed(2);
  const tax=+((sub-discVal)*(TXRT[form.taxLabel]||0)).toFixed(2);
  const ship=parseFloat(form.shipping)||0;
  const grand=+((sub-discVal+tax+ship).toFixed(2));

  const submit=async()=>{
    if(!selSup){showToast("Please select a supplier","error");return;}
    if(items.length===0){showToast("Please add at least one product","error");return;}
    setSaving(true);
    try{
      const paid=parseFloat(form.payAmt)||0;
      const body={supplier_id:selSup.id,supplier_name:selSup.name,location:form.location,reference_no:form.refNo||null,invoice_no:form.invoiceNo||null,purchase_status:form.purchStatus,pay_term:form.payTerm||null,tax_label:form.taxLabel,discount_type:form.discType,discount_amount:discVal,shipping_charges:ship,subtotal:sub,tax_amount:tax,grand_total:grand,amount_paid:paid,payment_amount:paid,payment_due:Math.max(0,grand-paid),payment_status:paid>=grand&&grand>0?"Paid":paid>0?"Partial":"Due",items:items.map(i=>({product_id:i.id,product_name:i.name,product_sku:i.sku||null,quantity:i.qty,unit_cost:i.unitCost,discount_pct:i.discPct,line_total:i.lineTotal,margin_pct:i.marginPct,selling_price:i.sellingPrice})),notes:form.payNote||null,shipping_details:null,notes:form.payNote||null,shipping_details:null,payment:paid>0?{amount:paid,payment_method:form.payMethod,note:form.payNote||null}:null};
      if(isEdit){await apiFetch("PUT",`/purchases/${editData.id}`,body);showToast("Purchase updated!","success");}
      else{await apiFetch("POST","/purchases",body);showToast("Purchase created!","success");}
      setTimeout(()=>onSubmit(),1200);
    }catch(err){showToast(err.message||"Failed to save","error");}
    finally{setSaving(false);}
  };

  return(
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:1100}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onCancel} style={BG}>← Back</button>
        <div>
          <h2 style={{fontSize:22,fontWeight:700,margin:0,color:"#111827"}}>{isEdit?"Edit":"Add"} Purchase</h2>
          <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>Home / Purchases / {isEdit?"Edit":"Add"}</div>
        </div>
      </div>

      <div style={FC}>
        <div style={ST}>Purchase Information</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          <div>
            <label style={LB}>Supplier *</label>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",border:"1px solid #d1d5db",borderRadius:8,background:"#fff"}}>
                <span style={{padding:"0 10px",color:"#9ca3af"}}>👤</span>
                <input value={supSearch} onChange={e=>{setSupSearch(e.target.value);setShowSupDrop(true);if(!e.target.value)setSelSup(null);}} onFocus={()=>setShowSupDrop(true)} onBlur={()=>setTimeout(()=>setShowSupDrop(false),150)} placeholder="Search supplier..." style={{...INP,border:"none",flex:1}} autoComplete="off"/>
              </div>
              {selSup&&<div style={{fontSize:11,color:"#16a34a",marginTop:3,fontWeight:500}}>✓ {selSup.name}</div>}
              {showSupDrop&&<div style={DD}>{suppliers.filter(s=>!supSearch||s.name.toLowerCase().includes(supSearch.toLowerCase())).slice(0,10).map(s=><div key={s.id} onMouseDown={()=>{setSelSup(s);setSupSearch(s.name);setShowSupDrop(false);}} style={DI} onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><div style={{fontWeight:600,fontSize:13}}>{s.name}</div>{s.mobile&&<div style={{fontSize:11,color:"#9ca3af"}}>{s.mobile}</div>}</div>)}{suppliers.filter(s=>!supSearch||s.name.toLowerCase().includes(supSearch.toLowerCase())).length===0&&<div style={{padding:"12px",color:"#9ca3af",fontSize:13,textAlign:"center"}}>No suppliers found</div>}</div>}
            </div>
          </div>
          <div><label style={LB}>Reference No</label><input value={form.refNo} onChange={e=>set("refNo",e.target.value)} style={INP} placeholder="Auto-generated"/></div>
          <div><label style={LB}>Invoice No</label><input value={form.invoiceNo} onChange={e=>set("invoiceNo",e.target.value)} style={INP} placeholder="Optional"/></div>
          <div><label style={LB}>Purchase Status *</label><select value={form.purchStatus} onChange={e=>set("purchStatus",e.target.value)} style={INP}>{PSTS.map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginTop:14}}>
          <div><label style={LB}>Business Location *</label><select value={form.location} onChange={e=>set("location",e.target.value)} style={INP}>{LOCS.map(l=><option key={l}>{l}</option>)}</select></div>
          <div><label style={LB}>Pay Term</label><input value={form.payTerm} onChange={e=>set("payTerm",e.target.value)} style={INP} placeholder="e.g. 30 Days"/></div>
          <div><label style={LB}>Purchase Date</label><input readOnly value={new Date().toLocaleString()} style={{...INP,background:"#f9fafb",color:"#6b7280"}}/></div>
          <div><label style={LB}>Attach Document</label><div style={{display:"flex",gap:8}}><input readOnly value={docFile?.name||""} style={{...INP,flex:1}} placeholder="No file chosen"/><label style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:8,padding:"9px 14px",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Browse<input type="file" hidden onChange={e=>setDocFile(e.target.files[0])}/></label></div></div>
        </div>
      </div>

      <div style={{...FC,marginTop:16}}>
        <div style={ST}>Products</div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{position:"relative",width:"75%"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:searchingProd?"#f59e0b":"#9ca3af",zIndex:1}}>{searchingProd?"⏳":"🔍"}</span>
            <input value={prodSearch} onChange={e=>searchProd(e.target.value)} onFocus={loadProds} onBlur={()=>setTimeout(()=>setShowProdDrop(false),150)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addManual();}if(e.key==="Escape")setShowProdDrop(false);}} placeholder="Type product name or SKU to search..." style={{...INP,paddingLeft:38}} autoComplete="off"/>
            {showProdDrop&&prodSugg.length>0&&<div style={{...DD,maxHeight:260}}>{prodSugg.filter(p=>!prodSearch||p.name?.toLowerCase().includes(prodSearch.toLowerCase())||p.sku?.toLowerCase().includes(prodSearch.toLowerCase())).map((p,i)=><div key={p.id||i} onMouseDown={()=>selProd(p)} style={{...DI,display:"flex",justifyContent:"space-between"}} onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><div><div style={{fontWeight:600,fontSize:13}}>{p.name}</div>{p.sku&&<div style={{fontSize:11,color:"#9ca3af"}}>SKU: {p.sku}</div>}</div><div style={{fontWeight:600,color:"#16a34a",fontSize:13}}>{(p.default_price ?? p.unit_purchase_price ?? p.purchase_price)?`₹${parseFloat(p.default_price ?? p.unit_purchase_price ?? p.purchase_price).toFixed(2)}`:"—"}</div></div>)}{prodSearch&&<div onMouseDown={addManual} style={{...DI,color:"#2563eb",fontWeight:600,textAlign:"center",borderTop:"1px solid #f3f4f6"}}>＋ Add "{prodSearch}" manually</div>}</div>}
          </div>
          <button onClick={addManual} style={{marginLeft:10,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,color:"#2563eb",fontWeight:600,cursor:"pointer",fontSize:13,padding:"0 16px"}}>＋ Add</button>
        </div>

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f0fdf4",borderBottom:"2px solid #bbf7d0"}}>{["#","Product Name","Qty","Unit Cost","Disc %","Cost (ex disc)","Line Total","Margin %","Selling Price",""].map(h=><th key={h} style={{padding:"10px",textAlign:"left",fontWeight:700,color:"#15803d",fontSize:12,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>
              {items.length===0?<tr><td colSpan={10} style={{textAlign:"center",padding:40,color:"#9ca3af",fontSize:14}}>No products added — search above to add</td></tr>
              :items.map((item,i)=>{const cxd=item.unitCost*(1-item.discPct/100);return(<tr key={i} style={{borderBottom:"1px solid #f3f4f6"}} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><td style={TD}><span style={{fontWeight:600,color:"#6b7280"}}>{i+1}</span></td><td style={TD}><div style={{fontWeight:600}}>{item.name}</div>{item.sku&&<div style={{fontSize:11,color:"#9ca3af"}}>{item.sku}</div>}</td><td style={TD}><input type="number" defaultValue={item.qty} min={1} style={{...INP,width:60,padding:"6px 8px"}} onChange={e=>updItem(i,"qty",e.target.value)}/></td><td style={TD}><input type="number" defaultValue={item.unitCost} min={0} style={{...INP,width:80,padding:"6px 8px"}} onChange={e=>updItem(i,"unitCost",e.target.value)}/></td><td style={TD}><input type="number" defaultValue={item.discPct} min={0} max={100} style={{...INP,width:60,padding:"6px 8px"}} onChange={e=>updItem(i,"discPct",e.target.value)}/></td><td style={TD}>₹{cxd.toFixed(2)}</td><td style={TD}><b style={{color:"#15803d"}}>₹{item.lineTotal.toFixed(2)}</b></td><td style={TD}><input type="number" defaultValue={item.marginPct} min={0} style={{...INP,width:60,padding:"6px 8px"}} onChange={e=>updItem(i,"marginPct",e.target.value)}/></td><td style={TD}><span style={{color:"#7c3aed",fontWeight:600}}>₹{item.sellingPrice.toFixed(2)}</span></td><td style={TD}><button onClick={()=>setItems(items.filter((_,idx)=>idx!==i))} style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:6,color:"#dc2626",cursor:"pointer",padding:"5px 10px"}}>🗑</button></td></tr>);})}
            </tbody>
          </table>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:20,gap:24,flexWrap:"wrap"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,minWidth:320}}>
            <div><label style={LB}>Discount Type</label><select value={form.discType} onChange={e=>set("discType",e.target.value)} style={INP}>{["None","Percentage","Fixed"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={LB}>Discount Amount</label><input type="number" min={0} value={form.discAmt} onChange={e=>set("discAmt",e.target.value)} style={INP}/></div>
            <div><label style={LB}>Purchase Tax</label><select value={form.taxLabel} onChange={e=>set("taxLabel",e.target.value)} style={INP}>{Object.keys(TXRT).map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={LB}>Shipping Charges</label><input type="number" min={0} value={form.shipping} onChange={e=>set("shipping",e.target.value)} style={INP}/></div>
          </div>
          <div style={{background:"#f0fdf4",borderRadius:10,padding:"16px 24px",minWidth:220,textAlign:"right",border:"1px solid #bbf7d0"}}>
            <div style={{fontSize:13,color:"#6b7280",marginBottom:4}}>Total Items: <b style={{color:"#111"}}>{items.length}</b></div>
            <div style={{fontSize:13,color:"#6b7280"}}>Sub Total: <b>{fmtINR(sub)}</b></div>
            {discVal>0&&<div style={{fontSize:13,color:"#dc2626"}}>Discount: <b>-{fmtINR(discVal)}</b></div>}
            {tax>0&&<div style={{fontSize:13,color:"#6b7280"}}>Tax: <b>{fmtINR(tax)}</b></div>}
            {ship>0&&<div style={{fontSize:13,color:"#6b7280"}}>Shipping: <b>{fmtINR(ship)}</b></div>}
            <div style={{fontWeight:800,fontSize:20,color:"#15803d",marginTop:8,borderTop:"1px solid #bbf7d0",paddingTop:8}}>Net Total: {fmtINR(grand)}</div>
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
        <div style={{marginTop:12,padding:"10px 14px",background:"#f9fafb",borderRadius:8,fontSize:13,color:"#374151",display:"flex",gap:24,flexWrap:"wrap"}}>
          <span>Grand Total: <b style={{color:"#15803d"}}>{fmtINR(grand)}</b></span>
          <span>Amount Paid: <b style={{color:"#2563eb"}}>{fmtINR(parseFloat(form.payAmt)||0)}</b></span>
          <span>Payment Due: <b style={{color:Math.max(0,grand-(parseFloat(form.payAmt)||0))>0?"#dc2626":"#16a34a"}}>{fmtINR(Math.max(0,grand-(parseFloat(form.payAmt)||0)))}</b></span>
          <span>Status: <b>{(parseFloat(form.payAmt)||0)>=grand&&grand>0?"Paid":(parseFloat(form.payAmt)||0)>0?"Partial":"Due"}</b></span>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:28}}>
        <button onClick={onCancel} style={BG}>Cancel</button>
        <button onClick={submit} disabled={saving} style={{...GN,opacity:saving?0.7:1,minWidth:180}}>{saving?"Saving…":isEdit?"Update Purchase":"Submit Purchase"}</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PURCHASES LIST
// ══════════════════════════════════════════════════════════════════════════
export default function Purchases(){
  const navigate=useNavigate();
  const location=useLocation();
  const {showToast,ToastEl}=useToast();
  const isCreate=location.pathname==="/purchases/create";

  const [view,setView]=useState(isCreate?"add":"list");
  const [editData,setEditData]=useState(null);
  const [viewData,setViewData]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const [purchases,setPurchases]=useState([]);
  const [total,setTotal]=useState(0);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [showEntries,setShowEntries]=useState(25);
  const [page,setPage]=useState(1);
  const [suppliers,setSuppliers]=useState([]);
  const [fSup,setFSup]=useState("");
  const [fPS,setFPS]=useState("");
  const [fPay,setFPay]=useState("");
  const [fFrom,setFFrom]=useState("");
  const [fTo,setFTo]=useState("");

  useEffect(()=>{if(isCreate&&view!=="add")setView("add");if(!isCreate&&view==="add")setView("list");},[location.pathname]);
  useEffect(()=>{fetch(`${BASE_URL}/contacts?contactType=Suppliers&limit=500`,{headers:authHeaders()}).then(r=>r.json()).then(d=>setSuppliers((d.contacts||[]).map(c=>({id:c.id,name:(c.name||c.business_name||"").trim()||`#${c.id}`})))).catch(()=>{});},[]);

  const load=useCallback(async(ov={})=>{
    setLoading(true);
    try{
      const p=new URLSearchParams({page,limit:showEntries});
      const s="search" in ov?ov.search:search;
      const sup="fSup" in ov?ov.fSup:fSup;
      const ps="fPS" in ov?ov.fPS:fPS;
      const pay="fPay" in ov?ov.fPay:fPay;
      const fr="fFrom" in ov?ov.fFrom:fFrom;
      const to="fTo" in ov?ov.fTo:fTo;
      if(s)p.set("search",s);
      if(sup)p.set("supplier_id",sup);
      if(ps)p.set("purchase_status",ps);
      if(pay)p.set("payment_status",pay);
      if(fr)p.set("date_from",fr);
      if(to)p.set("date_to",to);
      const data=await apiFetch("GET",`/purchases?${p}`);
      const rows=data.purchases||data.rows||[];
      setPurchases(rows);setTotal(data.total||0);
    }catch{setPurchases([]);setTotal(0);}
    finally{setLoading(false);}
  },[page,showEntries,search,fSup,fPS,fPay,fFrom,fTo]);

  useEffect(()=>{if(view==="list")load();},[view,load]);
  useEffect(()=>setPage(1),[search,showEntries]);

  const delPurchase=async()=>{
    if(!confirmDel)return;
    try{await apiFetch("DELETE",`/purchases/${confirmDel.id}`);showToast("Deleted","success");setConfirmDel(null);load();}
    catch(err){showToast(err.message,"error");setConfirmDel(null);}
  };

  const openEdit=async(r)=>{
    try{const full=await apiFetch("GET",`/purchases/${r.id}`);setEditData(full.purchase||full);}
    catch{setEditData(r);}
    setView("edit");
  };

  const clearF=()=>{setFSup("");setFPS("");setFPay("");setFFrom("");setFTo("");setPage(1);load({fSup:"",fPS:"",fPay:"",fFrom:"",fTo:""});};
  const pages=Math.ceil(total/showEntries)||1;

  if(view==="add"||view==="edit") return <PurchaseForm editData={view==="edit"?editData:null} onSubmit={()=>{setView("list");navigate("/purchases");load();showToast(view==="edit"?"Updated!":"Added!","success");}} onCancel={()=>{setView("list");setEditData(null);navigate("/purchases");}}/>;

  if(view==="view"&&viewData) return(
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:900}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={()=>{setView("list");setViewData(null);}} style={BG}>← Back</button>
        <div><h2 style={{fontSize:22,fontWeight:700,margin:0}}>Purchase Details</h2><div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>Home / Purchases / Detail</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={()=>openEdit(viewData)} style={GN}>✏️ Edit</button>
          <button onClick={()=>{setConfirmDel({id:viewData.id,ref:viewData.reference_no});setViewData(null);setView("list");}} style={{...BG,background:"#dc2626",color:"#fff",borderColor:"#dc2626"}}>🗑 Delete</button>
        </div>
      </div>
     <div style={FC}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 32px"}}>
        {[["Reference No",viewData.reference_no],["Date",fmtDate(viewData.purchase_date)],["Supplier",viewData.supplier_name],["Location",viewData.location],["Purchase Status",viewData.purchase_status],["Payment Status",viewData.payment_status],["Grand Total",fmtINR(viewData.grand_total)],["Amount Paid",fmtINR(viewData.amount_paid)],["Payment Due",fmtINR(viewData.payment_due)],["Added By",viewData.added_by_name||viewData.added_by||"—"]].map(([label,val])=>(
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
            {["#","Product","Qty","Unit Cost","Line Total"].map(h=><th key={h} style={{padding:"10px",textAlign:"left",fontWeight:700,color:"#15803d",fontSize:12}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {(!viewData.items||viewData.items.length===0)
              ?<tr><td colSpan={5} style={{textAlign:"center",padding:24,color:"#9ca3af"}}>No products found</td></tr>
              :viewData.items.map((it,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}>
                  <td style={TD}>{i+1}</td>
                  <td style={TD}>{it.product_name}{it.product_sku&&<div style={{fontSize:11,color:"#9ca3af"}}>{it.product_sku}</div>}</td>
                  <td style={TD}>{it.quantity}</td>
                  <td style={TD}>{fmtINR(it.unit_cost)}</td>
                  <td style={TD}><b style={{color:"#15803d"}}>{fmtINR(it.line_total)}</b></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
const statCards=[
    {label:"TOTAL PURCHASES",value:total,sub:`${purchases.filter(r=>r.purchase_status==="Received").length} received`,color:"#15803d",
      onClick:()=>{setFPS("");setFPay("");setFSup("");setFFrom("");setFTo("");setPage(1);}},
    {label:"TOTAL VALUE",value:fmtINR(purchases.reduce((s,r)=>s+parseFloat(r.grand_total||0),0)),sub:`${purchases.length} records`,color:"#1d4ed8",
      onClick:()=>{setFPS("");setFPay("");setFSup("");setFFrom("");setFTo("");setPage(1);}},
    {label:"RECEIVED",value:purchases.filter(r=>r.purchase_status==="Received").length,sub:"fully received",color:"#7c3aed",
      onClick:()=>{setFPS("Received");setFPay("");setPage(1);}},
    {label:"PARTIAL",value:purchases.filter(r=>r.payment_status==="Partial").length,sub:"partially paid",color:"#c2410c",
      onClick:()=>{setFPS("");setFPay("Partial");setPage(1);}},
    {label:"PAYMENT DUE",value:fmtINR(purchases.reduce((s,r)=>s+parseFloat(r.payment_due||0),0)),sub:`${purchases.filter(r=>r.payment_status==="Due").length} pending`,color:"#b91c1c",
      onClick:()=>{setFPS("");setFPay("Due");setPage(1);}},
  ];
  return(
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      {ToastEl}
      {confirmDel&&<ConfirmModal message={`Delete purchase "${confirmDel.ref}"?`} onConfirm={delPurchase} onCancel={()=>setConfirmDel(null)}/>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{fontSize:24,fontWeight:700,margin:0,color:"#111827"}}>All Purchases</h2>
          <div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>Home / Purchases / List</div>
        </div>
        <button onClick={()=>{setView("add");navigate("/purchases/create");}} style={{...GN,display:"flex",alignItems:"center",gap:6,padding:"10px 20px",fontSize:14,borderRadius:20}}>
          ＋ Add Purchase
        </button>
      </div>

      {/* Stats - clickable to filter */}
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
        <select value={fPS} onChange={e=>setFPS(e.target.value)} style={FI}><option value="">All Purchase Status</option>{PSTS.map(s=><option key={s}>{s}</option>)}</select>
        <select value={fPay} onChange={e=>setFPay(e.target.value)} style={FI}><option value="">All Payment Status</option>{["Paid","Due","Partial"].map(s=><option key={s}>{s}</option>)}</select>
        <button onClick={()=>{setPage(1);load();}} style={GN}>Apply</button>
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
            <button onClick={()=>{const c=["reference_no","purchase_date","supplier_name","grand_total","payment_due"];const h=["Ref No","Date","Supplier","Grand Total","Payment Due"];const csv=[h.join(","),...purchases.map(r=>c.map(k=>`"${r[k]||""}"`).join(","))].join("\n");const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv"})),download:"purchases.csv"});document.body.appendChild(a);a.click();document.body.removeChild(a);}} style={{...BG,fontSize:12,padding:"6px 12px",color:"#15803d",borderColor:"#86efac"}}>Export CSV</button>
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
                  {["DATE","REFERENCE NO","LOCATION","SUPPLIER","PURCHASE STATUS","PAYMENT STATUS","GRAND TOTAL","PAYMENT DUE","ADDED BY","ACTION"].map(h=>(
                    <th key={h} style={{padding:"11px 12px",textAlign:"left",fontWeight:700,color:"#374151",fontSize:12,letterSpacing:0.5,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.length===0
                  ?<tr><td colSpan={10} style={{textAlign:"center",padding:50,color:"#9ca3af",fontSize:14}}>No data available in table</td></tr>
                  :purchases.map((r,i)=>(
                    <tr key={r.id||i} style={{borderBottom:"1px solid #f3f4f6"}} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={TD}>{fmtDate(r.purchase_date)}</td>
                      <td style={TD}><span style={{fontWeight:600,color:"#111827"}}>{r.reference_no||"—"}</span></td>
                      <td style={TD}>{r.location||"—"}</td>
                      <td style={TD}>{r.supplier_name||"—"}</td>
                      <td style={TD}><Badge label={r.purchase_status} cm={PSC}/></td>
                      <td style={TD}><Badge label={r.payment_status} cm={PYC}/></td>
                      <td style={{...TD,fontWeight:600,color:"#15803d"}}>{fmtINR(r.grand_total)}</td>
                      <td style={{...TD,fontWeight:600,color:"#b91c1c"}}>{fmtINR(r.payment_due)}</td>
                      <td style={TD}><span style={{fontSize:12}}>{r.added_by_name||r.added_by||"—"}</span></td>
                      <td style={{...TD,whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={async()=>{try{const full=await apiFetch("GET",`/purchases/${r.id}`);setViewData(full.purchase||full);}catch{setViewData(r);}setView("view");}} title="View" style={IB("#2563eb")}><IconEye/></button>
                          <button onClick={()=>openEdit(r)} title="Edit" style={IB("#f59e0b")}><IconEdit/></button>
                          <button onClick={()=>setConfirmDel({id:r.id,ref:r.reference_no||`#${r.id}`})} title="Delete" style={IB("#dc2626")}><IconDel/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
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
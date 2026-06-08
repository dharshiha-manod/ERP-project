import { useState } from "react";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const colors = { success: "#1a5c38", error: "#dc2626", info: "#3b82f6" };
  const icons  = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div style={{
      position:"fixed",top:24,right:24,zIndex:9999,background:"#fff",borderRadius:10,
      padding:"14px 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
      borderLeft:`5px solid ${colors[type]||"#1a5c38"}`,
      display:"flex",alignItems:"center",gap:12,minWidth:280,maxWidth:380,
      animation:"slideIn 0.25s ease",
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{fontSize:20}}>{icons[type]||"✅"}</span>
      <span style={{fontSize:14,color:"#111",flex:1,fontWeight:500}}>{message}</span>
      <button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#9ca3af",lineHeight:1}}>×</button>
    </div>
  );
}
function useToast() {
  const [toast,setToast] = useState(null);
  const showToast = (message,type="success") => {
    setToast({message,type});
    setTimeout(()=>setToast(null),3000);
  };
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/> : null;
  return {showToast,ToastEl};
}

// ── Export helpers ─────────────────────────────────────────────────────────────
const exportCSV = (data,headers,filename) => {
  const rows=[headers.join(","),...data.map(r=>headers.map(h=>`"${String(r[h]??"").replace(/"/g,'""')}"`).join(","))];
  const blob=new Blob([rows.join("\n")],{type:"text/csv;charset=utf-8;"});
  const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:filename});
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
};
const exportExcel = (data,headers,filename) => {
  const xmlRows=data.map(r=>`<Row>${headers.map(h=>`<Cell><Data ss:Type="String">${String(r[h]??"")}</Data></Cell>`).join("")}</Row>`).join("");
  const headerRow=`<Row>${headers.map(h=>`<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>`;
  const xml=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="header"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Sheet1"><Table>${headerRow}${xmlRows}</Table></Worksheet></Workbook>`;
  const blob=new Blob([xml],{type:"application/vnd.ms-excel;charset=utf-8;"});
  const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:filename});
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
};
const exportPDF = (title,columns,data) => {
  const w=window.open("","_blank");
  const rows=data.length===0
    ?`<tr><td colspan="${columns.length}" style="text-align:center;padding:20px;color:#888;">No data available</td></tr>`
    :data.map(r=>`<tr>${columns.map(c=>`<td style="padding:8px 12px;border-bottom:1px solid #eee;">${r[c.key]??""}</td>`).join("")}</tr>`).join("");
  const ths=columns.map(c=>`<th style="padding:10px 12px;text-align:left;background:#1a5c38;color:#fff;font-weight:600;">${c.label}</th>`).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#222;}h2{color:#1a5c38;margin-bottom:20px;}table{width:100%;border-collapse:collapse;font-size:13px;}@media print{button{display:none!important}}</style></head>
    <body><h2>${title}</h2><p style="color:#666;margin-bottom:16px;">Generated: ${new Date().toLocaleDateString()}</p>
    <table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>
    <div style="margin-top:40px;text-align:right;"><button onclick="window.print()" style="background:#1a5c38;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;">🖨️ Print</button></div></body></html>`);
  w.document.close();
};

// ── Column Visibility Modal ────────────────────────────────────────────────────
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

// ── Export Toolbar ─────────────────────────────────────────────────────────────
function ExportToolbar({showEntries,setShowEntries,search,setSearch,onExportCSV,onExportExcel,onExportPDF,columns,visibleCols,setVisibleCols}) {
  const [showColModal,setShowColModal]=useState(false);
  const btns=[
    {label:"Export CSV",  tag:"csv", tagColor:"#1a5c38", bg:"#e8f5ee", border:"#86efac", color:"#1a5c38", fn:onExportCSV},
    {label:"Export Excel",tag:"xls", tagColor:"#1a5c38", bg:"#e8f5ee", border:"#86efac", color:"#1a5c38", fn:onExportExcel},
    {label:"Print",       color:"#2563eb", bg:"#eff6ff", border:"#93c5fd", fn:()=>window.print(),
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>},
    {label:"Column visibility", color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd", fn:()=>setShowColModal(true),
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>},
    {label:"Export PDF",  color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", fn:onExportPDF, hasDropdown:true,
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>},
  ];
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:13,color:"#555"}}>Show</span>
        <select value={showEntries} onChange={e=>setShowEntries(Number(e.target.value))}
          style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13,color:"#374151",background:"#fff",cursor:"pointer"}}>
          {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
        </select>
        <span style={{fontSize:13,color:"#555"}}>entries</span>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {btns.map(({label,icon,tag,tagColor,color,bg,border,fn,hasDropdown})=>(
          <button key={label} onClick={fn} style={{
            display:"flex",alignItems:"center",gap:6,padding:"6px 13px",
            border:`1px solid ${border||"#d1d5db"}`,borderRadius:6,
            background:bg||"#fff",color,cursor:"pointer",fontSize:13,fontWeight:500,transition:"all 0.15s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.opacity="0.82";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.10)";}}
            onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.boxShadow="none";}}>
            {tag
              ? <span style={{background:tagColor,color:"#fff",borderRadius:3,fontSize:9,fontWeight:800,padding:"1px 4px",letterSpacing:0.5,textTransform:"uppercase"}}>{tag}</span>
              : icon}
            {label}
            {hasDropdown && <span style={{marginLeft:2,fontSize:10}}>▼</span>}
          </button>
        ))}
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{border:"1px solid #d1d5db",borderRadius:6,padding:"7px 12px",fontSize:13,width:160,outline:"none",color:"#374151"}}/>
      </div>
      {showColModal && columns && (
        <ColVisModal columns={columns} visibleCols={visibleCols} setVisibleCols={setVisibleCols} onClose={()=>setShowColModal(false)}/>
      )}
    </div>
  );
}

// ── Sample Data ────────────────────────────────────────────────────────────────
const SAMPLE_RETURNS = [
  {date:"08/06/2026",refNo:"PR-0001",parentPurchase:"PO-0001",location:"Manodtechnologies (BL0001)",supplier:"Supplier A",paymentStatus:"Paid",grandTotal:"₹2,400.00",paymentDue:"₹0.00"},
  {date:"06/06/2026",refNo:"PR-0002",parentPurchase:"PO-0003",location:"Warehouse 2",supplier:"Supplier C",paymentStatus:"Due",grandTotal:"₹1,100.00",paymentDue:"₹1,100.00"},
  {date:"03/06/2026",refNo:"PR-0003",parentPurchase:"PO-0002",location:"Manodtechnologies (BL0001)",supplier:"Supplier B",paymentStatus:"Partial",grandTotal:"₹850.00",paymentDue:"₹425.00"},
];

const SUPPLIERS = ["Supplier A","Supplier B","Supplier C","Supplier D"];
const LOCATIONS = ["Manodtechnologies (BL0001)","Warehouse 2","Warehouse 3"];
const PARENT_PURCHASES = ["PO-0001","PO-0002","PO-0003","PO-0004","PO-0005"];

const LIST_COLS = [
  {key:"date",label:"Date"},{key:"refNo",label:"Reference No"},
  {key:"parentPurchase",label:"Parent Purchase"},{key:"location",label:"Location"},
  {key:"supplier",label:"Supplier"},{key:"paymentStatus",label:"Payment Status"},
  {key:"grandTotal",label:"Grand Total"},{key:"paymentDue",label:"Payment Due"},
];

// ── Add Purchase Return Form ───────────────────────────────────────────────────
function AddPurchaseReturnForm({onSubmit,onCancel}) {
  const {showToast,ToastEl} = useToast();
  const [form,setForm] = useState({
    supplier:"",location:"",refNo:"",parentPurchase:"",purchaseTax:"None",
    date:new Date().toLocaleString(),
  });
  const [products,setProducts] = useState([]);
  const [productSearch,setProductSearch] = useState("");
  const [docFile,setDocFile] = useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const handleSearch = () => {
    if(!productSearch.trim()) return;
    setProducts(p=>[...p,{name:productSearch,qty:1,unitPrice:0,subtotal:0}]);
    setProductSearch("");
  };

  const updateProduct = (i,field,val) => {
    setProducts(prev=>{
      const arr=[...prev];
      arr[i]={...arr[i],[field]:val};
      arr[i].subtotal=(Number(field==="qty"?val:arr[i].qty)||1)*(Number(field==="unitPrice"?val:arr[i].unitPrice)||0);
      return arr;
    });
  };

  const taxRate   = form.purchaseTax==="GST 5%"?0.05:form.purchaseTax==="GST 12%"?0.12:form.purchaseTax==="GST 18%"?0.18:0;
  const subTotal  = products.reduce((s,p)=>s+Number(p.subtotal),0);
  const taxAmt    = subTotal*taxRate;
  const totalAmt  = subTotal+taxAmt;

  const handleSubmit = () => {
    if(!form.supplier){showToast("Please select a supplier.","error");return;}
    if(!form.location){showToast("Please select a business location.","error");return;}
    if(products.length===0){showToast("Please add at least one product.","error");return;}
    const record = {
      date:new Date().toLocaleDateString("en-IN"),
      refNo:form.refNo||`PR-${Date.now().toString().slice(-4)}`,
      parentPurchase:form.parentPurchase||"—",
      location:form.location,supplier:form.supplier,
      paymentStatus:"Due",
      grandTotal:`₹${totalAmt.toLocaleString("en-IN",{minimumFractionDigits:2})}`,
      paymentDue:`₹${totalAmt.toFixed(2)}`,
    };
    console.log("✅ Purchase Return Submitted:",record,"\nProducts:",products);
    showToast("Purchase return submitted!","success");
    setTimeout(()=>onSubmit(record),1200);
  };

  return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:1000}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onCancel} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6b7280"}}>←</button>
        <h2 style={{fontSize:24,fontWeight:700,margin:0}}>Add Purchase Return</h2>
      </div>

      {/* Header Fields */}
      <div style={card}>
        <div style={grid4}>
          <div>
            <label style={lbl}>Supplier:*</label>
            <div style={{display:"flex"}}>
              <span style={iconBox}>👤</span>
              <select value={form.supplier} onChange={e=>set("supplier",e.target.value)} style={{...inp,borderRadius:"0 6px 6px 0"}}>
                <option value="">Please Select</option>
                {SUPPLIERS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Business Location:*</label>
            <select value={form.location} onChange={e=>set("location",e.target.value)} style={inp}>
              <option value="">Please Select</option>
              {LOCATIONS.map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Parent Purchase:</label>
            <select value={form.parentPurchase} onChange={e=>set("parentPurchase",e.target.value)} style={inp}>
              <option value="">Select Purchase</option>
              {PARENT_PURCHASES.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Reference No:</label>
            <input value={form.refNo} onChange={e=>set("refNo",e.target.value)} style={inp} placeholder="Auto-generated"/>
          </div>
        </div>
        <div style={{...grid4,marginTop:16}}>
          <div>
            <label style={lbl}>Date:*</label>
            <div style={{display:"flex"}}>
              <span style={iconBox}>📅</span>
              <input readOnly value={form.date} style={{...inp,borderRadius:"0 6px 6px 0",background:"#f9fafb"}}/>
            </div>
          </div>
          <div style={{gridColumn:"span 3"}}>
            <label style={lbl}>Attach Document:</label>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input readOnly value={docFile?.name||""} style={{...inp,maxWidth:300}} placeholder="No file chosen"/>
              <label style={{...browseBtn,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
                📁 Browse
                <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png" hidden onChange={e=>setDocFile(e.target.files[0])}/>
              </label>
            </div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>Max 5MB · .pdf .csv .zip .doc .docx .jpeg .jpg .png</div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{...card,marginTop:16}}>
        <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>Search Products</h3>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{position:"relative",width:"60%"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af"}}>🔍</span>
            <input value={productSearch} onChange={e=>setProductSearch(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSearch()}
              placeholder="Search Products by name / SKU / barcode"
              style={{...inp,paddingLeft:34}}/>
          </div>
          <button onClick={handleSearch} style={{marginLeft:10,background:"none",border:"none",color:"#3b82f6",fontWeight:700,cursor:"pointer",fontSize:13}}>＋ Add</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
            <thead>
              <tr style={{background:"#f9fafb",borderBottom:"2px solid #e5e7eb"}}>
                {["Product","Quantity","Unit Price","Subtotal",""].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:600,color:"#374151",fontSize:13}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length===0
                ?<tr><td colSpan={5} style={emptyCell}>No products added — search above</td></tr>
                :products.map((p,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={tdS}><span style={{fontWeight:500}}>{p.name}</span></td>
                    <td style={tdS}>
                      <input type="number" defaultValue={1} min={1} style={{width:80,...inp}}
                        onChange={e=>updateProduct(i,"qty",e.target.value)}/>
                    </td>
                    <td style={tdS}>
                      <input type="number" defaultValue={0} min={0} style={{width:100,...inp}}
                        onChange={e=>updateProduct(i,"unitPrice",e.target.value)}/>
                    </td>
                    <td style={tdS}><b style={{color:"#1a5c38"}}>₹{Number(p.subtotal).toFixed(2)}</b></td>
                    <td style={tdS}>
                      <button onClick={()=>setProducts(products.filter((_,idx)=>idx!==i))}
                        style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:4,color:"#dc2626",cursor:"pointer",padding:"4px 10px",fontSize:13}}>🗑️</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:16,flexWrap:"wrap",gap:16}}>
          <div>
            <label style={lbl}>Purchase Tax:</label>
            <select value={form.purchaseTax} onChange={e=>set("purchaseTax",e.target.value)}
              style={{border:"1px solid #d1d5db",borderRadius:6,padding:"9px 32px 9px 12px",fontSize:13,minWidth:200,color:"#374151"}}>
              {["None","GST 5%","GST 12%","GST 18%"].map(t=><option key={t}>{t}</option>)}
            </select>
            {taxAmt>0 && <div style={{fontSize:12,color:"#1a5c38",marginTop:4}}>Tax (+): ₹{taxAmt.toFixed(2)}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,color:"#6b7280"}}>Sub Total: ₹{subTotal.toFixed(2)}</div>
            {taxAmt>0 && <div style={{fontSize:13,color:"#6b7280"}}>Tax: ₹{taxAmt.toFixed(2)}</div>}
            <div style={{fontWeight:700,fontSize:16,color:"#1a5c38",marginTop:4}}>Total Amount: ₹{totalAmt.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:28}}>
        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
        <button onClick={handleSubmit} style={greenBtnLg}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight:8}}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          Submit Return
        </button>
      </div>
    </div>
  );
}

// ── Purchase Return List (default export) ─────────────────────────────────────
export default function PurchaseReturn() {
  const {showToast,ToastEl} = useToast();
  const [view,setView] = useState("list");
  const [returns,setReturns] = useState(SAMPLE_RETURNS);
  const [search,setSearch] = useState("");
  const [showEntries,setShowEntries] = useState(25);
  const [visibleCols,setVisibleCols] = useState(LIST_COLS.map(c=>c.key));
  const [viewData,setViewData] = useState(null);

  const filtered = returns.filter(r=>Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase()));
  const csvHeaders = ["date","refNo","parentPurchase","location","supplier","paymentStatus","grandTotal","paymentDue"];

  const statusBadge = status => {
    const c={Paid:"#1a5c38",Due:"#dc2626",Partial:"#e67e22"}[status]||"#6b7280";
    return <span style={{background:`${c}18`,color:c,border:`1px solid ${c}40`,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>{status}</span>;
  };

  if(view==="add") return (
    <AddPurchaseReturnForm
      onSubmit={r=>{setReturns(p=>[r,...p]);setView("list");showToast("Purchase return added!","success");}}
      onCancel={()=>setView("list")}/>
  );

  if(view==="view" && viewData) return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:860}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={()=>{setView("list");setViewData(null);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6b7280"}}>←</button>
        <h2 style={{fontSize:24,fontWeight:700,margin:0}}>Purchase Return Details</h2>
      </div>
      <div style={card}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 32px"}}>
          {LIST_COLS.map(({key,label})=>(
            <div key={key} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}>
              <span style={{fontWeight:600,color:"#6b7280",fontSize:13}}>{label}</span>
              <span style={{color:"#111",fontSize:13,fontWeight:500}}>
                {key==="paymentStatus" ? statusBadge(viewData[key]) : viewData[key]}
              </span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:24}}>
          <button onClick={()=>{setView("list");setViewData(null);}} style={cancelBtn}>← Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      {ToastEl}
      <h2 style={{fontSize:26,fontWeight:700,marginBottom:16,color:"#111827"}}>Purchase Return</h2>
      <div style={{background:"#fff",borderRadius:8,padding:"14px 16px",marginBottom:16,boxShadow:"0 1px 3px #0001",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <span style={{fontSize:14,color:"#555",fontWeight:500}}>🔽 Filters</span>
        <input type="date" style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13}}/>
        <input type="date" style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13}}/>
        <select style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13}}>
          <option value="">All Suppliers</option>
          {SUPPLIERS.map(s=><option key={s}>{s}</option>)}
        </select>
        <button style={{...greenBtn,padding:"6px 16px",fontSize:13}}>Apply</button>
      </div>
      <div style={{background:"#fff",borderRadius:8,padding:20,boxShadow:"0 1px 4px #0001"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700}}>All Purchase Returns</h3>
          <button onClick={()=>setView("add")} style={addGreenBtn}>＋ Add</button>
        </div>
        <ExportToolbar
          showEntries={showEntries} setShowEntries={setShowEntries}
          search={search} setSearch={setSearch}
          columns={LIST_COLS} visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          onExportCSV={()=>{exportCSV(filtered,csvHeaders,"purchase_returns.csv");showToast("CSV exported!","success");}}
          onExportExcel={()=>{exportExcel(filtered,csvHeaders,"purchase_returns.xls");showToast("Excel exported!","success");}}
          onExportPDF={()=>{exportPDF("Purchase Returns",LIST_COLS,filtered);showToast("PDF opened in new tab.","info");}}
        />
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
            <thead>
              <tr style={{background:"#f9fafb",borderBottom:"2px solid #e5e7eb"}}>
                {LIST_COLS.filter(c=>visibleCols.includes(c.key)).map(c=>(
                  <th key={c.key} style={th}>{c.label}{c.key==="paymentDue"?" ℹ️":""}</th>
                ))}
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0,showEntries).length===0
                ?<tr><td colSpan={LIST_COLS.length+1} style={emptyCell}>No data available in table</td></tr>
                :filtered.slice(0,showEntries).map((r,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    {LIST_COLS.filter(c=>visibleCols.includes(c.key)).map(c=>(
                      <td key={c.key} style={tdS}>
                        {c.key==="paymentStatus" ? statusBadge(r[c.key]) : r[c.key]}
                      </td>
                    ))}
                    <td style={tdS}>
                      <button onClick={()=>{setViewData(r);setView("view");}} style={viewBtnStyle}
                        onMouseEnter={e=>e.currentTarget.style.background="#1d4ed8"}
                        onMouseLeave={e=>e.currentTarget.style.background="#3b82f6"}>👁️ View</button>
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr style={{background:"#f9fafb",fontWeight:700,borderTop:"2px solid #e5e7eb"}}>
                <td colSpan={visibleCols.filter(k=>!["grandTotal","paymentDue"].includes(k)).length} style={{padding:"12px 12px",color:"#374151"}}>Total:</td>
                <td style={{padding:"12px 12px",color:"#1a5c38"}}>
                  ₹{filtered.reduce((s,r)=>s+parseFloat(r.grandTotal?.replace(/[₹,]/g,"")||0),0).toLocaleString("en-IN",{minimumFractionDigits:2})}
                </td>
                <td style={{padding:"12px 12px",color:"#dc2626"}}>
                  ₹{filtered.reduce((s,r)=>s+parseFloat(r.paymentDue?.replace(/[₹,]/g,"")||0),0).toFixed(2)}
                </td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:16,fontSize:13,color:"#6b7280"}}>
          <span>Showing {filtered.length===0?"0 to 0 of 0":`1 to ${Math.min(showEntries,filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{display:"flex",gap:8}}><button style={pgBtn}>← Previous</button><button style={pgBtn}>Next →</button></div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const card     = {background:"#fff",borderRadius:8,padding:20,boxShadow:"0 1px 4px #0001"};
const grid4    = {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16};
const lbl      = {display:"block",fontWeight:600,marginBottom:6,fontSize:13,color:"#374151"};
const inp      = {border:"1px solid #d1d5db",borderRadius:6,padding:"9px 12px",fontSize:13,width:"100%",boxSizing:"border-box",color:"#374151",outline:"none"};
const iconBox  = {padding:"9px 12px",border:"1px solid #d1d5db",borderRight:"none",borderRadius:"6px 0 0 6px",background:"#f9fafb",whiteSpace:"nowrap",fontSize:13};
const browseBtn= {background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"9px 14px",fontSize:13,fontWeight:600};
const th       = {padding:"12px 12px",textAlign:"left",fontWeight:600,color:"#374151",fontSize:13};
const tdS      = {padding:"11px 12px"};
const emptyCell= {textAlign:"center",padding:40,color:"#9ca3af",fontSize:14};
const pgBtn    = {border:"1px solid #d1d5db",background:"#fff",borderRadius:6,padding:"6px 16px",cursor:"pointer",fontSize:13,color:"#374151",fontWeight:500};
const overlayStyle = {position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000};
const modalStyle   = {background:"#fff",borderRadius:12,padding:32,minWidth:300,maxWidth:420,boxShadow:"0 20px 60px #00000025",position:"relative"};
const modalClose   = {position:"absolute",right:16,top:14,background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#9ca3af",lineHeight:1};
const addGreenBtn  = {background:"linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)",color:"#fff",border:"none",borderRadius:8,padding:"10px 22px",fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px #1a5c3840"};
const greenBtn     = {display:"inline-flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)",color:"#fff",border:"none",borderRadius:8,padding:"11px 28px",cursor:"pointer",fontSize:14,fontWeight:600,boxShadow:"0 4px 14px #1a5c3840"};
const greenBtnLg   = {display:"inline-flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)",color:"#fff",border:"none",borderRadius:10,padding:"13px 50px",cursor:"pointer",fontSize:16,fontWeight:700,boxShadow:"0 6px 20px #1a5c3850",letterSpacing:"0.02em"};
const cancelBtn    = {background:"#374151",color:"#fff",border:"none",borderRadius:8,padding:"13px 30px",cursor:"pointer",fontSize:15,fontWeight:700};
const viewBtnStyle = {background:"#3b82f6",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:500,transition:"background 0.15s"};
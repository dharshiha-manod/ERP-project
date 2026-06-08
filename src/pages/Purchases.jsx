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

// ── Export Toolbar — exact match to reference image ────────────────────────────
function ExportToolbar({showEntries,setShowEntries,search,setSearch,onExportCSV,onExportExcel,onExportPDF,columns,visibleCols,setVisibleCols}) {
  const [showColModal,setShowColModal]=useState(false);
  const btns=[
    {label:"Export CSV",  tag:"csv", tagColor:"#1a5c38", bg:"#e8f5ee", border:"#86efac", color:"#1a5c38", fn:onExportCSV,
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>},
    {label:"Export Excel",tag:"xls", tagColor:"#1a5c38", bg:"#e8f5ee", border:"#86efac", color:"#1a5c38", fn:onExportExcel,
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>},
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
const SAMPLE_PURCHASES = [
  {date:"08/06/2026",refNo:"PO-0001",location:"Manodtechnologies (BL0001)",supplier:"Supplier A",purchaseStatus:"Received",paymentStatus:"Paid",grandTotal:"₹15,400.00",paymentDue:"₹0.00",addedBy:"Admin"},
  {date:"07/06/2026",refNo:"PO-0002",location:"Warehouse 2",supplier:"Supplier B",purchaseStatus:"Ordered",paymentStatus:"Due",grandTotal:"₹8,250.00",paymentDue:"₹8,250.00",addedBy:"Admin"},
  {date:"06/06/2026",refNo:"PO-0003",location:"Manodtechnologies (BL0001)",supplier:"Supplier C",purchaseStatus:"Pending",paymentStatus:"Partial",grandTotal:"₹22,100.00",paymentDue:"₹11,050.00",addedBy:"Admin"},
  {date:"05/06/2026",refNo:"PO-0004",location:"Warehouse 2",supplier:"Supplier A",purchaseStatus:"Received",paymentStatus:"Paid",grandTotal:"₹5,600.00",paymentDue:"₹0.00",addedBy:"Admin"},
  {date:"04/06/2026",refNo:"PO-0005",location:"Manodtechnologies (BL0001)",supplier:"Supplier B",purchaseStatus:"Ordered",paymentStatus:"Due",grandTotal:"₹33,900.00",paymentDue:"₹33,900.00",addedBy:"Admin"},
];

const SUPPLIERS  = ["Supplier A","Supplier B","Supplier C","Supplier D"];
const LOCATIONS  = ["Manodtechnologies (BL0001)","Warehouse 2","Warehouse 3"];
const STATUSES   = ["Ordered","Pending","Received"];
const PAY_STATUS = ["Due","Partial","Paid"];
const PAYMENT_METHODS = ["Cash","Card","Bank Transfer","Cheque","UPI"];
const PRODUCTS_LIST = ["Masala Chai Blend","Whole Wheat Bread","Tomato Ketchup","Mango Pickle","Coconut Oil","Herbal Soap Bar","Turmeric Powder","Cumin Seeds Mix"];

const LIST_COLS = [
  {key:"date",label:"Date"},{key:"refNo",label:"Reference No"},
  {key:"location",label:"Location"},{key:"supplier",label:"Supplier"},
  {key:"purchaseStatus",label:"Purchase Status"},{key:"paymentStatus",label:"Payment Status"},
  {key:"grandTotal",label:"Grand Total"},{key:"paymentDue",label:"Payment Due"},
  {key:"addedBy",label:"Added By"},
];

// ── Add Purchase Page ─────────────────────────────────────────────────────────
export function AddPurchasePage({onSave,onCancel}) {
  const {showToast,ToastEl} = useToast();
  const [form,setForm] = useState({
    supplier:"",refNo:"",status:"",address:"",
    location:"Manodtechnologies (BL0001)",payTermValue:"",payTermUnit:"",
    discountType:"None",discountAmount:"0",purchaseTax:"None",
    additionalNotes:"",shippingDetails:"",shippingCharges:"0",
    paymentAmount:"0.00",paymentMethod:"Cash",paymentNote:"",
  });
  const [products,setProducts] = useState([]);
  const [productSearch,setProductSearch] = useState("");
  const [docFile,setDocFile] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleAddProduct = () => {
    if(!productSearch.trim()) return;
    setProducts(p=>[...p,{name:productSearch,qty:1,unitCost:0,discount:0,lineTotal:0,margin:0,sellingPrice:0}]);
    setProductSearch("");
  };

  const updateProduct = (i,field,val) => {
    setProducts(prev=>{
      const arr=[...prev];
      arr[i]={...arr[i],[field]:val};
      const qty=Number(field==="qty"?val:arr[i].qty)||0;
      const cost=Number(field==="unitCost"?val:arr[i].unitCost)||0;
      const disc=Number(field==="discount"?val:arr[i].discount)||0;
      arr[i].lineTotal=qty*cost*(1-disc/100);
      return arr;
    });
  };

  const discAmt  = Number(form.discountAmount||0);
  const netTotal = products.reduce((s,p)=>s+Number(p.lineTotal),0);
  const taxRate  = form.purchaseTax==="GST 5%"?0.05:form.purchaseTax==="GST 12%"?0.12:form.purchaseTax==="GST 18%"?0.18:0;
  const taxAmt   = (netTotal-discAmt)*taxRate;
  const shipping = Number(form.shippingCharges||0);
  const purchaseTotal = netTotal-discAmt+taxAmt+shipping;
  const paymentDue = Math.max(0,purchaseTotal-Number(form.paymentAmount||0));

  const handleSave = () => {
    if(!form.supplier){showToast("Please select a supplier.","error");return;}
    if(!form.status){showToast("Please select purchase status.","error");return;}
    if(products.length===0){showToast("Please add at least one product.","error");return;}
    const record = {
      date:new Date().toLocaleDateString("en-IN"),
      refNo:form.refNo||`PO-${Date.now().toString().slice(-4)}`,
      location:form.location,supplier:form.supplier,
      purchaseStatus:form.status,paymentStatus:paymentDue<=0?"Paid":"Due",
      grandTotal:`₹${purchaseTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}`,
      paymentDue:`₹${paymentDue.toFixed(2)}`,addedBy:"Admin",
    };
    console.log("✅ Purchase Saved:",record,"\nProducts:",products,"\nForm:",form);
    showToast("Purchase saved successfully!","success");
    setTimeout(()=>onSave&&onSave(record),1200);
  };

  return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:1100}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onCancel} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6b7280"}}>←</button>
        <h2 style={{fontSize:24,fontWeight:700,margin:0}}>Add Purchase</h2>
      </div>

      {/* Section 1 */}
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
            <label style={lbl}>Reference No: ℹ️</label>
            <input value={form.refNo} onChange={e=>set("refNo",e.target.value)} style={inp} placeholder="Auto-generated if empty"/>
          </div>
          <div>
            <label style={lbl}>Purchase Date:*</label>
            <div style={{display:"flex"}}>
              <span style={iconBox}>📅</span>
              <input readOnly value={new Date().toLocaleString()} style={{...inp,borderRadius:"0 6px 6px 0",background:"#f9fafb"}}/>
            </div>
          </div>
          <div>
            <label style={lbl}>Purchase Status:* ℹ️</label>
            <select value={form.status} onChange={e=>set("status",e.target.value)} style={inp}>
              <option value="">Please Select</option>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{...grid4,marginTop:16}}>
          <div>
            <label style={lbl}>Address:</label>
            <input value={form.address} onChange={e=>set("address",e.target.value)} style={inp} placeholder="Supplier address"/>
          </div>
          <div>
            <label style={lbl}>Business Location:* ℹ️</label>
            <select value={form.location} onChange={e=>set("location",e.target.value)} style={inp}>
              {LOCATIONS.map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Pay term: ℹ️</label>
            <div style={{display:"flex",gap:8}}>
              <input value={form.payTermValue} onChange={e=>set("payTermValue",e.target.value)} placeholder="Days" style={{...inp,width:80}}/>
              <select value={form.payTermUnit} onChange={e=>set("payTermUnit",e.target.value)} style={inp}>
                <option value="">Unit</option>
                <option>Days</option><option>Weeks</option><option>Months</option>
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Attach Document:</label>
            <div style={{display:"flex",gap:8}}>
              <input readOnly value={docFile?.name||""} style={{...inp,flex:1}} placeholder="No file chosen"/>
              <label style={{...browseBtn,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
                📁 Browse
                <input type="file" accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png" hidden onChange={e=>setDocFile(e.target.files[0])}/>
              </label>
            </div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>Max 5MB · .pdf .csv .zip .doc .docx .jpeg .jpg .png</div>
          </div>
        </div>
      </div>

      {/* Section 2: Products */}
      <div style={{...card,marginTop:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <button style={importBtn}>📥 Import Products</button>
          <div style={{position:"relative",flex:1}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af"}}>🔍</span>
            <input value={productSearch} onChange={e=>setProductSearch(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleAddProduct()}
              placeholder="Enter Product name / SKU / Scan barcode"
              style={{...inp,paddingLeft:34}}/>
          </div>
          <button onClick={handleAddProduct} style={{background:"none",border:"none",color:"#3b82f6",fontWeight:700,cursor:"pointer",fontSize:13,whiteSpace:"nowrap"}}>＋ Add product</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"#1a5c38",color:"#fff"}}>
                {["#","Product Name","Qty","Unit Cost","Disc %","Cost (ex disc)","Line Total","Margin %","Selling Price",""].map(h=>(
                  <th key={h} style={{padding:"10px 10px",textAlign:"left",fontWeight:600,fontSize:12,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length===0
                ?<tr><td colSpan={10} style={emptyCell}>No products added — search above to add</td></tr>
                :products.map((p,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={tdS}>{i+1}</td>
                    <td style={tdS}><span style={{fontWeight:500}}>{p.name}</span></td>
                    <td style={tdS}><input type="number" defaultValue={1} min={1} style={{width:60,...inpSm}} onChange={e=>updateProduct(i,"qty",e.target.value)}/></td>
                    <td style={tdS}><input type="number" defaultValue={0} min={0} style={{width:80,...inpSm}} onChange={e=>updateProduct(i,"unitCost",e.target.value)}/></td>
                    <td style={tdS}><input type="number" defaultValue={0} min={0} max={100} style={{width:60,...inpSm}} onChange={e=>updateProduct(i,"discount",e.target.value)}/></td>
                    <td style={tdS}>{(p.unitCost*(1-p.discount/100)||0).toFixed(2)}</td>
                    <td style={tdS}><b>₹{Number(p.lineTotal).toFixed(2)}</b></td>
                    <td style={tdS}><input type="number" defaultValue={0} min={0} style={{width:60,...inpSm}} onChange={e=>updateProduct(i,"margin",e.target.value)}/></td>
                    <td style={tdS}>{(Number(p.unitCost)*(1+Number(p.margin)/100)||0).toFixed(2)}</td>
                    <td style={tdS}>
                      <button onClick={()=>setProducts(products.filter((_,idx)=>idx!==i))}
                        style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:4,color:"#dc2626",cursor:"pointer",padding:"4px 8px",fontSize:13}}>🗑️</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{textAlign:"right",marginTop:14,fontSize:14,color:"#374151"}}>
          <div>Total Items: <b style={{color:"#1a5c38"}}>{products.length}</b></div>
          <div>Net Total: <b style={{color:"#1a5c38"}}>₹{netTotal.toFixed(2)}</b></div>
        </div>
      </div>

      {/* Section 3: Discount / Tax */}
      <div style={{...card,marginTop:16}}>
        <div style={grid3}>
          <div>
            <label style={lbl}>Discount Type:</label>
            <select value={form.discountType} onChange={e=>set("discountType",e.target.value)} style={inp}>
              {["None","Fixed","Percentage"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Discount Amount:</label>
            <input value={form.discountAmount} onChange={e=>set("discountAmount",e.target.value)} style={inp} type="number" min={0}/>
          </div>
          <div style={{textAlign:"right",paddingTop:28}}>
            <span style={{fontWeight:600,color:"#dc2626"}}>Discount: (−) ₹{discAmt.toFixed(2)}</span>
          </div>
        </div>
        <div style={{...grid3,marginTop:16}}>
          <div>
            <label style={lbl}>Purchase Tax:</label>
            <select value={form.purchaseTax} onChange={e=>set("purchaseTax",e.target.value)} style={inp}>
              {["None","GST 5%","GST 12%","GST 18%"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div/>
          <div style={{textAlign:"right",paddingTop:28}}>
            <span style={{fontWeight:600,color:"#1a5c38"}}>Tax: (+) ₹{taxAmt.toFixed(2)}</span>
          </div>
        </div>
        <div style={{marginTop:16}}>
          <label style={lbl}>Additional Notes</label>
          <textarea value={form.additionalNotes} onChange={e=>set("additionalNotes",e.target.value)} rows={3} style={{...inp,resize:"vertical"}} placeholder="Any notes for this purchase..."/>
        </div>
      </div>

      {/* Section 4: Shipping */}
      <div style={{...card,marginTop:16}}>
        <div style={{display:"flex",gap:24}}>
          <div style={{flex:1}}>
            <label style={lbl}>Shipping Details:</label>
            <input value={form.shippingDetails} onChange={e=>set("shippingDetails",e.target.value)} style={inp} placeholder="Carrier, tracking no., etc."/>
          </div>
          <div style={{flex:1}}>
            <label style={lbl}>(+) Additional Shipping Charges:</label>
            <input value={form.shippingCharges} onChange={e=>set("shippingCharges",e.target.value)} style={inp} type="number" min={0}/>
          </div>
        </div>
        <div style={{marginTop:16}}>
          <button style={{background:"linear-gradient(135deg,#7c3aed,#6c47ff)",color:"#fff",border:"none",borderRadius:6,padding:"9px 20px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px #6c47ff30"}}>
            ＋ Add Additional Expenses ▾
          </button>
        </div>
        <div style={{textAlign:"right",marginTop:16,fontWeight:700,fontSize:15,color:"#1a5c38"}}>Purchase Total: ₹{purchaseTotal.toFixed(2)}</div>
      </div>

      {/* Section 5: Payment */}
      <div style={{...card,marginTop:16}}>
        <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:700}}>Add Payment</h3>
        <div style={{fontSize:13,color:"#6b7280",marginBottom:12}}>Advance Balance: ₹0.00</div>
        <div style={grid2}>
          <div>
            <label style={lbl}>Amount:*</label>
            <div style={{display:"flex"}}>
              <span style={iconBox}>₹</span>
              <input value={form.paymentAmount} onChange={e=>set("paymentAmount",e.target.value)} style={{...inp,borderRadius:"0 6px 6px 0"}} type="number" min={0}/>
            </div>
          </div>
          <div>
            <label style={lbl}>Paid on:*</label>
            <div style={{display:"flex"}}>
              <span style={iconBox}>📅</span>
              <input readOnly value={new Date().toLocaleString()} style={{...inp,borderRadius:"0 6px 6px 0",background:"#f9fafb"}}/>
            </div>
          </div>
        </div>
        <div style={{marginTop:16}}>
          <label style={lbl}>Payment Method:*</label>
          <div style={{display:"flex"}}>
            <span style={iconBox}>💳</span>
            <select value={form.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)} style={{...inp,borderRadius:"0 6px 6px 0"}}>
              {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginTop:16}}>
          <label style={lbl}>Payment Note:</label>
          <textarea value={form.paymentNote} onChange={e=>set("paymentNote",e.target.value)} rows={3} style={{...inp,resize:"vertical"}} placeholder="Optional payment note..."/>
        </div>
        <hr style={{border:"none",borderTop:"1px solid #e5e7eb",margin:"20px 0"}}/>
        <div style={{textAlign:"right",fontWeight:700,fontSize:15,marginBottom:20,color:paymentDue>0?"#dc2626":"#1a5c38"}}>
          Payment Due: ₹{paymentDue.toFixed(2)}
        </div>
        <div style={{display:"flex",justifyContent:"center"}}>
          <button onClick={handleSave} style={greenBtnLg}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight:8}}>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Save Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Purchases List (default export) ───────────────────────────────────────────
export default function Purchases() {
  const {showToast,ToastEl} = useToast();
  const [view,setView] = useState("list"); // "list" | "add" | "view"
  const [purchases,setPurchases] = useState(SAMPLE_PURCHASES);
  const [search,setSearch] = useState("");
  const [showEntries,setShowEntries] = useState(25);
  const [visibleCols,setVisibleCols] = useState(LIST_COLS.map(c=>c.key));
  const [viewData,setViewData] = useState(null);

  const filtered = purchases.filter(p=>Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase()));
  const csvHeaders = ["date","refNo","location","supplier","purchaseStatus","paymentStatus","grandTotal","paymentDue","addedBy"];

  const statusBadge = (status,type) => {
    const colors = {
      Received:"#1a5c38",Ordered:"#3b82f6",Pending:"#e67e22",
      Paid:"#1a5c38",Due:"#dc2626",Partial:"#e67e22",
    };
    const c=colors[status]||"#6b7280";
    return <span style={{background:`${c}18`,color:c,border:`1px solid ${c}40`,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>{status}</span>;
  };

  if(view==="add") return (
    <AddPurchasePage
      onSave={record=>{setPurchases(p=>[record,...p]);setView("list");showToast("Purchase added successfully!","success");}}
      onCancel={()=>setView("list")}/>
  );

  if(view==="view" && viewData) return (
    <div style={{fontFamily:"'Segoe UI',-apple-system,sans-serif",maxWidth:900}}>
      {ToastEl}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={()=>{setView("list");setViewData(null);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6b7280"}}>←</button>
        <h2 style={{fontSize:24,fontWeight:700,margin:0}}>Purchase Details</h2>
      </div>
      <div style={card}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 32px"}}>
          {LIST_COLS.map(({key,label})=>(
            <div key={key} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}>
              <span style={{fontWeight:600,color:"#6b7280",fontSize:13}}>{label}</span>
              <span style={{color:"#111",fontSize:13,fontWeight:500}}>{viewData[key]}</span>
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
      <h2 style={{fontSize:26,fontWeight:700,marginBottom:16,color:"#111827"}}>Purchases</h2>
      <div style={{background:"#fff",borderRadius:8,padding:"14px 16px",marginBottom:16,boxShadow:"0 1px 3px #0001",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <span style={{fontSize:14,color:"#555",fontWeight:500}}>🔽 Filters</span>
        <input type="date" style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13}}/>
        <input type="date" style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13}}/>
        <select style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13}}>
          <option value="">All Suppliers</option>
          {SUPPLIERS.map(s=><option key={s}>{s}</option>)}
        </select>
        <select style={{border:"1px solid #d1d5db",borderRadius:6,padding:"5px 10px",fontSize:13}}>
          <option value="">All Statuses</option>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <button style={{...greenBtn,padding:"6px 16px",fontSize:13}}>Apply</button>
      </div>
      <div style={{background:"#fff",borderRadius:8,padding:20,boxShadow:"0 1px 4px #0001"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700}}>All Purchases</h3>
          <button onClick={()=>setView("add")} style={addGreenBtn}>＋ Add</button>
        </div>
        <ExportToolbar
          showEntries={showEntries} setShowEntries={setShowEntries}
          search={search} setSearch={setSearch}
          columns={LIST_COLS} visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          onExportCSV={()=>{exportCSV(filtered,csvHeaders,"purchases.csv");showToast("CSV exported!","success");}}
          onExportExcel={()=>{exportExcel(filtered,csvHeaders,"purchases.xls");showToast("Excel exported!","success");}}
          onExportPDF={()=>{exportPDF("Purchases",LIST_COLS,filtered);showToast("PDF opened in new tab.","info");}}
        />
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
            <thead>
              <tr style={{background:"#f9fafb",borderBottom:"2px solid #e5e7eb"}}>
                <th style={th}>Action</th>
                {LIST_COLS.filter(c=>visibleCols.includes(c.key)).map(c=>(
                  <th key={c.key} style={th}>{c.label}{c.key==="paymentDue"?" ℹ️":""}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0,showEntries).length===0
                ?<tr><td colSpan={LIST_COLS.length+1} style={emptyCell}>No data available in table</td></tr>
                :filtered.slice(0,showEntries).map((p,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={tdS}>
                      <button onClick={()=>{setViewData(p);setView("view");}} style={viewBtnStyle}
                        onMouseEnter={e=>e.currentTarget.style.background="#1d4ed8"}
                        onMouseLeave={e=>e.currentTarget.style.background="#3b82f6"}>👁️ View</button>
                    </td>
                    {LIST_COLS.filter(c=>visibleCols.includes(c.key)).map(c=>(
                      <td key={c.key} style={tdS}>
                        {c.key==="purchaseStatus"||c.key==="paymentStatus" ? statusBadge(p[c.key],c.key) : p[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr style={{background:"#f9fafb",fontWeight:700,borderTop:"2px solid #e5e7eb"}}>
                <td colSpan={visibleCols.length>4?visibleCols.length-1:4} style={{padding:"12px 12px",color:"#374151"}}>Total:</td>
                <td style={{padding:"12px 12px",color:"#1a5c38"}}>
                  ₹{filtered.reduce((s,p)=>s+parseFloat(p.grandTotal?.replace(/[₹,]/g,"")||0),0).toLocaleString("en-IN",{minimumFractionDigits:2})}
                </td>
                <td colSpan={2} style={{padding:"12px 12px",fontSize:12,color:"#6b7280"}}>
                  Due — ₹{filtered.reduce((s,p)=>s+parseFloat(p.paymentDue?.replace(/[₹,]/g,"")||0),0).toFixed(2)}
                </td>
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
const grid3    = {display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16};
const grid2    = {display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16};
const lbl      = {display:"block",fontWeight:600,marginBottom:6,fontSize:13,color:"#374151"};
const inp      = {border:"1px solid #d1d5db",borderRadius:6,padding:"9px 12px",fontSize:13,width:"100%",boxSizing:"border-box",color:"#374151",outline:"none"};
const inpSm    = {border:"1px solid #d1d5db",borderRadius:6,padding:"6px 8px",fontSize:12,boxSizing:"border-box"};
const iconBox  = {padding:"9px 12px",border:"1px solid #d1d5db",borderRight:"none",borderRadius:"6px 0 0 6px",background:"#f9fafb",whiteSpace:"nowrap",fontSize:13};
const browseBtn= {background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"9px 14px",fontSize:13,fontWeight:600};
const importBtn= {background:"linear-gradient(135deg,#7c3aed,#6c47ff)",color:"#fff",border:"none",borderRadius:6,padding:"9px 16px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px #6c47ff30"};
const th       = {padding:"12px 12px",textAlign:"left",fontWeight:600,color:"#374151",fontSize:13};
const tdS      = {padding:"11px 12px"};
const emptyCell= {textAlign:"center",padding:40,color:"#9ca3af",fontSize:14};
const pgBtn    = {border:"1px solid #d1d5db",background:"#fff",borderRadius:6,padding:"6px 16px",cursor:"pointer",fontSize:13,color:"#374151",fontWeight:500};
const overlayStyle = {position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000};
const modalStyle   = {background:"#fff",borderRadius:12,padding:32,minWidth:300,maxWidth:420,boxShadow:"0 20px 60px #00000025",position:"relative"};
const modalClose   = {position:"absolute",right:16,top:14,background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#9ca3af",lineHeight:1};
// Green buttons — matching reference image exactly
const addGreenBtn  = {background:"linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)",color:"#fff",border:"none",borderRadius:8,padding:"10px 22px",fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px #1a5c3840"};
const greenBtn     = {display:"inline-flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)",color:"#fff",border:"none",borderRadius:8,padding:"11px 28px",cursor:"pointer",fontSize:14,fontWeight:600,boxShadow:"0 4px 14px #1a5c3840"};
const greenBtnLg   = {display:"inline-flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a5c38 0%,#2d7a50 60%,#22693f 100%)",color:"#fff",border:"none",borderRadius:10,padding:"13px 60px",cursor:"pointer",fontSize:16,fontWeight:700,boxShadow:"0 6px 20px #1a5c3850",letterSpacing:"0.02em"};
const cancelBtn    = {background:"#374151",color:"#fff",border:"none",borderRadius:8,padding:"11px 24px",cursor:"pointer",fontSize:14,fontWeight:600};
const viewBtnStyle = {background:"#3b82f6",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:500,transition:"background 0.15s"};
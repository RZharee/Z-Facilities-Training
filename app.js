const ADMIN_PASSWORD="0816";

const devices=[
{asset:"C224561",serial:"ECG00125",manufacturer:"GE Healthcare",model:"MAC 5500 HD",category:"ECG Machine",department:"Cardiology",status:"In Service"},
{asset:"C224562",serial:"LP150234",manufacturer:"Stryker",model:"LIFEPAK 15",category:"Defibrillator",department:"Emergency",status:"In Service"},
{asset:"C224563",serial:"MX450871",manufacturer:"Philips",model:"IntelliVue MX450",category:"Patient Monitor",department:"ICU",status:"In Service"},
{asset:"C224564",serial:"ALP45210",manufacturer:"BD",model:"Alaris LVP",category:"Infusion Pump",department:"Medical Unit",status:"Out for Repair"},
{asset:"C224565",serial:"N5953392",manufacturer:"Medtronic",model:"Nellcor N-595",category:"Pulse Oximeter",department:"Respiratory",status:"In Service"}
];

const seed=[
{wo:"WR001",asset:"C224562",date:"2026-01-15",type:"PM",biomed:"J. Smith",description:"Annual preventive maintenance",work:"Inspection and performance verification completed.",status:"Closed"},
{wo:"WR002",asset:"C224562",date:"2026-03-20",type:"DM",biomed:"A. Lee",description:"Battery not holding charge",work:"Battery replaced and unit tested.",status:"Closed"}
];

const KEY="zfacilities_workorders_v2";
let workorders=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
let current=null;
const $=id=>document.getElementById(id);
const views=["searchView","deviceView","workorderView"];

function show(id){views.forEach(v=>$(v).classList.toggle("hidden",v!==id));}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function save(){localStorage.setItem(KEY,JSON.stringify(workorders));}
function passwordOK(){
  const entered=prompt("Enter administrator password:");
  if(entered===null) return false;
  if(entered!==ADMIN_PASSWORD){alert("Incorrect password.");return false;}
  return true;
}

function search(){
 const q=$("searchInput").value.trim().toLowerCase();
 $("resultsCard").classList.remove("hidden");
 const hits=!q?[]:devices.filter(d=>Object.values(d).some(v=>String(v).toLowerCase().includes(q)));
 $("results").innerHTML=hits.length?hits.map(d=>`<div class="result" data-asset="${d.asset}"><div class="resultTitle">${esc(d.asset)} — ${esc(d.manufacturer)} ${esc(d.model)}</div><div class="muted">Serial: ${esc(d.serial)} · ${esc(d.category)} · ${esc(d.department)}</div></div>`).join(""):`<div class="empty">No equipment found.</div>`;
 document.querySelectorAll(".result").forEach(r=>r.onclick=()=>openDevice(r.dataset.asset));
}

function openDevice(asset){
 current=devices.find(d=>d.asset===asset); if(!current)return;
 $("deviceTitle").textContent=`${current.manufacturer} ${current.model}`;
 $("deviceStatus").textContent=current.status;
 $("deviceDetails").innerHTML=[
 ["Asset #",current.asset],["Serial #",current.serial],["Manufacturer",current.manufacturer],
 ["Model",current.model],["Equipment Type",current.category],["Department",current.department]
 ].map(x=>`<div><div class="detailLabel">${x[0]}</div><div class="detailValue">${esc(x[1])}</div></div>`).join("");
 renderHistory(); show("deviceView");
}

function renderHistory(){
 const h=workorders.filter(w=>w.asset===current.asset).sort((a,b)=>b.date.localeCompare(a.date));
 $("history").innerHTML=h.length?`<table><thead><tr><th>WO #</th><th>Date</th><th>Type</th><th>Description</th><th>Biomed</th><th>Status</th><th></th></tr></thead><tbody>${h.map(w=>`<tr><td>${esc(w.wo)}</td><td>${esc(w.date)}</td><td>${esc(w.type)}</td><td>${esc(w.description)}</td><td>${esc(w.biomed)}</td><td>${esc(w.status)}</td><td><button class="deleteBtn" data-wo="${esc(w.wo)}">Delete</button></td></tr>`).join("")}</tbody></table>`:`<div class="empty">No service history for this equipment.</div>`;
 document.querySelectorAll(".deleteBtn").forEach(b=>b.onclick=()=>deleteWO(b.dataset.wo));
}

function deleteWO(wo){
 if(!passwordOK()) return;
 if(!confirm(`Delete Work Order ${wo}? This cannot be undone.`)) return;
 workorders=workorders.filter(w=>w.wo!==wo);
 save();
 renderHistory();
}

function nextWO(){
 const max=workorders.reduce((m,w)=>Math.max(m,parseInt(w.wo.replace(/\D/g,""))||0),0);
 return "WR"+String(max+1).padStart(3,"0");
}

function startWO(){
 if(!passwordOK()) return;
 $("woNumber").value=nextWO();
 $("woDate").value=new Date().toISOString().slice(0,10);
 $("woBiomed").value=""; $("woDescription").value=""; $("woWork").value="";
 $("woType").value="PM"; $("woStatus").value="Open";
 $("woDevice").textContent=`${current.asset} · ${current.manufacturer} ${current.model}`;
 show("workorderView");
}

$("searchBtn").onclick=search;
$("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")search();});
$("backSearch").onclick=()=>show("searchView");
$("newWO").onclick=startWO;
$("backDevice").onclick=()=>show("deviceView");
$("cancelWO").onclick=()=>show("deviceView");
$("woForm").onsubmit=e=>{
 e.preventDefault();
 workorders.push({
   wo:$("woNumber").value,asset:current.asset,date:$("woDate").value,type:$("woType").value,
   biomed:$("woBiomed").value.trim(),description:$("woDescription").value.trim(),
   work:$("woWork").value.trim(),status:$("woStatus").value
 });
 save();
 renderHistory(); show("deviceView");
};
show("searchView");

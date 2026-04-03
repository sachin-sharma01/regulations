import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { fetchRegulations, fetchTickets, updateReg, insertTicket, updateTicket, generateITAnalysis } from "./utils/api";
import { fmtDate, daysUntil } from "./utils/format";
import { DEPT_C, IMP, REV_S, TKT_S, ISO_S, SYS_C, MSG_C, MILESTONES, INIT_ISO, PAY_REGS, REGULATORY_CATEGORY } from "./constants";
import Chip from "./components/Chip";
import CopyButton from "./components/CopyButton";
import CodeBlock from "./components/CodeBlock";
import RegCard from "./components/RegCard";
import ITTicketCard from "./components/ITTicketCard";
import IsoCard from "./components/IsoCard";
import PayRegCard from "./components/PayRegCard";
import ChatTab from "./components/ChatTab";
import "./styles/main.css";

// ─── DEADLINE CALENDAR ───────────────────────────────────────────────────────
function getRisk(item) {
  const isApproved = ["approved","approved_it"].includes(item.review_status);
  if (isApproved) return { level:"done",   label:"✓ Done",    bg:"#f0fdf4", text:"#15803d", border:"#86efac", bar:"#22c55e", dot:"#22c55e" };
  if (!item.deadline) return { level:"none",  label:"No date",  bg:"#f8fafc", text:"#94a3b8", border:"#e2e8f0", bar:"#cbd5e1", dot:"#cbd5e1" };
  const days = Math.ceil((new Date(item.deadline) - new Date()) / 86400000);
  if (isNaN(days))    return { level:"none",  label:"No date",  bg:"#f8fafc", text:"#94a3b8", border:"#e2e8f0", bar:"#cbd5e1", dot:"#cbd5e1" };
  if (days < 0)       return { level:"overdue",label:"Overdue", bg:"#fef2f2", text:"#991b1b", border:"#fca5a5", bar:"#ef4444", dot:"#ef4444", days };
  if (days <= 30)     return { level:"critical",label:"Critical",bg:"#fef2f2", text:"#991b1b", border:"#fca5a5", bar:"#ef4444", dot:"#ef4444", days };
  if (days <= 60)     return { level:"atrisk",  label:"At Risk", bg:"#fffbeb", text:"#92400e", border:"#fcd34d", bar:"#f59e0b", dot:"#f59e0b", days };
  if (days <= 90)     return { level:"watch",   label:"Watch",   bg:"#fff7ed", text:"#c2410c", border:"#fed7aa", bar:"#fb923c", dot:"#fb923c", days };
  return                     { level:"ontrack", label:"On Track",bg:"#f0fdf4", text:"#15803d", border:"#86efac", bar:"#22c55e", dot:"#22c55e", days };
}

function DeadlineCalendar({ items }) {
  const [filter, setFilter] = useState("all");
  const withDeadline = items
    .map(i => ({ ...i, _risk: getRisk(i) }))
    .filter(i => i._risk.level !== "none")
    .sort((a, b) => {
      const order = { overdue:0, critical:1, atrisk:2, watch:3, ontrack:4, done:5 };
      return (order[a._risk.level]??6) - (order[b._risk.level]??6);
    });
  const noDate = items.filter(i => getRisk(i).level === "none");
  const filtered = filter === "all" ? withDeadline : withDeadline.filter(i => i._risk.level === filter);
  const counts = {
    overdue:  withDeadline.filter(i=>i._risk.level==="overdue").length,
    critical: withDeadline.filter(i=>i._risk.level==="critical").length,
    atrisk:   withDeadline.filter(i=>i._risk.level==="atrisk").length,
    watch:    withDeadline.filter(i=>i._risk.level==="watch").length,
    ontrack:  withDeadline.filter(i=>i._risk.level==="ontrack").length,
    done:     withDeadline.filter(i=>i._risk.level==="done").length,
  };
  const today = new Date();
  const months = Array.from({length:6}, (_,i) => {
    const d = new Date(today.getFullYear(), today.getMonth()+i, 1);
    return { label: d.toLocaleDateString("sv-SE",{month:"short",year:"numeric"}), year: d.getFullYear(), month: d.getMonth() };
  });
  const totalDays = 180;
  function barProps(deadline) {
    if (!deadline) return null;
    const d = new Date(deadline);
    const diffDays = Math.ceil((d - today) / 86400000);
    const pct = Math.min(Math.max(diffDays / totalDays, 0), 1);
    return { pct, diffDays };
  }
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[
          {key:"all",    label:"All",      value:withDeadline.length, color:"#475569"},
          {key:"overdue",label:"Overdue",  value:counts.overdue,  color:"#ef4444"},
          {key:"critical",label:"Critical",value:counts.critical, color:"#ef4444"},
          {key:"atrisk", label:"At Risk",  value:counts.atrisk,   color:"#f59e0b"},
          {key:"watch",  label:"Watch",    value:counts.watch,    color:"#fb923c"},
          {key:"ontrack",label:"On Track", value:counts.ontrack,  color:"#22c55e"},
          {key:"done",   label:"Done",     value:counts.done,     color:"#22c55e"},
        ].map(s=>(
          <button key={s.key} onClick={()=>setFilter(s.key)}
            style={{background: filter===s.key ? s.color : "#fff", color: filter===s.key ? "#fff" : s.color,
              border:`1.5px solid ${s.color}`, borderRadius:8, padding:"8px 14px", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", minWidth:64, transition:"all 0.15s",
              boxShadow: filter===s.key ? `0 2px 8px ${s.color}40` : "none"}}>
            <span style={{fontSize:18,fontWeight:900,lineHeight:1}}>{s.value}</span>
            <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>{s.label}</span>
          </button>
        ))}
        <div style={{marginLeft:"auto",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:11,color:"#92400e",fontWeight:600}}>{noDate.length} regulations have no deadline set</span>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",marginBottom:16}}>
        <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",width:200,flexShrink:0}}>Regulation</span>
          <div style={{flex:1,display:"flex"}}>
            {months.map((m,i)=>(
              <div key={i} style={{flex:1,fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"center"}}>{m.label}</div>
            ))}
          </div>
          <span style={{fontSize:10,color:"#64748b",width:80,textAlign:"right",flexShrink:0}}>Days left</span>
        </div>
        {filtered.length === 0 && (
          <div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:14}}>No regulations match this filter.</div>
        )}
        {filtered.map((item,idx) => {
          const risk = item._risk;
          const bp = barProps(item.deadline);
          const imp = IMP[item.impact_level] || IMP.low;
          return (
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",
              background: idx%2===0 ? "#fff" : "#fafbfc",
              borderBottom:"1px solid #f1f5f9"}}>
              <div style={{width:200,flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:imp.dot,flexShrink:0}} />
                  <span style={{fontSize:10,background:imp.bg,color:imp.text,border:`1px solid ${imp.border}`,padding:"1px 6px",borderRadius:3,fontWeight:800,textTransform:"uppercase"}}>{imp.label}</span>
                </div>
                <div style={{fontSize:11,fontWeight:600,color:"#0f172a",lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.title}</div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{item.source}</div>
              </div>
              <div style={{flex:1,position:"relative",height:28,display:"flex",alignItems:"center"}}>
                {months.map((_,i)=>(
                  <div key={i} style={{position:"absolute",left:`${(i/months.length)*100}%`,top:0,bottom:0,width:1,background:"#f1f5f9"}} />
                ))}
                <div style={{position:"absolute",left:"0%",top:0,bottom:0,width:2,background:"#3b82f6",zIndex:2}} />
                {bp && (
                  <div style={{position:"absolute",left:0,width:`${bp.pct*100}%`,height:10,background:risk.bar,borderRadius:5,zIndex:1,minWidth:4,
                    boxShadow: risk.level==="critical"||risk.level==="overdue" ? `0 0 6px ${risk.bar}80` : "none"}} />
                )}
                {bp && bp.pct > 0 && bp.pct <= 1 && (
                  <div style={{position:"absolute",left:`calc(${bp.pct*100}% - 6px)`,zIndex:3}}>
                    <div style={{width:12,height:12,borderRadius:"50%",background:risk.dot,border:"2px solid #fff",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}} />
                  </div>
                )}
                {bp && bp.diffDays < 0 && (
                  <div style={{position:"absolute",left:2,zIndex:3,background:"#ef4444",color:"#fff",fontSize:8,fontWeight:800,padding:"1px 5px",borderRadius:3}}>OVERDUE</div>
                )}
              </div>
              <div style={{width:80,flexShrink:0,textAlign:"right"}}>
                <div style={{background:risk.bg,color:risk.text,border:`1px solid ${risk.border}`,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:800,display:"inline-block",whiteSpace:"nowrap"}}>
                  {risk.level==="done" ? "✓ Done" :
                   risk.level==="overdue" ? `${Math.abs(risk.days||0)}d ago` :
                   risk.days != null ? `${risk.days}d` : "—"}
                </div>
                <div style={{fontSize:9,color:"#94a3b8",marginTop:3}}>
                  {item.deadline ? new Date(item.deadline).toLocaleDateString("sv-SE",{day:"numeric",month:"short"}) : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",fontSize:11,color:"#64748b"}}>
        <span style={{fontWeight:700,color:"#475569"}}>Legend:</span>
        {[
          {color:"#3b82f6",label:"Today"},
          {color:"#ef4444",label:"Critical / Overdue (≤30d)"},
          {color:"#f59e0b",label:"At Risk (31-60d)"},
          {color:"#fb923c",label:"Watch (61-90d)"},
          {color:"#22c55e",label:"On Track (>90d)"},
        ].map(l=>(
          <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:l.color}} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAYMENTS TAB ─────────────────────────────────────────────────────────────
function PaymentsTab() {
  const [isoItems,setIsoItems]=useState(INIT_ISO);
  const [fSys,setFSys]=useState("all");
  const [fMsg,setFMsg]=useState("all");
  const [fStat,setFStat]=useState("all");
  const updateItem=(id,fields)=>setIsoItems(prev=>prev.map(i=>i.id===id?{...i,...fields}:i));
  const stats={open:isoItems.filter(i=>i.status==="open").length,inProgress:isoItems.filter(i=>i.status==="in_progress").length,blocked:isoItems.filter(i=>i.status==="blocked").length,done:isoItems.filter(i=>i.status==="done").length};
  const filtered=isoItems.filter(i=>{if(fSys!=="all"&&i.system!==fSys)return false;if(fMsg!=="all"&&i.message_type!==fMsg)return false;if(fStat!=="all"&&i.status!==fStat)return false;return true;});
  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        {[{label:"Open",value:stats.open,color:"#94a3b8"},{label:"In Progress",value:stats.inProgress,color:"#3b82f6"},{label:"Blocked",value:stats.blocked,color:"#ef4444"},{label:"Done",value:stats.done,color:"#22c55e"}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:`3px solid ${s.color}`,borderRadius:8,padding:"10px 18px",textAlign:"center",flex:1,minWidth:80}}>
            <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"16px 20px",marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:14}}>Key Milestones</div>
        {MILESTONES.map(m=>{const days=daysUntil(m.date);const done=days<0;const urgent=days<=90&&!done;return(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:done?"#22c55e":urgent?"#ef4444":"#f59e0b",flexShrink:0}} />
            <div style={{flex:1,fontSize:13,fontWeight:600,color:"#1e293b"}}>{m.label}</div>
            <div style={{fontSize:11,color:"#64748b"}}>{m.source}</div>
            <div style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,background:done?"#f0fdf4":urgent?"#fef2f2":"#fffbeb",color:done?"#15803d":urgent?"#991b1b":"#92400e",border:`1px solid ${done?"#86efac":urgent?"#fca5a5":"#fcd34d"}`,whiteSpace:"nowrap"}}>{done?"Passed":`${days}d`}</div>
            <div style={{fontSize:12,color:"#94a3b8",minWidth:80,textAlign:"right"}}>{fmtDate(m.date)}</div>
          </div>
        );})}
      </div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#64748b",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#3b82f6",display:"inline-block"}} />Regulatory Updates — Payments
        </div>
        {PAY_REGS.map(r=><PayRegCard key={r.id} item={r} />)}
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#64748b",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#f59e0b",display:"inline-block"}} />Implementation Open Items ({filtered.length})
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:4}}>
            {[["all","All Systems"],["Payment engine","Payment"],["API / integrations","API"],["Customer portal","Portal"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFSys(v)} style={{background:fSys===v?"#0f172a":"#f1f5f9",color:fSys===v?"#fff":"#64748b",border:"none",borderRadius:6,padding:"5px 11px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:4}}>
            {[["all","All"],["pain.001","pain.001"],["pain.002","pain.002"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFMsg(v)} style={{background:fMsg===v?"#1d4ed8":"#f1f5f9",color:fMsg===v?"#fff":"#64748b",border:"none",borderRadius:6,padding:"5px 11px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:4}}>
            {[["all","All"],["open","Open"],["in_progress","In Progress"],["blocked","Blocked"],["done","Done"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFStat(v)} style={{background:fStat===v?"#0f172a":"#f1f5f9",color:fStat===v?"#fff":"#64748b",border:"none",borderRadius:6,padding:"5px 11px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
        </div>
        {filtered.map(item=><IsoCard key={item.id} item={item} onUpdate={updateItem} />)}
      </div>
    </div>
  );
}

// ─── IT TICKETS TAB ───────────────────────────────────────────────────────────
function ITTicketsTab({tickets,regulations,onStatusChange,loading}) {
  const [fStatus,setFStatus]=useState("all");
  const getRegulation=(regId)=>regulations.find(r=>r.id===regId);
  const filtered=tickets.filter(t=>fStatus==="all"||t.status===fStatus);
  const stats={open:tickets.filter(t=>t.status==="open").length,inProgress:tickets.filter(t=>t.status==="in_progress").length,done:tickets.filter(t=>t.status==="done").length};
  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        {[{label:"Open",value:stats.open,color:"#94a3b8"},{label:"In Progress",value:stats.inProgress,color:"#3b82f6"},{label:"Done",value:stats.done,color:"#22c55e"}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:`3px solid ${s.color}`,borderRadius:8,padding:"10px 18px",textAlign:"center",flex:1,minWidth:80}}>
            <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["all","All Tickets"],["open","Open"],["in_progress","In Progress"],["done","Done"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFStatus(v)} style={{background:fStatus===v?"#0f172a":"#f1f5f9",color:fStatus===v?"#fff":"#64748b",border:"none",borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {loading&&<div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:14}}>⏳ Loading tickets…</div>}
      {!loading&&filtered.length===0&&(
        <div style={{textAlign:"center",color:"#94a3b8",padding:"60px 0",fontSize:14}}>
          {tickets.length===0?"No IT tickets yet — approve a regulation with 'Needs IT Change' to generate one.":"No tickets match your filter."}
        </div>
      )}
      {!loading&&filtered.map(ticket=>(
        <ITTicketCard key={ticket.id} ticket={ticket} regulation={getRegulation(ticket.regulation_id)} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("regulations");
  const [items,setItems]=useState([]);
  const [tickets,setTickets]=useState([]);
  const [loading,setLoading]=useState(true);
  const [ticketsLoading,setTicketsLoading]=useState(true);
  const [error,setError]=useState(null);
  const [fImpact,setFImpact]=useState("all");
  const [fStatus,setFStatus]=useState("all");
  const [fDept,setFDept]=useState("all");
  const [search,setSearch]=useState("");
  const [lastRefresh,setLastRefresh]=useState(null);
  const [regView,setRegView]=useState("list");


  const load=async()=>{setLoading(true);setError(null);try{setItems(await fetchRegulations());setLastRefresh(new Date());}catch(e){setError(e.message);}setLoading(false);};
const loadTickets = async () => {
  setTicketsLoading(true);
  try {
    const data = await fetchTickets();
    setTickets(data);
  } catch(e) {
    console.error("Tickets error:", e);
    alert("Failed to load tickets: " + e.message);
  } finally {
    setTicketsLoading(false);
  }
};
 
  useEffect(() => {
  (async () => {
    await load();
    await loadTickets();
  })();
}, []);

  const cycleStatus=async(id,cur)=>{const next=REV_S[cur]?.next||"unreviewed";setItems(prev=>prev.map(i=>i.id===id?{...i,review_status:next}:i));await updateReg(id,{review_status:next});};
  const updateNote=async(id,note)=>{setItems(prev=>prev.map(i=>i.id===id?{...i,reviewer_note:note}:i));await updateReg(id,{reviewer_note:note});};
  const handleFieldUpdate = async (id, fields) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...fields } : i));
    await updateReg(id, fields);
  };
  const handleApprove=async(id)=>{setItems(prev=>prev.map(i=>i.id===id?{...i,review_status:"approved"}:i));await updateReg(id,{review_status:"approved"});};

  const handleApproveIT=async(regulation)=>{
    try {
      const analysis=await generateITAnalysis(regulation);
      if(!analysis.requires_it_change){await handleApprove(regulation.id);return;}
      const ticket={
        id:`tkt_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
        regulation_id:regulation.id,
        technical_spec:analysis.technical_spec,
        csharp_code:analysis.csharp_code||null,
        ai_prompt:analysis.ai_prompt||null,
        status:"open",
        created_at:new Date().toISOString(),
      };
      await insertTicket(ticket);
      setTickets(prev=>[ticket,...prev]);
      setItems(prev=>prev.map(i=>i.id===regulation.id?{...i,review_status:"approved_it"}:i));
      await updateReg(regulation.id,{review_status:"approved_it"});
      setTab("it_tickets");
    } catch(e){alert(`Failed to generate IT ticket: ${e.message}`);}
  };

  const handleTicketStatus=async(id,next)=>{setTickets(prev=>prev.map(t=>t.id===id?{...t,status:next}:t));await updateTicket(id,{status:next});};

  const exportToExcel = () => {
    const rows = items.map(item => ({
      "Regulation Name":              item.title || "",
      "Regulatory category":          item.category || "",
      "Into force Date":              item.deadline || "",
      "Status":                       item.review_status === "approved" || item.review_status === "approved_it"
                                        ? "Approved" : item.review_status === "in_progress"
                                        ? "In Progress" : "Monitoring",
      "Assessed impact - Effort":     item.effort_level || "",
      "Assessed impact - When in place": item.impact_when_in_place || "",
      "Comment":                      item.reviewer_note || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 60 },
      { wch: 20 },
      { wch: 18 },
      { wch: 15 },
      { wch: 35 },
      { wch: 30 },
      { wch: 22 },
      { wch: 25 },
      { wch: 50 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Regulations");
    XLSX.writeFile(wb, `bluestep_regulations_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const allDepts=[...new Set(items.flatMap(i=>i.affected_departments||[]))].sort();
  const filtered=items.filter(item=>{
    if(fImpact!=="all"&&item.impact_level!==fImpact)return false;
    if(fStatus!=="all"&&item.review_status!==fStatus)return false;
    if(fDept!=="all"&&!item.affected_departments?.includes(fDept))return false;
    if(search){const q=search.toLowerCase();return item.title?.toLowerCase().includes(q)||item.summary_sv?.toLowerCase().includes(q)||item.source?.toLowerCase().includes(q);}
    return true;
  });
  const stats={total:items.length,high:items.filter(i=>i.impact_level==="high").length,unreviewed:items.filter(i=>!["approved","approved_it"].includes(i.review_status)).length,itOpen:tickets.filter(t=>t.status==="open").length};
  const TABS=[{id:"regulations",label:"📋 Regulations",badge:stats.unreviewed>0?stats.unreviewed:null},{id:"it_tickets",label:"⚙️ IT Tickets",badge:stats.itOpen>0?stats.itOpen:null},{id:"payments",label:"💳 Payments & ISO 20022",badge:null},{id:"chat",label:"💬 Ask AI",badge:null}];

  return (
    <main style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Segoe UI', system-ui, sans-serif"}}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header style={{background:"linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",color:"#fff",padding:"0 32px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 0 16px",flexWrap:"wrap",gap:20}}>
            <div>
              <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#64748b",marginBottom:6}}>Swedish Mortgage Bank</div>
              <h1 style={{margin:0,fontSize:24,fontWeight:800,letterSpacing:"-0.03em"}}>Regulatory Intelligence</h1>
              <p style={{margin:"4px 0 0",fontSize:12,color:"#64748b"}}>Live from Supabase · {lastRefresh?`Updated ${lastRefresh.toLocaleTimeString("sv-SE")}`:"Loading…"}</p>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {[{label:"Total",value:stats.total,color:"#60a5fa"},{label:"To Review",value:stats.unreviewed,color:"#fbbf24"},{label:"IT Open",value:stats.itOpen,color:"#c084fc"},{label:"High Impact",value:stats.high,color:"#f87171"}].map(s=>(
  <div key={s.label} style={{background:"rgba(255,255,255,0.12)",border:`1px solid ${s.color}40`,borderTop:`3px solid ${s.color}`,borderRadius:8,padding:"10px 18px",textAlign:"center",minWidth:80}}>
    <div style={{fontSize:22,fontWeight:900,color:"#ffffff",letterSpacing:"-0.02em"}}>{s.value}</div>
    <div style={{fontSize:10,color:"#cbd5e1",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:2,fontWeight:600}}>{s.label}</div>
  </div>
))}
              <button onClick={()=>{load();loadTickets();}} disabled={loading} style={{background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"10px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{loading?"⏳":"↻"}</button>
              <button onClick={exportToExcel} style={{background:"#15803d",color:"#fff",border:"none",borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>↓ Export Excel</button>
            </div>
          </div>
          <nav style={{display:"flex",gap:4}} aria-label="Main navigation">
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} role="tab" aria-selected={tab===t.id} aria-label={`${t.label} tab`} style={{background:tab===t.id?"#fff":"transparent",color:tab===t.id?"#0f172a":"#94a3b8",border:"none",borderRadius:"8px 8px 0 0",padding:"10px 20px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}>
                {t.label}
                {t.badge&&<span style={{background:"#ef4444",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}} aria-label={`${t.badge} items pending`}>{t.badge}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section style={{maxWidth:1000,margin:"0 auto",padding:"24px 32px"}}>
        {tab==="regulations"&&(
          <article>
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",gap:2,background:"#f1f5f9",borderRadius:8,padding:3,flexShrink:0}}>
                <button onClick={()=>setRegView("list")} style={{background:regView==="list"?"#fff":"transparent",color:regView==="list"?"#0f172a":"#64748b",border:"none",borderRadius:6,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:regView==="list"?"0 1px 3px rgba(0,0,0,0.1)":"none",transition:"all 0.15s"}}>
                  ☰ List
                </button>
                <button onClick={()=>setRegView("calendar")} style={{background:regView==="calendar"?"#fff":"transparent",color:regView==="calendar"?"#0f172a":"#64748b",border:"none",borderRadius:6,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:regView==="calendar"?"0 1px 3px rgba(0,0,0,0.1)":"none",transition:"all 0.15s"}}>
                  📅 Deadline Calendar
                </button>
              </div>
              {regView==="list"&&<>
                <input type="text" placeholder="🔍  Search regulations…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 14px",fontSize:13,outline:"none",flex:1,minWidth:160,fontFamily:"inherit",background:"#f8fafc",color:"#0f172a"}} />
                <div style={{display:"flex",gap:4}}>
                  {[["all","All Impact"],["high","🔴 High"],["medium","🟡 Medium"],["low","🟢 Low"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setFImpact(v)} style={{background:fImpact===v?"#0f172a":"#f1f5f9",color:fImpact===v?"#fff":"#64748b",border:"none",borderRadius:6,padding:"6px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[["all","All"],["unreviewed","Unreviewed"],["in_progress","In Progress"],["approved","Approved"],["approved_it","IT Created"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setFStatus(v)} style={{background:fStatus===v?"#0f172a":"#f1f5f9",color:fStatus===v?"#fff":"#64748b",border:"none",borderRadius:6,padding:"6px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>
                  ))}
                </div>
                {allDepts.length>0&&<select value={fDept} onChange={e=>setFDept(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"6px 10px",fontSize:12,background:"#f8fafc",color:"#475569",outline:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}><option value="all">All Departments</option>{allDepts.map(d=><option key={d} value={d}>{d}</option>)}</select>}
              </>}
            </div>
            {loading&&<div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:14}}>⏳ Loading from Supabase…</div>}
            {error&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:10,padding:"16px 20px",color:"#991b1b",fontSize:13,marginBottom:20}}><strong>Could not load:</strong> {error}<button onClick={load} style={{marginLeft:12,background:"#991b1b",color:"#fff",border:"none",borderRadius:6,padding:"4px 12px",fontSize:12,cursor:"pointer"}}>Retry</button></div>}
            {!loading&&!error&&regView==="calendar"&&<DeadlineCalendar items={items} />}
            {!loading&&!error&&regView==="list"&&(
              <>
                <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Showing <strong style={{color:"#475569"}}>{filtered.length}</strong> of {items.length} · {stats.unreviewed} awaiting review</div>
                {filtered.length===0
                  ?<div style={{textAlign:"center",color:"#94a3b8",padding:"60px 0",fontSize:14}}>{items.length===0?"No data yet — run the n8n workflow to populate.":"No regulations match your filters."}</div>
                  :filtered.map(item=><RegCard key={item.id} item={item} onStatus={cycleStatus} onNote={updateNote} onFieldUpdate={handleFieldUpdate} onApprove={handleApprove} onApproveIT={handleApproveIT} />)
                }
              </>
            )}
          </article>
        )}
        {tab==="it_tickets"&&<ITTicketsTab tickets={tickets} regulations={items} onStatusChange={handleTicketStatus} loading={ticketsLoading} />}
        {tab==="payments"&&<PaymentsTab />}
        {tab==="chat"&&<ChatTab />}
      </section>

    </main>
  );
}

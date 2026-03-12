import React, { useState } from "react";
import PropTypes from "prop-types";
import CopyButton from "./CopyButton";
import CodeBlock from "./CodeBlock";
import { TKT_S, IMP } from "../constants";
import { fmtDate } from "../utils/format";

function ITTicketCard({ ticket, regulation, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const s = TKT_S[ticket.status] || TKT_S.open;
  const imp = regulation ? (IMP[regulation.impact_level] || IMP.low) : IMP.low;

  const cycleStatus = (e) => {
    e.stopPropagation();
    const order = ["open","in_progress","done"];
    const next = order[(order.indexOf(ticket.status)+1) % order.length];
    onStatusChange(ticket.id, next);
  };

  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderLeft:`4px solid ${s.dot}`,borderRadius:12,marginBottom:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"transform 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>

      <div style={{padding:"16px 20px",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:s.dot,marginTop:5,flexShrink:0}} />
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
              <span style={{background:"#0f172a",color:"#fff",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700}}>⚙️ IT Ticket</span>
              {regulation&&<span style={{background:imp.bg,color:imp.text,border:`1px solid ${imp.border}`,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{imp.label} Impact</span>}
              {regulation&&<span style={{background:"#f1f5f9",color:"#475569",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:600}}>{regulation.source}</span>}
              {regulation?.deadline&&<span style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fca5a5",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>⏱ {regulation.deadline}</span>}
              <span style={{marginLeft:"auto",fontSize:11,color:"#94a3b8"}}>{fmtDate(ticket.created_at)}</span>
            </div>
            <h3 style={{margin:"0 0 8px",fontSize:14.5,fontWeight:700,color:"#0f172a",lineHeight:1.4}}>
              {regulation?.title || `IT Ticket — ${ticket.regulation_id}`}
            </h3>
            <div style={{display:"flex",alignItems:"center",gap:8}} onClick={e=>e.stopPropagation()}>
              <button onClick={cycleStatus} style={{background:s.bg,color:s.text,border:`1px solid ${s.text}25`,padding:"3px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"uppercase"}}>
                {s.label}
              </button>
              <span style={{fontSize:11,color:"#94a3b8"}}>Click to advance status</span>
            </div>
          </div>
          <div style={{color:"#cbd5e1",fontSize:14,marginTop:2}}>{open?"▲":"▼"}</div>
        </div>
      </div>

      {open&&(
        <div style={{borderTop:"1px solid #f1f5f9",background:"#fafbfc",padding:"20px 24px 24px 24px"}}>
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:3,height:14,background:"#0369a1",borderRadius:2}} />
                <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#64748b"}}>Technical Specification</span>
              </div>
              <CopyButton text={ticket.technical_spec} />
            </div>
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"14px 16px",fontSize:13,color:"#1e293b",lineHeight:1.8,whiteSpace:"pre-wrap"}}>
              {ticket.technical_spec || "No specification available."}
            </div>
          </div>

          {ticket.csharp_code&&(
            <CodeBlock title="C# Skeleton Code" content={ticket.csharp_code} lang="C#" accent="#7e22ce" />
          )}

          {ticket.ai_prompt&&(
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:3,height:14,background:"#c2410c",borderRadius:2}} />
                  <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#64748b"}}>AI Coding Prompt</span>
                  <span style={{background:"#fff7ed",color:"#c2410c",padding:"1px 7px",borderRadius:4,fontSize:10,fontWeight:600}}>Paste into Cursor / Copilot</span>
                </div>
                <CopyButton text={ticket.ai_prompt} label="Copy Prompt" />
              </div>
              <div style={{background:"#fff",border:"1px dashed #fed7aa",borderRadius:8,padding:"14px 16px",fontSize:13,color:"#1e293b",lineHeight:1.8,whiteSpace:"pre-wrap",fontStyle:"italic"}}>
                {ticket.ai_prompt}
              </div>
            </div>
          )}

          {regulation&&(
            <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"12px 14px",marginTop:4}}>
              <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:6}}>Linked Regulation</div>
              <div style={{fontSize:13,fontWeight:600,color:"#0f172a",marginBottom:4}}>{regulation.title}</div>
              <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{regulation.summary_sv}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ITTicketCard.propTypes = {
  ticket: PropTypes.shape({
    id: PropTypes.string.isRequired,
    regulation_id: PropTypes.string,
    status: PropTypes.string,
    technical_spec: PropTypes.string,
    csharp_code: PropTypes.string,
    ai_prompt: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  regulation: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    source: PropTypes.string,
    summary_sv: PropTypes.string,
    impact_level: PropTypes.string,
    deadline: PropTypes.string,
  }),
  onStatusChange: PropTypes.func.isRequired,
};

export default ITTicketCard;

import React, { useState } from "react";
import PropTypes from "prop-types";
import Chip from "./Chip";
import { IMP, MSG_C, SYS_C } from "../constants";
import { fmtDate } from "../utils/format";

function PayRegCard({ item }) {
  const [open,setOpen]=useState(false);
  const imp=IMP[item.impact]||IMP.low;
  return (
    <div style={{background:"#fff",border:`1px solid ${imp.border}`,borderLeft:`4px solid ${imp.dot}`,borderRadius:10,marginBottom:10,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:imp.dot,marginTop:6,flexShrink:0}} />
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:6,alignItems:"center"}}>
              <span style={{background:"#0f172a",color:"#fff",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700}}>{item.source}</span>
              {item.message_types.map(m=><Chip key={m} label={m} c={MSG_C[m]} />)}
              {item.systems.map(s=><Chip key={s} label={s} c={SYS_C[s]} />)}
              <span style={{marginLeft:"auto",fontSize:11,color:"#94a3b8"}}>{fmtDate(item.date)}</span>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:4}}>{item.title}</div>
            <p style={{margin:0,fontSize:13,color:"#475569",lineHeight:1.6}}>{item.summary}</p>
          </div>
          <div style={{color:"#cbd5e1",fontSize:13}}>{open?"▲":"▼"}</div>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:"1px solid #f1f5f9",background:"#fafbfc",padding:"14px 18px 16px 36px"}}>
          <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:8}}>Required Actions</div>
          {item.actions.map((a,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:6}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:imp.bg,color:imp.text,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:13,color:"#1e293b",lineHeight:1.6}}>{a}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

PayRegCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    source: PropTypes.string,
    date: PropTypes.string,
    impact: PropTypes.string,
    message_types: PropTypes.arrayOf(PropTypes.string),
    systems: PropTypes.arrayOf(PropTypes.string),
    summary: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default PayRegCard;

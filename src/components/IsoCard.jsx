import React, { useState } from "react";
import PropTypes from "prop-types";
import Chip from "./Chip";
import { ISO_S, IMP, MSG_C, SYS_C } from "../constants";

function IsoCard({ item, onUpdate }) {
  const [open,setOpen]=useState(false);
  const [editOwner,setEditOwner]=useState(false);
  const [ownerText,setOwnerText]=useState(item.owner||"");
  const [editNotes,setEditNotes]=useState(false);
  const [notesText,setNotesText]=useState(item.notes||"");
  const s=ISO_S[item.status]||ISO_S.open;
  const imp=IMP[item.priority]||IMP.low;
  const cycleStatus=()=>{const o=["open","in_progress","blocked","done"];onUpdate(item.id,{status:o[(o.indexOf(item.status)+1)%o.length]});};
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderLeft:`4px solid ${s.dot}`,borderRadius:10,marginBottom:10,overflow:"hidden",transition:"transform 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{padding:"14px 18px",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:s.dot,marginTop:6,flexShrink:0}} />
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:6}}>
              <Chip label={item.message_type} c={MSG_C[item.message_type]} />
              <Chip label={item.system} c={SYS_C[item.system]} />
              <span style={{background:imp.bg,color:imp.text,border:`1px solid ${imp.border}`,padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:800,textTransform:"uppercase"}}>{item.priority}</span>
              <div style={{marginLeft:"auto"}} onClick={e=>e.stopPropagation()}>
                <button onClick={cycleStatus} style={{background:s.bg,color:s.text,border:`1px solid ${s.text}25`,padding:"3px 11px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"uppercase"}}>{s.label}</button>
              </div>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:"#0f172a",lineHeight:1.4,marginBottom:3}}>{item.title}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>Source: {item.source}{item.owner?` · Owner: ${item.owner}`:""}</div>
          </div>
          <div style={{color:"#cbd5e1",fontSize:13}}>{open?"▲":"▼"}</div>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:"1px solid #f1f5f9",background:"#fafbfc",padding:"14px 18px 16px 36px",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:6}}>Owner</div>
            {editOwner?(
              <div style={{display:"flex",gap:8}}>
                <input value={ownerText} onChange={e=>setOwnerText(e.target.value)} placeholder="Name or team…" style={{flex:1,padding:"6px 10px",border:"1px solid #cbd5e1",borderRadius:6,fontSize:13,fontFamily:"inherit",outline:"none"}} />
                <button onClick={()=>{onUpdate(item.id,{owner:ownerText});setEditOwner(false);}} style={{background:"#0f172a",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save</button>
                <button onClick={()=>setEditOwner(false)} style={{background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:6,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>Cancel</button>
              </div>
            ):(
              <div onClick={()=>setEditOwner(true)} style={{padding:"6px 10px",border:"1px dashed #cbd5e1",borderRadius:6,fontSize:13,color:item.owner?"#1e293b":"#94a3b8",cursor:"pointer",background:"#fff"}}>{item.owner||"Click to assign owner…"}</div>
            )}
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:6}}>Notes</div>
            {editNotes?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <textarea value={notesText} onChange={e=>setNotesText(e.target.value)} rows={3} placeholder="Add implementation notes…" style={{width:"100%",padding:"8px 10px",border:"1px solid #cbd5e1",borderRadius:6,fontSize:13,fontFamily:"inherit",resize:"vertical",outline:"none",boxSizing:"border-box"}} />
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{onUpdate(item.id,{notes:notesText});setEditNotes(false);}} style={{background:"#0f172a",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save</button>
                  <button onClick={()=>setEditNotes(false)} style={{background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:6,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>Cancel</button>
                </div>
              </div>
            ):(
              <div onClick={()=>setEditNotes(true)} style={{padding:"6px 10px",border:"1px dashed #cbd5e1",borderRadius:6,fontSize:13,color:item.notes?"#1e293b":"#94a3b8",cursor:"pointer",background:"#fff"}}>{item.notes||"Click to add notes…"}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

IsoCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    system: PropTypes.string,
    message_type: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    owner: PropTypes.string,
    notes: PropTypes.string,
    source: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default IsoCard;

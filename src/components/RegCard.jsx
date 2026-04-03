import React, { useState } from "react";
import PropTypes from "prop-types";
import Chip from "./Chip";
import { IMP, DEPT_C, EFFORT_LEVELS } from "../constants";
import { fmtDate } from "../utils/format";

function RegCard({ item, onNote, onFieldUpdate, onApprove, onApproveIT }) {
  const [open, setOpen] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [noteText, setNoteText] = useState(item?.reviewer_note || "");
  const [saving, setSaving] = useState(false);
  const [generatingIT, setGeneratingIT] = useState(false);

  if (!item) return null;

  const imp = IMP[item.impact_level] || IMP.low;
  const isApproved = ["approved","approved_it"].includes(item.review_status);
  const hasITTicket = item.review_status === "approved_it";

  return (
    <div style={{background:"#fff",border:`1px solid ${imp.border}`,borderLeft:`4px solid ${imp.dot}`,borderRadius:12,marginBottom:12,overflow:"hidden",boxShadow:`0 2px 8px ${imp.glow}`,transition:"transform 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{padding:"16px 20px",cursor:"pointer"}} onClick={()=>setOpen(!open)} role="button" tabIndex={0} aria-expanded={open} aria-label={`${open?"Collapse":"Expand"} regulation: ${item.title}`} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" ") {e.preventDefault();setOpen(!open);}}}
      >
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:imp.dot,marginTop:5,flexShrink:0,boxShadow:`0 0 6px ${imp.dot}`}} />
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
              <span style={{background:imp.bg,color:imp.text,border:`1px solid ${imp.border}`,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase"}}>{imp.label} Impact</span>
              <span style={{background:"#0f172a",color:"#fff",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700}}>{item.source}</span>
              <span style={{fontSize:11,color:"#94a3b8",fontStyle:"italic"}}>{item.category}</span>
              <span style={{marginLeft:"auto",fontSize:11,color:"#94a3b8"}}>{fmtDate(item.processed_at)}</span>
            </div>
            <h3 style={{margin:"0 0 8px",fontSize:14.5,fontWeight:700,color:"#0f172a",lineHeight:1.4}}>{item.title}</h3>
            <p style={{margin:"0 0 10px",fontSize:13,color:"#475569",lineHeight:1.6}}>{item.summary_sv}</p>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {item.affected_departments?.map(d=><Chip key={d} label={d} c={DEPT_C[d]} />)}
              {item.deadline&&<span style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fca5a5",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>⏱ {item.deadline}</span>}
              {hasITTicket&&<span style={{background:"#fdf4ff",color:"#7e22ce",border:"1px solid #e9d5ff",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>⚙️ IT Ticket Created</span>}
              {item.review_status==="approved"&&<span style={{background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>✅ Approved</span>}
            </div>
          </div>
          <div style={{color:"#cbd5e1",fontSize:14,marginTop:2}}>{open?"▲":"▼"}</div>
        </div>
      </div>

      {open&&(
        <div style={{borderTop:"1px solid #f1f5f9",background:"#fafbfc",padding:"16px 20px 20px 42px"}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:6}}>Why Relevant</div>
            <p style={{margin:0,fontSize:13,color:"#334155",lineHeight:1.7,fontStyle:"italic"}}>{item.relevance_reason}</p>
          </div>
          {item.required_actions?.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:8}}>Required Actions</div>
              {item.required_actions.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:6}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:imp.bg,color:imp.text,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:13,color:"#1e293b",lineHeight:1.6}}>{a}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:8}}>Ownership & Assessment</div>
            <div style={{display:"flex",gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:4}}>Assessed Impact – Effort</div>
                <select value={item.effort_level||""} onChange={e=>onFieldUpdate(item.id,{effort_level:e.target.value})} style={{width:"100%",padding:"8px 10px",border:"1px solid #cbd5e1",borderRadius:6,fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer",background:"#ffffff",color:"#1e293b",appearance:"auto",WebkitAppearance:"auto"}}>
                  <option value="" style={{color:"#94a3b8",background:"#ffffff"}}>— select —</option>
                  {EFFORT_LEVELS.map(v=><option key={v} value={v} style={{color:"#1e293b",background:"#ffffff"}}>{v}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:4}}>Assessed Impact – When in Place</div>
                <select value={item.impact_when_in_place||""} onChange={e=>onFieldUpdate(item.id,{impact_when_in_place:e.target.value})} style={{width:"100%",padding:"8px 10px",border:"1px solid #cbd5e1",borderRadius:6,fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer",background:"#ffffff",color:"#1e293b",appearance:"auto",WebkitAppearance:"auto"}}>
                  <option value="" style={{color:"#94a3b8",background:"#ffffff"}}>— select —</option>
                  {EFFORT_LEVELS.map(v=><option key={v} value={v} style={{color:"#1e293b",background:"#ffffff"}}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#94a3b8",marginBottom:8}}>Reviewer Note</div>
            {editNote?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3} placeholder="Add your notes…" style={{width:"100%",padding:"8px 12px",border:"1px solid #cbd5e1",borderRadius:8,fontSize:13,fontFamily:"inherit",resize:"vertical",outline:"none",boxSizing:"border-box"}} />
                <div style={{display:"flex",gap:8}}>
                  <button onClick={async()=>{setSaving(true);await onNote(item.id,noteText);setSaving(false);setEditNote(false);}} disabled={saving} style={{background:"#0f172a",color:"#fff",border:"none",borderRadius:6,padding:"6px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{saving?"Saving…":"Save"}</button>
                  <button onClick={()=>setEditNote(false)} style={{background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:6,padding:"6px 16px",fontSize:12,cursor:"pointer"}}>Cancel</button>
                </div>
              </div>
            ):(
              <div onClick={()=>setEditNote(true)} style={{minHeight:36,padding:"8px 12px",border:"1px dashed #cbd5e1",borderRadius:8,fontSize:13,color:item.reviewer_note?"#1e293b":"#94a3b8",cursor:"pointer",background:"#fff"}}>{item.reviewer_note||"Click to add a note…"}</div>
            )}
          </div>

          {!isApproved&&(
            <div style={{borderTop:"1px solid #e2e8f0",paddingTop:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:"#64748b"}}>Compliance Decision:</span>
              <button onClick={()=>onApprove(item.id)} style={{background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                ✅ Approve — No IT Change
              </button>
              <button onClick={async()=>{setGeneratingIT(true);await onApproveIT(item);setGeneratingIT(false);}} disabled={generatingIT}
                style={{background:generatingIT?"#f8f8f8":"#fdf4ff",color:generatingIT?"#94a3b8":"#7e22ce",border:`1px solid ${generatingIT?"#e2e8f0":"#e9d5ff"}`,borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:generatingIT?"default":"pointer",display:"flex",alignItems:"center",gap:8}}>
                {generatingIT?(
                  <><span style={{display:"inline-block",animation:"spin 1s linear infinite",fontSize:14}}>⏳</span> Generating…</>
                ):"⚙️ Approve + Needs IT Change"}
              </button>
              {generatingIT&&<span style={{fontSize:11,color:"#94a3b8",fontStyle:"italic"}}>Claude is analysing the regulation and writing C# code…</span>}
            </div>
          )}

          {isApproved&&(
            <div style={{borderTop:"1px solid #e2e8f0",paddingTop:16}}>
              <span style={{background: hasITTicket?"#fdf4ff":"#f0fdf4", color: hasITTicket?"#7e22ce":"#15803d", border:`1px solid ${hasITTicket?"#e9d5ff":"#86efac"}`, padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:700}}>
                {hasITTicket?"⚙️ Approved — IT ticket created, see IT Tickets tab":"✅ Approved — No IT change required"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

RegCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    summary_sv: PropTypes.string,
    impact_level: PropTypes.string,
    review_status: PropTypes.string,
    reviewer_note: PropTypes.string,
    affected_departments: PropTypes.arrayOf(PropTypes.string),
    required_actions: PropTypes.arrayOf(PropTypes.string),
    deadline: PropTypes.string,
    processed_at: PropTypes.string,
    source: PropTypes.string,
    category: PropTypes.string,
    relevance_reason: PropTypes.string,
    effort_level: PropTypes.string,
    impact_when_in_place: PropTypes.string,
  }).isRequired,
  onNote: PropTypes.func.isRequired,
  onFieldUpdate: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onApproveIT: PropTypes.func.isRequired,
};

export default RegCard;

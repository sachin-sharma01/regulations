import { useState, useEffect } from "react";

const SUPABASE_URL = "https://pdvmbeokaloiewssnzxn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdm1iZW9rYWxvaWV3c3NuenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjA1OTgsImV4cCI6MjA4ODE5NjU5OH0.cxOmRJLxgbkh2wUfqWHgKgl4vHaNna1knbCeapd84Ko";
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

function tryParse(val, fallback) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || "[]"); } catch { return fallback; }
}

async function fetchRegulations() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/regulations?order=processed_at.desc`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Supabase error ${res.status}`);
  const data = await res.json();
  return data.map(item => ({ ...item, affected_departments: tryParse(item.affected_departments, []), required_actions: tryParse(item.required_actions, []) }));
}

async function fetchTickets() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/it_tickets?order=created_at.desc`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Supabase error ${res.status}`);
  return res.json();
}

async function updateReg(id, fields) {
  await fetch(`${SUPABASE_URL}/rest/v1/regulations?id=eq.${id}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify(fields) });
}

async function insertTicket(ticket) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/it_tickets`, {
    method: "POST", headers: { ...HEADERS, Prefer: "return=representation" }, body: JSON.stringify(ticket),
  });
  if (!res.ok) throw new Error(`Insert ticket failed ${res.status}`);
  return res.json();
}

async function updateTicket(id, fields) {
  await fetch(`${SUPABASE_URL}/rest/v1/it_tickets?id=eq.${id}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify(fields) });
}

async function generateITAnalysis(regulation) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      system: `You are a technical architect at a Swedish mortgage bank. Stack is .NET / C#.
Analyse regulatory changes and produce technical implementation guidance for developers.
Return ONLY a JSON object — no markdown, no extra text:
{
  "requires_it_change": true or false,
  "technical_spec": "Plain English description of exactly what needs to change in the system. Be specific about classes, endpoints, validations, or data model changes needed.",
  "csharp_code": "Realistic C# skeleton code. Include namespace, class, method signatures, inline comments referencing the regulation number and deadline. Should be copy-pasteable as a starting point.",
  "ai_prompt": "A complete, ready-to-paste prompt for a developer to use in Cursor or GitHub Copilot. Include: the tech stack (.NET/C#), the regulation name and requirement, what to implement, which classes/methods to create or modify, and what unit tests to write using xUnit."
}`,
      messages: [{
        role: "user",
        content: `Analyse this regulation and generate IT implementation guidance:

Title: ${regulation.title}
Source: ${regulation.source}
Category: ${regulation.category}
Summary: ${regulation.summary_sv}
Required actions: ${tryParse(regulation.required_actions, []).join(", ")}
Deadline: ${regulation.deadline || "Not specified"}
Impact: ${regulation.impact_level}`
      }]
    })
  });
  if (!response.ok) throw new Error(`Claude API error ${response.status}`);
  const data = await response.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEPT_C = { HR:{bg:"#fff7ed",text:"#c2410c",border:"#fed7aa"}, Compliance:{bg:"#eff6ff",text:"#1d4ed8",border:"#bfdbfe"}, Legal:{bg:"#fdf4ff",text:"#7e22ce",border:"#e9d5ff"}, Risk:{bg:"#fff1f2",text:"#be123c",border:"#fecdd3"}, Finance:{bg:"#f0fdf4",text:"#15803d",border:"#bbf7d0"}, IT:{bg:"#fefce8",text:"#a16207",border:"#fef08a"}, Credit:{bg:"#f0f9ff",text:"#0369a1",border:"#bae6fd"} };
const IMP = { high:{label:"High",bg:"#fef2f2",text:"#991b1b",border:"#fca5a5",dot:"#ef4444",glow:"rgba(239,68,68,0.10)"}, medium:{label:"Medium",bg:"#fffbeb",text:"#92400e",border:"#fcd34d",dot:"#f59e0b",glow:"rgba(245,158,11,0.10)"}, low:{label:"Low",bg:"#f0fdf4",text:"#166534",border:"#86efac",dot:"#22c55e",glow:"rgba(34,197,94,0.08)"}, not_applicable:{label:"N/A",bg:"#f8fafc",text:"#64748b",border:"#e2e8f0",dot:"#94a3b8",glow:"transparent"} };
const REV_S = { unreviewed:{label:"Unreviewed",bg:"#f1f5f9",text:"#64748b",next:"in_progress"}, in_progress:{label:"In Progress",bg:"#eff6ff",text:"#1d4ed8",next:"done"}, done:{label:"✓ Done",bg:"#f0fdf4",text:"#15803d",next:"unreviewed"}, approved:{label:"✓ Approved",bg:"#f0fdf4",text:"#15803d"}, approved_it:{label:"⚙️ IT Ticket Created",bg:"#fdf4ff",text:"#7e22ce"} };
const TKT_S = { open:{label:"Open",bg:"#f1f5f9",text:"#475569",dot:"#94a3b8"}, in_progress:{label:"In Progress",bg:"#eff6ff",text:"#1d4ed8",dot:"#3b82f6"}, done:{label:"✓ Done",bg:"#f0fdf4",text:"#15803d",dot:"#22c55e"} };
const ISO_S = { open:{label:"Open",bg:"#f1f5f9",text:"#475569",dot:"#94a3b8"}, in_progress:{label:"In Progress",bg:"#eff6ff",text:"#1d4ed8",dot:"#3b82f6"}, blocked:{label:"Blocked",bg:"#fef2f2",text:"#991b1b",dot:"#ef4444"}, done:{label:"✓ Done",bg:"#f0fdf4",text:"#15803d",dot:"#22c55e"} };
const SYS_C = { "Payment engine":{bg:"#eff6ff",text:"#1d4ed8",border:"#bfdbfe"}, "API / integrations":{bg:"#fdf4ff",text:"#7e22ce",border:"#e9d5ff"}, "Customer portal":{bg:"#fff7ed",text:"#c2410c",border:"#fed7aa"} };
const MSG_C = { "pain.001":{bg:"#eff6ff",text:"#1d4ed8",border:"#bfdbfe"}, "pain.002":{bg:"#fdf4ff",text:"#7e22ce",border:"#e9d5ff"} };
const MILESTONES = [{id:"m1",label:"pain.001 format sign-off",date:"2026-06-30",source:"Internal"},{id:"m2",label:"pain.002 format sign-off",date:"2026-07-31",source:"Internal"},{id:"m3",label:"End-to-end UAT complete",date:"2026-09-15",source:"Internal"},{id:"m4",label:"Parallel run start",date:"2026-10-01",source:"Bankgirot"},{id:"m5",label:"Bankgirot SEK Batch go-live",date:"2026-11-01",source:"Bankgirot"}];
const INIT_ISO = [{id:"iso-001",title:"Map pain.001 fields to payment engine",system:"Payment engine",message_type:"pain.001",priority:"high",status:"in_progress",owner:"",notes:"",source:"Bankgirot Implementation Guide 2025"},{id:"iso-002",title:"Handle pain.002 status codes in API layer",system:"API / integrations",message_type:"pain.002",priority:"high",status:"open",owner:"",notes:"",source:"Bankgirot Implementation Guide 2025"},{id:"iso-003",title:"Update customer portal to show ISO payment status",system:"Customer portal",message_type:"pain.002",priority:"medium",status:"open",owner:"",notes:"",source:"Internal"},{id:"iso-004",title:"Validate BIC/IBAN format in pain.001 outbound",system:"Payment engine",message_type:"pain.001",priority:"high",status:"open",owner:"",notes:"",source:"ISO 20022 SEK Rulebook"},{id:"iso-005",title:"API integration test with Bankgirot test environment",system:"API / integrations",message_type:"pain.001",priority:"medium",status:"open",owner:"",notes:"",source:"Bankgirot"},{id:"iso-006",title:"Customer portal error message localisation (SV/EN)",system:"Customer portal",message_type:"pain.002",priority:"low",status:"open",owner:"",notes:"",source:"Internal"}];
const PAY_REGS = [{id:"pr1",title:"Bankgirot: Technical Specifications for ISO 20022 SEK Batch v3.1",source:"Bankgirot",date:"2025-10-01",impact:"high",message_types:["pain.001"],systems:["Payment engine","API / integrations"],summary:"Updated spec for SEK credit transfers using pain.001.001.09. Introduces mandatory fields for creditor agent BIC and purpose code for mortgage disbursements.",actions:["Update pain.001 schema validation to v09","Add mandatory BIC field to payment engine","Test with Bankgirot certification environment"]},{id:"pr2",title:"Riksbanken: RIX-INST migration to ISO 20022 phase 2",source:"Riksbanken",date:"2025-11-15",impact:"high",message_types:["pain.002"],systems:["Payment engine","API / integrations","Customer portal"],summary:"Phase 2 requires all participant banks to support pain.002 status reports by Q3 2026.",actions:["Review phase 2 timeline vs internal roadmap","Assign pain.002 owner in payment team","Align with Riksbanken participation desk"]},{id:"pr3",title:"Finance Sweden: Industry guidance on ISO 20022 structured remittance",source:"Finance Sweden",date:"2026-01-20",impact:"medium",message_types:["pain.001"],systems:["Payment engine","Customer portal"],summary:"Recommendation to use structured remittance info in pain.001 for mortgage payments.",actions:["Evaluate structured remittance for mortgage disbursements","Update customer portal payment reference field"]}];

function fmtDate(iso) { if (!iso) return "—"; return new Date(iso).toLocaleDateString("sv-SE",{day:"numeric",month:"short",year:"numeric"}); }
function daysUntil(d) { return Math.ceil((new Date(d)-new Date())/86400000); }
function Chip({label,c}) { const col=c||{bg:"#f1f5f9",text:"#475569",border:"#e2e8f0"}; return <span style={{background:col.bg,color:col.text,border:`1px solid ${col.border}`,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>; }

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{background: copied ? "#f0fdf4" : "#f1f5f9", color: copied ? "#15803d" : "#475569", border: `1px solid ${copied ? "#86efac" : "#e2e8f0"}`, borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer", fontWeight:600, transition:"all 0.15s"}}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}

// ─── CODE BLOCK ───────────────────────────────────────────────────────────────
function CodeBlock({ title, content, lang = "code", accent = "#1d4ed8" }) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:3,height:14,background:accent,borderRadius:2}} />
          <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#64748b"}}>{title}</span>
          <span style={{background:"#f1f5f9",color:"#64748b",padding:"1px 7px",borderRadius:4,fontSize:10,fontWeight:600}}>{lang}</span>
        </div>
        <CopyButton text={content} />
      </div>
      <pre style={{margin:0,background:"#0f172a",color:"#e2e8f0",borderRadius:8,padding:"14px 16px",fontSize:12,lineHeight:1.7,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word",fontFamily:"'Consolas','Monaco',monospace"}}>
        {content}
      </pre>
    </div>
  );
}

// ─── REGULATION CARD ──────────────────────────────────────────────────────────
function RegCard({ item, onNote, onApprove, onApproveIT }) {
  const [open, setOpen] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [noteText, setNoteText] = useState(item.reviewer_note || "");
  const [saving, setSaving] = useState(false);
  const [generatingIT, setGeneratingIT] = useState(false);
  const imp = IMP[item.impact_level] || IMP.low;
  const isApproved = ["approved","approved_it"].includes(item.review_status);
  const hasITTicket = item.review_status === "approved_it";

  return (
    <div style={{background:"#fff",border:`1px solid ${imp.border}`,borderLeft:`4px solid ${imp.dot}`,borderRadius:12,marginBottom:12,overflow:"hidden",boxShadow:`0 2px 8px ${imp.glow}`,transition:"transform 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{padding:"16px 20px",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
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

// ─── IT TICKET CARD ───────────────────────────────────────────────────────────
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

      {/* Header */}
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

      {/* Expanded content */}
      {open&&(
        <div style={{borderTop:"1px solid #f1f5f9",background:"#fafbfc",padding:"20px 24px 24px 24px"}}>

          {/* Technical Spec */}
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

          {/* C# Skeleton Code */}
          {ticket.csharp_code&&(
            <CodeBlock
              title="C# Skeleton Code"
              content={ticket.csharp_code}
              lang="C#"
              accent="#7e22ce"
            />
          )}

          {/* AI Prompt */}
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

          {/* Linked Regulation */}
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

// ─── ISO CARD ─────────────────────────────────────────────────────────────────
function IsoCard({item,onUpdate}) {
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

function PayRegCard({item}) {
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

  const load=async()=>{setLoading(true);setError(null);try{setItems(await fetchRegulations());setLastRefresh(new Date());}catch(e){setError(e.message);}setLoading(false);};
  const loadTickets=async()=>{setTicketsLoading(true);try{setTickets(await fetchTickets());}catch(e){console.error(e);}setTicketsLoading(false);};
 
    useEffect(() => {
    // Avoid calling setState synchronously in effect body
    (async () => {
      await load();
    })();
  }, []);

  const cycleStatus=async(id,cur)=>{const next=REV_S[cur]?.next||"unreviewed";setItems(prev=>prev.map(i=>i.id===id?{...i,review_status:next}:i));await updateReg(id,{review_status:next});};
  const updateNote=async(id,note)=>{setItems(prev=>prev.map(i=>i.id===id?{...i,reviewer_note:note}:i));await updateReg(id,{reviewer_note:note});};
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

  const allDepts=[...new Set(items.flatMap(i=>i.affected_departments||[]))].sort();
  const filtered=items.filter(item=>{
    if(fImpact!=="all"&&item.impact_level!==fImpact)return false;
    if(fStatus!=="all"&&item.review_status!==fStatus)return false;
    if(fDept!=="all"&&!item.affected_departments?.includes(fDept))return false;
    if(search){const q=search.toLowerCase();return item.title?.toLowerCase().includes(q)||item.summary_sv?.toLowerCase().includes(q)||item.source?.toLowerCase().includes(q);}
    return true;
  });
  const stats={total:items.length,high:items.filter(i=>i.impact_level==="high").length,unreviewed:items.filter(i=>!["approved","approved_it"].includes(i.review_status)).length,itOpen:tickets.filter(t=>t.status==="open").length};
  const TABS=[{id:"regulations",label:"📋 Regulations",badge:stats.unreviewed>0?stats.unreviewed:null},{id:"it_tickets",label:"⚙️ IT Tickets",badge:stats.itOpen>0?stats.itOpen:null},{id:"payments",label:"💳 Payments & ISO 20022",badge:null}];

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Segoe UI', system-ui, sans-serif"}}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{background:"linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",color:"#fff",padding:"0 32px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 0 16px",flexWrap:"wrap",gap:20}}>
            <div>
              <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#64748b",marginBottom:6}}>Swedish Mortgage Bank</div>
              <h1 style={{margin:0,fontSize:24,fontWeight:800,letterSpacing:"-0.03em"}}>Regulatory Intelligence</h1>
              <p style={{margin:"4px 0 0",fontSize:12,color:"#64748b"}}>Live from Supabase · {lastRefresh?`Updated ${lastRefresh.toLocaleTimeString("sv-SE")}`:"Loading…"}</p>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {[{label:"Total",value:stats.total,color:"#60a5fa"},{label:"To Review",value:stats.unreviewed,color:"#fbbf24"},{label:"IT Open",value:stats.itOpen,color:"#c084fc"},{label:"High Impact",value:stats.high,color:"#f87171"}].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderTop:`2px solid ${s.color}`,borderRadius:8,padding:"10px 16px",textAlign:"center",minWidth:72}}>
                  <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</div>
                </div>
              ))}
              <button onClick={()=>{load();loadTickets();}} disabled={loading} style={{background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"10px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{loading?"⏳":"↻"}</button>
            </div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?"#fff":"transparent",color:tab===t.id?"#0f172a":"#94a3b8",border:"none",borderRadius:"8px 8px 0 0",padding:"10px 20px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}>
                {t.label}
                {t.badge&&<span style={{background:"#ef4444",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{t.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 32px"}}>
        {tab==="regulations"&&(
          <>
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" placeholder="Search regulations…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 14px",fontSize:13,outline:"none",flex:1,minWidth:160,fontFamily:"inherit"}} />
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
              {allDepts.length>0&&<select value={fDept} onChange={e=>setFDept(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"6px 10px",fontSize:12,background:"#f1f5f9",outline:"none",cursor:"pointer",fontFamily:"inherit"}}><option value="all">All Departments</option>{allDepts.map(d=><option key={d} value={d}>{d}</option>)}</select>}
            </div>
            {loading&&<div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:14}}>⏳ Loading from Supabase…</div>}
            {error&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:10,padding:"16px 20px",color:"#991b1b",fontSize:13,marginBottom:20}}><strong>Could not load:</strong> {error}<button onClick={load} style={{marginLeft:12,background:"#991b1b",color:"#fff",border:"none",borderRadius:6,padding:"4px 12px",fontSize:12,cursor:"pointer"}}>Retry</button></div>}
            {!loading&&!error&&(
              <>
                <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Showing <strong style={{color:"#475569"}}>{filtered.length}</strong> of {items.length} · {stats.unreviewed} awaiting review</div>
                {filtered.length===0
                  ?<div style={{textAlign:"center",color:"#94a3b8",padding:"60px 0",fontSize:14}}>{items.length===0?"No data yet — run the n8n workflow to populate.":"No regulations match your filters."}</div>
                  :filtered.map(item=><RegCard key={item.id} item={item} onStatus={cycleStatus} onNote={updateNote} onApprove={handleApprove} onApproveIT={handleApproveIT} />)
                }
              </>
            )}
          </>
        )}
        {tab==="it_tickets"&&<ITTicketsTab tickets={tickets} regulations={items} onStatusChange={handleTicketStatus} loading={ticketsLoading} />}
        {tab==="payments"&&<PaymentsTab />}
      </div>
    </div>
  );
}

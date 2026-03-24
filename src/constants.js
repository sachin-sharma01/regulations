export const DEPT_C = { HR:{bg:"#fff7ed",text:"#c2410c",border:"#fed7aa"}, Compliance:{bg:"#eff6ff",text:"#1d4ed8",border:"#bfdbfe"}, Legal:{bg:"#fdf4ff",text:"#7e22ce",border:"#e9d5ff"}, Risk:{bg:"#fff1f2",text:"#be123c",border:"#fecdd3"}, Finance:{bg:"#f0fdf4",text:"#15803d",border:"#bbf7d0"}, IT:{bg:"#fefce8",text:"#a16207",border:"#fef08a"}, Credit:{bg:"#f0f9ff",text:"#0369a1",border:"#bae6fd"} };
export const IMP = { high:{label:"High",bg:"#fef2f2",text:"#991b1b",border:"#fca5a5",dot:"#ef4444",glow:"rgba(239,68,68,0.10)"}, medium:{label:"Medium",bg:"#fffbeb",text:"#92400e",border:"#fcd34d",dot:"#f59e0b",glow:"rgba(245,158,11,0.10)"}, low:{label:"Low",bg:"#f0fdf4",text:"#166534",border:"#86efac",dot:"#22c55e",glow:"rgba(34,197,94,0.08)"}, not_applicable:{label:"N/A",bg:"#f8fafc",text:"#64748b",border:"#e2e8f0",dot:"#94a3b8",glow:"transparent"} };
export const REV_S = { unreviewed:{label:"Unreviewed",bg:"#f1f5f9",text:"#64748b",next:"in_progress"}, in_progress:{label:"In Progress",bg:"#eff6ff",text:"#1d4ed8",next:"done"}, done:{label:"✓ Done",bg:"#f0fdf4",text:"#15803d",next:"unreviewed"}, approved:{label:"✓ Approved",bg:"#f0fdf4",text:"#15803d"}, approved_it:{label:"⚙️ IT Ticket Created",bg:"#fdf4ff",text:"#7e22ce"} };
export const TKT_S = { open:{label:"Open",bg:"#f1f5f9",text:"#475569",dot:"#94a3b8"}, in_progress:{label:"In Progress",bg:"#eff6ff",text:"#1d4ed8",dot:"#3b82f6"}, done:{label:"✓ Done",bg:"#f0fdf4",text:"#15803d",dot:"#22c55e"} };
export const ISO_S = { open:{label:"Open",bg:"#f1f5f9",text:"#475569",dot:"#94a3b8"}, in_progress:{label:"In Progress",bg:"#eff6ff",text:"#1d4ed8",dot:"#3b82f6"}, blocked:{label:"Blocked",bg:"#fef2f2",text:"#991b1b",dot:"#ef4444"}, done:{label:"✓ Done",bg:"#f0fdf4",text:"#15803d",dot:"#22c55e"} };
export const SYS_C = { "Payment engine":{bg:"#eff6ff",text:"#1d4ed8",border:"#bfdbfe"}, "API / integrations":{bg:"#fdf4ff",text:"#7e22ce",border:"#e9d5ff"}, "Customer portal":{bg:"#fff7ed",text:"#c2410c",border:"#fed7aa"} };
export const MSG_C = { "pain.001":{bg:"#eff6ff",text:"#1d4ed8",border:"#bfdbfe"}, "pain.002":{bg:"#fdf4ff",text:"#7e22ce",border:"#e9d5ff"} };
export const MILESTONES = [{id:"m1",label:"pain.001 format sign-off",date:"2026-06-30",source:"Internal"},{id:"m2",label:"pain.002 format sign-off",date:"2026-07-31",source:"Internal"},{id:"m3",label:"End-to-end UAT complete",date:"2026-09-15",source:"Internal"},{id:"m4",label:"Parallel run start",date:"2026-10-01",source:"Bankgirot"},{id:"m5",label:"Bankgirot SEK Batch go-live",date:"2026-11-01",source:"Bankgirot"}];
export const INIT_ISO = [{id:"iso-001",title:"Map pain.001 fields to payment engine",system:"Payment engine",message_type:"pain.001",priority:"high",status:"in_progress",owner:"",notes:"",source:"Bankgirot Implementation Guide 2025"},{id:"iso-002",title:"Handle pain.002 status codes in API layer",system:"API / integrations",message_type:"pain.002",priority:"high",status:"open",owner:"",notes:"",source:"Bankgirot Implementation Guide 2025"},{id:"iso-003",title:"Update customer portal to show ISO payment status",system:"Customer portal",message_type:"pain.002",priority:"medium",status:"open",owner:"",notes:"",source:"Internal"},{id:"iso-004",title:"Validate BIC/IBAN format in pain.001 outbound",system:"Payment engine",message_type:"pain.001",priority:"high",status:"open",owner:"",notes:"",source:"ISO 20022 SEK Rulebook"},{id:"iso-005",title:"API integration test with Bankgirot test environment",system:"API / integrations",message_type:"pain.001",priority:"medium",status:"open",owner:"",notes:"",source:"Bankgirot"},{id:"iso-006",title:"Customer portal error message localisation (SV/EN)",system:"Customer portal",message_type:"pain.002",priority:"low",status:"open",owner:"",notes:"",source:"Internal"}];
export const REGULATORY_RESPONSIBLE = [
  "CEO","CFO","Chief HR Officer","Chief Legal Officer",
  "CIO","CISO","CRO",
  "Head of Capital Management",
  "Head of Credit Management and Collection"
];

export const REGULATORY_WATCHER = [
  "Chief Legal Officer","CIO","CISO",
  "CLO + Head of Treasury","Head of Compliance",
  "Head of IR & ESG","Head of Treasury",
  "HR org","Resp. for resolution reporting?"
];

export const REGULATORY_CATEGORY = [
  "AML","Consumer protection","Credit","Credit Risk",
  "Funding","Governance","HR","IT","Market access",
  "Market Risk","NPL","Operational Risk",
  "Sanctions","Stress test","Sustainability"
];

export const EFFORT_LEVELS = ["Low","Medium","High","Pre-assess"];

export const CATEGORY_OWNER_MAP = {
  "IT":                { responsible: "CIO",                                    watcher: "CISO" },
  "Credit":            { responsible: "Head of Credit Management and Collection", watcher: "Head of Compliance" },
  "Credit Risk":       { responsible: "Head of Capital Management",              watcher: "CRO" },
  "Sustainability":    { responsible: "CFO",                                    watcher: "Head of IR & ESG" },
  "Governance":        { responsible: "Chief Legal Officer",                    watcher: "Head of Compliance" },
  "Operational Risk":  { responsible: "CRO",                                    watcher: "Head of Compliance" },
  "Stress test":       { responsible: "CFO",                                    watcher: "Head of IR & ESG" },
  "AML":               { responsible: "Chief Legal Officer",                    watcher: "Head of Compliance" },
  "Sanctions":         { responsible: "Chief Legal Officer",                    watcher: "CISO" },
  "HR":                { responsible: "Chief HR Officer",                       watcher: "HR org" },
  "Funding":           { responsible: "CFO",                                    watcher: "Head of Treasury" },
  "Market access":     { responsible: "Head of Capital Management",             watcher: "CLO + Head of Treasury" },
  "Market Risk":       { responsible: "CRO",                                    watcher: "Head of Capital Management" },
  "NPL":               { responsible: "Head of Credit Management and Collection", watcher: "CRO" },
  "Consumer protection":{ responsible: "Chief Legal Officer",                   watcher: "Head of Compliance" },
};

export const PAY_REGS = [{id:"pr1",title:"Bankgirot: Technical Specifications for ISO 20022 SEK Batch v3.1",source:"Bankgirot",date:"2025-10-01",impact:"high",message_types:["pain.001"],systems:["Payment engine","API / integrations"],summary:"Updated spec for SEK credit transfers using pain.001.001.09. Introduces mandatory fields for creditor agent BIC and purpose code for mortgage disbursements.",actions:["Update pain.001 schema validation to v09","Add mandatory BIC field to payment engine","Test with Bankgirot certification environment"]},{id:"pr2",title:"Riksbanken: RIX-INST migration to ISO 20022 phase 2",source:"Riksbanken",date:"2025-11-15",impact:"high",message_types:["pain.002"],systems:["Payment engine","API / integrations","Customer portal"],summary:"Phase 2 requires all participant banks to support pain.002 status reports by Q3 2026.",actions:["Review phase 2 timeline vs internal roadmap","Assign pain.002 owner in payment team","Align with Riksbanken participation desk"]},{id:"pr3",title:"Finance Sweden: Industry guidance on ISO 20022 structured remittance",source:"Finance Sweden",date:"2026-01-20",impact:"medium",message_types:["pain.001"],systems:["Payment engine","Customer portal"],summary:"Recommendation to use structured remittance info in pain.001 for mortgage payments.",actions:["Evaluate structured remittance for mortgage disbursements","Update customer portal payment reference field"]}];

import React from "react";
import PropTypes from "prop-types";
import CopyButton from "./CopyButton";

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

CodeBlock.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  lang: PropTypes.string,
  accent: PropTypes.string,
};

export default CodeBlock;

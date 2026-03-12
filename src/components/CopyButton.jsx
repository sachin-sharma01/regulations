import React, { useState } from "react";
import PropTypes from "prop-types";

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={copy} 
      aria-label={copied ? "Copied to clipboard" : `${label} content to clipboard`}
      title={copied ? "Copied!" : "Copy to clipboard"}
      style={{background: copied ? "#f0fdf4" : "#f1f5f9", color: copied ? "#15803d" : "#475569", border: `1px solid ${copied ? "#86efac" : "#e2e8f0"}`, borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer", fontWeight:600, transition:"all 0.15s"}}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}

CopyButton.propTypes = {
  text: PropTypes.string,
  label: PropTypes.string,
};

export default CopyButton;

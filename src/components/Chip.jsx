import React from "react";
import PropTypes from "prop-types";

function Chip({label,c}) {
  const col=c||{bg:"#f1f5f9",text:"#475569",border:"#e2e8f0"};
  return <span style={{background:col.bg,color:col.text,border:`1px solid ${col.border}`,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  c: PropTypes.shape({
    bg: PropTypes.string,
    text: PropTypes.string,
    border: PropTypes.string,
  }),
};

export default Chip;

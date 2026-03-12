// Common reusable style objects for consistent UI design

export const cardBase = {
  background: "#fff",
  borderRadius: 12,
  marginBottom: 12,
  overflow: "hidden",
  transition: "transform 0.15s",
};

export const cardHover = {
  onMouseEnter: (e) => (e.currentTarget.style.transform = "translateY(-1px)"),
  onMouseLeave: (e) => (e.currentTarget.style.transform = "translateY(0)"),
};

export const cardHeader = {
  padding: "16px 20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
};

export const cardContent = {
  borderTop: "1px solid #f1f5f9",
  background: "#fafbfc",
  padding: "16px 20px 20px 42px",
};

export const expandButton = {
  color: "#cbd5e1",
  fontSize: 14,
  marginTop: 2,
};

export const sectionTitle = {
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#94a3b8",
  marginBottom: 6,
};

export const badge = (bgColor, textColor, borderColor) => ({
  background: bgColor,
  color: textColor,
  border: `1px solid ${borderColor}`,
  padding: "2px 8px",
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 700,
});

export const button = {
  base: {
    border: "none",
    borderRadius: 6,
    padding: "6px 16px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  primary: {
    background: "#0f172a",
    color: "#fff",
  },
  secondary: {
    background: "#f1f5f9",
    color: "#64748b",
  },
  success: {
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #86efac",
  },
};

export const input = {
  padding: "6px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
};

export const textarea = {
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};

export const text = {
  heading3: {
    margin: "0 0 8px",
    fontSize: 14.5,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.4,
  },
  paragraph: {
    margin: "0 0 10px",
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
  },
  small: {
    fontSize: 11,
    color: "#94a3b8",
  },
};

export const dotIndicator = (color) => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: color,
  marginTop: 5,
  flexShrink: 0,
  boxShadow: `0 0 6px ${color}`,
});

export const container = {
  minHeight: "100vh",
  background: "#f8fafc",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

export const headerGradient = {
  background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
  color: "#fff",
  padding: "0 32px",
};

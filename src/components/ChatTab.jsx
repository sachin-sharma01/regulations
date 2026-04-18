import { useState, useRef, useEffect, useCallback } from "react";

const WEBHOOK_URL = "/api/regulation-search"; // Change this to your n8n webhook URL if needed

const IMPACT_COLORS = {
  high:   { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
  medium: { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" },
  low:    { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
};

function getSimilarityColor(similarity) {
  const val = parseFloat(similarity);
  if (val > 70) return "#22c55e";
  if (val >= 40) return "#f59e0b";
  return "#ef4444";
}

function getLatencyColor(seconds) {
  if (seconds < 2) return "#22c55e";
  if (seconds <= 5) return "#f59e0b";
  return "#ef4444";
}

function SourceCard({ source, highlighted, messageId }) {
  const level = (source.impact_level || "").toLowerCase();
  const colors = IMPACT_COLORS[level] || { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
  const simColor = source.similarity ? getSimilarityColor(source.similarity) : "#64748b";

  return (
    <div
      id={`source-${messageId}-${source.number}`}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: highlighted ? "#eff6ff" : "#fff",
        border: highlighted ? "1px solid #3b82f6" : "1px solid #e2e8f0",
        borderRadius: 8, padding: "8px 12px", fontSize: 12,
        transition: "all 0.3s ease",
      }}
    >
      <span style={{ color: "#1e293b", fontWeight: 600, flex: 1, marginRight: 8 }}>
        <span style={{ color: "#3b82f6", fontWeight: 700, marginRight: 4 }}>
          [{source.number}]
        </span>
        {source.title}
      </span>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {source.similarity && (
          <span style={{ color: simColor, fontSize: 11, fontWeight: 700 }}>
            {source.similarity}
          </span>
        )}
        {source.impact_level && (
          <span style={{
            background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
            borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {source.impact_level} Impact
          </span>
        )}
      </div>
    </div>
  );
}

function CitationText({ text, onCitationClick }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const num = parseInt(match[1], 10);
          return (
            <span
              key={i}
              onClick={() => onCitationClick(num)}
              style={{
                color: "#3b82f6", fontWeight: 700, cursor: "pointer",
                background: "#eff6ff", borderRadius: 3, padding: "0 3px",
                fontSize: "0.9em", transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}
              title={`Jump to source ${num}`}
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function ChatMessage({ msg, messageId }) {
  const isUser = msg.role === "user";
  const [highlightedSource, setHighlightedSource] = useState(null);
  const highlightTimeoutRef = useRef(null);

  const handleCitationClick = useCallback((num) => {
    const el = document.getElementById(`source-${messageId}-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedSource(num);
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => setHighlightedSource(null), 2000);
    }
  }, [messageId]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  const isRefused = msg.refused;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, maxWidth: "85%" }}>
        {!isUser && (
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: isRefused
              ? "linear-gradient(135deg, #92400e 0%, #f59e0b 100%)"
              : "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, marginTop: 2,
          }}>
            {isRefused ? "⚠️" : "🤖"}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{
            background: isUser ? "#0f172a" : isRefused ? "#fffbeb" : "#fff",
            color: isUser ? "#fff" : isRefused ? "#92400e" : "#1e293b",
            border: isUser ? "none" : isRefused ? "1px solid #fcd34d" : "1px solid #e2e8f0",
            borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
            padding: "12px 16px",
            fontSize: 14,
            lineHeight: 1.6,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            whiteSpace: "pre-wrap",
          }}>
            {isUser || isRefused
              ? msg.text
              : <CitationText text={msg.text} onCitationClick={handleCitationClick} />}
          </div>

          {!isUser && msg.latency != null && (
            <div style={{
              marginTop: 6, fontSize: 11, fontWeight: 600,
              color: getLatencyColor(msg.latency),
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span>⏱</span>
              <span>Response time: {msg.latency.toFixed(1)}s</span>
            </div>
          )}

          {!isRefused && msg.sources && msg.sources.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.12em", color: "#94a3b8", marginBottom: 6,
              }}>
                Source Regulations
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {msg.sources.map((src, i) => (
                  <SourceCard
                    key={i}
                    source={src}
                    highlighted={highlightedSource === src.number}
                    messageId={messageId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {isUser && (
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "#e2e8f0", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, marginTop: 2,
          }}>
            👤
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
      }}>
        🤖
      </div>
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: "4px 18px 18px 18px", padding: "14px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
            display: "inline-block",
            animation: `chatDot 1.2s ${delay}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "What are the DORA requirements for financial institutions?",
  "Summarize the key GDPR obligations for mortgage banks.",
  "Which regulations have a high impact level?",
  "What are the upcoming compliance deadlines?",
];

export default function ChatTab() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your Regulatory Intelligence assistant. Ask me anything about the regulations in this system — I'll search the knowledge base and provide relevant answers with sources.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(question) {
    const text = (question || input).trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);

    const startTime = Date.now();
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server responded ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const latency = (Date.now() - startTime) / 1000;
      setMessages(prev => [...prev, {
        role: "assistant",
        text: data.answer || "No answer returned.",
        sources: data.sources || [],
        refused: !!data.refused,
        latency,
      }]);
    } catch (e) {
      setError(e.message);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Sorry, I couldn't reach the regulation search service. Please check that the n8n webhook is active and try again.",
        sources: [],
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", minHeight: 500 }}>
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
        padding: "14px 20px", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>
          🤖
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Regulation AI Assistant</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Ask questions about your regulatory landscape</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
            boxShadow: "0 0 6px #22c55e", display: "inline-block",
          }} />
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Connected</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "8px 4px",
        display: "flex", flexDirection: "column",
      }}>
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} messageId={i} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only show initially) */}
      {messages.length === 1 && !loading && (
        <div style={{ padding: "8px 0 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20,
              padding: "6px 14px", fontSize: 12, color: "#475569", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8,
          padding: "10px 14px", fontSize: 12, color: "#991b1b", marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>Connection error — make sure the n8n webhook is active (click "Execute workflow" on the canvas).</span>
          <button onClick={() => setError(null)} style={{
            background: "none", border: "none", color: "#991b1b", cursor: "pointer",
            fontSize: 16, padding: "0 4px", lineHeight: 1,
          }}>✕</button>
        </div>
      )}

      {/* Input bar */}
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
        padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-end",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Ask about regulations, compliance deadlines, GDPR, DORA…"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{
            flex: 1, border: "none", outline: "none", resize: "none",
            fontSize: 14, fontFamily: "inherit", color: "#0f172a",
            background: "transparent", lineHeight: 1.5, padding: "4px 0",
            minHeight: 28, maxHeight: 120, overflow: "hidden",
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "#e2e8f0" : "#0f172a",
            color: loading || !input.trim() ? "#94a3b8" : "#fff",
            border: "none", borderRadius: 8, width: 38, height: 38,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0, transition: "all 0.15s",
          }}
          aria-label="Send message"
        >
          {loading ? "⏳" : "↑"}
        </button>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#cbd5e1", marginTop: 6 }}>
        Press Enter to send · Shift+Enter for new line
      </div>
    </div>
  );
}

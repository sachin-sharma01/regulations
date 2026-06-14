import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, User } from 'lucide-react';
import { SourceCard } from './SourceCard';
import type { ChatMessage as ChatMessageType } from '@/types';

function getLatencyColor(seconds: number): string {
  if (seconds < 2) return '#22c55e';
  if (seconds <= 5) return '#f59e0b';
  return '#ef4444';
}

function CitationText({ text, onCitationClick }: { text: string; onCitationClick: (n: number) => void }) {
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
              className="text-blue-500 font-bold cursor-pointer bg-blue-50 rounded px-0.5 text-[0.9em] transition-colors hover:bg-blue-100"
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

function ChatMessageItem({ msg, messageId }: { msg: ChatMessageType; messageId: number }) {
  const isUser = msg.role === 'user';
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCitationClick = useCallback((num: number) => {
    const el = document.getElementById(`source-${messageId}-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedSource(num);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setHighlightedSource(null), 2000);
    }
  }, [messageId]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const isRefused = msg.refused;

  return (
    <div className={`flex flex-col mb-5 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-start gap-2.5 max-w-[85%]">
        {!isUser && (
          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${isRefused ? 'bg-amber-100' : 'bg-slate-800'}`}>
            <Bot size={15} strokeWidth={1.75} className={isRefused ? 'text-amber-600' : 'text-white'} />
          </div>
        )}

        <div className="flex-1">
          <div
            className="px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap shadow-sm"
            style={{
              background: isUser ? '#0f172a' : isRefused ? '#fffbeb' : '#fff',
              color: isUser ? '#fff' : isRefused ? '#92400e' : '#1e293b',
              border: isUser ? 'none' : isRefused ? '1px solid #fcd34d' : '1px solid #e2e8f0',
              borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
            }}
          >
            {isUser || isRefused
              ? msg.text
              : <CitationText text={msg.text} onCitationClick={handleCitationClick} />}
          </div>

          {!isUser && msg.latency != null && (
            <div
              className="mt-1.5 text-[11px] font-semibold flex items-center gap-1"
              style={{ color: getLatencyColor(msg.latency) }}
            >
              <span>Response: {msg.latency.toFixed(1)}s</span>
            </div>
          )}

          {!isRefused && msg.sources && msg.sources.length > 0 && (
            <div className="mt-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Source Regulations
              </div>
              <div className="flex flex-col gap-1.5">
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
          <div className="w-8 h-8 rounded-full shrink-0 bg-slate-200 flex items-center justify-center mt-0.5">
            <User size={15} strokeWidth={1.75} className="text-slate-500" />
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-full shrink-0 bg-slate-800 flex items-center justify-center">
        <Bot size={15} strokeWidth={1.75} className="text-white" />
      </div>
      <div className="bg-white border border-border rounded-[4px_18px_18px_18px] px-4 py-3.5 shadow-sm flex gap-1.5 items-center">
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block animate-chat-dot"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}

interface MessageListProps {
  messages: ChatMessageType[];
  loading: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, loading, bottomRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-1 py-2 flex flex-col">
      {messages.map((msg, i) => (
        <ChatMessageItem key={i} msg={msg} messageId={i} />
      ))}
      {loading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

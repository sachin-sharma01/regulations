import { useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'What are the DORA requirements for financial institutions?',
  'Summarize the key GDPR obligations for mortgage banks.',
  'Which regulations have a high impact level?',
  'What are the upcoming compliance deadlines?',
];

interface MessageInputProps {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onSend: (text?: string) => void;
  showSuggestions: boolean;
}

export function MessageInput({
  input, setInput, loading, error, onClearError, onSend, showSuggestions,
}: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = !loading && !!input.trim();

  return (
    <div>
      {/* Suggestions */}
      {showSuggestions && (
        <div className="py-2 pb-3 flex gap-2 flex-wrap">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s)}
              className="bg-white border border-border rounded-full px-3.5 py-1.5 text-[12px] text-slate-500 font-medium cursor-pointer transition-colors hover:bg-slate-50 hover:border-slate-300"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-[12px] text-red-700 mb-2 flex justify-between items-center">
          <span>Connection error — make sure the n8n webhook is active.</span>
          <button onClick={onClearError} className="text-red-600 hover:text-red-800 text-[16px] px-1 leading-none">
            ✕
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white border border-border rounded-xl px-3 py-2.5 flex gap-2.5 items-end shadow-sm">
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Ask about regulations, compliance deadlines, GDPR, DORA…"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 border-none outline-none resize-none text-[14px] text-slate-900 bg-transparent leading-relaxed py-1 min-h-7 max-h-[120px] overflow-hidden placeholder:text-slate-400"
        />
        <button
          onClick={() => onSend()}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
            canSend ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed',
          )}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUp size={16} strokeWidth={2} />
          )}
        </button>
      </div>
      <p className="text-center text-[11px] text-slate-300 mt-1.5">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

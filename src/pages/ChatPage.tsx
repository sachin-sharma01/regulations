import { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { StatusDot } from '@/components/ui/StatusDot';
import { PageHeader } from '@/components/layout/PageHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import type { ChatMessage } from '@/types';

const WEBHOOK_URL = '/api/regulation-search';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  text: "Hi! I'm your Regulatory Intelligence assistant. Ask me anything about the regulations in this system — I'll search the knowledge base and provide relevant answers with sources.",
  sources: [],
};

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(question?: string) {
    const text = (question ?? input).trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text, sources: [] }]);
    setLoading(true);

    const startTime = Date.now();
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server responded ${res.status}: ${errText}`);
      }

      const data = await res.json() as { answer?: string; sources?: ChatMessage['sources']; refused?: boolean };
      const latency = (Date.now() - startTime) / 1000;

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer ?? 'No answer returned.',
        sources: data.sources ?? [],
        refused: !!data.refused,
        latency,
      }]);
    } catch (e) {
      setError((e as Error).message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I could not reach the regulation search service. Please check that the n8n webhook is active and try again.',
        sources: [],
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Ask AI"
        subtitle="RAG-powered regulation search"
        actions={
          <div className="flex items-center gap-2">
            <StatusDot color="green" pulse />
            <span className="text-[11px] text-slate-500 font-medium">Connected</span>
          </div>
        }
      />

      <div className="flex flex-col flex-1 overflow-hidden px-6 py-4">
        {/* Assistant brand bar */}
        <div className="bg-white border border-border rounded-xl px-4 py-3.5 mb-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
            <Bot size={18} strokeWidth={1.75} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-[14px] text-slate-900">Regulation AI Assistant</div>
            <div className="text-[12px] text-slate-500">Ask questions about your regulatory landscape</div>
          </div>
        </div>

        <MessageList messages={messages} loading={loading} bottomRef={bottomRef} />

        <MessageInput
          input={input}
          setInput={setInput}
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
          onSend={sendMessage}
          showSuggestions={messages.length === 1 && !loading}
        />
      </div>
    </>
  );
}

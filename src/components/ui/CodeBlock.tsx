import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  title: string;
  content: string;
  lang?: string;
  accent?: string;
}

export function CodeBlock({ title, content, lang = 'code', accent = '#1d4ed8' }: CodeBlockProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3.5 rounded" style={{ background: accent }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
          <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-semibold">{lang}</span>
        </div>
        <CopyButton text={content} />
      </div>
      <pre className="m-0 bg-slate-900 text-slate-200 rounded-lg p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words font-mono">
        {content}
      </pre>
    </div>
  );
}

import { useState } from 'react';

interface CopyButtonProps {
  text?: string | null;
  label?: string;
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      aria-label={copied ? 'Copied to clipboard' : `${label} content to clipboard`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={[
        'px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors',
        copied
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100',
      ].join(' ')}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

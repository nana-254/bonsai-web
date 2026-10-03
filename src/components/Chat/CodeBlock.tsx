import React, { useState } from 'react';
import { Copy, Check, Play, Terminal, GripVertical } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  onRun?: (code: string, language: string) => void;
  onOpenCanvas?: (code: string, language: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', onRun, onOpenCanvas }) => {
  const [copied, setCopied] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const payload = {
      type: 'code-artifact',
      title: `${(language || 'code').toUpperCase()} Snippet`,
      code,
      language: language || 'text',
      mode: 'code',
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', code);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleRun = async () => {
    if (onRun) {
      onRun(code, language);
      return;
    }

    setIsRunning(true);
    try {
      const res = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setRunOutput(data.output || data.error || 'Execution complete.');
    } catch (err: any) {
      setRunOutput(`Execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`my-3 rounded-xl overflow-hidden border bg-slate-950 font-mono text-xs shadow-lg transition-all group/code ${
        isDragging
          ? 'opacity-60 border-cyan-400 ring-2 ring-cyan-400/50 scale-[0.99]'
          : 'border-slate-800 hover:border-slate-700/80'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 text-slate-400 select-none">
        <div className="flex items-center gap-2">
          {/* Drag Handle Indicator */}
          <div
            className="cursor-grab active:cursor-grabbing p-0.5 text-slate-500 hover:text-cyan-400 transition-colors"
            title="Drag code snippet directly into ChatCanvas workspace"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block"></span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            {language || 'code'}
          </span>
          <span className="text-[10px] text-slate-500 font-sans hidden sm:inline group-hover/code:text-cyan-400/70 transition-colors">
            · Drag to Canvas
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {(language === 'js' || language === 'javascript' || language === 'python' || language === 'sh' || language === 'bash') && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
              title="Execute in 8GB Sandbox"
            >
              {isRunning ? (
                <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
          )}
          {onOpenCanvas && (
            <button
              onClick={() => onOpenCanvas(code, language)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Open in side-by-side ChatCanvas"
            >
              <Terminal className="w-3 h-3" />
              <span>Canvas</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <div className="p-3 overflow-x-auto text-slate-200 bg-slate-950/90 leading-relaxed font-mono select-text">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
      {runOutput && (
        <div className="border-t border-slate-800 bg-slate-900/90 p-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1 text-[11px]">
            <Terminal className="w-3.5 h-3.5" />
            <span>Sandbox Output (8GB Runtime):</span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300 bg-black/40 p-2 rounded border border-slate-800">
            {runOutput}
          </pre>
        </div>
      )}
    </div>
  );
};

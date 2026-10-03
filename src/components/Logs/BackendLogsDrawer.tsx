import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Filter, 
  ChevronDown, 
  Cpu, 
  Activity,
  ArrowDown
} from 'lucide-react';
import { ServerLog } from '../../types';
import { ThroughputMiniChart } from './ThroughputMiniChart';

interface BackendLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ServerLog[];
  onClearLogs: () => void;
}

export const BackendLogsDrawer: React.FC<BackendLogsDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(l => filterLevel === 'ALL' || l.level === filterLevel);

  useEffect(() => {
    if (autoScroll && isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isOpen]);

  const handleCopy = () => {
    const text = filteredLogs
      .map(l => `[${l.timestamp}] [${l.level}] [${l.component}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'ERROR':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'REASONING':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'AGENT':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'SYSTEM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-84 bg-slate-950/95 border-t border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col z-40 font-mono text-xs select-text">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-300 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Backend Telemetry & Execution Stream</span>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {logs.length} events logged
          </span>

          {/* Level Filter Buttons */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {['ALL', 'INFO', 'REASONING', 'AGENT', 'SYSTEM', 'SUCCESS', 'ERROR'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                  filterLevel === lvl
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
              autoScroll ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'
            }`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3 h-3" />
            <span className="hidden md:inline">Auto-scroll</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live D3 Backend Throughput Mini-Chart Strip */}
      <ThroughputMiniChart logsCount={logs.length} />

      {/* Logs Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-[11px] leading-relaxed bg-black/40">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            No logs captured yet
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 hover:bg-slate-900/50 py-0.5 px-1 rounded transition-colors"
            >
              <span className="text-slate-500 shrink-0 select-none">
                [{log.timestamp}]
              </span>

              <span
                className={`px-1.5 py-0.2 rounded border text-[9px] font-bold tracking-wider shrink-0 uppercase ${getLevelColor(
                  log.level
                )}`}
              >
                {log.level}
              </span>

              <span className="text-cyan-400 font-semibold shrink-0">
                [{log.component}]
              </span>

              <span className="text-slate-200 flex-1 whitespace-pre-wrap break-all">
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

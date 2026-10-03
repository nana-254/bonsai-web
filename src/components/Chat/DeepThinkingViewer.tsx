import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Code2, 
  ListTree, 
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DeepThinkingViewerProps {
  thinkingContent: string;
  isThinking?: boolean;
  durationMs?: number;
  totalTokens?: number;
  tps?: number;
}

export const DeepThinkingViewer: React.FC<DeepThinkingViewerProps> = ({
  thinkingContent,
  isThinking = false,
  durationMs,
  totalTokens,
  tps = 38.6,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'raw'>('timeline');
  const [copied, setCopied] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Auto-expand when actively thinking
  useEffect(() => {
    if (isThinking) {
      setIsExpanded(true);
      const timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 0.1);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isThinking]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(thinkingContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse raw thinking content into sequential timeline milestones
  const parseThinkingTimeline = (raw: string) => {
    if (!raw.trim()) return [];

    // Split by common reasoning delimiters like bullet points, numbered steps, or double newlines
    const rawLines = raw
      .split(/\n{2,}|(?<=\.)\s+(?=[A-Z0-9])/g)
      .map((l) => l.trim())
      .filter((l) => l.length > 5);

    if (rawLines.length === 0) {
      return [{ title: 'Cognitive Evaluation', detail: raw, phase: 'Plan' }];
    }

    return rawLines.map((line, idx) => {
      let phase = 'Cognitive Analysis';
      const lower = line.toLowerCase();

      if (lower.includes('search') || lower.includes('google') || lower.includes('retriev') || lower.includes('grounding')) {
        phase = 'Search & Retrieval';
      } else if (lower.includes('code') || lower.includes('python') || lower.includes('calculat') || lower.includes('sandbox')) {
        phase = 'Code / Computation';
      } else if (lower.includes('safety') || lower.includes('refus') || lower.includes('abliterat') || lower.includes('filter')) {
        phase = 'Abliteration Alignment';
      } else if (lower.includes('synthes') || lower.includes('final') || lower.includes('conclud') || lower.includes('answer')) {
        phase = 'Synthesis Plan';
      } else if (idx === 0) {
        phase = 'Problem Formulation';
      }

      // Format clean summary
      const cleanTitle = line.length > 60 ? line.slice(0, 57) + '...' : line;

      return {
        title: cleanTitle,
        detail: line,
        phase,
      };
    });
  };

  const timelineSteps = parseThinkingTimeline(thinkingContent);
  const approxTokens = totalTokens || Math.round(thinkingContent.length / 3.8);
  const formattedDuration = durationMs
    ? (durationMs / 1000).toFixed(1)
    : elapsedSeconds.toFixed(1);

  if (!thinkingContent && !isThinking) return null;

  return (
    <div className="my-3 rounded-xl border border-purple-900/50 bg-gradient-to-b from-purple-950/25 via-slate-950/80 to-purple-950/20 backdrop-blur-md overflow-hidden shadow-lg shadow-purple-950/20 transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-purple-950/40 border-b border-purple-900/40 text-xs font-mono text-purple-200 cursor-pointer hover:bg-purple-950/60 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isThinking
                  ? 'bg-purple-600/30 text-purple-300 ring-2 ring-purple-500/50 animate-pulse'
                  : 'bg-purple-900/50 text-purple-400'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
            </div>
            {isThinking && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
            )}
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-white tracking-tight">
              {isThinking ? 'DeepThinking Active' : 'Cognitive Thought Process'}
            </span>
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {isThinking ? 'Streaming Reasoning...' : 'Verified Trace'}
            </span>
          </div>
        </div>

        {/* Header Badges & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-[10px] text-purple-300/80">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Clock className="w-3 h-3" />
              <span>{formattedDuration}s</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-cyan-300 font-semibold">
              <Cpu className="w-3 h-3" />
              <span>~{approxTokens} tokens</span>
            </span>
          </div>

          {/* View mode toggle */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center p-0.5 rounded bg-black/40 border border-purple-900/60 text-[10px]"
          >
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-purple-300 hover:text-white'
              }`}
              title="Timeline View"
            >
              <ListTree className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                viewMode === 'raw'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-purple-300 hover:text-white'
              }`}
              title="Raw Stream View"
            >
              <Code2 className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-purple-900/40 text-purple-300 hover:text-white transition-colors"
            title="Copy Thinking Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button className="p-0.5 text-purple-300 hover:text-white">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-4 border-t border-purple-900/30 font-mono text-xs">
          {viewMode === 'timeline' ? (
            /* Animated Timeline Visualization */
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-cyan-500 before:to-emerald-500">
              {timelineSteps.map((step, sIdx) => {
                const isLatestStep = sIdx === timelineSteps.length - 1;

                return (
                  <div key={sIdx} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center transition-all ${
                        isThinking && isLatestStep
                          ? 'bg-cyan-400 ring-4 ring-cyan-500/30 animate-pulse'
                          : 'bg-purple-500 group-hover:bg-emerald-400'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    {/* Step Card */}
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-900/40 hover:border-purple-600/50 transition-colors space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1 text-[11px]">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                            {step.phase}
                          </span>
                          <span className="text-white truncate max-w-sm sm:max-w-md">
                            Step {sIdx + 1}: {step.title}
                          </span>
                        </span>

                        <span className="text-[10px] text-slate-500">
                          Node {sIdx + 1}/{timelineSteps.length}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] pl-1 animate-pulse">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Synthesizing next reasoning step in memory...</span>
                </div>
              )}
            </div>
          ) : (
            /* Raw Stream Code View */
            <div className="p-3 rounded-lg bg-black/60 border border-purple-900/40 text-purple-200/90 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                {thinkingContent}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

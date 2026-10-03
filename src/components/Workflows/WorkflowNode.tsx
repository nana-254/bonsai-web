import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  Globe2, 
  Terminal, 
  Volume2, 
  MessageSquare, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Trash2, 
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Search,
  Layers,
  Play,
  Pause,
  Eye,
  EyeOff,
  MoreVertical,
  ExternalLink,
  Bot,
  GitBranch,
  Copy,
  Check,
  Download,
  X
} from 'lucide-react';
import { WorkflowNode as WorkflowNodeType } from '../../types';

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onStartConnect: (nodeId: string, startX: number, startY: number, e: React.MouseEvent) => void;
  onEndConnect: (nodeId: string) => void;
  isConnectingSource?: boolean;
  isConnectingActive?: boolean;
  onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  isInvalidConnection?: boolean;
  validationMessage?: string;
  onDuplicate?: (node: WorkflowNodeType) => void;
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onStartConnect,
  onEndConnect,
  isConnectingSource,
  isConnectingActive,
  onNodeMouseDown,
  isInvalidConnection,
  validationMessage,
  onDuplicate,
}) => {
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const getNodeMeta = () => {
    switch (node.type) {
      case 'tool_google_search':
        return {
          icon: Search,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          category: 'Data Retrieval',
        };
      case 'ai_bonsai_standard':
        return {
          icon: Cpu,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          category: 'Ternary LLM',
        };
      case 'tool_tts_narrator':
        return {
          icon: Volume2,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          category: 'Audio Synth',
        };
      case 'tool_darkweb_intel':
        return {
          icon: ShieldAlert,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          category: 'Tor Circuit',
        };
      case 'tool_python_sandbox':
        return {
          icon: Terminal,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          category: 'Execution',
        };
      case 'ai_bonsai_uncensored':
        return {
          icon: Sparkles,
          color: 'text-violet-400',
          bg: 'bg-violet-500/10',
          border: 'border-violet-500/30',
          category: 'Uncensored',
        };
      case 'ai_bonsai_abliterated':
        return {
          icon: Zap,
          color: 'text-emerald-300',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-400/40',
          category: 'Abliteration',
        };
      case 'bot_agent':
        return {
          icon: Bot,
          color: 'text-amber-300',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          category: 'Bot Agent',
        };
      case 'github_action':
        return {
          icon: GitBranch,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30',
          category: 'GitHub CI/CD',
        };
      case 'output_chat':
        return {
          icon: MessageSquare,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          category: 'Dispatch',
        };
      default:
        if (node.title.toLowerCase().includes('summarize')) {
          return {
            icon: FileText,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/30',
            category: 'Summarizer',
          };
        }
        if (node.title.toLowerCase().includes('image')) {
          return {
            icon: ImageIcon,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/30',
            category: 'Image Gen',
          };
        }
        return {
          icon: Layers,
          color: 'text-slate-300',
          bg: 'bg-slate-800',
          border: 'border-slate-700',
          category: 'Action Node',
        };
    }
  };

  const meta = getNodeMeta();
  const Icon = meta.icon;
  const isImageNode = node.type === 'tool_image_gen' || node.title.toLowerCase().includes('image');

  const handleCopyOutput = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.outputPreview) {
      navigator.clipboard.writeText(node.outputPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
      }}
      className={`absolute w-72 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl select-none transition-all ${
        isInvalidConnection
          ? 'bg-slate-900/95 border-rose-500 ring-2 ring-rose-500/80 shadow-[0_0_40px_rgba(244,63,94,0.65),0_0_15px_rgba(244,63,94,0.4)] z-30 animate-pulse'
          : isSelected
          ? 'bg-slate-900/95 border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/15 z-25 scale-[1.01]'
          : 'bg-slate-900/85 border-slate-800 hover:border-slate-700/80 z-10'
      }`}
      onClick={() => onSelect(node.id)}
    >
      {/* 1. INPUT HANDLE (Left Side Connector Port) */}
      <div
        className="absolute -left-3.5 top-1/2 -translate-y-1/2 group/port cursor-pointer z-30"
        onMouseUp={e => {
          e.stopPropagation();
          onEndConnect(node.id);
        }}
        title="Input Connector (Drop wire here)"
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isConnectingActive
              ? 'bg-emerald-500/20 ring-4 ring-emerald-400/40 animate-pulse'
              : 'hover:bg-cyan-500/20'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
              isConnectingActive
                ? 'bg-emerald-400 border-white scale-125'
                : 'bg-slate-950 border-slate-600 group-hover/port:border-cyan-400 group-hover/port:bg-cyan-400'
            }`}
          />
        </div>
      </div>

      {/* 2. OUTPUT HANDLE (Right Side Connector Port) */}
      <div
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 group/port cursor-crosshair z-30"
        onMouseDown={e => {
          e.stopPropagation();
          onStartConnect(node.id, node.x + 288, node.y + 55, e);
        }}
        title="Output Connector (Drag wire to another node)"
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isConnectingSource
              ? 'bg-emerald-500/30 ring-4 ring-emerald-400/50'
              : 'hover:bg-emerald-500/20'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
              isConnectingSource
                ? 'bg-emerald-400 border-white scale-125'
                : 'bg-slate-950 border-emerald-500/80 group-hover/port:border-emerald-300 group-hover/port:bg-emerald-400 group-hover/port:scale-110'
            }`}
          />
        </div>
      </div>

      {/* 3. Node Header (Draggable Card Surface) */}
      <div
        className="flex items-center justify-between pb-2 border-b border-slate-800/80 cursor-grab active:cursor-grabbing"
        onMouseDown={e => onNodeMouseDown(node.id, e)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-xl ${meta.bg} ${meta.border} border ${meta.color} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white tracking-tight truncate block max-w-[130px]">
              {node.title}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              {meta.category}
            </span>
          </div>
        </div>

        {/* Status Indicator & Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Live Preview Toggle Eye Icon Button */}
          <button
            onClick={e => {
              e.stopPropagation();
              setShowLivePreview(!showLivePreview);
            }}
            className={`p-1 rounded transition-colors cursor-pointer ${
              showLivePreview
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
            }`}
            title="Toggle Live Preview Overlay inside canvas"
          >
            {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {isInvalidConnection && (
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold animate-pulse">
              INVALID
            </span>
          )}

          {node.status === 'running' && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>RUN</span>
            </div>
          )}

          {node.status === 'success' && !isInvalidConnection && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}

          {node.status === 'error' && (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          )}

          {(!node.status || node.status === 'idle') && !isInvalidConnection && (
            <span className="w-2 h-2 rounded-full bg-slate-600" />
          )}

          {/* Node Options Dropdown Menu */}
          <div className="relative">
            <button
              onClick={e => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Node actions"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            {showDropdown && (
              <div
                onClick={e => e.stopPropagation()}
                className="absolute right-0 top-6 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 text-[11px] font-mono space-y-0.5 animate-in fade-in"
              >
                <button
                  onClick={() => {
                    setShowLivePreview(!showLivePreview);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
                </button>
                {node.outputPreview && (
                  <button
                    onClick={e => {
                      handleCopyOutput(e);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Output</span>
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={() => {
                      onDuplicate(node);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duplicate Node</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(node.id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-rose-400 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Node</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Node Description & Body */}
      <div className="py-2.5 space-y-1.5">
        <p className="text-[11px] text-slate-300 font-sans line-clamp-2 leading-relaxed">
          {node.description}
        </p>

        {/* Invalid Connection Warning Box */}
        {isInvalidConnection && validationMessage && (
          <div className="mt-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-[10px] font-mono text-rose-300 flex items-start gap-1.5 shadow-md shadow-rose-950/40 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-tight select-text">{validationMessage}</span>
          </div>
        )}

        {/* Truncated Output Pill (Click to open full Live Preview) */}
        {node.outputPreview && !showLivePreview && (
          <div
            onClick={e => {
              e.stopPropagation();
              setShowLivePreview(true);
            }}
            className="mt-2 p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-emerald-300 truncate shadow-inner cursor-pointer hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all flex items-center justify-between group/preview"
            title="Click to expand Live Preview overlay"
          >
            <div className="truncate min-w-0 pr-1">
              <span className="text-slate-500 select-none mr-1">$</span>
              <span>{node.outputPreview}</span>
            </div>
            <Eye className="w-3 h-3 text-slate-500 group-hover/preview:text-cyan-400 shrink-0" />
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. 'LIVE PREVIEW' OVERLAY (Inside the Graph Canvas) */}
        {/* ========================================================= */}
        {showLivePreview && (
          <div
            onClick={e => e.stopPropagation()}
            className="mt-3 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-2xl space-y-2 animate-in fade-in slide-in-from-top-1 select-text"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-[10px] font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Live Node Output Preview</span>
              </span>
              <button
                onClick={() => setShowLivePreview(false)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* A. Image Generation Node Preview */}
            {isImageNode ? (
              <div className="space-y-1.5">
                <div className="relative rounded-lg overflow-hidden border border-pink-500/30 bg-slate-950 aspect-video flex flex-col items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-3 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(236,72,153,0.3),transparent_70%)] animate-pulse" />
                    <ImageIcon className="w-7 h-7 text-pink-400 mb-1.5 relative z-10" />
                    <span className="text-[10px] font-mono text-pink-300 font-semibold relative z-10">
                      Generated Visual Asset (Imagen 3)
                    </span>
                    <span className="text-[9px] font-mono text-slate-300 mt-1 relative z-10 line-clamp-2 px-2">
                      {node.outputPreview || 'Ternary neural weight distributions depicted in obsidian cyberpunk landscape.'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-0.5">
                  <span>Aspect: 16:9 · 1024x576</span>
                  <span className="text-emerald-400 font-semibold">Render Complete</span>
                </div>
              </div>
            ) : node.type === 'tool_google_search' ? (
              /* B. Google Search Grounding Preview */
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="text-slate-400 text-[9px]">Live Grounding Citations:</div>
                <div className="space-y-1">
                  {[
                    { source: 'ArXiv:2402.17764', title: 'The Era of 1-bit LLMs: All Large Models in BitNet b1.58' },
                    { source: 'Microsoft Research', title: 'Integer Addition GEMM Kernels & Zero-Multiplier Architecture' },
                    { source: 'IEEE Computer', title: 'Empirical 8GB Laptop RAM Memory Benchmarks for 27B Parameters' },
                  ].map((cite, cIdx) => (
                    <div key={cIdx} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-1.5">
                      <span className="text-cyan-400 text-[9px] font-bold mt-0.5">{cIdx + 1}.</span>
                      <div className="min-w-0">
                        <div className="text-slate-200 font-medium truncate">{cite.title}</div>
                        <div className="text-slate-500 text-[8px]">{cite.source}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : node.type === 'tool_tts_narrator' ? (
              /* C. TTS Audio Player Preview */
              <div className="space-y-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Studio Prebuilt Voice (Kore)</span>
                  </span>
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-colors"
                  >
                    {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>
                {/* Audio Waveform Visualization */}
                <div className="flex items-center gap-0.5 h-6 bg-slate-950 p-1 rounded border border-slate-800/80">
                  {[4, 12, 18, 8, 22, 16, 24, 14, 19, 10, 21, 15, 8, 12, 16, 20, 9, 14, 18].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`flex-1 rounded-full transition-all ${
                        isPlayingAudio ? 'bg-purple-400 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-slate-300 leading-tight">
                  {node.outputPreview || 'Synthesizing voice PCM stream: 24kHz Stereo, duration 18.4s.'}
                </p>
              </div>
            ) : node.type === 'tool_python_sandbox' ? (
              /* D. Python Sandbox Execution Preview */
              <div className="space-y-1 font-mono text-[9px]">
                <div className="p-2 rounded bg-black/90 border border-slate-800 text-emerald-400 whitespace-pre-wrap leading-tight max-h-32 overflow-y-auto shadow-inner">
                  {`>>> import numpy as np\n>>> W = np.random.choice([-1, 0, 1], size=(27400, 27400))\n>>> # Zero multiplications executed in RAM\n>>> print("Ternary GEMM Matrix addition passed.")\n${node.outputPreview || 'Process exited successfully with code 0. RAM peak: 0.12 GB.'}`}
                </div>
              </div>
            ) : node.type === 'tool_darkweb_intel' ? (
              /* E. Tor Darkweb Gateway Threat Recon */
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span>Tor Circuit: 3 Hops</span>
                  <span className="text-rose-400 font-bold">CVE-2024-38063</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-rose-500/30 text-[9px] text-rose-300">
                  CVSS 9.8 Critical · IPv6 Packet Injection RCE detected on darknet disclosure index.
                </div>
              </div>
            ) : node.type === 'bot_agent' ? (
              /* F. Bot Agent Specialist Preview */
              <div className="p-2 rounded bg-slate-900 border border-amber-500/30 text-[10px] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{node.config?.botName || node.title}</span>
                </div>
                <p className="text-[9px] text-slate-300 leading-tight font-sans">
                  {node.outputPreview || 'Autonomous specialist reasoning over memory allocations & algorithm verification.'}
                </p>
              </div>
            ) : node.type === 'github_action' ? (
              /* G. GitHub Action Step Preview */
              <div className="p-2 rounded bg-slate-900 border border-indigo-500/30 text-[10px] font-mono space-y-1">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span>actions/checkout@v4</span>
                  </span>
                  <span className="text-emerald-400 text-[9px]">PASS</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  HEAD: commit 7a2f1b8 · 48 tests passing · 0 vulnerabilities.
                </div>
              </div>
            ) : (
              /* H. Standard LLM Synthesizer Preview */
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-sans">
                {node.outputPreview || 'Bonsai 27B Integer Addition synthesis ready for evaluation.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Node Footer (Connection Hint & Metrics) */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1 text-[9px] text-slate-400">
          <span>In</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
          <span>Out</span>
        </span>

        {node.executionTimeMs ? (
          <span className="text-emerald-400 font-semibold">{node.executionTimeMs}ms</span>
        ) : (
          <span className="text-slate-500">Ready</span>
        )}
      </div>
    </div>
  );
};

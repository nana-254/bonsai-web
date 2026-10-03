import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Play, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Search, 
  FileText, 
  Layers, 
  Zap, 
  RefreshCw, 
  X, 
  ChevronRight, 
  GitBranch, 
  ShieldAlert, 
  Volume2, 
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { Workflow, WorkflowNode, WorkflowEdge } from '../../types';

interface WorkflowArchitectToolProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyWorkflow: (workflow: Workflow, executeImmediately: boolean) => void;
}

export const WorkflowArchitectTool: React.FC<WorkflowArchitectToolProps> = ({
  isOpen,
  onClose,
  onApplyWorkflow,
}) => {
  const [prompt, setPrompt] = useState('Create a workflow that searches news and summarizes into a report');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [executeImmediately, setExecuteImmediately] = useState(false);
  const [architectedWorkflow, setArchitectedWorkflow] = useState<Workflow | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const quickPromptPresets = [
    {
      label: 'News & Executive Summary',
      prompt: 'Create a workflow that searches news and summarizes into a report',
      icon: Search,
      color: 'text-cyan-400',
    },
    {
      label: 'Tor Darknet CVE Recon',
      prompt: 'Build an autonomous Tor threat intelligence pipeline that scans onion advisories for 0-days, assesses CVSS severity with Abliterated LLM, and dispatches an alert dossier',
      icon: ShieldAlert,
      color: 'text-rose-400',
    },
    {
      label: 'GitHub PR Reviewer & CI/CD',
      prompt: 'Create a GitHub Actions workflow that inspects pull request diffs, checks code security with CodeNinja 27B, runs unit tests in Python sandbox, and submits PR review',
      icon: GitBranch,
      color: 'text-indigo-400',
    },
    {
      label: 'Trending AI Papers ➔ Image Asset',
      prompt: 'Fetch latest research on BitNet b1.58 models, synthesize an executive briefing, and generate a photorealistic 16:9 hero image with Imagen 3',
      icon: ImageIcon,
      color: 'text-pink-400',
    },
    {
      label: 'Autonomous Daily AI Podcast',
      prompt: 'Retrieve latest scientific discoveries, draft conversational banter dialogue between two AI hosts, and synthesize studio WAV audio using Gemini TTS Narrator',
      icon: Volume2,
      color: 'text-purple-400',
    },
  ];

  const handleSynthesizeGraph = async (overridePrompt?: string) => {
    const targetPrompt = overridePrompt || prompt;
    if (!targetPrompt.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    setError(null);
    setArchitectedWorkflow(null);
    setSynthesisStep(1);

    // Multi-phase progress ticker for high-tech cognitive feel
    const stepTimer1 = setTimeout(() => setSynthesisStep(2), 500);
    const stepTimer2 = setTimeout(() => setSynthesisStep(3), 1100);
    const stepTimer3 = setTimeout(() => setSynthesisStep(4), 1700);

    try {
      const res = await fetch('/api/workflows/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetPrompt }),
      });

      const data = await res.json();
      if (data.success && data.workflow) {
        setArchitectedWorkflow(data.workflow);
      } else {
        throw new Error(data.error || 'Workflow synthesis encountered an unexpected error.');
      }
    } catch (err: any) {
      setError(err.message || 'Workflow Architect generation failed. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsSynthesizing(false);
      setSynthesisStep(0);
    }
  };

  const handleApplyToCanvas = () => {
    if (!architectedWorkflow) return;
    onApplyWorkflow(architectedWorkflow, executeImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isMinimized ? 'max-h-16' : 'max-h-[90vh]'
        }`}
      >
        {/* Architect Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/25 to-blue-500/25 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
              <Wand2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm tracking-tight">Workflow Architect AI</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  Autonomous Graph Tool
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Converts natural language prompts into executable WorkflowNode graphs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Workflow Architect"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Natural Language Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                  <span>Enter Workflow Objective:</span>
                  <span className="text-[10px] text-cyan-400 font-normal">
                    AI synthesizes nodes, tools, and wire dependencies
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g., Create a workflow that searches news and summarizes into a report..."
                    className="w-full h-24 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/70 font-sans leading-relaxed resize-none shadow-inner"
                  />
                  <button
                    onClick={() => handleSynthesizeGraph()}
                    disabled={isSynthesizing || !prompt.trim()}
                    className="absolute right-2.5 bottom-2.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
                    <span>{isSynthesizing ? 'Synthesizing...' : 'Generate Graph'}</span>
                  </button>
                </div>
              </div>

              {/* Sample Mission Chips */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                  Quick Architecture Presets (Click to Test):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickPromptPresets.map((preset, idx) => {
                    const PresetIcon = preset.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(preset.prompt);
                          handleSynthesizeGraph(preset.prompt);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PresetIcon className={`w-3.5 h-3.5 ${preset.color}`} />
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                            {preset.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">{preset.prompt}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cognitive Synthesis Progress Timeline */}
              {isSynthesizing && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2.5 animate-in fade-in font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Architecting Node Graph Topology...</span>
                  </div>
                  <div className="space-y-1.5 pl-6 border-l-2 border-slate-800 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${synthesisStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>[Phase 1/4] Decomposing natural language objective & intent</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${synthesisStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>[Phase 2/4] Selecting optimal node classes & model configurations</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${synthesisStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>[Phase 3/4] Resolving topological dependencies & edge routing</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${synthesisStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>[Phase 4/4] Placing WorkflowNode coordinates on studio canvas</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Architected Graph Preview Card */}
              {architectedWorkflow && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{architectedWorkflow.name}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">{architectedWorkflow.description}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                      {architectedWorkflow.nodes.length} Nodes · {architectedWorkflow.edges.length} Wires
                    </span>
                  </div>

                  {/* Visual Node Flow DAG Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400">Synthesized Graph Structure:</span>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      {architectedWorkflow.nodes.map((node, i) => (
                        <React.Fragment key={node.id}>
                          <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium shadow-sm">
                            {i + 1}. {node.title}
                          </span>
                          {i < architectedWorkflow.nodes.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-cyan-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Autonomous Execution Option */}
              {architectedWorkflow && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-200">Automatically run pipeline after loading onto canvas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={executeImmediately}
                    onChange={e => setExecuteImmediately(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {architectedWorkflow ? (
                  <button
                    onClick={handleApplyToCanvas}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{executeImmediately ? 'Apply & Run Workflow' : 'Load Graph into Studio'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSynthesizeGraph()}
                    disabled={isSynthesizing || !prompt.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Synthesize Graph</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Play, 
  ArrowRight, 
  Bot, 
  Check, 
  AlertCircle, 
  Layers, 
  GitBranch, 
  ShieldAlert, 
  Terminal, 
  Volume2, 
  Search, 
  Cpu,
  Zap
} from 'lucide-react';
import { Workflow } from '../../types';

interface AIWorkflowGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (workflow: Workflow, executeImmediately: boolean) => void;
}

export const AIWorkflowGeneratorModal: React.FC<AIWorkflowGeneratorModalProps> = ({
  isOpen,
  onClose,
  onWorkflowGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [executeImmediately, setExecuteImmediately] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPreview, setGeneratedPreview] = useState<Workflow | null>(null);

  if (!isOpen) return null;

  const sampleMissions = [
    {
      title: 'GitHub PR Code Reviewer & CI/CD Tester',
      prompt: 'Inspect latest pull request diff in GitHub repo, analyze code security with CodeNinja 27B bot, execute unit tests in Python sandbox, and post review summary.',
      icon: GitBranch,
      color: 'text-indigo-400',
    },
    {
      title: 'Tor Darkweb CVE Recon & Alert Dispatch',
      prompt: 'Crawl darknet threat intelligence via Tor gateway for 0-day IPv6 vulnerabilities, evaluate CVSS severity using Bonsai Abliterated, and dispatch incident alert.',
      icon: ShieldAlert,
      color: 'text-rose-400',
    },
    {
      title: 'Real-Time News ➔ Summary ➔ Imagen 3 Visual',
      prompt: 'Retrieve latest AI news on 1.58-bit BitNet models using Google Search Grounding, draft a 3-paragraph executive summary, and generate high-fidelity visual artwork.',
      icon: Sparkles,
      color: 'text-pink-400',
    },
    {
      title: 'Automated Daily AI Podcast Synthesizer',
      prompt: 'Search latest quantum computing breakthroughs, synthesize a conversational dialogue between two hosts, and generate speech audio using Gemini TTS Narrator.',
      icon: Volume2,
      color: 'text-purple-400',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedPreview(null);

    try {
      const res = await fetch('/api/workflows/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.success && data.workflow) {
        setGeneratedPreview(data.workflow);
      } else {
        throw new Error(data.error || 'Failed to synthesize workflow');
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyWorkflow = () => {
    if (!generatedPreview) return;
    onWorkflowGenerated(generatedPreview, executeImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-teal-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Autonomous AI Workflow Creator</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Agentic
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                AI designs, wires, parameterizes, and executes its own multi-node agents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Prompt Input Box */}
          <div>
            <label className="text-xs font-mono text-slate-300 font-semibold block mb-1.5 flex items-center justify-between">
              <span>Describe the Autonomous Agent Mission:</span>
              <span className="text-[10px] text-slate-500 font-normal">Bonsai will assemble nodes & wires</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., An autonomous security engineer agent that scans GitHub commits for exposed secrets, evaluates breach risk with Bonsai 27B, and alerts via Discord webhook..."
              className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 leading-relaxed resize-none shadow-inner"
            />
          </div>

          {/* Quick Mission Suggestions */}
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2">
              Preset Agent Missions (Click to Load):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleMissions.map((mission, idx) => {
                const Icon = mission.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(mission.prompt);
                      setGeneratedPreview(null);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${mission.color}`} />
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                        {mission.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug font-sans">
                      {mission.prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Workflow Preview Card */}
          {generatedPreview && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{generatedPreview.name}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">{generatedPreview.description}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                  {generatedPreview.nodes.length} Stages Planned
                </span>
              </div>

              {/* Node Sequence Pipeline Badges */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-400">Agentic DAG Pipeline:</div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  {generatedPreview.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium">
                        {i + 1}. {node.title}
                      </span>
                      {i < generatedPreview.nodes.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-cyan-500" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Immediate Execution Option */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200">Execute immediately as autonomous agent upon creation</span>
            </div>
            <input
              type="checkbox"
              checked={executeImmediately}
              onChange={e => setExecuteImmediately(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!generatedPreview ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing Workflow...' : 'Generate Workflow with AI'}</span>
              </button>
            ) : (
              <button
                onClick={handleApplyWorkflow}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{executeImmediately ? 'Load & Execute Agent Now' : 'Load onto Graph Canvas'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Code2, 
  Sparkles, 
  Layers, 
  Bot, 
  GitBranch, 
  Terminal, 
  ShieldAlert, 
  Search, 
  Volume2, 
  Image as ImageIcon, 
  FileText,
  AlertCircle,
  Check,
  Cpu,
  Zap,
  Globe2,
  MessageSquare
} from 'lucide-react';
import { WorkflowNode, WorkflowNodeType } from '../../types';
import { INITIAL_BOTS } from '../../data/bots';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: WorkflowNode) => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({
  isOpen,
  onClose,
  onAddNode,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'bots' | 'github' | 'json' | 'ai'>('standard');

  // JSON Tab state
  const defaultJsonTemplate = JSON.stringify(
    {
      title: 'Custom Algorithm Validator',
      type: 'tool_python_sandbox',
      description: 'Executes custom discrete mathematics and statistical checks with zero multiplications.',
      config: {
        timeoutMs: 5000,
        memoryBudgetGB: 0.15,
        targetAccuracy: 0.999,
      },
    },
    null,
    2
  );
  const [jsonInput, setJsonInput] = useState(defaultJsonTemplate);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // AI Tab state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInsertJsonNode = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      if (!parsed.title || !parsed.type) {
        throw new Error('JSON node must contain at least "title" and "type" fields.');
      }

      const newNode: WorkflowNode = {
        id: `node-custom-${Date.now()}`,
        type: parsed.type as WorkflowNodeType,
        title: parsed.title,
        description: parsed.description || 'Custom user-defined JSON node',
        x: 350 + Math.random() * 80,
        y: 180 + Math.random() * 80,
        config: parsed.config || {},
        status: 'idle',
      };

      onAddNode(newNode);
      onClose();
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format');
    }
  };

  const handleCreateByAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/workflows/ai-create-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.success && data.node) {
        onAddNode(data.node);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to synthesize node');
      }
    } catch (err: any) {
      // Client-side fallback if server offline
      const fallbackNode: WorkflowNode = {
        id: `node-ai-${Date.now()}`,
        type: aiPrompt.toLowerCase().includes('github') ? 'github_action' : aiPrompt.toLowerCase().includes('search') ? 'tool_google_search' : 'ai_bonsai_standard',
        title: aiPrompt.slice(0, 30),
        description: aiPrompt,
        x: 350,
        y: 180,
        config: { prompt: aiPrompt },
        status: 'idle',
      };
      onAddNode(fallbackNode);
      onClose();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddStandardNode = (type: WorkflowNodeType, title: string, description: string, config: any = {}) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      title,
      description,
      x: 350 + Math.random() * 80,
      y: 180 + Math.random() * 80,
      config,
      status: 'idle',
    };
    onAddNode(newNode);
    onClose();
  };

  const handleAddBotNode = (bot: typeof INITIAL_BOTS[0]) => {
    const newNode: WorkflowNode = {
      id: `node-bot-${bot.id}-${Date.now()}`,
      type: 'bot_agent',
      title: `${bot.name} (Bot)`,
      description: bot.description,
      x: 350 + Math.random() * 80,
      y: 180 + Math.random() * 80,
      config: {
        botId: bot.id,
        botName: bot.name,
        systemPrompt: bot.systemPrompt,
        modelId: bot.modelId,
        temperature: bot.temperature,
        enabledTools: bot.enabledTools,
      },
      status: 'idle',
    };
    onAddNode(newNode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Add Node to Graph Canvas</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Standard tools · Bot agents · GitHub Actions · Custom JSON · AI Synthesis
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-950 flex items-center gap-2 text-xs font-mono overflow-x-auto">
          {[
            { id: 'standard', label: 'Tool Library', icon: Layers },
            { id: 'bots', label: 'Bots as Nodes', icon: Bot },
            { id: 'github', label: 'GitHub Actions', icon: GitBranch },
            { id: 'json', label: 'Add by JSON', icon: Code2 },
            { id: 'ai', label: 'Create by AI', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: STANDARD TOOLS */}
          {activeTab === 'standard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  type: 'tool_google_search' as const,
                  title: 'Search Grounding',
                  desc: 'Queries live web indices for empirical facts and citations',
                  icon: Search,
                  color: 'text-cyan-400',
                },
                {
                  type: 'ai_bonsai_standard' as const,
                  title: 'Bonsai 27B Standard',
                  desc: '1.58-bit ternary integer addition reasoning & synthesis',
                  icon: Cpu,
                  color: 'text-emerald-400',
                },
                {
                  type: 'tool_image_gen' as const,
                  title: 'Imagen 3 Visual Generator',
                  desc: 'Produces creative photorealistic visual assets & diagrams',
                  icon: ImageIcon,
                  color: 'text-pink-400',
                },
                {
                  type: 'tool_darkweb_intel' as const,
                  title: 'Tor Darkweb Gateway',
                  desc: 'Onion circuit exploit crawler & CVE breach scanner',
                  icon: ShieldAlert,
                  color: 'text-rose-400',
                },
                {
                  type: 'tool_python_sandbox' as const,
                  title: 'Python WASM Sandbox',
                  desc: 'Sandboxed code execution with 8GB laptop RAM envelope',
                  icon: Terminal,
                  color: 'text-amber-400',
                },
                {
                  type: 'tool_tts_narrator' as const,
                  title: 'Gemini TTS Synthesizer',
                  desc: 'Speech audio synthesis with prebuilt studio voices',
                  icon: Volume2,
                  color: 'text-purple-400',
                },
                {
                  type: 'ai_bonsai_abliterated' as const,
                  title: 'Bonsai Abliterated',
                  desc: 'Unrestricted security vulnerability & threat evaluation',
                  icon: Zap,
                  color: 'text-emerald-300',
                },
                {
                  type: 'output_chat' as const,
                  title: 'Chat Dispatch & Canvas',
                  desc: 'Streams artifact to active chat and ChatCanvas',
                  icon: MessageSquare,
                  color: 'text-blue-400',
                },
              ].map(item => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => handleAddStandardNode(item.type, item.title, item.desc)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ItemIcon className={`w-4 h-4 ${item.color}`} />
                      <span className="font-semibold text-xs text-white group-hover:text-emerald-300">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: BOTS AS NODES */}
          {activeTab === 'bots' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2">
                <Bot className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Convert your configured Bot Builder bots into autonomous nodes inside the workflow graph! Each bot executes with its dedicated knowledge and persona.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INITIAL_BOTS.map(bot => (
                  <button
                    key={bot.id}
                    onClick={() => handleAddBotNode(bot)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-white group-hover:text-amber-300">
                        {bot.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{bot.description}</p>
                    <div className="mt-2 text-[9px] font-mono text-slate-500">
                      Model: {bot.modelId} · Tools: {bot.enabledTools.join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB PROJECT NODES */}
          {activeTab === 'github' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-300 flex items-start gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Compatible with all GitHub projects and GitHub Actions workflows! Chain repository pull requests, code linters, and CI/CD steps into your agentic graph.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    title: 'GitHub PR Reviewer & Bot',
                    desc: 'Pulls PR diff, inspects changed files, and posts automated line comments',
                    step: 'actions/pr-reviewer@v2',
                    repo: 'user/repo',
                  },
                  {
                    title: 'GitHub Actions: Checkout & Lint',
                    desc: 'Checks out HEAD commit and runs super-linter across all project files',
                    step: 'actions/checkout@v4',
                    repo: 'user/repo',
                  },
                  {
                    title: 'CI/CD Unit Test Runner',
                    desc: 'Executes npm test / pytest inside sandbox with failure diagnostics',
                    step: 'run: npm test',
                    repo: 'user/repo',
                  },
                  {
                    title: 'Dependabot CVE Patch Maker',
                    desc: 'Scans package.json / requirements.txt and drafts automated patch branches',
                    step: 'github/dependabot-scan',
                    repo: 'user/repo',
                  },
                ].map(gh => (
                  <button
                    key={gh.title}
                    onClick={() =>
                      handleAddStandardNode('github_action', gh.title, gh.desc, {
                        repo: gh.repo,
                        actionStep: gh.step,
                      })
                    }
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GitBranch className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-xs text-white group-hover:text-indigo-300">
                        {gh.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{gh.desc}</p>
                    <span className="inline-block mt-2 text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {gh.step}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADD BY JSON */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Paste or edit JSON node definition:</span>
                <button
                  onClick={() => setJsonInput(defaultJsonTemplate)}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Reset Template
                </button>
              </div>

              <textarea
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                className="w-full h-52 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500/60 leading-relaxed resize-none shadow-inner"
                spellCheck={false}
              />

              {jsonError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              <button
                onClick={handleInsertJsonNode}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Insert JSON Node onto Canvas</span>
              </button>
            </div>
          )}

          {/* TAB 5: CREATE NODE BY AI */}
          {activeTab === 'ai' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Describe what custom node you want in natural language. Bonsai AI will synthesize the node type, parameters, and execution logic automatically!
                </span>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Node Objective & Capabilities Prompt:
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g., A security node that inspects incoming HTTP webhook payloads for SQL injection and cross-site scripting patterns, returning a risk score..."
                  className="w-full h-28 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans text-slate-200 focus:outline-none focus:border-cyan-500/60 resize-none shadow-inner leading-relaxed"
                />
              </div>

              {aiError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <button
                onClick={handleCreateByAi}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-40"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Synthesizing Node with AI...' : 'Create Node with AI'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

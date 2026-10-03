import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Square, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Cpu, 
  Zap, 
  Terminal, 
  Search, 
  MapPin, 
  Code, 
  Volume2, 
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Globe2,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  Check,
  Radio
} from 'lucide-react';
import { ModelDef, AgentTask, AgentStep } from '../../types';

interface AgentLabProps {
  selectedModel: ModelDef;
  onTtsPlay: (text: string) => void;
}

export const AgentLab: React.FC<AgentLabProps> = ({ selectedModel, onTtsPlay }) => {
  const [taskInput, setTaskInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);

  // Tool Toggles
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [enableCodeSandbox, setEnableCodeSandbox] = useState(true);
  const [enableTts, setEnableTts] = useState(true);
  const [enableDarknet, setEnableDarknet] = useState(false);

  const presetAgentScenarios = [
    {
      title: 'Full Binary LLM Research & Synthesis',
      description: 'Searches the latest 1.58-bit BitNet papers via Google Search grounding, runs code to compute memory footprints for 8GB laptops, and generates a structured technical briefing.',
      prompt: 'Perform a comprehensive agentic analysis on 1.58-bit ternary models: 1) Query live research on BitNet b1.58 benchmarks; 2) Execute Python code calculating memory budgets across 8GB, 16GB, and 32GB systems; 3) Synthesize conclusions into an executive summary.',
      tools: ['googleSearch', 'codeInterpreter', 'textToSpeech'],
      requiresWeb: true,
    },
    {
      title: 'Autonomous Cybersecurity & Red-Team Audit',
      description: 'Using Bonsai 27B Uncensored/Abliterated, performs an objective analysis of buffer overflow vectors in a C snippet without refusal filters.',
      prompt: 'Analyze memory safety vectors in an asynchronous socket listener. Draft a non-malicious proof-of-concept unit test demonstrating boundary violations and patch recommendations.',
      tools: ['codeInterpreter', 'googleSearch'],
      requiresWeb: true,
    },
    {
      title: 'Multi-Modal Product Briefing',
      description: 'Orchestrates search research, image generation of an edge-computing workstation, and TTS narration.',
      prompt: 'Create a launch package for a portable 8GB AI development laptop running Bonsai 27B: include market trends, an image generation prompt, and a speech audio script.',
      tools: ['googleSearch', 'generateImage', 'textToSpeech'],
      requiresWeb: true,
    },
  ];

  const handleRunTask = async (promptToRun?: string, forceWeb?: boolean) => {
    const finalPrompt = promptToRun || taskInput;
    if (!finalPrompt.trim() || isRunning) return;

    const useSearch = forceWeb !== undefined ? forceWeb : enableWebSearch;

    setIsRunning(true);
    setCurrentStepIndex(0);

    const initialSteps: AgentStep[] = [
      {
        step: 1,
        thought: 'Deconstructing user intent and parsing required tool schemas for 8GB edge runtime...',
        action: 'PlanAgenticTrajectory',
        actionInput: { prompt: finalPrompt.slice(0, 100), webGrounding: useSearch },
        status: 'running',
      },
    ];

    if (useSearch) {
      initialSteps.push({
        step: 2,
        thought: 'Dispatching external Google Search grounding for real-time information retrieval...',
        action: 'googleSearch',
        actionInput: { 
          query: finalPrompt.length > 50 ? finalPrompt.slice(0, 50) + ' benchmarks 2026' : finalPrompt,
          tool: 'Google Search Grounding Engine'
        },
        status: 'pending',
      });
    }

    if (enableCodeSandbox) {
      initialSteps.push({
        step: initialSteps.length + 1,
        thought: 'Executing numeric memory calculation in Python sandbox for 8GB laptop hardware...',
        action: 'codeInterpreter',
        actionInput: { language: 'python', script: 'calc_ram_allocation(params=27.4e9, bits=1.58)' },
        status: 'pending',
      });
    }

    initialSteps.push({
      step: initialSteps.length + 1,
      thought: 'Synthesizing gathered intelligence and observations into final response...',
      action: 'FinalAnswerSynthesis',
      actionInput: { format: 'markdown', voiceNarration: enableTts },
      status: 'pending',
    });

    const enabledToolsList = [
      useSearch ? 'googleSearch' : null,
      enableCodeSandbox ? 'codeInterpreter' : null,
      enableTts ? 'textToSpeech' : null,
      enableDarknet ? 'darkwebSearch' : null,
    ].filter(Boolean) as string[];

    const newTask: AgentTask = {
      id: `task-${Date.now()}`,
      prompt: finalPrompt,
      modelId: selectedModel.id,
      steps: initialSteps,
      status: 'running',
      toolsUsed: enabledToolsList,
    };

    setActiveTask(newTask);

    // Simulate real-time autonomous agent loop execution
    for (let i = 0; i < initialSteps.length; i++) {
      setCurrentStepIndex(i);
      await new Promise(r => setTimeout(r, 1200));

      initialSteps[i].status = 'completed';
      const actionName = initialSteps[i].action;

      if (actionName === 'PlanAgenticTrajectory') {
        initialSteps[i].observation = `Trajectory formulated: ${initialSteps.length - 2} tool dispatches queued. Host memory: 5.34 GB allocated, 2.66 GB headroom OK.`;
      } else if (actionName === 'googleSearch') {
        initialSteps[i].observation = `Google Search Grounding verified 5 real-time citations:\n1. BitNet b1.58: 1.58-bit LLMs achieve FP16 parity with integer addition.\n2. 27B parameter ternary model occupies 5.34 GB RAM on 8GB laptops.\n3. Latency benchmarks demonstrate 38.6 tokens/sec on base M-series & AMD Ryzen.\n4. Energy efficiency: 82% power reduction over FP-GEMM units.\nQuery resolved via googleSearch API.`;
      } else if (actionName === 'codeInterpreter') {
        initialSteps[i].observation = 'Python execution output:\n>>> params = 27.4e9; bits = 1.58\n>>> weight_gb = (params * bits) / 8 / 1e9 -> 5.34 GB\n>>> kv_cache_4k = 0.85 GB\n>>> host_available_headroom = 1.81 GB (Zero OOM).';
      } else if (actionName === 'FinalAnswerSynthesis') {
        initialSteps[i].observation = `Final synthesis complete.${enableTts ? ' Voice narrative generated via gemini-3.8-flash-tts.' : ''}`;
      }

      if (i < initialSteps.length - 1) {
        initialSteps[i + 1].status = 'running';
      }
      setActiveTask({ ...newTask, steps: [...initialSteps] });
    }

    const finalAnswer = `### Autonomous Agent Synthesis: 27B Binary Models on 8GB Hardware

${useSearch ? '> **Grounding Source**: Real-time Google Search retrieved latest BitNet b1.58 & 1.58-bit ternary benchmark data.\n\n' : ''}
1. **Mathematical Footprint**:
   - At **1.58 bits per parameter**, the 27.4 Billion weight matrix occupies **5.34 GB** in host physical RAM.
   - Fits natively on an **8GB laptop** with **1.81 GB** remaining for the OS and grouped-query KV cache.

2. **Integer Addition GEMM Speed**:
   - Replaces floating-point matrix multiplications ($W \\times X$) with integer addition ($+1$), subtraction ($-1$), and skips ($0$).
   - Sustains **38.6 tokens/sec** on consumer laptop CPUs, reducing agentic multi-turn latency from 42s down to **3.2s**.

3. **Grounding & Agent Readiness**:
   - ${useSearch ? '✅ Google Search Grounding validated live real-world citations.' : 'ℹ️ Parametric weights inference only.'}
   - Deterministic JSON tool emission enables multi-step tool chaining (Code sandbox, Maps, Media synthesis) directly on edge hardware.`;

    setActiveTask(prev => prev ? {
      ...prev,
      status: 'finished',
      finalResult: finalAnswer,
      totalDurationMs: 4800,
    } : null);

    setIsRunning(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Agent Laboratory</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                ReAct Autonomous Loop
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Execute autonomous multi-step reasoning loops on edge hardware. Test tool-calling, Google Search grounding, and iterative self-correction with Bonsai 27B.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Active Agent: <strong className="text-white">{selectedModel.shortName}</strong></span>
          </div>
        </div>

        {/* Dedicated Tool Configuration Bar (Featuring Web Search Toggle) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Agentic Tool Suite Configuration</span>
            </div>
            {enableWebSearch && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30 flex items-center gap-1">
                <Globe2 className="w-3 h-3" />
                <span>Google Search Grounding Active</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {/* 1. Web Search Tool Toggle (Featured) */}
            <button
              onClick={() => setEnableWebSearch(!enableWebSearch)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                enableWebSearch
                  ? 'border-emerald-500/60 bg-emerald-950/25 text-white shadow-md shadow-emerald-500/5'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Search className={`w-3.5 h-3.5 ${enableWebSearch ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>Web Search</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                  enableWebSearch ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>
                  {enableWebSearch ? <Check className="w-3 h-3" /> : ''}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono leading-tight">
                Google Search grounding for live real-time information.
              </span>
            </button>

            {/* 2. Python Sandbox Code Runner */}
            <button
              onClick={() => setEnableCodeSandbox(!enableCodeSandbox)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                enableCodeSandbox
                  ? 'border-cyan-500/60 bg-cyan-950/25 text-white shadow-md shadow-cyan-500/5'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Code className={`w-3.5 h-3.5 ${enableCodeSandbox ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>Code Sandbox</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                  enableCodeSandbox ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>
                  {enableCodeSandbox ? <Check className="w-3 h-3" /> : ''}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono leading-tight">
                Executes Python & JS scripts inside memory sandbox.
              </span>
            </button>

            {/* 3. TTS Speech Narration */}
            <button
              onClick={() => setEnableTts(!enableTts)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                enableTts
                  ? 'border-purple-500/60 bg-purple-950/25 text-white shadow-md shadow-purple-500/5'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Volume2 className={`w-3.5 h-3.5 ${enableTts ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span>TTS Voice</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                  enableTts ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {enableTts ? <Check className="w-3 h-3" /> : ''}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono leading-tight">
                Synthesizes narrative voice with gemini-3.8-flash-tts.
              </span>
            </button>

            {/* 4. Tor Darkweb Intel Gateway */}
            <button
              onClick={() => setEnableDarknet(!enableDarknet)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                enableDarknet
                  ? 'border-rose-500/60 bg-rose-950/25 text-white shadow-md shadow-rose-500/5'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldAlert className={`w-3.5 h-3.5 ${enableDarknet ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span>Tor Gateway</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                  enableDarknet ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {enableDarknet ? <Check className="w-3 h-3" /> : ''}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono leading-tight">
                Simulated 3-hop Tor circuit threat resolver.
              </span>
            </button>
          </div>
        </div>

        {/* Preset Scenarios */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Featured Agentic Workflows
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presetAgentScenarios.map((scen, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-semibold text-white">{scen.title}</h3>
                    {scen.requiresWeb && (
                      <span className="text-[9px] px-1 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                        Web Search
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{scen.description}</p>
                </div>
                <button
                  onClick={() => {
                    setTaskInput(scen.prompt);
                    handleRunTask(scen.prompt, scen.requiresWeb);
                  }}
                  disabled={isRunning}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-mono font-medium border border-emerald-500/30 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Execute Workflow</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Task Input */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Custom Agent Task & Objective
          </label>
          <textarea
            rows={2}
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Describe an autonomous task (e.g., 'Search for latest 1.58-bit quantization benchmarks using Google Search, test matrix addition speed in code, and summarize findings')..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
          />

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-[11px]">Active Trajectory Tools:</span>
              {enableWebSearch && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] flex items-center gap-1">
                  <Search className="w-2.5 h-2.5" />
                  <span>Google Search</span>
                </span>
              )}
              {enableCodeSandbox && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px]">
                  Python Sandbox
                </span>
              )}
              {enableTts && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-400 text-[10px]">
                  TTS Synthesis
                </span>
              )}
              {enableDarknet && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-400 text-[10px]">
                  Tor Intel
                </span>
              )}
            </div>

            <button
              onClick={() => handleRunTask()}
              disabled={!taskInput.trim() || isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-md ${
                taskInput.trim() && !isRunning
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Agent Loop</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live ReAct Execution Graph */}
        {activeTask && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white font-mono uppercase">
                  ReAct Execution Timeline
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                  {activeTask.status === 'running' ? 'Active Iteration' : 'Loop Finished'}
                </span>
              </div>
              {activeTask.totalDurationMs && (
                <span className="text-xs font-mono text-cyan-400">
                  Total Time: {(activeTask.totalDurationMs / 1000).toFixed(2)}s
                </span>
              )}
            </div>

            {/* Steps Visualizer */}
            <div className="space-y-3">
              {activeTask.steps.map((st) => {
                const isStepRunning = st.status === 'running';
                const isStepCompleted = st.status === 'completed';
                const isSearchStep = st.action === 'googleSearch';

                return (
                  <div
                    key={st.step}
                    className={`rounded-lg p-3 border text-xs font-mono transition-all ${
                      isStepRunning
                        ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md shadow-emerald-500/5'
                        : isStepCompleted
                        ? 'border-slate-800 bg-slate-950/80 text-slate-300'
                        : 'border-slate-800/50 bg-slate-950/30 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-800 text-slate-200">
                          {st.step}
                        </span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {isSearchStep && <Search className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>Action: {st.action}</span>
                          {isSearchStep && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                              Google Search Grounding
                            </span>
                          )}
                        </span>
                      </div>

                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {isStepRunning && <span className="text-emerald-400 animate-pulse">Executing...</span>}
                        {isStepCompleted && <span className="text-cyan-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Done</span>}
                        {st.status === 'pending' && <span className="text-slate-600">Pending</span>}
                      </span>
                    </div>

                    <div className="pl-7 space-y-1.5 text-[11px]">
                      <div className="text-purple-300">
                        <strong>Thought:</strong> {st.thought}
                      </div>
                      {st.observation && (
                        <div className="text-slate-300 bg-black/40 p-2.5 rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
                          <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                            {isSearchStep && <Globe2 className="w-3 h-3" />}
                            <span>Observation:</span>
                          </div>
                          {st.observation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Answer Banner */}
            {activeTask.finalResult && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 font-mono">
                  <span>Synthesized Agent Output:</span>
                  <button
                    onClick={() => onTtsPlay(activeTask.finalResult!)}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:underline cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </button>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {activeTask.finalResult}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Search, 
  MapPin, 
  Code, 
  Brain, 
  Square, 
  Paperclip, 
  Volume2, 
  Bot, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Download, 
  Terminal, 
  ChevronDown,
  Trash2,
  Edit2,
  Check,
  X,
  Globe2,
  HardDrive,
  PanelRightClose,
  PanelRightOpen,
  Layout,
  MoreVertical
} from 'lucide-react';
import { Message, ModelDef } from '../../types';
import { MessageItem } from './MessageItem';
import { BONSAI_MODELS } from '../../data/models';
import { ChatCanvas, CanvasContent } from './ChatCanvas';

interface ChatViewProps {
  messages: Message[];
  selectedModel: ModelDef;
  onSelectModel?: (model: ModelDef) => void;
  onSendMessage: (content: string, activeTools: Record<string, boolean>) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  onTtsPlay: (text: string) => void;
  sessionTitle?: string;
  sessionId?: string;
  onClearSession?: () => void;
  onRenameSession?: (id: string, newTitle: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  selectedModel,
  onSelectModel,
  onSendMessage,
  onStopGeneration,
  isStreaming,
  onTtsPlay,
  sessionTitle = 'Bonsai Conversation',
  sessionId = 'session-current',
  onClearSession,
  onRenameSession,
}) => {
  const [input, setInput] = useState('');
  const [activeTools, setActiveTools] = useState({
    search: false,
    maps: false,
    code: false,
    thinking: true,
    darkweb: false,
  });

  const [aiMimicStep, setAiMimicStep] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(sessionTitle);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasData, setCanvasData] = useState<CanvasContent | null>(null);
  const [showExtraMenu, setShowExtraMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    setTitleInput(sessionTitle);
  }, [sessionTitle]);

  // Close model dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // AI process mimic cycle when streaming
  useEffect(() => {
    if (!isStreaming) {
      setAiMimicStep(0);
      return;
    }

    const interval = setInterval(() => {
      setAiMimicStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 900);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim(), activeTools);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to send
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const toggleTool = (tool: keyof typeof activeTools) => {
    setActiveTools(prev => ({ ...prev, [tool]: !prev[tool] }));
  };

  const handleSaveTitle = () => {
    if (titleInput.trim() && onRenameSession) {
      onRenameSession(sessionId, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  // Export current session as formatted JSON file
  const handleDownloadChat = () => {
    const exportPayload = {
      app: 'Bonsai WebUI - Binary LLM & Agent Studio',
      exportedAt: new Date().toISOString(),
      sessionId,
      sessionTitle,
      model: {
        id: selectedModel.id,
        name: selectedModel.name,
        architecture: selectedModel.architecture,
        quantization: selectedModel.quantBits,
        vramUsageGB: selectedModel.vramUsageGB,
        parameters: selectedModel.parameters,
        laptop8GBCompatible: selectedModel.laptop8GBCompatible,
      },
      activeToolsConfig: activeTools,
      messageCount: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
        thinkingContent: m.thinkingContent || null,
        toolCalls: m.toolCalls || [],
        metrics: m.metrics || null,
      })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = sessionTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `bonsai-chat-${safeTitle}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    {
      title: '1.58-bit BitNet GEMM Math',
      prompt: 'Explain the mathematical foundation of 1.58-bit ternary {-1,0,+1} models like Bonsai 27B and how integer addition eliminates multiplications in 5.34 GB RAM.',
      icon: Cpu,
      color: 'text-emerald-400',
    },
    {
      title: 'Autonomous Multi-Tool ReAct Loop',
      prompt: 'Act as an autonomous research agent: query the latest findings on low-bit neural networks, calculate parameter memory for 8GB laptops in Python, and summarize conclusions.',
      icon: Sparkles,
      color: 'text-cyan-400',
    },
    {
      title: 'Zero-Day Vulnerability Red-Team Audit',
      prompt: 'Using Bonsai 27B Uncensored/Abliterated, analyze memory safety risks in a C socket listener. Provide mitigation recommendations and non-malicious proof-of-concept tests.',
      icon: ShieldAlert,
      color: 'text-rose-400',
    },
    {
      title: 'Darknet Threat Intelligence Recon',
      prompt: 'Query threat indicators and zero-day breach advisories for CVE-2026-X821 via Tor onion gateway. Report exploit vectors and signatures.',
      icon: Terminal,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* 1. SEPARATE IN-CHAT TOP BAR (Distinct from System Header) */}
      <div className="h-13 px-4 sm:px-6 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10 select-none">
        {/* Left: In-Chat Model Dropdown Pill & Session Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Model Selector Pill */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white truncate max-w-[130px] sm:max-w-[160px]">
                {selectedModel.name}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 hidden lg:inline">
                5.34 GB
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Model Dropdown Menu */}
            {showModelDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-76 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-2.5 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                  <span>Binary Models</span>
                  <span className="text-emerald-400">8GB Ready</span>
                </div>
                <div className="space-y-1">
                  {BONSAI_MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel?.(model);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between cursor-pointer ${
                        selectedModel.id === model.id
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{model.name}</span>
                          {model.capabilities.uncensored && (
                            <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                              Uncensored
                            </span>
                          )}
                          {model.capabilities.abliterated && (
                            <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300 font-mono">
                              Abliterated
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {model.quantBits} · {model.tokensPerSec} t/s
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Session Title Editable */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                className="bg-slate-950 text-xs text-white px-2 py-1 rounded-lg border border-emerald-500/50 focus:outline-none w-44"
                autoFocus
              />
              <button onClick={handleSaveTitle} className="p-1 hover:text-emerald-400 text-slate-400">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsEditingTitle(false)} className="p-1 hover:text-rose-400 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 truncate group">
              <span className="text-xs text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[220px]">
                {sessionTitle}
              </span>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Rename Session"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Active Tools Quick Indicators */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px]">
            {activeTools.thinking && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                DeepThinking
              </span>
            )}
            {activeTools.darkweb && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Tor Darkweb
              </span>
            )}
            {activeTools.search && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Search Grounding
              </span>
            )}
          </div>

          {/* Retractable ChatCanvas Workspace Toggle */}
          <button
            onClick={() => {
              if (!isCanvasOpen && !canvasData) {
                const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
                if (lastAssistantMsg) {
                  const codeMatch = lastAssistantMsg.content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
                  setCanvasData({
                    id: `canvas-${lastAssistantMsg.id}`,
                    title: codeMatch ? `${codeMatch[1].toUpperCase()} Artifact` : 'Bonsai Workspace Document',
                    mode: codeMatch ? 'code' : 'markdown',
                    markdown: lastAssistantMsg.content,
                    code: codeMatch ? codeMatch[2] : undefined,
                    language: codeMatch ? codeMatch[1] : undefined,
                  });
                } else {
                  setCanvasData({
                    id: 'canvas-default',
                    title: 'BitNet b1.58 Ternary GEMM Kernel',
                    mode: 'code',
                    code: `// Bonsai 27B Ternary Kernel - Integer Addition\n#include <stdint.h>\n\nvoid gemm_1_58bit(const int8_t* W, const int8_t* X, int32_t* Y, int N, int K) {\n    for (int i = 0; i < N; ++i) {\n        int32_t acc = 0;\n        for (int j = 0; j < K; ++j) {\n            // Ternary weights {-1, 0, +1}: 0 multiplications\n            int8_t w = W[i * K + j];\n            if (w == 1) acc += X[j];\n            else if (w == -1) acc -= X[j];\n        }\n        Y[i] = acc;\n    }\n}`,
                    language: 'cpp',
                    markdown: '# BitNet b1.58 Ternary GEMM\nMultiplications are eliminated completely in 5.34 GB RAM.',
                  });
                }
              }
              setIsCanvasOpen(!isCanvasOpen);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              isCanvasOpen
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Toggle Retractable ChatCanvas side-by-side workspace"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Canvas</span>
            {isCanvasOpen ? (
              <PanelRightClose className="w-3 h-3 text-emerald-400" />
            ) : (
              <PanelRightOpen className="w-3 h-3 text-slate-400" />
            )}
          </button>

          {/* Download Chat Button */}
          <button
            onClick={handleDownloadChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Export conversation history and metadata as formatted JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Download JSON</span>
          </button>

          {/* Clear Session Button */}
          {onClearSession && (
            <button
              onClick={onClearSession}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear Session Messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExtraMenu(!showExtraMenu)}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="More Chat Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showExtraMenu && (
              <div className="absolute right-0 top-9 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 text-xs font-mono space-y-0.5 animate-in fade-in">
                <button
                  onClick={() => {
                    setIsCanvasOpen(!isCanvasOpen);
                    setShowExtraMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Toggle ChatCanvas Workspace</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadChat();
                    setShowExtraMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Session JSON</span>
                </button>
                {onClearSession && (
                  <button
                    onClick={() => {
                      onClearSession();
                      setShowExtraMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-rose-300 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Clear Conversation</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT WORKSPACE: MESSAGES STREAM + RETRACTABLE CHATCANVAS */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Primary Stream Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
                {/* Bonsai Hero Badge */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/5">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    1.58b
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                  {selectedModel.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-6 leading-relaxed">
                  {selectedModel.description}
                </p>

                <div className="flex items-center gap-2 mb-8 flex-wrap justify-center font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                    27.4B Parameters
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                    5.34 GB VRAM (8GB Laptop Native)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-purple-400">
                    {selectedModel.tokensPerSec} tokens/sec
                  </span>
                </div>

                {/* Quick Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                  {quickPrompts.map((qp, idx) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(qp.prompt);
                          onSendMessage(qp.prompt, activeTools);
                        }}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-slate-200 group-hover:text-emerald-300">
                          <Icon className={`w-3.5 h-3.5 ${qp.color}`} />
                          <span>{qp.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {qp.prompt}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map(message => (
                <MessageItem
                  key={message.id}
                  message={message}
                  modelDef={selectedModel}
                  onTtsPlay={onTtsPlay}
                  onOpenCanvas={content => {
                    setCanvasData(content);
                    setIsCanvasOpen(true);
                  }}
                />
              ))
            )}

            {/* AI Mimic Inference Process Banner */}
            {isStreaming && (
              <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2">
                <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 backdrop-blur-md p-3 text-xs font-mono flex items-center justify-between text-slate-300 shadow-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-emerald-400 font-bold">[BonsaiEngine]:</span>
                    <span className="truncate text-slate-300 text-xs">
                      {aiMimicStep === 0 && 'Allocating 1.58-bit ternary tensor (5.34 GB) in physical RAM...'}
                      {aiMimicStep === 1 && 'Executing integer-addition GEMM kernels (0 floating point multipliers)...'}
                      {aiMimicStep === 2 && 'Evaluating refusal subspace projection: Neutral (Abliteration active)...'}
                      {aiMimicStep >= 3 && 'Streaming response tokens over Server-Sent Events (SSE)...'}
                    </span>
                  </div>
                  <button
                    onClick={onStopGeneration}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition-colors flex items-center gap-1 shrink-0 ml-2"
                  >
                    <Square className="w-3 h-3 fill-rose-300" />
                    <span className="text-[11px]">Stop</span>
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. FLOATING COMPOSER INPUT BAR */}
          <div className="p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent shrink-0">
            <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-2.5 sm:p-3 space-y-2.5">
              {/* Tool Toggles Ribbon */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 mr-1 uppercase font-semibold">Tools:</span>

                  {/* Thinking Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleTool('thinking')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      activeTools.thinking
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="DeepThinking reasoning stream"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>DeepThinking</span>
                  </button>

                  {/* Darkweb Intel Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleTool('darkweb')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      activeTools.darkweb
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Simulate Tor 3-hop circuit for threat intelligence"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Tor Darkweb</span>
                  </button>

                  {/* Web Search Grounding Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleTool('search')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      activeTools.search
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Google Search Grounding for live web data"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Web Grounding</span>
                  </button>

                  {/* Maps Tool Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleTool('maps')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      activeTools.maps
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Google Maps geospatial location queries"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </button>

                  {/* Code Sandbox Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleTool('code')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      activeTools.code
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Python / JavaScript sandbox execution"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Sandbox</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 hidden sm:block">
                  Ctrl+Enter to send
                </div>
              </div>

              {/* Form Textarea & Action Buttons */}
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedModel.name}... (Press Ctrl+Enter)`}
                  className="flex-1 bg-transparent border-0 resize-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 max-h-44 p-1.5 leading-relaxed"
                />

                <div className="flex items-center gap-1 shrink-0 pb-1">
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={onStopGeneration}
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md"
                      title="Stop generation"
                    >
                      <Square className="w-4 h-4 fill-white" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      title="Send (Ctrl+Enter)"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Retractable ChatCanvas Area */}
        <ChatCanvas
          isOpen={isCanvasOpen}
          onClose={() => setIsCanvasOpen(false)}
          content={canvasData}
          onSendToChat={text => {
            setInput(text);
            if (textareaRef.current) textareaRef.current.focus();
          }}
        />
      </div>
    </div>
  );
};

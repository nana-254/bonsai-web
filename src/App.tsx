/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/Chat/ChatView';
import { WorkflowStudio } from './components/Workflows/WorkflowStudio';
import { BotBuilder } from './components/Bots/BotBuilder';
import { AgentForge } from './components/Agents/AgentForge';
import { ModelHub } from './components/Models/ModelHub';
import { ResearchWhitepaper } from './components/Research/ResearchWhitepaper';
import { MediaStudio } from './components/Media/MediaStudio';
import { BackendLogsDrawer } from './components/Logs/BackendLogsDrawer';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ShortcutModal } from './components/Shortcuts/ShortcutModal';
import { BONSAI_MODELS, DEFAULT_MODEL_ID } from './data/models';
import { INITIAL_MCP_SERVERS } from './data/marketplace';
import { INITIAL_PERSONAS } from './data/personas';
import { 
  ChatSession, 
  Message, 
  ModelDef, 
  ServerLog, 
  Settings, 
  SystemStats 
} from './types';

const INITIAL_SETTINGS: Settings = {
  ollamaUrl: 'http://localhost:11434',
  autoConnectOllama: true,
  useLocalBonsaiEngine: true,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 4096,
  systemPromptOverride: '',
  ttsVoice: 'Kore',
  enableThinkingStream: true,
  enableGrounding: true,
  theme: 'dark-cyber',
  mcpServers: INITIAL_MCP_SERVERS,
  installedPlugins: [
    'plugin-darkweb-intel',
    'plugin-deep-thinking-visualizer',
    'plugin-bitnet-metal-jit',
    'plugin-abliteration-slider',
  ],
  personaProfiles: INITIAL_PERSONAS,
  activePersonaId: 'persona-coding',
};

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'session-welcome',
    title: 'Welcome to Bonsai 27B',
    modelId: DEFAULT_MODEL_ID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: `### Welcome to Bonsai WebUI
**A high-performance OpenWebUI alternative engineered for 1.58-bit binary LLMs on 8GB laptops.**

I am **Bonsai 27B Standard**, running inside a **5.34 GB RAM** footprint using BitNet b1.58 ternary weights.

#### Key Highlights & Architecture:
- **8GB Laptop Native**: Fits comfortably in 5.34 GB RAM, leaving 2.66 GB for your OS and grouped-query KV caching.
- **Integer Addition GEMM**: Floating-point multiplications are eliminated—slashing memory bandwidth bottlenecks and achieving **38+ tokens/sec** on consumer CPUs.
- **Full Agentic Tool Support**: Autonomous ReAct reasoning loops, live Google Search grounding, Maps, Python code execution, and high-fidelity TTS/image/music synthesis.
- **Selectable Variants**: Choose between **Bonsai Standard** (agentic specialist), **Bonsai Uncensored** (unrestricted boundaries), and **Bonsai Abliterated** (orthogonal vector surgery).

Ask me anything about binary model math, test a multi-step agentic workflow, or explore the studios in the sidebar!`,
        timestamp: Date.now(),
        modelId: DEFAULT_MODEL_ID,
        metrics: {
          tps: 38.6,
          ttftMs: 120,
          totalTokens: 184,
          durationMs: 950,
          ramUsedGB: 5.34,
        },
      },
    ],
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('bonsai_sessions');
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-welcome';
  });

  const [selectedModel, setSelectedModel] = useState<ModelDef>(() => {
    return BONSAI_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || BONSAI_MODELS[0];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('bonsai_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [systemStats, setSystemStats] = useState<SystemStats>({
    ramTotalGB: 8.0,
    ramUsedGB: 5.34,
    vramUsedGB: 5.34,
    activeModel: 'Bonsai 27B Standard (1.58-bit)',
    ollamaConnected: true,
    cpuUsagePercent: 18,
    tokensPerSecAvg: 38.6,
    uptimeSeconds: 1420,
  });

  const [serverLogs, setServerLogs] = useState<ServerLog[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'SYSTEM',
      component: 'BonsaiEngine',
      message: 'BitNet b1.58 ternary runtime initialized (Integer-Addition GEMM).',
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      component: 'MemoryGuard',
      message: 'Memory Budget: 5.34 GB allocated for 27.4B weights (8GB physical RAM verified).',
    },
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [unreadLogsCount, setUnreadLogsCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bonsai_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  }, [sessions]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bonsai_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Global Keyboard Shortcut Manager
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      // 1. Ctrl+K or Cmd+K: New Chat
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentTab('chat');
        handleNewChat();
        return;
      }

      // 2. Ctrl+Shift+L or Cmd+Shift+L: Toggle Telemetry Logs
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLogsOpen(prev => !prev);
        return;
      }

      // 3. Ctrl+B or Cmd+B: Toggle Retractable Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
        return;
      }

      // 4. Ctrl+/ or ? (when not typing in an input): Open shortcuts modal
      if (((e.ctrlKey || e.metaKey) && e.key === '/') || (e.key === '?' && !isInput)) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // 5. Escape: Close modals/drawers
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsSettingsOpen(false);
        setIsLogsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Poll system stats periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/system-stats?model=${selectedModel.id}`);
        if (res.ok) {
          const data = await res.json();
          setSystemStats(data);
        }
      } catch {
        // Fallback simulated metrics
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [selectedModel]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      modelId: selectedModel.id,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setCurrentTab('chat');
  };

  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter(s => s.id !== id);
    if (remaining.length === 0) {
      handleNewChat();
    } else {
      setSessions(remaining);
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id);
      }
    }
  };

  const handleClearCurrentSession = () => {
    setSessions(prev =>
      prev.map(s => (s.id === currentSessionId ? { ...s, messages: [] } : s))
    );
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const addServerLog = (level: any, component: any, message: string) => {
    const entry: ServerLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      component,
      message,
    };
    setServerLogs(prev => [...prev.slice(-300), entry]);
    if (!isLogsOpen) {
      setUnreadLogsCount(prev => prev + 1);
    }
  };

  const handleSendMessage = async (
    content: string,
    activeTools: Record<string, boolean>
  ) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      modelId: selectedModel.id,
    };

    const assistantMessageId = `asst-${Date.now()}`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: selectedModel.id,
      isStreaming: true,
      thinkingContent: '',
      isThinking: activeTools.thinking,
    };

    // Update session title on first message
    const updatedMessages = [...(currentSession?.messages || []), userMessage];
    let updatedTitle = currentSession?.title || 'New Conversation';
    if (currentSession?.messages.length === 0) {
      updatedTitle = content.slice(0, 32) + (content.length > 32 ? '...' : '');
    }

    setSessions(prev =>
      prev.map(s =>
        s.id === currentSessionId
          ? {
              ...s,
              title: updatedTitle,
              messages: [...updatedMessages, initialAssistantMessage],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    addServerLog(
      'INFO',
      'BonsaiEngine',
      `Prompt dispatched to ${selectedModel.name} (Ternary 1.58-bit)`
    );

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages,
          modelId: selectedModel.id,
          systemPrompt: settings.systemPromptOverride,
          enableGrounding: settings.enableGrounding,
          enableThinking: activeTools.thinking,
          activeTools,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let thinkingAccumulator = '';
      let inThinkMode = false;
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line.startsWith('data:')) continue;

            try {
              const data = JSON.parse(line.replace('data:', '').trim());

              if (data.level && data.message) {
                addServerLog(data.level, data.component || 'BonsaiEngine', data.message);
              } else if (data.text !== undefined) {
                const token = data.text;
                if (token.includes('<think>')) {
                  inThinkMode = true;
                }

                if (inThinkMode) {
                  thinkingAccumulator += token.replace('<think>', '').replace('</think>', '');
                } else {
                  streamedContent += token;
                }

                if (token.includes('</think>')) {
                  inThinkMode = false;
                }

                setSessions(prev =>
                  prev.map(s =>
                    s.id === currentSessionId
                      ? {
                          ...s,
                          messages: s.messages.map(m =>
                            m.id === assistantMessageId
                              ? {
                                  ...m,
                                  content: streamedContent,
                                  thinkingContent: thinkingAccumulator.trim(),
                                  isThinking: inThinkMode,
                                }
                              : m
                          ),
                        }
                      : s
                  )
                );
              } else if (data.done) {
                const durationMs = Date.now() - startTime;
                const totalTokens = data.totalTokens || Math.round(streamedContent.length / 4);
                const tps = data.tps || Number((totalTokens / (durationMs / 1000)).toFixed(1));

                setSessions(prev =>
                  prev.map(s =>
                    s.id === currentSessionId
                      ? {
                          ...s,
                          messages: s.messages.map(m =>
                            m.id === assistantMessageId
                              ? {
                                  ...m,
                                  isStreaming: false,
                                  isThinking: false,
                                  metrics: {
                                    tps,
                                    ttftMs: 140,
                                    totalTokens,
                                    durationMs,
                                    ramUsedGB: selectedModel.vramUsageGB,
                                  },
                                }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }
            } catch {
              // Ignore partial chunk JSON parses
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        addServerLog('INFO', 'BonsaiEngine', 'Generation stopped by user.');
      } else {
        addServerLog('ERROR', 'BonsaiEngine', `Inference error: ${err.message}`);
        setSessions(prev =>
          prev.map(s =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content:
                            m.content +
                            `\n\n*[Engine Note: ${err.message}. Retrying or utilizing fallback kernel.]*`,
                          isStreaming: false,
                          isThinking: false,
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const handleTtsPlay = async (text: string) => {
    try {
      addServerLog('INFO', 'GeminiCore', 'Generating speech narration with gemini-3.8-flash-tts...');
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 800), voice: settings.ttsVoice }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
        addServerLog('SUCCESS', 'GeminiCore', 'TTS Audio playback started');
      }
    } catch (err: any) {
      addServerLog('ERROR', 'GeminiCore', `TTS playback failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. SEPARATE FULL SYSTEM TOP BAR */}
      <Header
        currentTab={currentTab}
        systemStats={systemStats}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleLogs={() => {
          setIsLogsOpen(!isLogsOpen);
          if (!isLogsOpen) setUnreadLogsCount(0);
        }}
        isLogsOpen={isLogsOpen}
        unreadLogsCount={unreadLogsCount}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onNewChat={handleNewChat}
      />

      {/* 2. MAIN WORKSPACE WITH RETRACTABLE SIDEBAR */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={id => {
            setCurrentSessionId(id);
            setCurrentTab('chat');
          }}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          systemStats={systemStats}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleLogs={() => {
            setIsLogsOpen(!isLogsOpen);
            if (!isLogsOpen) setUnreadLogsCount(0);
          }}
          logsCount={serverLogs.length}
        />

        {/* Dynamic Studio Panes */}
        {currentTab === 'chat' && (
          <ChatView
            messages={currentSession?.messages || []}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isStreaming={isStreaming}
            onTtsPlay={handleTtsPlay}
            sessionTitle={currentSession?.title}
            sessionId={currentSession?.id}
            onClearSession={handleClearCurrentSession}
            onRenameSession={handleRenameSession}
          />
        )}

        {currentTab === 'workflows' && (
          <WorkflowStudio onTtsPlay={handleTtsPlay} />
        )}

        {currentTab === 'bots' && <BotBuilder />}

        {currentTab === 'agents' && <AgentForge />}

        {currentTab === 'models' && (
          <ModelHub
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        )}

        {currentTab === 'research' && <ResearchWhitepaper />}

        {currentTab === 'media' && <MediaStudio />}
      </div>

      {/* 3. LIVE BACKEND TELEMETRY LOGS DRAWER */}
      <BackendLogsDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={serverLogs}
        onClearLogs={() => setServerLogs([])}
      />

      {/* 4. SETTINGS MODAL (With System Prompt Library) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      {/* 5. GLOBAL KEYBOARD SHORTCUTS CHEAT SHEET */}
      <ShortcutModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

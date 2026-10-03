import React from 'react';
import { 
  Bot, 
  Terminal, 
  Settings as SettingsIcon, 
  Cpu, 
  Layers, 
  Activity, 
  ChevronDown, 
  Command, 
  Keyboard, 
  PanelLeftClose, 
  PanelLeft, 
  Radio, 
  Zap,
  HardDrive
} from 'lucide-react';
import { SystemStats } from '../types';

interface HeaderProps {
  currentTab: string;
  onOpenSettings: () => void;
  onToggleLogs: () => void;
  isLogsOpen: boolean;
  unreadLogsCount: number;
  systemStats: SystemStats;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenShortcuts: () => void;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSettings,
  onToggleLogs,
  isLogsOpen,
  unreadLogsCount,
  systemStats,
  isSidebarOpen,
  onToggleSidebar,
  onOpenShortcuts,
  onNewChat,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'chat':
        return 'Interactive Chat Studio';
      case 'workflows':
        return 'n8n Workflow Engine';
      case 'bots':
        return 'Bot Builder Studio';
      case 'agents':
        return 'Agent Forge Squads';
      case 'models':
        return '27B Model Hub & Benchmarks';
      case 'research':
        return 'Binary AI Research Whitepaper';
      case 'media':
        return 'Generative Media Studio';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Zone 1: Sidebar Toggle & Brand Lockup */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          title="Toggle Sidebar (Ctrl+B)"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-emerald-400" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        {/* Brand Wordmark with Neon Glow Accent */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/15">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-xs tracking-tighter">1.58b</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight text-white font-sans">
              Bonsai Studio
            </span>
            <span className="text-[10px] font-mono text-emerald-400 hidden md:inline">
              BitNet b1.58 • 8GB Native
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Context Breadcrumb & Quick Command Bar */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="text-slate-500">Workspace /</span>
          <span className="text-emerald-300 font-medium">{getTabTitle(currentTab)}</span>
        </div>

        {/* Command Trigger Bar */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer group"
          title="Quick Action / New Chat (Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
          <span className="text-[11px] font-sans">Quick Prompt</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-slate-700/60 text-[10px] font-mono text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Hardware Diagnostics & System Controls */}
      <div className="flex items-center gap-2">
        {/* Compact RAM Metric Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span>RAM:</span>
          <span className="text-emerald-400 font-semibold">{systemStats.ramUsedGB} GB</span>
          <span className="text-slate-500">/ 8 GB</span>
        </div>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          title="Keyboard Shortcuts (Ctrl+/)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Backend Logs Toggle Button */}
        <button
          onClick={onToggleLogs}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
            isLogsOpen
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Toggle Backend Telemetry (Ctrl+Shift+L)"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Telemetry</span>
          {unreadLogsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>

        {/* System Settings Modal Trigger */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          title="System Settings & System Prompt Library"
        >
          <SettingsIcon className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </header>
  );
};

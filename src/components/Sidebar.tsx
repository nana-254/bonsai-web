import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Pin, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Radio, 
  Cpu, 
  Check, 
  X,
  Network,
  Bot,
  Users,
  Layers,
  BookOpen,
  Music2,
  Terminal,
  Settings as SettingsIcon,
  Sparkles,
  Command,
  SlidersHorizontal,
  HardDrive
} from 'lucide-react';
import { ChatSession, SystemStats } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  systemStats: SystemStats;
  onOpenSettings: () => void;
  onToggleLogs: () => void;
  logsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onToggle,
  systemStats,
  onOpenSettings,
  onToggleLogs,
  logsCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const navItems = [
    { id: 'chat', label: 'Chat Studio', icon: MessageSquare, badge: 'Main' },
    { id: 'workflows', label: 'Workflow Studio', icon: Network, badge: 'n8n' },
    { id: 'bots', label: 'Bot Builder', icon: Bot, badge: 'Custom' },
    { id: 'agents', label: 'Agent Forge', icon: Users, badge: 'Multi' },
    { id: 'models', label: 'Model Benchmark', icon: Layers },
    { id: 'research', label: 'Binary Whitepaper', icon: BookOpen },
    { id: 'media', label: 'Generative Media', icon: Music2 },
  ];

  // Collapsed Icon-Rail State
  if (!isOpen) {
    return (
      <aside className="w-16 bg-slate-950/95 border-r border-slate-800/80 flex flex-col items-center py-3.5 shrink-0 z-20 backdrop-blur-xl transition-all duration-200 justify-between select-none">
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Expand Button */}
          <button
            onClick={onToggle}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Expand Sidebar (Ctrl+B)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* New Chat Primary Action */}
          <button
            onClick={() => {
              onSelectTab('chat');
              onNewChat();
            }}
            className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            title="New Chat (Ctrl+K)"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="w-8 h-[1px] bg-slate-800 my-1" />

          {/* Icon-Only Nav Items */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`p-2.5 rounded-xl transition-all relative group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-400 rounded-r" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsed Footer Icons */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onToggleLogs}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors relative"
            title="Backend Telemetry (Ctrl+Shift+L)"
          >
            <Terminal className="w-4 h-4" />
            {logsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="System Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // Expanded Full Retractable Sidebar
  return (
    <aside className="w-68 bg-slate-950/95 border-r border-slate-800/80 flex flex-col shrink-0 h-[calc(100vh-3.5rem)] z-20 backdrop-blur-xl select-none transition-all duration-200">
      {/* Top Header & New Chat */}
      <div className="p-3 border-b border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight">Navigation & Studios</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Collapse Sidebar (Ctrl+B)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <button
          onClick={() => {
            onSelectTab('chat');
            onNewChat();
          }}
          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/10 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-[10px] font-mono text-emerald-200 opacity-80 group-hover:opacity-100">
            Ctrl+K
          </kbd>
        </button>

        {/* Studios & Navigation Switcher */}
        <div className="space-y-0.5 pt-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border border-emerald-500/30 text-emerald-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations Section Header & Search */}
      <div className="px-3 pt-3 pb-1 flex flex-col gap-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Session History</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-medium">
            {sessions.length} chats
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 shadow-inner"
          />
        </div>
      </div>

      {/* Session History Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-sans">
            No conversations found
          </div>
        ) : (
          filteredSessions.map(session => {
            const isSelected = session.id === currentSessionId && currentTab === 'chat';
            const isEditing = session.id === editingId;

            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onSelectTab('chat');
                }}
                className={`group relative flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900/90 text-emerald-300 font-medium border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-6">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}
                  />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="bg-slate-800 text-xs text-white px-1.5 py-0.5 rounded border border-emerald-500/50 focus:outline-none w-32"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{session.title}</span>
                  )}
                </div>

                {/* Hover Action Controls */}
                <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 pl-1 rounded">
                  {isEditing ? (
                    <>
                      <button
                        onClick={e => saveRename(session.id, e)}
                        className="p-1 hover:text-emerald-400"
                        title="Save"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="p-1 hover:text-rose-400"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={e => startRename(session, e)}
                        className="p-1 hover:text-slate-200"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status & Hardware Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl text-xs space-y-2.5">
        {/* Memory Guard Gauge */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/90 text-[11px] font-mono text-slate-300 space-y-2 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span className="text-slate-300 font-medium">8GB Laptop RAM:</span>
            </span>
            <span className="text-emerald-400 font-semibold">{systemStats.ramUsedGB} GB / 8 GB</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full"
              style={{ width: `${(systemStats.ramUsedGB / systemStats.ramTotalGB) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between font-mono">
            <span>BitNet: 5.34 GB</span>
            <span className="text-emerald-400 font-semibold">Native 8GB Fit</span>
          </div>
        </div>

        {/* Quick Footer Action Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <button
            onClick={onToggleLogs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm"
            title="Toggle Logs Drawer (Ctrl+Shift+L)"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono">Telemetry</span>
            {logsCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-sm"
            title="Settings & Persona Library"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

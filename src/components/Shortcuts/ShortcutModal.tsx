import React from 'react';
import { X, Command, Keyboard, Zap } from 'lucide-react';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutModal: React.FC<ShortcutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keyCombo: ['Ctrl', 'K'], macCombo: ['⌘', 'K'], description: 'Start a new conversation session' },
    { keyCombo: ['Ctrl', 'Enter'], macCombo: ['⌘', '↵'], description: 'Send prompt / message to active model' },
    { keyCombo: ['Ctrl', 'Shift', 'L'], macCombo: ['⌘', '⇧', 'L'], description: 'Toggle backend telemetry & execution logs' },
    { keyCombo: ['Ctrl', 'B'], macCombo: ['⌘', 'B'], description: 'Toggle retractable sidebar' },
    { keyCombo: ['Ctrl', '/'], macCombo: ['⌘', '/'], description: 'Open keyboard shortcuts cheat sheet' },
    { keyCombo: ['Esc'], macCombo: ['Esc'], description: 'Close modals, drawers, and overlay panels' },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-slate-400">Accelerate your workflow with global keyboard controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-3 font-mono text-xs">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/30 transition-colors"
            >
              <span className="text-slate-300 font-sans text-xs">{sc.description}</span>
              <div className="flex items-center gap-1">
                {sc.keyCombo.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-emerald-400 text-[11px] font-semibold shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active across all studio views</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-sans text-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

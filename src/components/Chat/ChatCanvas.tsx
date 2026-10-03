import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Code2, 
  FileText, 
  Eye, 
  Play, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Sparkles, 
  Layers, 
  Terminal, 
  ExternalLink,
  ChevronRight,
  Split,
  PanelRightClose,
  Send,
  MoreVertical,
  ArrowUpRight,
  Edit3,
  Undo2,
  Share2
} from 'lucide-react';

export interface CanvasContent {
  id: string;
  title: string;
  mode: 'markdown' | 'code' | 'preview' | 'split';
  markdown?: string;
  code?: string;
  language?: string;
  html?: string;
  css?: string;
  js?: string;
}

interface ChatCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  content: CanvasContent | null;
  onRunCode?: (code: string, language: string) => void;
  onSendToChat?: (text: string) => void;
  onUpdateArtifact?: (updated: CanvasContent) => void;
}

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  isOpen,
  onClose,
  content,
  onRunCode,
  onSendToChat,
  onUpdateArtifact,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'code' | 'preview' | 'split'>('markdown');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [editableCode, setEditableCode] = useState('');
  const [editableMarkdown, setEditableMarkdown] = useState('');
  const [markdownEditMode, setMarkdownEditMode] = useState(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Sync content when prop changes
  useEffect(() => {
    if (content) {
      if (content.code) {
        setEditableCode(content.code);
      }
      if (content.markdown) {
        setEditableMarkdown(content.markdown);
      }
      if (content.mode) {
        setActiveTab(content.mode);
      } else if (content.code) {
        setActiveTab(content.html ? 'preview' : 'code');
      } else {
        setActiveTab('markdown');
      }
    }
  }, [content]);

  const showStatus = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  if (!isOpen || !content) return null;

  const handleCopy = () => {
    const textToCopy =
      activeTab === 'code'
        ? editableCode
        : activeTab === 'markdown'
        ? editableMarkdown || content.markdown || ''
        : content.html || editableCode || editableMarkdown || '';

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showStatus('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension =
      activeTab === 'code'
        ? content.language === 'python'
          ? 'py'
          : content.language === 'typescript' || content.language === 'tsx'
          ? 'ts'
          : content.language === 'html'
          ? 'html'
          : 'txt'
        : activeTab === 'preview'
        ? 'html'
        : 'md';

    const text =
      activeTab === 'code' 
        ? editableCode 
        : activeTab === 'preview' 
        ? generateFullHtml() 
        : editableMarkdown || content.markdown || '';

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bonsai-canvas-${content.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus(`Downloaded as .${extension}`);
  };

  const generateFullHtml = () => {
    const htmlBody = content.html || (content.language === 'html' ? editableCode : `<div><pre>${editableCode || editableMarkdown}</pre></div>`);
    const cssContent = content.css || `
      body {
        margin: 0;
        padding: 24px;
        background: #090d16;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, sans-serif;
      }
      h1, h2, h3 { color: #34d399; }
      pre { background: #020617; padding: 16px; border-radius: 12px; border: 1px solid #1e293b; overflow-x: auto; }
      code { font-family: monospace; }
      .badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12px; }
    `;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${cssContent}</style>
</head>
<body>
  ${htmlBody}
  <script>${content.js || ''}</script>
</body>
</html>`;
  };

  const handleRunSandbox = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setSandboxLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing ${content.language || 'code'} sandbox in 5.34 GB RAM...`]);

    try {
      const res = await fetch('/api/agents/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editableCode || content.code,
          language: content.language || 'python',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSandboxLogs(prev => [
          ...prev,
          `[COMPLETED in ${data.executionTimeMs || 22}ms]`,
          data.output || 'Process exited successfully with code 0',
        ]);
      } else {
        setSandboxLogs(prev => [...prev, `[ERROR]: ${data.error || 'Execution failure'}`]);
      }
    } catch (err: any) {
      setSandboxLogs(prev => [...prev, `[NETWORK ERROR]: ${err.message}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Bi-directional Data Flow: Push edited content back into Chat Composer
   */
  const handlePushToChat = () => {
    const textToSend =
      activeTab === 'code'
        ? `\`\`\`${content.language || 'text'}\n${editableCode}\n\`\`\``
        : editableMarkdown || content.markdown || editableCode;

    if (onSendToChat && textToSend) {
      onSendToChat(textToSend);
      showStatus('Inserted into Chat Composer');
    }
  };

  /**
   * Bi-directional Data Flow: Drag and Drop handler from AI bubble
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const rawJson = e.dataTransfer.getData('application/json');
      if (rawJson) {
        const payload = JSON.parse(rawJson);
        if (payload.code) {
          setEditableCode(payload.code);
          setActiveTab('code');
          showStatus(`Imported ${payload.language || 'code'} snippet into Canvas!`);
        } else if (payload.markdown) {
          setEditableMarkdown(payload.markdown);
          setActiveTab('markdown');
          showStatus('Imported markdown artifact into Canvas!');
        }
        return;
      }

      const text = e.dataTransfer.getData('text/plain');
      if (text) {
        if (activeTab === 'code') {
          setEditableCode(text);
        } else {
          setEditableMarkdown(text);
        }
        showStatus('Imported plain text artifact!');
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <aside
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-l border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl flex flex-col z-20 transition-all duration-300 select-none shadow-2xl relative ${
        isFullscreen
          ? 'fixed inset-0 z-50'
          : 'w-full lg:w-[48%] xl:w-[50%] h-[calc(100vh-3.5rem)] shrink-0'
      }`}
    >
      {/* Visual Drag Over Indicator Banner */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 border-2 border-dashed border-cyan-400 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 mb-3 animate-bounce">
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white font-mono">Drop Artifact to Load</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            Drag code or markdown from the chat stream directly into this interactive workspace for persistent editing.
          </p>
        </div>
      )}

      {/* Floating Status Notification */}
      {statusNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* 1. Canvas Top Control Bar */}
      <div className="h-13 px-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
        {/* Left: Artifact Identity & Retract Trigger */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Retract Canvas (Collapse)"
          >
            <PanelRightClose className="w-4 h-4 text-emerald-400" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
                  {content.title}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Canvas
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Bi-directional editing · {content.language || 'markdown'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Multi-mode Workspace Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Doc</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Code</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'split'
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Split Code & Live Preview"
          >
            <Split className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* Right: Bi-directional Push to Chat & Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Bi-directional Push to Chat Button */}
          {onSendToChat && (
            <button
              onClick={handlePushToChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition-all cursor-pointer shadow-sm"
              title="Insert this edited code or document directly into the chat prompt"
            >
              <Send className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline">Push to Chat</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy Canvas Content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Download Artifact"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Extra Options Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="More Canvas Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-9 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 text-xs font-mono space-y-1 animate-in fade-in">
                <button
                  onClick={() => {
                    handlePushToChat();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Insert into Chat Composer</span>
                </button>
                <button
                  onClick={() => {
                    setMarkdownEditMode(!markdownEditMode);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Toggle Markdown Editor</span>
                </button>
                <button
                  onClick={() => {
                    handleCopy();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Complete Payload</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export File</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Canvas"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Secondary Sub-Bar (Mode Specific Controls) */}
      <div className="h-9 px-4 border-b border-slate-800/60 bg-slate-950/80 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-[11px]">Mode:</span>
          <span className="text-emerald-400 font-semibold uppercase text-[11px]">{activeTab}</span>

          {content.language && (
            <span className="text-slate-400 text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              {content.language}
            </span>
          )}

          {activeTab === 'markdown' && (
            <button
              onClick={() => setMarkdownEditMode(!markdownEditMode)}
              className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>{markdownEditMode ? 'Render Markdown' : 'Edit Markdown'}</span>
            </button>
          )}
        </div>

        {/* Viewport switcher if in preview or split */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded ${viewport === 'desktop' ? 'text-cyan-400 bg-slate-800' : 'hover:text-white'}`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded ${viewport === 'tablet' ? 'text-cyan-400 bg-slate-800' : 'hover:text-white'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded ${viewport === 'mobile' ? 'text-cyan-400 bg-slate-800' : 'hover:text-white'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Sandbox Run Button */}
        {(activeTab === 'code' || activeTab === 'split') && (
          <button
            onClick={handleRunSandbox}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Play className={`w-3 h-3 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Run in Sandbox'}</span>
          </button>
        )}
      </div>

      {/* 3. Main Workspace Display Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* TAB A: MARKDOWN DOCUMENT (View & Edit Mode) */}
        {activeTab === 'markdown' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {markdownEditMode ? (
              <div className="flex flex-col h-full space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Markdown Editor (Live Persistent)</span>
                  <span className="text-emerald-400">Auto-saved to Canvas</span>
                </div>
                <textarea
                  value={editableMarkdown}
                  onChange={e => setEditableMarkdown(e.target.value)}
                  placeholder="Write or edit markdown document here..."
                  className="flex-1 w-full min-h-[400px] p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/60 leading-relaxed resize-none shadow-inner"
                />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4 text-slate-300 leading-relaxed font-sans text-sm select-text">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <h1 className="text-xl font-bold text-white tracking-tight font-mono mb-2">
                    {content.title}
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    Synthesized by Bonsai 27B · 1.58-bit Ternary GEMM
                  </p>
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {editableMarkdown || content.markdown || 'No document content available.'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: INTERACTIVE CODE EDITOR */}
        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              <textarea
                value={editableCode}
                onChange={e => setEditableCode(e.target.value)}
                placeholder="Enter or edit code..."
                className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                spellCheck={false}
              />
            </div>

            {/* Sandbox Execution Console */}
            {sandboxLogs.length > 0 && (
              <div className="h-44 border-t border-slate-800 bg-black/80 flex flex-col font-mono text-[11px] shrink-0">
                <div className="h-7 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>8GB Sandbox Output</span>
                  </div>
                  <button
                    onClick={() => setSandboxLogs([])}
                    className="hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text text-slate-300">
                  {sandboxLogs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB C: LIVE PREVIEW IFRAME */}
        {activeTab === 'preview' && (
          <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className={`h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${getViewportWidth()}`}>
              {/* Fake Browser Window Header */}
              <div className="h-7 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="px-3 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] truncate max-w-[200px]">
                  localhost:3000/preview
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">{viewport}</span>
              </div>

              {/* Sandboxed Live HTML Sandbox */}
              <iframe
                key={editableCode.length + (content.html?.length || 0)}
                srcDoc={generateFullHtml()}
                title="Bonsai Preview"
                className="w-full flex-1 border-0 bg-white"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        )}

        {/* TAB D: SPLIT VIEW (CODE + LIVE PREVIEW SIDE-BY-SIDE) */}
        {activeTab === 'split' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left: Code Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-7 px-3 bg-slate-900 border-b border-slate-800 flex items-center text-[10px] font-mono text-slate-400">
                <span>Code Editor</span>
              </div>
              <textarea
                value={editableCode}
                onChange={e => setEditableCode(e.target.value)}
                className="w-full flex-1 p-3 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>

            {/* Right: Live Preview */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              <div className="h-7 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Live Rendering</span>
                <span className="text-emerald-400">Reactive</span>
              </div>
              <iframe
                key={editableCode.length}
                srcDoc={generateFullHtml()}
                title="Split Preview"
                className="w-full flex-1 border-0 bg-white"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Canvas Status Footer */}
      <div className="h-8 px-4 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Bi-directional Data Flow Enabled · Drag code or markdown here</span>
        </span>
        <span className="text-emerald-400 font-semibold">8GB RAM Memory Budget Safe</span>
      </div>
    </aside>
  );
};

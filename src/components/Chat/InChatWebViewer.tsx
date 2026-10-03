import React, { useState } from 'react';
import { X, ExternalLink, Code2, Globe, RefreshCw, Monitor, Tablet, Smartphone, Copy, Check } from 'lucide-react';

interface InChatWebViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
}

export const InChatWebViewer: React.FC<InChatWebViewerProps> = ({
  isOpen,
  onClose,
  title = 'Interactive Web Artifact Preview',
  htmlCode = '<h1>Bonsai 27B Artifact</h1><p>Interactive web canvas rendering.</p>',
  cssCode = 'body { font-family: system-ui, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; } h1 { color: #34d399; }',
  jsCode = '// Interactive script',
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const combinedDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch (e) {
      console.error(e);
    }
  </script>
</body>
</html>
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(combinedDoc.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-xl';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white tracking-tight truncate max-w-xs">{title}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sandboxed IFrame
            </span>
          </div>

          {/* Viewport & View Mode Controls */}
          <div className="flex items-center gap-2 font-mono">
            {/* Desktop / Tablet / Mobile Toggle */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1 rounded ${viewportMode === 'desktop' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1 rounded ${viewportMode === 'tablet' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1 rounded ${viewportMode === 'mobile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preview vs Source Code Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${activeTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Source Code
              </button>
            </div>

            <button
              onClick={() => setKey(prev => prev + 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Reload Frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 bg-slate-950/70 p-3 sm:p-6 overflow-auto flex items-center justify-center">
          {activeTab === 'preview' ? (
            <div className={`h-full bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden transition-all duration-200 flex flex-col ${getViewportWidth()}`}>
              <iframe
                key={key}
                srcDoc={combinedDoc}
                title="Web Artifact Sandbox"
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0 bg-slate-900"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-auto font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap">{combinedDoc.trim()}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

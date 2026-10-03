import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Volume2, 
  Copy, 
  Check, 
  Cpu, 
  Search, 
  MapPin, 
  Code, 
  Music, 
  Image as ImageIcon,
  Play,
  Pause,
  Download,
  ShieldAlert,
  Globe,
  FileText,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreVertical,
  Send
} from 'lucide-react';
import { Message, ModelDef } from '../../types';
import { CodeBlock } from './CodeBlock';
import { DeepThinkingViewer } from './DeepThinkingViewer';
import { InChatMapsCard } from './InChatMapsCard';
import { InChatWebViewer } from './InChatWebViewer';
import { CanvasContent } from './ChatCanvas';

interface MessageItemProps {
  message: Message;
  modelDef?: ModelDef;
  onRunCode?: (code: string, language: string) => void;
  onTtsPlay?: (text: string) => void;
  onRegenerate?: () => void;
  onOpenCanvas?: (content: CanvasContent) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  modelDef,
  onRunCode,
  onTtsPlay,
  onRegenerate,
  onOpenCanvas,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);
  const [isWebViewerOpen, setIsWebViewerOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = (url: string) => {
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play();
      setAudioElement(audio);
      setIsPlayingAudio(true);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([message.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bonsai-response-${message.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if content contains HTML or web code that can be previewed in WebViewer
  const hasHtmlContent = /```(html|xml|svg|jsx|tsx|css)/i.test(message.content) || /<(div|html|body|svg|section|h1|h2|style|button)/i.test(message.content);

  // Extract HTML/CSS snippet for the web viewer
  const extractCodeForViewer = () => {
    const htmlMatch = message.content.match(/```html([\s\S]*?)```/i);
    const cssMatch = message.content.match(/```css([\s\S]*?)```/i);
    const jsMatch = message.content.match(/```(javascript|js)([\s\S]*?)```/i);

    return {
      html: htmlMatch ? htmlMatch[1].trim() : '<div>' + message.content.replace(/```[\s\S]*?```/g, '') + '</div>',
      css: cssMatch ? cssMatch[1].trim() : 'body { font-family: system-ui; padding: 20px; background: #0f172a; color: #f8fafc; }',
      js: jsMatch ? jsMatch[2].trim() : '',
    };
  };

  // Helper to parse content into text and code blocks
  const renderFormattedContent = (content: string) => {
    const parts = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <CodeBlock
            key={index}
            code={part.content}
            language={part.language}
            onRun={onRunCode}
            onOpenCanvas={(code, lang) => {
              if (onOpenCanvas) {
                onOpenCanvas({
                  id: `code-${message.id}-${index}`,
                  title: `${lang.toUpperCase()} Snippet`,
                  mode: 'code',
                  code,
                  language: lang,
                });
              }
            }}
          />
        );
      }

      // Format markdown text lines
      const lines = part.content.split('\n');
      return (
        <div key={index} className="space-y-2 text-slate-200 leading-relaxed font-sans">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="text-sm font-bold text-white mt-3 mb-1 font-mono tracking-tight">
                  {line.slice(4)}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-white mt-4 mb-1 font-mono tracking-tight">
                  {line.slice(3)}
                </h3>
              );
            }
            if (line.startsWith('# ')) {
              return (
                <h2 key={lIdx} className="text-lg font-bold text-emerald-300 mt-5 mb-2 font-mono tracking-tight">
                  {line.slice(2)}
                </h2>
              );
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-emerald-400 mt-1.5">•</span>
                  <span>{renderBold(line.slice(2))}</span>
                </div>
              );
            }
            if (line.trim() === '') {
              return <div key={lIdx} className="h-1.5" />;
            }
            return <p key={lIdx}>{renderBold(line)}</p>;
          })}
        </div>
      );
    });
  };

  const renderBold = (str: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const elements = [];
    let last = 0;
    let m;
    while ((m = boldRegex.exec(str)) !== null) {
      if (m.index > last) {
        elements.push(str.slice(last, m.index));
      }
      elements.push(<strong key={m.index} className="font-semibold text-white">{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < str.length) {
      elements.push(str.slice(last));
    }
    return elements;
  };

  // 1. USER CHAT BUBBLE (Right-Aligned Asymmetric Neon Indigo/Cyan)
  if (isUser) {
    return (
      <div className="py-3 px-3 sm:px-6 flex justify-end animate-in fade-in duration-200">
        <div className="max-w-2xl flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono text-slate-400">
            <span>You</span>
            <span>·</span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/20 border border-cyan-400/25 px-4 py-3 text-sm leading-relaxed backdrop-blur-md">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. AI CHAT BUBBLE (Left-Aligned Obsidian Glassmorphic Card)
  return (
    <div className="py-3 px-3 sm:px-6 flex justify-start animate-in fade-in duration-200">
      <div className="max-w-4xl w-full flex gap-3 sm:gap-3.5 items-start">
        {/* Model Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 p-0.5 shrink-0 mt-0.5 shadow-md shadow-emerald-500/10">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        {/* AI Response Card Container */}
        <div className="flex-1 min-w-0 rounded-2xl rounded-tl-xs bg-slate-900/85 border border-slate-800/90 backdrop-blur-xl shadow-2xl p-4 sm:p-5 space-y-3">
          {/* Header Metadata Row */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div
                draggable
                onDragStart={(e) => {
                  const codeMatch = message.content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
                  const payload = {
                    type: 'ai-bubble-artifact',
                    title: `${modelDef?.name || 'Bonsai 27B'} Output`,
                    markdown: message.content,
                    code: codeMatch ? codeMatch[2] : undefined,
                    language: codeMatch ? codeMatch[1] : undefined,
                    mode: codeMatch ? 'code' : 'markdown',
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(payload));
                  e.dataTransfer.setData('text/plain', message.content);
                  e.dataTransfer.effectAllowed = 'copyMove';
                }}
                className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/80 rounded transition-colors"
                title="Drag this AI response directly into ChatCanvas workspace"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white tracking-tight">
                {modelDef?.name || 'Bonsai 27B Standard'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span>1.58b Ternary</span>
              </span>
            </div>

            {/* Performance Telemetry Chips */}
            {message.metrics && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-semibold">{message.metrics.tps} t/s</span>
                <span>·</span>
                <span>{(message.metrics.durationMs / 1000).toFixed(1)}s</span>
                <span>·</span>
                <span className="text-cyan-400">{message.metrics.ramUsedGB} GB RAM</span>
              </div>
            )}
          </div>

          {/* DeepThinking Animated Timeline Viewer */}
          {message.thinkingContent && (
            <DeepThinkingViewer
              thinkingContent={message.thinkingContent}
              isThinking={message.isThinking}
              durationMs={message.metrics?.durationMs}
              totalTokens={message.metrics?.totalTokens}
              tps={message.metrics?.tps}
            />
          )}

          {/* Main Message Content / Raw Toggle */}
          <div className="text-sm">
            {showRawMarkdown ? (
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
                {message.content}
              </pre>
            ) : (
              renderFormattedContent(message.content)
            )}
          </div>

          {/* Tool Invocations & Interactive Cards */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              {message.toolCalls.map(tool => (
                <div key={tool.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs">
                  <div className="flex items-center justify-between mb-1.5 font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      {tool.name === 'googleSearch' && <Search className="w-3.5 h-3.5" />}
                      {tool.name === 'darkwebSearch' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                      {tool.name === 'googleMaps' && <MapPin className="w-3.5 h-3.5" />}
                      {tool.name === 'codeInterpreter' && <Code className="w-3.5 h-3.5" />}
                      {tool.name === 'generateMusic' && <Music className="w-3.5 h-3.5" />}
                      {tool.name === 'generateImage' && <ImageIcon className="w-3.5 h-3.5" />}
                      <span>Tool: {tool.displayName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tool.status}
                    </span>
                  </div>

                  {tool.name === 'googleMaps' && (
                    <InChatMapsCard
                      locationName={tool.args?.location || 'San Francisco, CA'}
                      query={tool.args?.query || 'Location Details'}
                    />
                  )}

                  {tool.result && tool.name !== 'googleMaps' && (
                    <div className="mt-2 text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <pre className="text-[11px] font-mono whitespace-pre-wrap">
                        {typeof tool.result === 'object' ? JSON.stringify(tool.result, null, 2) : tool.result}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Generated Image Card */}
          {message.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2.5 max-w-md shadow-xl">
              <img
                src={message.imageUrl}
                alt="Generated with Bonsai"
                className="w-full rounded-lg object-contain max-h-80 shadow-md"
              />
              <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-400 font-mono">
                <span>gemini-3.1-flash-image</span>
                <a
                  href={message.imageUrl}
                  download="bonsai-generation.png"
                  className="flex items-center gap-1 text-emerald-400 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>
              </div>
            </div>
          )}

          {/* Generated Music / Speech Audio Cards */}
          {message.musicUrl && (
            <div className="p-3 rounded-xl border border-purple-800/40 bg-purple-950/20 max-w-md flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Lyria Music Engine (30s Audio)</span>
              </div>
              <button
                onClick={() => handleToggleAudio(message.musicUrl!)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Pause' : 'Play'}</span>
              </button>
            </div>
          )}

          {message.audioUrl && (
            <div className="p-2.5 rounded-xl border border-emerald-800/40 bg-emerald-950/20 max-w-md flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Speech Synthesis (gemini-3.8-flash-tts)</span>
              </div>
              <button
                onClick={() => handleToggleAudio(message.audioUrl!)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
              </button>
            </div>
          )}

          {/* Redesigned Action Suite Below AI Bubble */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/70 text-slate-400 text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                title="Copy markdown text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onTtsPlay && (
                <button
                  onClick={() => onTtsPlay(message.content)}
                  className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Read aloud with high-fidelity TTS"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read Aloud</span>
                </button>
              )}

              {onOpenCanvas && (
                <button
                  onClick={() => {
                    const codeMatch = message.content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
                    onOpenCanvas({
                      id: `canvas-${message.id}`,
                      title: codeMatch ? `${codeMatch[1].toUpperCase()} Artifact` : 'Bonsai Workspace Document',
                      mode: codeMatch ? 'code' : 'markdown',
                      markdown: message.content,
                      code: codeMatch ? codeMatch[2] : undefined,
                      language: codeMatch ? codeMatch[1] : undefined,
                      html: hasHtmlContent ? extractCodeForViewer().html : undefined,
                      css: hasHtmlContent ? extractCodeForViewer().css : undefined,
                      js: hasHtmlContent ? extractCodeForViewer().js : undefined,
                    });
                  }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium transition-all cursor-pointer shadow-sm"
                  title="Open this response in side-by-side ChatCanvas"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open in Canvas</span>
                </button>
              )}

              {hasHtmlContent && (
                <button
                  onClick={() => setIsWebViewerOpen(true)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-medium"
                  title="Open live WebViewer canvas"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live WebViewer</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors text-[11px] font-mono cursor-pointer"
                title="Toggle Raw Markdown"
              >
                <FileText className="w-3 h-3" />
                <span>{showRawMarkdown ? 'Formatted' : 'Raw'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="p-1 rounded hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Download as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Extra Options Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1 rounded hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-slate-400"
                  title="More actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 bottom-7 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 text-[11px] font-mono space-y-0.5 animate-in fade-in">
                    {onOpenCanvas && (
                      <button
                        onClick={() => {
                          const codeMatch = message.content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
                          onOpenCanvas({
                            id: `canvas-${message.id}`,
                            title: codeMatch ? `${codeMatch[1].toUpperCase()} Artifact` : 'Bonsai Workspace Document',
                            mode: codeMatch ? 'code' : 'markdown',
                            markdown: message.content,
                            code: codeMatch ? codeMatch[2] : undefined,
                            language: codeMatch ? codeMatch[1] : undefined,
                          });
                          setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Open in ChatCanvas</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleCopy();
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Raw Markdown</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadMarkdown();
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Export as .md</span>
                    </button>
                    {onTtsPlay && (
                      <button
                        onClick={() => {
                          onTtsPlay(message.content);
                          setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Read with Studio TTS</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Chat WebViewer Modal */}
      {isWebViewerOpen && (
        <InChatWebViewer
          isOpen={isWebViewerOpen}
          onClose={() => setIsWebViewerOpen(false)}
          title="Bonsai Generated Web Artifact"
          htmlCode={extractCodeForViewer().html}
          cssCode={extractCodeForViewer().css}
          jsCode={extractCodeForViewer().js}
        />
      )}
    </div>
  );
};

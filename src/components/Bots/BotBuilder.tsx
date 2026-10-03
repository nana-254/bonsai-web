import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Sliders, 
  MessageSquare, 
  Send, 
  Cpu, 
  Sparkles, 
  Check, 
  Search, 
  Globe2, 
  ShieldAlert, 
  Terminal, 
  Volume2, 
  FileText, 
  Copy, 
  RefreshCw,
  Zap,
  User
} from 'lucide-react';
import { BotDefinition, ModelDef } from '../../types';
import { INITIAL_BOTS } from '../../data/bots';
import { BONSAI_MODELS } from '../../data/models';

interface BotBuilderProps {
  onSelectBotForChat?: (bot: BotDefinition) => void;
}

export const BotBuilder: React.FC<BotBuilderProps> = ({ onSelectBotForChat }) => {
  const [bots, setBots] = useState<BotDefinition[]>(INITIAL_BOTS);
  const [selectedBotId, setSelectedBotId] = useState<string>(INITIAL_BOTS[0].id);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const activeBot = bots.find(b => b.id === selectedBotId) || bots[0];
  const [name, setName] = useState(activeBot.name);
  const [description, setDescription] = useState(activeBot.description);
  const [modelId, setModelId] = useState(activeBot.modelId);
  const [systemPrompt, setSystemPrompt] = useState(activeBot.systemPrompt);
  const [temperature, setTemperature] = useState(activeBot.temperature);
  const [enabledTools, setEnabledTools] = useState<string[]>(activeBot.enabledTools);
  const [newKnowledge, setNewKnowledge] = useState('');

  // Interactive Test Chat State
  const [testMessages, setTestMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hello! I am ${activeBot.name}. Send me a message to test my persona and instructions.` }
  ]);
  const [testInput, setTestInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSelectBot = (bot: BotDefinition) => {
    setSelectedBotId(bot.id);
    setName(bot.name);
    setDescription(bot.description);
    setModelId(bot.modelId);
    setSystemPrompt(bot.systemPrompt);
    setTemperature(bot.temperature);
    setEnabledTools(bot.enabledTools);
    setTestMessages([
      { role: 'assistant', content: `Hello! I am ${bot.name}. Test my custom parameters and persona.` }
    ]);
  };

  const handleCreateNewBot = () => {
    const newBot: BotDefinition = {
      id: `bot-${Date.now()}`,
      name: 'New Custom Bot',
      avatarIcon: 'Bot',
      description: 'Customized Bonsai 27B agent with dedicated instructions.',
      modelId: 'bonsai-27b-standard',
      systemPrompt: 'You are an intelligent custom assistant powered by Bonsai 27B.',
      temperature: 0.4,
      topP: 0.9,
      knowledgeFiles: ['custom_notes.txt'],
      enabledTools: ['googleSearch', 'codeInterpreter'],
      createdAt: Date.now(),
    };
    setBots([newBot, ...bots]);
    handleSelectBot(newBot);
    setIsEditing(true);
  };

  const handleSaveBot = () => {
    setBots(prev =>
      prev.map(b =>
        b.id === activeBot.id
          ? {
              ...b,
              name,
              description,
              modelId,
              systemPrompt,
              temperature,
              enabledTools,
            }
          : b
      )
    );
    setIsEditing(false);
  };

  const handleDeleteBot = (botId: string) => {
    if (bots.length <= 1) return;
    const remaining = bots.filter(b => b.id !== botId);
    setBots(remaining);
    handleSelectBot(remaining[0]);
  };

  const toggleTool = (toolId: string) => {
    setEnabledTools(prev =>
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
  };

  const handleSendTestMessage = async () => {
    if (!testInput.trim() || isSending) return;
    const userMsg = testInput.trim();
    setTestInput('');
    const updated = [...testMessages, { role: 'user' as const, content: userMsg }];
    setTestMessages(updated);
    setIsSending(true);

    try {
      const res = await fetch('/api/bots/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot: {
            ...activeBot,
            name,
            systemPrompt,
            modelId,
            temperature,
          },
          message: userMsg,
          history: updated.slice(-6),
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setTestMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error(data.error || 'No reply returned');
      }
    } catch (e: any) {
      setTestMessages(prev => [
        ...prev,
        { role: 'assistant', content: `[Bonsai Engine]: Error running bot: ${e.message}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Bot Builder Studio</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Custom Personalities
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Create, configure, and evaluate tailored Bonsai 27B bots with custom tools and knowledge files
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNewBot}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Bot</span>
        </button>
      </div>

      {/* Main Split: Bot List + Configuration Form + Interactive Test Playground */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Bots List (Sidebar) */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Configured Bots ({bots.length})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {bots.map(bot => {
              const isSelected = bot.id === activeBot.id;
              return (
                <button
                  key={bot.id}
                  onClick={() => handleSelectBot(bot)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border border-emerald-500/40 text-white shadow-md'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs text-white truncate">{bot.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{bot.description}</p>
                    <span className="text-[9px] font-mono text-emerald-400 mt-0.5 inline-block">
                      {bot.modelId.replace('bonsai-27b-', '')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Bot Configuration Details */}
        <div className="flex-1 overflow-y-auto p-5 border-r border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{name}</h2>
              <p className="text-xs text-slate-400">Configure parameters, prompt, and tool access</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveBot}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Bot</span>
              </button>
              {bots.length > 1 && (
                <button
                  onClick={() => handleDeleteBot(activeBot.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Bot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-400 mb-1">Bot Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-400 mb-1">Base Model Variant</label>
                <select
                  value={modelId}
                  onChange={e => setModelId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {BONSAI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.quantBits})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase text-slate-400 mb-1">Short Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase text-slate-400 mb-1">System Instructions / Persona</label>
              <textarea
                rows={5}
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Creativity / Temperature</span>
                <span className="text-emerald-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Enabled Tools */}
            <div>
              <label className="block font-mono text-[11px] uppercase text-slate-400 mb-2">Available Agent Tools</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'googleSearch', label: 'Google Search', icon: Globe2 },
                  { id: 'darkwebSearch', label: 'Tor Darkweb', icon: ShieldAlert },
                  { id: 'codeInterpreter', label: 'Python Sandbox', icon: Terminal },
                  { id: 'textToSpeech', label: 'TTS Audio', icon: Volume2 },
                  { id: 'generateImage', label: 'Image Creator', icon: Sparkles },
                ].map(tool => {
                  const active = enabledTools.includes(tool.id);
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => toggleTool(tool.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                        active
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-medium text-xs">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Test Playground */}
        <div className="w-96 flex flex-col shrink-0 bg-slate-900/40">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-white font-bold">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Playground</span>
            </div>
            <button
              onClick={() => setTestMessages([{ role: 'assistant', content: `Chat reset. Ask ${name} anything!` }])}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Reset Test"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Test Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
            {testMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{name} thinking...</span>
              </div>
            )}
          </div>

          {/* Test Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendTestMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                placeholder={`Ask ${name}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSending || !testInput.trim()}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

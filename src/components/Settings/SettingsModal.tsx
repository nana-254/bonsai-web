import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Radio, 
  Check, 
  Sliders, 
  Volume2, 
  Cpu, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Server,
  Puzzle,
  Download,
  Star,
  Plus,
  Terminal,
  ShieldAlert,
  Zap,
  CheckSquare,
  Square,
  BookOpen
} from 'lucide-react';
import { Settings, MCPServer, MarketplacePlugin, PersonaProfile } from '../../types';
import { MARKETPLACE_PLUGINS, INITIAL_MCP_SERVERS } from '../../data/marketplace';
import { MCPRegistry } from './MCPRegistry';
import { PersonaLibrary } from './PersonaLibrary';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'personas' | 'marketplace' | 'mcp' | 'plugins'>('general');
  const [formData, setFormData] = useState<Settings>({
    ...settings,
    mcpServers: settings.mcpServers || INITIAL_MCP_SERVERS,
    installedPlugins: settings.installedPlugins || ['plugin-darkweb-intel', 'plugin-deep-thinking-visualizer', 'plugin-bitnet-metal-jit', 'plugin-abliteration-slider'],
  });

  const [testingOllama, setTestingOllama] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  // Marketplace states
  const [marketplaceCategory, setMarketplaceCategory] = useState<string>('all');
  const [marketplaceSearch, setMarketplaceSearch] = useState<string>('');

  // Abliteration strength slider state
  const [abliterationStrength, setAbliterationStrength] = useState(1.0);

  if (!isOpen) return null;

  const handleTestOllama = async () => {
    setTestingOllama(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ollama/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.ollamaUrl }),
      });
      const data = await res.json();
      setTestResult({
        connected: data.connected,
        message: data.connected
          ? `Connected to Ollama v${data.version} at ${data.url}`
          : `Could not reach ${data.url}. Using high-speed Bonsai engine bridge.`,
      });
    } catch (err: any) {
      setTestResult({
        connected: false,
        message: `Connection failed: ${err.message}`,
      });
    } finally {
      setTestingOllama(false);
    }
  };

  const togglePlugin = (pluginId: string) => {
    setFormData(prev => {
      const current = prev.installedPlugins || [];
      const updated = current.includes(pluginId)
        ? current.filter(id => id !== pluginId)
        : [...current, pluginId];
      return { ...prev, installedPlugins: updated };
    });
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const filteredPlugins = MARKETPLACE_PLUGINS.filter(p => {
    const matchesCat = marketplaceCategory === 'all' || p.category === marketplaceCategory;
    const matchesSearch = p.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                          p.description.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(marketplaceSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">System Settings & Extensibility</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs font-mono shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'general'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>General & Inference</span>
          </button>

          <button
            onClick={() => setActiveTab('personas')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'personas'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Prompt Library</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'marketplace'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'mcp'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>MCP Servers</span>
          </button>

          <button
            onClick={() => setActiveTab('plugins')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'plugins'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Skills & Plugins</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs font-sans">
          {/* TAB 1: GENERAL & INFERENCE */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Ollama Server Endpoint */}
              <div className="space-y-2">
                <label className="block font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Local Ollama Server Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.ollamaUrl}
                    onChange={(e) => setFormData({ ...formData, ollamaUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleTestOllama}
                    disabled={testingOllama}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {testingOllama ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Test Ping</span>
                  </button>
                </div>

                {testResult && (
                  <div className={`p-2.5 rounded-lg border font-mono text-[11px] flex items-center gap-2 ${
                    testResult.connected
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  }`}>
                    {testResult.connected ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Inference Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <label className="block font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Inference & Sampling Controls
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-slate-400 font-mono mb-1">
                      <span>Temperature:</span>
                      <span className="text-emerald-400 font-bold">{formData.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 font-mono mb-1">
                      <span>Top-P (Nucleus):</span>
                      <span className="text-cyan-400 font-bold">{formData.topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={formData.topP}
                      onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* System Prompt Override */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="block font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Custom System Prompt Override
                </label>
                <textarea
                  rows={2}
                  value={formData.systemPromptOverride}
                  onChange={(e) => setFormData({ ...formData, systemPromptOverride: e.target.value })}
                  placeholder="Inject additional instructions into the model system instruction..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                />
              </div>

              {/* Default TTS Voice */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="block font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Default Speech Voice (gemini-3.8-flash-tts)
                </label>
                <select
                  value={formData.ttsVoice}
                  onChange={(e) => setFormData({ ...formData, ttsVoice: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="Kore">Kore (Articulate, Balanced Female)</option>
                  <option value="Puck">Puck (Energetic, Clear Male)</option>
                  <option value="Zephyr">Zephyr (Warm, Dynamic Female)</option>
                  <option value="Fenrir">Fenrir (Authoritative, Deep Male)</option>
                  <option value="Charon">Charon (Calm, Grounded Male)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB: SYSTEM PROMPT PERSONA LIBRARY */}
          {activeTab === 'personas' && (
            <PersonaLibrary
              activePersonaId={formData.activePersonaId}
              customPersonas={formData.personaProfiles || []}
              onUpdatePersonas={personas => setFormData(prev => ({ ...prev, personaProfiles: personas }))}
              onSelectPersona={persona => {
                setFormData(prev => ({
                  ...prev,
                  systemPromptOverride: persona.systemPrompt,
                  temperature: persona.temperature,
                  topP: persona.topP,
                  activePersonaId: persona.id,
                }));
              }}
            />
          )}

          {/* TAB 2: MARKETPLACE */}
          {activeTab === 'marketplace' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Bonsai Extensions & Plugins Store
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {filteredPlugins.length} packages available
                </span>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                  placeholder="Search models, skills, tools..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
                />
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                  {['all', 'tool', 'skill', 'mcp', 'model'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMarketplaceCategory(cat)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        marketplaceCategory === cat
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plugins Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {filteredPlugins.map((plugin) => {
                  const isInstalled = (formData.installedPlugins || []).includes(plugin.id);

                  return (
                    <div
                      key={plugin.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{plugin.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded uppercase font-mono bg-slate-800 text-slate-400">
                            {plugin.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">v{plugin.version}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {plugin.description}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-500">
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {plugin.stars}
                          </span>
                          <span>Downloads: {plugin.downloads}</span>
                          <span>By: {plugin.author}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => togglePlugin(plugin.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isInstalled
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {isInstalled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Installed</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Install</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MCP SERVERS (Rendered via dedicated MCPRegistry component) */}
          {activeTab === 'mcp' && (
            <MCPRegistry
              servers={formData.mcpServers || []}
              onUpdateServers={servers => setFormData(prev => ({ ...prev, mcpServers: servers }))}
            />
          )}

          {/* TAB 4: SKILLS & PLUGINS */}
          {activeTab === 'plugins' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Active Runtime Skills & Hardware Tuning
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure tool activation and safety ablation layers in the Bonsai execution loop.
                </p>
              </div>

              {/* Darknet Gateway Tool Config */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-white text-xs">Tor Darknet Threat Gateway</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    Ready (Port 9050)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Routes threat modeling and exploit queries through a simulated 3-hop Tor relay circuit with .onion resolver.
                </p>
                <div className="text-[10px] font-mono text-slate-500 flex gap-4 pt-1">
                  <span>Exit Relay: tor-exit-de-04.net</span>
                  <span>Consensus: Validated</span>
                </div>
              </div>

              {/* Abliteration Slider */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-xs">Orthogonal Refusal Direction Ablation</span>
                  </div>
                  <span className="font-mono text-purple-300 text-xs font-bold">
                    {(abliterationStrength * 100).toFixed(0)}% Extracted
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={abliterationStrength}
                  onChange={(e) => setAbliterationStrength(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Controls the strength of the orthogonal projection operator P_perp = I - r_hat * r_hat^T applied to layer activations to erase the refusal direction.
                </p>
              </div>

              {/* BitNet JIT Kernel */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">BitNet Metal / CUDA Integer Addition Kernel</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    Active (Zero-FP32)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Direct integer addition without floating-point multipliers enabled. Achieves 38.6 tokens/sec on 8GB host RAM.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            Save Settings & Extensions
          </button>
        </div>
      </div>
    </div>
  );
};

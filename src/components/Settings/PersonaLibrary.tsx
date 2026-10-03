import React, { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Code2, 
  Search, 
  ShieldAlert, 
  Sigma, 
  Cpu, 
  Feather,
  Copy,
  Zap,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { PersonaProfile } from '../../types';
import { INITIAL_PERSONAS } from '../../data/personas';

interface PersonaLibraryProps {
  activePersonaId?: string;
  onSelectPersona: (persona: PersonaProfile) => void;
  customPersonas?: PersonaProfile[];
  onUpdatePersonas: (personas: PersonaProfile[]) => void;
}

export const PersonaLibrary: React.FC<PersonaLibraryProps> = ({
  activePersonaId,
  onSelectPersona,
  customPersonas = [],
  onUpdatePersonas,
}) => {
  const allPersonas = [...INITIAL_PERSONAS, ...customPersonas];
  const [selectedPersona, setSelectedPersona] = useState<PersonaProfile>(
    allPersonas.find(p => p.id === activePersonaId) || allPersonas[0]
  );

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.4);
  const [category, setCategory] = useState<'coding' | 'creative' | 'research' | 'security' | 'math' | 'custom'>('custom');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const iconMap: Record<string, any> = {
    Code2,
    Feather,
    Search,
    ShieldAlert,
    Sigma,
    Cpu,
  };

  const handleStartCreate = () => {
    setName('');
    setTagline('');
    setSystemPrompt('');
    setTemperature(0.4);
    setCategory('custom');
    setIsCreatingNew(true);
    setEditingId(null);
  };

  const handleStartEdit = (persona: PersonaProfile) => {
    setName(persona.name);
    setTagline(persona.tagline);
    setSystemPrompt(persona.systemPrompt);
    setTemperature(persona.temperature);
    setCategory(persona.category);
    setEditingId(persona.id);
    setIsCreatingNew(false);
  };

  const handleSavePersona = () => {
    if (!name.trim() || !systemPrompt.trim()) return;

    if (editingId) {
      // Editing existing
      const updated = allPersonas.map(p =>
        p.id === editingId
          ? {
              ...p,
              name,
              tagline,
              systemPrompt,
              temperature,
              category,
            }
          : p
      );
      // Filter out INITIAL_PERSONAS to save customs
      const customs = updated.filter(p => p.isCustom || !INITIAL_PERSONAS.some(ip => ip.id === p.id));
      onUpdatePersonas(customs);
      setSelectedPersona(updated.find(p => p.id === editingId)!);
      setEditingId(null);
    } else {
      // Creating new
      const newPersona: PersonaProfile = {
        id: `persona-custom-${Date.now()}`,
        name,
        tagline: tagline || 'Customized agent persona profile',
        category: 'custom',
        avatarIcon: 'Cpu',
        systemPrompt,
        temperature,
        topP: 0.9,
        recommendedModelId: 'bonsai-27b-standard',
        suggestedTools: ['codeInterpreter'],
        isCustom: true,
      };

      onUpdatePersonas([...customPersonas, newPersona]);
      setSelectedPersona(newPersona);
      setIsCreatingNew(false);
    }
  };

  const handleDeleteCustom = (id: string) => {
    const remaining = customPersonas.filter(p => p.id !== id);
    onUpdatePersonas(remaining);
    if (selectedPersona.id === id) {
      setSelectedPersona(INITIAL_PERSONAS[0]);
    }
  };

  const filteredPersonas = allPersonas.filter(
    p => filterCategory === 'all' || p.category === filterCategory
  );

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-white text-sm">System Prompt Library</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Load, edit, and create curated persona instructions for the 1.58-bit Bonsai models
          </p>
        </div>
        <button
          onClick={handleStartCreate}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Persona</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 font-mono text-[11px]">
        {['all', 'coding', 'creative', 'research', 'security', 'math', 'custom'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
              filterCategory === cat
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Editor Modal/Form if creating or editing */}
      {(isCreatingNew || editingId) && (
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs font-mono">
              {isCreatingNew ? 'Create New Persona' : 'Edit Persona Profile'}
            </span>
            <button
              onClick={() => {
                setIsCreatingNew(false);
                setEditingId(null);
              }}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Persona Title</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Quantum Algorithm Engineer"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Short Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g., Specialized in high-performance computing"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">System Instruction / Prompt</label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Define exact behavioral instructions, output styles, and constraints..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">Temperature:</span>
              <span className="text-emerald-400 font-mono text-xs">{temperature}</span>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-24 accent-emerald-500"
              />
            </div>

            <button
              onClick={handleSavePersona}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {filteredPersonas.map(persona => {
          const Icon = iconMap[persona.avatarIcon] || Cpu;
          const isActive = selectedPersona.id === persona.id;
          const isCurrentlyActiveInApp = activePersonaId === persona.id;

          return (
            <div
              key={persona.id}
              onClick={() => setSelectedPersona(persona)}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{persona.name}</span>
                        {isCurrentlyActiveInApp && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 capitalize">{persona.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleStartEdit(persona);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-200"
                      title="Edit Persona"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {persona.isCustom && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteCustom(persona.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                        title="Delete Persona"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {persona.tagline}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Temp: <strong className="text-slate-300">{persona.temperature}</strong></span>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSelectPersona(persona);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isCurrentlyActiveInApp
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{isCurrentlyActiveInApp ? 'Applied' : 'Load Persona'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Persona Preview Box */}
      {selectedPersona && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span>Previewing System Prompt: <strong className="text-white">{selectedPersona.name}</strong></span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedPersona.systemPrompt);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1 text-emerald-400 hover:underline"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 leading-relaxed whitespace-pre-wrap max-h-28 overflow-y-auto">
            {selectedPersona.systemPrompt}
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Zap, 
  Terminal, 
  Search, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { RESEARCH_SECTIONS } from '../../data/research';

export const ResearchWhitepaper: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(RESEARCH_SECTIONS[0].id);
  const activeSection = RESEARCH_SECTIONS.find(s => s.id === selectedSectionId) || RESEARCH_SECTIONS[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Research & Architecture Whitepaper</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              Technical Compendium
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            In-depth analysis of 1.58-bit binary LLMs (Bonsai 27B), edge agentic runtime loops, lightweight OpenWebUI web builder alternatives, and orthogonal safety vector abliteration.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {RESEARCH_SECTIONS.map((sec) => {
            const isSelected = sec.id === selectedSectionId;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/5'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] uppercase font-mono font-semibold text-emerald-400 block mb-1">
                  {sec.badge}
                </span>
                <h3 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {sec.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Selected Section Content */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 space-y-6">
          {/* Section Header */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase mb-1">
              <span>Topic: {activeSection.badge}</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {activeSection.title}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {activeSection.summary}
            </p>
          </div>

          {/* Key Findings List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Key Technical Takeaways
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {activeSection.keyPoints.map((kp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{kp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table if available */}
          {activeSection.tableData && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Comparative Metrics
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      {activeSection.tableData.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3 font-semibold text-slate-300">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {activeSection.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3">
                            {cIdx === 0 ? (
                              <strong className="text-white font-medium">{cell}</strong>
                            ) : cell.includes('Native') || cell.includes('42 MB') || cell.includes('38') ? (
                              <span className="text-emerald-400 font-semibold">{cell}</span>
                            ) : cell.includes('Impossible') || cell.includes('OOM') || cell.includes('Heavy') ? (
                              <span className="text-rose-400">{cell}</span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deep Dive Theory */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Architectural Analysis & Formulae
            </h3>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
              {activeSection.deepDiveMarkdown}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

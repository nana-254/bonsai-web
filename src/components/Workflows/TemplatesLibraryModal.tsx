import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Check, 
  Play, 
  Sliders, 
  BookOpen, 
  Cpu, 
  Globe2, 
  Terminal, 
  ShieldAlert, 
  Volume2, 
  Image as ImageIcon,
  FileText,
  Clock,
  HardDrive,
  Copy,
  ChevronRight
} from 'lucide-react';
import { Workflow, WorkflowTemplate, WorkflowTemplateCategory } from '../../types';
import { WORKFLOW_TEMPLATES } from '../../data/workflows';

interface TemplatesLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadWorkflow: (workflow: Workflow) => void;
  currentWorkflowId?: string;
}

export const TemplatesLibraryModal: React.FC<TemplatesLibraryModalProps> = ({
  isOpen,
  onClose,
  onLoadWorkflow,
  currentWorkflowId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkflowTemplateCategory>('all');
  const [customizingTemplate, setCustomizingTemplate] = useState<WorkflowTemplate | null>(null);
  const [customInputs, setCustomInputs] = useState<Record<string, any>>({});
  const [customWorkflowName, setCustomWorkflowName] = useState('');

  if (!isOpen) return null;

  const categories: { id: WorkflowTemplateCategory; label: string }[] = [
    { id: 'all', label: 'All Templates' },
    { id: 'research', label: 'Research & Reports' },
    { id: 'data_analysis', label: 'Data Analysis' },
    { id: 'multimodal', label: 'Multimodal Media' },
    { id: 'cyber_intel', label: 'Cyber Threat Intel' },
    { id: 'dev_code', label: 'Developer & Code' },
  ];

  const filteredTemplates = WORKFLOW_TEMPLATES.filter(tpl => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleStartCustomize = (template: WorkflowTemplate) => {
    setCustomizingTemplate(template);
    setCustomWorkflowName(template.name);
    const initialInputs: Record<string, any> = {};
    template.customizableInputs?.forEach(inp => {
      initialInputs[inp.id] = inp.defaultValue;
    });
    setCustomInputs(initialInputs);
  };

  const handleApplyAndLoad = () => {
    if (!customizingTemplate) return;

    // Clone workflow
    const clonedWorkflow: Workflow = JSON.parse(JSON.stringify(customizingTemplate.workflow));
    clonedWorkflow.id = `wf-custom-${Date.now()}`;
    clonedWorkflow.name = customWorkflowName.trim() || customizingTemplate.name;
    clonedWorkflow.updatedAt = Date.now();

    // Apply customized inputs to target nodes
    customizingTemplate.customizableInputs?.forEach(inp => {
      const userVal = customInputs[inp.id];
      if (userVal !== undefined) {
        const targetNode = clonedWorkflow.nodes.find(n => n.id === inp.targetNodeId);
        if (targetNode) {
          targetNode.config = targetNode.config || {};
          targetNode.config[inp.targetConfigKey] = userVal;
        }
      }
    });

    onLoadWorkflow(clonedWorkflow);
    setCustomizingTemplate(null);
    onClose();
  };

  const handleDirectLoad = (template: WorkflowTemplate) => {
    // Clone with fresh timestamp
    const cloned: Workflow = JSON.parse(JSON.stringify(template.workflow));
    cloned.updatedAt = Date.now();
    onLoadWorkflow(cloned);
    onClose();
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'tool_google_search':
        return Globe2;
      case 'tool_python_sandbox':
        return Terminal;
      case 'tool_darkweb_intel':
        return ShieldAlert;
      case 'tool_tts_narrator':
        return Volume2;
      case 'ai_bonsai_standard':
      case 'ai_bonsai_uncensored':
      case 'ai_bonsai_abliterated':
        return Cpu;
      default:
        return FileText;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800/90 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* 1. Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Agentic Workflow Templates Library
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {WORKFLOW_TEMPLATES.length} Pre-built Graphs
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production-grade sequential pipelines engineered for 1.58-bit BitNet models in 5.34 GB RAM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close Library (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Search & Category Filters Ribbon */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search workflows, nodes, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 shadow-inner"
            />
          </div>
        </div>

        {/* 3. Main Workspace: Templates Grid or Customization Drawer */}
        <div className="flex-1 overflow-hidden flex relative">
          {/* Templates Grid Column */}
          <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${customizingTemplate ? 'hidden lg:block lg:w-3/5' : 'w-full'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => {
                const isCurrent = currentWorkflowId === template.workflow.id;
                const isSelectedForCustom = customizingTemplate?.id === template.id;

                return (
                  <div
                    key={template.id}
                    className={`rounded-2xl border p-5 transition-all flex flex-col justify-between backdrop-blur-xl ${
                      isSelectedForCustom
                        ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-500/10'
                        : isCurrent
                        ? 'bg-slate-900/80 border-cyan-500/40'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div>
                      {/* Top Header & Metadata */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-tight">
                              {template.name}
                            </h3>
                            {template.featured && (
                              <span className="text-[10px] font-mono text-cyan-400">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                            <span>{template.categoryLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{template.difficulty}</span>
                            <span aria-hidden="true">·</span>
                            <span>{template.estimatedRuntime}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-400">{template.vramFootprint} RAM</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                            Active On Canvas
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
                        {template.description}
                      </p>

                      {/* Visual Node Sequence Pipeline */}
                      <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center justify-between">
                          <span>Graph Pipeline Sequence</span>
                          <span>{template.workflow.nodes.length} Nodes</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                          {template.workflow.nodes.map((node, nIdx) => {
                            const IconComponent = getNodeIcon(node.type);
                            return (
                              <React.Fragment key={node.id}>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 shrink-0">
                                  <IconComponent className="w-3 h-3 text-emerald-400" />
                                  <span className="truncate max-w-[120px]">{node.title}</span>
                                </div>
                                {nIdx < template.workflow.nodes.length - 1 && (
                                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tags List */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 font-mono mb-4">
                        {template.tags.map((tag, tIdx) => (
                          <span key={tag}>
                            {tag}
                            {tIdx < template.tags.length - 1 && <span className="ml-1.5 text-slate-600">/</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Card Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleStartCustomize(template)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Customize</span>
                      </button>

                      <button
                        onClick={() => handleDirectLoad(template)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Load to Canvas</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-16 text-slate-500 font-sans">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-sm">No workflow templates found matching "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 text-xs text-emerald-400 hover:underline"
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </div>

          {/* Customization Drawer / Inspector Column */}
          {customizingTemplate && (
            <div className="w-full lg:w-2/5 border-l border-slate-800 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Customize Workflow Template
                    </h3>
                  </div>
                  <button
                    onClick={() => setCustomizingTemplate(null)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400">Workflow Name</label>
                  <input
                    type="text"
                    value={customWorkflowName}
                    onChange={e => setCustomWorkflowName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-emerald-400">{customizingTemplate.name}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {customizingTemplate.description}
                  </p>
                </div>

                {/* Customizable Parameters */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                    Pipeline Inputs & Parameters
                  </h4>

                  {customizingTemplate.customizableInputs?.map(input => (
                    <div key={input.id} className="space-y-1">
                      <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                        <span>{input.label}</span>
                        <span className="text-[10px] font-mono text-slate-500">{input.targetNodeId}</span>
                      </label>
                      <p className="text-[11px] text-slate-400">{input.description}</p>

                      {input.type === 'select' ? (
                        <select
                          value={customInputs[input.id] || input.defaultValue}
                          onChange={e => setCustomInputs({ ...customInputs, [input.id]: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                        >
                          {input.options?.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : input.type === 'number' ? (
                        <input
                          type="number"
                          step="0.01"
                          value={customInputs[input.id] ?? input.defaultValue}
                          onChange={e => setCustomInputs({ ...customInputs, [input.id]: parseFloat(e.target.value) })}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      ) : (
                        <input
                          type="text"
                          value={customInputs[input.id] ?? input.defaultValue}
                          onChange={e => setCustomInputs({ ...customInputs, [input.id]: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Bottom Controls */}
              <div className="pt-6 border-t border-slate-800 space-y-2 mt-6">
                <button
                  onClick={handleApplyAndLoad}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold tracking-tight shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Instantiate Customized Graph</span>
                </button>

                <button
                  onClick={() => setCustomizingTemplate(null)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Modal Footer Summary */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs font-mono text-slate-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>All templates utilize existing WorkflowNode infrastructure</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Esc to dismiss · Drag handles on canvas to modify
          </div>
        </div>
      </div>
    </div>
  );
};

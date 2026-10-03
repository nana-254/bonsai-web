import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Network, 
  Play, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ArrowRight, 
  Download, 
  Cpu, 
  Zap, 
  Globe2, 
  ShieldAlert, 
  Terminal, 
  Volume2, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  Layers, 
  Search,
  Image as ImageIcon,
  FileText,
  RotateCcw,
  Move,
  BookOpen,
  Code2,
  Copy,
  Check,
  Shield,
  HelpCircle,
  X,
  MoreVertical,
  GitBranch,
  Bot
} from 'lucide-react';
import { Workflow, WorkflowNode as WorkflowNodeType, WorkflowEdge, WorkflowNodeType as NodeType } from '../../types';
import { PRESET_WORKFLOWS } from '../../data/workflows';
import { WorkflowNode } from './WorkflowNode';
import { TemplatesLibraryModal } from './TemplatesLibraryModal';
import { AddNodeModal } from './AddNodeModal';
import { AIWorkflowGeneratorModal } from './AIWorkflowGeneratorModal';

/**
 * Validation logic for node connections.
 * Flags invalid data payload handoffs (e.g. feeding non-media tool into an image generation node).
 */
export function validateConnection(
  sourceNode?: WorkflowNodeType,
  targetNode?: WorkflowNodeType
): { isValid: boolean; reason?: string } {
  if (!sourceNode || !targetNode) return { isValid: true };

  // Rule 1: Trying to feed a non-media tool into an image generation node
  const isTargetImageGen =
    targetNode.title.toLowerCase().includes('image') ||
    targetNode.type === 'tool_image_gen' ||
    (targetNode.config && typeof targetNode.config.model === 'string' && targetNode.config.model.includes('imagen')) ||
    (targetNode.description && targetNode.description.toLowerCase().includes('visual asset'));

  if (isTargetImageGen) {
    if (sourceNode.type === 'tool_tts_narrator') {
      return {
        isValid: false,
        reason: 'Type Mismatch: Audio waveform from TTS Narrator cannot feed into Image Generation node. Image generation requires textual prompt or image reference.',
      };
    }
    if (sourceNode.type === 'tool_darkweb_intel') {
      return {
        isValid: false,
        reason: 'Type Mismatch: Raw Tor network exploit dump cannot feed directly into Image Generation node without an intermediate AI prompt synthesizer.',
      };
    }
    if (sourceNode.type === 'tool_python_sandbox') {
      return {
        isValid: false,
        reason: 'Type Mismatch: Python terminal stdout cannot directly feed Image Generation without prompt formatting.',
      };
    }
  }

  // Rule 2: Audio synthesizer cannot ingest raw terminal outputs directly
  if (targetNode.type === 'tool_tts_narrator' && sourceNode.type === 'tool_darkweb_intel') {
    return {
      isValid: false,
      reason: 'Type Mismatch: Raw onion packet dump cannot feed into TTS Synthesizer.',
    };
  }

  // Rule 3: Terminal Chat Dispatch node cannot send data out to computational nodes
  if (sourceNode.type === 'output_chat') {
    return {
      isValid: false,
      reason: 'Topology Error: Terminal Chat Dispatch node cannot send data backwards to computational nodes.',
    };
  }

  return { isValid: true };
}

/**
 * Serializes the current graph of nodes into a structured JSON execution plan
 */
export function serializeExecutionPlan(workflow: Workflow, triggerInput = 'Bonsai 27B agentic pipeline execution') {
  const nodes = workflow.nodes;
  const edges = workflow.edges;

  // Topological sorting
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  nodes.forEach(n => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach(e => {
    if (adj[e.fromNodeId] && inDegree[e.toNodeId] !== undefined) {
      adj[e.fromNodeId].push(e.toNodeId);
      inDegree[e.toNodeId] = (inDegree[e.toNodeId] || 0) + 1;
    }
  });

  const queue: string[] = nodes.filter(n => (inDegree[n.id] || 0) === 0).map(n => n.id);
  const orderedIds: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    orderedIds.push(curr);
    for (const neighbor of adj[curr] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  nodes.forEach(n => {
    if (!orderedIds.includes(n.id)) orderedIds.push(n.id);
  });

  return {
    planId: `plan-${Date.now()}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    serializedAt: new Date().toISOString(),
    triggerInput,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    executionPipeline: orderedIds.map((id, index) => {
      const node = nodes.find(n => n.id === id);
      const incomingEdges = edges.filter(e => e.toNodeId === id);
      return {
        step: index + 1,
        nodeId: id,
        title: node?.title || id,
        type: node?.type || 'action',
        config: node?.config || {},
        dependencies: incomingEdges.map(e => e.fromNodeId),
      };
    }),
  };
}

interface WorkflowStudioProps {
  onTtsPlay?: (text: string) => void;
}

export const WorkflowStudio: React.FC<WorkflowStudioProps> = ({ onTtsPlay }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>(PRESET_WORKFLOWS);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(PRESET_WORKFLOWS[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [finalOutput, setFinalOutput] = useState<string | null>(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAiWorkflowModal, setShowAiWorkflowModal] = useState(false);
  const [showStudioDropdown, setShowStudioDropdown] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);

  // Dragging connection state
  const [connectingSource, setConnectingSource] = useState<{
    nodeId: string;
    startX: number;
    startY: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNode, setDraggingNode] = useState<{
    nodeId: string;
    initialMouseX: number;
    initialMouseY: number;
    initialNodeX: number;
    initialNodeY: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];
  const selectedNode = activeWorkflow.nodes.find(n => n.id === selectedNodeId);

  // Validation analysis for graph edges & nodes
  const { nodeValidationMap, invalidEdgeIds, validationErrorsCount } = useMemo(() => {
    const map: Record<string, { isInvalid: boolean; message: string }> = {};
    const invalidEdges = new Set<string>();

    activeWorkflow.edges.forEach(edge => {
      const sourceNode = activeWorkflow.nodes.find(n => n.id === edge.fromNodeId);
      const targetNode = activeWorkflow.nodes.find(n => n.id === edge.toNodeId);
      if (!sourceNode || !targetNode) return;

      const validation = validateConnection(sourceNode, targetNode);
      if (!validation.isValid) {
        invalidEdges.add(edge.id);
        map[targetNode.id] = { 
          isInvalid: true, 
          message: validation.reason || 'Invalid input connection' 
        };
        // Also highlight source node if relevant
        if (!map[sourceNode.id]) {
          map[sourceNode.id] = { 
            isInvalid: true, 
            message: `Output connection to "${targetNode.title}" rejected: ${validation.reason}` 
          };
        }
      }
    });

    return {
      nodeValidationMap: map,
      invalidEdgeIds: invalidEdges,
      validationErrorsCount: invalidEdges.size,
    };
  }, [activeWorkflow.nodes, activeWorkflow.edges]);

  // Current serialized execution plan
  const currentExecutionPlan = useMemo(() => {
    return serializeExecutionPlan(activeWorkflow);
  }, [activeWorkflow]);

  // Mouse move and up handlers for dragging nodes and drawing live connection wires
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const currentCanvasX = e.clientX - rect.left + canvasRef.current.scrollLeft;
      const currentCanvasY = e.clientY - rect.top + canvasRef.current.scrollTop;

      setMousePos({ x: currentCanvasX, y: currentCanvasY });

      // Handle Node Dragging
      if (draggingNode) {
        const deltaX = e.clientX - draggingNode.initialMouseX;
        const deltaY = e.clientY - draggingNode.initialMouseY;
        const newX = Math.max(20, Math.round(draggingNode.initialNodeX + deltaX));
        const newY = Math.max(20, Math.round(draggingNode.initialNodeY + deltaY));

        setWorkflows(prev =>
          prev.map(w =>
            w.id === activeWorkflow.id
              ? {
                  ...w,
                  nodes: w.nodes.map(n =>
                    n.id === draggingNode.nodeId ? { ...n, x: newX, y: newY } : n
                  ),
                }
              : w
          )
        );
      }
    };

    const handleMouseUp = () => {
      if (connectingSource) {
        setConnectingSource(null);
      }
      if (draggingNode) {
        setDraggingNode(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [connectingSource, draggingNode, activeWorkflow.id]);

  const handleStartConnect = (nodeId: string, startX: number, startY: number, e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = e.clientY - rect.top + canvasRef.current.scrollTop;
    setConnectingSource({ nodeId, startX: x, startY: y });
  };

  const handleEndConnect = (targetNodeId: string) => {
    if (!connectingSource || connectingSource.nodeId === targetNodeId) {
      setConnectingSource(null);
      return;
    }

    // Check if edge already exists
    const edgeExists = activeWorkflow.edges.some(
      e => e.fromNodeId === connectingSource.nodeId && e.toNodeId === targetNodeId
    );

    if (!edgeExists) {
      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}`,
        fromNodeId: connectingSource.nodeId,
        fromPort: 'out',
        toNodeId: targetNodeId,
        toPort: 'in',
      };

      setWorkflows(prev =>
        prev.map(w =>
          w.id === activeWorkflow.id ? { ...w, edges: [...w.edges, newEdge] } : w
        )
      );
    }

    setConnectingSource(null);
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    const node = activeWorkflow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNodeId(nodeId);
    setDraggingNode({
      nodeId,
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialNodeX: node.x,
      initialNodeY: node.y,
    });
  };

  const handleDeleteEdge = (edgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflows(prev =>
      prev.map(w =>
        w.id === activeWorkflow.id
          ? { ...w, edges: w.edges.filter(ed => ed.id !== edgeId) }
          : w
      )
    );
  };

  /**
   * Serializes the current graph of nodes into a JSON execution plan and sends to backend for sequential processing
   */
  const handleExecuteWorkflow = async () => {
    if (isExecuting) return;
    setIsExecuting(true);

    const serializedPlan = serializeExecutionPlan(activeWorkflow);

    setExecutionLogs([
      `[${new Date().toLocaleTimeString()}] [ORCHESTRATOR] Serializing current graph of ${activeWorkflow.nodes.length} nodes into JSON execution plan...`,
      `[${new Date().toLocaleTimeString()}] [PLAN] Plan ID: ${serializedPlan.planId} · Execution Order: ${serializedPlan.executionPipeline.map(p => p.title).join(' ➔ ')}`,
      ...(validationErrorsCount > 0 ? [
        `[${new Date().toLocaleTimeString()}] [VALIDATION_WARNING] Detected ${validationErrorsCount} invalid connection(s) in active graph. Nodes flagged with red glow!`,
      ] : []),
      `[${new Date().toLocaleTimeString()}] Dispatching execution plan to backend (/api/workflows/execute)...`,
    ]);
    setFinalOutput(null);

    // Mark nodes as running
    setWorkflows(prev =>
      prev.map(w =>
        w.id === activeWorkflow.id
          ? {
              ...w,
              nodes: w.nodes.map(n => ({ ...n, status: 'running' as const })),
            }
          : w
      )
    );

    try {
      const res = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: activeWorkflow,
          executionPlan: serializedPlan,
          triggerInput: 'Bonsai 27B sequential agent graph evaluation',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setExecutionLogs(data.executionLogs || []);
        setFinalOutput(data.finalOutput || 'Workflow completed with full success');

        // Update node outputs and execution metrics
        setWorkflows(prev =>
          prev.map(w =>
            w.id === activeWorkflow.id
              ? {
                  ...w,
                  nodes: w.nodes.map(n => {
                    const executed = data.executedNodes?.find((en: any) => en.id === n.id);
                    return executed
                      ? {
                          ...n,
                          status: executed.status,
                          outputPreview: executed.outputPreview,
                          executionTimeMs: executed.executionTimeMs,
                        }
                      : { ...n, status: 'success' as const };
                  }),
                }
              : w
          )
        );
      } else {
        throw new Error(data.error || 'Execution failed');
      }
    } catch (err: any) {
      setExecutionLogs(prev => [...prev, `[ERROR] Execution failed: ${err.message}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAddNode = (type: NodeType, title: string, description: string) => {
    const newNode: WorkflowNodeType = {
      id: `node-${Date.now()}`,
      type,
      title,
      description,
      x: 350 + Math.random() * 80,
      y: 180 + Math.random() * 80,
      config: {},
      status: 'idle',
    };

    setWorkflows(prev =>
      prev.map(w =>
        w.id === activeWorkflow.id ? { ...w, nodes: [...w.nodes, newNode] } : w
      )
    );
    setShowAddNodeModal(false);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (nodeId: string) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === activeWorkflow.id
          ? {
              ...w,
              nodes: w.nodes.filter(n => n.id !== nodeId),
              edges: w.edges.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId),
            }
          : w
      )
    );
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleExportWorkflow = () => {
    const blob = new Blob([JSON.stringify(activeWorkflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bonsai-workflow-${activeWorkflow.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadWorkflowFromLibrary = (workflow: Workflow) => {
    setWorkflows(prev => {
      const idx = prev.findIndex(w => w.id === workflow.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = workflow;
        return copy;
      }
      return [workflow, ...prev];
    });
    setActiveWorkflowId(workflow.id);
    setSelectedNodeId(null);
    setFinalOutput(null);
  };

  const handleWorkflowGeneratedByAi = (newWorkflow: Workflow, executeImmediately: boolean) => {
    setWorkflows(prev => [newWorkflow, ...prev]);
    setActiveWorkflowId(newWorkflow.id);
    setSelectedNodeId(null);
    setFinalOutput(null);

    if (executeImmediately) {
      setTimeout(() => {
        handleExecuteWorkflow();
      }, 350);
    }
  };

  const handleDuplicateNode = (nodeToDup: WorkflowNodeType) => {
    const newNode: WorkflowNodeType = {
      ...nodeToDup,
      id: `node-${Date.now()}`,
      title: `${nodeToDup.title} (Copy)`,
      x: nodeToDup.x + 40,
      y: nodeToDup.y + 40,
      status: 'idle',
      outputPreview: undefined,
      executionTimeMs: undefined,
    };
    setWorkflows(prev =>
      prev.map(w =>
        w.id === activeWorkflow.id ? { ...w, nodes: [...w.nodes, newNode] } : w
      )
    );
    setSelectedNodeId(newNode.id);
  };

  /**
   * Helper to demonstrate invalid connection validation logic (TTS -> Image Gen)
   */
  const handleToggleInvalidDemoConnection = () => {
    // Check if TTS node and Image Gen node exist
    let ttsNode = activeWorkflow.nodes.find(n => n.type === 'tool_tts_narrator');
    let imgNode = activeWorkflow.nodes.find(n => n.title.toLowerCase().includes('image'));

    if (!imgNode) {
      imgNode = activeWorkflow.nodes.find(n => n.type === 'ai_bonsai_uncensored') || activeWorkflow.nodes[1];
    }

    if (!ttsNode) {
      // Add a TTS Narrator node to canvas
      const newTts: WorkflowNodeType = {
        id: `node-tts-demo-${Date.now()}`,
        type: 'tool_tts_narrator',
        title: 'Gemini TTS Synthesizer',
        description: 'Audio speech generator with prebuilt voices (outputs audio waveforms)',
        x: 80,
        y: 280,
        config: { voice: 'Kore' },
        status: 'idle',
      };
      const invalidEdge: WorkflowEdge = {
        id: `edge-invalid-demo-${Date.now()}`,
        fromNodeId: newTts.id,
        fromPort: 'out',
        toNodeId: imgNode?.id || activeWorkflow.nodes[0].id,
        toPort: 'in',
      };
      setWorkflows(prev =>
        prev.map(w =>
          w.id === activeWorkflow.id
            ? { ...w, nodes: [...w.nodes, newTts], edges: [...w.edges, invalidEdge] }
            : w
        )
      );
      return;
    }

    // If both exist, toggle the invalid edge between them
    const existingInvalid = activeWorkflow.edges.find(
      e => e.fromNodeId === ttsNode!.id && e.toNodeId === imgNode!.id
    );

    if (existingInvalid) {
      // Remove it
      setWorkflows(prev =>
        prev.map(w =>
          w.id === activeWorkflow.id
            ? { ...w, edges: w.edges.filter(e => e.id !== existingInvalid.id) }
            : w
        )
      );
    } else {
      // Create invalid edge
      const invalidEdge: WorkflowEdge = {
        id: `edge-invalid-tts-img-${Date.now()}`,
        fromNodeId: ttsNode.id,
        fromPort: 'out',
        toNodeId: imgNode.id,
        toPort: 'in',
      };
      setWorkflows(prev =>
        prev.map(w =>
          w.id === activeWorkflow.id ? { ...w, edges: [...w.edges, invalidEdge] } : w
        )
      );
    }
  };

  const handleCopyPlan = () => {
    navigator.clipboard.writeText(JSON.stringify(currentExecutionPlan, null, 2));
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* 1. TOP WORKFLOW STUDIO HEADER */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                n8n Workflow Engine
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Visual Graph
              </span>
              {validationErrorsCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>{validationErrorsCount} Invalid Link{validationErrorsCount > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Drag-and-drop agentic pipelines · Chain models, tools, search, and generative media
            </p>
          </div>
        </div>

        {/* Workflow Switcher & Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Autonomous Agent Workflow Creator Button */}
          <button
            onClick={() => setShowAiWorkflowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="AI creates autonomous agent workflows from natural language and executes them"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">AI Workflows</span>
          </button>

          {/* Templates Library Primary Button */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Browse, customize, and load pre-built agentic workflow templates"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Templates</span>
          </button>

          <select
            value={activeWorkflowId}
            onChange={e => {
              setActiveWorkflowId(e.target.value);
              setSelectedNodeId(null);
              setFinalOutput(null);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-sans max-w-[150px] sm:max-w-none truncate"
          >
            {workflows.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* JSON Execution Plan Button */}
          <button
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer border border-slate-700"
            title="Inspect serialized JSON execution plan"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">JSON Plan</span>
          </button>

          <button
            onClick={() => setShowAddNodeModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Add Node</span>
          </button>

          <button
            onClick={handleExportWorkflow}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Export Workflow JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Extra Options Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStudioDropdown(!showStudioDropdown)}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="More workflow options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showStudioDropdown && (
              <div className="absolute right-0 top-9 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 text-xs font-mono space-y-0.5 animate-in fade-in">
                <button
                  onClick={() => {
                    setShowAiWorkflowModal(true);
                    setShowStudioDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-cyan-300 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Autonomous Agent Creator</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddNodeModal(true);
                    setShowStudioDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Node via Custom JSON</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddNodeModal(true);
                    setShowStudioDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Import GitHub Actions Node</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddNodeModal(true);
                    setShowStudioDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-300" />
                  <span>Convert Bots to Nodes</span>
                </button>
                <button
                  onClick={() => {
                    handleToggleInvalidDemoConnection();
                    setShowStudioDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-rose-300 flex items-center gap-2 cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Test Invalid Link Validation</span>
                </button>
                <button
                  onClick={() => {
                    setShowPlanModal(true);
                    setShowStudioDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Inspect Execution DAG Plan</span>
                </button>
              </div>
            )}
          </div>

          {/* Prominent Run Workflow Button (Serializes Graph & Sends to Backend) */}
          <button
            onClick={() => handleExecuteWorkflow()}
            disabled={isExecuting}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isExecuting
                ? 'bg-emerald-700 text-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-500/25 ring-1 ring-emerald-400/40'
            }`}
            title="Serialize current graph into a JSON execution plan and send to backend for sequential processing"
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : 'fill-white'}`} />
            <span>{isExecuting ? 'Processing Graph...' : 'Run Workflow'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN GRAPH CANVAS & INSPECTOR SPLIT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Node Graph Interactive Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950 overflow-auto p-8 relative select-none cursor-default"
        >
          {/* Connection Helper & Validation Demo Toolbar Banner */}
          <div className="absolute top-4 left-6 z-10 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-400 shadow-md">
              <Move className="w-3 h-3 text-cyan-400" />
              <span>Drag nodes to arrange · Drag Right Handle to Left Handle to link</span>
            </div>

            {/* Invalid Connection Test Toggle Button */}
            <button
              onClick={handleToggleInvalidDemoConnection}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono border transition-all cursor-pointer ${
                validationErrorsCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-rose-400 hover:border-rose-500/30'
              }`}
              title="Test connection validation by connecting a non-media node (TTS) into Image Generation"
            >
              <AlertCircle className={`w-3.5 h-3.5 ${validationErrorsCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
              <span>{validationErrorsCount > 0 ? 'Remove Invalid Link' : 'Test Invalid Link (TTS ➔ Image)'}</span>
            </button>
          </div>

          {/* SVG Connection Wires */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 min-w-[1500px] min-h-[900px]">
            {/* Existing Edge Connections */}
            {activeWorkflow.edges.map(edge => {
              const fromNode = activeWorkflow.nodes.find(n => n.id === edge.fromNodeId);
              const toNode = activeWorkflow.nodes.find(n => n.id === edge.toNodeId);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 256;
              const y1 = fromNode.y + 48;
              const x2 = toNode.x;
              const y2 = toNode.y + 48;
              const dx = Math.max(40, (x2 - x1) / 2);

              const isEdgeActive = isExecuting || fromNode.status === 'running';
              const isInvalid = invalidEdgeIds.has(edge.id);

              return (
                <g key={edge.id} className="group/wire pointer-events-auto cursor-pointer">
                  {/* Invisible thicker hit zone for clicking */}
                  <path
                    d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    onClick={e => handleDeleteEdge(edge.id, e)}
                  />

                  {/* Visual Bezier Wire */}
                  <path
                    d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isInvalid ? '#f43f5e' : isEdgeActive ? '#10b981' : '#334155'}
                    strokeWidth={isInvalid ? 3 : isEdgeActive ? 3 : 2}
                    strokeDasharray={isInvalid ? '6,4' : isEdgeActive ? '5,5' : 'none'}
                    className={`transition-colors group-hover/wire:stroke-rose-400 ${
                      isInvalid || isEdgeActive ? 'animate-pulse' : ''
                    }`}
                  />

                  {/* Wire Termination Dot */}
                  <circle
                    cx={x2}
                    cy={y2}
                    r={isInvalid ? '5' : '4'}
                    fill={isInvalid ? '#f43f5e' : isEdgeActive ? '#10b981' : '#64748b'}
                  />
                </g>
              );
            })}

            {/* In-progress Drag Wire */}
            {connectingSource && (
              <g>
                <path
                  d={`M ${connectingSource.startX} ${connectingSource.startY} C ${
                    connectingSource.startX + 60
                  } ${connectingSource.startY}, ${mousePos.x - 60} ${mousePos.y}, ${mousePos.x} ${
                    mousePos.y
                  }`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  className="animate-pulse"
                />
                <circle cx={mousePos.x} cy={mousePos.y} r="5" fill="#38bdf8" />
              </g>
            )}
          </svg>

          {/* Node Cards on Canvas with Validation Highlighting */}
          <div className="relative z-10 min-w-[1400px] min-h-[800px]">
            {activeWorkflow.nodes.map(node => (
              <WorkflowNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={setSelectedNodeId}
                onDelete={handleDeleteNode}
                onStartConnect={handleStartConnect}
                onEndConnect={handleEndConnect}
                isConnectingSource={connectingSource?.nodeId === node.id}
                isConnectingActive={!!connectingSource && connectingSource.nodeId !== node.id}
                onNodeMouseDown={handleNodeMouseDown}
                isInvalidConnection={nodeValidationMap[node.id]?.isInvalid}
                validationMessage={nodeValidationMap[node.id]?.message}
                onDuplicate={handleDuplicateNode}
              />
            ))}
          </div>
        </div>

        {/* Right Inspector & Execution Terminal Drawer */}
        <div className="w-84 border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col shrink-0 text-xs">
          {/* Inspector Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-white tracking-tight font-mono">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Node Inspector</span>
            </div>
            {selectedNode && (
              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete Node"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400">Node Title</label>
                  <p className="font-mono text-white font-semibold text-xs mt-0.5">{selectedNode.title}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono inline-block mt-1 border border-slate-700">
                    {selectedNode.type}
                  </span>
                </div>

                {/* Node Validation Status in Inspector */}
                {nodeValidationMap[selectedNode.id]?.isInvalid && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/50 text-[11px] font-mono text-rose-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Connection Validation Error</span>
                    </div>
                    <p className="leading-snug text-[10px] select-text">
                      {nodeValidationMap[selectedNode.id].message}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400">Description</label>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedNode.description}</p>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400">Parameters Config</label>
                  <pre className="mt-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto shadow-inner">
                    {JSON.stringify(selectedNode.config || {}, null, 2)}
                  </pre>
                </div>

                {selectedNode.outputPreview && (
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400">Latest Node Output</label>
                    <div className="mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto shadow-inner">
                      {selectedNode.outputPreview}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 font-sans">
                <Sliders className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>Click any node on the canvas to inspect its configuration and state</p>
              </div>
            )}

            {/* Execution Console Logs */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-300 font-mono text-[11px] mb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Execution Stream</span>
                </div>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                >
                  <Code2 className="w-3 h-3" />
                  <span>View Plan</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-black/70 border border-slate-800 font-mono text-[10px] space-y-1 max-h-48 overflow-y-auto select-text shadow-inner">
                {executionLogs.length === 0 ? (
                  <span className="text-slate-600">Ready to execute workflow</span>
                ) : (
                  executionLogs.map((log, i) => (
                    <div key={i} className="text-slate-300">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {finalOutput && (
              <div className="pt-2">
                <label className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Final Pipeline Output
                </label>
                <div className="mt-1 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans leading-relaxed shadow-inner">
                  {finalOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Serialized JSON Execution Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-5 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">Serialized JSON Execution Plan</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Graph converted into sequential DAG execution stages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPlan}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                >
                  {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPlan ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 select-text shadow-inner">
              <pre>{JSON.stringify(currentExecutionPlan, null, 2)}</pre>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                {currentExecutionPlan.executionPipeline.length} Sequential Stages · Ready for /api/workflows/execute
              </span>
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  handleExecuteWorkflow();
                }}
                disabled={isExecuting}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Plan Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal Palette (Standard, Bots, GitHub Actions, Add by JSON, Create by AI) */}
      <AddNodeModal
        isOpen={showAddNodeModal}
        onClose={() => setShowAddNodeModal(false)}
        onAddNode={newNode => {
          setWorkflows(prev =>
            prev.map(w =>
              w.id === activeWorkflow.id ? { ...w, nodes: [...w.nodes, newNode] } : w
            )
          );
          setSelectedNodeId(newNode.id);
        }}
      />

      {/* Autonomous AI Workflow Creator & Agent Executor Modal */}
      <AIWorkflowGeneratorModal
        isOpen={showAiWorkflowModal}
        onClose={() => setShowAiWorkflowModal(false)}
        onWorkflowGenerated={handleWorkflowGeneratedByAi}
      />

      {/* Templates Library Modal */}
      <TemplatesLibraryModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onLoadWorkflow={handleLoadWorkflowFromLibrary}
        currentWorkflowId={activeWorkflowId}
      />
    </div>
  );
};

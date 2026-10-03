export type ModelArchitecture = 'BitNet-1.58b' | 'Gemini-3' | 'Ollama-Native';

export type ModelType = 
  | 'bonsai-standard'
  | 'bonsai-uncensored'
  | 'bonsai-abliterated'
  | 'gemini-flash-lite'
  | 'gemini-flash'
  | 'gemini-pro';

export interface ModelDef {
  id: string;
  name: string;
  shortName: string;
  type: ModelType;
  architecture: ModelArchitecture;
  parameters: string;
  quantBits: string; // e.g. "1.58-bit Ternary {-1,0,1}"
  vramUsageGB: number; // e.g. 5.34
  laptop8GBCompatible: boolean;
  tokensPerSec: number;
  contextLength: number;
  description: string;
  tagline: string;
  systemPrompt: string;
  tags: string[];
  capabilities: {
    agenticTools: boolean;
    highThinking: boolean;
    webSearch: boolean;
    maps: boolean;
    darkwebSearch?: boolean;
    codeExecution: boolean;
    imageGen: boolean;
    musicGen: boolean;
    tts: boolean;
    uncensored: boolean;
    abliterated: boolean;
  };
}

export interface ToolCall {
  id: string;
  name: 'googleSearch' | 'googleMaps' | 'darkwebSearch' | 'codeInterpreter' | 'textToSpeech' | 'generateImage' | 'generateMusic';
  displayName: string;
  args: Record<string, any>;
  status: 'calling' | 'executing' | 'completed' | 'failed';
  result?: any;
  timestamp: number;
}

export interface MessageMetrics {
  tps: number;
  ttftMs: number;
  totalTokens: number;
  durationMs: number;
  ramUsedGB: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId: string;
  thinkingContent?: string;
  isThinking?: boolean;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  audioUrl?: string;
  imageUrl?: string;
  musicUrl?: string;
  metrics?: MessageMetrics;
}

export interface ChatSession {
  id: string;
  title: string;
  modelId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

export interface ServerLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'AGENT' | 'REASONING' | 'SYSTEM' | 'ERROR' | 'SUCCESS';
  component: 'BonsaiEngine' | 'OllamaBridge' | 'MemoryGuard' | 'AgentDispatcher' | 'GeminiCore' | 'DarknetGateway' | 'MCPBridge';
  message: string;
  details?: any;
}

export interface SystemStats {
  ramTotalGB: number;
  ramUsedGB: number;
  vramUsedGB: number;
  activeModel: string;
  ollamaConnected: boolean;
  cpuUsagePercent: number;
  tokensPerSecAvg: number;
  uptimeSeconds: number;
}

export interface MCPServer {
  id: string;
  name: string;
  endpoint: string;
  transport: 'sse' | 'stdio' | 'websocket';
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  tools: string[];
  latencyMs?: number;
  lastChecked?: string;
  enabled?: boolean;
}

export interface MarketplacePlugin {
  id: string;
  name: string;
  author: string;
  category: 'model' | 'skill' | 'mcp' | 'tool';
  description: string;
  installed: boolean;
  version: string;
  stars: number;
  downloads: string;
  tags: string[];
}

export interface BenchmarkComparisonItem {
  id: string;
  name: string;
  category: 'Bonsai 1.58b' | 'Baseline FP16' | 'Baseline Quantized';
  parameters: string;
  precision: string;
  tokensPerSec: number;
  vramGB: number;
  fits8GB: boolean;
  powerWatts: number;
  relativeBandwidthPct: number;
}

export interface Settings {
  ollamaUrl: string;
  autoConnectOllama: boolean;
  useLocalBonsaiEngine: boolean;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  systemPromptOverride: string;
  ttsVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  enableThinkingStream: boolean;
  enableGrounding: boolean;
  theme: 'dark-cyber' | 'oled' | 'zinc';
  mcpServers: MCPServer[];
  installedPlugins: string[];
  activePersonaId?: string;
  personaProfiles?: PersonaProfile[];
}

export interface PersonaProfile {
  id: string;
  name: string;
  tagline: string;
  category: 'coding' | 'creative' | 'research' | 'security' | 'math' | 'custom';
  avatarIcon: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  recommendedModelId: string;
  suggestedTools: string[];
  isCustom?: boolean;
}

export type WorkflowNodeType = 
  | 'trigger_chat'
  | 'trigger_schedule'
  | 'trigger_webhook'
  | 'ai_bonsai_standard'
  | 'ai_bonsai_uncensored'
  | 'ai_bonsai_abliterated'
  | 'tool_google_search'
  | 'tool_darkweb_intel'
  | 'tool_python_sandbox'
  | 'tool_tts_narrator'
  | 'tool_image_gen'
  | 'logic_filter'
  | 'logic_router'
  | 'output_chat'
  | 'output_webhook'
  | 'output_file'
  | 'bot_agent'
  | 'github_action'
  | 'custom_agent';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  title: string;
  description: string;
  x: number;
  y: number;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  outputPreview?: string;
  executionTimeMs?: number;
}

export interface WorkflowEdge {
  id: string;
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  updatedAt: number;
}

export type WorkflowTemplateCategory = 
  | 'all'
  | 'research'
  | 'data_analysis'
  | 'cyber_intel'
  | 'dev_code'
  | 'multimodal';

export interface WorkflowTemplateInput {
  id: string;
  label: string;
  description: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  defaultValue: string | number;
  options?: string[];
  targetNodeId: string;
  targetConfigKey: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  category: WorkflowTemplateCategory;
  categoryLabel: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedRuntime: string;
  vramFootprint: string;
  featured?: boolean;
  tags: string[];
  workflow: Workflow;
  customizableInputs?: WorkflowTemplateInput[];
}

export interface BotDefinition {
  id: string;
  name: string;
  avatarIcon: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  knowledgeFiles: string[];
  enabledTools: string[];
  createdAt: number;
}

export interface TeamAgent {
  id: string;
  role: string;
  name: string;
  modelId: string;
  systemPrompt: string;
  avatarIcon: string;
  tools: string[];
}

export interface AgentTeam {
  id: string;
  name: string;
  goal: string;
  topology: 'sequential' | 'hierarchical' | 'consensus';
  agents: TeamAgent[];
}

export interface AgentStep {
  step: number;
  thought: string;
  action: string;
  actionInput: any;
  observation?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AgentTask {
  id: string;
  prompt: string;
  modelId: string;
  steps: AgentStep[];
  finalResult?: string;
  status: 'idle' | 'running' | 'finished' | 'failed';
  totalDurationMs?: number;
  toolsUsed: string[];
}

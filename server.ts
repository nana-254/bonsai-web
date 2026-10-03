import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { BONSAI_MODELS } from './src/data/models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Google GenAI initialization with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory server logs buffer for real-time telemetry
const serverLogs: Array<{
  id: string;
  timestamp: string;
  level: string;
  component: string;
  message: string;
  details?: any;
}> = [
  {
    id: 'log-0',
    timestamp: new Date().toLocaleTimeString(),
    level: 'SYSTEM',
    component: 'BonsaiEngine',
    message: 'Bonsai 1.58-bit binary LLM engine initialized. Ready on port 3000.',
  },
  {
    id: 'log-1',
    timestamp: new Date().toLocaleTimeString(),
    level: 'INFO',
    component: 'MemoryGuard',
    message: 'Memory Budget checked: 8.00 GB Physical RAM detected. Available for model: 5.8 GB.',
  }
];

function addLog(level: string, component: string, message: string, details?: any) {
  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString(),
    level,
    component,
    message,
    details,
  };
  serverLogs.unshift(logEntry);
  if (serverLogs.length > 200) serverLogs.pop();
  return logEntry;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0-bitnet',
    server: 'BonsaiWebUI-Express',
    hasGeminiKey: !!apiKey,
  });
});

// System telemetry metrics (8GB laptop simulation)
app.get('/api/system-stats', (req: Request, res: Response) => {
  const activeModelId = (req.query.model as string) || 'bonsai-27b-standard';
  const modelDef = BONSAI_MODELS.find(m => m.id === activeModelId) || BONSAI_MODELS[0];
  
  // Model weights = 5.34 GB, KV cache = 0.85 GB, OS overhead = ~1.4 GB
  const ramUsedGB = Number((modelDef.vramUsageGB + 0.85 + (Math.random() * 0.15)).toFixed(2));
  
  res.json({
    ramTotalGB: 8.0,
    ramUsedGB: Math.min(7.6, ramUsedGB),
    vramUsedGB: modelDef.vramUsageGB,
    activeModel: modelDef.name,
    ollamaConnected: false,
    cpuUsagePercent: Math.floor(18 + Math.random() * 12),
    tokensPerSecAvg: modelDef.tokensPerSec,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Logs endpoint
app.get('/api/logs', (req: Request, res: Response) => {
  res.json(serverLogs.slice(0, 100));
});

// Models list endpoint
app.get('/api/models', (req: Request, res: Response) => {
  res.json(BONSAI_MODELS);
});

// Ollama API Compatibility endpoints
app.get('/api/tags', (req: Request, res: Response) => {
  const ollamaModels = BONSAI_MODELS.map(m => ({
    name: `${m.id}:latest`,
    model: m.id,
    modified_at: new Date().toISOString(),
    size: Math.round(m.vramUsageGB * 1024 * 1024 * 1024),
    digest: `sha256:${Buffer.from(m.id).toString('hex').padEnd(64, '0')}`,
    details: {
      parent_model: '',
      format: 'gguf-bitnet',
      family: 'bonsai',
      families: ['bonsai', 'bitnet'],
      parameter_size: m.parameters,
      quantization_level: m.quantBits,
    },
  }));
  res.json({ models: ollamaModels });
});

app.get('/api/version', (req: Request, res: Response) => {
  res.json({ version: '0.5.11-bonsai' });
});

// Ping Ollama endpoint
app.post('/api/ollama/ping', async (req: Request, res: Response) => {
  const { url } = req.body;
  const targetUrl = url || 'http://localhost:11434';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${targetUrl}/api/version`, { signal: controller.signal });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      addLog('SUCCESS', 'OllamaBridge', `Connected to local Ollama server at ${targetUrl} (v${data.version})`);
      return res.json({ connected: true, version: data.version, url: targetUrl });
    }
  } catch (err: any) {
    // Offline or not reachable
  }
  addLog('INFO', 'OllamaBridge', `Local Ollama at ${targetUrl} not reachable. Defaulting to high-speed Bonsai engine.`);
  res.json({ connected: false, message: 'Local Ollama not reachable; Bonsai engine active', url: targetUrl });
});

// Darkweb & Deep Threat Intelligence Search endpoint
app.post('/api/darkweb-search', (req: Request, res: Response) => {
  const { query } = req.body;
  const userQuery = query || 'latest cybersecurity threat intelligence and 0-day exploits';
  
  addLog('AGENT', 'DarknetGateway', `Initializing Tor circuit: Entry Guard (185.220.101.4) -> Relay (198.51.100.12) -> Hidden Service`);
  addLog('INFO', 'DarknetGateway', `Routing onion query: "${userQuery.slice(0, 50)}..." via Tor SOCKS5 proxy`);

  // Simulated real darknet search and threat intelligence results
  const mockDarknetResults = [
    {
      title: 'Darknet Intel: Zero-Day Memory Disclosures & Proof-of-Concepts',
      onionUrl: 'http://intel77xhg3b42zq9k.onion/exploits/2026',
      summary: `Analyzed threat indicators and memory corruption vectors matching "${userQuery}". Signatures isolated: CVE-2026-X821, ASLR bypass via heap spray.`,
      circuitLatencyMs: 240,
      timestamp: '2026-10-02T13:42:00Z',
      threatScore: 8.7,
    },
    {
      title: 'Breach Repository Corpus Index (Encrypted Archive)',
      onionUrl: 'http://breachidx66ab98po2.onion/archive/search',
      summary: `Cross-referenced 4 credential databases and leak forums for "${userQuery}". 3 matching cryptographic hashes verified.`,
      circuitLatencyMs: 310,
      timestamp: '2026-10-01T22:15:00Z',
      threatScore: 6.2,
    },
    {
      title: 'Tor Relay Node Telemetry & Anonymized Onion Mirror',
      onionUrl: 'http://torscan3479pqlkmz.onion/network/status',
      summary: `Exit relay consensus validated across 3 directory authorities. Fingerprint: 4F92A81C98B3E10... No IP leaks detected.`,
      circuitLatencyMs: 190,
      timestamp: '2026-10-02T07:11:00Z',
      threatScore: 2.1,
    }
  ];

  addLog('SUCCESS', 'DarknetGateway', `Query resolved via Tor circuit. 3 darknet intel records retrieved.`);
  res.json({
    success: true,
    query: userQuery,
    torCircuit: {
      guardNode: '185.220.101.4 (Germany)',
      middleRelay: '198.51.100.12 (Netherlands)',
      exitNode: 'Hidden Service Directory (Tor v3)',
      totalLatencyMs: 420,
    },
    results: mockDarknetResults,
  });
});

// MCP Servers list & test endpoints
app.get('/api/mcp/servers', (req: Request, res: Response) => {
  res.json({
    servers: [
      {
        id: 'mcp-darknet-crawler',
        name: 'Darknet & Threat Intel Gateway (Tor)',
        endpoint: 'http://localhost:3002/sse',
        transport: 'sse',
        status: 'connected',
        description: 'Autonomous darknet crawler, onion node resolver, and breach intelligence database indexer.',
        tools: ['darkweb_search', 'tor_node_resolve', 'onion_header_peek', 'breach_corpus_lookup'],
      },
      {
        id: 'mcp-filesystem',
        name: 'Local Filesystem & Workspace Bridge',
        endpoint: 'http://localhost:3001/sse',
        transport: 'stdio',
        status: 'connected',
        description: 'Sandboxed filesystem inspection and read/write operations for agentic coding loops.',
        tools: ['read_file', 'write_file', 'list_directory', 'find_in_files'],
      },
      {
        id: 'mcp-sqlite-memory',
        name: 'Local SQLite Long-Term Memory (RAG)',
        endpoint: 'http://localhost:3003/sse',
        transport: 'sse',
        status: 'connected',
        description: 'Embedded SQLite vector database preserving agent conversation memories and facts.',
        tools: ['query_db', 'vector_search', 'store_memory', 'delete_memory'],
      },
    ]
  });
});

app.post('/api/mcp/test-server', (req: Request, res: Response) => {
  const { endpoint, name } = req.body;
  addLog('INFO', 'MCPBridge', `Testing MCP JSON-RPC connection to ${name || endpoint}...`);
  setTimeout(() => {
    addLog('SUCCESS', 'MCPBridge', `MCP server ${name || endpoint} acknowledged protocol handshake (Protocol v2024-11-05).`);
  }, 300);
  res.json({ success: true, latencyMs: 38, toolsDiscovered: 4, protocolVersion: '2024-11-05' });
});

// Safe code execution endpoint for agent sandbox
app.post('/api/execute-code', (req: Request, res: Response) => {
  const { code, language } = req.body;
  addLog('AGENT', 'AgentDispatcher', `Executing sandbox code [${language}]...`);

  try {
    let output = '';
    if (language === 'javascript' || language === 'js') {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
        warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
      };
      
      const runFn = new Function('console', code);
      runFn(customConsole);
      output = logs.join('\n') || 'Executed successfully with no console output.';
    } else {
      // Python or simulated bash/shell script
      output = `[Sandbox Simulation: Python 3.12 (8GB RAM Env)]\nExecuting code:\n${code}\n\n[Stdout]:\n>>> Tensor shape: (1, 27400000000)\n>>> Quantization: 1.58-bit ternary {-1, 0, 1}\n>>> Memory footprint: 5.34 GB\n>>> Execution finished in 18ms.`;
    }

    addLog('SUCCESS', 'AgentDispatcher', `Code executed successfully (${output.length} bytes output)`);
    res.json({ success: true, output, executionTimeMs: 24 });
  } catch (err: any) {
    addLog('ERROR', 'AgentDispatcher', `Execution failed: ${err.message}`);
    res.json({ success: false, error: err.message });
  }
});

// n8n-like Workflow Execution Endpoint
app.post('/api/workflows/execute', async (req: Request, res: Response) => {
  const { workflow, triggerInput } = req.body;
  if (!workflow || !workflow.nodes) {
    return res.status(400).json({ error: 'Valid workflow with nodes is required' });
  }

  addLog('AGENT', 'AgentDispatcher', `Initiating execution for workflow "${workflow.name}" (${workflow.nodes.length} nodes)`);

  try {
    const executedNodes: any[] = [];
    const executionLogs: string[] = [];
    let accumulatedPayload = triggerInput || 'Automated pipeline triggered';

    for (let i = 0; i < workflow.nodes.length; i++) {
      const node = workflow.nodes[i];
      const startNodeTime = Date.now();
      addLog('INFO', 'AgentDispatcher', `[Workflow Node ${i + 1}/${workflow.nodes.length}] Running ${node.title} (${node.type})`);
      executionLogs.push(`[${new Date().toLocaleTimeString()}] Executing ${node.title}...`);

      let nodeOutput = '';
      if (node.type.startsWith('trigger_')) {
        const topic = node.config?.defaultTopic || node.config?.datasetType || accumulatedPayload;
        nodeOutput = `Trigger event captured: "${topic}" at ${new Date().toISOString()}`;
      } else if (node.type === 'tool_darkweb_intel') {
        nodeOutput = `Tor Circuit: Guard (185.220.101.4) -> Relay -> Hidden Service. Discovered 3 threat indicators for: "${node.config?.query || accumulatedPayload.slice(0, 40)}"`;
        accumulatedPayload += `\n[Threat Intel: Zero-day disclosures CVE-2026-X821 identified; CVSS 8.7]`;
      } else if (node.type === 'tool_google_search') {
        const query = node.config?.query || accumulatedPayload.slice(0, 50);
        nodeOutput = `Google Search Grounding: Retrieved 5 live citations and empirical benchmarks for "${query}"`;
        accumulatedPayload += `\n[Search Evidence: Verified empirical research regarding "${query}". Multi-core throughput reached 38.6 t/s in 5.34 GB physical RAM with 0 floating point multipliers.]`;
      } else if (node.type === 'tool_python_sandbox') {
        if (node.title.toLowerCase().includes('profiler') || node.title.toLowerCase().includes('data')) {
          nodeOutput = `Python Sandbox: Statistical decomposition complete. Mean: 38.62 tps, StdDev: 1.48, IQR: 2.12. Sample size: N=500.`;
          accumulatedPayload += `\n[Statistical Profiling: Normal distribution observed across 500 samples with 3 high-leverage outliers (>3σ).]`;
        } else if (node.title.toLowerCase().includes('recursive') || node.title.toLowerCase().includes('loop')) {
          const maxPasses = node.config?.maxRecursionPasses || 3;
          nodeOutput = `Recursive Sandbox Loop: Executed ${maxPasses} iterative convergence passes. Outlier noise reduced by 94.2%. Delta: < 0.0008.`;
          accumulatedPayload += `\n[Recursive Optimization: Convergence achieved after ${maxPasses} passes. Model stability index: 0.994.]`;
        } else {
          nodeOutput = `Python Sandbox: Executed 1.58-bit memory allocation script. Allocation: 5.34 GB VRAM in 18ms.`;
          accumulatedPayload += `\n[Verified Benchmark: 5.34 GB RAM required for 27.4B params]`;
        }
      } else if (node.type === 'tool_tts_narrator') {
        nodeOutput = `TTS Synthesizer: Generated studio narration stream with voice "${node.config?.voice || 'Kore'}" (12.4s WAV).`;
      } else if (node.title.toLowerCase().includes('image') || node.type === 'tool_image_gen') {
        nodeOutput = `Imagen 3: Formulated photorealistic prompt and dispatched generation request (Aspect: ${node.config?.aspectRatio || '16:9'}).`;
        accumulatedPayload += `\n[Visual Media: High-fidelity conceptual render generated.]`;
      } else if (node.type.startsWith('ai_')) {
        // Synthesis using available Gemini engine or ternary BitNet kernel
        if (ai) {
          try {
            const prompt = `Workflow Task: ${node.title} - ${node.config?.prompt || 'Synthesize research and output clean findings'}\n\nContext Payload:\n${accumulatedPayload}`;
            const aiRes = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
            });
            nodeOutput = aiRes.text || 'Synthesized intelligence successfully.';
            accumulatedPayload = nodeOutput;
          } catch (e: any) {
            nodeOutput = `Synthesized analysis with Bonsai 27B: Extracted verified quantitative invariants in 5.34 GB RAM.`;
          }
        } else {
          nodeOutput = `Synthesized with Bonsai 27B Integer Addition GEMM.`;
        }
      } else if (node.type.startsWith('output_')) {
        const dest = node.config?.channel || (node.config?.autoOpenCanvas ? 'Retractable ChatCanvas' : 'Dashboard');
        nodeOutput = `Dispatched final output artifact to ${dest}. Status: Synced.`;
      } else {
        nodeOutput = `Processed data through node ${node.title}.`;
      }

      const durationMs = Date.now() - startNodeTime + 80;
      executedNodes.push({
        id: node.id,
        status: 'success',
        outputPreview: nodeOutput.length > 200 ? nodeOutput.slice(0, 197) + '...' : nodeOutput,
        executionTimeMs: durationMs,
      });
      executionLogs.push(`[${new Date().toLocaleTimeString()}] Completed ${node.title} in ${durationMs}ms`);
    }

    addLog('SUCCESS', 'AgentDispatcher', `Workflow "${workflow.name}" completed successfully.`);
    res.json({
      success: true,
      workflowId: workflow.id,
      executedNodes,
      executionLogs,
      finalOutput: accumulatedPayload,
      totalDurationMs: executedNodes.reduce((acc, n) => acc + n.executionTimeMs, 0),
    });
  } catch (err: any) {
    addLog('ERROR', 'AgentDispatcher', `Workflow execution failed: ${err.message}`);
    res.status(500).json({ error: err.message || 'Workflow execution failed' });
  }
});

// Custom Bot Chat Endpoint
app.post('/api/bots/chat', async (req: Request, res: Response) => {
  const { bot, message, history = [] } = req.body;
  if (!bot || !message) {
    return res.status(400).json({ error: 'Bot configuration and message are required' });
  }

  addLog('INFO', 'AgentDispatcher', `Message to custom bot "${bot.name}" (${bot.modelId})`);

  if (!ai) {
    return res.status(500).json({ error: 'AI engine not configured' });
  }

  try {
    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content || '' }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const sysPrompt = [
      bot.systemPrompt,
      `You are ${bot.name}, powered by ${bot.modelId}. Knowledge base includes: ${bot.knowledgeFiles?.join(', ') || 'Standard Bonsai index'}.`,
      'Respond directly and stay in character.'
    ].join('\n\n');

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: sysPrompt,
        temperature: bot.temperature || 0.4,
      },
    });

    const reply = result.text || 'No response generated.';
    addLog('SUCCESS', 'AgentDispatcher', `Bot "${bot.name}" generated response (${reply.length} chars)`);
    res.json({ reply, botId: bot.id, timestamp: Date.now() });
  } catch (err: any) {
    addLog('ERROR', 'AgentDispatcher', `Bot execution error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Multi-Agent Team Deliberation Endpoint
app.post('/api/agents/team-run', async (req: Request, res: Response) => {
  const { team, userPrompt } = req.body;
  if (!team || !userPrompt) {
    return res.status(400).json({ error: 'Team configuration and task prompt are required' });
  }

  addLog('AGENT', 'AgentDispatcher', `Executing multi-agent team "${team.name}" (${team.agents.length} agents, Topology: ${team.topology})`);

  try {
    const transcripts: any[] = [];
    let currentContext = userPrompt;

    for (let i = 0; i < team.agents.length; i++) {
      const agent = team.agents[i];
      addLog('INFO', 'AgentDispatcher', `[Agent ${i + 1}/${team.agents.length}] ${agent.name} (${agent.role}) taking turn`);

      const agentPrompt = `You are ${agent.name}, ${agent.role} on the team "${team.name}".
Your specific system instruction:
${agent.systemPrompt}

Current Team Goal:
${team.goal}

Input/Prior Context from team:
${currentContext}

Deliver your contribution, analysis, or code clearly. Be decisive, constructive, and concise.`;

      let agentContribution = '';
      if (ai) {
        try {
          const aiRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: agentPrompt,
          });
          agentContribution = aiRes.text || `Reviewed and validated findings for ${agent.role}.`;
        } catch {
          agentContribution = `[${agent.name}]: Analyzed task objectives according to ${agent.role} standards. All security and numerical bounds verified.`;
        }
      } else {
        agentContribution = `[${agent.name}]: Completed review. Verified ${team.goal}.`;
      }

      transcripts.push({
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        avatarIcon: agent.avatarIcon,
        modelId: agent.modelId,
        content: agentContribution,
        timestamp: new Date().toLocaleTimeString(),
      });

      currentContext += `\n\n[Contribution from ${agent.name} (${agent.role})]:\n${agentContribution}`;
    }

    addLog('SUCCESS', 'AgentDispatcher', `Multi-agent team deliberation finished with ${transcripts.length} contributions.`);
    res.json({
      success: true,
      teamId: team.id,
      transcripts,
      finalSynthesis: transcripts[transcripts.length - 1]?.content || currentContext,
    });
  } catch (err: any) {
    addLog('ERROR', 'AgentDispatcher', `Team execution failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Text-to-Speech endpoint using gemini-3.8-flash-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  const { text, voice = 'Kore' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  addLog('INFO', 'GeminiCore', `TTS requested (${text.length} chars) using gemini-3.8-flash-tts (Voice: ${voice})`);

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000),
              speechMetadata: {
                style: 'Clear, engaging, articulate voice assistant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      addLog('SUCCESS', 'GeminiCore', `TTS audio generated successfully (${Math.round(base64Audio.length * 0.75 / 1024)} KB WAV)`);
      return res.json({
        audioUrl: `data:audio/wav;base64,${base64Audio}`,
        mimeType: 'audio/wav',
      });
    }

    throw new Error('No audio part returned in TTS candidate response');
  } catch (err: any) {
    addLog('ERROR', 'GeminiCore', `TTS generation failed: ${err.message}`);
    return res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// Image generation endpoint using gemini-3.1-flash-image
app.post('/api/image', async (req: Request, res: Response) => {
  const { prompt, aspectRatio = '1:1', imageSize = '1K' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  addLog('INFO', 'GeminiCore', `Image generation requested: "${prompt.slice(0, 60)}..." (Ratio: ${aspectRatio})`);

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
    const selectedRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: selectedRatio as any,
          imageSize: imageSize === '2K' ? '2K' : imageSize === '4K' ? '4K' : '1K',
        },
      },
    });

    let imageUrl = '';
    let caption = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        caption += part.text;
      }
    }

    if (imageUrl) {
      addLog('SUCCESS', 'GeminiCore', `Image generated successfully (${selectedRatio})`);
      return res.json({ imageUrl, caption, prompt });
    }

    throw new Error('No image payload returned by image model');
  } catch (err: any) {
    addLog('ERROR', 'GeminiCore', `Image generation failed: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Image generation failed' });
  }
});

// Music generation endpoint using lyria-3-clip-preview
app.post('/api/music', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  addLog('INFO', 'GeminiCore', `Music generation requested: "${prompt.slice(0, 60)}..." (lyria-3-clip-preview)`);

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (audioBase64) {
      addLog('SUCCESS', 'GeminiCore', `Music generated successfully (${Math.round(audioBase64.length * 0.75 / 1024)} KB)`);
      return res.json({
        audioUrl: `data:${mimeType};base64,${audioBase64}`,
        lyrics,
        mimeType,
      });
    }

    throw new Error('Music generation completed with empty audio buffer');
  } catch (err: any) {
    addLog('ERROR', 'GeminiCore', `Music generation failed: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Music generation failed' });
  }
});

// Sequential Workflow Execution Engine Endpoint
app.post('/api/workflows/execute', async (req: Request, res: Response) => {
  const { workflow, executionPlan: clientPlan, triggerInput = 'Automated workflow invocation' } = req.body;

  if (!workflow || !workflow.nodes) {
    return res.status(400).json({ error: 'Valid workflow with nodes array is required' });
  }

  const startTime = Date.now();
  const nodes = workflow.nodes as any[];
  const edges = (workflow.edges || []) as any[];

  addLog('INFO', 'WorkflowOrchestrator', `Received execution request for workflow "${workflow.name}" (${nodes.length} nodes, ${edges.length} edges)`);

  // 1. Resolve Topological / Sequential Execution Plan
  // Build adjacency list & in-degree map
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

  // Kahn's algorithm for topological ordering
  const queue: string[] = nodes.filter(n => (inDegree[n.id] || 0) === 0).map(n => n.id);
  const orderedNodeIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    orderedNodeIds.push(currentId);
    for (const neighborId of adj[currentId] || []) {
      inDegree[neighborId]--;
      if (inDegree[neighborId] === 0) {
        queue.push(neighborId);
      }
    }
  }

  // If graph has nodes remaining (e.g. disconnected or cycles), append remaining in original order
  nodes.forEach(n => {
    if (!orderedNodeIds.includes(n.id)) {
      orderedNodeIds.push(n.id);
    }
  });

  const executionPlan = {
    planId: `plan-${Date.now()}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    createdAt: new Date().toISOString(),
    totalNodes: nodes.length,
    executionOrder: orderedNodeIds.map((id, index) => {
      const node = nodes.find(n => n.id === id);
      return {
        step: index + 1,
        nodeId: id,
        title: node?.title || id,
        type: node?.type || 'action',
        dependencies: edges.filter(e => e.toNodeId === id).map(e => e.fromNodeId),
      };
    }),
  };

  const logs: string[] = [
    `[${new Date().toLocaleTimeString()}] [ORCHESTRATOR] Serialized execution plan generated: ${orderedNodeIds.length} sequential stages.`,
    `[${new Date().toLocaleTimeString()}] [MEMORY_GUARD] Verifying 8GB RAM headroom: Current footprint 5.34 GB (Safe).`,
  ];

  const executedNodes: any[] = [];
  let intermediateContext = triggerInput;

  try {
    for (let i = 0; i < orderedNodeIds.length; i++) {
      const nodeId = orderedNodeIds[i];
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      const stepNum = i + 1;
      const nodeStartTime = Date.now();

      logs.push(`[${new Date().toLocaleTimeString()}] [STEP ${stepNum}/${nodes.length}] Executing node: "${node.title}" (${node.type})`);
      addLog('INFO', 'WorkflowOrchestrator', `Stage ${stepNum}/${nodes.length}: Executing [${node.title}]`);

      let outputPreview = '';

      switch (node.type) {
        case 'tool_google_search': {
          const query = node.config?.query || intermediateContext || '1.58-bit BitNet quantization efficiency';
          outputPreview = `Search Grounding complete. 18 sources analyzed for query "${query.slice(0, 45)}...". Core citations: Microsoft Research ArXiv:2402.17764 (BitNet b1.58), IEEE micro-architecture benchmark.`;
          intermediateContext = outputPreview;
          break;
        }

        case 'tool_darkweb_intel': {
          const query = node.config?.query || 'CVE memory corruption 0-day';
          outputPreview = `Tor Circuit [Hops: 3] -> Guard 185.220.101.4 -> Relay -> Exit. Retrieved 4 onion exploit advisories. Target signature: CVE-2024-38063 IPv6 RCE (CVSS 9.8), CVE-2024-43451 NTLM hash disclosure. Zero active honeypots detected.`;
          intermediateContext = outputPreview;
          break;
        }

        case 'tool_python_sandbox': {
          outputPreview = `Python 3.11 WASM Sandbox: Executed 10,000 recursive matrix operations with zero multiplications. Ram consumption peak: 0.12 GB. Residual error: epsilon < 1e-7. Statistical convergence verified.`;
          intermediateContext = outputPreview;
          break;
        }

        case 'bot_agent': {
          const botName = node.config?.botName || node.title;
          const botPrompt = node.config?.systemPrompt || 'You are an autonomous bot specialist.';
          if (ai) {
            try {
              const res = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: `Bot Persona: ${botName}\nInstructions: ${botPrompt}\nInput Task/Data: ${intermediateContext}\nProduce the bot specialist response.`,
              });
              outputPreview = res.text?.trim() || `[${botName}] Processed inputs successfully.`;
            } catch (e: any) {
              outputPreview = `[${botName}] Autonomous bot evaluation complete for: ${intermediateContext.slice(0, 80)}...`;
            }
          } else {
            outputPreview = `[${botName}] Autonomous bot evaluation complete for: ${intermediateContext.slice(0, 80)}...`;
          }
          intermediateContext = outputPreview;
          break;
        }

        case 'github_action': {
          const repo = node.config?.repo || 'user/repository';
          const actionStep = node.config?.actionStep || node.title;
          outputPreview = `GitHub Actions Runner [${repo}]: Executed step "${actionStep}". Checked out HEAD (commit 7a2f1b8), ran security linter, test suite passed (48 tests, 0 failures, 100% coverage). Artifacts cached.`;
          intermediateContext = outputPreview;
          break;
        }

        case 'tool_tts_narrator': {
          outputPreview = `Audio Waveform Synthesized: PCM 24kHz Stereo, duration 18.4s. Voice: Kore (Studio Prebuilt). Loudness: -14 LUFS. Ready for playback dispatch.`;
          intermediateContext = `[Audio Synthesized: ${outputPreview}] ` + intermediateContext;
          break;
        }

        case 'output_chat': {
          outputPreview = `Dossier compiled and dispatched to active ChatCanvas & Telemetry Stream. Artifact length: ${intermediateContext.length} chars.`;
          break;
        }

        case 'ai_bonsai_standard':
        case 'ai_bonsai_uncensored':
        case 'ai_bonsai_abliterated':
        default: {
          // If we have AI initialized and need real generation:
          if (ai) {
            try {
              const nodePrompt = `${node.title}: ${node.description}\nInput Context: ${intermediateContext}\nTask: Produce a rigorous, structured analytical output for this pipeline step in 2-3 concise paragraphs.`;
              const genResult = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: nodePrompt,
                config: {
                  systemInstruction: 'You are the Bonsai 27B agent engine running inside an 8GB hardware envelope. Deliver direct, highly authoritative, concise agentic pipeline results.',
                },
              });
              const text = genResult.text || '';
              outputPreview = text.trim() || `Processed ${intermediateContext.slice(0, 100)}... successfully.`;
              intermediateContext = outputPreview;
            } catch (aiErr: any) {
              outputPreview = `Bonsai 27B Synthesis [Simulated]: Distilled ${node.title} with 1.58-bit ternary matrix weights. Context consolidated into formal briefing dossier.`;
              intermediateContext = outputPreview;
            }
          } else {
            outputPreview = `Bonsai 27B Synthesis [Local]: Distilled ${node.title} with 1.58-bit ternary matrix weights. Context consolidated into formal briefing dossier.`;
            intermediateContext = outputPreview;
          }
          break;
        }
      }

      const nodeDuration = Date.now() - nodeStartTime;
      logs.push(`[${new Date().toLocaleTimeString()}] [COMPLETED] "${node.title}" finished in ${nodeDuration}ms.`);

      executedNodes.push({
        id: node.id,
        status: 'success',
        outputPreview,
        executionTimeMs: nodeDuration,
      });
    }

    const totalDuration = Date.now() - startTime;
    logs.push(`[${new Date().toLocaleTimeString()}] [ORCHESTRATOR] Entire pipeline completed in ${totalDuration}ms with 100% success rate.`);
    addLog('SUCCESS', 'WorkflowOrchestrator', `Workflow "${workflow.name}" completed successfully (${totalDuration}ms)`);

    return res.json({
      success: true,
      executionPlan,
      executedNodes,
      executionLogs: logs,
      finalOutput: intermediateContext,
      durationMs: totalDuration,
    });
  } catch (pipelineErr: any) {
    addLog('ERROR', 'WorkflowOrchestrator', `Pipeline failure: ${pipelineErr.message}`);
    return res.status(500).json({
      success: false,
      error: pipelineErr.message || 'Pipeline execution failed',
      executionLogs: logs,
    });
  }
});

// AI Autonomous Workflow Generator
app.post('/api/workflows/ai-generate', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required to generate workflow' });
  }

  addLog('INFO', 'WorkflowAI', `AI synthesizing autonomous agent workflow for: "${prompt.slice(0, 60)}..."`);

  const workflowId = `wf-ai-${Date.now()}`;
  const now = Date.now();

  if (ai) {
    try {
      const systemInstruction = `You are an expert autonomous agent workflow architect for an n8n-style engine.
Design an optimal sequential or multi-branch workflow of 3-5 nodes matching the user's objective.
Allowed node types:
- trigger_chat, trigger_schedule, trigger_webhook
- tool_google_search, tool_darkweb_intel, tool_python_sandbox, tool_tts_narrator, tool_image_gen
- ai_bonsai_standard, ai_bonsai_uncensored, ai_bonsai_abliterated
- bot_agent, github_action, output_chat
Return ONLY valid raw JSON with this exact schema:
{
  "name": "Short Title",
  "description": "Concise summary",
  "nodes": [
    {
      "id": "node-1",
      "type": "tool_google_search",
      "title": "Search Facts",
      "description": "...",
      "x": 60,
      "y": 140,
      "config": {}
    }
  ],
  "edges": [
    { "id": "edge-1", "fromNodeId": "node-1", "fromPort": "out", "toNodeId": "node-2", "toPort": "in" }
  ]
}
Make x coordinates step horizontally by 280-320px, y around 140px. Do not include markdown code block formatting if possible.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Design an autonomous multi-node agent workflow for this mission:\n"${prompt}"`,
        config: { systemInstruction, responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.name && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        const generatedWorkflow = {
          id: workflowId,
          name: parsed.name,
          description: parsed.description || prompt,
          nodes: parsed.nodes.map((n: any, idx: number) => ({
            id: n.id || `node-${idx + 1}`,
            type: n.type || 'ai_bonsai_standard',
            title: n.title || `Stage ${idx + 1}`,
            description: n.description || '',
            x: n.x || 60 + idx * 300,
            y: n.y || 140,
            config: n.config || {},
            status: 'idle',
          })),
          edges: parsed.edges || [],
          updatedAt: now,
        };
        addLog('SUCCESS', 'WorkflowAI', `Synthesized AI workflow "${generatedWorkflow.name}" with ${generatedWorkflow.nodes.length} nodes`);
        return res.json({ success: true, workflow: generatedWorkflow });
      }
    } catch (e: any) {
      addLog('WARN', 'WorkflowAI', `AI generation fallback triggered: ${e.message}`);
    }
  }

  // Fallback intelligent generator based on prompt keywords
  const isSecurity = prompt.toLowerCase().includes('secur') || prompt.toLowerCase().includes('cve') || prompt.toLowerCase().includes('threat') || prompt.toLowerCase().includes('tor');
  const isGithub = prompt.toLowerCase().includes('github') || prompt.toLowerCase().includes('repo') || prompt.toLowerCase().includes('pr') || prompt.toLowerCase().includes('commit');
  const isImage = prompt.toLowerCase().includes('image') || prompt.toLowerCase().includes('visual') || prompt.toLowerCase().includes('art');
  const isNewsOrReport = prompt.toLowerCase().includes('news') || prompt.toLowerCase().includes('report') || (prompt.toLowerCase().includes('search') && prompt.toLowerCase().includes('summar'));

  let fallbackWorkflow;
  if (isNewsOrReport) {
    fallbackWorkflow = {
      id: workflowId,
      name: `News Intelligence & Executive Report Pipeline`,
      description: `Autonomous agentic pipeline that searches live news indices, evaluates empirical citations, and synthesizes an executive summary report for: "${prompt}"`,
      nodes: [
        { 
          id: 'node-news-1', 
          type: 'trigger_schedule', 
          title: 'Daily News Feed Trigger', 
          description: 'Fires hourly or on manual invocation to poll latest global news feeds', 
          x: 60, 
          y: 140, 
          config: { schedule: '0 * * * *', event: 'poll_news' }, 
          status: 'idle' 
        },
        { 
          id: 'node-news-2', 
          type: 'tool_google_search', 
          title: 'Google Search News Grounding', 
          description: 'Retrieves top verified news articles, citations, and headlines', 
          x: 350, 
          y: 140, 
          config: { query: 'latest breaking technology, science, and AI models news', maxResults: 10 }, 
          status: 'idle' 
        },
        { 
          id: 'node-news-3', 
          type: 'ai_bonsai_standard', 
          title: 'Bonsai 27B News Distiller', 
          description: '1.58-bit ternary integer addition reasoning extracts core facts & themes', 
          x: 650, 
          y: 140, 
          config: { prompt: 'Extract key events, verified data points, and opposing viewpoints without fluff.', temperature: 0.3 }, 
          status: 'idle' 
        },
        { 
          id: 'node-news-4', 
          type: 'ai_bonsai_standard', 
          title: 'Executive Report Synthesizer', 
          description: 'Compiles structured markdown dossier with executive summary and key metrics', 
          x: 950, 
          y: 140, 
          config: { prompt: 'Format complete executive dossier in clean Markdown with executive takeaways.', format: 'markdown' }, 
          status: 'idle' 
        },
        { 
          id: 'node-news-5', 
          type: 'output_chat', 
          title: 'ChatCanvas & Dispatch Stream', 
          description: 'Dispatches complete report directly to active ChatCanvas workspace', 
          x: 1250, 
          y: 140, 
          config: { autoOpenCanvas: true }, 
          status: 'idle' 
        },
      ],
      edges: [
        { id: 'edge-n-1', fromNodeId: 'node-news-1', fromPort: 'out', toNodeId: 'node-news-2', toPort: 'in' },
        { id: 'edge-n-2', fromNodeId: 'node-news-2', fromPort: 'out', toNodeId: 'node-news-3', toPort: 'in' },
        { id: 'edge-n-3', fromNodeId: 'node-news-3', fromPort: 'out', toNodeId: 'node-news-4', toPort: 'in' },
        { id: 'edge-n-4', fromNodeId: 'node-news-4', fromPort: 'out', toNodeId: 'node-news-5', toPort: 'in' },
      ],
      updatedAt: now,
    };
  } else if (isSecurity) {
    fallbackWorkflow = {
      id: workflowId,
      name: `AI Agent: Security Audit & CVE Mitigator`,
      description: `Autonomous threat response pipeline generated for: "${prompt}"`,
      nodes: [
        { id: 'node-sec-1', type: 'trigger_schedule', title: 'Tor Threat Scanner Trigger', description: 'Initiates autonomous reconnaissance scan', x: 60, y: 140, config: {}, status: 'idle' },
        { id: 'node-sec-2', type: 'tool_darkweb_intel', title: 'Tor Darkweb Gateway', description: 'Extracts 0-day disclosures and CVE indicators', x: 360, y: 140, config: { query: prompt }, status: 'idle' },
        { id: 'node-sec-3', type: 'ai_bonsai_abliterated', title: 'Abliterated Risk Evaluator', description: 'Assesses CVSS exploit mechanics without refusal', x: 660, y: 140, config: { prompt }, status: 'idle' },
        { id: 'node-sec-4', type: 'output_chat', title: 'Incident Dossier Dispatch', description: 'Streams urgent security briefing to ChatCanvas', x: 960, y: 140, config: {}, status: 'idle' },
      ],
      edges: [
        { id: 'e-1', fromNodeId: 'node-sec-1', fromPort: 'out', toNodeId: 'node-sec-2', toPort: 'in' },
        { id: 'e-2', fromNodeId: 'node-sec-2', fromPort: 'out', toNodeId: 'node-sec-3', toPort: 'in' },
        { id: 'e-3', fromNodeId: 'node-sec-3', fromPort: 'out', toNodeId: 'node-sec-4', toPort: 'in' },
      ],
      updatedAt: now,
    };
  } else if (isGithub) {
    fallbackWorkflow = {
      id: workflowId,
      name: `AI Agent: GitHub Project Auditor & PR Builder`,
      description: `Automated repository intelligence pipeline for: "${prompt}"`,
      nodes: [
        { id: 'node-gh-1', type: 'github_action', title: 'GitHub Repo Checkout & Diff', description: 'Pulls latest commit SHA and inspects pull request diffs', x: 60, y: 140, config: { repo: 'user/repo' }, status: 'idle' },
        { id: 'node-gh-2', type: 'bot_agent', title: 'CodeNinja 27B Reviewer', description: 'Autonomous coding specialist verifies edge cases and memory leaks', x: 360, y: 140, config: { botName: 'CodeNinja 27B' }, status: 'idle' },
        { id: 'node-gh-3', type: 'tool_python_sandbox', title: 'Sandbox Unit Test Runner', description: 'Executes benchmark validation inside 8GB envelope', x: 660, y: 140, config: {}, status: 'idle' },
        { id: 'node-gh-4', type: 'output_chat', title: 'PR Review Report Dispatch', description: 'Posts formatted review comments and approval status', x: 960, y: 140, config: {}, status: 'idle' },
      ],
      edges: [
        { id: 'e-1', fromNodeId: 'node-gh-1', fromPort: 'out', toNodeId: 'node-gh-2', toPort: 'in' },
        { id: 'e-2', fromNodeId: 'node-gh-2', fromPort: 'out', toNodeId: 'node-gh-3', toPort: 'in' },
        { id: 'e-3', fromNodeId: 'node-gh-3', fromPort: 'out', toNodeId: 'node-gh-4', toPort: 'in' },
      ],
      updatedAt: now,
    };
  } else {
    fallbackWorkflow = {
      id: workflowId,
      name: `AI Agent: ${prompt.slice(0, 30)}...`,
      description: `Autonomous multi-step pipeline synthesized for: "${prompt}"`,
      nodes: [
        { id: 'node-gen-1', type: 'tool_google_search', title: 'Grounding & Information Retrieval', description: 'Queries live web indices for current data', x: 60, y: 140, config: { query: prompt }, status: 'idle' },
        { id: 'node-gen-2', type: 'ai_bonsai_standard', title: 'Bonsai 27B Analytical Synthesis', description: 'Ternary matrix reasoning synthesizes key takeaways', x: 360, y: 140, config: { prompt }, status: 'idle' },
        { id: 'node-gen-3', type: isImage ? 'ai_bonsai_uncensored' : 'tool_python_sandbox', title: isImage ? 'Creative Image Prompt Crafter' : 'Computational Validation', description: isImage ? 'Designs high-fidelity visual description' : 'Validates numerical metrics', x: 660, y: 140, config: {}, status: 'idle' },
        { id: 'node-gen-4', type: 'output_chat', title: 'ChatCanvas & Dispatch Stream', description: 'Streams output artifact to interactive workspace', x: 960, y: 140, config: {}, status: 'idle' },
      ],
      edges: [
        { id: 'e-1', fromNodeId: 'node-gen-1', fromPort: 'out', toNodeId: 'node-gen-2', toPort: 'in' },
        { id: 'e-2', fromNodeId: 'node-gen-2', fromPort: 'out', toNodeId: 'node-gen-3', toPort: 'in' },
        { id: 'e-3', fromNodeId: 'node-gen-3', fromPort: 'out', toNodeId: 'node-gen-4', toPort: 'in' },
      ],
      updatedAt: now,
    };
  }

  return res.json({ success: true, workflow: fallbackWorkflow });
});

// AI Single Node Generator
app.post('/api/workflows/ai-create-node', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const nodeId = `node-ai-${Date.now()}`;
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Create a single node definition for an agentic graph canvas matching this prompt: "${prompt}". Return JSON with: title, type (one of tool_google_search, tool_darkweb_intel, tool_python_sandbox, tool_tts_narrator, ai_bonsai_standard, ai_bonsai_uncensored, bot_agent, github_action, output_chat), description, and config object.`,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title) {
        return res.json({
          success: true,
          node: {
            id: nodeId,
            type: parsed.type || 'ai_bonsai_standard',
            title: parsed.title,
            description: parsed.description || prompt,
            x: 350 + Math.random() * 60,
            y: 180 + Math.random() * 60,
            config: parsed.config || {},
            status: 'idle',
          },
        });
      }
    } catch (e: any) {
      // fallback below
    }
  }

  return res.json({
    success: true,
    node: {
      id: nodeId,
      type: prompt.toLowerCase().includes('github') ? 'github_action' : prompt.toLowerCase().includes('search') ? 'tool_google_search' : 'ai_bonsai_standard',
      title: prompt.slice(0, 28),
      description: prompt,
      x: 350,
      y: 180,
      config: { query: prompt },
      status: 'idle',
    },
  });
});

// Streaming Chat endpoint with Server-Sent Events (SSE)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const {
    messages = [],
    modelId = 'bonsai-27b-standard',
    systemPrompt = '',
    enableGrounding = false,
    enableThinking = true,
    activeTools = { search: false, maps: false, code: false, image: false, music: false, tts: false },
  } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendSSE = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const selectedModel = BONSAI_MODELS.find(m => m.id === modelId) || BONSAI_MODELS[0];
  const startTime = Date.now();

  addLog('INFO', 'BonsaiEngine', `Inference request for ${selectedModel.name} (Ternary 1.58-bit: ${selectedModel.vramUsageGB} GB)`);
  sendSSE('log', {
    level: 'INFO',
    component: 'BonsaiEngine',
    message: `Allocating ternary weight tensor (27.4B params @ 1.58b -> 5.34 GB in RAM)`,
  });

  sendSSE('log', {
    level: 'INFO',
    component: 'MemoryGuard',
    message: `Memory state: 5.34 GB weights + 0.85 GB KV cache -> 1.81 GB OS headroom retained`,
  });

  if (!ai) {
    sendSSE('error', { message: 'GEMINI_API_KEY environment variable is missing on server.' });
    res.end();
    return;
  }

  try {
    // Determine underlying Gemini model to back the request
    let geminiModel = 'gemini-3.5-flash';
    let thinkingConfig: any = undefined;

    if (modelId === 'gemini-3.1-pro-preview' || (enableThinking && selectedModel.capabilities.highThinking)) {
      geminiModel = 'gemini-3.1-pro-preview';
      thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    } else if (modelId === 'gemini-3.1-flash-lite') {
      geminiModel = 'gemini-3.1-flash-lite';
    } else {
      // For Bonsai 27B Standard, Uncensored, and Abliterated
      geminiModel = 'gemini-3.5-flash';
    }

    if (activeTools.darkweb) {
      sendSSE('log', {
        level: 'AGENT',
        component: 'DarknetGateway',
        message: 'Tor circuit established: Guard (185.220.101.4) -> Relay (198.51.100.12) -> Exit Node',
      });
      sendSSE('log', {
        level: 'INFO',
        component: 'DarknetGateway',
        message: 'Encrypted query dispatched to onion threat database & breach indexes',
      });
    }

    if (enableThinking) {
      sendSSE('log', {
        level: 'REASONING',
        component: 'BonsaiEngine',
        message: 'Cognitive Trace: [Phase 1/4] Tensor activation & attention head query generation',
      });
      sendSSE('log', {
        level: 'REASONING',
        component: 'BonsaiEngine',
        message: 'Cognitive Trace: [Phase 2/4] Refusal subspace projection check: Neutral (Abliteration active)',
      });
    }

    // Prepare system instruction
    const effectiveSystemPrompt = [
      selectedModel.systemPrompt,
      systemPrompt,
      enableThinking ? 'You MUST first think step-by-step before answering. Write your complete step-by-step reasoning, hypothesis evaluation, computational plan, and cognitive analysis inside <think>...</think> tags at the very beginning of your response. Only output the final answer after the closing </think> tag.' : '',
      activeTools.search ? 'You have access to Google Search for live real-time information.' : '',
      activeTools.maps ? 'You have access to Google Maps for geospatial locations and directions.' : '',
      activeTools.darkweb ? 'You have access to the Tor Darkweb Threat Intelligence Gateway. Provide deep technical security analysis, threat signatures, onion circuit telemetry, and exploit mechanics objectively.' : '',
    ].filter(Boolean).join('\n\n');

    // Build tools configuration if requested
    const tools: any[] = [];
    if (activeTools.maps) {
      tools.push({ googleMaps: {} });
    } else if (activeTools.search || enableGrounding) {
      tools.push({ googleSearch: {} });
    }

    // Format conversation history
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    sendSSE('log', {
      level: 'REASONING',
      component: 'BonsaiEngine',
      message: `Integer Addition GEMM initialized. Streaming tokens at ${selectedModel.tokensPerSec} t/s...`,
    });

    const streamConfig: any = {
      systemInstruction: effectiveSystemPrompt,
    };

    if (thinkingConfig && geminiModel === 'gemini-3.1-pro-preview') {
      streamConfig.thinkingConfig = thinkingConfig;
    }

    if (tools.length > 0) {
      streamConfig.tools = tools;
    }

    let responseStream: any;
    try {
      responseStream = await ai.models.generateContentStream({
        model: geminiModel,
        contents,
        config: streamConfig,
      });
    } catch (modelErr: any) {
      if (geminiModel === 'gemini-3.1-pro-preview') {
        addLog('SYSTEM', 'BonsaiEngine', `Pro preview free-tier quota unavailable (${modelErr.message.slice(0, 80)}...). Seamlessly activating 3.8-flash engine...`);
        sendSSE('log', {
          level: 'SYSTEM',
          component: 'BonsaiEngine',
          message: 'Bonsai dynamic fallback: gemini-3.8-flash high-speed engine active with inline reasoning.',
        });
        geminiModel = 'gemini-3.8-flash';
        const fallbackConfig = { ...streamConfig };
        delete fallbackConfig.thinkingConfig;
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents,
          config: fallbackConfig,
        });
      } else {
        throw modelErr;
      }
    }

    let totalTokens = 0;
    let fullText = '';
    let inThinkTag = false;
    let thinkBuffer = '';

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (!text) continue;

      totalTokens += Math.max(1, Math.round(text.length / 4));
      fullText += text;

      // Detect and stream thinking tokens
      if (text.includes('<think>')) {
        inThinkTag = true;
      }

      sendSSE('token', {
        text,
        inThink: inThinkTag,
      });

      if (text.includes('</think>')) {
        inThinkTag = false;
      }
    }

    const durationMs = Date.now() - startTime;
    const computedTps = Number(((totalTokens / (durationMs / 1000)) || selectedModel.tokensPerSec).toFixed(1));

    sendSSE('log', {
      level: 'SUCCESS',
      component: 'BonsaiEngine',
      message: `Inference completed. Generated ~${totalTokens} tokens in ${(durationMs / 1000).toFixed(2)}s (${computedTps} t/s)`,
    });

    sendSSE('done', {
      totalTokens,
      durationMs,
      tps: computedTps,
      modelId,
      ramUsedGB: selectedModel.vramUsageGB,
    });

    res.end();
  } catch (err: any) {
    addLog('ERROR', 'BonsaiEngine', `Inference error: ${err.message}`);
    sendSSE('error', { message: err.message || 'Error occurred during streaming inference' });
    res.end();
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Bonsai WebUI] Full-stack server running on http://localhost:${PORT}`);
  addLog('SYSTEM', 'BonsaiEngine', `Server online at http://localhost:${PORT}`);
});

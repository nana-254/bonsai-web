import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Trash2, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Power, 
  ExternalLink,
  Code2, 
  ShieldCheck,
  Globe2,
  Database,
  FolderGit2,
  HardDrive,
  Cpu
} from 'lucide-react';
import { MCPServer } from '../../types';

interface MCPRegistryProps {
  servers: MCPServer[];
  onUpdateServers: (servers: MCPServer[]) => void;
}

export const MCPRegistry: React.FC<MCPRegistryProps> = ({
  servers,
  onUpdateServers,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { status: 'success' | 'error'; message: string; latency?: number }>>({});
  
  // Add server form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [transport, setTransport] = useState<'sse' | 'stdio' | 'websocket'>('sse');
  const [description, setDescription] = useState('');
  const [toolsInput, setToolsInput] = useState('');

  // Templates
  const templates = [
    {
      name: 'Onion & Tor Threat Crawler',
      endpoint: 'http://localhost:3002/sse',
      transport: 'sse' as const,
      description: 'Crawls hidden service threat advisories and onion mirror indices.',
      tools: ['darkweb_search', 'tor_node_resolve', 'onion_header_peek'],
      icon: Globe2,
    },
    {
      name: 'Local Filesystem & Code Bridge',
      endpoint: 'http://localhost:3001/sse',
      transport: 'stdio' as const,
      description: 'Sandboxed file reads and writes for agentic coding loops.',
      tools: ['read_file', 'write_file', 'list_dir'],
      icon: HardDrive,
    },
    {
      name: 'SQLite Long-Term Vector Memory',
      endpoint: 'http://localhost:3003/sse',
      transport: 'sse' as const,
      description: 'Embedded SQLite vector database preserving agent conversation memories.',
      tools: ['query_db', 'vector_search', 'store_memory'],
      icon: Database,
    },
    {
      name: 'GitHub Agentic Repo Worker',
      endpoint: 'http://localhost:3004/sse',
      transport: 'sse' as const,
      description: 'Inspects branches, creates pull requests, and commits code.',
      tools: ['git_diff', 'create_branch', 'open_pr'],
      icon: FolderGit2,
    },
  ];

  const handleToggleConnection = (id: string) => {
    const updated = servers.map(s => {
      if (s.id === id) {
        const isCurrentlyActive = s.status === 'connected';
        return {
          ...s,
          status: isCurrentlyActive ? ('disconnected' as const) : ('connected' as const),
          enabled: !isCurrentlyActive,
        };
      }
      return s;
    });
    onUpdateServers(updated);
  };

  const handleTestConnection = async (server: MCPServer) => {
    setTestingId(server.id);
    try {
      const res = await fetch('/api/mcp/test-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: server.endpoint, name: server.name }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(prev => ({
          ...prev,
          [server.id]: {
            status: 'success',
            message: `Handshake OK (Protocol v${data.protocolVersion}, ${data.toolsDiscovered} tools discovered)`,
            latency: data.latencyMs,
          },
        }));

        // Update server stats in state
        const updated = servers.map(s => s.id === server.id ? {
          ...s,
          status: 'connected' as const,
          latencyMs: data.latencyMs,
          lastChecked: new Date().toLocaleTimeString(),
        } : s);
        onUpdateServers(updated);
      } else {
        throw new Error(data.error || 'Connection handshake rejected');
      }
    } catch (err: any) {
      setFeedback(prev => ({
        ...prev,
        [server.id]: {
          status: 'error',
          message: `Connection failed: ${err.message}`,
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleRemoveServer = (id: string) => {
    const updated = servers.filter(s => s.id !== id);
    onUpdateServers(updated);
  };

  const handleAddCustomServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !endpoint.trim()) return;

    const parsedTools = toolsInput
      ? toolsInput.split(',').map(t => t.trim()).filter(Boolean)
      : ['custom_tool_call'];

    const newServer: MCPServer = {
      id: `mcp-${Date.now()}`,
      name: name.trim(),
      endpoint: endpoint.trim(),
      transport,
      status: 'connected',
      enabled: true,
      description: description.trim() || 'Custom registered Model Context Protocol server',
      tools: parsedTools,
      lastChecked: new Date().toLocaleTimeString(),
    };

    onUpdateServers([...servers, newServer]);
    setName('');
    setEndpoint('');
    setDescription('');
    setToolsInput('');
    setShowAddForm(false);
  };

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    const exists = servers.some(s => s.endpoint === tpl.endpoint);
    if (exists) return;

    const newServer: MCPServer = {
      id: `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: tpl.name,
      endpoint: tpl.endpoint,
      transport: tpl.transport,
      status: 'connected',
      enabled: true,
      description: tpl.description,
      tools: tpl.tools,
      lastChecked: new Date().toLocaleTimeString(),
    };

    onUpdateServers([...servers, newServer]);
  };

  const activeConnectedCount = servers.filter(s => s.status === 'connected' && s.enabled !== false).length;

  return (
    <div className="space-y-5">
      {/* Header & Overview Stats */}
      <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Model Context Protocol (MCP) Server Registry
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Attach external tool providers via JSON-RPC. Bonsai models discover, query, and orchestrate tools from registered endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeConnectedCount} / {servers.length} Connected</span>
          </span>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Server</span>
          </button>
        </div>
      </div>

      {/* Add Server Form */}
      {showAddForm && (
        <form onSubmit={handleAddCustomServer} className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Register Custom MCP Endpoint</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Server Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Vector Memory Bridge"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Transport Protocol</label>
              <select
                value={transport}
                onChange={e => setTransport(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="sse">HTTP Server-Sent Events (SSE)</option>
                <option value="stdio">Standard I/O (stdio process)</option>
                <option value="websocket">WebSocket (ws://)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Endpoint URL / Target Command</label>
            <input
              type="text"
              required
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder="e.g. http://localhost:3005/sse or stdio:npx -y @mcp/server"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief purpose of the MCP tools..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Initial Tool Declarations (comma-separated)</label>
              <input
                type="text"
                value={toolsInput}
                onChange={e => setToolsInput(e.target.value)}
                placeholder="tool_a, tool_b, tool_c"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              Save & Register MCP
            </button>
          </div>
        </form>
      )}

      {/* Preset Quick Templates */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Quick Templates
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {templates.map((tpl, i) => {
            const Icon = tpl.icon;
            const isInstalled = servers.some(s => s.endpoint === tpl.endpoint);

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                disabled={isInstalled}
                className={`p-2 rounded-lg border text-left font-mono transition-colors flex items-center justify-between text-[11px] ${
                  isInstalled
                    ? 'border-slate-800 bg-slate-950/40 text-slate-500 cursor-default'
                    : 'border-slate-800 bg-slate-950/80 hover:border-emerald-500/40 text-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{tpl.name.split(' ')[0]}</span>
                </div>
                <span className="text-[9px] text-slate-500 shrink-0">
                  {isInstalled ? 'Added' : '+ Add'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Servers List */}
      <div className="space-y-3">
        {servers.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 border border-slate-800/80 rounded-xl bg-slate-950/40">
            No Model Context Protocol servers configured. Click &apos;Add Server&apos; or use a template above.
          </div>
        ) : (
          servers.map(server => {
            const isConnected = server.status === 'connected' && server.enabled !== false;
            const isTesting = testingId === server.id;
            const fb = feedback[server.id];

            return (
              <div
                key={server.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isConnected
                    ? 'border-slate-800 bg-slate-950/90 shadow-md'
                    : 'border-slate-850 bg-slate-950/40 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Toggle connection switch button */}
                    <button
                      type="button"
                      onClick={() => handleToggleConnection(server.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={isConnected ? 'Disconnect MCP Server' : 'Connect MCP Server'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{server.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {server.transport}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isConnected
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isConnected ? 'Active' : 'Offline'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate max-w-sm sm:max-w-md">
                        {server.endpoint}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => handleTestConnection(server)}
                      disabled={isTesting}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Test real-time JSON-RPC connection handshake"
                    >
                      {isTesting ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                      ) : (
                        <Zap className="w-3 h-3 text-emerald-400" />
                      )}
                      <span>{isTesting ? 'Testing...' : 'Ping Test'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveServer(server.id)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Server"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  {server.description}
                </p>

                {/* Discovered Tools List */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono pt-1 border-t border-slate-900">
                  <span className="text-slate-500">Exposed MCP Tools:</span>
                  {server.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400"
                    >
                      {t}
                    </span>
                  ))}
                  {server.latencyMs && (
                    <span className="ml-auto text-cyan-400">
                      ⚡ {server.latencyMs}ms latency
                    </span>
                  )}
                </div>

                {/* Live Feedback Banner */}
                {fb && (
                  <div className={`mt-2 p-2 rounded text-[11px] font-mono flex items-center gap-1.5 ${
                    fb.status === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                  }`}>
                    {fb.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span>{fb.message}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Play, 
  Trash2, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  Code2, 
  ArrowRight, 
  MessageSquare, 
  Terminal, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Zap,
  SlidersHorizontal,
  Workflow as WorkflowIcon
} from 'lucide-react';
import { AgentTeam, TeamAgent } from '../../types';
import { INITIAL_AGENT_TEAMS } from '../../data/teams';
import { BONSAI_MODELS } from '../../data/models';

export const AgentForge: React.FC = () => {
  const [teams, setTeams] = useState<AgentTeam[]>(INITIAL_AGENT_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(INITIAL_AGENT_TEAMS[0].id);
  const [taskPrompt, setTaskPrompt] = useState<string>(
    'Perform a multi-agent vulnerability audit on an edge IoT server running a C socket listener. Evaluate potential buffer overflow vectors and formulate secure patches.'
  );

  const [isRunningTeam, setIsRunningTeam] = useState(false);
  const [teamTranscripts, setTeamTranscripts] = useState<any[]>([]);
  const [finalSynthesis, setFinalSynthesis] = useState<string | null>(null);

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const handleRunTeam = async () => {
    if (!taskPrompt.trim() || isRunningTeam) return;
    setIsRunningTeam(true);
    setTeamTranscripts([]);
    setFinalSynthesis(null);

    try {
      const res = await fetch('/api/agents/team-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team: activeTeam,
          userPrompt: taskPrompt,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTeamTranscripts(data.transcripts || []);
        setFinalSynthesis(data.finalSynthesis || 'Team collaboration finished.');
      } else {
        throw new Error(data.error || 'Execution failed');
      }
    } catch (e: any) {
      setTeamTranscripts([
        {
          agentName: 'System Monitor',
          role: 'Kernel Dispatcher',
          content: `Multi-agent collaboration encountered error: ${e.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsRunningTeam(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Agent Forge • Multi-Agent Squads</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Autonomous Collaboration
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Orchestrate multiple specialized Bonsai 27B agents working collectively to solve complex goals
            </p>
          </div>
        </div>

        {/* Team Selector & Trigger */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTeamId}
            onChange={e => {
              setSelectedTeamId(e.target.value);
              setTeamTranscripts([]);
              setFinalSynthesis(null);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.topology})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunTeam}
            disabled={isRunningTeam || !taskPrompt.trim()}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer ${
              isRunningTeam
                ? 'bg-emerald-700 text-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningTeam ? 'animate-spin' : ''}`} />
            <span>{isRunningTeam ? 'Deliberating...' : 'Launch Team Task'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Squad Architecture & Agents Roster */}
        <div className="w-84 border-r border-slate-800 bg-slate-900/40 p-4 overflow-y-auto space-y-4 shrink-0 text-xs">
          <div>
            <h3 className="font-bold text-white text-sm mb-1">{activeTeam.name}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{activeTeam.goal}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-cyan-400">
              <WorkflowIcon className="w-3 h-3" />
              <span>Topology: {activeTeam.topology.toUpperCase()}</span>
            </div>
          </div>

          {/* Roster of Agents */}
          <div className="space-y-2.5 pt-2">
            <span className="font-mono text-[10px] uppercase text-slate-400 font-bold tracking-wider">
              Assigned Specialist Agents ({activeTeam.agents.length})
            </span>
            {activeTeam.agents.map((agent, i) => (
              <div
                key={agent.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{agent.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                    Step {i + 1}
                  </span>
                </div>
                <p className="text-emerald-400 text-[11px] font-mono font-medium">{agent.role}</p>
                <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{agent.systemPrompt}</p>
                {agent.tools.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {agent.tools.map(t => (
                      <span key={t} className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Team Execution Transcript & Task Prompt */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Task Input Prompt Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Mission Objective / User Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={taskPrompt}
                onChange={e => setTaskPrompt(e.target.value)}
                placeholder="Instruct the multi-agent squad..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleRunTeam}
                disabled={isRunningTeam || !taskPrompt.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Execute
              </button>
            </div>
          </div>

          {/* Transcript Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {teamTranscripts.length === 0 && !isRunningTeam ? (
              <div className="text-center py-20 text-slate-600 font-sans">
                <Users className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                <p className="text-sm font-semibold text-slate-400">Squad Ready for Mission</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Click &apos;Launch Team Task&apos; to watch the specialist agents collaborate and synthesize the objective.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {teamTranscripts.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md space-y-2 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                          <Cpu className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs mr-2">{entry.agentName}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{entry.role}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{entry.timestamp}</span>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap pl-8">
                      {entry.content}
                    </div>
                  </div>
                ))}

                {isRunningTeam && (
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-2 text-xs text-slate-400 font-mono animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Specialist agents communicating over neural bridge...</span>
                  </div>
                )}

                {finalSynthesis && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Consensus Mission Synthesis</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {finalSynthesis}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

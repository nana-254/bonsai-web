import { AgentTeam } from '../types';

export const INITIAL_AGENT_TEAMS: AgentTeam[] = [
  {
    id: 'team-deep-audit',
    name: 'Cyber & Code Security Audit Squad',
    goal: 'Audit an edge application: crawl threats via Tor, analyze source code memory safety, and synthesize remediation pull-requests.',
    topology: 'hierarchical',
    agents: [
      {
        id: 'agent-lead-sec',
        role: 'Orchestrator & Principal Auditor',
        name: 'Vanguard Lead',
        modelId: 'bonsai-27b-abliterated',
        avatarIcon: 'ShieldCheck',
        tools: ['googleSearch'],
        systemPrompt: 'You are Vanguard Lead. You decompose security audit tasks, delegate vulnerability inspection to specialists, evaluate findings, and assemble the final report.',
      },
      {
        id: 'agent-tor-intel',
        role: 'Darknet Reconnaissance Scout',
        name: 'Tor Recon Specialist',
        modelId: 'bonsai-27b-abliterated',
        avatarIcon: 'Globe2',
        tools: ['darkwebSearch'],
        systemPrompt: 'You are Tor Recon Specialist. You check onion databases and security disclosures for active exploits, CVEs, and proof-of-concept breach scripts.',
      },
      {
        id: 'agent-code-sec',
        role: 'Memory Safety Code Inspector',
        name: 'Static Code Analyst',
        modelId: 'bonsai-27b-standard',
        avatarIcon: 'Code2',
        tools: ['codeInterpreter'],
        systemPrompt: 'You are Static Code Analyst. You inspect code for buffer overflows, race conditions, and unvalidated inputs in the sandbox environment.',
      },
    ],
  },
  {
    id: 'team-binary-research',
    name: 'BitNet Research & Paper Publication Team',
    goal: 'Perform complete research cycle on 1.58-bit models: survey papers, calculate exact RAM budgets, and draft an academic abstract.',
    topology: 'sequential',
    agents: [
      {
        id: 'agent-lit-survey',
        role: 'Literature Reviewer',
        name: 'Scholar Scout',
        modelId: 'bonsai-27b-standard',
        avatarIcon: 'BookOpen',
        tools: ['googleSearch'],
        systemPrompt: 'You are Scholar Scout. You survey recent BitNet b1.58 and ternary neural network publications, compiling empirical benchmark data.',
      },
      {
        id: 'agent-quant-calc',
        role: 'Empirical Verification Engineer',
        name: 'Benchmarker',
        modelId: 'bonsai-27b-standard',
        avatarIcon: 'Cpu',
        tools: ['codeInterpreter'],
        systemPrompt: 'You are Benchmarker. You write Python scripts to calculate exact memory footprints, parameter bitrates, and GQA KV cache sizes for 8GB laptops.',
      },
      {
        id: 'agent-editor',
        role: 'Publication Editor & Critic',
        name: 'Chief Editor',
        modelId: 'bonsai-27b-standard',
        avatarIcon: 'Feather',
        tools: [],
        systemPrompt: 'You are Chief Editor. You critique the technical findings and produce an executive briefing with publication-grade clarity.',
      },
    ],
  },
];

import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Check, 
  Copy, 
  Sliders, 
  Download, 
  HardDrive,
  Info,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  BatteryCharging,
  Gauge
} from 'lucide-react';
import { BONSAI_MODELS } from '../../data/models';
import { BENCHMARK_ITEMS } from '../../data/marketplace';
import { ModelDef } from '../../types';

interface ModelHubProps {
  selectedModel: ModelDef;
  onSelectModel: (model: ModelDef) => void;
}

export const ModelHub: React.FC<ModelHubProps> = ({ selectedModel, onSelectModel }) => {
  const [hubTab, setHubTab] = useState<'variants' | 'benchmark'>('variants');

  // Memory Calculator State
  const [calcParams, setCalcParams] = useState<number>(27.4); // Billions
  const [calcBits, setCalcBits] = useState<number>(1.58); // Bits per param
  const [calcContext, setCalcContext] = useState<number>(4096); // Context length
  const [copiedModelfile, setCopiedModelfile] = useState<string | null>(null);

  // Benchmark View Metric State: 'both' | 'tps' | 'vram' | 'power'
  const [benchmarkMetric, setBenchmarkMetric] = useState<'both' | 'tps' | 'vram' | 'power'>('both');

  // Compute 8GB laptop memory footprint
  const weightSizeGB = Number(((calcParams * 1000000000 * calcBits) / (8 * 1024 * 1024 * 1024)).toFixed(2));
  const kvCacheGB = Number(((calcContext * calcParams * 0.000008)).toFixed(2));
  const osOverheadGB = 1.40;
  const totalRamNeededGB = Number((weightSizeGB + kvCacheGB + osOverheadGB).toFixed(2));
  const fitsIn8GB = totalRamNeededGB <= 8.0;

  const handleCopyModelfile = (modelId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedModelfile(modelId);
    setTimeout(() => setCopiedModelfile(null), 2000);
  };

  const getModelfile = (model: ModelDef) => {
    return `# Modelfile for ${model.name} (BitNet b1.58 Ternary)
FROM ./models/${model.id}-b1.58.gguf
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"

SYSTEM """${model.systemPrompt}"""
`;
  };

  // Benchmark max values for scaling bars
  const maxTps = Math.max(...BENCHMARK_ITEMS.map(b => b.tokensPerSec));
  const maxVram = Math.max(...BENCHMARK_ITEMS.map(b => b.vramGB));
  const maxPower = Math.max(...BENCHMARK_ITEMS.map(b => b.powerWatts));

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Bonsai 27B Model Hub</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                BitNet 1.58b Ecosystem
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Explore the three specialized Bonsai 27B weights: Standard, Uncensored, and Abliterated. All three run natively in 5.34 GB RAM on standard 8GB laptops using integer-addition ternary arithmetic.
            </p>
          </div>

          {/* Sub-tab Switcher: Variants vs Benchmark */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium font-mono">
            <button
              onClick={() => setHubTab('variants')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                hubTab === 'variants'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Model Variants & 8GB Calc</span>
            </button>
            <button
              onClick={() => setHubTab('benchmark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                hubTab === 'benchmark'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Model Benchmark</span>
            </button>
          </div>
        </div>

        {/* View 1: Model Benchmark View */}
        {hubTab === 'benchmark' && (
          <div className="space-y-6">
            {/* Benchmark Metric Controls */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Comparative Performance Benchmark (8GB Laptop Context)
                  </h3>
                </div>

                {/* Metric Selector Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono flex-wrap">
                  <button
                    onClick={() => setBenchmarkMetric('both')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      benchmarkMetric === 'both'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Dual View (Speed & VRAM)</span>
                  </button>
                  <button
                    onClick={() => setBenchmarkMetric('tps')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      benchmarkMetric === 'tps'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Tokens/s Only</span>
                  </button>
                  <button
                    onClick={() => setBenchmarkMetric('vram')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      benchmarkMetric === 'vram'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>VRAM Only</span>
                  </button>
                  <button
                    onClick={() => setBenchmarkMetric('power')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      benchmarkMetric === 'power'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>Power (Watts)</span>
                  </button>
                </div>
              </div>

              {/* Explanatory Callout */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-300 font-mono flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {benchmarkMetric === 'both' && 'Side-by-side comparison: Bonsai 27B achieves up to 12.8x higher tokens/sec and slashes VRAM from 54.8 GB down to 5.34 GB.'}
                    {benchmarkMetric === 'tps' && 'Higher is better: Bonsai 27B achieves up to 12.8x higher throughput vs FP16 baseline on consumer laptop CPUs.'}
                    {benchmarkMetric === 'vram' && 'Lower is better: Bonsai 27B requires only 5.34 GB, making it the only 27B model executable on 8GB laptops without thrashing.'}
                    {benchmarkMetric === 'power' && 'Lower is better: Integer-addition GEMM draws only 24W compared to 175W+ for floating-point multipliers.'}
                  </span>
                </div>
                <span className="text-emerald-400 font-bold text-[11px]">8GB Laptop Verified</span>
              </div>

              {/* Visual Bar Charts: Dual View or Single Metric View */}
              {benchmarkMetric === 'both' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  {/* Chart 1: Inference Speed (Tokens/sec) */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 font-mono">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>Inference Speed (Tokens / Sec)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Higher is better</span>
                    </div>

                    <div className="space-y-3">
                      {BENCHMARK_ITEMS.map((item) => {
                        const isBonsai = item.category === 'Bonsai 1.58b';
                        const barPercent = Math.max(4, Math.min(100, (item.tokensPerSec / maxTps) * 100));

                        return (
                          <div key={item.id} className="space-y-1 font-mono text-xs">
                            <div className="flex items-center justify-between text-slate-300 text-[11px]">
                              <span className={`font-semibold ${isBonsai ? 'text-emerald-300' : 'text-slate-400'}`}>
                                {item.name.replace(' (Ours)', '')}
                              </span>
                              <span className={`font-bold ${isBonsai ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {item.tokensPerSec} t/s
                              </span>
                            </div>

                            <div className="w-full bg-slate-900 rounded-lg h-6 p-0.5 border border-slate-800 flex items-center overflow-hidden">
                              <div
                                className={`h-full rounded transition-all duration-500 flex items-center justify-end px-2 text-[10px] font-bold ${
                                  isBonsai
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                                    : 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-300'
                                }`}
                                style={{ width: `${barPercent}%` }}
                              >
                                <span>{item.tokensPerSec} t/s</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chart 2: VRAM / Memory Footprint (GB) */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400 font-mono">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>VRAM / Memory Footprint (GB)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Lower is better</span>
                    </div>

                    <div className="space-y-3">
                      {BENCHMARK_ITEMS.map((item) => {
                        const isBonsai = item.category === 'Bonsai 1.58b';
                        const barPercent = Math.max(4, Math.min(100, (item.vramGB / maxVram) * 100));

                        return (
                          <div key={item.id} className="space-y-1 font-mono text-xs">
                            <div className="flex items-center justify-between text-slate-300 text-[11px]">
                              <span className={`font-semibold ${isBonsai ? 'text-cyan-300' : 'text-slate-400'}`}>
                                {item.name.replace(' (Ours)', '')}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold ${isBonsai ? 'text-cyan-400' : 'text-slate-300'}`}>
                                  {item.vramGB} GB
                                </span>
                                <span className={`text-[9px] px-1 rounded ${
                                  item.fits8GB ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {item.fits8GB ? '✓ 8GB' : '❌ OOM'}
                                </span>
                              </div>
                            </div>

                            <div className="w-full bg-slate-900 rounded-lg h-6 p-0.5 border border-slate-800 flex items-center overflow-hidden">
                              <div
                                className={`h-full rounded transition-all duration-500 flex items-center justify-end px-2 text-[10px] font-bold ${
                                  isBonsai
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md'
                                    : item.fits8GB
                                    ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-200'
                                    : 'bg-gradient-to-r from-rose-800 to-rose-700 text-rose-200'
                                }`}
                                style={{ width: `${barPercent}%` }}
                              >
                                <span>{item.vramGB} GB</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 pt-2">
                  {BENCHMARK_ITEMS.map((item) => {
                    const isBonsai = item.category === 'Bonsai 1.58b';
                    let barValue = 0;
                    let maxVal = 1;
                    let displayUnit = '';

                    if (benchmarkMetric === 'tps') {
                      barValue = item.tokensPerSec;
                      maxVal = maxTps;
                      displayUnit = 't/s';
                    } else if (benchmarkMetric === 'vram') {
                      barValue = item.vramGB;
                      maxVal = maxVram;
                      displayUnit = 'GB';
                    } else {
                      barValue = item.powerWatts;
                      maxVal = maxPower;
                      displayUnit = 'W';
                    }

                    const barPercent = Math.max(4, Math.min(100, (barValue / maxVal) * 100));

                    return (
                      <div key={item.id} className="space-y-1 font-mono text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isBonsai ? 'text-emerald-300' : 'text-slate-300'}`}>
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ({item.parameters} • {item.precision})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isBonsai ? 'text-emerald-400 text-sm' : 'text-slate-300'}`}>
                              {barValue} {displayUnit}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                              item.fits8GB
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {item.fits8GB ? '✓ 8GB Laptop Native' : '❌ OOM (Crashes 8GB)'}
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-slate-950 rounded-lg h-7 p-1 border border-slate-800 flex items-center overflow-hidden">
                          <div
                            className={`h-full rounded transition-all duration-500 flex items-center justify-between px-2 text-[10px] font-bold ${
                              isBonsai
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                                : item.fits8GB
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                                : 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-300'
                            }`}
                            style={{ width: `${barPercent}%` }}
                          >
                            <span className="truncate">{item.category}</span>
                            <span className="shrink-0">{barValue} {displayUnit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 8GB RAM Threshold Line Explainer */}
              <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span>Bonsai 1.58-bit Ternary Models</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span>8GB-compatible Baseline Quantized</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                  <span>Incompatible FP16 Baselines (&gt;8GB)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Model Variants & 8GB Calculator */}
        {hubTab === 'variants' && (
          <div className="space-y-8">
            {/* The 3 Bonsai Models Cards */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Bonsai 27B Model Variants
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BONSAI_MODELS.filter(m => m.id.startsWith('bonsai-27b')).map((model) => {
                  const isSelected = selectedModel.id === model.id;
                  const isUncensored = model.type === 'bonsai-uncensored';
                  const isAbliterated = model.type === 'bonsai-abliterated';

                  return (
                    <div
                      key={model.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-emerald-500/60 bg-emerald-950/20 shadow-xl shadow-emerald-500/5'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                              <span>{model.name}</span>
                              {isUncensored && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                  Uncensored
                                </span>
                              )}
                              {isAbliterated && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                                  Abliterated
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {model.tagline}
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {model.vramUsageGB} GB
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {model.description}
                        </p>

                        {/* Spec Pill Grid */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-mono border-t border-slate-800/80">
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block">Quantization:</span>
                            <span className="text-emerald-400 font-semibold">{model.quantBits}</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block">Speed (8GB):</span>
                            <span className="text-cyan-400 font-semibold">{model.tokensPerSec} t/s</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block">Context:</span>
                            <span className="text-purple-400 font-semibold">{model.contextLength} tokens</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block">8GB Usability:</span>
                            <span className="text-emerald-400 font-semibold">100% Native</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <button
                          onClick={() => onSelectModel(model)}
                          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ Currently Active Engine' : 'Activate Model'}
                        </button>

                        <button
                          onClick={() => handleCopyModelfile(model.id, getModelfile(model))}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {copiedModelfile === model.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedModelfile === model.id ? 'Modelfile Copied!' : 'Copy Ollama Modelfile'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive 8GB Laptop Memory Calculator */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Interactive 8GB Laptop Memory & VRAM Calculator
                  </h3>
                </div>
                <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  fitsIn8GB
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {fitsIn8GB ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{fitsIn8GB ? 'Compatible with 8GB Laptop' : 'Exceeds 8GB RAM (OOM Danger)'}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Slider 1: Parameter Count */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>Model Parameters:</span>
                    <span className="text-emerald-400 font-bold">{calcParams} Billion</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="70"
                    step="0.5"
                    value={calcParams}
                    onChange={(e) => setCalcParams(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>7B (Compact)</span>
                    <span>27.4B (Bonsai)</span>
                    <span>70B (Server)</span>
                  </div>
                </div>

                {/* Slider 2: Quantization Precision */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>Quantization Precision:</span>
                    <span className="text-cyan-400 font-bold">{calcBits} bits / weight</span>
                  </div>
                  <select
                    value={calcBits}
                    onChange={(e) => setCalcBits(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none"
                  >
                    <option value={1.58}>1.58-bit Ternary (BitNet b1.58 / Bonsai)</option>
                    <option value={4.5}>4.5-bit Q4_K_M (Standard GGUF)</option>
                    <option value={8.0}>8.0-bit FP8 (High Precision)</option>
                    <option value={16.0}>16.0-bit FP16 (Half Precision uncompressed)</option>
                  </select>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {calcBits === 1.58 ? '✨ Addition-only GEMM (Slashing memory bandwidth)' : 'Requires floating point MAC units'}
                  </div>
                </div>

                {/* Slider 3: Context Window */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>Context Window:</span>
                    <span className="text-purple-400 font-bold">{calcContext} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="2048"
                    max="16384"
                    step="1024"
                    value={calcContext}
                    onChange={(e) => setCalcContext(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2k</span>
                    <span>4k (Default)</span>
                    <span>16k</span>
                  </div>
                </div>
              </div>

              {/* Allocation Breakdown Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Physical 8GB RAM Budget Allocation:</span>
                  <span className="font-bold text-white">{totalRamNeededGB} GB / 8.00 GB</span>
                </div>

                <div className="w-full bg-slate-950 rounded-lg h-5 overflow-hidden flex border border-slate-800">
                  {/* Model Weights */}
                  <div
                    className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-slate-950 truncate px-1 transition-all"
                    style={{ width: `${Math.min(100, (weightSizeGB / 8) * 100)}%` }}
                    title={`Weights: ${weightSizeGB} GB`}
                  >
                    Weights: {weightSizeGB}GB
                  </div>
                  {/* KV Cache */}
                  <div
                    className="bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-slate-950 truncate px-1 transition-all"
                    style={{ width: `${Math.min(100, (kvCacheGB / 8) * 100)}%` }}
                    title={`KV Cache: ${kvCacheGB} GB`}
                  >
                    KV: {kvCacheGB}GB
                  </div>
                  {/* OS Overhead */}
                  <div
                    className="bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200 truncate px-1"
                    style={{ width: `${(osOverheadGB / 8) * 100}%` }}
                    title="OS Overhead: 1.40 GB"
                  >
                    OS: 1.4GB
                  </div>
                  {/* Free Headroom */}
                  {8.0 - totalRamNeededGB > 0 && (
                    <div
                      className="bg-slate-900 flex items-center justify-center text-[10px] text-slate-400 font-mono truncate px-1"
                      style={{ width: `${((8.0 - totalRamNeededGB) / 8) * 100}%` }}
                    >
                      Free: {(8.0 - totalRamNeededGB).toFixed(2)}GB
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                    <span>Model Weights: <strong>{weightSizeGB} GB</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block"></span>
                    <span>KV Cache: <strong>{kvCacheGB} GB</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 inline-block"></span>
                    <span>OS Minimum: <strong>1.40 GB</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800 inline-block"></span>
                    <span>Remaining Headroom: <strong>{Math.max(0, 8.0 - totalRamNeededGB).toFixed(2)} GB</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addition-Only Ternary Arithmetic Visualizer */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Ternary Weights {'{-1, 0, +1}'} vs Floating Point Multipliers
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                In standard 16-bit neural networks, calculating the output for 27B parameters requires performing billions of energy-draining FP32 multiplications ($w_i \times x_i$). In 1.58-bit BitNet, each weight is strictly ternary:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300">
                  <strong className="block text-white text-sm mb-1">Weight = +1</strong>
                  <span>Action: Directly <strong>ADD</strong> activation $x_j$. Zero multiplications needed.</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300">
                  <strong className="block text-white text-sm mb-1">Weight = -1</strong>
                  <span>Action: Directly <strong>SUBTRACT</strong> activation $x_j$. Integer subtraction.</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                  <strong className="block text-white text-sm mb-1">Weight = 0</strong>
                  <span>Action: <strong>SKIP</strong> calculation entirely (Sparsity efficiency).</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

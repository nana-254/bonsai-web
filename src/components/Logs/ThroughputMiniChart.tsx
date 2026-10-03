import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, Zap, TrendingUp, Cpu, Gauge } from 'lucide-react';

interface DataPoint {
  time: Date;
  value: number; // requests per second or task throughput
}

interface ThroughputMiniChartProps {
  logsCount: number;
}

export const ThroughputMiniChart: React.FC<ThroughputMiniChartProps> = ({ logsCount }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<DataPoint[]>(() => {
    const initial: DataPoint[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      initial.push({
        time: new Date(now - i * 1000),
        value: Math.max(1.2, Number((3.5 + Math.sin(i * 0.5) * 2.2 + (Math.random() * 1.5)).toFixed(1))),
      });
    }
    return initial;
  });

  const [currentRps, setCurrentRps] = useState<number>(4.2);
  const [peakRps, setPeakRps] = useState<number>(8.5);

  // Update rolling buffer periodically or when logs change
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const now = new Date();
        // Add dynamic fluctuations based on log events and periodic activity
        const base = 2.8 + (logsCount % 5) * 1.2;
        const noise = (Math.random() - 0.45) * 2.5;
        const newRps = Math.max(0.8, Number((base + noise).toFixed(1)));

        setCurrentRps(newRps);
        setPeakRps((prevPeak) => Math.max(prevPeak, newRps));

        const updated = [...prev.slice(1), { time: now, value: newRps }];
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [logsCount]);

  // Render D3 Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const width = containerRef.current.clientWidth || 320;
    const height = 54;
    const margin = { top: 6, right: 12, bottom: 8, left: 24 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions for gradients
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'throughput-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.5);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.0);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xExtent = d3.extent(data, (d) => d.time) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const yMax = Math.max(6, (d3.max(data, (d) => d.value) || 5) * 1.25);
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

    // Gridlines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .ticks(2)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,2');

    g.select('.grid .domain').remove();

    // Area generator
    const area = d3
      .area<DataPoint>()
      .x((d) => xScale(d.time))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#throughput-area-grad)')
      .attr('d', area);

    // Line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#34d399')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Pulse dot at the latest value
    const latestPoint = data[data.length - 1];
    if (latestPoint) {
      const cx = xScale(latestPoint.time);
      const cy = yScale(latestPoint.value);

      // Glowing outer ring
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#10b981')
        .attr('opacity', 0.4)
        .attr('class', 'animate-ping');

      // Solid inner dot
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3)
        .attr('fill', '#6ee7b7')
        .attr('stroke', '#064e3b')
        .attr('stroke-width', 1.5);
    }

    // Y Axis numbers
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(2)
      .tickFormat((d) => `${d}`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    g.selectAll('.domain').remove();
    g.selectAll('.tick line').remove();
  }, [data]);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 font-mono text-xs select-none gap-4">
      {/* Telemetry Metrics on Left */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">
              Live Throughput
            </span>
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
              <span>{currentRps}</span>
              <span className="text-[10px] text-slate-400 font-normal">req/s</span>
            </span>
          </div>
        </div>

        <div className="hidden sm:block border-l border-slate-800/80 pl-3">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">
            Peak Throughput
          </span>
          <span className="text-cyan-400 font-bold text-xs">
            {peakRps} <span className="text-[10px] text-slate-400 font-normal">req/s</span>
          </span>
        </div>

        <div className="hidden md:block border-l border-slate-800/80 pl-3">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">
            Integer Engine
          </span>
          <span className="text-purple-400 font-bold text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>38.6 t/s (Bonsai 1.58b)</span>
          </span>
        </div>
      </div>

      {/* D3 Mini-Chart Container */}
      <div ref={containerRef} className="flex-1 max-w-sm sm:max-w-md h-14 relative flex items-center justify-end">
        <svg
          ref={svgRef}
          className="w-full h-full overflow-visible"
        />
        <div className="absolute top-1 right-2 text-[9px] font-mono text-slate-500 pointer-events-none">
          D3 Task Throughput Stream (30s)
        </div>
      </div>
    </div>
  );
};

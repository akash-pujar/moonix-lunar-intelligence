import { useEffect, useRef, useState, useMemo } from 'react';
import type { FC } from 'react';
import * as d3 from 'd3';
import type { SiteEphemeris, TerrainHorizon } from '../data/types';
import { getHorizonElevation } from '../engine/visibility';
import { Sun, Globe, Crosshair, ShieldCheck, Moon } from 'lucide-react';

interface ElevationChartProps {
  ephemeris: SiteEphemeris | null;
  terrain: TerrainHorizon | null;
  useTerrainHorizon: boolean;
  type: 'sun' | 'earth';
  analysisStart: string;
  analysisEnd: string;
  cursorTime: string;
  onCursorChange: (time: string) => void;
  title?: string;
}

export const ElevationChart: FC<ElevationChartProps> = ({
  ephemeris,
  terrain,
  useTerrainHorizon,
  type,
  analysisStart,
  analysisEnd,
  cursorTime,
  onCursorChange,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 230 });

  // Handle responsive resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions((prev) => ({ ...prev, width }));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter ephemeris data to the analysis window
  const chartData = useMemo(() => {
    if (!ephemeris || ephemeris.data.length === 0) return [];

    const startMs = new Date(analysisStart).getTime();
    const endMs = new Date(analysisEnd).getTime();

    const points: Array<{
      time: Date;
      timeStr: string;
      el: number;
      az: number;
      horizonEl: number;
      isVisible: boolean;
    }> = [];

    const isSun = type === 'sun';
    const radius = isSun ? 0.27 : 0.95;

    for (let i = 0; i < ephemeris.data.length; i++) {
      const tStr = ephemeris.timestamps[i];
      const tMs = new Date(tStr).getTime();
      if (tMs < startMs || tMs > endMs) continue;

      const row = ephemeris.data[i];
      const az = isSun ? row[0] : row[2];
      const el = isSun ? row[1] : row[3];

      let horizonEl = 0;
      if (useTerrainHorizon && terrain) {
        horizonEl = getHorizonElevation(az, terrain);
      }

      const isVisible = el + radius > horizonEl;

      points.push({
        time: new Date(tMs),
        timeStr: tStr,
        el,
        az,
        horizonEl,
        isVisible,
      });
    }

    return points;
  }, [ephemeris, terrain, useTerrainHorizon, type, analysisStart, analysisEnd]);

  // Current value at cursor
  const cursorPoint = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    const cMs = new Date(cursorTime).getTime();
    let closest = chartData[0];
    let minDiff = Math.abs(closest.time.getTime() - cMs);

    for (const pt of chartData) {
      const diff = Math.abs(pt.time.getTime() - cMs);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }
    return closest;
  }, [chartData, cursorTime]);

  // Render D3 Chart
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 35, bottom: 32, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Define gradients
    const defs = svg.append('defs');

    // Sun Gradient
    const sunGradient = defs
      .append('linearGradient')
      .attr('id', 'sun-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');
    sunGradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(245, 158, 11, 0.35)');
    sunGradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(245, 158, 11, 0.0)');

    // Earth Gradient
    const earthGradient = defs
      .append('linearGradient')
      .attr('id', 'earth-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');
    earthGradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(56, 189, 248, 0.35)');
    earthGradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(56, 189, 248, 0.0)');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(chartData, (d) => d.time) as [Date, Date])
      .range([0, innerWidth]);

    const dataMin = d3.min(chartData, (d) => Math.min(d.el, d.horizonEl)) ?? -5;
    const dataMax = d3.max(chartData, (d) => Math.max(d.el, d.horizonEl)) ?? 10;
    const yMin = Math.min(-8, dataMin - 1.5);
    const yMax = Math.max(12, dataMax + 2.0);

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

    // Grid lines (horizontal)
    g.append('g')
      .attr('class', 'chart-grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#131e33')
      .attr('stroke-dasharray', '3 3');

    // Below-horizon shading
    const zeroY = yScale(0);
    g.append('rect')
      .attr('x', 0)
      .attr('y', Math.max(0, zeroY))
      .attr('width', innerWidth)
      .attr('height', Math.max(0, innerHeight - zeroY))
      .attr('fill', 'rgba(15, 23, 42, 0.45)');

    // Area fill under elevation curve
    const areaGenerator = d3
      .area<(typeof chartData)[0]>()
      .x((d) => xScale(d.time))
      .y0(innerHeight)
      .y1((d) => yScale(Math.max(yMin, d.el)));

    g.append('path')
      .datum(chartData)
      .attr('fill', type === 'sun' ? 'url(#sun-gradient)' : 'url(#earth-gradient)')
      .attr('d', areaGenerator);

    // Zero-degree Horizon Reference Line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', zeroY)
      .attr('y2', zeroY)
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '4 4');

    // Horizon label
    g.append('text')
      .attr('x', innerWidth - 4)
      .attr('y', zeroY - 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, monospace')
      .text('0.0° GEOMETRIC HORIZON');

    // Terrain Horizon Profile Line (if active)
    if (useTerrainHorizon && terrain) {
      const terrainLine = d3
        .line<(typeof chartData)[0]>()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.horizonEl))
        .curve(d3.curveLinear);

      g.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 3')
        .attr('d', terrainLine);
    }

    // Body Elevation Line (Primary curve)
    const elevationLine = d3
      .line<(typeof chartData)[0]>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.el))
      .curve(d3.curveMonotoneX);

    const lineColor = type === 'sun' ? '#fbbf24' : '#38bdf8'; // solar amber vs cyan/blue

    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2.2)
      .attr('d', elevationLine);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 100)))
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}°`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Interactive Drag / Click Overlay for Timeline Scrubber
    const cursorMs = new Date(cursorTime).getTime();
    const cursorX = Math.max(0, Math.min(innerWidth, xScale(new Date(cursorMs))));

    // Cursor Vertical Line
    g.append('line')
      .attr('x1', cursorX)
      .attr('x2', cursorX)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#22d3ee')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 2');

    // Cursor Intersection Dot
    if (cursorPoint) {
      const cursorY = yScale(cursorPoint.el);
      g.append('circle')
        .attr('cx', cursorX)
        .attr('cy', cursorY)
        .attr('r', 5)
        .attr('fill', '#22d3ee')
        .attr('stroke', '#082f49')
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))');
    }

    // Invisible Click / Drag Overlay
    const updateCursorFromEvent = (event: MouseEvent) => {
      const [mouseX] = d3.pointer(event, g.node());
      const clampedX = Math.max(0, Math.min(innerWidth, mouseX));
      const targetDate = xScale.invert(clampedX);
      onCursorChange(targetDate.toISOString());
    };

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('click', (event) => updateCursorFromEvent(event))
      .call(
        d3.drag<SVGRectElement, unknown>()
          .on('drag', (event) => updateCursorFromEvent(event.sourceEvent))
      );
  }, [chartData, dimensions, type, cursorTime, useTerrainHorizon, terrain, cursorPoint, onCursorChange]);

  const isSun = type === 'sun';

  return (
    <div
      ref={containerRef}
      className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 shadow-xl backdrop-blur space-y-3"
    >
      {/* Header with Telemetry Readout at Cursor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isSun
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
            }`}
          >
            {isSun ? <Sun className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                {title || (isSun ? 'Solar Elevation & Illumination' : 'Direct-to-Earth Line-of-Sight')}
              </span>
              {ephemeris?.source === 'SPICE' ? (
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 font-semibold">
                  SPICE DE440
                </span>
              ) : ephemeris?.source === 'HORIZONS' ? (
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded border border-blue-500/40 bg-blue-950/60 text-blue-300 font-semibold">
                  HORIZONS JPL
                </span>
              ) : (
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/60 text-amber-300 font-semibold">
                  APPROXIMATE MODEL
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {isSun ? 'Solar elevation angle with +0.27° solar limb optical threshold' : 'Earth elevation angle with +0.95° Earth limb and parallax correction'}
            </p>
          </div>
        </div>

        {/* Telemetry at Cursor */}
        {cursorPoint ? (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 flex items-center space-x-1">
              <Crosshair className="h-3 w-3 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">
                {new Date(cursorPoint.timeStr).toISOString().slice(5, 16).replace('T', ' ')} UTC
              </span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className={`font-bold ${isSun ? 'text-amber-400' : 'text-cyan-400'}`}>
              El: {cursorPoint.el >= 0 ? `+${cursorPoint.el.toFixed(2)}°` : `${cursorPoint.el.toFixed(2)}°`}
            </span>
            <span className="text-slate-400">Az: {cursorPoint.az.toFixed(1)}°</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                cursorPoint.isVisible
                  ? isSun
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {cursorPoint.isVisible ? (
                <>
                  <ShieldCheck className="h-2.5 w-2.5" />
                  <span>{isSun ? 'SUNLIT' : 'LOS NOMINAL'}</span>
                </>
              ) : (
                <>
                  <Moon className="h-2.5 w-2.5" />
                  <span>{isSun ? 'DARK / OCCLUDED' : 'COMM OCCLUDED'}</span>
                </>
              )}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500">No telemetry in window</span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[230px]">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-mono">
            Loading ephemeris timeline...
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full select-none" />
        )}
      </div>

      {/* Legend & Scrub Guide */}
      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className={`w-3 h-1 rounded ${isSun ? 'bg-amber-400' : 'bg-cyan-400'}`} />
            <span className="text-slate-300">{isSun ? 'Sun Elevation Curve' : 'Earth Elevation Curve'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
            <span>0° Geometric Horizon</span>
          </div>
          {useTerrainHorizon && terrain && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-500" />
              <span>LOLA Terrain Horizon Mask</span>
            </div>
          )}
        </div>
        <div className="text-cyan-400/90 flex items-center space-x-1">
          <Crosshair className="h-3 w-3" />
          <span>Click or drag timeline to scrub mission cursor</span>
        </div>
      </div>
    </div>
  );
};

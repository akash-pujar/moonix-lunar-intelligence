import { useEffect, useRef, useState, useMemo } from 'react';
import type { FC } from 'react';
import * as d3 from 'd3';
import type { SiteEphemeris, TerrainHorizon } from '../data/types';
import { getHorizonElevation } from '../engine/visibility';
import { Sun, Globe, Crosshair } from 'lucide-react';

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
  const [dimensions, setDimensions] = useState({ width: 800, height: 220 });

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
    const margin = { top: 20, right: 30, bottom: 30, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(chartData, (d) => d.time) as [Date, Date])
      .range([0, innerWidth]);

    const yMin = Math.min(-10, d3.min(chartData, (d) => Math.min(d.el, d.horizonEl)) ?? -10) - 2;
    const yMax = Math.max(15, d3.max(chartData, (d) => Math.max(d.el, d.horizonEl)) ?? 15) + 3;

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'chart-grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2 4');

    // Shaded below-horizon / occlusion regions
    const areaGenerator = d3
      .area<(typeof chartData)[0]>()
      .x((d) => xScale(d.time))
      .y0(innerHeight)
      .y1((d) => yScale(Math.min(d.el, d.horizonEl)));

    g.append('path')
      .datum(chartData)
      .attr('fill', type === 'sun' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(59, 130, 246, 0.05)')
      .attr('d', areaGenerator);

    // Zero-degree Horizon Reference Line
    const zeroY = yScale(0);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', zeroY)
      .attr('y2', zeroY)
      .attr('stroke', '#475569')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 4');

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
        .attr('stroke', '#64748b')
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

    const lineColor = type === 'sun' ? '#fbbf24' : '#60a5fa'; // amber-400 vs blue-400

    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', elevationLine);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 90)))
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}°`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
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
        .attr('r', 4)
        .attr('fill', '#22d3ee')
        .attr('stroke', '#083344')
        .attr('stroke-width', 1.5);
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
      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur space-y-2"
    >
      {/* Header with Telemetry Readout at Cursor */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isSun ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Globe className="h-4 w-4 text-blue-400" />
          )}
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            {title || (isSun ? 'Solar Elevation Timeline' : 'Direct-to-Earth Elevation Timeline')}
          </span>
          {ephemeris?.source === 'SPICE' ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/60 text-emerald-300">
              SPICE DE440
            </span>
          ) : ephemeris?.source === 'HORIZONS' ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-blue-500/40 bg-blue-950/60 text-blue-300">
              HORIZONS JPL
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/60 text-amber-300">
              APPROXIMATE MODEL
            </span>
          )}
        </div>

        {cursorPoint ? (
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400 flex items-center space-x-1">
              <Crosshair className="h-3 w-3 text-cyan-400" />
              <span>Cursor:</span>
              <span className="text-slate-200">
                {new Date(cursorPoint.timeStr).toISOString().slice(5, 16).replace('T', ' ')} UTC
              </span>
            </span>
            <span className={`font-bold ${isSun ? 'text-amber-400' : 'text-blue-400'}`}>
              El: {cursorPoint.el.toFixed(2)}°
            </span>
            <span className="text-slate-400">Az: {cursorPoint.az.toFixed(1)}°</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                cursorPoint.isVisible
                  ? isSun
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {cursorPoint.isVisible ? (isSun ? 'SUNLIT' : 'LOS OK') : (isSun ? 'DARK' : 'LOS OCCLUDED')}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500">No data in window</span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[220px]">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-mono">
            Loading ephemeris timeline...
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full select-none" />
        )}
      </div>

      {/* Legend & Guide */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className={`w-3 h-0.5 rounded ${isSun ? 'bg-amber-400' : 'bg-blue-400'}`} />
            <span>{isSun ? 'Sun Elevation' : 'Earth Elevation'}</span>
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
        <div className="text-cyan-400/80">Click or drag timeline to move mission cursor</div>
      </div>
    </div>
  );
};

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LandingSite, SiteCatalogue } from './data/types';
import { loadSiteCatalogue } from './data/loader';
import { useMissionState } from './hooks/useMissionState';
import { useEphemeris } from './hooks/useEphemeris';
import { useTimeline } from './hooks/useTimeline';

// Components
import { Header } from './components/Header';
import { SitePicker } from './components/SitePicker';
import { DatePicker } from './components/DatePicker';
import { CountdownCards } from './components/CountdownCards';
import { ElevationChart } from './components/ElevationChart';
import { MetricsPanel } from './components/MetricsPanel';
import { ViabilityScore } from './components/ViabilityScore';
import { ComparisonPanel } from './components/ComparisonPanel';
import { TerrainToggle } from './components/TerrainToggle';
import { DateSlipHeatmap } from './components/DateSlipHeatmap';
import { SkyView } from './components/SkyView';

import { GitCompare, AlertTriangle } from 'lucide-react';

export default function App() {
  const [catalogue, setCatalogue] = useState<SiteCatalogue | null>(null);
  const [catError, setCatError] = useState<string | null>(null);
  const [customSites, setCustomSites] = useState<LandingSite[]>([]);
  const [searchParams] = useSearchParams();

  // Central mission state
  const {
    state,
    setPrimarySite,
    setComparisonSite,
    setMissionDate,
    setDateSlip,
    setWeights,
    setMode,
    toggleTerrain,
    setCursorTime,
  } = useMissionState();

  // Sync site from URL query parameter (e.g. /app?site=shackleton-rim) with validation
  useEffect(() => {
    const siteParam = searchParams.get('site');
    if (siteParam && catalogue) {
      const isValid = catalogue.sites.some((s) => s.id === siteParam);
      if (isValid && state.primarySiteId !== siteParam) {
        setPrimarySite(siteParam);
      }
    }
  }, [searchParams, catalogue, setPrimarySite, state.primarySiteId]);

  // Load site catalogue on mount
  useEffect(() => {
    let cancelled = false;
    loadSiteCatalogue()
      .then((data) => {
        if (!cancelled) setCatalogue(data);
      })
      .catch((err) => {
        if (!cancelled) setCatError(err.message || 'Failed to load sites');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Combined site list (catalogue + any custom-entered coords)
  const allSites = useMemo(() => {
    const list = catalogue ? [...catalogue.sites] : [];
    return [...list, ...customSites];
  }, [catalogue, customSites]);

  // Active primary and comparison landing sites
  const primarySite = useMemo(
    () => allSites.find((s) => s.id === state.primarySiteId) || null,
    [allSites, state.primarySiteId],
  );

  const comparisonSite = useMemo(
    () => (state.comparisonSiteId ? allSites.find((s) => s.id === state.comparisonSiteId) || null : null),
    [allSites, state.comparisonSiteId],
  );

  // Analysis window start & end calculation (respecting dateSlipDays)
  const { analysisStart, analysisEnd } = useMemo(() => {
    const baseMs = new Date(`${state.missionDate}T${state.landingTime}:00Z`).getTime();
    const effectiveStartMs = baseMs + state.dateSlipDays * 86_400_000;
    const effectiveEndMs = effectiveStartMs + state.analysisWindowDays * 86_400_000;
    return {
      analysisStart: new Date(effectiveStartMs).toISOString(),
      analysisEnd: new Date(effectiveEndMs).toISOString(),
    };
  }, [state.missionDate, state.landingTime, state.dateSlipDays, state.analysisWindowDays]);

  // Load Primary Ephemeris & Terrain data
  const primaryData = useEphemeris(primarySite, state.missionDate);

  // Load Comparison Ephemeris & Terrain data (if comparison site active)
  const comparisonData = useEphemeris(comparisonSite, state.missionDate);

  // Compute Timeline, Metrics & Viability for Primary
  const primaryTimeline = useTimeline(primaryData.data, primaryData.terrain, state);

  // Compute Timeline, Metrics & Viability for Comparison
  const comparisonTimeline = useTimeline(
    comparisonData.data,
    comparisonData.terrain,
    state,
  );

  // Handle custom coordinate creation
  const handleAddCustomCoords = (lat: number, lon: number, name: string) => {
    const customSite: LandingSite = {
      id: `custom-${Date.now()}`,
      name,
      latitude: lat,
      longitude: lon,
      frame: 'MOON_ME',
      mission: 'User Defined Target',
      nation: 'Custom',
      description: `Custom coordinates at (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
      source: 'Manual Coordinate Input',
      terrainAvailability: 'unavailable',
      region: lat < -60 ? 'south-pole' : Math.abs(lat) < 30 ? 'equatorial' : 'near-side',
    };
    setCustomSites((prev) => [...prev, customSite]);
    setPrimarySite(customSite.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation & Status Bar */}
      <Header
        mode={state.mode}
        onModeChange={setMode}
        dataSource={primaryData.data?.source || 'APPROXIMATE'}
        isSimulated={primaryData.isSimulated}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error notification banner if any */}
        {catError && (
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-center space-x-2 text-rose-300 text-xs font-mono">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Catalogue error: {catError}</span>
          </div>
        )}

        {/* Top Grid: Sidebar Controls (Left) & Telemetry / Countdown / Viability (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Mission Planning Parameters (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <SitePicker
              sites={allSites}
              selectedId={state.primarySiteId}
              onSelect={setPrimarySite}
              label="Primary Landing Site"
              allowCustom={true}
              onCustomCoords={handleAddCustomCoords}
            />

            <DatePicker
              missionDate={state.missionDate}
              onDateChange={setMissionDate}
              landingTime={state.landingTime}
              onTimeChange={(_t) => {
                // landing time
              }}
              dateSlipDays={state.dateSlipDays}
              onDateSlipChange={setDateSlip}
            />

            <TerrainToggle
              useTerrainHorizon={state.useTerrainHorizon}
              onChange={toggleTerrain}
              terrainAvailable={primarySite?.terrainAvailability === 'available'}
            />

            {/* Comparison Site Selector */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Trade Study Site Comparison</span>
                </label>
                {state.comparisonSiteId && (
                  <button
                    type="button"
                    onClick={() => setComparisonSite(null)}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              <select
                value={state.comparisonSiteId || ''}
                onChange={(e) => setComparisonSite(e.target.value ? e.target.value : null)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200 font-sans focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- None (Single Site Mode) --</option>
                {allSites
                  .filter((s) => s.id !== state.primarySiteId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.latitude.toFixed(2)}°, {s.longitude.toFixed(2)}°)
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-slate-500 font-mono">
                Select an alternative candidate to run the NASA demo story side-by-side trade study.
              </p>
            </div>
          </div>

          {/* Right Column: Mission Telemetry & Viability (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Countdown Cards to Upcoming Events */}
            <CountdownCards
              countdowns={primaryTimeline.countdowns}
              cursorTime={state.cursorTime}
            />

            {/* Viability Score & Objective Weights */}
            <ViabilityScore
              viability={primaryTimeline.viability}
              onWeightChange={setWeights}
            />

            {/* Side-by-Side Comparison Panel (if active) */}
            {state.comparisonSiteId && (
              <ComparisonPanel
                primarySite={primarySite}
                comparisonSite={comparisonSite}
                primaryMetrics={primaryTimeline.metrics}
                comparisonMetrics={comparisonTimeline.metrics}
                primaryViability={primaryTimeline.viability}
                comparisonViability={comparisonTimeline.viability}
                onClearComparison={() => setComparisonSite(null)}
              />
            )}
          </div>
        </div>

        {/* Middle Section: D3 Elevation Charts */}
        <div className="space-y-4">
          <ElevationChart
            ephemeris={primaryData.data}
            terrain={primaryData.terrain}
            useTerrainHorizon={state.useTerrainHorizon}
            type="sun"
            analysisStart={analysisStart}
            analysisEnd={analysisEnd}
            cursorTime={state.cursorTime}
            onCursorChange={setCursorTime}
            title={`Sun Elevation & Illumination Timeline — ${primarySite?.name || 'Selected Site'}`}
          />

          <ElevationChart
            ephemeris={primaryData.data}
            terrain={primaryData.terrain}
            useTerrainHorizon={state.useTerrainHorizon}
            type="earth"
            analysisStart={analysisStart}
            analysisEnd={analysisEnd}
            cursorTime={state.cursorTime}
            onCursorChange={setCursorTime}
            title={`Direct-to-Earth Line-of-Sight Timeline — ${primarySite?.name || 'Selected Site'}`}
          />
        </div>

        {/* Metrics Grid Panel */}
        <MetricsPanel metrics={primaryTimeline.metrics} mode={state.mode} />

        {/* P1 Stubs: Date-Slip Heatmap & Sky Dome Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateSlipHeatmap
            baseDate={state.missionDate}
            siteName={primarySite?.name || 'Selected Site'}
          />
          <SkyView siteName={primarySite?.name || 'Selected Site'} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 space-y-2 sm:space-y-0">
          <div>
            MOONIX &bull; NASA Space Apps Challenge 2026 &bull; Challenge 10 (CLPS)
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Frame: MOON_ME</span>
            <span>&bull;</span>
            <span>Sun Limb: +0.27°</span>
            <span>&bull;</span>
            <span>Earth Limb: +0.95°</span>
            <span>&bull;</span>
            <span>Observer: 2.0 m</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

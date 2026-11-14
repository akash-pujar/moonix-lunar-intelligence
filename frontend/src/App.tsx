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
import { LunarGlobe, type SiteMarkerData } from './landing/LunarGlobe';

import { GitCompare, AlertTriangle, Sparkles, MapPin } from 'lucide-react';

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

  // Sync site and mode from URL query parameters (e.g. /app?site=shackleton-rim&mode=explorer)
  useEffect(() => {
    const siteParam = searchParams.get('site');
    if (siteParam && catalogue) {
      const isValid = catalogue.sites.some((s) => s.id === siteParam);
      if (isValid && state.primarySiteId !== siteParam) {
        setPrimarySite(siteParam);
      }
    }
    const modeParam = searchParams.get('mode');
    if (modeParam === 'explorer' || modeParam === 'planner') {
      if (state.mode !== modeParam) {
        setMode(modeParam);
      }
    }
  }, [searchParams, catalogue, setPrimarySite, setMode, state.primarySiteId, state.mode]);

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

  // Markers for 3D Lunar Globe
  const globeSites: SiteMarkerData[] = useMemo(() => {
    return allSites.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      region: s.region,
      mission: s.mission,
    }));
  }, [allSites]);

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
        dataSource={primaryData.data?.source || null}
        isSimulated={primaryData.isSimulated}
        loading={primaryData.loading}
        siteName={primarySite?.name}
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

        {/* Explorer Mode: Interactive 3D Lunar Explorer Banner */}
        {state.mode === 'explorer' && (
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* 3D Moon Canvas */}
              <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                  <LunarGlobe
                    sites={globeSites}
                    selectedSiteId={state.primarySiteId}
                    onSelectSite={(id) => setPrimarySite(id)}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-2 text-center">
                  Drag to rotate 3D Moon &bull; Click surface markers or pills to select landing target
                </p>
              </div>

              {/* Explorer Site Summary & Quick Switcher */}
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold tracking-wider uppercase">
                  <Sparkles className="h-4 w-4" />
                  <span>Interactive 3D Lunar Explorer</span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold font-sans text-slate-100">
                    {primarySite?.name || 'Selected Site'}
                  </h2>
                  <p className="text-sm font-mono text-cyan-300 mt-0.5">
                    {primarySite ? `${primarySite.latitude >= 0 ? `+${primarySite.latitude.toFixed(2)}°N` : `${Math.abs(primarySite.latitude).toFixed(2)}°S`}, ${primarySite.longitude >= 0 ? `+${primarySite.longitude.toFixed(2)}°E` : `${Math.abs(primarySite.longitude).toFixed(2)}°W`}` : ''} &bull; {primarySite?.mission}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {primarySite?.description}
                  </p>
                </div>

                {/* Candidate Quick Selection Pills */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500 mb-2">
                    Candidate Landing Sites:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allSites.slice(0, 5).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPrimarySite(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                          s.id === state.primarySiteId
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 shadow-xl backdrop-blur space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Candidate Trade Study</span>
                </label>
                {state.comparisonSiteId && (
                  <button
                    type="button"
                    onClick={() => setComparisonSite(null)}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                  >
                    Clear Comparison
                  </button>
                )}
              </div>

              <select
                value={state.comparisonSiteId || ''}
                onChange={(e) => setComparisonSite(e.target.value ? e.target.value : null)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200 font-sans focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- None (Single Site Mode) --</option>
                {allSites
                  .filter((s) => s.id !== state.primarySiteId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.latitude >= 0 ? `+${s.latitude.toFixed(2)}` : s.latitude.toFixed(2)}°, {s.longitude >= 0 ? `+${s.longitude.toFixed(2)}` : s.longitude.toFixed(2)}°)
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
              useTerrainHorizon={state.useTerrainHorizon}
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
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span>Frame: MOON_ME</span>
            <span>&bull;</span>
            <span>Sun Limb: +0.27°</span>
            <span>&bull;</span>
            <span>Earth Limb: +0.95°</span>
            <span>&bull;</span>
            <span>Observer: 2.0 m</span>
            <span>&bull;</span>
            <span>R_moon: 1,737.4 km</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

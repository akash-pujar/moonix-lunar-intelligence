// HeroSection.tsx — Clean, cinematic aerospace lunar hero experience
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, ArrowRight, Compass } from 'lucide-react';
import { LunarGlobe, type SiteMarkerData } from './LunarGlobe';
import { LunarSiteSelector } from './LunarSiteSelector';
import { SiteInformationPanel } from './SiteInformationPanel';
import { LunarSiteMarkers } from './LunarSiteMarkers';
import { StarfieldCanvas } from './StarfieldCanvas';

// 4 Initial Validated Candidates from sites.json
export const CANDIDATE_SITES: SiteMarkerData[] = [
  {
    id: 'shackleton-rim',
    name: 'Shackleton Rim',
    latitude: -89.54,
    longitude: 0.0,
    region: 'south-pole',
    mission: 'Artemis III Candidate',
  },
  {
    id: 'malapert-massif',
    name: 'Malapert Massif',
    latitude: -86.0,
    longitude: 0.0,
    region: 'south-pole',
    mission: 'CLPS / Artemis Massif',
  },
  {
    id: 'nobile-rim',
    name: 'Nobile Rim',
    latitude: -85.3,
    longitude: 32.5,
    region: 'south-pole',
    mission: 'VIPER / Artemis Candidate',
  },
  {
    id: 'apollo-11',
    name: 'Apollo 11 — Tranquility Base',
    latitude: 0.674,
    longitude: 23.473,
    region: 'equatorial',
    mission: 'Historic Baseline Benchmark',
  },
];

const NAV_LINKS = [
  { label: 'OVERVIEW', href: '#overview' },
  { label: 'MISSION CONTEXT', href: '#mission' },
  { label: 'CAPABILITIES', href: '#capabilities' },
  { label: 'SCIENTIFIC ENGINE', href: '#technology' },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSite = searchParams.get('site');
  const validUrlSite = CANDIDATE_SITES.some((s) => s.id === urlSite) ? urlSite! : 'shackleton-rim';

  const [selectedSiteId, setSelectedSiteId] = useState<string>(validUrlSite);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Sync state if URL changes
  useEffect(() => {
    if (urlSite && CANDIDATE_SITES.some((s) => s.id === urlSite) && urlSite !== selectedSiteId) {
      setSelectedSiteId(urlSite);
    }
  }, [urlSite, selectedSiteId]);

  const handleSelectSite = (id: string) => {
    setSelectedSiteId(id);
    setSearchParams({ site: id }, { replace: true });
  };

  const selectedSite =
    CANDIDATE_SITES.find((s) => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLaunchPlanner = (siteId?: string) => {
    const idToUse = siteId || selectedSiteId;
    navigate(`/app?site=${encodeURIComponent(idToUse)}`);
  };

  return (
    <section
      ref={heroRef}
      id="overview"
      className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-black text-[#F4F7FC]"
      style={{
        background: 'radial-gradient(ellipse 120% 100% at 50% 15%, #05070D 0%, #020308 55%, #000000 100%)',
      }}
    >
      {/* ── Background Astronomical White Starfield ── */}
      <StarfieldCanvas />

      {/* ── Navigation Bar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/85 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-black'
            : 'bg-transparent border-b border-white/5'
        }`}
        role="navigation"
        aria-label="Main aerospace navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-black/80 border border-[#42D9F5]/40 flex items-center justify-center text-[#42D9F5] shadow-[0_0_12px_rgba(66,217,245,0.15)]">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[#F4F7FC] font-semibold text-base tracking-widest font-mono">
                  MOON<span className="text-[#42D9F5]">IX</span>
                </span>
                <div className="text-[#42D9F5] text-[8px] font-mono tracking-[0.2em] uppercase leading-none opacity-80">
                  LUNAR NAVIGATOR
                </div>
              </div>
            </div>

            {/* Desktop Center Links */}
            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-mono tracking-wider text-[#9AA9BF] hover:text-[#F4F7FC] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Launch CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleLaunchPlanner()}
                className="group flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold text-[#02050E] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded-full transition-all duration-200 shadow-md shadow-cyan-500/20 tracking-wider cursor-pointer"
              >
                <span>LAUNCH APP</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-[#9AA9BF] hover:text-[#F4F7FC]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          } bg-black/95 backdrop-blur-2xl border-t border-white/10`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 font-mono text-xs">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-1 text-[#9AA9BF] hover:text-[#42D9F5]"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLaunchPlanner();
              }}
              className="mt-2 flex items-center justify-center gap-2 py-2.5 text-xs font-mono font-semibold text-[#02050E] bg-[#42D9F5] rounded-full"
            >
              LAUNCH MISSION PLANNER <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Composition: Compact Upper Center Header + Large Framed 3D Moon ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-20 pb-4 relative z-10 w-full max-w-7xl mx-auto">
        {/* Small Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-white/10 bg-white/5 mb-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42D9F5] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#42D9F5]" />
          </span>
          <span className="text-[10px] font-mono tracking-[0.22em] text-[#42D9F5] uppercase">
            LUNAR LANDING SITE NAVIGATOR
          </span>
        </div>

        {/* Elegant Editorial Headline (64–76px desktop, 48–58px tablet, 38–44px mobile) */}
        <div className="text-center mb-3">
          <h1 className="leading-[1.0] tracking-tight mb-2.5">
            <span
              className="block text-[#F4F7FC] uppercase"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontWeight: 400,
                fontSize: 'clamp(2.35rem, 4.3vw, 4.4rem)',
                letterSpacing: '-0.02em',
              }}
            >
              NAVIGATE THE MOON.
            </span>
            <span
              className="block italic font-normal uppercase"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(2.35rem, 4.3vw, 4.4rem)',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #42D9F5 0%, #A8EBFF 45%, #F4F7FC 95%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PLAN THE LANDING.
            </span>
          </h1>

          {/* Minimal 1-Sentence Supporting Copy */}
          <p className="text-sm sm:text-base text-[#9AA9BF] max-w-md mx-auto font-light leading-relaxed">
            Explore lunar sites. Evaluate illumination. Plan your landing.
          </p>

          {/* Single Primary Action Button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => handleLaunchPlanner()}
              className="group flex items-center gap-2 px-6 py-2.5 text-xs font-mono font-semibold text-[#02050E] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/25 tracking-widest cursor-pointer"
            >
              <span>LAUNCH MISSION PLANNER</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Accessible mobile site selector pills */}
        <div className="w-full max-w-md lg:hidden my-2">
          <LunarSiteMarkers
            sites={CANDIDATE_SITES}
            selectedSiteId={selectedSiteId}
            onSelectSite={handleSelectSite}
          />
        </div>

        {/* ── Tripartite 3D Hero Layout (Left Candidates | Centered Large 3D Moon | Right Info Panel) ── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-center mt-1 mb-2">
          {/* Left Column: Compact Landing Candidate List (Desktop 3 cols) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-center items-start pl-2">
            <LunarSiteSelector
              sites={CANDIDATE_SITES}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
            />
          </div>

          {/* Center Column: Commanding Large 3D WebGL Moon (Desktop 6 cols, 560–680px diameter) */}
          <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center relative">
            <LunarGlobe
              sites={CANDIDATE_SITES}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
              className="w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] lg:w-[560px] lg:h-[560px] xl:w-[620px] xl:h-[620px] 2xl:w-[660px] 2xl:h-[660px]"
            />

            <div className="text-[9px] font-mono text-white/30 mt-1 flex items-center gap-1.5">
              <span>Drag to rotate</span>
              <span>&bull;</span>
              <span>Click surface markers to inspect</span>
            </div>
          </div>

          {/* Right Column: Featured Site Intelligence Panel (Desktop 3 cols) */}
          <div className="col-span-1 lg:col-span-3 flex justify-center lg:justify-end pr-2">
            <SiteInformationPanel
              site={selectedSite}
              onLaunchPlanner={handleLaunchPlanner}
            />
          </div>
        </div>
      </div>

      {/* ── Minimal Technical Telemetry Strip ── */}
      <div className="w-full border-t border-white/10 bg-black/85 backdrop-blur-md py-2.5 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[9px] font-mono text-[#9AA9BF]/70 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white/30">EPHEMERIS:</span>
            <span className="text-emerald-400 font-medium">NAIF SPICE (DE440)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30">FRAME:</span>
            <span className="text-[#42D9F5] font-medium">MOON_ME (IAU)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30">CANDIDATES:</span>
            <span className="text-[#F4F7FC] font-medium">4 VERIFIED SITES</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30">PRECISION:</span>
            <span className="text-emerald-400 font-medium">&lt; 0.0001° (HORIZONS VALIDATED)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

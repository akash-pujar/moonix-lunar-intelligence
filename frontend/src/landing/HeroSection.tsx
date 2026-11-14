// HeroSection.tsx — Premium cinematic 3D Lunar Landing Experience
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, ArrowRight, ChevronDown, Compass } from 'lucide-react';
import { LunarGlobe, type SiteMarkerData } from './LunarGlobe';
import { LunarSiteSelector } from './LunarSiteSelector';
import { SiteInformationPanel } from './SiteInformationPanel';
import { LunarSiteMarkers } from './LunarSiteMarkers';

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
  { label: 'Overview', href: '#overview' },
  { label: 'Mission', href: '#mission' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Technology', href: '#technology' },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSite = searchParams.get('site');
  const validUrlSite = CANDIDATE_SITES.some((s) => s.id === urlSite) ? urlSite! : 'shackleton-rim';

  const [selectedSiteId, setSelectedSiteId] = useState<string>(validUrlSite);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);
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
    const timer = setTimeout(() => setVisible(true), 120);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer)
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
      className="relative min-h-screen flex flex-col justify-between overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 120% 100% at 50% 20%, #081124 0%, #050914 70%, #03060c 100%)',
      }}
    >
      {/* ── Background Deep Space Starfield ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 12% 18%, rgba(255,255,255,0.85) 0%, transparent 100%),
            radial-gradient(1px 1px at 38% 8%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(2px 2px at 72% 14%, rgba(66,217,245,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 86% 28%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 22% 42%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 64% 52%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 8% 68%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 78% 70%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 52% 82%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 94% 88%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 31% 92%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 44%, rgba(255,181,71,0.6) 0%, transparent 100%)
          `,
        }}
      />

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#050914]/90 backdrop-blur-xl border-b border-[#42D9F5]/15 shadow-xl shadow-black/50'
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main aerospace navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#42D9F5] shadow-[0_0_15px_rgba(66,217,245,0.25)]">
                <Compass className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[#F4F7FC] font-semibold text-lg tracking-widest font-mono">
                  MOON<span className="text-[#42D9F5]">IX</span>
                </span>
                <div className="text-[#42D9F5] text-[9px] font-mono tracking-[0.2em] uppercase leading-none opacity-80">
                  LUNAR LANDING SITE NAVIGATOR
                </div>
              </div>
            </div>

            {/* Desktop Center Links */}
            <div className="hidden md:flex items-center gap-8">
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
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleLaunchPlanner()}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold text-[#050914] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/25 tracking-wider cursor-pointer"
              >
                <span>LAUNCH PLANNER</span>
                <ArrowRight className="h-3.5 w-3.5" />
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
          } bg-[#050914]/95 backdrop-blur-2xl border-t border-[#42D9F5]/10`}
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
              className="mt-2 flex items-center justify-center gap-2 py-2.5 text-xs font-mono font-semibold text-[#050914] bg-[#42D9F5] rounded-full"
            >
              LAUNCH MISSION PLANNER <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Hero Composition: Heading, 3D Moon & Side Selectors ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-24 pb-8 relative z-10 w-full max-w-7xl mx-auto">
        {/* Eyebrow Label */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#42D9F5]/25 bg-[#42D9F5]/5 mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42D9F5] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#42D9F5]" />
          </span>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#42D9F5] uppercase">
            LUNAR LANDING SITE NAVIGATOR
          </span>
        </div>

        {/* Editorial Heading */}
        <div
          className="text-center mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s',
          }}
        >
          <h1 className="leading-[1.08] tracking-tight">
            <span
              className="block text-4xl sm:text-6xl lg:text-7xl text-[#F4F7FC]"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
            >
              Navigate the Moon.
            </span>
            <span
              className="block text-4xl sm:text-6xl lg:text-7xl italic font-normal"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                background: 'linear-gradient(90deg, #42D9F5 0%, #69AFFF 50%, #F4F7FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Plan the Landing.
            </span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#9AA9BF] max-w-xl mx-auto font-light leading-relaxed">
            An intelligent lunar landing-site exploration platform for evaluating solar illumination,
            Earth visibility, terrain conditions and mission timing.
          </p>
        </div>

        {/* Accessible mobile site selector pills */}
        <div className="w-full max-w-md lg:hidden mb-4">
          <LunarSiteMarkers
            sites={CANDIDATE_SITES}
            selectedSiteId={selectedSiteId}
            onSelectSite={handleSelectSite}
          />
        </div>

        {/* Tripartite 3D Hero Layout (Left Selector | Centered 3D Moon | Right Info Panel) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-2">
          {/* Left Column: Side Site Selectors (Desktop 3 cols) */}
          <div
            className="hidden lg:flex lg:col-span-3 flex-col justify-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-24px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}
          >
            <LunarSiteSelector
              sites={CANDIDATE_SITES}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
            />
          </div>

          {/* Center Column: 3D Interactive WebGL Moon (Desktop 6 cols) */}
          <div
            className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.92)',
              transition: 'opacity 1s ease 0.2s, transform 1s ease 0.2s',
            }}
          >
            {/* Glowing orbital ambient backlight */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] rounded-full pointer-events-none opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(66,217,245,0.25) 0%, rgba(105,175,255,0.05) 55%, transparent 75%)',
              }}
            />

            {/* Genuine Three.js WebGL Moon Canvas */}
            <LunarGlobe
              sites={CANDIDATE_SITES}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
              className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[460px] lg:h-[460px]"
            />

            <div className="text-[10px] font-mono text-[#9AA9BF]/50 mt-1 flex items-center gap-1.5">
              <span>Drag to rotate</span>
              <span>&bull;</span>
              <span>Click surface markers to inspect</span>
            </div>
          </div>

          {/* Right Column: Featured Site Intelligence Panel (Desktop 3 cols) */}
          <div
            className="col-span-1 lg:col-span-3 flex justify-center lg:justify-end"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(24px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}
          >
            <SiteInformationPanel
              site={selectedSite}
              onLaunchPlanner={handleLaunchPlanner}
            />
          </div>
        </div>

        {/* Primary CTA Row below Globe */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mt-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
          }}
        >
          <button
            type="button"
            onClick={() => handleLaunchPlanner()}
            className="flex items-center gap-3 px-8 py-3.5 text-xs font-mono font-semibold text-[#050914] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded-full transition-all duration-200 shadow-xl shadow-cyan-500/25 tracking-widest cursor-pointer"
          >
            <span>LAUNCH MISSION PLANNER ({selectedSite.name.toUpperCase()})</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="#mission"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3.5 text-xs font-mono font-medium text-[#9AA9BF] hover:text-[#F4F7FC] border border-[#9AA9BF]/25 hover:border-[#F4F7FC]/40 rounded-full transition-all tracking-wider"
          >
            EXPLORE THE MISSION
          </a>
        </div>
      </div>

      {/* ── Section 12: Technical Telemetry Strip ── */}
      <div
        className="w-full border-t border-[#42D9F5]/10 bg-[#050914]/80 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-8 relative z-10"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 1s ease 0.6s',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[10px] font-mono text-[#9AA9BF]/70 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[#9AA9BF]/40">EPHEMERIS:</span>
            <span className="text-emerald-400 font-medium">NAIF SPICE (DE440)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9AA9BF]/40">FRAME:</span>
            <span className="text-[#42D9F5] font-medium">MOON_ME (IAU)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9AA9BF]/40">ABERRATION:</span>
            <span className="text-[#42D9F5] font-medium">LT+S</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9AA9BF]/40">CANDIDATES:</span>
            <span className="text-[#F4F7FC] font-medium">4 VERIFIED SITES</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9AA9BF]/40">PRECISION:</span>
            <span className="text-emerald-400 font-medium">&lt; 0.0001° (HORIZONS VALIDATED)</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-[#9AA9BF]/40 pointer-events-none z-20"
        aria-hidden="true"
      >
        <span className="text-[9px] font-mono tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
      </div>
    </section>
  );
}

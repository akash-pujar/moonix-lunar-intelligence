// HeroSection.tsx — full-screen cinematic hero with navbar
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Mission', href: '#mission' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Technology', href: '#technology' },
]

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-sm font-medium text-[#9AA9BF] hover:text-[#F4F7FC] transition-colors duration-200 tracking-wide"
    >
      {label}
    </a>
  )
}

export function HeroSection() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const goToDashboard = () => navigate('/app')

  return (
    <section
      ref={heroRef}
      id="overview"
      className="relative min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(to bottom, #050914 0%, #070d1a 60%, #0A1222 100%)' }}
    >
      {/* ── Starfield background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 42% 8%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 70% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 30%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 55%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 70%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 72%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 48% 85%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 93% 90%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 33% 95%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 12% 38%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 28%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 77% 48%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 38% 62%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(2px 2px at 90% 12%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 100%)
          `,
        }}
      />

      {/* ── Lunar horizon glow ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        aria-hidden="true"
        style={{
          height: '55%',
          background: 'radial-gradient(ellipse 100% 60% at 50% 110%, rgba(66,217,245,0.06) 0%, rgba(16,27,45,0.4) 60%, transparent 100%)',
        }}
      />

      {/* ── Moon surface silhouette ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        aria-hidden="true"
        style={{ height: '28%' }}
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="moonGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0A1222" />
              <stop offset="100%" stopColor="#050914" />
            </linearGradient>
          </defs>
          {/* Moon surface silhouette with craters */}
          <path
            d="M0 320 L0 240 Q80 220 140 232 Q180 238 220 220 Q260 202 310 215 Q360 228 410 210 Q450 196 500 208 Q530 215 570 200 Q610 185 660 198 Q710 212 760 195 Q810 178 860 190 Q910 202 950 185 Q990 168 1040 180 Q1090 192 1140 175 Q1190 158 1240 172 Q1300 190 1360 170 Q1410 155 1440 165 L1440 320 Z"
            fill="url(#moonGrad)"
            opacity="0.95"
          />
          {/* Crater texture suggestion */}
          <circle cx="320" cy="240" r="12" fill="none" stroke="rgba(66,217,245,0.06)" strokeWidth="1.5" />
          <circle cx="780" cy="208" r="8" fill="none" stroke="rgba(66,217,245,0.05)" strokeWidth="1" />
          <circle cx="1100" cy="195" r="15" fill="none" stroke="rgba(66,217,245,0.04)" strokeWidth="1.5" />
          {/* Horizon glow line */}
          <path
            d="M0 240 Q80 220 140 232 Q180 238 220 220 Q260 202 310 215 Q360 228 410 210 Q450 196 500 208 Q530 215 570 200 Q610 185 660 198 Q710 212 760 195 Q810 178 860 190 Q910 202 950 185 Q990 168 1040 180 Q1090 192 1140 175 Q1190 158 1240 172 Q1300 190 1360 170 Q1410 155 1440 165"
            fill="none"
            stroke="rgba(66,217,245,0.18)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#050914]/90 backdrop-blur-xl border-b border-[#42D9F5]/10 shadow-lg shadow-black/40'
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* Orbital icon */}
              <div className="relative w-8 h-8 flex-shrink-0">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(66,217,245,0.3)" strokeWidth="1" />
                  <circle cx="16" cy="16" r="9" fill="none" stroke="rgba(66,217,245,0.5)" strokeWidth="1" />
                  <circle cx="16" cy="16" r="3.5" fill="#42D9F5" opacity="0.9" />
                  <circle cx="27" cy="12" r="2" fill="#FFB547" opacity="0.8" />
                  <circle cx="8" cy="22" r="1.5" fill="rgba(105,175,255,0.7)" />
                </svg>
              </div>
              <div>
                <span className="text-[#F4F7FC] font-semibold text-lg tracking-wider font-mono">MOONIX</span>
                <div className="text-[#42D9F5] text-[9px] font-mono tracking-[0.2em] uppercase leading-none opacity-70">
                  LSNA-2026
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.href} href={l.href} label={l.label} />
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={goToDashboard}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#050914] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded transition-all duration-200 shadow-lg shadow-cyan-500/20 font-mono tracking-wide"
              >
                LAUNCH PLANNER
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[#9AA9BF] hover:text-[#F4F7FC] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          } bg-[#050914]/95 backdrop-blur-xl border-t border-[#42D9F5]/10`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} onClick={() => setMobileOpen(false)} />
            ))}
            <button
              onClick={goToDashboard}
              className="mt-2 flex items-center justify-center gap-2 py-2.5 text-sm font-mono font-medium text-[#050914] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded transition-colors w-full"
            >
              LAUNCH MISSION PLANNER <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-40 text-center relative z-10">
        {/* Mission status label */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#42D9F5]/25 bg-[#42D9F5]/5 mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42D9F5] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#42D9F5]" />
          </span>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#42D9F5] uppercase">
            Lunar Landing Site Navigator
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="max-w-4xl mx-auto leading-[1.08] mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s ease 0.25s, transform 0.9s ease 0.25s',
          }}
        >
          <span
            className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-[#F4F7FC]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            Navigate the Moon.
          </span>
          <span
            className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontStyle: 'italic',
              background: 'linear-gradient(90deg, #42D9F5 0%, #69AFFF 60%, #F4F7FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Plan the Landing.
          </span>
        </h1>

        {/* Supporting description */}
        <p
          className="max-w-2xl mx-auto text-base sm:text-lg text-[#9AA9BF] leading-relaxed mb-10 font-light"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.9s ease 0.45s, transform 0.9s ease 0.45s',
          }}
        >
          An intelligent lunar landing-site exploration platform for evaluating solar illumination,
          Earth visibility, terrain conditions and mission timing.
        </p>

        {/* CTA row */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.9s ease 0.6s, transform 0.9s ease 0.6s',
          }}
        >
          <button
            onClick={goToDashboard}
            className="group flex items-center gap-3 px-8 py-3.5 text-sm font-mono font-semibold text-[#050914] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded transition-all duration-200 shadow-xl shadow-cyan-500/25 tracking-widest"
          >
            LAUNCH MISSION PLANNER
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <a
            href="#mission"
            onClick={(e) => { e.preventDefault(); document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-mono font-medium text-[#9AA9BF] hover:text-[#F4F7FC] border border-[#9AA9BF]/25 hover:border-[#F4F7FC]/40 rounded transition-all duration-200 tracking-wider"
          >
            EXPLORE THE MISSION
          </a>
        </div>

        {/* Mission telemetry strip */}
        <div
          className="mt-14 flex flex-wrap justify-center gap-6 text-[10px] font-mono text-[#42D9F5]/60"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 1s ease 0.9s',
          }}
        >
          {[
            ['EPHEMERIS', 'NAIF SPICE DE440'],
            ['FRAME', 'MOON_ME'],
            ['ABERRATION', 'LT+S'],
            ['PRECISION', '< 0.0001°'],
            ['SITES', '4 ACTIVE'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-[#9AA9BF]/40">{k}</span>
              <span className="text-[#42D9F5]/80">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#9AA9BF]/40 z-10"
        style={{ animation: 'bounce 2.5s ease-in-out infinite' }}
        aria-hidden="true"
      >
        <span className="text-[9px] font-mono tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  )
}


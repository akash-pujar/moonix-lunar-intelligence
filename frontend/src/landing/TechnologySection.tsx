// TechnologySection.tsx — Section 4: Architecture, SPICE pipeline, Horizons validation, and 4 demonstration sites
import { useRef, useEffect, useState } from 'react'
import { Cpu, CheckCircle2, Database, BarChart3, WifiOff, ShieldCheck } from 'lucide-react'

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true)
        obs.disconnect()
      }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const TECH_PILLARS = [
  {
    icon: Cpu,
    title: 'NAIF SPICE Engine',
    desc: 'Topocentric apparent position calculations using DE440 planetary ephemeris, MOON_ME frame, and LT+S aberration corrections via CSPICE.',
    tag: 'DE440 / MOON_ME',
  },
  {
    icon: ShieldCheck,
    title: 'JPL Horizons Cross-Validation',
    desc: 'Independently verified against NASA JPL Horizons on-line ephemeris API across 4 sites and multi-season epochs with sub-arcsecond accuracy (< 0.00004°).',
    tag: 'MAE: 0.00001°',
  },
  {
    icon: Database,
    title: 'Offline Precomputed Datasets',
    desc: 'Compact hourly datasets (~230 KB uncompressed, ~52 KB gzip) served statically. Zero runtime astronomy backend dependency required in flight simulation.',
    tag: 'STATIC JSON',
  },
  {
    icon: BarChart3,
    title: 'Interactive D3.js Engine',
    desc: 'Client-side temporal interpolation, solar and Earth elevation trajectory plotting, horizon intersection detection, and real-time cursor tracking.',
    tag: 'D3 VISUALIZATION',
  },
  {
    icon: WifiOff,
    title: 'Zero Live External Calls',
    desc: 'Fully air-gapped runtime architecture. Once loaded, all mission planning calculations, date-slip trade studies, and comparisons execute client-side.',
    tag: 'OFFLINE CAPABLE',
  },
]

const DEMO_SITES = [
  {
    id: 'shackleton-rim',
    name: 'Shackleton Rim',
    lat: -89.54,
    lon: 0.0,
    region: 'South Pole',
    mission: 'Artemis III Candidate',
    provenance: 'SPICE EPHEMERIS',
    status: 'Nominal',
  },
  {
    id: 'malapert-massif',
    name: 'Malapert Massif',
    lat: -86.00,
    lon: 0.0,
    region: 'South Pole',
    mission: 'CLPS / Artemis Massif',
    provenance: 'SPICE EPHEMERIS',
    status: 'Nominal',
  },
  {
    id: 'nobile-rim',
    name: 'Nobile Rim',
    lat: -85.30,
    lon: 32.50,
    region: 'South Pole',
    mission: 'VIPER / CLPS Target',
    provenance: 'SPICE EPHEMERIS',
    status: 'Nominal',
  },
  {
    id: 'apollo-11',
    name: 'Apollo 11 (Tranquility)',
    lat: 0.674,
    lon: 23.473,
    region: 'Equatorial Mare',
    mission: 'Historic Baseline Benchmark',
    provenance: 'SPICE EPHEMERIS',
    status: 'Nominal',
  },
]

export function TechnologySection() {
  const { ref, visible } = useVisible()

  return (
    <section
      id="technology"
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      style={{ background: 'linear-gradient(to bottom, #020308 0%, #05070D 50%, #000000 100%)' }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#42D9F5]/40" />
            <span className="text-[10px] font-mono text-[#42D9F5]/70 tracking-[0.2em] uppercase">Scientific Technology</span>
            <div className="h-px w-8 bg-[#42D9F5]/40" />
          </div>
          <h2
            className="text-4xl sm:text-5xl text-[#F4F7FC] mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            Built on Rigorous Astrodynamics
          </h2>
          <p className="text-[#9AA9BF] text-sm max-w-2xl mx-auto leading-relaxed font-light">
            MOONIX eliminates speculative approximations by combining NASA NAIF SPICE planetary kernels with independent JPL Horizons cross-validation and air-gapped static data delivery.
          </p>
        </div>

        {/* 5 Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {TECH_PILLARS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl border bg-[#05070D]/90 border-white/10 hover:border-[#42D9F5]/40 transition-all duration-300"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.7s ease ${0.1 + idx * 0.08}s, transform 0.7s ease ${0.1 + idx * 0.08}s`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#42D9F5]/10 border border-[#42D9F5]/20 text-[#42D9F5]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono tracking-wider text-[#42D9F5]/80 bg-[#42D9F5]/5 border border-[#42D9F5]/20 px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-[#F4F7FC] font-semibold text-sm mb-2 font-sans tracking-wide">{item.title}</h3>
                <p className="text-[#9AA9BF] text-xs leading-relaxed font-light">{item.desc}</p>
              </div>
            )
          })}

          {/* Provenance Tier Card */}
          <div
            className="p-6 rounded-2xl border bg-[#05070D]/90 border-white/10 hover:border-[#42D9F5]/40 transition-all duration-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-mono text-[#FFB547] uppercase tracking-widest">Data Hierarchy</span>
              <span className="text-[9px] font-mono text-emerald-400">STRICT AUDIT</span>
            </div>
            <h3 className="text-[#F4F7FC] font-semibold text-sm mb-2 font-sans tracking-wide">Multi-Tier Provenance</h3>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between text-emerald-400">
                <span>SPICE EPHEMERIS</span>
                <span className="text-[9px] text-[#9AA9BF]/60">DE440 verified</span>
              </div>
              <div className="flex items-center justify-between text-cyan-400">
                <span>HORIZONS EPHEMERIS</span>
                <span className="text-[9px] text-[#9AA9BF]/60">JPL API ground truth</span>
              </div>
              <div className="flex items-center justify-between text-amber-400">
                <span>APPROXIMATE</span>
                <span className="text-[9px] text-[#9AA9BF]/60">Catalog models</span>
              </div>
              <div className="flex items-center justify-between text-rose-400">
                <span>SIMULATED</span>
                <span className="text-[9px] text-[#9AA9BF]/60">Fallback stub</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Demonstration Sites Showcase */}
        <div
          className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-[#03060E]/90 backdrop-blur-xl"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <div className="text-[10px] font-mono text-[#42D9F5] tracking-[0.2em] uppercase mb-1">
                Phase 1 Verified Baseline
              </div>
              <h3 className="text-xl sm:text-2xl text-[#F4F7FC] font-sans font-semibold">
                Initial Demonstration Landing Sites
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 tracking-wider">
                17,376 Verified Hourly Points
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_SITES.map((site) => (
              <div
                key={site.id}
                className="p-4 rounded-xl border border-white/8 bg-black/60 space-y-2 hover:border-[#42D9F5]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F4F7FC]">{site.name}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </div>
                <div className="text-[11px] font-mono text-[#42D9F5]">
                  {site.lat > 0 ? `+${site.lat.toFixed(3)}°` : `${site.lat.toFixed(3)}°`},{' '}
                  {site.lon > 0 ? `+${site.lon.toFixed(3)}°` : `${site.lon.toFixed(3)}°`}
                </div>
                <div className="text-[10px] text-[#9AA9BF] font-light leading-snug">
                  {site.mission}
                </div>
                <div className="pt-2 flex items-center justify-between text-[9px] font-mono border-t border-white/8">
                  <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    {site.provenance}
                  </span>
                  <span className="text-white/40">4,344 pts</span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-[#9AA9BF]/60 font-mono leading-relaxed">
            * Horizon masks currently assume smooth lunar sphere (R = 1,737.4 km). High-resolution LOLA DEM topographic horizon masking will be applied in Milestone 5.
          </p>
        </div>
      </div>
    </section>
  )
}

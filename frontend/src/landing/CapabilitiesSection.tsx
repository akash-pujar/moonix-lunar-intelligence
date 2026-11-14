// CapabilitiesSection.tsx — Section 3: four capability blocks
import { useRef, useEffect, useState } from 'react'
import { Sun, Globe, MapPin, Calendar, Mountain } from 'lucide-react'

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const CAPABILITIES = [
  {
    icon: Sun,
    accent: '#FFB547',
    label: 'Solar Illumination Analysis',
    tag: 'SPICE EPHEMERIS',
    tagColor: '#42D9F5',
    description:
      'Visualize Sun azimuth and elevation at any lunar landing site. Identify sunrise and sunset windows, solar power availability and illumination duration at hourly resolution across a 180-day mission timeline.',
    details: ['Sun azimuth & elevation (MOON_ME)', 'Sunrise / Sunset events', 'Illumination duration windows', 'Solar power availability index'],
  },
  {
    icon: Globe,
    accent: '#69AFFF',
    label: 'Earth Visibility & Direct-to-Earth',
    tag: 'SPICE EPHEMERIS',
    tagColor: '#42D9F5',
    description:
      'Analyze Earth azimuth and elevation from the lunar surface. Determine when direct-to-Earth communication is geometrically possible — including Earthrise and Earthset crossings at the terrain horizon.',
    details: ['Earth azimuth & elevation (MOON_ME)', 'Direct-to-Earth line-of-sight', 'Earthrise / Earthset events', 'Communication window duration'],
  },
  {
    icon: MapPin,
    accent: '#42D9F5',
    label: 'Landing Site Comparison',
    tag: 'VERIFIED CATALOGUE',
    tagColor: '#42D9F5',
    description:
      'Explore candidate lunar locations across polar and equatorial regimes. Enter custom coordinates or conduct head-to-head trade studies comparing candidate landing sites side-by-side.',
    details: ['12-site candidate catalogue', 'Custom coordinate input', 'Side-by-side comparison mode', 'Viability Index scoring'],
  },
  {
    icon: Calendar,
    accent: '#42D9F5',
    label: 'Mission Timing & Launch Slips',
    tag: 'SIMULATION ENGINE',
    tagColor: '#FFB547',
    description:
      'Investigate how mission timing and launch delays affect illumination and communication conditions. The launch-delay heatmap shows how a slip of up to 30 days alters landing site viability.',
    details: ['Arbitrary UTC mission date', 'Up to 30-day slip simulator', 'Date-slip viability heatmap', 'Planner & Explorer interaction modes'],
  },
  {
    icon: Mountain,
    accent: '#69AFFF',
    label: 'Terrain Horizon & Obstruction',
    tag: 'GEOMETRIC BASELINE',
    tagColor: '#9AA9BF',
    description:
      'Evaluate line-of-sight against the local horizon. The baseline model applies the lunar spherical horizon (R = 1,737.4 km), with an architectural hook for high-resolution LOLA DEM topographic horizon masking.',
    details: ['Spherical tangent horizon (R = 1,737.4 km)', 'Observer eye-level height (2.0 m)', 'LOLA DEM integration hook', 'Honest status: Terrain masking pending M5'],
  },
]

export function CapabilitiesSection() {
  const { ref, visible } = useVisible()

  return (
    <section
      id="capabilities"
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#020308]"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
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
            <span className="text-[10px] font-mono text-[#42D9F5]/70 tracking-[0.2em] uppercase">Capabilities</span>
            <div className="h-px w-8 bg-[#42D9F5]/40" />
          </div>
          <h2
            className="text-4xl sm:text-5xl text-[#F4F7FC] mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            What MOONIX Analyzes
          </h2>
          <p className="text-[#9AA9BF] text-sm max-w-xl mx-auto leading-relaxed font-light">
            Five core analytical domains — each powered by precomputed SPICE ephemerides and
            interactive visualization.
          </p>
        </div>

        {/* Capability cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon
            return (
              <div
                key={cap.label}
                className="group relative p-7 rounded-2xl border bg-[#05070D]/90 border-white/10 hover:border-[#42D9F5]/40 transition-all duration-300 cursor-default"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.8s ease ${0.1 + i * 0.1}s, transform 0.8s ease ${0.1 + i * 0.1}s, background 0.3s ease, box-shadow 0.3s ease`,
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 35px ${cap.accent}10, inset 0 0 25px ${cap.accent}03`
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                {/* Icon + tag row */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${cap.accent}15`, border: `1px solid ${cap.accent}30` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: cap.accent }} />
                  </div>
                  <span
                    className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full border"
                    style={{ color: cap.tagColor, borderColor: `${cap.tagColor}30`, background: `${cap.tagColor}08` }}
                  >
                    {cap.tag}
                  </span>
                </div>

                {/* Label */}
                <h3 className="text-[#F4F7FC] font-semibold text-base mb-3 tracking-wide">{cap.label}</h3>

                {/* Description */}
                <p className="text-[#9AA9BF] text-sm leading-relaxed mb-5 font-light">{cap.description}</p>

                {/* Details list */}
                <ul className="space-y-1.5">
                  {cap.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-[11px] font-mono text-[#9AA9BF]/70">
                      <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: cap.accent }} />
                      {d}
                    </li>
                  ))}
                </ul>

                {/* Corner accent */}
                <div
                  className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(circle at top right, ${cap.accent}10, transparent 70%)`,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

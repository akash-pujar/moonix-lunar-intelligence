// MissionIntro.tsx — Section 2: editorial mission intro
import { useRef, useEffect, useState } from 'react'

function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export function MissionIntro() {
  const { ref, visible } = useVisible()

  return (
    <section
      id="mission"
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(to bottom, #0A1222 0%, #050914 100%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        aria-hidden="true"
        style={{
          backgroundImage: 'linear-gradient(rgba(66,217,245,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(66,217,245,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section label */}
        <div
          className="flex items-center gap-3 mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="h-px flex-1 max-w-8 bg-[#42D9F5]/40" />
          <span className="text-[10px] font-mono text-[#42D9F5]/70 tracking-[0.2em] uppercase">Mission Overview</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Heading */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
            }}
          >
            <h2
              className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl text-[#F4F7FC] leading-[1.1] mb-6"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
            >
              Every Landing Begins With{' '}
              <span style={{ fontStyle: 'italic', color: '#42D9F5' }}>Intelligence.</span>
            </h2>
            <div className="h-px w-16 bg-[#42D9F5]/40 mb-6" />
            <p className="text-[#9AA9BF] leading-relaxed text-base">
              Mission planners need to understand how solar illumination, Earth visibility and
              terrain conditions change at different lunar locations and times.
            </p>
          </div>

          {/* Right: Body text + stat cards */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}
          >
            <p className="text-[#9AA9BF] leading-relaxed text-sm mb-8">
              MOONIX brings these mission considerations into one interactive exploration experience.
              Select a lunar landing site, choose a mission date, and immediately see how
              solar illumination windows, direct-to-Earth communications and viability metrics
              change — including how a 14-day launch delay might affect your options.
            </p>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '< 0.0001°', label: 'Ephemeris accuracy vs JPL Horizons', accent: '#42D9F5' },
                { value: '4,344', label: 'Hourly data points per site', accent: '#69AFFF' },
                { value: '4 Sites', label: 'SPICE-verified landing candidates', accent: '#FFB547' },
                { value: '180 days', label: 'Mission planning timeline window', accent: '#42D9F5' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-4 rounded border border-[#42D9F5]/10 bg-[#101B2D]/60 backdrop-blur"
                  style={{ borderColor: `${s.accent}18` }}
                >
                  <div
                    className="text-xl font-mono font-semibold mb-1"
                    style={{ color: s.accent }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[11px] text-[#9AA9BF] leading-snug">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Important disclaimer */}
            <p className="mt-6 text-[11px] font-mono text-[#9AA9BF]/50 leading-relaxed border-l-2 border-[#9AA9BF]/15 pl-3">
              MOONIX is a research and exploration prototype built for the NASA Space Apps Challenge 2026.
              It is not an official NASA product and is not approved for operational flight use.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


// MissionCTA.tsx — Section 5: Dramatic Closing CTA
import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, ArrowRight } from 'lucide-react'

function useVisible(threshold = 0.15) {
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

export function MissionCTA() {
  const navigate = useNavigate()
  const { ref, visible } = useVisible()

  return (
    <section
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 90% 80% at 50% 90%, rgba(66,217,245,0.08) 0%, #050914 70%)',
      }}
    >
      {/* Background orbital rings decoration */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <div className="w-full h-full rounded-full border border-[#42D9F5]/30 animate-pulse" />
        <div className="absolute inset-12 rounded-full border border-[#69AFFF]/20" />
        <div className="absolute inset-28 rounded-full border border-[#FFB547]/15" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#42D9F5]/30 bg-[#42D9F5]/10 text-[#42D9F5] text-xs font-mono tracking-widest uppercase mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <Rocket className="h-3.5 w-3.5" />
          <span>Ready For Flight Planning</span>
        </div>

        <h2
          className="text-4xl sm:text-6xl text-[#F4F7FC] mb-6 leading-[1.1]"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s',
          }}
        >
          Your Next Mission Starts Here.
        </h2>

        <p
          className="text-base sm:text-lg text-[#9AA9BF] leading-relaxed mb-10 max-w-xl mx-auto font-light"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
          }}
        >
          Explore lunar landing opportunities through illumination, communication and mission timing.
        </p>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.8s ease 0.45s, transform 0.8s ease 0.45s',
          }}
        >
          <button
            onClick={() => navigate('/app')}
            className="group inline-flex items-center gap-3 px-9 py-4 text-sm font-mono font-semibold text-[#050914] bg-[#42D9F5] hover:bg-[#5ee4f8] rounded transition-all duration-200 shadow-2xl shadow-cyan-500/30 tracking-widest cursor-pointer"
          >
            OPEN MISSION PLANNER
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-8 text-[11px] font-mono text-[#9AA9BF]/50">
          Client-side execution &bull; 100% offline capable after initial load
        </div>
      </div>
    </section>
  )
}

// LandingFooter.tsx — Minimal, professional aerospace footer
export function LandingFooter() {
  return (
    <footer className="border-t border-[#42D9F5]/10 bg-[#050914] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#9AA9BF]/60 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="text-[#F4F7FC] font-semibold">MOONIX &mdash; Lunar Landing Site Navigator</span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          <span>NASA Space Apps Challenge 2026</span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          <span>Challenge 10 (CLPS)</span>
        </div>

        <div className="text-center sm:text-right text-[11px] text-[#9AA9BF]/40">
          Built for lunar exploration. Not officially affiliated with or endorsed by NASA.
        </div>
      </div>
    </footer>
  )
}

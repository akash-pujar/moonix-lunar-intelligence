// LandingPage.tsx — assembles all landing sections
import { useSearchParams } from 'react-router-dom'
import { HeroSection } from '../landing/HeroSection'
import { MissionIntro } from '../landing/MissionIntro'
import { CapabilitiesSection } from '../landing/CapabilitiesSection'
import { TechnologySection } from '../landing/TechnologySection'
import { MissionCTA } from '../landing/MissionCTA'
import { LandingFooter } from '../landing/LandingFooter'

export default function LandingPage() {
  const [searchParams] = useSearchParams()
  const siteId = searchParams.get('site') || 'shackleton-rim'

  return (
    <div className="bg-black text-[#F4F7FC] overflow-x-hidden min-h-screen selection:bg-[#42D9F5]/20 selection:text-[#42D9F5]">
      <HeroSection />
      <MissionIntro />
      <CapabilitiesSection />
      <TechnologySection />
      <MissionCTA selectedSiteId={siteId} />
      <LandingFooter />
    </div>
  )
}

// LandingPage.tsx — assembles all landing sections
import { HeroSection } from '../landing/HeroSection'
import { MissionIntro } from '../landing/MissionIntro'
import { CapabilitiesSection } from '../landing/CapabilitiesSection'
import { TechnologySection } from '../landing/TechnologySection'
import { MissionCTA } from '../landing/MissionCTA'
import { LandingFooter } from '../landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="bg-[#050914] text-[#F4F7FC] overflow-x-hidden">
      <HeroSection />
      <MissionIntro />
      <CapabilitiesSection />
      <TechnologySection />
      <MissionCTA />
      <LandingFooter />
    </div>
  )
}


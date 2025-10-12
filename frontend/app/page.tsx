"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { NewHeroSection } from "@/components/new-hero-section"
import { AboutSection } from "@/components/about-section"
import { CoreFeaturesSection } from "@/components/core-features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { SecuritySection } from "@/components/security-section"
import { WhyChooseSection } from "@/components/why-choose-section"
import { PricingSection } from "@/components/pricing-section"
import { FinalCTASection } from "@/components/final-cta-section"
import { NewFooter } from "@/components/new-footer"
import { CinematicLogoLoader } from "@/components/cinematic-logo-loader"

export default function Home() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    // Show loader for 5 seconds, then hide it
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (showLoader) {
    return <CinematicLogoLoader onComplete={() => setShowLoader(false)} />
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Header />
        <NewHeroSection />
        <AboutSection />
        <CoreFeaturesSection />
        <HowItWorksSection />
        <SecuritySection />
        <WhyChooseSection />
        <PricingSection />
        <FinalCTASection />
        <NewFooter />
      </div>
    </main>
  )
}

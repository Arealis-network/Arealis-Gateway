"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CinematicLogoLoader, useCinematicLoader } from "@/components/cinematic-logo-loader"
import { ArrowLeft, Play, Settings } from "lucide-react"
import Link from "next/link"

export default function CinematicDemoPage() {
  const [showLoader, setShowLoader] = useState(false)
  const [duration, setDuration] = useState(5000)
  const { isLoading, startLoader, stopLoader, CinematicLoaderComponent } = useCinematicLoader()

  const handleStartLoader = () => {
    setShowLoader(true)
  }

  const handleComplete = () => {
    setShowLoader(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Loader */}
      {showLoader && (
        <CinematicLogoLoader 
          onComplete={handleComplete} 
          duration={duration}
        />
      )}

      {/* Demo Controls */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Cinematic Logo Loader Demo
          </h1>
          <p className="text-muted-foreground">
            Experience the Arealis Magnus cinematic logo animation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Loader Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Duration (milliseconds)
                </label>
                <input
                  type="range"
                  min="3000"
                  max="10000"
                  step="500"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {duration}ms
                </p>
              </div>

              <Button 
                onClick={handleStartLoader}
                disabled={showLoader}
                className="w-full"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {showLoader ? "Loading..." : "Start Cinematic Loader"}
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Animation Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-quantum-blue rounded-full" />
                  <span className="text-sm">Particle data streams</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-ember rounded-full" />
                  <span className="text-sm">Circuit line morphing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-quantum-blue rounded-full" />
                  <span className="text-sm">Neural network connections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-ember rounded-full" />
                  <span className="text-sm">Metallic logo reveal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-quantum-blue rounded-full" />
                  <span className="text-sm">Quantum spark effects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-ember rounded-full" />
                  <span className="text-sm">Text reveal animation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-quantum-blue rounded-full" />
                  <span className="text-sm">Heartbeat pulse effect</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-ember rounded-full" />
                  <span className="text-sm">Cinematic audio sequence</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-deep-space-black rounded-lg mx-auto mb-2 border" />
                <p className="text-sm font-medium">Deep Space Black</p>
                <p className="text-xs text-muted-foreground">#000814</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-quantum-blue rounded-lg mx-auto mb-2" />
                <p className="text-sm font-medium">Quantum Blue</p>
                <p className="text-xs text-muted-foreground">#007BFF</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-ember rounded-lg mx-auto mb-2" />
                <p className="text-sm font-medium">Gold Ember</p>
                <p className="text-xs text-muted-foreground">#FFD166</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-soft-white rounded-lg mx-auto mb-2 border" />
                <p className="text-sm font-medium">Soft White</p>
                <p className="text-xs text-muted-foreground">#F8F9FA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspiration */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Design Inspiration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Avengers Intro</h4>
                <p className="text-sm text-muted-foreground">
                  Metal morphing and cinematic lighting effects
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Netflix N</h4>
                <p className="text-sm text-muted-foreground">
                  Line ripple forming the symbol
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Juspay Pulse</h4>
                <p className="text-sm text-muted-foreground">
                  Smooth plasma gradient flow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

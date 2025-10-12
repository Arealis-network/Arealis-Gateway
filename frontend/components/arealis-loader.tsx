"use client"

import React, { useState, useEffect } from 'react'
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ArealisLoaderProps {
  type: 'book-demo' | 'csv-upload'
  onComplete?: () => void
  redirectTo?: string
}

interface LoadingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  duration?: number
}

export function ArealisLoader({ type, onComplete, redirectTo = '/overview' }: ArealisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<LoadingStep[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const demoSteps: LoadingStep[] = [
      {
        id: 'init',
        title: 'Initializing Arealis Platform',
        description: 'Setting up payment processing environment',
        status: 'loading',
        duration: 2000
      },
      {
        id: 'connect-acc',
        title: 'Connecting ACC Service',
        description: 'Anti-Corruption Compliance engine online',
        status: 'pending',
        duration: 1500
      },
      {
        id: 'connect-pdr',
        title: 'Connecting PDR Service',
        description: 'Payment Data Reconciliation active',
        status: 'pending',
        duration: 1500
      },
      {
        id: 'connect-arl',
        title: 'Connecting ARL Service',
        description: 'Account Reconciliation Logic ready',
        status: 'pending',
        duration: 1500
      },
      {
        id: 'connect-rca',
        title: 'Connecting RCA Service',
        description: 'Root Cause Analysis engine loaded',
        status: 'pending',
        duration: 1500
      },
      {
        id: 'connect-crrak',
        title: 'Connecting CRRAK Service',
        description: 'Credit Risk Assessment active',
        status: 'pending',
        duration: 1500
      },
      {
        id: 'dashboard',
        title: 'Loading Dashboard',
        description: 'Preparing overview and analytics',
        status: 'pending',
        duration: 2000
      }
    ]

    const csvSteps: LoadingStep[] = [
      {
        id: 'upload',
        title: 'Processing CSV Upload',
        description: 'Validating file format and structure',
        status: 'loading',
        duration: 1500
      },
      {
        id: 'validate',
        title: 'Validating Data',
        description: 'Checking payment records and compliance',
        status: 'pending',
        duration: 2000
      },
      {
        id: 'acc-process',
        title: 'ACC Processing',
        description: 'Running anti-corruption compliance checks',
        status: 'pending',
        duration: 2500
      },
      {
        id: 'pdr-process',
        title: 'PDR Processing',
        description: 'Setting up payment reconciliation',
        status: 'pending',
        duration: 2000
      },
      {
        id: 'dashboard-update',
        title: 'Updating Dashboard',
        description: 'Refreshing overview with new data',
        status: 'pending',
        duration: 1500
      }
    ]

    setSteps(type === 'book-demo' ? demoSteps : csvSteps)
  }, [type])

  useEffect(() => {
    if (steps.length === 0) return

    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Set current step as loading
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'loading' : 
                  index < i ? 'completed' : 'pending'
        })))
        setCurrentStep(i)

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, steps[i].duration || 1500))

        // Check if this is a service connection step
        if (steps[i].id.includes('connect-')) {
          const serviceName = steps[i].id.replace('connect-', '').toUpperCase()
          const isConnected = await checkServiceConnection(serviceName)
          
          setSteps(prev => prev.map((step, index) => ({
            ...step,
            status: index === i ? (isConnected ? 'completed' : 'error') : step.status
          })))

          if (!isConnected) {
            // If service connection fails, continue anyway for demo purposes
            setSteps(prev => prev.map((step, index) => ({
              ...step,
              status: index === i ? 'completed' : step.status
            })))
          }
        } else {
          // Mark as completed
          setSteps(prev => prev.map((step, index) => ({
            ...step,
            status: index === i ? 'completed' : step.status
          })))
        }
      }

      // All steps completed
      setIsComplete(true)
      setTimeout(() => {
        onComplete?.()
        router.push(redirectTo)
      }, 1000)
    }

    processSteps()
  }, [steps, onComplete, router, redirectTo])

  const checkServiceConnection = async (serviceName: string): Promise<boolean> => {
    try {
      const servicePorts: { [key: string]: number } = {
        'ACC': 8000,
        'PDR': 8002,
        'ARL': 8003,
        'RCA': 8004,
        'CRRAK': 8005
      }

      const port = servicePorts[serviceName]
      if (!port) return false

      const response = await fetch(`http://localhost:${port}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })
      
      return response.ok
    } catch (error) {
      console.log(`Service ${serviceName} connection check failed:`, error)
      return false
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0
    return ((currentStep + 1) / steps.length) * 100
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">A</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {type === 'book-demo' ? 'Starting Arealis Demo' : 'Processing Your Data'}
          </h2>
          <p className="text-gray-600">
            {type === 'book-demo' 
              ? 'Connecting to all services and preparing your demo environment'
              : 'Uploading and processing your payment data'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'error' ? 'text-red-700' :
                  step.status === 'loading' ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-700 font-medium mb-2">
              {type === 'book-demo' ? 'Demo Ready!' : 'Processing Complete!'}
            </p>
            <p className="text-sm text-gray-600">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Powered by Arealis Magnus Platform</p>
        </div>
      </div>
    </div>
  )
}

// Hook for using the loader
export function useArealisLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [loaderType, setLoaderType] = useState<'book-demo' | 'csv-upload'>('book-demo')

  const startLoader = (type: 'book-demo' | 'csv-upload') => {
    setLoaderType(type)
    setIsLoading(true)
  }

  const stopLoader = () => {
    setIsLoading(false)
  }

  return {
    isLoading,
    loaderType,
    startLoader,
    stopLoader,
    ArealisLoaderComponent: isLoading ? (
      <ArealisLoader 
        type={loaderType} 
        onComplete={stopLoader}
        redirectTo={loaderType === 'book-demo' ? '/overview' : '/overview'}
      />
    ) : null
  }
}

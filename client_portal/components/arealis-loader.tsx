"use client"

import React, { useState, useEffect } from 'react'
import { Loader2, CheckCircle, AlertCircle, Upload, Database, Shield, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ArealisLoaderProps {
  type: 'csv-upload' | 'processing'
  onComplete?: () => void
  redirectTo?: string
}

interface LoadingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  duration?: number
  icon?: React.ReactNode
}

export function ArealisLoader({ type, onComplete, redirectTo = '/book-demo' }: ArealisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<LoadingStep[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const csvSteps: LoadingStep[] = [
      {
        id: 'upload',
        title: 'Processing CSV Upload',
        description: 'Validating file format and structure',
        status: 'loading',
        duration: 1500,
        icon: <Upload className="h-4 w-4" />
      },
      {
        id: 'validate',
        title: 'Validating Data',
        description: 'Checking payment records and compliance',
        status: 'pending',
        duration: 2000,
        icon: <Shield className="h-4 w-4" />
      },
      {
        id: 'acc-process',
        title: 'ACC Processing',
        description: 'Running anti-corruption compliance checks',
        status: 'pending',
        duration: 2500,
        icon: <Database className="h-4 w-4" />
      },
      {
        id: 'pdr-process',
        title: 'PDR Processing',
        description: 'Setting up payment reconciliation',
        status: 'pending',
        duration: 2000,
        icon: <BarChart3 className="h-4 w-4" />
      },
      {
        id: 'dashboard-update',
        title: 'Updating Dashboard',
        description: 'Refreshing overview with new data',
        status: 'pending',
        duration: 1500,
        icon: <BarChart3 className="h-4 w-4" />
      }
    ]

    const processingSteps: LoadingStep[] = [
      {
        id: 'init',
        title: 'Initializing Processing',
        description: 'Setting up payment processing environment',
        status: 'loading',
        duration: 1000,
        icon: <Database className="h-4 w-4" />
      },
      {
        id: 'validate-batch',
        title: 'Validating Batch',
        description: 'Checking transaction data integrity',
        status: 'pending',
        duration: 1500,
        icon: <Shield className="h-4 w-4" />
      },
      {
        id: 'process-acc',
        title: 'ACC Compliance Check',
        description: 'Running anti-corruption compliance',
        status: 'pending',
        duration: 2000,
        icon: <Database className="h-4 w-4" />
      },
      {
        id: 'process-pdr',
        title: 'Payment Reconciliation',
        description: 'Setting up payment data reconciliation',
        status: 'pending',
        duration: 1800,
        icon: <BarChart3 className="h-4 w-4" />
      },
      {
        id: 'complete',
        title: 'Processing Complete',
        description: 'All transactions processed successfully',
        status: 'pending',
        duration: 1000,
        icon: <CheckCircle className="h-4 w-4" />
      }
    ]

    setSteps(type === 'csv-upload' ? csvSteps : processingSteps)
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

        // Mark as completed
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'completed' : step.status
        })))
      }

      // All steps completed
      setIsComplete(true)
      setTimeout(() => {
        onComplete?.()
        if (redirectTo) {
          router.push(redirectTo)
        }
      }, 1000)
    }

    processSteps()
  }, [steps, onComplete, router, redirectTo])

  const getStepIcon = (status: string, icon?: React.ReactNode) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return icon ? (
          <div className="h-5 w-5 text-gray-400">
            {icon}
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
        )
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
            {type === 'csv-upload' ? 'Processing Your Data' : 'Processing Transactions'}
          </h2>
          <p className="text-gray-600">
            {type === 'csv-upload' 
              ? 'Uploading and processing your payment data through Arealis'
              : 'Running compliance checks and reconciliation'
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
                {getStepIcon(step.status, step.icon)}
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
              {type === 'csv-upload' ? 'Upload Complete!' : 'Processing Complete!'}
            </p>
            <p className="text-sm text-gray-600">
              {redirectTo ? 'Redirecting to dashboard...' : 'All done!'}
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
  const [loaderType, setLoaderType] = useState<'csv-upload' | 'processing'>('csv-upload')

  const startLoader = (type: 'csv-upload' | 'processing', redirectTo?: string) => {
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
        redirectTo={loaderType === 'csv-upload' ? '/overview' : undefined}
      />
    ) : null
  }
}

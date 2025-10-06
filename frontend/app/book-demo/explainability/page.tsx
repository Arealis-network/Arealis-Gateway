"use client"

import { useState, useEffect } from "react"
import { Send, Clock, Calendar, FileText, Brain, Loader2, AlertCircle, CheckCircle, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface QueryHistory {
  id: string
  lineId: string
  batchId: string
  query: string
  timestamp: string
  response?: any
  status: 'pending' | 'success' | 'error'
}

interface RCAResponse {
  rca_id: number
  line_id: string
  batch_id: string
  root_cause: string
  failure_category: string
  recommended_action: string
  evidence_refs: any
  created_at: string
}

export default function ExplainabilityPage() {
  const [lineId, setLineId] = useState("L-2")
  const [batchId, setBatchId] = useState("B-2025-001")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])
  const [selectedResponse, setSelectedResponse] = useState<RCAResponse | null>(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  // Load query history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('rca_query_history')
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        // Ensure we have a valid array
        if (Array.isArray(parsedHistory)) {
          setQueryHistory(parsedHistory)
          setHistoryLoaded(true)
          console.log('📚 Loaded query history from localStorage:', parsedHistory.length, 'queries')
        }
      }
    } catch (error) {
      console.error('❌ Error loading query history from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem('rca_query_history')
    }
  }, [])

  // Save query history to localStorage whenever it changes
  useEffect(() => {
    if (queryHistory.length > 0) {
      try {
        localStorage.setItem('rca_query_history', JSON.stringify(queryHistory))
        console.log('💾 Saved query history to localStorage:', queryHistory.length, 'queries')
      } catch (error) {
        console.error('❌ Error saving query history to localStorage:', error)
      }
    }
  }, [queryHistory])

  const handleAskXAI = async () => {
    if (!query.trim() || !lineId.trim()) {
      alert("Please enter both Line ID and Query")
      return
    }

    setIsLoading(true)
    
    // Add to query history immediately
    const newQuery: QueryHistory = {
      id: Date.now().toString(),
      lineId,
      batchId,
      query: query.trim(),
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    }
    
    addToHistory(newQuery)

    try {
      console.log(`🔍 Sending RCA request for Line ID: ${lineId}, Query: ${query}`)
      
      const response = await fetch('http://localhost:8001/rca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_id: lineId,
          query: query.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rcaResult = await response.json()
      
      console.log('✅ RCA Response received:', rcaResult)

      // Check if response contains an error
      if (rcaResult.error) {
        console.error('❌ RCA service returned error:', rcaResult.error)
        throw new Error(rcaResult.error)
      }

      // Update query history with response
      setQueryHistory(prev => prev.map(q => 
        q.id === newQuery.id 
          ? { ...q, response: rcaResult, status: 'success' }
          : q
      ))

      // Show the response
      setSelectedResponse(rcaResult)
      
      // Clear the query input
      setQuery("")

    } catch (error) {
      console.error('❌ Error calling RCA service:', error)
      
      // Update query history with error
      setQueryHistory(prev => prev.map(q => 
        q.id === newQuery.id 
          ? { ...q, status: 'error' }
          : q
      ))
      
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to get RCA analysis'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewResponse = (queryItem: QueryHistory) => {
    if (queryItem.response) {
      setSelectedResponse(queryItem.response)
    } else {
      alert(`No response available for this query. Status: ${queryItem.status}`)
    }
  }

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all query history?")) {
      setQueryHistory([])
      setSelectedResponse(null)
      localStorage.removeItem('rca_query_history')
      console.log('🗑️ Cleared all query history')
    }
  }

  // Limit query history to prevent localStorage from getting too large
  const addToHistory = (newQuery: QueryHistory) => {
    setQueryHistory(prev => {
      const updated = [newQuery, ...prev]
      // Keep only the last 50 queries to prevent localStorage bloat
      return updated.slice(0, 50)
    })
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-b border-blue-800/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/20 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-blue-300">AI ASSISTANT</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Arealis Prompt Layer</h1>
          <p className="text-lg text-gray-300">Ask xAI about transactions, failures, and system behavior</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Ask xAI Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5" />
                  Ask xAI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Line ID</label>
                    <Input
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                      placeholder="Enter Line ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Batch ID</label>
                    <Input
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                      placeholder="Enter Batch ID"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Query</label>
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about a transaction (e.g., Why did line L-2 fail?)"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 min-h-[120px]"
                  />
                </div>
                
                <Button 
                  onClick={handleAskXAI}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isLoading ? "Analyzing..." : "Ask xAI"}
                </Button>
              </CardContent>
            </Card>

            {/* RCA Response Display */}
            {selectedResponse && (
              <Card className="bg-gray-900/50 border-gray-800 mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Brain className="w-5 h-5" />
                      RCA Analysis Result
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedResponse(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Line ID:</span>
                      <span className="text-white ml-2">{selectedResponse.line_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Batch ID:</span>
                      <span className="text-white ml-2">{selectedResponse.batch_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">RCA ID:</span>
                      <span className="text-white ml-2">{selectedResponse.rca_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {selectedResponse.failure_category}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Root Cause Analysis</h4>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <p className="text-white text-sm leading-relaxed">
                        {selectedResponse.root_cause}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recommended Actions</h4>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                        {selectedResponse.recommended_action}
                      </p>
                    </div>
                  </div>

                  {selectedResponse.evidence_refs && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Evidence References</h4>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <pre className="text-white text-xs overflow-x-auto">
                          {JSON.stringify(selectedResponse.evidence_refs, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Query History */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5" />
                    Query History
                    {historyLoaded && queryHistory.length > 0 && (
                      <span className="text-xs text-green-400 ml-2">
                        ({queryHistory.length} saved)
                      </span>
                    )}
                  </CardTitle>
                  {queryHistory.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearHistory}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {!historyLoaded ? (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p className="text-sm">Loading history...</p>
                  </div>
                ) : queryHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No queries yet</p>
                    <p className="text-xs">Start by asking a question above</p>
                  </div>
                ) : (
                  queryHistory.map((queryItem) => (
                    <div key={queryItem.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white text-sm flex-1">"{queryItem.query}"</p>
                        <div className="flex items-center ml-2">
                          {queryItem.status === 'pending' && (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                          )}
                          {queryItem.status === 'success' && (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          )}
                          {queryItem.status === 'error' && (
                            <AlertCircle className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{queryItem.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Line: {queryItem.lineId} | Batch: {queryItem.batchId}
                      </p>
                      {queryItem.status === 'success' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewResponse(queryItem)}
                          className="text-xs"
                        >
                          View Response
                        </Button>
                      )}
                      {queryItem.status === 'error' && (
                        <span className="text-xs text-red-400">Failed to get response</span>
                      )}
                      {queryItem.status === 'pending' && (
                        <span className="text-xs text-blue-400">Processing...</span>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Brain Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
          <Brain className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

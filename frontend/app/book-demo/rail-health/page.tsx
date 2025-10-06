"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis, LineChart } from "recharts"
import { TriangleAlert, RefreshCw, Play, BarChart3, Trash2 } from "lucide-react"
import { fetchRailHealthData, type RailHealthData, testRailConnection, restartRail, getRailMetrics } from "@/lib/agents-api"
import { useEffect, useState } from "react"

const successData = [
  { time: "00:00", IMPS: 98, NEFT: 96, RTGS: 99 },
  { time: "06:00", IMPS: 97, NEFT: 94, RTGS: 99 },
  { time: "12:00", IMPS: 99, NEFT: 92, RTGS: 99 },
  { time: "18:00", IMPS: 98, NEFT: 91, RTGS: 99 },
  { time: "24:00", IMPS: 99, NEFT: 93, RTGS: 99 },
]

const latencyData = [
  { time: "00:00", p95: 0.9 },
  { time: "06:00", p95: 1.2 },
  { time: "12:00", p95: 1.6 },
  { time: "18:00", p95: 1.1 },
  { time: "24:00", p95: 1.0 },
]

const penaltyTrend = [
  { time: "T-4h", count: 2, impact: 2 },
  { time: "T-3h", count: 5, impact: 7 },
  { time: "T-2h", count: 9, impact: 16 },
  { time: "T-1h", count: 7, impact: 23 },
  { time: "Now", count: 6, impact: 29 },
]

export default function RailHealthPage() {
  const [railHealthData, setRailHealthData] = useState<RailHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())
  const [railMetrics, setRailMetrics] = useState<any>(null)
  const [showMetrics, setShowMetrics] = useState(false)

  // Fetch rail health data from PDR agent
  useEffect(() => {
    const loadRailHealthData = async () => {
      try {
        setLoading(true)
        const data = await fetchRailHealthData()
        setRailHealthData(data)
      } catch (error) {
        console.error('Error loading rail health data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRailHealthData()
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(loadRailHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Action handler functions
  const handleTestRailConnection = async (railName: string) => {
    setProcessingActions(prev => new Set(prev).add(`test-${railName}`));
    try {
      const result = await testRailConnection(railName);
      if (result.success) {
        console.log(`🔍 ${result.data.details}`);
        alert(`Rail ${railName} connection test: ${result.data.connection_status}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error testing rail connection:', error);
      alert(`Failed to test rail connection. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`test-${railName}`);
        return newSet;
      });
    }
  };

  const handleRestartRail = async (railName: string) => {
    setProcessingActions(prev => new Set(prev).add(`restart-${railName}`));
    try {
      const result = await restartRail(railName);
      if (result.success) {
        console.log(`🔄 ${result.message}`);
        alert(`Rail ${railName} restart initiated. Estimated completion: ${new Date(result.data.estimated_completion).toLocaleTimeString()}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error restarting rail:', error);
      alert(`Failed to restart rail. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`restart-${railName}`);
        return newSet;
      });
    }
  };

  const handleViewRailMetrics = async (railName: string) => {
    setProcessingActions(prev => new Set(prev).add(`metrics-${railName}`));
    try {
      const result = await getRailMetrics(railName);
      if (result.success) {
        setRailMetrics(result.data);
        setShowMetrics(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error getting rail metrics:', error);
      alert(`Failed to get rail metrics. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`metrics-${railName}`);
        return newSet;
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all rail health data? This action cannot be undone.")) {
      return
    }

    setProcessingActions(prev => new Set(prev).add('clear-data'))
    
    try {
      // Reset all data to initial state
      setRailHealthData(null)
      setRailMetrics(null)
      setShowMetrics(false)
      
      // Reload fresh data
      const data = await fetchRailHealthData()
      setRailHealthData(data)
      
      console.log("✅ Rail health data cleared successfully")
    } catch (error) {
      console.error("❌ Error clearing rail health data:", error)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('clear-data')
        return newSet
      })
    }
  };

  // Get rail performance data for charts
  const getRailPerformanceData = () => {
    if (!railHealthData?.rail_performance) return successData
    
    return railHealthData.rail_performance.map(rail => ({
      time: new Date(rail.last_updated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      [rail.rail_name]: rail.success_rate,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Rail Health</h1>
          <p className="text-sm text-muted-foreground text-pretty">Routing intelligence & SRE view</p>
        </div>
        <Button 
          variant="outline"
          className="gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          onClick={handleClearData}
          disabled={processingActions.has('clear-data')}
        >
          <Trash2 className="h-4 w-4" />
          {processingActions.has('clear-data') ? 'Clearing...' : 'Clear Data'}
        </Button>
      </div>

      {/* Advisory */}
      <Alert
        className="glass-card glass-warning text-warning-foreground ring-1 ring-warning/45 border-warning/30"
        role="status"
        aria-live="polite"
      >
        <TriangleAlert className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-warning-foreground/95">Advisories:</span>
            {loading ? (
              <span className="text-muted-foreground">Loading rail status...</span>
            ) : (
              <>
                {railHealthData?.rail_advisories?.map((advisory, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`px-2.5 py-0.5 text-xs ${
                        advisory.severity === 'high' 
                          ? 'bg-warning/25 text-warning-foreground ring-1 ring-warning/40'
                          : 'bg-success/25 text-success-foreground ring-1 ring-success/40'
                      }`}
                    >
                      {advisory.rail_name}
                    </Badge>
                    <span className="text-muted-foreground">{advisory.message}</span>
                    {index < (railHealthData?.rail_advisories?.length || 0) - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                )) || (
                  <>
                    <Badge
                      variant="outline"
                      className="px-2.5 py-0.5 text-xs bg-warning/25 text-warning-foreground ring-1 ring-warning/40"
                    >
                      NEFT
                    </Badge>
                    <span className="text-muted-foreground">penalty high, window closing</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">prefer</span>
                    <Badge
                      variant="outline"
                      className="px-2.5 py-0.5 text-xs bg-success/25 text-success-foreground ring-1 ring-success/40"
                    >
                      IMPS
                    </Badge>
                    <span className="text-muted-foreground">for next</span>
                    <Badge
                      variant="outline"
                      className="px-2.5 py-0.5 text-xs bg-primary/25 text-primary-foreground ring-1 ring-primary/40"
                    >
                      30m
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Per-rail success rate (24h) */}
      <Card className="glass-card glass-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Per-rail success rate (24h)</span>
            <span className="text-xs text-muted-foreground">Higher is better</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              IMPS: { label: "IMPS", color: "hsl(210, 80%, 60%)" },
              NEFT: { label: "NEFT", color: "hsl(20, 90%, 60%)" },
              RTGS: { label: "RTGS", color: "hsl(140, 70%, 55%)" },
            }}
            className="h-[260px]"
          >
            <LineChart data={getRailPerformanceData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="IMPS"
                stroke="var(--color-IMPS)"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                type="monotone"
                dataKey="NEFT"
                stroke="var(--color-NEFT)"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                type="monotone"
                dataKey="RTGS"
                stroke="var(--color-RTGS)"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Penalty trend (Critic) */}
      <Card className="glass-card glass-destructive">
        <CardHeader>
          <CardTitle>Penalty trend (Critic)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "# Penalties", color: "hsl(0, 80%, 60%)" },
              impact: { label: "Impact Score", color: "hsl(12, 80%, 62%)" },
            }}
            className="h-[260px]"
          >
            <ComposedChart data={penaltyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" name="# Penalties" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="impact"
                stroke="var(--color-impact)"
                strokeWidth={2}
                dot={false}
                name="Impact Score"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* p95 dispatch latency (s) */}
      <Card className="glass-card glass-warning">
        <CardHeader>
          <CardTitle>p95 dispatch latency (s)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ p95: { label: "Latency (s)", color: "hsl(45, 90%, 60%)" } }} className="h-[260px]">
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <ReferenceLine
                y={2}
                stroke="hsl(0, 80%, 60%)"
                strokeDasharray="6 6"
                label={{ value: "SLA 2s", position: "right", fill: "hsl(0,80%,60%)" }}
              />
              <Line
                type="monotone"
                dataKey="p95"
                stroke="var(--color-p95)"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cut-off timers */}
      <Card className="glass-card glass-primary">
        <CardHeader>
          <CardTitle>Cut-off timers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(railHealthData?.cutoff_timers || [
              { rail: "NEFT", cutoff: "In 22m", tone: "warning" },
              { rail: "RTGS", cutoff: "In 2h 10m", tone: "default" },
              { rail: "IMPS", cutoff: "No cut-off", tone: "success" },
            ]).map((c) => (
              <li key={c.rail} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{c.rail}</span>
                  <Badge
                    variant="outline"
                    className={
                      c.tone === "warning"
                        ? "bg-warning/25 text-warning-foreground ring-1 ring-warning/40"
                        : c.tone === "success"
                          ? "bg-success/25 text-success-foreground ring-1 ring-success/40"
                          : "bg-muted text-muted-foreground"
                    }
                  >
                    {c.cutoff || c.time_remaining}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleTestRailConnection(c.rail)}
                    disabled={processingActions.has(`test-${c.rail}`)}
                    title="Test Connection"
                  >
                    <Play className={`h-3 w-3 ${processingActions.has(`test-${c.rail}`) ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleRestartRail(c.rail)}
                    disabled={processingActions.has(`restart-${c.rail}`)}
                    title="Restart Rail"
                  >
                    <RefreshCw className={`h-3 w-3 ${processingActions.has(`restart-${c.rail}`) ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleViewRailMetrics(c.rail)}
                    disabled={processingActions.has(`metrics-${c.rail}`)}
                    title="View Metrics"
                  >
                    <BarChart3 className={`h-3 w-3 ${processingActions.has(`metrics-${c.rail}`) ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Rail Metrics Modal */}
      {showMetrics && railMetrics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rail Metrics - {railMetrics.rail_name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMetrics(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uptime</label>
                  <p className="text-sm font-mono">{railMetrics.uptime_percentage}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Avg Response Time</label>
                  <p className="text-sm font-mono">{railMetrics.avg_response_time}s</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Success Rate</label>
                  <p className="text-sm font-mono">{railMetrics.success_rate}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Errors (24h)</label>
                  <p className="text-sm font-mono">{railMetrics.error_count_24h}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Load</label>
                  <p className="text-sm font-mono">{railMetrics.current_load}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Peak Load (24h)</label>
                  <p className="text-sm font-mono">{railMetrics.peak_load_24h}%</p>
                </div>
              </div>

              {railMetrics.last_error && railMetrics.last_error !== "None" && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Error</label>
                  <p className="text-sm text-red-400">{railMetrics.last_error}</p>
                  {railMetrics.last_error_time && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(railMetrics.last_error_time).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Generated at: {new Date(railMetrics.generated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

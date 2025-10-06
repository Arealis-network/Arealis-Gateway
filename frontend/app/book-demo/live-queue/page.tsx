"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, XCircle, Eye, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/demo/page-header"
import { KpiCard } from "@/components/demo/kpi-card"
import { Download } from "lucide-react"
import { AdvisoryBanner } from "@/components/demo/advisory-banner"
import { fetchLiveQueueData, type LiveQueueData, exportLiveQueueCSV, retryTransaction, cancelTransaction, getTransactionDetails } from "@/lib/agents-api"
import { useEffect, useState } from "react"

const pendingPayments = [
  {
    id: "TRC-2024-001240",
    amount: "₹18,000",
    railCandidate: "IMPS",
    nextAction: "ACC Check",
    age: "12s",
    sla: "On track",
  },
  {
    id: "TRC-2024-001241",
    amount: "₹35,000",
    railCandidate: "NEFT",
    nextAction: "PDR Selection",
    age: "45s",
    sla: "On track",
  },
]

const releaseQueue = [
  {
    id: "TRC-2024-001234",
    amount: "₹25,000",
    selectedRail: "IMPS",
    rescoreAt: "10:25:00",
    shiftPossible: "Yes",
    age: "2m 15s",
  },
  {
    id: "TRC-2024-001235",
    amount: "₹50,000",
    selectedRail: "RTGS",
    rescoreAt: "10:26:30",
    shiftPossible: "No",
    age: "1m 30s",
  },
]

const dispatched = [
  {
    id: "TRC-2024-001230",
    amount: "₹20,000",
    rail: "IMPS",
    utr: "UTR2024001230456",
    status: "Success",
    time: "10:20:15",
  },
  {
    id: "TRC-2024-001231",
    amount: "₹15,000",
    rail: "NEFT",
    utr: "—",
    status: "Failed",
    time: "10:18:42",
  },
]

export default function LiveQueuePage() {
  const [liveQueueData, setLiveQueueData] = useState<LiveQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set());
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch live queue data from PDR agent
  useEffect(() => {
    const loadLiveQueueData = async () => {
      try {
        setLoading(true);
        const data = await fetchLiveQueueData();
        setLiveQueueData(data);
      } catch (error) {
        console.error('Error loading live queue data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLiveQueueData();
    
    // Refresh data every 10 seconds for real-time updates
    const interval = setInterval(loadLiveQueueData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Action handler functions
  const handleExportCSV = async () => {
    setProcessingActions(prev => new Set(prev).add('export-csv'));
    try {
      const result = await exportLiveQueueCSV();
      if (result.success) {
        // Create and download the CSV file
        const blob = new Blob([result.data.csv_content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`📥 Live queue CSV exported successfully`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      alert(`Failed to export CSV. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete('export-csv');
        return newSet;
      });
    }
  };

  const handleRetryTransaction = async (traceId: string) => {
    setProcessingActions(prev => new Set(prev).add(`retry-${traceId}`));
    try {
      const result = await retryTransaction(traceId);
      if (result.success) {
        // Refresh data to get updated status
        const updatedData = await fetchLiveQueueData();
        setLiveQueueData(updatedData);
        console.log(`✅ ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error retrying transaction:', error);
      alert(`Failed to retry transaction. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`retry-${traceId}`);
        return newSet;
      });
    }
  };

  const handleCancelTransaction = async (traceId: string) => {
    setProcessingActions(prev => new Set(prev).add(`cancel-${traceId}`));
    try {
      const result = await cancelTransaction(traceId);
      if (result.success) {
        // Refresh data to get updated status
        const updatedData = await fetchLiveQueueData();
        setLiveQueueData(updatedData);
        console.log(`❌ ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error cancelling transaction:', error);
      alert(`Failed to cancel transaction. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`cancel-${traceId}`);
        return newSet;
      });
    }
  };

  const handleViewDetails = async (traceId: string) => {
    setProcessingActions(prev => new Set(prev).add(`details-${traceId}`));
    try {
      const result = await getTransactionDetails(traceId);
      if (result.success) {
        setTransactionDetails(result.data);
        setShowDetails(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error getting transaction details:', error);
      alert(`Failed to get transaction details. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`details-${traceId}`);
        return newSet;
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all live queue data? This action cannot be undone.")) {
      return
    }

    setProcessingActions(prev => new Set(prev).add('clear-data'))
    
    try {
      // Reset all data to initial state
      setLiveQueueData(null)
      setTransactionDetails(null)
      setShowDetails(false)
      
      // Reload fresh data
      const data = await fetchLiveQueueData()
      setLiveQueueData(data)
      
      console.log("✅ Live queue data cleared successfully")
    } catch (error) {
      console.error("❌ Error clearing live queue data:", error)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('clear-data')
        return newSet
      })
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Live Queue"
        description="Real-time routing & dispatch visibility"
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              onClick={handleClearData}
              disabled={processingActions.has('clear-data')}
            >
              <Trash2 className="h-3 w-3" />
              {processingActions.has('clear-data') ? 'Clearing...' : 'Clear Data'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportCSV}
              disabled={processingActions.has('export-csv')}
            >
              <Download className={`h-3 w-3 mr-2 ${processingActions.has('export-csv') ? 'animate-pulse' : ''}`} />
              {processingActions.has('export-csv') ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        }
      />
      <AdvisoryBanner className="mt-2" />
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard 
          label="In Queue" 
          value={loading ? "..." : (liveQueueData?.queue_metrics?.in_queue?.toLocaleString() || "2,847")} 
          delta={loading ? "..." : `+${liveQueueData?.queue_metrics?.queue_change_percent?.toFixed(1) || '18.2'}% vs 24h`} 
          trend="up" 
        />
        <KpiCard 
          label="Release Queue" 
          value={loading ? "..." : (liveQueueData?.queue_metrics?.release_queue?.toString() || "312")} 
          delta={loading ? "..." : `Re-score in next ${liveQueueData?.queue_metrics?.rescore_in_minutes || 2}m`} 
          trend="flat" 
        />
        <KpiCard 
          label="Success Rate" 
          value={loading ? "..." : `${liveQueueData?.queue_metrics?.success_rate?.toFixed(1) || '98.7'}%`} 
          delta="Stable" 
          trend="flat" 
        />
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-background/60 supports-[backdrop-filter]:bg-background/40 backdrop-blur border rounded-lg bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-cyan-500/20">
          <TabsTrigger value="pending" className="tab-pill">
            Pending
          </TabsTrigger>
          <TabsTrigger value="release" className="tab-pill">
            Release Queue
          </TabsTrigger>
          <TabsTrigger value="dispatched" className="tab-pill">
            Dispatched
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card className="glass-card glass-primary">
            <CardHeader>
              <CardTitle>Pending (Awaiting ACC/PDR)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trace ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rail Candidate</TableHead>
                    <TableHead>Next Action</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(liveQueueData?.pending_payments || pendingPayments).map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {payment.rail_candidate || payment.railCandidate}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.next_action || payment.nextAction}</TableCell>
                      <TableCell>{payment.age}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          (payment.sla_status === 'on_track' || payment.sla === 'On track') ? 
                          "bg-success/15 text-success-foreground" :
                          (payment.sla_status === 'warning' || payment.sla === 'Warning') ?
                          "bg-warning/15 text-warning-foreground" :
                          "bg-destructive/15 text-destructive-foreground"
                        }>
                          {payment.sla_status || payment.sla}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDetails(payment.trace)}
                          disabled={processingActions.has(`details-${payment.trace}`)}
                        >
                          <Eye className={`h-4 w-4 ${processingActions.has(`details-${payment.trace}`) ? 'animate-pulse' : ''}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="release" className="space-y-4">
          <Card className="glass-card glass-primary">
            <CardHeader>
              <CardTitle>Release Queue (Pre-commit Re-score)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trace ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Selected Rail</TableHead>
                    <TableHead>Re-score At</TableHead>
                    <TableHead>Shift Possible?</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {releaseQueue.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {payment.selectedRail}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.rescoreAt}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            payment.shiftPossible === "Yes"
                              ? "bg-success/15 text-success-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {payment.shiftPossible}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.age}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRetryTransaction(payment.trace)}
                            disabled={processingActions.has(`retry-${payment.trace}`)}
                          >
                            <RefreshCw className={`h-3 w-3 ${processingActions.has(`retry-${payment.trace}`) ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelTransaction(payment.trace)}
                            disabled={processingActions.has(`cancel-${payment.trace}`)}
                          >
                            <XCircle className={`h-3 w-3 ${processingActions.has(`cancel-${payment.trace}`) ? 'animate-pulse' : ''}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatched" className="space-y-4">
          <Card className="glass-card glass-primary">
            <CardHeader>
              <CardTitle>Dispatched (with UTR or Fail Code)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trace ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rail</TableHead>
                    <TableHead>UTR</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatched.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {payment.rail}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{payment.utr}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            payment.status === "Success"
                              ? "bg-success/15 text-success-foreground"
                              : "bg-destructive/15 text-destructive-foreground"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{payment.time}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDetails(payment.trace)}
                          disabled={processingActions.has(`details-${payment.trace}`)}
                        >
                          <Eye className={`h-4 w-4 ${processingActions.has(`details-${payment.trace}`) ? 'animate-pulse' : ''}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      {showDetails && transactionDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Transaction Details</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetails(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trace ID</label>
                  <p className="text-sm">{transactionDetails.trace_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm">{transactionDetails.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-sm">{transactionDetails.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Beneficiary</label>
                  <p className="text-sm">{transactionDetails.beneficiary}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Initiated At</label>
                  <p className="text-sm">{new Date(transactionDetails.initiated_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Processing Time</label>
                  <p className="text-sm">{transactionDetails.processing_time}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Stage</label>
                <p className="text-sm">{transactionDetails.current_stage}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Processing Stages</label>
                <div className="space-y-2 mt-2">
                  {transactionDetails.stages?.map((stage: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                      <div className={`w-2 h-2 rounded-full ${
                        stage.status === 'completed' ? 'bg-green-500' :
                        stage.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{stage.stage}</p>
                        {stage.timestamp && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(stage.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={
                        stage.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        stage.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {stage.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {transactionDetails.error_details && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Error Details</label>
                  <p className="text-sm text-red-400">{transactionDetails.error_details}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Retry Count</label>
                <p className="text-sm">{transactionDetails.retry_count}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

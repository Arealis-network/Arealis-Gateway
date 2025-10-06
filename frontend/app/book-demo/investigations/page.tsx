"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, RefreshCw, FileText, XCircle, Download, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PageHeader } from "@/components/demo/page-header"
import { fetchInvestigationData, type InvestigationData, retryInvestigation, cancelInvestigation, getDecisionStory, downloadAuditPack } from "@/lib/agents-api"
import { useEffect, useState } from "react"

const investigations = [
  {
    id: "TRC-2024-001236",
    amount: "₹15,000",
    cause: "Approval expired",
    time: "8m ago",
    assignedTo: "—",
    nextStep: "Retry",
  },
  {
    id: "TRC-2024-001231",
    amount: "₹15,000",
    cause: "Rail fail (NEFT timeout)",
    time: "22m ago",
    assignedTo: "John Smith",
    nextStep: "Retry",
  },
  {
    id: "TRC-2024-001228",
    amount: "₹45,000",
    cause: "Recon exception",
    time: "1h 15m ago",
    assignedTo: "Jane Doe",
    nextStep: "Request info",
  },
  {
    id: "TRC-2024-001220",
    amount: "₹100,000",
    cause: "ACC hold (watchlist match)",
    time: "2h 30m ago",
    assignedTo: "Compliance Team",
    nextStep: "Request info",
  },
]

export default function InvestigationsPage() {
  const [investigationData, setInvestigationData] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set());
  const [decisionStory, setDecisionStory] = useState<any>(null);
  const [showDecisionStory, setShowDecisionStory] = useState(false);

  // Fetch investigation data from RCA agent
  useEffect(() => {
    const loadInvestigationData = async () => {
      try {
        setLoading(true);
        const data = await fetchInvestigationData();
        setInvestigationData(data);
      } catch (error) {
        console.error('Error loading investigation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvestigationData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadInvestigationData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Action handler functions
  const handleRetry = async (investigationId: string) => {
    setProcessingActions(prev => new Set(prev).add(`retry-${investigationId}`));
    try {
      const result = await retryInvestigation(investigationId);
      if (result.success) {
        // Refresh data to get updated status
        const updatedData = await fetchInvestigationData();
        setInvestigationData(updatedData);
        console.log(`✅ ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error retrying investigation:', error);
      alert(`Failed to retry investigation. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`retry-${investigationId}`);
        return newSet;
      });
    }
  };

  const handleCancel = async (investigationId: string) => {
    setProcessingActions(prev => new Set(prev).add(`cancel-${investigationId}`));
    try {
      const result = await cancelInvestigation(investigationId);
      if (result.success) {
        // Refresh data to get updated status
        const updatedData = await fetchInvestigationData();
        setInvestigationData(updatedData);
        console.log(`❌ ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error cancelling investigation:', error);
      alert(`Failed to cancel investigation. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`cancel-${investigationId}`);
        return newSet;
      });
    }
  };

  const handleOpenDecisionStory = async (investigationId: string) => {
    setProcessingActions(prev => new Set(prev).add(`story-${investigationId}`));
    try {
      const result = await getDecisionStory(investigationId);
      if (result.success) {
        setDecisionStory(result.data);
        setShowDecisionStory(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error getting decision story:', error);
      alert(`Failed to get decision story. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`story-${investigationId}`);
        return newSet;
      });
    }
  };

  const handleDownloadAuditPack = async (investigationId: string) => {
    setProcessingActions(prev => new Set(prev).add(`download-${investigationId}`));
    try {
      const result = await downloadAuditPack(investigationId);
      if (result.success) {
        // Create and download the audit pack file
        const blob = new Blob([result.data.audit_pack_content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_pack_${investigationId}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`📥 Audit pack downloaded for investigation ${investigationId}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error downloading audit pack:', error);
      alert(`Failed to download audit pack. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`download-${investigationId}`);
        return newSet;
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all investigation data? This action cannot be undone.")) {
      return
    }

    setProcessingActions(prev => new Set(prev).add('clear-data'))
    
    try {
      // Reset all data to initial state
      setInvestigationData(null)
      setDecisionStory(null)
      setShowDecisionStory(false)
      
      // Reload fresh data
      const data = await fetchInvestigationData()
      setInvestigationData(data)
      
      console.log("✅ Investigation data cleared successfully")
    } catch (error) {
      console.error("❌ Error clearing investigation data:", error)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('clear-data')
        return newSet
      })
    }
  };

  // Get unique cause categories for badges
  const causeCategories = investigationData?.active_investigations?.reduce((acc, inv) => {
    const category = inv.primary_cause.toLowerCase().replace(/\s+/g, '_');
    if (!acc.includes(category)) {
      acc.push(category);
    }
    return acc;
  }, [] as string[]) || ['approval_expired', 'rail_fail', 'recon_exception', 'acc_hold'];

  return (
    <div className="space-y-6">
      {/* Gradient PageHeader at the very top for a cohesive overview */}
      <PageHeader eyebrow="Operations" title="Investigations" description="Triage & fix what's blocking flow" />
      
      {/* Clear Data Button */}
      <div className="flex justify-end mb-4">
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
      
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-background/60 supports-[backdrop-filter]:bg-background/40 backdrop-blur p-2 sticky top-2 z-10 bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-cyan-500/20">
        {causeCategories.map((category) => (
          <Badge key={category} variant="outline">
            {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        ))}
      </div>
      <Separator className="my-2" />
      <Card className="glass-card glass-primary border border-border bg-card/60 supports-[backdrop-filter]:bg-card/50 backdrop-blur bg-gradient-to-b from-sky-500/8 via-cyan-400/5 to-teal-400/8">
        <CardHeader>
          <CardTitle>Active Investigations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              <TableRow>
                <TableHead>Trace ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Primary Cause</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Next Step</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(investigationData?.active_investigations || investigations).map((case_) => (
                <TableRow key={case_.investigation_id || case_.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono text-sm">{case_.investigation_id || case_.id}</TableCell>
                  <TableCell className="font-medium">{case_.amount || "₹0"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span>{case_.primary_cause || case_.cause}</span>
                    </div>
                  </TableCell>
                  <TableCell>{case_.created_at || case_.timestamp || case_.time}</TableCell>
                  <TableCell>{case_.assigned_to || case_.assignedTo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                      {case_.next_step || case_.nextStep || "Investigate"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Retry"
                        onClick={() => handleRetry(case_.investigation_id || case_.id)}
                        disabled={processingActions.has(`retry-${case_.investigation_id || case_.id}`)}
                      >
                        <RefreshCw className={`h-3 w-3 ${processingActions.has(`retry-${case_.investigation_id || case_.id}`) ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Open Decision Story"
                        onClick={() => handleOpenDecisionStory(case_.investigation_id || case_.id)}
                        disabled={processingActions.has(`story-${case_.investigation_id || case_.id}`)}
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Cancel & Refund"
                        onClick={() => handleCancel(case_.investigation_id || case_.id)}
                        disabled={processingActions.has(`cancel-${case_.investigation_id || case_.id}`)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Download Audit Pack"
                        onClick={() => handleDownloadAuditPack(case_.investigation_id || case_.id)}
                        disabled={processingActions.has(`download-${case_.investigation_id || case_.id}`)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Decision Story Modal */}
      <Dialog open={showDecisionStory} onOpenChange={setShowDecisionStory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Decision Story - {decisionStory?.investigation_id}</DialogTitle>
          </DialogHeader>
          {decisionStory && (
            <div className="space-y-6">
              {/* Investigation Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Transaction Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Transaction ID:</span> {decisionStory.transaction_id}</p>
                    <p><span className="font-medium">Trace ID:</span> {decisionStory.trace_id}</p>
                    <p><span className="font-medium">Investigation ID:</span> {decisionStory.investigation_id}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Root Cause Analysis</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Primary Cause:</span> {decisionStory.root_cause_analysis?.primary_cause}</p>
                    <p><span className="font-medium">Failure Category:</span> {decisionStory.root_cause_analysis?.failure_category}</p>
                    <p><span className="font-medium">Root Cause:</span> {decisionStory.root_cause_analysis?.root_cause}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Decision Timeline */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Decision Timeline</h4>
                <div className="space-y-3">
                  {decisionStory.decision_timeline?.map((event: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.action}</p>
                        <p className="text-sm text-muted-foreground">{event.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recommended Actions */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Recommended Actions</h4>
                <div className="space-y-2">
                  {decisionStory.root_cause_analysis?.recommended_actions?.map((action: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Audit Trail */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Audit Trail</h4>
                <div className="space-y-2">
                  {decisionStory.audit_trail?.map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/20 rounded text-sm">
                      <span>{entry.action}</span>
                      <div className="text-right">
                        <p className="font-medium">{entry.user}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

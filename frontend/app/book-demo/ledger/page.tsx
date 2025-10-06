"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Copy, Eye, Paperclip, RefreshCcw, ShieldAlert, FileSpreadsheet, FileText, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/demo/page-header"
import { KpiCard } from "@/components/demo/kpi-card"
import { AdvisoryBanner } from "@/components/demo/advisory-banner"
import { cn } from "@/lib/utils"
import { fetchLedgerReconData, type LedgerReconData, fetchVendorPayments, downloadJournalCSV, rerunMatching, matchEntry, attachDocument, rematchEntry, raiseDispute } from "@/lib/agents-api"
import { generateRBIAuditReport, type ReportOptions } from "@/lib/report-generator"

type JournalStage = "REQUEST" | "CLEARING" | "SETTLEMENT" | "CANCELLATION"

const journals = [
  {
    id: "JRN-10001",
    trace: "TRC-2024-001210",
    stage: "REQUEST",
    rail: "IMPS",
    account: "Ops-01",
    merchant: "Acme Ltd",
    amount: "₹12,000",
    status: "posted",
    createdAt: "2025-10-02 10:21:10",
  },
  {
    id: "JRN-10002",
    trace: "TRC-2024-001211",
    stage: "CLEARING",
    rail: "NEFT",
    account: "Ops-01",
    merchant: "Volt Inc",
    amount: "₹55,000",
    status: "posted",
    createdAt: "2025-10-02 10:19:07",
  },
  {
    id: "JRN-10003",
    trace: "TRC-2024-001212",
    stage: "SETTLEMENT",
    rail: "RTGS",
    account: "Ops-02",
    merchant: "Globex",
    amount: "₹2,50,000",
    status: "posted",
    createdAt: "2025-10-02 10:11:43",
  },
  {
    id: "JRN-10004",
    trace: "TRC-2024-001213",
    stage: "CANCELLATION",
    rail: "IMPS",
    account: "Ops-02",
    merchant: "Acme Ltd",
    amount: "₹12,000",
    status: "posted",
    createdAt: "2025-10-02 10:09:55",
  },
] as Array<{
  id: string
  trace: string
  stage: JournalStage
  rail: string
  account: string
  merchant: string
  amount: string
  status: "posted" | "pending"
  createdAt: string
}>

const exceptions = [
  {
    id: "EXC-9001",
    trace: "TRC-2024-001228",
    rail: "NEFT",
    reason: "Mismatch amount",
    missing: false,
    createdAt: "2025-10-02 09:50:12",
  },
  {
    id: "EXC-9002",
    trace: "TRC-2024-001231",
    rail: "NEFT",
    reason: "Missing UTR",
    missing: true,
    createdAt: "2025-10-02 09:41:02",
  },
  {
    id: "EXC-9003",
    trace: "TRC-2024-001240",
    rail: "IMPS",
    reason: "Unmatched journal",
    missing: false,
    createdAt: "2025-10-02 09:36:44",
  },
]

export default function LedgerReconPage() {
  const [q, setQ] = useState("")
  const [rail, setRail] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [account, setAccount] = useState<string>("all")
  const [ledgerData, setLedgerData] = useState<LedgerReconData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())

  // Fetch ledger & recon data from ARL agent
  useEffect(() => {
    const loadLedgerData = async () => {
      try {
        setLoading(true)
        const data = await fetchLedgerReconData()
        setLedgerData(data)
      } catch (error) {
        console.error('Error loading ledger data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLedgerData()
    
    // Refresh data every 60 seconds
    const interval = setInterval(loadLedgerData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerateRBIReport = async (format: 'excel' | 'csv' | 'pdf') => {
    setGeneratingReport(format)
    try {
      // Fetch vendor payment data for the report
      const vendorData = await fetchVendorPayments()
      if (vendorData?.invoices) {
        const reportOptions: ReportOptions = {
          format,
          entityName: 'Arealis Gateway',
          reportingPeriod: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
          includeFailedTransactions: true,
          includeReversedTransactions: true
        }
        
        await generateRBIAuditReport(vendorData.invoices, reportOptions)
      }
    } catch (error) {
      console.error('Error generating RBI report:', error)
    } finally {
      setGeneratingReport(null)
    }
  }

  // Action handler functions
  const handleDownloadJournalCSV = async (journalId: string) => {
    setProcessingActions(prev => new Set(prev).add(`download-${journalId}`));
    try {
      const result = await downloadJournalCSV(journalId);
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
        console.log(`📥 Journal CSV downloaded for ${journalId}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error downloading journal CSV:', error);
      alert(`Failed to download journal CSV. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`download-${journalId}`);
        return newSet;
      });
    }
  };

  const handleRerunMatching = async () => {
    setProcessingActions(prev => new Set(prev).add('rerun-matching'));
    try {
      const result = await rerunMatching();
      if (result.success) {
        // Refresh data to get updated matching results
        const updatedData = await fetchLedgerReconData();
        setLedgerData(updatedData);
        console.log(`✅ ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error re-running matching:', error);
      alert(`Failed to re-run matching. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete('rerun-matching');
        return newSet;
      });
    }
  };

  const handleMatchEntry = async (entryId: string) => {
    setProcessingActions(prev => new Set(prev).add(`match-${entryId}`));
    try {
      const result = await matchEntry(entryId);
      if (result.success) {
        // Refresh data to get updated matching results
        const updatedData = await fetchLedgerReconData();
        setLedgerData(updatedData);
        console.log(`✅ ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error matching entry:', error);
      alert(`Failed to match entry. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`match-${entryId}`);
        return newSet;
      });
    }
  };

  const handleAttachDocument = async (entryId: string) => {
    setProcessingActions(prev => new Set(prev).add(`attach-${entryId}`));
    try {
      const result = await attachDocument(entryId);
      if (result.success) {
        console.log(`📎 ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error attaching document:', error);
      alert(`Failed to attach document. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`attach-${entryId}`);
        return newSet;
      });
    }
  };

  const handleRematchEntry = async (entryId: string) => {
    setProcessingActions(prev => new Set(prev).add(`rematch-${entryId}`));
    try {
      const result = await rematchEntry(entryId);
      if (result.success) {
        // Refresh data to get updated matching results
        const updatedData = await fetchLedgerReconData();
        setLedgerData(updatedData);
        console.log(`🔄 ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error re-matching entry:', error);
      alert(`Failed to re-match entry. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`rematch-${entryId}`);
        return newSet;
      });
    }
  };

  const handleRaiseDispute = async (entryId: string) => {
    setProcessingActions(prev => new Set(prev).add(`dispute-${entryId}`));
    try {
      const result = await raiseDispute(entryId);
      if (result.success) {
        console.log(`⚠️ ${result.message}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error raising dispute:', error);
      alert(`Failed to raise dispute. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`dispute-${entryId}`);
        return newSet;
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all ledger data? This action cannot be undone.")) {
      return
    }

    setProcessingActions(prev => new Set(prev).add('clear-data'))
    
    try {
      // Reset all data to initial state
      setLedgerData(null)
      setVendorData(null)
      setQ("")
      setRail("all")
      setStatus("all")
      
      // Reload fresh data
      const [ledgerResult, vendorResult] = await Promise.all([
        fetchLedgerReconData(),
        fetchVendorPayments()
      ])
      setLedgerData(ledgerResult)
      setVendorData(vendorResult)
      
      console.log("✅ Ledger data cleared successfully")
    } catch (error) {
      console.error("❌ Error clearing ledger data:", error)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('clear-data')
        return newSet
      })
    }
  };

  const filteredJournals = useMemo(() => {
    const journalsToFilter = ledgerData?.journal_entries?.map(journal => ({
      id: journal.entry_id,
      trace: journal.entry_id, // Using entry_id as trace since transaction_id might not be available
      stage: journal.status.toUpperCase() as JournalStage,
      rail: "IMPS", // Default rail, could be extracted from journal data
      account: "Ops-01", // Default account, could be extracted from journal data
      merchant: journal.description || "Merchant", // Use description as merchant name
      amount: `₹${journal.debit.toLocaleString()}`,
      status: journal.status === 'matched' ? 'posted' as const : 'pending' as const,
      createdAt: journal.date,
    })) || journals

    return journalsToFilter.filter((j) => {
      const matchQ = q ? [j.id, j.trace, j.merchant].some((v) => v.toLowerCase().includes(q.toLowerCase())) : true
      const matchRail = rail === "all" ? true : j.rail === rail
      const matchStatus = status === "all" ? true : j.status === status
      const matchAccount = account === "all" ? true : j.account === account
      return matchQ && matchRail && matchStatus && matchAccount
    })
  }, [q, rail, status, account, ledgerData])

  return (
    <div className="space-y-6">
      {/* Replace basic title with PageHeader + export action */}
      <PageHeader
        eyebrow="Finance"
        title="Ledger & Recon"
        description="Finance-grade truth with journals and reconciliation"
        actions={
          <div className="flex gap-2">
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
              className="gap-2 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              onClick={() => handleGenerateRBIReport('excel')}
              disabled={generatingReport === 'excel'}
            >
              {generatingReport === 'excel' ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
              ) : (
                <FileSpreadsheet className="h-3 w-3" />
              )}
              {generatingReport === 'excel' ? 'Generating...' : 'Excel'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              onClick={() => handleGenerateRBIReport('csv')}
              disabled={generatingReport === 'csv'}
            >
              {generatingReport === 'csv' ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              {generatingReport === 'csv' ? 'Generating...' : 'CSV'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              onClick={() => handleGenerateRBIReport('pdf')}
              disabled={generatingReport === 'pdf'}
            >
              {generatingReport === 'pdf' ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              {generatingReport === 'pdf' ? 'Generating...' : 'PDF'}
            </Button>
          </div>
        }
      />
      {/* Add advisories banner under header */}
      <AdvisoryBanner className="mt-2" />
      {/* Refined KPI band */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard 
          label="Posted Today" 
          value={loading ? "..." : (ledgerData?.reconciliation_metrics?.total_transactions?.toLocaleString() || "1,204")} 
          delta="+3.2% vs 24h" 
          trend="up" 
        />
        <KpiCard 
          label="Exceptions" 
          value={loading ? "..." : (ledgerData?.reconciliation_metrics?.exception_count?.toString() || "8")} 
          delta="Watchlist active" 
          trend="down" 
        />
        <KpiCard 
          label="Match Rate" 
          value={loading ? "..." : `${ledgerData?.reconciliation_metrics?.match_rate_percent?.toFixed(1) || '92.4'}%`} 
          delta="+0.4% today" 
          trend="up" 
        />
      </div>

      {/* Filters */}
      <Card className="glass-card glass-primary">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="col-span-2">
            <Input placeholder="Search Trace / Journal / Merchant" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <Input type="date" className="w-full" aria-label="From date" />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <Input type="date" className="w-full" aria-label="To date" />
          </div>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <Select value={rail} onValueChange={setRail}>
              <SelectTrigger>
                <SelectValue placeholder="Rail" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rails</SelectItem>
                <SelectItem value="IMPS">IMPS</SelectItem>
                <SelectItem value="NEFT">NEFT</SelectItem>
                <SelectItem value="RTGS">RTGS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="Ops-01">Ops-01</SelectItem>
                <SelectItem value="Ops-02">Ops-02</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="journals">
        {/* Glassy tabs bar */}
        <TabsList className="bg-background/60 supports-[backdrop-filter]:bg-background/40 backdrop-blur border rounded-lg bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-cyan-500/20">
          <TabsTrigger value="journals" className="tab-pill">
            Journals
          </TabsTrigger>
          <TabsTrigger value="recon" className="tab-pill">
            Reconciliation
          </TabsTrigger>
          <TabsTrigger value="resolved" className="tab-pill">
            Resolved
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="tab-pill">
            Exceptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journals">
          {/* Journals table card uses glass tone */}
          <Card className="glass-card glass-primary">
            <CardHeader>
              <CardTitle>Journals (REQUEST / CLEARING / SETTLEMENT / CANCELLATION)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                  <TableRow>
                    <TableHead>Journal ID</TableHead>
                    <TableHead>Trace</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Rail</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJournals.map((j) => (
                    // Soft row hover
                    <TableRow key={j.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs">{j.id}</TableCell>
                      <TableCell className="font-mono text-xs">{j.trace}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {j.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {j.rail}
                        </Badge>
                      </TableCell>
                      <TableCell>{j.account}</TableCell>
                      <TableCell>{j.merchant}</TableCell>
                      <TableCell className="font-medium">{j.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            j.status === "posted"
                              ? "bg-success/15 text-success-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {j.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{j.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Download journal CSV"
                            onClick={() => handleDownloadJournalCSV(j.id)}
                            disabled={processingActions.has(`download-${j.id}`)}
                          >
                            <Download className={`h-3 w-3 ${processingActions.has(`download-${j.id}`) ? 'animate-pulse' : ''}`} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Copy journal ID"
                            onClick={() => {
                              navigator.clipboard.writeText(j.id);
                              console.log(`📋 Journal ID ${j.id} copied to clipboard`);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Open associated trace"
                            onClick={() => console.log(`🔍 Opening trace for journal ${j.id}`)}
                          >
                            <Eye className="h-3 w-3" />
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

        <TabsContent value="recon">
          {/* Recon card uses glass tone */}
          <Card className="glass-card glass-primary">
            <CardHeader>
              <CardTitle>Reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Stat title="Total to match" value="32" tone="default" />
                <Stat title="Matched" value="24" tone="success" />
                <Stat title="Exceptions" value="8" tone="warning" />
              </div>
              <div className="rounded-md border">
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <span className="text-sm text-slate-400">Unmatched items sample</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRerunMatching}
                    disabled={processingActions.has('rerun-matching')}
                  >
                    <RefreshCcw className={`mr-2 h-3 w-3 ${processingActions.has('rerun-matching') ? 'animate-spin' : ''}`} />
                    {processingActions.has('rerun-matching') ? 'Re-running...' : 'Re-run matching'}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trace</TableHead>
                      <TableHead>Rail</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Diff</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { trace: "TRC-2024-001228", rail: "NEFT", exp: "₹45,000", rep: "—", diff: "Missing UTR" },
                      { trace: "TRC-2024-001231", rail: "NEFT", exp: "₹15,000", rep: "₹14,900", diff: "₹100" },
                    ].map((r) => (
                      // Soft row hover
                      <TableRow key={r.trace} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-mono text-xs">{r.trace}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                            {r.rail}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.exp}</TableCell>
                        <TableCell>{r.rep}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-warning/15 text-warning-foreground">
                            {r.diff}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMatchEntry(r.trace)}
                            disabled={processingActions.has(`match-${r.trace}`)}
                          >
                            {processingActions.has(`match-${r.trace}`) ? 'Matching...' : 'Match'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          {/* Resolved card uses glass tone */}
          <Card className="glass-card glass-primary">
            <CardHeader>
              <CardTitle>Resolved (matched)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                  <TableRow>
                    <TableHead>Trace</TableHead>
                    <TableHead>Rail</TableHead>
                    <TableHead>UTR</TableHead>
                    <TableHead>Matched At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      trace: "TRC-2024-001200",
                      rail: "IMPS",
                      utr: "UTR2024001200001",
                      matchedAt: "2025-10-02 09:22:11",
                    },
                    {
                      trace: "TRC-2024-001201",
                      rail: "RTGS",
                      utr: "UTR2024001200002",
                      matchedAt: "2025-10-02 09:24:19",
                    },
                  ].map((r) => (
                    // Soft row hover
                    <TableRow key={r.trace} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs">{r.trace}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {r.rail}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.utr}</TableCell>
                      <TableCell className="text-xs">{r.matchedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions">
          {/* Exceptions card uses glass tone + tokenized status colors */}
          <Card className="glass-card glass-primary">
            <CardHeader>
              <CardTitle>Exceptions (unmatched, mismatch, missing UTR)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                  <TableRow>
                    <TableHead>Exception ID</TableHead>
                    <TableHead>Trace</TableHead>
                    <TableHead>Rail</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ledgerData?.exception_logs || exceptions).map((e) => (
                    // Soft row hover
                    <TableRow key={e.exception_id || e.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs">{e.exception_id || e.id}</TableCell>
                      <TableCell className="font-mono text-xs">{e.transaction_id || e.trace}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {e.rail || "NEFT"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            (e.missing || e.severity === 'high')
                              ? "bg-destructive/15 text-destructive-foreground"
                              : (e.severity === 'medium')
                              ? "bg-warning/15 text-warning-foreground"
                              : "bg-muted/15 text-muted-foreground"
                          }
                        >
                          {e.description || e.reason || e.type || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{e.created_at || e.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Attach document"
                            onClick={() => handleAttachDocument(e.trace)}
                            disabled={processingActions.has(`attach-${e.trace}`)}
                          >
                            <Paperclip className={`h-3 w-3 ${processingActions.has(`attach-${e.trace}`) ? 'animate-pulse' : ''}`} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Re-match"
                            onClick={() => handleRematchEntry(e.trace)}
                            disabled={processingActions.has(`rematch-${e.trace}`)}
                          >
                            <RefreshCcw className={`h-3 w-3 ${processingActions.has(`rematch-${e.trace}`) ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Raise dispute"
                            onClick={() => handleRaiseDispute(e.trace)}
                            disabled={processingActions.has(`dispute-${e.trace}`)}
                          >
                            <ShieldAlert className={`h-3 w-3 ${processingActions.has(`dispute-${e.trace}`) ? 'animate-pulse' : ''}`} />
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
      </Tabs>
    </div>
  )
}

function Stat({ title, value, tone }: { title: string; value: string; tone: "default" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "glass-success" : tone === "warning" ? "glass-warning" : "glass-primary"

  return (
    <div className={cn("glass-card p-4", toneClass)}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

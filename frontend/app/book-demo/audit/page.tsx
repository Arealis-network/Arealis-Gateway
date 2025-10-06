"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { FileDown, FileText, BookOpen, Share2, Loader2, Download, FileSpreadsheet, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { fetchAuditFilingData, generateAuditPack, type AuditFilingData, fetchVendorPayments, downloadBankFormat, downloadRegulatorFormat } from "@/lib/agents-api"
import { generateRBIAuditReport, type ReportOptions } from "@/lib/report-generator"

const filings = [
  { trace: "TRC-2024-001231", status: "Ready", bankFmt: "CSV", regulatorFmt: "PDF", utr: "UTR2024001230456" },
  { trace: "TRC-2024-001228", status: "Pending", bankFmt: "XML", regulatorFmt: "PDF", utr: "—" },
  { trace: "TRC-2024-001255", status: "Failed", bankFmt: "CSV", regulatorFmt: "PDF", utr: "—" },
  { trace: "TRC-2024-001240", status: "Ready", bankFmt: "CSV", regulatorFmt: "PDF", utr: "UTR2024001230457" },
]

export default function AuditFilingsPage() {
  const [open, setOpen] = useState(false)
  const [activeTrace, setActiveTrace] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"All" | "Ready" | "Pending" | "Failed">("All")
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [auditData, setAuditData] = useState<AuditFilingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPack, setGeneratingPack] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())

  // Fetch audit & filing data from CRRAK agent
  useEffect(() => {
    const loadAuditData = async () => {
      try {
        setLoading(true)
        const data = await fetchAuditFilingData()
        setAuditData(data)
      } catch (error) {
        console.error('Error loading audit data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAuditData()
    
    // Refresh data every 60 seconds
    const interval = setInterval(loadAuditData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerateAuditPack = async (batchId: string) => {
    setGeneratingPack(batchId)
    try {
      const result = await generateAuditPack(batchId)
      if (result.success) {
        // Refresh data to show new pack
        const data = await fetchAuditFilingData()
        setAuditData(data)
      }
    } catch (error) {
      console.error('Error generating audit pack:', error)
    } finally {
      setGeneratingPack(null)
    }
  }

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
  const handleDownloadBankFormat = async (traceId: string, formatType: string) => {
    setProcessingActions(prev => new Set(prev).add(`bank-${traceId}`));
    try {
      const result = await downloadBankFormat(traceId, formatType);
      if (result.success) {
        // Create and download the file
        const blob = new Blob([result.data.content], { type: result.data.content_type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`📥 Bank format ${formatType} downloaded for ${traceId}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error downloading bank format:', error);
      alert(`Failed to download bank format. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`bank-${traceId}`);
        return newSet;
      });
    }
  };

  const handleDownloadRegulatorFormat = async (traceId: string, formatType: string) => {
    setProcessingActions(prev => new Set(prev).add(`regulator-${traceId}`));
    try {
      const result = await downloadRegulatorFormat(traceId, formatType);
      if (result.success) {
        // Create and download the file
        const blob = new Blob([result.data.content], { type: result.data.content_type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`📥 Regulator format ${formatType} downloaded for ${traceId}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error downloading regulator format:', error);
      alert(`Failed to download regulator format. Please try again.`);
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`regulator-${traceId}`);
        return newSet;
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all audit data? This action cannot be undone.")) {
      return
    }

    setProcessingActions(prev => new Set(prev).add('clear-data'))
    
    try {
      // Reset all data to initial state
      setAuditData(null)
      setVendorData(null)
      setSearchQuery("")
      setFilterStatus("all")
      setFilterType("all")
      
      // Reload fresh data
      const [auditResult, vendorResult] = await Promise.all([
        fetchAuditFilingData(),
        fetchVendorPayments()
      ])
      setAuditData(auditResult)
      setVendorData(vendorResult)
      
      console.log("✅ Audit data cleared successfully")
    } catch (error) {
      console.error("❌ Error clearing audit data:", error)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('clear-data')
        return newSet
      })
    }
  };

  const filtered = (auditData?.audit_packs?.map(pack => ({
    trace: pack.batch_id,
    status: pack.status === 'generated' ? 'Ready' : pack.status === 'reviewed' ? 'Ready' : pack.status === 'filed' ? 'Ready' : 'Pending',
    bankFmt: "CSV",
    regulatorFmt: "PDF",
    utr: "—",
    pack_id: pack.pack_id,
    download_url: pack.download_url,
  })) || filings).filter((f) => {
    const matchesQ = q.trim().length === 0 || f.trace.toLowerCase().includes(q.toLowerCase())
    const matchesStatus = status === "All" || f.status === status
    return matchesQ && matchesStatus
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openStory = (trace: string) => {
    setActiveTrace(trace)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Audit & Filings (CRRAK)</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Explain & export: decision stories, bank files, and regulator packs
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            className="gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            onClick={handleClearData}
            disabled={processingActions.has('clear-data')}
          >
            <Trash2 className="h-4 w-4" />
            {processingActions.has('clear-data') ? 'Clearing...' : 'Clear Data'}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
            onClick={() => handleGenerateRBIReport('excel')}
            disabled={generatingReport === 'excel'}
          >
            {generatingReport === 'excel' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {generatingReport === 'excel' ? 'Generating...' : 'RBI Excel Report'}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            onClick={() => handleGenerateRBIReport('csv')}
            disabled={generatingReport === 'csv'}
          >
            {generatingReport === 'csv' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {generatingReport === 'csv' ? 'Generating...' : 'RBI CSV Report'}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            onClick={() => handleGenerateRBIReport('pdf')}
            disabled={generatingReport === 'pdf'}
          >
            {generatingReport === 'pdf' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {generatingReport === 'pdf' ? 'Generating...' : 'RBI PDF Report'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent supports-[backdrop-filter]:backdrop-blur-xl shadow-sm ring-1 ring-border/60">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/20" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardContent className="relative p-4">
            <div className="text-sm font-medium text-gray-300">Packs Ready</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {loading ? "..." : (auditData?.compliance_metrics?.total_audit_packs?.toString() || "2")}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent supports-[backdrop-filter]:backdrop-blur-xl shadow-sm ring-1 ring-border/60">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/20" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardContent className="relative p-4">
            <div className="text-sm font-medium text-gray-300">Pending</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {loading ? "..." : (auditData?.compliance_metrics?.pending_filings?.toString() || "1")}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent supports-[backdrop-filter]:backdrop-blur-xl shadow-sm ring-1 ring-border/60">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/20" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardContent className="relative p-4">
            <div className="text-sm font-medium text-gray-300">Compliance</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {loading ? "..." : `${auditData?.compliance_metrics?.compliance_score || 100}`}
              <span className="text-base font-medium text-gray-400">%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent supports-[backdrop-filter]:backdrop-blur-xl shadow-sm ring-1 ring-border/60">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium text-gray-300">Filters</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="search" className="sr-only">
                Search by Trace ID
              </label>
              <Input
                id="search"
                placeholder="Search by Trace ID…"
                value={q}
                onChange={(e) => {
                  setPage(1)
                  setQ(e.target.value)
                }}
                className="rounded-md"
              />
            </div>
            <div>
              <Select
                value={status}
                onValueChange={(v) => {
                  setPage(1)
                  setStatus(v as typeof status)
                }}
              >
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent supports-[backdrop-filter]:backdrop-blur-xl shadow-sm ring-1 ring-border/60">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium text-gray-300">Filings</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead>Trace ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audit Pack</TableHead>
                <TableHead>Bank CSV/XML</TableHead>
                <TableHead>Regulator PDF</TableHead>
                <TableHead>Open Story</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((f, idx) => (
                <TableRow
                  key={f.trace}
                  className={`${idx % 2 === 0 ? "bg-white/5" : ""} hover:bg-primary/10 transition-colors`}
                >
                  <TableCell className="font-mono text-xs">{f.trace}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        f.status === "Ready"
                          ? "rounded-md border-success/40 bg-success/15 text-success-foreground"
                          : f.status === "Pending"
                            ? "rounded-md border-warning/40 bg-warning/15 text-warning-foreground"
                            : "rounded-md border-destructive/40 bg-destructive/15 text-destructive-foreground"
                      }
                    >
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="default"
                      className="rounded-md"
                      title="Download Audit Pack"
                      aria-label={`Download audit pack for ${f.trace}`}
                      onClick={() => f.download_url ? window.open(f.download_url, '_blank') : handleGenerateAuditPack(f.trace)}
                      disabled={generatingPack === f.trace}
                    >
                      {generatingPack === f.trace ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-3 w-3" /> 
                          {f.download_url ? 'Download' : 'Generate'}
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-md border-border text-foreground hover:bg-secondary/30 bg-transparent"
                      title={`Bank ${f.bankFmt}`}
                      aria-label={`Download bank ${f.bankFmt} for ${f.trace}`}
                      onClick={() => handleDownloadBankFormat(f.trace, f.bankFmt)}
                      disabled={processingActions.has(`bank-${f.trace}`)}
                    >
                      <FileText className={`mr-2 h-3 w-3 ${processingActions.has(`bank-${f.trace}`) ? 'animate-pulse' : ''}`} /> 
                      {processingActions.has(`bank-${f.trace}`) ? 'Downloading...' : f.bankFmt}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-md border-border text-foreground hover:bg-secondary/30 bg-transparent"
                      title={f.regulatorFmt}
                      aria-label={`Download regulator ${f.regulatorFmt} for ${f.trace}`}
                      onClick={() => handleDownloadRegulatorFormat(f.trace, f.regulatorFmt)}
                      disabled={processingActions.has(`regulator-${f.trace}`)}
                    >
                      <BookOpen className={`mr-2 h-3 w-3 ${processingActions.has(`regulator-${f.trace}`) ? 'animate-pulse' : ''}`} /> 
                      {processingActions.has(`regulator-${f.trace}`) ? 'Downloading...' : f.regulatorFmt}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-md text-muted-foreground hover:text-foreground"
                      onClick={() => openStory(f.trace)}
                      aria-label={`Open story for ${f.trace}`}
                    >
                      Open Story
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-md bg-transparent"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Prev
              </Button>
              <div className="text-xs">
                Page {page} of {pageCount}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-md bg-transparent"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Decision Story</DrawerTitle>
            <DrawerDescription>
              Trace {activeTrace ?? ""} • ACC policy decisions, routing, and final recon
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 p-6 md:grid-cols-3">
            <section className="space-y-3 md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-300">Timeline</h3>
              <ol className="space-y-2 text-sm">
                <li>
                  <span className="font-mono text-xs">10:20:00</span> — Created
                </li>
                <li>
                  <span className="font-mono text-xs">10:20:10</span> — ACC decision: Approved (Policy v1.6)
                </li>
                <li>
                  <span className="font-mono text-xs">10:21:20</span> — Routing score-table computed
                </li>
                <li>
                  <span className="font-mono text-xs">10:22:05</span> — Pre-commit re-score
                </li>
                <li>
                  <span className="font-mono text-xs">10:22:15</span> — Dispatch
                </li>
                <li>
                  <span className="font-mono text-xs">10:23:15</span> — UTR received
                </li>
                <li>
                  <span className="font-mono text-xs">10:24:00</span> — Ledger posted & recon final
                </li>
              </ol>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase text-muted-foreground">ACC Decisions</div>
                  <div className="text-sm">Approved • Policy v1.6</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase text-muted-foreground">UTR</div>
                  <div className="font-mono text-xs">UTR2024001230456</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase text-muted-foreground">Routing Score-table</div>
                  <div className="text-xs">IMPS: 0.82 • NEFT: 0.71 • RTGS: 0.76</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase text-muted-foreground">Re-score Diff</div>
                  <div className="text-xs">IMPS +0.03 post risk-update</div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase text-muted-foreground">Ledger entries</div>
                <ul className="text-xs">
                  <li>REQUEST → posted</li>
                  <li>CLEARING → posted</li>
                  <li>SETTLEMENT → posted</li>
                </ul>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase text-muted-foreground">Recon final</div>
                <div className="text-sm text-success">Matched</div>
              </div>
            </section>

            <aside className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="mb-2 text-xs uppercase text-muted-foreground">Share</div>
                <Button size="sm" variant="outline">
                  <Share2 className="mr-2 h-3 w-3" /> Copy link
                </Button>
                <p className="mt-2 text-xs text-slate-500">Links are time-limited. Watermark “Sandbox” if not prod.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase text-muted-foreground">Compliance</div>
                <ul className="text-xs list-disc pl-4">
                  <li>PII masking: ON</li>
                  <li>Idempotency enforced</li>
                  <li>Destructive actions audited</li>
                </ul>
              </div>
            </aside>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

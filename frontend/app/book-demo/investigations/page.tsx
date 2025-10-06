"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, RefreshCw, FileText, XCircle, Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/demo/page-header"
import { fetchInvestigationData, type InvestigationData } from "@/lib/agents-api"
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
                      <Button size="sm" variant="outline" title="Retry">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" title="Open Decision Story">
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" title="Cancel & Refund">
                        <XCircle className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" title="Download Audit Pack">
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
    </div>
  )
}

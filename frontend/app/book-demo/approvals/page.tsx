"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Clock, CheckCircle, XCircle, Search, Filter, TrendingUp, AlertTriangle, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchVendorPayments, approvePayment, rejectPayment, bulkApprovePayments, bulkRejectPayments } from "@/lib/agents-api"

export default function ApprovalsPage() {
  const [filterUrgency, setFilterUrgency] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [vendorData, setVendorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set())
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const data = await fetchVendorPayments()
        setVendorData(data)
      } catch (error) {
        console.error('Error loading vendor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [])

  // Convert vendor data to approvals format and deduplicate by invoice_id
  const approvals = vendorData?.invoices?.reduce((acc: any[], invoice: any, index: number) => {
    // Check if we already have this invoice_id
    const existingIndex = acc.findIndex(item => item.id === invoice.invoice_id)
    if (existingIndex === -1) {
      // Add new approval with unique key
      acc.push({
        id: invoice.invoice_id,
        uniqueKey: `${invoice.invoice_id}-${index}`, // Create unique key for React
        amount: invoice.amount,
        beneficiary: `${invoice.vendor} (****${invoice.invoice_id.slice(-4)})`,
        urgency: invoice.amount > 50000 ? "High" : "Standard",
        deadline: invoice.status === "Pending" ? "2h 30m" : "Completed",
        requestedBy: invoice.vendor,
        status: invoice.status || "Pending",
      })
    }
    return acc
  }, []) || []

  const filteredApprovals = approvals.filter((approval) => {
    const matchesUrgency = filterUrgency === "all" || approval.urgency.toLowerCase() === filterUrgency
    const matchesSearch =
      approval.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.beneficiary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesUrgency && matchesSearch
  })

  // Handler functions for buttons
  const handleSelectApproval = (approvalId: string) => {
    const newSelected = new Set(selectedApprovals)
    if (newSelected.has(approvalId)) {
      newSelected.delete(approvalId)
    } else {
      newSelected.add(approvalId)
    }
    setSelectedApprovals(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedApprovals.size === filteredApprovals.length) {
      setSelectedApprovals(new Set())
    } else {
      setSelectedApprovals(new Set(filteredApprovals.map(a => a.id)))
    }
  }

  const handleApprove = async (approvalId: string) => {
    setProcessingActions(prev => new Set(prev).add(`approve-${approvalId}`))
    try {
      // Call the real API endpoint
      const result = await approvePayment(approvalId)
      
      if (result.success) {
        // Refresh data to get updated status from backend
        const updatedData = await fetchVendorPayments()
        setVendorData(updatedData)
        
        // Remove from selected if it was selected
        setSelectedApprovals(prev => {
          const newSet = new Set(prev)
          newSet.delete(approvalId)
          return newSet
        })
        
        console.log(`✅ ${result.message}`)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('❌ Error approving payment:', error)
      alert(`Failed to approve payment ${approvalId}. Please try again.`)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(`approve-${approvalId}`)
        return newSet
      })
    }
  }

  const handleReject = async (approvalId: string) => {
    setProcessingActions(prev => new Set(prev).add(`reject-${approvalId}`))
    try {
      // Call the real API endpoint
      const result = await rejectPayment(approvalId)
      
      if (result.success) {
        // Refresh data to get updated status from backend
        const updatedData = await fetchVendorPayments()
        setVendorData(updatedData)
        
        // Remove from selected if it was selected
        setSelectedApprovals(prev => {
          const newSet = new Set(prev)
          newSet.delete(approvalId)
          return newSet
        })
        
        console.log(`❌ ${result.message}`)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('❌ Error rejecting payment:', error)
      alert(`Failed to reject payment ${approvalId}. Please try again.`)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(`reject-${approvalId}`)
        return newSet
      })
    }
  }

  const handleBulkApprove = async () => {
    if (selectedApprovals.size === 0) return
    
    setProcessingActions(prev => new Set(prev).add('bulk-approve'))
    try {
      // Call the real bulk approve API endpoint
      const paymentIds = Array.from(selectedApprovals)
      const result = await bulkApprovePayments(paymentIds)
      
      if (result.success) {
        // Refresh data to get updated status from backend
        const updatedData = await fetchVendorPayments()
        setVendorData(updatedData)
        
        console.log(`✅ ${result.message}`)
        setSelectedApprovals(new Set())
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('❌ Error bulk approving:', error)
      alert(`Failed to bulk approve payments. Please try again.`)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('bulk-approve')
        return newSet
      })
    }
  }

  const handleBulkReject = async () => {
    if (selectedApprovals.size === 0) return
    
    setProcessingActions(prev => new Set(prev).add('bulk-reject'))
    try {
      // Call the real bulk reject API endpoint
      const paymentIds = Array.from(selectedApprovals)
      const result = await bulkRejectPayments(paymentIds)
      
      if (result.success) {
        // Refresh data to get updated status from backend
        const updatedData = await fetchVendorPayments()
        setVendorData(updatedData)
        
        console.log(`❌ ${result.message}`)
        setSelectedApprovals(new Set())
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('❌ Error bulk rejecting:', error)
      alert(`Failed to bulk reject payments. Please try again.`)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('bulk-reject')
        return newSet
      })
    }
  }

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all approval data? This action cannot be undone.")) {
      return
    }

    setProcessingActions(prev => new Set(prev).add('clear-data'))
    
    try {
      // Reset all data to initial state
      setVendorData(null)
      setSelectedApprovals(new Set())
      setSearchQuery("")
      setFilterUrgency("all")
      
      // Reload fresh data
      const data = await fetchVendorPayments()
      setVendorData(data)
      
      console.log("✅ Approval data cleared successfully")
    } catch (error) {
      console.error("❌ Error clearing approval data:", error)
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete('clear-data')
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Approvals</h1>
            <p className="text-gray-400">Loading approvals data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Approvals</h1>
          <p className="text-gray-400">Human-in-loop management with durable timers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            onClick={handleBulkReject}
            disabled={selectedApprovals.size === 0 || processingActions.has('bulk-reject')}
          >
            <XCircle className="h-4 w-4" />
            {processingActions.has('bulk-reject') ? 'Rejecting...' : `Reject Selected (${selectedApprovals.size})`}
          </Button>
          <Button 
            className="gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            onClick={handleBulkApprove}
            disabled={selectedApprovals.size === 0 || processingActions.has('bulk-approve')}
          >
            <CheckCircle className="h-4 w-4" />
            {processingActions.has('bulk-approve') ? 'Approving...' : `Approve Selected (${selectedApprovals.size})`}
          </Button>
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
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Pending</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-white">7</div>
            <p className="mt-1 text-xs text-gray-400">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-red-600/20 via-red-500/10 to-transparent backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <div className="text-3xl font-bold text-red-400">3</div>
            </div>
            <p className="mt-1 text-xs text-gray-400">Within 30 minutes</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-green-600/20 via-green-500/10 to-transparent backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Approved Today</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-400">42</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              +12% vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-white">
              4.2<span className="text-xl text-gray-400">min</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by Trace ID or Beneficiary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterUrgency("all")}
            className={`border-white/10 ${filterUrgency === "all" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-400"}`}
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterUrgency("high")}
            className={`border-white/10 ${filterUrgency === "high" ? "bg-red-500/20 text-red-400" : "bg-white/5 text-gray-400"}`}
          >
            High Priority
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterUrgency("standard")}
            className={`border-white/10 ${filterUrgency === "standard" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-400"}`}
          >
            Standard
          </Button>
        </div>
      </div>

      <Card className="relative overflow-hidden border-white/10 bg-[#0d0d0d]/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Pending Approvals</CardTitle>
          <p className="text-sm text-gray-400">{filteredApprovals.length} items requiring attention</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox 
                    className="border-white/20" 
                    checked={selectedApprovals.size === filteredApprovals.length && filteredApprovals.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-gray-400">Trace ID</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Beneficiary</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Urgency</TableHead>
                <TableHead className="text-gray-400">Deadline</TableHead>
                <TableHead className="text-gray-400">Requested By</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.map((approval) => (
                <TableRow key={approval.uniqueKey} className="border-white/5 transition-colors hover:bg-white/5">
                  <TableCell>
                    <Checkbox 
                      className="border-white/20" 
                      checked={selectedApprovals.has(approval.id)}
                      onCheckedChange={() => handleSelectApproval(approval.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-blue-400">{approval.id}</TableCell>
                  <TableCell className="font-semibold text-white">{approval.amount}</TableCell>
                  <TableCell className="text-gray-300">{approval.beneficiary}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        approval.status === "Paid" || approval.status === "APPROVED"
                          ? "border-green-500/30 bg-green-500/20 text-green-400"
                          : approval.status === "Failed" || approval.status === "REJECTED"
                          ? "border-red-500/30 bg-red-500/20 text-red-400"
                          : "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {approval.status === "Paid" || approval.status === "APPROVED" ? "Approved" : 
                       approval.status === "Failed" || approval.status === "REJECTED" ? "Rejected" : 
                       approval.status === "Pending" || approval.status === "PENDING" ? "Pending" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        approval.urgency === "High"
                          ? "border-red-500/30 bg-red-500/20 text-red-400"
                          : "border-blue-500/30 bg-blue-500/20 text-blue-400"
                      }
                    >
                      {approval.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`h-4 w-4 ${
                          approval.status === "expiring" ? "animate-pulse text-red-400" : "text-yellow-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${approval.status === "expiring" ? "text-red-400" : "text-gray-300"}`}
                      >
                        {approval.deadline}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{approval.requestedBy}</TableCell>
                  <TableCell>
                    {approval.status === "Pending" || approval.status === "PENDING" ? (
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
                          onClick={() => handleApprove(approval.id)}
                          disabled={processingActions.has(`approve-${approval.id}`)}
                        >
                          {processingActions.has(`approve-${approval.id}`) ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          onClick={() => handleReject(approval.id)}
                          disabled={processingActions.has(`reject-${approval.id}`)}
                        >
                          {processingActions.has(`reject-${approval.id}`) ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {approval.status === "Paid" || approval.status === "APPROVED" ? "✅ Approved" : 
                         approval.status === "Failed" || approval.status === "REJECTED" ? "❌ Rejected" : "⏳ Pending"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Mail, Search, Eye, Loader2 } from "lucide-react"

interface EmailHistory {
  _id: string
  sender: {
    name: string
    email: string
  }
  business: string
  subject: string
  content: string
  sentAt: string
  recipientCount: number
}

export default function EmailHistoryPage() {
  const [emails, setEmails] = useState<EmailHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<EmailHistory | null>(null)
  const [filters, setFilters] = useState({
    business: "",
    dateFrom: "",
    dateTo: "",
    sender: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchEmailHistory()
  }, [])

  useEffect(() => {
    fetchEmailHistory()
  }, [filters])

  const fetchEmailHistory = async () => {
    try {
      const token = localStorage.getItem("token")
      const queryParams = new URLSearchParams()

      if (filters.business) queryParams.append("business", filters.business)
      if (filters.dateFrom) queryParams.append("dateFrom", filters.dateFrom)
      if (filters.dateTo) queryParams.append("dateTo", filters.dateTo)
      if (filters.sender) queryParams.append("sender", filters.sender)

      const response = await fetch(`/api/email/history?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEmails(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch email history",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getBusinessBadge = (business: string) => {
    const colors = {
      buss1: "bg-blue-100 text-blue-800",
      buss2: "bg-green-100 text-green-800",
      buss3: "bg-purple-100 text-purple-800",
      all: "bg-gray-100 text-gray-800",
    }

    const labels = {
      buss1: "Business 1",
      buss2: "Business 2",
      buss3: "Business 3",
      all: "All Businesses",
    }

    return (
      <Badge className={colors[business as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[business as keyof typeof labels] || business}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email History</h1>
        <p className="text-muted-foreground">View all sent emails and their details</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter email history by business, date range, or sender</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="business">Business</Label>
              <Select value={filters.business} onValueChange={(value) => setFilters({ ...filters, business: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All businesses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_businesses">All businesses</SelectItem>
                  <SelectItem value="buss1">Business 1</SelectItem>
                  <SelectItem value="buss2">Business 2</SelectItem>
                  <SelectItem value="buss3">Business 3</SelectItem>
                  <SelectItem value="all">All Businesses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sender">Sender</Label>
              <Input
                id="sender"
                placeholder="Search by sender name"
                value={filters.sender}
                onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History ({emails.length})
          </CardTitle>
          <CardDescription>All sent emails with details and recipient counts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.length > 0 ? (
                emails.map((email) => (
                  <TableRow key={email._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{email.sender.name}</p>
                        <p className="text-sm text-muted-foreground">{email.sender.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getBusinessBadge(email.business)}</TableCell>
                    <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{email.recipientCount} recipients</Badge>
                    </TableCell>
                    <TableCell>{formatDate(email.sentAt)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedEmail(email)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Email Details</DialogTitle>
                            <DialogDescription>Full email content and information</DialogDescription>
                          </DialogHeader>
                          {selectedEmail && (
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <Label>From</Label>
                                <p className="text-sm">
                                  {selectedEmail.sender.name} ({selectedEmail.sender.email})
                                </p>
                              </div>
                              <div className="grid gap-2">
                                <Label>Business Unit</Label>
                                {getBusinessBadge(selectedEmail.business)}
                              </div>
                              <div className="grid gap-2">
                                <Label>Subject</Label>
                                <p className="text-sm font-medium">{selectedEmail.subject}</p>
                              </div>
                              <div className="grid gap-2">
                                <Label>Content</Label>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm whitespace-pre-wrap">{selectedEmail.content}</p>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label>Recipients</Label>
                                <p className="text-sm">{selectedEmail.recipientCount} recipients</p>
                              </div>
                              <div className="grid gap-2">
                                <Label>Sent At</Label>
                                <p className="text-sm">{formatDate(selectedEmail.sentAt)}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No email history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

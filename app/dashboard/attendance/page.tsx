"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface AttendanceRecord {
  _id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: "present" | "absent" | "partial"
}

export default function AttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/attendance/my-attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTodayAttendance(data.today)
        setRecentAttendance(data.recent)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Checked in successfully",
          description: "Your attendance has been recorded",
        })
        fetchAttendance()
      } else {
        const data = await response.json()
        toast({
          title: "Check-in failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Checked out successfully",
          description: "Have a great day!",
        })
        fetchAttendance()
      } else {
        const data = await response.json()
        toast({
          title: "Check-out failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check out",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Track your daily attendance</p>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAttendance ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Check-in:</span>
                  <span className="font-medium">
                    {todayAttendance.checkIn
                      ? new Date(todayAttendance.checkIn).toLocaleTimeString()
                      : "Not checked in"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Check-out:</span>
                  <span className="font-medium">
                    {todayAttendance.checkOut
                      ? new Date(todayAttendance.checkOut).toLocaleTimeString()
                      : "Not checked out"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Status:</span>
                  {getStatusBadge(todayAttendance.status)}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No attendance record for today</p>
            )}

            <div className="flex gap-2">
              {!todayAttendance?.checkIn && (
                <Button onClick={handleCheckIn} disabled={actionLoading}>
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check In
                </Button>
              )}
              {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                <Button onClick={handleCheckOut} disabled={actionLoading} variant="outline">
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <XCircle className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your attendance history for the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttendance.length > 0 ? (
              recentAttendance.map((record) => (
                <div key={record._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "N/A"}</p>
                      <p>Out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "N/A"}</p>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent attendance records</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

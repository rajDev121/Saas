import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Get stats based on user role
    const stats = {
      totalEmployees: 0,
      emailsSent: 0,
      attendanceToday: 0,
      pendingTasks: 0,
    }

    // Count total employees (excluding admin and hr)
    stats.totalEmployees = await db.collection("users").countDocuments({
      role: "employee",
    })

    // Count emails sent this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    stats.emailsSent = await db.collection("email_history").countDocuments({
      sentAt: { $gte: startOfMonth },
    })

    // Count attendance today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    stats.attendanceToday = await db.collection("attendance").countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
      checkIn: { $ne: null },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

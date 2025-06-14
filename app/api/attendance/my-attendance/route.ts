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
    if (!decoded || decoded.role !== "employee") {
      return NextResponse.json({ message: "Employee access required" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Get today's attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAttendance = await db.collection("attendance").findOne({
      userId: decoded.userId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    // Get recent attendance (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentAttendance = await db
      .collection("attendance")
      .find({
        userId: decoded.userId,
        date: { $gte: sevenDaysAgo },
      })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({
      today: todayAttendance,
      recent: recentAttendance,
    })
  } catch (error) {
    console.error("Get attendance error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

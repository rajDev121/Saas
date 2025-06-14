import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    // Find today's attendance record
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const attendance = await db.collection("attendance").findOne({
      userId: decoded.userId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    if (!attendance || !attendance.checkIn) {
      return NextResponse.json({ message: "Please check in first" }, { status: 400 })
    }

    if (attendance.checkOut) {
      return NextResponse.json({ message: "Already checked out today" }, { status: 400 })
    }

    const now = new Date()
    const checkInTime = new Date(attendance.checkIn)
    const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) // Convert to hours

    // Update attendance record
    await db.collection("attendance").updateOne(
      { _id: attendance._id },
      {
        $set: {
          checkOut: now,
          hoursWorked: Math.round(hoursWorked * 100) / 100, // Round to 2 decimal places
          status: hoursWorked >= 8 ? "present" : "partial",
          updatedAt: now,
        },
      },
    )

    return NextResponse.json({
      message: "Checked out successfully",
      checkOutTime: now,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
    })
  } catch (error) {
    console.error("Check-out error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

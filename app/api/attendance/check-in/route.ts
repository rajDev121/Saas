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

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingAttendance = await db.collection("attendance").findOne({
      userId: decoded.userId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    if (existingAttendance && existingAttendance.checkIn) {
      return NextResponse.json({ message: "Already checked in today" }, { status: 400 })
    }

    const now = new Date()

    if (existingAttendance) {
      // Update existing record
      await db.collection("attendance").updateOne(
        { _id: existingAttendance._id },
        {
          $set: {
            checkIn: now,
            status: "present",
            updatedAt: now,
          },
        },
      )
    } else {
      // Create new attendance record
      await db.collection("attendance").insertOne({
        userId: decoded.userId,
        date: today,
        checkIn: now,
        checkOut: null,
        status: "present",
        hoursWorked: 0,
        createdAt: now,
        updatedAt: now,
      })
    }

    return NextResponse.json({
      message: "Checked in successfully",
      checkInTime: now,
    })
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employee = searchParams.get("employee")
    const date = searchParams.get("date")
    const status = searchParams.get("status")

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Build query
    const query: any = {}

    if (employee && employee !== "all") {
      query.userId = new ObjectId(employee)
    }

    if (date) {
      const selectedDate = new Date(date)
      selectedDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)

      query.date = {
        $gte: selectedDate,
        $lt: nextDay,
      }
    }

    if (status && status !== "all") {
      query.status = status
    }

    // Get attendance logs with user details
    const logs = await db
      .collection("attendance")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            date: 1,
            checkIn: 1,
            checkOut: 1,
            status: 1,
            hoursWorked: 1,
            "userId._id": "$user._id",
            "userId.name": "$user.name",
            "userId.email": "$user.email",
            "userId.role": "$user.jobTitle",
          },
        },
        { $sort: { date: -1 } },
      ])
      .toArray()

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Get attendance logs error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

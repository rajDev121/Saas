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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const business = searchParams.get("business")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const sender = searchParams.get("sender")

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Build query
    const query: any = {}

    if (business && business !== "all_businesses") {
      query.business = business
    }

    if (dateFrom || dateTo) {
      query.sentAt = {}
      if (dateFrom) {
        query.sentAt.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        query.sentAt.$lte = endDate
      }
    }

    if (sender) {
      query["sender.name"] = { $regex: sender, $options: "i" }
    }

    // Get email history
    const emails = await db.collection("email_history").find(query).sort({ sentAt: -1 }).toArray()

    return NextResponse.json(emails)
  } catch (error) {
    console.error("Get email history error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

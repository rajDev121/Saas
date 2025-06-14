import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { sendBulkEmail } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !["admin", "hr"].includes(decoded.role)) {
      return NextResponse.json({ message: "Admin or HR access required" }, { status: 403 })
    }

    const { business, subject, content } = await request.json()

    if (!business || !subject || !content) {
      return NextResponse.json({ message: "Business, subject, and content are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Get sender info
    const sender = await db.collection("users").findOne({ _id: decoded.userId }, { projection: { name: 1, email: 1 } })

    if (!sender) {
      return NextResponse.json({ message: "Sender not found" }, { status: 404 })
    }

    // Get recipients based on business selection
    let recipients = []
    if (business === "all") {
      recipients = await db
        .collection("users")
        .find({ role: "employee" }, { projection: { email: 1, name: 1 } })
        .toArray()
    } else {
      // For demo purposes, we'll send to all employees
      // In a real app, you'd filter by business unit
      recipients = await db
        .collection("users")
        .find({ role: "employee" }, { projection: { email: 1, name: 1 } })
        .toArray()
    }

    if (recipients.length === 0) {
      return NextResponse.json({ message: "No recipients found" }, { status: 400 })
    }

    // Send emails
    const emailResults = await sendBulkEmail({
      recipients,
      subject,
      content,
      senderName: sender.name,
    })

    // Log email history
    const emailHistory = {
      sender: {
        id: sender._id,
        name: sender.name,
        email: sender.email,
      },
      business,
      subject,
      content,
      recipients: recipients.map((r) => ({ email: r.email, name: r.name })),
      recipientCount: recipients.length,
      sentAt: new Date(),
      results: emailResults,
    }

    await db.collection("email_history").insertOne(emailHistory)

    const successCount = emailResults.filter((r) => r.success).length
    const failureCount = emailResults.filter((r) => !r.success).length

    return NextResponse.json({
      message: "Email sending completed",
      totalRecipients: recipients.length,
      successCount,
      failureCount,
      results: emailResults,
    })
  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

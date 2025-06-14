import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateOTP } from "@/lib/auth"
import { sendOTPEmail } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Check if user exists
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP in database
    await db.collection("otps").insertOne({
      email,
      otp,
      expiresAt,
      used: false,
      createdAt: new Date(),
    })

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp)

    if (!emailResult.success) {
      return NextResponse.json({ message: "Failed to send OTP email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "OTP sent to your email",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

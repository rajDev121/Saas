import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: "Email, OTP, and new password are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Find and verify OTP
    const otpRecord = await db.collection("otps").findOne({
      email,
      otp,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    await db.collection("users").updateOne({ email }, { $set: { password: hashedPassword } })

    // Mark OTP as used
    await db.collection("otps").updateOne({ _id: otpRecord._id }, { $set: { used: true } })

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

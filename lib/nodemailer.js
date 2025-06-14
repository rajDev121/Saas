import nodemailer from "nodemailer"

// Create transporter with fallback to Ethereal for testing
const createTransporter = () => {
  // If no SMTP credentials provided, use Ethereal test account
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️  No SMTP credentials found. Using test mode (emails won't be sent)")
    return null
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const transporter = createTransporter()

export async function sendEmail({ to, subject, text, html }) {
  try {
    // If no transporter (no SMTP config), simulate sending
    if (!transporter) {
      console.log("📧 [SIMULATED EMAIL]")
      console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Content: ${text}`)
      console.log("📧 [END SIMULATED EMAIL]")

      return {
        success: true,
        messageId: `simulated-${Date.now()}`,
        message: "Email simulated (no SMTP configured)",
      }
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text,
      html,
    })

    console.log("📧 Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("📧 Email sending failed:", error)
    return { success: false, error: error.message }
  }
}

export async function sendOTPEmail(email, otp) {
  const subject = "Password Reset OTP - Company Dashboard"
  const text = `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin: 0;">Company Dashboard</h1>
        <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
        <h2 style="color: #333; margin-bottom: 20px;">Your OTP Code</h2>
        <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; margin: 20px 0;">This OTP will expire in <strong>5 minutes</strong></p>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404;">
          <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and contact your administrator.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 14px; margin: 0;">
          This is an automated message from Company Dashboard System
        </p>
      </div>
    </div>
  `

  return await sendEmail({ to: email, subject, text, html })
}

export async function sendBulkEmail({ recipients, subject, content, senderName }) {
  const results = []

  for (const recipient of recipients) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Company Dashboard</h1>
          <p style="color: #666; margin: 5px 0;">Internal Communication</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
          <div style="color: #555; line-height: 1.6; white-space: pre-wrap;">${content}</div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 0;">
            Sent by ${senderName} via Company Dashboard System
          </p>
        </div>
      </div>
    `

    const result = await sendEmail({
      to: recipient.email,
      subject,
      text: content,
      html,
    })

    results.push({
      recipient: recipient.email,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    })
  }

  return results
}

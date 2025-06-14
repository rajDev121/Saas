import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// Use dummy JWT secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || "dummy-jwt-secret-for-development-only"

if (!process.env.JWT_SECRET) {
  console.log("⚠️  Using dummy JWT_SECRET. Set JWT_SECRET in .env.local for production")
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.log("🔐 Token verification failed:", error.message)
    return null
  }
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken, hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Get all employees (excluding passwords)
    const employees = await db
      .collection("users")
      .find({ role: "employee" }, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Get employees error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { name, email, password, role, department, phone } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Name, email, password, and role are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("company_dashboard")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new employee
    const newEmployee = {
      name,
      email,
      password: hashedPassword,
      role: "employee",
      jobTitle: role,
      department: department || "",
      phone: phone || "",
      joinDate: new Date(),
      createdAt: new Date(),
    }

    const result = await db.collection("users").insertOne(newEmployee)

    // Return employee data (without password)
    const { password: _, ...employeeWithoutPassword } = newEmployee

    return NextResponse.json({
      _id: result.insertedId,
      ...employeeWithoutPassword,
    })
  } catch (error) {
    console.error("Create employee error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

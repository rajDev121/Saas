const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("company_dashboard")

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("attendance").deleteMany({})
    await db.collection("email_history").deleteMany({})
    await db.collection("otps").deleteMany({})

    console.log("Cleared existing data")

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 12)
    const hrPassword = await bcrypt.hash("hr123", 12)
    const empPassword = await bcrypt.hash("emp123", 12)

    // Seed users
    const users = [
      {
        name: "System Administrator",
        email: "admin@company.com",
        password: adminPassword,
        role: "admin",
        department: "IT",
        phone: "+1234567890",
        joinDate: new Date("2023-01-01"),
        createdAt: new Date(),
      },
      {
        name: "HR Manager",
        email: "hr@company.com",
        password: hrPassword,
        role: "hr",
        department: "Human Resources",
        phone: "+1234567891",
        joinDate: new Date("2023-01-15"),
        createdAt: new Date(),
      },
      {
        name: "John Smith",
        email: "pm@company.com",
        password: empPassword,
        role: "employee",
        jobTitle: "Project Manager",
        department: "Engineering",
        phone: "+1234567892",
        joinDate: new Date("2023-02-01"),
        createdAt: new Date(),
      },
      {
        name: "Sarah Johnson",
        email: "frontend@company.com",
        password: empPassword,
        role: "employee",
        jobTitle: "Frontend Developer",
        department: "Engineering",
        phone: "+1234567893",
        joinDate: new Date("2023-02-15"),
        createdAt: new Date(),
      },
      {
        name: "Mike Wilson",
        email: "backend@company.com",
        password: empPassword,
        role: "employee",
        jobTitle: "Backend Developer",
        department: "Engineering",
        phone: "+1234567894",
        joinDate: new Date("2023-03-01"),
        createdAt: new Date(),
      },
      {
        name: "Emily Davis",
        email: "analyst@company.com",
        password: empPassword,
        role: "employee",
        jobTitle: "Data Analyst",
        department: "Analytics",
        phone: "+1234567895",
        joinDate: new Date("2023-03-15"),
        createdAt: new Date(),
      },
    ]

    await db.collection("users").insertMany(users)
    console.log("Seeded users")

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("attendance").createIndex({ userId: 1, date: 1 })
    await db.collection("email_history").createIndex({ sentAt: -1 })
    await db.collection("otps").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

    console.log("Created indexes")
    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()

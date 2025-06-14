import { MongoClient } from "mongodb"

// Use dummy MongoDB URI if not provided
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/company_dashboard"
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect().catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message)
      console.log("💡 Make sure MongoDB is running or update MONGODB_URI in .env.local")
      // Return a mock client for development
      return createMockClient()
    })
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect().catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message)
    return createMockClient()
  })
}

// Mock client for when MongoDB is not available
function createMockClient() {
  console.log("🔧 Using mock MongoDB client for development")

  const mockData = {
    users: [
      {
        _id: "admin123",
        name: "System Administrator",
        email: "admin@company.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // admin123
        role: "admin",
        department: "IT",
        phone: "+1234567890",
        joinDate: new Date("2023-01-01"),
        createdAt: new Date(),
      },
      {
        _id: "hr123",
        name: "HR Manager",
        email: "hr@company.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // hr123
        role: "hr",
        department: "Human Resources",
        phone: "+1234567891",
        joinDate: new Date("2023-01-15"),
        createdAt: new Date(),
      },
      {
        _id: "emp123",
        name: "John Smith",
        email: "pm@company.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // emp123
        role: "employee",
        jobTitle: "Project Manager",
        department: "Engineering",
        phone: "+1234567892",
        joinDate: new Date("2023-02-01"),
        createdAt: new Date(),
      },
    ],
    attendance: [],
    email_history: [],
    otps: [],
  }

  return {
    db: () => ({
      collection: (name) => ({
        findOne: async (query) => {
          console.log(`🔍 Mock findOne in ${name}:`, query)
          if (name === "users" && query.email) {
            return mockData.users.find((u) => u.email === query.email) || null
          }
          return null
        },
        find: () => ({
          toArray: async () => {
            console.log(`🔍 Mock find in ${name}`)
            return mockData[name] || []
          },
          sort: () => ({
            toArray: async () => mockData[name] || [],
          }),
          project: () => ({
            toArray: async () => mockData[name] || [],
          }),
        }),
        insertOne: async (doc) => {
          console.log(`➕ Mock insertOne in ${name}:`, doc)
          return { insertedId: `mock_${Date.now()}` }
        },
        insertMany: async (docs) => {
          console.log(`➕ Mock insertMany in ${name}:`, docs.length, "documents")
          return { insertedIds: docs.map(() => `mock_${Date.now()}`) }
        },
        updateOne: async (query, update) => {
          console.log(`✏️  Mock updateOne in ${name}:`, query, update)
          return { matchedCount: 1, modifiedCount: 1 }
        },
        deleteOne: async (query) => {
          console.log(`🗑️  Mock deleteOne in ${name}:`, query)
          return { deletedCount: 1 }
        },
        deleteMany: async (query) => {
          console.log(`🗑️  Mock deleteMany in ${name}:`, query)
          return { deletedCount: 0 }
        },
        countDocuments: async (query) => {
          console.log(`🔢 Mock countDocuments in ${name}:`, query)
          return mockData[name]?.length || 0
        },
        createIndex: async () => {
          console.log(`📇 Mock createIndex in ${name}`)
          return "mock_index"
        },
      }),
    }),
    close: async () => {
      console.log("🔌 Mock client closed")
    },
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

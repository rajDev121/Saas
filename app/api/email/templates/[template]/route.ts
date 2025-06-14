import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { template: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const business = searchParams.get("business") || "buss1"

    const templatePath = path.join(process.cwd(), "data", "email-templates", `${business}.json`)

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    const templates = JSON.parse(fs.readFileSync(templatePath, "utf8"))
    const template = templates[params.template]

    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Get template error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

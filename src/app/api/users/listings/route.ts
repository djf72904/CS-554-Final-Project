import { type NextRequest, NextResponse } from "next/server"
import { getListingsByUser } from "@/lib/listing-service"
import { auth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const listings = await getListingsByUser(userId)

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("Error fetching user listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}


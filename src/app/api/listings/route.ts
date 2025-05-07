import { type NextRequest, NextResponse } from "next/server"
import { getListingsBySchool, createListing, searchListings, getListingsWithPagination } from "@/lib/listings"
import { auth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const school = searchParams.get("school")
  const query = searchParams.get("query")
  const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1
  const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20

  try {
    if (query) {
      const listings = await searchListings(query)
      return NextResponse.json({ listings })
    } else if (school) {
      const listings = await getListingsBySchool(school)
      return NextResponse.json({ listings })
    } else {
      const result = await getListingsWithPagination(page, limit)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const data = await request.json()

    const listing = await createListing(data, userId)
    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}


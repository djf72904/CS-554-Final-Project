import { type NextRequest, NextResponse } from "next/server"
import { getListing, updateListing, deleteListing } from "@/lib/listing-service"
import { auth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await getListing(params.id)

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get the existing listing to check ownership
    const existingListing = await getListing(params.id)

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (existingListing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()
    const updatedListing = await updateListing(params.id, data)

    return NextResponse.json({ listing: updatedListing })
  } catch (error) {
    console.error("Error updating listing:", error)
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get the existing listing to check ownership
    const existingListing = await getListing(params.id)

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (existingListing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await deleteListing(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 })
  }
}


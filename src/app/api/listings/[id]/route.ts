import { type NextRequest, NextResponse } from "next/server"
import { getListing, updateListing, deleteListing } from "@/lib/listings"
import { auth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await getListing((await params).id)

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await auth.verifyIdToken(token)

    const existingListing = await getListing((await params).id)

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const data = await request.json()
    const updatedListing = await updateListing((await params).id, data)

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

    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const existingListing = await getListing((await params).id)

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (existingListing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await deleteListing((await params).id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 })
  }
}


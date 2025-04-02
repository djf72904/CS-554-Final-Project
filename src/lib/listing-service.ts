import dbConnect from "./mongoose"
import Listing, { type IListing } from "@/models/Listing"

export type ListingData = Omit<IListing, "_id" | "__v">

export async function createListing(
  data: Omit<ListingData, "createdAt" | "updatedAt" | "status">,
  userId: string,
): Promise<ListingData> {
  await dbConnect()

  const newListing = new Listing({
    ...data,
    userId,
    status: "active",
  })

  const savedListing = await newListing.save()
  return savedListing.toObject() as unknown as ListingData
}

export async function getListingsByUser(userId: string): Promise<ListingData[]> {
  await dbConnect()

  const listings = await Listing.find({ userId }).sort({ createdAt: -1 }).lean()
  return listings as unknown as ListingData[]
}

export async function getListingsBySchool(school: string): Promise<ListingData[]> {
  await dbConnect()

  const listings = await Listing.find({ school, status: "active" }).sort({ createdAt: -1 }).lean()
  return listings as unknown as ListingData[]
}

export async function getListing(listingId: string): Promise<ListingData | null> {
  await dbConnect()

  try {
    const listing = await Listing.findById(listingId).lean()
    return listing as unknown as ListingData | null
  } catch (error) {
    console.error("Error fetching listing:", error)
    return null
  }
}

export async function updateListing(listingId: string, data: Partial<ListingData>): Promise<ListingData | null> {
  await dbConnect()

  const updateData = {
    ...data,
    updatedAt: new Date(),
  }

  try {
    const listing = await Listing.findByIdAndUpdate(listingId, { $set: updateData }, { new: true }).lean()

    return listing as unknown as ListingData | null
  } catch (error) {
    console.error("Error updating listing:", error)
    return null
  }
}

export async function deleteListing(listingId: string): Promise<boolean> {
  await dbConnect()

  try {
    const result = await Listing.findByIdAndDelete(listingId)
    return !!result
  } catch (error) {
    console.error("Error deleting listing:", error)
    return false
  }
}

export async function searchListings(query: string): Promise<ListingData[]> {
  await dbConnect()

  const listings = await Listing.find(
    {
      $text: { $search: query },
      status: "active",
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({ score: { $meta: "textScore" } })
    .lean()

  return listings as unknown as ListingData[]
}

export async function getListingsWithPagination(
  page = 1,
  limit = 20,
  filters = {},
): Promise<{
  listings: ListingData[]
  totalPages: number
  currentPage: number
}> {
  await dbConnect()

  const skip = (page - 1) * limit

  const query = { status: "active", ...filters }

  const listings = await Listing.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

  const total = await Listing.countDocuments(query)

  return {
    listings: listings as unknown as ListingData[],
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}


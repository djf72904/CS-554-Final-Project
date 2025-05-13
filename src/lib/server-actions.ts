"use server"

import dbConnect from "./mongoose"
import Listing from "@/models/Listing"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { revalidatePath } from "next/cache"

export async function getListings() {
  await dbConnect()

  const listings = await Listing.find({ status: "active" }).sort({ createdAt: -1 }).lean()

  return JSON.parse(JSON.stringify(listings))
}

export async function getListingsByCategory(category: string) {
  await dbConnect()

  const listings = await Listing.find({
    status: "active",
    category: category,
  })
    .sort({ createdAt: -1 })
    .lean()

  return JSON.parse(JSON.stringify(listings))
}

export async function getListingById(id: string) {
  await dbConnect()

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null
  }

  const listing = await Listing.findById(id).lean()

  if (!listing) {
    return null
  }

  return JSON.parse(JSON.stringify(listing))
}


export async function getListingsBySchool(school: string) {
  await dbConnect()

  const listings = await Listing.find({
    school,
    status: "active",
  })
    .sort({ createdAt: -1 })
    .lean()

  return JSON.parse(JSON.stringify(listings))
}

export async function searchListings(query: string, base_url: string) {

  const listings = await fetch(`${base_url}/api/listings?query=` + query)
  return JSON.parse(JSON.stringify(listings.json()))

}

export async function getUserById(userId: string) {
  await dbConnect()


  const user = await User.findOne({ uid: userId }).lean()
  return user ? JSON.parse(JSON.stringify(user)) : null
}

export async function getListingsByUserId(userId: string) {
  await dbConnect()

  const listings = await Listing.find({ userId }).sort({ createdAt: -1 }).lean()

  return JSON.parse(JSON.stringify(listings))
}

export async function createListingAction(data: any, userId: string) {
  await dbConnect()

  const newListing = new Listing({
    ...data,
    userId,
    status: "active",
  })

  const savedListing = await newListing.save()
  revalidatePath("/")
  revalidatePath("/profile")

  return JSON.parse(JSON.stringify(savedListing))
}

//TODO: use
export async function updateListingAction(id: string, data: any, userId: string) {
  await dbConnect()

  const listing = await Listing.findById(id)

  if (!listing) {
    throw new Error("Listing not found")
  }

  if (listing.userId !== userId) {
    throw new Error("Unauthorized")
  }

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { new: true },
  ).lean()

  revalidatePath(`/items/${id}`)
  revalidatePath("/profile")

  return JSON.parse(JSON.stringify(updatedListing))
}


//TODO: use
export async function deleteListingAction(id: string, userId: string) {
  await dbConnect()

  const listing = await Listing.findById(id)

  if (!listing) {
    throw new Error("Listing not found")
  }

  if (listing.userId !== userId) {
    throw new Error("Unauthorized")
  }

  await Listing.findByIdAndDelete(id)

  revalidatePath("/profile")

  return { success: true }
}


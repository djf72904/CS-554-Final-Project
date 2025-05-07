'use server'

import dbConnect from "./mongoose"
import User, { type MongoUserType } from "@/models/User"

export type UserProfile = Omit<MongoUserType, "_id" | "__v">


export async function createUserProfile(user: any): Promise<any> {
  await dbConnect()

  let userProfile = await User.findOne({ email: user.email })

  if (!userProfile) {
    const domain = user.email?.split("@")[1] || ""
    const school = domain.replace('.edu', '');

    const newUser = new User({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      school: school,
      credits: 0,
      rating: 0,
      balance: 0,
      likedPosts: []
    })

    userProfile = await newUser.save()
  }

  return {
    uid: userProfile.uid,
    displayName: userProfile.displayName,
    email: userProfile.email,
    school: userProfile.school,
    credits: userProfile.credits,
    createdAt: userProfile.createdAt,
    updatedAt: userProfile.updatedAt,
    rating: userProfile.rating,
    reviews: userProfile.reviews,
    likedPosts: userProfile.likedPosts
  }
}

export async function getUserProfile(userId: string): Promise<any | null> {
  await dbConnect()

  const user = await User.findOne({ uid: userId })
  if(!user) return null
  return JSON.stringify(user)
}
export async function getUserByEmail(userEmail: string): Promise<any | null> {
  await dbConnect()

  const user = await User.findOne({ email: userEmail })
  if(!user) return null
  return JSON.stringify(user)
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  await dbConnect()

  const updateData = {
    ...data,
    updatedAt: new Date(),
  }

  const user = await User.findOneAndUpdate({ uid: userId }, { $set: updateData }, { new: true }).lean()

  return  user as unknown as UserProfile | null
}


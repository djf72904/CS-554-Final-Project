'use server'
import dbConnect from "./mongoose"
import User, { type IUser } from "@/models/User"
import type { User as FirebaseUser } from "firebase/auth"
import searchColleges from "@/lib/college";

export type UserProfile = Omit<IUser, "_id" | "__v">
export async function createUserProfile(user: any): Promise<any> {
  await dbConnect()

  // Check if user already exists
  let userProfile = await User.findOne({ uid: user.uid })

  if (!userProfile) {
    const domain = user.email?.split("@")[1] || ""
    const school = domain.replace('.edu', '');

    const newUser = new User({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      isEduEmail: user.email?.endsWith(".edu") || false,
      school: school,
      credits: 0,
    })

    userProfile = await newUser.save()
  }

  // Explicitly convert to a plain object and remove Mongoose-specific fields
  return {
    uid: userProfile.uid,
    displayName: userProfile.displayName,
    email: userProfile.email,
    photoURL: userProfile.photoURL,
    isEduEmail: userProfile.isEduEmail,
    school: userProfile.school,
    credits: userProfile.credits,
    createdAt: userProfile.createdAt,
    updatedAt: userProfile.updatedAt
  }
}

export async function getUserProfile(userId: string): Promise<any | null> {
  await dbConnect()

  const user = await User.findOne({ uid: userId })
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    isEduEmail: user.isEduEmail,
    school: user.school,
    credits: user.credits,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt

  }
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


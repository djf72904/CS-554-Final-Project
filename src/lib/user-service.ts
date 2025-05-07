'use server'
import dbConnect from "./mongoose"
import User, { type IUser } from "@/models/User"

export type UserProfile = Omit<IUser, "_id" | "__v">
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
      isEduEmail: user.email?.endsWith(".edu") || false,
      school: school,
      credits: 0,
      rating: 0,
      reviews: [],
    })

    userProfile = await newUser.save()
  }

  return {
    uid: userProfile.uid,
    displayName: userProfile.displayName,
    email: userProfile.email,
    isEduEmail: userProfile.isEduEmail,
    school: userProfile.school,
    credits: userProfile.credits,
    createdAt: userProfile.createdAt,
    updatedAt: userProfile.updatedAt,
    rating: userProfile.rating,
    reviews: userProfile.reviews,
  }
}

export async function getUserProfile(userId: string): Promise<any | null> {
  await dbConnect()

  const user = await User.findOne({ uid: userId })
  if(!user) return null
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    isEduEmail: user.isEduEmail,
    school: user.school,
    credits: user.credits,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt

  }
}
export async function getUserByEmail(userEmail: string): Promise<any | null> {
  await dbConnect()

  const user = await User.findOne({ email: userEmail })
  if(!user) return null
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
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


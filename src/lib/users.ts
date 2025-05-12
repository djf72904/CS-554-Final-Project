'use server'

import dbConnect from "./mongoose"
import User, { type MongoUserType } from "@/models/User"
import CryptoJS from 'crypto-es'

export type UserProfile = Omit<MongoUserType, "_id" | "__v">

const MFA_SECRET_KEY = "THISISATESTKEY" // 256-bit secret in .env

function encryptSecret(secret: string): string {
  return CryptoJS.AES.encrypt(secret, MFA_SECRET_KEY).toString()
}

function decryptSecret(cipher: string): string {
  const bytes = CryptoJS.AES.decrypt(cipher, MFA_SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export async function createUserProfile(user: any): Promise<any> {
  await dbConnect()

  let userProfile = await User.findOne({ email: user.email })
  if(userProfile) return userProfile

  if (!userProfile) {
    const domain = user.email?.split("@")[1] || ""
    const school = domain.replace('.edu', '');

    const newUser = new User({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      school: school,
      credits: 1000,
      rating: 0,
      balance: 1000,
      likedPosts: [],
      mfaEnabled: false,
      totpSecret: null
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
    balance: userProfile.balance,
    rating: userProfile.rating,
    likedPosts: userProfile.likedPosts,
    mfaEnabled: userProfile.mfaEnabled
  }
}

export async function getUserByEmail(userEmail: string): Promise<any | null> {
  await dbConnect()
  const user = await User.findOne({ email: userEmail }).lean()
  return user ? JSON.parse(JSON.stringify(user)) : null
}

export async function getUserProfile(userId: string): Promise<any | null> {
  await dbConnect()
  const user = await User.findOne({ uid: userId }).lean()
  return user ? JSON.parse(JSON.stringify(user)) : null
}

export async function updateUserProfile(userId: any, data: Partial<UserProfile>): Promise<UserProfile | null> {
  await dbConnect()

  const updateData = {
    ...data,
    updatedAt: new Date(),
  }

  const user = await User.findOneAndUpdate({ uid: userId }, { $set: updateData }, { new: true }).lean()
  return user as unknown as UserProfile | null
}

export async function getSavedListingsFromUser(userId: string): Promise<any | null> {
  await dbConnect()
  const currUser = (await getUserProfile(userId))
  const savedListings = currUser.likedPosts
  return savedListings?.length ? JSON.stringify(savedListings) : null
}

export async function setMfaSecret(userId: string, secret: string) {
  await dbConnect()
  const encrypted = encryptSecret(secret)
  await User.updateOne({ uid: userId }, { $set: { totpSecret: encrypted, mfaEnabled: true } })
}

export async function getMfaSecret(userId: string) {
  await dbConnect()
  const user = await User.findOne({ uid: userId })
  if (!user?.totpSecret) return null
  return decryptSecret(user.totpSecret)
}

export async function disableMfa(userId: string) {
  await dbConnect()
  await User.updateOne({ uid: userId }, { $set: { mfaEnabled: false, totpSecret: null } })
}
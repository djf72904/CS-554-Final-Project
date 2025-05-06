import { type NextRequest, NextResponse } from "next/server"
import {createUserProfile, getUserProfile, updateUserProfile} from "@/lib/user-service"
import { auth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const userProfile = (await getUserProfile(userId))

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
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
    const existingProfile = await getUserProfile(userId)
    if (existingProfile) {
      return NextResponse.json({ user: existingProfile }, { status: 200 }) // or 409 Conflict if preferred
    }

    const userData = await request.json()

    const userProfile = await createUserProfile({
      uid: decodedToken.uid,
      displayName: userData.displayName,
      email: userData.email,
      emailVerified: decodedToken.email_verified || false,
    })

    return NextResponse.json({ user: userProfile }, { status: 201 })
  } catch (error) {
    console.error("Error creating user profile:", error)
    return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const data = await request.json()
    const updatedUser = await updateUserProfile(userId, data)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}


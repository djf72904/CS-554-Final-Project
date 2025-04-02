import { type NextRequest, NextResponse } from "next/server"
import {createUserProfile, getUserProfile, updateUserProfile} from "@/lib/user-service"
import { auth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify Firebase token
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

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token)

    // Get user data from request body
    const userData = await request.json()

    // Create user profile
    const userProfile = await createUserProfile({
      uid: decodedToken.uid,
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL,
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

    // Verify Firebase token
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


import { auth } from "./firebase-admin"
import { cookies } from "next/headers"

export async function getCurrentUser() {
    const cookieStore = await cookies()

    const token = cookieStore.get("auth-token")?.value

    if (!token) {
        return null
    }

    try {
        const decodedToken = await auth.verifyIdToken(token)
        return {
            id: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            image: decodedToken.picture,
        }
    } catch (error) {
        console.error("Error verifying auth token:", error)
        return null
    }
}

// Get the session for server components
export async function getSession() {
    const user = await getCurrentUser()

    if (!user) {
        return null
    }

    return {
        user
    }
}

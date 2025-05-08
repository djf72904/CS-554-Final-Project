import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import { getMessagesBetweenUsers } from "@/lib/messages"

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const token = req.headers.get("Authorization")?.split("Bearer ")[1]
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const decodedToken = await auth.verifyIdToken(token)
        const loggedInUserId = decodedToken.uid
        const targetUserId = params.userId

        const messages = await getMessagesBetweenUsers(loggedInUserId, targetUserId)

        return NextResponse.json({ messages })
    } catch (err) {
        console.error("❌ Error fetching messages:", err)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}

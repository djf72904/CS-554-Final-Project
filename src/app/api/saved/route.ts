import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Listing from "@/models/Listing";
import {auth} from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {

    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await auth.verifyIdToken(token)


    await dbConnect();

    try {
        const { postId } = await request.json();

        const user = await User.findOne({ uid: decoded.uid });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const post = await Listing.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

    } catch (err) {
        console.error("Error toggling like:", err);
        return NextResponse.json(
            { error: "Failed to save or unsave listing" },
            { status: 500 }
        );
    }
}
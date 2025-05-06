import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { postId, userId } = await request.json();

        const user = await User.findOne({ uid: userId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const post = await Listing.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        //TODO:
        // transfer either balance or credits from buyer to seller

    } catch (err) {
        console.error("Error toggling like:", err);
        return NextResponse.json(
            { error: "Failed to save or unsave listing" },
            { status: 500 }
        );
    }
}
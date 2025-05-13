import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Listing from "@/models/Listing";
import { createTransaction } from "@/lib/transactions";
import { addSoldOverlay } from "@/lib/image-processor";
import path from "path";
import {auth} from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await auth.verifyIdToken(token)

    await dbConnect();

    try {
        const { postId, sellerId, balance, balanceType } = await request.json();

        const user = await User.findOne({ uid: decoded.uid });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const post = await Listing.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        let transactionId;

        if (balanceType === 'credit') {
            const { _id } = await createTransaction({
                buyerId: decoded.uid,
                sellerId: sellerId,
                listingId: postId,
                credits: balance,
                amount: 0,
                status: 'complete',
                paymentMethod: balanceType
            })

            transactionId = _id

        }
        else {
            const { _id } =
                await createTransaction({
                    buyerId: decoded.uid,
                    sellerId: sellerId,
                    listingId: postId,
                    amount: balance,
                    credits: 0,
                    status: 'complete',
                    paymentMethod: balanceType
                })

            transactionId = _id
        }

        try {
            if (post.images?.[0]) {
                const inputImagePath = path.join(process.cwd(), "public", post.images[0]);
                const overlayPath = await addSoldOverlay(inputImagePath);
                post.overlaySold = overlayPath;
            } else {
                console.log('image not found');
            }
        } catch (err) {
            console.log('it did not work', err);
        }

        await post.save();

        return NextResponse.json({ transactionId })

    } catch (err) {
        console.error("Error purchasing item:", err);
        return NextResponse.json(
            { error: `Failed to purchase item: ${err}` },
            { status: 500 }
        );
    }
}
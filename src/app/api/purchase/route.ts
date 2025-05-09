import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Listing from "@/models/Listing";
import {createTransaction} from "@/lib/transactions";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { postId, buyerId, sellerId, balance, balanceType } = await request.json();

        const user = await User.findOne({ uid: buyerId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const post = await Listing.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        let transactionId;

        if(balanceType === 'credit'){
            const {_id} = await createTransaction({
                buyerId: buyerId,
                sellerId: sellerId,
                listingId: postId,
                credits: balance,
                amount: 0,
                status: 'completed',
                paymentMethod: balanceType
            })

            transactionId = _id

        }
        else{
            const {_id} =
                await createTransaction({
                buyerId: buyerId,
                sellerId: sellerId,
                listingId: postId,
                amount: balance,
                credits: 0,
                status: 'completed',
                paymentMethod: balanceType
            })

            transactionId = _id
        }

        return NextResponse.json({transactionId})


    } catch (err) {
        console.error("Error purchasing item:", err);
        return NextResponse.json(
            { error: `Failed to purchase item: ${err}` },
            { status: 500 }
        );
    }
}
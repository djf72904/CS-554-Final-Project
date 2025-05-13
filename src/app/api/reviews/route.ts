import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Listing from "@/models/Listing";
import {createTransaction} from "@/lib/transactions";
import Transaction from "@/models/Transaction";

export async function POST(request: NextRequest) {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect();

    try {
        const { transactionId, rating, review } = await request.json();

        if(typeof rating !== "number" || typeof review !== "string"){
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const tx = await Transaction.findById(transactionId);
        if (!tx) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        await Transaction.updateOne({_id: transactionId}, {rating: rating, review: review})


        return NextResponse.json({transactionId})


    } catch (err) {
        console.error("Error adding review:", err);
        return NextResponse.json(
            { error: `Failed to add review: ${err}` },
            { status: 500 }
        );
    }
}
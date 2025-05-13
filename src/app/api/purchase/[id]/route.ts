import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import {getAllTransactions, getTransaction, updateTransaction} from "@/lib/transactions";
import {updateUserProfile, getUserProfile} from "@/lib/users";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await auth.verifyIdToken(token)

    try {
        const existingTransaction = await getTransaction((await params).id)

        if (!existingTransaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
        }

        const data = await request.json()
        const updatedTransaction = await updateTransaction((await params).id, data)

        let ratingSum = 0;
        const allTransactions = await getAllTransactions()
        for (let i=0; i<allTransactions.length; i++) {
            if(allTransactions[i].sellerId === updatedTransaction?.sellerId){
                ratingSum += allTransactions[i].rating
            }
        }
        let finalRating = ratingSum / allTransactions.length

        const newRatingData = {
            rating: finalRating,
        }

        const updateSellerReview = await updateUserProfile(updatedTransaction?.sellerId, newRatingData)

        return NextResponse.json({ transaction: updatedTransaction, seller: updateSellerReview })
    } catch (error) {
        console.error("Error updating transaction:", error)
        return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }
}
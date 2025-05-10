import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import {getTransaction, updateTransaction} from "@/lib/transactions";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const existingTransaction = await getTransaction((await params).id)

        if (!existingTransaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
        }

        const data = await request.json()
        const updatedTransaction = await updateTransaction((await params).id, data)

        return NextResponse.json({ transaction: updatedTransaction })
    } catch (error) {
        console.error("Error updating transaction:", error)
        return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }
}
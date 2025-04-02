import mongoose from "mongoose"
import dbConnect from "./mongoose"
import Transaction, { type ITransaction } from "@/models/Transaction"
import User from "@/models/User"
import Listing from "@/models/Listing"

export type TransactionData = Omit<ITransaction, "_id" | "__v">

export async function createTransaction(
  data: Omit<TransactionData, "createdAt" | "updatedAt" | "status">,
): Promise<TransactionData> {
  await dbConnect()

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Create the transaction
    const newTransaction = new Transaction({
      ...data,
      status: "pending",
    })

    await newTransaction.save({ session })

    // If using credits, update user balances
    if (data.paymentMethod === "credit") {
      // Deduct credits from buyer
      await User.findOneAndUpdate({ uid: data.buyerId }, { $inc: { credits: -data.credits } }, { session })

      // Add credits to seller
      await User.findOneAndUpdate({ uid: data.sellerId }, { $inc: { credits: data.credits } }, { session })
    }

    // Update listing status to pending
    await Listing.findByIdAndUpdate(data.listingId, { $set: { status: "pending" } }, { session })

    await session.commitTransaction()
    session.endSession()

    return newTransaction.toObject() as unknown as TransactionData
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    console.error("Error creating transaction:", error)
    throw error
  }
}

export async function completeTransaction(transactionId: string): Promise<TransactionData | null> {
  await dbConnect()

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Get the transaction
    const transaction = await Transaction.findById(transactionId).session(session)

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    if (transaction.status !== "pending") {
      throw new Error("Transaction is not in pending status")
    }

    // Update transaction status
    transaction.status = "completed"
    await transaction.save({ session })

    // Update listing status to sold
    await Listing.findByIdAndUpdate(transaction.listingId, { $set: { status: "sold" } }, { session })

    await session.commitTransaction()
    session.endSession()

    return transaction.toObject() as unknown as TransactionData
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    console.error("Error completing transaction:", error)
    return null
  }
}

export async function cancelTransaction(transactionId: string): Promise<TransactionData | null> {
  await dbConnect()

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Get the transaction
    const transaction = await Transaction.findById(transactionId).session(session)

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    if (transaction.status !== "pending") {
      throw new Error("Transaction is not in pending status")
    }

    // Update transaction status
    transaction.status = "cancelled"
    await transaction.save({ session })

    // If using credits, refund the buyer
    if (transaction.paymentMethod === "credit") {
      // Refund credits to buyer
      await User.findOneAndUpdate({ uid: transaction.buyerId }, { $inc: { credits: transaction.credits } }, { session })

      // Deduct credits from seller
      await User.findOneAndUpdate(
        { uid: transaction.sellerId },
        { $inc: { credits: -transaction.credits } },
        { session },
      )
    }

    // Update listing status back to active
    await Listing.findByIdAndUpdate(transaction.listingId, { $set: { status: "active" } }, { session })

    await session.commitTransaction()
    session.endSession()

    return transaction.toObject() as unknown as TransactionData
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    console.error("Error cancelling transaction:", error)
    return null
  }
}

export async function getTransactionsByUser(userId: string): Promise<TransactionData[]> {
  await dbConnect()

  const transactions = await Transaction.find({
    $or: [{ buyerId: userId }, { sellerId: userId }],
  })
    .sort({ createdAt: -1 })
    .populate("listingId")
    .lean()

  return transactions as unknown as TransactionData[]
}

export async function getTransaction(transactionId: string): Promise<TransactionData | null> {
  await dbConnect()

  try {
    const transaction = await Transaction.findById(transactionId).populate("listingId").lean()

    return transaction as unknown as TransactionData | null
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return null
  }
}


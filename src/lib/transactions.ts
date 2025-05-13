import mongoose from "mongoose"
import dbConnect from "./mongoose"
import Transaction, { type MongoTransactionType } from "@/models/Transaction"
import User from "@/models/User"
import Listing from "@/models/Listing"
import {UserProfile} from "@/lib/users";

export type TransactionData = MongoTransactionType

export async function createTransaction(
  data: Partial<TransactionData>,
): Promise<TransactionData> {
  await dbConnect()

  try {
    const newTransaction = new Transaction({
      ...data,
      status: "pending",
    })

    await newTransaction.save()

    if (data.paymentMethod === "credit") {
      await User.findOneAndUpdate({ uid: data.buyerId }, { $inc: { credits: -data.credits! } })
      await User.findOneAndUpdate({ uid: data.sellerId }, { $inc: { credits: data.credits! } })
    }
    else {
      await User.findOneAndUpdate({ uid: data.buyerId }, { $inc: { credits: -data.amount! } })
      await User.findOneAndUpdate({ uid: data.sellerId }, { $inc: { credits: data.amount! } })
    }

    await Listing.findByIdAndUpdate(data.listingId, { $set: { status: "complete" } })

    return newTransaction.toObject() as unknown as TransactionData
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

export async function completeTransaction(transactionId: string): Promise<TransactionData | null> {
  await dbConnect()

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const transaction = await Transaction.findById(transactionId).session(session)

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    if (transaction.status !== "pending") {
      throw new Error("Transaction is not in pending status")
    }

    transaction.status = "complete"
    await transaction.save({ session })

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
    const transaction = await Transaction.findById(transactionId).session(session)

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    if (transaction.status !== "pending") {
      throw new Error("Transaction is not in pending status")
    }

    transaction.status = "cancelled"
    await transaction.save({ session })

    if (transaction.paymentMethod === "credit") {
      await User.findOneAndUpdate({ uid: transaction.buyerId }, { $inc: { credits: transaction.credits } }, { session })

      await User.findOneAndUpdate(
        { uid: transaction.sellerId },
        { $inc: { credits: -transaction.credits } },
        { session },
      )
    }

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

export async function getTransactionsByUser(userId: string): Promise<string> {
  await dbConnect()

  const transactions = await Transaction.find({
    $or: [{ buyerId: userId }, { sellerId: userId }],
  })
    .sort({ createdAt: -1 })
    .populate("listingId")
    .lean()

  return JSON.stringify(transactions as unknown as TransactionData[])
}

export async function getTransaction(transactionId: string): Promise<string | null> {
  await dbConnect()

  try {
    const transaction = await Transaction.findById(transactionId).populate("listingId").lean()

    return JSON.stringify(transaction as unknown as TransactionData | null)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return null
  }
}

export async function updateTransaction(transactionId: string, data: Partial<TransactionData>): Promise<TransactionData | null> {
  await dbConnect()

  const updateData = {
    ...data,
    updatedAt: new Date(),
  }

  const transaction = await Transaction.findOneAndUpdate({_id: transactionId}, {$set: updateData}, {new: true}).lean()

  return transaction as unknown as TransactionData | null
}

export async function getAllTransactions() : Promise<any | null> {
  await dbConnect()

  const transactions = await Transaction.find({})

  return transactions as unknown as any | null
}


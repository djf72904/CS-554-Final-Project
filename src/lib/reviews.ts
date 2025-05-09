import dbConnect from "./mongoose"
import Transaction, { type MongoTransactionType } from "@/models/Transaction"
import User from "@/models/User";

export type TransactionData = MongoTransactionType

export async function fetchReviewsForUser(userId: string): Promise<string> {
  await dbConnect()

  try {
    const transactions = await Transaction.find({ sellerId: userId }).lean();
    const buyerIds = Array.from(new Set(transactions.map(t => t.buyerId)));
    const buyers = await User.find({ uid: { $in: buyerIds } }).lean();
    const buyerMap = buyers.reduce<Record<string, any>>((map, user) => {
      map[user.uid] = user;
      return map;
    }, {});

    const withBuyers = transactions.map(tx => ({
      ...tx,
      buyer: buyerMap[tx.buyerId] ?? null
    }));

    return JSON.stringify(withBuyers)
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}
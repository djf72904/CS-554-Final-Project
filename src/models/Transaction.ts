import mongoose, { Schema, type Document } from "mongoose"

export interface MongoTransactionType extends Document {
  buyerId: string | mongoose.Types.ObjectId | {
    uid: string
    displayName: string | null
    email: string | null
    isEduEmail: boolean
    school?: string
    credits: number
    rating: number
  }
  sellerId: string | mongoose.Types.ObjectId | {
    uid: string
    displayName: string | null
    email: string | null
    isEduEmail: boolean
    school?: string
    credits: number
    rating: number
  }
  listingId: mongoose.Types.ObjectId
  amount: number
  credits: number
  paymentMethod: "cash" | "credit"
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema: Schema = new Schema({
  buyerId: { type: String, required: true, index: true },
  sellerId: { type: String, required: true, index: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  amount: { type: Number, required: true },
  credits: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cash", "credit"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
    index: true,
  },
  review: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

TransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Transaction || mongoose.model<MongoTransactionType>("Transaction", TransactionSchema)


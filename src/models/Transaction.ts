import mongoose, { Schema, type Document } from "mongoose"

export interface ITransaction extends Document {
  buyerId: string
  sellerId: string
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Update the updatedAt field on save
TransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema)


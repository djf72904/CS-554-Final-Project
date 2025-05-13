import mongoose, { Schema, type Document } from "mongoose"
import {MongoUserType} from "@/models/User";
import {MongoListingType} from "@/models/Listing";

export interface MongoTransactionType extends Document {
  buyerId: string  | mongoose.Types.ObjectId | MongoUserType
  sellerId: string | mongoose.Types.ObjectId | MongoUserType
  listingId: mongoose.Types.ObjectId | MongoListingType
  amount: number
  credits: number
  paymentMethod: "cash" | "credit"
  status: "pending" | "complete" | "cancelled"
  createdAt: Date
  updatedAt: Date
  rating: number
  review: string
}

const TransactionSchema: Schema = new Schema({
  buyerId: { type: String, required: true, index: true },
  sellerId: { type: String, required: true, index: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  amount: { type: Number, required: true },
  credits: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["card", "credit"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "complete", "cancelled"],
    default: "pending",
    index: true,
  },
  review: { type: String, default: "" },
  rating: {type: Number, default: 0},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

TransactionSchema.virtual("buyer", {
  ref: "User",
  localField: "buyerId",   // the string UID in your transaction
  foreignField: "uid",     // the field on User you match against
  justOne: true
});


TransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Transaction || mongoose.model<MongoTransactionType>("Transaction", TransactionSchema)


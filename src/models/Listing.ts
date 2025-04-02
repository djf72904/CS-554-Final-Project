import mongoose, { Schema, type Document } from "mongoose"

export interface IListing extends Document {
  title: string
  description: string
  category: string
  condition: string
  price: number
  credits: number
  images: string[]
  userId: string
  school: string
  status: "active" | "sold" | "pending"
  createdAt: Date
  updatedAt: Date
}

const ListingSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  price: { type: Number, required: true },
  credits: { type: Number, required: true },
  images: { type: [String], default: [] },
  userId: { type: String, required: true, index: true },
  school: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ["active", "sold", "pending"],
    default: "active",
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

ListingSchema.index({ title: "text", description: "text" })

ListingSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema)


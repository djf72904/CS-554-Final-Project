import mongoose, { Schema, type Document } from "mongoose"

export interface MongoListingType extends Document {
  title: string
  description: string
  category: string
  condition: string
  price: number
  credits: number
  images: string[]
  userId: string
  school: string
  likes: string[]
  pickup_location: string
  status: "active" | "sold" | "pending"
  createdAt: Date
  updatedAt: Date
  overlaySold: string
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
  pickup_location: { type: String, required: true },
    likes: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["active", "sold", "pending"],
    default: "active",
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  overlaySold: {
    type: String,
    default: null,
  },
})

ListingSchema.index({ title: "text", description: "text" })

ListingSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Listing || mongoose.model<MongoListingType>("Listing", ListingSchema)


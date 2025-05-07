

import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  uid: string
  displayName: string | null
  email: string | null
  school?: string
  credits: number
  rating: number
  createdAt: Date
  updatedAt: Date
    likedPosts: string[]
    reviews?: string[]
}

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  displayName: { type: String, default: null },
  email: { type: String, default: null },
  school: { type: String, default: "" },
  credits: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likedPosts: { type: [String], default: [] },
    reviews: { type: [String], default: [] },
})

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  this.rating = 5
  next()
})


export default mongoose?.models?.User || mongoose.model<IUser>("User", UserSchema)

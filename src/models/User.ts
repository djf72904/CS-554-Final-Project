

import mongoose, { Schema, type Document } from "mongoose"

export interface MongoUserType extends Document {
  uid: string
  displayName: string | null
  email: string | null
  school?: string
  // School credit balance
  credits: number
  rating: number
  createdAt: Date
  updatedAt: Date
  likedPosts: string[]
  // Cash balance
  balance: number,
  totpSecret: string,
  mfaEnabled: boolean
}

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  displayName: { type: String, default: null },
  email: { type: String, default: null },
  school: { type: String, default: "" },
  credits: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likedPosts: { type: [String], default: [] },
  totpSecret: { type: String, default: "" },
  mfaEnabled: { type: Boolean, default: false },
})

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  this.rating = 0
  next()
})


export default mongoose?.models?.User || mongoose.model<MongoUserType>("User", UserSchema)

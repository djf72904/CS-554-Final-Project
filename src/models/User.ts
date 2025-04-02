

import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  isEduEmail: boolean
  school?: string
  credits: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  displayName: { type: String, default: null },
  email: { type: String, default: null },
  photoURL: { type: String, default: null },
  isEduEmail: { type: Boolean, default: false },
  school: { type: String, default: "" },
  credits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Update the updatedAt field on save
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})


export default mongoose?.models?.User || mongoose.model<IUser>("User", UserSchema)

'use server'

import mongoose from "mongoose"

const MONGODB_URI = "mongodb://localhost:27017/"
let isConnected = false

async function dbConnect() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return
  }

  await mongoose.connect(MONGODB_URI)
  isConnected = true
}

export default dbConnect

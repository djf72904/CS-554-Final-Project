'use server'

import mongoose from "mongoose"

const MONGODB_URI = "mongodb://localhost:27017/"

async function dbConnect() {
  await mongoose.connect(MONGODB_URI)
}

export default dbConnect

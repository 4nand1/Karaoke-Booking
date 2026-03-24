import mongoose from "mongoose"

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI is missing")
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  })

  console.log("MongoDB connected")
}

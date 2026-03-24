import mongoose from "mongoose"

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    throw new Error("MONGODB_URI is missing")
  }

  const isPlaceholderUri =
    uri.includes("username:password") || uri.includes("cluster.mongodb.net/karaoke")

  if (isPlaceholderUri) {
    throw new Error(
      "MONGODB_URI is still using the sample value in be/.env. Replace it with your real MongoDB Atlas connection string."
    )
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      "MONGODB_URI must start with mongodb:// or mongodb+srv://"
    )
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  })

  console.log("MongoDB connected")
}

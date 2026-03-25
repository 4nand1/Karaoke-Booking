import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { OrderModel } from "../../database/schema/order.schema"

export const getOrders: RequestHandler = async (req, res) => {
  try {
    const { userId } = getAuth(req)
    const { karaokeId, scope } = req.query

    if (scope === "my") {
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 })
      return res.status(200).json(orders)
    }

    if (karaokeId) {
      const orders = await OrderModel.find({ karaokeId }).sort({ createdAt: -1 })
      return res.status(200).json(orders)
    }

    const orders = await OrderModel.find({}).sort({ createdAt: -1 })
    return res.status(200).json(orders)
  } catch (error) {
    console.error("getOrders error:", error)
    return res.status(500).json({ message: "Failed to get orders" })
  }
}

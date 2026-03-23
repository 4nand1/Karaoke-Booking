import type { RequestHandler } from "express"
import { OrderModel } from "../../database/schema/order.schema"

export const getOrders: RequestHandler = async (req, res) => {
  try {
    const { karaokeId } = req.query

    if (karaokeId) {
      const orders = await OrderModel.find({ karaokeId })
      return res.status(200).json(orders)
    }

    const orders = await OrderModel.find({})
    return res.status(200).json(orders)
  } catch (error) {
    console.error("getOrders error:", error)
    return res.status(500).json({ message: "Failed to get orders" })
  }
}
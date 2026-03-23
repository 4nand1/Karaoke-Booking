import type { RequestHandler } from "express"
import { OrderModel } from "../../database/schema/order.schema"

export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const order = await OrderModel.findByIdAndUpdate(id, { status }, { new: true })
    if (!order) {
      res.status(404).json({ message: "Order not found" })
      return
    }

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: "Failed to update order" })
  }
}
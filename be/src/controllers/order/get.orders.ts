import type { RequestHandler } from "express";
import { OrderModel } from "../../database/schema/order.schema";

export const getOrders: RequestHandler = async (req, res) => {
  const user = (req as unknown as { user: any }).user;
  const userId = (req as unknown as { userId?: string }).userId || user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orders = await OrderModel.find({ userId })

  res.status(200).json(orders);
};

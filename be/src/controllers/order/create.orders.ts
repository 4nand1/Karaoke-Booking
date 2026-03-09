import type { RequestHandler } from "express";

import { OrderModel } from "../../database/schema/order.schema";

export const createOrders: RequestHandler = async (req, res) => {
  const body = req.body;
  const user = (req as unknown as { user: any }).user;
  const userId = (req as unknown as { userId?: string }).userId || user?._id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orders = await OrderModel.create({
    ...body,
    userId,
  });
  res.status(201).json(orders);
};

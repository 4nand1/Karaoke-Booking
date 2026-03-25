import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { OrderModel } from "../../database/schema/order.schema"

export const createOrders: RequestHandler = async (req, res) => {
  try {
    const body = req.body ?? {}
    const { userId: clerkUserId } = getAuth(req)
    const order = await OrderModel.create({
      userId: clerkUserId || null,
      karaokeId: body.karaokeId,
      roomId: body.roomId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      bookingDate: body.bookingDate,
      bookingSlots: body.bookingSlots,
      guestCount: body.guestCount || 1,
      bookingType: clerkUserId ? "customer" : "guest",
      status: body.status ?? "pending",
      paymentStatus: body.paymentStatus ?? "unpaid",
      stripeSessionId: body.stripeSessionId ?? null,
      menuItems: body.menuItems ?? [],
      totalAmount: body.totalAmount ?? 0,
    })

    return res.status(201).json({ success: true, order })
  } catch (error) {
    console.error("createOrders error:", error)
    return res.status(500).json({ message: "Failed to create booking" })
  }
}

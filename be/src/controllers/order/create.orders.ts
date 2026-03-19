import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { OrderModel } from "../../database/schema/order.schema"

export const createOrders: RequestHandler = async (req, res) => {
  try {
    const body = req.body ?? {}
    const { userId: clerkUserId } = getAuth(req)

    const legacyUser = (req as unknown as { user?: any }).user
    const legacyUserId =
      (req as unknown as { userId?: string }).userId || legacyUser?._id

    const authenticatedUserId = clerkUserId || legacyUserId || null

    const guestPhoneNumber =
      body.guestPhoneNumber ?? body.phoneNumber ?? body.phone ?? null

    const guestConfirmationCode =
      body.guestConfirmationCode ?? body.confirmationCode ?? body.code ?? null

    if (!authenticatedUserId && (!guestPhoneNumber || !guestConfirmationCode)) {
      return res.status(400).json({
        message:
          "Guest booking requires phone number and confirmation code when the user is not signed in",
      })
    }

    const { userId: _ignoredUserId, ...safeBody } = body

    const orderPayload = authenticatedUserId
      ? {
          ...safeBody,
          userId: authenticatedUserId,
          bookingType: "customer",
        }
      : {
          ...safeBody,
          bookingType: "guest",
          guestPhoneNumber,
          guestConfirmationCode,
        }

    const orders = await OrderModel.create(orderPayload)
    return res.status(201).json(orders)
  } catch (error) {
    console.error("createOrders error:", error)
    return res.status(500).json({ message: "Failed to create booking" })
  }
}
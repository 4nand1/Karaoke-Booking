import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { OrderModel } from "../../database/schema/order.schema"
import { KaraokeModel } from "../../models/Karaoke"

type OrderRecord = {
  _id: string
  karaokeId?: string
  roomId?: string
  bookingDate?: string
  bookingSlots?: string[]
  guestCount?: number
  totalAmount?: number
  status?: string
  paymentStatus?: string
  customerName?: string
  customerPhone?: string
  createdAt?: string
  [key: string]: unknown
}

type KaraokeRecord = {
  _id: string
  name?: string
  address?: string
  city?: string
  image?: string | null
  images?: string[]
  rooms?: Array<{
    _id?: string
    name?: string
    type?: string
    price?: number
    capacity?: number
    image?: string | null
  }>
}

const enrichOrders = async (orders: OrderRecord[]) => {
  const karaokeIds = Array.from(
    new Set(
      orders
        .map((order) => String(order.karaokeId || "").trim())
        .filter(Boolean)
    )
  )

  if (!karaokeIds.length) {
    return orders
  }

  const karaokes = (await KaraokeModel.find({ _id: { $in: karaokeIds } })
    .select("name address city image images rooms")
    .lean()) as KaraokeRecord[]

  const karaokeMap = new Map(
    karaokes.map((karaoke) => [String(karaoke._id), karaoke])
  )

  return orders.map((order) => {
    const karaoke = karaokeMap.get(String(order.karaokeId || ""))
    const room = karaoke?.rooms?.find(
      (item) => String(item._id || "") === String(order.roomId || "")
    )

    return {
      ...order,
      karaokeName: karaoke?.name || "Booked karaoke",
      karaokeAddress: karaoke?.address || "",
      karaokeCity: karaoke?.city || "",
      karaokeImage: karaoke?.image || karaoke?.images?.[0] || "",
      roomName: room?.name || "",
      roomType: room?.type || "",
      roomPrice: room?.price ?? null,
      roomCapacity: room?.capacity ?? null,
      roomImage: room?.image || "",
    }
  })
}

export const getOrders: RequestHandler = async (req, res) => {
  try {
    const { userId } = getAuth(req)
    const { karaokeId, scope } = req.query

    if (scope === "my") {
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const orders = (await OrderModel.find({ userId })
        .sort({ createdAt: -1 })
        .lean()) as OrderRecord[]

      return res.status(200).json(await enrichOrders(orders))
    }

    if (karaokeId) {
      const orders = (await OrderModel.find({ karaokeId })
        .sort({ createdAt: -1 })
        .lean()) as OrderRecord[]

      return res.status(200).json(await enrichOrders(orders))
    }

    const orders = (await OrderModel.find({})
      .sort({ createdAt: -1 })
      .lean()) as OrderRecord[]

    return res.status(200).json(await enrichOrders(orders))
  } catch (error) {
    console.error("getOrders error:", error)
    return res.status(500).json({ message: "Failed to get orders" })
  }
}

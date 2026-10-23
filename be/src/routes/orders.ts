import { Router } from "express"
import { KaraokeModel } from "../models/Karaoke"
import { OrderModel } from "../models/Order"
import { findOwnedKaraoke, optionalUserId, userIdOf } from "../lib/auth"
import { fail, text, textList } from "../lib/http"

const router = Router()

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

async function enrich<T extends { karaokeId?: unknown; roomId?: string; bookingSlots?: string[] }>(orders: T[]) {
  const ids = [...new Set(orders.map((o) => String(o.karaokeId)))]
  const karaokes = await KaraokeModel.find({ _id: { $in: ids } })
    .select("name address city image images rooms")
    .lean()
  const byId = new Map(karaokes.map((k) => [String(k._id), k]))

  return orders.map((order) => {
    const karaoke = byId.get(String(order.karaokeId))
    const room = karaoke?.rooms?.find((r) => String(r._id) === order.roomId)
    return {
      ...order,
      bookingTime: (order.bookingSlots ?? []).join(", "),
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

// Guest or signed-in. Prices come from the karaoke, never from the client.
router.post("/", async (req, res) => {
  const body = req.body ?? {}
  const userId = optionalUserId(req)

  const customerName = text(body.customerName)
  const customerPhone = text(body.customerPhone)
  const bookingDate = text(body.bookingDate)
  const bookingSlots = [...new Set(textList(body.bookingSlots))]
  const guestCount = Math.max(1, Math.floor(Number(body.guestCount) || 1))

  if (!customerName || !customerPhone || !DATE_RE.test(bookingDate) || !bookingSlots.length) {
    fail(400, "Name, phone, date and at least one time slot are required")
  }

  const karaoke = await KaraokeModel.findById(String(body.karaokeId))
  if (!karaoke || !["approved", "pending"].includes(karaoke.approvalStatus ?? "")) fail(404, "Karaoke not found")
  const room = karaoke.rooms.id(String(body.roomId))
  if (!room || !room.isAvailable) fail(404, "Room not available")
  if (guestCount > room.capacity) fail(400, `This room fits up to ${room.capacity} guests`)

  const taken = await OrderModel.exists({
    karaokeId: karaoke._id,
    roomId: String(room._id),
    bookingDate,
    bookingSlots: { $in: bookingSlots },
    status: { $ne: "cancelled" },
  })
  if (taken) fail(409, "One of the selected time slots is already booked")

  const menuItems = (Array.isArray(body.menuItems) ? body.menuItems : []).flatMap((line: any) => {
    const item = karaoke.menu.id(String(line?.itemId))
    const quantity = Math.floor(Number(line?.quantity))
    return item && item.isAvailable && quantity > 0
      ? [{ itemId: String(item._id), name: item.name, price: item.price, quantity }]
      : []
  })

  const totalAmount =
    room.price * bookingSlots.length + menuItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0)

  const order = await OrderModel.create({
    userId,
    bookingType: userId ? "customer" : "guest",
    karaokeId: karaoke._id,
    roomId: String(room._id),
    customerName,
    customerPhone,
    bookingDate,
    bookingSlots,
    guestCount,
    menuItems,
    totalAmount,
  })

  res.status(201).json({ success: true, order })
})

// Public, anonymised: only what the map needs to show "free now".
router.get("/availability", async (req, res) => {
  const filter: Record<string, unknown> = { status: { $ne: "cancelled" } }
  if (req.query.karaokeId) filter.karaokeId = String(req.query.karaokeId)
  if (req.query.date) filter.bookingDate = String(req.query.date)
  res.json(await OrderModel.find(filter).select("karaokeId roomId bookingDate bookingSlots status -_id").lean())
})

// ?scope=my -> caller's bookings; ?karaokeId=… -> that karaoke's bookings (owner only).
router.get("/", async (req, res) => {
  if (req.query.scope === "my") {
    const orders = await OrderModel.find({ userId: userIdOf(req) }).sort({ createdAt: -1 }).lean()
    return res.json(await enrich(orders))
  }

  const karaoke = await findOwnedKaraoke(req, req.query.karaokeId)
  const orders = await OrderModel.find({ karaokeId: karaoke._id }).sort({ createdAt: -1 }).lean()
  res.json(await enrich(orders))
})

// Owner: confirm or cancel. Customer: cancel their own. Payment fields are Stripe-only.
router.put("/:id", async (req, res) => {
  const userId = userIdOf(req)
  const status = req.body?.status
  if (!["confirmed", "cancelled"].includes(status)) fail(400, "Status must be confirmed or cancelled")

  const order = (await OrderModel.findById(String(req.params.id))) ?? fail(404, "Order not found")
  const karaoke = await KaraokeModel.findById(order.karaokeId).select("ownerClerkUserId")
  const isOwner = karaoke?.ownerClerkUserId === userId
  const isBooker = order.userId === userId

  if (!isOwner && !(isBooker && status === "cancelled")) fail(403, "Not allowed")

  order.status = status
  await order.save()
  res.json(order)
})

export default router

import { Router } from "express"
import type { Request } from "express"
import type { HydratedDocument } from "mongoose"
import { KaraokeModel, type IKaraoke } from "../models/Karaoke"
import { ROOM_TYPES } from "../models/Room"
import { optionalUserId, requireAuth, requireOwner, userIdOf } from "../lib/auth"
import { fail, numberOrNull, pick, textList } from "../lib/http"
import { resolveOwnerKaraokes } from "../services/ownerReconciliation"

const router = Router()

const PUBLIC_STATUSES = ["approved", "pending"]

const KARAOKE_FIELDS = [
  "name", "ownerFullName", "email", "address", "city", "phone", "description",
  "openingHours", "openingTime", "closingTime", "roomTypes", "pricePerHour",
  "capacity", "amenities", "images", "rulesPolicies", "latitude", "longitude",
] as const
const ROOM_FIELDS = ["name", "type", "price", "capacity", "image", "isAvailable"] as const
const MENU_FIELDS = ["name", "category", "price", "description", "image", "isAvailable"] as const

// Owners may edit listing details, never ownership, approval or rating.
function karaokeUpdate(body: Record<string, unknown>) {
  const update: Record<string, unknown> = pick(
    { ...body, name: body.name ?? body.karaokeName, phone: body.phone ?? body.phoneNumber },
    KARAOKE_FIELDS
  )

  for (const key of ["amenities", "images", "roomTypes"] as const) {
    if (key in update) update[key] = textList(update[key])
  }
  for (const key of ["pricePerHour", "capacity", "latitude", "longitude"] as const) {
    if (key in update) update[key] = numberOrNull(update[key])
  }
  if (Array.isArray(update.images)) update.image = update.images[0] ?? null
  if (!update.openingHours && (update.openingTime || update.closingTime)) {
    update.openingHours = [update.openingTime, update.closingTime].filter(Boolean).join(" - ")
  }
  return update
}

const subdoc = <T>(list: { id(id: string): T | null }, id: unknown, what: string) =>
  list.id(String(id)) ?? fail(404, `${what} not found`)

const owned = (res: { locals: Record<string, any> }) => res.locals.karaoke as HydratedDocument<IKaraoke>

async function findPublic(req: Request) {
  const karaoke = await KaraokeModel.findById(String(req.params.id))
  const isOwner = karaoke && karaoke.ownerClerkUserId === optionalUserId(req)
  if (!karaoke || (!isOwner && !PUBLIC_STATUSES.includes(karaoke.approvalStatus ?? ""))) {
    fail(404, "Karaoke not found")
  }
  return karaoke
}

router.get("/", async (_req, res) => {
  const karaokes = await KaraokeModel.find({ approvalStatus: { $in: PUBLIC_STATUSES } }).sort({ createdAt: -1 })
  res.json({ karaokes })
})

router.get("/mine", requireAuth, async (req, res) => {
  const { karaokes } = await resolveOwnerKaraokes(userIdOf(req))
  if (!karaokes.length) fail(404, "Karaoke not found")
  res.json({ karaoke: karaokes[0], karaokes })
})

router.get("/:id", async (req, res) => {
  res.json({ karaoke: await findPublic(req) })
})

router.put("/:id", requireOwner, async (req, res) => {
  const karaoke = owned(res)
  karaoke.set(karaokeUpdate(req.body ?? {}))
  await karaoke.save()
  res.json({ karaoke })
})

router.delete("/:id", requireOwner, async (_req, res) => {
  await owned(res).deleteOne()
  res.json({ message: "Karaoke deleted" })
})

// Rooms
router.get("/:id/rooms", async (req, res) => {
  res.json((await findPublic(req)).rooms)
})

router.post("/:id/rooms", requireOwner, async (req, res) => {
  const karaoke = owned(res)
  const rooms = Array.isArray(req.body?.rooms) ? req.body.rooms : [req.body]
  for (const room of rooms) {
    if (!ROOM_TYPES.includes(room?.type)) fail(400, `Room type must be one of ${ROOM_TYPES.join(", ")}`)
    karaoke.rooms.push(pick(room, ROOM_FIELDS))
  }
  await karaoke.save()
  res.status(201).json(karaoke)
})

router.put("/:id/rooms/:roomId", requireOwner, async (req, res) => {
  const karaoke = owned(res)
  const room = subdoc(karaoke.rooms, req.params.roomId, "Room")
  room.set(pick(req.body ?? {}, ROOM_FIELDS))
  await karaoke.save()
  res.json(room)
})

router.delete("/:id/rooms/:roomId", requireOwner, async (req, res) => {
  const karaoke = owned(res)
  subdoc(karaoke.rooms, req.params.roomId, "Room").deleteOne()
  await karaoke.save()
  res.json({ message: "Room deleted" })
})

// Menu
router.get("/:id/menu", async (req, res) => {
  res.json((await findPublic(req)).menu)
})

router.post("/:id/menu", requireOwner, async (req, res) => {
  const karaoke = owned(res)
  karaoke.menu.push(pick(req.body ?? {}, MENU_FIELDS))
  await karaoke.save()
  res.status(201).json(karaoke.menu)
})

router.put("/:id/menu/:itemId", requireOwner, async (req, res) => {
  const karaoke = owned(res)
  const item = subdoc(karaoke.menu, req.params.itemId, "Item")
  item.set(pick(req.body ?? {}, MENU_FIELDS))
  await karaoke.save()
  res.json(item)
})

router.delete("/:id/menu/:itemId", requireOwner, async (req, res) => {
  const karaoke = owned(res)
  subdoc(karaoke.menu, req.params.itemId, "Item").deleteOne()
  await karaoke.save()
  res.json({ message: "Deleted" })
})

export default router

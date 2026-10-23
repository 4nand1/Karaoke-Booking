import { Router } from "express"
import { clerkClient } from "@clerk/express"
import Review from "../models/Review"
import { fullName, requireAuth, userIdOf } from "../lib/auth"
import { fail, text } from "../lib/http"

const router = Router()

router.get("/", async (req, res) => {
  const filter = req.query.karaokeId ? { karaokeId: String(req.query.karaokeId) } : {}
  res.json({ success: true, data: await Review.find(filter).sort({ createdAt: -1 }) })
})

// userId always comes from the session, never from the body.
router.post("/", requireAuth, async (req, res) => {
  const userId = userIdOf(req)
  const karaokeId = text(req.body?.karaokeId)
  const reviewText = text(req.body?.text)
  const rating = Number(req.body?.rating)
  if (!karaokeId || !reviewText || !(rating >= 1 && rating <= 5)) fail(400, "karaokeId, text and a rating of 1-5 are required")

  const name = text(req.body?.name) || fullName(await clerkClient.users.getUser(userId))
  const review = await Review.create({ name, karaokeId, rating, text: reviewText, userId })
  res.status(201).json({ success: true, data: review })
})

router.delete("/:id", requireAuth, async (req, res) => {
  const review = (await Review.findById(String(req.params.id))) ?? fail(404, "Review not found")
  if (review.userId !== userIdOf(req)) fail(403, "You can only delete your own reviews")
  await review.deleteOne()
  res.json({ success: true, message: "Review deleted successfully" })
})

export default router

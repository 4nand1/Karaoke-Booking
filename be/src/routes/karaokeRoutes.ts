import { Router } from "express"
import {
  createKaraoke,
  deleteKaraoke,
  getKaraoke,
  getKaraokeById,
  updateKaraoke,
} from "../controllers"
import { getKaraokeByOwner } from "../controllers/karaoke/getKaraokeByOwner"
import { RoomRouter } from "./roomRoutes"
import { MenuRouter } from "./menuRouter"
import { requireAuth, requireKaraokeAdmin } from "../middlewares/authMidlleware"

const KaraokeRouter = Router()

KaraokeRouter.get("/", getKaraoke)
KaraokeRouter.get("/mine", requireAuth, getKaraokeByOwner)
KaraokeRouter.use("/:id/rooms", RoomRouter)
KaraokeRouter.use("/:id/menu", MenuRouter)
KaraokeRouter.get("/:id", getKaraokeById)

KaraokeRouter.post("/", requireKaraokeAdmin, createKaraoke)
KaraokeRouter.put("/:id", requireKaraokeAdmin, updateKaraoke)
KaraokeRouter.delete("/:id", requireKaraokeAdmin, deleteKaraoke)

export { KaraokeRouter }
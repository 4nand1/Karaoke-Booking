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

const KaraokeRouter = Router()

KaraokeRouter.get("/", getKaraoke)
KaraokeRouter.get("/mine", getKaraokeByOwner)
KaraokeRouter.use("/:id/rooms", RoomRouter)
KaraokeRouter.use("/:id/menu", MenuRouter)
KaraokeRouter.get("/:id", getKaraokeById)
KaraokeRouter.post("/", createKaraoke)
KaraokeRouter.put("/:id", updateKaraoke)
KaraokeRouter.delete("/:id", deleteKaraoke)

export { KaraokeRouter }

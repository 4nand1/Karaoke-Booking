import { Router } from "express"
import {
  createKaraoke,
  deleteKaraoke,
  getKaraoke,
  getKaraokeById,
  updateKaraoke,
} from "../controllers"
import { getKaraokeByOwner } from "../controllers/karaoke/getKaraokeByOwner"

const KaraokeRouter = Router()

KaraokeRouter.get("/", getKaraoke)
KaraokeRouter.get("/mine", getKaraokeByOwner)
KaraokeRouter.get("/:id", getKaraokeById)
KaraokeRouter.post("/", createKaraoke)
KaraokeRouter.put("/:id", updateKaraoke)
KaraokeRouter.delete("/:id", deleteKaraoke)

export { KaraokeRouter }

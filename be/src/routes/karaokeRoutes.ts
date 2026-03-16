import { Router } from "express";
import {
  createKaraoke,
  deleteKaraoke,
  getKaraoke,
  updateKaraoke,
} from "../controllers";
import { getKaraokeByOwner } from "../controllers/karaoke/getKaraokeByOwner";

const KaraokeRouter = Router();

KaraokeRouter.get("/", getKaraoke);
KaraokeRouter.post("/", createKaraoke);
KaraokeRouter.put("/:id", updateKaraoke);
KaraokeRouter.delete("/:id", deleteKaraoke);
KaraokeRouter.get("/mine", getKaraokeByOwner);

export { KaraokeRouter };
import { Router } from "express";
import {
  createKaraoke,
  deleteKaraoke,
  getKaraoke,
  updateKaraoke,
} from "../controllers";

const KaraokeRouter = Router();

KaraokeRouter.get("/", getKaraoke);
KaraokeRouter.post("/", createKaraoke);
KaraokeRouter.put("/:id", updateKaraoke);
KaraokeRouter.delete("/:id", deleteKaraoke);

export { KaraokeRouter };
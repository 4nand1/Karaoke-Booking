import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karaoke";

export const createItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ items array эсвэл single object хоёуланг дэмж
    const newItem = req.body; // { name, category, price, ... }

    const karaoke = await KaraokeModel.findById(id);
    if (!karaoke) {
      res.status(404).json({ message: "Karaoke not found" });
      return;
    }

    karaoke.menu.push(newItem); // ✅ single item
    await karaoke.save();

    res.status(201).json(karaoke.menu);
  } catch (error) {
    console.error(error); // ← алдааг terminal дээр харахад нэмж өгөх
    res.status(500).json({ message: "Failed to add menu items" });
  }
};
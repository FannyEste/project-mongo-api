import express from "express";
import { NetflixTitle } from "../models/NetflixTitle.js";

const router = express.Router();

// 📌 Get all Netflix titles (with optional filters)
router.get("/", async (req, res) => {
  const { country, genre, year } = req.query;
  let query = {};

  if (country) query.country = new RegExp(country, "i"); // Case-insensitive search
  if (genre) query.genres = { $in: [new RegExp(genre, "i")] }; // Search in array
  if (year) query.release_year = Number(year);

  try {
    const titles = await NetflixTitle.find(query).limit(50);
    res.json(titles);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch data" });
  }
});

// 📌 Get a single Netflix title by ID
router.get("/:id", async (req, res) => {
  try {
    const title = await NetflixTitle.findById(req.params.id);
    if (!title) {
      return res.status(404).json({ error: "Title not found" });
    }
    res.json(title);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

export default router;
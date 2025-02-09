import express from "express";
import { NetflixTitle } from "../models/NetflixTitle.js";

const router = express.Router();

/**Fetch all Netflix titles with optional filters, pagination & sorting*/
router.get("/", async (req, res) => {
  const { country, genre, year, page = 1, limit = 10, sort } = req.query;
  let query = {};

  // Filtering options
  if (country) query.country = new RegExp(country, "i"); // Case-insensitive country search
  if (genre) query.genres = { $in: [new RegExp(genre, "i")] }; // Match genre inside array
  if (year) query.release_year = Number(year); // Convert year to number

  const options = {
    skip: (page - 1) * limit, // Pagination logic
    limit: Number(limit),
  };

  // Sorting options
  if (sort === "asc") options.sort = { title: 1 }; // Sort A-Z
  if (sort === "desc") options.sort = { title: -1 }; // Sort Z-A

  try {
    const titles = await NetflixTitle.find(query, null, options);
    const totalCount = await NetflixTitle.countDocuments(query);

    res.json({
      totalResults: totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      results: titles,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch data" });
  }
});

/* Fetch a single Netflix title by ID*/
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

/** Get Netflix genre statistics (count of titles per genre)*/
router.get("/stats/genres", async (req, res) => {
  try {
    const stats = await NetflixTitle.aggregate([
      { $unwind: "$genres" }, // Splits multiple genres into separate entries
      { $group: { _id: "$genres", count: { $sum: 1 } } }, // Count occurrences per genre
      { $sort: { count: -1 } } // Sort by most common genres
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch genre statistics" });
  }
});

export default router;
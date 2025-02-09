import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import netflixData from "./data/netflix-titles.json";
import { NetflixTitle } from "./models/NetflixTitle.js";
import netflixRoutes from "./routes/netflixRoutes.js";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

// Database Seeding
if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    console.log("⏳ Resetting database...");

    try {
      await NetflixTitle.deleteMany({}); // Clear existing data

      // Transform "listed_in" into "genres" (array instead of string)
      const formattedData = netflixData.map((item) => ({
        show_id: item.show_id,
        title: item.title,
        director: item.director,
        cast: item.cast ? item.cast.split(", ") : [], // Convert string to array
        country: item.country,
        date_added: item.date_added,
        release_year: item.release_year,
        rating: item.rating,
        duration: item.duration,
        genres: item.listed_in ? item.listed_in.split(", ") : [], // Convert string to array
        description: item.description,
        type: item.type
      }));

      // Insert the formatted data
      const insertedMovies = await NetflixTitle.insertMany(formattedData);
      console.log(` Database seeded successfully! ${insertedMovies.length} movies added.`);
    } catch (error) {
      console.error(" Error seeding database:", error);
    }
  };

  seedDatabase();
}

//  Middleware
app.use(cors());
app.use(express.json());

// API Documentation
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Netflix API!",
    endpoints: {
      allTitles: "/netflix",
      singleTitle: "/netflix/:id",
      filterByCountry: "/netflix?country=Sweden",
      filterByGenre: "/netflix?genre=Comedy",
      filterByYear: "/netflix?year=2020",
    },
  });
});

// Use Routes
app.use("/netflix", netflixRoutes);

// Start the Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
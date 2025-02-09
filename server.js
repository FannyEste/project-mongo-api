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

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await NetflixTitle.deleteMany({});
    await NetflixTitle.insertMany(netflixData);
    console.log("Database has been seeded!");
  };

  seedDatabase();
}

// Middleware
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
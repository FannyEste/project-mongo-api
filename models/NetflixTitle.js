import mongoose from "mongoose";

const NetflixTitleSchema = new mongoose.Schema({
  title: String,
  director: String,
  cast: [String],
  country: String,
  date_added: String,
  release_year: Number,
  rating: String,
  duration: String,
  genres: [String],
  description: String,
});

export const NetflixTitle = mongoose.model("NetflixTitle", NetflixTitleSchema);
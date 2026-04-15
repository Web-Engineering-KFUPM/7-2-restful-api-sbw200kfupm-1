import express from "express";
import cors from "cors";

// import dotenv and load environment variables from .env
import dotenv from "dotenv";    
dotenv.config();

import { connectDB } from "./db.js";
import { Song } from "./models/song.model.js";

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());              
app.use(express.json());

await connectDB(process.env.MONGO_URL);

// api/songs (Read all songs)
app.get("/api/songs", async (_req, res) => {
  const rows = await Song.find().sort({ createdAt: -1 });
  res.json(rows);
});

// api/songs (Insert song)
app.post("/api/songs", async (req, res) => {
  try {
    const { title = "", artist = "", year } = req.body || {};
    const created = await Song.create({
      title: title.trim(),
      artist: artist.trim(),
      year,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create song" });
  }
});


// /api/songs/:id (Update song)
app.put("/api/songs/:id", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (typeof payload.title === "string") payload.title = payload.title.trim();
    if (typeof payload.artist === "string") payload.artist = payload.artist.trim();

    const updated = await Song.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updated) return res.status(404).json({ message: "Song not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update song" });
  }
});

// /api/songs/:id (Delete song)
app.delete("/api/songs/:id", async (req, res) => {
  try {
    const deleted = await Song.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Song not found" });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to delete song" });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
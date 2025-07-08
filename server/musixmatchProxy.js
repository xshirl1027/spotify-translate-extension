import express from "express";
import dotenv from "dotenv";
dotenv.config();

/**
 * Simple Express server to proxy Musixmatch API requests
 * This avoids CORS issues by letting your frontend call your own backend,
 * which then calls Musixmatch.
 */

const app = express();
const PORT = process.env.PORT || 4000;
const MUSIXMATCH_API_KEY =
  process.env.MUSIXMATCH_API_KEY || "b04f6e8f37cca67c1054c0ec6d4232df";

// Endpoint: /api/musixmatch/subtitles?track=...&artist=...
app.get("/api/musixmatch/subtitles", async (req, res) => {
  const { track, artist } = req.query;
  if (!track || !artist) {
    return res.status(400).json({ error: "Missing track or artist parameter" });
  }

  try {
    // 1. Get track_id
    const searchUrl = `https://api.musixmatch.com/ws/1.1/track.search?q_track=${encodeURIComponent(
      track
    )}&q_artist=${encodeURIComponent(
      artist
    )}&apikey=${MUSIXMATCH_API_KEY}&f_has_subtitle=1&page_size=1`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const trackList = searchData.message.body.track_list;
    if (!trackList || trackList.length === 0) {
      return res.status(404).json({ error: "Track not found" });
    }
    const track_id = trackList[0].track.track_id;

    // 2. Get subtitles
    const subtitleUrl = `https://api.musixmatch.com/ws/1.1/track.subtitles.get?track_id=${track_id}&apikey=${MUSIXMATCH_API_KEY}`;
    const subtitleRes = await fetch(subtitleUrl);
    const subtitleData = await subtitleRes.json();
    const subtitles = subtitleData.message.body.subtitle;

    if (!subtitles) {
      return res.status(404).json({ error: "Subtitles not found" });
    }

    res.json({ subtitles });
  } catch (error) {
    console.error("Musixmatch proxy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Musixmatch proxy server running on port ${PORT}`);
});

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Allow all origins for the proxy (or restrict to your domain)
app.use(cors());

// Middleware to forward requests
app.use("/proxy", async (req, res) => {
  try {
    // Extract the target URL from query params (e.g., /proxy?url=https://api.musixmatch.com/...)
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ error: "Missing target URL" });
    }

    // Forward headers (optional but useful for APIs that check User-Agent, etc.)
    const headers = {
      ...req.headers,
      host: new URL(targetUrl).host, // Override host to avoid blocking
      origin: null, // Remove origin to avoid CORS issues on the target server
      referer: null,
    };

    // Make the request to the target API
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers,
      params: req.query,
      data: req.body,
    });

    // Send back the API response
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).json({ error: "Proxy failed" });
  }
});

// Handle OPTIONS requests (for preflight)
app.options("/proxy", cors());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CORS Proxy running on port ${PORT}`));


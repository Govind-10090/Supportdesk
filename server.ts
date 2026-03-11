import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API Debugger Proxy (Needs to stay on server to bypass CORS)
app.post("/api/debug", async (req, res) => {
  const { url, method, headers, body } = req.body;
  const startTime = Date.now();
  try {
    const response = await axios({
      url,
      method,
      headers,
      data: body,
      validateStatus: () => true
    });
    const duration = Date.now() - startTime;
    res.json({
      status: response.status,
      data: response.data,
      headers: response.headers,
      duration
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite integration
let vite: any;
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      if (req.path.startsWith('/api')) return; 
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
}

setupVite();

export default app;

if (process.env.NODE_ENV !== 'production' && import.meta.url === `file://${process.argv[1]}`) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

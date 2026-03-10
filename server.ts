import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("supportdesk.db");
const JWT_SECRET = process.env.JWT_SECRET || "support-desk-secret-key-123";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('customer', 'engineer', 'admin')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    status TEXT CHECK(status IN ('open', 'investigating', 'pending', 'resolved')) DEFAULT 'open',
    product_module TEXT,
    customer_id INTEGER NOT NULL,
    assigned_to INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES users(id),
    FOREIGN KEY(assigned_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "System Admin",
    "admin@supportdesk.com",
    hashedPassword,
    "admin"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role = "customer" } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
        name, email, hashedPassword, role
      );
      res.json({ id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Ticket Routes
  app.get("/api/tickets", authenticate, (req: any, res) => {
    let tickets;
    if (req.user.role === "customer") {
      tickets = db.prepare(`
        SELECT t.*, u.name as customer_name, e.name as engineer_name 
        FROM tickets t 
        JOIN users u ON t.customer_id = u.id 
        LEFT JOIN users e ON t.assigned_to = e.id 
        WHERE t.customer_id = ?
        ORDER BY t.created_at DESC
      `).all(req.user.id);
    } else {
      tickets = db.prepare(`
        SELECT t.*, u.name as customer_name, e.name as engineer_name 
        FROM tickets t 
        JOIN users u ON t.customer_id = u.id 
        LEFT JOIN users e ON t.assigned_to = e.id 
        ORDER BY t.created_at DESC
      `).all();
    }
    res.json(tickets);
  });

  app.get("/api/tickets/:id", authenticate, (req, res) => {
    const ticket = db.prepare(`
      SELECT t.*, u.name as customer_name, e.name as engineer_name 
      FROM tickets t 
      JOIN users u ON t.customer_id = u.id 
      LEFT JOIN users e ON t.assigned_to = e.id 
      WHERE t.id = ?
    `).get(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    const comments = db.prepare(`
      SELECT c.*, u.name as user_name, u.role as user_role 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.ticket_id = ? 
      ORDER BY c.created_at ASC
    `).all(req.params.id);
    
    res.json({ ...ticket, comments });
  });

  app.post("/api/tickets", authenticate, (req: any, res) => {
    const { title, description, category, priority, product_module } = req.body;
    const result = db.prepare(`
      INSERT INTO tickets (title, description, category, priority, product_module, customer_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description, category, priority, product_module, req.user.id);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/tickets/:id", authenticate, (req: any, res) => {
    const { status, assigned_to } = req.body;
    const updates = [];
    const params = [];
    if (status) { updates.push("status = ?"); params.push(status); }
    if (assigned_to !== undefined) { updates.push("assigned_to = ?"); params.push(assigned_to); }
    params.push(req.params.id);
    
    db.prepare(`UPDATE tickets SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
    res.json({ success: true });
  });

  app.post("/api/tickets/:id/comments", authenticate, (req: any, res) => {
    const { content } = req.body;
    db.prepare("INSERT INTO comments (ticket_id, user_id, content) VALUES (?, ?, ?)").run(
      req.params.id, req.user.id, content
    );
    res.json({ success: true });
  });

  // Knowledge Base Routes
  app.get("/api/kb", (req, res) => {
    const articles = db.prepare(`
      SELECT k.*, u.name as author_name 
      FROM knowledge_base k 
      JOIN users u ON k.author_id = u.id 
      ORDER BY k.created_at DESC
    `).all();
    res.json(articles);
  });

  app.post("/api/kb", authenticate, authorize(["engineer", "admin"]), (req: any, res) => {
    const { title, content, category } = req.body;
    db.prepare("INSERT INTO knowledge_base (title, content, category, author_id) VALUES (?, ?, ?, ?)").run(
      title, content, category, req.user.id
    );
    res.json({ success: true });
  });

  // API Debugger Proxy
  app.post("/api/debug", authenticate, authorize(["engineer", "admin"]), async (req, res) => {
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

  // Log Routes
  app.get("/api/logs", authenticate, authorize(["engineer", "admin"]), (req, res) => {
    const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100").all();
    res.json(logs);
  });

  app.post("/api/logs", authenticate, (req, res) => {
    const { severity, message, stack_trace } = req.body;
    db.prepare("INSERT INTO logs (severity, message, stack_trace) VALUES (?, ?, ?)").run(
      severity, message, stack_trace
    );
    res.json({ success: true });
  });

  // Admin Analytics
  app.get("/api/admin/stats", authenticate, authorize(["admin"]), (req, res) => {
    const totalTickets = db.prepare("SELECT COUNT(*) as count FROM tickets").get() as any;
    const statusCounts = db.prepare("SELECT status, COUNT(*) as count FROM tickets GROUP BY status").all();
    const categoryCounts = db.prepare("SELECT category, COUNT(*) as count FROM tickets GROUP BY category").all();
    const engineerWorkload = db.prepare(`
      SELECT u.name, COUNT(t.id) as ticket_count 
      FROM users u 
      LEFT JOIN tickets t ON u.id = t.assigned_to 
      WHERE u.role = 'engineer' 
      GROUP BY u.id
    `).all();

    res.json({
      totalTickets: totalTickets.count,
      statusCounts,
      categoryCounts,
      engineerWorkload
    });
  });

  // Admin DB Management
  app.get("/api/admin/db/:collection", authenticate, authorize(["admin"]), (req, res) => {
    const { collection } = req.params;
    const allowed = ["users", "tickets", "comments", "knowledge_base", "logs"];
    if (!allowed.includes(collection)) return res.status(400).json({ error: "Invalid collection" });
    const data = db.prepare(`SELECT * FROM ${collection}`).all();
    res.json(data);
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

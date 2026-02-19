const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "db_not_ready" });
  }
});

app.get("/tasks", async (_req, res) => {
  const r = await pool.query("SELECT id, title, done FROM tasks ORDER BY id DESC");
  res.json(r.rows);
});

app.post("/tasks", async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) return res.status(400).json({ error: "title_required" });

  const r = await pool.query(
    "INSERT INTO tasks(title, done) VALUES ($1, false) RETURNING id, title, done",
    [title]
  );
  res.status(201).json(r.rows[0]);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`backend on ${port}`));

app.put("/tasks/:id/toggle", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });

  const r = await pool.query(
    "UPDATE tasks SET done = NOT done WHERE id = $1 RETURNING id, title, done",
    [id]
  );
  if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });

  res.json(r.rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });

  const r = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
  if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });

  res.status(204).send();
});

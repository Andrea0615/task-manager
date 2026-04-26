const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error retrieving tasks" });
  }
});

// POST a new task
app.post("/api/tasks", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const [result] = await db.query("INSERT INTO tasks (title) VALUES (?)", [
      title,
    ]);
    res.status(201).json({ id: result.insertId, title, completed: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error creating task" });
  }
});

// DELETE a task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error deleting task" });
  }
});

// PUT to toggle completion status
app.put("/api/tasks/:id/toggle", async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch current status
    const [rows] = await db.query("SELECT completed FROM tasks WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Task not found" });

    const newStatus = rows[0].completed ? 0 : 1;
    await db.query("UPDATE tasks SET completed = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    res.json({ id, completed: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error updating task" });
  }
});

module.exports = app;

import { useEffect, useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    const r = await fetch("/api/tasks");
    if (!r.ok) throw new Error("Nu pot încărca task-urile");
    setTasks(await r.json());
  }

  async function addTask(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    setErr("");
    const r = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t }),
    });
    if (!r.ok) throw new Error("Nu pot adăuga task");
    setTitle("");
    await loadTasks();
  }

  async function toggleTask(id) {
    setErr("");
    const r = await fetch(`/api/tasks/${id}/toggle`, { method: "PUT" });
    if (!r.ok) throw new Error("Nu pot modifica task-ul");
    await loadTasks();
  }

  async function deleteTask(id) {
    setErr("");
    const r = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!r.ok && r.status !== 204) throw new Error("Nu pot șterge task-ul");
    await loadTasks();
  }

  useEffect(() => {
    (async () => {
      try {
        await loadTasks();
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>TaskBoard</h1>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Scrie un task..."
          style={{ flex: 1, padding: 10 }}
        />
        <button style={{ padding: "10px 14px" }}>Add</button>
      </form>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p style={{ marginTop: 16 }}>No tasks yet.</p>
      ) : (
        <ul style={{ paddingLeft: 0, marginTop: 16, listStyle: "none" }}>
          {tasks.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
                {t.title}
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toggleTask(t.id)}>
                  {t.done ? "Undo" : "Done"}
                </button>
                <button onClick={() => deleteTask(t.id)} style={{ color: "crimson" }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = 3000;
const DATA_FILE = "data.json";

app.use(cors());
app.use(express.json());

// Ensure data.json exists
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

// GET all projects
app.get("/projects", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  res.json(data);
});

// POST new project
app.post("/projects", (req, res) => {
  const { project, parts } = req.body;
  if (!project || !Array.isArray(parts)) {
    return res.status(400).json({ error: "Project and parts required" });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const newProject = { id: Date.now(), project, parts };
  data.push(newProject);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.status(201).json(newProject);
});

app.post("/projects/:id/parts", (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  if (!name || typeof price !== "number") {
    return res.status(400).json({ error: "Name and price required" });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const project = data.find((p) => p.id === parseInt(id));

  if (!project) return res.status(404).json({ error: "Project not found" });

  // Add the new part as [name, price]
  if (!Array.isArray(project.parts)) project.parts = [];
  project.parts.push([name, price]);

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.status(201).json({ name, price });
});

// DELETE /projects/:projectId/parts/:partIndex
app.delete("/projects/:projectId/parts/:partIndex", (req, res) => {
  const { projectId, partIndex } = req.params;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  const project = data.find((p) => p.id === parseInt(projectId));
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (!Array.isArray(project.parts) || !project.parts[partIndex])
    return res.status(404).json({ error: "Part not found" });

  project.parts.splice(Number(partIndex), 1); // remove the part
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.status(200).json({ success: true });
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
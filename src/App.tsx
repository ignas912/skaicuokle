import { useState } from "react";
import "./App.css";
import { Plus, Eye, X } from "lucide-react";
import AddProject from "./AddProject";
import AddPartModule from "./AddPartModule";

interface Project {
  id: number;
  project: string;
  parts: [string, number][];
}

function App() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects from backend
const fetchProjects = async () => {
  try {
    const res = await fetch("http://localhost:3000/projects");
    const data: Project[] = (await res.json()).map((p: Project) => ({
      ...p,
      parts: p.parts || [],
    }));
    setProjects(data);

    // Keep selectedProject in sync
    if (selectedProject) {
      const updated = data.find((p) => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  } catch (err) {
    console.error(err);
  }
};

  // Handler for adding a part to an existing project
  const handlePartAdded = () => {
    fetchProjects(); // Refresh list and selected project
  };

  fetchProjects(); // Initial fetch on component mount
  return (
    <>
      <div className="first-left">
        <div className="controls">
          <div className="btn" onClick={() => setShowModal(true)}>
            <Plus />
          </div>
        </div>

        <div className="list">
          {projects.map((item) => (
            <div key={item.id} className="card">
              <span>{item.project}</span>
              <div className="view-btn" onClick={() => setSelectedProject(item)}>
                <Eye />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div className="second-left">
          <div className="top-bar">
            <span className="title">
              {selectedProject.project}{" "}
              <div className="price">
                {selectedProject.parts.reduce((sum, part) => sum + part[1], 0)}€
              </div>
            </span>

            {/* Add Part Module */}
            <AddPartModule
              projectId={selectedProject.id}
              onPartAdded={handlePartAdded}
            />
          </div>

<div className="parts-list">
  {selectedProject.parts.map((part, idx) => (
    <div key={idx} className="part">
      <div className="part-info">
        <span>{part[0]}</span>
        <span>{part[1]}€</span>
      </div>
      <button
        className="remove-part-btn"
        onClick={async () => {
          try {
            const response = await fetch(
              `http://localhost:3000/projects/${selectedProject.id}/parts/${idx}`,
              { method: "DELETE" }
            );
            if (!response.ok) throw new Error("Failed to remove part");
            fetchProjects();
          } catch (err) {
            console.error(err);
          }
        }}
      >
        <X />
      </button>
    </div>
  ))}
</div>
        </div>
      )}

      {showModal && (
        <AddProject
          onClose={() => setShowModal(false)}
          onUserAdded={fetchProjects} // refresh list after adding
        />
      )}
    </>
  );
}

export default App;
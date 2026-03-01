import { useState, useEffect } from "react";
import "./App.css";
import { Plus, Eye, X } from "lucide-react";
import AddProject from "./AddProject";
import AddPartModule from "./AddPartModule";
import { supabase } from "./supabaseClient";

interface Project {
  id: number;
  project: string;
  parts: [string, number][];
}

// Supabase helper functions
async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*");
  if (error) throw error;
  return (data || []).map((p: any) => ({
    ...p,
    parts: p.parts || [],
  }));
}

async function deletePart(projectId: number, partIndex: number) {
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("parts")
    .eq("id", projectId)
    .single();
  if (fetchError) throw fetchError;

  const newParts = project.parts.filter((_: any, i: number) => i !== partIndex);

  const { error } = await supabase
    .from("projects")
    .update({ parts: newParts })
    .eq("id", projectId);
  if (error) throw error;
}

function App() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      const data = await getProjects();
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

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handler for adding a part to an existing project
  const handlePartAdded = () => {
    fetchProjects(); // Refresh list and selected project
  };

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
                      await deletePart(selectedProject.id, idx);
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
import { useState, useEffect } from "react";
import "./App.css";
import { Plus, Eye, X, LogOut, User } from "lucide-react";
import AddProject from "./AddProject";
import AddPartModule from "./AddPartModule";
import { supabase } from "./supabaseClient";

interface Project {
  id: number;
  project: string;
  parts: [string, number][];
}

// Helper function to format prices consistently (best practice for future)
const formatPrice = (price: number): string => {
  // Round to 2 decimal places to avoid floating point issues
  return (Math.round(price * 100) / 100).toFixed(2);
};

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if admin is already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      // Ensure all prices are properly rounded when fetching
      const cleanedData = data.map(project => ({
        ...project,
        parts: project.parts.map(part => [
          part[0],
          Math.round(part[1] * 100) / 100 // Round to 2 decimals
        ] as [string, number])
      }));
      setProjects(cleanedData);

      // Keep selectedProject in sync with rounded values
      if (selectedProject) {
        const updated = cleanedData.find((p) => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated as Project);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProjects();
    }
  }, [isLoggedIn]);

  // Handler for adding a part to an existing project
  const handlePartAdded = () => {
    fetchProjects(); // Refresh list and selected project
  };

  // Handle admin login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check credentials against the admin table
      const { data, error } = await supabase
        .from("admin")
        .select("username, password")
        .eq("id", 1)
        .single();

      if (error) throw error;

      if (data && data.username === username && data.password === password) {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
      } else {
        setError("Neteisingas vartotojo vardas arba slaptažodis");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle admin logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedProject(null);
    localStorage.removeItem("isLoggedIn");
    setUsername("");
    setPassword("");
  };

  // Calculate total with proper formatting
  const calculateTotal = (parts: [string, number][]): string => {
    const total = parts.reduce((sum, part) => sum + part[1], 0);
    return formatPrice(total);
  };

  // If not logged in, show admin login form
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Projektų Valdymas</h1>
          <p className="login-subtitle">Administratoriaus prisijungimas</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Vartotojo vardas"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Slaptažodis"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? "Prisijungiama..." : "Prisijungti"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main app (when admin is logged in)
  return (
    <>
      <div className="first-left">
        <div className="controls">
          <div className="btn" onClick={() => setShowModal(true)}>
            <Plus />
          </div>
          <button className="logout-btn-small" onClick={handleLogout}>
            <LogOut size={16} />
            Atsijungti
          </button>
        </div>

        <div className="list">
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>Dar nėra projektų. Paspauskite + kad sukurtumėte pirmą projektą!</p>
            </div>
          ) : (
            projects.map((item) => (
              <div key={item.id} className="card">
                <span>{item.project}</span>
                <div className="view-btn" onClick={() => setSelectedProject(item)}>
                  <Eye />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedProject && (
        <div className="second-left">
          <div className="top-bar">
            <span className="title">
              {selectedProject.project}{" "}
              <div className="price">
                {calculateTotal(selectedProject.parts)}€
              </div>
            </span>

            {/* Add Part Module */}
            <AddPartModule
              projectId={selectedProject.id}
              onPartAdded={handlePartAdded}
            />
          </div>

          <div className="parts-list">
            {selectedProject.parts.length === 0 ? (
              <div className="empty-state">
                <p>Dar nėra dalių. Pridėkite pirmą dalį!</p>
              </div>
            ) : (
              selectedProject.parts.map((part, idx) => (
                <div key={idx} className="part">
                  <div className="part-info">
                    <span>{part[0]}</span>
                    <span>{formatPrice(part[1])}€</span>
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
              ))
            )}
          </div>
        </div>
      )}

      {showModal && (
        <AddProject
          onClose={() => setShowModal(false)}
          onUserAdded={fetchProjects}
        />
      )}
    </>
  );
}

export default App;
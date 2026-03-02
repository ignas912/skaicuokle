import { useState } from "react";
import { supabase } from "./supabaseClient";
import { X } from "lucide-react";

interface AddProjectProps {
  onClose: () => void;
  onUserAdded: () => void;
}

export default function AddProject({ onClose, onUserAdded }: AddProjectProps) {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("projects")
        .insert([{ project: projectName, parts: [] }]);

      if (error) throw error;

      onUserAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Naujas Projektas</h2>
          <button className="close-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="projectName">Projekto pavadinimas</label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              disabled={loading}
              placeholder="Įveskite projekto pavadinimą"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Atšaukti
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Kuriama..." : "Sukurti projektą"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
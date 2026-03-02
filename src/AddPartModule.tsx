import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Plus, X, Check } from "lucide-react";

export interface Part {
  name: string;
  price: number;
}

interface AddPartModuleProps {
  projectId: number;
  onPartAdded?: () => void;
}

const AddPartModule: React.FC<AddPartModuleProps> = ({ projectId, onPartAdded }) => {
  const [partName, setPartName] = useState("");
  const [partPrice, setPartPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddPart = async () => {
    if (!partName.trim() || !partPrice.trim()) {
      setError("Užpildykite visus laukus");
      return;
    }

    const price = parseFloat(partPrice);
    if (isNaN(price) || price <= 0) {
      setError("Įveskite teisingą sumą");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Fetch current project parts
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("parts")
        .eq("id", projectId)
        .single();
      
      if (fetchError) throw fetchError;

      // 2️⃣ Add new part to parts array
      const newParts = [...(project.parts || []), [partName.trim(), price]];

      // 3️⃣ Update project in Supabase
      const { error: updateError } = await supabase
        .from("projects")
        .update({ parts: newParts })
        .eq("id", projectId);
      
      if (updateError) throw updateError;

      // 4️⃣ Reset input fields
      setPartName("");
      setPartPrice("");
      setIsAdding(false);

      // 5️⃣ Notify parent to refresh
      onPartAdded?.();
    } catch (err) {
      console.error(err);
      setError("Nepavyko pridėti dalies");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setPartName("");
    setPartPrice("");
    setError("");
  };

  if (!isAdding) {
    return (
      <button 
        className="add-part-trigger" 
        onClick={() => setIsAdding(true)}
        title="Pridėti naują dalį"
      >
        <Plus size={18} />
        <span>Pridėti dalį</span>
      </button>
    );
  }

  return (
    <div className="add-part-module-expanded">
      <div className="add-part-header">
        <h4>Pridėti naują dalį</h4>
        <button className="close-btn" onClick={handleCancel} title="Uždaryti">
          <X size={16} />
        </button>
      </div>
      
      {error && <div className="error-message-small">{error}</div>}
      
      <div className="add-part-form">
        <div className="form-row">
          <div className="input-wrapper">
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="Pavadinimas..."
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="input-wrapper price-input">
            <input
              type="number"
              value={partPrice}
              onChange={(e) => setPartPrice(e.target.value)}
              placeholder="Suma"
              min="0.01"
              step="0.01"
              disabled={loading}
            />
            <span className="currency">€</span>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn-small" 
            onClick={handleCancel}
            disabled={loading}
          >
            Atšaukti
          </button>
          <button 
            type="button" 
            className="save-btn-small" 
            onClick={handleAddPart}
            disabled={loading || !partName.trim() || !partPrice.trim()}
          >
            {loading ? (
              "Išsaugoma..."
            ) : (
              <>
                <Check size={16} />
                Išsaugoti
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPartModule;
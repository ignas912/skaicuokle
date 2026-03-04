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

// Helper function to format price (keeping it consistent with main app)
const formatPriceForStorage = (price: number): number => {
  // Round to 2 decimal places to avoid floating point issues
  return Math.round(price * 100) / 100;
};

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

    // Round the price to 2 decimal places before saving
    const roundedPrice = formatPriceForStorage(price);

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

      // 2️⃣ Add new part to parts array with rounded price
      const newParts = [...(project.parts || []), [partName.trim(), roundedPrice]];

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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid number
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPartPrice(value);
    }
  };

  const handlePriceBlur = () => {
    if (partPrice) {
      const numPrice = parseFloat(partPrice);
      if (!isNaN(numPrice)) {
        // Format to 2 decimal places when input loses focus
        setPartPrice(numPrice.toFixed(2));
      }
    }
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
              type="text"
              inputMode="decimal"
              value={partPrice}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              placeholder="0.00"
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
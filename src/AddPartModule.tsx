import { useState } from "react";
import { supabase } from "./supabaseClient";

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

  const handleAddPart = async () => {
    if (!partName.trim() || !partPrice.trim()) return;

    const price = parseFloat(partPrice);
    if (isNaN(price)) return;

    try {
      // 1️⃣ Fetch current project parts
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("parts")
        .eq("id", projectId)
        .single();
      if (fetchError) throw fetchError;

      // 2️⃣ Add new part to parts array
      const newParts = [...project.parts, [partName.trim(), price]];

      // 3️⃣ Update project in Supabase
      const { error: updateError } = await supabase
        .from("projects")
        .update({ parts: newParts })
        .eq("id", projectId);
      if (updateError) throw updateError;

      // 4️⃣ Reset input fields
      setPartName("");
      setPartPrice("");

      // 5️⃣ Notify parent to refresh
      onPartAdded?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="add-part-module">
      <input
        type="text"
        value={partName}
        onChange={(e) => setPartName(e.target.value)}
        placeholder="Pavadinimas..."
      />
      <input
        type="number"
        value={partPrice}
        onChange={(e) => setPartPrice(e.target.value)}
        placeholder="Sūma..."
        min="0"
        step="0.01"
      />
      <button type="button" onClick={handleAddPart}>
        Pridėti
      </button>
    </div>
  );
};

export default AddPartModule;
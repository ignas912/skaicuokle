import { useState } from "react";

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
      await fetch(`http://localhost:3000/projects/${projectId}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: partName.trim(), price }),
      });

      setPartName("");
      setPartPrice("");

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
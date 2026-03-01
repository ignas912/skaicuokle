import { useState } from "react";

interface Part {
  name: string;
  price: number;
}

interface AddProjectModalProps {
  onClose: () => void;
  onUserAdded?: () => void;
}

const AddProject: React.FC<AddProjectModalProps> = ({ onClose, onUserAdded }) => {
  const [projectName, setProjectName] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [newPartName, setNewPartName] = useState("");
  const [newPartPrice, setNewPartPrice] = useState("");

  const handleAddPart = () => {
    if (!newPartName.trim() || !newPartPrice.trim()) return;
    const price = parseFloat(newPartPrice);
    if (isNaN(price)) return;
    setParts((prev) => [...prev, { name: newPartName.trim(), price }]);
    setNewPartName("");
    setNewPartPrice("");
  };

  const handleRemovePart = (index: number) => {
    setParts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) return;

    try {
      await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectName,
          parts: parts.map((p) => [p.name, p.price]),
        }),
      });

      setProjectName("");
      setParts([]);
      setNewPartName("");
      setNewPartPrice("");
      onUserAdded?.();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Projektas pridejimas</h3>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Pavadinimas..."
        />

        <h4>Dalys</h4>
        <div className="parts-input">
          <input
            type="text"
            value={newPartName}
            onChange={(e) => setNewPartName(e.target.value)}
            placeholder="Pavadinimas..."
          />
          <input
            type="number"
            value={newPartPrice}
            onChange={(e) => setNewPartPrice(e.target.value)}
            placeholder="Sūma..."
            min="0"
            step="0.01"
          />
          <button type="button" onClick={handleAddPart}>
            Pridėti
          </button>
        </div>

        {parts.length > 0 && (
          <ul>
            {parts.map((p, idx) => (
              <li key={idx}>
                {p.name} – €{p.price.toFixed(2)}
                <button type="button" onClick={() => handleRemovePart(idx)}>
                  Pašalinti
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="buttons">
          <button type="button" onClick={handleSubmit}>
            Pridėti
          </button>
          <button type="button" onClick={onClose}>
            Atšaukti
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
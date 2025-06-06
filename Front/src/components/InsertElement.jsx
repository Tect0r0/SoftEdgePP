import React, { useState, useEffect } from "react";
import "../css/InsertElement.css";

const InsertElement = ({ onClose, projectId, setSuccessMessage, setError, onInsert }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState({
    type: "HU",
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  useEffect(() => {
    const fetchGeneratedId = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}/generate-id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ type: formData.type }),
        });

        if (!response.ok) {
          throw new Error("Error al generar el ID del elemento.");
        }

        const { id } = await response.json();
        setGeneratedId(id);
      } catch (error) {
        setError("Error al generar el ID del elemento.");
      }
    };

    fetchGeneratedId();
  }, [formData.type, projectId, setError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validTypes = ["EP", "RF", "RNF", "HU"];
      if (!validTypes.includes(formData.type)) {
        throw new Error("Tipo de elemento inválido.");
      }
      if (!formData.title || !formData.description) {
        throw new Error("Título y descripción son obligatorios.");
      }

      await onInsert({
        type: formData.type,
        title: formData.title,
        description: formData.description,
      });
      setSuccessMessage("Elemento añadido correctamente!");
      onClose();
    } catch (error) {
      setError(error.message || "Error al añadir el elemento. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <h3>Añadir Nuevo Elemento</h3>
        <form onSubmit={handleSubmit} className="insert-element-form">
          <label>
            ID del Elemento:
            <input
              type="text"
              value={generatedId}
              readOnly
              className="readonly-input"
            />
          </label>
          <label>
            Tipo de Elemento:
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="HU">Historia de Usuario</option>
              <option value="RF">Requerimiento Funcional</option>
              <option value="RNF">Requerimiento No Funcional</option>
              <option value="EP">Épica</option>
            </select>
          </label>
          <label>
            Título:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </label>
          <label>
            Descripción:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </label>
          <button type="submit" className="popup-button primary" disabled={loading}>
            {loading ? "Añadiendo..." : "Añadir Elemento"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InsertElement;

import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditBoxes.css";

const EditBoxes = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]); // Lista de seções com boxes
  const [newSectionTitle, setNewSectionTitle] = useState(""); // Título da nova seção
  const [newBox, setNewBox] = useState({
    sectionIndex: null,
    title: "",
    content: "",
    image: null
  }); // Estado para o novo box
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState(""); // Estado de erro
  const [success, setSuccess] = useState(""); // Estado de sucesso
  const [editSectionIndex, setEditSectionIndex] = useState(null); // Índice da seção que está sendo editada
  const [editBoxIndex, setEditBoxIndex] = useState(null); // Índice do box que está sendo editado

  // Carregar as seções e boxes do Firebase
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const boxesRef = doc(db, "content", "boxes");
        const boxesDoc = await getDoc(boxesRef);
        if (boxesDoc.exists()) {
          setSections(boxesDoc.data().sections || []);
        }
      } catch (error) {
        setError("Erro ao carregar dados.");
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchSections();
  }, []);

  // Função para fazer o upload da imagem
  const handleImageUpload = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      setError("Falha no upload da imagem.");
      return null;
    }
  };

  // Função para adicionar uma nova seção
  const handleAddSection = () => {
    if (!newSectionTitle) {
      setError("Digite um título para a seção!");
      return;
    }
    setSections((prev) => [...prev, { title: newSectionTitle, boxes: [] }]);
    setNewSectionTitle("");
  };

  // Função para adicionar um box na seção
  const handleAddBox = async () => {
    const { title, content, image, sectionIndex } = newBox;

    if (!title || !content || !image) {
      setError("Preencha todos os campos do box!");
      return;
    }

    setLoading(true);

    // Fazer o upload da imagem e obter a URL
    const imageUrl = await handleImageUpload(image);

    if (imageUrl) {
      // Atualizar as seções com o novo box
      const updatedSections = [...sections];
      updatedSections[sectionIndex].boxes.push({
        title,
        content,
        imageUrl
      });

      // Atualizar o estado das seções no Firebase
      try {
        await setDoc(doc(db, "content", "boxes"), { sections: updatedSections });
        setSections(updatedSections); // Atualiza o estado local
        setNewBox({ sectionIndex: null, title: "", content: "", image: null }); // Limpa o formulário
        setSuccess("Box adicionado com sucesso!");
      } catch (error) {
        setError("Erro ao salvar o box.");
      }
    }

    setLoading(false);
  };

  // Função para excluir um box
  const handleDeleteBox = (sectionIndex, boxIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].boxes.splice(boxIndex, 1);

    // Atualizar as seções no Firebase
    setDoc(doc(db, "content", "boxes"), { sections: updatedSections })
      .then(() => {
        setSections(updatedSections);
      })
      .catch((error) => {
        setError("Erro ao excluir o box.");
      });
  };

  // Função para excluir uma seção
  const handleDeleteSection = (sectionIndex) => {
    const updatedSections = sections.filter((_, index) => index !== sectionIndex);

    // Atualizar as seções no Firebase
    setDoc(doc(db, "content", "boxes"), { sections: updatedSections })
      .then(() => {
        setSections(updatedSections);
        setSuccess("Seção excluída com sucesso!");
      })
      .catch((error) => {
        setError("Erro ao excluir a seção.");
      });
  };

  // Função para salvar as alterações em uma seção
  const handleSaveSection = (sectionIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].title = newSectionTitle;
    setSections(updatedSections);
    setEditSectionIndex(null);
    setSuccess("Seção atualizada!");
  };

  // Função para salvar alterações em um box
  const handleSaveBox = async (sectionIndex, boxIndex) => {
    const updatedSections = [...sections];
    const box = updatedSections[sectionIndex].boxes[boxIndex];

    // Verifica se a imagem foi alterada
    let imageUrl = box.imageUrl;
    if (newBox.image) {
      imageUrl = await handleImageUpload(newBox.image);
    }

    updatedSections[sectionIndex].boxes[boxIndex] = {
      ...box,
      title: newBox.title,
      content: newBox.content,
      imageUrl: imageUrl || box.imageUrl, // Se imagem nova foi carregada, usa a nova imagem
    };

    setSections(updatedSections);
    setEditBoxIndex(null);
    setSuccess("Box atualizado com sucesso!");
  };

  // Função para editar uma seção
  const handleEditSection = (sectionIndex) => {
    setNewSectionTitle(sections[sectionIndex].title);
    setEditSectionIndex(sectionIndex);
  };

  // Função para editar um box
  const handleEditBox = (sectionIndex, boxIndex) => {
    setNewBox({
      title: sections[sectionIndex].boxes[boxIndex].title,
      content: sections[sectionIndex].boxes[boxIndex].content,
      image: sections[sectionIndex].boxes[boxIndex].imageUrl,
      sectionIndex
    });
    setEditBoxIndex(boxIndex);
  };

  // Função para salvar todas as alterações
  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "content", "boxes"), { sections });
      setSuccess("Alterações salvas!");
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } catch (error) {
      setError("Erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-boxes">
      <h2>Editar Seções</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Adicionar Nova Seção */}
      <div className="add-section-form">
        <input
          type="text"
          placeholder="Nome da Seção"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
        />
        <button onClick={handleAddSection} disabled={loading}>
          Nova Seção
        </button>
      </div>

      {/* Lista de Seções */}
      <div className="sections-list">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="section">
            {editSectionIndex === sectionIndex ? (
              <div>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                />
                <button onClick={() => handleSaveSection(sectionIndex)} disabled={loading}>
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <h3>{section.title}</h3>
                <button onClick={() => handleEditSection(sectionIndex)} disabled={loading}>
                  Editar Seção
                </button>
              </>
            )}

            {/* Botão para excluir a seção */}
            <button
              onClick={() => handleDeleteSection(sectionIndex)}
              className="delete-section-btn"
              disabled={loading}
            >
              Excluir Seção
            </button>

            {/* Formulário do Box */}
            {newBox.sectionIndex === sectionIndex && (
              <div className="add-box-form">
                <input
                  type="text"
                  placeholder="Título"
                  value={newBox.title}
                  onChange={(e) => setNewBox({ ...newBox, title: e.target.value })}
                />
                <textarea
                  placeholder="Descrição"
                  value={newBox.content}
                  onChange={(e) => setNewBox({ ...newBox, content: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewBox({ ...newBox, image: e.target.files[0] })}
                />
                <button onClick={handleAddBox} disabled={loading}>
                  {loading ? "Adicionando..." : "Adicionar Box"}
                </button>
              </div>
            )}

            {/* Botão para abrir o formulário */}
            <button
              onClick={() => setNewBox({ ...newBox, sectionIndex })}
              disabled={loading}
            >
              Adicionar Box
            </button>

            {/* Boxes da Seção */}
            <div className="boxes">
              {section.boxes.map((box, boxIndex) => (
                <div key={boxIndex} className="box">
                  {editBoxIndex === boxIndex ? (
                    <div>
                      <input
                        type="text"
                        value={newBox.title}
                        onChange={(e) => setNewBox({ ...newBox, title: e.target.value })}
                      />
                      <textarea
                        value={newBox.content}
                        onChange={(e) => setNewBox({ ...newBox, content: e.target.value })}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewBox({ ...newBox, image: e.target.files[0] })}
                      />
                      <button onClick={() => handleSaveBox(sectionIndex, boxIndex)} disabled={loading}>
                        Salvar Box
                      </button>
                    </div>
                  ) : (
                    <div>
                      <img src={box.imageUrl} alt={box.title} />
                      <h4>{box.title}</h4>
                      <p>{box.content}</p>
                      <button onClick={() => handleEditBox(sectionIndex, boxIndex)} disabled={loading}>
                        Editar Box
                      </button>
                      <button
                        onClick={() => handleDeleteBox(sectionIndex, boxIndex)}
                        disabled={loading}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Tudo"}
      </button>
    </div>
  );
};

export default EditBoxes;

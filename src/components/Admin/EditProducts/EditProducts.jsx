import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditProducts.css";

const EditProducts = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newProduct, setNewProduct] = useState({
    categoryKey: null,
    name: "",
    description: "",
    price: "",
    anchorPrice: "",
    discountPercentage: "",
    image: null,
    additionalImages: [],
    variants: [],
  });
  const [newVariant, setNewVariant] = useState({ color: "", size: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editCategoryKey, setEditCategoryKey] = useState(null);
  const [editProductKey, setEditProductKey] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const productsRef = doc(db, "lojinha", "produtos");
        const productsDoc = await getDoc(productsRef);
        if (productsDoc.exists()) {
          setCategories(productsDoc.data().categories || {});
        }
      } catch (error) {
        setError("Erro ao carregar dados.");
        console.error("Erro ao buscar dados:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (file, productId) => {
    if (!file || !productId) return null;
    const formData = new FormData();
    formData.append("images", file);
    formData.append("productId", productId);
    try {
      const response = await axios.post("https://mabelsoft.com.br/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.urls[0]; // URL já vem ajustada do backend
    } catch (error) {
      setError("Falha no upload da imagem.");
      console.error("Erro no upload:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return null;
    }
  };

  const calculateDiscount = (price, anchorPrice) => {
    if (!price || !anchorPrice || price >= anchorPrice) return 0;
    return Math.round(((anchorPrice - price) / anchorPrice) * 100);
  };

  const handleAddCategory = () => {
    if (!newCategoryTitle) {
      setError("Digite um título para a categoria!");
      return;
    }
    setCategories((prev) => ({
      ...prev,
      [newCategoryTitle]: { products: {} },
    }));
    setNewCategoryTitle("");
    setSuccess("Categoria adicionada com sucesso!");
  };

  const handleAddVariant = () => {
    if (!newVariant.color || !newVariant.size) {
      setError("Preencha a cor e o tamanho da variante!");
      return;
    }
    setNewProduct((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }],
    }));
    setNewVariant({ color: "", size: "" });
  };

  const handleRemoveVariant = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleAddProduct = async () => {
    const { name, description, price, anchorPrice, image, additionalImages, categoryKey, variants } = newProduct;
    if (!name || !description || !price || !anchorPrice || !image || !categoryKey) {
      setError("Preencha todos os campos obrigatórios do produto!");
      return;
    }

    setLoading(true);
    const imageUrl = await handleImageUpload(image, name);
    const additionalImageUrls = await Promise.all(
      additionalImages.map((file) => handleImageUpload(file, name))
    );

    if (imageUrl) {
      const updatedCategories = { ...categories };
      const newProductData = {
        description,
        price: parseFloat(price) || 0,
        anchorPrice: parseFloat(anchorPrice) || 0,
        discountPercentage: calculateDiscount(parseFloat(price), parseFloat(anchorPrice)),
        imageUrl,
        additionalImages: additionalImageUrls.filter(Boolean),
        variants,
      };

      updatedCategories[categoryKey].products[name] = newProductData;

      try {
        await setDoc(doc(db, "lojinha", "produtos"), { categories: updatedCategories });
        await setDoc(doc(db, "lojinha", `product-details-${categoryKey}-${name}`), {
          ...newProductData,
          name,
          category: categoryKey,
          productKey: name,
          details: "Detalhes adicionais podem ser editados aqui.",
          ratings: [],
        });

        setCategories(updatedCategories);
        setNewProduct({
          categoryKey: null,
          name: "",
          description: "",
          price: "",
          anchorPrice: "",
          discountPercentage: "",
          image: null,
          additionalImages: [],
          variants: [],
        });
        setSuccess("Produto adicionado com sucesso!");
      } catch (error) {
        setError("Erro ao salvar o produto.");
        console.error("Erro ao salvar:", error.message);
      }
    }
    setLoading(false);
  };

  const handleDeleteProduct = (categoryKey, productKey) => {
    const updatedCategories = { ...categories };
    delete updatedCategories[categoryKey].products[productKey];
    setDoc(doc(db, "lojinha", "produtos"), { categories: updatedCategories })
      .then(() => {
        setCategories(updatedCategories);
        setSuccess("Produto excluído com sucesso!");
      })
      .catch((error) => setError("Erro ao excluir o produto."));
  };

  const handleDeleteCategory = (categoryKey) => {
    const updatedCategories = { ...categories };
    delete updatedCategories[categoryKey];
    setDoc(doc(db, "lojinha", "produtos"), { categories: updatedCategories })
      .then(() => {
        setCategories(updatedCategories);
        setSuccess("Categoria excluída com sucesso!");
      })
      .catch((error) => setError("Erro ao excluir a categoria."));
  };

  const handleSaveCategory = (categoryKey) => {
    if (!newCategoryTitle) {
      setError("Digite um novo título para a categoria!");
      return;
    }
    const updatedCategories = { ...categories };
    updatedCategories[newCategoryTitle] = updatedCategories[categoryKey];
    delete updatedCategories[categoryKey];
    setCategories(updatedCategories);
    setEditCategoryKey(null);
    setSuccess("Categoria atualizada com sucesso!");
  };

  const handleSaveProduct = async (categoryKey, productKey) => {
    const updatedCategories = { ...categories };
    const product = updatedCategories[categoryKey].products[productKey];

    let imageUrl = product.imageUrl;
    if (newProduct.image && typeof newProduct.image !== "string") {
      imageUrl = await handleImageUpload(newProduct.image, newProduct.name);
    }
    const additionalImageUrls = await Promise.all(
      newProduct.additionalImages.map((file) => handleImageUpload(file, newProduct.name))
    );

    updatedCategories[categoryKey].products[newProduct.name] = {
      description: newProduct.description,
      price: parseFloat(newProduct.price) || 0,
      anchorPrice: parseFloat(newProduct.anchorPrice) || 0,
      discountPercentage: calculateDiscount(parseFloat(newProduct.price), parseFloat(newProduct.anchorPrice)),
      imageUrl: imageUrl || product.imageUrl,
      additionalImages: additionalImageUrls.length > 0 ? additionalImageUrls : product.additionalImages || [],
      variants: newProduct.variants,
    };
    if (newProduct.name !== productKey) {
      delete updatedCategories[categoryKey].products[productKey];
    }

    try {
      await setDoc(doc(db, "lojinha", "produtos"), { categories: updatedCategories });
      await setDoc(doc(db, "lojinha", `product-details-${categoryKey}-${newProduct.name}`), {
        ...updatedCategories[categoryKey].products[newProduct.name],
        name: newProduct.name,
        category: categoryKey,
        productKey: newProduct.name,
        details: "Detalhes adicionais podem ser editados aqui.",
        ratings: product.ratings || [],
      });
      setCategories(updatedCategories);
      setEditProductKey(null);
      setSuccess("Produto atualizado com sucesso!");
    } catch (error) {
      setError("Erro ao atualizar o produto.");
      console.error("Erro ao atualizar:", error.message);
    }
  };

  const handleEditCategory = (categoryKey) => {
    setNewCategoryTitle(categoryKey);
    setEditCategoryKey(categoryKey);
  };

  const handleEditProduct = (categoryKey, productKey) => {
    const product = categories[categoryKey].products[productKey];
    setNewProduct({
      name: productKey,
      description: product.description || "",
      price: product.price ? product.price.toString() : "",
      anchorPrice: product.anchorPrice ? product.anchorPrice.toString() : "",
      discountPercentage: product.discountPercentage ? product.discountPercentage.toString() : "",
      image: product.imageUrl || null,
      additionalImages: product.additionalImages || [],
      variants: product.variants || [],
      categoryKey,
    });
    setEditProductKey(productKey);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "lojinha", "produtos"), { categories });
      setSuccess("Alterações salvas com sucesso!");
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } catch (error) {
      setError("Erro ao salvar as alterações.");
      console.error("Erro ao salvar:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryKey) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="edit-products">
      <h2>Editar Produtos</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Seção de Adicionar Categoria */}
      <section className="add-category-section">
        <h3>Adicionar Nova Categoria</h3>
        <div className="add-category-form">
          <input
            type="text"
            placeholder="Nome da Categoria"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
          />
          <button onClick={handleAddCategory} disabled={loading}>
            Adicionar Categoria
          </button>
        </div>
      </section>

      {/* Seção de Categorias */}
      <section className="categories-section">
        <h3>Categorias Existentes</h3>
        <div className="categories-list">
          {Object.entries(categories).map(([categoryKey]) => (
            <div key={categoryKey} className="category">
              {/* Cabeçalho da Categoria */}
              <div className="category-header">
                {editCategoryKey === categoryKey ? (
                  <div className="edit-category-form">
                    <input
                      type="text"
                      value={newCategoryTitle}
                      onChange={(e) => setNewCategoryTitle(e.target.value)}
                    />
                    <button onClick={() => handleSaveCategory(categoryKey)} disabled={loading}>
                      Salvar
                    </button>
                  </div>
                ) : (
                  <>
                    <h4>{categoryKey}</h4>
                    <div className="category-buttons">
                      <button onClick={() => handleEditCategory(categoryKey)} disabled={loading}>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(categoryKey)}
                        className="delete-category-btn"
                        disabled={loading}
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Botão para Adicionar Produto */}
              {!editProductKey && newProduct.categoryKey !== categoryKey && (
                <button
                  className="add-product-btn"
                  onClick={() => setNewProduct({ ...newProduct, categoryKey })}
                  disabled={loading}
                >
                  Adicionar Produto
                </button>
              )}

              {/* Formulário de Adicionar Produto */}
              {newProduct.categoryKey === categoryKey && !editProductKey && (
                <div className="add-product-form">
                  <h5>Adicionar Novo Produto</h5>
                  <input
                    type="text"
                    placeholder="Nome do Produto"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <textarea
                    placeholder="Descrição"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Preço (R$)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Preço de Ancoragem (R$)"
                    value={newProduct.anchorPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, anchorPrice: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Desconto (%)"
                    value={newProduct.discountPercentage}
                    readOnly
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewProduct({ ...newProduct, additionalImages: Array.from(e.target.files) })}
                  />
                  <div className="variant-form">
                    <h6>Adicionar Variante</h6>
                    <div className="variant-inputs">
                      <input
                        type="text"
                        placeholder="Cor"
                        value={newVariant.color}
                        onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Tamanho"
                        value={newVariant.size}
                        onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                      />
                      <button onClick={handleAddVariant} disabled={loading}>
                        Adicionar
                      </button>
                    </div>
                    <div className="variants-list">
                      {newProduct.variants.map((variant, index) => (
                        <div key={index} className="variant-item">
                          <span>
                            Cor: {variant.color}, Tamanho: {variant.size}
                          </span>
                          <button
                            onClick={() => handleRemoveVariant(index)}
                            disabled={loading}
                            className="remove-variant-btn"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleAddProduct} disabled={loading}>
                    {loading ? "Adicionando..." : "Adicionar Produto"}
                  </button>
                </div>
              )}

              {/* Lista de Produtos */}
              <div className="products-grid">
                {Object.entries(categories[categoryKey].products)
                  .slice(0, expandedCategories[categoryKey] ? undefined : 2)
                  .map(([productKey]) => (
                    <div key={productKey} className="product-item">
                      {editProductKey === productKey ? (
                        <div className="edit-product-form">
                          <h5>Editar Produto</h5>
                          <input
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          />
                          <textarea
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          />
                          <input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          />
                          <input
                            type="number"
                            value={newProduct.anchorPrice}
                            onChange={(e) => setNewProduct({ ...newProduct, anchorPrice: e.target.value })}
                          />
                          <input
                            type="number"
                            value={newProduct.discountPercentage}
                            readOnly
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setNewProduct({ ...newProduct, additionalImages: Array.from(e.target.files) })}
                          />
                          <div className="variant-form">
                            <h6>Adicionar Variante</h6>
                            <div className="variant-inputs">
                              <input
                                type="text"
                                placeholder="Cor"
                                value={newVariant.color}
                                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                              />
                              <input
                                type="text"
                                placeholder="Tamanho"
                                value={newVariant.size}
                                onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                              />
                              <button onClick={handleAddVariant} disabled={loading}>
                                Adicionar
                              </button>
                            </div>
                            <div className="variants-list">
                              {newProduct.variants.map((variant, index) => (
                                <div key={index} className="variant-item">
                                  <span>
                                    Cor: {variant.color}, Tamanho: {variant.size}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveVariant(index)}
                                    disabled={loading}
                                    className="remove-variant-btn"
                                  >
                                    Remover
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => handleSaveProduct(categoryKey, productKey)} disabled={loading}>
                            Salvar Produto
                          </button>
                        </div>
                      ) : (
                        <div className="product-preview">
                          <div className="image-container">
                            <img src={categories[categoryKey].products[productKey].imageUrl} alt={productKey} />
                            {categories[categoryKey].products[productKey].discountPercentage > 0 && (
                              <span className="discount-tag">
                                {categories[categoryKey].products[productKey].discountPercentage}% OFF
                              </span>
                            )}
                          </div>
                          <h5>{productKey}</h5>
                          <p>{categories[categoryKey].products[productKey].description || "Sem descrição"}</p>
                          <p>Preço: R${(categories[categoryKey].products[productKey].price || 0).toFixed(2)}</p>
                          <p>Ancoragem: R${(categories[categoryKey].products[productKey].anchorPrice || 0).toFixed(2)}</p>
                          {categories[categoryKey].products[productKey].variants?.length > 0 && (
                            <div className="variants-display">
                              <h6>Variantes:</h6>
                              <ul>
                                {categories[categoryKey].products[productKey].variants.map((variant, idx) => (
                                  <li key={idx}>
                                    Cor: {variant.color}, Tamanho: {variant.size}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="product-buttons">
                            <button onClick={() => handleEditProduct(categoryKey, productKey)} disabled={loading}>
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(categoryKey, productKey)}
                              className="delete-product-btn"
                              disabled={loading}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Botão Ver Mais */}
              {Object.keys(categories[categoryKey].products).length > 2 && (
                <button
                  className="see-more-btn"
                  onClick={() => toggleCategoryExpansion(categoryKey)}
                >
                  {expandedCategories[categoryKey] ? "Ver Menos" : "Ver Mais"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Botão Salvar Tudo */}
      <button className="save-all-btn" onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Tudo"}
      </button>
    </div>
  );
};

export default EditProducts;
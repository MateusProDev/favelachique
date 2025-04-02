import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import "./EditProducts.css";

const EditProducts = () => {
  const [categories, setCategories] = useState({});
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null); // Novo estado para imagem da categoria
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
          const fetchedCategories = productsDoc.data().categories || {};
          setCategories(fetchedCategories);
          const initialExpandedState = {};
          Object.keys(fetchedCategories).forEach((categoryKey) => {
            initialExpandedState[categoryKey] = false;
          });
          setExpandedCategories(initialExpandedState);
        } else {
          setError("Nenhuma categoria encontrada.");
        }
      } catch (error) {
        setError("Erro ao carregar dados.");
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.secure_url;
    } catch (error) {
      setError("Falha no upload da imagem para o Cloudinary.");
      console.error("Erro no upload:", error);
      return null;
    }
  };

  const calculateDiscount = (price, anchorPrice) => {
    if (!price || !anchorPrice || price >= anchorPrice) return 0;
    return Math.round(((anchorPrice - price) / anchorPrice) * 100);
  };

  const handleAddCategory = async () => {
    if (!newCategoryTitle) {
      setError("Digite um título para a categoria!");
      return;
    }
    setLoading(true);

    const categoryImageUrl = newCategoryImage ? await handleImageUpload(newCategoryImage) : null;

    setCategories((prev) => ({
      ...prev,
      [newCategoryTitle]: { imageUrl: categoryImageUrl, products: {} },
    }));
    setExpandedCategories((prev) => ({
      ...prev,
      [newCategoryTitle]: false,
    }));
    setNewCategoryTitle("");
    setNewCategoryImage(null); // Resetar a imagem após adicionar
    setSuccess("Categoria adicionada com sucesso!");
    setLoading(false);
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
      setError("Preencha todos os campos obrigatórios do produto e selecione uma categoria!");
      return;
    }

    setLoading(true);

    const imageUrl = await handleImageUpload(image);
    const additionalImageUrls = await Promise.all(
      additionalImages.map((file) => handleImageUpload(file))
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
        const productDetailRef = doc(db, "lojinha", `product-details-${categoryKey}-${name}`);
        await setDoc(productDetailRef, {
          ...newProductData,
          name,
          category: categoryKey,
          productKey: name,
          details: "Detalhes adicionais podem ser editados aqui.",
          ratings: [],
        });

        setCategories(updatedCategories);
        resetNewProduct();
        setSuccess("Produto adicionado com sucesso!");
      } catch (error) {
        setError("Erro ao salvar o produto ou detalhes.");
        console.error(error);
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
        setExpandedCategories((prev) => {
          const newExpanded = { ...prev };
          delete newExpanded[categoryKey];
          return newExpanded;
        });
        setSuccess("Categoria excluída com sucesso!");
      })
      .catch((error) => setError("Erro ao excluir a categoria."));
  };

  const handleSaveCategory = async (categoryKey) => {
    if (!newCategoryTitle) {
      setError("Digite um novo título para a categoria!");
      return;
    }
    setLoading(true);

    const categoryImageUrl = newCategoryImage
      ? await handleImageUpload(newCategoryImage)
      : categories[categoryKey].imageUrl;

    const updatedCategories = { ...categories };
    updatedCategories[newCategoryTitle] = {
      imageUrl: categoryImageUrl,
      products: updatedCategories[categoryKey].products,
    };
    delete updatedCategories[categoryKey];
    setCategories(updatedCategories);
    setExpandedCategories((prev) => {
      const newExpanded = { ...prev };
      newExpanded[newCategoryTitle] = newExpanded[categoryKey] || false;
      delete newExpanded[categoryKey];
      return newExpanded;
    });
    setEditCategoryKey(null);
    setNewCategoryTitle("");
    setNewCategoryImage(null);
    setSuccess("Categoria atualizada!");
    setLoading(false);
  };

  const handleSaveProduct = async (categoryKey, productKey) => {
    const updatedCategories = { ...categories };
    const product = updatedCategories[categoryKey].products[productKey];

    let imageUrl = product.imageUrl;
    if (newProduct.image && typeof newProduct.image !== "string") {
      imageUrl = await handleImageUpload(newProduct.image);
    }
    const additionalImageUrls = await Promise.all(
      newProduct.additionalImages.map((file) => handleImageUpload(file))
    );

    const updatedProductData = {
      description: newProduct.description,
      price: parseFloat(newProduct.price) || 0,
      anchorPrice: parseFloat(newProduct.anchorPrice) || 0,
      discountPercentage: calculateDiscount(parseFloat(newProduct.price), parseFloat(newProduct.anchorPrice)),
      imageUrl: imageUrl || product.imageUrl,
      additionalImages:
        additionalImageUrls.filter(Boolean).length > 0 ? additionalImageUrls : product.additionalImages || [],
      variants: newProduct.variants,
    };

    updatedCategories[categoryKey].products[newProduct.name] = updatedProductData;
    if (newProduct.name !== productKey) {
      delete updatedCategories[categoryKey].products[productKey];
    }

    try {
      await setDoc(doc(db, "lojinha", "produtos"), { categories: updatedCategories });
      const productDetailRef = doc(db, "lojinha", `product-details-${categoryKey}-${newProduct.name}`);
      await setDoc(productDetailRef, {
        ...updatedProductData,
        name: newProduct.name,
        category: categoryKey,
        productKey: newProduct.name,
        details: product.details || "Detalhes adicionais podem ser editados aqui.",
        ratings: product.ratings || [],
      });
      setCategories(updatedCategories);
      setEditProductKey(null);
      resetNewProduct();
      setSuccess("Produto atualizado com sucesso!");
    } catch (error) {
      setError("Erro ao atualizar o produto.");
      console.error(error);
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
    setNewProduct((prev) => ({ ...prev, categoryKey: null }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "lojinha", "produtos"), { categories });
      setSuccess("Alterações salvas com sucesso!");
    } catch (error) {
      setError("Erro ao salvar as alterações.");
      console.error(error);
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

  const resetNewProduct = () => {
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
    setNewVariant({ color: "", size: "" });
  };

  if (loading) return <div className="edit-products__loading">Carregando...</div>;

  return (
    <div className="edit-products">
      <h2 className="edit-products__title">Editar Produtos</h2>
      {error && <div className="edit-products__error">{error}</div>}
      {success && <div className="edit-products__success">{success}</div>}

      <div className="edit-products__category-form">
        <input
          type="text"
          className="edit-products__input"
          placeholder="Nome da Categoria"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
        />
        <input
          type="file"
          className="edit-products__input"
          accept="image/*"
          onChange={(e) => setNewCategoryImage(e.target.files[0])}
        />
        <button
          className="edit-products__button"
          onClick={handleAddCategory}
          disabled={loading}
        >
          Nova Categoria
        </button>
      </div>

      <div className="edit-products__categories">
        {Object.entries(categories).map(([categoryKey, categoryData]) => {
          const isExpanded = expandedCategories[categoryKey] || false;
          const productsArray = Object.entries(categoryData.products || {}).map(([name, data]) => ({
            name,
            ...data,
          }));
          const visibleProducts = isExpanded ? productsArray : productsArray.slice(0, 5);

          return (
            <div key={categoryKey} className="edit-products__category">
              {editCategoryKey === categoryKey ? (
                <div className="edit-products__edit-category">
                  <input
                    type="text"
                    className="edit-products__input"
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                  />
                  <input
                    type="file"
                    className="edit-products__input"
                    accept="image/*"
                    onChange={(e) => setNewCategoryImage(e.target.files[0])}
                  />
                  <button
                    className="edit-products__button"
                    onClick={() => handleSaveCategory(categoryKey)}
                    disabled={loading}
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <div className="edit-products__category-header">
                  {categoryData.imageUrl ? (
                    <img
                      src={categoryData.imageUrl}
                      alt={categoryKey}
                      className="edit-products__category-image"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="edit-products__category-placeholder"
                      style={{ width: "100px", height: "100px", backgroundColor: "#ccc" }}
                    >
                      Sem Imagem
                    </div>
                  )}
                  <div className="edit-products__category-actions">
                    <button
                      className="edit-products__button"
                      onClick={() => handleEditCategory(categoryKey)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      className="edit-products__button edit-products__button--delete"
                      onClick={() => handleDeleteCategory(categoryKey)}
                      disabled={loading}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}

              {newProduct.categoryKey === categoryKey && !editProductKey && (
                <div className="edit-products__form">
                  <input
                    type="text"
                    className="edit-products__input"
                    placeholder="Nome do Produto"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <textarea
                    className="edit-products__textarea"
                    placeholder="Descrição (exibida na loja)"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                  <input
                    type="number"
                    className="edit-products__input"
                    placeholder="Preço (R$)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                  <input
                    type="number"
                    className="edit-products__input"
                    placeholder="Preço de Ancoragem (R$)"
                    value={newProduct.anchorPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, anchorPrice: e.target.value })}
                  />
                  <input
                    type="file"
                    className="edit-products__input"
                    accept="image/*"
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                  />
                  <input
                    type="file"
                    className="edit-products__input"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewProduct({ ...newProduct, additionalImages: Array.from(e.target.files) })}
                  />
                  <div className="edit-products__variants">
                    <h4>Variantes</h4>
                    <input
                      type="text"
                      className="edit-products__input"
                      placeholder="Cor"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    />
                    <input
                      type="text"
                      className="edit-products__input"
                      placeholder="Tamanho"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                    />
                    <button
                      className="edit-products__button"
                      onClick={handleAddVariant}
                      disabled={loading}
                    >
                      Adicionar Variante
                    </button>
                    {newProduct.variants.map((variant, index) => (
                      <div key={index} className="edit-products__variant-item">
                        <span>{variant.color} ({variant.size})</span>
                        <button
                          className="edit-products__button edit-products__button--delete"
                          onClick={() => handleRemoveVariant(index)}
                          disabled={loading}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="edit-products__button"
                    onClick={handleAddProduct}
                    disabled={loading}
                  >
                    {loading ? "Adicionando..." : "Adicionar Produto"}
                  </button>
                </div>
              )}

              <button
                className="edit-products__button"
                onClick={() => {
                  resetNewProduct();
                  setNewProduct({ ...newProduct, categoryKey });
                  setEditProductKey(null);
                }}
                disabled={loading}
              >
                Novo Produto
              </button>

              <div className="edit-products__table-wrapper">
                <table className="edit-products__table">
                  <thead className="edit-products__table-head">
                    <tr className="edit-products__table-row">
                      <th className="edit-products__table-header">Imagem</th>
                      <th className="edit-products__table-header">Nome</th>
                      <th className="edit-products__table-header">Preço</th>
                      <th className="edit-products__table-header">Ancoragem</th>
                      <th className="edit-products__table-header">Variantes</th>
                      <th className="edit-products__table-header">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="edit-products__table-body">
                    {visibleProducts.map((product) =>
                      editProductKey === product.name ? (
                        <tr key={product.name} className="edit-products__table-row">
                          <td colSpan="6" className="edit-products__table-cell">
                            <div className="edit-products__form">
                              <input
                                type="text"
                                className="edit-products__input"
                                placeholder="Nome do Produto"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                              />
                              <textarea
                                className="edit-products__textarea"
                                placeholder="Descrição (exibida na loja)"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                              />
                              <input
                                type="number"
                                className="edit-products__input"
                                placeholder="Preço (R$)"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                              />
                              <input
                                type="number"
                                className="edit-products__input"
                                placeholder="Preço de Ancoragem (R$)"
                                value={newProduct.anchorPrice}
                                onChange={(e) => setNewProduct({ ...newProduct, anchorPrice: e.target.value })}
                              />
                              <input
                                type="file"
                                className="edit-products__input"
                                accept="image/*"
                                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                              />
                              <input
                                type="file"
                                className="edit-products__input"
                                accept="image/*"
                                multiple
                                onChange={(e) => setNewProduct({ ...newProduct, additionalImages: Array.from(e.target.files) })}
                              />
                              <div className="edit-products__variants">
                                <h4>Variantes</h4>
                                <input
                                  type="text"
                                  className="edit-products__input"
                                  placeholder="Cor"
                                  value={newVariant.color}
                                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                />
                                <input
                                  type="text"
                                  className="edit-products__input"
                                  placeholder="Tamanho"
                                  value={newVariant.size}
                                  onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                                />
                                <button
                                  className="edit-products__button"
                                  onClick={handleAddVariant}
                                  disabled={loading}
                                >
                                  Adicionar Variante
                                </button>
                                {newProduct.variants.map((variant, index) => (
                                  <div key={index} className="edit-products__variant-item">
                                    <span>{variant.color} ({variant.size})</span>
                                    <button
                                      className="edit-products__button edit-products__button--delete"
                                      onClick={() => handleRemoveVariant(index)}
                                      disabled={loading}
                                    >
                                      Remover
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button
                                className="edit-products__button"
                                onClick={() => handleSaveProduct(categoryKey, product.name)}
                                disabled={loading}
                              >
                                Salvar Produto
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={product.name} className="edit-products__table-row">
                          <td className="edit-products__table-cell" data-label="Imagem">
                            <img src={product.imageUrl} alt={product.name} className="edit-products__image" />
                          </td>
                          <td className="edit-products__table-cell" data-label="Nome">{product.name}</td>
                          <td className="edit-products__table-cell" data-label="Preço">
                            R${(product.price || 0).toFixed(2)}
                          </td>
                          <td className="edit-products__table-cell" data-label="Ancoragem">
                            R${(product.anchorPrice || 0).toFixed(2)}
                          </td>
                          <td className="edit-products__table-cell" data-label="Variantes">
                            {product.variants && product.variants.length > 0
                              ? product.variants.map((v) => `${v.color} (${v.size})`).join(", ")
                              : "Nenhuma"}
                          </td>
                          <td className="edit-products__table-cell edit-products__table-cell--actions" data-label="Ações">
                            <button
                              className="edit-products__button edit-products__button--edit"
                              onClick={() => handleEditProduct(categoryKey, product.name)}
                              disabled={loading}
                            >
                              Editar
                            </button>
                            <button
                              className="edit-products__button edit-products__button--delete"
                              onClick={() => handleDeleteProduct(categoryKey, product.name)}
                              disabled={loading}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {productsArray.length > 5 && (
                <button
                  className="edit-products__button"
                  onClick={() => toggleCategoryExpansion(categoryKey)}
                >
                  {isExpanded ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="edit-products__button edit-products__button--save"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar Tudo"}
      </button>
    </div>
  );
};

export default EditProducts;
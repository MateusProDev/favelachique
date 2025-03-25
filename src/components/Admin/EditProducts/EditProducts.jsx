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
          const fetchedCategories = productsDoc.data().categories || {};
          setCategories(fetchedCategories);
          // Inicializar todas as categorias como recolhidas
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
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = response.data.secure_url;
      console.log("URL retornada do Cloudinary:", imageUrl);
      return imageUrl;
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

  const handleAddCategory = () => {
    if (!newCategoryTitle) {
      setError("Digite um título para a categoria!");
      return;
    }
    setCategories((prev) => ({
      ...prev,
      [newCategoryTitle]: { products: {} },
    }));
    // Inicializar a nova categoria como recolhida
    setExpandedCategories((prev) => ({
      ...prev,
      [newCategoryTitle]: false,
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
        setSuccess("Produto e detalhes adicionados com sucesso!");
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

  const handleSaveCategory = (categoryKey) => {
    if (!newCategoryTitle) {
      setError("Digite um novo título para a categoria!");
      return;
    }
    const updatedCategories = { ...categories };
    updatedCategories[newCategoryTitle] = updatedCategories[categoryKey];
    delete updatedCategories[categoryKey];
    setCategories(updatedCategories);
    setExpandedCategories((prev) => {
      const newExpanded = { ...prev };
      newExpanded[newCategoryTitle] = newExpanded[categoryKey] || false;
      delete newExpanded[categoryKey];
      return newExpanded;
    });
    setEditCategoryKey(null);
    setSuccess("Categoria atualizada!");
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

    updatedCategories[categoryKey].products[newProduct.name] = {
      description: newProduct.description,
      price: parseFloat(newProduct.price) || 0,
      anchorPrice: parseFloat(newProduct.anchorPrice) || 0,
      discountPercentage: calculateDiscount(parseFloat(newProduct.price), parseFloat(newProduct.anchorPrice)),
      imageUrl: imageUrl || product.imageUrl,
      additionalImages:
        additionalImageUrls.filter(Boolean).length > 0 ? additionalImageUrls : product.additionalImages || [],
      variants: newProduct.variants,
    };
    if (newProduct.name !== productKey) {
      delete updatedCategories[categoryKey].products[productKey];
    }

    try {
      await setDoc(doc(db, "lojinha", "produtos"), { categories: updatedCategories });
      const productDetailRef = doc(db, "lojinha", `product-details-${categoryKey}-${newProduct.name}`);
      await setDoc(productDetailRef, {
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
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "lojinha", "produtos"), { categories });
      setSuccess("Alterações salvas!");
      setTimeout(() => navigate("/admin/dashboard"), 2000);
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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="edit-products">
      <h2>Editar Produtos</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="add-category-form">
        <input
          type="text"
          placeholder="Nome da Categoria"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
        />
        <button onClick={handleAddCategory} disabled={loading}>
          Nova Categoria
        </button>
      </div>

      <div className="categories-list">
        {Object.entries(categories).map(([categoryKey, categoryData]) => {
          const isExpanded = expandedCategories[categoryKey] || false;
          const productsArray = Object.entries(categoryData.products || {}).map(([name, data]) => ({
            name,
            ...data,
          }));
          const visibleProducts = isExpanded ? productsArray : productsArray.slice(0, 2);

          return (
            <div key={categoryKey} className="edit-products-category">
              {editCategoryKey === categoryKey ? (
                <div className="edit-products-edit-category-form">
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
                <div className="edit-products-category-header">
                  <h3>{categoryKey}</h3>
                  <div className="edit-products-category-buttons">
                    <button onClick={() => handleEditCategory(categoryKey)} disabled={loading}>
                      Editar Categoria
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(categoryKey)}
                      className="edit-products-delete-category-btn"
                      disabled={loading}
                    >
                      Excluir Categoria
                    </button>
                  </div>
                </div>
              )}

              {newProduct.categoryKey === categoryKey && (
                <div className="edit-products-add-product-form">
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
                  <div className="edit-products-variant-form">
                    <h4>Variantes</h4>
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
                      Adicionar Variante
                    </button>
                    <div className="edit-products-variants-list">
                      {newProduct.variants.map((variant, index) => (
                        <div key={index} className="edit-products-variant-item">
                          <span>
                            Cor: {variant.color}, Tamanho: {variant.size}
                          </span>
                          <button
                            onClick={() => handleRemoveVariant(index)}
                            disabled={loading}
                            className="edit-products-remove-variant-btn"
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

              <button
                className="edit-products-add-product-btn"
                onClick={() => setNewProduct({ ...newProduct, categoryKey })}
                disabled={loading}
              >
                Adicionar Produto
              </button>

              <div className="edit-products-grid">
                {visibleProducts.map((product) => (
                  <div key={product.name} className="edit-products-item">
                    {editProductKey === product.name ? (
                      <div className="edit-products-edit-product-form">
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
                        <div className="edit-products-variant-form">
                          <h4>Variantes</h4>
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
                            Adicionar Variante
                          </button>
                          <div className="edit-products-variants-list">
                            {newProduct.variants.map((variant, index) => (
                              <div key={index} className="edit-products-variant-item">
                                <span>
                                  Cor: {variant.color}, Tamanho: {variant.size}
                                </span>
                                <button
                                  onClick={() => handleRemoveVariant(index)}
                                  disabled={loading}
                                  className="edit-products-remove-variant-btn"
                                >
                                  Remover
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => handleSaveProduct(categoryKey, product.name)} disabled={loading}>
                          Salvar Produto
                        </button>
                      </div>
                    ) : (
                      <div className="edit-products-preview">
                        <div className="edit-products-image-container">
                          <img src={product.imageUrl} alt={product.name} />
                          {product.discountPercentage > 0 && (
                            <span className="edit-products-discount-tag">{product.discountPercentage}% OFF</span>
                          )}
                        </div>
                        <h4>{product.name}</h4>
                        <p>{product.description || "Sem descrição"}</p>
                        <p>Preço: R${(product.price || 0).toFixed(2)}</p>
                        <p>Ancoragem: R${(product.anchorPrice || 0).toFixed(2)}</p>
                        {product.variants && product.variants.length > 0 && (
                          <div className="edit-products-variants-display">
                            <h5>Variantes:</h5>
                            <ul>
                              {product.variants.map((variant, idx) => (
                                <li key={idx}>
                                  Cor: {variant.color}, Tamanho: {variant.size}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="edit-products-buttons">
                          <button onClick={() => handleEditProduct(categoryKey, product.name)} disabled={loading}>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(categoryKey, product.name)}
                            className="edit-products-delete-product-btn"
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
              {productsArray.length > 2 && (
                <button
                  className="edit-products-see-more-btn"
                  onClick={() => toggleCategoryExpansion(categoryKey)}
                >
                  {isExpanded ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button className="edit-products-save-all-btn" onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Tudo"}
      </button>
    </div>
  );
};

export default EditProducts;
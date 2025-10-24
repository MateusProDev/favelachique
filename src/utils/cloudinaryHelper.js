/**
 * Utilitário para upload de imagens no Cloudinary
 */

const CLOUD_NAME = 'doeiv6m4h';
const UPLOAD_PRESET = 'qc7tkpck';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Faz upload de uma imagem para o Cloudinary
 * @param {File} file - Arquivo de imagem
 * @param {string} folder - Pasta no Cloudinary (opcional)
 * @returns {Promise<string>} URL da imagem
 */
export const uploadImageToCloudinary = async (file, folder = 'parceiros') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('folder', folder);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    throw error;
  }
};

/**
 * Faz upload de múltiplas imagens
 * @param {FileList|Array} files - Lista de arquivos
 * @param {string} folder - Pasta no Cloudinary
 * @returns {Promise<Array<string>>} Array de URLs
 */
export const uploadMultipleImages = async (files, folder = 'parceiros') => {
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadImageToCloudinary(file, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Erro ao fazer upload de múltiplas imagens:', error);
    throw error;
  }
};

/**
 * Valida se o arquivo é uma imagem
 * @param {File} file - Arquivo para validar
 * @returns {boolean}
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPG, PNG, WEBP ou GIF.');
  }

  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
  }

  return true;
};

/**
 * Extrai o public_id do Cloudinary de uma URL
 * @param {string} url - URL da imagem
 * @returns {string} public_id
 */
export const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  } catch (error) {
    console.error('Erro ao extrair public_id:', error);
    return null;
  }
};

/**
 * Deleta uma imagem do Cloudinary (requer backend)
 * Nota: Para deletar imagens, é necessário usar o SDK do Cloudinary no backend
 * Esta função é um placeholder para referência
 */
export const deleteImageFromCloudinary = async (publicId) => {
  console.warn('Deleção de imagens do Cloudinary requer implementação backend');
  // Implementação futura: chamar endpoint backend que usa o SDK do Cloudinary
  return true;
};

export default {
  uploadImageToCloudinary,
  uploadMultipleImages,
  validateImageFile,
  getPublicIdFromUrl,
  deleteImageFromCloudinary
};

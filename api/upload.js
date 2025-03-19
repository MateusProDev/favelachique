const B2 = require("backblaze-b2");
const multiparty = require("multiparty");
const fs = require("fs");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  console.log("Iniciando upload...");

  const b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID, // Variável da Vercel
    applicationKey: process.env.B2_APPLICATION_KEY, // Variável da Vercel
  });

  console.log("Variáveis de ambiente:", {
    B2_KEY_ID: process.env.B2_KEY_ID,
    B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY,
    B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
    B2_BUCKET_ID: process.env.B2_BUCKET_ID,
  });

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Erro ao processar formulário:", err);
      return res.status(500).json({ error: "Erro ao processar formulário", details: err.message });
    }

    console.log("Campos recebidos:", fields);
    console.log("Arquivos recebidos:", files);

    try {
      console.log("Autorizando B2...");
      await b2.authorize();
      console.log("Autorização concluída");

      console.log("Solicitando URL de upload...");
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID, // Variável da Vercel
      });

      if (!uploadUrlResponse.data) {
        throw new Error("Falha ao obter URL de upload");
      }

      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;
      console.log("URL de upload obtida:", uploadUrl);

      const productId = fields.productId ? fields.productId[0] : "default";
      const uploadedUrls = [];

      if (!files.images || files.images.length === 0) {
        console.error("Nenhuma imagem enviada");
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }

      for (const file of files.images) {
        const fileName = `${productId}-${Date.now()}-${file.originalFilename}`;
        console.log("Processando arquivo:", fileName);

        const fileContent = fs.readFileSync(file.path);
        console.log("Arquivo lido com sucesso, tamanho:", fileContent.length);

        console.log("Fazendo upload para B2...");
        const uploadResponse = await b2.uploadFile({
          uploadUrl,
          uploadAuthToken: authorizationToken,
          fileName,
          data: fileContent,
          contentType: file.headers["content-type"] || "image/jpeg",
        });

        if (!uploadResponse.data) {
          throw new Error("Falha no upload do arquivo");
        }

        console.log("Upload concluído:", uploadResponse.data);

        // Gere o link público da imagem
        const imageUrl = `https://f002.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}`; // Variável da Vercel
        uploadedUrls.push(imageUrl);
      }

      console.log("Upload finalizado, URLs:", uploadedUrls);
      res.status(200).json({ urls: uploadedUrls });
    } catch (error) {
      console.error("Erro no processo de upload:", error);
      res.status(500).json({ error: "Erro no upload", details: error.message });
    }
  });
};
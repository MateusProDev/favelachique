const { B2 } = require("backblaze-b2");
const multiparty = require("multiparty");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
  });

  console.log("Variáveis:", {
    keyId: process.env.B2_KEY_ID,
    bucketId: process.env.B2_BUCKET_ID,
    bucketName: process.env.B2_BUCKET_NAME,
  });

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Erro ao processar arquivos:", err);
      return res.status(500).json({ error: "Erro ao processar arquivos", details: err.message });
    }

    try {
      console.log("Autorizando B2...");
      await b2.authorize();
      console.log("Autorização bem-sucedida");

      console.log("Obtendo URL de upload...");
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
      });
      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;
      console.log("URL de upload obtida");

      const productId = fields.productId ? fields.productId[0] : "default";
      const uploadedUrls = [];

      if (!files.images || files.images.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }

      for (const file of files.images) {
        const fileName = `${productId}-${Date.now()}-${file.originalFilename}`;
        console.log("Lendo arquivo:", file.path);
        const fileContent = require("fs").readFileSync(file.path);

        console.log("Fazendo upload do arquivo:", fileName);
        const uploadResponse = await b2.uploadFile({
          uploadUrl,
          uploadAuthToken: authorizationToken,
          fileName,
          data: fileContent,
          contentType: file.headers["content-type"],
        });
        console.log("Upload concluído:", uploadResponse.data);

        const imageUrl = `https://imagens.mabelsoft.com.br/file/${process.env.B2_BUCKET_NAME}/${fileName}`;
        uploadedUrls.push(imageUrl);
      }

      res.status(200).json({ urls: uploadedUrls });
    } catch (error) {
      console.error("Erro ao fazer upload para B2:", error);
      res.status(500).json({ error: "Erro ao fazer upload para B2", details: error.message });
    }
  });
};
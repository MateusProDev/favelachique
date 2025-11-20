# Search Console & Sitemap Setup (Maiatur)

Este arquivo descreve os passos para vincular o site ao Google Search Console, configurar sitemap e deploy no Vercel.

## Arquivos adicionados
- `/api/sitemap.xml` — função serverless que gera o sitemap XML dinamicamente (lista rotas estáticas + posts do Firestore quando configurado).
- `/public/robots.txt` — arquivo robots com referência para o sitemap.
- `/public/google-site-verification.html` — placeholder caso prefira verificação por arquivo HTML.
- `vercel.json` — rewrite para expor `/sitemap.xml` como rota pública.

## Passos rápidos
1. Deploy no Vercel (conectar repositório). Certifique-se de definir as variáveis de ambiente no painel do Vercel:

   - `NEXT_PUBLIC_BASE_URL` — ex: `https://www.seudominio.com` (opcional, melhora URLs no sitemap)
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — se quiser que o sitemap busque posts do Firestore
   - `NEXT_PUBLIC_FIREBASE_API_KEY` — chave de API para leitura pública do Firestore (opcional)

2. Depois do deploy, acesse `https://<seu-dominio>/sitemap.xml` (ou `https://<seu-dominio>/api/sitemap.xml`) e verifique se o XML é válido.

3. Verificação no Google Search Console:
   - Método recomendado: **Meta tag**. Adicione a meta tag fornecida por Search Console em seu `<head>` global (ex: `app/head.tsx` no Next.js) ou em `public/index.html`.
   - Alternativa: Faça o upload do arquivo HTML fornecido pela Search Console em `public/` (ex.: `google-site-verification.html`).

4. Envie o sitemap no Search Console:
   - Em Search Console > Sitemaps, cole: `https://<seu-dominio>/sitemap.xml` e envie.

5. Robots.txt: Edite `public/robots.txt` e substitua `<your-domain>` pelo domínio final.

## Testes locais
- A rota `api/sitemap.xml` funciona localmente com `node` em ambientes que expõem `req.headers.host`. Para testar localmente com Vercel CLI:

```bash
# instalar vercel cli se necessário
npm i -g vercel
# rodar localmente (recomendado) na raiz do projeto
vercel dev
```

## Observações e boas práticas
- Se o seu blog/coleção de posts está protegido por regras, a função não conseguirá listar posts via Firestore REST sem credenciais adequadas. Nesse caso, o sitemap incluirá apenas rotas estáticas.
- Não deixe `NEXT_PUBLIC_FIREBASE_API_KEY` vazio se você quiser que o sitemap liste posts automaticamente.
- Depois de validar o sitemap, o Google irá rastrear com base nos limites e na frequência que definir no Search Console.

Se quiser, eu posso:
- Adicionar a meta tag diretamente em `app/head.tsx` (se seu projeto for Next.js App Router).
- Implementar leitura de rotas dinâmicas de outras coleções (parceiros, pacotes) usando Firestore Admin (requer credenciais e será preciso usar rota server-side com service account).

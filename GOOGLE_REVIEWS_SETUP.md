# 🌟 Configuração do Google Reviews

Este guia mostra como integrar as avaliações do Google no seu site automaticamente.

## 📋 Índice
1. [Criar API Key do Google](#1-criar-api-key-do-google)
2. [Ativar Places API](#2-ativar-places-api)
3. [Encontrar seu Place ID](#3-encontrar-seu-place-id)
4. [Configurar Variáveis de Ambiente](#4-configurar-variáveis-de-ambiente)
5. [Adicionar ao Site](#5-adicionar-ao-site)

---

## 1. Criar API Key do Google

### Passo 1: Acessar Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Se não tiver um projeto, clique em **"Criar Projeto"**
   - Nome do projeto: `FavelaChique` (ou o que preferir)
   - Clique em **"Criar"**

### Passo 2: Criar API Key
1. No menu lateral, vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"+ CRIAR CREDENCIAIS"** → **"Chave de API"**
3. Sua API Key será criada (ex: `AIzaSyD...`)
4. **IMPORTANTE:** Clique em **"Restringir chave"** para segurança

### Passo 3: Restringir API Key (Segurança)
1. Em **"Restrições de aplicativo"**, selecione:
   - **"Referenciadores HTTP (sites)"**
2. Adicione seus domínios:
   ```
   https://seusite.com/*
   https://www.seusite.com/*
   https://seusite.vercel.app/*
   http://localhost:3000/*
   ```
3. Em **"Restrições de API"**, selecione:
   - **"Restringir chave"**
   - Escolha apenas: **"Places API"**
4. Clique em **"Salvar"**

---

## 2. Ativar Places API

1. No Google Cloud Console, vá em **"APIs e Serviços"** → **"Biblioteca"**
2. Procure por **"Places API"**
3. Clique em **"Places API"**
4. Clique em **"ATIVAR"**
5. Aguarde alguns segundos até ativar

**💰 Custo:** Google oferece $200 de crédito grátis por mês. Para um site pequeno, você não vai pagar nada!

---

## 3. Encontrar seu Place ID

### Método 1: Place ID Finder (Mais Fácil)
1. Acesse: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
2. Digite o nome do seu negócio na busca
3. Selecione seu estabelecimento no mapa
4. O **Place ID** aparecerá (ex: `ChIJN1t_tDeuEmsRUsoyG83frY4`)

### Método 2: Google Maps
1. Abra Google Maps: https://www.google.com/maps
2. Procure seu negócio
3. Clique no estabelecimento
4. Copie a URL (ex: `https://www.google.com/maps/place/...`)
5. O Place ID está na URL após `!1s` (ex: `!1sChIJN1t_tDeuEmsRUsoyG83frY4`)

### Método 3: API de Busca
Se não encontrar, use este código no navegador (F12 → Console):
```javascript
const endereco = "Rua Exemplo, 123, Cidade - Estado";
const apiKey = "SUA_API_KEY_AQUI";
fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${endereco}&inputtype=textquery&fields=place_id&key=${apiKey}`)
  .then(r => r.json())
  .then(data => console.log('Place ID:', data.candidates[0].place_id));
```

---

## 4. Configurar Variáveis de Ambiente

### Local (Desenvolvimento)
1. Crie um arquivo `.env` na raiz do projeto (se não existir)
2. Adicione:
```bash
REACT_APP_GOOGLE_PLACES_API_KEY=AIzaSyD...suaAPIkey
REACT_APP_GOOGLE_PLACE_ID=ChIJN1t_...seuPlaceID
```
3. **NUNCA** commite o arquivo `.env` no Git!

### Vercel (Produção)
1. Acesse seu projeto na Vercel: https://vercel.com/dashboard
2. Clique no projeto **"favelachique"**
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável:

   **Variável 1:**
   - Key: `REACT_APP_GOOGLE_PLACES_API_KEY`
   - Value: `AIzaSyD...suaAPIkey`
   - Environment: Production, Preview, Development ✅

   **Variável 2:**
   - Key: `REACT_APP_GOOGLE_PLACE_ID`
   - Value: `ChIJN1t_...seuPlaceID`
   - Environment: Production, Preview, Development ✅

5. Clique em **Save**
6. Faça **Redeploy** do projeto

---

## 5. Adicionar ao Site

### Opção A: Na página inicial (Recomendado)
Edite o arquivo que contém sua home page e adicione:

```jsx
import GoogleReviews from '../components/GoogleReviews/GoogleReviews';

function HomePage() {
  return (
    <div>
      {/* Seus outros componentes */}
      
      {/* Adicione onde preferir */}
      <GoogleReviews maxReviews={5} />
      
      {/* Resto da página */}
    </div>
  );
}
```

### Opção B: Em qualquer outra página
```jsx
import GoogleReviews from '../components/GoogleReviews/GoogleReviews';

<GoogleReviews maxReviews={3} />
```

**Parâmetros:**
- `maxReviews`: Número máximo de avaliações a mostrar (padrão: 5)

---

## 🎨 Personalização

### Alterar cores
Edite `src/components/GoogleReviews/GoogleReviews.css`:
```css
.google-icon {
  color: #4285f4; /* Azul do Google */
}

.google-review-button {
  border-color: #4285f4 !important;
  color: #4285f4 !important;
}
```

### Alterar número de colunas
Em `GoogleReviews.css`:
```css
.google-reviews-grid {
  grid-template-columns: repeat(3, 1fr); /* 3 colunas */
}
```

---

## ✅ Checklist Final

- [ ] API Key criada no Google Cloud Console
- [ ] API Key restrita por domínio e API
- [ ] Places API ativada
- [ ] Place ID encontrado
- [ ] Variáveis configuradas no `.env` local
- [ ] Variáveis configuradas na Vercel
- [ ] Componente adicionado na página desejada
- [ ] Site testado localmente
- [ ] Deploy feito na Vercel

---

## 🔧 Troubleshooting

### Erro: "Google Places API não configurada"
- Verifique se as variáveis de ambiente estão corretas
- Reinicie o servidor local (`npm start`)
- Na Vercel, faça redeploy após adicionar variáveis

### Erro: "This API project is not authorized"
- Verifique se a Places API está ativada
- Aguarde alguns minutos (pode demorar para propagar)
- Verifique se o domínio está autorizado nas restrições

### Não aparecem avaliações
- Verifique se seu negócio tem avaliações no Google
- Confirme que o Place ID está correto
- Veja o console do navegador (F12) para erros

### Erro de CORS
- O serviço usa proxy CORS automático
- Se houver problemas, considere usar Google Places API via backend

---

## 📊 Vantagens

✅ **Automático** - Avaliações sempre atualizadas  
✅ **Autoridade** - Logo e badge do Google  
✅ **Confiança** - Avaliações verificadas reais  
✅ **SEO** - Rich snippets com estrelas  
✅ **Gratuito** - $200/mês de crédito grátis  

---

## 🎯 Próximos Passos

Após configurar, você pode:
1. Combinar com suas avaliações locais (Firestore)
2. Criar um widget de avaliações mistas
3. Adicionar schema.org para SEO
4. Implementar filtros por nota
5. Criar uma página dedicada de avaliações

---

**Precisa de ajuda?** Verifique os logs no console do navegador (F12) ou entre em contato!

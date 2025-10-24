# 🚀 Guia Rápido - Google Reviews

## ✅ O que foi criado:

1. **`googleReviewsService.js`** - Serviço para buscar avaliações do Google
2. **`GoogleReviews`** - Componente visual para exibir avaliações do Google
3. **`CombinedReviews`** - Componente que combina Google + avaliações locais (OPCIONAL)
4. **Documentação completa** em `GOOGLE_REVIEWS_SETUP.md`

---

## 📝 Próximos Passos (5 minutos):

### 1. Obter credenciais do Google (OBRIGATÓRIO)
Siga o guia completo em: **`GOOGLE_REVIEWS_SETUP.md`**

Resumo:
- Criar API Key no Google Cloud Console
- Ativar Places API
- Encontrar seu Place ID no Google Maps

### 2. Configurar variáveis de ambiente

**Localmente:**
```bash
# Crie o arquivo .env na raiz do projeto
REACT_APP_GOOGLE_PLACES_API_KEY=AIzaSyD...
REACT_APP_GOOGLE_PLACE_ID=ChIJN1t_...
```

**Na Vercel:**
- Settings → Environment Variables
- Adicionar as mesmas variáveis acima
- Fazer redeploy

### 3. O componente já está integrado! ✅
O componente `<GoogleReviews />` já foi adicionado na página Home

---

## 🎨 Opções de Uso:

### Opção 1: GoogleReviews (Já está no site)
Mostra apenas avaliações do Google com design bonito

```jsx
<GoogleReviews maxReviews={5} />
```

### Opção 2: CombinedReviews (Alternativa)
Mostra Google + avaliações locais em abas

```jsx
import CombinedReviews from '../components/CombinedReviews/CombinedReviews';

<CombinedReviews maxReviews={6} />
```

---

## 🔍 Como testar:

1. **Configure as variáveis** no `.env`
2. **Reinicie o servidor**: `Ctrl+C` e depois `npm start`
3. **Abra o site**: http://localhost:3000
4. **Role até o final** da página - você verá a seção de avaliações do Google

---

## ⚠️ Importante:

- **Sem as credenciais**, o componente não aparece (não dá erro)
- **Gratuito até 50.000 requisições/mês** ($200 de crédito grátis)
- **Configure restrições** na API Key para segurança
- **Seu negócio precisa ter avaliações** no Google Maps

---

## 🎯 Benefícios:

✅ Avaliações reais do Google (mais confiança)  
✅ Atualização automática  
✅ Badge oficial do Google  
✅ Link para avaliar  
✅ Melhora SEO e autoridade  
✅ Não precisa copiar manualmente  

---

## 📚 Documentação Completa:

Leia: **`GOOGLE_REVIEWS_SETUP.md`** para:
- Passo a passo detalhado com prints
- Como criar API Key
- Como encontrar Place ID
- Solução de problemas
- Personalização avançada

---

## 🆘 Precisa de Ajuda?

Se tiver dúvidas, verifique:
1. Console do navegador (F12) para erros
2. Arquivo `GOOGLE_REVIEWS_SETUP.md` seção Troubleshooting
3. Logs no terminal onde roda `npm start`

Boa sorte! 🚀

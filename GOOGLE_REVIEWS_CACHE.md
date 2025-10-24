# 💾 Sistema de Cache - Google Reviews

## 📋 Como Funciona

O sistema de cache foi implementado para **economizar chamadas à API** do Google Places e melhorar a performance.

### ⏰ Duração do Cache
- **30 dias** de validade
- Dados salvos no `localStorage` do navegador
- Após 30 dias, busca automaticamente novos dados

### 💰 Economia
- Sem cache: 1 chamada a cada carregamento da página
- Com cache: 1 chamada a cada 30 dias
- **Economia de ~99%** nas chamadas à API

---

## 🎯 Configuração Atual

### O que é exibido:
- ✅ **Apenas 1 avaliação** (a melhor/primeira do Google)
- ✅ **Nota geral** e total de avaliações
- ✅ **Card clicável** que leva ao Google Reviews
- ✅ **Cache de 30 dias**

### Quando busca novos dados:
1. Primeira visita ao site
2. Cache expirado (após 30 dias)
3. Cache limpo manualmente
4. localStorage limpo pelo usuário

---

## 🔧 Gerenciar Cache (Desenvolvedor)

### Via Console do Navegador (F12)

```javascript
// Verificar status do cache
checkGoogleReviewsCache()
// Retorna: dias de uso, dias restantes, dados armazenados

// Limpar cache manualmente
clearGoogleReviewsCache()
// Depois: recarregue a página (F5)

// Forçar atualização (limpa + recarrega)
forceUpdateGoogleReviews()
```

### Via Código

```javascript
import { 
  clearGoogleReviewsCache, 
  checkGoogleReviewsCache,
  forceUpdateGoogleReviews 
} from './utils/googleReviewsCacheUtils';

// Em qualquer componente
useEffect(() => {
  const cacheInfo = checkGoogleReviewsCache();
  console.log(cacheInfo);
}, []);
```

---

## 📊 Fluxo de Dados

```
1. Usuário acessa o site
   ↓
2. GoogleReviews carrega
   ↓
3. Verifica localStorage
   ↓
   ├─ Cache válido? → Usa cache (instantâneo)
   │
   └─ Cache expirado/inexistente?
      ↓
      Busca API do Google
      ↓
      Salva no localStorage
      ↓
      Exibe dados
```

---

## 🗄️ Estrutura do Cache

O cache é salvo assim no `localStorage`:

```javascript
{
  "data": {
    "name": "Nome do Negócio",
    "rating": 4.8,
    "totalReviews": 250,
    "reviews": [...], // Array com avaliações
    "googleUrl": "https://..."
  },
  "timestamp": 1729785600000 // Data em millisegundos
}
```

**Chave:** `google_reviews_cache`

---

## ⚙️ Personalização

### Alterar duração do cache

Edite `src/services/googleReviewsService.js`:

```javascript
// Trocar de 30 para 7 dias
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// Trocar para 1 dia
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Trocar para 1 hora (testes)
const CACHE_DURATION = 60 * 60 * 1000;
```

### Desabilitar cache (não recomendado)

```javascript
// Comentar estas linhas em getGooglePlaceDetails()
const cachedData = getCachedData();
if (cachedData) {
  return cachedData;
}

// E também comentar:
setCachedData(result);
```

---

## 🚀 Vantagens do Cache

✅ **Performance** - Carregamento instantâneo  
✅ **Economia** - Menos chamadas à API  
✅ **Confiabilidade** - Funciona offline  
✅ **Custo Zero** - Usa localStorage gratuito  
✅ **Simples** - Gerenciamento automático  

---

## ⚠️ Limitações

- Cache é **por navegador/dispositivo**
- Limpar dados do navegador **remove o cache**
- Modo anônimo **não persiste cache**
- Cache não sincroniza entre dispositivos

---

## 🔍 Debug

### Verificar se cache está funcionando

1. Abra o console (F12)
2. Digite: `checkGoogleReviewsCache()`
3. Veja as informações:

```
📊 Informações do Cache:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Criado há: 5 dias ( 120 horas)
⏰ Válido por mais: 25 dias
⭐ Nota: 4.8
📝 Total de avaliações: 250
💬 Avaliações no cache: 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Verificar localStorage no DevTools

1. F12 → Application (Chrome) ou Storage (Firefox)
2. Local Storage → seu domínio
3. Procure por: `google_reviews_cache`

---

## 🆘 Problemas Comuns

### Cache não está salvando
- Verifique se localStorage está habilitado
- Modo anônimo não salva dados
- Extensões podem bloquear localStorage

### Dados desatualizados
- Execute: `forceUpdateGoogleReviews()`
- Ou aguarde os 30 dias expirarem

### Erro ao buscar API
- Cache continua funcionando
- Mostra dados antigos até resolver
- Verifique credenciais da API

---

## 📝 Logs no Console

O sistema exibe logs úteis:

```
✅ Usando cache de avaliações do Google (válido por mais 25 dias)
💾 Avaliações do Google salvas no cache (válido por 30 dias)
```

Para desabilitar logs, remova os `console.log()` em:
- `src/services/googleReviewsService.js`

---

**Dúvidas?** Verifique `src/services/googleReviewsService.js` e `src/utils/googleReviewsCacheUtils.js`

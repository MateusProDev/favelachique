# 📝 Como Adicionar Avaliações do Google (MANUAL)

## ✅ Versão Simples - SEM API, SEM CARTÃO!

Esta é uma solução **super fácil** para mostrar avaliações do Google no seu site, sem precisar de API ou cartão de crédito.

---

## 🎯 Como Funciona

Você vai **copiar e colar** as avaliações do Google diretamente no código. Simples assim!

---

## 📋 PASSO A PASSO

### **1. Pegue o link do seu Google Reviews**

1. Abra Google Maps: https://www.google.com/maps
2. Procure seu negócio
3. Clique em **"Compartilhar"**
4. Clique em **"Copiar link"**
5. Cole em algum lugar temporariamente

**OU** pegue o link direto para avaliações:
- Procure seu negócio no Google
- Na lateral direita, clique em **"Avaliações do Google"**
- Copie a URL da página

---

### **2. Veja sua nota e total de avaliações**

No Google Maps, veja:
- **Nota:** Ex: 4.8 ⭐
- **Total:** Ex: "150 avaliações"

---

### **3. Copie as avaliações que quer mostrar**

1. Abra seu Google Reviews
2. Escolha **1 a 3 avaliações** boas
3. Copie:
   - Nome da pessoa
   - Quantas estrelas (1-5)
   - Quanto tempo atrás (Ex: "Há 2 meses")
   - Texto da avaliação

---

### **4. Edite o arquivo do componente**

Abra o arquivo:
```
src/components/GoogleReviews/GoogleReviews.jsx
```

Procure por `GOOGLE_REVIEWS_DATA` (linha ~17) e edite:

```javascript
const GOOGLE_REVIEWS_DATA = {
  // 1. Cole o link do Google Reviews aqui
  googleUrl: 'https://g.page/r/SEU_LINK_AQUI/review',
  
  // 2. Coloque a nota média (veja no Google Maps)
  rating: 4.8,
  
  // 3. Coloque o total de avaliações
  totalReviews: 150,
  
  // 4. Cole as avaliações aqui
  reviews: [
    {
      author_name: 'Nome da Pessoa',
      author_avatar: '', // Deixe vazio
      rating: 5, // 1 a 5 estrelas
      time: 'Há 2 meses', // Copie do Google
      text: 'Cole o texto da avaliação aqui.'
    },
    // Adicione mais se quiser (máximo recomendado: 3)
    {
      author_name: 'Outra Pessoa',
      author_avatar: '',
      rating: 5,
      time: 'Há 1 mês',
      text: 'Outra avaliação aqui.'
    },
  ]
};
```

---

### **5. Salve e pronto!**

Salve o arquivo e recarregue o site. A avaliação vai aparecer! 🎉

---

## 📸 EXEMPLO REAL

```javascript
const GOOGLE_REVIEWS_DATA = {
  googleUrl: 'https://g.page/r/CZxyz123/review',
  rating: 4.9,
  totalReviews: 87,
  
  reviews: [
    {
      author_name: 'Maria Santos',
      author_avatar: '',
      rating: 5,
      time: 'Há 3 semanas',
      text: 'Experiência incrível! O tour pela comunidade foi muito bem organizado. O guia conhecia cada história do local. Super recomendo para quem quer conhecer de verdade!'
    },
    {
      author_name: 'João Silva',
      author_avatar: '',
      rating: 5,
      time: 'Há 2 meses',
      text: 'Adorei! Valeu muito a pena. Aprendi muito sobre a cultura local.'
    },
  ]
};
```

---

## 🎨 Resultado

O site vai mostrar:

1. **Cabeçalho** com nota geral (4.9 ⭐) e total (87 avaliações)
2. **1 card** com a primeira avaliação
3. Ao **clicar** no card → Abre o Google Reviews

---

## 🔄 Como Atualizar

Quando quiser mudar as avaliações:

1. Abra `src/components/GoogleReviews/GoogleReviews.jsx`
2. Edite o array `reviews`
3. Salve
4. Recarregue o site

**Simples assim!** ✅

---

## 💡 Dicas

### Quantas avaliações mostrar?
- **1 avaliação:** Mais limpo, minimalista ✅
- **2-3 avaliações:** Mais completo
- **Não recomendo mais que 3** para não poluir

### Escolha boas avaliações:
- ⭐⭐⭐⭐⭐ 5 estrelas
- Texto detalhado
- Que mencione pontos fortes
- Recentes (últimos 3-6 meses)

### Avatar (foto):
- Deixe `author_avatar: ''` vazio
- O sistema usa a **inicial do nome** automaticamente
- Fica bonito e profissional!

---

## ❓ FAQ

**P: Posso adicionar quantas avaliações?**  
R: Sim! Mas recomendo 1-3 para não poluir a página.

**P: Precisa atualizar manualmente?**  
R: Sim. Mas como são poucas avaliações, atualiza quando quiser.

**P: E se não tiver Google Reviews?**  
R: Crie um Google Meu Negócio ou use só as avaliações locais do sistema.

**P: O link do Google funciona?**  
R: Sim! Ao clicar no card, abre suas avaliações do Google.

**P: Quanto custa?**  
R: **ZERO!** Sem API, sem custo, sem cartão.

---

## ✅ Checklist

- [ ] Peguei o link do Google Reviews
- [ ] Vi a nota média e total
- [ ] Copiei 1-3 avaliações boas
- [ ] Editei `GoogleReviews.jsx`
- [ ] Salvei o arquivo
- [ ] Testei no navegador
- [ ] Funcionou! 🎉

---

**Qualquer dúvida, é só me chamar!** 😊

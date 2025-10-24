# 🎨 Hero Carousel - Sistema Completo

## 📋 Visão Geral

Sistema de **Hero Carousel gerenciável** que substitui o banner estático por um carrossel dinâmico com múltiplas imagens, cada uma com seu próprio título, descrição e botão de ação.

---

## ✨ Funcionalidades

### Para o Usuário (Front-end)
- ✅ Carrossel automático que muda a cada 5 segundos
- ✅ Navegação manual com botões (← →)
- ✅ Indicadores (dots) para navegação rápida
- ✅ Pausa automática ao passar o mouse
- ✅ Animações suaves entre slides
- ✅ 100% Responsivo
- ✅ Cada slide tem:
  - Imagem de fundo em tela cheia
  - Título personalizado
  - Descrição
  - Botão de ação com link

### Para o Admin (Dashboard)
- ✅ Adicionar novos slides
- ✅ Editar slides existentes
- ✅ Excluir slides
- ✅ Reordenar slides (setas ↑ ↓)
- ✅ Upload de imagens direto para Firebase Storage
- ✅ Preview de imagens antes de salvar
- ✅ Gerenciamento completo via interface visual

---

## 🚀 Como Usar (Admin)

### 1. Acessar o Painel Admin
```
URL: /admin/hero-slides
Menu: Dashboard Admin → Hero Carousel
```

### 2. Adicionar Novo Slide

1. Clique no botão **"Adicionar Slide"**
2. Preencha os campos:
   - **Título**: Título principal do slide (Ex: "Bem-vindo à Favela Chique")
   - **Descrição**: Texto descritivo (Ex: "Experiências únicas...")
   - **Texto do Botão**: Texto que aparece no botão (Ex: "Conheça Nossos Tours")
   - **Link do Botão**: Para onde o botão leva (Ex: "/pacotes")
3. Clique em **"Selecionar Imagem"** e escolha uma foto
4. Visualize o preview da imagem
5. Clique em **"Salvar"**

### 3. Editar Slide Existente

1. Na lista de slides, clique no ícone de **lápis (✏️)**
2. Modifique os campos desejados
3. Para trocar a imagem, clique em **"Trocar Imagem"**
4. Clique em **"Salvar"**

### 4. Reordenar Slides

- Use as **setas ↑ ↓** na coluna "Ordem"
- O primeiro slide da lista aparece primeiro no carrossel
- Ordem é salva automaticamente

### 5. Excluir Slide

1. Clique no ícone de **lixeira (🗑️)**
2. Confirme a exclusão

---

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── HeroCarousel/
│   │   ├── HeroCarousel.jsx       # Componente do carrossel
│   │   └── HeroCarousel.css       # Estilos do carrossel
│   │
│   └── AdminHeroSlides/
│       ├── AdminHeroSlides.jsx    # Painel admin
│       └── AdminHeroSlides.css    # Estilos do admin
│
└── pages/
    └── Home/
        └── Home.jsx               # Usa <HeroCarousel />
```

---

## 🗄️ Estrutura do Firestore

### Coleção: `heroSlides`

Cada documento contém:

```javascript
{
  title: "Título do Slide",
  description: "Descrição do slide",
  buttonText: "Texto do Botão",
  buttonLink: "/link-destino",
  imageUrl: "https://firebase.storage.../imagem.jpg",
  order: 0,
  createdAt: "2025-10-24T...",
  updatedAt: "2025-10-24T..."
}
```

---

## 🎨 Personalização

### Velocidade do Carrossel

Em `HeroCarousel.jsx`, linha ~66:
```javascript
}, 5000); // Muda a cada 5 segundos
```

### Cores do Botão

Em `HeroCarousel.css`, linha ~97:
```css
background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
```

### Altura do Hero

Em `HeroCarousel.css`, linha ~2:
```css
height: 100vh; /* 100% da altura da tela */
min-height: 600px;
```

### Overlay (Escurecimento)

Em `HeroCarousel.css`, linha ~29:
```css
background: linear-gradient(
  135deg,
  rgba(0, 0, 0, 0.6) 0%,    /* Ajuste a opacidade aqui */
  rgba(0, 0, 0, 0.3) 50%,
  rgba(0, 0, 0, 0.5) 100%
);
```

---

## 📱 Responsividade

### Desktop (> 768px)
- Hero em tela cheia (100vh)
- Botões de navegação nos lados
- Todos os elementos visíveis

### Tablet (768px - 480px)
- Hero em 80vh
- Botões menores
- Fonte reduzida

### Mobile (< 480px)
- Hero em 70vh
- Botões ainda menores
- Texto otimizado
- Dots menores

---

## 🔥 Dicas de Uso

### Imagens Recomendadas
- **Resolução**: 1920x1080 ou superior
- **Formato**: JPG ou PNG
- **Peso**: Máximo 2MB (otimize antes)
- **Aspecto**: Paisagem (horizontal)
- **Conteúdo**: Evite textos na imagem

### Textos Ideais
- **Título**: 3-8 palavras
- **Descrição**: 10-20 palavras
- **Botão**: 2-4 palavras

### Quantidade de Slides
- **Mínimo**: 1 slide (funciona sem carrossel)
- **Ideal**: 3-5 slides
- **Máximo**: Ilimitado (mas evite mais de 7)

---

## 🐛 Solução de Problemas

### Slide não aparece?
1. Verifique se a imagem foi enviada
2. Confirme que título e descrição estão preenchidos
3. Recarregue a página

### Carrossel não gira automaticamente?
1. Verifique se há mais de 1 slide
2. Tire o mouse de cima do hero
3. Limpe o cache do navegador

### Imagem não carrega?
1. Verifique o tamanho (máx 5MB)
2. Use formatos JPG ou PNG
3. Confira as permissões do Firebase Storage

---

## 🎯 Migração do Banner Antigo

O componente `Banner` antigo foi substituído por `HeroCarousel`.

### Antes:
```jsx
<Banner />
```

### Depois:
```jsx
<HeroCarousel />
```

O banner antigo ainda existe mas não é mais usado na Home.

---

## 📊 Benefícios do Sistema

✅ **Flexibilidade**: Múltiplos slides com conteúdos diferentes
✅ **Gerenciável**: Admin controla tudo sem código
✅ **Profissional**: Visual moderno e impactante
✅ **Conversão**: Botões de ação direcionam usuários
✅ **Dinâmico**: Fácil atualizar promoções e novidades
✅ **SEO Friendly**: Textos indexáveis pelos buscadores

---

## 🚀 Próximos Passos

1. **Adicione seus primeiros slides** no painel admin
2. **Use imagens de alta qualidade** do seu negócio
3. **Teste em diferentes dispositivos** (mobile, tablet, desktop)
4. **Monitore cliques nos botões** para otimizar CTAs
5. **Atualize regularmente** com novas promoções

---

**Sistema desenvolvido para Favela Chique Turismo** 🎨✨

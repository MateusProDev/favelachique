# 🎨 Hero Carousel - Sistema Simplificado e Funcional

## ✅ Sistema Corrigido

### O que foi mudado?

#### ❌ ANTES (Com Problemas):
- Usava coleção separada `heroSlides` no Firestore
- Upload direto para Firebase Storage (causava erro de CORS)
- Sistema complexo com múltiplos documentos
- Componente `AdminHeroSlides` separado

#### ✅ AGORA (Funcionando):
- Usa documento `content/heroSlides` (igual ao Banner)
- Upload via API serverless `/api/upload` (mesmo do EditBanner)
- Array de slides em um único documento
- Componente `EditHeroSlides` integrado

---

## 🚀 Como Usar

### 1. Acessar o Painel
```
URL: /admin/hero-slides
Menu: Dashboard Admin → Hero Carousel
```

### 2. Adicionar Novo Slide

1. Clique em **"Adicionar Novo Slide"**
2. Preencha os campos:
   - **Título**: Até 60 caracteres
   - **Descrição**: Até 150 caracteres
   - **Texto do Botão**: Opcional
   - **Link do Botão**: Opcional (ex: `/pacotes`)
3. Clique em **"Selecionar Imagem"**
4. Aguarde o upload (usa a API do projeto)
5. Clique em **"Salvar Todas as Alterações"**

### 3. Editar Slide

1. Clique no ícone de **lápis (✏️)** no card do slide
2. O card expande mostrando todos os campos
3. Modifique o que desejar
4. Clique em **"Salvar Todas as Alterações"**

### 4. Reordenar Slides

- Use as **setas ↑ ↓** no cabeçalho do card
- O primeiro slide aparece primeiro no carrossel
- Salve após reordenar

### 5. Remover Slide

1. Clique no ícone de **lixeira (🗑️)**
2. Confirme a remoção
3. **Mínimo: 1 slide sempre** (não pode remover todos)

---

## 📁 Estrutura no Firestore

### Documento: `content/heroSlides`

```javascript
{
  slides: [
    {
      title: "Título do Slide 1",
      description: "Descrição do slide 1",
      imageUrl: "https://favelachique-2b35b.web.app/uploads/...",
      buttonText: "Texto do Botão",
      buttonLink: "/pacotes"
    },
    {
      title: "Título do Slide 2",
      description: "Descrição do slide 2",
      imageUrl: "https://...",
      buttonText: "Saiba Mais",
      buttonLink: "/sobre"
    }
  ]
}
```

---

## 🔧 Componentes

### 1. HeroCarousel.jsx (Front-end)
**Localização**: `src/components/HeroCarousel/HeroCarousel.jsx`

**O que faz**:
- Busca slides do documento `content/heroSlides`
- Exibe carrossel com auto-play (5 segundos)
- Navegação com botões e dots
- Fallback para gradiente se não houver imagem

**Importa de**: `firebase/firebase` (NÃO firebaseConfig)

### 2. EditHeroSlides.jsx (Admin)
**Localização**: `src/components/Admin/EditHeroSlides/EditHeroSlides.jsx`

**O que faz**:
- Interface de gerenciamento completa
- Upload de imagens via API `/api/upload`
- Edição inline de campos
- Reordenação de slides
- Salvamento em lote

**Baseado em**: `EditBanner.jsx` (usa mesma estrutura)

---

## 🎯 Vantagens do Sistema Atual

✅ **Sem erro de CORS** - Usa API serverless existente
✅ **Simples** - Um documento, array de slides
✅ **Consistente** - Mesma estrutura do Banner
✅ **Funcional** - Upload testado e aprovado
✅ **Fácil backup** - Dados em um único documento
✅ **Performance** - Leitura única no Firestore

---

## 🐛 Solução de Problemas

### Erro: "Access to XMLHttpRequest blocked by CORS"
**Solução**: Sistema já corrigido! Não usa mais Firebase Storage direto.

### Slide não aparece?
1. Verifique se salvou as alterações
2. Limpe o cache do navegador (Ctrl + F5)
3. Verifique no Firestore se o documento `content/heroSlides` existe

### Imagem não carrega?
1. Tamanho máximo: 5MB
2. Formatos: JPG, PNG, WebP
3. Aguarde o upload completar (spinner verde)
4. Verifique se a URL da imagem está salva

### Carrossel não gira?
1. Precisa ter mais de 1 slide
2. Tire o mouse de cima do hero
3. Verifique console do navegador por erros

---

## 📸 Dicas de Imagens

### Tamanho Ideal
- **Resolução**: 1920x1080px (Full HD)
- **Aspecto**: 16:9 (paisagem)
- **Peso**: 500KB - 1.5MB (otimizado)

### Conteúdo
- Evite textos na imagem (use os campos de título)
- Foco no centro (visível em mobile)
- Contraste bom para texto branco sobrepor
- Alta qualidade mas otimizada

### Ferramentas de Otimização
- TinyPNG.com
- Squoosh.app
- ImageOptim (Mac)

---

## 🎨 Personalização

### Mudar Velocidade do Carrossel
**Arquivo**: `HeroCarousel.jsx` linha ~64
```javascript
}, 5000); // 5000 = 5 segundos
```

### Mudar Cores do Botão
**Arquivo**: `HeroCarousel.css` linha ~97
```css
background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
```

### Mudar Altura do Hero
**Arquivo**: `HeroCarousel.css` linha ~2
```css
height: 100vh; /* 100% da altura da viewport */
min-height: 600px;
```

### Cor de Fundo Padrão (sem imagem)
**Arquivo**: `HeroCarousel.jsx` linha ~103
```javascript
: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
```

---

## 🔄 Migração do Banner Antigo

Se você tinha conteúdo no banner antigo e quer migrar:

1. Acesse `/admin/edit-banner`
2. Copie o título, descrição, imagem
3. Acesse `/admin/hero-slides`
4. Adicione um novo slide com esses dados
5. Salve

O banner antigo (`Banner.jsx`) ainda existe mas não é mais usado na Home.

---

## 📊 Estrutura de Arquivos

```
src/
├── components/
│   ├── HeroCarousel/
│   │   ├── HeroCarousel.jsx       ← Front-end
│   │   └── HeroCarousel.css
│   │
│   └── Admin/
│       └── EditHeroSlides/
│           ├── EditHeroSlides.jsx ← Admin
│           └── EditHeroSlides.css
│
├── pages/
│   └── Home/
│       └── Home.jsx               ← Usa <HeroCarousel />
│
└── App.jsx                        ← Rota /admin/hero-slides
```

---

## ✨ Resultado Final

Um sistema de Hero Carousel:
- ✅ Totalmente funcional
- ✅ Sem erros de CORS
- ✅ Upload de imagens funcionando
- ✅ Interface admin intuitiva
- ✅ Carrossel automático no site
- ✅ Responsivo e profissional

---

**Sistema desenvolvido e corrigido para 20Buscar Vacation Beach** 🎨✨

---

## 🆘 Suporte

**Problema com upload?**
- Verifique se o endpoint `/api/upload` está funcionando
- Teste primeiro no EditBanner (se funciona lá, funciona aqui)

**Problema com Firestore?**
- Verifique permissões do Firestore
- Documento deve estar em: `content/heroSlides`

**Problema visual?**
- Limpe cache: Ctrl + Shift + Delete
- Teste em aba anônima
- Verifique console por erros CSS

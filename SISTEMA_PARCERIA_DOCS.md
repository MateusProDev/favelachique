# 🤝 Sistema de Parceria - Favela Chique

## 📋 Visão Geral

Sistema completo de gerenciamento de parceiros para o site Favela Chique, permitindo cadastrar, gerenciar e exibir empresas/pessoas parceiras com design moderno e funcional.

## ✨ Funcionalidades Implementadas

### 1. **Modelo de Dados** (`src/models/Parceiro.js`)
- Estrutura completa de dados do parceiro
- Validações automáticas
- Métodos para conversão Firestore
- Campos inclusos:
  - Informações básicas (nome, descrição, categoria, logo)
  - Contatos (telefone, email, WhatsApp, website)
  - Endereço completo
  - Redes sociais (Facebook, Instagram, Twitter, LinkedIn)
  - Benefícios e vantagens
  - Tags para filtros
  - Galeria de imagens
  - Status (ativo/inativo, destaque)
  - Ordem de exibição

### 2. **Serviço Firebase** (`src/services/parceiroService.js`)
- Integração completa com Firestore
- Upload de imagens via Cloudinary
- Operações CRUD:
  - `buscarTodos()` - Lista todos os parceiros
  - `buscarAtivos()` - Apenas parceiros ativos
  - `buscarDestaques()` - Parceiros em destaque
  - `buscarPorId(id)` - Detalhes de um parceiro
  - `buscarPorCategoria(cat)` - Filtro por categoria
  - `criar(dados, arquivos)` - Criar novo parceiro
  - `atualizar(id, dados, arquivos)` - Atualizar parceiro
  - `deletar(id)` - Remover parceiro
  - `toggleAtivo(id)` - Ativar/Desativar
  - `toggleDestaque(id)` - Destacar/Remover destaque

### 3. **Utilitário Cloudinary** (`src/utils/cloudinaryHelper.js`)
- Upload de imagens otimizado
- Upload múltiplo de imagens
- Validação de tipo e tamanho
- Configuração:
  - Cloud Name: `doeiv6m4h`
  - Upload Preset: `qc7tkpck`
  - Pasta: `parceiros/`

### 4. **Admin - Gerenciamento** (`src/components/AdminParceiros/`)
**Funcionalidades:**
- ✅ Listagem em grid com cards modernos
- ✅ Criação de novos parceiros
- ✅ Edição completa de parceiros existentes
- ✅ Exclusão com confirmação
- ✅ Toggle rápido de status (ativo/inativo)
- ✅ Toggle rápido de destaque
- ✅ Filtros por categoria
- ✅ Upload de logo (obrigatório)
- ✅ Upload de imagem de capa (opcional)
- ✅ Upload de galeria (múltiplas imagens)
- ✅ Formulário em tabs:
  - **Tab 1:** Informações Básicas
  - **Tab 2:** Contato e Endereço
  - **Tab 3:** Imagens (Logo, Capa, Galeria)
  - **Tab 4:** Detalhes Adicionais (Benefícios, Tags)

**Design:**
- Interface Material-UI moderna
- Cards com hover effects
- Badges de status e categoria
- Notificações toast
- Loading states
- Animações suaves

### 5. **Seção na Home** (`src/components/ParceirosSection/`)
**Características:**
- Exibe parceiros em destaque (configurável)
- Grid responsivo
- Filtros por categoria (opcional)
- Botão "Ver Todos os Parceiros"
- Design com gradientes e efeitos
- Animações de entrada
- Ícone de handshake animado

**Uso:**
```jsx
// Na Home.jsx
<ParceirosSection destaquesOnly={true} limite={6} />

// Em página separada de parceiros
<ParceirosSection destaquesOnly={false} />
```

### 6. **Card do Parceiro** (`src/components/ParceiroCard/`)
**Elementos:**
- Logo em destaque
- Badge de parceiro em destaque (se aplicável)
- Imagem de capa (opcional)
- Nome e categoria
- Descrição breve
- Tags (até 3)
- Benefício principal
- Contatos rápidos (WhatsApp, Telefone)
- Botões de ação:
  - "Ver Detalhes"
  - "Visitar Site" (se tiver website)

**Efeitos:**
- Hover com elevação
- Animações suaves
- Gradiente de fundo no logo
- Pulsação no badge de destaque

### 7. **Página de Detalhes** (`src/pages/ParceiroDetailPage/`)
**Estrutura:**
- **Hero Section:**
  - Imagem de capa ou logo em grande escala
  - Breadcrumb de navegação
  - Overlay com gradiente

- **Conteúdo Principal:**
  - Logo + Nome + Categoria
  - Badge de destaque
  - Descrição completa
  - Lista de benefícios com ícones
  - Tags
  - Galeria de imagens (se houver):
    - Imagem principal
    - Navegação (anterior/próximo)
    - Thumbnails clicáveis

- **Sidebar (Sticky):**
  - Botões principais:
    - "Visitar Website" (gradiente roxo)
    - "WhatsApp" (verde)
  - Informações de contato clicáveis
  - Redes sociais com ícones coloridos
  - Card de localização:
    - Endereço completo
    - Botão "Ver no Mapa"

## 🎨 Design e UX

### Paleta de Cores
- **Primária:** Gradiente roxo (#667eea → #764ba2)
- **Destaque:** Dourado (#ffd700 → #ffed4e)
- **Sucesso:** Verde (#25D366 - WhatsApp)
- **Background:** Cinza claro (#f8f9fa)
- **Texto:** #2c3e50 (títulos), #666 (corpo)

### Animações
- FadeInUp nos cards (stagger)
- Hover com elevação e scale
- Float no ícone de handshake
- Rotate no background do logo
- Pulse no badge de destaque
- ZoomIn no hero

### Responsividade
✅ Mobile (< 600px)
✅ Tablet (600px - 960px)
✅ Desktop (> 960px)

## 🚀 Rotas Implementadas

```javascript
// Públicas
/parceiro/:id                    // Detalhes do parceiro

// Admin
/admin/parceiros                 // Gerenciamento de parceiros
```

## 📁 Estrutura de Arquivos Criada

```
src/
├── models/
│   └── Parceiro.js
├── services/
│   └── parceiroService.js
├── utils/
│   └── cloudinaryHelper.js
├── components/
│   ├── AdminParceiros/
│   │   ├── AdminParceiros.jsx
│   │   └── AdminParceiros.css
│   ├── ParceiroCard/
│   │   ├── ParceiroCard.jsx
│   │   └── ParceiroCard.css
│   └── ParceirosSection/
│       ├── ParceirosSection.jsx
│       └── ParceirosSection.css
└── pages/
    └── ParceiroDetailPage/
        ├── ParceiroDetailPage.jsx
        └── ParceiroDetailPage.css
```

## 🔧 Configuração Firebase

### Coleção: `parceiros`

**Índices Necessários (Firestore):**
```
parceiros: [ordem: asc, nome: asc]
parceiros: [ativo: asc, ordem: asc, nome: asc]
parceiros: [ativo: asc, destaque: asc, ordem: asc]
parceiros: [categoria: asc, ativo: asc, ordem: asc]
```

### Regras de Segurança Sugeridas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /parceiros/{parceiroId} {
      // Leitura pública (apenas ativos)
      allow read: if true;
      
      // Escrita apenas para admins autenticados
      allow write: if request.auth != null;
    }
  }
}
```

## 📊 Categorias Disponíveis

1. Hospedagem
2. Restaurante
3. Transporte
4. Turismo
5. Agência de Viagens
6. Entretenimento
7. Comércio Local
8. Serviços
9. Outros

## 💡 Como Usar

### 1. Adicionar Parceiro (Admin)
1. Acesse `/admin/parceiros`
2. Clique em "Novo Parceiro"
3. Preencha as 4 tabs:
   - Informações Básicas *
   - Contato e Endereço
   - Imagens (Logo obrigatório)
   - Detalhes Adicionais
4. Clique em "Criar Parceiro"

### 2. Editar Parceiro
1. Na listagem, clique no ícone de edição
2. Modifique os campos desejados
3. Clique em "Atualizar Parceiro"

### 3. Ativar/Desativar
- Clique no ícone de olho no card do parceiro

### 4. Destacar Parceiro
- Clique no ícone de estrela no card do parceiro
- Parceiros em destaque aparecem na home

### 5. Exibir na Home
```jsx
// Já implementado em Home.jsx
<ParceirosSection destaquesOnly={true} limite={6} />
```

## 🎯 Boas Práticas

### Upload de Imagens
- **Logo:** PNG transparente (recomendado 500x500px)
- **Capa:** JPG/PNG landscape (recomendado 1200x400px)
- **Galeria:** JPG (recomendado 1000x750px)
- **Tamanho máximo:** 10MB por imagem

### Descrições
- **Breve:** 100-150 caracteres (aparece no card)
- **Completa:** 300-500 caracteres (página de detalhes)

### Benefícios
- Use frases curtas e diretas
- Ex: "Desconto de 10% para clientes", "Wi-Fi grátis"

### Tags
- Palavras-chave relevantes
- Ex: "família", "luxo", "econômico", "pet-friendly"

## 🔗 Integração com WhatsApp

O sistema gera links automáticos do WhatsApp com mensagem personalizada:

```
https://wa.me/5511999999999?text=Olá! Vim através do site Favela Chique e gostaria de saber mais sobre [Nome do Parceiro].
```

## 📱 Features Especiais

✨ **Sticky Sidebar** - Informações de contato sempre visíveis
✨ **Galeria Interativa** - Navegação entre imagens com thumbnails
✨ **Botões de Ação Inteligentes** - Aparecem apenas se o parceiro tiver os dados
✨ **Integração Google Maps** - Link direto para o endereço
✨ **Redes Sociais** - Ícones coloridos com links diretos
✨ **Filtros por Categoria** - Na seção de parceiros
✨ **Status Visual** - Badges coloridos indicando status

## 🎉 Resultado Final

Um sistema completo, profissional e moderno de parceria que:
- ✅ Facilita o gerenciamento de parceiros
- ✅ Exibe parceiros de forma atrativa
- ✅ Permite contato direto e fácil
- ✅ É totalmente responsivo
- ✅ Tem design consistente com o resto do site
- ✅ Usa as melhores práticas de UX/UI
- ✅ Integra Firebase e Cloudinary perfeitamente

---

## 🚀 Próximos Passos Sugeridos

1. **Sistema de Avaliações** - Permitir que usuários avaliem parceiros
2. **Horário de Funcionamento** - Exibir se está aberto/fechado
3. **Mapa Interativo** - Embed do Google Maps na página de detalhes
4. **Compartilhamento Social** - Botões para compartilhar parceiro
5. **Newsletter** - Notificar sobre novos parceiros
6. **Sistema de Busca** - Busca textual por nome/categoria
7. **Estatísticas** - Rastrear cliques e visualizações

---

**Desenvolvido com ❤️ para Favela Chique**

# Sistema de Parceiros - Suporte a Múltiplos Locais

## 🎯 Melhorias Implementadas

### ✅ Novos Campos no Modelo

#### 1. **Múltiplos Locais/Unidades**
Agora é possível cadastrar parceiros com várias unidades (ex: Chico do Caranguejo com filiais em diferentes locais).

Cada local possui:
- **Nome do local** (ex: "Unidade Centro", "Filial Praia")
- **Endereço completo** com ponto de referência
- **Contatos específicos** (telefone, WhatsApp, email)
- **Horário de funcionamento** por dia da semana + feriados
- **Coordenadas GPS** (latitude/longitude)
- **Observações** (ex: "Aceita cartão", "Estacionamento próprio")

#### 2. **Especialidades**
Lista de especialidades do parceiro
- Ex: "Frutos do mar", "Caranguejo", "Cerveja gelada"
- Útil para restaurantes, hotéis, etc.

#### 3. **Formas de Pagamento**
Métodos de pagamento aceitos
- Ex: "Dinheiro", "Cartão de Crédito", "PIX", "Vale Refeição"

#### 4. **Redes Sociais Expandidas**
Adicionado suporte para:
- YouTube
- TikTok

(Mantido: Facebook, Instagram, Twitter, LinkedIn)

---

## 📋 Estrutura de Dados

### Modelo Parceiro

```javascript
{
  // Campos básicos (sem alterações)
  nome: "Chico do Caranguejo",
  categoria: "Restaurante",
  descricaoBreve: "O melhor caranguejo da cidade",
  
  // NOVO: Array de locais
  locais: [
    {
      nome: "Unidade Centro",
      endereco: {
        rua: "Rua das Flores",
        numero: "123",
        bairro: "Centro",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        cep: "20000-000",
        complemento: "Loja 5",
        referencia: "Próximo ao shopping" // NOVO
      },
      telefone: "(21) 1234-5678",
      whatsapp: "5521912345678",
      email: "centro@chico.com",
      horarioFuncionamento: {
        segunda: "11h-23h",
        terca: "11h-23h",
        quarta: "11h-23h",
        quinta: "11h-23h",
        sexta: "11h-00h",
        sabado: "11h-00h",
        domingo: "11h-22h",
        feriados: "12h-20h" // NOVO
      },
      coordenadas: {
        latitude: -22.9068,
        longitude: -43.1729
      },
      observacoes: "Aceita cartão. Estacionamento próprio." // NOVO
    },
    {
      nome: "Unidade Copacabana",
      // ... mesma estrutura
    }
  ],
  
  // NOVO: Especialidades
  especialidades: [
    "Frutos do mar",
    "Caranguejo",
    "Cerveja gelada",
    "Petiscos"
  ],
  
  // NOVO: Formas de pagamento
  formasPagamento: [
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
    "PIX",
    "Vale Refeição"
  ],
  
  // Redes sociais expandidas
  redesSociais: {
    facebook: "...",
    instagram: "...",
    twitter: "...",
    linkedin: "...",
    youtube: "...", // NOVO
    tiktok: "..." // NOVO
  }
}
```

---

## 🎨 Interface Administrativa

### Abas do Formulário

1. **Informações Básicas**
   - Nome, Categoria, Descrições
   - Ordem de exibição
   - Status (Ativo/Destaque)

2. **Contato e Endereço**
   - Contatos gerais (website, email, telefone, WhatsApp)
   - Redes sociais (6 plataformas)
   - Endereço principal (compatibilidade)

3. **Locais/Unidades** ⭐ NOVO
   - Adicionar/Remover múltiplos locais
   - Cada local com endereço completo
   - Horários específicos por local
   - Contatos específicos por local
   - Observações e referências

4. **Imagens**
   - Logo (obrigatório)
   - Imagem de capa
   - Galeria de imagens

5. **Detalhes Adicionais**
   - Especialidades ⭐ NOVO
   - Formas de Pagamento ⭐ NOVO
   - Benefícios/Vantagens
   - Tags

---

## 🔧 Integração com Firebase e Cloudinary

### ✅ Firebase Firestore
- Usa `initializeApp` e `getFirestore` do `firebase/firebaseConfig.js`
- Coleção: `parceiros`
- Índices configurados (ver `FIRESTORE_INDICES_PARCEIROS.md`)

### ✅ Cloudinary
- Cloud name: `doeiv6m4h`
- Upload preset: `qc7tkpck`
- Pastas organizadas:
  - `parceiros/logos`
  - `parceiros/capas`
  - `parceiros/galeria`

---

## 📝 Validações

### Campos Obrigatórios
- Nome
- Categoria
- Descrição Breve
- Logo (upload)

### Campos Opcionais
- Website (valida URL se preenchido)
- Email (valida formato se preenchido)
- Todos os outros campos

---

## 🎯 Casos de Uso

### Exemplo 1: Chico do Caranguejo (Múltiplas Unidades)
```
Nome: Chico do Caranguejo
Categoria: Restaurante
Especialidades: Frutos do mar, Caranguejo, Cerveja gelada

Locais:
  1. Unidade Copacabana
     - Rua Atlântica, 123
     - Tel: (21) 1234-5678
     - Horário: Seg-Dom 11h-23h
     
  2. Unidade Ipanema
     - Av. Vieira Souto, 456
     - Tel: (21) 8765-4321
     - Horário: Seg-Dom 11h-00h

Formas de Pagamento: Dinheiro, Cartão, PIX
```

### Exemplo 2: Hotel (Local Único)
```
Nome: Hotel Paraíso
Categoria: Hospedagem

Locais:
  1. Local Principal
     - Av. Beira Mar, 789
     - Tel: (21) 5555-5555
     - Check-in: 14h / Check-out: 12h
     - Observações: Wi-Fi grátis, Café da manhã incluso

Benefícios: Piscina, Academia, Spa
Formas de Pagamento: Cartão, Transferência Bancária
```

---

## 🚀 Como Usar

1. **Acessar Admin**: `/admin/parceiros`
2. **Criar Parceiro**: Clicar em "Adicionar Parceiro"
3. **Preencher Abas**:
   - Aba 1: Informações básicas
   - Aba 2: Contatos e endereço principal
   - Aba 3: **Adicionar locais** (mínimo 1, pode adicionar mais)
   - Aba 4: Upload de imagens
   - Aba 5: Especialidades, formas de pagamento, benefícios
4. **Salvar**: Dados são enviados para Firebase + imagens para Cloudinary

---

## ✅ Verificações

- [x] Modelo atualizado com novos campos
- [x] Service mantém integração Firebase + Cloudinary
- [x] Admin com nova aba "Locais/Unidades"
- [x] Campos de especialidades e formas de pagamento
- [x] Redes sociais expandidas (YouTube, TikTok)
- [x] Validações ajustadas para campos opcionais
- [x] Compatibilidade mantida com campo de endereço único

---

## 📌 Observações

- O campo `endereco` (único) foi mantido para compatibilidade
- Recomenda-se usar o array `locais` para novos cadastros
- Se o parceiro tiver apenas 1 local, preencha apenas 1 item no array `locais`
- Os campos de coordenadas GPS (latitude/longitude) estão prontos para integração futura com mapas

---

## 🆘 Solução de Problemas

### Erro: "Logo é obrigatório"
- Certifique-se de fazer upload de uma imagem na aba de Imagens

### Erro: "URL do website inválida"
- Se preencher o website, use URL completa: `https://exemplo.com`
- Ou deixe o campo vazio

### Múltiplos locais não aparecem
- Verifique se os dados foram salvos corretamente no Firebase
- Cada local deve ter ao menos um nome preenchido

# Índices Necessários para o Sistema de Parceiros

## ⚠️ IMPORTANTE: Configure os índices no Firestore

O sistema de parceiros precisa de índices compostos no Firestore para funcionar corretamente.

## 🔧 Como Criar os Índices

### Opção 1: Links Diretos (Mais Rápido)

Clique nos links abaixo para criar automaticamente:

1. **Índice principal (ordem + nome)**
   ```
   https://console.firebase.google.com/v1/r/project/favelachique-2b35b/firestore/indexes?create_composite=ClRwcm9qZWN0cy9mYXZlbGFjaGlxdWUtMmIzNWIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3BhcmNlaXJvcy9pbmRleGVzL18QARoJCgVvcmRlbRABGggKBG5vbWUQARoMCghfX25hbWVfXxAB
   ```

### Opção 2: Manual no Console

1. Acesse: https://console.firebase.google.com/project/favelachique-2b35b/firestore/indexes

2. Clique em "Criar Índice"

3. Configure os seguintes índices:

#### Índice 1: Lista todos os parceiros
- **Coleção:** `parceiros`
- **Campos:**
  - `ordem` - Ascending
  - `nome` - Ascending
- **Modo de consulta:** Collection

#### Índice 2: Parceiros ativos
- **Coleção:** `parceiros`
- **Campos:**
  - `ativo` - Ascending
  - `ordem` - Ascending
  - `nome` - Ascending
- **Modo de consulta:** Collection

#### Índice 3: Parceiros em destaque
- **Coleção:** `parceiros`
- **Campos:**
  - `ativo` - Ascending
  - `destaque` - Ascending
  - `ordem` - Ascending
- **Modo de consulta:** Collection

#### Índice 4: Parceiros por categoria
- **Coleção:** `parceiros`
- **Campos:**
  - `categoria` - Ascending
  - `ativo` - Ascending
  - `ordem` - Ascending
- **Modo de consulta:** Collection

## 📝 Configuração do firestore.indexes.json

Adicione no arquivo `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "parceiros",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ordem", "order": "ASCENDING" },
        { "fieldPath": "nome", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "parceiros",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ativo", "order": "ASCENDING" },
        { "fieldPath": "ordem", "order": "ASCENDING" },
        { "fieldPath": "nome", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "parceiros",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ativo", "order": "ASCENDING" },
        { "fieldPath": "destaque", "order": "ASCENDING" },
        { "fieldPath": "ordem", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "parceiros",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categoria", "order": "ASCENDING" },
        { "fieldPath": "ativo", "order": "ASCENDING" },
        { "fieldPath": "ordem", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## ⏱️ Tempo de Criação

Os índices levam alguns minutos para serem criados. Você pode acompanhar o progresso no console do Firebase.

## ✅ Verificação

Após criar os índices, teste:
1. Acesse `/admin/parceiros`
2. A listagem deve carregar sem erros
3. Crie um novo parceiro

## 🆘 Problemas?

Se ainda houver erros:
1. Verifique se todos os índices foram criados
2. Aguarde alguns minutos (pode levar até 5 minutos)
3. Limpe o cache do navegador
4. Recarregue a página

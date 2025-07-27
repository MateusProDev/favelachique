# 🔧 Configuração do Google Authentication no Firebase

## ❌ Erro Atual
```
FirebaseError: Firebase: Error (auth/operation-not-allowed)
```

Este erro indica que o **Google Authentication não está habilitado** no seu projeto Firebase.

## ✅ Solução - Passos para Configurar

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione seu projeto: **favelachique**

### 2. Habilite o Google Authentication
1. No menu lateral, clique em **Authentication**
2. Clique na aba **Sign-in method**
3. Na lista de provedores, encontre **Google**
4. Clique em **Google** para expandir
5. Clique no botão **Enable** (Habilitar)

### 3. Configure o Google Sign-In
1. **Project support email**: Selecione um email válido do projeto
2. **Web SDK configuration**: 
   - Deixe marcado "Enable Google Sign-In"
3. Clique em **Save** (Salvar)

### 4. Adicione Domínios Autorizados
Na seção **Authorized domains**, certifique-se de que estão listados:
- `localhost` (para desenvolvimento)
- `127.0.0.1` (para desenvolvimento)
- Seu domínio de produção (quando hospedar)

### 5. Verifique as Configurações
Após salvar, você deve ver:
- ✅ Google: **Enabled**
- Status: **Configured**

## 🚀 Funcionalidades Implementadas

### ✅ Login com Google
- Botão: **"Entrar com Google"**
- Detecta automaticamente se é login existente

### ✅ Registro com Google  
- Botão: **"Criar conta com Google"**
- Cria automaticamente nova conta se email não existir

### ✅ Fallback para Popup Bloqueado
- Detecta bloqueio de pop-up automaticamente
- Usa redirecionamento como alternativa
- Mensagens informativas para o usuário

## 🎯 Como Funciona

1. **Primeiro acesso**: Cria conta automaticamente
2. **Acessos seguintes**: Faz login com a conta existente
3. **Pop-up bloqueado**: Redireciona automaticamente
4. **Persistência**: Login fica salvo entre sessões

## 🔍 Verificação

Após configurar no Firebase Console:
1. Recarregue a aplicação
2. Teste o botão "Entrar com Google"
3. Deve abrir popup/redirecionamento do Google
4. Após autorizar, volta para a aplicação logado

## ⚠️ Problemas Comuns

### Pop-ups Bloqueados
- **Sintoma**: Botão não responde ou erro de popup
- **Solução**: O sistema automaticamente usa redirecionamento

### Domínio Não Autorizado
- **Sintoma**: Erro de domínio inválido
- **Solução**: Adicionar domínio na lista de autorizados

### Email de Suporte
- **Sintoma**: Erro de configuração
- **Solução**: Definir email de suporte do projeto

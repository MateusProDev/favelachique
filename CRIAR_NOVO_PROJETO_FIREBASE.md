# 🚀 Guia para Criar Novo Projeto Firebase com ID Personalizado

## 📋 Passos para Criar Novo Projeto

### 1. Acesse o Firebase Console
- URL: https://console.firebase.google.com/
- Faça login com sua conta Google

### 2. Criar Novo Projeto
1. Clique em **"Adicionar projeto"** ou **"Create a project"**
2. **Nome do projeto**: Digite `favelachique` (ou o nome desejado)
3. **Project ID**: 
   - O Firebase vai sugerir automaticamente
   - Você pode editar para algo como:
     - `favelachique`
     - `favelachique-app`
     - `favelachique-oficial`
     - `meu-favelachique`
4. Aceite os termos e clique **"Continuar"**

### 3. Configurar Google Analytics (Opcional)
- Pode pular esta etapa ou configurar depois
- Clique **"Criar projeto"**

### 4. Configurar os Serviços

#### A. Authentication
1. Vá em **Authentication > Sign-in method**
2. Habilite **Email/Password**
3. Habilite **Google**
4. Configure email de suporte

#### B. Firestore Database
1. Vá em **Firestore Database**
2. Clique **"Criar banco de dados"**
3. Modo: **Teste** (para desenvolvimento)
4. Localização: **us-central** (ou mais próximo)

#### C. Storage
1. Vá em **Storage**
2. Clique **"Começar"**
3. Aceite as regras padrão

### 5. Obter Configurações do Novo Projeto
1. Vá em **Configurações do projeto** (ícone de engrenagem)
2. Role até **"Seus aplicativos"**
3. Clique no ícone **Web** `</>`
4. **Nome do app**: `favelachique-web`
5. Marque **"Firebase Hosting"** se quiser
6. Clique **"Registrar app"**

### 6. Copiar Configurações
Você receberá algo assim:
```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-novo-id.firebaseapp.com",
  projectId: "seu-novo-id",
  storageBucket: "seu-novo-id.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

## 📝 Template do Novo .env

Substitua no seu arquivo `.env`:

```env
# Novo projeto Firebase com ID personalizado
REACT_APP_FIREBASE_API_KEY=SUA_NOVA_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=SEU-NOVO-ID.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=SEU-NOVO-ID
REACT_APP_FIREBASE_STORAGE_BUCKET=SEU-NOVO-ID.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=SEU_NOVO_SENDER_ID
REACT_APP_FIREBASE_APP_ID=SEU_NOVO_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=SEU_NOVO_MEASUREMENT_ID
```

## ⚠️ Importante

### Dados Existentes
- Se você já tem dados no projeto atual, precisará migrar
- Usuários cadastrados ficam no projeto antigo
- Considere manter o projeto atual se já tem usuários

### Backup
- Faça backup do `.env` atual antes de alterar
- Anote as configurações antigas caso precise voltar

## 🎯 Resultado Final

Após criar o novo projeto, sua URL do Google Auth ficará:
- **Antes**: `favelachique-2b35b.firebaseapp.com`
- **Depois**: `favelachique.firebaseapp.com` (ou o ID escolhido)

Isso deixará URLs mais limpas e profissionais! 🚀

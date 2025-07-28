// src/components/RichTextEditor/RichTextEditorV2.jsx
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box, Typography, Button } from '@mui/material';
import './RichTextEditorV2.css';

const RichTextEditorV2 = ({ value, onChange, placeholder, height = 400 }) => {
  const insertTemplate = () => {
    const template = `## 🌟 Sobre este Pacote

Descreva aqui as principais características do pacote turístico.

### 📍 O que está incluído:

- **Transporte:** Descrição do transporte
- **Hospedagem:** Informações sobre acomodação
- **Alimentação:** Detalhes das refeições
- **Passeios:** Lista dos passeios inclusos

### ⏰ Itinerário:

**Dia 1:** Chegada e acomodação
**Dia 2:** Principais atividades
**Dia 3:** Retorno

> 💡 **Dica especial:** Adicione informações importantes ou dicas extras aqui.

### 📋 Observações importantes:

Liste aqui informações importantes sobre documentos, vacinas, clima, etc.`;
    
    onChange(template);
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Use Markdown para formatação (negrito, listas, títulos, etc.)
        </Typography>
        <Button 
          variant="outlined"
          size="small"
          onClick={insertTemplate}
          sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
        >
          📝 Inserir Template
        </Button>
      </Box>
      
      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          height={height}
          preview="edit"
          hideToolbar={false}
          visibleDragBar={false}
          data-color-mode="light"
          textareaProps={{
            placeholder: placeholder || 'Digite a descrição do pacote usando Markdown...',
            style: {
              fontSize: 14,
              lineHeight: 1.6
            }
          }}
        />
      </div>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Dica: Use **negrito**, *itálico*, ### títulos, - listas, > citações
      </Typography>
    </Box>
  );
};

export default RichTextEditorV2;

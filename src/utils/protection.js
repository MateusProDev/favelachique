// Proteções JavaScript contra cópia e manipulação
import '../styles/protection.css';

export const initializeProtection = () => {
  
  // 1. PROTEÇÃO CONTRA MENU DE CONTEXTO (Botão direito)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. PROTEÇÃO CONTRA TECLAS DE ATALHO
  document.addEventListener('keydown', (e) => {
    // Bloqueia F12 (Dev Tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+Shift+I (Dev Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+Shift+C (Seletor de elemento)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+S (Salvar página)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+A (Selecionar tudo)
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+C (Copiar)
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+V (Colar)
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+X (Recortar)
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+P (Imprimir)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia zoom (Ctrl + e Ctrl -)
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
      return false;
    }
  });

  // 3. PROTEÇÃO CONTRA ZOOM
  let isCtrlPressed = false;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control') {
      isCtrlPressed = true;
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Control') {
      isCtrlPressed = false;
    }
  });
  
  document.addEventListener('wheel', (e) => {
    if (isCtrlPressed) {
      e.preventDefault();
      return false;
    }
  }, { passive: false });

  // 4. PROTEÇÃO CONTRA ARRASTAR IMAGENS
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // 5. PROTEÇÃO CONTRA SELEÇÃO
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // 6. DETECTA FERRAMENTAS DE DESENVOLVEDOR - REMOVIDO (causava borramento indevido)
  // Detecção removida para evitar falsos positivos que causavam borramento
  
  // 7. LIMPA CONSOLE MODERADAMENTE
  setInterval(() => {
    console.clear();
  }, 5000); // Reduzido para cada 5 segundos ao invés de 1

  // 8. PROTEÇÃO CONTRA PRINT SCREEN (JavaScript)
  document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
      navigator.clipboard.writeText('');
      alert('Screenshots não são permitidos neste site!');
    }
  });

  // 9. FORCE FONT SIZE RESET
  const resetFontSize = () => {
    document.documentElement.style.fontSize = '16px';
    document.body.style.fontSize = '16px';
    document.documentElement.style.zoom = '1';
    document.body.style.zoom = '1';
  };
  
  // Reset font size periodicamente
  setInterval(resetFontSize, 1000);
  
  // Reset imediato
  resetFontSize();

  // 10. PROTEÇÃO CONTRA REDIMENSIONAMENTO
  let originalInnerWidth = window.innerWidth;
  let originalInnerHeight = window.innerHeight;
  
  window.addEventListener('resize', () => {
    // Força manter proporções originais se necessário
    if (Math.abs(window.innerWidth - originalInnerWidth) > 50 || 
        Math.abs(window.innerHeight - originalInnerHeight) > 50) {
      resetFontSize();
    }
  });

  // 11. BLOQUEIA ZOOM TOUCH NO MOBILE
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  });
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // 12. ADICIONA META TAG PARA VIEWPORT FIXO
  const metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) {
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
  } else {
    const newMetaViewport = document.createElement('meta');
    newMetaViewport.name = 'viewport';
    newMetaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
    document.head.appendChild(newMetaViewport);
  }

  console.log('%c🛡️ Proteções ativadas', 'color: green; font-weight: bold;');
};

// Função para desabilitar proteções (para desenvolvimento)
export const disableProtection = () => {
  // Remove event listeners (para desenvolvimento)
  console.log('%c⚠️ Proteções desabilitadas (modo desenvolvimento)', 'color: orange; font-weight: bold;');
};

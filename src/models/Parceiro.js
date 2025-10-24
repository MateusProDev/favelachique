/**
 * Modelo de dados para Parceiros - SIMPLIFICADO
 * Apenas campos essenciais
 */

export class Parceiro {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nome = data.nome || '';
    this.descricaoBreve = data.descricaoBreve || '';
    this.categoria = data.categoria || '';
    this.logo = data.logo || '';
    this.imagens = data.imagens || [];
    
    // Contato básico
    this.telefone = data.telefone || '';
    this.whatsapp = data.whatsapp || '';
    this.instagram = data.instagram || '';
    this.website = data.website || '';
    
    // Múltiplos locais simplificado
    this.locais = data.locais || [];
    
    // Controle
    this.destaque = data.destaque || false;
    this.ativo = data.ativo !== undefined ? data.ativo : true;
    this.ordem = data.ordem || 0;
    this.dataCriacao = data.dataCriacao || new Date().toISOString();
    this.dataAtualizacao = data.dataAtualizacao || new Date().toISOString();
  }

  /**
   * Valida os dados essenciais do parceiro
   */
  validar() {
    const erros = [];

    if (!this.nome || this.nome.trim() === '') {
      erros.push('Nome é obrigatório');
    }

    if (!this.categoria || this.categoria.trim() === '') {
      erros.push('Categoria é obrigatória');
    }

    if (!this.logo || this.logo.trim() === '') {
      erros.push('Logo é obrigatório');
    }

    // Validações opcionais
    if (this.website && this.website.trim() !== '' && !this.validarUrl(this.website)) {
      erros.push('URL do website inválida');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Valida formato de URL, permitindo URLs sem http/https
   */
  validarUrl(url) {
    if (!url) return false;
    // Tenta validar como está
    try {
      new URL(url);
      return true;
    } catch {
      // Se falhar, tenta adicionar https:// e validar novamente
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Converte para objeto simples para salvar no Firebase
   */
  toFirestore() {
    return {
      nome: this.nome,
      descricaoBreve: this.descricaoBreve,
      categoria: this.categoria,
      logo: this.logo,
      imagens: this.imagens,
      telefone: this.telefone,
      whatsapp: this.whatsapp,
      instagram: this.instagram,
      website: this.website,
      locais: this.locais,
      destaque: this.destaque,
      ativo: this.ativo,
      ordem: this.ordem,
      dataCriacao: this.dataCriacao,
      dataAtualizacao: new Date().toISOString()
    };
  }

  /**
   * Cria instância a partir de documento do Firebase
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new Parceiro({
      id: doc.id,
      ...data
    });
  }
}

export default Parceiro;

/**
 * Modelo de dados para Parceiros
 * Representa empresas/pessoas parceiras do sistema de viagens
 */

export class Parceiro {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nome = data.nome || '';
    this.descricaoBreve = data.descricaoBreve || '';
    this.descricaoCompleta = data.descricaoCompleta || '';
    this.categoria = data.categoria || ''; // Ex: Hospedagem, Restaurante, Transporte, Turismo, etc.
    this.logo = data.logo || '';
    this.imagemCapa = data.imagemCapa || '';
    this.imagens = data.imagens || []; // Array de URLs de imagens
    this.website = data.website || '';
    this.email = data.email || '';
    this.telefone = data.telefone || '';
    this.whatsapp = data.whatsapp || '';
    this.endereco = data.endereco || {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      complemento: ''
    };
    this.redesSociais = data.redesSociais || {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    };
    this.destaque = data.destaque || false; // Se aparece em destaque
    this.ativo = data.ativo !== undefined ? data.ativo : true;
    this.avaliacoes = data.avaliacoes || {
      nota: 0,
      total: 0
    };
    this.beneficios = data.beneficios || []; // Array de benefícios/vantagens
    this.horarioFuncionamento = data.horarioFuncionamento || {
      segunda: '',
      terca: '',
      quarta: '',
      quinta: '',
      sexta: '',
      sabado: '',
      domingo: ''
    };
    this.tags = data.tags || []; // Tags para filtro
    this.ordem = data.ordem || 0; // Ordem de exibição
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

    if (!this.descricaoBreve || this.descricaoBreve.trim() === '') {
      erros.push('Descrição breve é obrigatória');
    }

    if (!this.categoria || this.categoria.trim() === '') {
      erros.push('Categoria é obrigatória');
    }

    if (!this.logo || this.logo.trim() === '') {
      erros.push('Logo é obrigatório');
    }

    if (this.website && this.website.trim() !== '' && !this.validarUrl(this.website)) {
      erros.push('URL do website inválida');
    }

    if (this.email && this.email.trim() !== '' && !this.validarEmail(this.email)) {
      erros.push('Email inválido');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Valida formato de URL
   */
  validarUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida formato de email
   */
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Converte para objeto simples para salvar no Firebase
   */
  toFirestore() {
    return {
      nome: this.nome,
      descricaoBreve: this.descricaoBreve,
      descricaoCompleta: this.descricaoCompleta,
      categoria: this.categoria,
      logo: this.logo,
      imagemCapa: this.imagemCapa,
      imagens: this.imagens,
      website: this.website,
      email: this.email,
      telefone: this.telefone,
      whatsapp: this.whatsapp,
      endereco: this.endereco,
      redesSociais: this.redesSociais,
      destaque: this.destaque,
      ativo: this.ativo,
      avaliacoes: this.avaliacoes,
      beneficios: this.beneficios,
      horarioFuncionamento: this.horarioFuncionamento,
      tags: this.tags,
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

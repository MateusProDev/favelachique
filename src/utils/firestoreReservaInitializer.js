// Utilitário para inicializar todos os campos obrigatórios de uma reserva
export function getReservaComCamposPadrao(reserva) {
  return {
    // Identificadores
    pacoteId: reserva.pacoteId || '',
    pacoteTitulo: reserva.pacoteTitulo || '',
    clienteId: reserva.clienteId || reserva.userId || '',
    // Configuração da reserva
    isIdaEVolta: reserva.isIdaEVolta ?? false,
    tipoViagem: reserva.tipoViagem || '',
    dataIda: reserva.dataIda || '',
    dataVolta: reserva.dataVolta || '',
    horaIda: reserva.horaIda || '',
    horaVolta: reserva.horaVolta || '',
    // Status
    status: reserva.status || 'pendente',
    statusPagamento: reserva.statusPagamento || 'pendente',
    // Financeiro
    valorTotal: reserva.valorTotal || 0,
    porcentagemSinal: reserva.porcentagemSinal || 40,
    valorSinal: reserva.valorSinal || 0,
    valorRestante: reserva.valorRestante || 0,
    valorPago: reserva.valorPago || 0,
    valorComDesconto: reserva.valorComDesconto || 0,
    // Localização
    pontoPartida: reserva.pontoPartida || '',
    pontoDestino: reserva.pontoDestino || '',
    // Observações
    observacoes: reserva.observacoes || '',
    // Dados do cliente
    clienteNome: reserva.clienteNome || reserva.nome || '',
    clienteEmail: reserva.clienteEmail || reserva.email || '',
    clienteTelefone: reserva.clienteTelefone || reserva.telefone || '',
    clienteCpf: reserva.clienteCpf || reserva.cpf || '',
    // Passageiros
    totalPassageiros: reserva.totalPassageiros || 1,
    adultos: reserva.adultos || 1,
    criancas: reserva.criancas || 0,
    infantis: reserva.infantis || 0,
    passageirosFormatado: reserva.passageirosFormatado || '',
    // Pagamento
    metodoPagamento: reserva.metodoPagamento || '',
    pagamento: reserva.pagamento || null,
    // Metadados
    origem: reserva.origem || '',
    criadoEm: reserva.criadoEm || null,
    atualizadoEm: reserva.atualizadoEm || null,
    // Campos extras
    ...reserva
  };
}

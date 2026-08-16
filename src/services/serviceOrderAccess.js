const buildServiceOrderAccessFilter = (user = {}) => {
  if (!user || !user.role) {
    return { id: -1 };
  }

  if (user.role === 'admin') {
    return {};
  }

  if (user.role === 'tecnico') {
    return { technicianId: user.id };
  }

  if (user.role === 'cliente') {
    return user.clientId ? { clientId: user.clientId } : { clientId: -1 };
  }

  return { id: -1 };
};

const getAllowedStatusTransitions = (role) => {
  if (role === 'tecnico') {
    return ['INICIADA', 'TROCA_DE_PNEU', 'TROCA_DE_OLEO', 'SERVICO_FINALIZADO'];
  }

  return ['ABERTA', 'INICIADA', 'TROCA_DE_PNEU', 'TROCA_DE_OLEO', 'SERVICO_FINALIZADO', 'CONCLUIDA', 'ENTREGUE'];
};

const canManageServiceOrder = (user = {}, order = {}) => {
  if (!user || !user.role) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'tecnico') {
    return Number(order.technicianId) === Number(user.id);
  }

  if (user.role === 'cliente') {
    return Number(order.clientId) === Number(user.clientId);
  }

  return false;
};

const getAllowedPaymentMethods = () => ['DINHEIRO', 'PIX', 'CARTAO', 'CREDITO', 'DEBITO', 'BOLETO'];

module.exports = {
  buildServiceOrderAccessFilter,
  getAllowedStatusTransitions,
  canManageServiceOrder,
  getAllowedPaymentMethods,
};

const ServiceCatalog = require('../models/ServiceCatalog');
const AdditionalServiceRequest = require('../models/AdditionalServiceRequest');
const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderService = require('../models/ServiceOrderService');
const ServiceOrderHistory = require('../models/ServiceOrderHistory');
const { canManageServiceOrder } = require('../services/serviceOrderAccess');

const defaultCatalog = [
  {
    name: 'Troca de pneus',
    description: 'Substituição dos pneus danificados.',
    price: 1200,
    steps: ['Veículo elevado', 'Remoção das rodas', 'Remoção dos pneus', 'Instalação dos pneus novos', 'Balanceamento', 'Reinstalação das rodas', 'Torque das rodas', 'Serviço finalizado'],
  },
  {
    name: 'Alinhamento',
    description: 'Alinhamento completo do veículo.',
    price: 180,
    steps: ['Veículo posicionado', 'Medição da geometria', 'Ajuste da direção', 'Conferência final', 'Serviço finalizado'],
  },
  {
    name: 'Troca de bateria',
    description: 'Substituição e teste da bateria.',
    price: 450,
    steps: ['Diagnóstico da bateria', 'Remoção da bateria antiga', 'Instalação da bateria nova', 'Teste elétrico', 'Serviço finalizado'],
  },
  {
    name: 'Troca de pastilhas',
    description: 'Substituição das pastilhas de freio.',
    price: 520,
    steps: ['Veículo elevado', 'Remoção das rodas', 'Remoção das pastilhas', 'Instalação das pastilhas novas', 'Teste de frenagem', 'Serviço finalizado'],
  },
];

const ensureCatalog = async () => {
  const count = await ServiceCatalog.count();
  if (!count) await ServiceCatalog.bulkCreate(defaultCatalog);
  return ServiceCatalog.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
};

const getCatalog = async (req, res) => {
  try { return res.json(await ensureCatalog()); } catch (error) { return res.status(500).json({ message: 'Erro ao carregar catálogo.', error: error.message }); }
};

const getRequests = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'tecnico') where.requestedBy = req.user.id;
    if (req.user.role === 'cliente') {
      const orders = await ServiceOrder.findAll({ where: { clientId: req.user.clientId } });
      where.serviceOrderId = orders.map((order) => order.id);
    }
    const requests = await AdditionalServiceRequest.findAll({ where, include: [{ model: ServiceCatalog, as: 'catalogService' }], order: [['id', 'DESC']] });
    return res.json(requests);
  } catch (error) { return res.status(500).json({ message: 'Erro ao carregar solicitações.', error: error.message }); }
};

const createRequest = async (req, res) => {
  try {
    if (req.user.role !== 'tecnico') return res.status(403).json({ message: 'Somente o técnico pode solicitar serviço adicional.' });
    const { serviceOrderId, serviceCatalogId, reason } = req.body;
    const order = await ServiceOrder.findByPk(serviceOrderId);
    const catalog = await ServiceCatalog.findByPk(serviceCatalogId);
    if (!order || !catalog) return res.status(404).json({ message: 'Ordem ou serviço do catálogo não encontrado.' });
    if (!canManageServiceOrder(req.user, order)) return res.status(403).json({ message: 'Ordem não atribuída a este técnico.' });
    if (!reason || !reason.trim()) return res.status(400).json({ message: 'Informe o motivo da recomendação.' });
    const request = await AdditionalServiceRequest.create({ serviceOrderId, serviceCatalogId, requestedBy: req.user.id, reason, name: catalog.name, description: catalog.description, price: catalog.price, steps: catalog.steps });
    await ServiceOrderHistory.create({ serviceOrderId, eventType: 'SERVICO_ADICIONAL_SOLICITADO', description: 'Serviço adicional enviado para análise', details: `${catalog.name}: ${reason}`, createdBy: req.user.email });
    return res.status(201).json({ message: 'Solicitação enviada ao administrador.', request });
  } catch (error) { return res.status(500).json({ message: 'Erro ao solicitar serviço adicional.', error: error.message }); }
};

const reviewRequest = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Somente o admin pode analisar a solicitação.' });
    const request = await AdditionalServiceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Solicitação não encontrada.' });
    const approved = req.body.decision === 'APROVAR';
    await request.update({ status: approved ? 'AGUARDANDO_CLIENTE' : 'RECUSADO_ADMIN' });
    await ServiceOrderHistory.create({ serviceOrderId: request.serviceOrderId, eventType: approved ? 'SERVICO_ADICIONAL_ENVIADO_CLIENTE' : 'SERVICO_ADICIONAL_RECUSADO_ADMIN', description: approved ? 'Serviço adicional enviado ao cliente' : 'Serviço adicional recusado pelo administrador', details: request.name, createdBy: req.user.email });
    return res.json({ message: approved ? 'Enviado para aprovação do cliente.' : 'Solicitação recusada.', request });
  } catch (error) { return res.status(500).json({ message: 'Erro ao analisar solicitação.', error: error.message }); }
};

const decideRequest = async (req, res) => {
  try {
    const request = await AdditionalServiceRequest.findByPk(req.params.id);
    const order = request && await ServiceOrder.findByPk(request.serviceOrderId);
    if (!request || !order) return res.status(404).json({ message: 'Solicitação não encontrada.' });
    if (req.user.role !== 'cliente' || !canManageServiceOrder(req.user, order)) return res.status(403).json({ message: 'Somente o cliente da ordem pode decidir.' });
    if (request.status !== 'AGUARDANDO_CLIENTE') return res.status(400).json({ message: 'Solicitação ainda não está disponível para o cliente.' });
    const accepted = req.body.decision === 'ACEITAR';
    await request.update({ status: accepted ? 'APROVADO' : 'RECUSADO_CLIENTE', clientDecision: accepted ? 'ACEITO' : 'RECUSADO', decidedAt: new Date() });
    if (accepted) await ServiceOrderService.create({ serviceOrderId: order.id, description: request.name, quantity: 1, unitPrice: request.price, discount: 0, subtotal: request.price, serviceType: 'ADICIONAL', additionalRequestId: request.id, steps: request.steps });
    await ServiceOrderHistory.create({ serviceOrderId: order.id, eventType: accepted ? 'SERVICO_ADICIONAL_APROVADO' : 'SERVICO_ADICIONAL_RECUSADO_CLIENTE', description: accepted ? 'Serviço adicional aprovado pelo cliente' : 'Serviço adicional recusado pelo cliente', details: request.name, createdBy: req.user.email });
    return res.json({ message: accepted ? 'Serviço adicional autorizado e incluído na OS.' : 'Serviço adicional recusado.', request });
  } catch (error) { return res.status(500).json({ message: 'Erro ao registrar decisão.', error: error.message }); }
};

module.exports = { getCatalog, getRequests, createRequest, reviewRequest, decideRequest };

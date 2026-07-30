const { Op } = require('sequelize');
const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderService = require('../models/ServiceOrderService');
const ServiceOrderPart = require('../models/ServiceOrderPart');

const buildFinanceDateFilter = (query = {}) => {
  const { startDate, endDate } = query;

  if (!startDate && !endDate) {
    return {};
  }

  const filter = {};

  if (startDate) {
    filter[Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
  }

  if (endDate) {
    filter[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);
  }

  return {
    entryDate: filter,
  };
};

const buildFinanceWhereClause = (query = {}) => {
  const where = {};
  const dateFilter = buildFinanceDateFilter(query);

  if (Object.keys(dateFilter).length > 0) {
    where.entryDate = dateFilter.entryDate;
  }

  if (typeof query.status === 'string' && query.status.trim() !== '') {
    where.status = query.status.trim().toUpperCase();
  }

  if (query.clientId !== undefined && query.clientId !== '') {
    const clientId = Number(query.clientId);
    if (!Number.isNaN(clientId)) {
      where.clientId = clientId;
    }
  }

  if (query.technicianId !== undefined && query.technicianId !== '') {
    const technicianId = Number(query.technicianId);
    if (!Number.isNaN(technicianId)) {
      where.technicianId = technicianId;
    }
  }

  return where;
};

const buildFinanceOrder = (query = {}) => {
  const { sortBy = 'entryDate', order = 'DESC' } = query;
  const direction = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return {
    field: sortBy === 'value' ? 'grandTotal' : 'entryDate',
    direction,
  };
};

const applyFinanceValueFilters = (orders, query = {}) => {
  const minValue = Number(query.minValue);
  const maxValue = Number(query.maxValue);

  let filtered = orders;

  if (!Number.isNaN(minValue)) {
    filtered = filtered.filter((item) => item.grandTotal >= minValue);
  }

  if (!Number.isNaN(maxValue)) {
    filtered = filtered.filter((item) => item.grandTotal <= maxValue);
  }

  return filtered;
};

const sortFinanceOrders = (orders, query = {}) => {
  const sortConfig = buildFinanceOrder(query);
  const directionMultiplier = sortConfig.direction === 'ASC' ? 1 : -1;

  return [...orders].sort((a, b) => {
    const first = a[sortConfig.field];
    const second = b[sortConfig.field];

    if (sortConfig.field === 'grandTotal') {
      return (first - second) * directionMultiplier;
    }

    const firstDate = new Date(first).getTime();
    const secondDate = new Date(second).getTime();
    return (firstDate - secondDate) * directionMultiplier;
  });
};

const buildFinanceGroupSummary = (orders, groupBy = 'client') => {
  const grouped = new Map();

  orders.forEach((order) => {
    const key = groupBy === 'technician' ? (order.technicianId || 'SEM_TECNICO') : (order.clientId || 'SEM_CLIENTE');
    const current = grouped.get(key) || {
      key,
      count: 0,
      totalServices: 0,
      totalParts: 0,
      totalDiscounts: 0,
      grandTotal: 0,
    };

    current.count += 1;
    current.totalServices += Number(order.totalServices || 0);
    current.totalParts += Number(order.totalParts || 0);
    current.totalDiscounts += Number(order.totalDiscounts || 0);
    current.grandTotal += Number(order.grandTotal || 0);
    grouped.set(key, current);
  });

  return Array.from(grouped.values());
};

const buildFinanceMonthlySummary = (orders) => {
  const grouped = new Map();

  orders.forEach((order) => {
    const date = order.entryDate ? new Date(order.entryDate) : new Date();
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = grouped.get(monthKey) || {
      month: monthKey,
      count: 0,
      totalServices: 0,
      totalParts: 0,
      totalDiscounts: 0,
      grandTotal: 0,
    };

    current.count += 1;
    current.totalServices += Number(order.totalServices || 0);
    current.totalParts += Number(order.totalParts || 0);
    current.totalDiscounts += Number(order.totalDiscounts || 0);
    current.grandTotal += Number(order.grandTotal || 0);
    grouped.set(monthKey, current);
  });

  return Array.from(grouped.values()).sort((a, b) => a.month.localeCompare(b.month));
};

const buildFinanceRanking = (orders, groupBy = 'client') => {
  const grouped = buildFinanceGroupSummary(orders, groupBy);

  return grouped.sort((a, b) => b.grandTotal - a.grandTotal);
};

const buildFinanceOrdersResponse = (orders, query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;

  const sortedOrders = sortFinanceOrders(orders, query);
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;
  const pagedOrders = sortedOrders.slice(startIndex, endIndex);

  return {
    orders: pagedOrders,
    total: sortedOrders.length,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(sortedOrders.length / safeLimit)),
  };
};

const getFinanceSummary = async (req, res) => {
  try {
    const where = buildFinanceWhereClause(req.query);
    const serviceOrders = await ServiceOrder.findAll({
      where,
      order: [['entryDate', 'DESC']],
    });

    const financeOrders = [];

    for (const serviceOrder of serviceOrders) {
      const services = await ServiceOrderService.findAll({
        where: { serviceOrderId: serviceOrder.id },
      });

      const parts = await ServiceOrderPart.findAll({
        where: { serviceOrderId: serviceOrder.id },
      });

      const totalServices = services.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
      const totalParts = parts.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
      const totalDiscounts = services.reduce((sum, item) => sum + Number(item.discount || 0), 0)
        + parts.reduce((sum, item) => sum + Number(item.discount || 0), 0);
      const grandTotal = totalServices + totalParts - totalDiscounts;

      financeOrders.push({
        ...serviceOrder.toJSON(),
        totalServices,
        totalParts,
        totalDiscounts,
        grandTotal,
      });
    }

    const filteredOrders = applyFinanceValueFilters(financeOrders, req.query);
    const sortedOrders = sortFinanceOrders(filteredOrders, req.query);
    const paginatedResponse = buildFinanceOrdersResponse(sortedOrders, req.query);

    const totalServices = sortedOrders.reduce((sum, item) => sum + Number(item.totalServices || 0), 0);
    const totalParts = sortedOrders.reduce((sum, item) => sum + Number(item.totalParts || 0), 0);
    const totalDiscounts = sortedOrders.reduce((sum, item) => sum + Number(item.totalDiscounts || 0), 0);

    const groupBy = req.query.groupBy === 'technician' ? 'technician' : 'client';
    const grouped = buildFinanceGroupSummary(sortedOrders, groupBy);
    const monthlySummary = buildFinanceMonthlySummary(sortedOrders);
    const ranking = buildFinanceRanking(sortedOrders, groupBy);

    return res.status(200).json({
      summary: {
        totalServices,
        totalParts,
        totalDiscounts,
        grandTotal: totalServices + totalParts - totalDiscounts,
      },
      orders: paginatedResponse.orders,
      groupedBy: groupBy,
      groups: grouped,
      monthlySummary,
      ranking,
      pagination: {
        total: paginatedResponse.total,
        page: paginatedResponse.page,
        limit: paginatedResponse.limit,
        totalPages: paginatedResponse.totalPages,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};

const getFinanceByServiceOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceOrder = await ServiceOrder.findByPk(id);

    if (!serviceOrder) {
      return res.status(404).json({
        message: 'Ordem de Serviço não encontrada.',
      });
    }

    const services = await ServiceOrderService.findAll({
      where: { serviceOrderId: id },
      order: [['id', 'ASC']],
    });

    const parts = await ServiceOrderPart.findAll({
      where: { serviceOrderId: id },
      order: [['id', 'ASC']],
    });

    const totalServices = services.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalParts = parts.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalDiscounts = services.reduce((sum, item) => sum + Number(item.discount || 0), 0)
      + parts.reduce((sum, item) => sum + Number(item.discount || 0), 0);

    return res.status(200).json({
      serviceOrder,
      services,
      parts,
      totals: {
        totalServices,
        totalParts,
        totalDiscounts,
        grandTotal: totalServices + totalParts - totalDiscounts,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};

module.exports = {
  buildFinanceDateFilter,
  buildFinanceWhereClause,
  buildFinanceOrder,
  applyFinanceValueFilters,
  buildFinanceGroupSummary,
  buildFinanceMonthlySummary,
  buildFinanceRanking,
  buildFinanceOrdersResponse,
  getFinanceSummary,
  getFinanceByServiceOrder,
};

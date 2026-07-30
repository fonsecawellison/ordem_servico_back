const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderService = require('../models/ServiceOrderService');
const ServiceOrderPart = require('../models/ServiceOrderPart');
const { Op } = require('sequelize');

const buildReportDateFilter = (query = {}) => {
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

const buildReportWhereClause = (query = {}) => {
  const where = {};
  const dateFilter = buildReportDateFilter(query);

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

const buildReportGroupSummary = (orders, groupBy = 'client') => {
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

const buildReportSummary = async (req, res) => {
  try {
    const where = buildReportWhereClause(req.query);
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

    const totalServices = financeOrders.reduce((sum, item) => sum + Number(item.totalServices || 0), 0);
    const totalParts = financeOrders.reduce((sum, item) => sum + Number(item.totalParts || 0), 0);
    const totalDiscounts = financeOrders.reduce((sum, item) => sum + Number(item.totalDiscounts || 0), 0);
    const grandTotal = totalServices + totalParts - totalDiscounts;

    const monthlySummary = financeOrders.reduce((acc, order) => {
      const date = order.entryDate ? new Date(order.entryDate) : new Date();
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[month]) {
        acc[month] = { month, count: 0, totalServices: 0, totalParts: 0, totalDiscounts: 0, grandTotal: 0 };
      }
      acc[month].count += 1;
      acc[month].totalServices += Number(order.totalServices || 0);
      acc[month].totalParts += Number(order.totalParts || 0);
      acc[month].totalDiscounts += Number(order.totalDiscounts || 0);
      acc[month].grandTotal += Number(order.grandTotal || 0);
      return acc;
    }, {});

    const groupBy = req.query.groupBy === 'technician' ? 'technician' : 'client';
    const groups = buildReportGroupSummary(financeOrders, groupBy);

    if (req.query.format === 'csv') {
      const headers = ['id','status','entryDate','clientId','technicianId','totalServices','totalParts','totalDiscounts','grandTotal'];
      const rows = financeOrders.map((order) => [
        order.id,
        order.status,
        order.entryDate,
        order.clientId,
        order.technicianId,
        order.totalServices,
        order.totalParts,
        order.totalDiscounts,
        order.grandTotal,
      ]);
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=finance-report.csv');
      return res.status(200).send(csvContent);
    }

    return res.status(200).json({
      summary: {
        totalServices,
        totalParts,
        totalDiscounts,
        grandTotal,
      },
      monthlySummary: Object.values(monthlySummary).sort((a, b) => a.month.localeCompare(b.month)),
      groupedBy: groupBy,
      groups,
      orders: financeOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};

module.exports = {
  buildReportWhereClause,
  buildReportGroupSummary,
  getFinanceReport: buildReportSummary,
};

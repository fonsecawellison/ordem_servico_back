const test = require('node:test');
const assert = require('node:assert/strict');
const { Op } = require('sequelize');

const { buildFinanceDateFilter, buildFinanceWhereClause, buildFinanceOrder, applyFinanceValueFilters, buildFinanceGroupSummary, buildFinanceMonthlySummary, buildFinanceRanking, buildFinanceOrdersResponse } = require('../src/controllers/financeController');

test('retorna filtro vazio quando não há datas', () => {
  assert.deepStrictEqual(buildFinanceDateFilter({}), {});
});

test('gera filtro de intervalo para datas de início e fim', () => {
  const filter = buildFinanceDateFilter({ startDate: '2026-01-01', endDate: '2026-01-31' });

  assert.deepStrictEqual(filter, {
    entryDate: {
      [Op.gte]: new Date('2026-01-01T00:00:00.000Z'),
      [Op.lte]: new Date('2026-01-31T23:59:59.999Z'),
    },
  });
});

test('gera filtro apenas para data de início', () => {
  const filter = buildFinanceDateFilter({ startDate: '2026-01-01' });

  assert.deepStrictEqual(filter, {
    entryDate: {
      [Op.gte]: new Date('2026-01-01T00:00:00.000Z'),
    },
  });
});

test('monta cláusula de filtro com status e cliente', () => {
  const filter = buildFinanceWhereClause({ status: 'ENTREGUE', clientId: '7' });

  assert.deepStrictEqual(filter, {
    status: 'ENTREGUE',
    clientId: 7,
  });
});

test('monta cláusula de filtro por técnico', () => {
  const filter = buildFinanceWhereClause({ technicianId: '3' });

  assert.deepStrictEqual(filter, {
    technicianId: 3,
  });
});

test('monta cláusula de filtro com intervalo aberto apenas para fim', () => {
  const filter = buildFinanceWhereClause({ endDate: '2026-01-31' });

  assert.deepStrictEqual(filter, {
    entryDate: {
      [Op.lte]: new Date('2026-01-31T23:59:59.999Z'),
    },
  });
});

test('monta cláusula de filtro combinando datas, status e cliente', () => {
  const filter = buildFinanceWhereClause({
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    status: 'EM ANDAMENTO',
    clientId: '12',
  });

  assert.deepStrictEqual(filter, {
    status: 'EM ANDAMENTO',
    clientId: 12,
    entryDate: {
      [Op.gte]: new Date('2026-01-01T00:00:00.000Z'),
      [Op.lte]: new Date('2026-01-31T23:59:59.999Z'),
    },
  });
});

test('filtra ordens por faixa de valor', () => {
  const orders = [
    { id: 1, grandTotal: 80 },
    { id: 2, grandTotal: 150 },
    { id: 3, grandTotal: 500 },
  ];

  const filtered = applyFinanceValueFilters(orders, { minValue: '100', maxValue: '500' });

  assert.deepStrictEqual(filtered, [
    { id: 2, grandTotal: 150 },
    { id: 3, grandTotal: 500 },
  ]);
});

test('retorna ordenação padrão por data decrescente', () => {
  assert.deepStrictEqual(buildFinanceOrder({}), { field: 'entryDate', direction: 'DESC' });
});

test('retorna ordenação por data ascendente', () => {
  assert.deepStrictEqual(buildFinanceOrder({ sortBy: 'entryDate', order: 'ASC' }), { field: 'entryDate', direction: 'ASC' });
});

test('retorna ordenação por valor', () => {
  assert.deepStrictEqual(buildFinanceOrder({ sortBy: 'value', order: 'ASC' }), { field: 'grandTotal', direction: 'ASC' });
});

test('agrupar ordens por cliente', () => {
  const orders = [
    { clientId: 1, totalServices: 100, totalParts: 50, totalDiscounts: 10, grandTotal: 140 },
    { clientId: 1, totalServices: 80, totalParts: 20, totalDiscounts: 5, grandTotal: 95 },
    { clientId: 2, totalServices: 40, totalParts: 10, totalDiscounts: 0, grandTotal: 50 },
  ];

  assert.deepStrictEqual(buildFinanceGroupSummary(orders, 'client'), [
    {
      key: 1,
      count: 2,
      totalServices: 180,
      totalParts: 70,
      totalDiscounts: 15,
      grandTotal: 235,
    },
    {
      key: 2,
      count: 1,
      totalServices: 40,
      totalParts: 10,
      totalDiscounts: 0,
      grandTotal: 50,
    },
  ]);
});

test('agrupar ordens por técnico', () => {
  const orders = [
    { technicianId: 3, totalServices: 100, totalParts: 0, totalDiscounts: 0, grandTotal: 100 },
    { technicianId: 3, totalServices: 50, totalParts: 10, totalDiscounts: 5, grandTotal: 55 },
  ];

  assert.deepStrictEqual(buildFinanceGroupSummary(orders, 'technician'), [
    {
      key: 3,
      count: 2,
      totalServices: 150,
      totalParts: 10,
      totalDiscounts: 5,
      grandTotal: 155,
    },
  ]);
});

test('agrupar ordens por mês', () => {
  const orders = [
    { entryDate: '2026-01-15T10:00:00.000Z', totalServices: 100, totalParts: 0, totalDiscounts: 0, grandTotal: 100 },
    { entryDate: '2026-02-10T10:00:00.000Z', totalServices: 80, totalParts: 20, totalDiscounts: 10, grandTotal: 90 },
    { entryDate: '2026-02-20T10:00:00.000Z', totalServices: 50, totalParts: 10, totalDiscounts: 5, grandTotal: 55 },
  ];

  assert.deepStrictEqual(buildFinanceMonthlySummary(orders), [
    {
      month: '2026-01',
      count: 1,
      totalServices: 100,
      totalParts: 0,
      totalDiscounts: 0,
      grandTotal: 100,
    },
    {
      month: '2026-02',
      count: 2,
      totalServices: 130,
      totalParts: 30,
      totalDiscounts: 15,
      grandTotal: 145,
    },
  ]);
});

test('gera ranking por cliente', () => {
  const orders = [
    { clientId: 1, totalServices: 100, totalParts: 50, totalDiscounts: 10, grandTotal: 140 },
    { clientId: 2, totalServices: 80, totalParts: 20, totalDiscounts: 5, grandTotal: 95 },
    { clientId: 1, totalServices: 40, totalParts: 10, totalDiscounts: 0, grandTotal: 50 },
  ];

  assert.deepStrictEqual(buildFinanceRanking(orders, 'client'), [
    {
      key: 1,
      count: 2,
      totalServices: 140,
      totalParts: 60,
      totalDiscounts: 10,
      grandTotal: 190,
    },
    {
      key: 2,
      count: 1,
      totalServices: 80,
      totalParts: 20,
      totalDiscounts: 5,
      grandTotal: 95,
    },
  ]);
});

test('monta resposta paginada de ordens financeiras', () => {
  const orders = [
    { id: 1, entryDate: '2026-01-01T10:00:00.000Z', totalServices: 20, totalParts: 5, totalDiscounts: 0, grandTotal: 25 },
    { id: 2, entryDate: '2026-02-01T10:00:00.000Z', totalServices: 30, totalParts: 10, totalDiscounts: 5, grandTotal: 35 },
    { id: 3, entryDate: '2026-03-01T10:00:00.000Z', totalServices: 40, totalParts: 10, totalDiscounts: 0, grandTotal: 50 },
  ];

  const response = buildFinanceOrdersResponse(orders, { minValue: '20', page: 2, limit: 1, sortBy: 'value', order: 'ASC' });

  assert.deepStrictEqual(response, {
    orders: [
      { id: 2, entryDate: '2026-02-01T10:00:00.000Z', totalServices: 30, totalParts: 10, totalDiscounts: 5, grandTotal: 35 },
    ],
    total: 3,
    page: 2,
    limit: 1,
    totalPages: 3,
  });
});


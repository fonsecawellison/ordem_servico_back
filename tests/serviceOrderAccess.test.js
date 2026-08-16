const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildServiceOrderAccessFilter,
  getAllowedStatusTransitions,
  canManageServiceOrder,
  getAllowedPaymentMethods,
} = require('../src/services/serviceOrderAccess');

test('admin tem acesso irrestrito às ordens de serviço', () => {
  assert.deepStrictEqual(buildServiceOrderAccessFilter({ role: 'admin', id: 1 }), {});
});

test('técnico vê apenas as ordens atribuídas a ele', () => {
  assert.deepStrictEqual(buildServiceOrderAccessFilter({ role: 'tecnico', id: 7 }), { technicianId: 7 });
});

test('cliente vê apenas as ordens vinculadas ao seu cadastro', () => {
  assert.deepStrictEqual(buildServiceOrderAccessFilter({ role: 'cliente', clientId: 12, id: 99 }), { clientId: 12 });
});

test('cliente sem vínculo não consegue visualizar ordens', () => {
  assert.deepStrictEqual(buildServiceOrderAccessFilter({ role: 'cliente', id: 40 }), { clientId: -1 });
});

test('técnico só avança até serviço finalizado, enquanto admin cuida de concluir e entregar', () => {
  assert.deepStrictEqual(getAllowedStatusTransitions('tecnico'), ['INICIADA', 'TROCA_DE_PNEU', 'TROCA_DE_OLEO', 'SERVICO_FINALIZADO']);
  assert.deepStrictEqual(getAllowedStatusTransitions('admin'), ['ABERTA', 'INICIADA', 'TROCA_DE_PNEU', 'TROCA_DE_OLEO', 'SERVICO_FINALIZADO', 'CONCLUIDA', 'ENTREGUE']);
});

test('admin gerencia qualquer ordem, técnico só gerencia as atribuídas a ele e cliente gerencia a própria ordem', () => {
  assert.equal(canManageServiceOrder({ role: 'admin' }, { technicianId: 99 }), true);
  assert.equal(canManageServiceOrder({ role: 'tecnico', id: 7 }, { technicianId: 7 }), true);
  assert.equal(canManageServiceOrder({ role: 'tecnico', id: 7 }, { technicianId: 8 }), false);
  assert.equal(canManageServiceOrder({ role: 'cliente', clientId: 12, id: 99 }, { clientId: 12 }), true);
  assert.equal(canManageServiceOrder({ role: 'cliente', clientId: 12, id: 99 }, { clientId: 13 }), false);
});

test('cliente só pode escolher entre as formas de pagamento permitidas', () => {
  assert.deepStrictEqual(getAllowedPaymentMethods(), ['DINHEIRO', 'PIX', 'CARTAO', 'CREDITO', 'DEBITO', 'BOLETO']);
});

test('fluxo de pagamento usa valores padronizados para teste e integração', () => {
  const values = getAllowedPaymentMethods();
  assert.ok(values.includes('PIX'));
  assert.ok(values.includes('DINHEIRO'));
  assert.ok(values.includes('CARTAO'));
});

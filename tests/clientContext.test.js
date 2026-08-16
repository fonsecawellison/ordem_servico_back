const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveClientForUser } = require('../src/services/clientContext');

test('cliente sem vínculo real não cria um cliente fantasma', async () => {
  const user = { name: 'Clara', email: 'clara@autoflow.com', role: 'cliente' };

  const fakeClientModel = {
    findOne: async () => null,
    create: async () => {
      throw new Error('Não deve criar cliente em login sem vínculo existente');
    },
  };

  const resolved = await resolveClientForUser(user, fakeClientModel);

  assert.equal(resolved, null);
  assert.equal(user.clientId, null);
});

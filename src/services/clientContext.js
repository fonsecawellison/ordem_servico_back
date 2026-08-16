const ClientModelDefault = require('../models/Client');
const UserModelDefault = require('../models/User');

const resolveClientForUser = async (user, ClientModel = ClientModelDefault) => {
  if (!user || user.role !== 'cliente') {
    return null;
  }

  let client = null;

  if (user.email) {
    client = await ClientModel.findOne({ where: { email: user.email } });
  }

  if (!client && user.name) {
    client = await ClientModel.findOne({ where: { name: user.name } });
  }

  user.clientId = client ? client.id : null;
  return client;
};

const syncCustomerIdentity = async ({
  user = null,
  client = null,
  ClientModel = ClientModelDefault,
  UserModel = UserModelDefault,
  defaultPassword = 'AutoFlow123',
} = {}) => {
  if (!user && !client) {
    return { user: null, client: null };
  }

  let resolvedClient = client;

  if (user && user.role === 'cliente') {
    if (!resolvedClient && user.email) {
      resolvedClient = await ClientModel.findOne({ where: { email: user.email } });
    }

    if (!resolvedClient && user.name) {
      resolvedClient = await ClientModel.findOne({ where: { name: user.name } });
    }

    if (!resolvedClient) {
      resolvedClient = await ClientModel.create({
        name: user.name,
        email: user.email,
      });
    }

    if (user.name && resolvedClient.name !== user.name) {
      await resolvedClient.update({ name: user.name });
    }

    if (user.email && resolvedClient.email !== user.email) {
      await resolvedClient.update({ email: user.email });
    }

    user.clientId = resolvedClient.id;
  }

  if (resolvedClient && resolvedClient.email) {
    let relatedUser = user && user.email === resolvedClient.email ? user : null;

    if (!relatedUser) {
      relatedUser = await UserModel.findOne({ where: { email: resolvedClient.email } });
    }

    if (!relatedUser) {
      relatedUser = await UserModel.create({
        name: resolvedClient.name,
        email: resolvedClient.email,
        password: defaultPassword,
        role: 'cliente',
      });
    } else {
      if (relatedUser.role !== 'cliente') {
        await relatedUser.update({ role: 'cliente' });
      }

      if (relatedUser.name !== resolvedClient.name) {
        await relatedUser.update({ name: resolvedClient.name });
      }
    }

    if (user && user.id && relatedUser.id !== user.id) {
      user.clientId = resolvedClient.id;
    }

    return { user: relatedUser, client: resolvedClient };
  }

  return { user, client: resolvedClient };
};

module.exports = {
  resolveClientForUser,
  syncCustomerIdentity,
};

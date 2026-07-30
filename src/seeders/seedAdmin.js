
const sequelize = require('../config/database');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await sequelize.sync();

    const existingAdmin = await User.findOne({ where: { email: 'admin@autoflow.com' } });
    if (existingAdmin) {
      console.log('Usuário admin já existe');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@autoflow.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Usuário admin criado com sucesso!');
    console.log('Email: admin@autoflow.com');
    console.log('Senha: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
    process.exit(1);
  }
};

seedAdmin();

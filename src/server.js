const app = require('./app');
const sequelize = require('./config/database');

// Carrega todos os relacionamentos entre os models
require('./database/associations');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');

    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com o banco de dados!');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
};

startServer();
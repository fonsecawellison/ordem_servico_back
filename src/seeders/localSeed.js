const sequelize = require('../config/database');
require('../database/associations');

const User = require('../models/User');
const Client = require('../models/Client');
const Equipment = require('../models/Equipment');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderHistory = require('../models/ServiceOrderHistory');
const ServiceOrderService = require('../models/ServiceOrderService');
const ServiceOrderPart = require('../models/ServiceOrderPart');

const seedLocalDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Banco local resetado com sucesso.');

    const admin = await User.create({
      name: 'Administrador da Empresa',
      email: 'admin@autoflow.com',
      password: 'admin123',
      role: 'admin',
    });

    const tecnico = await User.create({
      name: 'Técnico João',
      email: 'tecnico@autoflow.com',
      password: 'tecnico123',
      role: 'tecnico',
    });

    const cliente1User = await User.create({
      name: 'Cliente Maria',
      email: 'cliente@autoflow.com',
      password: 'cliente123',
      role: 'cliente',
    });

    const cliente2User = await User.create({
      name: 'Cliente Carlos',
      email: 'cliente2@autoflow.com',
      password: 'cliente123',
      role: 'cliente',
    });

    const cliente1 = await Client.create({
      name: cliente1User.name,
      email: cliente1User.email,
      phone: '(11) 99999-1111',
      address: 'Rua A, 100 - São Paulo/SP',
    });

    const cliente2 = await Client.create({
      name: cliente2User.name,
      email: cliente2User.email,
      phone: '(11) 99999-2222',
      address: 'Avenida B, 250 - Rio de Janeiro/RJ',
    });

    const equipamento1 = await Equipment.create({
      clientId: cliente1.id,
      type: 'Notebook',
      brand: 'Dell',
      model: 'Inspiron 15',
      serialNumber: 'DELL-1001',
      password: '1234',
      accessories: 'Carregador, mouse sem fio',
    });

    const equipamento2 = await Equipment.create({
      clientId: cliente2.id,
      type: 'Desktop',
      brand: 'HP',
      model: 'ProDesk',
      serialNumber: 'HP-2002',
      password: 'admin',
      accessories: 'Teclado e monitor',
    });

    const produto1 = await Product.create({
      name: 'SSD 480GB',
      description: 'SSD SATA 2.5',
      brand: 'Kingston',
      category: 'Hardware',
      stockQuantity: 12,
      minimumStock: 3,
      unitPrice: 220.00,
      status: 'ATIVO',
    });

    const produto2 = await Product.create({
      name: 'Mouse USB',
      description: 'Mouse óptico USB',
      brand: 'Logitech',
      category: 'Periférico',
      stockQuantity: 20,
      minimumStock: 5,
      unitPrice: 55.00,
      status: 'ATIVO',
    });

    await StockMovement.create({
      productId: produto1.id,
      movementType: 'ENTRADA',
      quantity: 12,
      unitPrice: 220.00,
      reference: 'COMPRA INICIAL',
      notes: 'Estoque inicial',
    });

    await StockMovement.create({
      productId: produto2.id,
      movementType: 'SAIDA',
      quantity: 3,
      unitPrice: 55.00,
      reference: 'USO EM OS',
      notes: 'Retirada para atendimento',
    });

    const ordem1 = await ServiceOrder.create({
      clientId: cliente1.id,
      equipmentId: equipamento1.id,
      technicianId: tecnico.id,
      reportedIssue: 'Notebook travando e reiniciando sozinho.',
      diagnosis: 'Sistema operacional com falhas e memória em uso.',
      solution: 'Reinstalação do sistema e limpeza interna.',
      status: 'ABERTA',
      estimatedCompletion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      notes: 'Cliente solicita atendimento urgente.',
    });

    const ordem2 = await ServiceOrder.create({
      clientId: cliente2.id,
      equipmentId: equipamento2.id,
      technicianId: tecnico.id,
      reportedIssue: 'Desktop sem inicializar.',
      diagnosis: 'Fonte e placa-mãe verificadas; problema de inicialização por disquete.',
      solution: 'Configuração completa e testes de boot.',
      status: 'CONCLUIDA',
      completionDate: new Date(),
      estimatedCompletion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      notes: 'Cliente confirmou retorno.',
    });

    await ServiceOrderHistory.create({
      serviceOrderId: ordem1.id,
      eventType: 'ORDEM_CRIADA',
      description: 'Ordem criada',
      details: 'A ordem foi aberta pelo sistema.',
      createdBy: 'sistema',
    });

    await ServiceOrderHistory.create({
      serviceOrderId: ordem2.id,
      eventType: 'ORDEM_CONCLUIDA',
      description: 'Ordem concluída',
      details: 'Atendimento finalizado com sucesso.',
      createdBy: 'sistema',
    });

    await ServiceOrderService.create({
      serviceOrderId: ordem1.id,
      description: 'Formatação e reinstalação do sistema',
      quantity: 1,
      unitPrice: 180.00,
      discount: 0,
      subtotal: 180.00,
    });

    await ServiceOrderService.create({
      serviceOrderId: ordem2.id,
      description: 'Diagnóstico e configuração de inicialização',
      quantity: 1,
      unitPrice: 260.00,
      discount: 10,
      subtotal: 250.00,
    });

    await ServiceOrderPart.create({
      serviceOrderId: ordem1.id,
      description: 'SSD 480GB',
      brand: 'Kingston',
      quantity: 1,
      unitPrice: 220.00,
      discount: 0,
      subtotal: 220.00,
    });

    await ServiceOrderPart.create({
      serviceOrderId: ordem2.id,
      description: 'Mouse USB',
      brand: 'Logitech',
      quantity: 1,
      unitPrice: 55.00,
      discount: 0,
      subtotal: 55.00,
    });

    console.log('\n=== Credenciais locais de teste ===');
    console.log('Admin: admin@autoflow.com / admin123');
    console.log('Técnico: tecnico@autoflow.com / tecnico123');
    console.log('Cliente Maria: cliente@autoflow.com / cliente123');
    console.log('Cliente Carlos: cliente2@autoflow.com / cliente123');
    console.log('\nObs: este script zera somente o banco local configurado em .env e cria dados de demonstração.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular o banco local:', error);
    process.exit(1);
  }
};

seedLocalDatabase();

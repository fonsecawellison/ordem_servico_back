const ServiceOrderPart = require('../models/ServiceOrderPart');
const ServiceOrderService = require('../models/ServiceOrderService');
const ServiceOrderHistory = require('../models/ServiceOrderHistory');
const Client = require('../models/Client');
const Equipment = require('../models/Equipment');
const ServiceOrder = require('../models/ServiceOrder');
const User = require('../models/User');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');


//==================================================//
//                CLIENTE X EQUIPAMENTO             //
//==================================================//

Client.hasMany(Equipment, {
  foreignKey: 'clientId',
  as: 'equipments',
});

Equipment.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

//==================================================//
//             CLIENTE X ORDEM DE SERVIÇO           //
//==================================================//

Client.hasMany(ServiceOrder, {
  foreignKey: 'clientId',
  as: 'serviceOrders',
});

ServiceOrder.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

//==================================================//
//          EQUIPAMENTO X ORDEM DE SERVIÇO          //
//==================================================//

Equipment.hasMany(ServiceOrder, {
  foreignKey: 'equipmentId',
  as: 'serviceOrders',
});

ServiceOrder.belongsTo(Equipment, {
  foreignKey: 'equipmentId',
  as: 'equipment',
});

//==================================================//
//       USUÁRIO X ORDEM DE SERVIÇO (TÉCNICO)       //
//==================================================//

User.hasMany(ServiceOrder, {
  foreignKey: 'technicianId',
  as: 'assignedServiceOrders',
});

ServiceOrder.belongsTo(User, {
  foreignKey: 'technicianId',
  as: 'technician',
});

//==================================================//
//     ORDEM DE SERVIÇO X SERVIÇOS EXECUTADOS       //
//==================================================//

ServiceOrder.hasMany(ServiceOrderService, {
  foreignKey: 'serviceOrderId',
  as: 'services',
});

ServiceOrderService.belongsTo(ServiceOrder, {
  foreignKey: 'serviceOrderId',
  as: 'serviceOrder',
});

//==================================================//
//        ORDEM DE SERVIÇO X PEÇAS UTILIZADAS       //
//==================================================//

ServiceOrder.hasMany(ServiceOrderPart, {
  foreignKey: 'serviceOrderId',
  as: 'parts',
});

ServiceOrderPart.belongsTo(ServiceOrder, {
  foreignKey: 'serviceOrderId',
  as: 'serviceOrder',
});

//==================================================//
//      ORDEM DE SERVIÇO X HISTÓRICO DA OS         //
//==================================================//

ServiceOrder.hasMany(ServiceOrderHistory, {
  foreignKey: 'serviceOrderId',
  as: 'history',
});

ServiceOrderHistory.belongsTo(ServiceOrder, {
  foreignKey: 'serviceOrderId',
  as: 'serviceOrder',
});

//==================================================//
//           PRODUTO X MOVIMENTAÇÃO DE ESTOQUE     //
//==================================================//

Product.hasMany(StockMovement, {
  foreignKey: 'productId',
  as: 'movements',
});

StockMovement.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});
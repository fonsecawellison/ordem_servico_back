
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const serviceOrderRoutes = require('./routes/serviceOrderRoutes');
const serviceOrderServiceRoutes = require('./routes/serviceOrderServiceRoutes');
const serviceOrderPartRoutes = require('./routes/serviceOrderPartRoutes');
const serviceOrderHistoryRoutes = require('./routes/serviceOrderHistoryRoutes');
const productRoutes = require('./routes/productRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const financeRoutes = require('./routes/financeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ServiceOrderPart = require('./models/ServiceOrderPart');


const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/service-order-services', serviceOrderServiceRoutes);
app.use('/api/service-order-parts', serviceOrderPartRoutes);
app.use('/api/service-order-history', serviceOrderHistoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportRoutes);


// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'AutoFlow API is running!' });
});

module.exports = app;

const express = require('express');
const {
  getFinanceSummary,
  getFinanceByServiceOrder,
} = require('../controllers/financeController');

const router = express.Router();

router.get('/summary', getFinanceSummary);
router.get('/service-orders/:id', getFinanceByServiceOrder);

module.exports = router;

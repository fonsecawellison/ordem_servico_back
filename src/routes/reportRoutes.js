const express = require('express');
const { getFinanceReport } = require('../controllers/reportController');

const router = express.Router();

router.get('/finance', getFinanceReport);

module.exports = router;

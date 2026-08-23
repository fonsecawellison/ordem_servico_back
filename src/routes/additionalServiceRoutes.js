const express = require('express');
const { auth } = require('../middleware/auth');
const { getCatalog, getRequests, createRequest, reviewRequest, decideRequest } = require('../controllers/additionalServiceController');

const router = express.Router();
router.use(auth);
router.get('/catalog', getCatalog);
router.get('/requests', getRequests);
router.post('/requests', createRequest);
router.patch('/requests/:id/review', reviewRequest);
router.patch('/requests/:id/decision', decideRequest);

module.exports = router;

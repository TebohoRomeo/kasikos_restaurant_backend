const express = require('express');
const {requestWithdrawal, listWithdrawals } = require('../controllers/payoutController.js');
const { requireAuth, requireRole } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.post('/', requireAuth, requireRole('owner'), requestWithdrawal);
router.get('/', requireAuth, requireRole('owner'), listWithdrawals);

export default router;

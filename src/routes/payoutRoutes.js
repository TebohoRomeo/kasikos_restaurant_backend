import express from 'express';
import * as payoutCtrl from '../controllers/payoutController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/', requireAuth, requireRole('owner'), payoutCtrl.requestWithdrawal);
router.get('/', requireAuth, requireRole('owner'), payoutCtrl.listWithdrawals);

export default router;

import { Router, raw } from 'express';
const router = Router();
import { webhook } from '../controllers/paymentController.js';

router.post('/webhook', raw({ type: '*/*' }), webhook); // provider may require raw body

export default router;

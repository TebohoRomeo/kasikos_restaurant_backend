const express = require('express');
const { webhook } = requre('../controllers/stripeController.js');
const router = express.Router();
router.post('/webhook', webhook);
export default router;

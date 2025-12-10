import { Router } from 'express';
const router = Router();
import upload from '../config/multer.js';

import { signup, login } from '../controllers/authController.js';

router.post('/signup', upload.fields([{ name: 'logo' }, { name: 'cover' }]), signup); 
router.post('/login', login);

export default router;

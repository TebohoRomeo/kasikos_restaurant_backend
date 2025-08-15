const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { signup, login } = require('../controllers/authController');

router.post('/signup', upload.fields([{ name: 'logo' }, { name: 'cover' }]), signup);
router.post('/login', login);

module.exports = router;

const router = require('express').Router();
const auth = require('../controllers/authController');
const proteger = require('../middleware/authMiddleware');

router.post('/registro', auth.registro);
router.post('/login', auth.login);
router.get('/perfil', proteger, auth.perfil);

module.exports = router;

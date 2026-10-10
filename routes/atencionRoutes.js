const router=require('express').Router();
const admin=require('../middleware/atencionAdmin');
const c=require('../controllers/atencionController');
router.use((req,res,next)=>process.env.DATABASE_URL?next():res.status(503).json({mensaje:'PostgreSQL no configurado'}));
router.post('/',c.crear); // Formulario público, sin MongoDB ni JWT.
router.use(admin); // Administración independiente con clave del módulo.
router.get('/',c.listar);
router.get('/:id',c.obtener);
router.put('/:id',c.modificar);
router.delete('/:id',c.eliminar);
module.exports=router;

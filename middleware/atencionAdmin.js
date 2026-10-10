const crypto=require('node:crypto');
module.exports=(req,res,next)=>{
 const expected=process.env.ATENCION_ADMIN_KEY;
 const supplied=req.get('x-atencion-admin-key');
 if(!expected||!supplied)return res.status(401).json({mensaje:'Credencial administrativa requerida'});
 const a=Buffer.from(supplied),b=Buffer.from(expected);
 if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({mensaje:'Credencial inválida'});
 next();
};

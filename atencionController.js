const db=require('../config/postgres');
const trim=(v)=>typeof v==='string'?v.trim():'';
const idOk=(v)=>/^[1-9]\d*$/.test(String(v));
const campos='id,codigo,nombre,correo,asunto,descripcion,estado,respuesta,creado_en,actualizado_en';
exports.crear=async(req,res,next)=>{try{
 const nombre=trim(req.body.nombre),correo=trim(req.body.correo),asunto=trim(req.body.asunto),descripcion=trim(req.body.descripcion);
 if(!nombre||nombre.length>120||correo.length>254||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(correo)||!asunto||asunto.length>150||descripcion.length<10||descripcion.length>3000)return res.status(400).json({mensaje:'Nombre, correo, asunto y descripción válidos son obligatorios'});
 const r=await db.query('INSERT INTO public.solicitudes_atencion(nombre,correo,asunto,descripcion) VALUES($1,$2,$3,$4) RETURNING id,codigo,estado,creado_en',[nombre,correo,asunto,descripcion]);res.status(201).json(r.rows[0]);
}catch(e){next(e)}};
exports.listar=async(req,res,next)=>{try{const r=await db.query(`SELECT ${campos} FROM public.solicitudes_atencion ORDER BY creado_en DESC LIMIT 100`);res.json(r.rows)}catch(e){next(e)}};
exports.obtener=async(req,res,next)=>{try{if(!idOk(req.params.id))return res.status(400).json({mensaje:'ID inválido'});const r=await db.query(`SELECT ${campos} FROM public.solicitudes_atencion WHERE id=$1`,[req.params.id]);if(!r.rowCount)return res.status(404).json({mensaje:'No encontrada'});res.json(r.rows[0])}catch(e){next(e)}};
exports.modificar=async(req,res,next)=>{try{
 if(!idOk(req.params.id))return res.status(400).json({mensaje:'ID inválido'});
 const estado=trim(req.body.estado),respuesta=req.body.respuesta===null?null:trim(req.body.respuesta);
 if(!['pendiente','en_proceso','resuelto'].includes(estado)||respuesta!==null&&respuesta.length>3000)return res.status(400).json({mensaje:'Estado o respuesta inválidos'});
 const r=await db.query(`UPDATE public.solicitudes_atencion SET estado=$1,respuesta=$2,actualizado_en=now() WHERE id=$3 RETURNING ${campos}`,[estado,respuesta,req.params.id]);if(!r.rowCount)return res.status(404).json({mensaje:'No encontrada'});res.json(r.rows[0]);
}catch(e){next(e)}};
exports.eliminar=async(req,res,next)=>{try{if(!idOk(req.params.id))return res.status(400).json({mensaje:'ID inválido'});const r=await db.query('DELETE FROM public.solicitudes_atencion WHERE id=$1 RETURNING id',[req.params.id]);if(!r.rowCount)return res.status(404).json({mensaje:'No encontrada'});res.json({mensaje:'Eliminada',id:r.rows[0].id})}catch(e){next(e)}};

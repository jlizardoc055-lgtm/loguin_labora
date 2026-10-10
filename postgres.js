const {Pool}=require('pg');
// Se crea el pool sin abrir conexiones durante el arranque.
// Un fallo PostgreSQL no detiene Express ni los endpoints MongoDB.
const pool=new Pool({connectionString:process.env.DATABASE_URL || undefined,
  max:5,connectionTimeoutMillis:5000,
  ssl:process.env.PGSSLMODE==='require'?{rejectUnauthorized:false}:undefined});
pool.on('error',err=>console.error('Error PostgreSQL (pool):',err.message));
module.exports=pool;

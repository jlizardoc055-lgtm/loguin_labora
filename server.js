require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const atencionRoutes = require('./routes/atencionRoutes');
const Usuario = require('./models/Usuario'); // CAMBIO MÍNIMO: modelo para listar/eliminar usuarios


// ============================================================
// CAMBIO 1 - INICIO
// Importamos las métricas definidas en metrics/prometheus.js
// ============================================================
const {
  client,
  httpRequests,
  httpDuration
} = require('./metrics/prometheus');
// ============================================================
// CAMBIO 1 - FIN
// ============================================================


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));


// ============================================================
// CAMBIO 2 - INICIO
// Middleware para medir:
//   - cantidad de requests
//   - código HTTP (200, 404, 500, etc.)
//   - tiempo de respuesta
//
// Debe estar ANTES de las rutas que queremos medir.
// ============================================================
app.use((req, res, next) => {

  // Guardamos el momento exacto en que comenzó la petición
  const start = process.hrtime.bigint();

  // "finish" se ejecuta cuando Express termina de responder
  res.on('finish', () => {

    const end = process.hrtime.bigint();

    // Convertimos nanosegundos a segundos
    const duration = Number(end - start) / 1e9;

    // Intentamos obtener la ruta definida por Express.
    // Si no existe, utilizamos req.path.
    const route = req.route?.path || req.path;

    // -----------------------------------------
    // Contador de requests
    // -----------------------------------------
    httpRequests.inc({
      method: req.method,
      route: route,
      status: res.statusCode
    });

    // -----------------------------------------
    // Tiempo de respuesta
    // -----------------------------------------
    httpDuration.observe(
      {
        method: req.method,
        route: route,
        status: res.statusCode
      },
      duration
    );

  });

  next();
});
// ============================================================
// CAMBIO 2 - FIN
// ============================================================


// ============================================================
// CAMBIO 3 - INICIO
// Endpoint que será consultado por Prometheus.
//
// Ejemplo:
// https://tu-app.onrender.com/metrics
// ============================================================
app.get('/metrics', async (req, res) => {

  res.set('Content-Type', client.register.contentType);

  res.end(
    await client.register.metrics()
  );

});
// ============================================================
// CAMBIO 3 - FIN
// ============================================================


// ------------------------------------------------------------
// A PARTIR DE AQUÍ CONTINÚA TU CÓDIGO ORIGINAL
// ------------------------------------------------------------

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', (req,res,next) => require('mongoose').connection.readyState === 1 ? next() : res.status(503).json({mensaje:'Login temporalmente no disponible'}), authRoutes);
app.use('/api/atencion', atencionRoutes);

// ============================================================
// CAMBIO MÍNIMO - INICIO: endpoints que usa index.html
// ============================================================
app.get('/api/usuarios', (req,res,next) => require('mongoose').connection.readyState === 1 ? next() : res.status(503).json({mensaje:'MongoDB temporalmente no disponible'}), async (req, res, next) => {
  try {
    const usuarios = await Usuario.find()
      .select('nombres apellidos correo createdAt')
      .sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/usuarios/:id', (req,res,next) => require('mongoose').connection.readyState === 1 ? next() : res.status(503).json({mensaje:'MongoDB temporalmente no disponible'}), async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});
// ============================================================
// CAMBIO MÍNIMO - FIN
// ============================================================

app.use(express.static(path.join(__dirname, 'public')));


// Tu código original comentado
// app.get('*', (req, res) => {
//   if (req.path.startsWith('/api/'))
//     return res.status(404).json({
//       mensaje: 'Ruta API no encontrada'
//     });
//
//   res.sendFile(
//     path.join(__dirname, 'public', 'index.html')
//   );
// });


// Errores de servicios MongoDB no deben afectar al módulo PostgreSQL.
app.use((err, req, res, next) => {
  console.error(err);
  if ((req.path.startsWith('/api/auth') || req.path.startsWith('/api/usuarios')) &&
      require('mongoose').connection.readyState !== 1) {
    return res.status(503).json({mensaje:'Servicio MongoDB temporalmente no disponible'});
  }
  res.status(500).json({mensaje:'Error interno del servidor'});
});

// Arranque desacoplado: HTTP y PostgreSQL NO esperan a MongoDB.
// Mongoose intentará reconectar en segundo plano. Las rutas MongoDB
// responderán 503 rápidamente cuando la conexión no esté disponible.
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor activo en puerto ${PORT}`));
let connecting = false;
async function reconnectMongo() {
  if (connecting || mongoose.connection.readyState === 1 || !process.env.MONGODB_URI) return;
  connecting = true;
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB no disponible (atención PostgreSQL sigue activa):', error.message);
  } finally { connecting = false; }
}
reconnectMongo();
setInterval(reconnectMongo, 30000).unref();

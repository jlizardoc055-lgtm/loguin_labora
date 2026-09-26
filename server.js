require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'public')));

//app.get('*', (req, res) => {
 // if (req.path.startsWith('/api/')) return res.status(404).json({ mensaje: 'Ruta API no encontrada' });
  //res.sendFile(path.join(__dirname, 'public', 'index.html'));
//});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`Servidor activo en puerto ${PORT}`));
}).catch((err) => {
  console.error('No se pudo iniciar la aplicación:', err.message);
  process.exit(1);
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const normalizarCorreo = (correo = '') => correo.trim().toLowerCase();
const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

function crearToken(usuario) {
  return jwt.sign(
    { sub: usuario._id.toString(), correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

exports.registro = async (req, res, next) => {
  try {
    const nombres = String(req.body.nombres || '').trim();
    const apellidos = String(req.body.apellidos || '').trim();
    const correo = normalizarCorreo(req.body.correo);
    const password = String(req.body.password || '');

    if (!nombres || !apellidos || !correo || !password)
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    if (!correoValido(correo))
      return res.status(400).json({ mensaje: 'Correo no válido' });
    if (password.length < 8)
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });

    const existente = await Usuario.findOne({ correo });
    if (existente) return res.status(409).json({ mensaje: 'El correo ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 12);
    const usuario = await Usuario.create({ nombres, apellidos, correo, passwordHash });
    const token = crearToken(usuario);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      token,
      usuario: { id: usuario._id, nombres, apellidos, correo }
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ mensaje: 'El correo ya está registrado' });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const correo = normalizarCorreo(req.body.correo);
    const password = String(req.body.password || '');
    if (!correo || !password) return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });

    const usuario = await Usuario.findOne({ correo }).select('+passwordHash');
    if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash)))
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const token = crearToken(usuario);
    res.json({
      mensaje: 'Login correcto', token,
      usuario: { id: usuario._id, nombres: usuario.nombres, apellidos: usuario.apellidos, correo: usuario.correo }
    });
  } catch (error) { next(error); }
};

exports.perfil = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('nombres apellidos correo createdAt');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ usuario });
  } catch (error) { next(error); }
};

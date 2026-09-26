const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombres: { type: String, required: true, trim: true, maxlength: 100 },
  apellidos: { type: String, required: true, trim: true, maxlength: 100 },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true, collection: 'usuario' });

usuarioSchema.index({ correo: 1 }, { unique: true });
module.exports = mongoose.model('Usuario', usuarioSchema);

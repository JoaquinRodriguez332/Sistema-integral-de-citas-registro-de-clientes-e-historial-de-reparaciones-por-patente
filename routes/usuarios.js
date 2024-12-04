import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { generateToken, verifyToken, hashPassword, comparePassword, authorize } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Login

// Ruta de login con más logging
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('Intento de login para:', email);
    
    // Buscar usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = rows[0];
    console.log('Usuario encontrado:', { id: user.id, email: user.email, rol: user.rol });
    
    // Verificar contraseña
    const isMatch = await comparePassword(password, user.password);
    console.log('Resultado de comparación de contraseña:', isMatch);
    console.log(password,user.password);
    
    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = generateToken(user);
    console.log('Token generado exitosamente');
    
    // Enviar respuesta
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Obtener todos los usuarios (solo admin)
router.get('/', verifyToken, authorize(['admin','secretaria','mecanico']), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, apellido, email, rut, telefono, rol, estado FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo usuario (solo admin)
router.post('/', verifyToken, authorize(['admin']), async (req, res) => {
  const { nombre, apellido, email, password, rut, telefono, rol } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, rut, telefono, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, hashedPassword, rut, telefono, rol]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un usuario (admin o el propio usuario)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, telefono, rol, estado } = req.body;
  try {
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }
    const [result] = await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, rol = ?, estado = ? WHERE id = ?',
      [nombre, apellido, email, telefono, rol, estado, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      res.json({ mensaje: 'Usuario actualizado exitosamente' });
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un usuario (solo admin)
router.delete('/:id', verifyToken, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('UPDATE usuarios SET estado = "inactivo" WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      res.json({ mensaje: 'Usuario desactivado exitosamente' });
    }
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
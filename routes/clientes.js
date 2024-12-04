import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  const { nombre, apellido, rut, email, telefono } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, apellido, rut, email, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, rut, email, telefono]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Cliente creado exitosamente' });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, telefono } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE clientes SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE id = ?',
      [nombre, apellido, email, telefono, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
    } else {
      res.json({ mensaje: 'Cliente actualizado exitosamente' });
    }
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
    } else {
      res.json({ mensaje: 'Cliente eliminado exitosamente' });
    }
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// En el archivo clientes.js
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.query('SELECT * FROM clientes LIMIT ? OFFSET ?', [limit, offset]);
    const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM clientes');
    
    res.json({
      data: rows,
      page,
      limit,
      totalCount: totalCount[0].count,
      totalPages: Math.ceil(totalCount[0].count / limit)
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


export default router;
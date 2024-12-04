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

// Obtener todas las reparaciones
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, v.patente, v.marca, v.modelo, u.nombre AS mecanico_nombre 
      FROM reparaciones r 
      LEFT JOIN vehiculos v ON r.vehiculo_id = v.id 
      LEFT JOIN usuarios u ON r.mecanico_id = u.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reparaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear una nueva reparación
router.post('/', async (req, res) => {
  const { vehiculo_id, mecanico_id, fecha_ingreso, descripcion, costo } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO reparaciones (vehiculo_id, mecanico_id, fecha_ingreso, descripcion, costo) VALUES (?, ?, ?, ?, ?)',
      [vehiculo_id, mecanico_id, fecha_ingreso, descripcion, costo]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Reparación creada exitosamente' });
  } catch (error) {
    console.error('Error al crear reparación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar una reparación
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha_salida, descripcion, estado, costo, mecanico_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE reparaciones SET fecha_salida = ?, descripcion = ?, estado = ?, costo = ?, mecanico_id = ? WHERE id = ?',
      [fecha_salida, descripcion, estado, costo, mecanico_id, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Reparación no encontrada' });
    } else {
      res.json({ mensaje: 'Reparación actualizada exitosamente' });
    }
  } catch (error) {
    console.error('Error al actualizar reparación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar una reparación
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM reparaciones WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Reparación no encontrada' });
    } else {
      res.json({ mensaje: 'Reparación eliminada exitosamente' });
    }
  } catch (error) {
    console.error('Error al eliminar reparación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Confirmar finalización de reparación
router.post('/:id/confirmar', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE reparaciones SET estado = "completada", fecha_salida = CURRENT_DATE WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Reparación no encontrada' });
    } else {
      res.json({ mensaje: 'Reparación confirmada como completada' });
    }
  } catch (error) {
    console.error('Error al confirmar reparación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
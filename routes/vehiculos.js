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

// Obtener todos los vehículos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehiculos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo vehículo
// Crear un nuevo vehículo
router.post('/', async (req, res) => {
  const { cliente_id, patente, marca, modelo, anio, descripcion, mecanico_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO vehiculos (cliente_id, patente, marca, modelo, anio, descripcion, mecanico_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cliente_id, patente, marca, modelo, anio, descripcion, mecanico_id]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Vehículo creado exitosamente' });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { patente, marca, modelo, anio, descripcion, mecanico_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE vehiculos SET patente = ?, marca = ?, modelo = ?, anio = ?, descripcion = ?, mecanico_id = ? WHERE id = ?',
      [patente, marca, modelo, anio, descripcion, mecanico_id, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Vehículo no encontrado' });
    } else {
      res.json({ mensaje: 'Vehículo actualizado exitosamente' });
    }
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// Eliminar un vehículo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Vehículo no encontrado' });
    } else {
      res.json({ mensaje: 'Vehículo eliminado exitosamente' });
    }
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// En el archivo vehiculos.js
router.get('/', async (req, res) => {
  const { search, marca, modelo } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM vehiculos WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (patente LIKE ? OR marca LIKE ? OR modelo LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (marca) {
    query += ' AND marca = ?';
    params.push(marca);
  }

  if (modelo) {
    query += ' AND modelo = ?';
    params.push(modelo);
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [rows] = await pool.query(query, params);
    const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM vehiculos');
    
    res.json({
      data: rows,
      page,
      limit,
      totalCount: totalCount[0].count,
      totalPages: Math.ceil(totalCount[0].count / limit)
    });
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
export default router;
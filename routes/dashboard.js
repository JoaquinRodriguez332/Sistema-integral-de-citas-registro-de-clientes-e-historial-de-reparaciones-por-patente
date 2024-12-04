import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import mysql from 'mysql2/promise';

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

router.get('/', verifyToken, async (req, res) => {
  try {
    const [totalClientes] = await pool.query('SELECT COUNT(*) as total FROM clientes');
    const [totalVehiculos] = await pool.query('SELECT COUNT(*) as total FROM vehiculos');
    const [reparacionesEnProceso] = await pool.query('SELECT COUNT(*) as total FROM reparaciones WHERE estado = "en_proceso"');
    
    const dashboardData = {
      totalClientes: totalClientes[0].total,
      totalVehiculos: totalVehiculos[0].total,
      reparacionesEnProceso: reparacionesEnProceso[0].total
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
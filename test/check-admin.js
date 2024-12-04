import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', ['admin@example.com']);
    
    if (rows.length > 0) {
      console.log('Usuario administrador encontrado:', rows[0]);
    } else {
      console.log('Usuario administrador no encontrado');
    }
  } catch (error) {
    console.error('Error al buscar el usuario administrador:', error);
  } finally {
    await connection.end();
  }
}

checkAdminUser();
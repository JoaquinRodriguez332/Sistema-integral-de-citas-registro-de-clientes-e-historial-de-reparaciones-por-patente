import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function updateAdminPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Generar nuevo hash de contraseña
    const plainPassword = 'adminpassword';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Actualizar la contraseña en la base de datos
    await connection.execute(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@example.com']
    );

    console.log('Contraseña de administrador actualizada exitosamente');

    // Verificar la actualización
    const [rows] = await connection.execute(
      'SELECT password FROM usuarios WHERE email = ?',
      ['admin@example.com']
    );

    if (rows.length > 0) {
      const storedHash = rows[0].password;
      const isMatch = await bcrypt.compare(plainPassword, storedHash);
      console.log('¿La nueva contraseña coincide?', isMatch);
    } else {
      console.log('No se encontró el usuario administrador');
    }

  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
  } finally {
    await connection.end();
  }
}

updateAdminPassword();
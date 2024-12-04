import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Hashear la contraseña
    const plainPassword = 'clave123segura';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insertar usuario de prueba
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, apellido, email, password, rut, telefono, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Maria', 'Test', 'maria@example12.com', hashedPassword, '12545678-9', '123456789', 'secretaria']
    );

    console.log('Usuario de prueba creado con ID:', result.insertId);
    console.log('Email: maria@example.com');
    console.log('Contraseña sin hashear:', plainPassword);
    console.log('Contraseña hasheada:', hashedPassword);

    await connection.end();
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
  }
};

createTestUser();


//cd desktop/sistema-citas-reparciones



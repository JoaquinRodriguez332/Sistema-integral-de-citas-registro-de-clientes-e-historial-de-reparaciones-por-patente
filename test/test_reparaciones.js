import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testCrearReparacion() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // 1. Obtener un cliente existente
    const [clientes] = await connection.execute('SELECT id FROM clientes LIMIT 1');
    if (clientes.length === 0) throw new Error('No se encontraron clientes');
    const clienteId = clientes[0].id;
    console.log('Cliente seleccionado:', clienteId);

    // 2. Obtener un vehículo asociado a ese cliente
    const [vehiculos] = await connection.execute('SELECT id FROM vehiculos WHERE cliente_id = ? LIMIT 1', [clienteId]);
    if (vehiculos.length === 0) throw new Error('No se encontraron vehículos para este cliente');
    const vehiculoId = vehiculos[0].id;
    console.log('Vehículo seleccionado:', vehiculoId);

    // 3. Obtener un mecánico disponible
    const [mecanicos] = await connection.execute('SELECT id FROM usuarios WHERE rol = "mecanico" LIMIT 1');
    if (mecanicos.length === 0) throw new Error('No se encontraron mecánicos');
    const mecanicoId = mecanicos[0].id;
    console.log('Mecánico seleccionado:', mecanicoId);

    // 4. Crear una nueva reparación
    const [result] = await connection.execute(
      'INSERT INTO reparaciones (vehiculo_id, mecanico_id, fecha_ingreso, descripcion, estado, costo) VALUES (?, ?, NOW(), ?, ?, ?)',
      [vehiculoId, mecanicoId, 'Mantenimiento general', 'pendiente', 100.00]
    );

    console.log('Reparación creada con ID:', result.insertId);

    // Verificar la inserción
    const [reparacion] = await connection.execute('SELECT * FROM reparaciones WHERE id = ?', [result.insertId]);
    console.log('Detalles de la reparación creada:', reparacion[0]);

  } catch (error) {
    console.error('Error al crear reparación:', error);
  } finally {
    await connection.end();
  }
}

testCrearReparacion();
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function createRepair(token) {
  const response = await fetch(`${BASE_URL}/reparaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      vehiculo_id: 1, // Asume que el vehículo con ID 1 existe
      mecanico_id: 1, // Asume que el mecánico con ID 1 existe
      fecha_ingreso: new Date().toISOString().split('T')[0],
      descripcion: 'Cambio de aceite y filtros',
      costo: 50000
    })
  });

  const data = await response.json();
  console.log('Reparación creada:', data);
}

// Usa el token obtenido del login
const token = 'TOKEN_OBTENIDO_DEL_LOGIN';
createRepair(token);
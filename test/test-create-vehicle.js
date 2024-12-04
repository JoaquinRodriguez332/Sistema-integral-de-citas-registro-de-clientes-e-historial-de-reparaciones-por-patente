import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function createVehicle(token) {
  const response = await fetch(`${BASE_URL}/vehiculos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      cliente_id: 1, // Asume que el cliente con ID 1 existe
      patente: 'ABC123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2020,
      descripcion: 'Sedán color blanco'
    })
  });

  const data = await response.json();
  console.log('Vehículo creado:', data);
}

// Usa el token obtenido del login
const token = 'TOKEN_OBTENIDO_DEL_LOGIN';
createVehicle(token);
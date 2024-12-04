import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function createClient(token) {
  const response = await fetch(`${BASE_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre: 'María',
      apellido: 'González',
      rut: '98765432-1',
      email: 'maria@example.com',
      telefono: '987654321'
    })
  });

  const data = await response.json();
  console.log('Cliente creado:', data);
}

// Usa el token obtenido del login
const token = 'TOKEN_OBTENIDO_DEL_LOGIN';
createClient(token);
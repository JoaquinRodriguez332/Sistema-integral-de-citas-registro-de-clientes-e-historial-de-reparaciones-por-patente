import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function loginUser() {
  const response = await fetch(`${BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'juan@example.com',
      password: 'password123'
    })
  });

  const data = await response.json();
  console.log('Respuesta del login:', data);
  return data.token; // Guarda este token para usarlo en las siguientes solicitudes
}

loginUser();
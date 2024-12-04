import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function loginAdmin() {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'adminpassword'
      })
    });

    const data = await response.json();
    console.log('Estado de la respuesta:', response.status);
    console.log('Respuesta completa:', data);

    if (data.token) {
      console.log('Token de administrador:', data.token);
    } else {
      console.log('No se recibió token. Verifica las credenciales y la lógica de autenticación.');
    }
  } catch (error) {
    console.error('Error al intentar iniciar sesión:', error);
  }
}

loginAdmin();
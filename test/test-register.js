import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2wiOiJhZG1pbiIsImlhdCI6MTczMDM4NjU1NSwiZXhwIjoxNzMwMzkwMTU1fQ.maUvZCiiWaIYuLY8URmQRLLbiDL7r8IBb6YaHyPVYno';

async function createUser() {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        nombre: 'Nuevo',
        apellido: 'Usuario',
        email: 'nuevo@example.com',
        password: 'password123',
        rut: '11111111-1',
        telefono: '123456789',
        rol: 'mecanico'
      })
    });

    const data = await response.json();
    console.log('Estado de la respuesta:', response.status);
    console.log('Respuesta completa:', data);
  } catch (error) {
    console.error('Error al crear usuario:', error);
  }
}

createUser();
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Cliente {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
}

interface Mecanico {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
}

interface Vehiculo {
  id: number;
  cliente_id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  descripcion: string;
  mecanico_id: number | null;
}

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [nuevoVehiculo, setNuevoVehiculo] = useState<Vehiculo>({
    id: 0,
    cliente_id: 0,
    patente: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    descripcion: '',
    mecanico_id: null
  });
  const [editando, setEditando] = useState<number | null>(null);
  const [filtroRut, setFiltroRut] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No se encontró el token de autenticación');
    
      // Verificar que las cabeceras incluyan el token en todas las llamadas
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const promises = [
        axios.get('http://localhost:3000/api/vehiculos', { headers }),
        axios.get('http://localhost:3000/api/clientes', { headers }),
        axios.get('http://localhost:3000/api/usuarios', { 
          headers,
          params: { rol: 'mecanico', estado: 'activo' }
        })
      ];

      const [vehiculosRes, clientesRes, mecanicosRes] = await Promise.all(promises);
    
      setVehiculos(vehiculosRes.data);
      setClientes(clientesRes.data);
      setMecanicos(Array.isArray(mecanicosRes.data) ? mecanicosRes.data.filter(m => m.rol === 'mecanico') : []);
    
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos. Por favor, verifique su conexión y permisos. Si el problema persiste, contacte al administrador.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cargarVehiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Vehiculo[]>('http://localhost:3000/api/vehiculos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Vehículos cargados:', response.data);
      setVehiculos(response.data);
    } catch (err) {
      console.error('Error al cargar vehículos:', err);
      throw new Error('Error al cargar vehículos');
    }
  };

  const cargarClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Cliente[]>('http://localhost:3000/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      throw new Error('Error al cargar clientes');
    }
  };

  const cargarMecanicos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Mecanico[]>('http://localhost:3000/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` },
        params: { rol: 'mecanico', estado: 'activo' }
      });
    
      if (!Array.isArray(response.data)) {
        throw new Error('La respuesta de mecánicos no es un array');
      }

      const mecanicosFiltrados = response.data.filter(usuario => 
        usuario.rol === 'mecanico'
      );

      console.log('Mecánicos cargados:', mecanicosFiltrados);
      setMecanicos(mecanicosFiltrados);
    } catch (err) {
      console.error('Error al cargar mecánicos:', err);
      throw new Error('Error al cargar mecánicos');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Cambiando ${name} a:`, value);
    
    setNuevoVehiculo(prev => {
      const updatedVehiculo = {
        ...prev,
        [name]: name === 'anio' ? parseInt(value) || 0 : 
                name === 'mecanico_id' ? (value === '' ? null : parseInt(value)) : 
                name === 'cliente_id' ? parseInt(value) || 0 : 
                value
      };
      console.log('Nuevo estado del vehículo:', updatedVehiculo);
      return updatedVehiculo;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setActualizando(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No se encontró el token de autenticación');

      const vehiculoData = {
        ...nuevoVehiculo,
        cliente_id: Number(nuevoVehiculo.cliente_id),
        mecanico_id: nuevoVehiculo.mecanico_id === null ? null : Number(nuevoVehiculo.mecanico_id)
      };

      console.log('Datos a enviar:', vehiculoData);

      let response;
      if (editando) {
        response = await axios.put(`http://localhost:3000/api/vehiculos/${editando}`, vehiculoData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await axios.post('http://localhost:3000/api/vehiculos', vehiculoData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Respuesta del servidor:', response.data);

      await cargarVehiculos();

      setNuevoVehiculo({
        id: 0,
        cliente_id: 0,
        patente: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        descripcion: '',
        mecanico_id: null
      });
      setEditando(null);

      alert(editando ? 'Vehículo actualizado con éxito' : 'Vehículo creado con éxito');

    } catch (err) {
      console.error('Error al guardar vehículo:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error al guardar vehículo: ${err.response.data.message || err.message}`);
      } else {
        setError('Error al guardar vehículo. Por favor, intente de nuevo.');
      }
    } finally {
      setActualizando(false);
    }
  };

  const handleEditar = (vehiculo: Vehiculo) => {
    console.log('Editando vehículo:', vehiculo);
    setNuevoVehiculo({
      ...vehiculo,
      mecanico_id: vehiculo.mecanico_id
    });
    setEditando(vehiculo.id);
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      setError(null);
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/vehiculos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await cargarVehiculos();
      } catch (err) {
        console.error('Error al eliminar vehículo:', err);
        setError('Error al eliminar vehículo. Por favor, intente de nuevo.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Vehículos</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={nuevoVehiculo.cliente_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.rut} - {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="patente" className="block text-sm font-medium text-gray-700">
              Patente
            </label>
            <input
              type="text"
              id="patente"
              name="patente"
              value={nuevoVehiculo.patente}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
              Marca
            </label>
            <input
              type="text"
              id="marca"
              name="marca"
              value={nuevoVehiculo.marca}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">
              Modelo
            </label>
            <input
              type="text"
              id="modelo"
              name="modelo"
              value={nuevoVehiculo.modelo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="anio" className="block text-sm font-medium text-gray-700">
              Año
            </label>
            <input
              type="number"
              id="anio"
              name="anio"
              value={nuevoVehiculo.anio}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div>
            <label htmlFor="mecanico_id" className="block text-sm font-medium text-gray-700">
              Mecánico
            </label>
            <select
              id="mecanico_id"
              name="mecanico_id"
              value={nuevoVehiculo.mecanico_id === null ? '' : nuevoVehiculo.mecanico_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Seleccione un mecánico</option>
              {mecanicos.length > 0 ? (
                mecanicos.map(mecanico => (
                  <option key={mecanico.id} value={mecanico.id}>
                    {mecanico.nombre} {mecanico.apellido}
                  </option>
                ))
              ) : (
                <option disabled>No hay mecánicos disponibles</option>
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={nuevoVehiculo.descripcion}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={actualizando}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {actualizando ? 'Guardando...' : (editando ? 'Actualizar Vehículo' : 'Agregar Vehículo')}
          </button>
        </div>
      </form>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Filtrar Vehículos por RUT del Cliente</h2>
        <input
          type="text"
          value={filtroRut}
          onChange={(e) => setFiltroRut(e.target.value)}
          placeholder="Ingrese RUT del cliente"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Año
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mecánico
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehiculos
              .filter(vehiculo => {
                const cliente = clientes.find(c => c.id === vehiculo.cliente_id);
                return cliente?.rut.toLowerCase().includes(filtroRut.toLowerCase());
              })
              .map((vehiculo) => {
                const cliente = clientes.find(c => c.id === vehiculo.cliente_id);
                return (
                  <tr key={vehiculo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cliente ? `${cliente.rut} - ${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehiculo.patente}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehiculo.marca}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehiculo.modelo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehiculo.anio}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehiculo.mecanico_id 
                        ? mecanicos.find(m => m.id === vehiculo.mecanico_id)?.nombre + ' ' + mecanicos.find(m => m.id === vehiculo.mecanico_id)?.apellido
                        : 'No asignado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditar(vehiculo)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(vehiculo.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
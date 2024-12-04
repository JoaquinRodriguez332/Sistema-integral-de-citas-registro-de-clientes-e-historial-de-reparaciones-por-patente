import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', apellido: '', rut: '', email: '', telefono: '' });
  const [editando, setEditando] = useState<number | null>(null);
  const [filtro, setFiltro] = useState({ nombre: '', rut: '', email: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar clientes. Por favor, intente de nuevo.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoCliente({ ...nuevoCliente, [name]: value });
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltro({ ...filtro, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editando) {
        await axios.put(`http://localhost:3000/api/clientes/${editando}`, nuevoCliente, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3000/api/clientes', nuevoCliente, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      cargarClientes();
      setNuevoCliente({ nombre: '', apellido: '', rut: '', email: '', telefono: '' });
      setEditando(null);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setError('Error al guardar cliente. Por favor, intente de nuevo.');
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setNuevoCliente(cliente);
    setEditando(cliente.id);
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        cargarClientes();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        setError('Error al eliminar cliente. Por favor, intente de nuevo.');
      }
    }
  };

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(filtro.nombre.toLowerCase()) &&
    cliente.rut.includes(filtro.rut) &&
    cliente.email.toLowerCase().includes(filtro.email.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Clientes</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={nuevoCliente.nombre}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
            <input
              type="text"
              name="apellido"
              id="apellido"
              value={nuevoCliente.apellido}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
            <input
              type="text"
              name="rut"
              id="rut"
              value={nuevoCliente.rut}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={nuevoCliente.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              id="telefono"
              value={nuevoCliente.telefono}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {editando ? 'Actualizar Cliente' : 'Agregar Cliente'}
          </button>
        </div>
      </form>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Filtrar Clientes</h2>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="nombre"
            placeholder="Filtrar por nombre"
            value={filtro.nombre}
            onChange={handleFiltroChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="text"
            name="rut"
            placeholder="Filtrar por RUT"
            value={filtro.rut}
            onChange={handleFiltroChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="text"
            name="email"
            placeholder="Filtrar por email"
            value={filtro.email}
            onChange={handleFiltroChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.apellido}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.rut}</td>
                <td className="px-6 py-4  whitespace-nowrap">{cliente.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.telefono}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEditar(cliente)} className="text-indigo-600 hover:text-indigo-900 mr-2">Editar</button>
                  <button onClick={() => handleEliminar(cliente.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
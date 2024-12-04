'use client'

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

interface Reparacion {
  id: number
  vehiculo_id: number
  mecanico_id: number
  fecha_ingreso: string
  fecha_salida: string | null
  descripcion: string
  estado: 'pendiente' | 'en_proceso' | 'completada'
  costo: number
}

interface Vehiculo {
  id: number
  patente: string
  marca: string
  modelo: string
  mecanico_id: number
}

interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rut: string
  telefono: string
  rol: string
  estado: string
}

// Función auxiliar para formatear fechas
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function GestionReparaciones() {
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [nuevaReparacion, setNuevaReparacion] = useState<Omit<Reparacion, 'id'>>({
    vehiculo_id: 0,
    mecanico_id: 0,
    fecha_ingreso: formatDate(new Date()),
    fecha_salida: null,
    descripcion: '',
    estado: 'pendiente',
    costo: 0
  })
  const [editando, setEditando] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ id: number, rol: string } | null>(null)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No se encontró el token de autenticación')

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [reparacionesRes, vehiculosRes, usuariosRes] = await Promise.all([
        axios.get('http://localhost:3000/api/reparaciones', { headers }),
        axios.get('http://localhost:3000/api/vehiculos', { headers }),
        axios.get('http://localhost:3000/api/usuarios', { headers })
      ])

      setReparaciones(reparacionesRes.data)
      setVehiculos(vehiculosRes.data)
      setUsuarios(usuariosRes.data)

      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const parsedUserInfo = JSON.parse(userInfoStr)
        setUserInfo(parsedUserInfo)
        if (parsedUserInfo.rol === 'mecanico') {
          setNuevaReparacion(prev => ({
            ...prev,
            mecanico_id: parsedUserInfo.id
          }))
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar datos. Por favor, verifique su conexión y permisos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'vehiculo_id') {
      const vehiculoSeleccionado = vehiculos.find(v => v.id === parseInt(value))
      setNuevaReparacion(prev => ({
        ...prev,
        vehiculo_id: parseInt(value),
        mecanico_id: vehiculoSeleccionado?.mecanico_id || 0
      }))
    } else if (name === 'mecanico_id') {
      setNuevaReparacion(prev => ({
        ...prev,
        mecanico_id: parseInt(value),
        vehiculo_id: 0
      }))
    } else if (name === 'fecha_ingreso' || name === 'fecha_salida') {
      setNuevaReparacion(prev => ({
        ...prev,
        [name]: value ? value : null
      }))
    } else if (name === 'costo') {
      setNuevaReparacion(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else {
      setNuevaReparacion(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No se encontró el token de autenticación')

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const formattedReparacion = {
        ...nuevaReparacion,
        fecha_ingreso: nuevaReparacion.fecha_ingreso,
        fecha_salida: nuevaReparacion.fecha_salida
      }

      if (editando) {
        await axios.put(`http://localhost:3000/api/reparaciones/${editando}`, formattedReparacion, { headers })
      } else {
        await axios.post('http://localhost:3000/api/reparaciones', formattedReparacion, { headers })
      }

      await cargarDatos()
      setNuevaReparacion({
        vehiculo_id: 0,
        mecanico_id: userInfo?.rol === 'mecanico' ? userInfo.id : 0,
        fecha_ingreso: formatDate(new Date()),
        fecha_salida: null,
        descripcion: '',
        estado: 'pendiente',
        costo: 0
      })
      setEditando(null)
    } catch (err) {
      console.error('Error al guardar reparación:', err)
      setError('Error al guardar reparación. Por favor, intente de nuevo.')
    }
  }

  const handleEditar = (reparacion: Reparacion) => {
    setNuevaReparacion({
      ...reparacion,
      fecha_ingreso: reparacion.fecha_ingreso,
      fecha_salida: reparacion.fecha_salida
    })
    setEditando(reparacion.id)
  }

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta reparación?')) {
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No se encontró el token de autenticación')

        await axios.delete(`http://localhost:3000/api/reparaciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await cargarDatos()
      } catch (err) {
        console.error('Error al eliminar reparación:', err)
        setError('Error al eliminar reparación. Por favor, intente de nuevo.')
      }
    }
  }

  const handleConfirmar = async (id: number) => {
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No se encontró el token de autenticación')

      await axios.post(`http://localhost:3000/api/reparaciones/${id}/confirmar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await cargarDatos()
    } catch (err) {
      console.error('Error al confirmar reparación:', err)
      setError('Error al confirmar reparación. Por favor, intente de nuevo.')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  const mecanicos = usuarios.filter(usuario => usuario.rol === 'mecanico' && usuario.estado === 'activo')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Reparaciones</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vehiculo_id" className="block text-sm font-medium text-gray-700">Vehículo</label>
            <select
              id="vehiculo_id"
              name="vehiculo_id"
              value={nuevaReparacion.vehiculo_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              disabled={!nuevaReparacion.mecanico_id}
            >
              <option value="">Seleccione un vehículo</option>
              {vehiculos
                .filter(vehiculo => vehiculo.mecanico_id === nuevaReparacion.mecanico_id)
                .map(vehiculo => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.patente} - {vehiculo.marca} {vehiculo.modelo}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="mecanico_id" className="block text-sm font-medium text-gray-700">Mecánico</label>
            <select
              id="mecanico_id"
              name="mecanico_id"
              value={nuevaReparacion.mecanico_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              disabled={userInfo?.rol === 'mecanico'}
            >
              <option value="">Seleccione un mecánico</option>
              {mecanicos.map(mecanico => (
                <option key={mecanico.id} value={mecanico.id}>
                  {mecanico.nombre} {mecanico.apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={nuevaReparacion.fecha_ingreso}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="fecha_salida" className="block text-sm font-medium text-gray-700">Fecha de Salida</label>
            <input
              type="date"
              id="fecha_salida"
              name="fecha_salida"
              value={nuevaReparacion.fecha_salida || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción del trabajo</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={nuevaReparacion.descripcion}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              id="estado"
              name="estado"
              value={nuevaReparacion.estado}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <div>
            <label htmlFor="costo" className="block text-sm font-medium text-gray-700">Costo</label>
            <input
              type="number"
              id="costo"
              name="costo"
              value={nuevaReparacion.costo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {editando ? 'Actualizar Reparación' : 'Registrar Reparación'}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mecánico</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Salida</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Costo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reparaciones.map((reparacion) => {
              const vehiculo = vehiculos.find(v => v.id === reparacion.vehiculo_id)
              const mecanico = usuarios.find(u => u.id === reparacion.mecanico_id)
              return (
                <tr key={reparacion.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehiculo ? `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}` : 'Vehículo no encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {mecanico ? `${mecanico.nombre} ${mecanico.apellido}` : 'Mecánico no encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{reparacion.fecha_ingreso}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reparacion.fecha_salida || '-'}
                  </td>
                  <td className="px-6 py-4">{reparacion.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reparacion.estado === 'completada' ? 'bg-green-100 text-green-800' : 
                      reparacion.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {reparacion.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    ${typeof reparacion.costo === 'number' ? reparacion.costo.toFixed(2) : reparacion.costo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEditar(reparacion)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                      Editar
                    </button>
                    <button onClick={() => handleEliminar(reparacion.id)} className="text-red-600 hover:text-red-900 mr-2">
                      Eliminar
                    </button>
                    {reparacion.estado !== 'completada' && (
                      <button onClick={() => handleConfirmar(reparacion.id)} className="text-green-600 hover:text-green-900">
                        Confirmar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


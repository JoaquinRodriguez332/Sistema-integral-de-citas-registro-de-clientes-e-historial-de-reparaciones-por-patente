import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  rol: 'mecanico' | 'secretaria' | 'admin';
  estado: 'activo' | 'inactivo';
}

interface UserFormData {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  rol: 'mecanico' | 'secretaria' | 'admin';
  estado: 'activo' | 'inactivo';
  password?: string;
}

// Componente Modal
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Componente Formulario de Usuario
const UserForm: React.FC<{
  initialData: UserFormData;
  onSubmit: (data: UserFormData) => void;
  submitButtonText: string;
}> = ({ initialData, onSubmit, submitButtonText }) => {
  const [formData, setFormData] = useState<UserFormData>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
          <input
            type="text"
            id="rut"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="secretaria">Secretaria</option>
            <option value="mecanico">Mecánico</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        {!initialData.id && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

// Componente principal de Gestión de Usuarios
export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      const response = await axios.get<User[]>('http://localhost:3000/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Error al cargar usuarios: ${err.response?.data.message || err.message}`);
      } else {
        setError('Error desconocido al cargar usuarios');
      }
      console.error('Error detallado:', err);
    }
  };

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      await axios.post('http://localhost:3000/api/usuarios', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Usuario creado con éxito');
      setIsNewUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Error al crear usuario: ${err.response?.data.message || err.message}`);
      } else {
        setError('Error desconocido al crear usuario');
      }
      console.error('Error detallado:', err);
    }
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      await axios.put(`http://localhost:3000/api/usuarios/${selectedUser.id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Usuario actualizado con éxito');
      setIsEditUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Error al actualizar usuario: ${err.response?.data.message || err.message}`);
      } else {
        setError('Error desconocido al actualizar usuario');
      }
      console.error('Error detallado:', err);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      await axios.delete(`http://localhost:3000/api/usuarios/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Usuario eliminado con éxito');
      setIsDeleteUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Error al eliminar usuario: ${err.response?.data.message || err.message}`);
      } else {
        setError('Error desconocido al eliminar usuario');
      }
      console.error('Error detallado:', err);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => setIsNewUserModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.apellido}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.rut}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.rol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditUserModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      <Pencil className="h-5 w-5" />
                      <span className="sr-only">Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteUserModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Eliminar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        title="Nuevo Usuario"
      >
        <UserForm
          initialData={{
            nombre: '',
            apellido: '',
            rut: '',
            email: '',
            telefono: '',
            rol: 'secretaria',
            estado: 'activo',
            password: '',
          }}
          onSubmit={handleCreateUser}
          submitButtonText="Crear Usuario"
        />
      </Modal>

      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        title="Editar Usuario"
      >
        {selectedUser && (
          <UserForm
            initialData={selectedUser}
            onSubmit={handleUpdateUser}
            submitButtonText="Actualizar Usuario"
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteUserModalOpen}
        onClose={() => setIsDeleteUserModalOpen(false)}
        title="Eliminar Usuario"
      >
        <div className="text-center">
          <p className="mb-4">¿Estás seguro de que deseas eliminar este usuario?</p>
          <p className="mb-4 font-semibold">{selectedUser?.nombre} {selectedUser?.apellido}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsDeleteUserModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
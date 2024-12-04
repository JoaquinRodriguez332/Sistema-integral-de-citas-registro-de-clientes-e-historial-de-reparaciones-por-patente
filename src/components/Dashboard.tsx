import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, Calendar, Car, FileText, Settings, User, Lock, Wrench } from 'lucide-react';
import { useAuth } from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/contexts/AuthContext.tsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: <Users className="h-8 w-8" />,
      label: 'Clientes',
      path: '/clientes',
      bgColor: 'bg-emerald-400',
      role: ['admin', 'secretaria']
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      label: 'Historial',
      path: '/historial',
      bgColor: 'bg-red-500',
      role: ['admin', 'secretaria', 'mecanico']
    },
    {
      icon: <User className="h-8 w-8" />,
      label: 'Usuarios',
      path: '/usuarios',
      bgColor: 'bg-gray-400',
      role: ['admin']
    },
    {
      icon: <Car className="h-8 w-8" />,
      label: 'Vehiculos',
      path: '/vehiculos',
      bgColor: 'bg-orange-400',
      role: ['admin', 'secretaria']
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      label: 'Reparaciones',
      path: '/reparaciones',
      bgColor: 'bg-blue-400',
      role: ['admin', 'mecanico']
    },
    {
      icon: <FileText className="h-8 w-8" />,
      label: 'Reportes',
      path: '/reportes',
      bgColor: 'bg-sky-400',
      role: ['admin']
    },
    {
      icon: <Settings className="h-8 w-8" />,
      label: 'Configuración',
      path: '/configuracion',
      bgColor: 'bg-gray-700',
      role: ['admin']
    }
  ];

  const isAccessible = (itemRoles: string[]) => {
    return user?.rol && itemRoles.includes(user.rol);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <span className="font-bold text-lg text-white">Rectificadora JA</span>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <span className="font-semibold text-white">
              {user?.nombre?.[0].toUpperCase() || 'A'}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-gray-50/80 rounded-xl p-8 shadow-lg">
          <div className="grid grid-cols-3 gap-x-12 gap-y-8">
            {menuItems.map((item, index) => {
              const accessible = isAccessible(item.role);
              return (
                <div key={index} className="flex flex-col items-center group">
                  {accessible ? (
                    <Link to={item.path} className="flex flex-col items-center">
                      <div 
                        className={`${item.bgColor} w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg 
                        group-hover:scale-110 transition-transform duration-200 cursor-pointer`}
                      >
                        {item.icon}
                      </div>
                    </Link>
                  ) : (
                    <div 
                      className={`${item.bgColor} w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg 
                      opacity-50 cursor-not-allowed relative`}
                    >
                      {item.icon}
                      <Lock className="h-6 w-6 absolute bottom-0 right-0 bg-gray-800 rounded-full p-1" />
                    </div>
                  )}
                  <span className={`mt-3 text-sm font-medium ${accessible ? 'text-gray-700' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
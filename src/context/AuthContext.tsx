import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsignacionService, { AsignacionEquipoDTO } from '../services/AsignacionService';
import SolicitudService from '../services/SolicitudService';

interface User {
  id: number;
  name: string;
  email?: string;
  role?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  equiposAsignados: AsignacionEquipoDTO[];
  loading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  cargarEquiposAsignados: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [equiposAsignados, setEquiposAsignados] = useState<AsignacionEquipoDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const login = (userData: User, token?: string) => {
    console.log('🔍 AuthContext - Login llamado con:', { userData, token });
    setUser(userData);
    if (token) {
      AsignacionService.setToken(token);
      SolicitudService.setToken(token);
      console.log('🔍 AuthContext - Token configurado, cargando equipos para usuario ID:', userData.id);
      cargarEquiposAsignados(userData.id);
    }
  };

  const logout = () => {
    setUser(null);
    setEquiposAsignados([]);
    AsignacionService.removeToken();
    SolicitudService.removeToken();
  };

  const cargarEquiposAsignados = async (userId?: number) => {
    const targetUserId = userId || user?.id;
    console.log('🔍 AuthContext - cargarEquiposAsignados llamado con userId:', targetUserId);
    if (!targetUserId) {
      console.log('❌ AuthContext - No se encontró ID de usuario');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 AuthContext - Llamando AsignacionService.obtenerAsignacionesPorPersonal...');
      const response = await AsignacionService.obtenerAsignacionesPorPersonal(targetUserId);
      console.log('🔍 AuthContext - Respuesta de asignaciones:', response);
      if (response.success && response.data) {
        setEquiposAsignados(response.data);
        console.log('✅ AuthContext - Equipos asignados cargados:', response.data);
      } else {
        console.error('❌ AuthContext - Error al cargar equipos asignados:', response.error);
        setEquiposAsignados([]);
      }
    } catch (error) {
      console.error('❌ AuthContext - Exception al cargar equipos asignados:', error);
      setEquiposAsignados([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      equiposAsignados, 
      loading, 
      login, 
      logout, 
      cargarEquiposAsignados 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
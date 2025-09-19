import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://gateway-api-dfbk.onrender.com/ApiSeguridad/api';
const API_ADMIN_URL = 'https://gateway-api-dfbk.onrender.com/ApiAdministracion/api'

interface LoginCredentials {
  user: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
  role?: string;
  department?: string;
}

interface LoginResponse {
  token?: string;
  user: User;
  message?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class AuthService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos timeout
    });
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.apiClient.post('/personal/login', {
        user: credentials.user,
        password: credentials.password
      });
      
      // Verificar si la respuesta es exitosa
      if (response.status === 200 || response.status === 201) {
        const userData = response.data;
        console.log('🔍 AuthService - Respuesta del login:', userData);
        
        // El token se devuelve directamente como string, no como objeto
        const token = typeof userData === 'string' ? userData : userData.token;
        
        // Decodificar el token JWT para ver su contenido (solo para debug)
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('🔍 AuthService - Contenido del token JWT:', payload);
              console.log('🔍 AuthService - Rol del usuario:', payload.role);
              console.log('🔍 AuthService - Nombre del usuario:', payload.unique_name);
              console.log('🔍 AuthService - PersonalId del usuario:', payload.nameid);
            }
          } catch (error) {
            console.error('❌ Error decodificando token:', error);
          }
        }
        
        // Si hay token, guardarlo
        if (token) {
          this.setToken(token);
        }
        
        // Obtener información del usuario directamente del token JWT
        let userResult;
        try {
          console.log('🔍 AuthService - Extrayendo información del token JWT');
          const personalInfo = this.extractUserInfoFromToken(token);
          
          if (personalInfo) {
            userResult = {
              id: personalInfo.personalId,
              name: personalInfo.username,
              role: personalInfo.role,
              email: personalInfo.email || `${personalInfo.username}@empresa.com`,
              department: this.getDepartmentByRole(personalInfo.role)
            };
            console.log('✅ AuthService - Información extraída del token:', userResult);
          } else {
            console.error('❌ AuthService - No se pudo extraer información del token');
            return {
              success: false,
              error: 'Token JWT inválido o malformado'
            };
          }
        } catch (error) {
          console.error('❌ AuthService - Exception extrayendo información del token:', error);
          return {
            success: false,
            error: 'Error crítico: No se pudo procesar el token'
          };
        }
        
        console.log('🔍 AuthService - Usuario procesado:', userResult);
        console.log('🔍 AuthService - Token obtenido:', token ? 'Sí' : 'No');
        
        return { 
          success: true, 
          data: {
            token: token,
            user: userResult
          }
        };
      } else {
        return {
          success: false,
          error: 'Credenciales inválidas'
        };
      }
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.response) {
        // Error de respuesta del servidor
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (status) {
          case 401:
            return {
              success: false,
              error: 'Usuario o contraseña incorrectos'
            };
          case 404:
            return {
              success: false,
              error: 'Usuario no encontrado'
            };
          case 403:
            return {
              success: false,
              error: 'Acceso no autorizado'
            };
          case 500:
            return {
              success: false,
              error: 'Error interno del servidor. Intenta más tarde'
            };
          case 502:
          case 503:
          case 504:
            return {
              success: false,
              error: 'Servicio temporalmente no disponible'
            };
          default:
            return {
              success: false,
              error: serverMessage || `Error del servidor (${status})`
            };
        }
      } else if (error.request) {
        // Error de red o timeout
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            error: 'Tiempo de espera agotado. Verifica tu conexión'
          };
        } else {
          return {
            success: false,
            error: 'Error de conexión. Verifica tu internet'
          };
        }
      } else {
        // Otro error
        return {
          success: false,
          error: 'Error inesperado. Intenta nuevamente'
        };
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      this.removeToken();
    }
  }

  async obtenerPersonalPorUsername(username: string, token: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 AuthService - Obteniendo información de personal para username:', username);
      
      // Obtener lista completa de personal y buscar por username
      const response = await this.apiClient.get('/personal', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200 && response.data && Array.isArray(response.data)) {
        console.log('✅ AuthService - Lista de personal obtenida, buscando usuario:', username);
        
        // Buscar el usuario por username en la lista
        const personalEncontrado = response.data.find((person: any) => person.user === username);
        
        if (personalEncontrado) {
          console.log('✅ AuthService - Usuario encontrado:', personalEncontrado);
          return {
            success: true,
            data: {
              id: personalEncontrado.id,
              nombre: personalEncontrado.nombre,
              apellido: personalEncontrado.apellido,
              email: personalEncontrado.correo,
              telefono: personalEncontrado.telefono,
              user: personalEncontrado.user,
              rolId: personalEncontrado.rolId,
              status: personalEncontrado.status
            }
          };
        } else {
          console.log('❌ AuthService - Usuario no encontrado en la lista');
          return {
            success: false,
            error: 'Usuario no encontrado en la base de datos'
          };
        }
      } else {
        return {
          success: false,
          error: 'No se pudo obtener la lista de personal'
        };
      }
    } catch (error: any) {
      console.error('❌ AuthService - Error obteniendo información del personal:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Endpoint no encontrado'
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener información del personal'
      };
    }
  }

  setToken(token: string): void {
    this.apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  removeToken(): void {
    delete this.apiClient.defaults.headers.common.Authorization;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.apiClient.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuario'
      };
    }
  }

  private getRoleName(rolId: number): string {
    switch (rolId) {
      case 1: return 'Administrador';
      case 2: return 'Técnico';  
      case 5: return 'Empleado';
      default: return 'Usuario';
    }
  }

  private extractUserInfoFromToken(token: string): { personalId: number, username: string, role: string, email?: string } | null {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Extraer información del token JWT
        const personalId = parseInt(payload.nameid);
        const username = payload.unique_name;
        const role = payload.role;
        
        if (personalId && username && role) {
          return {
            personalId,
            username,
            role,
            email: payload.email // Si está disponible en el token
          };
        }
      }
    } catch (error) {
      console.error('❌ Error extrayendo información del token:', error);
    }
    return null;
  }

  private getDepartmentByRole(role: string): string {
    switch (role.toLowerCase()) {
      case 'administrador': return 'Administración';
      case 'tecnico': return 'Tecnología';
      case 'empleado': return 'Operaciones';
      default: return 'General';
    }
  }

  private getUserMappingByUsername(username: string): User | null {
    // Mapeo manual basado en los datos conocidos de la API
    const knownUsers: { [key: string]: User } = {
      'admin': {
        id: 1,
        name: 'Admin Guillermo',
        role: 'Administrador',
        email: 'admin@empresa.com',
        department: 'Administración'
      },
      'joeladmin': {
        id: 6,
        name: 'Joel Gonza',
        role: 'Técnico',
        email: 'jefflou@gmail.com',
        department: 'Tecnología'
      },
      'joel23': {
        id: 10,
        name: 'Juan Carlos',
        role: 'Empleado',
        email: 'jeff@gmail.com',
        department: 'Operaciones'
      }
    };

    const user = knownUsers[username];
    if (user) {
      console.log(`✅ AuthService - Usuario ${username} encontrado en mapeo manual:`, user);
      return user;
    }
    
    console.log(`❌ AuthService - Usuario ${username} no encontrado en mapeo manual`);
    return null;
  }
}

export default new AuthService();
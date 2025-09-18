import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://gateway-api-dfbk.onrender.com/ApiSeguridad/api';

interface LoginCredentials {
  user: string;
  password: string;
}

interface User {
  id?: number;
  name: string;
  email?: string;
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
        
        // Si hay token, guardarlo
        if (userData.token) {
          this.setToken(userData.token);
        }
        
        return { 
          success: true, 
          data: {
            token: userData.token,
            user: {
              name: credentials.user,
              ...userData.user
            }
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
        return {
          success: false,
          error: error.response.data?.message || 'Error del servidor'
        };
      } else if (error.request) {
        // Error de red
        return {
          success: false,
          error: 'Error de conexión. Verifica tu internet.'
        };
      } else {
        // Otro error
        return {
          success: false,
          error: 'Error inesperado'
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
}

export default new AuthService();
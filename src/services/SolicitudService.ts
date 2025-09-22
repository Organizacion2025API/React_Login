import axios, { AxiosInstance } from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = 'https://gateway-api-dfbk.onrender.com/ApiAdministracion';

interface SolicitudRequest {
  descripcion: string;
  asignacionEquipoId: number;
}

interface SolicitudResponse {
  id: number;
  descripcion: string;
  asignacionEquipoId: number;
  fechaCreacion: string;
  estado: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SolicitudService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos timeout
    });

    // Interceptor para agregar el token JWT a todas las peticiones
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = AuthService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async crearSolicitud(solicitud: SolicitudRequest): Promise<ApiResponse<SolicitudResponse>> {
    try {
      console.log('🔍 SolicitudService - Enviando solicitud:', solicitud);
      
      const response = await this.apiClient.post('/api/solicitudes', solicitud);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ SolicitudService - Solicitud creada exitosamente:', response.data);
        return {
          success: true,
          data: response.data
        };
      } else {
        console.error('❌ SolicitudService - Error en respuesta:', response.status);
        return {
          success: false,
          error: `Error del servidor (${response.status})`
        };
      }
    } catch (error: any) {
      console.error('❌ SolicitudService - Error al crear solicitud:', error);
      
      if (error.response) {
        // Error de respuesta del servidor
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (status) {
          case 400:
            return {
              success: false,
              error: 'Datos de solicitud inválidos. Verifica la información'
            };
          case 401:
            return {
              success: false,
              error: 'No autorizado. Por favor inicia sesión nuevamente'
            };
          case 403:
            return {
              success: false,
              error: 'No tienes permisos para crear solicitudes'
            };
          case 404:
            return {
              success: false,
              error: 'Equipo no encontrado o no asignado'
            };
          case 500:
            return {
              success: false,
              error: 'Error interno del servidor. Intenta más tarde'
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

  async obtenerSolicitudes(): Promise<ApiResponse<SolicitudResponse[]>> {
    try {
      console.log('🔍 SolicitudService - Obteniendo solicitudes del usuario');
      
      const response = await this.apiClient.get('/api/solicitudes');
      
      if (response.status === 200) {
        console.log('✅ SolicitudService - Solicitudes obtenidas:', response.data);
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: `Error del servidor (${response.status})`
        };
      }
    } catch (error: any) {
      console.error('❌ SolicitudService - Error al obtener solicitudes:', error);
      
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            return {
              success: false,
              error: 'No autorizado. Inicia sesión nuevamente'
            };
          case 404:
            return {
              success: false,
              error: 'No se encontraron solicitudes'
            };
          default:
            return {
              success: false,
              error: 'Error al cargar solicitudes'
            };
        }
      } else {
        return {
          success: false,
          error: 'Error de conexión'
        };
      }
    }
  }
}

export default new SolicitudService();
export type { SolicitudRequest, SolicitudResponse };
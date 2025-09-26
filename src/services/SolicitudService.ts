import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://gateway-api-dfbk.onrender.com/ApiAdministracion/api';

export interface SolicitudRequest {
  descripcion: string;
  asignacionEquipoId: number;
}

export interface SolicitudResponse {
  id?: number;
  descripcion: string;
  estado?: number;
  fechaRegistro?: string;
  fechaCreacion?: string;
  asignacionEquipoId: number;
  personalId?: string;
}

export interface PaginacionParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
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
      timeout: 10000,
    });
  }

  setToken(token: string): void {
    if (token) {
      this.apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.apiClient.defaults.headers.common.Authorization;
    }
  }

  removeToken(): void {
    delete this.apiClient.defaults.headers.common.Authorization;
  }

  async crearSolicitud(solicitudData: SolicitudRequest): Promise<ApiResponse<SolicitudResponse>> {
    try {
      console.log('🔧 SolicitudService - Creando solicitud:', solicitudData);
      
      const response = await this.apiClient.post('/solicitudes', solicitudData);
      
      console.log('✅ SolicitudService - Respuesta exitosa:', response.data);
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ SolicitudService - Error creando solicitud:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.'
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response.data?.message || 'Datos inválidos para la solicitud'
        };
      } else if (error.response?.status === 500) {
        return {
          success: false,
          error: 'Error interno del servidor'
        };
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet.'
        };
      } else {
        return {
          success: false,
          error: error.response?.data?.message || 'Error inesperado al crear la solicitud'
        };
      }
    }
  }

  async obtenerSolicitudesPropias(params?: PaginacionParams): Promise<ApiResponse<PaginatedResponse<SolicitudResponse>>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.set('page', params.page.toString());
      if (params?.size !== undefined) queryParams.set('size', params.size.toString());
      if (params?.sortBy) queryParams.set('sort', `${params.sortBy},${params.sortDir || 'desc'}`);
      
      const url = `/solicitudes/mias${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('📋 SolicitudService - Obteniendo solicitudes propias:', url);
      
      const response = await this.apiClient.get(url);
      
      console.log('✅ SolicitudService - Solicitudes obtenidas:', response.data);
      
      // Verificar si la respuesta es paginada o un simple array
      if (Array.isArray(response.data)) {
        // Respuesta simple (array), crear estructura paginada
        const data: SolicitudResponse[] = response.data;
        const page = params?.page || 0;
        const size = params?.size || 10;
        const start = page * size;
        const end = start + size;
        const paginatedContent = data.slice(start, end);
        
        return {
          success: true,
          data: {
            content: paginatedContent,
            totalElements: data.length,
            totalPages: Math.ceil(data.length / size),
            size: size,
            number: page,
            first: page === 0,
            last: end >= data.length,
            empty: data.length === 0
          }
        };
      } else {
        // Respuesta ya paginada
        return {
          success: true,
          data: response.data || {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: params?.size || 10,
            number: params?.page || 0,
            first: true,
            last: true,
            empty: true
          }
        };
      }
      
    } catch (error: any) {
      console.error('❌ SolicitudService - Error obteniendo solicitudes:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: 'No se encontraron solicitudes'
        };
      } else if (error.response?.status === 500) {
        return {
          success: false,
          error: 'Error interno del servidor'
        };
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet.'
        };
      } else {
        return {
          success: false,
          error: error.response?.data?.message || 'Error inesperado al obtener las solicitudes'
        };
      }
    }
  }

  // Funciones helper para mapear estados
  static getEstadoNombre(estado: number): string {
    switch (estado) {
      case 1: return 'Pendiente';
      case 2: return 'En Proceso';
      case 3: return 'Resuelto';
      case 4: return 'Cerrado';
      default: return 'Desconocido';
    }
  }

  static getEstadoColor(estado: number): string {
    switch (estado) {
      case 1: return '#ff9800'; // Naranja para pendiente
      case 2: return '#2196f3'; // Azul para en proceso
      case 3: return '#4caf50'; // Verde para resuelto
      case 4: return '#9e9e9e'; // Gris para cerrado
      default: return '#757575'; // Gris por defecto
    }
  }
}

// Exportar tanto la clase como la instancia
export { SolicitudService };
export default new SolicitudService();
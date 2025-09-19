import axios, { AxiosInstance } from 'axios';

const API_ADMIN_URL = 'https://gateway-api-dfbk.onrender.com/ApiAdministracion/api';

interface AsignacionEquipoDTO {
  id: number;
  personalId: number;
  equipoId: number;
  equipoNombre: string;
  equipoDescripcion: string;
  equipoModelo: string;
  equipoNserie: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class AsignacionService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_ADMIN_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos timeout
    });
  }

  setToken(token: string): void {
    console.log('🔍 AsignacionService - Configurando token:', token ? 'Token presente' : 'No token');
    this.apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log('🔍 AsignacionService - Headers después de configurar token:', this.apiClient.defaults.headers.common);
  }

  removeToken(): void {
    console.log('🔍 AsignacionService - Removiendo token');
    delete this.apiClient.defaults.headers.common.Authorization;
  }

  async obtenerAsignaciones(): Promise<ApiResponse<AsignacionEquipoDTO[]>> {
    try {
      console.log('🔍 AsignacionService - Haciendo petición a:', `${API_ADMIN_URL}/asignaciones`);
      const response = await this.apiClient.get('/asignaciones');
      console.log('🔍 AsignacionService - Respuesta recibida:', response);
      
      if (response.status === 200) {
        console.log('✅ AsignacionService - Datos obtenidos:', response.data);
        return {
          success: true,
          data: response.data
        };
      } else {
        console.log('❌ AsignacionService - Status no 200:', response.status);
        return {
          success: false,
          error: 'Error al obtener asignaciones'
        };
      }
    } catch (error: any) {
      console.error('❌ AsignacionService - Error en obtenerAsignaciones:', error);
      
      if (error.response) {
        console.error('❌ Error de respuesta del servidor:', error.response.data);
        return {
          success: false,
          error: error.response.data?.message || 'Error del servidor'
        };
      } else if (error.request) {
        console.error('❌ Error de red:', error.request);
        return {
          success: false,
          error: 'Error de conexión. Verifica tu internet.'
        };
      } else {
        console.error('❌ Error inesperado:', error.message);
        return {
          success: false,
          error: 'Error inesperado'
        };
      }
    }
  }

  async obtenerAsignacionesPorPersonal(personalId: number): Promise<ApiResponse<AsignacionEquipoDTO[]>> {
    try {
      console.log('🔍 AsignacionService - obtenerAsignacionesPorPersonal para personalId:', personalId);
      
      // Intentar primero el endpoint específico por personalId (más eficiente)
      try {
        console.log('🔍 AsignacionService - Intentando endpoint específico:', `${API_ADMIN_URL}/asignaciones/personal/${personalId}`);
        const response = await this.apiClient.get(`/asignaciones/personal/${personalId}`);
        console.log('✅ AsignacionService - Respuesta del endpoint específico:', response.data);
        
        return {
          success: true,
          data: response.data
        };
      } catch (specificError: any) {
        console.log('⚠️ AsignacionService - Endpoint específico no disponible, usando método general con filtro');
        
        // Si el endpoint específico no existe, usar el método general con filtro
        const response = await this.obtenerAsignaciones();
        
        if (response.success && response.data) {
          console.log('🔍 AsignacionService - Todas las asignaciones recibidas:', response.data);
          console.log('🔍 AsignacionService - Filtrando por personalId:', personalId);
          
          // Filtrar las asignaciones por el ID del personal
          const asignacionesFiltradas = response.data.filter(
            asignacion => {
              console.log(`🔍 Comparando: asignacion.personalId (${asignacion.personalId}) === personalId (${personalId})`);
              return asignacion.personalId === personalId;
            }
          );
          
          console.log('🔍 AsignacionService - Asignaciones filtradas para personalId', personalId, ':', asignacionesFiltradas);
          console.log(`✅ AsignacionService - Se encontraron ${asignacionesFiltradas.length} equipos para el usuario`);
          
          return {
            success: true,
            data: asignacionesFiltradas
          };
        } else {
          console.log('❌ AsignacionService - No se pudieron obtener asignaciones:', response.error);
          return response;
        }
      }
    } catch (error) {
      console.error('❌ AsignacionService - Error en obtenerAsignacionesPorPersonal:', error);
      return {
        success: false,
        error: 'Error al obtener asignaciones del personal'
      };
    }
  }

  async asignarEquipo(personalId: number, equipoId: number): Promise<ApiResponse<string>> {
    try {
      const response = await this.apiClient.post('/asignaciones', {
        personalId,
        equipoId
      });
      
      if (response.status === 201) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: 'Error al asignar equipo'
        };
      }
    } catch (error: any) {
      console.error('Error en asignarEquipo:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data || 'Error del servidor'
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu internet.'
        };
      } else {
        return {
          success: false,
          error: 'Error inesperado'
        };
      }
    }
  }
}

export default new AsignacionService();
export type { AsignacionEquipoDTO };
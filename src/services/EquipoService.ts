import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface Categoria {
  id: number;
  nombre: string;
}

interface Ubicacion {
  id: number;
  nombre: string;
}

interface Equipo {
  id: number;
  nombre: string;
  descripcion: string;
  categoria?: Categoria;
  ubicacion?: Ubicacion;
}

interface EquipoCreateData {
  nombre: string;
  descripcion: string;
  categoriaId?: number | null;
  ubicacionId?: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class EquipoService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token: string): void {
    if (token) {
      this.apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.apiClient.defaults.headers.common.Authorization;
    }
  }

  async getAllEquipos(): Promise<ApiResponse<Equipo[]>> {
    try {
      const response = await this.apiClient.get('/equipos');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener equipos'
      };
    }
  }

  async getEquipoById(id: number): Promise<ApiResponse<Equipo>> {
    try {
      const response = await this.apiClient.get(`/equipos/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener equipo'
      };
    }
  }

  async createEquipo(equipoData: EquipoCreateData): Promise<ApiResponse<Equipo>> {
    try {
      const response = await this.apiClient.post('/equipos', equipoData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear equipo'
      };
    }
  }

  async updateEquipo(id: number, equipoData: EquipoCreateData): Promise<ApiResponse<Equipo>> {
    try {
      const response = await this.apiClient.put(`/equipos/${id}`, equipoData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar equipo'
      };
    }
  }

  async deleteEquipo(id: number): Promise<ApiResponse<void>> {
    try {
      await this.apiClient.delete(`/equipos/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar equipo'
      };
    }
  }
}

export default new EquipoService();
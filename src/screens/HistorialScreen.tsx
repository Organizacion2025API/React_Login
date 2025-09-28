import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import SolicitudService, {
  SolicitudService as SolicitudServiceClass,
  SolicitudResponse,
  PaginatedResponse,
  PaginacionParams
} from '../services/SolicitudService';

interface HistorialScreenProps {
  onBack: () => void;
}

const HistorialScreen: React.FC<HistorialScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    cargarSolicitudesPropias(0, false);
  }, []);

  const cargarSolicitudesPropias = async (page: number = 0, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setSolicitudes([]);
    }
    setError('');

    try {
      const params: PaginacionParams = {
        page,
        size: pageSize,
        sortBy: 'fechaRegistro',
        sortDir: 'desc'
      };

      const response = await SolicitudService.obtenerSolicitudesPropias(params);

      if (response.success && response.data) {
        const paginatedData = response.data;

        if (append) {
          setSolicitudes(prevSolicitudes => [...prevSolicitudes, ...paginatedData.content]);
        } else {
          setSolicitudes(paginatedData.content);
        }

        setCurrentPage(paginatedData.number);
        setTotalPages(paginatedData.totalPages);
        setTotalElements(paginatedData.totalElements);
        setHasMore(!paginatedData.last);

        console.log('✅ HistorialScreen - Solicitudes cargadas:', {
          page: paginatedData.number,
          totalPages: paginatedData.totalPages,
          totalElements: paginatedData.totalElements,
          content: paginatedData.content.length
        });
      } else {
        setError(response.error || 'Error al cargar el historial de solicitudes');
        if (!append) setSolicitudes([]);
      }
    } catch (error) {
      console.error('❌ HistorialScreen - Error cargando solicitudes:', error);
      setError('Error inesperado al cargar las solicitudes');
      if (!append) setSolicitudes([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    cargarSolicitudesPropias(0, false);
  };

  const cargarMasSolicitudes = () => {
    if (hasMore && !loadingMore) {
      cargarSolicitudesPropias(currentPage + 1, true);
    }
  };

  const irAPagina = (page: number) => {
    if (page >= 0 && page < totalPages && page !== currentPage) {
      cargarSolicitudesPropias(page, false);
    }
  };

  const formatearFecha = (fechaString: string): string => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const renderSolicitud = (solicitud: SolicitudResponse) => {
    const estadoColor = SolicitudServiceClass.getEstadoColor(solicitud.estado || 1);
    const estadoNombre = SolicitudServiceClass.getEstadoNombre(solicitud.estado || 1);

    return (
      <View key={solicitud.id} style={styles.solicitudCard}>
        <View style={styles.solicitudHeader}>
          <Text style={styles.solicitudId}>Solicitud #{solicitud.id}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
            <Text style={styles.estadoText}>{estadoNombre}</Text>
          </View>
        </View>

        <Text style={styles.solicitudDescripcion} numberOfLines={3}>
          {solicitud.descripcion}
        </Text>

        <View style={styles.solicitudFooter}>
          <Text style={styles.solicitudInfo}>
            📅 {formatearFecha(solicitud.fechaRegistro || solicitud.fechaCreacion || '')}
          </Text>
          <Text style={styles.solicitudInfo}>
            🔧 Equipo ID: {solicitud.asignacionEquipoId}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mi Historial</Text>
          {totalPages > 1 && (
            <Text style={styles.titleSubtext}>Página {currentPage + 1} de {totalPages}</Text>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Información de paginación */}
        {totalElements > 0 && (
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              📊 {totalElements} solicitude{totalElements !== 1 ? 's' : ''} encontrada{totalElements !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.paginationText}>
              📄 Página {currentPage + 1} de {totalPages}
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading && solicitudes.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8db986" />
              <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
          ) : solicitudes.length > 0 ? (
            <>
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>📊 Resumen de esta página</Text>
                <Text style={styles.statsText}>
                  Mostrando: {solicitudes.length} de {totalElements} solicitudes
                </Text>
                <Text style={styles.statsText}>
                  Pendientes: {solicitudes.filter(s => s.estado === 1).length}
                </Text>
                <Text style={styles.statsText}>
                  En proceso: {solicitudes.filter(s => s.estado === 2).length}
                </Text>
                <Text style={styles.statsText}>
                  Resueltas: {solicitudes.filter(s => s.estado === 3).length}
                </Text>
                {totalPages > 1 && (
                  <Text style={styles.statsText}>
                    📄 Página {currentPage + 1} de {totalPages}
                  </Text>
                )}
              </View>

              {solicitudes.map(renderSolicitud)}

              {/* Botón para cargar más */}
              {hasMore && (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={cargarMasSolicitudes}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#007bff" />
                        <Text style={styles.loadMoreText}>Cargando más...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loadMoreText}>📄 Cargar más solicitudes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>📝 Sin Solicitudes</Text>
              <Text style={styles.emptyText}>
                Aún no has creado ninguna solicitud de soporte.
              </Text>
              <Text style={styles.emptySubtext}>
                Ve a "Mis Equipos" y toca cualquier equipo para crear tu primera solicitud.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
              onPress={() => irAPagina(0)}
              disabled={currentPage === 0}
            >
              <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>
                ⏮️ Primera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
              onPress={() => irAPagina(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>
                ⬅️ Anterior
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                {currentPage + 1} / {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.pageButton, currentPage >= totalPages - 1 && styles.pageButtonDisabled]}
              onPress={() => irAPagina(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <Text style={[styles.pageButtonText, currentPage >= totalPages - 1 && styles.pageButtonTextDisabled]}>
                Siguiente ➡️
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pageButton, currentPage >= totalPages - 1 && styles.pageButtonDisabled]}
              onPress={() => irAPagina(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <Text style={[styles.pageButtonText, currentPage >= totalPages - 1 && styles.pageButtonTextDisabled]}>
                Última ⏭️
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8db986',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSubtext: {
    fontSize: 12,
    color: '#e3f2fd',
    marginTop: 2,
  },
  placeholder: {
    width: 80,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userInfoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#8db986',
    marginTop: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8db986',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8db986',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#8db986',
    marginBottom: 2,
  },
  solicitudCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  solicitudId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  solicitudDescripcion: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  solicitudFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  solicitudInfo: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Estilos de paginación
  paginationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#8db986',
  },
  paginationText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 200,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#8db986',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 5,
  },
  pageButton: {
    backgroundColor: '#8db986',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  pageButtonTextDisabled: {
    color: '#6c757d',
  },
  pageIndicator: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 60,
    alignItems: 'center',
  },
  pageIndicatorText: {
    color: '#495057',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HistorialScreen;

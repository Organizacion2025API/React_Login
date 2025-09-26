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
import SolicitudService, { SolicitudService as SolicitudServiceClass, SolicitudResponse } from '../services/SolicitudService';

interface HistorialScreenProps {
  onBack: () => void;
}

const HistorialScreen: React.FC<HistorialScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    cargarSolicitudesPropias();
  }, []);

  const cargarSolicitudesPropias = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await SolicitudService.obtenerSolicitudesPropias();
      
      if (response.success && response.data) {
        setSolicitudes(response.data);
        console.log('✅ HistorialScreen - Solicitudes cargadas:', response.data);
      } else {
        setError(response.error || 'Error al cargar el historial de solicitudes');
        setSolicitudes([]);
      }
    } catch (error) {
      console.error('❌ HistorialScreen - Error cargando solicitudes:', error);
      setError('Error inesperado al cargar las solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    cargarSolicitudesPropias();
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
        <Text style={styles.title}>Mi Historial</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.userInfoTitle}>Historial de solicitudes de:</Text>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userRole}>{user?.role || 'Empleado'}</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
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
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
          ) : solicitudes.length > 0 ? (
            <>
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>📊 Resumen</Text>
                <Text style={styles.statsText}>
                  Total de solicitudes: {solicitudes.length}
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
              </View>
              
              {solicitudes.map(renderSolicitud)}
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
    backgroundColor: '#007bff',
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
    flex: 1,
    textAlign: 'center',
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
    color: '#007bff',
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
    borderLeftColor: '#2196f3',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#1565c0',
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
});

export default HistorialScreen;

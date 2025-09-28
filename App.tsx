import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import Layout from './src/components/Layout';
import SidebarLayout from './src/components/SidebarLayout';
import HistorialScreen from './src/screens/HistorialScreen';
import SolicitudScreen from './src/screens/SolicitudScreen';

// Tipo para las vistas de navegación
type ViewType = 'equipos' | 'historial' | 'profile' | 'solicitudes';

// Componente para Historial de Solicitudes
const HistorialSolicitudesScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <Layout 
      title="Historial de Solicitudes" 
      showBackButton={true} 
      onBackPress={onBack}
    >
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>📋 Historial de Solicitudes</Text>
        <Text style={styles.emptyText}>
          Aquí podrás ver el historial de todas las solicitudes realizadas.
        </Text>
        <Text style={styles.emptySubtext}>
          Esta funcionalidad estará disponible próximamente.
        </Text>
      </View>
    </Layout>
  );
};

// Componente principal de la aplicación
const MainApp = () => {
  const { user, equiposAsignados, loading, logout, cargarEquiposAsignados } = useAuth();
  // Estado para la vista actual (equipos, historial, perfil)
  const [currentView, setCurrentView] = useState<ViewType>('equipos');
  // Estado para el equipo seleccionado para crear solicitud
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<any>(null);

  useEffect(() => {
    if (user) {
      cargarEquiposAsignados();
    }
  }, [user]);

  const onRefresh = () => {
    cargarEquiposAsignados();
  };

  const renderEquipo = (equipo: any, index: number) => (
    <TouchableOpacity 
      key={equipo.id} 
      style={styles.equipoCard}
      onPress={() => {
        // Navegar a solicitud con este equipo pre-seleccionado
        setEquipoSeleccionado(equipo);
        setCurrentView('solicitudes');
      }}
    >
      <View style={styles.equipoHeader}>
        <Text style={styles.equipoNombre}>{equipo.equipoNombre}</Text>
        <Text style={styles.solicitudButton}>📝 Crear Solicitud</Text>
      </View>
      {equipo.equipoDescripcion && (
        <Text style={styles.equipoDescripcion}>{equipo.equipoDescripcion}</Text>
      )}
      <View style={styles.equipoDetailsRow}>
        <Text style={styles.equipoInfo}>Modelo: {equipo.equipoModelo || 'N/A'}</Text>
        <Text style={styles.equipoInfo}>Serie: {equipo.equipoNserie || 'N/A'}</Text>
      </View>
      <Text style={styles.equipoId}>ID del Equipo: {equipo.equipoId}</Text>
    </TouchableOpacity>
  );

  // Si no hay usuario, mostrar login
  if (!user) {
    return <LoginScreen />;
  }

  // Función para renderizar el contenido según la vista
  const renderContent = () => {
    switch (currentView) {
      case 'historial':
        return (
          <HistorialScreen onBack={() => setCurrentView('equipos')} />
        );
      case 'solicitudes':
        return (
          <SolicitudScreen 
            onBack={() => {
              setCurrentView('equipos');
              setEquipoSeleccionado(null); // Limpiar selección al volver
            }}
            equipoPreseleccionado={equipoSeleccionado}
          />
        );
      case 'historial':
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>📋 Historial de Solicitudes</Text>
            <Text style={styles.emptyText}>
              Aquí podrás ver el historial de todas las solicitudes realizadas.
            </Text>
            <Text style={styles.emptySubtext}>
              Esta funcionalidad estará disponible próximamente.
            </Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>👤 Mi Perfil</Text>
            <Text style={styles.emptyText}>
              Información del usuario y configuraciones.
            </Text>
            <Text style={styles.emptySubtext}>
              Esta funcionalidad estará disponible próximamente.
            </Text>
          </View>
        );
      case 'equipos':
      default:
        return (
          /* Lista de equipos */
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
          >
            {equiposAsignados.length > 0 ? (
              equiposAsignados.map(renderEquipo)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>📦 No hay equipos asignados</Text>
                <Text style={styles.emptyText}>
                  Actualmente no tienes equipos asignados o no se pudieron cargar.
                </Text>
                <Text style={styles.emptySubtext}>
                  Desliza hacia abajo para actualizar
                </Text>
              </View>
            )}
          </ScrollView>
        );
    }
  };

  // Vista principal con sidebar layout
  return (
    <SidebarLayout 
      title="Mis Equipos Asignados"
      currentView={currentView}
      onNavigate={(view) => setCurrentView(view as ViewType)}
    >
      {renderContent()}
    </SidebarLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  navigationSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: '#007bff',
  },
  navText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeNavText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  equipoCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 14,
    borderRadius: 8,
    elevation: 2,
    // Agregamos efecto visual para indicar que es clickeable
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  equipoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  solicitudButton: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  equipoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  equipoDescripcion: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  equipoDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  equipoInfo: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  equipoId: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  equipoFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  equipoFooterText: {
    fontSize: 12,
    color: '#007bff',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
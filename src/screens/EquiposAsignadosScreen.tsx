import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const EquiposAsignadosScreen: React.FC = () => {
  const { user, equiposAsignados, loading, cargarEquiposAsignados } = useAuth();

  useEffect(() => {
    console.log('🔍 EquiposAsignadosScreen - useEffect llamado, usuario:', user);
    if (user) {
      console.log('🔍 EquiposAsignadosScreen - Llamando cargarEquiposAsignados...');
      cargarEquiposAsignados();
    }
  }, [user]);

  useEffect(() => {
    console.log('🔍 EquiposAsignadosScreen - equiposAsignados actualizado:', equiposAsignados);
  }, [equiposAsignados]);

  const onRefresh = () => {
    cargarEquiposAsignados();
  };

  const renderEquipo = (equipo: any, index: number) => (
    <View key={equipo.id} style={styles.equipoCard}>
      <Text style={styles.equipoNombre}>{equipo.equipoNombre}</Text>
      <Text style={styles.equipoInfo}>ID del Equipo: {equipo.equipoId}</Text>
      <Text style={styles.equipoInfo}>ID de Asignación: {equipo.id}</Text>
    </View>
  );

  if (loading && equiposAsignados.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando equipos asignados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Equipos Asignados</Text>
      
      {user && (
        <View style={styles.debugContainer}>
          <Text style={styles.userInfo}>Usuario: {user.name}</Text>
          <Text style={styles.debugText}>ID Usuario: {user.id}</Text>
          <Text style={styles.debugText}>Loading: {loading ? 'Sí' : 'No'}</Text>
          <Text style={styles.debugText}>Equipos count: {equiposAsignados.length}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {equiposAsignados.length > 0 ? (
          equiposAsignados.map(renderEquipo)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando equipos...' : 'No tienes equipos asignados'}
            </Text>
            <Text style={styles.emptySubtext}>
              {loading ? 'Por favor espera...' : 'Contacta a tu administrador para solicitar asignaciones'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  debugText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 3,
  },
  scrollView: {
    flex: 1,
  },
  equipoCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  equipoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  equipoInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default EquiposAsignadosScreen;
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import Layout from '../components/Layout';
import TabNavigation from '../components/TabNavigation';

interface HistorialItem {
  id: string;
  tipo: 'solicitud' | 'reparacion' | 'mantenimiento';
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
}

const HistorialScreen = ({ onBack }: { onBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState('todos');
  const [searchText, setSearchText] = useState('');

  // Datos de ejemplo
  const historialData: HistorialItem[] = [
    {
      id: '1',
      tipo: 'solicitud',
      descripcion: 'Solicitud de nuevo equipo de cómputo',
      fecha: '2024-01-15',
      estado: 'pendiente'
    },
    {
      id: '2',
      tipo: 'reparacion',
      descripcion: 'Reparación de impresora HP LaserJet',
      fecha: '2024-01-10',
      estado: 'completado'
    },
    {
      id: '3',
      tipo: 'mantenimiento',
      descripcion: 'Mantenimiento preventivo servidor',
      fecha: '2024-01-08',
      estado: 'en_proceso'
    }
  ];

  const filteredData = historialData.filter(item => {
    const matchesSearch = item.descripcion.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = activeTab === 'todos' || item.tipo === activeTab;
    return matchesSearch && matchesTab;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return '#28a745';
      case 'en_proceso': return '#007bff';
      case 'pendiente': return '#ffc107';
      case 'cancelado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'en_proceso': return 'En Proceso';
      case 'pendiente': return 'Pendiente';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'solicitud': return '📝';
      case 'reparacion': return '🔧';
      case 'mantenimiento': return '⚙️';
      default: return '📋';
    }
  };

  const renderHistorialItem = ({ item }: { item: HistorialItem }) => (
    <TouchableOpacity 
      style={styles.historialCard}
      onPress={() => Alert.alert('Detalle', item.descripcion)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.tipoContainer}>
          <Text style={styles.tipoIcon}>{getTipoIcon(item.tipo)}</Text>
          <Text style={styles.tipoText}>{item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Text style={styles.estadoText}>{getEstadoText(item.estado)}</Text>
        </View>
      </View>
      
      <Text style={styles.descripcion}>{item.descripcion}</Text>
      <Text style={styles.fecha}>📅 {item.fecha}</Text>
    </TouchableOpacity>
  );

  return (
    <Layout 
      title="Historial de Solicitudes" 
      showBackButton={!!onBack} 
      onBackPress={onBack}
    >
      {/* Navegación por tabs */}
      <TabNavigation
        tabs={[
          { id: 'todos', title: '📋 Todos' },
          { id: 'solicitud', title: '📝 Solicitudes' },
          { id: 'reparacion', title: '🔧 Reparaciones' },
          { id: 'mantenimiento', title: '⚙️ Mantenimiento' }
        ]}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en historial..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Lista de historial */}
      <FlatList
        data={filteredData}
        renderItem={renderHistorialItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>📄 Sin resultados</Text>
            <Text style={styles.emptyText}>
              {searchText ? 
                'No se encontraron elementos que coincidan con tu búsqueda.' :
                'No hay elementos en esta categoría.'
              }
            </Text>
          </View>
        )}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historialCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  tipoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  fecha: {
    fontSize: 14,
    color: '#666',
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
    lineHeight: 22,
  },
});

export default HistorialScreen;
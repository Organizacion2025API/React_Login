import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Equipo {
  id: number;
  nombre: string;
  descripcion: string;
  categoria?: { 
    id: number; 
    nombre: string; 
  };
  ubicacion?: { 
    id: number; 
    nombre: string; 
  };
}

type RootStackParamList = {
  EquipoForm: { equipoId?: number };
};

type EquipoListScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const EquipoListScreen: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([
    {
      id: 1,
      nombre: 'Computadora Dell',
      descripcion: 'Equipo de oficina para desarrollo',
      categoria: { id: 1, nombre: 'Computadoras' },
      ubicacion: { id: 1, nombre: 'Oficina Principal' }
    },
    {
      id: 2,
      nombre: 'Impresora HP',
      descripcion: 'Impresora multifuncional',
      categoria: { id: 2, nombre: 'Impresoras' },
      ubicacion: { id: 2, nombre: 'Sala de Reuniones' }
    },
    {
      id: 3,
      nombre: 'Monitor Samsung',
      descripcion: 'Monitor de 24 pulgadas',
      categoria: { id: 3, nombre: 'Monitores' },
      ubicacion: { id: 1, nombre: 'Oficina Principal' }
    }
  ]);
  const [loading] = useState<boolean>(false);
  const navigation = useNavigation<EquipoListScreenNavigationProp>();

  const handleDeleteEquipo = async (id: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar este equipo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setEquipos(equipos.filter(equipo => equipo.id !== id));
            Alert.alert('Éxito', 'Equipo eliminado correctamente');
          },
        },
      ]
    );
  };

  const renderEquipo: ListRenderItem<Equipo> = ({ item }) => (
    <View style={styles.equipoCard}>
      <View style={styles.equipoInfo}>
        <Text style={styles.equipoNombre}>{item.nombre}</Text>
        <Text style={styles.equipoDescripcion}>{item.descripcion}</Text>
        <Text style={styles.equipoCategoria}>
          Categoría: {item.categoria?.nombre || 'Sin categoría'}
        </Text>
        <Text style={styles.equipoUbicacion}>
          Ubicación: {item.ubicacion?.nombre || 'Sin ubicación'}
        </Text>
      </View>
      
      <View style={styles.equipoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EquipoForm', { equipoId: item.id })}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteEquipo(item.id)}
        >
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando equipos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Equipos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('EquipoForm', {})}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={equipos}
        renderItem={renderEquipo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  equipoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  equipoInfo: {
    marginBottom: 10,
  },
  equipoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  equipoDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  equipoCategoria: {
    fontSize: 12,
    color: '#888',
  },
  equipoUbicacion: {
    fontSize: 12,
    color: '#888',
  },
  equipoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EquipoListScreen;
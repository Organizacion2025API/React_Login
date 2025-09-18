import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface EquipoFormData {
  nombre: string;
  descripcion: string;
  categoriaId: string;
  ubicacionId: string;
}

type RootStackParamList = {
  EquipoForm: { equipoId?: number };
};

type EquipoFormScreenRouteProp = RouteProp<RootStackParamList, 'EquipoForm'>;
type EquipoFormScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const EquipoFormScreen: React.FC = () => {
  const [equipo, setEquipo] = useState<EquipoFormData>({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    ubicacionId: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigation = useNavigation<EquipoFormScreenNavigationProp>();
  const route = useRoute<EquipoFormScreenRouteProp>();
  const equipoId = route.params?.equipoId;
  const isEditing = !!equipoId;

  const handleInputChange = (field: keyof EquipoFormData, value: string) => {
    setEquipo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!equipo.nombre.trim()) {
      Alert.alert('Error', 'El nombre del equipo es requerido');
      return;
    }

    setLoading(true);
    try {
      // Simulamos guardado exitoso para demo
      setTimeout(() => {
        Alert.alert(
          'Éxito',
          `Equipo ${isEditing ? 'actualizado' : 'creado'} correctamente`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Error al guardar equipo');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {isEditing ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Equipo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el nombre del equipo"
            value={equipo.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción del equipo"
            value={equipo.descripcion}
            onChangeText={(value) => handleInputChange('descripcion', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ID de Categoría</Text>
          <TextInput
            style={styles.input}
            placeholder="ID de la categoría"
            value={equipo.categoriaId}
            onChangeText={(value) => handleInputChange('categoriaId', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ID de Ubicación</Text>
          <TextInput
            style={styles.input}
            placeholder="ID de la ubicación"
            value={equipo.ubicacionId}
            onChangeText={(value) => handleInputChange('ubicacionId', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isEditing ? 'Actualizar' : 'Crear'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#007bff',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EquipoFormScreen;
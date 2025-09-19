import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/AuthService';

interface Credentials {
  user: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    user: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const handleInputChange = (field: keyof Credentials, value: string) => {
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError('');
    }
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    if (!credentials.user || !credentials.password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    setError(''); // Limpiar error anterior
    try {
      const response = await AuthService.login({
        user: credentials.user,
        password: credentials.password,
      });

      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        // No mostramos alert de éxito, el login redirige automáticamente
      } else {
        // Mostrar error específico basado en la respuesta
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          setError('Usuario o contraseña incorrectos');
        } else if (response.error?.includes('404')) {
          setError('Usuario no encontrado');
        } else if (response.error?.includes('conexión') || response.error?.includes('network')) {
          setError('Error de conexión. Verifica tu conexión a internet');
        } else {
          setError(response.error || 'Error al iniciar sesión. Intenta nuevamente');
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
      // Manejo más específico de errores
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          setError('Error de conexión. Verifica tu conexión a internet');
        } else if (error.message.includes('401')) {
          setError('Usuario o contraseña incorrectos');
        } else {
          setError('Error inesperado. Intenta nuevamente');
        }
      } else {
        setError('Error de conexión. Intenta nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>ApexMagnament</Text>
        <Text style={styles.subtitle}>Iniciar Sesión</Text>
        
        {/* Mensaje de error */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={credentials.user}
          onChangeText={(value) => handleInputChange('user', value)}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={credentials.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default LoginScreen;
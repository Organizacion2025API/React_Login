import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import EquipoListScreen from './src/screens/EquipoListScreen';
import EquipoFormScreen from './src/screens/EquipoFormScreen';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }: any) => {
  const { logout, user } = useAuth();

  return (
    <View style={styles.homeContainer}>
      <Text style={styles.welcomeText}>¡Bienvenido {user?.name}!</Text>
      <Text style={styles.appTitle}>Gestión de Equipos</Text>
      
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('EquipoList')}
      >
        <Text style={styles.homeButtonText}>📋 Ver Equipos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('EquipoForm', {})}
      >
        <Text style={styles.homeButtonText}>➕ Crear Equipo</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.homeButton, styles.logoutButton]}
        onPress={logout}
      >
        <Text style={styles.homeButtonText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>
      
      <Text style={styles.demoText}>
        📱 Demo App - Datos simulados para prueba
      </Text>
    </View>
  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007bff',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: '🏠 Inicio' }}
            />
            <Stack.Screen 
              name="EquipoList" 
              component={EquipoListScreen}
              options={{ title: '📋 Lista de Equipos' }}
            />
            <Stack.Screen 
              name="EquipoForm" 
              component={EquipoFormScreen}
              options={{ title: '📝 Formulario de Equipo' }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#007bff',
  },
  homeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 250,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ onBack }: { onBack?: () => void }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Estados para campos editables
  const [editableData, setEditableData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+506 8888-8888',
    department: user?.department || 'Tecnología'
  });

  const handleSave = () => {
    Alert.alert(
      'Perfil Actualizado',
      'Los cambios han sido guardados exitosamente.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setEditableData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+506 8888-8888',
      department: user?.department || 'Tecnología'
    });
    setIsEditing(false);
  };

  const renderField = (label: string, value: string, key: keyof typeof editableData, editable = true) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={(text) => setEditableData({ ...editableData, [key]: text })}
          placeholder={`Ingresa tu ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  const renderSettingSwitch = (label: string, value: boolean, onValueChange: (value: boolean) => void, icon: string) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: '#007bff' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <Layout 
      title="Mi Perfil" 
      showBackButton={!!onBack} 
      onBackPress={onBack}
    >
      {/* Avatar y información básica */}
      <View style={styles.headerSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.userRole}>{user?.role || 'Empleado'}</Text>
      </View>

      {/* Información personal */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👤 Información Personal</Text>
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>💾 Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.fieldsContainer}>
          {renderField('Nombre completo', editableData.name, 'name')}
          {renderField('Correo electrónico', editableData.email, 'email')}
          {renderField('Teléfono', editableData.phone, 'phone')}
          {renderField('Departamento', editableData.department, 'department', false)}
        </View>
      </View>

      {/* Configuraciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuraciones</Text>
        
        <View style={styles.settingsContainer}>
          {renderSettingSwitch(
            'Notificaciones push',
            notificationsEnabled,
            setNotificationsEnabled,
            '🔔'
          )}
          
          {renderSettingSwitch(
            'Modo oscuro',
            darkModeEnabled,
            setDarkModeEnabled,
            '🌙'
          )}
        </View>
      </View>

      {/* Acciones adicionales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Acciones</Text>
        
        <TouchableOpacity 
          style={styles.actionRow}
          onPress={() => Alert.alert('Cambiar Contraseña', 'Esta funcionalidad estará disponible próximamente.')}
        >
          <Text style={styles.actionIcon}>🔐</Text>
          <Text style={styles.actionText}>Cambiar contraseña</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionRow}
          onPress={() => Alert.alert('Ayuda', 'Contacta al administrador del sistema para obtener ayuda.')}
        >
          <Text style={styles.actionIcon}>❓</Text>
          <Text style={styles.actionText}>Ayuda y soporte</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionRow}
          onPress={() => Alert.alert('Acerca de', 'Sistema de Gestión de Equipos v1.0')}
        >
          <Text style={styles.actionIcon}>ℹ️</Text>
          <Text style={styles.actionText}>Acerca de la aplicación</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldsContainer: {
    gap: 15,
  },
  fieldContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  fieldInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  settingsContainer: {
    gap: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  actionArrow: {
    fontSize: 20,
    color: '#ccc',
  },
});

export default ProfileScreen;
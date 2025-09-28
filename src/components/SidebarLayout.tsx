import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

interface SidebarLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showLogout?: boolean;
  scrollable?: boolean;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  title,
  children,
  showBackButton = false,
  onBackPress,
  showLogout = true,
  scrollable = true,
  currentView = 'equipos',
  onNavigate
}) => {
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH)); // Inicia oculto a la izquierda

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -SIDEBAR_WIDTH, // Se oculta hacia la izquierda
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  };

  const handleMenuPress = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
    closeSidebar();
  };

  const menuItems = [
    { id: 'equipos', title: '🎯 Mis Equipos', icon: '💻' },
    { id: 'historial', title: '📋 Historial', icon: '📄' },
  ];

  const Content = scrollable ? ScrollView : View;
  const contentProps = scrollable ? { style: styles.scrollContent } : { style: styles.content };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8db986" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>

        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.welcomeSection}>
      </View>

      {/* Contenido */}
      <Content {...contentProps}>
        {children}
      </Content>

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View style={styles.modalOverlay}>
          {/* Sidebar */}
          <Animated.View
            style={[
              styles.sidebar,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            {/* Sidebar Header */}
            <View style={styles.sidebarHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
                  <Text style={styles.userRole}>{user?.role || 'Empleado'}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>Navegación</Text>

              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    currentView === item.id && styles.activeMenuItem
                  ]}
                  onPress={() => handleMenuPress(item.id)}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.menuItemText,
                    currentView === item.id && styles.activeMenuItemText
                  ]}>
                    {item.title}
                  </Text>
                  {currentView === item.id && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.separator} />
            </ScrollView>

            {/* Logout Button */}
            {showLogout && (
              <View style={styles.sidebarFooter}>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                  <Text style={styles.logoutIcon}>🚪</Text>
                  <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Overlay táctil para cerrar */}
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={closeSidebar}
          />
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  menuButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  menuIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 0,
    marginBottom: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Sidebar Styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 }, // Sombra hacia la derecha
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  sidebarHeader: {
    backgroundColor: '#8db986',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
    position: 'relative',
  },
  activeMenuItem: {
    backgroundColor: '#f0f7ff',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  activeMenuItemText: {
    color: '#000',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -10,
    width: 3,
    height: 20,
    backgroundColor: '#8db986',
    borderRadius: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SidebarLayout;
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  ScrollView 
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showLogout?: boolean;
  scrollable?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  children,
  showBackButton = false,
  onBackPress,
  showLogout = true,
  scrollable = true
}) => {
  const { user, logout } = useAuth();

  const Content = scrollable ? ScrollView : View;
  const contentProps = scrollable ? { style: styles.scrollContent } : { style: styles.content };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8db986" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        <Text style={styles.headerTitle}>{title}</Text>
        
        {showLogout ? (
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Contenido */}
      <Content {...contentProps}>
        {children}
      </Content>
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
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 60,
    alignItems: 'center',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default Layout;
# Sistema de Layout Reutilizable

Este sistema de layout proporciona componentes reutilizables para mantener consistencia visual en toda la aplicación.

## Componentes Disponibles

### 1. Layout
Componente principal que proporciona la estructura base para todas las pantallas.

#### Props:
- `title` (string, requerido): Título que se muestra en el header
- `children` (ReactNode, requerido): Contenido de la pantalla
- `showBackButton` (boolean, opcional): Muestra botón de volver (default: false)
- `onBackPress` (función, opcional): Callback cuando se presiona volver
- `showLogout` (boolean, opcional): Muestra botón de cerrar sesión (default: true)
- `scrollable` (boolean, opcional): Hace el contenido scrolleable (default: true)

#### Ejemplo de uso:
```tsx
import Layout from '../components/Layout';

const MiPantalla = ({ onBack }: { onBack?: () => void }) => {
  return (
    <Layout 
      title="Mi Pantalla" 
      showBackButton={!!onBack} 
      onBackPress={onBack}
    >
      <Text>Contenido de mi pantalla</Text>
    </Layout>
  );
};
```

### 2. TabNavigation
Componente de navegación por pestañas que se integra perfectamente con el Layout.

#### Props:
- `tabs` (array, requerido): Array de objetos con { id, title, icon? }
- `activeTab` (string, requerido): ID de la pestaña activa
- `onTabPress` (función, requerida): Callback cuando se selecciona una pestaña

#### Ejemplo de uso:
```tsx
import TabNavigation from '../components/TabNavigation';

const [activeTab, setActiveTab] = useState('inicio');

<TabNavigation
  tabs={[
    { id: 'inicio', title: '🏠 Inicio' },
    { id: 'equipos', title: '💻 Equipos' },
    { id: 'perfil', title: '👤 Perfil' }
  ]}
  activeTab={activeTab}
  onTabPress={setActiveTab}
/>
```

## Pantallas de Ejemplo

### 1. HistorialScreen
Pantalla completa que demuestra:
- Uso del Layout con navegación hacia atrás
- TabNavigation para filtrar contenido
- Lista con FlatList
- Barra de búsqueda
- Estados vacíos

### 2. ProfileScreen
Pantalla de perfil que demuestra:
- Información del usuario
- Campos editables
- Configuraciones con switches
- Acciones adicionales

## Características del Sistema

### ✅ Ventajas:
1. **Consistencia visual**: Todos los headers, colores y estilos son uniformes
2. **Reutilizable**: Un solo componente para múltiples pantallas
3. **Flexible**: Props opcionales para personalizar comportamiento
4. **Mantenible**: Cambios en un lugar se reflejan en toda la app
5. **Responsive**: Se adapta automáticamente a diferentes tamaños

### 🎨 Elementos incluidos:
- Header con título centrado
- Botón de volver (opcional)
- Botón de cerrar sesión (opcional)
- Mensaje de bienvenida del usuario
- Contenido scrolleable o fijo
- StatusBar configurado
- Colores y estilos consistentes

### 📱 Navegación:
- TabNavigation para cambiar entre secciones
- Navegación hacia atrás integrada
- Estados activos visuales claros

## Estructura de Archivos

```
src/
  components/
    Layout.tsx          # Componente principal de layout
    TabNavigation.tsx   # Componente de navegación por tabs
  screens/
    HistorialScreen.tsx # Ejemplo de pantalla con historial
    ProfileScreen.tsx   # Ejemplo de pantalla de perfil
    LoginScreen.tsx     # Pantalla de login existente
    ...
```

## Cómo Crear una Nueva Pantalla

1. **Importar el Layout:**
```tsx
import Layout from '../components/Layout';
```

2. **Estructurar el componente:**
```tsx
const MiNuevaPantalla = ({ onBack }: { onBack?: () => void }) => {
  return (
    <Layout title="Mi Nueva Pantalla" showBackButton={!!onBack} onBackPress={onBack}>
      {/* Tu contenido aquí */}
    </Layout>
  );
};
```

3. **Agregar navegación (opcional):**
```tsx
import TabNavigation from '../components/TabNavigation';

// Dentro del Layout
<TabNavigation
  tabs={[...]}
  activeTab={activeTab}
  onTabPress={setActiveTab}
/>
```

4. **Integrar en App.tsx:**
```tsx
// Importar la pantalla
import MiNuevaPantalla from './src/screens/MiNuevaPantalla';

// Agregar al estado de vistas
const [currentView, setCurrentView] = useState<'equipos' | 'historial' | 'miNueva'>('equipos');

// Agregar en el renderizado condicional
if (currentView === 'miNueva') {
  return <MiNuevaPantalla onBack={() => setCurrentView('equipos')} />;
}
```

## Estilos Disponibles

El Layout incluye estilos pre-definidos que puedes usar en tus pantallas:
- Colores corporativos (#007bff, #f5f5f5, etc.)
- Espaciados consistentes (padding: 20, margins: 10-15)
- Elevaciones y sombras para cards
- Tipografías con tamaños estándar

## Mejores Prácticas

1. **Siempre usa Layout**: No crear pantallas sin el componente Layout
2. **Títulos descriptivos**: Usa títulos claros y con emojis apropiados
3. **Navegación coherente**: Mantén patrones de navegación consistentes
4. **Estados vacíos**: Siempre incluye mensajes para cuando no hay datos
5. **Loading states**: Maneja estados de carga apropiadamente
6. **Responsive**: Prueba en diferentes tamaños de pantalla

## Próximas Mejoras

- [ ] Soporte para temas oscuros
- [ ] Animaciones de transición
- [ ] Más variantes de navigation
- [ ] Componentes de formulario integrados
- [ ] Sistema de notificaciones
- [ ] Componentes de loading más elaborados
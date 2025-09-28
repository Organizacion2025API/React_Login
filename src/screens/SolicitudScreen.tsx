import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import SolicitudService, { SolicitudRequest } from '../services/SolicitudService';

interface SolicitudScreenProps {
    onBack: () => void;
    equipoPreseleccionado?: any; // Equipo que viene pre-seleccionado desde la lista
}

const SolicitudScreen: React.FC<SolicitudScreenProps> = ({ onBack, equipoPreseleccionado }) => {
    const { user, equiposAsignados } = useAuth();
    const [descripcion, setDescripcion] = useState<string>('');
    const [asignacionEquipoId, setAsignacionEquipoId] = useState<number | null>(
        equipoPreseleccionado?.id || null
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // Efecto para establecer el equipo pre-seleccionado
    useEffect(() => {
        if (equipoPreseleccionado) {
            setAsignacionEquipoId(equipoPreseleccionado.id);
        }
    }, [equipoPreseleccionado]);

    // Limpiar mensajes cuando el usuario interactúa
    const limpiarMensajes = () => {
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleDescripcionChange = (text: string) => {
        setDescripcion(text);
        limpiarMensajes();
    };

    const validarFormulario = (): boolean => {
        if (!descripcion.trim()) {
            setError('La descripción es requerida');
            return false;
        }

        if (descripcion.trim().length < 10) {
            setError('La descripción debe tener al menos 10 caracteres');
            return false;
        }

        return true;
    };

    const handleEnviarSolicitud = async () => {
        if (!validarFormulario()) {
             return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const solicitud: SolicitudRequest = {
                descripcion: descripcion.trim(),
                asignacionEquipoId: asignacionEquipoId!
            };

            const response = await SolicitudService.crearSolicitud(solicitud);

            if (response.success) {
                setSuccess('Solicitud enviada exitosamente');
                // Limpiar formulario
                setDescripcion('');
                setAsignacionEquipoId(null);

                // Mostrar confirmación y volver después de un tiempo
                setTimeout(() => {
                    Alert.alert(
                        'Solicitud Enviada',
                        'Tu solicitud ha sido enviada exitosamente y será procesada pronto.',
                        [
                            {
                                text: 'Ver Mis Equipos',
                                onPress: onBack
                            },
                            {
                                text: 'Nueva Solicitud',
                                style: 'cancel',
                                onPress: () => setSuccess('')
                            }
                        ]
                    );
                }, 1000);
            } else {
                setError(response.error || 'Error al enviar la solicitud');
            }
        } catch (error) {
            console.error('Error enviando solicitud:', error);
            setError('Error inesperado. Intenta nuevamente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Nueva Solicitud</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <View style={styles.userInfo}>
                    <Text style={styles.userInfoTitle}>Solicitud de:</Text>
                    <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
                    <Text style={styles.userRole}>{user?.role || 'Empleado'}</Text>
                </View>

                {/* Información del equipo pre-seleccionado */}
                {equipoPreseleccionado && (
                    <View style={styles.equipoSeleccionadoInfo}>
                        <Text style={styles.equipoSeleccionadoTitle}>📋 Equipo Seleccionado:</Text>
                        <Text style={styles.equipoNombre}>{equipoPreseleccionado.equipoNombre}</Text>
                        {equipoPreseleccionado.equipoDescripcion && (
                            <Text style={styles.equipoDescripcion}>{equipoPreseleccionado.equipoDescripcion}</Text>
                        )}
                        <View style={styles.equipoDetalles}>
                            <Text style={styles.equipoDetalle}>Modelo: {equipoPreseleccionado.equipoModelo || 'N/A'}</Text>
                            <Text style={styles.equipoDetalle}>Serie: {equipoPreseleccionado.equipoNserie || 'N/A'}</Text>
                        </View>
                    </View>
                )}

                {/* Mensajes de error y éxito */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {success ? (
                    <View style={styles.successContainer}>
                        <Text style={styles.successIcon}>✅</Text>
                        <Text style={styles.successText}>{success}</Text>
                    </View>
                ) : null}

                {/* Descripción del Problema */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Descripción del Problema *</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Describe detalladamente el problema o solicitud..."
                        value={descripcion}
                        onChangeText={handleDescripcionChange}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>
                        {descripcion.length}/500 caracteres
                    </Text>
                </View>

                {/* Información adicional */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>📋 Información</Text>
                    <Text style={styles.infoText}>
                        • Describe el problema con el mayor detalle posible
                    </Text>
                    <Text style={styles.infoText}>
                        • Incluye síntomas, errores o comportamientos anómalos
                    </Text>
                    <Text style={styles.infoText}>
                        • Tu solicitud será revisada por el equipo técnico
                    </Text>
                </View>

                {/* Botón de envío */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        loading && styles.submitButtonDisabled,
                        (!descripcion.trim() || !asignacionEquipoId) && styles.submitButtonDisabled
                    ]}
                    onPress={handleEnviarSolicitud}
                    disabled={loading || !descripcion.trim() || !asignacionEquipoId}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>📤 Enviar Solicitud</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
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
    backButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        minWidth: 80,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 80,
    },
    content: {
        padding: 20,
    },
    userInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    userInfoTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    userRole: {
        fontSize: 14,
        color: '#8db986',
        marginTop: 2,
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
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    successIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    successText: {
        color: '#2e7d32',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 1,
    },
    picker: {
        height: 50,
    },
    textArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 120,
        elevation: 1,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1976d2',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#1565c0',
        marginBottom: 4,
    },
    submitButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
    },
    submitButtonDisabled: {
        backgroundColor: '#6c757d',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    equipoSeleccionadoInfo: {
        backgroundColor: '#e8f5e8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    equipoSeleccionadoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 8,
    },
    equipoNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1b5e20',
        marginBottom: 4,
    },
    equipoDescripcion: {
        fontSize: 14,
        color: '#388e3c',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    equipoDetalles: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    equipoDetalle: {
        fontSize: 13,
        color: '#2e7d32',
        flex: 1,
    },
});

export default SolicitudScreen;